#!/usr/bin/env node
/* Life Planner unit tests: node scripts/lifeplan/test-core.js
   Covers static/life-planner/lp-core.js (dates, frequencies, the scheduler) and lp-tracks.js (content tracks, summary). */
'use strict';
const path = require('path');
const C = require(path.join(__dirname, '../../static/life-planner/lp-core.js'));
const T = require(path.join(__dirname, '../../static/life-planner/lp-tracks.js'));
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.log('FAIL', name); } }
function eq(a, b, name) { const s = JSON.stringify(a) === JSON.stringify(b); if (!s) console.log('  got', JSON.stringify(a), 'want', JSON.stringify(b)); ok(s, name); }
const dn = C.dnOf, iso = C.isoOf;

// ---- dates
eq(iso(dn('2026-11-08')), '2026-11-08', 'iso round trip');
eq(C.dow(dn('2026-11-08')), 0, '2026-11-08 is a Sunday');
eq(iso(C.weekStart(dn('2026-11-08'))), '2026-11-02', 'weeks start on Monday');
eq(iso(C.easter(2024)), '2024-03-31', 'Easter 2024'); eq(iso(C.easter(2025)), '2025-04-20', 'Easter 2025');
eq(iso(C.easter(2026)), '2026-04-05', 'Easter 2026'); eq(iso(C.easter(2027)), '2027-03-28', 'Easter 2027');
eq(iso(C.nthDow(2026, 11, 4, 4)), '2026-11-26', 'Thanksgiving 2026'); eq(iso(C.nthDow(2027, 11, 4, 4)), '2027-11-25', 'Thanksgiving 2027');
eq(iso(C.nthDow(2027, 5, 5, 1)), '2027-05-31', 'last Monday of May 2027');

// ---- frequencies over 2027 (Jan 1 is a Friday)
const A = dn('2027-01-01'), B = dn('2027-12-31');
const ex = (f, a, b) => C.expand({ f }, a == null ? A : a, b == null ? B : b, A);
eq(ex({ k: 'daily' }).fixed.length, 365, 'daily: 365');
eq(ex({ k: 'weekdays' }).fixed.length, 261, 'weekdays: 261 in 2027');
eq(ex({ k: 'days', d: [6] }).fixed.length, 52, 'Saturdays: 52');
const t5 = ex({ k: 'times', n: 5 }).jobs;
eq(t5[0], { from: A, to: dn('2027-01-03'), n: 2, d: null }, 'partial first week (3 days): 5 a week → 2');
eq(t5.reduce((s, j) => s + j.n, 0), 2 + 51 * 5 + 4, '5 a week over 2027: 2 + 51 full weeks + 4 = 261');
eq(t5[t5.length - 1].n, Math.round(5 * 5 / 7), 'last week Mon 27 – Fri 31 (5 days) → 4');
eq(ex({ k: 'weeks', n: 1 }).jobs.length, 52, 'weekly floating: 52 jobs (the 3-day first week is skipped)');
eq(ex({ k: 'weeks', n: 2, dow: 6 }).fixed.length, 26, 'every 2 weeks on Saturday: 26');
eq(ex({ k: 'months', every: 3, on: 'flex' }).jobs.length, 4, 'every 3 months: 4');
eq(C.monthsList({ every: 3 }, A), [1, 4, 7, 10], 'every 3 months from January');
eq(C.monthsList({ every: 6 }, dn('2026-11-08')), [5, 11], 'every 6 months from November');
eq(ex({ k: 'months', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], on: { nth: 1, dow: 6 } }).fixed.map(iso).slice(0, 3), ['2027-01-02', '2027-02-06', '2027-03-06'], 'first Saturday each month');
eq(iso(ex({ k: 'months', months: [2], on: { day: 31 } }).fixed[0]), '2027-02-28', 'day 31 in February → the 28th');
eq(ex({ k: 'dates', dates: ['2027-03-01', '2026-01-01', '2027-03-01', 'x'] }).fixed.map(iso), ['2027-03-01'], 'dates: inside the range, no repeats');
eq(C.freqText({ k: 'times', n: 2 }), 'Twice a week', 'freq text');
eq(C.freqText({ k: 'months', months: [4, 10] }), 'In Apr, Oct', 'freq text months');

