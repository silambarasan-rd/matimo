## v0.1.0-alpha.7

> Postgres tools suite + SQL approval workflows: Execute database queries safely with interactive approval, LangChain integration, and comprehensive examples

**Released**: February 15, 2026

### 🚀 New Features

#### Postgres Package & Tools
- **New `@matimo/postgres` package** — Production-ready PostgreSQL tool provider
- **`postgres-execute-sql` tool** — Execute arbitrary SQL with parameterized query support for safety
- **Two authentication methods**:
  - Connection string: `MATIMO_POSTGRES_URL=postgresql://...`
  - Separate env vars: `MATIMO_POSTGRES_HOST`, `MATIMO_POSTGRES_PORT`, `MATIMO_POSTGRES_USER`, `MATIMO_POSTGRES_PASSWORD`, `MATIMO_POSTGRES_DB`

#### SQL Approval Workflow System
- **`SQLApprovalManager` core class** — Centralized approval management for destructive queries (DELETE, DROP, UPDATE, ALTER, TRUNCATE)
- **Interactive approval prompts** — Real-time user approval for sensitive SQL operations
- **Smart detection** — Automatically classifies queries as read-only or write/destructive
- **Session caching** — Approve once per session, reduces repeated prompts
- **Auto-approval mode** — Set `MATIMO_SQL_AUTO_APPROVE=true` for CI/CD environments
- **Custom approval callbacks** — Integrate with your own approval logic via `setApprovalCallback()`

### 📚 Examples & Documentation

#### 4 Complete Postgres Examples
All 3 integration patterns (Factory, Decorator, LangChain) + SQL approval workflow:
1. **Factory Pattern** — Direct tool execution with Matimo SDK
2. **Decorator Pattern** — Class-based `@tool()` decorator usage
3. **LangChain Pattern** — AI agent integration with table discovery and analysis
4. **Approval Workflow** — Interactive SQL approval with automatic/manual modes

#### Comprehensive Documentation
- **Postgres Package README** — Complete tool specification, examples, authentication methods, error handling
- **Examples README** — Sequential Discovery Pattern, Approval Workflow Guide, integration patterns
- **`.env.example`** — Postgres configuration with both auth methods documented
- **Inline code comments** — All examples extensively documented for easy understanding


#### CI/CD Enhancements
- **Discord webhook notifications** — Automatic release notifications in Discord channel
- **Workflow improvement** — npm-release workflow now posts Discord embed with release notes extracted from `docs/RELEASES.md`

### 📦 Package Updates

- All 7 packages bumped to v0.1.0-alpha.7:
  - `matimo` (root)
  - `@matimo/core`
  - `@matimo/cli`
  - `@matimo/slack`
  - `@matimo/gmail`
  - `@matimo/postgres` ✨ **NEW**
  - `matimo-examples`

### 🔧 Developer Experience

#### New APIs
- `SQLApprovalManager.isApproved(sql, mode)` — Check if SQL is approved, prompts user if needed
- `SQLApprovalManager.setApprovalCallback()` — Custom approval callback integration
- `setSQLApprovalManager()` — Global singleton support for cross-module approval management

#### Configuration
- Environment variables for Postgres connection (2 methods)
- `MATIMO_SQL_AUTO_APPROVE` env var for automated environments
- Graceful fallback handling for missing credentials

### 🐛 Fixes & Improvements

- **Error messages** — Helpful hints for connection failures (ECONNREFUSED, missing role, missing database)
- **Non-TTY handling** — Approval prompt properly rejects in non-interactive environments (CI/CD)
- **Parameter validation** — Strict validation of SQL parameters in approval checks
- **Encoding support** — Proper handling of connection string encoding for special characters in passwords


### 🔗 Related Documentation

- [Postgres Package README](../packages/postgres/README.md) — Tool specifications and usage
- [Examples README](../examples/README.md) — Sequential discovery pattern, approval workflow
- [Tool Development Guide](../docs/tool-development/EXTENDING.md) — How to create new tools

### ⚠️ Breaking Changes

