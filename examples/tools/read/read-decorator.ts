import {
  MatimoInstance,
  setGlobalMatimoInstance,
  tool,
  getPathApprovalManager,
} from '@matimo/core';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
 * Example: Read tool using @tool decorator pattern
 * Demonstrates class-based file reading with automatic decoration
 */
class FileReader {
  @tool('read')
  async readFile(filePath: string, startLine: number, endLine: number): Promise<unknown> {
    // Decorator automatically intercepts and executes via Matimo
    return undefined;
  }

  @tool('read')
  async getFileMetadata(filePath: string): Promise<unknown> {
    // Decorator automatically intercepts and executes via Matimo
    return undefined;
  }
}

async function decoratorExample() {
  // Set up decorator support with autoDiscover
  const matimo = await MatimoInstance.init({ autoDiscover: true });
  setGlobalMatimoInstance(matimo);

  // Set up approval callback for interactive approval
  const approvalManager = getPathApprovalManager();
  approvalManager.setApprovalCallback(promptForApproval);

  console.info('=== Read Tool - Decorator Pattern (Interactive Approval) ===\n');

  const reader = new FileReader();

  try {
    // Example 1: Read file through decorated method
    console.info('1. Reading file: read-factory.ts (lines 1-15)\n');
    const result1 = await reader.readFile(path.join(__dirname, './read-factory.ts'), 1, 15);
    console.info('File:', (result1 as any).filePath);
    console.info('Lines read:', (result1 as any).readLines);
    console.info('Content preview:');
    console.info((result1 as any).content?.substring(0, 200));
    console.info('---\n');

    // Example 2: Read another file
    console.info('2. Reading file: package.json (lines 1-10)\n');
    const result2 = await reader.getFileMetadata(path.join(__dirname, '../../../package.json'));
    console.info('File:', (result2 as any).filePath);
    console.info('Lines read:', (result2 as any).readLines);
    console.info('Content preview:');
    console.info((result2 as any).content?.substring(0, 200));
    console.info('---\n');
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    if (!isReadlineClosed) {
      rl.close();
      isReadlineClosed = true;
    }
  }
}

decoratorExample();
