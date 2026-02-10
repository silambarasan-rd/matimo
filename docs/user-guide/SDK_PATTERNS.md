# SDK Usage Patterns

Learn the three main ways to use Matimo SDK, from simplest to most powerful.

## Pattern 1: Factory Pattern (Recommended for Simple Use Cases)

The factory pattern is the simplest and most ergonomic way to use Matimo.

### Basic Setup

```typescript
import { MatimoInstance } from 'matimo';

// Initialize once
const matimo = await MatimoInstance.init('./tools');
```

### Execute a Tool

```typescript
const result = await matimo.execute('calculator', {
  operation: 'add',
  a: 5,
  b: 3,
});

console.log(result); // { result: 8 }
```

### Discover Tools

```typescript
// List all tools
const allTools = matimo.listTools();
console.log(`Loaded ${allTools.length} tools`);

// Get specific tool
const tool = matimo.getTool('calculator');
console.log(`Tool: ${tool.name} - ${tool.description}`);

// Search tools
const results = matimo.searchTools('email');
results.forEach((t) => console.log(`Found: ${t.name}`));
```

### Handle Errors

```typescript
try {
  const result = await matimo.execute('calculator', {
    operation: 'divide',
    a: 10,
    b: 0, // ⚠️ Will fail
  });
} catch (error) {
  if (error.code === 'TOOL_NOT_FOUND') {
    console.error('Tool not available:', error.message);
  } else if (error.code === 'INVALID_PARAMETERS') {
    console.error('Bad parameters:', error.details);
  } else if (error.code === 'EXECUTION_FAILED') {
    console.error('Tool error:', error.details);
  }
}
```

### Complete Example

```typescript
import { MatimoInstance } from 'matimo';

async function main() {
  try {
    // 1. Initialize
    const matimo = await MatimoInstance.init('./tools');

    // 2. List available tools
    const tools = matimo.listTools();
    console.log(`📦 Loaded ${tools.length} tools`);

    // 3. Execute tool
    const result = await matimo.execute('slack-send-message', {
      channel: '#general',
      text: 'Hello from Matimo!',
    });

    console.log('✅ Message sent:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
```

**Best for:** Scripts, CLI tools, backend services, cron jobs, webhooks

---

## Pattern 2: Decorator Pattern (Recommended for Class-Based Code)

The decorator pattern is ideal for class-based agents and applications with automatic method-to-tool binding.

### Basic Setup

```typescript
import { tool, MatimoInstance, setGlobalMatimoInstance } from 'matimo';

// Initialize Matimo
const matimo = await MatimoInstance.init('./tools');

// Set global instance for decorators to use
setGlobalMatimoInstance(matimo);

// Create agent class
class EmailBot {
  @tool('slack-send-message')
  async sendMessage(channel: string, text: string) {
    // Decorator intercepts this call
    // Arguments map to tool parameters: channel, text
    // Method body is optional - decorator does the execution
  }

  @tool('slack-list-channels')
  async listChannels() {
    // Decorator handles execution
    // Returns the tool result directly
  }
}

// Use it
const bot = new EmailBot();

// When you call bot.sendMessage(), the decorator:
// 1. Maps arguments to parameters: { channel: '#general', text: '...' }
// 2. Calls matimo.execute('slack-send-message', {...})
// 3. Returns the result
await bot.sendMessage('#general', 'Hello from decorator!');
const channels = await bot.listChannels();
```

### How @tool Decorator Works

**Step 1:** Define method with @tool decorator

```typescript
@tool('slack-send-message')
async sendMessage(channel: string, text: string) {
  // Method body is optional (decorator replaces execution)
}
```

**Step 2:** Call the method naturally

```typescript
await bot.sendMessage('#general', 'Hello!');
```

**Step 3:** Decorator intercepts and executes

```
1. Intercept call: sendMessage('#general', 'Hello!')
2. Map args to params: { channel: '#general', text: 'Hello!' }
3. Call matimo.execute('slack-send-message', {...})
4. Return result to caller
```

### Advanced: Multi-Tool Orchestration

```typescript
import { tool, MatimoInstance, setGlobalMatimoInstance } from 'matimo';

class SmartAssistant {
  constructor(private matimo: MatimoInstance) {}

  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {
    // Decorated method for math
  }

  @tool('slack-send-message')
  async notifySlack(channel: string, text: string) {
    // Decorated method for Slack
  }

  // Custom orchestration method (not decorated)
  async runDailyReport(channel: string) {
    // Custom logic using decorated tools
    const result = await this.calculate('add', 100, 50);
    await this.notifySlack(channel, `Daily calculation complete: ${result}`);
  }
}

// Usage
const matimo = await MatimoInstance.init('./tools');
setGlobalMatimoInstance(matimo);

const assistant = new SmartAssistant(matimo);
await assistant.runDailyReport('#reports');
```

**Best for:** Class-based agents, object-oriented design, multi-tool orchestration

---

## Pattern 3: LangChain Integration (Recommended for AI Agents)

For intelligent tool orchestration where the LLM automatically decides which tool to use.

### Basic Setup with convertToolsToLangChain

```typescript
import { MatimoInstance, convertToolsToLangChain } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain/agents';

// 1. Load Matimo tools
const matimo = await MatimoInstance.init('./tools');

// 2. Convert to LangChain format (one line!)
const langchainTools = await convertToolsToLangChain(matimo.listTools(), matimo, {
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
});

// 3. Create LangChain agent
const agent = await createAgent({
  model: new ChatOpenAI({ modelName: 'gpt-4o-mini' }),
  tools: langchainTools,
});

// 4. Run agent
const result = await agent.invoke({
  input: 'Send a Slack message to #general saying "Hello!"',
});

console.log(result.output);
```

