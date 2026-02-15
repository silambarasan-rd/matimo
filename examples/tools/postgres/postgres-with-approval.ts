/**
 * Postgres Tool Example with Real Database and SQL Approval Flow
 *
 * This example demonstrates:
 * 1. Connecting to a real Postgres database
 * 2. Executing non-destructive queries (SELECT)
 * 3. Executing destructive queries with approval flow
 * 4. Setting up approval callbacks
 *
 * Setup Instructions:
 * 1. Make sure you have a Postgres instance running locally or accessible
 * 2. Set the connection string via environment variable:
 *    export MATIMO_POSTGRES_URL="postgresql://user:password@localhost:5432/dbname"
 *    OR set individual components:
 *    export MATIMO_POSTGRES_HOST="localhost"
 *    export MATIMO_POSTGRES_PORT="5432"
 *    export MATIMO_POSTGRES_USER="user"
 *    export MATIMO_POSTGRES_PASSWORD="password"
 *    export MATIMO_POSTGRES_DB="dbname"
 *
 * 3. Run the example:
 *    pnpm tsx examples/tools/postgres/postgres-with-approval.ts
 */

import 'dotenv/config';
import { MatimoInstance, getSQLApprovalManager, setSQLApprovalManager } from '@matimo/core';
import * as path from 'path';
import * as readline from 'readline';

