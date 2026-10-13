import {chromium,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {ConvexHttpClient} from 'convex/browser';
import {anyApi as api} from 'convex/server';
import assert from 'node:assert/strict';
const creds=JSON.parse(await readFile('/private/tmp/hermes-admin-dev.json','utf8'));
const client=new ConvexHttpClient('https://terrific-peccary-989.convex.cloud');
await assert.rejects(client.mutation(api.admin.importPhotos,{id:'not-a-valid-id'}));
const signed=await client.action(api.auth.signIn,{provider:'password',params:{flow:'signIn',email:creds.id,password:creds.password}});client.setAuth(signed.tokens.token);
const list=await client.query(api.admin.list,{paginationOpts:{numItems:25,cursor:null}});
const property=list.page.find(p=>p.sourceUrl==='https://www.airbnb.com/rooms/1783537665165795948');assert.ok(property,'Saved Airbnb test property exists');
const original=await client.query(api.admin.detail,{id:property._id});
const browser=await chromium.launch({channel:'chrome'});await mkdir('.impeccable/review',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/admin.html');await page.getByLabel('Admin ID',{exact:true}).fill(creds.id);await page.getByLabel('Password',{exact:true}).fill(creds.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 const card=page.locator('.property-card').filter({hasText:/Aum.*Aura/});await expect(card).toBeVisible({timeout:30000});
 if(!(original.photos||[]).length)await card.getByRole('button',{name:'Import photos',exact:true}).click();
 await expect.poll(async()=>{const p=await client.query(api.admin.detail,{id:property._id});return p.photoImportStatus;},{timeout:180000}).toMatch(/ready|partial/);
 await expect(card.locator('img.property-cover')).toBeVisible();await expect.poll(()=>card.locator('img.property-cover').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 const after=await client.query(api.admin.detail,{id:property._id});assert.ok(after.photos.length>0);assert.ok(after.photos.length<=12);
 for(const photo of after.photos){assert.ok(photo.fileId);assert.ok(photo.url.startsWith('https://'));assert.ok(!photo.url.includes('muscache.com'));}
 for(const key of ['name','address','notes','entryInstructions','revision'])assert.deepEqual(after[key],original[key],`Photo import keeps ${key}`);
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'.impeccable/review/photos-list-1280.png',fullPage:true});
 await card.getByRole('button',{name:'Edit property',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Listing photos',exact:true})).toBeVisible();await expect(page.locator('.property-gallery img')).toHaveCount(after.photos.length);
 for(const image of await page.locator('.property-gallery img').all())await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 const ids=after.photos.map(p=>p.fileId),previousPhotoJob=after.photoImportJobId;
 await page.getByRole('button',{name:'Refresh photos',exact:true}).click();await expect(page.getByRole('button',{name:'Importing photos…',exact:true})).toBeVisible();
 await expect.poll(async()=>{const p=await client.query(api.admin.detail,{id:property._id});return p.photoImportJobId;},{timeout:30000}).not.toBe(previousPhotoJob);
 await expect.poll(async()=>{const p=await client.query(api.admin.detail,{id:property._id});return p.photoImportStatus;},{timeout:180000}).toMatch(/ready|partial/);
 const refreshed=await client.query(api.admin.detail,{id:property._id});assert.deepEqual(refreshed.photos.map(p=>p.fileId),ids,'Refresh reuses saved images instead of duplicating storage');
 await page.reload();await page.locator('.property-link').filter({hasText:/Aum.*Aura/}).click();await expect(page.locator('.property-gallery img')).toHaveCount(ids.length);
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`.impeccable/review/photos-detail-${width}.png`,fullPage:true});}
 await page.getByRole('button',{name:'Back to properties',exact:true}).click();await page.setViewportSize({width:390,height:900});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'.impeccable/review/photos-list-390.png',fullPage:true});await page.screenshot({path:'.impeccable/review/photos-list-mobile-viewport.png'});
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByRole('heading',{name:'Admin sign in',exact:true})).toBeVisible();
 const anonymous=new ConvexHttpClient('https://terrific-peccary-989.convex.cloud');await assert.rejects(anonymous.mutation(api.admin.importPhotos,{id:property._id}));await assert.rejects(anonymous.query(api.admin.detail,{id:property._id}));
 assert.deepEqual(errors,[]);console.log(`PASS: ${ids.length} real Airbnb photos saved in our storage; cover and gallery load; refresh deduplicates; edits unchanged; reload, phone/tablet layout and access protection work.`);
} finally {await client.action(api.auth.signOut,{});await browser.close();}
