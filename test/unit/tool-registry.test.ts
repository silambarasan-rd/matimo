import { ToolRegistry } from '../../src/core/tool-registry';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe('register', () => {
    it('should register a tool', () => {
      const tool = {
        name: 'test-tool',
        version: '1.0.0',
        description: 'Test tool',
        parameters: {},
        execution: {
          type: 'command' as const,
          command: 'echo',
          args: ['test'],
        },
      };

      registry.register(tool);
      expect(registry.get('test-tool')).toBeDefined();
    });

    it('should throw error when registering duplicate tool', () => {
      const tool = {
        name: 'duplicate',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'command' as const,
          command: 'echo',
          args: ['test'],
        },
      };

      registry.register(tool);
      expect(() => registry.register(tool)).toThrow();
    });

    it('should store tool with all properties', () => {
      const tool = {
        name: 'full-tool',
        version: '1.0.0',
        description: 'Full test tool',
        parameters: {
          param1: {
            type: 'string' as const,
            description: 'Test parameter',
          },
        },
        execution: {
          type: 'command' as const,
          command: 'test',
          args: ['arg1'],
        },
        authentication: {
          type: 'api_key' as const,
          location: 'header' as const,
          name: 'Authorization',
        },
      };

      registry.register(tool);
      const retrieved = registry.get('full-tool');

      expect(retrieved?.name).toBe('full-tool');
      expect(retrieved?.version).toBe('1.0.0');
      expect(retrieved?.parameters).toEqual(tool.parameters);
      expect(retrieved?.authentication).toEqual(tool.authentication);
    });
  });

  describe('get', () => {
    it('should retrieve registered tool', () => {
      const tool = {
        name: 'get-test',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'command' as const,
          command: 'echo',
          args: [],
        },
      };

      registry.register(tool);
      const retrieved = registry.get('get-test');

      expect(retrieved).toBe(tool);
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.get('nonexistent');
      expect(tool).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const tool = {
        name: 'CaseTool',
        version: '1.0.0',
        description: 'Test',
        parameters: {},
        execution: {
          type: 'command' as const,
          command: 'echo',
          args: [],
        },
      };

      registry.register(tool);
      expect(registry.get('CaseTool')).toBeDefined();
      expect(registry.get('casetool')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return empty array for empty registry', () => {
      const tools = registry.getAll();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBe(0);
    });

    it('should return all registered tools', () => {
      const tool1 = {
        name: 'tool1',
        version: '1.0.0',
        description: 'First',
        parameters: {},
        execution: {
          type: 'command' as const,
          command: 'echo',
          args: [],
        },
      };

      const tool2 = {
        name: 'tool2',
        version: '1.0.0',
        description: 'Second',
        parameters: {},
        execution: {
          type: 'command' as const,
          command: 'echo',
          args: [],
        },
      };

      registry.register(tool1);
      registry.register(tool2);

      const tools = registry.getAll();
      expect(tools.length).toBe(2);
      expect(tools.map((t) => t.name)).toContain('tool1');
      expect(tools.map((t) => t.name)).toContain('tool2');
    });
  });

  describe('clear', () => {
    it('should remove all tools', () => {
      for (let i = 1; i <= 3; i++) {
        registry.register({
          name: `tool${i}`,
          version: '1.0.0',
          description: `Tool ${i}`,
          parameters: {},
          execution: {
            type: 'command' as const,
            command: 'echo',
            args: [],
          },
        });
      }

      expect(registry.getAll().length).toBe(3);

      registry.clear();
      expect(registry.getAll().length).toBe(0);
    });
  });

  describe('count', () => {
    it('should return correct count of tools', () => {
      expect(registry.count()).toBe(0);

      for (let i = 1; i <= 5; i++) {
        registry.register({
          name: `tool${i}`,
          version: '1.0.0',
          description: `Tool ${i}`,
          parameters: {},
          execution: {
            type: 'command' as const,
            command: 'echo',
            args: [],
          },
        });
      }

      expect(registry.count()).toBe(5);
    });
  });
});
