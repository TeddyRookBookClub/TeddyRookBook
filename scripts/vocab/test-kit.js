#!/usr/bin/env node
/* Tests for the Vocabulary Ladder kit and model (static/vocab/viz/vocab.js) in node, without a browser:
   - the kit's names: at least 30 backdrops, 25 cast members, 20 animals and 120 props; every part draws without throwing,
     with no NaN or undefined in the SVG and with balanced tags (every pose, mood and wear item on every cast member,
     every animal pose, every prop with and without words, every effect, every backdrop by day and by night)
   - the model: 1,000 words in 100 topics of 10, levels and strands, the roots table points at list words
   - text helpers: mark, blank, plain, form, say
   - the word cards: every mode draws; the quiet card and the picture side do not show the word
   - checkScene catches unknown names, fields and references
   - the generators: for every topic with entries, problems from every maker have a right answer among distinct choices,
     and no wrong choice is a listed synonym of the answer (so there is one best answer)
   Run: node scripts/vocab/test-kit.js                                                                                */
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..', '..');
global.window = global;
require(path.join(ROOT, 'static/math/core/gen.js'));
require(path.join(ROOT, 'static/vocab/viz/vocab.js'));
const ML = global.MathLadder, VO = ML.vocab, N = VO.NAMES;
let fails = 0, passes = 0;
function ok(c, m) { if (c) passes++; else { fails++; if (fails < 60) console.log('FAIL', m); } }
function wellFormed(svg) { // balanced tags, no NaN / undefined
  if (/NaN|undefined|Infinity/.test(svg)) return 'has NaN/undefined';
  const st = []; const re = /<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g; let m;
  while ((m = re.exec(svg))) { if (m[3]) continue; if (!m[1]) st.push(m[2]); else if (st.pop() !== m[2]) return 'unbalanced </' + m[2] + '>'; }
  return st.length ? 'unclosed <' + st.pop() + '>' : '';
}
function draws(what, f) { let s; try { s = f(); } catch (e) { ok(false, what + ' threw ' + e.message); return ''; } const w = wellFormed(s); ok(!w && s.length > 20, what + ' ' + (w || 'is empty')); return s; }

// 1. names and parts
ok(N.backdrops.length >= 30, 'backdrops ' + N.backdrops.length);
ok(N.cast.length >= 25, 'cast ' + N.cast.length);
ok(N.animals.length >= 20, 'animals ' + N.animals.length);
ok(N.props.length >= 120, 'props ' + N.props.length);
N.backdrops.forEach(b => { draws('backdrop ' + b, () => '<svg>' + VO.backdropSVG(b) + '</svg>'); draws('backdrop ' + b + ' at night', () => '<svg>' + VO.backdropSVG(b, true) + '</svg>'); });
N.cast.forEach(c => N.poses.forEach(p => draws(c + ' ' + p, () => '<svg>' + VO.personSVG({ who: c, pose: p }) + '</svg>')));
N.moods.forEach(m => draws('mood ' + m, () => '<svg>' + VO.personSVG({ who: 'zoe', mood: m }) + '</svg>'));
N.wear.forEach(w => draws('wear ' + w, () => '<svg>' + VO.personSVG({ who: 'kai', wear: [w] }) + '</svg>'));
N.animals.forEach(a => { draws('animal ' + a, () => '<svg>' + VO.animalSVG({ kind: a }) + '</svg>'); ['jump', 'lie', 'fly', 'swim'].forEach(p => draws('animal ' + a + ' ' + p, () => VO.sceneSVG({ bg: 'park', animals: [{ kind: a, pose: p, say: 'Hi' }], alt: 'x' }))); });
N.props.forEach(p => { draws('prop ' + p, () => '<svg>' + VO.propSVG(p) + '</svg>'); draws('prop ' + p + ' with words', () => '<svg>' + VO.propSVG(p, { text: 'WORDS' }) + '</svg>'); draws('held ' + p, () => VO.sceneSVG({ bg: 'room', cast: [{ who: 'ada', pose: 'give', holds: p }], alt: 'x' })); });
N.fx.forEach(f => draws('effect ' + f, () => VO.sceneSVG({ bg: 'park', cast: [{ who: 'pip' }], fx: [{ kind: f, on: 'c0' }], alt: 'x' })));
N.cast.forEach(c => ['say', 'think', 'shout', 'whisper'].forEach(k => draws(c + ' ' + k, () => VO.sceneSVG({ bg: 'park', cast: [{ who: c, [k]: 'A longer line of words to wrap in the bubble' }], alt: 'x' }))));
// a busy scene: everything fits in the frame (the viewBox) and quiet mode hides hidden labels
const busy = { bg: 'classroom', cast: [{ who: 'ivy', x: 15, pose: 'point', say: 'Look!' }, { who: 'theo', x: 40, pose: 'sit', think: 'Hmm…' }, { who: 'greta', x: 65, row: 'back' }, { who: 'rex', x: 88, pose: 'shout', shout: 'NOW!' }],
  animals: [{ kind: 'cat', x: 52, s: 0.8 }], props: [{ kind: 'sign', x: 30, text: 'QUIET' }], fx: [{ kind: 'sparkle', on: 'c0', at: 'hand' }],
  labels: [{ text: 'SECRET', on: 'c1', hide: true }, { text: 'A caption tag', x: 50, y: 92 }], alt: 'A busy classroom.' };
