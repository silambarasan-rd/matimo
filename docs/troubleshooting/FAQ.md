# Troubleshooting & FAQ

Common issues and solutions for Matimo v0.1.0-alpha.1

## Installation & Setup

### Q: Node.js version error

**Error**: `Node version must be 18.0.0 or higher`

**Solution**:
```bash
node --version
# If < v18, install from https://nodejs.org
# Use nvm (Node Version Manager) for easy switching:
nvm install 18
nvm use 18
```

### Q: pnpm not found

**Error**: `pnpm: command not found`

**Solution**:
```bash
npm install -g pnpm@8.15.0
pnpm --version
```

### Q: Build fails with TypeScript errors

**Error**: `Found X errors in src/**`

**Solution**:
```bash
# Clear and rebuild
pnpm clean
pnpm install
pnpm build

# If still failing, check TypeScript version
pnpm list typescript
# Should be 5.9.3 or higher
```

---

## Tool Execution

### Q: Tool not found error

**Error**: `Tool not found: calculator`

**Solutions**:
1. Verify tool exists:
```bash
pnpm validate-tools
# Lists all loaded tools
```

2. Check tools directory:
```bash
# Ensure tools/calculator/definition.yaml exists
ls -la tools/calculator/definition.yaml
```

3. Verify tool definition:
```bash
pnpm validate-tools
# Shows validation errors if YAML is invalid
```

### Q: Invalid parameters error

**Error**: `Tool validation failed: Missing required parameter: operation`

**Solutions**:
1. Check tool parameters:
```typescript
const tool = matimoInstance.getTool('calculator');
console.log(tool.parameters);  // See required fields
```

2. Verify your input matches schema:
```typescript
// ❌ Wrong
await m.execute('calculator', { value: 5 });

// ✅ Correct
await m.execute('calculator', {
  operation: 'add',
  a: 5,
  b: 3
});
```

3. Check tool spec:
```bash
cat tools/calculator/definition.yaml | grep -A 20 "parameters:"
```

### Q: HTTP tool returns 401 Unauthorized

**Error**: `HTTP 401: Unauthorized`

**Common causes**:
1. Missing OAuth token:
```bash
# Set required tokens
export GMAIL_ACCESS_TOKEN=your_token
export GITHUB_TOKEN=your_token
```

2. Expired token:
```typescript
// Token needs refresh
const newToken = await oauth2Handler.refreshTokenIfNeeded(
  userId,
  currentToken
);
```

3. Wrong token format:
```typescript
// Verify token is Bearer token, not full "Bearer token"
const token = process.env.GMAIL_ACCESS_TOKEN;
// Should be: "ya29.abc123..." not "Bearer ya29.abc123..."
```

### Q: Command executor fails

**Error**: `Command not found: node` or shell command fails

**Solutions**:
1. Verify command exists:
```bash
which node
which python
```

2. Check working directory:
```yaml
execution:
  type: command
  command: ./script.sh
  cwd: /path/to/directory  # Ensure this exists
```

3. Test command manually:
```bash
# Test the exact command
node calculator.js --op add 5 3
```

---

## OAuth2 & Authentication

### Q: OAuth token missing error

**Error**: `Missing OAuth token for provider: google`

**Solutions**:
1. Set environment variables:
```bash
export GMAIL_ACCESS_TOKEN=ya29.your_token_here
export GITHUB_TOKEN=ghp_your_token_here
export SLACK_TOKEN=xoxb-your_token_here
```

2. Verify token is set:
```typescript
console.log(process.env.GMAIL_ACCESS_TOKEN);
// Should print your token, not undefined
```

3. Check tool authentication config:
```yaml
authentication:
  type: oauth2
  provider: google  # Must match provider definition
```

### Q: OAuth provider configuration not found

**Error**: `Provider definition not found: github`

**Solutions**:
1. Verify provider YAML exists:
```bash
ls tools/github/definition.yaml
# Should exist and contain: type: provider
```

2. Check provider name:
```bash
pnpm validate-tools
# Lists all loaded providers
```

