# API Reference — Complete SDK

Complete reference for the Matimo TypeScript SDK.

## Table of Contents

- [MatimoFactory](#matimofactory)
- [ToolLoader](#toolloader)
- [ToolRegistry](#toolregistry)
- [Executors](#executors)
  - [CommandExecutor](#commandexecutor)
  - [HttpExecutor](#httpexecutor)
- [Error Handling](#error-handling)
- [Types](#types)

---

## MatimoFactory

Factory pattern for creating Matimo instances.

### Methods

#### `create(options)`

Create a new Matimo instance with factory pattern.

```typescript
const matimo = MatimoFactory.create({
  toolsPath: './tools',
  validateOnLoad: true
});
```

**Parameters:**
- `toolsPath` (string, required) - Path to tools directory
- `validateOnLoad` (boolean, optional, default: true) - Validate tools on load

**Returns:** `Matimo` instance

**Example:**
```typescript
import { MatimoFactory } from 'matimo';

const matimo = MatimoFactory.create({
  toolsPath: './tools'
});

const tools = matimo.getToolRegistry().listTools();
```

---

## ToolLoader

Load tool definitions from YAML/JSON files.

### Constructor

```typescript
const loader = new ToolLoader(toolsPath: string);
```

### Methods

#### `loadToolsFromDirectory()`

Load all tools from a directory recursively.

```typescript
const tools = await loader.loadToolsFromDirectory();
```

**Returns:** `ToolDefinition[]` - Array of loaded tools

**Throws:**
- `FileNotFoundError` - If tools directory doesn't exist
- `SchemaValidationError` - If tool schema is invalid

**Example:**
```typescript
const loader = new ToolLoader('./tools');
const tools = await loader.loadToolsFromDirectory();
console.log(`Loaded ${tools.length} tools`);
```

#### `loadToolFromFile(filePath)`

Load a single tool from a YAML/JSON file.

```typescript
const tool = await loader.loadToolFromFile('./tools/calculator/tool.yaml');
```

**Parameters:**
- `filePath` (string) - Path to tool file

**Returns:** `ToolDefinition` - Loaded tool definition

**Throws:**
- `FileNotFoundError` - If file doesn't exist
- `SchemaValidationError` - If tool schema is invalid

---

## ToolRegistry

In-memory registry of loaded tools.

### Methods

#### `listTools()`

Get all loaded tools.

```typescript
const tools = registry.listTools();
```

**Returns:** `ToolDefinition[]`

**Example:**
```typescript
registry.listTools().forEach(tool => {
  console.log(`${tool.name}: ${tool.description}`);
});
```

#### `getTool(name)`

Get a tool by name.

```typescript
const tool = registry.getTool('calculator');
```

**Parameters:**
- `name` (string) - Tool name

**Returns:** `ToolDefinition | undefined`

**Example:**
```typescript
const tool = registry.getTool('github-create-issue');
if (tool) {
  console.log(tool.parameters);
} else {
  console.log('Tool not found');
}
```

#### `registerTool(tool)`

Register a tool in the registry.

```typescript
registry.registerTool(toolDefinition);
```

**Parameters:**
- `tool` (ToolDefinition) - Tool definition

**Example:**
```typescript
const newTool = {
  name: 'my-tool',
  description: 'My custom tool',
  version: '1.0.0',
  // ... other required fields
};
registry.registerTool(newTool);
```

---

## Executors

Execute tools with different backends.

### CommandExecutor

Execute shell commands.

#### Constructor

```typescript
const executor = new CommandExecutor();
```

#### `execute(tool, params, context?)`

Execute a command-based tool.

```typescript
const result = await executor.execute(tool, {
  param1: 'value1',
  param2: 'value2'
});
```

**Parameters:**
- `tool` (ToolDefinition) - Tool to execute
- `params` (Record<string, unknown>) - Tool parameters
- `context` (ExecutionContext, optional) - Execution context with traceId, etc.

**Returns:** `ExecutionResult`

**Throws:**
- `ValidationError` - If parameters don't match schema
- `ExecutionError` - If command fails

**Example:**
```typescript
const executor = new CommandExecutor();
const result = await executor.execute(calculator, {
  operation: 'add',
  a: 5,
  b: 3
});
console.log(result.output); // { result: 8 }
```

#### `validateParameters(tool, params)`

Validate parameters against tool schema.

```typescript
const isValid = executor.validateParameters(tool, params);
```

**Parameters:**
- `tool` (ToolDefinition) - Tool definition
- `params` (unknown) - Parameters to validate

**Returns:** `boolean`

---

### HttpExecutor

Execute HTTP requests.

#### Constructor

```typescript
const executor = new HttpExecutor();
```

#### `execute(tool, params, context?)`

Execute an HTTP-based tool.

```typescript
const result = await executor.execute(tool, {
  endpoint: '/api/users',
  method: 'GET'
});
```

**Parameters:**
- `tool` (ToolDefinition) - Tool to execute
- `params` (Record<string, unknown>) - Tool parameters
- `context` (ExecutionContext, optional) - Execution context

**Returns:** `ExecutionResult`

**Throws:**
- `ValidationError` - If parameters don't match schema
- `ExecutionError` - If HTTP request fails
- `AuthError` - If authentication fails

**Example:**
```typescript
const executor = new HttpExecutor();
const result = await executor.execute(githubApi, {
  endpoint: '/repos/{owner}/{repo}/issues',
  method: 'POST',
  body: { title: 'Bug Report' }
});
```

---

## Error Handling

All errors inherit from `MatimoError`.

### Error Codes

```typescript
enum ErrorCode {
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  AUTH_FAILED = 'AUTH_FAILED',
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}
```

### MatimoError

Base error class.

```typescript
throw new MatimoError(
  message: string,
  code: ErrorCode,
  context?: Record<string, unknown>
);
```

**Example:**
```typescript
try {
  const result = await executor.execute(tool, params);
} catch (error) {
  if (error instanceof MatimoError) {
    console.error(`[${error.code}] ${error.message}`);
    if (error.context) {
      console.error('Context:', error.context);
    }
  }
}
```

### Common Errors

#### ValidationError

Parameters don't match tool schema.

```typescript
catch (error) {
  if (error.code === 'VALIDATION_FAILED') {
    console.error('Invalid parameters:', error.message);
  }
}
```

#### ExecutionError

Tool execution failed.

```typescript
catch (error) {
  if (error.code === 'EXECUTION_FAILED') {
    console.error('Tool failed:', error.message);
  }
}
```

#### AuthError

Authentication failed.

```typescript
catch (error) {
  if (error.code === 'AUTH_FAILED') {
    console.error('Authentication failed:', error.message);
  }
}
```

---

## Types

### ToolDefinition

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  version: string;
  parameters: Record<string, Parameter>;
  execution: ExecutionConfig;
  output_schema?: OutputSchema;
  authentication?: AuthConfig;
  error_handling?: ErrorHandlingConfig;
}
```

### Parameter

```typescript
interface Parameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: unknown[];
  default?: unknown;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}
```

### ExecutionConfig

```typescript
interface ExecutionConfig {
  type: 'command' | 'http' | 'script';
}

interface CommandExecution extends ExecutionConfig {
  type: 'command';
  command: string;
  args?: string[];
  env?: Record<string, string>;
  timeout_ms?: number;
}

interface HttpExecution extends ExecutionConfig {
  type: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  auth?: AuthConfig;
  timeout_ms?: number;
}
```

### OutputSchema

```typescript
interface OutputSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, OutputSchema>;
  items?: OutputSchema;
  required?: string[];
  description?: string;
}
```

### AuthConfig

```typescript
interface AuthConfig {
  type: 'api_key' | 'bearer' | 'oauth2' | 'basic';
  location?: 'header' | 'query' | 'body';
  name?: string; // For api_key and basic
  secret_env_var: string;
}
```

### ExecutionResult

```typescript
interface ExecutionResult {
  success: boolean;
  output: unknown;
  duration_ms: number;
  error?: {
    code: string;
    message: string;
  };
}
```

### ExecutionContext

```typescript
interface ExecutionContext {
  traceId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}
```

---

## Complete Example

```typescript
import { MatimoFactory } from 'matimo';

// 1. Create Matimo instance
const matimo = MatimoFactory.create({
  toolsPath: './tools'
});

// 2. List available tools
const tools = matimo.getToolRegistry().listTools();
console.log(`Available tools: ${tools.map(t => t.name).join(', ')}`);

// 3. Get specific tool
const calculator = matimo.getToolRegistry().getTool('calculator');
if (!calculator) {
  throw new Error('Calculator tool not found');
}

// 4. Execute with error handling
try {
  const result = await matimo.executeTool('calculator', {
    operation: 'add',
    a: 10,
    b: 5
  });
  
  console.log('Result:', result);
  // Output: Result: { result: 15 }
} catch (error) {
  if (error.code === 'VALIDATION_FAILED') {
    console.error('Invalid parameters');
  } else if (error.code === 'EXECUTION_FAILED') {
    console.error('Tool execution failed:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Advanced Usage

### Custom Execution Context

```typescript
const result = await executor.execute(tool, params, {
  traceId: 'trace-12345',
  userId: 'user-789',
  metadata: {
    source: 'api',
    version: '1.0'
  }
});
```

### Parameter Templating

```yaml
# In tool YAML:
execution:
  type: command
  command: echo
  args:
    - "Hello {name}, your age is {age}"
```

```typescript
const result = await executor.execute(tool, {
  name: 'Alice',
  age: 30
});
// Output: "Hello Alice, your age is 30"
```

### Output Validation

HTTP executor automatically validates responses against `output_schema`:

```yaml
output_schema:
  type: object
  properties:
    id:
      type: number
    name:
      type: string
    email:
      type: string
  required:
    - id
    - name
```

The executor will throw `ValidationError` if the response doesn't match.

---

## See Also

- [Quick Start](./QUICK_START.md) — Get started in 5 minutes
- [Tool Specification](./TOOL_SPECIFICATION.md) — Write YAML tools
- [Decorator Guide](./DECORATOR_GUIDE.md) — Use decorators
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Development guide
