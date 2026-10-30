#!/usr/bin/env node
/* Family Study: check the unit library and the plans (static/homeschool/family/plan.js) with the ladders' generators.

   node scripts/family/test-family.js [--pub <built site folder>] [-v]

   1. Every unit in data/family/units/*.yaml resolves: its key matches the file name; it has a title, subject, icon,
      blurb, parts and projects; every part has a read link, three questions, an activity and topic ids for levels A–D;
      every topic id is in a ladder's skill map (data/<ladder>/topics/<course>.json) and has a generator registered with
      that id; every project has a task and a rubric of three or more lines. With --pub, every read and "more" URL
      must be a page in that build (<pub>/<url>/index.html).
   2. Every unit, built for children aged 6, 9 and 14 over 6 weeks (and 2 and 12 weeks), gets its worksheets, quizzes
      and test from the generators: each set has the number of problems asked for, at the generator level the plan
      chose, from that week's topics, and each answer-key entry matches its problem (an mc letter points at the right
      choice; the canonical answer passes ML.check).
   3. Ancient Egypt for ages 6, 9 and 14 over 6 weeks, 4 days a week, in detail: levels A, B and D; six weeks, one part
      each; the topics are the unit's topics for each child's level; a weekly quiz in weeks 1–5 and the test in week 6;
      a project that starts in week 4 for every child (the second half of the unit); 24 planner days.
   YAML is read with python3 (PyYAML), as the site's other scripts do. Exit status 1 on any failure.                */
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process');
var ROOT = path.resolve(__dirname, '..', '..');
var args = process.argv.slice(2), PUB = null, V = false;
for (var i = 0; i < args.length; i++) { if (args[i] === '--pub') PUB = args[++i]; else if (args[i] === '-v') V = true; }

// ---------- data (YAML through python3) ----------
var DATA = JSON.parse(cp.execFileSync('python3', ['-c', [
  'import json, yaml, glob, os, sys',
  'R = sys.argv[1]',
  'units = {os.path.basename(f)[:-5]: yaml.safe_load(open(f)) for f in sorted(glob.glob(R + "/data/family/units/*.yaml"))}',
  'lads = yaml.safe_load(open(R + "/data/ladders.yaml"))',
  'courses = {}',
  'for L in lads:',
  '    f = R + "/data/" + L["key"] + "/courses.yaml"',
  '    if os.path.exists(f):',
  '        for c in yaml.safe_load(open(f)) or []: courses[c["key"]] = {"ladder": L["key"], "slug": L["slug"], "cslug": c["slug"], "grade": str(c.get("grade", ""))}',
  'print(json.dumps({"units": units, "courses": courses}))'
].join('\n'), ROOT], { maxBuffer: 64 << 20 }).toString());

global.window = global;
global.CAS = require(path.join(ROOT, 'static/homeschool/calc/cas.js'));
['gen', 'tex', 'check'].forEach(function (f) { require(path.join(ROOT, 'static/math/core', f + '.js')); });
var ML = global.MathLadder, F = require(path.join(ROOT, 'static/homeschool/family/plan.js'));

var fails = 0, checks = 0;
function bad(where, what) { fails++; console.log('FAIL ' + where + ': ' + what); }
function ok(cond, where, what) { checks++; if (!cond) bad(where, what); return cond; }

// topics and generators, loaded on demand (kits that run without a DOM first, as check-gen.js does)
var T = {}, loaded = {}, kits = {};
function loadCourse(ck) {
  if (loaded[ck] !== undefined) return loaded[ck];
  var c = DATA.courses[ck]; if (!c) return (loaded[ck] = false);
  var tf = path.join(ROOT, 'data', c.ladder, 'topics', ck + '.json');
  if (!fs.existsSync(tf)) return (loaded[ck] = false);
  JSON.parse(fs.readFileSync(tf, 'utf8')).topics.forEach(function (t) { T[t.id] = { t: t.title, u: '/' + c.slug + '/' + c.cslug + '/' + t.slug + '/', g: c.grade }; });
  if (c.ladder !== 'math' && !kits[c.ladder]) {
    kits[c.ladder] = 1; var kf = path.join(ROOT, 'static', c.ladder, 'viz', c.ladder + '.js');
    if (fs.existsSync(kf)) { try { var sb = { console: console }; sb.window = sb; require('vm').runInNewContext(fs.readFileSync(kf, 'utf8'), sb, { timeout: 5000 }); require(kf); } catch (e) { } }
  }
  var gf = path.join(ROOT, 'static', c.ladder, 'gen', ck + '.js');
  if (!fs.existsSync(gf)) return (loaded[ck] = false);
  require(gf); return (loaded[ck] = true);
}
function topicOk(id) { var ck = String(id).split('.')[0]; loadCourse(ck); return !!T[id] && ML.hasGen(id); }

