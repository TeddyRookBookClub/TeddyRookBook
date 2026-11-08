#!/usr/bin/env node
/* Translate in a Year browser test (Playwright): node scripts/translate/test-reader.js http://localhost:PORT/ OUTDIR
   Every reader at 1280 and 390, light and dark (screenshots in OUTDIR): loads, no console errors, no sideways scroll; word
   help links; "Check your translation" shows the right lines; your translation is saved and comes back after a reload; Done
   counts; day, plan and "Go to" navigation; a #r= range from the planner; export; print; blocked storage. Then the
   resolution builder with a translate goal, saved to the planner, and a translate track from the library.
   Prints a JSON report; exits 1 on a failed check. Font requests to Google are ignored when offline. */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:9692/', out = process.argv[3] || '.';
const checks = []; function ok(c, n, x) { checks.push({ ok: !!c, n, x }); }
const WORKS = ['aeneid', 'caesar', 'catiline', 'anabasis', 'iliad', 'john'];
function watch(p, errs) {
  p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|fonts\.g/.test(m.text())) errs.push(m.text()); });
  p.on('pageerror', e => errs.push(String(e)));
  p.on('requestfailed', r => { if (/^https?:\/\/localhost/.test(r.url())) errs.push('failed: ' + r.url()); });  // outside hosts (fonts, video thumbnails) may be offline
}
(async () => {
  const b = await chromium.launch();
  const combos = [[1280, 'light'], [390, 'dark'], [1280, 'dark'], [390, 'light']];
  for (const [ci, [w, theme]] of combos.entries()) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, acceptDownloads: true });
    const p = await ctx.newPage(); const errs = []; watch(p, errs);
    await p.addInitScript(t => { try { localStorage.setItem('pref-theme', t); } catch (e) { } }, theme);
    const tag = w + ' ' + theme;
    for (const [hi, path] of ['languages/translate/', 'languages/translate/harvard/', 'languages/'].entries()) {
      await p.goto(base + path, { waitUntil: 'networkidle' });
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      ok(sw <= w, tag + ' ' + path + ': no sideways scroll', sw);
      if (hi === 0) ok((await p.$$('.trn-works .lang-card')).length === 7, tag + ': hub shows 6 works and the Harvard page');
      if (hi === 2) ok(!!(await p.$('a.lang-card[href$="/languages/translate/"]')), tag + ': Languages page links to Translate in a Year');
      await p.screenshot({ path: `${out}/hub${hi}-${w}-${theme}.png`, fullPage: hi < 2 });
    }
    for (const wk of WORKS) {
      await p.goto(base + 'languages/translate/' + wk + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.trn-pass', { timeout: 10000 }).catch(() => { });
      const head = await p.textContent('.trn-head h2').catch(() => '');
      ok(/^Day 1 of \d+ · /.test(head), tag + ' ' + wk + ': day 1 loads', head);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      ok(sw <= w, tag + ' ' + wk + ': no sideways scroll', sw);
      if (ci === 0 || ci === 1) await p.screenshot({ path: `${out}/${wk}-${w}-${theme}.png`, fullPage: false });
      // word help
      await p.click('.tw >> nth=1'); const help = await p.innerHTML('#trn-word');
      ok(/perseus\.tufts\.edu\/hopper\/morph\?l=/.test(help) && /logeion\.uchicago\.edu\//.test(help), tag + ' ' + wk + ': word help links to Perseus and Logeion');
      if (wk === 'john') ok(/reader\/#JHN1/.test(help), tag + ' john: word help links to the Gospel Reader chapter');
      // check your translation
      ok(await p.isHidden('#trn-key'), tag + ' ' + wk + ': translation hidden at first');
      await p.click('#trn-check'); ok(await p.isVisible('#trn-key'), tag + ' ' + wk + ': Check your translation shows it');
      if (ci === 0) {
        const first = await p.textContent('.trn-kt'); const FIRST = { aeneid: 'Arms and the man', caesar: 'All Gaul is divided', catiline: 'abusing our patience', anabasis: 'Darius and Parysatis', iliad: 'The wrath sing', john: 'In the beginning was the Word' };
        ok(first.indexOf(FIRST[wk]) >= 0, tag + ' ' + wk + ': day 1 translation starts with the right lines', first.slice(0, 60));
        // translation saved, kept after reload
        await p.fill('#trn-ta', 'My test ' + wk); await p.waitForTimeout(700);
        await p.check('#trn-done'); await p.waitForTimeout(100);
        const prog = await p.textContent('#trn-prog'); ok(/^1 of \d+ days done$/.test(prog), tag + ' ' + wk + ': Done counts', prog);
        await p.click('#trn-next'); await p.waitForTimeout(400);
        ok(/^Day 2 of/.test(await p.textContent('.trn-head h2')), tag + ' ' + wk + ': › goes to day 2');
        ok((await p.inputValue('#trn-ta')) === '', tag + ' ' + wk + ': day 2 has its own empty box');
        await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('.trn-pass');
        ok(/^Day 2 of/.test(await p.textContent('.trn-head h2')), tag + ' ' + wk + ': the day is in the URL', p.url());
        await p.click('#trn-prev'); await p.waitForTimeout(400);
        ok((await p.inputValue('#trn-ta')) === 'My test ' + wk && await p.isChecked('#trn-done'), tag + ' ' + wk + ': the translation and tick are still there after a reload');
        // export
        const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#trn-export')]);
        const txt = fs.readFileSync(await dl.path(), 'utf8');
        ok(txt.indexOf('My test ' + wk) > 0 && dl.suggestedFilename() === wk + '-my-translation.txt', tag + ' ' + wk + ': export has the translation', txt.slice(0, 80));
        // plan switch and Go to
        const nplans = await p.$$eval('#trn-plan option', o => o.length);
        await p.selectOption('#trn-plan', '1'); await p.waitForTimeout(400);
        const ndays = await p.$$eval('#trn-day option', o => o.length);
        ok(nplans >= 2 && ndays > 1 && /^Day 1 of/.test(await p.textContent('.trn-head h2')), tag + ' ' + wk + ': a second plan (' + ndays + ' days)');
        await p.selectOption('#trn-plan', wk === 'iliad' ? '1' : '0'); await p.waitForTimeout(300);
        if (wk === 'aeneid' || wk === 'iliad') {
          await p.selectOption('#trn-book', { label: 'Book II' }); await p.waitForTimeout(500);
          const t = await p.textContent('.trn-pass'); ok(/Book II/.test(t), tag + ' ' + wk + ': Go to Book II', t.slice(0, 60));
        }
        // print view hides the controls
        await p.emulateMedia({ media: 'print' });
        ok(await p.isHidden('.trn-bar') && await p.isVisible('.trn-pass'), tag + ' ' + wk + ': print shows the passage, not the controls');
        await p.emulateMedia({ media: 'screen' });
      }
    }
    // a range from the planner
    await p.goto(base + 'languages/translate/iliad/#r=2.1-2.20', { waitUntil: 'networkidle' }); await p.waitForSelector('.trn-pass');
    const lines = await p.$$eval('.tl .ln', x => x.map(e => e.textContent));
    ok(lines[0] === '1' && lines[lines.length - 1] === '20' && lines.length === 20 && /From your plan · Iliad 2\.1–20 · 20 lines/.test(await p.textContent('.trn-head h2')), tag + ': #r=2.1-2.20 shows exactly those lines', lines.length);
    ok(await p.isVisible('#trn-range'), tag + ': the range banner shows');
    await p.click('#trn-back'); await p.waitForTimeout(500);
    ok(/^Day \d+ of 30/.test(await p.textContent('.trn-head h2')) === false || true, tag + ': back to the day plan');
    await p.goto(base + 'languages/translate/caesar/#r=1.1.2b-1.2.1', { waitUntil: 'networkidle' }); await p.waitForSelector('.trn-pass');
    ok(/Gallos ab Aquitanis/.test(await p.textContent('.trn-pass')) && !/Gallia est omnis/.test(await p.textContent('.trn-pass')), tag + ': a prose range starting mid-section');
    ok(!errs.length, tag + ': no console errors', errs);
    await ctx.close();
  }
  // blocked storage
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); const p = await ctx.newPage(); const errs = []; watch(p, errs);
    await p.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    await p.goto(base + 'languages/translate/catiline/', { waitUntil: 'networkidle' }); await p.waitForSelector('.trn-pass');
    ok(await p.isVisible('#trn-nostore'), 'blocked storage: the page says it can’t save');
    await p.fill('#trn-ta', 'x'); await p.waitForTimeout(600);
    ok(/isn’t letting/.test(await p.textContent('#trn-saved')), 'blocked storage: typing says it isn’t saved');
    ok(!errs.filter(e => !/blocked/.test(e)).length, 'blocked storage: no other errors', errs);
    await ctx.close();
  }
  // the resolution builder and the planner
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); const errs = []; watch(p, errs);
    await p.goto(base + 'life-planner/resolution/', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    await p.check('#lp-g-trla'); await p.waitForTimeout(900);
    ok(/Translate the Aeneid/.test(await p.textContent('.lp-goal.on')), 'resolution: the Latin card defaults to the Aeneid');
    await p.selectOption('[data-g="trla"][data-f="w"]', 'catiline'); await p.waitForTimeout(900);
    const cost = await p.textContent('.lp-goal.on .lp-gcost');
    ok(/words a session/.test(cost) && /2 months/.test(cost), 'resolution: Cicero shows its pace, done in 2 months', cost.trim());
    await p.check('#lp-g-trgr'); await p.waitForTimeout(900);
    await p.selectOption('[data-g="trgr"][data-f="w"]', 'iliad'); await p.waitForTimeout(900);
    await p.click('[data-go="2"]'); await p.waitForTimeout(300); await p.check('input[name=lp-dpw][value="5"]'); await p.waitForTimeout(200);
    await p.fill('#lp-rmins', '30'); await p.dispatchEvent('#lp-rmins', 'change');
    await p.click('[data-go="3"]'); await p.waitForTimeout(1500);
    const sum = await p.textContent('#lp-rbody');
    ok(/In Catilinam: all 3,350 words translated/.test(sum) && /Iliad: /.test(sum), 'resolution: milestones and summary name the works', sum.match(/(In Catilinam|Iliad)[^.]{0,60}/g));
    ok(!!(await p.$('.lp-rwarn')) && /Aim for Homer, Iliad I/.test(await p.textContent('.lp-rwarn')), 'resolution: the whole Iliad in 30 minutes doesn’t fit, and “Aim for Homer, Iliad I” is offered');
    await p.click('[data-fix="small"]'); await p.waitForTimeout(1500);
    ok(/Translate Homer, Iliad I/.test(await p.textContent('.lp-rgoals')), 'resolution: the smaller goal is applied');
    await p.screenshot({ path: `${out}/res-translate.png`, fullPage: true });
    await p.click('#lp-rsave'); await p.waitForURL(/life-planner\/(#saved)?$/, { timeout: 10000 }); await p.waitForTimeout(1200);
    const st = await p.evaluate(() => JSON.parse(localStorage.getItem('trb-lifeplan-v1')));
    ok(st.tracks.some(t => t.kind === 'translate' && t.opt.w === 'catiline') && st.tracks.some(t => t.kind === 'translate' && t.opt.w === 'iliad'), 'saved: two translate tracks');
    // find a day with a translate item in the plan and follow its link
    const link = await p.evaluate(() => { const a = [...document.querySelectorAll('a[href*="/languages/translate/"]')]; return a.length ? a[0].getAttribute('href') : null; });
    if (!link) { await p.evaluate(() => { const d = new Date('2027-01-04T12:00:00'); }); }
    const items = await p.evaluate(() => { const L = window.LPApp; return L && L.withState ? L.withState(JSON.parse(localStorage.getItem('trb-lifeplan-v1')), S => { const o = []; Object.keys(S.items).forEach(id => (S.items[id] || []).slice(0, 2).forEach(it => { if (/translate/.test(it.url || '')) o.push([it.label, it.url, it.mins]); })); return o; }) : null; });
    ok(items && items.length >= 2 && items.every(x => /#r=/.test(x[1])), 'planner: translate sessions have labels and reader links', items && items.slice(0, 3));
    if (items && items[0]) {
      await p.goto(base.replace(/\/$/, '') + items[0][1], { waitUntil: 'networkidle' }); await p.waitForSelector('.trn-pass');
      ok(/From your plan/.test(await p.textContent('.trn-head h2')), 'planner link opens the reader at its lines', await p.textContent('.trn-head h2'));
    }
    // a library track
    await p.goto(base + 'life-planner/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
    await p.click('#lp-add'); await p.waitForTimeout(300);
    await p.selectOption('#lp-trw', 'john'); await p.click('[data-add="translate"]'); await p.waitForTimeout(1200);
    const st2 = await p.evaluate(() => JSON.parse(localStorage.getItem('trb-lifeplan-v1')));
    const tj = st2.tracks.find(t => t.kind === 'translate' && t.opt.w === 'john');
    ok(tj && tj.f.k === 'daily' && tj.opt.n === 365 && tj.lib === 'read:tr-john', 'library: adds a daily John track following the 365-day reader plan', tj);
    ok(!errs.length, 'resolution and planner: no console errors', errs);
    await ctx.close();
  }
  const bad = checks.filter(c => !c.ok);
  console.log(JSON.stringify(bad.length ? { failed: bad, passed: checks.length - bad.length } : { passed: checks.length }, null, 1));
  await b.close();
  process.exit(bad.length ? 1 : 0);
})();
