// Template/event smoke checks in Node. These do not replace visual browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultDraft,quote} from '../model.js?v=combined-12';
import * as workflow from '../workflow-model.js?v=combined-12';
let bootId=0;
const RealDate=Date;
const FULL={billingStreet:'1 Bill St',billingCity:'Boston',billingState:'MA',billingZip:'02101',billingAddress:'1 Bill St, Boston, MA 02101'};
const MARY={id:'mary',type:'person',name:'Mary Thompson',phone:'401-555-0100',email:'mary@example.com',company:'',...FULL};
async function boot(url,bookings=[],work={},people=[MARY]){
 const names=['document','window','location','history','localStorage','sessionStorage','navigator','Date','matchMedia'];
 const saved=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const events={},root={innerHTML:''},announcement={textContent:''},storage=new Map([['business-hq-prototype-v1',JSON.stringify(bookings)],['business-hq-workflows-v3',JSON.stringify(work)],...(people?[['business-hq-people-v1',JSON.stringify(people)]]:[])]),session=new Map();
 const store=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)});
 const values={matchMedia:()=>({matches:true}),document:{activeElement:null,querySelector:s=>s==='#app'?root:s==='#announcement'?announcement:s==='#main'?{focus(){}}:null,addEventListener:(name,fn)=>{(events[name]??=[]).push(fn);},getElementById:()=>null,querySelectorAll:()=>[]},window:{innerWidth:1024,addEventListener(){},scrollTo(){}},location:new URL(url),history:{replaceState(_a,_b,next){globalThis.location=new URL(next,globalThis.location);}},localStorage:store(storage),sessionStorage:store(session),navigator:{},Date:class extends RealDate{constructor(...args){super(...(args.length?args:['2026-11-06T18:00:00Z']));}static now(){return RealDate.parse('2026-11-06T18:00:00Z');}}};
 for(const name of names)Object.defineProperty(globalThis,name,{value:values[name],writable:true,configurable:true});
 try{await import('../app.js?render-smoke='+ ++bootId);}catch(err){for(const [name,d]of saved)d?Object.defineProperty(globalThis,name,d):delete globalThis[name];throw err;}
 return {root,storage,async click(action,id){for(const handler of events.click??[])await handler({target:{closest:()=>({dataset:{action,id}})},preventDefault(){}});},async pick(id,checked=true){for(const handler of events.change??[])await handler({target:{dataset:{homePick:id},checked}});},async answer(serviceId,question,value){for(const handler of events.change??[])await handler({target:{dataset:{wf:'answer',serviceId,question},value,type:'radio',checked:true}});},async recent(id,checked){for(const handler of events.change??[])await handler({target:{dataset:{recent:id},checked}});},restore(){for(const [name,d]of saved)d?Object.defineProperty(globalThis,name,d):delete globalThis[name];}};
}
test('combined customer home renders sharing, hours, recent services, and both promotion prices',async()=>{
 const page=await boot('https://example.test/?view=customer');try{assert.match(page.root.innerHTML,/Share Joe’s booking page/);assert.match(page.root.innerHTML,/Show opening hours/);assert.match(page.root.innerHTML,/Recently ordered/);assert.match(page.root.innerHTML,/From \$127\.50/);assert.match(page.root.innerHTML,/15% off/);assert.match(page.root.innerHTML,/10% off/);await page.click('hours');assert.match(page.root.innerHTML,/<h2 id="dialog-title">Hours<\/h2>/);assert.match(page.root.innerHTML,/Eastern Time/);}finally{page.restore();}
});
test('selecting another recent service opens its questions before scheduling',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('gutters',true);assert.match(page.root.innerHTML,/2 selected/);await page.click('rebook-selected');assert.match(page.root.innerHTML,/Let’s plan your visit/);assert.match(page.root.innerHTML,/Are gutter guards fitted/);}finally{page.restore();}
});
test('same-service quick rebooking uses current pricing and shows the schedule',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.click('rebook-selected');assert.match(page.root.innerHTML,/Find your time/);assert.match(page.root.innerHTML,/\$239\.25/);}finally{page.restore();}
});
test('owner sample still renders the field desk with Help and all four navigation areas',async()=>{
 const page=await boot('https://example.test/?view=owner&sample=1');try{for(const label of ['My day','Schedule','To do','My business','Field desk help','Load up once.'])assert.ok(page.root.innerHTML.includes(label));assert.match(page.root.innerHTML,/\$331\.50/);await page.click('hq-help');assert.match(page.root.innerHTML,/A simpler working day/);}finally{page.restore();}
});
test('loading and progressing legacy jobs preserves their agreed price and original promotion policy',async()=>{
 const d={...defaultDraft(),size:'small',start:795,accessConfirmed:true};delete d.promotionSnapshot;const b={id:'JHQ-OLD00123',draft:d,...quote(d),status:'confirmed'};
 const page=await boot('https://example.test/?view=owner',[b]);try{assert.match(page.root.innerHTML,/\$198/);await page.click('hq-job',b.id);await page.click('hq-way',b.id);await page.click('hq-start',b.id);assert.match(page.root.innerHTML,/In progress/);const stored=JSON.parse(page.storage.get('business-hq-prototype-v1'))[0];assert.equal(stored.total,198);assert.equal(stored.draft.promotionSnapshot.name,'October gutter special');}finally{page.restore();}
});

