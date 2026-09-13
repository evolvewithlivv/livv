/** Local direct messages — V1 placeholder. */
export type DmMessage={id:string;fromMe:boolean;text:string;at:number};export type DmThread={id:string;peerName:string;peerUsername:string;peerPhoto:string|null;peerAccent:string;messages:DmMessage[];updatedAt:number};
const KEY="livv-dms-v1";
export function loadThreads():DmThread[]{if(typeof window==="undefined")return[];try{const raw=window.localStorage.getItem(KEY);if(!raw){window.localStorage.setItem(KEY,"[]");return[];}const parsed=JSON.parse(raw) as DmThread[];return Array.isArray(parsed)?parsed:[];}catch{return[];}}
function save(threads:DmThread[]){window.localStorage.setItem(KEY,JSON.stringify(threads));window.dispatchEvent(new Event("livv-dms"));}
export function getThread(id:string){return loadThreads().find(t=>t.id===id)||null;}
export function sendDm(threadId:string,text:string){const threads=loadThreads();const t=threads.find(x=>x.id===threadId);if(!t||!text.trim())return threads;t.messages.push({id:`m_${Date.now()}`,fromMe:true,text:text.trim(),at:Date.now()});t.updatedAt=Date.now();save(threads);return threads;}
export function unreadCount(){return 0;}