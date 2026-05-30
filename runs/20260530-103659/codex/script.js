const display = document.querySelector("#display");
const historyDisplay = document.querySelector("#history");
const keys = document.querySelector(".keys");

const calculator = {
  displayValue: "0",
  firstOperand: null,
  waitingForSecondOperand: false,
  operator: null,
  history: "",
};

const operations = {
  "+": (first, second) => first + second,
  "-": (first, second) => first - second,
  "*": (first, second) => first * second,
  "/": (first, second) => {
    if (second === 0) return null;
    return first / second;
  },
};

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";

  const rounded = Number.parseFloat(value.toPrecision(12));
  if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
    return rounded.toExponential(6);
  }

  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: 10,
  });
}

function parseDisplayValue() {
  return Number(calculator.displayValue.replaceAll(",", ""));
}

function updateDisplay() {
  display.textContent = calculator.displayValue;
  historyDisplay.textContent = calculator.history;
}

function inputDigit(digit) {
  if (calculator.displayValue === "Error") {
    resetCalculator();
  }

  if (calculator.waitingForSecondOperand) {
    calculator.displayValue = digit;
    calculator.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }

  calculator.displayValue =
    calculator.displayValue === "0" ? digit : `${calculator.displayValue}${digit}`;
  updateDisplay();
}

function inputDecimal() {
  if (calculator.displayValue === "Error") {
    resetCalculator();
  }

  if (calculator.waitingForSecondOperand) {
    calculator.displayValue = "0.";
    calculator.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }

  if (!calculator.displayValue.includes(".")) {
    calculator.displayValue = `${calculator.displayValue}.`;
    updateDisplay();
  }
}

function handleOperator(nextOperator) {
  const inputValue = parseDisplayValue();

  if (calculator.operator && calculator.waitingForSecondOperand) {
    calculator.operator = nextOperator;
    calculator.history = `${formatNumber(calculator.firstOperand)} ${operatorLabel(nextOperator)}`;
    updateDisplay();
    return;
  }

  if (calculator.firstOperand === null) {
    calculator.firstOperand = inputValue;
  } else if (calculator.operator) {
    const result = operations[calculator.operator](calculator.firstOperand, inputValue);

    if (result === null) {
      showError("Cannot divide by zero");
      return;
    }

    calculator.displayValue = formatNumber(result);
    calculator.firstOperand = result;
  }

  calculator.waitingForSecondOperand = true;
  calculator.operator = nextOperator;
  calculator.history = `${formatNumber(calculator.firstOperand)} ${operatorLabel(nextOperator)}`;
  updateDisplay();
}

function calculate() {
  if (!calculator.operator || calculator.waitingForSecondOperand) return;

  const firstOperand = calculator.firstOperand;
  const secondOperand = parseDisplayValue();
  const result = operations[calculator.operator](firstOperand, secondOperand);

  if (result === null) {
    showError("Cannot divide by zero");
    return;
  }

  calculator.history = `${formatNumber(firstOperand)} ${operatorLabel(calculator.operator)} ${formatNumber(secondOperand)} =`;
  calculator.displayValue = formatNumber(result);
  calculator.firstOperand = null;
  calculator.waitingForSecondOperand = true;
  calculator.operator = null;
  updateDisplay();
}

function applyPercent() {
  if (calculator.displayValue === "Error") return;

  const value = parseDisplayValue() / 100;
  calculator.displayValue = formatNumber(value);
  updateDisplay();
}

function deleteLastDigit() {
  if (calculator.waitingForSecondOperand || calculator.displayValue === "Error") return;

  calculator.displayValue =
    calculator.displayValue.length > 1 ? calculator.displayValue.slice(0, -1) : "0";
  updateDisplay();
}

function resetCalculator() {
  calculator.displayValue = "0";
  calculator.firstOperand = null;
  calculator.waitingForSecondOperand = false;
  calculator.operator = null;
  calculator.history = "";
  updateDisplay();
}

function showError(message) {
  calculator.displayValue = "Error";
  calculator.firstOperand = null;
  calculator.waitingForSecondOperand = false;
  calculator.operator = null;
  calculator.history = message;
  updateDisplay();
}

function operatorLabel(operator) {
  return {
    "+": "+",
    "-": "-",
    "*": "x",
    "/": "÷",
  }[operator];
}

function handleKeyPress(event) {
  const { key } = event;

  if (/^\d$/.test(key)) inputDigit(key);
  if (key === ".") inputDecimal();
  if (["+", "-", "*", "/"].includes(key)) handleOperator(key);
  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  }
  if (key === "Backspace") deleteLastDigit();
  if (key === "Escape") resetCalculator();
  if (key === "%") applyPercent();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number) inputDigit(button.dataset.number);
  if (button.dataset.operator) handleOperator(button.dataset.operator);

  switch (button.dataset.action) {
    case "decimal":
      inputDecimal();
      break;
    case "equals":
      calculate();
      break;
    case "clear":
      resetCalculator();
      break;
    case "delete":
      deleteLastDigit();
      break;
    case "percent":
      applyPercent();
      break;
    default:
      break;
  }
});

document.addEventListener("keydown", handleKeyPress);
updateDisplay();
