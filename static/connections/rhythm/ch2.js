/* The Rhythm of Numbers, chapter II: fifths, euclid, locking, primemusic. Conventions: core.js. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font, gcd = RN.gcd;

  /* ---------- 5 fifths ---------- */
  var L2 = Math.log2(1.5), fifthErr = function (n) { return 1200 * (Math.round(n * L2) / n - L2); };
  function drawMusic() {
    var n = +$('nS').value; $('nV').textContent = n; var f = Math.round(n * L2), g = gcd(f, n);
    $('mF').textContent = f + ' of ' + n + ' steps'; var e = fifthErr(n); $('mE').textContent = (e > 0 ? '+' : '') + e.toFixed(2) + ' cents';
    var phN = 0; for (var k = 1; k < n; k++) if (gcd(k, n) === 1) phN++;
    $('mG').innerHTML = phN + ' of ' + (n - 1) + (phN === n - 1 ? ' <span class="rn-p">(all: n is prime)</span>' : '') + ' · the fifth ' + (g === 1 ? '<span class="rn-t">does</span>' : 'does not');
    $('mP').innerHTML = RN.isP(n) ? '<span class="rn-p">prime</span>' : RN.factor(n).join(' × ');
    var cv = $('wheel'), r = RN.setupSq(cv, 300), x = r[0], w = r[1], cx = w / 2, cy = w / 2, R = w * 0.42; x.clearRect(0, 0, w, w);
    x.strokeStyle = c('--rn-line'); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    var P = function (i) { return [cx + R * Math.cos(-Math.PI / 2 + 2 * Math.PI * i / n), cy + R * Math.sin(-Math.PI / 2 + 2 * Math.PI * i / n)]; };
    x.strokeStyle = c('--rn-g'); x.lineWidth = 1.2; x.globalAlpha = 0.75; x.beginPath(); var cur = 0, p0 = P(0); x.moveTo(p0[0], p0[1]);
    for (var s = 0; s < n / g; s++) { cur = (cur + f) % n; var pp = P(cur); x.lineTo(pp[0], pp[1]); } x.stroke(); x.globalAlpha = 1;
    for (var i = 0; i < n; i++) { var q = P(i); x.fillStyle = i % g === 0 ? c('--rn-g') : c('--rn-muted'); x.beginPath(); x.arc(q[0], q[1], n > 40 ? 2 : 3.2, 0, 7); x.fill(); }
    x.fillStyle = c('--rn-ink'); x.font = F(Math.round(w * 0.11)); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(f + '/' + n, cx, cy);
    var c2 = $('edoChart'), r2 = RN.setup(c2), y = r2[0], Wd = r2[1], H = r2[2]; y.clearRect(0, 0, Wd, H);
    var Lm = 34, Rm = 8, T = 10, B = 24, pw = Wd - Lm - Rm, ph = H - T - B, xs = function (k2) { return Lm + pw * (k2 - 5) / 67; }, ysc = function (v) { return T + ph * (1 - v / 30); };
    y.strokeStyle = c('--rn-line'); y.fillStyle = c('--rn-muted'); y.font = F(10, 1); y.textAlign = 'right'; y.textBaseline = 'middle';
    [0, 10, 20, 30].forEach(function (v) { y.beginPath(); y.moveTo(Lm, ysc(v)); y.lineTo(Wd - Rm, ysc(v)); y.stroke(); y.fillText(v + '¢', Lm - 4, ysc(v)); });
    var bw = Math.max(1.5, pw / 68 - 1.5);
    for (var k3 = 5; k3 <= 72; k3++) { var v = Math.min(30, Math.abs(fifthErr(k3))); y.fillStyle = k3 === n ? c('--rn-teal') : RN.isP(k3) ? c('--rn-prime') : c('--rn-g'); y.globalAlpha = k3 === n ? 1 : 0.8; y.fillRect(xs(k3) - bw / 2, ysc(v), bw, ysc(0) - ysc(v)); }
    y.globalAlpha = 1; y.textAlign = 'center'; y.textBaseline = 'top'; y.fillStyle = c('--rn-ink'); [12, 41, 53].forEach(function (k4) { y.fillText(k4, xs(k4), H - B + 6); });
    y.fillStyle = c('--rn-muted'); y.fillText('notes per octave →', xs(30), H - B + 6);
  }
  RN.def('fifths', {
    init: function () {
      $('nS').addEventListener('input', drawMusic); drawMusic();
      $('playFifth').addEventListener('click', function () {
        var a = RN.ac(); if (!a) return; RN.stopAll(); var t = a.currentTime + 0.05, n = +$('nS').value, b = 220 * Math.pow(2, RN.keyOff() / 12), f = Math.round(n * L2);
        var held = function (t0, fr) { RN.voice(RN.snd.voice === 'kit' ? 'organ' : RN.snd.voice === 'sine' ? 'sine' : 'organ', t0, fr, 1.5, 0.14); };
        held(t, b); held(t, b * 1.5); held(t + 1.8, b); held(t + 1.8, b * Math.pow(2, f / n));
        $('rn-live').textContent = 'First the pure fifth, then the fifth of ' + f + ' steps out of ' + n + '.';
      });
    }, redraw: drawMusic
  });

  /* ---------- 6 Bjorklund and Euclid ---------- */
  function bjork(k, n) {
    var a = [], b = [], i; for (i = 0; i < k; i++) a.push([1]); for (i = 0; i < n - k; i++) b.push([0]);
    var cp = function (G) { return G.map(function (g) { return g.slice(); }); }, steps = [[cp(a), cp(b)]];
    while (b.length > 1) { var m = Math.min(a.length, b.length), na = []; for (i = 0; i < m; i++) na.push(a[i].concat(b[i])); var rem = a.length > m ? a.slice(m) : b.slice(m); a = na; b = rem; steps.push([cp(a), cp(b)]); }
    return { steps: steps, result: [].concat.apply([], a.concat(b)) };
  }
  RN.bjork = function (k, n) { if (k <= 0) return Array(n).fill(0); if (k >= n) return Array(n).fill(1); return bjork(k, n).result; };
  var bjHead = -1, bjRes = [];
  function drawBj() {
    var k = Math.max(1, Math.min(199, +$('bjK').value | 0)), n = Math.max(2, Math.min(200, +$('bjN').value | 0)); if (k >= n) k = n - 1;
    var B = bjork(k, n), fmt = function (g) { return g.map(function (b) { return b ? 'x' : '.'; }).join(''); };
    bjRes = B.result;
    var res = B.result.map(function (b, i) { return i === bjHead ? (b ? 'X' : '|') : (b ? 'x' : '.'); }).join('');
    $('bjSteps').innerHTML = '<b>Bjorklund: pair up groups</b>' + B.steps.map(function (s, i) { return '<div class="rn-row"><i>' + (i === 0 ? 'start' : 'step ' + i) + '</i>' + s[0].map(function (g) { return '<span class="rn-gp">' + fmt(g) + '</span>'; }).join('') + s[1].map(function (g) { return '<span class="rn-gp rn-r">' + fmt(g) + '</span>'; }).join('') + '</div>'; }).join('') + '<div class="rn-row"><i>rhythm</i><span class="rn-gp rn-res">' + res + '</span></div>';
    var A = n, Bb = k, lines = [], qs = []; while (Bb) { lines.push(A + ' = ' + Math.floor(A / Bb) + ' × ' + Bb + ' + ' + (A % Bb)); qs.push(Math.floor(A / Bb)); var t = A % Bb; A = Bb; Bb = t; }
    var piNote = n === 113 && k === 16 ? ', and 355/113 = 3 + 16/113 = [3; 7, 16], pi’s ladder' : '';
    var rep = RN.isP(n) ? '<span class="rn-p">' + n + ' is prime</span>, so every pulse count gives a rhythm that doesn’t repeat inside the bar.' : A > 1 ? 'gcd ' + A + ' > 1: ' + k + ' and ' + n + ' share a factor, so the rhythm repeats ' + A + ' times inside the bar.' : k + ' and ' + n + ' are coprime, so this rhythm doesn’t repeat inside the bar.';
    $('bjEuclid').innerHTML = '<b>Euclid: divide and keep the remainder</b>' + lines.map(function (l) { return '<div class="rn-row"><span>' + l + '</span></div>'; }).join('') + '<div class="rn-row"><span class="rn-small">gcd = ' + A + '. The quotients ' + qs.join(', ') + ' are the continued fraction of ' + n + '/' + k + piNote + '.</span></div><div class="rn-row"><span class="rn-small">' + rep + '</span></div>';
    return B.result;
  }
  RN.def('euclid', {
    init: function () {
      var P;
      ['bjK', 'bjN'].forEach(function (id) { $(id).addEventListener('input', function () { if (P) P.resetStep(); drawBj(); }); });
      document.querySelectorAll('[data-bj]').forEach(function (b) { b.addEventListener('click', function () { var v = b.dataset.bj.split(','); $('bjK').value = v[0]; $('bjN').value = v[1]; if (P) P.resetStep(); drawBj(); }); });
      drawBj();
      P = RN.player({ sec: $('euclid'), btn: $('bjPlay'), teach: $('bjTeach'), len: function () { return bjRes.length; }, dur: function () { return 0.15; },
        step: function (j, t) { if (bjRes[j]) RN.note(t, RN.degree(j === 0 ? 7 : 4, 60) - RN.keyOff(), 0.14, 0.3); else RN.tick(t, 0.03); },
        draw: function (i) { bjHead = bjRes.length > 64 ? -1 : i; if (bjRes.length <= 64) drawBj(); } });
    }
  });

  /* ---------- 7 mode locking ---------- */
  var TW = 220, TH = 90, TONG = null;
  function rotNum(Om, K, it) { var th = 0, k = K / (2 * Math.PI), i; for (i = 0; i < 60; i++) th = th + Om - k * Math.sin(2 * Math.PI * th); var s = th; for (i = 0; i < it; i++) th = th + Om - k * Math.sin(2 * Math.PI * th); return (th - s) / it; }
  function lockDen(w) { for (var q = 1; q <= 9; q++) { var p = Math.round(w * q); if (Math.abs(w - p / q) < 4e-4) return q; } return 0; }
  function computeTongues() { TONG = new Uint8Array(TW * TH); for (var j = 0; j < TH; j++) { var K = (j + 0.5) / TH; for (var i = 0; i < TW; i++) TONG[j * TW + i] = lockDen(rotNum((i + 0.5) / TW, K, 220)); } }
  function farey() { var N = +$('fN').value; $('fNV').textContent = N; var cnt = 0; for (var q = 1; q <= N; q++) for (var p = 0; p <= q; p++) if (gcd(p, q) === 1) cnt++; $('fCount').textContent = cnt.toLocaleString(); var pr = 3 * N * N / (Math.PI * Math.PI); $('fPred').textContent = Math.round(pr).toLocaleString() + ' (ratio ' + (cnt / pr).toFixed(3) + ')'; }
  function drawLock() {
    if (!TONG) return;
    var K = +$('kK').value / 100; $('kKV').textContent = K.toFixed(2);
    var cv = $('tongues'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var L = 34, B = 22, T = 6, pw = w - L - 6, ph = H - B - T, cw = pw / TW, ch = ph / TH, acc = c('--rn-g');
    x.fillStyle = c('--rn-soft'); x.fillRect(L, T, pw, ph);
    for (var j = 0; j < TH; j++) for (var i = 0; i < TW; i++) { var q = TONG[j * TW + i]; if (!q) continue; x.fillStyle = acc; x.globalAlpha = Math.max(0.15, 1 - (q - 1) * 0.11); x.fillRect(L + i * cw, T + ph - (j + 1) * ch, cw + 0.6, ch + 0.6); }
    x.globalAlpha = 1; x.strokeStyle = c('--rn-ink'); x.setLineDash([3, 3]); x.beginPath(); x.moveTo(L, T + ph - K * ph); x.lineTo(L + pw, T + ph - K * ph); x.stroke(); x.setLineDash([]);
    var al = RN.W.alpha % 1; x.strokeStyle = c('--rn-prime'); x.lineWidth = 3; x.beginPath(); x.moveTo(L + al * pw, T + ph); x.lineTo(L + al * pw, T + ph - 8); x.stroke(); x.lineWidth = 1;
    x.fillStyle = c('--rn-muted'); x.font = F(10, 1); x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText('K=1', L - 4, T + 4); x.fillText('0', L - 4, T + ph);
    x.textAlign = 'center'; x.textBaseline = 'top'; [[0, 1], [1, 3], [1, 2], [2, 3], [1, 1]].forEach(function (pq) { x.fillText(pq[0] + '/' + pq[1], L + pq[0] / pq[1] * pw, T + ph + 5); });
    var c2 = $('stair'), r2 = RN.setup(c2), y = r2[0], w2 = r2[1], H2 = r2[2]; y.clearRect(0, 0, w2, H2); var pw2 = w2 - L - 6, ph2 = H2 - B - T;
    y.strokeStyle = c('--rn-line'); [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { y.beginPath(); y.moveTo(L, T + ph2 * (1 - v)); y.lineTo(L + pw2, T + ph2 * (1 - v)); y.stroke(); });
    y.strokeStyle = c('--rn-g'); y.lineWidth = 1.6; y.beginPath(); var NS = Math.min(500, Math.round(pw2));
    for (var s = 0; s <= NS; s++) { var Om = s / NS, rr = rotNum(Om, K, 300), X = L + Om * pw2, Y = T + ph2 * (1 - rr); if (s) y.lineTo(X, Y); else y.moveTo(X, Y); }
    y.stroke(); y.lineWidth = 1;
    var r0 = rotNum(al, K, 400); y.fillStyle = c('--rn-prime'); y.beginPath(); y.arc(L + al * pw2, T + ph2 * (1 - r0), 5, 0, 7); y.fill();
    y.fillStyle = c('--rn-muted'); y.font = F(10, 1); y.textAlign = 'right'; y.textBaseline = 'middle'; y.fillText('1', L - 4, T); y.fillText('0', L - 4, T + ph2);
    y.textAlign = 'left'; y.fillText('rotation number (what the system actually does)', L + 4, T + 8);
    y.textAlign = 'center'; y.textBaseline = 'top'; y.fillText((w2 < 520 ? 'natural rotation Ω → (' : 'natural rotation Ω → (the bar’s number: ') + al.toFixed(4) + ' locks to ' + r0.toFixed(4) + ')', L + pw2 / 2, T + ph2 + 5);
  }
  RN.def('locking', {
    init: function () {
      $('fN').addEventListener('input', farey); farey();
      $('kK').addEventListener('input', drawLock);
      setTimeout(function () { computeTongues(); drawLock(); }, 30);
    }, redraw: drawLock, number: drawLock
  });

  /* ---------- 8 prime music ---------- */
  var MAT = null, roll = [];
  function computeMat() {
    var m = +$('pMod').value, N = +$('pLim').value, s = RN.sieve(Math.max(N, 2000000)), res = [], r;
    for (r = 0; r < m; r++) if (gcd(r, m) === 1) res.push(r);
    var idx = {}; res.forEach(function (v, i) { idx[v] = i; });
    var M = res.map(function () { return res.map(function () { return 0; }); }), prev = -1, tot = 0;
    for (var p = 7; p <= N; p++) if (!s[p]) { var ri = idx[p % m]; if (prev >= 0) { M[prev][ri]++; tot++; } prev = ri; }
    MAT = { m: m, res: res, M: M, tot: tot, N: N }; drawMat();
  }
  function drawMat() {
    if (!MAT) return; var res = MAT.res, M = MAT.M, tot = MAT.tot, m = MAT.m, N = MAT.N;
    var cv = $('pMat'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var k = res.length, L = 40, T = 34, size = Math.min(w - L - 6, H - T - 6), cs = size / k, ex = 1 / (k * k), rep = 0;
    x.font = F(Math.max(9, Math.min(12, cs * 0.28)), 1); x.textAlign = 'center'; x.textBaseline = 'middle';
    for (var i = 0; i < k; i++) for (var j = 0; j < k; j++) {
      var f = M[i][j] / tot; if (i === j) rep += f; var dev = (f - ex) / ex;
      x.fillStyle = dev < 0 ? c('--rn-g') : c('--rn-prime'); x.globalAlpha = Math.min(0.9, 0.08 + Math.abs(dev) * 1.6); x.fillRect(L + j * cs + 1, T + i * cs + 1, cs - 2, cs - 2); x.globalAlpha = 1;
      if (i === j) { x.strokeStyle = c('--rn-ink'); x.lineWidth = 1.5; x.strokeRect(L + j * cs + 1.5, T + i * cs + 1.5, cs - 3, cs - 3); }
      if (cs > 30) { x.fillStyle = c('--rn-ink'); x.fillText((f * 100).toFixed(1) + '%', L + (j + 0.5) * cs, T + (i + 0.5) * cs); }
    }
    x.fillStyle = c('--rn-muted'); for (i = 0; i < k; i++) { x.fillText(res[i], L + (i + 0.5) * cs, T - 10); x.textAlign = 'right'; x.fillText(res[i], L - 6, T + (i + 0.5) * cs); x.textAlign = 'center'; }
    x.textAlign = 'left'; x.textBaseline = 'top'; x.fillText('next prime →', L, 2); x.save(); x.translate(10, T + size / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('this prime', 0, 0); x.restore();
    $('pStat').innerHTML = tot.toLocaleString() + ' pairs of consecutive primes up to ' + (+N).toLocaleString() + ', mod ' + m + '. Repeats (outlined): <span class="rn-p">' + (rep * 100).toFixed(1) + '%</span>, against ' + (100 / k).toFixed(1) + '% if primes had no memory. Green cells are rarer than chance and amber cells are more common.';
  }
  function drawRoll() {
    var cv = $('pRoll'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var notes = [1, 5, 7, 11], names = ['C♯', 'F', 'G', 'B'], rh = (H - 24) / 4, ko = RN.keyOff();
    x.font = F(11, 1); x.textBaseline = 'middle';
    for (var i = 0; i < 4; i++) { x.fillStyle = c('--rn-soft'); x.fillRect(28, 4 + i * rh, w - 28, rh - 2); x.fillStyle = c('--rn-muted'); x.textAlign = 'right'; x.fillText(RN.KEYS[(notes[3 - i] + ko + 12) % 12].replace('♯', '♯'), 22, 4 + (i + 0.5) * rh); }
    var px = w;
    for (var j = roll.length - 1; j >= 0 && px > 28; j--) { var e = roll[j], len = e.g * 6; px -= len; var row = 3 - notes.indexOf(e.p % 12); if (row < 0 || row > 3) continue; x.fillStyle = e.rep ? c('--rn-prime') : c('--rn-g'); x.fillRect(Math.max(28, px) + 1, 4 + row * rh + 3, Math.max(2, len - 2), rh - 8); }
    var last = roll[roll.length - 1]; x.fillStyle = c('--rn-muted'); x.textAlign = 'left'; x.fillText(last ? 'prime ' + last.p.toLocaleString() + ' · gap ' + last.g : 'press play', 28, H - 9);
  }
  RN.def('primemusic', {
    init: function () {
      $('pMod').addEventListener('change', computeMat); $('pLim').addEventListener('change', computeMat);
      setTimeout(computeMat, 20); drawRoll();
      var seq = { p: 0, prevR: -1 }, P;
      function primeAt(i) { /* step i plays the i-th prime from the start */ while (seq.list.length <= i) { var q = seq.list[seq.list.length - 1] + 1; while (!RN.isP(q)) q++; seq.list.push(q); } return seq.list[i]; }
      function reset() { var p = Math.max(5, +$('pStart').value || 5); while (!RN.isP(p)) p++; seq = { list: [p], prevR: -1 }; roll = []; }
      $('pStart').addEventListener('change', function () { if (P) P.resetStep(); });
      P = RN.player({ sec: $('primemusic'), btn: $('pPlay'), teach: $('pTeach'), swing: false, loop: false,
        len: function () { return 1e9; }, reset: reset,
        dur: function (i) { return (primeAt(i + 1) - primeAt(i)) * 0.035; },
        step: function (i, t) {
          if (!seq.list) reset();
          var p = primeAt(i), q = primeAt(i + 1), g = q - p, r = p % 12, rep = r === seq.prevR;
          RN.note(t, 60 + r, Math.min(0.9, g * 0.1), 0.15); if (rep) RN.voice('sine', t, RN.mtof(84 + r + RN.keyOff()), 0.2, 0.05);
          roll.push({ p: p, g: g, rep: rep }); if (roll.length > 200) roll.shift(); seq.prevR = r;
          if (seq.list.length > 400) { var drop = 200; seq.list.splice(0, drop); seq.base = (seq.base || 0) + drop; }
        },
        draw: function () { drawRoll(); } });
      /* keep step indexes valid after trimming: re-base the list */
      var orig = primeAt; primeAt = function (i) { return orig(i - (seq.base || 0)); };
    },
    redraw: function () { drawMat(); drawRoll(); }
  });
})(window.RN);
