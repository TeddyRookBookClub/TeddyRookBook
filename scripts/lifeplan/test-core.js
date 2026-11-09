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
eq(C.freqText({ k: 'dates', dates: ['2027-01-01', '2027-01-02'] }), 'On 2 set days', 'freq text dates');

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


// ---- the resolution builder: every goal finishes by the plan's last day, on the chosen days, around days off
const RS = require(path.join(__dirname, '../../static/life-planner/lp-resolve.js'));
const DR = {
  bible: { '73': Array.from({ length: 365 }, (_, i) => ['Genesis ' + (i + 1), 16]), '66': Array.from({ length: 365 }, (_, i) => ['G' + (i + 1), 14]) },
  gb: { days: Array.from({ length: 365 }, (_, i) => i % 7 === 6 ? ['review', '', '/g/', 8, []] : [i % 2 ? 'b' : 'a', 'Rung ' + (i >> 1), '/g/' + (i >> 1) + '/', 10, ['gb.' + (i >> 1)]]) },
  lad: { math: { order: ['g3', 'g4'], c: { g3: { t: 'Grade 3', u: '/math/g3/', ts: Array.from({ length: 120 }, (_, i) => ['g3.t' + i, 'Topic ' + i, 't' + i]) }, g4: { t: 'Grade 4', u: '/math/g4/', ts: [['g4.a', 'A', 'a']] } } } },
  trades: { cars: { t: 'Cars', u: '/trades/cars/', ls: Array.from({ length: 15 }, (_, i) => ['Lesson ' + i, '/trades/cars/l' + i + '/', 8]) } },
  meals: { r: Object.fromEntries(Array.from({ length: 80 }, (_, i) => ['r' + i, ['Recipe ' + i, 20 + i, '/meal-prep/recipes/r' + i + '/', i % 3 ? 'dinner' : 'snack']])) },
  extra: { latin: Array.from({ length: 79 }, (_, i) => ['L' + i, '/l/' + i + '/', 35]), asl: Array.from({ length: 60 }, (_, i) => ['A' + i, 'https://x/' + i, 30]), memory: Array.from({ length: 43 }, (_, i) => ['M' + i, '/m/' + i + '/', 60]),
    lepanto: [6, 4, 4, 4, 4, 6, 7, 6, 6, 4, 4, 4, 4, 4, 6, 4, 4, 4, 6, 4, 6, 6, 4, 4, 4, 4, 4, 4, 6, 6].map((n, i) => ['Lepanto chunk ' + (i + 1), '/memory/challenges/lepanto/#c' + (i + 1), 20, n]) }
};
let nidr = 0;
const ENV = { D: DR, P: { bible: () => ({}), passed: () => false }, courses: [{ l: 'math', lt: 'Math Ladder', k: 'g3', t: 'Grade 3', n: 120, m: 70 }], trades: [{ k: 'cars', t: 'Cars', n: 15 }], colors: ['#111'],
  mk: o => Object.assign({ id: 't' + (++nidr), opt: {}, f: { k: 'daily' }, mins: 15, pref: [] }, o),
  fromLib: (c, k, x) => Object.assign({ id: 'c' + k, kind: 'chore', name: k, mins: 20, f: { k: 'weeks', n: 1 }, opt: {}, pref: [] }, x) };
const ALL = { bible: { on: true }, gb: { on: true, n: 52 }, ladder: { on: true, c: 'math|g3' }, trade: { on: true, tr: 'cars' }, cook: { on: true, n: 26 }, active: { on: true }, walk: { on: true, n: 300 },
  chores: { on: true }, memory: { on: true, n: 12 }, lepanto: { on: true, n: 5 }, latin: { on: true }, asl: { on: true }, custom: { on: true, name: 'Guitar', amount: 100, unit: 'hours', mpu: 60 } };
