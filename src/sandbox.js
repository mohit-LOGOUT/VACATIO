import { ConvexClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
const $ = id => document.getElementById(id);
const client = window.REVIEW_CONFIG?.convexUrl ? new ConvexClient(window.REVIEW_CONFIG.convexUrl) : null;
let token = localStorage.getItem('hermes-session') || '';
let bookings = [], selected = localStorage.getItem('hermes-booking') || '', unsubscribe;
let activeRequest = null, editing = false, lastChatKey = '', following = true, wasBusy = false;
const drafts = new Map(), hostDrafts = new Map();
const fields = [
  ['guestName','Guest name','text'],['propertyName','Property name','text'],['arrivalDate','Arrival date','date'],['departureDate','Departure date','date'],['guestCount','Guest count','number'],
  ['checkInTime','Check-in time','time'],['checkOutTime','Check-out time','time'],['location','Location','text'],['directions','Directions','textarea'],['entry','Entry instructions','textarea'],['parking','Parking','textarea'],['houseRules','House rules','textarea'],['idRequirements','ID requirements','textarea'],
];
function node(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
function error(message = '') { $('page-error').textContent = message; $('page-error').hidden = !message; }
function readable(err) { const text = err?.message || 'Something went wrong. Try again.'; return text.split('Uncaught Error: ').at(-1).split('\n')[0].replace(/^\[CONVEX[^\]]*\]\s*/, ''); }
function current() { return bookings.find(b => b.id === selected); }
function date(s) { return new Intl.DateTimeFormat('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'UTC' }).format(new Date(s)); }
function time(s) { const [h,m] = s.split(':'); return `${Number(h)%12 || 12}:${m} ${Number(h)<12?'am':'pm'}`; }
function randomToken() { return [...crypto.getRandomValues(new Uint8Array(32))].map(x => x.toString(16).padStart(2,'0')).join(''); }
function wire() {
  unsubscribe?.();
  unsubscribe = client.onUpdate(api.sandbox.state, { token }, rows => {
    error(); bookings = rows;
    if (!current()) selected = rows[0]?.id;
    localStorage.setItem('hermes-booking', selected || '');
    $('workspace').hidden = false; $('unlock').hidden = true;
    render();
  }, err => { error(readable(err)); $('unlock').hidden = false; $('workspace').hidden = true; });
}
function render() {
  const b = current(); if (!b) return;
  const selector = $('booking-select'); selector.replaceChildren(...bookings.map(x => { const o = node('option', `${x.context.guestName} · ${x.context.propertyName}`); o.value=x.id; return o; })); selector.value=b.id;
  $('booking-summary').replaceChildren(node('h2', b.context.guestName, 'guest-name'),node('p',b.context.propertyName,'property-name'));
  const meta=node('div',undefined,'booking-meta');
  for(const [label,value] of [['Arrival',date(b.context.arrivalDate)],['Departure',date(b.context.departureDate)],['Guests',String(b.context.guestCount)],['Check-in',time(b.context.checkInTime)]]) { const group=node('p');group.append(node('span',label),node('strong',value));meta.append(group); }
  $('booking-summary').append(meta);
  const property=$('property-summary');property.replaceChildren();
  for(const [key,label] of fields.slice(5)){property.append(node('dt',label),node('dd',['checkInTime','checkOutTime'].includes(key)?time(b.context[key]):b.context[key]||'Not provided — Hermes will need host input.'));}
  $('chat-caption').textContent=`Chatting as ${b.context.guestName} · ${b.context.propertyName}`;
  $('chat-context').textContent=`${b.context.guestName} · ${b.context.propertyName}`;
  $('edit-details').disabled=b.busy; $('restart').disabled=b.busy;
  const failed=b.turns.find(t=>t.status==='failed');
  $('agent-status').textContent=b.busy?'Replying…':failed?'Unavailable':'Ready';
  $('message-input').disabled=b.busy || !!failed;updateSend();
  const key=JSON.stringify({id:b.id,generation:b.generation,guest:b.context.guestName,property:b.context.propertyName,turns:b.turns});
  if(key!==lastChatKey){
    lastChatKey=key; const area=$('messages');const scroll=area.scrollTop;
    area.replaceChildren();
    bubble(area,`Hi ${b.context.guestName}, I’m Hermes, your arrival assistant for ${b.context.propertyName}. Ask me about your stay.`,'hermes');
    for(const turn of b.turns){
      if(turn.kind==='host')area.append(node('div',`Host answer: ${turn.text}`,'host-note'));else bubble(area,turn.text,'guest',turn.createdAt);
      if(turn.reply)bubble(area,turn.reply,'hermes',turn.completedAt);
      if(turn.status==='failed'){
        const box=node('div',undefined,'reply-error');box.setAttribute('role','alert');box.append(node('p',turn.error||'Hermes couldn’t reply. Try again.'));const retry=node('button','Retry reply');retry.type='button';retry.addEventListener('click',()=>retryTurn(turn.id,retry));box.append(retry);area.append(box);
      }
    }
    if(b.busy)area.append(node('div','Hermes is replying…','typing'));
    if(following){area.scrollTop=area.scrollHeight;$('new-message').hidden=true;}else{area.scrollTop=scroll;$('new-message').hidden=false;}
  }
  if(wasBusy&&!b.busy&&!failed)$('message-input').focus({preventScroll:true}); wasBusy=b.busy;
  renderActivity(b);
}
function bubble(area,text,who,stamp){const message=node('div',undefined,`message ${who}`);message.append(node('p',text));if(stamp){const t=node('time',new Intl.DateTimeFormat('en-IN',{hour:'2-digit',minute:'2-digit'}).format(stamp));t.dateTime=new Date(stamp).toISOString();message.append(t);}area.append(message);}
function renderActivity(b){
  const area=$('activity');area.replaceChildren();const last=b.turns.at(-1);
  if(!last)area.append(node('p','Send Hermes a message to see which booking details it uses.','activity-empty'));
  else if(b.busy){const title=node('p',last.status==='queued'?'Reply queued':last.status==='reading'?'Reading booking':'Writing reply','activity-title');title.prepend(node('span',undefined,'busy-dot'));area.append(title,node('p','Using this booking’s saved property details and conversation.','activity-description'));}
  else if(last.status==='failed')area.append(node('p','Reply needs a retry','activity-title'),node('p','Your message is saved. Retry it in the chat after the connection is ready.','activity-description'));
  else {area.append(node('p',last.hostReason?'Host input needed':'Reply complete','activity-title'),node('p',last.sources.length?'Context sections used for the latest reply:':'No property details needed for this reply.','activity-description'));const labels=node('div',undefined,'source-labels');for(const source of last.sources)labels.append(node('span',source,'source-label'));area.append(labels);}
  // Do not replace an active host form while someone is typing.
  const issues=b.turns.filter(t=>t.hostReason&&!t.resolved);
  const issueKey=JSON.stringify({booking:b.id,busy:b.busy,issues:issues.map(t=>[t.id,t.hostReason]),hostTurns:b.turns.filter(t=>t.kind==='host').map(t=>[t.id,t.status])});
  if($('host-requests').dataset.key===issueKey)return;
  $('host-requests').dataset.key=issueKey;$('host-requests').replaceChildren();
  for(const issue of issues){const box=node('section',undefined,'issue');box.append(node('h3','Needs host answer'),node('p',issue.text),node('p',issue.hostReason));
    const form=node('form');const label=node('label','Host answer');const input=node('textarea');input.id=`host-${issue.id}`;label.htmlFor=input.id;input.maxLength=2000;input.required=true;input.value=hostDrafts.get(issue.id)||'';input.addEventListener('input',()=>hostDrafts.set(issue.id,input.value));const submit=node('button','Give answer to Hermes');submit.type='submit';submit.disabled=b.busy;form.append(label,input,submit);form.addEventListener('submit',event=>{event.preventDefault();send(input.value,issue.id,submit);});box.append(form);$('host-requests').append(box);
  }
}
function updateSend(){const b=current();$('send').disabled=!b||b.busy||b.turns.some(t=>t.status==='failed')||!$('message-input').value.trim()||!!activeRequest;}
async function send(text,hostRequestId,button){
  const b=current();if(!b||b.busy||!text.trim()||activeRequest)return;
  const payload={token,bookingId:b.id,text:text.trim(),requestId:randomToken(),...(hostRequestId?{hostRequestId}:{})};
  activeRequest=payload;button.disabled=true;error();following=true;
  try{
    // Retrying the exact request ID resolves a lost network acknowledgement safely.
    let result;try{result=await client.mutation(api.sandbox.send,payload);}catch(first){if(/network|fetch|connection/i.test(first.message))result=await client.mutation(api.sandbox.send,payload);else throw first;}
    if(hostRequestId){hostDrafts.delete(hostRequestId);}else{drafts.set(b.id,'');if(selected===b.id){$('message-input').value='';$('message-input').style.height='';}}
  }catch(err){error(readable(err));}finally{activeRequest=null;button.disabled=false;updateSend();}
}
async function retryTurn(turnId,button){button.disabled=true;error();try{await client.mutation(api.sandbox.retry,{token,turnId});}catch(err){error(readable(err));}finally{button.disabled=false;}}
$('composer').addEventListener('submit',e=>{e.preventDefault();send($('message-input').value,undefined,$('send'));});
$('message-input').addEventListener('input',()=>{drafts.set(selected,$('message-input').value);$('message-input').style.height='auto';$('message-input').style.height=`${Math.min(120,$('message-input').scrollHeight)}px`;updateSend();});
$('message-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!$('send').disabled)$('composer').requestSubmit();}});
$('messages').addEventListener('scroll',()=>{const a=$('messages');following=a.scrollHeight-a.scrollTop-a.clientHeight<60;if(following)$('new-message').hidden=true;});
$('new-message').addEventListener('click',()=>{following=true;$('messages').scrollTop=$('messages').scrollHeight;$('new-message').hidden=true;});
$('booking-select').addEventListener('change',()=>{if(editing&&!confirm('Discard your unsaved edits and switch bookings?')){$('booking-select').value=selected;return;}selected=$('booking-select').value;localStorage.setItem('hermes-booking',selected);closeEdit();$('message-input').value=drafts.get(selected)||'';following=true;lastChatKey='';wasBusy=false;error();render();});
function closeEdit(){editing=false;$('context-form').hidden=true;$('edit-details').hidden=false;$('save-status').textContent='';}
$('edit-details').addEventListener('click',()=>{const b=current();if(!b)return;editing=true;$('context-form').hidden=false;$('edit-details').hidden=true;const area=$('context-fields');area.replaceChildren();for(const [key,label,type]of fields){const l=node('label',label);l.htmlFor=`field-${key}`;const input=node(type==='textarea'?'textarea':'input');input.id=`field-${key}`;input.name=key;if(type!=='textarea')input.type=type;input.value=b.context[key];if(type==='number'){input.min='1';input.max='100';input.step='1';}else input.maxLength=2000;input.required=['guestName','propertyName','arrivalDate','departureDate','guestCount','checkInTime','checkOutTime','location'].includes(key);area.append(l,input);} $('field-guestName').focus();});
$('cancel-edit').addEventListener('click',closeEdit);
$('context-form').addEventListener('submit',async e=>{e.preventDefault();const b=current(),context={};for(const[key,,type]of fields)context[key]=type==='number'?Number($(`field-${key}`).value):$(`field-${key}`).value.trim();const button=e.submitter;button.disabled=true;error();try{await client.mutation(api.sandbox.edit,{token,bookingId:b.id,context});closeEdit();$('save-status').textContent='Test details saved. Hermes will use them in its next reply.';}catch(err){error(readable(err));}finally{button.disabled=false;}});
$('restart').addEventListener('click',()=>$('restart-dialog').showModal());
$('restart-dialog').addEventListener('close',async()=>{if($('restart-dialog').returnValue!=='restart')return;const b=current();error();try{await client.mutation(api.sandbox.restart,{token,bookingId:b.id});drafts.delete(b.id);$('message-input').value='';closeEdit();following=true;}catch(err){error(readable(err));}});
$('unlock-form').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;const button=e.submitter;button.disabled=true;error();const candidate=randomToken();try{await client.action(api.sandbox.open,{token:candidate,accessKey:$('access-key').value});token=candidate;localStorage.setItem('hermes-session',token);$('access-key').value='';wire();}catch(err){error(readable(err));}finally{button.disabled=false;}});
const fragment=new URLSearchParams(location.hash.slice(1));const supplied=fragment.get('session');if(supplied&&/^[a-f0-9]{64}$/.test(supplied)){token=supplied;localStorage.setItem('hermes-session',token);history.replaceState(null,'',location.pathname+location.search);}
if(innerWidth<768){$('booking-panel').open=false;$('activity-panel').open=false;}
if(!client){error('The Convex connection is not configured. Rebuild with CONVEX_URL set.');$('unlock').hidden=false;}else if(token)wire();else $('unlock').hidden=false;
if (window.parent !== window) {
  new ResizeObserver(() => window.parent.postMessage({ type: 'hermes-height', height: Math.ceil(document.body.getBoundingClientRect().height) + 24 }, location.origin)).observe(document.body);
}
