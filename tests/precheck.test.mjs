import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
const r=buildSync({entryPoints:['convex/precheckRules.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {assessName,requirementsMet,validateSetup}=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
test('ID name comparison passes formatting only and never guesses a different person',()=>{
 assert.equal(assessName('Mohit Nagaria',' MOHIT  NAGARIA ',true),'passed');
 for(const name of ['M Nagaria','Nagaria Mohit','Mohit','Priya Sharma',''])assert.notEqual(assessName('Mohit Nagaria',name,true),'passed');
 assert.equal(assessName('Mohit Nagaria','Mohit Nagaria',false),'review');
});
test('one-of and combined requirements count accepted document types, not file quantity',()=>{
 assert.equal(requirementsMet([['aadhaar','pan','passport']],['pan']),true);
 assert.equal(requirementsMet([['pan'],['aadhaar','passport']],['pan']),false);
 assert.equal(requirementsMet([['pan'],['aadhaar','passport']],['pan','passport']),true);
 assert.equal(requirementsMet([],['pan']),false);
});
test('guest and requirement setup rejects incomplete or duplicate people and invalid policy',()=>{
 assert.throws(()=>validateSetup(['Mohit','Mohit'],[['pan']],2));
 assert.throws(()=>validateSetup(['Mohit'],[['pan']],2));
 assert.throws(()=>validateSetup(['Mohit'],[],1));
 assert.doesNotThrow(()=>validateSetup(['Mohit Nagaria','Priya Sharma'],[['aadhaar','passport']],2));
});
const bundle=buildSync({entryPoints:['convex/precheck.ts'],bundle:true,platform:'node',format:'esm',write:false});
const precheck=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
function db(){
 const tables={precheckRuns:[{_id:'run',bookingId:'booking',revision:1,names:['Mohit Nagaria','Priya Sharma','Dev Patel'],requirements:[['aadhaar','pan','passport']],complete:false,arrivalProvided:true}],precheckDocuments:[],precheckEvents:[]};
 const ctx={db:{get:async(t,id)=>tables[t].find(x=>x._id===id)||null,patch:async(t,id,p)=>Object.assign(tables[t].find(x=>x._id===id),p),insert:async(t,p)=>{const id=`${t}-${tables[t].length}`;tables[t].push({...p,_id:id});return id;},query(t){const checks=[];const b={eq(k,v){checks.push([k,v]);return b;}};const q={withIndex(_i,cb){cb?.(b);return q;},take:async n=>tables[t].filter(x=>checks.every(([k,v])=>x[k]===v)).slice(0,n),first:async()=>tables[t].find(x=>checks.every(([k,v])=>x[k]===v))||null};return q;}},storage:{delete:async()=>{}}};return{ctx,tables};
}
const reading=name=>({documentType:'aadhaar',holderName:name,readable:true,uncertain:false,fictional:true});
test('only all three saved guest checks complete a booking and notify once',async()=>{
 const{ctx,tables}=db();for(let index=0;index<3;index++)tables.precheckDocuments.push({_id:`doc${index}`,runId:'run',revision:1,guestIndex:index,expectedName:tables.precheckRuns[0].names[index],type:'aadhaar',status:'checking',attempt:1});
 for(let index=0;index<2;index++)await precheck.result._handler(ctx,{documentId:`doc${index}`,attempt:1,reading:reading(tables.precheckRuns[0].names[index])});
 assert.equal(tables.precheckRuns[0].complete,false);
 await precheck.result._handler(ctx,{documentId:'doc2',attempt:1,reading:reading('Dev Patel')});assert.equal(tables.precheckRuns[0].complete,true);
 await precheck.result._handler(ctx,{documentId:'doc2',attempt:1,reading:reading('Dev Patel')});assert.equal(tables.precheckEvents.filter(e=>e.kind==='complete').length,1);
});
test('stale attempts and changed guest checklists cannot accept documents',async()=>{
 const{ctx,tables}=db();tables.precheckDocuments.push({_id:'doc',runId:'run',revision:1,guestIndex:0,expectedName:'Mohit Nagaria',type:'aadhaar',status:'checking',attempt:2});
 await precheck.result._handler(ctx,{documentId:'doc',attempt:1,reading:reading('Mohit Nagaria')});assert.equal(tables.precheckDocuments[0].status,'checking');
 tables.precheckRuns[0].revision=2;await precheck.result._handler(ctx,{documentId:'doc',attempt:2,reading:reading('Mohit Nagaria')});assert.equal(tables.precheckDocuments[0].status,'checking');
});
test('unmarked real documents never pass the public fictional-ID flow',async()=>{
 const{ctx,tables}=db();tables.precheckDocuments.push({_id:'doc',runId:'run',revision:1,guestIndex:0,expectedName:'Mohit Nagaria',type:'aadhaar',status:'checking',attempt:1,fileId:'file'});
 await precheck.result._handler(ctx,{documentId:'doc',attempt:1,reading:{...reading('Mohit Nagaria'),fictional:false}});assert.equal(tables.precheckDocuments[0].status,'replacement');assert.equal(tables.precheckDocuments[0].fileId,undefined);assert.equal(tables.precheckDocuments[0].reading,undefined);
});
test('replacement upload removes old approval and missing arrival information blocks completion',async()=>{
 const{ctx,tables}=db();for(let index=0;index<3;index++)tables.precheckDocuments.push({_id:`doc${index}`,runId:'run',revision:1,guestIndex:index,type:'aadhaar',status:'passed'});
 tables.precheckRuns[0].arrivalProvided=false;await precheck.reconcile(ctx,'booking');assert.equal(tables.precheckRuns[0].complete,false);
 tables.precheckRuns[0].arrivalProvided=true;await precheck.reconcile(ctx,'booking');assert.equal(tables.precheckRuns[0].complete,true);
 tables.precheckDocuments.push({_id:'newdoc',runId:'run',revision:1,guestIndex:1,type:'aadhaar',status:'checking'});await precheck.reconcile(ctx,'booking');assert.equal(tables.precheckRuns[0].complete,false);
});
test('reminders stop after completion, a pause, a recent request or a pending review',async()=>{
 const {reminderGuest}=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
 const state={run:{complete:false,paused:false,replyReminderSent:true,lastReminderAt:0},guests:[{name:'Priya',complete:false,documents:[]}]};assert.equal(reminderGuest(state,200000),'Priya');
 for(const patch of[{complete:true},{paused:true},{lastReminderAt:199000}])assert.equal(reminderGuest({...state,run:{...state.run,...patch}},200000),null);
 for(const status of['checking','uploading','review'])assert.equal(reminderGuest({...state,guests:[{name:'Priya',complete:false,documents:[{status}]}]},200000),null);
});

test('first guest answer gets a follow-up even just after opening the checklist',async()=>{
 const {reminderGuest}=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
 const state={run:{complete:false,paused:false,lastReminderAt:200000},guests:[{name:'Priya',complete:false,documents:[]}]};
 assert.equal(reminderGuest(state,200001),'Priya');
});
const sandboxBundle=buildSync({entryPoints:['convex/sandbox.ts'],bundle:true,platform:'node',format:'esm',write:false});
const sandbox=await import('data:text/javascript;base64,'+Buffer.from(sandboxBundle.outputFiles[0].text).toString('base64'));
test('reply delivery rechecks saved completion and pause before sending a reminder',async()=>{
 for(const change of [{complete:true},{paused:true},{}]){
  const {ctx,tables}=db();Object.assign(tables.precheckRuns[0],{paused:false,lastReminderAt:0,replyReminderSent:false},change);
  tables.sandboxBookings=[{_id:'booking',generation:0,busyTurnId:'turn'}];tables.sandboxTurns=[{_id:'turn',bookingId:'booking',generation:0,attempt:1,status:'replying',threadId:'thread',promptMessageId:'prompt'}];ctx.runMutation=async()=>({messages:[{_id:'message'}]});
  await sandbox.finish._handler(ctx,{turnId:'turn',attempt:1,reply:'Check-in is at 2 pm.'});
  assert.equal(tables.sandboxTurns[0].replies.length,Object.keys(change).length?1:2);
  if(!Object.keys(change).length)assert.equal(tables.precheckRuns[0].replyReminderSent,true);
 }
});
