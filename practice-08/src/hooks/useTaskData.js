import {useState,useEffect,useRef} from 'react';
export function useTaskData({api,filters}) {
 const [snapshot,setSnapshot]=useState({tasks:[],categories:[],meta:{total:0}});
 const [status,setStatus]=useState('loading');
 const [error,setError]=useState(null);
 const [mutationError,setMutationError]=useState(null);
 const [pending,setPending]=useState(false);
 const [revision,setRevision]=useState(0);
 const mounted=useRef(false);
 const mutation=useRef(null);
 const {q,completed,priority,categoryId}=filters;
 useEffect(() => {
  mounted.current=true;
  return () => {mounted.current=false;mutation.current?.abort();};
 },[]);
 useEffect(() => {
  let active=true;
  const controller=new AbortController();
  setStatus('loading');setError(null);
  async function load() {
   try {
    const result=await api.loadInitialData({q,completed,priority,categoryId},{signal:controller.signal});
    if(active){setSnapshot(result);setStatus('ready');}
   } catch(e) {
    if(active && !controller.signal.aborted && e.kind!=='aborted'){setError(e);setStatus('error');}
   }
  }
  void load();
  return () => {active=false;controller.abort();};
 },[api,q,completed,priority,categoryId,revision]);
 function refresh(){if(mounted.current)setRevision(v => v+1);}
 async function mutate(operation){
  if(!mounted.current || mutation.current)return false;
  const controller=new AbortController();mutation.current=controller;
  setPending(true);setMutationError(null);
  try{
   await operation({signal:controller.signal});
   if(!mounted.current || controller.signal.aborted)return false;
   refresh();return true;
  }catch(e){
   if(mounted.current && !controller.signal.aborted)setMutationError(e);
   return false;
  }finally{
   if(mutation.current===controller){mutation.current=null;if(mounted.current)setPending(false);}
  }
 }
 return {snapshot,status,error,mutationError,pending,refresh,
 saveTask:(id,value)=>mutate(options=>id===null?api.createTask(value,options):api.updateTask(id,value,options)),
 toggleTask:task=>mutate(options=>api.setTaskCompleted(task.id,!task.completed,options)),
 deleteTask:id=>mutate(options=>api.deleteTask(id,options)),
 resetData:()=>mutate(options=>api.resetDemoData(options))};
}
