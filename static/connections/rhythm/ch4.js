/* The Rhythm of Numbers, chapter IV: quasi, zeros. Conventions: core.js. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font;

  /* ---------- 14 quasicrystal: the diffraction (Fourier power) of a row of atoms ---------- */
  function drawQuasi() {
    var N = +$('qN').value; $('qNV').textContent = N; var rnd = $('qRand').checked, PR = $('qSrc').value === 'primes', W = RN.W;
    var sig = PR ? function (n) { return RN.isP(n) ? 1 : 0; } : function (n) { return W.word[n]; }, al = W.alpha % 1, n;
    if (PR) { var cnt = 0; for (n = 0; n < N; n++) cnt += RN.isP(n) ? 1 : 0; al = cnt / N; }
    var c0 = $('qRow'), r0 = RN.setup(c0), rx = r0[0], w0 = r0[1], H0 = r0[2]; rx.clearRect(0, 0, w0, H0); var show = Math.min(N, Math.floor(w0 / 3)), cw = w0 / show;
    for (var i = 0; i < show; i++) { rx.fillStyle = sig(i) ? c('--rn-g') : c('--rn-line'); rx.beginPath(); rx.arc((i + 0.5) * cw, H0 / 2, sig(i) ? Math.min(5, cw * 0.45) : 1.2, 0, 7); rx.fill(); }
    var cv = $('qDiff'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H); var L = 10, B = 26, T = 26, pw = w - L - 10, ph = H - B - T, NF = Math.min(1400, Math.floor(pw * 1.5));
    var idx = []; for (n = 0; n < N; n++) if (sig(n)) idx.push(n);
    var ridx = null; if (rnd) { ridx = []; var seed = 12345, rand = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; for (n = 0; n < N; n++) if (rand() < al) ridx.push(n); }
    function spec(ix) {
      var out = new Float64Array(NF), m = ix.length / N;
      for (var j = 0; j < NF; j++) { var f = 0.5 * (j + 0.5) / NF, wv = 2 * Math.PI * f, re = 0, im = 0; for (var k = 0; k < ix.length; k++) { re += Math.cos(wv * ix[k]); im -= Math.sin(wv * ix[k]); }
        var sN = Math.sin(Math.PI * f * N) / Math.sin(Math.PI * f), ph0 = -Math.PI * f * (N - 1); re -= m * sN * Math.cos(ph0); im -= m * sN * Math.sin(ph0); out[j] = (re * re + im * im) / N; }
      return out;
    }
    var S = spec(idx), Sr = ridx ? spec(ridx) : null, mx = 0; for (var j = 0; j < NF; j++) mx = Math.max(mx, S[j]);
    var sc = function (v) { return T + ph * (1 - Math.sqrt(Math.min(1, v / mx))); };
    x.strokeStyle = c('--rn-line'); x.beginPath(); x.moveTo(L, T + ph); x.lineTo(L + pw, T + ph); x.stroke();
    if (Sr) { x.strokeStyle = c('--rn-muted'); x.globalAlpha = 0.6; x.beginPath(); for (j = 0; j < NF; j++) { var X = L + pw * j / NF; if (j) x.lineTo(X, sc(Sr[j])); else x.moveTo(X, sc(Sr[j])); } x.stroke(); x.globalAlpha = 1; }
    x.strokeStyle = c('--rn-g'); x.lineWidth = 1.3; x.beginPath(); for (j = 0; j < NF; j++) { var X2 = L + pw * j / NF; if (j) x.lineTo(X2, sc(S[j])); else x.moveTo(X2, sc(S[j])); } x.stroke(); x.lineWidth = 1;
    x.font = F(10, 1); x.textAlign = 'center'; x.textBaseline = 'top'; x.fillStyle = c('--rn-prime');
    if (PR) [[1, 2], [1, 3], [1, 6], [1, 5], [2, 5], [1, 10], [3, 10], [1, 7], [2, 7], [3, 7]].forEach(function (aq) { var Xp = L + pw * (aq[0] / aq[1]) * 2; x.fillRect(Xp - 0.5, T - 12, 1.5, 6); if (aq[1] <= 6 || aq[0] === 1) x.fillText(aq[0] + '/' + aq[1], Xp, T - 24); });
    else for (var k = 1; k <= 12; k++) { var f = (k * al) % 1; if (f > 0.5) f = 1 - f; var amp = Math.abs(Math.sin(Math.PI * k * al) / (Math.PI * k)); if (amp < 0.02) continue; var Xk = L + pw * f * 2; x.fillRect(Xk - 0.5, T - 12, 1.5, 6); x.fillText(k + 'α', Xk, T - 24); }
    x.fillStyle = c('--rn-muted'); [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(function (f2) { x.fillText(f2.toFixed(1), L + pw * f2 * 2, T + ph + 6); }); x.textAlign = 'right'; if (w > 420) x.fillText('frequency (cycles per beat) →', L + pw, T + ph + 6);
  }
  RN.def('quasi', {
    init: function () { ['qN', 'qRand', 'qSrc'].forEach(function (id) { $(id).addEventListener('input', drawQuasi); $(id).addEventListener('change', drawQuasi); }); drawQuasi(); },
    number: drawQuasi, redraw: drawQuasi
  });

  /* ---------- 15 zeta zeros: Riemann's explicit formula for ψ(x) ---------- */
  var Z = [14.134725, 21.02204, 25.010858, 30.424876, 32.935062, 37.586178, 40.918719, 43.327073, 48.005151, 49.773832, 52.970321, 56.446248, 59.347044, 60.831779, 65.112544, 67.079811, 69.546402, 72.067158, 75.704691, 77.14484, 79.337375, 82.910381, 84.735493, 87.425275, 88.809111, 92.491899, 94.651344, 95.870634, 98.831194, 101.317851, 103.725538, 105.446623, 107.168611, 111.029536, 111.874659, 114.320221, 116.22668, 118.790783, 121.370125, 122.946829, 124.256819, 127.516684, 129.578704, 131.087689, 133.497737, 134.75651, 138.116042, 139.736209, 141.123707, 143.111846, 146.000982, 147.422765, 150.05352, 150.925258, 153.024694, 156.112909, 157.597592, 158.849988, 161.188964, 163.03071, 165.537069, 167.18444, 169.094515, 169.911976, 173.411537, 174.754192, 176.441434, 178.377408, 179.916484, 182.207078, 184.874468, 185.598784, 187.228923, 189.416159, 192.026656, 193.079727, 195.265397, 196.876482, 198.01531, 201.264752, 202.493595, 204.189672, 205.394697, 207.906259, 209.57651, 211.690863, 213.347919, 214.547045, 216.169539, 219.067596, 220.714919, 221.430706, 224.007, 224.983325, 227.421444, 229.337413, 231.250189, 231.987235, 233.693404, 236.52423, 237.76982, 239.555478, 241.049158, 242.823272, 244.070898, 247.13699, 248.10199, 249.57369, 251.014948, 253.069987, 255.306256, 256.380714, 258.610439, 259.874407, 260.805085, 263.573894, 265.557852, 266.614974, 267.921915, 269.970449, 271.494056, 273.459609, 275.587493, 276.45205, 278.250744, 279.229251, 282.465115, 283.211186, 284.835964, 286.667445, 287.911921, 289.579855, 291.846291, 293.558434, 294.96537, 295.573255, 297.979277, 299.840326, 301.649325, 302.69675, 304.864371, 305.728913, 307.219496, 310.109463, 311.165142, 312.427801, 313.985286, 315.475616, 317.734806, 318.853104];
  var LOGP = null;
  function psiTrue(x) { if (!LOGP) { LOGP = new Float64Array(61); for (var y = 2; y <= 60; y++) { var s = 0; for (var p = 2; p <= y; p++) if (RN.isP(p)) { var q = p; while (q <= y) { s += Math.log(p); q *= p; } } LOGP[y] = s; } } return LOGP[Math.floor(x)] || 0; }
  function psiApprox(x, N) { var s = x - Math.log(2 * Math.PI) - 0.5 * Math.log(1 - 1 / (x * x)), r = Math.sqrt(x), lx = Math.log(x); for (var k = 0; k < N; k++) { var g = Z[k]; s -= 2 * r * (0.5 * Math.cos(g * lx) + g * Math.sin(g * lx)) / (0.25 + g * g); } return s; }
  function drawZ() {
    var N = +$('zS').value; $('zV').textContent = N; var cv = $('zChart'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var Lm = 34, Rm = 8, T = 10, B = 24, X0 = 1.5, X1 = 50, pw = w - Lm - Rm, ph = H - T - B, xs = function (v) { return Lm + pw * (v - X0) / (X1 - X0); }, ys = function (v) { return T + ph * (1 - (v + 2) / 56); };
    x.strokeStyle = c('--rn-line'); x.fillStyle = c('--rn-muted'); x.font = F(10, 1); x.textAlign = 'right'; x.textBaseline = 'middle';
    [0, 10, 20, 30, 40, 50].forEach(function (v) { x.beginPath(); x.moveTo(Lm, ys(v)); x.lineTo(w - Rm, ys(v)); x.stroke(); x.fillText(v, Lm - 4, ys(v)); });
    x.textAlign = 'center'; x.textBaseline = 'top'; for (var p = 2; p <= X1; p++) if (RN.isP(p)) { x.fillStyle = c('--rn-prime'); x.fillRect(xs(p) - 1, H - B + 1, 2, 5); if (p <= 13 || p === 23 || p === 31 || p === 41 || p === 47) x.fillText(p, xs(p), H - B + 8); }
    x.strokeStyle = c('--rn-ink'); x.lineWidth = 1.5; x.beginPath(); for (var i = 0; i <= 800; i++) { var v = X0 + (X1 - X0) * i / 800, Y = ys(psiTrue(v)); if (i) x.lineTo(xs(v), Y); else x.moveTo(xs(v), Y); } x.stroke();
    x.strokeStyle = c('--rn-g'); x.lineWidth = 1.6; x.beginPath(); for (i = 0; i <= 1000; i++) { var v2 = X0 + (X1 - X0) * i / 1000, Y2 = ys(Math.max(-2, Math.min(54, psiApprox(v2, N)))); if (i) x.lineTo(xs(v2), Y2); else x.moveTo(xs(v2), Y2); } x.stroke(); x.lineWidth = 1;
  }
  RN.def('zeros', {
    init: function () {
      $('zS').addEventListener('input', drawZ); drawZ();
      $('playZ').addEventListener('click', function () { var a = RN.ac(); if (!a) return; RN.stopAll(); var t = a.currentTime + 0.05; Z.slice(0, 12).forEach(function (g, i) { RN.noteF(t + i * 0.18 / RN.snd.tempo, g * 15, 1.6, 0.11); }); });
    }, redraw: drawZ
  });
})(window.RN);
