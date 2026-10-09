import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { networkInterfaces } from 'node:os';
const port = Number(process.env.PORT || 5173);
const root = resolve('dist');
createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const name = pathname === '/' ? '/index.html' : pathname;
  const file = resolve(root, '.' + name);
  if (!file.startsWith(root + '/')) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(file);
    const contentType = name.endsWith('.png') ? 'image/png' : name.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '0.0.0.0', () => {
  console.log(`Preview: http://localhost:${port}`);
  for (const entries of Object.values(networkInterfaces())) for (const entry of entries || []) {
    if (entry.family === 'IPv4' && !entry.internal) console.log(`Phone on the same Wi-Fi: http://${entry.address}:${port}`);
  }
});
