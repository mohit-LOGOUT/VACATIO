import { query, mutation, internalMutation } from './_generated/server';
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
 return await ctx.db.query('properties').withIndex('by_creation_time').order('desc').paginate({...args.paginationOpts,numItems:Math.min(args.paginationOpts.numItems,25)});
}});
export const detail=query({args:{id:v.id('properties')},returns:v.any(),handler:async(ctx,{id})=>{await requireAdmin(ctx);return ctx.db.get('properties',id);}});
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
 for(const status of ['queued','reading','extracting'] as const){if((await ctx.db.query('propertyImports').withIndex('by_status',q=>q.eq('status',status)).take(3)).length>=3)throw new ConvexError('A few imports are already running. Wait for one to finish.');}
 const jobId=await ctx.db.insert('propertyImports',{sourceUrl,requestedBy:userId,status:'queued',createdAt:Date.now()});
 await start(ctx,internal.propertyWorkflow.importProperty,{jobId,sourceUrl,userId});
 return{jobId};
}});
export const stage=internalMutation({args:{jobId:v.id('propertyImports'),status:v.union(v.literal('reading'),v.literal('extracting'))},returns:v.null(),handler:async(ctx,args)=>{await ctx.db.patch('propertyImports',args.jobId,{status:args.status});return null;}});
export const complete=internalMutation({args:{jobId:v.id('propertyImports'),property:propertyInput},returns:v.null(),handler:async(ctx,args)=>{
 const job=await ctx.db.get('propertyImports',args.jobId);if(!job||job.status==='complete')return null;
 validateProperty(args.property);
 const existing=await ctx.db.query('properties').withIndex('by_source',q=>q.eq('sourceUrl',job.sourceUrl)).first();
 const propertyId=existing?existing._id:await ctx.db.insert('properties',{...args.property,sourceUrl:job.sourceUrl,importedAt:Date.now(),missingFields:missingFields(args.property),revision:0});
 await ctx.db.patch('propertyImports',job._id,{status:'complete',propertyId,finishedAt:Date.now()});return null;
}});
export const fail=internalMutation({args:{jobId:v.id('propertyImports'),error:v.string()},returns:v.null(),handler:async(ctx,args)=>{const job=await ctx.db.get('propertyImports',args.jobId);if(job&&job.status!=='complete')await ctx.db.patch('propertyImports',args.jobId,{status:'failed',error:args.error.slice(0,500),finishedAt:Date.now()});return null;}});

export const access=query({args:{},returns:v.boolean(),handler:async ctx=>{try{await requireAdmin(ctx);return true;}catch{return false;}}});
