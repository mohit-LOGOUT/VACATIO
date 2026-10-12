import { ConvexError, v } from 'convex/values';
export const trainingValidator = v.object({styleGuide:v.string(),includeArrival:v.boolean(),offerHelp:v.boolean(),reminderFrequency:v.union(v.literal('gentle'),v.literal('every_answer'))});
export type Training = {styleGuide:string;includeArrival:boolean;offerHelp:boolean;reminderFrequency:'gentle'|'every_answer'};
export const defaultTraining:Training = {styleGuide:'Be a warm, attentive hotel receptionist. Give a useful, complete answer in natural language. Make the guest feel welcome and supported, without sales language or repetitive greetings.',includeArrival:true,offerHelp:true,reminderFrequency:'gentle'};
export function validateTraining(settings:Training){if(!settings.styleGuide.trim()||settings.styleGuide.length>2000)throw new ConvexError('Keep the speaking guidance between 1 and 2,000 characters.');return {...settings,styleGuide:settings.styleGuide.trim()};}
export function checkRevision(expected:number,current:number){if(expected!==current)throw new ConvexError('Training changed in another window. Reload saved training before saving your draft.');}
