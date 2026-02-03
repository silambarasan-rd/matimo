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

See [Roadmap](./ROADMAP.md) future features.

## Contributing

[Contributing Guide](../CONTRIBUTING.md) | [Report Issues](https://github.com/tallclub/matimo/issues)
