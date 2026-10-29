import { DEFAULT_RULES, getRules, effects } from './rules.js?v=workflows-3';
export const SERVICES = {
  leaves: { name: 'Fall leaf cleanup', category: 'Lawn & yard', icon: 'leaf', description: 'A fresh start for your lawn, beds, and walkways.', base: 150, minutes: 90, tools: ['Leaf blower', 'Rake', 'Leaf bags', 'Gloves'] },
  gutters: { name: 'Gutter cleaning', category: 'Home exterior', icon: 'house', description: 'Clear gutters. Flowing downspouts. Ready for the rain.', base: 120, minutes: 90, tools: ['Ladder', 'Gutter scoop', 'Hose', 'Safety equipment'] },
  sprinklers: { name: 'Sprinkler winterization', category: 'Irrigation', icon: 'water', description: 'Give your irrigation system a safe winter off.', base: 85, minutes: 60, tools: ['Air compressor', 'Hose adapters', 'Eye protection'] },
  mowing: { name: 'Lawn mowing', category: 'Lawn & yard', icon: 'sun', description: 'A neat cut, clean edges, and a tidy finish.', base: 40, minutes: 45, tools: ['Mower', 'Trimmer', 'Leaf blower'] }
};
export const AREAS = { east: { name: 'East Providence', miles: 6 }, riverside: { name: 'Riverside', miles: 8 }, outside: { name: 'Outside the service area', miles: null } };
export const DEMO_DATES = ['2026-10-29','2026-11-05','2026-11-12','2026-11-19','2026-11-26','2026-12-03','2026-12-10','2026-12-17','2027-10-28','2027-11-04'];
export const BUFFER = 15;
export const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:0, maximumFractionDigits:2 }).format(n);
export function duration(n) { return [Math.floor(n / 60) ? `${Math.floor(n / 60)} hr` : '', n % 60 ? `${n % 60} min` : ''].filter(Boolean).join(' '); }
export function time(n) { return `${Math.floor(n / 60) % 12 || 12}:${String(n % 60).padStart(2, '0')} ${n >= 720 ? 'PM' : 'AM'}`; }
export function dateLabel(date) { return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' }); }
export function defaultDraft() { return { catalogSnapshot:getRules(), answers:{}, services: ['leaves'], size: 'medium', haul: false, stories: 1, area: 'east', property: '12 Maple Lane (fictional demo address)', date: DEMO_DATES[0], start: null, name: 'Mary Thompson', email: 'mary@example.com', phone: '401-555-0100', notes: 'Please close the side gate when you leave.' }; }
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
    return { id, name: service.name, amount, details, minutes: work };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const gutter = lines.find(line => line.id === 'gutters');
  const discount = gutter && draft.date >= '2026-10-01' && draft.date <= '2026-10-31' ? Math.round(gutter.amount * 0.1 * 100) / 100 : 0;
  const area = AREAS[draft.area] ?? AREAS.outside;
  const travel = area.miles === null ? 0 : area.miles * 2 * 4;
  const selectedEffects=ids.map(id=>effects(id,draft));
  let result={ lines, subtotal, discount, travel, miles: area.miles, total: subtotal + travel - discount, minutes, block: minutes + BUFFER, serviceable: area.miles !== null, assessment: (ids.includes('gutters') && Number(draft.stories)>=3)||selectedEffects.some(e=>e.review), missing:selectedEffects.flatMap(e=>e.missing), tools:[...new Set(ids.flatMap(id=>SERVICES[id].tools).concat(draft.haul&&ids.includes('leaves')?['Haul-away trailer']:[],selectedEffects.flatMap(e=>e.prep)))] };
  if(draft.approvedOffer) { const offer=draft.approvedOffer; result={...result,lines:[{id:'approved-quote',name:ids.map(id=>SERVICES[id].name).join(' + '),details:'Owner-approved quote · travel included',amount:offer.total,minutes:offer.minutes}],subtotal:offer.total,discount:0,travel:0,total:offer.total,minutes:offer.minutes,block:offer.minutes+BUFFER,assessment:false,tools:[...new Set([...result.tools,...(offer.tools??[])])]}; }
  for(const extra of draft.extraWork??[]) { result.lines.push({id:extra.id,name:extra.title,details:'Additional work · customer approved',amount:extra.amount,minutes:extra.minutes});result.subtotal+=extra.amount;result.total+=extra.amount;result.minutes+=extra.minutes;result.block+=extra.minutes;result.tools=[...new Set([...result.tools,...(extra.tools??[])])]; }
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
  if (!draft.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) || draft.phone.replace(/\D/g, '').length < 10) return 'Add a name, valid email, and phone number to continue.';
  if (!draft.property.trim()) return 'Add the service address to continue.';
  return '';
}
