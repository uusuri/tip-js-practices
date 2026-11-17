import {ApiError} from './errors.js';
export function parsePositiveId(raw){
 if(typeof raw!=='string'||!/^[1-9]\d*$/.test(raw))return null;
 const value=Number(raw);return Number.isSafeInteger(value)?value:null;
}
export function parseFilters(searchParams){
 const filters={completed:null,priority:null,categoryId:null,q:''};
 const seen=new Set();
 const invalid=()=>{throw new ApiError(400,'INVALID_QUERY','Некорректные параметры запроса.');};
 for(const [key,value] of searchParams){
  if(!Object.hasOwn(filters,key)||seen.has(key))invalid();seen.add(key);
  if(key==='completed'){if(value!=='true'&&value!=='false')invalid();filters.completed=value==='true';}
  if(key==='priority'){if(!['low','medium','high'].includes(value))invalid();filters.priority=value;}
  if(key==='categoryId'){const id=parsePositiveId(value);if(id===null)invalid();filters.categoryId=id;}
  if(key==='q'){filters.q=value.trim();if(filters.q.length>100)invalid();}
 }
 return filters;
}
