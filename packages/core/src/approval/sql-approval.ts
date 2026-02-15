/**
 * SQL Approval Manager
 *
 * Similar API to PathApprovalManager but focused on SQL approval decisions.
 * Supports permanent approvals via `MATIMO_SQL_APPROVED_PATTERNS` (comma-separated)
 * and an interactive `ApprovalCallback` for runtime approval.
 */
import { MatimoError, ErrorCode } from '../errors/matimo-error';

export type SQLMode = 'read' | 'write';

export interface SQLApprovalCallback {
  (sql: string, mode: SQLMode): Promise<boolean>;
}

export class SQLApprovalManager {
  private permanentApprovals: string[] = [];
  private approvalCallback: SQLApprovalCallback | null = null;
  private runtimeCache: Map<string, boolean> = new Map();

  constructor() {
    const env = process.env.MATIMO_SQL_APPROVED_PATTERNS;
    if (env) {
      this.permanentApprovals = env
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  setApprovalCallback(cb: SQLApprovalCallback): void {
    this.approvalCallback = cb;
  }

  approveForSession(sqlSignature: string): void {
    const key = sqlSignature.trim();
    this.runtimeCache.set(key, true);
  }

  clearRuntimeCache(): void {
    this.runtimeCache.clear();
  }

  getStats() {
    return {
      permanentApprovalsCount: this.permanentApprovals.length,
      runtimeApprovalsCount: this.runtimeCache.size,
    };
  }

  private sqlMatchesPattern(sql: string, pattern: string): boolean {
    try {
      const re = new RegExp(pattern, 'i');
      return re.test(sql);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // treat pattern as literal substring if invalid regex
      return sql.toLowerCase().includes(pattern.toLowerCase());
    }
  }

  async isApproved(sql: string, mode: SQLMode = 'write'): Promise<boolean> {
    const key = sql.trim();

    const cached = this.runtimeCache.get(key);
    if (cached === true) return true;
    if (cached === false) return false;

    // permanent approvals
    if (this.permanentApprovals.some((p) => this.sqlMatchesPattern(sql, p))) {
      return true;
    }

    // auto-approve env var (useful in CI)
    if (process.env.MATIMO_SQL_AUTO_APPROVE === 'true') {
      this.runtimeCache.set(key, true);
      return true;
    }

    if (!this.approvalCallback) {
      throw new MatimoError(
        'SQL approval required but no approval callback set',
        ErrorCode.EXECUTION_FAILED,
        {
          hint: 'Set SQL approval callback with getSQLApprovalManager().setApprovalCallback() or set MATIMO_SQL_APPROVED_PATTERNS / MATIMO_SQL_AUTO_APPROVE',
        }
      );
    }

    const approved = await this.approvalCallback(sql, mode);
    this.runtimeCache.set(key, approved);
    return approved;
  }
}

let globalManager: SQLApprovalManager | null = null;

export function getSQLApprovalManager(): SQLApprovalManager {
  if (!globalManager) globalManager = new SQLApprovalManager();
  return globalManager;
}

export function setSQLApprovalManager(m: SQLApprovalManager): void {
  globalManager = m;
}

export default SQLApprovalManager;
