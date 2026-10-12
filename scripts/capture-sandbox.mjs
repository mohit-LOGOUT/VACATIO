import { readFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
const token=await readFile('/private/tmp/hermes-test-session','utf8');
const browser=await chromium.launch({channel:'chrome'});
try{for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:width<768?844:940}});await page.goto(`http://localhost:5173/sandbox.html#session=${token}`);
 await expect(page.locator('#chat-caption')).toContainText('Aarav Shah');
 if(width<768)await expect(page.locator('#chat-context')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:`artifacts/hermes-${width}.png`,fullPage:true});
 if(width===1280)await page.screenshot({path:'artifacts/hermes-desktop.png',fullPage:true});
 await page.close();
}console.log('Updated phone context and all four viewport captures verified.');}finally{await browser.close();}
