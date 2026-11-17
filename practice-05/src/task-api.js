import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters) {
  if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Фильтры должны быть объектом.");
  }
  const query = {};
  for (const [key, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(key)) throw new TypeError(`Неизвестный фильтр: ${key}`);
    if (value === undefined || value === null || value === "") continue;
    if (key === "completed" && typeof value !== "boolean") throw new TypeError("completed должен быть boolean.");
    if (key === "priority" && !ALLOWED_PRIORITIES.has(value)) throw new TypeError("Неизвестный приоритет.");
    if (key === "categoryId" && !isPositiveSafeInteger(value)) throw new TypeError("Некорректная категория.");
    if (key === "q") {
      if (typeof value !== "string" || value.trim().length > 100) throw new TypeError("Некорректная строка поиска.");
      if (value.trim()) query.q = value.trim();
    } else query[key] = value;
  }
  return query;
}

function validCollection(payload, validator) {
  return Array.isArray(payload?.data) && payload.data.every(validator)
    && new Set(payload.data.map((item) => item.id)).size === payload.data.length
    && payload.meta?.total === payload.data.length;
}

export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") throw new TypeError("Нужен client.requestJson.");
  async function getTasks(filters = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query });
    if (!validCollection(payload, isTask) || payload.meta.filters === null
      || typeof payload.meta.filters !== "object" || Array.isArray(payload.meta.filters)) {
      throw invalidResponse("Неверная структура списка задач.");
    }
    return { tasks: payload.data, meta: payload.meta };
  }
  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный id задачи.");
    const payload = await client.requestJson(`/tasks/${id}`);
    if (!isTask(payload?.data) || payload.data.id !== id) throw invalidResponse("Неверная структура задачи.");
    return payload.data;
  }
  async function getCategories() {
    const payload = await client.requestJson("/categories");
    if (!validCollection(payload, isCategory)) throw invalidResponse("Неверная структура категорий.");
    return payload.data;
  }
  async function loadInitialData(filters = {}) {
    const [result, categories] = await Promise.all([getTasks(filters), getCategories()]);
    return { ...result, categories };
  }
  return { getTasks, getTaskById, getCategories, loadInitialData };
}