None. This is a purely additive release.

---

## v0.1.0-alpha.6

> Core tools architecture overhaul: function-based execution, unified SDK model, and comprehensive tool suite

**Released**: February 13, 2026

### Security & Safety Improvements

- **Approval flow for file operation tools** — File read/write operations now require explicit approval to prevent unauthorized access
- **Command injection detection in execute tool** — Added security validation to detect and block potentially malicious shell commands

### Core Tools Architecture Overhaul

- **All core tools converted to function-type execution** — Eliminates subprocess spawning and `tsx` PATH dependencies
- **Unified execution model** — All core tools now use direct async function calls for better performance and error handling
- **Core tools suite expanded**:
  - **execute** — Execute shell commands with timeout, cwd control, and environment variables
  - **read** — Read files with line range support, encoding detection, and large file handling
  - **edit** — Edit/replace file contents with optional encoding and backup support
  - **search** — Search files using grep patterns with line output and context display
  - **web** — Fetch and parse web content with headers, cookies, and response validation
  - **calculator** — Refactored to function-type for consistency

### Execution Model Improvements

- **No external dependencies** — Core tools no longer depend on `tsx` or other CLI tools
- **Direct in-process execution** — Function-based tools execute directly without subprocess overhead
- **Better error handling** — Native exception throwing instead of stdout/stderr parsing
- **Simpler type safety** — Direct TypeScript function signatures for all tools

### Testing & Examples

- **Comprehensive unit tests** for all 5 new core tools (execute, read, edit, search, web)
- **Complete examples** for all core tools in 3 integration patterns:
  - Factory pattern (direct tool execution)
  - Decorator pattern (class-based with @tool)
  - LangChain pattern (AI agent integration)
- **Tests pass**: 624+ test suite with 100% pass rate

### Schema & Tool Loading Improvements

- **Enhanced ToolDefinitionSchema** — Better parameter validation and default value handling
- **Improved tool caching** — Tool packages cached for faster discovery and loading
- **Better tool discovery** — Provider auto-discovery with efficient lookup
- **Passthrough validation removed** — Stricter schema validation for tool definitions
- **Default parameters support** — YAML definitions can now specify default values

### Developer Experience

- **Unified core tools** — Consistent execution model across all built-in tools
- **Cleaner imports** — Tools properly structured under `packages/core/tools/`
- **commitlint updates** — Added support for 'example' commit type in conventional commits

### Quality & Reliability

- **Build fixes** — Resolved issues from previous release
- **Lint fixes** — Eliminated linting issues in updated code
- **Type safety** — All tools properly typed with strict TypeScript checking

## Architecture Comparison

### Before (alpha.5)

```yaml
# Command-type execution (subprocess spawning)
execution:
  type: command
  command: 'tsx'
  args: ['packages/core/tools/read/read.ts', '{filePath}']
```

### After (alpha.6)

```yaml
# Function-type execution (direct calls)
execution:
  type: function
  code: './read.ts'
```

**Benefits**: Faster execution, no PATH dependencies, native error handling, simpler debugging

## Tools Now Available

### Core Utilities (6 tools)

- `calculator` — Arithmetic operations (add, subtract, multiply, divide)
- `execute` — Execute shell commands with full control
- `read` — Read file contents with line ranges
- `edit` — Edit/replace file contents
- `search` — Search files by pattern
- `web` — Fetch and parse web content

### Provider Integrations (21+ tools)

- `slack` — 16+ Slack tools (messaging, channels, users, etc.)
- `gmail` — 5 Gmail tools (send, list, get, draft, delete)

## Examples

### Execute Tool - All 3 Patterns

```typescript
// Factory pattern
const matimo = await MatimoInstance.init('./tools');
const result = await matimo.execute('execute', {
  command: 'ls -la',
  cwd: '/tmp'
});

// Decorator pattern
@tool('execute')
async runCommand(command: string) { }

// LangChain pattern
const tools = matimo.listTools()
  .map(t => ({ type: 'function', function: {...} }));
```