test('unchecking all recent services disables rebooking and cannot create an empty visit',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('leaves',false);assert.match(page.root.innerHTML,/data-action="rebook-selected" disabled/);await page.click('rebook-selected');assert.match(page.root.innerHTML,/Hi Mary, how can we help today/);}finally{page.restore();}
});
test('accepted fixed quotes render the exact total with no misleading automatic discount rows',async()=>{
 let work=workflow.requestQuote(workflow.freshWork(),{...defaultDraft(),services:['gutters'],stories:3});const id=work.quotes[0].id;work=workflow.offerQuote(work,id,220,120,'Includes the reviewed scope and travel.');
 const page=await boot('https://example.test/?view=customer',[],work);try{await page.click('wf-accept-quote',id);assert.match(page.root.innerHTML,/Owner-approved quote/);assert.match(page.root.innerHTML,/\$220/);assert.ok(!page.root.innerHTML.includes('class="bill-line discount"'));}finally{page.restore();}
});

test('service cards multi-select into one visit and booking sections open in order',async()=>{
 const page=await boot('https://example.test/?view=customer');try{
  assert.ok(!page.root.innerHTML.includes('data-action="home-continue"'));
  await page.pick('leaves');await page.pick('mowing');assert.match(page.root.innerHTML,/data-action="home-continue"/);
  await page.click('home-continue');assert.match(page.root.innerHTML,/First, where are we headed/);assert.match(page.root.innerHTML,/Preselected · tap to confirm/);
  assert.match(page.root.innerHTML,/step-section collapsed locked" data-section="details"/);
  await page.click('pick-property','mary-rental');assert.match(page.root.innerHTML,/Mary’s rental · Riverside · 8 miles from Joe/);
  assert.ok(!/step-section collapsed locked" data-section="details"/.test(page.root.innerHTML));
  await new Promise(resolve=>setTimeout(resolve)); // let the section-finish animation hook run before teardown
 }finally{page.restore();}
});
test('book-again review keeps Joe’s questions unanswered until the customer chooses',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('gutters',true);await page.click('rebook-selected');assert.match(page.root.innerHTML,/Are gutter guards fitted/);const guards=page.root.innerHTML.match(/<input type="radio"[^>]*data-question="guards"[^>]*>/g);assert.equal(guards.length,2);assert.ok(guards.every(radio=>!radio.includes(' checked')));assert.match(page.root.innerHTML,/<strong>Yes<\/strong><small>\+\$35 · adds 30 min<\/small>/);}finally{page.restore();}
});
test('choosing an answer card selects it and updates the total',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('gutters',true);await page.click('rebook-selected');
  await page.answer('gutters','guards','yes');assert.match(page.root.innerHTML,/<input type="radio"[^>]*value="yes"[^>]*data-question="guards"[^>]* checked>/);assert.match(page.root.innerHTML,/Joe’s prep: Gutter-guard removal tools/);
  await page.click('stories','2');assert.match(page.root.innerHTML,/class="choice selected" aria-pressed="true" data-action="stories" data-id="2"/);
 }finally{page.restore();}
});
test('pressing Done early keeps the section open and explains what is missing',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('gutters',true);await page.click('rebook-selected');
  assert.match(page.root.innerHTML,/section-done incomplete" data-action="section-done" data-id="details"/);assert.ok(!/data-id="details" disabled/.test(page.root.innerHTML));
  await page.click('section-done','details');assert.match(page.root.innerHTML,/Finish the highlighted items to continue\./);assert.ok(page.root.innerHTML.includes('data-need="stories"'));assert.ok(!/step-section done[^>]*data-section="details"/.test(page.root.innerHTML));
 }finally{page.restore();}
});
test('start times stay hidden until a day is picked, then follow that day’s hours',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.click('rebook-selected');
  assert.match(page.root.innerHTML,/Pick a day to see Joe’s open times/);assert.ok(!page.root.innerHTML.includes('data-action="slot"'));
  assert.ok(!/data-action="next"[^>]* disabled/.test(page.root.innerHTML),'both Continue buttons stay pressable before a time is picked');
  assert.match(page.root.innerHTML,/class="week-day" aria-pressed="false"[^>]*data-action="date" data-id="2026-10-30"/);assert.match(page.root.innerHTML,/<small>Off<\/small>/);
  await page.click('date','2026-10-30');assert.match(page.root.innerHTML,/Joe works 8 AM–12 PM/);assert.match(page.root.innerHTML,/data-action="slot" data-id="495"/);
  await page.click('date','2026-10-29');assert.match(page.root.innerHTML,/Joe works 1–5 PM/);assert.match(page.root.innerHTML,/data-action="slot" data-id="795"/);assert.ok(!page.root.innerHTML.includes('data-action="slot" data-id="495"'));
  await page.click('week-shift','2026-11-02');assert.match(page.root.innerHTML,/Nov 2 – Nov 8, 2026/);
 }finally{page.restore();}
});
test('a section waits for Done even when every choice is made',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('gutters',true);await page.click('rebook-selected');
  const done=id=>new RegExp(`class="panel step-section[^"]* done[^"]*" data-section="${id}"`).test(page.root.innerHTML);
  await page.click('size','small');await page.click('haul','no');await page.click('stories','1');await page.answer('leaves','debris','no');await page.answer('gutters','guards','no');
  assert.ok(!done('details'),'all answered, Done not pressed');await page.click('section-done','details');assert.ok(done('details'),'Done pressed');
  await page.click('next');await page.click('date','2026-10-29');await page.click('slot','795');
  assert.ok(!done('time'),'time picked, Done not pressed');assert.match(page.root.innerHTML,/step-section[^"]*" data-section="contact"/);await page.click('section-done','time');assert.ok(done('time'),'Done pressed');
  await new Promise(resolve=>setTimeout(resolve));
 }finally{page.restore();}
});
test('a first-time visitor gets a generic greeting and none of Mary’s details',async()=>{
 const page=await boot('https://example.test/?view=customer',[],{},null);try{const home=page.root.innerHTML;assert.match(home,/Hi, how can we help today\?/);assert.ok(!home.includes('Hi Mary'));assert.ok(!home.includes('Recently ordered'));assert.ok(!home.includes('WELCOME BACK'));
  await page.pick('mowing');await page.click('home-continue');assert.ok(!page.root.innerHTML.includes('Mary’s home'));
  await page.click('home');await page.click('demo-returning');assert.match(page.root.innerHTML,/Hi Mary, how can we help today\?/);assert.match(page.root.innerHTML,/Recently ordered/);
  await page.click('new-customer');assert.match(page.root.innerHTML,/Hi, how can we help today\?/);assert.equal(page.storage.get('business-hq-people-v1'),'[]');
 }finally{page.restore();}
});
test('the greeting uses whoever the app knows, and owner sample jobs don’t count',async()=>{
 const sarah={...MARY,id:'p1',name:'Sarah Lee',email:''};let page=await boot('https://example.test/?view=customer',[],{},[sarah]);try{assert.match(page.root.innerHTML,/Hi Sarah, how can we help today\?/);assert.ok(!page.root.innerHTML.includes('Recently ordered'));}finally{page.restore();}
 const d={...defaultDraft(),start:795};page=await boot('https://example.test/?view=customer',[{id:'JHQ-S',draft:d,...quote(d),status:'confirmed',demoScenario:true}],{},null);try{assert.match(page.root.innerHTML,/Hi, how can we help/);}finally{page.restore();}
 page=await boot('https://example.test/?view=customer',[{id:'JHQ-R',draft:d,...quote(d),status:'confirmed'}],{},null);try{assert.match(page.root.innerHTML,/Hi Mary, how can we help/);}finally{page.restore();}
});
test('invoice details are required, then who Joe should expect defaults to the person billed',async()=>{
 const other={...MARY,id:'p2',name:'Sam Reed',phone:'401-555-0199',email:'sam@example.com',company:'Reed Holdings'};
 const page=await boot('https://example.test/?view=customer',[],{},[MARY,other]);try{await page.click('rebook-selected');await page.click('date','2026-10-29');await page.click('slot','795');await page.click('section-done','time');
  const done=id=>new RegExp(`class="panel step-section[^"]* done[^"]*" data-section="${id}"`).test(page.root.innerHTML);
  assert.match(page.root.innerHTML,/Where should the invoice go\?/);assert.match(page.root.innerHTML,/locked" data-section="contact"/);
  await page.click('section-done','billing');assert.ok(!done('billing'));assert.match(page.root.innerHTML,/Finish the highlighted items/);
  await page.click('bill-person','p2');await page.click('bill-address','service');await page.click('section-done','billing');assert.ok(done('billing'));assert.match(page.root.innerHTML,/Sam Reed · Reed Holdings · 12 Maple Lane/);
  assert.match(page.root.innerHTML,/Same as the person billed/);assert.match(page.root.innerHTML,/id="expect-billed"[^>]* checked/);assert.match(page.root.innerHTML,/id="expect-mary"/);assert.ok(!page.root.innerHTML.includes('id="name"'));
  await page.click('section-done','contact');await page.click('next');assert.match(page.root.innerHTML,/Invoice to Sam Reed/);assert.match(page.root.innerHTML,/<strong>Sam Reed<\/strong><small>401-555-0199/);
  await page.click('next');const saved=JSON.parse(page.storage.get('business-hq-prototype-v1'))[0].draft;assert.equal(saved.billing.person.company,'Reed Holdings');assert.equal(saved.name,'Sam Reed');
  await new Promise(resolve=>setTimeout(resolve));
 }finally{page.restore();}
});
test('saved people can be removed after confirming, which clears them from this booking',async()=>{
 const other={...MARY,id:'p2',name:'Sam Reed',phone:'401-555-0199',email:'sam@example.com',company:'Reed Holdings'};const d={...defaultDraft(),start:795,billing:{person:{id:'p2',name:'Sam Reed',company:'Reed Holdings',phone:'401-555-0199',email:''},address:'1 Old St',addressId:'service'}};
 const page=await boot('https://example.test/?view=customer',[{id:'JHQ-OLD',draft:d,...quote(d),status:'confirmed'}],{},[MARY,other]);try{await page.click('rebook-selected');await page.click('date','2026-11-05');await page.click('slot','795');await page.click('section-done','time');
  await page.click('bill-person','p2');assert.match(page.root.innerHTML,/data-action="edit-bill-person" data-id="p2"/);
  await page.click('ask-remove','person:p2');assert.match(page.root.innerHTML,/Remove Sam Reed\?/);assert.equal(JSON.parse(page.storage.get('business-hq-people-v1')).length,2,'nothing removed until confirmed');await page.click('cancel-remove');assert.ok(!page.root.innerHTML.includes('Remove Sam Reed?'));
  await page.click('ask-remove','person:p2');await page.click('confirm-remove','person:p2');
  assert.deepEqual(JSON.parse(page.storage.get('business-hq-people-v1')).map(p=>p.id),['mary']);assert.ok(!page.root.innerHTML.includes('id="bill-person-p2"'));assert.ok(!/label class="addon property-option selected" for="bill-person/.test(page.root.innerHTML),'removing the billed person clears the choice');
  await page.click('home');await new Promise(resolve=>setTimeout(resolve));
 }finally{page.restore();}
});
test('billing a company asks who Joe should expect, and incomplete people must finish their details',async()=>{
 const co={...MARY,id:'c1',type:'company',name:'Lee Properties LLC',phone:'401-555-0133',email:'ap@lee.example'},thin={id:'t1',type:'person',name:'Tom Thin',phone:'401-555-0144',email:'',company:'',billingAddress:''};
 const page=await boot('https://example.test/?view=customer',[],{},[MARY,co,thin]);try{await page.click('rebook-selected');await page.click('date','2026-10-29');await page.click('slot','795');await page.click('section-done','time');
  await page.click('bill-person','t1');assert.match(page.root.innerHTML,/Edit Tom Thin/);assert.match(page.root.innerHTML,/data-action="save-person" disabled/);assert.ok(!/selected" for="bill-person-t1"/.test(page.root.innerHTML));await page.click('cancel-person');
  await page.click('bill-person','c1');assert.match(page.root.innerHTML,/Invoice|On file for Lee Properties LLC/);assert.match(page.root.innerHTML,/id="bill-address-person"[^>]* checked/);await page.click('section-done','billing');
  assert.ok(!page.root.innerHTML.includes('id="expect-billed"'));assert.ok(!page.root.innerHTML.includes('id="expect-c1"'));await page.click('section-done','contact');assert.match(page.root.innerHTML,/Finish the highlighted items/);
  await page.click('expect-person','mary');await page.click('section-done','contact');await page.click('next');assert.match(page.root.innerHTML,/Invoice to Lee Properties LLC/);assert.match(page.root.innerHTML,/<strong>Mary Thompson<\/strong>/);
  await new Promise(resolve=>setTimeout(resolve));
 }finally{page.restore();}
});
test('a company saved first doesn’t become who the app greets',async()=>{
 const page=await boot('https://example.test/?view=customer',[],{},[{...MARY,id:'c1',type:'company',name:'Lee Properties LLC'}]);try{assert.match(page.root.innerHTML,/Hi, how can we help today\?/);}finally{page.restore();}
});

