/* Econometrics, Chapter 2: Probability and Distributions. Four interactives:
   1. The distribution lab: seven distributions, their mean and spread, a shaded probability you drag, and draws
      that pile up into a live histogram.
   2. The central limit theorem: means of samples from a lopsided population pile up into a bell.
   3. The law of large numbers: a running average of die rolls settles on 3.5.
   4. Conditional expectation: average wage at each level of schooling, E[wage | education].
   Models in model.js (EC2Model); numbers from EconStats. */
(function () {
  'use strict';
  var L = window.TRBLab, ES = window.EconStats, MOD = window.EC2Model, root = document.getElementById('ec2-lab');
  if (!L || !ES || !MOD || !root) return;
  function $(id) { return document.getElementById(id); }
  var M = Math, fmt = ES.fmt, reduced = L.reduced;
  var C = { bg: '#06111a', bg2: '#0b1b27', grid: 'rgba(120,170,200,.13)', axis: 'rgba(143,179,198,.55)', text: '#8fb3c6', ink: '#dbe7ef', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function num(v) { return (+v).toLocaleString('en-US', { maximumFractionDigits: 6 }); }
  function nfmt(v) { var a = M.abs(v); return a >= 100 ? fmt(v, 0) : a >= 10 ? fmt(v, 1) : a >= 1 ? fmt(v, 2) : fmt(v, 3); }
  function frame(x0, y0, w, h, xlo, xhi, ylo, yhi) {
    return { x0: x0, y0: y0, w: w, h: h, xlo: xlo, xhi: xhi, ylo: ylo, yhi: yhi,
      X: function (v) { return x0 + (v - xlo) / (xhi - xlo) * w; }, Y: function (v) { return y0 + h - (v - ylo) / (yhi - ylo) * h; },
      iX: function (p) { return xlo + (p - x0) / w * (xhi - xlo); } };
  }
  function xaxis(c, F, o) {
    o = o || {}; var nt = ES.niceTicks(F.xlo, F.xhi, o.n || 7), t = nt.ticks, dec = M.max(0, -M.floor(M.log10(nt.step) + 1e-9));
    c.save(); c.font = '11px system-ui,sans-serif'; c.fillStyle = C.text; c.textAlign = 'center'; c.textBaseline = 'top';
    t.forEach(function (v) { if (v < F.xlo - 1e-9 || v > F.xhi + 1e-9) return; var x = M.round(F.X(v)) + 0.5; c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, F.y0); c.lineTo(x, F.y0 + F.h); c.stroke(); c.fillText(o.f ? o.f(v) : fmt(v, dec), x, F.y0 + F.h + 4); });
    c.strokeStyle = C.axis; c.beginPath(); c.moveTo(F.x0, F.y0 + F.h + 0.5); c.lineTo(F.x0 + F.w, F.y0 + F.h + 0.5); c.stroke();
    if (o.label) { c.font = '600 11px system-ui,sans-serif'; c.fillStyle = C.ink; c.textAlign = 'right'; c.fillText(o.label, F.x0 + F.w, F.y0 + F.h + 18); }
    c.restore();
  }
  function seg(el, attr, cur, fn) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); fn(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }
  function celebrate(el) { if (reduced || !el) return; el.classList.remove('ec2-win'); void el.offsetWidth; el.classList.add('ec2-win'); setTimeout(function () { el.classList.remove('ec2-win'); }, 1300); }
  function bringIntoView(el) { if (!el) return; var r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > (window.innerHeight || 800)) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
  var SLUG = 'econ-probability';

  /* =========================================================================================
     1. The distribution lab
     ========================================================================================= */
  var view = $('ec2-view'), cv = $('ec2-cv'), G = L.canvas(cv), c = G.c, hud = $('ec2-hud'), readEl = $('ec2-read'), pbox = $('ec2-params');
  var rng = ES.rng(2026);
  var S = { key: 'normal', p: {}, d: null, xs: [], sum: 0, sum2: 0, maxAbs: 0, a: -1, b: 1, overlay: false, stream: false, balls: [], bins: null, binW: 1, binLo: 0, kept: 0 };
  var MAXKEEP = 60000;
  function defaults(key) { var o = {}; MOD.DISTS[key].params.forEach(function (q) { o[q.k] = q.def; }); return o; }
  function pfmt(q, v) { return q.step >= 1 ? String(v) : fmt(v, q.step < 0.1 ? 2 : 1); }
  function buildParams() {
    var D = MOD.DISTS[S.key];
    pbox.innerHTML = D.params.map(function (q) {
      return '<div class="lab-field"><span><label for="ec2-p-' + q.k + '">' + q.label + '</label><output id="ec2-p-' + q.k + '-o" for="ec2-p-' + q.k + '">' + pfmt(q, S.p[q.k]) + '</output></span><input type="range" id="ec2-p-' + q.k + '" min="' + q.min + '" max="' + q.max + '" step="' + q.step + '" value="' + S.p[q.k] + '"></div>';
    }).join('');
    D.params.forEach(function (q) {
      var el = $('ec2-p-' + q.k), out = $('ec2-p-' + q.k + '-o');
      el.addEventListener('input', function () { S.p[q.k] = +el.value; out.textContent = pfmt(q, S.p[q.k]); remake(true); });
    });
  }
  function sd() { return M.sqrt(S.d.variance); }
  function remake(keepShade) {
    var D = MOD.DISTS[S.key]; S.d = D.make(S.p); clearDraws();
    var lo = S.d.lo, hi = S.d.hi;
    if (D.discrete) { S.binLo = M.ceil(lo); S.binW = 1; S.bins = new Array(M.max(1, M.floor(hi) - S.binLo + 1)).fill(0); }
    else { S.binLo = lo; S.binW = (hi - lo) / 48; S.bins = new Array(48).fill(0); }
    if (!keepShade) shadePreset('1');
    else { S.a = clamp(S.a, lo, hi); S.b = clamp(S.b, lo, hi); }
    syncShade(); update();
  }
  function clearDraws() { S.xs = []; S.sum = 0; S.sum2 = 0; S.maxAbs = 0; S.balls = []; S.kept = 0; if (S.bins) S.bins.fill(0); S.n = 0; S.zeros = 0; S.out = 0; }
  function addDraw(x, ball) {
    S.n = (S.n || 0) + 1; S.sum += x; S.sum2 += x * x; if (M.abs(x) > S.maxAbs) S.maxAbs = M.abs(x); if (x === 0) S.zeros++;
    if (S.xs.length < MAXKEEP) S.xs.push(x);
    var b = MOD.DISTS[S.key].discrete ? M.round(x) - S.binLo : M.floor((x - S.binLo) / S.binW);
    if (b >= 0 && b < S.bins.length) S.bins[b]++; else S.out++;
    if (ball && !reduced && S.balls.length < 80) S.balls.push({ x: x, y: -0.05 * (S.balls.length % 20), v: 0, life: 1 });
  }
  function draw1(k, balls) { for (var i = 0; i < k; i++) addDraw(S.d.sample(rng), balls && i < 30); update(); }
  function shadePreset(w) {
    var m = S.d.mean, s = sd(), lo = S.d.lo, hi = S.d.hi, fin = isFinite(m) && isFinite(s);
    if (!fin) { m = 0; s = 1; }
    if (w === 'tail') { S.a = clamp(m + 2 * s, lo, hi); S.b = hi; }
    else { var z = +w; S.a = clamp(m - z * s, lo, hi); S.b = clamp(m + z * s, lo, hi); }
    syncShade();
  }
  var aEl = $('ec2-a'), bEl = $('ec2-b');
  function syncShade() {
    [aEl, bEl].forEach(function (el) { el.min = S.d.lo; el.max = S.d.hi; el.step = (S.d.hi - S.d.lo) / 400; });
    aEl.value = S.a; bEl.value = S.b; $('ec2-a-o').textContent = nfmt(S.a); $('ec2-b-o').textContent = S.b >= S.d.hi - 1e-9 ? nfmt(S.b) + ' (end)' : nfmt(S.b);
  }
  aEl.addEventListener('input', function () { S.touched = true; S.a = +aEl.value; if (S.a > S.b) S.b = S.a; syncShade(); update(); markShade(null); });
  bEl.addEventListener('input', function () { S.touched = true; S.b = +bEl.value; if (S.b < S.a) S.a = S.b; syncShade(); update(); markShade(null); });
  var markShade = seg($('ec2-shade'), 'data-z', '1', function (z) { S.touched = true; shadePreset(z); update(); });
  var markDist = seg($('ec2-dist'), 'data-d', 'normal', function (k) { setDist(k); });
  function setDist(k, p) { S.key = k; markDist(k); S.p = p || defaults(k); buildParams(); remake(false); markShade('1'); }
  $('ec2-ov').addEventListener('change', function (e) { S.overlay = e.target.checked; update(); });
  $('ec2-d1').addEventListener('click', function () { draw1(1, true); });
  $('ec2-d100').addEventListener('click', function () { draw1(100, true); });
  $('ec2-d1000').addEventListener('click', function () { draw1(1000, true); });
  $('ec2-clear').addEventListener('click', function () { clearDraws(); update(); });
  $('ec2-reset').addEventListener('click', function () { clearDraws(); update(); });
  var streamBtn = $('ec2-stream');
  function setStream(on) { S.stream = on; streamBtn.textContent = on ? '❚❚' : '▶'; streamBtn.setAttribute('aria-label', on ? 'Stop drawing' : 'Keep drawing'); streamBtn.setAttribute('aria-pressed', String(on)); }
  streamBtn.addEventListener('click', function () { setStream(!S.stream); });

  function pAB() { return MOD.prob(S.d, MOD.DISTS[S.key].discrete, S.a, S.b); }
  function sampleShare() {
    if (!S.xs.length) return NaN; var k = 0, disc = MOD.DISTS[S.key].discrete, a = disc ? M.ceil(S.a - 1e-9) : S.a, b = disc ? M.floor(S.b + 1e-9) : S.b;
    for (var i = 0; i < S.xs.length; i++) if (S.xs[i] >= a && S.xs[i] <= b) k++;
    return k / S.xs.length;
  }
  function sMean() { return S.n ? S.sum / S.n : NaN; }
  function sVar() { return S.n > 1 ? (S.sum2 - S.sum * S.sum / S.n) / (S.n - 1) : NaN; }
  function update() {
    var d = S.d, D = MOD.DISTS[S.key], rows = [], p = pAB(), sh = sampleShare();
    rows.push(['Mean μ', isFinite(d.mean) ? nfmt(d.mean) : 'undefined']);
    rows.push(['Variance σ²', isFinite(d.variance) ? nfmt(d.variance) : 'infinite']);
    rows.push(['Standard deviation σ', isFinite(d.variance) ? nfmt(M.sqrt(d.variance)) : 'infinite']);
    rows.push(['Draws so far', S.n ? num(S.n) : '0']);
    rows.push(['Sample mean x̄', S.n ? nfmt(sMean()) : '—']);
    rows.push(['Sample variance s²', S.n > 1 ? nfmt(sVar()) : '—']);
    rows.push(['P(' + nfmt(D.discrete ? M.ceil(S.a - 1e-9) : S.a) + ' ≤ X ≤ ' + nfmt(D.discrete ? M.floor(S.b + 1e-9) : S.b) + ')', fmt(p, 4)]);
    rows.push(['Share of draws there', isFinite(sh) ? fmt(sh, 4) : '—']);
    dl(readEl, rows);
    hud.innerHTML = '<b>' + D.name + '</b> · P(shaded) = <b>' + fmt(p, 4) + '</b>' + (S.n ? '<br>' + num(S.n) + ' draws · ' + (isFinite(sh) ? fmt(100 * sh, 1) + '% landed in the shade' : '') : '');
    draw(); check();
  }
  var LAY = {};
  function draw() {
    G.fit(); var W = G.w, H = G.h, d = S.d, D = MOD.DISTS[S.key]; c.clearRect(0, 0, W, H); c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
    var small = W < 560, F0 = { x0: small ? 14 : 24, y0: small ? 112 : 100, w: W - (small ? 28 : 48), h: H - (small ? 112 : 100) - 64 };
    // vertical scale: the density's peak and the histogram's
    var lo = d.lo, hi = d.hi, n = S.n || 0, ymax = 0, i, x;
    if (D.discrete) { for (var k = M.ceil(lo); k <= hi; k++) ymax = M.max(ymax, d.pdf(k)); }
    else { for (i = 0; i <= 400; i++) { x = lo + (hi - lo) * i / 400; var v = d.pdf(x); if (isFinite(v)) ymax = M.max(ymax, v); } }
    var hd = function (j) { return n ? S.bins[j] / n / (D.discrete ? 1 : S.binW) : 0; };
    if (n > 20) for (i = 0; i < S.bins.length; i++) ymax = M.max(ymax, hd(i));
    ymax = M.min(ymax, D.discrete ? 1 : 4) * 1.18 || 1;
    if (S.key === 'chi2' && S.p.k <= 2) ymax = M.min(ymax, 0.9);
    var F = frame(F0.x0, F0.y0, F0.w, F0.h, lo, hi, 0, ymax); LAY.F = F;
    xaxis(c, F, { label: 'X' });
    // shaded probability
    var a = S.a, b = S.b;
    c.fillStyle = 'rgba(99,230,190,.22)';
    if (D.discrete) { for (k = M.ceil(a - 1e-9); k <= M.floor(b + 1e-9); k++) { var hk = d.pdf(k); c.fillRect(F.X(k - 0.42), F.Y(hk), F.X(k + 0.42) - F.X(k - 0.42), F.Y(0) - F.Y(hk)); } }
    else { c.beginPath(); c.moveTo(F.X(a), F.Y(0)); for (i = 0; i <= 160; i++) { x = a + (b - a) * i / 160; c.lineTo(F.X(x), F.Y(M.min(ymax, d.pdf(x)))); } c.lineTo(F.X(b), F.Y(0)); c.closePath(); c.fill(); }
    // histogram of draws
    if (n) {
      c.fillStyle = 'rgba(116,192,252,.42)'; c.strokeStyle = 'rgba(116,192,252,.85)'; c.lineWidth = 1;
      for (i = 0; i < S.bins.length; i++) {
        if (!S.bins[i]) continue; var h = M.min(ymax, hd(i)), xa = D.discrete ? F.X(S.binLo + i - 0.28) : F.X(S.binLo + i * S.binW), xb = D.discrete ? F.X(S.binLo + i + 0.28) : F.X(S.binLo + (i + 1) * S.binW);
        c.fillRect(xa, F.Y(h), xb - xa - (D.discrete ? 0 : 1), F.Y(0) - F.Y(h)); c.strokeRect(xa + 0.5, F.Y(h) + 0.5, xb - xa - (D.discrete ? 1 : 2), F.Y(0) - F.Y(h) - 1);
      }
    }
    // the distribution itself
    c.strokeStyle = C.green; c.lineWidth = 2.5;
    if (D.discrete) { for (k = M.ceil(lo); k <= hi; k++) { var q = d.pdf(k); if (q < 1e-5) continue; c.strokeRect(F.X(k - 0.42), F.Y(q), F.X(k + 0.42) - F.X(k - 0.42), F.Y(0) - F.Y(q)); } }
    else { c.beginPath(); var first = true; for (i = 0; i <= 500; i++) { x = lo + (hi - lo) * i / 500; var y = d.pdf(x); if (!isFinite(y)) continue; y = M.min(y, ymax * 1.05); if (first) { c.moveTo(F.X(x), F.Y(y)); first = false; } else c.lineTo(F.X(x), F.Y(y)); } c.stroke(); }
    // normal with the same mean and sd
    if (S.overlay && isFinite(d.mean) && isFinite(d.variance)) {
      var s0 = M.sqrt(d.variance); c.strokeStyle = C.pink; c.lineWidth = 2; c.setLineDash([7, 5]); c.beginPath();
      for (i = 0; i <= 300; i++) { x = lo + (hi - lo) * i / 300; var z = (x - d.mean) / s0, yy = M.exp(-0.5 * z * z) / (s0 * M.sqrt(2 * M.PI)); if (i) c.lineTo(F.X(x), F.Y(M.min(yy, ymax))); else c.moveTo(F.X(x), F.Y(M.min(yy, ymax))); }
      c.stroke(); c.setLineDash([]);
    }
    // mean and ±1 sd
    if (isFinite(d.mean)) {
      var mx = F.X(d.mean); c.strokeStyle = C.gold; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(mx, F.y0 - 6); c.lineTo(mx, F.y0 + F.h); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.gold; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('mean ' + nfmt(d.mean), clamp(mx, F.x0 + 40, F.x0 + F.w - 40), F.y0 - 20);
      if (isFinite(d.variance)) {
        var s1 = M.sqrt(d.variance), yb = F.y0 - 11, x1 = F.X(M.max(lo, d.mean - s1)), x2 = F.X(M.min(hi, d.mean + s1));
        c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x1, yb - 4); c.lineTo(x1, yb + 4); c.moveTo(x1, yb); c.lineTo(x2, yb); c.moveTo(x2, yb - 4); c.lineTo(x2, yb + 4); c.stroke();
        c.font = '10px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('±1 sd', M.min(x2 + 5, F.x0 + F.w - 30), yb);
      }
    }
    // shading handles
    [['a', a, C.green], ['b', b, C.green]].forEach(function (hdl) {
      var hx = F.X(hdl[1]); c.strokeStyle = 'rgba(99,230,190,.9)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx, F.y0); c.lineTo(hx, F.y0 + F.h + 22); c.stroke();
      c.fillStyle = C.bg; c.strokeStyle = C.green; c.lineWidth = 2; c.beginPath(); c.arc(hx, F.y0 + F.h + 30, 9, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = C.green; c.font = '700 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(hdl[0], hx, F.y0 + F.h + 30);
    });
    LAY.hy = F.y0 + F.h + 30;
    // falling balls
    S.balls.forEach(function (bl) { if (bl.y < 0) return; c.fillStyle = 'rgba(255,212,121,' + (0.35 + 0.65 * bl.life) + ')'; c.beginPath(); c.arc(F.X(clamp(bl.x, lo, hi)), F0.y0 + bl.y * F.h, 3.5, 0, 6.2832); c.fill(); });
    if (S.out) { c.fillStyle = C.text; c.font = '10px system-ui,sans-serif'; c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText(num(S.out) + ' draw' + (S.out > 1 ? 's' : '') + ' off the chart', F.x0 + F.w, F.y0 + F.h + 46); }
  }

  // dragging the handles
  var drag = null;
  function px(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
  cv.addEventListener('pointerdown', function (ev) {
    var p = px(ev), F = LAY.F; if (!F) return;
    var da = M.abs(p.x - F.X(S.a)), db = M.abs(p.x - F.X(S.b));
    if (p.y > F.y0 + F.h - 10 || M.min(da, db) < 16) { drag = da <= db ? 'a' : 'b'; if (da === db) drag = p.x < F.X(S.a) ? 'a' : 'b'; cv.setPointerCapture(ev.pointerId); move(p); }
  });
  cv.addEventListener('pointermove', function (ev) { var p = px(ev); if (drag) move(p); else if (LAY.F) cv.style.cursor = M.min(M.abs(p.x - LAY.F.X(S.a)), M.abs(p.x - LAY.F.X(S.b))) < 16 || p.y > LAY.F.y0 + LAY.F.h ? 'ew-resize' : 'default'; });
  cv.addEventListener('pointerup', function () { drag = null; });
  function move(p) {
    var v = clamp(LAY.F.iX(p.x), S.d.lo, S.d.hi); if (MOD.DISTS[S.key].discrete) v = M.round(v * 2) / 2;
    S.touched = true; if (drag === 'a') { S.a = M.min(v, S.b); } else { S.b = M.max(v, S.a); }
    markShade(null); syncShade(); update();
  }
  cv.addEventListener('keydown', function (e) {
    var step = (S.d.hi - S.d.lo) / 100;
    if (e.key === ' ') { e.preventDefault(); setStream(!S.stream); }
    else if (e.key === 'Enter') { draw1(1, true); }
    else if (e.key === 'c' || e.key === 'C') { clearDraws(); update(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); S.touched = true; var dv = e.key === 'ArrowRight' ? step : -step; if (e.shiftKey) S.b = clamp(S.b + dv, S.a, S.d.hi); else S.a = clamp(S.a + dv, S.d.lo, S.b); markShade(null); syncShade(); update(); }
  });

  // missions
  var MIS = [
    { id: 'bell', title: 'Fill the bell', goal: 'Normal distribution: draw at least 1,000 times. The histogram matches the curve: sample mean within 0.05σ of μ and sample sd within 5% of σ.' },
    { id: 'one', title: 'One sd each way', goal: 'Normal: shade from one standard deviation below the mean to one above. About 68% of the probability sits there.' },
    { id: 'n95', title: 'The 95% band', goal: 'Normal: drag the handles to shade a band centered on the mean holding 95% (between 94.5% and 95.5%). How many sd wide is it?' },
    { id: 'rare', title: 'Count rare events', goal: 'Poisson with λ of 1 or less: after 500 draws, the share of zeros is within 0.03 of e^−λ.' },
    { id: 'coins', title: 'A bell made of coin flips', goal: 'Binomial with n ≥ 40 and p between 0.3 and 0.7, the normal curve switched on, and 1,000 draws.' },
    { id: 'tails', title: 'Fat tails', goal: 'Student’s t with ν of 3 or less: keep drawing until one draw lands beyond ±6. For a normal, that is a one-in-500-million event.' },
    { id: 'tnorm', title: 't turns normal', goal: 'Student’s t with ν ≥ 30 and the normal curve switched on. Can you still tell them apart?' },
    { id: 'chi', title: 'Mean k, variance 2k', goal: 'Chi-square with k ≥ 4: draw 2,000 times. The sample mean is within 5% of k and the sample variance within 10% of 2k.' }
  ];
  var mis = L.missions($('ec2-missions'), SLUG, MIS, function (id) {
    bringIntoView(view);
    var to = { bell: 'normal', one: 'normal', n95: 'normal', rare: 'poisson', coins: 'binomial', tails: 't', tnorm: 't', chi: 'chi2' }[id];
    var pp = { rare: { lam: 0.8 }, coins: { n: 50, p: 0.5 }, tails: { df: 2 }, tnorm: { df: 30 }, chi: { k: 6 } }[id];
    setDist(to, pp);
    if (id === 'coins' || id === 'tnorm') { S.overlay = true; $('ec2-ov').checked = true; update(); }
  });
  function win(id, text) { if (mis.done(id)) { L.toast(view, '✓ ' + text); celebrate(view); } }
  function check() {
    var d = S.d, k = S.key, p = pAB();
    if (k === 'normal') {
      var s0 = M.sqrt(d.variance), centered = M.abs((S.a + S.b) / 2 - d.mean) < 0.1 * s0;
      if (S.n >= 1000 && M.abs(sMean() - d.mean) < 0.05 * s0 && M.abs(M.sqrt(sVar()) / s0 - 1) < 0.05) win('bell', 'Sample mean ' + nfmt(sMean()) + ', sd ' + nfmt(M.sqrt(sVar())) + '. The draws found the curve.');
      if (S.touched && centered && p > 0.675 && p < 0.69) win('one', fmt(100 * p, 1) + '% within one sd of the mean.');
      if (S.touched && centered && p >= 0.945 && p <= 0.955) win('n95', '95% lies within ±' + fmt((S.b - S.a) / 2 / s0, 2) + ' sd. The famous 1.96.');
    }
    if (k === 'poisson' && S.p.lam <= 1 && S.n >= 500 && M.abs(S.zeros / S.n - M.exp(-S.p.lam)) < 0.03) win('rare', fmt(100 * S.zeros / S.n, 1) + '% zeros; e^−λ = ' + fmt(100 * M.exp(-S.p.lam), 1) + '%.');
    if (k === 'binomial' && S.p.n >= 40 && S.p.p >= 0.3 && S.p.p <= 0.7 && S.overlay && S.n >= 1000) win('coins', 'Counts of successes, shaped like a bell. De Moivre saw this in 1733.');
    if (k === 't' && S.p.df <= 3 && S.maxAbs > 6) win('tails', 'A draw at ' + nfmt(S.maxAbs) + ' from the center. Fat tails at work.');
    if (k === 't' && S.p.df >= 30 && S.overlay) win('tnorm', 'With ν = ' + S.p.df + ', t and normal differ by less than 0.005 anywhere.');
    if (k === 'chi2' && S.p.k >= 4 && S.n >= 2000 && M.abs(sMean() / S.p.k - 1) < 0.05 && M.abs(sVar() / (2 * S.p.k) - 1) < 0.1) win('chi', 'Mean ' + nfmt(sMean()) + ' (k = ' + S.p.k + '), variance ' + nfmt(sVar()) + ' (2k = ' + 2 * S.p.k + ').');
  }

  var acc = 0;
  L.loop(function (dt) {
    var busy = false;
    if (S.stream) { acc += dt * (reduced ? 400 : 150); var k = M.floor(acc); if (k > 0) { acc -= k; for (var i = 0; i < k; i++) addDraw(S.d.sample(rng), i % 3 === 0); update(); } busy = true; }
    if (S.balls.length) {
      S.balls.forEach(function (b) { b.v += 3.2 * dt; b.y += b.v * dt; if (b.y >= 1) { b.y = 1; b.life -= dt * 4; } });
      S.balls = S.balls.filter(function (b) { return b.life > 0; }); busy = true;
    }
    if (busy && !S.stream) draw();
  }, view);
  window.addEventListener('resize', function () { G.fit(); draw(); });
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);
  setDist('normal'); setStream(false); draw1(250, false);

  /* =========================================================================================
     2. The central limit theorem
     ========================================================================================= */
  (function () {
    var v2 = $('ec2c-view'), cv2 = $('ec2c-cv'); if (!v2 || !cv2) return;
    var G2 = L.canvas(cv2), c2 = G2.c, read2 = $('ec2c-read'), r2 = ES.rng(31);
    var T = { pop: 'expo', n: 5, means: [], cur: [], curMean: NaN, zoom: false, curve: true, run: false, drops: [], acc: 0 };
    var markPop = seg($('ec2c-pop'), 'data-p', T.pop, function (p) { T.pop = p; T.means = []; T.cur = []; T.curMean = NaN; up(); });
    var markN = seg($('ec2c-n'), 'data-n', T.n, function (n) { T.n = +n; T.means = []; T.cur = []; T.curMean = NaN; up(); });
    $('ec2c-one').addEventListener('click', function () { sample(true); up(); });
    $('ec2c-k').addEventListener('click', function () { for (var i = 0; i < 1000; i++) sample(false); up(); });
    $('ec2c-clear').addEventListener('click', function () { T.means = []; T.cur = []; T.curMean = NaN; up(); });
    var runBtn = $('ec2c-run');
    function setRun(on) { T.run = on; runBtn.textContent = on ? '❚❚ Pause' : '▶ Run'; runBtn.setAttribute('aria-pressed', String(on)); }
    runBtn.addEventListener('click', function () { setRun(!T.run); });
    $('ec2c-zoom').addEventListener('change', function (e) { T.zoom = e.target.checked; draw2(); });
    $('ec2c-curve').addEventListener('change', function (e) { T.curve = e.target.checked; draw2(); });
    function sample(anim) {
      var P = MOD.POPS[T.pop], xs = [], s = 0; for (var i = 0; i < T.n; i++) { var x = P.sample(r2); xs.push(x); s += x; }
      T.cur = xs; T.curMean = s / T.n; T.means.push(T.curMean);
      if (anim && !reduced) T.drops.push({ x: T.curMean, t: 0 });
    }
    var MIS2 = [
      { id: 'self', title: 'n = 1 is the population', goal: 'With samples of size 1, collect 500 means. The pile looks just like the population, lopsided and all.' },
      { id: 'bell', title: 'A bell from a lopsided population', goal: 'Pick waiting times or incomes, samples of 30 or more, and collect 1,000 means. Their skewness falls below a quarter of the population’s.' },
      { id: 'root', title: 'The √n rule', goal: 'With n of 10 or more and 1,000 means, the spread of the means is within 5% of σ/√n.' },
      { id: 'humps', title: 'Three humps from two', goal: 'Pick “Two humps” and samples of size 2. Collect 1,000 means. Where do the humps come from?' },
      { id: 'poll', title: 'A poll is a mean', goal: 'Pick “Yes or no” and samples of 100 people. Collect 1,000 polls. How far does a poll usually miss the true 10%?' }
    ];
    var mis2 = L.missions($('ec2c-missions'), SLUG + '-clt', MIS2, function (id) {
    bringIntoView(v2);
      var set = { self: ['expo', 1], bell: ['logn', 30], root: ['expo', 10], humps: ['bimodal', 2], poll: ['bern', 100] }[id];
      T.pop = set[0]; T.n = set[1]; markPop(T.pop); markN(T.n); T.means = []; T.cur = []; T.curMean = NaN; up();
    });
    function win2(id, text) { if (mis2.done(id)) { L.toast(v2, '✓ ' + text); celebrate(v2); } }
    function up() {
      var P = MOD.POPS[T.pop], k = T.means.length, rows = [], se = P.sd / M.sqrt(T.n);
      var mm = k ? ES.mean(T.means) : NaN, sdm = k > 1 ? ES.sd(T.means) : NaN, sk = k > 2 ? MOD.skewness(T.means) : NaN;
      rows.push(['Population mean μ, sd σ', nfmt(P.mean) + ', ' + nfmt(P.sd)]);
      rows.push(['Means collected', num(k)]);
      rows.push(['Average of the means', k ? nfmt(mm) : '—']);
      rows.push(['Spread (sd) of the means', k > 1 ? nfmt(sdm) : '—']);
      rows.push(['σ/√n predicts', nfmt(se)]);
      rows.push(['Skewness: population → means', fmt(P.skew, 2) + ' → ' + (k > 2 ? fmt(sk, 2) : '—')]);
      dl(read2, rows);
      if (T.n === 1 && k >= 500) win2('self', 'With n = 1 a “mean” is one draw: skewness ' + fmt(sk, 2) + ', like the population’s ' + fmt(P.skew, 2) + '.');
      if ((T.pop === 'expo' || T.pop === 'logn') && T.n >= 30 && k >= 1000 && M.abs(sk) < P.skew / 4) win2('bell', 'Skewness ' + fmt(P.skew, 2) + ' in the population, ' + fmt(sk, 2) + ' in the means.');
      if (T.n >= 10 && k >= 1000 && M.abs(sdm / se - 1) < 0.05) win2('root', 'Spread ' + nfmt(sdm) + ' vs σ/√n = ' + nfmt(se) + '.');
      if (T.pop === 'bimodal' && T.n === 2 && k >= 1000) win2('humps', 'Both left, both right, or one of each (twice as likely): three humps.');
      if (T.pop === 'bern' && T.n === 100 && k >= 1000) win2('poll', 'Polls of 100 miss by about ' + fmt(100 * sdm, 1) + ' points (σ/√n = 3.0).');
      draw2();
    }
    function draw2() {
      G2.fit(); var W = G2.w, H = G2.h, P = MOD.POPS[T.pop], small = W < 560; c2.clearRect(0, 0, W, H); c2.fillStyle = C.bg; c2.fillRect(0, 0, W, H);
      var x0 = small ? 14 : 24, ww = W - 2 * x0, h1 = M.round(H * 0.3), lo = P.lo, hi = P.hi;
      // population
      var ymax = 0, i, x;
      if (P.discrete) { for (i = M.ceil(lo); i <= hi; i++) ymax = M.max(ymax, P.pdf(i)); } else for (i = 0; i <= 300; i++) ymax = M.max(ymax, P.pdf(lo + (hi - lo) * i / 300));
      var F1 = frame(x0, 30, ww, h1 - 30, lo, hi, 0, ymax * 1.15);
      c2.fillStyle = C.ink; c2.font = '600 12px system-ui,sans-serif'; c2.textAlign = 'left'; c2.textBaseline = 'top'; c2.fillText('The population: ' + P.name, x0, 8);
      c2.fillStyle = 'rgba(116,192,252,.25)'; c2.strokeStyle = C.blue; c2.lineWidth = 2;
      if (P.discrete) { for (i = M.ceil(lo); i <= hi; i++) { var q = P.pdf(i); c2.fillRect(F1.X(i - 0.3), F1.Y(q), F1.X(i + 0.3) - F1.X(i - 0.3), F1.Y(0) - F1.Y(q)); c2.strokeRect(F1.X(i - 0.3), F1.Y(q), F1.X(i + 0.3) - F1.X(i - 0.3), F1.Y(0) - F1.Y(q)); } }
      else { c2.beginPath(); c2.moveTo(F1.X(lo), F1.Y(0)); for (i = 0; i <= 300; i++) { x = lo + (hi - lo) * i / 300; c2.lineTo(F1.X(x), F1.Y(P.pdf(x))); } c2.lineTo(F1.X(hi), F1.Y(0)); c2.closePath(); c2.fill(); c2.stroke(); }
      xaxis(c2, F1, { n: 6 });
      var mx = F1.X(P.mean); c2.strokeStyle = C.gold; c2.setLineDash([4, 4]); c2.lineWidth = 1.5; c2.beginPath(); c2.moveTo(mx, F1.y0); c2.lineTo(mx, F1.y0 + F1.h); c2.stroke(); c2.setLineDash([]);
      // the current sample, as dots on the population's floor
      if (T.cur.length) {
        var show = T.cur.slice(0, 100);
        show.forEach(function (v, j) { var yy = F1.y0 + F1.h - 5 - (j % 4) * 5; c2.fillStyle = 'rgba(219,231,239,.9)'; c2.beginPath(); c2.arc(F1.X(clamp(v, lo, hi)), yy, 2.6, 0, 6.2832); c2.fill(); });
        c2.fillStyle = C.gold; var cx = F1.X(clamp(T.curMean, lo, hi)); c2.beginPath(); c2.moveTo(cx, F1.y0 + F1.h + 2); c2.lineTo(cx - 6, F1.y0 + F1.h + 11); c2.lineTo(cx + 6, F1.y0 + F1.h + 11); c2.fill();
      }
      // the means
      var top = h1 + 40, F2lo = lo, F2hi = hi, se = P.sd / M.sqrt(T.n);
      if (T.zoom) { F2lo = P.mean - 4.5 * se; F2hi = P.mean + 4.5 * se; if (P.discrete && T.n === 1) { F2lo = lo; F2hi = hi; } }
      var nb = 60, bw = (F2hi - F2lo) / nb, k = T.means.length, blo = F2lo;
      if (P.discrete) { // means of whole numbers sit on a lattice of spacing 1/n: center the bars on it
        var unit = 1 / T.n; bw = unit * M.max(1, M.ceil((F2hi - F2lo) / 60 / unit)); blo = (M.floor(F2lo / unit) - 0.5) * unit; nb = M.ceil((F2hi - blo) / bw);
      }
      var bins = new Array(nb).fill(0);
      T.means.forEach(function (m) { var b = M.floor((m - blo) / bw); if (b >= 0 && b < nb) bins[b]++; });
      var dens = bins.map(function (b) { return k ? b / k / bw : 0; }), peak = M.max.apply(null, dens), npeak = 1 / (se * M.sqrt(2 * M.PI));
      var F2 = frame(x0, top + 22, ww, H - top - 22 - 34, F2lo, F2hi, 0, M.max(peak, T.curve ? npeak : 0, 1e-9) * 1.12);
      c2.fillStyle = C.ink; c2.font = '600 12px system-ui,sans-serif'; c2.textAlign = 'left'; c2.textBaseline = 'top';
      c2.fillText('Means of samples of ' + T.n + (k ? ': ' + num(k) + ' so far' : ''), x0, top);
      if (k) { c2.save(); c2.beginPath(); c2.rect(F2.x0, F2.y0 - 2, F2.w, F2.h + 2); c2.clip(); c2.fillStyle = 'rgba(255,212,121,.75)'; for (i = 0; i < nb; i++) if (bins[i]) { var hh = F2.Y(0) - F2.Y(dens[i]); c2.fillRect(F2.X(blo + i * bw) + 0.5, F2.Y(dens[i]), M.max(1, F2.X(blo + (i + 1) * bw) - F2.X(blo + i * bw) - 1), hh); } c2.restore(); }
      if (T.curve) { c2.strokeStyle = C.pink; c2.lineWidth = 2; c2.setLineDash([6, 4]); c2.beginPath(); for (i = 0; i <= 300; i++) { x = F2lo + (F2hi - F2lo) * i / 300; var z = (x - P.mean) / se, yv = M.exp(-0.5 * z * z) * npeak; if (i) c2.lineTo(F2.X(x), F2.Y(yv)); else c2.moveTo(F2.X(x), F2.Y(yv)); } c2.stroke(); c2.setLineDash([]); }
      xaxis(c2, F2, { n: 6, label: 'sample mean x̄' });
      var mx2 = F2.X(P.mean); c2.strokeStyle = C.gold; c2.setLineDash([4, 4]); c2.lineWidth = 1.5; c2.beginPath(); c2.moveTo(mx2, F2.y0); c2.lineTo(mx2, F2.y0 + F2.h); c2.stroke(); c2.setLineDash([]);
      if (T.curve) { c2.fillStyle = C.pink; c2.font = '10px system-ui,sans-serif'; c2.textAlign = 'right'; c2.textBaseline = 'top'; c2.fillText('normal curve with sd σ/√n', x0 + ww, top + 2); }
      // drops in flight
      T.drops.forEach(function (d) { var y = F1.y0 + F1.h + 10 + d.t * (F2.y0 + F2.h - F1.y0 - F1.h - 10); c2.fillStyle = C.gold; c2.beginPath(); c2.arc(F2.X(clamp(d.x, F2lo, F2hi)) * d.t + F1.X(clamp(d.x, lo, hi)) * (1 - d.t), y, 4, 0, 6.2832); c2.fill(); });
    }
    L.loop(function (dt) {
      var busy = false;
      if (T.run) { T.acc += dt * (reduced ? 200 : T.means.length < 60 ? 6 : 120); var k = M.floor(T.acc); if (k) { T.acc -= k; for (var i = 0; i < k; i++) sample(i === k - 1 && T.means.length < 400); if (T.means.length >= 5000) setRun(false); up(); } busy = true; }
      if (T.drops.length) { T.drops.forEach(function (d) { d.t += dt * 2.4; }); T.drops = T.drops.filter(function (d) { return d.t < 1; }); busy = true; }
      if (busy) draw2();
    }, v2);
    window.addEventListener('resize', function () { G2.fit(); draw2(); });
    if (window.ResizeObserver) new ResizeObserver(function () { draw2(); }).observe(cv2);
    setRun(true); up();
  })();

  /* =========================================================================================
     3. The law of large numbers
     ========================================================================================= */
  (function () {
    var v3 = $('ec2l-view'), cv3 = $('ec2l-cv'); if (!v3 || !cv3) return;
    var G3 = L.canvas(cv3), c3 = G3.c, read3 = $('ec2l-read'), r3 = ES.rng(99), NMAX = 10000;
    var Z = { kind: 'die', runs: [], cur: null, play: false };
    function pop() { return Z.kind === 'die' ? { mu: 3.5, sd: M.sqrt(35 / 12), f: function () { return 1 + M.floor(6 * r3.u()); }, hit: 6, p: 1 / 6, lab: 'sixes' } : { mu: 0.5, sd: 0.5, f: function () { return r3.u() < 0.5 ? 1 : 0; }, hit: 1, p: 0.5, lab: 'heads' }; }
    function start() { if (Z.cur) Z.runs.push(Z.cur); if (Z.runs.length > 5) Z.runs.shift(); Z.cur = { m: [], s: 0, hits: 0 }; Z.play = true; if (reduced) { while (Z.cur.m.length < NMAX) step(); Z.play = false; } }
    function step() { var P = pop(), x = P.f(); Z.cur.s += x; if (x === P.hit) Z.cur.hits++; Z.cur.m.push(Z.cur.s / (Z.cur.m.length + 1)); }
    seg($('ec2l-kind'), 'data-k', 'die', function (k) { Z.kind = k; Z.runs = []; Z.cur = null; start(); });
    $('ec2l-go').addEventListener('click', start);
    function up3() {
      var P = pop(), n = Z.cur ? Z.cur.m.length : 0, rows = [];
      rows.push([Z.kind === 'die' ? 'Rolls' : 'Tosses', num(n)]);
      rows.push(['Running average', n ? fmt(Z.cur.m[n - 1], 4) : '—']);
      rows.push(['Share of ' + P.lab, n ? fmt(Z.cur.hits / n, 4) + ' (exact ' + fmt(P.p, 4) + ')' : '—']);
      rows.push(['Count of ' + P.lab + ' − expected', n ? (Z.cur.hits - n * P.p >= 0 ? '+' : '−') + fmt(M.abs(Z.cur.hits - n * P.p), 1) : '—']);
      dl(read3, rows); draw3();
    }
    function draw3() {
      G3.fit(); var W = G3.w, H = G3.h, P = pop(); c3.clearRect(0, 0, W, H); c3.fillStyle = C.bg; c3.fillRect(0, 0, W, H);
      var x0 = 44, F = { x0: x0, y0: 26, w: W - x0 - 30, h: H - 26 - 34 }, ylo = Z.kind === 'die' ? 1.5 : 0, yhi = Z.kind === 'die' ? 5.5 : 1;
      function X(n) { return F.x0 + M.log10(n) / 4 * F.w; } function Y(v) { return F.y0 + F.h - (clamp(v, ylo, yhi) - ylo) / (yhi - ylo) * F.h; }
      c3.font = '11px system-ui,sans-serif'; c3.fillStyle = C.text; c3.textAlign = 'center'; c3.textBaseline = 'top';
      [1, 10, 100, 1000, 10000].forEach(function (n) { var x = X(n); c3.strokeStyle = C.grid; c3.beginPath(); c3.moveTo(x, F.y0); c3.lineTo(x, F.y0 + F.h); c3.stroke(); c3.fillText(num(n), x, F.y0 + F.h + 4); });
      c3.textAlign = 'right'; c3.textBaseline = 'middle';
      for (var v = ylo; v <= yhi + 1e-9; v += Z.kind === 'die' ? 1 : 0.25) { var y = Y(v); c3.strokeStyle = C.grid; c3.beginPath(); c3.moveTo(F.x0, y); c3.lineTo(F.x0 + F.w, y); c3.stroke(); c3.fillText(fmt(v, Z.kind === 'die' ? 1 : 2), F.x0 - 5, y); }
      // the 95% funnel μ ± 1.96σ/√n
      c3.fillStyle = 'rgba(99,230,190,.12)'; c3.beginPath();
      for (var i = 0; i <= 200; i++) { var n = M.pow(10, 4 * i / 200); c3.lineTo(X(n), Y(P.mu + 1.96 * P.sd / M.sqrt(n))); }
      for (i = 200; i >= 0; i--) { n = M.pow(10, 4 * i / 200); c3.lineTo(X(n), Y(P.mu - 1.96 * P.sd / M.sqrt(n))); }
      c3.closePath(); c3.fill();
      c3.strokeStyle = C.gold; c3.setLineDash([5, 4]); c3.lineWidth = 1.5; c3.beginPath(); c3.moveTo(F.x0, Y(P.mu)); c3.lineTo(F.x0 + F.w, Y(P.mu)); c3.stroke(); c3.setLineDash([]);
      function path(m, col, w) { if (!m || !m.length) return; c3.strokeStyle = col; c3.lineWidth = w; c3.beginPath(); var step = M.max(1, M.floor(m.length / 1500)); for (var j = 0; j < m.length; j += (j < 200 ? 1 : step)) { var x = X(j + 1), y = Y(m[j]); if (j) c3.lineTo(x, y); else c3.moveTo(x, y); } c3.lineTo(X(m.length), Y(m[m.length - 1])); c3.stroke(); }
      Z.runs.forEach(function (rn) { path(rn.m, 'rgba(116,192,252,.35)', 1.2); });
      if (Z.cur) path(Z.cur.m, C.pink, 2);
      c3.fillStyle = C.ink; c3.font = '600 11px system-ui,sans-serif'; c3.textAlign = 'left'; c3.textBaseline = 'top'; c3.fillText('Running average after n ' + (Z.kind === 'die' ? 'rolls' : 'tosses') + ' (n on a log scale)', F.x0, 6);
      c3.fillStyle = C.gold; c3.textAlign = 'right'; c3.fillText('true mean ' + fmt(P.mu, 1), F.x0 + F.w, 6);
    }
    L.loop(function (dt) {
      if (!Z.play || !Z.cur) return;
      var n = Z.cur.m.length, target = M.min(NMAX, M.max(n + 1, M.round(M.pow(10, M.log10(M.max(1, n)) + dt * 1.4)))); // speeds up on the log scale
      while (Z.cur.m.length < target) step();
      if (Z.cur.m.length >= NMAX) Z.play = false;
      up3();
    }, v3);
    window.addEventListener('resize', function () { G3.fit(); draw3(); });
    if (window.ResizeObserver) new ResizeObserver(function () { draw3(); }).observe(cv3);
    start(); up3();
  })();

  /* =========================================================================================
     4. Conditional expectation: average wage at each level of schooling
     ========================================================================================= */
  (function () {
    var v4 = $('ec2e-view'), cv4 = $('ec2e-cv'); if (!v4 || !cv4) return;
    var G4 = L.canvas(cv4), c4 = G4.c, read4 = $('ec2e-read'), sl = $('ec2e-x'), data = MOD.wages(1500, 8), jit = ES.rng(5), jx = data.x.map(function () { return (jit.u() - 0.5) * 0.5; });
    var E = { x: 12, line: false };
    sl.addEventListener('input', function () { E.x = +sl.value; up4(); });
    $('ec2e-line').addEventListener('change', function (e) { E.line = e.target.checked; up4(); });
    function at(x) { return data.y.filter(function (v, i) { return data.x[i] === x; }); }
    var fit = ES.ols(data.y, data.x.map(function (x) { return [1, x]; }));
    function up4() {
      var ys = at(E.x), rows = [];
      $('ec2e-x-o').textContent = E.x + ' years';
      rows.push(['Workers with ' + E.x + ' years', num(ys.length) + ' of ' + num(data.y.length)]);
      rows.push(['Their average wage', ys.length ? '$' + fmt(ES.mean(ys), 2) : '—']);
      rows.push(['True E[wage | ' + E.x + ' years]', '$' + fmt(MOD.cef(E.x), 2)]);
      rows.push(['Spread (sd) at ' + E.x + ' years', ys.length > 1 ? '$' + fmt(ES.sd(ys), 2) : '—']);
      if (E.line) rows.push(['Straight line: wage ≈', (fit.b[0] < 0 ? '−$' : '$') + fmt(M.abs(fit.b[0]), 2) + ' + $' + fmt(fit.b[1], 2) + ' × years']);
      dl(read4, rows); draw4();
    }
    function draw4() {
      G4.fit(); var W = G4.w, H = G4.h, small = W < 560; c4.clearRect(0, 0, W, H); c4.fillStyle = C.bg; c4.fillRect(0, 0, W, H);
      var side = small ? 0 : 150, F = frame(46, 24, W - 46 - 16 - side, H - 24 - 36, 7.3, 20.7, 0, 90);
      c4.font = '11px system-ui,sans-serif'; c4.fillStyle = C.text;
      [0, 15, 30, 45, 60, 75, 90].forEach(function (v) { var y = M.round(F.Y(v)) + 0.5; c4.strokeStyle = C.grid; c4.beginPath(); c4.moveTo(F.x0, y); c4.lineTo(F.x0 + F.w, y); c4.stroke(); c4.textAlign = 'right'; c4.textBaseline = 'middle'; c4.fillText('$' + v, F.x0 - 5, y); });
      MOD.EDU.forEach(function (x) { if (small && x % 2) return; c4.textAlign = 'center'; c4.textBaseline = 'top'; c4.fillText(String(x), F.X(x), F.y0 + F.h + 4); });
      c4.fillStyle = C.ink; c4.font = '600 11px system-ui,sans-serif'; c4.textAlign = 'right'; c4.fillText('years of schooling →', F.x0 + F.w, F.y0 + F.h + 18); c4.textAlign = 'left'; c4.textBaseline = 'top'; c4.fillText('↑ hourly wage', F.x0 + 6, 6);
      // selected column
      var sx = F.X(E.x); c4.fillStyle = 'rgba(99,230,190,.1)'; c4.fillRect(sx - F.w / 28, F.y0, F.w / 14, F.h);
      for (var i = 0; i < data.y.length; i++) { var sel = data.x[i] === E.x; c4.fillStyle = sel ? 'rgba(99,230,190,.85)' : 'rgba(219,231,239,.28)'; c4.beginPath(); c4.arc(F.X(data.x[i] + jx[i]), F.Y(M.min(89, data.y[i])), sel ? 2.6 : 2, 0, 6.2832); c4.fill(); }
      // the true conditional mean (curve) and the sample means (diamonds)
      c4.strokeStyle = C.gold; c4.lineWidth = 1.5; c4.setLineDash([5, 4]); c4.beginPath(); for (var x = 8; x <= 20.001; x += 0.1) { if (x === 8) c4.moveTo(F.X(x), F.Y(MOD.cef(x))); else c4.lineTo(F.X(x), F.Y(MOD.cef(x))); } c4.stroke(); c4.setLineDash([]);
      MOD.EDU.forEach(function (x) { var ys = at(x); if (!ys.length) return; var m = ES.mean(ys), X = F.X(x), Y = F.Y(m); c4.fillStyle = C.gold; c4.beginPath(); c4.moveTo(X, Y - 6); c4.lineTo(X + 6, Y); c4.lineTo(X, Y + 6); c4.lineTo(X - 6, Y); c4.closePath(); c4.fill(); c4.strokeStyle = C.bg; c4.lineWidth = 1; c4.stroke(); });
      if (E.line) { c4.strokeStyle = C.pink; c4.lineWidth = 2.5; c4.beginPath(); c4.moveTo(F.X(7.5), F.Y(fit.b[0] + fit.b[1] * 7.5)); c4.lineTo(F.X(20.5), F.Y(fit.b[0] + fit.b[1] * 20.5)); c4.stroke(); }
      // the distribution of wages at the selected x, sideways
      if (side) {
        var ys = at(E.x), hx0 = W - side + 4, bins = new Array(18).fill(0); ys.forEach(function (v) { var b = M.floor(M.min(89.9, v) / 5); bins[b]++; }); var mx = M.max.apply(null, bins) || 1;
        c4.fillStyle = C.ink; c4.font = '600 11px system-ui,sans-serif'; c4.textAlign = 'left'; c4.textBaseline = 'top'; c4.fillText('Wages at ' + E.x + ' years', hx0, 6);
        bins.forEach(function (b, j) { if (!b) return; var y1 = F.Y((j + 1) * 5), y2 = F.Y(j * 5); c4.fillStyle = 'rgba(99,230,190,.6)'; c4.fillRect(hx0, y1 + 1, b / mx * (side - 24), y2 - y1 - 2); });
        if (ys.length) { var my = F.Y(ES.mean(ys)); c4.strokeStyle = C.gold; c4.lineWidth = 2; c4.beginPath(); c4.moveTo(hx0, my); c4.lineTo(W - 10, my); c4.stroke(); c4.fillStyle = C.gold; c4.font = '600 10px system-ui,sans-serif'; c4.textBaseline = 'bottom'; c4.fillText('mean $' + fmt(ES.mean(ys), 1), hx0 + 2, my - 2); }
      }
    }
    cv4.addEventListener('pointerdown', function (ev) { var r = cv4.getBoundingClientRect(), W = G4.w, side = W < 560 ? 0 : 150, w = W - 46 - 16 - side, x = 7.3 + (ev.clientX - r.left - 46) / w * 13.4; if (x >= 7.5 && x <= 20.5) { E.x = clamp(M.round(x), 8, 20); sl.value = E.x; up4(); } });
    window.addEventListener('resize', function () { G4.fit(); draw4(); });
    if (window.ResizeObserver) new ResizeObserver(function () { draw4(); }).observe(cv4);
    up4();
  })();
})();
