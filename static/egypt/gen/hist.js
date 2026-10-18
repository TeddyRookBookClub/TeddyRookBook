/* History of Ancient Egypt (Egyptology Ladder, course key hist): problem generators for all 60 topics.
   Built from /tmp/work_egypt/hist/gen/*.js by build_gen.sh (do not edit the shipped file by hand).
   Problems come from two places:
   - model-driven shapes that read MathLadder.egypt (PERIODS, DYNASTIES, KINGS, SITES, NAMES, WORDS, PYRAMIDS, numerals), so the
     pictures and the answers agree: which period is this year in, put reigns in order, which dynasty, which king built this,
     pick the site on the map, read a cartouche, identify a pyramid, read a numeral, and date arithmetic (regnal years, BC/AD,
     calendar drift, radiocarbon ranges, deben prices);
   - fact banks written for each topic: multiple choice whose wrong choices come from the topic's trouble note (the first wrong
     choice in each list is the misconception, always offered), and true-or-false statements.
   Rules (/tmp/work_egypt/overview.md, /tmp/briefs/egypt_design.md): dates after Shaw (2000); "c." before every date earlier
   than 664 BC; no exact year before 664 BC is ever the answer (order, period or dynasty instead); years asked for a period
   stay well away from the period's boundaries (more than its uncertainty); reigns in an order problem are far enough apart and
   never overlap (Hatshepsut and Thutmose III are never ordered against each other); disputed matters appear only as "scholars
   debate" questions whose answer is the existence of the debate or the shape of the positions, never a verdict.
   Levels: 1 one fact, three choices, picture-led shapes; 2 four choices, distractors from the trouble note; 3 harder items,
   closer dates, four reigns to order. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, U = ML.util;
  function EG() { return ML.egypt; }
  function lvl(ctx) { return (ctx && ctx.level) || 1; }
  function nWrong(ctx) { return lvl(ctx) === 1 ? 2 : 3; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function end(s) { s = String(s); return /[.!?]$/.test(s) ? s : s + '.'; }
  function ord(n) { return n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function yr(y) { return EG().year(y, true); }
  function span(a, b) { return EG().span(a, b, true); }

  // ---------------------------------------------------------------- fact items
  // mc item: [question, right, [wrongs: the misconception first], why, { lv: min level, viz, hint }]
  // tf item: { s: statement, v: true|false, why, lv }
  function mcItem(R, ctx, it, hint) {
    var o = it[4] || {}, k = Math.min(it[2].length, nWrong(ctx));
    var w = [it[2][0]].concat(R.sample(it[2].slice(1), k - 1));
    var p = { q: it[0], a: U.mc(it[1], w, k + 1), steps: [it[3], 'The answer: ' + end(it[1])], hint: o.hint || hint };
    if (o.viz) p.viz = o.viz;
    return p;
  }
  function tfItem(R, ctx, it, hint) {
    var p = { q: 'True or false? ' + it.s, a: { t: 'tf', v: !!it.v }, steps: [(it.v ? 'True. ' : 'False. ') + it.why], hint: it.hint || hint };
    if (it.viz) p.viz = it.viz;
    return p;
  }
  function usable(list, L) { return (list || []).filter(function (it) { var o = Array.isArray(it) ? (it[4] || {}) : it; return (o.lv || 1) <= L; }); }
  // run one topic: D = { f: [mc items], t: [tf items], s: [shape functions or [weight, fn]], hint }
  function run(R, ctx, D) {
    var L = lvl(ctx), f = usable(D.f, L), t = usable(D.t, L), s = (D.s || []).map(function (x) { return Array.isArray(x) ? x : [1, x]; });
    var wf = f.length ? (L === 1 ? 5 : L === 2 ? 5 : 4) : 0, wt = t.length ? (L === 1 ? 2 : L === 2 ? 1.5 : 1) : 0;
    var ws = s.length ? (L === 1 ? 3 : L === 2 ? 3.5 : 5) : 0, tot = wf + wt + ws, x = R.next() * tot;
    if (x < wf) return mcItem(R, ctx, R.pick(f), D.hint);
    if (x < wf + wt) return tfItem(R, ctx, R.pick(t), D.hint);
    var sw = s.reduce(function (a, b) { return a + b[0]; }, 0), y = R.next() * sw;
    for (var i = 0; i < s.length; i++) { y -= s[i][0]; if (y < 0) return s[i][1](R, ctx); }
    return s[s.length - 1][1](R, ctx);
  }

  // ---------------------------------------------------------------- model-driven shapes
  var MAIN = ['pre', 'ed', 'ok', 'fip', 'mk', 'sip', 'nk', 'tip', 'late', 'ptol', 'rom'];
  // a year well inside a period: at least the period's uncertainty plus a margin away from both ends
  function yearIn(R, ctx, P) { // null when the period is too short to have such years (the First Intermediate and Early Dynastic)
    var L = lvl(ctx), pm = P.pm || 0, extra = L === 1 ? 60 : L === 2 ? 40 : 20, lo, hi;
    for (; extra >= 0; extra -= 20) {
      lo = P.key === 'pre' ? -4300 : P.key === 'rom' ? 50 : P.from + pm + extra + 5; hi = P.key === 'rom' ? 600 : P.to - pm - extra - 5;
      if (hi - lo >= 10) return Math.round(R.int(Math.ceil(lo / 5), Math.floor(hi / 5)) * 5);
    }
    return null;
  }
  // which period is this year in?  keys: periods to draw from
  function periodQ(keys) {
    return function (R, ctx) {
      var E = EG(), L = lvl(ctx), ok = keys.filter(function (k) { return yearIn(R, ctx, E.period(k)) !== null; }), P = E.period(R.pick(ok.length ? ok : ['nk'])), y = yearIn(R, ctx, P);
      var near = MAIN.filter(function (k) { return k !== P.key; }).sort(function (a, b) { return Math.abs(MAIN.indexOf(a) - MAIN.indexOf(P.key)) - Math.abs(MAIN.indexOf(b) - MAIN.indexOf(P.key)); });
      var wrong = L === 1 ? R.sample(near.slice(0, 4), 2) : [near[0], near[1]].concat(R.sample(near.slice(2, 6), 1));
      var p = {
        q: (L === 1 ? 'The red line on the timeline marks ' + yr(y) + '. In which period of Egyptian history does it fall? (The period it falls in is marked "?".)' : 'In which period of Egyptian history does ' + yr(y) + ' fall?'),
        a: U.mc(P.name, wrong.map(function (k) { return E.period(k).name; }), wrong.length + 1),
        steps: [P.name + ': ' + span(P.from, P.to) + (P.dyn && P.dyn.indexOf('(') < 0 && /^\d/.test(P.dyn) ? ' (Dynasties ' + P.dyn + ')' : '') + '.', yr(y) + ' lies inside that span, well away from its ends, so the uncertainty of the dates does not matter here.', 'The answer: the ' + P.name + '.'],
        hint: 'BC numbers count down: a bigger number is earlier. Compare the year with the periods\' start and end dates.'
      };
      if (L === 1) p.viz = { name: 'eg-timeline', opts: { from: -3200, to: 700, now: y, ask: [P.key], quiet: true, interactive: false, dynasties: false, uncertainty: false } };
      return p;
    };
  }
  // the period marked "?" on a quiet timeline
  function periodMarkQ(keys) {
    return function (R, ctx) {
      var E = EG(), P = E.period(R.pick(keys)), i = MAIN.indexOf(P.key);
      var near = MAIN.filter(function (k) { return k !== P.key; }).sort(function (a, b) { return Math.abs(MAIN.indexOf(a) - i) - Math.abs(MAIN.indexOf(b) - i); });
      var wrong = near.slice(0, nWrong(ctx));
      return {
        q: 'Which period of Egyptian history is marked "?" on the timeline?',
        a: U.mc(P.name, wrong.map(function (k) { return E.period(k).name; }), wrong.length + 1),
        steps: ['Look at its neighbors: ' + (i > 0 ? 'before it comes the ' + E.period(MAIN[i - 1]).name : 'it is the first') + (i < MAIN.length - 1 ? ', and after it the ' + E.period(MAIN[i + 1]).name : '') + '.', 'The ' + P.name + ' runs ' + span(P.from, P.to) + '.', 'The answer: the ' + P.name + '.'],
        hint: 'The periods alternate: a kingdom, then an intermediate period, then a kingdom.',
        viz: { name: 'eg-timeline', opts: { from: -3200, to: 700, ask: [P.key], quiet: true, interactive: false, dynasties: false } }
      };
    };
  }
  // put periods in order
  function periodOrderQ(R, ctx) {
    var E = EG(), L = lvl(ctx), n = L === 3 ? 4 : 3, pool = MAIN.slice(1);
    var pick = R.sample(pool, n).sort(function (a, b) { return MAIN.indexOf(a) - MAIN.indexOf(b); });
    var names = pick.map(function (k) { return E.period(k).name; });
    var o = orderChoices(R, names, ctx);
    return { q: 'Put these periods in order, earliest first: ' + U.list(R.shuffle(names)) + '.', a: o.a, steps: pick.map(function (k) { var P = E.period(k); return P.name + ': ' + span(P.from, P.to) + '.'; }).concat(['The answer: ' + o.right + '.']), hint: 'Old, Middle, New: each kingdom is followed by an intermediate period.' };
  }
  // mc of sequences: the right order plus plausible wrong orders (one adjacent swap first)
  function orderChoices(R, names, ctx) {
    var right = names.join(' → '), seen = {}, wr = [];
    seen[right] = 1;
    function add(arr) { var s = arr.join(' → '); if (!seen[s]) { seen[s] = 1; wr.push(s); } }
    var i = R.int(0, names.length - 2), sw = names.slice(); var t = sw[i]; sw[i] = sw[i + 1]; sw[i + 1] = t; add(sw);
    add(names.slice().reverse());
    var guard = 0; while (wr.length < 5 && guard++ < 50) add(R.shuffle(names));
    var k = nWrong(ctx);
    return { right: right, a: U.mc(right, wr.slice(0, k), k + 1) };
  }
  // kings never ordered against each other (overlapping or co-ruling reigns)
  var NO_PAIR = { 'hatshepsut|thutmose3': 1, 'thutmose3|hatshepsut': 1 };
  function kingOrderQ(keys) {
    return function (R, ctx) {
      var E = EG(), L = lvl(ctx), n = Math.min(L === 3 ? 4 : 3, keys.length), gap = L === 1 ? 100 : L === 2 ? 40 : 15, ks, ok = false, tries = 0;
      while (!ok && tries++ < 400) {
        ks = R.sample(keys, n).map(function (k) { return E.king(k); }).sort(function (a, b) { return a.from - b.from; });
        ok = true;
        for (var i = 1; i < ks.length; i++) { if (ks[i].from - ks[i - 1].from < gap || ks[i].from < ks[i - 1].to || NO_PAIR[ks[i - 1].key + '|' + ks[i].key]) ok = false; }
        if (tries % 60 === 0) { if (gap > 12) gap = Math.max(12, gap - 25); else if (n > 3) n--; }
      }
      if (!ok) { ks = ['djoser', 'khufu', 'ramesses2'].map(function (k) { return E.king(k); }); }
      var names = ks.map(function (k) { return k.name; }), o = orderChoices(R, names, ctx);
      return {
        q: 'Put these rulers in order, earliest first: ' + U.list(R.shuffle(names)) + '.',
        a: o.a,
        steps: ks.map(function (k) { return k.name + ': ' + (k.from === k.to ? yr(k.from) : 'reigned ' + span(k.from, k.to)) + ', ' + (typeof k.dyn === 'number' ? ord(k.dyn) + ' Dynasty, ' : '') + E.period(k.period).name + '.'; }).concat(['The answer: ' + o.right + '.']),
        hint: 'Place each ruler in a period first: Old Kingdom, Middle Kingdom, New Kingdom, Late Period…'
      };
    };
  }
  // which dynasty did this king belong to?
  function dynQ(keys) {
    return function (R, ctx) {
      var E = EG(), k = E.king(R.pick(keys.filter(function (x) { return typeof E.king(x).dyn === 'number'; }))), d = k.dyn;
      var cands = [d - 2, d - 1, d + 1, d + 2, d + 3, d - 3].filter(function (x) { return x >= 1 && x <= 31; });
      var w = (lvl(ctx) === 1 ? [cands[1] || cands[0], cands[2] || cands[3]] : R.sample(cands.slice(0, 4), 3)).filter(function (x, i, a) { return a.indexOf(x) === i && x !== d; });
      return {
        q: 'To which dynasty did ' + k.name + ' belong?',
        a: U.mc('the ' + ord(d) + ' Dynasty', w.map(function (x) { return 'the ' + ord(x) + ' Dynasty'; }), w.length + 1),
        steps: [k.name + ' reigned ' + span(k.from, k.to) + ', in the ' + E.period(k.period).name + '.', k.note || ('He belongs to the ' + ord(d) + ' Dynasty.'), 'The answer: the ' + ord(d) + ' Dynasty.'],
        hint: 'Place the king in a period first; each period has its own dynasties.'
      };
    };
  }
  // which king built this? (the monuments in KINGS.built; names that give the answer away are left out)
  var BUILT_TEXT = { 'Luxor Temple (the core)': 'the core of Luxor Temple', 'his temple-tomb at Deir el-Bahari': 'the first great temple-tomb at Deir el-Bahari, in the 11th Dynasty', 'his pyramid at Nuri': 'the largest pyramid at Nuri' };
  var BUILT_CLASH = { hatshepsut: ['mentuhotep2'], mentuhotep2: ['hatshepsut'] };
  function builtQ(keys, others) {
    return function (R, ctx) {
      var E = EG(), cands = [];
      keys.forEach(function (k) { var K = E.king(k); (K.built || []).forEach(function (b) { if (b.indexOf(K.name) < 0 && !/Seti|Unas/.test(b)) cands.push([K, b]); }); });
      var c = R.pick(cands), K = c[0], mon = BUILT_TEXT[c[1]] || c[1];
      var pool = (others || keys).filter(function (k) { return k !== K.key && (BUILT_CLASH[K.key] || []).indexOf(k) < 0; }).map(function (k) { return E.king(k); });
      var w = R.sample(pool, nWrong(ctx));
      return {
        q: 'Which ruler built ' + mon + '?',
        a: U.mc(K.name, w.map(function (x) { return x.name; }), w.length + 1),
        steps: [cap(mon) + ' belongs to ' + K.name + ', who reigned ' + span(K.from, K.to) + ' (' + E.period(K.period).name + ').', K.note || '', 'The answer: ' + K.name + '.'].filter(Boolean),
        hint: 'Think of the period first: which age built monuments like this?'
      };
    };
  }
  // pick the site on the map: lettered dots, one of them the target
  var VIEW_KM = { egypt: 70, nile: 120, all: 120, delta: 18, memphis: 2.5, thebes: 1.3, upper: 30, nubia: 60, levant: 60, fayum: 8 };
  function inView(s, v) { var b = EG().VIEWS[v]; return s.lat >= b[0] + 0.07 * (b[1] - b[0]) && s.lat <= b[1] - 0.05 * (b[1] - b[0]) && s.lon >= b[2] + 0.05 * (b[3] - b[2]) && s.lon <= b[3] - 0.05 * (b[3] - b[2]); }
  function mapQ(view, targets, pool, desc) {
    return function (R, ctx) {
      var E = EG(), L = lvl(ctx), tv = targets.filter(function (k) { return inView(E.site(k), view); }), t = E.site(R.pick(tv.length ? tv : targets)), min = VIEW_KM[view] * (L === 1 ? 1.6 : L === 2 ? 1.15 : 1);
      var cand = R.shuffle(pool.filter(function (k) { return k !== t.key; })).map(function (k) { return E.site(k); }).filter(function (s) { return inView(s, view); });
      var chosen = [t];
      for (var f = 1; f > 0.65 && chosen.length < nWrong(ctx) + 1; f -= 0.2) cand.forEach(function (s) { if (chosen.length < nWrong(ctx) + 1 && chosen.indexOf(s) < 0 && chosen.every(function (c) { return E.km(c, s) >= min * f; })) chosen.push(s); });
      chosen = R.shuffle(chosen);
      var ix = chosen.indexOf(t), name = t.name + (L === 1 && desc && desc[t.key] ? ', ' + desc[t.key] : '');
      return {
        q: 'On the map, which lettered dot marks ' + name + '?',
        a: { t: 'mc', choices: chosen.map(function (s, i) { return letter(i); }), v: ix, keep: true },
        steps: [t.name + (t.anc ? ' (ancient ' + t.anc + ')' : '') + ': ' + t.note, 'The other dots: ' + chosen.filter(function (s) { return s !== t; }).map(function (s) { return letter(chosen.indexOf(s)) + ' is ' + s.name; }).join('; ') + '.', 'The answer: ' + letter(ix) + '.'],
        hint: 'Remember that the Nile flows north: Upper Egypt is the south, the Delta the north.',
        viz: { name: 'eg-map', opts: { view: view, mode: 'pick', choices: chosen.map(function (s) { return s.key; }), sites: 'none', cities: false, quiet: true, label: 'A map with lettered dots' } }
      };
    };
  }
  // which lettered site is in Upper Egypt (or Lower Egypt)?
  function regionQ(R, ctx) {
    var E = EG(), up = R.coin(), want = up ? 'upper' : 'lower', other = up ? 'lower' : 'upper';
    var a = R.pick(E.SITES.filter(function (s) { return s.region === want && inView(s, 'egypt'); }));
    var rest = R.shuffle(E.SITES.filter(function (s) { return s.region === other && inView(s, 'egypt'); })), chosen = [a];
    rest.forEach(function (s) { if (chosen.length < nWrong(ctx) + 1 && chosen.every(function (c) { return E.km(c, s) >= 60; })) chosen.push(s); });
    chosen = R.shuffle(chosen); var ix = chosen.indexOf(a);
    return {
      q: 'On the map, which lettered dot is in ' + (up ? 'Upper' : 'Lower') + ' Egypt?',
      a: { t: 'mc', choices: chosen.map(function (s, i) { return letter(i); }), v: ix, keep: true },
      steps: ['Upper Egypt is the south, the valley from the First Cataract to near Memphis; Lower Egypt is the north, the Delta.', letter(ix) + ' is ' + a.name + ', in ' + (up ? 'Upper' : 'Lower') + ' Egypt; ' + chosen.filter(function (s) { return s !== a; }).map(function (s) { return letter(chosen.indexOf(s)) + ' is ' + s.name; }).join(', ') + ', in ' + (up ? 'Lower' : 'Upper') + ' Egypt.', 'The answer: ' + letter(ix) + '.'],
      hint: 'Upper and Lower follow the river: upstream is south.',
      viz: { name: 'eg-map', opts: { view: 'egypt', mode: 'pick', choices: chosen.map(function (s) { return s.key; }), sites: 'none', cities: false, quiet: true, regions: false, label: 'A map with lettered dots' } }
    };
  }
  // read a cartouche
  function cartoucheQ(keys) {
    return function (R, ctx) {
      var E = EG(), k = R.pick(keys), N = E.NAMES[k];
      var w = R.sample(Object.keys(E.NAMES).filter(function (x) { return x !== k; }), nWrong(ctx)).map(function (x) { return E.NAMES[x].en; });
      var reading = N.signs.map(function (c) { var S = E.sign(c); return S.u + ' ' + (S.v[0] ? S.v[0] : '(' + S.n + ')'); }).join(', ');
      return {
        q: 'Whose name is written in this cartouche?',
        a: U.mc(N.en, w, w.length + 1),
        steps: ['The signs: ' + reading + '.', 'Read together: ' + N.tl + ', ' + N.en + '.' + (N.note ? ' ' + N.note : ''), 'The answer: ' + N.en + '.'],
        hint: 'Read the sound signs one by one; a sun at the start may be Ra, written first out of honor.',
        viz: { name: 'eg-cartouche', opts: { mode: 'show', name: k, quiet: true, interactive: false } }
      };
    };
  }
  // which pyramid is drawn?
  function pyramidQ(R, ctx) {
    var E = EG(), PY = E.PYRAMIDS, L = lvl(ctx);
    if (L >= 2 && R.coin()) { // the tallest of a line-up
      var set = R.sample(['bent', 'red', 'khafre', 'menkaure', 'step'], L === 2 ? 2 : 3).concat(['great']), ask = 'great';
      var w = set.filter(function (k) { return k !== ask; }).map(function (k) { return PY[k].name; });
      return { q: 'The pyramids are drawn side by side to scale, with their original heights. The one marked "?" is the tallest. Which is it?', a: U.mc(PY.great.name, w, w.length + 1),
        steps: ['The Great Pyramid of Khufu was about ' + PY.great.h + ' m high when new, the tallest of all.', 'Khafre\'s pyramid, the closest rival, was about ' + PY.khafre.h + ' m.', 'The answer: the ' + PY.great.name + '.'], hint: 'Which pyramid held the height record for almost 3,800 years?',
        viz: { name: 'eg-pyramid', opts: { view: 'compare', compare: R.shuffle(set), ask: ask, quiet: true, ref: false, interactive: false } } };
    }
    var k = R.pick(['step', 'bent', 'step', 'bent', 'great']), P = PY[k];
    var w = R.sample(['step', 'bent', 'red', 'great', 'menkaure'].filter(function (x) { return x !== k; }), nWrong(ctx)).map(function (x) { return PY[x].name; });
    var why = { step: 'Six steps of stone mark Djoser\'s Step Pyramid at Saqqara, the first large stone building.', bent: 'The slope changes partway up: that is Sneferu\'s Bent Pyramid at Dahshur, about ' + P.slope + '° at the bottom and ' + P.slope2 + '° at the top.', great: 'A smooth pyramid about ' + P.h + ' m high with a base of about ' + P.base + ' m: the Great Pyramid of Khufu.' }[k];
    return { q: 'Which pyramid is drawn here?', a: U.mc(P.name, w, w.length + 1), steps: [why, 'The answer: the ' + P.name + '.'], hint: 'Look at the shape: steps, a change of angle, or smooth sides?',
      viz: { name: 'eg-pyramid', opts: { which: k, view: 'profile', quiet: true, interactive: false } } };
  }
  // years between two dates (BC and AD, no year 0)
  function between(a, b) { return a < 0 && b > 0 ? b - a - 1 : b - a; }
  function spanQ(events) {
    return function (R, ctx) {
      var pair = R.pick(events), a = pair[0], b = pair[1], n = between(a[0], b[0]);
      var cross = a[0] < 0 && b[0] > 0;
      return {
        q: 'How many years passed between ' + a[1] + ' (' + yr(a[0]) + ') and ' + b[1] + ' (' + yr(b[0]) + ')?' + (cross ? ' Remember that there is no year 0.' : ''),
        a: { t: 'num', v: String(n), form: 'int' },
        steps: cross ? ['From ' + yr(a[0]) + ' to 1 BC is ' + (-a[0] - 1) + ' years; from 1 BC to AD 1 is 1 year; from AD 1 to ' + yr(b[0]) + ' is ' + (b[0] - 1) + ' years.', (-a[0] - 1) + ' + 1 + ' + (b[0] - 1) + ' = ' + n + '.', 'Shortcut: ' + (-a[0]) + ' + ' + b[0] + ' − 1 = ' + n + '.'] : (a[0] < 0 && b[0] < 0 ? ['Both dates are BC, so subtract the smaller number from the larger.', (-a[0]) + ' − ' + (-b[0]) + ' = ' + n + '.'] : ['Both dates are AD, so subtract.', b[0] + ' − ' + a[0] + ' = ' + n + '.']),
        hint: cross ? 'Add the BC and AD numbers, then subtract 1, because there is no year 0.' : 'BC years count down toward year 1.',
        unit: 'years'
      };
    };
  }

  // adding up reigns in an imaginary dynasty (regnal years -> years BC)
  var KNAMES = ['King A', 'King B', 'King C', 'King D'];
  function regnalQ(R, ctx) {
    var L = lvl(ctx), n = L === 1 ? 2 : 3, start = R.int(150, 190) * 10, lens = [];
    for (var i = 0; i < n; i++) lens.push(R.int(L === 1 ? 5 : 3, L === 3 ? 40 : 30));
    var shape = L === 1 ? 'first' : R.pick(['first', 'year']);
    var before = lens.slice(0, n - 1).reduce(function (a, b) { return a + b; }, 0);
    var q = 'Imagine ' + n + ' kings who ruled one after another: ' + lens.map(function (l, j) { return KNAMES[j] + ' for ' + l + ' years'; }).join(', ') + '. Count each regnal year as one calendar year. If ' + KNAMES[0] + '\'s Year 1 was ' + start + ' BC, ';
    var ans, steps, yrN = 0;
    if (shape === 'first') {
      ans = start - before;
      q += 'in what year BC was ' + KNAMES[n - 1] + '\'s Year 1?';
      steps = ['The kings before ' + KNAMES[n - 1] + ' ruled ' + lens.slice(0, n - 1).join(' + ') + ' = ' + before + ' years.', KNAMES[n - 1] + '\'s Year 1 comes ' + before + ' years after ' + KNAMES[0] + '\'s Year 1, and BC years count down.', start + ' − ' + before + ' = ' + ans + ', so ' + ans + ' BC.'];
    } else {
      yrN = R.int(2, lens[n - 1]);
      ans = start - before - (yrN - 1);
      q += 'in what year BC was Year ' + yrN + ' of ' + KNAMES[n - 1] + '?';
      steps = ['The kings before ' + KNAMES[n - 1] + ' ruled ' + lens.slice(0, n - 1).join(' + ') + ' = ' + before + ' years, so ' + KNAMES[n - 1] + '\'s Year 1 was ' + start + ' − ' + before + ' = ' + (start - before) + ' BC.', 'Year ' + yrN + ' is ' + (yrN - 1) + (yrN - 1 === 1 ? ' year' : ' years') + ' after Year 1.', (start - before) + ' − ' + (yrN - 1) + ' = ' + ans + ', so ' + ans + ' BC.'];
    }
    return { q: q + ' (Type the number of the year.)', a: { t: 'num', v: String(ans), form: 'int' }, steps: steps, hint: 'Add up the reigns that come before, then count down from the starting year: BC numbers get smaller as time goes on.', unit: 'BC' };
  }
  // the civil calendar drifts one day every four years
  function sothicQ(R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 'days' : R.pick(['days', 'years', 'full']);
    if (kind === 'days') { var d = R.pick(L === 1 ? [5, 10, 15, 20, 25, 30] : [7, 12, 18, 45, 60, 90]), ys = d * 4;
      return { q: 'The Egyptian civil calendar had 365 days, so it slipped about one day every 4 years against the seasons and the rising of Sirius. About how many years did it take to slip ' + d + ' days?', a: { t: 'num', v: String(ys), form: 'int' }, steps: ['One day of drift takes 4 years.', d + ' days take ' + d + ' × 4 years.', d + ' × 4 = ' + ys + '.'], hint: 'Each day of drift takes 4 years.', unit: 'years' }; }
    if (kind === 'years') { var y = R.pick([40, 80, 100, 200, 240, 400, 600, 800]), dd = y / 4;
      return { q: 'The Egyptian civil calendar slipped about one day every 4 years against the solar year. By about how many days did it slip in ' + y + ' years?', a: { t: 'num', v: String(dd), form: 'int' }, steps: ['One day every 4 years.', y + ' ÷ 4 = ' + dd + '.'], hint: 'Divide the years by 4.', unit: 'days' }; }
    return { q: 'The civil calendar slipped about one day every 4 years. About how many years did it take to slip through a whole calendar year of 365 days and line up with the rising of Sirius again (the "Sothic cycle")?', a: { t: 'num', v: '1460', form: 'int' }, steps: ['365 days of drift at 4 years per day.', '365 × 4 = 1,460.'], hint: 'Multiply the days in the year by 4.', unit: 'years' };
  }
  // a radiocarbon range
  function radioQ(R, ctx) {
    var L = lvl(ctx), c = R.int(L === 1 ? 140 : 100, 320) * 10, e = R.pick(L === 1 ? [20, 30, 40, 50] : [25, 35, 45, 60, 70, 80]), which = R.pick(['earliest', 'latest', 'width']);
    if (L === 1 && which === 'width') which = 'earliest';
    var ans = which === 'earliest' ? c + e : which === 'latest' ? c - e : 2 * e;
    var q = 'A radiocarbon lab reports a date of ' + c + ' ± ' + e + ' BC for seeds from a tomb. ' + (which === 'earliest' ? 'What is the earliest year BC in that range?' : which === 'latest' ? 'What is the latest year BC in that range?' : 'How many years wide is the range?');
    var steps = which === 'width' ? ['The range runs from ' + (c + e) + ' BC to ' + (c - e) + ' BC.', (c + e) + ' − ' + (c - e) + ' = ' + ans + ' years (that is 2 × ' + e + ').'] : ['± ' + e + ' means ' + e + ' years either side of ' + c + ' BC.', 'BC numbers are bigger the earlier they are, so the earliest year is ' + c + ' + ' + e + ' = ' + (c + e) + ' BC and the latest is ' + c + ' − ' + e + ' = ' + (c - e) + ' BC.', 'The answer: ' + ans + (which === 'width' ? ' years.' : ' BC.')];
    return { q: q, a: { t: 'num', v: String(ans), form: 'int' }, steps: steps, hint: 'In BC, earlier means a bigger number.', unit: which === 'width' ? 'years' : 'BC' };
  }
  // read an Egyptian numeral
  function numeralQ(R, ctx) {
    var E = EG(), L = lvl(ctx), n;
    if (L === 1) n = R.int(1, 9) * 10 + R.int(1, 9);
    else if (L === 2) n = R.int(1, 9) * 100 + R.int(0, 9) * 10 + R.int(1, 9);
    else n = R.int(1, 9) * 1000 + R.int(0, 9) * 100 + R.int(0, 6) * 10 + R.int(0, 9);
    var thing = R.pick(['sacks of grain', 'cattle', 'loaves of bread', 'jars of beer', 'goats', 'workmen']);
    var parts = [[1000, 'lotus plant', 'lotus plants'], [100, 'coil of rope', 'coils of rope'], [10, 'hobble', 'hobbles'], [1, 'stroke', 'strokes']], steps = [], m = n, tot = [];
    parts.forEach(function (pt) { var c = Math.floor(m / pt[0]); m -= c * pt[0]; if (c) { steps.push(c + ' ' + (c > 1 ? pt[2] : pt[1]) + ': ' + c + ' × ' + commas(pt[0]) + ' = ' + commas(c * pt[0]) + '.'); tot.push(commas(c * pt[0])); } });
    steps.push('Add: ' + tot.join(' + ') + ' = ' + commas(n) + '.');
    return { q: 'A scribe\'s account records this number of ' + thing + '. What number is written?', a: { t: 'num', v: String(n), form: 'int' }, steps: ['A stroke is 1, a hobble 10, a coil of rope 100, a lotus plant 1,000.'].concat(steps), hint: 'Count each kind of sign and multiply by its value.',
      viz: { name: 'eg-glyphs', opts: { num: n, quiet: true, interactive: false, lines: [] } } };
  }
  function commas(x) { return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // a purchase valued in deben
  var GOODS = [['a goat', 3, 8], ['a pair of sandals', 1, 2], ['a linen shirt', 3, 6], ['a basket', 1, 2], ['a jar of oil', 2, 5], ['a wooden chair', 4, 10], ['a sack of grain', 1, 3], ['a pig', 2, 6]];
  var BUYS = [['a bed', 12, 30], ['a coffin', 20, 40], ['a donkey', 25, 40], ['an ox', 30, 60], ['a decorated box', 10, 25], ['a table', 10, 20]];
  function debenQ(R, ctx) {
    var L = lvl(ctx), b = R.pick(BUYS), price = R.int(b[1], b[2]), n = L === 1 ? 1 : L === 2 ? 2 : 3, gs = R.sample(GOODS, n), paid = 0, list = [];
    gs.forEach(function (g) { var v = R.int(g[1], g[2]); if (paid + v < price) { paid += v; list.push([g[0], v]); } });
    var rest = price - paid;
    return {
      q: 'At Deir el-Medina, a workman buys ' + b[0] + ' valued at ' + price + ' deben. He pays with ' + U.list(list.map(function (x) { return x[0] + ' worth ' + x[1] + ' deben'; })) + ', and makes up the rest in grain. How many deben\' worth of grain must he add?',
      a: { t: 'num', v: String(rest), form: 'int' }, unit: 'deben',
      steps: ['Value paid in goods: ' + (list.length > 1 ? list.map(function (x) { return String(x[1]); }).join(' + ') + ' = ' : '') + paid + ' deben.', 'Still owed: ' + price + ' − ' + paid + ' = ' + rest + ' deben.', 'The deben measures value; no copper needs to change hands.'],
      hint: 'Add up what he has paid, then subtract it from the price.'
    };
  }
  // did two dynasties overlap? (dates from the model)
  var OVER = [[22, 23], [22, 25], [23, 24], [21, 22], [25, 26], [13, 14], [15, 16], [12, 13], [18, 19], [26, 27], [16, 17], [24, 25], [19, 20], [27, 28]];
  function overlapQ(pairs) {
    return function (R, ctx) {
      var E = EG(), pr = R.pick(pairs || OVER), A = E.DYNASTIES.filter(function (d) { return d.n === pr[0]; })[0], B = E.DYNASTIES.filter(function (d) { return d.n === pr[1]; })[0];
      var ov = A.from < B.to && B.from < A.to;
      return {
        q: 'True or false? The ' + ord(A.n) + ' Dynasty (' + span(A.from, A.to) + ') and the ' + ord(B.n) + ' Dynasty (' + span(B.from, B.to) + ') ruled at the same time for some years.',
        a: { t: 'tf', v: ov },
        steps: [ov ? 'True. The ' + ord(B.n) + ' Dynasty began (' + yr(B.from) + ') before the ' + ord(A.n) + ' ended (' + yr(A.to) + '), so they overlapped: they ruled different parts of Egypt at the same time.' : 'False. The ' + ord(B.n) + ' Dynasty began (' + yr(B.from) + ') only when the ' + ord(A.n) + ' had ended (' + yr(A.to) + '), so one followed the other.'],
        hint: 'Does the second dynasty start before the first one ends?'
      };
    };
  }
  // how uncertain are the dates of a period, in this course's model?
  function uncertQ(R, ctx) {
    var E = EG(), P = E.period(R.pick(['ed', 'ok', 'mk', 'nk', 'tip', 'late'])), opts = ['fixed to the year', 'about ± 10 years', 'about ± 20 years', 'about ± 30 years', 'about ± 100 years', 'about ± 150 years'];
    var right = P.pm ? 'about ± ' + P.pm + ' years' : 'fixed to the year';
    var w = R.sample(opts.filter(function (o) { return o !== right; }), nWrong(ctx));
    return { q: 'In the chronology this course uses (Shaw, 2000), how uncertain are the dates of the ' + P.name + ' (' + span(P.from, P.to) + ')?', a: U.mc(right, w, w.length + 1),
      steps: ['The farther back from 664 BC, the more reign lengths must be added up, so the uncertainty grows.', 'For the ' + P.name + ' it is ' + right + '.', 'The answer: ' + right + '.'], hint: 'Dates are fixed from 664 BC on; before that, the uncertainty grows the farther back you go.' };
  }
  // what does this word mean? (a quiet hieroglyphic word from the model)
  function wordQ(keys) {
    return function (R, ctx) {
      var E = EG(), k = R.pick(keys), W = E.WORDS[k];
      var w = R.sample(keys.filter(function (x) { return x !== k; }), nWrong(ctx)).map(function (x) { return E.WORDS[x].en; });
      return { q: 'These hieroglyphs write ' + W.tl + '. What does it mean?', a: U.mc(W.en, w, w.length + 1),
        steps: [W.tl + ' (said "' + E.say(W.tl) + '") means "' + W.en + '".', 'The answer: ' + W.en + '.'], hint: 'Think of how this word is used in royal titles.',
        viz: { name: 'eg-glyphs', opts: { word: k, quiet: true, interactive: false } } };
    };
  }

  // ================================================================ The Land and Its Sources; Building a Chronology
  var D = {};
  var BIG_SITES = ['giza', 'memphis', 'saqqara', 'abydos', 'karnak', 'elephantine', 'alexandria', 'tanis', 'amarna', 'hierakonpolis', 'avaris', 'sais', 'dendera', 'edfu', 'beni-hasan', 'naqada', 'bubastis', 'heliopolis', 'meidum', 'philae', 'abu-simbel'];
  var DESC = { giza: 'where the great pyramids stand', memphis: 'the old capital near the head of the Delta', karnak: 'the great temple of Amun at Thebes', abydos: 'the cult center of Osiris', elephantine: 'the southern frontier town at the First Cataract', alexandria: 'Alexander\'s city on the coast', tanis: 'a capital in the eastern Delta', amarna: 'Akhenaten\'s city in Middle Egypt', hierakonpolis: 'an early capital of the south', avaris: 'the Hyksos capital in the eastern Delta', sais: 'the capital of the 26th Dynasty, in the western Delta', saqqara: 'the cemetery of Memphis', 'abu-simbel': 'Ramesses II\'s rock-cut temples in Nubia', philae: 'the temple of Isis near Aswan', semna: 'the fort at the Second Cataract', buhen: 'the fortress at the Second Cataract', kerma: 'the capital of Kush', napata: 'the Kushite capital by Jebel Barkal', nuri: 'the Kushite royal pyramids', meroe: 'the later capital of Kush', megiddo: 'the battlefield of Thutmose III', kadesh: 'the battlefield of Ramesses II', byblos: 'the cedar port', siwa: 'the oasis of Amun\'s oracle', 'deir-el-bahari': 'Hatshepsut\'s terraced temple', 'deir-el-medina': 'the workmen\'s village', kings: 'the royal tombs of the New Kingdom', 'medinet-habu': 'Ramesses III\'s temple', ramesseum: 'Ramesses II\'s memorial temple', luxor: 'Amenhotep III\'s temple', 'piramesse': 'Ramesses II\'s Delta capital', naukratis: 'the Greek trading town', bubastis: 'the city of Bastet', edfu: 'the temple of Horus', dendera: 'the temple of Hathor', babylon: 'the fortress at Old Cairo', oxyrhynchus: 'the town of the papyri', heliopolis: 'the city of the sun god' };

  D.geography = { hint: 'Almost everyone lived where the water was.', f: [
    ['Where did nearly all ancient Egyptians live?', 'in the Nile valley and the Delta', ['spread evenly across the deserts', 'mostly in the oases of the Western Desert', 'along the Red Sea coast'], 'Egypt has almost no rain, so farming, and therefore settled life, depended on the river: the narrow valley and the fan of the Delta.'],
    ['What did Egyptians call their farmland, after the color of the river mud?', 'Kemet, "the black land"', ['Deshret, "the red land"', 'Ta-sety, "the land of the bow"', 'Punt, "the land of the god"'], 'Kemet, the black land, was the fertile valley and Delta; Deshret, the red land, was the desert.'],
    ['About how wide was the strip of farmland along the Nile valley, at most places?', 'rarely more than about 20 km', ['about 500 km', 'about 200 km', 'less than 100 m'], 'The valley is a narrow ribbon of farmland, rarely more than about 20 km wide, with desert cliffs on both sides.'],
    ['What was the desert mainly used for?', 'cemeteries, quarries, mines and trade routes', ['large farming towns', 'the royal capital', 'rice fields'], 'The red land held burials, stone quarries, gold and copper mines, and the roads to the oases and the Red Sea; people lived and farmed in the black land.'],
    ['Which part of Egypt is the fan-shaped area where the Nile splits into branches before reaching the Mediterranean?', 'the Delta', ['the Faiyum', 'the First Cataract', 'the Western Desert'], 'The Delta is the wide, flat, branching land between Memphis and the sea.'],
    ['What were the cataracts?', 'rocky stretches of rapids south of Aswan that made the river hard to sail', ['the mouths of the Nile at the sea', 'waterfalls in the Delta', 'canals dug by the pharaohs'], 'The cataracts are rocky rapids; the First Cataract at Aswan was Egypt\'s usual southern border.'],
    ['Which direction does the Nile flow through Egypt?', 'from south to north', ['from north to south', 'from west to east', 'from east to west'], 'The Nile rises far to the south and flows north to the Mediterranean.'],
    ['Why did boats sailing south up the Nile raise a sail?', 'the wind in Egypt usually blows from the north', ['the current flows south', 'the river is too shallow for oars', 'sails were required by law'], 'The current carries boats north; the prevailing north wind pushes sailing boats south.', { lv: 2 }],
    ['The Faiyum is best described as…', 'a fertile basin west of the valley, fed by a branch of the Nile', ['a desert oasis far from the river', 'the mouth of the Nile', 'a mountain range in Sinai'], 'The Faiyum is a basin with a lake, watered by a channel from the Nile; Middle Kingdom kings worked to farm more of it.', { lv: 2 }]
  ], t: [
    { s: 'Most of the land inside modern Egypt\'s borders was farmland in ancient times.', v: false, why: 'Most of it is desert. Farmland was only the narrow valley, the Delta, the Faiyum and the oases.' },
    { s: 'Egypt gets very little rain, so farming depended on the Nile.', v: true, why: 'Egypt is one of the driest places on earth; the river brought both water and fertile mud.' },
    { s: 'The First Cataract at Aswan was Egypt\'s usual southern border.', v: true, why: 'South of Aswan lay Nubia; the rapids of the First Cataract made a natural frontier.' }
  ], s: [[2, mapQ('egypt', ['giza', 'karnak', 'abydos', 'elephantine', 'alexandria', 'memphis', 'amarna', 'tanis'], BIG_SITES, DESC)]] };
  G('hist.geography', function (R, ctx) { return run(R, ctx, D.geography); });

  D.inundation = { hint: 'Think about where the water came from, and when.', f: [
    ['Where did the water of the Nile flood come from?', 'summer monsoon rains on the Ethiopian highlands', ['heavy rain in Egypt itself', 'melting snow in the Delta', 'the Mediterranean Sea'], 'Monsoon rains on the Ethiopian highlands swelled the Blue Nile and the Atbara, which carried the surge north to Egypt.'],
    ['In which season did the flood reach Egypt?', 'summer', ['winter', 'early spring', 'it came at random times'], 'The flood arrived in summer, after the monsoon rains in Ethiopia, and covered the fields for weeks.'],
    ['What did the flood leave behind on the fields?', 'a layer of fresh, fertile silt', ['a layer of salt', 'sand from the desert', 'nothing; it only watered them'], 'The flood water carried mud from the highlands and dropped it on the fields, renewing the soil each year.'],
    ['What did a nilometer measure?', 'the height of the river', ['the speed of boats', 'the size of a field', 'the weight of grain'], 'Nilometers were marked stairs or wells that recorded the river\'s level, used to forecast the harvest and set taxes.'],
    ['What did a very low flood usually mean?', 'a poor harvest and hunger', ['a record harvest', 'no change at all', 'flooded villages'], 'A low flood soaked fewer basins, so less land could be sown and the harvest was small.'],
    ['What did Egyptians call the season of the flood?', 'akhet', ['peret', 'shemu', 'heb-sed'], 'The year had three seasons: akhet (inundation), peret (growing) and shemu (harvest).'],
    ['Which branch of the Nile carried most of the flood water and mud?', 'the Blue Nile, from Ethiopia', ['the White Nile, from the great lakes', 'the Delta branches', 'the canal to the Faiyum'], 'The White Nile flows steadily; the Blue Nile swells hugely with the summer rains and carries most of the silt.', { lv: 2 }],
    ['Put the three Egyptian seasons in order, starting with the flood.', 'akhet → peret → shemu', ['akhet → shemu → peret', 'peret → akhet → shemu', 'shemu → peret → akhet'], 'Inundation (akhet), then growing as the land came out of the water (peret), then harvest (shemu).', { lv: 2 }],
    ['How many days did the Egyptian civil year have?', '365: twelve months of 30 days plus 5 extra days', ['360: twelve months of 30 days', '354: twelve moon months', '366 every year'], 'Three seasons of four 30-day months make 360 days; five extra days were added at the end.', { lv: 3 }],
    ['Why did officials care so much about the height of the flood?', 'it predicted the harvest, and taxes were set from it', ['it decided the date of the king\'s coronation', 'it showed which gods were angry', 'boats could only sail at high water'], 'The flood decided how much land could be farmed, so it was the best forecast of the grain harvest and of the taxes it could bear.', { lv: 2 }]
  ], t: [
    { s: 'The Nile flood came from heavy rains in Egypt.', v: false, why: 'Egypt has almost no rain; the flood came from monsoon rains on the Ethiopian highlands.' },
    { s: 'A very high flood could be as harmful as a very low one.', v: true, why: 'A very high flood could sweep away dikes and villages, while a low one left fields dry.' },
    { s: 'Since the Aswan High Dam was finished in 1970, the yearly flood no longer reaches Egypt.', v: true, why: 'Lake Nasser behind the dam holds the water back and releases it steadily.' }
  ] };
  G('hist.inundation', function (R, ctx) { return run(R, ctx, D.inundation); });

  D['two-lands'] = { hint: 'Upper and Lower follow the river: upstream is "upper".', f: [
    ['Which part of Egypt is Upper Egypt?', 'the south, the valley upstream from near Memphis to Aswan', ['the north, the Delta', 'the Western Desert', 'Sinai'], 'The Nile flows north, so upstream (upper) is the south.'],
    ['Which part of Egypt is Lower Egypt?', 'the north: the Delta', ['the south, near Aswan', 'the oases', 'Nubia'], 'Lower Egypt is downstream, the Delta, where the river ends at the sea.'],
    ['What were the nomes?', 'the provinces of Egypt, each with a capital and local gods', ['the king\'s five names', 'the seasons of the year', 'the cataracts of the Nile'], 'Egypt was divided into about 42 nomes, about 22 in Upper Egypt and 20 in Lower Egypt.'],
    ['Which crown belonged to Upper Egypt?', 'the White Crown', ['the Red Crown', 'the Blue Crown', 'the Double Crown'], 'The tall White Crown stood for Upper Egypt, the Red Crown for Lower Egypt, and the Double Crown for both.'],
    ['Which crown belonged to Lower Egypt?', 'the Red Crown', ['the White Crown', 'the Atef crown', 'the nemes headcloth'], 'The Red Crown, with a curl in front, stood for Lower Egypt.'],
    ['What was the Double Crown?', 'the White and Red Crowns worn together, for rule over both lands', ['a crown worn only by queens', 'two crowns worn by two kings at once', 'a crown for the god Ra'], 'The Double Crown combined the White Crown of the south and the Red Crown of the north.'],
    ['Which plant stood for Lower Egypt?', 'the papyrus', ['the sedge', 'the palm tree', 'the lotus of Upper Egypt'], 'The papyrus grew in the Delta marshes and was the emblem of Lower Egypt.', { lv: 2 }],
    ['A traveler sails from Memphis south to Thebes. Where is she going?', 'into Upper Egypt, against the current', ['into Lower Egypt, with the current', 'into the Delta', 'toward the Mediterranean'], 'South is upstream, and upstream is Upper Egypt.', { lv: 2 }],
    ['The royal title nsw-bjt means…', '"King of Upper and Lower Egypt"', ['"Son of Ra"', '"Lord of the Two Crowns"', '"Great House"'], 'nsw (the sedge) for the south and bjt (the bee) for the north: the king of both lands.', { lv: 2, viz: { name: 'eg-glyphs', opts: { word: 'nesubit', quiet: true, interactive: false } } }],
    ['Which goddess protected Upper Egypt?', 'Nekhbet, the vulture', ['Wadjet, the cobra', 'Hathor, the cow', 'Bastet, the cat'], 'Nekhbet of Nekhen (Hierakonpolis) protected the south; Wadjet of Buto protected the north.', { lv: 3 }]
  ], t: [
    { s: 'Upper Egypt is in the north, at the top of a modern map.', v: false, why: 'Upper Egypt is the south: "upper" means upstream on a river that flows north.' },
    { s: 'Egyptians called their country "the Two Lands".', v: true, why: 'The phrase reflects a kingdom made of two halves, the valley and the Delta, under one king.' },
    { s: 'Each nome had its own capital town and local god.', v: true, why: 'Nomes were provinces with their own centers, gods and standards (emblems).' }
  ], s: [[2, regionQ]] };
  G('hist.two-lands', function (R, ctx) { return run(R, ctx, D['two-lands']); });

  D.sources = { hint: 'Ask who made the source, and why.', f: [
    ['A king\'s temple wall describes a battle. What should a historian expect?', 'that it shows the king\'s side as victorious, whatever happened', ['a balanced account of both sides', 'an exact list of losses on both sides', 'that it was written by the enemy'], 'Royal inscriptions were made to show the king defeating chaos; defeats were not recorded as defeats.'],
    ['What is an ostracon?', 'a flake of stone or piece of pottery used for writing notes', ['a kind of papyrus scroll', 'a royal statue', 'a temple doorway'], 'Ostraca were cheap writing surfaces for notes, accounts, letters and school exercises.'],
    ['Why have far more papyri survived from the desert edge than from the Delta?', 'papyrus survives only where it stays dry', ['the Delta had no writing', 'Delta papyri were all burned on purpose', 'papyrus was only made in the south'], 'The wet soil of the Delta destroyed papyrus; the dry desert edge preserved it.'],
    ['Which of these is a foreign record that tells part of Egypt\'s story?', 'Hittite clay tablets about Egypt', ['a temple relief at Karnak', 'a papyrus from Deir el-Medina', 'a tomb painting at Thebes'], 'Records of other kingdoms, like Hittite tablets or the Amarna letters, give another side of events.'],
    ['Herodotus, the Greek historian, is useful mostly for…', 'what visitors to Late Period Egypt saw and were told', ['eyewitness accounts of the pyramid builders', 'official Egyptian records of every reign', 'translations of hieroglyphic texts'], 'Herodotus visited Egypt in the 5th century BC, long after the pyramids; he reports what he saw and heard, mixed with legend.'],
    ['What can archaeology tell us that royal inscriptions usually do not?', 'how ordinary people lived, ate and worked', ['the king\'s official titles', 'which god was the king\'s father', 'the names of royal victories'], 'Houses, tools, food remains and bones show daily life, which royal texts rarely describe.'],
    ['Which script was used for everyday writing on papyrus in the pharaonic period?', 'hieratic', ['Coptic', 'Greek', 'cuneiform'], 'Hieratic is a quick, joined-up form of hieroglyphs written in ink; later came Demotic.', { lv: 2 }],
    ['An Egyptian temple says the king won a great battle; afterward the enemy still holds the disputed town. What is the best conclusion?', 'the battle was probably not the clear victory the temple claims', ['the temple must be correct', 'the town was never disputed', 'the enemy record must be forged'], 'The outcome on the ground is harder to spin than a description of the fighting; the sources must be weighed together.', { lv: 2 }],
    ['Why is a source written two thousand years after the events usually weaker evidence than one written at the time?', 'it depends on stories passed down, often mixed with legend', ['older sources are always lies', 'later writers could not read', 'it is always stronger, because they knew more'], 'The farther a writer is from the events, the more he relies on retold stories.', { lv: 3 }]
  ], t: [
    { s: 'Royal inscriptions are reliable records of defeats as well as victories.', v: false, why: 'Kings recorded victories and perfect order; defeats were left out or turned into victories.' },
    { s: 'Every kind of source has its own point of view.', v: true, why: 'Each was made by someone, for someone; asking who and why is the first step in using it.' },
    { s: 'Thousands of ostraca from Deir el-Medina tell us about ordinary workers.', v: true, why: 'The workmen\'s village left notes on stone and pottery about work, debts, quarrels and family life.' }
  ] };
  G('hist.sources', function (R, ctx) { return run(R, ctx, D.sources); });

  D.periods = { hint: 'Kingdoms were times of one strong state; intermediate periods were times of division.', f: [
    ['What is a "kingdom" in the modern division of Egyptian history?', 'a time when one strong government ruled all of Egypt', ['a period named by the Egyptians themselves', 'the reign of a single king', 'a time with no kings'], 'Old, Middle and New Kingdoms were times of a united state; the labels are modern.'],
    ['What is an "intermediate period"?', 'a time when power was divided among rival rulers', ['a time with no people in Egypt', 'a time when Egypt was ruled from Rome', 'a short gap between two reigns'], 'The First, Second and Third Intermediate Periods were times of division, though life and culture went on.'],
    ['Who invented the names "Old Kingdom" and "Intermediate Period"?', 'modern historians', ['the pharaohs', 'Manetho', 'the Hyksos'], 'The labels began with scholars in the 1800s; the Egyptians counted time by kings.'],
    ['Which period comes between the Old Kingdom and the Middle Kingdom?', 'the First Intermediate Period', ['the Second Intermediate Period', 'the Early Dynastic Period', 'the Late Period'], 'Old Kingdom, then the First Intermediate Period, then the Middle Kingdom.'],
    ['Which period comes between the Middle Kingdom and the New Kingdom?', 'the Second Intermediate Period', ['the First Intermediate Period', 'the Third Intermediate Period', 'the Ptolemaic Period'], 'Middle Kingdom, Second Intermediate Period (the Hyksos), New Kingdom.'],
    ['Which period came right after the New Kingdom?', 'the Third Intermediate Period', ['the Late Period', 'the Middle Kingdom', 'the Ptolemaic Period'], 'After the New Kingdom (to c. 1069 BC) came the Third Intermediate Period, then the Late Period from 664 BC.'],
    ['Why does this course write "c." before dates earlier than 664 BC?', 'because those dates are approximate', ['because they are in the Coptic calendar', 'because they come from Manetho only', 'because they are exact'], 'Before 664 BC dates are best estimates, uncertain by years to a century or more.', { lv: 2 }],
    ['Which chronology does this course use?', 'the dates of Shaw\'s Oxford History of Ancient Egypt (2000)', ['dates invented for this course', 'the dates of Herodotus', 'the Egyptian civil calendar'], 'One consistent set of dates: Ian Shaw, ed., The Oxford History of Ancient Egypt (2000).', { lv: 3 }]
  ], t: [
    { s: 'The Egyptians themselves called the age of the pyramids "the Old Kingdom".', v: false, why: '"Old Kingdom" is a modern label; Egyptians counted time by the reigns of kings.' },
    { s: 'In BC dates, a bigger number is earlier.', v: true, why: 'BC years count down toward 1 BC, so c. 2055 BC comes before c. 1650 BC.' },
    { s: 'During intermediate periods, nothing much happened in Egypt.', v: false, why: 'People farmed, built, wrote and traded; power was divided, not absent.' }
  ], s: [[3, periodQ(['ok', 'mk', 'nk', 'fip', 'sip', 'tip', 'late', 'ptol', 'ed'])], [2, periodMarkQ(['ok', 'mk', 'nk', 'fip', 'sip', 'tip', 'late', 'ptol', 'ed'])], [1, periodOrderQ]] };
  G('hist.periods', function (R, ctx) { return run(R, ctx, D.periods); });

  D['king-lists'] = { hint: 'Ask who made the list, and for what purpose.', f: [
    ['Which king list is a papyrus that gives the length of each reign?', 'the Turin King List', ['the Abydos list', 'the Narmer Palette', 'the Rosetta Stone'], 'The Turin King List, written under Ramesses II, gave reign lengths in years, months and days; it is now broken into many fragments.'],
    ['Whose temple holds the Abydos King List?', 'Seti I\'s temple at Abydos', ['Hatshepsut\'s temple at Deir el-Bahari', 'Khufu\'s pyramid', 'the Ptolemies\' temple at Edfu'], 'Seti I and his son Ramesses are shown honoring 76 royal names, from Menes to Seti.'],
    ['Which rulers does the Abydos King List leave out on purpose?', 'Hatshepsut and the Amarna kings, such as Akhenaten and Tutankhamun', ['Khufu and the pyramid builders', 'Ramesses II and Seti I', 'all the kings of the Middle Kingdom'], 'Only rulers counted as rightful ancestors were honored; Hatshepsut and the Amarna kings were omitted.'],
    ['The Palermo Stone records…', 'early kings year by year, with floods and festivals', ['the treaty with the Hittites', 'the Greek kings of Egypt', 'the names on the Rosetta Stone'], 'Its fragments are annals of kings up to the 5th Dynasty, with events and Nile heights for each year.'],
    ['Why were the carved king lists not complete histories?', 'they honored rightful ancestors and left out rejected rulers', ['they were carved before writing existed', 'they were copied from Greek books', 'they were made by foreign enemies'], 'Lists like Abydos were part of an offering cult for the royal ancestors; rulers seen as illegitimate were left out.', { lv: 2 }],
    ['On the Abydos list, which king comes right after Amenhotep III?', 'Horemheb', ['Akhenaten', 'Tutankhamun', 'Thutmose III'], 'The list skips Akhenaten, Smenkhkare, Tutankhamun and Ay, jumping from Amenhotep III to Horemheb.', { lv: 2 }],
    ['What problem can a king list cause when kings ruled at the same time in different places?', 'it may list them one after another, making history look too long', ['it makes history look shorter', 'it cannot list them at all', 'no problem: lists always mark overlaps'], 'Rival kings listed in sequence add up to more years than really passed.', { lv: 3 }],
    ['Under which king was the Karnak king list made?', 'Thutmose III', ['Narmer', 'Cleopatra VII', 'Ptolemy I'], 'A chamber at Karnak shows Thutmose III honoring earlier kings.', { lv: 3 }]
  ], t: [
    { s: 'The Abydos King List includes every ruler of Egypt up to Seti I.', v: false, why: 'It leaves out rejected rulers such as Hatshepsut and the Amarna kings, and skips most kings of the intermediate periods.' },
    { s: 'The Turin King List is broken into many fragments, so many entries are lost.', v: true, why: 'The papyrus was damaged before reaching Turin; scholars have pieced together hundreds of fragments.' }
  ], s: [[1, kingOrderQ(['djoser', 'khufu', 'unas', 'mentuhotep2', 'senusret1', 'ahmose1', 'amenhotep3', 'horemheb', 'seti1', 'ramesses2'])]] };
  G('hist.king-lists', function (R, ctx) { return run(R, ctx, D['king-lists']); });

  D.manetho = { hint: 'Manetho wrote in Greek, early in the Ptolemaic period.', f: [
    ['Who was Manetho?', 'an Egyptian priest who wrote a history of Egypt in Greek', ['a Greek general who conquered Egypt', 'a pharaoh of the 1st Dynasty', 'a Roman emperor'], 'Manetho, an Egyptian priest of the early 3rd century BC, wrote the Aegyptiaca for the Ptolemies.'],
    ['How many dynasties did Manetho describe (before a 31st was added later)?', '30', ['12', '18', '100'], 'Manetho grouped the kings into 30 dynasties; historians still use his numbers.'],
    ['How does Manetho\'s history survive?', 'only in quotations and summaries by later writers', ['complete, on a papyrus found at Thebes', 'carved on the walls of Karnak', 'it does not survive at all'], 'His book is lost; Josephus quoted it, and Africanus and Eusebius made lists from it.'],
    ['When did Manetho live?', 'in the early Ptolemaic period, the early 3rd century BC', ['in the Old Kingdom', 'in the reign of Ramesses II', 'in Roman times'], 'He wrote under the first Ptolemies, using temple records.'],
    ['Is a "dynasty" in Manetho always one family?', 'not always: some divisions follow a change of capital', ['yes, always one family', 'no, a dynasty is always 100 years', 'no, a dynasty is one king'], 'Manetho\'s dynasties usually match families, but sometimes follow a change of capital, and some overlap.'],
    ['In which language did Manetho write?', 'Greek', ['Middle Egyptian', 'Latin', 'Akkadian'], 'He wrote for the new Greek-speaking rulers of Egypt.', { lv: 2 }],
    ['Why can different versions of Manetho give different reign lengths for the same king?', 'his book survives through copies of copies that drifted apart', ['he changed his mind every year', 'the kings changed their reign lengths', 'Egyptians had two calendars'], 'Josephus, Africanus and Eusebius each passed on his lists, and copyists made errors.', { lv: 2 }],
    ['Which writer quoted Manetho\'s account of the Hyksos?', 'Josephus', ['Herodotus', 'Plutarch', 'Champollion'], 'The Jewish historian Josephus (1st century AD) quoted long passages, including the Hyksos story.', { lv: 3 }]
  ], t: [
    { s: 'Adding up all of Manetho\'s dynasties end to end gives the true length of Egyptian history.', v: false, why: 'Some dynasties overlapped, especially in intermediate periods, so adding them end to end makes history too long.' },
    { s: 'Historians still number the dynasties as Manetho did.', v: true, why: 'His numbering is a convenient framework that every Egyptologist uses.' }
  ], s: [[2, overlapQ()]] };
  G('hist.manetho', function (R, ctx) { return run(R, ctx, D.manetho); });

  D['regnal-years'] = { hint: 'Each reign restarted the count at Year 1.', f: [
    ['How did Egyptians usually date a document?', 'by the year of the reigning king, such as "Year 5 of His Majesty"', ['in years BC', 'from the founding of Memphis', 'from the birth of Ra'], 'Dates were regnal years: Year, month, season and day of the current king.'],
    ['What happened to the year count when a new king came to the throne?', 'it started again at Year 1', ['it kept counting from the old king', 'it jumped to Year 100', 'there was no count'], 'Each reign restarted the count.'],
    ['What is a co-regency?', 'a time when two kings ruled together', ['a time with no king', 'a queen ruling alone', 'a king ruling two countries'], 'Some kings made their heirs co-rulers; during those years two reigns ran at once.'],
    ['Why do co-regencies make adding up reigns tricky?', 'the same years can be counted twice', ['they make reigns shorter', 'they were never recorded', 'they only happened under the Romans'], 'If two reigns overlapped, adding both lengths counts the shared years twice.'],
    ['What do historians need to turn regnal years into years BC?', 'the order of the kings and the length of each reign', ['only the name of the king', 'the height of the Nile', 'the king\'s throne name'], 'With the order and lengths, the reigns can be added up from a fixed point.', { lv: 2 }],
    ['The three Egyptian seasons used in dates were…', 'akhet, peret and shemu', ['spring, summer and winter', 'Thoth, Paophi and Hathyr', 'sed, opet and wag'], 'Dates named a month of one of the three seasons: inundation, growing and harvest.', { lv: 2 }],
    ['Thutmose III counted his regnal years from his accession. How were the years when Hatshepsut ruled as king counted?', 'as part of his count, because he stayed king beside her', ['as a gap with no years', 'as her own separate count, which replaced his', 'as years of Ahmose'], 'Thutmose III\'s Year 23, when he fought at Megiddo, includes the years Hatshepsut reigned beside him.', { lv: 3 }]
  ], t: [
    { s: 'Egyptians counted years in one continuous era, like BC and AD.', v: false, why: 'They counted by reigns; each new king started again at Year 1.' }
  ], s: [[4, regnalQ]] };
  G('hist.regnal-years', function (R, ctx) { return run(R, ctx, D['regnal-years']); });

  D['astronomy-dating'] = { hint: 'The civil calendar had 365 days, a quarter day short of the solar year.', f: [
    ['What is the "heliacal rising" of Sirius?', 'the first morning Sirius is seen again before dawn after weeks hidden by the sun', ['the moment Sirius is highest at midnight', 'an eclipse of Sirius by the moon', 'the day Sirius sets in the west'], 'After weeks lost in the sun\'s glare, Sirius reappears briefly before dawn: that first sighting is its heliacal rising.'],
    ['Why did the Egyptian civil calendar drift against the seasons?', 'it had 365 days, but the solar year is about 365¼ days', ['it had only 360 days', 'it followed the moon', 'the priests changed it every year'], 'Losing a quarter day each year adds up to one day every 4 years.'],
    ['What is the Sothic cycle?', 'the roughly 1,460 years it took the calendar to drift back into line with the rising of Sirius', ['the life of the Apis bull', 'the 30-year cycle of the sed festival', 'the length of a dynasty'], 'At one day every 4 years, a full 365-day slip takes about 365 × 4 = 1,460 years.'],
    ['Which Roman writer recorded that the Egyptian new year and the rising of Sirius fell together in AD 139?', 'Censorinus', ['Herodotus', 'Manetho', 'Josephus'], 'Censorinus\'s record gives a fixed point from which older Sirius dates can be counted back.'],
    ['Why can astronomical dates for a reign shift by decades?', 'they depend on where the observation was made and how the calendar was kept', ['the stars have moved since then', 'the Egyptians did not record any', 'they are exact to the day'], 'Sirius rises later in the south than the north; the choice of place and calendar details change the result.', { lv: 2 }],
    ['A Sirius date is recorded in the reign of which Middle Kingdom king, in the Illahun papyri?', 'Senusret III', ['Khufu', 'Ramesses II', 'Ptolemy V'], 'The Illahun papyri record a rising of Sirius in the reign of Senusret III.', { lv: 3 }]
  ], t: [
    { s: 'Astronomical dates fix every Egyptian reign to the exact year.', v: false, why: 'The observations are precise, but matching them depends on assumptions about place and calendar that change results by decades.' },
    { s: 'The civil calendar slipped about one day every four years.', v: true, why: '365 days against a year of about 365¼ days: a quarter day a year, one day in four years.' }
  ], s: [[3, sothicQ]] };
  G('hist.astronomy-dating', function (R, ctx) { return run(R, ctx, D['astronomy-dating']); });

  D.radiocarbon = { hint: 'Radiocarbon gives a range of years, not one year.', f: [
    ['What does radiocarbon dating measure?', 'how much carbon-14 is left in plant or animal remains', ['the age of stone blocks', 'the depth of a layer of sand', 'the weight of a mummy'], 'Living things take in carbon-14; after death it decays at a known rate.'],
    ['What kind of result does radiocarbon dating give?', 'a range of years, often several decades wide', ['one exact year', 'the name of the king', 'the season of the year'], 'Results are ranges with a stated uncertainty, turned into calendar years by calibration.'],
    ['Which samples are best for dating an Egyptian reign?', 'short-lived plant remains, like seeds or reeds, from a context tied to that reign', ['stone from a temple wall', 'old beams that may have been reused', 'gold jewelry'], 'Short-lived plants died the year they grew; old wood may be centuries older than the building.'],
    ['Why must radiocarbon results be "calibrated"?', 'the amount of carbon-14 in the air has varied over time', ['the samples are too small', 'Egyptian years were shorter', 'carbon-14 never decays'], 'Labs compare results with tree rings of known age to turn them into calendar years.'],
    ['About how long does it take for half the carbon-14 in a sample to decay?', 'about 5,700 years', ['about 57 years', 'about 570 years', 'about 57,000 years'], 'Its half-life is about 5,700 years, which suits the time span of Egyptian history.', { lv: 2 }],
    ['What did a large 2010 radiocarbon study of Egyptian dynastic samples find?', 'results broadly agree with the historians\' chronology', ['Egyptian history is a thousand years shorter', 'the pyramids are older than the Ice Age', 'radiocarbon cannot be used in Egypt'], 'Over 200 short-lived samples fit the standard chronology in broad outline, some dates a little earlier.', { lv: 2 }],
    ['For which part of Egyptian history is radiocarbon most important?', 'the Predynastic Period and the first dynasties', ['the Ptolemaic Period', 'Roman Egypt', 'the reign of Cleopatra'], 'Before writing, there are no reigns to add up; radiocarbon provides most of the dates.', { lv: 2 }],
    ['Why might wood from a temple roof give a date much earlier than the temple?', 'the tree may have grown long before it was cut, or the beam reused', ['wood ages faster in Egypt', 'temples were built before trees existed', 'roofs were added later'], 'Radiocarbon dates when the wood grew, which can be long before it was used.', { lv: 3 }]
  ], t: [
    { s: 'Radiocarbon dating gives one exact year.', v: false, why: 'It gives a range, often several decades wide.' },
    { s: 'Radiocarbon dating can only be used on things that were once alive.', v: true, why: 'It measures carbon-14 taken in by living plants and animals.' }
  ], s: [[3, radioQ]] };
  G('hist.radiocarbon', function (R, ctx) { return run(R, ctx, D.radiocarbon); });

  D['how-sure'] = { hint: 'Dates are fixed from 664 BC; before that, the error grows the farther back you go.', f: [
    ['From what year are Egyptian dates fixed exactly?', '664 BC, the accession of Psamtek I', ['AD 1', 'the start of the 1st Dynasty', 'the accession of Ramesses II'], 'Links with Assyrian, Babylonian and Greek records fix dates from 664 BC on.'],
    ['Why are Old Kingdom dates less certain than New Kingdom dates?', 'more uncertain reign lengths must be added up to reach them', ['Old Kingdom kings did not count years', 'the Old Kingdom is not in any king list', 'radiocarbon does not work for them'], 'Each missing or uncertain reign adds error, so the error grows going back.'],
    ['Why do different books give different dates for Khufu?', 'they weigh the same evidence a little differently', ['some books are about a different Khufu', 'his reign has an exact known date', 'his name changed'], 'Respected chronologies differ by decades for the Old Kingdom; all are best estimates.'],
    ['A tomb is dated c. 2165 BC, near the c. 2160 BC end of the Old Kingdom. What can we say?', 'the date alone cannot settle which period it belongs to', ['it is certainly Old Kingdom', 'it is certainly First Intermediate Period', 'it must be from the New Kingdom'], 'With an uncertainty of many decades, a 5-year difference decides nothing; other evidence must.', { lv: 2 }],
    ['Which statement about the date c. 2589 BC for the start of Khufu\'s reign is accurate?', 'it is a best estimate; other chronologies differ by decades', ['it is exact to the day', 'it comes from a Roman calendar', 'it was carved on the Great Pyramid'], 'Early dates are best estimates from adding up reigns; respected chronologies differ for the Old Kingdom.', { lv: 2 }],
  ], t: [
    { s: 'Dates of the Late Period, after 664 BC, are fixed to the year.', v: true, why: 'They are tied to Assyrian, Babylonian and Greek records.' },
    { s: 'The uncertainty in Egyptian dates is about the same in every period.', v: false, why: 'It is a decade or two in the New Kingdom and a century or more in the Old Kingdom.' }
  ], s: [[2, uncertQ], [2, spanQ([[[-30, 'Egypt becoming Roman'], [641, 'the Arab conquest']], [[-332, 'Alexander\'s arrival'], [394, 'the last hieroglyphic inscription']], [[-30, 'the death of Cleopatra'], [394, 'the last hieroglyphic inscription']], [[-664, 'the accession of Psamtek I'], [-332, 'Alexander\'s arrival']], [[-196, 'the Rosetta Stone decree'], [394, 'the last hieroglyphic inscription']], [[-525, 'the Persian conquest'], [-30, 'the Roman conquest']]])]] };
  G('hist.how-sure', function (R, ctx) { return run(R, ctx, D['how-sure']); });

  // ================================================================ Before the Pharaohs; Early Dynastic and Old Kingdom
  var OK_KINGS = ['djoser', 'sneferu', 'khufu', 'khafre', 'menkaure', 'unas', 'pepi2'];

  D.naqada = { hint: 'Farming came first; kings came at the end of a long story.', f: [
    ['Which culture of Upper Egypt grew into chiefdoms and spread across the whole country before the first kings?', 'the Naqada culture', ['the Hyksos', 'the Ptolemaic culture', 'the Kerma culture'], 'The Naqada culture (c. 4000–3000 BC) grew richer and spread north before unification.'],
    ['Which came first in Upper Egypt?', 'the Badarian culture', ['the Naqada III phase', 'the 1st Dynasty', 'the Old Kingdom'], 'The Badarian culture (c. 4400–4000 BC) came before Naqada I, II and III, and the dynasties after them.'],
    ['How did Egyptian civilization begin?', 'gradually, over many centuries of farming villages, crafts and trade', ['suddenly, brought by a lost civilization', 'all at once with the Great Pyramid', 'when Alexander arrived'], 'Archaeology traces a long local development, grave by grave, from villages to chiefdoms to kings.'],
    ['Most of what we know about the Predynastic Period comes from…', 'cemeteries and their grave goods', ['royal inscriptions', 'Greek historians', 'the Turin King List'], 'Thousands of excavated graves, with pottery and goods, are the main evidence, along with a few settlements.'],
    ['What method did Flinders Petrie devise to put Predynastic graves in order?', 'sequence dating, by the changing styles of pottery', ['radiocarbon dating', 'counting regnal years', 'reading the names of kings'], 'Petrie ordered graves by their pottery styles, an early form of seriation.'],
    ['A few late Naqada tombs are very large and rich; most are small and plain. This suggests…', 'a ranked society with a small, wealthy ruling group', ['everyone was equally rich', 'the large tombs belong to the Ptolemies', 'nobody lived in Egypt at the time'], 'Concentrated wealth in a few graves is a sign of leaders and ranks.', { lv: 2 }],
    ['Put these in order, earliest first.', 'Badarian → Naqada II → 1st Dynasty', ['Naqada II → Badarian → 1st Dynasty', '1st Dynasty → Badarian → Naqada II', 'Badarian → 1st Dynasty → Naqada II'], 'Badarian (c. 4400–4000 BC), Naqada II (c. 3500–3200 BC), then the 1st Dynasty (from c. 3000 BC).', { lv: 2 }],
    ['What happened to the northern cultures of the Delta during Naqada II and III?', 'Naqada-style pottery and burials replaced the northern styles', ['they conquered Upper Egypt', 'they stayed completely separate until the Romans', 'they disappeared before farming began'], 'Southern material culture spread north; whether by trade, migration or conquest is still discussed.', { lv: 3 }],
    ['Why do archaeologists reject the idea that a lost outside civilization founded Egypt?', 'the gradual local development can be traced in the remains', ['because no one has looked for it', 'because the pyramids are too small', 'because Manetho said so'], 'Village, pottery and burial evidence shows a continuous local growth.', { lv: 3 }]
  ], t: [
    { s: 'Egyptian civilization appeared suddenly, with no earlier stages.', v: false, why: 'It grew over many centuries of village farming and trade.' },
    { s: 'Farming villages existed along the Nile before the first kings.', v: true, why: 'Farming villages appeared by the 5th millennium BC, long before c. 3000 BC.' }
  ], s: [[1, mapQ('upper', ['naqada', 'hierakonpolis', 'abydos'], ['naqada', 'hierakonpolis', 'abydos', 'karnak', 'edfu', 'dendera', 'elephantine', 'kom-ombo'], DESC)]] };
  G('hist.naqada', function (R, ctx) { return run(R, ctx, D.naqada); });

  D['first-writing'] = { hint: 'Writing began as record-keeping.', f: [
    ['Where were some of the earliest known Egyptian inscriptions found?', 'in tomb U-j at Abydos', ['in the Great Pyramid', 'at Alexandria', 'in the Valley of the Kings'], 'Over a hundred small labels of bone and ivory came from tomb U-j at Abydos.'],
    ['About when were the labels of tomb U-j made?', 'c. 3200 BC, before the 1st Dynasty', ['in the New Kingdom', 'in the Ptolemaic Period', 'in Roman times'], 'They belong to late Naqada times, about c. 3200 BC.'],
    ['What were the U-j labels probably used for?', 'tagging goods, recording things like places of origin or quantities', ['prayers to Amun', 'letters to foreign kings', 'school exercises'], 'Small labels tied to goods fit early record-keeping.'],
    ['Did Egyptians simply borrow writing from Mesopotamia?', 'this is debated; writing appeared in both at about the same time', ['yes, this is certain', 'no, Mesopotamia borrowed it from Egypt, for certain', 'Egypt never had writing'], 'The two scripts look different and appear about the same time; many scholars now think they developed independently.'],
    ['What key step turns pictures into writing?', 'using signs for their sound, not just for what they show', ['drawing larger pictures', 'carving in stone instead of painting', 'using only one color'], 'When a sign stands for a sound, it can write words that are hard to draw, including names.'],
    ['Who led the excavation of tomb U-j?', 'Günter Dreyer', ['Howard Carter', 'Flinders Petrie', 'Champollion'], 'German archaeologists led by Günter Dreyer excavated it in the late 1980s.', { lv: 2 }],
    ['What were the U-j labels made of?', 'bone and ivory', ['papyrus', 'clay tablets', 'gold'], 'They were small carved plaques of bone and ivory.', { lv: 2 }],
    ['Why did the U-j finds reopen the question of where writing began?', 'they made Egyptian writing about as old as Mesopotamian writing', ['they proved writing began in Egypt', 'they were written in Greek', 'they showed writing began in Rome'], 'With Egyptian writing as early as Mesopotamian, simple borrowing became much less likely.', { lv: 3 }]
  ], t: [
    { s: 'It is certain that Egypt borrowed the idea of writing from Mesopotamia.', v: false, why: 'Writing appeared in both at about the same time; whether one influenced the other is debated.' },
    { s: 'Early Egyptian writing seems to have begun as a tool of administration.', v: true, why: 'The earliest labels record goods, places and quantities.' }
  ], s: [[1, periodMarkQ(['pre', 'ed'])]] };
  G('hist.first-writing', function (R, ctx) { return run(R, ctx, D['first-writing']); });

  D.unification = { hint: 'The palette is a ceremonial object, not a news photo.', f: [
    ['When did the Nile valley and the Delta first come under one king?', 'at the end of the Predynastic Period, around c. 3000 BC', ['at the start of the New Kingdom', 'in the Late Period, under the Saite kings', 'under the Ptolemies'], 'Unification came at the end of the Predynastic Period, around c. 3000 BC, just before the 1st Dynasty.'],
    ['What does the Narmer Palette show?', 'King Narmer wearing the White Crown on one side and the Red Crown on the other', ['Ramesses II at Kadesh', 'the building of the Great Pyramid', 'Cleopatra and Caesar'], 'The palette shows Narmer in the White Crown on one side and the Red Crown on the other, claiming rule over both lands.'],
    ['Where was the Narmer Palette found?', 'Hierakonpolis', ['Alexandria', 'Giza', 'Amarna'], 'It was found in a temple deposit at Hierakonpolis (Nekhen) in 1897–98.'],
    ['How do most historians now see unification?', 'as a long process of trade, alliance and war', ['as a single battle on one day', 'as the work of the Hyksos', 'as a Roman invention'], 'Southern influence spread over generations; Narmer stands near the end of the process.'],
    ['What is a serekh?', 'a palace façade in which an early king\'s Horus name was written', ['a crown', 'a kind of pyramid', 'a boat'], 'Narmer\'s name, a catfish and a chisel, is written in a serekh at the top of the palette.'],
    ['Why is the Narmer Palette not a news photo of a single battle?', 'it was a ceremonial gift to the gods showing ideal kingship', ['it was carved by the enemy', 'it shows no people at all', 'it was made in Roman times'], 'Its scenes show what a king should do; they make a statement of kingship.', { lv: 2 }],
    ['Who was Menes?', 'the first king in later Egyptian tradition, perhaps Narmer or Aha', ['a Greek historian', 'a Hyksos king', 'Cleopatra\'s son'], 'No contemporary monument clearly names Menes; many identify him with Narmer, others with Aha.', { lv: 2 }],
    ['What do archaeologists call the rulers just before Narmer?', '"Dynasty 0"', ['the 18th Dynasty', 'the Ptolemies', 'the Hyksos'], 'Rulers of "Dynasty 0", buried at Abydos, already controlled much of the country.', { lv: 3 }]
  ], t: [
    { s: 'The Narmer Palette is a news report of one particular battle.', v: false, why: 'It is a ceremonial object showing ideal kingship; unification was probably a long process.' },
    { s: 'It is certain that Menes and Narmer were the same person.', v: false, why: 'This is debated: many scholars think so, others identify Menes with Aha.' }
  ], s: [[1, mapQ('egypt', ['hierakonpolis', 'abydos', 'memphis'], BIG_SITES, DESC)]] };
  G('hist.unification', function (R, ctx) { return run(R, ctx, D.unification); });

  D['early-dynastic'] = { hint: 'Two dynasties of mud-brick tombs came before the first pyramid.', f: [
    ['From which city did the kings of the 1st and 2nd Dynasties rule?', 'Memphis', ['Alexandria', 'Amarna', 'Tanis'], 'Memphis sat where the valley meets the Delta, a good place to control both.'],
    ['Where were the kings of the 1st Dynasty buried?', 'at Abydos', ['in the Valley of the Kings', 'in the Great Pyramid', 'at Alexandria'], 'They were buried at Abydos, the old burial ground of the southern rulers.'],
    ['What came before the first pyramid?', 'two dynasties of mud-brick royal tombs', ['the Great Pyramid', 'the temples of Abu Simbel', 'nothing: the pyramids came first'], 'Dynasties 1 and 2 (c. 3000–2686 BC) built in mud brick; the Step Pyramid came with the 3rd Dynasty.'],
    ['What is a mastaba?', 'a flat-topped, bench-shaped tomb', ['a step pyramid', 'a royal crown', 'a temple gateway'], 'Mastaba is the Arabic word for a bench; big mud-brick mastabas at Saqqara held the court\'s officials.'],
    ['Which of these did the first dynasties develop?', 'writing for records, taxes and royal titles', ['coins', 'the Coptic alphabet', 'chariots'], 'Seals, labels, year names and the king\'s titles are the tools of the early state.'],
    ['What was special about King Peribsen of the 2nd Dynasty?', 'he put the god Seth instead of Horus above his name', ['he built the Great Pyramid', 'he was a Greek king', 'he wrote the Pyramid Texts'], 'Peribsen\'s serekh is topped by Seth, a rare change from the usual Horus.', { lv: 3 }],
    ['Why was Memphis a good capital?', 'it sat where the narrow valley opens into the Delta', ['it was on the Red Sea', 'it was the farthest point south', 'it was in an oasis'], 'From Memphis a king could reach both halves of the country and watch river traffic between them.', { lv: 2 }],
    ['What was the "following of Horus"?', 'a regular royal tour linked to counting the country\'s wealth', ['a funeral procession', 'a war against Nubia', 'a temple festival of the Ptolemies'], 'The Palermo Stone records this tour every two years, connected with assessing the land and herds.', { lv: 3 }]
  ], t: [
    { s: 'The first Egyptian kings were buried in pyramids.', v: false, why: 'The kings of Dynasties 1 and 2 had mud-brick tombs at Abydos; pyramids began in the 3rd Dynasty.' },
    { s: 'The Early Dynastic Period comes before the Old Kingdom.', v: true, why: 'Early Dynastic c. 3000–2686 BC, Old Kingdom c. 2686–2160 BC.' }
  ], s: [[2, periodQ(['ed', 'ok'])], [1, mapQ('memphis', ['saqqara', 'memphis', 'giza'], ['saqqara', 'memphis', 'giza', 'dahshur', 'abusir'], DESC)]] };
  G('hist.early-dynastic', function (R, ctx) { return run(R, ctx, D['early-dynastic']); });

  D.djoser = { hint: 'It grew in stages from an older kind of tomb.', f: [
    ['What was new about Djoser\'s Step Pyramid?', 'it was the first large building made entirely of stone', ['it was the first tomb ever built', 'it was the tallest building in Egypt for all time', 'it was built of mud brick'], 'Earlier royal tombs were mud brick; Djoser\'s monument is the first large all-stone building.'],
    ['Where is Djoser\'s Step Pyramid?', 'at Saqqara', ['at Giza', 'at Dahshur', 'at Thebes'], 'It stands at Saqqara, the cemetery overlooking Memphis.'],
    ['Which official did later Egyptians credit with the Step Pyramid?', 'Imhotep', ['Hemiunu', 'Senenmut', 'Weni'], 'A statue base names Imhotep among Djoser\'s high officials; later he was revered as a sage and healer.'],
    ['How did the Step Pyramid take its shape?', 'it grew from a flat mastaba through several changes of plan', ['it was planned as six steps from the start', 'it was a natural hill that was carved', 'it was built from the top down'], 'A mastaba, enlarged twice, then four steps, then six.'],
    ['How many steps does the Step Pyramid have?', 'six', ['three', 'ten', 'twelve'], 'It ended with six steps, about 62 m high.'],
    ['To which dynasty did Djoser belong?', 'the 3rd Dynasty', ['the 1st Dynasty', 'the 4th Dynasty', 'the 18th Dynasty'], 'Djoser opened the 3rd Dynasty, the start of the Old Kingdom.', { lv: 2 }],
    ['What was the sed festival, for which Djoser\'s complex has a court?', 'a royal jubilee renewing the king\'s power', ['the harvest season', 'a funeral for the Apis bull', 'a festival of the Ptolemies'], 'The sed festival renewed the king; the complex has a court with dummy shrines for it.', { lv: 2 }],
    ['How was Imhotep remembered much later, in the Late Period?', 'as a god of healing, linked by Greeks with Asclepius', ['as a foreign enemy', 'as the founder of Alexandria', 'he was forgotten entirely'], 'Later Egyptians worshipped Imhotep, and Greeks identified him with their healer Asclepius.', { lv: 3 }]
  ], t: [
    { s: 'The Step Pyramid was built as six steps from the very start.', v: false, why: 'It grew from a flat mastaba through several changes of plan.' },
    { s: 'Djoser\'s Step Pyramid is older than the Great Pyramid of Giza.', v: true, why: 'Djoser (3rd Dynasty) came before Khufu (4th Dynasty).' }
  ], s: [[2, pyramidQ], [1, builtQ(['djoser', 'khufu', 'sneferu'], OK_KINGS.concat(['ramesses2', 'amenemhat3']))]] };
  G('hist.djoser', function (R, ctx) { return run(R, ctx, D.djoser); });

  D['pyramid-age'] = { hint: 'Sneferu built three pyramids before his son built the Great Pyramid.', f: [
    ['Who built the first finished true (smooth-sided) pyramid?', 'Sneferu', ['Khufu', 'Djoser', 'Ramesses II'], 'Sneferu\'s Red Pyramid at Dahshur is the first finished true pyramid.'],
    ['Why does the Bent Pyramid change its angle partway up?', 'the builders lowered the angle, probably after cracks and settling appeared', ['it was built by two different countries', 'an earthquake bent it later', 'it was meant to look like a boat'], 'Begun at about 54°, it was finished at about 43° to reduce the load.'],
    ['Which king built the Great Pyramid at Giza?', 'Khufu', ['Sneferu', 'Djoser', 'Menkaure'], 'Khufu, Sneferu\'s son, built the Great Pyramid (c. 2589–2566 BC).'],
    ['Was the Great Pyramid the first pyramid?', 'no: Djoser\'s and three of Sneferu\'s came before it', ['yes, it was the first of all', 'no, it was the last pyramid ever built', 'no: the pyramids of Meroë were older'], 'The Step Pyramid came about a century earlier, and Sneferu built three before his son\'s.'],
    ['How tall was the Great Pyramid when new?', 'about 146.6 m', ['about 62 m', 'about 300 m', 'about 20 m'], 'Originally about 146.6 m, it was the tallest building in the world for almost 3,800 years.'],
    ['Where are Sneferu\'s Bent and Red Pyramids?', 'at Dahshur', ['at Giza', 'at Saqqara', 'at Thebes'], 'Both stand at Dahshur, south of Saqqara.'],
    ['Put these in order, earliest first: the Great Pyramid, the Bent Pyramid, the Step Pyramid.', 'Step Pyramid → Bent Pyramid → Great Pyramid', ['Great Pyramid → Bent Pyramid → Step Pyramid', 'Bent Pyramid → Step Pyramid → Great Pyramid', 'Step Pyramid → Great Pyramid → Bent Pyramid'], 'Djoser (3rd Dynasty), then Sneferu, then his son Khufu (4th Dynasty).', { lv: 2 }],
    ['Which kings built the other two pyramids at Giza?', 'Khafre and Menkaure', ['Sneferu and Djoser', 'Unas and Teti', 'Seti I and Ramesses II'], 'Khufu\'s successors Khafre and Menkaure built the second and third pyramids.', { lv: 2 }],
    ['From where was the granite for the King\'s Chamber brought?', 'Aswan, more than 800 km upriver', ['Sinai', 'the Delta', 'Byblos'], 'Granite came from the quarries at Aswan, at the First Cataract.', { lv: 3 }]
  ], t: [
    { s: 'The Red Pyramid was built before the Great Pyramid.', v: true, why: 'Sneferu built the Red Pyramid; his son Khufu built the Great Pyramid.' },
    { s: 'The Great Pyramid was the first pyramid ever built.', v: false, why: 'Djoser\'s step pyramid and Sneferu\'s three pyramids came before it.' }
  ], s: [[2, builtQ(['sneferu', 'khufu', 'khafre', 'menkaure', 'djoser'], OK_KINGS.concat(['amenemhat3', 'ramesses2']))], [2, pyramidQ], [1, dynQ(['djoser', 'sneferu', 'khufu', 'khafre', 'menkaure'])]] };
  G('hist.pyramid-age', function (R, ctx) { return run(R, ctx, D['pyramid-age']); });

  D['pyramid-state'] = { hint: 'Look at what the workers left behind: a town, tombs and records.', f: [
    ['What does the evidence from Giza show about the pyramid builders?', 'they were organized, fed Egyptian crews', ['they were huge gangs of foreign slaves', 'they came from a lost civilization', 'they were Roman engineers'], 'The workers\' town, bakeries, tombs and logbooks point to organized Egyptian labor.'],
    ['What was found in the workers\' town south of the Giza pyramids?', 'bakeries, breweries, storerooms and barracks', ['a royal palace of gold', 'Roman baths', 'a library of papyri'], 'Excavations led by Mark Lehner found where the workers were fed and housed.'],
    ['What is the Diary of Merer?', 'a logbook of an official whose crew shipped limestone to Giza under Khufu', ['a story about a shipwrecked sailor', 'a Greek history of Egypt', 'a list of kings'], 'Found in 2013 at Wadi al-Jarf, these are the oldest inscribed papyri known.'],
    ['How were most state workers paid?', 'in rations of bread, beer and grain', ['in gold coins', 'in silver coins', 'they were not paid'], 'Grain collected as tax was paid out as rations.'],
    ['Why could many farmers work on state projects during the inundation?', 'their fields were under water', ['they had no families', 'it was winter and too cold to farm', 'the king owned all of them as slaves'], 'With the fields flooded, farm work stopped, freeing labor for building.'],
    ['Who was at the head of the government under the king?', 'the vizier', ['the high priest of Amun', 'the satrap', 'the prefect'], 'The vizier ran the administration that planned and supplied projects like the pyramids.', { lv: 2 }],
    ['What do healed fractures in workers\' skeletons at Giza suggest?', 'injured workers received care', ['they were never injured', 'they were warriors', 'they lived in Roman times'], 'Set bones that healed show medical care for the crews.', { lv: 2 }],
    ['What is still debated about how the pyramids were built?', 'exactly how the blocks were raised: the design of the ramps', ['whether Egyptians built them', 'whether the stone came from Egypt', 'which century the Great Pyramid was built in, AD or BC'], 'Quarrying, cutting and transport are well understood; the ramp designs remain debated.', { lv: 2 }],
    ['How should a historian treat Herodotus\'s figure of 100,000 workers?', 'as a late story to test against the archaeology, which suggests far fewer', ['as an exact count from Khufu\'s records', 'as proof of slavery', 'as a Roman tax figure'], 'Herodotus wrote about two thousand years later; modern estimates are in the tens of thousands at most.', { lv: 3 }]
  ], t: [
    { s: 'The pyramids were built by huge gangs of slaves.', v: false, why: 'The evidence points to organized, fed Egyptian crews, some skilled and some called up for a season.' },
    { s: 'Work gangs at Giza gave themselves names like "Friends of Khufu".', v: true, why: 'Crew names are painted on blocks.' }
  ] };
  G('hist.pyramid-state', function (R, ctx) { return run(R, ctx, D['pyramid-state']); });

  D['sun-kings'] = { hint: 'The 5th Dynasty stressed the king\'s tie to Ra.', f: [
    ['Which god did the 5th Dynasty kings honor with sun temples?', 'Ra, the sun god', ['Amun of Thebes', 'Osiris', 'Seth'], 'Several 5th Dynasty kings built sun temples for Ra near Abusir.'],
    ['In whose pyramid were the first Pyramid Texts carved?', 'Unas, the last king of the 5th Dynasty', ['Khufu', 'Djoser', 'Sneferu'], 'Unas (c. 2375–2345 BC) had the first Pyramid Texts carved in his pyramid at Saqqara.'],
    ['Does the Great Pyramid have Pyramid Texts inside?', 'no; it has no carved inscriptions inside', ['yes, on every wall', 'yes, in the Grand Gallery', 'yes, but only in Greek'], 'The texts begin with Unas, about two centuries after Khufu.'],
    ['What are the Pyramid Texts?', 'spells to protect the dead king and help him join the gods', ['lists of taxes', 'love poems', 'records of battles'], 'They help the king rise to the sun god and the stars.'],
    ['What stood in the court of a sun temple?', 'a squat obelisk on a high base, with an altar', ['a statue of Amun', 'a pyramid with chambers', 'a sacred lake only'], 'The obelisk stood for the sun; offerings were made at the altar in front.'],
    ['How many 5th Dynasty sun temples have been found?', 'two', ['six', 'none', 'twenty'], 'Records name six, but only two (Userkaf\'s and Niuserre\'s) have been found.', { lv: 3 }],
    ['What title stressed the king\'s link to Ra?', '"son of Ra"', ['"Great House"', '"King\'s Son of Kush"', '"God\'s Wife of Amun"'], 'The title zꜣ-rꜥ, "son of Ra", became a regular part of the king\'s names.', { lv: 2 }],
    ['Compared with Giza, the 5th Dynasty pyramids were…', 'smaller and less solidly built, with richly decorated temples', ['much larger', 'made of mud brick only', 'built in Nubia'], 'Wealth went into temples and sun temples rather than giant pyramids.', { lv: 2 }]
  ], t: [
    { s: 'The Pyramid Texts were carved inside the Great Pyramid of Khufu.', v: false, why: 'The Great Pyramid has no inscriptions inside; the texts begin with Unas.' },
    { s: 'Some Pyramid Texts may be older than the reign of Unas.', v: true, why: 'Unas\'s pyramid is the first where they were written down, but some spells may be older.' }
  ], s: [[2, kingOrderQ(['djoser', 'khufu', 'unas', 'pepi2', 'mentuhotep2', 'senusret3'])], [1, wordQ(['zara', 'nesubit', 'hemef', 'pharaoh'])]] };
  G('hist.sun-kings', function (R, ctx) { return run(R, ctx, D['sun-kings']); });

  D['sixth-dynasty'] = { hint: 'Look at where the great tombs were built.', f: [
    ['What changed in the provinces under the 6th Dynasty?', 'nome governors grew richer and more independent', ['the provinces were abolished', 'all power moved to the king alone', 'Greek governors took over'], 'Offices became hereditary, and governors built large tombs at home.'],
    ['Who was Weni?', 'an official of three 6th Dynasty kings who described his career in his tomb', ['a king of the 4th Dynasty', 'a Hyksos ruler', 'a Roman prefect'], 'Weni\'s autobiography at Abydos tells of his rise, his army command and his quarry missions.'],
    ['Who was Harkhuf?', 'a governor of Elephantine who led trading expeditions into Nubia', ['the architect of the Great Pyramid', 'a priest of Amun', 'a Persian king'], 'Harkhuf led four expeditions south to a land called Yam.'],
    ['What did Harkhuf copy onto his tomb?', 'a letter from the young king Pepi II', ['the Book of the Dead', 'the treaty with the Hittites', 'the Rosetta decree'], 'The boy king was delighted that Harkhuf was bringing back a dancer.'],
    ['What does burial in the provinces, rather than near the king, suggest about high officials?', 'their power now rested in their own provinces', ['they were poor', 'they had been exiled', 'they were foreigners'], 'Where an official chose to be buried shows where his life and loyalties lay.', { lv: 2 }],
    ['What should a historian keep in mind when reading a tomb autobiography?', 'it presents a perfect servant of the king and rarely mentions failure', ['it is always a list of taxes', 'it was written by enemies', 'it is in Greek'], 'Autobiographies are valuable but have an agenda: to show a worthy life.', { lv: 2 }],
    ['Which king came to the throne as a child and is said to have reigned a very long time?', 'Pepi II', ['Khufu', 'Djoser', 'Unas'], 'Manetho says 94 years; many scholars think about 60 or a little more.', { lv: 2 }],
    ['What did Harkhuf bring back from Yam?', 'incense, ebony and ivory', ['cedar wood', 'tin and silver', 'horses and chariots'], 'Nubia and the lands beyond supplied incense, ebony, ivory and animal skins.', { lv: 3 }]
  ], t: [
    { s: 'Under the 6th Dynasty, all power stayed with the king.', v: false, why: 'Provincial governors built their own power bases, with hereditary offices and local wealth.' },
    { s: 'The exact length of Pepi II\'s reign is debated.', v: true, why: 'Manetho says 94 years; many scholars think it was shorter.' }
  ], s: [[1, mapQ('nile', ['elephantine', 'abydos', 'memphis'], ['elephantine', 'abydos', 'memphis', 'kerma', 'napata', 'meroe', 'buhen'], DESC)]] };
  G('hist.sixth-dynasty', function (R, ctx) { return run(R, ctx, D['sixth-dynasty']); });

  D['ok-end'] = { hint: 'Historians see several causes working together.', f: [
    ['How do most historians explain the end of the Old Kingdom?', 'several factors working together, with debate over their weight', ['a single cause that everyone agrees on', 'a foreign invasion by the Romans', 'a volcanic eruption that destroyed Egypt'], 'Weaker central government, long reigns and succession troubles, and perhaps low floods are all discussed.'],
    ['Which of these is one proposed factor in the end of the Old Kingdom?', 'low Nile floods and a drier climate', ['the arrival of Alexander', 'the invention of coins', 'the closing of the temples by Akhenaten'], 'A drier phase around c. 2200 BC is one factor historians discuss; its effect is debated.'],
    ['Why might tax exemptions for temples and royal cults have weakened the state?', 'they reduced the income of the central government', ['they made the king richer', 'they ended farming', 'they were paid in gold coins'], 'Decrees freeing temples from taxes and labor cut what the court could collect.'],
    ['What do historians disagree about most in the climate explanation?', 'how big its effect was in Egypt, and when', ['whether Egypt had a climate', 'whether the Nile existed', 'whether Egyptians farmed'], 'Signs of a drier phase exist, but their timing and impact in Egypt are disputed.'],
    ['Which dynasties ruled a shrinking realm from Memphis at the very end of the Old Kingdom?', 'the 7th and 8th', ['the 18th and 19th', 'the 1st and 2nd', 'the 25th and 26th'], 'Short-lived kings of the 7th and 8th Dynasties came before the First Intermediate Period.', { lv: 2 }],
    ['A governor named Ankhtifi boasted that he fed his people during a famine. How should historians use this?', 'with care: a self-praising tomb text has reasons to paint a dark picture', ['as exact proof that all Egypt starved', 'as a forgery', 'as a Roman record'], 'It is real evidence of hardship, written to glorify its author.', { lv: 2 }],
    ['What makes "The Old Kingdom fell because of a drought" a weak argument?', 'it names one cause without evidence of timing or other factors', ['droughts never happen in Egypt', 'the Old Kingdom never ended', 'climate cannot affect harvests'], 'A stronger argument weighs climate as one factor, with evidence and timing.', { lv: 3 }]
  ], t: [
    { s: 'Historians agree that a single drought ended the Old Kingdom.', v: false, why: 'Most see several factors working together and disagree about how much climate mattered.' },
    { s: 'Growing power of provincial governors is one proposed factor in the end of the Old Kingdom.', v: true, why: 'Hereditary nomarchs with local wealth weakened the center.' }
  ], s: [[1, periodQ(['ok', 'fip'])]] };
  G('hist.ok-end', function (R, ctx) { return run(R, ctx, D['ok-end']); });

  // ================================================================ First Intermediate and Middle Kingdom; Second Intermediate
  var MK_KINGS = ['mentuhotep2', 'amenemhat1', 'senusret1', 'senusret3', 'amenemhat3'];

  D.fip = { hint: 'Two royal houses, one in the north and one in the south.', f: [
    ['Which two cities were the seats of rival dynasties in the First Intermediate Period?', 'Herakleopolis in the north and Thebes in the south', ['Memphis and Alexandria', 'Tanis and Sais', 'Avaris and Kerma'], 'The 9th and 10th Dynasties ruled from Herakleopolis; the 11th from Thebes.'],
    ['Which dynasty ruled from Thebes during the First Intermediate Period?', 'the 11th', ['the 18th', 'the 4th', 'the 26th'], 'The 11th Dynasty, the Intef kings and then Mentuhotep II, ruled the south from Thebes.'],
    ['What happened to spells once reserved for kings in this period and the Middle Kingdom?', 'they were written in the coffins of officials and their families (the Coffin Texts)', ['they were forgotten', 'they were translated into Greek', 'they were carved only on obelisks'], 'Hope for a good afterlife spread to many more people.'],
    ['Why should we be careful with later texts that describe this time as total chaos?', 'they were written under the kings who ended it, who had reasons to paint it dark', ['they were written by the Hyksos', 'they are in Coptic', 'they describe a different country'], 'Archaeology shows many local towns doing well; the picture of disaster is partly propaganda.'],
    ['Who was Ankhtifi?', 'a southern governor who backed the north and fought the Thebans', ['a Hyksos king', 'a scribe of Deir el-Medina', 'a Ptolemaic queen'], 'His tomb tells of his deeds and of a famine in which he says he fed his people.', { lv: 2 }],
    ['Where did the borderlands between the two kingdoms lie?', 'around Abydos and Thinis in Upper Egypt', ['at the First Cataract', 'in the Faiyum', 'on the Mediterranean coast'], 'Fighting centered on the region around Abydos and Thinis.', { lv: 2 }],
    ['What did local workshops do without the court\'s control?', 'developed their own styles of art', ['stopped making art entirely', 'copied Roman art', 'made only coins'], 'Provincial art in this period shows local styles freed from the court\'s rules.', { lv: 3 }]
  ], t: [
    { s: 'The First Intermediate Period was a time of total chaos everywhere in Egypt.', v: false, why: 'There was war and hardship in places, but also local prosperity; the dark picture is partly later propaganda.' },
    { s: 'In the First Intermediate Period, no single king ruled the whole country.', v: true, why: 'Rival dynasties ruled from Herakleopolis and Thebes.' }
  ], s: [[2, periodQ(['ok', 'fip', 'mk'])]] };
  G('hist.fip', function (R, ctx) { return run(R, ctx, D.fip); });

  D.mentuhotep = { hint: 'A new period does not need a new dynasty.', f: [
    ['Who reunited Egypt at the start of the Middle Kingdom?', 'Mentuhotep II of Thebes', ['Amenemhat I', 'Ahmose', 'Narmer'], 'Mentuhotep II of the 11th Dynasty defeated the Herakleopolitan kings.'],
    ['To which dynasty did Mentuhotep II belong?', 'the 11th', ['the 12th', 'the 18th', 'the 10th'], 'He was already a king of the 11th Dynasty; the period changes, not the dynasty.'],
    ['Why does the 11th Dynasty appear in two periods?', 'it began as a southern house and later ruled all Egypt', ['it ruled twice, a thousand years apart', 'it was two different families', 'Manetho made a mistake'], 'Its early kings belong to the First Intermediate Period; Mentuhotep II\'s reunited reign begins the Middle Kingdom.'],
    ['Where did Mentuhotep II build his temple and tomb?', 'at Deir el-Bahari, on the west bank at Thebes', ['at Giza', 'at Amarna', 'at Tanis'], 'His terraced temple stands in a bay of the cliffs; Hatshepsut later built beside it.'],
    ['Mentuhotep II\'s later Horus name Sematawy means…', '"he who unites the Two Lands"', ['"son of Ra"', '"the Great House"', '"beloved of Amun"'], 'The name suggests the reunion came partway through his reign.', { lv: 2 }],
    ['Which later ruler built a terraced temple right beside Mentuhotep II\'s?', 'Hatshepsut', ['Khufu', 'Cleopatra VII', 'Narmer'], 'About five centuries later, Hatshepsut\'s Djeser-djeseru rose next to it.', { lv: 2 }]
  ], t: [
    { s: 'The Middle Kingdom began with a new dynasty.', v: false, why: 'It began with Mentuhotep II, already a king of the 11th Dynasty.' },
    { s: 'Mentuhotep II came from Thebes.', v: true, why: 'He belonged to the Theban 11th Dynasty.' }
  ], s: [[1, periodQ(['fip', 'mk'])], [1, builtQ(['mentuhotep2', 'senusret1', 'amenemhat3'], ['khufu', 'ramesses2', 'amenhotep3', 'djoser'])], [1, mapQ('thebes', ['deir-el-bahari', 'karnak', 'luxor'], ['deir-el-bahari', 'karnak', 'luxor', 'medinet-habu', 'kings', 'ramesseum'], DESC)]] };
  G('hist.mentuhotep', function (R, ctx) { return run(R, ctx, D.mentuhotep); });

  D['twelfth-dynasty'] = { hint: 'Number the repeated names and tie each to one deed.', f: [
    ['Who founded the 12th Dynasty?', 'Amenemhat I', ['Mentuhotep II', 'Senusret III', 'Ahmose'], 'Amenemhat I, probably the former vizier of the last 11th Dynasty king, founded the 12th Dynasty.'],
    ['What was Itjtawy?', 'the new capital of the 12th Dynasty, near el-Lisht', ['a temple at Karnak', 'a fort in Nubia', 'a pyramid at Giza'], 'Itjtawy, "the one who seizes the Two Lands", lay between Memphis and the Faiyum.'],
    ['Which two royal names repeat through the 12th Dynasty?', 'Amenemhat and Senusret', ['Ramesses and Seti', 'Thutmose and Amenhotep', 'Ptolemy and Cleopatra'], 'Its kings were named Amenemhat and Senusret (Ammenemes and Sesostris to the Greeks).'],
    ['About how long did the 12th Dynasty rule?', 'about two centuries', ['about ten years', 'about a thousand years', 'about fifty years'], 'It lasted c. 1985–1773 BC, one of the most stable stretches in Egyptian history.'],
    ['How did Amenemhat I die, according to the Teaching of Amenemhat and the Tale of Sinuhe?', 'in a palace conspiracy', ['in battle at Kadesh', 'of old age after 90 years', 'in a flood'], 'Both texts tell of the plot against him.'],
    ['Which 12th Dynasty king is linked with the White Chapel at Karnak?', 'Senusret I', ['Senusret III', 'Amenemhat III', 'Amenemhat I'], 'Senusret I built the White Chapel and the obelisk at Heliopolis.', { lv: 2 }],
    ['Which 12th Dynasty king is linked with the Faiyum and the pyramid at Hawara?', 'Amenemhat III', ['Senusret I', 'Mentuhotep II', 'Amenemhat I'], 'Amenemhat III worked in the Faiyum and built his pyramid at Hawara.', { lv: 2 }],
    ['Who ruled at the very end of the 12th Dynasty?', 'Sobekneferu, a woman who ruled as king', ['Hatshepsut', 'Cleopatra VII', 'Nefertiti'], 'Sobekneferu was a female king at the end of the dynasty, before Hatshepsut.', { lv: 3 }],
    ['Why did some 12th Dynasty kings make their sons co-rulers?', 'so that the heir already held power when the king died', ['because the law required two kings', 'to share the work of building pyramids', 'because the sons were older'], 'Co-regencies helped secure the succession, though how long some lasted is debated.', { lv: 3 }]
  ], t: [
    { s: 'Senusret I and Senusret III are the same king.', v: false, why: 'They are different kings, about a century apart: Senusret I (White Chapel) and Senusret III (the Nubian forts).' },
    { s: 'The 12th Dynasty built pyramids again.', v: true, why: 'Its kings built pyramids at el-Lisht, Dahshur, Illahun and Hawara.' }
  ], s: [[2, kingOrderQ(['mentuhotep2', 'amenemhat1', 'senusret1', 'senusret3', 'amenemhat3', 'khufu', 'ahmose1'])], [1, builtQ(['senusret1', 'senusret3', 'amenemhat3'], MK_KINGS.concat(['khufu', 'djoser']))], [1, dynQ(['amenemhat1', 'senusret1', 'senusret3', 'amenemhat3', 'mentuhotep2'])]] };
  G('hist.twelfth-dynasty', function (R, ctx) { return run(R, ctx, D['twelfth-dynasty']); });

  D.senusret3 = { hint: 'In the Middle Kingdom the border moved south.', f: [
    ['Where did Senusret III build a chain of forts?', 'at the Second Cataract', ['at the First Cataract', 'in the Delta', 'in the Levant'], 'Forts such as Buhen, Mirgissa and Semna guarded the Second Cataract.'],
    ['Where was Egypt\'s southern border under Senusret III?', 'at Semna, by the Second Cataract', ['at Aswan, as always', 'at Memphis', 'at Meroë'], 'He fixed the border at Semna with inscribed stelae.'],
    ['What did Senusret III\'s Semna stela forbid?', 'Nubians passing north, except to trade or on official business', ['Egyptians crossing the Delta', 'building temples', 'the worship of Amun'], 'The stela set a controlled border: trade could pass, but not raiders or migrants.'],
    ['Why was the Second Cataract a good place for forts?', 'boats must slow down and be hauled through, so a few forts could control the river', ['it was the sea coast', 'it had the best farmland', 'it was the capital'], 'A natural choke point lets a few strongholds control traffic and trade.'],
    ['Which kingdom lay south of the Second Cataract forts?', 'Kush, centered at Kerma', ['Mitanni', 'Persia', 'Byblos'], 'The forts watched the powerful kingdom of Kush.'],
    ['Where are most of the Second Cataract forts today?', 'under Lake Nasser', ['in the British Museum', 'in the Delta', 'in Greece'], 'The lake behind the Aswan High Dam covered them in the 1960s.', { lv: 2 }],
    ['How do Senusret III\'s statues differ from earlier royal statues?', 'they show a careworn, heavy-lidded face', ['they show him as a falcon', 'they are all life-size gold', 'they show him as a child'], 'His statues have an older, serious face, unlike the calm youthful faces of earlier kings.', { lv: 2 }],
    ['What happened to the great tombs of provincial governors around his reign?', 'they stopped being built, as the court grew stronger', ['they became larger than ever', 'they moved to Nubia', 'they were built of gold'], 'Many historians think he curbed the governors\' power; others see a more gradual change.', { lv: 3 }]
  ], t: [
    { s: 'Egypt\'s southern border was always at Aswan.', v: false, why: 'In the Middle Kingdom Egypt pushed south to the Second Cataract, and in the New Kingdom farther still.' },
    { s: 'Some of the Second Cataract forts were begun before Senusret III, under Senusret I.', v: true, why: 'Senusret III added to an existing system and fixed the frontier.' }
  ], s: [[2, mapQ('nubia', ['semna', 'buhen', 'kerma', 'elephantine', 'abu-simbel'], ['semna', 'buhen', 'kerma', 'elephantine', 'abu-simbel', 'napata', 'meroe', 'nuri'], DESC)]] };
  G('hist.senusret3', function (R, ctx) { return run(R, ctx, D.senusret3); });

  D['mk-culture'] = { hint: 'Think of stories and advice, not only prayers.', f: [
    ['Which work is a Middle Kingdom story about an official who flees Egypt and returns in old age?', 'the Tale of Sinuhe', ['the Book of the Dead', 'the Amarna letters', 'the Rosetta Stone'], 'Sinuhe flees when Amenemhat I is killed and comes home to be buried in Egypt.'],
    ['What is a "teaching" (wisdom text)?', 'advice on how to live, often from a father to a son', ['a list of kings', 'a temple ritual', 'a tax record'], 'The Teaching of Ptahhotep gives an old vizier\'s advice to his son.'],
    ['In what language were the Middle Kingdom classics written?', 'Middle Egyptian', ['Coptic', 'Greek', 'Akkadian'], 'Middle Egyptian became the classical language, studied and copied for centuries.'],
    ['What is the Eloquent Peasant about?', 'a farmer robbed on the road who pleads for justice in beautiful speeches', ['a king\'s battles in Syria', 'a shipwreck on a magic island', 'the building of a pyramid'], 'The peasant\'s nine speeches were admired as fine language.'],
    ['What is the Teaching of Khety about?', 'a father praising the scribe\'s life over every other trade', ['a war against the Hyksos', 'a hymn to the Aten', 'the rules of a monastery'], 'It mocks other jobs to persuade a boy to study.'],
    ['Many Middle Kingdom works survive in New Kingdom copies. What does that show?', 'they were classics, copied and studied in scribal schools', ['they were forgotten until modern times', 'they were written in the New Kingdom', 'they were translated from Greek'], 'People do not copy texts for centuries unless they value them.', { lv: 2 }],
    ['Which story features a sailor cast away on an island with a giant serpent?', 'the Shipwrecked Sailor', ['the Tale of Sinuhe', 'the Eloquent Peasant', 'the Report of Wenamun'], 'It is one of the Middle Kingdom\'s tales.', { lv: 2 }],
    ['How long did Middle Egyptian remain in use for formal inscriptions?', 'until the end of hieroglyphic writing, long after people stopped speaking it', ['only during the 12th Dynasty', 'only until the Hyksos', 'it was never used for inscriptions'], 'It was the classical language of monuments for the rest of Egyptian history.', { lv: 3 }]
  ], t: [
    { s: 'Egyptian writing was only religious or royal.', v: false, why: 'Middle Kingdom scribes also wrote stories, poems, letters and advice.' },
    { s: 'Pieces of the Tale of Sinuhe were copied by New Kingdom scribes.', v: true, why: 'Copies on papyri and ostraca show it was a classic studied in school.' }
  ] };
  G('hist.mk-culture', function (R, ctx) { return run(R, ctx, D['mk-culture']); });

  D.hyksos = { hint: 'The Hyksos ruled from a city in the eastern Delta.', f: [
    ['Where was the Hyksos capital?', 'Avaris, in the eastern Delta', ['Thebes', 'Alexandria', 'Memphis'], 'Avaris (Tell el-Dabʿa) lay on the road to the Levant.'],
    ['What does "Hyksos" come from?', 'Egyptian ḥqꜣw ḫꜣswt, "rulers of foreign lands"', ['a Greek word for horsemen', 'a Hittite king\'s name', 'the name of a god'], 'Greek writers turned the Egyptian phrase into "Hyksos".'],
    ['As which dynasty did the Hyksos rule?', 'the 15th Dynasty', ['the 18th Dynasty', 'the 12th Dynasty', 'the 26th Dynasty'], 'The Hyksos kings were the 15th Dynasty (c. 1650–1550 BC).'],
    ['What does archaeology at Avaris show about the people there?', 'people with Levantine customs lived there for generations before Hyksos kings ruled', ['a sudden invasion by a horde in a single year', 'no foreigners ever lived there', 'it was a Roman fort'], 'Houses, pottery and burials show a long presence from the late Middle Kingdom on.'],
    ['How did the Hyksos come to power?', 'historians debate it: a gradual rise, perhaps with some fighting, is a common view', ['it is certain they invaded suddenly with a vast army', 'they were invited by Alexander', 'they were elected'], 'Manetho (via Josephus) describes an invasion; many scholars now think of a gradual takeover. The exact process is debated.'],
    ['The Rhind Mathematical Papyrus was copied in Year 33 of the Hyksos king Apepi. What does that suggest?', 'Egyptian scribal culture continued under Hyksos rule', ['the Hyksos destroyed all Egyptian learning', 'the papyrus is Greek', 'Apepi was a Theban king'], 'Egyptian scribes worked under the Hyksos and dated their work by them.', { lv: 2 }],
    ['Who has excavated at Tell el-Dabʿa (Avaris) since 1966?', 'Manfred Bietak', ['Howard Carter', 'Mark Lehner', 'Pierre Montet'], 'Bietak\'s excavations revealed the Levantine town beneath the Hyksos capital.', { lv: 3 }],
    ['Which new things came into Egypt around this period?', 'horses and chariots', ['iron coins', 'the Coptic alphabet', 'papyrus'], 'Horses and chariots arrived around the Second Intermediate Period.', { lv: 2 }]
  ], t: [
    { s: 'The Hyksos took over Egyptian royal titles and used Egyptian writing.', v: true, why: 'They ruled as kings in the Egyptian style; Egyptian scribes worked for them.' },
    { s: 'Historians agree that the Hyksos arrived in one sudden invasion.', v: false, why: 'This is debated; archaeology shows a long presence in the Delta before Hyksos kings took power.' }
  ], s: [[2, mapQ('delta', ['avaris', 'memphis', 'tanis', 'sais', 'bubastis'], ['avaris', 'memphis', 'tanis', 'sais', 'bubastis', 'heliopolis', 'buto', 'alexandria', 'naukratis'], DESC)], [1, periodQ(['mk', 'sip', 'nk'])]] };
  G('hist.hyksos', function (R, ctx) { return run(R, ctx, D.hyksos); });

  D.kerma = { hint: 'Kush had its own kings, art and capital.', f: [
    ['Where was the capital of the kingdom of Kush in the Middle Kingdom and Second Intermediate Period?', 'Kerma, near the Third Cataract', ['Napata', 'Meroë', 'Avaris'], 'Kerma was the center of the first kingdom of Kush.'],
    ['What is the Western Deffufa?', 'a huge mud-brick temple at Kerma', ['a pyramid at Giza', 'a fort at Semna', 'a palace at Amarna'], 'It still stands about 18 m high.'],
    ['With whom did Kush ally against Thebes?', 'the Hyksos', ['the Hittites', 'the Romans', 'the Persians'], 'Kamose intercepted a letter from the Hyksos king Apepi asking the ruler of Kush to attack Thebes.'],
    ['How should we describe Kerma?', 'a powerful kingdom with its own culture', ['an Egyptian colony with no culture of its own', 'a Greek trading town', 'an empty desert'], 'Kerma had kings, cities, great royal tombs and fine crafts of its own.'],
    ['What happened to the Egyptian forts in Lower Nubia during the Second Intermediate Period?', 'Kerma took them over', ['they were moved to the Delta', 'they were rebuilt by the Romans', 'they became temples of the Aten'], 'As Egypt divided, Kush pushed north and held the forts.'],
    ['How were the kings of Kerma buried?', 'under great round burial mounds', ['in pyramids at Giza', 'in the Valley of the Kings', 'in Roman catacombs'], 'Royal tombs lay under mounds, some about 90 m across.', { lv: 2 }],
    ['Which Kerma craft is famous for its quality?', 'thin, polished black-topped beakers', ['gold coins', 'glass windows', 'iron swords'], 'Kerma potters made remarkably thin, polished vessels.', { lv: 2 }],
    ['What did the Hyksos king want from his letter to Kush?', 'an attack on Thebes from the south while the Hyksos held the north', ['a peace treaty with Thebes', 'gold for a pyramid', 'help against the Hittites'], 'Thebes was caught between two allies.', { lv: 3 }],
    ['Which Egyptian king campaigned far into Kush early in the New Kingdom and broke Kerma\'s power?', 'Thutmose I', ['Ramesses III', 'Khufu', 'Ptolemy I'], 'Thutmose I campaigned past the Fourth Cataract.', { lv: 3 }]
  ], t: [
    { s: 'Nubia was always just a colony of Egypt.', v: false, why: 'Kerma was a powerful kingdom, strong enough at times to threaten Egypt.' },
    { s: 'Egyptian texts that call Kush "wretched" tell us about Egyptian propaganda.', v: true, why: 'The phrase is a stock insult for enemies, not a fair description.' }
  ], s: [[2, mapQ('nubia', ['kerma', 'semna', 'buhen', 'napata'], ['kerma', 'semna', 'buhen', 'napata', 'elephantine', 'abu-simbel', 'meroe', 'nuri'], DESC)]] };
  G('hist.kerma', function (R, ctx) { return run(R, ctx, D.kerma); });

  D.liberation = { hint: 'Count the kings who fought.', f: [
    ['Which king took Avaris and drove out the Hyksos?', 'Ahmose', ['Kamose', 'Seqenenre Tao', 'Thutmose III'], 'Ahmose took Avaris and then besieged Sharuhen in southern Canaan.'],
    ['Which Theban kings fought the Hyksos before Ahmose?', 'Seqenenre Tao and Kamose', ['Khufu and Khafre', 'Ramesses II and Seti I', 'Piye and Taharqo'], 'Seqenenre Tao died, probably in battle; Kamose campaigned north; Ahmose finished the war.'],
    ['How long did the Theban war against the Hyksos take?', 'years, under at least three kings', ['one afternoon', 'one battle in one year', 'three hundred years'], 'Three reigns of fighting means a long war.'],
    ['What does Seqenenre Tao\'s mummy show?', 'severe head wounds, probably from battle', ['that he lived to 100', 'that he was a Hyksos king', 'nothing; it was never found'], 'His wounds suggest he died fighting.'],
    ['Which dynasty began with Ahmose?', 'the 18th Dynasty', ['the 17th Dynasty', 'the 12th Dynasty', 'the 19th Dynasty'], 'Ahmose\'s reign starts the 18th Dynasty and the New Kingdom (c. 1550 BC).'],
    ['Who was Ahmose son of Ebana?', 'a soldier from Elkab whose tomb describes the war', ['the king who took Avaris', 'a Hyksos ruler', 'a Greek historian'], 'He served in the navy and lists his battles at Avaris and Sharuhen.', { lv: 2 }],
    ['Which queen does a stela of King Ahmose praise for caring for the army?', 'Ahhotep, his mother', ['Hatshepsut', 'Nefertiti', 'Cleopatra'], 'The stela honors Ahhotep for rallying Upper Egypt.', { lv: 2 }],
    ['After taking Avaris, where did Ahmose pursue the Hyksos?', 'to Sharuhen in southern Canaan', ['to Kerma in Nubia', 'to Rome', 'to Babylon'], 'He besieged Sharuhen, as Ahmose son of Ebana records.', { lv: 3 }]
  ], t: [
    { s: 'The war against the Hyksos was won in a single quick battle.', v: false, why: 'It took at least three Theban kings and long sieges.' },
    { s: 'The expulsion of the Hyksos marks the start of the New Kingdom.', v: true, why: 'Ahmose\'s reign, c. 1550 BC, begins the New Kingdom.' }
  ], s: [[1, periodQ(['sip', 'nk'])]] };
  G('hist.liberation', function (R, ctx) { return run(R, ctx, D.liberation); });

  // ================================================================ The New Kingdom
  var NK_KINGS = ['ahmose1', 'thutmose1', 'hatshepsut', 'thutmose3', 'amenhotep3', 'akhenaten', 'tutankhamun', 'horemheb', 'seti1', 'ramesses2', 'merneptah', 'ramesses3'];
  var NK_SITES = ['karnak', 'luxor', 'kings', 'deir-el-bahari', 'ramesseum', 'medinet-habu', 'deir-el-medina', 'queens'];

  D['nk-empire'] = { hint: 'The empire was built early in the 18th Dynasty.', f: [
    ['Who founded the 18th Dynasty?', 'Ahmose', ['Ramesses II', 'Thutmose III', 'Narmer'], 'Ahmose drove out the Hyksos and founded the 18th Dynasty and the New Kingdom.'],
    ['Which kings built most of Egypt\'s New Kingdom empire?', 'the early 18th Dynasty kings, especially Thutmose I and Thutmose III', ['Ramesses II alone', 'the Ptolemies', 'the kings of the 25th Dynasty'], 'Thutmose I reached the Euphrates; Thutmose III fought campaign after campaign.'],
    ['How was Nubia governed in the New Kingdom?', 'directly, by a viceroy called the "King\'s Son of Kush"', ['by the Hyksos', 'not at all: Egypt left it alone', 'by the Hittites'], 'Egypt ruled Nubia directly for its gold, ivory and soldiers.'],
    ['How were the city-states of Canaan and Syria ruled?', 'by local kings as vassals, with some Egyptian garrisons and officials', ['as Egyptian nomes with governors from Thebes', 'by Roman prefects', 'they were never under Egypt'], 'Vassal kings swore loyalty and sent tribute.'],
    ['Why did Egypt want to hold the Levant?', 'to keep enemies far from the Delta and control rich trade routes', ['to find more farmland than the Nile valley', 'to escape the flood', 'to build pyramids there'], 'The Hyksos had shown that threats could come from the northeast.'],
    ['Which king was probably the first buried in the Valley of the Kings?', 'Thutmose I', ['Khufu', 'Ramesses III', 'Ahmose'], 'Thutmose I is usually taken as the first king with a tomb there.', { lv: 2 }],
    ['Which god\'s temple at Thebes grew enormously from the wealth of victory?', 'Amun\'s, at Karnak', ['Ptah\'s, at Memphis', 'the Aten\'s, at Amarna', 'Sobek\'s, in the Faiyum'], 'Booty and tribute flowed to Amun of Thebes.', { lv: 2 }],
    ['Why were sons of vassal kings raised at the Egyptian court?', 'to make them loyal before they returned home to rule', ['to train them as pyramid builders', 'to make them priests of the Aten', 'as a punishment for their fathers'], 'Princes raised in Egypt went home as loyal vassals, and served as hostages meanwhile.', { lv: 3 }]
  ], t: [
    { s: 'Ramesses II built Egypt\'s empire.', v: false, why: 'The empire was built mostly by the early 18th Dynasty kings, about two centuries before him.' },
    { s: 'Thutmose I campaigned as far as the Euphrates.', v: true, why: 'He marched to the Euphrates in the north and past the Fourth Cataract in the south.' }
  ], s: [[2, kingOrderQ(['ahmose1', 'thutmose1', 'thutmose3', 'amenhotep3', 'ramesses2', 'ramesses3', 'senusret3'])], [1, mapQ('all', ['megiddo', 'kadesh', 'napata', 'karnak'], ['megiddo', 'kadesh', 'napata', 'karnak', 'kerma', 'memphis', 'byblos', 'abu-simbel', 'meroe', 'siwa'], DESC)]] };
  G('hist.nk-empire', function (R, ctx) { return run(R, ctx, D['nk-empire']); });

  D.hatshepsut = { hint: 'She was regent first, then king.', f: [
    ['How did Hatshepsut first hold power?', 'as regent for the young Thutmose III', ['as a Hyksos queen', 'as the wife of Ramesses II', 'as governor of Nubia'], 'She was regent for her stepson and nephew, then took the titles of king.'],
    ['What did Hatshepsut do that was unprecedented in scale?', 'she ruled as king, with full royal titles', ['she founded Alexandria', 'she invented hieroglyphs', 'she built the Great Pyramid'], 'A few women had ruled before, but none on her scale.'],
    ['Where is Hatshepsut\'s great terraced temple?', 'Deir el-Bahari, at Thebes', ['Giza', 'Abu Simbel', 'Alexandria'], 'Djeser-djeseru rises in three terraces against the cliffs.'],
    ['Which faraway land did Hatshepsut\'s famous expedition reach?', 'Punt', ['Rome', 'Babylon', 'Crete'], 'Reliefs at Deir el-Bahari show ships bringing incense trees from Punt.'],
    ['When were most of Hatshepsut\'s images removed from her monuments?', 'late in Thutmose III\'s reign, about twenty years after her death', ['the day she died', 'under the Ptolemies', 'never; none were removed'], 'The late timing suggests a political reason, such as the succession, rather than anger.'],
    ['How was Hatshepsut shown on many monuments?', 'with the king\'s kilt, crown and false beard', ['as a falcon', 'only as a queen', 'as a Greek goddess'], 'She was shown in the regalia of kingship.', { lv: 2 }],
    ['Which god did Hatshepsut claim as her true father?', 'Amun', ['Seth', 'Aten', 'Sobek'], 'Reliefs at her temple tell the story of her divine birth from Amun.', { lv: 2 }],
    ['Where was Punt?', 'somewhere on the African coast of the Red Sea; its exact location is debated', ['certainly in India', 'in the Delta', 'in Greece'], 'Scholars agree on the general region but debate the exact location.', { lv: 3 }],
    ['What is a common explanation for the erasure of Hatshepsut\'s images?', 'removing a female king from the record and securing the succession for Thutmose III\'s son', ['Thutmose\'s personal revenge right after her death', 'an earthquake', 'Roman vandals'], 'Because it came late, most historians now favor a political motive; the reasons are still debated.', { lv: 3 }]
  ], t: [
    { s: 'Hatshepsut\'s images were destroyed right after her death, in anger.', v: false, why: 'Most were removed late in Thutmose III\'s reign, about two decades after her death.' },
    { s: 'Thutmose III remained king throughout Hatshepsut\'s reign.', v: true, why: 'She ruled as king beside him; his years were counted from his accession.' }
  ], s: [[1, mapQ('thebes', ['deir-el-bahari', 'karnak', 'kings'], NK_SITES, DESC)], [1, builtQ(['hatshepsut', 'thutmose3', 'amenhotep3', 'ramesses2'], NK_KINGS.concat(['mentuhotep2']))]] };
  G('hist.hatshepsut', function (R, ctx) { return run(R, ctx, D.hatshepsut); });

  D.thutmose3 = { hint: 'Megiddo early, Kadesh two centuries later.', f: [
    ['Which king won the battle of Megiddo?', 'Thutmose III', ['Ramesses II', 'Ahmose', 'Ramesses III'], 'Megiddo was Thutmose III\'s first campaign, in his Year 23.'],
    ['Whom did Thutmose III fight at Megiddo?', 'a coalition of Canaanite and Syrian rulers led by the king of Kadesh', ['the Hittite king Muwatalli II', 'the Sea Peoples', 'the Persians'], 'The coalition gathered at Megiddo under the king of Kadesh.'],
    ['Which route did Thutmose III choose to reach Megiddo?', 'the narrow Aruna pass, straight through, against his officers\' advice', ['the long road around the north', 'by sea to Byblos', 'through the Faiyum'], 'The enemy, expecting him on another road, was caught off guard.'],
    ['Where is the account of his campaigns carved?', 'in his Annals at Karnak', ['in the Great Pyramid', 'on the Rosetta Stone', 'at Abu Simbel'], 'The Annals, on walls around the sanctuary, record campaigns and tribute year by year.'],
    ['How did the battle of Megiddo end?', 'the coalition fled into the city, which surrendered after a long siege', ['in a draw', 'in an Egyptian defeat', 'with a peace treaty between equals'], 'Megiddo fell after a siege of several months.'],
    ['Which battle belongs to Ramesses II rather than Thutmose III?', 'Kadesh', ['Megiddo', 'the Aruna pass', 'the crossing of the Euphrates'], 'Kadesh (c. 1274 BC) was Ramesses II\'s battle with the Hittites.', { lv: 2 }],
    ['Why was Megiddo so important?', 'it guarded the main road from Egypt to Syria', ['it was the Hittite capital', 'it was a port on the Red Sea', 'it had the largest gold mines'], 'Whoever held Megiddo controlled traffic between Egypt and the north.', { lv: 2 }],
    ['How did Thutmose III\'s army cross the Euphrates?', 'with boats carried overland', ['over a stone bridge', 'by swimming', 'it never reached the Euphrates'], 'In about his Year 33 boats were hauled overland to cross the river.', { lv: 3 }]
  ], t: [
    { s: 'Thutmose III fought at Kadesh against the Hittites.', v: false, why: 'Kadesh was Ramesses II\'s battle; Thutmose III\'s great victory was Megiddo.' },
    { s: 'Thutmose III led many campaigns into the Levant.', v: true, why: 'He campaigned almost yearly for two decades.' }
  ], s: [[2, mapQ('levant', ['megiddo', 'kadesh', 'byblos'], ['megiddo', 'kadesh', 'byblos', 'avaris', 'serabit'], DESC)], [1, kingOrderQ(['thutmose1', 'thutmose3', 'amenhotep3', 'ramesses2', 'ramesses3', 'ahmose1'])]] };
  G('hist.thutmose3', function (R, ctx) { return run(R, ctx, D.thutmose3); });

  D.amenhotep3 = { hint: 'The letters are on clay, in wedge-shaped script.', f: [
    ['In what script and language are the Amarna letters written?', 'Akkadian cuneiform', ['Egyptian hieroglyphs', 'Greek', 'Coptic'], 'They are clay tablets in cuneiform, mostly in Akkadian, the diplomatic language of the day.'],
    ['What are the Amarna letters?', 'diplomatic letters between Egypt and other kingdoms and vassals', ['tomb spells', 'a king list', 'tax records of Deir el-Medina'], 'They come from the archive at Akhetaten (Amarna).'],
    ['How did great kings address each other in the letters?', 'as "brother"', ['as "slave"', 'as "son of Ra"', 'by number only'], 'Great kings treated each other as a family of equals.'],
    ['What did foreign kings ask Egypt for again and again?', 'gold', ['grain only', 'chariots', 'papyrus'], 'Egypt\'s gold was its strongest card in diplomacy.'],
    ['What kind of reign did Amenhotep III have?', 'a long, rich and mostly peaceful one', ['a short reign full of defeats', 'a reign as a Hyksos king', 'a reign under Roman rule'], 'His nearly forty years saw vast building and splendid festivals.'],
    ['Which famous statues remain from Amenhotep III\'s memorial temple?', 'the Colossi of Memnon', ['the Great Sphinx', 'the colossi of Abu Simbel', 'the Narmer Palette'], 'Two colossal seated statues still stand on the west bank at Thebes.', { lv: 2 }],
    ['Which queen was Amenhotep III\'s chief wife?', 'Tiye', ['Nefertari', 'Hatshepsut', 'Cleopatra'], 'His commemorative scarabs announce his marriage to Tiye.', { lv: 2 }],
    ['Which of these did NOT write to Egypt in the Amarna letters?', 'the emperor of Rome', ['the king of Babylon', 'the king of Mitanni', 'rulers of Canaanite towns'], 'Rome did not yet exist as a power; the letters come from Babylon, Mitanni, Assyria, Hatti and vassals.', { lv: 2 }],
    ['When were the Amarna letters found?', 'in 1887, by a local woman digging at Amarna', ['in 1922, in Tutankhamun\'s tomb', 'in 1799, with the Rosetta Stone', 'in AD 641'], 'About 380 tablets are now known.', { lv: 3 }]
  ], t: [
    { s: 'The Amarna letters were written in Egyptian hieroglyphs.', v: false, why: 'They are clay tablets in Akkadian cuneiform.' },
    { s: 'Some Amarna letters come from vassal rulers in Canaan.', v: true, why: 'Rulers of towns like Byblos and Jerusalem wrote to "the king, my lord".' }
  ], s: [[1, builtQ(['amenhotep3', 'ramesses2', 'hatshepsut', 'thutmose3'], NK_KINGS)], [1, cartoucheQ(['amenhotep', 'thutmose', 'ramesses', 'tutankhamun'])]] };
  G('hist.amenhotep3', function (R, ctx) { return run(R, ctx, D.amenhotep3); });

  D.akhenaten = { hint: 'One god, the sun disk; one new city; and a debate about the right word.', f: [
    ['What did Akhenaten make the center of worship?', 'the Aten, the disk of the sun', ['Amun of Thebes', 'Osiris', 'the Apis bull'], 'He put the Aten above and in place of the other gods.'],
    ['What new capital did Akhenaten build?', 'Akhetaten, at Amarna', ['Pi-Ramesses', 'Alexandria', 'Itjtawy'], 'Akhetaten, "Horizon of the Aten", was built on empty land in Middle Egypt.'],
    ['What was Akhenaten\'s name before he changed it?', 'Amenhotep IV', ['Thutmose IV', 'Ramesses I', 'Tutankhaten'], 'He changed Amenhotep ("Amun is content") to Akhenaten.'],
    ['How was the Aten shown?', 'as a sun disk whose rays end in hands', ['as a man with a falcon\'s head', 'as a ram', 'as a mummy with a crook'], 'Some of the hands hold the sign of life to the king and queen.'],
    ['Is "monotheism" the right word for Akhenaten\'s religion?', 'scholars debate it', ['yes, all scholars agree', 'no, he worshipped every god equally', 'he had no religion'], 'Some call it monotheism; others note the king\'s special place between the Aten and the people.'],
    ['Whose name was hacked out of monuments under Akhenaten?', 'Amun\'s', ['the Aten\'s', 'Akhenaten\'s own', 'Ra\'s'], 'Amun\'s name and images were cut out, and temples lost support.'],
    ['What happened to Amarna after Akhenaten\'s death?', 'it was abandoned', ['it became the capital for a thousand years', 'it became Alexandria', 'it was moved to Nubia'], 'Within a few years the court left, and the city was abandoned.', { lv: 2 }],
    ['At Amarna, people kept shrines with images of the royal family worshipping the Aten. What does that suggest?', 'the king and his family stood between the god and the people', ['ordinary people were priests of the Aten', 'the Aten was forgotten', 'the royal family were not worshippers'], 'This is one of the points in the monotheism debate.', { lv: 2 }],
    ['Where was the Great Hymn to the Aten carved?', 'in a tomb at Amarna', ['in the Great Pyramid', 'at Abu Simbel', 'on the Rosetta Stone'], 'It describes one sun god who creates and sustains every land and creature.', { lv: 3 }]
  ], t: [
    { s: 'Scholars agree that Akhenaten\'s religion was simple monotheism.', v: false, why: 'Scholars debate the word; the king himself held a special place between the Aten and the people.' },
    { s: 'Akhenaten\'s religious changes outlasted him by many centuries.', v: false, why: 'They were reversed within a few years of his death.' }
  ], s: [[1, mapQ('egypt', ['amarna', 'karnak', 'memphis'], BIG_SITES, DESC)], [1, periodQ(['nk', 'tip', 'sip'])]] };
  G('hist.akhenaten', function (R, ctx) { return run(R, ctx, D.akhenaten); });

  D.restoration = { hint: 'The boy king\'s fame comes from his tomb.', f: [
    ['What did Tutankhamun\'s government do?', 'brought back the old gods and left Amarna', ['made the Aten the only god', 'moved the capital to Alexandria', 'invaded Persia'], 'The old cults were restored and the court left Akhetaten.'],
    ['What was Tutankhamun\'s name at first?', 'Tutankhaten, "living image of the Aten"', ['Akhenaten', 'Ramesses', 'Horemheb'], 'He changed it to Tutankhamun, "living image of Amun".'],
    ['Why is Tutankhamun so famous today?', 'his nearly intact tomb was found in 1922', ['he built the Great Pyramid', 'he won the battle of Kadesh', 'he reigned for 66 years'], 'Howard Carter found KV62 in the Valley of the Kings with its treasures.'],
    ['Who were the stronger figures behind the boy king?', 'Ay and Horemheb', ['Hatshepsut and Senenmut', 'Kamose and Ahmose', 'Caesar and Antony'], 'The courtier Ay and the general Horemheb governed for him, and both became king later.'],
    ['How did later king lists treat the Amarna kings?', 'they left them out', ['they put them first', 'they doubled their reigns', 'they listed only them'], 'The Abydos list jumps from Amenhotep III to Horemheb.'],
    ['What does the Restoration Stela describe?', 'temples in ruins and the king restoring them', ['the battle of Megiddo', 'the founding of Alexandria', 'the flood of the Nile'], 'It is propaganda, but it shows what the new government wanted to be seen doing.', { lv: 2 }],
    ['What did Horemheb do with Akhenaten\'s buildings?', 'pulled them down and reused their blocks as fill in new pylons', ['restored them in gold', 'moved them to Nubia', 'left them untouched'], 'Blocks from Amarna buildings have been found inside pylons at Karnak.', { lv: 2 }],
    ['A later legal text dates an event to "Year 59 of Horemheb". Why so high?', 'the Amarna years were counted as if they were Horemheb\'s', ['Horemheb reigned 59 years', 'it is a mistake for Ramesses II', 'the year count started at Narmer'], 'Erasing the Amarna kings meant giving their years to Horemheb.', { lv: 3 }]
  ], t: [
    { s: 'Tutankhamun was one of Egypt\'s most powerful rulers.', v: false, why: 'He was a young king whose fame comes from his tomb; Horemheb was the stronger figure.' },
    { s: 'Tutankhamun came to the throne as a boy.', v: true, why: 'He was about eight or nine, and died at about eighteen or nineteen.' }
  ], s: [[2, cartoucheQ(['tutankhamun', 'amenhotep', 'ramesses', 'thutmose'])], [1, kingOrderQ(['amenhotep3', 'akhenaten', 'tutankhamun', 'horemheb', 'seti1', 'thutmose1', 'ramesses2'])]] };
  G('hist.restoration', function (R, ctx) { return run(R, ctx, D.restoration); });

  D.ramesses2 = { hint: 'Check the style: his name is on older monuments too.', f: [
    ['To which dynasty did Ramesses II belong?', 'the 19th Dynasty', ['the 18th Dynasty', 'the 12th Dynasty', 'the 26th Dynasty'], 'His grandfather Ramesses I founded the 19th Dynasty.'],
    ['About how long did Ramesses II reign?', 'about 66 years', ['about 9 years', 'about 20 years', 'about 120 years'], 'He reigned c. 1279–1213 BC.'],
    ['Which rock-cut temples in Nubia did Ramesses II build?', 'Abu Simbel', ['Deir el-Bahari', 'Edfu', 'Philae'], 'Two temples with four colossal seated statues; they were moved to higher ground in 1964–68.'],
    ['What was Pi-Ramesses?', 'Ramesses II\'s capital in the eastern Delta', ['his tomb', 'a Hittite city', 'a fort in Nubia'], 'It lay near old Avaris, close to the roads to Asia.'],
    ['Why is a monument with Ramesses II\'s name not always his work?', 'he also carved his name on older buildings and statues', ['his name was added by the Romans', 'he never built anything', 'all his monuments are fakes'], 'Egyptologists call this usurpation; style and traces of older names reveal it.'],
    ['What was the Ramesseum?', 'Ramesses II\'s memorial temple at Thebes', ['a pyramid at Giza', 'his palace in the Delta', 'a fortress at Kadesh'], 'It stands on the west bank, with a great fallen colossus.', { lv: 2 }],
    ['What did Greek writers call Ramesses II?', 'Ozymandias', ['Cheops', 'Sesostris', 'Ammenemes'], 'The name comes from his throne name, User-maat-ra.', { lv: 2 }],
    ['Why did Ramesses II put his capital in the eastern Delta?', 'it was near his family\'s home and the road to the Levant', ['it was the old capital of the Old Kingdom', 'it was safe from the flood', 'it was the center of the Aten cult'], 'The army had to face the Hittites in the north.', { lv: 3 }]
  ], t: [
    { s: 'Every monument bearing Ramesses II\'s name was built by him.', v: false, why: 'He also carved his name on older buildings and statues.' },
    { s: 'The temples of Abu Simbel were moved to save them from Lake Nasser.', v: true, why: 'They were cut apart and rebuilt on higher ground in 1964–68.' }
  ], s: [[2, builtQ(['ramesses2', 'amenhotep3', 'hatshepsut', 'thutmose3', 'ramesses3'], NK_KINGS)], [1, cartoucheQ(['ramesses', 'thutmose', 'amenhotep', 'tutankhamun'])], [1, mapQ('egypt', ['piramesse', 'karnak', 'abydos'], ['piramesse', 'karnak', 'abydos', 'memphis', 'amarna', 'elephantine', 'giza', 'sais'], DESC)], [1, mapQ('nile', ['abu-simbel', 'karnak'], ['abu-simbel', 'karnak', 'memphis', 'napata', 'kerma', 'meroe', 'elephantine'], DESC)]] };
  G('hist.ramesses2', function (R, ctx) { return run(R, ctx, D.ramesses2); });

  D.kadesh = { hint: 'Compare the temple account with what happened next.', f: [
    ['Whom did Ramesses II fight at Kadesh?', 'the Hittites, under Muwatalli II', ['the Hyksos', 'the Sea Peoples', 'the Assyrians'], 'Egypt and the Hittite empire fought over Syria.'],
    ['What was the outcome of Kadesh?', 'a draw: the Hittites kept Kadesh', ['a crushing Egyptian victory that won Syria', 'an Egyptian defeat that ended the dynasty', 'the end of the Hittite empire'], 'Despite Ramesses\' temple accounts, the Hittites kept the city and the region.'],
    ['What came some years after Kadesh?', 'a peace treaty between Ramesses II and the Hittite king Hattusili III', ['a Hittite conquest of Egypt', 'the founding of Alexandria', 'the reign of Akhenaten'], 'In Ramesses\' Year 21 (c. 1259 BC) the two powers made peace.'],
    ['Why can\'t the temple reliefs be taken at face value?', 'they were made to show the king as a hero saving the day', ['they were carved by the Hittites', 'they are in Greek', 'they show a different battle'], 'Royal inscriptions recorded victories; the outcome points to a draw.'],
    ['In what forms does the treaty survive?', 'an Egyptian text at Karnak and a Hittite version in Akkadian on clay tablets', ['only on the Rosetta Stone', 'only in Greek', 'it does not survive'], 'The Hittite tablets were found at Hattusa, the Hittite capital.'],
    ['How was the Egyptian army organized at Kadesh?', 'in four divisions named for gods: Amun, Ra, Ptah and Seth', ['as one huge chariot charge', 'in Roman legions', 'as Greek mercenaries only'], 'The division of Ra was struck on the march.', { lv: 2 }],
    ['How did the Hittites surprise Ramesses?', 'two captured nomads told him the Hittites were far to the north', ['they came by sea', 'they hid in the pyramids', 'they attacked in the winter flood'], 'It was a trick; the Hittite army was close by.', { lv: 2 }],
    ['Where can you see a copy of the Egyptian–Hittite treaty today?', 'at the United Nations headquarters in New York', ['in the Great Pyramid', 'in Tutankhamun\'s tomb', 'nowhere'], 'A copy hangs at the UN as an early example of a peace treaty.', { lv: 3 }]
  ], t: [
    { s: 'Kadesh was a clear Egyptian victory that won Syria for Egypt.', v: false, why: 'Hittite records and the outcome suggest a draw; the Hittites kept Kadesh.' },
    { s: 'Ramesses II later married a Hittite princess.', v: true, why: 'The peace was sealed by a royal marriage.' }
  ], s: [[2, mapQ('levant', ['kadesh', 'megiddo', 'byblos'], ['kadesh', 'megiddo', 'byblos', 'avaris', 'serabit'], DESC)]] };
  G('hist.kadesh', function (R, ctx) { return run(R, ctx, D.kadesh); });

  D.ramesses3 = { hint: 'Many groups, uncertain origins.', f: [
    ['Whom did Ramesses III fight off in his Year 8?', 'the Sea Peoples', ['the Hyksos', 'the Hittites at Kadesh', 'the Romans'], 'He fought them on land and at sea at the edge of the Delta.'],
    ['Where did Ramesses III record his wars?', 'at Medinet Habu, his memorial temple', ['at Abu Simbel', 'in the Great Pyramid', 'at Alexandria'], 'Its reliefs show the battles with the Sea Peoples.'],
    ['Who went on the first known strike?', 'the tomb-builders of Deir el-Medina, under Ramesses III', ['the pyramid builders of Khufu', 'Roman soldiers', 'the priests of the Aten'], 'In Year 29 their grain rations were late, and they stopped work.'],
    ['Who were the Sea Peoples?', 'a mix of groups on the move, whose origins are debated', ['one nation from Greece, for certain', 'the Egyptian navy', 'the Hyksos returning'], 'Names like Peleset, Sherden and Shekelesh suggest several groups.'],
    ['Which Sea People do most scholars identify with the Philistines?', 'the Peleset', ['the Sherden', 'the Hittites', 'the Medjay'], 'The Peleset settled on the coast of Canaan.', { lv: 2 }],
    ['Why did the workmen strike?', 'their monthly grain rations were weeks late', ['they wanted gold coins', 'they refused to build for Amun', 'the Nile flooded the tombs'], 'They said they were hungry; officials brought rations and they went back.'],
    ['Who coined the name "Sea Peoples"?', 'modern scholars, in the 1800s', ['Ramesses III', 'Manetho', 'Herodotus'], 'The Egyptian texts name each group separately.', { lv: 3 }],
    ['What does Papyrus Harris I record?', 'Ramesses III\'s huge gifts to the temples', ['the Amarna diplomatic letters', 'the Tale of Sinuhe', 'a Ptolemaic decree'], 'It was made at the end of his reign.', { lv: 3 }]
  ], t: [
    { s: 'The Sea Peoples were a single nation from one homeland.', v: false, why: 'They were a mix of groups, and their origins are debated.' },
    { s: 'The record of the workmen\'s strike survives on papyrus.', v: true, why: 'A papyrus in Turin kept by the scribe Amennakht records it.' }
  ], s: [[1, mapQ('thebes', ['medinet-habu', 'deir-el-medina', 'kings', 'ramesseum'], NK_SITES, DESC)], [1, kingOrderQ(['ramesses2', 'merneptah', 'ramesses3', 'thutmose3', 'amenhotep3', 'shoshenq1'])]] };
  G('hist.ramesses3', function (R, ctx) { return run(R, ctx, D.ramesses3); });

  D['nk-end'] = { hint: 'Date each sign of trouble: they are spread over a century.', f: [
    ['How did the New Kingdom end?', 'slowly, over about a century', ['in one day, in a single invasion', 'with the arrival of Alexander', 'with the building of the pyramids'], 'Loss of empire, rising prices, robberies and priestly power built up under the later Ramesses.'],
    ['Who grew powerful at Thebes at the end of the New Kingdom?', 'the high priests of Amun', ['the Hyksos', 'the Roman prefects', 'the priests of the Aten'], 'By Ramesses XI\'s reign, the high priest ruled the south.'],
    ['What happened to Egypt\'s empire in the Levant under the later Ramesses?', 'it was lost', ['it grew to include Greece', 'it moved to Nubia', 'it was given to Persia by treaty'], 'By the reign of Ramesses VI, Egyptian rule in Canaan had ended.'],
    ['What did officials investigate under Ramesses IX?', 'robberies of royal tombs', ['the death of Tutankhamun', 'a Hittite invasion', 'the Rosetta Stone'], 'Trial records such as the Abbott Papyrus survive.'],
    ['Who was the last king of the New Kingdom?', 'Ramesses XI', ['Ramesses II', 'Tutankhamun', 'Psamtek I'], 'After him, Egypt split between Tanis and Thebes.'],
    ['What is the Report of Wenamun?', 'a story of an envoy who sails to Byblos for cedar and is treated with scorn', ['a royal king list', 'a battle relief', 'a tax register'], 'Set at the end of the New Kingdom; whether it is a real report or literature is debated.', { lv: 2 }],
    ['Why did the high priests of Amun become so powerful?', 'Amun\'s temple had huge estates and wealth, while the king grew weaker', ['they commanded the Roman army', 'they owned all the gold mines of Kush', 'Akhenaten gave them power'], 'An independent, wealthy temple filled the gap left by a weak king.', { lv: 3 }]
  ], t: [
    { s: 'The New Kingdom fell suddenly in a single year.', v: false, why: 'It wound down over about a century under the later Ramesses.' },
    { s: 'Grain prices at Thebes rose sharply under the later Ramesses.', v: true, why: 'Records from Deir el-Medina show rising prices.' }
  ], s: [[1, periodQ(['nk', 'tip'])]] };
  G('hist.nk-end', function (R, ctx) { return run(R, ctx, D['nk-end']); });

  // ================================================================ Third Intermediate and Late Periods; Ptolemaic, Roman and Byzantine
  var LATE_KINGS = ['shoshenq1', 'piye', 'taharqo', 'psamtek1', 'cambyses', 'nectanebo2', 'alexander', 'ptolemy1', 'ptolemy5', 'cleopatra7', 'augustus'];
  var LATE_SPANS = [[[-664, 'the accession of Psamtek I'], [-525, 'the Persian conquest']], [[-525, 'the Persian conquest'], [-404, 'the end of the first Persian rule']], [[-404, 'the end of the first Persian rule'], [-343, 'the second Persian conquest']], [[-343, 'the second Persian conquest'], [-332, 'Alexander\'s arrival']], [[-332, 'Alexander\'s arrival'], [-30, 'Egypt becoming Roman']], [[-196, 'the Rosetta Stone decree'], [-30, 'the death of Cleopatra VII']], [[-31, 'the battle of Actium'], [394, 'the last hieroglyphic inscription']], [[-30, 'Egypt becoming Roman'], [641, 'the surrender of the fortress of Babylon']], [[-30, 'Egypt becoming Roman'], [212, 'Roman citizenship for nearly all free people']], [[-332, 'Alexander\'s arrival'], [641, 'the Arab conquest']], [[391, 'the destruction of the Serapeum'], [394, 'the last hieroglyphic inscription']], [[394, 'the last hieroglyphic inscription'], [641, 'the Arab conquest']]];

  D.tip = { hint: 'Power was shared among kings, priests and local chiefs.', f: [
    ['Where did the kings of the 21st Dynasty rule from?', 'Tanis, in the Delta', ['Thebes', 'Amarna', 'Alexandria'], 'The 21st Dynasty built its capital at Tanis while the high priests held Thebes.'],
    ['Who held Thebes at the start of the Third Intermediate Period?', 'the high priests of Amun', ['the Persian satrap', 'the Hyksos', 'the Ptolemies'], 'Egypt split between the kings at Tanis and the priests at Thebes.'],
    ['What was the origin of the 22nd Dynasty kings?', 'Libyan: chiefs of families settled in Egypt', ['Greek', 'Nubian', 'Hittite'], 'Shoshenq I and his successors came from Libyan families who had settled in Egypt as soldiers.'],
    ['What did the high priests do with the New Kingdom royal mummies?', 'moved them into hidden caches to protect them from robbers', ['burned them', 'sent them to Kush', 'sold them to Greece'], 'One cache at Deir el-Bahari held Seti I, Ramesses II and many others.'],
    ['What treasure did Pierre Montet find at Tanis?', 'royal tombs, including Psusennes I\'s silver coffin and gold mask', ['the Rosetta Stone', 'Tutankhamun\'s tomb', 'the Amarna letters'], 'The Tanis tombs rival Tutankhamun\'s for their riches.', { lv: 2 }],
    ['How did Libyan rule tend to work?', 'power was shared out: sons became high priests and governors, and offices became hereditary', ['one king held all power directly', 'Roman prefects governed every nome', 'the army chose a new king every year'], 'Over time this created many local princes.', { lv: 2 }],
    ['Does "intermediate" mean nothing happened?', 'no: temples were built, bronzes cast and trade went on', ['yes, Egypt was empty', 'yes, writing stopped', 'yes, there were no kings'], 'Power was divided, not absent.', { lv: 2 }]
  ], t: [
    { s: 'In the Third Intermediate Period several dynasties ruled at the same time.', v: true, why: 'The 22nd, 23rd, 24th and 25th Dynasties overlap in time, ruling different regions.' },
    { s: 'Nothing was built in Egypt during the Third Intermediate Period.', v: false, why: 'Temples were built and decorated, and fine bronze statues were cast.' }
  ], s: [[2, overlapQ([[21, 22], [22, 23], [22, 25], [23, 24], [24, 25], [25, 26]])], [1, mapQ('delta', ['tanis', 'bubastis', 'sais', 'memphis'], ['tanis', 'bubastis', 'sais', 'memphis', 'avaris', 'heliopolis', 'buto', 'alexandria'], DESC)]] };
  G('hist.tip', function (R, ctx) { return run(R, ctx, D.tip); });

  D.kushite = { hint: 'Nubian kings who saw themselves as true pharaohs.', f: [
    ['Who ruled Egypt as the 25th Dynasty?', 'kings from Kush, such as Piye and Taharqo', ['Persian kings', 'Greek kings', 'Libyan chiefs'], 'Kushite kings from Napata conquered Egypt.'],
    ['Where was the Kushite kings\' home capital?', 'Napata, near Jebel Barkal', ['Avaris', 'Alexandria', 'Tanis'], 'Napata lay below the Fourth Cataract, beside the sacred mountain of Jebel Barkal.'],
    ['How did the Kushite kings present themselves?', 'as true heirs of the pharaohs, restoring temples and old traditions', ['as enemies of Egyptian religion', 'as Roman governors', 'as servants of Persia'], 'They worshipped Amun and revived older Egyptian styles.'],
    ['Who drove the Kushite kings out of Egypt?', 'the Assyrians', ['the Romans', 'the Hyksos', 'the Ptolemies'], 'Esarhaddon took Memphis c. 671 BC, and Ashurbanipal\'s army sacked Thebes in 663 BC.'],
    ['Where was Taharqo buried?', 'in the largest pyramid at Nuri, in Kush', ['in the Valley of the Kings', 'at Giza', 'at Alexandria'], 'Kushite kings were buried in pyramids at el-Kurru and Nuri.'],
    ['What does Piye\'s Victory Stela show about him?', 'a pious king who celebrates Amun\'s festivals and cares about horses', ['a king who destroyed Egyptian temples', 'a Greek general', 'a king who never left Napata'], 'He is angrier at a defeated ruler for starving his horses than for fighting him.', { lv: 2 }],
    ['What happened to the kingdom of Kush after the Kushite kings left Egypt?', 'it continued for about a thousand years, later centered at Meroë', ['it ended at once', 'it became part of Rome immediately', 'it moved to Greece'], 'Kush lasted until about the 4th century AD.', { lv: 2 }],
    ['Which Kushite king had an old text copied onto stone, preserving the Memphite creation account?', 'Shabaqo', ['Piye', 'Tantamani', 'Alara'], 'The Shabaqo Stone preserves the Memphite text; when it was first composed is debated.', { lv: 3 }]
  ], t: [
    { s: 'Egyptians always ruled Nubia, never the other way around.', v: false, why: 'Kushite kings ruled Egypt as the 25th Dynasty.' },
    { s: 'The Kushite kings worshipped Amun.', v: true, why: 'Amun had a great temple at Jebel Barkal, near Napata.' }
  ], s: [[2, mapQ('nile', ['napata', 'nuri', 'karnak', 'memphis'], ['napata', 'nuri', 'karnak', 'memphis', 'kerma', 'meroe', 'elephantine', 'buhen'], DESC)], [1, kingOrderQ(['shoshenq1', 'piye', 'taharqo', 'psamtek1', 'cambyses', 'ramesses3'])]] };
  G('hist.kushite', function (R, ctx) { return run(R, ctx, D.kushite); });

  D.saite = { hint: 'From 664 BC on, dates are exact.', f: [
    ['Who became king in 664 BC and reunited Egypt from Sais?', 'Psamtek I', ['Piye', 'Necho II', 'Nectanebo II'], 'Psamtek I, king from 664 BC, had the whole country under his rule within about eight years.'],
    ['Which dynasty is called the Saite Dynasty?', 'the 26th', ['the 18th', 'the 25th', 'the 30th'], 'It takes its name from Sais, its capital in the western Delta.'],
    ['Which earlier age did Saite art deliberately copy?', 'the Old Kingdom', ['the Roman period', 'the Amarna period', 'the Hyksos period'], 'Saite artists studied Old Kingdom work so closely that some pieces were once dated two thousand years too early.'],
    ['Which foreigners did Psamtek I hire as soldiers?', 'Greeks from Ionia and Carians', ['Romans', 'Hittites', 'Hyksos'], 'Mercenaries from western Anatolia gave him a loyal army.'],
    ['How did Psamtek I bring Thebes under his rule peacefully?', 'his daughter Nitocris was adopted as the future God\'s Wife of Amun', ['he bribed the Assyrians', 'he moved the capital to Thebes', 'he married a Kushite princess'], 'In 656 BC Nitocris was adopted at Thebes.'],
    ['What was Naukratis?', 'a Greek trading town in the Delta', ['a Persian fort', 'a Nubian capital', 'a pyramid'], 'Herodotus says Amasis gave the Greeks Naukratis as their trading town.', { lv: 2 }],
    ['Which Saite king was defeated by Babylon at Carchemish in 605 BC?', 'Necho II', ['Psamtek I', 'Amasis', 'Psamtek III'], 'Necho II lost to the Babylonians at Carchemish in Syria.', { lv: 2 }],
    ['Greek soldiers of Psamtek II scratched their names on which monument during a Nubian campaign?', 'the colossi of Abu Simbel', ['the Great Pyramid', 'the Rosetta Stone', 'the Colossi of Memnon'], 'Their graffiti on the colossi of Ramesses II date to 593 BC.', { lv: 3 }],
    ['Which Saite king lost Egypt to the Persians in 525 BC?', 'Psamtek III', ['Psamtek I', 'Necho II', 'Apries'], 'He reigned only a few months before Cambyses\' conquest.', { lv: 3 }]
  ], t: [
    { s: 'The Late Period was only a time of decline and weakness.', v: false, why: 'The Saite kings ran a strong, wealthy state with an army, a navy and trade with Greece.' },
    { s: 'Dates from 664 BC on are fixed to the year.', v: true, why: 'They are tied to Assyrian, Babylonian and Greek records.' }
  ], s: [[2, mapQ('delta', ['sais', 'naukratis', 'memphis', 'tanis'], ['sais', 'naukratis', 'memphis', 'tanis', 'avaris', 'bubastis', 'heliopolis', 'alexandria'], DESC)], [1, spanQ(LATE_SPANS.slice(0, 2))]] };
  G('hist.saite', function (R, ctx) { return run(R, ctx, D.saite); });

  D.persians = { hint: 'Weigh a later Greek story against documents from the time.', f: [
    ['Who conquered Egypt in 525 BC?', 'Cambyses II of Persia', ['Alexander the Great', 'Ashurbanipal of Assyria', 'Julius Caesar'], 'Cambyses defeated Psamtek III at Pelusium and took Memphis.'],
    ['As which dynasty did the first Persian kings of Egypt rule?', 'the 27th', ['the 26th', 'the 30th', 'the 31st'], 'The 27th Dynasty lasted from 525 to 404 BC.'],
    ['How did Persia govern Egypt?', 'through a governor (satrap) at Memphis, while the Persian kings appeared as pharaohs', ['through the high priests of Amun alone', 'through Roman prefects', 'it did not govern Egypt'], 'Egypt was a province of the empire.'],
    ['Herodotus says Cambyses killed the sacred Apis bull. What does Egyptian evidence show?', 'an Apis bull that died in his reign was buried with full honors', ['Cambyses was never in Egypt', 'Herodotus saw it happen himself', 'there was no Apis bull'], 'The Apis epitaph names Cambyses; historians weigh it against Herodotus.'],
    ['Who was Udjahorresnet?', 'an Egyptian official who served Cambyses and Darius', ['a Persian king', 'a Greek historian', 'a Hyksos ruler'], 'His statue says he advised Cambyses and had the temple of Neith at Sais restored.'],
    ['Which Persian king completed a canal from the Nile to the Red Sea?', 'Darius I', ['Cambyses II', 'Xerxes', 'Artaxerxes III'], 'He set up stelae along it in Egyptian and Persian cuneiform.', { lv: 2 }],
    ['What do the Aramaic papyri from Elephantine show?', 'a garrison of Jewish soldiers serving Persia', ['the earliest hieroglyphs', 'the Greek Library of Alexandria', 'Cleopatra\'s letters'], 'Aramaic was the Persian empire\'s official language.', { lv: 2 }],
    ['Why might Herodotus\'s picture of Cambyses be harsh?', 'he heard stories decades later and wrote for Greeks who had fought Persia', ['he was Cambyses\' friend', 'he read Egyptian documents only', 'he lived in Cambyses\' palace'], 'Each source had reasons for its picture.', { lv: 3 }]
  ], t: [
    { s: 'Herodotus\'s stories of Cambyses\' cruelty are confirmed by all Egyptian records.', v: false, why: 'Egyptian records of his reign paint a milder picture; scholars weigh the two.' },
    { s: 'Egyptians threw out the Persians in 404 BC.', v: true, why: 'Amyrtaeus of Sais claimed the throne, ending the 27th Dynasty.' }
  ], s: [[2, spanQ(LATE_SPANS.slice(0, 4))], [1, dynQ(['cambyses', 'psamtek1', 'nectanebo2', 'taharqo', 'shoshenq1'])]] };
  G('hist.persians', function (R, ctx) { return run(R, ctx, D.persians); });

  D['last-natives'] = { hint: 'Cleopatra came from a Macedonian Greek family.', f: [
    ['Who was the last native Egyptian pharaoh?', 'Nectanebo II', ['Cleopatra VII', 'Ramesses III', 'Ptolemy I'], 'Nectanebo II of the 30th Dynasty lost his throne to Persia in 343 BC.'],
    ['Why is Cleopatra VII not called the last native pharaoh?', 'she belonged to the Ptolemies, a Macedonian Greek family', ['she never ruled Egypt', 'she was Persian', 'she was born in Rome'], 'She was the last Ptolemaic ruler; Nectanebo II was the last Egyptian-born king.'],
    ['Between which years did the last native dynasties rule?', '404 and 343 BC', ['c. 1550 and c. 1069 BC', '30 BC and AD 641', '664 and 525 BC'], 'The 28th, 29th and 30th Dynasties ruled between the two Persian periods.'],
    ['Who reconquered Egypt for Persia in 343 BC?', 'Artaxerxes III', ['Cambyses II', 'Alexander', 'Darius I'], 'Artaxerxes III broke through, and Nectanebo II fled south.'],
    ['What were the 30th Dynasty kings known for?', 'building on a large scale at temples all over Egypt', ['building the Great Pyramid', 'moving the capital to Rome', 'abandoning the temples'], 'Nectanebo I and II added to temples from Philae to the Delta.', { lv: 2 }],
    ['What is the oldest standing building at Philae?', 'a gateway hall of Nectanebo I', ['a pyramid of Khufu', 'a church of Justinian', 'a palace of Cleopatra'], 'The later Ptolemaic temple grew around it.', { lv: 3 }],
    ['What legend did the Greek Alexander Romance tell about Nectanebo II?', 'that he was the secret father of Alexander the Great', ['that he built the Pharos', 'that he founded Rome', 'that he defeated Rome'], 'A legend, which shows how much Egyptians wanted their last king to live on.', { lv: 3 }]
  ], t: [
    { s: 'Cleopatra VII was the last native Egyptian pharaoh.', v: false, why: 'She was Macedonian Greek by family; Nectanebo II was the last native-born king.' },
    { s: 'The second Persian rule of Egypt lasted only about eleven years.', v: true, why: 'From 343 BC to Alexander\'s arrival in 332 BC.' }
  ], s: [[2, spanQ(LATE_SPANS.slice(1, 5))], [1, kingOrderQ(['psamtek1', 'cambyses', 'nectanebo2', 'alexander', 'taharqo', 'ptolemy1'])]] };
  G('hist.last-natives', function (R, ctx) { return run(R, ctx, D['last-natives']); });

  D.alexander = { hint: 'The Persian governor had no army left to fight with.', f: [
    ['When did Alexander the Great take Egypt?', '332 BC', ['525 BC', '30 BC', 'AD 641'], 'He arrived in 332 BC, the year after his victory at Issus.'],
    ['How did Alexander take Egypt?', 'the Persian governor gave it up without a fight', ['after a ten-year siege of Memphis', 'by a great battle at Giza', 'by marrying Cleopatra'], 'The satrap Mazaces had few troops and no hope of help.'],
    ['Which oracle did Alexander visit in the Western Desert?', 'the oracle of Amun at Siwa', ['the oracle at Delphi', 'the oracle of the Aten at Amarna', 'the oracle of Ptah at Memphis'], 'Ancient writers say the priest greeted him as son of the god.'],
    ['Which city did Alexander found in Egypt?', 'Alexandria', ['Memphis', 'Thebes', 'Pi-Ramesses'], 'Alexandria, founded in 331 BC, became Egypt\'s capital for nearly a thousand years.'],
    ['How did Egyptian temples treat Alexander?', 'as pharaoh, with royal titles and cartouches', ['as a foreign enemy to be cursed', 'they ignored him', 'as a Persian king'], 'Being named pharaoh put him in the king\'s place in the Egyptian order.'],
    ['Where did Alexander win the battle that opened the way to Egypt?', 'Issus, in 333 BC', ['Actium', 'Kadesh', 'Megiddo'], 'He defeated Darius III at Issus, then marched down the Levant coast.', { lv: 2 }],
    ['Which god did the Greeks call Zeus Ammon?', 'Amun, whose oracle was at Siwa', ['Ra', 'Osiris', 'Ptah'], 'The Siwa oracle of Amun was famous across the Greek world.', { lv: 2 }],
    ['Who took charge of Egypt after Alexander died in 323 BC?', 'his general Ptolemy', ['Cleopatra VII', 'Darius III', 'Augustus'], 'Ptolemy brought Alexander\'s body to Egypt.', { lv: 2 }]
  ], t: [
    { s: 'Alexander fought a great battle to win Egypt.', v: false, why: 'The Persian governor gave Egypt up without a fight.' },
    { s: 'Alexander left Egypt in 331 BC and never returned alive.', v: true, why: 'He died at Babylon in 323 BC; his body was later brought to Egypt.' }
  ], s: [[2, mapQ('egypt', ['alexandria', 'siwa', 'memphis'], ['alexandria', 'siwa', 'memphis', 'karnak', 'abydos', 'amarna', 'tanis', 'elephantine'], DESC)]] };
  G('hist.alexander', function (R, ctx) { return run(R, ctx, D.alexander); });

  D.ptolemies = { hint: 'Greek kings to the Greeks, pharaohs to the Egyptians.', f: [
    ['From which city did the Ptolemies rule?', 'Alexandria', ['Thebes', 'Memphis only', 'Rome'], 'Alexandria, with its Library, Museum and lighthouse, was their capital.'],
    ['How did the Ptolemies treat Egyptian religion?', 'they built and rebuilt great Egyptian temples', ['they closed all Egyptian temples', 'they ignored it entirely', 'they banned hieroglyphs'], 'Edfu, Dendera, Kom Ombo and Philae were built or rebuilt under them.'],
    ['Which temple, built under the Ptolemies, is the best preserved in Egypt?', 'Edfu, the temple of Horus', ['Karnak', 'the Ramesseum', 'Abu Simbel'], 'Edfu was built over nearly two centuries under the Ptolemies.'],
    ['What was the Pharos?', 'the great lighthouse of Alexandria', ['a pyramid', 'the Library', 'a temple of Isis'], 'Finished around 280 BC, it was one of the Seven Wonders.'],
    ['What language did the Ptolemaic government use?', 'Greek', ['Latin', 'Akkadian', 'Coptic'], 'Greek was the language of the king and his officials.'],
    ['Why is the Rosetta Stone written in three scripts?', 'so priests, literate Egyptians and Greek officials could all read it', ['to confuse readers', 'because three kings wrote it', 'it is a school exercise'], 'Hieroglyphs for the temples, Demotic for documents, Greek for the government.', { lv: 2 }],
    ['What was the Museum of Alexandria?', 'a research institute where scholars worked, paid by the king', ['a museum of old objects, as today', 'a temple of Amun', 'a royal tomb'], 'It was a shrine of the Muses and a center of learning.', { lv: 2 }],
    ['Which Ptolemy is honored in the Rosetta Stone decree?', 'Ptolemy V', ['Ptolemy I', 'Ptolemy XIII', 'Ptolemy II'], 'The decree of 196 BC honors Ptolemy V.', { lv: 3 }],
    ['Why did the Ptolemies support the temples?', 'to win the priests\' support and keep Egypt peaceful and productive', ['because the Romans ordered it', 'to prepare for Christianity', 'because they spoke only Egyptian'], 'The temples owned land, kept records and spoke for the gods.', { lv: 3 }]
  ], t: [
    { s: 'The Ptolemies ignored Egyptian religion.', v: false, why: 'They built and rebuilt great temples and appear on their walls as pharaohs.' },
    { s: 'The Ptolemaic dynasty ruled Egypt for nearly three hundred years.', v: true, why: 'From Ptolemy I to Cleopatra VII\'s death in 30 BC.' }
  ], s: [[2, mapQ('egypt', ['alexandria', 'edfu', 'philae', 'dendera'], ['alexandria', 'edfu', 'philae', 'dendera', 'memphis', 'amarna', 'abydos', 'tanis', 'siwa'], DESC)], [1, cartoucheQ(['ptolemy', 'cleopatra', 'ramesses', 'khufu'])]] };
  G('hist.ptolemies', function (R, ctx) { return run(R, ctx, D.ptolemies); });

  D.cleopatra = { hint: 'Ask who wrote each account, and when.', f: [
    ['Which battle did Antony and Cleopatra lose to Octavian in 31 BC?', 'Actium', ['Kadesh', 'Issus', 'Megiddo'], 'Octavian defeated them at sea off Actium in western Greece.'],
    ['What happened to Egypt after Cleopatra\'s death in 30 BC?', 'it became a Roman province', ['it became independent', 'it was ruled by Persia', 'it was split into two kingdoms'], 'Octavian, soon Augustus, made Egypt part of the Roman Empire.'],
    ['Which two Roman leaders did Cleopatra ally with?', 'Julius Caesar and Mark Antony', ['Augustus and Nero', 'Hannibal and Scipio', 'Alexander and Ptolemy'], 'First Caesar, then Antony, who controlled the eastern half of Rome\'s world.'],
    ['Why must we be careful with ancient accounts of Cleopatra?', 'most were written by her enemies or long after', ['she wrote them all herself', 'they are all on temple walls', 'none survive at all'], 'Roman poets and later historians wrote most of what survives.'],
    ['What was Cleopatra\'s son by Caesar called?', 'Caesarion (Ptolemy Caesar)', ['Augustus', 'Ptolemy V', 'Tutankhamun'], 'He was born in 47 BC and appears with her at Dendera.'],
    ['Which family did Cleopatra VII belong to?', 'the Ptolemies, of Macedonian Greek descent', ['the 18th Dynasty', 'the Persian royal family', 'a Roman senatorial family'], 'She was the last ruler of the Ptolemaic dynasty.', { lv: 2 }],
    ['Plutarch says Cleopatra was the first of her dynasty to learn which language?', 'Egyptian', ['Greek', 'Latin', 'Hebrew'], 'He also says she spoke many languages.', { lv: 2 }],
    ['A Roman poem written just after Actium calls Cleopatra a mad queen. What does it tell us best?', 'Roman propaganda after Octavian\'s victory', ['exactly what Cleopatra was like', 'Egyptian views of her', 'nothing at all'], 'It was written by a supporter of her enemy to celebrate him.', { lv: 3 }]
  ], t: [
    { s: 'The Roman picture of Cleopatra is a fair, neutral portrait.', v: false, why: 'Most surviving accounts were written by her enemies or long after.' },
    { s: 'Cleopatra appears on temple walls at Dendera as a pharaoh with her son.', v: true, why: 'Reliefs at Dendera show her with Caesarion.' }
  ], s: [[2, cartoucheQ(['cleopatra', 'ptolemy', 'ramesses', 'tutankhamun'])], [1, spanQ(LATE_SPANS.slice(4, 7))]] };
  G('hist.cleopatra', function (R, ctx) { return run(R, ctx, D.cleopatra); });

  D['roman-egypt'] = { hint: 'Egypt fed Rome, so the emperor kept it close.', f: [
    ['Who governed Roman Egypt?', 'a prefect appointed by the emperor', ['a king of the Ptolemies', 'the Roman Senate directly', 'the high priest of Amun'], 'Augustus kept Egypt under his control through a prefect of the equestrian class.'],
    ['Why were Roman senators forbidden to enter Egypt without permission?', 'so no rival could seize its grain and wealth', ['because of the flood', 'because of a religious law', 'because Egypt was not part of the empire'], 'Whoever held Egypt held a huge supply of grain.'],
    ['What did Egypt supply to the city of Rome?', 'grain', ['tin', 'cedar wood', 'horses'], 'Grain ships sailed every year from Alexandria to Italy.'],
    ['Did Egyptian culture end when the Romans arrived?', 'no: temples were still built and hieroglyphs carved for centuries', ['yes, at once', 'yes, the temples were all closed in 30 BC', 'yes, Egyptians all moved to Rome'], 'Emperors appear on temple walls as pharaohs.'],
    ['What was found in the rubbish mounds of Oxyrhynchus?', 'huge numbers of Greek papyri', ['royal mummies', 'the Rosetta Stone', 'the Amarna letters'], 'Tax receipts, letters, contracts and lost works of literature.'],
    ['What are the Faiyum portraits?', 'painted portraits on wood placed over the faces of mummies', ['statues of Ramesses II', 'pyramid reliefs', 'portraits of the Ptolemies on coins'], 'They are in a Greco-Roman style, from the Roman period.', { lv: 2 }],
    ['In AD 212 the emperor Caracalla made nearly all free people of the empire…', 'Roman citizens', ['slaves', 'Christians', 'priests of Isis'], 'Egyptians, too, became citizens.', { lv: 2 }],
    ['When was the last known hieroglyphic inscription carved?', 'AD 394, at Philae', ['30 BC, at Alexandria', 'AD 1822, at Paris', '664 BC, at Sais'], 'Egyptian writing outlived Cleopatra by more than four centuries.', { lv: 2 }]
  ], t: [
    { s: 'Egyptian culture ended when Rome conquered Egypt.', v: false, why: 'Temples were still built and hieroglyphs carved for centuries.' },
    { s: 'Roman emperors appear on Egyptian temple walls as pharaohs.', v: true, why: 'Their names were written in cartouches, and they are shown making offerings.' }
  ], s: [[2, spanQ(LATE_SPANS.slice(6, 10))], [1, mapQ('egypt', ['oxyrhynchus', 'alexandria', 'dendera', 'philae'], ['oxyrhynchus', 'alexandria', 'dendera', 'philae', 'berenike', 'memphis', 'karnak', 'siwa', 'kharga'], DESC)]] };
  G('hist.roman-egypt', function (R, ctx) { return run(R, ctx, D['roman-egypt']); });

  D['christian-egypt'] = { hint: 'The old temples closed slowly, over more than a century.', f: [
    ['Who lived as a hermit in the desert and became famous across the Christian world?', 'Antony', ['Pachomius', 'Origen', 'Amr ibn al-As'], 'Antony (about AD 251–356) gave away his property and lived alone in prayer.'],
    ['What did Pachomius found?', 'communities of monks living by a shared rule', ['the Library of Alexandria', 'the city of Fustat', 'the Coptic alphabet'], 'His monasteries at Tabennisi in Upper Egypt were the model for communal monastic life.'],
    ['What is Coptic?', 'the Egyptian language written in an alphabet based on Greek', ['a kind of hieroglyph', 'the Greek language', 'the Arabic alphabet'], 'Coptic adds a few letters taken from Demotic for sounds Greek lacked.'],
    ['Why was Coptic easier to learn than hieroglyphs?', 'it used a small alphabet and showed vowels', ['it had more signs', 'it had no letters', 'it was written in clay'], 'An alphabet of about 30 letters, with vowels, made reading and writing easier.'],
    ['When did the old temples close?', 'over a long time; Philae was among the last, in the AD 530s', ['all in one day in AD 391', 'in 30 BC', 'they never closed'], 'The Serapeum was destroyed in AD 391, but Philae worked until Justinian closed it.'],
    ['What was destroyed in Alexandria in AD 391?', 'the great temple of Serapis', ['the Pharos', 'the Library of Ashurbanipal', 'the Rosetta Stone'], 'Laws of Theodosius I in the AD 390s banned pagan sacrifice.', { lv: 2 }],
    ['What split the Egyptian church from Rome and Constantinople?', 'the Council of Chalcedon (AD 451)', ['the Council of Nicaea (AD 325)', 'the Arab conquest', 'the battle of Actium'], 'Most Egyptian Christians rejected its decision; their church went its own way.', { lv: 3 }],
    ['What was found at Nag Hammadi in 1945?', 'a jar of Coptic books', ['Tutankhamun\'s tomb', 'the Rosetta Stone', 'the Amarna letters'], 'The Nag Hammadi codices are 4th-century AD books in Coptic.', { lv: 3 }]
  ], t: [
    { s: 'Egyptian religion ended in a single year.', v: false, why: 'Temples closed over a long time; Philae worked until the AD 530s.' },
    { s: 'Church tradition says the evangelist Mark founded the church of Alexandria.', v: true, why: 'That is the tradition of the Coptic Church.' }
  ], s: [[2, spanQ(LATE_SPANS.slice(9, 12))], [1, mapQ('upper', ['philae', 'nag-hammadi', 'karnak'], ['philae', 'nag-hammadi', 'karnak', 'abydos', 'dendera', 'edfu', 'elephantine', 'kom-ombo'], DESC)]] };
  G('hist.christian-egypt', function (R, ctx) { return run(R, ctx, D['christian-egypt']); });

  D['arab-conquest'] = { hint: 'The fortress guarded the head of the Delta.', f: [
    ['Who led the Arab armies that conquered Egypt?', 'Amr ibn al-As', ['Alexander the Great', 'Cambyses II', 'Justinian'], 'Amr entered Egypt in AD 639.'],
    ['Which fortress surrendered to Amr in AD 641?', 'Babylon, in today\'s Old Cairo', ['Buhen', 'Avaris', 'Semna'], 'Taking Babylon cut Upper Egypt off from the Byzantine forces in the Delta.'],
    ['How did the Byzantines give up Alexandria?', 'by treaty, after Babylon fell', ['after a great sea battle at Actium', 'they never gave it up', 'by selling it to Persia'], 'The garrison sailed away in AD 642.'],
    ['What new capital did Amr found beside Babylon?', 'Fustat, which grew into part of Cairo', ['Alexandria', 'Memphis', 'Pi-Ramesses'], 'Fustat stood at the strategic head of the Delta.'],
    ['Did Egyptians change language and religion at once?', 'no: Coptic and Christianity remained widespread for centuries', ['yes, within a year', 'yes, in AD 641 exactly', 'yes, because the conquerors banned Coptic'], 'The shift to Arabic and Islam was gradual.'],
    ['Which empire ruled Egypt just before the Arab conquest?', 'the Byzantine (Eastern Roman) Empire', ['the Persian Achaemenid Empire', 'the Ptolemies', 'the Ottoman Empire'], 'Egypt was ruled from Constantinople.', { lv: 2 }],
    ['Which power held Egypt for about ten years from AD 619?', 'Sasanian Persia', ['the Hittites', 'Assyria', 'Kush'], 'The Persians occupied Egypt during their long war with Byzantium.', { lv: 3 }],
    ['In which language does the Coptic Orthodox Church still worship?', 'Coptic', ['Hieroglyphic Egyptian', 'Akkadian', 'Latin'], 'Coptic is still the church\'s liturgical language.', { lv: 2 }]
  ], t: [
    { s: 'Arabic replaced Coptic as Egypt\'s everyday language within a year of the conquest.', v: false, why: 'The change took centuries.' },
    { s: 'The fortress of Babylon stood at the head of the Delta, near ancient Memphis.', v: true, why: 'It guarded the same strategic point that made Memphis the capital.' }
  ], s: [[1, mapQ('delta', ['babylon', 'alexandria', 'heliopolis'], ['babylon', 'alexandria', 'heliopolis', 'tanis', 'sais', 'bubastis', 'naukratis', 'avaris'], DESC)], [1, spanQ(LATE_SPANS.slice(7, 12))]] };
  G('hist.arab-conquest', function (R, ctx) { return run(R, ctx, D['arab-conquest']); });

  // ================================================================ Government, Society and Economy; Egypt and Its Neighbors

  D.kingship = { hint: 'Only two of the five names go in cartouches.', f: [
    ['What was the king believed to be?', 'Horus on earth and son of Ra, standing between the gods and the people', ['an ordinary man with no religious role', 'a Roman official', 'a priest elected by the people'], 'The office linked the world of the gods to the world of people.'],
    ['What is maat?', 'right order: truth, justice and balance, which the king had to keep', ['a kind of crown', 'the king\'s palace', 'a season of the year'], 'Keeping maat and defeating chaos was the king\'s central duty.'],
    ['How many names did a king have in the full royal titulary?', 'five', ['one', 'two', 'ten'], 'Horus, Two Ladies, Golden Horus, throne name and birth name.'],
    ['Which two of the king\'s names are written in cartouches?', 'the throne name and the birth name', ['the Horus name and the Two Ladies name', 'all five', 'none'], 'The throne name follows nsw-bjt; the birth name follows zꜣ-rꜥ.'],
    ['A cartouche follows the words zꜣ-rꜥ, "son of Ra". Which name is it?', 'the birth name', ['the throne name', 'the Horus name', 'the Golden Horus name'], 'zꜣ-rꜥ introduces the birth name (such as Ramesses).', { viz: { name: 'eg-glyphs', opts: { word: 'zara', quiet: true, interactive: false } } }],
    ['Where does the word "pharaoh" come from?', 'pr-ꜥꜣ, "Great House", the palace', ['a Greek word for king', 'the name of the first king', 'a Hebrew word for ruler'], 'From the New Kingdom on, "Great House" was used for the king himself.'],
    ['Could an Egyptian king be plotted against?', 'yes: the office was divine, but kings faced conspiracies and could fail', ['no, never', 'only after death', 'only in the Roman period'], 'Amenemhat I was murdered; palace plots under Pepi I and Ramesses III were tried in court.', { lv: 2 }],
    ['Which name was written in a serekh, a palace façade?', 'the Horus name', ['the birth name', 'the throne name', 'the Two Ladies name'], 'The Horus name is the oldest royal name, written in a serekh topped by the falcon.', { lv: 2 }],
    ['Ramesses II\'s throne name was User-maat-ra Setep-en-ra. Which title introduces it?', 'nsw-bjt, "King of Upper and Lower Egypt"', ['zꜣ-rꜥ, "son of Ra"', 'ḥm=f, "His Majesty"', 'pr-ꜥꜣ, "Great House"'], 'The throne name follows nsw-bjt; his birth name, Ramesses, follows zꜣ-rꜥ.', { lv: 3 }]
  ], t: [
    { s: 'The living king was seen as beyond any criticism or failure.', v: false, why: 'The office was divine, but the king could be criticized, plotted against, or fail.' },
    { s: 'In theory only the king could make offerings in every temple; priests acted in his name.', v: true, why: 'That is why the office of king was the hinge of the religious order.' }
  ], s: [[2, wordQ(['zara', 'nesubit', 'pharaoh', 'hemef', 'nesu'])], [1, cartoucheQ(['ramesses', 'khufu', 'tutankhamun', 'cleopatra', 'thutmose'])]] };
  G('hist.kingship', function (R, ctx) { return run(R, ctx, D.kingship); });

  D.administration = { hint: 'Writing and counting were the tools of the state.', f: [
    ['Who ran the government for the king?', 'the vizier', ['the high priest of Amun', 'the satrap', 'the viceroy of Kush'], 'The vizier heard cases, checked the treasury and granaries, and sent orders.'],
    ['How many viziers were there usually from the New Kingdom on?', 'two, one for the north and one for the south', ['one for each nome', 'none', 'one for each temple'], 'The office was divided between the two halves of the country.'],
    ['What did scribes and officials record?', 'land, harvests, herds, workers and taxes', ['only the king\'s dreams', 'only prayers', 'nothing; records were kept by memory'], 'Taxing grain required knowing how much there was.'],
    ['Where is the text called the Duties of the Vizier carved?', 'in the tomb of Rekhmire, vizier under Thutmose III', ['in the Great Pyramid', 'on the Rosetta Stone', 'at Abu Simbel'], 'It describes the vizier\'s daily work.'],
    ['Why were fields measured after each flood?', 'to set taxes on the harvest they could produce', ['to decide where to build pyramids', 'to count the fish in the canals', 'to choose the next king'], 'The flood changed field boundaries and decided how much land could be farmed.'],
    ['About how many Egyptians could read and write?', 'only a small minority', ['nearly everyone', 'about half', 'none at all'], 'Literacy was rare, which is one reason scribes held such power.', { lv: 2 }],
    ['What did a mayor or governor do in the provinces?', 'collected taxes and kept order locally', ['led every foreign war', 'served as high priest of every temple', 'wrote the king lists'], 'The local officials did the same work as the central ones, nearer the ground.', { lv: 2 }],
    ['A cattle count is written with two lotus plants, four coils, no hobbles and seven strokes. How many cattle?', '2,407', ['2,470', '247', '20,407'], 'Lotus 1,000; coil 100; hobble 10; stroke 1: 2,000 + 400 + 0 + 7 = 2,407.', { lv: 3 }]
  ], t: [
    { s: 'The king governed Egypt personally, without officials.', v: false, why: 'Most governing was done by trained officials, from the vizier down to village scribes.' },
    { s: 'Boys trained as scribes copied model letters and classic texts.', v: true, why: 'Schools attached to temples and offices taught by copying.' }
  ], s: [[4, numeralQ]] };
  G('hist.administration', function (R, ctx) { return run(R, ctx, D.administration); });

  D.economy = { hint: 'A price in deben tells you the value, not what changes hands.', f: [
    ['Did Egyptians use coins before the Late Period?', 'no: they traded goods, valued in deben of copper or in grain', ['yes, gold coins from the Old Kingdom on', 'yes, paper money', 'yes, silver coins from the time of Khufu'], 'Coins came only in the Late Period and came into everyday use under the Ptolemies.'],
    ['What was a deben?', 'a unit of weight used to value goods, about 91 g of copper in the New Kingdom', ['a gold coin', 'a sack of grain', 'a month of the year'], 'Goods were priced in deben, then paid for with other goods of the same value.'],
    ['How were state workers such as the tomb-builders paid?', 'in rations of grain, plus fish, vegetables, oil and firewood', ['in gold coins', 'in land only', 'they were not paid'], 'A workman at Deir el-Medina received about 4 khar of emmer and 1½ khar of barley a month.'],
    ['What was the khar?', 'a sack used to measure grain, about 77 liters', ['a coin', 'a copper weight', 'a boat'], 'Grain was measured and paid out in khar.'],
    ['What were emmer wheat and barley mainly used for?', 'bread and beer', ['paper and ink', 'linen cloth', 'building stone'], 'Emmer was baked into bread; barley was brewed into beer.'],
    ['Where were coins invented?', 'in Lydia and the Greek world, in the 7th century BC', ['in Egypt, under Khufu', 'in Rome, under Augustus', 'in Nubia, at Kerma'], 'Greek coins reached Egypt in the Late Period, mostly to be weighed as silver.', { lv: 2 }],
    ['What words appear on Egypt\'s first gold coins, of the 30th Dynasty?', 'nfr nbw, "good gold"', ['zꜣ-rꜥ, "son of Ra"', 'ḥtp-dj-nsw, "an offering the king gives"', 'pr-ꜥꜣ, "Great House"'], 'They were probably made to pay Greek soldiers.', { lv: 3, viz: { name: 'eg-glyphs', opts: { words: ['nfr', 'nebu'], quiet: true, interactive: false } } }],
    ['How many kite (qedet) made one deben?', '10', ['100', '2', '12'], 'A kite was one tenth of a deben, about 9 g.', { lv: 2 }]
  ], t: [
    { s: 'A price in deben means copper had to change hands.', v: false, why: 'The deben measured value; the buyer could pay with any goods of equal value.' },
    { s: 'When rations were late, workers could go hungry.', v: true, why: 'That is why the tomb-builders struck under Ramesses III.' }
  ], s: [[4, debenQ]] };
  G('hist.economy', function (R, ctx) { return run(R, ctx, D.economy); });

  D.people = { hint: 'Ranked, but not a land of slaves.', f: [
    ['What did most Egyptians do?', 'they were farmers', ['they were scribes', 'they were priests', 'they were soldiers'], 'Farmers were the great majority, working land of the state, temples or estates.'],
    ['How best to describe Egyptian society?', 'a ranked society, with the king at the top and farmers the majority', ['a land of equals', 'a land where nearly everyone was a slave', 'a society with no rulers'], 'A small literate, landed group lived off the surplus of many farmers.'],
    ['Who were most slaves in New Kingdom Egypt?', 'war captives given to temples, estates and officials', ['the pyramid builders', 'all farmers', 'the priests'], 'Campaigns brought captives back; slavery existed but did not build the pyramids.'],
    ['How did many priests serve?', 'part-time, in shifts, returning to ordinary life between turns', ['for life, never leaving the temple', 'only once a century', 'as soldiers in the army'], 'Priests served in rotating groups.'],
    ['Did slavery build the pyramids?', 'no: organized Egyptian crews built them', ['yes, entirely', 'yes, with Hyksos slaves', 'yes, with Roman slaves'], 'The workers\' town and tombs at Giza point to fed and housed crews.'],
    ['Could a farmer\'s son ever become a scribe?', 'sometimes: some texts praise men who rose by ability', ['never', 'always', 'only in the Roman period'], 'Ranks were steep but not completely closed.', { lv: 2 }],
    ['Which group could read and write?', 'a small group of scribes and officials', ['every farmer', 'everyone over ten', 'only foreigners'], 'Literacy was rare and opened the way to office.', { lv: 2 }],
    ['What does rmṯ, shown here, mean?', 'people', ['king', 'god', 'house'], 'rmṯ "people", with the determinatives of a man and a woman and the plural strokes.', { lv: 2, viz: { name: 'eg-glyphs', opts: { word: 'remetj', quiet: true, interactive: false } } }]
  ], t: [
    { s: 'Ancient Egypt was a land of equals with no ranks.', v: false, why: 'It was steeply ranked, from the king and officials down to farmers and servants.' },
    { s: 'Slaves in Egypt could sometimes own property and be freed.', v: true, why: 'Documents show slaves owning goods and being freed, especially in the New Kingdom.' }
  ] };
  G('hist.people', function (R, ctx) { return run(R, ctx, D.people); });

  D['deir-el-medina'] = { hint: 'Limestone flakes for writing lay everywhere in the village.', f: [
    ['Who lived at Deir el-Medina?', 'the craftsmen who cut and decorated the royal tombs', ['the pharaohs', 'the high priests of Amun', 'Roman soldiers'], 'The workmen of the Valley of the Kings lived there with their families.'],
    ['What are most of the writings from Deir el-Medina written on?', 'ostraca: flakes of limestone and pieces of pottery', ['clay tablets', 'gold sheets', 'temple walls only'], 'Thousands of ostraca survive, with papyri too.'],
    ['What was the ancient name of the village?', 'Set-maat, "the Place of Truth"', ['Akhetaten', 'Itjtawy', 'Pi-Ramesses'], 'The tomb-builders were called "servants in the Place of Truth".'],
    ['What do the work registers record?', 'who was absent and why, such as illness or brewing beer', ['the names of every king', 'the height of the flood', 'the stars'], 'The scribe tracked attendance closely.'],
    ['How was the crew organized?', 'in a "right side" and a "left side", each with a foreman, plus a scribe', ['as one big gang with no leaders', 'in Roman legions', 'by temple priests only'], 'The two sides worked under foremen, with a scribe of the tomb keeping records.'],
    ['About how long was the village lived in?', 'about 450 years, from early in the 18th Dynasty to the end of the 20th', ['about ten years', 'from the Old Kingdom to the Arab conquest', 'only under Akhenaten'], 'It was founded early in the 18th Dynasty and abandoned at the end of the 20th.', { lv: 2 }],
    ['Why are the villagers not typical Egyptians?', 'they were skilled, partly literate craftsmen paid by the state', ['they were foreign kings', 'they were all priests', 'they lived in the Roman period'], 'They tell us a great deal, but not about typical farmers.', { lv: 2 }],
    ['Which famous document from the village shows a woman controlling her property?', 'the will of Naunakhte', ['the Rosetta Stone', 'the Narmer Palette', 'the Annals of Thutmose III'], 'She left her property to the children who cared for her in old age.', { lv: 3 }]
  ], t: [
    { s: 'We know about ancient Egypt only from kings and priests.', v: false, why: 'Deir el-Medina gives the names, quarrels, debts and jokes of ordinary workers.' },
    { s: 'The workmen built their own tombs with small pyramids above the village.', v: true, why: 'Their fine tombs line the hillside.' }
  ], s: [[2, mapQ('thebes', ['deir-el-medina', 'kings', 'medinet-habu', 'karnak'], NK_SITES, DESC)], [1, debenQ]] };
  G('hist.deir-el-medina', function (R, ctx) { return run(R, ctx, D['deir-el-medina']); });

  D.women = { hint: 'Strong legal rights, limited public power.', f: [
    ['Which of these could Egyptian women do?', 'own and sell property, make contracts and go to court', ['nothing without a male guardian', 'only own jewelry', 'only inherit from their mothers'], 'Egyptian law treated a woman as a legal person in her own right.'],
    ['Who held most government offices?', 'men', ['women', 'priestesses only', 'foreign queens'], 'Few women held office, though some served as priestesses and a few as kings.'],
    ['What did Naunakhte\'s will do?', 'left her property to the children who had cared for her, and disinherited four who had not', ['gave everything to the king', 'freed all the slaves of Thebes', 'founded a temple'], 'The village court accepted her decision.'],
    ['What happened to a wife\'s property in marriage?', 'she kept a share of the joint property', ['it all went to her husband', 'it went to the king', 'it was destroyed'], 'Marriage was a private arrangement, and either side could end it.'],
    ['What did nbt pr mean, a common title for a married woman?', '"mistress of the house"', ['"queen of Egypt"', '"priestess of Amun"', '"daughter of Ra"'], 'nbt means "lady, mistress"; pr means "house".', { viz: { name: 'eg-glyphs', opts: { word: 'nebet', quiet: true, interactive: false } } }],
    ['How did Egyptian women\'s legal position compare with many ancient societies?', 'they had more legal rights than in many ancient societies', ['they had fewer rights than anywhere', 'they had exactly equal power with men', 'they had no rights at all'], 'In many societies a woman needed a male guardian; in Egypt she did not.', { lv: 2 }],
    ['Which of these women ruled Egypt as king?', 'Hatshepsut', ['Nefertari', 'Naunakhte', 'Tiye'], 'Hatshepsut, like Sobekneferu before her, took the titles of a king.', { lv: 2 }],
    ['Was Egypt a land of equality between men and women?', 'no: women had strong legal rights, but men held most offices and schooling', ['yes, completely', 'no, women had no rights', 'yes, women held most offices'], 'Avoid both mistakes: no rights, and full equality.', { lv: 3 }]
  ], t: [
    { s: 'Ancient Egyptian women had no legal rights.', v: false, why: 'They could own property, make contracts, go to court, inherit and leave wills.' },
    { s: 'Either a husband or a wife could end an Egyptian marriage.', v: true, why: 'Marriage was a private arrangement, and divorce was possible for both.' }
  ] };
  G('hist.women', function (R, ctx) { return run(R, ctx, D.women); });

  D.army = { hint: 'Horses and chariots arrived around the Second Intermediate Period.', f: [
    ['When did horses and chariots come into Egypt?', 'around the Second Intermediate Period', ['in the Old Kingdom, under Khufu', 'under the Romans', 'they never did'], 'They probably came from western Asia and transformed New Kingdom warfare.'],
    ['How was the Old Kingdom army raised?', 'as levies of men called up for a campaign or an expedition', ['as a standing professional army with chariots', 'from Greek mercenaries', 'from Roman legions'], 'Weni describes raising such levies.'],
    ['How many people rode in an Egyptian war chariot?', 'two: a driver and an archer', ['one', 'six', 'ten'], 'The light chariot carried a driver and an archer with a composite bow.'],
    ['How was the New Kingdom infantry organized at Kadesh?', 'in divisions named for gods', ['in Roman legions', 'by nome, with no names', 'by family'], 'Ramesses II\'s four divisions were named for Amun, Ra, Ptah and Seth.'],
    ['Who were the Medjay?', 'Nubian scouts and soldiers, later a kind of police', ['Hittite chariot drivers', 'priests of Amun', 'Greek mercenaries'], 'Medjay served Egypt from the Middle Kingdom on.', { lv: 2 }],
    ['Why did chariots require a full-time army?', 'they and their horses were expensive and needed skilled crews and constant training', ['they were made of gold', 'only kings could ride them', 'they could only be used in the flood season'], 'A state-paid standing army could keep them ready.', { lv: 2 }],
    ['Which foreign warriors from among the Sea Peoples served in the Egyptian army?', 'the Sherden', ['the Hyksos', 'the Romans', 'the Medes'], 'Sherden warriors appear as Egyptian troops in the 19th and 20th Dynasties.', { lv: 3 }],
    ['How were New Kingdom veterans often rewarded?', 'with land', ['with Roman citizenship', 'with coins', 'with nothing'], 'Land grants gave soldiers a stake in the state.', { lv: 3 }]
  ], t: [
    { s: 'Khufu\'s army fought from chariots.', v: false, why: 'Chariots arrived around the Second Intermediate Period, about a thousand years after Khufu.' },
    { s: 'In the Late Period, Greek and Carian mercenaries fought for Egypt.', v: true, why: 'The Saite kings relied on them.' }
  ], s: [[1, periodQ(['ok', 'mk', 'sip', 'nk'])]] };
  G('hist.army', function (R, ctx) { return run(R, ctx, D.army); });

  D.nubia = { hint: 'See Nubia\'s own kingdoms, not only Egypt\'s view of them.', f: [
    ['Which Nubian kingdoms had their own long history?', 'Kerma, Napata and Meroë', ['Mitanni, Hatti and Assyria', 'Memphis, Thebes and Sais', 'Byblos, Tyre and Sidon'], 'Each was a powerful kingdom with its own culture.'],
    ['Which came first?', 'Kerma', ['Napata', 'Meroë', 'all at once'], 'Kerma flourished in the Middle Kingdom and Second Intermediate Period; Napata and Meroë came later.'],
    ['What did Egypt want most from Nubia?', 'gold, plus ivory, ebony, incense and soldiers', ['tin and cedar', 'papyrus', 'horses'], 'Nubia\'s gold paid for temples, armies and diplomacy.'],
    ['Did Nubian kings ever rule Egypt?', 'yes: the Kushite kings of the 25th Dynasty', ['no, never', 'only under the Romans', 'only in the Old Kingdom'], 'Kings from Napata ruled from the Delta to the Fourth Cataract.'],
    ['What is special about Meroë?', 'its steep royal pyramids, iron working and its own script, Meroitic', ['it was the Hyksos capital', 'it was built by Alexander', 'it was a Greek trading town'], 'Meroitic can be read aloud, but the language is still only partly understood.'],
    ['Who was the "King\'s Son of Kush"?', 'the New Kingdom viceroy who governed Nubia', ['the son of Taharqo', 'a god of Kerma', 'a Roman prefect'], 'Egypt ruled Nubia directly in the New Kingdom.', { lv: 2 }],
    ['Which lion god was worshipped at Meroë?', 'Apedemak', ['Sekhmet', 'Bes', 'Seth'], 'Meroë honored both Egyptian and Nubian gods.', { lv: 3 }],
    ['Until about when did the kingdom of Kush last?', 'about the 4th century AD', ['the 4th century BC', 'the reign of Khufu', 'the Arab conquest of AD 641'], 'Kush outlasted the Ptolemies and much of Roman rule in Egypt.', { lv: 3 }]
  ], t: [
    { s: 'Nubia has a history of its own, not only as a part of Egypt\'s story.', v: true, why: 'Kerma, Napata and Meroë were powerful kingdoms with their own cultures.' },
    { s: 'The Meroitic language is fully understood today.', v: false, why: 'The script can be read aloud, but the language is still only partly understood.' }
  ], s: [[3, mapQ('nubia', ['kerma', 'napata', 'meroe', 'buhen', 'abu-simbel', 'nuri', 'semna'], ['kerma', 'napata', 'meroe', 'buhen', 'abu-simbel', 'nuri', 'semna', 'elephantine'], DESC)]] };
  G('hist.nubia', function (R, ctx) { return run(R, ctx, D.nubia); });

  D.levant = { hint: 'Egypt had grain and gold, but no good timber, silver or tin.', f: [
    ['What did Egypt get from Byblos for more than two thousand years?', 'cedar and other timber', ['gold', 'papyrus', 'grain'], 'Egypt had few tall trees; Byblos shipped cedar from the mountains behind it.'],
    ['Which great power fought Ramesses II at Kadesh and later made peace?', 'the Hittites', ['Mitanni', 'Persia', 'Rome'], 'The Hittites of Anatolia were Egypt\'s great rival in Syria.'],
    ['Which power sacked Thebes in 663 BC?', 'Assyria', ['Babylon', 'Persia', 'the Hittites'], 'Ashurbanipal\'s army drove out the Kushite kings and sacked Thebes.'],
    ['Which power conquered Egypt in 525 BC?', 'Persia', ['Assyria', 'Mitanni', 'Babylon'], 'Cambyses II conquered Egypt.'],
    ['With which kingdom did Amenhotep III exchange royal marriages?', 'Mitanni', ['Rome', 'Persia', 'Macedon'], 'Princesses of Mitanni married into the Egyptian royal family.'],
    ['Was Egypt cut off from the world by its deserts?', 'no: it was part of a busy world of trade and diplomacy', ['yes, completely', 'yes, until the Romans', 'yes, except for Nubia'], 'Roads crossed Sinai and ships sailed the coast.', { lv: 2 }],
    ['What was found at the Egyptian turquoise mines of Serabit el-Khadim in Sinai?', 'some of the earliest known alphabetic inscriptions', ['the Rosetta Stone', 'the tomb of Khufu', 'the Amarna letters'], 'Workers there left Proto-Sinaitic inscriptions.', { lv: 3 }],
    ['Which Levantine gods did Egyptians take up in the New Kingdom?', 'Baal and Astarte', ['Zeus and Hera', 'Marduk and Ishtar only', 'Jupiter and Mars'], 'Gods traveled along the trade routes too.', { lv: 3 }]
  ], t: [
    { s: 'Egypt had plenty of good timber of its own.', v: false, why: 'It had few tall trees; cedar came from Byblos.' },
    { s: 'Diplomats of the Late Bronze Age wrote to each other in Akkadian cuneiform.', v: true, why: 'The Amarna letters show Akkadian as the shared language of diplomacy.' }
  ], s: [[2, mapQ('levant', ['byblos', 'megiddo', 'kadesh', 'serabit'], ['byblos', 'megiddo', 'kadesh', 'serabit', 'avaris'], DESC)]] };
  G('hist.levant', function (R, ctx) { return run(R, ctx, D.levant); });

  D.bible = { hint: 'State the positions and the evidence; don\'t pick a side.', f: [
    ['Which is the earliest mention of Israel outside the Bible?', 'the Merneptah Stela (c. 1208 BC)', ['the Rosetta Stone', 'the Narmer Palette', 'the Turin King List'], 'It lists Israel among peoples in Canaan.'],
    ['Does any Egyptian text name Joseph, Moses or the Exodus?', 'no', ['yes, the Abydos King List', 'yes, the Annals of Thutmose III', 'yes, the Turin King List'], 'The questions are debated because no Egyptian source mentions them.'],
    ['With which Egyptian king do many scholars identify the biblical Shishak?', 'Shoshenq I, of the 22nd Dynasty', ['Khufu', 'Ramesses II', 'Ptolemy I'], 'His Karnak relief lists towns his army took in Canaan; some scholars doubt the match.'],
    ['What is the best description of scholarship on the Exodus?', 'scholars debate whether and when it happened, and weigh the evidence differently', ['archaeology has proved it in every detail', 'all scholars agree it never happened', 'Egyptian records describe it in full'], 'Positions range from a historical core to a later story of origins.'],
    ['How is Israel written on the Merneptah Stela?', 'with the sign for a people, not for a land', ['in a cartouche', 'in Greek letters', 'with the sign for a city'], 'The stela names Israel as a people in Canaan.', { lv: 2 }],
    ['Why do some scholars doubt the Shishak–Shoshenq I match?', 'Jerusalem is not clearly named in the surviving list of his campaign', ['Shoshenq I never existed', 'the Bible does not mention Shishak', 'Shoshenq I ruled Persia'], 'The identification is widely held but not certain.', { lv: 2 }],
    ['Why is the date of the Exodus debated?', 'biblical figures point to different centuries, and Egyptian sources are silent', ['because Egyptian records give two dates', 'because it happened twice', 'because the Merneptah Stela gives the date'], 'Some prefer the 13th century BC, some the 15th, and many doubt it can be dated.', { lv: 3 }],
    ['What do some scholars argue about the Egyptian names in the Joseph story?', 'they fit a much later time than the story\'s setting', ['they are written in hieroglyphs in Genesis', 'they are names of Ptolemaic kings', 'they prove the story is from the Old Kingdom'], 'Others think the story keeps older memories; the question remains open.', { lv: 3 }]
  ], t: [
    { s: 'Scholars agree that archaeology has proved the Exodus happened under Ramesses II.', v: false, why: 'No Egyptian source mentions the Exodus; scholars propose different dates or doubt a historical event.' },
    { s: 'A stela with Shoshenq I\'s name was found at Megiddo.', v: true, why: 'A fragment of his stela was found there, matching his campaign into Canaan.' }
  ] };
  G('hist.bible', function (R, ctx) { return run(R, ctx, D.bible); });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
