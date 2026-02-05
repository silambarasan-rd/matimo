# Matimo Examples

Complete, production-ready examples showcasing three core patterns:

> **"Define tools ONCE in YAML, use them EVERYWHERE"**

---

## Quick Start

```bash
cd examples/tools

# Install dependencies
pnpm install

# Run any example
pnpm slack:factory    # Factory pattern with Slack
pnpm agent:decorator  # Decorator pattern with AI
pnpm agent:langchain  # Full LangChain integration
```

---

## Three Integration Patterns

### 1️⃣ **Factory Pattern** - Direct SDK Usage

**Best for:** Simple scripts, backend services, CLI tools

The simplest approach - instantiate and execute tools directly.

```typescript
import { MatimoInstance } from 'matimo';

// Initialize
const matimo = await MatimoInstance.init('../tools');

// List available tools
const tools = matimo.listTools();
console.log(`Loaded ${tools.length} tools`);

// Execute a tool directly
const result = await matimo.execute('slack_send_channel_message', {
  channel_id: 'C123',
  message: 'Hello from Matimo!',
});

console.log('Message sent:', result);
```

**Examples:**
- `pnpm slack:factory` - Send messages, manage channels
- `pnpm gmail:factory` - List emails, send messages
- `pnpm agent:factory` - AI agent without LLM calls

**Use cases:**
- Backend microservices
- CLI automation tools
- Scheduled jobs (cron)
- Webhook handlers
- API middleware
- Batch processing

---

### 2️⃣ **Decorator Pattern** - Class-Based Usage

**Best for:** Class-based applications, clean code

Use `@tool` decorators to automatically execute tools as class methods.

```typescript
import { MatimoInstance, setGlobalMatimoInstance, tool } from 'matimo';

// Initialize once
const matimo = await MatimoInstance.init('../tools');
setGlobalMatimoInstance(matimo);

// Use decorators in your class
class SlackBot {
  @tool('slack_send_channel_message')
  async sendMessage(channel_id: string, message: string) {
    // Automatically executes via matimo
  }

  @tool('slack_list_channels')
  async listChannels() {
    // Clean, declarative syntax
  }
}

// Use naturally
const bot = new SlackBot();
await bot.sendMessage('C123', 'Hello!');
await bot.listChannels();
```

**Examples:**
- `pnpm slack:decorator` - Slack operations as methods
- `pnpm gmail:decorator` - Gmail operations as methods
- `pnpm agent:decorator` - AI agent with decorators

**Use cases:**
- Class-based agents
- Object-oriented design
- Clean code patterns
- Framework integration
- Dependency injection

---

### 3️⃣ **LangChain Integration** - AI Agents

**Best for:** AI-powered automation, natural language interfaces

Let LLMs decide which tools to use based on user requests.

```typescript
import { MatimoInstance } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIToolsAgent, AgentExecutor } from 'langchain/agents';

// Load tools
const matimo = await MatimoInstance.init('../tools');
const tools = matimo.listTools().map(tool => 
  // Convert to LangChain format
);

// Create AI agent
const llm = new ChatOpenAI({ modelName: 'gpt-4' });
const agent = await createOpenAIToolsAgent({ llm, tools });
const executor = new AgentExecutor({ agent, tools });

// Let AI decide which tools to use
const result = await executor.invoke({
  input: 'List all Slack channels and send a message to #general'
});
```

**Examples:**
- `pnpm slack:langchain` - AI agent with Slack tools
- `pnpm gmail:langchain` - AI agent with Gmail tools
- `pnpm agent:langchain` - General-purpose AI agent

**Use cases:**
- AI chatbots
- Autonomous agents
- Natural language interfaces
- Multi-step reasoning
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
