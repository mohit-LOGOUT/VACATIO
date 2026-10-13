import { query, mutation, internalMutation, internalQuery } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { requireAdmin } from './adminAccess';
import { propertyInput, validateProperty, missingFields } from './propertyFields';
import { listingUrl } from './adminRules';
import { internal } from './_generated/api';
import { start } from '@convex-dev/workflow';
import type { Id } from './_generated/dataModel';

export const list=query({args:{paginationOpts:paginationOptsValidator},returns:v.any(),handler:async(ctx,args)=>{
 await requireAdmin(ctx);
 const result=await ctx.db.query('properties').withIndex('by_creation_time').order('desc').paginate({...args.paginationOpts,numItems:Math.min(args.paginationOpts.numItems,25)});
 return {...result,page:await Promise.all(result.page.map(row=>withPhotos(ctx,row)))};
}});
export const detail=query({args:{id:v.id('properties')},returns:v.any(),handler:async(ctx,{id})=>{await requireAdmin(ctx);const row=await ctx.db.get('properties',id);return row?withPhotos(ctx,row):null;}});
export const imports=query({args:{},returns:v.any(),handler:async ctx=>{await requireAdmin(ctx);return ctx.db.query('propertyImports').withIndex('by_creation_time').order('desc').take(10);}});
export const save=mutation({args:{id:v.optional(v.id('properties')),revision:v.optional(v.number()),property:propertyInput},returns:v.id('properties'),handler:async(ctx,args)=>{
 await requireAdmin(ctx);validateProperty(args.property);
 if(args.id){const row=await ctx.db.get('properties',args.id);if(!row)throw new ConvexError('Property not found.');if((row.revision??0)!==(args.revision??0))throw new ConvexError('This property changed in another window. Reopen it before saving.');await ctx.db.patch('properties',row._id,{guestCapacity:undefined,bedrooms:undefined,beds:undefined,bathrooms:undefined,...args.property,missingFields:missingFields(args.property),revision:(row.revision??0)+1});return row._id;}
 return ctx.db.insert('properties',{...args.property,missingFields:missingFields(args.property),revision:0});
}});
export const importListing=mutation({args:{url:v.string()},returns:v.object({jobId:v.optional(v.id('propertyImports')),propertyId:v.optional(v.id('properties'))}),handler:async(ctx,{url}):Promise<{jobId?:Id<'propertyImports'>,propertyId?:Id<'properties'>}>=>{
 const userId=await requireAdmin(ctx),sourceUrl=listingUrl(url);
 const existing=await ctx.db.query('properties').withIndex('by_source',q=>q.eq('sourceUrl',sourceUrl)).first();
 if(existing)return{propertyId:existing._id};
 const recent=await ctx.db.query('propertyImports').withIndex('by_source',q=>q.eq('sourceUrl',sourceUrl)).order('desc').first();
 if(recent&&!['complete','failed'].includes(recent.status))return{jobId:recent._id};
 for(const status of ['queued','reading','extracting','importing_photos'] as const){if((await ctx.db.query('propertyImports').withIndex('by_status',q=>q.eq('status',status)).take(3)).length>=3)throw new ConvexError('A few imports are already running. Wait for one to finish.');}
 const jobId=await ctx.db.insert('propertyImports',{sourceUrl,requestedBy:userId,status:'queued',createdAt:Date.now()});
 await start(ctx,internal.propertyWorkflow.importProperty,{jobId,sourceUrl,userId});
 return{jobId};
}});
export const stage=internalMutation({args:{jobId:v.id('propertyImports'),status:v.union(v.literal('reading'),v.literal('extracting'),v.literal('importing_photos'))},returns:v.null(),handler:async(ctx,args)=>{await ctx.db.patch('propertyImports',args.jobId,{status:args.status});return null;}});
export const complete=internalMutation({args:{jobId:v.id('propertyImports'),property:propertyInput},returns:v.id('properties'),handler:async(ctx,args)=>{
 const job=await ctx.db.get('propertyImports',args.jobId);if(!job)throw new ConvexError('Import not found.');if(job.propertyId)return job.propertyId;
 validateProperty(args.property);
 const existing=await ctx.db.query('properties').withIndex('by_source',q=>q.eq('sourceUrl',job.sourceUrl)).first();
 const propertyId=existing?existing._id:await ctx.db.insert('properties',{...args.property,sourceUrl:job.sourceUrl,importedAt:Date.now(),missingFields:missingFields(args.property),revision:0});
 await ctx.db.patch('propertyImports',job._id,{status:'importing_photos',propertyId});
 await ctx.db.patch('properties',propertyId,{photoImportJobId:job._id,photoImportStatus:'pending',photoImportMessage:'Importing listing photos…'});return propertyId;
}});
export const fail=internalMutation({args:{jobId:v.id('propertyImports'),error:v.string()},returns:v.null(),handler:async(ctx,args)=>{const job=await ctx.db.get('propertyImports',args.jobId);if(job&&job.status!=='complete')await ctx.db.patch('propertyImports',args.jobId,{status:'failed',error:args.error.slice(0,500),finishedAt:Date.now()});return null;}});

