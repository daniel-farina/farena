const display = document.querySelector("#display");
const keys = document.querySelector(".keys");

const operators = new Set(["+", "-", "*", "/", "%"]);
let expression = "";
let shouldReset = false;

function updateDisplay(value) {
  display.textContent = value || "0";
}

function clear() {
  expression = "";
  shouldReset = false;
  updateDisplay(expression);
}

function removeLast() {
  if (shouldReset) {
    clear();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay(expression);
}

function appendValue(value) {
  if (shouldReset && !operators.has(value)) {
    expression = "";
    shouldReset = false;
  }

  const last = expression.at(-1);

  if (value === "." && currentNumber().includes(".")) {
    return;
  }

  if (operators.has(value)) {
    shouldReset = false;

    if (!expression && value !== "-") {
      return;
    }

    if (operators.has(last)) {
      expression = expression.slice(0, -1);
    }
  }

  expression += value;
  updateDisplay(formatForDisplay(expression));
}

function currentNumber() {
  return expression.split(/[+\-*/%]/).at(-1) || "";
}

function calculate() {
  if (!expression || operators.has(expression.at(-1))) {
    return;
  }

  try {
    const result = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(result)) {
      throw new Error("Invalid result");
    }

    expression = Number.parseFloat(result.toFixed(10)).toString();
    shouldReset = true;
    updateDisplay(expression);
  } catch {
    expression = "";
    shouldReset = true;
    updateDisplay("Error");
  }
}

function formatForDisplay(value) {
  return value.replaceAll("*", "×").replaceAll("/", "÷").replaceAll("-", "−");
}

function flashKey(selector) {
  const key = document.querySelector(selector);
  if (!key) {
    return;
  }

  key.classList.add("is-active");
  setTimeout(() => key.classList.remove("is-active"), 100);
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.action === "clear") {
    clear();
  } else if (button.dataset.action === "delete") {
    removeLast();
  } else if (button.dataset.action === "calculate") {
    calculate();
  } else {
    appendValue(button.dataset.value);
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key) || operators.has(key) || key === ".") {
    event.preventDefault();
    appendValue(key);
    flashKey(`[data-value="${CSS.escape(key)}"]`);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    flashKey('[data-action="calculate"]');
  } else if (key === "Backspace") {
    event.preventDefault();
    removeLast();
    flashKey('[data-action="delete"]');
  } else if (key === "Escape") {
    event.preventDefault();
    clear();
    flashKey('[data-action="clear"]');
  }
});
