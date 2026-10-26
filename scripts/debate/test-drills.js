#!/usr/bin/env node
/* Tests for the drills, flow sheet and case builder logic (static/debate/*-core.js).
   Run: node scripts/debate/test-drills.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const R = require('../../static/debate/drills-core.js');
const F = require('../../static/debate/flow-core.js');
const C = require('../../static/debate/case-core.js');
const T = require('../../static/debate/timer-core.js');

let n = 0;
function ok(name, fn) { try { fn(); n++; } catch (e) { console.error('FAILED: ' + name); throw e; } }
function readDir(d) {
  const dir = path.join(__dirname, '../../data/debate', d), out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  return out;
}
const topics = readDir('topics').map(t => Object.assign({ url: '/debate/topics/' + t.slug + '/' }, t));
const formats = T.normalizeAll(readDir('formats'));
let fallacies = [];
const fp = path.join(__dirname, '../../data/debate/fallacies.json');
if (fs.existsSync(fp)) { const d = JSON.parse(fs.readFileSync(fp, 'utf8')); fallacies = Array.isArray(d) ? d : (d.fallacies || []); }

/* ---------- topics and drill items ---------- */
ok('filters', () => {
  const sample = [{ key: 'a', resolution: 'R1', level: 'beginner', category: 'school', formats: ['pf'] }, { key: 'b', resolution: 'R2', level: 'advanced', category: 'civics', formats: ['ld'] }];
  assert.strictEqual(R.filterTopics(sample, {}).length, 2);
  assert.deepStrictEqual(R.filterTopics(sample, { level: 'beginner' }).map(t => t.key), ['a']);
  assert.deepStrictEqual(R.filterTopics(sample, { category: 'civics', format: 'ld' }).map(t => t.key), ['b']);
  assert.strictEqual(R.filterTopics(sample, { category: 'civics', format: 'pf' }).length, 0);
});
ok('picking avoids repeating the last one', () => {
  const rnd = R.rng(7), list = [{ id: 1 }, { id: 2 }, { id: 3 }];
  let last = null;
  for (let i = 0; i < 200; i++) { const x = R.pickOne(list, rnd, last); assert.notStrictEqual(x, last); last = x; }
  assert.strictEqual(R.pickOne([], rnd), null);
});
if (topics.length) {
  ok('every topic level and category works in the picker', () => {
    const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/debate/meta.json'), 'utf8'));
    for (const l of meta.levels) for (const c of meta.categories) R.filterTopics(topics, { level: l.key, category: c.key });
    if (topics.length >= 20) {
      meta.levels.forEach(l => assert.ok(R.filterTopics(topics, { level: l.key }).length > 0, 'some topics at level ' + l.key));
      meta.categories.forEach(c => assert.ok(R.filterTopics(topics, { category: c.key }).length > 0, 'some topics in ' + c.key));
    }
  });
  ok('steelman drill: an item for every strawman, both sides', () => {
    const items = R.steelmanItems(topics);
    assert.strictEqual(items.length, topics.reduce((t, x) => t + (x.strawmen || []).length, 0));
    assert.ok(items.some(i => i.target === 'aff') && items.some(i => i.target === 'neg'));
    items.forEach(i => assert.ok(i.strawman && i.steelman && i.sideLabel && i.resolution));
  });
  ok('rebuttal drill: an item for every argument, both sides', () => {
    const items = R.rebuttalItems(topics);
    const total = topics.reduce((t, x) => t + x.sides.aff.args.length + x.sides.neg.args.length, 0);
    assert.strictEqual(items.length, total);
    assert.strictEqual(items.filter(i => i.side === 'aff').length, items.filter(i => i.side === 'neg').length);
  });
  ok('cross-ex drill: both sides of every topic', () => {
    const items = R.cxItems(topics);
    assert.strictEqual(items.length, topics.length * 2);
    items.forEach(i => assert.ok(i.questions.length && i.args.length));
  });
}
ok('four-step rebuttal check', () => {
  const item = { claim: 'School uniforms reduce bullying over clothing', warrant: 'Students cannot judge brands' };
  const empty = R.checkRebuttal({}, item);
  assert.strictEqual(empty.ok, false); assert.ok(empty.steps.every(s => !s.ok));
  const good = R.checkRebuttal({ say: 'They say uniforms reduce bullying', but: 'but bullies find other targets quickly', because: 'because studies of uniform schools show no drop in reported bullying', therefore: 'therefore their first contention falls and cannot outweigh our cost argument' }, item);
  assert.strictEqual(good.ok, true, JSON.stringify(good));
  const off = R.checkRebuttal({ say: 'They talk about stuff', but: 'but that is wrong here', because: 'because it is', therefore: 'therefore we win this round' }, item);
  assert.strictEqual(off.steps[0].ok, false, 'restatement should use their words');
  const long = R.checkRebuttal({ say: new Array(40).fill('uniforms').join(' '), but: 'x y z w', because: 'a b c d', therefore: 'so it matters here' }, item);
  assert.strictEqual(long.steps[0].ok, false, 'too long');
});

