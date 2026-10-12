import {ConvexError,v} from 'convex/values';
export const idType=v.union(v.literal('aadhaar'),v.literal('pan'),v.literal('passport'));
export const requirementsValidator=v.array(v.array(idType));
export const readingValidator=v.object({documentType:v.union(idType,v.literal('other')),holderName:v.string(),readable:v.boolean(),uncertain:v.boolean(),fictional:v.boolean()});
export type Reading={documentType:'aadhaar'|'pan'|'passport'|'other';holderName:string;readable:boolean;uncertain:boolean;fictional:boolean};
export function normalizedName(name:string){return name.normalize('NFKC').toLocaleLowerCase('en').replace(/[.,'’\-]/g,' ').replace(/\s+/g,' ').trim();}
export function assessName(expected:string,actual:string,clear:boolean):'passed'|'review'|'replacement'{
 if(!clear||!actual.trim()||!expected.trim())return 'review';
 return normalizedName(expected)===normalizedName(actual)?'passed':'replacement';
}
export function requirementsMet(groups:string[][],accepted:string[]){return groups.length>0&&groups.every(group=>group.length>0&&group.some(type=>accepted.includes(type)));}
export function validateSetup(names:string[],groups:string[][],count:number){
 if(names.length!==count||count<1||count>100||names.some(n=>!n.trim()||n.length>120))throw new ConvexError('Add the full name of every booked guest.');
 if(new Set(names.map(normalizedName)).size!==names.length)throw new ConvexError('Each guest needs a distinct record. Ask the host about guests with identical names.');
 if(groups.length<1||groups.length>3||groups.some(g=>g.length<1||g.length>3||g.some(t=>!['aadhaar','pan','passport'].includes(t))))throw new ConvexError('Choose at least one accepted ID requirement.');
}
export const labels:Record<string,string>={aadhaar:'Aadhaar',pan:'PAN',passport:'passport'};
export function requirementText(groups:string[][]){return groups.map(g=>g.map(t=>labels[t]).join(' or ')).join(' plus ');}
export type ReminderState={run:{complete:boolean;paused:boolean;lastReminderAt:number;replyReminderSent?:boolean;requirements?:string[][]};guests:{name:string;complete:boolean;documents:{type?:string;status:string}[]}[]}|null;
export function reminderGuest(state:ReminderState,now:number,frequency:'gentle'|'every_answer'='gentle'){
 if(!state||state.run.complete||state.run.paused||(frequency==='gentle'&&state.run.replyReminderSent&&now-state.run.lastReminderAt<120000))return null;
 return state.guests.find(g=>!g.complete&&!g.documents.some(d=>['checking','uploading','review'].includes(d.status)))?.name??null;
}
export function reminderMessage(state:ReminderState,now:number,frequency:'gentle'|'every_answer'='gentle',offerHelp=true){
 const name=reminderGuest(state,now,frequency);if(!name||!state)return null;
 const guest=state.guests.find(g=>g.name===name)!;
 const accepted=guest.documents.filter(d=>d.status==='passed').map(d=>d.type);
 const missing=(state.run.requirements??[]).filter(group=>!group.some(type=>accepted.includes(type)));
 const ids=missing.length?requirementText(missing):'the missing ID';
 return `When you have a moment, could you share ${ids} for ${name} using the ID checklist? We'd love to have pre-check-in ready before you arrive, so you can settle in and enjoy your stay.${offerHelp?" Is there anything else I can help you with?":''}`;
}
