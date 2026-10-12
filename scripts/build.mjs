import { cp, mkdir, rm, readFile, writeFile, readdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });
await build({ entryPoints: ['src/sandbox.js'], bundle: true, format: 'esm', platform: 'browser', outfile: 'dist/sandbox-app.js', minify: true });
await rm('dist/sandbox.js');
await build({entryPoints:['src/admin.jsx'],bundle:true,format:'esm',platform:'browser',outfile:'dist/admin-app.js',minify:true,define:{'process.env.NODE_ENV':'"production"'}});
await rm('dist/admin.jsx');
let convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
if (!convexUrl) {
  try {
    const env = await readFile('.env.local', 'utf8');
    convexUrl = env.match(/^CONVEX_URL=(https:\/\/[^\s]+)$/m)?.[1];
  } catch {}
}
if (convexUrl && !/^https:\/\/[a-z0-9-]+\.convex\.cloud$/.test(convexUrl)) {
  throw new Error('CONVEX_URL must be a Convex cloud deployment URL.');
}
await writeFile('dist/review-config.js', `window.REVIEW_CONFIG = ${JSON.stringify({ convexUrl: convexUrl || null })};\n`);
// A new URL for changed code prevents returning browsers mixing old scripts with new HTML.
const files = await readdir('dist');
const assets = new Map();
for (const file of files.filter(name => /\.(js|css)$/.test(name))) {
  const hash = createHash('sha256').update(await readFile(`dist/${file}`)).digest('hex').slice(0, 16);
  const versioned = file.replace(/\.(js|css)$/, `.${hash}.$1`);
  await rename(`dist/${file}`, `dist/${versioned}`);
  assets.set(file, versioned);
}
for (const file of files.filter(name => name.endsWith('.html'))) {
  let html = await readFile(`dist/${file}`, 'utf8');
  for (const [original, versioned] of assets) html = html.replaceAll(`"/${original}"`, `"/${versioned}"`);
  await writeFile(`dist/${file}`, html);
}
console.log('Landing page, document review and Hermes sandbox built in dist/');