### Complete LangChain Example

```typescript
import { MatimoInstance, convertToolsToLangChain } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain/agents';

async function runSlackAgent() {
  // Initialize
  const matimo = await MatimoInstance.init('./tools');

  // Get Slack tools only
  const slackTools = matimo.listTools().filter((t) => t.name.startsWith('slack-'));

  console.log(`📦 Loaded ${slackTools.length} Slack tools`);

  // Convert to LangChain
  const langchainTools = await convertToolsToLangChain(slackTools, matimo, {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
  });

  // Create agent
  const agent = await createAgent({
    model: new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0,
    }),
    tools: langchainTools,
  });

  // Example queries
  const queries = [
    'List all Slack channels',
    'Send a message to #general saying hello',
    'Get user info for john',
  ];

  for (const query of queries) {
    console.log(`\n📝 User: "${query}"`);
    const result = await agent.invoke({ input: query });
    console.log(`🤖 Agent: ${result.output}`);
  }
}

runSlackAgent().catch(console.error);
```

**Best for:** AI agents with automatic tool selection, natural language interfaces, intelligent workflows

---

## Comparison: All Three Patterns

| Feature              | Factory           | Decorator           | LangChain       |
| -------------------- | ----------------- | ------------------- | --------------- |
| **Simplicity**       | ⭐⭐⭐ Simple     | ⭐⭐ Medium         | ⭐⭐ Medium     |
| **Best For**         | Scripts, backends | Classes, multi-tool | AI agents       |
| **Tool Selection**   | Manual (code)     | Manual (code)       | Automatic (LLM) |
| **Type Safety**      | Good              | Excellent           | Good            |
| **Framework**        | Any               | Class-based         | LangChain+      |
| **Learning Curve**   | Low               | Medium              | Medium          |
| **Production Ready** | ✅ Yes            | ✅ Yes              | ✅ Yes          |

---

## Real-World Examples

### Example 1: Backend API (Factory)

```typescript
// Express.js route handler
import express from 'express';
import { MatimoInstance } from 'matimo';

const app = express();
const matimo = await MatimoInstance.init('./tools');

app.post('/api/send-slack', async (req, res) => {
  try {
    const result = await matimo.execute('slack-send-message', {
      channel: req.body.channel,
      text: req.body.text,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000);
```

### Example 2: Class-Based Service (Decorator)

```typescript
// NestJS-style service
import { tool, MatimoInstance, setGlobalMatimoInstance } from 'matimo';

export class NotificationService {
  @tool('slack-send-message')
  async sendSlack(channel: string, message: string) {}

  @tool('gmail-send-email')
  async sendEmail(to: string, subject: string, body: string) {}

  async notifyUser(userId: string, message: string) {
    // Use decorated methods naturally
    await this.sendSlack('#notifications', `User ${userId}: ${message}`);
    await this.sendEmail('admin@example.com', 'Notification', message);
  }
}

// Usage
const matimo = await MatimoInstance.init('./tools');
setGlobalMatimoInstance(matimo);
const service = new NotificationService();
await service.notifyUser('user123', 'Important update');
```

### Example 3: AI Agent (LangChain)

```typescript
// ChatGPT-powered agent
import { MatimoInstance, convertToolsToLangChain } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain/agents';

const matimo = await MatimoInstance.init('./tools');

const tools = await convertToolsToLangChain(matimo.listTools(), matimo);

const agent = await createAgent({
  model: new ChatOpenAI(),
  tools,
});

// Agent automatically picks tools based on user intent
const result = await agent.invoke({
  input: 'Send an email and post to Slack about the Q4 report',
});
```

---

## Error Handling Best Practices

```typescript
import { MatimoError, ErrorCode } from 'matimo';

try {
  const result = await matimo.execute('calculator', {
    operation: 'add',
    a: 5,
    b: 3,
  });
} catch (error) {
  if (error instanceof MatimoError) {
    // Handle Matimo-specific errors
    switch (error.code) {
      case ErrorCode.TOOL_NOT_FOUND:
        console.error(`Tool "${error.details.toolName}" not found`);
        break;
      case ErrorCode.INVALID_PARAMETERS:
        console.error(`Invalid parameters:`, error.details);
        break;
      case ErrorCode.EXECUTION_FAILED:
        console.error(`Execution failed:`, error.details);
        break;
      case ErrorCode.AUTH_FAILED:
        console.error(`Authentication failed:`, error.message);
        break;
      default:
        console.error(`Unknown error:`, error.message);
    }
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

---

## Debugging Tips

### Log Available Tools

```typescript
const matimo = await MatimoInstance.init('./tools');
const tools = matimo.listTools();

console.log('Available tools:');
tools.forEach((t) => {
  console.log(`  - ${t.name}: ${t.description}`);
  console.log(`    Parameters:`, Object.keys(t.parameters || {}));
});
```

### Validate Tool Before Executing

```typescript
const toolName = 'calculator';
const tool = matimo.getTool(toolName);

if (!tool) {
  console.error(`Tool "${toolName}" not found`);
  return;
}

console.log('Tool definition:', tool);
```

### Enable Detailed Error Messages

```typescript
try {
  await matimo.execute('tool-name', params);
} catch (error) {
  console.error('Full error:', JSON.stringify(error, null, 2));
}
```

---

## Next Steps

- **[Framework Integrations](../framework-integrations/LANGCHAIN.md)** — LangChain details & examples
- **[Tool Discovery Guide](./TOOL_DISCOVERY.md)** — Finding and managing tools
- **[API Reference](../api-reference/SDK.md)** — Complete SDK documentation
- **[Examples](../../examples/)** — Working code for all patterns

See [examples/tools/](../../examples/tools/) for complete, runnable examples.
