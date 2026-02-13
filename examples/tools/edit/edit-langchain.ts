#!/usr/bin/env node
/**
 * ============================================================================
 * EDIT TOOL - LANGCHAIN AI AGENT EXAMPLE
 * ============================================================================
 *
 * PATTERN: True AI Agent with OpenAI + LangChain
 * ─────────────────────────────────────────────────────────────────────────
 * This is a REAL AI agent that:
 * 1. Takes natural language user requests
 * 2. Uses OpenAI LLM (GPT-4o-mini) to decide which edit operations to use
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
 *    OPENAI_API_KEY=sk-xxxxxxxxxxxxx
 *
 * 2. Install dependencies:
 *    npm install
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   export OPENAI_API_KEY=sk-xxxx
 *   npm run edit:langchain
 *
 * WHAT IT DOES:
 * ─────────────────────────────────────────────────────────────────────────
 * This example shows an AI agent that can:
 * 1. Replace text in files
 * 2. Insert new content
 * 3. Delete lines
 * 4. Append to files
 * 5. Respond naturally in conversation style
 *
 * Example conversation:
 *   User: "Update the TODO list - mark first item as DONE and add error handling"
 *   AI Agent: "I'll help you update the TODO list..."
 *   [AI Agent calls edit tool multiple times]
 *   AI Agent: "Done! I've updated the file with your changes."
 *
 * ============================================================================
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { MatimoInstance, convertToolsToLangChain, type ToolDefinition } from '@matimo/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run AI Agent with Edit tools
 * The agent receives natural language requests and decides which edit operations to use
 */
async function runEditAIAgent() {
  console.info('\n╔════════════════════════════════════════════════════════╗');
  console.info('║     Edit Tool AI Agent - LangChain + OpenAI            ║');
  console.info('║     True autonomous agent with LLM reasoning           ║');
  console.info('╚════════════════════════════════════════════════════════╝\n');

  // Check required environment variables
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY not set in .env');
    console.info('   Set it: export OPENAI_API_KEY="sk-..."');
    console.info('   Get one from: https://platform.openai.com/api-keys');
    process.exit(1);
  }

  console.info('🤖 Using OpenAI (GPT-4o-mini) as the AI agent\n');

  // Create a temp file for the agent to work with
  const tempFile = path.join(__dirname, 'temp-agent-edit-demo.txt');
  fs.writeFileSync(
    tempFile,
    `Project TODO List
================
- TODO: Implement authentication module
- TODO: Add database migrations
- TODO: Write API documentation
- TODO: Set up CI/CD pipeline
`
  );

  try {
    // Initialize Matimo with auto-discovery
    console.info('🚀 Initializing Matimo...');
    const matimo = await MatimoInstance.init({ autoDiscover: true });

    // Get edit tool
    console.info('💬 Loading edit tool...');
    const matimoTools = matimo.listTools();
    const editTools = matimoTools.filter((t) => t.name === 'edit') as ToolDefinition[];
    console.info(`✅ Loaded ${editTools.length} edit tool(s)\n`);

    if (editTools.length === 0) {
      console.error('❌ Edit tool not found');
      process.exit(1);
    }

    // Convert to LangChain tools using the built-in converter
    const langchainTools = await convertToolsToLangChain(editTools, matimo);

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
        title: 'Example 1: Replace TODO with DONE',
        request: `Mark the first authentication TODO as DONE in file ${tempFile}. Then describe what you did.`,
      },
      {
        title: 'Example 2: Insert new item',
        request: `Add a new TODO "Set up error logging" after line 5 in file ${tempFile}. Confirm the action and tell me how many lines were affected.`,
      },
      {
        title: 'Example 3: List file content',
        request: `Show me the current content of file ${tempFile} (use read tool if available, or describe the final state after your edits)`,
      },
    ];

    console.info('🧪 Running AI Agent Tasks');
    console.info('═'.repeat(60));
    console.info(`📁 Working with: ${tempFile}\n`);

    // Show initial file content
    console.info('📄 Initial file content:');
    console.info('─'.repeat(60));
    console.info(fs.readFileSync(tempFile, 'utf-8'));
    console.info('─'.repeat(60) + '\n');

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

          console.info(`🤖 Agent: ${content || '(Tool executed successfully)'}\n`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.info(`⚠️  Agent error: ${errorMsg}\n`);
      }
    }

    console.info('═'.repeat(60));
    console.info('\n📄 Final file content:');
    console.info('─'.repeat(60));
    console.info(fs.readFileSync(tempFile, 'utf-8'));
    console.info('─'.repeat(60));

    console.info('\n✨ AI Agent Examples Complete!\n');
    console.info('Key Features:');
    console.info('  ✅ Real LLM (OpenAI) decides which tools to use');
    console.info('  ✅ Natural language requests, not API calls');
    console.info('  ✅ LLM generates tool parameters based on context');
    console.info('  ✅ Agentic reasoning and decision-making\n');
    console.info('⚠️  Note on agent responses:');
    console.info('  The agent DOES call the real LLM to decide which tool to use.');
    console.info('  However, LangChain agents generate minimal responses when tools succeed.');
    console.info('  The agent autonomously executes tools without verbose narration.\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    // Clean up
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// Run the AI agent
runEditAIAgent().catch(console.error);
