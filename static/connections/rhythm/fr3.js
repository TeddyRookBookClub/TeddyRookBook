/* The Rhythm of Numbers, Chapter VII (fractals), part 3: dust (continued-fraction Cantor sets), bulbs (the Mandelbrot
   set's Farey bulbs), fibword (the Fibonacci word fractal), gauss (the Gauss map and the Gauss–Kuzmin law).
   Conventions: core.js. Data below were computed for this page (see the layout's notes):
     DIMS  Hausdorff dimension of the numbers whose terms all lie in a set A ⊆ {1..6}, transfer-operator method
     PIK   counts of 1..12 among pi's first 10,000 terms (after the 3), then the count above 12; PIGM their geometric mean */
(function (RN) {
  'use strict';
  var $ = RN.$, c = RN.c, F = RN.font, D = document;
  var DIMS = {"12":0.53128,"13":0.45449,"14":0.41118,"15":0.38263,"16":0.36202,"23":0.33744,"24":0.30631,"25":0.28596,"26":0.27136,"34":0.26374,"35":0.24657,"36":0.23428,"45":0.22466,"46":0.21364,"56":0.2002,"123":0.70566,"124":0.66922,"125":0.64606,"126":0.6299,"134":0.60424,"135":0.58137,"136":0.56528,"145":0.54602,"146":0.52995,"156":0.5072,"234":0.4807,"235":0.46161,"236":0.44814,"245":0.43331,"246":0.4202,"256":0.40222,"345":0.38869,"346":0.37665,"356":0.3604,"456":0.33749,"1234":0.78895,"1235":0.77091,"1236":0.75886,"1245":0.74003,"1246":0.72752,"1256":0.70821,"1345":0.68211,"1346":0.66939,"1356":0.65021,"1456":0.61946,"2345":0.55964,"2346":0.54833,"2356":0.5318,"2456":0.50614,"3456":0.46273,"12345":0.83683,"12346":0.82691,"12356":0.81102,"12456":0.78335,"13456":0.72996,"23456":0.60948,"123456":0.86762};
  var PIK = [4206, 1672, 882, 597, 443, 282, 224, 186, 143, 123, 78, 86, 1078], PIGM = 2.6631960472;
  function gk(k) { return -Math.log2(1 - 1 / ((k + 1) * (k + 1))); }

  /* ---------- 29 Cantor dust ---------- */
  function allowed() { var A = []; for (var a = 1; a <= 6; a++) if ($('dA' + a).checked) A.push(a); return A; }
  function drawDust() {
    var A = allowed(), view = $('dView').value, cv = $('dustCan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var L = 10, pw = w - 20, rows = 7, rowH = (H - 46) / rows, top = 26;
    if (!A.length) { $('dDim').textContent = 'choose at least one term'; $('dCount').textContent = '0'; $('dNum').textContent = ''; return; }
    /* the window: all of [0,1], or the cylinder of the smallest allowed term (once or twice) */
    var start = [1, 0, 0, 1], lev0 = 0, a = A[0]; /* P[-1],Q[-1],P[0],Q[0] as p1,q1,p0,q0: convergent pair */
    function child(s, b) { return [s[2], s[3], b * s[2] + s[0], b * s[3] + s[1]]; } /* new pair: (p_n, q_n) = b·(p_{n-1},q_{n-1}) + (p_{n-2},q_{n-2}) */
    start = [1, 0, 0, 1]; /* (p_{-1}, q_{-1}) = (1, 0), (p_0, q_0) = (0, 1) */
    if (view !== 'all') { start = child(start, a); lev0 = 1; if (view === 'zoom2') { start = child(start, a); lev0 = 2; } }
    function ends(s) { var u = s[2] / s[3], v = (s[2] + s[0]) / (s[3] + s[1]); return u < v ? [u, v] : [v, u]; }
    var win = ends(start), sc = pw / (win[1] - win[0]), X = function (v) { return L + (v - win[0]) * sc; };
    var count = 0;
    x.fillStyle = c('--rn-g');
    (function rec(s, lev) {
      var e = ends(s), x0 = X(e[0]), x1 = X(e[1]), yy = top + (lev - lev0) * rowH;
      if (lev > lev0) x.fillRect(x0, yy, Math.max(0.8, x1 - x0), rowH * 0.55);
      if (lev - lev0 >= rows) { count++; return; }
      if (x1 - x0 < 0.6) { for (var k = lev - lev0 + 1; k <= rows; k++) x.fillRect(x0, top + k * rowH, 0.8, rowH * 0.55); count += Math.pow(A.length, rows - (lev - lev0)); return; }
      for (var i = 0; i < A.length; i++) rec(child(s, A[i]), lev + 1);
    })(start, lev0);
    x.fillStyle = c('--rn-ink'); x.fillRect(L, top - 8, pw, 2);
    x.font = F(10, 1); x.fillStyle = c('--rn-muted'); x.textBaseline = 'top'; x.textAlign = 'left'; x.fillText(+win[0].toPrecision(5), L, H - 16); x.textAlign = 'right'; x.fillText(+win[1].toPrecision(5), L + pw, H - 16);
    x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText(view === 'all' ? 'row n: the first n terms are all allowed' : 'inside the piece that starts ' + (view === 'zoom' ? '[0; ' + a + ', …]' : '[0; ' + a + ', ' + a + ', …]'), L + pw / 2, 0);
    var al = RN.W.alpha % 1; if (al >= win[0] && al <= win[1]) { x.fillStyle = c('--rn-prime'); x.beginPath(); x.moveTo(X(al), top - 4); x.lineTo(X(al) - 5, top - 13); x.lineTo(X(al) + 5, top - 13); x.closePath(); x.fill(); }
    var key = A.join(''), dim = A.length === 1 ? 0 : DIMS[key];
    $('dDim').textContent = A.length === 1 ? '0 (only one number: [0; ' + a + ', ' + a + ', …])' : dim.toFixed(5) + (key === '12' ? ' (0.531280506…)' : '');
    $('dCount').textContent = A.length + '⁷ = ' + Math.pow(A.length, 7).toLocaleString('en-US');
    var t = RN.W.allTerms, bad = -1; for (var i = 0; i < Math.min(t.length, 30); i++) if (A.indexOf(t[i]) < 0) { bad = i; break; }
    $('dNum').textContent = bad < 0 ? 'in this dust (its first ' + Math.min(t.length, 30) + ' terms are all allowed)' : 'not in it: term ' + (bad + 1) + ' is ' + t[bad];
  }
  RN.def('dust', {
    init: function () { for (var a = 1; a <= 6; a++) $('dA' + a).addEventListener('change', drawDust); $('dView').addEventListener('change', drawDust); drawDust(); },
    number: drawDust, redraw: drawDust
  });

  /* ---------- 30 the Mandelbrot set's bulbs ---------- */
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  var FRACS = []; (function () { for (var q = 2; q <= 8; q++) for (var p = 1; p < q; p++) if (gcd(p, q) === 1) FRACS.push([p, q]); FRACS.push([5, 13], [8, 21]); FRACS.sort(function (a, b) { return a[0] / a[1] - b[0] / b[1]; }); })();
  function root(p, q) { var t = 2 * Math.PI * p / q; return [Math.cos(t) / 2 - Math.cos(2 * t) / 4, Math.sin(t) / 2 - Math.sin(2 * t) / 4]; }
  function normal(p, q) { var t = 2 * Math.PI * p / q, dx = -Math.sin(t) / 2 + Math.sin(2 * t) / 2, dy = Math.cos(t) / 2 - Math.cos(2 * t) / 2, m = Math.hypot(dx, dy) || 1; return [dy / m, -dx / m]; }
  function bulb(p, q) { var r0 = root(p, q), n = normal(p, q), rb = Math.sin(Math.PI * p / q) / (q * q); return { cx: r0[0] + n[0] * rb, cy: r0[1] + n[1] * rb, r: rb, root: r0, n: n }; }
  function parents(p, q) { var a = 0, b = 1, cc = 1, d = 1; for (var i = 0; i < 200; i++) { var mp = a + cc, mq = b + d; if (mp === p && mq === q) return [[a, b], [cc, d]]; if (p * mq < mp * q) { cc = mp; d = mq; } else { a = mp; b = mq; } } return null; }
  function cycle(p, q) { var B = bulb(p, q), cr = B.cx, ci = B.cy, zr = 0, zi = 0, t; for (var i = 0; i < 4000; i++) { t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; } var pts = []; for (i = 0; i < q * 2 && i < 60; i++) { pts.push([zr, zi]); t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; }
    var per = 0; for (var k = 1; k <= pts.length - 1; k++) if (Math.hypot(pts[k][0] - pts[0][0], pts[k][1] - pts[0][1]) < 1e-6) { per = k; break; } return { pts: pts.slice(0, per || q), per: per }; }
  var mbImg = null, mbKey = '', mbHead = -1, mbPl = null, mbSeq = [];
  function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (ch) { return ch + ch; }).join(''); var v = parseInt(h, 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function mbView(w, H) { var cx = -0.45, cy = 0, sc = Math.min(w / 2.75, H / 2.3); return { cx: cx, cy: cy, sc: sc }; }
  function render(w, H, V) {
    var key = w + 'x' + H + RN.dark(); if (mbImg && mbKey === key) return mbImg;
    var cv = D.createElement('canvas'); cv.width = w; cv.height = H; var g = cv.getContext('2d'), im = g.createImageData(w, H), d = im.data, col = hex(c('--rn-g').indexOf('#') === 0 ? c('--rn-g') : '#00562f'), it = 160;
    for (var j = 0; j < H; j++) for (var i = 0; i < w; i++) {
      var cr = V.cx + (i - w / 2) / V.sc, ci = V.cy - (j - H / 2) / V.sc, n = 0, zr = 0, zi = 0, t;
      var qx = (cr - 0.25) * (cr - 0.25) + ci * ci;
      if (qx * (qx + (cr - 0.25)) < 0.25 * ci * ci || (cr + 1) * (cr + 1) + ci * ci < 0.0625) n = it;
      else for (; n < it; n++) { t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; if (zr * zr + zi * zi > 4) break; }
      var o = (j * w + i) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = n >= it ? 150 : Math.min(90, n * 3);
    }
    g.putImageData(im, 0, 0); mbImg = cv; mbKey = key; return cv;
  }
  function pick() { var v = $('mbPick').value.split('/'); return [+v[0], +v[1]]; }
  function drawMb() {
    var cv = $('mbCan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var V = mbView(w, H), img = render(Math.round(w), Math.round(H), V);
    x.drawImage(img, 0, 0, w, H);
    var P = function (re, im) { return [w / 2 + (re - V.cx) * V.sc, H / 2 - (im - V.cy) * V.sc]; };
    var sel = pick(), par = parents(sel[0], sel[1]) || [];
    function ring(pq, col, lw) { if (pq[0] === 0 || pq[0] === pq[1]) { var cu = P(0.25, 0); x.strokeStyle = c(col); x.lineWidth = lw; x.beginPath(); x.arc(cu[0], cu[1], 7, 0, 7); x.stroke(); x.lineWidth = 1; return; } var B = bulb(pq[0], pq[1]), m = P(B.cx, B.cy); x.strokeStyle = c(col); x.lineWidth = lw; x.beginPath(); x.arc(m[0], m[1], Math.max(4, B.r * V.sc + 3), 0, 7); x.stroke(); x.lineWidth = 1; }
    x.font = F(w < 520 ? 9 : 11, 1); x.textAlign = 'center'; x.textBaseline = 'middle';
    FRACS.forEach(function (f) { if (f[1] > (w < 520 ? 5 : 7)) return; var B = bulb(f[0], f[1]), d2 = 2 * B.r + 0.1 + 0.02 * (f[1] > 4), lp = P(B.root[0] + B.n[0] * d2, B.root[1] + B.n[1] * d2); x.fillStyle = c('--rn-ink'); x.fillText(f[0] + '/' + f[1], lp[0], lp[1]); });
    par.forEach(function (pq) { ring(pq, '--rn-teal', 2); });
    ring(sel, '--rn-prime', 2.5);
    /* the bar's number, walked around the heart */
    var al = RN.W.alpha % 1, t = 2 * Math.PI * al, hp = P(Math.cos(t) / 2 - Math.cos(2 * t) / 4, Math.sin(t) / 2 - Math.sin(2 * t) / 4); x.fillStyle = c('--rn-g'); x.strokeStyle = c('--rn-panel'); x.beginPath(); x.arc(hp[0], hp[1], 5, 0, 7); x.fill(); x.stroke();
    /* inset: the attracting cycle, in the z-plane */
    var cy = cycle(sel[0], sel[1]), pts = cy.pts, S = Math.min(130, w * 0.27), ox = w < 520 ? 6 : w - S - 8, oy = 8;
    x.fillStyle = c('--rn-panel'); x.strokeStyle = c('--rn-line'); x.fillRect(ox, oy, S, S); x.strokeRect(ox, oy, S, S);
    var mx = 0, my = 0; pts.forEach(function (p) { mx += p[0] / pts.length; my += p[1] / pts.length; }); var ext = 1e-9; pts.forEach(function (p) { ext = Math.max(ext, Math.abs(p[0] - mx), Math.abs(p[1] - my)); });
    var Z = function (p) { return [ox + S / 2 + (p[0] - mx) / ext * S * 0.38, oy + S / 2 + 8 - (p[1] - my) / ext * S * 0.38]; };
    x.strokeStyle = c('--rn-muted'); x.beginPath(); pts.concat([pts[0]]).forEach(function (p, i) { var z = Z(p); if (i) x.lineTo(z[0], z[1]); else x.moveTo(z[0], z[1]); }); x.globalAlpha = 0.5; x.stroke(); x.globalAlpha = 1;
    pts.forEach(function (p, i) { var z = Z(p); x.fillStyle = i === mbHead ? c('--rn-teal') : c('--rn-prime'); x.beginPath(); x.arc(z[0], z[1], i === mbHead ? 6 : 4, 0, 7); x.fill(); });
    x.font = F(10); x.fillStyle = c('--rn-muted'); x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('its ' + pts.length + '-point cycle', ox + S / 2, oy + 3);
    $('mbPar').textContent = par.length ? par.map(function (f) { return f[0] + '/' + f[1]; }).join(' and ') + ' → ' + (par[0][0] + par[1][0]) + '/' + (par[0][1] + par[1][1]) + (par.some(function (f) { return f[0] === 0 || f[0] === f[1]; }) ? ' (0/1 and 1/1 are the heart’s cusp)' : '') : '';
    $('mbCyc').textContent = (cy.per || '?') + ' points, each step ' + sel[0] + '/' + sel[1] + ' of a turn';
    $('mbSize').textContent = '1/(2' + (sel[1] > 9 ? '^' + sel[1] : RN.fr && RN.fr.sup ? RN.fr.sup(sel[1]) : '^' + sel[1]) + ' − 1) = 1/' + (Math.pow(2, sel[1]) - 1).toLocaleString('en-US');
  }
  RN.def('bulbs', {
    init: function () {
      var s = $('mbPick'); FRACS.forEach(function (f) { var o = D.createElement('option'); o.value = f[0] + '/' + f[1]; o.textContent = f[0] + '/' + f[1]; s.append(o); }); s.value = '2/5';
      s.addEventListener('change', drawMb); s.addEventListener('input', drawMb);
      mbPl = RN.player({ sec: $('bulbs'), btn: $('mbPlay'), loop: false,
        reset: function () { var sel = pick(), cy = cycle(sel[0], sel[1]).pts, mx = 0, my = 0; cy.forEach(function (p) { mx += p[0] / cy.length; my += p[1] / cy.length; }); mbSeq = []; for (var rep = 0; rep < 3; rep++) cy.forEach(function (p, i) { var ang = (Math.atan2(p[1] - my, p[0] - mx) / (2 * Math.PI) + 1) % 1; mbSeq.push([i, Math.round(ang * 10)]); }); },
        len: function () { return mbSeq.length; }, dur: function () { return 0.2; },
        step: function (i, when) { var s2 = mbSeq[i]; RN.note(when, RN.degree(s2[1]), 0.22, s2[0] === 0 ? 0.32 : 0.22); },
        draw: function (i) { mbHead = i >= 0 && mbSeq[i] ? mbSeq[i][0] : -1; drawMb(); } });
      drawMb();
    },
    number: drawMb, redraw: function () { mbImg = null; drawMb(); }
  });

  /* ---------- 31 the Fibonacci word fractal ---------- */
  var fwShown = 0, fwRaf = 0, fwPath = null;
  function fwBuild() {
    var N = Math.min(RN.W.word.length, Math.round(Math.pow(2, +$('fwN').value))), wd = RN.W.word, px = new Float32Array(N + 1), py = new Float32Array(N + 1), dir = 0, X = 0, Y = 0, turns = 0;
    var DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
    for (var n = 1; n <= N; n++) { X += DX[dir]; Y += DY[dir]; px[n] = X; py[n] = Y; if (wd[n - 1]) { turns++; dir = (dir + (n % 2 === 0 ? 1 : 3)) % 4; } }
    fwPath = { N: N, px: px, py: py, turns: turns };
  }
  function drawFw() {
    if (!fwPath) fwBuild();
    var P = fwPath, upto = fwShown || P.N, cv = $('fwCan'), r = RN.setup(cv), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (var i = 0; i <= P.N; i++) { if (P.px[i] < x0) x0 = P.px[i]; if (P.px[i] > x1) x1 = P.px[i]; if (P.py[i] < y0) y0 = P.py[i]; if (P.py[i] > y1) y1 = P.py[i]; }
    var sc = Math.min((w - 20) / Math.max(1, x1 - x0), (H - 20) / Math.max(1, y1 - y0)), ox = (w - (x1 - x0) * sc) / 2, oy = (H - (y1 - y0) * sc) / 2;
    x.strokeStyle = c('--rn-g'); x.lineWidth = sc > 3 ? 1.6 : 1; x.lineJoin = 'round'; x.beginPath();
    for (i = 0; i <= upto; i++) { var X = ox + (P.px[i] - x0) * sc, Y = H - oy - (P.py[i] - y0) * sc; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); } x.stroke(); x.lineWidth = 1;
    x.fillStyle = c('--rn-prime'); x.beginPath(); x.arc(ox + (P.px[0] - x0) * sc, H - oy - (P.py[0] - y0) * sc, 4, 0, 7); x.fill();
    $('fwNV').textContent = P.N.toLocaleString('en-US');
    $('fwName').textContent = RN.W.name;
    $('fwInfo').textContent = upto.toLocaleString('en-US') + ' steps, ' + P.turns.toLocaleString('en-US') + ' turns; ' + (x1 - x0) + ' by ' + (y1 - y0) + ' squares';
  }
  function fwStop() { if (fwRaf) cancelAnimationFrame(fwRaf); fwRaf = 0; $('fwPlay').textContent = '▶ Draw it step by step'; $('fwPlay').setAttribute('aria-pressed', 'false'); }
  RN.def('fibword', {
    init: function () {
      $('fwN').addEventListener('input', function () { fwStop(); fwShown = 0; fwBuild(); drawFw(); });
      $('fwPlay').setAttribute('aria-pressed', 'false');
      $('fwPlay').addEventListener('click', function () {
        if (fwRaf) { fwStop(); return; }
        var N = fwPath.N;
        if (RN.reduced) { fwShown = !fwShown || fwShown >= N ? Math.ceil(N / 10) : Math.min(N, fwShown + Math.ceil(N / 10)); drawFw(); $('fwPlay').textContent = fwShown >= N ? '▶ Draw it step by step' : 'Next tenth ›'; if (fwShown >= N) fwShown = 0; return; }
        fwShown = 1; $('fwPlay').textContent = '■ Stop'; $('fwPlay').setAttribute('aria-pressed', 'true');
        var t0 = performance.now();
        (function fr(ts) { if ($('fibword')._rnVis === false) { fwRaf = requestAnimationFrame(fr); return; } fwShown = Math.min(N, Math.max(1, Math.round(N * (ts - t0) / 6000))); drawFw(); if (fwShown < N) fwRaf = requestAnimationFrame(fr); else { fwShown = 0; fwStop(); drawFw(); } })(t0);
      });
      fwBuild(); drawFw();
    },
    number: function () { fwStop(); fwShown = 0; fwBuild(); drawFw(); }, redraw: drawFw,
    show: function (v) { if (!v && fwRaf) { /* keeps its place; the frame loop idles while off-screen */ } }
  });

  /* ---------- 32 the Gauss map and the Gauss–Kuzmin law ---------- */
  var gkN = 0, gkRand = null, gkE = null;
  function eTerms(n) { var t = []; for (var k = 1; t.length < n; k++) t.push(1, 2 * k, 1); return t.slice(0, n); }
  function randTerms() {
    var s = '', i; try { var b = new Uint32Array(500); crypto.getRandomValues(b); for (i = 0; i < 500; i++) s += String(b[i] % 100000000).padStart(8, '0'); } catch (e) { for (i = 0; i < 4000; i++) s += Math.floor(Math.random() * 10); }
    var p = BigInt(s), q = 10n ** BigInt(s.length), t = [];
    while (q !== 0n && t.length < 6000) { var a = p / q; t.push(Number(a)); var r = p - a * q; p = q; q = r; }
    return t.slice(1, 3801); /* drop the 0 in front; keep 3,800 terms, which 4,000 digits fix (Lochs: about 0.97 terms per digit) */
  }
  function src() {
    var v = $('gkSrc').value;
    if (v === 'pi') return { counts: PIK, n: 10000, gm: PIGM, name: 'pi' };
    var t = v === 'e' ? (gkE || (gkE = eTerms(10000))) : v === 'rand' ? (gkRand || (gkRand = randTerms())) : RN.W.allTerms;
    var cnt = []; for (var k = 0; k < 13; k++) cnt.push(0); var lg = 0; t.forEach(function (a) { cnt[Math.min(12, a - 1)]++; lg += Math.log(a); });
    return { counts: cnt, n: t.length, gm: Math.exp(lg / t.length), name: v === 'e' ? 'e' : v === 'rand' ? 'a random number' : RN.W.name };
  }
  function chiP(X, df) { /* upper tail of chi-square, Wilson–Hilferty */ var z = (Math.pow(X / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df)); var t = 1 / (1 + 0.2316419 * Math.abs(z)), dd = 0.3989423 * Math.exp(-z * z / 2), pr = dd * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? pr : 1 - pr; }
  function drawGk() {
    /* left: the cobweb of the bar's number */
    var W = RN.W, t = W.allTerms, cv = $('gkCob'), r = RN.setupSq(cv, 320), x = r[0], w = r[1], H = r[2]; x.clearRect(0, 0, w, H);
    var m = 22, S = Math.min(w, H) - 2 * m, ox = (w - S) / 2, X = function (v) { return ox + v * S; }, Y = function (v) { return m + (1 - v) * S; };
    x.strokeStyle = c('--rn-line'); x.strokeRect(X(0), Y(1), S, S); x.beginPath(); x.moveTo(X(0), Y(0)); x.lineTo(X(1), Y(1)); x.stroke();
    x.strokeStyle = c('--rn-ink'); x.lineWidth = 1.2;
    for (var k = 1; k <= 60; k++) { x.beginPath(); var lo = 1 / (k + 1), hi = 1 / k; for (var i = 0; i <= 24; i++) { var u = lo + (hi - lo) * i / 24, v = 1 / u - k; if (i) x.lineTo(X(u), Y(Math.min(1, v))); else x.moveTo(X(u), Y(Math.min(1, v))); } x.stroke(); }
    x.lineWidth = 1;
    function tail(j) { var v = 0; for (var i2 = t.length - 1; i2 >= j; i2--) v = 1 / (t[i2] + v); return v; } /* [0; t_j, t_{j+1}, …] */
    var steps = Math.min(gkN, t.length - 1), xv = tail(0);
    x.strokeStyle = c('--rn-prime'); x.lineWidth = 1.6; x.beginPath(); x.moveTo(X(xv), Y(0));
    for (var s = 0; s < steps; s++) { var nx = tail(s + 1); x.lineTo(X(xv), Y(nx)); x.lineTo(X(nx), Y(nx)); xv = nx; }
    x.stroke(); x.lineWidth = 1; x.fillStyle = c('--rn-prime'); x.beginPath(); x.arc(X(xv), Y(steps ? xv : 0), 4, 0, 7); x.fill();
    x.font = F(10, 1); x.fillStyle = c('--rn-muted'); x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('x → 1/x − ⌊1/x⌋', ox + S / 2, Y(0) + 4);
    $('gkRead').textContent = steps ? t.slice(0, steps).join(', ') : 'press Step';
    /* right: the counts against the law */
    var Sx = src(), cb = $('gkBars'), r2 = RN.setup(cb), y = r2[0], w2 = r2[1], H2 = r2[2]; y.clearRect(0, 0, w2, H2);
    var L = 34, B = 22, T = 10, pw = w2 - L - 6, ph = H2 - T - B, bw = pw / 13, top = 0.45, Yb = function (v) { return T + ph * (1 - v / top); };
    y.font = F(10, 1); y.textAlign = 'right'; y.textBaseline = 'middle'; [0, 0.1, 0.2, 0.3, 0.4].forEach(function (v) { y.strokeStyle = c('--rn-line'); y.beginPath(); y.moveTo(L, Yb(v)); y.lineTo(L + pw, Yb(v)); y.stroke(); y.fillStyle = c('--rn-muted'); y.fillText(Math.round(v * 100) + '%', L - 4, Yb(v)); });
    var X2 = 0, law = 0;
    for (k = 0; k < 13; k++) {
      var pk = k < 12 ? gk(k + 1) : 1 - law; if (k < 12) law += pk; var share = Sx.counts[k] / Sx.n, bx = L + k * bw;
      y.fillStyle = c('--rn-g'); y.fillRect(bx + bw * 0.15, Yb(Math.min(top, share)), bw * 0.7, Yb(0) - Yb(Math.min(top, share)));
      y.strokeStyle = c('--rn-prime'); y.lineWidth = 2.5; y.beginPath(); y.moveTo(bx + bw * 0.05, Yb(pk)); y.lineTo(bx + bw * 0.95, Yb(pk)); y.stroke(); y.lineWidth = 1;
      y.fillStyle = c('--rn-muted'); y.textAlign = 'center'; y.textBaseline = 'top'; y.fillText(k < 12 ? k + 1 : '13+', bx + bw / 2, T + ph + 5);
      var e = Sx.n * pk; X2 += (Sx.counts[k] - e) * (Sx.counts[k] - e) / e;
    }
    $('gkOnes').textContent = (100 * Sx.counts[0] / Sx.n).toFixed(1) + '% of ' + Sx.n.toLocaleString('en-US') + ' (law: 41.5%)';
    $('gkMean').textContent = Sx.gm.toFixed(4) + ' (Khinchin: 2.6855)';
    var pv = chiP(X2, 12);
    $('gkFit').textContent = Sx.n < 200 ? 'too few terms to judge (' + Sx.n + ')' : 'χ² = ' + X2.toFixed(1) + ', ' + (pv > 0.01 ? 'within chance (p ≈ ' + pv.toFixed(2) + ')' : 'far from the law (p < 0.01)');
    $('gkRoll').hidden = $('gkSrc').value !== 'rand';
  }
  RN.def('gauss', {
    init: function () {
      $('gkStep').addEventListener('click', function () { gkN = Math.min(gkN + 1, RN.W.allTerms.length - 1); drawGk(); });
      $('gkReset').addEventListener('click', function () { gkN = 0; drawGk(); });
      $('gkSrc').addEventListener('change', drawGk);
      $('gkRoll').addEventListener('click', function () { $('gkSrc').value = 'rand'; gkRand = randTerms(); drawGk(); });
      drawGk();
    },
    number: function () { gkN = 0; drawGk(); }, redraw: drawGk
  });
})(window.RN);
