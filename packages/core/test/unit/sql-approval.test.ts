import { SQLApprovalManager } from '../../src/approval/sql-approval';

describe('SQLApprovalManager', () => {
  beforeEach(() => {
    delete process.env.MATIMO_SQL_APPROVED_PATTERNS;
    delete process.env.MATIMO_SQL_AUTO_APPROVE;
  });

  it('auto-approves when MATIMO_SQL_AUTO_APPROVE=true', async () => {
    process.env.MATIMO_SQL_AUTO_APPROVE = 'true';
    const m = new SQLApprovalManager();
    const ok = await m.isApproved('DROP TABLE users;', 'write');
    expect(ok).toBe(true);
  });

  it('honors permanent patterns', async () => {
    process.env.MATIMO_SQL_APPROVED_PATTERNS = 'SELECT.*FROM users';
    const m = new SQLApprovalManager();
    const ok = await m.isApproved('SELECT id FROM users WHERE id=1', 'read');
    expect(ok).toBe(true);
  });

  it('uses approval callback when set', async () => {
    const m = new SQLApprovalManager();
    let called = false;
    m.setApprovalCallback(async (_sql: string) => {
      called = true;
      return true;
    });
    const ok = await m.isApproved('DELETE FROM users WHERE id=1', 'write');
    expect(called).toBe(true);
    expect(ok).toBe(true);
  });

  it('caches session approvals', async () => {
    const m = new SQLApprovalManager();
    m.approveForSession('DELETE FROM users WHERE id=1');
    const ok = await m.isApproved('DELETE FROM users WHERE id=1', 'write');
    expect(ok).toBe(true);
  });
});
