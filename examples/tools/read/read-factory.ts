import { MatimoInstance } from '@matimo/core';
import { getPathApprovalManager } from '@matimo/core';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Reusable readline interface kept open for multiple prompts
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
 * Interactive prompt helper for approval decisions
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
 * Example: Read tool using factory pattern
 * Demonstrates reading file contents and metadata with interactive approval
 */
async function readExample() {
  // Initialize Matimo with autoDiscover to find all tools (core + providers)
  const matimo = await MatimoInstance.init({ autoDiscover: true });

  // Set up approval callback for examples with INTERACTIVE PROMPTS
  const approvalManager = getPathApprovalManager();
  approvalManager.setApprovalCallback(promptForApproval);

  console.info('=== Read Tool - Factory Pattern (Interactive Approval) ===\n');

  try {
    // Example 1: Read this example file
    console.info('1. Reading read-factory.ts\n');
    const result1 = await matimo.execute('read', {
      filePath: path.join(__dirname, './read-factory.ts'),
      startLine: 1,
      endLine: 20,
    });

    if ((result1 as any).success) {
      console.info('File:', (result1 as any).filePath);
      console.info('Lines read:', (result1 as any).readLines);
      console.info('Content preview:');
      console.info((result1 as any).content?.substring(0, 300));
    } else {
      console.info('Access denied:', (result1 as any).error);
    }
    console.info('---\n');

    // Example 2: Read package.json
    console.info('2. Reading package.json\n');
    const result2 = await matimo.execute('read', {
      filePath: path.join(__dirname, '../../../package.json'),
      startLine: 1,
      endLine: 15,
    });

    if ((result2 as any).success) {
      console.info('File:', (result2 as any).filePath);
      console.info('Lines read:', (result2 as any).readLines);
      console.info('Content preview:');
      console.info((result2 as any).content?.substring(0, 200));
    } else {
      console.info('Access denied:', (result2 as any).error);
    }
    console.info('---\n');
  } catch (error: any) {
    console.error('Error reading file:', error.message, error.code, error.details);
  } finally {
    if (!isReadlineClosed) {
      rl.close();
      isReadlineClosed = true;
    }
  }
}

readExample();
