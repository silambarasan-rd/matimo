# Tool Development Guide — Table of Contents

Start here to build and contribute tools to Matimo.

---

## 🎯 Choose Your Path

### Path 1: Add a Simple Tool (30-60 mins)
👉 Start here if you want a quick first contribution

- [QUICK_START](../getting-started/QUICK_START.md) — 5-minute setup
- Step 1: Create `definition.yaml` in `packages/core/tools/{name}/`
- Step 2: Run `pnpm validate-tools`
- Step 3: Test locally
- Step 4: Submit PR

**Tools you can create:**
- `timestamp` — Get current time
- `uuid-generator` — Generate random ID  
- `hash` — Hash input (MD5, SHA256)
- `base64-encode` — Encode/decode base64

📖 See: [Your First Tool](../getting-started/YOUR_FIRST_TOOL.md)

---

### Path 2: Create a Provider Package (2-4 hours)
👉 If you want to build a complete tool provider (like @matimo/slack)

- Step 1: Create `packages/{provider}/` directory
- Step 2: Add `package.json` with dependencies
- Step 3: Create multiple tools in `packages/{provider}/tools/{tool}/`
- Step 4: Write tests and examples
- Step 5: Publish to npm as `@matimo/{provider}`
- Step 6: Submit PR to add to official registry

**Example providers:**
- `@matimo/weather` — OpenWeatherMap integration
- `@matimo/dictionary` — Dictionary/thesaurus lookup
- `@matimo/stripe` — Payment processing
- `@matimo/twilio` — SMS/Voice

📖 See: [Adding Tools to Matimo](./ADDING_TOOLS.md)

---

## 📋 Complete Step-by-Step

### 1. **Understand the Basics**
   - [Tool Specification](./TOOL_SPECIFICATION.md) — What is a tool definition?
   - [YAML Tools](./YAML_TOOLS.md) — How to write YAML tools
   - Examples in [packages/core/tools/](../../packages/core/tools/)

### 2. **Create Your Tool**
   - [Your First Tool](../getting-started/YOUR_FIRST_TOOL.md) — Step-by-step walkthrough
   - [TOOL_WORKFLOW.md](./TOOL_WORKFLOW.md) — Validation & testing steps
   - Write `definition.yaml` with parameters, execution config, output schema

