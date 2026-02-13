import { MatimoInstance, setGlobalMatimoInstance, tool } from '@matimo/core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  console.info('=== Read Tool - Decorator Pattern ===\n');

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
  }
}

decoratorExample();