/* ---------- fallacy spotter and weighing ---------- */
const LOGIC = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/logic/topics/informal.json'), 'utf8'));
const logicTitle = {}; LOGIC.topics.forEach(t => { logicTitle[t.slug] = t.title; });
ok('fallacy names and links match the Logic Ladder', () => {
  Object.keys(R.FALLACY_NAMES).forEach(slug => assert.strictEqual(R.FALLACY_NAMES[slug], logicTitle[slug], slug));
  assert.ok(logicTitle['fallacy-or-not'], 'the "no fallacy" lesson exists');
  fallacies.forEach(f => { if (logicTitle[f.slug]) assert.strictEqual(f.name, logicTitle[f.slug], 'fallacies.json name for ' + f.slug); });
});
ok('fallacy items: valid answers, unique ids, every fallacy used, four distinct choices', () => {
  const ids = new Set();
  R.FALLACIES.forEach(x => { assert.ok(!ids.has(x.id)); ids.add(x.id); assert.ok(x.a === 'none' || R.FALLACY_NAMES[x.a], x.id); assert.ok(x.lines.length && x.ex); });
  Object.keys(R.FALLACY_NAMES).forEach(k => assert.ok(R.FALLACIES.some(x => x.a === k), 'an item for ' + k));
  const rnd = R.rng(3);
  for (const x of R.FALLACIES) for (let i = 0; i < 20; i++) {
    const ch = R.fallacyChoices(x, rnd, fallacies);
    assert.strictEqual(ch.length, 4);
    assert.strictEqual(new Set(ch.map(c => c.slug)).size, 4);
    assert.ok(ch.some(c => c.slug === R.fallacyInfo(x.a, fallacies).slug));
    ch.forEach(c => assert.ok(/^\/logic\/informal-logic\/[a-z-]+\/$/.test(c.url) && logicTitle[c.url.split('/')[3]], c.url));
  }
});
ok('weighing items and the weighing sentence', () => {
  const ks = R.MECH.map(m => m.k);
  R.WEIGH.forEach(w => assert.ok(ks.includes(w.m) && w.a && w.b && w.ex));
  ks.forEach(k => assert.ok(R.WEIGH.filter(w => w.m === k).length >= 2, 'two or more items for ' + k));
  const s = R.weighSentence('jobs now', 'a crash someday', { magnitude: [2, 5], probability: [5, 1], timeframe: [5, 2], reversibility: [3, 3] });
  assert.ok(/^Jobs now outweighs a crash someday on probability and timeframe/.test(s), s);
  assert.ok(/Even if a crash someday is bigger/.test(s), s);
  assert.ok(/even on every measure/.test(R.weighSentence('a', 'b', { magnitude: [3, 3] })));
  assert.ok(/wins on magnitude/.test(R.weighSentence('a', 'b', { magnitude: [1, 3] })));
});
ok('impromptu: prep then speech', () => {
  const p = T.buildPlan(R.impromptuFormat(120, 300), {});
  assert.deepStrictEqual(p.segs.map(s => s.sec), [120, 300]);
  assert.strictEqual(p.prepPer, 'none');
});

