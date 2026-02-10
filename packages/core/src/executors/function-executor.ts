import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';
import axios from 'axios';
import { ToolDefinition } from '../core/schema';
import { MatimoError, ErrorCode } from '../errors/matimo-error';

/**
 * FunctionExecutor - Executes async functions
 * Supports functions defined in:
 * 1. Embedded code in tool YAML (legacy)
 * 2. Colocated .ts files (recommended)
 *
 * For .ts files, the tool directory structure should be:
 * tools/provider/tool-name/
 * ├── definition.yaml
 * └── tool-name.ts (exports default async function)
 */
export class FunctionExecutor {
  private toolsPath: string;

  constructor(toolsPath?: string) {
    this.toolsPath = toolsPath || process.cwd();
  }

  /**
   * Execute a tool that runs an async function
   * Supports both embedded code and external .ts/.js files
   */
  async execute(tool: ToolDefinition, params: Record<string, unknown>): Promise<unknown> {
    if (tool.execution.type !== 'function') {
      throw new MatimoError('Tool execution type is not function', ErrorCode.EXECUTION_FAILED, {
        expectedType: 'function',
        actualType: tool.execution.type,
      });
    }

    const { code, timeout = 30000 } = tool.execution;
    const startTime = Date.now();

    if (!code || code.trim().length === 0) {
      throw new MatimoError('Function code is empty', ErrorCode.EXECUTION_FAILED, {
        toolName: tool.name,
      });
    }

    return new Promise((resolve) => {
      let timedOut = false;
      let settled = false;

      // Set up timeout that properly rejects
      const timer = setTimeout(() => {
        timedOut = true;
        if (!settled) {
          settled = true;
          resolve({
            success: false,
            error: 'Function execution timeout',
            duration: Date.now() - startTime,
          });
        }
      }, timeout);

      const cleanup = () => {
        clearTimeout(timer);
      };

      const handleError = (error: unknown) => {
        cleanup();
        if (!settled) {
          settled = true;
          resolve({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - startTime,
          });
        }
      };

      const handleSuccess = (data: unknown) => {
        cleanup();
        if (!settled) {
          settled = true;
          if (timedOut) {
            resolve({
              success: false,
              error: 'Function execution timeout',
              duration: Date.now() - startTime,
            });
          } else {
            resolve(data);
          }
        }
      };

      try {
        // Check if code is a file path (starts with ./ or contains .ts or .js)
        if (code.includes('.ts') || code.includes('.js') || code.startsWith('./')) {
          // Load from external file using dynamic import()
          // This works with TypeScript via ESM import
          const toolName = tool.name; // e.g., "database-query"

          // Compute tool directory: tools/{provider}/{tool-name}/
          let toolDir: string;
          if (toolName.includes('-')) {
            const parts = toolName.split('-');
            const provider = parts[0]; // First part is provider (e.g., "database", "slack")
            toolDir = path.join(this.toolsPath, provider, toolName);
          } else {
            toolDir = path.join(this.toolsPath, toolName);
          }

          const absolutePath = path.resolve(toolDir, code);
          const fileUrl = pathToFileURL(absolutePath).href;

          // Use dynamic import() for ESM/TypeScript compatibility with robust URL handling
          import(fileUrl)
            .then((module) => {
              const fn = (module.default || module) as (
                input: Record<string, unknown>
              ) => Promise<unknown>;
              const result = fn(params);

              // Handle both Promise and non-Promise returns
              if (result instanceof Promise) {
                result.then(handleSuccess).catch(handleError);
              } else {
                handleSuccess(result);
              }
            })
            .catch(handleError);
        } else {
          // Execute embedded code (legacy) - create function from string
          // In ESM modules, require is not available by default
          // We pass a safe require function that embedded code can use
          const functionBody = `return (${code})`;
          const fn = new Function(functionBody)() as (
            input: Record<string, unknown>,
            config: unknown,
            fs: unknown,
            pathModule: unknown,
            axios: unknown,
            require: NodeRequire | undefined
          ) => Promise<unknown>;
          // Pass undefined for require in ESM - embedded code should use import syntax
          const result = fn(params, {}, fs, path, axios, undefined);

          // Handle both Promise and non-Promise returns
          if (result instanceof Promise) {
            result.then(handleSuccess).catch(handleError);
          } else {
            handleSuccess(result);
          }
        }
      } catch (error) {
        handleError(error);
      }
    });
  }
}

export default FunctionExecutor;
