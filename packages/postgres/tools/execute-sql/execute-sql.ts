import { Client } from 'pg';
import { MatimoError, ErrorCode, getSQLApprovalManager } from '@matimo/core';

export default async function (input: Record<string, unknown>) {
  const sql = (input.sql as string) || '';
  const params = (input.params as unknown) as unknown[] | undefined;

  if (!sql || sql.trim().length === 0) {
    throw new MatimoError('Missing SQL statement', ErrorCode.EXECUTION_FAILED, {
      toolName: 'postgres-execute-sql',
    });
  }

  // Build connection string from either MATIMO_POSTGRES_URL or separate env vars
  const envUrl = process.env.MATIMO_POSTGRES_URL;
  let connectionString: string | undefined = envUrl;

  // Detect destructive SQL and require approval
  const destructiveRegex = /^\s*(CREATE|DROP|ALTER|TRUNCATE|DELETE|UPDATE)\b/i;
  const isDestructive = destructiveRegex.test(sql);
  if (isDestructive) {
    const manager = getSQLApprovalManager();
    try {
      const ok = await manager.isApproved(sql, 'write');
      if (!ok) {
        throw new MatimoError('Destructive SQL not approved', ErrorCode.EXECUTION_FAILED, {
          toolName: 'postgres-execute-sql',
          hint:
            'Destructive SQL requires approval. Use getSQLApprovalManager().setApprovalCallback() or set MATIMO_SQL_APPROVED_PATTERNS / MATIMO_SQL_AUTO_APPROVE=true',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      // Re-throw MatimoError or wrap
      if (e instanceof MatimoError) throw e;
      throw new MatimoError('SQL approval check failed', ErrorCode.EXECUTION_FAILED, {
        toolName: 'postgres-execute-sql',
        details: { message: e?.message || String(e) },
      });
    }
  }

  if (!connectionString) {
    const host = process.env.MATIMO_POSTGRES_HOST;
    const port = process.env.MATIMO_POSTGRES_PORT || '5432';
    const user = process.env.MATIMO_POSTGRES_USER;
    const password = process.env.MATIMO_POSTGRES_PASSWORD;
    const database = process.env.MATIMO_POSTGRES_DB;

    if (host && user && password && database) {
      // Build a simple connection string. Do not log secrets.
      connectionString = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
        password
      )}@${host}:${port}/${database}`;
    }
  }

  if (!connectionString) {
    throw new MatimoError(
      'Postgres connection information not provided. Set MATIMO_POSTGRES_URL or MATIMO_POSTGRES_HOST/PORT/USER/PASSWORD/DB',
      ErrorCode.EXECUTION_FAILED,
      { toolName: 'postgres-execute-sql' }
    );
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.query(sql, (params ?? []) as any);
    return { rows: result.rows, rowCount: result.rowCount };
  } catch (err) {
    // Extract meaningful error message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalError = (err as any)?.message || String(err);
    const details: Record<string, unknown> = {
      originalMessage: originalError,
    };
    // Check if it's a connection error vs query error
    if (originalError.includes('ECONNREFUSED')) {
      details.hint = 'Connection refused - is Postgres running at the configured host/port?';
    } else if (originalError.includes('role') && originalError.includes('does not exist')) {
      details.hint = 'Database user does not exist - check MATIMO_POSTGRES_USER env var';
    } else if (originalError.includes('database') && originalError.includes('does not exist')) {
      details.hint = 'Database does not exist - check MATIMO_POSTGRES_DB env var';
    }
    // Wrap errors to avoid leaking secrets
    throw new MatimoError(`Postgres query failed: ${originalError}`, ErrorCode.EXECUTION_FAILED, {
      toolName: 'postgres-execute-sql',
      details,
    });
  } finally {
    try {
      await client.end();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      // ignore
    }
  }
}
