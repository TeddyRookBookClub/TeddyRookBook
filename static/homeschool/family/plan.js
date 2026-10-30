/* Family Study: the plan logic, shared by the page (static/homeschool/family/family.js) and the Node tests
   (scripts/family/test-family.js). No DOM here. Browser: window.TRBFamily. Node: module.exports.

   LEVELS  Four levels by age: A 5–7, B 8–10, C 11–13, D 14–18 (ages 3–4 count as A, 19 and up as D). A parent can
   move a child to another level. Each unit lists the ladder topics for each level (data/family/units/*.yaml).
   Generator level (1 easy, 2 middle, 3 hard): A 1, B 2, C 2, D 3, then one step harder when the topic's course is
   meant for younger grades than the child's level, one step easier when it is meant for older grades.

   build(unit, kids, opt, T)  -> the plan. unit: one unit from the library; kids: [{ name, age, lv? ('A'–'D'), pid? }];
     opt: { weeks: 2–12, days: 1–5, seed }; T: { topicId: { t: title, u: url, g: course grades "K–3" } }.
     Weeks and parts: a unit has about six parts. With more weeks than parts, a part takes two or more weeks and its
     topics are split between them; with fewer weeks, a week takes two or more parts. Topics for one week are capped
     at days + 1 per child.
     plan = { key, title, weeks, days, seed, kids: [{ name, age, lv, pid }], test: { ids per child },
       W: [{ n, parts, k, m, title, together: { reads, more, ask: [[3 questions]], follow, do }, kids: [{ topics,
             ws: spec, quiz: spec | null, test: spec | null, proj: 'start' | 'work' | 'finish' | null }], days: [{ together:
             [items], kids: [[items]] }] }] }
     A spec is { kind: 'ws' | 'quiz' | 'test', ids: [[topicId, genLevel]], n, seed }.
   makeSet(ML, spec)  -> [{ id, gl, p }]: n problems, topics in turn, from ML.makeProblem (the ladders' generators);
     repeats are skipped (a few more seeds are tried); null problems are skipped.
   keyOf(p)  -> { letter: 'B' | '', text } the answer for the answer key (mc: the letter and the choice).
   plannerDays(plan) -> one title per school day, for the lesson planner's "Family study" subject.                   */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.TRBFamily = api;
})(this, function () {
  'use strict';
  var LEVELS = [
    { k: 'A', ages: '5–7', grades: 'K–2', g: [0, 2], gen: 1, ws: 6, qz: 5, test: 10 },
    { k: 'B', ages: '8–10', grades: '3–5', g: [3, 5], gen: 2, ws: 8, qz: 6, test: 12 },
    { k: 'C', ages: '11–13', grades: '6–8', g: [6, 8], gen: 2, ws: 10, qz: 8, test: 15 },
    { k: 'D', ages: '14–18', grades: '9–12', g: [9, 12], gen: 3, ws: 10, qz: 8, test: 20 }
  ];
  var LV = {}; LEVELS.forEach(function (l) { LV[l.k] = l; });
  function levelOf(age) { age = +age || 7; return age <= 7 ? 'A' : age <= 10 ? 'B' : age <= 13 ? 'C' : 'D'; }
  // "K–3" -> [0, 3]; "9" -> [9, 9]; "College" -> [13, 16]
  function grades(s) {
    s = String(s == null ? '' : s).replace(/College/i, '13').replace(/\bK\b/, '0');
    var m = s.match(/\d+/g); if (!m) return null;
    var lo = +m[0], hi = m.length > 1 ? +m[1] : (/^13/.test(s) ? 16 : lo);
    return [lo, hi];
  }
  function genLevel(lv, g) {
    var L = LV[lv], b = L.gen, r = grades(g);
    if (r) { if (r[1] < L.g[0]) b++; else if (r[0] > L.g[1]) b--; }
    return Math.max(1, Math.min(3, b));
  }
  // which parts each week covers
  function weekMap(P, W) {
    var out = [], i;
    if (W >= P) {
      for (i = 0; i < W; i++) out.push({ parts: [Math.floor(i * P / W)] });
      out.forEach(function (w, i) { var p = w.parts[0], k = 0, m = 0; out.forEach(function (x, j) { if (x.parts[0] === p) { if (j < i) k++; m++; } }); w.k = k; w.m = m; });
    } else {
      for (i = 0; i < W; i++) { var a = Math.floor(i * P / W), b = Math.floor((i + 1) * P / W), ps = []; for (var j = a; j < Math.max(b, a + 1); j++) ps.push(j); out.push({ parts: ps, k: 0, m: 1 }); }
    }
    return out;
  }
  function slice(list, k, m) { var n = list.length, a = Math.floor(k * n / m), b = Math.floor((k + 1) * n / m); return b > a ? list.slice(a, b) : [list[k % n]]; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function hash(s) { s = String(s); var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function spread(i, n, d) { return Math.min(d - 1, Math.floor(i * d / n)); } // item i of n over d days

  function build(unit, kids, opt, T) {
    T = T || {}; opt = opt || {};
    var W = Math.max(2, Math.min(12, +opt.weeks || 6)), D = Math.max(1, Math.min(5, +opt.days || 4)), seed = String(opt.seed || 1);
    var P = unit.parts.length, map = weekMap(P, W);
    var ks = kids.map(function (k, i) { var a = Math.max(3, Math.min(18, +k.age || 7)); return { name: String(k.name || 'Child ' + (i + 1)), age: a, lv: LV[k.lv] ? k.lv : levelOf(a), auto: !LV[k.lv], pid: k.pid || '' }; });
    var projFrom = W - Math.max(2, Math.ceil(W / 2)); if (projFrom < 0) projFrom = 0;
    function spec(kind, ids, lv, n, extra) {
      return { kind: kind, ids: ids.filter(function (id) { return T[id] || !Object.keys(T).length; }).map(function (id) { return [id, genLevel(lv, T[id] && T[id].g)]; }), n: n, seed: seed + '|' + unit.key + '|' + extra };
    }
    var weeks = map.map(function (w, wi) {
      var parts = w.parts.map(function (i) { return unit.parts[i]; }), first = w.k === 0, single = parts.length === 1;
      var title = parts.map(function (p) { return p.title; }).join(' · ') + (w.m > 1 ? ' (' + (w.k + 1) + ' of ' + w.m + ')' : '');
      var together = {
        reads: first ? parts.map(function (p) { return p.read; }) : [(parts[0].more || [])[w.k - 1] || parts[0].read],
        more: first && single ? (parts[0].more || []).slice(0, w.m > 1 ? 1 : 3) : (first ? [] : (parts[0].more || []).slice(w.k)),
        ask: first ? parts.map(function (p) { return p.ask; }) : [],
        follow: first ? null : parts[0].title,
        again: !first && !(parts[0].more || [])[w.k - 1],
        do: parts.map(function (p) { return p.do; })
      };
      var budget = D + 1;
      var kw = ks.map(function (k, ki) {
        var tl;
        if (single) tl = slice(parts[0][k.lv] || [], w.k, w.m);
        else { tl = []; var lists = parts.map(function (p) { return (p[k.lv] || []).slice(); }), more = true; while (tl.length < budget && more) { more = false; lists.forEach(function (l) { if (l.length && tl.length < budget) { tl.push(l.shift()); more = true; } }); } }
        tl = uniq(tl).slice(0, budget);
        var L = LV[k.lv], last = wi === W - 1;
        return {
          topics: tl,
          ws: spec('ws', tl, k.lv, L.ws, 'ws' + wi + k.lv + ki),
          quiz: last ? null : spec('quiz', tl, k.lv, L.qz, 'qz' + wi + k.lv + ki),
          test: last ? spec('test', uniq([].concat.apply([], unit.parts.map(function (p) { return p[k.lv] || []; }))), k.lv, L.test, 'test' + k.lv + ki) : null,
          proj: wi < projFrom ? null : wi === projFrom ? 'start' : last ? 'finish' : 'work'
        };
      });
      // the school days
      var days = []; for (var d = 0; d < D; d++) days.push({ together: [], kids: ks.map(function () { return []; }) });
      if (single) { // read and talk on day 1, more reading in the middle, the activity on the last day
        var r0 = together.reads[0];
        days[0].together.push({ kind: 'read', t: r0[0], u: r0[1], again: together.again });
        days[0].together.push({ kind: 'talk', part: first ? 0 : -1 });
        together.more.forEach(function (r, i) { days[D <= 2 ? D - 1 : 1 + spread(i, together.more.length, D - 2)].together.push({ kind: 'more', t: r[0], u: r[1] }); });
        days[D - 1].together.push({ kind: 'do', part: 0 });
      } else { // two or more parts in one week: each part's reading, talk and activity on its own day
        parts.forEach(function (p, i) { var dd = spread(i, parts.length, D); days[dd].together.push({ kind: 'read', t: p.read[0], u: p.read[1] }, { kind: 'talk', part: i }, { kind: 'do', part: i }); });
      }
      kw.forEach(function (c, ki) {
        var LD = D === 1 ? 1 : D - 1;
        c.topics.forEach(function (id, i) { var dd = spread(i, c.topics.length, LD); days[dd].kids[ki].push({ kind: 'lesson', id: id }); });
        for (var dd = 0; dd < LD; dd++) if (days[dd].kids[ki].length) days[dd].kids[ki].push({ kind: 'ws', ids: days[dd].kids[ki].filter(function (x) { return x.kind === 'lesson'; }).map(function (x) { return x.id; }) });
        var lastD = days[D - 1].kids[ki];
        if (c.proj) days[c.proj === 'finish' || D < 3 ? D - 1 : D - 2].kids[ki].push({ kind: 'proj', step: c.proj });
        lastD.push(c.test ? { kind: 'test' } : { kind: 'quiz' });
      });
      return { n: wi + 1, parts: w.parts, k: w.k, m: w.m, title: title, together: together, kids: kw, days: days };
    });
    return { key: unit.key, title: unit.title, icon: unit.icon, weeks: W, days: D, seed: seed, kids: ks, W: weeks, projFrom: projFrom };
  }

  // n problems for a spec, topics in turn
  function makeSet(ML, sp) {
    var out = [], seen = {}, ids = sp.ids || [];
    if (!ids.length) return out;
    for (var j = 0, tries = 0; out.length < sp.n && tries < sp.n * 6; tries++) {
      var it = ids[j % ids.length], p = null;
      for (var t = 0; t < 4 && !p; t++) {
        try { p = ML.makeProblem(it[0], sp.seed + ':' + tries + (t ? '~' + t : ''), { level: it[1], mode: 'quiz' }); } catch (e) { p = null; }
      }
      j++;
      if (!p) continue;
      // the same question with the same answer (mc choices in another order count as the same) and the same picture
      var a = p.a, right = a.t === 'mc' ? (Array.isArray(a.v) ? a.v : [a.v]).map(function (i) { return a.choices[i]; }).join(';') : JSON.stringify(a.v === undefined ? a : a.v);
      var sig = hash(p.q + '|' + right + '|' + (p.viz ? JSON.stringify(p.viz) : ''));
      if (seen[sig] && tries < sp.n * 5) { j--; continue; } // same problem again: try another seed for this topic
      seen[sig] = 1; out.push({ id: it[0], gl: it[1], p: p });
    }
    return out;
  }
  function letter(i) { return String.fromCharCode(65 + i); }
  function keyOf(p, ML) {
    var a = p.a;
    if (a.t === 'mc') { var v = Array.isArray(a.v) ? a.v : [a.v]; return { letter: v.map(letter).join(', '), text: v.map(function (i) { return a.choices[i]; }).join('; ') }; }
    if (a.t === 'tf') return { letter: '', text: a.v ? 'True' : 'False' };
    var t = ''; try { t = ML && ML.answerShow ? ML.answerShow(a) : ''; } catch (e) { t = ''; }
    if (!t) { try { t = ML.answerText(a); } catch (e) { t = String(a.v); } }
    return { letter: '', text: t };
  }
  function plannerDays(plan) {
    var out = [];
    plan.W.forEach(function (w) { w.days.forEach(function (d, di) { out.push('Week ' + w.n + ', day ' + (di + 1) + ': ' + w.title); }); });
    return out;
  }
  return { LEVELS: LEVELS, LV: LV, levelOf: levelOf, grades: grades, genLevel: genLevel, weekMap: weekMap, build: build, makeSet: makeSet, keyOf: keyOf, plannerDays: plannerDays, hash: hash };
});
