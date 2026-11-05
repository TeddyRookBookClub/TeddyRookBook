#!/usr/bin/env node
/* Checks the Equation Balancer page in a real browser: every reaction starts unbalanced and its recorded answer is
   confirmed by Check; a doubled answer is reported with the smaller one; and molecules can be dragged with the mouse,
   with touch and with the keyboard, but never across the arrow.
   Run against a built site: node scripts/equation-balancer/verify.js http://localhost:1313   (needs playwright) */
'use strict';
const { chromium } = require('playwright');
const BASE = (process.argv[2] || 'http://localhost:1313').replace(/\/$/, '');
(async () => {
  const b = await chromium.launch(); const errs = []; let fails = 0;
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(BASE + '/science-lab/equation-balancer/', { waitUntil: 'networkidle' });
  await pg.evaluate(() => localStorage.clear()); await pg.reload({ waitUntil: 'networkidle' });
  const rxs = await pg.evaluate(() => EBModel.REACTIONS.map(r => ({ id: r.id, ans: r.ans })));
  for (const r of rxs) {
    const res = await pg.evaluate(r => {
      EBBench.load(r.id); const start = EBBench.check();
      EBBench.set(r.ans); const ok = EBBench.check(); const txt = document.getElementById('eb-result').textContent;
      let dbl = true;
      if (Math.max(...r.ans) * 2 <= EBModel.MAXC) { EBBench.load(r.id); EBBench.set(r.ans.map(c => c * 2)); dbl = EBBench.check() && /divided by 2/.test(document.getElementById('eb-result').textContent); }
      return { start, ok, dbl, txt };
    }, r);
    const pass = !res.start && res.ok && res.dbl;
    if (!pass) fails++;
    console.log((pass ? 'ok   ' : 'FAIL ') + r.id.padEnd(10) + res.txt.replace(/\s+/g, ' ').slice(0, 100));
  }
  const prog = await pg.evaluate(() => document.getElementById('eb-progress').textContent);
  console.log((prog === rxs.length + ' of ' + rxs.length + ' balanced' ? 'ok   ' : 'FAIL ') + 'progress: ' + prog);
  // mouse drags
  await pg.evaluate(() => { EBBench.load('water'); document.getElementById('eb-cv').scrollIntoView(); });
  const pts = await pg.evaluate(() => { const r = document.getElementById('eb-cv').getBoundingClientRect(), S = EBBench.state(), L = S.L;
    const shelf0 = L.shelf[0], box0 = L.box[0], box1 = L.box[1];
    return { shelfH2: { x: r.left + shelf0.x + shelf0.w / 4, y: r.top + shelf0.y + shelf0.h / 2 - 8 }, boxH2: { x: r.left + box0.x + box0.w / 4, y: r.top + box0.y + box0.h / 2 }, box1: { x: r.left + box1.x + box1.w / 2, y: r.top + box1.y + box1.h / 2 } }; });
  const coefs = () => pg.evaluate(() => EBBench.state().coef.join(','));
  await pg.mouse.move(pts.shelfH2.x, pts.shelfH2.y); await pg.mouse.down(); await pg.mouse.move(pts.boxH2.x, pts.boxH2.y, { steps: 8 }); await pg.mouse.up();
  let c = await coefs(); console.log((c === '2,1,1' ? 'ok   ' : 'FAIL ') + 'mouse: H2 from shelf into reactants -> ' + c); if (c !== '2,1,1') fails++;
  await pg.mouse.move(pts.shelfH2.x, pts.shelfH2.y); await pg.mouse.down(); await pg.mouse.move(pts.box1.x, pts.box1.y, { steps: 10 });
  const st = await pg.evaluate(() => { const d = EBBench.state().drag, L = EBBench.state().L; return d && d.st && d.st.zone === 'box' && d.st.x <= L.box[0].x + L.box[0].w; });
  await pg.mouse.up();
  c = await coefs(); console.log((st && c === '3,1,1' ? 'ok   ' : 'FAIL ') + 'mouse: H2 dragged over the products stops at the reactants’ edge -> ' + c); if (!(st && c === '3,1,1')) fails++;
  await pg.mouse.move(pts.boxH2.x, pts.boxH2.y); await pg.mouse.down(); await pg.mouse.move(pts.shelfH2.x, pts.shelfH2.y + 10, { steps: 8 }); await pg.mouse.up();
  c = await coefs(); console.log((c === '2,1,1' ? 'ok   ' : 'FAIL ') + 'mouse: H2 from the box back to the shelf -> ' + c); if (c !== '2,1,1') fails++;
  // keyboard: focus starts on the first shelf; Enter, ArrowUp, Enter adds one
  await pg.evaluate(() => EBBench.load('water'));
  await pg.focus('#eb-cv'); await pg.keyboard.press('Enter'); await pg.keyboard.press('ArrowUp'); await pg.keyboard.press('Enter');
  c = await coefs(); console.log((c === '2,1,1' ? 'ok   ' : 'FAIL ') + 'keyboard: Enter, ↑, Enter -> ' + c); if (c !== '2,1,1') fails++;
  await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('+');
  c = await coefs(); console.log((c === '2,2,1' ? 'ok   ' : 'FAIL ') + 'keyboard: → then + -> ' + c); if (c !== '2,2,1') fails++;
  // touch on a phone
  const tp = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  tp.on('pageerror', e => errs.push(e.message));
  await tp.goto(BASE + '/science-lab/equation-balancer/', { waitUntil: 'networkidle' });
  const tpts = await tp.evaluate(() => { EBBench.load('water'); const cv = document.getElementById('eb-cv'); cv.scrollIntoView(); const r = cv.getBoundingClientRect(), L = EBBench.state().L;
    return [{ x: r.left + L.shelf[1].x + L.shelf[1].w / 2, y: r.top + L.shelf[1].y + L.shelf[1].h / 2 - 8 }, { x: r.left + L.box[1].x + L.box[1].w / 2, y: r.top + L.box[1].y + L.box[1].h / 2 }]; });
  const cdp = await tp.context().newCDPSession(tp);
  const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y }] });
  await touch('touchStart', tpts[0]); for (let i = 1; i <= 8; i++) await touch('touchMove', { x: tpts[0].x, y: tpts[0].y + (tpts[1].y - tpts[0].y) * i / 8 }); await touch('touchEnd');
  c = await tp.evaluate(() => EBBench.state().coef.join(','));
  console.log((c === '1,1,2' ? 'ok   ' : 'FAIL ') + 'touch: H2O from shelf into products -> ' + c); if (c !== '1,1,2') fails++;
  await b.close();
  if (errs.length) { console.log('page errors:', errs); fails++; }
  console.log(fails ? `\n${fails} failed` : '\nall passed');
  process.exit(fails ? 1 : 0);
})();
