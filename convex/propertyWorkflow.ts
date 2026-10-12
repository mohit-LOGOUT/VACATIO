import { WorkflowManager } from '@convex-dev/workflow';
import { components,internal } from './_generated/api';
import { v } from 'convex/values';
const workflow=new WorkflowManager(components.workflow);
export const importProperty=workflow.define({args:{jobId:v.id('propertyImports'),sourceUrl:v.string(),userId:v.id('users')},returns:v.null()}).handler(async(step,args):Promise<null>=>{
 try {
  await step.runMutation(internal.admin.stage,{jobId:args.jobId,status:'reading'});
  const page=await step.runAction(internal.propertyImporter.read,{url:args.sourceUrl},{retry:false});
  await step.runMutation(internal.admin.stage,{jobId:args.jobId,status:'extracting'});
  const property=await step.runAction(internal.propertyImporter.extract,{page,userId:args.userId},{retry:false});
  await step.runMutation(internal.admin.complete,{jobId:args.jobId,property});
 }catch(error){
  const message=error instanceof Error?error.message:'';
  const safe=message.match(/IMPORT: ([^\n]+)/)?.[1]??'The import could not finish. Retry, or add this property manually.';
  await step.runMutation(internal.admin.fail,{jobId:args.jobId,error:safe});
 }
 return null;
});
