#!/usr/bin/env node
/* Vocabulary Ladder: checks the word files (data/vocab/words/<topic>.json) against the word list and the illustration kit.

   node scripts/vocab/check-words.js               every word file
   node scripts/vocab/check-words.js praise blame  only these topics (keys from data/vocab/list.json)
   node scripts/vocab/check-words.js --full        also an error for every topic that has no word file yet (for the finished set)

   Errors (exit 1): a file that is not an adv topic or not valid JSON; a topic whose ten words are not exactly the list's ten;
   a word in two files; a missing or empty field; an unknown field; a part of speech that differs from the list; a respelling
   without a stressed syllable in capitals; a sentence or memory hook without the word marked in {braces}; a scene that uses
   a name the kit does not have (MathLadder.vocab.checkScene); a lesson block or practice item in the wrong shape; banned
   phrases; the built files (gen/adv.js, lessons/adv.json, the kit's data block) out of date with the word files.
   Warnings: things a person should look at (a braced form that may not be the word, a definition that uses the word itself,
   a short "in context" sentence, words that may be brands, real people or not family-friendly, and so on). */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), D = p => path.join(ROOT, 'data', 'vocab', p);
global.window = global;
require(path.join(ROOT, 'static/vocab/viz/vocab.js'));
const VO = global.MathLadder.vocab;

const args = process.argv.slice(2), FULL = args.includes('--full'), only = args.filter(a => !a.startsWith('--'));
const LIST = JSON.parse(fs.readFileSync(D('list.json'), 'utf8'));
const TOPICS = {}; LIST.topics.forEach(t => { TOPICS[t.key] = t; });
const LISTWORD = {}; LIST.words.forEach(w => { LISTWORD[w.word.toLowerCase()] = w; });
let errors = 0, warnings = 0; const out = [];
const err = (w, m) => { errors++; out.push('  ERROR ' + w + ': ' + m); };
const warn = (w, m) => { warnings++; out.push('  warn  ' + w + ': ' + m); };
const isStr = v => typeof v === 'string' && v.trim() !== '';

const ENTRY = { word: 1, say: 1, pos: 1, def: 1, ex: 1, ctx: 1, syn: 1, ant: 1, family: 1, roots: 1, etym: 0, mn: 1, scene: 1, note: 0 };
const FILE = { topic: 1, intro: 0, words: 1, after: 0, items: 0, sources: 0 };
const BLOCKS = { p: ['html'], h: ['text'], key: ['html'], mistake: ['html'], why: ['html'], note: ['html'], ex: ['q', 'steps', 'a'], viz: ['name'], list: ['items'], table: ['head', 'rows'] };
const POS = Object.keys(VO.POS_NAME);
const BANNED = [/\bgenuinely\b/i, /\bhonestly\b/i, /\bstraightforward/i, /\bbook club\b/i, /\bA\.?I\.?\b(?! ?[a-z])/, /\bartificial intelligence\b/i, /\bchatbot\b/i];
// worth a second look (whole words, in prose only): brands, famous people and characters (as capitalized names), and
// words that do not suit a family site
const LOOK_NAMES = /\b(Disney|McDonald’?'?s?|Coca-Cola|Coke|Pepsi|Nike|Adidas|Apple|Google|Amazon|Netflix|YouTube|TikTok|Instagram|Facebook|LEGO|Lego|Barbie|Pok[eé]mon|Star Wars|Harry Potter|Marvel|Batman|Superman|Spider-?Man|Mickey|Elvis|Beyonc[eé]|Taylor Swift|Einstein|Napoleon|Shakespeare|Lincoln|Trump|Biden|Obama|Jesus|Allah|Buddha|Democrats?|Republicans?)\b/;
const LOOK_WORDS = /\b(church|mosque|beer|wine|vodka|whiske?y|drunk|cigarettes?|guns?|rifles?|pistols?|stupid|idiots?|dumb|morons?|shut up|sexy|kill(?:ed|ing|s)?)\b/i;
// fields that hold names and codes, not prose (respellings, kit names, parts of speech…)
const NOT_PROSE = new Set(['say', 'pos', 'word', 'w', 'part', 'kind', 'who', 'pose', 'mood', 'bg', 'holds', 'seat', 'wear', 'face', 'look', 'hand', 'color', 'hcolor', 'robe', 'cape', 'hat', 'tie', 'sash', 'jacket', 'at', 'on', 't', 'name', 'url', 'dir', 'topic', 'lv']);
const prose = p => !NOT_PROSE.has((p.match(/\.(\w+)(\[\d+\])*$/) || [])[1]);

// every string inside a value, with its path
function strings(v, p, f) { if (typeof v === 'string') f(v, p); else if (Array.isArray(v)) v.forEach((x, i) => strings(x, p + '[' + i + ']', f)); else if (v && typeof v === 'object') Object.keys(v).forEach(k => strings(v[k], p + '.' + k, f)); }
function textChecks(v, where) {
  strings(v, '', (s, p) => {
    if (!prose(p)) return;
    BANNED.forEach(re => { if (re.test(s)) err(where + p, 'uses "' + s.match(re)[0] + '" (see the style rules)'); });
    const m = s.match(LOOK_NAMES) || s.match(LOOK_WORDS); if (m) warn(where + p, 'check "' + m[0] + '": no brands, real people, politics, religion or unkind words');
    if (/ {2,}/.test(s)) warn(where + p, 'two spaces in a row');
    if (/(^|[^.])\.\.(?!\.)/.test(s)) warn(where + p, 'two periods');
  });
}
// a braced form should be the word or a form of it (benevolent → benevolently, malign → maligned, ostracize → ostracized)
function formOk(form, word) {
  const f = form.toLowerCase(), w = word.toLowerCase(), stem = w.replace(/(e|y|ate|ous|ent|ant|ize|ise)$/, '');
  return f === w || f.startsWith(stem.slice(0, Math.max(4, Math.min(stem.length, w.length - 2))));
}
function sentence(s, word, where, what) {
  if (!isStr(s)) return;
  const forms = s.match(/\{[^}]*\}/g) || [];
  if (!forms.length) { err(where, what + ' must mark the word in {braces}'); return; }
  if (forms.length > 1 && what !== 'memory hook') warn(where, what + ' marks ' + forms.length + ' words; mark just one');
  const f = forms[0].slice(1, -1);
  if (!formOk(f, word)) warn(where, what + ': is {' + f + '} a form of "' + word + '"?');
  if (/[{}]/.test(s.replace(/\{[^{}]+\}/g, ''))) err(where, what + ' has unmatched braces');
}