[[[0, 1, 2, 3, 4, 5, 6], []], [[1, 2, 3, 4, 5], [{ from: '2027-07-05', to: '2027-07-16', label: 'Trip' }]], [[1, 3, 5], [{ from: '2027-12-20', to: '2027-12-31' }]], [[6], []]].forEach(([days, off]) => {
  const dr = { goals: JSON.parse(JSON.stringify(ALL)), days, start: '2027-01-01', mins: 600, off };
  const b = RS.build(dr, ENV), st = b.state, PVr = {}, ctx = { base: '/' };
  st.tracks.forEach(t => { const pv = T.provider(t, DR, ENV.P, ctx); if (pv) PVr[t.id] = pv; });
  const Sr = C.schedule(st.plan, st.tracks, PVr), offs = C.offSet(off), tag = days.length + ' days/week' + (off.length ? ' + days off' : '');
  eq([iso(Sr.from), iso(Sr.to)], ['2027-01-01', '2027-12-31'], tag + ': 365 days from January 1');
  ok(b.sessions.every(d => days.indexOf(C.dow(d)) >= 0 && !offs[d]), tag + ': sessions are the chosen days, minus days off');
  const its = id => Sr.items[id] || [], lastOf = id => its(id)[its(id).length - 1];
  ok(st.tracks.filter(t => t.kind !== 'chore').every(t => its(t.id).every(it => days.indexOf(C.dow(it.dn)) >= 0 && !offs[it.dn])), tag + ': goal sessions only on chosen days, never on days off');
  eq(lastOf('r-bible-0').r1, 365, tag + ': the Bible ends on day 365');
  eq(lastOf('r-ladder-0').r1, 119, tag + ': the ladder course: all 120 lessons');
  eq(lastOf('r-trade-0').r1, 14, tag + ': the trade: all 15 lessons');
  eq(lastOf('r-latin-0').r1, 78, tag + ': Latin: all 79 lessons');
  eq(lastOf('r-asl-0').r1, 59, tag + ': ASL: all 60 lessons');
  eq(lastOf('r-memory-0').r1, 11, tag + ': 12 memory lists');
  eq(lastOf('r-lepanto-0').r1, 29, tag + ': Lepanto: all 30 chunks');
  ok(lastOf('r-lepanto-0').dn <= C.dnOf('2027-01-01') + Math.round(143 / 5 * 7), tag + ': Lepanto at 5 lines a week done within about 29 weeks');
  ok(its('r-lepanto-0')[0].url.indexOf('/memory/challenges/lepanto/#c1') >= 0, tag + ': Lepanto sessions link to their chunk');
  eq(its('r-cook-0').length, 26, tag + ': 26 recipes');
  ok(Math.abs(lastOf('r-custom-0').r1 - 100) < 1e-6, tag + ': custom: 100 hours');
  const walked = its('r-walk-0').reduce((s, it) => s + it.mins, 0) / RS.MPM; ok(walked >= 300, tag + ': at least 300 miles (' + Math.round(walked) + ')');
  const gbm = its('r-gb-0').reduce((s, it) => s + it.mins, 0); ok(gbm >= RS.gbFor(DR, 52).mins, tag + ': Great Books: enough minutes for 52 rungs');
  ok(st.tracks.every(t => its(t.id).every(it => it.dn <= Sr.to)), tag + ': nothing after the last day');
  if (days.length >= 2) { const Rr = T.summary(Sr, st.tracks, DR, ENV.P, Sr.from, Sr.to); ok(days.length < 3 || Rr.activity.met === Rr.activity.weeks || off.length, tag + ': Get active meets the guideline every full week'); }
});
// overload: the same goals in 30 minutes a day don't fit
{ const b = RS.build({ goals: JSON.parse(JSON.stringify(ALL)), days: [1, 2, 3, 4, 5], start: '2027-01-01', mins: 30, off: [] }, ENV); const PVr = {};
  b.state.tracks.forEach(t => { const pv = T.provider(t, DR, ENV.P, { base: '/' }); if (pv) PVr[t.id] = pv; });
  const Sr = C.schedule(b.state.plan, b.state.tracks, PVr); ok(Sr.days.filter(d => d.over && d.load).length > 100, 'twelve goals in 30 minutes a day: overloaded days flagged');
  const b2 = RS.build({ goals: { bible: { on: true } }, days: [0, 1, 2, 3, 4, 5, 6], start: '2027-01-01', mins: 30, off: [] }, ENV); const P2 = {};
  b2.state.tracks.forEach(t => { P2[t.id] = T.provider(t, DR, ENV.P, { base: '/' }); });
  ok(C.schedule(b2.state.plan, b2.state.tracks, P2).days.every(d => !d.over), 'the Bible alone in 30 minutes a day fits'); }
eq(RS.spread([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), [2, 4, 6, 8, 10], 'spread picks sessions evenly, ending on the last one');
eq(RS.range({ start: '2027-01-01', extend: 7 }).map(iso), ['2027-01-01', '2028-01-07'], 'moving the finish date adds days');
eq(T.pace(0, 2.5, 5), { i0: 0, i1: 2, fin: [0, 1], ov: [1, 1, 0.5] }, 'pace: 2.5 items a session');
eq(T.pace(1, 2.5, 5).fin, [2, 3, 4], 'pace: the second session finishes the rest');
eq(T.pace(2, 2.5, 5), null, 'pace: nothing after the end');
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
