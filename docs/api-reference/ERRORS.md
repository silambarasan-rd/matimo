# API Error Codes Reference

Complete reference of error codes returned by Matimo SDK.

## Central Error Management

Matimo uses a centralized error handling system via the `MatimoError` class defined in `src/errors/matimo-error.ts`. This ensures consistent error handling across all SDK operations.

### MatimoError Class

All Matimo errors extend the native `Error` class and include:

```typescript
import { MatimoError, ErrorCode } from 'matimo';

class MatimoError extends Error {
  code: ErrorCode; // Machine-readable error code
  details?: Record<string, unknown>; // Additional context

  toJSON(): Record<string, unknown>; // Serialize to JSON
}
```

**Key Benefits:**

- **Centralized Definition**: All error codes defined in one place (`ErrorCode` enum)
- **Type-Safe**: TypeScript enum ensures only valid error codes can be thrown
- **Serializable**: `toJSON()` method for logging and API responses
- **Extensible**: Details object captures context-specific information
- **Consistent**: Same error structure across all SDK methods

### Error Codes Enum

All 11 error codes are defined in the `ErrorCode` enum:

```typescript
export enum ErrorCode {
  INVALID_SCHEMA = 'INVALID_SCHEMA', // Tool definition validation failed
  EXECUTION_FAILED = 'EXECUTION_FAILED', // Tool execution error
  AUTH_FAILED = 'AUTH_FAILED', // Authentication/token error
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND', // Tool not in registry
  FILE_NOT_FOUND = 'FILE_NOT_FOUND', // File/directory missing
  VALIDATION_FAILED = 'VALIDATION_FAILED', // Parameter validation error
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED', // API rate limit hit
  TIMEOUT = 'TIMEOUT', // Operation timeout
  NETWORK_ERROR = 'NETWORK_ERROR', // Network/connection error
  INVALID_PARAMETER = 'INVALID_PARAMETER', // Invalid parameter value
  UNKNOWN_ERROR = 'UNKNOWN_ERROR', // Unknown error
}
```

### Creating Errors

Matimo provides helper functions for common error types:

```typescript
import { createValidationError, createExecutionError, MatimoError, ErrorCode } from 'matimo';

// Using helpers
const validationErr = createValidationError('Missing required parameter', { param: 'email' });

const executionErr = createExecutionError('Tool returned error 500', {
  statusCode: 500,
  tool: 'gmail-send',
});

// Direct instantiation
const authErr = new MatimoError('Missing API token', ErrorCode.AUTH_FAILED, {
  env: 'GMAIL_ACCESS_TOKEN',
});
```

---

## Error Structure

All Matimo errors follow this structure (via `MatimoError`):

```typescript
{
  name: 'MatimoError';      // Error class name
  message: string;           // Human-readable message
  code: ErrorCode;           // Error code enum value
  details?: object;          // Additional context
}
```

**Example:**

```typescript
import { MatimoError, ErrorCode } from 'matimo';

try {
  await m.execute('unknown-tool', {});
} catch (error) {
  if (error instanceof MatimoError) {
    console.log(error.code); // ErrorCode.TOOL_NOT_FOUND
    console.log(error.message); // 'Tool "unknown-tool" not found'
    console.log(error.details); // { toolName: 'unknown-tool' }
    console.log(error.toJSON()); // Full error object for logging
  }
}
```

---

## Error Codes

### TOOL_NOT_FOUND

Tool name doesn't exist in registry.

```typescript
if (error.code === 'TOOL_NOT_FOUND') {
  // Tool doesn't exist
  // Check tool name spelling
  // Use m.listTools() to see available tools
}
```

**Common causes:**

- Typo in tool name
- Tool file not loaded
- Tool definition invalid

**Resolution:**

```typescript
// List available tools
const tools = m.listTools();
console.log(tools.map((t) => t.name));

// Use correct tool name
const result = await m.execute('calculator', params);
```

---

### INVALID_PARAMETERS

Required parameters missing or wrong type.