const wdir = D('words');
const files = fs.existsSync(wdir) ? fs.readdirSync(wdir).filter(f => f.endsWith('.json')).sort() : [];
const seen = {};
let done = 0, entriesN = 0;
files.forEach(f => {
  const key = f.replace(/\.json$/, ''), W = 'data/vocab/words/' + f;
  if (only.length && !only.includes(key)) return;
  const tp = TOPICS[key];
  if (!tp) { err(W, 'no topic "' + key + '" in data/vocab/list.json'); return; }
  let T; try { T = JSON.parse(fs.readFileSync(path.join(wdir, f), 'utf8')); } catch (e) { err(W, 'not valid JSON: ' + e.message); return; }
  Object.keys(T).forEach(k => { if (!(k in FILE)) err(W, 'unknown field "' + k + '"'); });
  if (T.topic !== 'adv.' + key) err(W, 'topic should be "adv.' + key + '"');
  if (!Array.isArray(T.words)) { err(W, 'words must be a list of entries'); return; }
  // the ten words, exactly the list's ten
  const listWords = tp.words.map(w => w.toLowerCase()), have = T.words.map(e => String(e && e.word || '').toLowerCase());
  listWords.forEach(w => { if (!have.includes(w)) err(W, 'missing the list word "' + w + '"'); });
  have.forEach(w => { if (w && !listWords.includes(w)) err(W, '"' + w + '" is not one of this topic\'s ten words' + (LISTWORD[w] ? ' (it belongs to ' + LISTWORD[w].topic + ')' : ' (it is not on the list)')); });
  if (listWords.join() !== have.join() && listWords.every(w => have.includes(w))) warn(W, 'the words are not in list order (' + tp.words.join(', ') + ')');
  T.words.forEach((e, i) => {
    const w0 = String(e && e.word || '#' + (i + 1)), Wn = W + ' ' + w0;
    if (!e || typeof e !== 'object') { err(Wn, 'not an entry'); return; }
    if (seen[w0.toLowerCase()]) err(Wn, 'also in ' + seen[w0.toLowerCase()]); seen[w0.toLowerCase()] = f;
    Object.keys(ENTRY).forEach(k => { if (ENTRY[k] && (e[k] === undefined || e[k] === '' || e[k] === null)) err(Wn, 'needs ' + k); });
    Object.keys(e).forEach(k => { if (!(k in ENTRY)) err(Wn, 'unknown field "' + k + '"'); else if (!ENTRY[k] && !isStr(e[k])) err(Wn, k + ' is empty (leave it out instead)'); });
    const L = LISTWORD[w0.toLowerCase()];
    if (L && e.pos && e.pos !== L.pos) err(Wn, 'pos "' + e.pos + '" but the list says "' + L.pos + '"');
    if (e.pos && !POS.includes(e.pos)) err(Wn, 'pos must be one of ' + POS.join(', '));
    if (isStr(e.say)) {
      if (!/^[a-zA-Z' ]+(-[a-zA-Z' ]+)*$/.test(e.say)) err(Wn, 'respelling "' + e.say + '": letters and hyphens only, like buh-NEV-uh-lunt');
      else if (!e.say.split(/[- ]/).some(s => /^[A-Z']+$/.test(s) && /[A-Z]/.test(s))) err(Wn, 'respelling "' + e.say + '" needs its stressed syllable in capitals');
      else if (e.say.split(/[- ]/).some(s => /[A-Z]/.test(s) && /[a-z]/.test(s))) err(Wn, 'respelling "' + e.say + '": each syllable all lowercase or all capitals');
    }
    if (isStr(e.def)) {
      if (e.def.length > 110) warn(Wn, 'definition is long (' + e.def.length + ' letters); keep it plain and short');
      const stem = w0.toLowerCase().slice(0, Math.max(5, w0.length - 3));
      if (e.def.toLowerCase().includes(stem)) warn(Wn, 'the definition uses the word itself');
      if (/[.]$/.test(e.def)) warn(Wn, 'definitions have no final period');
    }
    sentence(e.ex, w0, Wn, 'ex');
    sentence(e.ctx, w0, Wn, 'ctx');
    if (isStr(e.ctx) && e.ctx.length < 70) warn(Wn, 'the "in context" sentence is short; give enough context to work out the meaning');
    if (isStr(e.ex) && isStr(e.ctx) && VO.plain(e.ex) === VO.plain(e.ctx)) err(Wn, 'ex and ctx are the same sentence');
    ['syn', 'ant'].forEach(k => {
      if (e[k] === undefined) return;
      if (!Array.isArray(e[k]) || e[k].some(x => !isStr(x))) { err(Wn, k + ' must be a list of words'); return; }
      if (e[k].some(x => x.toLowerCase() === w0.toLowerCase())) err(Wn, k + ' lists the word itself');
    });
    if (Array.isArray(e.syn) && e.syn.length < 2) warn(Wn, 'give two to four synonyms');
    if (Array.isArray(e.syn) && Array.isArray(e.ant) && e.syn.some(x => e.ant.includes(x))) err(Wn, 'a word is both a synonym and an antonym');
    if (e.family !== undefined && (!Array.isArray(e.family) || e.family.some(x => !x || !isStr(x.w) || !String(x.pos).split(' or ').every(p => POS.includes(p))))) err(Wn, 'family must be a list of { w, pos } (pos: ' + POS.join(', ') + ', or two joined by "or")');
    if (e.roots !== undefined) {
      if (!Array.isArray(e.roots) || e.roots.some(x => !x || !isStr(x.part) || !isStr(x.means))) err(Wn, 'roots must be a list of { part, means }');
      else if (L && (L.roots || []).length && !e.roots.length) warn(Wn, 'the list tags this word with ' + L.roots.join(', ') + ' but roots is empty');
    }
    if (e.mn !== undefined) {
      if (!e.mn || !isStr(e.mn.cue) || !isStr(e.mn.text)) err(Wn, 'mn needs cue and text');
      else { Object.keys(e.mn).forEach(k => { if (k !== 'cue' && k !== 'text') err(Wn, 'mn has an unknown field "' + k + '"'); }); sentence(e.mn.text, w0, Wn, 'memory hook'); if (/[{}]/.test(e.mn.cue)) err(Wn, 'the cue has no braces'); }
    }
    if (e.scene !== undefined) VO.checkScene(e.scene).forEach(m => /^note: /.test(m) ? warn(Wn, 'scene: ' + m.slice(6)) : err(Wn, 'scene: ' + m));
    textChecks(e, Wn);
    entriesN++;
  });
  // lesson blocks and practice items
  ['intro', 'after'].forEach(part => {
    if (T[part] === undefined) return;
    if (!Array.isArray(T[part])) { err(W, part + ' must be a list of lesson blocks'); return; }
    T[part].forEach((b, i) => {
      const wb = W + ' ' + part + ' block ' + (i + 1);
      if (!b || !(b.t in BLOCKS)) { err(wb, 'unknown block type ' + (b && b.t) + ' (use ' + Object.keys(BLOCKS).join(', ') + ')'); return; }
      BLOCKS[b.t].forEach(k => { if (b[k] === undefined || b[k] === '') err(wb, b.t + ' block needs ' + k); });
      if (b.t === 'table' && (!Array.isArray(b.head) || !Array.isArray(b.rows) || b.rows.some(r => !Array.isArray(r) || r.length !== b.head.length))) err(wb, 'table needs head [] and rows [[]] of the same width');
      if (b.t === 'viz' && !/^vo-(scene|word|roots|cloze)$/.test(b.name)) err(wb, 'viz name must be vo-scene, vo-word, vo-roots or vo-cloze');
      if (b.t === 'viz' && b.name === 'vo-scene' && b.opts && b.opts.scene) VO.checkScene(b.opts.scene).forEach(m => /^note: /.test(m) ? warn(wb, 'scene: ' + m.slice(6)) : err(wb, 'scene: ' + m));
    });
    textChecks(T[part], W + ' ' + part);
  });
  if (T.items !== undefined) {
    if (!Array.isArray(T.items)) err(W, 'items must be a list');
    else T.items.forEach((it, i) => {
      const wi = W + ' item ' + (i + 1);
      if (!it || !isStr(it.q) || !isStr(it.why)) { err(wi, 'needs q and why'); return; }
      if (!Array.isArray(it.lv) || !it.lv.length || it.lv.some(l => ![1, 2, 3].includes(l))) err(wi, 'lv must list levels 1, 2 and/or 3');
      if (it.word && !listWords.includes(String(it.word).toLowerCase())) err(wi, 'word "' + it.word + '" is not in this topic');
      Object.keys(it).forEach(k => { if (!/^(lv|word|q|choices|a|tf|text|why|steps|hint)$/.test(k)) err(wi, 'unknown field "' + k + '"'); });
      if (it.steps !== undefined && (!Array.isArray(it.steps) || it.steps.some(x => !isStr(x)))) err(wi, 'steps must be a list of sentences');
      if (typeof it.tf === 'boolean') { if (it.choices) err(wi, 'a true-or-false item has no choices'); }
      else if (it.text !== undefined) { if (![].concat(it.text).every(isStr)) err(wi, 'text: the typed answer (or a list of accepted answers)'); if (it.choices) err(wi, 'a typed-answer item has no choices'); }
      else if (!Array.isArray(it.choices) || it.choices.length < 3 || it.choices.length > 5 || it.choices.some(c => !isStr(String(c)))) err(wi, 'needs 3 to 5 choices (or tf: true / false, or text: the typed answer)');
      else if (!Number.isInteger(it.a) || it.a < 0 || it.a >= it.choices.length) err(wi, 'a must be the index of the right choice');
      else if (new Set(it.choices.map(String)).size !== it.choices.length) err(wi, 'two choices are the same');
      textChecks(it, wi);
    });
  }
  if (T.sources !== undefined && (!Array.isArray(T.sources) || T.sources.some(s => !s || !isStr(s.name)))) err(W, 'sources must be a list of { name, url }');
  if (T.words.length === 10 && !out.some(l => l.includes(W) && l.includes('ERROR'))) done++;
});

const want = only.length ? only : LIST.topics.map(t => t.key);
only.forEach(k => { if (!TOPICS[k]) err(k, 'no such topic in data/vocab/list.json'); });
const missing = want.filter(k => TOPICS[k] && !files.includes(k + '.json'));
if (FULL && missing.length) missing.forEach(k => err('data/vocab/words/' + k + '.json', 'missing'));

// the built files must match the word files
const b = cp.spawnSync(process.execPath, [path.join(__dirname, 'build.js'), '--check'], { encoding: 'utf8' });
if (b.status !== 0) err('scripts/vocab/build.js', ((b.stdout || '') + (b.stderr || '')).trim().split('\n').pop() + ': run node scripts/vocab/build.js');

console.log('Vocabulary word files: ' + entriesN + ' entries in ' + files.filter(f => !only.length || only.includes(f.replace(/\.json$/, ''))).length + ' file(s), ' + done + ' topic(s) clean' +
  (missing.length ? '; ' + missing.length + ' of ' + want.length + ' topic(s) have no file yet' : ''));
out.forEach(l => console.log(l));
console.log(errors + ' error(s), ' + warnings + ' warning(s)');
process.exit(errors ? 1 : 0);
