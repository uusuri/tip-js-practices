import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
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

export function isCategory(value) {
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
  async function getTasks(filters = {}, options = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query, signal: options.signal });
    if (!validCollection(payload, isTask) || payload.meta.filters === null
      || typeof payload.meta.filters !== "object" || Array.isArray(payload.meta.filters)) {
      throw invalidResponse("Неверная структура списка задач.");
    }
    return { tasks: payload.data, meta: payload.meta };
  }
  async function getTaskById(id, options = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный id задачи.");
    const payload = await client.requestJson(`/tasks/${id}`, { signal: options.signal });
    if (!isTask(payload?.data) || payload.data.id !== id) throw invalidResponse("Неверная структура задачи.");
    return payload.data;
  }
  async function getCategories(options = {}) {
    const payload = await client.requestJson("/categories", { signal: options.signal });
    if (!validCollection(payload, isCategory)) throw invalidResponse("Неверная структура категорий.");
    return payload.data;
  }
  async function loadInitialData(filters = {}, options = {}) {
    const [result, categories] = await Promise.all([getTasks(filters, options), getCategories(options)]);
    return { ...result, categories };
  }
  async function writeTask(path, method, body, options, id = null) {
    const payload = await client.requestJson(path, { method, body, signal: options.signal });
    if (!isTask(payload?.data) || (id !== null && payload.data.id !== id)) {
      throw invalidResponse("Неверная структура изменённой задачи.");
    }
    return payload.data;
  }
  function checkId(id) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный id задачи.");
  }
  async function createTask(draft, options = {}) {
    return writeTask("/tasks", "POST", draft, options);
  }
  async function updateTask(id, changes, options = {}) {
    checkId(id);
    return writeTask(`/tasks/${id}`, "PATCH", changes, options, id);
  }
  async function setTaskCompleted(id, completed, options = {}) {
    if (typeof completed !== "boolean") throw new TypeError("completed должен быть boolean.");
    return updateTask(id, { completed }, options);
  }
  async function deleteTask(id, options = {}) {
    checkId(id);
    const result = await client.requestJson(`/tasks/${id}`, { method: "DELETE", signal: options.signal });
    if (result !== null) throw invalidResponse("DELETE должен вернуть ответ без тела.");
    return null;
  }
  async function resetDemoData(options = {}) {
    const payload = await client.requestJson("/debug/reset", { method: "POST", signal: options.signal });
    if (payload?.data?.reset !== true || !Number.isSafeInteger(payload.data.total) || payload.data.total < 0) {
      throw invalidResponse("Сервер не подтвердил сброс данных.");
    }
    return payload.data;
  }
  return { getTasks, getTaskById, getCategories, loadInitialData,
    createTask, updateTask, setTaskCompleted, deleteTask, resetDemoData };
}
