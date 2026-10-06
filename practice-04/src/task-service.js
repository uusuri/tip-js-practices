const priorities = ["low", "medium", "high"];

function validateId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { ok: false, error: "Идентификатор должен быть положительным безопасным целым числом" };
  }

  return { ok: true };
}

function validateTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название задачи должно быть строкой" };
  }

  const normalizedTitle = title.trim();
  if (normalizedTitle.length < 1 || normalizedTitle.length > 100) {
    return { ok: false, error: "Название задачи должно содержать от 1 до 100 символов" };
  }

  return { ok: true, title: normalizedTitle };
}

export function createTask(id, title, priority = "medium") {
  const idValidation = validateId(id);
  if (!idValidation.ok) {
    return idValidation;
  }

  const titleValidation = validateTitle(title);
  if (!titleValidation.ok) {
    return titleValidation;
  }

  if (!priorities.includes(priority)) {
    return { ok: false, error: "Приоритет должен быть low, medium или high" };
  }

  return {
    ok: true,
    task: {
      id,
      title: titleValidation.title,
      completed: false,
      priority,
    },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  let completed = 0;

  for (const task of tasks) {
    if (task.completed === true) {
      completed += 1;
    }
  }

  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const creationResult = createTask(id, title, priority);
  if (!creationResult.ok) {
    return creationResult;
  }

  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} уже существует` };
  }

  return { ok: true, tasks: [...tasks, creationResult.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idValidation = validateId(id);
  if (!idValidation.ok) {
    return idValidation;
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус completed должен быть логическим значением" };
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена` };
  }

  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task,
  );
  return { ok: true, tasks: updatedTasks };
}

export function renameTask(tasks, id, title) {
  const idValidation = validateId(id);
  if (!idValidation.ok) {
    return idValidation;
  }

  const titleValidation = validateTitle(title);
  if (!titleValidation.ok) {
    return titleValidation;
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена` };
  }

  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, title: titleValidation.title } : task,
  );
  return { ok: true, tasks: updatedTasks };
}

export function removeTask(tasks, id) {
  const idValidation = validateId(id);
  if (!idValidation.ok) {
    return idValidation;
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена` };
  }

  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}

export function updateTask(tasks, id, title, priority) {
  const validated = createTask(id, title, priority);
  if (!validated.ok) return validated;
  if (!priorities.includes(priority)) {
    return { ok: false, error: "Приоритет должен быть low, medium или high" };
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена` };
  }

  const updatedTasks = tasks.map((task) => task.id === id
    ? { ...task, title: validated.task.title, priority }
    : task);
  return { ok: true, tasks: updatedTasks };
}
