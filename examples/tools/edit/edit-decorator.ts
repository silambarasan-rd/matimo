import {
  MatimoInstance,
  setGlobalMatimoInstance,
  tool,
  getPathApprovalManager,
} from '@matimo/core';
import fs from 'fs';
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
 * Example: Edit tool using @tool decorator pattern
 * Demonstrates class-based file editing with automatic decoration
 */
class FileEditor {
  @tool('edit')
  async replaceContent(
    filePath: string,
    operation: string,
    content: string,
    startLine: number,
    endLine: number
  ): Promise<unknown> {
    // Decorator automatically intercepts and executes via Matimo
    return undefined;
  }

  @tool('edit')
  async insertContent(
    filePath: string,
    operation: string,
    content: string,
    startLine: number,
    endLine: number
  ): Promise<unknown> {
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

  console.info('=== Edit Tool - Decorator Pattern (Interactive Approval) ===\n');

  const editor = new FileEditor();

  // Create a temp file for demonstration
  const tempFile = path.join(__dirname, 'temp-demo-decorator.txt');
  fs.writeFileSync(tempFile, 'Original line\nAnother line\nThird line\n');

  try {
    // Example 1: Replace through decorated method
    console.info('1. Replacing content via decorator\n');
    const result1 = await editor.replaceContent(tempFile, 'replace', 'Updated line', 1, 1);
    console.info('Edit Result:', (result1 as any).success);
    console.info('Lines Affected:', (result1 as any).linesAffected);
    console.info('File content:');
    console.info(fs.readFileSync(tempFile, 'utf-8'));
    console.info('---\n');

    // Example 2: Insert through decorated method
    console.info('2. Inserting content via decorator\n');
    const result2 = await editor.insertContent(tempFile, 'insert', 'Inserted line', 1, 0);
    console.info('Insert Result:', (result2 as any).success);
    console.info('Lines Affected:', (result2 as any).linesAffected);
    console.info('File content:');
    console.info(fs.readFileSync(tempFile, 'utf-8'));
    console.info('---\n');
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    if (!isReadlineClosed) {
      rl.close();
      isReadlineClosed = true;
    }
  }
}

decoratorExample();
