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
- `slack-get-user` — Get user info

### Gmail Tools
- `gmail-send-email` — Send emails
- `gmail-list-messages` — List messages
- `gmail-get-message` — Get message details
- `gmail-create-draft` — Create drafts
- `gmail-delete-message` — Delete messages

### Utilities
- `calculator` — Math operations
- `echo` — Echo tool (for testing)

---

## Running Examples Step-by-Step

### Setup

```bash
# 1. Clone Matimo repo
git clone https://github.com/tallclub/matimo.git
cd matimo

# 2. Install root dependencies
pnpm install

# 3. Go to examples
cd examples/tools

# 4. Install example dependencies
pnpm install

# 5. Set up environment (copy .env.example if exists)
cp .env.example .env
# Add your Slack/Gmail tokens to .env
```

### Factory Pattern

```bash
# Send Slack message (factory pattern)
pnpm slack:factory

# Output:
# Message sent to #general:
# { success: true, data: { ok: true, ts: '1234567890.123456' } }
```

### Decorator Pattern

```bash
# Send Slack message (decorator pattern)
pnpm slack:decorator

# Output:
# Slack Bot initialized
# Sending message to #general...
# Message sent: { success: true, ... }
```

### LangChain Integration

```bash
# AI agent that uses Slack and Gmail tools
pnpm agent:langchain

# Output (LLM decides tool usage):
# User: "List Slack channels and send a message to #general"
# Agent: I'll help you with that...
# [Calls slack-list-channels tool]
# [Calls slack-send-message tool]
# Agent: Done! Sent message to #general
```

---

## Environment Setup

Create `.env` file with your API tokens:

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-your-token-here

# Gmail
GMAIL_ACCESS_TOKEN=ya29.your-token-here

# OpenAI (for LangChain examples)
OPENAI_API_KEY=sk-your-key-here
```

Get tokens:
- **Slack:** [Create app](https://api.slack.com/apps), get bot token
- **Gmail:** Use OAuth2 flow (see [Gmail setup guide](../../docs/architecture/OAUTH.md))
- **OpenAI:** Get from [platform.openai.com](https://platform.openai.com)

---

## Project Structure

```
examples/tools/
├── agents/
│   ├── factory-pattern-agent.ts     # Factory pattern example
│   ├── decorator-pattern-agent.ts   # Decorator pattern example
│   └── langchain-agent.ts           # LangChain agent example
├── slack/
│   └── (Slack-specific examples)
├── gmail/
│   └── (Gmail-specific examples)
├── .env.example
├── package.json
└── tsconfig.json
```

Each file can be run with `pnpm ts-node {file.ts}` or via package.json scripts.

---

## Next Steps

### Learn More

- **[SDK Patterns Guide](../../docs/user-guide/SDK_PATTERNS.md)** — Deep dive into all patterns
- **[LangChain Integration](../../docs/framework-integrations/LANGCHAIN.md)** — Complete LangChain guide
- **[Tool Discovery](../../docs/user-guide/TOOL_DISCOVERY.md)** — Search and list tools
- **[Testing Guide](../../docs/tool-development/TESTING.md)** — Write tests for tools

### Add Your Own Tools

- **[Tool Specification](../../docs/tool-development/TOOL_SPECIFICATION.md)** — YAML spec reference
- **[Contributing](../../CONTRIBUTING.md)** — Step-by-step tool addition guide
- **[Your First Tool](../../docs/getting-started/YOUR_FIRST_TOOL.md)** — Quick tutorial

### Use in Production

- **[Installation Guide](../../docs/getting-started/installation.md)** — NPM package setup
- **[API Reference](../../docs/api-reference/SDK.md)** — Complete SDK documentation
- **[Error Handling](../../docs/api-reference/ERRORS.md)** — Error codes and handling

---

## Questions?

- 📖 Check [documentation](../../docs)
- 💬 Start a [discussion](https://github.com/tallclub/matimo/discussions)
- 🐛 Found a bug? [Open an issue](https://github.com/tallclub/matimo/issues)
- ⭐ Like it? Star the [repo](https://github.com/tallclub/matimo)

Happy coding! 🚀
- Intelligent automation

---

## Available Tools

### Slack Tools

| Tool | Purpose |
|------|---------|
| `slack_send_channel_message` | Send messages to channels |
| `slack_send_dm` | Send direct messages |
| `slack_upload_file` | Upload files with metadata |
| `slack_add_reaction` | Add emoji reactions |
| `slack_create_channel` | Create new channels |
| `slack_get_channel_history` | Retrieve message history |
| `slack_get_reactions` | Get reactions on messages |
| `slack_get_thread_replies` | Get threaded replies |
| `slack_get_user_info` | Get user profiles |
| `slack_join_channel` | Join channels |
| `slack_reply_to_message` | Reply in threads |
| `slack_search_messages` | Search messages |
| `slack_set_channel_topic` | Update channel topics |

### Gmail Tools

| Tool | Purpose |
|------|---------|
| `gmail_send_email` | Send emails with MIME encoding |
| `gmail_list_messages` | List and filter messages |
| `gmail_get_message` | Get full message details |
| `gmail_create_draft` | Create draft emails |
| `gmail_delete_message` | Delete messages |

### General Tools

| Tool | Purpose |
|------|---------|
| `calculator` | Arithmetic operations |
| `echo-tool` | Echo input (testing) |
| `http-client` | Generic HTTP requests |

---

## Configuration

### Environment Setup

```bash
# Copy the template
cp .env.example .env

