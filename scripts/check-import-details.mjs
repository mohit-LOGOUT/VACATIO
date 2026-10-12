import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {ConvexHttpClient} from 'convex/browser';
import {anyApi as api} from 'convex/server';
const prod=process.argv.includes('--prod'),flags=prod?['--prod']:[];
const creds=JSON.parse(await readFile(`/private/tmp/hermes-admin-${prod?'prod':'dev'}.json`,'utf8'));
const client=new ConvexHttpClient(creds.base.replace('.site','.cloud'));
const signed=await client.action(api.auth.signIn,{provider:'password',params:{flow:'signIn',email:creds.id,password:creds.password}});client.setAuth(signed.tokens.token);
const userId=JSON.parse(Buffer.from(signed.tokens.token.split('.')[1],'base64url').toString()).sub.split('|')[0];
function run(name,args){const r=spawnSync('npx',['convex','run',name,JSON.stringify(args),...flags],{encoding:'utf8',maxBuffer:4e6});if(r.status!==0)throw new Error(`Import verification failed at ${name}: ${r.stderr.slice(0,500)}`);return JSON.parse(r.stdout);}
if(!prod){
 const page=run('propertyImporter:read',{url:'https://www.airbnb.com/rooms/1783537665165795948'});
 const property=run('propertyImporter:extract',{page,userId});assert.match(property.address,/Rishikesh/i);assert.ok(property.amenities.length>25);assert.match(property.parkingDetails,/premises/i);
 const existing=(await client.query(api.admin.list,{paginationOpts:{numItems:25,cursor:null}})).page.find(p=>p.sourceUrl==='https://www.airbnb.com/rooms/1783537665165795948');
 if(existing)await client.mutation(api.admin.save,{id:existing._id,revision:existing.revision??0,property});
 await writeFile('artifacts/airbnb-import-verified.json',JSON.stringify(property,null,2));
 console.log(`PASS: live Airbnb extraction includes Rishikesh and ${property.amenities.length} amenities; corrected the earlier development test record.`);
}
const second='https://www.saffronstays.com/view/saffronstays-boudhi-tree-villa-rishikesh-private-pool-villa-eyETYCpPQ3wJXpsT';
const result=await client.mutation(api.admin.importListing,{url:second});
let propertyId=result.propertyId;
if(!propertyId){for(let i=0;i<60;i++){const job=(await client.query(api.admin.imports,{})).find(j=>j._id===result.jobId);if(job.status==='failed')throw new Error(job.error);if(job.status==='complete'){propertyId=job.propertyId;break;}await new Promise(resolve=>setTimeout(resolve,2000));}}
assert.ok(propertyId,'second listing must complete');
const property=await client.query(api.admin.detail,{id:propertyId});assert.match(property.name,/Boudhi|Bodhi/i);assert.match(property.address,/Rishikesh/i);
await writeFile(`artifacts/second-import-${prod?'prod':'dev'}.json`,JSON.stringify(property,null,2));
console.log('PASS: a real SaffronStays property was imported and saved with its published name and location.');
await client.action(api.auth.signOut,{});
