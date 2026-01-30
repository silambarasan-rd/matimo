# Documentation Index

Complete documentation for Matimo.

## Getting Started

- **[Quick Start](./QUICK_START.md)** — Get up and running in 5 minutes
  - Installation with npm/pnpm
  - Load tools from directory
  - Execute tools with SDK
  - Use MCP Server
  - Common tasks and examples

## Reference

- **[API Reference](./API_REFERENCE.md)** — Complete TypeScript SDK documentation
  - MatimoFactory for creating instances
  - ToolLoader for loading tools
  - ToolRegistry for managing tools
  - CommandExecutor and HttpExecutor
  - Error handling and error codes
  - Complete type definitions

- **[Tool Specification](./TOOL_SPECIFICATION.md)** — How to write YAML tools
  - Tool metadata (name, version, description)
  - Parameter types and validation
  - Execution types (command, HTTP, script)
  - Output schema definition
  - Authentication configuration
  - Error handling and retry logic
  - Complete YAML examples

- **[Decorator Guide](./DECORATOR_GUIDE.md)** — Using @tool TypeScript decorators
  - @tool and @param decorators
  - Type-safe tool definitions
  - Async tool execution
  - Error handling in decorators
  - Testing decorator tools
  - Migration from YAML to decorators

## Security

- **[Security Guide](/SECURITY.md)** — Security standards and best practices
  - Core security principles
  - Secret management (environment variables)
  - Input validation with schemas
  - Error handling without leaking information
  - Logging without sensitive data
  - Authentication mechanisms
  - Command execution safety
  - Common vulnerabilities and fixes
  - Security checklist
  - Responsible vulnerability disclosure

## Development

- **[Commit Guidelines](./COMMIT_GUIDELINES.md)** — Conventional commits standard
  - Commit format and components
  - Type, scope, and subject guidelines
  - Commit examples (feat, fix, docs, etc.)
  - Best practices and common mistakes
  - Git workflow and aliases

- **[Development Standards](./DEVELOPMENT_STANDARDS.md)** — Code quality rules
  - TypeScript strict mode requirements
  - Naming conventions (classes, functions, constants)
  - Error handling patterns
  - Testing standards and coverage targets
  - Documentation and JSDoc standards
  - Security standards (validation, secrets, escaping)
  - Logging with structured information
  - Performance and memory targets
  - Quality metrics and checklists

- **[CONTRIBUTING.md](/CONTRIBUTING.md)** — How to contribute to Matimo
  - Getting started and setup
  - Code standards and best practices
  - Testing with TDD approach
  - Commit and PR requirements
  - Adding new tools
  - Performance and quality targets
  - Roadmap and current focus

---

## Quick Navigation

### For First-Time Users
1. Start with [Quick Start](./QUICK_START.md) for setup
2. Check [API Reference](./API_REFERENCE.md) for SDK usage
3. See [Tool Specification](./TOOL_SPECIFICATION.md) to write tools

### For Tool Writers
1. Read [Tool Specification](./TOOL_SPECIFICATION.md) for YAML tools
2. Or use [Decorator Guide](./DECORATOR_GUIDE.md) for TypeScript tools
3. Follow [Development Standards](./DEVELOPMENT_STANDARDS.md) for code quality

### For Contributors
1. Check [CONTRIBUTING.md](/CONTRIBUTING.md) for contribution guidelines
2. Follow [Development Standards](./DEVELOPMENT_STANDARDS.md) for code quality
3. Use [Commit Guidelines](./COMMIT_GUIDELINES.md) for proper commit format

### For Maintainers
1. Review [Development Standards](./DEVELOPMENT_STANDARDS.md) for quality metrics
2. Check [Commit Guidelines](./COMMIT_GUIDELINES.md) for PR commit validation
3. See [CONTRIBUTING.md](/CONTRIBUTING.md) for overall workflow

---

## Documentation Structure

