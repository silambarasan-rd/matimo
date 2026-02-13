/**
 * Path Approval Manager
 * Interactive approval system for file system operations (read, edit, search)
 *
 * Users implement approval storage (file, DB, etc.) via callback.
 * Matimo handles the approval flow and validation.
 */

import path from 'path';
import { MatimoError, ErrorCode } from '../errors/matimo-error';

/**
 * Simple glob pattern matcher (native implementation)
 * Supports: * (any chars in path segment), ** (any number of segments), ? (single char)
 */
function matchesGlobPattern(filePath: string, pattern: string): boolean {
  // Resolve file path to absolute for comparison
  const resolvedPath = path.resolve(filePath);

  // For patterns: if it's absolute, use as is; if relative, resolve from cwd
  const patternToCheck =
    pattern.startsWith('/') || pattern.match(/^[A-Z]:/i)
      ? pattern // Already absolute
      : path.resolve(pattern); // Relative pattern, resolve from cwd

  // Normalize both to forward slashes for consistent regex
  const normalizedPath = resolvedPath.split(path.sep).join('/');
  const normalizedPattern = patternToCheck.split(path.sep).join('/');

  // Convert glob pattern to regex using placeholders to avoid interference
  const regexPattern = normalizedPattern
    .replace(/\./g, '___DOT___') // Placeholder for .
    .replace(/\*\*\//g, '___DBL_STAR_SLASH___') // Placeholder for **/
    .replace(/\/\*\*/g, '___SLASH_DBL_STAR___') // Placeholder for /**
    .replace(/\*\*/g, '___DBL_STAR___') // Placeholder for **
    .replace(/\*/g, '___STAR___') // Placeholder for *
    .replace(/\?/g, '___QUESTION___') // Placeholder for ?
    // Now replace placeholders with regex patterns
    .replace(/___DBL_STAR_SLASH___/g, '(?:.+/)?') // **/ matches zero or more path segments
    .replace(/___SLASH_DBL_STAR___/g, '(?:/.+)?') // /** matches zero or more path segments
    .replace(/___DBL_STAR___/g, '.*') // ** matches anything
    .replace(/___STAR___/g, '[^/]*') // * matches any chars except /
    .replace(/___QUESTION___/g, '[^/]') // ? matches single char except /
    .replace(/___DOT___/g, '\\.'); // . becomes literal dot

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(normalizedPath);
}

/**
 * Approval callback — user implements this to handle interactive approval
 * Can store approvals in file, DB, memory, etc.
 */
export interface ApprovalCallback {
  (requestPath: string, mode: 'read' | 'write' | 'search'): Promise<boolean>;
}

/**
 * Path Approval Manager
 * Validates file paths against permanent and temporary approvals
 */
export class PathApprovalManager {
  private permanentApprovals: string[] = [];
  private approvalCallback: ApprovalCallback | null = null;
  private runtimeCache: Map<string, boolean> = new Map();

  constructor() {
    // Load permanent approvals from environment variable
    const allowedPathsEnv = process.env.MATIMO_EDIT_ALLOWED_PATHS;
    if (allowedPathsEnv) {
      this.permanentApprovals = allowedPathsEnv.split(',').map((p) => p.trim());
    }
  }

  /**
   * Set the approval callback for interactive approvals
   * Users implement this to prompt and store approvals
   *
   * @example
   * ```typescript
   * manager.setApprovalCallback(async (filePath, mode) => {
   *   const approved = await promptUser(`Allow ${mode} of ${filePath}?`);
   *   if (approved) {
   *     await fs.appendFile('.matimo-approvals', `${filePath}\n`);
   *   }
   *   return approved;
   * });
   * ```
   */
  setApprovalCallback(callback: ApprovalCallback): void {
    this.approvalCallback = callback;
  }

  /**
   * Pre-approve a path for the current runtime session
   * Useful for programmatic approval (e.g., called from tests or API)
   */
  approvePathForSession(filePath: string): void {
    const normalized = path.resolve(filePath);
    this.runtimeCache.set(normalized, true);
  }

  /**
   * Check if a path is approved for the given operation
   * - Returns true if path matches permanent approvals
   * - Returns true if path was approved in current runtime session
   * - Calls approval callback if interactive mode enabled
   * - Returns false if user denies approval
   *
   * @throws {MatimoError} If approval callback not set and interactive approval needed
   */
  async isApproved(
    filePath: string,
    mode: 'read' | 'write' | 'search' = 'write'
  ): Promise<boolean> {
    const normalized = path.resolve(filePath);

    // Check runtime cache first
    const cached = this.runtimeCache.get(normalized);
    if (cached === true) {
      return true;
    }
    if (cached === false) {
      return false;
    }

    // Check permanent approvals
    if (this.isPermanentlyApproved(normalized)) {
      return true;
    }

    // If no callback set, deny access
    if (!this.approvalCallback) {
      throw new MatimoError(
        'Path approval required but no approval callback set',
        ErrorCode.EXECUTION_FAILED,
        {
          filePath: normalized,
          mode,
          hint: 'Set approval callback with manager.setApprovalCallback() or add path to MATIMO_EDIT_ALLOWED_PATHS',
        }
      );
    }

    // Ask for interactive approval
    const approved = await this.approvalCallback(normalized, mode);

    // Cache the decision for this session
    this.runtimeCache.set(normalized, approved);

    return approved;
  }

  /**
   * Check if a path matches any permanent approvals
   * Supports glob patterns (*, **, ?)
   */
  private isPermanentlyApproved(filePath: string): boolean {
    const normalized = path.resolve(filePath);

    return this.permanentApprovals.some((pattern) => {
      // Handle both absolute paths and glob patterns
      if (pattern.includes('*') || pattern.includes('?')) {
        // Pattern contains wildcards, use glob matching
        return matchesGlobPattern(normalized, pattern);
      }
      // Exact match or directory match (no wildcards)
      const approvedPath = path.resolve(pattern);
      return normalized === approvedPath || normalized.startsWith(approvedPath + path.sep);
    });
  }

  /**
   * Clear runtime cache (e.g., at start of new session)
   */
  clearRuntimeCache(): void {
    this.runtimeCache.clear();
  }

  /**
   * Get approval statistics for logging/audit
   */
  getStats(): {
    permanentApprovalsCount: number;
    runtimeApprovalsCount: number;
  } {
    return {
      permanentApprovalsCount: this.permanentApprovals.length,
      runtimeApprovalsCount: this.runtimeCache.size,
    };
  }
}

// Singleton instance
let globalManager: PathApprovalManager | null = null;

/**
 * Get or create global path approval manager
 */
export function getPathApprovalManager(): PathApprovalManager {
  if (!globalManager) {
    globalManager = new PathApprovalManager();
  }
  return globalManager;
}

/**
 * Set global path approval manager (for testing or custom initialization)
 */
export function setPathApprovalManager(manager: PathApprovalManager): void {
  globalManager = manager;
}
