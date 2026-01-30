import { ToolDefinition } from '../../src/core/schema';
import { ToolLoader } from '../../src/core/tool-loader';
import { ToolRegistry } from '../../src/core/tool-registry';
import { CommandExecutor } from '../../src/executors/command-executor';
import * as path from 'path';

describe('Integration: Tool Loading and Execution', () => {
  let loader: ToolLoader;
  let registry: ToolRegistry;
  let commandExecutor: CommandExecutor;
  const fixturesDir = path.join(__dirname, '../fixtures/tools');

  beforeEach(() => {
    loader = new ToolLoader();
    registry = new ToolRegistry();
    commandExecutor = new CommandExecutor();
  });

  describe('Complete tool workflow', () => {
    it('should load, register, and execute a tool', async () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');

      // Step 1: Load tool from file
      const tool = loader.loadToolFromFile(toolPath);
      expect(tool).toBeDefined();
      expect(tool.name).toBe('calculator');

      // Step 2: Register tool
      registry.register(tool);
      expect(registry.get('calculator')).toBeDefined();

      // Step 3: Execute tool
      const result = (await commandExecutor.execute(tool, {
        operation: 'add',
        a: 5,
        b: 3,
      })) as Record<string, unknown>;

      expect(result).toBeDefined();
      expect(result.stdout).toBeDefined();
    });

    it('should load multiple tools and manage them in registry', async () => {
      const tools = loader.loadToolsFromDirectory(fixturesDir);

      tools.forEach((tool) => {
        registry.register(tool);
      });

      expect(registry.get('calculator')).toBeDefined();
    });
  });

  describe('Tool definition compliance', () => {
    it('loaded tool should have all required properties', async () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      expect(tool.name).toBeDefined();
      expect(typeof tool.name).toBe('string');

      expect(tool.version).toBeDefined();
      expect(typeof tool.version).toBe('string');

      expect(tool.description).toBeDefined();
      expect(typeof tool.description).toBe('string');

      expect(tool.parameters).toBeDefined();
      expect(typeof tool.parameters).toBe('object');

      expect(tool.execution).toBeDefined();
      expect(['command', 'http']).toContain(tool.execution?.type);
    });

    it('tool parameters should be properly validated', async () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      if (tool.parameters) {
        const paramValues = Object.values(tool.parameters);
        paramValues.forEach((param: unknown) => {
          expect(param).toHaveProperty('type');
          expect(['string', 'number', 'boolean', 'array', 'object']).toContain(
            (param as Record<string, unknown>).type
          );
        });
      }
    });
  });

  describe('Execution error handling', () => {
    it('should handle execution errors gracefully', async () => {
      const tool: ToolDefinition = {
        name: 'failing-command',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'command',
          command: 'nonexistent-command',
          args: [],
        },
      };

      registry.register(tool);
      const result = await commandExecutor.execute(tool, {});

      expect(result).toBeDefined();
      expect((result as Record<string, unknown>).error).toBeDefined();
    });
  });

  describe('Tool registry operations', () => {
    it('should retrieve tool and execute it', async () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      registry.register(tool);
      const registeredTool = registry.get('calculator');

      expect(registeredTool).toBe(tool);

      const result = (await commandExecutor.execute(registeredTool!, {
        operation: 'add',
        a: 10,
        b: 5,
      })) as Record<string, unknown>;

      expect(result).toBeDefined();
      expect(result.stdout).toBeDefined();
    });

    it('should list all registered tools', async () => {
      const tools = loader.loadToolsFromDirectory(fixturesDir);

      tools.forEach((tool) => {
        registry.register(tool);
      });

      const firstTool = registry.get('calculator');
      expect(firstTool).toBeDefined();

      tools.forEach((tool) => {
        const found = registry.get(tool.name);
        expect(found).toBeDefined();
      });
    });
  });

  describe('Tool execution with various parameters', () => {
    it('should execute tool with string parameters', async () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      const result = (await commandExecutor.execute(tool, {
        operation: 'add',
        a: 5,
        b: 3,
      })) as Record<string, unknown>;

      expect(result).toBeDefined();
      expect(result.stdout).toBeDefined();
    });

    it('should handle missing optional parameters', async () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      // Try executing with minimal parameters
      const result = await commandExecutor.execute(tool, {
        operation: 'add',
        a: 5,
        b: 3,
      });

      expect(result).toBeDefined();
    });
  });

  describe('Tool validation on load', () => {
    it('should validate tool schema on load', () => {
      const toolPath = path.join(fixturesDir, 'calculator/tool.yaml');
      const tool = loader.loadToolFromFile(toolPath);

      // Tool should be validated and loadable
      expect(tool).toBeDefined();

      // Verify it can be registered without errors
      expect(() => registry.register(tool)).not.toThrow();
    });
  });
});
