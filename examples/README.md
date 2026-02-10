# Matimo Examples

Complete, production-ready examples showcasing **three core patterns**:

> **"Define tools ONCE in YAML, use them EVERYWHERE"**

---

## Quick Start

```bash
cd examples/tools

# Install dependencies
pnpm install

# Run examples
pnpm slack:factory      # Factory pattern
pnpm slack:decorator    # Decorator pattern
pnpm slack:langchain    # LangChain integration
pnpm gmail:factory      # Gmail factory
pnpm gmail:decorator    # Gmail decorator
pnpm gmail:langchain    # Gmail LangChain
pnpm agent:factory      # Generic agent (factory)
pnpm agent:decorator    # Generic agent (decorator)
pnpm agent:langchain    # AI agent with LangChain
```

---

## Three Integration Patterns

### 1️⃣ **Factory Pattern** - Direct SDK Usage (Simplest)

**Best for:** Simple scripts, backend services, CLI tools, microservices

The factory pattern is the easiest way to use Matimo — initialize once, execute tools by name.

#### Basic Example

```typescript
import { MatimoInstance } from 'matimo';

// Initialize
const matimo = await MatimoInstance.init('./tools');

// List tools
console.log('Available tools:', matimo.listTools().map(t => t.name));

// Execute tool
const result = await matimo.execute('slack-send-message', {
  channel: '#general',
  text: 'Hello from Matimo!'
});

console.log('Result:', result);
```

#### File: [examples/tools/agents/factory-pattern-agent.ts](agents/factory-pattern-agent.ts)

Shows:
- Loading tools with `MatimoInstance.init()`
- Listing available tools
- Executing tools with parameters
- Error handling
- Real Slack tool execution

#### Real-World Use Cases

- **Express.js route handler** — POST endpoint that calls a tool
- **AWS Lambda function** — Serverless tool executor
- **Cron job** — Scheduled tool execution
- **Webhook receiver** — Trigger tools on external events
- **CLI automation** — Command-line tool wrapper

---

### 2️⃣ **Decorator Pattern** - Class-Based (Clean Code)

**Best for:** Class-based applications, clean architecture, multi-tool orchestration

Use `@tool` decorators to automatically execute tools as class methods.

#### Basic Example

```typescript
import { MatimoInstance, setGlobalMatimoInstance, tool } from 'matimo';

// Initialize Matimo
const matimo = await MatimoInstance.init('./tools');
setGlobalMatimoInstance(matimo);

// Use decorators in your class
class SlackBot {
  @tool('slack-send-message')
  async sendMessage(channel: string, text: string) {
    // Decorator auto-executes — method body optional
  }

  @tool('slack-list-channels')
  async listChannels() {
    // Automatically executed via decorator
  }
}

// Use naturally
const bot = new SlackBot();
await bot.sendMessage('#general', 'Hello!');
const channels = await bot.listChannels();
console.log('Channels:', channels);
```

#### File: [examples/tools/agents/decorator-pattern-agent.ts](agents/decorator-pattern-agent.ts)

Shows:
- Global Matimo instance setup
- `@tool` decorator usage
- Class-based orchestration
- Chaining multiple decorated methods
- Clean, readable code

#### Real-World Use Cases

- **Class-based agents** — AI agents with method decorators
- **Object-oriented design** — Clean architecture patterns
- **Dependency injection** — Framework integration (NestJS, etc.)
- **Microservices** — Service classes with tool integrations
- **Test doubles** — Mock decorators for testing

---

### 3️⃣ **LangChain Integration** - AI Agents (Most Powerful)

**Best for:** AI-powered automation, natural language interfaces, intelligent tool selection

Use Matimo tools with LangChain to let LLMs decide which tools to use.

#### Basic Example

```typescript
import { MatimoInstance, convertToolsToLangChain } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain/agents';

// 1. Load Matimo tools
const matimo = await MatimoInstance.init('./tools');

// 2. Convert to LangChain format
const langchainTools = await convertToolsToLangChain(
  matimo.listTools().filter(t => t.name.startsWith('slack-')),
  matimo,
  { SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN! }
);

// 3. Create LangChain agent
const agent = await createAgent({
  model: new ChatOpenAI({ modelName: 'gpt-4o-mini' }),
  tools: langchainTools,
});

// 4. Run it — LLM decides which tool to use
const result = await agent.invoke({
  input: 'List all Slack channels and send a message to #general saying hello'
});

console.log('Agent response:', result.output);
```

#### File: [examples/tools/agents/langchain-agent.ts](agents/langchain-agent.ts)

