import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { buildSync } from 'esbuild';
const result = buildSync({ entryPoints: ['convex/reviews.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const reviews = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));

function database() {
  const tables = {
    properties: [{_id:'property',name:'Test property',requiredIdTypes:['Aadhaar']}],
    bookings: [{_id:'booking',propertyId:'property',expectedGuestCount:2,onboardingStatus:'in_progress',arrivalInformationSentAt:123}],
    guests: [{_id:'guest1',bookingId:'booking',name:'Guest One'},{_id:'guest2',bookingId:'booking',name:'Guest Two'}],
    documents: [{_id:'document1',guestId:'guest1',documentType:'Aadhaar',reviewStatus:'needs_human_review'},{_id:'document2',guestId:'guest2',documentType:'Aadhaar',reviewStatus:'needs_human_review'}],
    escalations: [], messages: [],
  };
  const db = {
    get: async (table,id) => tables[table].find(row => row._id===id) || null,
    patch: async (table,id,fields) => Object.assign(tables[table].find(row=>row._id===id),fields),
    insert: async (table,fields) => {tables[table].push({...fields,_id:'new-'+tables[table].length}); return tables[table].at(-1)._id;},
    query: table => {
      const equals=[];
      return { withIndex(_name,callback){const builder={eq(field,value){equals.push([field,value]);return builder;}};callback(builder);return {take: async n => tables[table].filter(row=>equals.every(([field,value])=>row[field]===value)).slice(0,n)};} };
    },
  };
  return {tables,ctx:{db}};
}

test('review endpoints deny missing or wrong access keys before reading guest data', async () => {
  const original = process.env.REVIEW_ACCESS_KEY;
  try {
    delete process.env.REVIEW_ACCESS_KEY;
    for (const endpoint of [reviews.list,reviews.detail,reviews.decide]) await assert.rejects(endpoint._handler({}, {accessKey:''}), /access denied/);
    process.env.REVIEW_ACCESS_KEY = randomBytes(32).toString('hex');
    for (const endpoint of [reviews.list,reviews.detail,reviews.decide]) await assert.rejects(endpoint._handler({}, {accessKey:'wrong'}), /access denied/);
  } finally {if(original===undefined)delete process.env.REVIEW_ACCESS_KEY;else process.env.REVIEW_ACCESS_KEY=original;}
});

test('host decisions save a review, require all guest IDs, and queue one replacement per rejected document', async () => {
  const original=process.env.REVIEW_ACCESS_KEY;
  const accessKey=randomBytes(32).toString('hex');
  process.env.REVIEW_ACCESS_KEY=accessKey;
  try {
    const {tables,ctx}=database();
    const approve = id => reviews.decide._handler(ctx,{accessKey,documentId:id,decision:'accepted',reason:''});
    assert.equal((await approve('document1')).readyForCheckIn,false);
    assert.equal(tables.bookings[0].onboardingStatus,'in_progress');
    assert.equal((await approve('document2')).readyForCheckIn,true);
    assert.equal(tables.bookings[0].onboardingStatus,'ready_for_check_in');
    await assert.rejects(approve('document1'), /already been reviewed/);
    const rejected=database();
    const args={accessKey,documentId:'document1',decision:'rejected',reason:'Please send a clearer photo.'};
    await assert.rejects(reviews.decide._handler(rejected.ctx,{...args,reason:' '}), /Give the guest a reason/);
    assert.equal(rejected.tables.messages.length,0);
    const outcome=await reviews.decide._handler(rejected.ctx,args);
    assert.equal(outcome.replacementQueued,true);
    assert.equal(rejected.tables.documents[0].reviewStatus,'rejected');
    assert.equal(rejected.tables.messages[0].deliveryStatus,'pending');
    assert.match(rejected.tables.messages[0].text,/Please send a clearer photo/);
    await assert.rejects(reviews.decide._handler(rejected.ctx,args), /already been reviewed/);
    assert.equal(rejected.tables.messages.length,1);
  } finally {if(original===undefined)delete process.env.REVIEW_ACCESS_KEY;else process.env.REVIEW_ACCESS_KEY=original;}
});
