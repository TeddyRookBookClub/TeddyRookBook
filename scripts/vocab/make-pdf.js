#!/usr/bin/env node
/* Makes the printable Vocabulary Ladder book as PDF files, from the /vocabulary/print/ page of a running build.

   Usage:  node scripts/vocab/make-pdf.js [base URL] [--check] [--estimate] [--letter-only]
     base URL     where the built site is served (default http://localhost:1313/)
     --check      lay out the whole book at Letter and A4 and check that every card fits (nothing written)
     --estimate   fills every topic with copies of the finished cards and reports how big a full 1,000-card book would be;
                  writes nothing
     --letter-only  skip the A4 files

   Writes to static/vocabulary/:
     vocabulary-1000.pdf      the whole book, US Letter    vocabulary-1000-a4.pdf   the whole book, A4
   When a whole book is over 25 MB, it writes four volumes instead (topics 1–25, 26–50, 51–75, 76–100):
     vocabulary-1000-vol1.pdf … vol4.pdf                    vocabulary-1000-a4-vol1.pdf … a4-vol4.pdf
   and removes the whole-book file of that paper size (and the other way round), so the print page never lists stale files.
   Rebuild the site afterwards: /vocabulary/print/ lists whichever of these files exist, with their sizes.

   Every card must fit its quarter page: the print page steps a crowded card's type and picture down until it does, and this
   script re-fits under print media and stops with exit status 1, naming the cards, if any card still overflows.

   Needs Playwright with Chromium (npm i -g playwright, then run with NODE_PATH="$(npm root -g)"). */
'use strict';
const fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  console.error('Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium, then NODE_PATH="$(npm root -g)" node scripts/vocab/make-pdf.js');
  process.exit(2);
}
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'static', 'vocabulary');
const LIMIT = 25 * 1024 * 1024, MB = n => (n / 1048576).toFixed(1) + ' MB';
const args = process.argv.slice(2), flags = args.filter(a => a.startsWith('--')), base = (args.find(a => !a.startsWith('--')) || 'http://localhost:1313/').replace(/\/?$/, '/');
const estimate = flags.includes('--estimate'), checkOnly = flags.includes('--check'), sizes = flags.includes('--letter-only') ? ['letter'] : ['letter', 'a4'];
const NAME = (size, vol) => 'vocabulary-1000' + (size === 'a4' ? '-a4' : '') + (vol ? '-vol' + vol : '') + '.pdf';

// --estimate: answer the words data request with every topic filled by copies of the finished entries
function fakeData(real) {
  const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'vocab', 'list.json'), 'utf8'));
  const pool = [].concat(...Object.values(real)); if (!pool.length) throw new Error('no finished entries to copy');
  const out = {}; let k = 0;
  list.topics.forEach(t => { out[t.key] = t.words.map(w => { const e = JSON.parse(JSON.stringify(pool[k++ % pool.length])); e.word = w; return e; }); });
  return out;
}

async function pdf(browser, vol, size) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  page.setDefaultTimeout(0);
  page.on('pageerror', e => console.error('  page error:', e.message));
  if (estimate) await page.route('**/vocabulary/data/words.json*', async route => {
    const res = await route.fetch(); route.fulfill({ response: res, contentType: 'application/json', body: JSON.stringify(fakeData(await res.json())) });
  });
  await page.addInitScript(() => { try { localStorage.setItem('pref-theme', 'light'); } catch (e) { } });
  const url = base + 'vocabulary/print/?vol=' + vol + '&size=' + size;
  const res = await page.goto(url, { waitUntil: 'load' });
  if (!res || !res.ok()) throw new Error('could not open ' + url + ' (' + (res && res.status()) + ')');
  await page.waitForFunction(() => window.__voPrintReady === true);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  const fitR = await page.evaluate(() => window.__voFit()); // re-fit under print media, then check
  const n = await page.$$eval('.vo-card-print', x => x.length);
  if (fitR.cards !== n) throw new Error('fit report covers ' + fitR.cards + ' of ' + n + ' cards');
  const lv = Object.keys(fitR.levels).sort((a, b) => a - b).map(k => 'level ' + k + ': ' + fitR.levels[k]).join(', ');
  console.log('  ' + size + ' vol ' + vol + ': ' + n + ' cards fit check: ' + (fitR.overflow.length ? fitR.overflow.length + ' OVERFLOW (' + fitR.overflow.join(', ') + ')' : 'all fit') + '; ' + lv);
  if (fitR.overflow.length) { await page.close(); throw new Error(fitR.overflow.length + ' card(s) do not fit at ' + size + ': ' + fitR.overflow.join(', ')); }
  const buf = checkOnly ? Buffer.alloc(0) : await page.pdf({ preferCSSPageSize: true, printBackground: true, format: size === 'a4' ? 'A4' : 'Letter' });
  await page.close();
  return { buf, cards: n };
}

function write(name, buf) { fs.writeFileSync(path.join(OUT, name), buf); console.log('  wrote static/vocabulary/' + name + ' (' + MB(buf.length) + ')'); }
function remove(name) { const f = path.join(OUT, name); if (fs.existsSync(f)) { fs.unlinkSync(f); console.log('  removed static/vocabulary/' + name); } }

(async () => {
  if (!estimate && !checkOnly) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const size of sizes) {
      const t0 = Date.now(), whole = await pdf(browser, 'all', size);
      if (checkOnly) continue;
      console.log(size + ': ' + whole.cards + ' cards, whole book ' + MB(whole.buf.length) + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)');
      if (estimate) { console.log('  ' + (whole.buf.length > LIMIT ? 'over 25 MB: the real run would split it into four volumes' : 'under 25 MB: the real run would keep one file')); continue; }
      if (whole.buf.length <= LIMIT) {
        write(NAME(size), whole.buf); [1, 2, 3, 4].forEach(v => remove(NAME(size, v)));
      } else {
        for (const v of [1, 2, 3, 4]) {
          const part = await pdf(browser, String(v), size);
          if (part.buf.length > LIMIT) console.warn('  note: volume ' + v + ' is ' + MB(part.buf.length) + ', over 25 MB');
          write(NAME(size, v), part.buf);
        }
        remove(NAME(size));
      }
    }
  } finally { await browser.close(); }
  if (checkOnly) console.log('Every card fits.'); else if (!estimate) console.log('Done. Rebuild the site so /vocabulary/print/ lists the files.');
})().catch(e => { console.error(e.message || e); process.exit(1); });
