// Temporary smoke-test credentials. Never prints secrets or creates a permanent owner.
import {generateKeyPair,exportPKCS8,exportJWK} from 'jose';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const prod=process.argv.includes('--prod'),flags=prod?['--prod']:[];
function run(args,optional=false){const result=spawnSync('npx',['convex',...args,...flags],{encoding:'utf8'});if(result.status!==0&&!optional)throw new Error(`Convex setup failed at ${args[0]} ${args[1]}.`);return result.status===0?result.stdout.trim():'';}
if(run(['run','adminSetup:status','{}'])==='true')throw new Error('An admin is already configured. Reuse its test credentials or end temporary access first; never replace a configured owner automatically.');
const existing=run(['env','get','JWT_PRIVATE_KEY'],true);
if(!existing){const keys=await generateKeyPair('RS256',{extractable:true}),pub=await exportJWK(keys.publicKey);run(['env','set',`JWT_PRIVATE_KEY=${(await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g,' ')}`]);run(['env','set',`JWKS=${JSON.stringify({keys:[{use:'sig',...pub}]})}`]);}
const base=prod?'https://grateful-llama-909.convex.site':'https://terrific-peccary-989.convex.site';
run(['env','set',`SITE_URL=${base}`]);
const id=`test-${randomBytes(8).toString('hex')}`,password=randomBytes(24).toString('base64url');
try{run(['env','set',`ADMIN_SETUP_ID=${id}`]);run(['env','set',`ADMIN_SETUP_PASSWORD=${password}`]);run(['run','adminSetup:configure','{"temporary":true}']);await writeFile(`/private/tmp/hermes-admin-${prod?'prod':'dev'}.json`,JSON.stringify({id,password,base}),{mode:0o600});console.log('Temporary admin configured for testing; credentials kept in a private local file.');}
finally{run(['env','remove','ADMIN_SETUP_PASSWORD'],true);run(['env','remove','ADMIN_SETUP_ID'],true);}
