import TaskItem from './TaskItem.jsx';
export default function TaskList({tasks,categories,onToggle,onEdit,onDelete}) {
 return <section aria-label="Список задач"><h2>Задачи</h2><p>Найдено: {tasks.length}</p>{tasks.length ? <ul>{tasks.map(task => <TaskItem key={task.id} task={task} categoryName={categories.find(c => c.id === task.categoryId)?.name ?? 'Неизвестная категория'} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}/>)}</ul> : <p>Нет задач по выбранным условиям.</p>}</section>;
}
