import {getRules} from './rules.js?v=owner-simple-4';
import {quote, slots, validBooking, DEMO_DATES, BUFFER} from './model.js?v=owner-simple-4';
export const freshWork=()=>({quotes:[],extras:[],invoices:[],plans:[],seasonal:[]});
export const uid=prefix=>`${prefix}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
const clone=x=>structuredClone(x);
const amount=(n,zero=false)=>{if(!Number.isFinite(n)||n<(zero?0:0.01)||n>100000)throw Error('Enter an amount between '+(zero?'0':'0.01')+' and 100,000.');return Math.round(n*100)/100;};
export function invoiceFor(work,b) {
  let invoice=work.invoices.find(i=>i.bookingId===b.id);
  if(!invoice){invoice={id:uid('INV'),bookingId:b.id,total:b.total,payments:[],reminders:0};work.invoices.push(invoice);}
  invoice.total=b.total;return invoice;
}
export const balance=i=>Math.max(0,Math.round((i.total-i.payments.reduce((n,p)=>n+p.amount,0))*100)/100);
export function requestQuote(work,draft) {
  if(!draft.name?.trim()||!draft.property?.trim()||!/^\S+@\S+\.\S+$/.test(draft.email)||draft.phone.replace(/\D/g,'').length<10)throw Error('Add a name, address, valid email, and phone number.');
  const q=quote(draft);if(!q.serviceable)throw Error('This address is outside Joe’s service area.');if(q.missing.length)throw Error('Please answer: '+q.missing.join(', '));
  const next=clone(work);next.quotes.push({id:uid('QTE'),draft:clone({...draft,start:null}),estimate:q.total,status:'requested',revision:0});return next;
}
export function offerQuote(work,id,total,minutes,note) {
  total=amount(total);if(!Number.isInteger(minutes)||minutes<15||minutes+BUFFER*2>240)throw Error('Quote 15–210 whole service minutes to fit the workday.');
  if(!note?.trim())throw Error('Describe the work included in this quote.');
  const next=clone(work),q=next.quotes.find(q=>q.id===id);if(!q||q.status==='accepted'||q.status==='declined')throw Error('This quote is no longer editable.');
  q.offer={total,minutes,note:note.trim()};q.revision++;q.status='offered';return next;
}
export function quotedDraft(work,id) {
  const q=work.quotes.find(q=>q.id===id);if(q?.status!=='offered')throw Error('This quote is no longer open.');
  return {...clone(q.draft),extraWork:[],approvedOffer:{...clone(q.offer),quoteId:id,revision:q.revision},start:null};
}
export function acceptQuoteBooking(work,draft,bookingId) {
  const next=clone(work);if(!draft.approvedOffer)return next;
  const q=next.quotes.find(q=>q.id===draft.approvedOffer.quoteId);
  if(q?.status!=='offered'||q.revision!==draft.approvedOffer.revision)throw Error('The quote changed. Review the latest offer before booking.');
  if(['services','size','haul','stories','area','property','answers','catalogSnapshot'].some(key=>JSON.stringify(draft[key])!==JSON.stringify(q.draft[key])))throw Error('The agreed scope changed. Request a revised quote before booking.');
  q.status='accepted';q.bookingId=bookingId;return next;
}
export function proposeExtra(work,bookings,id,title,price,minutes,prep) {
  price=amount(price);if(!title?.trim()||!Number.isInteger(minutes)||minutes<0||minutes>180)throw Error('Add a description and 0–180 whole extra minutes.');
  const b=bookings.find(b=>b.id===id);if(!b||b.status!=='confirmed'||b.pendingChange)throw Error('This visit cannot accept extra work right now.');
  if(work.extras.some(e=>e.bookingId===id&&e.status==='pending'))throw Error('Resolve the existing extra-work request first.');
  const next=clone(work);next.extras.push({id:uid('EXT'),bookingId:id,title:title.trim(),amount:price,minutes,tools:prep?.trim()?[prep.trim()]:[],status:'pending'});return next;
}
export function respondExtra(work,bookings,id,accept,blocked=[]) {
  const next=clone(work),visits=clone(bookings),e=next.extras.find(e=>e.id===id),b=visits.find(b=>b.id===e?.bookingId);
  if(e?.status!=='pending'||b?.status!=='confirmed'||b.pendingChange||blocked.includes(b.draft.date))throw Error('This request is no longer available on the current appointment.');
  if(accept){const draft={...b.draft,extraWork:[...(b.draft.extraWork??[]),clone(e)]};if(validBooking(draft,visits,b.id,blocked))throw Error('The extra time conflicts with the calendar. Joe must adjust the visit before you can approve it.');Object.assign(b,{draft,...quote(draft)});invoiceFor(next,b);}
  e.status=accept?'approved':'declined';return {work:next,bookings:visits};
}
export function finishJob(work,bookings,id,actual,blocked=[]) {
  if(!Number.isInteger(actual)||actual<1||actual>600)throw Error('Record 1–600 whole minutes.');
  const next=clone(work),visits=clone(bookings),b=visits.find(b=>b.id===id);
  if(b?.status!=='confirmed'||b.pendingChange||blocked.includes(b.draft.date))throw Error('Resolve the appointment change before completing this job.');
  if(next.extras.some(e=>e.bookingId===id&&e.status==='pending'))throw Error('The customer must approve or decline the extra work before completion.');
  b.status='completed';b.jobProgress='completed';b.actualMinutes=actual;invoiceFor(next,b);return {work:next,bookings:visits};
}
export function recordPayment(work,id,value,method) {
  const next=clone(work),i=next.invoices.find(i=>i.id===id);if(!i)throw Error('Invoice not found.');value=amount(value);
  if(value>balance(i))throw Error('The payment exceeds the outstanding balance.');if(!['demo','cash'].includes(method))throw Error('Choose a demo payment or recorded cash.');
  i.payments.push({id:uid('PAY'),amount:value,method});return next;
}
export function repeatPreview(bookings,sourceId,frequency,blocked=[]) {
  const source=bookings.find(b=>b.id===sourceId);if(!source||source.status==='cancelled')throw Error('Choose an active or completed visit to repeat.');
  if(!['weekly','fortnightly'].includes(frequency))throw Error('Choose weekly or every two weeks.');
  const visits=[],skipped=[];const step=frequency==='weekly'?7:14;let target=source.draft.date;
  for(let n=0;n<3;n++){
    const date=new Date(target+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+step);target=date.toISOString().slice(0,10);
    if(!DEMO_DATES.includes(target)){skipped.push({date:target,reason:'Outside the sample calendar'});continue;}
    const draft={...clone(source.draft),catalogSnapshot:getRules(),date:target,start:null,approvedOffer:undefined,extraWork:[]};
    if(quote(draft).assessment){skipped.push({date:target,reason:'A fresh owner quote is needed'});continue;}
    const available=slots(draft,[...bookings,...visits],null,blocked);draft.start=available.includes(source.draft.start)?source.draft.start:available[0];
    if(draft.start===undefined){skipped.push({date:target,reason:'No complete visit fits'});continue;}
    visits.push({id:uid('JHQ'),draft,...quote(draft),status:'confirmed'});
  }
  return {visits,skipped,sourceId,frequency};
}
export function confirmRepeat(work,bookings,preview,blocked=[]) {
  if(!preview.visits.length)throw Error('No repeat visits fit. Nothing has been reserved.');
  const next=clone(work),visits=clone(bookings),id=uid('PLN');
  for(const b of preview.visits){if(validBooking(b.draft,visits,null,blocked))throw Error('A repeat slot changed. Review a fresh plan.');const visit={...clone(b),planId:id};visits.push(visit);invoiceFor(next,visit);}
  next.plans.push({id,sourceId:preview.sourceId,frequency:preview.frequency,status:'active',bookingIds:preview.visits.map(b=>b.id)});return {work:next,bookings:visits};
}
export function pauseRepeat(work,bookings,id) {
  const next=clone(work),visits=clone(bookings),p=next.plans.find(p=>p.id===id);if(p?.status!=='active')throw Error('This plan is already paused.');
  const reserved=visits.filter(b=>b.planId===id&&b.status==='confirmed');
  if(reserved.some(b=>next.invoices.find(i=>i.bookingId===b.id)?.payments.length || b.jobProgress))throw Error('A visit has a payment or has started. Resolve that visit before pausing the plan.');
  reserved.forEach(b=>b.status='cancelled');p.status='paused';return {work:next,bookings:visits};
}
