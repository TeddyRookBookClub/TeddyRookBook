/* Econometrics, Chapter 1: What Econometrics Is. Two interactives:
   1. A beach town where hot weather drives both ice-cream sales and lifeguard calls. See the correlation, reveal
      the weather, hold it fixed or adjust for it with regression, and watch the link vanish (model.js, part 1).
   2. Sixteen students, each with a score with and without tutoring: let them choose, or flip coins (model.js, part 2). */
(function () {
  'use strict';
  var L = window.TRBLab, ES = window.EconStats, MOD = window.EC1Model, root = document.getElementById('ec1-lab');
  if (!L || !ES || !MOD || !root) return;
  function $(id) { return document.getElementById(id); }
  var M = Math, fmt = ES.fmt, reduced = L.reduced;
  var C = { bg: '#06111a', bg2: '#0b1b27', grid: 'rgba(120,170,200,.13)', axis: 'rgba(143,179,198,.55)', text: '#8fb3c6', ink: '#dbe7ef', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sgn(v, d) { return (v > 0 ? '+' : '') + fmt(v, d); }
  function num(v) { return M.round(v).toLocaleString('en-US'); }
  function frame(x0, y0, w, h, xlo, xhi, ylo, yhi) {
    return { x0: x0, y0: y0, w: w, h: h, xlo: xlo, xhi: xhi, ylo: ylo, yhi: yhi,
      X: function (v) { return x0 + (v - xlo) / (xhi - xlo) * w; }, Y: function (v) { return y0 + h - (v - ylo) / (yhi - ylo) * h; },
      iX: function (p) { return xlo + (p - x0) / w * (xhi - xlo); }, iY: function (p) { return ylo + (y0 + h - p) / h * (yhi - ylo); } };
  }
  function axes(c, F, o) {
    o = o || {};
    var xt = ES.niceTicks(F.xlo, F.xhi, o.nx || 6).ticks, yt = ES.niceTicks(F.ylo, F.yhi, o.ny || 5).ticks, fx = o.fx || num, fy = o.fy || num;
    c.save(); c.lineWidth = 1; c.font = '11px system-ui,sans-serif'; c.fillStyle = C.text;
    xt.forEach(function (v) {
      if (v < F.xlo - 1e-9 || v > F.xhi + 1e-9) return; var x = M.round(F.X(v)) + 0.5;
      c.strokeStyle = v === 0 && o.zero ? C.axis : C.grid; c.beginPath(); c.moveTo(x, F.y0); c.lineTo(x, F.y0 + F.h); c.stroke();
      c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(fx(v), x, F.y0 + F.h + 4);
    });
    yt.forEach(function (v) {
      if (v < F.ylo - 1e-9 || v > F.yhi + 1e-9) return; var y = M.round(F.Y(v)) + 0.5;
      c.strokeStyle = v === 0 && o.zero ? C.axis : C.grid; c.beginPath(); c.moveTo(F.x0, y); c.lineTo(F.x0 + F.w, y); c.stroke();
      c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(fy(v), F.x0 - 5, y);
    });
    c.strokeStyle = C.axis; c.beginPath(); c.moveTo(F.x0 + 0.5, F.y0); c.lineTo(F.x0 + 0.5, F.y0 + F.h + 0.5); c.lineTo(F.x0 + F.w, F.y0 + F.h + 0.5); c.stroke();
    c.font = '600 12px system-ui,sans-serif'; c.fillStyle = C.ink;
    if (o.xl) { c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText(o.xl, F.x0 + F.w, F.y0 + F.h + 18); }
    if (o.yl) { c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(o.yl, F.x0 + 6, F.y0 + 2); }
    c.restore();
  }
  function seg(el, attr, cur, fn) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); fn(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }
  function celebrate(el) { if (reduced || !el) return; el.classList.remove('ec1-win'); void el.offsetWidth; el.classList.add('ec1-win'); setTimeout(function () { el.classList.remove('ec1-win'); }, 1300); }
  function bringIntoView(el) { if (!el) return; var r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > (window.innerHeight || 800)) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
  // temperature colors: blue (cool) → gold → red (hot)
  var TST = [[14, [116, 192, 252]], [24, [255, 212, 121]], [34, [255, 135, 135]]];
  function tcol(t, a) {
    var s = TST, i = 0; if (t <= s[0][0]) i = 0; else if (t >= s[2][0]) i = 1; else i = t < s[1][0] ? 0 : 1;
    var f = clamp((t - s[i][0]) / (s[i + 1][0] - s[i][0]), 0, 1), A = s[i][1], B = s[i + 1][1];
    return 'rgba(' + M.round(A[0] + f * (B[0] - A[0])) + ',' + M.round(A[1] + f * (B[1] - A[1])) + ',' + M.round(A[2] + f * (B[2] - A[2])) + ',' + (a === undefined ? 1 : a) + ')';
  }

  /* =========================================================================================
     1. The beach town
     ========================================================================================= */
  var SLUG = 'econ-what-is-econometrics', store = L.store(SLUG);
  var view = $('ec1-view'), cv = $('ec1-cv'), G = L.canvas(cv), c = G.c, hud = $('ec1-hud'), readEl = $('ec1-read');
  var PRE = {
    classic: { n: 92, amp: 12, bS: 25, bR: 1.2, theta: 0 },
    cool: { n: 92, amp: 1, bS: 25, bR: 1.2, theta: 0 },
    real: { n: 184, amp: 12, bS: 25, bR: 1.2, theta: 2 },
    dry: { n: 92, amp: 12, bS: 25, bR: 0, theta: 0 }
  };
  var P = Object.assign({}, PRE.classic), seed = 11, V = 'all', reveal = false, band = { c: 25, w: 3 };
  var D, A, k = 0, playing = false, disp = null, rng0 = null, hover = -1, lastDone = 0;

  var fields = {};
  function bindField(id, key, f, after) {
    var el = $(id), out = $(id + '-o');
    function show() { out.textContent = f(+el.value); }
    el.addEventListener('input', function () { P[key] = +el.value; show(); if (after) after(); else regen(false); markPre(null); });
    fields[key] = { el: el, show: show };
  }
  bindField('ec1-n', 'n', function (v) { return v + ' days'; }, function () { regen(false); });
  bindField('ec1-amp', 'amp', function (v) { return '±' + fmt(v / 2, 1) + ' °C'; });
  bindField('ec1-bs', 'bS', function (v) { return '+' + fmt(v, 0) + ' cones per °C'; });
  bindField('ec1-br', 'bR', function (v) { return '+' + fmt(v, 1) + ' calls per °C'; });
  bindField('ec1-th', 'theta', function (v) { return v ? '+' + fmt(v, 1) + ' calls per 100 cones' : 'none (0)'; });
  function syncFields() { Object.keys(fields).forEach(function (key) { fields[key].el.value = P[key]; fields[key].show(); }); }
  var markPre = seg($('ec1-pre'), 'data-pre', 'classic', function (p) { P = Object.assign({}, PRE[p]); syncFields(); regen(true); });
  var markView = seg($('ec1-vw'), 'data-v', V, function (v) { setView(v); });
  var revealBox = $('ec1-reveal');
  revealBox.addEventListener('change', function () { reveal = revealBox.checked; draw(); check(); });
  var bandC = $('ec1-bc'), bandW = $('ec1-bw');
  function bandShow() { $('ec1-bc-o').textContent = fmt(band.c - band.w / 2, 1) + ' to ' + fmt(band.c + band.w / 2, 1) + ' °C'; $('ec1-bw-o').textContent = fmt(band.w, 1) + ' °C wide'; }
  bandC.addEventListener('input', function () { band.c = +bandC.value; bandShow(); analyze(); });
  bandW.addEventListener('input', function () { band.w = +bandW.value; bandShow(); analyze(); });
  function setBand(cn) { band.c = clamp(M.round(cn * 2) / 2, 14, 36); bandC.value = band.c; bandShow(); analyze(); }
  function setView(v) {
    V = v; markView(v);
    $('ec1-bandf').hidden = v !== 'hold';
    if (v === 'hold' && !reveal) { reveal = true; revealBox.checked = true; }
    if (D) { retarget(); analyze(); }
  }

  function regen(replay) {
    D = MOD.town(P, seed);
    if (replay) { k = reduced ? D.S.length : 0; playing = !reduced; } else { k = D.S.length; playing = false; }
    retarget(replay); analyze();
  }
  function analyze() {
    var n = M.max(0, M.min(D.S.length, M.floor(k)));
    A = MOD.analyze(D, n, [band.c - band.w / 2, band.c + band.w / 2]);
    readouts(); draw(); check();
  }
  // display positions glide toward their targets: raw (cones, calls) or adjusted (residuals)
  var R = null;
  function retarget(snap) {
    var full = MOD.analyze(D), n = D.S.length, tx = [], ty = [];
    for (var i = 0; i < n; i++) {
      if (V === 'adj' && full.resS) { tx.push(full.resS[i]); ty.push(full.resR[i]); } else { tx.push(D.S[i]); ty.push(D.R[i]); }
    }
    var xr, yr;
    if (V === 'adj' && full.resS) {
      var mx = M.max.apply(null, tx.map(M.abs)) * 1.08 || 1, my = M.max.apply(null, ty.map(M.abs)) * 1.12 || 1;
      xr = [-mx, mx]; yr = [-my, my];
    } else {
      var hx = ES.niceTicks(0, M.max(100, M.max.apply(null, tx) * 1.04), 6), hy = ES.niceTicks(0, M.max(5, M.max.apply(null, ty) + 2), 5);
      xr = [0, hx.hi]; yr = [0, hy.hi];
    }
    if (!disp || snap || reduced || disp.x.length !== n) {
      disp = { x: tx.slice(), y: ty.slice(), r: xr.concat(yr) };
    }
    R = { x: tx, y: ty, r: xr.concat(yr), full: full };
  }

  function readouts() {
    var n = A.n, rows = [];
    rows.push(['Days so far', n + ' of ' + D.S.length]);
    rows.push(['Correlation, all days', isFinite(A.r) ? fmt(A.r, 2) : '—']);
    rows.push(['Slope, ignoring the weather', A.naive ? sgn(A.naive.b1 * 100, 1) + ' (se ' + fmt(A.naive.se1 * 100, 1) + ')' : '—']);
    rows.push(['Same temperature (' + fmt(band.c - band.w / 2, 1) + '–' + fmt(band.c + band.w / 2, 1) + ' °C)', A.bandN >= 3 && isFinite(A.bandR) ? 'r = ' + fmt(A.bandR, 2) + ' (' + A.bandN + ' days)' : A.bandN + ' days']);
    rows.push(['Slope, controlling for temperature', A.ctrl ? sgn(A.ctrl.b[1] * 100, 1) + ' (se ' + fmt(A.ctrl.se[1] * 100, 1) + ')' : '—']);
    rows.push(['The real effect you set', P.theta ? sgn(P.theta, 1) : '0']);
    dl(readEl, rows);
    var h = '';
    if (V === 'all') h = 'All days: <b>r = ' + (isFinite(A.r) ? fmt(A.r, 2) : '—') + '</b><br>slope ' + (A.naive ? sgn(A.naive.b1 * 100, 1) : '—') + ' calls per 100 cones';
    else if (V === 'hold') h = 'Only ' + fmt(band.c - band.w / 2, 1) + '–' + fmt(band.c + band.w / 2, 1) + ' °C: <b>r = ' + (A.bandN >= 3 && isFinite(A.bandR) ? fmt(A.bandR, 2) : '—') + '</b><br>' + A.bandN + ' days in the band';
    else h = 'Adjusted for temperature:<br><b>slope ' + (A.ctrl ? sgn(A.ctrl.b[1] * 100, 1) + ' ± ' + fmt(1.96 * A.ctrl.se[1] * 100, 1) : '—') + '</b> calls per 100 cones';
    hud.innerHTML = h;
    cv.setAttribute('data-r', isFinite(A.r) ? A.r.toFixed(3) : '');
  }

  // ---------- drawing ----------
  var LAY = null;
  function draw() {
    if (!D || !R) return;
    G.fit(); var W = G.w, H = G.h, small = W < 560; c.clearRect(0, 0, W, H); c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
    var n = D.S.length, kk = M.min(n, k), left = small ? 44 : 54;
    // ----- the summer strip: daily temperature bars, and 7-day averages of cones and calls -----
    var sh = clamp(H * 0.17, 56, 104), stTop = 48, Fs = frame(left, stTop, W - left - 14, sh, 0, M.max(n, 1), 0, 1);
    c.font = '600 11px system-ui,sans-serif'; c.textBaseline = 'top'; c.textAlign = 'left';
    var lx = 12, leg = small ? [['Temp.', C.gold], ['Cones', C.pink], ['Calls', C.blue]] : [['Temperature', C.gold], ['Cones sold (7-day avg.)', C.pink], ['Lifeguard calls (7-day avg.)', C.blue]];
    leg.forEach(function (it) { c.fillStyle = it[1]; c.fillRect(lx, 15, 9, 9); c.fillStyle = C.ink; c.fillText(it[0], lx + 13, 14); lx += c.measureText(it[0]).width + 24; });
    c.fillStyle = 'rgba(11,27,39,.9)'; c.fillRect(Fs.x0, Fs.y0, Fs.w, Fs.h);
    var tmin = 10, tmax = 40, bwid = Fs.w / M.max(n, 1);
    if (V === 'hold') { // the temperature band on the strip
      var by0 = Fs.y0 + Fs.h * (1 - ((band.c + band.w / 2) - tmin) / (tmax - tmin)), by1 = Fs.y0 + Fs.h * (1 - ((band.c - band.w / 2) - tmin) / (tmax - tmin));
      c.fillStyle = 'rgba(99,230,190,.14)'; c.fillRect(Fs.x0, by0, Fs.w, by1 - by0); c.strokeStyle = 'rgba(99,230,190,.6)'; c.strokeRect(Fs.x0 + 0.5, by0 + 0.5, Fs.w - 1, by1 - by0);
    }
    for (var i0 = 0; i0 < kk; i0++) { var hh0 = (D.T[i0] - tmin) / (tmax - tmin) * Fs.h; c.fillStyle = tcol(D.T[i0], 0.6); c.fillRect(Fs.x0 + i0 * bwid, Fs.y0 + Fs.h - hh0, M.max(1, bwid - (bwid > 3 ? 1 : 0)), hh0); }
    for (var sm = M.ceil(n / MOD.SUMMER) - 1; sm > 0; sm--) { var xs = Fs.x0 + sm * MOD.SUMMER * bwid; c.strokeStyle = C.axis; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(xs, Fs.y0); c.lineTo(xs, Fs.y0 + Fs.h); c.stroke(); c.setLineDash([]); }
    function ma(arr, hi, col) {
      if (kk < 2) return; c.beginPath();
      for (var i = 0; i < kk; i++) {
        var a0 = M.max(0, i - 3), a1 = M.min(kk - 1, i + 3), sum = 0; for (var j = a0; j <= a1; j++) sum += arr[j];
        var v = sum / (a1 - a0 + 1), x = Fs.x0 + (i + 0.5) * bwid, y = Fs.y0 + Fs.h * (1 - v / hi);
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.strokeStyle = 'rgba(6,17,26,.8)'; c.lineWidth = 4; c.stroke(); c.strokeStyle = col; c.lineWidth = 2; c.stroke();
    }
    ma(D.S, (M.max.apply(null, D.S) || 1) * 1.05, C.pink); ma(D.R, (M.max.apply(null, D.R) || 1) * 1.1, C.blue);
    if (kk < n && kk > 0) { var px = Fs.x0 + (kk - 0.5) * bwid; c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.moveTo(px, Fs.y0); c.lineTo(px, Fs.y0 + Fs.h); c.stroke(); c.font = '15px system-ui'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText(D.T[kk - 1] >= 27 ? '☀️' : D.T[kk - 1] >= 21 ? '⛅' : '☁️', px, Fs.y0 + 2); }
    c.fillStyle = C.text; c.font = '10px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText(n > MOD.SUMMER ? 'Day 1 … ' + n + ' (' + M.ceil(n / MOD.SUMMER) + ' summers)' : 'June 1 … ' + (n >= 92 ? 'August 31' : 'day ' + n), Fs.x0, Fs.y0 + Fs.h + 3);
    if (kk > 0) { c.textAlign = 'right'; c.fillText('day ' + kk + ': ' + fmt(D.T[kk - 1], 1) + ' °C', Fs.x0 + Fs.w, Fs.y0 + Fs.h + 3); }
    // ----- the scatter -----
    var top = stTop + sh + 30, r = disp.r, F = frame(left, top, W - left - 16, H - top - 40, r[0], r[1], r[2], r[3]);
    var adj = V === 'adj';
    axes(c, F, { zero: adj, xl: adj ? 'cones, beyond what the temperature predicts →' : 'ice-cream cones sold that day →', yl: adj ? '↑ calls, beyond what the temperature predicts' : '↑ lifeguard calls that day', fx: function (v) { return adj ? sgn(v, 0) : num(v); }, fy: function (v) { return adj ? sgn(v, 0) : num(v); } });
    // temperature key (and the band)
    if (reveal || V === 'hold') {
      var kw = M.min(170, F.w * 0.4), kx = F.x0 + F.w - kw - 4, ky = F.y0 + 4;
      for (var t = 14; t <= 36; t += 0.5) { c.fillStyle = tcol(t); c.fillRect(kx + (t - 14) / 22 * kw, ky, kw / 44 + 0.6, 8); }
      c.fillStyle = C.text; c.font = '10px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('14 °C', kx, ky + 10); c.textAlign = 'right'; c.fillText('36 °C', kx + kw, ky + 10);
      c.textAlign = 'center'; c.fillText('temperature', kx + kw / 2, ky + 10);
      if (V === 'hold') { var b0 = kx + (band.c - band.w / 2 - 14) / 22 * kw, b1 = kx + (band.c + band.w / 2 - 14) / 22 * kw; c.strokeStyle = C.green; c.lineWidth = 2; c.strokeRect(b0, ky - 3, b1 - b0, 14); }
      LAY = { kx: kx, ky: ky, kw: kw };
    } else LAY = null;
    // points
    var inBand = function (i) { return D.T[i] >= band.c - band.w / 2 && D.T[i] <= band.c + band.w / 2; };
    c.save(); c.beginPath(); c.rect(F.x0, F.y0 - 4, F.w + 4, F.h + 8); c.clip();
    for (var pass = 0; pass < 2; pass++) for (var i = 0; i < kk; i++) {
      var hot = V !== 'hold' || inBand(i); if ((pass === 0) === hot) continue;
      var x = F.X(disp.x[i]), y = F.Y(disp.y[i]), age = kk - i, rad = small ? 3.2 : 3.8;
      if (age < 4 && playing) rad += (4 - age) * 1.4;
      c.fillStyle = reveal || V === 'hold' ? tcol(D.T[i], hot ? 0.92 : 0.12) : (hot ? 'rgba(219,231,239,.78)' : 'rgba(219,231,239,.1)');
      c.beginPath(); c.arc(x, y, rad, 0, 6.2832); c.fill();
      if (i === hover) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
    }
    // fitted lines
    function line(b0, b1, col, lab, dash) {
      var xa = F.xlo, xb = F.xhi; c.strokeStyle = col; c.lineWidth = 2.5; c.setLineDash(dash || []); c.beginPath(); c.moveTo(F.X(xa), F.Y(b0 + b1 * xa)); c.lineTo(F.X(xb), F.Y(b0 + b1 * xb)); c.stroke(); c.setLineDash([]);
      if (lab) { var yy = clamp(F.Y(b0 + b1 * xb), F.y0 + 46, F.y0 + F.h - 10); c.fillStyle = col; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(lab, F.x0 + F.w - 4, yy - 5); }
    }
    if (!adj && A.naive) line(A.naive.b0, A.naive.b1, V === 'hold' ? 'rgba(249,168,212,.45)' : C.pink, V === 'hold' ? '' : 'all days', V === 'hold' ? [6, 5] : null);
    if (V === 'hold' && A.band && A.bandN >= 3) line(A.band.b0, A.band.b1, C.green, 'same temperature');
    if (adj && A.ctrl && A.resS) { var sl = MOD.slope(A.resR, A.resS); if (sl) line(sl.b0, sl.b1, C.green, 'adjusted'); }
    c.restore();
    // tooltip
    if (hover >= 0 && hover < kk) {
      var tx = F.X(disp.x[hover]), ty = F.Y(disp.y[hover]), lines = ['Day ' + (hover + 1) + ': ' + fmt(D.T[hover], 1) + ' °C', num(D.S[hover]) + ' cones · ' + D.R[hover] + ' calls'];
      c.font = '12px system-ui,sans-serif'; var tw = M.max(c.measureText(lines[0]).width, c.measureText(lines[1]).width) + 16, bx = clamp(tx + 10, 4, W - tw - 4), byy = clamp(ty - 48, 4, H - 46);
      c.fillStyle = 'rgba(11,27,39,.95)'; c.strokeStyle = C.axis; c.lineWidth = 1; c.beginPath(); c.rect(bx, byy, tw, 40); c.fill(); c.stroke();
      c.fillStyle = C.ink; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(lines[0], bx + 8, byy + 6); c.fillText(lines[1], bx + 8, byy + 22);
    }
    LAY = LAY || {}; LAY.F = F;
    hud.style.top = (top + 24) + 'px'; hud.style.left = (left + 12) + 'px';
  }

  // ---------- missions ----------
  var MIS = [
    { id: 'link', title: 'A strong link', goal: 'Let a summer of at least 60 days play out with a correlation above 0.6 between cones sold and lifeguard calls.' },
    { id: 'reveal', title: 'Reveal the weather', goal: 'Tick “Color the days by temperature”. Where are the hot days?' },
    { id: 'hold', title: 'Hold the weather fixed', goal: 'Switch to “Same temperature”, use a band 3 °C wide or narrower with at least 12 days in it, and find the link gone: correlation between −0.3 and 0.3.' },
    { id: 'adjust', title: 'Let regression do it', goal: 'Switch to “Adjust for temperature” with no real effect set. The slope that looked so strong should be within 2 standard errors of zero.' },
    { id: 'cut', title: 'Cut one arrow', goal: 'With no real effect, set heat → calls to 0 (or heat → cones to 0). Over 60+ days the correlation drops below 0.2.' },
    { id: 'cool', title: 'A summer of steady weather', goal: 'Keep heat driving both (at least 20 cones and 1 call per °C), but shrink the weather swings to ±1 °C or less. The correlation falls below 0.35.' },
    { id: 'real', title: 'Find a real effect', goal: 'Set a real effect of at least +1 call per 100 cones and at least 150 days. Adjusting for temperature, the 95% interval should include your number and exclude zero.' }
  ];
  var mis = L.missions($('ec1-missions'), SLUG, MIS, function (id) {
    bringIntoView(view);
    if (id === 'hold') setView('hold'); else if (id === 'adjust') setView('adj'); else if (id === 'reveal') { setView('all'); }
    else if (id === 'cool') { P = Object.assign({}, PRE.cool); syncFields(); markPre('cool'); regen(true); }
    else if (id === 'real') { P = Object.assign({}, PRE.real); syncFields(); markPre('real'); regen(true); }
    else if (id === 'cut') { P = Object.assign({}, PRE.dry); syncFields(); markPre('dry'); regen(true); }
    else if (id === 'link') { P = Object.assign({}, PRE.classic); syncFields(); markPre('classic'); regen(true); }
  });
  function win(id, text) { if (mis.done(id)) { L.toast(view, '✓ ' + text); celebrate(view); } }
  function check() {
    if (!A) return; var full = A.n >= D.S.length;
    if (full && A.n >= 60 && A.r > 0.6) win('link', 'r = ' + fmt(A.r, 2) + '. Cones and calls rise and fall together.');
    if (reveal && A.n >= 30) win('reveal', 'Hot days (red) sit at the top right: lots of cones and lots of calls.');
    if (V === 'hold' && band.w <= 3 && A.bandN >= 12 && isFinite(A.bandR) && M.abs(A.bandR) < 0.3 && A.r > 0.5) win('hold', 'On days with the same weather, r = ' + fmt(A.bandR, 2) + '. The link was the weather.');
    if (V === 'adj' && full && P.theta === 0 && A.ctrl && A.naive && M.abs(A.ctrl.t[1]) < 2 && A.naive.b1 / A.naive.se1 > 4) win('adjust', 'Adjusted slope ' + sgn(A.ctrl.b[1] * 100, 1) + ', within 2 se of 0. Regression held the weather fixed for you.');
    if (full && P.theta === 0 && A.n >= 60 && (P.bR === 0 || P.bS === 0) && A.r < 0.2) win('cut', 'r = ' + fmt(A.r, 2) + '. A confounder has to push on both.');
    if (full && P.bS >= 20 && P.bR >= 1 && P.amp <= 2 && A.n >= 60 && A.r < 0.35) win('cool', 'r = ' + fmt(A.r, 2) + '. If the weather barely changes, it can’t fake a link.');
    if (full && P.theta >= 1 && A.n >= 150 && V === 'adj' && A.ctrl) {
      var lo = (A.ctrl.b[1] - 1.96 * A.ctrl.se[1]) * 100, hi = (A.ctrl.b[1] + 1.96 * A.ctrl.se[1]) * 100;
      if (lo <= P.theta && hi >= P.theta && lo > 0) win('real', 'Interval ' + fmt(lo, 1) + ' to ' + fmt(hi, 1) + ' covers your ' + fmt(P.theta, 1) + ' and excludes 0.');
    }
  }

  // ---------- input ----------
  function pick(ev) {
    var rc = cv.getBoundingClientRect(), x = ev.clientX - rc.left, y = ev.clientY - rc.top;
    return { x: x, y: y };
  }
  var dragBand = false;
  function onKey(x) { return LAY && LAY.kx !== undefined && V === 'hold' && x.y >= LAY.ky - 10 && x.y <= LAY.ky + 24 && x.x >= LAY.kx - 10 && x.x <= LAY.kx + LAY.kw + 10; }
  cv.addEventListener('pointerdown', function (ev) {
    var p = pick(ev); if (onKey(p)) { dragBand = true; cv.setPointerCapture(ev.pointerId); setBand(14 + (p.x - LAY.kx) / LAY.kw * 22); return; }
    near(p);
  });
  cv.addEventListener('pointermove', function (ev) {
    var p = pick(ev); if (dragBand) { setBand(14 + (p.x - LAY.kx) / LAY.kw * 22); return; }
    cv.style.cursor = onKey(p) ? 'ew-resize' : 'default'; if (ev.pointerType === 'mouse') near(p);
  });
  cv.addEventListener('pointerup', function () { dragBand = false; });
  cv.addEventListener('pointerleave', function () { if (hover >= 0) { hover = -1; draw(); } });
  function near(p) {
    if (!LAY || !LAY.F) return; var F = LAY.F, best = -1, bd = 14 * 14, kk = M.min(D.S.length, k);
    for (var i = 0; i < kk; i++) { var dx = F.X(disp.x[i]) - p.x, dy = F.Y(disp.y[i]) - p.y, d2 = dx * dx + dy * dy; if (d2 < bd) { bd = d2; best = i; } }
    if (best !== hover) { hover = best; draw(); }
  }
  cv.addEventListener('keydown', function (e) {
    var kk = e.key;
    if (kk === ' ') { e.preventDefault(); togglePlay(); }
    else if (kk === 'r' || kk === 'R') { newSummer(); }
    else if (kk === 'v' || kk === 'V') { setView(V === 'all' ? 'hold' : V === 'hold' ? 'adj' : 'all'); }
    else if (kk === 'c' || kk === 'C') { reveal = !reveal; revealBox.checked = reveal; draw(); check(); }
    else if ((kk === 'ArrowLeft' || kk === 'ArrowRight') && V === 'hold') { e.preventDefault(); setBand(band.c + (kk === 'ArrowRight' ? 0.5 : -0.5)); }
  });
  var playBtn = $('ec1-play');
  function togglePlay() {
    if (k >= D.S.length) { k = 0; playing = true; }
    else playing = !playing;
    if (reduced && playing) { k = D.S.length; playing = false; analyze(); }
    syncPlay();
  }
  function syncPlay() { playBtn.textContent = playing ? '❚❚' : '▶'; playBtn.setAttribute('aria-label', playing ? 'Pause the summer' : 'Play the summer from day 1'); }
  playBtn.addEventListener('click', togglePlay);
  function newSummer() { seed = (seed * 48271 + 7) % 2147483647; regen(true); syncPlay(); }
  $('ec1-new').addEventListener('click', newSummer);
  $('ec1-skip').addEventListener('click', function () { k = D.S.length; playing = false; syncPlay(); analyze(); });

  // ---------- loop ----------
  var lastK = -1;
  L.loop(function (dt) {
    if (!D) return;
    var moving = false;
    if (playing) {
      var rate = M.max(26, D.S.length / 3.5); k = M.min(D.S.length, k + rate * dt);
      if (k >= D.S.length) { playing = false; syncPlay(); }
      moving = true;
    }
    if (M.floor(k) !== lastK) { lastK = M.floor(k); analyze(); }
    // glide toward targets
    if (disp && R) {
      var f = M.min(1, dt * 7), d = 0;
      for (var i = 0; i < disp.x.length; i++) { var ex = R.x[i] - disp.x[i], ey = R.y[i] - disp.y[i]; disp.x[i] += ex * f; disp.y[i] += ey * f; d += M.abs(ex) + M.abs(ey); }
      for (var j = 0; j < 4; j++) { var er = R.r[j] - disp.r[j]; disp.r[j] += er * f; d += M.abs(er); }
      if (d > 1e-3) moving = true;
    }
    if (moving) draw();
  }, view);
  L.onTheme(draw); window.addEventListener('resize', function () { G.fit(); draw(); });
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);

  // start
  syncFields(); bandShow(); setView('all'); regen(!reduced); syncPlay();

  /* =========================================================================================
     2. Potential outcomes: sixteen students and a tutoring program
     ========================================================================================= */
  var pv = $('ec1p-view'), pcv = $('ec1p-cv');
  if (!pv || !pcv) return;
  var PG = L.canvas(pcv), pc = PG.c, pread = $('ec1p-read');
  var cls = { seed: 2024, K: null, mode: 'gain', D: null, both: false, flips: [], anim: 0, rng: ES.rng(77) };
  var MIS2 = [
    { id: 'fooled', title: 'Fooled by choice', goal: 'Let the students who gain the most sign up. The simple comparison misses the true average effect by more than 5 points.' },
    { id: 'peek', title: 'Peek behind the curtain', goal: 'Tick “Show both outcomes” to see what nobody can see in real data.' },
    { id: 'flip', title: 'Flip the coins', goal: 'Assign the program by coin flip once.' },
    { id: 'thousand', title: 'A thousand classes', goal: 'Flip the coins 1,000 times. The average of the comparisons lands within 0.5 points of the true effect.' },
    { id: 'unlucky', title: 'An unlucky draw', goal: 'Find a single coin flip whose comparison misses the true effect by more than 5 points. Fair on average isn’t right every time.' }
  ];
  var mis2 = L.missions($('ec1p-missions'), SLUG + '-class', MIS2, function (id) {
    bringIntoView(pv);
    if (id === 'fooled') setMode('gain'); else if (id === 'flip' || id === 'thousand' || id === 'unlucky') setMode('coin'); else if (id === 'peek') { cls.both = true; $('ec1p-both').checked = true; pdraw(); win2('peek'); }
  });
  function win2(id, text) { var m = MIS2.filter(function (x) { return x.id === id; })[0]; if (mis2.done(id)) { L.toast(pv, '✓ ' + (text || m.title)); celebrate(pv); } }
  var markMode = seg($('ec1p-mode'), 'data-m', 'gain', function (m) { setMode(m); });
  function setMode(m) { cls.touched = true; cls.mode = m; markMode(m); cls.D = MOD.assign(cls.K, m, cls.rng); cls.anim = reduced ? 1 : 0; $('ec1p-flip').disabled = false; pupdate(); }
  function newClass() { cls.seed = (cls.seed * 69621 + 3) % 2147483647; cls.K = MOD.makeClass(cls.seed); cls.flips = []; cls.D = MOD.assign(cls.K, cls.mode, cls.rng); cls.anim = reduced ? 1 : 0; pupdate(); }
  $('ec1p-new').addEventListener('click', newClass);
  $('ec1p-both').addEventListener('change', function (e) { cls.both = e.target.checked; pdraw(); if (cls.both) win2('peek', 'Every student has two scores. Real data shows only one.'); });
  $('ec1p-flip').addEventListener('click', function () { if (cls.mode !== 'coin') { cls.mode = 'coin'; markMode('coin'); } cls.D = MOD.assign(cls.K, 'coin', cls.rng); cls.anim = reduced ? 1 : 0; cls.flips.push(MOD.estimates(cls.K, cls.D).naive); pupdate(); });
  $('ec1p-k').addEventListener('click', function () {
    if (cls.mode !== 'coin') { cls.mode = 'coin'; markMode('coin'); }
    cls.flips = cls.flips.concat(MOD.flips(cls.K, 1000, cls.rng)); cls.D = MOD.assign(cls.K, 'coin', cls.rng); cls.anim = reduced ? 1 : 0; pupdate();
  });
  function pupdate() {
    var E = MOD.estimates(cls.K, cls.D), rows = [];
    rows.push(['True average effect (ATE)', sgn(E.ate, 2) + ' points']);
    rows.push(['Tutored average − untutored average', sgn(E.naive, 2)]);
    rows.push(['… effect on those tutored (ATT)', sgn(E.att, 2)]);
    rows.push([cls.mode === 'coin' ? '… plus a gap by luck' : '… plus selection bias', sgn(E.sel, 2)]);
    if (cls.flips.length) { var mf = ES.mean(cls.flips); rows.push(['Coin-flip classes so far', cls.flips.length.toLocaleString('en-US')]); rows.push(['Their average comparison', sgn(mf, 2) + (cls.flips.length > 1 ? ' (sd ' + fmt(ES.sd(cls.flips), 1) + ')' : '')]); }
    dl(pread, rows);
    pcv.setAttribute('aria-description', 'Tutored average ' + fmt(E.meanT, 1) + ', untutored ' + fmt(E.meanC, 1) + ', difference ' + fmt(E.naive, 1) + ', true average effect ' + fmt(E.ate, 1) + '.');
    if (cls.touched && cls.mode === 'gain' && M.abs(E.naive - E.ate) > 5) win2('fooled', 'The comparison says ' + sgn(E.naive, 1) + '; the truth is ' + sgn(E.ate, 1) + '.');
    if (cls.mode === 'coin' && cls.flips.length) win2('flip', 'Coins decided. Now the groups differ only by luck.');
    if (cls.flips.length >= 1000 && M.abs(ES.mean(cls.flips) - E.ate) < 0.5) win2('thousand', 'Average of ' + cls.flips.length.toLocaleString('en-US') + ' flips: ' + sgn(ES.mean(cls.flips), 2) + ' vs the truth ' + sgn(E.ate, 2) + '.');
    if (cls.mode === 'coin' && cls.flips.length && M.abs(E.naive - E.ate) > 5) win2('unlucky', 'This flip says ' + sgn(E.naive, 1) + ', the truth is ' + sgn(E.ate, 1) + '. Bad luck, not bias.');
    pdraw();
  }
  function pdraw() {
    PG.fit(); var W = PG.w, H = PG.h, c2 = pc, K = cls.K, Dv = cls.D, E = MOD.estimates(K, Dv); c2.clearRect(0, 0, W, H); c2.fillStyle = C.bg; c2.fillRect(0, 0, W, H);
    var cols = W >= 640 ? 8 : 4, rows = 16 / cols, gap = 6, tw = (W - 16 - gap * (cols - 1)) / cols, th = W >= 640 ? 92 : 86, a = cls.anim;
    var LO = 40, HI = 100;
    K.forEach(function (kid, i) {
      var col = i % cols, row = M.floor(i / cols), x = 8 + col * (tw + gap), y = 8 + row * (th + gap), d = Dv[i];
      var flipT = clamp(a * 1.6 - i * 0.04, 0, 1), sc = M.abs(M.cos(flipT * M.PI));   // the tile flips over as it is assigned
      if (flipT >= 1) sc = 1;
      c2.save(); c2.translate(x + tw / 2, 0); c2.scale(sc < 0.06 ? 0.06 : sc, 1); c2.translate(-(x + tw / 2), 0);
      c2.fillStyle = d ? 'rgba(99,230,190,.13)' : 'rgba(116,192,252,.08)'; c2.strokeStyle = d ? 'rgba(99,230,190,.6)' : 'rgba(116,192,252,.35)'; c2.lineWidth = 1;
      c2.beginPath(); if (c2.roundRect) c2.roundRect(x, y, tw, th, 9); else c2.rect(x, y, tw, th); c2.fill(); c2.stroke();
      c2.fillStyle = C.ink; c2.font = '600 12px system-ui,sans-serif'; c2.textAlign = 'left'; c2.textBaseline = 'top'; c2.fillText(kid.name, x + 7, y + 6);
      c2.font = '10px system-ui,sans-serif'; c2.fillStyle = d ? C.green : C.text; c2.textAlign = 'right';
      if (tw >= 100) c2.fillText(d ? 'tutored' : 'not', x + tw - 6, y + 7); else { c2.beginPath(); c2.arc(x + tw - 10, y + 12, 4, 0, 6.2832); if (d) c2.fill(); else { c2.strokeStyle = C.text; c2.stroke(); } }
      // two bars: without (blue) and with (green); the one we can't see is a dashed ghost
      var bw = M.min(18, tw * 0.2), bh = th - 44, base = y + th - 18, xs = [x + tw / 2 - bw - 4, x + tw / 2 + 4], ys = [kid.y0, kid.y1], cl = [C.blue, C.green];
      for (var j = 0; j < 2; j++) {
        var seen = (j === 1) === !!d, hgt = (ys[j] - LO) / (HI - LO) * bh;
        if (seen) { c2.fillStyle = cl[j]; c2.fillRect(xs[j], base - hgt, bw, hgt); }
        else if (cls.both) { c2.fillStyle = j ? 'rgba(99,230,190,.3)' : 'rgba(116,192,252,.3)'; c2.fillRect(xs[j], base - hgt, bw, hgt); c2.setLineDash([3, 3]); c2.strokeStyle = cl[j]; c2.strokeRect(xs[j] + 0.5, base - hgt + 0.5, bw - 1, hgt - 1); c2.setLineDash([]); }
        else { c2.setLineDash([3, 3]); c2.strokeStyle = 'rgba(143,179,198,.5)'; c2.strokeRect(xs[j] + 0.5, base - bh * 0.5 + 0.5, bw - 1, bh * 0.5 - 1); c2.setLineDash([]); c2.fillStyle = C.text; c2.font = '600 12px system-ui'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('?', xs[j] + bw / 2, base - bh * 0.25); }
        c2.fillStyle = seen || cls.both ? cl[j] : C.text; c2.font = '10px ui-monospace,Menlo,monospace'; c2.textAlign = 'center'; c2.textBaseline = 'top';
        c2.fillText(seen || cls.both ? String(ys[j]) : '?', xs[j] + bw / 2, base + 3);
      }
      c2.restore();
    });
    // number line of what we observe
    var ny = 8 + rows * (th + gap) + 8, nh = 74, F = frame(30, ny, W - 60, nh, LO, HI, 0, 1), mid = ny + nh / 2;
    c2.strokeStyle = C.axis; c2.beginPath(); c2.moveTo(F.x0, mid); c2.lineTo(F.x0 + F.w, mid); c2.stroke();
    c2.fillStyle = C.text; c2.font = '10px system-ui,sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'middle';
    for (var v = LO; v <= HI; v += 10) { var xx = F.X(v); c2.fillRect(xx, mid - 3, 1, 6); c2.fillText(v, xx, mid + 10); }
    var stackT = {}, stackC = {};
    K.forEach(function (kid, i) {
      var t = Dv[i], val = t ? kid.y1 : kid.y0, key = M.round(val), st = t ? stackT : stackC; st[key] = (st[key] || 0) + 1;
      var x = F.X(val), y = t ? mid - 8 - (st[key] - 1) * 7 : mid + 22 + (st[key] - 1) * 7;
      c2.fillStyle = t ? C.green : C.blue; c2.beginPath(); c2.arc(x, y, 3.6, 0, 6.2832); c2.fill();
    });
    var xT = F.X(E.meanT), xC = F.X(E.meanC);
    function tri(x, y, up, col) { c2.fillStyle = col; c2.beginPath(); c2.moveTo(x, y); c2.lineTo(x - 6, y + (up ? 9 : -9)); c2.lineTo(x + 6, y + (up ? 9 : -9)); c2.closePath(); c2.fill(); }
    tri(xT, mid - 2, false, C.green); tri(xC, mid + 2, true, C.blue);
    c2.font = '600 11px system-ui,sans-serif'; c2.textBaseline = 'top'; c2.textAlign = 'left';
    c2.fillStyle = C.green; c2.fillText('tutored, average ' + fmt(E.meanT, 1), 8, ny - 4);
    c2.fillStyle = C.blue; c2.textBaseline = 'bottom'; c2.fillText('not tutored, average ' + fmt(E.meanC, 1), 8, ny + nh + 6);
    var narrow = W < 560;
    c2.fillStyle = C.gold; c2.textAlign = narrow ? 'left' : 'right'; c2.textBaseline = 'top'; c2.fillText('difference ' + sgn(E.naive, 1) + ' · true effect ' + sgn(E.ate, 1), narrow ? 8 : W - 8, narrow ? ny + nh + 12 : ny - 4);
    // histogram of coin-flip comparisons
    var hy = ny + nh + (narrow ? 50 : 34), hh = H - hy - 22;
    if (hh > 40) {
      var lo = -20, hi = 30, Fh = frame(30, hy, W - 60, hh, lo, hi, 0, 1), bins = new Array(hi - lo).fill(0);
      cls.flips.forEach(function (f) { var b = M.floor(f - lo); if (b >= 0 && b < bins.length) bins[b]++; });
      var mx = M.max.apply(null, bins) || 1;
      c2.fillStyle = 'rgba(11,27,39,.9)'; c2.fillRect(Fh.x0, Fh.y0, Fh.w, Fh.h);
      bins.forEach(function (b, i) { if (!b) return; var h = b / mx * (Fh.h - 14); c2.fillStyle = 'rgba(255,212,121,.75)'; c2.fillRect(Fh.X(lo + i) + 0.5, Fh.y0 + Fh.h - h, Fh.w / bins.length - 1, h); });
      c2.fillStyle = C.text; c2.font = '10px system-ui,sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'top';
      for (v = lo; v <= hi; v += 10) c2.fillText(sgn(v, 0), Fh.X(v), Fh.y0 + Fh.h + 3);
      function mark(val, col, lab, up) { var x = Fh.X(clamp(val, lo, hi)); c2.strokeStyle = col; c2.lineWidth = 2; c2.beginPath(); c2.moveTo(x, Fh.y0); c2.lineTo(x, Fh.y0 + Fh.h); c2.stroke(); c2.fillStyle = col; c2.font = '600 10px system-ui,sans-serif'; c2.textAlign = x > Fh.x0 + Fh.w - 90 ? 'right' : 'left'; c2.textBaseline = 'top'; c2.fillText(lab, x + (c2.textAlign === 'right' ? -4 : 4), Fh.y0 + (up ? 2 : 14)); }
      var eg = MOD.estimates(K, MOD.assign(K, 'gain')).naive;
      mark(E.ate, C.green, 'true effect', false); mark(eg, C.red, 'they choose', true);
      if (cls.flips.length) mark(cls.flips[cls.flips.length - 1], C.ink, 'last flip', true);
      c2.fillStyle = C.ink; c2.font = '600 11px system-ui,sans-serif'; c2.textAlign = 'left'; c2.textBaseline = 'bottom';
      c2.fillText(cls.flips.length ? cls.flips.length.toLocaleString('en-US') + ' coin-flip classes: average ' + sgn(ES.mean(cls.flips), 2) : 'Comparisons from coin-flip classes pile up here', Fh.x0, Fh.y0 - 2);
    }
  }
  L.loop(function (dt) { if (cls.anim < 1) { cls.anim = M.min(1, cls.anim + dt * 1.1); pdraw(); } }, pv);
  window.addEventListener('resize', function () { PG.fit(); pdraw(); });
  if (window.ResizeObserver) new ResizeObserver(function () { pdraw(); }).observe(pcv);
  cls.K = MOD.makeClass(cls.seed); cls.D = MOD.assign(cls.K, 'gain', cls.rng); cls.anim = 1; pupdate();
})();
