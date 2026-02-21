# Unified Approval System

**Status**: ✅ Simplified & Consolidated (v0.1.0-alpha.6+)

Matimo has a **single, unified approval system** that works across all providers (GitHub, Slack, Postgres, and custom tools). Simple design: tools declare approval requirements in YAML, system auto-detects destructive keywords, single callback handles all approval requests.

## Overview

The approval system prevents accidental execution of destructive operations by:
1. **Checking YAML flag**: Tool defines `requires_approval: true` or auto-detect via destructive keywords
2. **Checking pre-approvals**: Environment variables or pre-approved patterns
3. **Requesting approval**: Single generic callback (interactive or automatic)
4. **Executing**: If approved, proceeds; if rejected, throws MatimoError

## Quick Start

### 1. Auto-Approve (CI/CD)

```bash
export MATIMO_AUTO_APPROVE=true
pnpm my-script
```

All tools requiring approval are auto-approved.

### 2. Interactive Approval (Terminal)

```typescript
import { MatimoInstance, getGlobalApprovalHandler } from '@matimo/core';

const matimo = await MatimoInstance.init({ autoDiscover: true });

const handler = getGlobalApprovalHandler();
handler.setApprovalCallback(async (request) => {
  // User sees: tool name, description, parameters
  // User decides: approve or reject
  console.info(`\nApprove ${request.toolName}?`);
  return true; // or false
});

await matimo.execute('sql-delete-user', { id: 'user123' });
```

### 3. Pre-Approve Patterns  

```bash
export MATIMO_APPROVED_PATTERNS="sql*,github-create-*"
```

Only tools matching patterns skip approval. Others are rejected if not auto-approved.

## Architecture

```
MatimoInstance.execute(toolName, params)
          ↓
   ToolDefinition loaded
          ↓
   Destructive Keywords loaded from destructive-keywords.yaml
          ↓
   ApprovalHandler.requiresApproval(tool.requires_approval, params.sql)
          ↓
  ┌─ Check YAML flag? Yes → Needs approval
  │
  ├─ Check destructive keywords from YAML config? Yes → Needs approval
  │        (Keywords loaded from destructive-keywords.yaml)
  │        Examples: CREATE, DELETE, DROP, ALTER, TRUNCATE, etc.
  │
  └─ No → Proceed without approval
          ↓
  ApprovalHandler.isPreApproved(toolName)
          ↓
  ┌─ MATIMO_AUTO_APPROVE=true? → Approved
  │
  ├─ Matches MATIMO_APPROVED_PATTERNS? → Approved
  │
  └─ Neither → Request approval via callback
          ↓
  callback(ApprovalRequest) → true OR false
          ↓
  If approved: Execute tool
  If rejected: Throw MatimoError(APPROVAL_REJECTED)
```

## Configuration

### Loading Destructive Keywords

The approval system loads destructive keywords from `destructive-keywords.yaml`. The system searches for this file in the following order:

1. **Development/Workspace**: `packages/core/destructive-keywords.yaml`
2. **Installed Package**: `node_modules/@matimo/core/destructive-keywords.yaml`
3. **Current Directory**: `./destructive-keywords.yaml`
4. **Fallback**: Built-in default keywords if file not found

**Customizing Keywords**:
To add or modify destructive keywords, edit `packages/core/destructive-keywords.yaml` with categories:
```yaml
sql:
  - CREATE
  - DELETE
  # Add more SQL keywords...

file:
  - EDIT
  # Add more file operation keywords...

system:
  - SHUTDOWN
  # Add more system operation keywords...
```

### Approval Detection

Detection works in two ways:

**Method 1: YAML Declaration** (Explicit):
```yaml
name: sql-delete-user
requires_approval: true  # Explicit flag
# When true, requires approval before execution regardless of keywords
```

**Auto-Detection**:
If `requires_approval` not set, system auto-detects destructive keywords from `destructive-keywords.yaml` configuration:
```yaml
# packages/core/destructive-keywords.yaml
sql:
  - CREATE
  - DELETE
  - DROP
  - ALTER
  - TRUNCATE
  - UPDATE
  - GRANT
  - REVOKE

file:
  - EDIT
  - WRITE
  - REMOVE
  - RENAME

system:
  - SHUTDOWN
  - EXECUTE
  - EXEC
  - bash
  - powershell
  - "rm -rf"
  - "del /f"
```

