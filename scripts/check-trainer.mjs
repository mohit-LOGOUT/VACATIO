import {chromium,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {ConvexHttpClient} from 'convex/browser';
import {anyApi as api} from 'convex/server';
import assert from 'node:assert/strict';
const prod=process.argv.includes('--prod'),base=prod?'https://grateful-llama-909.convex.site':'http://localhost:5173',url=prod?'https://grateful-llama-909.convex.cloud':'https://terrific-peccary-989.convex.cloud';
const creds=JSON.parse(await readFile(`/private/tmp/hermes-admin-${prod?'prod':'dev'}.json`,'utf8')),client=new ConvexHttpClient(url),anon=new ConvexHttpClient(url);
const signed=await client.action(api.auth.signIn,{provider:'password',params:{flow:'signIn',email:creds.id,password:creds.password}});client.setAuth(signed.tokens.token);
const original=await client.query(api.trainer.current,{});let changed=false;
const browser=await chromium.launch({channel:'chrome'});await mkdir('artifacts',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/admin.html#train-hermes');await page.getByLabel('Admin ID',{exact:true}).fill(creds.id);await page.getByLabel('Password',{exact:true}).fill(creds.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 const panel=page.locator('#train-hermes');await expect(panel.getByRole('heading',{name:'Train Hermes',exact:true})).toBeVisible({timeout:30000});
 await panel.getByLabel('What should Hermes do differently?').fill('Please be a warm and helpful hotel receptionist. Answer check-in questions with the saved time and entry instructions. Offer help and keep ID reminders separate and gentle. Do not invent facts.');
 await panel.getByRole('button',{name:'Suggest a change',exact:true}).click();await expect(panel.getByRole('status')).toContainText('draft until you save',{timeout:90000});
 assert.equal((await client.query(api.trainer.current,{})).revision,original.revision,'Suggestion must not publish');
 await panel.getByRole('button',{name:'Preview Hermes reply',exact:true}).click();await expect(panel.locator('.trainer-bubble')).toHaveCount(2,{timeout:90000});
 await expect(panel.locator('.trainer-bubble').first()).toContainText(/3(?::00)?\s*(?:p\.?m\.?|PM)|15:00/i);await expect(panel.locator('.trainer-bubble').first()).toContainText(/caretaker|main gate/i);await expect(panel.locator('.trainer-bubble').nth(1)).toContainText('Aadhaar or PAN or passport for Aarav Shah');
 await panel.getByLabel('Preview guest progress').selectOption('third_guest');await panel.getByRole('button',{name:'Preview Hermes reply',exact:true}).click();await expect(panel.locator('.trainer-bubble')).toHaveCount(2,{timeout:90000});await expect(panel.locator('.trainer-bubble').nth(1)).toContainText('for Dev Patel');
 await panel.getByLabel('Preview guest progress').selectOption('complete');await panel.getByRole('button',{name:'Preview Hermes reply',exact:true}).click();await expect(panel.locator('.trainer-bubble')).toHaveCount(1,{timeout:90000});await expect(panel.locator('.trainer-bubble')).not.toContainText('using the ID checklist');
 console.log('PASS: real trainer suggestion, grounded preview, correct third-guest follow-up and no completed-guest reminder; drafts stay private.');
 await panel.getByLabel('Speaking guidance').fill('Be a warm, attentive hotel receptionist. Start your answer with the exact phrase "Happy to help!" Then answer fully using saved facts.');await panel.getByRole('button',{name:'Save for Hermes',exact:true}).click();changed=true;await expect(panel.getByRole('status').filter({hasText:'Saved version'})).toContainText('Saved version',{timeout:30000});
 await page.reload();await expect(panel.getByLabel('Speaking guidance')).toHaveValue(/Happy to help!/, {timeout:30000});
 const saved=await client.query(api.trainer.current,{});assert.equal(saved.revision,original.revision+1);await assert.rejects(client.mutation(api.trainer.save,{settings:original.settings,revision:original.revision}),/another window/);
 const guest=await browser.newPage({viewport:{width:1440,height:1000}});await guest.goto(base+'/sandbox.html');await expect(guest.locator('.guest-check')).toHaveCount(3,{timeout:30000});await guest.locator('#message-input').fill('What time is check-in?');await guest.getByRole('button',{name:'Send message',exact:true}).click();
 const token=await guest.evaluate(()=>localStorage.getItem('hermes-session'));await expect.poll(async()=>{const rows=await anon.query(api.sandbox.state,{token});return rows[0].turns.at(-1)?.status;},{timeout:100000}).toBe('complete');
 const rows=await anon.query(api.sandbox.state,{token}),turn=rows[0].turns.at(-1);assert.equal(turn.replies.length,2);assert.match(turn.replies[0],/Happy to help!/);assert.match(turn.replies[0],/caretaker|main gate/i);assert.match(turn.replies[1],/Aadhaar or PAN or passport for Aarav Shah/);
 await expect(guest.locator('#messages')).toContainText('Happy to help!');await guest.screenshot({path:`artifacts/trainer-${prod?'prod':'dev'}-guest.png`,fullPage:true});
 await expect(panel.getByRole('button',{name:'Use default draft',exact:true})).toBeEnabled();await panel.scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/trainer-${prod?'prod':'dev'}-desktop.png`,fullPage:true});await panel.screenshot({path:`artifacts/trainer-${prod?'prod':'dev'}-panel.png`});
 for(const width of [320,390,768]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`artifacts/trainer-${prod?'prod':'dev'}-${width}.png`,fullPage:true});}
 await assert.rejects(anon.query(api.trainer.current,{}));await assert.rejects(anon.mutation(api.trainer.save,{settings:saved.settings,revision:saved.revision}));await assert.rejects(anon.action(api.trainerAI.suggest,{settings:saved.settings,feedback:'Change the tone'}));await assert.rejects(anon.action(api.trainerAI.preview,{settings:saved.settings,question:'Check in?',scenario:'pending'}));
 assert.deepEqual(errors,[]);console.log('PASS: saved guidance survives reload and controls the real guest reply; immediate separate ID reminder; stale saves and anonymous trainer access rejected; mobile layouts fit.');
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByRole('heading',{name:'Admin sign in',exact:true})).toBeVisible();
}finally{
 if(changed){const latest=await client.query(api.trainer.current,{});if(latest.revision===original.revision+1)await client.mutation(api.trainer.save,{settings:original.settings,revision:latest.revision});else throw new Error('Training changed during test; preserved the latest host version instead of overwriting it.');}
 await client.action(api.auth.signOut,{});await browser.close();
}
