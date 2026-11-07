import { DEFAULT_RULES, getRules, effects } from './rules.js?v=combined-11';
export const SERVICES = {
  leaves: { name: 'Fall leaf cleanup', category: 'Lawn & yard', icon: 'leaf', description: 'A fresh start for your lawn, beds, and walkways.', base: 150, minutes: 90, tools: ['Leaf blower', 'Rake', 'Leaf bags', 'Gloves'] },
  gutters: { name: 'Gutter cleaning', category: 'Home exterior', icon: 'house', description: 'Clear gutters. Flowing downspouts. Ready for the rain.', base: 120, minutes: 90, tools: ['Ladder', 'Gutter scoop', 'Hose', 'Safety equipment'] },
  sprinklers: { name: 'Sprinkler winterization', category: 'Irrigation', icon: 'water', description: 'Give your irrigation system a safe winter off.', base: 85, minutes: 60, tools: ['Air compressor', 'Hose adapters', 'Eye protection'] },
  mowing: { name: 'Lawn mowing', category: 'Lawn & yard', icon: 'sun', description: 'A neat cut, clean edges, and a tidy finish.', base: 40, minutes: 45, tools: ['Mower', 'Trimmer', 'Leaf blower'] }
};
export const AREAS = { east: { name: 'East Providence', miles: 6 }, riverside: { name: 'Riverside', miles: 8 }, outside: { name: 'Outside the service area', miles: null } };
// Travel zone for a city and state; anything Joe doesn't serve is 'outside'.
export function areaForCity(city = '', state = '') {
  const name = city.trim().toLowerCase(), st = state.trim().toUpperCase();
  if (st && st !== 'RI') return 'outside';
  return Object.keys(AREAS).find(id => AREAS[id].miles !== null && AREAS[id].name.toLowerCase() === name) ?? 'outside';
}
export const DEMO_DATES = ['2026-10-29','2026-11-05','2026-11-12','2026-11-19','2026-11-26','2026-12-03','2026-12-10','2026-12-17','2027-10-28','2027-11-04'];
export const BUFFER = 15;
// Fall seasonal promotion: discount rate per service for visits in September–November.
export const FALL_PROMO = { name: 'Fall seasonal promotion', months: [9, 10, 11], rates: { gutters: 0.10, leaves: 0.15 } };
// Existing bookings without a snapshot retain the policy they were booked under.
export const LEGACY_PROMO = {name:'October gutter special',months:[10],rates:{gutters:0.10},start:'2026-10-01',end:'2026-10-31'};
export const freshPromotion = () => structuredClone(FALL_PROMO);
export function promotionActive(date,policy){return !!policy&&policy.months.includes(Number(String(date).slice(5,7)))&&(!policy.start||date>=policy.start)&&(!policy.end||date<=policy.end);}
export const inFallPromo = date => promotionActive(date,FALL_PROMO);
const cents=n=>Math.round(n*100)/100;
// Last day of the promotion in the given date's year, e.g. "Nov 30".
export function fallPromoEnds(date) {
  const last = new Date(Date.UTC(Number(String(date).slice(0, 4)), Math.max(...FALL_PROMO.months), 0));
  return last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
// Opening hours by weekday (0 = Sunday), in minutes after midnight Eastern; null = closed.
export const HOURS = [null, null, null, null, [780, 1020], null, null];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const clock = n => `${Math.floor(n / 60) % 12 || 12}${n % 60 ? `:${String(n % 60).padStart(2, '0')}` : ''}`;
const meridiem = n => n >= 720 ? 'PM' : 'AM';
export const shortTime = n => `${clock(n)} ${meridiem(n)}`;
export function hoursRange(h) {
  if (!h) return 'Closed';
  const [open, close] = h;
  return meridiem(open) === meridiem(close) ? `${clock(open)}–${shortTime(close)}` : `${shortTime(open)}–${shortTime(close)}`;
}
export function easternNow(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(date).map(p => [p.type, p.value]));
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}
// Google-style status: "Open · Closes 5 PM" or "Closed · Opens 1 PM Thursday".
export function hoursStatus(now = easternNow()) {
  const today = HOURS[now.day];
  if (today && now.minutes >= today[0] && now.minutes < today[1]) return { open: true, label: 'Open', detail: `Closes ${shortTime(today[1])}` };
  for (let ahead = 0; ahead <= 7; ahead++) {
    const day = (now.day + ahead) % 7, h = HOURS[day];
    if (!h || (ahead === 0 && now.minutes >= h[0])) continue;
    return { open: false, label: 'Closed', detail: `Opens ${shortTime(h[0])}${ahead ? ` ${WEEKDAYS[day]}` : ''}` };
  }
  return { open: false, label: 'Closed', detail: '' };
}
export const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, maximumFractionDigits:2 }).format(n);
export function duration(n) { return [Math.floor(n / 60) ? `${Math.floor(n / 60)} hr` : '', n % 60 ? `${n % 60} min` : ''].filter(Boolean).join(' '); }
export function time(n) { return `${Math.floor(n / 60) % 12 || 12}:${String(n % 60).padStart(2, '0')} ${n >= 720 ? 'PM' : 'AM'}`; }
export function dateLabel(date) { return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' }); }
export function defaultDraft() { return { catalogSnapshot:getRules(), promotionSnapshot:freshPromotion(), answers:{}, services: ['leaves'], size: 'medium', haul: false, stories: 1, area: 'east', property: '12 Maple Lane (fictional demo address)', city: 'East Providence', state: 'RI', date: DEMO_DATES[0], start: null, name: 'Mary Thompson', email: 'mary@example.com', phone: '401-555-0100', notes: 'Please close the side gate when you leave.' }; }
export function quote(draft) {
  const ids = [...new Set(draft.services)].filter(id => SERVICES[id]);
  let minutes = 0;
  const lines = ids.map(id => {
    const service = SERVICES[id];
    let amount = service.base;
    let details = '';
    let work = service.minutes;
    if (id === 'leaves') { amount = { small: 150, medium: 225, large: 300 }[draft.size] ?? 225; work = { small: 90, medium: 120, large: 165 }[draft.size] ?? 120; details = `${draft.size} yard`; if (draft.haul) { amount += 35; work += 15; details += ' · haul-away included (+$35)'; } }
    if (id === 'mowing') { amount = { small: 40, medium: 55, large: 70 }[draft.size] ?? 55; details = `${draft.size} yard`; }
    if (id === 'gutters') { if (Number(draft.stories) === 2) { amount += 40; work += 30; } details = `${draft.stories} ${Number(draft.stories) === 1 ? 'story' : 'stories'}`; }
    if (id === 'leaves' && draft.propertyAllowance) { work += 15; details += ' · 15 min property allowance'; }
    const config=(draft.catalogSnapshot??getRules())[id], effect=effects(id,draft);
    amount += config.base - DEFAULT_RULES[id].base + effect.price;
    work += config.minutes - DEFAULT_RULES[id].minutes + effect.minutes;
    if(effect.price || effect.minutes) details += ` · answers add $${effect.price} / ${effect.minutes} min`;
    minutes += work;
    return { id, name: service.name, amount:cents(amount), details, minutes: work };
  });
  const subtotal = cents(lines.reduce((sum, line) => sum + line.amount, 0));
  const policy=draft.promotionSnapshot??LEGACY_PROMO;
  const discounts = promotionActive(draft.date,policy) ? lines.filter(line => policy.rates[line.id]).map(line => ({ id:line.id,name:line.name,label:policy.name,rate:policy.rates[line.id],amount:Math.round(Math.round(line.amount*100)*policy.rates[line.id])/100 })) : [];
  const discount = cents(discounts.reduce((sum, d) => sum + d.amount, 0));
  const area = AREAS[draft.area] ?? AREAS.outside;
  const travel = area.miles === null ? 0 : area.miles * 2 * 4;
  const selectedEffects=ids.map(id=>effects(id,draft));
  let result={ lines, subtotal, discount, discounts, travel, miles: area.miles, total: cents(subtotal + travel - discount), minutes, block: minutes + BUFFER, serviceable: area.miles !== null, assessment: (ids.includes('gutters') && Number(draft.stories)>=3)||selectedEffects.some(e=>e.review), missing:selectedEffects.flatMap(e=>e.missing), tools:[...new Set(ids.flatMap(id=>SERVICES[id].tools).concat(draft.haul&&ids.includes('leaves')?['Haul-away trailer']:[],selectedEffects.flatMap(e=>e.prep)))] };
  if(draft.approvedOffer) { const offer=draft.approvedOffer; result={...result,lines:[{id:'approved-quote',name:ids.map(id=>SERVICES[id].name).join(' + '),details:'Owner-approved quote · travel included',amount:offer.total,minutes:offer.minutes}],subtotal:offer.total,discount:0,discounts:[],travel:0,total:offer.total,minutes:offer.minutes,block:offer.minutes+BUFFER,assessment:false,tools:[...new Set([...result.tools,...(offer.tools??[])])]}; }
  for(const extra of draft.extraWork??[]) { result.lines.push({id:extra.id,name:extra.title,details:'Additional work · customer approved',amount:extra.amount,minutes:extra.minutes});result.subtotal=cents(result.subtotal+extra.amount);result.total=cents(result.total+extra.amount);result.minutes+=extra.minutes;result.block+=extra.minutes;result.tools=[...new Set([...result.tools,...(extra.tools??[])])]; }
  return result;
}
export function slots(draft, bookings = [], excludingId = null, blockedDates = []) {
  const q = quote(draft);
  if (!q.serviceable || q.assessment || !q.lines.length || !DEMO_DATES.includes(draft.date) || blockedDates.includes(draft.date)) return [];
  const result = [];
  // First departure and the final travel/setup buffer both fit Joe's 1–5 PM workday.
  for (let start = 780 + BUFFER; start + q.block <= 1020; start += 15) {
    if (!bookings.some(b => b.id !== excludingId && b.status !== 'cancelled' && [b, ...(b.pendingChange?.status === 'awaiting_customer' ? [{ draft: b.pendingChange.draft, block: quote(b.pendingChange.draft).block }] : [])].some(visit => visit.draft.date === draft.date && start < visit.draft.start + visit.block && start + q.block > visit.draft.start))) result.push(start);
  }
  return result;
}
export function validBooking(draft, bookings = [], excludingId = null, blockedDates = []) {
  if (quote(draft).missing.length) return 'Please answer: '+quote(draft).missing.join(', ');
  if (!quote(draft).serviceable) return 'This property is outside Joe’s demo service area.';
  if (quote(draft).assessment) return 'Homes with three or more stories need an assessment before booking.';
  if (!slots(draft, bookings, excludingId, blockedDates).includes(draft.start)) return 'That appointment no longer fits. Please choose an available time.';
  if (!draft.name.trim() || ((!draft.ownerCreated || draft.email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) || draft.phone.replace(/\D/g, '').length < 10) return 'Add a name, valid email, and phone number to continue.';
  if (!draft.property.trim()) return 'Add the service address to continue.';
  return '';
}
