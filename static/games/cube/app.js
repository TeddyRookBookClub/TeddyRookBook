/* Cube Solver page: color entry (map, face-by-face, 3-D), live checks, solving in a Web Worker, and the
   move player. Browser storage: localStorage key "trb-cube-v1" holds {v: 1, size, scheme, speed, pause,
   cubes: {2|3|4: stickers}, times: {2|3|4: [{t, pen, s, d}]}, inspect} — the painted cubes, settings and timer
   results, kept only in this browser. Everything works without it. TRBCube.app is used by guide.js. */
(function (W, D) {
  'use strict';
  var NS = W.TRBCube, root = D.getElementById('cube-lab');
  if (!root || !NS) return;
  function $(id) { return D.getElementById(id); }
  var MV = NS.moves, CN = NS.COLOR_NAMES;
  var FACE_NAME = ['top', 'right', 'front', 'bottom', 'left', 'back'];
  var FACE_TITLE = ['Top', 'Right', 'Front', 'Bottom', 'Left', 'Back'];
  var NET = [[1, 0], [2, 1], [1, 1], [1, 2], [0, 1], [3, 1]]; // face -> [column, row] in the map
  var SCAN = [2, 1, 5, 4, 0, 3];
  var SPEEDS = [0.4, 0.6, 0.8, 1, 1.3, 1.7, 2.2, 3, 4, 6];
  var reduced = false; try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  // ---- storage ----
  var KEY = 'trb-cube-v1', store = { v: 1 };
  try { var o = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (o && o.v === 1) store = o; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { } }
  NS.store = { data: store, save: save };

  // ---- state ----
  var N = [2, 3, 4].indexOf(store.size) >= 0 ? store.size : 3, M = NS.model(N), stickers = null;
  var paintColor = 0, scheme = store.scheme === 'auto' ? 'auto' : 'standard', undo = [], mode = 'enter', check = null;
  var scanFace = 0, focusIdx = 0, small = false, entryView = 'net';
  var P = { moves: [], steps: [], stepOf: [], idx: 0, playing: false, start: null, timer: 0, method: '', ms: 0 };
  var speedI = typeof store.speed === 'number' ? Math.max(0, Math.min(9, store.speed)) : 3;
  var view = new NS.View($('cube-cv'), { onPick: function (i) { if (mode === 'enter') paint(i); }, onKey: canvasKey });

  function loadCube(n) {
    var saved = store.cubes && store.cubes[n];
    var m = NS.model(n);
    if (saved && saved.length === m.count) return Int8Array.from(saved);
    return m.solved();
  }
  function persist() { store.cubes = store.cubes || {}; store.cubes[N] = Array.from(stickers); store.size = N; save(); }

  // ---- size ----
  function setSize(n, keep) {
    stopPlay(); N = n; M = NS.model(n); hideNote();
    stickers = keep ? Int8Array.from(keep) : loadCube(n);
    undo = []; scanFace = 0; focusIdx = 0;
    view.setSize(n); view.setState(stickers);
    D.querySelectorAll('#cube-size button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.n === n)); });
    $('cube-centers').hidden = n !== 3;
    root.setAttribute('data-n', n);
    buildNet(); buildScan(); buildPad(); solveButtons();
    setMode('enter');
    runCheck(); persist();
    if (W.TRBCubeGuide && W.TRBCubeGuide.onSize) W.TRBCubeGuide.onSize(n);
    warm(n);
  }

  // ---- palette ----
  function buildPalette() {
    var pal = $('cube-palette'), html = '';
    for (var c = 0; c < 6; c++) html += '<button type="button" class="cube-sw" data-c="' + c + '" role="radio" aria-checked="false" aria-label="' + CN[c] + ' (key ' + (c + 1) + ')" title="' + CN[c] + ' (' + (c + 1) + ')"><span>' + (c + 1) + '</span></button>';
    html += '<button type="button" class="cube-sw cube-erase" data-c="-1" role="radio" aria-checked="false" aria-label="Eraser (key 0)" title="Eraser (0)"><span>0</span></button>';
    pal.innerHTML = html;
    pal.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pickColor(+b.dataset.c); });
    pickColor(0);
  }
  function pickColor(c) {
    paintColor = c;
    D.querySelectorAll('#cube-palette .cube-sw').forEach(function (b) { var on = +b.dataset.c === c; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    D.querySelectorAll('.cube-paintwith').forEach(function (el) { el.textContent = c < 0 ? 'the eraser' : CN[c]; });
  }

  // ---- the map (net) ----
  function stLabel(i) {
    var f = M.face[i], r = Math.floor((i % M.NN) / N), c = i % N;
    return FACE_TITLE[f] + ' face, row ' + (r + 1) + ', column ' + (c + 1) + ': ' + (stickers[i] < 0 ? 'not painted' : CN[stickers[i]]);
  }
  function buildNet() {
    var net = $('cube-net'), html = '';
    net.style.setProperty('--n', N);
    for (var f = 0; f < 6; f++) {
      html += '<div class="cube-face" data-f="' + f + '" style="grid-column:' + (NET[f][0] + 1) + ';grid-row:' + (NET[f][1] + 1) + '" role="group" aria-label="' + FACE_TITLE[f] + ' face"><span class="cube-fl" aria-hidden="true">' + 'URFDLB'[f] + '</span>';
      for (var k = 0; k < M.NN; k++) { var i = f * M.NN + k; html += '<button type="button" class="cube-st" data-i="' + i + '" tabindex="-1"></button>'; }
      html += '</div>';
    }
    net.innerHTML = html;
    sizeNet();
    refreshStickers();
  }
  function sizeNet() {
    var net = $('cube-net'), w = net.parentNode.clientWidth || 320;
    var s = Math.floor((w - 3 * 8) / (4 * N) - 2);
    s = Math.max(14, Math.min(N === 4 ? 40 : 46, s));
    net.style.setProperty('--s', s + 'px');
    var wasSmall = small; small = s < 34;
    net.classList.toggle('small', small);
    if (small !== wasSmall || !net.dataset.sized) { net.dataset.sized = 1; if (small && entryView === 'net') setEntryView('scan', true); }
  }
  function refreshStickers() {
    D.querySelectorAll('#cube-net .cube-st, #cube-scan-grid .cube-st').forEach(function (b) {
      var i = +b.dataset.i;
      b.setAttribute('data-c', stickers[i]);
      b.setAttribute('aria-label', stLabel(i));
      b.classList.toggle('bad', !!(check && check.bad[i]));
    });
    D.querySelectorAll('#cube-net .cube-st').forEach(function (b) { b.tabIndex = (+b.dataset.i === focusIdx && !small) ? 0 : -1; });
    D.querySelectorAll('#cube-net .cube-face').forEach(function (fb) { fb.classList.toggle('cur', (small || entryView === 'scan') && +fb.dataset.f === SCAN[scanFace]); });
  }
  function gridPos(i) { var f = M.face[i], k = i % M.NN; return [NET[f][0] * N + (k % N), NET[f][1] * N + Math.floor(k / N)]; }
  function atGrid(x, y) {
    for (var f = 0; f < 6; f++) { var c = x - NET[f][0] * N, r = y - NET[f][1] * N; if (c >= 0 && c < N && r >= 0 && r < N) return f * M.NN + r * N + c; }
    return -1;
  }
  function netKey(e) {
    var b = e.target.closest('.cube-st'); if (!b) return;
    var i = +b.dataset.i, p = gridPos(i), d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (d) {
      e.preventDefault();
      var j = atGrid(p[0] + d[0], p[1] + d[1]);
      if (j < 0 && d[1] === 0) j = atGrid(p[0] + 2 * d[0] * N, p[1]); // hop the gap
      if (j >= 0) { focusIdx = j; refreshStickers(); var nb = D.querySelector('#cube-net .cube-st[data-i="' + j + '"]'); if (nb) nb.focus(); view.setFocus(j); }
      return;
    }
    if (paletteKey(e)) return;
  }
  function paletteKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (/^[0-6]$/.test(e.key)) { pickColor(e.key === '0' ? -1 : +e.key - 1); e.preventDefault(); return true; }
    if ((e.key === 'z' || e.key === 'Z') && undo.length) { doUndo(); e.preventDefault(); return true; }
    return false;
  }

  // ---- face by face ----
  function scanText(f) {
    var three = N === 3, cc = function (g) { return stickers[g * 9 + 4]; };
    var named = three && [0, 1, 2, 3, 4, 5].every(function (g) { return cc(g) >= 0; });
    var c = function (g) { return named ? chip(cc(g)) + ' ' + CN[cc(g)] + ' center' : 'the ' + FACE_NAME[g]; };
    switch (f) {
      case 2: return three ? 'Hold the cube with ' + c(2) + ' facing you and ' + c(0) + ' on top. Keep the top on top for the next four faces.' : 'Hold the cube with any side facing you: that is the front from now on. Keep the top on top for the next four faces.';
      case 1: return 'Turn the whole cube a quarter turn to the left, so the right side faces you' + (named ? ' (' + chip(cc(1)) + ' ' + CN[cc(1)] + ' center)' : '') + '. The top stays on top.';
      case 5: return 'Another quarter turn to the left: now the back faces you' + (named ? ' (' + chip(cc(5)) + ' ' + CN[cc(5)] + ')' : '') + '. The top stays on top.';
      case 4: return 'Another quarter turn to the left: now the left side faces you' + (named ? ' (' + chip(cc(4)) + ' ' + CN[cc(4)] + ')' : '') + '.';
      case 0: return 'One more quarter turn left brings the front back. Now tip the top toward you, so the top faces you' + (named ? ' (' + chip(cc(0)) + ' ' + CN[cc(0)] + ')' : '') + ' and the back side is at the top of what you see.';
      default: return 'Go back to the front, then tip the cube away from you, so the bottom faces you' + (named ? ' (' + chip(cc(3)) + ' ' + CN[cc(3)] + ')' : '') + ' and the front side is at the top of what you see.';
    }
  }
  function chip(c) { return '<i class="cube-chip" data-c="' + c + '" aria-hidden="true"></i>'; }
  function buildScan() {
    var f = SCAN[scanFace];
    $('cube-scan-step').textContent = 'Face ' + (scanFace + 1) + ' of 6: ' + FACE_TITLE[f];
    $('cube-scan-tip').innerHTML = scanText(f);
    var g = $('cube-scan-grid'), html = '';
    g.style.setProperty('--n', N);
    for (var k = 0; k < M.NN; k++) html += '<button type="button" class="cube-st" data-i="' + (f * M.NN + k) + '"></button>';
    g.innerHTML = html;
    $('cube-scan-prev').disabled = scanFace === 0;
    $('cube-scan-next').textContent = scanFace === 5 ? 'Done: check it' : 'Next face →';
    refreshStickers();
    if (mode === 'enter' && entryView === 'scan') faceView(f);
  }
  function faceView(f) {
    var v = [[0, 1.5], [-Math.PI / 2 + 0.28, 0.28], [-0.28, 0.28], [0, -1.5], [Math.PI / 2 - 0.28, 0.28], [Math.PI - 0.28, 0.28]][f];
    view.view(v[0], v[1]);
  }
  function setEntryView(v, auto) {
    entryView = v;
    D.querySelectorAll('#cube-entry-mode button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === v)); });
    $('cube-scan').hidden = v !== 'scan';
    $('cube-net-wrap').classList.toggle('only-map', v === 'net');
    if (v === 'scan') faceView(SCAN[scanFace]); else if (!auto) view.resetView();
    refreshStickers();
  }

  // ---- painting ----
  function pushUndo() { undo.push(Int8Array.from(stickers)); if (undo.length > 200) undo.shift(); $('cube-undo').disabled = false; }
  function doUndo() { if (!undo.length) return; stickers = undo.pop(); $('cube-undo').disabled = !undo.length; changed(); }
  function paint(i) {
    if (stickers[i] === paintColor) return;
    pushUndo(); stickers[i] = paintColor; focusIdx = i; changed();
  }
  function setAll(s, keepUndo) { if (!keepUndo) pushUndo(); stickers = Int8Array.from(s); changed(); }
  var checkT = 0;
  function changed() {
    view.setState(stickers); refreshStickers(); persist();
    clearTimeout(checkT); checkT = setTimeout(runCheck, 60);
    if (entryView === 'scan') $('cube-scan-tip').innerHTML = scanText(SCAN[scanFace]);
    if (W.TRBCubeGuide && W.TRBCubeGuide.onChange) W.TRBCubeGuide.onChange(N, stickers);
  }

  // ---- checks ----
  function runCheck() {
    var r = NS.validate(N, stickers, scheme), bad = {}, box = $('cube-check'), html = '';
    r.issues.forEach(function (x) { if (x.kind === 'error') x.stickers.forEach(function (i) { bad[i] = 1; }); });
    r.bad = bad; check = r;
    var errs = r.issues.filter(function (x) { return x.kind === 'error'; });
    if (r.ok) html = '<p class="cube-ok"><b aria-hidden="true">✓</b> ' + (M.isSolved(stickers) ? 'This is a solved cube. Paint your own cube’s colors, or press <i>Scramble</i> to try one.' : 'Every check passes. This cube can be solved.') + '</p>';
    else {
      html = '<ul class="cube-issues">' + r.issues.map(function (x, k) {
        return '<li class="' + x.kind + '">' + (x.stickers.length ? '<button type="button" class="cube-show" data-k="' + k + '">Show</button>' : '') + x.text + '</li>';
      }).join('') + '</ul>';
      if (!errs.length && !r.complete) html += '<p class="lab-small">Keep painting. The checks run as you go.</p>';
    }
    box.innerHTML = html;
    box.querySelectorAll('.cube-show').forEach(function (b) { b.addEventListener('click', function () { var x = r.issues[+b.dataset.k]; view.setHighlight(x.stickers); flash(x.stickers); }); });
    view.setHighlight(Object.keys(bad).map(Number));
    refreshStickers();
    D.querySelectorAll('.cube-solve').forEach(function (b) { b.disabled = !r.ok; });
    $('cube-solve-why').hidden = r.ok;
  }
  function flash(list) {
    list.forEach(function (i) { var b = D.querySelector('#cube-net .cube-st[data-i="' + i + '"]'); if (b) { b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); } });
  }

  // ---- presets ----
  function hideNote() { var nt = $('cube-note'); if (nt) nt.hidden = true; }
  function centersOnly() { var s = M.blank(); for (var f = 0; f < 6; f++) s[f * 9 + 4] = f; return s; }
  function applyMovesText(onSolved) {
    var txt = $('cube-moves-in').value, toks = MV.parse(txt), bad = toks.filter(function (t) { return !MV.validToken(t, N) || !M.has(t); });
    var msg = $('cube-moves-msg');
    if (!toks.length) { msg.textContent = 'Type some moves first, like R U R′ U′.'; return; }
    if (bad.length) { msg.textContent = 'These aren’t moves for a ' + N + '×' + N + ': ' + bad.slice(0, 5).join(' ') + '. Use U D L R F B with ′ or 2' + (N === 4 ? ', and Uw, Rw and so on for wide turns' : '') + '.'; return; }
    msg.textContent = 'Applied ' + toks.length + ' moves.';
    setAll(M.applyAll(onSolved ? M.solved() : stickers, toks));
  }

  // ---- move pad (turn the painted cube) ----
  function buildPad() {
    var faces = ['U', 'D', 'R', 'L', 'F', 'B'], html = '';
    var rows = faces.map(function (f) { return [f, f + "'", f + '2']; });
    if (N >= 3) rows.push(['x', "x'", 'y', "y'", 'z', "z'"]);
    if (N === 4) rows.push(['Uw', "Uw'", 'Rw', "Rw'", 'Fw', "Fw'"], ['Dw', "Dw'", 'Lw', "Lw'", 'Bw', "Bw'"]);
    rows.forEach(function (r) { r.forEach(function (m) { html += '<button type="button" class="lab-btn" data-m="' + m + '" aria-label="Turn ' + m.replace("'", ' prime') + '">' + MV.pretty(m) + '</button>'; }); });
    $('cube-pad').innerHTML = html;
  }
  function turn(m) {
    if (view.busy()) view.stop();
    pushUndo();
    stickers = M.apply(stickers, m);
    view.setState(M.apply(stickers, MV.invert([m])[0]));
    view.animate(m, 260, function () { });
    refreshStickers(); persist(); clearTimeout(checkT); checkT = setTimeout(runCheck, 60);
    if (W.TRBCubeGuide && W.TRBCubeGuide.onChange) W.TRBCubeGuide.onChange(N, stickers, m);
  }

  // ---- solver (worker, or the page itself if a worker can't start) ----
  var worker = null, wReady = null, pend = {}, nid = 1, fallback = false;
  function scripts() { return (root.getAttribute('data-scripts') || '').split(/\s+/).filter(Boolean); }
  function startWorker() {
    if (wReady) return wReady;
    wReady = new Promise(function (res, rej) {
      try {
        worker = new W.Worker(root.getAttribute('data-worker'));
        worker.onmessage = function (ev) { var d = ev.data, p = pend[d.id]; if (!p) return; delete pend[d.id]; if (d.ok) p.res(d.result); else p.rej(new Error(d.error)); };
        worker.onerror = function (e) { e.preventDefault && e.preventDefault(); fallback = true; Object.keys(pend).forEach(function (k) { pend[k].rej(new Error('worker')); delete pend[k]; }); };
        post({ cmd: 'load', urls: scripts().map(function (u) { return new URL(u, D.baseURI).href; }) }).then(res, rej);
      } catch (e) { fallback = true; rej(e); }
    });
    return wReady;
  }
  function post(msg) { return new Promise(function (res, rej) { msg.id = nid++; pend[msg.id] = { res: res, rej: rej }; worker.postMessage(msg); }); }
  var mainLoaded = null;
  function loadMain() {
    if (mainLoaded) return mainLoaded;
    mainLoaded = scripts().reduce(function (p, u) {
      return p.then(function () {
        if (/\/(model|solve3|beginner)\.js/.test(u) && NS.three && NS.beginner) return null;
        return new Promise(function (res, rej) { var s = D.createElement('script'); s.src = u; s.onload = res; s.onerror = rej; D.head.appendChild(s); });
      });
    }, Promise.resolve());
    return mainLoaded;
  }
  function ask(msg) {
    function local() {
      return loadMain().then(function () { return new Promise(function (res, rej) { setTimeout(function () { try { res(msg.cmd === 'scramble' ? NS.solverCore.scramble(msg.N) : msg.cmd === 'warm' ? 1 : NS.solverCore.solve(msg)); } catch (e) { rej(e); } }, 30); }); });
    }
    if (fallback || !W.Worker) return local();
    return startWorker().then(function () { return post(msg); }).catch(function (e) { if (fallback) return local(); throw e; });
  }
  NS.ask = ask;
  var warmed = {};
  function warm(n) { if (warmed[n]) return; warmed[n] = 1; setTimeout(function () { ask({ cmd: 'warm', N: n }).catch(function () { }); }, 400); }

  function solveButtons() {
    var box = $('cube-solve-btns'), html;
    if (N === 2) html = '<button type="button" class="lab-btn pri cube-solve" data-method="optimal">Solve it (fewest moves)</button>';
    else if (N === 3) html = '<button type="button" class="lab-btn pri cube-solve" data-method="fast">Solve: fewest moves</button><button type="button" class="lab-btn pri cube-solve" data-method="beginner">Solve: beginner method</button>';
    else html = '<button type="button" class="lab-btn pri cube-solve" data-method="reduction">Solve it (by reduction)</button>';
    box.innerHTML = html;
  }
  function solve(method) {
    if (!check || !check.ok) return;
    var start = Int8Array.from(stickers);
    var busy = $('cube-busy'); busy.hidden = false; busy.textContent = N === 3 && method === 'fast' ? 'Searching for a short solution…' : 'Working it out…';
    D.querySelectorAll('.cube-solve').forEach(function (b) { b.disabled = true; });
    ask({ cmd: 'solve', N: N, stickers: Array.from(start), method: method, colorAt: check.colorAt, opp: check.opp })
      .then(function (res) { busy.hidden = true; showSolution(res, start); })
      .catch(function (e) { busy.hidden = false; busy.textContent = 'Something went wrong while solving (' + (e && e.message) + '). Please check the colors and try again.'; })
      .then(function () { D.querySelectorAll('.cube-solve').forEach(function (b) { b.disabled = !(check && check.ok); }); });
  }

  // ---- the solution and the player ----
  function showSolution(res, start) {
    P.steps = res.steps.filter(function (s) { return s.moves.length || s.stage === 0 || /already/.test(s.text); });
    P.moves = []; P.stepOf = []; P.stepStart = [];
    P.steps.forEach(function (st, k) { P.stepStart[k] = P.moves.length; st.moves.forEach(function (m) { P.moves.push(m); P.stepOf.push(k); }); });
    P.start = start; P.idx = 0; P.method = res.method; P.ms = res.ms;
    var turns = MV.turnCount(P.moves);
    var name = { optimal: 'Shortest solution', fast: 'Fewest moves (two-phase)', beginner: 'Beginner method, layer by layer', reduction: 'Reduction: centers, edges, then like a 3×3' }[res.method] || (P.steps[0] && P.steps[0].title) || 'Moves';
    $('cube-sum').innerHTML = '<b>' + name + '</b><br>' + turns + ' turns' + (P.moves.length > turns ? ' and ' + (P.moves.length - turns) + (P.moves.length - turns === 1 ? ' whole-cube turn' : ' whole-cube turns') : '') + (res.ms != null ? ' · found in ' + (res.ms < 1000 ? res.ms + ' ms' : (res.ms / 1000).toFixed(1) + ' s') : '') + '.';
    $('cube-hold').innerHTML = holdText();
    renderList();
    setMode('solve');
    goTo(0);
    var top = $('cube-view').getBoundingClientRect().top;
    if (top < 0 || top > W.innerHeight * 0.6) $('cube-view').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  function holdText() {
    var s = P.start;
    if (N === 3) return 'Hold your cube the way you entered it: ' + chip(s[22]) + ' ' + CN[s[22]] + ' center facing you, ' + chip(s[4]) + ' ' + CN[s[4]] + ' on top.' + (P.method === 'beginner' ? ' The first step turns it over.' : '');
    if (N === 2) { var cs = NS.validateHelpers.cornerStickers(2)[6]; var cols = cs.map(function (i) { return s[i]; }); return 'Hold your cube the way you entered it. The ' + cols.map(function (c) { return chip(c); }).join('') + ' ' + cols.map(function (c) { return CN[c]; }).join('-') + ' corner stays at the back, bottom left the whole time.'; }
    return 'Hold your cube the way you entered it: the side you entered as the front facing you, the top on top.';
  }
  function renderList() {
    var html = '';
    P.steps.forEach(function (st, k) {
      var first = P.stepStart[k];
      html += '<section class="cube-step" data-k="' + k + '"><h3><button type="button" class="cube-jump" data-i="' + first + '">' + esc(st.title) + '</button><span class="cube-n">' + (!st.moves.length ? 'no turns' : !MV.turnCount(st.moves) ? 'whole cube' : MV.turnCount(st.moves) + (MV.turnCount(st.moves) === 1 ? ' turn' : ' turns')) + '</span></h3><p>' + esc(st.text) + '</p>';
      if (st.moves.length) {
        html += '<ol class="cube-mlist" start="' + (first + 1) + '">';
        st.moves.forEach(function (m, j) { html += '<li><button type="button" class="cube-mv' + (MV.isRotation(m) ? ' rot' : '') + '" data-i="' + (first + j) + '" aria-label="Move ' + (first + j + 1) + ': ' + speak(m) + '">' + MV.pretty(m) + '</button></li>'; });
        html += '</ol>';
      }
      html += '</section>';
    });
    $('cube-list').innerHTML = html;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function speak(m) { return m.replace(/'/g, ' prime').replace(/2$/, ' two').replace('w', ' wide'); }
  function describe(m) {
    var b = m[0], q = MV.amount(m), wide = /w/.test(m);
    var dir = q === 2 ? 'a half turn' : q === 1 ? 'clockwise' : 'counterclockwise';
    if ('xyz'.indexOf(b) >= 0) return 'Turn the whole cube ' + (q === 2 ? 'a half turn' : 'the way ' + { x: 'R', y: 'U', z: 'F' }[b] + (q === 3 ? '′' : '') + ' turns') + ' (' + { x: 'tip it forward or back', y: 'spin it on the table', z: 'roll it sideways' }[b] + ').';
    var f = 'URFDLB'.indexOf(b);
    return 'Turn the ' + FACE_NAME[f] + (wide ? ' two layers' : ' face') + ' ' + dir + (q === 2 ? '.' : ', as you look straight at the ' + FACE_NAME[f] + '.');
  }
  function stateAt(k) { var s = P.start; for (var i = 0; i < k; i++) s = M.apply(s, P.moves[i]); return s; }
  function goTo(k) {
    stopPlay(false); view.stop();
    P.idx = Math.max(0, Math.min(P.moves.length, k));
    view.setState(stateAt(P.idx));
    updatePlayer();
  }
  function dur() { return 820 / SPEEDS[speedI]; }
  function fwd(cb) {
    if (P.idx >= P.moves.length) { if (cb) cb(false); return; }
    if (view.busy()) view.stop();
    var m = P.moves[P.idx]; P.idx++;
    updatePlayer(m);
    view.animate(m, dur(), function () { updatePlayer(); if (cb) cb(true); });
  }
  function back() {
    if (P.idx <= 0) return;
    stopPlay(false);
    if (view.busy()) view.stop();
    P.idx--; var m = MV.invert([P.moves[P.idx]])[0];
    updatePlayer(m);
    view.animate(m, dur(), function () { updatePlayer(); });
  }
  function play() {
    if (P.idx >= P.moves.length) goTo(0);
    P.playing = true; updatePlayer();
    (function loop() {
      if (!P.playing) return;
      fwd(function (moved) {
        if (!moved || P.idx >= P.moves.length) { stopPlay(); return; }
        var stepEnd = P.stepOf[P.idx] !== P.stepOf[P.idx - 1];
        if (stepEnd && $('cube-pause').checked) { stopPlay(); return; }
        P.timer = setTimeout(loop, 160 / SPEEDS[speedI]);
      });
    })();
  }
  function stopPlay(upd) { P.playing = false; clearTimeout(P.timer); if (upd !== false) updatePlayer(); }
  function updatePlayer(animating) {
    if (mode !== 'solve') return;
    var L = P.moves.length, i = P.idx, next = i < L ? P.moves[i] : null;
    var showing = animating || next;
    var mv = $('cube-move');
    if (showing) {
      mv.innerHTML = '<span class="cube-big">' + MV.pretty(showing) + '</span><span class="cube-desc">' + describe(showing) + '</span>';
      view.setArrow(showing);
    } else {
      mv.innerHTML = '<span class="cube-big done">Solved!</span><span class="cube-desc">' + (L ? 'All ' + MV.turnCount(P.moves) + ' turns done.' : 'Nothing to do.') + '</span>';
      view.setArrow(null);
    }
    var k = i < L ? P.stepOf[i] : P.steps.length - 1;
    if (animating) k = P.stepOf[i - 1] != null ? P.stepOf[i - 1] : k;
    var st = P.steps[k];
    if (st) { $('cube-step-title').textContent = st.title; $('cube-step-text').textContent = st.text; $('cube-step-n').textContent = 'Step ' + (k + 1) + ' of ' + P.steps.length; }
    $('cube-count').textContent = 'Move ' + Math.min(i + (animating ? 0 : 1), L) + ' of ' + L;
    if (!L) $('cube-count').textContent = '';
    $('cube-p-play').innerHTML = P.playing ? '❚❚' : '▶';
    $('cube-p-play').setAttribute('aria-label', P.playing ? 'Pause' : 'Play');
    $('cube-p-start').disabled = $('cube-p-back').disabled = i === 0;
    $('cube-p-end').disabled = $('cube-p-fwd').disabled = i >= L;
    D.querySelectorAll('#cube-list .cube-mv').forEach(function (b) {
      var j = +b.dataset.i; b.classList.toggle('done', j < i - (animating ? 1 : 0)); var cur = j === (animating ? i - 1 : i);
      b.classList.toggle('cur', cur); if (cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    D.querySelectorAll('#cube-list .cube-step').forEach(function (s) { s.classList.toggle('cur', +s.dataset.k === k); });
    var hud = $('cube-hud');
    hud.innerHTML = L ? '<b>' + (st ? esc(st.title) : '') + '</b>' : '';
  }

  function setMode(m) {
    mode = m;
    if (m !== 'solve') stopPlay(false);
    $('cube-p-enter').hidden = m !== 'enter'; $('cube-p-solve').hidden = m !== 'solve';
    $('cube-entry').hidden = m !== 'enter'; $('cube-steps').hidden = m !== 'solve';
    $('cube-player').hidden = m !== 'solve'; $('cube-move').hidden = m !== 'solve';
    D.querySelectorAll('#cube-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.mode === m)); });
    $('cube-tab-solve').disabled = !P.start;
    view.setPaintable(m === 'enter');
    root.setAttribute('data-mode', m);
    if (m === 'enter') {
      view.setArrow(null); refreshStickers(); view.setState(stickers); runCheck();
      $('cube-hud').innerHTML = 'Painting with <b class="cube-paintwith">' + (paintColor < 0 ? 'the eraser' : CN[paintColor]) + '</b>';
      if (entryView === 'scan') faceView(SCAN[scanFace]);
    } else { view.setHighlight([]); view.setFocus(-1); view.resetView(); }
  }

  // ---- printing ----
  function printList() {
    var box = $('cube-print'), s = P.start, html = '<h1>Cube Solver: your solution</h1><p>' + N + '×' + N + ' cube · ' + esc($('cube-sum').innerText.replace(/\s*\n\s*/g, ' · ')) + '</p><p>' + $('cube-hold').textContent + '</p>';
    html += '<div class="cube-pnet" style="--n:' + N + '">';
    for (var f = 0; f < 6; f++) {
      html += '<div class="cube-pface" style="grid-column:' + (NET[f][0] + 1) + ';grid-row:' + (NET[f][1] + 1) + '">';
      for (var k = 0; k < M.NN; k++) html += '<i data-c="' + s[f * M.NN + k] + '"></i>';
      html += '</div>';
    }
    html += '</div><p class="cube-pkey">Moves: U top, D bottom, R right, L left, F front, B back. A letter alone is a clockwise quarter turn as you look at that face; ′ means counterclockwise; 2 means a half turn' + (N === 4 ? '; w means that face and the layer next to it' : '') + (P.moves.some(MV.isRotation) ? '; x, y and z turn the whole cube' : '') + '.</p>';
    var n = 0;
    P.steps.forEach(function (st) {
      html += '<h2>' + esc(st.title) + '</h2><p>' + esc(st.text) + '</p>';
      if (st.moves.length) html += '<p class="cube-pmoves">' + st.moves.map(function (m) { n++; return '<span><small>' + n + '</small>' + MV.pretty(m) + '</span>'; }).join(' ') + '</p>';
    });
    html += '<p class="cube-pfoot">teddyrookbook.com · Cube Solver</p>';
    box.innerHTML = html;
    D.documentElement.classList.add('cube-printing');
    setTimeout(function () { W.print(); }, 50);
  }
  W.addEventListener('afterprint', function () { D.documentElement.classList.remove('cube-printing'); });

  // ---- keys on the 3-D cube ----
  function canvasKey(e) {
    if (mode === 'solve') {
      if (e.key === ' ' || e.key === 'k') { if (P.playing) stopPlay(); else play(); return true; }
      if (e.key === 'ArrowRight') { stopPlay(false); fwd(); return true; }
      if (e.key === 'ArrowLeft') { back(); return true; }
      if (e.key === 'Home') { goTo(0); return true; }
      if (e.key === 'End') { goTo(P.moves.length); return true; }
      return false;
    }
    if (paletteKey(e)) return true;
    var f = 'URFDLB'.indexOf(e.key.toUpperCase());
    if (f >= 0 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) { turn('URFDLB'[f] + (e.shiftKey ? "'" : '')); return true; }
    return false;
  }

  // ---- wire up ----
  buildPalette();
  $('cube-size').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && +b.dataset.n !== N) setSize(+b.dataset.n); });
  $('cube-tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) setMode(b.dataset.mode); });
  $('cube-net').addEventListener('click', function (e) {
    if (small) { var fb = e.target.closest('.cube-face'); if (fb) { scanFace = SCAN.indexOf(+fb.dataset.f); setEntryView('scan'); buildScan(); } return; }
    var b = e.target.closest('.cube-st'); if (!b) return;
    var i = +b.dataset.i;
    if (entryView === 'scan' && SCAN[scanFace] !== M.face[i]) { scanFace = SCAN.indexOf(M.face[i]); buildScan(); }
    paint(i);
  });
  $('cube-net').addEventListener('keydown', netKey);
  $('cube-net').addEventListener('focusin', function (e) { var b = e.target.closest('.cube-st'); if (b) { focusIdx = +b.dataset.i; view.setFocus(focusIdx); } });
  $('cube-net').addEventListener('focusout', function () { view.setFocus(-1); });
  $('cube-scan-grid').addEventListener('click', function (e) { var b = e.target.closest('.cube-st'); if (b) paint(+b.dataset.i); });
  $('cube-scan-grid').addEventListener('keydown', function (e) { paletteKey(e); });
  $('cube-scan-prev').addEventListener('click', function () { if (scanFace > 0) { scanFace--; buildScan(); } });
  $('cube-scan-next').addEventListener('click', function () { if (scanFace < 5) { scanFace++; buildScan(); } else { $('cube-check').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); } });
  $('cube-scan-fill').addEventListener('click', function () { if (paintColor < 0 && !stickers.some(function (x) { return x >= 0; })) return; pushUndo(); var f = SCAN[scanFace]; for (var k = 0; k < M.NN; k++) stickers[f * M.NN + k] = paintColor; changed(); });
  $('cube-entry-mode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setEntryView(b.dataset.v); });
  $('cube-solved').addEventListener('click', function () { hideNote(); setAll(M.solved()); });
  $('cube-centers').addEventListener('click', function () { hideNote(); setAll(centersOnly()); });
  $('cube-blank').addEventListener('click', function () { hideNote(); setAll(M.blank()); });
  $('cube-scramble').addEventListener('click', function () {
    var b = this; b.disabled = true; var n0 = N; hideNote();
    ask({ cmd: 'scramble', N: N }).then(function (r) { if (N !== n0) return; $('cube-moves-in').value = r.moves.map(MV.pretty).join(' '); $('cube-moves-msg').textContent = 'Scrambled with these ' + r.moves.length + ' moves (shown in the box above).'; setAll(M.applyAll(M.solved(), r.moves)); })
      .catch(function () { setAll(M.applyAll(M.solved(), MV.randomMoves(N, N === 4 ? 40 : 25))); })
      .then(function () { b.disabled = false; });
  });
  $('cube-undo').addEventListener('click', doUndo);
  $('cube-apply-solved').addEventListener('click', function () { applyMovesText(true); });
  $('cube-apply-here').addEventListener('click', function () { applyMovesText(false); });
  $('cube-scheme').value = scheme;
  $('cube-scheme').addEventListener('change', function () { scheme = this.value; store.scheme = scheme; save(); runCheck(); });
  $('cube-pad-toggle').addEventListener('click', function () { var p = $('cube-pad'), on = p.hidden; p.hidden = !on; this.setAttribute('aria-expanded', String(on)); });
  $('cube-pad').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) turn(b.dataset.m); });
  $('cube-solve-btns').addEventListener('click', function (e) { var b = e.target.closest('.cube-solve'); if (b && !b.disabled) solve(b.dataset.method); });
  $('cube-p-start').addEventListener('click', function () { goTo(0); });
  $('cube-p-back').addEventListener('click', back);
  $('cube-p-play').addEventListener('click', function () { if (P.playing) stopPlay(); else play(); });
  $('cube-p-fwd').addEventListener('click', function () { stopPlay(false); fwd(); });
  $('cube-p-end').addEventListener('click', function () { goTo(P.moves.length); });
  var sp = $('cube-speed'); sp.value = speedI; $('cube-speed-o').textContent = SPEEDS[speedI] + ' moves/s';
  sp.addEventListener('input', function () { speedI = +sp.value; $('cube-speed-o').textContent = SPEEDS[speedI] + ' moves/s'; store.speed = speedI; save(); });
  $('cube-pause').checked = store.pause !== false;
  $('cube-pause').addEventListener('change', function () { store.pause = this.checked; save(); });
  $('cube-list').addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) goTo(+b.dataset.i); });
  $('cube-print-btn').addEventListener('click', printList);
  $('cube-edit').addEventListener('click', function () { setMode('enter'); });
  $('cube-flip').addEventListener('click', function () { view.flip(); });
  $('cube-home').addEventListener('click', function () { view.resetView(); });
  var rT = 0; W.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { sizeNet(); refreshStickers(); }, 120); });

  setSize(N);
  setEntryView(small ? 'scan' : 'net', true);

  NS.app = {
    load: function (n, s, note) { if (n !== N) setSize(n, s); else { setAll(s); setMode('enter'); } if (note) { $('cube-note').innerHTML = note; $('cube-note').hidden = false; } else $('cube-note').hidden = true; $('cube-view').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); },
    size: function () { return N; }, stickers: function () { return stickers; }, solve: solve, setSize: setSize,
    play: function (n, start, moves, title) { var st = [{ stage: 0, title: title || 'Demo', text: '', moves: moves }]; if (n !== N) setSize(n, start); showSolution({ steps: st, method: 'demo', ms: null }, Int8Array.from(start)); }
  };
})(window, document);
