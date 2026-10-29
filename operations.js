import { BUFFER, DEMO_DATES, defaultDraft, quote, slots, validBooking } from './model.js?v=owner-simple-4';

export const DEMO_CLOCK = 780; // Deliberate sample clock: 1 PM on the selected workday.
export const PROPERTIES = [
  {
    id: 'mary-home', label: 'Mary’s home', address: '12 Maple Lane (fictional)', area: 'east',
    size: 'medium', stories: 1, access: 'Use the side gate. Please close it afterward.',
    parking: 'Left side of the driveway', accessConfirmed: true,
    lastVisit: { date: '2025-11-06', services: ['leaves'], haul: false, minutes: 135, size: 'medium' },
    propertyAllowance: true,
  },
  {
    id: 'mary-rental', label: 'Mary’s rental', address: '8 Garden Court (fictional)', area: 'riverside',
    size: 'small', stories: 1, access: 'Front yard only. Tenant keeps the rear gate locked.',
    parking: 'Street parking outside the front entrance', accessConfirmed: true,
    lastVisit: { date: '2026-09-24', services: ['mowing'], haul: false, minutes: 45, size: 'small' },
    propertyAllowance: false,
  },
];

export function propertyHistory(property, bookings = []) {
  const completed = bookings.filter(b => b.status === 'completed' && b.draft.propertyId === property.id)
    .sort((a, b) => b.draft.date.localeCompare(a.draft.date));
  if (!completed.length) return property.lastVisit;
  const b = completed[0];
  return { date: b.draft.date, services: [...b.draft.services], haul: b.draft.haul, size: b.draft.size, stories: b.draft.stories, minutes: b.actualMinutes ?? b.minutes, access: b.draft.access, parking: b.draft.parking, accessConfirmed: b.draft.accessConfirmed, property: b.draft.property, area: b.draft.area };
}

export function repeatDraft(property, bookings = []) {
  const previous = propertyHistory(property, bookings);
  return {
    ...defaultDraft(), services: [...previous.services], size: previous.size,
    haul: previous.haul, stories: previous.stories ?? property.stories, area: previous.area ?? property.area,
    property: previous.property ?? property.address, propertyId: property.id, parking: previous.parking ?? property.parking,
    access: previous.access ?? property.access, accessConfirmed: previous.accessConfirmed ?? property.accessConfirmed,
    propertyAllowance: property.propertyAllowance, scopeConfirmed: true,
    notes: previous.access ?? property.access,
  };
}

export function packingList(bookings, date) {
  const active = bookings.filter(b => b.status === 'confirmed' && b.draft.date === date);
  const tools = [...new Set(active.flatMap(b => b.tools))];
  const bags = active.reduce((sum, b) => sum + (b.draft.services.includes('leaves') ? { small: 6, medium: 10, large: 16 }[b.draft.size] ?? 10 : 0), 0);
  return { tools: bags ? tools.filter(tool => tool !== 'Leaf bags') : tools, materials: bags ? [{ name: 'Leaf bags', quantity: bags, unit: 'bags', note: 'Illustrative service rule; Joe confirms quantity.' }] : [] };
}

export function readiness(booking) {
  const issues = [];
  if (!booking.draft.accessConfirmed) issues.push('Confirm property access');
  if (booking.pendingChange?.status === 'awaiting_customer') issues.push('Customer must confirm weather change');
  if (booking.changeDeclined) issues.push('Customer declined the new time; arrange another option');
  return { ready: issues.length === 0, issues };
}

export function dayPlan(bookings, date, now = DEMO_CLOCK) {
  const visits = bookings.filter(b => b.status !== 'cancelled' && b.draft.date === date)
    .sort((a, b) => a.draft.start - b.draft.start);
  const next = visits.find(b => b.status === 'confirmed') ?? null;
  return {
    visits, next,
    holds: bookings.filter(b => b.status === 'confirmed' && b.pendingChange?.status === 'awaiting_customer' && b.pendingChange.draft.date === date),
    depart: next ? next.draft.start - BUFFER : null,
    departureLabel: next ? (next.draft.start - BUFFER <= now ? 'Departure time reached' : `Depart in ${next.draft.start - BUFFER - now} minutes`) : 'No remaining visits',
    attention: visits.filter(b => b.status === 'confirmed').flatMap(b => readiness(b).issues.map(issue => ({ id: b.id, name: b.draft.name, issue }))),
    packing: packingList(bookings, date),
  };
}

