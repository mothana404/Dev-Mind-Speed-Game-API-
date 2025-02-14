exports.generateEquation = (difficulty) => {
  const operations = ["+", "-", "*", "/"];
  let numbers = [];
  let operators = [];
  const operandCount = difficulty + 1;

  for (let i = 0; i < operandCount; i++) {
    const maxDigits = difficulty;
    const max = Math.pow(10, maxDigits) - 1;
    numbers.push(Math.floor(Math.random() * max) + 1);
  }

  for (let i = 0; i < operandCount - 1; i++) {
    operators.push(operations[Math.floor(Math.random() * operations.length)]);
  }

  let equation = numbers[0].toString();
  for (let i = 0; i < operators.length; i++) {
    equation += ` ${operators[i]} ${numbers[i + 1]}`;
  }

  let result;
  try {
    result = eval(equation);
    if (!isFinite(result)) throw new Error("Invalid calculation");
  } catch (error) {
    return exports.generateEquation(difficulty);
  }

  return {
    equation,
    answer: parseFloat(result.toFixed(2)),
  };
};
