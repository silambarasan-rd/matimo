# File Operation Approval System

The file operation approval system provides security controls for file system operations (read, edit, search) performed by Matimo tools. This prevents unauthorized access to sensitive files and provides interactive approval prompts for user consent.

## Overview

Matimo's file operation tools (`read`, `edit`, `search`) require explicit approval before accessing files. The approval system supports:

- **Permanent approvals** via environment variables (for trusted paths)
- **Runtime session approvals** (cached during execution)
- **Interactive approval callbacks** (user prompts for consent)

## Why Approval is Required

File operations can access sensitive data, configuration files, or system-critical paths. The approval system ensures:

- **Security**: Prevents accidental or malicious file access
- **Transparency**: Users see and approve each file operation
- **Flexibility**: Supports both automated and interactive workflows

## How It Works

### Approval Flow

1. **Check Runtime Cache**: Previously approved paths in current session
2. **Check Permanent Approvals**: Paths matching `MATIMO_EDIT_ALLOWED_PATHS`
3. **Interactive Approval**: User prompt via callback (if configured)
4. **Deny Access**: If no approval mechanism available

### Approval Types

#### Permanent Approvals

Set via environment variable `MATIMO_EDIT_ALLOWED_PATHS`:

```bash
# Single path
export MATIMO_EDIT_ALLOWED_PATHS="/tmp"

# Multiple paths (comma-separated)
export MATIMO_EDIT_ALLOWED_PATHS="/tmp,/home/user/projects"

# Glob patterns supported
export MATIMO_EDIT_ALLOWED_PATHS="/tmp/**,/home/user/*.txt"
```

Permanent approvals are loaded once at startup and never prompt for approval.

#### Runtime Session Approvals

Approved paths are cached during the current session:

```typescript
const approvalManager = getPathApprovalManager();

// Pre-approve a path programmatically
approvalManager.approvePathForSession('/tmp/test.txt');
```

#### Interactive Approvals

Set a callback for user prompts:

```typescript
import { getPathApprovalManager } from '@matimo/core';

const approvalManager = getPathApprovalManager();

approvalManager.setApprovalCallback(async (filePath, mode) => {
  // Your approval logic here
  const approved = await promptUser(`Allow ${mode} access to ${filePath}?`);
  return approved;
});
```

## Configuration

### Basic Setup

```typescript
import { MatimoInstance, getPathApprovalManager } from '@matimo/core';

// Initialize Matimo
const matimo = await MatimoInstance.init({ autoDiscover: true });

// Get approval manager
const approvalManager = getPathApprovalManager();

// Set interactive callback
approvalManager.setApprovalCallback(async (filePath, mode) => {
  const answer = await promptUser(`[${mode.toUpperCase()}] Approve ${filePath}? (y/n): `);
  return answer.toLowerCase() === 'y';
});
```

### Example with Readline

```typescript
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const approvalManager = getPathApprovalManager();

approvalManager.setApprovalCallback((filePath, mode) => {
  return new Promise((resolve) => {
    rl.question(`[${mode.toUpperCase()}] Approve access to ${filePath}? (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
});
```

### File-Based Approval Storage

```typescript
import fs from 'fs/promises';

const APPROVALS_FILE = '.matimo-approvals';

approvalManager.setApprovalCallback(async (filePath, mode) => {
  // Check if already approved
  try {
    const content = await fs.readFile(APPROVALS_FILE, 'utf-8');
    if (content.includes(filePath)) {
      return true;
    }
  } catch {
    // File doesn't exist, continue to prompt
  }

  // Prompt user
  const approved = await promptUser(`Approve ${mode} access to ${filePath}?`);

  if (approved) {
    // Store approval
    await fs.appendFile(APPROVALS_FILE, `${filePath}\n`);
  }

  return approved;
});
```

## Path Matching

### Glob Pattern Support

Permanent approvals support glob patterns:

- `*` - Matches any characters within a path segment
- `**` - Matches any number of path segments
- `?` - Matches a single character

```bash
# Match all .txt files in a directory
export MATIMO_EDIT_ALLOWED_PATHS="/docs/*.txt"

# Match all files in a directory tree
export MATIMO_EDIT_ALLOWED_PATHS="/tmp/**"

# Match specific file types
export MATIMO_EDIT_ALLOWED_PATHS="**/*.md,**/*.txt"
```

### Path Resolution

All paths are resolved to absolute paths for consistent matching:

- Relative paths are resolved from current working directory
- Symlinks are followed to their target
- Case-sensitive matching on Unix, case-insensitive on Windows

## Error Handling

### Missing Approval Callback

If no approval callback is set and a path isn't permanently approved:

```typescript
throw new MatimoError(
  'Path approval required but no approval callback set',
  ErrorCode.EXECUTION_FAILED,
  {
    filePath: '/sensitive/file.txt',
    mode: 'read',
    hint: 'Set approval callback with manager.setApprovalCallback() or add path to MATIMO_EDIT_ALLOWED_PATHS',
  }
);
```

### Approval Denied

Tools return structured error responses when approval is denied:

```typescript
{
  success: false,
  error: 'Access denied: /sensitive/file.txt',
  filePath: '/sensitive/file.txt'
}
```

## Best Practices

### Security

- **Limit permanent approvals** to trusted directories only
- **Use specific paths** instead of broad glob patterns when possible
- **Validate file paths** before approval
- **Log approvals** for audit trails

### User Experience

- **Clear prompts** explaining what access is being requested
- **Consistent interface** across different tools
- **Non-blocking prompts** for automated workflows
- **Persistent storage** for frequently approved paths

### Performance

- **Cache approvals** in runtime for repeated access
- **Batch approvals** for multiple related files
- **Pre-approve** known safe paths programmatically

## Examples

See the [examples directory](../../examples/tools/) for complete implementations:

- [Read tool with approval](../../examples/tools/read/)
- [Edit tool with approval](../../examples/tools/edit/)
- [Search tool with approval](../../examples/tools/search/)

Each example demonstrates different integration patterns (factory, decorator, LangChain) with interactive approval prompts.</content>
<parameter name="filePath">/Users/sajesh/My Work Directory/matimo/docs/user-guide/FILE_OPERATION_APPROVAL.md