export function sampleDay(bookings = [], blockedDates = []) {
  for (const date of DEMO_DATES) {
    if (blockedDates.includes(date)) continue;
    const suffix = date.slice(5).replace('-', '');
    const mary = { ...defaultDraft(), size: 'small', propertyAllowance: false, propertyId: 'mary-home', property: PROPERTIES[0].address, access: PROPERTIES[0].access, parking: PROPERTIES[0].parking, accessConfirmed: true, date, start: 795 };
    const dave = { ...defaultDraft(), services: ['gutters'], name: 'Dave Rivera', email: 'dave@example.com', phone: '401-555-0101', property: '24 Oak Street (fictional)', propertyId: 'dave-home', date, start: 900, access: 'Rear gate access needs customer confirmation.', parking: 'Curbside by the front path', accessConfirmed: false, notes: 'Please confirm how Joe can reach the rear downspout.' };
    const first = { id: `JHQ-AA00${suffix}`, draft: mary, ...quote(mary), status: 'confirmed', demoScenario: true };
    if (bookings.some(b => b.id === first.id) || validBooking(mary, bookings)) continue;
    if (validBooking(dave, [...bookings, first])) continue;
    return [first, { id: `JHQ-BB00${suffix}`, draft: dave, ...quote(dave), status: 'confirmed', demoScenario: true }];
  }
  return [];
}

function fingerprint(b) {
  return JSON.stringify([b.id, b.status, b.draft, b.total, b.pendingChange ?? null, b.changeDeclined ?? false, b.declinedChanges ?? []]);
}

export function proposeRainPlan(bookings, date, blockedDates = []) {
  const affected = bookings.filter(b => b.status === 'confirmed' && b.draft.date === date)
    .sort((a, b) => a.draft.start - b.draft.start);
  const working = structuredClone(bookings), proposals = [], unresolved = [];
  for (const original of affected) {
    if (original.pendingChange) { unresolved.push({ id: original.id, reason: 'Already awaiting customer confirmation' }); continue; }
    let proposal = null;
    for (const newDate of DEMO_DATES.filter(d => d > date && !blockedDates.includes(d))) {
      const next = { ...original.draft, date: newDate, start: null };
      const start = slots(next, working, original.id, blockedDates).find(t => !original.declinedChanges?.some(rejected => rejected.date === newDate && rejected.start === t));
      if (start === undefined) continue;
      next.start = start;
      proposal = { id: original.id, original: fingerprint(original), draft: next, oldTotal: original.total, total: quote(next).total };
      const target = working.find(b => b.id === original.id);
      target.pendingChange = { status: 'awaiting_customer', draft: next };
      break;
    }
    if (proposal) proposals.push(proposal);
    else unresolved.push({ id: original.id, reason: 'No later sample day can fit the complete visit' });
  }
  return { sourceDate: date, proposals, unresolved };
}

export function approveRainPlan(bookings, plan, blockedDates = []) {
  const working = structuredClone(bookings);
  if (!plan.proposals.length) throw new Error('No proposed changes are ready to send.');
  for (const proposal of plan.proposals) {
    const b = working.find(b => b.id === proposal.id);
    if (!b || fingerprint(b) !== proposal.original) throw new Error('The calendar changed. Review a fresh rain plan.');
    if (validBooking(proposal.draft, working, b.id, blockedDates)) throw new Error('A proposed time is no longer available. Review a fresh rain plan.');
    b.pendingChange = { status: 'awaiting_customer', reason: 'Rain delay', draft: structuredClone(proposal.draft), oldTotal: b.total, total: quote(proposal.draft).total };
    b.changeDeclined = false;
  }
  return working;
}

export function respondToRainChange(bookings, id, accept, blockedDates = []) {
  const working = structuredClone(bookings), b = working.find(b => b.id === id);
  if (!b || b.status !== 'confirmed' || b.pendingChange?.status !== 'awaiting_customer') throw new Error('This change request is no longer pending.');
  if (accept) {
    const next = structuredClone(b.pendingChange.draft);
    const validation = validBooking(next, working, b.id, blockedDates);
    if (validation) throw new Error(validation);
    b.previousAppointments = [...(b.previousAppointments ?? []), { date: b.draft.date, start: b.draft.start, total: b.total, reason: 'Customer accepted rain change' }];
    Object.assign(b, { draft: next, ...quote(next), changeDeclined: false });
  } else {
    b.changeDeclined = true;
    b.declinedChanges = [...(b.declinedChanges ?? []), { date: b.pendingChange.draft.date, start: b.pendingChange.draft.start }];
  }
  delete b.pendingChange;
  return working;
}