const loud = draws('busy scene', () => VO.sceneSVG(busy)), quiet = VO.sceneSVG(busy, { quiet: true });
ok(loud.includes('SECRET') && !quiet.includes('SECRET'), 'quiet mode hides a label with hide: true');
ok(/viewBox="0 0 400 300"/.test(loud) && /aria-label="A busy classroom\."/.test(loud), 'scene viewBox and alt text');
ok(VO.checkScene(busy).length === 0, 'busy scene passes checkScene: ' + VO.checkScene(busy).join('; '));

// 2. checkScene finds problems
const bad = VO.checkScene({ bg: 'moon', cast: [{ who: 'zed', pose: 'fly', holdScale: 2 }], props: [{ kind: 'spaceship' }], fx: [{ kind: 'boom', on: 'c5' }], labels: [{ on: 'a2' }], extra: 1 });
['backdrop "moon"', 'cast member "zed"', 'pose "fly"', 'unknown field "holdScale"', 'prop "spaceship"', 'effect on "c5"', 'a label has no text', 'label on "a2"', 'scene field "extra"', 'no alt'].forEach(m => ok(bad.some(x => x.includes(m)), 'checkScene finds ' + m));

// 3. the model
const L = VO.list(), T = VO.topics();
ok(L.length === 1000, 'list has 1000 words (' + L.length + ')');
ok(T.length === 100 && T.every(t => t.words.length === 10), '100 topics of 10');
ok(new Set(L.map(r => r.w.toLowerCase())).size === 1000, 'no word twice');
ok(T.every((t, i) => t.n === i + 1 && t.level === Math.floor(i / 10) + 1 && t.strand === i % 10 + 1), 'topic n, level and strand follow the grid');
ok(L.every(r => r.g && r.pos && r.t && r.level >= 1 && r.level <= 10), 'every word has gloss, pos, topic and level');
ok(L.every(r => /^(adj|noun|verb)$/.test(r.pos)), 'parts of speech');
ok(VO.find('Benevolent') && VO.find('benevolent').t === 'bene-mal', 'find is case-insensitive');
const rk = VO.rootKeys(); ok(rk.length >= 100, 'roots table ' + rk.length);
rk.forEach(k => { const R0 = VO.ROOT(k); ok(R0.form && R0.means && R0.kind, 'root ' + k + ' complete'); R0.words.forEach(w => ok(!!VO.find(w), 'root ' + k + ' word "' + w + '" is on the list')); });
L.forEach(r => r.r.forEach(k => ok(!!VO.ROOT(k), r.w + ' root key ' + k)));
ok(L.filter(r => r.r.length).length >= 400, 'words tagged with roots: ' + L.filter(r => r.r.length).length);

