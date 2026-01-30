# 🧰 Matimo — Toolbox For All AI Agents

<p align="center">
    <strong>Maximum AI Tools in Modular Objects - matimo - "to be powerful"</strong>
</p>

<p align="center">
  <a href="https://github.com/tallclub/matimo/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/tallclub/matimo/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://www.npmjs.com/package/matimo"><img src="https://img.shields.io/npm/v/matimo.svg?style=for-the-badge" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge" alt="TypeScript"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge" alt="Node.js"></a>
</p>

**Matimo** is a universal, configuration-driven AI tools ecosystem accessible through **multiple integration paths**. Define tools **once in YAML** and access them via SDK, MCP server, CLI, or HTTP — across any AI framework or agent system.

If you want tools that feel **fast, maintainable, and framework-agnostic**, this is it.

[Documentation](./docs) · [Getting Started](./docs/quick-start.md) · [API Reference](./docs/api.md) · [Tool Spec](./docs/tool-spec.md) · [GitHub](https://github.com/tallclub/matimo)

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

Prefer factory pattern (simple) or decorator pattern (class-based agents). See [SDK Approaches](#sdk-approaches) for details.

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

## SDK Approaches

### 1. Factory Pattern (Recommended)

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

### 2. Decorator Pattern

For class-based agents with automatic tool binding:

```typescript
import { tool, setGlobalMatimoInstance } from 'matimo';
import { matimo } from 'matimo';

// Initialize globally
const matimoInstance = await matimo.init('./tools');
setGlobalMatimoInstance(matimoInstance);

// Define agent with tool decorators
class MyAgent {
  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {
    // Tool automatically executed with validation
  }

  @tool('github-get-repo')
  async getRepo(owner: string, repo: string) {
    // Same — fully automatic
  }
}

const agent = new MyAgent();
const result = await agent.calculate('add', 5, 3);
```

## Integration Paths

### SDK (Available Now)

- **Factory Pattern** — Simplest API for any use case
- **Decorator Pattern** — Best for class-based agents
- **Direct Executor Access** — Low-level control when needed

See [SDK Approaches](#sdk-approaches) above for examples.

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

## API Reference

### Factory Pattern (Recommended)

```typescript
import { matimo } from 'matimo';

const m = await matimo.init('./tools');

// Execute
m.execute(toolName, parameters); // Execute tool by name
m.getTool(name); // Get tool definition
m.listTools(); // List all tools
m.searchTools(query); // Search by name/description
m.getToolsByTag(tag); // Filter by tag
```

### Decorator Pattern

```typescript
import { tool, setGlobalMatimoInstance } from 'matimo';

// Setup
setGlobalMatimoInstance(matimoInstance);

// Define with decorators
class MyAgent {
  @tool('calculator')
  async calculate(operation: string, a: number, b: number) {}
}
```

### Low-Level Access

```typescript
import { ToolLoader, CommandExecutor, HttpExecutor } from 'matimo';

const loader = new ToolLoader();
const tools = await loader.loadToolsFromDirectory('./tools');

const executor = new CommandExecutor();
const result = await executor.execute(tool, parameters);
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

## Contributing

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

**Now:**

- Core SDK improvements
- Bug fixes
- Documentation
- Test coverage

**Coming:**

- Tool definitions (when registry opens)
- New executor types
- Performance optimizations

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Documentation

- **[Quick Start](./docs/quick-start.md)** — Get up and running in 5 minutes
- **[API Reference](./docs/api.md)** — Complete SDK API
- **[Tool Specification](./docs/tool-spec.md)** — How to write YAML tools
- **[Decorator Guide](./docs/MATIMO_DECORATOR.md)** — Using @tool decorators
- **[Commit Guidelines](./docs/COMMIT_GUIDELINES.md)** — Conventional commits
- **[Development Standards](./DEVELOPMENT_STANDARDS.md)** — Code quality rules

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
- OpenAPI → YAML translation
- Skills/Workflows (multi-tool orchestration)
- 2000+ pre-configured tools


## Performance

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


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tallclub/matimo&type=date&legend=top-left)](https://www.star-history.com/#tallclub/matimo&type=date&legend=top-left)

---

**Ready to integrate AI tools across your framework?**

[Get Started Now →](./docs/QUICK_START.md)