# Configure your API keys
export SLACK_BOT_TOKEN=xoxb-your-token
export SLACK_APP_TOKEN=xapp-your-token
export GMAIL_ACCESS_TOKEN=ya29-your-token
export OPENAI_API_KEY=sk-your-key
```

### Slack Setup

1. Create a Slack App: https://api.slack.com/apps
2. Enable Socket Mode
3. Add these scopes:
   - `chat:write` - Send messages
   - `channels:read` - List channels
   - `files:write` - Upload files
   - `reactions:write` - Add reactions
   - `users:read` - Get user info

4. Copy your tokens to `.env`

### Gmail Setup

1. Set up Google Cloud credentials
2. Enable Gmail API
3. Create OAuth2 token
4. Add to `.env`

### OpenAI Setup

1. Get API key from https://platform.openai.com
2. Add `OPENAI_API_KEY=sk-...` to `.env`

---

## Running Examples

### Factory Pattern Examples

```bash
# Slack - Send messages, manage channels, upload files
pnpm slack:factory

# Gmail - List emails, send messages (requires auth)
pnpm gmail:factory

# AI Agent - Uses factory pattern with LLM reasoning
pnpm agent:factory
```

### Decorator Pattern Examples

```bash
# Slack with decorators
pnpm slack:decorator

# Gmail with decorators
pnpm gmail:decorator

# AI Agent with decorators
pnpm agent:decorator
```

### LangChain Integration Examples

```bash
# Slack AI agent - Natural language Slack control
pnpm slack:langchain

# Gmail AI agent - Natural language Gmail control
pnpm gmail:langchain

# General AI agent - Use any tool via natural language
pnpm agent:langchain
```

---

## Pattern Comparison

| Feature | Factory | Decorator | LangChain |
|---------|---------|-----------|-----------|
| Dependencies | Minimal | Minimal | LangChain + OpenAI |
| LLM Required | ❌ No | ❌ No | ✅ Yes (OpenAI) |
| Code Style | Functional | Class-based | Agent-based |
| Learning Curve | Fast | Medium | Medium |
| Best For | Simple scripts | Clean code | AI agents |
| Framework | None | Any | LangChain/CrewAI |
| Performance | Excellent | Excellent | Good |

---

## Key Principles

✅ **Single source of truth** - Tools defined once in YAML  
✅ **Framework agnostic** - Same tools everywhere  
✅ **No duplication** - No custom tool code per pattern  
✅ **Production ready** - Real-world patterns  
✅ **Independent examples** - Each runs standalone  
✅ **Type safe** - Full TypeScript support  

---

## Learning Path

1. **Start here:** `pnpm slack:factory`
   - Understand basic SDK usage
   - See tool execution in action
   - 5 minutes

2. **Then:** `pnpm slack:decorator`
   - Learn class-based patterns
   - Compare with factory pattern
   - 5 minutes

3. **Advanced:** `pnpm slack:langchain`
   - See AI agent integration
   - Natural language control
   - 10 minutes

4. **Combine patterns** in your own apps!

---

## Documentation

- [Slack Tools README](./tools/slack/README.md) - Detailed Slack API guide
- [Slack Test Guide](./SLACK_TEST_GUIDE.md) - Testing strategies
- [Main README](../README.md) - SDK overview

---

## Creating Your Own Patterns

The beauty of Matimo: create any pattern you need!

```typescript
// Import from the SDK package
import { MatimoFactory, ToolLoader, ToolRegistry } from 'matimo';

// Load tools
const matimo = await MatimoFactory.create({
  toolsPath: './tools',
});

// Use with any framework
// - Flask, FastAPI (Python)
// - Express, Fastify (Node.js)
// - CrewAI, LangGraph, Anthropic SDK
// - Custom automation scripts
// - Slack bots, Discord bots
// - Scheduled jobs, webhooks
```

That's the Matimo promise: **define once, use everywhere**.
