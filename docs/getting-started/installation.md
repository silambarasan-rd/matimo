# Installation & Setup

## Requirements

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.15.0 or higher (preferred package manager)
- **Git**: For cloning the repository

## Installation Options

### Option 1: From npm (Recommended for Users)

```bash
# Install the complete SDK (includes core + all tools)
npm install matimo
# or with pnpm (recommended)
pnpm add matimo

# OR install individual packages:
pnpm add @matimo/core    # Core SDK only
pnpm add @matimo/slack   # Slack tools
pnpm add @matimo/gmail   # Gmail tools
pnpm add @matimo/cli     # CLI tool management
```

**Note**: v0.1.0-alpha.10 is available on npm. Stable v0.1.0 release coming in March 2026, with v1.0.0 planned for Q4 2026.

### Option 2: From Source (Recommended for Contributors)

```bash
# Clone the repository
git clone https://github.com/tallclub/matimo.git
cd matimo

# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Run tests to verify installation
pnpm test
```

## Verify Installation

```typescript
// test-install.ts - Both imports work:
import { MatimoInstance } from 'matimo'; // From root package
// OR
import { MatimoInstance } from '@matimo/core'; // From core package directly

const matimo = await MatimoInstance.init('./tools');
console.log(`✅ Matimo installed successfully`);
console.log(`📦 Loaded ${matimo.listTools().length} tools`);
```

Run it:

```bash
npx tsx test-install.ts
```

## Next Steps

- **New Users**: Go to [Quick Start](./QUICK_START.md)
- **Want Examples**: See [examples/](../../examples/)
- **Building Tools**: Read [Tool Specification](../tool-development/YAML_TOOLS.md)
- **Using Decorators**: Check [Decorator Guide](../tool-development/DECORATOR_GUIDE.md)

## Troubleshooting Installation

### Node.js Version Error

```bash
node --version  # Should be v18.0.0 or higher
```

If lower, install Node.js 18+ from [nodejs.org](https://nodejs.org/)

### pnpm Installation

```bash
npm install -g pnpm@8.15.0
pnpm --version  # Should be 8.15.0 or higher
```

### Build Errors

```bash
# Clear and rebuild
pnpm clean
pnpm install
pnpm build
```

If issues persist, check [Troubleshooting Guide](../troubleshooting/FAQ.md)

## System Requirements

| Component  | Requirement                |
| ---------- | -------------------------- |
| Node.js    | ≥ 18.0.0                   |
| pnpm       | ≥ 8.15.0                   |
| TypeScript | ≥ 5.0 (included)           |
| Disk Space | ~500MB (with node_modules) |
| Memory     | ≥ 512MB for build          |

## IDE Setup

### VS Code (Recommended)

```bash
# Extensions to install
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (for testing HTTP tools)
```

### WebStorm / IntelliJ

Works out of the box with TypeScript support.

## Environment Variables

### Security Settings

**Embedded Code Execution** (Disabled by Default)

Embedded code in tool YAML is **disabled by default** for security. To enable it:

```bash
# Explicitly opt-in to embedded code execution
# embeddedCodeDisabled = (MATIMO_ALLOW_EMBEDDED_CODE !== 'true')
# If NOT set to 'true' → code is disabled
export MATIMO_ALLOW_EMBEDDED_CODE=true
```

⚠️ **Only enable if you fully trust all tool YAML sources. Never enable in production without careful review.**

See [Security Guide](../user-guide/SECURITY.md) for more details.

## Quick Verification Checklist

- [ ] Node.js v18+ installed
- [ ] pnpm v8.15+ installed
- [ ] Repository cloned
- [ ] `pnpm install` completed
- [ ] `pnpm build` successful
- [ ] `pnpm test` all passing
- [ ] Ready to start! 🚀
