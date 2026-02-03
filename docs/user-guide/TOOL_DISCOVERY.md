# Tool Discovery & Filtering

Find and filter tools by name, description, and tags.

## List All Tools

```typescript
import { matimo } from 'matimo';

const m = await matimo.init('./tools');

// List all loaded tools
const allTools = m.listTools();
console.log(`Loaded ${allTools.length} tools`);

allTools.forEach(tool => {
  console.log(`• ${tool.name} - ${tool.description}`);
});
```

**Output:**
```
Loaded 8 tools
• calculator - Perform basic math operations
• gmail-send-email - Send an email via Gmail API
• gmail-list-messages - List emails from Gmail
• github-create-issue - Create a GitHub issue
... (more tools)
```

---

## Get Specific Tool

```typescript
const tool = m.getTool('calculator');

console.log(`Name: ${tool.name}`);
console.log(`Description: ${tool.description}`);
console.log(`Version: ${tool.version}`);
```

---

## Filter by Tags

```typescript
// Get tools with specific tags
const mathTools = m.getToolsByTag('math');
console.log(`Math tools: ${mathTools.map(t => t.name).join(', ')}`);

const emailTools = m.getToolsByTag('email');
console.log(`Email tools: ${emailTools.map(t => t.name).join(', ')}`);
```

---

## Search Tools

```typescript
// Search by name or description
const results = m.searchTools('email');

results.forEach(tool => {
  console.log(`Found: ${tool.name}`);
  console.log(`  Description: ${tool.description}`);
  console.log(`  Tags: ${tool.tags?.join(', ') || 'none'}`);
});
```

**Output:**
```
Found: gmail-send-email
  Description: Send an email via Gmail API
  Tags: email, gmail, http

Found: gmail-list-messages
  Description: List emails from Gmail
  Tags: email, gmail, http
```

---

## Filter Criteria

### By Type

```typescript
// Filter by execution type
const httpTools = m.listTools().filter(t => t.execution?.type === 'http');
console.log(`HTTP tools: ${httpTools.length}`);

const cmdTools = m.listTools().filter(t => t.execution?.type === 'command');
console.log(`Command tools: ${cmdTools.length}`);
```

### By Authentication

```typescript
// Tools requiring OAuth2
const oauth2Tools = m.listTools().filter(t => t.authentication?.type === 'oauth2');
console.log(`OAuth2 tools: ${oauth2Tools.map(t => t.name).join(', ')}`);
```

### By Provider

```typescript
// Gmail tools
const gmailTools = m.listTools().filter(t => t.name.startsWith('gmail-'));
console.log(`Gmail tools: ${gmailTools.map(t => t.name).join(', ')}`);

// GitHub tools
const githubTools = m.listTools().filter(t => t.name.startsWith('github-'));
console.log(`GitHub tools: ${githubTools.map(t => t.name).join(', ')}`);
```

---

## Tool Metadata

Each tool has:

```typescript
const tool = m.getTool('calculator');

// Basic info
tool.name                    // 'calculator'
tool.description             // 'Perform basic math operations'
tool.version                 // '1.0.0'

// Parameters
tool.parameters              // { operation: {...}, a: {...}, b: {...} }
Object.keys(tool.parameters) // ['operation', 'a', 'b']

// Execution config
tool.execution.type          // 'command' | 'http'
tool.execution.command       // shell command (if type === 'command')
tool.execution.url           // API endpoint (if type === 'http')

// Authentication
tool.authentication?.type    // 'oauth2' | 'api_key' | etc.
tool.authentication?.provider // 'google' | 'github' | 'slack'

// Output
tool.output_schema           // { type: 'object', properties: {...} }

// Metadata
tool.tags                    // ['math', 'calculator']
tool.author                  // 'Matimo'
tool.license                 // 'MIT'
```

---

## Common Use Cases

### Find All Email Tools

```typescript
const emailTools = m.listTools()
  .filter(t => t.tags?.includes('email'));

emailTools.forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
});
```

### Find Tools Without Authentication

```typescript
const publicTools = m.listTools()
  .filter(t => !t.authentication);

console.log(`Public tools (no auth required):`);
publicTools.forEach(t => console.log(`  - ${t.name}`));
```

### Find Tools Requiring OAuth2

```typescript
const oauth2Tools = m.listTools()
  .filter(t => t.authentication?.type === 'oauth2');

console.log(`Tools requiring OAuth2:`);
oauth2Tools.forEach(t => {
  console.log(`  - ${t.name} (${t.authentication?.provider})`);
});
```

### List All Providers

```typescript
const providers = new Set(
  m.listTools()
    .filter(t => t.authentication?.provider)
    .map(t => t.authentication?.provider)
);

console.log(`Available providers: ${Array.from(providers).join(', ')}`);
```

---

## Next Steps

- **Execute Tools**: [Your First Tool](../getting-started/YOUR_FIRST_TOOL.md)
- **Learn Patterns**: [SDK Usage Patterns](./SDK_PATTERNS.md)
- **Setup OAuth2**: [Authentication Guide](./AUTHENTICATION.md)

