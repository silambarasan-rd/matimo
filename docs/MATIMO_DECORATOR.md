# Matimo Decorator Style Guide

> **Recommended approach for integrating Matimo tools into your AI agents and applications**

The Matimo decorator system provides a clean, type-safe way to execute tools with minimal boilerplate. This guide explains how to use decorators effectively.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [Usage Patterns](#usage-patterns)
4. [Advanced Features](#advanced-features)
5. [Best Practices](#best-practices)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Basic Setup

```typescript
import { tool, setGlobalMatimoInstance } from 'matimo';
import { ToolLoader } from 'matimo';

// 1. Initialize Matimo (once at startup)
const loader = new ToolLoader('./tools');
const tools = await loader.loadToolsFromDirectory();
setGlobalMatimoInstance(matimo);

// 2. Define your agent with decorators
class MyAgent {
  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {
    // Method body is ignored - tool is executed instead
  }
}

// 3. Use it simply
const agent = new MyAgent();
const result = await agent.calculate('add', 5, 3);
console.log(result);  // { result: 8 }
```

That's it! No need for manual parameter handling, validation, or executor selection.

## Core Concepts

### What is the @tool Decorator?

The `@tool()` decorator transforms a method into a tool executor. It:

1. **Intercepts method calls** - Catches the function invocation
2. **Looks up the tool** - Finds tool definition in registry
3. **Validates parameters** - Ensures parameters match tool schema
4. **Selects executor** - Chooses CommandExecutor or HttpExecutor
5. **Executes tool** - Runs the tool with validated parameters
6. **Returns result** - Passes result back to caller

### Parameter Binding

Arguments are automatically mapped to tool parameters by position:

```typescript
@tool('calculator')
async calculate(operation: string, a: number, b: number) {
  // When called: agent.calculate('add', 5, 3)
  // Becomes: { operation: 'add', a: 5, b: 3 }
}
```

**Important**: Parameter order in method signature must match the tool's parameter definition order.

### Global vs Instance Matimo

You can set Matimo globally or per-instance:

```typescript
// Global approach (recommended for most apps)
import { setGlobalMatimoInstance } from 'matimo';
setGlobalMatimoInstance(matimo);

class MyAgent {
  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {}
}

// Instance approach (for multiple Matimo instances)
class MyAgent {
  constructor(private matimo: MatimoInstance) {}
  
  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {}
}
```

## Usage Patterns

### Single Tool per Method

Each method maps to one tool:

```typescript
class DataAgent {
  @tool('http-get')
  async fetchData(url: string) {
    // Automatically validates URL and makes request
  }

  @tool('file-reader')
  async readFile(path: string) {
    // Automatically reads file with validation
  }

  @tool('json-parser')
  async parseJson(content: string) {
    // Automatically parses JSON
  }
}
```

### Organizing Tools by Domain

Group related tools into logical agent classes:

```typescript
class GitHubAgent {
  @tool('github-get-repo')
  async getRepository(owner: string, repo: string) {}

  @tool('github-create-issue')
  async createIssue(owner: string, repo: string, title: string, body: string) {}

  @tool('github-list-repos')
  async listRepositories(owner: string) {}
}

class SlackAgent {
  @tool('slack-send-message')
  async sendMessage(channel: string, message: string) {}

  @tool('slack-get-user')
  async getUser(userId: string) {}
}

// Use them together
const github = new GitHubAgent();
const slack = new SlackAgent();

const repo = await github.getRepository('microsoft', 'vscode');
await slack.sendMessage('#announcements', `New repo: ${repo.name}`);
```

### Async/Await Pattern

All decorated methods are async and return Promises:

```typescript
class CalculatorAgent {
  @tool('calculator')
  async add(a: number, b: number) {}

  @tool('calculator')
  async multiply(a: number, b: number) {}
}

// Usage with async/await
const agent = new CalculatorAgent();
try {
  const sum = await agent.add(5, 3);
  const product = await agent.multiply(sum, 2);
  console.log(`(5 + 3) * 2 = ${product}`);
} catch (error) {
  console.error('Calculation failed:', error);
}

// Or with Promise chaining
agent.add(5, 3)
  .then(sum => agent.multiply(sum, 2))
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Error Handling

Errors from tool execution are thrown as exceptions:

```typescript
class APIAgent {
  @tool('http-get')
  async fetchData(url: string) {}
}

const agent = new APIAgent();

try {
  const data = await agent.fetchData('https://invalid-url');
} catch (error) {
  if (error.code === 'INVALID_URL') {
    console.log('URL validation failed');
  } else if (error.code === 'EXECUTION_FAILED') {
    console.log('API request failed:', error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

## Advanced Features

### Multiple Tools in Sequence

Chain tool calls for workflows:

```typescript
class DataPipeline {
  @tool('http-get')
  async fetchData(url: string) {}

  @tool('json-parser')
  async parseJson(content: string) {}

  @tool('file-writer')
  async saveFile(path: string, content: string) {}

  // Workflow method that uses decorators
  async processPipeline(url: string, outputPath: string) {
    // Fetch data
    const response = await this.fetchData(url);
    
    // Parse JSON
    const data = await this.parseJson(response.body);
    
    // Save to file
    await this.saveFile(outputPath, JSON.stringify(data, null, 2));
    
    return data;
  }
}
```

### Conditional Tool Execution

Use decorators within control flow:

```typescript
class SmartAgent {
  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {}

  @tool('weather-api')
  async getWeather(location: string) {}

  async processRequest(type: string, params: Record<string, any>) {
    if (type === 'math') {
      return await this.calculate(
        params.operation,
        params.a,
        params.b
      );
    } else if (type === 'weather') {
      return await this.getWeather(params.location);
    } else {
      throw new Error(`Unknown request type: ${type}`);
    }
  }
}
```

### Parallel Tool Execution

Execute multiple tools concurrently:

```typescript
class ParallelAgent {
  @tool('http-get')
  async fetchUrl(url: string) {}

  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {}

  async executeParallel() {
    // Execute both tools in parallel
    const [data, result] = await Promise.all([
      this.fetchUrl('https://api.example.com/data'),
      this.calculate('multiply', 10, 20),
    ]);

    return { data, result };
  }
}
```

### Tool Composition

Combine results from multiple tools:

```typescript
class CompositeAgent {
  @tool('github-get-user')
  async getUser(username: string) {}

  @tool('github-list-repos')
  async listRepositories(username: string) {}

  @tool('slack-send-message')
  async sendMessage(channel: string, message: string) {}

  async generateUserSummary(username: string) {
    // Get user info
    const user = await this.getUser(username);

    // Get their repositories
    const repos = await this.listRepositories(username);

    // Generate summary
    const summary = `User: ${user.name} has ${repos.length} repositories`;

    // Send to Slack
    await this.sendMessage('#reports', summary);

    return summary;
  }
}
```

## Best Practices

### 1. Initialize Matimo Once

```typescript
// ✅ Good: Initialize once at startup
import { setGlobalMatimoInstance } from 'matimo';

async function initApp() {
  const loader = new ToolLoader('./tools');
  const tools = await loader.loadToolsFromDirectory();
  setGlobalMatimoInstance(matimo);
}

app.listen(3000, initApp);
```

```typescript
// ❌ Bad: Initializing in every request
app.get('/execute', async (req, res) => {
  const loader = new ToolLoader('./tools');  // Don't do this!
  const tools = await loader.loadToolsFromDirectory();
  setGlobalMatimoInstance(matimo);
  // ...
});
```

### 2. Match Parameter Order

```typescript
// Tool definition order: owner, repo, issue_number
// tools/github-get-issue.yaml:
// parameters:
//   owner: string
//   repo: string
//   issue_number: number

// ✅ Correct: Same order as tool definition
class GitHubAgent {
  @tool('github-get-issue')
  async getIssue(owner: string, repo: string, issueNumber: number) {}
}

// ❌ Wrong: Different order causes parameter mismatch
class GitHubAgent {
  @tool('github-get-issue')
  async getIssue(repo: string, owner: string, issueNumber: number) {}
}
```

### 3. Use Type Annotations

```typescript
// ✅ Good: Full type safety
class TypedAgent {
  @tool('calculator')
  async calculate(operation: string, a: number, b: number): Promise<any> {}
}

// ❌ Bad: No type information
class UntypedAgent {
  @tool('calculator')
  async calculate(operation, a, b) {}
}
```

### 4. Handle Errors Properly

```typescript
// ✅ Good: Comprehensive error handling
async function safeToolExecution() {
  try {
    const result = await agent.fetchData(url);
    return result;
  } catch (error) {
    if (error.code === 'INVALID_URL') {
      logger.warn('Invalid URL provided', { url });
      return null;
    } else if (error.code === 'EXECUTION_FAILED') {
      logger.error('Tool execution failed', { error });
      throw error;
    }
    throw error;
  }
}

// ❌ Bad: Silent failures
async function unsafeExecution() {
  try {
    return await agent.fetchData(url);
  } catch {
    // Error silently ignored!
    return undefined;
  }
}
```

### 5. Document Your Tool Methods

```typescript
// ✅ Good: Clear documentation
class DataAgent {
  /**
   * Fetch data from a URL
   * 
   * @param url - The URL to fetch from
   * @returns Promise containing response data
   * @throws {MatimoError} If URL is invalid or request fails
   * 
   * @example
   * const data = await agent.fetchData('https://api.example.com/data');
   */
  @tool('http-get')
  async fetchData(url: string): Promise<any> {}
}
```

## Examples

### Example 1: Simple Calculator

```typescript
import { tool, setGlobalMatimoInstance } from 'matimo';
import { ToolLoader } from 'matimo';

// Initialize
const loader = new ToolLoader('./tools');
const tools = await loader.loadToolsFromDirectory();
setGlobalMatimoInstance(matimo);

// Create agent
class Calculator {
  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {}
}

// Use it
const calc = new Calculator();
console.log(await calc.calculate('add', 5, 3));      // { result: 8 }
console.log(await calc.calculate('multiply', 4, 7));  // { result: 28 }
```

### Example 2: API Integration

```typescript
class GitHubIntegration {
  @tool('github-get-repo')
  async getRepository(owner: string, repo: string) {}

  @tool('github-get-user')
  async getUser(username: string) {}

  @tool('github-list-repos')
  async listRepositories(username: string) {}

  async getUserWithRepos(username: string) {
    const user = await this.getUser(username);
    const repos = await this.listRepositories(username);
    return { user, repos };
  }
}

const github = new GitHubIntegration();
const data = await github.getUserWithRepos('torvalds');
console.log(data);
```

### Example 3: Multi-Tool Workflow

```typescript
class DataProcessor {
  @tool('http-get')
  async fetchData(url: string) {}

  @tool('json-parser')
  async parseJson(content: string) {}

  @tool('file-writer')
  async writeFile(path: string, content: string) {}

  @tool('slack-send-message')
  async notifySlack(channel: string, message: string) {}

  async processAndShare(dataUrl: string, outputPath: string, channel: string) {
    try {
      // Fetch
      const response = await this.fetchData(dataUrl);
      
      // Parse
      const data = await this.parseJson(response.body);
      
      // Save
      await this.writeFile(outputPath, JSON.stringify(data));
      
      // Notify
      await this.notifySlack(channel, `Data processed and saved to ${outputPath}`);
      
      return { success: true, data };
    } catch (error) {
      await this.notifySlack(channel, `❌ Processing failed: ${error.message}`);
      throw error;
    }
  }
}
```

## Troubleshooting

### Error: "Matimo instance not found for tool decorator"

**Cause**: You haven't set the global Matimo instance or passed it to the class instance.

**Solution**:
```typescript
import { setGlobalMatimoInstance } from 'matimo';

// Either set globally
const loader = new ToolLoader('./tools');
const tools = await loader.loadToolsFromDirectory();
setGlobalMatimoInstance(matimo);

// Or pass to instance
class MyAgent {
  constructor(private matimo: MatimoInstance) {}
  @tool('calculator')
  async calculate(a: number, b: number) {}
}
const agent = new MyAgent(matimo);
```

### Error: "Tool not found in registry: calculator"

**Cause**: Tool name in decorator doesn't match tool definition file name.

**Solution**: Check tool file in `tools/` directory:
```typescript
// If tool is at tools/calculator/tool.yaml, name should be "calculator"
@tool('calculator')  // ✅ Correct

// If tool is at tools/math-operations/calculator.yaml, name might be different
@tool('math-operations-calculator')  // Check tool definition
```

### Error: Parameter validation failed

**Cause**: Function parameters don't match tool parameter order or types.

**Solution**: Check tool schema and match parameter order:
```yaml
# tools/calculator/tool.yaml
parameters:
  operation:
    type: string
  a:
    type: number
  b:
    type: number
```

```typescript
// ✅ Correct: Same order and types
@tool('calculator')
async calculate(operation: string, a: number, b: number) {}

// ❌ Wrong: Different order
@tool('calculator')
async calculate(a: number, b: number, operation: string) {}
```

### Decorator Not Working

**Solution**: Ensure `experimentalDecorators` is enabled in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Summary

The Matimo decorator provides:

✅ **Clean API** - No boilerplate code  
✅ **Type Safety** - Full TypeScript support  
✅ **Automatic Validation** - Parameters validated automatically  
✅ **Error Handling** - Standard exception handling  
✅ **Framework Agnostic** - Works with any framework  

For more information, see:
- [Main README](../README.md)
- [Tool Specification](./TOOL_SPECIFICATION.md)
- [Contributing Guide](../CONTRIBUTING.md)
