# SDK Usage Patterns

Learn the three main ways to use Matimo SDK.

## Pattern 1: Factory Pattern (Recommended for Simple Use Cases)

The factory pattern is the simplest and most ergonomic way to use Matimo.

### Basic Setup

```typescript
import { matimo } from 'matimo';

// Initialize once
const m = await matimo.init('./tools');
```

### Execute a Tool

```typescript
const result = await m.execute('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});

console.log(result); // { result: 8 }
```

### Discover Tools

```typescript
// List all tools
const allTools = m.listTools();
console.log(`Loaded ${allTools.length} tools`);

// Get specific tool
const tool = m.getTool('calculator');
console.log(`Tool: ${tool.name} - ${tool.description}`);

// Filter by tags
const mathTools = m.getToolsByTag('math');
mathTools.forEach(t => console.log(`- ${t.name}`));

// Search tools
const results = m.searchTools('email');
results.forEach(t => console.log(`Found: ${t.name}`));
```

### Handle Errors

```typescript
try {
  const result = await m.execute('calculator', {
    operation: 'divide',
    a: 10,
    b: 0  // ⚠️ Will fail
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
import { matimo } from 'matimo';

async function main() {
  try {
    // 1. Initialize
    const m = await matimo.init('./tools');

    // 2. List available tools
    const tools = m.listTools();
    console.log(`📦 Loaded ${tools.length} tools`);

    // 3. Execute tool
    const result = await m.execute('gmail-send-email', {
      to: 'recipient@example.com',
      subject: 'Hello',
      body: 'Message from Matimo'
    });

    console.log('✅ Email sent:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
```

---

## Pattern 2: Decorator Pattern (Recommended for Class-Based Code)

The decorator pattern is ideal for class-based agents and applications.

### Basic Setup

```typescript
import { tool, matimo } from 'matimo';

// Initialize Matimo
const matimoInstance = await matimo.init('./tools');

// Create agent class
class EmailAgent {
  constructor(private matimoInstance: any) {}

  @tool('gmail-send-email')
  async sendEmail(to: string, subject: string, body: string) {
    // Decorator handles execution
    // Method body is optional - decorator does the work
  }

  @tool('gmail-list-messages')
  async listEmails(maxResults?: number) {
    // Executed by decorator
    // Return type inferred from tool definition
  }
}

// Use it
const agent = new EmailAgent(matimoInstance);

// Call decorated methods
await agent.sendEmail(
  'john@example.com',
  'Hello John',
  'This is a test email'
);

const emails = await agent.listEmails(10);
console.log(`Found ${emails.length} emails`);
```

### Advanced: Custom Agent with Multiple Tools

```typescript
import { tool, matimo } from 'matimo';

class AIAssistant {
  constructor(private matimo: any) {}

  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {
    // Decorator auto-executes the calculator tool
    // Argument order matches tool parameters
  }

  @tool('gmail-send-email')
  async sendEmail(to: string, subject: string, body: string) {
    // Send emails as part of workflow
  }

  @tool('gmail-list-messages')
  async checkEmails(maxResults?: number) {
    // List emails
  }

  // Custom methods that use tools
  async runWorkflow(userEmail: string) {
    // Orchestrate tool calls
    const emails = await this.checkEmails(5);
    console.log(`Checking ${emails.length} latest emails`);

    if (emails.length > 0) {
      await this.sendEmail(
        userEmail,
        'Daily Summary',
        `You have ${emails.length} unread emails`
      );
    }
  }
}

// Usage
const matimo = await matimo.init('./tools');
const assistant = new AIAssistant(matimo);

await assistant.runWorkflow('user@example.com');
```

---

## Comparison: Factory vs Decorator

| Feature | Factory | Decorator |
|---------|---------|-----------|
| **Simplicity** | Simple | Requires classes |
| **Best For** | Scripts, backends | Agents, complex apps |
| **Syntax** | `m.execute()` | `@tool()` |
| **Type Safety** | Good | Excellent |
| **Framework Fit** | Any | Class-based |
| **Async/Await** | Required | Required |
| **Error Handling** | Try/catch | Try/catch |

---

## Using Matimo with AI Frameworks

For intelligent tool orchestration with LangChain, CrewAI, Claude SDK, or other AI frameworks where the LLM automatically decides which tool to use, see:

- **[LangChain Integration Guide](../framework-integrations/LANGCHAIN.md)** — Complete patterns with LangChain
  - Official API pattern (recommended)
  - Decorator pattern with LangChain
  - Factory pattern with LangChain
  - Working examples with GPT-4

---

## Patterns in Different Contexts

### Backend API

```typescript
// Express.js route handler
import { matimo } from 'matimo';

const m = await matimo.init('./tools');

app.post('/api/send-email', async (req, res) => {
  try {
    const result = await m.execute('gmail-send-email', {
      to: req.body.to,
      subject: req.body.subject,
      body: req.body.body
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### LangChain Agent

For AI agents that automatically decide which tool to use, see:

**[\u2192 LangChain Integration Guide](../framework-integrations/LANGCHAIN.md)**

Quick example with `convertToolsToLangChain`:

```typescript
import { MatimoInstance, convertToolsToLangChain } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain/agents';

const m = await MatimoInstance.init('./tools');

const langchainTools = await convertToolsToLangChain(
  m.listTools(),
  m,
  { SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN }
);

const agent = await createAgent({
  model: new ChatOpenAI(),
  tools: langchainTools,
});
```

### CLI Tool

```typescript
// Command-line interface
import { matimo } from 'matimo';

const m = await matimo.init('./tools');

const toolName = process.argv[2];
const params = JSON.parse(process.argv[3] || '{}');

const result = await m.execute(toolName, params);
console.log(JSON.stringify(result, null, 2));
```

---

## Error Handling Best Practices

```typescript
import { MatimoError } from 'matimo';

try {
  const result = await m.execute('calculator', params);
} catch (error) {
  if (error instanceof MatimoError) {
    // Handle Matimo-specific errors
    switch (error.code) {
      case 'TOOL_NOT_FOUND':
        console.error(`Tool not available: ${error.message}`);
        break;
      case 'INVALID_PARAMETERS':
        console.error(`Bad parameters: ${JSON.stringify(error.details)}`);
        break;
      case 'EXECUTION_FAILED':
        console.error(`Execution failed: ${error.details}`);
        break;
      default:
        console.error(`Unknown error: ${error.message}`);
    }
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

---

## Next Steps

- **[Tool Discovery Guide](./TOOL_DISCOVERY.md)** — More on finding tools
- **[LangChain Integration](../framework-integrations/LANGCHAIN.md)** — Using with LangChain
- **[Decorator Pattern Guide](../tool-development/DECORATOR_GUIDE.md)** — Deep dive on decorators
- **[API Reference](../api-reference/SDK.md)** — Complete API docs

See [examples/](../../examples/) for working code.
