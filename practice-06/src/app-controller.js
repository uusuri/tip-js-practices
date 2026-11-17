import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  const apiMethods = ["loadInitialData", "getTasks", "createTask", "updateTask", "setTaskCompleted", "deleteTask", "resetDemoData"];
  const viewMethods = ["setListState", "setTasks", "setCategories", "setTotal", "setFormTask", "showFormErrors", "setMutationPending", "notify"];
  if (apiMethods.some((name) => typeof api?.[name] !== "function")
    || viewMethods.some((name) => typeof view?.[name] !== "function") || typeof validateDraft !== "function") {
    throw new TypeError("Нужны API, представление и функция проверки формы.");
  }
  let tasks = [];
  let categories = [];
  let categoriesLoaded = false;
  let filters = {};
  let editingId = null;
  let activeLoad = null;
  let loadNumber = 0;
  let mutationPending = false;
  let mutationController = null;
  let destroyed = false;

  async function loadCurrentTasks() {
    if (destroyed) return false;
    activeLoad?.abort();
    activeLoad = new AbortController();
    const signal = activeLoad.signal;
    const number = ++loadNumber;
    view.setListState("loading");
    try {
      const result = categoriesLoaded
        ? await api.getTasks(filters, { signal })
        : await api.loadInitialData(filters, { signal });
      if (destroyed || number !== loadNumber) return false;
      if (!categoriesLoaded) {
        categories = result.categories;
        categoriesLoaded = true;
        view.setCategories(categories);
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
      return true;
    } catch (error) {
      if (destroyed || number !== loadNumber || error.kind === "aborted") return false;
      view.setListState("error", messageForError(error));
      return false;
    }
  }

  function cancelEdit() {
    if (destroyed || mutationPending) return;
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }

  function beginEdit(id) {
    if (destroyed || mutationPending) return;
    const task = tasks.find((item) => item.id === id);
    if (!task) { view.notify("Задача не найдена в текущем списке.", "error"); return; }
    editingId = id;
    view.showFormErrors({});
    view.setFormTask(task);
  }

  async function mutate(operation, clearEditor = false) {
    if (destroyed || mutationPending) return;
    mutationPending = true;
    mutationController = new AbortController();
    activeLoad?.abort();
    ++loadNumber;
    view.setMutationPending(true);
    try {
      await operation({ signal: mutationController.signal });
      if (destroyed) return;
      if (clearEditor) {
        editingId = null;
        view.setFormTask(null);
        view.showFormErrors({});
      }
      view.notify("Операция выполнена.", "success");
      const loaded = await loadCurrentTasks();
      if (!loaded && !destroyed) view.notify("Изменение сохранено на сервере. Повторите загрузку списка.", "error");
    } catch (error) {
      if (!destroyed && error.kind !== "aborted") {
        if (error.kind === "http" && error.code === "VALIDATION_ERROR" && error.details && typeof error.details === "object") {
          view.showFormErrors(error.details);
        }
        view.notify(messageForError(error), "error");
      }
    } finally {
      mutationPending = false;
      if (!destroyed) view.setMutationPending(false);
    }
  }

  async function submit(draft) {
    if (destroyed || mutationPending) return;
    const result = validateDraft(draft, categories);
    view.showFormErrors(result.errors);
    if (!result.valid) return;
    const id = editingId;
    return mutate((options) => id === null
      ? api.createTask(result.value, options) : api.updateTask(id, result.value, options), true);
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) { if (!destroyed) view.notify("Задача не найдена в текущем списке.", "error"); return; }
    return mutate((options) => api.setTaskCompleted(id, !task.completed, options));
  }

  async function deleteTask(id) {
    if (!tasks.some((task) => task.id === id)) {
      if (!destroyed) view.notify("Задача не найдена в текущем списке.", "error");
      return;
    }
    return mutate((options) => api.deleteTask(id, options), editingId === id);
  }

  return {
    start(initialFilters = {}) {
      filters = { ...initialFilters };
      return loadCurrentTasks();
    },
    applyFilters(nextFilters = {}) {
      filters = { ...nextFilters };
      return loadCurrentTasks();
    },
    refresh: loadCurrentTasks,
    submit, beginEdit, cancelEdit, toggleTask, deleteTask,
    resetData: () => mutate((options) => api.resetDemoData(options), true),
    destroy() {
      destroyed = true;
      ++loadNumber;
      activeLoad?.abort();
      mutationController?.abort();
    },
  };
}
