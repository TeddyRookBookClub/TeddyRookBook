#!/usr/bin/env node
/* Lepanto trainer: tests for the pure parts of static/memory/challenges/lepanto.js (words, first-letter cues, cloze, the recall
   checker) and for data/memory/lepanto.yaml (every line in exactly one chunk, chunk sizes, scenes, glossary line numbers).
   The text itself is checked against its source by scripts/memory/check-lepanto.py.   Usage: node scripts/memory/test-lepanto.js */
'use strict';
const path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const P = require(path.join(ROOT, 'static/memory/challenges/lepanto.js'));
const D = JSON.parse(execFileSync('python3', ['-c', 'import sys,json,yaml;print(json.dumps(yaml.safe_load(open(sys.argv[1],encoding="utf-8"))))', path.join(ROOT, 'data/memory/lepanto.yaml')]).toString());
let fails = 0, passes = 0;
function ok(c, msg) { if (c) passes++; else { fails++; console.log('FAIL ' + msg); } }
const L = D.lines, N = L.length;

/* data */
ok(N === 143, '143 lines');
const cover = new Array(N).fill(0);
D.chunks.forEach(c => { for (let i = c.from - 1; i < c.to; i++) cover[i]++; ok(c.to - c.from + 1 >= 4 && c.to - c.from + 1 <= 7, 'chunk ' + c.from + '-' + c.to + ' has 4 to 7 lines'); });
ok(cover.every(k => k === 1), 'every line in exactly one chunk: ' + cover.map((k, i) => k !== 1 ? i + 1 : 0).filter(Boolean).join(','));
for (let i = 1; i < D.chunks.length; i++) ok(D.chunks[i].from === D.chunks[i - 1].to + 1, 'chunks in order at ' + D.chunks[i].from);
D.scenes.forEach(s => ok(D.chunks.some(c => c.from === s.from) && D.chunks.some(c => c.to === s.to), 'scene ' + s.title + ' starts and ends on chunk edges'));
ok(D.words === L.reduce((n, l) => n + l.split(/\s+/).length, 0), 'word count');
D.glossary.forEach(g => { const m = String(g.lines).match(/\d+/g) || []; m.forEach(x => ok(+x >= 1 && +x <= N, 'glossary ' + g.term + ' line ' + x)); });
const gl = { 'Soldan of Byzantium': 'Soldan', 'Mahound': 'Mahound', 'Giaours': 'Giaours', 'Kismet': 'Kismet', 'Domino gloria': 'Domino', 'Vivat Hispania': 'Vivat', 'swat': 'swat', 'girt': 'girt', 'tuckets': 'tuckets', 'houri': 'houri' };
D.glossary.forEach(g => { if (gl[g.term]) { const n = +String(g.lines).match(/\d+/)[0]; ok(L[n - 1].includes(gl[g.term]), 'glossary ' + g.term + ' points at its line (' + n + ')'); } });
ok(D.palace.length === D.scenes.length, 'one palace stop per scene');

/* words and cues */
ok(JSON.stringify(P.words('Love-light of Spain—hurrah!')) === '["love","light","of","spain","hurrah"]', 'words split on hyphens and dashes');
ok(P.norm('plumèd') === 'plumed' && P.norm("Philip's") === 'philips' && P.norm('Gray') === 'grey', 'norm: accents, apostrophes, spellings');
ok(P.firstLetters('White founts falling in the Courts of the sun,') === 'W f f i t C o t s,', 'first letters');
ok(P.firstLetters("It is he that saith not 'Kismet';") === "I i h t s n 'K;", 'first letters keep a leading quote');
ok(P.firstLetters('(Don John of Austria is going to the war.)') === '(D J o A i g t t w.)', 'first letters keep brackets');
ok(P.blank('Austria,') === '_______,', 'blank keeps punctuation');
let hidden = 0; for (let k = 0; k < 12; k++) if (P.clozeHide(k, 1, 0)) hidden++; ok(hidden === 3, 'level 1 hides every 4th word');
hidden = 0; for (let k = 0; k < 12; k++) if (P.clozeHide(k, 4, 0)) hidden++; ok(hidden === 12, 'level 4 hides all');

/* the recall checker */
const t = L.slice(0, 6).join('\n');
let r = P.check(t, t); ok(r.pass && r.ok === r.total, 'exact text passes');
r = P.check(t, t.toUpperCase().replace(/[^\w\s]/g, '')); ok(r.pass, 'case and punctuation do not matter');
r = P.check(t, t.replace('Soldan', 'Soldin')); ok(r.pass && r.slips === 1, 'a one-letter slip is accepted and counted');
r = P.check(t, t.replace('blood-red', 'bloodred')); ok(r.pass && r.ok === r.total, 'joined hyphen words line up');
r = P.check('Torchlight crimson', 'torch light crimson'); ok(r.pass, 'split compound lines up');
r = P.check(L[140], L[140].replace('for ever', 'forever')); ok(r.pass, 'forever = for ever');
r = P.check(L[114], 'they veil the plumed lions on the galleys of saint mark'); ok(r.pass, 'plumèd and St. accepted');
r = P.check(L[51], L[51].replace('grey', 'gray')); ok(r.pass, 'gray = grey');
r = P.check(t, t.replace('the darkness of his beard,', '')); ok(!r.pass && r.missed === 5, 'missed words flagged (' + r.missed + ')');
ok(r.words.filter(w => w.st === 'miss').map(w => w.w).join(' ') === 'the darkness of his beard', 'the right words are flagged');
r = P.check(t, t + ' and more'); ok(!r.pass && r.extra.join(' ') === 'and more', 'extra words are flagged');
r = P.check(t, t + ' um'); ok(!P.check(t, t + ' um').pass && P.check(t, t + ' um', { lenient: true }).pass, 'speech may add a filler word, typing may not');
r = P.check(t, ''); ok(!r.pass && r.missed === r.total, 'blank answer misses everything');
r = P.check(t, L.slice(0, 3).join(' ') + ' ' + L.slice(4, 6).join(' ')); ok(!r.pass && r.missed === P.words(L[3]).length, 'a skipped line is exactly the missed words');
const st = P.tokenStates(L.slice(0, 2), P.check(L.slice(0, 2).join(' '), 'white founts falling in the courts of the sun and the soldan of byzantium is smiling as they'));
ok(st[1][st[1].length - 1].st === 'miss' && st[0].every(x => x.st === 'ok'), 'token states mark the missed last word');
// the whole poem
const all = L.join('\n'); const t0 = Date.now(); r = P.check(all, all.toLowerCase()); ok(r.pass && Date.now() - t0 < 4000, 'whole-poem check passes quickly (' + (Date.now() - t0) + ' ms)');

console.log('Lepanto tests: ' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
