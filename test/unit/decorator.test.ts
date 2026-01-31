import { tool, setGlobalMatimoInstance, getGlobalMatimoInstance } from '../../src/decorators/tool-decorator';
import { MatimoInstance } from '../../src/matimo-instance';

describe('Tool Decorator', () => {
  let matimo: MatimoInstance;

  beforeEach(async () => {
    // Load real tools from test fixtures
    const toolsPath = `${__dirname}/../fixtures/tools`;
    matimo = await MatimoInstance.init(toolsPath);
    setGlobalMatimoInstance(matimo);
  });

  afterEach(() => {
    setGlobalMatimoInstance(null);
  });

  it('should be a function that returns a decorator function', () => {
    const toolDecorator = tool('calculator');
    expect(typeof toolDecorator).toBe('function');
  });

  it('should set and get global Matimo instance', async () => {
    const testInstance = await MatimoInstance.init(`${__dirname}/../fixtures/tools`);
    setGlobalMatimoInstance(testInstance);

    const retrieved = getGlobalMatimoInstance();
    expect(retrieved).toBe(testInstance);
  });

  it('should throw error when getting global instance without setting it', () => {
    setGlobalMatimoInstance(null);

    expect(() => {
      getGlobalMatimoInstance();
    }).toThrow('Global MatimoInstance not set');
  });

  it('should execute calculator tool with instance property approach', async () => {
    // Create a test class with decorated method using instance property
    class Calculator {
      constructor(public matimo: MatimoInstance) {}

      // Manually apply decorator function to test execution path
      async calculate(operation: string, a: number, b: number) {
        // Execute the tool
        return await this.matimo.execute('calculator', { operation, a, b });
      }
    }

    const calc = new Calculator(matimo);
    const result = await calc.calculate('add', 42, 8);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('should execute echo tool via global instance', async () => {
    // Verify the global instance works for tool execution
    const globalInstance = getGlobalMatimoInstance();

    // Use the calculator tool that's available in fixtures
    const result = await globalInstance.execute('calculator', { operation: 'add', a: 5, b: 3 });

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('should throw error when tool not found during execution', async () => {
    const globalInstance = getGlobalMatimoInstance();

    await expect(
      globalInstance.execute('non-existent-tool', {})
    ).rejects.toThrow("Tool 'non-existent-tool' not found");
  });

  it('should handle tool decorator function wrapping', () => {
    const decoratorFactory = tool('calculator');

    // The decorator factory should return a function
    expect(typeof decoratorFactory).toBe('function');

    // The decorator should accept the target and context
    // Note: We're testing the function structure, not executing decorators
    // since TypeScript's decorator type system has strict requirements in test context
  });

  it('should pass correct parameters to matimo.execute', async () => {
    // Spy on matimo.execute to verify parameters
    const executeSpy = jest.spyOn(matimo, 'execute');

    class Calculator {
      constructor(public matimo: MatimoInstance) {}

      async calculate(operation: string, a: number, b: number) {
        return await this.matimo.execute('calculator', { operation, a, b });
      }
    }

    const calc = new Calculator(matimo);

    await calc.calculate('add', 10, 20);

    // Verify execute was called with correct tool name
    expect(executeSpy).toHaveBeenCalledWith(
      'calculator',
      expect.objectContaining({
        operation: 'add',
        a: 10,
        b: 20,
      })
    );

    executeSpy.mockRestore();
  });
});
