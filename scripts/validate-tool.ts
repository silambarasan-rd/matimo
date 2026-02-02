/**
 * Tool validation script
 * Validates all YAML tool definitions against schema
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLS_DIR = path.join(__dirname, '../tools');

/**
 * Represents a loaded tool definition from YAML
 */
interface ToolDefinition {
  name?: string;
  version?: string;
  description?: string;
  parameters?: Record<string, unknown>;
  execution?: {
    type?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Validate a single tool YAML file
 * @param filePath - Path to the tool YAML file
 * @returns true if valid, false otherwise
 */
function validateToolFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const tool = yaml.load(content) as ToolDefinition;

    // Check required fields
    const required: (keyof ToolDefinition)[] = ['name', 'version', 'description', 'parameters', 'execution'];
    const missing = required.filter((field) => !tool[field]);

    if (missing.length > 0) {
      console.error(`❌ ${filePath}: Missing fields: ${missing.join(', ')}`);
      return false;
    }

    // Check execution type
    const validExecutionTypes = ['command', 'http'];
    if (!tool.execution?.type || !validExecutionTypes.includes(tool.execution.type)) {
      console.error(`❌ ${filePath}: Invalid execution type: ${tool.execution?.type}`);
      return false;
    }

    console.log(`✅ ${filePath}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${filePath}: ${errorMessage}`);
    return false;
  }
}

/**
 * Validate all tools in the tools directory
 */
function validateTools(): void {
  console.log('Validating tools...\n');

  if (!fs.existsSync(TOOLS_DIR)) {
    console.log('Tools directory not found');
    process.exit(0);
  }

  let valid = 0;
  let invalid = 0;
  let skipped = 0;

  /**
   * Recursively find and validate all definition.yaml files
   */
  function walkDirectory(dir: string): void {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Check if this directory has definition.yaml
        const definitionFile = path.join(fullPath, 'definition.yaml');
        if (fs.existsSync(definitionFile)) {
          const result = validateToolFile(definitionFile);
          if (result) {
            valid++;
          } else {
            invalid++;
          }
        } else {
          // Recursively check subdirectories (e.g., tools/gmail/send-email/)
          walkDirectory(fullPath);
        }
      }
    });
  }

  walkDirectory(TOOLS_DIR);

  console.log(`\nResults: ${valid} valid, ${invalid} invalid, ${skipped} skipped (no definition.yaml)`);
  process.exit(invalid > 0 ? 1 : 0);
}

validateTools();

export { validateToolFile };
