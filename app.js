import {createFieldDesk} from './owner-hq.js?v=combined-12';
import {calendarControls,calendarOverview,shiftPeriod,weekDates} from './calendar.js?v=combined-12';
import {DEFAULT_RULES,getRules,visibleQuestions} from './rules.js?v=combined-12';
import {createWorkflows,loadPublished,WORK_STORE,RULE_STORE} from './workflow-ui.js?v=combined-12';
import { SERVICES, AREAS, DEMO_DATES, BUFFER, FALL_PROMO, LEGACY_PROMO, freshPromotion, inFallPromo, fallPromoEnds, HOURS, WEEKDAYS, hoursFor, shortHours, hoursRange, hoursStatus, easternNow, money, duration, time, dateLabel, defaultDraft, areaForCity, quote, slots as modelSlots, validBooking as modelValidBooking } from './model.js?v=combined-12';
import { PROPERTIES, propertyHistory, recentServices, repeatDraft, recentDraft, packingList, sampleDay, proposeRainPlan, approveRainPlan, respondToRainChange, readiness } from './operations.js?v=combined-12';
import { repeatExperience, providerDay, weatherReview, customerWeatherCard } from './experience.js?v=combined-12';

const paths = {
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4.5m0 3h.01"/>',
  share: '<path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
  car: '<path d="m5 7 2-4h10l2 4m-16 4 2-4h14l2 4v7H3v-7Zm2 7v3m14-3v3M6 12h2m8 0h2"/>',
  rain: '<path d="M6 14a5 5 0 1 1 8-7 4 4 0 1 1 3 7M7 17l-2 4m8-4-2 4m8-4-2 4"/>',
  alert: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v1"/>',
  leaf: '<path d="M19 3C9 3 4 7 4 13a7 7 0 0 0 7 7c6 0 9-7 8-17Z"/><path d="M3 22 15 9M8 17v-5m0 5h5"/>',
  house: '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8M3 8h18M6 8v3m12-3v3"/>',
  water: '<path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12ZM8 15c0 2 1 3 3 3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>', back: '<path d="M20 12H5m5-5-5 5 5 5"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16m-11 4h2m3 0h2m-7 3h2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  bag: '<rect x="4" y="7" width="16" height="14" rx="3"/><path d="M8 7V5a4 4 0 0 1 8 0v2M9 13h6m-6 4h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="m5 12 4 4L19 6"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  repeat: '<path d="M20 8H7a4 4 0 0 0-4 4m17-4-4-4m4 4-4 4M4 16h13a4 4 0 0 0 4-4M4 16l4 4m-4-4 4-4"/>',
  phone: '<path d="m7 3 3 5-2 2c1 3 3 5 6 6l2-2 5 3-1 4C10 22 2 14 3 4l4-1Z"/>',
  star: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
  tool: '<path d="M15 4a5 5 0 0 0-6 6L3 16a3 3 0 0 0 5 5l6-6a5 5 0 0 0 6-6l-4 4-5-5 4-4Z"/>',
  receipt: '<path d="M6 3h12v19l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6m-6 4h3"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
  link: '<path d="m10 14 4-4m-6 7-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2-1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>', download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>'
};
const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.leaf}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const checked = v => v ? ' checked' : '';
const selected = v => v ? ' selected' : '';
loadPublished();
const STORE = 'business-hq-prototype-v1';
let storageAvailable = true;
let bookings = [];
try { bookings = JSON.parse(localStorage.getItem(STORE) || '[]').filter(b => b && typeof b.id === 'string' && b.draft && Array.isArray(b.draft.services) && Number.isFinite(b.total) && Number.isFinite(b.block)); } catch { bookings = []; storageAvailable = false; }
for(const b of bookings) { b.draft.catalogSnapshot ??= structuredClone(DEFAULT_RULES); b.draft.promotionSnapshot ??= structuredClone(LEGACY_PROMO); if(b.pendingChange){b.pendingChange.draft.catalogSnapshot ??= structuredClone(DEFAULT_RULES);b.pendingChange.draft.promotionSnapshot ??= structuredClone(LEGACY_PROMO);} }
const ownerViews=['owner','studio','quotes','jobs','plans','manage','field-job','field-add','field-tasks','field-kit','field-customers'];
let entryView='home';try{if(new URLSearchParams(location.search).get('view')==='owner'||new URLSearchParams(location.search).get('view')!=='customer'&&sessionStorage.getItem('business-hq-view-mode')==='owner')entryView='owner';}catch{}
let view = entryView, stage = 0, draft = { ...defaultDraft(), propertyId: 'mary-home' }, error = '', currentId = null, ownerDate = DEMO_DATES[0], dialog = null;
let focusMain = false, calendarMode='day', headerObserver=null, dialogReturnId=null, recentPick=null;
try{const savedDay=sessionStorage.getItem('business-hq-workday');if(DEMO_DATES.includes(savedDay))ownerDate=savedDay;}catch{}
let repeatPropertyId = PROPERTIES[0].id;
let packed = {}, blockedDates = [];
// Properties the customer added while booking, kept with the built-in demo ones and linked by customerId.
const CUSTOMER_ID = 'mary', PROPERTY_STORE = 'business-hq-properties-v1';
let addedProperties = [];
try { addedProperties = JSON.parse(localStorage.getItem(PROPERTY_STORE) || '[]').filter(p => p && typeof p.id === 'string' && typeof p.address === 'string'); } catch { addedProperties = []; }
// Customer edits to saved properties (address, access) are kept per property id and layered over the originals.
const EDIT_STORE = 'business-hq-property-edits-v1';
let propertyEdits = {}, editingProperty = null;
try { propertyEdits = JSON.parse(localStorage.getItem(EDIT_STORE) || '{}') || {}; } catch { propertyEdits = {}; }
const myProperties = () => [...PROPERTIES, ...addedProperties].filter(p => p.customerId === CUSTOMER_ID).map(p => ({ ...p, ...propertyEdits[p.id] }));
function persistProperties() { try { localStorage.setItem(PROPERTY_STORE, JSON.stringify(addedProperties)); localStorage.setItem(EDIT_STORE, JSON.stringify(propertyEdits)); } catch { storageAvailable = false; } }
// Fill the draft's address, access and scope details from a saved property, or clear them for a new one.
function useProperty(d, p) {
  if (!p) return Object.assign(d, { propertyId: 'new', property: '', city: '', state: 'RI', area: 'outside', access: '', parking: '', notes: '', accessConfirmed: false, propertyAllowance: false });
  return Object.assign(d, { propertyId: p.id, property: p.address, city: p.city, state: p.state, area: p.area, access: p.access, parking: p.parking, notes: '', stories: p.stories, size: p.size, accessConfirmed: p.accessConfirmed, propertyAllowance: p.propertyAllowance });
}
try { const saved = JSON.parse(localStorage.getItem('business-hq-operations-v2') || '{}'); packed = saved.packed && typeof saved.packed === 'object' ? saved.packed : {}; blockedDates = Array.isArray(saved.blockedDates) ? saved.blockedDates.filter(d => DEMO_DATES.includes(d)) : []; } catch { /* The demo still works without saved operational state. */ }
const slots = (d, list = bookings, id = null) => modelSlots(d, list, id, blockedDates);
const validBooking = (d, list = bookings, id = null) => modelValidBooking(d, list, id, blockedDates);
function persistOperations() { try { localStorage.setItem('business-hq-operations-v2', JSON.stringify({ packed, blockedDates })); } catch { storageAvailable = false; } }
function firstAvailableDate() { return DEMO_DATES.find(d => !blockedDates.includes(d)) || DEMO_DATES[0]; }
function startRepeat(edit = false) { const property = PROPERTIES.find(p => p.id === repeatPropertyId) || PROPERTIES[0]; draft = repeatDraft(property, bookings); draft.date = firstAvailableDate(); if (!edit) confirmChoices('place', 'services', 'size', 'stories'); stage = edit ? 0 : 1; currentId = null; navigate('book'); }

const app = document.querySelector('#app');
const wf=createWorkflows({esc,icon,getBookings:()=>bookings,setBookings:value=>{bookings=value;},getDraft:()=>draft,blocked:()=>blockedDates,persistBookings:()=>persist(),render:()=>render(),navigate:next=>navigate(next),openDialog:d=>openDialog(d),closeDialog:()=>{dialog=null;},error:message=>{error=message;},clearError:()=>{error='';},announce:message=>announce(message),storageError:()=>{storageAvailable=false;},startDraft:(value,step)=>{draft=value;stage=step;currentId=null;navigate('book');}});
const hq=createFieldDesk({esc,icon,bookings:()=>bookings,work:()=>wf.getWork(),date:()=>ownerDate,blocked:()=>blockedDates,packed:()=>packed,setPacked:value=>{packed=value;persistOperations();},setBookings:value=>{bookings=value;},setDate:value=>{ownerDate=value;},commit:result=>wf.commit(result),persist:()=>persist(),render:()=>render(),navigate:next=>navigate(next),schedule:()=>navigate('owner','week'),sample:()=>{const existing=bookings.find(b=>b.demoScenario&&b.status==='confirmed');if(existing)ownerDate=existing.draft.date;else{const visits=sampleDay(bookings,blockedDates);if(!visits.length){error='No complete sample day fits. Your existing bookings were preserved.';render();return;}bookings.push(...visits);ownerDate=visits[0].draft.date;persist();}navigate('owner');},rain:()=>{const plan=proposeRainPlan(bookings,ownerDate,blockedDates);openDialog({type:'rain',plan});},openDialog:d=>openDialog(d),closeDialog:()=>{dialog=null;},remind:id=>{wf.handle('wf-remind-payment',id);},error:message=>{error=message;},announce:message=>announce(message)});

