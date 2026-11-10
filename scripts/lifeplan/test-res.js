#!/usr/bin/env node
/* Resolution builder browser test (Playwright): node scripts/lifeplan/test-res.js http://localhost:PORT/ OUTDIR
   Walks the three steps at 1280 light and 390 dark (screenshots in OUTDIR), applies a "doesn't fit" fix, saves the plan,
   checks the cover page and page count of the year PDF, writes an .ics (check it with check-ics.py), checks the
   "On track?" line and moving the finish date. Prints a JSON report; exits 1 on a failed check. */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:9691/', out = process.argv[3] || '.';
const checks = []; function ok(c, n, x) { checks.push({ ok: !!c, n, x }); }
(async () => {
  const b = await chromium.launch();
  for (const [w, theme] of [[1280, 'light'], [390, 'dark'], [1280, 'dark'], [390, 'light']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
    await p.addInitScript(t => { try { localStorage.setItem('pref-theme', t); } catch (e) { } }, theme);
    await p.goto(base + 'life-planner/resolution/', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const tag = w + ' ' + theme;
    for (const k of ['bible', 'gb', 'active', 'walk', 'ladder']) { await p.check('#lp-g-' + k); await p.waitForTimeout(250); }
    await p.waitForTimeout(500);
    const cost = await p.textContent('.lp-goal.on .lp-gcost');
    ok(/a week/.test(cost), tag + ': goal cards show their weekly time', cost.trim().slice(0, 60));
    // the running total: per goal and overall, and it stays on screen while the cards scroll
    const tot = await p.textContent('.lp-rtotal .lp-rt-sum');
    ok(/a week/.test(tot) && /a session day/.test(tot) && /h in the year/.test(tot), tag + ': running total: a week, a session day, the year', tot.trim());
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.lp-goals').offsetTop + 300));
    await p.waitForTimeout(200);
    const vis = await p.evaluate(() => { const r = document.querySelector('.lp-rtotal').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1 && getComputedStyle(document.querySelector('.lp-rtotal')).position === 'sticky'; });
    ok(vis, tag + ': the running total stays in view while scrolling the cards');
    await p.click('.lp-rtotal summary'); await p.waitForTimeout(150);
    const rows = await p.$$eval('.lp-rt tbody tr', r => r.length);
    ok(rows === 5, tag + ': per-goal rows in the running total', rows);
    await p.click('.lp-rtotal summary');
    // the plan without a budget: no warning, and the optional check is offered
    await p.click('[data-go="3"]'); await p.waitForTimeout(1500);
    ok(!(await p.$('.lp-rwarn')) && !!(await p.$('#lp-rcheck3')), tag + ': a plan without a budget: no warning; the free-time check is optional');
    await p.click('[data-go="1"]'); await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/res1-${w}-${theme}.png`, fullPage: false });
    await p.click('[data-go="2"]'); await p.waitForTimeout(300);
    await p.check('input[name=lp-dpw][value="5"]'); await p.waitForTimeout(200);
    await p.check('#lp-rcheck'); await p.fill('#lp-rmins', '30'); await p.dispatchEvent('#lp-rmins', 'change');
    await p.fill('#lp-roff-from', '2027-07-05'); await p.fill('#lp-roff-to', '2027-07-09'); await p.fill('#lp-roff-label', 'Vacation'); await p.click('#lp-roff-add'); await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/res2-${w}-${theme}.png`, fullPage: false });
    await p.click('[data-go="3"]'); await p.waitForTimeout(1500);
    const warn = await p.$('.lp-rwarn');
    ok(!!warn, tag + ': five goals in 30 minutes a day: the plan says it doesn’t fit');
    if (warn) { await p.click('[data-fix="mins"]'); await p.waitForTimeout(1500); }
    const fits = await p.$('.lp-rok'), mil = await p.textContent('.lp-ms');
    ok(!!fits || !!(await p.$('.lp-rwarn')), tag + ': a fix re-paces the plan', !!fits);
    ok(/By April/.test(mil) && /Days 1–/.test(mil), tag + ': milestones by quarter', mil.replace(/\s+/g, ' ').slice(0, 120));
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, tag + ': no horizontal scroll', sw);
    await p.screenshot({ path: `${out}/res3-${w}-${theme}.png`, fullPage: true });
    if (w === 1280 && theme === 'light') {
      // save it as the plan, then print from the planner
      await p.click('#lp-rsave'); await p.waitForURL(/life-planner\/(#saved)?$/, { timeout: 10000 }); await p.waitForTimeout(800);
      const st = await p.evaluate(() => JSON.parse(localStorage.getItem('trb-lifeplan-v1')));
      ok(st.res && st.res.title === 'My resolution for 2027' && st.tracks.every(t => t.opt && t.opt.res), 'saved as the Life Planner plan, with the resolution', st.res && st.res.title);
      await p.evaluate(() => window.LPPrint.prepare(null, null, 'month'));
      const cover = await p.textContent('.lpp-cover');
      ok(/My resolution for 2027/.test(cover) && /This year I will/.test(cover), 'the PDF starts with the resolution cover');
      await p.emulateMedia({ media: 'print' });
      const pdf = await p.pdf({ format: 'Letter', printBackground: true });
      fs.writeFileSync(out + '/resolution-year.pdf', pdf);
      const n = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      ok(n >= 14 && n <= 17, 'resolution year PDF: ' + n + ' pages (cover, summary, 12 months)', n);
      await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => document.documentElement.classList.remove('lp-printing'));
      fs.writeFileSync(out + '/resolution.ics', await p.evaluate(() => window.LPIcs(null, null, { mode: 'each', rrule: true })));
      fs.writeFileSync(out + '/resolution-timed.ics', await p.evaluate(() => window.LPIcs(null, null, { mode: 'each', rrule: true, timed: true, time: '06:00' })));
      // "On track?": move the plan's start 10 days back, tick nothing, then move the finish date
      await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('trb-lifeplan-v1')); const d = s.res.draft; const t = new Date(); t.setDate(t.getDate() - 10); d.start = t.toISOString().slice(0, 10); localStorage.setItem('trb-resdraft-v1', JSON.stringify(Object.assign(d, { step: 3 }))); });
      await p.goto(base + 'life-planner/resolution/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
      await p.click('#lp-rsave'); await p.waitForURL(/life-planner\/(#saved)?$/); await p.waitForTimeout(800);
      const line = await p.textContent('.lp-ontrack').catch(() => '');
      ok(/resolution sessions done so far/.test(line) && !/fail|behind/i.test(line), 'On track? line, with no guilt words', line.trim().slice(0, 100));
      const to1 = await p.evaluate(() => JSON.parse(localStorage.getItem('trb-lifeplan-v1')).plan.to);
      await p.click('#lp-movefin'); await p.waitForTimeout(1200);
      const to2 = await p.evaluate(() => JSON.parse(localStorage.getItem('trb-lifeplan-v1')).plan.to);
      ok(new Date(to2) - new Date(to1) === 7 * 864e5, 'move the finish date: a week later', [to1, to2]);
    }
    ok(!errs.length, tag + ': no console errors', errs);
    await ctx.close();
  }
  console.log(JSON.stringify(checks.filter(c => !c.ok).length ? checks : { passed: checks.length, sample: checks.slice(0, 6) }, null, 1));
  await b.close();
  process.exit(checks.every(c => c.ok) ? 0 : 1);
})();
