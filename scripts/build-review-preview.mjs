import { readFile, writeFile, mkdir } from 'node:fs/promises';
const [html, css, js] = await Promise.all(['src/review.html', 'src/review.css', 'src/review.js'].map(path => readFile(path, 'utf8')));
const preview = html
  .replace(/<link href="https:\/\/fonts.googleapis.com[^>]+>/, '')
  .replace('<link rel="stylesheet" href="/review.css"><script src="/review-config.js" defer></script><script src="/review.js" defer></script>', `<style>${css}</style>`)
  .replace('</body>', `<script>window.REVIEW_CONFIG={convexUrl:null};${js}</script><script>document.getElementById('sample').click();</script></body>`);
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/document-review-preview.html', preview);
console.log('Sample preview: artifacts/document-review-preview.html');
