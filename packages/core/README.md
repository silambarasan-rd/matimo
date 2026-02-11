# @matimo/core — Core SDK for Matimo

Matimo core provides the TypeScript SDK that loads, validates, and executes YAML-defined tools across frameworks.

## 📦 Installation

Install the unified package (includes core exports):

```bash
# install unscope package which includes core and cli 
npm install matimo
pnpm add matimo
# or install scoped core package directly
npm insatll @matimo/core
pnpm add @matimo/core
```

## 🔧 Purpose

`@matimo/core` contains:

- `MatimoInstance` — initialization, discovery, registry, and execution API
- Executors (command, http, function)
- Decorator utilities (`@tool`, `setGlobalMatimoInstance`)
- Zod-based schema validation for YAML tool definitions
- Error types (`MatimoError`) and structured error codes

This package is intended to be imported by applications, CLIs, and provider packages.

## 🚀 Quick Start

```typescript
import { MatimoInstance } from 'matimo';

// Auto-discover installed @matimo/* tool packages
const matimo = await MatimoInstance.init({ autoDiscover: true });

// List tools
console.log('Loaded', matimo.listTools().length, 'tools');

// Execute a tool
await matimo.execute('calculator', { operation: 'add', a: 1, b: 2 });
```

## 🧩 Usage Patterns

- Factory pattern: `MatimoInstance.init()` + `matimo.execute()`
- Decorator pattern: use `@tool()` and `setGlobalMatimoInstance()` for class-based code
- LangChain integration: convert Matimo tools to LangChain function schemas

See the full SDK docs: [docs/api-reference/SDK.md](../../docs/api-reference/SDK.md)

## 🔐 Authentication

Tools declare authentication in their YAML definitions. `@matimo/core` supports:

- API keys (header/query)
- Bearer/basic tokens
- OAuth2 (provider integrations handled in provider packages)

Tokens are injected from environment variables by convention (for example `SLACK_BOT_TOKEN`, `GMAIL_ACCESS_TOKEN`).

## 🧪 Testing & Development

To run core package tests:

```bash
pnpm --filter "@matimo/core" test
```

To build:

```bash
pnpm --filter "@matimo/core" build
```

## 📚 Contributing

See the project CONTRIBUTING guide and `docs/tool-development/ADDING_TOOLS.md` for adding provider packages and tools.

- Contributing: https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md
- Add tools: ../../docs/tool-development/ADDING_TOOLS.md

---

Part of the Matimo ecosystem — define tools once, use them everywhere.
