import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_DATES, defaultDraft, quote, slots, validBooking } from '../model.js?v=workflows-3';
import { PROPERTIES, propertyHistory, repeatDraft, packingList, dayPlan, readiness, sampleDay, proposeRainPlan, approveRainPlan, respondToRainChange } from '../operations.js';

test('repeat booking recalls the property and scope but recalculates current pricing', () => {
  const draft = repeatDraft(PROPERTIES[0]);
  assert.deepEqual(draft.services, ['leaves']);
  assert.equal(draft.property, PROPERTIES[0].address);
  assert.equal(draft.parking, PROPERTIES[0].parking);
  assert.equal(draft.accessConfirmed, true);
  assert.equal(quote(draft).minutes, 135);
  assert.equal(quote(draft).total, 273);
});
test('completed jobs update remembered service scope and actual time', () => {
  const completed = { ...sampleDay()[0], status: 'completed', actualMinutes: 104 };
  const history = propertyHistory(PROPERTIES[0], [completed]);
  assert.equal(history.minutes, 104);
  assert.equal(history.size, 'small');
  assert.equal(repeatDraft(PROPERTIES[0], [completed]).size, 'small');
  completed.draft.access = 'Use the newly installed side gate.';
  assert.equal(repeatDraft(PROPERTIES[0], [completed]).access, completed.draft.access);
});
test('sample working day fits working hours, first departure, inter-job travel, and return', () => {
  const visits = sampleDay();
  assert.equal(visits.length, 2);
  for (const b of visits) assert.equal(validBooking(b.draft, visits, b.id), '');
  const plan = dayPlan(visits, visits[0].draft.date);
  assert.equal(plan.depart, 780);
  assert.equal(plan.next.draft.name, 'Mary Thompson');
  assert.equal(plan.attention.length, 1);
  assert.equal(plan.attention[0].name, 'Dave Rivera');
});
test('the next job advances after completion and preparation deduplicates tools', () => {
  const visits = sampleDay();
  visits[0].status = 'completed';
  assert.equal(dayPlan(visits, visits[0].draft.date).next.draft.name, 'Dave Rivera');
  const list = packingList(sampleDay(), sampleDay()[0].draft.date);
  assert.equal(list.materials[0].quantity, 6);
  assert.equal(list.tools.filter(item => item === 'Leaf blower').length, 1);
  assert.equal(list.tools.includes('Leaf bags'), false);
});
test('slots include first and final travel and reject unsupported days/scopes', () => {
  const d = { ...defaultDraft(), services: ['leaves', 'gutters'] };
  assert.deepEqual(slots(d), [795]);
  assert.deepEqual(slots({ ...d, haul: true }), []);
  assert.deepEqual(slots({ ...d, date: '2026-10-30' }), []);
  assert.deepEqual(slots({ ...d, area: 'outside' }), []);
  assert.deepEqual(slots({ ...d, stories: 3 }), []);
  assert.equal(quote(d).travel, 48);
  assert.equal(quote(d).discount, 12);
});
test('rain proposals preserve original appointments and independently allocate both new jobs', () => {
  const visits = sampleDay(), originals = structuredClone(visits);
  const plan = proposeRainPlan(visits, visits[0].draft.date);
  assert.equal(plan.proposals.length, 2);
  assert.deepEqual(visits, originals);
  const pending = approveRainPlan(visits, plan);
  assert.equal(pending[0].draft.date, originals[0].draft.date);
  assert.equal(pending[0].status, 'confirmed');
  assert.equal(pending[0].pendingChange.status, 'awaiting_customer');
  assert.equal(pending[0].pendingChange.draft.date, '2026-11-05');
  assert.ok(pending[1].pendingChange.draft.start >= pending[0].pendingChange.draft.start + quote(pending[0].pendingChange.draft).block);
  assert.equal(readiness(pending[0]).ready, false);
  const proposedDay = dayPlan(pending, '2026-11-05');
  assert.equal(proposedDay.holds.length, 2);
  assert.equal(proposedDay.visits.length, 0);
  assert.equal(proposedDay.next, null);
});
test('proposed holds block other customers, while the rain day can be paused', () => {
  const visits = sampleDay(), plan = proposeRainPlan(visits, visits[0].draft.date);
  const pending = approveRainPlan(visits, plan);
  const probe = { ...pending[0].pendingChange.draft };
  assert.ok(!slots(probe, pending).includes(probe.start));
  assert.deepEqual(slots(defaultDraft(), pending, null, ['2026-10-29']), []);
});
test('customer acceptance updates the slot and explicit price, then releases the original', () => {
  const visits = sampleDay(), plan = proposeRainPlan(visits, visits[0].draft.date);
  const pending = approveRainPlan(visits, plan);
  const gutter = pending[1];
  assert.equal(gutter.total, 156);
  assert.equal(gutter.pendingChange.total, 168);
  const accepted = respondToRainChange(pending, gutter.id, true);
  const changed = accepted.find(b => b.id === gutter.id);
  assert.equal(changed.draft.date, '2026-11-05');
  assert.equal(changed.total, 168);
  assert.equal(changed.pendingChange, undefined);
  assert.equal(changed.previousAppointments[0].date, '2026-10-29');
  assert.ok(slots(gutter.draft, accepted).includes(gutter.draft.start));
});
test('declining retains the original confirmed job and releases only the proposed hold', () => {
  const visits = sampleDay(), pending = approveRainPlan(visits, proposeRainPlan(visits, visits[0].draft.date));
  const first = pending[0], declined = respondToRainChange(pending, first.id, false), b = declined[0];
  assert.equal(b.draft.date, first.draft.date);
  assert.equal(b.status, 'confirmed');
  assert.equal(b.changeDeclined, true);
  assert.equal(b.pendingChange, undefined);
  assert.ok(slots(first.pendingChange.draft, declined).includes(first.pendingChange.draft.start));
});
test('stale approval and double acceptance are rejected without mutating the input', () => {
  const visits = sampleDay(), plan = proposeRainPlan(visits, visits[0].draft.date);
  const changed = structuredClone(visits); changed[0].status = 'cancelled';
  assert.throws(() => approveRainPlan(changed, plan), /calendar changed/);
  const pending = approveRainPlan(visits, plan), accepted = respondToRainChange(pending, visits[0].id, true);
  assert.throws(() => respondToRainChange(accepted, visits[0].id, true), /no longer pending/);
  assert.equal(visits[0].pendingChange, undefined);
});
test('full/blocked future calendars produce unresolved proposals rather than overbooking', () => {
  const visits = sampleDay();
  const plan = proposeRainPlan(visits, visits[0].draft.date, DEMO_DATES.slice(1));
  assert.equal(plan.proposals.length, 0);
  assert.equal(plan.unresolved.length, 2);
  assert.throws(() => approveRainPlan(visits, plan), /No proposed changes/);
  assert.equal(sampleDay(visits).some(b => visits.some(existing => b.id === existing.id)), false);
});
test('a new rain plan does not repeat the exact slot a customer already declined', () => {
  const visits = sampleDay(), firstPlan = proposeRainPlan(visits, visits[0].draft.date);
  const pending = approveRainPlan(visits, firstPlan);
  const declined = respondToRainChange(pending, visits[0].id, false);
  const nextPlan = proposeRainPlan(declined, visits[0].draft.date);
  const replacement = nextPlan.proposals.find(p => p.id === visits[0].id);
  assert.ok(replacement);
  assert.ok(replacement.draft.date !== firstPlan.proposals[0].draft.date || replacement.draft.start !== firstPlan.proposals[0].draft.start);
  assert.throws(() => approveRainPlan(declined, firstPlan), /calendar changed/);
});
