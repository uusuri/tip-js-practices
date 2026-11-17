const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  const categoryId = typeof draft.categoryId === "string" ? Number(draft.categoryId) : draft.categoryId;
  if (title.length < 1 || title.length > 100) errors.title = "Название должно содержать от 1 до 100 символов.";
  if (!ALLOWED_PRIORITIES.has(draft.priority)) errors.priority = "Выберите допустимый приоритет.";
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0 || !categories.some((category) => category.id === categoryId)) {
    errors.categoryId = "Выберите существующую категорию.";
  }
  return { valid: Object.keys(errors).length === 0,
    value: { title, priority: draft.priority, categoryId }, errors };
}
