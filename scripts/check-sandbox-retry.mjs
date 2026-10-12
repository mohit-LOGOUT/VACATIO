import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium,expect } from '@playwright/test';
const token=await readFile('/private/tmp/hermes-test-session','utf8');
const setModel=value=>execFileSync('npx',['convex','env','set','HERMES_MODEL',value],{stdio:'pipe'});
const browser=await chromium.launch({channel:'chrome'});
try{
 setModel('hermes-invalid-model-for-retry-check');
 const page=await browser.newPage();await page.goto(`http://localhost:5173/sandbox.html#session=${token}`);
 await expect(page.locator('#chat-caption')).toContainText('Aarav Shah');
 await page.getByLabel('Message Hermes').fill('What time is check-in?');await page.getByRole('button',{name:'Send message',exact:true}).click();
 await expect(page.locator('.reply-error')).toBeVisible({timeout:100000});await expect(page.locator('.message.guest')).toHaveCount(1);
 setModel('gpt-4o-mini');
 await page.getByRole('button',{name:'Retry reply'}).click();await expect(page.locator('.reply-error')).toHaveCount(0,{timeout:100000});
 await expect(page.locator('.message.hermes').last()).toContainText(/3|15/,{timeout:100000});
 await expect(page.locator('.message.guest')).toHaveCount(1);
 await page.screenshot({path:'artifacts/hermes-retry.png',fullPage:true});
 console.log('Real provider failure displayed; retry succeeded without duplicating the guest message.');
}finally{setModel('gpt-4o-mini');await browser.close();}
