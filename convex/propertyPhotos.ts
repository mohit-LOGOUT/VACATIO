'use node';
import { load } from 'cheerio';
import { request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';
import { lookup } from 'node:dns/promises';
import { publicAddress } from './listingReader';
export const MAX_PHOTOS=12, MAX_PHOTO_BYTES=5_000_000;
export function photoUrl(input:string){
 const u=new URL(input);
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password||(u.port&&!['80','443'].includes(u.port))||/^(localhost|.*\.localhost|.*\.local|.*\.internal)$/i.test(u.hostname)||!u.hostname.includes('.'))throw new Error('Invalid photo URL.');
 u.hash='';return u.toString();
}
export function photoKey(input:string){const u=new URL(photoUrl(input));for(const k of ['im_w','im_h','width','height','quality','auto','im_q'])u.searchParams.delete(k);u.searchParams.sort();return u.toString();}
export function listingPhotos(html:string,sourceUrl:string){
 const $=load(html),found:string[]=[];const room=new URL(sourceUrl).pathname.match(/^\/rooms\/(\d+)/)?.[1];const airbnb=/airbnb\./.test(new URL(sourceUrl).hostname);
 const add=(s:unknown)=>{if(typeof s!=='string')return;try{const url=photoKey(s);if(airbnb){const u=new URL(url);if(!/(^|\.)muscache\.com$/.test(u.hostname)||!u.pathname.includes('/pictures/')||/user|avatar|profile/.test(u.pathname))return;const hosting=u.pathname.match(/Hosting-(\d+)/);if(hosting&&hosting[1]!==room)return;}if(!found.includes(url)&&found.length<MAX_PHOTOS)found.push(url);}catch{}};
 // Only traverse identified listing galleries; never collect every image in the page.
 function gallery(v:unknown,depth=0){if(depth>50||!v)return;if(typeof v==='string'){if(/^https?:/.test(v))add(v);return;}if(Array.isArray(v)){v.forEach(x=>gallery(x,depth+1));return;}if(typeof v==='object'){const o=v as Record<string,unknown>;if(/Review|User|Host|Avatar|Recommendation/.test(String(o.__typename??'')))return;for(const [k,x]of Object.entries(o))if(['baseUrl','imageUrl','url','contentUrl'].includes(k))add(x);else if(typeof x==='object')gallery(x,depth+1);}}
 function walk(v:unknown,depth=0){if(depth>50||!v)return;if(typeof v==='string'&&/^[\[{]/.test(v)){try{walk(JSON.parse(v),depth+1);}catch{}return;}if(Array.isArray(v)){v.forEach(x=>walk(x,depth+1));return;}if(typeof v!=='object')return;const o=v as Record<string,unknown>;if(/Review|User|Host|Avatar|Recommendation|SimilarListing/.test(String(o.__typename??'')))return;
 if(/PhotoTour|PhotoGallery/.test(String(o.__typename??''))||/^(PHOTO_TOUR|PHOTO_GALLERY)/.test(String(o.sectionComponentType??'')))gallery(o);
 for(const x of Object.values(o))walk(x,depth+1);}
 $('script[type="application/json"]').each((_,e)=>{try{walk(JSON.parse($(e).text()));}catch{}});
 $('script[type="application/ld+json"]').each((_,e)=>{try{const data=JSON.parse($(e).text());const inspect=(v:any)=>{if(Array.isArray(v))return v.forEach(inspect);if(!v||typeof v!=='object')return;if(/VacationRental|Accommodation|LodgingBusiness|Hotel|Apartment|House/.test(String(v['@type']??'')))gallery(v.image);if(v['@graph'])inspect(v['@graph']);};inspect(data);}catch{}});
 add($('meta[property="og:image"]').attr('content'));return found;
}
export function validImage(bytes:Buffer,mime:string){const type=mime.split(';')[0].trim().toLowerCase();if(!bytes.length||bytes.length>MAX_PHOTO_BYTES)throw new Error('Photo is empty or too large.');const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';if(!((type==='image/jpeg'&&jpeg)||(type==='image/png'&&png)||(type==='image/webp'&&webp)))throw new Error('Photo response was not a supported image.');return type;}
export async function downloadPhoto(input:string,redirects=0):Promise<Blob>{
 const u=new URL(photoUrl(input)),addresses=await lookup(u.hostname,{all:true});if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new Error('Photo address is not public.');
 const result=await new Promise<{status:number,location?:string,mime:string,bytes:Buffer}>((resolve,reject)=>{const req=(u.protocol==='https:'?httpsRequest:httpRequest)(u,{headers:{'User-Agent':'Mozilla/5.0 (compatible; LogoutPropertyImporter/1.0)','Accept':'image/jpeg,image/png,image/webp'},lookup:(_h,options,callback)=>{const cb=callback as (...args:any[])=>void;if(options.all)cb(null,addresses);else cb(null,addresses[0].address,addresses[0].family);}},res=>{const status=res.statusCode??500;if(status>=300&&status<400){res.resume();resolve({status,location:res.headers.location,mime:'',bytes:Buffer.alloc(0)});return;}if(Number(res.headers['content-length']??0)>MAX_PHOTO_BYTES){res.destroy();reject(new Error('Photo is too large.'));return;}let length=0;const chunks:Buffer[]=[];res.on('data',(b:Buffer)=>{length+=b.length;if(length>MAX_PHOTO_BYTES){res.destroy();reject(new Error('Photo is too large.'));}else chunks.push(b);});res.on('end',()=>resolve({status,mime:String(res.headers['content-type']??''),bytes:Buffer.concat(chunks)}));res.on('error',reject);});const timer=setTimeout(()=>req.destroy(new Error('Photo download timed out.')),15000);req.on('close',()=>clearTimeout(timer));req.on('error',reject);req.end();});
 if(result.status>=300&&result.status<400){if(redirects>=3||!result.location)throw new Error('Too many photo redirects.');return downloadPhoto(new URL(result.location,u).toString(),redirects+1);}if(result.status!==200)throw new Error('Photo website blocked download.');const mime=validImage(result.bytes,result.mime);return new Blob([new Uint8Array(result.bytes)],{type:mime});
}
