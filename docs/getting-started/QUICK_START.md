# Quick Start — 5 Minutes

Get Matimo up and running in 5 minutes.

## 1. Installation (1 min)

```bash
npm install matimo
# or with pnpm
pnpm add matimo
```

## 2. Load Tools (2 min)

Create a file `load-tools.ts`:

```typescript
import { ToolLoader } from 'matimo';

const loader = new ToolLoader('./tools');
const tools = await loader.loadToolsFromDirectory();

console.log(`Loaded ${tools.length} tools`);
```

## 3. Execute a Tool (1 min)

```typescript
import { CommandExecutor } from 'matimo';

const executor = new CommandExecutor();
const result = await executor.execute(tools[0], {
  param1: 'value1',
  param2: 'value2'
});

console.log(result);
```

## 4. Use the SDK Factory (1 min)

```typescript
import { MatimoFactory } from 'matimo';

// Create instance with factory pattern
const matimo = MatimoFactory.create({
  toolsPath: './tools'
});

// List all tools
const allTools = matimo.getToolRegistry().listTools();

// Execute a tool
const result = await matimo.executeTool('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});

console.log(result); // { result: 8 }
```

## Next Steps

- **[API Reference](../api-reference/SDK.md)** — Full SDK documentation
- **[Tool Specification](../tool-development/TOOL_SPECIFICATION.md)** — Write your own tools
- **[Decorator Guide](../tool-development/DECORATOR_GUIDE.md)** — Use TypeScript decorators
- **[Development Guide](../CONTRIBUTING.md)** — Contributing to Matimo

## Common Tasks

### List All Loaded Tools

```typescript
const tools = matimo.getToolRegistry().listTools();
tools.forEach(tool => {
  console.log(`${tool.name} - ${tool.description}`);
});
```

### Get Tool by Name

```typescript
const tool = matimo.getToolRegistry().getTool('calculator');
if (tool) {
  console.log(tool.parameters);
}
```

### Execute with Error Handling

```typescript
try {
  const result = await matimo.executeTool('github-create-issue', {
    repo: 'owner/repo',
    title: 'Bug Report'
  });
  console.log('Success:', result);
} catch (error) {
  if (error.code === 'VALIDATION_FAILED') {
    console.error('Invalid parameters:', error.message);
  } else if (error.code === 'EXECUTION_FAILED') {
    console.error('Tool execution failed:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Use with MCP Server

```typescript
import { MCPServer } from 'matimo/mcp';

const server = new MCPServer({
  toolsPath: './tools',
  port: 3000
});

await server.start();
console.log('MCP Server running on port 3000');
// Claude can now discover and call all tools via MCP
```

## Example Directory Structure

```
project/
├── tools/
│   ├── calculator/
│   │   └── defination.yaml
│   └── github/
|       └── defination.yaml
│       └── create-issue
|            └── defination.yaml
├── src/
│   └── app.ts
└── package.json
```

## Example Tool YAML

Create `tools/calculator/tool.yaml`:

```yaml
name: calculator
description: Perform basic math operations
version: "1.0.0"

parameters:
  operation:
    type: string
    enum: [add, subtract, multiply, divide]
    required: true
  a:
    type: number
    required: true
  b:
    type: number
    required: true

execution:
  type: command
  command: node
  args:
    - -e
    - "console.log(JSON.stringify({ result: eval(`${process.argv[1]} ${process.argv[2]} ${process.argv[3]}`) }))"
    - "{operation === 'add' ? '+' : operation === 'subtract' ? '-' : operation === 'multiply' ? '*' : '/'}"
    - "{a}"
    - "{b}"

output_schema:
  type: object
  properties:
    result:
      type: number
```

Load and execute:

```typescript
const result = await matimo.executeTool('calculator', {
  operation: 'add',
  a: 10,
  b: 5
});
// result = { result: 15 }
```

## Troubleshooting

**Tools not loading?**
- Check that tool YAML files are in the correct path
- Verify YAML syntax is valid
- Run `pnpm lint` to check for errors

**Execution failing?**
- Check parameters match the tool's parameter schema
- Verify required environment variables are set
- Check error message for specific failure reason

**Type errors?**
- Ensure TypeScript strict mode is enabled
- Check that tool definitions match expected types
- Run `pnpm build` to catch compilation errors

## Support

- **Questions?** Open a [GitHub Discussion](https://github.com/tallclub/matimo/discussions)
- **Found a bug?** [Open an issue](https://github.com/tallclub/matimo/issues)
- **Want to contribute?** See [CONTRIBUTING.md](../CONTRIBUTING.md)
