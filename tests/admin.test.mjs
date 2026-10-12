import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import {writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
await mkdir('artifacts/test-modules',{recursive:true});
async function load(name){const out=`artifacts/test-modules/${name}.mjs`;buildSync({entryPoints:[`convex/${name}.ts`],bundle:true,packages:'external',platform:'node',format:'esm',outfile:out});return import(pathToFileURL(`${process.cwd()}/${out}`));}
const rules=await load('adminRules'),access=await load('adminAccess'),reader=await load('listingReader'),fields=await load('propertyFields');
test('admin provider rejects public registration and accepts only ID/password sign-in',()=>{
 assert.throws(()=>rules.adminProfile({flow:'signUp',email:'owner',password:'long-test-password'}),/Public registration/);
 assert.throws(()=>rules.adminProfile({flow:'reset',email:'owner'}),/Public registration/);
 assert.deepEqual(rules.adminProfile({flow:'signIn',email:' OWNER '}),{email:'owner'});
});
test('property access requires the configured owner and an unexpired, non-revoked session',async()=>{
 let subject=null,session={userId:'owner',expirationTime:Date.now()+60000},settings={userId:'owner'};
 const ctx={auth:{getUserIdentity:async()=>subject?{subject}:null},db:{get:async()=>session,query:()=>({withIndex:()=>({first:async()=>settings})})}};
 await assert.rejects(access.requireAdmin(ctx),/Sign in/);
 subject='other|session';await assert.rejects(access.requireAdmin(ctx),/Admin access/);
 subject='owner|session';assert.equal(await access.requireAdmin(ctx),'owner');
 settings.expiresAt=0;await assert.rejects(access.requireAdmin(ctx),/Admin access/);delete settings.expiresAt;
 session=null;await assert.rejects(access.requireAdmin(ctx),/Admin access/);
});
test('listing links normalize Airbnb dates and tracking without merging different properties',()=>{
 assert.equal(rules.listingUrl('https://www.airbnb.co.in/rooms/1783537665165795948?check_in=2026-11-20&photo_id=123'),'https://www.airbnb.com/rooms/1783537665165795948');
 assert.notEqual(rules.listingUrl('https://www.airbnb.com/rooms/123'),rules.listingUrl('https://www.airbnb.com/rooms/456'));
 for(const url of ['file:///etc/passwd','http://localhost/x','http://user:password@example.com','https://example.com:9000'])assert.throws(()=>rules.listingUrl(url));
});
test('import reader rejects private, loopback, metadata and mapped private IP addresses',()=>{
 for(const address of ['127.0.0.1','10.1.2.3','172.16.2.1','192.168.1.1','169.254.169.254','0.0.0.0','::1','::ffff:127.0.0.1','fc00::1','fe80::1'])assert.equal(reader.publicAddress(address),false,address);
 assert.equal(reader.publicAddress('8.8.8.8'),true);
});
test('listing parsing retains embedded amenities and marks unavailable amenities rather than inventing availability',()=>{
 const text=reader.listingText('<html><title>Fictional test cottage</title><body>A fictional cottage listing for testing parsing. This property has its own detailed description and space for guests to relax.<script type="application/json">{"title":"Cottage details","amenities":[{"title":"Wifi","available":true},{"title":"Pool","available":false}],"htmlText":"Check-in after 15:00. Two bedrooms. A private patio overlooks the garden."}</script></body></html>');
 assert.match(text,/Wifi/);assert.match(text,/Not available: Pool/);assert.match(text,/Check-in after 15:00/);
});
test('missing arrival facts remain unknown and invalid edits are rejected',()=>{
 const p={name:'Test cottage',address:'',checkInTime:'',checkOutTime:'',timeZone:'',entryInstructions:'',houseRules:'',requiredIdTypes:[]};
 assert.doesNotThrow(()=>fields.validateProperty(p));assert.ok(fields.missingFields(p).includes('entryInstructions'));
 assert.throws(()=>fields.validateProperty({...p,guestCapacity:-1}));assert.throws(()=>fields.validateProperty({...p,checkInTime:'25:00'}));
});
