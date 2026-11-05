#!/usr/bin/env node
/*
  Contraption Workshop (/games/contraption/): plays every challenge level's recorded solution headless and checks it.
  Run:  node scripts/contraption/verify-levels.js
  For each level it checks that the solution only uses parts the palette allows, that every part stands where the
  placement rules allow it, that the goal is met (and how many stars it earns), and that the level is not already
  solved with nothing added. Then a stress test: piles of balls in cups, on dominoes and in the pulley must stay in
  the world with sane speeds. Exits with 1 on any failure. Not part of the deploy; run it after changing
  static/games/contraption/engine.js or levels.js.
*/
'use strict';
const path = require('path');
const CW = require(path.join(__dirname, '../../static/games/contraption/engine.js'));
const LEVELS = require(path.join(__dirname, '../../static/games/contraption/levels.js'));

// One solution per challenge (parts added by the player; a = angle or direction, n = size).
const SOLUTIONS = {
  'first-ring': [{ t: 'ramp', x: 300, y: 260, a: 15, n: 6 }],
  'into-cup': [{ t: 'ramp', x: 600, y: 320, a: -15, n: 5 }, { t: 'funnel', x: 160, y: 380 }],
  'domino-run': [{ t: 'ramp', x: 300, y: 200, a: 15, n: 6 }, { t: 'dominoes', x: 720, y: 468, a: 1, n: 5 }],
  'seesaw': [{ t: 'ramp', x: 720, y: 200, a: -15, n: 6 }],
  'lift': [{ t: 'ramp', x: 320, y: 200, a: 15, n: 6 }, { t: 'ramp', x: 380, y: 260, a: 15, n: 4 }],
  'screw': [{ t: 'screw', x: 480, y: 540, a: 1, n: 6 }],
  'spring-jump': [{ t: 'spring', x: 250, y: 540, a: 0 }],
  'three-steps': [{ t: 'ramp', x: 300, y: 240, a: 15, n: 6 }, { t: 'ramp', x: 620, y: 320, a: 0, n: 6 }],
  'lever-pulley': [{ t: 'ramp', x: 300, y: 240, a: 15, n: 6 }, { t: 'ramp', x: 620, y: 300, a: 0, n: 6 }, { t: 'lever', x: 520, y: 296, a: -1 }],
  'six': [{ t: 'ramp', x: 180, y: 200, a: 0, n: 4 }, { t: 'lever', x: 150, y: 196, a: -1 }, { t: 'wheel', x: 340, y: 380 },
    { t: 'wedge', x: 350, y: 540 }, { t: 'screw', x: 620, y: 540, a: 1, n: 6 }, { t: 'pulley', x: 700, y: 300, a: -1 }]
};

let fail = 0;
function bad(msg) { console.log('  FAIL ' + msg); fail++; }
function play(parts) { const s = new CW.Sim(parts); const r = s.run(20); return { s, r }; }

LEVELS.forEach(function (lv) {
  if (lv.sandbox) return;
  const sol = SOLUTIONS[lv.id];
  console.log(lv.id + ': ' + lv.name);
  if (!sol) { bad('no recorded solution'); return; }
  const added = sol.map((p, i) => Object.assign({ id: 'u' + i, a: 0, n: 0 }, p));
  // palette
  const count = {};
  added.forEach(p => { count[p.t] = (count[p.t] || 0) + 1; });
  Object.keys(count).forEach(t => { if (!lv.palette || lv.palette[t] === undefined || count[t] > lv.palette[t]) bad('uses ' + count[t] + ' × ' + t + ', palette allows ' + (lv.palette && lv.palette[t] || 0)); });
  // placement rules
  const all = lv.fixed.concat(added);
  added.forEach(p => { if (!CW.placeOK(p, all.filter(q => q !== p))) bad('part ' + p.id + ' (' + p.t + ') is not in an allowed place'); });
  // the goal
  const { r } = play(all);
  const st = CW.stars(lv, added.length, r);
  if (!st.goal) bad('goal not met: ' + JSON.stringify({ rings: r.rings.length, steps: r.steps, cup: r.cup, lifted: r.lifted, used: Object.keys(r.used) }));
  else console.log('  ok: goal at ' + CW.goalTime(lv.goal, r).toFixed(2) + ' s, ' + st.n + ' star' + (st.n > 1 ? 's' : '') + ', chain of ' + r.steps + ' step(s), machines used: ' + Object.keys(r.used).join(', '));
  // not solved by doing nothing
  const empty = play(lv.fixed.slice()).r;
  if (CW.goalMet(lv.goal, empty)) bad('already solved with nothing added');
  // the layout code survives a round trip
  const back = CW.decode(CW.encode(all));
  if (JSON.stringify(back.map(p => [p.t, p.x, p.y, p.a, p.n])) !== JSON.stringify(added.map(p => [p.t, p.x, p.y, p.a, p.n]))) bad('layout code round trip changed the parts');
});

// Stress: many balls in a cup, on the pulley, on dominoes and in a funnel. Nothing may leave the world, speeds stay
// bounded, and no number may become NaN.
(function () {
  console.log('stress test');
  const parts = [{ t: 'cup', x: 160, y: 540 }, { t: 'funnel', x: 160, y: 300 }, { t: 'pulley', x: 500, y: 200, a: 1 },
    { t: 'dominoes', x: 640, y: 540, a: 1, n: 8 }, { t: 'lever', x: 860, y: 540, a: 1 }, { t: 'wheel', x: 360, y: 400 },
    { t: 'spring', x: 760, y: 540, a: 0 }, { t: 'ramp', x: 700, y: 300, a: 30, n: 6 }];
  for (let i = 0; i < 6; i++) parts.push({ t: 'ball', x: 140 + i * 8, y: 40 + i * 30 });
  for (let i = 0; i < 4; i++) parts.push({ t: 'ball', x: 528, y: 60 + i * 30 });
  for (let i = 0; i < 4; i++) parts.push({ t: 'ball', x: 620 + i * 30, y: 60 });
  parts.push({ t: 'ball', x: 360, y: 200 }, { t: 'ball', x: 900, y: 100 }, { t: 'ball', x: 760, y: 300 });
  parts.forEach((p, i) => { p.id = 's' + i; if (p.a === undefined) p.a = 0; if (p.n === undefined) p.n = 0; });
  const s = new CW.Sim(parts);
  let maxV = 0, ok = true;
  for (let f = 0; f < 60 * 30; f++) {
    s.step();
    s.balls.forEach(b => {
      if (!isFinite(b.x) || !isFinite(b.y) || !isFinite(b.vx)) ok = false;
      if (b.x < -1 || b.x > CW.W + 1 || b.y > CW.FLOOR + 1) ok = false;
      maxV = Math.max(maxV, Math.hypot(b.vx, b.vy));
    });
    s.kins.forEach(k => { if (!isFinite(k.q) || !isFinite(k.v)) ok = false; });
  }
  if (!ok) bad('a ball left the world or a number became NaN');
  const end = Math.max.apply(null, s.balls.map(b => Math.hypot(b.vx, b.vy)));
  console.log('  ' + s.balls.length + ' balls for 30 s: fastest ever ' + maxV.toFixed(0) + ' px/s, fastest at the end ' + end.toFixed(0) + ' px/s');
  if (end > 120) bad('balls still moving fast after 30 s (jitter?)');
})();

console.log(fail ? fail + ' failure(s)' : 'all levels solvable; stress test passed');
process.exit(fail ? 1 : 0);