When a tool executes with content matching any of these keywords, approval is automatically required:
```typescript
await matimo.execute('execute', { command: 'rm -rf /' }); // Detected via 'rm -rf' keyword
await matimo.execute('sql-query', { sql: 'DELETE FROM users' }); // Detected via 'DELETE' keyword
```

### Approval Modes

**Mode 1: Auto-Approve (CI/CD)**
```bash
export MATIMO_AUTO_APPROVE=true
```
All tools requiring approval are automatically approved. Useful for automation/CI.

**Mode 2: Pattern-Based Pre-Approval**
```bash
export MATIMO_APPROVED_PATTERNS="sql-create-*,sql-read-*,github-search-*"
```
Tools matching patterns skip approval. Others require interactive approval or auto-approve.

**Mode 3: Interactive (Default)**
No environment variables set → User sees approval prompt and decides.

## API

### Basic Usage

```typescript
import { MatimoInstance, getGlobalApprovalHandler } from '@matimo/core';

const matimo = await MatimoInstance.init({ autoDiscover: true });
const handler = getGlobalApprovalHandler();

// Set approval callback
handler.setApprovalCallback(async (request) => {
  console.info(`Approve ${request.toolName}?`);
  // return true or false
  return true;
});

// Execute tool - will check approval if required
const result = await matimo.execute('github-delete-repository', {
  owner: 'myorg',
  repo: 'temp-repo'
});
```

### ApprovalRequest Interface

```typescript
interface ApprovalRequest {
  toolName: string;              // 'github-delete-repository'
  description: string;           // From tool YAML description field
  params: Record<string, unknown>; // All params passed to tool
}
```

### Return Value

Callback returns `Promise<boolean>`:
- `true` → Operation approved, proceed
- `false` → Operation rejected, throw MatimoError

## Examples

### Example 1: Auto-Approve in Tests

```typescript
process.env.MATIMO_AUTO_APPROVE = 'true';

const matimo = await MatimoInstance.init({ autoDiscover: true });

// No interactive prompt, auto-approved
const result = await matimo.execute('sql-delete-user', { id: 'test' });
expect(result).toBeDefined();
```

### Example 2: Interactive Approval

```typescript
import { MatimoInstance, getGlobalApprovalHandler } from '@matimo/core';
import * as readline from 'readline';

const matimo = await MatimoInstance.init({ autoDiscover: true });

const handler = getGlobalApprovalHandler();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

handler.setApprovalCallback(async (request) => {
  return new Promise((resolve) => {
    rl.question(
      `\n🔒 Approve ${request.toolName}? (yes/no): `,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
});

// Will prompt user for approval
await matimo.execute('github-delete-repository', { owner: 'org', repo: 'temp' });
```

### Example 3: Pre-Approved Patterns

```bash
# Shell - approve all SQL read operations
export MATIMO_APPROVED_PATTERNS="sql-read-*,sql-query-*"

# TypeScript
const matimo = await MatimoInstance.init({ autoDiscover: true });

// No approval needed - matches pattern
await matimo.execute('sql-read-users', {});

// Approval needed - doesn't match pattern
await matimo.execute('sql-delete-user', { id: 'user123' });
```

## YAML Configuration

### Mark Tool as Requiring Approval

In tool YAML definition (`packages/{provider}/tools/{tool}/definition.yaml`):

```yaml
name: github-delete-repository
requires_approval: true
# Other fields...
parameters:
  owner:
    type: string
    required: true
  repo:
    type: string
    required: true
```

## Destructive Keywords YAML Configuration

The `destructive-keywords.yaml` file contains keywords organized by category. Each category defines keywords that trigger automatic approval detection.

### File Location

```
packages/core/destructive-keywords.yaml
```

### Structure

```yaml
# Destructive keywords used by ApprovalHandler to auto-detect operations requiring approval
# These are checked against SQL content and command parameters to determine if approval is needed

sql:                    # SQL-related destructive operations
  - CREATE
  - DELETE
  - DROP
  - ALTER
  - TRUNCATE
  - UPDATE
  - GRANT
  - REVOKE

file:                   # File operation keywords
  - EDIT
  - WRITE
  - APPEND
  - REMOVE
  - RENAME

system:                 # System-level dangerous operations
  - SHUTDOWN
  - EXECUTE
  - EXEC
  - bash
  - powershell
  - "rm -rf"
  - "del /f"
```

### How Keywords Are Used

When a tool executes:

