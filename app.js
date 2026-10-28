import { SERVICES, AREAS, DEMO_DATES, BUFFER, money, duration, time, dateLabel, defaultDraft, quote, slots as modelSlots, validBooking as modelValidBooking } from './model.js?v=day-ready-2';
import { PROPERTIES, propertyHistory, repeatDraft, packingList, sampleDay, proposeRainPlan, approveRainPlan, respondToRainChange, readiness } from './operations.js?v=day-ready-2';
import { repeatExperience, providerDay, weatherReview, customerWeatherCard } from './experience.js?v=day-ready-2';

const paths = {
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
  check: '<path d="m5 12 4 4L19 6"/>', shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
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
const STORE = 'business-hq-prototype-v1';
let storageAvailable = true;
let bookings = [];
try { bookings = JSON.parse(localStorage.getItem(STORE) || '[]').filter(b => b && typeof b.id === 'string' && b.draft && Array.isArray(b.draft.services) && Number.isFinite(b.total) && Number.isFinite(b.block)); } catch { bookings = []; storageAvailable = false; }
let view = 'home', stage = 0, draft = defaultDraft(), error = '', currentId = null, ownerDate = DEMO_DATES[0], dialog = null;
let focusMain = false;
let repeatPropertyId = PROPERTIES[0].id;
let packed = {}, blockedDates = [];
try { const saved = JSON.parse(localStorage.getItem('business-hq-operations-v2') || '{}'); packed = saved.packed && typeof saved.packed === 'object' ? saved.packed : {}; blockedDates = Array.isArray(saved.blockedDates) ? saved.blockedDates.filter(d => DEMO_DATES.includes(d)) : []; } catch { /* The demo still works without saved operational state. */ }
const slots = (d, list = bookings, id = null) => modelSlots(d, list, id, blockedDates);
const validBooking = (d, list = bookings, id = null) => modelValidBooking(d, list, id, blockedDates);
function persistOperations() { try { localStorage.setItem('business-hq-operations-v2', JSON.stringify({ packed, blockedDates })); } catch { storageAvailable = false; } }
function firstAvailableDate() { return DEMO_DATES.find(d => !blockedDates.includes(d)) || DEMO_DATES[0]; }
function startRepeat(edit = false) { const property = PROPERTIES.find(p => p.id === repeatPropertyId) || PROPERTIES[0]; draft = repeatDraft(property, bookings); draft.date = firstAvailableDate(); stage = edit ? 0 : 1; currentId = null; navigate('book'); }

const app = document.querySelector('#app');
function announce(message) { document.querySelector('#announcement').textContent = message; }
function persist() { try { localStorage.setItem(STORE, JSON.stringify(bookings)); } catch { storageAvailable = false; } }
function navigate(next) { view = next; error = ''; dialog = null; focusMain = true; render(); }
function startBooking(id = 'leaves', previous = null) {
  draft = previous ? { ...previous, services: [...previous.services], date: DEMO_DATES[0], start: null } : { ...defaultDraft(), services: [id] };
  draft.date = firstAvailableDate(); stage = 0; currentId = null; navigate('book');
}
function shell(content) {
  const active = view === 'owner' ? 'owner' : view === 'bookings' ? 'bookings' : 'home';
  const brand = `<span class="brand-mark">${icon('leaf')}</span><span><strong>Joe’s Landscaping</strong><small>A little care. A better outdoors.</small></span>`;
  return `<div class="demo-bar"><span class="demo-dot"></span><b>BUSINESS HQ PROTOTYPE</b><span>·</span>Day-ready update · Fictional data · No messages sent</div>
  <div class="shell"><aside class="sidebar"><a class="brand" href="#" data-action="home">${brand}</a>
  <div><div class="nav-caption">YOUR NEIGHBORHOOD, CARED FOR</div><nav class="nav-group" aria-label="Main navigation">
  <button class="nav-item ${active === 'home' ? 'active' : ''}" ${active === 'home' ? 'aria-current="page"' : ''} data-action="home">${icon('grid')}<span>Book a service</span></button>
  <button class="nav-item ${active === 'bookings' ? 'active' : ''}" ${active === 'bookings' ? 'aria-current="page"' : ''} data-action="bookings">${icon('calendar')}<span>My bookings</span>${bookings.filter(b => b.status !== 'cancelled').length ? `<span class="pill">${bookings.filter(b => b.status !== 'cancelled').length}</span>` : ''}</button>
  <button class="nav-item ${active === 'owner' ? 'active' : ''}" ${active === 'owner' ? 'aria-current="page"' : ''} data-action="owner">${icon('bag')}<span>Joe’s workspace</span><span class="pill">DEMO</span></button>
  </nav></div><div class="sidebar-note">${icon('leaf')}<strong>Good work. Less back-and-forth.</strong>Pick your services. Find a time. We’ll take care of the details.</div>
  <div class="powered"><span class="bhq">B</span><span>A small business, powered by <b>Business HQ</b></span></div></aside>
  <div class="workspace"><header class="topbar"><div class="breadcrumb">Joe’s Landscaping <span>/</span><b>${active === 'owner' ? 'Your day, ready to go' : active === 'bookings' ? 'My bookings' : 'Customer experience'}</b></div>
  <a class="brand mobile-brand" href="#" data-action="home">${brand}</a><div class="top-actions"><span class="status"><i></i>Locally owned. Personally cared for.</span><button class="icon-btn" aria-label="Joe’s contact details" data-action="contact">${icon('phone')}</button><span class="customer-name">${active === 'owner' ? 'Hey, Joe' : 'Hi, Mary'}</span><span class="avatar">${active === 'owner' ? 'J' : 'MT'}</span></div></header>
  <main id="main" tabindex="-1">${content}<footer class="footer"><span>Joe’s Landscaping · East Providence, RI · Serving neighbors since 2015</span><span>Day-ready v2 · Sample dates Oct–Nov 2026 · Browser-local data</span></footer></main></div></div>${dialog ? dialogContent() : ''}`;
}
function garden() { return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 450 260" preserveAspectRatio="xMaxYMax slice"><circle cx="307" cy="83" r="49" fill="#a9bb79" opacity=".22"/><path d="M70 260c-5-103 47-95 84-70 31-76 111-48 122-10 51-90 126-67 174-31v111" fill="#4c7450"/><path d="M134 260c36-47 75-41 115-26 60-54 135-72 201-25v51" fill="#78925d"/><path d="M266 260c25-19 42-48 47-91l4-90 5 90c5 43 21 72 47 91" fill="#9b9766"/><path d="M318 195c-39-9-69-34-70-61 35-1 66 23 70 61m0-44c34-8 56-28 57-52-28 1-52 22-57 52m0-37c-29-5-50-22-53-42 25-3 46 15 53 42m1-33c25-5 42-21 43-39-22-2-39 14-43 39" fill="#c5d39b"/><path d="M208 260v-75m0 40c-30-1-45-18-46-37 25 1 41 14 46 37m0-21c29-2 44-19 43-37-25 4-40 16-43 37" stroke="#a7ba83" stroke-width="5" fill="#a7ba83"/><path d="M385 260v-54m0 26c-24-3-33-15-33-29 18 1 29 10 33 29m0-13c22-5 31-17 30-31-19 4-28 14-30 31" stroke="#c1ce98" stroke-width="4" fill="#c1ce98"/><ellipse cx="97" cy="222" rx="32" ry="12" fill="#7d975e"/><path d="M95 260v-40m-11 10 11 13 12-16" stroke="#bdc990" stroke-width="3" fill="none"/><circle cx="380" cy="49" r="3" fill="#c6d3a0"/><circle cx="194" cy="96" r="2" fill="#c6d3a0"/><path d="m181 57 4-7 4 7-4 7Z" fill="#c6d3a0"/></svg></div>`; }
function home() {
  const property = PROPERTIES[0], previous = propertyHistory(property, bookings);
  const pending = bookings.filter(b => b.pendingChange?.status === 'awaiting_customer').length;
  return `<div class="intro-row"><div><div class="eyebrow">YOUR CUSTOMERS RETURN. YOUR DAY IS READY.</div><h1>A familiar face. A simpler visit.</h1><p>Book the care your property needs, without starting from scratch.</p></div><span class="tag">${icon('calendar')}Thursdays, 1–5 PM</span></div>
  ${pending ? `<div class="notice warning">${icon('rain')}<span>${pending} demo weather update${pending === 1 ? '' : 's'} waiting for a customer answer.</span><button class="text-btn" data-action="bookings">Review changes ${icon('arrow')}</button></div>` : ''}
  <section class="repeat remembered"><div class="repeat-icon">${icon('repeat')}</div><div><div class="eyebrow">WELCOME BACK, MARY</div><h2>Same property. Same trusted Joe.</h2><p>${esc(property.label)} · ${previous.services.map(id => SERVICES[id].name).join(' + ')} · last visit ${dateLabel(previous.date)}</p><span class="hint">Yard details, access, and parking already remembered.</span></div><button class="btn" data-action="rebook-default">Book again ${icon('arrow')}</button></section>
  <div class="section-heading"><div><h2>Or, a little different this time?</h2><p>Choose a service and see the full price before you book.</p></div><span>4 services · One easy visit</span></div>
  <section class="services" aria-label="Available services">${Object.entries(SERVICES).map(([id, service]) => `<button class="service-card" data-action="service" data-id="${id}"><span class="service-icon ${service.icon}">${icon(service.icon)}</span><span><span class="category">${service.category}</span><h3>${service.name}</h3><p>${service.description}</p><span class="service-meta"><b>From ${money(service.base)}</b><span>·</span>${duration(service.minutes)}</span></span><span class="card-arrow">${icon('arrow')}</span></button>`).join('')}</section>
  <section class="hero compact-promo" aria-label="Seasonal gutter special"><div><div class="eyebrow">OCTOBER VISITS · GUTTERS 10% OFF</div><h2>Fall care, handled.</h2><p>Combine services in one visit, with a single travel charge.</p><button class="btn" data-action="fall-bundle">Build my fall visit ${icon('arrow')}</button></div>${garden()}</section>
  <section class="try-owner"><div><strong>See the other side of a better day.</strong><p>Try two demo visits, a packing list, and a rain-delay decision.</p></div><button class="text-btn" data-action="load-working-day">Try Joe’s working day ${icon('arrow')}</button></section>
  <div class="trust-strip"><span>${icon('shield')}A clear total before you book</span><span>${icon('clock')}Appointments that fit the whole visit</span><span>${icon('pin')}East Providence & Riverside</span></div>`;
}
function stepper() { return `<div class="stepper" aria-label="Booking progress">${['Your visit', 'Find a time', 'Review & book'].map((name, i) => `${i ? '<span class="step-line"></span>' : ''}<div class="step ${i === stage ? 'active' : i < stage ? 'done' : ''}" ${i === stage ? 'aria-current="step"' : ''}><b>${i < stage ? '✓' : i + 1}</b>${name}</div>`).join('')}</div>`; }
function scope() {
  const hasYard = draft.services.some(id => id === 'leaves' || id === 'mowing');
  return `<section class="panel"><div class="panel-title">${icon('pin')}<h3>First, where are we headed?</h3></div><p>A saved property means less typing. All details here are fictional.</p>
  <div class="fields"><div class="field wide"><label for="property">Service address</label><input id="property" data-field="property" value="${esc(draft.property)}" maxlength="80"></div><div class="field wide"><label for="area">Property location · demo travel zone</label><select id="area" data-field="area">${Object.entries(AREAS).map(([id,a]) => `<option value="${id}"${selected(draft.area === id)}>${a.name}${a.miles !== null ? ` · ${a.miles} miles from Joe` : ''}</option>`).join('')}</select><span class="hint">Saved fictional address. Travel uses the selected demo zone; live address verification is not connected.</span></div><div class="field wide"><label for="property-access">Access instructions</label><textarea id="property-access" data-field="access" maxlength="300">${esc(draft.access || draft.notes || '')}</textarea></div><div class="field wide"><label for="parking">Where should Joe park?</label><input id="parking" data-field="parking" value="${esc(draft.parking || '')}" maxlength="150"></div><div class="field wide"><label class="access-check"><input type="checkbox" data-field="accessConfirmed"${checked(draft.accessConfirmed)}> These access details are confirmed</label></div></div></section>
  <section class="panel"><div class="panel-title">${icon('leaf')}<h3>A few details. A clear price.</h3></div><p>Tell Joe what to expect, and your total updates as you go.</p>
  ${hasYard ? `<div style="margin-top:20px"><span class="label" id="yard-label">How big is your yard?</span><div class="choice-row" role="group" aria-labelledby="yard-label">${[['small','Small','Under ¼ acre'],['medium','Medium','¼–½ acre'],['large','Large','½–1 acre']].map(([id,n,desc]) => `<button class="choice ${draft.size === id ? 'selected' : ''}" aria-pressed="${draft.size === id}" data-action="size" data-id="${id}"><strong>${n}</strong><small>${desc}</small></button>`).join('')}</div><p class="hint" style="margin-top:10px">Over 1 acre or unusually heavy debris? Ask Joe for an assessment before booking.</p></div>` : ''}
  ${draft.services.includes('leaves') ? `<div class="option-row"><input type="checkbox" id="haul" data-field="haul"${checked(draft.haul)}><label for="haul">Take the leaves away, too<small>Otherwise, Joe bags them at the curb. Adds 15 minutes.</small></label><span class="price-note">+$35</span></div>` : ''}
  ${draft.services.includes('gutters') ? `<div class="field" style="margin-top:19px"><label for="stories">How many stories is your home?</label><select id="stories" data-field="stories"><option value="1"${selected(Number(draft.stories) === 1)}>1 story · base price</option><option value="2"${selected(Number(draft.stories) === 2)}>2 stories · +$40 before discount · +30 min</option><option value="3"${selected(Number(draft.stories) === 3)}>3 or more · assessment needed</option></select></div>` : ''}
  ${!hasYard && !draft.services.includes('gutters') ? '<div class="notice">Standard residential system: up to 6 irrigation zones. Larger systems need an assessment.</div>' : ''}</section>
  <section class="panel"><div class="panel-title">${icon('bag')}<h3>While Joe’s already there…</h3></div><p>Add another service. One visit, one travel charge.</p>${Object.entries(SERVICES).map(([id,s]) => `<label class="addon ${draft.services.includes(id) ? 'selected' : ''}" for="add-${id}"><span class="service-icon ${s.icon}">${icon(s.icon)}</span><span><h3>${s.name}</h3><p>${id === 'gutters' ? '10% off for October visits' : `${money(s.base)} starting price · scope adjusts total`}</p></span><input type="checkbox" id="add-${id}" data-service="${id}"${checked(draft.services.includes(id))}${draft.services.length === 1 && draft.services.includes(id) ? ' disabled' : ''}></label>`).join('')}</section>`;
}
function scheduling() {
  const q = quote(draft), available = slots(draft, bookings);
  return `<section class="panel"><div class="panel-title">${icon('calendar')}<h3>A time that really works.</h3></div><p>Joe works Thursdays, 1–5 PM. Allow 15 minutes for the first drive before arrival. We reserve ${duration(q.minutes)} for your services and ${BUFFER} minutes for travel and setup.</p>
  <div class="date-options" role="group" aria-label="Available Thursdays">${DEMO_DATES.map(date => `<button class="choice date-option ${draft.date === date ? 'selected' : ''}"${blockedDates.includes(date) ? ' disabled title="Paused for rain"' : ''} aria-pressed="${draft.date === date}" data-action="date" data-id="${date}"><span>Thursday</span><b>${date.slice(8)}</b><small>${date.slice(5,7) === '10' ? 'October' : 'November'}</small></button>`).join('')}</div>
  <span class="label">Available start times · Eastern Time</span><div class="slots">${available.map(start => `<button class="choice slot ${draft.start === start ? 'selected' : ''}" aria-pressed="${draft.start === start}" data-action="slot" data-id="${start}"><strong>${time(start)}</strong><small>Finish ${time(start + q.minutes)}</small></button>`).join('')}</div>
  ${available.length ? `<div class="timing">${icon('shield')}Only slots that fit your whole visit are shown.</div>` : `<div class="notice warning">${icon('clock')}<span>${q.block + BUFFER > 240 ? 'This combination plus travel needs more than Joe’s four-hour work window. Remove a service or request an assessment to split the work.' : 'No time fits your visit on this date. Try another Thursday or adjust your services.'}</span></div>`}
  ${draft.start !== null ? `<div class="notice">${icon('check')}<span>Your services: ${time(draft.start)}–${time(draft.start + q.minutes)}.<br>Calendar protected until ${time(draft.start + q.block)} with the buffer.</span></div>` : ''}
  ${draft.services.includes('gutters') && draft.date > '2026-10-31' ? '<div class="notice warning">October’s gutter offer has ended for this visit date. Your total now shows the regular gutter price.</div>' : ''}</section>
  <section class="panel"><div class="panel-title">${icon('user')}<h3>Who should Joe expect?</h3></div><p>Sample details are filled in for Mary. Use fictional information in this demo.</p><div class="fields"><div class="field wide"><label for="name">Name</label><input id="name" autocomplete="off" data-field="name" value="${esc(draft.name)}" maxlength="80"></div><div class="field"><label for="email">Email</label><input id="email" autocomplete="off" type="email" data-field="email" value="${esc(draft.email)}" maxlength="120"></div><div class="field"><label for="phone">Phone</label><input id="phone" autocomplete="off" type="tel" data-field="phone" value="${esc(draft.phone)}" maxlength="30"></div><div class="field wide"><label for="notes">Anything Joe should know? <span class="hint">Optional</span></label><textarea id="notes" data-field="notes" maxlength="500">${esc(draft.notes)}</textarea></div></div></section>`;
}
function review() {
  const q = quote(draft);
  return `<section class="panel"><div class="panel-title">${icon('check')}<h3>One last look. Then you’re all set.</h3></div><p>Your total and appointment are shown below. Nothing is charged in this demo.</p>
  <div class="review-row">${icon('pin')}<span><strong>${esc(draft.property)}</strong><small>${AREAS[draft.area].name} · ${q.miles} miles from Joe’s business</small></span><button class="text-btn" data-action="edit" data-id="0">Edit</button></div>
  <div class="review-row">${icon('calendar')}<span><strong>${dateLabel(draft.date)} · ${time(draft.start)}</strong><small>Services finish at ${time(draft.start + q.minutes)} · Eastern Time<br>${BUFFER}-minute travel/setup buffer included in the calendar.</small></span><button class="text-btn" data-action="edit" data-id="1">Edit</button></div>
  <div class="review-row">${icon('bag')}<span>${q.lines.map(l => `<strong style="display:block">${l.name}<small>${esc(l.details)} · ${duration(l.minutes)}</small></strong>`).join('')}</span><button class="text-btn" data-action="edit" data-id="0">Edit</button></div>
  <div class="review-row">${icon('user')}<span><strong>${esc(draft.name)}</strong><small>${esc(draft.email)}<br>${esc(draft.phone)}</small>${draft.notes ? `<small>Note: ${esc(draft.notes)}</small>` : ''}</span><button class="text-btn" data-action="edit" data-id="1">Edit</button></div></section>
  <div class="notice">${icon('shield')}<span><strong>No surprises on arrival.</strong><br>This price covers the scope you selected. Any extra work requires your approval. Tax is assumed $0 in this illustrative demo.</span></div><div class="notice">${icon('calendar')}<span>Manage or reschedule your demo booking from My bookings. Real cancellation and weather policies would be set by Joe before launch.</span></div>`;
}
function bill(q, withAction = false) {
  const unavailable = !q.serviceable || q.assessment || !q.lines.length;
  return `<aside class="summary"><section class="panel"><div class="summary-heading"><h3>Your visit, at a glance</h3>${icon('receipt')}</div>
  ${q.lines.map(l => `<div class="bill-line"><span>${l.name}<small>${esc(l.details)}</small></span><strong>${money(l.amount)}</strong></div>`).join('')}
  ${q.discount ? `<div class="bill-line discount"><span>October gutter special<small>10% off gutters only</small></span><strong>−${money(q.discount)}</strong></div>` : ''}
  <div class="bill-line"><span>Travel · once per visit<small>${q.miles === null ? 'Outside service area' : `${q.miles} mi × 2 (round trip) × $4`}</small></span><strong>${q.miles === null ? '—' : money(q.travel)}</strong></div>
  <div class="bill-line"><span>Illustrative tax</span><strong>$0</strong></div><div class="bill-total"><span>${unavailable ? 'Assessment needed' : 'Your total'}</span><strong aria-live="polite">${unavailable ? '—' : money(q.total)}</strong></div>
  <div class="summary-detail">${icon('clock')}<span>${duration(q.minutes)} of service<br>+ ${BUFFER} min travel & setup<br>${draft.start !== null ? `${dateLabel(draft.date)} · ${time(draft.start)}` : 'One visit. One travel charge.'}</span></div>
  ${!q.serviceable ? '<div class="error">This property is outside Joe’s service area. Choose a supported demo zone.</div>' : ''}${q.assessment ? '<div class="error">Three-story homes need a safety and scope assessment. Instant booking is unavailable.</div>' : ''}
  ${error ? `<div class="error" role="alert">${esc(error)}</div>` : ''}
  ${withAction ? `<button class="btn full" data-action="next"${unavailable || stage === 1 && draft.start === null ? ' disabled' : ''}>${stage === 0 ? 'Find a time' : stage === 1 ? 'Review my visit' : 'Confirm demo booking'} ${icon(stage === 2 ? 'check' : 'arrow')}</button>${stage > 0 ? '<button class="text-btn" style="margin-top:9px" data-action="previous">← Back a step</button>' : ''}<div class="summary-foot">${stage === 2 ? 'Creates a demo booking in this browser.<br>No card needed. No message is sent.' : 'A clear price, before you commit.<br>Sample dates and fictional properties.'}</div>` : ''}</section></aside>`;
}
function booking() { return `<button class="text-btn back-btn" data-action="${stage ? 'previous' : 'home'}">${icon('back')}${stage ? 'Back a step' : 'Back to services'}</button><div class="eyebrow">A BETTER YARD. A SIMPLER DAY.</div><h1>${['Let’s plan your visit.', 'Find your Thursday.', 'Good to go?'][stage]}</h1>${stepper()}<div class="booking-layout"><div>${stage === 0 ? scope() : stage === 1 ? scheduling() : review()}</div>${bill(quote(draft), true)}</div><div class="mobile-book-strip"><span><small>Your visit total</small><strong>${money(quote(draft).total)}</strong></span><button class="btn" data-action="next"${!quote(draft).serviceable || quote(draft).assessment || stage === 1 && draft.start === null ? ' disabled' : ''}>${stage === 2 ? 'Confirm demo booking' : 'Continue'} ${icon('arrow')}</button></div>`; }
function bookingDetails(b) { return `<div class="review-row">${icon('calendar')}<span><strong>${dateLabel(b.draft.date)} · ${time(b.draft.start)}–${time(b.draft.start + b.minutes)}</strong><small>Eastern Time · ${duration(b.minutes)} of service</small></span></div><div class="review-row">${icon('pin')}<span>${esc(b.draft.property)}<small>${AREAS[b.draft.area]?.name || 'Demo area'}</small></span></div><div class="review-row">${icon('bag')}<span>${b.lines.map(l => `<span style="display:block">${esc(l.name)} <small>${esc(l.details)}</small></span>`).join('')}</span></div><div class="bill-total"><span>Confirmed demo price</span><strong>${money(b.total)}</strong></div>`; }
function confirmation() {
  const b = bookings.find(b => b.id === currentId);
  if (!b) return myBookings();
  return `<div class="confirmation"><div class="success"><div class="success-icon">${icon('check')}</div><div class="eyebrow">ONE LESS THING ON YOUR LIST</div><h1>You’re booked. Joe’s ready.</h1><p>Your whole visit is on the calendar.<br>Demo confirmation <strong>${esc(b.id)}</strong></p></div><section class="panel">${bookingDetails(b)}<div class="btn-row"><button class="btn" data-action="bookings">View my bookings ${icon('arrow')}</button><button class="btn secondary" data-action="ics" data-id="${esc(b.id)}">${icon('download')}Add to calendar</button></div></section><section class="panel recovery"><h3>New phone? Keep your booking with you.</h3><p style="margin-top:8px">Create a portable demo link, then open it in another browser. It carries the sample booking; production would use a server-backed secure link.</p><button class="text-btn" data-action="share-booking" data-id="${esc(b.id)}">${icon('link')}Get demo booking link</button></section><button class="text-btn" data-action="owner">See what Joe sees ${icon('arrow')}</button></div>`;
}
function myBookings() {
  return `<div class="intro-row"><div><div class="eyebrow">EVERYTHING, IN ONE LITTLE PLACE</div><h1>Your outdoors, organized.</h1><p>Upcoming visits, easy changes, and a shortcut to next season.</p></div><button class="btn secondary small" data-action="home">${icon('plus')}New visit</button></div>
  ${!storageAvailable ? '<div class="notice warning">Browser storage is unavailable. Keep a demo booking link before closing this page.</div>' : ''}
  ${bookings.length ? bookings.slice().sort((a,b) => (a.draft.date + a.draft.start).localeCompare(b.draft.date + b.draft.start)).map(b => `<article class="booking-card"><div class="booking-card-top"><div><div class="eyebrow">${esc(b.id)}</div><h3>${b.lines.map(l => esc(l.name)).join(' + ')}</h3></div><span class="tag ${b.status === 'cancelled' ? 'orange' : ''}">${icon(b.status === 'completed' ? 'check' : 'calendar')}${esc(b.status === 'confirmed' ? 'Confirmed' : b.status)}</span></div><div class="meta">${dateLabel(b.draft.date)} · ${time(b.draft.start)}–${time(b.draft.start + b.minutes)} · Eastern Time<br>${esc(b.draft.property)} · ${AREAS[b.draft.area]?.name} · <strong>${money(b.total)}</strong></div><div class="btn-row">${b.status === 'confirmed' && !b.pendingChange ? `<button class="btn small secondary" data-action="reschedule" data-id="${esc(b.id)}">${icon('calendar')}Reschedule</button><button class="text-btn" data-action="cancel" data-id="${esc(b.id)}">Cancel visit</button>` : ''}<button class="text-btn" data-action="rebook" data-id="${esc(b.id)}">${icon('repeat')}Book again</button><button class="text-btn" data-action="share-booking" data-id="${esc(b.id)}">${icon('link')}Demo link</button></div>${customerWeatherCard(b, icon, esc)}${b.status === 'confirmed' && !b.draft.accessConfirmed ? `<div class="notice warning">${icon('pin')}<span>Joe needs to know how to access the work area.</span><button class="text-btn" data-action="customer-access" data-id="${esc(b.id)}">Confirm access</button></div>` : ''}</article>`).join('') : `<section class="panel empty">${icon('calendar')}<h2>A little care is on the horizon.</h2><p>You haven’t booked a demo visit yet.<br>Start with a fall cleanup or bring a booking link from another browser.</p><button class="btn" data-action="home">Find a service ${icon('arrow')}</button></section>`}
  <section class="panel recovery" style="margin-top:24px"><div class="panel-title">${icon('link')}<h3>Have a demo booking link?</h3></div><p>Paste a link created by this prototype to restore the sample booking here. Real email verification and recovery need a backend.</p><div class="field" style="margin-top:14px"><label for="recover-link">Demo booking link</label><input id="recover-link" type="url" placeholder="Paste your demo booking link"></div>${error ? `<div class="error" role="alert">${esc(error)}</div>` : ''}<button class="text-btn" data-action="recover">Restore sample booking ${icon('arrow')}</button></section>`;
}
function owner() { return `${error ? `<div class="error" role="alert">${esc(error)}</div>` : ""}${providerDay({ bookings, date: ownerDate, packed, blockedDates, icon, esc })}`; }

function dialogContent() {
  let content = '';
  const b = bookings.find(b => b.id === dialog.id);
  if (dialog.type === 'rain') {
    content = weatherReview({ plan: dialog.plan, bookings, icon, esc });
  } else if (dialog.type === 'route' && b) {
    const visits = bookings.filter(item => item.status !== 'cancelled' && item.draft.date === b.draft.date).sort((a,c) => a.draft.start - c.draft.start);
    const index = visits.findIndex(item => item.id === b.id), origin = index > 0 ? visits[index - 1].draft.property : 'Joe’s demo base · East Providence';
    content = `<h2 id="dialog-title">Your next stop, clearly laid out.</h2><div class="route-stop"><small>FROM</small><strong>${esc(origin)}</strong></div><div class="route-leg">${icon('car')} ${BUFFER}-minute illustrative drive · leave at ${time(b.draft.start - BUFFER)}</div><div class="route-stop"><small>TO · ARRIVE ${time(b.draft.start)}</small><strong>${esc(b.draft.property)}</strong></div><div class="notice">${icon('pin')}<span><b>Access:</b> ${esc(b.draft.access || b.draft.notes || 'Needs confirmation')}<br><b>Parking:</b> ${esc(b.draft.parking || 'Not specified')}</span></div><p style="margin-top:16px">Fictional route preview. No live maps or traffic calculation are connected.</p>`;
  } else if (dialog.type === 'access' && b) {
    content = `<h2 id="dialog-title">Customer demo: confirm access.</h2><p>Replying as ${esc(b.draft.name)}. This sample answer will appear in Joe’s job details. No real message is sent.</p><div class="field"><label for="access-answer">How can Joe get to the work area?</label><textarea id="access-answer" maxlength="300">${esc(b.draft.accessConfirmed ? b.draft.access : 'The rear gate will be unlocked. Park by the front path; please latch the gate afterward.')}</textarea></div><button class="btn full" style="margin-top:18px" data-action="save-access" data-id="${esc(b.id)}">Save customer demo answer</button>`;
  } else if (dialog.type === 'complete' && b) {
    content = `<h2 id="dialog-title">Good work. Remember it for next time.</h2><p>Record the actual service time so Joe’s property history can be useful for the next visit.</p><div class="field"><label for="actual-minutes">Actual service time · minutes</label><input id="actual-minutes" type="number" min="1" max="600" step="1" value="${b.minutes}"></div><button class="btn full" style="margin-top:18px" data-action="save-complete" data-id="${esc(b.id)}">Complete & save property history</button>`;
  } else if (dialog.type === 'share' && b) {
    const link = portableLink(b);
    content = `<h2 id="dialog-title">Keep your demo booking.</h2><p>Anyone with this link can read its sample booking details. Use fictional information only. This is a portable demo snapshot, not a live, authenticated booking.</p><div class="field"><label for="share-link">Portable demo link</label><textarea id="share-link" rows="4" readonly>${esc(link)}</textarea></div><div class="notice warning">Changes made after creating this link won’t update copies opened elsewhere.</div><button class="btn full" style="margin-top:17px" data-action="copy-link">${icon('link')}Copy demo link</button><p id="copy-status" role="status" style="margin-top:10px"></p>`;
  } else if (dialog.type === 'reschedule' && b) {
    const proposed = { ...b.draft, date: dialog.date }, q = quote(proposed), available = slots(proposed, bookings, b.id);
    content = `<h2 id="dialog-title">Find a fresh Thursday.</h2><p>Move this visit to a time that fits. The price recalculates for the new service date.</p><div class="field"><label for="move-date">New date</label><select id="move-date" data-field="moveDate">${DEMO_DATES.map(d => `<option value="${d}"${selected(d === dialog.date)}>${dateLabel(d)}</option>`).join('')}</select></div><div class="field"><label for="move-time">Available start time · Eastern Time</label><select id="move-time" data-field="moveTime"><option value="">Choose a time</option>${available.map(t => `<option value="${t}"${selected(t === dialog.start)}>${time(t)} · finish ${time(t + q.minutes)}</option>`).join('')}</select></div>${!available.length ? '<div class="notice warning">No time fits this visit on this date. Try another Thursday.</div>' : ''}<div class="bill-total"><span>Updated demo total</span><strong>${money(q.total)}</strong></div>${q.total !== b.total ? '<div class="notice warning">Your discount changes with the service date. Confirming accepts the updated demo price.</div>' : ''}${error ? `<div class="error" role="alert">${esc(error)}</div>` : ''}<button class="btn full" data-action="save-reschedule"${dialog.start === null ? ' disabled' : ''}>Confirm new demo appointment</button><p style="margin-top:12px">Live customer approval and weather notifications require a backend. No messages are sent here.</p>`;
  } else if (dialog.type === 'cancel' && b) {
    content = `<h2 id="dialog-title">Cancel this demo visit?</h2><p>${dateLabel(b.draft.date)} at ${time(b.draft.start)}. This releases its local calendar slot. No payment or message is involved.</p><div class="btn-row"><button class="btn secondary" data-action="close-dialog">Keep my visit</button><button class="btn" data-action="confirm-cancel" data-id="${esc(b.id)}">Cancel demo visit</button></div>`;
  } else if (dialog.type === 'contact') {
    content = '<h2 id="dialog-title">A real person, when you need one.</h2><p>Joe’s Landscaping · East Providence, RI<br>Demo phone: 401-555-0142<br>Thursdays, 1–5 PM</p><div class="notice">This is a fictional business contact. No call is placed from this prototype.</div>';
  }
  return `<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-head"><span class="eyebrow">JOE’S LANDSCAPING</span><button class="icon-btn" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div>${content}${error && dialog.type !== 'reschedule' ? `<div class="error" role="alert">${esc(error)}</div>` : ''}</section></div>`;
}
function render() {
  const focused = document.activeElement?.id;
  app.innerHTML = shell(view === 'home' ? home() : view === 'repeat' ? repeatExperience({ bookings, propertyId: repeatPropertyId, icon, esc }) : view === 'book' ? booking() : view === 'confirmation' ? confirmation() : view === 'owner' ? owner() : myBookings());
  if (focusMain) { document.querySelector('#main').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); focusMain = false; }
  else if (focused) document.getElementById(focused)?.focus({preventScroll:true});
}
function openDialog(value) { dialog = value; error = ''; render(); document.querySelector('.dialog button')?.focus(); }
function encode(value) { const bytes = new TextEncoder().encode(JSON.stringify(value)); return btoa(Array.from(bytes, b => String.fromCharCode(b)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/, ''); }
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
  if (['home','bookings','owner'].includes(action)) return navigate(action);
  if (action === 'service') return startBooking(id);
  if (action === 'fall-bundle') { startBooking(); draft.services = ['leaves','gutters']; render(); return; }
  if (action === 'rebook-default') return navigate('repeat');
  if (action === 'repeat-same') return startRepeat(false);
  if (action === 'repeat-edit') return startRepeat(true);
  if (action === 'rebook') return startBooking('leaves', bookings.find(b=>b.id===id)?.draft);
  if (action === 'size') { draft.size = id; draft.start = null; error = ''; render(); announce(`Price updated to ${money(quote(draft).total)}`); }
  if (action === 'date') { draft.date=id; draft.start=null; error=''; render(); }
  if (action === 'slot') { draft.start=Number(id); error=''; render(); }
  if (action === 'edit') { stage=Number(id); error=''; focusMain=true; render(); }
  if (action === 'previous') { stage=Math.max(0,stage-1);error='';focusMain=true;render(); }
  if (action === 'next') {
    error='';
    if (stage === 0) { stage=1; focusMain=true; render(); return; }
    const validation=validBooking(draft,bookings);
    if (validation) { error=validation; render(); return; }
    if (stage===1) { stage=2;focusMain=true;render();return; }
    const bytes=crypto.getRandomValues(new Uint8Array(4));
    const b={id:`JHQ-${Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('').toUpperCase()}`,draft:structuredClone(draft),...quote(draft),status:'confirmed'};
    bookings.push(b); persist(); currentId=b.id;ownerDate=b.draft.date;navigate('confirmation');announce('Your demo booking is confirmed.');
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
    if (b) { b.draft.access = answer; b.draft.accessConfirmed = true; if (b.pendingChange) { b.pendingChange.draft.access = answer; b.pendingChange.draft.accessConfirmed = true; } persist(); }
    dialog = null; render(); announce('Customer demo access details confirmed.');
  }
  if (action === 'pack-all') {
    const list = packingList(bookings, ownerDate);
    [...list.tools, ...list.materials.map(item => `${item.name}:${item.quantity}`)].forEach(item => { packed[`${ownerDate}:${item}`] = true; });
    persistOperations(); render(); announce('Demo vehicle checklist marked packed.');
  }
  if (action === 'save-complete') {
    const b = bookings.find(item => item.id === id), actual = Number(document.querySelector('#actual-minutes').value);
    if (!Number.isInteger(actual) || actual < 1 || actual > 600) { error = 'Enter a whole number of minutes between 1 and 600.'; render(); return; }
    if (b && !b.pendingChange && !blockedDates.includes(b.draft.date)) { b.status = 'completed'; b.actualMinutes = actual; persist(); }
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
  if (action==='close-dialog') { dialog=null;error='';render(); }
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
document.addEventListener('change', event => {
  const el=event.target;
  if (el.dataset.pack) { packed[`${ownerDate}:${el.dataset.pack}`] = el.checked; persistOperations(); render(); return; }
  if (el.dataset.service) { const id=el.dataset.service; draft.services=el.checked?[...new Set([...draft.services,id])]:draft.services.filter(s=>s!==id);draft.start=null;error='';render();announce(`Price updated to ${money(quote(draft).total)}`);return; }
  const field=el.dataset.field;if(!field)return;
  if(field==='repeatProperty'){repeatPropertyId=el.value;render();return;}
  if(field==='ownerDate'){ownerDate=el.value;render();return;}
  if(field==='moveDate'){dialog.date=el.value;dialog.start=null;error='';render();return;}
  if(field==='moveTime'){dialog.start=el.value===''?null:Number(el.value);render();return;}
  draft[field]=el.type==='checkbox'?el.checked:field==='stories'?Number(el.value):el.value;
  if(['name','email','phone','notes','property','access','parking'].includes(field))return;
  if(['area','haul','stories'].includes(field))draft.start=null;
  error='';render();
});
document.addEventListener('keydown', event => {
  if(!dialog)return;
  if(event.key==='Escape'){dialog=null;error='';render();return;}
  if(event.key==='Tab'){
    const items=[...document.querySelectorAll('.dialog button:not(:disabled),.dialog input,.dialog select,.dialog textarea')];
    const first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
// A second tab may reserve a time while this tab is reviewing. Reload local state before confirmation.
window.addEventListener('storage', event => {
  if (event.key === 'business-hq-operations-v2') {
    try { const next = JSON.parse(event.newValue || '{}'); packed = next.packed && typeof next.packed === 'object' ? next.packed : {}; blockedDates = Array.isArray(next.blockedDates) ? next.blockedDates.filter(d => DEMO_DATES.includes(d)) : []; render(); }
    catch { announce('Could not refresh demo preparation details.'); }
  } else if(event.key === STORE) {
    try { const next = JSON.parse(event.newValue || '[]'); if (Array.isArray(next)) bookings = next; render(); }
    catch { announce('Could not refresh demo bookings.'); }
  }
});
render();
if(location.hash.startsWith('#demo-booking='))recoverLink(location.href);
