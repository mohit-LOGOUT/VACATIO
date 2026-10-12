import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSync} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
await mkdir('artifacts/test-modules',{recursive:true});
async function load(name){const out=`artifacts/test-modules/${name}.mjs`;buildSync({entryPoints:[`convex/${name}.ts`],bundle:true,packages:'external',platform:'node',format:'esm',outfile:out});return import(pathToFileURL(`${process.cwd()}/${out}`));}
const trainer=await load('trainer'),rules=await load('trainerRules'),precheck=await load('precheckRules');
function database(subject='owner|session'){
 const tables={authSessions:[{_id:'session',userId:'owner',expirationTime:Date.now()+60000}],adminSettings:[{_id:'settings',key:'owner',userId:'owner'}],hermesTraining:[]};
 const ctx={auth:{getUserIdentity:async()=>subject?{subject}:null},db:{get:async(t,id)=>tables[t].find(x=>x._id===id)||null,insert:async(t,doc)=>{tables[t].push({...doc,_id:`${t}-${tables[t].length}`});},patch:async(t,id,p)=>Object.assign(tables[t].find(x=>x._id===id),p),query(t){let checks=[],reverse=false;const b={eq(k,v){checks.push([k,v]);return b;}},rows=()=>{const r=tables[t].filter(x=>checks.every(([k,v])=>x[k]===v));return reverse?r.reverse():r;};const q={withIndex(_n,cb){cb?.(b);return q;},order(){reverse=true;return q;},first:async()=>rows()[0]||null,take:async n=>rows().slice(0,n)};return q;}}};return {ctx,tables};
}
test('only the signed-in owner can read, save, preview or suggest training',async()=>{
 for(const identity of [null,'other|session']){const {ctx}=database(identity);for(const name of ['current','history','reserve'])await assert.rejects(trainer[name]._handler(ctx,{}));await assert.rejects(trainer.save._handler(ctx,{settings:rules.defaultTraining,revision:0}));await assert.rejects(trainer.previewContext._handler(ctx,{}));}
});
test('publishing keeps old versions and refuses to overwrite a newer host edit',async()=>{
 const {ctx,tables}=database();assert.equal((await trainer.current._handler(ctx,{})).revision,0);
 const first=await trainer.save._handler(ctx,{settings:rules.defaultTraining,revision:0});assert.equal(first.revision,1);
 await assert.rejects(trainer.save._handler(ctx,{settings:rules.defaultTraining,revision:0}),/another window/);
 const next={...rules.defaultTraining,styleGuide:'Speak warmly in Hindi.'};await trainer.save._handler(ctx,{settings:next,revision:1});
 assert.equal((await trainer.current._handler(ctx,{})).settings.styleGuide,next.styleGuide);assert.equal(tables.hermesTraining.length,2);
 assert.deepEqual((await trainer.history._handler(ctx,{})).map(h=>h.revision),[2,1]);
 await assert.rejects(trainer.save._handler(ctx,{settings:{...next,styleGuide:' '},revision:2}));
});
test('paid trainer calls are bounded to sixty per owner per hour',async()=>{const {ctx,tables}=database();for(let i=0;i<60;i++)await trainer.reserve._handler(ctx,{});await assert.rejects(trainer.reserve._handler(ctx,{}),/60 trainer/);tables.adminSettings[0].trainerWindowStart=0;await trainer.reserve._handler(ctx,{});assert.equal(tables.adminSettings[0].trainerUses,1);});
test('reminders request only missing document groups for the correct guest',()=>{
 const state={run:{complete:false,paused:false,replyReminderSent:false,lastReminderAt:Date.now(),requirements:[['pan'],['aadhaar','passport']]},guests:[{name:'Mohit',complete:true,documents:[]},{name:'Priya',complete:false,documents:[{type:'pan',status:'passed'}]}]};
 const text=precheck.reminderMessage(state,Date.now());assert.match(text,/Aadhaar or passport for Priya/);assert.doesNotMatch(text,/share PAN|for Mohit/);
 state.run.replyReminderSent=true;assert.equal(precheck.reminderMessage(state,Date.now()),null);assert.ok(precheck.reminderMessage(state,Date.now(),'every_answer'));
 for(const patch of [{paused:true},{complete:true}])assert.equal(precheck.reminderMessage({...state,run:{...state.run,...patch}},Date.now(),'every_answer'),null);
});
