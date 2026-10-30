#!/usr/bin/env node
/*
  The embed contract check. Run after the build:   node scripts/embed/check-embeds.js [public]

  Other sites put teddyrookbook.com/embed/… in frames on their pages, so those addresses must keep working. This reads
  the promised addresses and examples from data/embed.json (the same list /developers/ shows) and checks the built site:

  - every documented /embed/ page exists, is a whole page of its own (no site header) and is marked noindex;
  - every file those pages load from this site exists;
  - every example topic id resolves to a topic in the ladders' graph, with a generator file, and every example course
    key to a course with topics; every example word has its word page;
  - /embed/ stays out of the sitemap and the site search, and the service worker leaves it alone;
  - /developers/ exists.

  Exits with 1 and a list of what broke, so the deploy fails loudly instead of breaking other sites quietly.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PUB = path.resolve(process.argv[2] || path.join(ROOT, 'public'));
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'embed.json'), 'utf8'));
const bad = [];
let ok = 0;
function fail(msg) { bad.push(msg); }
function pass() { ok++; }
function file(rel) { return path.join(PUB, rel.replace(/^\/+/, '')); }
function page(u) { const p = u.replace(/[?#].*$/, ''); return file(p.endsWith('/') ? p + 'index.html' : p); }
function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } }
function scriptJSON(html, id) {
  const m = new RegExp('<script[^>]*\\bid=["\']?' + id + '["\']?[^>]*>([\\s\\S]*?)</script>').exec(html || '');
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return null; }
}
function slug(s) { return String(s).trim().toLowerCase().replace(/\s+/g, '-'); }

if (!fs.existsSync(path.join(PUB, 'index.html'))) { console.error('No built site at ' + PUB + ' (run hugo first)'); process.exit(1); }

/* 1. the pages */
const seen = new Set();
for (const e of C.embeds || []) {
  if (seen.has(e.path)) continue; seen.add(e.path);
  const html = read(page(e.path));
  if (!html) { fail(e.path + ' is missing from the build'); continue; }
  if (!/<meta[^>]+name=["']?robots["']?[^>]+noindex/i.test(html)) fail(e.path + ' is not marked noindex');
  if (/<header[^>]+class=["']?header\b/i.test(html)) fail(e.path + ' has the site header (it should be a page of its own)');
  if (!/emb-brand/.test(html)) fail(e.path + ' lost its "From Teddy Rook Book" link');
  // every local script and stylesheet it loads
  const re = /<(?:script|link)\b[^>]*?\b(?:src|href)=["']?([^"' >]+)/gi; let m;
  while ((m = re.exec(html))) {
    const u = m[1];
    if (/^(?:[a-z]+:)?\/\//i.test(u) && !/^(?:https?:)?\/\/(?:teddyrookbook\.com|localhost(?::\d+)?)\//i.test(u)) { fail(e.path + ' loads a file from another site: ' + u); continue; }
    const local = u.replace(/^(?:https?:)?\/\/[^/]+/i, '');
    if (!/\.(js|css)(\?|$)/.test(local)) continue;
    if (!fs.existsSync(file(local.replace(/[?#].*$/, '')))) fail(e.path + ' loads ' + local + ', which is missing');
  }
  pass();
}

/* 2. examples: topics, courses, words */
const prac = read(page('/embed/practice/'));
const cfg = scriptJSON(prac, 'ml-cfg');
let graph = null;
if (!cfg || !cfg.graph) fail('/embed/practice/ has no ladder config (ml-cfg)');
else {
  graph = (() => { try { return JSON.parse(read(file(cfg.graph.replace(/[?#].*$/, '')))); } catch (e) { return null; } })();
  if (!graph) fail('the ladders\' graph ' + cfg.graph + ' is missing or broken');
}
if (graph) {
  const T = new Map((graph.topics || []).map(t => [t.id, t]));
  const byCourse = {}; for (const t of graph.topics || []) (byCourse[t.course] = byCourse[t.course] || []).push(t);
  const dirOf = {}; for (const c of cfg.courses || []) dirOf[c.key] = c.dir || 'math';
  const topics = new Set((C.examples && C.examples.topics) || []);
  for (const e of C.embeds || []) { const q = new URLSearchParams(e.query || ''); if (q.get('topic')) topics.add(q.get('topic')); }
  for (const id of topics) {
    const t = T.get(id), k = id.split('.')[0];
    if (!t) { fail('example topic ' + id + ' is not in the ladders'); continue; }
    if (t.soon) fail('example topic ' + id + ' is marked "being written" (no practice yet)');
    if (!cfg.gen || !cfg.gen[k]) fail('example topic ' + id + ': its course ' + k + ' has no generator file');
    else if (!fs.existsSync(file(dirOf[k] + '/gen/' + k + '.js'))) fail('example topic ' + id + ': ' + dirOf[k] + '/gen/' + k + '.js is missing');
    if (!fs.existsSync(page(t.url))) fail('example topic ' + id + ': its page ' + t.url + ' is missing (the embed loads the lesson from it)');
    pass();
  }
  const courses = new Set((C.examples && C.examples.courses) || []);
  for (const e of C.embeds || []) { const q = new URLSearchParams(e.query || ''); if (q.get('course')) courses.add(q.get('course')); }
  for (const k of courses) {
    if (!(cfg.courses || []).some(c => c.key === k)) { fail('example course ' + k + ' is not a course key'); continue; }
    if (!(byCourse[k] || []).some(t => !t.soon)) fail('example course ' + k + ' has no topics ready to practice');
    pass();
  }
}
const words = scriptJSON(read(page('/embed/word/')), 'emb-words');
if (!Array.isArray(words) || !words.length) fail('/embed/word/ has no word list');
else {
  for (const w of (C.examples && C.examples.words) || []) {
    if (words.indexOf(slug(w)) < 0) fail('example word ' + w + ' is not in the word list');
    else if (!/id=["']?vw-entry/.test(read(page('/vocabulary/words/' + encodeURIComponent(slug(w)) + '/')) || '')) fail('example word ' + w + ': its word page has no entry');
    pass();
  }
  // a sample of the daily picks (the embed fetches the word's page)
  for (let i = 0; i < words.length; i += 97) if (!fs.existsSync(page('/vocabulary/words/' + encodeURIComponent(words[i]) + '/'))) fail('word page for ' + words[i] + ' is missing');
}
if (!/hc-card/.test(read(page('/embed/reading/')) || '')) fail('/embed/reading/ has no reading card');

/* 3. kept out of the sitemap, the search and the service worker */
const sm = read(file('sitemap.xml')) || '';
if (/\/embed\//.test(sm)) fail('/embed/ pages are in sitemap.xml');
const idx = read(file('index.json')) || '';
if (/"\/embed\//.test(idx) || /\\\/embed\\\//.test(idx)) fail('/embed/ pages are in the site search (index.json)');
const sw = read(file('sw.js'));
if (sw) {
  const m = /var SKIP = (\/.*\/);/.exec(sw);
  let skip = null; try { skip = m && new Function('return ' + m[1])(); } catch (e) { }
  if (!skip || !skip.test('/embed/practice/')) fail('the service worker (sw.js) no longer skips /embed/');
}
if (!fs.existsSync(page('/developers/'))) fail('/developers/ is missing');

if (bad.length) {
  console.error('Embed check FAILED (' + bad.length + '). Other sites frame these addresses; fix them before deploying:');
  for (const b of bad) console.error('  - ' + b);
  process.exit(1);
}
console.log('Embed check passed: ' + ok + ' checks on ' + seen.size + ' embed pages.');
