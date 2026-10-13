import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
await mkdir('artifacts/test-modules',{recursive:true});
const out='artifacts/test-modules/propertyPhotos.mjs';buildSync({entryPoints:['convex/propertyPhotos.ts'],bundle:true,packages:'external',platform:'node',format:'esm',outfile:out});
const photos=await import(pathToFileURL(`${process.cwd()}/${out}`));
const source='https://www.airbnb.com/rooms/123';
const image=(id,n)=>`https://a0.muscache.com/im/pictures/hosting/Hosting-${id}/original/${n}.jpeg`;
const page=data=>`<html><script type="application/json">${JSON.stringify(data)}</script></html>`;
test('Airbnb extraction takes bounded own-property gallery originals, never host/review/recommendation images',()=>{
 const data={sections:[{section:{__typename:'PhotoTourModalSection',mediaItems:[{baseUrl:image(123,1)},{baseUrl:image(123,1)+'?im_w=720&quality=70'},{baseUrl:image(999,2)},{baseUrl:'https://a0.muscache.com/im/pictures/user/avatar.jpeg'},...Array.from({length:20},(_,i)=>({baseUrl:image(123,i+3)}))]}},{section:{__typename:'HostProfile',baseUrl:image(123,44)}},{section:{__typename:'Review',baseUrl:image(123,45)}}]};
 const found=photos.listingPhotos(page(data),source);assert.equal(found.length,12);assert.equal(found[0],image(123,1));assert.ok(!found.includes(image(999,2)));assert.ok(!found.includes(image(123,44)));
});
test('nested stringified Airbnb data and meta fallback are handled; generic unrelated img tags are ignored',()=>{
 assert.deepEqual(photos.listingPhotos(page({data:JSON.stringify({__typename:'PhotoTourModalSection',mediaItems:[{baseUrl:image(123,1)}]})}),source),[image(123,1)]);
 assert.deepEqual(photos.listingPhotos(`<meta property="og:image" content="${image(123,1)}?im_w=720"><img src="${image(999,2)}">`,source),[image(123,1)]);
 assert.deepEqual(photos.listingPhotos('<script type="application/ld+json">{"@type":"VacationRental","image":["https://example.com/house.jpg"]}</script>','https://example.com/listing'),['https://example.com/house.jpg']);
});
test('unsafe image URLs and DNS/redirect destination addresses stay blocked',async()=>{
 for(const url of ['file:///etc/passwd','https://localhost/photo.jpg','https://x.internal/a','http://user:password@example.com/a','https://example.com:8000/a'])assert.throws(()=>photos.photoUrl(url));
 await assert.rejects(photos.downloadPhoto('http://127.0.0.1/photo.jpg'),/not public/);
 await assert.rejects(photos.downloadPhoto('http://169.254.169.254/photo.jpg'),/not public/);
});
test('photos need a supported MIME and matching signature; HTML, SVG and oversized files are refused',()=>{
 assert.equal(photos.validImage(Buffer.from([255,216,255,0]),'image/jpeg'),'image/jpeg');
 assert.equal(photos.validImage(Buffer.from([137,80,78,71,13,10,26,10]),'image/png'),'image/png');
 assert.equal(photos.validImage(Buffer.from('RIFF1234WEBP'),'image/webp'),'image/webp');
 for(const [b,t]of [[Buffer.from('<html>'),'image/jpeg'],[Buffer.from('<svg>'),'image/svg+xml'],[Buffer.alloc(5_000_001),'image/png'],[Buffer.from([255,216,255]),'text/html']])assert.throws(()=>photos.validImage(b,t));
});
const adminOut='artifacts/test-modules/photoAdmin.mjs';buildSync({entryPoints:['convex/admin.ts'],bundle:true,packages:'external',platform:'node',format:'esm',outfile:adminOut});const admin=await import(pathToFileURL(`${process.cwd()}/${adminOut}`));
function state(){const property={_id:'property',name:'Host edited title',address:'Host edited address',revision:9,photoImportJobId:'job',photos:[]},job={_id:'job',status:'importing_photos'},deleted=[];return{property,job,deleted,ctx:{db:{get:async(t)=>t==='properties'?property:job,patch:async(t,_id,p)=>Object.assign(t==='properties'?property:job,p)},storage:{delete:async id=>deleted.push(id)}}};}
test('photo attachment deduplicates concurrent completions and deletes stale files without changing host facts',async()=>{const s=state(),args={id:'property',jobId:'job',sourceUrl:image(123,1),fileId:'first'};await admin.attachPhoto._handler(s.ctx,args);await admin.attachPhoto._handler(s.ctx,args);await admin.attachPhoto._handler(s.ctx,{...args,fileId:'duplicate'});await admin.attachPhoto._handler(s.ctx,{...args,jobId:'older',fileId:'stale'});assert.equal(s.property.photos.length,1);assert.deepEqual(s.deleted,['duplicate','stale']);assert.equal(s.property.name,'Host edited title');assert.equal(s.property.revision,9);assert.equal(await admin.photoNeeded._handler(s.ctx,args),false);});
test('partial and failed photo outcomes preserve text; cleanup never deletes an attached file after uncertain acknowledgement',async()=>{const s=state();s.property.photos=[{fileId:'saved',sourceUrl:image(123,1)}];await admin.discardUnattachedPhoto._handler(s.ctx,{id:'property',fileId:'saved'});assert.deepEqual(s.deleted,[]);await admin.finishPhotos._handler(s.ctx,{id:'property',jobId:'job',failed:1,candidates:2});assert.equal(s.property.photoImportStatus,'partial');assert.equal(s.property.address,'Host edited address');s.property.photos=[];await admin.finishPhotos._handler(s.ctx,{id:'property',jobId:'job',failed:2,candidates:2});assert.equal(s.property.photoImportStatus,'failed');await admin.finishPhotos._handler(s.ctx,{id:'property',jobId:'job',failed:0,candidates:0});assert.equal(s.property.photoImportStatus,'unavailable');});
test('public photo import denies signed-out callers before property access',async()=>{let read=false;await assert.rejects(admin.importPhotos._handler({auth:{getUserIdentity:async()=>null},db:{get:async()=>{read=true;return null;}}},{id:'property'}),/Sign in/);assert.equal(read,false);});
