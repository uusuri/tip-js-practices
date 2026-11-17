export default function TaskItem({task,categoryName,onToggle,onEdit,onDelete}) {
 return <li><h3>{task.title}</h3><p>№ {task.id} · {task.completed ? 'Выполнена' : 'В работе'} · {{low:'Низкий',medium:'Средний',high:'Высокий'}[task.priority]} · {categoryName}</p><div className="actions">
 <button type="button" aria-pressed={task.completed} onClick={() => onToggle(task.id)}>{task.completed ? 'Вернуть в работу' : 'Завершить'}</button><button type="button" onClick={() => onEdit(task.id)}>Редактировать</button><button type="button" onClick={() => onDelete(task.id)}>Удалить</button></div></li>;
}
