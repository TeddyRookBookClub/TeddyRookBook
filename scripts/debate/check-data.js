#!/usr/bin/env node
/* Checks data/debate/: every topic has both sides at equal depth, no empty fields, sources present;
   formats have whole-second times and sources; Logic Ladder links and fallacy names are real; house words.
   Run: node scripts/debate/check-data.js   (exit code 1 on any error; warnings don't fail) */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../..');
const D = path.join(ROOT, 'data/debate');
const errors = [], warnings = [];
function err(where, msg) { errors.push(where + ': ' + msg); }
function warn(where, msg) { warnings.push(where + ': ' + msg); }
function load(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { err(path.relative(ROOT, p), 'not valid JSON (' + e.message + ')'); return null; } }
function dirJson(d) {
  const dir = path.join(D, d);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => ({ file: d + '/' + f, data: load(path.join(dir, f)) })).filter(x => x.data);
}
// fields that may be blank (a reading with no known date, an empty note); reported as warnings
const OPTIONAL = /(^|\.)(reading|sources)\[\d+\]\.(date|publisher|note|leans_note)$|\.note$/;
const str = v => typeof v === 'string' && v.trim().length > 0;
// every string anywhere in a value must have text; arrays must not be empty unless allowed
function noEmpty(where, v, keyPath, allowEmpty) {
  if (typeof v === 'string') { if (!v.trim()) (OPTIONAL.test(keyPath) ? warn : err)(where, 'empty text at ' + keyPath); return; }
  if (Array.isArray(v)) { if (!v.length && !allowEmpty.includes(keyPath.replace(/\[\d+\]/g, '[]'))) err(where, 'empty list at ' + keyPath); v.forEach((x, i) => noEmpty(where, x, keyPath + '[' + i + ']', allowEmpty)); return; }
  if (v && typeof v === 'object') for (const k of Object.keys(v)) noEmpty(where, v[k], keyPath ? keyPath + '.' + k : k, allowEmpty);
}

/* ---------- Logic Ladder names and links ---------- */
const logic = load(path.join(ROOT, 'data/logic/topics/informal.json')) || { topics: [] };
const courses = fs.readFileSync(path.join(ROOT, 'data/logic/courses.yaml'), 'utf8');
const courseSlug = {}; courses.replace(/- key: (\w+)\s+slug: ([\w-]+)/g, (m, k, s) => { courseSlug[k] = s; });
const logicPages = new Set(['/logic/']);
for (const k of Object.keys(courseSlug)) {
  const t = load(path.join(ROOT, 'data/logic/topics', k + '.json'));
  logicPages.add('/logic/' + courseSlug[k] + '/');
  ((t && t.topics) || []).forEach(x => logicPages.add('/logic/' + courseSlug[k] + '/' + x.slug + '/'));
}
const logicTitle = {}; logic.topics.forEach(t => { logicTitle[t.slug] = t.title; });
// site links inside data: Logic Ladder pages must exist; other sections must at least be real top-level sections
const sections = new Set(fs.readdirSync(path.join(ROOT, 'content')).map(s => s.replace(/\.md$/, '')));
function checkLink(where, u) {
  if (typeof u !== 'string' || !u.startsWith('/')) return;
  if (u.startsWith('/logic/') && !logicPages.has(u.split('#')[0])) err(where, 'Logic Ladder link not found: ' + u);
  const top = u.split('/')[1];
  if (top && !sections.has(top) && top !== 'debate') warn(where, 'link to an unknown section: ' + u);
}
function walkLinks(where, v) {
  if (typeof v === 'string') { (v.match(/\]\((\/[^)\s]+)\)/g) || []).forEach(m => checkLink(where, m.slice(2, -1))); return; }
  if (Array.isArray(v)) return v.forEach(x => walkLinks(where, x));
  if (v && typeof v === 'object') for (const k of Object.keys(v)) { if ((k === 'u' || k === 'url' || k === 'site') && typeof v[k] === 'string') checkLink(where, v[k]); else walkLinks(where, v[k]); }
}

/* ---------- house words ---------- */
const BANNED = [/\bgenuinely\b/i, /\bhonestly\b/i, /\bstraightforward\b/i, /\bbook club\b/i];
function words(where, v) {
  const s = JSON.stringify(v);
  BANNED.forEach(re => { const m = s.match(re); if (m) err(where, 'house style: avoid "' + m[0] + '"'); });
}

/* ---------- meta ---------- */
const meta = load(path.join(D, 'meta.json')) || { levels: [], categories: [] };
const LEVELS = new Set((meta.levels || []).map(x => x.key)), CATS = new Set((meta.categories || []).map(x => x.key));
if (!LEVELS.size || !CATS.size) err('meta.json', 'levels and categories needed');

