# 🧰 Matimo — Toolbox For All AI Agents

<p align="center">
  <img src="./docs/assets/logo.png" alt="Matimo Logo" width="200" />
</p>

<p align="center">
    <strong>Matimo - Modular AI Tools - "to be powerful"</strong>
</p>

<p align="center">
  <a href="https://github.com/tallclub/matimo/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/tallclub/matimo/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://www.npmjs.com/package/matimo"><img src="https://img.shields.io/npm/v/matimo.svg?style=for-the-badge" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9+-blue?style=for-the-badge" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge" alt="Node.js"></a>
</p>

**Matimo** is a universal, configuration-driven AI tools ecosystem accessible through **multiple integration paths**. Define tools **once in YAML** and access them via SDK, MCP server, CLI, or HTTP — across any AI framework or agent system.

If you want tools that feel **fast, maintainable, and framework-agnostic**, this is it.

[Documentation](./docs) · [Getting Started](./docs/getting-started/QUICK_START.md) · [API Reference](./docs/api-reference/SDK.md) · [Tool Spec](./docs/tool-development/TOOL_SPECIFICATION.md) · [GitHub](https://github.com/tallclub/matimo) · [Why Matimo?](#why-matimo)

## Quick Start (TL;DR)

Runtime: **Node ≥18**, **pnpm 8.15+**

```bash
# Clone and install
git clone https://github.com/tallclub/matimo.git
cd matimo
pnpm install
pnpm build

# Run tests
pnpm test

# Start using
const { matimo } = require('matimo');
const m = await matimo.init('./tools');
const result = await m.execute('calculator', { operation: 'add', a: 5, b: 3 });
```

Prefer factory pattern (simple) or decorator pattern (class-based code). See [SDK Usage Patterns - Level 1](#level-1-pure-sdk-patterns-no-framework-required) for details.

---

## Why Matimo?

### The Problem It Solves

Building agent workflows is exciting but painful: every framework (LangChain, CrewAI, AutoGen, LlamaIndex, custom TS agents, Claude via MCP, etc.) has its own way of defining, calling, and executing tools.

You end up duplicating tool logic, schemas, and integrations repeatedly.

**Matimo fixes this.** Define tools **once** in clean YAML files (with Zod validation for safety) and use them everywhere:

- **Pure TypeScript SDK** (factory or decorator patterns)
- **LangChain** (examples included)
- **MCP Server** (Claude-native) — coming soon
- **REST API** — coming soon
- **CLI** — coming soon
- **Python SDK** — coming soon
- **Tool Marketplace** (2000+ tools goal) — coming soon

**Define once → Plug into any agent ecosystem.**

### Why Open Source?

I built Matimo because I needed it while working on my own agent product — and I couldn't find a truly framework-agnostic, fully open-source alternative (most are paid or tightly coupled to one framework).

I'm a solo developer (nomadic coder at heart), so this project needs **your help** to become the go-to standard for agent tools.

### How You Can Help Right Now

- ⭐ **Star the repo** to show support and increase visibility
- 🐛 **Open issues** for bugs, missing features, or pain points
- 💡 **Suggest tools** to add (YAML examples welcome!)
- 🔀 **Submit PRs** — we follow TDD + Conventional Commits (see CONTRIBUTING.md)
- 📢 **Spread the word** on X/Twitter, Reddit (r/LocalLLM, r/AI_Agents, etc.), Discord communities

Let's build a simple, powerful shovel for the agentic world together.

With ❤️ 
[Sajesh](https://www.linkedin.com/in/sajeshnair/)  
Creator of Matimo

---

## Built so far

**SDK with 2 Patterns**

- Factory pattern (simple, recommended)
- Decorator pattern (class-based agents)

**Tool Execution & Discovery**

- YAML/JSON tool definitions with validation
- Command executor (shell commands + parameter templating)
- HTTP executor (REST APIs with auth)
- Tool registry with search, filter, discover

**Quality & Type Safety**

- 100% test passing
- Full TypeScript strict mode (zero `any` types)
- Zod schema validation
- ESLint clean

**3 Example Tools**

- Calculator (command execution)
- HTTP Client (HTTP execution)
- Echo Tool (simple command)

## Planned

**MCP Server** — Claude & MCP client integration
**REST API** — HTTP endpoints for tool execution
**CLI** — Command-line tool management & testing
**OAuth2** — GitHub, Google, Slack authentication
**Python SDK** — Multi-language support
**Health Monitoring** — Detect API schema changes
**Rate Limiting** — Token bucket algorithm per tool
**Tool Marketplace** — Community tools & registry

## Installation

```bash
# Coming soon to npm
npm install matimo
pnpm add matimo

# For now: clone and build locally
git clone https://github.com/tallclub/matimo.git
cd matimo && pnpm install && pnpm build
```

## SDK Usage Patterns

### Level 1: Pure SDK Patterns (No Framework Required)

Use Matimo directly without any AI framework. Perfect for CLI tools, backends, scheduled jobs, and simple integrations.

#### 1. Factory Pattern (Recommended for Simple Use Cases)

Simplest, ergonomic, single-initialization API:

```typescript
import { matimo } from 'matimo';

// Initialize once
const matimoInstance = await matimo.init('./tools');

// Execute tools by name
const result = await matimoInstance.execute('calculator', {
  operation: 'add',
  a: 5,
  b: 3,
});

// Discover tools
const allTools = matimoInstance.listTools();
const tool = matimoInstance.getTool('calculator');
const mathTools = matimoInstance.getToolsByTag('math');
const results = matimoInstance.searchTools('calculator');
```

**Use when:** You need simple tool execution without LLM orchestration.

#### 2. Decorator Pattern (Recommended for Class-Based Code)

For class-based applications with automatic tool binding:

```typescript
import { tool } from 'matimo';
import { matimo } from 'matimo';

// Initialize Matimo (once)
const matimoInstance = await matimo.init('./tools');

// NOTE: `setGlobalMatimoInstance()` is convenient for quick demos.
// For production code prefer explicit injection (constructor/factory) or an explicit binder.

// Constructor / DI example (recommended for production)
class MyAgent {
  constructor(public matimo: MatimoInstance) {}

  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {
    // @tool decorator intercepts this call
    // Argument order matches tool parameters: operation, a, b
    // Method body can be empty - decorator does the work
  }

  @tool('github-get-repo')
  async getRepo(owner: string, repo: string) {
    // @tool decorator intercepts this call
    // Argument order matches tool parameters: owner, repo
    // Method body can be empty - decorator does the work
  }
}

const agent = new MyAgent(matimoInstance);
// When you call agent.calculate('add', 5, 3):
// 1. @tool decorator intercepts the call
// 2. Decorator maps arguments to parameters: { operation: 'add', a: 5, b: 3 }
// 3. Decorator calls matimo.execute('calculator', {...})
// 4. Result is returned to you
const result = await agent.calculate('add', 5, 3);
```

**Use when:** You prefer method-based calling style or class-based architecture.

**How @tool decorator works:**

- ✅ **Intercepts method calls** - Decorator intercepts and executes via Matimo
- ✅ **Auto-maps arguments** - Method args become tool parameters (in order)
- ✅ **Auto-executes tool** - Calls `matimo.execute(toolName, params)` automatically
- ✅ **Returns tool result** - The result from Matimo is returned to you
- ✅ **Fully scalable** - Add 100 tools = just add 100 `@tool()` decorated methods, no routing code
- ✅ **Works with DI** - Uses instance property or global instance
- ✅ **Method body optional** - Can be empty since decorator replaces it

### Level 2: Framework Integration Patterns (With AI Framework)

Integrate Matimo tools with LangChain(TS), CrewAI (coming soon) , or other AI frameworks for intelligent tool orchestration. The LLM automatically decides which tool to use.

#### LangChain Integration (Recommended for AI Agents)

Three complete, production-ready examples in [examples/langchain](./examples/langchain):

1. **LangChain Official API** (⭐ Most Recommended)
   - Uses `createAgent()` + `tool()` from LangChain core
   - Automatic schema generation and tool orchestration
   - [See example](./examples/langchain/agents/langchain-agent.ts)

2. **Decorator Pattern with LangChain**
   - Uses `@tool()` decorators with OpenAI function calling
   - Integrates Matimo tools into class-based LangChain agents
   - [See example](./examples/langchain/agents/decorator-pattern-agent.ts)

3. **Factory Pattern with LangChain**
   - Direct `matimo.execute()` calls in LangChain agent
   - Simple functional approach
   - [See example](./examples/langchain/agents/factory-pattern-agent.ts)

All examples load tools from YAML once and reuse them across patterns — **single source of truth**.

**Quick Start:** See [examples/langchain/README.md](./examples/langchain/README.md) for setup instructions and running the agents.

**Use when:** You need intelligent tool selection based on natural language prompts.

## Integration Paths

### SDK (Available Now)

**Level 1: Pure SDK** (No framework required)

- **Factory Pattern** — Simplest API for any use case
- **Decorator Pattern** — Best for class-based code

See [SDK Usage Patterns - Level 1](#level-1-pure-sdk-patterns-no-framework-required) above for examples.

**Level 2: Framework Integration** (With AI framework)

- **LangChain Integration** — Production-ready AI agents with OpenAI GPT
- **CrewAI Integration** — Coming in Phase 2
- **Anthropic SDK Integration** — Coming in Phase 2

See [SDK Usage Patterns - Level 2](#level-2-framework-integration-patterns-with-ai-framework) above and [examples/langchain/README.md](./examples/langchain/README.md) for complete working examples.

### Advanced (Coming Soon)

**MCP Server (Claude Integration)**

```typescript
import { MCPServer } from 'matimo/mcp';

const server = new MCPServer({
  toolsPath: './tools',
  autoLoad: true,
});

await server.start();
// Claude can now discover and call all loaded tools
```

**REST API (HTTP Endpoints)**

```bash
# Coming soon
matimo api --port 3000

curl -X POST http://localhost:3000/tools/calculator/execute \
  -d '{"operation":"add","a":5,"b":3}'
```

**CLI (Command Line)**

```bash
matimo list                                    # List all tools
matimo execute calculator --operation add --a 5 --b 3
matimo validate tools/calculator.yaml          # Validate tool YAML
matimo test calculator                         # Test tool
```

## Tool Definition (YAML)

Tools are defined once in YAML, executed everywhere. Each tool specifies its execution type, parameters, schema, and auth:

```yaml
name: calculator
version: 1.0.0
description: Perform basic mathematical operations

parameters:
  operation:
    type: string
    enum: [add, subtract, multiply, divide]
    required: true
    description: Mathematical operation
  a:
    type: number
    required: true
    description: First operand
  b:
    type: number
    required: true
    description: Second operand

execution:
  type: command
  command: ts-node
  args: ['tools/calculator/calculator.ts', '{operation}', '{a}', '{b}']
  timeout: 30000

output_schema:
  type: object
  properties:
    result:
      type: number
      description: Calculation result

error_handling:
  retry: 3
  backoff_type: exponential
  initial_delay_ms: 1000
```

### Execution Types

**Implemented:**

- **`command`** — Shell commands with parameter templating
- **`http`** — REST APIs with auth and response validation

**Coming:**

- **`script`** — Safe JavaScript/Python execution (sandboxed)
- **`docker`** — Containerized execution
- **`custom`** — External executables

## Architecture

```
┌─────────────────────────────────────────────┐
│ AI Agents & Frameworks                      │
│ (Claude, LangChain, CrewAI, Custom)        │
└──────────┬────────────────┬────────────────┘
           │                │
     ┌─────▼─────┐   ┌─────▼─────┐
     │  SDK      │   │  MCP      │
     │           │   │           │
     └─────┬─────┘   └─────┬─────┘
           │                │
           └────────┬───────┘
                    │
         ┌──────────▼──────────┐
         │  Matimo Core        │
         │  - Loader           │
         │  - Validator        │
         │  - Executors        │
         └──────────┬──────────┘
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
   ┌────────┐  ┌──────────┐  ┌────────┐
   │Command │  │   HTTP   │  │ Schema │
   │Exec    │  │  Exec    │  │Validate│
   └────────┘  └──────────┘  └────────┘
       │            │            │
       └────────────┼────────────┘
                    │
        ┌───────────▼───────────┐
        │ Tool Definitions      │
        │ (YAML/JSON files)     │
        │ calculator            │
        │ http-client           │
        │ echo-tool             │
        │ 1000+ coming soon     │
        └───────────────────────┘
```

## Project Structure

```
matimo/
├── src/
│   ├── core/                    # Core types, schemas
│   ├── executors/               # Command & HTTP execution
│   ├── decorators/              # @tool decorator pattern
│   ├── mcp/                     # MCP server
│   ├── cli/                     # CLI interface
│   ├── errors/                  # Error handling
│   └── logging/                 # Structured logging
├── tools/
│   ├── calculator/              # Calculator tool
│   ├── echo-tool/               # Echo tool
│   └── http-client/             # HTTP client tool
├── test/                        # tests
│   ├── unit/
│   └── integration/
├── docs/
│   ├── quick-start.md
│   ├── api.md
│   ├── tool-spec.md
│   └── ...
└── package.json
```

## Development

### Prerequisites

- **Node.js** 18+
- **pnpm** 8.15+
- **TypeScript** 5.9+

### Setup

```bash
git clone https://github.com/tallclub/matimo.git
cd matimo
pnpm install
pnpm build
```

### Commands

```bash
pnpm build          # Compile TypeScript
pnpm test           # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # Coverage report
pnpm lint          # ESLint
pnpm format        # Prettier formatting
```

### Testing

Matimo uses Jest with TypeScript. Tests follow TDD principles:

```bash
pnpm test                       # All tests
pnpm test types.test.ts         # Specific file
pnpm test:watch                 # Watch mode
pnpm test:coverage              # Coverage (target: 80%+)
```

**Coverage Target:** 80%+ (currently 112 tests, 11+ suites)

## Community

We welcome contributions!

### Getting Started

1. **Fork** the repository
2. **Create branch** (`git checkout -b feature/amazing-feature`)
3. **Write tests first** (TDD approach)
4. **Make changes**
5. **Run tests** (`pnpm test && pnpm lint`)
6. **Commit** with conventional commits
7. **Push** and open PR

### Commit Format

We enforce [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): short description
fix(executor): validate parameters
docs(readme): update guide
test(decorator): add tests
```

### What Can You Contribute?

- Core SDK improvements
- Bug fixes
- Documentation
- Test coverage
- Tool definitions
- New executor types
- Performance optimizations
- Security
- Ideas

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Documentation

- **[Quick Start](./docs/getting-started/QUICK_START.md)** — Get up and running in 5 minutes
- **[API Reference](./docs/api-reference/SDK.md)** — Complete SDK API
- **[Tool Specification](./docs/tool-development/TOOL_SPECIFICATION.md)** — How to write YAML tools
- **[Decorator Guide](./docs/tool-development/DECORATOR_GUIDE.md)** — Using @tool decorators
- **[Commit Guidelines](./docs/community/COMMIT_GUIDELINES.md)** — Conventional commits
- **[Development Standards](./docs/user-guide/DEVELOPMENT_STANDARDS.md)** — Code quality rules
- **[Architecture Overview](./docs/architecture/OVERVIEW.md)** — System design and patterns
- **[Framework Integrations](./docs/framework-integrations/LANGCHAIN.md)** — LangChain, CrewAI patterns

## Roadmap

### Foundation (Complete)

**Completed:**

- Tool loading (YAML/JSON)
- Command & HTTP executors
- Factory & Decorator patterns
- Tool registry & discovery
- 112+ tests (100% passing)
- Full TypeScript strict mode

### Reliability (Coming)

**Upcoming:**

- MCP server (Claude integration)
- CLI tool management
- REST API server
- OAuth2 authentication
- Rate limiting
- Health monitoring

### Ecosystem (Coming)

**Future:**

- Python SDK
- MCP
- Skills/Workflows (multi-tool orchestration)
- 2000+ pre-configured tools

## Performance Benchemark Expected

- **Tool Execution:** <100ms overhead per call
- **Schema Validation:** <10ms per request
- **Memory:** ~50MB base + 1-2MB per loaded tool
- **Concurrency:** 100+ simultaneous tools

## Security

### Implemented

**Currently:**

- No hardcoded credentials (environment variables only)
- Input validation (Zod schemas)
- Safe error messages (no secret leaks)
- Full TypeScript strict mode

### Coming

**Next:**

- Response validation against schemas
- Health monitoring (detect API changes)
- OAuth2 token management
- Rate limiting

**Future:**

- Sandboxed execution (Docker/Firejail)
- Encryption at rest
- Audit logging
- Zero-trust architecture

See [SECURITY.md](./SECURITY.md) for detailed guidelines.

## License

MIT © 2026 Matimo Contributors

## Support

- 📖 [Docs](./docs)
- 💬 [Discussions](https://github.com/tallclub/matimo/discussions)
- 🐛 [Issues](https://github.com/tallclub/matimo/issues)

## Contributors

![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=for-the-badge)

Huge thanks to everyone who’s contributed to Matimo! Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tallclub/matimo&type=date&legend=top-left)](https://www.star-history.com/#tallclub/matimo&type=date&legend=top-left)

---

**Ready to integrate AI tools across your framework?**

[Get Started Now →](./docs/QUICK_START.md)
