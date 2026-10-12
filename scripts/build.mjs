import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });
await build({ entryPoints: ['src/sandbox.js'], bundle: true, format: 'esm', platform: 'browser', outfile: 'dist/sandbox-app.js', minify: true });
await rm('dist/sandbox.js');
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
console.log('Landing page, document review and Hermes sandbox built in dist/');
