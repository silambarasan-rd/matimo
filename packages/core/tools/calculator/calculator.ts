// Calculator implementation
// This script is executed by the calculator tool

/**
 * Calculator utility functions
 */
const Calculator = {
  /**
   * Normalize operation name to handle variations
   */
  normalizeOperation(op: string): string {
    const normalized = op.toLowerCase().trim();

    // Map variations to canonical operation names
    const operationMap: Record<string, string> = {
      // Addition variants
      add: 'add',
      addition: 'add',
      sum: 'add',
      plus: 'add',
      '+': 'add',

      // Subtraction variants
      subtract: 'subtract',
      subtraction: 'subtract',
      minus: 'subtract',
      sub: 'subtract',
      '-': 'subtract',

      // Multiplication variants
      multiply: 'multiply',
      multiplication: 'multiply',
      times: 'multiply',
      product: 'multiply',
      mul: 'multiply',
      '*': 'multiply',
      x: 'multiply',

      // Division variants
      divide: 'divide',
      division: 'divide',
      div: 'divide',
      '/': 'divide',
    };

    return operationMap[normalized] || normalized;
  },

  /**
   * Perform arithmetic calculation
   */
  calculate(
    operation: string,
    a: number,
    b: number
  ): {
    result: number;
    operation: string;
    original_operation: string;
    operands: { a: number; b: number };
  } {
    const normalizedOp = this.normalizeOperation(operation);
    let result: number;

    switch (normalizedOp) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero');
        }
        result = a / b;
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return {
      result,
      operation: normalizedOp,
      original_operation: operation,
      operands: { a, b },
    };
  },
};

/**
 * CLI entry point
 */
function main(): void {
  try {
    const [operation, aStr, bStr] = process.argv.slice(2);

    if (!operation || !aStr || !bStr) {
      console.error('Usage: calculator.ts <operation> <a> <b>');
      console.error('Operations: add, subtract, multiply, divide');
      process.exit(1);
    }

    const a = parseFloat(aStr);
    const b = parseFloat(bStr);

    if (isNaN(a) || isNaN(b)) {
      console.error('Error: Arguments must be valid numbers');
      process.exit(1);
    }

    const result = Calculator.calculate(operation, a, b);
    console.log(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

// Execute CLI entry point
main();
