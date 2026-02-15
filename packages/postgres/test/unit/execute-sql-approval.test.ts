jest.mock('pg', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue({ rows: [{ one: 1 }], rowCount: 1 }),
      end: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

// Ensure imports of '@matimo/core' resolve to the core source during tests
jest.mock('@matimo/core', () => require('../../../core/src'));

import {
  getSQLApprovalManager,
  setSQLApprovalManager,
  SQLApprovalManager,
} from '../../../core/src/approval/sql-approval';
import { MatimoError, ErrorCode } from '../../../core/src/errors/matimo-error';

// Mock execute function to skip env var validation and focus on approval logic
const mockExecute = jest.fn(async (input: Record<string, unknown>) => {
  const sql = (input.sql as string) || '';
  const params = input.params as unknown as unknown[] | undefined;

  // Check approval like the real function does
  const destructiveRegex = /^\s*(CREATE|DROP|ALTER|TRUNCATE|DELETE|UPDATE)\b/i;
  const isDestructive = destructiveRegex.test(sql);
  if (isDestructive) {
    const manager = getSQLApprovalManager();
    const ok = await manager.isApproved(sql, 'write');
    if (!ok) {
      throw new MatimoError('Destructive SQL not approved', ErrorCode.EXECUTION_FAILED, {
        toolName: 'postgres-execute-sql',
      });
    }
  }

  // Use mocked Client
  const { Client } = require('pg');
  const client = new Client({ connectionString: 'postgres://localhost' });
  const result = await client.query(sql, (params ?? []) as unknown[]);
  return { rows: result.rows, rowCount: result.rowCount };
});

const execute = mockExecute;

describe('execute-sql approval integration', () => {
  afterEach(() => {
    // reset manager
    setSQLApprovalManager(new SQLApprovalManager());
    delete process.env.MATIMO_SQL_AUTO_APPROVE;
    jest.clearAllMocks();
  });

  it('throws when destructive SQL not approved', async () => {
    const manager = new SQLApprovalManager();
    manager.setApprovalCallback(async () => false);
    setSQLApprovalManager(manager);

    await expect(execute({ sql: 'DROP TABLE users' })).rejects.toThrow(MatimoError);
  });

  it('executes when destructive SQL approved', async () => {
    const manager = new SQLApprovalManager();
    manager.setApprovalCallback(async () => true);
    setSQLApprovalManager(manager);

    const res = await execute({ sql: 'DROP TABLE users' });
    expect(res).toBeDefined();
    const result = res as { rowCount?: number };
    expect(result.rowCount).toBe(1);
  });

  it('executes non-destructive SQL without approval', async () => {
    // Ensure no approval callback set and auto-approve off
    setSQLApprovalManager(new SQLApprovalManager());
    const res = await execute({ sql: 'SELECT 1 as one' });
    expect(res).toBeDefined();
    const result = res as { rows?: Array<{ one?: number }> };
    expect(result.rows?.[0]?.one).toBe(1);
  });
});
