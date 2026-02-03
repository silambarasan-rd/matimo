# Decorator Guide — Using @tool Decorators

Use TypeScript decorators to define tools directly in code instead of YAML.

## Overview

The `@tool` decorator provides a way to define Matimo tools using TypeScript decorators. This is useful when:

- You want to keep tool logic and definitions together
- You prefer type-safe tool definitions
- You're building tools that reference existing TypeScript functions

---

## Basic Usage

### Simple Tool

```typescript
import { tool, param } from 'matimo/decorators';

@tool({
  name: 'greet',
  description: 'Greet a person'
})
export class GreetTool {
  @param({
    type: 'string',
    description: 'Person to greet',
    required: true
  })
  name: string;

  execute(): string {
    return `Hello, ${this.name}!`;
  }
}
```

Use with Matimo:

```typescript
import { MatimoFactory } from 'matimo';
import { GreetTool } from './tools/greet.tool';

const matimo = MatimoFactory.create({
  toolClasses: [GreetTool]
});

const result = await matimo.executeTool('greet', {
  name: 'Alice'
});

console.log(result); // "Hello, Alice!"
```

---

## Decorator Options

### @tool

Define a tool class.

```typescript
@tool({
  name: string;              // Tool identifier (required)
  description: string;       // What the tool does (required)
  version?: string;          // Semantic version (default: "1.0.0")
  returnType?: 'object' | 'string' | 'number' | 'boolean' | 'array';
})
class MyTool {
  // ...
}
```

### @param

Define a parameter.

```typescript
@param({
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';  // (required)
  description: string;       // What the parameter does (required)
  required?: boolean;        // Is it mandatory? (default: false)
  default?: unknown;         // Default value
  enum?: unknown[];          // Allowed values
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
})
property: PropertyType;
```

---

## Examples

### Calculator Tool

```typescript
import { tool, param } from 'matimo/decorators';

@tool({
  name: 'calculator',
  description: 'Perform basic math operations'
})
export class CalculatorTool {
  @param({
    type: 'string',
    description: 'Math operation',
    required: true,
    enum: ['add', 'subtract', 'multiply', 'divide']
  })
  operation: string;

  @param({
    type: 'number',
    description: 'First operand',
    required: true
  })
  a: number;

  @param({
    type: 'number',
    description: 'Second operand',
    required: true
  })
  b: number;

  execute(): { result: number } {
    switch (this.operation) {
      case 'add':
        return { result: this.a + this.b };
      case 'subtract':
        return { result: this.a - this.b };
      case 'multiply':
        return { result: this.a * this.b };
      case 'divide':
        if (this.b === 0) throw new Error('Division by zero');
        return { result: this.a / this.b };
      default:
        throw new Error('Unknown operation');
    }
  }
}
```

Usage:

```typescript
const result = await matimo.executeTool('calculator', {
  operation: 'add',
  a: 10,
  b: 5
});

console.log(result); // { result: 15 }
```

### Async Tool with HTTP Request

```typescript
import { tool, param } from 'matimo/decorators';
import fetch from 'node-fetch';

@tool({
  name: 'fetch-user',
  description: 'Fetch user information from an API'
})
export class FetchUserTool {
  @param({
    type: 'string',
    description: 'User ID',
    required: true,
    validation: {
      pattern: '^[0-9]+$'
    }
  })
  userId: string;

  async execute(): Promise<{
    id: number;
    name: string;
    email: string;
  }> {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${this.userId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### Tool with Validation

```typescript
import { tool, param } from 'matimo/decorators';

@tool({
  name: 'email-validator',
  description: 'Validate email format'
})
export class EmailValidatorTool {
  @param({
    type: 'string',
    description: 'Email address to validate',
    required: true,
    validation: {
      pattern: '^[^@]+@[^@]+\\.[^@]+$'
    }
  })
  email: string;

  execute(): { valid: boolean; message: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(this.email);

    return {
      valid,
      message: valid ? 'Valid email' : 'Invalid email format'
    };
  }
}
```

### Tool with Complex Parameters

```typescript
import { tool, param } from 'matimo/decorators';

@tool({
  name: 'user-create',
  description: 'Create a new user'
})
export class UserCreateTool {
  @param({
    type: 'string',
    description: 'User name',
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50
    }
  })
  name: string;

  @param({
    type: 'string',
    description: 'User email',
    required: true,
    validation: {
      pattern: '^[^@]+@[^@]+\\.[^@]+$'
    }
  })
  email: string;

  @param({
    type: 'number',
    description: 'User age',
    required: false,
    validation: {
      min: 13,
      max: 120
    }
  })
  age?: number;

  @param({
    type: 'array',
    description: 'User roles',
    required: false,
    default: ['user']
  })
  roles?: string[];

  execute(): {
    id: string;
    name: string;
    email: string;
    age?: number;
    roles: string[];
  } {
    return {
      id: `user_${Date.now()}`,
      name: this.name,
      email: this.email,
      age: this.age,
      roles: this.roles || ['user']
    };
  }
}
```

---

## Advanced Features

### Error Handling

```typescript
import { tool, param } from 'matimo/decorators';
import { MatimoError, ErrorCode } from 'matimo';

@tool({
  name: 'divide',
  description: 'Divide two numbers'
})
export class DivideTool {
  @param({
    type: 'number',
    description: 'Dividend',
    required: true
  })
  dividend: number;

