import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const html = await readFile('dist/index.html', 'utf8');
test('landing page preserves approved copy and opens the supplied WhatsApp number', () => {
  assert.match(html, /Guests arrive ready<\/span><span>to check in\./);
  assert.ok(html.includes('For vacation rental operators, Logout AI collects guest IDs, handles arrival questions on WhatsApp, and escalates only when your team is needed.'));
  assert.match(html, /href="https:\/\/wa.me\/918208215436">Try with a booking<\/a>/);
  assert.equal((html.match(/class="main-action"/g) || []).length, 1);
});
test('build contains only intended public files', async () => {
  assert.deepEqual((await readdir('dist')).sort(), ['images', 'index.html', 'styles.css']);
  assert.deepEqual(await readdir('dist/images'), ['landing-hero.png']);
});
