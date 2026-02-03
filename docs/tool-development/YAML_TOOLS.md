# YAML Tool Specification

Complete guide to writing Matimo tools in YAML format.

## Quick Reference

See the [detailed specification](./TOOL_SPECIFICATION.md) for complete documentation.

**Quick tool template:**

```yaml
name: my-tool
description: Brief description
version: '1.0.0'

parameters:
  param_name:
    type: string
    description: What this parameter does
    required: true

execution:
  type: command
  command: node script.js
  args: ['--param', '{param_name}']

output_schema:
  type: object
  properties:
    result:
      type: string
```

## Key Sections

| Section | Purpose |
|---------|---------|
| `name` | Unique tool identifier (kebab-case) |
| `description` | One-line description |
| `version` | Semantic version (e.g., 1.0.0) |
| `parameters` | Tool input parameters |
| `execution` | How the tool runs (command or HTTP) |
| `output_schema` | What the tool returns |
| `authentication` | OAuth2/API key config (optional) |
| `error_handling` | Retry policy (optional) |

## Full Specification

The complete YAML schema documentation is in [TOOL_SPECIFICATION.md](./TOOL_SPECIFICATION.md).

Topics covered:
- Metadata (name, description, version)
- Parameter types and constraints
- Execution modes (command, HTTP)
- Authentication configuration
- Output schema validation
- Error handling and retry policies
- Examples for each type

## Next Steps

- **Full Specification**: [TOOL_SPECIFICATION.md](./TOOL_SPECIFICATION.md)
- **Test Your Tool**: [Testing Guide](./TESTING.md)
- **Decorator Pattern**: [Decorator Guide](./DECORATOR_GUIDE.md)