export const access=query({args:{},returns:v.boolean(),handler:async ctx=>{try{await requireAdmin(ctx);return true;}catch{return false;}}});

async function withPhotos(ctx:any,row:any){return {...row,photos:await Promise.all((row.photos??[]).map(async(photo:any)=>({...photo,url:await ctx.storage.getUrl(photo.fileId)})))};}
async function queuePhotos(ctx:any,id:Id<'properties'>,userId:Id<'users'>){
 const row=await ctx.db.get('properties',id);if(!row?.sourceUrl)throw new ConvexError('This property needs a listing link before photos can be imported.');
 if(row.photoImportStatus==='pending'&&row.photoImportJobId)return{jobId:row.photoImportJobId};
 const sourceUrl=listingUrl(row.sourceUrl),jobId=await ctx.db.insert('propertyImports',{sourceUrl,requestedBy:userId,status:'queued',propertyId:id,createdAt:Date.now()});
 await ctx.db.patch('properties',id,{photoImportJobId:jobId,photoImportStatus:'pending',photoImportMessage:'Reading listing photos…'});
 await start(ctx,internal.propertyWorkflow.importPropertyPhotos,{jobId,sourceUrl,propertyId:id});return{jobId};
}
export const importPhotos=mutation({args:{id:v.id('properties')},returns:v.object({jobId:v.id('propertyImports')}),handler:async(ctx,{id})=>queuePhotos(ctx,id,await requireAdmin(ctx))});
export const photoNeeded=internalQuery({args:{id:v.id('properties'),jobId:v.id('propertyImports'),sourceUrl:v.string()},returns:v.boolean(),handler:async(ctx,args)=>{const row=await ctx.db.get('properties',args.id);return !!row&&row.photoImportJobId===args.jobId&&(row.photos?.length??0)<12&&!row.photos?.some(p=>p.sourceUrl===args.sourceUrl);}});
export const attachPhoto=internalMutation({args:{id:v.id('properties'),jobId:v.id('propertyImports'),sourceUrl:v.string(),fileId:v.id('_storage')},returns:v.null(),handler:async(ctx,args)=>{const row=await ctx.db.get('properties',args.id);if(row?.photos?.some(p=>p.fileId===args.fileId))return null;if(!row||row.photoImportJobId!==args.jobId||(row.photos?.length??0)>=12||row.photos?.some(p=>p.sourceUrl===args.sourceUrl)){await ctx.storage.delete(args.fileId);return null;}await ctx.db.patch('properties',row._id,{photos:[...(row.photos??[]),{fileId:args.fileId,sourceUrl:args.sourceUrl}]});return null;}});
export const finishPhotos=internalMutation({args:{id:v.id('properties'),jobId:v.id('propertyImports'),failed:v.number(),candidates:v.number(),error:v.optional(v.boolean())},returns:v.null(),handler:async(ctx,args)=>{
 const row=await ctx.db.get('properties',args.id);if(!row||row.photoImportJobId!==args.jobId)return null;
 const count=row.photos?.length??0,status=count?(args.failed||args.error?'partial':'ready'):(args.error||args.failed?'failed':'unavailable');
 const message=count?`${count} listing photo${count===1?'':'s'} imported.${args.failed||args.error?' Some photos could not be downloaded.':''}`:args.error||args.failed?'Listing photos could not be read. Property details are saved; retry photo import.':'No downloadable listing photos were available. Property details are saved.';
 await ctx.db.patch('properties',row._id,{photoImportStatus:status,photoImportMessage:message});
 await ctx.db.patch('propertyImports',args.jobId,{status:'complete',finishedAt:Date.now()});return null;
}});
export const backfillMissingPhotos=internalMutation({args:{},returns:v.object({scheduled:v.number()}),handler:async(ctx)=>{const owner=await ctx.db.query('adminSettings').withIndex('by_key',q=>q.eq('key','owner')).first();if(!owner)return{scheduled:0};const rows=await ctx.db.query('properties').withIndex('by_creation_time').order('desc').take(25);let scheduled=0;for(const row of rows){if(row.sourceUrl&&!row.photos?.length&&row.photoImportStatus!=='pending'){await queuePhotos(ctx,row._id,owner.userId);if(++scheduled>=3)break;}}return{scheduled};}});

export const discardUnattachedPhoto=internalMutation({args:{id:v.id('properties'),fileId:v.id('_storage')},returns:v.null(),handler:async(ctx,args)=>{const row=await ctx.db.get('properties',args.id);if(!row?.photos?.some(p=>p.fileId===args.fileId))await ctx.storage.delete(args.fileId);return null;}});
