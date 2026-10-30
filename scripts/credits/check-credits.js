#!/usr/bin/env node
/*
  Credits check. Run after a build:   node scripts/credits/check-credits.js [public]

  Lists pages in sections that use outside material (scans, texts, pictures, data, fonts) but show no credits. A page
  passes if it has the "Sources and credits" block (class trb-cr, from layouts/_partials/credits-block.html and
  data/credits.yaml) or one of the sources sections pages already had before that block existed (listed in OWN below).
  Redirect pages and pages outside the site frame (/embed/) are skipped.

  SECTIONS says which pages must credit. EXCEPTIONS are known gaps, each with its reason; they are reported but don't fail.
  Exits with 1 when an unexpected gap is found. Not part of the deploy; run it by hand.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PUB = path.resolve(process.argv[2] || path.join(ROOT, 'public'));

// The ladders: their topic pages (/<ladder>/<course>/<topic>/) carry lessons with sources.
const LADDERS = ['math', 'physics', 'chemistry', 'biology', 'earth-and-space', 'economics', 'logic', 'writing', 'vocabulary',
  'american-history', 'geography', 'art', 'etiquette', 'egyptology', 'ancient-scripts'];
const LADDER_SKIP = ['/vocabulary/words/', '/vocabulary/print/', '/american-history/federalist-papers/', '/american-history/anti-federalist-papers/'];

// [path, how]: how = 'tree' (the path and everything under it), 'under' (only pages below it), 'exact' (that page only).
const SECTIONS = [
  ['/', 'exact'],                                   // verse of the day (ESV, Greek, Latin)
  ['/homeschool/mcguffey/', 'tree'], ['/homeschool/rays-arithmetic/', 'tree'], ['/homeschool/spelling-and-grammar/', 'tree'],
  ['/homeschool/writing/', 'tree'], ['/homeschool/latin/', 'tree'], ['/homeschool/greek/', 'tree'], ['/homeschool/geometry/', 'tree'],
  ['/homeschool/geography/', 'tree'], ['/homeschool/history/', 'tree'], ['/homeschool/science/', 'tree'], ['/homeschool/nature-study/', 'tree'],
  ['/homeschool/outdoor-skills/', 'tree'], ['/homeschool/old-exams/', 'under'], ['/homeschool/language-mix/', 'exact'],
  ['/homeschool/actual-reading/', 'tree'],          // Hannah Ward (Phonics Practice is original: see EXCEPTIONS)
  ['/harvard-classics/', 'tree'],
  ['/american-history/federalist-papers/', 'tree'], ['/american-history/anti-federalist-papers/', 'tree'], ['/american-history/ratification-debate/', 'exact'],
  ['/languages/', 'tree'],
  ['/geography/', 'tree'], ['/egypt/', 'tree'], ['/egyptology/', 'tree'], ['/art/gallery/', 'exact'], ['/art/flashcards/', 'exact'],
  ['/meal-prep/', 'tree'], ['/garden/', 'tree'], ['/sewing/', 'tree'], ['/trades/', 'tree'], ['/being-an-adult/', 'under'],
  ['/science-lab/', 'under'], ['/debate/topics/', 'under'], ['/debate/learn/', 'under'], ['/debate/formats/', 'under'],
  ['/business/', 'under'], ['/markets/', 'tree'], ['/music/songs/', 'under'], ['/test-prep/', 'tree'], ['/videos/', 'under'],
  ['/free-books/', 'exact'], ['/photocraft/', 'exact'], ['/asl/', 'tree'], ['/timeline/', 'exact'],
  ['/games/siege/', 'exact'], ['/games/thief/', 'exact'], ['/games/hero/', 'exact'],
  ['/games/thermopylae/', 'exact'], ['/games/daily/', 'exact'],
];

// Known gaps, with the reason. A prefix ending in "*" covers everything under it.
const EXCEPTIONS = {
  '/homeschool/actual-reading/phonics-practice/*': 'original word lists and stories made for this site; uses no outside material',
  '/science-lab/book-cart/': 'an original game; uses no outside material',
  '/languages/alphabet/': 'original lessons; audio is the device voice',
  '/etiquette/young-children/*': 'lessons with no sources recorded in data/etiquette/lessons/young.json (to check)',
  '/homeschool/science/balancing-physics/': 'an original physics lesson for the Book Cart game; uses no outside material',
  '/harvard-classics/export/print/': 'the print layout (no site frame); the colophon that hc-book.js writes into the book credits the Reading Guide, the Harvard Classics and the Internet Archive',
  '/business/cases/': 'the list of business cases; each case lists its sources',
  '/test-prep/ap/': 'the list of AP courses; each course names its sources',
  '/trades/': 'the list of trades courses; each course lists its sources',
  '/videos/plutarchs-languages/': 'no credits recorded in data/videos.yaml (to check)',
  '/videos/the-iliad-against-what-followed/': 'no credits recorded in data/videos.yaml (to check)',
};

// Sources sections that pages had before the shared block (class names, ids or heading text).
const OWN = ['mlp-sources', 'pp-src', 'lab-src', 'mp-src', 'tr-src', 'gd-src', 'sw-src', 'vd-credits', 'hc-src', 'tp-sources',
  'tp-hero-src', 'tp-cite', 'db-src', 'db-sources', 'td-sources', 'egat-src', 'egat-sources', 'bz-src', 'us-src', 'us-srcs', 'rd-src',
  'td-src', 'hi-src', 'sg-src', 'ml-songsrc', 'lang-credits', 'jc-credits', 'ar-credit', 'mk-foot', 'sh-foot', 'arpg-cr', 'cred'];
const OWN_RE = new RegExp('class="(?:[^"]* )?(?:' + OWN.join('|') + ')(?: [^"]*)?"');
const HEAD_RE = /<(h[1-6]|summary)\b[^>]*>\s*(?:<[^>]+>\s*)*(Sources\b|Sources and credits|Credit and licence|Texts, tools and credits|Where these come from)/i;
const LINE_RE = /(?:^|[>.]\s*)(?:<b>)?Sources?:(?:<\/b>)?\s/m;   // a "Source: …" or "Sources: …" line

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name === 'index.html') out.push(p);
  }
  return out;
}
function urlOf(file) { return '/' + path.relative(PUB, path.dirname(file)).split(path.sep).filter(Boolean).map(s => s + '/').join(''); }
function required(u) {
  for (const [p, how] of SECTIONS) {
    if (how === 'exact' && u === p) return p;
    if (how === 'tree' && u.startsWith(p)) return p;
    if (how === 'under' && u.startsWith(p) && u !== p) return p;
  }
  const parts = u.split('/').filter(Boolean);
  if (parts.length === 3 && LADDERS.includes(parts[0]) && !LADDER_SKIP.some(s => u.startsWith(s))) return '/' + parts[0] + '/ (ladder topic)';
  return null;
}
function excepted(u) {
  for (const k of Object.keys(EXCEPTIONS)) if (k.endsWith('*') ? u.startsWith(k.slice(0, -1)) : u === k) return EXCEPTIONS[k];
  return null;
}

if (!fs.existsSync(PUB)) { console.error('No build at ' + PUB); process.exit(2); }
const files = walk(PUB, []);
const gaps = [], known = {}; let checked = 0, block = 0, own = 0;
for (const f of files) {
  const u = urlOf(f);
  if (u.startsWith('/embed/')) continue;
  const why = required(u); if (!why) continue;
  const html = fs.readFileSync(f, 'utf8');
  if (/<meta http-equiv="refresh"/i.test(html) && html.length < 2000) continue;   // an alias redirect
  checked++;
  const main = (html.match(/<main[\s\S]*<\/main>/) || [html])[0].replace(/<script[\s\S]*?<\/script>/g, '');
  if (main.includes('class="trb-cr')) { block++; continue; }
  if (OWN_RE.test(main) || HEAD_RE.test(main) || LINE_RE.test(main)) { own++; continue; }
  const ex = excepted(u);
  if (ex) { (known[ex] = known[ex] || []).push(u); continue; }
  gaps.push([u, why]);
}

console.log(`Credits check: ${checked} pages in sections that use outside material; ${block} show the Sources and credits block, ${own} their own sources section.`);
const kn = Object.entries(known);
if (kn.length) {
  console.log(`\nKnown exceptions (${kn.reduce((n, [, l]) => n + l.length, 0)} pages):`);
  for (const [why, l] of kn) console.log(`  ${l.length} page${l.length > 1 ? 's' : ''}: ${why}\n    e.g. ${l.slice(0, 3).join(', ')}`);
}
if (gaps.length) {
  console.log(`\nGaps: ${gaps.length} page${gaps.length > 1 ? 's' : ''} with no credits:`);
  const by = {};
  for (const [u, w] of gaps) (by[w] = by[w] || []).push(u);
  for (const [w, l] of Object.entries(by)) console.log(`  ${w}: ${l.length}\n    ${l.slice(0, 8).join('\n    ')}${l.length > 8 ? '\n    …' : ''}`);
  process.exit(1);
}
console.log('\nNo gaps.');
