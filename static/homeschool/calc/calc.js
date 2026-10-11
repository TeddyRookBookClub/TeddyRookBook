/* Teddy Rook Book calculator: a graphing screen (like Desmos) and a calculator screen (like a TI-89),
   both built on cas.js. Everything runs in the browser; nothing is sent anywhere. */
(function (W, D) {
  'use strict';
  var CAS = W.CAS, KEY = 'trb-calc-v1';
  var COLORS = ['#c74440', '#2d70b3', '#388c46', '#6042a6', '#fa7e19', '#000000', '#b5338a', '#127a8a'];
  var RESERVED = { x: 1, y: 1, r: 1, t: 1, e: 1, i: 1, theta: 1, 'θ': 1 };
  var DEFAULT_ROWS = [{ src: 'y = x^2 - 2' }, { src: 'y = sin(x)' }, { src: '' }];
  var root = D.getElementById('calc'); if (!root || !CAS) return;
  var $ = function (s, el) { return (el || root).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(v, d) { return CAS.fmtNum(v, d || 6); }

  // ---------------- state ----------------
  var st = { tab: 'graph', rows: null, view: { x: 0, y: 0, ppu: 40 }, deg: false, hist: [], keys: false, dec: false };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv && sv.rows) st = Object.assign(st, sv); } catch (e) { }
  if (!st.rows || !st.rows.length) st.rows = DEFAULT_ROWS.map(function (r) { return Object.assign({}, r); });
  var nextColor = 0;
  st.rows.forEach(function (r) { if (r.color === undefined) r.color = nextColor++ % COLORS.length; else nextColor = Math.max(nextColor, r.color + 1); });
  var saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { W.localStorage.setItem(KEY, JSON.stringify({ tab: st.tab, rows: st.rows, view: st.view, deg: st.deg, hist: st.hist.slice(-60), keys: st.keys, dec: st.dec })); } catch (e) { } }, 300); }

  // ---------------- tabs and settings ----------------
  function setTab(t) {
    st.tab = t;
    root.querySelectorAll('.cx-tab').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === t ? 'true' : 'false'); });
    $('.cx-graph').hidden = t !== 'graph'; $('.cx-home').hidden = t !== 'home'; $('.cx-help').hidden = t !== 'help';
    $('.cx-keys').hidden = !st.keys || t === 'help';
    if (t === 'graph') { resize(); } if (t === 'home') { $('#cx-in').focus({ preventScroll: true }); scrollHist(); }
    save();
  }
  root.querySelectorAll('.cx-tab').forEach(function (b) { b.addEventListener('click', function () { setTab(b.dataset.tab); }); });
  var degBtn = $('#cx-deg');
  function showDeg() { degBtn.textContent = st.deg ? 'Degrees' : 'Radians'; degBtn.setAttribute('aria-pressed', st.deg ? 'true' : 'false'); }
  degBtn.addEventListener('click', function () { st.deg = !st.deg; showDeg(); analyzeAll(); draw(); save(); });
  var keysBtn = $('#cx-keysbtn');
  function showKeys() { $('.cx-keys').hidden = !st.keys || st.tab === 'help'; keysBtn.setAttribute('aria-pressed', st.keys ? 'true' : 'false'); if (st.tab === 'graph') resize(); }
  keysBtn.addEventListener('click', function () { st.keys = !st.keys; showKeys(); save(); });

  // ================= GRAPH =================
  var list = $('.cx-rows'), cv = $('#cx-cv'), g = cv.getContext('2d'), tip = $('.cx-tip');
  var items = [], active = -1, Wd = 0, Ht = 0, dpr = 1;
  var gctx = null;

  function rowHTML(r, i) {
    return '<div class="cx-row" data-i="' + i + '"><button type="button" class="cx-sw' + (r.hide ? ' off' : '') + '" style="--c:' + COLORS[r.color % COLORS.length] + '" aria-label="Show or hide this graph" title="Show or hide"></button>' +
      '<div class="cx-rmain"><input class="cx-ex" type="text" value="' + esc(r.src) + '" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Expression ' + (i + 1) + '" placeholder="' + (i === 0 ? 'Type an equation, like y = 2x + 1' : '') + '">' +
      '<div class="cx-info" aria-live="polite"></div></div><button type="button" class="cx-del" aria-label="Delete this row" title="Delete">×</button></div>';
  }
  function renderRows() {
    list.innerHTML = st.rows.map(rowHTML).join('');
    list.querySelectorAll('.cx-row').forEach(bindRow);
    analyzeAll(); draw();
  }
  function bindRow(el) {
    var i = +el.dataset.i, inp = $('.cx-ex', el);
    inp.addEventListener('input', function () { st.rows[i].src = inp.value; analyzeAll(); draw(); save(); });
    inp.addEventListener('focus', function () { setActive(i); lastInput = inp; });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (i === st.rows.length - 1 || st.rows[i + 1].src) addRow('', i + 1); else focusRow(i + 1); }
      else if (e.key === 'ArrowDown' && i < st.rows.length - 1) { e.preventDefault(); focusRow(i + 1); }
      else if (e.key === 'ArrowUp' && i > 0) { e.preventDefault(); focusRow(i - 1); }
      else if (e.key === 'Backspace' && !inp.value && st.rows.length > 1) { e.preventDefault(); delRow(i, true); }
    });
    $('.cx-sw', el).addEventListener('click', function () { st.rows[i].hide = !st.rows[i].hide; this.classList.toggle('off', st.rows[i].hide); draw(); save(); });
    $('.cx-del', el).addEventListener('click', function () { delRow(i); });
  }
  function focusRow(i) { var e = list.querySelector('.cx-row[data-i="' + i + '"] .cx-ex'); if (e) { e.focus(); var n = e.value.length; try { e.setSelectionRange(n, n); } catch (er) { } } }
  function addRow(src, at, noFocus) {
    if (at === undefined) { // reuse an empty last row
      var last = st.rows[st.rows.length - 1]; if (last && !last.src.trim()) { last.src = src; renderRows(); if (!noFocus) focusRow(st.rows.length - 1); return; }
      at = st.rows.length;
    }
    st.rows.splice(at, 0, { src: src, color: nextColor++ % COLORS.length }); renderRows(); if (!noFocus) focusRow(at); save();
  }
  function delRow(i, toPrev) {
    st.rows.splice(i, 1); if (!st.rows.length) st.rows.push({ src: '', color: nextColor++ % COLORS.length });
    if (active >= st.rows.length) active = st.rows.length - 1;
    renderRows(); focusRow(toPrev ? Math.max(0, i - 1) : Math.min(i, st.rows.length - 1)); save();
  }
  function setActive(i) { if (active === i) return; active = i; list.querySelectorAll('.cx-row').forEach(function (r) { r.classList.toggle('act', +r.dataset.i === i); }); computePOI(); draw(); }
  $('#cx-add').addEventListener('click', function () { addRow(''); });
  $('#cx-clear').addEventListener('click', function () { if (!W.confirm || W.confirm('Clear all the rows?')) { st.rows = [{ src: '', color: nextColor++ % COLORS.length }]; renderRows(); focusRow(0); save(); } });

  // ---- analysing each row ----
  var CMDS = { d: 1, int: 1, taylor: 1, expand: 1, factor: 1, simplify: 1, sum: 1, product: 1, comdenom: 1, limit: 1, mean: 1, median: 1, stdev: 1, variance: 1, total: 1, det: 1, trace: 1, norm: 1, dot: 1, length: 1, approx: 1, exact: 1, linreg: 1, quadreg: 1, expreg: 1 };
  function runCmds(x) {
    if (!x || !x.a) return x;
    var c = Object.assign({}, x); c.a = x.a.map(function (y) { return Array.isArray(y) ? y.map(runCmds) : runCmds(y); });
    if (c.k === 'f' && CMDS[c.name]) return CAS.evaluate(c, gctx);
    return c;
  }
  function info(i, html, cls) { var el = list.querySelector('.cx-row[data-i="' + i + '"] .cx-info'); if (el) { el.innerHTML = html || ''; el.className = 'cx-info' + (cls ? ' ' + cls : ''); } }
  function num(node) { var v = CAS.evalNum(CAS.simp(node)); return typeof v === 'number' ? v : NaN; }
  function prep(src) { // strip a {domain} at the end, Desmos-style
    var m = /^(.*?)\{([^{}]*[<>≤≥][^{}]*)\}\s*$/.exec(src);
    return m ? { body: m[1], dom: m[2] } : { body: src, dom: null };
  }
  var constNames = {};
  var DEF_RE = /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\(\s*([a-zA-Zθ]\w*(?:\s*,\s*[a-zA-Zθ]\w*)*)\s*\)\s*=(?!=)(.+)$/;
  var SLIDER_RE = /^\s*([a-zA-Z](?:_?[0-9]+)?|[a-zA-Z][a-zA-Z0-9_]+)\s*=\s*(-?\d*\.?\d+(?:e-?\d+)?)\s*$/;
  var CONST_RE = /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*=(?!=)(.+)$/;
  function defKind(src) {
    var m;
    if ((m = SLIDER_RE.exec(src)) && !RESERVED[m[1]]) return { k: 'slider', name: m[1], val: parseFloat(m[2]) };
    if ((m = DEF_RE.exec(src)) && CAS.FUNCS.indexOf(m[1]) < 0) return { k: 'def', name: m[1], params: m[2].split(',').map(function (s) { return s.trim(); }), body: m[3] };
    if ((m = CONST_RE.exec(src)) && !RESERVED[m[1]] && CAS.FUNCS.indexOf(m[1]) < 0) {
      try { var t = CAS.parse(m[2], { funcs: {}, vars: constNames }), fv = CAS.freeVars(t); if (!fv.x && !fv.y && !fv['θ'] && !fv.t && !fv[m[1]]) return { k: 'const', name: m[1], body: m[2] }; } catch (e) { }
    }
    return null;
  }
  function analyzeAll() {
    CAS.STATE.deg = st.deg;
    gctx = new CAS.Ctx(); gctx.deg = st.deg; items = [];
    constNames = {}; st.rows.forEach(function (r) { var m = CONST_RE.exec(r.src); if (m && m[1].length > 1) constNames[m[1]] = 1; });
    var kinds = st.rows.map(function (r) { return defKind(r.src); });
    // definitions first (twice, so they can refer to each other in any order)
    for (var pass = 0; pass < 2; pass++) st.rows.forEach(function (r, i) {
      var k = kinds[i]; if (!k) return;
      try {
        if (k.k === 'slider') gctx.vars[k.name] = CAS.parse(String(k.val));
        else if (k.k === 'def') CAS.run(k.name + '(' + k.params.join(',') + ') := ' + k.body, gctx);
        else if (k.k === 'const') CAS.run(k.name + ' := ' + k.body, gctx);
      } catch (e) { }
    });
    st.rows.forEach(function (r, i) {
      var it = { i: i, color: COLORS[r.color % COLORS.length], kind: 'blank' }; items.push(it);
      var src = r.src.trim(); if (!src) { info(i, ''); return; }
      var k = kinds[i];
      try {
        if (k && k.k === 'slider') { it.kind = 'slider'; sliderUI(i, r, k); return; }
        if (k && k.k === 'const') { var cv0 = gctx.vars[k.name]; if (cv0 && cv0.k === 'list') { it.kind = 'none'; info(i, cv0.a.length + ' values', 'val'); } else info(i, cv0 ? '= ' + esc(CAS.show(cv0)) : '', 'val'); return; }
        var p = prep(src), tree;
        if (k && k.k === 'def') {
          var fn = gctx.funcs[k.name]; if (!fn) throw new Error('I couldn\'t read that function');
          if (fn.params.length !== 1) { info(i, 'Function of ' + fn.params.join(', ')); return; }
          tree = { k: 'rel', op: '=', a: [{ k: 's', name: 'y' }, CAS.simp(replaceVar(fn.body, fn.params[0], 'x'))] };
          if (/\bx\b/.test(fn.params[0]) === false && fn.params[0] !== 'x') info(i, 'Graphed with ' + esc(fn.params[0]) + ' along the x-axis');
        } else {
          tree = CAS.parse(p.body, gctx);
        }
        tree = runCmds(CAS.substAll(tree, gctx));
        classify(it, tree, r);
        if (p.dom) it.dom = domainFn(p.dom);
        var missing = Object.keys(CAS.freeVars(tree)).filter(function (v) { return !RESERVED[v] && v !== 'θ' && v !== 'λ'; });
        if (missing.length && it.kind !== 'value') {
          it.kind = 'none';
          info(i, 'Add a slider for <button type="button" class="cx-mk" data-v="' + esc(missing.join(',')) + '">' + missing.map(esc).join(', ') + '</button>', 'hint');
          var b = list.querySelector('.cx-row[data-i="' + i + '"] .cx-mk'); if (b) b.addEventListener('click', function () { b.dataset.v.split(',').forEach(function (v, j) { st.rows.splice(i + 1 + j, 0, { src: v + ' = 1', color: nextColor++ % COLORS.length }); }); renderRows(); save(); });
          return;
        }
        if (!it.msg && it.kind !== 'value') info(i, it.note || '', it.note ? 'val' : '');
      } catch (e) { it.kind = 'error'; info(i, '⚠ ' + esc(e.message || 'I can\'t read that yet'), 'err'); }
    });
    computePOI();
  }
  function replaceVar(x, from, to) { if (from === to) return x; if (x.k === 's') return x.name === from ? { k: 's', name: to } : x; if (!x.a) return x; var c = Object.assign({}, x); c.a = x.a.map(function (y) { return Array.isArray(y) ? y.map(function (z) { return replaceVar(z, from, to); }) : replaceVar(y, from, to); }); return c; }
  function compile(node, vars) { return CAS.compile(CAS.simp(node), vars, {}); }
  function has(node, v) { return CAS.hasVar(node, v); }
  function isSym(x, n) { return x && x.k === 's' && x.name === n; }
  function classify(it, tree, r) {
    var X = 'x', Y = 'y';
    if (tree.k === 'text') { info(it.i, esc(tree.s), 'val'); it.kind = 'value'; if (tree.coef) { var c = tree.coef; it.kind = 'fx'; it.f = function (x) { var s = 0; for (var k = c.length - 1; k >= 0; k--) s = s * x + c[k]; return s; }; it.msg = 1; } return; }
    if (tree.k === 'tuple' && tree.a.length === 2) {
      if (has(tree, 't')) { it.kind = 'param'; it.fx = compile(tree.a[0], ['t']); it.fy = compile(tree.a[1], ['t']); rangeUI(it, r, 't', 0, 2 * Math.PI); return; }
      if (tree.a[0].k === 'list' && tree.a[1].k === 'list') { it.kind = 'points'; it.pts = tree.a[0].a.map(function (x, j) { return [num(x), num(tree.a[1].a[j] || { k: 'n', v: NaN })]; }); info(it.i, it.pts.length + ' points', 'val'); it.msg = 1; return; }
      it.kind = 'points'; it.pts = [[num(tree.a[0]), num(tree.a[1])]]; it.label = true; return;
    }
    if (tree.k === 'list' && tree.a.length && tree.a.every(function (p) { return p.k === 'tuple'; })) { it.kind = 'points'; it.pts = tree.a.map(function (p) { return [num(p.a[0]), num(p.a[1])]; }); return; }
    if (tree.k === 'list' && tree.a.length && has(tree, 'x')) { // a family of curves, like y = {1,2,3}x
      it.kind = 'multi'; it.fs = tree.a.map(function (y) { return compile(y, ['x']); }); return;
    }
    if (tree.k === 'rel' && tree.a.length === 2) {
      var L = tree.a[0], R = tree.a[1], op = tree.op;
      var flip = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '=': '=', '!=': '!=' };
      if (isSym(R, Y) && !has(L, Y) || isSym(R, X) && !has(L, X) && has(L, Y) || isSym(R, 'r') && !has(L, 'r')) { var t = L; L = R; R = t; op = flip[op]; }
      if (isSym(L, Y) && !has(R, Y)) {
        if (R.k === 'list') { it.kind = 'multi'; it.fs = R.a.map(function (y) { return compile(y, ['x']); }); return; }
        it.f = compile(R, ['x']);
        if (op === '=') { it.kind = 'fx'; it.expr = R; return; }
        it.kind = 'shadey'; it.op = op; return;
      }
      if (isSym(L, X) && !has(R, X)) { it.f = compile(R, ['y']); if (op === '=') { it.kind = 'xy'; return; } it.kind = 'shadex'; it.op = op; return; }
      if (isSym(L, 'r') && !has(R, 'r')) { it.kind = 'polar'; it.f = compile(R, ['theta']); rangeUI(it, r, 'θ', 0, 2 * Math.PI); return; }
      if (has(tree, X) || has(tree, Y)) {
        it.kind = 'implicit'; it.op = op; it.F = compile({ k: '+', a: [L, { k: '*', a: [{ k: 'n', v: new CAS.Q(-1n, 1n) }, R] }] }, ['x', 'y']); return;
      }
      var res = CAS.run(r.src, gctx); info(it.i, esc(res.out), 'val'); it.kind = 'value'; return;
    }
    if (has(tree, X) && !has(tree, Y)) { it.kind = 'fx'; it.expr = tree; it.f = compile(tree, ['x']); return; }
    if (has(tree, 'θ') && !has(tree, X) && !has(tree, Y)) { it.kind = 'polar'; it.f = compile(tree, ['theta']); rangeUI(it, r, 'θ', 0, 2 * Math.PI); return; }
    if (has(tree, X) || has(tree, Y)) { it.kind = 'none'; info(it.i, 'Add “= …” to make an equation to graph', 'hint'); it.msg = 1; return; }
    // a plain value
    it.kind = 'value';
    var out = CAS.simp(tree), s = CAS.show(out), v = CAS.evalNum(out, { __complex: true });
    var ap = typeof v === 'number' ? fmt(v, 10) : (v && v.re !== undefined ? CAS.fmtNum(v, 10) : '');
    info(it.i, '= ' + esc(s) + (ap && ap !== s ? ' <span class="ap">≈ ' + esc(ap) + '</span>' : ''), 'val');
  }
  function domainFn(src) {
    var t = CAS.substAll(CAS.parse(src, gctx), gctx), parts = t.a, ops = t.k === 'chain' ? t.ops : [t.op];
    var fs = parts.map(function (p) { return compile(p, ['x', 'y', 'theta', 't']); });
    var cmp = { '<': function (a, b) { return a < b; }, '>': function (a, b) { return a > b; }, '<=': function (a, b) { return a <= b; }, '>=': function (a, b) { return a >= b; }, '=': function (a, b) { return Math.abs(a - b) < 1e-9; } };
    return function (x, y, th, tt) { var v = fs.map(function (f) { return f(x, y, th, tt); }); for (var k = 0; k < ops.length; k++) if (!cmp[ops[k]](v[k], v[k + 1])) return false; return true; };
  }
  function sliderUI(i, r, k) {
    var lo = r.min !== undefined ? r.min : Math.min(-10, k.val), hi = r.max !== undefined ? r.max : Math.max(10, k.val), step = r.step || 0.1;
    var el = list.querySelector('.cx-row[data-i="' + i + '"] .cx-info'); if (!el) return;
    if (!el.querySelector('.cx-sl')) {
      el.className = 'cx-info sl';
      el.innerHTML = '<div class="cx-sl"><input class="cx-n" type="number" step="any" value="' + lo + '" aria-label="Lowest"><input type="range" min="' + lo + '" max="' + hi + '" step="' + step + '" value="' + k.val + '" aria-label="' + esc(k.name) + '"><input class="cx-n" type="number" step="any" value="' + hi + '" aria-label="Highest"><button type="button" class="cx-play" aria-label="Play" title="Play">▶</button></div>';
      var rg = el.querySelector('input[type=range]'), ns = el.querySelectorAll('.cx-n'), play = el.querySelector('.cx-play'), timer = 0, dir = 1;
      rg.addEventListener('input', function () { setVal(+rg.value); });
      function setVal(v) { v = Math.round(v * 1e6) / 1e6; r.src = k.name + ' = ' + v; var inp = list.querySelector('.cx-row[data-i="' + i + '"] .cx-ex'); inp.value = r.src; analyzeAll(); draw(); save(); }
      ns[0].addEventListener('change', function () { r.min = +ns[0].value; rg.min = r.min; save(); });
      ns[1].addEventListener('change', function () { r.max = +ns[1].value; rg.max = r.max; save(); });
      play.addEventListener('click', function () {
        if (timer) { clearInterval(timer); timer = 0; play.textContent = '▶'; return; }
        play.textContent = '❚❚';
        timer = setInterval(function () { if (!D.body.contains(rg)) return clearInterval(timer); var v = +rg.value + dir * (+rg.max - +rg.min) / 120; if (v > +rg.max) { v = +rg.max; dir = -1; } if (v < +rg.min) { v = +rg.min; dir = 1; } rg.value = v; setVal(v); }, 40);
      });
    } else el.querySelector('input[type=range]').value = k.val;
  }
  function rangeUI(it, r, v, a, b) {
    it.tmin = r.tmin !== undefined ? r.tmin : a; it.tmax = r.tmax !== undefined ? r.tmax : b;
    var el = list.querySelector('.cx-row[data-i="' + it.i + '"] .cx-info'); if (!el) return;
    el.className = 'cx-info rg';
    el.innerHTML = '<label>' + v + ' from <input class="cx-n" type="text" value="' + esc(r.tminS || '0') + '" aria-label="Start"></label> <label>to <input class="cx-n" type="text" value="' + esc(r.tmaxS || '2π') + '" aria-label="End"></label>';
    var ns = el.querySelectorAll('input');
    function upd(j) { var s = ns[j].value, val = num(CAS.parse(s) || { k: 'n', v: NaN }); if (!isFinite(val)) return; if (j) { r.tmax = val; r.tmaxS = s; } else { r.tmin = val; r.tminS = s; } it.tmin = r.tmin !== undefined ? r.tmin : a; it.tmax = r.tmax !== undefined ? r.tmax : b; draw(); save(); }
    ns[0].addEventListener('change', function () { upd(0); }); ns[1].addEventListener('change', function () { upd(1); });
    it.msg = 1;
  }

  // ---- drawing ----
  function resize() {
    var box = cv.parentNode.getBoundingClientRect(); dpr = W.devicePixelRatio || 1;
    Wd = Math.max(100, box.width); Ht = Math.max(100, box.height);
    cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr); cv.style.width = Wd + 'px'; cv.style.height = Ht + 'px';
    computePOI(); draw();
  }
  function px(x) { return Wd / 2 + (x - st.view.x) * st.view.ppu; }
  function py(y) { return Ht / 2 - (y - st.view.y) * st.view.ppu; }
  function wx(p) { return st.view.x + (p - Wd / 2) / st.view.ppu; }
  function wy(p) { return st.view.y - (p - Ht / 2) / st.view.ppu; }
  function niceStep(target) { var m = Math.pow(10, Math.floor(Math.log10(target))), r = target / m; return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * m; }
  function axisLabel(v, step) { var d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9)); var s = Math.abs(v) < step / 1e6 ? '0' : (Math.abs(v) >= 1e6 || Math.abs(v) < 1e-4 ? v.toExponential(1) : v.toFixed(Math.min(d, 10))); return s.replace('-', '−'); }
  function draw() {
    if (!Wd || st.tab !== 'graph') return;
    var cs = getComputedStyle(root), bg = cs.getPropertyValue('--cx-bg').trim() || '#fff', grid = cs.getPropertyValue('--cx-grid').trim() || '#e6e6e6', grid2 = cs.getPropertyValue('--cx-grid2').trim() || '#c8c8c8', ax = cs.getPropertyValue('--cx-axis').trim() || '#222', lab = cs.getPropertyValue('--cx-label').trim() || '#444';
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = bg; g.fillRect(0, 0, Wd, Ht);
    var major = niceStep(90 / st.view.ppu), minor = major / (String(major / Math.pow(10, Math.floor(Math.log10(major) + 1e-9))).charAt(0) === '2' ? 4 : 5);
    var x0 = wx(0), x1 = wx(Wd), y0 = wy(Ht), y1 = wy(0);
    g.lineWidth = 1;
    function lines(step, col) {
      g.strokeStyle = col; g.beginPath();
      for (var x = Math.ceil(x0 / step) * step; x <= x1; x += step) { var p = Math.round(px(x)) + 0.5; g.moveTo(p, 0); g.lineTo(p, Ht); }
      for (var y = Math.ceil(y0 / step) * step; y <= y1; y += step) { var q = Math.round(py(y)) + 0.5; g.moveTo(0, q); g.lineTo(Wd, q); }
      g.stroke();
    }
    lines(minor, grid); lines(major, grid2);
    // axes
    var ox = px(0), oy = py(0);
    g.strokeStyle = ax; g.lineWidth = 1.5; g.beginPath();
    if (ox >= 0 && ox <= Wd) { g.moveTo(Math.round(ox) + 0.5, 0); g.lineTo(Math.round(ox) + 0.5, Ht); }
    if (oy >= 0 && oy <= Ht) { g.moveTo(0, Math.round(oy) + 0.5); g.lineTo(Wd, Math.round(oy) + 0.5); }
    g.stroke();
    // labels
    g.font = '12px system-ui, sans-serif'; g.fillStyle = lab; g.textAlign = 'center'; g.textBaseline = 'top';
    var ly = Math.min(Math.max(oy + 4, 4), Ht - 16);
    for (var x = Math.ceil(x0 / major) * major; x <= x1; x += major) { if (Math.abs(x) < major / 2) continue; var p = px(x); halo(axisLabel(x, major), p, ly, bg); }
    g.textAlign = 'right'; g.textBaseline = 'middle';
    var lx = Math.min(Math.max(ox - 5, 40), Wd - 4); if (ox < 40) { g.textAlign = 'left'; lx = Math.max(ox + 5, 4); }
    for (var y = Math.ceil(y0 / major) * major; y <= y1; y += major) { if (Math.abs(y) < major / 2) continue; halo(axisLabel(y, major), lx, py(y), bg); }
    if (ox >= 0 && ox <= Wd && oy >= 0 && oy <= Ht) { g.textAlign = 'right'; g.textBaseline = 'top'; halo('0', ox - 4, oy + 4, bg); }
    // graphs
    items.forEach(function (it) { if (st.rows[it.i] && st.rows[it.i].hide) return; try { plot(it); } catch (e) { } });
    // points of interest
    poi.forEach(function (p) { dot(p.x, p.y, '#888', 4, true); });
    if (pin) { dot(pin.x, pin.y, pin.color || '#555', 5, false); label(pin); }
  }
  function halo(t, x, y, bg) { g.save(); g.strokeStyle = bg; g.lineWidth = 3; g.strokeText(t, x, y); g.restore(); g.fillText(t, x, y); }
  function dot(x, y, col, r, hollow) { var a = px(x), b = py(y); if (!isFinite(a) || !isFinite(b)) return; g.beginPath(); g.arc(a, b, r, 0, 7); if (hollow) { g.fillStyle = getComputedStyle(root).getPropertyValue('--cx-bg').trim() || '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = col; g.stroke(); } else { g.fillStyle = col; g.fill(); } }
  function label(p) {
    var t = (p.what ? p.what + '  ' : '') + '(' + fmt(p.x, 5) + ', ' + fmt(p.y, 5) + ')', a = px(p.x), b = py(p.y);
    g.font = '13px system-ui, sans-serif'; var w = g.measureText(t).width + 12, X = Math.min(Math.max(a + 8, 4), Wd - w - 4), Y = b - 30 < 4 ? b + 10 : b - 30;
    g.fillStyle = 'rgba(255,255,255,.95)'; g.strokeStyle = '#999'; g.lineWidth = 1; g.beginPath(); g.rect(X, Y, w, 22); g.fill(); g.stroke();
    g.fillStyle = '#111'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(t, X + 6, Y + 11);
  }
  function clampY(v) { return Math.max(-1e5, Math.min(1e5, v)); }
  function strokeCurve(sample, n, col, dash) {
    g.strokeStyle = col; g.lineWidth = 2.5; g.setLineDash(dash ? [7, 5] : []); g.beginPath();
    var pen = false, lastA = 0, lastB = 0;
    for (var k = 0; k <= n; k++) {
      var pt = sample(k); if (!pt) { pen = false; continue; }
      var a = pt[0], b = pt[1];
      if (!isFinite(a) || !isFinite(b)) { pen = false; continue; }
      a = clampY(a); b = clampY(b);
      if (pen && (Math.abs(b - lastB) > Ht * 1.5 || Math.abs(a - lastA) > Wd * 1.5)) pen = false;
      if (pen) g.lineTo(a, b); else g.moveTo(a, b);
      pen = true; lastA = a; lastB = b;
    }
    g.stroke(); g.setLineDash([]);
  }
  function plot(it) {
    var col = it.color, dom = it.dom, step = 0.5, n = Math.ceil(Wd / step);
    if (it.kind === 'fx' || it.kind === 'multi') {
      (it.fs || [it.f]).forEach(function (f) {
        strokeCurve(function (k) { var x = wx(k * step), y = f(x); if (dom && !dom(x, y)) return null; return [k * step, py(y)]; }, n, col);
      });
    } else if (it.kind === 'xy') {
      var m = Math.ceil(Ht / step);
      strokeCurve(function (k) { var y = wy(k * step), x = it.f(y); if (dom && !dom(x, y)) return null; return [px(x), k * step]; }, m, col);
    } else if (it.kind === 'polar' || it.kind === 'param') {
      var N = 2400, a = it.tmin, b = it.tmax, d = (b - a) / N;
      strokeCurve(function (k) {
        var t = a + k * d, x, y;
        if (it.kind === 'polar') { var r = it.f(t); x = r * Math.cos(t); y = r * Math.sin(t); if (dom && !dom(x, y, t, t)) return null; }
        else { x = it.fx(t); y = it.fy(t); if (dom && !dom(x, y, t, t)) return null; }
        return [px(x), py(y)];
      }, N, col);
    } else if (it.kind === 'points') {
      it.pts.forEach(function (p) { dot(p[0], p[1], col, 5, false); if (it.label) { g.font = '12px system-ui, sans-serif'; g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText('(' + fmt(p[0], 4) + ', ' + fmt(p[1], 4) + ')', px(p[0]) + 7, py(p[1]) - 4); } });
    } else if (it.kind === 'shadey' || it.kind === 'shadex') {
      var above = it.op === '>' || it.op === '>=', strict = it.op.length === 1;
      g.fillStyle = col; g.globalAlpha = 0.22;
      if (it.kind === 'shadey') for (var p = 0; p < Wd; p += 2) { var x2 = wx(p + 1), yv = it.f(x2); if (!isFinite(yv) || (dom && !dom(x2, yv))) continue; var by = Math.max(-10, Math.min(Ht + 10, py(yv))); if (above) g.fillRect(p, 0, 2, by); else g.fillRect(p, by, 2, Ht - by); }
      else for (var q = 0; q < Ht; q += 2) { var y2 = wy(q + 1), xv = it.f(y2); if (!isFinite(xv)) continue; var bx = Math.max(-10, Math.min(Wd + 10, px(xv))); if (above) g.fillRect(bx, q, Wd - bx, 2); else g.fillRect(0, q, bx, 2); }
      g.globalAlpha = 1;
      if (it.kind === 'shadey') strokeCurve(function (k) { var x = wx(k * step), y = it.f(x); return dom && !dom(x, y) ? null : [k * step, py(y)]; }, n, col, strict);
      else strokeCurve(function (k) { var y = wy(k * step); return [px(it.f(y)), k * step]; }, Math.ceil(Ht / step), col, strict);
    } else if (it.kind === 'implicit') implicit(it);
  }
  function implicit(it) {
    var cs = 4, nx = Math.ceil(Wd / cs) + 1, ny = Math.ceil(Ht / cs) + 1, F = it.F, vals = new Float64Array(nx * ny), dom = it.dom;
    for (var j = 0; j < ny; j++) { var y = wy(j * cs); for (var i = 0; i < nx; i++) { var x = wx(i * cs), v = F(x, y); if (dom && !dom(x, y)) v = NaN; vals[j * nx + i] = v; } }
    var op = it.op;
    if (op !== '=') { // shade where the inequality holds
      var test = { '<': function (v) { return v < 0; }, '<=': function (v) { return v <= 0; }, '>': function (v) { return v > 0; }, '>=': function (v) { return v >= 0; }, '!=': function (v) { return v !== 0; } }[op];
      g.fillStyle = it.color; g.globalAlpha = 0.22;
      for (j = 0; j < ny - 1; j++) { var run = -1; for (i = 0; i <= nx - 1; i++) { var ok = i < nx - 1 && test((vals[j * nx + i] + vals[j * nx + i + 1] + vals[(j + 1) * nx + i] + vals[(j + 1) * nx + i + 1]) / 4); if (ok && run < 0) run = i; if (!ok && run >= 0) { g.fillRect(run * cs, j * cs, (i - run) * cs, cs); run = -1; } } }
      g.globalAlpha = 1;
    }
    // marching squares for the boundary
    g.strokeStyle = it.color; g.lineWidth = 2.5; g.setLineDash(op === '<' || op === '>' ? [7, 5] : []); g.beginPath();
    function lerp(a, b) { return a / (a - b); }
    for (j = 0; j < ny - 1; j++) for (i = 0; i < nx - 1; i++) {
      var a = vals[j * nx + i], b = vals[j * nx + i + 1], c = vals[(j + 1) * nx + i + 1], d = vals[(j + 1) * nx + i];
      if (!(isFinite(a) && isFinite(b) && isFinite(c) && isFinite(d))) continue;
      var idx = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0); if (idx === 0 || idx === 15) continue;
      var big = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d)), avg = (Math.abs(a) + Math.abs(b) + Math.abs(c) + Math.abs(d)) / 4;
      if (big > 50 * (avg + 1e-9) && big > 1e3) continue; // a jump, not a crossing
      var X = i * cs, Y = j * cs, T = [X + cs * lerp(a, b), Y], R = [X + cs, Y + cs * lerp(b, c)], B = [X + cs * lerp(d, c), Y + cs], L = [X, Y + cs * lerp(a, d)];
      var segs = { 1: [L, B], 2: [B, R], 3: [L, R], 4: [T, R], 5: [L, T, B, R], 6: [T, B], 7: [L, T], 8: [L, T], 9: [T, B], 10: [T, R, L, B], 11: [T, R], 12: [L, R], 13: [B, R], 14: [L, B] }[idx];
      for (var s = 0; s < segs.length; s += 2) { g.moveTo(segs[s][0], segs[s][1]); g.lineTo(segs[s + 1][0], segs[s + 1][1]); }
    }
    g.stroke(); g.setLineDash([]);
  }

  // ---- points of interest (roots, highs and lows, crossings) for the selected curve ----
  var poi = [], pin = null;
  function computePOI() {
    poi = []; var it = items[active]; if (!it || !Wd || (it.kind !== 'fx') || (st.rows[it.i] && st.rows[it.i].hide)) return;
    var f = it.f, n = 600, x0 = wx(0), x1 = wx(Wd), h = (x1 - x0) / n, ys = [];
    for (var k = 0; k <= n; k++) ys.push(f(x0 + k * h));
    function bis(fn, a, b) { var fa = fn(a); for (var t = 0; t < 60; t++) { var m = (a + b) / 2, fm = fn(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } } return (a + b) / 2; }
    var jump = (wy(0) - wy(Ht)) * 2;
    for (k = 0; k < n; k++) {
      var a = ys[k], b = ys[k + 1]; if (!isFinite(a) || !isFinite(b) || Math.abs(b - a) > jump) continue;
      if (a === 0) poi.push({ x: x0 + k * h, y: 0, what: 'root' });
      else if (a * b < 0) { var r = bis(f, x0 + k * h, x0 + (k + 1) * h); if (Math.abs(f(r)) < 1e-6 * (1 + Math.abs(a) + Math.abs(b))) poi.push({ x: r, y: 0, what: 'root' }); }
      if (k > 0) { var p = ys[k - 1]; if (isFinite(p) && (b - a) * (a - p) < 0) { var df = function (x) { return f(x + 1e-7) - f(x - 1e-7); }, xe = bis(df, x0 + (k - 1) * h, x0 + (k + 1) * h), ye = f(xe); if (isFinite(ye)) poi.push({ x: xe, y: ye, what: a > p ? 'high point' : 'low point' }); } }
    }
    var y0 = f(0); if (isFinite(y0) && x0 < 0 && x1 > 0) poi.push({ x: 0, y: y0, what: 'y-intercept' });
    items.forEach(function (o) {
      if (o === it || o.kind !== 'fx' || (st.rows[o.i] && st.rows[o.i].hide)) return;
      var d = function (x) { return f(x) - o.f(x); }, prev = d(x0);
      for (k = 1; k <= n; k++) { var x = x0 + k * h, cur = d(x); if (isFinite(prev) && isFinite(cur) && prev * cur < 0 && Math.abs(cur - prev) < jump) { var xr = bis(d, x - h, x); if (Math.abs(d(xr)) < 1e-6 * (1 + Math.abs(f(xr)))) poi.push({ x: xr, y: f(xr), what: 'crossing' }); } prev = cur; }
    });
    poi.forEach(function (p) { if (Math.abs(p.x) < 1e-12) p.x = 0; if (Math.abs(p.y) < 1e-12) p.y = 0; });
  }

  // ---- pan, zoom, trace ----
  var ptrs = {}, drag = null, moved = false, pinch = null;
  cv.addEventListener('pointerdown', function (e) {
    cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY]; moved = false;
    var ids = Object.keys(ptrs);
    if (ids.length === 1) drag = { x: e.offsetX, y: e.offsetY, vx: st.view.x, vy: st.view.y };
    if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), ppu: st.view.ppu, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2, wx: wx((a[0] + b[0]) / 2), wy: wy((a[1] + b[1]) / 2) }; drag = null; }
  });
  cv.addEventListener('pointermove', function (e) {
    if (ptrs[e.pointerId]) ptrs[e.pointerId] = [e.offsetX, e.offsetY];
    var ids = Object.keys(ptrs);
    if (pinch && ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      st.view.ppu = clampPPU(pinch.ppu * d / pinch.d); var cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
      st.view.x = pinch.wx - (cx - Wd / 2) / st.view.ppu; st.view.y = pinch.wy + (cy - Ht / 2) / st.view.ppu; moved = true; pin = null; computePOI(); draw(); return;
    }
    if (drag) {
      var dx = e.offsetX - drag.x, dy = e.offsetY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (moved) { st.view.x = drag.vx - dx / st.view.ppu; st.view.y = drag.vy + dy / st.view.ppu; pin = null; computePOI(); draw(); }
      return;
    }
    if (e.pointerType === 'mouse') trace(e.offsetX, e.offsetY, false);
  });
  function up(e) {
    delete ptrs[e.pointerId];
    if (!moved && drag) trace(e.offsetX, e.offsetY, true);
    if (Object.keys(ptrs).length < 2) pinch = null; if (!Object.keys(ptrs).length) { drag = null; save(); }
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !drag && pin && pin.hover) { pin = null; draw(); } });
  cv.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(e.offsetX, e.offsetY, Math.pow(1.0015, -e.deltaY * (e.deltaMode ? 30 : 1))); }, { passive: false });
  function clampPPU(p) { return Math.max(1e-6, Math.min(1e8, p)); }
  function zoomAt(cx, cy, f) { var X = wx(cx), Y = wy(cy); st.view.ppu = clampPPU(st.view.ppu * f); st.view.x = X - (cx - Wd / 2) / st.view.ppu; st.view.y = Y + (cy - Ht / 2) / st.view.ppu; pin = null; computePOI(); draw(); save(); }
  $('#cx-zin').addEventListener('click', function () { zoomAt(Wd / 2, Ht / 2, 1.5); });
  $('#cx-zout').addEventListener('click', function () { zoomAt(Wd / 2, Ht / 2, 1 / 1.5); });
  $('#cx-home').addEventListener('click', function () { st.view = { x: 0, y: 0, ppu: 40 }; pin = null; computePOI(); draw(); save(); });
  function trace(mx, my, click) {
    var best = null, bd = click ? 16 : 10;
    poi.forEach(function (p) { var d = Math.hypot(px(p.x) - mx, py(p.y) - my); if (d < bd) { bd = d; best = { x: p.x, y: p.y, what: p.what, color: '#555' }; } });
    if (!best) items.forEach(function (it) {
      if (st.rows[it.i] && st.rows[it.i].hide) return;
      if (it.kind === 'fx' || it.kind === 'multi') (it.fs || [it.f]).forEach(function (f) { var x = wx(mx), y = f(x); if (isFinite(y) && (!it.dom || it.dom(x, y))) { var d = Math.abs(py(y) - my); if (d < bd) { bd = d; best = { x: x, y: y, color: it.color, i: it.i }; } } });
      if (it.kind === 'points') it.pts.forEach(function (p) { var d = Math.hypot(px(p[0]) - mx, py(p[1]) - my); if (d < bd) { bd = d; best = { x: p[0], y: p[1], color: it.color, i: it.i }; } });
    });
    if (best) { best.hover = !click; pin = best; if (click && best.i !== undefined && best.i !== active) { setActive(best.i); } draw(); }
    else if (pin && (click || pin.hover)) { pin = null; draw(); }
    readout(mx, my);
  }
  function readout(mx, my) { tip.textContent = '(' + fmt(wx(mx), 4) + ', ' + fmt(wy(my), 4) + ')'; }

  // ---- table for the selected curve ----
  var tbl = $('.cx-table'), tStart = -3, tStep = 1;
  $('#cx-tbl').addEventListener('click', function () { tbl.hidden = !tbl.hidden; this.setAttribute('aria-pressed', tbl.hidden ? 'false' : 'true'); table(); });
  function table() {
    if (tbl.hidden) return;
    var it = items[active]; if (!it || it.kind !== 'fx') { var any = items.filter(function (o) { return o.kind === 'fx'; })[0]; if (any) it = any; }
    if (!it || it.kind !== 'fx') { tbl.innerHTML = '<p>Click on a curve like y = x² to see its table.</p>'; return; }
    var rows = ''; for (var k = 0; k < 11; k++) { var x = Math.round((tStart + k * tStep) * 1e9) / 1e9, y = it.f(x); rows += '<tr><td>' + fmt(x, 6) + '</td><td>' + (isFinite(y) ? fmt(y, 8) : '—') + '</td></tr>'; }
    tbl.innerHTML = '<p class="cx-tt"><span class="cx-dot" style="background:' + it.color + '"></span>' + esc(st.rows[it.i].src) + '</p><div class="cx-tctl"><label>Start <input type="number" step="any" value="' + tStart + '"></label><label>Step <input type="number" step="any" value="' + tStep + '"></label></div><table><thead><tr><th>x</th><th>y</th></tr></thead><tbody>' + rows + '</tbody></table>';
    var ins = tbl.querySelectorAll('input');
    ins[0].addEventListener('change', function () { tStart = +ins[0].value || 0; table(); });
    ins[1].addEventListener('change', function () { tStep = +ins[1].value || 1; table(); });
  }
  var oldSetActive = setActive; setActive = function (i) { oldSetActive(i); table(); };

  // ================= CALCULATOR (home screen) =================
  var hctx = new CAS.Ctx(), hist = $('.cx-hist'), hin = $('#cx-in'), recall = -1;
  function replay() { // rebuild stored names from the saved history
    hctx = new CAS.Ctx(); hctx.deg = st.deg;
    st.hist.forEach(function (h) { if (h.def) { try { var r = CAS.run(h.in, hctx); if (r) hctx.vars.ans = r.node; } catch (e) { } } });
  }
  function histHTML(h, k) {
    var g2 = h.graph ? '<button type="button" class="cx-hb" data-g="' + k + '" title="Graph it">📈 Graph</button>' : '';
    return '<div class="cx-h' + (h.err ? ' err' : '') + '"><div class="cx-hin"><button type="button" class="cx-hi" data-k="' + k + '" title="Use this again">' + esc(h.in) + '</button></div>' +
      '<div class="cx-hout"><button type="button" class="cx-ho" data-o="' + k + '" title="Use this answer">' + esc(st.dec && h.ap ? h.ap : h.out) + '</button>' + (h.ap && !st.dec ? '<span class="ap">≈ ' + esc(h.ap) + '</span>' : '') + g2 + '</div></div>';
  }
  function renderHist() {
    hist.innerHTML = st.hist.length ? st.hist.map(histHTML).join('') : '<p class="cx-empty">Type something below and press Enter. Try <b>solve(x² − 5x + 6 = 0)</b>, <b>d(x³·sin(x))</b> or <b>100!</b>. The Examples tab has lots more.</p>';
    hist.querySelectorAll('.cx-hi').forEach(function (b) { b.addEventListener('click', function () { insert(st.hist[+b.dataset.k].in, true); }); });
    hist.querySelectorAll('.cx-ho').forEach(function (b) { b.addEventListener('click', function () { var h = st.hist[+b.dataset.o]; insert(plain(st.dec && h.ap ? h.ap : h.out)); }); });
    hist.querySelectorAll('.cx-hb').forEach(function (b) { b.addEventListener('click', function () { var h = st.hist[+b.dataset.g]; setTab('graph'); addRow(h.graph, undefined, true); }); });
    scrollHist();
  }
  function scrollHist() { hist.scrollTop = hist.scrollHeight; }
  function plain(s) { return s.replace(/−/g, '-').replace(/·/g, '*').replace(/×10/g, '*10').replace(/^.* = (?=[^=]*$)/, function (m) { return /^[a-zA-Zθλ]\w* = $/.test(m) ? '' : m; }); }
  function exec(src) {
    src = src.trim(); if (!src) return;
    if (/^clear$/i.test(src)) { st.hist = []; replay(); renderHist(); save(); return; }
    var h = { in: src };
    try {
      CAS.STATE.deg = hctx.deg = st.deg;
      var r = CAS.run(src, hctx);
      if (!r) return;
      h.out = r.out; if (r.approx) h.ap = r.approx; if (r.def) h.def = 1;
      if (r.node && r.node.k !== 'text' && r.node.k !== 'sol' && r.node.k !== 'rel' && !r.def) hctx.vars.ans = r.node;
      var fv = r.node ? Object.keys(CAS.freeVars(r.node)) : [];
      if (r.node && fv.length === 1 && fv[0] === 'x' && ['list', 'mat', 'sol', 'text', 'tuple'].indexOf(r.node.k) < 0) h.graph = (r.node.k === 'rel' ? '' : 'y = ') + plain(CAS.show(r.node));
      if (r.def && r.node && /\(x\)/.test(r.out)) h.graph = plain(r.out);
    } catch (e) { h.out = '⚠ ' + (e.message || 'Something went wrong'); h.err = 1; }
    st.hist.push(h); if (st.hist.length > 200) st.hist.shift();
    renderHist(); save();
  }
  hin.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); exec(hin.value); hin.value = ''; recall = -1; }
    else if (e.key === 'ArrowUp' && st.hist.length) { e.preventDefault(); recall = recall < 0 ? st.hist.length - 1 : Math.max(0, recall - 1); hin.value = st.hist[recall].in; }
    else if (e.key === 'ArrowDown' && recall >= 0) { e.preventDefault(); recall++; if (recall >= st.hist.length) { recall = -1; hin.value = ''; } else hin.value = st.hist[recall].in; }
  });
  hin.addEventListener('focus', function () { lastInput = hin; });
  $('#cx-go').addEventListener('click', function () { exec(hin.value); hin.value = ''; hin.focus(); });
  var decBtn = $('#cx-dec');
  function showDec() { decBtn.textContent = st.dec ? 'Showing decimals' : 'Showing exact answers'; decBtn.setAttribute('aria-pressed', st.dec ? 'true' : 'false'); }
  decBtn.addEventListener('click', function () { st.dec = !st.dec; showDec(); renderHist(); save(); });
  $('#cx-hclear').addEventListener('click', function () { st.hist = []; replay(); renderHist(); save(); hin.focus(); });

  // ================= keypad =================
  var lastInput = hin;
  function insert(text, replace) {
    var inp = lastInput || hin;
    if (st.tab === 'home') inp = hin; else if (st.tab === 'graph' && inp === hin) { inp = list.querySelector('.cx-row.act .cx-ex') || list.querySelector('.cx-ex'); }
    if (replace) { inp.value = text; }
    else {
      var a = inp.selectionStart != null ? inp.selectionStart : inp.value.length, b = inp.selectionEnd != null ? inp.selectionEnd : a;
      inp.value = inp.value.slice(0, a) + text + inp.value.slice(b);
      var c = a + text.length; if (/\(\)$/.test(text)) c--; inp.focus(); try { inp.setSelectionRange(c, c); } catch (e) { }
    }
    inp.focus(); inp.dispatchEvent(new Event('input'));
  }
  root.querySelectorAll('.cx-keys button').forEach(function (b) {
    b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus in the box
    b.addEventListener('click', function () {
      var k = b.dataset.k, inp = st.tab === 'home' ? hin : (lastInput && lastInput !== hin ? lastInput : list.querySelector('.cx-ex'));
      lastInput = inp;
      if (k === 'BS') { var a = inp.selectionStart, z = inp.selectionEnd; if (a === z && a > 0) a--; inp.value = inp.value.slice(0, a) + inp.value.slice(z); inp.focus(); inp.setSelectionRange(a, a); inp.dispatchEvent(new Event('input')); return; }
      if (k === 'L' || k === 'R') { var p = inp.selectionStart + (k === 'L' ? -1 : 1); p = Math.max(0, Math.min(inp.value.length, p)); inp.focus(); inp.setSelectionRange(p, p); return; }
      if (k === 'ENT') { if (inp === hin) { exec(hin.value); hin.value = ''; } else inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); return; }
      insert(k);
    });
  });

  // ================= examples =================
  root.querySelectorAll('.cx-help [data-g]').forEach(function (b) {
    b.addEventListener('click', function () {
      var lines = b.dataset.g.split('\n'); setTab('graph');
      if (b.dataset.fresh) { st.rows = []; lines.forEach(function (l) { st.rows.push({ src: l, color: nextColor++ % COLORS.length }); }); st.rows.push({ src: '', color: nextColor++ % COLORS.length }); if (b.dataset.view) { var v = b.dataset.view.split(','); st.view = { x: +v[0], y: +v[1], ppu: +v[2] }; } renderRows(); save(); return; }
      lines.forEach(function (l) { addRow(l, undefined, true); });
    });
  });
  root.querySelectorAll('.cx-help [data-c]').forEach(function (b) {
    b.addEventListener('click', function () { setTab('home'); b.dataset.c.split('\n').forEach(exec); });
  });

  // ================= start =================
  showDeg(); showKeys(); showDec(); replay(); renderHist();
  W.addEventListener('resize', function () { if (st.tab === 'graph') resize(); });
  if (W.matchMedia) { var mq = W.matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', draw); }
  new MutationObserver(draw).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  if (W.ResizeObserver) new ResizeObserver(function () { if (st.tab === 'graph') resize(); }).observe(cv.parentNode);
  setTab(st.tab || 'graph');
  renderRows(); resize();
})(window, document);