```
docs/
├── QUICK_START.md              # 5-minute setup guide
├── API_REFERENCE.md            # Complete SDK API
├── TOOL_SPECIFICATION.md       # YAML tool schema
├── DECORATOR_GUIDE.md          # TypeScript decorators
├── COMMIT_GUIDELINES.md        # Conventional commits
├── DEVELOPMENT_STANDARDS.md    # Code quality rules
├── INDEX.md                    # This file
└── ../CONTRIBUTING.md          # Contribution guidelines (root)
```

---

## Key Concepts

### Tools
Tools are the building blocks of Matimo. They define what can be executed, what parameters they accept, and how they run.

- **YAML Tools** — Declarative tool definitions (see [Tool Specification](./TOOL_SPECIFICATION.md))
- **Decorator Tools** — TypeScript-based tool definitions (see [Decorator Guide](./DECORATOR_GUIDE.md))

### Executors
Executors run tools with different backends:
- **CommandExecutor** — Execute shell commands
- **HttpExecutor** — Make HTTP requests

See [API Reference](./API_REFERENCE.md) for details.

### SDK
Use the Matimo SDK (TypeScript) to load and execute tools:

```typescript
import { MatimoFactory } from 'matimo';

const matimo = MatimoFactory.create({ toolsPath: './tools' });
const result = await matimo.executeTool('tool-name', { param: 'value' });
```

See [Quick Start](./QUICK_START.md) and [API Reference](./API_REFERENCE.md).

### MCP Server
Matimo can run as an MCP server, allowing Claude and other clients to discover and use tools:

```typescript
import { MCPServer } from 'matimo/mcp';

const server = new MCPServer({ toolsPath: './tools', port: 3000 });
await server.start();
```

See [Quick Start](./QUICK_START.md) for setup.

---

## Standards & Practices

### Code Quality
- **TypeScript**: Strict mode enforced (no `any`)
- **Testing**: 80%+ coverage, TDD approach
- **Linting**: ESLint with automatic formatting
- **Documentation**: JSDoc comments for all public APIs

See [Development Standards](./DEVELOPMENT_STANDARDS.md).

### Commits
- **Format**: Conventional Commits (type(scope): subject)
- **Types**: feat, fix, docs, refactor, test, chore, perf, style, ci
- **Examples**: "feat(executor): add HTTP support", "fix(schema): validate enums"

See [Commit Guidelines](./COMMIT_GUIDELINES.md).

### Pull Requests
- Follow TDD approach (test first, implement after)
- Keep PRs focused (one feature/fix per PR)
- Ensure tests pass and coverage maintained (80%+)
- Follow code standards and get code review

See [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Common Tasks

### Write a YAML Tool
1. Create `tools/provider/tool-name.yaml`
2. Follow [Tool Specification](./TOOL_SPECIFICATION.md) schema
3. Include parameters, execution, output_schema
4. Add authentication if needed
5. Test with `pnpm test`

### Write a Decorator Tool
1. Create `src/tools/tool-name.tool.ts`
2. Use @tool and @param decorators
3. Implement execute() or async execute()
4. Follow [Decorator Guide](./DECORATOR_GUIDE.md) patterns
5. Add unit tests

### Contribute Code
1. Fork and clone repository
2. Create feature branch: `git checkout -b feat/description`
3. Write tests first (TDD)
4. Implement feature
5. Follow [Development Standards](./DEVELOPMENT_STANDARDS.md)
6. Commit using [Commit Guidelines](./COMMIT_GUIDELINES.md)
7. Push and create PR
8. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) checklist

---

## Need Help?

- **Questions?** Check relevant documentation or open a [GitHub Discussion](https://github.com/tallclub/matimo/discussions)
- **Found a bug?** [Open an issue](https://github.com/tallclub/matimo/issues)
- **Want to contribute?** See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Documentation Quality

All documentation in Matimo follows these standards:

- ✅ Clear and concise with practical examples
- ✅ Links between related sections
- ✅ Code examples that actually work
- ✅ Type-safe TypeScript (strict mode)
- ✅ Aligned with actual project practices
- ✅ Updated whenever code changes

Last updated: January 2026
