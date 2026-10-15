/* Game Theory, Chapter 12: Mechanism Design and Matching. Two interactive pieces:
   1. Gale–Shapley deferred acceptance, step by step, with editable preferences, matching by hand and lying
      (main simulation, with missions), 2. the Clarke (VCG) mechanism for a shared project.
   The models are in model.js (window.GT12M), tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, M = W.GT12M, root = D.getElementById('gt12-lab');
  if (!root || !L || !M) return;
  /* ---------- drawing and UI helpers (the same in every Game Theory chapter from 8 on) ---------- */
  var fmt = L.fmt, reduced = L.reduced;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', orange: '#ffa94d',
    ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', grid: 'rgba(120,170,200,.10)', panel: 'rgba(11,27,39,.92)', bg: '#06111a' };
  var FONT = 'system-ui,-apple-system,"Segoe UI",sans-serif', MONO = 'ui-monospace,Menlo,Consolas,monospace';
  function $(id) { return D.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function grp(v, d) { var s = fmt(v, d || 0), neg = s.charAt(0) === '−'; if (neg) s = s.slice(1); var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '−' : '') + p.join('.'); }
  function money(v, d) { var s = grp(Math.abs(v), d || 0); return (v < 0 && +Math.abs(v).toFixed(d || 0) !== 0 ? '−$' : '$') + s; }
  function pct(v, d) { return fmt(100 * v, d === undefined ? 0 : d) + '%'; }
  function label(c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = (o.bold ? '600 ' : '') + (o.size || 12) + 'px ' + (o.mono ? MONO : FONT);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.max) { var tw = c.measureText(text).width; if (tw > o.max) { var sc = o.max / tw; c.font = (o.bold ? '600 ' : '') + Math.max(8, (o.size || 12) * sc) + 'px ' + (o.mono ? MONO : FONT); } }
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); c.restore();
  }
  function textW(c, text, size, bold) { c.save(); c.font = (bold ? '600 ' : '') + (size || 12) + 'px ' + FONT; var w = c.measureText(text).width; c.restore(); return w; }
  function rrect(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function bg(c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function panelBox(c, x, y, w, h, title, col) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) label(c, title, x + 10, y + 13, col || C.muted, { size: 10.5, bold: true, max: w - 20 });
  }
  function dot(c, x, y, r, col, o) {
    o = o || {}; c.save(); if (o.glow) { c.shadowColor = col; c.shadowBlur = o.glow; }
    c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fillStyle = col; c.fill();
    if (o.ring) { c.shadowBlur = 0; c.lineWidth = o.lw || 2; c.strokeStyle = o.ring; c.stroke(); }
    c.restore();
  }
  function line(c, pts, col, lw, dash) {
    if (pts.length < 2) return; c.save(); c.strokeStyle = col; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.lineCap = 'round'; if (dash) c.setLineDash(dash);
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); c.restore();
  }
  function arrow(c, x, y, x2, y2, col, o) {
    o = o || {}; var dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy); if (len < 2) return;
    var ux = dx / len, uy = dy / len, hw = o.head || 6, lw = o.width || 2;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2 - ux * hw * 1.2, y2 - uy * hw * 1.2); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * hw * 1.9 - uy * hw * 0.8, y2 - uy * hw * 1.9 + ux * hw * 0.8); c.lineTo(x2 - ux * hw * 1.9 + uy * hw * 0.8, y2 - uy * hw * 1.9 - ux * hw * 0.8); c.closePath(); c.fill(); c.restore();
  }
  /* a plot area: box {x,y,w,h}, ranges [lo,hi]; draws grid, axes, ticks and titles; returns {X, Y, ix, iy} */
  function plot(c, b, xr, yr, o) {
    o = o || {};
    var X = function (v) { return b.x + (v - xr[0]) / (xr[1] - xr[0]) * b.w; }, Y = function (v) { return b.y + b.h - (v - yr[0]) / (yr[1] - yr[0]) * b.h; };
    var ix = function (px) { return xr[0] + (px - b.x) / b.w * (xr[1] - xr[0]); }, iy = function (py) { return yr[0] + (b.y + b.h - py) / b.h * (yr[1] - yr[0]); };
    c.save(); c.lineWidth = 1;
    var xt = o.xt || nice(xr, o.nx || 5), yt = o.yt || nice(yr, o.ny || 4);
    c.strokeStyle = C.grid; c.beginPath();
    xt.forEach(function (t) { c.moveTo(X(t), b.y); c.lineTo(X(t), b.y + b.h); }); yt.forEach(function (t) { c.moveTo(b.x, Y(t)); c.lineTo(b.x + b.w, Y(t)); }); c.stroke();
    c.strokeStyle = 'rgba(143,179,198,.55)'; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x, b.y + b.h); c.lineTo(b.x + b.w, b.y + b.h); c.stroke(); c.restore();
    var df = function (t) { return fmt(t, Math.abs(t - Math.round(t)) > 1e-9 ? (Math.abs(t * 10 - Math.round(t * 10)) > 1e-9 ? 2 : 1) : 0); }, xf = o.xf || df, yf = o.yf || df;
    if (!o.noXLabels) xt.forEach(function (t) { label(c, xf(t), X(t), b.y + b.h + 9, C.muted, { size: 10, align: 'center', plain: true }); });
    if (!o.noYLabels) yt.forEach(function (t) { label(c, yf(t), b.x - 5, Y(t), C.muted, { size: 10, align: 'right', plain: true }); });
    if (o.xl) label(c, o.xl, b.x + b.w - 2, b.y + b.h - 9, C.muted, { size: 10.5, align: 'right' });
    if (o.yl) label(c, o.yl, b.x + 2, b.y - 9, C.muted, { size: 10.5, plain: true });
    return { X: X, Y: Y, ix: ix, iy: iy, b: b };
  }
  function nice(r, n) {
    var span = r[1] - r[0], raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag, st = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag, out = [];
    for (var t = Math.ceil(r[0] / st - 1e-9) * st; t <= r[1] + st * 1e-6; t += st) out.push(+t.toFixed(10));
    return out;
  }
  function seg(groupEl, attr, val) { groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); }
  function readout(dl, rows) { dl.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' style="color:' + r[2] + '"' : '') + '>' + r[1] + '</dd>'; }).join(''); }
  /* pointer dragging on a canvas: pick(x,y) returns a target or null; move(target,x,y); up(target) */
  function drag(cv, pick, move, up, hover) {
    var cur = null, id = null;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { var p = pos(e); cur = pick(p[0], p[1], e); if (cur === null || cur === undefined) return; id = e.pointerId; try { cv.setPointerCapture(id); } catch (er) { } e.preventDefault(); move(cur, p[0], p[1], e); });
    cv.addEventListener('pointermove', function (e) { var p = pos(e); if (cur !== null && cur !== undefined && e.pointerId === id) { move(cur, p[0], p[1], e); e.preventDefault(); } else if (hover) hover(p[0], p[1]); });
    function end(e) { if (cur !== null && cur !== undefined && e.pointerId === id) { var t = cur; cur = null; if (up) up(t); } }
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  }
  function celebrate(view, text) { L.toast(view, text); if (!reduced) { view.classList.remove('gt12-win'); void view.offsetWidth; view.classList.add('gt12-win'); } }
  /* seeded random numbers, so a "new round" button can be replayed in tests */
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }


  var SN = ['Ana', 'Ben', 'Cai', 'Dee', 'Eli'], TN = ['Oak', 'Elm', 'Pine', 'Bay', 'Hill'];
  var SC = ['#ffd479', '#f9a8d4', '#63e6be', '#ffa94d', '#b197fc'], TC = '#74c0fc';
  var PRESETS = {
    three: { n: 3, S: [[0, 1, 2], [1, 2, 0], [2, 0, 1]], T: [[1, 2, 0], [2, 0, 1], [0, 1, 2]] },
    four: { n: 4, S: [[0, 1, 2, 3], [0, 2, 1, 3], [1, 0, 3, 2], [0, 1, 3, 2]], T: [[2, 3, 1, 0], [0, 1, 3, 2], [3, 0, 1, 2], [1, 2, 0, 3]] },
    oak: { n: 4, S: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 2, 1, 3], [0, 1, 3, 2]], T: [[0, 1, 2, 3], [0, 1, 2, 3], [1, 0, 2, 3], [0, 1, 2, 3]] }
  };
  function copy(a) { return a.map(function (l) { return l.slice(); }); }
  function ord(k) { return k === Infinity || k < 0 ? 'none' : ['1st', '2nd', '3rd', '4th', '5th'][k]; }

  /* =====================================================================================
     1. DEFERRED ACCEPTANCE
     ===================================================================================== */
  (function () {
    var view = $('gt12-view'), cv = $('gt12-cv'), hud = $('gt12-hud'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, R = rng(1962);
    var el = { pre: $('gt12-pre'), side: $('gt12-side'), mode: $('gt12-mode'), step: $('gt12-step'), play: $('gt12-play'), back: $('gt12-reset'), pause: $('gt12-pause'), rnd: $('gt12-rnd'),
      liar: $('gt12-liar'), lieK: $('gt12-liek'), read: $('gt12-read'), prefs: $('gt12-prefs') };
    var S = { n: 3, St: null, Tt: null, side: 'S', mode: 'algo', lie: null, log: [], k: 0, t: 0, playing: false, hand: [], sel: null, hudTxt: '', done: false, flash: [], kb: { col: 0, i: 0 } };
    function reported() {
      var Sr = copy(S.St), Tr = copy(S.Tt); if (!S.lie) return { S: Sr, T: Tr };
      var arr = S.lie.who === 'S' ? Sr : Tr, l = arr[S.lie.i];
      if (S.lie.kind === 'swap' && l.length > 1) { var t = l[0]; l[0] = l[1]; l[1] = t; }
      else if (S.lie.kind === 'trunc1') arr[S.lie.i] = l.slice(0, 1); else if (S.lie.kind === 'trunc2') arr[S.lie.i] = l.slice(0, 2);
      return { S: Sr, T: Tr };
    }
    function load(p) { S.n = p.n; S.St = copy(p.S); S.Tt = copy(p.T); S.lie = null; el.liar.value = 'none'; fillLiar(); restart(); prefsUI(); }
    function restart() {
      var rp = reported(), r = S.side === 'S' ? M.da(rp.S, rp.T) : M.da(rp.T, rp.S);
      S.log = r.log; S.final = r.match; S.k = 0; S.t = 0; S.done = false; S.playing = false; S.hand = []; for (var i = 0; i < S.n; i++) S.hand.push(-1); S.sel = null; sync();
    }
    function stateAt(k) { // holdBy[receiver] = proposer, next[proposer], rejected[proposer] = set of receivers
      var n = S.n, hold = [], rej = [], used = []; for (var i = 0; i < n; i++) { hold[i] = -1; rej[i] = {}; used[i] = 0; }
      for (var e = 0; e < k; e++) { var ev = S.log[e]; used[ev.p]++; if (ev.kind === 'hold') { if (ev.dropped !== undefined) rej[ev.dropped][ev.r] = 1; hold[ev.r] = ev.p; } else rej[ev.p][ev.r] = 1; }
      return { hold: hold, rej: rej };
    }
    function studentMatch() { // student -> school for the current display
      var mS = []; for (var i = 0; i < S.n; i++) mS.push(-1);
      if (S.mode === 'hand') return S.hand.slice();
      var st = stateAt(S.k);
      st.hold.forEach(function (p, r) { if (p < 0) return; if (S.side === 'S') mS[p] = r; else mS[r] = p; });
      return mS;
    }
    function advance() { if (S.k < S.log.length) { S.k++; S.t = 0; if (S.k === S.log.length) finished(); sync(); return true; } if (!S.done) finished(); return false; }
    function finished() {
      S.done = true; S.playing = false;
      var mS = studentMatch(), honestS = M.run(S.St, S.Tt, 'S'), honestT = M.run(S.St, S.Tt, 'T');
      win('run', 'Done! No student and school would both rather be together than where they are.');
      if (!S.lie && S.side === 'T' && mS.some(function (j, i) { return M.rankOf(S.St[i], j) > M.rankOf(S.St[i], honestS[i]); })) win('sides', 'Same market, different stable matching: the proposing side does better.');
      if (!S.lie && S.n >= 3 && JSON.stringify(honestS) === JSON.stringify(honestT)) win('same', 'Both sides proposing give the same matching: it is the only stable one.');
      if (S.lie) {
        var who = S.lie.who, i = S.lie.i, honest = S.side === 'S' ? honestS : honestT, before, after, nm = who === 'S' ? SN[i] : TN[i];
        if (who === 'S') { before = M.rankOf(S.St[i], honest[i]); after = M.rankOf(S.St[i], mS[i]); }
        else { before = M.rankOf(S.Tt[i], honest.indexOf(i)); after = M.rankOf(S.Tt[i], mS.indexOf(i)); }
        S.lieMsg = nm + ' lied: true rank of the match ' + ord(after) + ', against ' + ord(before) + ' when honest.';
        if (who === S.side) win('lie1', after < before ? 'Hmm' : 'Lying didn’t help ' + nm + ': proposers can’t gain by misreporting.');
        else if (after < before) win('lie2', nm + ' gained by lying! Receivers can manipulate deferred acceptance.');
      } else S.lieMsg = '';
      sync();
    }
    function sync() {
      seg(el.side, 'data-s', S.side); seg(el.mode, 'data-m', S.mode);
      var key = null; Object.keys(PRESETS).forEach(function (k) { var p = PRESETS[k]; if (p.n === S.n && JSON.stringify(p.S) === JSON.stringify(S.St) && JSON.stringify(p.T) === JSON.stringify(S.Tt)) key = k; }); seg(el.pre, 'data-p', key);
      el.step.disabled = S.mode !== 'algo' || S.done; el.play.disabled = S.mode !== 'algo' || S.done; el.play.textContent = S.playing ? 'Pause' : 'Run to the end';
      el.lieK.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(!!S.lie && S.lie.kind === b.dataset.k)); b.disabled = el.liar.value === 'none'; });
      var mS = studentMatch(), bl = M.blocking(S.St, S.Tt, mS), full = mS.every(function (j) { return j >= 0; });
      var rows = [['Mode', S.mode === 'algo' ? (S.side === 'S' ? 'students propose' : 'schools propose') : 'matching by hand'], ['Proposals so far', S.mode === 'algo' ? S.k + ' of ' + S.log.length : '—'],
        ['Blocking pairs (true preferences)', !(full || (S.mode === 'algo' && S.done)) ? (S.mode === 'algo' ? 'after the last step' : 'match everyone first') : bl.length ? bl.map(function (p) { return SN[p[0]] + '–' + TN[p[1]]; }).join(', ') : 'none'],
        ['Stable matchings in this market', String(M.allStable(S.St, S.Tt).length)]];
      if (S.lieMsg) rows.push(['Lie result', S.lieMsg]);
      readout(el.read, rows);
      var t = S.mode === 'hand' ? '<b>Matching by hand</b> · tap a student, then a school<br>' + (full ? (bl.length ? '✗ unstable: ' + bl.length + ' blocking pair' + (bl.length > 1 ? 's' : '') : '✓ stable') : 'match everyone to check stability')
        : '<b>Deferred acceptance</b> · ' + (S.side === 'S' ? 'students' : 'schools') + ' propose' + (S.lie ? ' · someone is lying' : '') + '<br>' + (S.done ? 'finished after ' + S.log.length + ' proposals' : 'proposal ' + S.k + ' of ' + S.log.length);
      if (t !== S.hudTxt) { hud.innerHTML = t; S.hudTxt = t; }
      if (S.mode === 'hand' && full) {
        if (bl.length) win('block', 'Unstable: the red pair would both rather break away and match with each other.');
        else if (JSON.stringify(mS) !== JSON.stringify(M.run(S.St, S.Tt, 'S'))) win('stablehand', 'A different stable matching! Stable matchings can come in families.');
      }
    }
    /* the preference editor */
    function prefsUI() {
      var h = '';
      [['S', S.St, SN, TN, 'Students rank schools'], ['T', S.Tt, TN, SN, 'Schools rank students']].forEach(function (z) {
        h += '<div class="gt12-pcol"><h3>' + z[4] + '</h3>';
        z[1].forEach(function (list, i) {
          h += '<div class="gt12-prow"><span class="gt12-who" style="--c:' + (z[0] === 'S' ? SC[i] : TC) + '">' + z[2][i] + '</span>';
          list.forEach(function (x, k) { h += '<button type="button" data-side="' + z[0] + '" data-i="' + i + '" data-k="' + k + '" aria-label="' + z[2][i] + '’s choice number ' + (k + 1) + ': ' + z[3][x] + (k ? '. Press to move it up.' : '') + '"' + (k ? '' : ' class="gt12-top"') + '><small>' + (k + 1) + '</small>' + z[3][x] + '</button>'; });
          h += '</div>';
        });
        h += '</div>';
      });
      el.prefs.innerHTML = h;
    }
    el.prefs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-side]'); if (!b) return; var k = +b.dataset.k; if (!k) return;
      var l = (b.dataset.side === 'S' ? S.St : S.Tt)[+b.dataset.i], t = l[k - 1]; l[k - 1] = l[k]; l[k] = t;
      prefsUI(); restart(); var nb = el.prefs.querySelector('button[data-side="' + b.dataset.side + '"][data-i="' + b.dataset.i + '"][data-k="' + (k - 1) + '"]'); if (nb) nb.focus();
    });
    function fillLiar() { var h = '<option value="none">No one (everyone honest)</option>'; for (var i = 0; i < S.n; i++) h += '<option value="S' + i + '">' + SN[i] + ' (student)</option>'; for (i = 0; i < S.n; i++) h += '<option value="T' + i + '">' + TN[i] + ' (school)</option>'; el.liar.innerHTML = h; }
    el.liar.addEventListener('change', function () { var v = el.liar.value; if (v === 'none') S.lie = null; else S.lie = { who: v.charAt(0), i: +v.slice(1), kind: S.lie ? S.lie.kind : 'trunc1' }; restart(); });
    el.lieK.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b || el.liar.value === 'none') return; var v = el.liar.value; S.lie = { who: v.charAt(0), i: +v.slice(1), kind: b.dataset.k }; restart(); });
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (b) load(PRESETS[b.dataset.p]); });
    el.rnd.addEventListener('click', function () {
      var n = 3 + Math.floor(R() * 3); function perm() { var a = []; for (var i = 0; i < n; i++) a.push(i); for (i = n - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
      var Sx = [], Tx = []; for (var i = 0; i < n; i++) { Sx.push(perm()); Tx.push(perm()); } load({ n: n, S: Sx, T: Tx });
    });
    el.side.addEventListener('click', function (e) { var b = e.target.closest('button[data-s]'); if (!b) return; S.side = b.dataset.s; S.mode = 'algo'; restart(); });
    el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; S.mode = b.dataset.m; restart(); });
    el.step.addEventListener('click', function () { S.playing = false; advance(); });
    el.play.addEventListener('click', function () { S.playing = !S.playing; if (S.playing && S.k >= S.log.length) finished(); sync(); });
    el.back.addEventListener('click', restart);
    el.pause.addEventListener('click', function () { if (S.mode !== 'algo') return; S.playing = !S.playing; sync(); });
    /* hand matching */
    var nodes = [];
    function pickNode(x, y) { for (var q = 0; q < nodes.length; q++) if (Math.hypot(nodes[q].x - x, nodes[q].y - y) < 26) return nodes[q]; return null; }
    function handClick(nd) {
      if (S.mode !== 'hand' || !nd) return;
      if (nd.col === 0) { if (S.hand[nd.i] >= 0 && (!S.sel || S.sel.i !== nd.i)) { S.hand[nd.i] = -1; S.sel = null; } else S.sel = S.sel && S.sel.i === nd.i ? null : { i: nd.i }; }
      else if (S.sel) { var j = nd.i; S.hand = S.hand.map(function (x) { return x === j ? -1 : x; }); S.hand[S.sel.i] = j; S.sel = null; }
      sync();
    }
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); handClick(pickNode(e.clientX - r.left, e.clientY - r.top)); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (S.mode === 'algo') { if (k === ' ' || k === 'Enter' || k === 'ArrowRight') advance(); else used = false; }
      else {
        if (k === 'ArrowUp') S.kb.i = (S.kb.i + S.n - 1) % S.n; else if (k === 'ArrowDown') S.kb.i = (S.kb.i + 1) % S.n; else if (k === 'ArrowLeft') S.kb.col = 0; else if (k === 'ArrowRight') S.kb.col = 1;
        else if (k === 'Enter' || k === ' ') handClick({ col: S.kb.col, i: S.kb.i }); else used = false;
      }
      if (used) e.preventDefault();
    });

    /* missions */
    var MIS = [
      { id: 'run', title: 'Run the algorithm', goal: 'Step through deferred acceptance until nobody is left to propose.' },
      { id: 'block', title: 'Spot a blocking pair', goal: 'Match everyone by hand in a way that is unstable.' },
      { id: 'stablehand', title: 'Another stable matching', goal: 'By hand, find a stable matching different from the one students get by proposing.' },
      { id: 'sides', title: 'Switch sides', goal: 'Let the schools propose and find a student who ends up worse off.' },
      { id: 'lie1', title: 'Try to cheat', goal: 'Make a proposer lie (pick who, then how) and run the algorithm. Did it help?' },
      { id: 'lie2', title: 'A lie that works', goal: 'Find a receiver whose lie gets it a better match. Hint: Oak in “Three’s company”.' },
      { id: 'same', title: 'Only one stable matching', goal: 'Find a market (3 or more a side) where both sides proposing give the same result.' }
    ];
    var mis = L.missions($('gt12-missions'), 'gt12', MIS, function (id) {
      if (id === 'stablehand' || id === 'block') { load(PRESETS.three); S.mode = 'hand'; restart(); }
      else if (id === 'sides') { load(PRESETS.three); S.side = 'T'; restart(); }
      else if (id === 'lie1') { load(PRESETS.four); S.side = 'S'; el.liar.value = 'S0'; S.lie = { who: 'S', i: 0, kind: 'swap' }; restart(); }
      else if (id === 'lie2') { load(PRESETS.three); S.side = 'S'; el.liar.value = 'T0'; S.lie = { who: 'T', i: 0, kind: 'swap' }; restart(); }
      else if (id === 'same') { load(PRESETS.oak); }
      else load(PRESETS.four);
      L.toast(view, MIS.filter(function (m) { return m.id === id; })[0].goal);
    });
    function win(id, text) { if (mis.done(id)) celebrate(view, '✓ ' + text); }

    function chip(x, y, w, h, txt, col, st) {
      c.save(); c.globalAlpha = st === 'gone' ? 0.3 : 1; c.fillStyle = st === 'cur' ? col : 'rgba(255,255,255,.07)'; c.strokeStyle = st === 'cur' ? '#fff' : 'rgba(120,170,200,.3)'; c.lineWidth = 1;
      rrect(c, x, y, w, h, 4); c.fill(); c.stroke(); c.restore();
      label(c, txt, x + w / 2, y + h / 2 + 0.5, st === 'cur' ? '#06111a' : C.ink, { size: Math.min(11, h * 0.7), bold: st === 'cur', align: 'center', plain: true });
      if (st === 'gone') line(c, [[x + 2, y + h - 2], [x + w - 2, y + 2]], C.red, 1.5);
    }
    function frame(dt) {
      G.fit(); var w = G.w, h = G.h, narrow = w < 560; bg(c, w, h);
      if (S.mode === 'algo' && S.playing && !S.done) { S.t += dt * (reduced ? 3 : 1.6); if (S.t >= 1) advance(); }
      else if (S.mode === 'algo') S.t = Math.min(1, S.t + dt * 2.5);
      var n = S.n, top = narrow ? 124 : 92, bot = h - 46, gap = (bot - top) / n, Lx = w * (narrow ? 0.36 : 0.36), Rx = w * (narrow ? 0.64 : 0.64), nr = narrow ? 15 : 20;
      var chW = narrow ? Math.min(19, (Lx - nr - 18) / n - 3) : Math.min(34, (Lx - nr - 30) / n - 4), chH = narrow ? 16 : 22;
      label(c, 'STUDENTS', Lx, top - 22, C.muted, { size: 10.5, bold: true, align: 'center' }); label(c, 'SCHOOLS (ONE SEAT EACH)', Rx, top - 22, C.muted, { size: 10.5, bold: true, align: 'center' });
      nodes = [];
      for (var i = 0; i < n; i++) { nodes.push({ col: 0, i: i, x: Lx, y: top + gap * (i + 0.5) }); }
      for (i = 0; i < n; i++) { nodes.push({ col: 1, i: i, x: Rx, y: top + gap * (i + 0.5) }); }
      var mS = studentMatch(), st = S.mode === 'algo' ? stateAt(S.k) : null, bl = M.blocking(S.St, S.Tt, mS), rp = reported();
      // matches
      mS.forEach(function (j, i2) { if (j < 0) return; var a = nodes[i2], b = nodes[n + j]; line(c, [[a.x + nr, a.y], [b.x - nr, b.y]], S.mode === 'algo' && !S.done ? C.gold : C.green, 3); });
      var showBl = (S.mode === 'algo' && S.done) || (S.mode === 'hand' && mS.every(function (j) { return j >= 0; }));
      if (showBl) bl.forEach(function (p) { var a = nodes[p[0]], b = nodes[n + p[1]]; line(c, [[a.x + nr, a.y], [b.x - nr, b.y]], C.red, 2, [6, 5]); });
      // the proposal being animated
      if (S.mode === 'algo' && S.k > 0 && S.t < 1) {
        var ev = S.log[S.k - 1], from = S.side === 'S' ? nodes[ev.p] : nodes[n + ev.p], to = S.side === 'S' ? nodes[n + ev.r] : nodes[ev.r], k2 = ease(Math.min(1, S.t * 1.6));
        var dx = to.x - from.x, dy = to.y - from.y, ux = from.x + Math.sign(dx) * nr, tx = ux + (to.x - Math.sign(dx) * nr - ux) * k2, ty = from.y + dy * k2;
        arrow(c, ux, from.y, tx, ty, ev.kind === 'hold' ? C.blue : C.red, { width: 2.5, head: 7 });
        if (S.t > 0.6 && ev.kind === 'reject') label(c, '✗', (from.x + to.x) / 2, (from.y + to.y) / 2 - 8, C.red, { size: 18, bold: true, align: 'center' });
      }
      // nodes and preference chips
      nodes.forEach(function (nd) {
        var isS = nd.col === 0, i3 = nd.i, list = isS ? rp.S[i3] : rp.T[i3], trueList = isS ? S.St[i3] : S.Tt[i3], partner = isS ? mS[i3] : mS.indexOf(i3);
        var lied = S.lie && S.lie.who === (isS ? 'S' : 'T') && S.lie.i === i3;
        var sel = S.mode === 'hand' && ((S.sel && isS && S.sel.i === i3)), kbf = D.activeElement === cv && S.mode === 'hand' && S.kb.col === nd.col && S.kb.i === i3;
        if (isS) dot(c, nd.x, nd.y, nr, SC[i3], { ring: sel || kbf ? '#fff' : '#06111a', lw: sel || kbf ? 3 : 2 });
        else { c.fillStyle = TC; rrect(c, nd.x - nr, nd.y - nr, 2 * nr, 2 * nr, 6); c.fill(); if (kbf) { c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); } }
        label(c, (isS ? SN : TN)[i3].charAt(0), nd.x, nd.y + 1, '#06111a', { size: nr * 0.95, bold: true, align: 'center', plain: true });
        label(c, (isS ? SN : TN)[i3] + (lied ? ' (lying)' : ''), nd.x, nd.y + nr + 10, lied ? C.red : C.ink, { size: 10.5, bold: true, align: 'center' });
        var cx0 = isS ? nd.x - nr - 10 - list.length * (chW + 3) : nd.x + nr + 10;
        list.forEach(function (x, k) {
          var stt = x === partner ? 'cur' : '';
          if (st) { if (S.side === 'S' && isS && st.rej[i3][x]) stt = 'gone'; if (S.side === 'T' && !isS && st.rej[i3][x]) stt = 'gone'; }
          chip(cx0 + k * (chW + 3), nd.y - chH / 2, chW, chH, (isS ? TN : SN)[x].slice(0, narrow ? 1 : 4), isS ? TC : SC[x], stt);
        });
        if (S.done || S.mode === 'hand') { var rk = M.rankOf(trueList, partner); label(c, partner < 0 ? 'unmatched' : ord(rk) + ' choice', isS ? nd.x - nr - 10 : nd.x + nr + 10, nd.y - chH / 2 - 9, rk === 0 ? C.green : C.muted, { size: 10, align: isS ? 'right' : 'left' }); }
      });
      var foot = S.mode === 'hand' ? (S.sel ? 'Now tap a school for ' + SN[S.sel.i] + '.' : 'Tap a student, then a school. Tap a matched student to unmatch. Red dashes = blocking pairs.')
        : S.done ? (S.lieMsg || 'Stable: no blocking pairs. Each chip row is a preference list; gold = current match.') : S.k === 0 ? 'Press Step or Run. Chips are preference lists, best first; crossed out = rejected.' : (function () { var ev2 = S.log[S.k - 1], pn = S.side === 'S' ? SN : TN, rn = S.side === 'S' ? TN : SN; return pn[ev2.p] + ' proposes to ' + rn[ev2.r] + ': ' + (ev2.kind === 'hold' ? 'held' + (ev2.dropped !== undefined ? ', ' + pn[ev2.dropped] + ' is let go' : '') : 'rejected' + (ev2.holder !== undefined ? ' (' + rn[ev2.r] + ' prefers ' + pn[ev2.holder] + ')' : '')) + '.'; })();
      label(c, foot, w / 2, h - 18, C.muted, { size: narrow ? 10.5 : 12, align: 'center', max: w - 24 });
    }
    load(PRESETS.four); L.loop(frame, cv);
  })();

  /* =====================================================================================
     2. THE CLARKE (VCG) MECHANISM
     ===================================================================================== */
  (function () {
    var cv = $('gt12-vc'); if (!cv) return;
    var G = L.canvas(cv), c = G.c, COST = 300;
    var el = { mech: $('gt12-mech'), v: [$('gt12-v1'), $('gt12-v2'), $('gt12-v3')], vO: [$('gt12-v1-o'), $('gt12-v2-o'), $('gt12-v3-o')], rep: $('gt12-rep'), repO: $('gt12-rep-o'), truth: $('gt12-truth'), read: $('gt12-vread') };
    var S = { mech: 'vcg', v: [150, 120, 60], rep: 150 };
    function reports() { return [S.rep, S.v[1], S.v[2]]; }
    function util(r) { var rs = [r, S.v[1], S.v[2]]; return S.mech === 'vcg' ? M.clarkeUtility(0, S.v[0], rs, COST) : M.proportionalUtility(0, S.v[0], rs, COST); }
    function sync() {
      seg(el.mech, 'data-m', S.mech);
      S.v.forEach(function (v, i) { el.v[i].value = v; el.vO[i].textContent = money(v); }); el.rep.value = S.rep; el.repO.textContent = money(S.rep);
      var rs = reports(), o = S.mech === 'vcg' ? M.clarke(rs, COST) : M.proportional(rs, COST), pay = S.mech === 'vcg' ? o.tax : o.pay;
      var best = -Infinity; for (var r = 0; r <= 300; r += 1) best = Math.max(best, util(r));
      readout(el.read, [['Park built?', o.build ? 'yes' : 'no'], ['Efficient (true values ≥ $300)?', S.v[0] + S.v[1] + S.v[2] >= COST ? 'yes' : 'no'], [S.mech === 'vcg' ? 'Clarke taxes (you, Bo, Cy)' : 'Payments (you, Bo, Cy)', pay.map(function (x) { return money(x, 0); }).join(', ')],
        ['Your payoff now', money(util(S.rep), 2)], ['Your payoff if you tell the truth', money(util(S.v[0]), 2)], ['Best payoff any report gets you', money(best, 2)]]);
    }
    el.mech.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; S.mech = b.dataset.m; sync(); });
    el.v.forEach(function (inp, i) { inp.addEventListener('input', function () { S.v[i] = +inp.value; sync(); }); });
    el.rep.addEventListener('input', function () { S.rep = +el.rep.value; sync(); });
    el.truth.addEventListener('click', function () { S.rep = S.v[0]; sync(); });
    var pl = null;
    drag(cv, function (x, y) { if (!pl) return null; var b = pl.b; return x > b.x - 10 && x < b.x + b.w + 10 && y > b.y - 10 && y < b.y + b.h + 10 ? 1 : null; }, function (t, x) { S.rep = clamp(Math.round(pl.ix(x) / 5) * 5, 0, 300); sync(); });
    cv.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { S.rep = clamp(S.rep + (e.key === 'ArrowRight' ? 5 : -5), 0, 300); sync(); e.preventDefault(); } });
    function frame() {
      G.fit(); var w = G.w, h = G.h, narrow = w < 640; bg(c, w, h);
      var A = narrow ? { x: 10, y: 10, w: w - 20, h: h * 0.44 } : { x: 10, y: 10, w: w * 0.42 - 15, h: h - 20 };
      var B = narrow ? { x: 10, y: A.y + A.h + 10, w: w - 20, h: h - A.h - 30 } : { x: w * 0.42 + 5, y: 10, w: w * 0.58 - 15, h: h - 20 };
      var rs = reports(), o = S.mech === 'vcg' ? M.clarke(rs, COST) : M.proportional(rs, COST), pay = S.mech === 'vcg' ? o.tax : o.pay;
      panelBox(c, A.x, A.y, A.w, A.h, 'A $300 PARK, SHARED BY THREE NEIGHBORS');
      var names = ['You', 'Bo', 'Cy'], cols = [C.gold, C.pink, C.green], bw = (A.w - 60) / 3, base = A.y + A.h - 56, top = A.y + 50, Y = function (v) { return base - v / 300 * (base - top); };
      line(c, [[A.x + 20, Y(100)], [A.x + A.w - 10, Y(100)]], 'rgba(255,255,255,.35)', 1, [4, 4]); label(c, 'cost share $100', A.x + A.w - 12, Y(100) - 9, C.muted, { size: 10, align: 'right' });
      for (var i = 0; i < 3; i++) {
        var x = A.x + 30 + i * (bw + 10), rv = rs[i], tv = S.v[i];
        c.fillStyle = cols[i]; c.globalAlpha = 0.85; c.fillRect(x, Y(rv), bw, base - Y(rv)); c.globalAlpha = 1;
        if (i === 0 && rv !== tv) { c.strokeStyle = '#fff'; c.setLineDash([4, 3]); c.strokeRect(x, Y(tv), bw, base - Y(tv)); c.setLineDash([]); label(c, 'true ' + money(tv), x + bw / 2, Y(tv) - 9, '#fff', { size: 10, align: 'center' }); }
        label(c, 'says ' + money(rv), x + bw / 2, Y(rv) - (i === 0 && rv !== tv && Math.abs(Y(rv) - Y(tv)) < 18 ? -12 : 9), cols[i], { size: 10.5, bold: true, align: 'center' });
        label(c, names[i], x + bw / 2, base + 12, C.ink, { size: 11, bold: true, align: 'center' });
        label(c, (S.mech === 'vcg' ? 'tax ' : 'pays ') + money(pay[i], 0), x + bw / 2, base + 28, pay[i] > 0 ? C.red : C.muted, { size: 10.5, align: 'center' });
      }
      label(c, o.build ? '✓ The park is built' : '✗ No park', A.x + A.w / 2, A.y + 32, o.build ? C.green : C.red, { size: 13, bold: true, align: 'center' });
      panelBox(c, B.x, B.y, B.w, B.h, 'YOUR PAYOFF FOR EACH VALUE YOU COULD REPORT');
      var lo = Infinity, hi = -Infinity, pts = []; for (var r = 0; r <= 300; r += 1) { var u = util(r); lo = Math.min(lo, u); hi = Math.max(hi, u); pts.push([r, u]); }
      var pad = Math.max(10, (hi - lo) * 0.2); pl = plot(c, { x: B.x + 50, y: B.y + 34, w: B.w - 66, h: B.h - 72 }, [0, 300], [Math.floor((lo - pad) / 10) * 10, Math.ceil((hi + pad) / 10) * 10], { nx: 6, ny: 4, xl: 'your report', xf: function (t) { return '$' + t; }, yf: function (t) { return (t < 0 ? '−$' : '$') + Math.abs(t); } });
      line(c, [[pl.b.x, pl.Y(0)], [pl.b.x + pl.b.w, pl.Y(0)]], 'rgba(255,255,255,.25)', 1);
      line(c, pts.map(function (p) { return [pl.X(p[0]), pl.Y(p[1])]; }), C.blue, 2.5);
      line(c, [[pl.X(S.v[0]), pl.b.y], [pl.X(S.v[0]), pl.b.y + pl.b.h]], C.green, 1.5, [4, 4]); label(c, 'the truth', pl.X(S.v[0]) + 4, pl.b.y + 8, C.green, { size: 10.5 });
      dot(c, pl.X(S.rep), pl.Y(util(S.rep)), 7, C.gold, { ring: '#fff', lw: 1.5, glow: 8 });
      var bestR = 0, bestU = -Infinity; pts.forEach(function (p) { if (p[1] > bestU + 1e-9) { bestU = p[1]; bestR = p[0]; } });
      var tu = util(S.v[0]), msg = S.mech === 'vcg' ? 'No report beats the truth: honesty is a dominant strategy.' : bestU > tu + 0.5 ? 'Reporting ' + money(bestR) + ' beats the truth by ' + money(bestU - tu, 2) + ': this rule rewards shading.' : 'Here the truth happens to be best. Try other values.';
      label(c, msg, B.x + B.w / 2, B.y + B.h - 14, S.mech === 'vcg' || bestU <= tu + 0.5 ? C.green : C.red, { size: 11, align: 'center', max: B.w - 20 });
    }
    sync(); L.loop(frame, cv);
  })();
})(window, document);
