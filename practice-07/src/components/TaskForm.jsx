import {useState} from 'react';
import {validateTaskDraft} from '../domain/task-service.js';
export default function TaskForm({categories,initialTask=null,onSave,onCancel}) {
 const empty = () => ({title:'',priority:'medium',categoryId:String(categories[0]?.id ?? '')});
 const [draft,setDraft] = useState(() => initialTask ? {title:initialTask.title,priority:initialTask.priority,categoryId:String(initialTask.categoryId)} : empty());
 const [errors,setErrors] = useState({});
 const [saveError,setSaveError] = useState('');
 const change = e => setDraft({...draft,[e.target.name]:e.target.value});
 function submit(e) { e.preventDefault(); const result=validateTaskDraft(draft,categories); setErrors(result.errors);setSaveError('');if(!result.valid)return; if(onSave(result.value)===true)setDraft(empty());else setSaveError('Задача не сохранена.'); }
 return <section aria-label="Форма задачи"><h2>{initialTask ? 'Редактирование задачи' : 'Добавление задачи'}</h2><form noValidate onSubmit={submit}>
 <label htmlFor="task-title">Название</label><input id="task-title" name="title" value={draft.title} onChange={change} aria-invalid={Boolean(errors.title)} aria-describedby="title-error"/><p id="title-error" className="error">{errors.title}</p>
 <label htmlFor="task-priority">Приоритет</label><select id="task-priority" name="priority" value={draft.priority} onChange={change} aria-invalid={Boolean(errors.priority)} aria-describedby="priority-error"><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select><p id="priority-error" className="error">{errors.priority}</p>
 <label htmlFor="task-category">Категория</label><select id="task-category" name="categoryId" value={draft.categoryId} onChange={change} aria-invalid={Boolean(errors.categoryId)} aria-describedby="category-error">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><p id="category-error" className="error">{errors.categoryId}</p>
 <button type="submit">{initialTask ? 'Сохранить изменения' : 'Добавить задачу'}</button>{initialTask && <button type="button" onClick={onCancel}>Отмена</button>}{saveError && <p role="alert">{saveError}</p>}</form></section>;
}
