import {chromium, expect} from '@playwright/test';
import {readFile, mkdir} from 'node:fs/promises';
const creds=JSON.parse(await readFile('/private/tmp/hermes-admin-dev.json','utf8'));
const browser=await chromium.launch({channel:'chrome'});
await mkdir('.impeccable/review',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/admin.html');
 await page.getByLabel('Admin ID',{exact:true}).fill(creds.id);
 await page.getByLabel('Password',{exact:true}).fill(creds.password);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Properties',exact:true})).toBeVisible();
 await expect(page.locator('.property-list li').first()).toBeVisible();
 await page.getByRole('link',{name:'Train Hermes',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Train Hermes',exact:true,level:1})).toBeVisible();
 const guidance=page.getByLabel('Speaking guidance');const original=await guidance.inputValue();
 await guidance.fill(original+'\nUnsaved navigation check.');
 await page.getByRole('link',{name:'Guest tests',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Pre-check-in testing',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Train Hermes',exact:true}).click();
 await expect(guidance).toHaveValue(original+'\nUnsaved navigation check.');
 await page.getByRole('button',{name:'Reload saved training',exact:true}).click();
 await expect(guidance).toHaveValue(original);
 console.log('PASS: all workspace destinations work; switching sections preserves unsaved training; reloading restores saved guidance.');
 for(const width of [320,390,768,1280]) {
  await page.setViewportSize({width,height:900});
  for(const [route,label] of [['properties','Properties'],['train-hermes','Train Hermes'],['guest-tests','Guest tests']]) {
   await page.getByRole('link',{name:label,exact:true}).click();
   await expect(page.getByRole('link',{name:label,exact:true})).toHaveAttribute('aria-current','page');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:`.impeccable/review/${route}-${width}.png`,fullPage:true});
   if(route==='properties'&&(width===1280||width===390))await page.screenshot({path:`.impeccable/review/${width===1280?'desktop':'mobile'}.png`,fullPage:true});
  }
  await page.getByRole('link',{name:'Properties',exact:true}).click();
  await page.locator('.property-link').first().click();
  await expect(page.getByRole('group',{name:'Arrival and access'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`.impeccable/review/property-detail-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Back to properties',exact:true}).click();
 }
 await page.setViewportSize({width:1280,height:900});
 await page.getByRole('link',{name:'Properties',exact:true}).focus();
 await page.keyboard.press('Tab');
 expect(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle)).not.toBe('none');
 await page.getByRole('button',{name:'Sign out',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Admin sign in',exact:true})).toBeVisible();
 await page.screenshot({path:'.impeccable/review/login.png',fullPage:true});
 expect(errors).toEqual([]);
 console.log('PASS: all sections and grouped property form fit at 320, 390, 768 and 1280px; keyboard focus visible; sign-out works; no browser exceptions.');
} finally {await browser.close();}
