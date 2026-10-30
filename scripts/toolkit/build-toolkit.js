#!/usr/bin/env node
/*
  The Teddy Rook toolkit: a zip of the practice engine and the content of the ladders listed in data/embed.json
  ("toolkit.ladders"), released as-is for developers (MIT for code, CC BY-NC 4.0 for content).

  Run after the build:   node scripts/toolkit/build-toolkit.js [public] [out dir]      → <out dir>/teddy-rook-toolkit.zip
  (defaults: public, toolkit-dist). Needs the `zip` command (on GitHub's Ubuntu runners already).
  Published by .github/workflows/toolkit-release.yml to the GitHub release "toolkit".

  From the built site it reads the ladders' config (the ml-cfg of /embed/practice/), the graph (/math/graph.json) and
  the Family Study units (/homeschool/family/units.*.json), so no YAML parser is needed. Everything else comes from the
  source: static/ (engine, generators, visuals) and data/ (topic maps, lessons, words).

  WITHHELD MATERIAL (data/embed.json "withheld"): anything that links to or contains one of its paths is cleaned out
  (sentences and source entries pointing there are dropped), and the build fails if any trace is left. When the owner
  clears it, delete that entry from "withheld"; nothing else needs to change for the links to come back.
  The template files (README, licenses, example page) are in scripts/toolkit/files/.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PUB = path.resolve(process.argv[2] || path.join(ROOT, 'public'));
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'toolkit-dist'));
const SITE = 'https://teddyrookbook.com';
const NAME = 'teddy-rook-toolkit';
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'embed.json'), 'utf8'));
const LADS = C.toolkit.ladders;
const WH = [].concat(...(C.withheld || []).map(w => w.paths || []));

function die(m) { console.error('build-toolkit: ' + m); process.exit(1); }
function read(p) { return fs.readFileSync(p, 'utf8'); }
if (!fs.existsSync(path.join(PUB, 'index.html'))) die('no built site at ' + PUB + ' (run hugo first)');

/* ---------- inputs from the build ---------- */
const prac = read(path.join(PUB, 'embed', 'practice', 'index.html'));
const m = /<script[^>]*\bid=["']?ml-cfg["']?[^>]*>([\s\S]*?)<\/script>/.exec(prac);
if (!m) die('no ml-cfg in /embed/practice/');
const cfg = JSON.parse(m[1]);
const graph = JSON.parse(read(path.join(PUB, cfg.graph.replace(/^\/+/, '').replace(/[?#].*$/, ''))));
const famDir = path.join(PUB, 'homeschool', 'family');
const famFile = fs.readdirSync(famDir).find(f => /^units\..*\.json$/.test(f) || f === 'units.json');
if (!famFile) die('no Family Study units JSON in ' + famDir);
const fam = JSON.parse(read(path.join(famDir, famFile)));

/* ---------- what's in ---------- */
const ladders = (cfg.ladders || []).filter(l => LADS.includes(l.key));
if (ladders.length !== LADS.length) die('ladders missing from the site config: ' + LADS.filter(k => !ladders.some(l => l.key === k)).join(', '));
const dirs = ladders.map(l => l.dir);
const courses = (cfg.courses || []).filter(c => dirs.includes(c.dir || 'math'));
const CK = new Set(courses.map(c => c.key));

/* ---------- cleaning ---------- */
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function cleanHTML(s) {
  if (typeof s !== 'string') return s;
  for (const p of WH) {
    const x = reEsc(p);
    s = s.replace(new RegExp('<li>(?:(?!</li>)[\\s\\S])*?href=\\\\?"[^"]*' + x + '[\\s\\S]*?</li>', 'g'), '');
    s = s.replace(new RegExp('\\s*[^.!?>]*<a [^>]*href=\\\\?"[^"]*' + x + '[^"]*"[^>]*>[\\s\\S]*?</a>[^.!?<]*[.!?]', 'g'), '');
  }
  // site links become full addresses, so they work from the toolkit
  return s.replace(/(href|src)="\/(?!\/)/g, '$1="' + SITE + '/');
}
function cleanDeep(v) {
  if (typeof v === 'string') return cleanHTML(v);
  if (Array.isArray(v)) return v.filter(x => !(x && typeof x === 'object' && !Array.isArray(x) && typeof x.url === 'string' && WH.some(p => x.url.includes(p)))).map(cleanDeep);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = (k === 'url' && typeof v[k] === 'string' && v[k].startsWith('/')) ? SITE + v[k] : cleanDeep(v[k]); return o; }
  return v;
}
function unitURLs(v) { // units keep [title, url] pairs: make the urls full addresses
  if (typeof v === 'string') return v.startsWith('/') && !v.startsWith('//') ? SITE + v : v;
  if (Array.isArray(v)) return v.map(unitURLs);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = unitURLs(v[k]); return o; }
  return v;
}

/* ---------- stage ---------- */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trb-toolkit-'));
const D = path.join(tmp, NAME);
let files = 0;
function put(rel, data) { const p = path.join(D, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); files++; }
function copy(srcRel, dstRel) { put(dstRel || srcRel, fs.readFileSync(path.join(ROOT, srcRel))); }
function copyDir(srcRel, dstRel, filter) {
  const s = path.join(ROOT, srcRel); if (!fs.existsSync(s)) return;
  for (const f of fs.readdirSync(s, { withFileTypes: true })) {
    if (f.isDirectory()) copyDir(path.join(srcRel, f.name), path.join(dstRel || srcRel, f.name), filter);
    else if (!filter || filter(f.name)) copy(path.join(srcRel, f.name), path.join(dstRel || srcRel, f.name));
  }
}
const code = n => /\.(js|css)$/.test(n);

// the engine
copyDir('static/math/core', 'math/core', code);
copy('static/math/math.css', 'math/math.css');
copy('static/homeschool/calc/cas.js', 'homeschool/calc/cas.js');
copyDir('static/math/viz', 'math/viz', code);
// each ladder: generators and visuals (and Geography's map data and vendored d3-geo)
for (const l of ladders) {
  copyDir('static/' + l.dir + '/gen', l.dir + '/gen', code);
  copyDir('static/' + l.dir + '/viz', l.dir + '/viz', code);
  if (l.dir === 'geog') { copyDir('static/geog/data', 'geog/data'); copyDir('static/geog/vendor', 'geog/vendor'); }
}
// content: topic maps and lessons (cleaned), courses, ladders, graph
for (const l of ladders) {
  for (const sub of ['topics', 'lessons']) {
    const dir = path.join(ROOT, 'data', l.dir, sub); if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.json')) put(path.join('content', l.dir, sub, f), JSON.stringify(cleanDeep(JSON.parse(read(path.join(dir, f))))));
  }
}
copy('data/vocab/list.json', 'content/vocab/list.json');
copy('data/vocab/roots.json', 'content/vocab/roots.json');
for (const f of fs.readdirSync(path.join(ROOT, 'data/vocab/words'))) if (f.endsWith('.json')) put('content/vocab/words/' + f, JSON.stringify(cleanDeep(JSON.parse(read(path.join(ROOT, 'data/vocab/words', f))))));
put('content/family/units.json', JSON.stringify({ about: 'Family Study units from teddyrookbook.com/homeschool/family/. Topic ids (A, B, C, D: ages 5-7, 8-10, 11-13, 14-18) from ladders not in this toolkit are not in graph.js.', units: cleanDeep(unitURLs(fam.units)) }, null, 1));

const abs = u => (typeof u === 'string' && u.startsWith('/') ? SITE + u : u);
const gCourses = (graph.courses || []).filter(c => CK.has(c.key)).map(c => Object.assign({}, c, { url: abs(c.url), dir: (courses.find(x => x.key === c.key) || {}).dir || 'math', ladder: c.ladder || 'math' }));
const ids = new Set((graph.topics || []).filter(t => CK.has(t.course)).map(t => t.id));
const gTopics = (graph.topics || []).filter(t => ids.has(t.id)).map(t => Object.assign({}, t, { url: abs(t.url), prereqs: (t.prereqs || []).filter(p => ids.has(p)) }));
const G = { courses: gCourses, topics: gTopics };
put('graph.js', '/* Every course and topic of the toolkit\'s ladders, in teaching order (CC BY-NC 4.0, Teddy Rook Book). */\nwindow.TRB_GRAPH = ' + JSON.stringify(G) + ';\n');
put('content/courses.json', JSON.stringify(gCourses, null, 1));
put('content/ladders.json', JSON.stringify(ladders.map(l => ({ key: l.key, title: l.title, short: l.short, icon: l.icon, color: l.color, dir: l.dir, url: abs(l.url) })), null, 1));
const pick = (o, ks) => { const r = {}; for (const k of Object.keys(o || {})) if (ks.has(k)) r[k] = o[k]; return r; };
const vbKeys = new Set(['basic', 'adv', 'basic.css', 'adv.css'].concat(...dirs.map(d => [d, d + '.css'])));
const tcfg = {
  base: './', root: './', ladder: 'math', page: 'toolkit', graph: 'graph.js',
  ladders: ladders.map(l => ({ key: l.key, slug: l.slug, title: l.title, short: l.short, icon: l.icon, color: l.color, url: abs(l.url), dir: l.dir })),
  gen: pick(cfg.gen, CK), viz: pick(cfg.viz, CK), vb: pick(cfg.vb, vbKeys),
  courses: courses.map(c => Object.assign({}, c, { url: abs(c.url) }))
};
put('cfg.js', '/* Where the toolkit\'s files are, for the engine (MathLadder.cfg). Numbers are cache-busting versions. */\nwindow.MathLadder = window.MathLadder || {};\nwindow.MathLadder.cfg = ' + JSON.stringify(tcfg) + ';\n');
// every file the config promises must be here
for (const k of Object.keys(tcfg.gen)) { const d = (courses.find(c => c.key === k) || {}).dir || 'math'; if (!fs.existsSync(path.join(D, d, 'gen', k + '.js'))) die('missing generator ' + d + '/gen/' + k + '.js'); }

// the template files
const date = new Date().toISOString().slice(0, 10);
for (const f of fs.readdirSync(path.join(__dirname, 'files'))) {
  let s = read(path.join(__dirname, 'files', f));
  s = s.replace(/\{\{DATE\}\}/g, date).replace(/\{\{LADDERS\}\}/g, ladders.map(l => l.title.replace(/ Ladder$/, '')).join(', '));
  put(f, s);
}

/* ---------- checks: no withheld material, nothing from left-out sources ---------- */
(function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { scan(p); continue; }
    if (!/\.(js|json|css|html|md)$/.test(f.name)) continue;
    const s = read(p), rel = path.relative(D, p);
    for (const w of WH) if (s.includes(w)) die(rel + ' still refers to withheld material (' + w + ')');
    if (/hs_hannah|hannahwardeducation/i.test(s)) die(rel + ' refers to Hannah Ward\'s material');
    if (/\/lang\/data\//.test(s) && !/^(NOTICE|README)/.test(f.name)) die(rel + ' refers to the language data');
    if (/markets\/data\//.test(s)) die(rel + ' refers to the Markets data');
  }
})(D);

/* ---------- zip ---------- */
fs.mkdirSync(OUT, { recursive: true });
const zip = path.join(OUT, NAME + '.zip');
if (fs.existsSync(zip)) fs.unlinkSync(zip);
execFileSync('zip', ['-q', '-r', '-9', '-X', zip, NAME], { cwd: tmp });
fs.rmSync(tmp, { recursive: true, force: true });
const mb = n => (n / 1048576).toFixed(1) + ' MB';
console.log('Toolkit: ' + path.relative(process.cwd(), zip) + ', ' + files + ' files, ' + ladders.length + ' ladders, ' + courses.length + ' courses, ' + gTopics.length + ' topics; ' + mb(fs.statSync(zip).size));
