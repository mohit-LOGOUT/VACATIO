import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
const client=new ConvexHttpClient(process.env.CONVEX_URL || 'https://grateful-llama-909.convex.cloud');
const token=randomBytes(32).toString('hex');
await client.action(anyApi.sandbox.open,{token});
await writeFile('/private/tmp/hermes-owner-session',token,{mode:0o600});
console.log('A fresh fictional test session is ready.');
