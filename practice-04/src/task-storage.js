export const STORAGE_VERSION = 1;

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (task === null || typeof task !== "object" || Array.isArray(task)
        || !Number.isSafeInteger(task.id) || task.id <= 0 || ids.has(task.id)
        || typeof task.title !== "string" || task.title !== task.title.trim()
        || task.title.length < 1 || task.title.length > 100
        || typeof task.completed !== "boolean"
        || !["low", "medium", "high"].includes(task.priority)) {
      return false;
    }
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = fallbackTasks.map((task) => ({ ...task }));
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: fallback };
    const saved = JSON.parse(raw);
    if (saved === null || typeof saved !== "object"
        || saved.version !== STORAGE_VERSION || !isValidTaskList(saved.tasks)) {
      throw new Error("Неверная версия или структура сохранённых задач.");
    }
    return { ok: true, source: "storage", tasks: saved.tasks.map((task) => ({ ...task })) };
  } catch (error) {
    return {
      ok: false, source: "fallback", tasks: fallback,
      error: `Не удалось прочитать сохранённые задачи. Используется исходный набор. ${error.message}`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Некорректный список задач не сохранён." };
  }
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Изменения остались в памяти, но не сохранены. После перезагрузки они могут быть потеряны. ${error.message}`,
    };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить сохранённые данные. После перезагрузки они могут вернуться. ${error.message}` };
  }
}
