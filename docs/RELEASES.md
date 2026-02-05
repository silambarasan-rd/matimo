# v0.1.0-alpha.3

> Slack integration suite, standardized error handling, improved test coverage, and comprehensive documentation

**Released**: February 5, 2026

## What's New

### Slack Integration Suite
- **16+ Slack tools** across messaging, channel management, user queries, and topic management
- Real OAuth2 integration with Slack workspace testing
- Complete examples for all integration patterns
- Comprehensive Slack API coverage: send messages, list/manage channels, set topics, list users, and more

### Error Handling & Quality
- **Standardized MatimoError** throughout SDK with machine-readable error codes
- Consistent error structure across all executors and decorators
- Error codes: `INVALID_SCHEMA`, `FILE_NOT_FOUND`, `EXECUTION_FAILED`, `TOOL_NOT_FOUND`, `INVALID_PARAMETER`
- Proper error context without exposing sensitive data

### Testing Improvements
- **Mocked HTTP tests** - Removed real network calls from test suite
- 14 HTTP executor test cases with mocked axios responses
- **410 tests** across 23 test suites with 100% pass rate
- Deterministic, fast test execution with no external dependencies

### Examples & Documentation
- **Examples directory renamed** from `langchain` to `tools` - better reflects all three patterns
- **Comprehensive examples README** - 300+ lines covering all integration patterns with code examples
- **Three integration patterns** documented: Factory (direct), Decorator (class-based), LangChain (AI agents)
- Tool reference tables for Slack and Gmail tools
- Pattern comparison matrix and learning path
- Configuration guides for Slack, Gmail, and OpenAI setup

### Package Improvements
- Examples package now uses published matimo (`^0.1.0-alpha.3`) instead of local path
- Examples are now portable and work without building the SDK locally
- Proper version constraints for all dependencies

## What's Improved from Alpha.2

- Slack tools set
- Unified error handling prevents silent failures
- Test suite no longer makes real HTTP calls
- Better developer experience with comprehensive examples
- Documentation aligned with actual SDK capabilities

## Installation

```bash
npm install matimo@0.1.0-alpha.3
pnpm add matimo@0.1.0-alpha.3
```

## Quick Start - Three Integration Patterns

### 1. Factory Pattern (Direct SDK Usage)
```typescript
const matimo = await MatimoInstance.init('./tools');
const result = await matimo.execute('slack-send-message', { 
  channel: '#general',
  message: 'Hello from Matimo!'
});
```

### 2. Decorator Pattern (Class-Based)
```typescript
@tool('slack-send-message')
async sendMessage(channel: string, message: string) {
  // Auto-executed via Matimo
}
```

### 3. LangChain Integration (AI Agents)
```typescript
const tools = matimo.listTools()
  .map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, ... }
  }));
const response = await llm.invoke(messages, { tools });
```

## Tools Included

- **Slack** (16+ tools): Send messages, manage channels, list topics, manage users, etc.
- **Gmail** (5 tools): Send, list, get, draft, delete messages
- **Utilities**: Calculator, echo, HTTP client

## Documentation

- [Installation & Setup](./getting-started/installation.md)
- [Quick Start](./getting-started/QUICK_START.md)
- [Examples Guide](../examples/README.md) - All three patterns with detailed walkthrough
- [SDK Patterns](./user-guide/SDK_PATTERNS.md)
- [OAuth2 Guide](./architecture/OAUTH.md)
- [API Reference](./api-reference/SDK.md)

## Known Limitations

This is an **alpha release**. Not recommended for production without thorough testing.

See [Roadmap](./ROADMAP.md) for future features (REST API, MCP server, Python SDK, rate limiting).

## Contributing

[Contributing Guide](../CONTRIBUTING.md) | [Report Issues](https://github.com/tallclub/matimo/issues)

---

# v0.1.0-alpha.2

> Improved alpha.1 release - Better npm workflow, fixed exports, accurate feature descriptions

**Released**: February 4, 2026

## What's Improved

### Release & Distribution
- Improved npm publish workflow configuration (pre-releases currently publish under default 'latest' dist-tag)
- Replaced deprecated GitHub Actions (softprops/action-gh-release@v2)
- Proper semantic versioning for release titles
- Fixed broken documentation links in releases

### Package & Exports
- Explicit package exports for main and MCP modules
- Accurate npm description (reflects current Phase 1 scope)
- Proper Node.js module resolution

---

# v0.1.0-alpha.1

> First alpha release - Core OAuth2, tool execution, and SDK patterns

**Released**: February 3, 2026

## What's New

### OAuth2 Multi-Provider Support
- OAuth2 handler with token injection
- Providers: Google (Gmail), GitHub, Slack
- Provider YAML configuration
- Automatic token injection into requests

### Tool System
- YAML/JSON tool definitions with Zod validation
- Command executor (shell commands with templating)
- HTTP executor (REST APIs with OAuth2)
- Provider definition system
- Tool discovery and filtering

### SDK Patterns
- **Factory pattern**: `const m = await matimo.init('./tools'); m.execute(toolName, params)`
- **Decorator pattern**: `@tool('calculator')` for class-based usage
- Tool discovery, filtering, and search
- Full TypeScript support with strict types

### Tools Included
- **Gmail** (5 tools): send, list, get, draft, delete
- **Utilities**: calculator, echo, HTTP client
- **Provider configs**: Google, GitHub, Slack

## Installation

```bash
npm install matimo@0.1.0-alpha.1
pnpm add matimo@0.1.0-alpha.1
```

## Quick Start

```typescript
import { matimo } from 'matimo';

const m = await matimo.init('./tools');
const result = await m.execute('calculator', { 
  operation: 'add', a: 5, b: 3 
});
```

## Documentation

- [Installation & Setup](./getting-started/installation.md)
- [Quick Start](./getting-started/QUICK_START.md)
- [SDK Patterns](./user-guide/SDK_PATTERNS.md)
- [OAuth2 Guide](./architecture/OAUTH.md)
- [API Reference](./api-reference/SDK.md)
- [Examples](../examples/)


## Known Limitations

This is an **alpha release**. Not recommended for production without thorough testing.

See [Roadmap](./ROADMAP.md) for future features.

## Contributing

[Contributing Guide](../CONTRIBUTING.md) | [Report Issues](https://github.com/tallclub/matimo/issues)