// ---- scheduler
const budget = [0, 60, 60, 60, 60, 60, 120]; // Sunday 0
function plan(o) { return Object.assign({ from: '2027-01-04', to: '2027-01-31', budget: budget, off: [] }, o || {}); }
let S = C.schedule(plan(), [{ id: 'a', name: 'Daily', mins: 20, f: { k: 'daily' } }, { id: 'b', name: 'Bath', mins: 30, f: { k: 'weeks', n: 1 } }]);
eq(S.items.a.length, 28, 'fixed daily: 28 days');
eq(S.items.b.length, 4, 'weekly floating: 4');
ok(S.items.b.every(it => C.dow(it.dn) === 6), 'weekly 30-min task floats to Saturday (most room)');
ok(S.days.filter(d => C.dow(d.dn) === 0).every(d => d.over), 'Sunday (0 min) with a daily task is overloaded');
// spreading: strength twice a week shouldn't land on back-to-back days
S = C.schedule(plan({ budget: [60, 60, 60, 60, 60, 60, 60] }), [{ id: 's', name: 'Strength', mins: 30, f: { k: 'times', n: 2 } }]);
ok(S.items.s.length === 8, 'twice a week for 4 weeks: 8');
let gapsOK = true; for (let i = 1; i < S.items.s.length; i++) if (S.items.s[i].dn - S.items.s[i - 1].dn < 2) gapsOK = false;
ok(gapsOK, 'twice a week: never on back-to-back days');
// preferred days
S = C.schedule(plan({ budget: [60, 60, 60, 60, 60, 60, 60] }), [{ id: 'p', name: 'Pref', mins: 30, f: { k: 'weeks', n: 1 }, pref: [3] }]);
ok(S.items.p.every(it => C.dow(it.dn) === 3), 'preferred day is used when it has room');
// overload: more flexible work than the week has room for
S = C.schedule(plan({ budget: [30, 30, 30, 30, 30, 30, 30] }), [{ id: 'x', name: 'Big', mins: 40, f: { k: 'times', n: 3 } }]);
ok(S.items.x.length === 12 && S.days.some(d => d.over) && S.weeks.every(w => w.over === (w.load > w.cap)), 'too much work: still placed, days flagged overloaded');
ok(S.weeks.every(w => !w.over), '3×40 = 120 fits in a 210-minute week: weeks not overloaded');
S = C.schedule(plan({ budget: [10, 10, 10, 10, 10, 10, 10] }), [{ id: 'x', name: 'Big', mins: 40, f: { k: 'times', n: 3 } }]);
ok(S.weeks.every(w => w.over), '3×40 in a 70-minute week: week overloaded');
// days off
S = C.schedule(plan({ off: [{ from: '2027-01-04', to: '2027-01-10', label: 'Trip' }] }), [{ id: 'a', mins: 20, f: { k: 'daily' } }, { id: 'k', mins: 5, f: { k: 'daily' }, keepOff: true }, { id: 'w', mins: 30, f: { k: 'weeks', n: 1 } }]);
eq(S.items.a.length, 21, 'days off: a fixed daily task skips them');
eq(S.items.k.length, 28, 'keepOff: stays on days off');
eq(S.items.w.length, 3, 'a floating weekly task in an all-off week is missed');
eq(S.missed.w, 1, 'missed counted');
eq(S.byDn[dn('2027-01-05')].cap, 0, 'a day off has no minutes');
// determinism
const tr = [{ id: 'a', mins: 25, f: { k: 'times', n: 5 } }, { id: 'b', mins: 30, f: { k: 'times', n: 2 } }, { id: 'c', mins: 45, f: { k: 'months', every: 1, on: 'flex' } }, { id: 'd', mins: 15, f: { k: 'daily' } }];
const P1 = { from: '2027-01-01', to: '2027-12-31', budget: [90, 60, 60, 60, 60, 60, 150], off: [] };
const s1 = C.schedule(P1, tr), s2 = C.schedule(P1, tr);
eq(s1.days.map(d => d.items.map(i => i.id).join('')), s2.days.map(d => d.items.map(i => i.id).join('')), 'same plan, same schedule');
// year totals
eq(C.minutesIn(s1, s1.from, s1.to, 'd'), 365 * 15, 'year total: daily 15 min = 5475 min');
eq(s1.items.c.length, 12, 'monthly floating: 12 in a year');
eq(s1.items.a.length, 261, '5 a week over 2027: 261');
eq(C.minutesIn(s1, s1.from, s1.to), s1.days.reduce((s, d) => s + d.load, 0), 'day loads add up to the total');
// a view slice never changes the schedule: week of Mar 1 from the year plan = the same items
const wk = dn('2027-03-01'); eq(s1.byDn[wk].items.map(i => i.id), C.schedule(P1, tr).byDn[wk].items.map(i => i.id), 'slices are stable');
// free tasks don't use the budget
S = C.schedule(plan(), [{ id: 'f', mins: 45, f: { k: 'daily' }, free: true }]);
ok(S.days.every(d => d.load === 0), 'free tasks: no load');

