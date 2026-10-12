import {WorkflowManager} from '@convex-dev/workflow';
import {components,internal} from './_generated/api';
import {v} from 'convex/values';
const workflow=new WorkflowManager(components.workflow);
export const check=workflow.define({args:{documentId:v.id('precheckDocuments'),attempt:v.number()},returns:v.null()}).handler(async(step,args):Promise<null>=>{
 try{const reading=await step.runAction(internal.documentReader.read,args,{retry:{maxAttempts:2,initialBackoffMs:2000,base:2}});if(reading)await step.runMutation(internal.precheck.result,{...args,reading});}
 catch{await step.runMutation(internal.precheck.failed,args);}return null;
});
