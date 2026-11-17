import assert from "node:assert/strict";

import { demoTasks } from "./src/data.js";
import {
  addTask,
  findTaskById,
  getTaskStats,
  removeTask,
  renameTask,
  setTaskCompleted,
} from "./src/task-service.js";

let passed = 0;

function check(name, test) {
  try {
    test();
    passed += 1;
    console.log(`OK: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}

check("Удалённый id можно добавить заново в конец", () => {
  const removed = removeTask(demoTasks, 4);
  assert.equal(removed.ok, true);
  const added = addTask(removed.tasks, 4, "Новая версия задачи", "low");
  assert.equal(added.ok, true);
  assert.deepEqual(added.tasks.map(({ id }) => id), [1, 7, 10, 4]);
  assert.equal(demoTasks[1].title, "Подготовить модель задач");
});

check("Последовательное изменение первой и последней записи сохраняет исходник", () => {
  const snapshot = JSON.stringify(demoTasks);
  const toggled = setTaskCompleted(demoTasks, 1, false);
  assert.equal(toggled.ok, true);
  const renamed = renameTask(toggled.tasks, 10, "  Финальный отчёт  ");
  assert.equal(renamed.ok, true);
  assert.equal(findTaskById(renamed.tasks, 1).completed, false);
  assert.equal(findTaskById(renamed.tasks, 10).title, "Финальный отчёт");
  assert.equal(JSON.stringify(demoTasks), snapshot);
});

check("Два последовательных добавления корректно меняют сводку", () => {
  const first = addTask(demoTasks, 20, "Первая новая задача", "high");
  assert.equal(first.ok, true);
  const second = addTask(first.tasks, 21, "Вторая новая задача", "medium");
  assert.equal(second.ok, true);
  const stats = getTaskStats(second.tasks);
  assert.equal(stats.total, 6);
  assert.equal(stats.completed, 2);
  assert.equal(stats.pending, 4);
  assert.ok(Math.abs(stats.progress - 100 / 3) < 1e-10);
});

console.log(`Собственные проверки: ${passed} из 3 пройдены.`);
