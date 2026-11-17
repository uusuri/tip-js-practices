"use strict";

const totalTasks = 14;
const completedTasks = 4;

const countsAreNumbers =
  typeof totalTasks === "number" && typeof completedTasks === "number";
const countsAreIntegers =
  Number.isInteger(totalTasks) && Number.isInteger(completedTasks);
const countsAreInRange =
  totalTasks >= 0 &&
  totalTasks <= 1000 &&
  completedTasks >= 0 &&
  completedTasks <= totalTasks;

if (!countsAreNumbers || !countsAreIntegers || !countsAreInRange) {
  console.log("Ошибка: количества задач должны быть целыми числами от 0 до 1000, а выполненных задач не может быть больше общего количества");
} else if (totalTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const progress = (completedTasks / totalTasks) * 100;

  let status = "В работе";
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${progress.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
