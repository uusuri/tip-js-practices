export function createTaskElement(task, category) {
  const priorityLabels = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  };

  const item = document.createElement("li");
  item.className = "task-card";
  item.dataset.taskId = String(task.id);
  item.classList.toggle("is-completed", task.completed);

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = priorityLabels[task.priority];

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = "Выполнена";
  toggleButton.append(toggleLabel);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteButton.append(deleteLabel);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.dataset.action = "edit";
  const editLabel = document.createElement("span");
  editLabel.className = "action-label";
  editLabel.textContent = "Изменить";
  editButton.append(editLabel);
  actions.append(toggleButton, editButton, deleteButton);
  const categoryLabel = document.createElement("span");
  categoryLabel.className = "task-category";
  categoryLabel.textContent = category?.name ?? "Неизвестная категория";
  const meta = document.createElement("div");
  meta.className = "task-meta";
  meta.append(status, priority, categoryLabel);
  item.append(title, meta, actions);
  return item;
}

export function renderTaskList(listElement, tasks, categories) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const taskElements = tasks.map((task) => createTaskElement(task, categoryById.get(task.categoryId)));
  listElement.replaceChildren(...taskElements);
}

