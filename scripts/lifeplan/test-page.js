#!/usr/bin/env node
/* Life Planner browser test (Playwright): node scripts/lifeplan/test-page.js http://localhost:PORT/ OUTDIR
   Seeds Bible in a Year ticks and ladder progress, checks the planner reads them, ticks a Bible day, adds a ladder course,
   writes .ics files (validate them with scripts/lifeplan/check-ics.py) and year PDFs, and checks learner profiles keep
   separate plans. Prints a JSON report; exits 1 on a failed check. */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:9691/', out = process.argv[3] || '.';
const url = base + 'life-planner/';
const checks = []; function ok(c, n, x) { checks.push({ ok: !!c, n, x }); }
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(url); // an origin to seed
  await p.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('trb-homeschool-v1', JSON.stringify({ done: { 'bible-73': { 1: 1, 2: 1 } } }));
    localStorage.setItem('trb-math-v1', JSON.stringify({ v: 1, t: { 'pk.count-to-5': { s: 2 }, 'pk.touch-and-count': { s: 2 } }, xp: {} }));
  });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const first = await p.textContent('#lp-view .lp-it .lp-lab');
  ok(/^Day 3:/.test(first.trim()), 'Bible track starts at the next unread day (3)', first.trim().slice(0, 40));
  // tick it here: it shows on Bible in a Year
  await p.click('#lp-view .lp-it input.lp-ck');
  const hs = await p.evaluate(() => JSON.parse(localStorage.getItem('trb-homeschool-v1')));
  ok(hs.done['bible-73'][3] === 1, 'ticking Day 3 here writes the Bible in a Year tick');
  // add a ladder course from the library
  await p.click('#lp-add'); await p.click('[data-ltab="learn"]');
  await p.selectOption('#lp-course', 'math|pk'); await p.fill('#lp-cn', '3'); await p.click('[data-add="ladder"]');
  await p.waitForTimeout(800);
  const lp = await p.evaluate(() => JSON.parse(localStorage.getItem('trb-lifeplan-v1')));
  const lad = lp.tracks.filter(t => t.kind === 'ladder')[0];
  ok(lad && lad.opt.from === 2 && !lad.opt.auto, 'a new ladder track starts after the topics already passed', lad && lad.opt);
  // the ladder topics passed show as done when they come up: set the start back to topic 1 and look at the first item
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('trb-lifeplan-v1')); s.tracks.forEach(t => { if (t.kind === 'ladder') t.opt.from = 0; }); localStorage.setItem('trb-lifeplan-v1', JSON.stringify(s)); });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  await p.click('#lp-tab-month');
  const ladDone = await p.evaluate(() => { const c = [...document.querySelectorAll('.lp-chip')].filter(x => /Counting to 5/.test(x.title)); return c.length ? c[0].classList.contains('done') : null; });
  ok(ladDone === true, 'a passed ladder topic shows as done in the plan', ladDone);
  const stats = await p.textContent('#lp-stats');
  // overload: shrink the time and look for the flag
  await p.fill('#lp-budget input[data-dow="1"]', '5'); await p.dispatchEvent('#lp-budget input[data-dow="1"]', 'change'); await p.waitForTimeout(300);
  const stats2 = await p.textContent('#lp-stats');
  ok(/overloaded/.test(stats2), 'a small time budget flags overloaded days', stats2);
  // calendar files
  const icsA = await p.evaluate(() => window.LPIcs(null, null, { mode: 'each', rrule: true }));
  const icsB = await p.evaluate(() => window.LPIcs(null, null, { mode: 'each', rrule: true, timed: true, time: '06:30' }));
  const icsC = await p.evaluate(() => window.LPIcs(null, null, { mode: 'daily', timed: true, time: '19:00' }));
  fs.writeFileSync(out + '/each-allday.ics', icsA); fs.writeFileSync(out + '/each-timed.ics', icsB); fs.writeFileSync(out + '/daily-timed.ics', icsC);
  ok(/RRULE:FREQ=/.test(icsA), 'repeat rules used for simply recurring tasks');
  // PDFs: the whole year, month pages and week pages
  for (const lay of ['month', 'week']) {
    await p.evaluate(l => window.LPPrint.prepare(null, null, l), lay);
    await p.emulateMedia({ media: 'print' });
    const pdf = await p.pdf({ format: 'Letter', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
    fs.writeFileSync(out + '/year-' + lay + '.pdf', pdf);
    const n = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    ok(lay === 'month' ? n >= 13 && n <= 16 : n > 13 && n <= 40, 'year PDF (' + lay + ' pages): ' + n + ' pages', n);
    await p.emulateMedia({ media: 'screen' });
    await p.evaluate(() => document.documentElement.classList.remove('lp-printing'));
  }
  // learner profiles: a second learner gets a plan of their own; the first learner's plan waits in its slot
  const before = await p.evaluate(() => localStorage.getItem('trb-lifeplan-v1'));
  await p.evaluate(() => { const r = TRBProfiles.add({ name: 'Ann' }); TRBProfiles.requestSwitch(r.profile.id); });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  const ann = await p.evaluate(() => ({ cur: TRBProfiles.active().name, plan: JSON.parse(localStorage.getItem('trb-lifeplan-v1')), bible: localStorage.getItem('trb-homeschool-v1') }));
  ok(ann.cur === 'Ann' && !ann.plan.tracks.some(t => t.kind === 'ladder') && ann.bible === null, 'Ann starts with her own plan (no ladder track, no Bible ticks)');
  const firstAnn = await p.textContent('#lp-view .lp-it .lp-lab').catch(() => '');
  await p.evaluate(() => { TRBProfiles.requestSwitch(TRBProfiles.list()[0].id); });
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  const back = await p.evaluate(() => localStorage.getItem('trb-lifeplan-v1'));
  ok(JSON.parse(back).tracks.length === JSON.parse(before).tracks.length && JSON.parse(back).tracks.some(t => t.kind === 'ladder'), 'switching back brings the first learner’s plan back');
  ok(!errs.length, 'no console errors', errs);
  console.log(JSON.stringify({ stats: stats.trim(), firstAnn: firstAnn.trim().slice(0, 40), checks }, null, 1));
  await b.close();
  process.exit(checks.every(c => c.ok) ? 0 : 1);
})();
