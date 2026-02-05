#!/usr/bin/env node
/**
 * ============================================================================
 * GMAIL TOOLS - LANGCHAIN AI AGENT EXAMPLE
 * ============================================================================
 *
 * PATTERN: True AI Agent with OpenAI + LangChain
 * ─────────────────────────────────────────────────────────────────────────
 * This is a REAL AI agent that:
 * 1. Takes natural language user requests
 * 2. Uses OpenAI LLM (GPT-4o-mini) to decide which Gmail tools to use
 * 3. Generates appropriate parameters based on context
 * 4. Executes tools autonomously
 * 5. Processes results and responds naturally
 *
 * Use this pattern when:
 * ✅ Building true autonomous AI agents
 * ✅ LLM should decide which tools to use
 * ✅ Complex workflows with LLM reasoning
 * ✅ Multi-step agentic processes
 * ✅ User gives high-level instructions (not low-level API calls)
 *
 * SETUP:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Create .env file:
 *    GMAIL_ACCESS_TOKEN=ya29.xxxxxxxxxxxxx
 *    OPENAI_API_KEY=sk-xxxxxxxxxxxxx
 *
 * 2. Install dependencies:
 *    npm install
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   export GMAIL_ACCESS_TOKEN=your_token_here
 *   export OPENAI_API_KEY=your_openai_key_here
 *   npm run gmail:langchain
 *
 * WHAT IT DOES:
 * ─────────────────────────────────────────────────────────────────────────
 * This example shows an AI agent that can:
 * 1. Check your recent emails
 * 2. Send emails to you based on LLM reasoning
 * 3. Create draft emails with AI-generated content
 * 4. Respond naturally in conversation style
 *
 * Example conversation:
 *   User: "Send me a test email"
 *   Claude: "I'll send you a test email now..."
 *   [Claude calls gmail-send-email tool]
 *   Claude: "Done! Email sent to your address."
 *
 * ============================================================================
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { tool, createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { MatimoInstance } from 'matimo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Convert a Matimo Gmail tool to a LangChain tool
 * Used by the AI agent to call Matimo tools
 */
function convertMatimoToolToLangChain(
  matimo: MatimoInstance,
  toolName: string,
  accessToken: string,
  userEmail: string
) {
  const matimoTool = matimo.getTool(toolName);
  if (!matimoTool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  // Build Zod schema from Matimo parameters
  const schemaShape: any = {};

  if (matimoTool.parameters) {
    Object.entries(matimoTool.parameters).forEach(([paramName, param]) => {
      // Skip GMAIL_ACCESS_TOKEN - we'll add it automatically
      if (paramName === 'GMAIL_ACCESS_TOKEN') return;

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
        // Add access token to parameters
        const params = {
          ...input,
          GMAIL_ACCESS_TOKEN: accessToken,
        };

        const result = await matimo.execute(toolName, params);

        // Format result nicely for the LLM
        if (result && typeof result === 'object') {
          // For list-messages, format nicely
          if ('messages' in result && Array.isArray(result.messages)) {
            const messages = result.messages as any[];
            return `Found ${messages.length} messages. First few: ${JSON.stringify(messages.slice(0, 2))}`;
          }
          // For send/create, just confirm success
          if ('id' in result) {
            return `Success! Created/sent with ID: ${result.id}`;
          }
        }

        return JSON.stringify(result, null, 2);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Tool execution failed: ${errorMsg}`);
      }
    },
    {
      name: matimoTool.name,
      description: matimoTool.description || `Gmail tool: ${matimoTool.name}`,
      schema: zodSchema,
    }
  );
}

/**
 * Run AI Agent with Gmail tools
 * The agent receives natural language requests and decides which Gmail tools to use
 */
async function runGmailAIAgent() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let userEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  for (const arg of args) {
    if (arg.startsWith('--email:')) {
      userEmail = arg.split(':')[1];
    } else if (arg.startsWith('--email=')) {
      userEmail = arg.split('=')[1];
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Gmail AI Agent - LangChain + OpenAI               ║');
  console.log('║     True autonomous agent with LLM reasoning          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check required environment variables
  const accessToken = process.env.GMAIL_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('❌ Error: GMAIL_ACCESS_TOKEN not set in .env');
    console.log('   Set it: export GMAIL_ACCESS_TOKEN="ya29...."');
    process.exit(1);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY not set in .env');
    console.log('   Set it: export OPENAI_API_KEY="sk-..."');
    process.exit(1);
  }

  console.log(`📧 User Email: ${userEmail}`);
  console.log(`🤖 Using OpenAI (GPT-4o-mini) as the AI agent\n`);

  try {
    // Initialize Matimo
    console.log('🚀 Initializing Matimo...');
    const toolsPath = path.resolve(__dirname, '../../../tools');
    const matimo = await MatimoInstance.init(toolsPath);

    // Get Gmail tools and convert to LangChain format
    console.log('📬 Loading Gmail tools...');
    const matimoTools = matimo.listTools();
    const gmailTools = matimoTools.filter((t) => t.name.startsWith('gmail-'));
    console.log(`✅ Loaded ${gmailTools.length} Gmail tools\n`);

    // Convert to LangChain tools
    const langchainTools = gmailTools.map((toolDef) =>
      convertMatimoToolToLangChain(matimo, toolDef.name, accessToken, userEmail)
    );

    // Initialize OpenAI LLM
    console.log('🤖 Initializing OpenAI (GPT-4o-mini) LLM...');
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    });

    // Create agent
    console.log('🔧 Creating agent...\n');
    const agent = await createAgent({
      model,
      tools: langchainTools,
    });

    // Define agent tasks (natural language requests)
    const userRequests = [
      {
        title: 'Example 1: Check recent emails',
        request: 'How many recent emails do I have? List the first 3.',
      },
      {
        title: 'Example 2: Send a test email',
        request: `Please send a test email to ${userEmail} with subject "Hello from AI Agent" and body "This email was sent by an AI agent using Matimo tools."`,
      },
      {
        title: 'Example 3: Create an automated draft',
        request: `Create a draft email to ${userEmail} about "Weekly Summary" with a professional greeting and a summary of what this example demonstrated.`,
      },
    ];

    console.log('🧪 Running AI Agent Tasks');
    console.log('═'.repeat(60));

    // Run each task through the agent
    for (const task of userRequests) {
      console.log(`\n${task.title}`);
      console.log('─'.repeat(60));
      console.log(`👤 User: "${task.request}"\n`);

      try {
        const response = await agent.invoke({
          messages: [
            {
              role: 'user',
              content: task.request,
            },
          ],
        });

        // Get the last message from the agent
        const lastMessage = response.messages[response.messages.length - 1];
        if (lastMessage) {
          if (typeof lastMessage.content === 'string') {
            console.log(`🤖 Agent: ${lastMessage.content}\n`);
          } else {
            console.log(`🤖 Agent:`, lastMessage.content, '\n');
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`⚠️  Agent error: ${errorMsg}\n`);
      }
    }

    console.log('═'.repeat(60));
    console.log('✨ AI Agent Examples Complete!\n');
    console.log('Key Features:');
    console.log('  ✅ Real LLM (OpenAI) decides which tools to use');
    console.log('  ✅ Natural language requests, not API calls');
    console.log('  ✅ LLM generates tool parameters based on context');
    console.log('  ✅ Agentic reasoning and decision-making\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the AI agent
runGmailAIAgent().catch(console.error);
