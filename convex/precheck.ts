import {query,mutation,internalQuery,internalMutation} from './_generated/server';
import type {MutationCtx,QueryCtx} from './_generated/server';
import type {Doc,Id} from './_generated/dataModel';
import {internal,components} from './_generated/api';
import {v,ConvexError} from 'convex/values';
import {ownedBooking} from './sandbox';
import {requireAdmin} from './adminAccess';
import {WorkflowManager} from '@convex-dev/workflow';
import {createThread} from '@convex-dev/agent';
import {idType,requirementsValidator,readingValidator,assessName,requirementsMet,validateSetup,requirementText} from './precheckRules';
const workflow=new WorkflowManager(components.workflow);
const access={token:v.string(),bookingId:v.id('sandboxBookings')};
async function runFor(ctx:QueryCtx|MutationCtx,bookingId:Id<'sandboxBookings'>){return ctx.db.query('precheckRuns').withIndex('by_booking',q=>q.eq('bookingId',bookingId)).first();}
export async function precheckSummary(ctx:QueryCtx|MutationCtx,bookingId:Id<'sandboxBookings'>){
 const run=await runFor(ctx,bookingId);if(!run)return null;
 const documents=await ctx.db.query('precheckDocuments').withIndex('by_run',q=>q.eq('runId',run._id)).take(401);
 const current=documents.filter(d=>d.revision===run.revision);
 // Only the latest submission for each person's document type can satisfy a requirement.
 const latest=new Map<string,Doc<'precheckDocuments'>>();for(const doc of current)latest.set(`${doc.guestIndex}:${doc.type}`,doc);
 const guests=run.names.map((name,index)=>{const docs=[...latest.values()].filter(d=>d.guestIndex===index);return{name,index,complete:requirementsMet(run.requirements,docs.filter(d=>d.status==='passed').map(d=>d.type)),documents:docs.map(({_id,type,status,reason,method,reading,checkedAt})=>({id:_id,type,status,reason:reason??'',method:method??'',holderName:reading?.holderName??'',checkedAt:checkedAt??null}))};});
 return {run,guests};
}
async function event(ctx:MutationCtx,run:Doc<'precheckRuns'>,text:string,kind:'receipt'|'result'|'complete'|'arrival'|'setup'){await ctx.db.insert('precheckEvents',{runId:run._id,revision:run.revision,text,kind,createdAt:Date.now()});}
export async function reconcile(ctx:MutationCtx,bookingId:Id<'sandboxBookings'>){
 const state=await precheckSummary(ctx,bookingId);if(!state)return;
 const {run,guests}=state;
 const ready=run.arrivalProvided&&guests.length>0&&guests.every(g=>g.complete);
 if(ready&&!run.complete){await ctx.db.patch('precheckRuns',run._id,{complete:true,completionAt:Date.now(),updatedAt:Date.now()});await event(ctx,run,`The required ID name checks for all ${guests.length} guests are complete, and your pre-check-in is complete. We look forward to welcoming you!`,'complete');}
 else if(!ready&&run.complete)await ctx.db.patch('precheckRuns',run._id,{complete:false,completionAt:undefined,updatedAt:Date.now()});
}
export const state=query({args:access,returns:v.any(),handler:async(ctx,args)=>{
 await ownedBooking(ctx,args.token,args.bookingId);const s=await precheckSummary(ctx,args.bookingId);if(!s)return null;
 const events=await ctx.db.query('precheckEvents').withIndex('by_run',q=>q.eq('runId',s.run._id)).take(1000);
 return {...s,events:events.filter(e=>e.revision===s.run.revision).map(e=>({id:e._id,text:e.text,kind:e.kind,createdAt:e.createdAt})),hostNotice:s.run.complete?`Pre-check-in complete for ${s.guests.length} guests. Required ID name checks completed. Fictional test booking.`:null};
}});
export const begin=mutation({args:access,returns:v.null(),handler:async(ctx,args)=>{
 const {booking}=await ownedBooking(ctx,args.token,args.bookingId);
 if(booking.context.idRequirements.includes('Document upload is not available in this sandbox.'))await ctx.db.patch('sandboxBookings',booking._id,{context:{...booking.context,idRequirements:'One of Aadhaar, PAN or passport for each guest. Use fictional samples in this test.'}});
 if(await runFor(ctx,booking._id))return null;
 const c=booking.context,names=Array.from({length:c.guestCount},(_,i)=>i===0?c.guestName:i===1?'Priya Sharma':i===2?'Dev Patel':`Test Guest ${i+1}`);
 const id=await ctx.db.insert('precheckRuns',{bookingId:booking._id,names,requirements:[['aadhaar','pan','passport']],revision:1,email:'booking-contact@example.test',complete:false,arrivalProvided:!!(c.location&&c.entry&&c.checkInTime&&c.houseRules),paused:false,replyReminderSent:false,lastReminderAt:Date.now(),createdAt:Date.now(),updatedAt:Date.now()});
 const run=(await ctx.db.get('precheckRuns',id))!;
 await event(ctx,run,`Let's make arrival easy for all ${names.length} of you. Please share one Aadhaar, PAN or passport for each guest using the ID panel. This is a fictional test—use the sample documents, not real IDs.`,'setup');
 if(run.arrivalProvided)await event(ctx,run,`For your arrival: check-in is at ${c.checkInTime}. ${c.location}. ${c.entry} House rules: ${c.houseRules}`,'arrival');
 return null;
}});
export const setup=mutation({args:{...access,names:v.array(v.string()),requirements:requirementsValidator},returns:v.null(),handler:async(ctx,args)=>{
 const{booking}=await ownedBooking(ctx,args.token,args.bookingId);if(booking.busyTurnId)throw new ConvexError('Wait for the current reply before changing the checklist.');
 validateSetup(args.names,args.requirements,booking.context.guestCount);const run=await runFor(ctx,booking._id);if(!run)throw new ConvexError('Start the checklist first.');
 const names=args.names.map(n=>n.trim());if(names[0]!==booking.context.guestName)throw new ConvexError('The lead guest must match the booking. Edit the booking first if it is incorrect.');
 await ctx.db.patch('sandboxBookings',booking._id,{context:{...booking.context,idRequirements:requirementText(args.requirements)}});
 const revision=run.revision+1;await ctx.db.patch('precheckRuns',run._id,{names,requirements:args.requirements,revision,complete:false,completionAt:undefined,updatedAt:Date.now(),paused:false,replyReminderSent:false,lastReminderAt:Date.now()});
 await event(ctx,{...run,revision},`The guest checklist has been updated. Please submit ${requirementText(args.requirements)} for each guest. Previous submissions do not count for the changed checklist.`,'setup');return null;
}});
export const pause=mutation({args:{...access,paused:v.boolean()},returns:v.null(),handler:async(ctx,args)=>{await ownedBooking(ctx,args.token,args.bookingId);const run=await runFor(ctx,args.bookingId);if(run)await ctx.db.patch('precheckRuns',run._id,{paused:args.paused});return null;}});
export const upload=mutation({args:{...access,guestIndex:v.number(),type:idType,requestId:v.string()},returns:v.object({documentId:v.id('precheckDocuments'),url:v.union(v.string(),v.null())}),handler:async(ctx,args)=>{
 const{owner}=await ownedBooking(ctx,args.token,args.bookingId);const run=await runFor(ctx,args.bookingId);if(!run)throw new ConvexError('Start pre-check-in first.');
 if(!Number.isInteger(args.guestIndex)||!run.names[args.guestIndex]||!run.requirements.flat().includes(args.type))throw new ConvexError('Choose a guest and an accepted document type.');
 if(!/^[a-f0-9]{64}$/.test(args.requestId))throw new ConvexError('Reload and try the upload again.');
 const old=await ctx.db.query('precheckDocuments').withIndex('by_run_request',q=>q.eq('runId',run._id).eq('requestId',args.requestId)).first();
 if(old)return{documentId:old._id,url:old.status==='uploading'?await ctx.storage.generateUploadUrl():null};
 const docs=await ctx.db.query('precheckDocuments').withIndex('by_run',q=>q.eq('runId',run._id)).take(401);if(docs.length>=400)throw new ConvexError('This test has reached its document limit.');
 if(docs.some(d=>d.revision===run.revision&&d.guestIndex===args.guestIndex&&d.type===args.type&&['uploading','checking'].includes(d.status)))throw new ConvexError('This guest already has an upload or check in progress.');
 const fresh=Date.now()-owner.windowStart>86400000;if(!fresh&&owner.usage>=100)throw new ConvexError('Your daily test limit has been reached. Try again tomorrow.');
 await ctx.db.patch('sandboxSessions',owner._id,{usage:fresh?1:owner.usage+1,windowStart:fresh?Date.now():owner.windowStart});
 const documentId=await ctx.db.insert('precheckDocuments',{runId:run._id,revision:run.revision,guestIndex:args.guestIndex,expectedName:run.names[args.guestIndex],type:args.type,requestId:args.requestId,status:'uploading',attempt:1,createdAt:Date.now(),expiresAt:Date.now()+86400000});
 await reconcile(ctx,args.bookingId);
 await ctx.scheduler.runAfter(5*60000,internal.precheck.abandon,{documentId});
 await ctx.scheduler.runAfter(86400000,internal.precheck.expire,{documentId});
 return{documentId,url:await ctx.storage.generateUploadUrl()};
}});
export const attach=mutation({args:{token:v.string(),documentId:v.id('precheckDocuments'),fileId:v.id('_storage')},returns:v.null(),handler:async(ctx,args)=>{
 const doc=await ctx.db.get('precheckDocuments',args.documentId);if(!doc)throw new ConvexError('Upload not found.');const run=(await ctx.db.get('precheckRuns',doc.runId))!;await ownedBooking(ctx,args.token,run.bookingId);
 if(doc.fileId===args.fileId)return null;if(doc.status!=='uploading'||doc.revision!==run.revision)throw new ConvexError('This upload is no longer active.');
 const file=await ctx.db.system.get('_storage',args.fileId);const used=await ctx.db.query('precheckDocuments').withIndex('by_file',q=>q.eq('fileId',args.fileId)).first();
 if(used)throw new ConvexError('This upload has already been assigned.');
 if(!file||file._creationTime<doc.createdAt||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.contentType??''))throw new ConvexError('Use a JPG, PNG, WebP or PDF smaller than 5 MB.');
 const docs=await ctx.db.query('precheckDocuments').withIndex('by_run',q=>q.eq('runId',run._id)).take(401);
 if(docs.some(d=>d.sha===file.sha256&&d.guestIndex!==doc.guestIndex)){
  await ctx.storage.delete(args.fileId);await ctx.db.patch('precheckDocuments',doc._id,{status:'replacement',reason:'This file was already submitted for another guest.'});await event(ctx,run,'This file was already submitted for another guest. Please send this person’s own document.','result');return null;
 }
 await ctx.db.patch('precheckDocuments',doc._id,{fileId:args.fileId,sha:file.sha256,status:'checking'});
 await event(ctx,run,`Thanks, we've received ${doc.expectedName}'s ${doc.type.toUpperCase()}. We're checking the name and details now and will let you know when the check is complete.`,'receipt');
 await workflow.start(ctx,internal.precheckWorkflow.check,{documentId:doc._id,attempt:doc.attempt});
 await ctx.scheduler.runAfter(180000,internal.precheck.failed,{documentId:doc._id,attempt:doc.attempt});return null;
}});
export const readJob=internalQuery({args:{documentId:v.id('precheckDocuments'),attempt:v.number()},returns:v.any(),handler:async(ctx,args)=>{
 const d=await ctx.db.get('precheckDocuments',args.documentId);if(!d||d.status!=='checking'||d.attempt!==args.attempt||!d.fileId)return null;
 const run=await ctx.db.get('precheckRuns',d.runId);if(!run||d.revision!==run.revision)return null;
 const file=await ctx.db.system.get('_storage',d.fileId);return{fileId:d.fileId,contentType:file?.contentType,url:await ctx.storage.getUrl(d.fileId)};
}});
export const result=internalMutation({args:{documentId:v.id('precheckDocuments'),attempt:v.number(),reading:readingValidator},returns:v.null(),handler:async(ctx,args)=>{
 const d=await ctx.db.get('precheckDocuments',args.documentId);if(!d||d.status!=='checking'||d.attempt!==args.attempt)return null;
 const run=await ctx.db.get('precheckRuns',d.runId);if(!run||run.revision!==d.revision)return null;
 const r=args.reading;
 let status=assessName(d.expectedName,r.holderName,r.readable&&!r.uncertain),reason=status==='passed'?'The printed holder name matches this guest.':status==='review'?'The holder name could not be read confidently. Host review is needed.':'The printed name does not match this guest. Check the guest details or send their correct ID.';
 if(r.documentType!==d.type){status='replacement';reason='This does not appear to be the selected document type. Please send the correct document.';}
 if(!r.fictional){status='replacement';reason='This public test accepts clearly marked fictional samples only. Please use a sample document; real-ID validation is not enabled.';}
 await ctx.db.patch('precheckDocuments',d._id,{status,reason,reading:r,checkedAt:Date.now(),method:'Image AI + name comparison (fictional test)'});
 await event(ctx,run,status==='passed'?`The sample ID name check for ${d.expectedName} has passed. Thank you!`:`${d.expectedName}: ${reason}`,'result');
 // Real documents accidentally submitted to this demo are removed immediately.
 if(!r.fictional&&d.fileId){await ctx.storage.delete(d.fileId);await ctx.db.patch('precheckDocuments',d._id,{fileId:undefined,reading:undefined});}
 await reconcile(ctx,run.bookingId);return null;
}});
export const failed=internalMutation({args:{documentId:v.id('precheckDocuments'),attempt:v.number()},returns:v.null(),handler:async(ctx,args)=>{
 const d=await ctx.db.get('precheckDocuments',args.documentId);if(!d||d.status!=='checking'||d.attempt!==args.attempt)return null;
 await ctx.db.patch('precheckDocuments',d._id,{status:'failed',reason:'The name-check service could not finish. Your upload is saved; retry the check.'});const run=await ctx.db.get('precheckRuns',d.runId);if(run&&run.revision===d.revision)await event(ctx,run,`${d.expectedName}'s check could not finish. The upload is saved—please retry from the checklist.`,'result');return null;
}});
export const retry=mutation({args:{token:v.string(),documentId:v.id('precheckDocuments')},returns:v.null(),handler:async(ctx,args)=>{
 const d=await ctx.db.get('precheckDocuments',args.documentId);if(!d)throw new ConvexError('Document not found.');const run=(await ctx.db.get('precheckRuns',d.runId))!;await ownedBooking(ctx,args.token,run.bookingId);
 if(d.status!=='failed'||d.revision!==run.revision||!d.fileId||d.expiresAt<=Date.now())throw new ConvexError('Please submit a new document.');if(d.attempt>=3)throw new ConvexError('This check has reached its retry limit. Please try a fresh upload later.');
 const attempt=d.attempt+1;await ctx.db.patch('precheckDocuments',d._id,{status:'checking',attempt});await workflow.start(ctx,internal.precheckWorkflow.check,{documentId:d._id,attempt});await ctx.scheduler.runAfter(180000,internal.precheck.failed,{documentId:d._id,attempt});return null;
}});
export const abandon=internalMutation({args:{documentId:v.id('precheckDocuments')},returns:v.null(),handler:async(ctx,{documentId})=>{const d=await ctx.db.get('precheckDocuments',documentId);if(d?.status==='uploading')await ctx.db.patch('precheckDocuments',documentId,{status:'replacement',reason:'Upload did not finish. Please try again.'});return null;}});
export const expire=internalMutation({args:{documentId:v.id('precheckDocuments')},returns:v.null(),handler:async(ctx,{documentId})=>{const d=await ctx.db.get('precheckDocuments',documentId);if(!d)return null;if(d.fileId)await ctx.storage.delete(d.fileId);await ctx.db.patch('precheckDocuments',documentId,{fileId:undefined,reading:undefined,...(['uploading','checking','failed','review'].includes(d.status)?{status:'expired' as const,reason:'The test upload expired after 24 hours. Please upload again.'}:{})});return null;}});
export const hostList=query({args:{},returns:v.any(),handler:async ctx=>{await requireAdmin(ctx);const runs=await ctx.db.query('precheckRuns').withIndex('by_creation_time').order('desc').take(25);return await Promise.all(runs.map(async run=>({...(await precheckSummary(ctx,run.bookingId)),booking:await ctx.db.get('sandboxBookings',run.bookingId)})));}});
export const hostDocument=query({args:{documentId:v.id('precheckDocuments')},returns:v.any(),handler:async(ctx,{documentId})=>{await requireAdmin(ctx);const doc=await ctx.db.get('precheckDocuments',documentId);if(!doc)return null;return{...doc,url:doc.fileId?await ctx.storage.getUrl(doc.fileId):null};}});
export const hostReview=mutation({args:{documentId:v.id('precheckDocuments'),accept:v.boolean(),reason:v.string()},returns:v.null(),handler:async(ctx,args)=>{
 await requireAdmin(ctx);const d=await ctx.db.get('precheckDocuments',args.documentId);if(!d||!['review','replacement'].includes(d.status)||!d.fileId||!d.reading?.fictional)throw new ConvexError('This document is not available for review.');const run=(await ctx.db.get('precheckRuns',d.runId))!;if(d.revision!==run.revision)throw new ConvexError('This checklist has changed.');
 const latest=(await ctx.db.query('precheckDocuments').withIndex('by_run',q=>q.eq('runId',run._id)).take(401)).filter(x=>x.revision===run.revision&&x.guestIndex===d.guestIndex&&x.type===d.type).at(-1);if(latest?._id!==d._id)throw new ConvexError('A newer upload replaced this document.');
 if(args.reason.trim().length<5||args.reason.length>500)throw new ConvexError('Add a short review reason.');
 await ctx.db.patch('precheckDocuments',d._id,{status:args.accept?'passed':'replacement',reason:args.reason.trim(),method:'Host review (fictional test)',checkedAt:Date.now()});await event(ctx,run,`The host has ${args.accept?'accepted':'requested a replacement for'} ${d.expectedName}'s sample document. ${args.reason.trim()}`,'result');await reconcile(ctx,run.bookingId);return null;
}});
// Protected creation of a fictional booking against an imported property for host testing.
export const createTest=mutation({args:{propertyId:v.id('properties'),token:v.string(),names:v.array(v.string()),requirements:requirementsValidator,arrivalDate:v.string(),departureDate:v.string()},returns:v.id('sandboxBookings'),handler:async(ctx,args)=>{
 await requireAdmin(ctx);validateSetup(args.names,args.requirements,args.names.length);if(!/^[a-f0-9]{64}$/.test(args.token))throw new ConvexError('Invalid test session.');
 const p=await ctx.db.get('properties',args.propertyId);if(!p)throw new ConvexError('Property not found.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(args.arrivalDate)||!/^\d{4}-\d{2}-\d{2}$/.test(args.departureDate)||args.departureDate<=args.arrivalDate)throw new ConvexError('Choose valid arrival and departure dates.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(args.token)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const existing=await ctx.db.query('sandboxSessions').withIndex('by_token_hash',q=>q.eq('tokenHash',hash)).first();if(existing)throw new ConvexError('Create a fresh test session.');
 const sessionId=await ctx.db.insert('sandboxSessions',{tokenHash:hash,expiresAt:Date.now()+30*86400000,usage:0,windowStart:Date.now()});const threadId=await createThread(ctx,components.agent,{userId:sessionId,title:'Host property pre-check-in test'});
 const context={guestName:args.names[0],guestCount:args.names.length,propertyName:p.name,arrivalDate:args.arrivalDate,departureDate:args.departureDate,checkInTime:p.checkInTime,checkOutTime:p.checkOutTime,location:p.address,directions:p.directions||'',entry:p.entryInstructions,parking:p.parkingDetails||'',houseRules:p.houseRules,idRequirements:requirementText(args.requirements)};
 const bookingId=await ctx.db.insert('sandboxBookings',{sessionId,context,generation:0,threadId});
 const runId=await ctx.db.insert('precheckRuns',{bookingId,propertyId:p._id,names:args.names.map(n=>n.trim()),requirements:args.requirements,revision:1,email:'booking-contact@example.test',complete:false,arrivalProvided:false,paused:false,replyReminderSent:false,lastReminderAt:0,createdAt:Date.now(),updatedAt:Date.now()});const run=(await ctx.db.get('precheckRuns',runId))!;await event(ctx,run,`Let's finish pre-check-in for all ${args.names.length} guests. Please share ${requirementText(args.requirements)} for each person using the checklist. Use fictional samples only in this test.`,'setup');return bookingId;
}});
export const provideArrival=mutation({args:access,returns:v.null(),handler:async(ctx,args)=>{const{booking}=await ownedBooking(ctx,args.token,args.bookingId);const run=await runFor(ctx,booking._id);if(!run||run.arrivalProvided)return null;const c=booking.context;if(!c.location||!c.entry||!c.checkInTime||!c.houseRules)throw new ConvexError('The host must add location, entry instructions, check-in time and house rules first.');await event(ctx,run,`For your arrival: check-in is at ${c.checkInTime}. ${c.location}. ${c.entry} House rules: ${c.houseRules}`,'arrival');await ctx.db.patch('precheckRuns',run._id,{arrivalProvided:true});await reconcile(ctx,booking._id);return null;}});
