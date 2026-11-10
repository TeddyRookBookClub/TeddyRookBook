/* Life Planner: the New Year's resolution builder (/life-planner/resolution/, or /life-planner/#resolution).
   Three steps: pick goals, set the schedule, see the 365-day plan. The pacing is lp-resolve.js; the schedule, summary,
   print and calendar come from lp.js (window.LPApp). Saving replaces the Life Planner plan or adds the goals to it, and
   keeps the resolution (st.res: title, goals, pace, milestones and the draft it came from) for the PDF cover page and
   for moving the finish date later. The draft being worked on is kept in 'trb-resdraft-v1' (per learner). */
(function (W, D) {
  'use strict';
  var A = W.LPApp, R = W.LPResolve, C = W.LPCore, box = D.getElementById('lp-res');
  if (!A || !R || !C || !box) return;
  var CFG = A.CFG, esc = A.esc, fm = A.fm, fd = A.fd, DK = 'trb-resdraft-v1';
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  function load(k) { try { return JSON.parse(W.localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function store(k, o) { try { W.localStorage.setItem(k, JSON.stringify(o)); } catch (e) { } }
  var Y1 = C.ymd(A.TODAY).y + (C.ymd(A.TODAY).m === 1 && C.ymd(A.TODAY).d <= 7 ? 0 : 1);
  var dr = load(DK);
  if (!dr || typeof dr !== 'object' || !dr.goals) dr = { goals: {}, days: [0, 1, 2, 3, 4, 5, 6], start: Y1 + '-01-01', mins: 45, off: [], step: 1 };
  var step = dr.step || 1, built = null, prev = null;
  function save() { dr.step = step; store(DK, dr); }

  // which goals the site can offer (their data is in this build)
  function available(G) {
    var u = CFG.urls;
    if (G.key === 'bible') return !!u.bible; if (G.key === 'gb') return !!u.gb; if (G.key === 'ladder') return CFG.courses.length > 0;
    if (G.key === 'trade') return CFG.trades.length > 0 && !!u.trades; if (G.key === 'cook') return !!u.meals;
    if (G.key === 'memory' || G.key === 'latin' || G.key === 'asl' || G.key === 'lepanto') return !!u.extra;
    if (G.key === 'trla' || G.key === 'trgr') return !!u.tr;
    return true;
  }
  var GOALS = R.GOALS.filter(available);
  function env() { return { D: A.DATA, P: A.P, courses: CFG.courses, trades: CFG.trades, trGoals: CFG.trGoals, lib: CFG.lib, colors: A.COLORS, mk: A.mk, fromLib: A.fromLib, log: log }; }
  function log() { try { console.error.apply(console, arguments); } catch (e) { } }
  function on() { return GOALS.filter(function (G) { return dr.goals[G.key] && dr.goals[G.key].on; }); }
  function g(key) { return R.opts(dr, key); }

  /* Build the plan once the goals' data is here. If a file is slow (2.5 s) or fails, build anyway: those goals get a rough
     estimate (lp-resolve.js), and when the file does arrive the plan is built again. A failure is logged, never thrown. */
  var buildNo = 0;
  function rebuild(cb) {
    var my = ++buildNo, done = false;
    function make(final) {
      if (my !== buildNo || (done && !final)) return;
      try {
        built = R.build(dr, env()); built.state.res = resInfo(built); prev = A.preview(built.state);
      } catch (e) { log('Life Planner: the resolution plan couldn’t be built:', e); return; }
      done = true; if (cb) cb();
    }
    var t = setTimeout(function () { make(false); }, 2500);
    try { A.load(R.needs(dr), function () { clearTimeout(t); make(true); }); } catch (e) { log('Life Planner:', e); clearTimeout(t); make(true); }
  }
  function resInfo(b) {
    var y = C.ymd(b.range[0]);
    return { title: 'My resolution for ' + (y.m === 12 && y.d > 1 ? y.y + 1 : y.y), goals: b.goals.map(function (x) { return { key: x.key, icon: x.icon, title: x.title, pace: x.pace }; }),
      daysText: R.daysText(dr.days), mins: dr.check ? +dr.mins || 45 : 0, draft: JSON.parse(JSON.stringify(dr)), made: C.isoOf(A.TODAY) };
  }
  function weeksIn() { return (built.range[1] - built.range[0] + 1) / 7; }
  // a goal's minutes for the year, and its number of sessions (a rough goal: spread over every session day)
  function yearOf(x) {
    if (x.rough) return { m: x.yr, n: 0 };
    var S = prev.S, m = 0, n = 0; x.ids.forEach(function (id) { (S.items[id] || []).forEach(function (it) { m += it.mins; n++; }); }); return { m: m, n: n };
  }
  function weekMins(x) { return yearOf(x).m / weeksIn(); }

  // ---------- frame ----------
  box.innerHTML = '<section class="hs-sec lp-resw" aria-labelledby="lp-res-h"><h2 id="lp-res-h" class="lp-sr">Resolution builder</h2>' +
    '<ol class="lp-rsteps" id="lp-rsteps"></ol><div id="lp-rbody"></div></section>';
  function renderSteps() {
    $('#lp-rsteps').innerHTML = [['Pick your goals', 1], ['Your days', 2], ['Your plan', 3]].map(function (x) {
      return '<li><button type="button" class="lp-rstep" data-step="' + x[1] + '"' + (step === x[1] ? ' aria-current="step"' : '') + (x[1] > 1 && !on().length ? ' disabled' : '') + '><span>' + x[1] + '</span> ' + x[0] + '</button></li>';
    }).join('');
  }
  $('#lp-rsteps').addEventListener('click', function (e) { var b = e.target.closest('[data-step]'); if (b && !b.disabled) go(+b.dataset.step); });
  function go(n) { step = n; save(); render(); var h = $('#lp-rbody h3'); box.scrollIntoView({ block: 'start' }); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }

  // ---------- step 1: goals ----------
  function field(G) {
    var o = g(G.key), k = G.key;
    switch (k) {
      case 'bible':
        // the two Bibles as equal choices, each with its own time
        var Nb = R.sessions(dr).length || 1, bt = function (v) { var B = A.DATA.bible && A.DATA.bible[v], m = 0; if (B) B.forEach(function (d) { m += d[1]; }); else m = R.rough('bible', { ver: v }); return m; };
        return '<fieldset class="lp-seg lp-wide"><legend>Which Bible?</legend>' + [['73', '73 books (Catholic)'], ['66', '66 books (most Protestant)']].map(function (x) {
          var m = bt(x[0]); return '<label><input type="radio" name="lp-bver" data-g="bible" data-f="ver" value="' + x[0] + '"' + ((o.ver === '66' ? '66' : '73') === x[0] ? ' checked' : '') + '><span><b>' + x[1] + '</b><small>about ' + fm(m / Nb) + ' a session · ' + Math.round(m / 60) + ' h in the year</small></span></label>';
        }).join('') + '</fieldset><label class="lp-chk"><input type="checkbox" data-g="bible" data-f="next"' + (o.next ? ' checked' : '') + '> Start at my next unread day</label>' +
          '<p class="hs-small lp-wide">Follows <a href="' + esc(CFG.base) + 'bible-in-a-year/">Bible in a Year</a>; ticks there and here are shared.</p>';
      case 'gb': return '<label>Goal <select data-g="gb" data-f="mode"><option value="rungs"' + (o.mode !== 'mins' ? ' selected' : '') + '>a number of rungs</option><option value="mins"' + (o.mode === 'mins' ? ' selected' : '') + '>minutes a session</option></select></label>' +
        (o.mode === 'mins' ? '<label>Minutes <input type="number" min="5" max="120" step="5" data-g="gb" data-f="mins" value="' + o.mins + '"></label>' : '<label>Rungs <input type="number" min="1" max="191" data-g="gb" data-f="n" value="' + o.n + '"></label>');
      case 'ladder':
        var groups = {}; CFG.courses.forEach(function (c) { (groups[c.lt] = groups[c.lt] || []).push(c); });
        return '<label class="lp-wide">Course <select data-g="ladder" data-f="c">' + Object.keys(groups).map(function (gn) { return '<optgroup label="' + esc(gn) + '">' + groups[gn].map(function (c) { var v = c.l + '|' + c.k; return '<option value="' + esc(v) + '"' + (o.c === v ? ' selected' : '') + '>' + esc(c.t) + ' (' + c.n + ' lessons)</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></label>' +
          '<label>Lessons (blank = the whole course) <input type="number" min="1" max="999" data-g="ladder" data-f="n" value="' + (o.n || '') + '"></label>';
      case 'trade': return '<label class="lp-wide">Course <select data-g="trade" data-f="tr">' + CFG.trades.map(function (t) { return '<option value="' + esc(t.k) + '"' + (o.tr === t.k ? ' selected' : '') + '>' + esc(t.t) + ' (' + t.n + ' lessons)</option>'; }).join('') + '</select></label>';
      case 'cook': return '<label>Recipes <input type="number" min="1" max="156" data-g="cook" data-f="n" value="' + o.n + '"></label>';
      case 'walk': return '<label>Miles <input type="number" min="10" max="3000" step="10" data-g="walk" data-f="n" value="' + o.n + '"></label>';
      case 'memory': return '<label>Lists <input type="number" min="1" max="43" data-g="memory" data-f="n" value="' + o.n + '"></label>';
      case 'lepanto': return '<label>Lines a week <input type="number" min="1" max="30" data-g="lepanto" data-f="n" value="' + o.n + '"></label><p class="hs-small lp-wide"><a href="' + esc(CFG.base) + 'memory/challenges/lepanto/">About the Lepanto challenge</a></p>';
      case 'trla': case 'trgr':
        var la = k === 'trla' ? 'lat' : 'grc', TRk = Object.keys(R.TR).filter(function (w) { return R.TR[w][0] === la; }), mo = +o.mo || 0, usual = (R.TR[o.w] || R.TR[TRk[0]])[2];
        return '<label class="lp-wide">Work <select data-g="' + k + '" data-f="w">' + TRk.map(function (w) { return '<option value="' + w + '"' + (o.w === w ? ' selected' : '') + '>' + esc(R.TR[w][1].replace(/^Translate /, '')) + '</option>'; }).join('') + '</select></label>' +
          '<label>Finish in <select data-g="' + k + '" data-f="mo"><option value="0"' + (!mo ? ' selected' : '') + '>the usual time (' + usual + (usual === 1 ? ' month' : ' months') + ')</option>' + [1, 2, 3, 4, 6, 9, 12].map(function (m) { return '<option value="' + m + '"' + (mo === m ? ' selected' : '') + '>' + m + (m === 1 ? ' month' : ' months') + '</option>'; }).join('') + '</select></label>' +
          '<p class="hs-small lp-wide">Needs a first-year grammar first. <a href="' + esc(CFG.base) + 'languages/translate/">About Translate in a Year</a></p>';
      case 'books':
        var Nr = R.sessions(dr).length || 1, rpl = R.readPlan(o, Nr, (R.range(dr)[1] - R.range(dr)[0] + 1) / 7), pgm = o.mode === 'pages';
        return '<fieldset class="lp-seg lp-wide"><legend>Count it in</legend><label><input type="radio" name="lp-rbm" data-g="books" data-f="mode" value="books"' + (pgm ? '' : ' checked') + '><span><b>Books</b></span></label><label><input type="radio" name="lp-rbm" data-g="books" data-f="mode" value="pages"' + (pgm ? ' checked' : '') + '><span><b>Pages</b></span></label></fieldset>' +
          (pgm ? '<label>Pages in all <input type="number" min="1" max="1000000" step="50" data-g="books" data-f="pages" value="' + (+o.pages || 0) + '"></label>'
            : '<label>Books <input type="number" min="1" max="1000" data-g="books" data-f="n" value="' + (+o.n || 0) + '"></label><label>Pages in a book, about <input type="number" min="20" max="5000" step="10" data-g="books" data-f="ppb" value="' + (+o.ppb || 300) + '"></label>') +
          '<label>Pages an hour <input type="number" min="5" max="300" step="5" data-g="books" data-f="pph" value="' + (+o.pph || 40) + '"></label>' +
          '<p class="hs-small lp-wide">Reading speeds vary a lot: about 30 pages an hour for dense nonfiction, 40 to 60 for an easy novel. 40 is set to start.</p>' +
          (rpl ? '<p class="hs-small lp-wide">' + rpl.total.toLocaleString('en-US') + ' pages: about ' + rpl.pps + ' a session, ' + fm(rpl.mps) + ' a session, ' + fm(rpl.wk) + ' a week, ' + Math.round(rpl.hours) + ' hours in the year' + (rpl.n ? '; about one book every ' + (rpl.every >= 10 ? Math.round(rpl.every) : Math.round(rpl.every * 10) / 10) + ' weeks' : '') + '.</p>' : '<p class="hs-small lp-wide">Enter a number above zero.</p>') +
          (pgm ? '' : '<label class="lp-wide">Book titles, one a line (optional, to see your progress book by book) <textarea rows="3" data-g="books" data-f="titles" placeholder="The Hobbit">' + esc(o.titles || '') + '</textarea></label>') +
          '<p class="hs-small lp-wide">Ideas: <a href="' + esc(CFG.base) + 'books/">the Library</a> and <a href="' + esc(CFG.base) + 'free-books/">Free Books</a>.</p>';
      case 'custom': return '<label class="lp-wide">Goal <input type="text" maxlength="60" data-g="custom" data-f="name" placeholder="Practice guitar" value="' + esc(o.name) + '"></label><label>Total <input type="number" min="1" max="100000" data-g="custom" data-f="amount" value="' + o.amount + '"></label>' +
        '<label>Unit <input type="text" maxlength="20" data-g="custom" data-f="unit" value="' + esc(o.unit) + '"></label><label>Minutes for each one <input type="number" min="1" max="600" data-g="custom" data-f="mpu" value="' + o.mpu + '"></label>';
    }
    return '';
  }
  function step1() {
    var h = '<h3>What would you like to get done this year?</h3><p class="hs-small">Pick one to three to start. A smaller goal you keep beats a big one you drop, and you can add more later. Each card says what finishing means, and the box at the bottom adds up the time as you pick.</p><div class="lp-goals">';
    GOALS.forEach(function (G) {
      var o = dr.goals[G.key] || {}, gid = 'lp-g-' + G.key, b = built && built.goals.filter(function (x) { return x.key === G.key; })[0];
      h += '<div class="lp-goal' + (o.on ? ' on' : '') + '"><label class="lp-gtop" for="' + gid + '"><input type="checkbox" id="' + gid + '" data-goal="' + G.key + '"' + (o.on ? ' checked' : '') + '><span class="lp-gic" aria-hidden="true">' + G.icon + '</span><b>' + esc(G.card || G.title(g(G.key), env())) + '</b></label>' +
        '<p>' + esc(G.finish) + '</p>' + (o.on ? '<div class="lp-gopts">' + field(G) + '</div>' + (b && prev ? '<p class="lp-gcost' + (b.rough ? ' rough' : '') + '">⏱ ' + (b.rough ? 'Rough: about ' : 'About ') + fm(weekMins(b)) + ' a week. ' + esc(b.pace) + '</p>' : '<p class="lp-gcost">⏱ Adding up the time…</p>') : '') + '</div>';
    });
    h += '</div><div class="lp-rnav"><button type="button" class="hs-btn pri" data-go="2"' + (on().length ? '' : ' disabled') + '>Next: your days →</button>' + (on().length ? '<button type="button" class="hs-btn ghost" data-go="3">See my plan</button>' : ' <span class="hs-small">Pick at least one goal.</span>') + '</div>';
    return h + totals();
  }

  /* The running total: a box that sticks to the bottom of the screen while the cards scroll. Each goal's minutes a week,
     minutes a session on the chosen days and hours in the year, and all of them together. */
  function totals() {
    var list = on();
    if (!list.length) return '<div class="lp-rtotal" role="status" aria-live="polite"><p class="lp-rt-sum">Pick a goal to see the time it takes.</p></div>';
    if (!built || !prev) return '<div class="lp-rtotal" role="status" aria-live="polite"><p class="lp-rt-sum">Adding up the time…</p></div>';
    var wk = 0, yr = 0, rough = false, rows = '';
    built.goals.forEach(function (x) {
      var y = yearOf(x); wk += y.m / weeksIn(); yr += y.m; rough = rough || !!x.rough;
      rows += '<tr><th scope="row"><span aria-hidden="true">' + x.icon + '</span> ' + esc(x.title) + (x.rough ? ' <small>(rough)</small>' : '') + '</th><td>' + fm(y.m / weeksIn()) + '</td><td>' + (y.n ? fm(y.m / y.n) : '–') + '</td><td>' + Math.round(y.m / 60) + ' h</td></tr>';
    });
    var per = yr / Math.max(1, built.sessions.length);
    return '<div class="lp-rtotal" role="status" aria-live="polite"><details' + (openTotals ? ' open' : '') + ' id="lp-rtd"><summary><span class="lp-rt-sum"><b>' + fm(wk) + '</b> a week · about <b>' + fm(per) + '</b> a session day · <b>' + Math.round(yr / 60) + ' h</b> in the year' + (rough ? ' · rough' : '') + '</span><span class="lp-rt-more">Per goal</span></summary>' +
      '<p class="hs-small">On ' + esc(R.daysText(dr.days)) + ' (' + built.sessions.length + ' session days). Change the days in step 2.</p>' +
      '<div class="lp-rt-wrap"><table class="lp-rt"><thead><tr><th scope="col">Goal</th><th scope="col">A week</th><th scope="col">A session</th><th scope="col">The year</th></tr></thead><tbody>' + rows + '</tbody></table></div></details></div>';
  }
  var openTotals = false;
  box.addEventListener('toggle', function (e) { if (e.target.id === 'lp-rtd') openTotals = e.target.open; }, true);

  // ---------- step 2: schedule ----------
  var PRESETS = [['7', [0, 1, 2, 3, 4, 5, 6], '7 days a week'], ['6', [1, 2, 3, 4, 5, 6], '6 days (Monday to Saturday)'], ['5', [1, 2, 3, 4, 5], '5 days (weekdays)'], ['3', [1, 3, 5], '3 days (Monday, Wednesday, Friday)']];
  function presetOf() { var d = dr.days.slice().sort().join(','); for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i][1].join(',') === d) return PRESETS[i][0]; return 'pick'; }
  function step2() {
    var p = presetOf(), h = '<h3>Which days?</h3><div class="lp-form2">';
    h += '<fieldset><legend>Days a week</legend>' + PRESETS.map(function (x) { return '<label class="lp-chk"><input type="radio" name="lp-dpw" value="' + x[0] + '"' + (p === x[0] ? ' checked' : '') + '> ' + x[2] + '</label>'; }).join('') +
      '<label class="lp-chk"><input type="radio" name="lp-dpw" value="pick"' + (p === 'pick' ? ' checked' : '') + '> Pick the days:</label><div class="lp-dows">' + [1, 2, 3, 4, 5, 6, 0].map(function (d) { return '<label><input type="checkbox" class="lp-rday" value="' + d + '"' + (dr.days.indexOf(d) >= 0 ? ' checked' : '') + '> ' + C.DOWS[d] + '</label>'; }).join('') + '</div></fieldset>';
    h += '<fieldset><legend>Start</legend><label>Start date <input type="date" id="lp-rstart" value="' + esc(dr.start) + '"></label><p class="hs-small">The plan runs 365 days from here. January 1 is set to start; any day works.</p></fieldset>';
    h += '<fieldset><legend>Check it against my free time (optional)</legend><p class="hs-small">The plan works from the time your goals take. If you like, say how much time you have, and it will tell you whether it fits.</p>' +
      '<label class="lp-chk"><input type="checkbox" id="lp-rcheck"' + (dr.check ? ' checked' : '') + '> Check it against my free time</label>' +
      '<label' + (dr.check ? '' : ' hidden') + ' id="lp-rminsl">Minutes free on each of those days <input type="number" id="lp-rmins" min="5" max="600" step="5" value="' + (+dr.mins || 45) + '"></label></fieldset>';
    h += '<fieldset><legend>Days off and vacations</legend><ul class="lp-offs">' + (dr.off.length ? dr.off.map(function (o, i) { return '<li>' + esc(fd(C.dnOf(o.from), { month: 'short', day: 'numeric', year: 'numeric' })) + (o.to && o.to !== o.from ? ' – ' + esc(fd(C.dnOf(o.to), { month: 'short', day: 'numeric', year: 'numeric' })) : '') + (o.label ? ': ' + esc(o.label) : '') + ' <button type="button" class="hs-btn ghost" data-roff="' + i + '" aria-label="Remove these days off">✕</button></li>'; }).join('') : '<li class="hs-small">None yet. The pace works around any you add.</li>') + '</ul>' +
      '<div class="lp-offadd"><label>From <input type="date" id="lp-roff-from"></label><label>To <input type="date" id="lp-roff-to"></label><label>Note <input type="text" id="lp-roff-label" maxlength="40" placeholder="Vacation"></label><button type="button" class="hs-btn" id="lp-roff-add">Add days off</button></div></fieldset></div>';
    h += '<div class="lp-rnav"><button type="button" class="hs-btn ghost" data-go="1">← Goals</button><button type="button" class="hs-btn pri" data-go="3">See my plan →</button></div>';
    return h + totals();
  }

  // ---------- step 3: the plan ----------
  function milestones(b, st) {
    var a = b.range[0], qs = [a + 90, a + 181, a + 272, b.range[1]];
    return A.withState(st, function () {
      return qs.map(function (q) {
        var sm = A.summary(a, q), lines = [];
        b.goals.forEach(function (gl) {
          var r = sm.per.filter(function (x) { return x.track.id === gl.ids[0]; })[0]; if (!r || !r.text.length) return;
          lines.push(gl.icon + ' ' + (gl.key === 'chores' ? 'The house kept on schedule: ' + sm.per.filter(function (x) { return gl.ids.indexOf(x.track.id) >= 0; }).reduce(function (s, x) { return s + x.n; }, 0) + ' chores done' : gl.key === 'walk' && r.text[1] ? r.text[1].replace(/ at about.*/, ' walked') : r.text[0]));
        });
        return { when: 'By ' + fd(q, { month: 'long', day: 'numeric' }), lines: lines };
      });
    });
  }
  function step3() {
    var b = built, S = prev.S, st = b.state, avail = (+dr.mins || 45) * b.dpw, need = 0, h = '', yr = 0, peak = 0;
    b.goals.forEach(function (x) { x.wk = weekMins(x); need += x.wk; yr += yearOf(x).m; });
    S.days.forEach(function (d) { if (d.load > peak) peak = d.load; });
    var over = S.days.filter(function (d) { return d.over && d.load; }), overW = S.weeks.filter(function (w) { return w.over; }).length;
    st.res.milestones = milestones(b, st);
    h += '<h3>' + esc(st.res.title) + '</h3><p class="lp-rlead">' + esc(fd(b.range[0], { month: 'long', day: 'numeric', year: 'numeric' })) + ' to ' + esc(fd(b.range[1], { month: 'long', day: 'numeric', year: 'numeric' })) + ' · ' + esc(R.daysText(dr.days)) + ' · ' + b.sessions.length + ' session days' + (dr.check ? ' · up to ' + fm(+dr.mins || 45) + ' a day' : '') + '</p>';
    h += '<ul class="lp-rgoals">' + b.goals.map(function (x) { return '<li><span class="lp-gic" aria-hidden="true">' + x.icon + '</span><span><b>' + esc(x.title) + '</b><small>' + esc(x.pace) + '</small></span><span class="lp-num">' + (x.rough ? 'rough: ' : '') + fm(x.wk) + ' a week</span></li>'; }).join('') + '</ul>';
    if (b.goals.some(function (x) { return x.rough; })) h += '<p class="lp-rwarn">Some of the planner’s data didn’t load, so goals marked “rough” have an estimate only and aren’t in the plan yet. Reload the page to add them.</p>';
    h += '<p class="lp-rfit">All together: about <b>' + fm(need) + ' a week</b>' + (dr.check ? ', of the ' + fm(avail) + ' you have' : ', about ' + fm(yr / Math.max(1, b.sessions.length)) + ' on a session day (the busiest day: ' + fm(peak) + '), ' + Math.round(yr / 60) + ' hours in the year') + '.</p>';
    if (!dr.check) h += '<div class="lp-rcheck"><p><b>Check it against my free time</b> (optional)</p><div class="hs-actions"><label class="lp-inl">Minutes free on a session day <input type="number" id="lp-rmins3" min="5" max="600" step="5" value="' + (+dr.mins || 45) + '"></label><button type="button" class="hs-btn" id="lp-rcheck3">Check</button></div></div>';
    if (dr.check && over.length) {
      var big = b.goals.slice().sort(function (p, q) { return q.wk - p.wk; })[0], peak = 0; over.forEach(function (d) { peak = Math.max(peak, d.load - d.cap); });
      var add = Math.ceil(Math.max(need / b.dpw - (+dr.mins || 45), Math.min(peak, 30)) / 5) * 5;
      h += '<div class="lp-rwarn" role="note"><p><b>This is more than your time on ' + over.length + ' day' + (over.length === 1 ? '' : 's') + (overW ? ' (' + overW + ' week' + (overW === 1 ? '' : 's') + ')' : '') + '.</b> That’s easy to fix. Pick one:</p><div class="hs-actions">' +
        '<button type="button" class="hs-btn" data-fix="mins" data-v="' + ((+dr.mins || 45) + Math.max(5, add)) + '">Give it ' + fm((+dr.mins || 45) + Math.max(5, add)) + ' a day</button>' +
        (b.goals.length > 1 ? '<button type="button" class="hs-btn" data-fix="drop" data-v="' + big.key + '">Leave out “' + esc(big.title) + '” for now</button>' : '') +
        (smaller(big.key) ? '<button type="button" class="hs-btn" data-fix="small" data-v="' + big.key + '">' + esc(smaller(big.key).text) + '</button>' : '') +
        (b.dpw < 7 ? '<button type="button" class="hs-btn" data-fix="days">Spread it over 7 days</button>' : '') + '</div></div>';
    } else if (dr.check) h += '<p class="lp-rok">✓ It fits your time every day. <button type="button" class="hs-btn ghost" id="lp-runcheck">Stop checking</button></p>';
    h += '<h4>Milestones</h4><table class="lp-ms"><tbody>' + st.res.milestones.map(function (m) { return '<tr><th scope="row">' + esc(m.when) + '</th><td>' + m.lines.map(esc).join('<br>') + '</td></tr>'; }).join('') + '</tbody></table>';
    h += '<h4>If you stick to it</h4>' + A.withState(st, function (S2) { return A.sumHTML(S2.from, S2.to); });
    h += '<div class="hs-note lp-rkind"><p><b>Missed a day?</b> It happens. The plan doesn’t move: tick the session when you get to it, or spread a few over the next week. If life gets busy, “move the finish date” on the planner adds a week and re-paces everything, and you can make any goal smaller.</p></div>';
    var cur = A.get(), hasPlan = cur && cur.tracks && cur.tracks.length && !cur.starter;
    h += '<div class="lp-rsave"><h4>Make it your plan</h4>' + (hasPlan ? '<p class="hs-small">You already have a Life Planner plan. Replace it with this one, or add these goals to it? (Adding keeps your tracks and time settings, and sets the plan’s dates to this year.)</p>' : '') +
      '<div class="hs-actions"><button type="button" class="hs-btn pri" id="lp-rsave" data-mode="replace">' + (hasPlan ? 'Replace my plan with this' : 'Save as my Life Planner plan') + '</button>' + (hasPlan ? '<button type="button" class="hs-btn" id="lp-rmerge" data-mode="merge">Add these goals to my plan</button>' : '') + '</div>' +
      '<div class="hs-actions"><button type="button" class="hs-btn" id="lp-rprint">🖨 Print or save as PDF</button><button type="button" class="hs-btn" id="lp-rics">📅 Calendar file</button><label class="lp-inl">Events <select id="lp-rics-mode"><option value="each">one for each session</option><option value="daily">one a day</option></select></label></div>' +
      '<p class="hs-small">The PDF starts with a cover page for your resolution, then a calendar page for each month.</p></div>';
    h += '<div class="lp-rnav"><button type="button" class="hs-btn ghost" data-go="2">← Your days</button><button type="button" class="hs-btn ghost" data-go="1">← Goals</button></div>';
    return h;
  }
  // a gentler target for a goal, when it has one
  function smaller(key) {
    var o = g(key);
    if (key === 'gb' && o.mode !== 'mins' && o.n > 12) return { text: 'Aim for ' + Math.ceil(o.n / 2) + ' rungs', apply: function () { dr.goals.gb.n = Math.ceil(o.n / 2); } };
    if (key === 'gb' && o.mode === 'mins' && o.mins > 10) return { text: 'Read ' + (o.mins - 5) + ' minutes a session', apply: function () { dr.goals.gb.mins = o.mins - 5; } };
    if (key === 'ladder') { var c = built.goals.filter(function (x) { return x.key === 'ladder'; })[0], t = (built.state.tracks.filter(function (x) { return x.id === 'r-ladder-0'; })[0] || {}).opt; if (t && t.n > 10) return { text: 'Aim for ' + Math.ceil(t.n / 2) + ' lessons of the course', apply: function () { dr.goals.ladder.n = Math.ceil(t.n / 2); } }; }
    if (key === 'cook' && o.n > 6) return { text: 'Aim for ' + Math.ceil(o.n / 2) + ' recipes', apply: function () { dr.goals.cook.n = Math.ceil(o.n / 2); } };
    if (key === 'walk' && o.n > 50) return { text: 'Aim for ' + Math.round(o.n * 0.6 / 10) * 10 + ' miles', apply: function () { dr.goals.walk.n = Math.round(o.n * 0.6 / 10) * 10; } };
    if (key === 'memory' && o.n > 3) return { text: 'Aim for ' + Math.ceil(o.n / 2) + ' lists', apply: function () { dr.goals.memory.n = Math.ceil(o.n / 2); } };
    if ((key === 'trla' || key === 'trgr') && (o.w === 'aeneid' || o.w === 'iliad')) { var sm = o.w === 'aeneid' ? 'aeneid6' : 'iliad1'; return { text: 'Aim for ' + R.TR[sm][1].replace(/^Translate /, ''), apply: function () { dr.goals[key].w = sm; dr.goals[key].mo = 0; } }; }
    if ((key === 'trla' || key === 'trgr') && (+o.mo || R.TR[o.w][2]) < 12) return { text: 'Take the whole year for it', apply: function () { dr.goals[key].mo = 12; } };
    if (key === 'books' && o.mode !== 'pages' && o.n > 2) return { text: 'Aim for ' + Math.ceil(o.n / 2) + ' books', apply: function () { dr.goals.books.n = Math.ceil(o.n / 2); } };
    if (key === 'books' && o.mode === 'pages' && o.pages > 100) return { text: 'Aim for ' + Math.round(o.pages / 200) * 100 + ' pages', apply: function () { dr.goals.books.pages = Math.round(o.pages / 200) * 100; } };
    if (key === 'custom' && o.amount > 1) return { text: 'Aim for ' + Math.ceil(o.amount * 0.6) + ' ' + o.unit, apply: function () { dr.goals.custom.amount = Math.ceil(o.amount * 0.6); } };
    return null;
  }

  function render() {
    renderSteps();
    var body = $('#lp-rbody');
    if (step > 1 && !on().length) step = 1;
    if (step === 3) { body.innerHTML = '<p class="lp-loading">Making your plan…</p>'; rebuild(function () { body.innerHTML = step3(); }); return; }
    body.innerHTML = step === 1 ? step1() : step2();
    if (step < 3 && on().length) rebuild(function () { if (step < 3) { var f = D.activeElement && D.activeElement.id; body.innerHTML = step === 1 ? step1() : step2(); if (f && D.getElementById(f)) D.getElementById(f).focus(); } });
  }

  // ---------- events ----------
  box.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset.goal) { var k = t.dataset.goal; dr.goals[k] = Object.assign({}, R.opts(dr, k), dr.goals[k] || {}, { on: t.checked }); if (k === 'ladder' && !dr.goals[k].c && CFG.courses[0]) dr.goals[k].c = CFG.courses[0].l + '|' + CFG.courses[0].k; if (k === 'trade' && !dr.goals[k].tr && CFG.trades[0]) dr.goals[k].tr = CFG.trades[0].k; save(); render(); return; }
    if (t.dataset.g) { var o = dr.goals[t.dataset.g]; o[t.dataset.f] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? (t.value === '' ? 0 : +t.value) : t.value; save(); render(); return; }
    if (t.name === 'lp-dpw') { var pr = PRESETS.filter(function (x) { return x[0] === t.value; })[0]; if (pr) dr.days = pr[1].slice(); save(); render(); return; }
    if (t.classList.contains('lp-rday')) { dr.days = $$('.lp-rday:checked', box).map(function (x) { return +x.value; }); if (!dr.days.length) dr.days = [1]; save(); render(); return; }
    if (t.id === 'lp-rstart' && C.dnOf(t.value) != null) { dr.start = t.value; dr.extend = 0; save(); return; }
    if (t.id === 'lp-rmins') { dr.mins = Math.max(5, Math.min(600, Math.round(+t.value || 45))); save(); }
    if (t.id === 'lp-rcheck') { dr.check = t.checked; save(); $('#lp-rminsl').hidden = !t.checked; if (t.checked) $('#lp-rmins').focus(); }
  });
  box.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.go) { go(+b.dataset.go); return; }
    if (b.dataset.roff != null) { dr.off.splice(+b.dataset.roff, 1); save(); render(); return; }
    if (b.id === 'lp-roff-add') {
      var f = $('#lp-roff-from').value, to = $('#lp-roff-to').value || f; if (C.dnOf(f) == null) { $('#lp-roff-from').focus(); return; }
      if (C.dnOf(to) < C.dnOf(f)) to = f; dr.off.push({ from: f, to: to, label: $('#lp-roff-label').value.trim().slice(0, 40) }); save(); render(); return;
    }
    if (b.dataset.fix) {
      var fx = b.dataset.fix;
      if (fx === 'mins') { dr.mins = +b.dataset.v; dr.check = true; }
      if (fx === 'drop') dr.goals[b.dataset.v].on = false;
      if (fx === 'small') { var sm = smaller(b.dataset.v); if (sm) sm.apply(); }
      if (fx === 'days') dr.days = [0, 1, 2, 3, 4, 5, 6];
      save(); render(); return;
    }
    if (b.id === 'lp-rcheck3') { dr.check = true; dr.mins = Math.max(5, Math.min(600, Math.round(+$('#lp-rmins3').value || 45))); save(); render(); return; }
    if (b.id === 'lp-runcheck') { dr.check = false; save(); render(); return; }
    if (b.id === 'lp-rsave' || b.id === 'lp-rmerge') { commit(b.dataset.mode); return; }
    if (b.id === 'lp-rprint') { var st = built.state; A.withState(st, function (S) { A.doPrint(S.from, S.to, 'month'); }); return; }
    if (b.id === 'lp-rics') {
      var txt = A.withState(built.state, function (S) { return A.icsText(S.from, S.to, { mode: $('#lp-rics-mode').value, rrule: true }); });
      A.download('resolution-' + C.ymd(built.range[0]).y + '.ics', 'text/calendar', txt); A.msg('Calendar file saved.');
    }
  });
  function commit(mode) {
    var st = JSON.parse(JSON.stringify(built.state)), cur = A.get();
    if (!dr.check) { var pk = 0; prev.S.days.forEach(function (d) { if (d.load > pk) pk = d.load; }); st.plan.budget = st.plan.budget.map(function (x) { return x ? Math.max(5, Math.ceil(pk / 5) * 5) : 0; }); }
    if (mode === 'merge' && cur && A.valid(cur)) {
      var keep = cur.tracks.filter(function (t) { return !(t.opt && t.opt.res); });
      var m = JSON.parse(JSON.stringify(cur));
      m.tracks = keep.concat(st.tracks); m.res = st.res; m.plan.from = st.plan.from; m.plan.len = 'custom'; m.plan.to = st.plan.to;
      st.plan.budget.forEach(function (x, d) { if (x > m.plan.budget[d]) m.plan.budget[d] = x; });
      m.plan.off = (m.plan.off || []).concat(st.plan.off.filter(function (o) { return !m.plan.off.some(function (p) { return p.from === o.from && p.to === o.to; }); }));
      m.starter = false; st = m;
    } else { st.ticks = (cur && cur.ticks) || {}; }
    A.set(st);
    try { W.localStorage.removeItem(DK); } catch (e) { }
    A.msg('Saved. Your resolution is now your Life Planner plan.');
    if (CFG.res) setTimeout(function () { W.location.href = CFG.planURL + '#saved'; }, 400);
    else { box.hidden = true; D.getElementById('lp-app').hidden = false; history.replaceState(null, '', W.location.pathname); }
  }

  // move the finish date (from the planner's "On track?" line): rebuild with more days and keep the ticks
  W.LPRes = {
    moveFinish: function (days) {
      var cur = A.get(); if (!cur || !cur.res || !cur.res.draft) return;
      var d2 = JSON.parse(JSON.stringify(cur.res.draft)); d2.extend = Math.min(35, (+d2.extend || 0) + days);
      var keepDr = dr; dr = d2;
      A.load(R.needs(dr), function () {
        var b = R.build(dr, env()), st = JSON.parse(JSON.stringify(cur));
        st.tracks = st.tracks.filter(function (t) { return !(t.opt && t.opt.res); }).concat(b.state.tracks);
        st.plan.to = b.state.plan.to; st.plan.len = 'custom';
        st.res = Object.assign(resInfo(b), { title: cur.res.title, milestones: cur.res.milestones }); st.res.draft = d2;
        dr = keepDr; A.set(st); A.msg('The finish date is now ' + fd(b.range[1], { month: 'long', day: 'numeric', year: 'numeric' }) + '. Everything left is spread over the extra week.');
      });
    }
  };
  W.LPResDraft = function (o) { if (o) { dr = Object.assign(dr, o); save(); render(); } return dr; }; // for the tests

  // ---------- open ----------
  function open() { box.hidden = false; var app = D.getElementById('lp-app'); if (!CFG.res && app) app.hidden = true; render(); }
  if (CFG.res) open();
  else {
    if (W.location.hash === '#resolution') open();
    W.addEventListener('hashchange', function () { if (W.location.hash === '#resolution') open(); });
  }
})(window, document);
