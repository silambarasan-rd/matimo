/**
 * Execute Tool - Execute shell commands with full output capture
 * LangChain-style: uses exec() directly from same process
 * Cross-platform: Windows (cmd.exe), Unix/Linux/Mac (sh/bash)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { MatimoError, ErrorCode } from '../../src/errors/matimo-error';

const execAsync = promisify(exec);

interface ExecuteParams {
  command: string;
  cwd?: string;
  timeout?: number;
}

interface ExecuteResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  command: string;
  duration: number;
}

/**
 * Execute a shell command and return structured output
 * Pattern based on LangChain.js exec/execSync approach
 */
export default async function executeCommand(
  params: ExecuteParams
): Promise<ExecuteResult> {
  const { command, cwd, timeout = 30000 } = params;
  const startTime = Date.now();

  if (!command || command.trim().length === 0) {
    throw new MatimoError('Command required', ErrorCode.INVALID_PARAMETER, {
      reason: 'No command provided',
    });
  }

  try {
    // exec() auto-selects shell: cmd.exe on Windows, /bin/sh on Unix
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    const duration = Date.now() - startTime;

    // Convert Buffer to string if needed
    const stdoutStr = typeof stdout === 'string' ? stdout : (stdout as unknown ? String(stdout) : '');
    const stderrStr = typeof stderr === 'string' ? stderr : (stderr as unknown ? String(stderr) : '');

    return {
      success: true,
      exitCode: 0,
      stdout: stdoutStr.trim(),
      stderr: stderrStr.trim(),
      command,
      duration,
    };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    
    // Type guard for error object
    const errorObj = error as Record<string, unknown> & { 
      killed?: boolean;
      signal?: string;
      code?: number;
      stdout?: string;
      stderr?: string;
    };
    
    const isTimeout = errorObj.killed || errorObj.signal === 'SIGTERM';

    // If it's already a MatimoError, re-throw it
    if (error instanceof MatimoError) {
      throw error;
    }

    // Convert Buffer to string if needed
    const stdoutStr = typeof errorObj.stdout === 'string' ? errorObj.stdout : (errorObj.stdout ? String(errorObj.stdout) : '');
    const stderrStr = typeof errorObj.stderr === 'string' ? errorObj.stderr : (errorObj.stderr ? String(errorObj.stderr) : '');

    // For command execution failures, return structured result (not throw)
    // This allows the agent to see what went wrong
    return {
      success: false,
      exitCode: isTimeout ? -1 : (errorObj.code || 1),
      stdout: stdoutStr.trim(),
      stderr: stderrStr.trim(),
      command,
      duration,
    };
  }
}
