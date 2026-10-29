import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_RULES,getRules,publishRules,visibleQuestions} from '../rules.js?v=owner-simple-4';
import {defaultDraft,quote,slots,validBooking} from '../model.js?v=owner-simple-4';
import {sampleDay} from '../operations.js?v=owner-simple-4';
import * as w from '../workflow-model.js';

test('conditional answers affect price, time and preparation only while visible',()=>{
 const d={...defaultDraft(),size:'small',answers:{leaves:{debris:'yes',rearAccess:'difficult'}}};
 assert.equal(quote(d).total,248);assert.equal(quote(d).minutes,120);assert.ok(quote(d).tools.includes('Small transport cart'));
 d.answers.leaves.debris='no';assert.equal(visibleQuestions('leaves',d).length,1);assert.equal(quote(d).total,198);assert.equal(quote(d).minutes,90);assert.ok(!quote(d).tools.includes('Small transport cart'));
});
test('published changes apply to new drafts, never snapshots of agreed scope',()=>{
 const old=defaultDraft(),config=getRules();config.leaves.base=180;publishRules(config);
 try{assert.equal(quote(defaultDraft()).total,303);assert.equal(quote(old).total,273);}finally{publishRules(DEFAULT_RULES);}
});
test('multiple services share one travel charge and sum duration and rules',()=>{
 const d={...defaultDraft(),size:'small',services:['leaves','mowing'],answers:{leaves:{debris:'yes'}}};
 const q=quote(d);assert.equal(q.total,268);assert.equal(q.minutes,150);assert.equal(q.travel,48);assert.equal(q.tools.filter(t=>t==='Leaf blower').length,1);
});
test('invalid studio rules and missing conditional answers are rejected',()=>{
 const config=getRules();config.leaves.questions[0].when='rearAccess';assert.throws(()=>publishRules(config),/earlier/);
 const d=defaultDraft();d.catalogSnapshot.leaves.questions[0].default='';d.answers={leaves:{debris:''}};assert.ok(validBooking({...d,start:795},[]).includes('Please answer'));
});
test('quote request is not a booking; an owner offer enables a reviewed slot and exact total',()=>{
 const d={...defaultDraft(),services:['gutters'],stories:3};assert.equal(slots(d).length,0);
 let work=w.requestQuote(w.freshWork(),d);const id=work.quotes[0].id;
 work=w.offerQuote(work,id,220,120,'Includes reviewed three-story access and travel.');
 const accepted=w.quotedDraft(work,id);accepted.start=795;
 assert.equal(quote(accepted).total,220);assert.equal(quote(accepted).travel,0);assert.equal(quote(accepted).assessment,false);assert.equal(validBooking(accepted), '');
 work=w.acceptQuoteBooking(work,accepted,'JHQ-12345678');assert.equal(work.quotes[0].status,'accepted');assert.throws(()=>w.quotedDraft(work,id),/no longer open/);
});
test('a revised quote invalidates an earlier customer review',()=>{
 let work=w.requestQuote(w.freshWork(),defaultDraft()),id=work.quotes[0].id;
 work=w.offerQuote(work,id,250,120,'Original scope');const old=w.quotedDraft(work,id);
 work=w.offerQuote(work,id,275,135,'Updated scope');assert.throws(()=>w.acceptQuoteBooking(work,old,'TEST'),/quote changed/);
});
test('extra work changes nothing until approval, then updates one visit and its invoice',()=>{
 const visits=sampleDay();let work=w.proposeExtra(w.freshWork(),visits,visits[1].id,'Clear downspout',25,15,'Drain brush');
 assert.equal(visits[1].total,156);const r=w.respondExtra(work,visits,work.extras[0].id,true);
 assert.equal(r.bookings[1].total,181);assert.equal(r.bookings[1].minutes,105);assert.ok(r.bookings[1].tools.includes('Drain brush'));assert.equal(r.work.invoices[0].total,181);
 assert.throws(()=>w.respondExtra(r.work,r.bookings,work.extras[0].id,true),/no longer/);
});
test('declining extra work preserves price and duration; a conflicting extension cannot be accepted',()=>{
 const visits=sampleDay(),work=w.proposeExtra(w.freshWork(),visits,visits[0].id,'More debris',20,15,'Rake');
 assert.throws(()=>w.respondExtra(work,visits,work.extras[0].id,true),/conflicts/);
 const r=w.respondExtra(work,visits,work.extras[0].id,false);assert.equal(r.bookings[0].total,198);assert.equal(r.bookings[0].minutes,90);assert.equal(r.work.extras[0].status,'declined');
});
test('pending extra work blocks completion and completion creates an unpaid invoice',()=>{
 const visits=sampleDay(),work=w.proposeExtra(w.freshWork(),visits,visits[1].id,'Downspout',25,15,'Brush');
 assert.throws(()=>w.finishJob(work,visits,visits[1].id,90),/approve or decline/);
 const r=w.respondExtra(work,visits,work.extras[0].id,false),done=w.finishJob(r.work,r.bookings,visits[1].id,98);
 assert.equal(done.bookings[1].status,'completed');assert.equal(done.bookings[1].actualMinutes,98);assert.equal(w.balance(done.work.invoices[0]),156);
});
test('partial, full and excess payments remain separate from job status',()=>{
 const visits=sampleDay(),work=w.freshWork(),invoice=w.invoiceFor(work,visits[0]);
 let paid=w.recordPayment(work,invoice.id,50,'cash');assert.equal(w.balance(paid.invoices[0]),148);assert.equal(visits[0].status,'confirmed');
 assert.throws(()=>w.recordPayment(paid,invoice.id,149,'demo'),/exceeds/);
 paid=w.recordPayment(paid,invoice.id,148,'demo');assert.equal(w.balance(paid.invoices[0]),0);assert.throws(()=>w.recordPayment(paid,invoice.id,1,'demo'),/exceeds/);
});
test('a repeat plan previews date-specific prices, then explicitly reserves three conflict-free visits',()=>{
 const visits=sampleDay(),p=w.repeatPreview(visits,visits[1].id,'weekly');assert.equal(p.visits.length,3);assert.equal(visits.length,2);
 assert.equal(p.visits[0].total,168);const r=w.confirmRepeat(w.freshWork(),visits,p);assert.equal(r.bookings.length,5);assert.equal(r.work.plans.length,1);
 for(const b of r.bookings)assert.equal(validBooking(b.draft,r.bookings,b.id),'');
 const paused=w.pauseRepeat(r.work,r.bookings,r.work.plans[0].id);assert.equal(paused.bookings.filter(b=>b.status==='cancelled').length,3);assert.equal(paused.bookings[1].status,'confirmed');
});
test('repeat confirmation rechecks capacity and pause protects paid appointments',()=>{
 const visits=sampleDay(),p=w.repeatPreview(visits,visits[0].id,'weekly'),r=w.confirmRepeat(w.freshWork(),visits,p);
 assert.throws(()=>w.confirmRepeat(r.work,r.bookings,p),/slot changed/);
 const i=r.work.invoices[0],paid=w.recordPayment(r.work,i.id,1,'demo');assert.throws(()=>w.pauseRepeat(paid,r.bookings,r.work.plans[0].id),/payment or has started/);
});

test('a changed scope cannot use an earlier agreed quote',()=>{
 let work=w.requestQuote(w.freshWork(),defaultDraft());const id=work.quotes[0].id;
 work=w.offerQuote(work,id,250,120,'Agreed property');const draft=w.quotedDraft(work,id);draft.property='Another property';
 assert.throws(()=>w.acceptQuoteBooking(work,draft,'TEST'),/scope changed/);
});
test('new repeat plans use newly published rules and agreed plans retain snapshots',()=>{
 const visits=sampleDay(),config=getRules();config.leaves.base=180;publishRules(config);
 try{const p=w.repeatPreview(visits,visits[0].id,'weekly');assert.equal(p.visits[0].total,228);assert.equal(visits[0].total,198);}finally{publishRules(DEFAULT_RULES);}
});
test('fractional demo payments are rounded consistently to cents',()=>{
 const work=w.freshWork(),invoice=w.invoiceFor(work,sampleDay()[0]);const paid=w.recordPayment(work,invoice.id,10.125,'demo');
 assert.equal(paid.invoices[0].payments[0].amount,10.13);assert.equal(w.balance(paid.invoices[0]),187.87);
});