/* ---------- formats ---------- */
const formats = dirJson('formats');
const fkeys = new Set();
for (const { file, data: f } of formats) {
  fkeys.add(f.key);
  ['key', 'slug', 'name', 'short', 'summary'].forEach(k => { if (!str(f[k])) err(file, 'missing ' + k); });
  if (!Array.isArray(f.sources) || !f.sources.length) err(file, 'no sources');
  (f.sources || []).forEach((s, i) => { if (!str(s.title) || !str(s.url)) err(file, 'source ' + i + ' needs a title and url'); if (!str(s.date) && !str(s.accessed)) err(file, 'source ' + i + ' needs a date'); });
  if (!str(f.checked)) warn(file, 'no "checked" date');
  const speeches = f.speeches || [];
  if (f.family !== 'related' && !speeches.length) err(file, 'no speeches');
  const sideIds = new Set((f.sides || []).map(s => s.id).concat(['both', 'any', 'all']));
  speeches.forEach((s, i) => {
    if (!Number.isInteger(s.seconds) || s.seconds <= 0) err(file, `speech ${i} (${s.short}) needs whole seconds`);
    if (!str(s.name) || !str(s.short) || !str(s.kind)) err(file, `speech ${i} needs name, short and kind`);
    if (!sideIds.has(s.side)) err(file, `speech ${i} (${s.short}) has unknown side "${s.side}"`);
    if (s.asker && !sideIds.has(s.asker)) err(file, `speech ${i} has unknown asker "${s.asker}"`);
  });
  if (f.prep && f.prep.seconds != null && !Number.isInteger(f.prep.seconds)) err(file, 'prep seconds must be whole');
  if (f.repeat && f.repeat.from != null && !(f.repeat.from >= 0 && f.repeat.from < speeches.length)) err(file, 'repeat.from out of range');
  walkLinks(file, f); words(file, f);
}

/* ---------- topics ---------- */
const topics = dirJson('topics');
const ALLOW_EMPTY = ['disputed', 'links'];
const slugs = new Set();
for (const { file, data: t } of topics) {
  ['key', 'slug', 'title', 'resolution', 'kind', 'level', 'category', 'summary', 'updated'].forEach(k => { if (!str(t[k])) err(file, 'missing ' + k); });
  if (slugs.has(t.slug)) err(file, 'duplicate slug ' + t.slug); slugs.add(t.slug);
  if (t.level && !LEVELS.has(t.level)) err(file, 'unknown level ' + t.level);
  if (t.category && !CATS.has(t.category)) err(file, 'unknown category ' + t.category);
  if (!/^(policy|value|fact)$/.test(t.kind || '')) err(file, 'kind must be policy, value or fact');
  (t.formats || []).forEach(k => { if (fkeys.size && !fkeys.has(k)) err(file, 'unknown format ' + k); });
  noEmpty(file, t, '', ALLOW_EMPTY);
  const aff = t.sides && t.sides.aff, neg = t.sides && t.sides.neg;
  if (!aff || !neg) { err(file, 'needs sides.aff and sides.neg'); continue; }
  const na = (aff.args || []).length, nn = (neg.args || []).length;
  if (na !== nn) err(file, `sides unequal: ${na} affirmative arguments, ${nn} negative`);
  if (na < 3 || na > 5 || nn < 3 || nn > 5) err(file, 'each side needs 3 to 5 arguments');
  [['aff', aff], ['neg', neg]].forEach(([k, s]) => {
    if (!str(s.label) || !str(s.stance)) err(file, k + ' needs a label and stance');
    (s.args || []).forEach((a, i) => ['claim', 'warrant', 'evidence', 'response'].forEach(f => { if (!str(a[f])) err(file, `${k} argument ${i + 1} missing ${f}`); }));
  });
  // equal depth: total words on each side within 35% of each other
  const wc = s => JSON.stringify(s.args || []).split(/\s+/).length;
  const wa = wc(aff), wn = wc(neg);
  if (Math.max(wa, wn) > 1.35 * Math.min(wa, wn)) warn(file, `sides differ in depth: ${wa} vs ${wn} words`);
  const per = (list, key) => ['aff', 'neg'].map(s => (list || []).filter(x => x[key] === s).length);
  const sm = per(t.strawmen, 'target');
  if (sm[0] !== sm[1] || !sm[0]) err(file, `strawmen per side unequal or missing: ${sm.join(' vs ')}`);
  (t.strawmen || []).forEach((s, i) => ['target', 'strawman', 'why', 'steelman'].forEach(f => { if (!str(s[f])) err(file, `strawman ${i + 1} missing ${f}`); }));
  const wk = per(t.weak, 'side');
  if (wk[0] !== wk[1] || !wk[0]) err(file, `weak arguments per side unequal or missing: ${wk.join(' vs ')}`);
  const cx = t.cx || {};
  if (!(cx.aff || []).length || (cx.aff || []).length !== (cx.neg || []).length) err(file, 'cross-examination questions must be equal for both sides');
  const reading = t.reading || [];
  if (!reading.length) err(file, 'no reading list');
  const leans = new Set(reading.map(r => r.leans));
  if (!(leans.has('both') || leans.has('neutral') || (leans.has('aff') && leans.has('neg')))) err(file, 'reading list needs sources for both sides (aff and neg, or both/neutral)');
  if (leans.has('aff') !== leans.has('neg') && !leans.has('both')) err(file, 'reading list leans one way only');
  reading.forEach((r, i) => { if (!str(r.title) || !str(r.url)) err(file, `reading ${i + 1} needs a title and url`); });
  const src = t.sources || [];
  if (!src.length) err(file, 'no sources');
  const ids = new Set(src.map(s => s.id));
  src.forEach((s, i) => { if (!str(s.id) || !str(s.title) || !str(s.url)) err(file, `source ${i + 1} needs id, title and url`); if (!str(s.date) && !str(s.accessed)) err(file, `source ${i + 1} needs a date`); });
  (t.background || []).forEach((b, i) => {
    if (!(b.src || []).length) err(file, `background paragraph ${i + 1} has no source`);
    (b.src || []).forEach(id => { if (!ids.has(id)) err(file, `background paragraph ${i + 1} cites unknown source "${id}"`); });
  });
  if (!(t.background || []).length) err(file, 'no background');
  (t.disputed || []).forEach((d, i) => { if ((d.positions || []).length < 2) err(file, `disputed question ${i + 1} needs at least two positions`); });
  walkLinks(file, t); words(file, t);
}
const nt = topics.length;
if (nt < 40 || nt > 60) (nt >= 1 && nt < 40 ? warn : err)('topics', `${nt} topics (the brief asks for 40 to 60)`);
if (nt) {
  for (const l of LEVELS) if (!topics.some(x => x.data.level === l)) warn('topics', 'no topics at level ' + l);
  for (const c of CATS) if (!topics.some(x => x.data.category === c)) warn('topics', 'no topics in category ' + c);
}

