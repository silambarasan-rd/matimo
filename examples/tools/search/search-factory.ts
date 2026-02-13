import { MatimoInstance } from '@matimo/core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Example: Search tool using factory pattern
 * Demonstrates searching files for patterns and content
 */
async function searchExample() {
  // Initialize Matimo with autoDiscover to find all tools (core + providers)
  const matimo = await MatimoInstance.init({ autoDiscover: true });

  console.info('=== Search Tool - Factory Pattern ===\n');

  // Get the workspace root (parent of examples directory)
  // File is in examples/tools/search/, so go up 3 levels
  const workspaceRoot = path.resolve(__dirname, '../../..');

  try {
    // Example 1: Search for pattern in TypeScript files
    console.info('1. Searching for "import" in examples\n');
    const result1 = await matimo.execute('search', {
      query: 'import',
      directory: path.join(workspaceRoot, 'examples/tools'),
      filePattern: '*.ts',
      maxResults: 5,
    });

    console.info('Total matches:', (result1 as any).totalMatches);
    console.info('Matches found:', (result1 as any).matches?.length);
    if ((result1 as any).matches) {
      (result1 as any).matches.slice(0, 3).forEach((match: any) => {
        console.info(`  - ${match.filePath}:${match.lineNumber}: ${match.lineContent}`);
      });
    }
    console.info('---\n');

    // Example 2: Search for function definitions
    console.info('2. Searching for function definitions\n');
    const result2 = await matimo.execute('search', {
      query: 'export function',
      directory: path.join(workspaceRoot, 'packages/core/src'),
      filePattern: '*.ts',
      maxResults: 10,
    });
    console.info('Total matches:', (result2 as any).totalMatches);
    console.info('Matches found:', (result2 as any).matches?.length);
    console.info('---\n');

    // Example 3: Search in specific directory with regex
    console.info('3. Searching for "console.info" patterns\n');
    const result3 = await matimo.execute('search', {
      query: 'console\\.info',
      directory: path.join(workspaceRoot, 'packages/core/src'),
      filePattern: '*.ts',
      isRegex: true,
      maxResults: 5,
    });
    console.info('Total matches:', (result3 as any).totalMatches);
    console.info('Matches found:', (result3 as any).matches?.length);
    console.info('---\n');
  } catch (error: any) {
    console.error('Error searching files:', error.message);
  }
}

searchExample();
