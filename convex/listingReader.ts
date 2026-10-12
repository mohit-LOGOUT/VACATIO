'use node';
import { ConvexError } from 'convex/values';
import { request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';
import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
import { load } from 'cheerio';
import { listingUrl } from './adminRules';
export function publicAddress(address:string){try{return ipaddr.process(address).range()==='unicast';}catch{return false;}}
export async function readPublicPage(input:string,redirects=0):Promise<string>{
 const url=new URL(listingUrl(input));
 const addresses=await lookup(url.hostname,{all:true});
 if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new ConvexError('IMPORT: This link does not point to a public website.');
 const address=addresses[0];
 const result=await new Promise<{status:number,location?:string,contentType:string,body:string}>((resolve,reject)=>{
  // Pin the validated address so a second DNS lookup cannot redirect the request to a private service.
  const req=(url.protocol==='https:'?httpsRequest:httpRequest)(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; LogoutPropertyImporter/1.0)','Accept':'text/html,application/xhtml+xml','Accept-Language':'en-US,en;q=0.9'},lookup:(_host,options,callback)=>{const cb=callback as (...args:any[])=>void;if(options.all)cb(null,addresses);else cb(null,address.address,address.family);}},res=>{
   const status=res.statusCode??500;
   if(status>=300&&status<400){res.resume();resolve({status,location:res.headers.location,contentType:'',body:''});return;}
   let length=0;const chunks:Buffer[]=[];
   res.on('data',(chunk:Buffer)=>{length+=chunk.length;if(length>2_000_000){res.destroy();reject(new ConvexError('IMPORT: This page is too large to import. Add its details manually.'));}else chunks.push(chunk);});
   res.on('end',()=>resolve({status,contentType:String(res.headers['content-type']??''),body:Buffer.concat(chunks).toString('utf8')}));res.on('error',reject);
  });
  const timer=setTimeout(()=>req.destroy(new ConvexError('IMPORT: The listing website took too long to respond. Please retry.')),20000);
  req.on('close',()=>clearTimeout(timer));req.on('error',reject);req.end();
 });
 if(result.status>=300&&result.status<400){if(redirects>=4||!result.location)throw new ConvexError('IMPORT: This link redirected too many times. Paste the final listing URL.');return readPublicPage(new URL(result.location,url).toString(),redirects+1);}
 if(result.status!==200)throw new ConvexError(`IMPORT: The listing website returned ${result.status}. It may block automatic reading; retry or add the details manually.`);
 if(!/text\/html|application\/xhtml\+xml/i.test(result.contentType))throw new ConvexError('IMPORT: Paste a property webpage, rather than a file or image.');
 return result.body;
}
export function listingText(html:string){
 const $=load(html),pieces:string[]=[];const seen=new Set<string>();
 const add=(s:string)=>{const text=load(`<div>${s.replace(/\\u003c/g,'<').replace(/\\u003e/g,'>')}</div>`).text().replace(/\s+/g,' ').trim();if(text.length>1&&!seen.has(text)){seen.add(text);pieces.push(text);}};
 add(`Page title: ${$('title').text()}`);
 $('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').each((_,e)=>add($(e).attr('content')??''));
 const keys=/^(title|subtitle|text|htmlText|name|description|label|headline|propertyType|personCapacity|guestCapacity|bedrooms|beds|bathrooms|addressLocality|addressRegion|addressCountry|streetAddress|postalCode)$/;
 function walk(value:unknown,depth=0){
  if(depth>45||pieces.join('').length>110000)return;
  if(typeof value==='string'&&/^[\[{]/.test(value)){try{walk(JSON.parse(value),depth+1);}catch{}return;}
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){for(const item of value)walk(item,depth+1);return;}
  const obj=value as Record<string,unknown>;
  if(obj.available===true&&typeof obj.title==='string'){add(`Available amenity: ${obj.title}`);if(obj.subtitle)walk(obj.subtitle,depth+1);return;}
  if(obj.available===false){if(typeof obj.title==='string')add(`Not available: ${obj.title}`);return;}
  // Keep listing facts; do not promote reviewer opinions into host-provided facts.
  if(String(obj.__typename??'').includes('Review'))return;
  for(const [key,item]of Object.entries(obj)){
   if(keys.test(key)&&(typeof item==='string'||typeof item==='number'))add(`${key}: ${item}`);
   else if(typeof item==='object'||(typeof item==='string'&&/^[\[{]/.test(item)))walk(item,depth+1);
  }
 }
 $('script[type="application/json"]').each((_,e)=>{try{walk(JSON.parse($(e).text()));}catch{}});
 $('script[type="application/ld+json"]').each((_,e)=>{try{add('Structured listing data (may conflict with displayed listing; mark conflicts as unknown):');walk(JSON.parse($(e).text()));}catch{}});
 $('script,style,noscript,svg,nav,footer,header').remove();add($('body').text());
 const text=pieces.join('\n').slice(0,110000);
 if(text.length<200||(/access denied|verify you are human|captcha/i.test($('title').text())))throw new ConvexError('IMPORT: The website did not provide readable listing details. Retry or add this property manually.');
 return text;
}
