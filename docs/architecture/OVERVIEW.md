# System Architecture Overview

Understand how Matimo's monorepo structure works and how components interact.

## Monorepo Organization

Matimo uses a **pnpm workspaces** monorepo with independent, installable packages:

```
packages/core              # Core SDK (matimo on npm)
├── Orchestration
├── Executors
├── Type definitions
└── Built-in tools (calculator, echo)

packages/slack             # Slack tools (@matimo/slack)
├── 6+ Slack tool definitions
└── Slack OAuth2 config

packages/gmail             # Gmail tools (@matimo/gmail)
├── 4+ Gmail tool definitions
└── Gmail OAuth2 config

packages/cli               # CLI (@matimo/cli)
├── install, list, search commands
└── Tool discovery & management

examples/tools             # Working examples
├── factory-pattern-agent.ts
├── decorator-pattern-agent.ts
├── langchain-agent.ts
└── Provider-specific examples
```

**Key principle:** Each package is independently installable from npm, but shares a single source of truth for tool definitions.

## High-Level Runtime Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│    (Your code: Express, CLI, Scheduled Job, LangChain, etc)      │
└───────────────────────────┬──────────────────────────────────────┘
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
        ▼                                        ▼
┌───────────────────────────┐        ┌──────────────────────────────┐
│   Pure SDK Patterns       │        │ Framework Integration Layer  │
│   (No Framework)          │        │  (With AI Framework)         │
├───────────────────────────┤        ├──────────────────────────────┤
│ • Factory Pattern         │        │ • LangChain Official API*    │
│ • Decorator Pattern       │        │   (LLM-driven, automatic)    │
│                           │        │                              │
│ For: CLI, backends,       │        │ • Decorator + LangChain      │
│ APIs, simple logic        │        │   (Class-based agents)       │
└─────────────┬─────────────┘        │                              │
              │                      │ • Factory + LangChain        │
              │                      │   (Manual routing)           │
              │                      │                              │
              │                      │ For: AI agents,              │
              └──────────┬───────────┤ intelligent orchestration    │
                         │           └──────────┬───────────────────┘
                         │                      │
                         └──────────┬───────────┘
                                    │
            ┌───────────────────────▼────────────────────┐
            │      SDK Layer (matimo package)            │
            │      packages/core/src/                    │
            │                                            │
            │  ┌──────────────────────────────────────┐  │
            │  │  MatimoInstance (Orchestrator)       │  │
            │  │  • Tool registry  • Executor coord   │  │
            │  │  • Parameter validation              │  │
            │  │  • Error handling                    │  │
            │  └──────────────────────────────────────┘  │
            └───────┬──────────────────────┬─────────────┘
                    │                      │
        ┌───────────▼──────┐    ┌──────────▼────────┐
        │ Command Executor │    │  HTTP Executor    │
        │                  │    │                   │
        │ • Shell commands │    │ • REST APIs       │
        │ • Param template │    │ • Auth injection  │
        │ • Exit handling  │    │ • Response valid  │
        └───────┬──────────┘    └──────────┬────────┘
                │                          │
                └────────┬─────────────────┘
                         │
     ┌───────────────────┴────────────────────┐
     │                                        │
     ▼                                        ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│  Tool Definitions       │    │  Provider Definitions    │
