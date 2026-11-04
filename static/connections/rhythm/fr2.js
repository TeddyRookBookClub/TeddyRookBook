/* The Rhythm of Numbers, Chapter VII (fractals), part 2: sb (the Stern–Brocot tree), mink (Minkowski's ?(x)),
   stair (the devil's staircase of the circle map). Conventions: core.js; helpers from fr1.js may be missing if that
   file has not loaded yet, so this file keeps its own. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font;
  var SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sup(n) { return String(n).split('').map(function (ch) { return SUP[ch] || ch; }).join(''); }
  function runs(t, a0) { /* the Stern–Brocot runs of [a0; t…]: R^a0 L^t1 R^t2 …, last run one short for a fraction */
    var out = [], all = [a0].concat(t);
    all.forEach(function (n, i) { if (i === all.length - 1 && RN.W.rational) n -= 1; if (n > 0) out.push([i % 2 ? 'L' : 'R', n]); });
    return out;
  }
  function runText(rs, max) { var s = rs.slice(0, max).map(function (r) { return r[0] + (r[1] > 1 ? sup(r[1]) : ''); }).join(' '); return s + (rs.length > max || !RN.W.rational ? ' …' : ''); }
  /* a playhead-following view over a list of steps */
  function sweep(sec, btn, n, val, draw) {
    return RN.player({ sec: sec, btn: btn, loop: false, len: function () { return n; }, dur: function () { return 0.13; },
      step: function (i, when) { var v = val(i); if (v == null) return; RN.note(when, RN.degree(Math.round(v * 14)), 0.16, 0.24); },
      draw: draw, onStop: function () { draw(-1); } });
  }

  /* ---------- 26 the Stern–Brocot tree ---------- */
  var sbSteps = [], sbHead = -1, sbPl = null;
  function sbBuild() {
    var W = RN.W, rs = runs(W.allTerms, W.int || 0); sbSteps = [];
    rs.forEach(function (r) { for (var j = 0; j < r[1] && sbSteps.length < 600; j++) sbSteps.push(r[0]); });
    var sl = $('sbAt'); sl.max = Math.max(0, Math.min(40, sbSteps.length)); if (+sl.value > +sl.max) sl.value = sl.max;
    $('sbPath').textContent = runText(rs, 12);
  }
  function nodeAt(s) { var a = 0, b = 1, cc = 1, d = 0; for (var i = 0; i < s; i++) { if (sbSteps[i] === 'L') { cc = a + cc; d = b + d; } else { a = a + cc; b = b + d; } } return [a, b, cc, d]; }
  function drawSB() {
    var s = +$('sbAt').value; $('sbAtV').textContent = s;
    var cv = $('sbCan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var depth = w < 520 ? 4 : 5, top = 34, rowH = (H - top - 18) / (depth - 1), nd = nodeAt(s);
    var path = sbSteps.slice(s, s + depth - 1);
    x.font = F(11, 1); x.textAlign = 'center'; x.textBaseline = 'middle';
    var crumbs = sbSteps.slice(Math.max(0, s - 12), s).join(' ');
    x.fillStyle = c('--rn-muted'); x.textAlign = 'left'; x.fillText(s ? 'after ' + (s > 12 ? '… ' : '') + crumbs : 'the top of the tree', 6, 12); x.textAlign = 'center';
    (function rec(a, b, cc, d, lev, x0, x1, onPath, px, py) {
      var X = (x0 + x1) / 2, Y = top + lev * rowH, p = a + cc, q = b + d;
      if (px != null) { x.strokeStyle = onPath ? c('--rn-prime') : c('--rn-line'); x.lineWidth = onPath ? 2.5 : 1; x.beginPath(); x.moveTo(px, py + 9); x.lineTo(X, Y - 9); x.stroke(); x.lineWidth = 1; }
      var hot = onPath && lev === Math.min(depth - 1, path.length) && sbHead >= 0;
      var lab = p + '/' + q, fs = Math.max(8, Math.min(13, (x1 - x0) / (lab.length * 0.62)));
      x.font = F(fs, 1); var tw = x.measureText(lab).width + 8;
      x.fillStyle = onPath ? c('--rn-prime') : c('--rn-soft'); x.globalAlpha = onPath ? 0.22 : 1; x.fillRect(X - tw / 2, Y - 9, tw, 18); x.globalAlpha = 1;
      if (hot) { x.strokeStyle = c('--rn-prime'); x.lineWidth = 2; x.strokeRect(X - tw / 2, Y - 9, tw, 18); x.lineWidth = 1; }
      x.fillStyle = onPath ? c('--rn-ink') : c('--rn-muted'); x.fillText(lab, X, Y);
      if (lev + 1 >= depth) return;
      var dir = onPath ? path[lev] : null;
      rec(a, b, p, q, lev + 1, x0, X, dir === 'L', X, Y);
      rec(p, q, cc, d, lev + 1, X, x1, dir === 'R', X, Y);
    })(nd[0], nd[1], nd[2], nd[3], 0, 0, w, true, null, null);
    var pp = nd[0] + nd[2], qq = nd[1] + nd[3];
    $('sbNode').textContent = pp + '/' + qq + ' = ' + (pp / qq).toPrecision(10) + (s ? ', after ' + s + ' step' + (s > 1 ? 's' : '') : '');
  }
  RN.def('sb', {
    init: function () {
      $('sbAt').addEventListener('input', drawSB);
      sbPl = RN.player({ sec: $('sb'), btn: $('sbPlay'), teach: $('sbTeach'), loop: false,
        len: function () { return Math.min(sbSteps.length, 96); }, dur: function () { return 0.16; },
        step: function (i, when) { var st = sbSteps[i], newRun = !i || sbSteps[i - 1] !== st; RN.note(when, RN.degree(st === 'L' ? 0 : 4), 0.14, newRun ? 0.34 : 0.2); if (newRun) RN.note(when, RN.degree(st === 'L' ? -7 : -3), 0.3, 0.12); },
        draw: function (i) { sbHead = i; if (i >= 0) { var sl = $('sbAt'); sl.value = Math.min(+sl.max, Math.max(0, i - 1)); } drawSB(); } });
      sbBuild(); drawSB();
    },
    number: function () { sbBuild(); drawSB(); }, redraw: drawSB
  });

  /* ---------- 27 Minkowski's question-mark function ---------- */
  function qm(x) { /* ?(x) for 0 ≤ x ≤ 1 from the Gauss map, in doubles */
    if (x <= 0) return 0; if (x >= 1) return 1;
    var s = 0, sg = 1, tot = 0;
    for (var k = 0; k < 64; k++) { var y = 1 / x, a = Math.floor(y); tot += a; if (tot > 60) break; s += sg * Math.pow(2, -tot); sg = -sg; x = y - a; if (x < 1e-15) break; }
    return 2 * s;
  }
  function qmTerms(t) { var s = 0, sg = 1, tot = 0; for (var i = 0; i < t.length; i++) { tot += t[i]; if (tot > 1060) break; s += sg * Math.pow(2, -tot); sg = -sg; } return 2 * s; }
  function asFrac(v) { for (var q = 1; q <= 2000; q++) { var p = Math.round(v * q); if (Math.abs(v - p / q) < 1e-10) return p + '/' + q; } return null; }
  var mv = { lo: 0, hi: 1 }, mkHead = -1, mkPl = null;
  function drawMk() {
    var cv = $('mkCan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var L = 46, Rm = 10, T = 12, B = 26, pw = w - L - Rm, ph = H - T - B, y0 = qm(mv.lo), y1 = qm(mv.hi); if (y1 - y0 < 1e-15) y1 = y0 + 1e-15;
    var X = function (v) { return L + pw * (v - mv.lo) / (mv.hi - mv.lo); }, Y = function (v) { return T + ph * (1 - (v - y0) / (y1 - y0)); };
    x.strokeStyle = c('--rn-line'); x.strokeRect(L, T, pw, ph);
    x.save(); x.beginPath(); x.rect(L, T, pw, ph); x.clip();
    x.strokeStyle = c('--rn-muted'); x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X(mv.lo), Y(mv.lo)); x.lineTo(X(mv.hi), Y(mv.hi)); x.stroke(); x.setLineDash([]);
    x.strokeStyle = c('--rn-g'); x.lineWidth = 2; x.beginPath(); var N = Math.round(pw * 2);
    for (var i = 0; i <= N; i++) { var v = mv.lo + (mv.hi - mv.lo) * i / N, yy = Y(qm(v)); if (i) x.lineTo(X(v), yy); else x.moveTo(X(v), yy); } x.stroke(); x.lineWidth = 1;
    var al = RN.W.alpha % 1, qa = qm(al);
    if (al >= mv.lo && al <= mv.hi) { x.strokeStyle = c('--rn-prime'); x.setLineDash([3, 3]); x.beginPath(); x.moveTo(X(al), T + ph); x.lineTo(X(al), Y(qa)); x.lineTo(L, Y(qa)); x.stroke(); x.setLineDash([]); x.fillStyle = c('--rn-prime'); x.beginPath(); x.arc(X(al), Y(qa), 4.5, 0, 7); x.fill(); }
    if (mkHead >= 0) { var hv = mv.lo + (mv.hi - mv.lo) * (mkHead + 0.5) / 48; x.fillStyle = c('--rn-teal'); x.beginPath(); x.arc(X(hv), Y(qm(hv)), 6, 0, 7); x.fill(); }
    x.restore();
    x.font = F(10, 1); x.fillStyle = c('--rn-muted'); x.textBaseline = 'top'; x.textAlign = 'left'; x.fillText(fmt(mv.lo), L, T + ph + 6); x.textAlign = 'right'; x.fillText(fmt(mv.hi), L + pw, T + ph + 6);
    x.textAlign = 'center'; if (w > 420) x.fillText('x →', L + pw / 2, T + ph + 6);
    x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(fmt(y0), L - 4, T + ph - 6); x.fillText(fmt(y1), L - 4, T + 6);
    var t = RN.W.allTerms, val = RN.W.rational ? qa : qmTerms(t), fr = asFrac(val);
    $('mkVal').textContent = val.toPrecision(10) + (fr ? ' = ' + fr : '');
    if (RN.W.rational) { var b = '0.', vv = val; for (var k = 0; k < 40 && vv > 1e-15; k++) { vv *= 2; var d = Math.floor(vv); b += d; vv -= d; } $('mkBin').textContent = b; }
    else { var rr = [], pos = 0; t.slice(0, 10).forEach(function (n, j) { var m = j === 0 ? n - 1 : n; if (m > 0) rr.push((j % 2 ? '1' : '0') + (m > 1 ? sup(m) : '')); }); $('mkBin').textContent = '0.' + rr.join(' ') + ' …  (each term is one run)'; }
    function fmt(v) { var s = (mv.hi - mv.lo) < 1e-4 ? v.toPrecision(9) : v.toPrecision(5); return String(+s); }
  }
  function mkZoom(f, at) { var cx = at != null ? at : (mv.lo + mv.hi) / 2, hw = Math.min(0.5, Math.max(1e-9, (mv.hi - mv.lo) / 2 / f)); cx = Math.max(hw, Math.min(1 - hw, cx)); mv.lo = cx - hw; mv.hi = cx + hw; drawMk(); }
  RN.def('mink', {
    init: function () {
      $('mkIn').addEventListener('click', function () { mkZoom(4, RN.W.alpha % 1); });
      $('mkOut').addEventListener('click', function () { mkZoom(0.25); });
      $('mkHome').addEventListener('click', function () { mv.lo = 0; mv.hi = 1; drawMk(); });
      $('mkCan').addEventListener('keydown', function (e) { var k = e.key, hw = (mv.hi - mv.lo) / 2, cx = mv.lo + hw;
        if (k === '+' || k === '=') mkZoom(2, RN.W.alpha % 1); else if (k === '-' || k === '_') mkZoom(0.5); else if (k === 'ArrowLeft') mkZoom(1, cx - hw / 4); else if (k === 'ArrowRight') mkZoom(1, cx + hw / 4); else if (k === '0') $('mkHome').click(); else return; e.preventDefault(); });
      $('mkCan').addEventListener('click', function (e) { var b = this.getBoundingClientRect(), L = 46, pw = b.width - L - 10, v = mv.lo + (mv.hi - mv.lo) * (e.clientX - b.left - L) / pw; if (v >= 0 && v <= 1) mkZoom(2, v); });
      mkPl = sweep($('mink'), $('mkPlay'), 48, function (i) { var y0 = qm(mv.lo), y1 = qm(mv.hi); return (qm(mv.lo + (mv.hi - mv.lo) * (i + 0.5) / 48) - y0) / Math.max(1e-15, y1 - y0); }, function (i) { mkHead = i; drawMk(); });
      drawMk();
    },
    number: drawMk, redraw: drawMk
  });

  /* ---------- 28 the devil's staircase ---------- */
  var sv = { lo: 0, hi: 1 }, stHead = -1, stCache = null;
  function rot(Om, K, it) { var th = 0, k = K / (2 * Math.PI), i; for (i = 0; i < 100; i++) th = th + Om - k * Math.sin(2 * Math.PI * th); var s = th; for (i = 0; i < it; i++) th = th + Om - k * Math.sin(2 * Math.PI * th); return (th - s) / it; }
  function bestFrac(v, tol) { var t = [], x = v, h0 = 1, h1 = Math.floor(v), k0 = 0, k1 = 1; x = v - h1; for (var i = 0; i < 20 && Math.abs(v - h1 / k1) > tol; i++) { var y = 1 / x, a = Math.floor(y); x = y - a; var h2 = a * h1 + h0, k2 = a * k1 + k0; h0 = h1; h1 = h2; k0 = k1; k1 = k2; if (k1 > 5000) break; } return [h1, k1]; }
  function stairData(w) {
    var K = +$('stK').value / 100, N = Math.max(200, Math.round(w)), it = 600, rho = new Float64Array(N + 1);
    for (var i = 0; i <= N; i++) rho[i] = rot(sv.lo + (sv.hi - sv.lo) * i / N, K, it);
    /* flat runs = steps */
    var steps = [], i0 = 0;
    for (i = 1; i <= N + 1; i++) { if (i <= N && Math.abs(rho[i] - rho[i0]) < 2 / it) continue; if (i - i0 >= 3 && K > 0) { var f = bestFrac(rho[i0 + ((i - i0) >> 1)], 2 / it); steps.push({ a: i0, b: i - 1, p: f[0], q: f[1], wd: (sv.hi - sv.lo) * (i - 1 - i0) / N }); } i0 = i; }
    return { N: N, rho: rho, steps: steps, K: K };
  }
  function drawSt(useCache) {
    $('stKV').textContent = (+$('stK').value / 100).toFixed(2);
    var cv = $('stCan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var L = 46, Rm = 10, T = 12, B = 26, pw = w - L - Rm, ph = H - T - B, Dt = (useCache === true && stCache) ? stCache : (stCache = stairData(pw)), rho = Dt.rho, N = Dt.N;
    var y0 = rho[0], y1 = rho[N]; if (y1 - y0 < 1e-12) { y0 -= 1e-6; y1 += 1e-6; }
    var X = function (i) { return L + pw * i / N; }, Y = function (v) { return T + ph * (1 - (v - y0) / (y1 - y0)); };
    x.strokeStyle = c('--rn-line'); x.strokeRect(L, T, pw, ph);
    Dt.steps.forEach(function (s) { x.fillStyle = c('--rn-g'); x.globalAlpha = Math.max(0.08, 0.32 - s.q * 0.012); x.fillRect(X(s.a), T, Math.max(1, X(s.b) - X(s.a)), ph); x.globalAlpha = 1; });
    x.strokeStyle = c('--rn-ink'); x.lineWidth = 1.6; x.beginPath(); for (var i = 0; i <= N; i++) { if (i) x.lineTo(X(i), Y(rho[i])); else x.moveTo(X(i), Y(rho[i])); } x.stroke(); x.lineWidth = 1;
    x.font = F(10, 1); x.textAlign = 'center'; x.textBaseline = 'bottom'; x.fillStyle = c('--rn-g');
    var lab = Dt.steps.filter(function (s) { return X(s.b) - X(s.a) >= 16; }).sort(function (a, b) { return b.wd - a.wd; }).slice(0, 14);
    lab.forEach(function (s) { var yy = Y(rho[s.a]); x.fillText(s.p + '/' + s.q, (X(s.a) + X(s.b)) / 2, Math.max(T + 12, yy - 4)); });
    var al = RN.W.alpha % 1; if (al >= sv.lo && al <= sv.hi) { var ia = Math.round((al - sv.lo) / (sv.hi - sv.lo) * N); x.fillStyle = c('--rn-prime'); x.beginPath(); x.arc(X(ia), Y(rho[ia]), 4.5, 0, 7); x.fill(); }
    if (stHead >= 0) { var ih = Math.round((stHead + 0.5) / 48 * N); x.fillStyle = c('--rn-teal'); x.beginPath(); x.arc(X(ih), Y(rho[ih]), 6, 0, 7); x.fill(); }
    x.fillStyle = c('--rn-muted'); x.textBaseline = 'top'; x.textAlign = 'left'; x.fillText(f6(sv.lo), L, T + ph + 6); x.textAlign = 'right'; x.fillText(f6(sv.hi), L + pw, T + ph + 6); x.textAlign = 'center'; if (w > 420) x.fillText('natural rotation Ω →', L + pw / 2, T + ph + 6);
    x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(f6(y0), L - 4, T + ph - 6); x.fillText(f6(y1), L - 4, T + 6);
    $('stView').textContent = 'Ω from ' + f6(sv.lo) + ' to ' + f6(sv.hi) + (sv.hi - sv.lo < 1 ? ' (zoom ×' + Math.round(1 / (sv.hi - sv.lo)).toLocaleString('en-US') + ')' : '');
    var top3 = Dt.steps.slice().sort(function (a, b) { return b.wd - a.wd; }).slice(0, 3);
    $('stInfo').textContent = Dt.K === 0 ? 'none: with no coupling nothing locks' : top3.map(function (s) { return s.p + '/' + s.q + ' (≈' + s.wd.toPrecision(2) + ' wide)'; }).join(', ') || 'none wide enough to see';
    function f6(v) { return String(+v.toPrecision(sv.hi - sv.lo < 1e-3 ? 8 : 4)); }
  }
  function stZoom(f, at) { var cx = at != null ? at : (sv.lo + sv.hi) / 2, hw = Math.min(0.5, Math.max(1e-7, (sv.hi - sv.lo) / 2 / f)); cx = Math.max(hw, Math.min(1 - hw, cx)); sv.lo = cx - hw; sv.hi = cx + hw; drawSt(); }
  RN.def('stair', {
    init: function () {
      $('stK').addEventListener('input', drawSt);
      $('stOut').addEventListener('click', function () { stZoom(0.25); });
      $('stHome').addEventListener('click', function () { sv.lo = 0; sv.hi = 1; drawSt(); });
      var cv = $('stCan');
      cv.addEventListener('click', function (e) { var b = cv.getBoundingClientRect(), L = 46, pw = b.width - L - 10, v = sv.lo + (sv.hi - sv.lo) * (e.clientX - b.left - L) / pw; if (v >= 0 && v <= 1) stZoom(4, v); });
      cv.addEventListener('keydown', function (e) { var k = e.key, hw = (sv.hi - sv.lo) / 2, cx = sv.lo + hw;
        if (k === '+' || k === '=') stZoom(4); else if (k === '-' || k === '_') stZoom(0.25); else if (k === 'ArrowLeft') stZoom(1, cx - hw / 4); else if (k === 'ArrowRight') stZoom(1, cx + hw / 4); else if (k === '0') $('stHome').click(); else return; e.preventDefault(); });
      sweep($('stair'), $('stPlay'), 48, function (i) { if (!stCache) return null; var N = stCache.N, rho = stCache.rho, y0 = rho[0], y1 = rho[N]; return (rho[Math.round((i + 0.5) / 48 * N)] - y0) / Math.max(1e-12, y1 - y0); }, function (i) { stHead = i; drawSt(true); });
      drawSt();
    },
    number: function () { drawSt(true); }, redraw: drawSt
  });
})(window.RN);
