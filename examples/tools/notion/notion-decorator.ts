#!/usr/bin/env node
/**
 * ============================================================================
 * NOTION TOOLS - DECORATOR PATTERN EXAMPLE
 * ============================================================================
 *
 * PATTERN: Class Decorator Pattern
 * ─────────────────────────────────────────────────────────────────────────
 * Using @tool() decorators for class-based tool execution.
 *
 * Use this pattern when:
 * ✅ Building class-based agents
 * ✅ Organizing tools by domain (NotionManager, SlackHelper, etc.)
 * ✅ Integrating with frameworks like LangChain, CrewAI
 * ✅ Want method signatures to match tool interfaces
 *
 * SETUP:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Set NOTION_API_KEY environment variable
 * 2. Share Notion databases/pages with your integration
 * 3. Global Matimo instance must be set: setGlobalMatimoInstance(matimo)
 *
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *   export NOTION_API_KEY=secret_xxxx
 *   npm run notion:decorator
 *
 * ============================================================================
 */

import 'dotenv/config';
import { MatimoInstance, setGlobalMatimoInstance, tool } from '@matimo/core';

/**
 * Notion Manager - Class-based interface to Notion tools
 * Each method is decorated with @tool() which auto-executes via Matimo
 */
class NotionManager {
  /**
   * List all databases in the workspace
   * No API knowledge needed - just call it!
   */
  @tool('notion_list_databases')
  async listDatabases(page_size?: number): Promise<any> {
    // Decorator intercepts → auto-executes via matimo.execute()
    throw new Error('Should not be called - decorator handles execution');
  }

  /**
   * Query a database for pages matching optional filters
   * database_id parameter is clear and self-documenting
   */
  @tool('notion_query_database')
  async queryDatabase(
    database_id: string,
    sorts?: Array<Record<string, any>>,
    filter?: Record<string, any>,
    page_size?: number
  ): Promise<any> {
    // Method body ignored - @tool decorator handles execution
    throw new Error('Should not be called - decorator handles execution');
  }

  /**
   * Create a new page with markdown content
   * Simplest way to add content - works with any database
   */
  @tool('notion_create_page')
  async createPage(
    parent: Record<string, string>,
    markdown?: string,
    icon?: Record<string, string>
  ): Promise<any> {
    // Decorator intercepts → auto-executes via matimo.execute()
    throw new Error('Should not be called - decorator handles execution');
  }

  /**
   * Update an existing page (icon, status, etc.)
   */
  @tool('notion_update_page')
  async updatePage(page_id: string, icon?: Record<string, string>): Promise<any> {
    // Method body ignored - @tool decorator handles execution
    throw new Error('Should not be called - decorator handles execution');
  }

  /**
   * Add a comment to a page
   */
  @tool('notion_create_comment')
  async addComment(
    parent: Record<string, string>,
    rich_text?: Array<Record<string, any>>
  ): Promise<any> {
    // Method body ignored - @tool decorator handles execution
    throw new Error('Should not be called - decorator handles execution');
  }
}

/**
 * Demonstration of decorator pattern usage with REAL operations
 */
