# LangChain Integration

## Overview

Matimo tools integrate seamlessly with LangChain for AI-powered agents. This guide shows how to use Matimo tools in LangChain applications.

## v0.1.0-alpha.1 Status

**✅ Implemented**: Direct SDK usage with LangChain tools interface
**🔜 Future**: LangChain adapters and plugins

## Installation

```bash
npm install matimo langchain @langchain/core
# or
pnpm add matimo langchain @langchain/core
```

## Basic Integration

### 1. Load Matimo Tools

```typescript
import { matimo } from 'matimo';

// Initialize Matimo with your tools
const matimoInstance = await matimo.init('./tools');

// Get available tools
const allTools = matimoInstance.listTools();
console.log('Available tools:', allTools.map(t => t.name));
```

### 2. Execute Tools Directly

```typescript
import { matimo } from 'matimo';

const m = await matimo.init('./tools');

// Execute a tool
const result = await m.execute('gmail-send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'World'
});

console.log('Email sent:', result);
```

### 3. Using with LangChain Agents

```typescript
import { matimo } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { Tool } from '@langchain/core/tools';

// Initialize Matimo
const matimoInstance = await matimo.init('./tools');

// Wrap Matimo tools for LangChain
function createLangChainTool(matimoTool): Tool {
  return new Tool({
    name: matimoTool.name,
    description: matimoTool.description,
    func: async (input) => {
      // Parse input and execute
      const params = JSON.parse(input);
      const result = await matimoInstance.execute(
        matimoTool.name,
        params
      );
      return JSON.stringify(result);
    }
  });
}

// Create LangChain tools from Matimo
const langchainTools = matimoInstance
  .listTools()
  .map(tool => createLangChainTool(tool));

// Create LangChain agent
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0
});

const agent = await createOpenAIFunctionsAgent({
  llm: model,
  tools: langchainTools,
  prompt: ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant with access to various tools.'],
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad')
  ])
});

const agentExecutor = new AgentExecutor({
  agent,
  tools: langchainTools,
  verbose: true
});

// Run agent
const result = await agentExecutor.invoke({
  input: 'Send an email to john@example.com saying hello'
});

console.log('Agent response:', result.output);
```

## Decorator Pattern with LangChain

For class-based agents using decorators:

```typescript
import { tool, matimo } from 'matimo';
import { BaseLanguageModel } from '@langchain/core/language_models';

class EmailAgent {
  constructor(private matimoInstance: any) {}

  @tool('gmail-send-email')
  async sendEmail(to: string, subject: string, body: string) {
    // Decorator handles execution
    // Return type is inferred from tool definition
  }

  @tool('gmail-list-messages')
  async listEmails(maxResults?: number) {
    // Automatically calls Matimo executor
  }
}

// Usage with LangChain
const m = await matimo.init('./tools');
const agent = new EmailAgent(m);

// Call decorated methods
await agent.sendEmail(
  'recipient@example.com',
  'Test Subject',
  'Test Body'
);
```

## Working Examples

See [examples/tools/](../../examples/tools/) for complete examples:

- `gmail-langchain.ts` - Gmail tool integration with LangChain
- `gmail-decorator.ts` - Decorator pattern example
- `gmail-factory.ts` - Factory pattern example

Run them:

```bash
cd examples/tools
pnpm install
pnpm gmail:langchain --email:your@email.com
```

## Tool Parameter Mapping

Matimo parameters map directly to LangChain function calls:

```yaml
# Matimo tool definition
parameters:
  email:
    type: string
    required: true
  subject:
    type: string
    required: true
  body:
    type: string
    required: true
```

Becomes in LangChain:

```json
{
  "name": "gmail-send-email",
  "description": "Send an email",
  "parameters": {
    "type": "object",
    "properties": {
      "email": { "type": "string" },
      "subject": { "type": "string" },
      "body": { "type": "string" }
    },
    "required": ["email", "subject", "body"]
  }
}
```

## OAuth2 with LangChain

Tools requiring OAuth2 authentication:

```typescript
// Set OAuth tokens as environment variables
process.env.GMAIL_ACCESS_TOKEN = 'your-access-token';
process.env.GITHUB_TOKEN = 'your-github-token';

// Matimo automatically injects tokens into tools
const result = await matimoInstance.execute('gmail-send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Message'
  // Token is automatically included from environment
});
```

## Error Handling

```typescript
try {
  const result = await agentExecutor.invoke({
    input: 'Send an email'
  });
} catch (error) {
  if (error.code === 'TOOL_NOT_FOUND') {
    console.error('Tool not available:', error.message);
  } else if (error.code === 'INVALID_PARAMETERS') {
    console.error('Invalid parameters:', error.details);
  } else if (error.code === 'EXECUTION_FAILED') {
    console.error('Tool execution failed:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Future Releases

🔜 **v0.2.0** will include:
- Official LangChain adapter package
- Automatic tool schema conversion
- LangChain Tool subclass implementation
- CrewAI integration examples
- Vercel AI SDK integration

---

## Troubleshooting

### Tool Not Found Error

```
Error: Tool not found: gmail-send-email
```

**Solution**: Verify tools are loaded correctly

```typescript
const tools = matimoInstance.listTools();
console.log('Available tools:', tools.map(t => t.name));
```

### OAuth Token Missing

```
Error: Missing OAuth token for provider: google
```

**Solution**: Set environment variable

```bash
export GMAIL_ACCESS_TOKEN=your_token_here
```

### Type Errors with LangChain Tools

Ensure all Matimo tools are properly typed:

```bash
pnpm validate-tools  # Validates all YAML definitions
```

See [Troubleshooting Guide](../troubleshooting/FAQ.md) for more help.
