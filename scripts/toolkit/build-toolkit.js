#!/usr/bin/env node
/*
  The Teddy Rook toolkit: a zip of the practice engine and the content of the ladders listed in data/embed.json
  ("toolkit.ladders"), and the language packs, released as-is for developers (MIT for code, CC BY-NC 4.0 for content;
  each language pack keeps the license of its sources).

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

  LANGUAGE PACKS (data/embed.json "toolkit.packs"): greek/, latin/, classical/, english-kjv/, tools/alphabet/ and
  tools/hieroglyphs/, each with its own LICENSE and CREDITS.md written from data/embed.json "sources", plus the language
  example (language.html, from scripts/toolkit/lang/). The English is the King James Version: the build fails if any ESV
  verse (static/lang/data/esv.json, quoted on the site under an allowance that doesn't cover downloads) or any audio file
  or link to the Greek audio recording turns up in the zip.
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

/* ---------- the language packs (data/embed.json "toolkit.packs"; credits from "sources") ----------
   Each pack keeps the license of what it's made from and carries its own LICENSE and CREDITS.md. NEVER the ESV (quoted
   on the site under Crossway's allowance, which doesn't cover downloads: the English is the King James Version) and
   never the Greek audio recording. Both are checked after staging. */
const SRCS = C.sources || {};
const PACK = {}; for (const p of C.toolkit.packs || []) PACK[p.dir] = p;
const LANGDATA = 'static/lang/data/';
function credits(p, extra) {
  const lines = ['# Credits: ' + p.name, '', p.what + '.', '', 'License of this folder: ' + p.license + (p.license_url ? ' (' + p.license_url + ')' : '') + '.', '', '## Sources', ''];
  for (const k of p.sources) {
    const s = SRCS[k]; if (!s) die('pack ' + p.dir + ': unknown source ' + k);
    lines.push('- **' + s.name + '**, ' + s.by + '. ' + s.what.charAt(0).toUpperCase() + s.what.slice(1) + '. License: ' + s.license + (s.license_url ? ' (' + s.license_url + ')' : '') + '.' + (s.url ? ' ' + s.url : ''));
  }
  lines.push('', 'Prepared for the toolkit by Teddy Rook Book (' + SITE + '). We credit every source, even where its license does not ask for it.');
  if (extra) lines.push('', extra);
  return lines.join('\n') + '\n';
}
function license(p, body) {
  return p.name + ' (Teddy Rook toolkit, folder ' + p.dir + '/)\n\n' + body.trim() + '\n\nSee CREDITS.md in this folder for every source and its license.\n';
}
const CCTXT = {
  'CC BY 4.0': 'Creative Commons Attribution 4.0 International (CC BY 4.0)\nhttps://creativecommons.org/licenses/by/4.0/\nFull legal code: https://creativecommons.org/licenses/by/4.0/legalcode\n\nYou may share and adapt this material for any purpose, including commercially, as long as you give appropriate credit, link to the license and say if you made changes.',
  'CC BY-NC-SA 3.0': 'Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0)\nhttps://creativecommons.org/licenses/by-nc-sa/3.0/\nFull legal code: https://creativecommons.org/licenses/by-nc-sa/3.0/legalcode\n\nYou may share and adapt this material for non-commercial purposes, as long as you give appropriate credit, say if you made changes, and share what you make from it under the same license.',
  'CC BY-SA 3.0': 'Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)\nhttps://creativecommons.org/licenses/by-sa/3.0/\nFull legal code: https://creativecommons.org/licenses/by-sa/3.0/legalcode\n\nYou may share and adapt this material for any purpose, including commercially, as long as you give appropriate credit, say if you made changes, and share what you make from it under the same license.',
  'CC BY-SA 4.0': 'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)\nhttps://creativecommons.org/licenses/by-sa/4.0/\nFull legal code: https://creativecommons.org/licenses/by-sa/4.0/legalcode'
};
const packNote = 'The data files are UTF-8 JSON; README.md at the top of the toolkit explains their fields.';
// greek/: the four Gospels, word by word, and the dictionary
{
  const p = PACK.greek; if (!p) die('no "greek" pack in data/embed.json');
  for (const b of ['MAT', 'MRK', 'LUK', 'JHN']) copy(LANGDATA + 'grc-' + b + '.json', 'greek/grc-' + b + '.json');
  copy(LANGDATA + 'grc-lex.json', 'greek/grc-lex.json');
  put('greek/LICENSE', license(p, CCTXT['CC BY 4.0'] + '\n\nThe Greek text (Nestle 1904) and the Dodson definitions are in the public domain; the grammar and glosses from MACULA Greek are CC BY 4.0, so the folder as a whole is shared under CC BY 4.0.\nCredit line: Greek data from MACULA Greek (Clear Bible and Biblica, CC BY 4.0), the Nestle 1904 Greek New Testament and the Dodson Greek Lexicon (public domain), prepared by Teddy Rook Book.'));
  put('greek/CREDITS.md', credits(p, packNote));
}
// latin/: the Vulgate Gospels, word by word, and the dictionary
{
  const p = PACK.latin; if (!p) die('no "latin" pack in data/embed.json');
  for (const b of ['MAT', 'MRK', 'LUK', 'JHN']) copy(LANGDATA + 'lat-' + b + '.json', 'latin/lat-' + b + '.json');
  copy(LANGDATA + 'lat-lex.json', 'latin/lat-lex.json');
  put('latin/LICENSE', license(p, CCTXT['CC BY-NC-SA 3.0'] + '\n\nThe Vulgate text is in the public domain; this edition, with its lemmas, grammar and syntax, comes from the PROIEL Treebank (CC BY-NC-SA 3.0), and so does this folder. The definitions in lat-lex.json are from William Whitaker\'s Words, which its author made free to copy.\nCredit line: Latin data from the PROIEL Treebank (CC BY-NC-SA 3.0) and William Whitaker\'s Words, prepared by Teddy Rook Book.'));
  put('latin/CREDITS.md', credits(p, packNote));
}
// classical/: one file per language and source, so each keeps its own license
{
  const p = PACK.classical; if (!p) die('no "classical" pack in data/embed.json');
  const lic = [];
  for (const [lang, word] of [['lat', 'latin'], ['grc', 'greek']]) {
    const c = JSON.parse(read(path.join(ROOT, LANGDATA + 'cls-' + lang + '.json')));
    for (const [tb, slug, l] of [['PROIEL', 'proiel', 'CC BY-NC-SA 3.0'], ['Perseus AGLDT', 'perseus', 'CC BY-SA 3.0']]) {
      const works = {}; for (const k of Object.keys(c.works)) if (c.works[k].tb === tb) works[k] = c.works[k];
      const s = c.s.filter(x => works[x.w]);
      if (!s.length) continue;
      const f = word + '-' + slug + '.json';
      put('classical/' + f, JSON.stringify({ license: l, source: tb === 'PROIEL' ? 'PROIEL Treebank, https://github.com/proiel/proiel-treebank' : 'Perseus Ancient Greek and Latin Dependency Treebank 2.1, https://github.com/PerseusDL/treebank_data', english: 'public-domain translations named in works[].tr, as published by the Perseus Digital Library', lexicon: word + '-lex.json', works, s }));
      lic.push('- `' + f + '`: ' + l + ' (' + Object.values(works).map(w => w.a + ', ' + w.t).join('; ') + ')');
    }
  }
  copy(LANGDATA + 'cls-lat-lex.json', 'classical/latin-lex.json');
  copy(LANGDATA + 'cls-grc-lex.json', 'classical/greek-lex.json');
  lic.push('- `latin-lex.json`: definitions from William Whitaker\'s Words, free to copy by the author\'s terms', '- `greek-lex.json`: CC BY-SA 4.0 (Liddell–Scott–Jones via the Perseus Digital Library, plus a few short glosses by Teddy Rook Book)');
  put('classical/LICENSE', license(p, 'Each file in this folder has its own license, named in the file ("license") and here:\n\n' + lic.join('\n') + '\n\n' + CCTXT['CC BY-NC-SA 3.0'] + '\n\n' + CCTXT['CC BY-SA 3.0'] + '\n\n' + CCTXT['CC BY-SA 4.0'] + '\n\nThe English in every file is from translations in the public domain (published before 1927), taken from the Perseus Digital Library\'s CC BY-SA 4.0 editions; their markup is not included. A sentence\'s tokens ("t") index into the lexicon file of its language.'));
  put('classical/CREDITS.md', credits(p, 'Sentences were paired with their translations automatically and checked by word overlap, so a pairing may sometimes be loose. ' + packNote));
}
// english-kjv/: the King James Version for the verses used
{
  const p = PACK['english-kjv']; if (!p) die('no "english-kjv" pack in data/embed.json');
  copy(LANGDATA + 'kjv.json', 'english-kjv/kjv.json');
  put('english-kjv/LICENSE', license(p, 'Public domain.\n\nThe King James Version (1611; this is the standard 1769 Oxford text) is in the public domain in the United States and most of the world. In the United Kingdom, printing it is governed by the Crown\'s letters patent.\n\nKeys are BBCCCVVV: book (40 Matthew, 41 Mark, 42 Luke, 43 John), chapter and verse.'));
  put('english-kjv/CREDITS.md', credits(p, 'Text source: the public-domain "kjv" package (https://www.npmjs.com/package/kjv, json/verses-1769.json), with its italics brackets and paragraph marks removed. Checked word by word against Wikisource\'s proofread transcription of the 1772 Oxford edition (https://en.wikisource.org/wiki/Bible_(King_James)); they agree except for that edition\'s spellings and a few slips in the transcription.'));
}
// tools/alphabet/ and tools/hieroglyphs/: the site's own tools, ready to open
{
  const LT = path.join(__dirname, 'lang');
  const site = s => s.replace(/href="\/(?!\/)/g, 'href="' + SITE + '/');
  const a = PACK['tools/alphabet'], h = PACK['tools/hieroglyphs'];
  if (!a || !h) die('no tools packs in data/embed.json');
  put('tools/alphabet/index.html', read(path.join(LT, 'alphabet.html')));
  put('tools/alphabet/tool.css', read(path.join(LT, 'tool.css')));
  copy('static/lang/lang.css', 'tools/alphabet/lang/lang.css');
  copy('static/lang/alphabet.css', 'tools/alphabet/lang/alphabet.css');
  put('tools/alphabet/lang/alphabet.js', site(read(path.join(ROOT, 'static/lang/alphabet.js'))));
  copy('static/js/translit.js', 'tools/alphabet/js/translit.js');
  put('tools/alphabet/LICENSE', license(a, 'Code (the .js and .css files): MIT License, copyright Teddy Rook (see LICENSE at the top of the toolkit).\nContent (the lessons, quiz text and example words): CC BY-NC 4.0, https://creativecommons.org/licenses/by-nc/4.0/ (see CONTENT-LICENSE at the top of the toolkit).'));
  put('tools/alphabet/CREDITS.md', credits(a, 'The example words are all found in the Greek New Testament (Nestle 1904, public domain). No fonts are bundled: Greek shows in your device\'s own fonts.'));
  put('tools/hieroglyphs/index.html', read(path.join(LT, 'hieroglyphs.html')));
  put('tools/hieroglyphs/tool.css', read(path.join(LT, 'tool.css')));
  copy('static/lang/lang.css', 'tools/hieroglyphs/lang/lang.css');
  copy('static/math/viz/viz.css', 'tools/hieroglyphs/math/viz/viz.css');
  copy('static/math/viz/core.js', 'tools/hieroglyphs/math/viz/core.js');
  copy('static/egypt/viz/egypt.css', 'tools/hieroglyphs/egypt/viz/egypt.css');
  put('tools/hieroglyphs/egypt/viz/egypt.js', site(read(path.join(ROOT, 'static/egypt/viz/egypt.js'))));
  for (const f of ['trb-hieroglyphs.woff', 'OFL-trb-hieroglyphs.txt', 'trb-freeserif.woff', 'LICENSE-trb-freeserif.txt']) copy('static/egypt/fonts/' + f, 'tools/hieroglyphs/egypt/fonts/' + f);
  for (const f of ['hiero.css', 'hiero.js', 'cartouche.js']) put('tools/hieroglyphs/languages/hieroglyphs/' + f, site(read(path.join(ROOT, 'static/languages/hieroglyphs/' + f))));
  put('tools/hieroglyphs/LICENSE', license(h, 'Code (the .js and .css files): MIT License, copyright Teddy Rook (see LICENSE at the top of the toolkit).\nContent (the spelling rules, sign notes, royal names and readings in egypt/viz/egypt.js and languages/hieroglyphs/): CC BY-NC 4.0, https://creativecommons.org/licenses/by-nc/4.0/.\nFonts (egypt/fonts/): TRB Hieroglyphs, SIL Open Font License 1.1 (OFL-trb-hieroglyphs.txt); the FreeSerif subset, GNU GPL 3 or later with the font exception (LICENSE-trb-freeserif.txt).'));
  put('tools/hieroglyphs/CREDITS.md', credits(h, 'TRB Hieroglyphs is drawn sign by sign for Teddy Rook Book (original drawings), at the signs\' Unicode code points. trb-freeserif.woff is a subset of FreeSerif from GNU FreeFont, with two letters added by Teddy Rook Book; its license file says how.'));
}
// the language example's data: Greek Gospel passages with the KJV (from the embeds' ESV-free file), as a script so the
// page works from a file on disk
{
  const g = JSON.parse(read(path.join(ROOT, 'static/embed/lang/gos-grc.json')));
  const lex = {}; for (const k of Object.keys(g.lex)) lex[k] = { l: g.lex[k].l, b: g.lex[k].b };
  const verses = g.v.map(v => ({ b: v.b, c: v.c, v: v.v, p: v.p, t: v.t.map(t => t.slice(0, 6)), en: v.en }));
  put('language-data.js', '/* The language example\'s data (language.html): Gospel passages in Koine Greek, word by word, with the King James Version.\n   Greek: Nestle 1904 (public domain) with MACULA Greek grammar and glosses (Clear Bible and Biblica, CC BY 4.0) and Dodson\n   definitions (public domain); see greek/CREDITS.md. English: King James Version (public domain); see english-kjv/. */\nwindow.TRB_LANG = ' + JSON.stringify({ passages: g.passages, verses, lex }) + ';\n');
  for (const f of ['language.html', 'language.js', 'language.css']) put(f, read(path.join(__dirname, 'lang', f)));
  copy('static/lang/grammar.js', 'lang/grammar.js');
}

// the template files
const date = new Date().toISOString().slice(0, 10);
for (const f of fs.readdirSync(path.join(__dirname, 'files'))) {
  let s = read(path.join(__dirname, 'files', f));
  s = s.replace(/\{\{DATE\}\}/g, date).replace(/\{\{LADDERS\}\}/g, ladders.map(l => l.title.replace(/ Ladder$/, '')).join(', '));
  put(f, s);
}

/* ---------- checks: no withheld material, nothing from left-out sources, no ESV, no audio ---------- */
// The ESV probes: every ESV verse of 25+ letters that the KJV doesn't word the same way (static/lang/data/esv.json)
const normT = t => String(t).toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ').trim();
const KJVALL = Object.values(JSON.parse(read(path.join(ROOT, 'static/lang/data/kjv.json')))).map(normT).join(' | ');
const ESV = Object.values(JSON.parse(read(path.join(ROOT, 'static/lang/data/esv.json')))).map(normT).filter(t => t.length >= 25 && !KJVALL.includes(t));
if (ESV.length < 400) die('the ESV check has too few verses to compare (' + ESV.length + ')');
(function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { scan(p); continue; }
    if (/\.(mp3|ogg|oga|wav|m4a|aac|flac|opus)$/i.test(f.name)) die(path.relative(D, p) + ': no audio files in the toolkit');
    if (!/\.(js|json|css|html|md)$/.test(f.name) && !/^(LICENSE|NOTICE|CONTENT-LICENSE)$/.test(f.name)) continue;
    const s = read(p), rel = path.relative(D, p);
    for (const w of WH) if (s.includes(w)) die(rel + ' still refers to withheld material (' + w + ')');
    if (/hs_hannah|hannahwardeducation/i.test(s)) die(rel + ' refers to Hannah Ward\'s material');
    if (/\/lang\/data\//.test(s) && !/^(NOTICE|README|CREDITS)/.test(f.name)) die(rel + ' refers to the site\'s language data folder');
    if (/Phemister|AudiogreeknewtestamentOfWescott/.test(s) && !/^(NOTICE|README|CREDITS)/.test(f.name)) die(rel + ' points to the Greek audio recording, which isn\'t ours to bundle');
    const n = normT(s);
    const hit = ESV.find(e => n.includes(e));
    if (hit) die(rel + ' contains ESV text ("' + hit.slice(0, 50) + '…"); the toolkit uses the King James Version');
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
