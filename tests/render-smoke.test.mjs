// Template/event smoke checks in Node. These do not replace visual browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultDraft,quote} from '../model.js?v=combined-12';
import * as workflow from '../workflow-model.js?v=combined-12';
let bootId=0;
const RealDate=Date;
async function boot(url,bookings=[],work={}){
 const names=['document','window','location','history','localStorage','sessionStorage','navigator','Date','matchMedia'];
 const saved=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const events={},root={innerHTML:''},announcement={textContent:''},storage=new Map([['business-hq-prototype-v1',JSON.stringify(bookings)],['business-hq-workflows-v3',JSON.stringify(work)]]),session=new Map();
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

