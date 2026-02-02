import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'js-yaml';
import { ToolDefinition, validateToolDefinition } from './schema';

/**
 * Tool Loader - Loads and validates YAML/JSON tool definitions
 * Implements TDD pattern: test failures guide implementation
 */

export class ToolLoader {
  /**
   * Load a single tool from a YAML or JSON file
   * @param filePath - Path to tool definition file
   * @returns Validated tool definition
   * @throws {Error} If file not found or invalid schema
   */
  loadToolFromFile(filePath: string): ToolDefinition {
    // Read file
    if (!fs.existsSync(filePath)) {
      throw new Error(`Tool file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse based on file extension
    let parsed: unknown;
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.yaml' || ext === '.yml') {
      parsed = YAML.load(content);
    } else if (ext === '.json') {
      parsed = JSON.parse(content);
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .yaml or .json`);
    }

    // Validate against schema
    try {
      return validateToolDefinition(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid tool definition in ${filePath}:\n${message}`);
    }
  }

  /**
   * Load all tools from a directory
   * @param dirPath - Path to directory containing tool files
   * @returns Map of tool names to definitions
   * @note Prefers definition.yaml/definition.json over tool.yaml/tool.json
   */
  loadToolsFromDirectory(dirPath: string): Map<string, ToolDefinition> {
    const tools = new Map<string, ToolDefinition>();

    if (!fs.existsSync(dirPath)) {
      throw new Error(`Tools directory not found: ${dirPath}`);
    }

    // Recursively find all definition files (definition.yaml/definition.json preferred)
    // Also finds tool.yaml/tool.json for backwards compatibility
    const findToolFiles = (dir: string): string[] => {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          files.push(...findToolFiles(fullPath));
        } else if (
          entry.isFile() &&
          (/^definition\.(yaml|yml|json)$/.test(entry.name) ||
            /^tool\.(yaml|yml|json)$/.test(entry.name))
        ) {
          files.push(fullPath);
        }
      }

      return files;
    };

    const toolFiles = findToolFiles(dirPath);

    for (const file of toolFiles) {
      try {
        const tool = this.loadToolFromFile(file);
        // Don't add if we already have this tool (definition.yaml takes precedence)
        if (!tools.has(tool.name)) {
          tools.set(tool.name, tool);
        }
      } catch {
        // Skip files that fail validation - they may not be tool definitions
        // (e.g., provider definitions are in tools/ directory but are not tools)
      }
    }

    return tools;
  }

  /**
   * Load a tool from a JSON object
   * @param data - Tool definition as object
   * @returns Validated tool definition
   */
  loadToolFromObject(data: unknown): ToolDefinition {
    return validateToolDefinition(data);
  }
}

export default ToolLoader;
