/* The Rhythm of Numbers, Chapter VII (/connections/rhythm-of-numbers/fractals/), section 33 "Six numbers, six fractals":
   the six numbers of the Continued-Fraction Suite (data/music/suite.yaml), each drawn from its continued fraction in the
   same three ways, so they can be compared.
     squares  Euclid's rectangle: cut a1 squares off a 1-by-α rectangle, then a2 squares off what is left, and so on.
              Each level is turned a quarter turn, so the squares spiral in; "Zoom forever" flies into the leftover,
              magnifying by the level's complete quotient x_k = [a_k; a_k+1, …] at every level.
     rings    the nested blocks the music uses: a level-k block is a_k level-(k−1) blocks, then one level-(k−2) block
              (lengths q_k = a_k q_k−1 + q_k−2). Ring by ring from the center: the top block, its children, theirs, ….
     path     the beat word (the same word the hub plays) walked as a path: a step per beat, a quarter turn on each hit,
              left on even beats and right on odd ones (Monnerot-Dumaine's rule, as in section 31).
   Movement VI uses pi's own structure, zoomed to the 292nd return: units 32,657–33,101 (the last three 113-unit cycles
   and the 106-unit short cycle), marked at 32,996 = 292 × 113.
   This file is also loaded by the Suite page (layouts/music/suite.html) to draw its six thumbnail cards; there RN (core.js)
   is absent and only window.SixFrac is used. Every number here was checked by /tmp/work_fracviz/cf.py (mpmath). */
