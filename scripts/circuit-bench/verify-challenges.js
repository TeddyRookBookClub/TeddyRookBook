#!/usr/bin/env node
/* Plays a recorded solution for every Circuit Bench challenge in a real browser and checks that each one is marked done.
   Also drives one wire with the mouse, one with touch and one with the keyboard, the way a visitor would.
   Run against a built site: node scripts/circuit-bench/verify-challenges.js http://localhost:1313   (needs playwright) */
'use strict';
const { chromium } = require('playwright');
const BASE = (process.argv[2] || 'http://localhost:1313').replace(/\/$/, '');
const W = (a, ka, b, kb) => ['wire', a, ka, b, kb];
// tap: press the telegraph key for a time (ms) at a moment (ms); dots 120 ms, dashes 450 ms, letter gaps 900 ms
function morse(code) { const out = []; let t = 1000; code.split('').forEach(c => { if (c === ' ') { t += 900; return; } const d = c === '.' ? 120 : 450; out.push(['tap', 'K', t, t + d]); t += d + 200; }); return out; }
const SOL = {
  bulb: [W('B', 'pos', 'L1', 'a'), W('L1', 'b', 'B', 'neg')],
  series: [W('B', 'pos', 'L1', 'a'), W('L1', 'b', 'L2', 'a'), W('L2', 'b', 'B', 'neg'),
    ['unwire', 'L2', 'b'], ['unwire', 'L1', 'b'], W('L1', 'b', 'B', 'neg'), W('L1', 'a', 'L2', 'a'), W('L1', 'b', 'L2', 'b')],
  meters: [W('B', 'pos', 'A', 'pos'), W('A', 'neg', 'L1', 'a'), W('L1', 'b', 'B', 'neg'), W('V', 'pos', 'L1', 'a'), W('V', 'neg', 'L1', 'b')],
  led: [['set', 'R', 'r', 120], W('B', 'pos', 'R', 'a'), W('R', 'b', 'D', 'an'), W('D', 'ca', 'B', 'neg')],
  twolamps: [W('B', 'pos', 'S', 'a'), W('S', 'b', 'L1', 'a'), W('S', 'b', 'L2', 'a'), W('L1', 'b', 'B', 'neg'), W('L2', 'b', 'B', 'neg'), ['toggle', 'S']],
  magnet: [W('B', 'pos', 'M', 'a'), W('M', 'b', 'B', 'neg'), ['set', 'B', 'n', 3]],
  telegraph: [W('B', 'pos', 'K', 'a'), W('K', 'b', 'M', 'a'), W('M', 'b', 'B', 'neg')].concat(morse('... --- ...')),
  motor: [W('B', 'pos', 'Mo', 'a'), W('Mo', 'b', 'B', 'neg'), ['unwire', 'Mo', 'a'], ['unwire', 'Mo', 'b'], W('B', 'pos', 'Mo', 'b'), W('Mo', 'a', 'B', 'neg')],
  stairs: [W('B', 'pos', 'S1', 'c'), W('S1', 'a', 'S2', 'a'), W('S1', 'b', 'S2', 'b'), W('S2', 'c', 'L1', 'a'), W('L1', 'b', 'B', 'neg')],
  fault: [['remove', 'L1'], ['add', 'lamp', 'L3', 2], W('B', 'pos', 'L3', 'a'), W('L3', 'b', 'L2', 'a')]
};
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(BASE + '/science-lab/circuit-bench/', { waitUntil: 'networkidle' });
  await pg.evaluate(() => localStorage.clear());
  await pg.reload({ waitUntil: 'networkidle' });
  let fails = 0;
  const ids = await pg.evaluate(() => CBModel.CHALLENGES.map(c => c.id));
  for (const id of ids) {
    const pre = await pg.evaluate(id => { CBBench.load(id); return CBBench.state().mem.__done ? 1 : 0; }, id);
    const ok = await pg.evaluate(([id, acts]) => { acts.forEach(a => CBBench.act(a)); return !!CBBench.state().mem.__done && CBBench.done(id); }, [id, SOL[id] || []]);
    const note = await pg.evaluate(() => document.getElementById('cb-note').textContent);
    console.log((ok && !pre ? 'ok   ' : 'FAIL ') + id.padEnd(10) + note.slice(0, 110));
    if (!ok || pre) fails++;
  }
  // unsolved setups must not pass on their own
  for (const id of ids) {
    const p = await pg.evaluate(id => { CBBench.load(id); return !!CBBench.state().mem.__done; }, id);
    if (p) { console.log('FAIL ' + id + ' passes before anything is done'); fails++; }
  }
  // a short circuit is announced
  await pg.evaluate(() => { CBBench.load(null); CBBench.act(['add', 'battery', 'B', 0]); CBBench.act(['wire', 'B', 'pos', 'B', 'neg']); });
  const warn = await pg.evaluate(() => !document.getElementById('cb-warn').hidden && document.getElementById('cb-warn').textContent);
  console.log((warn ? 'ok   ' : 'FAIL ') + 'short-circuit warning: ' + (warn || '').slice(0, 80)); if (!warn) fails++;
  // the mouse: drag a wire from the battery's + terminal to the bulb, then from the bulb back to −
  async function termXY(p, k) {
    return pg.evaluate(([p, k]) => { const S = CBBench.state(), cv = document.getElementById('cb-cv'), r = cv.getBoundingClientRect(), s = r.width / cv.clientWidth;
      const part = CBModel.part(S.bench, p); const i = part.slot, C = r.width < 600 ? 3 : 5, SW = r.width < 600 ? 124 : 146, PAD = r.width < 600 ? 12 : 20, WW = C * SW + 2 * PAD, sc = r.width / WW;
      const cx = PAD + (i % C + .5) * SW, cy = 14 + (Math.floor(i / C) + .5) * 124; const left = CBModel.TYPES[part.t].terms[0] === k; void s;
      return { x: r.left + (cx + (left ? -50 : 50)) * sc, y: r.top + (cy + 26) * sc }; }, [p, k]);
  }
  await pg.evaluate(() => CBBench.load('bulb'));
  await pg.evaluate(() => window.scrollTo(0, document.getElementById('cb-cv').getBoundingClientRect().top + scrollY - 20));
  let a = await termXY('B', 'pos'), z = await termXY('L1', 'a');
  await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await pg.mouse.move((a.x + z.x) / 2, z.y + 30, { steps: 5 }); await pg.mouse.move(z.x + 9, z.y - 7, { steps: 5 }); await pg.mouse.up();
  a = await termXY('L1', 'b'); z = await termXY('B', 'neg');
  await pg.mouse.move(a.x, a.y); await pg.mouse.down(); await pg.mouse.move(z.x - 6, z.y + 8, { steps: 8 }); await pg.mouse.up();
  let done = await pg.evaluate(() => CBBench.state().bench.wires.length === 2 && !!CBBench.state().mem.__done);
  console.log((done ? 'ok   ' : 'FAIL ') + 'mouse: two wires dragged, bulb lit'); if (!done) fails++;
  // the mouse: drag a part to another spot, then onto the bin
  const lamp0 = await pg.evaluate(() => CBModel.part(CBBench.state().bench, 'L1').slot);
  z = await termXY('L1', 'a'); await pg.mouse.move(z.x + 55, z.y - 40); await pg.mouse.down(); await pg.mouse.move(z.x + 55 + 160, z.y + 110, { steps: 8 }); await pg.mouse.up();
  const lamp1 = await pg.evaluate(() => CBModel.part(CBBench.state().bench, 'L1').slot);
  console.log((lamp1 !== lamp0 ? 'ok   ' : 'FAIL ') + 'mouse: bulb moved from spot ' + (lamp0 + 1) + ' to ' + (lamp1 + 1) + ', wires kept: ' + await pg.evaluate(() => CBBench.state().bench.wires.length)); if (lamp1 === lamp0) fails++;
  // the keyboard: focus the bench, start a wire from a terminal, carry it, drop it
  await pg.evaluate(() => { CBBench.load('bulb'); });
  await pg.focus('#cb-cv');
  await pg.evaluate(() => { const S = CBBench.state(); });
  // focus starts on the battery; arrow to the right-hand (+) terminal: Right then Down finds terminals nearby
  const kb = await pg.evaluate(async () => {
    const cv = document.getElementById('cb-cv'), k = key => cv.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    const S = CBBench.state();
    // walk to the battery's + terminal
    for (let i = 0; i < 12 && !(S.focus && S.focus.kind === 'term' && S.focus.p === 'B' && S.focus.k === 'pos'); i++) k(S.focus && S.focus.kind === 'part' ? 'ArrowDown' : 'ArrowRight');
    if (!(S.focus && S.focus.p === 'B' && S.focus.k === 'pos')) return 'never reached B.pos: ' + JSON.stringify(S.focus);
    k('Enter'); // start a wire
    for (let i = 0; i < 6 && !(S.drag && S.drag.to && S.drag.to.p === 'L1'); i++) k('ArrowRight');
    const to = S.drag && S.drag.to; k('Enter');
    return S.bench.wires.length === 1 ? 'wire to ' + to.p + '.' + to.k : 'no wire';
  });
  console.log((/^wire to L1/.test(kb) ? 'ok   ' : 'FAIL ') + 'keyboard: ' + kb); if (!/^wire to L1/.test(kb)) fails++;
  await ctx.close();
  // touch, on a phone-sized screen
  const tctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const tp = await tctx.newPage(); tp.on('pageerror', e => errs.push(e.message));
  await tp.goto(BASE + '/science-lab/circuit-bench/', { waitUntil: 'networkidle' });
  await tp.evaluate(() => { localStorage.clear(); CBBench.load('bulb'); });
  const pts = await tp.evaluate(() => { const S = CBBench.state(), cv = document.getElementById('cb-cv'); cv.scrollIntoView(); const r = cv.getBoundingClientRect(), sc = r.width / (3 * 124 + 24);
    const at = (p, k) => { const part = CBModel.part(S.bench, p), i = part.slot, cx = 12 + (i % 3 + .5) * 124, cy = 14 + (Math.floor(i / 3) + .5) * 124, left = CBModel.TYPES[part.t].terms[0] === k; return { x: r.left + (cx + (left ? -50 : 50)) * sc, y: r.top + (cy + 26) * sc }; };
    return [at('B', 'pos'), at('L1', 'a')]; });
  const cdp = await tctx.newCDPSession(tp);
  const touch = async (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y }] });
  await touch('touchStart', pts[0]); for (let i = 1; i <= 8; i++) await touch('touchMove', { x: pts[0].x + (pts[1].x - pts[0].x) * i / 8 + 6, y: pts[0].y + (pts[1].y - pts[0].y) * i / 8 + 5 }); await touch('touchEnd');
  const tw = await tp.evaluate(() => CBBench.state().bench.wires.map(w => w.a.p + '.' + w.a.k + '-' + w.b.p + '.' + w.b.k).join());
  console.log((tw === 'B.pos-L1.a' ? 'ok   ' : 'FAIL ') + 'touch: wire ' + tw); if (tw !== 'B.pos-L1.a') fails++;
  await b.close();
  if (errs.length) { console.log('page errors:', errs); fails++; }
  console.log(fails ? `\n${fails} failed` : '\nall passed');
  process.exit(fails ? 1 : 0);
})();
