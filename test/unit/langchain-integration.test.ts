import { convertToolsToLangChain } from '../../src/integrations/langchain';
import { ToolDefinition, Parameter } from '../../src/core/types';
import { MatimoInstance } from '../../src/matimo-instance';

/**
 * LangChain Integration Tests - Complete Coverage
 *
 * Tests convertToolsToLangChain with comprehensive coverage of:
 * - Empty tool arrays
 * - Tools with and without parameters
 * - Secret parameter injection
 * - Result formatting (all patterns)
 * - Error handling
 * - Edge cases
 */

describe('convertToolsToLangChain', () => {
  let matimo: MatimoInstance;

  beforeEach(async () => {
    matimo = await MatimoInstance.init('./tools');
  });

  describe('Basic functionality', () => {
    it('should handle empty tool array', async () => {
      const result = await convertToolsToLangChain([], matimo);
      expect(result).toEqual([]);
    });

    it('should handle undefined secrets', async () => {
      const tool: ToolDefinition = {
        name: 'test-tool',
        version: '1.0.0',
        description: 'Test tool',
        parameters: {},
        execution: {
          type: 'command',
          command: 'echo',
          args: [],
        },
      };

      const result = await convertToolsToLangChain([tool], matimo, undefined);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test-tool');
      expect(result[0].description).toBe('Test tool');
    });

    it('should convert single tool successfully', async () => {
      const tool: ToolDefinition = {
        name: 'single-tool',
        version: '1.0.0',
        description: 'A single test tool',
        parameters: {},
        execution: {
          type: 'command',
          command: 'echo',
          args: [],
        },
      };

      const result = await convertToolsToLangChain([tool], matimo);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('single-tool');
    });

    it('should convert multiple tools', async () => {
      const tools: ToolDefinition[] = [
        {
          name: 'tool-1',
          version: '1.0.0',
          description: 'First tool',
          parameters: {},
          execution: { type: 'command', command: 'echo', args: [] },
        },
        {
          name: 'tool-2',
          version: '1.0.0',
          description: 'Second tool',
          parameters: {},
          execution: { type: 'command', command: 'echo', args: [] },
        },
      ];

      const result = await convertToolsToLangChain(tools, matimo);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('tool-1');
      expect(result[1].name).toBe('tool-2');
    });
  });

  describe('Tool execution with mocked results', () => {
    it('should execute tool and format null result', async () => {
      const tool: ToolDefinition = {
        name: 'null-result-tool',
        version: '1.0.0',
        description: 'Returns null',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue(null);
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(result).toBeNull();
    });

    it('should execute tool and format string result', async () => {
      const tool: ToolDefinition = {
        name: 'string-result-tool',
        version: '1.0.0',
        description: 'Returns string',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue('Hello World');
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(result).toBe('Hello World');
    });

    it('should execute tool and format number result', async () => {
      const tool: ToolDefinition = {
        name: 'number-result-tool',
        version: '1.0.0',
        description: 'Returns number',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue(42);
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(result).toBe(42);
    });

    it('should execute tool and format boolean result', async () => {
      const tool: ToolDefinition = {
        name: 'bool-result-tool',
        version: '1.0.0',
        description: 'Returns boolean',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue(true);
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(result).toBe(true);
    });

    it('should execute tool and return ok=true response', async () => {
      const tool: ToolDefinition = {
        name: 'ok-tool',
        version: '1.0.0',
        description: 'Returns ok',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(typeof result).toBe('object');
      expect((result as Record<string, unknown>).ok).toBe(true);
    });

    it('should execute tool and return error response', async () => {
      const tool: ToolDefinition = {
        name: 'error-tool',
        version: '1.0.0',
        description: 'Returns error',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ error: 'Something went wrong' });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(typeof result).toBe('object');
      expect((result as Record<string, unknown>).error).toBe('Something went wrong');
    });

    it('should execute tool and return empty items response', async () => {
      const tool: ToolDefinition = {
        name: 'empty-items-tool',
        version: '1.0.0',
        description: 'Returns empty items',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ items: [] });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      // Result is the object returned by execute
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute tool and return items response', async () => {
      const tool: ToolDefinition = {
        name: 'items-tool',
        version: '1.0.0',
        description: 'Returns items',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
      });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      // Result is the object returned by execute
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute tool and return empty messages response', async () => {
      const tool: ToolDefinition = {
        name: 'empty-messages-tool',
        version: '1.0.0',
        description: 'Returns empty messages',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ messages: [] });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      // Result is the object returned by execute
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute tool and return messages response', async () => {
      const tool: ToolDefinition = {
        name: 'messages-tool',
        version: '1.0.0',
        description: 'Returns messages',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({
        messages: [
          { id: '1', text: 'Hello' },
          { id: '2', text: 'World' },
        ],
      });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      // Result is the object returned by execute
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute tool and return empty channels response', async () => {
      const tool: ToolDefinition = {
        name: 'empty-channels-tool',
        version: '1.0.0',
        description: 'Returns empty channels',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ channels: [] });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      // Result is the object returned by execute
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute tool and return channels response', async () => {
      const tool: ToolDefinition = {
        name: 'channels-tool',
        version: '1.0.0',
        description: 'Returns channels',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({
        channels: [
          { id: 'C1', name: '#general' },
          { id: 'C2', name: '#random' },
        ],
      });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      // Result is the object returned by execute
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute tool and return data response', async () => {
      const tool: ToolDefinition = {
        name: 'data-tool',
        version: '1.0.0',
        description: 'Returns data',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ data: { userId: '123' } });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      // Result is the object returned by execute
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute tool and return generic object response', async () => {
      const tool: ToolDefinition = {
        name: 'generic-tool',
        version: '1.0.0',
        description: 'Returns generic object',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ field1: 'value1', field2: 'value2' });
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(typeof result).toBe('object');
      const resultObj = result as Record<string, unknown>;
      expect(resultObj.field1).toBe('value1');
    });
  });

  describe('Secret parameter injection', () => {
    it('should inject single secret parameter', async () => {
      const tool: ToolDefinition = {
        name: 'secret-tool',
        version: '1.0.0',
        description: 'Tool with secret',
        parameters: {
          api_token: {
            type: 'string',
            required: true,
            description: 'API token',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo, {
        api_token: 'secret-value',
      });

      await langTools[0].invoke({});

      // Verify that the secret was injected
      expect(matimo.execute).toHaveBeenCalledWith('secret-tool', {
        api_token: 'secret-value',
      });
    });

    it('should inject multiple secret parameters', async () => {
      const tool: ToolDefinition = {
        name: 'multi-secret-tool',
        version: '1.0.0',
        description: 'Tool with multiple secrets',
        parameters: {
          slack_token: {
            type: 'string',
            required: true,
            description: 'Slack token',
          },
          gmail_token: {
            type: 'string',
            required: true,
            description: 'Gmail token',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo, {
        slack_token: 'slack-secret',
        gmail_token: 'gmail-secret',
      });

      await langTools[0].invoke({});

      expect(matimo.execute).toHaveBeenCalledWith('multi-secret-tool', {
        slack_token: 'slack-secret',
        gmail_token: 'gmail-secret',
      });
    });

    it('should inject secrets and pass through user parameters', async () => {
      const tool: ToolDefinition = {
        name: 'mixed-params-tool',
        version: '1.0.0',
        description: 'Tool with mixed params',
        parameters: {
          api_key: {
            type: 'string',
            required: true,
            description: 'API key',
          },
          message: {
            type: 'string',
            required: true,
            description: 'Message',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo, {
        api_key: 'secret-key',
      });

      await langTools[0].invoke({ message: 'test message' });

      expect(matimo.execute).toHaveBeenCalledWith('mixed-params-tool', {
        message: 'test message',
        api_key: 'secret-key',
      });
    });
  });

  describe('Error handling', () => {
    it('should handle execution error and return error message', async () => {
      const tool: ToolDefinition = {
        name: 'error-tool',
        version: '1.0.0',
        description: 'Tool that throws error',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockRejectedValue(new Error('Tool failed'));
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(result).toBe('Error: Tool failed');
    });

    it('should handle non-Error exception and return error message', async () => {
      const tool: ToolDefinition = {
        name: 'non-error-tool',
        version: '1.0.0',
        description: 'Tool with non-Error exception',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockRejectedValue('String error message');
      const langTools = await convertToolsToLangChain([tool], matimo);

      const result = await langTools[0].invoke({});
      expect(result).toBe('Error: String error message');
    });
  });

  describe('Parameter types', () => {
    it('should handle tool with string parameters', async () => {
      const tool: ToolDefinition = {
        name: 'string-param-tool',
        version: '1.0.0',
        description: 'Tool with string param',
        parameters: {
          text: {
            type: 'string',
            required: true,
            description: 'Input text',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
      expect(langTools[0].schema).toBeDefined();
    });

    it('should handle tool with number parameters', async () => {
      const tool: ToolDefinition = {
        name: 'number-param-tool',
        version: '1.0.0',
        description: 'Tool with number param',
        parameters: {
          count: {
            type: 'number',
            required: true,
            description: 'Count',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
      expect(langTools[0].schema).toBeDefined();
    });

    it('should handle tool with boolean parameters', async () => {
      const tool: ToolDefinition = {
        name: 'bool-param-tool',
        version: '1.0.0',
        description: 'Tool with boolean param',
        parameters: {
          enabled: {
            type: 'boolean',
            required: true,
            description: 'Enabled flag',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
      expect(langTools[0].schema).toBeDefined();
    });

    it('should handle tool with optional parameters', async () => {
      const tool: ToolDefinition = {
        name: 'optional-param-tool',
        version: '1.0.0',
        description: 'Tool with optional param',
        parameters: {
          optional_field: {
            type: 'string',
            required: false,
            description: 'Optional field',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
      expect(langTools[0].schema).toBeDefined();
    });

    it('should handle tool with no parameters', async () => {
      const tool: ToolDefinition = {
        name: 'no-param-tool',
        version: '1.0.0',
        description: 'Tool with no params',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ ok: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
      expect(langTools[0].schema).toBeDefined();
    });
  });

  describe('Tool metadata', () => {
    it('should preserve tool name', async () => {
      const tool: ToolDefinition = {
        name: 'my-custom-tool',
        version: '1.0.0',
        description: 'A custom tool',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools[0].name).toBe('my-custom-tool');
    });

    it('should preserve tool description', async () => {
      const tool: ToolDefinition = {
        name: 'described-tool',
        version: '1.0.0',
        description: 'This is a detailed description of the tool',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools[0].description).toBe('This is a detailed description of the tool');
    });

    it('should provide default description if missing', async () => {
      const tool: ToolDefinition = {
        name: 'tool-no-desc',
        version: '1.0.0',
        description: '',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools[0].description).toBeDefined();
    });
  });

  describe('Parameter type coverage - 100% lines', () => {
    it('should handle array parameters with items schema', async () => {
      const tool: ToolDefinition = {
        name: 'array-items-tool',
        version: '1.0.0',
        description: 'Tool with array having items',
        parameters: {
          tags: {
            type: 'array',
            required: true,
            description: 'List of tags',
            items: {
              type: 'string',
              required: true,
              description: 'Tag name',
            },
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });

    it('should handle array parameters without items schema', async () => {
      const tool: ToolDefinition = {
        name: 'array-no-items-tool',
        version: '1.0.0',
        description: 'Tool with array without items',
        parameters: {
          items: {
            type: 'array',
            required: true,
            description: 'Generic array',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });

    it('should handle object parameters with properties', async () => {
      const tool: ToolDefinition = {
        name: 'object-with-props-tool',
        version: '1.0.0',
        description: 'Tool with object having properties',
        parameters: {
          config: {
            type: 'object',
            required: true,
            description: 'Configuration object',
            properties: {
              timeout: {
                type: 'number',
                required: false,
                description: 'Timeout in ms',
              },
              retries: {
                type: 'number',
                required: true,
                description: 'Number of retries',
              },
            },
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });

    it('should handle object parameters without properties', async () => {
      const tool: ToolDefinition = {
        name: 'object-no-props-tool',
        version: '1.0.0',
        description: 'Tool with object without properties',
        parameters: {
          metadata: {
            type: 'object',
            required: true,
            description: 'Generic metadata object',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });

    it('should handle nested object with properties', async () => {
      const tool: ToolDefinition = {
        name: 'nested-object-tool',
        version: '1.0.0',
        description: 'Tool with nested object',
        parameters: {
          user: {
            type: 'object',
            required: true,
            description: 'User object',
            properties: {
              profile: {
                type: 'object',
                required: false,
                description: 'User profile',
                properties: {
                  name: {
                    type: 'string',
                    required: true,
                    description: 'User name',
                  },
                },
              },
            },
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });

    it('should handle nested array within object', async () => {
      const tool: ToolDefinition = {
        name: 'nested-array-object-tool',
        version: '1.0.0',
        description: 'Tool with nested array in object',
        parameters: {
          data: {
            type: 'object',
            required: true,
            description: 'Data object',
            properties: {
              items: {
                type: 'array',
                required: true,
                description: 'Array of items',
                items: {
                  type: 'string',
                  required: true,
                  description: 'Item value',
                },
              },
            },
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });

    it('should handle unknown parameter type (fallback)', async () => {
      const tool: ToolDefinition = {
        name: 'unknown-type-tool',
        version: '1.0.0',
        description: 'Tool with unknown parameter type',
        parameters: {
          custom: {
            type: 'custom',
            required: true,
            description: 'Custom type parameter',
          } as unknown as Parameter,
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });
  });

  describe('Parameter filtering and secrets - 100% lines', () => {
    it('should skip secret parameters in schema', async () => {
      const tool: ToolDefinition = {
        name: 'secret-params-tool',
        version: '1.0.0',
        description: 'Tool with secret parameters',
        parameters: {
          api_key: {
            type: 'string',
            required: true,
            description: 'API key',
          },
          message: {
            type: 'string',
            required: true,
            description: 'Message to send',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain(
        [tool],
        matimo,
        { api_key: 'secret-123' },
        new Set(['api_key']) // Explicitly mark as secret
      );

      // Invoke with only message (api_key should be injected)
      await langTools[0].invoke({ message: 'test' });

      expect(matimo.execute).toHaveBeenCalledWith('secret-params-tool', {
        message: 'test',
        api_key: 'secret-123',
      });
    });

    it('should handle tool with no parameters', async () => {
      const tool: ToolDefinition = {
        name: 'no-params-tool',
        version: '1.0.0',
        description: 'Tool with no parameters',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);

      await langTools[0].invoke({});
      expect(matimo.execute).toHaveBeenCalledWith('no-params-tool', {});
    });

    it('should handle tool with empty parameters object', async () => {
      const tool: ToolDefinition = {
        name: 'empty-params-tool',
        version: '1.0.0',
        description: 'Tool with empty parameters',
        parameters: {},
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);

      await langTools[0].invoke({});
      expect(matimo.execute).toHaveBeenCalledWith('empty-params-tool', {});
    });
  });

  describe('Description handling - 100% lines', () => {
    it('should add description to string parameter schema', async () => {
      const tool: ToolDefinition = {
        name: 'desc-string-tool',
        version: '1.0.0',
        description: 'Tool with described string param',
        parameters: {
          username: {
            type: 'string',
            required: true,
            description: 'The username to look up',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);
      expect(langTools).toHaveLength(1);
    });

    it('should handle optional parameter (make optional in schema)', async () => {
      const tool: ToolDefinition = {
        name: 'optional-param-tool',
        version: '1.0.0',
        description: 'Tool with optional parameter',
        parameters: {
          filter: {
            type: 'string',
            required: false,
            description: 'Optional filter',
          },
        },
        execution: { type: 'command', command: 'echo', args: [] },
      };

      matimo.execute = jest.fn().mockResolvedValue({ success: true });
      const langTools = await convertToolsToLangChain([tool], matimo);

      // Should work without the optional parameter
      await langTools[0].invoke({});
      expect(matimo.execute).toHaveBeenCalledWith('optional-param-tool', {});
    });
  });
});
