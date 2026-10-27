#!/usr/bin/env node
/* Tests for Phonics Practice (data/phonics.json + static/homeschool/phonics/decode.js).
   Run: node scripts/phonics/test.js        (from the site root, or anywhere)
   - every practice word, family word and picture word decodes at its own step;
   - every sentence and story decodes at its step (taught patterns + heart words so far);
   - the checker refuses words it should refuse (irregular words, patterns not taught yet);
   - every word is a real, correctly spelled English word (Hunspell en_US list, when installed);
   - data shape: unique keys, unit ids, pictures, heart-word markings. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/phonics.json'), 'utf8'));
const PD = require(path.join(ROOT, 'static/homeschool/phonics/decode.js'));

let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) passes++; else { fails++; console.log('  FAIL ' + msg); } }
const idxOf = {}; data.steps.forEach((s, i) => { idxOf[s.key] = i; });
const ctxs = data.steps.map((s, i) => PD.context(data, i));
const plain = w => w.replace(/\|/g, '');

// ---------- Hunspell (en_US) word check: a small reader for .dic/.aff suffix and prefix rules ----------
function loadHunspell() {
  const dicP = '/usr/share/hunspell/en_US.dic', affP = '/usr/share/hunspell/en_US.aff';
  if (!fs.existsSync(dicP) || !fs.existsSync(affP)) return null;
  const dic = new Map();
  fs.readFileSync(dicP, 'utf8').split('\n').slice(1).forEach(l => {
    if (!l) return; const [w, f] = l.split('/'); dic.set(w, (dic.get(w) || '') + (f || ''));
  });
  const sfx = [], pfx = [];
  fs.readFileSync(affP, 'utf8').split('\n').forEach(l => {
    const p = l.trim().split(/\s+/);
    if ((p[0] === 'SFX' || p[0] === 'PFX') && p.length >= 5) {
      const r = { flag: p[1], strip: p[2] === '0' ? '' : p[2], add: p[3] === '0' ? '' : p[3].split('/')[0], cond: p[4] };
      r.re = p[0] === 'SFX' ? new RegExp((r.cond === '.' ? '' : r.cond) + '$') : new RegExp('^' + (r.cond === '.' ? '' : r.cond));
      (p[0] === 'SFX' ? sfx : pfx).push(r);
    }
  });
  function has(w, flag) { const f = dic.get(w); return f !== undefined && (!flag || f.indexOf(flag) >= 0); }
  function base(w) {
    if (has(w) || has(w.toLowerCase())) return true;
    for (const r of sfx) {
      if (!w.endsWith(r.add)) continue;
      const st = w.slice(0, w.length - r.add.length) + r.strip;
      if (st && r.re.test(st) && (has(st, r.flag) || has(st.toLowerCase(), r.flag))) return true;
    }
    return false;
  }
  return function word(w) {
    if (base(w)) return true;
    for (const r of pfx) {
      if (!w.startsWith(r.add)) continue;
      const st = r.strip + w.slice(r.add.length);
      if (r.re.test(st) && has(st, r.flag)) return true;
    }
    return false;
  };
}
const spell = loadHunspell();
if (!spell) console.log('NOTE: /usr/share/hunspell/en_US.dic not found; skipping the spelling check.');
const names = new Set(data.names.map(n => n.toLowerCase()));
const spellSeen = new Set();
function spelled(w, where) {
  if (!spell) return;
  const key = w + '@' + where; if (spellSeen.has(w)) return; spellSeen.add(w);
  if (names.has(w.toLowerCase()) && /^[A-Z]/.test(w)) return; // names are checked separately
  ok(spell(w) || spell(w.toLowerCase()), `"${w}" is not in the en_US word list (${where})`);
}

// ---------- 1. data shape ----------
console.log('Data shape');
const keys = new Set();
data.steps.forEach((s, i) => {
  ok(!keys.has(s.key), 'duplicate step key ' + s.key); keys.add(s.key);
  ok(s.n === i + 1, `step ${s.key} has n=${s.n}, expected ${i + 1}`);
  ['title', 'kid', 'icon', 'blurb', 'teaches', 'hannah', 'tip'].forEach(f => ok(typeof s[f] === 'string' && s[f].length, `step ${s.key} is missing ${f}`));
  ok(Array.isArray(s.acts) && s.acts.length, `step ${s.key} has no activities`);
  ok(Array.isArray(s.offscreen) && s.offscreen.length >= 2, `step ${s.key} needs away-from-screen ideas`);
  (s.units || []).forEach(u => ok(u.id && u.g && u.t && u.key && u.say, `step ${s.key}: unit ${JSON.stringify(u)} is incomplete`));
  (s.heart || []).forEach(h => ok(h.w.toLowerCase().indexOf(h.h.toLowerCase()) >= 0, `heart word ${h.w}: marked part "${h.h}" is not in it`));
  if (i >= idxOf.blending) {
    ok(s.sentences.length >= 4, `step ${s.key} needs at least 4 sentences`);
    ok(s.stories.length >= 1, `step ${s.key} needs a story`);
    ok(s.words.length >= 20, `step ${s.key} needs at least 20 practice words`);
  }
  if (s.acts.indexOf('cards') >= 0) ok((s.units || []).length > 0, `step ${s.key} has sound cards but no units`);
});
Object.keys(data.practice).forEach(k => { const st = data.practice[k].step; ok(!st || idxOf[st] !== undefined, `practice link ${k} points to unknown step ${st}`); });
const banned = /\b(genuinely|honestly|straightforward|book club)\b/i;
ok(!banned.test(JSON.stringify(data)), 'data uses a word the house style rules out');
Object.keys(data.pics).forEach(w => ok(data.pics[w], 'empty picture for ' + w));

// ---------- 2. word lists decode at their own step ----------
console.log('Word lists');
data.steps.forEach((s, i) => {
  const c = ctxs[i];
  const lists = [['words', s.words || []], ['middle', s.middle || []]];
  (s.families || []).forEach(f => lists.push(['family -' + f.end, f.words]));
  lists.forEach(([name, list]) => {
    const seen = new Set();
    list.forEach(w0 => {
      const w = plain(w0);
      ok(!seen.has(w), `step ${s.key} ${name}: "${w}" listed twice`); seen.add(w);
      if (name === 'middle' || i >= idxOf.blending) { const r = PD.check(w, ctxs[Math.max(i, idxOf.blending)]); ok(r.ok, `step ${s.key} ${name}: "${w}" is not decodable here (${r.why})`); }
      spelled(w, `step ${s.key} ${name}`);
      if (w0.indexOf('|') >= 0) ok(w0.split('|').every(p => /[aeiouy]/.test(p)), `"${w0}": each syllable needs a vowel`);
    });
  });
  (s.families || []).forEach(f => f.words.forEach(w => ok(w.endsWith(f.end), `family -${f.end}: "${w}" doesn't end in -${f.end}`)));
  (s.first || []).forEach(w => { ok(!!data.pics[w], `first-sound word "${w}" has no picture`); spelled(w, 'first sounds'); });
  (s.middle || []).forEach(w => { ok(!!data.pics[w], `middle-sound word "${w}" has no picture`); ok(w.length === 3, `middle-sound word "${w}" should be three letters`); });
  (s.units || []).forEach(u => { if (!/^svg:/.test(u.key)) spelled(u.key, `step ${s.key} key words`); });
  (s.heart || []).forEach(h => spelled(h.w, `step ${s.key} heart words`));
  // pattern focus: from the digraph step on, each practice word uses something new in this step
  if (i >= idxOf.digraphs && i !== idxOf.blends && i !== idxOf.endings) {
    const newG = new Set((s.units || []).map(u => u.g));
    (s.words || []).forEach(w => { const r = PD.check(plain(w), ctxs[i]); if (r.ok && r.units) ok(r.units.some(t => newG.has(t.g)), `step ${s.key}: "${w}" doesn't use this step's new spellings`); });
  }
  if (i === idxOf.blends) (s.words || []).forEach(w => ok(!PD.check(w, ctxs[idxOf.digraphs]).ok, `blends: "${w}" was already decodable before blends`));
});
Object.keys(data.pics).forEach(w => spelled(w, 'pictures'));

// ---------- 3. sentences and stories ----------
console.log('Sentences and stories');
let storyWords = 0;
data.steps.forEach((s, i) => {
  const c = ctxs[i];
  const texts = s.sentences.map(t => ['sentence', t]);
  s.stories.forEach(st => { texts.push(['story title', st.title]); st.lines.forEach(l => texts.push(['story “' + st.title + '”', l])); });
  texts.forEach(([where, t]) => {
    const bad = PD.checkText(t, c);
    ok(!bad.length, `step ${s.key} ${where}: "${t}" -> ${bad.map(b => b.word + ' (' + b.why + ')').join(', ')}`);
    PD.words(t).forEach(w => { storyWords++; if (!(w === 'I')) spelled(w.replace(/[’']/g, ''), `step ${s.key} ${where}`); });
  });
  s.stories.forEach(st => ok(st.lines.length >= 5 && st.lines.length <= 14, `story "${st.title}" should be very short (5–14 lines)`));
});
// names used in texts must be in data.names and decodable where used
data.names.forEach(n => ok(/^[A-Z][a-z]+$/.test(n), 'name ' + n));

// ---------- 4. the checker refuses what it should ----------
console.log('Checker behavior');
const at = k => ctxs[idxOf[k]];
const NO = [
  ['was', 'blending'], ['said', 'blending'], ['the', 'letters'], ['of', 'blending'], ['you', 'blending'],
  ['ship', 'word-building'], ['chick', 'blends'] /* blends ok but... */, ['stop', 'digraphs'], ['hand', 'digraphs'], ['and', 'word-building'],
  ['cake', 'blends'], ['kite', 'blends'], ['rain', 'final-e'], ['boat', 'final-e'], ['my', 'final-e'],
  ['car', 'vowel-teams'], ['her', 'vowel-teams'], ['bird', 'vowel-teams'], ['moon', 'r-vowels'], ['cow', 'r-vowels'], ['now', 'vowel-teams'], ['coin', 'r-vowels'], ['saw', 'r-vowels'],
  ['jumped', 'other-vowels'], ['running', 'other-vowels'], ['rabbit', 'other-vowels'], ['happy', 'other-vowels'], ['sunset', 'other-vowels'],
  ['ball', 'endings'], ['cold', 'endings'], ['find', 'endings'], ['want', 'endings'], ['work', 'endings'], ['warm', 'endings'], ['city', 'endings'], ['face', 'endings'], ['page', 'endings'],
  ['have', 'blending'], ['give', 'blending'], ['come', 'blending'], ['one', 'blending'], ['head', 'endings'], ['phone', 'endings'], ['knot', 'endings'], ['write', 'endings'], ['lamb', 'endings'],
  ['go', 'blending'], ['he', 'blending'], ['new', 'endings'], ['blue', 'endings'], ['pie', 'endings'], ['key', 'endings'], ['robot', 'endings'], ['lemon', 'endings'], ['baby', 'endings'],
  ['care', 'endings'], ['more', 'endings'], ['near', 'endings'], ['chair', 'endings'], ['door', 'endings'], ['catch', 'endings'], ['little', 'endings'], ['station', 'endings'], ['children', 'endings']
];
NO.forEach(([w, k]) => { if (w === 'chick' ) return; const r = PD.check(w, at(k)); ok(!r.ok, `"${w}" should NOT be decodable at ${k}`); });
const YES = [['cat', 'blending'], ['is', 'blending'], ['bell', 'word-families'], ['chick', 'digraphs'], ['stop', 'blends'], ['cake', 'final-e'], ['cakes', 'final-e'], ['rain', 'vowel-teams'], ['snow', 'vowel-teams'], ['fly', 'vowel-teams'], ['car', 'r-vowels'], ['cow', 'other-vowels'], ['jumped', 'endings'], ['baking', 'endings'], ['hopped', 'endings'], ['happy', 'endings'], ['was', 'word-families'], ['the', 'blending'], ['get', 'blending'], ['girl', 'r-vowels']];
YES.forEach(([w, k]) => { const r = PD.check(w, at(k)); ok(r.ok, `"${w}" should be decodable at ${k} (${r.why})`); });
// sound boxes
const sb = w => (PD.check(w, at('endings')).units || []).map(t => t.g).join('-');
ok(sb('ship') === 'sh-i-p', 'ship -> sh-i-p, got ' + sb('ship'));
ok(sb('cake') === 'c-a_e-k-e', 'cake -> c-a_e-k-e, got ' + sb('cake'));
ok(sb('light') === 'l-igh-t', 'light -> l-igh-t, got ' + sb('light'));
ok(sb('baking') === 'b-a_e-k-e-ing', 'baking -> b-a_e-k-e-ing, got ' + sb('baking'));
ok(sb('hopped') === 'h-o-p-ed', 'hopped -> h-o-p-ed, got ' + sb('hopped'));
ok(sb('seed') === 's-ee-d', 'seed -> s-ee-d, got ' + sb('seed'));
ok(sb('filled') === 'f-i-ll-ed', 'filled -> f-i-ll-ed, got ' + sb('filled'));

// heart words: each is new at its step (not taught twice), and not simply decodable where it is taught (except the early s=/z/ word "is")
console.log('Heart words');
const hseen = {};
data.steps.forEach((s, i) => (s.heart || []).forEach(h => {
  const w = h.w.toLowerCase();
  ok(!hseen[w], `heart word "${h.w}" is taught twice`); hseen[w] = 1;
  if (w !== 'is') {
    const c2 = Object.assign({}, ctxs[i], { heart: {} });
    ok(!PD.check(w, c2).ok, `heart word "${h.w}" is regular at step ${s.key}; it needn't be a heart word`);
  }
}));

console.log(`\n${passes} passed, ${fails} failed (${storyWords} words in sentences and stories checked)`);
process.exit(fails ? 1 : 0);
