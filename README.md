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

## Installation

```bash
# Coming soon to npm
npm install matimo
pnpm add matimo

# For now: clone and build locally
git clone https://github.com/tallclub/matimo.git
cd matimo && pnpm install && pnpm build
```

## Integration Paths

### SDK

- **Factory Pattern** — Simplest API for any use case
- **Decorator Pattern** — Best for class-based agents
- **Direct Executor Access** — Low-level control when needed


### Advanced

**MCP Server (Claude Integration)**
**REST API (HTTP Endpoints)**
**CLI (Command Line)**

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

- **`command`** — Shell commands with parameter templating
- **`http`** — REST APIs with auth and response validation
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

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

## Documentation

- **[Quick Start](./docs/quick-start.md)** — Get up and running in 5 minutes
- **[API Reference](./docs/api.md)** — Complete SDK API
- **[Tool Specification](./docs/tool-spec.md)** — How to write YAML tools
- **[Decorator Guide](./docs/MATIMO_DECORATOR.md)** — Using @tool decorators
- **[Commit Guidelines](./docs/COMMIT_GUIDELINES.md)** — Conventional commits
- **[Development Standards](./DEVELOPMENT_STANDARDS.md)** — Code quality rules

## Roadmap


## License

MIT © 2026 Matimo Contributors

## Support

- 📖 [Docs](./docs)
- 💬 [Discussions](https://github.com/tallclub/matimo/discussions)
- 🐛 [Issues](https://github.com/tallclub/matimo/issues)
- 📧 [Email](mailto:hello@matimo.dev)


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tallclub/matimo&type=date&legend=top-left)](https://www.star-history.com/#tallclub/matimo&type=date&legend=top-left)

---

**Ready to integrate AI tools across your framework?**

[Get Started Now →](./docs/QUICK_START.md)
