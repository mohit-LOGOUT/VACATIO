'use strict';
const $ = id => document.getElementById(id);
const labels = {needs_human_review:'Needs review',pending:'Pending review',accepted:'Approved',rejected:'Rejected'};
let accessKey='', sampleMode=false, selected=null, currentStatus='needs_human_review', rows=[], cursor=null, loading=false;
let sessionEpoch=0, detailRequest=0;
const samples = [
 {id:'sample-1',guestName:'Aarav Shah',propertyName:'Pine House · Sample property',arrivalDate:'2026-10-12',documentType:'Aadhaar',reviewStatus:'needs_human_review',reason:'The photo is too blurry to read the name. Please check the uploaded document.',requirements:['Aadhaar'],expectedGuestCount:2,guests:[{name:'Aarav Shah',complete:false},{name:'Meera Shah',complete:false}]},
 {id:'sample-2',guestName:'Meera Shah',propertyName:'Pine House · Sample property',arrivalDate:'2026-10-12',documentType:'Aadhaar',reviewStatus:'needs_human_review',reason:'Document type unclear. A host needs to confirm this is the required ID.',requirements:['Aadhaar'],expectedGuestCount:2,guests:[{name:'Aarav Shah',complete:false},{name:'Meera Shah',complete:false}]},
 {id:'sample-3',guestName:'Kabir Rao',propertyName:'Sea House · Sample property',arrivalDate:'2026-10-13',documentType:'Passport',reviewStatus:'needs_human_review',reason:'The lower edge of the document is cropped. Check that all required details are visible.',requirements:['Passport'],expectedGuestCount:1,guests:[{name:'Kabir Rao',complete:false}]}
];
function el(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function error(message){$('error').textContent=message;$('error').hidden=!message;}
function notice(message){$('notice').textContent=message;$('notice').hidden=!message;}
function date(value){return new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));}
async function api(kind,path,args){
 if(!window.REVIEW_CONFIG?.convexUrl)throw new Error('Convex is not configured. Ask your host to finish the database connection.');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(window.REVIEW_CONFIG.convexUrl+'/api/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path,args:{...args,accessKey},format:'json'}),signal:controller.signal});
 const result=await response.json();if(!response.ok||result.status!=='success')throw new Error(result.errorMessage||'The database request failed. Please try again.');return result.value;
 }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw new Error('Could not reach Convex. Check your connection and try again.');throw e;}finally{clearTimeout(timer);}}
function drawQueue(){
 $('queue-summary').textContent=rows.length+' '+(rows.length===1?'document':'documents')+' in this view';
 $('queue').replaceChildren();
 if(!rows.length)$('queue').append(el('p',currentStatus==='needs_human_review'?'You’re caught up. No documents need review.':'No documents in this view.','queue-empty'));
 for(const row of rows){const button=el('button',undefined,'queue-item');button.setAttribute('aria-pressed',String(row.id===selected?.id));button.append(el('strong',row.guestName),el('span',row.propertyName),el('span','Arriving '+date(row.arrivalDate)),el('span',row.documentType+' · '+labels[row.reviewStatus],'flag'));button.onclick=()=>openDocument(row.id);$('queue').append(button);}
}
async function loadQueue(append=false){
 const epoch=sessionEpoch;
 if(loading)return;loading=true;error('');$('refresh').disabled=true;$('more').disabled=true;
 if(!append)$('queue-summary').textContent='Loading documents…';
 try{const result=sampleMode?{page:samples.filter(d=>d.reviewStatus===currentStatus),isDone:true,continueCursor:''}:await api('query','reviews:list',{status:currentStatus,paginationOpts:{numItems:25,cursor:append?cursor:null}});
 if(epoch!==sessionEpoch)return;
 rows=append?[...rows,...result.page]:result.page;cursor=result.continueCursor;$('more').hidden=result.isDone;
 $('access').hidden=true;$('reviews').hidden=false;$('signout').hidden=false;drawQueue();
 if(selected){if(rows.some(r=>r.id===selected.id))await openDocument(selected.id);else{selected=null;emptyDetail();}}else if(rows.length)await openDocument(rows[0].id);
 }catch(e){if(epoch===sessionEpoch){error(e.message);$('queue-summary').textContent='Documents could not be loaded.';}}finally{if(epoch===sessionEpoch){loading=false;$('refresh').disabled=false;$('more').disabled=false;}}}
function emptyDetail(){const wrap=el('div',undefined,'empty');wrap.append(el('h2','Select a document'),el('p','Choose a guest to see their ID and what needs attention.'));$('detail').replaceChildren(wrap);}
async function openDocument(id){
 const epoch=sessionEpoch, request=++detailRequest;
 error('');$('detail').replaceChildren(el('div','Loading document…','empty'));
 try{const doc=sampleMode?samples.find(d=>d.id===id):await api('query','reviews:detail',{documentId:id});if(epoch!==sessionEpoch||request!==detailRequest)return;if(!doc)throw new Error('This document is no longer available. Refresh the queue.');selected=doc;drawQueue();renderDetail(doc);}catch(e){if(epoch===sessionEpoch&&request===detailRequest){selected=null;emptyDetail();error(e.message);}}}
