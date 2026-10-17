import type { Participant } from './types'; const base=import.meta.env.VITE_MONITOR_API_URL??'http://localhost:4015';
export async function api<T>(path:string,token:string):Promise<T>{const r=await fetch(base+path,{cache:'no-store',headers:{Authorization:`Bearer ${token}`}});if(!r.ok)throw Error((await r.json().catch(()=>({}))).error??`Request failed (${r.status})`);return r.json()}
export function stream(_token:string,_onData:(p:Participant)=>void,_onError:()=>void){return()=>{}}
