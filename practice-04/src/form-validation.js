const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const rawId = editingId === null ? draft.id : editingId;
  const id = typeof rawId === "string" ? Number(rawId) : rawId;
  if (!Number.isSafeInteger(id) || id <= 0) {
    errors.id = "Укажите положительное безопасное целое число.";
  } else if (editingId === null && tasks.some((task) => task.id === id)) {
    errors.id = "Задача с таким id уже существует.";
  } else if (editingId !== null && !tasks.some((task) => task.id === id)) {
    errors.id = "Редактируемая задача не найдена.";
  }
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов после trim.";
  }
  if (!ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Выберите приоритет low, medium или high.";
  }
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value: { id, title, priority: draft.priority } };
}