/* ---------- chapters, fallacies, glossary, resources ---------- */
for (const { file, data: c } of dirJson('chapters')) {
  ['key', 'slug', 'title', 'summary'].forEach(k => { if (!str(c[k])) err(file, 'missing ' + k); });
  if (!(c.sections || []).length) err(file, 'no sections');
  if (!(c.sources || []).length) err(file, 'no sources');
  walkLinks(file, c); words(file, c);
}
const fp = path.join(D, 'fallacies.json');
if (fs.existsSync(fp)) {
  let fl = load(fp); fl = Array.isArray(fl) ? fl : ((fl && fl.fallacies) || []);
  fl.forEach((f, i) => {
    if (!logicTitle[f.slug]) err('fallacies.json', `${f.slug}: not a Logic Ladder informal-logic topic`);
    else if (f.name !== logicTitle[f.slug]) err('fallacies.json', `${f.slug}: name "${f.name}" should be "${logicTitle[f.slug]}"`);
    if (f.url && f.url !== '/logic/informal-logic/' + f.slug + '/') err('fallacies.json', `${f.slug}: url should be /logic/informal-logic/${f.slug}/`);
  });
  words('fallacies.json', fl);
} else warn('fallacies.json', 'missing');
const gp = path.join(D, 'glossary.json');
if (fs.existsSync(gp)) {
  const g = load(gp) || {};
  const terms = g.terms || [];
  if (terms.length < 100) err('glossary.json', terms.length + ' terms (100+ needed)');
  const seen = new Set();
  terms.forEach((t, i) => { if (!str(t.term) || !str(t.def)) err('glossary.json', `term ${i + 1} needs term and def`); const k = String(t.term).toLowerCase(); if (seen.has(k)) err('glossary.json', 'duplicate term ' + t.term); seen.add(k); });
  terms.forEach(t => (t.see || []).forEach(s => { if (!seen.has(String(s).toLowerCase())) warn('glossary.json', `${t.term}: "see" term "${s}" isn't in the glossary`); }));
  walkLinks('glossary.json', g); words('glossary.json', g);
} else warn('glossary.json', 'missing');
const rp = path.join(D, 'resources.json');
if (fs.existsSync(rp)) { const r = load(rp); walkLinks('resources.json', r); words('resources.json', r); } else warn('resources.json', 'missing');

/* ---------- report ---------- */
warnings.forEach(w => console.log('warning  ' + w));
errors.forEach(e => console.log('ERROR    ' + e));
console.log(`check-data: ${formats.length} formats, ${nt} topics; ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
