# @matimo/core — Core SDK for Matimo

Matimo core provides the TypeScript SDK that loads, validates, and executes YAML-defined tools across frameworks.

## 📦 Installation

Install the unified package (includes core exports):

```bash
# install unscope package which includes core and cli 
npm install matimo
pnpm add matimo
# or install scoped core package directly
npm insatll @matimo/core
pnpm add @matimo/core
```

## 🔧 Purpose

`@matimo/core` contains:

- `MatimoInstance` — initialization, discovery, registry, and execution API
- **Executors** — Command (shell), HTTP (REST with object/array embedding), Function (JS/TS)
- Decorator utilities (`@tool`, `setGlobalMatimoInstance`)
- Zod-based schema validation for YAML tool definitions
- **Structured error handling** — `MatimoError` with error chaining via optional `cause` field
- OAuth2 authentication support (provider integrations in separate packages)

This package is intended to be imported by applications, CLIs, and provider packages.

## 🚀 Quick Start

```typescript
import { MatimoInstance } from 'matimo';

// Auto-discover installed @matimo/* tool packages
const matimo = await MatimoInstance.init({ autoDiscover: true });

// List tools
console.log('Loaded', matimo.listTools().length, 'tools');

// Execute a tool
await matimo.execute('calculator', { operation: 'add', a: 1, b: 2 });
```

## 🛠 Included Core Tools

`@matimo/core` includes 6 built-in tools for common operations:

- **`execute`** — Run shell commands with output capture, timeout, and working directory control
- **`read`** — Read files with line range support and encoding detection
- **`edit`** — Edit/replace content in files with backup
- **`search`** — Search files with grep patterns and context
- **`web`** — Fetch and parse web content
- **`calculator`** — Basic arithmetic operations

All core tools use **function-based execution** (not shell commands) for better performance and reliability.

## 🧩 Usage Patterns

- Factory pattern: `MatimoInstance.init()` + `matimo.execute()`
- Decorator pattern: use `@tool()` and `setGlobalMatimoInstance()` for class-based code
- LangChain integration: convert Matimo tools to LangChain function schemas

See the full SDK docs: [docs/api-reference/SDK.md](../../docs/api-reference/SDK.md)

## ⚙️ Executors

`@matimo/core` provides three execution engines:

### FunctionExecutor (Recommended for Core Tools)
Executes TypeScript/JavaScript functions with type-safe parameters:
- ✅ **Direct execution** — No subprocess overhead
- ✅ **Better performance** — Direct async function calls
- ✅ **Type safety** — Proper TypeScript integration
- ✅ **Error handling** — Native exception handling

**Core tools** (`execute`, `read`, `edit`, `search`, `web`, `calculator`) all use function-based execution:
```yaml
# Tool YAML:
execution:
  type: function
  code: './execute.ts'  # Relative path to implementation

# File: execute.ts
export default async function execute(params: {
  command: string
  args?: string[]
  cwd?: string
  timeout?: number
}): Promise<{ success: boolean; stdout: string; stderr: string; exitCode: number }> {
  // Implementation here
}
```

### HttpExecutor
Makes HTTP requests with automatic parameter embedding and response validation:
```yaml
# Tool YAML:
execution:
  type: http
  method: POST
  url: https://api.example.com/data
  headers:
    Authorization: 'Bearer {AUTH_TOKEN}'
  body:
    text: '{text}'
    metadata: '{metadata}'  # Objects/arrays automatically JSON-encoded
```

**Key features:**
- ✅ **Parameter embedding** — Objects and arrays automatically JSON-encoded in request body
- ✅ **Response validation** — Validates output against `output_schema` using Zod
- ✅ **Error normalization** — Converts Axios/HTTP errors to structured `MatimoError`
- ✅ **Structured error details** — Original error preserved via `error.cause` field

### CommandExecutor (Legacy Shell Execution)
Spawns shell processes for external commands:
```typescript
// Tool YAML:
execution:
  type: command
  command: node
  args: ["script.js", "{param1}"]

// Spawns: node script.js value1
```

**Use when:**
- Executing external shell commands or legacy scripts
- Running tools from other packages that expect shell execution
- Most core Matimo tools now use function-based execution instead

## 🚨 Error Handling

All executors throw `MatimoError` (never generic `Error`) with structured context:

```typescript
import { MatimoError, ErrorCode } from '@matimo/core';

try {
  await matimo.execute('my-tool', params);
} catch (error) {
  if (error instanceof MatimoError) {
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Details:`, error.details);
    
    // Access original exception (if available)
    if (error.cause) {
      console.error(`Original error:`, error.cause);
    }
  }
}
```

**Error codes:**
- `INVALID_SCHEMA` — Tool definition or parameters invalid
- `EXECUTION_FAILED` — Tool execution failed (network, timeout, etc.)
- `AUTH_FAILED` — Authentication/authorization error
- `TOOL_NOT_FOUND` — Tool not found in registry

**Error chaining:**
The optional `cause` field preserves the original error for debugging:
```typescript
throw new MatimoError('HTTP request failed', ErrorCode.EXECUTION_FAILED, {
  toolName: 'slack_send',
  statusCode: 500,
  details: { originalError: axiosError }
});
// Access via: error.cause or error.details.originalError
```

## 🔐 Authentication & Security

Tools declare authentication requirements in YAML. `@matimo/core` supports:

- **API keys** (header/query injection)
- **Bearer/basic tokens** (automatic injection)
- **OAuth2** (provider configurations via OAuth2Handler)

Credentials are loaded from environment variables by convention:
```bash
export SLACK_BOT_TOKEN=xoxb-...
export GMAIL_ACCESS_TOKEN=ya29-...
export NOTION_API_KEY=ntn_...
```

**Security notes:**
- ✅ Secrets never logged (error messages exclude credential values)
- ✅ OAuth tokens refreshed automatically when expired
- ✅ HTTP Executor validates all authentication before making requests
- ✅ Missing credentials throw `MatimoError(AUTH_FAILED)` with helpful guidance

## ✅ Validation & Output Schema

All tool execution includes automatic validation:

**Input Validation:**
- Tool YAML definitions validated against Zod schema on load
- Parameters validated against tool's declared `parameters` schema
- Invalid parameters throw `MatimoError(INVALID_SCHEMA)`

**Output Validation:**
- HTTP executor validates response against tool's `output_schema`
- Function executor validates return value against `output_schema` (for HTTP tools)
- Invalid responses/returns throw `MatimoError(EXECUTION_FAILED)`
- Zod provides detailed validation error messages

**Example (core `execute` tool):**
```yaml
# Definition: packages/core/tools/execute/definition.yaml
execution:
  type: function
  code: './execute.ts'

output_schema:
  type: object
  properties:
    success: { type: boolean }
    exitCode: { type: number }
    stdout: { type: string }
    stderr: { type: string }
  required: [success, exitCode, stdout, stderr]
```

Invalid parameters or responses trigger validation errors with structured details.

## 🧪 Testing & Development

To run core package tests:

```bash
pnpm --filter "@matimo/core" test
```

To build:

```bash
pnpm --filter "@matimo/core" build
```

## 📚 Contributing

See the project CONTRIBUTING guide and `docs/tool-development/ADDING_TOOLS.md` for adding provider packages and tools.

- Contributing: https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md
- Add tools: ../../docs/tool-development/ADDING_TOOLS.md

---

Part of the Matimo ecosystem — define tools once, use them everywhere.
