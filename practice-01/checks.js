"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function sourceValue(value) {
  if (typeof value === "number" && Number.isNaN(value)) {
    return "NaN";
  }
  return JSON.stringify(value);
}

function run(fileName, values) {
  const filePath = path.join(__dirname, "js", fileName);
  let source = fs.readFileSync(filePath, "utf8");

  for (const [name, value] of Object.entries(values)) {
    source = source.replace(
      new RegExp(`const ${name} = [^;]+;`),
      `const ${name} = ${sourceValue(value)};`,
    );
  }

  const output = [];
  vm.runInNewContext(source, {
    console: {
      log: (...parts) => output.push(parts.map(String).join(" ")),
    },
  });
  return output;
}

let passed = 0;

function check(name, action) {
  action();
  passed += 1;
  console.log(`OK: ${name}`);
}

const progressCases = [
  ["Обычная сводка", 12, 5, ["Осталось: 7", "Прогресс: 41.7%", "Статус: В работе"]],
  ["Пустой список", 0, 0, ["Задач пока нет"]],
  ["Работа не начата", 5, 0, ["Осталось: 5", "Прогресс: 0.0%", "Статус: Не начато"]],
  ["Все задачи выполнены", 5, 5, ["Осталось: 0", "Прогресс: 100.0%", "Статус: Завершено"]],
  ["Выполнено больше общего", 5, 6, ["Ошибка:"]],
  ["Отрицательное количество", -1, 0, ["Ошибка:"]],
  ["Дробное количество", 5, 2.5, ["Ошибка:"]],
  ["Строка вместо числа", "5", 2, ["Ошибка:"]],
  ["Превышена верхняя граница", 1001, 0, ["Ошибка:"]],
  ["NaN вместо количества", NaN, 0, ["Ошибка:"]],
  ["Индивидуальный вариант 8", 14, 4, ["Осталось: 10", "Прогресс: 28.6%", "Статус: В работе"]],
];

for (const [name, totalTasks, completedTasks, expectedParts] of progressCases) {
  check(`progress.js — ${name}`, () => {
    const output = run("progress.js", { totalTasks, completedTasks });
    for (const expected of expectedParts) {
      assert.ok(output.some((line) => line.startsWith(expected)), `Не найдено: ${expected}`);
    }
    if (expectedParts[0] === "Ошибка:") {
      assert.equal(output.length, 1);
    }
  });
}

const planCases = [
  ["Обычный план", 12, 5, 3, ["День 3: выполнено 1, осталось 0", "Потребуется дней: 3"]],
  ["Ровно два дня", 10, 4, 3, ["День 2: выполнено 3, осталось 0", "Потребуется дней: 2"]],
  ["Норма больше остатка", 5, 3, 10, ["День 1: выполнено 2, осталось 0", "Потребуется дней: 1"]],
  ["Все выполнено", 5, 5, 2, ["Все задачи уже выполнены", "Потребуется дней: 0"]],
  ["Пустой список", 0, 0, 2, ["Все задачи уже выполнены", "Потребуется дней: 0"]],
  ["Нулевая норма", 5, 2, 0, ["Ошибка:"]],
  ["Дробная норма", 5, 2, 1.5, ["Ошибка:"]],
  ["Выполнено больше общего", 5, 6, 2, ["Ошибка:"]],
  ["Строковая норма", 5, 2, "2", ["Ошибка:"]],
  ["Норма выше границы", 5, 2, 1001, ["Ошибка:"]],
  ["Индивидуальный вариант 8", 14, 4, 4, ["День 3: выполнено 2, осталось 0", "Потребуется дней: 3"]],
];

for (const [name, totalTasks, completedTasks, dailyLimit, expectedParts] of planCases) {
  check(`plan.js — ${name}`, () => {
    const output = run("plan.js", { totalTasks, completedTasks, dailyLimit });
    for (const expected of expectedParts) {
      assert.ok(output.some((line) => line.startsWith(expected)), `Не найдено: ${expected}`);
    }
    if (expectedParts[0] === "Ошибка:") {
      assert.equal(output.length, 1);
    }
  });
}

console.log(`Проверки ПР1: ${passed} из ${progressCases.length + planCases.length} пройдены.`);
