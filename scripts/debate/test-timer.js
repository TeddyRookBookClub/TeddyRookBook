#!/usr/bin/env node
/* Debate timer tests: every format in data/debate/formats/ builds a sensible round, and the clock logic
   (warnings, prep banks, overtime, moving between speeches, saving and restoring) behaves.
   Run: node scripts/debate/test-timer.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const T = require('../../static/debate/timer-core.js');

const dir = path.join(__dirname, '../../data/debate/formats');
const raw = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) raw[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
let n = 0;
function ok(name, fn) { fn(); n++; }

const formats = T.normalizeAll(raw);
const withSpeeches = Object.values(raw).filter(f => (f.speeches || []).length);
ok('every format with speeches is read', () => assert.strictEqual(formats.length, withSpeeches.length));

for (const f of formats) {
  const r = raw[f.key] || Object.values(raw).find(x => x.key === f.key);
  ok(f.key + ': sides and speeches', () => {
    assert.ok(f.sides.length >= 2, 'at least two sides');
    for (const s of f.speeches) {
      assert.ok(s.sec > 0 && s.sec <= 3600 && Number.isInteger(s.sec), `${s.short} has a time in seconds`);
      assert.ok(s.name && s.short, 'named');
      const known = f.sides.map(x => x.id).concat(['both', 'any', 'all', 'none', 'chamber']);
      assert.ok(known.includes(s.side), `${f.key} ${s.short}: side ${s.side} is a known side`);
      if (s.asker) assert.ok(known.includes(s.asker), `${f.key} ${s.short}: asker ${s.asker}`);
    }
  });
  ok(f.key + ': plan matches the data', () => {
    const p = T.buildPlan(f, { cycles: 6 });
    if (!f.cycle) {
      assert.strictEqual(p.segs.length, r.speeches.length);
      p.segs.forEach((s, i) => assert.strictEqual(s.sec, r.speeches[i].seconds, `${f.key} ${s.short} time`));
      assert.strictEqual(T.totalSeconds(p), r.speeches.reduce((t, s) => t + s.seconds, 0));
    } else {
      // repeating formats: the opening block, then speech + questioning until there are 6 speeches
      const from = r.repeat && r.repeat.from != null ? r.repeat.from : 2;
      const speeches = p.segs.filter(s => !/cross/.test(s.kind));
      assert.strictEqual(speeches.length, 6, 'six speeches set up');
      p.segs.slice(0, from).forEach((s, i) => assert.strictEqual(s.sec, r.speeches[i].seconds));
      const cyc = r.speeches.slice(from);
      p.segs.slice(from).forEach((s, i) => assert.strictEqual(s.sec, cyc[i % cyc.length].seconds));
    }
    // prep: per side banks or one round clock, as the data says
    const pr = r.prep || {};
    if (pr.per === 'side' && pr.seconds > 0) { assert.strictEqual(p.prepPer, 'side'); f.sides.forEach(sd => assert.strictEqual(p.banks[sd.id], pr.seconds)); }
    else if (pr.before_seconds) { assert.strictEqual(p.prepPer, 'round'); assert.strictEqual(p.prep, pr.before_seconds); }
    else assert.strictEqual(p.prepPer, 'none');
    // points of information only in the kinds the data names
    if (r.poi && r.poi.in) p.segs.forEach(s => assert.strictEqual(!!s.poi, r.poi.in.includes(s.kind), `${f.key} ${s.short} poi`));
    else if (!r.poi) p.segs.forEach(s => assert.ok(!s.poi));
  });
  ok(f.key + ': a whole round runs to the end', () => {
    const p = T.buildPlan(f, { cycles: 3 });
    const rd = new T.Round(p, { warn: [60, 30] });
    let t = 1000, zeros = 0;
    for (let i = 0; i < p.segs.length; i++) {
      assert.strictEqual(rd.i, i);
      rd.start(t);
      t += p.segs[i].sec * 1000 + 5000; // run 5 seconds over
      const ev = rd.tick(t);
      zeros += ev.filter(e => e.type === 'zero').length;
      assert.ok(rd.shown() < 0 && rd.shown() > -5.01, 'over time by about 5 s');
      assert.strictEqual(T.clock(rd.shown()), '+0:05');
      rd.pause(t);
      rd.next(t);
    }
    assert.strictEqual(zeros, p.segs.length, 'time called once per speech');
  });
}

ok('policy: warnings fire once each, in order', () => {
  const f = formats.find(x => x.key === 'policy');
  const rd = new T.Round(T.buildPlan(f), { warn: [120, 60, 30] });
  const got = [];
  rd.start(0);
  for (let t = 0; t <= 490000; t += 250) rd.tick(t).forEach(e => got.push(e.type === 'warn' ? e.at : e.type));
  assert.deepStrictEqual(got, [120, 60, 30, 'zero']);
  // pausing and resuming doesn't repeat them
  rd.pause(490000); rd.start(500000); assert.deepStrictEqual(rd.tick(510000), []);
});

ok('ld: prep banks pause the speech and count down per side', () => {
  const f = formats.find(x => x.key === 'ld');
  const rd = new T.Round(T.buildPlan(f));
  rd.start(0); rd.tick(60000);
  assert.strictEqual(Math.round(rd.leftMs / 1000), 300);
  rd.prep('neg', 60000);
  assert.strictEqual(rd.running, 'prep');
  rd.tick(90000);
  assert.strictEqual(Math.round(rd.leftMs / 1000), 300, 'speech clock paused during prep');
  assert.strictEqual(rd.bankMs.neg, 240000 - 30000);
  assert.strictEqual(rd.bankMs.aff, 240000);
  rd.prep('neg', 100000);
  assert.strictEqual(rd.running, null);
  assert.strictEqual(rd.bankMs.neg, 240000 - 40000);
  // running a bank past zero calls time once
  rd.prep('aff', 0); const ev = rd.tick(250000);
  assert.deepStrictEqual(ev.map(e => e.type), ['warn', 'warn', 'zero']);
  assert.ok(ev.every(e => e.prep));
});

ok('pf: who speaks first can be named Pro or Con', () => {
  const f = formats.find(x => x.key === 'pf');
  assert.ok(f.coin, 'coin toss format');
  const p = T.buildPlan(f, { names: { [f.sides[0].id]: 'Con', [f.sides[1].id]: 'Pro' } });
  assert.strictEqual(p.segs[0].label, 'Con');
  assert.strictEqual(p.segs[1].label, 'Pro');
  const cf = p.segs.find(s => /cross/.test(s.kind));
  assert.strictEqual(T.who(p.view, cf), 'Both sides ask');
});

ok('world schools: protected time for points of information', () => {
  const f = formats.find(x => x.key === 'worlds');
  const rd = new T.Round(T.buildPlan(f));
  rd.start(0);
  rd.tick(30000); assert.strictEqual(rd.poiState(), 'protected');
  rd.tick(61000); assert.strictEqual(rd.poiState(), 'open');
  rd.tick(421000); assert.strictEqual(rd.poiState(), 'protected');
  rd.tick(481000); assert.strictEqual(rd.poiState(), 'over');
  rd.go(6, 481000); assert.strictEqual(rd.poiState(), null, 'reply speeches have none');
  assert.strictEqual(rd.plan.prepPer, 'round');
  rd.roundPrep(0); rd.tick(600000); assert.strictEqual(rd.roundPrepMs, 3600000 - 600000);
});

ok('changed times, adjusting, reset, snapshot and restore', () => {
  const f = formats.find(x => x.key === 'policy');
  const p = T.buildPlan(f, { times: { 0: 300 }, prep: 600 });
  assert.strictEqual(p.segs[0].sec, 300); assert.strictEqual(p.segs[0].base, 480); assert.strictEqual(p.banks.aff, 600);
  const rd = new T.Round(p);
  rd.start(0); rd.tick(100000); rd.adjust(10, 100000);
  assert.strictEqual(rd.leftMs, 210000);
  rd.next(100000);
  assert.ok(rd.done[0]);
  const snap = JSON.parse(JSON.stringify(rd.snapshot()));
  const rd2 = new T.Round(p); rd2.restore(snap);
  assert.strictEqual(rd2.i, 1); assert.strictEqual(rd2.left[0], 210000);
  rd2.prev(0); assert.strictEqual(rd2.leftMs, 210000, 'going back keeps the time left');
  rd2.reset(0); assert.strictEqual(rd2.leftMs, 300000);
});

ok('clock text and hand signals', () => {
  assert.strictEqual(T.clock(480), '8:00');
  assert.strictEqual(T.clock(479.2), '8:00');
  assert.strictEqual(T.clock(0.4), '0:01');
  assert.strictEqual(T.clock(0), '0:00');
  assert.strictEqual(T.clock(-7.5), '+0:07');
  assert.strictEqual(T.parseClock('8:00'), 480); assert.strictEqual(T.parseClock('90s'), 90); assert.strictEqual(T.parseClock('4'), 240);
  assert.deepStrictEqual([T.handSignal(300).fingers, T.handSignal(241).fingers, T.handSignal(240).fingers, T.handSignal(45).fingers], [5, 5, 4, 1]);
  assert.ok(T.handSignal(30).half && T.handSignal(1).half);
  assert.ok(T.handSignal(0).fist && T.handSignal(-3).fist);
  assert.strictEqual(T.handSignal(480).fingers, 8);
  assert.strictEqual(T.spoken(61), '1 minute 1 second');
});

console.log('timer: ' + n + ' checks passed (' + formats.length + ' formats)');
