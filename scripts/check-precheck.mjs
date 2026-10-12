import{chromium,expect}from'@playwright/test';
import{mkdir,writeFile}from'node:fs/promises';
import{ConvexHttpClient}from'convex/browser';
import{anyApi}from'convex/server';
import assert from'node:assert/strict';
const prod=process.argv.includes('--prod'),base=prod?'https://grateful-llama-909.convex.site':'http://localhost:5173';
const browser=await chromium.launch({channel:'chrome'});await mkdir('artifacts',{recursive:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/sandbox.html');await expect(page.locator('.guest-check')).toHaveCount(3,{timeout:30000});
const first=()=>page.locator('.guest-check').nth(0);
await first().getByRole('button',{name:'Try wrong-name sample',exact:true}).click();
await expect(first().getByText('Aadhaar · Replacement needed',{exact:true})).toBeVisible({timeout:150000});
console.log('PASS: image AI read the wrong name and the server refused completion.');
await first().getByRole('button',{name:'Use matching sample',exact:true}).click();
await expect(first().getByText('Aadhaar · Name check passed',{exact:true})).toBeVisible({timeout:150000});
await expect(page.locator('.precheck-status')).toHaveText('1 of 3 guests complete');
for(const [index,type]of [[1,'pan'],[2,'passport']]){const card=page.locator('.guest-check').nth(index);await card.locator('select').selectOption(type);await card.getByRole('button',{name:'Use matching sample',exact:true}).click();await expect(card.getByText('All required ID checks complete',{exact:true})).toBeVisible({timeout:150000});}
await expect(page.locator('.precheck-status')).toHaveText('Pre-check-in complete',{timeout:30000});
await expect(page.locator('#messages')).toContainText('your pre-check-in is complete');
await expect(page.locator('#precheck-host')).toContainText('Pre-check-in complete for 3 guests');
const token=await page.evaluate(()=>localStorage.getItem('hermes-session')),bookingId=await page.locator('#booking-select').inputValue();
await writeFile(`artifacts/precheck-${prod?'prod':'dev'}-session.json`,JSON.stringify({token,bookingId}),{mode:0o600});
await page.reload();await expect(page.locator('.precheck-status')).toHaveText('Pre-check-in complete',{timeout:30000});
await page.locator('#message-input').fill('Where can I park?');await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.locator('#agent-status')).toHaveText('Ready',{timeout:100000});await expect(page.locator('#messages .message.hermes').last()).toContainText(/park/i);
await page.screenshot({path:`artifacts/precheck-${prod?'prod':'dev'}-desktop.png`,fullPage:true});
await page.locator('#booking-select').selectOption({index:1});await expect(page.locator('.precheck-status')).toHaveText('0 of 2 guests complete',{timeout:30000});
await expect(page.locator('#messages')).not.toContainText('your pre-check-in is complete');
await page.locator('#message-input').fill('Please remind me later. I do not want to send IDs now.');await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.getByRole('button',{name:'Resume ID reminders',exact:true})).toBeVisible({timeout:100000});
const api=new ConvexHttpClient(prod?'https://grateful-llama-909.convex.cloud':'https://terrific-peccary-989.convex.cloud');
await assert.rejects(api.query(anyApi.precheck.state,{token:'b'.repeat(64),bookingId}));await assert.rejects(api.query(anyApi.precheck.hostList,{}));
for(const width of[320,390,768]){await page.setViewportSize({width,height:900});await expect(page.locator('.guest-check')).toHaveCount(2);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`artifacts/precheck-${prod?'prod':'dev'}-${width}.png`,fullPage:true});}
assert.deepEqual(errors,[]);console.log('PASS: Aadhaar/PAN/passport image reads, all-person completion, separate receipt/result messages, reload, booking isolation, pause, protected host data and mobile layouts.');
}finally{await browser.close();}