// ---- content tracks
const D = {
  bible: { '73': Array.from({ length: 365 }, (_, i) => ['Reading ' + (i + 1), 15]), '66': Array.from({ length: 365 }, (_, i) => ['R' + (i + 1), 14]) },
  gb: { days: [['a', 'Iliad', '/g/i/', 10, ['gb.i']], ['b', 'Iliad', '/g/i/', 10, ['gb.i']], ['one', 'Odyssey', '/g/o/', 10, ['gb.o']], ['review', '', '/g/', 10, ['gb.i', 'gb.o']]] },
  lad: { math: { order: ['c1', 'c2'], c: { c1: { t: 'Course 1', u: '/math/c1/', ts: [['t1', 'One', 'one'], ['t2', 'Two', 'two']] }, c2: { t: 'Course 2', u: '/math/c2/', ts: [['t3', 'Three', 'three']] } } } }
};
const ticks = { 3: 1, 4: 1 }, passed = { t1: true };
const Pg = { bible: () => ticks, passed: id => !!passed[id] };
const ctx = { base: '/' };
let pv = T.provider({ kind: 'bible', opt: { ver: '73', mode: 'seq', from: 364 } }, D, Pg, ctx);
eq(pv.item(0, 0).label, 'Day 364: Reading 364', 'bible seq: day from');
eq(pv.item(2, 0), null, 'bible ends after day 365');
pv = T.provider({ kind: 'bible', opt: { ver: '73', mode: 'dates', bstart: '2027-01-01' } }, D, Pg, ctx);
eq(pv.item(0, dn('2027-01-03')).ref, 3, 'bible dates: Jan 3 = day 3');
ok(pv.done({ ref: 3 }) && !pv.done({ ref: 5 }), 'bible reads the Bible in a Year ticks');
eq(pv.item(0, dn('2026-12-31')), null, 'bible dates: nothing before day 1');
pv = T.provider({ kind: 'ladder', opt: { l: 'math', c: 'c1', from: 1 } }, D, Pg, ctx);
eq([pv.item(0).label, pv.item(1).label, pv.item(2)], ['Course 1: Two', 'Course 2: Three', null], 'ladder: from topic 2, on into the next course, then ends');
ok(T.provider({ kind: 'ladder', opt: { l: 'math', c: 'c1' } }, D, Pg, ctx).done({ ref: 't1' }), 'ladder reads passed topics');
pv = T.provider({ kind: 'gb', mins: 15, opt: { from: 0 } }, D, Pg, ctx);
eq(pv.item(0).label, 'Iliad', 'gb: first 15 min');
eq(pv.item(1).label, 'Iliad · Odyssey', 'gb: minutes 15-30 span two plan days');
eq(pv.item(3).label, 'Read on in a great book you met on the ladder', 'gb: after the plan, reading time goes on');
eq(T.provider({ kind: 'gb', mins: 15, opt: { from: 0, stop: true } }, D, Pg, ctx).item(3), null, 'gb stop: ends');

// summary over a whole year with exercise
const tracks = [
  { id: 'bi', kind: 'bible', name: 'Bible', mins: 15, f: { k: 'daily' }, opt: { ver: '73', mode: 'seq', from: 1 } },
  { id: 'w', kind: 'exercise', type: 'moderate', name: 'Walk', mins: 30, f: { k: 'times', n: 5 } },
  { id: 's', kind: 'exercise', type: 'strength', name: 'Strength', mins: 30, f: { k: 'times', n: 2 } },
  { id: 'f', kind: 'chore', name: 'Filter', mins: 10, f: { k: 'months', every: 3, on: 'flex' } }
];
const PY = { from: '2027-01-04', to: '2028-01-03', budget: [150, 120, 120, 120, 120, 120, 150], off: [] };
const PV = { bi: T.provider(tracks[0], D, Pg, ctx) };
S = C.schedule(PY, tracks, PV);
const R = T.summary(S, tracks, D, Pg, S.from, S.to);
eq(R.per[0].text[0], 'The whole Bible: all 365 days', 'summary: the whole Bible in a 365-day plan');
eq(R.per[3].text[0], '4 × Filter (0.7 hours)', 'summary: 4 filter changes');
eq(R.activity, { weeks: 52, met: 52, aer: 52, str: 52 }, 'activity guideline met every full week');
ok(Math.abs(R.mins / R.weeks - (15 * 7 + 150 + 60 + 40 / 52)) < 3, 'average minutes a week');
// holidays
const hol = T.holidayDates('thanksgiving', dn('2026-11-01'), dn('2027-12-31'));
eq(hol.filter(h => h.part === 2).map(h => iso(h.dn)), ['2026-11-26', '2027-11-25'], 'Thanksgiving cooking days');
eq(iso(hol[0].dn), '2026-11-12', 'plan the menu two weeks ahead');
eq(T.holidayDates('hanukkah', dn('2026-11-01'), dn('2027-01-31'), { hanukkah: ['2026-12-04'] }).map(h => iso(h.dn)), ['2026-11-20', '2026-12-02', '2026-12-04'], 'Hanukkah from the collection table');
// meals: recipes from the Meal Planner's state
const md = T.mealDays({ plans: [{ start: '2027-01-04', days: 7, cells: { '0|dinner': [{ r: 'r1' }], '1|lunch': [{ r: 'r1' }], '2|dinner': [{ r: 'r1' }, { r: 'r2' }] } }] }, 'dinner', { r: { r1: ['Soup', 40, '/meal-prep/recipes/r1/'], r2: ['Bread', 30, '/x/'] } });
eq([md[dn('2027-01-04')].names, md[dn('2027-01-06')].mins, md[dn('2027-01-05')]], [['Soup'], 70, undefined], 'meal planner recipes and minutes by date');

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
