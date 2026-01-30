import { ToolDefinition } from '../core/schema';

/**
 * Interface for Matimo instance used by decorators
 * Accepts both real instances and mocks for testing
 */
interface MatimoInstance {
  registry: {
    get: (name: string) => ToolDefinition | undefined;
  };
  validator?: {
    validate: (
      tool: ToolDefinition,
      params: Record<string, unknown>
    ) => Promise<Record<string, unknown>>;
  };
  commandExecutor: {
    execute: (tool: ToolDefinition, params: Record<string, unknown>) => Promise<unknown>;
  };
  httpExecutor: {
    execute: (tool: ToolDefinition, params: Record<string, unknown>) => Promise<unknown>;
  };
}

/**
 * Global Matimo instance for decorator usage
 * Set via Matimo.setGlobalInstance() or new Matimo({ global: true })
 */
let globalMatimoInstance: MatimoInstance | null = null;

export function setGlobalMatimoInstance(instance: MatimoInstance | null) {
  globalMatimoInstance = instance;
}

export function getGlobalMatimoInstance(): MatimoInstance | null {
  return globalMatimoInstance;
}

/**
 * Tool decorator - transforms a method into a tool executor
 *
 * @param toolName - Name of the tool to execute (e.g., 'calculator', 'github-get-repo')
 *
 * @example
 * ```typescript
 * class MyAgent {
 *   @tool('calculator')
 *   async add(operation: string, a: number, b: number) {
 *     // Method body is ignored, tool is executed instead
 *   }
 *
 *   @tool('github-get-repo')
 *   async getRepo(owner: string, repo: string) {
 *     // Automatic validation and execution
 *   }
 * }
 *
 * const agent = new MyAgent();
 * const result = await agent.add('add', 5, 3);  // Executes calculator tool
 * ```
 */
export function tool(toolName: string) {
  return function (
    _target: unknown,
    _propertyKey: string | symbol | undefined,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    descriptor.value = async function (
      this: { matimo?: MatimoInstance } | unknown,
      ...args: unknown[]
    ): Promise<unknown> {
      // Get Matimo instance (either from instance or global)
      const matimoInstance =
        (this && typeof this === 'object' && 'matimo' in this
          ? (this as { matimo?: MatimoInstance }).matimo
          : undefined) || globalMatimoInstance;
      if (!matimoInstance) {
        throw new Error(
          `Matimo instance not found for tool decorator. ` +
            `Either pass matimo instance to class or set global instance via setGlobalMatimoInstance().`
        );
      }

      // Get tool definition
      const toolDef = matimoInstance.registry.get(toolName);
      if (!toolDef) {
        throw new Error(`Tool not found in registry: ${toolName}`);
      }

      // Convert positional arguments to parameters object using tool's parameter names
      const params = convertArgsToParams(args, toolDef);

      // Validate parameters against tool schema
      const validated = matimoInstance.validator
        ? await matimoInstance.validator.validate(toolDef, params)
        : params;

      // Select appropriate executor based on execution type
      const executor = getExecutorForTool(matimoInstance, toolDef);

      // Execute tool with validated parameters
      const result = await executor.execute(toolDef, validated);

      return result;
    };

    return descriptor;
  };
}

/**
 * Convert positional arguments to named parameters object
 * Maps function arguments to tool parameter names in order
 */
function convertArgsToParams(args: unknown[], toolDef: ToolDefinition): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (!toolDef.parameters) {
    return params;
  }

  const paramNames = Object.keys(toolDef.parameters);

  for (let i = 0; i < args.length && i < paramNames.length; i++) {
    params[paramNames[i]] = args[i];
  }

  return params;
}

/**
 * Select executor based on tool execution type
 */
function getExecutorForTool(
  matimo: MatimoInstance,
  toolDef: ToolDefinition
): MatimoInstance['commandExecutor'] | MatimoInstance['httpExecutor'] {
  const executionType = toolDef.execution?.type || 'command';

  if (executionType === 'http') {
    return matimo.httpExecutor;
  }

  return matimo.commandExecutor;
}
