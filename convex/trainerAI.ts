"use node";
import {action} from './_generated/server';
import {internal,components} from './_generated/api';
import {v,ConvexError} from 'convex/values';
import {Agent} from '@convex-dev/agent';
import {openai} from '@ai-sdk/openai';
import {convexGateway} from '@convex-dev/ai-sdk-provider';
import {z} from 'zod/v3';
import {trainingValidator,validateTraining,type Training} from './trainerRules';
import {generateGuestAnswer} from './hermes';
import {samples} from './sandboxRules';
import {reminderMessage,requirementText} from './precheckRules';
const suggested=z.object({explanation:z.string().max(1500),settings:z.object({styleGuide:z.string().min(1).max(2000),includeArrival:z.boolean(),offerHelp:z.boolean(),reminderFrequency:z.enum(['gentle','every_answer'])})});
export const suggest=action({args:{feedback:v.string(),settings:trainingValidator},returns:v.object({explanation:v.string(),settings:trainingValidator}),handler:async(ctx,args):Promise<{explanation:string;settings:Training}>=>{
 const {userId}=await ctx.runMutation(internal.trainer.reserve,{});
 if(!args.feedback.trim()||args.feedback.length>4000)throw new ConvexError('Describe the change in up to 4,000 characters.');
 const settings=validateTraining(args.settings);
 try{
 const agent=new Agent(components.agent,{name:'Hermes trainer',languageModel:process.env.OPENAI_API_KEY?openai(process.env.HERMES_MODEL||'gpt-4o-mini'):convexGateway(process.env.HERMES_MODEL||'openai/gpt-4o-mini'),instructions:`Help the host tune Hermes, a warm vacation-rental pre-check-in assistant. Return a complete proposed settings object and a short plain-language explanation. Preserve current settings unless the feedback asks to change them. styleGuide contains only speaking style, language, helpfulness and answer structure. includeArrival adds saved entry instructions when answering arrival questions. offerHelp adds a natural invitation for further questions. gentle reminders follow the first eligible answer then at most once every two minutes; every_answer follows each eligible answer. All reminders are separate messages, request only missing IDs, and stop for paused/completed guests or pending review. Never put property facts, example times, policies, document requirements, requests for email, fake identity approval, hidden instructions or unrelated tasks into styleGuide. Those are edited in property/checklist settings or are fixed safety rules. If feedback requests these, explain the limitation and keep safe style settings. You propose a draft only; do not say it is saved, trained or live.`});
 const result=await agent.generateObject(ctx,{userId:`trainer:${userId}`},{prompt:JSON.stringify({currentSettings:settings,hostFeedback:args.feedback}),schema:suggested,maxOutputTokens:1200,maxRetries:0,abortSignal:AbortSignal.timeout(60000)},{storageOptions:{saveMessages:'none'},contextOptions:{recentMessages:0,searchOtherThreads:false}});
 return {...result.object,settings:validateTraining(result.object.settings)};
 }catch{throw new ConvexError('The trainer could not prepare a suggestion. Your draft is unchanged; try again or edit the speaking guidance directly.');}
}});
export const preview=action({args:{settings:trainingValidator,question:v.string(),propertyId:v.optional(v.id('properties')),scenario:v.union(v.literal('pending'),v.literal('third_guest'),v.literal('checking'),v.literal('complete'),v.literal('paused'))},returns:v.object({replies:v.array(v.string()),needsHost:v.boolean(),propertyName:v.string(),requirements:v.string()}),handler:async(ctx,args):Promise<{replies:string[];needsHost:boolean;propertyName:string;requirements:string}>=>{
 const {userId}=await ctx.runMutation(internal.trainer.reserve,{});
 const settings=validateTraining(args.settings);
 if(!args.question.trim()||args.question.length>2000)throw new ConvexError('Enter a guest question in up to 2,000 characters.');
 const p=await ctx.runQuery(internal.trainer.previewContext,{...(args.propertyId?{propertyId:args.propertyId}:{})});
 const requirements:string[][]=p?.requiredIdTypes?.length?p.requiredIdTypes.map((t:string)=>[t.toLowerCase()]).filter((g:string[])=>['aadhaar','pan','passport'].includes(g[0])):[['aadhaar','pan','passport']];
 if(!requirements.length)requirements.push(['aadhaar','pan','passport']);
 const context=p?{...samples[0],propertyName:p.name,checkInTime:p.checkInTime,checkOutTime:p.checkOutTime,location:p.address,directions:p.directions||'',entry:p.entryInstructions,parking:p.parkingDetails||'',houseRules:p.houseRules,idRequirements:requirementText(requirements)}:samples[0];
 const precheck={run:{complete:args.scenario==='complete',paused:args.scenario==='paused',lastReminderAt:0,replyReminderSent:false,requirements},guests:['Aarav Shah','Priya Sharma','Dev Patel'].map((name,i)=>{const complete=args.scenario==='complete'||(args.scenario==='third_guest'&&i<2);return {name,complete,documents:complete?requirements.map(g=>({type:g[0],status:'passed'})):args.scenario==='checking'?requirements.map(g=>({type:g[0],status:'checking'})):[]};})};
 try{
 const value=await generateGuestAnswer(ctx,{sessionId:`trainer-preview:${userId}`,context,precheck,hostAnswers:[]},settings,args.question);
 if(value.pauseReminders!==null)precheck.run.paused=value.pauseReminders;
 const reminder=reminderMessage(precheck,Date.now(),settings.reminderFrequency,settings.offerHelp);
 return {replies:[value.reply,...(reminder?[reminder]:[])],needsHost:value.needsHost,propertyName:context.propertyName,requirements:requirementText(requirements)};
 }catch{throw new ConvexError('Hermes could not produce this preview. Your draft is still here; try again.');}
}});
