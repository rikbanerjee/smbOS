import {SERVICES,DEMO_DATES,defaultDraft,quote,slots,validBooking} from './model.js?v=combined-11';
import {packingList} from './operations.js?v=combined-11';
import {finishJob,balance} from './workflow-model.js?v=combined-11';

export const OWNER_STORE='business-hq-field-desk-v1';
export const freshDesk=()=>({jobs:{},propertyNotes:{},unavailable:[],stock:{'Leaf bags':24}});
export function loadDesk(value){
  const d=freshDesk();if(!value||typeof value!=='object')return d;
  for(const key of ['jobs','propertyNotes','stock'])if(value[key]&&typeof value[key]==='object'&&!Array.isArray(value[key]))d[key]=value[key];
  d.unavailable=Array.isArray(value.unavailable)?value.unavailable.filter(x=>typeof x==='string'):[];
  return d;
}
const clone=x=>structuredClone(x);
export const propertyKey=b=>b.draft.propertyId||b.draft.property.trim().toLowerCase();
export function recordFor(desk,id){return desk.jobs[id]??{tasks:{},note:'',photos:[],events:[]};}
export function saveRecord(desk,id,patch){const next=clone(desk);next.jobs[id]={...recordFor(next,id),...patch};return next;}
export function logEvent(desk,id,label,at=new Date().toISOString()){
  return saveRecord(desk,id,{events:[...(recordFor(desk,id).events??[]),{label,at}]});
}
export function jobTasks(b){
  const tasks={leaves:['Clear the agreed lawn and beds',b.draft.haul?'Remove bagged leaves':'Bag leaves at the agreed collection point','Leave paths and access tidy'],gutters:['Confirm safe access to the agreed work','Clean gutters and check downspout flow','Tidy the work area'],sprinklers:['Confirm the system and agreed zones','Complete the agreed winterization','Record anything needing follow-up'],mowing:['Mow the agreed lawn','Trim edges and clear clippings','Leave gates as agreed']};
  return b.draft.services.flatMap(id=>(tasks[id]??[]).map((label,i)=>({key:id+':'+i,label,service:SERVICES[id].name}))).concat((b.draft.extraWork??[]).map(x=>({key:'extra:'+x.id,label:x.title,service:'Customer-approved additional work'})));
}
export function loadout(bookings,date,desk,packed={}){
  const p=packingList(bookings,date);
  return [
    ...p.tools.map(label=>({key:'tool:'+label,label,quantity:null,unavailable:desk.unavailable.includes(label)})),
    ...p.materials.map(m=>({key:`material:${m.name}:${m.quantity}`,label:m.name,quantity:m.quantity,unit:m.unit,stock:Number.isFinite(desk.stock[m.name])?desk.stock[m.name]:null,short:Number.isFinite(desk.stock[m.name])?Math.max(0,m.quantity-desk.stock[m.name]):0}))
  ].map(item=>({...item,packed:!!packed[`${date}:${item.key}`]}));
}
export function dayOverview(bookings,date,desk,packed,work){
  const visits=bookings.filter(b=>b.status!=='cancelled'&&b.draft.date===date).sort((a,b)=>a.draft.start-b.draft.start);
  const remaining=visits.filter(b=>b.status==='confirmed');
  const next=remaining.find(b=>b.jobProgress==='in_progress')??remaining.find(b=>b.jobProgress==='on_the_way')??remaining[0];
  const kit=loadout(bookings,date,desk,packed);
  const invoices=work.invoices.filter(i=>visits.some(b=>b.id===i.bookingId));
  return {visits,remaining,next,kit,packed:kit.filter(i=>i.packed).length,completed:visits.filter(b=>b.status==='completed').length,value:visits.reduce((n,b)=>n+b.total,0),balance:invoices.reduce((n,i)=>n+balance(i),0),collected:invoices.reduce((n,i)=>n+i.payments.reduce((a,p)=>a+p.amount,0),0)};
}
export function needsAttention(bookings,work,desk,date){
  const tasks=[],waiting=[];
  for(const q of work.quotes.filter(q=>q.status==='requested'))tasks.push({key:q.id,kind:'quote',title:q.draft.name+' needs a quote',detail:q.draft.property,action:'quotes'});
  for(const b of bookings.filter(b=>b.status==='confirmed')){
    if(!b.draft.accessConfirmed)tasks.push({key:b.id+':access',kind:'access',id:b.id,title:(b.draft.accessAnswered?'Review access from ':'Confirm access with ')+b.draft.name.split(' ')[0],detail:b.draft.property});
    if(b.changeDeclined)tasks.push({key:b.id+':change',kind:'change',id:b.id,title:b.draft.name+' needs another time',detail:'The proposed appointment was declined.'});
    if(b.pendingChange)waiting.push({key:b.id+':held',id:b.id,title:b.draft.name+' · new appointment',detail:'The original visit stays confirmed while the customer decides.'});
  }
  for(const x of work.extras.filter(x=>x.status==='pending')){
    const b=bookings.find(b=>b.id===x.bookingId&&b.status==='confirmed');if(b)waiting.push({key:x.id,id:b.id,title:b.draft.name+' · extra work',detail:x.title});
  }
  for(const i of work.invoices.filter(i=>balance(i)>0)){
    const b=bookings.find(b=>b.id===i.bookingId&&b.status==='completed');if(b)tasks.push({key:i.id,kind:'payment',id:b.id,title:'Payment from '+b.draft.name,detail:'The work is complete. '+balance(i).toFixed(2)+' USD remains.'});
  }
  for(const item of loadout(bookings,date,desk))if(item.unavailable||item.short)tasks.push({key:item.key,kind:'kit',title:item.short?`${item.short} more ${item.unit} needed`:'Get '+item.label+' ready',detail:item.label+' · selected workday',action:'kit'});
  return {tasks,waiting};
}
export function progressJob(bookings,id,step,blocked=[]){
  const next=clone(bookings),b=next.find(b=>b.id===id);
  if(!b||b.status!=='confirmed'||b.pendingChange||blocked.includes(b.draft.date))throw Error('Resolve the appointment change before starting this job.');
  if(!['on_the_way','in_progress'].includes(step))throw Error('Choose a valid job step.');
  if(b.jobProgress==='in_progress')throw Error('This job is already in progress.');
  if(b.jobProgress===step)throw Error('This step is already recorded.');
  if(next.some(other=>other.id!==id&&other.status==='confirmed'&&['on_the_way','in_progress'].includes(other.jobProgress)))throw Error('Finish the current job before starting another.');
  b.jobProgress=step;return next;
}
export function completeFieldJob(desk,work,bookings,id,actual,usedBags,confirmed,blocked=[]){
  const b=bookings.find(b=>b.id===id);if(!confirmed)throw Error('Confirm that the agreed work is complete.');
  if(!Number.isInteger(usedBags)||usedBags<0||usedBags>10000)throw Error('Enter a whole number of bags used.');
  if(usedBags&&(!b||!b.draft.services.includes('leaves')))throw Error('This job does not use leaf bags.');
  const result=finishJob(work,bookings,id,actual,blocked),next=clone(desk);
  const stock=next.stock['Leaf bags'];if(Number.isFinite(stock)&&usedBags>stock)throw Error('The recorded stock is lower than the bags used. Update My kit before completing.');
  if(Number.isFinite(stock))next.stock['Leaf bags']=stock-usedBags;
  next.jobs[id]={...recordFor(next,id),tasks:Object.fromEntries(jobTasks(b).map(t=>[t.key,true])),usedBags,completedAt:new Date().toISOString()};
  return {...result,desk:logEvent(next,id,'Work completed')};
}
export function addPhoneJob(bookings,draft,confirmed,blocked=[]){
  if(!confirmed)throw Error('Confirm the customer agreed to the work, price, and appointment.');
  const d=clone({...draft,ownerCreated:true}),q=quote(d);
  const error=validBooking(d,bookings,null,blocked);if(error)throw Error(error);
  if(q.minutes+30>240)throw Error('This job needs a reviewed scope that fits the workday.');
  return {id:'JHQ-'+crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase(),draft:d,...q,status:'confirmed',source:'phone'};
}
export function newPhoneDraft(date){return {...defaultDraft(),ownerCreated:true,name:'',phone:'',email:'',property:'',notes:'',access:'',accessConfirmed:false,size:'small',date:DEMO_DATES.includes(date)?date:DEMO_DATES[0]};}
export function proposeAppointment(bookings,id,date,start,blocked=[]){
  const next=clone(bookings),b=next.find(b=>b.id===id);
  if(!b||b.status!=='confirmed'||b.pendingChange||b.jobProgress)throw Error('This appointment cannot be changed right now.');
  const d={...clone(b.draft),date,start};
  const error=validBooking(d,next,id,blocked);if(error)throw Error(error);
  if(date===b.draft.date&&start===b.draft.start)throw Error('Choose a different appointment.');
  b.pendingChange={status:'awaiting_customer',reason:'Schedule change',draft:d,oldTotal:b.total,total:quote(d).total};b.changeDeclined=false;
  return next;
}
export function customerList(bookings){
  const map=new Map();
  for(const b of bookings){
    const key=propertyKey(b),row=map.get(key)??{key,name:b.draft.name,phone:b.draft.phone,email:b.draft.email,property:b.draft.property,visits:[],value:0};
    row.visits.push(b);if(b.status!=='cancelled')row.value+=b.total;map.set(key,row);
  }
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function mapLink(b){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(b.draft.property+' '+(b.draft.area==='riverside'?'Riverside, RI':'East Providence, RI'));}

export function cancelFieldJob(bookings,work,id,confirmed){
  if(!confirmed)throw Error('Confirm that the customer agreed to cancel.');
  const next=clone(bookings),b=next.find(b=>b.id===id),invoice=work.invoices.find(i=>i.bookingId===id);
  if(!b||b.status!=='confirmed'||b.jobProgress||b.pendingChange)throw Error('Only an unstarted appointment with no pending change can be released.');
  if(invoice?.payments.length)throw Error('This appointment has a payment. Resolve the payment before cancelling.');
  if(work.extras.some(x=>x.bookingId===id&&x.status==='pending'))throw Error('Resolve the pending extra-work request first.');
  b.status='cancelled';return next;
}
