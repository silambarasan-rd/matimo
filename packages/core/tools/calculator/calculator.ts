/**
 * Calculator Tool - Perform basic arithmetic operations
 * Pattern: Function-based tool (same as execute)
 */

import { MatimoError, ErrorCode } from '../../src/errors/matimo-error';

interface CalculatorParams {
  operation: string;
  a: number;
  b: number;
}

interface CalculatorResult {
  result: number;
  operation: string;
  original_operation: string;
  operands: {
    a: number;
    b: number;
  };
}

/**
 * Normalize operation name to handle variations
 */
function normalizeOperation(op: string): string {
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
}

/**
 * Perform arithmetic calculation
 */
export default async function calculator(
  params: CalculatorParams
): Promise<CalculatorResult> {
  const { operation, a, b } = params;

  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new MatimoError('Parameters a and b must be numbers', ErrorCode.INVALID_PARAMETER, {
      a,
      b,
    });
  }

  const normalizedOp = normalizeOperation(operation);
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
        throw new MatimoError('Division by zero', ErrorCode.EXECUTION_FAILED, {
          a,
          b,
        });
      }
      result = a / b;
      break;
    default:
      throw new MatimoError('Invalid operation', ErrorCode.INVALID_PARAMETER, {
        operation,
        normalizedOperation: normalizedOp,
        validOperations: ['add', 'addition', 'sum', 'plus', 'subtract', 'subtraction', 'minus', 'multiply', 'multiplication', 'times', 'divide', 'division', 'div'],
      });
  }

  const returnValue = {
    result,
    operation: normalizedOp,
    original_operation: operation,
    operands: { a, b },
  };

  return returnValue;
}
