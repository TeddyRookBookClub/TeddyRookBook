/* Life Planner: the New Year's resolution builder's pacing (/life-planner/resolution/). Pure logic; loads in the browser
   (window.LPResolve) and in Node for the tests (scripts/lifeplan/test-core.js).

   build(draft, env) → { state, goals, sessions, range }
     draft = { goals: { <goal key>: { on, …options } }, days: [0..6] (the days of the week to work on), start: 'YYYY-MM-DD',
               check: true to check the goals against mins (optional; without it the plan uses the goals' own time),
               mins: minutes free on a session day, off: [{ from, to, label }], extend: extra days at the end }
     env   = { D (data, as lp-tracks.js), P (progress), courses (the inline ladder course list), lib (the starter library),
               trades (the trades list), mk (track maker: id, color…), colors }
   The plan runs 365 days from the start (plus extend). Its sessions are the chosen days of the week that aren't days off.

   PACING  Every goal is spread so it ends on the plan's last session, never after it:
     - divisible goals (the Bible, Great Books minutes, a custom amount) use every session: items per session = what's
       left ÷ sessions (lp-tracks.js pace());
     - goals done in pieces with a sensible smallest share (a ladder lesson or Latin lesson over at most 2 sessions, an
       ASL lesson over at most 2, a memory list over 4, a recipe in 1) use M = min(sessions, items ÷ share) sessions,
       picked evenly from the plan's sessions (spread(): session i of M is the round((i + ½) × sessions ÷ M − ½)th);
     - Get active puts walking on every session day (150 minutes a week shared out, 10 to 60 minutes a day) and
       muscle-strengthening on two session days as far apart as possible; Walk N miles shares the miles over every
       session at 20 minutes a mile (3 miles an hour, a brisk walk);
     - the chore set adds the starter chores at their usual frequencies, placed on session days with room.
   Each goal's tracks get ids 'r-<goal>-<n>' so moving the finish date (a rebuild with extend) keeps their ticks. */
