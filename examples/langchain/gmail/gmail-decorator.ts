#!/usr/bin/env node
/**
 * ============================================================================
 * GMAIL TOOLS - DECORATOR PATTERN EXAMPLE
 * ============================================================================
 *
 * PATTERN: Decorator Pattern with @tool
 * ─────────────────────────────────────────────────────────────────────────
 * Uses TypeScript @tool decorators to wrap Gmail tool calls in a class.
 *
 * Use this pattern when:
 * ✅ Building class-based applications
 * ✅ Encapsulating tool logic in services
 * ✅ Adding custom methods that combine multiple tools
 * ✅ Need reusable tool wrappers
 * ✅ Object-oriented design preferred
 *
 * SETUP:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Create .env file:
 *    GMAIL_ACCESS_TOKEN=ya29.xxxxxxxxxxxxx
 *
 * 2. Same scopes as factory pattern
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   export GMAIL_ACCESS_TOKEN=your_token_here
 *   npm run gmail:decorator
 *
 * ============================================================================
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { MatimoInstance, tool, setGlobalMatimoInstance } from 'matimo';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Decorator Pattern Agent - Uses @tool decorators for Gmail operations
 */
class DecoratorPatternAgent {
  constructor(private matimo: MatimoInstance) {}

  /**
   * Gmail send-email tool - automatically executes via @tool decorator
   */
  @tool('gmail-send-email')
  async sendEmail(to: string, subject: string, body: string): Promise<unknown> {
    // Decorator automatically calls: matimo.execute('gmail-send-email', { to, subject, body })
    // Matimo automatically injects GMAIL_ACCESS_TOKEN from env vars
    return undefined;
  }

  /**
   * Gmail list-messages tool - automatically executes via @tool decorator
   */
  @tool('gmail-list-messages')
  async listMessages(query?: string, maxResults?: number): Promise<unknown> {
    // Decorator automatically calls: matimo.execute('gmail-list-messages', { query, maxResults })
    // Matimo automatically injects GMAIL_ACCESS_TOKEN from env vars
    return undefined;
  }

  /**
   * Gmail get-message tool - automatically executes via @tool decorator
   */
  @tool('gmail-get-message')
  async getMessage(message_id: string, format?: string): Promise<unknown> {
    // Decorator automatically calls: matimo.execute('gmail-get-message', { message_id, format })
    // Matimo automatically injects GMAIL_ACCESS_TOKEN from env vars
    return undefined;
  }

  /**
   * Gmail create-draft tool - automatically executes via @tool decorator
   */
  @tool('gmail-create-draft')
  async createDraft(to: string, subject: string, body: string): Promise<unknown> {
    // Decorator automatically calls: matimo.execute('gmail-create-draft', { to, subject, body })
    // Matimo automatically injects GMAIL_ACCESS_TOKEN from env vars
    return undefined;
  }

  /**
   * Gmail delete-message tool - automatically executes via @tool decorator
   */
  @tool('gmail-delete-message')
  async deleteMessage(message_id: string): Promise<unknown> {
    // Decorator automatically calls: matimo.execute('gmail-delete-message', { message_id })
    // Matimo automatically injects GMAIL_ACCESS_TOKEN from env vars
    return undefined;
  }
}

/**
 * Run decorator pattern examples
 */
async function runDecoratorPatternExamples() {
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
  console.log('║     Gmail Tools - Decorator Pattern                    ║');
  console.log('║     (Uses @tool decorators for automatic execution)    ║');
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
    setGlobalMatimoInstance(matimo);

    const matimoTools = matimo.listTools();
    console.log(`📦 Loaded ${matimoTools.length} tools:\n`);
    matimoTools.forEach((t) => {
      console.log(`  • ${t.name}`);
      console.log(`    ${t.description}\n`);
    });

    // Create agent
    const agent = new DecoratorPatternAgent(matimo);

    console.log('🧪 Testing Gmail Tools with Decorator Pattern');
    console.log('═'.repeat(60));

    // Example 1: List Messages via decorator
    console.log('\n📬 Example 1: List Messages via @tool Decorator');
    console.log('─'.repeat(60));
    try {
      const listResult = await agent.listMessages('', 5);
      console.log('✅ Messages retrieved successfully!');
      if (typeof listResult === 'object' && listResult !== null) {
        const data = listResult as any;
        if (data.messages && Array.isArray(data.messages)) {
          console.log(`   Found ${data.messages.length} recent messages:`);
          data.messages.slice(0, 3).forEach((msg: any, idx: number) => {
            console.log(`   ${idx + 1}. ID: ${msg.id.substring(0, 15)}...`);
          });
        } else {
          console.log('   No messages or unexpected format');
        }
      }
    } catch (error) {
      console.log(`⚠️  List failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Example 2: Send Email via decorator
    console.log('\n📧 Example 2: Send Email via @tool Decorator');
    console.log('─'.repeat(60));
    try {
      const sendResult = await agent.sendEmail(
        userEmail,
        'Hello from Decorator Pattern',
        'This email was sent using the @tool decorator'
      );
      console.log('✅ Email sent successfully!');
      if (typeof sendResult === 'object' && sendResult !== null) {
        const data = sendResult as any;
        if (data.id) console.log(`   Message ID: ${data.id}`);
      }
    } catch (error) {
      console.log(`⚠️  Send failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Example 3: Create Draft via decorator
    console.log('\n✏️  Example 3: Create Draft via @tool Decorator');
    console.log('─'.repeat(60));
    try {
      const draftResult = await agent.createDraft(
        userEmail,
        'Decorator Pattern Draft',
        'This draft was created using the @tool decorator'
      );
      console.log('✅ Draft created successfully!');
      if (typeof draftResult === 'object' && draftResult !== null) {
        const data = draftResult as any;
        if (data.id) console.log(`   Draft ID: ${data.id}`);
      }
    } catch (error) {
      console.log(`⚠️  Draft failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✨ Decorator Pattern Examples Complete!\n');
    console.log('Usage:');
    console.log('  npm run gmail:decorator');
    console.log('  npm run gmail:decorator -- --email:your-email@gmail.com\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the examples
runDecoratorPatternExamples().catch(console.error);