// 4. text helpers
ok(VO.mark('Her {benevolent} smile') === 'Her <b class="vo-hl">benevolent</b> smile', 'mark');
ok(VO.plain('Her {benevolent} smile') === 'Her benevolent smile', 'plain');
ok(VO.form('a {maligned} man') === 'maligned', 'form');
ok(/______/.test(VO.blank('a {x} b')) && !/\{/.test(VO.blank('a {x} b')), 'blank');
ok(VO.say('buh-NEV-uh-lunt') === '<span class="vo-say">buh-<b>NEV</b>-uh-lunt</span>', 'say');
ok(VO.mark('<b>') === '&lt;b&gt;', 'mark escapes HTML');

// 5. word cards and generators, for every topic with entries
const words = fs.readdirSync(path.join(ROOT, 'data/vocab/words')).filter(f => f.endsWith('.json'));
words.forEach(f => { const D0 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/vocab/words', f), 'utf8')); VO.addEntries({ [f.replace(/\.json$/, '')]: D0.words }); });
ok(words.length >= 1, 'at least one word file');
const withE = L.filter(r => VO.entry(r.w));
withE.forEach(r => {
  const e = VO.entry(r.w), re = new RegExp('\\b' + r.w + '\\b', 'i');
  ['card', 'print', 'front', 'word', 'mini'].forEach(mode => draws(r.w + ' card ' + mode, () => VO.cardHTML(e, { mode: mode })));
  const q = VO.cardHTML(e, { mode: 'card', quiet: true }).replace(/<svg[^]*?<\/svg>/g, '');
  ok(!re.test(q.replace(/data-word="[^"]*"/, '')), r.w + ': the quiet card does not show the word');
  const front = VO.cardHTML(e, { mode: 'front', quiet: true }).replace(/data-word="[^"]*"|aria-label="[^"]*"/g, '');
  ok(!re.test(front.replace(/<[^>]+>/g, ' ')), r.w + ': the picture side does not spell the word');
});
// one best answer, checked over every entry with the entries' own data (written independently of the kit's code):
// a word's cluster is the word, its synonyms and its family; near(w) = w and all words sharing a cluster with it;
// alike = near sets meet; opposed = an antonym listed in a cluster of one is near the other
const RAW = []; words.forEach(f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data/vocab/words', f), 'utf8')).words.forEach(e => RAW.push(e)));
const lo = x => String(x).toLowerCase(), NBt = new Map(), ANt = new Map(), nearC = new Map(), oppC = new Map();
const addT = (m, a, b) => { if (!m.has(a)) m.set(a, new Set()); m.get(a).add(b); };
RAW.forEach(e => {
  const cl = [...new Set([e.word, ...(e.syn || []), ...(e.family || []).map(f => f.w)].map(lo))], an = [...new Set((e.ant || []).map(lo))];
  for (const a of cl) { for (const b of cl) addT(NBt, a, b); for (const b of an) { addT(ANt, a, b); addT(ANt, b, a); } }
});
const nearT = w => { w = lo(w); if (!nearC.has(w)) nearC.set(w, new Set([w, ...(NBt.get(w) || [])])); return nearC.get(w); };
const oppT = w => { w = lo(w); if (!oppC.has(w)) { const o = new Set(); for (const q of nearT(w)) for (const x of (ANt.get(q) || [])) o.add(x); oppC.set(w, o); } return oppC.get(w); };
const meet = (A, B) => { for (const x of A) if (B.has(x)) return true; return false; };
const alikeT = (a, b) => meet(nearT(a), nearT(b)), opposedT = (a, b) => meet(oppT(a), nearT(b)) || meet(oppT(b), nearT(a));
const expectAn = w => /^(hour|heir|honest|honor)/i.test(w) || (/^[aeiou]/i.test(w) && !/^(u(bi|ni|s[aeiu]|t[eio]|r[aeiu]|ku)|eu|ewe|one\b|once)/i.test(w));
const second = {};
const seen = {};
withE.forEach(r => {
  const e = VO.entry(r.w), pool = VO.entries(e.topic);
  (VO.gen.makers || []).forEach(kind => {
    for (let s = 0; s < 12; s++) {
      const R = ML.rand(kind + r.w + s); let p;
      try { p = VO.gen.make(kind, e, pool, R); } catch (er) { ok(false, kind + ' ' + r.w + ' threw ' + er.message); continue; }
      if (!p) continue; seen[kind] = (seen[kind] || 0) + 1;
      if (kind === 'tf' && p.a.v === false) ok(p.src && p.src.length === 1 && !alikeT(p.src[0], e.word), 'tf ' + r.w + ': the false meaning belongs to an unrelated word (' + (p.src || []).join() + ')');
      const txt = JSON.stringify(p);
      ok(!/undefined|NaN|\[object/.test(txt), kind + ' ' + r.w + ': clean text');
      ok(p.q && p.a && Array.isArray(p.steps) && p.steps.length, kind + ' ' + r.w + ': q, a, steps');
      if (p.a.t === 'mc') {
        const ch = p.a.choices, right = ch[p.a.v];
        ok(new Set(ch).size === ch.length && ch.length === 4, kind + ' ' + r.w + ': four distinct choices ' + ch.join('|'));
        const wrong = ch.filter((c, i) => i !== p.a.v), bad = [];
        if (/^(word|cloze|cloze3|hook)$/.test(kind)) wrong.forEach(c => { if (alikeT(c, e.word)) bad.push(c + ' is alike in meaning'); });
        if (kind === 'synonym') wrong.forEach(c => { if (alikeT(c, e.word) || alikeT(c, right)) bad.push(c + ' is also close in meaning'); if (opposedT(c, e.word) || opposedT(c, right)) bad.push(c + ' is an opposite'); });
        if (kind === 'antonym') wrong.forEach(c => { if (opposedT(c, e.word)) bad.push(c + ' is also an opposite'); if (alikeT(c, right)) bad.push(c + ' is close to the opposite ' + right); });
        if (/^(meaning|usage)$/.test(kind)) { ok(Array.isArray(p.src) && p.src.length === 3, kind + ' ' + r.w + ': sources of the wrong choices'); (p.src || []).forEach(w => { if (alikeT(w, e.word)) bad.push('the choice from ' + w + ' (alike in meaning)'); }); }
        if (bad.length) second[kind] = (second[kind] || 0) + 1;
        ok(!bad.length, kind + ' ' + r.w + ': one best answer (' + ch.join(' | ') + '): ' + bad.join('; '));
        if (kind === 'usage') wrong.forEach(c => {
          const m = new RegExp('\\b(a|an)\\s+' + e.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').exec(c);
          if (m) ok((m[1].toLowerCase() === 'an') === expectAn(e.word), 'usage ' + r.w + ': article before the word in "' + c + '"');
          ok(/^[“"‘']?[A-Z0-9]/.test(c), 'usage ' + r.w + ': the sentence starts with a capital: "' + c + '"');
        });
        if (/^(cloze|cloze3|word)$/.test(kind)) ok(ch.filter((c, i) => i !== p.a.v).every(c => !(e.syn || []).includes(c)), kind + ' ' + r.w + ': no synonym among the wrong choices (' + ch.join('|') + ')');
        if (/^(meaning|word|cloze|cloze3|hook)$/.test(kind) && right !== undefined) ok(kind === 'meaning' ? right === e.def : right.toLowerCase().indexOf(r.w.slice(0, 4).toLowerCase()) === 0, kind + ' ' + r.w + ': the right choice is the word or its meaning (' + right + ')');
      }
    }
  });
});
ok(Object.keys(seen).length >= 10, 'problem kinds made: ' + Object.keys(seen).join(', '));
ok(!Object.keys(second).length, 'problems with a second defensible answer, by kind: ' + JSON.stringify(second));

// 6. quiet mode hides the word and its real forms only
const qs = (w, quiet) => { const e = VO.entry(w); return e ? VO.sceneSVG(e.scene, { quiet: quiet, word: w, entry: e }).replace(/aria-label="[^"]*"/g, '') : ''; };
[['sparse', 'SPARE'], ['statute', 'STATUE'], ['stifle', 'STIFF'], ['jaded', 'JADE'], ['shrewd', 'SHREW'], ['banal', 'BANANA']].forEach(([w, cue]) => {
  const loud = qs(w, false), q = qs(w, true), re = new RegExp('\\b' + cue + '\\b', 'i');
  if (re.test(loud)) ok(re.test(q), w + ': the sound-alike cue ' + cue + ' stays on the picture side');
});
ok(VO.hideForms('BENEFACTOR = the GIVER', 'benefactor') === '? = the GIVER', 'quiet: the word in a label becomes ?');
ok(VO.hideForms('She was self-effacing, even self effacing.', 'self-effacing', '__') === 'She was __, even __.', 'quiet: hyphenated words');
ok(VO.hideForms('a bona fide offer', 'bona fide', '__') === 'a __ offer', 'quiet: two-word answers');
ok(VO.hideForms('SPARE the SPARSE, sparsely', 'sparse') === 'SPARE the ?, ?', 'quiet: inflections and family hidden, sound-alikes kept');
ok(VO.hideForms('He maligned them; maligning is wrong', 'malign') === 'He ? them; ? is wrong', 'quiet: verb inflections');
ok(!/YIELD/i.test(qs('yield', true)) || !VO.entry('yield'), 'quiet: words on a sign are hidden too');

// 7. label sizes and the spotlight
const sized = VO.sceneSVG({ bg: 'park', labels: [{ text: 'ONE', x: 20, y: 90, size: 0.8 }, { text: 'TWO', x: 50, y: 90, size: 'small' }, { text: 'THREE', x: 80, y: 90, size: 18 }, { text: 'FOUR', x: 50, y: 60, size: '20' }, { text: 'FIVE', x: 50, y: 40, size: 'big' }], alt: 'x' });
['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].forEach(t => { const m = new RegExp('font-size="([\\d.]+)"[^>]*>' + t + '<').exec(sized); ok(m && +m[1] >= 8 && +m[1] <= 26, 'label size: ' + t + ' drawn at ' + (m && m[1])); });
const spot = VO.sceneSVG({ bg: 'theater', cast: [{ who: 'ada', x: 50 }], fx: [{ kind: 'spotlight', on: 'c0' }], alt: 'x' });
ok(spot.indexOf('#fff7c2') >= 0 && spot.indexOf('#fff7c2') < spot.indexOf('vo-person'), 'the spotlight is drawn behind the person');

// 8. robust makers: a topic whose words are all near-synonyms of each other (added last: it joins the shared pool)
const twins = ['glad', 'joyful', 'cheerful', 'merry'].map((w, i) => ({ word: 'zzword' + i, pos: 'adj', def: 'test meaning ' + i, ex: 'A {zzword' + i + '} day.', ctx: 'It was a {zzword' + i + '} day, full of smiles.', syn: ['happy', w], ant: ['sad'], family: [] }));
VO.addEntries({ 'zz-test': twins });
twins.forEach(e => ['tf', 'meaning', 'word', 'synonym', 'antonym', 'cloze', 'usage'].forEach(k => { for (let s = 0; s < 40; s++) { let p; try { p = VO.gen.make(k, e, VO.entries('zz-test'), ML.rand(k + s)); } catch (er) { ok(false, k + ' on near-synonym twins threw ' + er.message); break; } if (p && p.a.t === 'mc') ok(p.a.choices.length === 4, k + ' on twins: four choices'); if (k === 'tf' || k === 'meaning') ok(!!p, k + ' on twins: made'); } }));
// topic generators at every level, and the roots generator
withE.map(r => VO.entry(r.w).topic).filter((t, i, a) => a.indexOf(t) === i).forEach(t => [1, 2, 3].forEach(lv => { for (let s = 0; s < 30; s++) { const p = VO.gen.topic('adv.' + t, ML.rand(t + lv + s), { level: lv }); ok(p && p.q && p.a, 'topic ' + t + ' level ' + lv + ' seed ' + s); } }));
rk.filter(k => VO.ROOT(k).words.length >= 3).forEach(k => { for (let s = 0; s < 4; s++) { let p; try { p = VO.gen.root([k], ML.rand(k + s), { level: 1 + s % 3 }); } catch (er) { ok(false, 'root ' + k + ' threw ' + er.message); continue; } ok(p && p.q && p.a && !/undefined|NaN/.test(JSON.stringify(p)), 'root generator ' + k); } });

console.log((fails ? 'FAILED ' + fails + ', ' : '') + 'passed ' + passes + ' checks (' + N.backdrops.length + ' backdrops, ' + N.cast.length + ' cast, ' + N.poses.length + ' poses, ' + N.moods.length + ' moods, ' + N.animals.length + ' animals, ' + N.props.length + ' props, ' + N.fx.length + ' effects, ' + N.wear.length + ' wear items; ' + withE.length + ' word entries)');
process.exit(fails ? 1 : 0);
