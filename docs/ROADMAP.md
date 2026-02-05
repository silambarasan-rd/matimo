# Matimo Roadmap

## v0.1.0-alpha.3 (Current Release)

### ✅ Core Features Implemented

**OAuth2 Authentication**
- OAuth2 handler with token management
- Provider-agnostic configuration via YAML
- Multi-provider support (Google, GitHub, Slack)
- Token injection system for tools

**Tool System**
- YAML-based tool definitions with Zod validation
- Tool loader and registry
- Command executor (shell commands + templating)
- HTTP executor (REST APIs with OAuth2 support)
- Parameter encoding utilities

**SDK Patterns**
- Factory pattern (recommended for simple use cases)
- Decorator pattern (@tool decorators for class-based code)
- Tool discovery and filtering
- Full TypeScript type safety (zero `any` types)

**Tool Examples**
- Gmail tools (list, get, send, create-draft, delete)
- GitHub provider configuration
- Slack provider configuration
- Calculator and echo tools (reference implementations)

**Quality Assurance**
- 100% test passing
- Full TypeScript strict mode enforcement
- ESLint clean with zero warnings
- Prettier formatting
- Zod schema validation for all definitions

**Documentation**
- Quick start guide
- API reference
- Tool specification
- OAuth2 implementation guide
- Decorator pattern guide
- Contributing guide
- Security guidelines

---

## Future Release (not in specific order)

### 🔜 Planned Features

**CLI Tool**
- `matimo list` - List all tools
- `matimo execute` - Execute tools from command line
- `matimo validate` - Validate tool YAML files
- `matimo test` - Test tool execution locally

**MCP (Model Context Protocol) Server**
- Native MCP server 
- Tool discovery via MCP
- Automatic tool calling
- Session management

**Framework Integrations**
- CrewAI integration examples
- Vercel AI SDK integration
- Custom framework patterns
- Framework-specific documentation

**Advanced Features**
- Rate limiting (token bucket algorithm)
- Health monitoring (API schema drift detection)
- Token refresh automation
- Error recovery strategies

**REST API Server**
- HTTP endpoints for tool execution
- Async job execution
- Webhook support
- OpenAPI documentation

**Python SDK**
- Python implementation with same YAML definitions
- LangChain Python integration
- CrewAI Python support
- Feature parity with Node.js SDK

**Tool Marketplace**
- Distributed tool registry
- Tool publishing and versioning
- Community tool submissions
- Tool ratings and reviews

**Deployment**
- Docker images and Dockerfile examples
- Kubernetes deployment guides
- CI/CD integration examples
- Production deployment patterns

**Ecosystem Maturity**
- Automated schema translation (OpenAPI → Matimo YAML)
- Performance optimizations
- Enterprise features (audit logs, rate limiting)

**Skills/Workflows**
- Tool composition/chaining
- Conditional execution
- Error handling workflows
- Advanced orchestration


## How to Use This Roadmap

- **v0.1.0-alpha.1**: Initial SDK implementation with OAuth2 and tool execution
- **v0.1.0-alpha.2**: Npm workflow improvements and export fixes
- **v0.1.0-alpha.3**: Slack tools, error standardization, comprehensive examples
- **Future Releases**: These are planned but not yet implemented. Contributions welcome!
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to help

---

## Release Thoughts

```
v0.1.0-alpha.1  Feb 2026.
    ↓
v0.1.0-alpha.2  Feb 2026.
    ↓
v0.1.0-alpha.3  Feb 2026 (Current).
    ↓
    |
    |
    |
    |
v0.1.0     End of March 2026. 
```

---

## Contributing to the Roadmap

Have ideas? [Open a GitHub Discussion](https://github.com/tallclub/matimo/discussions) to propose features for future releases.
