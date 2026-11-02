#!/usr/bin/env node
/* Checks the competition data (formats: layouts/comp/ and the header of static/comp/comp.js).
     data/comp/putnam/<year>.yaml                     Putnam solutions guide
     data/comp/imo/<year>.yaml                        IMO solutions guide (ids P1-P6, `day` 1 for P1-P3, 2 for P4-P6)
     data/comp/schweitzer/<year>.yaml                 Schweitzer selection: Putnam format, ids P1-P12, `total` (size of the
                                                      year's set), optional `language`, links on the approved Szeged host,
                                                      every listed problem ready (areas may include topology)
     data/comp/common-test/physics-<year>[-makeup].yaml  Common Test physics guide
     data/comp/tokyo-tech/physics-<year>.yaml         Tokyo Tech (Institute of Science Tokyo) physics guide: same format, but
                                                      links.problems on admissions.isct.ac.jp, links.page required,
                                                      no answer key (answers are our results), main exam only
     data/comp/original/math/<id>.yaml                original math challenges
     data/comp/tripos/<file>.yaml                     Cambridge Mathematical Tripos papers and collections (public domain):
                                                      kind paper|collection, full `statement`s allowed, but every problem
                                                      must carry a scan source published before 1900 (layouts/comp/tpaper.html)
   Checks: required fields, unique ids, status values, areas, difficulty, viz files exist (static/comp/viz/<id>.js),
   links are https, topic labels at most 10 words, challenge answers parse and choice answers are in range,
   and a copyright guard: a solution (or hint) must not contain a run of 12 or more words that also appears in a
   `topic` or `problem` field of ANOTHER file (a sign that a statement was copied into a solution). A `statement`
   field (a full problem statement) is allowed only in the Tripos files, which are exempt as public domain: each
   must name its archive.org scan and a publication year before 1900, or it is an error.
   Usage: node scripts/comp/check-comp.js [site root]   Exit code 1 on errors. Needs python3 with PyYAML. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const D = (...p) => path.join(ROOT, 'data', 'comp', ...p);
const errs = [], warns = [];
const err = (f, m) => errs.push(rel(f) + ': ' + m), warn = (f, m) => warns.push(rel(f) + ': ' + m);
const rel = f => path.relative(ROOT, f);

function loadYaml(files) {
  if (!files.length) return {};
  const py = 'import yaml,json,sys\nout={}\nfor f in sys.argv[1:]:\n  try: out[f]=yaml.safe_load(open(f,encoding="utf-8"))\n  except Exception as e: out[f]={"__error__":str(e)}\nprint(json.dumps(out,default=str))';
  return JSON.parse(cp.execFileSync('python3', ['-I', '-c', py, ...files], { encoding: 'utf8', maxBuffer: 64 << 20 }));
}
const list = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => /\.ya?ml$/.test(f)).map(f => path.join(d, f)) : [];

// the answer checker from the page itself
let CK = null;
try {
  const W = { matchMedia: () => ({ matches: false }), addEventListener() { }, localStorage: null };
  const doc = { readyState: 'complete', documentElement: { getAttribute() { return null; } }, currentScript: null, querySelectorAll: () => [], getElementById: () => null, addEventListener() { }, head: { appendChild() { } } };
  W.window = W; W.document = doc;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'static/comp/comp.js'), 'utf8'), { window: W, document: doc, console, Promise, JSON, Math, Date, MutationObserver: undefined });
  CK = W.CompCheck;
} catch (e) { errs.push('static/comp/comp.js: does not run: ' + e.message); }

const AREAS = new Set(['algebra', 'analysis', 'combinatorics', 'number-theory', 'geometry', 'probability', 'linear-algebra', 'calculus']);
const STATUS = new Set(['ready', 'coming']);
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const isStr = s => typeof s === 'string' && s.trim() !== '';
function https(f, where, u, required) {
  if (u == null || u === '') { if (required) err(f, where + ': missing link'); return; }
  if (!/^https:\/\/[^\s]+$/.test(String(u))) err(f, where + ': link must be https: ' + u);
}
function viz(f, where, id) {
  if (id == null) return;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(String(id))) return err(f, where + ': bad viz id "' + id + '"');
  if (!fs.existsSync(path.join(ROOT, 'static/comp/viz', id + '.js'))) err(f, where + ': viz file static/comp/viz/' + id + '.js is missing');
}
function topic(f, where, t) {
  if (!isStr(t)) return err(f, where + ': topic is required');
  if (words(t) > 10) err(f, where + ': topic has ' + words(t) + ' words (at most 10)');
}
function texBalanced(f, where, s) {
  if (typeof s !== 'string') return;
  const t = s.replace(/\\\$/g, '').replace(/\$\$[\s\S]*?\$\$/g, '');
  if ((t.match(/\$/g) || []).length % 2) err(f, where + ': odd number of $ (unclosed math?)');
}

// text fields for the copyright guard: { file, kind: 'src'|'sol', where, text }
const texts = [];
const addT = (file, kind, where, text) => { if (typeof text === 'string' && text.trim()) texts.push({ file, kind, where, text }); };

// ------------------------------------------------------------------ year guides: Putnam and IMO
const IMO_AREAS = new Set(['algebra', 'combinatorics', 'geometry', 'number-theory']);
const GUIDES = {
  putnam: { idRe: /^[AB][1-6]$/, idMsg: 'A1-A6 or B1-B6', areas: AREAS },
  imo: { idRe: /^P[1-6]$/, idMsg: 'P1-P6', areas: IMO_AREAS, day: true },
  // Schweitzer: a selection (only problems we solved), so every problem must be ready; `total` = problems in that year's set
  schweitzer: { idRe: /^P([1-9]|1[0-2])$/, idMsg: 'P1-P12', areas: new Set([...AREAS, 'topology']), selection: true },
};
const gcount = {};
let pf = [];
for (const [gk, G] of Object.entries(GUIDES)) {
const gf = list(D(gk)), PY = loadYaml(gf); gcount[gk] = gf.length; pf = pf.concat(gf);
for (const f of gf) {
  const y = PY[f], base = path.basename(f).replace(/\.ya?ml$/, '');
  if (!y || y.__error__) { err(f, 'YAML does not parse: ' + (y && y.__error__)); continue; }
  if (String(y.year) !== base) err(f, 'year ' + y.year + ' does not match the file name');
  https(f, 'links.problems', y.links && y.links.problems, true);
  https(f, 'links.archive', y.links && y.links.archive, false);
  if (gk === 'imo' && y.links && y.links.problems && !/^https:\/\/www\.imo-official\.org\//.test(y.links.problems)) err(f, 'links.problems must be on www.imo-official.org');
  if (gk === 'schweitzer') {
    ['problems', 'archive'].forEach(k => { const u = y.links && y.links[k]; if (!u || !/^https:\/\/www\.math\.u-szeged\.hu\/~mmaroti\/schweitzer\//.test(u)) err(f, 'links.' + k + ' must be on the approved host www.math.u-szeged.hu/~mmaroti/schweitzer/'); });
    if (!Number.isInteger(y.total) || y.total < 1) err(f, 'total (number of problems in the year\'s set) must be a positive integer');
    if (y.language != null && !['Hungarian', 'English'].includes(y.language)) err(f, 'language must be Hungarian or English');
  }
  if (!Array.isArray(y.problems) || !y.problems.length) { err(f, 'problems: missing or empty'); continue; }
  const seen = new Set();
  y.problems.forEach((p, i) => {
    const w = 'problem ' + (p && p.id || '#' + (i + 1));
    if (!p || !G.idRe.test(String(p.id))) err(f, w + ': id must be ' + G.idMsg);
    if (G.selection && p) {
      if (p.status !== 'ready') err(f, w + ': a selection lists only finished problems (status ready; leave the problem out instead of `coming`)');
      if (Number.isInteger(y.total) && +String(p.id).slice(1) > y.total) err(f, w + ': id is beyond total ' + y.total);
    }
    if (G.day && p && G.idRe.test(String(p.id))) { const d = +String(p.id).slice(1) <= 3 ? 1 : 2; if (p.day !== d) err(f, w + ': day must be ' + d); }
    if (seen.has(p.id)) err(f, w + ': duplicate id'); seen.add(p.id);
    topic(f, w, p.topic);
    if (!STATUS.has(p.status)) err(f, w + ': status must be ready or coming');
    if (p.areas != null) { if (!Array.isArray(p.areas)) err(f, w + ': areas must be a list'); else p.areas.forEach(a => { if (!G.areas.has(a)) err(f, w + ': unknown area "' + a + '"'); }); }
    if (p.difficulty != null && !(Number.isInteger(p.difficulty) && p.difficulty >= 1 && p.difficulty <= 5)) err(f, w + ': difficulty must be 1-5');
    if (p.status === 'ready') {
      if (!isStr(p.solution)) err(f, w + ': ready but no solution');
      if (!p.areas || !p.areas.length) err(f, w + ': ready but no areas');
      if (p.difficulty == null) err(f, w + ': ready but no difficulty');
      if (p.answer != null && !isStr(p.checked)) warn(f, w + ': has an answer but no `checked`');
    }
    if (p.hints != null && (!Array.isArray(p.hints) || p.hints.length > 3)) err(f, w + ': hints must be a list of at most 3');
    viz(f, w, p.viz);
    ['solution', 'answer', 'topic'].forEach(k => texBalanced(f, w + ' ' + k, p[k])); (p.hints || []).forEach((h, j) => texBalanced(f, w + ' hint ' + (j + 1), h));
    addT(f, 'src', w + ' topic', p.topic); addT(f, 'sol', w + ' solution', p.solution); (p.hints || []).forEach((h, j) => addT(f, 'sol', w + ' hint ' + (j + 1), h));
  });
}
}

// ------------------------------------------------------------------ Common Test and Tokyo Tech (same format)
const ctf = list(D('common-test')), ttf = list(D('tokyo-tech')), cf = ctf.concat(ttf), CY = loadYaml(cf);
for (const f of cf) {
  const tt = ttf.includes(f);
  const y = CY[f], base = path.basename(f).replace(/\.ya?ml$/, '');
  if (!y || y.__error__) { err(f, 'YAML does not parse: ' + (y && y.__error__)); continue; }
  const m = /^physics-(\d{4})(-makeup)?$/.exec(base);
  if (!m) { err(f, 'file name must be physics-<year>.yaml or physics-<year>-makeup.yaml'); continue; }
  if (String(y.year) !== m[1]) err(f, 'year ' + y.year + ' does not match the file name');
  const ex = y.exam || 'main';
  if (!['main', 'makeup'].includes(ex)) err(f, 'exam must be main or makeup');
  if ((ex === 'makeup') !== !!m[2]) err(f, 'exam: ' + ex + ' does not match the file name');
  https(f, 'links.problems', y.links && y.links.problems, true);
  if (tt) {
    https(f, 'links.page', y.links && y.links.page, true);
    https(f, 'links.intent', y.links && y.links.intent, false);
    if (ex !== 'main') err(f, 'Tokyo Tech: exam must be main');
    ['problems', 'page', 'intent'].forEach(k => { const u = y.links && y.links[k]; if (u && !/^https:\/\/(admissions\.isct\.ac\.jp|www\.isct\.ac\.jp|admissions\.titech\.ac\.jp|www\.titech\.ac\.jp)\//.test(u)) err(f, 'links.' + k + ' must be an official Institute of Science Tokyo / Tokyo Tech URL'); });
  } else https(f, 'links.answers', y.links && y.links.answers, true);
  if (!Array.isArray(y.questions) || !y.questions.length) { err(f, 'questions: missing or empty'); continue; }
  const qs = new Set(), ps = new Set();
  y.questions.forEach((q, i) => {
    const w = 'question ' + (q && q.id || '#' + (i + 1));
    if (!q || q.id == null) err(f, w + ': id is required');
    if (qs.has(String(q.id))) err(f, w + ': duplicate id'); qs.add(String(q.id));
    topic(f, w, q.topic); addT(f, 'src', w + ' topic', q.topic);
    if (!Array.isArray(q.parts) || !q.parts.length) return err(f, w + ': parts missing or empty');
    q.parts.forEach((p, j) => {
      const pw = 'part ' + (p && p.id || w + '#' + (j + 1));
      if (!p || p.id == null) err(f, pw + ': id is required');
      if (ps.has(String(p.id))) err(f, pw + ': duplicate id'); ps.add(String(p.id));
      if (!/^[A-Za-z0-9-]+$/.test(String(p.id))) err(f, pw + ': id may use letters, digits and hyphens only');
      topic(f, pw, p.topic);
      if (!STATUS.has(p.status)) err(f, pw + ': status must be ready or coming');
      if (p.status === 'ready') { if (!isStr(p.solution)) err(f, pw + ': ready but no solution'); if (p.answer == null || p.answer === '') err(f, pw + ': ready but no answer'); }
      viz(f, pw, p.viz);
      texBalanced(f, pw + ' solution', p.solution);
      addT(f, 'src', pw + ' topic', p.topic); addT(f, 'sol', pw + ' solution', p.solution); (p.hints || []).forEach((h, k) => addT(f, 'sol', pw + ' hint ' + (k + 1), h));
    });
  });
}

// ------------------------------------------------------------------ original math challenges
const of = list(D('original', 'math')), OY = loadYaml(of), cids = new Set();
for (const f of of) {
  const c = OY[f], base = path.basename(f).replace(/\.ya?ml$/, '');
  if (!c || c.__error__) { err(f, 'YAML does not parse: ' + (c && c.__error__)); continue; }
  const w = 'challenge ' + (c.id || base);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(String(c.id))) err(f, 'id must use lowercase letters, digits and hyphens');
  if (c.id !== base) err(f, 'id "' + c.id + '" must equal the file name "' + base + '"');
  if (cids.has(c.id)) err(f, 'duplicate id'); cids.add(c.id);
  if (!isStr(c.title)) err(f, 'title is required'); else if (words(c.title) > 10) err(f, 'title has more than 10 words');
  if (![1, 2, 3, 4].includes(c.tier)) err(f, 'tier must be 1, 2, 3 or 4');
  if (!STATUS.has(c.status)) err(f, 'status must be ready or coming');
  if (c.areas != null) { if (!Array.isArray(c.areas)) err(f, 'areas must be a list'); else c.areas.forEach(a => { if (!AREAS.has(a)) err(f, 'unknown area "' + a + '"'); }); }
  if (c.hints != null && (!Array.isArray(c.hints) || c.hints.length > 3)) err(f, 'hints must be a list of at most 3');
  viz(f, w, c.viz);
  ['problem', 'solution', 'answer', 'title'].forEach(k => texBalanced(f, k, c[k]));
  if (c.status === 'ready') {
    if (!isStr(c.problem)) err(f, 'ready but no problem');
    if (!isStr(c.solution)) err(f, 'ready but no solution');
    if (!c.areas || !c.areas.length) err(f, 'ready but no areas');
    const k = c.check || { type: 'proof' }, ty = k.type || 'proof';
    if (!['number', 'expression', 'choice', 'proof'].includes(ty)) err(f, 'check.type must be number, expression, choice or proof');
    if (ty !== 'proof' && !isStr(c.checked)) err(f, 'ready with a checked answer but no `checked` (how the answer was verified)');
    if (ty === 'choice') {
      if (!Array.isArray(k.choices) || k.choices.length < 2) err(f, 'check.choices: at least 2');
      else if (!(Number.isInteger(k.answer) && k.answer >= 1 && k.answer <= k.choices.length)) err(f, 'check.answer must be the 1-based number of a choice');
    }
    if ((ty === 'number' || ty === 'expression') && CK) {
      const vars = ty === 'expression' ? (k.vars || []) : [];
      if (ty === 'expression' && !vars.length) err(f, 'check.vars: list the variables of the expression');
      try {
        const V = {}; vars.forEach(v => V[v] = 2);
        const v = CK.value(String(k.answer), vars, V);
        if (!Number.isFinite(v)) err(f, 'check.answer does not evaluate to a finite number (at ' + JSON.stringify(V) + ')');
      } catch (e) { err(f, 'check.answer does not parse: ' + e.message); }
    }
  }
  addT(f, 'src', 'title', c.title); addT(f, 'src', 'problem', c.problem); addT(f, 'sol', 'solution', c.solution); (c.hints || []).forEach((h, j) => addT(f, 'sol', 'hint ' + (j + 1), h));
}

// ------------------------------------------------------------------ Cambridge Mathematical Tripos (public domain)
const TRIPOS_AREAS = new Set(['algebra', 'number-theory', 'combinatorics', 'geometry', 'conics', 'trigonometry', 'calculus', 'probability', 'mechanics', 'optics', 'hydrostatics', 'astronomy']);
const tf = list(D('tripos')), TY = loadYaml(tf), tslugs = new Set();
const pre1900 = (v) => { const m = /(1[0-9]{3})/.exec(String(v == null ? '' : v)); return m && +m[1] < 1900 ? +m[1] : 0; };
function tsource(f, w, s) {
  if (!s || typeof s !== 'object') return err(f, w + ': missing source');
  if (!/^[A-Za-z0-9._-]+$/.test(String(s.item || ''))) err(f, w + ': source.item must be an archive.org identifier');
  if (!isStr(s.title)) err(f, w + ': source.title is required');
  if (!pre1900(s.published)) err(f, w + ': copyright guard: source.published must give a year before 1900 (public domain), got "' + s.published + '"');
}
for (const f of tf) {
  const y = TY[f], base = path.basename(f).replace(/\.ya?ml$/, '');
  if (!y || y.__error__) { err(f, 'YAML does not parse: ' + (y && y.__error__)); continue; }
  if (!['paper', 'collection'].includes(y.kind)) err(f, 'kind must be paper or collection');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(String(y.slug))) err(f, 'slug must use lowercase letters, digits and hyphens');
  if (tslugs.has(y.slug)) err(f, 'duplicate slug'); tslugs.add(y.slug);
  if (!isStr(y.title)) err(f, 'title is required');
  if (y.kind === 'paper') {
    if (!pre1900(y.year)) err(f, 'copyright guard: year must be before 1900');
    if (!isStr(y.date)) err(f, 'date is required (day and hours of the paper, from the scan)');
    tsource(f, 'source', y.source);
    if (y.source && !Number.isInteger(y.source.leaf)) err(f, 'source.leaf (archive.org page index) must be an integer');
    if (y.source && !y.source.pages) err(f, 'source.pages is required');
  } else if (y.kind === 'collection') {
    if (!y.sources || typeof y.sources !== 'object') err(f, 'sources: missing');
    else Object.entries(y.sources).forEach(([k, s]) => tsource(f, 'sources.' + k, s));
  }
  if (!Array.isArray(y.problems) || !y.problems.length) { err(f, 'problems: missing or empty'); continue; }
  const seen = new Set();
  y.problems.forEach((p, i) => {
    const w = 'problem ' + (p && p.id || '#' + (i + 1));
    if (!p || !/^[a-z0-9][a-z0-9-]*$/.test(String(p.id))) err(f, w + ': id must use lowercase letters, digits and hyphens');
    if (seen.has(p.id)) err(f, w + ': duplicate id'); seen.add(p.id);
    topic(f, w, p.topic);
    if (!isStr(p.statement)) err(f, w + ': statement is required (the transcribed problem)');
    if (y.kind === 'collection') {
      if (!pre1900(p.year)) err(f, w + ': copyright guard: year must be before 1900');
      if (!y.sources || !y.sources[p.src]) err(f, w + ': src must name one of the file\'s sources');
      if (!Number.isInteger(p.leaf)) err(f, w + ': leaf (archive.org page index) must be an integer');
      ['paper', 'number', 'page'].forEach(k => { if (p[k] == null || p[k] === '') err(f, w + ': ' + k + ' is required (from the scan)'); });
    }
    if (!STATUS.has(p.status)) err(f, w + ': status must be ready or coming');
    if (p.areas != null) { if (!Array.isArray(p.areas)) err(f, w + ': areas must be a list'); else p.areas.forEach(a => { if (!TRIPOS_AREAS.has(a)) err(f, w + ': unknown area "' + a + '"'); }); }
    if (p.difficulty != null && !(Number.isInteger(p.difficulty) && p.difficulty >= 1 && p.difficulty <= 5)) err(f, w + ': difficulty must be 1-5');
    if (p.status === 'ready') {
      if (!isStr(p.solution)) err(f, w + ': ready but no solution');
      if (!p.areas || !p.areas.length) err(f, w + ': ready but no areas');
      if (p.difficulty == null) err(f, w + ': ready but no difficulty');
      if (p.answer != null && !isStr(p.checked)) warn(f, w + ': has an answer but no `checked`');
    }
    if (p.hints != null && (!Array.isArray(p.hints) || p.hints.length > 3)) err(f, w + ': hints must be a list of at most 3');
    viz(f, w, p.viz);
    ['statement', 'solution', 'answer', 'topic', 'note'].forEach(k => texBalanced(f, w + ' ' + k, p[k])); (p.hints || []).forEach((h, j) => texBalanced(f, w + ' hint ' + (j + 1), h));
    // statements are public domain (exempt from the guard); our solutions are still checked against other files
    addT(f, 'src', w + ' topic', p.topic); addT(f, 'sol', w + ' solution', p.solution); (p.hints || []).forEach((h, j) => addT(f, 'sol', w + ' hint ' + (j + 1), h));
  });
}
// a full `statement` anywhere else is a copyright error: only the Tripos (published before 1900) may carry one
{
  const others = [];
  const walk = d => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const q = path.join(d, e.name); if (e.isDirectory()) { if (q !== D('tripos')) walk(q); } else if (/\.ya?ml$/.test(e.name)) others.push(q); } };
  walk(D());
  const OY2 = loadYaml(others);
  const has = o => o && typeof o === 'object' && (Array.isArray(o) ? o.some(has) : Object.keys(o).some(k => k === 'statement' || has(o[k])));
  for (const f of others) if (has(OY2[f])) err(f, 'copyright guard: a `statement` field is allowed only in data/comp/tripos/ (public domain, before 1900)');
}

// ------------------------------------------------------------------ copyright guard
const N = 12;
const toks = s => s.toLowerCase().replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, ' ').replace(/[^a-z0-9'\s-]+/g, ' ').split(/\s+/).filter(Boolean);
const grams = new Map(); // gram -> Set(files)
for (const t of texts) if (t.kind === 'src') {
  const w = toks(t.text);
  for (let i = 0; i + N <= w.length; i++) { const g = w.slice(i, i + N).join(' '); if (!grams.has(g)) grams.set(g, new Set()); grams.get(g).add(t.file); }
}
for (const t of texts) if (t.kind === 'sol') {
  const w = toks(t.text);
  for (let i = 0; i + N <= w.length; i++) {
    const g = w.slice(i, i + N).join(' '), hit = grams.get(g);
    if (hit) { const other = [...hit].filter(x => x !== t.file); if (other.length) { err(t.file, t.where + ': copyright guard: a 12-word run also appears in a topic/problem of ' + other.map(rel).join(', ') + ': "' + g + '"'); break; } }
  }
}

const n = pf.length + cf.length + of.length + tf.length;
warns.forEach(w => console.log('warning: ' + w));
errs.forEach(e => console.log('ERROR: ' + e));
console.log(`check-comp: ${n} files (${gcount.putnam} Putnam, ${gcount.imo} IMO, ${gcount.schweitzer} Schweitzer, ${ctf.length} Common Test, ${ttf.length} Tokyo Tech, ${of.length} challenges, ${tf.length} Tripos), ${errs.length} errors, ${warns.length} warnings`);
process.exit(errs.length ? 1 : 0);
