import { MatimoInstance } from '@matimo/core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Example: Read tool using factory pattern
 * Demonstrates reading file contents and metadata
 */
async function readExample() {
  // Initialize Matimo with autoDiscover to find all tools (core + providers)
  const matimo = await MatimoInstance.init({ autoDiscover: true });

  console.info('=== Read Tool - Factory Pattern ===\n');

  try {
    // Example 1: Read this example file
    console.info('1. Reading read-factory.ts\n');
    const result1 = await matimo.execute('read', {
      filePath: path.join(__dirname, './read-factory.ts'),
      startLine: 1,
      endLine: 20,
    });

    console.info('File:', (result1 as any).filePath);
    console.info('Lines read:', (result1 as any).readLines);
    console.info('Content preview:');
    console.info((result1 as any).content?.substring(0, 300));
    console.info('---\n');

    // Example 2: Read package.json
    console.info('2. Reading package.json\n');
    const result2 = await matimo.execute('read', {
      filePath: path.join(__dirname, '../../../package.json'),
      startLine: 1,
      endLine: 15,
    });

    console.info('File:', (result2 as any).filePath);
    console.info('Lines read:', (result2 as any).readLines);
    console.info('Content preview:');
    console.info((result2 as any).content?.substring(0, 200));
    console.info('---\n');
  } catch (error: any) {
    console.error('Error reading file:', error.message);
  }
}

readExample();