function renderDetail(doc){
 const head=el('div',undefined,'detail-head');head.append(el('h2',doc.guestName),el('p',doc.propertyName+' · Arriving '+date(doc.arrivalDate)),el('span',labels[doc.reviewStatus],'status'));
 const preview=el('div',undefined,'preview');
 if(sampleMode){const sheet=el('div',undefined,'sample-file');sheet.append(el('b','Sample '+doc.documentType),el('p',doc.guestName),el('p','Fictional document for exploring the review flow.'),el('p','Sample only · No identity information','sample-stamp'));preview.append(sheet);}
 else if(doc.url&&['image/jpeg','image/png','image/webp'].includes(doc.contentType)){const img=el('img');img.src=doc.url;img.alt=doc.documentType+' uploaded for '+doc.guestName;img.onerror=()=>preview.replaceChildren(el('p','The preview could not load. Open the original file below.'));preview.append(img);}
 else if(doc.url&&doc.contentType==='application/pdf'){const frame=el('iframe');frame.src=doc.url;frame.title='Uploaded '+doc.documentType+' PDF';frame.setAttribute('sandbox','');preview.append(frame);}
 else preview.append(el('p','A preview is not available. Open the original file to review it.'));
 const content=el('div',undefined,'review-content');if(!sampleMode&&doc.url){const link=el('a','Open original document','file-link');link.href=doc.url;link.target='_blank';link.rel='noopener noreferrer';content.append(link);}
 const assessment=el('div',undefined,'assessment');assessment.append(el('h3',['pending','needs_human_review'].includes(doc.reviewStatus)?'Why this needs a review':'Review note'),el('p',doc.reason),el('p','Required for this stay: '+doc.requirements.join(', '),'requirements'));content.append(assessment);
 content.append(el('h3','IDs for this booking'));const people=el('div',undefined,'people');for(const guest of doc.guests)people.append(el('span',guest.name+' — '+(guest.complete?'Complete':'ID needed')));const missing=Math.max(0,doc.expectedGuestCount-doc.guests.length);if(missing)people.append(el('span',missing+' other '+(missing===1?'guest':'guests')+' — ID needed'));content.append(people);
 if(['pending','needs_human_review'].includes(doc.reviewStatus)){
 const label=el('label','Review note');label.htmlFor='review-note';const note=el('textarea');note.id='review-note';note.maxLength=1000;note.placeholder='If rejecting, explain what the guest needs to fix.';
 const actions=el('div',undefined,'actions'),approve=el('button','Approve ID','primary'),reject=el('button','Reject & queue replacement','secondary');approve.onclick=()=>decide('accepted');reject.onclick=()=>decide('rejected');actions.append(approve,reject);content.append(label,note,actions,el('p','Replacement requests are saved to the queue. WhatsApp sending is not connected yet.','small'));
 }else content.append(el('p','This review is saved. Select another document to continue.','small'));
 $('detail').replaceChildren(head,preview,content);
}
async function decide(decision){
 const epoch=sessionEpoch;
 error('');const doc=selected,reason=$('review-note').value.trim();if(decision==='rejected'&&!reason){error('Add a review note so the guest knows what to fix.');$('review-note').focus();return;}
 if(decision==='accepted'&&!doc.requirements.includes(doc.documentType)){error('This document type does not match the property’s ID requirements.');return;}
 for(const b of $('detail').querySelectorAll('button'))b.disabled=true;
 try{if(sampleMode){doc.reviewStatus=decision;doc.reason=reason||'Approved by the host after manual review.';}else await api('mutation','reviews:decide',{documentId:doc.id,decision,reason});
 if(epoch!==sessionEpoch)return;
 notice((sampleMode?'Sample only — ':'')+(decision==='accepted'?'ID approved.':'ID rejected. Replacement request queued; it has not been sent on WhatsApp.'));selected=null;emptyDetail();await loadQueue();
 }catch(e){if(epoch===sessionEpoch){error(e.message);for(const b of $('detail').querySelectorAll('button'))b.disabled=false;}}}
$('access-form').onsubmit=async event=>{event.preventDefault();accessKey=$('key').value.trim();sampleMode=false;await loadQueue();if(!$('reviews').hidden)$('key').value='';};
$('sample').onclick=()=>{sessionEpoch++;detailRequest++;loading=false;sampleMode=true;accessKey='';currentStatus='needs_human_review';for(const button of document.querySelectorAll('[data-status]'))button.setAttribute('aria-pressed',String(button.dataset.status===currentStatus));notice('Sample reviews — fictional guests and documents. Changes stay in this tab and are not saved to Convex.');loadQueue();};
$('signout').onclick=()=>{sessionEpoch++;detailRequest++;loading=false;accessKey='';sampleMode=false;selected=null;rows=[];cursor=null;$('key').value='';$('access').hidden=false;$('reviews').hidden=true;$('signout').hidden=true;notice('');error('');emptyDetail();};
$('refresh').onclick=()=>loadQueue();$('more').onclick=()=>loadQueue(true);
for(const b of document.querySelectorAll('[data-status]'))b.onclick=()=>{if(loading)return;currentStatus=b.dataset.status;selected=null;emptyDetail();for(const button of document.querySelectorAll('[data-status]'))button.setAttribute('aria-pressed',String(button===b));loadQueue();};
