/* Cube Solver page, the guide below the solver: a demo cube for the notation and the algorithms, practice
   cases for each step of the beginner method, broken-cube examples, and the scramble timer.
   Timer results live in the same localStorage key as the rest of the page ("trb-cube-v1", field "times"). */
(function (W, D) {
  'use strict';
  var NS = W.TRBCube, root = D.getElementById('cube-lab');
  if (!root || !NS || !NS.app) return;
  function $(id) { return D.getElementById(id); }
  var MV = NS.moves, CN = NS.COLOR_NAMES, th = NS.three;
  var FACE_NAME = ['top', 'right', 'front', 'bottom', 'left', 'back'];
  var reduced = false; try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  var store = NS.store;
  var G = W.TRBCubeGuide = {};

  function describe(m) {
    var b = m[0], q = MV.amount(m), wide = /w/.test(m);
    var dir = q === 2 ? 'a half turn (either way)' : q === 1 ? 'a quarter turn clockwise' : 'a quarter turn counterclockwise';
    if ('xyz'.indexOf(b) >= 0) return '<b>' + MV.pretty(m) + '</b>: turn the whole cube ' + (q === 2 ? 'a half turn' : 'the same way as ' + { x: 'R', y: 'U', z: 'F' }[b] + (q === 3 ? '′' : '')) + '. Nothing moves relative to anything else; you just hold the cube differently.';
    if ('MES'.indexOf(b) >= 0) return '<b>' + MV.pretty(m) + '</b>: turn the middle layer ' + { M: 'between L and R, the same way as L', E: 'between U and D, the same way as D', S: 'between F and B, the same way as F' }[b] + (q === 3 ? ', but counterclockwise' : q === 2 ? ', a half turn' : '') + '.';
    var f = 'URFDLB'.indexOf(b);
    return '<b>' + MV.pretty(m) + '</b>: ' + dir + ' of the ' + FACE_NAME[f] + (wide ? ' face together with the layer next to it' : ' face') + (q === 2 ? '' : ', as you look straight at the ' + FACE_NAME[f] + ' face') + '.';
  }

  // ---- the demo cube ----
  var demoN = 3, demo = new NS.View($('cube-demo-cv'), { onKey: demoKey }), demoQueue = [], demoRunning = false;
  demo.setPaintable(false);
  function demoMoves() {
    var faces = ['U', 'D', 'R', 'L', 'F', 'B'], html = '';
    faces.forEach(function (f) { [f, f + "'", f + '2'].forEach(function (m) { html += btn(m); }); });
    html += '<span class="cube-brk"></span>';
    (demoN === 3 ? ['M', "M'", 'E', 'S', 'x', "x'", 'y', "y'", 'z'] : ['Rw', "Rw'", 'Rw2', 'Uw', "Uw'", 'Fw', "Fw'", 'x', 'y']).forEach(function (m) { html += btn(m); });
    $('cube-demo-moves').innerHTML = html;
    function btn(m) { return '<button type="button" class="lab-btn" data-m="' + m + '" aria-label="Show ' + m.replace("'", ' prime') + '">' + MV.pretty(m) + '</button>'; }
  }
  function demoSize(n) {
    demoN = n; demo.setSize(n); demoQueue = []; demoRunning = false;
    D.querySelectorAll('#cube-demo-size button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.n === n)); });
    demoMoves();
  }
  function demoPlay(list, from, label) {
    demo.stop();
    if (from) demo.setState(from);
    demoQueue = MV.parse(list); demoRunning = true;
    var total = demoQueue.length, k = 0;
    var now = $('cube-demo-now');
    if (label && total > 1) now.innerHTML = demoQueue.map(function (t, j) { return '<span data-k="' + j + '">' + MV.pretty(t) + '</span>'; }).join(' ');
    else now.textContent = label || '';
    function mark(j) { now.querySelectorAll('span').forEach(function (sp) { var x = +sp.dataset.k; sp.className = x < j ? 'done' : x === j ? 'cur' : ''; }); }
    (function next() {
      if (!demoQueue.length) { demoRunning = false; demo.setArrow(null); mark(total); $('cube-demo-step').textContent = total > 1 ? 'Done.' : ''; return; }
      var m = demoQueue.shift(); mark(k); k++;
      demo.setArrow(m);
      $('cube-demo-step').innerHTML = total > 1 ? 'Move ' + k + ' of ' + total + ': <b>' + MV.pretty(m) + '</b>' : '';
      demo.animate(m, total > 1 ? 560 : 700, function () { setTimeout(next, total > 1 ? 120 : 0); });
    })();
  }
  function demoKey(e) {
    var f = 'URFDLB'.indexOf(e.key.toUpperCase());
    if (f >= 0 && e.key.length === 1 && !e.ctrlKey && !e.metaKey) { var m = 'URFDLB'[f] + (e.shiftKey ? "'" : ''); $('cube-demo-desc').innerHTML = describe(m); demoPlay([m]); return true; }
    return false;
  }
  $('cube-demo-moves').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; $('cube-demo-desc').innerHTML = describe(b.dataset.m); demoPlay([b.dataset.m]); });
  $('cube-demo-size').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) demoSize(+b.dataset.n); });
  $('cube-demo-reset').addEventListener('click', function () { demo.stop(); demoQueue = []; demo.setSize(demoN); demo.setArrow(null); $('cube-demo-now').textContent = ''; $('cube-demo-step').textContent = ''; });
  demoSize(3);

  // algorithms: show the case (the algorithm undone on a solved cube), then play it
  D.querySelectorAll('.cube-alg-show').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = +(b.dataset.n || 3), alg = b.dataset.alg, mode = b.dataset.from || 'case';
      if (n !== demoN) demoSize(n);
      var m = NS.model(n), start = mode === 'solved' ? m.solved() : m.applyAll(m.solved(), MV.invert(alg));
      demo.resetView();
      $('cube-demo-desc').innerHTML = '<b>' + b.closest('tr').querySelector('th').textContent + '</b>: ' + (mode === 'solved' ? 'starting from a solved cube.' : 'first the cube is set up in the case this algorithm fixes, then the moves play.');
      $('cube-demo').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      demoPlay(alg, start, MV.parse(alg).map(MV.pretty).join(' '));
    });
  });

  // ---- practice the beginner method ----
  var practice = null;
  var STAGE_GOAL = ['', 'the white cross', 'the white corners', 'the middle layer', 'the top cross', 'the top edges', 'the top corners in place', 'the whole cube'];
  function stageDone(s, k) {
    var M3 = NS.model(3), t = s, rots = ['', 'z2', "x'", 'x', 'z', "z'"], c, i;
    for (i = 0; i < rots.length; i++) { var u = rots[i] ? M3.apply(s, rots[i]) : s; if (u[31] === 0) { t = u; break; } }
    c = th.fromFacelets(t); if (!c) return false;
    function e(p) { return c.ep[p] === p && c.eo[p] === 0; }
    function cr(p) { return c.cp[p] === p && c.co[p] === 0; }
    var ok = [4, 5, 6, 7].every(e);
    if (k >= 2) ok = ok && [4, 5, 6, 7].every(cr);
    if (k >= 3) ok = ok && [8, 9, 10, 11].every(e);
    if (k >= 4) ok = ok && [0, 1, 2, 3].every(function (p) { return c.eo[p] === 0; });
    if (k >= 5) ok = ok && [0, 1, 2, 3].every(function (p) { return c.ep[p] === p; });
    if (k >= 6) ok = ok && [0, 1, 2, 3].every(function (p) { return c.cp[p] === p; });
    if (k >= 7) ok = M3.isSolved(s);
    return ok;
  }
  D.querySelectorAll('.cube-practice').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = +b.dataset.stage, M3 = NS.model(3), s, r, tries = 0;
      do {
        s = th.toFacelets(th.randomCube());
        r = NS.beginner.solve(s);
        var t = s; r.steps.forEach(function (st) { if (st.stage < k) t = M3.applyAll(t, st.moves); });
        s = t; tries++;
      } while (stageDone(s, k) && tries < 20);
      practice = { stage: k, start: s, done: false };
      var note = '<b>Practice: ' + STAGE_GOAL[k] + '.</b> The earlier steps are done. Turn the cube with the buttons under <i>Turn the cube</i> (or keys U R F D L B on the 3-D cube, Shift for ′) and finish this step, or press <i>Solve: beginner method</i> to see how. <span id="cube-pr-setup">Working out how to set this up on a real cube…</span>';
      NS.app.load(3, s, note);
      var pad = $('cube-pad'); if (pad.hidden) $('cube-pad-toggle').click();
      NS.ask({ cmd: 'solve', N: 3, stickers: Array.from(s), method: 'fast', maxTime: 400, target: 22 }).then(function (res) {
        var el = $('cube-pr-setup'); if (!el) return;
        el.innerHTML = 'To set it up on a real cube, start from solved, hold it with ' + CN[s[31]] + ' on the bottom and ' + CN[s[22]] + ' in front, and do: <span class="cube-code">' + MV.invert(res.moves).map(MV.pretty).join(' ') + '</span>';
      }).catch(function () { var el = $('cube-pr-setup'); if (el) el.textContent = ''; });
    });
  });
  G.onChange = function (n, s) {
    if (!practice || n !== 3 || practice.done) return;
    if (stageDone(s, practice.stage)) {
      practice.done = true;
      var note = $('cube-note');
      note.innerHTML = '<b>Step done: ' + STAGE_GOAL[practice.stage] + '!</b> ' + (practice.stage < 7 ? 'Try the next step in the guide below, or keep going on this cube.' : 'You solved the whole cube.');
      note.hidden = false;
    }
  };
  G.onSize = function () { practice = null; };

  // ---- broken cubes ----
  D.querySelectorAll('.cube-broken').forEach(function (b) {
    b.addEventListener('click', function () {
      var M3 = NS.model(3), s = M3.applyAll(M3.solved(), MV.randomMoves(3, 25)), kind = b.dataset.kind;
      var c = th.CFI[0], e = th.EFI[1], e2 = th.EFI[0], t = Int8Array.from(s);
      if (kind === 'twist') { t[c[0]] = s[c[1]]; t[c[1]] = s[c[2]]; t[c[2]] = s[c[0]]; }
      else if (kind === 'flip') { t[e[0]] = s[e[1]]; t[e[1]] = s[e[0]]; }
      else { t[e[0]] = s[e2[0]]; t[e[1]] = s[e2[1]]; t[e2[0]] = s[e[0]]; t[e2[1]] = s[e[1]]; }
      practice = null;
      NS.app.load(3, t, '<b>A broken cube.</b> This one was scrambled, then ' + { twist: 'one corner (top front right) was twisted in place', flip: 'one edge (top front) was flipped over', swap: 'two edges (top front and top right) were swapped' }[kind] + '. See what the check says, under <i>Check</i>.');
    });
  });

  // ---- timer ----
  var tN = 3, tState = 'idle', tStart = 0, tInspect = 0, tRaf = 0, holdT = 0, scr = null, penalty = 0;
  var disp = $('cube-t-disp');
  function times() { store.data.times = store.data.times || {}; return (store.data.times[tN] = store.data.times[tN] || []); }
  function fmt(ms) { if (ms == null) return '—'; if (ms === Infinity) return 'DNF'; var s = ms / 1000; return s >= 60 ? Math.floor(s / 60) + ':' + ('0' + (s % 60).toFixed(2)).slice(-5) : s.toFixed(2); }
  function value(x) { return x.pen === 'dnf' ? Infinity : x.t + (x.pen === '+2' ? 2000 : 0); }
  function avg(list, n) {
    if (list.length < n) return null;
    var v = list.slice(-n).map(value).sort(function (a, b) { return a - b; });
    var mid = v.slice(1, n - 1); // drop the best and the worst, as in competitions
    if (mid.some(function (x) { return x === Infinity; })) return Infinity;
    return mid.reduce(function (a, b) { return a + b; }, 0) / mid.length;
  }
  function stats() {
    var L = times(), ok = L.map(value).filter(function (x) { return x !== Infinity; });
    var best = ok.length ? Math.min.apply(null, ok) : null, mean = ok.length ? ok.reduce(function (a, b) { return a + b; }, 0) / ok.length : null;
    $('cube-t-stats').innerHTML = '<div><dt>Solves</dt><dd>' + L.length + '</dd></div><div><dt>Best</dt><dd>' + fmt(best) + '</dd></div><div><dt>Average of 5</dt><dd>' + fmt(avg(L, 5)) + '</dd></div><div><dt>Average of 12</dt><dd>' + fmt(avg(L, 12)) + '</dd></div><div><dt>Mean</dt><dd>' + fmt(mean) + '</dd></div>';
    var html = '';
    for (var i = L.length - 1; i >= Math.max(0, L.length - 50); i--) {
      var x = L[i];
      html += '<li><span class="cube-t-n">' + (i + 1) + '.</span><b>' + fmt(value(x)) + (x.pen === '+2' ? '<small>+2</small>' : '') + '</b><span class="cube-t-act"><button type="button" data-a="+2" data-i="' + i + '" aria-pressed="' + (x.pen === '+2') + '" aria-label="Add or remove a two-second penalty on solve ' + (i + 1) + '">+2</button><button type="button" data-a="dnf" data-i="' + i + '" aria-pressed="' + (x.pen === 'dnf') + '" aria-label="Mark solve ' + (i + 1) + ' as did not finish">DNF</button><button type="button" data-a="del" data-i="' + i + '" aria-label="Delete solve ' + (i + 1) + '">✕</button></span></li>';
    }
    $('cube-t-list').innerHTML = html || '<li class="lab-small">No solves yet for the ' + tN + '×' + tN + '.</li>';
    $('cube-t-clear').disabled = !L.length;
  }
  function newScramble() {
    scr = null; $('cube-t-scr').textContent = 'Making a scramble…';
    var n0 = tN;
    NS.ask({ cmd: 'scramble', N: tN }).then(function (r) { if (n0 !== tN) return; scr = r.moves; $('cube-t-scr').textContent = r.moves.map(MV.pretty).join(' '); })
      .catch(function () { scr = MV.randomMoves(tN, tN === 4 ? 40 : 25); $('cube-t-scr').textContent = scr.map(MV.pretty).join(' '); });
  }
  function showT(ms, cls) { disp.textContent = typeof ms === 'string' ? ms : fmt(ms); disp.className = 'cube-t-disp ' + (cls || ''); }
  function tick() {
    tRaf = 0;
    if (tState === 'run') { showT(performance.now() - tStart, 'run'); tRaf = W.requestAnimationFrame(tick); }
    else if (tState === 'inspect' || tState === 'inspect-hold' || tState === 'inspect-ready') {
      var left = 15 - (performance.now() - tInspect) / 1000;
      penalty = left < -2 ? 'dnf' : left < 0 ? '+2' : 0;
      showT(left > 0 ? String(Math.ceil(left)) : penalty === 'dnf' ? 'DNF' : '+2', tState === 'inspect-ready' ? 'ready' : 'inspect');
      tRaf = W.requestAnimationFrame(tick);
    }
  }
  function press() {
    if (tState === 'run') { stop(); return; }
    if (tState === 'idle' && $('cube-t-inspect').checked) { tState = 'inspect'; tInspect = performance.now(); penalty = 0; tick(); $('cube-t-help').textContent = 'Inspecting: look the cube over. Hold, then let go to start.'; return; }
    if (tState === 'idle' || tState === 'inspect') {
      var from = tState; tState = from === 'inspect' ? 'inspect-hold' : 'hold';
      if (from !== 'inspect') showT(0, 'hold');
      holdT = setTimeout(function () { if (tState === 'hold') { tState = 'ready'; showT(0, 'ready'); } else if (tState === 'inspect-hold') tState = 'inspect-ready'; }, 300);
    }
  }
  function release() {
    clearTimeout(holdT);
    if (tState === 'ready' || tState === 'inspect-ready') { if (tState === 'ready') penalty = 0; tState = 'run'; tStart = performance.now(); $('cube-t-help').textContent = 'Press any key or tap to stop.'; tick(); }
    else if (tState === 'hold') { tState = 'idle'; showT(0, ''); }
    else if (tState === 'inspect-hold') tState = 'inspect';
  }
  function stop() {
    var t = Math.round(performance.now() - tStart);
    tState = 'idle'; if (tRaf) W.cancelAnimationFrame(tRaf); tRaf = 0;
    times().push({ t: t, pen: penalty || undefined, s: scr ? scr.join(' ') : '', d: Date.now() });
    store.save();
    showT(value(times()[times().length - 1]), 'done');
    $('cube-t-help').textContent = (penalty ? (penalty === 'dnf' ? 'Inspection ran over 17 seconds, so this counts as DNF. ' : 'Inspection ran over 15 seconds: +2 seconds. ') : '') + 'Saved. Scramble again and hold to start the next one.';
    stats(); newScramble();
  }
  disp.addEventListener('keydown', function (e) {
    if (e.repeat) { if (e.key === ' ') e.preventDefault(); return; }
    if (tState === 'run') { e.preventDefault(); stop(); return; }
    if (e.key === ' ') { e.preventDefault(); press(); }
  });
  disp.addEventListener('keyup', function (e) { if (e.key === ' ') { e.preventDefault(); release(); } });
  disp.addEventListener('pointerdown', function (e) { e.preventDefault(); disp.focus(); press(); });
  disp.addEventListener('pointerup', function (e) { e.preventDefault(); release(); });
  disp.addEventListener('pointercancel', function () { release(); });
  $('cube-t-size').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || tState === 'run') return; tN = +b.dataset.n; D.querySelectorAll('#cube-t-size button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); store.data.tsize = tN; store.save(); stats(); newScramble(); showT(0, ''); });
  $('cube-t-new').addEventListener('click', newScramble);
  $('cube-t-load').addEventListener('click', function () { if (!scr) return; var m = NS.model(tN); NS.app.load(tN, m.applyAll(m.solved(), scr), '<b>The timer’s scramble.</b> Press a Solve button to see a solution for it.'); });
  $('cube-t-inspect').checked = !!store.data.inspect;
  $('cube-t-inspect').addEventListener('change', function () { store.data.inspect = this.checked; store.save(); });
  $('cube-t-list').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var L = times(), i = +b.dataset.i, a = b.dataset.a;
    if (a === 'del') L.splice(i, 1); else L[i].pen = L[i].pen === a ? undefined : a;
    store.save(); stats();
  });
  $('cube-t-clear').addEventListener('click', function () { if (W.confirm('Delete all ' + times().length + ' saved ' + tN + '×' + tN + ' times?')) { store.data.times[tN] = []; store.save(); stats(); } });
  tN = [2, 3, 4].indexOf(store.data.tsize) >= 0 ? store.data.tsize : 3;
  D.querySelectorAll('#cube-t-size button').forEach(function (x) { x.setAttribute('aria-pressed', String(+x.dataset.n === tN)); });
  stats(); showT(0, '');
  // make the first scramble when the timer comes into view (no need to start the solver early)
  if ('IntersectionObserver' in W) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); newScramble(); } });
    io.observe($('cube-timer'));
  } else newScramble();
})(window, document);
