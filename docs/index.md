# Matimo Documentation

<p align="center">
<img src="./assets/logo.png" alt="Matimo Logo" width="300" style="border-radius: 8px; margin: 20px 0;" />
</p>

<p align="center">
  <a href="https://discord.gg/3JPt4mxWDV"><img src="https://img.shields.io/badge/Discord-Join%20Chat-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>
</p>

**Matimo** (Maximum AI Tools in Modular Objects) — Define tools once in YAML, use them everywhere.

> Built to solve the universal tool orchestration problem for AI agents.

Complete documentation for Matimo.

## Getting Started

- **[Quick Start](./getting-started/QUICK_START.md)** — Get up and running in 5 minutes
  - Installation with npm/pnpm
  - Load tools from directory
  - Execute tools with SDK
  - Use MCP Server
  - Common tasks and examples

- **[Installation](./getting-started/installation.md)** — Detailed setup instructions
  - Requirements and dependencies
  - npm/pnpm installation options
  - From source for contributors
  - Verification and troubleshooting

- **[Your First Tool](./getting-started/YOUR_FIRST_TOOL.md)** — Create your first YAML tool
  - Step-by-step tool creation
  - Basic YAML structure
  - Testing your first tool
  - Common beginner mistakes

## Reference

- **[API Reference](./api-reference/SDK.md)** — Complete TypeScript SDK documentation
  - MatimoInstance for tool management
  - MatimoInstance.init() with auto-discovery
  - Tool execution and discovery methods
  - @tool decorator pattern
  - LangChain integration helper
  - Error handling and error codes
  - Complete type definitions

- **[Error Reference](./api-reference/ERRORS.md)** — Error handling and troubleshooting
  - Error codes and meanings
  - Common error scenarios
  - Debugging techniques
  - Error recovery patterns

- **[Type Definitions](./api-reference/TYPES.md)** — Complete TypeScript types
  - ToolDefinition interface
  - Parameter and execution types
  - Authentication configurations
  - Response and validation types

- **[Architecture Overview](./architecture/OVERVIEW.md)** — System design and patterns
  - High-level architecture
  - Framework integration patterns (3 approaches)
  - Pure SDK vs Framework integration
  - Data flow diagrams

- **[OAuth Architecture](./architecture/OAUTH.md)** — OAuth2 implementation details
  - OAuth2 protocol flow
  - Provider integrations
  - Token lifecycle management
  - Security considerations

- **[Tool Specification](./tool-development/TOOL_SPECIFICATION.md)** — How to write YAML tools
  - Tool metadata (name, version, description)
  - Parameter types and validation
  - Execution types (command, HTTP, script)
  - Output schema definition
  - Authentication configuration
  - Error handling and retry logic
  - Complete YAML examples

- **[Adding Tools to Matimo](./tool-development/ADDING_TOOLS.md)** — Create tool provider packages
  - 6-step guide for tool creation
  - Publishing to npm as @matimo/{provider}
  - Auto-discovery mechanism
  - Independent package structure
  - Real GitHub provider example
  - CLI tool management (matimo install, list, search)

- **[YAML Tools](./tool-development/YAML_TOOLS.md)** — Writing tools in YAML
  - YAML syntax and structure
  - Parameter templating
  - Command execution patterns
  - HTTP request tools
  - Function-based tools

- **[Testing Tools](./tool-development/TESTING.md)** — Testing your tools
  - Unit testing patterns
  - Integration testing
  - Mocking external services
  - Test fixtures and examples
  - Coverage requirements

- **[OAuth Setup](./tool-development/OAUTH_LINK.md)** — OAuth authentication for tools
  - OAuth2 flow implementation
  - Provider-specific configurations
  - Token storage and refresh
  - Security best practices

- **[Provider Configuration](./tool-development/PROVIDER_CONFIGURATION.md)** — Multi-provider tool setup
  - Managing multiple providers
  - Configuration patterns
  - Environment variable organization
  - Provider-specific settings

- **[Framework Integrations](./framework-integrations/LANGCHAIN.md)** — LangChain & CrewAI patterns
  - LangChain Agent integration
  - Decorator pattern with frameworks
  - CrewAI tool composition
  - Custom AI framework integration

## Project Information

- **[Release Notes](./RELEASES.md)** — Changelog and version history
  - New features and improvements
  - Bug fixes and patches
  - Breaking changes
  - Migration guides

