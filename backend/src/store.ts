import type { Participant, Telemetry } from './types.js';
const retentionMs = Number(process.env.METRICS_RETENTION_MINUTES ?? 30) * 60_000;
const meetings = new Map<string, Map<string, Participant>>();
const history = new Map<string, Array<Telemetry & { timestamp: number }>>();
const subscribers = new Set<(event: unknown) => void>();
export function qualityOf(t: Telemetry) {
  const n=t.network; if (!n) return { quality:'Unknown' as const,score:0 };
  const penalty=(n.packetLossPct??0)*5 + Math.max(0,(n.rttMs??0)-80)/8 + Math.max(0,(n.jitterMs??0)-15)/3 + Math.max(0,18-(t.video?.sendFps??30))*2;
  const score=Math.max(0,Math.round(100-penalty)); return {score,quality:(score>=90?'Excellent':score>=75?'Good':score>=55?'Degraded':'Poor') as Participant['quality']};
}
export function ingest(t: Telemetry) {
  const timestamp=t.timestamp ?? Date.now(), room=meetings.get(t.meetingId) ?? new Map<string, Participant>();
  const old=room.get(t.participantId), q=qualityOf(t); const p: Participant={...t,lastSeen:timestamp,joinedAt:old?.joinedAt ?? timestamp,...q}; room.set(t.participantId,p); meetings.set(t.meetingId,room);
  const records=history.get(t.meetingId) ?? []; records.push({...t,timestamp}); const cutoff=Date.now()-retentionMs; while(records.length && records[0].timestamp<cutoff) records.shift(); history.set(t.meetingId,records);
  broadcast({type:'telemetry',meetingId:t.meetingId,participant:p}); return p;
}
export function listMeetings() { prune(); return [...meetings].map(([id,p])=>({meetingId:id,participantCount:p.size,status:'active',startTime:Math.min(...[...p.values()].map(x=>x.joinedAt)),health:average([...p.values()].map(x=>x.score))})); }
export function participants(id:string) { prune(); return [...(meetings.get(id)?.values() ?? [])]; }
export function getHistory(id:string, from:number) { return (history.get(id)??[]).filter(x=>x.timestamp>=from); }
export function matrix(id:string) { return participants(id).flatMap(receiver=>(receiver.receivers??[]).map(stream=>({receiverParticipantId:receiver.participantId,...stream}))); }
export function addSubscriber(fn:(event:unknown)=>void){subscribers.add(fn);return()=>subscribers.delete(fn)}
function broadcast(event:unknown){subscribers.forEach(fn=>fn(event))} function average(n:number[]){return n.length?Math.round(n.reduce((a,b)=>a+b,0)/n.length):0}
function prune(){const cutoff=Date.now()-retentionMs; for(const [id,room] of meetings){for(const [pid,p] of room)if(p.lastSeen<cutoff)room.delete(pid);if(!room.size)meetings.delete(id)}}
export function resetStore(){meetings.clear();history.clear()}