// ---------- 1. the library ----------
var SUBJECTS = ['history', 'science', 'geography', 'language', 'math', 'art', 'logic', 'nature'];
Object.keys(DATA.units).forEach(function (k) {
  var u = DATA.units[k], w = 'unit ' + k;
  ok(u && u.key === k, w, 'key does not match the file name');
  ['title', 'icon', 'blurb'].forEach(function (f) { ok(typeof u[f] === 'string' && u[f].trim(), w, 'missing ' + f); });
  ok(SUBJECTS.indexOf(u.subject) >= 0, w, 'subject "' + u.subject + '" is not one of ' + SUBJECTS.join(', '));
  ok(Array.isArray(u.parts) && u.parts.length >= 4 && u.parts.length <= 8, w, 'needs 4 to 8 parts');
  (u.parts || []).forEach(function (p, pi) {
    var pw = w + ' part ' + (pi + 1);
    ok(p.title, pw, 'no title');
    ok(Array.isArray(p.read) && p.read.length === 2 && /^\//.test(p.read[1]), pw, 'read must be ["Title", "/url/"]');
    ok(Array.isArray(p.ask) && p.ask.length === 3, pw, 'ask needs three questions');
    ok(typeof p.do === 'string' && p.do.length > 20, pw, 'no family activity');
    if (PUB) [p.read].concat(p.more || []).forEach(function (r) { if (r && r[1]) ok(fs.existsSync(path.join(PUB, r[1], 'index.html')), pw, 'no page at ' + r[1]); });
    'ABCD'.split('').forEach(function (L) {
      ok(Array.isArray(p[L]) && p[L].length >= 2, pw, 'level ' + L + ' needs at least two topic ids');
      (p[L] || []).forEach(function (id) { ok(topicOk(id), pw, 'level ' + L + ': ' + id + (T[id] ? ' has no generator' : ' is not a ladder topic')); });
    });
  });
  'ABCD'.split('').forEach(function (L) {
    var pr = (u.projects || {})[L];
    ok(pr && pr.t && pr.do && Array.isArray(pr.rubric) && pr.rubric.length >= 3, w, 'project ' + L + ' needs t, do and a rubric of 3 or more');
  });
});
var nUnits = Object.keys(DATA.units).length;
ok(nUnits >= 24 && nUnits <= 36, 'library', nUnits + ' units (24 to 36 expected)');

// ---------- 2. sets and answer keys ----------
function checkSet(sp, where, allowed) {
  var items = F.makeSet(ML, sp), lv = {};
  sp.ids.forEach(function (x) { lv[x[0]] = x[1]; });
  ok(items.length === sp.n, where, items.length + ' of ' + sp.n + ' problems made');
  items.forEach(function (it, j) {
    var p = it.p, iw = where + ' #' + (j + 1) + ' (' + it.id + ')';
    ok(allowed.indexOf(it.id) >= 0, iw, 'topic is not one of this set\'s topics');
    ok(p.level === lv[it.id] && it.gl === lv[it.id], iw, 'made at level ' + p.level + ', planned ' + lv[it.id]);
    ok(ML.validateProblem(p).length === 0, iw, 'invalid problem: ' + ML.validateProblem(p).join('; '));
    var key = F.keyOf(p, ML);
    if (p.a.t === 'mc') {
      var v = Array.isArray(p.a.v) ? p.a.v : [p.a.v];
      ok(key.letter === v.map(function (i) { return String.fromCharCode(65 + i); }).join(', ') && key.text === v.map(function (i) { return p.a.choices[i]; }).join('; '), iw, 'mc key ' + key.letter + ' does not match choice ' + v);
    } else if (p.a.t === 'tf') ok(key.text === (p.a.v ? 'True' : 'False'), iw, 'tf key wrong');
    else ok(key.text && key.text.length > 0, iw, 'empty key');
    var r = null; try { r = ML.check(p.a, ML.answerValue(p.a), { q: p.q, unit: p.unit }); } catch (e) { r = { ok: false, msg: e.message }; }
    ok(r && r.ok, iw, 'the key answer does not pass ML.check' + (r && r.msg ? ': ' + r.msg : ''));
  });
  return items.length;
}
var FAMILY = [{ name: 'Anna', age: 6 }, { name: 'Ben', age: 9 }, { name: 'Cora', age: 14 }], made = 0, sets = 0;
Object.keys(DATA.units).forEach(function (k) {
  var u = DATA.units[k];
  [6, 2, 12].forEach(function (W, wi) {
    var plan = F.build(u, FAMILY, { weeks: W, days: 4, seed: 'test' + wi }, T);
    ok(plan.W.length === W, k, W + ' weeks asked, ' + plan.W.length + ' planned');
    var covered = {}; plan.W.forEach(function (w) { w.parts.forEach(function (p) { covered[p] = 1; }); });
    ok(Object.keys(covered).length === u.parts.length, k + ' ' + W + ' wk', 'not every part is covered');
    plan.W.forEach(function (w) {
      w.kids.forEach(function (c, ki) {
        var L = plan.kids[ki].lv, mine = [].concat.apply([], u.parts.map(function (p) { return p[L]; }));
        c.topics.forEach(function (id) { ok(mine.indexOf(id) >= 0, k, 'week ' + w.n + ' gives ' + id + ' to level ' + L); });
        if (wi > 0 && w.n > 1) return; // all sets for 6 weeks; the first week (and the test) for 2 and 12
        [['ws', c.ws], ['quiz', c.quiz], ['test', c.test]].forEach(function (x) {
          if (!x[1]) return; sets++;
          made += checkSet(x[1], k + ' ' + W + 'wk week ' + w.n + ' ' + plan.kids[ki].name + ' ' + x[0], x[0] === 'test' ? mine : c.topics);
        });
      });
    });
    if (wi > 0) plan.W[W - 1].kids.forEach(function (c, ki) { if (c.test) { sets++; made += checkSet(c.test, k + ' ' + W + 'wk test ' + plan.kids[ki].name, [].concat.apply([], u.parts.map(function (p) { return p[plan.kids[ki].lv]; }))); } });
  });
});

// ---------- 3. Ancient Egypt for ages 6, 9 and 14 ----------
(function () {
  var u = DATA.units['ancient-egypt'], w = 'egypt 6/9/14';
  if (!ok(u, w, 'no ancient-egypt unit')) return;
  var plan = F.build(u, FAMILY, { weeks: 6, days: 4, seed: 7 }, T);
  ok(plan.kids.map(function (k) { return k.lv; }).join('') === 'ABD', w, 'levels ' + plan.kids.map(function (k) { return k.lv; }).join(''));
  plan.W.forEach(function (wk, i) {
    ok(wk.parts.length === 1 && wk.parts[0] === i, w, 'week ' + wk.n + ' covers parts ' + wk.parts);
    ok(wk.together.reads[0][1] === u.parts[i].read[1] && wk.together.ask[0].length === 3, w, 'week ' + wk.n + ' together');
    ok(wk.days.length === 4, w, 'week ' + wk.n + ' has ' + wk.days.length + ' days');
    wk.kids.forEach(function (c, ki) {
      var L = plan.kids[ki].lv;
      ok(JSON.stringify(c.topics) === JSON.stringify(u.parts[i][L]), w, 'week ' + wk.n + ' ' + L + ' topics ' + c.topics);
      ok(i < 5 ? !!c.quiz && !c.test : !c.quiz && !!c.test, w, 'week ' + wk.n + ' quiz/test');
      ok(c.proj === (i < 3 ? null : i === 3 ? 'start' : i === 5 ? 'finish' : 'work'), w, 'week ' + wk.n + ' project ' + c.proj);
      var lessons = 0; wk.days.forEach(function (d) { d.kids[ki].forEach(function (x) { if (x.kind === 'lesson') lessons++; }); });
      ok(lessons === c.topics.length, w, 'week ' + wk.n + ' ' + L + ': ' + lessons + ' lessons on the days, ' + c.topics.length + ' topics');
      c.ws.ids.forEach(function (x) { ok(x[1] === F.genLevel(L, T[x[0]].g), w, x[0] + ' generator level'); });
    });
  });
  ok(F.plannerDays(plan).length === 24, w, F.plannerDays(plan).length + ' planner days');
  // the generator levels: A easy, D hard, B on the young-learner course at its harder end
  ok(plan.W[0].kids[0].ws.ids.every(function (x) { return x[1] === 1; }), w, 'level A problems should be level 1');
  ok(plan.W[0].kids[2].ws.ids.every(function (x) { return x[1] === 3; }), w, 'level D problems should be level 3');
  if (V) plan.W[0].kids.forEach(function (c, ki) { F.makeSet(ML, c.ws).forEach(function (x, j) { console.log(plan.kids[ki].name, j + 1, x.id, 'L' + x.gl, String(x.p.q).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 90), '→', F.keyOf(x.p, ML).letter, F.keyOf(x.p, ML).text); }); });
})();

console.log(nUnits + ' units, ' + sets + ' problem sets, ' + made + ' problems, ' + checks + ' checks: ' + (fails ? fails + ' FAILED' : 'all passed'));
process.exit(fails ? 1 : 0);
