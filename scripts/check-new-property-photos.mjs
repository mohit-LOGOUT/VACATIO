import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {ConvexHttpClient} from 'convex/browser';
import {anyApi as api} from 'convex/server';
const rowsResult=spawnSync('npx',['convex','data','properties','--prod','--limit','25','--format','json'],{encoding:'utf8'});
assert.equal(rowsResult.status,0,'Production source list is readable through owner CLI');
const candidates=JSON.parse(rowsResult.stdout).filter(p=>p.sourceUrl?.includes('airbnb.com/rooms/'));
const creds=JSON.parse(await readFile('/private/tmp/hermes-admin-dev.json','utf8'));
const client=new ConvexHttpClient('https://terrific-peccary-989.convex.cloud');
const signed=await client.action(api.auth.signIn,{provider:'password',params:{flow:'signIn',email:creds.id,password:creds.password}});client.setAuth(signed.tokens.token);
try {
 const existing=await client.query(api.admin.list,{paginationOpts:{numItems:25,cursor:null}});
 const source=candidates.find(p=>!existing.page.some(d=>d.sourceUrl===p.sourceUrl));
 assert.ok(source,'A saved production listing is not yet present in development');
 const result=await client.mutation(api.admin.importListing,{url:source.sourceUrl});assert.ok(result.jobId);assert.ok(!result.propertyId,'This is a fresh import, not a duplicate');
 let job;
 for(let attempt=0;attempt<120;attempt++){
  const jobs=await client.query(api.admin.imports,{});job=jobs.find(j=>j._id===result.jobId);
  if(job?.status==='complete'||job?.status==='failed')break;
  await new Promise(r=>setTimeout(r,2000));
 }
 assert.equal(job?.status,'complete',job?.error||'Fresh import must complete');assert.ok(job.propertyId);
 const property=await client.query(api.admin.detail,{id:job.propertyId});assert.ok(property.name);assert.ok(property.description);assert.ok(property.address);
 assert.ok(property.photos.length>0);assert.ok(property.photos.length<=12);assert.match(property.photoImportStatus,/ready|partial/);
 for(const photo of property.photos){const response=await fetch(photo.url);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^image\/(jpeg|png|webp)/);assert.ok((await response.arrayBuffer()).byteLength>0);}
 console.log(`PASS: fresh listing '${property.name}' imported its saved facts and ${property.photos.length} real photos automatically; stored image URLs load.`);
} finally {await client.action(api.auth.signOut,{});}