1. **Load Keywords**: ApprovalHandler loads keywords from `destructive-keywords.yaml`
2. **Check Content**: Scans tool parameters (especially SQL content) for keyword matches
3. **Case-Insensitive Match**: `DELETE`, `delete`, `Delete` all match
4. **Require Approval**: If any keyword found, approval is required (unless pre-approved)

### Adding Custom Keywords

Edit `packages/core/destructive-keywords.yaml` to add keywords:

```yaml
sql:
  - CREATE
  - DELETE
  - UPDATE
  - BACKUP      # Add custom keyword
  - RESTORE     # Add custom keyword

custom:         # Add new category
  - CUSTOM_OP
```

After modifying, keywords are loaded on next `MatimoInstance` initialization.

### Disabling Keyword Detection for a Tool

If a tool contains a keyword but should NOT require approval, use the `requires_approval` flag:

```yaml
name: sql-backup
requires_approval: false  # Override auto-detection, no approval needed
```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `MATIMO_AUTO_APPROVE` | Auto-approve all approvals | `true` |
| `MATIMO_APPROVED_PATTERNS` | Pre-approved tool patterns | `sql-*,github-read-*` |

## Testing

### Test that Approval is Required

```typescript
import { MatimoInstance, getGlobalApprovalHandler } from '@matimo/core';

test('should require approval for delete', async () => {
  const matimo = await MatimoInstance.init({ autoDiscover: true });
  const handler = getGlobalApprovalHandler();
  
  let approvalAsked = false;
  
  handler.setApprovalCallback(async (request) => {
    approvalAsked = true;
    return false; // Deny
  });

  await expect(
    matimo.execute('sql-delete-user', { id: 'test' })
  ).rejects.toThrow(); // MatimoError

  expect(approvalAsked).toBe(true);
});
```

### Test Auto-Approval

```typescript
test('should auto-approve in CI', async () => {
  process.env.MATIMO_AUTO_APPROVE = 'true';
  
  const matimo = await MatimoInstance.init({ autoDiscover: true });
  
  const result = await matimo.execute('sql-delete-database', {
    dbname: 'temp'
  });
  
  expect(result).toBeDefined();
});
```

## Troubleshooting

### "destructive-keywords.yaml not found"

**Problem**: Warning in logs that destructive keywords configuration file cannot be found.

**Solution**: 
1. Ensure file exists at: `packages/core/destructive-keywords.yaml` (development)
2. Or in `node_modules/@matimo/core/destructive-keywords.yaml` (installed)
3. Uses fallback built-in keywords if file missing
4. Fallback keywords: DELETE, DROP, TRUNCATE, ALTER, CREATE, GRANT, REVOKE, UPDATE

### Custom Keywords Not Being Applied

**Problem**: Added keyword to `destructive-keywords.yaml` but tool still doesn't require approval.

**Solution**:
1. Restart your application (keywords loaded on `MatimoInstance.init()`)
2. Verify YAML syntax is correct (check spaces/indentation)
3. Verify keyword case matches content (checks are case-insensitive, but keyword definition matters)
4. Check file path - system looks in specific locations
5. Run with `MATIMO_LOG_LEVEL=debug` to see which keywords were loaded

### Keyword Matches But Shouldn't Require Approval

**Problem**: Tool contains keyword (e.g., "UPDATE" in a comment) but operation is read-only.

**Solution**: Add explicit flag to tool YAML:
```yaml
name: my-safe-tool
requires_approval: false  # Override keyword detection
```

### "Approval required but not configured"

**Problem**: Tool requires approval but no callback set.

**Solution**: Set one of:
1. `MATIMO_AUTO_APPROVE=true` for CI/CD
2. `MATIMO_APPROVED_PATTERNS="pattern"` for pre-approved tools
3. Call `handler.setApprovalCallback(callback)` for interactive approval

### "Non-interactive environment - approval rejected"

**Problem**: Tool needs approval but no TTY (terminal) available.

**Solution**: Set:
- `MATIMO_AUTO_APPROVE=true` in CI/CD scripts
- Or add tool to `MATIMO_APPROVED_PATTERNS`
- Or ensure script runs in interactive terminal

### Tool Requires Approval But Shouldn't

**Problem**: `requires_approval: true` in YAML but operation is safe.

**Solution**: Remove `requires_approval` flag from tool YAML and let auto-detection handle it based on actual keywords.

## See Also

- [Tool Development Guide](./tool-development/)
- [Architecture Overview](./architecture/OVERVIEW.md)
- Examples: `examples/tools/postgres/postgres-with-approval.ts`, `examples/tools/github/github-with-approval.ts`