function announce(message) { document.querySelector('#announcement').textContent = message; }
function persist() { wf.sync(); try { localStorage.setItem(STORE, JSON.stringify(bookings)); } catch { storageAvailable = false; } }
function navigate(next,mode='day') { if(next==='owner'){calendarMode=mode;if(mode==='day'&&!DEMO_DATES.includes(ownerDate))ownerDate=DEMO_DATES.find(d=>d.slice(0,7)===ownerDate.slice(0,7))||DEMO_DATES.find(d=>d>=ownerDate)||DEMO_DATES.at(-1);}const url=new URL(location.href);if(url.searchParams.has('view')){url.searchParams.delete('view');history.replaceState(null,'',url);}try{sessionStorage.setItem('business-hq-view-mode',ownerViews.includes(next)?'owner':'customer');}catch{} view = next; error = ''; dialog = null; focusMain = true; render(); }
function startBooking(id = 'leaves', previous = null) {
  draft = previous ? { ...previous, catalogSnapshot:getRules(), promotionSnapshot:freshPromotion(), extraWork:[], approvedOffer:undefined, services: [...previous.services], date: DEMO_DATES[0], start: null } : useProperty({ ...defaultDraft(), services: [id] }, myProperties()[0]);
  draft.date = firstAvailableDate(); stage = 0; currentId = null; navigate('book');
}
function shell(content) {
  const active = ownerViews.includes(view) ? 'owner' : view === 'bookings' ? 'bookings' : 'home';
  const brand = `<span class="brand-mark">${icon('leaf')}</span><span><strong>Joe’s Landscaping</strong><small>A little care. A better outdoors.</small></span>`;
  return `  <div class="shell ${active==='owner'?'owner-shell':'customer-shell'}"><aside class="sidebar"><a class="brand" href="#" data-action="${active==='owner'?'owner':'home'}">${brand}</a>
  <div><div class="nav-caption">${active==='owner'?'YOUR BUSINESS':'YOUR NEIGHBORHOOD, CARED FOR'}</div><nav class="nav-group" aria-label="${active==='owner'?'Owner navigation':'Customer navigation'}">
  ${active==='owner'?hq.nav(view,calendarMode):`  <button class="nav-item ${active === 'home' ? 'active' : ''}" ${active === 'home' ? 'aria-current="page"' : ''} data-action="home">${icon('grid')}<span>Book a service</span></button>
  <button class="nav-item ${active === 'bookings' ? 'active' : ''}" ${active === 'bookings' ? 'aria-current="page"' : ''} data-action="bookings">${icon('calendar')}<span>My bookings</span>${bookings.filter(b => b.status !== 'cancelled').length ? `<span class="pill">${bookings.filter(b => b.status !== 'cancelled').length}</span>` : ''}</button>
  <button class="nav-item ${active === 'owner' ? 'active' : ''}" ${active === 'owner' ? 'aria-current="page"' : ''} data-action="owner">${icon('bag')}<span>Joe’s workspace</span><span class="pill">DEMO</span></button>
`}
  </nav></div><div class="sidebar-note">${icon('leaf')}<strong>${active==='owner'?'Your business, one day at a time.':'Good work. Less back-and-forth.'}</strong>${active==='owner'?'Your next job. What to bring. What needs you. Everything else is in My business.':'Pick your services. Find a time. We’ll take care of the details.'}</div>
  <div class="powered"><span class="bhq">B</span><span>A small business, powered by <b>Business HQ</b></span></div></aside>
  <div class="workspace"><header class="topbar" data-action="hours"><div class="brand header-brand">${active==='owner'?`<a class="header-home" href="#" data-action="owner">${brand}</a>`:`<span class="header-home">${brand}</span>`}${hoursButton('booking-hours','header-hours',`<b>${active==='owner'?'Owner demo':'Customer demo'}</b>`)}</div><div class="top-actions"><button class="btn share-app" id="header-share-app" data-action="share-app" aria-label="${active==='owner'?'Share your booking page':'Share Joe’s booking page'}">${icon('share')}<span>Share</span></button>${active==='owner'?`<button class="icon-btn contact-action" aria-label="Field desk help" data-action="hq-help">${icon('help')}<span>Help</span></button>`:`<button class="icon-btn contact-action" aria-label="Joe’s contact details" data-action="contact">${icon('phone')}<span>Call</span></button>`}</div></header>
  <main id="main" tabindex="-1">${content}<footer class="footer"><span>Joe’s Landscaping · East Providence, RI · Serving neighbors since 2015</span><span>Sample dates 2026–2027 · Saved on this device</span></footer></main></div></div>${dialog ? dialogContent() : ''}`;
}
function hoursButton(cls, id, extra = '') {
  const s = hoursStatus();
  const lead = cls.includes('tag') ? extra : '', trail = cls.includes('tag') ? '' : extra;
  return `<button class="hours-status ${cls}" id="${id}" data-action="hours" aria-haspopup="dialog" aria-label="${s.label}${s.detail ? `, ${s.detail}` : ''}. Show opening hours">${lead}<span><strong class="${s.open ? 'is-open' : 'is-closed'}">${s.label}</strong>${s.detail ? ` · ${s.detail}` : ''}</span>${trail}</button>`;
}
function garden() { return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 450 260" preserveAspectRatio="xMaxYMax slice"><circle cx="307" cy="83" r="49" fill="#a9bb79" opacity=".22"/><path d="M70 260c-5-103 47-95 84-70 31-76 111-48 122-10 51-90 126-67 174-31v111" fill="#4c7450"/><path d="M134 260c36-47 75-41 115-26 60-54 135-72 201-25v51" fill="#78925d"/><path d="M266 260c25-19 42-48 47-91l4-90 5 90c5 43 21 72 47 91" fill="#9b9766"/><path d="M318 195c-39-9-69-34-70-61 35-1 66 23 70 61m0-44c34-8 56-28 57-52-28 1-52 22-57 52m0-37c-29-5-50-22-53-42 25-3 46 15 53 42m1-33c25-5 42-21 43-39-22-2-39 14-43 39" fill="#c5d39b"/><path d="M208 260v-75m0 40c-30-1-45-18-46-37 25 1 41 14 46 37m0-21c29-2 44-19 43-37-25 4-40 16-43 37" stroke="#a7ba83" stroke-width="5" fill="#a7ba83"/><path d="M385 260v-54m0 26c-24-3-33-15-33-29 18 1 29 10 33 29m0-13c22-5 31-17 30-31-19 4-28 14-30 31" stroke="#c1ce98" stroke-width="4" fill="#c1ce98"/><ellipse cx="97" cy="222" rx="32" ry="12" fill="#7d975e"/><path d="M95 260v-40m-11 10 11 13 12-16" stroke="#bdc990" stroke-width="3" fill="none"/><circle cx="380" cy="49" r="3" fill="#c6d3a0"/><circle cx="194" cy="96" r="2" fill="#c6d3a0"/><path d="m181 57 4-7 4 7-4 7Z" fill="#c6d3a0"/></svg></div>`; }
function fromPrice(id, promoNow) {
  const base = getRules()[id].base, rate = promoNow ? FALL_PROMO.rates[id] : 0;
  return rate ? `<b>From ${money(Math.round(base * (1 - rate) * 100) / 100)}</b><del aria-label="Regular price ${money(base)}">${money(base)}</del>` : `<b>From ${money(base)}</b>`;
}
const promoBadge = (id, promoNow) => promoNow && FALL_PROMO.rates[id] ? ` <span class="promo-badge">${Math.round(FALL_PROMO.rates[id] * 100)}% off</span>` : '';
function recentOrders(property, previous, promoNow) {
  const recent = recentServices(property, bookings), picked = recentPick ?? previous.services;
  const ordered = date => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return `<section class="recent-orders" aria-labelledby="recent-title"><div class="recent-head"><div><div class="eyebrow">WELCOME BACK, MARY</div><h2 id="recent-title">Recently ordered</h2><p class="hint">${esc(property.label)} · details remembered</p></div></div>
  <div class="recent-list">${recent.map(({ id, date }) => `<label class="addon recent-row ${picked.includes(id) ? 'selected' : ''}" for="recent-${id}"><span class="service-icon ${SERVICES[id].icon}">${icon(SERVICES[id].icon)}</span><span><h3>${SERVICES[id].name}${promoBadge(id, promoNow)}</h3><p class="service-meta">${fromPrice(id, promoNow)}</p><small class="recent-date">Last ordered ${ordered(date)}</small></span><input type="checkbox" id="recent-${id}" data-recent="${id}"${checked(picked.includes(id))}></label>`).join('')}</div>
  <div class="recent-foot"><span class="hint">${picked.length ? `${picked.length} selected` : 'Select services to book again'}</span><button class="btn" data-action="rebook-selected"${picked.length ? '' : ' disabled'}>Book again ${icon('arrow')}</button></div></section>`;
}
function home() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }), promoNow = inFallPromo(today);
  const property = PROPERTIES[0], previous = propertyHistory(property, bookings);
  const pending = bookings.filter(b => b.pendingChange?.status === 'awaiting_customer').length;
  return `${promoNow ? `<section class="hero compact-promo" aria-label="Fall seasonal promotions"><div><div class="eyebrow">FALL SEASONAL PROMOTIONS<span class="promo-ends"> · Ends ${fallPromoEnds(today)}</span></div><h2>Fall care, handled.</h2><ul class="promo-list">${Object.entries(FALL_PROMO.rates).map(([id, rate]) => `<li><b>${Math.round(rate * 100)}% off</b> ${SERVICES[id].name.replace(/^Fall l/, 'L').toLowerCase()}</li>`).join('')}</ul><button class="btn" data-action="fall-bundle">Build my fall visit ${icon('arrow')}</button></div>${garden()}</section>` : ''}
  <div class="intro-row"><div><h1 class="home-greeting">Hi Mary, how can we help today?</h1><p>Whatever your yard needs this season, we’re here to help. Pick a service and a time, and we’ll take care of the rest.</p></div>${hoursButton('tag hours-tag','home-hours',icon('clock'))}</div>
  ${pending ? `<div class="notice warning">${icon('rain')}<span>${pending} demo weather update${pending === 1 ? '' : 's'} waiting for a customer answer.</span><button class="text-btn" data-action="bookings">Review changes ${icon('arrow')}</button></div>` : ''}
  ${recentOrders(property, previous, promoNow)}
  <div class="section-heading"><div><h2>Services we offer</h2><p>Choose a service and see the full price before you book.</p></div><span>${Object.keys(SERVICES).length} services · One easy visit</span></div>
  ${serviceFilters()}
  <section class="services" aria-label="Available services">${Object.entries(SERVICES).map(([id, service]) => `<label class="service-card${homePick.includes(id) ? ' picked' : ''}" data-id="${id}" data-category="${esc(service.category)}" data-search="${esc(`${service.name} ${service.category} ${service.description}`.toLowerCase())}"${serviceShown(id) ? '' : ' hidden'}><span class="service-icon ${service.icon}">${icon(service.icon)}</span><span><span class="category">${service.category}</span><h3>${service.name}${promoBadge(id, promoNow)}</h3><p>${service.description}</p><span class="service-meta">${fromPrice(id, promoNow)}<span>·</span>${duration(getRules()[id].minutes)}</span></span><input type="checkbox" class="service-pick" data-home-pick="${id}" aria-label="Select ${esc(service.name)}"${checked(homePick.includes(id))}></label>`).join('')}</section><p class="services-empty"${Object.keys(SERVICES).some(serviceShown) ? ' hidden' : ''}>No services match. <button class="text-btn" data-action="service-filter" data-id="all">Show all services</button></p>
  <section class="try-owner"><div><strong>See the other side of a better day.</strong><p>Try two demo visits, a packing list, and a rain-delay decision.</p></div><button class="text-btn" data-action="load-working-day">Try Joe’s working day ${icon('arrow')}</button></section>
  <section class="wf-tour"><div><span class="eyebrow">NEW · THE WHOLE SERVICE JOURNEY</span><h3>From a good question to the next visit.</h3><p>Configure a service, agree a quote, finish the work, and make returning easy.</p></div><button class="btn secondary small" data-action="wf-nav" data-id="manage">Explore My business ${icon("arrow")}</button></section><div class="trust-strip"><span>${icon('shield')}A clear total before you book</span><span>${icon('clock')}Appointments that fit the whole visit</span><span>${icon('pin')}East Providence & Riverside</span></div>${homeContinue()}`;
}
// Category chips over the service list; a search box joins them once the list is long enough to need one.
const SEARCH_MIN = 7;
let serviceCategory = 'all', serviceQuery = '', homePick = [];
function serviceShown(id) {
  const s = SERVICES[id], q = serviceQuery.trim().toLowerCase();
  return (serviceCategory === 'all' || s.category === serviceCategory) && (!q || `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(q));
}
function serviceFilters() {
  const categories = [...new Set(Object.values(SERVICES).map(s => s.category))];
  const chip = (id, label, count) => `<button class="filter-chip${serviceCategory === id ? ' active' : ''}" data-action="service-filter" data-id="${esc(id)}" aria-pressed="${serviceCategory === id}">${esc(label)}<span>${count}</span></button>`;
  const search = Object.keys(SERVICES).length >= SEARCH_MIN ? `<label class="service-search">${icon('search')}<span class="sr-only">Search services</span><input type="search" data-service-search value="${esc(serviceQuery)}" placeholder="Search services" autocomplete="off"></label>` : '';
  return `<div class="service-filters">${search}<div class="filter-chips" role="group" aria-label="Filter by category">${chip('all', 'All', Object.keys(SERVICES).length)}${categories.map(c => chip(c, c, Object.values(SERVICES).filter(s => s.category === c).length)).join('')}</div></div>`;
}
// Bar anchored at the bottom of the home screen: book every ticked service in one visit.
function homeContinue() {
  if (!homePick.length) return '';
  return `<div class="home-continue" role="region" aria-label="Selected services"><span><strong>Choose your services</strong><small>Select one or more, then continue</small></span><button class="btn" data-action="home-continue">Continue ${icon('arrow')}</button></div>`;
}
// Filter in place so the search box keeps focus while typing.
function applyServiceFilter() {
  document.querySelectorAll('.service-card[data-id]').forEach(card => { card.hidden = !serviceShown(card.dataset.id); });
  const empty = document.querySelector('.services-empty');
  if (empty) empty.hidden = [...document.querySelectorAll('.service-card[data-id]')].some(card => !card.hidden);
}
function stepper() { return `<div class="stepper" aria-label="Booking progress">${['Your visit', 'Find a time', 'Review & book'].map((name, i) => `${i ? '<span class="step-line"></span>' : ''}<div class="step ${i === stage ? 'active' : i < stage ? 'done' : ''}" ${i === stage ? 'aria-current="step"' : ''}><b>${i < stage ? '✓' : i + 1}</b>${name}</div>`).join('')}</div>`; }
// Booking sections collapse once their required fields are complete, with a green check. Tap the header to reopen.
// Prefilled choices are only suggestions: a section counts as complete after the customer taps to confirm it.
let sectionOpen = {}, sectionDone = {}, sectionLocked = {}, sectionDraft = null, confirmed = {}, showMissing = {}, bookingWeek = null;
function sectionState() { if (sectionDraft !== draft) { sectionDraft = draft; sectionOpen = {}; sectionDone = {}; sectionLocked = {}; confirmed = {}; showMissing = {}; bookingWeek = null; } }
function confirmChoices(...ids) { sectionState(); ids.forEach(id => { confirmed[id] = true; }); }
const req = '<span class="req" aria-hidden="true">*</span>';
const placeComplete = () => Boolean(draft.property?.trim() && draft.city?.trim() && draft.state?.trim() && quote(draft).serviceable);
const contactComplete = () => Boolean(draft.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) && draft.phone.replace(/\D/g, '').length >= 10);
// Rule: a panel with one choice finishes when it's tapped; a panel with more than one input finishes with Done.
// "A few details" always ends with Done: every service adds at least one visit question from the workflow rules.
const detailsAnswered = () => (!draft.services.some(s => s === 'leaves' || s === 'mowing') || Boolean(confirmed.size)) && (!draft.services.includes('leaves') || Boolean(confirmed.haul)) && (!draft.services.includes('gutters') || Boolean(confirmed.stories))
  && draft.services.every(id => visibleQuestions(id, draft).every(q => q.type !== 'select' || confirmed[`q:${id}:${q.key}`])) && !quote(draft).missing.length;
// Joe's visit questions start with no card selected until the customer answers them, instead of showing the default.
const askQuestions = d => wf.questions(d, 'answer', (id, key) => !confirmed[`q:${id}:${key}`]);
function sectionComplete(id) {
  sectionState();
  if (id === 'place') return Boolean(confirmed.place && placeComplete());
  if (id === 'services') return Boolean(confirmed.services && draft.services.length);
  if (id === 'details') return detailsAnswered() && Boolean(confirmed.details);
  if (id === 'time') return Boolean(confirmed.time) && draft.start !== null && slots(draft, bookings).includes(draft.start);
  if (id === 'contact') return Boolean(confirmed.contact && contactComplete());
  if (id === 'quote') return Boolean(confirmed.quote && contactComplete());
  return false;
}
const preselected = '<span class="preselected-tag">Preselected · tap to confirm</span>';
// Panels open in order: each stays locked until every panel above it in this step is complete.
const SECTION_ORDER = [['place', 'services', 'details', 'quote'], ['time', 'contact']];
const missingText = ready => ready ? 'All answered. Tap Done to continue.' : 'Finish the highlighted items to continue.';
const doneButton = id => { const ready = doneReady(id); return `${showMissing[id] ? `<p class="section-missing" role="status">${missingText(ready)}</p>` : ''}<button class="btn small section-done${ready ? '' : ' incomplete'}" data-action="section-done" data-id="${id}">Done ${icon('check')}</button>`; };
// A panel's Done stays pressable: pressing it early highlights what is still needed instead of doing nothing.
function doneReady(id) {
  if (id === 'place') return Boolean(confirmed.picked) && placeComplete();
  if (id === 'services') return Boolean(confirmed.picked_services) && draft.services.length > 0;
  if (id === 'details') return detailsAnswered();
  if (id === 'time') return draft.start !== null;
  return contactComplete();
}
// What a panel still needs from the customer, top to bottom. Keys match the data-need attributes in its markup.
function missingItems(id) {
  if (id === 'place') {
    if (draft.propertyId !== 'new') return confirmed.picked && placeComplete() ? [] : ['place'];
    if (!confirmed.picked) return ['place'];
    return [!draft.property?.trim() && 'property', (!draft.city?.trim() || !quote(draft).serviceable) && 'city', !draft.state?.trim() && 'state'].filter(Boolean);
  }
  if (id === 'services') return doneReady('services') ? [] : ['services'];
  if (id === 'time') return !dayChosen() ? ['date'] : draft.start === null ? ['time'] : [];
  if (id === 'details') {
    const list = [draft.services.some(s => s === 'leaves' || s === 'mowing') && !confirmed.size && 'size', draft.services.includes('leaves') && !confirmed.haul && 'haul', draft.services.includes('gutters') && !confirmed.stories && 'stories'].filter(Boolean);
    for (const service of draft.services) for (const q of visibleQuestions(service, draft)) {
      const answer = String(draft.answers?.[service]?.[q.key] ?? q.default ?? '').trim();
      if (q.type === 'select' ? !confirmed[`q:${service}:${q.key}`] : q.required && !answer) list.push(`q:${service}:${q.key}`);
    }
    return list;
  }
  return [!draft.name.trim() && 'name', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) && 'email', draft.phone.replace(/\D/g, '').length < 10 && 'phone'].filter(Boolean);
}
const needEl = key => [...document.querySelectorAll('[data-need]')].find(el => el.dataset.need === key);
// Runs after every render and while typing, so a highlight clears as soon as its answer is in.
function applyNeeds() {
  document.querySelectorAll('.needs-answer').forEach(el => el.classList.remove('needs-answer'));
  for (const id of Object.keys(showMissing)) if (document.querySelector(`.step-section[data-section="${id}"]`)) missingItems(id).forEach(key => needEl(key)?.classList.add('needs-answer'));
  document.querySelectorAll('.section-done[data-id]').forEach(button => { const ready = doneReady(button.dataset.id); button.classList.toggle('incomplete', !ready); const hint = button.previousElementSibling; if (hint?.classList.contains('section-missing')) hint.textContent = missingText(ready); if (showMissing[button.dataset.id] && ready) button.classList.add('needs-answer'); });
}
// Continue stays pressable while something is still answerable, so it can lead back to it. Applies to the summary and phone footer buttons.
const continueBlocked = q => (!q.serviceable || !q.lines.length) && (stage !== 0 || (sectionComplete('place') && sectionComplete('services')));
// Lands an element just below the sticky header.
const headerOffset = () => (document.querySelector('.topbar')?.getBoundingClientRect().height ?? 116) + 12;
const dayChosen = () => Boolean(confirmed.date) || draft.start !== null;
// One week at a time. Each working day shows its own hours; arrows skip weeks with no sample dates.
function weekPicker() {
  const shown = weekDates(bookingWeek ?? draft.date), earlier = DEMO_DATES.filter(d => d < shown[0]).at(-1), later = DEMO_DATES.find(d => d > shown[6]);
  const short = d => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const day = d => {
    const when = new Date(`${d}T12:00:00Z`), hours = hoursFor(d), bookable = DEMO_DATES.includes(d), rain = blockedDates.includes(d);
    const fits = bookable && !rain && modelSlots({ ...draft, date: d, start: null }, bookings, null, blockedDates).length > 0;
    const status = !hours ? 'Off' : !bookable ? '–' : rain ? 'Paused' : fits ? shortHours(hours) : 'Full';
    const reason = !hours ? 'Joe is off' : !bookable ? 'not bookable' : rain ? 'paused for rain' : fits ? `open ${hoursRange(hours)}` : 'no time fits this visit';
    const on = dayChosen() && d === draft.date;
    return `<button class="week-day${on ? ' selected' : ''}"${fits ? '' : ' disabled'} aria-pressed="${on}" aria-label="${when.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}, ${reason}" data-action="date" data-id="${d}"><span>${when.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}</span><b>${when.getUTCDate()}</b><small>${status}</small></button>`;
  };
  return `<div class="week-picker" data-need="date"><div class="week-head"><button class="icon-btn week-nav" id="week-prev" aria-label="Previous week" data-action="week-shift" data-id="${earlier ?? ''}"${earlier ? '' : ' disabled'}>${icon('back')}</button><h4>${short(shown[0])} – ${short(shown[6])}, ${shown[6].slice(0, 4)}</h4><button class="icon-btn week-nav" id="week-next" aria-label="Next week" data-action="week-shift" data-id="${later ?? ''}"${later ? '' : ' disabled'}>${icon('arrow')}</button></div><div class="week-days" role="group" aria-label="Choose a day">${shown.map(day).join('')}</div></div>`;
}
function snapTo(el, ms = 450) { glideTo(scrollY + el.getBoundingClientRect().top - headerOffset(), ms); }
// With nothing left to answer, the visit summary is next: its heading lands just below the header, never scrolled past.
function snapToSummary(ms) { const summary = document.querySelector('.booking-layout > .summary'); if (summary && getComputedStyle(summary).position !== 'fixed' && summary.offsetHeight) { snapTo(summary, ms); return true; } return false; }
function snapToNeed(id) {
  const key = id === 'time' && missingItems(id).length ? 'date' : missingItems(id)[0], target = (key && needEl(key)) ?? document.querySelector(`.section-done[data-id="${id}"]`) ?? document.querySelector(`.step-section[data-section="${id}"]`);
  if (target) snapTo(target);
}
const firstOpenSection = () => (SECTION_ORDER[stage] ?? []).find(id => document.querySelector(`.step-section[data-section="${id}"]`) && !sectionComplete(id));
// After a selection: glide to the next thing the customer has to do. Editing a finished panel stays put.
function snapNext(current) { if (current && sectionComplete(current)) return; const id = firstOpenSection(); if (id) snapToNeed(id); else snapToSummary(); }
// Pressing Done or Continue early: show what is missing and take the customer to it.
function showWhatsMissing(id) { showMissing[id] = true; render(); snapToNeed(id); }
// After a panel completes: the check pops in, the next panel opens, then the finished one folds, then the page glides to the new one.
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let justDone = null, advanceFrom = null, glideRun = 0, wasOnTimeStep = false;
function advance(id) { advanceFrom = id; const order = SECTION_ORDER.find(list => list.includes(id)) ?? [], next = order[order.indexOf(id) + 1]; if (next) sectionOpen[next] = true; }
function glideTo(y, ms = 650) {
  const start = scrollY, distance = Math.max(0, y) - start, began = performance.now(), run = ++glideRun;
  if (reducedMotion() || Math.abs(distance) < 2) return scrollTo(0, start + distance);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const step = now => { if (run !== glideRun) return; const t = Math.min(1, (now - began) / ms); scrollTo(0, start + distance * ease(t)); if (t < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function snapAfter(id) {
  let next = document.querySelector(`.step-section[data-section="${id}"]`)?.nextElementSibling;
  while (next && (next.classList.contains('collapsed') || !next.offsetHeight)) next = next.nextElementSibling;
  if (next) return snapTo(next, 650);
  if (snapToSummary(650)) return;
  const button = document.querySelector('.summary [data-action="next"]');
  if (button) { const box = button.getBoundingClientRect(); glideTo(scrollY + box.top - (innerHeight - box.height) / 2); }
}
// Called before the re-render with the old panel heights and the finished panel's old contents.
function animateSections(id, heights, oldBody) {
  if (reducedMotion()) return snapAfter(id);
  // Bring the finished panel's header (and its check) into view first; it stays put while the panel folds.
  const done = document.querySelector(`.step-section[data-section="${id}"]`);
  if (done) { const top = done.getBoundingClientRect().top, margin = parseFloat(getComputedStyle(done).scrollMarginTop) || 0; if (top < margin || top > innerHeight * .6) snapTo(done, 420); }
  const moving = [...document.querySelectorAll('.step-section[data-section]')].map(el => ({ el, from: heights[el.dataset.section], to: el.offsetHeight })).filter(m => m.from && m.from !== m.to);
  // With a panel to open, it opens first and the finished one folds after; otherwise the fold starts right after the check.
  const opening = moving.some(m => m.el.dataset.section !== id), foldAt = opening ? 1000 : 450;
  for (const { el, from } of moving) {
    const finished = el.dataset.section === id;
    if (finished && oldBody) { el.insertAdjacentHTML('beforeend', oldBody); Object.assign(el.lastElementChild, { inert: true }); el.lastElementChild.classList.add('leaving'); el.lastElementChild.style.animationDelay = `${foldAt - 50}ms`; }
    Object.assign(el.style, { height: `${from}px`, overflow: 'hidden', transitionDelay: finished ? `${foldAt}ms` : '400ms' });
  }
  requestAnimationFrame(() => requestAnimationFrame(() => moving.forEach(({ el, to }) => { el.classList.add('resizing'); el.style.height = `${to}px`; })));
  setTimeout(() => { moving.forEach(({ el }) => { el.classList.remove('resizing'); el.style.height = el.style.overflow = el.style.transitionDelay = ''; el.querySelector('.leaving')?.remove(); }); snapAfter(id); }, foldAt + 650);
}
function section(id, iconName, title, summary, body) {
  const order = SECTION_ORDER.find(list => list.includes(id)) ?? [], done = sectionComplete(id);
  const locked = order.slice(0, order.indexOf(id)).some(prev => !sectionComplete(prev));
  const unlocked = sectionLocked[id] === true && !locked;
  sectionLocked[id] = locked; sectionDone[id] = locked ? false : sectionDone[id];
  if (locked) return `<section class="panel step-section collapsed locked" data-section="${id}"><button class="section-toggle" disabled aria-disabled="true">${icon(iconName)}<span class="section-heading-text"><h3>${title}</h3><small>Finish the step above first</small></span></button></section>`;
  const finishing = done && (sectionDone[id] === false || advanceFrom === id);
  if (finishing && justDone) sectionOpen[id] = false; // a second panel completing in the same update folds quietly
  else if (finishing) {
    if (advanceFrom === id) advanceFrom = null;
    sectionOpen[id] = false; justDone = id;
    const heights = Object.fromEntries([...document.querySelectorAll('.step-section[data-section]')].map(el => [el.dataset.section, el.offsetHeight]));
    const oldBody = document.querySelector(`.step-section[data-section="${id}"] .section-body`)?.outerHTML;
    setTimeout(() => { justDone = null; animateSections(id, heights, oldBody); });
  }
  sectionDone[id] = done;
  const open = !done || (sectionOpen[id] ?? false);
  return `<section class="panel step-section${open ? '' : ' collapsed'}${done ? ' done' : ''}${justDone === id ? ' just-done' : ''}${unlocked ? ' just-opened' : ''}" data-section="${id}"><button class="section-toggle" data-action="toggle-section" data-id="${id}" aria-expanded="${open}"${done ? '' : ' disabled'}>${icon(iconName)}<span class="section-heading-text"><h3>${title}</h3>${!open && summary ? `<small>${summary}</small>` : ''}</span>${done ? `<span class="section-check" aria-label="Complete">${icon('check')}</span>` : ''}</button>${open ? `<div class="section-body">${body}</div>` : ''}</section>`;
}
// Inline editor for a saved property; changes save to the customer's account and Joe re-confirms access.
const propertyReady = p => Boolean(p.address?.trim() && p.city?.trim() && p.state?.trim());
function propertyEditor(p) {
  const e = editingProperty, field = (key, label, extra = '') => `<div class="field${key === 'address' ? ' wide' : ''}"><label for="edit-${key}">${label}${req}</label><input id="edit-${key}" data-edit-property="${key}" value="${esc(e[key] ?? '')}" required ${extra}></div>`;
  return `<div class="property-editor" role="group" aria-label="Edit ${esc(p.label)}"><h4>Edit ${esc(p.label)}</h4><div class="fields">${field('address', 'Street address', 'maxlength="80" autocomplete="address-line1"')}${field('city', 'City', 'maxlength="40" list="served-cities" autocomplete="address-level2"')}${field('state', 'State', 'maxlength="2" autocomplete="address-level1" style="text-transform:uppercase"')}<datalist id="served-cities">${Object.values(AREAS).filter(a => a.miles !== null).map(a => `<option value="${a.name}">`).join('')}</datalist>
  <div class="field wide"><label for="edit-access">Access instructions</label><textarea id="edit-access" data-edit-property="access" maxlength="300" placeholder="e.g. Use the right side gate to enter the back yard">${esc(e.access ?? '')}</textarea><span class="hint">Joe confirms changes before your visit.</span></div></div>
  <div class="btn-row"><button class="btn small" data-action="save-property"${propertyReady(e) ? '' : ' disabled'}>Save changes</button><button class="text-btn" data-action="cancel-property">Cancel</button></div></div>`;
}
function scope() {
  if(draft.approvedOffer)return `<section class="panel"><div class="eyebrow">OWNER-APPROVED SCOPE</div><h2>${draft.services.map(id=>esc(SERVICES[id].name)).join(' + ')}</h2><p>${esc(draft.property)}</p><div class="notice">${esc(draft.approvedOffer.note)}</div><p>Your accepted quote fixes this scope and includes travel. Choose a date and time next.</p></section>`;
  const hasYard = draft.services.some(id => id === 'leaves' || id === 'mowing');
  const props = myProperties(), q = quote(draft), area = AREAS[draft.area] ?? AREAS.outside;
  sectionState();
  const option = (id, title, detail, iconName, note = '') => { const on = draft.propertyId === id, pre = on && !confirmed.picked; return `<label class="addon property-option ${on ? pre ? 'preselected' : 'selected' : ''}" for="property-${id}"><span class="service-icon">${icon(iconName)}</span><span><h3>${title}</h3><p>${detail}</p>${note ? `<small class="property-access-note"><b>Access:</b> ${note}</small>` : ''}${pre ? preselected : ''}${id !== 'new' ? `<button class="text-btn property-edit" data-action="edit-property" data-id="${id}">Edit</button>` : ''}</span><input type="radio" name="property-pick" id="property-${id}" data-action="pick-property" data-id="${id}"${checked(on && !pre)}></label>`; };
  const picked = props.find(p => p.id === draft.propertyId);
  const placeSummary = esc([picked?.label ?? draft.property, draft.city, q.serviceable ? `${area.miles} miles from Joe` : ''].filter(Boolean).join(' · '));
  const servicesSummary = draft.services.map(id => esc(SERVICES[id].name)).join(' + ');
  const detailsSummary = [hasYard ? `${draft.size[0].toUpperCase()}${draft.size.slice(1)} yard` : '', draft.services.includes('leaves') && confirmed.haul ? draft.haul ? 'haul-away' : 'bagged at the curb' : '', draft.services.includes('gutters') ? `${draft.stories} ${Number(draft.stories) === 1 ? 'story' : 'stories'}` : ''].filter(Boolean).join(' · ') || 'Nothing else needed';
  return `${section('place', 'pin', 'First, where are we headed?', placeSummary, `<p>Choose one of your saved properties, or add a new one. All details here are fictional.</p>
  <div class="property-picker" data-need="place" role="radiogroup" aria-label="Your properties">${props.map(p => option(p.id, esc(p.label), esc([p.address, p.city, p.state].filter(Boolean).join(', ')), 'house', esc(p.access ?? '')) + (editingProperty?.id === p.id ? propertyEditor(p) : '')).join('')}${option('new', 'Add a new property', 'We’ll save it to your account for next time', 'plus')}</div>
  <div class="fields">${draft.propertyId === 'new' ? `<div data-need="property" class="field wide"><label for="property">Street address${req}</label><input id="property" required data-field="property" value="${esc(draft.property)}" maxlength="80" autocomplete="address-line1"></div><div data-need="city" class="field"><label for="city">City${req}</label><input id="city" required data-field="city" value="${esc(draft.city ?? '')}" maxlength="40" list="served-cities" autocomplete="address-level2"><datalist id="served-cities">${Object.values(AREAS).filter(a => a.miles !== null).map(a => `<option value="${a.name}">`).join('')}</datalist></div><div data-need="state" class="field"><label for="state">State${req}</label><input id="state" required data-field="state" value="${esc(draft.state ?? '')}" maxlength="2" autocomplete="address-level1" style="text-transform:uppercase"></div>` : ''}
  <div class="field wide"><div class="property-distance ${q.serviceable ? '' : 'outside'}">${icon('car')}<span>${q.serviceable ? `<strong>${area.miles} miles from Joe</strong><small>${area.name} · ${money(q.travel)} round-trip travel, included in your total</small>` : `<strong>${draft.city?.trim() ? 'Outside Joe’s service area' : 'Enter a city to see the distance'}</strong><small>Joe serves ${Object.values(AREAS).filter(a => a.miles !== null).map(a => a.name).join(' and ')}, RI.</small>`}</span></div></div>
  ${draft.propertyId === 'new' ? `<div class="field wide"><label for="property-access">Access instructions</label><textarea id="property-access" data-field="access" maxlength="300" placeholder="e.g. Use the right side gate to enter the back yard">${esc(draft.access || draft.notes || '')}</textarea><span class="hint">Joe confirms these when he accepts the job.</span></div>` : ''}</div>${draft.propertyId === 'new' ? doneButton('place') : ''}`)}
  ${section('services', 'bag', 'Choose your services', servicesSummary, `<p>Select everything you need. The questions for your visit appear below.</p><div data-need="services">${Object.entries(SERVICES).map(([id,s]) => { const on = draft.services.includes(id), pre = on && !confirmed.picked_services; return `<label class="addon ${on ? pre ? 'preselected' : 'selected' : ''}" for="add-${id}"><span class="service-icon ${s.icon}">${icon(s.icon)}</span><span><h3>${s.name}</h3><p>${FALL_PROMO.rates[id] ? `${Math.round(FALL_PROMO.rates[id] * 100)}% off fall visits (Sep–Nov)` : `${money((draft.catalogSnapshot??getRules())[id].base)} starting price · scope adjusts total`}</p>${pre ? preselected : ''}</span><input type="checkbox" id="add-${id}" data-service="${id}"${checked(on && !pre)}></label>`; }).join('')}</div>${doneButton('services')}`)}
  ${section('details', 'leaf', 'A few details. A clear price.', detailsSummary, `<p>Tell Joe what to expect, and your price total updates as you go.</p>
  ${hasYard ? `<div data-need="size" style="margin-top:20px"><span class="label" id="yard-label">How big is your yard?${req}</span><div class="choice-row" role="group" aria-labelledby="yard-label">${[['small','Small','Under ¼ acre'],['medium','Medium','¼–½ acre'],['large','Large','½–1 acre']].map(([id,n,desc]) => { const on = draft.size === id, pre = on && !confirmed.size; return `<button class="choice ${on ? pre ? 'preselected' : 'selected' : ''}" aria-pressed="${on && !pre}" data-action="size" data-id="${id}"><strong>${n}</strong><small>${desc}</small>${pre ? '<span class="preselected-tag">Preselected</span>' : ''}</button>`; }).join('')}</div><p class="hint" style="margin-top:10px">Over 1 acre or unusually heavy debris? Ask Joe for an assessment before booking.</p></div>` : ''}
  ${draft.services.includes('leaves') ? `<div data-need="haul" style="margin-top:20px"><span class="label" id="haul-label">What should Joe do with the leaves?${req}</span><div class="choice-row two" role="group" aria-labelledby="haul-label">${[['no','Bag them at the curb','Included'],['yes','Take them away','+$35 · adds 15 min']].map(([id,n,desc]) => { const on = confirmed.haul && String(draft.haul) === String(id === 'yes'); return `<button class="choice ${on ? 'selected' : ''}" aria-pressed="${on}" data-action="haul" data-id="${id}"><strong>${n}</strong><small>${desc}</small></button>`; }).join('')}</div></div>` : ''}
  ${draft.services.includes('gutters') ? `<div data-need="stories" style="margin-top:20px"><span class="label" id="stories-label">How many stories is your home?${req}</span><div class="choice-row" role="group" aria-labelledby="stories-label">${[[1,'1 story','Base price'],[2,'2 stories','+$40 before discount · adds 30 min'],[3,'3 or more','Assessment needed']].map(([n,name,desc]) => { const on = confirmed.stories && Number(draft.stories) === n; return `<button class="choice ${on ? 'selected' : ''}" aria-pressed="${Boolean(on)}" data-action="stories" data-id="${n}"><strong>${name}</strong><small>${desc}</small></button>`; }).join('')}</div></div>` : ''}
  ${askQuestions(draft).replace(/<section class="panel wf-questions">/g, '<div class="detail-questions">').replace(/<\/section>/g, '</div>').replaceAll('<span class="wf-required">Required</span>', req)}
  ${doneButton('details')}`)}
${(quote(draft).assessment||quote(draft).minutes+30>240)?section('quote', 'user', 'Where should Joe send the quote?', esc([draft.name, draft.email, draft.phone].join(' · ')), `<p>Fictional details only. No real message is sent.</p><div class="fields"><div data-need="name" class="field wide"><label for="quote-name">Name${req}</label><input id="quote-name" data-field="name" value="${esc(draft.name)}" maxlength="80" required autocomplete="off"></div><div data-need="email" class="field"><label for="quote-email">Email${req}</label><input id="quote-email" type="email" data-field="email" value="${esc(draft.email)}" maxlength="120" required autocomplete="off"></div><div data-need="phone" class="field"><label for="quote-phone">Phone${req}</label><input id="quote-phone" type="tel" data-field="phone" value="${esc(draft.phone)}" maxlength="30" required autocomplete="off"></div></div>${doneButton('quote')}`):''}`;
}
function scheduling() {
  const q = quote(draft), available = slots(draft, bookings);
  const timeDone = sectionComplete('time');
  return `${section('time', 'calendar', 'A time that really works.', timeDone ? `${dateLabel(draft.date)} · ${time(draft.start)}–${time(draft.start + q.minutes)}` : '', `<p>Joe’s hours change day to day. Pick a day to see the start times that fit your visit.</p>
  ${weekPicker()}
  ${!dayChosen() ? `<div class="notice pick-day-note">${icon('calendar')}<span>Pick a day to see Joe’s open times.</span></div>` : `<strong class="wf-selected-date">${dateLabel(draft.date)}${hoursFor(draft.date) ? ` · Joe works ${hoursRange(hoursFor(draft.date))}` : ''}</strong><span class="label">Available start times · Eastern Time${req}</span><div class="slots" data-need="time">${available.map(start => `<button class="choice slot ${draft.start === start ? 'selected' : ''}" aria-pressed="${draft.start === start}" data-action="slot" data-id="${start}"><strong>${time(start)}</strong><small>Finish ${time(start + q.minutes)}</small></button>`).join('')}</div>
  ${available.length ? `<div class="timing">${icon('shield')}Only slots that fit your whole visit are shown.</div>` : `<div class="notice warning">${icon('clock')}<span>${q.block + BUFFER > 240 ? 'This combination plus travel needs more than Joe’s four-hour work window. Remove a service or request an assessment to split the work.' : 'No time fits your visit on this date. Try another day or adjust your services.'}</span></div>`}`}
  ${draft.start !== null ? `<div class="notice">${icon('check')}<span>Your services: ${time(draft.start)}–${time(draft.start + q.minutes)}.<br>Calendar protected until ${time(draft.start + q.block)} with the buffer.</span></div>` : ''}
  ${draft.services.some(id => FALL_PROMO.rates[id]) && !inFallPromo(draft.date) ? '<div class="notice warning">The fall promotion covers September–November visits. Your total shows regular prices for this date.</div>' : ''}${doneButton('time')}`)}
  ${section('contact', 'user', 'Who should Joe expect?', esc([draft.name, draft.email, draft.phone].join(' · ')), `<p>Sample details are filled in for Mary. Use fictional information in this demo.</p><div class="fields"><div data-need="name" class="field wide"><label for="name">Name${req}</label><input id="name" required autocomplete="off" data-field="name" value="${esc(draft.name)}" maxlength="80"></div><div data-need="email" class="field"><label for="email">Email${req}</label><input id="email" required autocomplete="off" type="email" data-field="email" value="${esc(draft.email)}" maxlength="120"></div><div data-need="phone" class="field"><label for="phone">Phone${req}</label><input id="phone" required autocomplete="off" type="tel" data-field="phone" value="${esc(draft.phone)}" maxlength="30"></div><div class="field wide"><label for="notes">Anything Joe should know? <span class="hint">Optional</span></label><textarea id="notes" data-field="notes" maxlength="500" placeholder="e.g. I have a dog, but he’s harmless">${esc(draft.notes)}</textarea></div></div>${doneButton('contact')}`)}`;
}
function review() {
  const q = quote(draft);
  return `<section class="panel"><div class="panel-title">${icon('check')}<h3>One last look. Then you’re all set.</h3></div><p>Your total and appointment are shown below. Nothing is charged in this demo.</p>
  <div class="review-row">${icon('pin')}<span><strong>${esc([draft.property, draft.city, draft.state].filter(Boolean).join(', '))}</strong><small>${AREAS[draft.area].name} · ${q.miles} miles from Joe’s business</small></span><button class="text-btn" data-action="edit" data-id="0">Edit</button></div>
  <div class="review-row">${icon('calendar')}<span><strong>${dateLabel(draft.date)} · ${time(draft.start)}</strong><small>Services finish at ${time(draft.start + q.minutes)} · Eastern Time<br>${BUFFER}-minute travel/setup buffer included in the calendar.</small></span><button class="text-btn" data-action="edit" data-id="1">Edit</button></div>
  <div class="review-row">${icon('bag')}<span>${q.lines.map(l => `<strong style="display:block">${l.name}<small>${esc(l.details)} · ${duration(l.minutes)}</small></strong>`).join('')}</span><button class="text-btn" data-action="edit" data-id="0">Edit</button></div>
  <div class="review-row">${icon('user')}<span><strong>${esc(draft.name)}</strong><small>${esc(draft.email)}<br>${esc(draft.phone)}</small>${draft.notes ? `<small>Note: ${esc(draft.notes)}</small>` : ''}</span><button class="text-btn" data-action="edit" data-id="1">Edit</button></div></section>
  <div class="notice">${icon('shield')}<span><strong>No surprises on arrival.</strong><br>This price covers the scope you selected. Any extra work requires your approval. Tax is assumed $0 in this illustrative demo.</span></div><div class="notice">${icon('calendar')}<span>Manage or reschedule your demo booking from My bookings. Real cancellation and weather policies would be set by Joe before launch.</span></div>`;
}
function bill(q, withAction = false) {
  const needsQuote=q.assessment || q.minutes+30>240;
  const unavailable = !q.serviceable || !q.lines.length;
  return `<aside class="summary"><section class="panel"><div class="summary-heading"><h3>Your visit, at a glance</h3>${icon('receipt')}</div>
  ${q.lines.map(l => `<div class="bill-line"><span>${l.name}<small>${esc(l.details)}</small></span><strong>${money(l.amount)}</strong></div>`).join('')}
  ${(q.discounts ?? []).map(d => `<div class="bill-line discount"><span>${esc(d.label??'Fall promotion')}<small>${Math.round(d.rate * 100)}% off ${esc(d.name.toLowerCase())}</small></span><strong>−${money(d.amount)}</strong></div>`).join('')}
  <div class="bill-line"><span>Travel · once per visit<small>${draft.approvedOffer?'Included in agreed quote':q.miles === null ? 'Outside service area' : `${q.miles} mi × 2 (round trip) × $4`}</small></span><strong>${q.miles === null ? '—' : money(q.travel)}</strong></div>
  <div class="bill-line"><span>Illustrative tax</span><strong>$0</strong></div><div class="bill-total"><span>${needsQuote ? 'Scope estimate' : 'Your total'}</span><strong aria-live="polite">${unavailable ? '—' : money(q.total)}</strong></div>
  <div class="summary-detail">${icon('clock')}<span>${duration(q.minutes)} of service<br>+ ${BUFFER} min travel & setup<br>${draft.start !== null ? `${dateLabel(draft.date)} · ${time(draft.start)}` : 'One visit. One travel charge.'}</span></div>
  ${!q.serviceable ? '<div class="error">This property is outside Joe’s service area. Choose a supported demo zone.</div>' : ''}${needsQuote?'<div class="notice warning">Joe needs to review the scope before you can reserve a visit. Request an exact quote below.</div>':''}<div class="wf-prep"><strong>Preparation for this visit</strong><p>${q.tools.map(esc).join(' · ')}</p></div>
  ${error ? `<div class="error" role="alert">${esc(error)}</div>` : ''}
  ${withAction ? `<button class="btn full" data-action="${needsQuote?'wf-request-quote':'next'}"${continueBlocked(q) ? ' disabled' : ''}>${needsQuote?'Request an owner quote':stage === 0 ? 'Find a time' : stage === 1 ? 'Review my visit' : 'Confirm demo booking'} ${icon(stage === 2 ? 'check' : 'arrow')}</button>${stage > 0 ? '<button class="text-btn" style="margin-top:9px" data-action="previous">← Back a step</button>' : ''}<div class="summary-foot">${stage === 2 ? 'Creates a demo booking in this browser.<br>No card needed. No message is sent.' : 'A clear price, before you commit.<br>Sample dates and fictional properties.'}</div>` : ''}</section></aside>`;
}
function booking() { const q=quote(draft),needsQuote=q.assessment||q.minutes+30>240;return `<button class="text-btn back-btn" data-action="${stage?'previous':'home'}">${icon('back')}${stage?'Back a step':'Back to services'}</button><div class="eyebrow">ONE VISIT · ${draft.services.length} SERVICE${draft.services.length===1?'':'S'} · ONE TRAVEL CHARGE</div><h1>${['Let’s plan your visit.','Find your time.','Good to go?'][stage]}</h1>${stepper()}<div class="booking-layout"><div>${stage===0?scope():stage===1?scheduling():review()}</div>${bill(q,true)}</div><div class="mobile-book-strip"><button class="price-trigger" id="mobile-price-trigger" data-action="price-breakdown" aria-haspopup="dialog" aria-label="View price breakdown, total ${money(q.total)}"><small>${needsQuote?'Scope estimate':'Your visit total'}</small><strong>${money(q.total)}</strong><span>View breakdown ${icon('plus')}</span></button><button class="btn" data-action="${needsQuote?'wf-request-quote':'next'}"${continueBlocked(q)?' disabled':''}>${needsQuote?'Request quote':stage===2?'Confirm demo booking':'Continue'} ${icon('arrow')}</button></div>`; }

function bookingDetails(b) { return `<div class="review-row">${icon('calendar')}<span><strong>${dateLabel(b.draft.date)} · ${time(b.draft.start)}–${time(b.draft.start + b.minutes)}</strong><small>Eastern Time · ${duration(b.minutes)} of service</small></span></div><div class="review-row">${icon('pin')}<span>${esc(b.draft.property)}<small>${AREAS[b.draft.area]?.name || 'Demo area'}</small></span></div><div class="review-row">${icon('bag')}<span>${b.lines.map(l => `<span style="display:block">${esc(l.name)} <small>${esc(l.details)}</small></span>`).join('')}</span></div><div class="bill-total"><span>Confirmed demo price</span><strong>${money(b.total)}</strong></div>`; }
function confirmation() {
  const b = bookings.find(b => b.id === currentId);
  if (!b) return myBookings();
  return `<div class="confirmation"><div class="success"><div class="success-icon">${icon('check')}</div><div class="eyebrow">ONE LESS THING ON YOUR LIST</div><h1>You’re booked. Joe’s ready.</h1><p>Your whole visit is on the calendar.<br>Demo confirmation <strong>${esc(b.id)}</strong></p></div><section class="panel">${bookingDetails(b)}<div class="btn-row"><button class="btn" data-action="bookings">View my bookings ${icon('arrow')}</button><button class="btn secondary" data-action="ics" data-id="${esc(b.id)}">${icon('download')}Add to calendar</button></div></section><section class="panel recovery"><h3>New phone? Keep your booking with you.</h3><p style="margin-top:8px">Create a portable demo link, then open it in another browser. It carries the sample booking; production would use a server-backed secure link.</p><button class="text-btn" data-action="share-booking" data-id="${esc(b.id)}">${icon('link')}Get demo booking link</button></section><button class="text-btn" data-action="owner">See what Joe sees ${icon('arrow')}</button></div>`;
}
function myBookings() {
  return `<div class="intro-row"><div><div class="eyebrow">EVERYTHING, IN ONE LITTLE PLACE</div><h1>Your outdoors, organized.</h1><p>Upcoming visits, easy changes, and a shortcut to next season.</p></div><button class="btn secondary small" data-action="home">${icon('plus')}New visit</button></div>
  ${!storageAvailable ? '<div class="notice warning">Browser storage is unavailable. Keep a demo booking link before closing this page.</div>' : ''}
  ${wf.quotes(false)}${bookings.length ? bookings.slice().sort((a,b) => (a.draft.date + a.draft.start).localeCompare(b.draft.date + b.draft.start)).map(b => `<article class="booking-card"><div class="booking-card-top"><div><div class="eyebrow">${esc(b.id)}</div><h3>${b.lines.map(l => esc(l.name)).join(' + ')}</h3></div><span class="tag ${b.status === 'cancelled' ? 'orange' : ''}">${icon(b.status === 'completed' ? 'check' : 'calendar')}${esc(b.status === 'confirmed' ? 'Confirmed' : b.status)}</span></div><div class="meta">${dateLabel(b.draft.date)} · ${time(b.draft.start)}–${time(b.draft.start + b.minutes)} · Eastern Time<br>${esc(b.draft.property)} · ${AREAS[b.draft.area]?.name} · <strong>${money(b.total)}</strong></div><div class="btn-row">${b.status === 'confirmed' && !b.pendingChange ? `<button class="btn small secondary" data-action="reschedule" data-id="${esc(b.id)}">${icon('calendar')}Reschedule</button><button class="text-btn" data-action="cancel" data-id="${esc(b.id)}">Cancel visit</button>` : ''}<button class="text-btn" data-action="rebook" data-id="${esc(b.id)}">${icon('repeat')}Book again</button><button class="text-btn" data-action="share-booking" data-id="${esc(b.id)}">${icon('link')}Demo link</button></div>${customerWeatherCard(b, icon, esc)}${b.status!=='cancelled'?wf.customerJob(b):''}${b.status === 'confirmed' && !b.draft.accessConfirmed ? b.draft.accessAnswered ? `<div class="notice">${icon('pin')}<span>Access details sent. Joe will confirm them before your visit.</span></div>` : `<div class="notice warning">${icon('pin')}<span>Joe needs to know how to access the work area.</span><button class="text-btn" data-action="customer-access" data-id="${esc(b.id)}">Add access details</button></div>` : ''}</article>`).join('') : `<section class="panel empty">${icon('calendar')}<h2>A little care is on the horizon.</h2><p>You haven’t booked a demo visit yet.<br>Start with a fall cleanup or bring a booking link from another browser.</p><button class="btn" data-action="home">Find a service ${icon('arrow')}</button></section>`}
  ${wf.plans(false)}<section class="panel recovery" style="margin-top:24px"><div class="panel-title">${icon('link')}<h3>Have a demo booking link?</h3></div><p>Paste a link created by this prototype to restore the sample booking here. Real email verification and recovery need a backend.</p><div class="field" style="margin-top:14px"><label for="recover-link">Demo booking link</label><input id="recover-link" type="url" placeholder="Paste your demo booking link"></div>${error ? `<div class="error" role="alert">${esc(error)}</div>` : ''}<button class="text-btn" data-action="recover">Restore sample booking ${icon('arrow')}</button></section>`;
}
function owner() {return `${error?`<div class="error" role="alert">${esc(error)}</div>`:''}${calendarMode!=='day'?calendarOverview({bookings,date:ownerDate,mode:calendarMode,blockedDates,icon,esc}):hq.today()}`;}

function dialogContent() {
  let content = '';
  const b = bookings.find(b => b.id === dialog.id);
  if(dialog.type==='price-breakdown'){content=`<h2 id="dialog-title">Your visit price</h2><p>A clear breakdown of your current choices.</p>${bill(quote(draft),false)}`;
  }else if(dialog.type==='share-app'){const link=publicBookingLink(),owner=ownerViews.includes(view);content=`<h2 id="dialog-title">${owner?'Bring your customers with you.':'Share Joe’s Landscaping.'}</h2><p>${owner?'Share your booking page with a new customer or after a job. They can choose services and book without a phone call.':'Know a neighbor who needs yard care? Send them Joe’s booking page. They can see prices and book without a phone call.'}</p><div class="field"><label for="business-share-link">Customer booking link</label><input id="business-share-link" value="${esc(link)}" readonly></div><div class="btn-row"><button class="btn" data-action="copy-business-link">${icon('link')}Copy booking link</button>${typeof navigator.share==='function'?`<button class="btn secondary" data-action="native-business-share">${icon('share')}More sharing options</button>`:''}</div><p id="business-share-status" role="status" class="share-status"></p><p class="share-note">${owner?'This opens your public customer page.':'This opens Joe’s booking page.'} No booking details are included.</p>`;
  }else if(dialog.type.startsWith('hq-')){content=hq.dialog(dialog);
  }else if(dialog.type.startsWith('wf-')) { content=wf.dialog(dialog);
  } else if (dialog.type === 'rain') {
    content = weatherReview({ plan: dialog.plan, bookings, icon, esc });
  } else if (dialog.type === 'route' && b) {
    const visits = bookings.filter(item => item.status !== 'cancelled' && item.draft.date === b.draft.date).sort((a,c) => a.draft.start - c.draft.start);
    const index = visits.findIndex(item => item.id === b.id), origin = index > 0 ? visits[index - 1].draft.property : 'Joe’s demo base · East Providence';
    content = `<h2 id="dialog-title">Your next stop, clearly laid out.</h2><div class="route-stop"><small>FROM</small><strong>${esc(origin)}</strong></div><div class="route-leg">${icon('car')} ${BUFFER}-minute illustrative drive · leave at ${time(b.draft.start - BUFFER)}</div><div class="route-stop"><small>TO · ARRIVE ${time(b.draft.start)}</small><strong>${esc(b.draft.property)}</strong></div><div class="notice">${icon('pin')}<span><b>Access:</b> ${esc(b.draft.access || b.draft.notes || 'Needs confirmation')}<br><b>Parking:</b> ${esc(b.draft.parking || 'Not specified')}</span></div><p style="margin-top:16px">Sample addresses and drive times. Opening Maps uses the address shown.</p><a class="btn secondary" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.draft.property+' '+(AREAS[b.draft.area]?.name||'East Providence')+', RI')}">Open address in Maps</a>`;
  } else if (dialog.type === 'access' && b) {
    content = `<h2 id="dialog-title">Customer demo: confirm access.</h2><p>Replying as ${esc(b.draft.name)}. This sample answer will appear in Joe’s job details. No real message is sent.</p><div class="field"><label for="access-answer">How can Joe get to the work area?</label><textarea id="access-answer" maxlength="300">${esc(b.draft.accessConfirmed ? b.draft.access : 'The rear gate will be unlocked. Park by the front path; please latch the gate afterward.')}</textarea></div><button class="btn full" style="margin-top:18px" data-action="save-access" data-id="${esc(b.id)}">Save customer demo answer</button>`;
  } else if (dialog.type === 'complete' && b) {
    content = `<h2 id="dialog-title">Good work. Remember it for next time.</h2><p>Record the actual service time so Joe’s property history can be useful for the next visit.</p><div class="field"><label for="actual-minutes">Actual service time · minutes</label><input id="actual-minutes" type="number" min="1" max="600" step="1" value="${b.minutes}"></div><button class="btn full" style="margin-top:18px" data-action="save-complete" data-id="${esc(b.id)}">Complete & save property history</button>`;
  } else if (dialog.type === 'share' && b) {
    const link = portableLink(b);
    content = `<h2 id="dialog-title">Keep your demo booking.</h2><p>Anyone with this link can read its sample booking details. Use fictional information only. This is a portable demo snapshot, not a live, authenticated booking.</p><div class="field"><label for="share-link">Portable demo link</label><textarea id="share-link" rows="4" readonly>${esc(link)}</textarea></div><div class="notice warning">Changes made after creating this link won’t update copies opened elsewhere.</div><button class="btn full" style="margin-top:17px" data-action="copy-link">${icon('link')}Copy demo link</button><p id="copy-status" role="status" style="margin-top:10px"></p>`;
  } else if (dialog.type === 'reschedule' && b) {
    const proposed = { ...b.draft, date: dialog.date }, q = quote(proposed), available = slots(proposed, bookings, b.id);
    content = `<h2 id="dialog-title">Find a fresh time.</h2><p>Move this visit to a time that fits. The price recalculates for the new service date.</p><div class="field"><label for="move-date">New date</label><select id="move-date" data-field="moveDate">${DEMO_DATES.map(d => `<option value="${d}"${selected(d === dialog.date)}>${dateLabel(d)}</option>`).join('')}</select></div><div class="field"><label for="move-time">Available start time · Eastern Time</label><select id="move-time" data-field="moveTime"><option value="">Choose a time</option>${available.map(t => `<option value="${t}"${selected(t === dialog.start)}>${time(t)} · finish ${time(t + q.minutes)}</option>`).join('')}</select></div>${!available.length ? '<div class="notice warning">No time fits this visit on this date. Try another day.</div>' : ''}<div class="bill-total"><span>Updated demo total</span><strong>${money(q.total)}</strong></div>${q.total !== b.total ? '<div class="notice warning">Your discount changes with the service date. Confirming accepts the updated demo price.</div>' : ''}${error ? `<div class="error" role="alert">${esc(error)}</div>` : ''}<button class="btn full" data-action="save-reschedule"${dialog.start === null ? ' disabled' : ''}>Confirm new demo appointment</button><p style="margin-top:12px">Live customer approval and weather notifications require a backend. No messages are sent here.</p>`;
  } else if (dialog.type === 'cancel' && b) {
    content = `<h2 id="dialog-title">Cancel this demo visit?</h2><p>${dateLabel(b.draft.date)} at ${time(b.draft.start)}. This releases its local calendar slot. No payment or message is involved.</p><div class="btn-row"><button class="btn secondary" data-action="close-dialog">Keep my visit</button><button class="btn" data-action="confirm-cancel" data-id="${esc(b.id)}">Cancel demo visit</button></div>`;
  } else if (dialog.type === 'hours') {
    const s = hoursStatus(), today = easternNow().day;
    content = `<h2 id="dialog-title">Hours</h2><p><strong class="${s.open ? 'is-open' : 'is-closed'}">${s.label}</strong>${s.detail ? ` · ${s.detail}` : ''}</p><table class="hours-table"><tbody>${WEEKDAYS.map((day, i) => `<tr${i === today ? ' class="today"' : ''}><th scope="row">${day}</th><td>${hoursRange(HOURS[i])}</td></tr>`).join('')}</tbody></table><p class="hours-note">Eastern Time</p>`;
  } else if (dialog.type === 'contact') {
    content = '<h2 id="dialog-title">A real person, when you need one.</h2><p>Joe’s Landscaping · East Providence, RI<br>Demo phone: 401-555-0142<br>' + HOURS.map((h, i) => h ? `${WEEKDAYS[i].slice(0, 3)} ${hoursRange(h)}` : '').filter(Boolean).join(' · ') + '</p><div class="notice">This is a fictional business contact. No call is placed from this prototype.</div>';
  }
  return `<div class="dialog-backdrop ${dialog.type==='price-breakdown'?'price-sheet':''}"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-head"><span class="eyebrow">JOE’S LANDSCAPING</span><button class="icon-btn" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div>${content}${error && dialog.type !== 'reschedule' ? `<div class="error" role="alert">${esc(error)}</div>` : ''}</section></div>`;
}
function render() {
  const focused = document.activeElement?.id;headerObserver?.disconnect();if(ownerViews.includes(view)&&DEMO_DATES.includes(ownerDate))try{sessionStorage.setItem('business-hq-workday',ownerDate);}catch{}
  app.innerHTML = shell(`${ownerViews.includes(view)?wf.nav(view):''}${error&&!dialog&&['studio','quotes','jobs','plans','manage','bookings','field-job','field-add','field-tasks','field-kit','field-customers'].includes(view)?`<div class="error" role="alert">${esc(error)}</div>`:''}`+(view === 'home' ? home() : view === 'repeat' ? repeatExperience({ bookings, propertyId: repeatPropertyId, icon, esc }) : view === 'book' ? booking() : view === 'confirmation' ? confirmation() : view === 'owner' ? owner() : view==='manage'?hq.business():view.startsWith('field-')?hq.render(view):['studio','quotes','jobs','plans'].includes(view)?wf.render(view):myBookings()));
  const header=document.querySelector('.topbar');if(header){const measure=()=>document.documentElement.style.setProperty('--header-height',header.getBoundingClientRect().height+'px');measure();if(typeof ResizeObserver!=='undefined'){headerObserver=new ResizeObserver(measure);headerObserver.observe(header);}}
  if (focusMain) { document.querySelector('#main').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); focusMain = false; }
  else if (focused) document.getElementById(focused)?.focus({preventScroll:true});
  applyNeeds();
  const onTimeStep = view === 'book' && stage === 1;
  if (onTimeStep && !wasOnTimeStep && !dialog) { const panel = document.querySelector('.step-section[data-section="time"]:not(.done)'); if (panel) scrollTo(0, scrollY + panel.getBoundingClientRect().top - headerOffset()); }
  wasOnTimeStep = onTimeStep;
}
function openDialog(value) { dialogReturnId=document.activeElement?.id||null;dialog = value; error = ''; render(); document.querySelector('.dialog button')?.focus(); }
function encode(value) { const bytes = new TextEncoder().encode(JSON.stringify(value)); return btoa(Array.from(bytes, b => String.fromCharCode(b)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/, ''); }
function publicBookingLink(){const local=['localhost','127.0.0.1'].includes(location.hostname),url=new URL(local?'https://rikbanerjee.github.io/smbOS/':location.origin+location.pathname);url.searchParams.set('view','customer');return url.href;}
function portableLink(b) { return `${location.origin}${location.pathname}#demo-booking=${encode({id:b.id,draft:b.draft,status:b.status})}`; }
function recoverLink(link) {
  try {
    const url = new URL(link), token = new URLSearchParams(url.hash.slice(1)).get('demo-booking');
    if (!token || token.length > 12000) throw new Error('invalid');
    const parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(token.replaceAll('-','+').replaceAll('_','/')), c => c.charCodeAt(0))));
    if (!/^JHQ-[A-Z0-9]{8}$/.test(parsed.id) || !parsed.draft || !Array.isArray(parsed.draft.services) || parsed.draft.services.some(id => !SERVICES[id]) || typeof parsed.draft.name !== 'string' || typeof parsed.draft.email !== 'string' || typeof parsed.draft.phone !== 'string' || typeof parsed.draft.property !== 'string' || !['small','medium','large'].includes(parsed.draft.size) || !AREAS[parsed.draft.area] || ![1,2,3].includes(Number(parsed.draft.stories)) || validBooking(parsed.draft,[],null)) throw new Error('invalid');
    if (bookings.some(b => b.id === parsed.id)) { currentId = parsed.id; navigate('confirmation'); return; }
    if (validBooking(parsed.draft, bookings)) { error = 'That snapshot conflicts with a booking in this browser. It has not been imported.'; view = 'bookings'; render(); return; }
    const b = { id: parsed.id, draft: parsed.draft, ...quote(parsed.draft), status: ['confirmed','cancelled','completed'].includes(parsed.status) ? parsed.status : 'confirmed' };
    b.draft.scopeConfirmed = true; bookings.push(b); persist(); currentId = b.id; ownerDate = b.draft.date; navigate('confirmation'); announce('Sample booking restored in this browser.');
  } catch { error = 'That link is not a valid Business HQ demo booking. Paste the complete link from a confirmation screen.'; view = 'bookings'; render(); }
}
function downloadCalendar(b) {
  const stamp = minute => `${b.draft.date.replaceAll('-','')}T${String(Math.floor(minute/60)).padStart(2,'0')}${String(minute%60).padStart(2,'0')}00`;
  const clean = v => String(v).replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
  const text = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Business HQ//Prototype//EN','BEGIN:VEVENT',`UID:${b.id}@business-hq-demo`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;TZID=America/New_York:${stamp(b.draft.start)}`,`DTEND;TZID=America/New_York:${stamp(b.draft.start+b.minutes)}`,`SUMMARY:${clean('DEMO · Joe’s Landscaping · '+b.lines.map(l=>l.name).join(' + '))}`,`LOCATION:${clean(b.draft.property+' · '+AREAS[b.draft.area].name)}`,'DESCRIPTION:Fictional prototype appointment. No real service is booked.','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));
  const a = document.createElement('a'); a.href=url; a.download=`${b.id}.ics`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  event.preventDefault();
  const action = button.dataset.action, id = button.dataset.id;
  if(await hq.handle(action,id))return;
  if (action === 'wf-request-quote' && view === 'book' && stage === 0) { const open = ['place', 'services', 'details', 'quote'].find(id => !sectionComplete(id)); if (open) { error = open === 'quote' ? 'Confirm where Joe should send the quote, then tap Done.' : 'Finish the sections above first.'; showWhatsMissing(open); return; } }
  if(wf.handle(action,id))return;
  if(action==='share-app'){openDialog({type:'share-app'});return;}
  if(action==='price-breakdown'){openDialog({type:'price-breakdown'});return;}
  if(action==='copy-business-link'){const status=document.querySelector('#business-share-status');try{await navigator.clipboard.writeText(publicBookingLink());status.textContent=ownerViews.includes(view)?'Copied. Share this link with your next customer.':'Copied. Share Joe’s booking page with a neighbor.';}catch{document.querySelector('#business-share-link').select();status.textContent='Select and copy the booking link above.';}return;}
  if(action==='native-business-share'){try{await navigator.share({title:'Book Joe’s Landscaping',text:'Choose your services and book a visit with Joe.',url:publicBookingLink()});}catch(err){if(err.name!=='AbortError')document.querySelector('#business-share-status').textContent='Use Copy booking link to share this page.';}return;}
  if(action==='calendar-mode'&&['day','week','month'].includes(id)){if(id==='day'&&!DEMO_DATES.includes(ownerDate)){ownerDate=(calendarMode==='week'?DEMO_DATES.find(d=>weekDates(ownerDate).includes(d)):DEMO_DATES.find(d=>d.slice(0,7)===ownerDate.slice(0,7)))||DEMO_DATES.find(d=>d>=ownerDate)||DEMO_DATES.at(-1);}calendarMode=id;render();return;}
  if(action==='calendar-period'&&calendarMode!=='day'){ownerDate=shiftPeriod(ownerDate,calendarMode,Number(id));render();return;}
  if(action==='calendar-day'&&(DEMO_DATES.includes(id)||bookings.some(b=>b.draft.date===id))){ownerDate=id;calendarMode='day';focusMain=true;render();return;}

  if (['home','bookings','owner'].includes(action)) return navigate(action);
  if (action === 'service') return startBooking(id);
  if (action === 'fall-bundle') { startBooking(); draft.services = ['leaves','gutters']; render(); return; }
  if (action === 'rebook-default') return navigate('repeat');
  if (action === 'rebook-selected') { const property = myProperties()[0], picked = recentPick ?? propertyHistory(property, bookings).services; if (!picked.length) return; const repeat=recentDraft(property,bookings,picked);draft=repeat.draft;draft.date=firstAvailableDate();if(repeat.needsReview)confirmChoices('picked','place','picked_services','services');else confirmChoices('place','services','size','stories');stage=repeat.needsReview?0:1; currentId = null; recentPick = null; return navigate('book'); }
  if (action === 'repeat-same') return startRepeat(false);
  if (action === 'repeat-edit') return startRepeat(true);
  if (action === 'rebook') return startBooking('leaves', bookings.find(b=>b.id===id)?.draft);
  if (action === 'haul') { confirmChoices('haul'); draft.haul = id === 'yes'; draft.start = null; error = ''; render(); announce(`Price updated to ${money(quote(draft).total)}`); snapNext('details'); return; }
  if (action === 'stories') { confirmChoices('stories'); draft.stories = Number(id); draft.start = null; error = ''; render(); announce(`Price updated to ${money(quote(draft).total)}`); snapNext('details'); return; }
  if (action === 'size') { confirmChoices('size'); draft.size = id; draft.start = null; error = ''; render(); announce(`Price updated to ${money(quote(draft).total)}`); snapNext('details'); }
  if (action === 'week-shift') { if (id) { bookingWeek = id; render(); } return; }
  if (action === 'date') { sectionState(); confirmed.time=false; confirmed.date=true; draft.date=id; draft.start=null; error=''; render(); }
  if (action === 'pick-property') { useProperty(draft, id === 'new' ? null : myProperties().find(p => p.id === id)); sectionState(); confirmed.picked = true; confirmed.place = id !== 'new'; if (id !== 'new') advance('place'); editingProperty = null; draft.start = null; error = ''; render(); if (id === 'new') snapNext('place'); advanceFrom = null; return; }
  if (action === 'edit-property') { const p = myProperties().find(p => p.id === id); editingProperty = p ? { id, address: p.address, city: p.city, state: p.state, access: p.access ?? '' } : null; render(); document.querySelector('#edit-address')?.focus(); return; }
  if (action === 'cancel-property') { editingProperty = null; render(); return; }
  if (action === 'save-property') {
    const e = editingProperty, before = myProperties().find(p => p.id === e?.id);
    if (!e || !before || !propertyReady(e)) return;
    const state = e.state.trim().toUpperCase(), changes = { address: e.address.trim(), city: e.city.trim(), state, area: areaForCity(e.city, state), access: e.access.trim() };
    if (changes.access !== (before.access ?? '') || changes.address !== before.address) changes.accessConfirmed = false;
    propertyEdits[e.id] = { ...propertyEdits[e.id], ...changes }; persistProperties(); editingProperty = null;
    useProperty(draft, myProperties().find(p => p.id === e.id)); sectionState(); confirmed.picked = true; draft.start = null; error = ''; render(); announce('Property updated. Joe will confirm any access changes.'); return;
  }
  if (action === 'section-done') { if (!doneReady(id)) { showWhatsMissing(id); announce('Please finish the highlighted items.'); return; } confirmChoices(id); advance(id); error = ''; render(); advanceFrom = null; return; }
  if (action === 'home-continue') { if (!homePick.length) return; const picked = [...homePick]; homePick = []; startBooking(picked[0]); draft.services = picked; confirmChoices('picked_services', 'services'); render(); snapNext(); return; }
  if (action === 'service-filter') { serviceCategory = id; if (id === 'all') serviceQuery = ''; render(); document.querySelector('.filter-chip.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); return; }
  if (action === 'toggle-section') { sectionOpen[id] = !(sectionOpen[id] ?? false); render(); return; }
  if (action === 'slot') { confirmChoices('date'); draft.start=Number(id); error=''; render(); }
  if (action === 'edit') { stage=Number(id); error=''; focusMain=true; render(); }
  if (action === 'previous') { stage=Math.max(0,stage-1);error='';focusMain=true;render(); }
  if (action === 'next') {
    error='';
    if (stage === 0 && !draft.approvedOffer) { const open=['place','services','details'].find(id=>!sectionComplete(id)); if(open){error=open==='place'?'Choose a property, then tap Done.':open==='services'?'Choose at least one service, then tap Done.':'Confirm your yard size and home details.';showWhatsMissing(open);return;} }
    if (stage === 1) { const open=['time','contact'].find(id=>!sectionComplete(id)); if(open){error=open==='time'?'Choose a start time, then tap Done.':'Confirm your contact details.';showWhatsMissing(open);return;} }
    if (stage === 0) { if(quote(draft).missing.length){error='Please answer: '+quote(draft).missing.join(', ');render();return;} if(quote(draft).assessment||quote(draft).minutes+30>240)return; if(!draft.property.trim()){error='Add the street address to continue.';render();return;} if(!quote(draft).serviceable){error='This property is outside Joe’s demo service area.';render();return;} stage=1; focusMain=true; render(); return; }
    const validation=validBooking(draft,bookings);
    if (validation) { error=validation; render(); return; }
    if (stage===1) { stage=2;focusMain=true;render();return; }
    try{wf.verifyQuote(draft);}catch(err){error=err.message;render();return;}
    const bytes=crypto.getRandomValues(new Uint8Array(4));
    if (draft.propertyId === 'new') { const p = { id: `prop-${Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('')}`, customerId: CUSTOMER_ID, label: draft.property, address: draft.property, city: draft.city.trim(), state: draft.state.trim().toUpperCase(), area: draft.area, size: draft.size, stories: draft.stories, access: draft.access ?? '', parking: '', accessConfirmed: false, propertyAllowance: false }; addedProperties.push(p); persistProperties(); draft.propertyId = p.id; }
    draft.accessAnswered=Boolean(draft.access?.trim());
    const b={id:`JHQ-${Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('').toUpperCase()}`,draft:structuredClone(draft),...quote(draft),status:'confirmed'};
    wf.booked(draft,b.id);bookings.push(b); persist(); currentId=b.id;ownerDate=b.draft.date;navigate('confirmation');announce('Your demo booking is confirmed.');
  }
  if (action === 'load-working-day') {
    const existing = bookings.find(b => b.demoScenario && b.status !== 'cancelled');
    if (existing) { ownerDate = existing.draft.date; navigate('owner'); return; }
    const visits = sampleDay(bookings, blockedDates);
    if (!visits.length) { view = 'owner'; error = 'No empty sample day fits both visits. Existing bookings were preserved.'; render(); return; }
    bookings.push(...visits); ownerDate = visits[0].draft.date; persist(); navigate('owner'); announce('Two fictional visits loaded. One needs an access answer.'); return;
  }
  if (action === 'route-preview') openDialog({type:'route',id});
  if (action === 'customer-access') openDialog({type:'access',id});
  if (action === 'save-access') {
    const b = bookings.find(item => item.id === id), answer = document.querySelector('#access-answer').value.trim();
    if (!answer) { error = 'Add the customer’s access instructions.'; render(); return; }
    if (b) { b.draft.access = answer; b.draft.accessAnswered = true; b.draft.accessConfirmed = false; if (b.pendingChange) { b.pendingChange.draft.access = answer; b.pendingChange.draft.accessAnswered = true; b.pendingChange.draft.accessConfirmed = false; } persist(); }
    dialog = null; render(); announce('Access details sent to Joe to confirm.');
  }
  if (action === 'pack-all') {
    const list = packingList(bookings, ownerDate);
    [...list.tools, ...list.materials.map(item => `${item.name}:${item.quantity}`)].forEach(item => { packed[`${ownerDate}:${item}`] = true; });
    persistOperations(); render(); announce('Demo vehicle checklist marked packed.');
  }
  if (action === 'save-complete') {
    const b = bookings.find(item => item.id === id), actual = Number(document.querySelector('#actual-minutes').value);
    if (!Number.isInteger(actual) || actual < 1 || actual > 600) { error = 'Enter a whole number of minutes between 1 and 600.'; render(); return; }
    try { wf.complete(id,actual); } catch(err) { error=err.message;render();return; }
    dialog = null; render(); announce('Job completed and actual time saved to the property history.');
  }
  if (action === 'rain-plan') openDialog({type:'rain',plan:proposeRainPlan(bookings,ownerDate,blockedDates)});
  if (action === 'approve-rain' && dialog?.type === 'rain') {
    try { const date = dialog.plan.sourceDate; bookings = approveRainPlan(bookings, dialog.plan, blockedDates); blockedDates = [...new Set([...blockedDates,date])]; persist(); persistOperations(); dialog = null; render(); announce('Demo weather requests created. Original appointments remain until customers respond.'); }
    catch (err) { error = err.message; render(); }
  }
  if (action === 'accept-weather' || action === 'decline-weather') {
    try { bookings = respondToRainChange(bookings, id, action === 'accept-weather', blockedDates); persist(); render(); announce(action === 'accept-weather' ? 'Customer accepted the new time and price.' : 'Proposed time declined. Original appointment preserved.'); }
    catch (err) { error = err.message; render(); }
  }
  if (action==='contact') openDialog({type:'contact'});
  if (action==='hours') openDialog({type:'hours'});
  if (action==='close-dialog') { dialog=null;error='';render();if(dialogReturnId)document.getElementById(dialogReturnId)?.focus({preventScroll:true}); }
  if (action==='share-booking') openDialog({type:'share',id});
  if (action==='copy-link') {
    const input=document.querySelector('#share-link');
    try { await navigator.clipboard.writeText(input.value); document.querySelector('#copy-status').textContent='Copied. Open it in another browser to try demo recovery.'; }
    catch { input.select(); document.querySelector('#copy-status').textContent='Select and copy the link above.'; }
  }
  if (action==='recover') recoverLink(document.querySelector('#recover-link').value);
  if (action==='ics') { const b=bookings.find(b=>b.id===id);if(b)downloadCalendar(b); }
  if (action==='cancel') openDialog({type:'cancel',id});
  if (action==='confirm-cancel') { const b=bookings.find(b=>b.id===id);if(b)b.status='cancelled';persist();dialog=null;render();announce('Demo booking cancelled. Its time is available again.'); }
  if (action==='complete') { const b=bookings.find(b=>b.id===id);if(b && !b.pendingChange && !blockedDates.includes(b.draft.date))openDialog({type:'complete',id}); }
  if (action==='reschedule') { const b=bookings.find(b=>b.id===id);if(b && !b.pendingChange)openDialog({type:'reschedule',id,date:b.draft.date,start:null}); }
  if (action==='save-reschedule' && dialog) {
    const b=bookings.find(b=>b.id===dialog.id);
    const next={...b.draft,date:dialog.date,start:dialog.start};
    const validation=validBooking(next,bookings,b.id);
    if(validation){error=validation;render();return;}
    Object.assign(b,{draft:next,...quote(next),changeDeclined:false});ownerDate=next.date;persist();dialog=null;error='';render();announce('Demo visit rescheduled.');
  }
});
document.addEventListener('toggle',event=>wf.disclosure(event.target),true);
document.addEventListener('input',event=>{if(hq.input(event.target))return;if(['edit','question','answer'].includes(event.target.dataset.wf)){wf.change(event.target,false);applyNeeds();}});
document.addEventListener('input',event=>{const key=event.target.dataset.editProperty;if(key&&editingProperty){editingProperty[key]=event.target.value;const save=document.querySelector('[data-action="save-property"]');if(save)save.disabled=!propertyReady(editingProperty);}});
document.addEventListener('input',event=>{if(event.target.matches('[data-service-search]')){serviceQuery=event.target.value;applyServiceFilter();}});
// Keep a panel's Done button in step with typing; the full re-render waits for the change event.
document.addEventListener('input',event=>{const el=event.target,field=el.dataset.field;if(!['property','city','state','name','email','phone'].includes(field))return;draft[field]=field==='state'?el.value.trim().toUpperCase():el.value;if(field==='city'||field==='state')draft.area=areaForCity(draft.city,draft.state);applyNeeds();});
// Tapping Done must not blur the field first: the blur's re-render would swallow the tap.
document.addEventListener('pointerdown',event=>{if(event.target.closest('.section-done'))event.preventDefault();});
document.addEventListener('change', async event => {
  const el=event.target;
  if(await hq.change(el))return;
  if(el.dataset.wf==='answer')confirmChoices(`q:${el.dataset.serviceId}:${el.dataset.question}`);
  if(wf.change(el)){if(el.dataset.wf==='answer'&&el.type==='radio')snapNext('details');return;}
  if (el.dataset.pack) { packed[`${ownerDate}:${el.dataset.pack}`] = el.checked; persistOperations(); render(); return; }
  if (el.dataset.ownerAccess) { const b = bookings.find(item => item.id === el.dataset.ownerAccess); if (b) { b.draft.accessConfirmed = el.checked; if (b.pendingChange) b.pendingChange.draft.accessConfirmed = el.checked; persist(); } render(); announce(el.checked ? 'Access details confirmed for this job.' : 'Access marked as needing confirmation.'); return; }
  if (el.dataset.recent) { const id = el.dataset.recent, current = recentPick ?? propertyHistory(PROPERTIES[0], bookings).services; recentPick = el.checked ? [...new Set([...current, id])] : current.filter(s => s !== id); render(); return; }
  if (el.dataset.homePick) { const id = el.dataset.homePick; homePick = el.checked ? [...homePick, id] : homePick.filter(s => s !== id); render(); return; }
  if (el.dataset.service) { const id=el.dataset.service; confirmChoices('picked_services'); draft.services=el.checked?[...new Set([...draft.services,id])]:draft.services.filter(s=>s!==id);draft.start=null;error='';render();announce(`Price updated to ${money(quote(draft).total)}`);return; }
  const field=el.dataset.field;if(!field)return;
  if(field==='repeatProperty'){repeatPropertyId=el.value;render();return;}
  if(field==='ownerDate'){ownerDate=el.value;render();return;}
  if(field==='moveDate'){dialog.date=el.value;dialog.start=null;error='';render();return;}
  if(field==='moveTime'){dialog.start=el.value===''?null:Number(el.value);render();return;}
  draft[field]=el.type==='checkbox'?el.checked:el.value;
  if(field==='access')draft.accessConfirmed=false;
  if(field==='state')draft.state=draft.state.trim().toUpperCase();
  if(field==='city'||field==='state'){draft.area=areaForCity(draft.city,draft.state);draft.start=null;}
  // Text fields skip re-rendering (it would steal focus) unless they just completed or reopened a section.
  if(['name','email','phone','notes','property','access','parking'].includes(field)){const panel=field==='property'?'place':stage===0?'quote':'contact',done=field==='property'?sectionComplete('place'):['name','email','phone'].includes(field)?sectionComplete(panel):null;if(done===null||done===sectionDone[panel])return;}
  if(['area','haul'].includes(field))draft.start=null;
  error='';render();
});
document.addEventListener('keydown', event => {
  if(!dialog)return;
  if(event.key==='Escape'){dialog=null;error='';render();if(dialogReturnId)document.getElementById(dialogReturnId)?.focus({preventScroll:true});return;}
  if(event.key==='Tab'){
    const items=[...document.querySelectorAll('.dialog button:not(:disabled),.dialog input,.dialog select,.dialog textarea')];
    const first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
// A second tab may reserve a time while this tab is reviewing. Reload local state before confirmation.
window.addEventListener('storage', event => {
  if(event.key==='business-hq-field-desk-v1'){hq.reload();render();return;}
  if([WORK_STORE,RULE_STORE].includes(event.key)){wf.reload(event.key);hq.reload();render();return;}
  if (event.key === 'business-hq-operations-v2') {
    try { const next = JSON.parse(event.newValue || '{}'); packed = next.packed && typeof next.packed === 'object' ? next.packed : {}; blockedDates = Array.isArray(next.blockedDates) ? next.blockedDates.filter(d => DEMO_DATES.includes(d)) : []; render(); }
    catch { announce('Could not refresh demo preparation details.'); }
  } else if(event.key === STORE) {
    try { const next = JSON.parse(event.newValue || '[]'); if (Array.isArray(next)) bookings = next; render(); }
    catch { announce('Could not refresh demo bookings.'); }
  }
});
if(view==='owner'&&new URLSearchParams(location.search).get('sample')==='1'){const existing=bookings.find(b=>b.demoScenario&&b.status==='confirmed');if(existing)ownerDate=existing.draft.date;else{const visits=sampleDay(bookings,blockedDates);if(visits.length){bookings.push(...visits);ownerDate=visits[0].draft.date;persist();}}}

if(new URLSearchParams(location.search).has('sample')){const url=new URL(location.href);url.searchParams.delete('sample');history.replaceState(null,'',url);}
render();
if(location.hash.startsWith('#demo-booking='))recoverLink(location.href);
