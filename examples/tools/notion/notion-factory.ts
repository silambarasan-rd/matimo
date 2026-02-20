#!/usr/bin/env node
/**
 * ============================================================================
 * NOTION TOOLS - FACTORY PATTERN EXAMPLE (REAL OPERATIONS)
 * ============================================================================
 *
 * This example demonstrates REAL Notion API operations:
 * 1. Search the workspace to discover databases
 * 2. Query actual databases for real data
 * 3. Create new pages with real data
 * 4. Update existing pages
 * 5. Show actual results from your Notion workspace
 *
 * ============================================================================
 */

import 'dotenv/config';
import { MatimoInstance } from '@matimo/core';

/**
 * Run factory pattern examples with REAL Notion operations
 */
async function runFactoryPatternExamples() {
  console.info('\n╔════════════════════════════════════════════════════════╗');
  console.info('║     NOTION - Factory Pattern (REAL OPERATIONS)        ║');
  console.info('║     Discovering & querying your workspace             ║');
  console.info('╚════════════════════════════════════════════════════════╝\n');

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: NOTION_API_KEY not set in .env');
    process.exit(1);
  }

  const matimo = await MatimoInstance.init({ autoDiscover: true });
  const allTools = matimo.listTools();
  const notionTools = allTools.filter((t) => t.name.startsWith('notion_'));

  console.info(`✅ Found ${notionTools.length} Notion tools\n`);
  console.info('DEBUG: Notion tools discovered:');
  notionTools.forEach((tool) => {
    console.info(`  • ${tool.name}`);
  });
  console.info('Debug: All available tools:');
  allTools.forEach((tool) => {
    console.info(`  • ${tool.name}`);
  });
  console.info('');
  console.info('════════════════════════════════════════════════════════════\n');
  console.info('REAL NOTION OPERATIONS:');
  console.info('════════════════════════════════════════════════════════════\n');

  try {
    // STEP 1: List all databases in workspace
    console.info('1️⃣  DISCOVERING YOUR WORKSPACE...\n');
    const listResult = (await matimo.execute('notion_list_databases', {
      page_size: 10,
    })) as any;

    const databases = listResult.data?.results || [];
    if (databases.length === 0) {
      console.info('   ℹ️  No databases found. Create and share one first.\n');
      return;
    }

    console.info(`✅ Found ${databases.length} database(s) in workspace\n`);

    const foundDatabase = databases[0];
    const dbTitle = foundDatabase.title?.[0]?.plain_text || 'Untitled';
    console.info(`   📊 Using database: "${dbTitle}"`);
    console.info(`   🔑 ID: ${foundDatabase.id}\n`);

    // STEP 2: Query database
    console.info('2️⃣  QUERYING DATABASE...\n');
    const queryResult = (await matimo.execute('notion_query_database', {
      database_id: foundDatabase.id,
      page_size: 5,
    })) as any;

    const queryData = queryResult.data;
    if (queryData?.results && Array.isArray(queryData.results) && queryData.results.length > 0) {
      console.info(`✅ Retrieved ${queryData.results.length} page(s)\n`);
      queryData.results.slice(0, 3).forEach((page: any, idx: number) => {
        const title =
          (page.properties as any)?.[Object.keys(page.properties || {})[0]]?.[0]?.plain_text ??
          'Untitled';
        const url = page.url;
        console.info(`   ${idx + 1}. ${title}`);
        console.info(`      🔗 ${url}\n`);
      });
      if (queryData.results.length > 3) {
        console.info(`   ... and ${queryData.results.length - 3} more\n`);
      }
    } else {
      console.info('   ℹ️  Database is empty\n');
    }

    // STEP 3: Create page with markdown (simple, works with any database)
    console.info('3️⃣  CREATING NEW PAGE...\n');
    const pageTitle = `Matimo Test ${new Date().toLocaleTimeString()}`;

    const createParams = {
      parent: { database_id: foundDatabase.id },
      markdown: `# ${pageTitle}\n\nCreated by Matimo at ${new Date().toLocaleString()}`,
      icon: {
        type: 'emoji',
        emoji: '✅',
      },
    };

    console.info('DEBUG: Creating page with params:', JSON.stringify(createParams, null, 2));
    const createResult = (await matimo.execute('notion_create_page', createParams)) as any;
    console.info('DEBUG: Create result:', JSON.stringify(createResult, null, 2).substring(0, 500));

    const createData = createResult.data || createResult;
    if (createData && createData.id) {
      console.info(`✅ Page created!\n`);
      console.info(`   📄 Title: "${pageTitle}"`);
      console.info(`   🔑 ID: ${createData.id}`);
      console.info(`   🔗 URL: ${createData.url}\n`);

      // STEP 4: Update page with emoji icon
      console.info('4️⃣  UPDATING PAGE WITH ICON...\n');
      try {
        await matimo.execute('notion_update_page', {
          page_id: createData.id,
          icon: {
            type: 'emoji',
            emoji: '🚀',
          },
        });
        console.info(`✅ Page updated with icon!\n`);
      } catch (err) {
        console.info(
          `   ⚠️  Could not update: ${err instanceof Error ? err.message : String(err)}\n`
        );
      }

      // STEP 5: Add comment
      console.info('5️⃣  ADDING COMMENT...\n');
      try {
        await matimo.execute('notion_create_comment', {
          parent: { page_id: createData.id },
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Created by Matimo at ${new Date().toLocaleString()}. Real test! 🚀`,
              },
            },
          ],
        });
        console.info(`✅ Comment added!\n`);
      } catch (err) {
        console.info(
          `   ⚠️  Could not add comment: ${err instanceof Error ? err.message : String(err)}\n`
        );
      }
    } else {
      console.info(
        `   ⚠️  Failed to create page. Response: ${JSON.stringify(createData).substring(0, 200)}\n`
      );
    }

    console.info('════════════════════════════════════════════════════════════\n');
    console.info('✨ COMPLETE!\n');
    console.info('📝 Check your Notion workspace to see the created page!\n');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${msg}`);
    if (msg.includes('401') || msg.includes('permission')) {
      console.error('   • Check your NOTION_API_KEY is valid');
      console.error('   • Ensure your integration has read/write capabilities');
      console.error('   • Share your Notion database with the integration');
    }
    process.exit(1);
  }
}

runFactoryPatternExamples().catch(console.error);
