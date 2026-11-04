/* The Rhythm of Numbers, chapter III: orchard, corr, hydrogen, sunflower, wrapv. Conventions: core.js. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font, gcd = RN.gcd;

  /* ---------- 9 orchard ---------- */
  function drawOrch() {
    var N = +$('oS').value; $('oV').textContent = N; var cv = $('orch'), w0 = cv.clientWidth, r = RN.setup(cv, Math.min(w0, 520)), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var s = Math.min(w, H) - 16, ox = (w - s) / 2, oy = 8, cs = s / N, vis = 0, conv = {};
    var h0 = 1, h1 = 3, k0 = 0, k1 = 1;[7, 15, 1, 292].forEach(function (t) { var a = t * h1 + h0; h0 = h1; h1 = a; var b = t * k1 + k0; k0 = k1; k1 = b; if (k1 <= N && h1 - 3 * k1 <= N) conv[k1 + ',' + (h1 - 3 * k1)] = 1; });
    var G = c('--rn-g'), Pc = c('--rn-prime'), Lc = c('--rn-line');
    for (var a = 1; a <= N; a++) for (var b = 1; b <= N; b++) { var v = gcd(a, b) === 1, key = a + ',' + b; if (v) vis++; x.fillStyle = conv[key] ? Pc : v ? G : Lc; x.beginPath(); x.arc(ox + (a - 0.5) * cs, oy + s - (b - 0.5) * cs, Math.max(0.8, cs * (conv[key] ? 0.5 : 0.32)), 0, 7); x.fill(); }
    $('oR').textContent = (vis / N / N).toFixed(6); var pr = 1; for (var p = 2; p <= N; p++) if (RN.isP(p)) pr *= 1 - 1 / (p * p); $('oE').textContent = pr.toFixed(6);
  }
  RN.def('orchard', { init: function () { $('oS').addEventListener('input', drawOrch); drawOrch(); }, redraw: drawOrch });

  /* ---------- 10 correlation matrix ---------- */
  var corrAB = function (a, b) { return (gcd(a, b) - 1) / Math.sqrt((a - 1) * (b - 1)); }, crHead = -1;
  function drawCorr() {
    var N = +$('crN').value; $('crNV').textContent = N; $('crA').max = N; var A = Math.min(+$('crA').value, N); $('crAV').textContent = A; var B = Math.max(2, Math.min(N, +$('crB').value || 2));
    var cv = $('crMat'), w0 = cv.clientWidth, r = RN.setup(cv, Math.min(w0, 420)), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var s = Math.min(w, H) - 24, ox = (w - s) / 2 + 8, oy = 4, n = N - 1, cs = s / n, pr = c('--rn-prime'), soft = c('--rn-soft'), ink = c('--rn-ink'), z = 0, t = 0;
    for (var a = 2; a <= N; a++) for (var b = 2; b <= N; b++) { var v = corrAB(a, b); if (a !== b) { t++; if (v === 0) z++; } x.fillStyle = a === b ? ink : v === 0 ? soft : pr; x.globalAlpha = a === b ? 1 : v === 0 ? 1 : Math.min(1, 0.15 + v * 1.1); x.fillRect(ox + (b - 2) * cs, oy + (a - 2) * cs, Math.ceil(cs), Math.ceil(cs)); }
    x.globalAlpha = 1; x.strokeStyle = c('--rn-g'); x.lineWidth = 2; x.strokeRect(ox, oy + (A - 2) * cs, s, cs); if (B <= N) x.strokeRect(ox + (B - 2) * cs, oy, cs, s);
    x.fillStyle = c('--rn-muted'); x.font = F(10, 1); x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('b = 2 … ' + N + ' →', ox + s / 2, oy + s + 4);
    $('crZ').textContent = (z / t).toFixed(4); var rr = corrAB(A, B);
    $('crAB').textContent = 'corr(' + A + ', ' + B + ') = ' + rr.toFixed(3) + (rr === 0 ? ' (coprime)' : ' (share ' + gcd(A, B) + ')');
    $('crP').innerHTML = RN.isP(A) ? '<span class="rn-p">prime</span>: its row is zero except at multiples of ' + A : RN.factor(A).join(' × ');
    var c2 = $('crRow'), r2 = RN.setup(c2, Math.min(w0, 420)), y = r2[0], w2 = r2[1], H2 = r2[2]; y.clearRect(0, 0, w2, H2);
    var L = 34, R = 8, T = 14, Bm = 26, pw = w2 - L - R, ph = H2 - T - Bm, X = function (bb) { return L + pw * (bb - 2) / Math.max(1, N - 2); }, Y = function (vv) { return T + ph * (1 - vv); };
    y.strokeStyle = c('--rn-line'); y.fillStyle = c('--rn-muted'); y.font = F(10, 1); y.textAlign = 'right'; y.textBaseline = 'middle';
    [0, 0.25, 0.5, 0.75].forEach(function (vv) { y.beginPath(); y.moveTo(L, Y(vv)); y.lineTo(L + pw, Y(vv)); y.stroke(); y.fillText(vv.toFixed(2), L - 4, Y(vv)); });
    y.strokeStyle = ink; y.lineWidth = 1.5; y.setLineDash([5, 4]); y.beginPath(); y.moveTo(L, Y(1)); y.lineTo(L + pw, Y(1)); y.stroke(); y.setLineDash([]); y.fillStyle = ink; y.fillText('1.00', L - 4, Y(1)); y.textAlign = 'left'; y.textBaseline = 'bottom'; y.fillText('corr = 1', L + 4, Y(1) - 2);
    y.strokeStyle = c('--rn-g'); y.lineWidth = 1.3; y.beginPath(); for (b = 2; b <= N; b++) { var vb = corrAB(A, b); if (b === 2) y.moveTo(X(b), Y(vb)); else y.lineTo(X(b), Y(vb)); } y.stroke();
    for (b = 2; b <= N; b++) { var v2 = corrAB(A, b); if (v2 > 0) { y.fillStyle = b === A ? ink : pr; y.beginPath(); y.arc(X(b), Y(v2), b === A ? 4 : 3, 0, 7); y.fill(); } }
    y.fillStyle = c('--rn-muted'); y.textAlign = 'center'; y.textBaseline = 'top'; y.fillText('corr(' + A + ', b) for b = 2 … ' + N, L + pw / 2, T + ph + 6);
    if (crHead >= 0) { y.fillStyle = c('--rn-prime'); y.textAlign = 'right'; y.fillText('beat ' + (crHead + 1), L + pw, T); }
  }
  RN.def('corr', {
    init: function () {
      ['crN', 'crA', 'crB'].forEach(function (id) { $(id).addEventListener('input', drawCorr); });
      drawCorr();
      var A = 12, B = 8, L = 24;
      RN.player({ sec: $('corr'), btn: $('crPlay'), teach: $('crTeach'),
        reset: function () { A = +$('crA').value; B = Math.max(2, +$('crB').value || 2); L = A * B / gcd(A, B); },
        len: function () { return L; }, dur: function () { return Math.max(0.06, Math.min(0.14, 3.2 / L)); },
        step: function (i, t) { var ha = i % A === 0, hb = i % B === 0; if (ha && hb) RN.note(t, 84, 0.25, 0.32); else { if (ha) RN.note(t, 72, 0.12, 0.24); if (hb) RN.voice('sine', t, RN.mtof(64 + RN.keyOff()), 0.12, 0.25); } },
        draw: function (i) { crHead = i; drawCorr(); } });
    }, redraw: drawCorr
  });

  /* ---------- 11 hydrogen ---------- */
  function wl2rgb(l) {
    var r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
    var f = l < 420 ? 0.35 + 0.65 * (l - 380) / 40 : l > 700 ? 0.35 + 0.65 * (780 - l) / 80 : 1;
    return 'rgb(' + Math.round(255 * Math.max(0, r) * f) + ',' + Math.round(255 * Math.max(0, g) * f) + ',' + Math.round(255 * Math.max(0, b) * f) + ')';
  }
  var balmer = function (n) { return 364.56 * n * n / (n * n - 4); };
  function drawHyd() {
    var N = +$('hN').value; $('hNV').textContent = N;
    var cv = $('balmer'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H); var l0 = 355, l1 = 680, X = function (l) { return 8 + (w - 16) * (l - l0) / (l1 - l0); };
    x.fillStyle = '#05070d'; x.fillRect(8, 6, w - 16, H - 34);
    for (var n = 3; n <= N + 2; n++) { var l = balmer(n); x.fillStyle = wl2rgb(Math.max(380, l)); x.globalAlpha = n - 2 <= 4 ? 1 : Math.max(0.35, 1 - (n - 6) * 0.05); x.fillRect(X(l) - 1, 6, 2.2, H - 34); }
    x.globalAlpha = 1; x.strokeStyle = '#8a958f'; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(X(364.56), 6); x.lineTo(X(364.56), H - 28); x.stroke(); x.setLineDash([]);
    x.fillStyle = c('--rn-muted'); x.font = F(10, 1); x.textAlign = 'center'; x.textBaseline = 'top';
    (w < 480 ? [400, 500, 600] : [400, 450, 500, 550, 600, 650]).forEach(function (v) { x.fillText(v + ' nm', X(v), H - 22); }); x.textAlign = 'left'; x.fillText('limit 364.6', X(364.56) + 3, H - 12);
    var c2 = $('zeta2'), r2 = RN.setup(c2), y = r2[0], w2 = r2[1], H2 = r2[2]; y.clearRect(0, 0, w2, H2); var L = 8, R = 8, pw = w2 - L - R, Xv = function (v) { return L + pw * v / 1.75; }, bh = 44;
    var s = 0, y1 = 40, y2 = 140; y.font = F(w2 < 480 ? 10 : 11, 1); y.textBaseline = 'bottom'; y.fillStyle = c('--rn-muted'); y.textAlign = 'left';
    y.fillText('1 + 1/4 + 1/9 + 1/16 + …  (hydrogen’s squares)', L, y1 - 6); y.fillText('× 1/(1−1/4) × 1/(1−1/9) × …  (one per prime)', L, y2 - 6);
    for (n = 1; n <= N; n++) { var a = s; s += 1 / (n * n); y.fillStyle = n % 2 ? c('--rn-g') : c('--rn-teal'); y.globalAlpha = 0.85; y.fillRect(Xv(a), y1, Math.max(0.5, Xv(s) - Xv(a) - 0.5), bh); y.globalAlpha = 1; if (Xv(s) - Xv(a) > 26) { y.fillStyle = c('--rn-on'); y.textAlign = 'center'; y.textBaseline = 'middle'; y.fillText(n === 1 ? '1' : '1/' + n * n, (Xv(a) + Xv(s)) / 2, y1 + bh / 2); y.textBaseline = 'bottom'; } }
    var pr = 1, cnt = 0;
    for (var p = 2; cnt < N; p++) { if (!RN.isP(p)) continue; cnt++; var a0 = pr; pr *= 1 / (1 - 1 / (p * p)); if (cnt === 1) { y.fillStyle = c('--rn-prime'); y.globalAlpha = 0.85; y.fillRect(Xv(0), y2, Xv(a0) - Xv(0) - 0.5, bh); }
      y.fillStyle = cnt % 2 ? c('--rn-prime') : c('--rn-rose'); y.globalAlpha = 0.85; y.fillRect(Xv(a0), y2, Math.max(0.5, Xv(pr) - Xv(a0) - 0.5), bh); y.globalAlpha = 1;
      if (Xv(pr) - Xv(a0) > 18) { y.fillStyle = c('--rn-on'); y.textAlign = 'center'; y.textBaseline = 'middle'; y.fillText(p, (Xv(a0) + Xv(pr)) / 2, y2 + bh / 2); y.textBaseline = 'bottom'; } }
    var tz = Math.PI * Math.PI / 6; y.strokeStyle = c('--rn-ink'); y.lineWidth = 1.5; y.beginPath(); y.moveTo(Xv(tz), 20); y.lineTo(Xv(tz), H2 - 20); y.stroke(); y.lineWidth = 1; y.fillStyle = c('--rn-ink'); y.textAlign = 'right'; y.textBaseline = 'top'; y.fillText('π²/6', Xv(tz) - 4, H2 - 34);
    $('hS').textContent = s.toFixed(6); $('hP').textContent = pr.toFixed(6);
  }
  RN.def('hydrogen', {
    init: function () {
      $('hN').addEventListener('input', drawHyd); drawHyd();
      $('hPlay').addEventListener('click', function () {
        var a = RN.ac(); if (!a) return; RN.stopAll(); var t = a.currentTime + 0.05, top = Math.max(12, +$('hN').value + 2), sp = 0.22 / RN.snd.tempo;
        for (var n = 3; n <= top; n++) RN.noteF(t + (n - 3) * sp, 220 * 656.3 / balmer(n), 0.9, 0.13);
        RN.voice('sine', t + sp * (top - 2), 220 * 656.3 / 364.56, 1.6, 0.1);
      });
    }, redraw: drawHyd
  });

  /* ---------- 12 sunflower ---------- */
  function sunQ() {
    var sel = $('sfQ'), prev = sel.value; sel.innerHTML = '';
    var seen = {}, qs = RN.W.Q.slice(2).filter(function (v) { if (v <= 2 || v > 400 || seen[v]) return false; seen[v] = 1; return true; }).slice(0, 6);
    qs.forEach(function (v) { var o = document.createElement('option'); o.value = v; o.textContent = v + ' arms' + (RN.isP(v) ? ' (prime)' : ' = ' + RN.factor(v).join(' × ')); sel.append(o); });
    if ([].some.call(sel.options, function (o) { return o.value === prev; })) sel.value = prev; else if (sel.options.length) sel.value = sel.options[0].value;
  }
  function drawSun() {
    var N = +$('sfN').value; $('sfNV').textContent = N; var t = RN.W.alpha % 1, onlyP = $('sfMode').value === 'primes', q = +$('sfQ').value || 7;
    var cv = $('sf'), w0 = cv.clientWidth, r = RN.setup(cv, Math.min(460, Math.max(300, w0))), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var R = Math.min(w, H) / 2 - 8, cx = w / 2, cy = H / 2, dot = Math.max(1.3, R / Math.sqrt(N) * (onlyP ? 0.75 : 0.55)), dark = RN.dark(), counts = new Uint32Array(q);
    for (var k = 1; k <= N; k++) { var pr = RN.isP(k); if (pr) counts[k % q]++; if (onlyP && !pr) continue; var a = 2 * Math.PI * k * t, rr = R * Math.sqrt(k / N), j = k % q; x.fillStyle = 'hsl(' + (j / q * 300 + 200) + ',' + (dark ? 55 : 60) + '%,' + (dark ? 66 : 40) + '%)'; x.globalAlpha = onlyP || pr ? 1 : 0.35; x.beginPath(); x.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), dot, 0, 7); x.fill(); }
    x.globalAlpha = 1; var cop = 0, other = 0; for (j = 0; j < q; j++) { if (gcd(j, q) === 1) cop++; else other++; }
    $('sfNote').innerHTML = 'Turn = ' + t.toFixed(6) + ' of a circle. Colors follow ' + q + ' arms (seed number mod ' + q + '). Of the ' + q + ' arms, primes can live only in the <span class="rn-p">' + cop + '</span> whose number shares no factor with ' + q + (RN.isP(q) ? ', so all but one, because ' + q + ' is prime' : ' = ' + RN.factor(q).join(' × ')) + '. The other ' + (other === 1 ? 'arm holds' : other + ' arms hold') + ' at most one prime (a factor of ' + q + ' itself).';
  }
  RN.def('sunflower', {
    init: function () { ['sfN', 'sfMode', 'sfQ'].forEach(function (id) { $(id).addEventListener('input', drawSun); $(id).addEventListener('change', drawSun); }); sunQ(); drawSun(); },
    number: function () { sunQ(); drawSun(); }, redraw: drawSun
  });

  /* ---------- 13 wrap ---------- */
  var TWIN = function (n) { return RN.isP(n) && (RN.isP(n - 2) || RN.isP(n + 2)); };
  function drawWrap() {
    var src = $('wSrc').value, wd = +$('wW').value; $('wWV').textContent = wd; var cv = $('wcan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var cell = Math.max(1, Math.min(16, w / wd)), cols = wd, rows = Math.min(Math.floor(H / cell), Math.floor(200000 / wd)), ox = (w - cell * cols) / 2;
    var W = RN.W, on = src === 'num' ? function (i) { return W.word[i] === 1; } : src === 'primes' ? RN.isP : TWIN;
    x.fillStyle = c('--rn-soft'); x.fillRect(ox, 0, cell * cols, rows * cell); var colCount = new Uint32Array(cols), g = cell > 3 ? 1 : 0, fc = src === 'num' ? c('--rn-g') : c('--rn-prime');
    x.fillStyle = fc;
    for (var rr = 0; rr < rows; rr++) for (var k = 0; k < cols; k++) { var i = rr * cols + k; if (on(i)) { if (rr > 0) colCount[k]++; x.fillRect(ox + k * cell, rr * cell, Math.max(1, cell - g), Math.max(1, cell - g)); } }
    var used = 0; for (k = 0; k < cols; k++) if (colCount[k]) used++;
    if (src === 'num') $('wNote').textContent = rows + ' rows × ' + wd + ' beats of ' + W.name + '. Columns in use: ' + used + ' of ' + wd + '. Straight columns mean ' + wd + ' is close to a block length, and leaning columns show how far off it is.';
    else { var ph = 0; for (k = 1; k <= wd; k++) if (gcd(k, wd) === 1) ph++; $('wNote').textContent = rows + ' rows × ' + wd + ', counting from 0. After the first row, ' + (src === 'twins' ? 'twin primes' : 'primes') + ' appear in ' + used + ' of ' + wd + ' columns. Only the φ(' + wd + ') = ' + ph + ' columns that share no factor with ' + wd + ' can hold primes, and Dirichlet proved each of them holds infinitely many. A sieve with this wheel skips ' + (100 * (1 - ph / wd)).toFixed(0) + '% of numbers without checking them.'; }
    var j = $('wJumps'); j.innerHTML = ''; var list = src === 'num' ? W.Q.slice(2, 8).filter(function (v) { return v <= 240; }) : [6, 30, 210, 12, 44, 180];
    list.forEach(function (v) { var b = document.createElement('button'); b.type = 'button'; b.className = 'rn-ghost'; b.textContent = 'width ' + v; b.addEventListener('click', function () { $('wW').value = v; drawWrap(); }); j.append(b); });
  }
  RN.def('wrapv', {
    init: function () {
      $('wSrc').addEventListener('change', function () { var s = $('wSrc').value; if (s === 'num') { var ok = RN.W.Q.filter(function (v) { return v <= 240 && v > 2; }); $('wW').value = ok.length ? ok[ok.length - 1] : 7; } drawWrap(); });
      $('wW').addEventListener('input', drawWrap); drawWrap();
    }, number: function () { drawWrap(); }, redraw: drawWrap
  });
})(window.RN);
