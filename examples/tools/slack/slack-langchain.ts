#!/usr/bin/env node
/**
 * ============================================================================
 * SLACK TOOLS - LANGCHAIN AI AGENT EXAMPLE
 * ============================================================================
 *
 * PATTERN: True AI Agent with OpenAI + LangChain
 * ─────────────────────────────────────────────────────────────────────────
 * This is a REAL AI agent that:
 * 1. Takes natural language user requests
 * 2. Uses OpenAI LLM (GPT-4o-mini) to decide which Slack tools to use
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
 *    SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx
 *    OPENAI_API_KEY=sk-xxxxxxxxxxxxx
 *
 * 2. Install dependencies:
 *    npm install
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   export SLACK_BOT_TOKEN=xoxb-xxxx
 *   export OPENAI_API_KEY=sk-xxxx
 *   npm run slack:langchain
 *
 * WHAT IT DOES:
 * ─────────────────────────────────────────────────────────────────────────
 * This example shows an AI agent that can:
 * 1. List Slack channels
 * 2. Send messages to channels
 * 3. Search message history
 * 4. Retrieve channel information
 * 5. Respond naturally in conversation style
 *
 * Example conversation:
 *   User: "Send a test message to #general"
 *   Claude: "I'll send a test message to the general channel..."
 *   [Claude calls slack-send-message tool]
 *   Claude: "Done! Message sent successfully."
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
 * Convert a Matimo Slack tool to a LangChain tool
 * Used by the AI agent to call Matimo tools
 */
function convertMatimoToolToLangChain(
  matimo: MatimoInstance,
  toolName: string,
  botToken: string
) {
  const matimoTool = matimo.getTool(toolName);
  if (!matimoTool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  // Build Zod schema from Matimo parameters
  const schemaShape: any = {};

  if (matimoTool.parameters) {
    Object.entries(matimoTool.parameters).forEach(([paramName, param]) => {
      // Skip SLACK_BOT_TOKEN - we'll add it automatically
      if (paramName === 'SLACK_BOT_TOKEN') return;

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
        // Add bot token to parameters
        const params = {
          ...input,
          SLACK_BOT_TOKEN: botToken,
        };

        const result = await matimo.execute(toolName, params);

        // Format result nicely for the LLM
        if (result && typeof result === 'object') {
          // For list-channels, format nicely
          if ('channels' in result && Array.isArray(result.channels)) {
            const channels = result.channels as any[];
            return `Found ${channels.length} channels. First few: ${JSON.stringify(channels.slice(0, 3))}`;
          }
          // For send message, just confirm success
          if ('ok' in result && result.ok === true) {
            return 'Message sent successfully!';
          }
          // For errors
          if ('error' in result) {
            return `Slack API error: ${result.error}`;
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
      description: matimoTool.description || `Slack tool: ${matimoTool.name}`,
      schema: zodSchema,
    }
  );
}

/**
 * Run AI Agent with Slack tools
 * The agent receives natural language requests and decides which Slack tools to use
 */
async function runSlackAIAgent() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let channelId = process.env.TEST_CHANNEL || 'C0000000000';

  for (const arg of args) {
    if (arg.startsWith('--channel:')) {
      channelId = arg.split(':')[1];
    } else if (arg.startsWith('--channel=')) {
      channelId = arg.split('=')[1];
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Slack AI Agent - LangChain + OpenAI               ║');
  console.log('║     True autonomous agent with LLM reasoning          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check required environment variables
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    console.error('❌ Error: SLACK_BOT_TOKEN not set in .env');
    console.log('   Set it: export SLACK_BOT_TOKEN="xoxb-..."');
    console.log('   Get one from: https://api.slack.com/apps');
    process.exit(1);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY not set in .env');
    console.log('   Set it: export OPENAI_API_KEY="sk-..."');
    process.exit(1);
  }

  console.log(`🤖 Slack Bot Token: ${botToken.slice(0, 10)}...`);
  console.log(`🔑 OpenAI Key: ${openaiKey.slice(0, 10)}...`);
  console.log(`📍 Target Channel: ${channelId}`);
  console.log(`🤖 Using OpenAI (GPT-4o-mini) as the AI agent\n`);

  try {
    // Initialize Matimo
    console.log('🚀 Initializing Matimo...');
    const toolsPath = path.resolve(__dirname, '../../../tools');
    const matimo = await MatimoInstance.init(toolsPath);

    // Get Slack tools and convert to LangChain format
    console.log('💬 Loading Slack tools...');
    const matimoTools = matimo.listTools();
    const slackTools = matimoTools.filter((t) => t.name.startsWith('slack'));
    console.log(`✅ Loaded ${slackTools.length} Slack tools\n`);

    // Find an available channel before creating agent
    console.log('📋 Finding an available channel...');
    const listChannelsResult = await matimo.execute('slack-list-channels', {
      types: 'public_channel,private_channel',
      limit: 10,
    });
    
    const listData = (listChannelsResult as any).data || listChannelsResult;
    let activeChannel = channelId;
    
    if (listData.ok === true && listData.channels && listData.channels.length > 0) {
      const defaultChannelExists = listData.channels.some((ch: any) => ch.id === channelId);
      if (!defaultChannelExists) {
        activeChannel = listData.channels[0].id;
        console.log(`   Using first available channel: #${listData.channels[0].name} (${activeChannel})\n`);
      } else {
        console.log(`   Using specified channel: #${listData.channels.find((ch: any) => ch.id === channelId)?.name} (${channelId})\n`);
      }
    } else {
      console.log(`   ⚠️  Could not list channels, using default: ${channelId}\n`);
    }

    // Convert to LangChain tools (select key ones for agent)
    const keySlackTools = slackTools.filter((t) =>
      [
        'slack-send-message',
        'slack-list-channels',
        'slack_get_channel_history',
        'slack_search_messages',
        'slack_get_user_info',
      ].includes(t.name)
    );

    const langchainTools = keySlackTools.map((toolDef) =>
      convertMatimoToolToLangChain(matimo, toolDef.name, botToken)
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
        title: 'Example 1: List channels',
        request: 'What Slack channels are available in this workspace?',
      },
      {
        title: 'Example 2: Send a message',
        request: `Send a test message to channel ${activeChannel} saying "Hello from AI Agent! This message was sent autonomously."`,
      },
      {
        title: 'Example 3: Get channel history',
        request: `What are the recent messages in channel ${activeChannel}?`,
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
runSlackAIAgent().catch(console.error);
