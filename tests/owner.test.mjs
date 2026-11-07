import test from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../owner-model.js?v=combined-12';
import {sampleDay,respondToRainChange} from '../operations.js?v=combined-12';
import {freshWork,proposeExtra,invoiceFor,recordPayment,balance} from '../workflow-model.js?v=combined-12';
import {defaultDraft,validBooking,slots} from '../model.js?v=combined-12';

test('load-up readiness preserves checked quantities and surfaces shortages and unavailable equipment',()=>{
 const visits=sampleDay(),desk=f.freshDesk();desk.stock['Leaf bags']=4;desk.unavailable=['Rake'];
 let list=f.loadout(visits,visits[0].draft.date,desk,{'2026-10-29:material:Leaf bags:6':true});
 assert.equal(list.find(i=>i.label==='Leaf bags').short,2);assert.equal(list.find(i=>i.label==='Leaf bags').packed,true);assert.equal(list.find(i=>i.label==='Rake').unavailable,true);
 visits[0].draft.size='large';list=f.loadout(visits,visits[0].draft.date,desk,{'2026-10-29:material:Leaf bags:6':true});assert.equal(list.find(i=>i.label==='Leaf bags').packed,false);
});
test('a solo owner cannot start a second job or move an in-progress job backwards',()=>{
 const visits=sampleDay(),way=f.progressJob(visits,visits[0].id,'on_the_way');
 assert.equal(visits[0].jobProgress,undefined);const started=f.progressJob(way,visits[0].id,'in_progress');
 assert.throws(()=>f.progressJob(started,visits[1].id,'on_the_way'),/current job/);assert.throws(()=>f.progressJob(started,visits[0].id,'on_the_way'),/already in progress/);
 assert.throws(()=>f.progressJob(visits,visits[0].id,'in_progress',['2026-10-29']),/appointment change/);
});
test('completion records actual materials once, keeps payment outstanding, and advances the next job',()=>{
 const visits=sampleDay(),desk=f.freshDesk(),work=freshWork();visits.forEach(b=>invoiceFor(work,b));
 const result=f.completeFieldJob(desk,work,visits,visits[0].id,88,4,true);
 assert.equal(result.bookings[0].status,'completed');assert.equal(result.bookings[0].actualMinutes,88);assert.equal(result.desk.stock['Leaf bags'],20);assert.equal(desk.stock['Leaf bags'],24);assert.equal(balance(result.work.invoices[0]),175.5);
 assert.equal(f.dayOverview(result.bookings,'2026-10-29',result.desk,{},result.work).next.id,visits[1].id);
 assert.throws(()=>f.completeFieldJob(result.desk,result.work,result.bookings,visits[0].id,88,4,true),/completing/);
});
test('unconfirmed completion, insufficient materials, and pending approval leave the original job intact',()=>{
 const visits=sampleDay(),desk=f.freshDesk();desk.stock['Leaf bags']=2;
 assert.throws(()=>f.completeFieldJob(desk,freshWork(),visits,visits[0].id,90,6,true),/stock/);assert.equal(visits[0].status,'confirmed');
 assert.throws(()=>f.completeFieldJob(desk,freshWork(),visits,visits[0].id,90,0,false),/Confirm/);
 const work=proposeExtra(freshWork(),visits,visits[0].id,'More leaves',25,0,'');assert.throws(()=>f.completeFieldJob(desk,work,visits,visits[0].id,90,0,true),/approve or decline/);
});
test('bookings accept a missing email, but malformed supplied emails and missing phones are rejected',()=>{
 const d={...f.newPhoneDraft('2026-11-05'),name:'Test Customer',phone:'4015550199',property:'Test address',start:795};
 const b=f.addPhoneJob([],d,true);assert.equal(b.total,175.5);assert.equal(b.source,'phone');assert.equal(b.draft.email,'');
 assert.throws(()=>f.addPhoneJob([b],d,true),/available time/);assert.throws(()=>f.addPhoneJob([],d,false),/agreed/);
 assert.equal(validBooking({...d,ownerCreated:false}),'');assert.match(validBooking({...d,email:'invalid'}),/valid email/);assert.match(validBooking({...d,ownerCreated:false,phone:''}),/phone number/);
});
test('phone jobs obey scope, required questions, blocked days, and complete visit capacity',()=>{
 const d={...f.newPhoneDraft('2026-11-05'),name:'Test Customer',phone:'4015550199',property:'Test address',start:795};
 assert.throws(()=>f.addPhoneJob([],{...d,services:['gutters'],stories:3},true),/assessment/);
 const unanswered=structuredClone(d);unanswered.catalogSnapshot.leaves.questions[0].default='';assert.throws(()=>f.addPhoneJob([],unanswered,true),/Please answer/);
 assert.throws(()=>f.addPhoneJob([],d,true,['2026-11-05']),/available time/);assert.throws(()=>f.addPhoneJob([],{...d,services:['leaves','gutters','mowing']},true),/available time/);
});
test('proposed appointment changes hold capacity without moving or repricing the original appointment',()=>{
 const visits=sampleDay(),moved=f.proposeAppointment(visits,visits[1].id,'2026-12-03',795);
 assert.equal(moved[1].draft.date,'2026-10-29');assert.equal(moved[1].total,156);assert.equal(moved[1].pendingChange.total,168);
 assert.ok(!slots({...defaultDraft(),date:'2026-12-03'},moved).includes(795));
 const accepted=respondToRainChange(moved,visits[1].id,true);assert.equal(accepted[1].draft.date,'2026-12-03');assert.equal(accepted[1].total,168);assert.equal(accepted[1].previousAppointments[0].reason,'Customer accepted schedule change');
 assert.equal(visits[1].pendingChange,undefined);assert.throws(()=>f.proposeAppointment(moved,visits[1].id,'2026-11-12',795),/cannot be changed/);
});
test('To do separates owner actions from customer approvals and excludes cancelled jobs',()=>{
 const visits=sampleDay(),desk=f.freshDesk();desk.stock['Leaf bags']=2;
 const work=proposeExtra(freshWork(),visits,visits[0].id,'More leaves',25,0,'');let a=f.needsAttention(visits,work,desk,'2026-10-29');
 assert.ok(a.tasks.some(t=>t.kind==='access'));assert.ok(a.tasks.some(t=>t.kind==='kit'));assert.equal(a.waiting.length,1);
 visits[0].status='cancelled';a=f.needsAttention(visits,work,desk,'2026-10-29');assert.equal(a.waiting.length,0);
});
test('payment collection and completion are independent and summaries reflect partial payments',()=>{
 const visits=sampleDay(),work=freshWork();visits.forEach(b=>invoiceFor(work,b));const paid=recordPayment(work,work.invoices[0].id,50,'cash');
 const summary=f.dayOverview(visits,'2026-10-29',f.freshDesk(),{},paid);assert.equal(summary.collected,50);assert.equal(summary.balance,281.5);assert.equal(summary.remaining.length,2);
});
test('job notes and property notes remain separate and customer records group properties correctly',()=>{
 const visits=sampleDay();let desk=f.saveRecord(f.freshDesk(),visits[0].id,{note:'Leave beds alone'});desk=f.logEvent(desk,visits[0].id,'Site checked','2026-10-29T17:00:00Z');
 assert.equal(desk.jobs[visits[0].id].note,'Leave beds alone');assert.equal(desk.jobs[visits[0].id].events[0].label,'Site checked');assert.equal(f.recordFor(desk,visits[1].id).note,'');
 const repeat=structuredClone(visits[0]);repeat.id='REPEAT';repeat.draft.date='2026-11-05';assert.equal(f.customerList([...visits,repeat])[1].visits.length,2);
 assert.ok(f.mapLink(visits[0]).startsWith('https://www.google.com/maps/dir/?api=1&destination='));
});
test('approved extras become explicit work checklist items',()=>{
 const b=sampleDay()[0];b.draft.extraWork=[{id:'EXT-1',title:'Clear extra border'}];const tasks=f.jobTasks(b);assert.equal(tasks.length,4);assert.equal(tasks.at(-1).label,'Clear extra border');
});
test('cancelling a phone agreement releases capacity without erasing its history; paid or started work is protected',()=>{
 const visits=sampleDay(),work=freshWork();visits.forEach(b=>invoiceFor(work,b));
 const cancelled=f.cancelFieldJob(visits,work,visits[0].id,true);assert.equal(cancelled[0].status,'cancelled');assert.equal(visits[0].status,'confirmed');assert.ok(slots(visits[0].draft,cancelled).includes(795));
 assert.throws(()=>f.cancelFieldJob(visits,work,visits[0].id,false),/customer agreed/);
 const paid=recordPayment(work,work.invoices[0].id,10,'cash');assert.throws(()=>f.cancelFieldJob(visits,paid,visits[0].id,true),/payment/);
 const started=f.progressJob(visits,visits[0].id,'in_progress');assert.throws(()=>f.cancelFieldJob(started,work,visits[0].id,true),/unstarted/);
});
test('cancelled appointments remain in property history without counting toward agreed work value',()=>{
 const jobs=sampleDay(),work=freshWork();const cancelled=f.cancelFieldJob(jobs,work,jobs[0].id,true);const history=f.customerList(cancelled).find(c=>c.name==='Mary Thompson');assert.equal(history.visits[0].status,'cancelled');assert.equal(history.value,0);
});
