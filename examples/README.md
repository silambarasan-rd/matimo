# Matimo Examples

Two independent, production-ready examples showcasing Matimo's core value:

> **"Define tools ONCE in YAML, use them EVERYWHERE"**

## Pattern 1: SDK Direct

**File:** `01-sdk-direct.ts`

Pure Matimo SDK usage - no frameworks, no LLM, no complexity.

```bash
cd examples
npx tsx 01-sdk-direct.ts
```

**Use cases:**
- Backend services and microservices
- CLI automation tools
- Scheduled jobs and cron tasks
- Middleware and API handlers
- Any pure TypeScript/Node.js application

**What it shows:**
- Load tools from YAML
- Execute tools directly
- Zero external dependencies
- Simple, straightforward patterns

---

## Pattern 2: LangChain Integration

**File:** `02-langchain-integration.ts`

Integrate Matimo tools with LangChain.js for AI agents.

```bash
cd examples

# Direct mode (no LLM required)
npx tsx 02-langchain-integration.ts

# LLM mode (requires OPENAI_API_KEY)
npx tsx 02-langchain-integration.ts llm
```

**Use cases:**
- AI agents with natural language understanding
- LLM-powered automation
- Intelligent tool orchestration
- Multi-step reasoning with chain-of-thought
- Framework integration (CrewAI, Anthropic SDK, etc.)

**What it shows:**
- Loading Matimo tools in LangChain
- Converting tools to StructuredTools
- Creating AI agents with GPT-4
- Tool discovery and execution via natural language
- Framework integration patterns

---

## Key Philosophy

Both examples demonstrate:

✅ **Single source of truth** - Tools defined once in `../tools/*.yaml`  
✅ **Framework agnostic** - Same tools work with any SDK, framework, or integration  
✅ **No duplication** - No custom tool definitions per example  
✅ **Production ready** - Real-world patterns and best practices  
✅ **Independent** - Each example can run standalone  

---

## Quick Comparison

| Feature | SDK Direct | LangChain |
|---------|-----------|-----------|
| Dependencies | Minimal | LangChain + OpenAI |
| LLM Required | ❌ No | ✅ Optional (direct mode included) |
| Framework | None | LangChain.js |
| Use Case | Backend, CLI | AI Agents, Automation |
| Complexity | Simple | Medium |
| Learning Curve | Fast | Medium |

---

## Next Steps

1. **Run Pattern 1** first to understand basic SDK usage
2. **Run Pattern 2 (direct mode)** to see framework integration
3. **Run Pattern 2 (LLM mode)** to build AI agents
4. **Combine patterns** in your own applications

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
