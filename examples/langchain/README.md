# Matimo + LangChain.js Agent Examples

Three complete, production-ready AI agent examples showing how to integrate **Matimo SDK** with **LangChain.js**.

## 🎯 What These Examples Demonstrate

✅ **Framework-Independent Tool Execution:**
- Matimo loads and manages tools independently
- Tools work the same way in any framework (LangChain, CrewAI, etc.)
- No tool redefinition needed across frameworks
- Simple adapter layer for LangChain integration

✅ **Three SDK Calling Patterns:**
1. **LangChain Official API** (Recommended): Use `createAgent()` with `tool()` function
   - Simplest, fastest, most maintainable approach
   - LangChain handles tool selection and calling automatically
   - Use when: You want production-ready, framework-native integration

2. **Decorator Pattern**: Use `@tool(toolName)` decorator on methods
   - Decorator intercepts calls → executes via Matimo
   - Use when: You want method-based calling style

3. **Factory Pattern**: Direct `matimo.execute(toolName, params)` calls
   - Call Matimo directly → tool executes
   - Use when: You prefer functional style

✅ **Full LangChain Integration:**
- Real OpenAI GPT-4 agent with multi-step reasoning
- Tool orchestration with natural language understanding
- Matimo stays independent of LangChain's details

✅ **Production Ready:**
- Independent npm package setup
- Environment variable management
- Proper TypeScript configuration
- Clean imports from Matimo SDK

## 📦 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs LangChain, Matimo SDK, and all required dependencies.

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Add your OpenAI API key
# Get key from: https://platform.openai.com/api-keys
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
```

### 3. Run LangChain Official API Agent (⭐ Recommended)

```bash
npm run agent:langchain
```

**What it does:**
- Loads all tools from YAML using Matimo SDK
- Converts each tool to LangChain's native tool format
- Uses `createAgent()` for automatic tool orchestration
- LLM intelligently selects and executes tools
- Runs 3 example queries with real Matimo execution

**Pattern:**
```
LLM decides tool needed
         ↓
createAgent() invokes tool
         ↓
LangChain tool() wrapper executes
         ↓
Wrapper calls matimo.execute()
         ↓
Matimo executes via CommandExecutor or HttpExecutor
         ↓
Result flows back through LangChain
```

**Why this approach is best:**
- ✅ Minimal code (~100 lines)
- ✅ Pure LangChain API (no workarounds)
- ✅ Automatic schema generation from Zod
- ✅ Framework handles all complexity
- ✅ Matimo tools execute natively
- ✅ Production-ready out of the box

**Example output:**
```
❓ User: "🧮 What is 42 plus 8?"

  🔌 [MATIMO] Executing tool via Matimo SDK: calculator
  📥 [MATIMO] Input parameters: {"operation":"add","a":42,"b":8}
  ✅ [MATIMO] Execution successful

✅ Agent Response:
42 plus 8 equals 50.
```

### 4. Run Decorator Pattern Agent

```bash
npm run agent:decorator
```

**What it does:**
- Loads all tools from YAML (only those that actually exist)
- Creates agent with `@tool(toolName)` decorated methods
- Decorator intercepts calls → executes via Matimo
- Adapts to LangChain for agent orchestration
- Runs 3 example queries

**Pattern:**
```
Agent Method Call (@tool decorated)
         ↓
Decorator intercepts
         ↓
Matimo registry lookup
         ↓
Execute via Matimo (CommandExecutor or HttpExecutor)
         ↓
Result returned to LangChain
```

### 5. Run Factory Pattern Agent

```bash
npm run agent:factory
```

**What it does:**
- Loads all tools from YAML (only those that actually exist)
- Directly calls `matimo.execute(toolName, params)`
- Simple, straightforward execution model
- Adapts to LangChain for agent orchestration
- Runs 3 example queries

**Pattern:**
```
Direct Matimo Call
        ↓
matimo.execute(toolName, params)
        ↓
Registry lookup & execution
        ↓
Result returned to LangChain
```

## 🔀 Patterns Compared

| Aspect | LangChain Official | Decorator | Factory |
|--------|------------|-----------|---------|
| **Call Style** | `createAgent()` + `tool()` | `await agent.method()` | `await matimo.execute()` |
| **Complexity** | ~100 lines | ~150 lines | ~150 lines |
| **Schema** | Automatic from Zod | Manual mapping | Manual mapping |
| **Tool Binding** | Native LangChain | Decorator intercept | Direct call |
| **Recommended** | ⭐ **Yes** | For class-based | For functional |
| **Production Ready** | ✅ Yes | ✅ Yes | ✅ Yes |

## 📁 Project Structure

```
examples/langchain/
├── agents/
│   ├── langchain-agent.ts              # ⭐ LangChain Official API (recommended)
│   ├── decorator-pattern-agent.ts      # Uses @tool decorator with MatimoInstance
│   └── factory-pattern-agent.ts        # Uses matimo.execute() with MatimoInstance
├── package.json                        # Standalone dependencies (LangChain, Matimo, etc.)
├── tsconfig.json                       # TypeScript configuration
├── .env.example                        # Environment template (OPENAI_API_KEY)
├── test-agents.ts                      # Testing script for tool verification
└── README.md                           # This file

