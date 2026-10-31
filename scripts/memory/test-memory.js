#!/usr/bin/env node
/* Memory challenges: tests for static/memory/challenges/core.js (answer matching, chunks, the 1-3-7-21 schedule,
   the seeded shuffle and card scoring, Major System pegs) and data/memory/digits.json (recomputed and checksummed),
   plus every list in data/memory/lists: each value matches itself when typed, chunks cover the list.
   Usage: node scripts/memory/test-memory.js */
'use strict';
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const M = require(path.join(ROOT, 'static/memory/challenges/core.js'));
let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) passes++; else { fails++; console.log('FAIL ' + msg); } }
function eq(a, b, msg) { ok(JSON.stringify(a) === JSON.stringify(b), msg + ': got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b)); }

/* ---------- answer matching ---------- */
const pres = ['George Washington', 'John Adams', 'John Quincy Adams', 'Abraham Lincoln', 'Ulysses S. Grant', 'Andrew Johnson', 'Lyndon B. Johnson', 'Theodore Roosevelt', 'Franklin D. Roosevelt'];
const m = (t, a, pool) => M.match(t, [].concat(a), pool || pres);
ok(m('george washington', 'George Washington').ok, 'case');
ok(m('  George   Washington ', 'George Washington').ok, 'spaces');
ok(m('Ulysses Grant', 'Ulysses S. Grant').ok, 'initials dropped');
ok(m('ulysses s grant', 'Ulysses S. Grant').ok, 'initial without the dot');
ok(m('Lincoln', 'Abraham Lincoln').ok, 'unique surname');
ok(!m('Adams', 'John Adams').ok && m('Adams', 'John Adams').ambiguous, 'shared surname is ambiguous');
ok(!m('Johnson', 'Andrew Johnson').ok, 'Johnson is ambiguous');
ok(!m('Roosevelt', 'Theodore Roosevelt').ok, 'Roosevelt is ambiguous');
ok(m('Abraham Lincon', 'Abraham Lincoln').ok, 'one-letter slip in a long name');
ok(!m('John Adam', 'John Quincy Adams').ok, 'a slip close to another item does not count');
ok(m('Saint Lucia', 'St. Lucia', ['St. Lucia', 'St. Kitts and Nevis']).ok, 'St. = Saint');
ok(m('st lucia', 'Saint Lucia', ['Saint Lucia']).ok, 'Saint = st');
ok(m('Mount Everest', 'Mt. Everest', ['Mt. Everest']).ok, 'Mt. = Mount');
ok(m('Gambia', 'The Gambia', ['The Gambia', 'Gabon']).ok, 'leading The');
ok(m('the bahamas', 'Bahamas', ['Bahamas']).ok, 'leading The typed');
ok(m('Sao Tome and Principe', 'São Tomé and Príncipe', ['São Tomé and Príncipe']).ok, 'accents');
ok(m('Bosnia & Herzegovina', 'Bosnia and Herzegovina', ['Bosnia and Herzegovina']).ok, '& = and');
ok(m("Cote d'Ivoire", 'Côte d’Ivoire', ['Côte d’Ivoire']).ok, 'curly apostrophe and accents');
ok(m('First Samuel', '1 Samuel', ['1 Samuel', '2 Samuel']).ok, 'First = 1');
ok(m('I Kings', '1 Kings', ['1 Kings', '2 Kings']).ok, 'Roman I = 1');
ok(m('II Kings', '2 Kings', ['1 Kings', '2 Kings']).ok, 'Roman II = 2');
ok(!m('1 Kings', '2 Kings', ['1 Kings', '2 Kings']).ok, '1 Kings is not 2 Kings');
ok(m('22nd', '22', ['22', '24']).ok, 'ordinal suffix');
ok(!m('23', '22', ['22', '23']).ok, 'numbers are exact');
ok(m('1789-1797', '1789–1797', ['1789–1797']).ok, 'dash kinds');
ok(m('FDR', M.answersFor({ name: 'Franklin D. Roosevelt', accept: ['FDR'] }, 'name', 'name')).ok, 'accept list');
ok(m('Song of Songs', M.answersFor({ book: 'Song of Solomon', accept: { book: ['Song of Songs'] } }, 'book', 'book'), ['Song of Solomon']).ok, 'accept map');
ok(!m('', 'Ohio').ok, 'empty is wrong');
ok(!m('Iowa', 'Ohio', ['Ohio', 'Iowa']).ok, 'a different item is wrong');
ok(m('North Dakota', 'N. Dakota', ['N. Dakota']).ok && m('N Dakota', 'North Dakota', ['North Dakota']).ok, 'N. = North');

/* ---------- math answers stay strict; never-asked fields ---------- */
ok(!M.match('a^(m-n)', ['a^(m+n)']).ok && M.match('a^(m+n)', ['a^(m+n)']).ok, 'a^(m+n) and a^(m-n) differ');
ok(M.match('a^2 + b^2 = c^2', ['a² + b² = c²']).ok, 'superscripts = ^');
ok(M.match('(a-b)^2=a^2-2ab+b^2', ['(a − b)² = a² − 2ab + b²']).ok && !M.match('(a+b)^2=a^2+2ab+b^2', ['(a − b)² = a² − 2ab + b²']).ok, 'minus signs count');
ok(M.match('A = πr²', ['A = πr²']).ok && M.match('A=pir^2', ['A = πr²']).ok && !M.match('A = 2πr', ['A = πr²']).ok, 'Greek letters count');
ok(M.isMath('10^12') && !M.isMath('1789–1797') && !M.isMath('George Washington'), 'isMath');
const nqItem = { country: 'X', capital: 'Y', noquiz: ['capital'] };
ok(M.noquiz(nqItem, 'capital') && !M.noquiz(nqItem, 'country'), 'noquiz');
ok(!M.usable({ ask: 'capital', from: ['country'] }, nqItem) && !M.usable({ ask: 'country', from: ['capital'] }, nqItem) && M.usable({ ask: 'region', from: ['country'] }, nqItem), 'usable skips a never-asked field as answer and as clue');

/* ---------- chunks ---------- */
function sizes(c) { return c.map(x => x.to - x.from); }
const mk = (n, lab) => Array.from({ length: n }, (_, i) => ({ v: i, chunk: lab ? lab(i) : undefined }));
eq(sizes(M.chunks(mk(5))), [5], '5 items: one chunk');
eq(sizes(M.chunks(mk(6))), [6], '6 items: one chunk');
eq(sizes(M.chunks(mk(7))), [4, 3], '7 items: 4 + 3');
eq(sizes(M.chunks(mk(8))), [4, 4], '8 items: 4 + 4');
eq(sizes(M.chunks(mk(12))), [4, 4, 4], '12 items: three chunks of 4 (the infographic)');
eq(sizes(M.chunks(mk(47))), [5, 5, 5, 5, 5, 5, 5, 4, 4, 4], '47 items: ten chunks of 4-5');
eq(sizes(M.chunks(mk(8, i => i < 4 ? 'inner' : 'outer'))), [4, 4], 'labels make chunks');
eq(sizes(M.chunks(mk(6, i => i < 5 ? 'a' : 'b'))), [6], 'a one-item group joins its neighbor');
eq(sizes(M.chunks(mk(13, i => i < 12 ? 'a' : 'b'))), [5, 4, 4], 'big group split, single merged');
for (let n = 1; n <= 130; n++) {
  const c = M.chunks(mk(n)); let at = 0;
  c.forEach(x => { ok(x.from === at, 'contiguous ' + n); at = x.to; ok(x.to - x.from <= 6 || n > 0 && false, 'chunk <= 6 for n=' + n); });
  ok(at === n, 'chunks cover all ' + n);
}

/* ---------- schedule ---------- */
let s = M.learn('2026-01-01');
eq([s.s, s.d], [0, '2026-01-02'], 'learned: due day 1');
s = M.review(s, true, '2026-01-02'); eq([s.s, s.d], [1, '2026-01-04'], 'day 1 passed: due day 3');
s = M.review(s, true, '2026-01-04'); eq([s.s, s.d], [2, '2026-01-08'], 'day 3 passed: due day 7');
s = M.review(s, true, '2026-01-08'); eq([s.s, s.d], [3, '2026-01-22'], 'day 7 passed: due day 21');
s = M.review(s, true, '2026-01-22'); eq([s.s, s.d, M.stageName(s)], [4, '2026-02-21', 'kept'], 'day 21 passed: monthly');
s = M.review(s, true, '2026-02-21'); eq(s.d, '2026-04-22', 'then 60 days');
s = M.review(s, false, '2026-04-22'); eq([s.s, s.a, s.d], [0, '2026-04-22', '2026-04-23'], 'a miss starts over tomorrow');
let late = M.review(M.learn('2026-03-01'), true, '2026-03-10'); eq(late.d, '2026-03-11', 'a late review never schedules into the past');
ok(M.isDue({ d: '2026-01-02' }, '2026-01-02') && !M.isDue({ d: '2026-01-03' }, '2026-01-02') && !M.isDue(null, '2026-01-02'), 'isDue');
eq(M.plan('2026-12-30').map(x => x.date), ['2026-12-31', '2027-01-02', '2027-01-06', '2027-01-20'], 'plan crosses the year');
eq(M.diff('2026-02-27', '2026-03-01'), 2, 'diff across February');

/* ---------- shuffle, deck, scoring ---------- */
const d1 = M.deal('abc123', 52), d2 = M.deal('abc123', 52), d3 = M.deal('abc124', 52);
eq(d1, d2, 'same seed, same deck');
ok(JSON.stringify(d1) !== JSON.stringify(d3), 'different seed, different deck');
eq([...d1].sort(), M.sortedDeck().sort(), 'a deal is a full deck, no repeats');
eq(M.deal('abc123', 10), d1.slice(0, 10), 'a 10-card set is the top of the same deck');
eq(d1.slice(0, 5), ['QD', '10S', '3H', '5H', '4D'], 'seed abc123 deals the recorded order (keeps shared links stable)');
const counts = {}; for (let i = 0; i < 4000; i++) { const t = M.shuffle([0, 1, 2], 'u' + i)[0]; counts[t] = (counts[t] || 0) + 1; }
ok(Object.values(counts).every(c => c > 1150 && c < 1520), 'shuffle is roughly uniform ' + JSON.stringify(counts));
eq(M.parseCards('KH 7s 10d, t♣ a♠').cards, ['KH', '7S', '10D', '10C', 'AS'], 'parse shorthand');
eq(M.parseCards('KH7S').cards, ['KH', '7S'], 'parse without spaces');
ok(M.parseCards('KH ZZ').bad === 'ZZ', 'flag text that is not a card');
eq(M.score(['AS', '2S', '3S', '4S'], ['AS', '2S', '4S', '3S']), { first: 2, until: 2, total: 2, of: 4, perfect: false }, 'score: first error and total');
eq(M.score(['AS', '2S'], ['AS', '2S']).perfect, true, 'perfect');
eq(M.score(['AS', '2S', '3S'], ['AS']), { first: 1, until: 1, total: 1, of: 3, perfect: false }, 'short answer');
eq(M.score(['AS', '2S', '3S'], ['KS', '2S', '3S']).until, 0, 'wrong first card');
eq(M.cardName('10H'), '10 of hearts', 'card name'); eq(M.cardName('QS'), 'queen of spades', 'court name');

/* ---------- digits ---------- */
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/memory/digits.json'), 'utf8'));
for (const k of ['pi', 'e']) {
  ok(crypto.createHash('sha256').update(D[k].digits).digest('hex') === D[k].sha256, k + ' matches its stored checksum');
  ok(D[k].digits.length === D[k].decimals + 1, k + ' length');
}
ok(D.pi.decimals === 1000 && D.e.decimals === 100, 'pi to 1000, e to 100');
// recompute: pi by Machin's formula, e by its series, with BigInt
function atanInv(x, U) { let s = U / x, t = s, n = 1n, sign = -1n; const x2 = x * x; while (t) { t /= x2; n += 2n; s += sign * (t / n); sign = -sign; } return s; }
const U = 10n ** 1020n;
const piCalc = (4n * (4n * atanInv(5n, U) - atanInv(239n, U))).toString().slice(0, 1001);
let eCalc = 0n, t = U, k2 = 0n; while (t) { eCalc += t; k2++; t /= k2; }
ok(piCalc === D.pi.digits, 'pi digits recomputed');
ok(eCalc.toString().slice(0, 101) === D.e.digits, 'e digits recomputed');
eq(M.digitCheck('14159', '1415'), { ok: true, at: -1, right: 4 }, 'digit check ok');
eq(M.digitCheck('14159', '1416'), { ok: false, at: 3, right: 3 }, 'digit check stops at first error');
eq(M.groups('14159265', 4), ['1415', '9265'], 'groups');

/* ---------- Major System pegs ---------- */
ok(M.PEG.length === 100 && new Set(M.PEG).size === 100 && M.ONE.length === 10, '100 pair words and 10 single words, all different');
eq(M.majorWords('1415'), ['tire', 'tail'], 'words for 1415');
eq(M.majorWords('92653'), ['bone', 'shell', 'home'], 'odd chunk ends with a single-digit word');

/* ---------- every list ---------- */
const { readYaml } = require('./check-lists.js');
const dir = path.join(ROOT, 'data/memory/lists');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.ya?ml$/.test(f)).map(f => path.join(dir, f)) : [];
const Y = files.length ? readYaml(files) : {};
let lists = 0, selfMiss = [];
for (const f of files) {
  const L = Y[f]; if (!L || L.__error || !Array.isArray(L.items)) continue;
  M.normList(L); lists++;
  const c = M.chunks(L.items); let at = 0;
  c.forEach(x => { ok(x.from === at && x.to - x.from >= 1 && x.to - x.from <= 6, L.slug + ': chunk ' + x.label + ' size ' + (x.to - x.from)); at = x.to; });
  ok(at === L.items.length, L.slug + ': chunks cover the list');
  const main = L.main || L.prompts[0].ask;
  for (const p of L.prompts) {
    const pool = L.items.map(x => String(x[p.ask] == null ? '' : x[p.ask]));
    L.items.forEach((it, i) => {
      const v = it[p.ask]; if (v == null || !M.usable(p, it)) return;
      // the typed answer, written exactly as the list shows it, must count as right
      const same = L.items.filter(x => p.from.every(kf => M.norm(x[kf]) === M.norm(it[kf]))).flatMap(x => M.answersFor(x, p.ask, main));
      if (!M.match(String(v), same, pool).ok) selfMiss.push(L.slug + ' item ' + (i + 1) + ' ' + p.ask + ': "' + v + '"');
      if (!M.norm(String(v))) selfMiss.push(L.slug + ' item ' + (i + 1) + ' ' + p.ask + ': "' + v + '" has no letters or digits to type');
    });
  }
}
// math answers: two different values of a field must never count as the same answer
for (const f of files) {
  const L = Y[f]; if (!L || L.__error || !Array.isArray(L.items)) continue;
  for (const p of L.prompts) {
    const vals = [...new Set(L.items.map(x => String(x[p.ask] == null ? '' : x[p.ask])).filter(Boolean))];
    if (!vals.some(M.isMath)) continue;
    const seen = {};
    vals.forEach(v => { const k = M.strict(v); if (seen[k] && seen[k] !== v) selfMiss.push(L.slug + ': "' + v + '" and "' + seen[k] + '" read the same'); seen[k] = v; });
    L.items.forEach(it => { const acc = M.answersFor(it, p.ask, L.main || L.prompts[0].ask); vals.forEach(o => { if (o !== String(it[p.ask]) && M.match(o, acc, []).ok) selfMiss.push(L.slug + ': "' + o + '" is accepted for "' + it[p.ask] + '"'); }); });
  }
}
ok(!selfMiss.length, 'every value matches itself when typed:\n   ' + selfMiss.slice(0, 30).join('\n   ') + (selfMiss.length > 30 ? '\n   ... ' + (selfMiss.length - 30) + ' more' : ''));
console.log(passes + ' passed, ' + fails + ' failed (' + lists + ' lists checked)');
process.exit(fails ? 1 : 0);