### Read Tool

```typescript
const result = await matimo.execute('read', {
  filePath: './src/index.ts',
  startLine: 10,
  endLine: 50,
});
```

### Edit Tool

```typescript
const result = await matimo.execute('edit', {
  filePath: './config.json',
  newContent: '{"updated": true}',
  createBackup: true,
});
```

### Search Tool

```typescript
const result = await matimo.execute('search', {
  pattern: 'function execute',
  directoryPattern: './src/**/*.ts',
  outputLines: true,
});
```

### Web Tool

```typescript
const result = await matimo.execute('web', {
  url: 'https://example.com',
  method: 'GET',
});
```

## Migration from Alpha.5

### If you were using core tools:

**Before (command-type with tsx)**:

```typescript
// Tools required tsx in PATH
const result = await matimo.execute('read', {...});
```

**After (function-type, no dependencies)**:

```typescript
// Same API, better performance, no PATH dependencies
const result = await matimo.execute('read', {...});
```

API remains the same — no code changes needed! Just update Matimo version.

## Testing & Quality

- ✅ **Improved test coverage** across all packages
- ✅ **No lint errors** — Strict ESLint configuration
- ✅ **100% TypeScript strict mode** — Full type safety
- ✅ **Complete test coverage** — Unit + integration tests for all tools
- ✅ **All examples tested** — 3 patterns × 6 core tools

## Known Issues & Limitations

This is an **alpha release**. Not recommended for production without thorough testing.

## Installation

```bash
npm install matimo@0.1.0-alpha.6
pnpm add matimo@0.1.0-alpha.6
```

## Documentation

- [Quick Start](./getting-started/QUICK_START.md)
- [SDK Patterns](./user-guide/SDK_PATTERNS.md)
- [Tool Reference](./api-reference/SDK.md)
- [Examples](../examples/)

## Contributing

[Contributing Guide](../CONTRIBUTING.md) | [Report Issues](https://github.com/tallclub/matimo/issues)

---

## v0.1.0-alpha.5

> Readme addition to core, slack and gmail packages and custom domain setup for github pages (docs).

**Released**: February 11, 2026

## What's New

- **Documentation Theme**: Updated to Jekyll Slate theme for cleaner, simpler documentation rendering with GitHub Pages native support
- **Workspace Dependencies**: Updated all peer dependencies across cli, gmail, and slack packages to use `workspace:*` versioning for better monorepo management
- **Version Bump**: Official release of v0.1.0-alpha.5 with updated package versions across workspace
- **Release Workflow**: Removed redundant custom GitHub Pages workflow in favor of GitHub's native pages-build-deployment action
- **CNAME Configuration**: Maintained custom domain setup for `docs.matimo.dev`
- **Package Documentation**: Added comprehensive README documentation to core, slack, and gmail packages

## Notes

- Documentation now uses Slate theme for better compatibility with GitHub Pages
- All workspace packages updated with consistent versioning
- Simplified GitHub Actions workflow reduces maintenance and improves reliability

## v0.1.0-alpha.4

> Packaging restructure, Matimo CLI, independent tools package publishing, and docs

**Released**: February 10, 2026

## What's New

- **Monorepo packaging**: repository updated to a workspace layout. Core packages are split under `packages/` and publishable as separate npm packages.
- **Matimo CLI**: cli operations for list, search, install, help within Matimo eco-system.
- **CI publish update**: GitHub Actions updated to publish workspace packages via `pnpm -r publish` so non-private workspace packages are released together.
- **Tools packages**: Tool YAML and assets live under `package/<provider-name>` folders and are published as separate npm packages with in `@matimo/<provider-name>`
- **Examples & docs**: Updated examples and docs to reflect packaging changes and improved quick-start guidance.
- **Build & test fixes**: Ensured `pnpm build` and `pnpm test` run across workspace packages.

## Notes

- The release workflow now publishes all non-private workspace packages (filterable if needed).

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
  message: 'Hello from Matimo!',
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
  operation: 'add',
  a: 5,
  b: 3,
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