```typescript
if (error.code === 'INVALID_PARAMETERS') {
  console.log('Missing or invalid:', error.details.invalidFields);
  // e.g., { invalidFields: ['operation', 'a'] }
}
```

**Common causes:**

- Missing required parameter
- Wrong parameter type (string vs number)
- Parameter value outside allowed range

**Resolution:**

```typescript
// Get tool definition
const tool = m.getTool('calculator');

// Check required parameters
Object.entries(tool.parameters).forEach(([name, param]) => {
  if (param.required) {
    console.log(`Required: ${name}`);
  }
});

// Execute with all required params
const result = await m.execute('calculator', {
  operation: 'add', // required
  a: 5, // required
  b: 3, // required
});
```

---

### EXECUTION_FAILED

Tool execution encountered an error.

```typescript
if (error.code === 'EXECUTION_FAILED') {
  console.log('Tool error:', error.details);
  // Details vary by tool type
}
```

**Common causes:**

- Tool returned error (e.g., API returned 500)
- Command execution failed
- Network error
- Authentication failed

**Resolution:**

```typescript
try {
  const result = await m.execute('gmail-send-email', {
    to: 'user@example.com',
    subject: 'Test',
    body: 'Test',
  });
} catch (error) {
  if (error.code === 'EXECUTION_FAILED') {
    if (error.details.statusCode === 401) {
      console.error('❌ Authentication failed - check token');
    } else if (error.details.statusCode === 429) {
      console.error('⏱️ Rate limited - retry later');
    } else {
      console.error('Tool error:', error.message);
    }
  }
}
```

---

### INVALID_SCHEMA

Tool definition doesn't match schema.

```typescript
if (error.code === 'INVALID_SCHEMA') {
  console.log('Tool definition invalid:', error.details.errors);
}
```

**Common causes:**

- Required field missing in tool YAML
- Wrong parameter type in YAML
- Invalid execution configuration

**Resolution:**

```bash
# Validate all tools
pnpm validate-tools

# This will show which tools have schema errors
```

See [Tool Specification](../tool-development/YAML_TOOLS.md) for correct YAML format.

---

### VALIDATION_FAILED

Parameter validation failed (e.g., not in enum, wrong regex pattern).

```typescript
if (error.code === 'VALIDATION_FAILED') {
  console.log('Validation errors:', error.details.errors);
}
```

**Common causes:**

- Parameter value not in enum list
- String doesn't match regex pattern
- Number outside min/max range

**Resolution:**

```typescript
// Get tool definition
const tool = m.getTool('calculator');

// Check parameter constraints
const operation = tool.parameters.operation;
console.log('Allowed operations:', operation.enum);
// ['add', 'subtract', 'multiply', 'divide']

// Use allowed value
const result = await m.execute('calculator', {
  operation: 'add', // Must be in enum
  a: 5,
  b: 3,
});
```

---

### AUTH_FAILED

Authentication error (missing or invalid token).

```typescript
if (error.code === 'AUTH_FAILED') {
  console.log('Auth error:', error.message);
  // e.g., "Missing GMAIL_ACCESS_TOKEN environment variable"
}
```

**Common causes:**

- OAuth2 token not set in environment variable
- Token expired
- Token invalid or revoked

**Resolution:**

```bash
# Check token is set
echo $GMAIL_ACCESS_TOKEN

# If empty, set it
export GMAIL_ACCESS_TOKEN="ya29.a0AfH6SMBx..."

# Test execution
npx tsx -e "import { MatimoInstance } from 'matimo'; const matimo = await MatimoInstance.init('./tools'); console.log(await matimo.execute('gmail-send-email', {to: 'test@example.com', subject: 'Test', body: 'Test'}));"
```

See [Authentication Guide](../user-guide/AUTHENTICATION.md) for token setup.

---

### FILE_NOT_FOUND

Tool file or directory doesn't exist.

```typescript
if (error.code === 'FILE_NOT_FOUND') {
  console.log('Missing file:', error.details.path);
}
```

**Common causes:**