3. Verify provider YAML format:
```bash
cat tools/github/definition.yaml | head -5
# Should show: type: provider
```

### Q: Bearer token format issue

**Error**: `Invalid authorization header`

**Solutions**:
1. Use correct token format:
```bash
# ✅ Correct: Just the token
export GMAIL_ACCESS_TOKEN=ya29.abc123

# ❌ Wrong: Don't include "Bearer"
export GMAIL_ACCESS_TOKEN="Bearer ya29.abc123"
```

2. Verify token is actually a token:
```bash
echo $GMAIL_ACCESS_TOKEN | wc -c
# Should be > 20 characters
```

---

## Validation Errors

### Q: Schema validation failed

**Error**: `Tool schema validation failed: • execution: Required`

**Solutions**:
1. Check required fields in tool YAML:
```yaml
# ✅ All required fields
name: my-tool
version: 1.0.0
description: Tool description
parameters: {}
execution:
  type: http
  method: GET
  url: https://api.example.com
```

2. Run validation:
```bash
pnpm validate-tools
# Shows exact field errors
```

### Q: Invalid execution type

**Error**: `Invalid execution type: webhook`

**Solutions**:
Supported execution types are:
- ✅ `command` - Shell commands
- ✅ `http` - HTTP requests

Unsupported (coming in future releases):
- 🔜 `webhook` - v0.3.0
- 🔜 `grpc` - Future
- 🔜 `database` - Future

---

## Testing & Development

### Q: Tests fail locally

**Error**: Tests pass in CI but fail locally

**Solutions**:
1. Clear cache and reinstall:
```bash
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

2. Run specific test:
```bash
pnpm test -- --testNamePattern="oauth2"
```

3. Debug test:
```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
# Then open chrome://inspect
```

### Q: Linting errors

**Error**: `ESLint errors found`

**Solution**:
```bash
# Fix automatically
pnpm lint:fix

# Then format
pnpm format
```

---

## Performance Issues

### Q: Tool execution is slow

**Possible causes**:
1. Network latency (HTTP tools)
2. OAuth token refresh overhead
3. Tool parameter validation

**Solutions**:
```typescript
// Time tool execution
console.time('tool-execution');
const result = await m.execute('gmail-send-email', params);
console.timeEnd('tool-execution');

// Optimize: Cache tools
const tool = m.getTool('gmail-send-email');
const result = await executor.execute(tool, params);
```

### Q: High memory usage

**Solutions**:
```typescript
// Don't load all tools if not needed
const tools = m.listTools();
const filtered = tools.filter(t => t.tags.includes('gmail'));

// Or use specific tool
const tool = m.getTool('gmail-send-email');
```

---

## v0.1.0-alpha.1 Specific

### Features NOT in this version

These are planned for future releases:

- 🔜 **CLI** - `matimo` command (v0.2.0)
- 🔜 **MCP Server** - Claude integration (v0.2.0)
- 🔜 **REST API** - HTTP API (v0.3.0)
- 🔜 **Python SDK** - Python support (v0.3.0)
- 🔜 **Docker** - Containerization (v0.3.0)
- 🔜 **Rate Limiting** - Token bucket (v0.2.0)
- 🔜 **Health Monitoring** - Schema drift detection (v0.2.0)

See [FUTURE_RELEASES.md](../FUTURE_RELEASES.md) for details.

---

## Getting Help

Still stuck? Try:

1. **GitHub Issues**: [Search issues](https://github.com/tallclub/matimo/issues)
2. **GitHub Discussions**: [Ask questions](https://github.com/tallclub/matimo/discussions)
3. **Documentation**: [Full docs](../)
4. **Examples**: [See examples](../../examples/)

---

## Report a Bug

Found a bug? Help us fix it:

```bash
# 1. Check if issue exists
# Go to https://github.com/tallclub/matimo/issues

# 2. If not, create new issue with:
# - Matimo version: (run: npm list matimo)
# - Node.js version: (run: node --version)
# - Steps to reproduce
# - Expected vs actual behavior
# - Error message/stack trace
```

Thank you for helping improve Matimo! 🙏
