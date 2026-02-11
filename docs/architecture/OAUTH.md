# Matimo OAuth2 Implementation Guide

Complete reference for OAuth2 in Matimo: architecture, token injection, provider configuration, troubleshooting, and best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [OAuth2 Flow](#oauth2-flow)
- [Provider YAML Configuration](#provider-yaml-configuration)
- [Token Injection System](#token-injection-system)
- [Implementation Details](#implementation-details)
- [Security Considerations](#security-considerations)
- [Multi-Provider Support](#multi-provider-support)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

### Design Principles

Matimo's OAuth2 implementation follows these core principles:

1. **Stateless Design**: Matimo does NOT store tokens. Users provide tokens via environment variables.
2. **YAML-Driven Configuration**: Provider OAuth endpoints and settings are defined in YAML, not hardcoded.
3. **Generic Parameter Injection**: Works for ANY provider (Gmail, GitHub, Slack) without hardcoding provider-specific logic.
4. **Framework-Agnostic**: OAuth flows happen outside Matimo; Matimo handles token injection and usage.
5. **Scalable**: Supports unlimited providers by adding YAML files only.

### Why This Approach?

Traditional OAuth implementations are monolithic and provider-specific. Matimo separates concerns:

- **OAuth Flows** (user authentication, token refresh) → Handled outside Matimo
- **Token Storage** → User's responsibility (environment variables, secure vaults)
- **Token Usage** → Matimo's responsibility (auto-inject into tool execution)

This keeps Matimo lightweight and lets users manage OAuth however they prefer.

## Architecture

### System Layers

```
┌────────────────────────────────────────────────────────────────┐
│ User Code / Framework (LangChain, CrewAI, custom)              │
│ └─ Sets: GMAIL_ACCESS_TOKEN=token123                           │
│ └─ Calls: matimo.execute('gmail-send-email', {to, subject})    │
└───────────┬────────────────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────────────────┐
│ MatimoInstance (src/matimo-instance.ts)                        │
│ ├─ execute(toolName, params)                                   │
│ ├─ 1. Load tool from YAML                                      │
│ ├─ 2. injectAuthParameters(tool, params)  ← KEY STEP           │
│ │   └─ Pattern matching: looks for TOKEN/KEY/SECRET parameters │
│ │   └─ Environment lookup: PARAM_NAME                          │
│ │   └─ Merges found tokens into execution params               │
│ ├─ 3. Call executor (HttpExecutor, CommandExecutor)            │
│ └─ 4. Return result                                            │
└───────────┬────────────────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────────────────┐
│ Tool YAML Definition (tools/provider/tool-name.yaml)           │
│ ├─ execution:                                                  │
│ │   ├─ type: http                                              │
│ │   ├─ url: https://gmail.googleapis.com/gmail/v1/users/me/... │
│ │   ├─ headers:                                                │
│ │   │   └─ Authorization: "Bearer {GMAIL_ACCESS_TOKEN}"        │
│ │   ├─ query_params: {...}                                     │
│ │   └─ parameter_encoding: {...}                               │
│ ├─ authentication:                                             │
│ │   ├─ type: oauth2                                            │
│ │   ├─ provider: gmail                                         │
│ │   └─ required_scopes: [...]                                  │
│ └─ parameters: {...}                                           │
└───────────┬────────────────────────────────────────────────────┘
            ↓
┌────────────────────────────────────────────────────────────────┐
│ Provider Config YAML (tools/provider/definition.yaml)          │
│ ├─ Centralized OAuth2 endpoints                                │
│ ├─ Example for Gmail:                                          │
│ │   ├─ token_url: https://oauth2.googleapis.com/token          │
│ │   ├─ auth_url: https://accounts.google.com/o/oauth2/auth     │
│ │   ├─ scopes: {gmail: [...], drive: [...]}                    │
│ │   └─ redirect_uri: https://localhost:3000/callback           │
│ └─ Used by OAuth2ProviderLoader                                │
└────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component                  | Purpose                                | Location                             |
| -------------------------- | -------------------------------------- | ------------------------------------ |
| **MatimoInstance**         | Main SDK class; orchestrates execution | `src/matimo-instance.ts`             |
| **injectAuthParameters()** | Pattern-based token injection          | `src/matimo-instance.ts`             |
| **OAuth2ProviderLoader**   | Loads provider config from YAML        | `src/auth/oauth2-provider-loader.ts` |
| **OAuth2ProviderConfig**   | In-memory provider configuration       | `src/auth/oauth2-provider-config.ts` |
| **ToolDefinition**         | Type for tool schemas                  | `src/core/types.ts`                  |
| **HttpExecutor**           | Executes HTTP requests                 | `src/executors/http-executor.ts`     |

## OAuth2 Flow

### Standard OAuth2 Authorization Flow

Matimo supports the **Authorization Code Flow** (most common for web apps and CLI tools):

```
User Application                          Google OAuth Server
      ↓                                            ↑
      1. Redirect to Google                       │
         GET https://accounts.google.com/o/oauth2/auth
         ?client_id=YOUR_CLIENT_ID
         &redirect_uri=http://localhost:3000/callback
         &scope=https://www.googleapis.com/auth/gmail.send
         &response_type=code
      └───────────────────────────────────────────→
                                                   │
                                    2. User clicks "Allow"
                                                   │
      3. Browser redirected to callback     ←──────┘
         with authorization code (auth_code)
      ↓
      4. Exchange code for token (backend)
         POST https://oauth2.googleapis.com/token
         {
           code: auth_code,
           client_id: YOUR_CLIENT_ID,
           client_secret: YOUR_CLIENT_SECRET,
           grant_type: "authorization_code"
         }
      └───────────────────────────────────────────→
                                                   │
      5. Receive access_token + refresh_token ←───┘
      ↓
      6. Store access_token (env var, secure vault)
      ↓
      7. Use with Matimo:
         process.env.GMAIL_ACCESS_TOKEN = access_token
         await matimo.execute('gmail-send-email', {...})
```

### Matimo's Role in the Flow

**What Matimo DOES:**

- ✅ Inject tokens into tool execution (step 7)
- ✅ Validate token is present before execution
- ✅ Handle token in HTTP headers correctly
- ✅ Support token override at runtime

**What Matimo DOES NOT Do:**

- ❌ Perform OAuth authorization (steps 1-2)
- ❌ Exchange code for token (step 4)
- ❌ Store tokens (step 6)
- ❌ Refresh expired tokens
- ❌ Handle user login/logout

**Why?** Matimo is framework-agnostic and stateless. OAuth flows vary by framework and security requirements.

### Token Lifecycle in Matimo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User obtains token (outside Matimo)                      │
│    - Via OAuth playground                                   │
│    - Via OAuth library (google-auth-library, etc.)          │
│    - Via custom OAuth flow                                  │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Store token in environment                               │
│    export GMAIL_ACCESS_TOKEN=ya29.a0AXooCg...               │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Matimo injectAuthParameters()                            │
│    - Scans tool's execution config for {PARAM} placeholders │
│    - Finds {GMAIL_ACCESS_TOKEN}                             │
│    - Looks up env: GMAIL_ACCESS_TOKEN                       │
│    - Injects into request headers/body                      │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. HttpExecutor sends request with token                    │
│    Authorization: Bearer ya29.a0AXooCg...                   │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. API validates token, executes request                    │
└─────────────────────────────────────────────────────────────┘
```

## Provider YAML Configuration

### Provider Definition File Structure

Each provider has a central configuration file: `tools/{provider}/definition.yaml`

**Example: Gmail Provider** (`tools/gmail/definition.yaml`)

```yaml
provider:
  name: gmail
  description: Google Gmail API
  documentation_url: https://developers.google.com/gmail/api

oauth2:
  # OAuth2 endpoints
  auth_url: https://accounts.google.com/o/oauth2/auth
  token_url: https://oauth2.googleapis.com/token
  revoke_url: https://oauth2.googleapis.com/revoke

  # Scopes for different permission levels
  scopes:
    send:
      - https://www.googleapis.com/auth/gmail.send
      - https://www.googleapis.com/auth/gmail.readonly
    draft:
      - https://www.googleapis.com/auth/gmail.modify
    full_access:
      - https://www.googleapis.com/auth/gmail

  # Default redirect URI for local dev
  redirect_uri: http://localhost:3000/callback

  # If your app needs specific settings
  approval_prompt: force # Force consent screen
  access_type: offline # Get refresh token

# Override mechanism (defined in tool YAML)
parameter_mapping:
  # Maps parameter names to environment variable patterns
  - parameter: GMAIL_ACCESS_TOKEN
    env_pattern: 'GMAIL_ACCESS_TOKEN'
    required: true
    description: 'Gmail OAuth access token'
```

### Supported Provider Fields

| Field                    | Type   | Required | Description                                 |
| ------------------------ | ------ | -------- | ------------------------------------------- |
| `provider.name`          | string | Yes      | Provider identifier (gmail, github, slack)  |
| `provider.description`   | string | No       | Human-readable description                  |
| `oauth2.auth_url`        | string | Yes      | Authorization endpoint                      |
| `oauth2.token_url`       | string | Yes      | Token exchange endpoint                     |
| `oauth2.revoke_url`      | string | No       | Token revocation endpoint                   |
| `oauth2.scopes`          | object | Yes      | Available OAuth scopes (grouped by feature) |
| `oauth2.redirect_uri`    | string | Yes      | Redirect URI after user authorizes          |
| `oauth2.approval_prompt` | string | No       | "force" to always show consent screen       |
| `oauth2.access_type`     | string | No       | "offline" to get refresh token              |

## Token Injection System

### How Matimo Auto-Injects Tokens

The `injectAuthParameters()` method in `MatimoInstance` performs three steps:

#### Step 1: Extract Parameter Placeholders

Scan the tool's execution config for `{PARAM_NAME}` patterns:

```yaml
execution:
  type: http
  url: 'https://gmail.googleapis.com/...'
  headers:
    Authorization: 'Bearer {GMAIL_ACCESS_TOKEN}' # ← Found!
  body:
    message: '{COMPOSED_MESSAGE}' # ← Found!
```

Result: Array of found parameters: `["GMAIL_ACCESS_TOKEN", "COMPOSED_MESSAGE"]`

#### Step 2: Identify Auth Parameters

Filter by pattern matching (parameters are auth-related if they contain):

- `TOKEN`
- `KEY`
- `SECRET`
- `PASSWORD`
- `CREDENTIAL`
- `APIKEY`

Example:

- ✅ `GMAIL_ACCESS_TOKEN` → Contains "TOKEN" → Auth parameter
- ✅ `API_KEY` → Contains "KEY" → Auth parameter
- ❌ `COMPOSED_MESSAGE` → No match → User parameter (not injected)

#### Step 3: Environment Lookup & Injection

For each auth parameter, look up environment variables:

```typescript
// Parameter: GMAIL_ACCESS_TOKEN

// Try 1:  prefix (recommended)
process.env.GMAIL_ACCESS_TOKEN;
// Falls back to:

// Try 2: Direct name
process.env.GMAIL_ACCESS_TOKEN;
```

If found, inject into execution parameters.

### Code Implementation

```typescript
// In src/matimo-instance.ts

private injectAuthParameters(
  tool: ToolDefinition,
  params: Record<string, any>
): Record<string, any> {
  // Step 1: Extract parameter placeholders from execution config
  const placeholders = this.extractParameterPlaceholders(
    tool.execution
  );

  // Step 2 & 3: For each placeholder, attempt to inject from environment
  const injected = { ...params };

  for (const placeholder of placeholders) {
    // Check if this looks like an auth parameter
    if (this.isAuthParameter(placeholder)) {
      // Try  prefix first, then fallback to direct name
      const envKey = `${placeholder}`;
      let value = process.env[envKey] || process.env[placeholder];

      if (value) {
        injected[placeholder] = value;
      }
    }
  }

  return injected;
}

private extractParameterPlaceholders(
  obj: any
): string[] {
  const placeholders: string[] = [];
  const regex = /\{(\w+)\}/g;

  const scan = (value: any) => {
    if (typeof value === 'string') {
      let match;
      while ((match = regex.exec(value)) !== null) {
        placeholders.push(match[1]);
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(scan);
    }
  };

  scan(obj);
  return [...new Set(placeholders)]; // Deduplicate
}

private isAuthParameter(name: string): boolean {
  const authPatterns = [
    'TOKEN', 'KEY', 'SECRET', 'PASSWORD',
    'CREDENTIAL', 'APIKEY', 'AUTH'
  ];
  return authPatterns.some(pattern =>
    name.toUpperCase().includes(pattern)
  );
}
```

### Token Injection Examples

#### Example 1: Gmail Send Email

**Tool YAML:**

```yaml
name: send-email
execution:
  type: http
  method: post
  url: https://gmail.googleapis.com/gmail/v1/users/me/messages/send
  headers:
    Authorization: 'Bearer {GMAIL_ACCESS_TOKEN}'
  body:
    raw: '{ENCODED_MESSAGE}'
```

**User Code:**

```typescript
process.env.GMAIL_ACCESS_TOKEN = 'ya29.a0AXooCg...';

await matimo.execute('gmail-send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Test message',
  // GMAIL_ACCESS_TOKEN NOT needed - auto-injected!
});
```

**What Happens:**

1. User provides: `to`, `subject`, `body`
2. Matimo extracts placeholders: `GMAIL_ACCESS_TOKEN`, `ENCODED_MESSAGE`
3. Matimo identifies `GMAIL_ACCESS_TOKEN` as auth parameter (contains "TOKEN")
4. Matimo looks up `GMAIL_ACCESS_TOKEN` → found
5. Matimo injects: `GMAIL_ACCESS_TOKEN: "ya29.a0AXooCg..."`
6. Request sent with `Authorization: Bearer ya29.a0AXooCg...`

#### Example 2: GitHub Repository API

**Tool YAML:**

```yaml
name: get-repo-info
execution:
  type: http
  url: https://api.github.com/repos/{owner}/{repo}
  headers:
    Authorization: 'Bearer {GITHUB_API_KEY}'
    Accept: 'application/vnd.github.v3+json'
```

**User Code:**

```typescript
process.env.GITHUB_API_KEY = 'ghp_abc123...';

await matimo.execute('get-repo-info', {
  owner: 'torvalds',
  repo: 'linux',
  // GITHUB_API_KEY auto-injected
});
```

## Implementation Details

### Files & Locations

| File                                 | Purpose                                           |
| ------------------------------------ | ------------------------------------------------- |
| `src/matimo-instance.ts`             | Main SDK class, contains `injectAuthParameters()` |
| `src/auth/oauth2-provider-config.ts` | OAuth2 provider configuration loader              |
| `src/auth/oauth2-provider-loader.ts` | YAML provider file parser                         |
| `src/core/types.ts`                  | `ToolDefinition` interface                        |
| `src/executors/http-executor.ts`     | HTTP request execution                            |
| `tools/{provider}/definition.yaml`   | Provider OAuth configuration                      |
| `tools/{provider}/{tool}.yaml`       | Individual tool definitions                       |

### OAuth2ProviderLoader

```typescript
// Load provider config from YAML
const loader = new OAuth2ProviderLoader('./tools');
const gmailConfig = await loader.loadProvider('gmail');

// Result:
{
  name: 'gmail',
  oauth2: {
    auth_url: '...',
    token_url: '...',
    scopes: { ... }
  }
}
```

### OAuth2ProviderConfig

```typescript
// In-memory provider config storage
const config = new OAuth2ProviderConfig();

// Register provider
await config.addProvider('gmail', gmailConfig);

// Retrieve provider
const provider = config.getProvider('gmail');

// List all providers
const all = config.getAllProviders();
```

## Security Considerations

### ✅ Security Best Practices

#### 1. Token Storage

**DON'T:**

```bash
# ❌ Bad: Token in code
const token = "ya29.a0AXooCg...";
```

**DO:**

```bash
# ✅ Good: Token in environment variable
export GMAIL_ACCESS_TOKEN="ya29.a0AXooCg..."

# ✅ Better: Use .env file with .gitignore
# .env (never commit)
GMAIL_ACCESS_TOKEN=ya29.a0AXooCg...

# .gitignore
.env
.env.local
```

**✅ BEST: Secure Vault**

```bash
# Use 1Password, LastPass, AWS Secrets Manager, etc.
# Retrieve at runtime:
const token = await vault.getSecret('matimo-gmail-token');
process.env.GMAIL_ACCESS_TOKEN = token;
```

#### 2. Token Permissions (Scopes)

Always request minimum required scopes:

```yaml
# ❌ Bad: Full access
scopes:
  - https://www.googleapis.com/auth/gmail

# ✅ Good: Specific scopes
scopes:
  send:
    - https://www.googleapis.com/auth/gmail.send  # Send only
  read:
    - https://www.googleapis.com/auth/gmail.readonly  # Read only
```

#### 3. Token Expiration

Monitor token expiration and refresh:

```typescript
// Token expiration typically: 1 hour for access tokens
// What to do when expired:

// Option 1: Refresh token (Phase 2 feature)
const newToken = await oauth2.refreshToken(refreshToken);
process.env.GMAIL_ACCESS_TOKEN = newToken;

// Option 2: Re-authorize
console.error('Token expired. Please re-authenticate:');
console.log('Visit: https://oauth2.example.com/authorize');
```

#### 4. Token Revocation

Always revoke tokens when done:

```typescript
// After tool execution completes
await oauth2.revokeToken(accessToken, {
  provider: 'gmail',
  revoke_url: 'https://oauth2.googleapis.com/revoke',
});
```

#### 5. Log Sanitization

Never log tokens:

```typescript
// ❌ Bad: Token in logs
logger.info('Sending email', {
  token: params.GMAIL_ACCESS_TOKEN, // DANGER!
  to: 'user@example.com',
});

// ✅ Good: Sanitize sensitive data
const sanitized = {
  to: params.to,
  subject: params.subject,
  // token: never logged
};
logger.info('Sending email', sanitized);
```

### 🛡️ Attack Mitigation

#### Cross-Site Request Forgery (CSRF) Protection

When implementing OAuth flow (Phase 2):

```typescript
// Generate random state parameter
const state = crypto.randomBytes(32).toString('hex');
session.setState(state);

// Verify state in callback
if (request.query.state !== session.getState()) {
  throw new Error('State mismatch - CSRF attack?');
}
```

#### Token Leakage Prevention

```typescript
// ❌ Never expose tokens in URLs
GET /api/tool?token=ya29.a0AXooCg...

// ✅ Always use headers or POST body
headers: {
  Authorization: 'Bearer ya29.a0AXooCg...'
}
```

#### Secret Rotation

```yaml
# tools/gmail/definition.yaml
oauth2:
  client_id: ${GMAIL_CLIENT_ID} # From env
  client_secret: ${GMAIL_CLIENT_SECRET} # From env (rotate regularly)
  # Schedule periodic secret rotation in your OAuth app settings
```

## Multi-Provider Support

### Adding a New Provider

Matimo supports unlimited providers without code changes.

#### Step 1: Create Provider Config

Create `tools/{provider}/definition.yaml`:

```yaml
# tools/github/definition.yaml
provider:
  name: github
  description: GitHub API
  documentation_url: https://docs.github.com/en/rest

oauth2:
  auth_url: https://github.com/login/oauth/authorize
  token_url: https://github.com/login/oauth/access_token
  revoke_url: https://api.github.com/applications/{client_id}/token

  scopes:
    read:
      - repo:status
      - public_repo
    write:
      - repo
    admin:
      - admin:repo_hook
      - admin:user

  redirect_uri: http://localhost:3000/callback
  access_type: offline # Get refresh token
```

#### Step 2: Create Tool Definitions

Create `tools/github/{tool}.yaml` files:

```yaml
# tools/github/get-repo.yaml
name: get-repo
description: Get GitHub repository information
version: '1.0.0'

parameters:
  owner:
    type: string
    required: true
    description: Repository owner
  repo:
    type: string
    required: true
    description: Repository name

execution:
  type: http
  method: get
  url: 'https://api.github.com/repos/{owner}/{repo}'
  headers:
    Authorization: 'Bearer {GITHUB_API_KEY}'
    Accept: 'application/vnd.github.v3+json'

authentication:
  type: oauth2
  provider: github
  required_scopes:
    - public_repo

output_schema:
  type: object
  properties:
    name:
      type: string
    full_name:
      type: string
    stars:
      type: integer
    description:
      type: string
```

#### Step 3: Use in Code

No code changes needed!

```typescript
// Matimo automatically discovers and loads tools/github/*.yaml
const tools = await loader.loadToolsFromDirectory('./tools');

// GitHub tools are now available
await matimo.execute('get-repo', {
  owner: 'torvalds',
  repo: 'linux',
  // GITHUB_API_KEY auto-injected from GITHUB_API_KEY
});
```

### Runtime Override Example

```typescript
// Override provider endpoint at runtime
const tool = tools.find((t) => t.name === 'get-repo');

// Option 1: Env variable
process.env.GITHUB_API_KEY = 'custom-token';

// Option 2: Runtime argument
const result = await matimo.execute('get-repo', {
  owner: 'torvalds',
  repo: 'linux',
  GITHUB_API_KEY: 'custom-token', // Overrides env
});
```

## Token Passing Methods

### How Users Can Pass Tokens

Users have **multiple flexible options** to pass tokens to Matimo - not just environment variables:

#### Option 1: Explicit Parameter (Highest Priority)

Pass the token directly in the execute call. This is the most flexible and secure approach:

```typescript
const token = await getTokenFromVault('gmail'); // Get from vault, database, etc.

await matimo.execute('send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Test',
  GMAIL_ACCESS_TOKEN: token, // ✅ Explicit - takes precedence!
});
```

**Advantages:**

- ✅ Most secure (tokens not stored in env)
- ✅ Per-request flexibility
- ✅ Multi-tenant support
- ✅ Works with secure vaults

**Use cases:** Production, microservices, multi-tenant apps

#### Option 2: Runtime Environment Variable

Set the environment variable at runtime from a vault or database:

```typescript
// Fetch token at startup
const token = await secretsManager.getSecret('matimo-gmail-token');

// Set in environment
process.env.GMAIL_ACCESS_TOKEN = token;

// Token auto-injected in all execute calls
await matimo.execute('send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Test',
  // Token auto-injected from process.env
});
```

**Advantages:**

- ✅ Clean code (auto-injection)
- ✅ Simple to implement
- ✅ Works across app

**Use cases:** Development, single-tenant apps, startups

#### Option 3: Combination (Best Practice)

Use both approaches together:

```typescript
// At app startup - set env var
process.env.GMAIL_ACCESS_TOKEN = initialToken;

// Later - override for specific request if needed
await matimo.execute('send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Test',
  GMAIL_ACCESS_TOKEN: differentToken, // Override for this request
});

// Other requests - use env var (auto-injected)
await matimo.execute('send-email', {
  to: 'other@example.com',
  subject: 'Hello',
  body: 'Test',
  // Uses GMAIL_ACCESS_TOKEN from env
});
```

### Token Resolution Priority

When Matimo needs a token, it checks in this order:

```
1. Explicit parameter (highest priority)
   └─ await matimo.execute('tool', { GMAIL_ACCESS_TOKEN: 'explicit' })

2. Environment variable (fallback)
   ├─ process.env.GMAIL_ACCESS_TOKEN
   └─ process.env.GMAIL_ACCESS_TOKEN (if  not found)

3. Not found (lowest priority)
   └─ Error: "Missing required parameter: GMAIL_ACCESS_TOKEN"
```

The first match wins - others are ignored.

### Real-World Examples

#### Example: Secure Vault (AWS Secrets Manager)

```typescript
import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager();

async function executeWithVaultToken(toolName, params) {
  // Fetch token from AWS Secrets Manager at runtime
  const secret = await secretsManager.getSecretValue({
    SecretId: 'matimo-gmail-token',
  });

  const token = JSON.parse(secret.SecretString).token;

  // Pass explicitly - never stored in code or env
  return await matimo.execute(toolName, {
    ...params,
    GMAIL_ACCESS_TOKEN: token,
  });
}

// Usage
await executeWithVaultToken('send-email', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Test',
});
```

#### Example: Multi-Tenant Application

```typescript
// Different token per user/tenant
async function sendEmailForUser(userId, mailParams) {
  const user = await db.users.findById(userId);
  const userToken = user.gmail_access_token; // From database

  return await matimo.execute('send-email', {
    ...mailParams,
    GMAIL_ACCESS_TOKEN: userToken, // User-specific token
  });
}

// Each user has their own token
await sendEmailForUser('user-1', { to, subject, body });
await sendEmailForUser('user-2', { to, subject, body });
```

#### Example: Token Refresh Handler

```typescript
class TokenManager {
  private currentToken: string;

  async ensureValidToken() {
    // Check if token expired
    if (this.isTokenExpired(this.currentToken)) {
      // Refresh and update
      this.currentToken = await this.refreshAccessToken();
      process.env.GMAIL_ACCESS_TOKEN = this.currentToken;
    }
    return this.currentToken;
  }

  async execute(toolName, params) {
    const token = await this.ensureValidToken();

    return await matimo.execute(toolName, {
      ...params,
      GMAIL_ACCESS_TOKEN: token, // Always fresh
    });
  }
}

// Usage
const tokenManager = new TokenManager();
await tokenManager.execute('send-email', { to, subject, body });
```

#### Example: OAuth Callback Handler (Phase 2 Preparation)

```typescript
async function handleOAuthCallback(code, userId) {
  // Exchange code for token
  const tokens = await oauth2.exchangeCode(code);

  // Store tokens (choose one approach)

  // Option A: Database
  await db.users.update(userId, {
    gmail_access_token: tokens.access_token,
    gmail_refresh_token: tokens.refresh_token,
    token_expires_at: Date.now() + tokens.expires_in * 1000,
  });

  // Option B: Secure Vault (AWS Secrets Manager, 1Password, etc.)
  await vault.setSecret(`user-${userId}-gmail-token`, tokens.access_token);

  // Later, when executing tools:
  const token = await db.users.findById(userId).gmail_access_token;
  // OR
  const token = await vault.getSecret(`user-${userId}-gmail-token`);

  // Pass to Matimo
  await matimo.execute('send-email', {
    to: 'user@example.com',
    subject: 'Hello',
    body: 'Test',
    GMAIL_ACCESS_TOKEN: token, // Explicit token
  });
}
```

### Comparison: Which Approach to Use?

| Approach                  | Pros                                          | Cons                             | Best For                                |
| ------------------------- | --------------------------------------------- | -------------------------------- | --------------------------------------- |
| **Explicit Parameter**    | 🔒 Secure, flexible, per-request, no env vars | More verbose                     | Production, multi-tenant, microservices |
| **Runtime Environment**   | ✨ Clean code, auto-injection, simple         | Token in memory, app-wide        | Development, single-tenant, startups    |
| **Vault/Secrets Manager** | 🛡️ Enterprise-secure, auditable, centralized  | Extra infrastructure, complexity | Enterprise apps, compliance-required    |
| **OAuth Flow**            | 🔑 User-authenticated, standards-based        | Phase 2 (not yet)                | Future production apps                  |

## Examples

### Example 1: Gmail with Factory Pattern

```typescript
// examples/tools/gmail/gmail-factory.ts

import { MatimoInstance } from matimo;

// Initialize Matimo with tools
const matimo = await MatimoInstance.init('./tools');

// Gmail access token from environment
process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'ya29.a0AXooCg...';

// Execute without passing token explicitly
const result = await matimo.execute('send-email', {
  to: 'recipient@example.com',
  subject: 'Hello from Matimo',
  body: 'This is a test message'
  // Token auto-injected!
});

console.log('Email sent:', result.id);
```

### Example 2: GitHub with Decorator Pattern

```typescript
// Example: Decorator auto-injects GITHUB_API_KEY

import { tool } from '../../../src';

@tool('get-repo')
async getGithubRepo(owner: string, repo: string) {
  return undefined;  // Matimo intercepts
}

// Set token
process.env.GITHUB_API_KEY = 'ghp_abc123...';

// Call - no token needed
const repo = await getGithubRepo('torvalds', 'linux');
console.log(repo.name);  // 'linux'
```

### Example 3: AI Agent Deciding Which Tool to Use

```typescript
// examples/tools/gmail/gmail-langchain.ts

import { MatimoInstance, convertToolsToLangChain } from 'matimo';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain/agents';

const matimo = await MatimoInstance.init('./tools');

// Get Gmail-specific tools
const gmailTools = matimo.listTools().filter((t) => t.name.startsWith('gmail-'));

// Convert to LangChain format with OAuth token
const langchainTools = await convertToolsToLangChain(gmailTools, matimo, {
  GMAIL_ACCESS_TOKEN: process.env.GMAIL_ACCESS_TOKEN!,
});

// Agent decides which tool to use based on user request
const agent = await createAgent({
  model: new ChatOpenAI({ modelName: 'gpt-4' }),
  tools: langchainTools,
});

// User says what they want in natural language
const result = await agent.invoke({
  messages: [
    {
      role: 'user',
      content: 'Send an email to alice@example.com saying hello',
    },
  ],
});

// Agent chooses 'send-email' tool, passes parameters,
// Matimo injects GMAIL_ACCESS_TOKEN, email is sent!
```

## Architecture Diagrams

### Token Injection System Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        User Code                                 │
│  process.env.GMAIL_ACCESS_TOKEN = "ya29.a0AXooCg..."             │
│  await matimo.execute('send-email', {to, subject, body})         │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   MatimoInstance.execute()                       │
│  1. Load tool from registry                                      │
│     name: 'send-email'                                           │
│     execution:                                                   │
│       headers:                                                   │
│         Authorization: "Bearer {GMAIL_ACCESS_TOKEN}"             │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────┐
│        injectAuthParameters(tool, params)                        │
│  Step 1: extractParameterPlaceholders(execution)                 │
│  Result: ["GMAIL_ACCESS_TOKEN", ...]                             │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────┐
│        isAuthParameter(placeholder)                              │
│  Check if contains: TOKEN, KEY, SECRET, PASSWORD, etc.           │
│  "GMAIL_ACCESS_TOKEN" contains "TOKEN" ✓                         │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────┐
│         Environment Variable Lookup                              │
│  Try: GMAIL_ACCESS_TOKEN ✓ Found!                                │
│  Value: "ya29.a0AXooCg..."                                       │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│          Merge into Execution Parameters                          │
│  {                                                                │
│    GMAIL_ACCESS_TOKEN: "ya29.a0AXooCg...",                        │
│    to: "user@example.com",                                        │
│    subject: "Hello",                                              │
│    body: "Test"                                                   │
│  }                                                                │
└───────────┬───────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────┐
│           HttpExecutor.execute()                                 │
│  Replace {GMAIL_ACCESS_TOKEN} with actual token value            │
│  Headers: {                                                      │
│    Authorization: "Bearer ya29.a0AXooCg..."                      │
│  }                                                               │
└───────────┬──────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────────┐
│        Send HTTP Request to Gmail API                              │
│  POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send │
│  Headers: {Authorization: "Bearer ya29.a0AXooCg..."}               │
└───────────┬────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│          Return Result to User                                    │
│  {                                                                │
│    id: "thread123",                                               │
│    threadId: "abc456",                                            │
│    labelIds: ["SENT"]                                             │
│  }                                                                │
└───────────────────────────────────────────────────────────────────┘
```

### OAuth2 Standard Authorization Code Flow

```
┌────────────────────┐                                    ┌──────────────────────┐
│   User's Browser   │                                    │  Google Auth Server  │
└────────┬───────────┘                                    └──────────┬───────────┘
         │                                                           │
         │  1. User clicks "Sign in with Google"                     │
         ├──────────────────────────────────────────────────────────>
         │     GET /oauth2/auth?client_id=...&scope=...              │
         │                                                           │
         │                               2. Google shows consent     │
         │                                  screen                   │
         │     <─────────────────────────────────────────────────────
         │     (User sees: "Allow app to send emails?")              │
         │                                                           │
         │  3. User clicks "Allow"                                   │
         │                                                           │
         │     Redirect to callback with code                        │
         │     <─────────────────────────────────────────────────────
         │     Location: http://localhost:3000/callback?code=abc123
         │
┌────────┴───────────┐
│  Your Backend      │ 4. Exchange code for token
│  /callback handler │    POST https://oauth2.googleapis.com/token
└────────┬───────────┘    body: {code, client_id, client_secret}
         │                                                           │
         │                                                           │
         │──────────────────────────────────────────────────────────>
         │                                                      Google
         │                                                   exchanges
         │                                                      code
         │                                                           │
         │  5. Receive tokens                                        │
         │     {                                                     │
         │       access_token: "ya29.a0AXooCg...",                   │
         │       refresh_token: "1//0gXKJV...",                      │
         │       expires_in: 3600                                    │
         │     }                                                     │
         │     <─────────────────────────────────────────────────────
         │
         └─ 6. Store tokens securely
              (database, secure vault, env var)
              │
              └─ 7. Use with Matimo
                  process.env.GMAIL_ACCESS_TOKEN = token
                  matimo.execute('send-email', {...})
```

### Environment Variable Resolution

```
Parameter Name: GMAIL_ACCESS_TOKEN

┌──────────────────────────────────────────────────────────┐
│ Check 1:  Prefixed (Recommended)                         │
│                                                          │
│ process.env.GMAIL_ACCESS_TOKEN                           │
│                                                          │
│ ✓ If found → Use it                                      │
│ │                                                        │
│ └─> GMAIL_ACCESS_TOKEN = "ya29.a0AXooCg..."              │
│                                                          │
└──────────────────────────────────────────────────────────┘
                        │
                        │ NOT FOUND
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Check 2: Direct Name (Fallback)                         │
│                                                         │
│ process.env.GMAIL_ACCESS_TOKEN                          │
│                                                         │
│ ✓ If found → Use it                                     │
│ │                                                       │
│ └─> GMAIL_ACCESS_TOKEN = "ya29.a0AXooCg..."             │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        │ NOT FOUND
                        ▼
┌─────────────────────────────────────────────────────────┐
│ No Token Found                                          │
│                                                         │
│ Parameter not injected                                  │
│ Tool execution may fail if token was required           │
│                                                         │
│ Error: "Missing required parameter: GMAIL_ACCESS_TOKEN" │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Quick Reference

### Getting Started (5 Steps)

1. **Obtain Token** - Via OAuth Playground or your app's auth flow
2. **Set Environment** - `export GMAIL_ACCESS_TOKEN=token`
3. **Load Tools** - `await loader.loadToolsFromDirectory()`
4. **Execute** - `await matimo.execute('tool-name', params)`
5. **Handle Errors** - Check error code and token validity

### Common Patterns

| Pattern              | Use Case              | Token Passing        |
| -------------------- | --------------------- | -------------------- |
| **Factory**          | Scripts, direct SDK   | Auto-inject from env |
| **Decorator**        | Framework integration | Auto-inject from env |
| **AI Agent**         | LLM-driven tools      | Auto-inject from env |
| **Environment File** | Local development     | Load from `.env`     |
| **Secure Vault**     | Production            | Retrieve at runtime  |

### Environment Variable Names

**Format:** `{PROVIDER}_{TYPE}`

Examples:

- `GMAIL_ACCESS_TOKEN`
- `GITHUB_API_KEY`
- `SLACK_BOT_TOKEN`

**Fallback:** Direct name without `` prefix

### Security Checklist

- [ ] **Storage**: Never hardcode tokens in source code
- [ ] **Files**: Add `.env` to `.gitignore`
- [ ] **Logging**: Never log tokens or include in error messages
- [ ] **Scope**: Request minimum required permissions only
- [ ] **Expiration**: Monitor token expiry and refresh periodically
- [ ] **Rotation**: Rotate tokens regularly (recommend: monthly)
- [ ] **Revocation**: Revoke tokens when no longer needed
- [ ] **Transmission**: Always use HTTPS/TLS for requests

## Troubleshooting

### Common Issues

| Symptom                                          | Cause                           | Solution                              |
| ------------------------------------------------ | ------------------------------- | ------------------------------------- |
| "Missing required parameter: GMAIL_ACCESS_TOKEN" | Token env var not set           | `export GMAIL_ACCESS_TOKEN=token`     |
| "401 Unauthorized"                               | Invalid or expired token        | Refresh token or re-authenticate      |
| "403 Forbidden"                                  | Insufficient scopes             | Check token has required permissions  |
| "400 Bad Request"                                | Malformed request               | Verify parameter encoding and URL     |
| "Invalid grant"                                  | Token not recognized            | Token revoked or never issued         |
| "Token expired"                                  | Access token lifetime exceeded  | Refresh token (Phase 2 feature)       |
| Tool not found                                   | Tool YAML doesn't exist         | Verify `tools/{provider}/{tool}.yaml` |
| Parameter mismatch                               | User param doesn't match schema | Check tool's parameter definitions    |

### Debug Steps

```typescript
// 1. Check env var is set
console.log(process.env.GMAIL_ACCESS_TOKEN);

// 2. Check parameter name contains TOKEN/KEY/SECRET
const tool = tools.find((t) => t.name === 'send-email');
console.log(tool.execution);

// 3. Verify token format and expiration
// Access tokens typically valid for 1 hour

// 4. Test with explicit token override
await matimo.execute('send-email', {
  to: 'user@example.com',
  subject: 'Test',
  body: 'Test',
  GMAIL_ACCESS_TOKEN: 'explicit-token', // Bypass env lookup
});

// 5. Check token has required scopes
// Different tools need different scopes
```

### Token Expiration & Refresh

```typescript
// Token expires after ~1 hour
// Options until Phase 2 auto-refresh:

// Option 1: Refresh using OAuth library
const newToken = await oauth2.refreshToken(refreshToken);
process.env.GMAIL_ACCESS_TOKEN = newToken;

// Option 2: Re-authenticate at OAuth Playground
// Visit: https://developers.google.com/oauthplayground
// Copy fresh token to env var

// Option 3: Implement token refresh logic in your code
async function ensureValidToken() {
  const token = process.env.GMAIL_ACCESS_TOKEN;
  if (isExpired(token)) {
    const newToken = await refreshToken();
    process.env.GMAIL_ACCESS_TOKEN = newToken;
  }
  return token;
}
```

## Adding New Providers

To add support for a new provider (GitHub, Slack, etc.):

1. **Create Provider Config** - `tools/{provider}/definition.yaml`

   ```yaml
   provider:
     name: github
   oauth2:
     auth_url: https://github.com/login/oauth/authorize
     token_url: https://github.com/login/oauth/access_token
     scopes:
       - repo
       - admin:user
   ```

2. **Create Tool Definitions** - `tools/{provider}/{tool}.yaml`

   ```yaml
   authentication:
     type: oauth2
     provider: github
     required_scopes: [repo]
   execution:
     headers:
       Authorization: 'Bearer {GITHUB_API_KEY}'
   ```

3. **Set Environment Variable** - `export GITHUB_API_KEY=token`

4. **Load & Execute** - No code changes needed!
   ```typescript
   const result = await matimo.execute('get-repo', {...});
   ```

---

**Last Updated:** February 2, 2026  
**Matimo Phase:** 1 (OAuth2 provider config and token injection)  
**Next Phase:** Phase 2 - Automatic token refresh, secure storage, built-in OAuth flows