  @param({
    type: 'number',
    description: 'Divisor',
    required: true
  })
  divisor: number;

  execute(): { result: number } {
    if (this.divisor === 0) {
      throw new MatimoError(
        'Division by zero not allowed',
        ErrorCode.VALIDATION_FAILED,
        { dividend: this.dividend, divisor: this.divisor }
      );
    }

    return { result: this.dividend / this.divisor };
  }
}
```

### Type-Safe Results

```typescript
interface CalculationResult {
  result: number;
  timestamp: string;
  operation: string;
}

@tool({
  name: 'typed-calculator',
  description: 'Type-safe calculator'
})
export class TypedCalculatorTool {
  @param({
    type: 'string',
    description: 'Operation',
    required: true,
    enum: ['add', 'subtract']
  })
  operation: string;

  @param({
    type: 'number',
    description: 'First number',
    required: true
  })
  a: number;

  @param({
    type: 'number',
    description: 'Second number',
    required: true
  })
  b: number;

  execute(): CalculationResult {
    let result: number;

    if (this.operation === 'add') {
      result = this.a + this.b;
    } else {
      result = this.a - this.b;
    }

    return {
      result,
      timestamp: new Date().toISOString(),
      operation: this.operation
    };
  }
}
```

### Dependency Injection

```typescript
import { tool, param } from 'matimo/decorators';

// Service to inject
class LoggerService {
  log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

@tool({
  name: 'logged-operation',
  description: 'Operation with logging'
})
export class LoggedOperationTool {
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  @param({
    type: 'string',
    description: 'Operation name',
    required: true
  })
  operation: string;

  execute(): { success: boolean; message: string } {
    this.logger.log(`Starting operation: ${this.operation}`);
    // ... perform operation ...
    this.logger.log(`Completed operation: ${this.operation}`);

    return {
      success: true,
      message: `Operation '${this.operation}' completed`
    };
  }
}
```

---

## Decorator vs YAML Comparison

### When to Use Decorators

✅ **Decorators are best for:**
- Complex business logic
- Type-safe definitions
- Reusing existing TypeScript code
- Tools with dependencies
- Dynamic behavior

### When to Use YAML

✅ **YAML is best for:**
- Simple command/HTTP tools
- Configuration-driven tools
- Non-technical tool definitions
- Sharing tools without code
- External API wrappers

### Example: Decorator vs YAML

**Same tool, two approaches:**

**Decorator:**
```typescript
@tool({
  name: 'fetch-issue',
  description: 'Fetch GitHub issue by number'
})
export class FetchIssueTool {
  @param({
    type: 'string',
    description: 'Repository (owner/repo)',
    required: true
  })
  repo: string;

  @param({
    type: 'number',
    description: 'Issue number',
    required: true
  })
  number: number;

  async execute() {
    const [owner, repoName] = this.repo.split('/');
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/issues/${this.number}`,
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
    );
    return await response.json();
  }
}
```

**YAML:**
```yaml
name: fetch-issue
description: Fetch GitHub issue by number
version: "1.0.0"

parameters:
  repo:
    type: string
    description: Repository (owner/repo)
    required: true
  number:
    type: number
    description: Issue number
    required: true

execution:
  type: http
  method: GET
  url: "https://api.github.com/repos/{repo}/issues/{number}"
  auth:
    type: bearer
    secret_env_var: MATIMO_GITHUB_TOKEN
```

---

## Best Practices

1. **Naming** — Tool names should be descriptive and kebab-case
2. **Validation** — Use validation rules to catch errors early
3. **Error Handling** — Return structured errors with context
4. **Async Support** — Use `async execute()` for I/O operations
5. **Type Safety** — Define proper return types
6. **Documentation** — Add JSDoc comments to tools
7. **Testing** — Unit test tool logic independently

---

## Testing Decorator Tools

```typescript
import { CalculatorTool } from './calculator.tool';

describe('CalculatorTool', () => {
  let tool: CalculatorTool;

  beforeEach(() => {
    tool = new CalculatorTool();
  });

  it('should add two numbers', () => {
    tool.operation = 'add';
    tool.a = 5;
    tool.b = 3;

    const result = tool.execute();

    expect(result.result).toBe(8);
  });

  it('should subtract two numbers', () => {
    tool.operation = 'subtract';
    tool.a = 10;
    tool.b = 3;

    const result = tool.execute();

    expect(result.result).toBe(7);
  });

  it('should throw on division by zero', () => {
    tool.operation = 'divide';
    tool.a = 10;
    tool.b = 0;

    expect(() => tool.execute()).toThrow('Division by zero');
  });
});
```

---

## Migration from YAML

Convert existing YAML tools to decorators:

**Before (YAML):**
```yaml
name: echo
description: Echo input back
version: "1.0.0"

parameters:
  message:
    type: string
    required: true

execution:
  type: command
  command: echo
  args: ["{message}"]
```

**After (Decorator):**
```typescript
@tool({
  name: 'echo',
  description: 'Echo input back'
})
export class EchoTool {
  @param({
    type: 'string',
    description: 'Message to echo',
    required: true
  })
  message: string;

  execute(): { output: string } {
    return { output: this.message };
  }
}
```

---

## See Also

- [Quick Start](../getting-started/QUICK_START.md) — Get started in 5 minutes
- [API Reference](../api-reference/SDK.md) — Complete SDK documentation
- [Tool Specification](./TOOL_SPECIFICATION.md) — YAML tool schema
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Development guide