### 3. **Test Locally**
   - [TESTING.md](./TESTING.md) — Write unit & integration tests
   - [TOOL_WORKFLOW.md](./TOOL_WORKFLOW.md#step-3-validate-syntax) — Validate YAML
   - Run `pnpm test && pnpm test:coverage`

### 4. **Add Examples**
   - Create usage example in `examples/tools/{provider}/`
   - Show how to execute your tool
   - Document required environment variables

### 5. **Submit PR**
   - Follow [TOOL_WORKFLOW.md](./TOOL_WORKFLOW.md#step-8-submit-pr) — PR template
   - Ensure all checks pass (linting, tests, coverage)
   - Respond to maintainer feedback

---

## 📚 Reference Documentation

| Document | Purpose | Read If... |
|----------|---------|-----------|
| [TOOL_SPECIFICATION.md](./TOOL_SPECIFICATION.md) | Complete YAML schema reference | You need all field options |
| [YAML_TOOLS.md](./YAML_TOOLS.md) | How to write tools in YAML | You're creating your first tool |
| [TESTING.md](./TESTING.md) | Testing patterns for tools | You're writing tests |
| [TOOL_WORKFLOW.md](./TOOL_WORKFLOW.md) | Step-by-step validation & submission | You're ready to submit |
| [ADDING_TOOLS.md](./ADDING_TOOLS.md) | Create npm provider packages | You're building @matimo/provider |
| [DECORATOR_GUIDE.md](./DECORATOR_GUIDE.md) | Class-based tool usage | You're using @tool() decorator |
| [PROVIDER_CONFIGURATION.md](./PROVIDER_CONFIGURATION.md) | Provider-level settings | You need OAuth2 or custom auth |
| [OAUTH_LINK.md](./OAUTH_LINK.md) | OAuth2 authentication setup | Your tool needs OAuth2 |

---

## 🚀 Quick Reference

### Create a Simple Tool (Command-Based)

```yaml
# packages/core/tools/my-tool/definition.yaml
name: my-tool
description: Does something useful
version: '1.0.0'

parameters:
  input:
    type: string
    required: true
    description: Input text

execution:
  type: command
  command: node
  args:
    - -e
    - 'console.log(JSON.stringify({ result: process.argv[1].toUpperCase() }))'
    - '{input}'

output_schema:
  type: object
  properties:
    result:
      type: string
  required: [result]
```

### Test It

```bash
pnpm validate-tools    # Check YAML syntax
pnpm test              # Run tests
pnpm test:coverage     # Check coverage
```

### Submit PR

```bash
git checkout -b feat/my-tool
git commit -m "feat(core): add my-tool"
git push origin feat/my-tool
```

---

## 🔗 Related Docs

### For Using Tools (Not Building)
- [SDK Usage Patterns](../user-guide/SDK_PATTERNS.md) — How to execute tools
- [API Reference](../api-reference/SDK.md) — Complete API documentation
- [Quick Start](../getting-started/QUICK_START.md) — Get up and running in 5 mins

### For Configuration
- [Environment Setup](../getting-started/ENVIRONMENT_SETUP.md) — Set up API keys
- [Architecture Overview](../architecture/OVERVIEW.md) — How Matimo works
- [OAuth Architecture](../architecture/OAUTH.md) — Advanced authentication

### For Contributing
- [Contributing Guidelines](../../CONTRIBUTING.md) — How to contribute
- [Good First Issues](https://github.com/tallclub/matimo/issues?q=label%3A%22good-first-issue%22) — Easy starter tasks

---

## ❓ FAQ

**Q: What's the difference between a tool and a provider?**
A: A **tool** is one YAML definition (e.g., `slack-send-message`). A **provider** is a package with multiple tools (e.g., `@matimo/slack` with 10+ tools).

**Q: How long does it take to create a tool?**
A: 30 minutes for a simple tool, 2+ hours for a full provider package with tests and examples.

**Q: Can I use my own tool locally without publishing?**
A: Yes! Put YAML in `packages/core/tools/` or `packages/my-provider/tools/` and run `pnpm build && pnpm test`.

**Q: Do I need to write code?**
A: Not always. Command and HTTP tools are pure YAML. You only need code if you want complex custom logic.

**Q: What's the easiest way to contribute?**
A: Start with documentation improvements or a simple tool. See [Good First Contributions](../../CONTRIBUTING.md#-good-first-contributions-start-here).

---

## 📖 Reading Order Recommendations

### For Complete Beginners
1. [QUICK_START](../getting-started/QUICK_START.md)
2. [Your First Tool](../getting-started/YOUR_FIRST_TOOL.md)
3. [YAML_TOOLS.md](./YAML_TOOLS.md)
4. [TOOL_WORKFLOW.md](./TOOL_WORKFLOW.md)

### For Intermediate Developers
1. [TOOL_SPECIFICATION.md](./TOOL_SPECIFICATION.md)
2. [TESTING.md](./TESTING.md)
3. [ADDING_TOOLS.md](./ADDING_TOOLS.md)
4. [PROVIDER_CONFIGURATION.md](./PROVIDER_CONFIGURATION.md)

### For Advanced / Custom Tools
1. [Architecture Overview](../architecture/OVERVIEW.md)
2. [OAuth Architecture](../architecture/OAUTH.md)
3. [SDK API Reference](../api-reference/SDK.md)

---

## 🎓 Learning Path

```
Getting Started (15 mins)
    ↓
Read QUICK_START + Your First Tool
    ↓
Create Your First Simple Tool (30 mins)
    ↓
Understand YAML Structure (20 mins)
    ↓
Write Tests (30 mins)
    ↓
Submit PR (10 mins)
    ↓
You're a Matimo Contributor! 🎉
```

**Total time: ~2-3 hours from "never heard of Matimo" to "first tool published"**

---

## 🆘 Getting Help

- **Questions?** → [GitHub Discussions](https://github.com/tallclub/matimo/discussions/new)
- **Found a bug?** → [Open an Issue](https://github.com/tallclub/matimo/issues/new)
- **Real-time chat?** → [Join Discord](https://discord.gg/3JPt4mxWDV)
- **Reading docs?** → [Search docs](https://tallclub.github.io/matimo/)

---

## ✅ Your Checklist

- [ ] Read this page (Table of Contents)
- [ ] Pick your path (simple tool vs provider package)
- [ ] Follow the step-by-step workflow
- [ ] Run `pnpm validate-tools`
- [ ] Run `pnpm test`
- [ ] Create PR with description
- [ ] Respond to feedback
- [ ] Celebrate! 🎉

