import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultDraft,quote,FALL_PROMO,LEGACY_PROMO,money,hoursStatus,hoursRange,easternNow,inFallPromo,fallPromoEnds} from '../model.js?v=combined-12';
import {PROPERTIES,recentServices,recentDraft,sampleDay,repeatDraft} from '../operations.js?v=combined-12';
import {getRules,publishRules,DEFAULT_RULES} from '../rules.js?v=combined-12';
import * as w from '../workflow-model.js?v=combined-12';
const legacy=()=>{const draft={...defaultDraft(),size:'small',propertyId:'mary-home'};delete draft.promotionSnapshot;return {id:'JHQ-LEGACY01',draft:{...draft,start:795},...quote(draft),status:'confirmed'};};

test('combined November visits apply per-service discounts, one travel charge, and correct December prices',()=>{
 const d={...defaultDraft(),services:['leaves','gutters'],date:'2026-11-05'};let q=quote(d);
 assert.equal(q.total,347.25);assert.equal(q.travel,48);assert.equal(q.discount,45.75);assert.equal(q.discounts.length,2);assert.equal(q.lines.reduce((n,l)=>n+l.amount,0)-q.discount+q.travel,q.total);
 assert.equal(quote({...d,date:'2026-12-03'}).total,393);assert.equal(quote({...d,date:'2027-11-04'}).total,347.25);
});
test('fall eligibility includes September through November, with explicit boundary and year behavior',()=>{
 for(const d of ['2026-09-01','2026-11-30','2027-10-28'])assert.equal(inFallPromo(d),true);
 for(const d of ['2026-08-31','2026-12-01','2027-01-01'])assert.equal(inFallPromo(d),false);
 assert.equal(fallPromoEnds('2027-10-28'),'Nov 30');
});
test('pre-existing agreed jobs keep their original total when customer-approved work is added',()=>{
 const b=legacy();assert.equal(b.total,198);const work=w.proposeExtra(w.freshWork(),[b],b.id,'Extra cleanup',25,0,'');const result=w.respondExtra(work,[b],work.extras[0].id,true);
 assert.equal(result.bookings[0].total,223);assert.equal(result.work.invoices[0].total,223);assert.equal(b.total,198);
});
test('legacy gutter bookings retain the old October-only policy on rescheduling',()=>{
 const d={...defaultDraft(),services:['gutters'],promotionSnapshot:structuredClone(LEGACY_PROMO),date:'2026-10-29'};
 assert.equal(quote(d).total,156);assert.equal(quote({...d,date:'2026-11-05'}).total,168);
});
test('promotion snapshots protect newly agreed totals when a later campaign changes rates',()=>{
 const d={...defaultDraft(),size:'small'};const before=quote(d).total,original=FALL_PROMO.rates.leaves;
 try{FALL_PROMO.rates.leaves=.5;assert.equal(quote(d).total,before);assert.equal(quote({...defaultDraft(),size:'small'}).total,123);}finally{FALL_PROMO.rates.leaves=original;}
});
test('fixed owner quotes clear all calculated promotion rows and extras stay outside the fixed offer',()=>{
 const d={...defaultDraft(),services:['gutters'],stories:3,approvedOffer:{total:220,minutes:120}};const q=quote(d);
 assert.equal(q.total,220);assert.equal(q.discount,0);assert.deepEqual(q.discounts,[]);assert.equal(q.subtotal+q.travel-q.discount,q.total);
 const extra=quote({...d,extraWork:[{id:'E',title:'Downspout',amount:25,minutes:15}]});assert.equal(extra.total,245);assert.deepEqual(extra.discounts,[]);
});
test('fractional promotional prices are rounded and formatted as cents',()=>{
 assert.equal(money(127.5),'$127.50');assert.equal(money(108),'$108');assert.equal(money(.1),'$0.10');
 const d={...defaultDraft(),size:'small'};d.catalogSnapshot.leaves.base=150.10;assert.equal(quote(d).total,175.58);
});
test('recent service history uses the newest completed order and ignores cancelled or unknown services',()=>{
 const p=structuredClone(PROPERTIES[0]),b=sampleDay()[0];b.status='completed';b.draft.date='2026-11-05';b.draft.services=['gutters'];
 p.orderHistory.push({date:'2026-09-01',services:['removed-service']});const list=recentServices(p,[b]);
 assert.equal(list[0].id,'gutters');assert.equal(list[0].date,'2026-11-05');assert.ok(!list.some(s=>s.id==='removed-service'));
 b.status='cancelled';assert.equal(recentServices(p,[b]).find(s=>s.id==='gutters').date,'2025-10-16');
});
test('recent-order fast path retains known scope but changed services or questions require review',()=>{
 assert.equal(recentDraft(PROPERTIES[0],[],['leaves']).needsReview,false);
 assert.equal(recentDraft(PROPERTIES[0],[],['leaves','gutters']).needsReview,true);
 const config=getRules();config.leaves.questions.push({key:'new-question',label:'Any new features?',type:'text',required:true,default:'',when:'',equals:'',price:0,minutes:0,prep:''});publishRules(config);
 try{const repeat=recentDraft(PROPERTIES[0],[],['leaves']);assert.equal(repeat.needsReview,true);assert.equal(repeat.draft.scopeConfirmed,false);}finally{publishRules(DEFAULT_RULES);}
});
test('a fresh repeat visit uses the current promotion, while its source remains on the legacy policy',()=>{
 const b=legacy();const repeat=w.repeatPreview([b],b.id,'weekly');assert.equal(repeat.visits[0].total,175.5);assert.equal(b.total,198);
 const fresh=repeatDraft(PROPERTIES[0],[{...b,status:'completed'}]);assert.equal(quote(fresh).total,175.5);
});
test('opening status handles before, during, and after Thursday hours in Eastern time',()=>{
 assert.equal(hoursStatus({day:4,minutes:779}).detail,'Opens 1 PM');assert.equal(hoursStatus({day:4,minutes:780}).open,true);assert.equal(hoursStatus({day:4,minutes:1020}).open,false);
 assert.equal(hoursStatus({day:0,minutes:900}).detail,'Opens 9 AM Monday');assert.equal(hoursRange([780,1020]),'1–5 PM');assert.equal(hoursRange([450,870]),'7:30 AM–2:30 PM');
 assert.deepEqual(easternNow(new Date('2026-11-05T18:00:00Z')),{day:4,minutes:780});
});

test('travel zone comes from the served city and state, and nothing else',async()=>{
 const {areaForCity}=await import('../model.js?v=combined-12');
 assert.equal(areaForCity('Riverside','RI'),'riverside');assert.equal(areaForCity(' east providence ','ri'),'east');
 assert.equal(areaForCity('Riverside','MA'),'outside');assert.equal(areaForCity('Boston','RI'),'outside');assert.equal(areaForCity(),'outside');
});
