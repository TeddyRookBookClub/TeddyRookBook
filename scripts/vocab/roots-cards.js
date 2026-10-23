#!/usr/bin/env node
/* Vocabulary Ladder: put word cards into the Greek and Latin Roots lessons.

   node scripts/vocab/roots-cards.js            refresh the cards in data/vocab/lessons/roots.json
   node scripts/vocab/roots-cards.js --check    exit 1 if the cards are out of date (nothing is written)

   Roots topic pages load the roots course's generators, not the Advanced Vocabulary ones, so a { word } card would find no
   entry there. Instead, each roots lesson lists the list words it shows as cards ("cards": ["impeccable", …]); this script
   copies each one's full entry from data/vocab/words/<topic>.json into a vo-word block (opts.entry), placed under a
   "Meet the words" heading just before the lesson's "mistake" box. Words whose entries are not written yet are left out
   and come in on the next run. Run it after word files change (build.js does not touch the roots lessons). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const LF = path.join(ROOT, 'data/vocab/lessons/roots.json'), WD = path.join(ROOT, 'data/vocab/words');
const CHECK = process.argv.includes('--check');
const entries = {};
if (fs.existsSync(WD)) fs.readdirSync(WD).filter(f => f.endsWith('.json')).forEach(f => {
  try { (JSON.parse(fs.readFileSync(path.join(WD, f), 'utf8')).words || []).forEach(e => { if (e && e.word) entries[e.word.toLowerCase()] = e; }); }
  catch (e) { console.error('skipping data/vocab/words/' + f + ': ' + e.message); }
});
const L = JSON.parse(fs.readFileSync(LF, 'utf8'));
let shown = 0, waiting = [];
Object.keys(L).forEach(id => {
  const les = L[id], blocks = (les.blocks || []).filter(b => !b.card);
  const cards = (les.cards || []).map(w => [w, entries[String(w).toLowerCase()]]);
  cards.filter(c => !c[1]).forEach(c => waiting.push(c[0]));
  const add = cards.filter(c => c[1]).map(c => ({ t: 'viz', name: 'vo-word', opts: { word: c[0], entry: c[1] }, cap: 'A word from the list: ' + c[0] + '.', card: true }));
  if (add.length) {
    let at = blocks.findIndex(b => b.t === 'mistake'); if (at < 0) at = blocks.findIndex(b => b.t === 'try'); if (at < 0) at = blocks.length;
    blocks.splice(at, 0, { t: 'h', text: add.length > 1 ? 'Meet the words' : 'Meet the word', card: true }, ...add);
    shown += add.length;
  }
  les.blocks = blocks;
});
const out = JSON.stringify(L, null, 1) + '\n', old = fs.readFileSync(LF, 'utf8');
console.log('roots lessons: ' + shown + ' word cards shown' + (waiting.length ? '; waiting for entries: ' + waiting.join(', ') : '') + (out === old ? '; up to date' : CHECK ? '; OUT OF DATE' : '; wrote data/vocab/lessons/roots.json'));
if (out !== old) { if (CHECK) process.exit(1); fs.writeFileSync(LF, out); }