- **[Roadmap](./ROADMAP.md)** — Project roadmap and future plans
  - Upcoming features
  - Planned improvements
  - Long-term vision
  - Community requests
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

- **[Commit Guidelines](./community/COMMIT_GUIDELINES.md)** — Conventional commits standard
  - Commit format and components
  - Type, scope, and subject guidelines
  - Commit examples (feat, fix, docs, etc.)
  - Best practices and common mistakes
  - Git workflow and aliases

- **[SDK Patterns](./user-guide/SDK_PATTERNS.md)** — Usage patterns and best practices
  - Factory pattern usage
  - Decorator pattern examples
  - LangChain integration patterns
  - Error handling strategies
  - Performance optimization

- **[Tool Discovery](./user-guide/TOOL_DISCOVERY.md)** — Finding and using tools
  - Auto-discovery mechanism
  - Tool search and filtering
  - Registry management
  - Loading from directories
  - Dynamic tool loading

- **[Authentication](./user-guide/AUTHENTICATION.md)** — Authentication setup and management
  - API key authentication
  - OAuth2 flows
  - Token management
  - Provider-specific auth
  - Security considerations
  - Quality metrics and checklists

- **[File Operation Approval](./user-guide/FILE_OPERATION_APPROVAL.md)** — Security controls for file operations
  - Approval system overview
  - Permanent and interactive approvals
  - Path matching with glob patterns
  - Configuration examples
  - Security best practices

- **[Contributing Guidelines](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md)** — How to contribute to Matimo
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

1. Start with [Quick Start](./getting-started/QUICK_START.md) for setup
2. Try [Your First Tool](./getting-started/YOUR_FIRST_TOOL.md) to create a tool
3. Check [API Reference](./api-reference/SDK.md) for SDK usage
4. See [Tool Specification](./tool-development/TOOL_SPECIFICATION.md) to write tools
5. Review [Architecture Overview](./architecture/OVERVIEW.md) to understand design

### For Tool Writers

1. Read [Tool Specification](./tool-development/TOOL_SPECIFICATION.md) for YAML tools
2. Or use [Decorator Guide](./tool-development/DECORATOR_GUIDE.md) for TypeScript tools
3. See [Adding Tools to Matimo](./tool-development/ADDING_TOOLS.md) to publish packages
4. Follow [Development Standards](./user-guide/DEVELOPMENT_STANDARDS.md) for code quality

### For Framework Integration

1. Check [Framework Integrations](./framework-integrations/LANGCHAIN.md) for LangChain/CrewAI
2. See [Architecture Overview](./architecture/OVERVIEW.md) for integration patterns
3. Review examples in `examples/` directory

### For Contributors

1. Check [Contributing Guidelines](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md) for contribution guidelines
2. Follow [Development Standards](./user-guide/DEVELOPMENT_STANDARDS.md) for code quality
3. Use [Commit Guidelines](./community/COMMIT_GUIDELINES.md) for proper commit format

### For Maintainers

1. Review [Development Standards](./user-guide/DEVELOPMENT_STANDARDS.md) for quality metrics
2. Check [Commit Guidelines](./community/COMMIT_GUIDELINES.md) for PR commit validation
3. See [Contributing Guidelines](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md) for overall workflow

---

## Documentation Structure