(function (W, D) {
  'use strict';
  function rep(v, n) { var a = []; for (var i = 0; i < n; i++) a.push(v); return a; }
  function eT(n) { var t = [1]; for (var k = 1; t.length < n; k++) t.push(2 * k, 1, 1); return t.slice(0, n); } /* e − 2 = [0; 1, 2, 1, 1, 4, 1, 1, 6, …] */
  var PI = [7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2, 2, 2, 1, 84, 2, 1, 1, 15, 3, 13, 1, 4, 2, 6, 6, 99, 1, 2, 2, 6, 3, 5, 1, 1, 6, 8, 1];
  var FIFTH = [1, 1, 2, 2, 3, 1, 5, 2, 23, 2, 2, 1, 1, 55, 1, 4, 3, 1, 1, 15, 1, 9, 2, 5, 7, 1, 1, 4, 8, 1, 11, 1, 20, 2, 1, 10, 1, 4, 1, 1, 1, 1, 1, 37];
  var NUMS = [
    { id: 'golden', num: 'I', name: 'Golden', label: 'φ − 1', t: rep(1, 60) },
    { id: 'silver', num: 'II', name: 'Silver', label: '√2 − 1', t: rep(2, 60) },
    { id: 'the-fifth', num: 'III', name: 'The Fifth', label: 'log₂(3/2)', t: FIFTH },
    { id: 'euler', num: 'IV', name: 'Euler', label: 'e − 2', t: eT(60) },
    { id: 'pi', num: 'V', name: 'Pi', label: 'π − 3', t: PI },
    { id: 'pi-bar-32996', num: 'VI', name: 'Pi, bar 32,996', label: 'π − 3', t: PI, win: [32657, 33102], mark: 32996, movie: [32967, 33017], sq: { k: 4, c: 289.6, L: 7.5 } }
  ];
  var STYLES = ['squares', 'rings', 'path'];
  var MAXU = 40000;
  var PAL = {
    light: { bg: '#ffffff', ink: '#1e1e1e', muted: '#566159', line: '#c9d3cd', g: '#00562f', teal: '#0a6f7d', gold: '#b8963e', amber: '#9a4f00' },
    dark: { bg: '#16201b', ink: '#e9eeeb', muted: '#a9b5ae', line: '#3a4640', g: '#6cc79a', teal: '#5fd0dc', gold: '#e2c072', amber: '#f0ad5b' }
  };
  function font(px, mono) { return px + 'px ' + (mono ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' : 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

  /* ---------- the structure of one number: block lengths, rings, beat word, path ---------- */
  function struct(n) {
    if (n._s) return n._s;
    var t = n.t, len = { '-1': 1, '0': 1 }, K = 0;
    for (var k = 1; k <= t.length; k++) { var L = k === 1 ? t[0] : t[k - 1] * len[k - 1] + len[k - 2]; if (L > MAXU) break; len[k] = L; K = k; }
    var S = { len: len, K: K, A: n.win ? n.win[0] : 0, B: n.win ? n.win[1] : len[K] };
    function reps(lv) { return lv === 1 ? t[0] - 1 : t[lv - 1]; }
    /* ring j: every block of level j inside the window (kind 0), or the shorter tail block that sits in its place (kind 1) */
    function ring(j) {
      var out = [];
      (function ex(lv, st, sib) {
        var L = len[lv]; if (st >= S.B || st + L <= S.A) return;
        if (lv <= j) { out.push([st, L, lv === j ? 0 : 1, sib]); return; }
        var r = reps(lv), p = st;
        for (var i = 0; i < r; i++) { ex(lv - 1, p, i); p += len[lv - 1]; if (p >= S.B) return; }
        ex(lv - 2, p, r);
      })(K, 0, 0);
      return out;
    }
    var top = n.win ? 3 : K - 1, bot = n.win ? 0 : Math.max(1, K - 7);
    if (!n.win && len[K] <= 2000) bot = 0;
    S.rings = []; for (var j = top; j >= bot; j--) S.rings.push({ lv: j, b: ring(j) });
    /* the ring that colors the path: the coarsest with at least five blocks */
    S.cr = S.rings[S.rings.length - 1];
    for (var i = 0; i < S.rings.length; i++) if (S.rings[i].b.length >= 5) { S.cr = S.rings[i]; break; }
    if (n.win) S.cr = S.rings[0];
    /* the beat word: unit u is a hit when it is a level −1 block (the same word as the hub's RN.W.word) */
    var N = S.B, hit = new Uint8Array(N);
    (function ex(lv, st) { if (st >= N) return; if (lv === -1) { hit[st] = 1; return; } if (lv === 0) return; var r = reps(lv), p = st; for (var i = 0; i < r; i++) { ex(lv - 1, p); p += len[lv - 1]; if (p >= N) return; } ex(lv - 2, p); })(K, 0);
    S.hit = hit;
    var px = new Float32Array(N + 1), py = new Float32Array(N + 1), dir = 0, X = 0, Y = 0, DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
    for (var u = 0; u < N; u++) { X += DX[dir]; Y += DY[dir]; px[u + 1] = X; py[u + 1] = Y; if (hit[u]) dir = (dir + ((u + 1) % 2 === 0 ? 1 : 3)) % 4; }
    S.px = px; S.py = py;
    /* complete quotients x_k = [a_k; a_k+1, …], k = 1 … (from the tail, which is plenty for the levels drawn) */
    var x = []; x[t.length + 1] = t[t.length - 1]; for (k = t.length; k >= 1; k--) x[k] = t[k - 1] + 1 / x[k + 1];
    S.x = x; S.kmax = Math.min(t.length - 6, 36);
    /* sound events: each block start in a ring with at most 500 blocks; the coarsest ring wins */
    var ev = {}; S.rings.forEach(function (R, ri) { if (R.b.length > 500) return; R.b.forEach(function (b) { if (!(b[0] in ev) && b[0] >= S.A) ev[b[0]] = [b[0], ri, b[2]]; }); });
    S.ev = Object.keys(ev).map(function (k) { return ev[k]; }).sort(function (a, b) { return a[0] - b[0]; });
    n._s = S; return S;
  }

  /* ---------- rings ---------- */
  function drawRings(g, w, h, n, P, o) {
    var S = struct(n), R = Math.min(w, h) / 2 - (n.win ? (w > 200 ? 22 : 10) : 8), cx = w / 2, cy = h / 2, r0 = R * 0.2, nr = S.rings.length, dr = (R - r0) / nr;
    var span = n.win ? Math.PI * 5 / 3 : Math.PI * 2, a0 = -Math.PI / 2 + (Math.PI * 2 - span) / 2, AB = S.B - S.A;
    function ang(u) { return a0 + span * (Math.max(S.A, Math.min(S.B, u)) - S.A) / AB; }
    var upto = o && o.cursor != null ? o.cursor : S.B;
    S.rings.forEach(function (Rg, ri) {
      var ri0 = r0 + ri * dr + 1, ri1 = r0 + (ri + 1) * dr - 1, rm = (ri0 + ri1) / 2, hue = ri % 2 ? P.teal : P.g;
      g.lineWidth = ri1 - ri0;
      Rg.b.forEach(function (b) {
        var u0 = Math.max(S.A, b[0]), u1 = Math.min(S.B, b[0] + b[1]); if (u0 >= upto) return; u1 = Math.min(u1, upto);
        var s0 = ang(u0), s1 = ang(u1), lenPx = (s1 - s0) * rm, gap = lenPx > 5 ? Math.min(1.1, lenPx * 0.12) / rm : 0;
        g.strokeStyle = b[2] ? P.amber : hue; g.globalAlpha = b[2] ? 1 : (b[3] % 2 ? 0.62 : 0.95);
        g.beginPath(); g.arc(cx, cy, rm, s0 + gap, Math.max(s0 + gap + 0.0005, s1 - gap)); g.stroke();
      });
      g.globalAlpha = 1;
    });
    /* the center: the number */
    g.fillStyle = P.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    var fs = Math.max(10, Math.min(22, r0 * 0.42)); g.font = 'italic ' + fs + 'px Georgia, serif'; if (r0 >= 24) g.fillText(n.label, cx, cy - (r0 > 40 ? fs * 0.35 : 0));
    if (r0 > 40) { g.font = font(Math.max(9, fs * 0.5)); g.fillStyle = P.muted; g.fillText(n.win ? 'bars ' + fmt(S.A + 1) + '–' + fmt(S.B) : fmt(S.B) + ' in all', cx, cy + fs * 0.75); }
    drawRingMarks();
    function drawRingMarks() {
    if (n.win) {
      /* the 292nd return, and the 50 bars of Movement VI */
      var am = ang(n.mark); g.strokeStyle = P.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(am) * (r0 - 4), cy + Math.sin(am) * (r0 - 4)); g.lineTo(cx + Math.cos(am) * (R + 6), cy + Math.sin(am) * (R + 6)); g.stroke();
      g.strokeStyle = P.gold; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R + 6, ang(n.movie[0]), ang(n.movie[1])); g.stroke();
      if (w > 200) {
        g.font = font(w < 420 ? 10 : 12); g.fillStyle = P.ink;
        var lab = '32,996', lw = g.measureText(lab).width, tx = cx + Math.cos(am) * (R + 10), ty = cy + Math.sin(am) * (R + 10) + 14; tx = Math.max(lw / 2 + 2, Math.min(w - lw / 2 - 2, tx)); g.textAlign = 'center'; g.fillText(lab, tx, ty);
        g.fillStyle = P.muted; g.textAlign = 'center';
        g.fillText('start', cx + Math.cos(a0) * (R + 12) - 14, cy + Math.sin(a0) * (R + 12)); g.fillText('end', cx + Math.cos(a0 + span) * (R + 12) + 12, cy + Math.sin(a0 + span) * (R + 12));
      }
    } else if (w > 200) { g.strokeStyle = P.ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, cy - r0 + 2); g.lineTo(cx, cy - R - 2); g.stroke(); }
    if (o && o.cursor != null) { var ac = ang(o.cursor); g.strokeStyle = P.gold; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx + Math.cos(ac) * r0, cy + Math.sin(ac) * r0); g.lineTo(cx + Math.cos(ac) * R, cy + Math.sin(ac) * R); g.stroke(); }
    }
  }

  /* ---------- path ---------- */
  function drawPath(g, w, h, n, P, o) {
    var S = struct(n), A = S.A, B = S.B, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, i;
    for (i = A; i <= B; i++) { var X = S.px[i], Y = S.py[i]; if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; }
    var pad = w < 200 ? 5 : 14, sc = Math.min((w - 2 * pad) / Math.max(1, x1 - x0), (h - 2 * pad) / Math.max(1, y1 - y0)), ox = (w - (x1 - x0) * sc) / 2, oy = (h - (y1 - y0) * sc) / 2;
    function SX(u) { return ox + (S.px[u] - x0) * sc; } function SY(u) { return h - oy - (S.py[u] - y0) * sc; }
    var upto = o && o.cursor != null ? Math.max(A + 1, o.cursor) : B;
    g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = Math.max(0.7, Math.min(2.4, sc * 0.35));
    S.cr.b.forEach(function (b, bi) {
      var u0 = Math.max(A, b[0]), u1 = Math.min(upto, b[0] + b[1]); if (u1 <= u0) return;
      g.strokeStyle = b[2] ? P.amber : (bi % 2 ? P.teal : P.g); g.beginPath(); g.moveTo(SX(u0), SY(u0));
      for (var u = u0 + 1; u <= u1; u++) g.lineTo(SX(u), SY(u)); g.stroke();
    });
    g.fillStyle = P.gold; g.beginPath(); g.arc(SX(A), SY(A), w < 200 ? 2.5 : 4, 0, 7); g.fill();
    if (n.win && upto > n.mark) { g.fillStyle = P.ink; g.beginPath(); g.arc(SX(n.mark), SY(n.mark), w < 200 ? 2.5 : 5, 0, 7); g.fill(); if (w > 200) { g.font = font(w < 420 ? 10 : 12); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(' 32,996', SX(n.mark) + 5, SY(n.mark)); } }
    if (o && o.cursor != null) { g.fillStyle = P.gold; g.beginPath(); g.arc(SX(upto), SY(upto), 4, 0, 7); g.fill(); }
  }

  /* ---------- squares ---------- */
  /* Frame k: the level-k rectangle is [0, x_k] × [0, 1]; its a_k squares are [i, i+1] × [0, 1]; what is left,
     [a_k, x_k] × [0, 1], holds frame k+1 turned a quarter turn: (u, v) ↦ (a_k + s − s·v, s·u), s = 1/x_k+1. */
  /* the view of frame k at a whole level: the whole rectangle, unless that would make it thinner than minS pixels; then
     the end of it that holds the leftover (where the zoom goes) */
  function std(S, k, w, h) {
    var x = S.x[k], sc = Math.min(0.92 * w / x, 0.8 * h), minS = Math.min(0.8 * h, Math.max(16, w / 30)); if (sc < minS) sc = minS;
    var Lv = 0.92 * w / sc; return { cx: Lv < x ? x - Lv / 2 : x / 2, cy: 0.5, S: sc };
  }
  function camera(S, n, w, h, s) {
    var k = Math.max(1, Math.floor(s)), f = s - k, a = n.t[k - 1], sc = 1 / S.x[k + 1];
    var V0 = std(S, k, w, h), V1 = std(S, k + 1, w, h);
    if (n.sq && k === n.sq.k) V0 = { cx: n.sq.c, cy: 0.5, S: 0.92 * w / n.sq.L };
    var S0 = V0.S, S1 = V1.S * S.x[k + 1], c1x = a + sc - sc * V1.cy, c1y = sc * V1.cx; /* the next view's center, in frame k */
    var Sf = Math.exp(Math.log(S0) + (Math.log(S1) - Math.log(S0)) * f);
    var gf = Math.abs(S1 - S0) < 1e-9 ? f : (1 - S0 / Sf) / (1 - S0 / S1), cx = V0.cx + (c1x - V0.cx) * gf, cy = V0.cy + (c1y - V0.cy) * gf;
    var rot = -Math.PI / 2 * f, co = Math.cos(rot), si = Math.sin(rot);
    var m = [Sf * co, -Sf * si, -Sf * si, -Sf * co]; /* m11 m12 m21 m22 */
    return { k: k, m11: m[0], m12: m[1], m21: m[2], m22: m[3], tx: w / 2 - (m[0] * cx + m[1] * cy), ty: h / 2 - (m[2] * cx + m[3] * cy), mag: S1 / S0 };
  }
  function child(T, a, sc) { return { m11: T.m12 * sc, m12: -T.m11 * sc, m21: T.m22 * sc, m22: -T.m21 * sc, tx: T.m11 * (a + sc) + T.tx, ty: T.m21 * (a + sc) + T.ty }; }
  function parent(T, a, sc) { var q = (a + sc) / sc; return { m11: -T.m12 / sc, m12: T.m11 / sc, m21: -T.m22 / sc, m22: T.m21 / sc, tx: T.m12 * q + T.tx, ty: T.m22 * q + T.ty }; }
  function drawSquares(g, w, h, n, P, o) {
    var S = struct(n), s = o && o.s != null ? o.s : (n.sq ? n.sq.k : 1), C = camera(S, n, w, h, s), k = C.k, T = C, j, base = g.getTransform ? g.getTransform() : null;
    /* up to three parents, then down until the squares are under half a pixel */
    var frames = [];
    for (j = k; j >= Math.max(1, k - 3); j--) { frames.unshift([j, T]); if (j > 1) T = parent(T, n.t[j - 2], 1 / S.x[j]); }
    T = C; for (j = k + 1; j <= S.kmax + 8 && j < n.t.length; j++) { T = child(T, n.t[j - 2], 1 / S.x[j]); frames.push([j, T]); if (Math.hypot(T.m11, T.m21) < 0.5) break; }
    var labels = [];
    frames.forEach(function (fr) {
      var lv = fr[0], M = fr[1], a = n.t[lv - 1], px = Math.hypot(M.m11, M.m21), big = a >= 10, hue = big ? P.amber : (lv % 2 ? P.g : P.teal), dim = lv < k ? 0.45 : 1;
      if (px < 0.25) return;
      g.save(); if (base) g.setTransform(base); g.transform(M.m11, M.m21, M.m12, M.m22, M.tx, M.ty);
      var i0 = 0, i1 = a;
      /* only the squares near the screen */
      if (a > 20) { var inv = function (X, Y) { var det = M.m11 * M.m22 - M.m12 * M.m21; return ((X - M.tx) * M.m22 - (Y - M.ty) * M.m12) / det; }; var us = [inv(0, 0), inv(w, 0), inv(0, h), inv(w, h)]; i0 = Math.max(0, Math.floor(Math.min.apply(null, us)) - 1); i1 = Math.min(a, Math.ceil(Math.max.apply(null, us)) + 1); }
      if (i1 > i0 && px >= 1.2) {
        for (var i = i0; i < i1; i++) { g.globalAlpha = (i % 2 ? 0.16 : 0.26) * dim; g.fillStyle = hue; g.fillRect(i, 0, 1, 1); }
        g.globalAlpha = dim;
        if (px >= 5) { g.strokeStyle = P.line; g.lineWidth = 1 / px; for (i = i0; i < i1; i++) g.strokeRect(i, 0, 1, 1); }
        if (px >= 3) { g.strokeStyle = big ? P.amber : P.gold; g.lineWidth = Math.min(2.2, px * 0.04 + 0.8) / px; g.beginPath(); for (i = i0; i < i1; i++) { g.moveTo(i + 1, 0); g.arc(i, 0, 1, 0, Math.PI / 2); } g.stroke(); }
      } else if (i1 > i0) { g.globalAlpha = 0.5 * dim; g.fillStyle = hue; g.fillRect(i0, 0, i1 - i0, 1); }
      g.globalAlpha = 1; g.restore();
      var runPx = a * px, mid = a / 2, tag = null;
      if (n.sq && lv === n.sq.k && s === n.sq.k) { mid = a - 0.5; tag = 'square 292'; }
      if (runPx > 34 && px > 6 && lv >= k && labels.length < 4) labels.push([M.m11 * mid + M.m12 * 0.5 + M.tx, M.m21 * mid + M.m22 * 0.5 + M.ty, tag || (a + (a === 1 ? ' square' : ' squares')), big]);
    });
    if (w > 200) labels.forEach(function (L) {
      if (L[0] < 0 || L[0] > w || L[1] < 0 || L[1] > h) return;
      var txt = L[2]; g.font = font(w < 420 ? 10 : 12, 0); var tw = g.measureText(txt).width + 10; L[0] = Math.max(tw / 2 + 2, Math.min(w - tw / 2 - 2, L[0])); L[1] = Math.max(11, Math.min(h - 11, L[1]));
      g.fillStyle = P.bg; g.globalAlpha = 0.85; g.fillRect(L[0] - tw / 2, L[1] - 9, tw, 18); g.globalAlpha = 1; g.fillStyle = L[3] ? P.amber : P.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, L[0], L[1]);
    });
    return C;
  }

  function draw(g, w, h, n, style, P, o) {
    if (o && o.bg) { g.fillStyle = P.bg; g.fillRect(0, 0, w, h); }
    if (style === 'rings') return drawRings(g, w, h, n, P, o);
    if (style === 'path') return drawPath(g, w, h, n, P, o);
    return drawSquares(g, w, h, n, P, o);
  }
  function setup(cv, h) { var d = W.devicePixelRatio || 1, w = cv.clientWidth || 300; h = h || +cv.getAttribute('height') || w; cv.style.height = h + 'px'; cv.width = Math.round(w * d); cv.height = Math.round(h * d); var g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return [g, w, h]; }
  function isDark() { var t = D.documentElement.getAttribute('data-theme'); if (t) return t === 'dark'; try { return W.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } }
  function pal() { return PAL[isDark() ? 'dark' : 'light']; }
  var SF = W.SixFrac = { NUMS: NUMS, STYLES: STYLES, PAL: PAL, struct: struct, draw: draw, setup: setup, camera: camera, pal: pal };

  /* ---------- the Suite page: six thumbnail cards ---------- */
  function thumbs() {
    var cvs = D.querySelectorAll('canvas[data-sixfrac]'); if (!cvs.length) return;
    function all() { cvs.forEach(function (cv) { var n = NUMS.filter(function (m) { return m.id === cv.dataset.sixfrac; })[0]; if (!n) return; var r = setup(cv, Math.round(cv.clientWidth * 0.75)); draw(r[0], r[1], r[2], n, cv.dataset.style || 'rings', pal()); }); }
    all(); var rt; W.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(all, 200); });
    new MutationObserver(function () { setTimeout(all, 30); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    try { W.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', all); } catch (e) { }
  }
  var RN = W.RN;
  if (!RN || !RN.def) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', thumbs); else thumbs(); return; }

  /* ---------- the chapter's instrument ---------- */
  var $ = RN.$, cur = 4, style = 'squares', camS = 1, zoomRaf = 0, pl = null, cursor = null, sec = null, lastK = 0;
  function N() { return NUMS[cur]; }
  function s0() { var n = N(); return n.sq ? n.sq.k : 1; }
  function opts() { return { s: camS, cursor: cursor }; }
  function hFor(cw) { return Math.round(style === 'squares' ? Math.max(240, Math.min(400, cw * 0.55)) : style === 'rings' ? Math.min(460, cw) : Math.min(460, cw * 1.1)); }
  function drawMain() {
    var cv = $('sfCan'), cw = cv.clientWidth || 300, r = RN.setup(cv, hFor(cw)), g = r[0], w = r[1], H = r[2]; g.clearRect(0, 0, w, H);
    var P = pal(); P = Object.assign({}, P, { bg: RN.c('--rn-panel') || P.bg });
    var C = draw(g, w, H, N(), style, P, opts());
    readout(C);
  }
  function readout(C) {
    var n = N(), S = struct(n), t = n.t, el = $('sfWhat');
    $('sfName').textContent = 'Movement ' + n.num + ' · ' + n.name + ': ' + n.label;
    $('sfTerms').textContent = '[0; ' + t.slice(0, n.id === 'euler' ? 14 : 10).join(', ') + ', …]';
    if (style === 'squares') {
      var k = C.k, mag = 1; for (var i = 1; i < k; i++) mag *= S.x[i];
      el.textContent = 'Level ' + k + ': ' + t[k - 1] + (t[k - 1] === 1 ? ' square' : ' squares') + ' across a rectangle ' + S.x[k].toFixed(S.x[k] > 100 ? 1 : 3) + ' times as long as it is wide' + (k > 1 ? '; magnified ×' + (mag < 10 ? mag.toFixed(2) : mag < 1000 ? mag.toFixed(1) : mag < 1e6 ? fmt(mag) : mag.toExponential(2)) + ' since the first rectangle.' : '.');
    } else if (style === 'rings') {
      el.textContent = 'From the center out, the rings hold blocks of ' + S.rings.map(function (R) { return fmt(S.len[R.lv]); }).join(', then ') + ', each with its shorter tail blocks in amber' + (n.win ? ' bars, from bar ' + fmt(S.A + 1) + ' to bar ' + fmt(S.B) + '. The line marks the end of bar 32,996; the gold arc is Movement VI.' : ', inside one block of ' + fmt(S.B) + '.');
    } else {
      var turns = 0; for (var u = S.A; u < S.B; u++) turns += S.hit[u];
      el.textContent = fmt(S.B - S.A) + ' steps, ' + fmt(turns) + ' turns' + (n.win ? ': the last three 113-step cycles and the 106-step short cycle.' : '.');
    }
    $('sfCan').setAttribute('aria-label', n.name + ', ' + n.label + ', drawn as ' + style + '. ' + el.textContent + ' Left and right arrows change the number' + (style === 'squares' ? '; plus and minus step the zoom.' : '.'));
    $('sfSq').hidden = style !== 'squares'; $('sfPlay').hidden = style === 'squares';
  }
  function thumbsMain() {
    var P = pal();
    D.querySelectorAll('#sfGal canvas').forEach(function (cv, i) { var r = RN.setup(cv, Math.round(cv.clientWidth * 0.75)); draw(r[0], r[1], r[2], NUMS[i], style, P, {}); });
  }
  function caps() {
    NUMS.forEach(function (n, i) { var c = $('sfCap-' + n.id); if (c) c.hidden = i !== cur; var b = $('sfB-' + n.id); if (b) b.setAttribute('aria-pressed', String(i === cur)); });
    STYLES.forEach(function (s) { var b = $('sfS-' + s); if (b) b.setAttribute('aria-pressed', String(s === style)); var p = $('sfHow-' + s); if (p) p.hidden = s !== style; });
  }
  function stopAll() { zoomStop(); if (pl && pl.on) pl.stop(); }
  function choose(i) { stopAll(); cur = (i + NUMS.length) % NUMS.length; camS = s0(); cursor = null; caps(); drawMain(); }
  function setStyle(s) { stopAll(); style = s; camS = s0(); cursor = null; caps(); thumbsMain(); drawMain(); }

  /* the infinite zoom: constant speed in log-magnification, so a 292 takes as long as it should */
  function zoomStop() { if (zoomRaf) cancelAnimationFrame(zoomRaf); zoomRaf = 0; var b = $('sfZoom'); if (b) { b.textContent = '▶ Zoom forever'; b.setAttribute('aria-pressed', 'false'); } }
  function levelNotes(k, dur) {
    var ctx = RN.ac(); if (!ctx || !$('sfSnd').checked) return; var a = N().t[k - 1], m = Math.min(a, 48), t0 = ctx.currentTime + 0.03;
    for (var i = 0; i < m; i++) RN.note(t0 + i * dur / m, RN.degree((k - 1) % 8, 55), Math.min(0.3, dur / m * 0.9), i === 0 ? 0.3 : 0.16);
  }
  function zoomStart() {
    if (RN.reduced) { stepZoom(1); return; }
    RN.stopAll(); var b = $('sfZoom'); b.textContent = '■ Stop'; b.setAttribute('aria-pressed', 'true');
    var cv = $('sfCan'), w = cv.clientWidth, H = hFor(w), last = performance.now(), S = struct(N());
    lastK = -1;
    RN.stopper(zoomStop);
    (function fr(ts) {
      var dt = Math.min(0.1, (ts - last) / 1000); last = ts;
      if (sec && sec._rnVis !== false && !D.hidden) {
        var C = camera(S, N(), w, H, camS), per = Math.max(0.55, Math.log(S.x[C.k]) / 0.85) / (RN.snd.tempo || 1);
        if (C.k !== lastK) { lastK = C.k; levelNotes(C.k, per); }
        camS += dt / per;
        if (camS >= S.kmax) { camS = s0(); }
        drawMain();
      }
      zoomRaf = requestAnimationFrame(fr);
    })(last);
  }
  function stepZoom(d) { stopAll(); var S = struct(N()); camS = Math.max(1, Math.min(S.kmax, Math.floor(camS + 1e-6) + d)); if (d > 0) levelNotes(Math.floor(camS), 0.9); drawMain(); }

  /* the still: a PNG of the current picture, light or dark */
  function png(theme) {
    var w = 1600, h = style === 'rings' ? 1600 : 1000, cv = D.createElement('canvas'), P = PAL[theme];
    var src = $('sfCan'), sw = src.clientWidth, sh = hFor(sw);
    if (style === 'squares') h = Math.round(w * sh / sw);
    cv.width = w; cv.height = h + 90; var g = cv.getContext('2d'); g.fillStyle = P.bg; g.fillRect(0, 0, w, h + 90);
    g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip();
    if (style === 'squares') { g.scale(w / sw, w / sw); draw(g, sw, sh, N(), style, P, { s: camS }); }
    else draw(g, w, h, N(), style, P, {});
    g.restore(); g.fillStyle = P.bg; g.fillRect(0, h, w, 90); g.fillStyle = P.line; g.fillRect(0, h, w, 1);
    var n = N(); g.fillStyle = P.ink; g.font = 'italic 34px Georgia, serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText('Movement ' + n.num + ', ' + n.name + ':  ' + n.label + ' = [0; ' + n.t.slice(0, 6).join(', ') + ', …]', 40, h + 52);
    g.font = font(22); g.fillStyle = P.muted; g.textAlign = 'right'; g.fillText(style + ' · Teddy Rook Book · teddyrookbook.com', w - 40, h + 52);
    cv.toBlob(function (b) { if (!b) return; var a = D.createElement('a'), u = URL.createObjectURL(b); a.href = u; a.download = 'fractal-' + n.id + '-' + style + '-' + theme + '.png'; D.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }, 'image/png');
  }

  RN.def('six', {
    init: function (el) {
      sec = el;
      var h = ''; try { h = new URLSearchParams(location.search).get('n') || ''; } catch (e) { } NUMS.forEach(function (n, i) { if (n.id === h) cur = i; });
      camS = s0();
      NUMS.forEach(function (n, i) { $('sfB-' + n.id).addEventListener('click', function () { choose(i); }); });
      STYLES.forEach(function (s) { $('sfS-' + s).addEventListener('click', function () { setStyle(s); }); });
      $('sfZoom').addEventListener('click', function () { if (zoomRaf) zoomStop(); else zoomStart(); });
      if (RN.reduced) $('sfZoom').textContent = 'Zoom one level ›';
      $('sfIn').addEventListener('click', function () { stepZoom(1); });
      $('sfOut').addEventListener('click', function () { if (camS <= s0() + 1e-6) { stopAll(); camS = s0(); drawMain(); } else stepZoom(-1); });
      $('sfPngL').addEventListener('click', function () { png('light'); });
      $('sfPngD').addEventListener('click', function () { png('dark'); });
      $('sfCan').addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); choose(cur + (k === 'ArrowRight' ? 1 : -1)); }
        else if (style === 'squares' && (k === '+' || k === '=')) { e.preventDefault(); stepZoom(1); }
        else if (style === 'squares' && (k === '-' || k === '_')) { e.preventDefault(); $('sfOut').click(); }
      });
      /* Squares: "Zoom forever", with a note per square when Sound is on (a run of up to 48 per level). Rings and path:
         Play sweeps through the picture and sounds each block start (inner rings low, outer rings high; amber tail
         blocks a step apart), drawing as it goes. */
      pl = RN.player({ sec: el, btn: $('sfPlay'), play: '▶ Play', loop: false,
        len: function () { return struct(N()).ev.length; },
        dur: function (i) { var S = struct(N()), E = S.ev, nx = i + 1 < E.length ? E[i + 1][0] : S.B; return Math.max(0.035, (nx - E[i][0]) / (S.B - S.A) * (N().win ? 30 : 22)); },
        step: function (i, when) {
          var e = struct(N()).ev[i], nr = struct(N()).rings.length;
          RN.note(when, RN.degree(e[1] * 2 + (e[2] ? 1 : 0), 48 + (nr > 4 ? 0 : 7)), 0.22, e[1] === 0 ? 0.32 : 0.2);
        },
        draw: function (i) { var E = struct(N()).ev; cursor = i < 0 ? null : (i + 1 < E.length ? E[i + 1][0] : struct(N()).B); drawMain(); },
        onStop: function () { cursor = null; }
      });
      caps(); thumbsMain(); drawMain();
    },
    redraw: function () { thumbsMain(); drawMain(); },
    show: function (v) { if (!v) { if (pl && pl.on) pl.stop(); } }
  });
})(window, document);
