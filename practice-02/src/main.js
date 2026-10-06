import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(
    `${label}: всего ${total}; выполнено ${completed}; осталось ${pending}; прогресс ${progress.toFixed(1)}%`,
  );
}

function applyOperation(tasks, operation, label) {
  const result = operation();
  if (!result.ok) {
    console.error(`${label}. Ошибка: ${result.error}`);
    return tasks;
  }

  printStats(label, result.tasks);
  return result.tasks;
}

console.log("=== Общий сценарий ===");
const demoSnapshot = JSON.stringify(demoTasks);
let currentTasks = demoTasks;

console.table(currentTasks);
console.log("Названия:", getTaskTitles(currentTasks));
console.log("Невыполненные id:", getPendingTasks(currentTasks).map(({ id }) => id));
console.log("Найдена задача id=4:", findTaskById(currentTasks, 4));
printStats("Исходный набор", currentTasks);

currentTasks = applyOperation(
  currentTasks,
  () => addTask(currentTasks, 20, "Добавить проверку", "high"),
  "После добавления id=20",
);
currentTasks = applyOperation(
  currentTasks,
  () => setTaskCompleted(currentTasks, 4, true),
  "После выполнения id=4",
);
currentTasks = applyOperation(
  currentTasks,
  () => renameTask(currentTasks, 10, "Подготовить инструкцию запуска"),
  "После переименования id=10",
);
currentTasks = applyOperation(
  currentTasks,
  () => removeTask(currentTasks, 7),
  "После удаления id=7",
);

const failedDemoAdd = addTask(currentTasks, 20, "Дубликат", "medium");
if (!failedDemoAdd.ok) {
  console.error(`Ожидаемый отказ: ${failedDemoAdd.error}`);
}
console.log("Итоговые id:", currentTasks.map(({ id }) => id));
console.log("demoTasks не изменён:", JSON.stringify(demoTasks) === demoSnapshot);

console.log("\n=== Индивидуальный вариант ===");
console.log("Номер варианта:", variantNumber);
const variantSnapshot = JSON.stringify(variantTasks);
let currentVariantTasks = variantTasks;
console.table(currentVariantTasks);
printStats("Шесть исходных задач", currentVariantTasks);

const createdVariantTask = createTask(80, "Опубликовать итоговую документацию", "low");
console.log("Проверка новой задачи:", createdVariantTask);

currentVariantTasks = applyOperation(
  currentVariantTasks,
  () => addTask(currentVariantTasks, 80, "Опубликовать итоговую документацию", "low"),
  "После добавления id=80",
);
currentVariantTasks = applyOperation(
  currentVariantTasks,
  () => setTaskCompleted(currentVariantTasks, 11, true),
  "После установки completed=true для id=11",
);
currentVariantTasks = applyOperation(
  currentVariantTasks,
  () => renameTask(currentVariantTasks, 23, "Оформить структуру технического README"),
  "После переименования id=23",
);
currentVariantTasks = applyOperation(
  currentVariantTasks,
  () => removeTask(currentVariantTasks, 37),
  "После удаления id=37",
);

const failedVariantAdd = addTask(
  currentVariantTasks,
  80,
  "Повторная публикация документации",
  "low",
);
if (!failedVariantAdd.ok) {
  console.error(`Ожидаемый отказ: ${failedVariantAdd.error}`);
}
console.table(currentVariantTasks);
printStats("Итог варианта", currentVariantTasks);
console.log("variantTasks не изменён:", JSON.stringify(variantTasks) === variantSnapshot);
