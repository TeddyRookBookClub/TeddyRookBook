/* The Rhythm of Numbers, Chapter VII (fractals), part 1: frHero (the zoom), patterns (pi's generalized fractions),
   ford (Ford circles). Conventions: core.js. The bar's number is RN.W: alpha = [0; a1, a2, …] (allTerms), int part. */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font, D = document;
  RN.fr = RN.fr || {};
  /* convergents of [0; t1, t2, …] as doubles: p[k]/q[k], k = 0 is 0/1, with p[-1]/q[-1] = 1/0 stored at index -1 via offset */
  function convs(t, max) {
    var P = [1, 0], Q = [0, 1]; /* index i+1 holds convergent i (i = -1, 0, 1, …) */
    for (var i = 0; i < t.length && i < (max || 60); i++) { var a = t[i]; P.push(a * P[P.length - 1] + P[P.length - 2]); Q.push(a * Q[Q.length - 1] + Q[Q.length - 2]); if (Q[Q.length - 1] > 9e15) break; }
    return { P: P, Q: Q }; /* convergent k is P[k+1]/Q[k+1] */
  }
  RN.fr.convs = convs;
  var SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  RN.fr.sup = function (n) { return String(n).split('').map(function (ch) { return SUP[ch] || ch; }).join(''); };
  function fmtN(n) { if (n < 1e6) return n.toLocaleString('en-US'); var e = Math.floor(Math.log10(n)); return (n / Math.pow(10, e)).toFixed(1) + ' × 10' + RN.fr.sup(e); }
  RN.fr.fmtN = fmtN;
  /* repeat test on the known terms: smallest period with at least 3 full repeats after a short start */
  RN.fr.period = function (t) {
    if (t.length < 6) return null;
    for (var s = 0; s <= 3; s++) for (var P = 1; P <= 8; P++) {
      if (t.length - s < 3 * P) continue; var ok = true;
      for (var i = s + P; i < t.length; i++) if (t[i] !== t[i - P]) { ok = false; break; }
      if (ok) return { s: s, P: P };
    }
    return null;
  };

  /* ---------- the zoom: each row is the gap between two convergents, stretched to full width ---------- */
  var zPl = null, zHot = -1;
  function zoomRows() {
    var W = RN.W, t = W.allTerms, L = +$('zLev').value, rows = [], cv = convs(t, L + 3);
    for (var k = 1; k <= L && k + 1 < cv.Q.length && k < t.length; k++) {
      var qk = cv.Q[k + 1], qk1 = cv.Q[k], pk = cv.P[k + 1], pk1 = cv.P[k];
      var a = t[k] || 0; /* a_{k+1} */
      var x = 0; for (var j = t.length - 1; j >= k; j--) x = 1 / (t[j] + x); x = 1 / x; /* complete quotient x_{k+1} */
      var flip = (k % 2) === 0; /* c_k − c_{k−1} has sign (−1)^(k−1) */
      rows.push({ k: k, a: a, qk: qk, qk1: qk1, lab0: pk1 + '/' + qk1, lab1: pk + '/' + qk, x: x, flip: flip, zoom: qk * qk1 / (cv.Q[2] * cv.Q[1]), last: k + 1 >= t.length });
    }
    return rows;
  }
  function drawZoom() {
    $('zLevV').textContent = $('zLev').value;
    var rows = zoomRows(), n = rows.length, cvs = $('zoomCan'), r = RN.setup(cvs, Math.max(220, 26 + n * 58)), x = r[0], w = r[1], H = r[2];
    x.clearRect(0, 0, w, H);
    var L = 12, R = w < 520 ? 12 : 92, pw = w - L - R, top = 22, gap = 58;
    function X(row, tt) { return L + pw * (row.flip ? 1 - tt : tt); }
    function tpos(row, j) { return j * row.qk / (row.qk1 + j * row.qk); }
    rows.forEach(function (row, i) {
      var y = top + i * gap, t0 = tpos(row, row.a), tx = tpos(row, row.x);
      if (i + 1 < n) { /* the funnel down to the next row */
        x.fillStyle = c('--rn-prime'); x.globalAlpha = 0.1; x.beginPath(); x.moveTo(X(row, t0), y + 4); x.lineTo(X(row, 1), y + 4); x.lineTo(X(rows[i + 1], 0), y + gap - 6); x.lineTo(X(rows[i + 1], 1), y + gap - 6); x.closePath(); x.fill(); x.globalAlpha = 1;
      }
      x.strokeStyle = i === zHot ? c('--rn-prime') : c('--rn-ink'); x.lineWidth = i === zHot ? 2.5 : 1.5; x.beginPath(); x.moveTo(L, y); x.lineTo(L + pw, y); x.stroke(); x.lineWidth = 1;
      /* the stretch where the number hides */
      x.fillStyle = c('--rn-prime'); x.globalAlpha = 0.85; var xa = X(row, t0), xb = X(row, 1); x.fillRect(Math.min(xa, xb), y - 3, Math.abs(xb - xa), 6); x.globalAlpha = 1;
      /* in-between fractions */
      x.strokeStyle = c('--rn-g'); var lim = Math.min(row.a, 400);
      for (var j = 1; j <= lim; j++) { var tx2 = X(row, tpos(row, j)), big = j === row.a; x.lineWidth = big ? 2 : 1; x.beginPath(); x.moveTo(tx2, y - (big ? 10 : 6)); x.lineTo(tx2, y + (big ? 10 : 6)); x.stroke(); }
      x.lineWidth = 1;
      [[0, row.lab0], [1, row.lab1]].forEach(function (e) { x.strokeStyle = c('--rn-ink'); var ex = X(row, e[0]); x.beginPath(); x.moveTo(ex, y - 9); x.lineTo(ex, y + 9); x.stroke(); });
      x.font = F(10, 1); x.fillStyle = c('--rn-muted'); x.textBaseline = 'top';
      var left = row.flip ? row.lab1 : row.lab0, right = row.flip ? row.lab0 : row.lab1;
      x.textAlign = 'left'; x.fillText(left, L, y + 12); x.textAlign = 'right'; x.fillText(right, L + pw, y + 12);
      x.textAlign = 'center'; x.fillStyle = c('--rn-g'); x.fillText(row.a > 400 ? row.a + ' steps (400 drawn)' : row.a + (row.a === 1 ? ' step' : ' steps'), L + pw / 2, y + 12);
      /* the number */
      var nx = X(row, tx); x.fillStyle = c('--rn-prime'); x.beginPath(); x.moveTo(nx, y - 5); x.lineTo(nx - 5, y - 13); x.lineTo(nx + 5, y - 13); x.closePath(); x.fill();
      x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = c('--rn-muted');
      if (R > 20) x.fillText('×' + fmtN(Math.round(row.zoom)), L + pw + 8, y); else if (i === 0) { }
    });
    var t = RN.W.allTerms, per = RN.fr.period(t);
    $('zTerms').textContent = '[' + (RN.W.int || 0) + '; ' + t.slice(0, 9).join(', ') + (t.length > 9 ? ', …' : '') + ']';
    var msg;
    if (RN.W.rational && !per) msg = 'It is a fraction, so the terms stop after ' + t.length + ' and so does the zoom.';
    else if (per) msg = per.P === 1 && per.s === 0 ? 'Yes, exactly: every term is ' + t[0] + ', so every zoom is the same picture (mirrored every other row).' : 'Yes' + (per.s ? ', after the first ' + per.s + ' term' + (per.s > 1 ? 's' : '') : '') + ': the terms repeat every ' + per.P + ', so the zoom repeats every ' + per.P + ' rows' + (per.P % 2 ? ' (mirrored, so exactly every ' + 2 * per.P + ')' : '') + '.';
    else if (RN.numKey === 'e') msg = 'Not exactly: e’s terms grow by a rule (1, 2, 1, 1, 4, 1, 1, 6, …), so the rows change in a pattern.';
    else msg = 'No: the terms (' + t.slice(0, 5).join(', ') + ', …) never repeat, so each zoom shows a new picture made by the same rule.';
    $('zSelf').textContent = msg;
  }
  RN.def('frHero', {
    init: function () {
      $('zLev').addEventListener('input', drawZoom);
      var seq = [];
      function build() { seq = []; zoomRows().forEach(function (row, i) { var m = Math.min(row.a, 12); for (var j = 0; j < m; j++) seq.push([i, j === m - 1]); seq.push([i, null]); }); }
      zPl = RN.player({ sec: $('frHero'), btn: $('zPlay'), loop: false, len: function () { return seq.length; }, reset: build, dur: function (i) { return seq[i] && seq[i][1] === null ? 0.3 : 0.11; },
        step: function (i, when) { var s = seq[i]; if (!s || s[1] === null) return; RN.note(when, RN.degree(s[0] * 2 + (s[1] ? 1 : 0)), 0.18, s[1] ? 0.32 : 0.2); },
        draw: function (i) { var h = i >= 0 && seq[i] ? seq[i][0] : -1; if (h !== zHot) { zHot = h; drawZoom(); } }, onStop: function () { zHot = -1; drawZoom(); } });
      build(); drawZoom();
    },
    number: drawZoom, redraw: drawZoom
  });

  /* ---------- 24 pi's patterned fractions, exact with BigInt ---------- */
  var PI90 = '314159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651';
  var PIB = BigInt(PI90.slice(0, 91)), TEN90 = 10n ** 90n;
  var FORMS = [
    { name: 'Brouncker', col: '--rn-prime', b0: 1n, a: function (k) { return BigInt((2 * k - 1) * (2 * k - 1)); }, b: function () { return 2n; }, fin: function (A, B) { return [4n * B, B + A]; } },
    { name: 'Lange', col: '--rn-teal', b0: 3n, a: function (k) { return BigInt((2 * k - 1) * (2 * k - 1)); }, b: function () { return 6n; }, fin: function (A, B) { return [3n * B + A, B]; } },
    { name: 'arctangent', col: '--rn-g', b0: 1n, a: function (k) { return BigInt(k * k); }, b: function (k) { return BigInt(2 * k + 1); }, fin: function (A, B) { return [4n * B, B + A]; } }
  ];
  var ERR = null;
  /* t = a_k/(b_k + t) for k = n..1, as A/B; then pi ≈ fin(A, B) = num/den */
  function approx(f, n) { var A = 0n, B = 1n; for (var k = n; k >= 1; k--) { var nA = f.a(k) * B, nB = f.b(k) * B + A; A = nA; B = nB; } return f.fin(A, B); }
  function digits(nd) { /* decimal string of num/den to 90 places */ var q = nd[0] * TEN90 / nd[1]; return q.toString(); }
  function errLog(nd) { /* log10 |num/den − pi| */ var d = nd[0] * TEN90 - PIB * nd[1]; if (d < 0n) d = -d; if (d === 0n) return -90; var ds = d.toString(), dn = nd[1].toString(); return (ds.length - dn.length - 90) + Math.log10(+('0.' + ds.slice(0, 15))) - Math.log10(+('0.' + dn.slice(0, 15))); }
  function computeErr() { ERR = FORMS.map(function (f) { var out = []; for (var n = 1; n <= 60; n++) out.push(errLog(approx(f, n))); return out; }); }
  function drawPat() {
    var n = +$('pcN').value; $('pcNV').textContent = n; if (!ERR) computeErr();
    $('pcRows').innerHTML = FORMS.map(function (f, i) {
      var nd = approx(f, n), s = digits(nd), good = 0; for (var k = 1; k < 90 && s[k] === PI90[k]; k++) good++;
      var shown = s[0] + '.' + s.slice(1, 11);
      return '<tr><td><span style="color:var(' + f.col + ');font-weight:700">' + f.name + '</span></td><td>' + shown + '…</td><td>' + good + '</td></tr>';
    }).join('');
    var cv = $('pcErr'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var L = 40, Rm = 10, T = 10, B = 26, pw = w - L - Rm, ph = H - T - B, ymin = -50;
    var X = function (k) { return L + pw * (k - 1) / 59; }, Y = function (v) { return T + ph * (Math.min(0.5, v) - 0.5) / (ymin - 0.5); };
    x.font = F(10, 1); x.textAlign = 'right'; x.textBaseline = 'middle';
    for (var e = 0; e >= ymin; e -= 10) { x.strokeStyle = c('--rn-line'); x.beginPath(); x.moveTo(L, Y(e)); x.lineTo(L + pw, Y(e)); x.stroke(); x.fillStyle = c('--rn-muted'); x.fillText(e === 0 ? '1' : '10' + RN.fr.sup(e), L - 4, Y(e)); }
    x.textAlign = 'center'; x.textBaseline = 'top'; [1, 10, 20, 30, 40, 50, 60].forEach(function (k) { x.fillText(k, X(k), T + ph + 6); });
    x.strokeStyle = c('--rn-muted'); x.setLineDash([3, 3]); x.beginPath(); x.moveTo(X(n), T); x.lineTo(X(n), T + ph); x.stroke(); x.setLineDash([]);
    ERR.forEach(function (arr, i) { x.strokeStyle = c(FORMS[i].col); x.lineWidth = 2; x.beginPath(); arr.forEach(function (v, k) { var yy = Y(Math.max(ymin, v)); if (k) x.lineTo(X(k + 1), yy); else x.moveTo(X(k + 1), yy); }); x.stroke(); x.fillStyle = c(FORMS[i].col); x.beginPath(); x.arc(X(n), Y(Math.max(ymin, arr[n - 1])), 4, 0, 7); x.fill(); });
    x.lineWidth = 1; x.textAlign = 'left'; x.fillStyle = c('--rn-muted'); x.textBaseline = 'bottom'; if (w > 420) x.fillText('distance from pi (each line is 10 billion times closer)', L + 6, T + ph - 4);
  }
  RN.def('patterns', { init: function () { $('pcN').addEventListener('input', drawPat); drawPat(); }, redraw: drawPat });

  /* ---------- 25 Ford circles ---------- */
  var fv = { cx: 0.5, hw: 0.5 }, fTap = null, fList = [];
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function drawFord() {
    var cvs = $('fordCan'), r = RN.setup(cvs), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var base = H - 22, sc = w / (2 * fv.hw), lo = fv.cx - fv.hw, hi = fv.cx + fv.hw, show = $('fConv').checked, W = RN.W, al = W.alpha % 1;
    var cv = convs(W.allTerms, 40), CONV = {};
    for (var i = 1; i < cv.Q.length; i++) CONV[cv.P[i] + '/' + cv.Q[i]] = 1;
    var Qmax = Math.min(400000, Math.floor(Math.sqrt(sc / 0.7))); fList = [];
    for (var q = 1; q <= Qmax; q++) {
      var rr = 1 / (2 * q * q), p0 = Math.ceil((lo - rr) * q), p1 = Math.floor((hi + rr) * q);
      for (var p = p0; p <= p1; p++) { if (gcd(Math.abs(p), q) !== 1) continue; fList.push([p, q]); if (fList.length > 6000) break; }
      if (fList.length > 6000) break;
    }
    var X = function (v) { return (v - lo) * sc; };
    var touch = {};
    if (fTap) fList.forEach(function (f) { if (Math.abs(f[0] * fTap[1] - f[1] * fTap[0]) === 1) touch[f[0] + '/' + f[1]] = 1; });
    x.save(); x.beginPath(); x.rect(0, 0, w, base); x.clip();
    var labs = [];
    fList.forEach(function (f) {
      var p = f[0], q = f[1], R = sc / (2 * q * q), x0 = X(p / q), key = p + '/' + q, isC = show && CONV[key], isT = fTap && fTap[0] === p && fTap[1] === q, isN = touch[key], pts = null;
      x.beginPath();
      if (R < 3000) x.arc(x0, base - R, R, 0, 7);
      else { /* a huge circle: only its bottom arc crosses the view */ pts = []; for (var px = -2; px <= w + 2; px += 3) { var dx = px - x0; if (Math.abs(dx) >= R) continue; var yb = dx * dx / (R + Math.sqrt(R * R - dx * dx)); if (base - yb < -50) continue; pts.push([px, base - yb]); } pts.forEach(function (pt, k) { if (k) x.lineTo(pt[0], pt[1]); else x.moveTo(pt[0], pt[1]); }); }
      if (isT || isN || isC) {
        x.fillStyle = c(isT || isN ? '--rn-teal' : '--rn-g'); x.globalAlpha = isT ? 0.3 : R < H * 0.7 ? 0.18 : 0.08;
        if (pts) { if (pts.length) { x.save(); x.beginPath(); pts.forEach(function (pt, k) { if (k) x.lineTo(pt[0], pt[1]); else x.moveTo(pt[0], pt[1]); }); x.lineTo(pts[pts.length - 1][0], -60); x.lineTo(pts[0][0], -60); x.closePath(); x.fill(); x.restore(); } } else x.fill();
        x.globalAlpha = 1;
      }
      x.strokeStyle = c(isT || isN ? '--rn-teal' : isC ? '--rn-g' : '--rn-muted'); x.lineWidth = isC || isT ? 2 : 1; x.globalAlpha = isC || isT || isN ? 1 : 0.6; x.stroke(); x.globalAlpha = 1; x.lineWidth = 1;
      if (R > 13 && x0 > -20 && x0 < w + 20) {
        x.font = F(Math.min(13, 8 + R / 12), 1); var yl = Math.max(14, base - Math.min(R * 0.9, H * 0.55)), tw = x.measureText(key).width / 2 + 3, lx = Math.max(tw, Math.min(w - tw, x0));
        if (!labs.some(function (L2) { return Math.abs(L2[1] - yl) < 14 && Math.abs(L2[0] - lx) < L2[2] + tw; })) { labs.push([lx, yl, tw]); x.textAlign = 'center'; x.textBaseline = 'bottom'; x.fillStyle = c(isC ? '--rn-g' : '--rn-ink'); x.fillText(key, lx, yl); }
      }
    });
    x.restore();
    x.strokeStyle = c('--rn-ink'); x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, base); x.lineTo(w, base); x.stroke(); x.lineWidth = 1;
    if (show && al >= lo && al <= hi) { x.strokeStyle = c('--rn-prime'); x.setLineDash([5, 4]); x.lineWidth = 1.5; x.beginPath(); x.moveTo(X(al), 0); x.lineTo(X(al), base + 8); x.stroke(); x.setLineDash([]); x.lineWidth = 1; }
    x.font = F(10, 1); x.fillStyle = c('--rn-muted'); x.textBaseline = 'top'; x.textAlign = 'left'; x.fillText(lo.toPrecision(10).replace(/0+$/, '').replace(/\.$/, ''), 4, base + 6); x.textAlign = 'right'; x.fillText(hi.toPrecision(10).replace(/0+$/, '').replace(/\.$/, ''), w - 4, base + 6);
    $('fView').textContent = 'width ' + (2 * fv.hw).toPrecision(3) + ' (zoom ×' + fmtN(Math.round(0.5 / fv.hw)) + '), ' + fList.length.toLocaleString('en-US') + ' circles';
    var hit = []; for (i = 1; i < cv.Q.length && hit.length < 5; i++) { var pp = cv.P[i], qq = cv.Q[i]; if (qq > 2e6) break; if (Math.abs(al - pp / qq) < 1 / (2 * qq * qq)) hit.push(pp + '/' + qq); }
    $('fHit').textContent = show ? (hit.join(', ') || '(none so far)') + ' …' : '(marks are off)';
  }
  function fordZoom(f, toward) { var nhw = Math.min(0.5, Math.max(1e-11, fv.hw / f)); if (toward != null) fv.cx = toward; fv.hw = nhw; clampF(); drawFord(); }
  function clampF() { fv.cx = Math.max(-0.5 + fv.hw, Math.min(1.5 - fv.hw, fv.cx)); }
  RN.def('ford', {
    init: function () {
      var cvs = $('fordCan');
      $('fDive').addEventListener('click', function () { var al = RN.W.alpha % 1; fordZoom(4, fv.cx + (al - fv.cx) * 0.9); fv.cx = al; clampF(); drawFord(); });
      $('fOut').addEventListener('click', function () { fordZoom(0.25); });
      $('fHome').addEventListener('click', function () { fv.cx = 0.5; fv.hw = 0.5; fTap = null; $('fTap').textContent = 'tap or click a circle'; drawFord(); });
      $('fConv').addEventListener('change', drawFord);
      cvs.addEventListener('click', function (e) {
        var b = cvs.getBoundingClientRect(), w = b.width, H = b.height, base = H - 22, sc = w / (2 * fv.hw), X = fv.cx - fv.hw + (e.clientX - b.left) / sc, Y = (base - (e.clientY - b.top)) / sc, found = null;
        fList.forEach(function (f) { var rr = 1 / (2 * f[1] * f[1]), dx = X - f[0] / f[1], dy = Y - rr; if (dx * dx + dy * dy < rr * rr) found = f; });
        if (!found) { fordZoom(2, X); return; }
        fTap = found; var nb = fList.filter(function (g) { return Math.abs(g[0] * found[1] - g[1] * found[0]) === 1; }).sort(function (a, b2) { return a[1] - b2[1]; }).slice(0, 4).map(function (g) { return g[0] + '/' + g[1]; });
        $('fTap').textContent = found[0] + '/' + found[1] + ', radius 1/' + (2 * found[1] * found[1]).toLocaleString('en-US') + (nb.length ? '; touches ' + nb.join(', ') + (nb.length >= 4 ? ', …' : '') : '');
        drawFord();
      });
      cvs.addEventListener('keydown', function (e) {
        var k = e.key; if (k === '+' || k === '=') fordZoom(2); else if (k === '-' || k === '_') fordZoom(0.5); else if (k === 'ArrowLeft') { fv.cx -= fv.hw * 0.25; clampF(); drawFord(); } else if (k === 'ArrowRight') { fv.cx += fv.hw * 0.25; clampF(); drawFord(); } else if (k === '0') $('fHome').click(); else return;
        e.preventDefault();
      });
      drawFord();
    },
    number: function () { fTap = null; drawFord(); }, redraw: drawFord
  });
})(window.RN);
