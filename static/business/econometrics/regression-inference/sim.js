/* Econometrics, Chapter 5: Inference in Regression. The Monte Carlo lab: a known population model, thousands of samples,
   one slope estimate from each, piling up into a histogram you can compare with the truth and with what the standard
   error formula claims. Four switches break the assumptions. Model in model.js (EC5Model); t quantiles from EconStats. */
(function () {
  'use strict';
  var L = window.TRBLab, ES = window.EconStats, MOD = window.EC5Model, root = document.getElementById('ec5-lab');
  if (!L || !ES || !MOD || !root) return;
  function $(id) { return document.getElementById(id); }
  var M = Math, fmt = ES.fmt, reduced = L.reduced;
  var C = { bg: '#06111a', bg2: '#0b1b27', grid: 'rgba(120,170,200,.13)', axis: 'rgba(143,179,198,.55)', text: '#8fb3c6', ink: '#dbe7ef', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', purple: '#b197fc' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function num(v) { return (+v).toLocaleString('en-US'); }
  function pct(v, d) { return fmt(100 * v, d === undefined ? 1 : d) + '%'; }
  function seg(el, attr, cur, fn) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); fn(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }
  function celebrate(el) { if (reduced || !el) return; el.classList.remove('ec5-win'); void el.offsetWidth; el.classList.add('ec5-win'); setTimeout(function () { el.classList.remove('ec5-win'); }, 1300); }
  function bringIntoView(el) { if (!el) return; var r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > (window.innerHeight || 800)) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
  var SLUG = 'econ-regression-inference', B1 = MOD.B1;

  var view = $('ec5-view'), cv = $('ec5-cv'), G = L.canvas(cv), c = G.c, hud = $('ec5-hud'), readEl = $('ec5-read');
  var NS = [10, 20, 30, 50, 100, 200, 500, 1000], MAXK = 20000;
  var P = { n: 100, s: 5, sigma: 8, shape: 'normal', curve: false, hetero: false, omitted: false, cluster: false };
  var S = { se: 'classic', speed: 'fast', run: true, b: [], se1: [], cov: 0, sum: 0, sum2: 0, sumSE: 0, last: null, lastFit: null, pending: 0, acc: 0, range: null, sawCluster: false, tcache: {} };
  var rng = ES.rng(77);
  function tcrit(df) { if (!S.tcache[df]) S.tcache[df] = ES.tInv(0.975, df); return S.tcache[df]; }
  function clear() { S.b = []; S.se1 = []; S.cov = 0; S.sum = 0; S.sum2 = 0; S.sumSE = 0; S.last = null; S.lastFit = null; S.pending = 0; S.range = null; up(); }
  function one() {
    var D = MOD.sample(P, rng), F = MOD.fit(D, S.se);
    S.b.push(F.b1); S.se1.push(F.se); S.sum += F.b1; S.sum2 += F.b1 * F.b1; S.sumSE += F.se;
    if (M.abs(F.b1 - B1) <= tcrit(F.df) * F.se) S.cov++;
    S.last = D; S.lastFit = F;
  }
  function stats() {
    var k = S.b.length; if (!k) return { k: 0 };
    var mean = S.sum / k, sd = k > 1 ? M.sqrt(M.max(0, (S.sum2 - S.sum * S.sum / k) / (k - 1))) : NaN;
    return { k: k, mean: mean, sd: sd, avgSE: S.sumSE / k, cover: S.cov / k };
  }
  // controls
  var nEl = $('ec5-n'), sgEl = $('ec5-sg'), spEl = $('ec5-sp');
  nEl.addEventListener('input', function () { P.n = NS[+nEl.value]; $('ec5-n-o').textContent = 'n = ' + P.n; clear(); });
  sgEl.addEventListener('input', function () { P.sigma = +sgEl.value; $('ec5-sg-o').textContent = 'σ = ' + P.sigma + ' points'; clear(); });
  spEl.addEventListener('input', function () { P.s = +spEl.value; $('ec5-sp-o').textContent = fmt(5 - P.s, 1) + ' to ' + fmt(5 + P.s, 1) + ' hours'; clear(); });
  var boxes = { curve: $('ec5-curve'), hetero: $('ec5-het'), omitted: $('ec5-ovb'), cluster: $('ec5-clu') };
  Object.keys(boxes).forEach(function (k) { boxes[k].addEventListener('change', function () { P[k] = boxes[k].checked; markPre(null); clear(); }); });
  var markShape = seg($('ec5-shape'), 'data-e', P.shape, function (e) { P.shape = e; clear(); });
  var markSE = seg($('ec5-se'), 'data-s', S.se, function (s) { S.se = s; clear(); });
  seg($('ec5-speed'), 'data-v', S.speed, function (v) { S.speed = v; });
  var markPre = seg($('ec5-pre'), 'data-p', 'ideal', function (p) { preset(p); });
  function preset(p) {
    P.curve = p === 'curve'; P.hetero = p === 'hetero'; P.omitted = p === 'omitted'; P.cluster = p === 'cluster'; P.shape = 'normal'; markShape('normal');
    Object.keys(boxes).forEach(function (k) { boxes[k].checked = P[k]; }); markPre(p); clear(); setRun(true);
  }
  var runBtn = $('ec5-run');
  function setRun(on) { S.run = on; runBtn.textContent = on ? '❚❚' : '▶'; runBtn.setAttribute('aria-label', on ? 'Pause' : 'Keep drawing samples'); runBtn.setAttribute('aria-pressed', String(on)); }
  runBtn.addEventListener('click', function () { setRun(!S.run); });
  $('ec5-more').addEventListener('click', function () { S.pending += 1000; });
  $('ec5-one').addEventListener('click', function () { setRun(false); one(); up(); });
  $('ec5-k').addEventListener('click', function () { S.pending += 1000; });
  $('ec5-reset').addEventListener('click', clear);
  $('ec5-clear').addEventListener('click', clear);

  function up() {
    var st = stats(), rows = [], tg = MOD.target(P);
    rows.push(['Samples drawn', num(st.k)]);
    rows.push(['True slope β₁', fmt(B1, 2)]);
    rows.push(['Average of the β̂₁', st.k ? fmt(st.mean, 3) + ' (bias ' + (st.mean - B1 >= 0 ? '+' : '−') + fmt(M.abs(st.mean - B1), 3) + ')' : '—']);
    rows.push(['Actual spread: sd of β̂₁', st.k > 1 ? fmt(st.sd, 3) : '—']);
    rows.push(['Average standard error', st.k ? fmt(st.avgSE, 3) + (st.k > 1 ? ' (' + fmt(st.avgSE / st.sd, 2) + '× the actual)' : '') : '—']);
    rows.push(['Textbook σ/√SSTₓ (ideal)', fmt(MOD.idealSD(P), 3)]);
    rows.push(['95% intervals that cover β₁', st.k ? pct(st.cover, 1) : '—']);
    dl(readEl, rows);
    var F = S.lastFit;
    hud.innerHTML = F ? 'This sample: <b>β̂₁ = ' + fmt(F.b1, 2) + '</b>, se ' + fmt(F.se, 2) + '<br>95% CI ' + fmt(F.b1 - tcrit(F.df) * F.se, 2) + ' to ' + fmt(F.b1 + tcrit(F.df) * F.se, 2) : 'Drawing samples…';
    cv.setAttribute('aria-description', st.k ? st.k + ' samples. Average estimate ' + fmt(st.mean, 2) + ' against a true slope of 4; spread ' + fmt(st.sd, 3) + '; average standard error ' + fmt(st.avgSE, 3) + '; coverage ' + pct(st.cover, 1) + '.' : '');
    check(st, tg);
    draw(st, tg);
  }
  function draw(st, tg) {
    st = st || stats(); tg = tg === undefined ? MOD.target(P) : tg;
    G.fit(); var W = G.w, H = G.h, small = W < 620; c.clearRect(0, 0, W, H); c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
    // ----- the current sample -----
    var sx0, sy0, sw, sh, hx0, hy0, hw, hh;
    if (small) { sx0 = 40; sy0 = 76; sw = W - 54; sh = M.round(H * 0.28); hx0 = 14; hy0 = sy0 + sh + 70; hw = W - 28; hh = H - hy0 - 70; }
    else { sx0 = 46; sy0 = 84; sw = M.round(W * 0.36); sh = H - 84 - 92; hx0 = sx0 + sw + 40; hy0 = 84; hw = W - hx0 - 18; hh = H - 84 - 110; }
    var xlo = 0, xhi = 10, ylo = 0, yhi = 140;
    function SX(v) { return sx0 + (v - xlo) / (xhi - xlo) * sw; } function SY(v) { return sy0 + sh - (clamp(v, ylo, yhi) - ylo) / (yhi - ylo) * sh; }
    c.fillStyle = C.ink; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('One sample of ' + P.n + ' students', sx0, sy0 - 22);
    c.fillStyle = 'rgba(11,27,39,.9)'; c.fillRect(sx0, sy0, sw, sh);
    c.font = '10px system-ui,sans-serif'; c.fillStyle = C.text;
    [0, 5, 10].forEach(function (v) { c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(v + ' h', SX(v), sy0 + sh + 3); });
    [0, 50, 100].forEach(function (v) { var y = SY(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(sx0, y); c.lineTo(sx0 + sw, y); c.stroke(); c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(v, sx0 - 4, y); });
    c.save(); c.beginPath(); c.rect(sx0, sy0, sw, sh); c.clip();
    // the truth: gold dashed (the line 50 + 4x, or the curve)
    c.strokeStyle = C.gold; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath();
    for (var i = 0; i <= 40; i++) { var xv = xlo + (xhi - xlo) * i / 40, yv = MOD.B0 + B1 * xv + (P.curve ? MOD.B2 * xv * xv : 0); if (i) c.lineTo(SX(xv), SY(yv)); else c.moveTo(SX(xv), SY(yv)); }
    c.stroke(); c.setLineDash([]);
    if (S.last) {
      var D = S.last, rad = P.n > 300 ? 1.6 : P.n > 60 ? 2.4 : 3.4, hues = [C.blue, C.pink, C.green, C.gold, C.purple];
      for (i = 0; i < D.x.length; i++) { c.fillStyle = P.cluster ? hues[D.g[i] % 5] : 'rgba(219,231,239,.75)'; c.globalAlpha = P.cluster ? 0.85 : 1; c.beginPath(); c.arc(SX(D.x[i]), SY(D.y[i]), rad, 0, 6.2832); c.fill(); }
      c.globalAlpha = 1;
      var F = S.lastFit; c.strokeStyle = C.pink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(SX(xlo), SY(F.b0 + F.b1 * xlo)); c.lineTo(SX(xhi), SY(F.b0 + F.b1 * xhi)); c.stroke();
    }
    c.restore();
    c.font = '600 10px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = C.gold; c.fillText(P.curve ? 'the true curve' : 'the true line: 50 + 4 × hours', sx0 + 4, sy0 + 4); c.fillStyle = C.pink; c.fillText('this sample’s OLS line', sx0 + 4, sy0 + 17);
    c.fillStyle = C.text; c.textAlign = 'right'; c.fillText('score ↑   hours →', sx0 + sw - 4, sy0 + sh - 14);
    // ----- the histogram of slope estimates -----
    var isd = MOD.idealSD(P), sdR = st.k > 30 ? M.max(st.sd, st.avgSE, isd * 0.6) : isd, a = st.k ? M.min(B1, st.mean) : B1, b = st.k ? M.max(B1, st.mean) : B1;
    var want = [a - 4.2 * sdR, b + 4.2 * sdR];
    if (!S.range || reduced) S.range = want.slice(); else { S.range[0] += (want[0] - S.range[0]) * 0.15; S.range[1] += (want[1] - S.range[1]) * 0.15; }
    var lo = S.range[0], hi = S.range[1], nb = small ? 40 : 60, bw = (hi - lo) / nb, bins = new Array(nb).fill(0), out = 0;
    for (i = 0; i < S.b.length; i++) { var bi = M.floor((S.b[i] - lo) / bw); if (bi >= 0 && bi < nb) bins[bi]++; else out++; }
    var dens = bins.map(function (v) { return st.k ? v / st.k / bw : 0; }), npk = st.k ? 1 / (st.avgSE * M.sqrt(2 * M.PI)) : 1 / (isd * M.sqrt(2 * M.PI));
    var ymax = M.max(M.max.apply(null, dens), npk) * 1.12;
    function HX(v) { return hx0 + (v - lo) / (hi - lo) * hw; } function HY(v) { return hy0 + hh - v / ymax * hh; }
    c.fillStyle = C.ink; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText((small ? 'Slopes from ' : 'The slope from every sample: ') + num(st.k) + (small ? ' samples' : ' estimates'), hx0, hy0 - 22);
    c.fillStyle = 'rgba(11,27,39,.9)'; c.fillRect(hx0, hy0, hw, hh);
    var tk = ES.niceTicks(lo, hi, small ? 5 : 7), dec = M.max(0, -M.floor(M.log10(tk.step) + 1e-9));
    tk.ticks.forEach(function (v) { if (v < lo || v > hi) return; var x = HX(v); c.strokeStyle = C.grid; c.beginPath(); c.moveTo(x, hy0); c.lineTo(x, hy0 + hh); c.stroke(); c.fillStyle = C.text; c.font = '11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(fmt(v, dec), x, hy0 + hh + 4); });
    c.fillStyle = 'rgba(116,192,252,.6)'; for (i = 0; i < nb; i++) if (bins[i]) c.fillRect(HX(lo + i * bw) + 0.5, HY(dens[i]), M.max(1, hw / nb - 1), hy0 + hh - HY(dens[i]));
    // what the standard error formula claims: a normal curve with sd = the average standard error, around the average estimate
    if (st.k > 20) {
      c.strokeStyle = C.pink; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath();
      for (i = 0; i <= 200; i++) { var xv2 = lo + (hi - lo) * i / 200, z = (xv2 - st.mean) / st.avgSE, yv2 = npk * M.exp(-0.5 * z * z); if (i) c.lineTo(HX(xv2), HY(yv2)); else c.moveTo(HX(xv2), HY(yv2)); }
      c.stroke(); c.setLineDash([]);
    }
    // the truth, and the average estimate
    var tx = HX(B1); c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.moveTo(tx, hy0 - 4); c.lineTo(tx, hy0 + hh); c.stroke();
    c.fillStyle = C.gold; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom';
    if (st.k) {
      var mxp = HX(st.mean), biased = M.abs(st.mean - B1) > 3 * st.sd / M.sqrt(st.k) + 0.02;
      c.strokeStyle = biased ? C.red : C.green; c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(mxp, hy0 + 14); c.lineTo(mxp, hy0 + hh); c.stroke(); c.setLineDash([]);
      if (biased) { var ay = hy0 + 34; c.strokeStyle = C.red; c.lineWidth = 2; c.beginPath(); c.moveTo(tx, ay); c.lineTo(mxp, ay); c.stroke(); c.fillStyle = C.red; c.beginPath(); var dir = mxp > tx ? 1 : -1; c.moveTo(mxp, ay); c.lineTo(mxp - dir * 7, ay - 4); c.lineTo(mxp - dir * 7, ay + 4); c.fill(); c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('bias ' + (st.mean > B1 ? '+' : '−') + fmt(M.abs(st.mean - B1), 2), (tx + mxp) / 2, ay - 4); }
      // spreads: actual (blue) and claimed by the standard error (pink), as brackets
      var by1 = hy0 + hh - 30, by2 = hy0 + hh - 16;
      function bracket(y, half, col, lab) { var a1 = HX(st.mean - half), a2 = HX(st.mean + half); c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(a1, y - 4); c.lineTo(a1, y + 4); c.moveTo(a1, y); c.lineTo(a2, y); c.moveTo(a2, y - 4); c.lineTo(a2, y + 4); c.stroke(); c.fillStyle = col; c.font = '600 10px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(lab, a2 + 6, y); }
      if (st.k > 20) { bracket(by1, st.sd, C.blue, 'actual ±1 sd'); bracket(by2, st.avgSE, C.pink, 'the SE says ±1 se'); }
    }
    c.font = '600 11px system-ui,sans-serif'; var tl = 'true β₁ = 4', tw2 = c.measureText(tl).width; c.fillStyle = 'rgba(6,17,26,.85)'; c.fillRect(tx - tw2 / 2 - 4, hy0 + 2, tw2 + 8, 16); c.fillStyle = C.gold; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(tl, tx, hy0 + 4);
    // the coverage gauge
    var gy = small ? H - 50 : hy0 + hh + 34, gx0 = hx0, gx1 = hx0 + hw, g0 = 0.5, g1 = 1;
    function GX(v) { return gx0 + (clamp(v, g0, g1) - g0) / (g1 - g0) * (gx1 - gx0); }
    c.fillStyle = C.ink; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText('95% confidence intervals that cover β₁' + (st.k ? ': ' + pct(st.cover, 1) : ''), gx0, gy);
    c.fillStyle = 'rgba(11,27,39,.95)'; c.fillRect(gx0, gy + 17, gx1 - gx0, 10);
    if (st.k) { c.fillStyle = M.abs(st.cover - 0.95) <= 0.015 ? C.green : C.red; c.fillRect(gx0, gy + 17, GX(st.cover) - gx0, 10); }
    var nx = GX(0.95); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(nx, gy + 13); c.lineTo(nx, gy + 31); c.stroke();
    c.fillStyle = C.text; c.font = '10px system-ui,sans-serif'; c.textBaseline = 'top'; [0.5, 0.75, 0.95].forEach(function (v) { c.textAlign = 'center'; c.fillText(fmt(100 * v, 0) + '%', GX(v), gy + 30); });
  }

  // missions
  var MIS = [
    { id: 'center', title: 'Centered on the truth', goal: 'With every assumption holding, collect 1,000 estimates. Their average lands within 0.05 of the true β₁ = 4: OLS is unbiased.' },
    { id: 'formula', title: 'The formula knows', goal: 'Change the sample size or the noise, keep every assumption holding and classic standard errors, and collect 1,000 samples. The average standard error still matches the actual spread of β̂₁ within 5%.' },
    { id: 'curve', title: 'A line through a curve', goal: 'Make the truth bend and collect 500 estimates. The pile no longer centers on 4.' },
    { id: 'hetero', title: 'Unbiased, but overconfident', goal: 'Let the noise grow with hours, keep classic standard errors, and collect 1,000. Still centered on 4, but fewer than 92% of the intervals cover it.' },
    { id: 'robust', title: 'Robust to the rescue', goal: 'Same heteroskedastic world, now with robust standard errors: 1,000 samples bring coverage back to between 93% and 96.5%.' },
    { id: 'ovb', title: 'More data, same mistake', goal: 'Leave out ability, use n of 500 or more, and collect 500 estimates. They pile up tightly, around the wrong number.' },
    { id: 'cluster', title: 'Classrooms', goal: 'Turn on correlated errors: classic intervals cover far less than 95%. Then switch to clustered standard errors with n of 500 or more: over 1,000 samples, coverage climbs back above 92%.' },
    { id: 'normal', title: 'Normality not required', goal: 'With skewed or fat-tailed errors, n of 100 or more and no switches on, collect 2,000 estimates. Coverage still lands between 93.5% and 96.5%.' }
  ];
  var mis = L.missions($('ec5-missions'), SLUG, MIS, function (id) {
    bringIntoView(view);
    var to = { center: 'ideal', formula: 'ideal', curve: 'curve', hetero: 'hetero', robust: 'hetero', ovb: 'omitted', cluster: 'cluster', normal: 'ideal' }[id];
    S.se = id === 'robust' ? 'HC1' : 'classic'; markSE(S.se);
    if (id === 'ovb' || id === 'formula') { P.n = id === 'ovb' ? 500 : 200; nEl.value = NS.indexOf(P.n); $('ec5-n-o').textContent = 'n = ' + P.n; }
    else if (P.n < 100) { P.n = 100; nEl.value = NS.indexOf(100); $('ec5-n-o').textContent = 'n = 100'; }
    preset(to);
    if (id === 'normal') { P.shape = 'skew'; markShape('skew'); clear(); }
  });
  function win(id, text) { if (mis.done(id)) { L.toast(view, '✓ ' + text); celebrate(view); } }
  function ideal() { return !P.curve && !P.hetero && !P.omitted && !P.cluster; }
  function check(st) {
    if (!st.k) return;
    if (ideal() && P.shape === 'normal' && st.k >= 1000 && M.abs(st.mean - B1) < 0.05) win('center', 'Average ' + fmt(st.mean, 3) + ' from ' + num(st.k) + ' samples. Right on average.');
    if (ideal() && P.shape === 'normal' && S.se === 'classic' && (P.n !== 100 || P.sigma !== 8) && st.k >= 1000 && M.abs(st.avgSE / st.sd - 1) < 0.05) win('formula', 'Average se ' + fmt(st.avgSE, 3) + ' vs actual spread ' + fmt(st.sd, 3) + '. σ/√SSTₓ works.');
    if (P.curve && st.k >= 500 && M.abs(st.mean - B1) > 0.5) win('curve', 'Average ' + fmt(st.mean, 2) + ': the line estimates the average slope, not β₁.');
    if (P.hetero && !P.curve && !P.omitted && !P.cluster && S.se === 'classic' && st.k >= 1000 && st.cover < 0.92 && M.abs(st.mean - B1) < 0.1) win('hetero', 'Average ' + fmt(st.mean, 2) + ', unbiased, but only ' + pct(st.cover, 1) + ' coverage.');
    if (P.hetero && !P.curve && !P.omitted && !P.cluster && S.se === 'HC1' && st.k >= 1000 && st.cover >= 0.93 && st.cover <= 0.965) win('robust', 'Robust standard errors: ' + pct(st.cover, 1) + ' coverage.');
    if (P.omitted && P.n >= 500 && st.k >= 500 && st.mean - B1 > 0.5) win('ovb', 'Average ' + fmt(st.mean, 2) + ' with spread only ' + fmt(st.sd, 2) + '. Precisely wrong.');
    if (P.cluster && S.se === 'classic' && st.k >= 300 && st.cover < 0.85) { if (!S.sawCluster) L.toast(view, 'Classic intervals cover only ' + pct(st.cover, 0) + '. Try clustered standard errors.'); S.sawCluster = true; }
    if (P.cluster && S.sawCluster && S.se === 'cluster' && P.n >= 500 && st.k >= 1000 && st.cover > 0.92) win('cluster', 'Clustered standard errors: ' + pct(st.cover, 1) + ' coverage.');
    if (ideal() && P.shape !== 'normal' && P.n >= 100 && S.se === 'classic' && st.k >= 2000 && st.cover >= 0.935 && st.cover <= 0.965) win('normal', pct(st.cover, 1) + ' coverage with ' + (P.shape === 'skew' ? 'skewed' : 'fat-tailed') + ' errors. The central limit theorem at work.');
  }

  // the loop: draw samples in batches sized to the sample size
  L.loop(function (dt) {
    var todo = 0;
    if (S.pending > 0) { todo = M.min(S.pending, M.max(1, M.floor(80000 / P.n))); S.pending -= todo; }
    else if (S.run && S.b.length < MAXK) {
      if (S.speed === 'slow' && !reduced) { S.acc += dt * 6; todo = M.floor(S.acc); S.acc -= todo; }
      else todo = M.max(1, M.floor(40000 / P.n));
    }
    todo = M.min(todo, MAXK - S.b.length);
    if (todo > 0) { for (var i = 0; i < todo; i++) one(); up(); }
    else if (S.range) draw();
  }, view);
  cv.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); setRun(!S.run); } else if (e.key === 'Enter') { one(); up(); } else if (e.key === 'c' || e.key === 'C') clear(); });
  window.addEventListener('resize', function () { G.fit(); draw(); });
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);
  setRun(!reduced); if (reduced) S.pending = 1000; up();

  /* =========================================================================================
     The Gauss–Markov race: four linear unbiased estimators of the same slope
     ========================================================================================= */
  (function () {
    var v2 = $('ec5r-view'), cv2 = $('ec5r-cv'); if (!v2) return;
    var G2 = L.canvas(cv2), c2 = G2.c, read2 = $('ec5r-read'), r2 = ES.rng(404);
    var R = { het: false, data: { ols: [], group: [], ends: [], wls: [] }, pending: 0 };
    var K = [['ols', 'OLS', C.pink], ['group', 'Two halves (Wald)', C.blue], ['ends', 'Two endpoints', C.gold], ['wls', 'Weighted least squares', C.green]];
    function reset() { R.data = { ols: [], group: [], ends: [], wls: [] }; up2(); }
    $('ec5r-go').addEventListener('click', function () { R.pending += 2000; });
    $('ec5r-het').addEventListener('change', function (e) { R.het = e.target.checked; reset(); });
    var MIS2 = [
      { id: 'blue', title: 'Best among the unbiased', goal: 'With constant noise, run the race. All four center on 4, and OLS has the smallest spread (weighted least squares ties it: with equal weights it is OLS).' },
      { id: 'beat', title: 'OLS loses its crown', goal: 'Let the noise grow with hours and run the race. Weighted least squares now beats OLS by a wide margin.' }
    ];
    var mis2 = L.missions($('ec5r-missions'), SLUG + '-race', MIS2);
    function sds() { var o = {}; K.forEach(function (k) { var a = R.data[k[0]]; o[k[0]] = a.length > 1 ? { m: ES.mean(a), s: ES.sd(a) } : null; }); return o; }
    function up2() {
      var o = sds(), n = R.data.ols.length;
      dl(read2, [['Samples (n = 50 each)', num(n)]].concat(K.map(function (k) { var v = o[k[0]]; return ['<i style="color:' + k[2] + ';font-style:normal" aria-hidden="true">●</i> ' + k[1], v ? 'mean ' + fmt(v.m, 2) + ' · sd ' + fmt(v.s, 3) : '—']; })));
      if (n >= 2000 && !R.het && o.ols.s <= o.group.s && o.ols.s <= o.ends.s) { if (mis2.done('blue')) { L.toast(v2, '✓ OLS sd ' + fmt(o.ols.s, 3) + ' vs ' + fmt(o.group.s, 3) + ' and ' + fmt(o.ends.s, 3) + '. Best linear unbiased.'); celebrate(v2); } }
      if (n >= 2000 && R.het && o.wls.s < 0.7 * o.ols.s) { if (mis2.done('beat')) { L.toast(v2, '✓ Weighted ' + fmt(o.wls.s, 3) + ' vs OLS ' + fmt(o.ols.s, 3) + '. Gauss–Markov needs constant variance.'); celebrate(v2); } }
      draw2();
    }
    function draw2() {
      G2.fit(); var W = G2.w, H = G2.h, small = W < 560; c2.clearRect(0, 0, W, H); c2.fillStyle = C.bg; c2.fillRect(0, 0, W, H);
      var x0 = 16, x1 = W - 16, top = small ? 56 : 40, bot = H - 30, lo = 0, hi = 8, nb = 80, bw = (hi - lo) / nb, ymax = 0, hs = {};
      K.forEach(function (k) {
        if (k[0] === 'wls' && !R.het) return; var a = R.data[k[0]], bins = new Array(nb).fill(0); if (!a.length) return;
        a.forEach(function (v) { var b = M.floor((v - lo) / bw); if (b >= 0 && b < nb) bins[b]++; }); var d = bins.map(function (v) { return v / a.length / bw; }); hs[k[0]] = d; ymax = M.max(ymax, M.max.apply(null, d));
      });
      ymax = (ymax || 1) * 1.1;
      function X(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); } function Y(v) { return bot - v / ymax * (bot - top); }
      for (var t = 0; t <= 8; t++) { var x = X(t); c2.strokeStyle = C.grid; c2.beginPath(); c2.moveTo(x, top); c2.lineTo(x, bot); c2.stroke(); c2.fillStyle = C.text; c2.font = '11px system-ui,sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'top'; c2.fillText(String(t), x, bot + 4); }
      c2.strokeStyle = C.axis; c2.beginPath(); c2.moveTo(x0, bot + 0.5); c2.lineTo(x1, bot + 0.5); c2.stroke();
      K.forEach(function (k) {
        var d = hs[k[0]]; if (!d) return; c2.strokeStyle = k[2]; c2.lineWidth = 2.2; c2.beginPath();
        for (var i = 0; i < nb; i++) { var xa = X(lo + i * bw), xb = X(lo + (i + 1) * bw), y = Y(d[i]); if (i) c2.lineTo(xa, y); else c2.moveTo(xa, y); c2.lineTo(xb, y); }
        c2.stroke(); c2.globalAlpha = 0.08; c2.fillStyle = k[2]; c2.lineTo(x1, bot); c2.lineTo(x0, bot); c2.fill(); c2.globalAlpha = 1;
      });
      c2.strokeStyle = '#fff'; c2.lineWidth = 1.5; c2.setLineDash([4, 4]); c2.beginPath(); c2.moveTo(X(4), top - 4); c2.lineTo(X(4), bot); c2.stroke(); c2.setLineDash([]);
      c2.font = '600 11px system-ui,sans-serif'; c2.textBaseline = 'top'; c2.textAlign = 'left'; var lx = x0, ly = 10;
      K.forEach(function (k) { if (k[0] === 'wls' && !R.het) return; var w = c2.measureText(k[1]).width + 30; if (lx + w > x1) { lx = x0; ly += 16; } c2.fillStyle = k[2]; c2.fillRect(lx, ly + 3, 12, 3); c2.fillStyle = C.ink; c2.fillText(k[1], lx + 16, ly); lx += w; });
      c2.fillStyle = C.text; c2.font = '10px system-ui,sans-serif'; c2.textAlign = 'right'; c2.textBaseline = 'bottom'; c2.fillText('estimated slope β̂₁ (true value 4)', x1, bot - 4);
    }
    L.loop(function () { if (R.pending > 0) { var k = M.min(R.pending, 250); R.pending -= k; var P2 = { n: 50, s: 5, sigma: 8, shape: 'normal', hetero: R.het }; for (var i = 0; i < k; i++) { var o = MOD.race(P2, r2); R.data.ols.push(o.ols); R.data.group.push(o.group); R.data.ends.push(o.ends); R.data.wls.push(o.wls); } up2(); } }, v2);
    window.addEventListener('resize', function () { G2.fit(); draw2(); });
    if (window.ResizeObserver) new ResizeObserver(function () { draw2(); }).observe(cv2);
    up2();
  })();

  /* =========================================================================================
     A small calculator: a t-test and confidence interval for a slope
     ========================================================================================= */
  (function () {
    var box = $('ec5c'); if (!box) return;
    var ids = ['b', 'se', 'n', 'h'];
    function calc() {
      var b = +$('ec5c-b').value, se = +$('ec5c-se').value, n = M.round(+$('ec5c-n').value), h = +$('ec5c-h').value, out = $('ec5c-out');
      if (!(se > 0) || !(n >= 3)) { out.innerHTML = '<p>Enter a positive standard error and at least 3 observations.</p>'; return; }
      var df = n - 2, t = (b - h) / se, p = 2 * (1 - ES.tCdf(M.abs(t), df)), tc = ES.tInv(0.975, df);
      dl(out, [['t statistic', fmt(t, 3)], ['Degrees of freedom', String(df)], ['Two-sided p-value', p < 0.0001 ? '< 0.0001' : fmt(p, 4)], ['Critical value at 5%', fmt(tc, 3)], ['95% interval', fmt(b - tc * se, 3) + ' to ' + fmt(b + tc * se, 3)], ['At 5%', M.abs(t) > tc ? '<b>reject</b> β₁ = ' + fmt(h, 2) : 'don’t reject β₁ = ' + fmt(h, 2)]]);
    }
    ids.forEach(function (k) { $('ec5c-' + k).addEventListener('input', calc); });
    calc();
  })();
})();
