/**
 * Path Approval Manager Tests
 * Tests for native glob matching and approval flow
 */

import path from 'path';
import {
  PathApprovalManager,
  getPathApprovalManager,
  setPathApprovalManager,
} from '../../src/approval/path-approval';
import { MatimoError } from '../../src/errors/matimo-error';

describe('PathApprovalManager', () => {
  let manager: PathApprovalManager;

  beforeEach(() => {
    // Clear environment variable
    delete process.env.MATIMO_EDIT_ALLOWED_PATHS;
    manager = new PathApprovalManager();
  });

  describe('Native glob pattern matching', () => {
    it('should match exact paths', async () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/file.ts';
      manager = new PathApprovalManager();

      const approved = await manager.isApproved('/home/user/file.ts', 'write');
      expect(approved).toBe(true);
    });

    it('should match single * wildcard in filename', async () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/*.ts';
      manager = new PathApprovalManager();

      const approved = await manager.isApproved('/home/user/file.ts', 'write');
      expect(approved).toBe(true);
    });

    it('should not match * across directory separators', async () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/*.ts';
      manager = new PathApprovalManager();
      manager.setApprovalCallback(async () => false); // Deny by default

      const approved = await manager.isApproved('/home/user/src/file.ts', 'write');
      expect(approved).toBe(false);
    });

    it('should match ** for recursive paths', async () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/**/file.ts';
      manager = new PathApprovalManager();

      const approved1 = await manager.isApproved('/home/user/file.ts', 'write');
      const approved2 = await manager.isApproved('/home/user/src/file.ts', 'write');
      const approved3 = await manager.isApproved('/home/user/src/nested/file.ts', 'write');

      expect(approved1).toBe(true);
      expect(approved2).toBe(true);
      expect(approved3).toBe(true);
    });

    it('should match *.* pattern', async () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/*.*';
      manager = new PathApprovalManager();

      const approved = await manager.isApproved('/home/user/file.ts', 'write');
      expect(approved).toBe(true);
    });

    it('should match ? for single character', async () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/file?.ts';
      manager = new PathApprovalManager();
      manager.setApprovalCallback(async () => false); // Deny non-matching paths

      const approved1 = await manager.isApproved('/home/user/file1.ts', 'write');
      const approved2 = await manager.isApproved('/home/user/filea.ts', 'write');
      const approved3 = await manager.isApproved('/home/user/file12.ts', 'write');

      expect(approved1).toBe(true);
      expect(approved2).toBe(true);
      expect(approved3).toBe(false); // ? matches only one char
    });

    it('should handle multiple patterns', async () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/*.ts,/etc/config/*.conf';
      manager = new PathApprovalManager();
      manager.setApprovalCallback(async () => false); // Deny non-matching paths

      const approved1 = await manager.isApproved('/home/user/file.ts', 'write');
      const approved2 = await manager.isApproved('/etc/config/app.conf', 'write');
      const approved3 = await manager.isApproved('/home/user/file.js', 'write');

      expect(approved1).toBe(true);
      expect(approved2).toBe(true);
      expect(approved3).toBe(false);
    });
  });

  describe('Runtime session approval cache', () => {
    it('should cache approved paths for session', async () => {
      let callCount = 0;
      manager.setApprovalCallback(async () => {
        callCount++;
        return true;
      });

      const filePath = '/home/user/file.ts';

      // First call should invoke callback
      const result1 = await manager.isApproved(filePath, 'write');
      expect(result1).toBe(true);
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await manager.isApproved(filePath, 'write');
      expect(result2).toBe(true);
      expect(callCount).toBe(1); // No additional call
    });

    it('should cache rejected paths for session', async () => {
      let callCount = 0;
      manager.setApprovalCallback(async () => {
        callCount++;
        return false;
      });

      const filePath = '/home/user/file.ts';

      // First call should invoke callback and reject
      const result1 = await manager.isApproved(filePath, 'write');
      expect(result1).toBe(false);
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await manager.isApproved(filePath, 'write');
      expect(result2).toBe(false);
      expect(callCount).toBe(1); // No additional call
    });

    it('should allow programmatic approval override', async () => {
      manager.setApprovalCallback(async () => false);

      const filePath = '/home/user/file.ts';

      // First call would reject
      const result1 = await manager.isApproved(filePath, 'write');
      expect(result1).toBe(false);

      // Programmatically approve
      manager.approvePathForSession(filePath);

      // Now it should be approved
      const result2 = await manager.isApproved(filePath, 'write');
      expect(result2).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw error if no approved path and no callback', async () => {
      const filePath = '/home/user/file.ts';

      // No permanent approval, no callback set
      await expect(manager.isApproved(filePath, 'write')).rejects.toThrow(MatimoError);
    });

    it('should pass mode parameter to callback', async () => {
      const modes: Array<'read' | 'write' | 'search'> = [];
      manager.setApprovalCallback(async (filePath, mode) => {
        modes.push(mode);
        return true;
      });

      // Use different paths so they don't hit the cache
      await manager.isApproved('/home/user/file-read.ts', 'read');
      await manager.isApproved('/home/user/file-write.ts', 'write');
      await manager.isApproved('/home/user/file-search.ts', 'search');

      expect(modes).toEqual(['read', 'write', 'search']);
    });
  });

  describe('Approval statistics', () => {
    it('should count permanent approvals loaded from env', () => {
      process.env.MATIMO_EDIT_ALLOWED_PATHS = '/home/user/*.ts,/etc/config/*.conf';
      manager = new PathApprovalManager();

      const stats = manager.getStats();
      expect(stats.permanentApprovalsCount).toBe(2);
      expect(stats.runtimeApprovalsCount).toBe(0);
    });

    it('should count runtime approvals', async () => {
      manager.setApprovalCallback(async () => true);

      await manager.isApproved('/home/user/file1.ts', 'write');
      await manager.isApproved('/home/user/file2.ts', 'write');

      const stats = manager.getStats();
      expect(stats.runtimeApprovalsCount).toBe(2);
    });

    it('should clear runtime cache', async () => {
      manager.setApprovalCallback(async () => true);

      await manager.isApproved('/home/user/file.ts', 'write');
      let stats = manager.getStats();
      expect(stats.runtimeApprovalsCount).toBe(1);

      manager.clearRuntimeCache();
      stats = manager.getStats();
      expect(stats.runtimeApprovalsCount).toBe(0);
    });
  });

  describe('Directory matching', () => {
    it('should match exact directory path', async () => {
      const testDir = '/home/user/project';
      process.env.MATIMO_EDIT_ALLOWED_PATHS = testDir;
      manager = new PathApprovalManager();

      // Exact directory match
      const approved1 = await manager.isApproved(testDir, 'write');
      expect(approved1).toBe(true);

      // Subdirectory should also match
      const approved2 = await manager.isApproved(path.join(testDir, 'src', 'file.ts'), 'write');
      expect(approved2).toBe(true);
    });
  });

  describe('Global singleton management', () => {
    it('should create global manager on first call', () => {
      // Reset global state
      setPathApprovalManager(null as unknown as PathApprovalManager);

      const manager1 = getPathApprovalManager();
      expect(manager1).toBeInstanceOf(PathApprovalManager);
    });

    it('should return same instance on subsequent calls', () => {
      // Reset and get first instance
      setPathApprovalManager(null as unknown as PathApprovalManager);
      const manager1 = getPathApprovalManager();

      // Get second instance - should be the same
      const manager2 = getPathApprovalManager();

      expect(manager1).toBe(manager2);
    });

    it('should allow setting custom global manager', () => {
      const customManager = new PathApprovalManager();

      setPathApprovalManager(customManager);

      const retrievedManager = getPathApprovalManager();
      expect(retrievedManager).toBe(customManager);
    });

    it('should use set manager for approval checks', async () => {
      const customManager = new PathApprovalManager();
      customManager.setApprovalCallback(async () => true);

      setPathApprovalManager(customManager);

      const manager = getPathApprovalManager();
      const approved = await manager.isApproved('/home/user/file.ts', 'write');

      expect(approved).toBe(true);
    });
  });
});