(function (root, factory) {
  var api = factory(root.LPCore || require('./lp-core.js'), root.LPTracks || require('./lp-tracks.js'));
  if (typeof module === 'object' && module.exports) module.exports = api; else root.LPResolve = api;
})(this, function (C, T) {
  'use strict';
  var MPM = 20; // minutes a mile, brisk walking (3 miles an hour)
  var CHORES = ['bathroom', 'kitchen-clean', 'laundry', 'sheets', 'vacuum', 'dust', 'alarms', 'filter', 'gutters'];
  function r1(x) { return Math.round(x * 10) / 10; }
  function rate(x, unit, units) { return (x >= 10 ? Math.round(x) : r1(x)) + ' ' + (r1(x) === 1 ? unit : units); }
  function fm(m) { m = Math.round(m); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : ''); }

  function range(dr) {
    var a = C.dnOf(dr.start); if (a == null) a = C.todayDn();
    return [a, a + 364 + Math.max(0, Math.min(35, +dr.extend || 0))];
  }
  function sessions(dr) {
    var R = range(dr), off = C.offSet(dr.off), days = dr.days && dr.days.length ? dr.days : [1, 2, 3, 4, 5], out = [];
    for (var d = R[0]; d <= R[1]; d++) if (days.indexOf(C.dow(d)) >= 0 && !off[d]) out.push(d);
    return out;
  }
  // M sessions picked evenly from the list (all of them when M ≥ the list's length)
  function spread(ss, M) {
    M = Math.max(1, Math.round(M)); if (M >= ss.length) return ss.slice();
    var out = []; for (var i = 0; i < M; i++) out.push(ss[Math.min(ss.length - 1, Math.round((i + 0.5) * ss.length / M - 0.5))]);
    return out;
  }
  // the first Great Books plan days that finish n rungs, and their minutes
  function gbFor(D, n) {
    var days = D.gb.days, m = 0, k = 0;
    for (var i = 0; i < days.length; i++) {
      m += +days[i][3] || 10; var dk = days[i][0], nx = days[i + 1];
      if (dk === 'b' || dk === 'one' || (dk === 'a' && !(nx && nx[0] === 'b'))) { k++; if (k >= n) return { mins: m, rungs: k, title: days[i][1] }; }
    }
    return { mins: m, rungs: k, title: '' };
  }
  function iso(dn) { return C.isoOf(dn); }

  // the goals: what finishing means, the options, and the tracks
  var GOALS = [
    { key: 'bible', icon: '📖', need: ['bible'], def: { ver: '73', next: false },
      title: function () { return 'Read the whole Bible'; },
      finish: 'Every reading of Bible in a Year, about 15 to 20 minutes a day on a 7-day week. Pick the 73-book or the 66-book Bible once you tick it.' },
    { key: 'gb', icon: '📚', need: ['gb'], def: { mode: 'rungs', n: 52, mins: 15 },
      title: function (g) { return g.mode === 'mins' ? 'Great Books, ' + g.mins + ' minutes a session' : 'Climb ' + g.n + ' rungs of the Great Books Ladder'; },
      finish: 'Rung by rung through Great Books in a Year: 52 rungs is about one a week; all 191 is the whole plan.' },
    { key: 'books', icon: '📕', need: [], def: { mode: 'books', n: 12, ppb: 300, pages: 3600, pph: 40, titles: '' },
      title: function (g) { var r = readPlan(g, 1, 1); return !r ? 'Read books' : g.mode === 'pages' ? 'Read ' + r.total.toLocaleString('en-US') + ' pages' : 'Read ' + r.n + (r.n === 1 ? ' book' : ' books'); },
      finish: 'Say how many books (and about how long they are) or how many pages, and the plan shares out the pages and the time.' },
    { key: 'ladder', icon: '🪜', need: [], def: { c: '', n: 0 },
      title: function (g, env) { var c = course(env, g.c); return c ? 'Finish ' + c.lt + ': ' + c.t : 'Finish a ladder course'; },
      finish: 'Every lesson of a course you pick: math, history, writing, a science, logic, the Culinary or Robotics Ladder and more.' },
    { key: 'trade', icon: '🛠️', need: ['trades'], def: { tr: '' },
      title: function (g, env) { var t = (env.trades || []).filter(function (x) { return x.k === g.tr; })[0] || (env.trades || [])[0]; return t ? 'Learn a trade: ' + t.t : 'Learn a trade'; },
      finish: 'Every lesson of a trades course: how it works, how to fix it, and when to call a pro.' },
    { key: 'cook', icon: '🍳', need: ['meals'], def: { n: 26 },
      title: function (g) { return 'Learn to cook: ' + g.n + ' new recipes'; },
      finish: 'Cook recipes from Meal Prep you haven’t made before, simpler ones first. 26 is one every two weeks.' },
    { key: 'active', icon: '🚶', need: [], def: {},
      title: function () { return 'Get active: meet the Physical Activity Guidelines'; },
      finish: '150 minutes a week of moderate activity such as brisk walking, plus muscle-strengthening on 2 days (U.S. guidelines for adults).' },
    { key: 'walk', icon: '👟', need: [], def: { n: 300 },
      title: function (g) { return 'Walk ' + g.n + ' miles'; },
      finish: 'At a brisk walk of about 3 miles an hour (20 minutes a mile). 300 miles is a little over a mile on most days.' },
    { key: 'chores', icon: '🧹', need: [], def: {},
      title: function () { return 'Keep the house on schedule'; },
      finish: 'The starter chore set (bathroom, kitchen, laundry, sheets, floors, dusting, alarm tests, air filter, gutters), each at its recommended frequency.' },
    { key: 'memory', icon: '🧠', need: ['extra'], def: { n: 12 },
      title: function (g) { return 'Learn ' + g.n + ' lists by heart'; },
      finish: 'Memory Challenges: the books of the Bible, the presidents, the elements and more. 12 is one a month, studied in four short sessions each.' },
    { key: 'lepanto', icon: '⚓', need: ['extra'], def: { n: 5 },
      title: function (g) { return 'Memorize Lepanto, ' + g.n + (+g.n === 1 ? ' line' : ' lines') + ' a week'; },
      finish: 'All 143 lines of G. K. Chesterton’s poem by heart, a chunk of four to seven lines at a time with spaced review. 5 lines a week takes about 29 weeks; 3 a week takes most of the year.' },
    { key: 'latin', icon: '🏛️', need: ['extra'], def: {},
      title: function () { return 'Learn Latin basics: Latin for Beginners'; },
      finish: 'All 79 lessons of D’Ooge’s Latin for Beginners, with a step-by-step guide for each.' },
    { key: 'trla', icon: '🏺', need: ['tr'], def: { w: 'aeneid', mo: 0 },
      title: function (g) { return trTitle(g.w, 'aeneid'); },
      finish: 'Translate a Latin classic from the old Harvard entrance list, a passage each session, with word help and a public-domain translation to check against: the whole Aeneid, Books I–VI, Caesar’s Gallic War I, or Cicero’s first speech against Catiline.' },
    { key: 'trgr', icon: '🏛️', need: ['tr'], def: { w: 'iliad1', mo: 0 },
      title: function (g) { return trTitle(g.w, 'iliad1'); },
      finish: 'Translate a Greek classic the same way: Homer’s Iliad I or the whole Iliad, Xenophon’s Anabasis I, or the Gospel of John.' },
    { key: 'asl', icon: '🤟', need: ['extra'], def: {},
      title: function () { return 'Learn ASL basics: Lifeprint’s 60 lessons'; },
      finish: 'Dr. Bill Vicars’s free ASL 1 to ASL 4 lessons at Lifeprint, with fingerspelling practice here.' },
    { key: 'custom', icon: '✏️', need: [], def: { name: '', amount: 100, unit: 'hours', mpu: 60 }, card: 'Make your own goal',
      title: function (g) { return (g.name || 'My goal') + ': ' + g.amount + ' ' + g.unit; },
      finish: 'Anything you can count, like “practice guitar 100 hours” or “write 50,000 words.”' }
  ];
  /* ROUGH: a goal's minutes for the whole year without its data file, used when the file can't load (the card then says
     "rough") and nowhere else. From the same numbers the build uses: the Bible ≈ 99 hours (73 books) or 86 (66), a Great
     Books rung ≈ 18 minutes, a ladder topic at its course's minutes, a trades lesson ≈ 21, a recipe 60, a memory list 60,
     Lepanto ≈ 10 hours, a Latin lesson 35, an ASL lesson 30, a Translate work at its days × minutes. */
  function rough(key, g, env, N, weeks) {
    switch (key) {
      case 'bible': return g.ver === '66' ? 5160 : 5940;
      case 'books': var rp = readPlan(g, N, weeks); return rp ? rp.hours * 60 : 0;
      case 'gb': return g.mode === 'mins' ? (+g.mins || 15) * N : (+g.n || 52) * 18;
      case 'ladder': var c = course(env, g.c) || (env.courses || [])[0]; return c ? (+g.n || c.n) * c.m : 3000;
      case 'trade': var t = (env.trades || []).filter(function (x) { return x.k === g.tr; })[0] || (env.trades || [])[0]; return (t ? t.n : 13) * 21;
      case 'cook': return (+g.n || 26) * 60;
      case 'active': return 190 * weeks;
      case 'walk': return (+g.n || 300) * MPM;
      case 'chores': return 240 * weeks;
      case 'memory': return (+g.n || 12) * 60;
      case 'lepanto': return 600;
      case 'latin': return 79 * 35;
      case 'asl': return 60 * 30;
      case 'trla': case 'trgr': var tg = (env.trGoals || []).filter(function (x) { return x.k === g.w; })[0]; return tg ? tg.days * tg.mins : 30 * N;
      case 'custom': return Math.max(1, +g.amount || 1) * Math.max(1, +g.mpu || 60);
    }
    return 0;
  }
  // Translate in a Year (/languages/translate/): the works each card offers, and the usual time for each in months
  var TR = {
    aeneid: ['lat', 'Translate the Aeneid (all 12 books)', 12], aeneid6: ['lat', 'Translate the Aeneid, Books I–VI', 6],
    caesar: ['lat', 'Translate Caesar, Gallic War I', 4], catiline: ['lat', 'Translate Cicero, In Catilinam I', 2],
    iliad1: ['grc', 'Translate Homer, Iliad I', 1], iliad: ['grc', 'Translate the whole Iliad', 12],
    anabasis: ['grc', 'Translate Xenophon, Anabasis I', 6], john: ['grc', 'Translate the Gospel of John in Greek', 12]
  };
  /* READ BOOKS: books × pages a book (or a page total), shared over the sessions. Pages are whole in every session
     (lp-tracks.js 'pages': session k reads round(k × per) to round((k + 1) × per)), at least one a session (so a short goal
     uses fewer sessions, spread evenly). Limits: up to 1,000 books, 5,000 pages a book, 1,000,000 pages; 5 to 300 pages
     an hour. Default speed 40 pages an hour (1.5 minutes a page); dense nonfiction is nearer 30.
     readPlan(g, N sessions, weeks) → null (nothing to read) | { total, n (books, 0 for a page total), ppb, pph, M (sessions
     used), per (pages a session, a fraction), pps (pages on a typical session, whole), mps (minutes a session), wk
     (minutes a week), hours (the year), every (weeks a book) } */
  function clampN(x, lo, hi) { x = +x; return isFinite(x) ? Math.max(lo, Math.min(hi, x)) : lo; }
  function readPlan(g, N, weeks) {
    var books = g.mode !== 'pages', ppb = Math.round(clampN(g.ppb || 300, 1, 5000)), n = books ? Math.floor(clampN(g.n, 0, 1000)) : 0;
    var total = Math.round(books ? n * ppb : clampN(g.pages, 0, 1e6)), pph = clampN(g.pph || 40, 5, 300);
    if (!total || !(N >= 1)) return null;
    var M = Math.min(N, total), per = total / M, mins = total * 60 / pph;
    return { total: total, n: n, ppb: books ? ppb : 0, pph: pph, M: M, per: per, pps: Math.round(per) || 1, mps: per * 60 / pph, wk: mins / weeks, hours: mins / 60, every: n ? weeks / n : 0 };
  }
  function titlesOf(t) { return String(t || '').split(/\r?\n/).map(function (x) { return x.trim().slice(0, 80); }).filter(Boolean).slice(0, 1000); }
  function trTitle(w, d) { return (TR[w] || TR[d])[1]; }
  function course(env, key) { var cs = env.courses || []; for (var i = 0; i < cs.length; i++) if (cs[i].l + '|' + cs[i].k === key) return cs[i]; return null; }
  function goal(key) { for (var i = 0; i < GOALS.length; i++) if (GOALS[i].key === key) return GOALS[i]; return null; }
  function opts(dr, key) { var G = goal(key); return Object.assign({}, G.def, (dr.goals || {})[key] || {}); }
  function needs(dr) {
    var n = {};
    GOALS.forEach(function (G) { var g = (dr.goals || {})[G.key]; if (!g || !g.on) return; G.need.forEach(function (k) { n[k] = 1; }); });
    var lg = (dr.goals || {}).ladder; if (lg && lg.on && lg.c) n['lad:' + lg.c.split('|')[0]] = 1;
    return Object.keys(n);
  }

  function build(dr, env) {
    var R = range(dr), ss = sessions(dr), N = ss.length, days = dr.days && dr.days.length ? dr.days.slice().sort() : [1, 2, 3, 4, 5];
    var dpw = days.length, weeks = (R[1] - R[0] + 1) / 7, D = env.D, out = [], tracks = [];
    var color = 0;
    function mk(G, o, i) {
      var t = env.mk(Object.assign({ id: 'r-' + G.key + '-' + (i || 0), color: env.colors[color++ % env.colors.length], keepOff: false }, o));
      t.opt = Object.assign({}, t.opt || {}, { res: G.key }); return t;
    }
    function dated(M) { var x = spread(ss, M); return { k: 'dates', dates: x.map(iso) }; }
    var everyDay = { k: 'days', d: days };
    GOALS.forEach(function (G) {
      var g = opts(dr, G.key); if (!(dr.goals || {})[G.key] || !dr.goals[G.key].on) return;
      var made = [], pace = '', items = 0, unit = '';
      // a goal whose data didn't load, or that fails, gets a rough estimate instead of stopping the whole build
      try { (function () {
      switch (G.key) {
        case 'bible':
          if (!D.bible) return;
          var ver = g.ver === '66' ? '66' : '73', B = D.bible[ver], from = 1;
          if (g.next && env.P && env.P.bible) { var t0 = env.P.bible(ver); while (from < B.length && t0[from]) from++; }
          var left = B.length - from + 1, per = left / N, mins = 0; for (var i = from - 1; i < B.length; i++) mins += B[i][1];
          var ch = (ver === '66' ? 1189 : 1334) * left / B.length;
          made.push(mk(G, { kind: 'bible', name: 'Bible in a Year', icon: '📖', mins: Math.round(mins / N), f: everyDay, opt: { ver: ver, mode: 'seq', from: from, per: per } }));
          pace = (ver === '66' ? 'The 66-book Bible: about ' : 'The 73-book Bible: about ') + rate(ch / N, 'chapter', 'chapters') + ' a session (' + rate(per, 'day', 'days') + ' of the plan), about ' + fm(mins / N);
          break;
        case 'gb':
          if (!D.gb) return;
          if (g.mode === 'mins') {
            var gm = Math.max(5, Math.min(120, +g.mins || 15));
            made.push(mk(G, { kind: 'gb', name: 'Great Books', icon: '📚', mins: gm, f: everyDay, opt: { from: 0 } }));
            pace = fm(gm) + ' a session, ' + Math.round(gm * N / 60) + ' hours in the year';
          } else {
            var n = Math.max(1, Math.min(191, +g.n || 52)), x = gbFor(D, n), m2 = Math.max(5, Math.ceil(x.mins / N));
            made.push(mk(G, { kind: 'gb', name: 'Great Books', icon: '📚', mins: m2, f: everyDay, opt: { from: 0, stop: true } }));
            pace = 'About ' + fm(m2) + ' a session; a rung about every ' + rate(N / x.rungs, 'session', 'sessions') + ', ending with ' + x.title;
          }
          break;
        case 'books':
          var rp = readPlan(g, N, weeks); if (!rp) return;
          var xs = spread(ss, rp.M), tl = titlesOf(g.titles);
          made.push(mk(G, { kind: 'pages', name: rp.n ? 'Read books' : 'Read pages', icon: '📕', mins: Math.max(1, Math.round(rp.mps)), f: rp.M >= N ? everyDay : { k: 'dates', dates: xs.map(iso) },
            opt: { total: rp.total, per: rp.per, ppb: rp.ppb, pph: rp.pph, titles: rp.n ? tl : [], url: '/free-books/' } }));
          pace = 'About ' + rp.pps + (rp.pps === 1 ? ' page' : ' pages') + ' a session (' + fm(rp.mps) + ')' + (rp.n ? ', about one book every ' + rate(rp.every, 'week', 'weeks') : '') + ', ' + Math.round(rp.hours) + ' hours in the year';
          break;
        case 'ladder':
          var c = course(env, g.c) || (env.courses || [])[0]; if (!c) return;
          var L = D.lad && D.lad[c.l], start = 0, total = c.n;
          if (L && env.P && env.P.passed) { var chn = T.chain(D, { l: c.l, c: c.k }).filter(function (q) { return q.c === c.k; }); while (start < chn.length && env.P.passed(chn[start].id)) start++; total = chn.length; }
          items = Math.max(1, Math.min(total - start || total, +g.n || (total - start) || total));
          var M = Math.min(N, Math.ceil(items / 0.5)), per2 = items / M;
          made.push(mk(G, { kind: 'ladder', name: c.lt + ': ' + c.t, icon: c.li || '🪜', mins: Math.max(5, Math.round(per2 * c.m)), unit: c.m, f: dated(M), opt: { l: c.l, c: c.k, from: start >= total ? 0 : start, n: items, per: per2 } }));
          pace = rate(items / weeks, 'lesson', 'lessons') + ' a week (' + rate(items / 12, 'lesson', 'lessons') + ' a month), about ' + fm(per2 * c.m) + ' a session' + (start ? ', starting after the ' + start + ' you’ve passed' : '');
          break;
        case 'trade':
          var tl = (env.trades || []).filter(function (q) { return q.k === g.tr; })[0] || (env.trades || [])[0]; if (!tl || !D.trades) return;
          var ls = D.trades[tl.k].ls, tm = 0; ls.forEach(function (q) { tm += (+q[2] || 10) * 3; }); // reading time × 3: the lesson, its quiz, a look at the real thing
          var M2 = Math.min(N, ls.length * 2), per3 = ls.length / M2;
          made.push(mk(G, { kind: 'lessons', name: tl.t, icon: '🛠️', mins: Math.max(5, Math.round(tm / M2)), unit: Math.round(tm / ls.length), f: dated(M2), opt: { list: 'trade:' + tl.k, per: per3, word: 'Lesson', many: 'lessons' } }));
          pace = rate(ls.length / 12, 'lesson', 'lessons') + ' a month, about ' + fm(tm / M2) + ' a session';
          break;
        case 'cook':
          var nr = Math.max(1, Math.min(156, +g.n || 26)), RL = T.list(D, 'recipes'); if (!RL) return;
          nr = Math.min(nr, RL.length);
          made.push(mk(G, { kind: 'lessons', name: 'Cook a new recipe', icon: '🍳', mins: 60, f: dated(nr), opt: { list: 'recipes', per: 1, n: nr, many: 'recipes' } }));
          pace = nr >= 52 ? rate(nr / weeks, 'recipe', 'recipes') + ' a week' : 'A new recipe every ' + rate(weeks / nr, 'week', 'weeks');
          break;
        case 'active':
          var wm = Math.min(60, Math.max(10, Math.ceil(150 / dpw / 5) * 5));
          made.push(mk(G, { kind: 'exercise', type: 'moderate', name: 'Brisk walk', icon: '🚶', mins: wm, f: everyDay }, 0));
          if (dpw >= 2) {
            var best = [days[0], days[1]], gap = -1;
            days.forEach(function (a) { days.forEach(function (b) { if (b <= a) return; var d1 = Math.min(b - a, 7 - (b - a)); if (d1 > gap) { gap = d1; best = [a, b]; } }); });
            made.push(mk(G, { kind: 'exercise', type: 'strength', name: 'Muscle-strengthening', icon: '🏋️', mins: 20, f: { k: 'days', d: best } }, 1));
          }
          pace = fm(wm) + ' of brisk walking each session day (' + fm(wm * dpw) + ' a week)' + (dpw >= 2 ? ', plus 20 minutes of strength work on 2 of them' : '');
          break;
        case 'walk':
          var mi = Math.max(1, Math.min(3000, +g.n || 300)), mpd = mi / N;
          made.push(mk(G, { kind: 'exercise', type: 'moderate', name: 'Walk ' + r1(mpd) + ' miles', icon: '👟', mins: Math.max(5, Math.ceil(mpd * MPM)), f: everyDay, opt: { miles: mi, mpm: MPM } }));
          pace = 'About ' + rate(mpd, 'mile', 'miles') + ' a session, about ' + fm(mpd * MPM) + ' at a brisk pace';
          break;
        case 'chores':
          CHORES.forEach(function (k, i) { var t = env.fromLib('chores', k, { id: 'r-chores-' + i, color: env.colors[color++ % env.colors.length] }); if (t) { t.opt = Object.assign({}, t.opt, { res: 'chores' }); made.push(t); } });
          break;
        case 'memory':
          var ML = D.extra && D.extra.memory; if (!ML) return;
          var nm = Math.max(1, Math.min(ML.length, +g.n || 12)), M3 = Math.min(N, nm * 4);
          made.push(mk(G, { kind: 'lessons', name: 'Memory challenge', icon: '🧠', mins: Math.max(5, Math.round(60 * nm / M3)), unit: 60, f: dated(M3), opt: { list: 'memory', per: nm / M3, n: nm, many: 'lists' } }));
          pace = 'A list about every ' + rate(weeks / nm, 'week', 'weeks') + ', in short sessions of about ' + fm(60 * nm / M3);
          break;
        case 'lepanto':
          // the poem's chunks (D.extra.lepanto: [label, url, minutes, lines]) spread over the weeks that `n` lines a week needs
          // (or the whole plan, if that's shorter); each chunk over two sessions: learn it, then recall and chain it
          var LP = D.extra && D.extra.lepanto; if (!LP || !LP.length) return;
          var lines = 0; LP.forEach(function (q) { lines += +q[3] || 5; });
          var lpw = Math.max(1, Math.min(lines, +g.n || 5)), wk = Math.min(weeks, lines / lpw), lim6 = R[0] + Math.round(wk * 7) - 1;
          var s6 = ss.filter(function (d) { return d <= lim6; }); if (!s6.length) s6 = ss.slice(0, 1);
          var M6 = Math.min(s6.length, LP.length * 2), x6 = spread(s6, M6), cm = +LP[0][2] || 20;
          made.push(mk(G, { kind: 'lessons', name: 'Memorize Lepanto', icon: G.icon, mins: Math.max(5, Math.round(cm * LP.length / M6)), unit: cm, f: { k: 'dates', dates: x6.map(iso) }, opt: { list: 'lepanto', per: LP.length / M6, n: LP.length, many: 'chunks' } }));
          pace = 'About ' + rate(lines / wk, 'line', 'lines') + ' a week, all ' + lines + ' in about ' + rate(wk, 'week', 'weeks') + '; about ' + fm(cm * LP.length / M6) + ' a session, plus the quick reviews the trainer brings back';
          break;
        case 'latin': case 'asl':
          var XL = D.extra && D.extra[G.key]; if (!XL) return;
          var tot = 0; XL.forEach(function (q) { tot += +q[2] || 30; });
          var M4 = Math.min(N, XL.length * 2), per4 = XL.length / M4;
          made.push(mk(G, { kind: 'lessons', name: G.key === 'latin' ? 'Latin for Beginners' : 'Lifeprint ASL', icon: G.icon, mins: Math.max(5, Math.round(tot / M4)), unit: Math.round(tot / XL.length), f: dated(M4), opt: { list: G.key, per: per4, word: 'Lesson', many: 'lessons' } }));
          pace = rate(XL.length / weeks, 'lesson', 'lessons') + ' a week, about ' + fm(tot / M4) + ' a session';
          break;
        case 'trla': case 'trgr':
          // a passage each session: the work's chunks shared out by lines (verse) or words (prose) over the sessions in the
          // first `mo` months (0 = the work's usual time), each linking to that passage in the reader
          var TG = D.tr && D.tr.goals ? D.tr.goals.filter(function (q) { return q.k === g.w && TR[g.w] && TR[g.w][0] === (G.key === 'trla' ? 'lat' : 'grc'); })[0] : null;
          if (!TG) return;
          var TW = D.tr.works[TG.w], mo = Math.max(1, Math.min(12, +g.mo || TR[g.w][2])), lim = mo >= 12 ? R[1] : R[0] + Math.round(mo * 365 / 12) - 1;
          var sw = ss.filter(function (d) { return d <= lim; }); if (!sw.length) sw = ss.slice(0, 1);
          var M5 = Math.min(sw.length, TG.b - TG.a), xs = spread(sw, M5), tot5 = TG.amt, u5 = TW.unit === 'line' ? 'lines' : 'words';
          made.push(mk(G, { kind: 'translate', name: TR[g.w][1].replace(/^Translate /, ''), icon: G.icon, mins: Math.max(5, Math.round(tot5 * TW.mpu / M5)), f: { k: 'dates', dates: xs.map(iso) }, opt: { w: TG.w, a: TG.a, b: TG.b, n: M5 } }));
          pace = 'About ' + Math.round(tot5 / M5) + ' ' + u5 + ' a session (' + fm(tot5 * TW.mpu / M5) + ')' + (mo < 12 ? ', done in about ' + mo + (mo === 1 ? ' month' : ' months') : '');
          break;
        case 'custom':
          var amt =Math.max(1, +g.amount || 1), mpu = Math.max(1, +g.mpu || 60), un = String(g.unit || 'hours').slice(0, 20);
          made.push(mk(G, { kind: 'amount', name: String(g.name || 'My goal').slice(0, 60), icon: '⭐', mins: Math.max(5, Math.round(amt * mpu / N)), f: everyDay, opt: { amount: amt, unit: un, mpu: mpu, per: amt / N } }));
          pace = 'About ' + (amt / N >= 10 ? Math.round(amt / N) : r1(amt / N)) + ' ' + un + ' a session (' + fm(amt * mpu / N) + ')';
          break;
      }
      })(); } catch (e) { made = []; if (env.log) env.log('Life Planner: the “' + G.key + '” goal couldn’t be worked out:', e); }
      var title = ''; try { title = G.title(g, env); } catch (e) { title = G.card || G.key; }
      if (!made.length) {
        var yr = rough(G.key, g, env, N, weeks);
        if (env.log) env.log('Life Planner: no data for the “' + G.key + '” goal; showing a rough estimate.');
        out.push({ key: G.key, icon: G.icon, title: title, pace: 'A rough estimate: its data didn’t load. Reload the page for the exact plan.', ids: [], rough: true, yr: yr });
        return;
      }
      tracks = tracks.concat(made);
      out.push({ key: G.key, icon: G.icon, title: title, pace: pace, ids: made.map(function (t) { return t.id; }) });
    });
    // the time: without a budget (dr.check off) every session day has all day, so nothing shows as overloaded; the
    // builder then saves the plan with the busiest day's minutes as the budget
    var budget = [0, 0, 0, 0, 0, 0, 0]; days.forEach(function (d) { budget[d] = dr.check ? Math.max(5, Math.min(1440, +dr.mins || 45)) : 1440; });
    var state = { v: 1, plan: { from: iso(R[0]), len: 'custom', to: iso(R[1]), budget: budget, off: (dr.off || []).slice() }, tracks: tracks, ticks: {}, tab: 'today', nid: 0 };
    return { state: state, goals: out, sessions: ss, range: R, dpw: dpw };
  }
  var DOWN = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  function daysText(days) {
    var d = (days || []).slice().sort().join(',');
    if (d === '0,1,2,3,4,5,6') return '7 days a week'; if (d === '1,2,3,4,5') return 'weekdays'; if (d === '1,2,3,4,5,6') return 'Monday to Saturday';
    return days.length + (days.length === 1 ? ' day' : ' days') + ' a week (' + days.slice().sort().map(function (x) { return DOWN[x]; }).join(', ') + ')';
  }
  return { GOALS: GOALS, readPlan: readPlan, titlesOf: titlesOf, rough: rough, goal: goal, opts: opts, needs: needs, build: build, sessions: sessions, spread: spread, range: range, gbFor: gbFor, daysText: daysText, MPM: MPM, CHORES: CHORES, TR: TR };
});
