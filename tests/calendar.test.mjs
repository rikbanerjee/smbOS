import test from 'node:test';
import assert from 'node:assert/strict';
import {weekDates,monthDates,shiftPeriod,periodData} from '../calendar.js';
import {sampleDay} from '../operations.js?v=combined-11';

test('weekly dates cross month and daylight-saving boundaries without shifting days',()=>{
 assert.deepEqual(weekDates('2026-11-01'),['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01']);
 assert.equal(weekDates('2026-11-02')[0],'2026-11-02');
});
test('month grids start Monday and include the entire month with complete weeks',()=>{
 const days=monthDates('2026-11-30');assert.equal(days[0],'2026-10-26');assert.equal(days.at(-1),'2026-12-06');assert.equal(days.length,42);
 const feb=monthDates('2028-02-10');assert.ok(feb.includes('2028-02-29'));assert.equal(feb.length%7,0);
});
test('period movement handles year changes and long-to-short months',()=>{
 assert.equal(shiftPeriod('2026-12-31','month',1),'2027-01-01');assert.equal(shiftPeriod('2026-03-31','month',-1),'2026-02-01');assert.equal(shiftPeriod('2026-10-29','week',1),'2026-11-05');
});
test('weekly preparation sums material quantities and deduplicates tools',()=>{
 const jobs=sampleDay();const extra=structuredClone(jobs[0]);extra.id='ANOTHER';extra.draft.start=900;extra.draft.size='large';jobs.push(extra);
 const week=periodData(jobs,'2026-10-29','week');assert.equal(week.materials[0].quantity,22);assert.equal(week.tools.filter(t=>t==='Leaf blower').length,1);
});
test('completed jobs remain in calendar history but not remaining preparation; cancelled jobs are omitted',()=>{
 const jobs=sampleDay();jobs[0].status='completed';jobs[1].status='cancelled';const d=periodData(jobs,'2026-10-29','week');assert.equal(d.visits.length,1);assert.equal(d.remaining,0);assert.deepEqual(d.tools,[]);assert.deepEqual(d.materials,[]);
});
test('pending holds are separate from confirmed visits and do not contribute to preparation',()=>{
 const jobs=sampleDay();jobs[0].pendingChange={status:'awaiting_customer',draft:{...jobs[0].draft,date:'2026-11-05'}};
 const d=periodData(jobs,'2026-11-05','week');assert.equal(d.visits.length,0);assert.equal(d.holds.length,1);assert.deepEqual(d.tools,[]);assert.equal(jobs[0].draft.date,'2026-10-29');
});
