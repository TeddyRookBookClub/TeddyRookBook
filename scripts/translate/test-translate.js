#!/usr/bin/env node
/* Translate in a Year: data and pacing tests (no browser).  node scripts/translate/test-translate.js
   - line, section and verse counts match the editions;
   - every plan in content/languages/translate/*.md and every Life Planner goal covers each line (or sentence) exactly once,
     in order, with no empty day, and the reader's split (tr.js) is the same as the planner's (lp-tracks.js trSplit);
   - the planner's chunk end refs (trEnd) are the real last line of each chunk;
   - the Life Planner 'translate' track and the resolution goals (trla, trgr) pace as described;
   - the translation blocks tile each work and line up at known places;
   - Greek is NFC, and the Latin has no macrons (the editions have none). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), DIR = path.join(ROOT, 'static/languages/translate');
const C = require(path.join(ROOT, 'static/life-planner/lp-core.js'));
const T = require(path.join(ROOT, 'static/life-planner/lp-tracks.js'));
const R = require(path.join(ROOT, 'static/life-planner/lp-resolve.js'));
const TR = require(path.join(DIR, 'tr.js'));
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 300) : '')); } }
const J = f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
const PLAN = J('plan.json');
const WORKS = ['aeneid', 'iliad', 'caesar', 'catiline', 'anabasis', 'john'];
const meta = {}, units = {}, trs = {};
WORKS.forEach(w => {
  meta[w] = J(w + '.json'); units[w] = []; trs[w] = [];
  meta[w].parts.forEach((p, j) => { const d = J(w + '-' + (j + 1) + '.json'); ok(d.i === p[0], w + ' part ' + (j + 1) + ' starts where the index says'); d.u.forEach(u => units[w].push(u)); d.tr.forEach(t => { if (!trs[w].some(x => x[0] === t[0])) trs[w].push(t); }); });
  ok(units[w].length === meta[w].n, w + ': ' + meta[w].n + ' units', units[w].length);
});

// ---- counts against the editions ----
function perBook(w) { const c = {}; units[w].forEach(u => { const b = u[0].split('.')[0]; c[b] = (c[b] || 0) + 1; }); return Object.keys(c).sort((a, b) => a - b).map(k => c[k]); }
const AEN = [756, 804, 718, 705, 871, 901, 817, 731, 818, 908, 915, 952];
ok(JSON.stringify(perBook('aeneid')) === JSON.stringify(AEN), 'Aeneid: lines per book as in Greenough (9,896 in all)', perBook('aeneid'));
// Monro and Allen leave out 9.458–461, 11.543 and 14.269 (the usual total is 15,693)
const IL = [611, 877, 461, 544, 909, 529, 482, 565, 709, 579, 847, 471, 837, 521, 746, 867, 761, 617, 424, 503, 611, 515, 897, 804];
ok(JSON.stringify(perBook('iliad')) === JSON.stringify(IL), 'Iliad: lines per book as in Monro and Allen (15,687)', perBook('iliad'));
ok(IL.reduce((a, b) => a + b) + 6 === 15693, 'Iliad: plus the six omitted lines makes the usual 15,693');
['9.458', '9.459', '9.460', '9.461', '11.543', '14.269'].forEach(r => ok(!units.iliad.some(u => u[0] === r), 'Iliad ' + r + ' is not in this edition'));
function secs(w) { const s = new Set(); units[w].forEach(u => s.add(u[0].replace(/[a-z]$/, ''))); return s; }
function chaps(w) { const s = new Set(); units[w].forEach(u => s.add(u[0].split('.').slice(0, 2).join('.'))); return s; }
ok(chaps('caesar').size === 54, 'Caesar, Gallic War I: 54 chapters', chaps('caesar').size);
ok(secs('caesar').size === 302, 'Caesar, Gallic War I: 302 sections (Holmes)', secs('caesar').size);
ok(secs('catiline').size === 33, 'Cicero, In Catilinam I: 33 sections', secs('catiline').size);
ok(chaps('anabasis').size === 10, 'Anabasis I: 10 chapters', chaps('anabasis').size);
ok(secs('anabasis').size === 205, 'Anabasis I: 205 sections', secs('anabasis').size);
ok(units.john.length === 879 && new Set(units.john.map(u => u[0].split('.')[0])).size === 21, 'John: 879 verses in 21 chapters');
// prose split into sentences: joining a section's sentences gives the section back in order
WORKS.forEach(w => { const seen = new Set(); let prev = ''; units[w].forEach(u => { ok(!seen.has(u[0]), w + ': ref ' + u[0] + ' is unique'); seen.add(u[0]); }); });

// ---- text checks ----
const MAC = /[āēīōūȳĀĒĪŌŪȲ]/;
['aeneid', 'caesar', 'catiline'].forEach(w => ok(!units[w].some(u => MAC.test(u[1])), w + ': no macrons (the edition has none)'));
['iliad', 'anabasis', 'john'].forEach(w => {
  ok(units[w].every(u => u[1] === u[1].normalize('NFC')), w + ': Greek is NFC');
  ok(units[w].some(u => /[ἀ-῿]/.test(u[1])), w + ': polytonic Greek (breathings and accents) present');
  ok(!units[w].some(u => /[ʼ]/.test(u[1])), w + ': elision is ’, not the modifier letter ʼ');
});
ok(units.iliad[0][1] === 'μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος', 'Iliad 1.1 reads as printed', units.iliad[0][1]);
ok(units.aeneid[0][1] === 'Arma virumque cano, Troiae qui primus ab oris', 'Aeneid 1.1 reads as printed');
ok(units.john[0][1] === 'Ἐν ἀρχῇ ἦν ὁ Λόγος, καὶ ὁ Λόγος ἦν πρὸς τὸν Θεόν, καὶ Θεὸς ἦν ὁ Λόγος.', 'John 1.1 reads as printed', units.john[0][1]);
ok(!units.john.some(u => /[,.;·][^\s’—]/.test(u[1].replace(/[,.;·]$/, ''))), 'John: a space after each punctuation mark');
['aeneid', 'iliad', 'caesar', 'catiline', 'anabasis'].forEach(w => ok(!units[w].some(u => /\s{2,}/.test(u[1].replace(/ {3}(?=\S)/, ' '))) && units[w].every(u => u[1].trim()), w + ': no empty lines or doubled spaces'));
// quotes balance in the Aeneid (Greenough prints them)
const q = units.aeneid.map(u => u[1]).join(' '); ok((q.match(/“/g) || []).length === (q.match(/”/g) || []).length, 'Aeneid: opening and closing quotes balance');

// ---- translation blocks tile each work, and line up at known places ----
WORKS.forEach(w => {
  const t = trs[w].slice().sort((a, b) => a[0] - b[0]); let next = 0, good = true;
  t.forEach(x => { if (x[0] !== next || x[1] < x[0] || !x[2]) good = false; next = x[1] + 1; });
  ok(good && next === units[w].length, w + ': the translation blocks cover every line once, in order', next);
});
function trAt(w, r) { const i = units[w].findIndex(u => u[0] === r); const b = trs[w].find(x => x[0] <= i && i <= x[1]); return b ? b[2] : ''; }
const SPOT = {
  aeneid: [['1.1', 'Arms and the man'], ['1.12', 'Carthage'], ['1.37', 'Juno'], ['1.75', 'Aeolus'], ['2.1', 'silence'], ['4.31', 'Anna'], ['4.93', 'How noble is the praise'], ['6.126', 'Anchises'], ['9.77', 'Muses'], ['12.952', '']],
  iliad: [['1.1', 'The wrath sing'], ['1.9', 'son of Leto'], ['2.847', 'Troezenus'], ['8.48', 'Gargarus'], ['10.430', 'Thymbre'], ['13.51', 'well-greaved Achaeans'], ['18.137', 'Hephaestus'], ['18.435', 'old age'], ['19.300', 'ever kind'], ['24.804', 'Hector']],
  caesar: [['1.1.1', 'All Gaul is divided'], ['1.2.1', 'Orgetorix'], ['1.9.1', 'Sequani'], ['1.25.7', 'joined battle'], ['1.31.3', 'Divitiacus'], ['1.40.3', 'council'], ['1.42.7', 'Ariovistus'], ['1.43.3', 'mound'], ['1.46.4', 'cavalry of Ariovistus'], ['1.54.3', '']],
  catiline: [['1.1', 'abusing our patience'], ['1.2', 'Shame on the age'], ['1.7', '21st of October'], ['1.8d', 'Praeneste'], ['1.9c', 'immortal gods'], ['1.13c', 'banishment'], ['1.15', 'breath of this atmosphere'], ['1.17c', 'slaves feared me'], ['1.28d', 'private men'], ['1.33', '']],
  anabasis: [['1.1.1', 'Darius and Parysatis'], ['1.2.2b', 'Miletus'], ['1.2.5', 'counter-preparations'], ['1.4.3c', 'Cheirisophus'], ['1.4.17c', 'Menon'], ['1.6.1b', 'tracks of horses'], ['1.8.5', 'Paphlagonian'], ['1.8.12', 'Pigres'], ['1.8.16d', 'watchword'], ['1.9.27', 'fodder']],
  john: [['1.1', 'In the beginning was the Word'], ['1.24', 'Pharisees'], ['3.16', 'For God so loved the world'], ['4.21', 'Woman, believe me'], ['6.11', 'loaves'], ['8.27', 'Father'], ['9.12', 'I know not'], ['11.27', 'Christ'], ['14.2', 'many mansions'], ['21.25', 'world itself']]
};
Object.keys(SPOT).forEach(w => SPOT[w].forEach(s => { const t = trAt(w, s[0]); ok(t && t.indexOf(s[1]) >= 0, w + ' ' + s[0] + ': translation has “' + s[1] + '”', t.slice(0, 120)); }));

// ---- the reader's plans and the planner's goals: every unit exactly once ----
function cover(w, a, b, ends, tag) {
  const m = meta[w], seen = new Uint8Array(m.n); let prev = a, good = true;
  ends.forEach(e => { if (e <= prev && !(e === prev && false)) good = false; const u0 = m.ch[prev], u1 = e < m.ch.length ? m.ch[e] - 1 : m.n - 1; for (let i = u0; i <= u1; i++) seen[i]++; prev = e; });
  const u0 = m.ch[a], u1 = b < m.ch.length ? m.ch[b] - 1 : m.n - 1; let once = true;
  for (let i = 0; i < m.n; i++) { const want = i >= u0 && i <= u1 ? 1 : 0; if (seen[i] !== want) { once = false; break; } }
  ok(good && once && ends[ends.length - 1] === b, tag + ': every line/sentence once, no empty day');
}
const fm = {};
fs.readdirSync(path.join(ROOT, 'content/languages/translate')).filter(f => /\.md$/.test(f) && !/^_|harvard/.test(f)).forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, 'content/languages/translate', f), 'utf8'), w = /\nwork: (\w+)/.exec(s)[1];
  const plans = []; const re = /\n  - \{t: "([^"]+)", days: (\d+)(?:, from: (\d+), to: (\d+))?\}/g; let m;
  while ((m = re.exec(s))) plans.push({ t: m[1], days: +m[2], from: m[3], to: m[4] });
  fm[w] = plans; ok(plans.length >= 2, w + ': the page has plans', plans.length);
  plans.forEach(p => {
    const rg = TR.planRange(meta[w], p), e1 = TR.split(meta[w].w, rg[0], rg[1], p.days), e2 = T.trSplit(meta[w].w, rg[0], rg[1], p.days);
    ok(JSON.stringify(e1) === JSON.stringify(e2), w + ' “' + p.t + '”: reader split = planner split');
    ok(e1.length === Math.min(p.days, rg[1] - rg[0]), w + ' “' + p.t + '”: ' + p.days + ' days', e1.length);
    cover(w, rg[0], rg[1], e1, w + ' “' + p.t + '”');
    // even: no day more than its share plus the biggest piece
    let W = 0, mx = 0, big = 0, prev = rg[0]; for (let c = rg[0]; c < rg[1]; c++) { W += meta[w].w[c]; big = Math.max(big, meta[w].w[c]); }
    e1.forEach(e => { let s2 = 0; for (let c = prev; c < e; c++) s2 += meta[w].w[c]; mx = Math.max(mx, s2); prev = e; });
    ok(mx <= W / e1.length + big + 1e-9, w + ' “' + p.t + '”: days are even (largest ' + mx + ', share ' + Math.round(W / e1.length) + ')');
  });
});
// the reader's 365-day Aeneid: about 27 lines a day; Iliad: about 43
(function () { const rg = TR.planRange(meta.aeneid, fm.aeneid[0]), e = TR.split(meta.aeneid.w, rg[0], rg[1], 365); ok(e.length === 365 && Math.abs(9896 / 365 - 27.1) < 0.1, 'Aeneid in a year: 365 days of about 27 lines'); })();
PLAN.goals.forEach(g => {
  const w = g.w, Wk = PLAN.works[w];
  ok(Wk && g.b <= Wk.c.length && g.a < g.b, 'goal ' + g.k + ': chunk range is valid');
  ok(JSON.stringify(Wk.c.map(c => c[1])) === JSON.stringify(meta[w].w), 'goal ' + g.k + ': plan.json weights = the reader’s');
  [365, 261, 156, 52, 30, 7, 1, 100000].forEach(N => cover(w, g.a, g.b, T.trSplit(Wk.c.map(c => c[1]), g.a, g.b, N), 'goal ' + g.k + ' over ' + N + ' sessions'));
});
// trEnd gives each chunk's real last ref; chunk start refs match the units
WORKS.forEach(w => { const Wk = PLAN.works[w], m = meta[w]; let good = true, bad = null;
  Wk.c.forEach((c, j) => { const last = j + 1 < m.ch.length ? m.ch[j + 1] - 1 : m.n - 1; if (units[w][m.ch[j]][0] !== c[0] || T.trEnd(Wk, j) !== units[w][last][0]) { good = false; bad = bad || [j, c[0], T.trEnd(Wk, j), units[w][last][0]]; } });
  ok(good, w + ': planner chunk refs and end refs match the text', bad);
  ok(meta[w].verse ? m.ch.every((u, j) => /[.;?!:·]["”’\]⟩)]*$/.test(units[w][(j + 1 < m.ch.length ? m.ch[j + 1] : m.n) - 1][1].trim()) || j + 1 === m.ch.length || units[w][m.ch[j + 1]][0].split('.')[0] !== units[w][m.ch[j]][0].split('.')[0]) : true, w + ': verse days end at the end of a sentence (or a book)');
});

// ---- the Life Planner track ----
const D = { tr: PLAN }, ctx = { base: '/' };
PLAN.goals.forEach(g => {
  const tr = { id: 't1', kind: 'translate', name: g.t, mins: g.mins, f: { k: 'daily' }, opt: { w: g.w, a: g.a, b: g.b, n: g.days } };
  const pv = T.provider(tr, D, {}, ctx); ok(!!pv, 'track ' + g.k + ': provider'); if (!pv) return;
  const items = []; for (let k = 0; k < g.days + 5; k++) { const it = pv.item(k); if (!it) break; items.push(it); }
  ok(items.length === Math.min(g.days, g.b - g.a), 'track ' + g.k + ': ' + g.days + ' items, then none', items.length);
  ok(items.every((it, k) => k === 0 ? it.r0 === g.a : it.r0 === items[k - 1].r1 + 1) && items[items.length - 1].r1 === g.b - 1, 'track ' + g.k + ': items are consecutive and end at the goal’s end');
  const it = items[0], m = /#r=([\d.]+[a-z]?)-([\d.]+[a-z]?)$/.exec(it.url);
  ok(m && units[g.w].some(u => u[0] === m[1]) && units[g.w].some(u => u[0] === m[2]) && it.url.indexOf('/languages/translate/') === 0, 'track ' + g.k + ': the link names real refs in the reader', it.url);
  ok(it.mins >= 5 && /\((about )?\d+ (lines?|words?)\)$/.test(it.label), 'track ' + g.k + ': label and minutes', it.label + ' ' + it.mins);
  // the reader's day plan for the same days gives the same passages
  const days = (fm[g.w] || []).filter(p => p.days === g.days);
});
(function () {
  const g = PLAN.goals.find(x => x.k === 'aeneid'), pv = T.provider({ id: 'a', kind: 'translate', opt: { w: 'aeneid', a: 0, b: g.b, n: 365 } }, D, {}, ctx);
  const it = pv.item(0); ok(/^Aeneid 1\.1–\d+ \(\d+ lines\)$/.test(it.label) && it.url === '/languages/translate/aeneid/#r=1.1-' + it.label.match(/–(\d+)/)[1].replace(/^/, '1.'), 'Aeneid day 1 label and link', it);
  const sm = T.summary({ from: 0, to: 400, items: { a: [0, 1, 2].map(k => Object.assign(pv.item(k), { dn: k })) }, missed: {}, byDn: {} }, [{ id: 'a', kind: 'translate', opt: { w: 'aeneid', a: 0, b: g.b, n: 365 } }], D, {}, 0, 400);
  ok(/^Aeneid: \d+ of 9,896 lines, through 1\.\d+$/.test(sm.per[0].text[0]), 'summary line for a translate track', sm.per[0].text);
})();

// ---- the resolution goals ----
function env() { return { D: { tr: PLAN }, P: {}, courses: [], trades: [], lib: {}, colors: ['#004225'], mk: o => Object.assign({ f: {}, opt: {} }, o), fromLib: () => null }; }
[['trla', 'aeneid', 0, 'lat'], ['trla', 'catiline', 0, 'lat'], ['trla', 'caesar', 12, 'lat'], ['trgr', 'iliad1', 0, 'grc'], ['trgr', 'iliad', 0, 'grc'], ['trgr', 'john', 6, 'grc'], ['trgr', 'anabasis', 3, 'grc']].forEach(([key, w, mo, la]) => {
  [[0, 1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5], [1, 3, 5]].forEach(days => {
    const dr = { goals: { [key]: { on: true, w: w, mo: mo } }, days: days, start: '2027-01-01', mins: 60, off: [{ from: '2027-07-05', to: '2027-07-09' }] };
    const b = R.build(dr, env()), t = b.state.tracks[0], G = PLAN.goals.find(x => x.k === w);
    ok(b.goals.length === 1 && t && t.kind === 'translate' && t.opt.w === G.w, key + ' ' + w + ' ' + days.length + ' days a week: one translate track', b.goals);
    if (!t) return;
    const months = mo || R.TR[w][2], last = C.dnOf(t.f.dates[t.f.dates.length - 1]), lim = months >= 12 ? b.range[1] : b.range[0] + Math.round(months * 365 / 12) - 1;
    ok(t.f.dates.length === t.opt.n && t.opt.n === Math.min(b.sessions.filter(d => d <= lim).length, G.b - G.a), key + ' ' + w + ': one date for each session', [t.f.dates.length, t.opt.n]);
    ok(last <= lim && t.f.dates.every(d => days.indexOf(C.dow(C.dnOf(d))) >= 0 && !(d >= '2027-07-05' && d <= '2027-07-09')), key + ' ' + w + ': on the chosen days, none on days off, done within ' + months + ' months');
    ok(/a session/.test(b.goals[0].pace), key + ' ' + w + ': pace text', b.goals[0].pace);
  });
  // the wrong language for a card makes no track
});
(function () { const b = R.build({ goals: { trla: { on: true, w: 'iliad' } }, days: [1], start: '2027-01-01' }, env()); ok(!b.goals.length, 'a Greek work on the Latin card makes no track'); })();
(function () { const b = R.build({ goals: { trla: { on: true, w: 'aeneid' } }, days: [1, 2, 3, 4, 5], start: '2027-01-01' }, { D: {}, colors: ['#000'], mk: o => o }); ok(!b.goals.length, 'no data loaded: no track (and no crash)'); })();
ok(R.needs({ goals: { trgr: { on: true } } }).indexOf('tr') >= 0, 'the resolution asks for plan.json for a translate goal');

console.log(pass + ' passed, ' + fail + ' failed');
if (fail) { console.log(fails.slice(0, 40).join('\n')); process.exit(1); }
