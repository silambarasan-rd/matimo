import { MatimoInstance, setGlobalMatimoInstance, tool } from '@matimo/core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Example: Search tool using @tool decorator pattern
 * Demonstrates class-based file search with automatic decoration
 */
class FileSearcher {
  @tool('search')
  async findPattern(
    query: string,
    directory: string,
    filePattern: string,
    maxResults?: number
  ): Promise<unknown> {
    // Decorator automatically intercepts and executes via Matimo with:
    // { query, directory, filePattern, maxResults }
    // Positional args map to parameters in tool definition order
    return undefined;
  }

  @tool('search')
  async searchInDirectory(
    query: string,
    directory: string,
    filePattern?: string
  ): Promise<unknown> {
    // Decorator automatically intercepts and executes via Matimo with:
    // { query, directory, filePattern }
    return undefined;
  }

  @tool('search')
  async regexSearch(
    query: string,
    directory: string,
    filePattern: string,
    isRegex: boolean = true,
    maxResults?: number
  ): Promise<unknown> {
    // Decorator automatically intercepts and executes via Matimo with:
    // { query, directory, filePattern, isRegex, maxResults }
    return undefined;
  }
}

async function decoratorExample() {
  // Set up decorator support with autoDiscover
  const matimo = await MatimoInstance.init({ autoDiscover: true });
  setGlobalMatimoInstance(matimo);

  console.info('=== Search Tool - Decorator Pattern ===\n');

  // Get the workspace root (parent of examples directory)
  // File is in examples/tools/search/, so go up 3 levels
  const workspaceRoot = path.resolve(__dirname, '../../..');

  const searcher = new FileSearcher();

  try {
    // Example 1: Find pattern through decorated method
    console.info('1. Finding "export" in TypeScript files\n');
    const result1 = await searcher.findPattern(
      'export',
      path.join(workspaceRoot, 'packages/core/src'),
      '*.ts',
      5
    );
    console.info('Total matches:', (result1 as any).totalMatches);
    console.info('Matches found:', (result1 as any).matches?.length);
    console.info('---\n');

    // Example 2: Search in specific directory
    console.info('2. Searching in examples directory\n');
    const result2 = await searcher.searchInDirectory(
      'async',
      path.join(workspaceRoot, 'examples/tools'),
      '*.ts'
    );
    console.info('Total matches:', (result2 as any).totalMatches);
    console.info('Matches found:', (result2 as any).matches?.length);
    console.info('---\n');

    // Example 3: Regex search
    console.info('3. Using regex to find patterns\n');
    const result3 = await searcher.regexSearch(
      'console\\.info',
      path.join(workspaceRoot, 'packages/core/src'),
      '*.ts',
      true,
      5
    );
    console.info('Total matches:', (result3 as any).totalMatches);
    console.info('Matches found:', (result3 as any).matches?.length);
    console.info('---\n');
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

decoratorExample();
