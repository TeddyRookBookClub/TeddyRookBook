/* Econometrics, Chapter 3: Estimation and Inference. Three interactives:
   1. The confidence-interval machine: 100 samples, 100 intervals, and how many cover the true mean.
   2. The dartboard: four estimators of the same target, unbiased or not, precise or not.
   3. Hypothesis tests: the p-value as a tail area, type I and II errors, and power.
   Models in model.js (EC3Model); numbers from EconStats. */
(function () {
  'use strict';
  var L = window.TRBLab, ES = window.EconStats, MOD = window.EC3Model, root = document.getElementById('ec3-lab');
  if (!L || !ES || !MOD || !root) return;
  function $(id) { return document.getElementById(id); }
  var M = Math, fmt = ES.fmt, reduced = L.reduced;
  var C = { bg: '#06111a', bg2: '#0b1b27', grid: 'rgba(120,170,200,.13)', axis: 'rgba(143,179,198,.55)', text: '#8fb3c6', ink: '#dbe7ef', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
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
  function celebrate(el) { if (reduced || !el) return; el.classList.remove('ec3-win'); void el.offsetWidth; el.classList.add('ec3-win'); setTimeout(function () { el.classList.remove('ec3-win'); }, 1300); }
  function bringIntoView(el) { if (!el) return; var r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > (window.innerHeight || 800)) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
  function ticks(c, x0, x1, y, lo, hi, n, f) {
    var t = ES.niceTicks(lo, hi, n), dec = M.max(0, -M.floor(M.log10(t.step) + 1e-9));
    c.font = '11px system-ui,sans-serif'; c.fillStyle = C.text; c.textAlign = 'center'; c.textBaseline = 'top';
    t.ticks.forEach(function (v) { if (v < lo - 1e-9 || v > hi + 1e-9) return; var x = x0 + (v - lo) / (hi - lo) * (x1 - x0); c.fillText(f ? f(v) : fmt(v, dec), x, y); });
    return t;
  }
  var SLUG = 'econ-estimation-and-inference', MU = MOD.MU;

  /* =========================================================================================
     1. The confidence-interval machine
     ========================================================================================= */
  var view = $('ec3-view'), cv = $('ec3-cv'), G = L.canvas(cv), c = G.c, hud = $('ec3-hud'), readEl = $('ec3-read');
  var NS = [2, 3, 4, 5, 8, 10, 15, 20, 30, 50, 100, 200];
  var S = { pop: 'normal', n: 10, level: 0.95, method: 't', sigma: 10, batch: [], shown: 0, tally: 0, cover: 0, halfSum: 0, run: false, rng: ES.rng(7), lastBatch: null, key: '' };
  var nEl = $('ec3-n'), sEl = $('ec3-s');
  function setting() { return [S.pop, S.n, S.level, S.method, S.sigma].join('|'); }
  function resetTally() { S.tally = 0; S.cover = 0; S.halfSum = 0; S.key = setting(); }
  nEl.addEventListener('input', function () { S.n = NS[+nEl.value]; $('ec3-n-o').textContent = 'n = ' + S.n; changed(); });
  sEl.addEventListener('input', function () { S.sigma = +sEl.value; $('ec3-s-o').textContent = 'σ = ' + S.sigma + ' min'; changed(); });
  var markPop = seg($('ec3-pop'), 'data-p', S.pop, function (p) { S.pop = p; changed(); });
  var markLv = seg($('ec3-lv'), 'data-l', String(S.level), function (l) { S.level = +l; changed(); });
  var markMe = seg($('ec3-me'), 'data-m', S.method, function (m) { S.method = m; changed(); });
  function changed() { resetTally(); S.batch = []; S.shown = 0; S.lastBatch = null; up(); }
  function makeBatch() {
    var b = []; for (var i = 0; i < 100; i++) b.push(MOD.interval(MOD.draw(S.pop, S.n, S.sigma, S.rng), S.level, S.method, S.sigma));
    return b;
  }
  function tallyBatch(b) { if (S.key !== setting()) resetTally(); b.forEach(function (I) { S.tally++; if (I.covers) S.cover++; S.halfSum += I.half; }); S.lastBatch = b; }
  function go100() { S.batch = makeBatch(); tallyBatch(S.batch); S.shown = reduced ? 100 : 0; up(); }
  $('ec3-go').addEventListener('click', function () { S.userDrew = true; go100(); });
  $('ec3-k').addEventListener('click', function () { for (var i = 0; i < 9; i++) tallyBatch(makeBatch()); go100(); S.shown = 100; up(); });
  $('ec3-clear').addEventListener('click', changed); $('ec3-reset').addEventListener('click', changed);
  var runBtn = $('ec3-run');
  function setRun(on) { S.run = on; runBtn.textContent = on ? '❚❚' : '▶'; runBtn.setAttribute('aria-label', on ? 'Stop the machine' : 'Run the machine continuously'); runBtn.setAttribute('aria-pressed', String(on)); }
  runBtn.addEventListener('click', function () { S.userDrew = true; setRun(!S.run); if (S.run && S.shown >= 100) go100(); });
  function crit() { return MOD.crit(S.level, S.method, S.n); }
  function up() {
    var rows = [], b = S.batch, shown = M.min(S.shown, b.length), bc = 0;
    for (var i = 0; i < shown; i++) if (b[i].covers) bc++;
    rows.push(['Confidence level', pct(S.level, S.level === 0.999 ? 1 : 0)]);
    rows.push(['Critical value', (S.method === 't' ? 't* = ' : 'z* = ') + fmt(crit(), 3)]);
    rows.push(['This batch', shown ? bc + ' of ' + shown + ' cover μ' : '—']);
    rows.push(['All intervals so far', S.tally ? num(S.cover) + ' of ' + num(S.tally) : '—']);
    rows.push(['Long-run coverage', S.tally ? pct(S.cover / S.tally, 1) : '—']);
    rows.push(['Average margin of error', S.tally ? '±' + fmt(S.halfSum / S.tally, 2) + ' min' : '—']);
    dl(readEl, rows);
    hud.innerHTML = shown ? 'This batch: <b>' + bc + ' of ' + shown + '</b> cover μ = ' + MU + (S.tally ? '<br>All so far: <b>' + pct(S.cover / S.tally, 1) + '</b> of ' + num(S.tally) : '') : 'Press “Draw 100 intervals”';
    draw(); check();
  }
  function draw() {
    G.fit(); var W = G.w, H = G.h, small = W < 560; c.clearRect(0, 0, W, H); c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
    var x0 = small ? 12 : 22, x1 = W - (small ? 12 : 22), top = small ? 74 : 62, gh = 56, bot = H - gh - 30;
    var se = S.sigma / M.sqrt(S.n), hr = M.max(4 * se, 1.25 * crit() * se * (S.method === 'zk' ? 1 : 0.95)), lo = MU - hr, hi = MU + hr;
    function X(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }
    // grid and axis
    var t = ES.niceTicks(lo, hi, small ? 5 : 8);
    t.ticks.forEach(function (v) { if (v < lo || v > hi) return; var x = M.round(X(v)) + 0.5; c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(x, top); c.lineTo(x, bot); c.stroke(); });
    ticks(c, x0, x1, bot + 4, lo, hi, small ? 5 : 8);
    c.fillStyle = C.ink; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText('minutes →', x1, bot + 17);
    // true mean
    var mx = X(MU); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, top - 8); c.lineTo(mx, bot); c.stroke();
    c.fillStyle = C.gold; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('true mean μ = ' + MU, mx, top - 10);
    // the intervals
    var b = S.batch, rh = (bot - top - 4) / 100, shown = M.min(S.shown, b.length);
    for (var i = 0; i < shown; i++) {
      var I = b[i], y = top + 2 + (i + 0.5) * rh, fall = (S.shown - i) < 1 ? (1 - (S.shown - i)) : 0;
      y -= fall * 30; var col = I.covers ? C.green : C.red, a = M.max(lo, I.lo), z = M.min(hi, I.hi);
      c.strokeStyle = col; c.globalAlpha = 1 - fall; c.lineWidth = M.max(1.2, M.min(3, rh * 0.6)); c.beginPath(); c.moveTo(X(a), y); c.lineTo(X(z), y); c.stroke();
      if (I.lo < lo) { c.beginPath(); c.moveTo(X(lo) + 5, y - 3); c.lineTo(X(lo), y); c.lineTo(X(lo) + 5, y + 3); c.stroke(); }
      if (I.hi > hi) { c.beginPath(); c.moveTo(X(hi) - 5, y - 3); c.lineTo(X(hi), y); c.lineTo(X(hi) - 5, y + 3); c.stroke(); }
      c.fillStyle = C.ink; c.beginPath(); c.arc(X(clamp(I.mean, lo, hi)), y, M.max(1.2, M.min(2.4, rh * 0.45)), 0, 6.2832); c.fill(); c.globalAlpha = 1;
    }
    // the long-run gauge, 80% to 100%
    var gy = H - gh, gx0 = x0, gx1 = x1, g0 = 0.8, g1 = 1;
    function GX(v) { return gx0 + (clamp(v, g0, g1) - g0) / (g1 - g0) * (gx1 - gx0); }
    c.fillStyle = C.ink; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText('Long-run coverage' + (S.tally ? ': ' + pct(S.cover / S.tally, 1) + ' of ' + num(S.tally) + ' intervals' : ''), gx0, gy + 2);
    c.fillStyle = 'rgba(11,27,39,.95)'; c.fillRect(gx0, gy + 20, gx1 - gx0, 12);
    if (S.tally) { var cr = S.cover / S.tally; c.fillStyle = M.abs(cr - S.level) < 0.015 ? C.green : C.red; c.fillRect(gx0, gy + 20, GX(cr) - gx0, 12); }
    var nx = GX(S.level); c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(nx, gy + 16); c.lineTo(nx, gy + 36); c.stroke();
    ticks(c, gx0, gx1, gy + 36, g0, g1, 4, function (v) { return fmt(100 * v, 0) + '%'; });
  }
  // missions
  var MIS = [
    { id: 'first', title: 'The first hundred', goal: 'Draw 100 intervals at 95%. About 95 should catch the gold line. Count the red ones.' },
    { id: 'long', title: 'In the long run', goal: 'With the t method and a normal population at 95%, collect 1,000 intervals. Coverage lands between 94% and 96%.' },
    { id: 'pin', title: 'Pin it down', goal: 'Get the average margin of error at 95% below ±1 minute. Bigger samples, or a less spread-out population?' },
    { id: 'sure', title: 'Ninety-nine percent sure', goal: 'At 99%, collect 500 intervals. At least 98.5% cover, and the intervals are wider. Nothing is free.' },
    { id: 'naive', title: 'Too sure of yourself', goal: 'With n of 5 or less, use “z with s” and collect 500 intervals. Coverage falls below 90%.' },
    { id: 'student', title: 'Student to the rescue', goal: 'Same small n (5 or less), normal population, the t method: 1,000 intervals cover 93.5% to 96.5% of the time.' },
    { id: 'skew', title: 'Small and skewed', goal: 'Skewed population, n of 5 or less, the t method, 1,000 intervals: coverage drops below 93%. The t method assumes normal data.' },
    { id: 'heal', title: 'Big samples heal', goal: 'Skewed population again, but n of 100 or more: over 2,000 intervals, coverage climbs back above 93.5%.' }
  ];
  var mis = L.missions($('ec3-missions'), SLUG, MIS, function (id) {
    bringIntoView(view);
    var set = { first: ['normal', 10, 0.95, 't'], long: ['normal', 10, 0.95, 't'], pin: ['normal', 100, 0.95, 't'], sure: ['normal', 10, 0.99, 't'], naive: ['normal', 4, 0.95, 'zs'], student: ['normal', 4, 0.95, 't'], skew: ['skewed', 4, 0.95, 't'], heal: ['skewed', 100, 0.95, 't'] }[id];
    S.pop = set[0]; S.n = set[1]; S.level = set[2]; S.method = set[3]; markPop(S.pop); markLv(String(S.level)); markMe(S.method); nEl.value = NS.indexOf(S.n); $('ec3-n-o').textContent = 'n = ' + S.n; changed();
  });
  function win(id, text) { if (mis.done(id)) { L.toast(view, '✓ ' + text); celebrate(view); } }
  function check() {
    var cr = S.tally ? S.cover / S.tally : NaN, hw = S.tally ? S.halfSum / S.tally : NaN;
    if (S.userDrew && S.shown >= 100 && S.level === 0.95 && S.lastBatch) { var k = S.lastBatch.filter(function (I) { return I.covers; }).length; win('first', k + ' of 100 caught the true mean. ' + (100 - k) + ' missed, by bad luck alone.'); }
    if (S.method === 't' && S.pop === 'normal' && S.level === 0.95 && S.tally >= 1000 && cr >= 0.94 && cr <= 0.96) win('long', pct(cr, 1) + ' of ' + num(S.tally) + '. That is what “95% confidence” means.');
    if (S.level === 0.95 && S.tally >= 100 && hw < 1) win('pin', 'Margin ±' + fmt(hw, 2) + ' minutes: precision comes from n and σ, as σ/√n.');
    if (S.level === 0.99 && S.tally >= 500 && cr >= 0.985) win('sure', pct(cr, 1) + ' cover, with a margin of ±' + fmt(hw, 1) + ' minutes.');
    if (S.n <= 5 && S.method === 'zs' && S.tally >= 500 && cr < 0.9) win('naive', 'Only ' + pct(cr, 1) + '. Using s as if it were σ makes intervals too narrow.');
    if (S.n <= 5 && S.method === 't' && S.pop === 'normal' && S.level === 0.95 && S.tally >= 1000 && cr >= 0.935 && cr <= 0.965) win('student', pct(cr, 1) + ' with t* = ' + fmt(crit(), 2) + ' instead of 1.96.');
    if (S.n <= 5 && S.method === 't' && S.pop === 'skewed' && S.level === 0.95 && S.tally >= 1000 && cr < 0.93) win('skew', 'Only ' + pct(cr, 1) + '. Tiny samples from lopsided data fool the t method.');
    if (S.n >= 100 && S.method === 't' && S.pop === 'skewed' && S.level === 0.95 && S.tally >= 2000 && cr > 0.935) win('heal', pct(cr, 1) + '. The central limit theorem rescues the interval.');
  }
  L.loop(function (dt) {
    var busy = false;
    if (S.shown < S.batch.length) { S.shown = M.min(S.batch.length, S.shown + dt * 55); busy = true; if (S.shown >= S.batch.length) { S.hold = 0.7; up(); return; } }
    else if (S.run) { S.hold = (S.hold || 0) - dt; if (S.hold <= 0) { go100(); busy = true; } }
    if (busy) { draw(); var b = S.batch, k = 0, sh = M.floor(S.shown); for (var i = 0; i < sh; i++) if (b[i].covers) k++; hud.innerHTML = 'This batch: <b>' + k + ' of ' + sh + '</b> cover μ = ' + MU + (S.tally ? '<br>All so far: <b>' + pct(S.cover / S.tally, 1) + '</b> of ' + num(S.tally) : ''); }
  }, view);
  cv.addEventListener('keydown', function (e) { if (e.key === 'Enter') { S.userDrew = true; go100(); } else if (e.key === ' ') { e.preventDefault(); setRun(!S.run); if (S.run && S.shown >= 100) go100(); } else if (e.key === 'c' || e.key === 'C') changed(); });
  window.addEventListener('resize', function () { G.fit(); draw(); });
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);
  setRun(false); resetTally(); go100();   // a first batch draws itself as soon as the machine is on screen

  /* =========================================================================================
     2. The dartboard of estimators
     ========================================================================================= */
  (function () {
    var v2 = $('ec3d-view'), cv2 = $('ec3d-cv'); if (!v2) return;
    var G2 = L.canvas(cv2), c2 = G2.c, r2 = ES.rng(41), read2 = $('ec3d-read');
    var D = { n: 10, lam: 0.5, darts: [[], [], [], []], fly: [] };
    var COLS = [C.green, C.blue, C.gold, C.pink];
    function clear() { D.darts = [[], [], [], []]; D.fly = []; up2(); }
    $('ec3d-n').addEventListener('input', function (e) { D.n = +e.target.value; $('ec3d-n-o').textContent = 'n = ' + D.n; clear(); });
    $('ec3d-l').addEventListener('input', function (e) { D.lam = +e.target.value; $('ec3d-l-o').textContent = 'keep ' + fmt(100 * D.lam, 0) + '% of the data'; clear(); });
    function throwK(k) {
      for (var j = 0; j < k; j++) MOD.ESTS.forEach(function (E, i) { var d = E.est(r2, D.n, D.lam); D.darts[i].push(d); if (!reduced && k <= 10) D.fly.push({ i: i, d: d, t: 0 }); });
      up2();
    }
    $('ec3d-1').addEventListener('click', function () { throwK(1); });
    $('ec3d-10').addEventListener('click', function () { throwK(10); });
    $('ec3d-200').addEventListener('click', function () { throwK(200); });
    $('ec3d-clear').addEventListener('click', clear);
    var MIS2 = [
      { id: 'tight', title: 'Tight and true', goal: 'With n of 50 or more, throw 200 rounds. The sample mean’s darts cluster within 0.2 of the bullseye.' },
      { id: 'first', title: 'Unbiased but useless', goal: 'Throw 200 rounds with n of 50 or more. “First person only” is still centered on the bullseye, but its spread hasn’t shrunk at all.' },
      { id: 'trade', title: 'A good kind of bias', goal: 'With n of 5 or less, throw 200 rounds and find the shrunk estimator beating the sample mean on root mean squared error.' },
      { id: 'vol', title: 'More data, same mistake', goal: 'With n of 100, throw 200 rounds. The volunteers’ darts are tight, and tightly wrong: bias above 0.5.' }
    ];
    var mis2 = L.missions($('ec3d-missions'), SLUG + '-darts', MIS2, function (id) {
    bringIntoView(v2);
      D.n = { tight: 50, first: 50, trade: 4, vol: 100 }[id]; $('ec3d-n').value = D.n; $('ec3d-n-o').textContent = 'n = ' + D.n; clear();
    });
    function win2(id, text) { if (mis2.done(id)) { L.toast(v2, '✓ ' + text); celebrate(v2); } }
    function up2() {
      var st = D.darts.map(MOD.dartStats), k = D.darts[0].length;
      dl(read2, MOD.ESTS.map(function (E, i) { var s = st[i]; return ['<i style="color:' + COLS[i] + '" aria-hidden="true">●</i> ' + E.name, s ? 'bias ' + fmt(s.bias, 2) + ' · sd ' + fmt(s.sd, 2) + ' · rmse ' + fmt(s.rmse, 2) : '—']; }));
      if (k >= 200 && D.n >= 50 && st[0].rmse < 0.2) win2('tight', 'Root mean squared error ' + fmt(st[0].rmse, 3) + ': unbiased and consistent.');
      if (k >= 200 && D.n >= 50 && st[1].bias < 0.25 && st[1].sd > 1) win2('first', 'Centered (bias ' + fmt(st[1].bias, 2) + ') but spread ' + fmt(st[1].sd, 2) + ', whatever n is. Unbiased, not consistent.');
      if (k >= 200 && D.n <= 5 && st[2].rmse < st[0].rmse) win2('trade', 'Shrunk: rmse ' + fmt(st[2].rmse, 2) + ' vs the mean’s ' + fmt(st[0].rmse, 2) + '. A little bias bought a lot less variance.');
      if (k >= 200 && D.n >= 100 && st[3].bias > 0.5) win2('vol', 'Bias ' + fmt(st[3].bias, 2) + ' with spread only ' + fmt(st[3].sd, 2) + '. A bigger biased sample is still biased.');
      draw2();
    }
    function draw2() {
      G2.fit(); var W = G2.w, H = G2.h; c2.clearRect(0, 0, W, H); c2.fillStyle = C.bg; c2.fillRect(0, 0, W, H);
      var cols = W >= 640 ? 4 : 2, rows = 4 / cols, cw = W / cols, ch = H / rows;
      MOD.ESTS.forEach(function (E, i) {
        var cx = (i % cols) * cw + cw / 2, cy = M.floor(i / cols) * ch + ch / 2 + 8, R = M.min(cw, ch - 40) / 2 - 8, unit = R / 2.4;
        c2.fillStyle = C.ink; c2.font = '600 12px system-ui,sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'top'; c2.fillText(E.name, cx, cy - R - 26);
        [2.4, 1.8, 1.2, 0.6].forEach(function (rr, j) { c2.fillStyle = j % 2 ? 'rgba(11,27,39,1)' : 'rgba(20,40,55,1)'; c2.beginPath(); c2.arc(cx, cy, rr * unit, 0, 6.2832); c2.fill(); });
        c2.strokeStyle = C.grid; c2.lineWidth = 1; c2.beginPath(); c2.moveTo(cx - R, cy); c2.lineTo(cx + R, cy); c2.moveTo(cx, cy - R); c2.lineTo(cx, cy + R); c2.stroke();
        c2.fillStyle = C.red; c2.beginPath(); c2.arc(cx, cy, M.max(3, unit * 0.12), 0, 6.2832); c2.fill();
        var ds = D.darts[i], start = M.max(0, ds.length - 400);
        for (var j = start; j < ds.length; j++) { var d = ds[j], fl = D.fly.filter(function (f) { return f.d === d; })[0]; if (fl) continue; c2.fillStyle = COLS[i]; c2.globalAlpha = 0.75; c2.beginPath(); c2.arc(cx + clamp(d[0], -2.6, 2.6) * unit, cy - clamp(d[1], -2.6, 2.6) * unit, 2.6, 0, 6.2832); c2.fill(); }
        c2.globalAlpha = 1;
        var s = MOD.dartStats(ds); if (s) { c2.strokeStyle = '#fff'; c2.lineWidth = 2; var ax = cx + s.mx * unit, ay = cy - s.my * unit; c2.beginPath(); c2.moveTo(ax - 6, ay); c2.lineTo(ax + 6, ay); c2.moveTo(ax, ay - 6); c2.lineTo(ax, ay + 6); c2.stroke(); }
        D.fly.forEach(function (f) { if (f.i !== i) return; var e = 1 - M.pow(1 - f.t, 3), sx = cx + R * 1.4, sy = cy + R * 1.2, tx = cx + clamp(f.d[0], -2.6, 2.6) * unit, ty = cy - clamp(f.d[1], -2.6, 2.6) * unit; c2.fillStyle = COLS[i]; c2.beginPath(); c2.arc(sx + (tx - sx) * e, sy + (ty - sy) * e, 3.5, 0, 6.2832); c2.fill(); });
      });
    }
    L.loop(function (dt) { if (!D.fly.length) return; D.fly.forEach(function (f) { f.t += dt * 2.2; }); D.fly = D.fly.filter(function (f) { return f.t < 1; }); draw2(); }, v2);
    window.addEventListener('resize', function () { G2.fit(); draw2(); });
    if (window.ResizeObserver) new ResizeObserver(function () { draw2(); }).observe(cv2);
    throwK(10);
  })();

  /* =========================================================================================
     3. Hypothesis tests and power
     ========================================================================================= */
  (function () {
    var v3 = $('ec3t-view'), cv3 = $('ec3t-cv'); if (!v3) return;
    var G3 = L.canvas(cv3), c3 = G3.c, read3 = $('ec3t-read'), r3 = ES.rng(5);
    var T = { d: 0.3, n: 30, alpha: 0.05, sided: 2, z: 1.2, sims: null };
    function bind(id, key, f) { var el = $(id); el.addEventListener('input', function () { T[key] = +el.value; $(id + '-o').textContent = f(T[key]); T.sims = null; up3(); }); $(id + '-o').textContent = f(T[key]); }
    bind('ec3t-d', 'd', function (v) { return v ? fmt(v, 2) + ' sd' : '0 (the null is true)'; });
    bind('ec3t-n', 'n', function (v) { return 'n = ' + v; });
    bind('ec3t-z', 'z', function (v) { return 'z = ' + fmt(v, 2); });
    seg($('ec3t-a'), 'data-a', '0.05', function (a) { T.alpha = +a; T.sims = null; up3(); });
    seg($('ec3t-s'), 'data-s', '2', function (s) { T.sided = +s; T.sims = null; up3(); });
    $('ec3t-run').addEventListener('click', function () {
      var del = T.d * M.sqrt(T.n), zc = MOD.zcrit(T.alpha, T.sided), rej = 0, zs = [];
      for (var i = 0; i < 1000; i++) { var z = del + r3.n(); zs.push(z); if (T.sided === 2 ? M.abs(z) > zc : z > zc) rej++; }
      T.sims = { rej: rej, zs: zs, d: T.d }; up3();
    });
    var MIS3 = [
      { id: 'p05', title: 'Right at the line', goal: 'Two-sided test at 5%: drag the observed z until the p-value is between 0.045 and 0.055.' },
      { id: 'alpha', title: 'False alarms on schedule', goal: 'Set the true effect to 0 and run 1,000 studies. About α of them still reject: within 2 points of α.' },
      { id: 'power80', title: 'Plan a study', goal: 'For an effect of 0.3 sd, a two-sided test at 5%: find the smallest n with power of at least 80%.' },
      { id: 'tiny', title: 'Significant, but tiny', goal: 'An effect of 0.1 sd or less, n of 400 or more: power above 50%. Statistically significant is not the same as important.' }
    ];
    var mis3 = L.missions($('ec3t-missions'), SLUG + '-test', MIS3, function (id) {
    bringIntoView(v3);
      var set = { p05: [0.3, 30, 1.2], alpha: [0, 30, 1.2], power80: [0.3, 30, 1.2], tiny: [0.1, 100, 1.2] }[id];
      T.d = set[0]; T.n = set[1]; T.z = set[2]; T.sims = null;
      ['d', 'n', 'z'].forEach(function (k) { var el = $('ec3t-' + k); el.value = T[k]; el.dispatchEvent(new Event('input')); });
    });
    function win3(id, text) { if (mis3.done(id)) { L.toast(v3, '✓ ' + text); celebrate(v3); } }
    function up3() {
      var pw = MOD.power(T.d, T.n, T.alpha, T.sided), zc = MOD.zcrit(T.alpha, T.sided), p = MOD.pvalue(T.z, T.sided), rej = T.sided === 2 ? M.abs(T.z) > zc : T.z > zc, rows = [];
      rows.push(['Critical value', (T.sided === 2 ? '±' : '') + fmt(zc, 3)]);
      rows.push(['p-value for your z', fmt(p, 4)]);
      rows.push(['Decision at α = ' + T.alpha, rej ? '<b class="ec3-rej">reject H₀</b>' : 'don’t reject H₀']);
      rows.push(['Type I error rate (α)', pct(T.alpha, 0)]);
      rows.push(['Power if the effect is ' + fmt(T.d, 2) + ' sd', T.d ? pct(pw, 1) : '— (no effect)']);
      rows.push(['Type II error rate (β)', T.d ? pct(1 - pw, 1) : '—']);
      if (T.sims) rows.push(['1,000 simulated studies', T.sims.rej + ' rejected (' + pct(T.sims.rej / 1000, 1) + ')']);
      dl(read3, rows);
      if (T.sided === 2 && T.alpha === 0.05 && p >= 0.045 && p <= 0.055) win3('p05', 'p = ' + fmt(p, 3) + ' at |z| = ' + fmt(M.abs(T.z), 2) + '. The famous 1.96 again.');
      if (T.sims && T.sims.d === 0 && M.abs(T.sims.rej / 1000 - T.alpha) <= 0.02) win3('alpha', T.sims.rej + ' of 1,000 rejected a true null: about α, as promised.');
      if (T.d >= 0.29 && T.d <= 0.31 && T.sided === 2 && T.alpha === 0.05 && pw >= 0.8 && MOD.power(T.d, T.n - 1, T.alpha, 2) < 0.8) win3('power80', 'n = ' + T.n + ' gives ' + pct(pw, 1) + ' power. Smaller samples would usually miss it.');
      if (T.d > 0 && T.d <= 0.1 && T.n >= 400 && pw > 0.5) win3('tiny', 'Power ' + pct(pw, 0) + ' for an effect of only ' + fmt(T.d, 2) + ' sd.');
      draw3(pw, zc, p);
    }
    function nd(x, m) { return ES.normPdf(x - m); }
    function draw3(pw, zc, p) {
      G3.fit(); var W = G3.w, H = G3.h, small = W < 560; c3.clearRect(0, 0, W, H); c3.fillStyle = C.bg; c3.fillRect(0, 0, W, H);
      var del = T.d * M.sqrt(T.n), lo = -4.2, hi = M.max(4.2, del + 3.6), x0 = small ? 12 : 22, x1 = W - (small ? 12 : 22);
      var top = 44, pH = M.round((H - 60) * (small ? 0.56 : 0.6)), base = top + pH;
      function X(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); } function Y(v) { return base - v / 0.42 * (pH - 6); }
      function area(m, a, b, col) { a = M.max(a, lo); b = M.min(b, hi); if (b <= a) return; c3.fillStyle = col; c3.beginPath(); c3.moveTo(X(a), base); for (var i = 0; i <= 80; i++) { var x = a + (b - a) * i / 80; c3.lineTo(X(x), Y(nd(x, m))); } c3.lineTo(X(b), base); c3.closePath(); c3.fill(); }
      function curve(m, col, dash) { c3.strokeStyle = col; c3.lineWidth = 2.2; c3.setLineDash(dash || []); c3.beginPath(); for (var i = 0; i <= 300; i++) { var x = lo + (hi - lo) * i / 300; if (i) c3.lineTo(X(x), Y(nd(x, m))); else c3.moveTo(X(x), Y(nd(x, m))); } c3.stroke(); c3.setLineDash([]); }
      // under the alternative: power (green) in the rejection region, β (gray) in the acceptance region
      if (T.d) { area(del, zc, hi, 'rgba(99,230,190,.28)'); if (T.sided === 2) area(del, lo, -zc, 'rgba(99,230,190,.28)'); area(del, T.sided === 2 ? -zc : lo, zc, 'rgba(143,179,198,.16)'); }
      // under the null: α (red) in the rejection region(s)
      area(0, zc, hi, 'rgba(255,135,135,.55)'); if (T.sided === 2) area(0, lo, -zc, 'rgba(255,135,135,.55)');
      // p-value: the tail(s) beyond the observed z
      var az = M.abs(T.z); if (T.sided === 2) { area(0, az, hi, 'rgba(255,212,121,.45)'); area(0, lo, -az, 'rgba(255,212,121,.45)'); } else area(0, T.z, hi, 'rgba(255,212,121,.45)');
      curve(0, C.blue); if (T.d) curve(del, C.pink, [7, 5]);
      c3.strokeStyle = C.axis; c3.lineWidth = 1; c3.beginPath(); c3.moveTo(x0, base + 0.5); c3.lineTo(x1, base + 0.5); c3.stroke();
      ticks(c3, x0, x1, base + 4, lo, hi, small ? 6 : 10);
      // critical values and the observed z
      [zc].concat(T.sided === 2 ? [-zc] : []).forEach(function (v) { var x = X(v); c3.strokeStyle = C.red; c3.setLineDash([4, 3]); c3.lineWidth = 1.5; c3.beginPath(); c3.moveTo(x, top); c3.lineTo(x, base); c3.stroke(); c3.setLineDash([]); });
      var zx = X(clamp(T.z, lo, hi)); c3.strokeStyle = C.gold; c3.lineWidth = 2.5; c3.beginPath(); c3.moveTo(zx, top - 6); c3.lineTo(zx, base + 18); c3.stroke();
      c3.fillStyle = C.bg; c3.strokeStyle = C.gold; c3.lineWidth = 2; c3.beginPath(); c3.arc(zx, base + 26, 9, 0, 6.2832); c3.fill(); c3.stroke(); c3.fillStyle = C.gold; c3.font = '700 10px system-ui'; c3.textAlign = 'center'; c3.textBaseline = 'middle'; c3.fillText('z', zx, base + 26);
      // labels
      c3.font = '600 11px system-ui,sans-serif'; c3.textBaseline = 'top'; c3.textAlign = 'left';
      var lx = x0, items = [['H₀ true: no effect', C.blue], [T.d ? 'H₁ true: effect ' + fmt(T.d, 2) + ' sd' : '', C.pink], ['α', C.red], ['p-value ' + fmt(p, 3), C.gold], [T.d ? 'power ' + pct(pw, 0) : '', C.green]];
      items.forEach(function (it) { if (!it[0]) return; c3.fillStyle = it[1]; c3.fillRect(lx, 8, 9, 9); c3.fillStyle = C.ink; c3.fillText(it[0], lx + 13, 7); lx += c3.measureText(it[0]).width + 26; if (lx > x1 - 60 && small) lx = x1 + 999; });
      if (small) { lx = x0; items.slice(2).forEach(function (it) { if (!it[0]) return; c3.fillStyle = it[1]; c3.fillRect(lx, 24, 9, 9); c3.fillStyle = C.ink; c3.fillText(it[0], lx + 13, 23); lx += c3.measureText(it[0]).width + 22; }); }
      // simulated studies as a strip of ticks under the axis
      if (T.sims) { T.sims.zs.forEach(function (z) { if (z < lo || z > hi) return; var rj = T.sided === 2 ? M.abs(z) > zc : z > zc; c3.fillStyle = rj ? 'rgba(99,230,190,.5)' : 'rgba(143,179,198,.35)'; c3.fillRect(X(z), base + 40, 1.2, 8); }); }
      // the power curve
      var py0 = base + 76, ph = H - py0 - 26, px0 = x0 + 34, px1 = x1, dmax = 1;
      if (ph > 40) {
        function PX(d) { return px0 + (d + dmax) / (2 * dmax) * (px1 - px0); } function PY(v) { return py0 + ph - v * ph; }
        c3.fillStyle = C.ink; c3.font = '600 11px system-ui,sans-serif'; c3.textAlign = 'left'; c3.textBaseline = 'bottom'; c3.fillText('Power curve: chance of rejecting H₀, by true effect size', x0, py0 - 4);
        [0, 0.5, 1].forEach(function (v) { var y = PY(v); c3.strokeStyle = C.grid; c3.beginPath(); c3.moveTo(px0, y); c3.lineTo(px1, y); c3.stroke(); c3.fillStyle = C.text; c3.font = '10px system-ui'; c3.textAlign = 'right'; c3.textBaseline = 'middle'; c3.fillText(fmt(100 * v, 0) + '%', px0 - 4, y); });
        [-1, -0.5, 0, 0.5, 1].forEach(function (d) { c3.fillStyle = C.text; c3.font = '10px system-ui'; c3.textAlign = 'center'; c3.textBaseline = 'top'; c3.fillText(fmt(d, 1), PX(d), py0 + ph + 3); });
        function pcurve(n, col, w) { c3.strokeStyle = col; c3.lineWidth = w; c3.beginPath(); for (var i = 0; i <= 200; i++) { var d = -dmax + 2 * dmax * i / 200, v = MOD.power(d, n, T.alpha, T.sided); if (i) c3.lineTo(PX(d), PY(v)); else c3.moveTo(PX(d), PY(v)); } c3.stroke(); }
        pcurve(T.n * 4, 'rgba(116,192,252,.45)', 1.5); pcurve(T.n, C.green, 2.5);
        c3.strokeStyle = C.red; c3.setLineDash([3, 3]); c3.lineWidth = 1; c3.beginPath(); c3.moveTo(px0, PY(T.alpha)); c3.lineTo(px1, PY(T.alpha)); c3.stroke(); c3.setLineDash([]);
        c3.fillStyle = C.gold; c3.beginPath(); c3.arc(PX(T.d), PY(MOD.power(T.d, T.n, T.alpha, T.sided)), 5, 0, 6.2832); c3.fill();
        c3.fillStyle = 'rgba(116,192,252,.8)'; c3.font = '10px system-ui'; c3.textAlign = 'right'; c3.textBaseline = 'top'; c3.fillText('faint: 4× the sample', px1, py0 + 2);
      }
      T.lay = { X: X, lo: lo, hi: hi, base: base, x0: x0, x1: x1 };
    }
    var drag = false;
    function setZ(ev) { var r = cv3.getBoundingClientRect(), x = ev.clientX - r.left, L3 = T.lay; T.z = clamp(L3.lo + (x - L3.x0) / (L3.x1 - L3.x0) * (L3.hi - L3.lo), -4, 6); T.z = M.round(T.z * 100) / 100; var el = $('ec3t-z'); el.value = T.z; $('ec3t-z-o').textContent = 'z = ' + fmt(T.z, 2); up3(); }
    cv3.addEventListener('pointerdown', function (ev) { var r = cv3.getBoundingClientRect(), y = ev.clientY - r.top; if (T.lay && y < T.lay.base + 40) { drag = true; cv3.setPointerCapture(ev.pointerId); setZ(ev); } });
    cv3.addEventListener('pointermove', function (ev) { if (drag) setZ(ev); });
    cv3.addEventListener('pointerup', function () { drag = false; });
    cv3.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); T.z = clamp(T.z + (e.key === 'ArrowRight' ? 0.01 : -0.01) * (e.shiftKey ? 10 : 1), -4, 6); $('ec3t-z').value = T.z; $('ec3t-z-o').textContent = 'z = ' + fmt(T.z, 2); up3(); } });
    window.addEventListener('resize', function () { G3.fit(); up3(); });
    if (window.ResizeObserver) new ResizeObserver(function () { up3(); }).observe(cv3);
    up3();
  })();
})();
