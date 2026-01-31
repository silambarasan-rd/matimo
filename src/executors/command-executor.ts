import { spawn } from 'child_process';
import { ToolDefinition } from '../core/schema';

/**
 * CommandExecutor - Executes shell commands
 * Handles parameter templating, timeouts, and error capture
 */

export class CommandExecutor {
  private cwd?: string;

  constructor(cwd?: string) {
    this.cwd = cwd;
  }

  /**
   * Execute a tool that runs a shell command
   */
  async execute(tool: ToolDefinition, params: Record<string, unknown>): Promise<unknown> {
    if (tool.execution.type !== 'command') {
      throw new Error('Tool execution type is not command');
    }

    const { command, args = [], timeout = 30000 } = tool.execution;
    const startTime = Date.now();

    // Implement parameter templating
    const templatedCommand = this.templateString(command, params);
    const templatedArgs = args.map((arg) => this.templateString(arg, params));

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spawnOptions: any = {
        stdio: ['pipe', 'pipe', 'pipe'],
      };

      // Set working directory if provided
      if (this.cwd) {
        spawnOptions.cwd = this.cwd;
      }

      const child = spawn(templatedCommand, templatedArgs, spawnOptions);

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      // Set up timeout
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
      }, timeout);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        if (timedOut) {
          resolve({
            success: false,
            error: 'timeout',
            exitCode: -1,
            duration,
          });
        } else {
          const exitCode = code || 0;
          const success = exitCode === 0;

          resolve({
            success,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode,
            duration,
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        const duration = Date.now() - startTime;

        resolve({
          success: false,
          error: error.message,
          exitCode: -1,
          duration,
        });
      });
    });
  }

  /**
   * Replace parameter placeholders in a string
   */
  private templateString(str: string, params: Record<string, unknown>): string {
    let result = str;
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  }
}

export default CommandExecutor;
