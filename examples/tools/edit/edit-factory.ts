import { MatimoInstance } from '@matimo/core';
import { getPathApprovalManager } from '@matimo/core';
import fs from 'fs';
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
 * Example: Edit tool using factory pattern
 * Demonstrates editing and modifying file contents with interactive approval
 */
async function editExample() {
  // Initialize Matimo with autoDiscover to find all tools (core + providers)
  const matimo = await MatimoInstance.init({ autoDiscover: true });

  // Set up approval callback for examples with INTERACTIVE PROMPTS
  const approvalManager = getPathApprovalManager();
  approvalManager.setApprovalCallback(promptForApproval);

  console.info('=== Edit Tool - Factory Pattern (Interactive Approval) ===\n');

  // Create a temp file for demonstration
  const tempFile = path.join(__dirname, 'temp-demo.txt');
  fs.writeFileSync(tempFile, 'Line 1\nLine 2\nLine 3\n');

  try {
    // Example 1: Replace text in file (replace line 2)
    console.info('1. Replacing content in file\n');
    console.info('Original content:');
    console.info(fs.readFileSync(tempFile, 'utf-8'));
    console.info('---\n');

    const result = await matimo.execute('edit', {
      filePath: tempFile,
      operation: 'replace',
      content: 'Line 2 (Modified)',
      startLine: 2,
      endLine: 2,
    });

    if ((result as any).success) {
      console.info('Edit Result:', (result as any).success);
      console.info('Lines Affected:', (result as any).linesAffected);
      console.info('\nModified content:');
      console.info(fs.readFileSync(tempFile, 'utf-8'));
    } else {
      console.info('Edit denied:', (result as any).error);
    }
    console.info('---\n');

    // Example 2: Insert new content
    console.info('2. Inserting new line\n');
    const insertResult = await matimo.execute('edit', {
      filePath: tempFile,
      operation: 'insert',
      content: 'New inserted line',
      startLine: 2,
    });

    if ((insertResult as any).success) {
      console.info('Insert Result:', (insertResult as any).success);
      console.info('Lines Affected:', (insertResult as any).linesAffected);
      console.info('\nFinal content:');
      console.info(fs.readFileSync(tempFile, 'utf-8'));
    } else {
      console.info('Insert denied:', (insertResult as any).error);
    }
    console.info('---\n');
  } catch (error: any) {
    console.error('Error editing file:', error.message);
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

editExample();