All agents load tools from: `../../tools/` (parent project's tool definitions)

## 🔄 SDK Patterns Explained

## 🛠️ Converting Matimo Tools to LangChain

### Approach 1: Official LangChain API (⭐ Recommended)

Use LangChain's native `tool()` function with Zod schemas:

```typescript
import { tool } from 'langchain';
import { z } from 'zod';
import { MatimoInstance } from 'matimo';

// 1. Load Matimo tools
const matimo = await MatimoInstance.init('./tools');

// 2. Convert each Matimo tool to LangChain tool
function convertMatimoTool(matimo: MatimoInstance, toolName: string) {
  const matimoTool = matimo.getTool(toolName);
  
  // Build Zod schema from Matimo parameters
  const schemaShape = {};
  Object.entries(matimoTool.parameters).forEach(([paramName, param]) => {
    let fieldSchema = z.string(); // Map Matimo types to Zod
    if (!param.required) fieldSchema = fieldSchema.optional();
    schemaShape[paramName] = fieldSchema;
  });
  
  // Create LangChain tool
  return tool(
    async (input) => {
      // Execute via Matimo (the real tool execution)
      const result = await matimo.execute(toolName, input);
      return JSON.stringify(result);
    },
    {
      name: matimoTool.name,
      description: matimoTool.description,
      schema: z.object(schemaShape),
    }
  );
}

// 3. Create agent with tools
const agent = await createAgent({
  model: 'gpt-4o-mini',
  tools: matimoTools.map(t => convertMatimoTool(matimo, t.name)),
});

// 4. Invoke agent
await agent.invoke({
  messages: [{ role: 'user', content: 'What is 42 plus 8?' }],
});
```

**Why this works:**
- ✅ LangChain handles all schema management
- ✅ Automatic parameter validation
- ✅ Native function calling with OpenAI
- ✅ Zero manual schema binding
- ✅ ~10 lines of tool conversion code
- ✅ All Matimo features preserved

### Approach 2: Decorator Pattern

Use Matimo's `@tool()` decorator for method-based calling:

```typescript
import { tool, setGlobalMatimoInstance, MatimoInstance } from 'matimo';

// 1. Load tools from YAML
const matimo = await MatimoInstance.init('./tools');
setGlobalMatimoInstance(matimo);

// 2. Define agent class with decorated methods
class MyAgent {
  // @tool decorator intercepts call and executes via Matimo
  @tool('calculator')
  async calculator(operation: string, a: number, b: number) {
    throw new Error('Decorator handles execution');
  }
}

// 3. Call decorated method
const agent = new MyAgent();
const result = await agent.calculator('add', 5, 3);  // Decorator intercepts → Matimo executes
```

### Approach 3: Factory Pattern

Use `MatimoInstance.init()` then direct `execute()` calls:

```typescript
import { MatimoInstance } from 'matimo';

// 1. Initialize Matimo with tools directory
const matimo = await MatimoInstance.init('./tools');

// 2. List all available tools
const tools = matimo.listTools();

// 3. Execute tools directly
const result = await matimo.execute('calculator', {
  operation: 'add',
  a: 5,
  b: 3,
});
```

## 🔄 How It Works: Matimo + LangChain Integration

The beauty of Matimo is that it stays **completely independent**:

```
┌─────────────────────────────────────────────────────────┐
│ LangChain Agent (framework orchestration)                │
│                                                          │
│  LLM decides: "I need to use calculator tool"            │
│      ↓                                                   │
│  createAgent() invokes tool with user's params           │
│      ↓                                                   │
│  LangChain tool() wrapper receives params                │
│      ↓                                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Matimo Wrapper Function                          │   │
│  │                                                  │   │
│  │  const result = await matimo.execute(            │   │
│  │    'calculator',                                 │   │
│  │    { operation: 'add', a: 42, b: 8 }             │   │
│  │  );                                              │   │
│  │      ↓                                           │   │
│  │  Matimo loads: tools/calculator.yaml             │   │
│  │  Validates params against schema                 │   │
│  │  Executes: node calculator.js --op add 42 8      │   │
│  │  Parses output                                   │   │
│  │      ↓                                           │   │
│  │  Returns: { result: 50 }                         │   │
│  └──────────────────────────────────────────────────┘   │
│      ↓                                                   │
│  Wrapper returns JSON to LangChain                       │
│      ↓                                                   │
│  LLM processes result: "42 + 8 = 50"                     │
└─────────────────────────────────────────────────────────┘
```

**Key insight:** LangChain orchestrates tool selection, Matimo executes the tool.
- ✅ Matimo tools work the same in any framework
- ✅ No framework-specific tool reimplementation
- ✅ Add tool to `tools/*.yaml`, it appears everywhere
- ✅ Changes to tool YAML automatically reflect in all frameworks

## ✅ Verification: Matimo Executes, Not LangChain

When you run `npm run agent:langchain`, you'll see debug output confirming **Matimo is executing**:

```
❓ User: "🧮 What is 42 plus 8?"

  🔌 [MATIMO] Executing tool via Matimo SDK: calculator
  📥 [MATIMO] Input parameters: {"operation":"add","a":42,"b":8}
  ✅ [MATIMO] Execution successful

✅ Agent Response:
42 plus 8 equals 50.
```

This proves:
1. ✅ LangChain selected the `calculator` tool
2. ✅ LangChain called the tool wrapper
3. ✅ **Matimo executed the actual tool** (via CommandExecutor)
4. ✅ Result flowed back through both frameworks

Not a LangChain tool—a **Matimo tool executed through LangChain's orchestration**.

## 🔑 Key Principles

### "Define Tools ONCE, Use EVERYWHERE" - The Matimo Philosophy

Tools are defined in `../../tools/*.yaml` **ONCE**:

```yaml
# tools/calculator.yaml
name: calculator
description: Perform math operations
parameters:
  operation:
    type: string
    enum: [add, subtract, multiply, divide]
  a:
    type: number
  b:
    type: number
execution:
  type: command
  command: node calculator.js
  args: ["--op", "{operation}", "{a}", "{b}"]
```

These same tools are used in:
- ✅ This example: **LangChain agents** (via both patterns)
- ✅ **Matimo SDK direct**: `await matimo.execute('calculator', params)`
- ✅ **MCP Server**: Claude can call them natively
- ✅ **REST API**: HTTP endpoints (Phase 2)
- ✅ **CLI**: Command-line tool runner
- ✅ **CrewAI, LlamaIndex, etc.**: Framework integration

**No duplication. No reimplementation. Pure reusability.**

Both this example's agents use the exact same YAML tools - just different calling patterns.

## 🚀 Available Tools

These examples work with whatever tools are in `../../tools/`:

| Tool | Type | Purpose |
|------|------|---------|
| `calculator` | Command | Math operations (add, subtract, multiply, divide) |
| `echo` | Command | Echo messages back |
| `http` | HTTP | Make HTTP requests (GET, POST, etc.) |

**Framework Independence:** Add any tool to `../../tools/` and it automatically appears in all three agents. No code changes needed.

(See parent project's `tools/` directory for all available tools)

## 🧪 Testing

All agents are fully testable. The parent project's test suite validates all tools:

```bash
# From parent project root
pnpm test test/integration/
```

## 🐛 Troubleshooting

### "Cannot find module 'matimo'"

**Solution:** Make sure parent project is built:
```bash
cd ../..
pnpm build
cd examples/langchain
npm install
```

### "OPENAI_API_KEY is not set"

**Solution:** Create `.env` with your API key:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### LangChain package errors

**Solution:** Reinstall all dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tools not executing

**Solution:** Ensure parent project tools are compiled:
```bash
cd ../..
pnpm build
cd examples/langchain
npm run agent:langchain   # or agent:decorator, agent:factory
```

## 📚 Next Steps

1. **Try all three agents** - compare patterns: `npm run agent:langchain`, `agent:decorator`, `agent:factory`
2. **Modify agent queries** in `agents/*.ts` - change the example prompts
3. **Add custom tools** to `../../tools/` - they auto-appear in all agents
4. **Extend the agents** - add memory, streaming, custom system prompts
5. **Deploy to production** - use Matimo REST API or MCP server

## 🔗 Related Documentation

- [Matimo API Reference](../../docs/API_REFERENCE.md)
- [Tool Specification](../../docs/TOOL_SPECIFICATION.md)
- [Decorator Guide](../../docs/DECORATOR_GUIDE.md)
- [LangChain Documentation](https://docs.langchain.com/)
- [OpenAI API](https://platform.openai.com/docs/)

## 💡 Key Takeaway

This example proves Matimo's core value proposition:

**Define tools ONCE in YAML** ↓  
**Use them EVERYWHERE**: LangChain (3 patterns), SDK, CrewAI, MCP, REST, CLI ↓  
**Zero duplication. Pure productivity.**

All three agents use the exact same Matimo tools with different SDK patterns. That's the Matimo difference.
