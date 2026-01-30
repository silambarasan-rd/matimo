// Calculator implementation
// This script is executed by the calculator tool

const [operation, aStr, bStr] = process.argv.slice(2);
const a = parseFloat(aStr);
const b = parseFloat(bStr);

let result: number;

switch (operation) {
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
    console.error('Unknown operation');
    process.exit(1);
}

console.log(JSON.stringify({
  result,
  operation,
  operands: { a, b }
}));