```
docs/
├── index.md                      # This file - documentation index
├── RELEASES.md                   # Release notes and changelog
├── ROADMAP.md                    # Project roadmap
├── getting-started/
│   ├── QUICK_START.md            # 5-minute setup guide
│   ├── installation.md           # Detailed installation instructions
│   └── YOUR_FIRST_TOOL.md        # Create your first tool
├── api-reference/
│   ├── SDK.md                    # Complete SDK API
│   ├── ERRORS.md                 # Error handling and error codes
│   └── TYPES.md                  # TypeScript type definitions
├── tool-development/
│   ├── TOOL_SPECIFICATION.md     # YAML tool schema
│   ├── YAML_TOOLS.md             # YAML tool writing guide
│   ├── ADDING_TOOLS.md           # Creating tool packages
│   ├── DECORATOR_GUIDE.md        # TypeScript decorators
│   ├── TESTING.md                # Testing tools
│   ├── PROVIDER_CONFIGURATION.md # Multi-provider setup
│   └── OAUTH_LINK.md             # OAuth authentication
├── framework-integrations/
│   └── LANGCHAIN.md              # LangChain & framework patterns
├── architecture/
│   ├── OVERVIEW.md               # System design and patterns
│   └── OAUTH.md                  # OAuth2 implementation
├── user-guide/
│   ├── SDK_PATTERNS.md           # SDK usage patterns
│   ├── TOOL_DISCOVERY.md         # Discovering tools
│   ├── AUTHENTICATION.md         # Authentication setup
│   └── DEVELOPMENT_STANDARDS.md  # Code quality rules
├── community/
│   └── COMMIT_GUIDELINES.md      # Conventional commits
└── troubleshooting/
    └── FAQ.md                    # Common questions & solutions

Root-level files:
├── [CONTRIBUTING.md](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md) — Contribution guidelines
├── [SECURITY.md](https://github.com/tallclub/matimo/blob/main/SECURITY.md) — Security policy
└── [README.md](https://github.com/tallclub/matimo/blob/main/README.md) — Project overview
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

See [API Reference](./api-reference/SDK.md) for details.

### SDK

Use the Matimo SDK (TypeScript) to load and execute tools:

```typescript
import { MatimoInstance } from 'matimo';

const matimo = await MatimoInstance.init('./tools');
const result = await matimo.execute('tool-name', { param: 'value' });
```

See [Quick Start](./getting-started/QUICK_START.md) and [API Reference](./api-reference/SDK.md).

### MCP Server

Matimo can run as an MCP server, allowing Claude and other clients to discover and use tools:

```typescript
// MCP Server - Coming in Phase 2
// import { MCPServer } from 'matimo/mcp';

const server = new MCPServer({ toolsPath: './tools', port: 3000 });
await server.start();
```

See [Quick Start](./getting-started/QUICK_START.md) for setup.

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

See [Commit Guidelines](./community/COMMIT_GUIDELINES.md).

### Pull Requests

- Follow TDD approach (test first, implement after)
- Keep PRs focused (one feature/fix per PR)
- Ensure tests pass and coverage maintained (80%+)
- Follow code standards and get code review

See [Contributing Guidelines](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md).

---

## Common Tasks

### Write a YAML Tool

1. Create `tools/provider/tool-name.yaml`
2. Follow [Tool Specification](./tool-development/TOOL_SPECIFICATION.md) schema
3. Include parameters, execution, output_schema
4. Add authentication if needed
5. Test with `pnpm test`

### Write a Decorator Tool

1. Create `src/tools/tool-name.tool.ts`
2. Use @tool and @param decorators
3. Implement execute() or async execute()
4. Follow [Decorator Guide](./tool-development/DECORATOR_GUIDE.md) patterns
5. Add unit tests

### Integrate with LangChain

1. See [Framework Integrations](./framework-integrations/LANGCHAIN.md) for patterns
2. Check `examples/tools/` for working examples
3. Follow [Architecture Overview](./architecture/OVERVIEW.md) for design decisions

### Contribute Code

1. Fork and clone repository
2. Create feature branch: `git checkout -b feat/description`
3. Write tests first (TDD)
4. Implement feature
5. Follow [Development Standards](./user-guide/DEVELOPMENT_STANDARDS.md)
6. Commit using [Commit Guidelines](./community/COMMIT_GUIDELINES.md)
7. Push and create PR
8. Follow [Contributing Guidelines](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md) checklist

---

## Need Help?

- **Questions?** Check relevant documentation or open a [GitHub Discussion](https://github.com/tallclub/matimo/discussions)
- **Found a bug?** [Open an issue](https://github.com/tallclub/matimo/issues)
- **Troubleshooting?** See [FAQ](./troubleshooting/FAQ.md)
- **Want to contribute?** See [Contributing Guidelines](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md)

---

> **Documentation Note:** While I strive for accuracy and completeness, this documentation may contain oversights, outdated information, or areas needing improvement, due to my limitations. If you notice any errors, missing information, or have suggestions for enhancement, please help me to improve! See our [Contributing Guidelines](https://github.com/tallclub/matimo/blob/main/CONTRIBUTING.md) to learn how to submit corrections and improvements. Your contributions to documentation are highly valued! Thank you.

---

Last updated: February 2026
