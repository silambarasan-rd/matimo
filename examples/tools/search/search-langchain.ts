#!/usr/bin/env node
/**
 * ============================================================================
 * SEARCH TOOL - LANGCHAIN AI AGENT EXAMPLE
 * ============================================================================
 *
 * PATTERN: True AI Agent with OpenAI + LangChain
 * ─────────────────────────────────────────────────────────────────────────
 * This is a REAL AI agent that:
 * 1. Takes natural language user requests
 * 2. Uses OpenAI LLM (GPT-4o-mini) to decide when to search files
 * 3. Generates appropriate search queries and patterns based on context
 * 4. Executes tools autonomously
 * 5. Processes results and responds naturally
 *
 * SETUP:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Create .env file in examples/tools/:
 *    OPENAI_API_KEY=sk-xxxxxxxxxxxxx
 *
 * 2. Install dependencies:
 *    cd examples/tools && npm install
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   # From root directory:
 *   pnpm search:langchain
 *
 *   # Or from examples/tools directory:
 *   npm run search:langchain
 *
 * ============================================================================
 */

import 'dotenv/config';
import readline from 'readline';
import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import {
  MatimoInstance,
  convertToolsToLangChain,
  type ToolDefinition,
  getPathApprovalManager,
} from '@matimo/core';

// Create readline interface for interactive approval prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let isReadlineClosed = false;

// Track when readline closes (e.g., piped input ends)
rl.on('close', () => {
  isReadlineClosed = true;
});

/**
 * Prompt user for approval decision
 */
async function promptForApproval(
  filePath: string,
  mode: 'read' | 'write' | 'search'
): Promise<boolean> {
  return new Promise((resolve) => {
    // If readline is closed (e.g., non-TTY/piped input), auto-approve
    if (isReadlineClosed) {
      console.info(
        `[${mode.toUpperCase()}] Access to ${filePath} auto-approved (non-interactive mode)`
      );
      resolve(true);
      return;
    }
    rl.question(`[${mode.toUpperCase()}] Approve access to ${filePath}? (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Run AI Agent with Search tool
 * The agent receives natural language requests and decides what to search for
 */
async function runSearchAIAgent() {
  console.info('\n╔════════════════════════════════════════════════════════╗');
  console.info('║     Search Tool AI Agent - LangChain + OpenAI          ║');
  console.info('║     True autonomous agent with LLM reasoning           ║');
  console.info('╚════════════════════════════════════════════════════════╝\n');

  // Check required environment variables
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY not set in .env');
    console.info('   Set it: export OPENAI_API_KEY="sk-..."');
    process.exit(1);
  }

  console.info('🤖 Using OpenAI (GPT-4o-mini) as the AI agent\n');

  try {
    // Initialize Matimo with auto-discovery
    console.info('🚀 Initializing Matimo...');
    const matimo = await MatimoInstance.init({ autoDiscover: true });

    // Set up approval callback for interactive approval
    const approvalManager = getPathApprovalManager();
    approvalManager.setApprovalCallback(promptForApproval);

    // Get search tool
    console.info('💬 Loading search tool...');
    const matimoTools = matimo.listTools();
    const searchTools = matimoTools.filter((t) => t.name === 'search') as ToolDefinition[];
    console.info(`✅ Loaded ${searchTools.length} search tool(s)\n`);

    if (searchTools.length === 0) {
      console.error('❌ Search tool not found');
      process.exit(1);
    }

    // Convert to LangChain tools using the built-in converter
    const langchainTools = await convertToolsToLangChain(searchTools, matimo);

    // Initialize OpenAI LLM
    console.info('🤖 Initializing OpenAI (GPT-4o-mini) LLM...');
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    });

    // Create agent
    console.info('🔧 Creating agent...\n');
    const agent = await createAgent({
      model,
      tools: langchainTools as any,
    });

    // Define agent tasks (natural language requests)
    const userRequests = [
      {
        title: 'Example 1: Search for TypeScript files',
        request: 'Find all TypeScript files in the current workspace',
      },
      {
        title: 'Example 2: Search for specific imports',
        request: 'Search for files that import MatimoInstance from the core package',
      },
      {
        title: 'Example 3: Find JSON configuration',
        request: 'Look for JSON files in the project root',
      },
    ];

    console.info('🧪 Running AI Agent Tasks');
    console.info('═'.repeat(60) + '\n');

    // Run each task through the agent
    for (const task of userRequests) {
      console.info(`${task.title}`);
      console.info('─'.repeat(60));
      console.info(`👤 User: "${task.request}"\n`);

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
          const content =
            typeof lastMessage.content === 'string'
              ? lastMessage.content
              : String(lastMessage.content);

          if (content && content.trim()) {
            console.info(`🤖 Agent: ${content}\n`);
          } else {
            console.info('🤖 Agent: (Search completed successfully)\n');
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.info(`⚠️  Agent error: ${errorMsg}\n`);
      }
    }

    console.info('═'.repeat(60));
    console.info('\n✨ AI Agent Examples Complete!\n');
    console.info('Key Features:');
    console.info('  ✅ Real LLM (OpenAI) decides which tools to use');
    console.info('  ✅ Natural language requests, not API calls');
    console.info('  ✅ LLM generates search patterns based on context');
    console.info('  ✅ Agentic reasoning and decision-making\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    if (!isReadlineClosed) {
      rl.close();
      isReadlineClosed = true;
    }
  }
}

// Run the AI agent
runSearchAIAgent().catch(console.error);
