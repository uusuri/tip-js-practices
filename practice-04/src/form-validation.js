const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// При редактировании disabled-поле id не попадает в FormData.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const rawId = editingId === null ? draft.id : editingId;
  const id = Number(rawId);
  if ((typeof rawId !== "string" && typeof rawId !== "number")
      || !Number.isSafeInteger(id) || id <= 0) {
    errors.id = "Идентификатор должен быть положительным безопасным целым числом.";
  } else if (editingId === null && tasks.some((task) => task.id === id)) {
    errors.id = "Задача с таким идентификатором уже существует.";
  } else if (editingId !== null && !tasks.some((task) => task.id === id)) {
    errors.id = "Редактируемая задача не найдена.";
  }

  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов после удаления пробелов по краям.";
  }
  if (!ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Выберите низкий, средний или высокий приоритет.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { id, title, priority: draft.priority } };
}
