import { useState } from 'react';
import {tasks as initialTasks,categories} from './data.js';
import {createInitialFilters} from './variant.js';
import {addTask,updateTask,toggleTask,removeTask,selectTasks,getTaskStats} from './domain/task-service.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';
export default function App() {
 const [tasks,setTasks] = useState(() => initialTasks.map(t => ({...t})));
 const [filters,setFilters] = useState(createInitialFilters);
 const [editingId,setEditingId] = useState(null);
 const [message,setMessage] = useState('');
 const editingTask = tasks.find(t => t.id === editingId) ?? null;
 function save(value) {
  if (editingId !== null && !editingTask) return false;
  setTasks(previous => editingId === null ? addTask(previous,value,previous.reduce((m,t) => Math.max(m,t.id),0)+1) : updateTask(previous,editingId,value));
  setEditingId(null); setMessage('Задача сохранена.'); return true;
 }
 function remove(id) {
  if (!window.confirm('Удалить задачу?')) return;
  setTasks(previous => removeTask(previous,id));
  if (editingId === id) setEditingId(null);
  setMessage('Задача удалена.');
 }
 return <main><h1>Задачи на React</h1><p>ПР7: данные в памяти. Перезагрузка восстанавливает исходный набор.</p><p role="status">{message}</p>
 <TaskStats stats={getTaskStats(tasks)}/><TaskFilters filters={filters} categories={categories} onChange={setFilters}/>
 <TaskForm key={editingId ?? 'new'} categories={categories} initialTask={editingTask} onSave={save} onCancel={() => setEditingId(null)}/>
 <TaskList tasks={selectTasks(tasks,filters)} categories={categories} onEdit={setEditingId} onDelete={remove} onToggle={id => {setTasks(p => toggleTask(p,id));setMessage('Статус изменён.');}}/></main>;
}