/* ---------- flow sheet ---------- */
ok('flow columns follow each format, cross-ex only when asked', () => {
  for (const f of formats) {
    const cols = F.columnsFor(f), withCx = F.columnsFor(f, { cx: true });
    assert.ok(cols.length >= 2, f.key);
    assert.ok(cols.every(c => c.si >= -1));
    if (!f.cycle) {
      assert.strictEqual(cols.length, f.speeches.filter(s => !/cross/.test(s.kind)).length, f.key);
      assert.strictEqual(withCx.length, f.speeches.length, f.key);
    }
    const sheets = F.blankSheets(f);
    assert.ok(sheets.length >= 1 && sheets.every(s => s.cols.length));
    if (f.sides.length === 2 && !f.cycle) assert.strictEqual(sheets.length, 2, f.key + ' prints two sheets');
  }
});
ok('flow: add, answer, below, delete, text and file round trip', () => {
  const f = formats.find(x => x.key === 'ld') || formats[0];
  const fl = F.make(f, { name: 'Round 1' });
  const a = F.add(fl, 0, 'C1: uniforms cost less');
  const b = F.answer(fl, a.id, 'Turn: up-front cost');
  assert.strictEqual(b.col, 1); assert.strictEqual(b.row, a.row); assert.strictEqual(b.parent, a.id);
  const b2 = F.answer(fl, a.id, 'No evidence');
  assert.strictEqual(F.cell(fl, 0, 1).length, 2, 'two answers share a cell');
  const c = F.below(fl, a.id, 'C2: fewer distractions');
  assert.strictEqual(c.row, 1);
  const d = F.add(fl, 2, 'new in 1AR');
  assert.strictEqual(d.row, 2);
  // inserting below row 0 pushes later rows down
  F.below(fl, a.id, 'C1b'); assert.strictEqual(F.byId(fl, c.id).row, 2); assert.strictEqual(F.byId(fl, d.id).row, 3);
  // last column can't be answered
  let last = F.add(fl, fl.cols.length - 1, 'end'); assert.strictEqual(F.answer(fl, last.id), null);
  // deleting the parent hands its answers to its own parent (none here)
  F.remove(fl, a.id); assert.strictEqual(F.byId(fl, b.id).parent, null);
  F.toggleDrop(fl, c.id); assert.ok(F.byId(fl, c.id).dropped);
  const txt = F.toText(fl, f.name);
  assert.ok(/Round 1 \(/.test(txt) && /\[dropped\]/.test(txt) && /Turn: up-front cost/.test(txt));
  const back = F.clean(JSON.parse(JSON.stringify(fl)));
  assert.deepStrictEqual(back.cards.map(k => k.text).sort(), fl.cards.map(k => k.text).sort());
  assert.strictEqual(F.clean({ cols: 'x' }), null);
  assert.strictEqual(F.clean({ cols: [{ short: 'A' }], cards: [{ col: 9, row: -3, parent: 'missing', text: 5 }] }).cards[0].col, 0);
  void b2;
});
ok('flow: unanswered arguments', () => {
  const f = formats.find(x => x.key === 'ld') || formats[0];
  const fl = F.make(f);
  const a = F.add(fl, 0, 'C1'); const a2 = F.add(fl, 0, 'C2');
  F.answer(fl, a.id, 'answer');
  assert.deepStrictEqual(F.unanswered(fl).map(k => k.text).sort(), ['C2', 'answer']);
  assert.ok(F.unanswered(fl).some(k => k.id === a2.id));
  assert.ok(!F.unanswered(fl).some(k => k.id === a.id));
});

/* ---------- case builder ---------- */
ok('case: make, word count, gaps, move, text, clean', () => {
  const c = C.make({ name: 'Uniforms', fmt: 'ld', side: 'Affirmative' });
  assert.strictEqual(c.useVC, true, 'LD cases start with a value and criterion');
  assert.strictEqual(C.make({ fmt: 'pf' }).useVC, false);
  c.resolution = 'Resolved: Public schools should require uniforms.';
  c.value = 'Justice'; c.criterion = 'Equal opportunity';
  c.contentions[0].tag = 'Cost';
  Object.assign(c.contentions[0].cards[0], { claim: 'Uniforms cost less.', warrant: 'One set replaces many outfits.', evidence: 'A quoted line.', cite: 'Author, 2024', impact: 'Families save money.' });
  c.contentions.push(C.contention('Focus'));
  assert.ok(C.wordCount(c) > 20);
  assert.strictEqual(C.readSec(c, 150), Math.round(C.wordCount(c) / 150 * 60));
  const g = C.gaps(c);
  assert.ok(g.some(x => /contention 2, point 1: claim, warrant, evidence, impact/.test(x)), g.join('|'));
  assert.ok(!g.some(x => /contention 1/.test(x)));
  assert.ok(C.move(c.contentions, 1, -1)); assert.strictEqual(c.contentions[0].tag, 'Focus');
  assert.ok(!C.move(c.contentions, 0, -1));
  const t = C.toText(c, 'Lincoln-Douglas Debate');
  assert.ok(/^Uniforms \(Lincoln-Douglas Debate, Affirmative\)/.test(t));
  assert.ok(/Value: Justice/.test(t) && /CONTENTION 2: Cost/.test(t) && /Evidence: "A quoted line."/.test(t) && /Source: Author, 2024/.test(t));
  const back = C.clean(JSON.parse(JSON.stringify(c)));
  assert.deepStrictEqual(back, c);
  assert.strictEqual(C.clean({}), null);
  const odd = C.clean({ contentions: [{ tag: 5, cards: [{ claim: 'x', bad: 1 }, null] }], defs: [null, { term: 't' }] });
  assert.strictEqual(odd.contentions[0].cards.length, 1); assert.strictEqual(odd.contentions[0].cards[0].warrant, ''); assert.strictEqual(odd.defs.length, 1);
});

console.log('drills, flow and case: ' + n + ' checks passed (' + topics.length + ' topics)');