│  (YAML files)           │    │  (OAuth2 configs)        │
│                         │    │                          │
│ packages/core/tools/    │    │ packages/{provider}/     │
│ ├─ calculator/          │    │ ├─ definition.yaml       │
│ ├─ echo-tool/           │    │ └─ tools/{tool}/def.yaml │
│ │                       │    │                          │
│ packages/slack/tools/   │    │ Example:                 │
│ ├─ send-message/        │    │ packages/slack/          │
│ ├─ list-channels/       │    │ ├─ definition.yaml       │
│ └─ ...                  │    │ └─ tools/{tool}/*.yaml   │
│                         │    │                          │
│ packages/gmail/tools/   │    └──────────────────────────┘
│ ├─ send-email/          │
│ └─ ...                  │
│                         │
└───────────┬─────────────┘
            │
     ┌──────▼────────┐
     │  External     │
     │  Services     │
     │               │
     │ • Gmail API   │
     │ • Slack API   │
     │ • GitHub API  │
     │ • Shell cmd   │
     │ • Custom APIs │
     │               │
     └───────────────┘

* Recommended for AI agents with automatic tool selection
```

---

## Component Layers

### 1. Application Layer

Your code that uses Matimo. Examples:

- Express.js API endpoint
- LangChain agent
- CLI tool
- Scheduled job
- Discord bot

### 2. SDK Layer (packages/core)

**Factory Pattern**:

```typescript
import { MatimoInstance } from 'matimo';

const m = await MatimoInstance.init('./tools');
const result = await m.execute('calculator', params);
```

**Decorator Pattern**:

```typescript
import { tool } from 'matimo';

class Agent {
  @tool('calculator')
  async calculate(...) { }
}
```

### 3. Core Orchestration (packages/core/src)

**MatimoInstance**: Central orchestrator that:

- Initializes tool loading
- Manages auto-discovery
- Coordinates execution
- Handles errors
- Manages OAuth2 tokens
- Validates parameters

### 4. Tool Management (packages/core/src/core)

**ToolLoader** (internal): Loads tools from YAML files

- Reads from `packages/{provider}/tools/*/definition.yaml`
- Validates against Zod schema
- Returns `ToolDefinition[]`
- Auto-discovers packages from `node_modules/@matimo/*/tools`

**ToolRegistry** (internal): In-memory index of all tools

```
tools: Map<name, ToolDefinition>
|
├── calculator (from packages/core/tools/)
├── slack-send-message (from packages/slack/tools/)
├── slack-list-channels (from packages/slack/tools/)
├── gmail-send-email (from packages/gmail/tools/)
└── ...
```

### 5. Execution Layer (packages/core/src/executors)

**FunctionExecutor** (Primary for Core Tools): Executes JavaScript/TypeScript functions directly

```
Input: { code: "execute.ts", params: {...} }
Process: Import and call function directly (no subprocess)
Output: { result }
```

Used by all 6 core tools: `execute`, `read`, `edit`, `search`, `web`, `calculator`

**HttpExecutor**: Makes HTTP requests with automatic validation

```
Input: { method: "POST", url: "...", headers: {...}, body: {...} }
Process: Send request, embed params, validate by output_schema
Output: { status, data, headers }
```

**CommandExecutor** (Legacy Shell Execution): Runs external shell commands

```
Input: { command: "node script.js", args: [...] }
Process: Spawn child process
Output: { stdout, stderr, exitCode }
```

Used for external tools and legacy scripts that need subprocess execution.

### 6. Tool Definitions (YAML)

**Core Tools** (packages/core/tools/):

```yaml
name: calculator
execution:
  type: function
  code: './calculator.ts'
```

**Provider Tools** (packages/{provider}/tools/):

```yaml
name: slack-send-message
execution:
  type: http
  method: POST
  url: https://slack.com/api/chat.postMessage
```

**Provider Config** (packages/{provider}/definition.yaml):

```yaml
type: provider
name: slack
provider:
  endpoints:
    authorizationUrl: https://slack.com/oauth_authorize
```

### 7. External Services

Tools interact with:

- Google Gmail API
- Slack Web API
- GitHub REST API
- Shell commands
- Custom HTTP APIs

---

## Data Flow

### Tool Execution Flow

```
1. Application
   │
   └─> matimo.execute('calculator', { operation: 'add', a: 5, b: 3 })
       │
       ▼
2. MatimoInstance
   └─> Validate parameters against schema
       │
       ▼
3. ToolRegistry
   └─> Lookup 'calculator' definition
       │
       ├─ execution: { type: 'function', code: './calculator.ts' }
       ├─ parameters: { operation, a, b }
       │
       ▼
4. FunctionExecutor (or CommandExecutor/HttpExecutor based on type)
   └─> Execute: Import function and call with params { operation: 'add', a: 5, b: 3 }
       │
       ├─ (For command type): Spawn child process with templated args
       ├─ (For http type): Make HTTP request with embedded params
       │
       ▼
5. Tool Implementation
   └─> Run: calculator({ operation: 'add', a: 5, b: 3 })
       │
       ├─ Calculate: 5 + 3 = 8
       │
       ▼
6. Result Validation
   └─> Validate against output_schema
       │
       ├─ Check type matches
       ├─ Check required fields present
       │
       ▼
7. Return to Application
   └─> { result: 8 }
```

### OAuth2 Token Flow

```
1. Environment
   │
   └─> process.env.GMAIL_ACCESS_TOKEN = "ya29.abc..."
       │
       ▼
2. HTTP Tool Execution
   └─> Tool requires OAuth2 token
       │
       ├─ Check authentication config
       ├─ Find provider: google
       │
       ▼
3. Token Injection
   └─> Read from environment variable
       │
       ├─ GMAIL_ACCESS_TOKEN → "ya29.abc..."
       │
       ▼
4. HTTP Request
   └─> Add to headers
       │
       ├─ Authorization: "Bearer ya29.abc..."
       │
       ▼
5. External Service (Gmail API)
   └─> Verify token
       │
       ├─ Token valid → Execute request
       ├─ Token invalid → 401 Unauthorized
       │
       ▼
6. Response
   └─> Return result or error
```

---

## Framework Integration Patterns

Matimo supports 3 patterns for integrating with AI frameworks like LangChain, where the LLM automatically decides which tool to use:

### Pattern 1: LangChain Official API (⭐ Recommended)

Uses LangChain's official `tool()` function with automatic schema generation:

```
┌──────────────────────────────────┐
│  LangChain Agent                 │
│  (with OpenAI GPT-4)             │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  LangChain Official API          │
│  tool(async fn, schema)          │
│  ├─ Automatic schema generation  │
│  ├─ Type validation via Zod      │
│  └─ Best IDE support             │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Matimo SDK                      │
│  m.execute(toolName, params)     │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Tool Executors                  │
│  (Command/HTTP)                  │
└──────────────────────────────────┘
```

**When to use:** Default choice for AI agents with LangChain

### Pattern 2: Decorator Pattern with LangChain

Uses Matimo's `@tool()` decorators for class-based agents:

```
┌──────────────────────────────────┐
│  Class-Based Agent               │
│                                  │
│  @tool('calculator')             │
│  async calculate(...) { }        │
│                                  │
│  @tool('email-sender')           │
│  async sendEmail(...) { }        │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  @tool Decorator                 │
│  ├─ Intercepts method calls      │
│  ├─ Maps args to parameters      │
│  └─ Calls matimo.execute()       │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Matimo SDK                      │
│  m.execute(toolName, params)     │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Tool Executors                  │
│  (Command/HTTP)                  │
└──────────────────────────────────┘
```

**When to use:** Class-based agents, automatic tool binding

### Pattern 3: Factory Pattern with LangChain

Direct `matimo.execute()` calls in agent logic:

```
┌──────────────────────────────────┐
│  Agent with Custom Logic         │
│                                  │
│  if (prompt.includes('calc'))    │
│    m.execute('calculator', ...)  │
│                                  │
│  if (prompt.includes('email'))   │
│    m.execute('gmail-send', ...)  │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Matimo SDK                      │
│  m.execute(toolName, params)     │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Tool Executors                  │
│  (Command/HTTP)                  │
└──────────────────────────────────┘
```

**When to use:** Simple logic, manual tool routing

### Comparison Matrix

| Aspect             | Official API       | Decorator          | Factory      |
| ------------------ | ------------------ | ------------------ | ------------ |
| **LLM-Driven**     | ✅ Yes (automatic) | ✅ Yes             | ❌ Manual    |
| **Schema Gen**     | ✅ Automatic       | ✅ Manual          | ✅ Manual    |
| **Type Safety**    | Excellent          | Excellent          | Good         |
| **Framework**      | LangChain+         | LangChain+         | Any          |
| **Best For**       | AI agents          | Class-based agents | Simple logic |
| **Learning Curve** | Low                | Medium             | Low          |

For full details, see [Framework Integrations - LangChain](../framework-integrations/LANGCHAIN.md).

---

## Core Types

```typescript
// Tool Definition
interface ToolDefinition {
  name: string;
  description: string;
  version: string;
  parameters?: Record<string, Parameter>;
  execution: ExecutionConfig; // command or http
  authentication?: AuthConfig;
  output_schema?: OutputSchema;
}

// Execution Config (Command)
interface CommandExecution {
  type: 'command';
  command: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
}

// Execution Config (HTTP)
interface HttpExecution {
  type: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  query_params?: Record<string, string>;
}

// Provider Definition
interface ProviderDefinition {
  type: 'provider';
  name: string;
  provider: {
    endpoints: OAuth2Endpoints;
    // ...
  };
}
```

---

## Validation Pipeline

Every tool goes through validation:

```
YAML File
   │
   ├─> Parse YAML
   ├─> Validate against Zod schema
   │   ├─ Check required fields
   │   ├─ Check types
   │   ├─ Check enums
   ├─> Validate authentication (if OAuth2)
   │   ├─ Check provider exists
   │   ├─ Check endpoints are URLs
   ├─> Validate execution
   │   ├─ Check type is 'command' or 'http'
   │   ├─ Check required fields for type
   ├─> Validate parameters
   │   ├─ Check types match
   │   ├─ Check required fields
   │
   ▼
ToolDefinition (validated)
```

---

## Error Handling

```
Error occurs
   │
   ├─> Catch with try/catch
   ├─> Wrap in MatimoError
   │   ├─ code: ErrorCode
   │   ├─ message: string
   │   ├─ details?: object
   │
   ▼
Application error handling
   │
   ├─> Log error (never log secrets)
   ├─> Return structured error
   ├─> Notify user/system
   │
   ▼
Application recovery
```

---

## Design Principles

### 1. Configuration-Driven

Tools defined in YAML, not code:

- ✅ Easy to update without redeploying
- ✅ Non-technical users can add tools
- ✅ Version control friendly

### 2. Stateless

Matimo doesn't store anything:

- ✅ No database required
- ✅ Easy to scale
- ✅ Simple to test

### 3. Multi-Provider

Support any OAuth2 provider:

- ✅ Google, GitHub, Slack out of box
- ✅ Add new providers with YAML
- ✅ No code changes needed

### 4. Type-Safe

Full TypeScript + Zod validation:

- ✅ Catch errors at load time
- ✅ IDE autocomplete support
- ✅ Zero `any` types

### 5. Framework-Agnostic

Works with any framework:

- ✅ Direct SDK usage
- ✅ LangChain integration
- ✅ Custom framework support
- ✅ Coming: CrewAI, Vercel AI, etc.

---

## Extension Points

### Adding a New Tool

1. Create `tools/category/tool-name/definition.yaml`
2. Loader automatically discovers it
3. Validation confirms correctness
4. Ready to use

### Adding an Executor

1. Extend `Executor` base class
2. Implement `execute(tool, params)` method
3. Add to tool execution dispatch
4. Support new execution types

### Adding a Provider

1. Create `tools/provider-name/definition.yaml`
2. Set `type: provider`
3. Configure OAuth2 endpoints
4. Tools reference provider in authentication

---

## Performance Characteristics

| Operation          | Time      | Notes                       |
| ------------------ | --------- | --------------------------- |
| Load tools         | ~50ms     | One-time, cached            |
| Validate schema    | ~5ms      | Per tool                    |
| Execute command    | Varies    | Depends on command          |
| Execute HTTP       | 100-500ms | Network dependent           |
| OAuth token inject | <1ms      | Environment variable lookup |

---

## Next Steps

- **[SDK Usage Patterns](../user-guide/SDK_PATTERNS.md)** — How to use Matimo
- **[Tool Specification](../tool-development/YAML_TOOLS.md)** — How to build tools
- **[Troubleshooting](../troubleshooting/FAQ.md)** — Common issues
