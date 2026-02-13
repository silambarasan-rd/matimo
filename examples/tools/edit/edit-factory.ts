import { MatimoInstance } from '@matimo/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Example: Edit tool using factory pattern
 * Demonstrates editing and modifying file contents
 */
async function editExample() {
  // Initialize Matimo with autoDiscover to find all tools (core + providers)
  const matimo = await MatimoInstance.init({ autoDiscover: true });

  console.info('=== Edit Tool - Factory Pattern ===\n');

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

    console.info('Edit Result:', (result as any).success);
    console.info('Lines Affected:', (result as any).linesAffected);
    console.info('\n---\n');

    console.info('Modified content:');
    console.info(fs.readFileSync(tempFile, 'utf-8'));
    console.info('---\n');

    // Example 2: Insert new content
    console.info('2. Inserting new line\n');
    const insertResult = await matimo.execute('edit', {
      filePath: tempFile,
      operation: 'insert',
      content: 'New inserted line',
      startLine: 2,
    });
    console.info('Insert Result:', (insertResult as any).success);
    console.info('Lines Affected:', (insertResult as any).linesAffected);
    console.info('\n---\n');
  } catch (error: any) {
    console.error('Error editing file:', error.message);
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

editExample();