async function demonstrateDecoratorPattern() {
  console.info('\n╔════════════════════════════════════════════════════════╗');
  console.info('║     Notion Tools - Decorator Pattern                  ║');
  console.info('║     (Class-based execution with REAL operations)     ║');
  console.info('╚════════════════════════════════════════════════════════╝\n');

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: NOTION_API_KEY not set in .env');
    console.info('   Set it: export NOTION_API_KEY="secret_xxxx"');
    console.info('   Get one from: https://www.notion.so/my-integrations');
    process.exit(1);
  }

  try {
    // Step 1: Initialize Matimo
    console.info('🚀 Initializing Matimo...');
    const matimo = await MatimoInstance.init({ autoDiscover: true });

    // Step 2: Set global instance for decorators to use
    console.info('📌 Setting up decorator support...');
    setGlobalMatimoInstance(matimo);

    console.info('✅ NotionManager initialized with decorators\n');

    // Step 3: Create manager instance
    const manager = new NotionManager();

    console.info('════════════════════════════════════════════════════════════\n');
    console.info('Testing @tool() Decorator - Verifying Tool Execution:');
    console.info('════════════════════════════════════════════════════════════\n');

    // Test 1: Verify decorator intercepts and calls matimo.execute()
    console.info('1️⃣  Testing @tool("notion_list_databases") decorator...');
    console.info('    → Calling: manager.listDatabases(10)');
    console.info('    → Decorator should intercept and call matimo.execute()...\n');

    let listResult: any;
    try {
      listResult = await manager.listDatabases(10);
      console.info(`   📨 Raw result received: ${JSON.stringify(listResult).substring(0, 100)}...`);
      const databases = listResult.results || listResult.data?.results || [];
      console.info(`   ✅ Decorator executed tool successfully`);
      console.info(`   📊 Got response with ${databases.length} databases\n`);

      if (databases.length > 0) {
        const foundDatabase = databases[0];
        console.info('2️⃣  Testing @tool("notion_query_database") decorator...');
        console.info(`    → Calling: manager.queryDatabase("${foundDatabase.id}", ...)`);

        const queryResult = await manager.queryDatabase(foundDatabase.id, undefined, undefined, 5);
        const queryPages = queryResult.results || queryResult.data?.results || [];
        console.info(`   ✅ Query decorator executed successfully`);
        console.info(`   📊 Got response with ${queryPages.length} pages\n`);

        // Test 3: Try creating a page
        const timestamp = new Date().toLocaleTimeString();
        console.info('3️⃣  Testing @tool("notion_create_page") decorator...');
        console.info('    → Calling: manager.createPage({...}, markdown, icon)');

        try {
          const createResult = await manager.createPage(
            { database_id: foundDatabase.id },
            `# Decorator Test Page\n\nCreated at ${timestamp}`,
            { type: 'emoji', emoji: '🔧' }
          );
          console.info(`   ✅ Create decorator executed`);
          console.info(`   📨 Got response: ${JSON.stringify(createResult).substring(0, 100)}...`);

          if (createResult.id) {
            console.info(`   ✅ Successfully created page: ${createResult.id}\n`);

            // Try updating
            console.info('4️⃣  Testing @tool("notion_update_page") decorator...');
            try {
              const updateResult = await manager.updatePage(createResult.id, {
                type: 'emoji',
                emoji: '✨',
              });
              console.info(`   ✅ Update decorator executed\n`);
            } catch (e) {
              console.info(`   ⚠️  Update skipped (expected if permission limited): ${e}\n`);
            }

            // Try commenting
            console.info('5️⃣  Testing @tool("notion_create_comment") decorator...');
            try {
              const commentResult = await manager.addComment({ page_id: createResult.id }, [
                { type: 'text', text: { content: `Added at ${timestamp} via decorator!` } },
              ]);
              console.info(`   ✅ Comment decorator executed\n`);
            } catch (e) {
              console.info(`   ⚠️  Comment skipped (expected if permission limited): ${e}\n`);
            }
          }
        } catch (createError) {
          console.info(`   ⚠️  Create failed (expected if permission limited): ${createError}\n`);
        }
      } else {
        console.info('   📌 No databases accessible - cannot test further operations');
        console.info('   📌 Share a Notion database with your integration to test full workflow\n');
      }
    } catch (error) {
      console.error(`   ❌ Decorator test failed: ${error}\n`);
      throw error;
    }

    console.info('════════════════════════════════════════════════════════════\n');
    console.info('✅ Decorator Pattern Verification Complete!');
    console.info('════════════════════════════════════════════════════════════\n');
    console.info('📌 Key Points:');
    console.info('   ✅ @tool() decorator intercepts method calls');
    console.info('   ✅ Decorator calls matimo.execute() with the tool name');
    console.info('   ✅ Method bodies are ignored (not executed)');
    console.info('   ✅ Works seamlessly - developers just call methods!\n');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.message.includes('NOTION_API_KEY')) {
      console.error('\n📌 Set environment variable:');
      console.error('   export NOTION_API_KEY=secret_xxxxx');
    }
    process.exit(1);
  }
}

demonstrateDecoratorPattern().catch(console.error);
