#!/usr/bin/env node
/**
 * ============================================================================
 * GMAIL TOOLS - FACTORY PATTERN EXAMPLE
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
 *    GMAIL_ACCESS_TOKEN=ya29.xxxxxxxxxxxxx
 *
 * 2. Get a Gmail access token:
 *    - Use OAuth2Handler to authenticate with Google
 *    - Request these scopes:
 *      • https://www.googleapis.com/auth/gmail.send (send emails)
 *      • https://www.googleapis.com/auth/gmail.readonly (read emails)
 *      • https://www.googleapis.com/auth/gmail.modify (drafts, delete)
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   export GMAIL_ACCESS_TOKEN=your_token_here
 *   npm run gmail:factory
 *
 * AVAILABLE TOOLS:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. gmail-send-email
 *    Parameters: to (required), subject (required), body (required), [cc], [bcc]
 *    Returns: { id, threadId, labelIds }
 *    Example: Send an email to someone@example.com
 *
 * 2. gmail-list-messages
 *    Parameters: [query], [maxResults], [pageToken]
 *    Returns: { messages[], nextPageToken }
 *    Example queries: "is:unread", "from:someone@example.com", "has:attachment"
 *
 * 3. gmail-get-message
 *    Parameters: message_id, [format]
 *    Format options: "minimal" (lightweight), "full" (complete with headers)
 *    Returns: { payload { headers, body }, snippet }
 *
 * 4. gmail-create-draft
 *    Parameters: to, subject, body, [cc], [bcc]
 *    Returns: { id, message { id, threadId } }
 *    Note: Draft is created but not sent - user edits then sends manually
 *
 * 5. gmail-delete-message
 *    Parameters: message_id
 *    Returns: { success }
 *    Note: Permanently deletes the message
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
  let userEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  for (const arg of args) {
    if (arg.startsWith('--email:')) {
      userEmail = arg.split(':')[1];
    } else if (arg.startsWith('--email=')) {
      userEmail = arg.split('=')[1];
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Gmail Tools - Factory Pattern                      ║');
  console.log('║     (Direct execution - simplest approach)             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const accessToken = process.env.GMAIL_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('❌ Error: GMAIL_ACCESS_TOKEN not set in .env');
    console.log('   Set it: export GMAIL_ACCESS_TOKEN="ya29...."');
    console.log('   Or get a token from: https://developers.google.com/oauthplayground');
    process.exit(1);
  }

  console.log(`📧 User Email: ${userEmail}\n`);

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

    // Filter to Gmail tools
    const gmailTools = matimoTools.filter((t) => t.name.startsWith('gmail-'));
    console.log(`📧 Found ${gmailTools.length} Gmail tools\n`);

    console.log('🧪 Testing Gmail Tools with Factory Pattern');
    console.log('═'.repeat(60));

    // Example 1: List Messages (GET emails)
    console.log('\n📬 Example 1: List Your Recent Messages');
    console.log('─'.repeat(60));
    try {
      const listResult = await matimo.execute('gmail-list-messages', {
        maxResults: 5,
        GMAIL_ACCESS_TOKEN: accessToken,
      });
      console.log('📤 Raw Result:', JSON.stringify(listResult, null, 2));
      
      if (typeof listResult === 'object' && listResult !== null) {
        const data = listResult as any;
        if (data.data?.messages && Array.isArray(data.data.messages)) {
          console.log(`✅ Found ${data.data.messages.length} recent messages:`);
          data.data.messages.slice(0, 3).forEach((msg: any, idx: number) => {
            console.log(`   ${idx + 1}. ID: ${msg.id}`);
            console.log(`      Thread: ${msg.threadId}`);
          });
        } else if (data.messages && Array.isArray(data.messages)) {
          console.log(`✅ Found ${data.messages.length} recent messages:`);
          data.messages.slice(0, 3).forEach((msg: any, idx: number) => {
            console.log(`   ${idx + 1}. ID: ${msg.id}`);
            console.log(`      Thread: ${msg.threadId}`);
          });
        } else {
          console.log('❌ Unexpected response format');
        }
      }
    } catch (error) {
      console.log(`❌ List failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(JSON.stringify(error, null, 2));
    }

    // Example 2: Send Email
    console.log('\n📧 Example 2: Send Email');
    console.log('─'.repeat(60));
    try {
      // Simple API - just pass to, subject, body
      // Matimo automatically converts to MIME format (defined in YAML)
      const sendResult = await matimo.execute('gmail-send-email', {
        to: userEmail,
        subject: 'Hello from Matimo Factory Pattern',
        body: 'This is a test email from the Factory pattern',
        GMAIL_ACCESS_TOKEN: accessToken,
      });
      console.log('📤 Raw Result:', JSON.stringify(sendResult, null, 2));
      
      if (typeof sendResult === 'object' && sendResult !== null) {
        const data = sendResult as any;
        if (data.data?.id) {
          console.log(`✅ Email sent successfully!`);
          console.log(`   Message ID: ${data.data.id}`);
          console.log(`   Thread ID: ${data.data.threadId || 'N/A'}`);
        } else if (data.id) {
          console.log(`✅ Email sent successfully!`);
          console.log(`   Message ID: ${data.id}`);
          console.log(`   Thread ID: ${data.threadId || 'N/A'}`);
        } else {
          console.log('❌ Unexpected response format');
        }
      }
    } catch (error) {
      console.log(`❌ Send failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(JSON.stringify(error, null, 2));
    }

    // Example 3: Create Draft
    console.log('\n✏️  Example 3: Create Draft');
    console.log('─'.repeat(60));
    try {
      // Simple API - just pass to, subject, body
      // Matimo automatically converts to MIME format (defined in YAML)
      const draftResult = await matimo.execute('gmail-create-draft', {
        to: userEmail,
        subject: 'Factory Pattern Draft',
        body: 'This is a draft created by the Factory pattern',
        GMAIL_ACCESS_TOKEN: accessToken,
      });
      console.log('📤 Raw Result:', JSON.stringify(draftResult, null, 2));
      
      if (typeof draftResult === 'object' && draftResult !== null) {
        const data = draftResult as any;
        if (data.data?.id) {
          console.log(`✅ Draft created successfully!`);
          console.log(`   Draft ID: ${data.data.id}`);
          console.log(`   Message ID: ${data.data.message?.id || 'N/A'}`);
        } else if (data.id) {
          console.log(`✅ Draft created successfully!`);
          console.log(`   Draft ID: ${data.id}`);
        } else {
          console.log('❌ Unexpected response format');
        }
      }
    } catch (error) {
      console.log(`❌ Draft failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(JSON.stringify(error, null, 2));
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✨ Factory Pattern Examples Complete!\n');
    console.log('Usage:');
    console.log('  npm run gmail:factory');
    console.log('  npm run gmail:factory -- --email:your-email@gmail.com\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the examples
runFactoryPatternExamples().catch(console.error);
