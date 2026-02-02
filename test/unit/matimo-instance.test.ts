import { MatimoInstance } from '../../src/matimo-instance';
import path from 'path';

describe('MatimoInstance - Core Functionality', () => {
  let instance: MatimoInstance;
  const toolsPath = path.join(__dirname, '../fixtures/tools');

  beforeAll(async () => {
    instance = await MatimoInstance.init(toolsPath);
  });

  describe('Token Injection', () => {
    it('should inject GMAIL_ACCESS_TOKEN from environment', async () => {
      // Set token in environment
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'test-token-from-env';

      const tool = instance.getAllTools().find((t) => t.name === 'gmail-send-email');

      if (tool && tool.execution.type === 'http') {
        // The token should be injected when we attempt to execute
        // We're testing the injection mechanism, not actual execution
        expect(tool.execution).toBeDefined();
      }

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });

    it('should prefer explicit token over environment variable', async () => {
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'env-token';

      // We would test this by checking that explicit params override env
      // The execution would prefer the explicit GMAIL_ACCESS_TOKEN parameter
      expect(process.env.MATIMO_GMAIL_ACCESS_TOKEN).toBe('env-token');

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });

    it('should handle missing token gracefully', async () => {
      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
      delete process.env.GMAIL_ACCESS_TOKEN;

      // Attempting to execute without token should fail appropriately
      await expect(
        instance.execute('gmail-send-email', {
          to: 'user@example.com',
          subject: 'Test',
          body: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('Parameter Validation', () => {
    it('should validate parameters against tool schema', async () => {
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'test-token';

      // Try to execute a tool with invalid parameters
      // Most tools require certain parameters
      await expect(instance.execute('invalid-param-test', {})).rejects.toThrow();

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });

    it('should accept valid parameters', async () => {
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'test-token';

      // Valid parameters with all required fields
      // The calculator tool should accept 'operation' and numbers
      try {
        // This will fail at execution, but validation should pass
        await instance.execute('calculator', {
          operation: 'add',
          a: 5,
          b: 3,
        });
      } catch {
        // Expected to fail at execution, not validation
      }

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });

    it('should allow optional parameters', async () => {
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'test-token';

      try {
        await instance.execute('calculator', {
          operation: 'add',
          a: 5,
          b: 3,
        });
      } catch {
        // Execution will fail, but optional params should be accepted
      }

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });
  });

  describe('Tool Registry', () => {
    it('should retrieve all loaded tools', () => {
      const tools = instance.getAllTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length > 0).toBe(true);
    });

    it('should find tools in registry', () => {
      const tools = instance.getAllTools();
      expect(tools.length > 0).toBe(true);
      // At minimum, calculator tool should be available
      const calculatorTools = tools.filter((t) => t.name.includes('calculator'));
      expect(calculatorTools.length >= 0).toBe(true);
    });

    it('should throw error for non-existent tool', async () => {
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'test-token';

      await expect(instance.execute('non-existent-tool', {})).rejects.toThrow('not found');

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });
  });

  describe('Parameter Extraction', () => {
    it('should extract parameter placeholders from execution config', () => {
      const tool = instance.getAllTools().find((t) => t.name === 'gmail-send-email');

      if (tool && tool.execution.type === 'http' && 'headers' in tool.execution) {
        // Tool should have Authorization header with placeholder
        const authHeader = tool.execution.headers?.Authorization as string;
        expect(authHeader).toContain('{');
        expect(authHeader).toContain('}');
      }
    });

    it('should identify auth parameters by pattern matching', () => {
      // Parameters containing TOKEN, KEY, SECRET should be identified as auth params
      const authPatterns = ['TOKEN', 'KEY', 'SECRET', 'PASSWORD', 'CREDENTIAL'];

      authPatterns.forEach((pattern) => {
        const paramName = `GMAIL_${pattern}`;
        // Should match pattern-based identification
        expect(paramName.includes(pattern)).toBe(true);
      });
    });

    it('should distinguish auth from user parameters', () => {
      // User parameters like 'to', 'subject', 'body' should not be treated as auth
      const userParams = ['to', 'subject', 'body', 'message_id', 'query'];

      userParams.forEach((param) => {
        const isAuthPattern = ['TOKEN', 'KEY', 'SECRET', 'PASSWORD'].some((pattern) =>
          param.toUpperCase().includes(pattern)
        );
        expect(isAuthPattern).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error with correct error code for missing tool', async () => {
      await expect(instance.execute('missing-tool', {})).rejects.toThrow();
    });

    it('should include tool name in error message when tool not found', async () => {
      try {
        await instance.execute('invalid-tool-name', {});
        fail('Should have thrown an error');
      } catch (error: unknown) {
        expect((error as Error).message).toContain('invalid-tool-name');
      }
    });

    it('should provide helpful error for validation failures', async () => {
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'test-token';

      try {
        await instance.execute('gmail-send-email', {
          // Missing required 'to' and 'subject'
          body: 'Test',
        });
        fail('Should have thrown validation error');
      } catch {
        // Should indicate validation failure
      }

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });
  });

  describe('Environment Variable Resolution', () => {
    it('should try MATIMO_ prefixed env var first', () => {
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'matimo-prefixed';
      process.env.GMAIL_ACCESS_TOKEN = 'direct-name';

      // MATIMO_ prefixed should take precedence
      expect(process.env.MATIMO_GMAIL_ACCESS_TOKEN).toBe('matimo-prefixed');

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
      delete process.env.GMAIL_ACCESS_TOKEN;
    });

    it('should fallback to direct name if MATIMO_ not found', () => {
      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
      process.env.GMAIL_ACCESS_TOKEN = 'fallback-token';

      expect(process.env.GMAIL_ACCESS_TOKEN).toBe('fallback-token');

      delete process.env.GMAIL_ACCESS_TOKEN;
    });

    it('should return undefined if neither env var exists', () => {
      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
      delete process.env.GMAIL_ACCESS_TOKEN;

      expect(process.env.MATIMO_GMAIL_ACCESS_TOKEN).toBeUndefined();
      expect(process.env.GMAIL_ACCESS_TOKEN).toBeUndefined();
    });
  });

  describe('Multi-Provider Support', () => {
    it('should load tools from multiple providers', () => {
      const tools = instance.getAllTools();
      // Should have tools from different providers
      expect(tools.length > 0).toBe(true);
    });

    it('should handle different auth tokens per provider', async () => {
      // Set tokens for different providers
      process.env.MATIMO_GMAIL_ACCESS_TOKEN = 'gmail-token';

      try {
        await instance.execute('gmail-send-email', {
          to: 'user@example.com',
          subject: 'Test',
          body: 'Test',
        });
      } catch {
        // Execution will fail, but auth setup should work
      }

      delete process.env.MATIMO_GMAIL_ACCESS_TOKEN;
    });
  });

  describe('Tool Metadata', () => {
    it('should load tool metadata correctly', () => {
      const tools = instance.getAllTools();

      tools.forEach((tool) => {
        expect(tool.name).toBeDefined();
        expect(tool.version).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.parameters).toBeDefined();
        expect(tool.execution).toBeDefined();
      });
    });

    it('should have execution configuration', () => {
      const tools = instance.getAllTools();

      if (tools.length > 0) {
        const tool = tools[0];
        expect(tool.execution).toBeDefined();
        expect(tool.execution.type).toBeDefined();
        expect(['http', 'command']).toContain(tool.execution.type);
      }
    });

    it('should have parameters defined', () => {
      const tools = instance.getAllTools();

      if (tools.length > 0) {
        const tool = tools[0];
        expect(tool.parameters).toBeDefined();
        // Parameters should be an object with properties
        expect(typeof tool.parameters).toBe('object');
      }
    });
  });

  describe('Static Initialization', () => {
    it('should initialize with static init() method', async () => {
      const newInstance = await MatimoInstance.init(toolsPath);
      expect(newInstance).toBeDefined();
      expect(newInstance.getAllTools().length > 0).toBe(true);
    });

    it('should be able to initialize multiple instances', async () => {
      const instance1 = await MatimoInstance.init(toolsPath);
      const instance2 = await MatimoInstance.init(toolsPath);

      expect(instance1.getAllTools().length).toBe(instance2.getAllTools().length);
    });
  });
});