- Tools directory path is wrong
- Tool YAML file deleted
- Incorrect file path in code

**Resolution:**

```bash
# Verify tools directory exists
ls -la ./tools

# Verify tool file exists
ls -la ./tools/calculator/definition.yaml

# Use correct path when initializing
const m = await MatimoInstance.init('./tools');
```

---

## Handling Errors

### Pattern 1: Type Check and Handle Specific Codes

```typescript
import { MatimoError, ErrorCode } from 'matimo';

try {
  const result = await m.execute('calculator', params);
} catch (error) {
  if (error instanceof MatimoError) {
    switch (error.code) {
      case ErrorCode.TOOL_NOT_FOUND:
        console.error('Tool not available');
        break;
      case ErrorCode.VALIDATION_FAILED:
        console.error('Bad parameters:', error.details);
        break;
      case ErrorCode.EXECUTION_FAILED:
        console.error('Tool execution failed:', error.details);
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  } else {
    // Handle non-Matimo errors
    throw error;
  }
}
```

### Pattern 2: Check Specific Error Code

```typescript
import { MatimoError, ErrorCode } from 'matimo';

try {
  await m.execute('gmail-send-email', params);
} catch (error) {
  if (error instanceof MatimoError) {
    if (error.code === ErrorCode.AUTH_FAILED) {
      // Handle auth separately
      return redirectToLogin();
    }

    if (error.code === ErrorCode.EXECUTION_FAILED) {
      // Handle tool error
      return retryWithBackoff();
    }
  }

  // Handle others
  throw error;
}
```

### Pattern 3: Serialize for Logging

```typescript
import { MatimoError } from 'matimo';

try {
  await m.execute(toolName, params);
} catch (error) {
  if (error instanceof MatimoError) {
    // Use toJSON() for structured logging
    logger.error('tool_execution_failed', error.toJSON());
  } else {
    throw error;
  }
}
```

---

## Error Codes Reference

| Code                  | ErrorCode Enum                  | Cause                    | Resolution                             |
| --------------------- | ------------------------------- | ------------------------ | -------------------------------------- |
| `TOOL_NOT_FOUND`      | `ErrorCode.TOOL_NOT_FOUND`      | Tool doesn't exist       | Check tool name, use `listTools()`     |
| `INVALID_PARAMETERS`  | `ErrorCode.INVALID_PARAMETER`   | Missing/wrong params     | Check tool definition                  |
| `EXECUTION_FAILED`    | `ErrorCode.EXECUTION_FAILED`    | Tool execution error     | Check tool error details               |
| `INVALID_SCHEMA`      | `ErrorCode.INVALID_SCHEMA`      | Bad tool definition      | Fix tool YAML, run `validate-tools`    |
| `VALIDATION_FAILED`   | `ErrorCode.VALIDATION_FAILED`   | Param validation failed  | Check constraints (enum, regex, range) |
| `AUTH_FAILED`         | `ErrorCode.AUTH_FAILED`         | Missing/invalid token    | Set OAuth2 env var                     |
| `FILE_NOT_FOUND`      | `ErrorCode.FILE_NOT_FOUND`      | File/dir missing         | Verify paths exist                     |
| `RATE_LIMIT_EXCEEDED` | `ErrorCode.RATE_LIMIT_EXCEEDED` | API rate limit hit       | Wait and retry                         |
| `TIMEOUT`             | `ErrorCode.TIMEOUT`             | Operation timeout        | Increase timeout or check network      |
| `NETWORK_ERROR`       | `ErrorCode.NETWORK_ERROR`       | Network/connection error | Check connectivity                     |
| `UNKNOWN_ERROR`       | `ErrorCode.UNKNOWN_ERROR`       | Unknown error            | Check error details                    |

---

## Next Steps

- **Handle Errors**: [Error Handling Patterns](#handling-errors)
- **Setup Auth**: [Authentication Guide](../user-guide/AUTHENTICATION.md)
- **Type Definitions**: [Type Reference](./TYPES.md)
