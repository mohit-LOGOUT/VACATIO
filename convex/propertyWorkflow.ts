import { WorkflowManager } from '@convex-dev/workflow';
import { components,internal } from './_generated/api';
import { v } from 'convex/values';
const workflow=new WorkflowManager(components.workflow);
export const importProperty=workflow.define({args:{jobId:v.id('propertyImports'),sourceUrl:v.string(),userId:v.id('users')},returns:v.null()}).handler(async(step,args):Promise<null>=>{
 try {
  await step.runMutation(internal.admin.stage,{jobId:args.jobId,status:'reading'});
  const page=await step.runAction(internal.propertyImporter.read,{url:args.sourceUrl},{retry:false});
  await step.runMutation(internal.admin.stage,{jobId:args.jobId,status:'extracting'});
  const content=typeof page==='string'?{text:page,photos:[] as string[]}:page;
  const property=await step.runAction(internal.propertyImporter.extract,{page:content.text,userId:args.userId},{retry:false});
  const propertyId=await step.runMutation(internal.admin.complete,{jobId:args.jobId,property});
  try{await step.runAction(internal.propertyImporter.importPhotos,{jobId:args.jobId,propertyId,urls:content.photos},{retry:false});}catch{await step.runMutation(internal.admin.finishPhotos,{id:propertyId,jobId:args.jobId,failed:1,candidates:content.photos.length,error:true});}
 }catch(error){
  const message=error instanceof Error?error.message:'';
  const safe=message.match(/IMPORT: ([^\n]+)/)?.[1]??'The import could not finish. Retry, or add this property manually.';
  await step.runMutation(internal.admin.fail,{jobId:args.jobId,error:safe});
 }
 return null;
});

export const importPropertyPhotos=workflow.define({args:{jobId:v.id('propertyImports'),sourceUrl:v.string(),propertyId:v.id('properties')},returns:v.null()}).handler(async(step,args):Promise<null>=>{
 try{await step.runMutation(internal.admin.stage,{jobId:args.jobId,status:'importing_photos'});const urls=await step.runAction(internal.propertyImporter.readPhotos,{url:args.sourceUrl},{retry:false});await step.runAction(internal.propertyImporter.importPhotos,{jobId:args.jobId,propertyId:args.propertyId,urls},{retry:false});}
 catch{await step.runMutation(internal.admin.finishPhotos,{id:args.propertyId,jobId:args.jobId,failed:1,candidates:0,error:true});}return null;
});