Shows:
- `convertToolsToLangChain()` API
- LangChain agent setup
- Tool filtering and auth injection
- Multi-step reasoning
- Full workflow execution

#### Real-World Use Cases

- **AI chatbots** — Chat interfaces with tool access
- **Autonomous agents** — Self-directed tool execution
- **Natural language interfaces** — "Do X using tools"
- **Multi-step workflows** — Complex tool chains
- **Research agents** — Info gathering and processing

---

## Feature Comparison

| Feature | Factory | Decorator | LangChain |
|---------|---------|-----------|-----------|
| **Simplicity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Best For** | Scripts, APIs | Classes | AI agents |
| **Syntax** | `execute()` | `@tool()` | `agent.invoke()` |
| **Type Safety** | Good | Excellent | Excellent |
| **Framework** | Any | Any | LangChain required |
| **Async/Await** | Required | Required | Built-in |
| **Error Handling** | Manual | Manual | LLM-driven |

---

## Tool Categories

All examples use these tools (real implementations):

### Slack Tools
- `slack-send-message` — Send channel messages
- `slack-list-channels` — List all channels
- `slack_get_channel_history` — Retrieve message history from a channel
- `slack_add_reaction` — Add emoji reactions
- `slack_get_user_info` — Get user profiles
- `slack_send_dm` — Send direct messages

### Gmail Tools
- `gmail-send-email` — Send emails
- `gmail-list-messages` — List messages
- `gmail-get-message` — Get message details
- `gmail-create-draft` — Create drafts

### Utilities
- `calculator` — Math operations
- `echo-tool` — Echo tool (for testing)

---

## Running Examples Step-by-Step

### Setup

```bash
# 1. Clone Matimo repo
git clone https://github.com/tallclub/matimo.git
cd matimo

# 2. Install root dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Go to examples
cd examples/tools

# 5. Install example dependencies
pnpm install

# 6. Set up environment
cp .env.example .env
# Add your Slack/Gmail tokens to .env
```

### Factory Pattern

```bash
# Slack - Send message (factory pattern)
pnpm slack:factory

# Gmail - Send email (factory pattern)
pnpm gmail:factory

# Generic agent (factory pattern)
pnpm agent:factory
```

### Decorator Pattern

```bash
# Slack with decorators
pnpm slack:decorator

# Gmail with decorators
pnpm gmail:decorator

# Generic agent (decorator pattern)
pnpm agent:decorator
```

### LangChain Integration

```bash
# Slack AI agent - Let GPT decide which Slack tool to use
pnpm slack:langchain

# Gmail AI agent - Let GPT handle Gmail
pnpm gmail:langchain

# General AI agent - Full tool access via natural language
pnpm agent:langchain
```

---

## Environment Setup

Create `.env` file in `examples/tools/` with your API tokens:

```bash
# Slack (get from https://api.slack.com/apps)
SLACK_BOT_TOKEN=xoxb-your-token-here

# Gmail (see docs for OAuth2 setup)
GMAIL_ACCESS_TOKEN=ya29.your-token-here

# OpenAI (for LangChain examples, from platform.openai.com)
OPENAI_API_KEY=sk-your-key-here
```

---

## Project Structure

```
examples/tools/
├── agents/
│   ├── factory-pattern-agent.ts      # Factory pattern
│   ├── decorator-pattern-agent.ts    # Decorator pattern
│   └── langchain-agent.ts            # LangChain agent
├── slack/
│   ├── slack-factory.ts              # Slack factory example
│   ├── slack-decorator.ts            # Slack decorator example
│   └── slack-langchain.ts            # Slack + LangChain
├── gmail/
│   ├── gmail-factory.ts              # Gmail factory example
│   ├── gmail-decorator.ts            # Gmail decorator example
│   └── gmail-langchain.ts            # Gmail + LangChain
├── .env.example
├── package.json
└── tsconfig.json
```

Each file is a complete, runnable example.

---

## Next Steps

- **[SDK Patterns Guide](../../docs/user-guide/SDK_PATTERNS.md)** — Deep dive into all three patterns
- **[LangChain Integration](../../docs/framework-integrations/LANGCHAIN.md)** — Complete LangChain guide
- **[Architecture Overview](../../docs/architecture/OVERVIEW.md)** — How Matimo works
- **[Quick Start](../../docs/getting-started/QUICK_START.md)** — 5-minute getting started guide

---

## Questions?

- 📖 [Documentation](../../docs)
- 💬 [GitHub Discussions](https://github.com/tallclub/matimo/discussions)
- 🐛 [Report Issues](https://github.com/tallclub/matimo/issues)
- ⭐ [Star the repo!](https://github.com/tallclub/matimo)

Happy coding! 🚀
