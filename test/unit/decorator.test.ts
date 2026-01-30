import { tool, setGlobalMatimoInstance } from '../../src/decorators/tool-decorator';
import { ToolDefinition } from '../../src/core/schema';

describe('Tool Decorator', () => {
  let mockMatimo: {
    registry: { get: jest.Mock };
    validator?: { validate: jest.Mock };
    commandExecutor: { execute: jest.Mock };
    httpExecutor: { execute: jest.Mock };
  };

  beforeEach(() => {
    // Mock Matimo instance
    mockMatimo = {
      registry: {
        get: jest.fn(
          (name: string): ToolDefinition => ({
            name,
            version: '1.0.0',
            description: 'Test tool',
            parameters: {
              operation: { type: 'string', description: 'Operation' },
              a: { type: 'number', description: 'First number' },
              b: { type: 'number', description: 'Second number' },
            },
            execution: { type: 'command', command: 'calc' },
          })
        ),
      },
      validator: {
        validate: jest.fn((_tool: ToolDefinition, params: Record<string, unknown>) =>
          Promise.resolve(params)
        ),
      },
      commandExecutor: {
        execute: jest.fn((_tool: ToolDefinition, params: Record<string, unknown>) =>
          Promise.resolve({ result: (params.a as number) + (params.b as number) })
        ),
      },
      httpExecutor: {
        execute: jest.fn(),
      },
    };

    setGlobalMatimoInstance(mockMatimo);
  });

  it('should execute tool via decorator', async () => {
    class TestAgent {
      @tool('calculator')
      async calculate(_operation: string, _a: number, _b: number) {
        // This body should be ignored
      }
    }

    const agent = new TestAgent();
    const result = await agent.calculate('add', 5, 3);

    expect(mockMatimo.registry.get).toHaveBeenCalledWith('calculator');
    expect(mockMatimo.validator?.validate).toHaveBeenCalled();
    expect(mockMatimo.commandExecutor.execute).toHaveBeenCalled();
    expect(result).toEqual({ result: 8 });
  });

  it('should convert positional arguments to parameters', async () => {
    class TestAgent {
      @tool('calculator')
      async calculate(_operation: string, _a: number, _b: number) {
        // Arguments: 'add', 5, 3
      }
    }

    const agent = new TestAgent();
    await agent.calculate('add', 5, 3);

    const callArgs = mockMatimo.commandExecutor.execute.mock.calls[0] as unknown[];
    const params = callArgs[1];

    expect(params).toEqual({
      operation: 'add',
      a: 5,
      b: 3,
    });
  });

  it('should validate parameters before execution', async () => {
    class TestAgent {
      @tool('calculator')
      async calculate(_operation: string, _a: number, _b: number) {
        //
      }
    }

    const agent = new TestAgent();
    await agent.calculate('multiply', 10, 20);

    expect(mockMatimo.validator!.validate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'calculator' }),
      expect.objectContaining({ operation: 'multiply', a: 10, b: 20 })
    );
  });

  it('should throw error if tool not found', async () => {
    mockMatimo.registry.get.mockReturnValue(null);

    class TestAgent {
      @tool('unknown-tool')
      async unknownTool() {
        //
      }
    }

    const agent = new TestAgent();

    await expect(agent.unknownTool()).rejects.toThrow('Tool not found in registry: unknown-tool');
  });

  it('should throw error if Matimo instance not set', async () => {
    setGlobalMatimoInstance(null);

    class TestAgent {
      @tool('calculator')
      async calculate(_operation: string, _a: number, _b: number) {
        //
      }
    }

    const agent = new TestAgent();

    await expect(agent.calculate('add', 5, 3)).rejects.toThrow(
      'Matimo instance not found for tool decorator'
    );
  });

  it('should work with HTTP execution type', async () => {
    mockMatimo.registry.get.mockReturnValue({
      name: 'github-get-repo',
      version: '1.0.0',
      description: 'Get GitHub repository',
      parameters: {
        owner: { type: 'string', description: 'Owner' },
        repo: { type: 'string', description: 'Repo' },
      },
      execution: { type: 'http', method: 'GET', url: 'https://api.github.com' },
    } as ToolDefinition);
    mockMatimo.httpExecutor.execute.mockResolvedValue({ id: 123, name: 'repo' });

    class TestAgent {
      @tool('github-get-repo')
      async getRepo(_owner: string, _repo: string) {
        //
      }
    }

    const agent = new TestAgent();
    const result = await agent.getRepo('microsoft', 'vscode');

    expect(mockMatimo.httpExecutor.execute).toHaveBeenCalled();
    expect(result).toEqual({ id: 123, name: 'repo' });
  });
});
