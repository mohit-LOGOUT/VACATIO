import assert from 'node:assert/strict';
import{chromium,expect}from'@playwright/test';
import{ConvexHttpClient}from'convex/browser';
import{anyApi}from'convex/server';
const client=new ConvexHttpClient('https://grateful-llama-909.convex.cloud');
await assert.rejects(client.query(anyApi.admin.list,{paginationOpts:{numItems:25,cursor:null}}),e=>e.data==='Sign in to access the admin dashboard.');
const browser=await chromium.launch({channel:'chrome'});
try{const page=await browser.newPage({viewport:{width:1280,height:900}});await page.goto('https://grateful-llama-909.convex.site/');await page.getByRole('link',{name:'Sign up',exact:true}).click();await expect(page.getByRole('heading',{name:'Admin sign in'})).toBeVisible();await expect(page.getByText('Admin credentials have not been configured yet.',{exact:false})).not.toBeVisible();await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeEnabled();await page.screenshot({path:'artifacts/admin-live-entry.png',fullPage:true});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.screenshot({path:'artifacts/admin-live-entry-mobile.png',fullPage:true});console.log('PASS: live Sign up link opens protected admin entry; no property data exposed; configured sign-in is enabled; mobile view fits.');}finally{await browser.close();}
