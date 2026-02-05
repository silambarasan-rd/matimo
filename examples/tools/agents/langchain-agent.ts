#!/usr/bin/env node
/**
 * Matimo + LangChain Agent - Using Native LangChain Tool Integration
 *
 * This agent converts Matimo tools to LangChain StructuredTools and uses
 * LangChain's tool calling capability for automatic tool selection.
 *
 * Key advantages:
 * - No manual schema extraction/duplication
 * - LangChain handles tool schema generation and validation
 * - Clean conversion from Matimo → LangChain tools
 * - Single source of truth (Matimo YAML definitions)
 *
 * Run: npm run agent:langchain
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { MatimoInstance } from 'matimo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Convert a Matimo tool to a LangChain tool using the tool() function
 */
function convertMatimoToolToLangChain(
  matimo: MatimoInstance,
  toolName: string
) {
  const matimoTool = matimo.getTool(toolName);
  if (!matimoTool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  // Build Zod schema from Matimo parameters
  const schemaShape: any = {};

  if (matimoTool.parameters) {
    Object.entries(matimoTool.parameters).forEach(([paramName, param]) => {
      let fieldSchema: any;

      // Map Matimo types to Zod types
      const paramType = param.type as string;
      switch (paramType) {
        case 'string':
          fieldSchema = z.string();
          break;
        case 'number':
          fieldSchema = z.number();
          break;
        case 'integer':
          fieldSchema = z.number().int();
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'array':
          fieldSchema = z.array(z.unknown());
          break;
        default:
          fieldSchema = z.unknown();
      }

      // Add description if available
      if (param.description) {
        fieldSchema = fieldSchema.describe(param.description);
      }

      // Make required/optional based on schema
      if (!param.required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaShape[paramName] = fieldSchema;
    });
  }

  const zodSchema = z.object(schemaShape);

  // Create LangChain tool using the tool() function
  return tool(
    async (input: Record<string, unknown>) => {
      try {
        console.log(`\n  🔌 [MATIMO] Executing tool via Matimo SDK: ${toolName}`);
        console.log(`  📥 [MATIMO] Input parameters: ${JSON.stringify(input)}`);
        
        const result = await matimo.execute(toolName, input);
        
        console.log(`  ✅ [MATIMO] Execution successful`);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ [MATIMO] Execution failed: ${errorMsg}`);
        return JSON.stringify({ error: errorMsg, success: false }, null, 2);
      }
    },
    {
      name: matimoTool.name,
      description: matimoTool.description,
      schema: zodSchema,
    }
  );
}

/**
 * Run LangChain-style agent with Matimo tools
 */
async function runLangChainAgent() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Matimo + LangChain Agent (Official API)               ║');
  console.log('║   Using createAgent() with tool() function              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize Matimo
    console.log('🚀 Initializing Matimo...');
    const toolsPath = path.resolve(__dirname, '../../../tools');
    const matimo = await MatimoInstance.init(toolsPath);

    const matimoTools = matimo.listTools();
    console.log(`📦 Loaded ${matimoTools.length} tools:\n`);
    matimoTools.forEach((t) => {
      console.log(`  • ${t.name}`);
      console.log(`    ${t.description}\n`);
    });

    // Convert Matimo tools to LangChain tools
    console.log('🔧 Converting Matimo tools to LangChain tools...\n');
    const langchainTools = matimoTools.map((tool) =>
      convertMatimoToolToLangChain(matimo, tool.name)
    );

    // Create agent using official LangChain API
    console.log('🤖 Creating LangChain agent with createAgent()...\n');
    const agent = await createAgent({
      model: 'gpt-4o-mini',
      tools: langchainTools,
    });

    // Test prompts
    const prompts = [
      '🧮 What is 42 plus 8?',
      '🔊 Echo the message: "LangChain integration works perfectly!"',
      '🌐 Fetch the GitHub user profile for octocat',
    ];

    console.log('🧪 Testing LangChain Agent with Tool Calling\n');
    console.log('═'.repeat(60));

    for (const userPrompt of prompts) {
      console.log(`\n❓ User: "${userPrompt}"\n`);

      try {
        // Invoke the agent with the user message
        const result = await agent.invoke({
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });

        // Display the agent's final response
        const lastMessage = result.messages[result.messages.length - 1];
        if (lastMessage) {
          if (typeof lastMessage.content === 'string') {
            console.log(`✅ Agent Response:\n${lastMessage.content}`);
          } else {
            console.log(`✅ Agent Response:`, lastMessage.content);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error: ${errorMsg}`);
      }

      console.log('\n' + '─'.repeat(60));
    }

    console.log('\n✅ LangChain agent test complete!\n');
  } catch (error) {
    console.error('❌ Agent failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the agent
runLangChainAgent().catch(console.error);
