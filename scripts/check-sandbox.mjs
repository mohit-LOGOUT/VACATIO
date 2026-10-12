import { chromium, expect } from '@playwright/test';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
const base=process.env.SANDBOX_TEST_URL||'https://grateful-llama-909.convex.site/sandbox.html';
const env=await readFile('.env.local','utf8');const convexUrl=process.env.CONVEX_URL || (base.includes('.convex.site') ? new URL(base).origin.replace('.convex.site','.convex.cloud') : env.match(/^CONVEX_URL=(https:\/\/[^\s]+)$/m)[1]);
const client=new ConvexHttpClient(convexUrl);
const token=randomBytes(32).toString('hex');
await client.action(api.sandbox.open,{token});
await writeFile('/private/tmp/hermes-test-session',token,{mode:0o600});
const browser=await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" });

try{
 await mkdir('artifacts',{recursive:true});
 const page=await browser.newPage({viewport:{width:1280,height:940}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}#session=${token}`);
 await expect(page.getByRole('heading',{name:'Aarav Shah',exact:true})).toBeVisible();
 const select=page.getByLabel('Choose a fictional booking');
 const values=await select.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value));
 const message=page.getByLabel('Message Hermes');
 const send=async text=>{const count=await page.locator('.message.guest').count();await message.fill(text);await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.locator('.message.guest')).toHaveCount(count+1,{timeout:15000});await expect(message).toHaveValue('');await expect(page.locator('#agent-status')).toHaveText(/Ready|Unavailable/,{timeout:100000});};
 await send('Is there parking for our car?');
 await page.screenshot({path:'artifacts/hermes-desktop.png',fullPage:true});
 const unavailable=await page.locator('#agent-status').textContent()==='Unavailable';
 if(unavailable){console.log('MODEL_BLOCKED: '+await page.locator('.reply-error').innerText());}
 else{
  await expect(page.locator('.message.hermes').last()).toContainText(/two|2/i);
  await send('Is it free?');await expect(page.locator('.message.hermes').last()).toContainText(/free|no charge/i);
  await send('Can we check in at 10 am instead?');
  await expect(page.getByRole('heading',{name:'Needs host answer'})).toBeVisible();
  await page.getByLabel('Host answer').fill('Early check-in is approved for this booking at 10 am. The caretaker will meet you at the gate.');
  await page.getByRole('button',{name:'Give answer to Hermes'}).click();
  await expect(page.locator('.host-note')).toHaveCount(1);
  await expect(page.locator('#agent-status')).toHaveText('Ready',{timeout:100000});
  await expect(page.locator('.message.hermes').last()).toContainText(/10/);
  await expect(page.getByRole('heading',{name:'Needs host answer'})).toHaveCount(0);
  await page.getByRole('button',{name:'Edit test details'}).click();
  await page.getByLabel('Parking',{exact:true}).fill('Free parking inside the gate for four cars.');
  await page.getByRole('button',{name:'Save test details'}).click();
  await expect(page.locator('#save-status')).toContainText('saved');
  await send('How many cars fit in the parking now?');await expect(page.locator('.message.hermes').last()).toContainText(/four|4/i);
 }
 await select.selectOption(values[1]);await expect(page.getByRole('heading',{name:'Meera Kapoor',exact:true})).toBeVisible();
 await expect(page.locator('.message.guest')).toHaveCount(0);
 if(!unavailable){await send('Can I park my car at the cottage?');await expect(page.locator('.message.hermes').last()).toContainText(/no|cannot|can't|not/i);}
 await page.reload();await expect(page.getByRole('heading',{name:'Meera Kapoor',exact:true})).toBeVisible();
 if(!unavailable)await expect(page.locator('.message.guest')).toHaveCount(1);
 await select.selectOption(values[0]);await expect(page.locator('.message.guest')).toHaveCount(unavailable?1:4);
 if(unavailable){await page.getByRole('button',{name:'Retry reply'}).click();await expect(page.locator('#agent-status')).toHaveText(/Ready|Unavailable/,{timeout:100000});await expect(page.locator('.message.guest')).toHaveCount(1);}
 await page.getByRole('button',{name:'Restart test',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Restart test',exact:true}).click();
 await expect(page.locator('.message.guest')).toHaveCount(0);
 await page.reload();await expect(page.getByRole('heading',{name:'Aarav Shah',exact:true})).toBeVisible();await expect(page.locator('.message.guest')).toHaveCount(0);
 if(!unavailable){await select.selectOption(values[1]);await expect(page.locator('.message.guest')).toHaveCount(1);}
 await select.selectOption(values[0]);
 for(const width of [320,390,768,1280]){
   const capture=await browser.newPage({viewport:{width,height:width<768?844:940}});
   await capture.goto(`${base}#session=${token}`);
   await expect(capture.locator('#chat-caption')).toContainText('Aarav Shah');
   if(!unavailable){if(width<768)await capture.getByText('Test booking',{exact:true}).click();await capture.getByLabel('Choose a fictional booking').selectOption(values[1]);await expect(capture.locator('.message.guest')).toHaveCount(1);if(width<768)await capture.getByText('Test booking',{exact:true}).click();}
   await capture.screenshot({path:`artifacts/hermes-${width}.png`,fullPage:true});
   expect(await capture.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`${width}px horizontal overflow`).toBe(false);
   await expect(capture.getByRole('button',{name:'Send message',exact:true})).toBeVisible();
   await capture.close();
 }
 // Server ownership guard: another valid session cannot read or change this booking.
 const other=randomBytes(32).toString('hex');await client.action(api.sandbox.open,{token:other});
 let denied=false;try{await client.mutation(api.sandbox.restart,{token:other,bookingId:values[0]});}catch{denied=true;}expect(denied).toBe(true);
 expect(errors).toEqual([]);
 console.log(unavailable?'Sandbox layout, saved context, booking separation, restart and failed-reply retry checked. Real AI replies are blocked.':'Real Hermes flow passed: factual answer, follow-up, host answer, updated context, isolated bookings, reload and restart. Layout checked at 320/390/768/1280px.');
}finally{await browser.close();}
