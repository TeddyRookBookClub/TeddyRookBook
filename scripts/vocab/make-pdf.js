#!/usr/bin/env node
/* Vocabulary Ladder: a local check tool for the print page (/vocabulary/print/), which lays out word cards on the fly in
   the browser and fits every card to its space. The site stores no PDF files: readers print, or save a PDF, from their
   own browser. This script drives the same page in Playwright (Chromium).

   node scripts/vocab/make-pdf.js [base URL] --check [--size letter|a4|both] [--per 2,4,6] [--sel SEL]
       lays out the selection (default: everything, in its four parts of 25 topics) at each paper size and number of cards
       per page (default: both sizes, 2, 4 and 6), and exits 1, naming the cards, if any card still overflows. Writes nothing.
   node scripts/vocab/make-pdf.js [base URL] [--out DIR] [--size …] [--per …] [--sel SEL] [--bw]
       the same (4 cards a page unless --per is given), and also saves each part as a PDF in DIR (default /tmp/vocab-pdf/),
       e.g. cards-all-part1-letter-4.pdf, to look at the pages (pdftoppm -r 60 -f 3 -l 3 -png file.pdf page).
       It refuses to write into static/: the site keeps no PDF files.
   base URL: where a build of the site is served (default http://localhost:1313/).
   SEL: the print page's selection, as in its URL: topics:1,5,9 | range:1-25 | level:3 | strand:2 | roots:all |
   roots:<slug> | all.  Needs Playwright with Chromium (NODE_PATH="$(npm root -g)"). */
'use strict';
const fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  console.error('Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium, then NODE_PATH="$(npm root -g)" node scripts/vocab/make-pdf.js');
  process.exit(2);
}
const args = process.argv.slice(2), opt = { check: false, out: '/tmp/vocab-pdf', size: 'both', per: '2,4,6', sel: 'all', bw: false }, pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--check') opt.check = true; else if (a === '--bw') opt.bw = true;
  else if (a === '--out' || a === '--size' || a === '--per' || a === '--sel') opt[a.slice(2)] = args[++i];
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^[^]*?\/\*/, '')); process.exit(0); }
  else pos.push(a);
}
if (!opt.check && !args.includes('--per')) opt.per = '4';
const base = (pos[0] || 'http://localhost:1313/').replace(/\/?$/, '/');
const sizes = opt.size === 'both' ? ['letter', 'a4'] : [opt.size === 'a4' ? 'a4' : 'letter'], pers = String(opt.per).split(',').map(Number).filter(n => [2, 4, 6].includes(n));
const out = path.resolve(opt.out);
if (!opt.check && out.split(path.sep).includes('static')) { console.error('Refusing to write PDFs into ' + out + ': the site keeps no PDF files.'); process.exit(2); }

async function open(browser, q) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  page.setDefaultTimeout(0);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem('pref-theme', 'light'); } catch (e) { } });
  const url = base + 'vocabulary/print/' + q, res = await page.goto(url, { waitUntil: 'load' });
  if (!res || !res.ok()) throw new Error('could not open ' + url + ' (' + (res && res.status()) + ')');
  await page.waitForFunction(() => window.__voPrintReady === true);
  if (errors.length) throw new Error('page errors on ' + url + ': ' + errors.join(' | '));
  return page;
}
(async () => {
  const browser = await chromium.launch();
  let bad = 0, cards = 0, files = 0;
  try {
    // how many parts the selection has (the print page shows a button for each)
    const p0 = await open(browser, '?sel=' + encodeURIComponent(opt.sel)), nParts = await p0.$$eval('#vp-partbtns button', b => b.length);
    await p0.close();
    const parts = nParts ? Array.from({ length: nParts }, (x, i) => i + 1) : [0];
    if (!opt.check) fs.mkdirSync(out, { recursive: true });
    for (const size of sizes) for (const per of pers) for (const part of parts) {
      const q = '?sel=' + encodeURIComponent(opt.sel) + (part ? '&part=' + part : '') + '&size=' + size + '&per=' + per + (opt.bw ? '&bw=1' : '');
      const page = await open(browser, q);
      await page.emulateMedia({ media: 'print' });
      const r = await page.evaluate(() => window.__voFit()); // fit again under print media, then check
      const n = await page.$$eval('.vo-card-print', x => x.length);
      if (r.cards !== n) throw new Error('fit report covers ' + r.cards + ' of ' + n + ' cards');
      const lv = Object.keys(r.levels).sort((a, b) => a - b).map(k => 'L' + k + ' ' + r.levels[k]).join(', ');
      console.log(size.padEnd(6) + ' ' + per + '/page  ' + (part ? 'part ' + part : 'all   ') + '  ' + String(n).padStart(4) + ' cards: ' + (r.overflow.length ? r.overflow.length + ' OVERFLOW (' + r.overflow.join(', ') + ')' : 'all fit') + '  [' + lv + ']');
      bad += r.overflow.length; cards += n;
      if (!opt.check) {
        const f = path.join(out, 'cards-' + opt.sel.replace(/[^\w-]+/g, '_') + (part ? '-part' + part : '') + '-' + size + '-' + per + (opt.bw ? '-bw' : '') + '.pdf');
        const buf = await page.pdf({ preferCSSPageSize: true, printBackground: true, format: size === 'a4' ? 'A4' : 'Letter' });
        fs.writeFileSync(f, buf); files++; console.log('        wrote ' + f + ' (' + (buf.length / 1048576).toFixed(1) + ' MB)');
      }
      await page.close();
    }
  } finally { await browser.close(); }
  console.log(cards + ' cards laid out; ' + (bad ? bad + ' do not fit.' : 'every card fits.') + (files ? ' ' + files + ' PDF(s) in ' + out + '.' : ''));
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
