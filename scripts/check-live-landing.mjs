import { chromium,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const token=await readFile('/private/tmp/hermes-test-session','utf8');
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:940}});
 await page.goto(`https://grateful-llama-909.convex.site/#session=${token}`);
 const chat=page.frameLocator('#sandbox-frame');
 await expect(chat.locator('#chat-context')).toContainText('Aarav Shah');
 await expect(page.locator('.hero-image')).toBeVisible();
 await page.getByRole('link',{name:'Try with a booking'}).click();
 await expect(page).toHaveURL(/#test-hermes$/);
 const previous=await chat.locator('.message.guest').count();
 await chat.getByLabel('Message Hermes').fill('Where do we collect the keys?');
 await chat.getByRole('button',{name:'Send message',exact:true}).click();
 await expect(chat.locator('.message.guest')).toHaveCount(previous+1);
 await expect(chat.locator('#agent-status')).toHaveText('Ready',{timeout:100000});
 await expect(chat.locator('.message.hermes').last()).toContainText(/caretaker|gate/i);
 await page.screenshot({path:'artifacts/hermes-live-landing-desktop.png',fullPage:true});
 for(const width of [320,390,768]){
   const phone=await browser.newPage({viewport:{width,height:844}});
   await phone.goto(`https://grateful-llama-909.convex.site/#session=${token}`);
   const frame=phone.frameLocator('#sandbox-frame');
   if(width<830)await expect(frame.locator('#chat-context')).toBeVisible();
   await expect(frame.locator('.message.guest')).toHaveCount(previous+1);
   await expect(frame.getByRole('button',{name:'Send message',exact:true})).toBeVisible();
   expect(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
   expect(await phone.locator('#sandbox-frame').evaluate(f=>f.contentDocument.documentElement.scrollWidth>f.contentWindow.innerWidth)).toBe(false);
   await phone.screenshot({path:`artifacts/hermes-live-landing-${width}.png`,fullPage:true});
   await phone.close();
 }
 console.log('Published landing banner, scroll button, embedded real Hermes reply and 320/390/768px responsive layout passed on grateful-llama-909.convex.site.');
}finally{await browser.close();}
