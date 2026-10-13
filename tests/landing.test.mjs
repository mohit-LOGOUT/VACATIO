import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const html = await readFile('dist/index.html', 'utf8');
test('landing page preserves approved copy and opens the Hermes sandbox below the banner', () => {
  assert.match(html, /Guests arrive ready<\/span><span>to check in\./);
  assert.ok(html.includes('For vacation rental operators, Logout AI collects guest IDs, handles arrival questions on WhatsApp, and escalates only when your team is needed.'));
  assert.match(html, /href="#test-hermes">Try with a booking<\/a>/);
  assert.match(html, /src="\/sandbox.html" title="Test Hermes with a dummy booking"/);
  assert.equal((html.match(/class="main-action"/g) || []).length, 1);
  assert.match(html,/href="\/admin.html">Sign up<\/a>/);
});
test('build contains only intended public files', async () => {
  const names=(await readdir('dist')).map(name=>name.replace(/\.[a-f0-9]{16}(?=\.(js|css)$)/,''));
  assert.deepEqual(names.sort(), ['admin-app.js', 'admin.css', 'admin.html', 'images', 'index.html', 'landing-sandbox.js', 'review-config.js', 'review.css', 'review.html', 'review.js', 'sandbox-app.js', 'sandbox.css', 'sandbox.html', 'styles.css']);
  assert.deepEqual(await readdir('dist/images'), ['landing-hero.png', 'logout-icon.png', 'logout-wordmark.jpg']);
});
test('pages reference matching content-versioned code and styles so old browser caches cannot break updates', async () => {
  for(const name of ['index.html','sandbox.html','review.html','admin.html']){
    const page=await readFile(`dist/${name}`,'utf8');
    const paths=[...page.matchAll(/(?:src|href)="(\/[^"?]+\.(?:js|css))"/g)].map(match=>match[1]);
    assert.ok(paths.length>0);
    for(const path of paths){
      assert.match(path,/\.[a-f0-9]{16}\.(?:js|css)$/);
      const hash=createHash('sha256').update(await readFile(`dist${path}`)).digest('hex').slice(0,16);
      assert.ok(path.includes(`.${hash}.`),`${name} must use the version of ${path} matching its contents`);
    }
  }
});
