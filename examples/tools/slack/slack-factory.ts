#!/usr/bin/env node
/**
 * ============================================================================
 * SLACK TOOLS - FACTORY PATTERN EXAMPLE
 * ============================================================================
 *
 * PATTERN: SDK Factory Pattern
 * ─────────────────────────────────────────────────────────────────────────
 * Direct tool execution via MatimoInstance - the simplest way to use tools.
 *
 * Use this pattern when:
 * ✅ Building simple scripts or CLI tools
 * ✅ Direct API calls without abstraction
 * ✅ Quick prototyping
 * ✅ One-off tool execution
 *
 * SETUP:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Create .env file in project root:
 *    SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxx
 *
 * 2. Get a Slack bot token:
 *    - Go to: https://api.slack.com/apps
 *    - Create a new app or select existing
 *    - OAuth & Permissions → Install app to workspace
 *    - Copy "Bot User OAuth Token"
 *    - Required scopes: chat:write, channels:read, conversations:history
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   export SLACK_BOT_TOKEN=xoxb-xxxx
 *   npm run slack:factory -- --channel:C123456
 *
 * AVAILABLE TOOLS:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. slack-send-message
 *    Parameters: channel (required), text (required), [blocks]
 *    Returns: Message timestamp and channel ID
 *    Example: Send a message to #general channel
 *
 * 2. slack-list-channels
 *    Parameters: [types], [limit], [cursor]
 *    Returns: List of channels, DMs, and groups
 *    Types: public_channel, private_channel, mpim, im
 *
 * 3. slack_create_channel
 *    Parameters: name (required), [is_private]
 *    Returns: Channel object with ID and name
 *    Example: Create a new public or private channel
 *
 * 4. slack_join_channel
 *    Parameters: channel (required)
 *    Returns: { ok: true/false }
 *    Example: Bot joins a public channel
 *
 * 5. slack_set_channel_topic
 *    Parameters: channel (required), topic (required)
 *    Returns: { ok: true/false, topic }
 *    Example: Set channel description/topic
 *
 * 6. slack_get_channel_history
 *    Parameters: channel (required), [limit], [oldest], [latest], [cursor]
 *    Returns: Messages array with pagination
 *    Example: Get recent messages from channel
 *
 * And more...
 *
 * ============================================================================
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { MatimoInstance } from 'matimo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run factory pattern examples
 */
async function runFactoryPatternExamples() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let channelId = process.env.SLACK_CHANNEL_ID || 'C0000000000';

  for (const arg of args) {
    if (arg.startsWith('--channel:')) {
      channelId = arg.split(':')[1];
    } else if (arg.startsWith('--channel=')) {
      channelId = arg.split('=')[1];
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Slack Tools - Factory Pattern                      ║');
  console.log('║     (Direct execution - simplest approach)             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    console.error('❌ Error: SLACK_BOT_TOKEN not set in .env');
    console.log('   Set it: export SLACK_BOT_TOKEN="xoxb-xxxx"');
    console.log('   Get one from: https://api.slack.com/apps');
    process.exit(1);
  }

  console.log(`🤖 Bot Token: ${botToken.slice(0, 10)}...`);
  console.log(`📍 Target Channel: ${channelId}\n`);

  // Initialize Matimo
  console.log('🚀 Initializing Matimo...');
  const toolsPath = path.resolve(__dirname, '../../../tools');
  const matimo = await MatimoInstance.init(toolsPath);

  const allTools = matimo.listTools();
  console.log(`✅ Loaded ${allTools.length} tools\n`);

  // Get Slack tools
  const slackTools = allTools.filter((t) => t.name.startsWith('slack'));
  console.log(`🔧 Found ${slackTools.length} Slack tools\n`);

  // List available channels and use first one if default doesn't exist
  console.log('📋 Finding an available channel...');
  const listResult = await matimo.execute('slack-list-channels', {
    limit: 10,
    types: 'public_channel,private_channel',
  });
  const listData = (listResult as any).data || listResult;
  let activeChannel = channelId;
  
  if (listData.ok === true && listData.channels && listData.channels.length > 0) {
    // Use first available channel if default is not found
    const defaultChannelExists = listData.channels.some((ch: any) => ch.id === channelId);
    if (!defaultChannelExists) {
      activeChannel = listData.channels[0].id;
      console.log(`   Using first available channel: #${listData.channels[0].name} (${activeChannel})`);
    } else {
      console.log(`   Using specified channel: #${listData.channels.find((ch: any) => ch.id === channelId)?.name} (${channelId})`);
    }
  } else {
    console.log(`   ⚠️  Could not list channels, using default: ${channelId}`);
  }
  console.log();

  console.log('════════════════════════════════════════════════════════════\n');
  console.log('Running Examples:');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    // Example 1: Send a message
    console.log('1️⃣  Sending message to channel...');
    const sendResult = await matimo.execute('slack-send-message', {
      channel: activeChannel,
      text: `🤖 Factory Pattern test message at ${new Date().toISOString()}`,
    });
    // Slack API returns {ok: true/false, ...} or wrapped in data
    const sendData = (sendResult as any).data || sendResult;
    if (sendData.ok === true) {
      console.log('   ✅ Message sent successfully');
      console.log(`      Channel: ${sendData.channel}`);
      console.log(`      Timestamp: ${sendData.ts}\n`);
    } else {
      console.log(`   ❌ Failed: ${sendData.error || 'Unknown error'}`);
      console.log(`      Response: ${JSON.stringify(sendData)}\n`);
    }

    // Example 2: List channels
    console.log('2️⃣  Listing channels...');
    const listResult = await matimo.execute('slack-list-channels', {
      limit: 5,
      types: 'public_channel,private_channel',
    });
    const listData = (listResult as any).data || listResult;
    if (listData.ok === true && listData.channels) {
      const channels = listData.channels || [];
      console.log(`   ✅ Found ${channels.length} channels`);
      channels.slice(0, 3).forEach((ch: any) => {
        console.log(`      • #${ch.name} (${ch.id})`);
      });
      console.log();
    } else {
      console.log(`   ❌ Failed: ${listData.error || 'Unknown error'}`);
      console.log(`      Response: ${JSON.stringify(listData)}\n`);
    }

    // Example 3: Set channel topic
    console.log('3️⃣  Setting channel topic...');
    const topicResult = await matimo.execute('slack_set_channel_topic', {
      channel: activeChannel,
      topic: '🎯 Matimo Testing Channel - Factory Pattern Example',
    });
    const topicData = (topicResult as any).data || topicResult;
    if (topicData.ok === true) {
      console.log('   ✅ Topic set successfully\n');
    } else {
      console.log(`   ❌ Failed: ${topicData.error || 'Unknown error'}`);
      console.log(`      Response: ${JSON.stringify(topicData)}\n`);
    }

    // Example 4: Get channel history
    console.log('4️⃣  Retrieving channel history...');
    const historyResult = await matimo.execute('slack_get_channel_history', {
      channel: activeChannel,
      limit: 5,
    });
    const historyData = (historyResult as any).data || historyResult;
    if (historyData.ok === true && historyData.messages) {
      console.log(`   ✅ Retrieved ${historyData.messages.length} recent messages\n`);
    } else {
      console.log(`   ❌ Failed: ${historyData.error || 'Unknown error'}`);
      console.log(`      Response: ${JSON.stringify(historyData)}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('════════════════════════════════════════════════════════════');
  console.log('✨ Factory Pattern Example Complete!');
  console.log('════════════════════════════════════════════════════════════\n');
}

runFactoryPatternExamples().catch(console.error);
