import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { createHash } from 'node:crypto';
const load = async file => { const r=buildSync({entryPoints:[file],bundle:true,platform:'node',format:'esm',write:false});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64')); };
const sandbox=await load('convex/sandbox.ts'), rules=await load('convex/sandboxRules.ts');
const token='a'.repeat(64), hash=createHash('sha256').update(token).digest('hex');
test('any visitor can start testing with only an automatically generated session token',async()=>{
 let initialized;
 assert.equal(await sandbox.open._handler({runMutation:async(_ref,args)=>{initialized=args;}},{token}),null);
 assert.deepEqual(initialized,{hash});
});
test('returning visitors keep their fictional bookings when their session is renewed',async()=>{
 const {ctx,tables}=database();tables.sandboxSessions[0].expiresAt=0;
 await sandbox.initialize._handler(ctx,{hash});
 assert.ok(tables.sandboxSessions[0].expiresAt>Date.now());
 assert.equal(tables.sandboxBookings.length,1);
 assert.equal(tables.sandboxBookings[0].threadId,'thread');
});
function database(){
 const tables={sandboxSessions:[{_id:'owner',tokenHash:hash,expiresAt:Date.now()+100000,usage:0,windowStart:Date.now()}],sandboxBookings:[{_id:'booking',sessionId:'owner',context:rules.samples[0],generation:0,threadId:'thread'}],sandboxTurns:[]};
 const db={get:async(table,id)=>tables[table].find(x=>x._id===id)||null,patch:async(table,id,fields)=>Object.assign(tables[table].find(x=>x._id===id),fields),query(table){const checks=[];const builder={eq(k,value){checks.push([k,value]);return builder;}};const rows=()=>tables[table].filter(x=>checks.every(([k,value])=>x[k]===value));return {withIndex(_name,cb){cb(builder);return {first:async()=>rows()[0]||null,take:async n=>rows().slice(0,n)};}};}};
 return {tables,ctx:{db}};
}
test('sandbox refuses invalid dates and guest counts while permitting unknown optional facts',()=>{
 for(const patch of [{guestCount:0},{guestCount:1.5},{departureDate:'2026-10-01'},{arrivalDate:'2026-02-30'},{checkInTime:'25:00'}])assert.throws(()=>rules.validateContext({...rules.samples[0],...patch}));
 assert.doesNotThrow(()=>rules.validateContext({...rules.samples[0],parking:'',directions:''}));
});
test('sandbox rejects absent sessions and booking access belonging to another owner',async()=>{
 const {ctx,tables}=database();
 await assert.rejects(sandbox.state._handler(ctx,{token:'b'.repeat(64)}),/session has expired/);
 tables.sandboxBookings[0].sessionId='other';
 await assert.rejects(sandbox.edit._handler(ctx,{token,bookingId:'booking',context:rules.samples[0]}),/not in your sandbox/);
 await assert.rejects(sandbox.send._handler(ctx,{token,bookingId:'booking',text:'parking?',requestId:'valid-request-id-123'}),/not in your sandbox/);
});
test('repeated send acknowledgement returns the original turn without new writes or model calls',async()=>{
 const {ctx,tables}=database();tables.sandboxTurns.push({_id:'turn',bookingId:'booking',requestId:'valid-request-id-123'});
 assert.equal(await sandbox.send._handler(ctx,{token,bookingId:'booking',requestId:'valid-request-id-123',text:'parking?'}),'turn');assert.equal(tables.sandboxSessions[0].usage,0);
});
test('late model completions cannot overwrite retries or restarted conversations',async()=>{
 const {ctx,tables}=database();tables.sandboxTurns.push({_id:'turn',bookingId:'booking',generation:0,attempt:2,status:'replying'});
 await sandbox.finish._handler(ctx,{turnId:'turn',attempt:1,reply:'Old reply'});assert.equal(tables.sandboxTurns[0].status,'replying');
 tables.sandboxBookings[0].generation=1;
 await sandbox.finish._handler(ctx,{turnId:'turn',attempt:2,reply:'Old conversation reply'});assert.equal(tables.sandboxTurns[0].reply,undefined);
});
test('timed-out attempts unlock their booking once and ignore an older watchdog',async()=>{
 const {ctx,tables}=database();tables.sandboxBookings[0].busyTurnId='turn';tables.sandboxTurns.push({_id:'turn',bookingId:'booking',generation:0,attempt:2,status:'replying'});
 await sandbox.timeout._handler(ctx,{turnId:'turn',attempt:1});assert.equal(tables.sandboxBookings[0].busyTurnId,'turn');
 await sandbox.timeout._handler(ctx,{turnId:'turn',attempt:2});assert.equal(tables.sandboxTurns[0].status,'failed');assert.equal(tables.sandboxBookings[0].busyTurnId,undefined);
});
