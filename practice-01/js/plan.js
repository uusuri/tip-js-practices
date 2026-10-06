"use strict";

const totalTasks = 14;
const completedTasks = 4;
const dailyLimit = 4;

const countsAreValid =
  typeof totalTasks === "number" &&
  typeof completedTasks === "number" &&
  Number.isInteger(totalTasks) &&
  Number.isInteger(completedTasks) &&
  totalTasks >= 0 &&
  totalTasks <= 1000 &&
  completedTasks >= 0 &&
  completedTasks <= totalTasks;
const limitIsValid =
  typeof dailyLimit === "number" &&
  Number.isInteger(dailyLimit) &&
  dailyLimit >= 1 &&
  dailyLimit <= 1000;

if (!countsAreValid || !limitIsValid) {
  console.log("Ошибка: проверьте общее и выполненное количество задач, а также целую дневную норму от 1 до 1000");
} else {
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;

  console.log(`Осталось задач: ${remainingTasks}`);

  while (remainingTasks > 0) {
    day += 1;
    const tasksForDay = Math.min(dailyLimit, remainingTasks);
    remainingTasks -= tasksForDay;
    console.log(`День ${day}: выполнено ${tasksForDay}, осталось ${remainingTasks}`);
  }

  if (day === 0) {
    console.log("Все задачи уже выполнены");
  }

  console.log(`Потребуется дней: ${day}`);
}