// Interactive approval callback with better input handling
function createInteractiveApprovalCallback() {
  return async (sql: string, mode: string): Promise<boolean> => {
    // Check if stdin is a TTY (interactive terminal)
    const isInteractive = process.stdin.isTTY;

    console.info(`\n⚠️  Approval Required for ${mode.toUpperCase()} operation:`);
    console.info(`SQL: ${sql}`);
    console.info('');

    if (!isInteractive) {
      console.info('❌ REJECTED - Non-interactive mode (no terminal input available)');
      console.info('');
      console.info('To run this example interactively:');
      console.info('  1. Run directly: pnpm postgres:approval');
      console.info('  2. Or set MATIMO_SQL_AUTO_APPROVE=true for automated approval');
      console.info('');
      return false;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    return new Promise((resolve) => {
      rl.question('Do you approve? (yes/no): ', (answer) => {
        const approved = answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
        console.info(`Result: ${approved ? '✅ APPROVED' : '❌ REJECTED'}\n`);
        rl.close();
        resolve(approved);
      });
    });
  };
}

async function main() {
  // Check if database connection is available
  if (
    !process.env.MATIMO_POSTGRES_URL &&
    (!process.env.MATIMO_POSTGRES_HOST ||
      !process.env.MATIMO_POSTGRES_USER ||
      !process.env.MATIMO_POSTGRES_PASSWORD ||
      !process.env.MATIMO_POSTGRES_DB)
  ) {
    console.error('❌ Database connection not configured.');
    console.error('Please set one of:');
    console.error('  - MATIMO_POSTGRES_URL="postgresql://user:password@host:port/db"');
    console.error(
      '  - MATIMO_POSTGRES_HOST, MATIMO_POSTGRES_PORT, MATIMO_POSTGRES_USER, MATIMO_POSTGRES_PASSWORD, MATIMO_POSTGRES_DB'
    );
    process.exit(1);
  }

  // Initialize Matimo with postgres tools
  const matimo = await MatimoInstance.init({ autoDiscover: true });

  console.info('🚀 Postgres Tool Example with Approval Flow');
  console.info('='.repeat(60));

  // Configure SQL approval manager
  const approvalManager = getSQLApprovalManager();
  approvalManager.setApprovalCallback(createInteractiveApprovalCallback());

  try {
    // 1. List available tools
    const tools = matimo.listTools();
    const postgresTools = tools.filter((t) => t.name.startsWith('postgres'));
    console.info(`\n📋 Available Postgres tools: ${postgresTools.map((t) => t.name).join(', ')}`);

    // Sequential discovery workflow

    // STEP 1: Discover tables (SELECT - no approval needed)
    console.info('\n\n1️⃣  DISCOVER TABLES (Step 1/3 - No approval needed)');
    console.info('-'.repeat(60));
    console.info('SQL: SELECT table_name FROM information_schema.tables WHERE table_schema = $1\n');

    let discoveredTables: string[] = [];
    try {
      const tablesResult = await matimo.execute('postgres-execute-sql', {
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `,
      });
      if (
        tablesResult &&
        typeof tablesResult === 'object' &&
        'success' in tablesResult &&
        (tablesResult as any).success === false
      ) {
        throw new Error((tablesResult as any).error || 'Query failed');
      }
      console.info('✅ Query executed successfully (no approval needed for SELECT)');
      if (tablesResult && typeof tablesResult === 'object' && 'rows' in tablesResult) {
        const rows = (tablesResult as any).rows;
        if (rows && rows.length > 0) {
          console.info('Tables found:');
          rows.forEach((row: any) => {
            console.info(`   - ${row.table_name}`);
            discoveredTables.push(row.table_name);
          });
        } else {
          console.info('(No tables found in public schema)');
        }
      } else {
        console.info('(No tables found in public schema)');
      }
    } catch (err: any) {
      console.error('❌ Error:', err.message);
    }

    // STEP 2: Get row counts (SELECT - no approval needed)
    console.info('\n\n2️⃣  COUNT RECORDS (Step 2/3 - No approval needed)');
    console.info('-'.repeat(60));
    console.info('SQL: SELECT tablename, n_live_tup FROM pg_stat_user_tables\n');

    try {
      const countsResult = await matimo.execute('postgres-execute-sql', {
        sql: `
          SELECT 
            table_name,
            (SELECT count(*) FROM information_schema.columns 
             WHERE information_schema.columns.table_name = t.table_name) as columns
          FROM information_schema.tables t
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `,
      });
      if (
        countsResult &&
        typeof countsResult === 'object' &&
        'success' in countsResult &&
        (countsResult as any).success === false
      ) {
        throw new Error((countsResult as any).error || 'Query failed');
      }
      console.info('✅ Query executed successfully (no approval needed for SELECT)');
      if (countsResult && typeof countsResult === 'object' && 'rows' in countsResult) {
        const rows = (countsResult as any).rows;
        if (rows && rows.length > 0) {
          console.info('Tables found:');
          rows.forEach((row: any) => {
            console.info(`   - ${row.table_name} (${row.columns} columns)`);
          });
        } else {
          console.info('(No tables found in public schema)');
        }
      } else {
        console.info('(No tables found in public schema)');
      }
    } catch (err: any) {
      console.error('❌ Error:', err.message);
    }

    // STEP 3: Try a destructive operation that requires approval
    console.info('\n\n3️⃣  DESTRUCTIVE OPERATION (Step 3/3 - Requires approval)');
    console.info('-'.repeat(60));
    console.info('Attempting DELETE on first discovered table (if any)...\n');

    if (discoveredTables.length > 0) {
      const tableName = discoveredTables[0];
      console.info(`SQL: DELETE FROM ${tableName} WHERE 1=0 (safe - matches no rows)\n`);

      try {
        // Safe DELETE that matches no rows (WHERE 1=0)
        const deleteResult = await matimo.execute('postgres-execute-sql', {
          sql: `DELETE FROM ${tableName} WHERE 1=0;`,
        });
        console.info('✅ DELETE approved and executed successfully');
        console.info('   (0 rows deleted - safe WHERE clause)\n');
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        if (
          errorMsg.includes('not approved') ||
          errorMsg.includes('approval') ||
          errorMsg.includes('callback')
        ) {
          console.info('⚠️  DELETE was REJECTED by user');
          console.info(
            '   Approval is required for destructive operations (CREATE/DROP/ALTER/DELETE/UPDATE)\n'
          );
        } else {
          console.error('❌ Error:', errorMsg);
        }
      }
    } else {
      console.info('⚠️  No tables found to demonstrate destructive operation');
      console.info('   (Would require approval when attempting DELETE/UPDATE/CREATE/DROP/ALTER)\n');
    }

    // STEP 4: Show approval configuration
    console.info('\n4️⃣  APPROVAL CONFIGURATION');
    console.info('-'.repeat(60));
    console.info('Current approval settings:');
    console.info(
      `   - MATIMO_SQL_AUTO_APPROVE=${process.env.MATIMO_SQL_AUTO_APPROVE || '(not set)'}`
    );
    console.info(`   - Interactive approval callback: ${approvalManager ? 'Enabled' : 'Disabled'}`);
    console.info('\nFor CI/automated environments, set:');
    console.info('   export MATIMO_SQL_AUTO_APPROVE=true\n');

    console.info('✨ Sequential discovery with approval workflow complete!');
    console.info('='.repeat(60));
    console.info('Pattern: 1) Discover tables 2) Count records 3) Attempt destructive op\n');
  } catch (err: any) {
    console.error('\n❌ Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\nDatabase connection refused. Make sure your Postgres instance is running.');
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
