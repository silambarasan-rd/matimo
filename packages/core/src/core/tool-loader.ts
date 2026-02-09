import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'js-yaml';
import { ToolDefinition, validateToolDefinition } from './schema';
import { MatimoError, ErrorCode } from '../errors/matimo-error';

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
      throw new MatimoError(`Tool file not found: ${filePath}`, ErrorCode.FILE_NOT_FOUND, {
        filePath,
      });
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
      throw new MatimoError(
        `Unsupported file format: ${ext}. Use .yaml or .json`,
        ErrorCode.INVALID_SCHEMA,
        {
          filePath,
          fileExtension: ext,
        }
      );
    }

    // Validate against schema
    try {
      return validateToolDefinition(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new MatimoError(
        `Invalid tool definition in ${filePath}:\n${message}`,
        ErrorCode.INVALID_SCHEMA,
        {
          filePath,
          originalError: message,
        }
      );
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
      throw new MatimoError(`Tools directory not found: ${dirPath}`, ErrorCode.FILE_NOT_FOUND, {
        directoryPath: dirPath,
      });
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

  /**
   * Auto-discover tool packages in node_modules/@matimo/*
   * @returns Array of paths to tool directories
   */
  autoDiscoverPackages(): string[] {
    try {
      // Get the node_modules path (handle both workspace and normal installations)
      const nodeModulesPath = this.getNodeModulesPath();

      if (!nodeModulesPath || !fs.existsSync(nodeModulesPath)) {
        return [];
      }

      const matimoScopePath = path.join(nodeModulesPath, '@matimo');

      if (!fs.existsSync(matimoScopePath)) {
        return [];
      }

      // Scan @matimo/* directories for tools/
      const discoveredPaths: string[] = [];
      const entries = fs.readdirSync(matimoScopePath, { withFileTypes: true });

      for (const entry of entries) {
        // Handle both real directories and symlinks
        // isDirectory() returns false for symlinks, so we need to check the actual target
        let isDir = entry.isDirectory();
        if (!isDir && !entry.name.startsWith('.')) {
          try {
            // Use statSync to follow symlinks
            isDir = fs.statSync(path.join(matimoScopePath, entry.name)).isDirectory();
          } catch {
            // If statSync fails, skip this entry
            continue;
          }
        }

        if (isDir && !entry.name.startsWith('.')) {
          const toolsPath = path.join(matimoScopePath, entry.name, 'tools');

          if (fs.existsSync(toolsPath)) {
            discoveredPaths.push(toolsPath);
          }
        }
      }

      return discoveredPaths;
    } catch {
      // If auto-discovery fails (e.g., in development), return empty array
      return [];
    }
  }

  /**
   * Get node_modules path intelligently
   * Works in both normal and monorepo installations
   */
  private getNodeModulesPath(): string | null {
    try {
      // Start from current working directory and search upwards
      let currentPath = process.cwd();
      for (let i = 0; i < 15; i++) {
        const nodeModules = path.join(currentPath, 'node_modules');
        if (fs.existsSync(nodeModules)) {
          // Verify @matimo scope exists
          const matimoScope = path.join(nodeModules, '@matimo');
          if (fs.existsSync(matimoScope)) {
            return nodeModules;
          }
        }
        currentPath = path.dirname(currentPath);
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Load tools from multiple directories
   * @param dirPaths - Array of directory paths
   * @returns Combined map of all tools
   */
  loadToolsFromMultiplePaths(dirPaths: string[]): Map<string, ToolDefinition> {
    const allTools = new Map<string, ToolDefinition>();

    for (const dirPath of dirPaths) {
      try {
        const tools = this.loadToolsFromDirectory(dirPath);
        for (const [name, definition] of tools) {
          // Later paths can override earlier ones
          allTools.set(name, definition);
        }
      } catch {
        // Continue with other paths even if one fails
        // This allows optional tool packages
      }
    }

    return allTools;
  }
}

export default ToolLoader;
