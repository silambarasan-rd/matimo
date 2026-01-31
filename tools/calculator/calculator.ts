// Calculator implementation
// This script is executed by the calculator tool

const [operation, aStr, bStr] = process.argv.slice(2);
const a = parseFloat(aStr);
const b = parseFloat(bStr);

// Normalize operation name to handle variations
const normalizeOperation = (op: string): string => {
  const normalized = op.toLowerCase().trim();
  
  // Map variations to canonical operation names
  const operationMap: Record<string, string> = {
    // Addition variants
    'add': 'add',
    'addition': 'add',
    'sum': 'add',
    'plus': 'add',
    '+': 'add',
    
    // Subtraction variants
    'subtract': 'subtract',
    'subtraction': 'subtract',
    'minus': 'subtract',
    'sub': 'subtract',
    '-': 'subtract',
    
    // Multiplication variants
    'multiply': 'multiply',
    'multiplication': 'multiply',
    'times': 'multiply',
    'product': 'multiply',
    'mul': 'multiply',
    '*': 'multiply',
    'x': 'multiply',
    
    // Division variants
    'divide': 'divide',
    'division': 'divide',
    'div': 'divide',
    '/': 'divide',
  };
  
  return operationMap[normalized] || normalized;
};

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
      console.error('Division by zero');
      process.exit(1);
    }
    result = a / b;
    break;
  default:
    console.error(`Unknown operation: ${operation}`);
    process.exit(1);
}

console.log(JSON.stringify({
  result,
  operation: normalizedOp,
  original_operation: operation,
  operands: { a, b }
}));
