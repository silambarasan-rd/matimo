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
import { createAgent } from 'langchain';
import { MatimoInstance, convertToolsToLangChain } from 'matimo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run LangChain-style agent with Matimo tools
 */
async function runLangChainAgent() {
  console.info('\n╔════════════════════════════════════════════════════════╗');
  console.info('║   Matimo + LangChain Agent (Official API)               ║');
  console.info('║   Using createAgent() with convertToolsToLangChain      ║');
  console.info('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize Matimo
    console.info('🚀 Initializing Matimo...');
    const toolsPath = path.resolve(__dirname, '../../../tools');
    const matimo = await MatimoInstance.init(toolsPath);

    const matimoTools = matimo.listTools();
    console.info(`📦 Loaded ${matimoTools.length} tools:\n`);
    matimoTools.forEach((t) => {
      console.info(`  • ${t.name}`);
      console.info(`    ${t.description}\n`);
    });

    // ✅ Convert Matimo tools to LangChain tools using the new integration
    console.info('🔧 Converting Matimo tools to LangChain tools...\n');
    const langchainTools = await convertToolsToLangChain(matimoTools, matimo);

    // Create agent using official LangChain API
    console.info('🤖 Creating LangChain agent with createAgent()...\n');
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

    console.info('🧪 Testing LangChain Agent with Tool Calling\n');
    console.info('═'.repeat(60));

    for (const userPrompt of prompts) {
      console.info(`\n❓ User: "${userPrompt}"\n`);

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
            console.info(`✅ Agent Response:\n${lastMessage.content}`);
          } else {
            console.info(`✅ Agent Response:`, lastMessage.content);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error: ${errorMsg}`);
      }

      console.info('\n' + '─'.repeat(60));
    }

    console.info('\n✅ LangChain agent test complete!\n');
  } catch (error) {
    console.error('❌ Agent failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the agent
runLangChainAgent().catch(console.error);
