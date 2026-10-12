import { chromium,expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base='https://grateful-llama-909.convex.site/';
const browser=await chromium.launch({channel:'chrome'});
try{
 await mkdir('artifacts',{recursive:true});
 const context=await browser.newContext({viewport:{width:1280,height:940}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await expect(page.locator('.hero-image')).toBeVisible();
 await page.getByRole('link',{name:'Try with a booking'}).click();
 await expect(page).toHaveURL(/#test-hermes$/);
 const chat=page.frameLocator('#sandbox-frame');
 await expect(chat.locator('#workspace')).toBeVisible({timeout:30000});
 await expect(chat.locator('#access-key')).toHaveCount(0);
 const select=chat.getByLabel('Choose a fictional booking');
 await expect(select.locator('option')).toHaveCount(2);
 const values=await select.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value));
 await expect(chat.locator('.message.guest')).toHaveCount(0);
 const send=async text=>{
  const previous=await chat.locator('.message.guest').count();
  await chat.getByLabel('Message Hermes').fill(text);
  await chat.getByRole('button',{name:'Send message',exact:true}).click();
  await expect(chat.locator('.message.guest')).toHaveCount(previous+1,{timeout:15000});
  await expect(chat.getByLabel('Message Hermes')).toHaveValue('');
  await expect(chat.locator('#agent-status')).toHaveText('Ready',{timeout:100000});
 };
 await send('Is parking available for our car?');
 await expect(chat.locator('.message.hermes').last()).toContainText(/two|2/i);
 await select.selectOption(values[1]);
 await expect(chat.locator('.message.guest')).toHaveCount(0);
 await send('Is parking available for our car?');
 await expect(chat.locator('.message.hermes').last()).toContainText(/public|bridge/i);
 await page.reload();
 await expect(chat.locator('#booking-select')).toHaveValue(values[1],{timeout:30000});
 await expect(chat.locator('.message.guest')).toHaveCount(1);
 await select.selectOption(values[0]);
 await expect(chat.locator('.message.guest')).toHaveCount(1);
 await page.screenshot({path:'artifacts/hermes-public-desktop.png',fullPage:true});
 for(const width of [320,390,768]){
  // Each new browser context represents a visitor with no saved session or secret link.
  const phone=await browser.newPage({viewport:{width,height:844}});
  await phone.goto(base+'#test-hermes');
  const frame=phone.frameLocator('#sandbox-frame');
  await expect(frame.locator('#workspace')).toBeVisible({timeout:30000});
  await expect(frame.locator('#chat-context')).toContainText('Aarav Shah');
  await expect(frame.locator('.message.guest')).toHaveCount(0);
  await expect(frame.locator('#access-key')).toHaveCount(0);
  await frame.locator('#booking-panel > summary').click();
  await expect(frame.getByLabel('Choose a fictional booking')).toBeVisible();
  await frame.locator('#booking-panel > summary').click();
  await expect(frame.getByRole('button',{name:'Send message',exact:true})).toBeVisible();
  expect(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(await phone.locator('#sandbox-frame').evaluate(f=>f.contentDocument.documentElement.scrollWidth>f.contentWindow.innerWidth)).toBe(false);
  await phone.screenshot({path:`artifacts/hermes-public-${width}.png`,fullPage:true});
  await phone.close();
 }
 expect(errors).toEqual([]);
 console.log('PASS: public entry without key/form; both fictional stays answer from saved context; reload preserves chats; fresh visitors start clean; 320/390/768px layouts fit.');
}finally{await browser.close();}
