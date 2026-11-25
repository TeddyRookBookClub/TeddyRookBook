/* "After the Riemann Hypothesis": the figures on the pages of the single results
   (layouts/connections/rhythm-rh-item.html). Each <div class="rhv" data-viz="NAME"> gets the figure NAME below.
   Everything is computed in the browser from first principles: a sieve for the primes, the Riemann-Siegel formula
   (and Borwein's series at low height) for the zeta function. Nothing here is a proof; the figures are for looking. */
(function () {
  'use strict';
  var hosts = [].slice.call(document.querySelectorAll('.rhv[data-viz]')); if (!hosts.length) return;
  var root = document.querySelector('.rn') || document.body;
  function cssv(n, d) { var v = getComputedStyle(root).getPropertyValue(n).trim(); return v || d; }
  function C() { return { g: cssv('--rn-g', '#00562f'), gold: cssv('--rn-gold', '#b8963e'), ink: cssv('--rn-ink', '#1e1e1e'), mut: cssv('--rn-muted', '#566159'), line: cssv('--rn-line', '#d5ddd8'), rose: cssv('--rn-rose', '#a8325e'), blue: cssv('--rn-blue', '#1d5fb8'), bg: cssv('--rn-panel', '#fff') }; }
  var EG = 0.5772156649015329;

  /* ---------- numbers ---------- */
  var SV = null, SN = 0, PR = null;
  function sieve(N) {
    if (SV && SN >= N) return SV;
    var s = new Uint8Array(N + 1); s[0] = s[1] = 1;
    for (var i = 2; i * i <= N; i++) if (!s[i]) for (var j = i * i; j <= N; j += i) s[j] = 1;
    SV = s; SN = N; PR = null; return s;
  }
  function primes(N) { var s = sieve(N); if (PR && PR.N === SN) { return N === SN ? PR.a : PR.a.filter(function (p) { return p <= N; }); } var a = []; for (var i = 2; i <= SN; i++) if (!s[i]) a.push(i); PR = { N: SN, a: a }; return N === SN ? a : a.filter(function (p) { return p <= N; }); }
  function li(x) { var L = Math.log(x), s = EG + Math.log(L), t = 1; for (var k = 1; k < 200; k++) { t *= L / k; s += t / k; if (t / k < 1e-13 * Math.abs(s)) break; } return s; }
  function powmod(b, e, m) { var r = 1; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; }   // m < 9e7
  function logspace(a, b, n) { var o = []; for (var i = 0; i < n; i++) o.push(Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * i / (n - 1))); return o; }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- the zeta function on the critical line ---------- */
  function theta(t) {                         // the Riemann-Siegel theta function: arg Gamma(1/4 + it/2) - (t/2) ln pi
    if (t > 40) return t / 2 * Math.log(t / (2 * Math.PI)) - t / 2 - Math.PI / 8 + 1 / (48 * t) + 7 / (5760 * t * t * t);
    var wr = 12.25, wi = t / 2, r2 = wr * wr + wi * wi, s = (wr - 0.5) * Math.atan2(wi, wr) + wi * 0.5 * Math.log(r2) - wi - wi / (12 * r2);   // Im ln Gamma(w), w = z + 12 (Stirling)
    for (var j = 0; j < 12; j++) s -= Math.atan2(wi, 0.25 + j);
    return s - t / 2 * Math.log(Math.PI);
  }
  var BD = null;
  function borwein(t) {                        // zeta(1/2 + it), Borwein's alternating series with n = 70
    var n = 70, k, i;
    if (!BD) { BD = [1]; var term = 1; for (i = 1; i <= n; i++) { term *= 4 * (n + i - 1) * (n - i + 1) / ((2 * i) * (2 * i - 1)); BD.push(BD[i - 1] + term); } }
    var dn = BD[n], re = 0, im = 0;
    for (k = 0; k < n; k++) { var w = (k % 2 ? -1 : 1) * (BD[k] - dn) / dn, a = Math.pow(k + 1, -0.5), ph = -t * Math.log(k + 1); re += w * a * Math.cos(ph); im += w * a * Math.sin(ph); }
    var pr = Math.SQRT2 * Math.cos(t * Math.LN2), pi = -Math.SQRT2 * Math.sin(t * Math.LN2), dr = 1 - pr, di = -pi, dd = dr * dr + di * di;   // 1 - 2^(1-s)
    return [-(re * dr + im * di) / dd, -(im * dr - re * di) / dd];
  }
  function Z(t) {
    if (t < 1e-9) return -1.4603545;
    if (t < 60) { var z = borwein(t), th = theta(t); return z[0] * Math.cos(th) - z[1] * Math.sin(th); }
    var a = Math.sqrt(t / (2 * Math.PI)), N = Math.floor(a), p = a - N, s = 0, T = theta(t);
    for (var n = 1; n <= N; n++) s += Math.cos(T - t * Math.log(n)) / Math.sqrt(n);
    var c = Math.cos(2 * Math.PI * p); if (Math.abs(c) < 1e-7) c = 1e-7;
    return 2 * s + (N % 2 ? 1 : -1) * Math.pow(t / (2 * Math.PI), -0.25) * Math.cos(2 * Math.PI * (p * p - p - 1 / 16)) / c;
  }
  function zeros(T) { var o = [], h = 0.04, a = 1, fa = Z(a); for (var b = a + h; b <= T; b += h) { var fb = Z(b); if (fa * fb < 0) { var lo = a, hi = b, fl = fa; for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2, fm = Z(m); if (fl * fm <= 0) hi = m; else { lo = m; fl = fm; } } o.push((lo + hi) / 2); } a = b; fa = fb; } return o; }

  /* ---------- a small plotter ---------- */
  function Plot(el, H, o) {
    o = o || {}; var cv = document.createElement('canvas'); cv.className = 'rhv-c'; el.insertBefore(cv, el.querySelector('.rhv-n'));
    var W = Math.max(280, el.clientWidth), dpr = window.devicePixelRatio || 1; H = W < 480 ? Math.round(H * 0.82) : H;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = '100%'; cv.style.height = H + 'px';
    var x = cv.getContext('2d'); x.scale(dpr, dpr); var c = C(), m = { l: 52, r: 12, t: 12, b: 34 }, P = { x: x, W: W, H: H, c: c, cv: cv };
    var X0, X1, Y0, Y1, lx = !!o.logx, ly = !!o.logy;
    function tx(v) { return lx ? Math.log(v) : v; } function ty(v) { return ly ? Math.log(v) : v; }
    P.px = function (v) { return m.l + (tx(v) - X0) / (X1 - X0) * (W - m.l - m.r); };
    P.py = function (v) { return H - m.b - (ty(v) - Y0) / (Y1 - Y0) * (H - m.t - m.b); };
    function nice(a, b, n) { var s = (b - a) / n, p = Math.pow(10, Math.floor(Math.log(s) / Math.LN10)), f = s / p, k = f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10; return k * p; }
    function lab(v) { var a = Math.abs(v); if (a >= 1e6) { var e = Math.round(Math.log(a) / Math.LN10 * 100) / 100; return (Math.abs(a / Math.pow(10, Math.floor(e)) - 1) < 1e-9 ? '10^' + Math.floor(e) : (v / 1e6) + 'M'); } if (a >= 1000) return fmt(v); return String(Math.round(v * 1000) / 1000); }
    P.range = function (a, b, cc, d) { X0 = tx(a); X1 = tx(b); Y0 = ty(cc); Y1 = ty(d); return P; };
    P.axes = function (xl, yl) {
      x.clearRect(0, 0, W, H); x.font = '11px system-ui,sans-serif'; x.fillStyle = c.mut; x.strokeStyle = c.line; x.lineWidth = 1;
      var i, v, s;
      if (o.nox) { /* the caller labels the x axis */ }
      else if (lx) { for (i = Math.ceil(X0 / Math.LN10 - 1e-9); i <= X1 / Math.LN10 + 1e-9; i++) { v = Math.pow(10, i); s = P.px(v); x.beginPath(); x.moveTo(s, m.t); x.lineTo(s, H - m.b); x.stroke(); x.textAlign = 'center'; x.fillText(i < 4 ? fmt(v) : '10^' + i, s, H - m.b + 13); } }
      else { var st = nice(X0, X1, W < 480 ? 4 : 7); for (v = Math.ceil(X0 / st - 1e-9) * st; v <= X1 + 1e-9; v += st) { s = P.px(v); x.beginPath(); x.moveTo(s, m.t); x.lineTo(s, H - m.b); x.stroke(); x.textAlign = 'center'; x.fillText(lab(v), s, H - m.b + 13); } }
      if (ly) { for (i = Math.ceil(Y0 / Math.LN10 - 1e-9); i <= Y1 / Math.LN10 + 1e-9; i++) { v = Math.pow(10, i); s = P.py(v); x.beginPath(); x.moveTo(m.l, s); x.lineTo(W - m.r, s); x.stroke(); x.textAlign = 'right'; x.fillText(i < 4 ? fmt(v) : '10^' + i, m.l - 5, s + 4); } }
      else { var sy = nice(Y0, Y1, 5); for (v = Math.ceil(Y0 / sy - 1e-9) * sy; v <= Y1 + 1e-9; v += sy) { s = P.py(v); x.beginPath(); x.moveTo(m.l, s); x.lineTo(W - m.r, s); x.stroke(); x.textAlign = 'right'; x.fillText(lab(Math.abs(v) < 1e-12 ? 0 : v), m.l - 5, s + 4); } }
      x.textAlign = 'center'; if (xl) x.fillText(xl, (m.l + W - m.r) / 2, H - 5);
      if (yl) { x.save(); x.translate(11, (m.t + H - m.b) / 2); x.rotate(-Math.PI / 2); x.fillText(yl, 0, 0); x.restore(); }
      x.save(); x.beginPath(); x.rect(m.l, m.t - 2, W - m.l - m.r, H - m.t - m.b + 4); x.clip(); return P;
    };
    P.line = function (xs, ys, col, dash, w) { x.strokeStyle = col; x.lineWidth = w || 1.6; x.setLineDash(dash || []); x.beginPath(); var on = false; for (var i = 0; i < xs.length; i++) { var a = P.px(xs[i]), b = P.py(ys[i]); if (!isFinite(a) || !isFinite(b)) { on = false; continue; } if (on) x.lineTo(a, b); else { x.moveTo(a, b); on = true; } } x.stroke(); x.setLineDash([]); return P; };
    P.dots = function (xs, ys, col, r) { x.fillStyle = col; r = r || 1.6; for (var i = 0; i < xs.length; i++) { var a = P.px(xs[i]), b = P.py(ys[i]); if (r < 1.1) x.fillRect(a, b, 1.2, 1.2); else { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } } return P; };
    P.bars = function (xs, ys, w, col) { x.fillStyle = col; var z = P.py(ly ? Math.exp(Y0) : Math.max(0, Y0)); for (var i = 0; i < xs.length; i++) { var a = P.px(xs[i] - w / 2), b = P.px(xs[i] + w / 2), t = P.py(ys[i]); x.fillRect(a, Math.min(t, z), Math.max(1, b - a - 0.6), Math.abs(z - t)); } return P; };
    P.h = function (v, col, dash) { return P.line([lx ? Math.exp(X0) : X0, lx ? Math.exp(X1) : X1], [v, v], col, dash, 1.4); };
    P.done = function () { x.restore(); return P; };
    return P;
  }
  function note(el, html) { var p = el.querySelector('.rhv-n'); if (!p) { p = document.createElement('p'); p.className = 'rhv-n'; el.appendChild(p); } p.innerHTML = html; return p; }
  function ctl(el, html) { var d = document.createElement('div'); d.className = 'rhv-ctl'; d.innerHTML = html; el.appendChild(d); return d; }
  function clear(el) { [].slice.call(el.querySelectorAll('canvas')).forEach(function (c) { c.remove(); }); }
  function redo(el, draw) { draw(); var t, w = el.clientWidth; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { if (el.clientWidth !== w) { w = el.clientWidth; clear(el); draw(); } }, 200); });
    new MutationObserver(function () { clear(el); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] }); }
  function picount(xs, N) { var s = sieve(N), o = [], k = 0, c = 0; for (var n = 2; n <= N && k < xs.length; n++) { if (!s[n]) c++; while (k < xs.length && xs[k] < n + 1) { o.push(c); k++; } } while (o.length < xs.length) o.push(c); return o; }

  var V = {};

  V.pierr = function (el) { redo(el, function () {
    var N = 1e6, xs = logspace(100, N, 500), pc = picount(xs, N), d = xs.map(function (x, i) { return li(x) - pc[i]; }), b = xs.map(function (x) { return Math.sqrt(x) * Math.log(x) / (8 * Math.PI); });
    var P = Plot(el, 300, { logx: true }).range(100, N, -560, 560).axes('x', 'li(x) − π(x)');
    P.line(xs, b, P.c.gold).line(xs, b.map(function (v) { return -v; }), P.c.gold).h(0, P.c.mut, [3, 3]).line(xs, d, P.c.g, null, 2).done();
    note(el, 'At x = 1,000,000: π(x) = ' + fmt(pc[pc.length - 1]) + ', li(x) = ' + li(N).toFixed(1) + ', and Schoenfeld’s band is ±' + b[b.length - 1].toFixed(0) + '.');
  }); };
  V.pierrn = function (el) { redo(el, function () {
    var N = 2e6, xs = logspace(1000, N, 600), pc = picount(xs, N), d = xs.map(function (x, i) { return (pc[i] - li(x)) / (Math.sqrt(x) / Math.log(x)); });
    Plot(el, 280, { logx: true }).range(1000, N, -2.2, 0.6).axes('x', '(π(x) − li(x)) ÷ (√x / ln x)').h(0, C().mut, [3, 3]).line(xs, d, C().g, null, 2).done();
    note(el, 'The curve hovers near −1 because of the squares of primes, the same effect that tilts the prime races.');
  }); };
  V.gaps = function (el) { redo(el, function () {
    var N = 2e6, p = primes(N), xs = [], ys = [], mx = 0; for (var i = 1; i < p.length; i++) { var g = p[i] - p[i - 1]; if (g > mx) { mx = g; xs.push(p[i - 1]); ys.push(g); } }
    var cx = logspace(3, N, 200), P = Plot(el, 300, { logx: true, logy: true }).range(3, N, 1, 20000).axes('prime p', 'gap to the next prime');
    P.line(cx, cx.map(function (x) { return 0.88 * Math.sqrt(x) * Math.log(x); }), P.c.gold, null, 2).line(cx, cx.map(function (x) { var l = Math.log(x); return l * l; }), P.c.mut, [5, 4]).dots(xs, ys, P.c.g, 3).done();
    note(el, 'The largest gap below two million is ' + mx + ', after the prime ' + fmt(xs[xs.length - 1]) + '. The proved bound there is about ' + fmt(0.88 * Math.sqrt(xs[xs.length - 1]) * Math.log(xs[xs.length - 1])) + '.');
  }); };
  V.cubes = function (el) { redo(el, function () {
    var s = sieve(1030301), xs = [], ys = [], mn = 1e9; for (var n = 1; n <= 100; n++) { var c = 0; for (var k = n * n * n + 1; k < (n + 1) * (n + 1) * (n + 1); k++) if (!s[k]) c++; xs.push(n); ys.push(c); if (c < mn) mn = c; }
    Plot(el, 280).range(0, 101, 0, 2400).axes('n', 'primes between n³ and (n+1)³').bars(xs, ys, 0.8, C().g).done();
    note(el, 'The fewest is ' + mn + ', between 1 and 8 (the primes 2, 3, 5 and 7). Mills’ chain of primes begins 2, 11, 1,361, 2,521,008,887.');
  }); };
  V.robin = function (el) { redo(el, function () {
    var N = 30000, sg = new Float64Array(N + 1), i, j; for (i = 1; i <= N; i++) for (j = i; j <= N; j += i) sg[j] += i;
    var xs = [], ys = [], bx = [], by = [], lim = Math.exp(EG), last = 0; for (i = 3; i <= N; i++) { var v = sg[i] / (i * Math.log(Math.log(i))); if (v > lim) { bx.push(i); by.push(Math.min(v, 2.95)); last = i; } else if (v > 1.0) { xs.push(i); ys.push(v); } }
    var P = Plot(el, 300, { logx: true }).range(3, N, 1, 3).axes('n', 'σ(n) ÷ (n · ln ln n)'); P.dots(xs, ys, P.c.g, 1).h(lim, P.c.gold).dots(bx, by, P.c.rose, 3).done();
    note(el, 'Checked here for every n up to 30,000: ' + bx.length + ' numbers from 3 on break the inequality, the last being ' + fmt(last) + '. (Dots below 1 are not drawn.)');
  }); };
  V.mertens = function (el) { redo(el, function () {
    var N = 200000, mu = new Int8Array(N + 1), i, j; mu.fill(1); var s = sieve(N);
    for (i = 2; i <= N; i++) if (!s[i]) { for (j = i; j <= N; j += i) mu[j] = -mu[j]; var q = i * i; if (q <= N) for (j = q; j <= N; j += q) mu[j] = 0; }
    var xs = [], ys = [], M = 0, mx = 0; for (i = 1; i <= N; i++) { M += mu[i]; if (Math.abs(M) / Math.sqrt(i) > mx && i > 100) mx = Math.abs(M) / Math.sqrt(i); if (i % 40 === 0) { xs.push(i); ys.push(M); } }
    var cx = []; for (i = 0; i <= 200; i++) cx.push(N * i / 200);
    var P = Plot(el, 300).range(0, N, -460, 460).axes('x', 'M(x)'); P.line(cx, cx.map(Math.sqrt), P.c.gold).line(cx, cx.map(function (v) { return -Math.sqrt(v); }), P.c.gold).h(0, P.c.mut, [3, 3]).line(xs, ys, P.c.g, null, 1.3).done();
    note(el, 'Between 100 and 200,000 the largest value of |M(x)| ÷ √x is ' + mx.toFixed(3) + '.');
  }); };
  V.farey = function (el) {
    var c = ctl(el, '<label>Largest bottom number N = <output>7</output> <input type="range" min="2" max="30" value="7"></label>'), r = c.querySelector('input'), o = c.querySelector('output');
    function draw() { clear(el); var N = +r.value; o.textContent = N; var f = [], a, b; for (b = 1; b <= N; b++) for (a = 0; a <= b; a++) { var g = a, h = b; while (h) { var t = g % h; g = h; h = t; } if (g === 1) f.push(a / b); } f.sort(function (p, q) { return p - q; });
      var P = Plot(el, 190).range(0, 1, 0, 1), x = P.x, k, m = f.length - 1, tot = 0; x.clearRect(0, 0, P.W, P.H);
      var y1 = 40, y2 = 140; x.strokeStyle = P.c.line; x.lineWidth = 1; x.beginPath(); x.moveTo(P.px(0), y1); x.lineTo(P.px(1), y1); x.moveTo(P.px(0), y2); x.lineTo(P.px(1), y2); x.stroke();
      for (k = 0; k <= m; k++) { var e = k / m; tot += Math.abs(f[k] - e); x.strokeStyle = P.c.gold; x.globalAlpha = 0.7; x.beginPath(); x.moveTo(P.px(f[k]), y1); x.lineTo(P.px(e), y2); x.stroke(); x.globalAlpha = 1; x.fillStyle = P.c.g; x.beginPath(); x.arc(P.px(f[k]), y1, 3, 0, 7); x.fill(); x.fillStyle = P.c.mut; x.beginPath(); x.arc(P.px(e), y2, 3, 0, 7); x.fill(); }
      x.fillStyle = P.c.mut; x.font = '12px system-ui,sans-serif'; x.textAlign = 'left'; x.fillText('Farey fractions', P.px(0), y1 - 16); x.fillText('evenly spaced', P.px(0), y2 + 22);
      note(el, 'There are ' + (m + 1) + ' fractions. Their misses from even spacing add up to ' + tot.toFixed(3) + ', which is ' + (tot / Math.sqrt(N)).toFixed(3) + ' × √N.'); }
    r.addEventListener('input', draw); redo(el, draw);
  };
  V.landau = function (el) {
    var N = 300, pr = primes(N + 5).filter(function (p) { return p <= N; }), best = new Float64Array(N + 1), how = [], n; for (n = 0; n <= N; n++) how.push([]);
    pr.forEach(function (p) { for (var j = N; j >= p; j--) for (var q = p; q <= j; q *= p) { var v = best[j - q] + Math.log(q); if (v > best[j] + 1e-12) { best[j] = v; how[j] = how[j - q].concat([q]); } } });
    for (n = 1; n <= N; n++) if (best[n - 1] > best[n]) { best[n] = best[n - 1]; how[n] = how[n - 1]; }
    var c = ctl(el, '<label>n = <output>10</output> <input type="range" min="2" max="' + N + '" value="10"></label>'), r = c.querySelector('input'), o = c.querySelector('output');
    function say() { var k = +r.value; o.textContent = k; var g = 1n, parts = how[k].slice().sort(function (a, b) { return a - b; }); parts.forEach(function (q) { g *= BigInt(q); }); var used = parts.reduce(function (a, b) { return a + b; }, 0);
      note(el, 'g(' + k + ') = ' + g.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ', from loops of length ' + (parts.join(', ') || '1') + (used < k ? ' (and ' + (k - used) + ' card' + (k - used > 1 ? 's' : '') + ' left where they are)' : '') + '.'); }
    r.addEventListener('input', say);
    redo(el, function () { var xs = [], ys = [], cy = []; for (var i = 2; i <= N; i++) { xs.push(i); ys.push(best[i]); cy.push(Math.sqrt(i * Math.log(i))); } Plot(el, 280).range(0, N, 0, 45).axes('n (number of cards)', 'ln g(n)').line(xs, cy, C().gold, null, 2).line(xs, ys, C().g, null, 2).done(); say(); });
  };
  V.dial = function (el) { redo(el, function () {
    var P = Plot(el, 150).range(-1, 1, 0, 1), x = P.x, y = 70; x.clearRect(0, 0, P.W, P.H);
    x.fillStyle = P.c.g; x.globalAlpha = 0.16; x.fillRect(P.px(0), y - 26, P.px(1) - P.px(0), 52); x.globalAlpha = 1;
    x.strokeStyle = P.c.mut; x.lineWidth = 1.5; x.beginPath(); x.moveTo(P.px(-1), y); x.lineTo(P.px(1), y); x.stroke();
    x.fillStyle = P.c.gold; x.beginPath(); x.arc(P.px(0), y, 8, 0, 7); x.fill();
    x.fillStyle = P.c.ink; x.font = '600 13px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText('Λ = 0', P.px(0), y - 34);
    x.font = '12px system-ui,sans-serif'; x.fillStyle = P.c.mut; x.fillText('cooler: some zeros off the line', P.px(-0.5), y + 44); x.fillStyle = P.c.g; x.fillText('warmer: every zero on the line', P.px(0.5), y + 44);
    x.fillStyle = P.c.mut; x.fillText('temperature t', P.px(0.86), y - 10);
  }); };
  function zcurve(a, b, n) { var xs = [], ys = []; for (var i = 0; i <= n; i++) { var t = a + (b - a) * i / n; xs.push(t); ys.push(Z(t)); } return [xs, ys]; }
  V.zabs = function (el) { redo(el, function () { var z = zcurve(0.01, 200, 4000), mx = 0, at = 0; z[1] = z[1].map(function (v, i) { v = Math.abs(v); if (v > mx) { mx = v; at = z[0][i]; } return v; });
    Plot(el, 280).range(0, 200, 0, 7.5).axes('height t', '|ζ(½ + it)|').line(z[0], z[1], C().g, null, 1.4).done(); note(el, 'The tallest peak in this stretch is ' + mx.toFixed(2) + ', near t = ' + at.toFixed(1) + '.'); }); };
  V.zline = function (el) { redo(el, function () { var z = zcurve(0.01, 100, 3000), zs = zeros(100), P = Plot(el, 280).range(0, 100, -4.5, 4.5).axes('height t', 'Z(t)');
    P.h(0, P.c.mut).line(z[0], z[1], P.c.g, null, 1.6).dots(zs, zs.map(function () { return 0; }), P.c.gold, 3.2).done(); note(el, 'Zeros found in this picture: ' + zs.length + '. The first five are at ' + zs.slice(0, 5).map(function (v) { return v.toFixed(2); }).join(', ') + '.'); }); };
  V.zmom = function (el) { redo(el, function () { var T = 400, h = 0.02, s = 0, xs = [], ys = [], cy = [], k = 0; for (var t = h / 2; t < T; t += h) { var v = Z(t); s += v * v * h; if (++k % 100 === 0 && t > 8) { xs.push(t); ys.push(s / t); cy.push(Math.log(t / (2 * Math.PI)) + 2 * EG - 1); } }
    Plot(el, 280).range(0, T, 0, 5).axes('T', 'average of |ζ|² up to height T').line(xs, cy, C().gold, null, 2).line(xs, ys, C().g, null, 2).done(); note(el, 'At T = 400 the average is ' + ys[ys.length - 1].toFixed(3) + ' and the formula gives ' + cy[cy.length - 1].toFixed(3) + '.'); }); };
  V.spacing = function (el) { var zs = null; redo(el, function () { zs = zs || zeros(1000); var g = [], i; for (i = 1; i < zs.length; i++) { var m = (zs[i] + zs[i - 1]) / 2; g.push((zs[i] - zs[i - 1]) * Math.log(m / (2 * Math.PI)) / (2 * Math.PI)); }
    var nb = 15, w = 0.2, hs = new Array(nb).fill(0); g.forEach(function (v) { var b = Math.floor(v / w); if (b < nb) hs[b]++; }); var xs = [], ys = []; for (i = 0; i < nb; i++) { xs.push((i + 0.5) * w); ys.push(hs[i] / (g.length * w)); }
    var cx = [], cy = [], cz = []; for (i = 0; i <= 150; i++) { var s = i * 0.02; cx.push(s); cy.push(32 / (Math.PI * Math.PI) * s * s * Math.exp(-4 * s * s / Math.PI)); cz.push(Math.exp(-s)); }
    var P = Plot(el, 280).range(0, 3, 0, 1.15).axes('gap (average = 1)', 'share'); P.bars(xs, ys, w, P.c.g).line(cx, cz, P.c.mut, [5, 4]).line(cx, cy, P.c.gold, null, 2.2).done();
    note(el, zs.length + ' zeros found up to height 1,000 (the exact count is 649). Gaps smaller than a fifth of the average: ' + hs[0] + '. Scattered points would give about ' + Math.round(g.length * (1 - Math.exp(-0.2))) + '.'); }); };
  V.sqfree = function (el) { redo(el, function () { var N = 200000, sf = new Uint8Array(N + 1), i, j; sf.fill(1); for (i = 2; i * i <= N; i++) for (j = i * i; j <= N; j += i * i) sf[j] = 0;
    var xs = [], ys = [], q = 0, c = 6 / (Math.PI * Math.PI); for (i = 1; i <= N; i++) { q += sf[i]; if (i % 25 === 0) { xs.push(i); ys.push(q - c * i); } } var cx = []; for (i = 0; i <= 200; i++) cx.push(N * i / 200 + 1);
    var P = Plot(el, 280).range(0, N, -24, 24).axes('x', 'count − 6x/π²'); P.line(cx, cx.map(function (v) { return Math.pow(v, 0.25); }), P.c.gold).line(cx, cx.map(function (v) { return -Math.pow(v, 0.25); }), P.c.gold).h(0, P.c.mut, [3, 3]).line(xs, ys, P.c.g, null, 1.2).done();
    note(el, 'Up to 200,000 there are ' + fmt(q) + ' square-free numbers; 6x/π² gives ' + (c * N).toFixed(1) + '.'); }); };
  V.raminq = function (el) { redo(el, function () { var N = 2e6, xs = logspace(200, N, 500), a = picount(xs, N), b = picount(xs.map(function (v) { return v / Math.E; }), N), ys = xs.map(function (v, i) { return a[i] * a[i] / (Math.E * v / Math.log(v) * b[i]); });
    var P = Plot(el, 280, { logx: true }).range(200, N, 0.96, 1.08).axes('x', 'left side ÷ right side'); P.h(1, P.c.gold).line(xs, ys, P.c.g, null, 2).done(); var fails = ys.filter(function (v) { return v > 1; }).length, lastF = 0; ys.forEach(function (v, i) { if (v > 1) lastF = xs[i]; });
    note(el, 'The inequality fails at ' + Math.round(100 * fails / ys.length) + '% of the sample points in this picture' + (lastF ? ', the last of them near x = ' + fmt(lastF) : '') + '. At two million the ratio is ' + ys[ys.length - 1].toFixed(4) + '. It goes on crossing the line, ever more rarely, until 38,358,837,682.'); }); };
  V.apcount = function (el) { var c = ctl(el, '<label>Divide by q = <select><option>3</option><option>4</option><option>5</option><option>7</option><option>8</option><option selected>10</option><option>12</option><option>16</option><option>30</option></select></label>'), sel = c.querySelector('select');
    function draw() { clear(el); var q = +sel.value, p = primes(1e6), cnt = {}, i, tot = 0; for (i = 0; i < p.length; i++) { if (q % p[i] === 0) continue; var r = p[i] % q; cnt[r] = (cnt[r] || 0) + 1; tot++; } var rs = Object.keys(cnt).map(Number).sort(function (a, b) { return a - b; }), ys = rs.map(function (r) { return cnt[r]; }), ex = tot / rs.length, mx = Math.max.apply(null, ys), mn = Math.min.apply(null, ys);
      var P = Plot(el, 260, { nox: true }).range(-0.6, rs.length - 0.4, ex * 0.985, ex * 1.015), x = P.x; P.axes('remainder', 'primes up to 1,000,000'); P.bars(rs.map(function (_, k) { return k; }), ys, 0.7, P.c.g).h(ex, P.c.gold).done(); x.fillStyle = P.c.ink; x.font = '11px system-ui,sans-serif'; x.textAlign = 'center'; rs.forEach(function (r, k) { x.fillText(r, P.px(k), P.H - 21); });
      note(el, 'An equal share is ' + ex.toFixed(1) + '. The counts run from ' + fmt(mn) + ' to ' + fmt(mx) + ': a spread of ' + (mx - mn) + ', where √x is 1,000. (The vertical scale is zoomed to within 1.5% of an equal share.)'); }
    sel.addEventListener('change', draw); redo(el, draw); };
  V.linnik = function (el) { redo(el, function () { var p = primes(200000), xs = [], ys = [], cy = [], worst = [0, 0, 0];
    for (var q = 4; q <= 400; q++) { var need = 0, seen = new Uint8Array(q), a, mx = 0; for (a = 1; a < q; a++) { var g = a, h = q; while (h) { var t = g % h; g = h; h = t; } if (g === 1) need++; } var phi = need; for (var i = 0; need > 0 && i < p.length; i++) { var r = p[i] % q; if (q % p[i] && !seen[r]) { seen[r] = 1; need--; mx = p[i]; } } xs.push(q); ys.push(mx); var bd = Math.pow(phi * Math.log(q), 2); cy.push(bd); if (mx / bd > worst[0]) worst = [mx / bd, q, mx]; }
    var P = Plot(el, 300, { logy: true }).range(0, 400, 1, 1e7).axes('divisor q', 'first prime, worst remainder'); P.line(xs, cy, P.c.gold, null, 2).line(xs, xs.map(function (q) { var l = Math.log(q); return q * l * l; }), P.c.mut, [5, 4]).dots(xs, ys, P.c.g, 1.8).done();
    note(el, 'Checked here for every divisor from 4 to 400. The closest any case comes to the bound is at q = ' + worst[1] + ', where the first prime is ' + fmt(worst[2]) + ', ' + (100 * worst[0]).toFixed(0) + '% of the bound. Dashed: q · (ln q)².'); }); };
  function bpow(b, e, m) { var r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
  function strong(n, a, d, s) { var x = bpow(a, d, n); if (x === 1n || x === n - 1n) return true; for (var i = 1; i < s; i++) { x = x * x % n; if (x === n - 1n) return true; if (x === 1n) return false; } return false; }
  function isPrimeBig(n) { if (n < 2n) return false; var sm = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]; for (var i = 0; i < sm.length; i++) { if (n === sm[i]) return true; if (n % sm[i] === 0n) return false; } var d = n - 1n, s = 0; while (!(d & 1n)) { d >>= 1n; s++; } for (i = 0; i < sm.length; i++) if (!strong(n, sm[i], d, s)) return false; return true; }   // exact below 3.3e24
  V.miller = function (el) {
    var c = ctl(el, '<label>n = <input type="text" inputmode="numeric" size="42" value="14449613517291620243"></label> <button type="button" class="rh-chip on">Run Miller’s test</button>'), inp = c.querySelector('input'), btn = c.querySelector('button'), run = 0;
    function go() { var id = ++run, s = inp.value.replace(/[\s,]/g, ''); if (!/^\d{1,40}$/.test(s)) { note(el, 'Please type a whole number of at most 40 digits.'); return; } var n = BigInt(s);
      if (n < 2n) { note(el, s + ' is neither prime nor composite.'); return; } if (n < 4n) { note(el, '<b>' + s + ' is prime.</b>'); return; } if (!(n & 1n)) { note(el, '<b>' + s + ' is composite</b>: it is even.'); return; }
      for (var k = 2; k <= 132; k++) { var lo = 1n, hi = 1n << BigInt(Math.ceil(s.length * 3.33 / k) + 1); while (lo < hi) { var mid = (lo + hi + 1n) >> 1n; if (mid ** BigInt(k) <= n) lo = mid; else hi = mid - 1n; } if (lo > 1n && lo ** BigInt(k) === n) { note(el, '<b>' + s + ' is composite</b>: it is ' + lo + ' to the power ' + k + '.'); return; } }
      var ln = Math.log(Number(s.slice(0, 15))) + (s.length - Math.min(15, s.length)) * Math.LN10, B = Math.floor(2 * ln * ln), d = n - 1n, t = 0; while (!(d & 1n)) { d >>= 1n; t++; }
      var a = 2, t0 = Date.now(); note(el, 'Working…');
      (function step() { if (id !== run) return; var end = Date.now() + 40; while (a <= B && BigInt(a) < n - 1n && Date.now() < end) { if (!strong(n, BigInt(a), d, t)) { note(el, '<b>' + s + ' is composite.</b> Base ' + a + ' exposes it: the test with that base cannot come out this way for a prime. This is a proof (it does not find the factors).'); return; } a++; }
        if (a > B || BigInt(a) >= n - 1n) { note(el, '<b>' + s + ' is prime.</b> It passed Miller’s test for every base from 2 to ' + fmt(Math.min(B, Number(n) - 2)) + ', the limit 2 · (ln n)² = ' + fmt(B) + '. By Miller’s theorem with Bach’s limit, now free of its “if”, this is a proof. (' + ((Date.now() - t0) / 1000).toFixed(1) + ' seconds.)'); return; }
        note(el, 'Working… base ' + fmt(a) + ' of ' + fmt(B)); setTimeout(step, 0); })(); }
    btn.addEventListener('click', go); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); go();
  };
  V.nonres = function (el) { redo(el, function () { var p = primes(200000), sm = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53], xs = [], ys = [], rx = [], ry = [], rec = 0; for (var i = 2; i < p.length; i++) { var q = p[i]; for (var k = 0; k < sm.length; k++) if (powmod(sm[k], (q - 1) / 2, q) === q - 1) break; var v = sm[k]; xs.push(q); ys.push(v); if (v > rec) { rec = v; rx.push(q); ry.push(v); } }
    var cx = logspace(5, 200000, 150), P = Plot(el, 290, { logx: true }).range(5, 200000, 0, 150).axes('prime p', 'smallest non-square modulo p'); P.line(cx, cx.map(function (v) { var l = Math.log(v); return l * l; }), P.c.gold, null, 2).dots(xs, ys, P.c.g, 1).dots(rx, ry, P.c.rose, 3).done();
    note(el, 'Checked here for every prime from 5 to 200,000. The largest value is ' + rec + ', first reached at p = ' + fmt(rx[rx.length - 1]) + ', where (ln p)² is ' + Math.pow(Math.log(rx[rx.length - 1]), 2).toFixed(0) + '. Red dots are the record-setters.'); }); };
  function pfactors(n) { var f = [], d = 2; while (d * d <= n) { if (n % d === 0) { f.push(d); while (n % d === 0) n /= d; } d += d === 2 ? 1 : 2; } if (n > 1) f.push(n); return f; }
  function isRoot(g, p, f) { for (var i = 0; i < f.length; i++) if (powmod(g, (p - 1) / f[i], p) === 1) return false; return true; }
  V.primroot = function (el) { redo(el, function () { var p = primes(100000), xs = [], ys = [], rec = 0, ra = 0, tally = {}; for (var i = 1; i < p.length; i++) { var q = p[i]; var f = pfactors(q - 1), g = 2; while (!isRoot(g, q, f)) g++; xs.push(q); ys.push(g); tally[g] = (tally[g] || 0) + 1; if (g > rec) { rec = g; ra = q; } }
    Plot(el, 280, { logx: true }).range(3, 100000, 0, 80).axes('prime p', 'smallest primitive root').dots(xs, ys, C().g, 1.2).done();
    note(el, 'Of the ' + fmt(xs.length) + ' odd primes below 100,000, the smallest primitive root is 2 for ' + fmt(tally[2]) + ', 3 for ' + fmt(tally[3]) + ' and 5 for ' + fmt(tally[5]) + '. The largest is ' + rec + ', for p = ' + fmt(ra) + '.'); }); };
  V.charsum = function (el) { var c = ctl(el, '<label>Prime q = <select><option>101</option><option>1009</option><option selected>10007</option><option>100003</option><option>1000003</option></select></label>'), sel = c.querySelector('select');
    function draw() { clear(el); var q = +sel.value, sq = new Uint8Array(q), i; for (i = 1; i <= (q - 1) / 2; i++) sq[Number(BigInt(i) * BigInt(i) % BigInt(q))] = 1; var xs = [], ys = [], s = 0, mx = 0, st = Math.max(1, Math.floor(q / 2500)); for (i = 1; i < q; i++) { s += sq[i] ? 1 : -1; if (Math.abs(s) > mx) mx = Math.abs(s); if (i % st === 0) { xs.push(i); ys.push(s); } }
      var b1 = Math.sqrt(q) * Math.log(Math.log(q)), b2 = Math.sqrt(q) * Math.log(q), P = Plot(el, 280).range(0, q, -b2 * 1.05, b2 * 1.05).axes('x', 'sum of the marks from 1 to x'); P.h(b2, P.c.mut, [5, 4]).h(-b2, P.c.mut, [5, 4]).h(b1, P.c.gold).h(-b1, P.c.gold).h(0, P.c.line).line(xs, ys, P.c.g, null, 1.5).done();
      note(el, 'For q = ' + fmt(q) + ' the sum never goes beyond ' + mx + '. √q is ' + Math.sqrt(q).toFixed(1) + ', √q · ln ln q is ' + b1.toFixed(1) + ' and √q · ln q is ' + b2.toFixed(1) + '. (The theorem has a constant in front that this picture leaves out.)'); }
    sel.addEventListener('change', draw); redo(el, draw); };
  function classNumbers(N) { var xs = [], ys = [], sf = new Uint8Array(N + 1), i, j; sf.fill(1); for (i = 2; i * i <= N; i++) for (j = i * i; j <= N; j += i * i) sf[j] = 0;
    for (var d = 3; d <= N; d++) { var fund = (d % 4 === 3 && sf[d]) || (d % 4 === 0 && sf[d / 4] && (d / 4) % 4 !== 3); if (!fund) continue; var h = 0; for (var b = d & 1; 3 * b * b <= d; b += 2) { var m = (b * b + d) / 4; for (var a = Math.max(b, 1); a * a <= m; a++) if (m % a === 0) h += (b === 0 || b === a || a * a === m) ? 1 : 2; } xs.push(d); ys.push(h); } return [xs, ys]; }
  V.classnum = function (el) { var D = null; redo(el, function () { D = D || classNumbers(20000); var cx = []; for (var i = 1; i <= 200; i++) cx.push(i * 100); var ones = D[0].filter(function (_, k) { return D[1][k] === 1; });
    var P = Plot(el, 300).range(0, 20000, 0, Math.max.apply(null, D[1]) * 1.05).axes('d', 'class number h(−d)'); P.dots(D[0], D[1], P.c.g, 1.1).line(cx, cx.map(function (v) { return Math.sqrt(v) / Math.PI; }), P.c.gold, null, 2).done();
    note(el, 'Fields with class number 1 in this range: d = ' + ones.join(', ') + '. There are nine, and no more beyond.'); }); };
  V.idoneal = function (el) { var L = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 16, 18, 21, 22, 24, 25, 28, 30, 33, 37, 40, 42, 45, 48, 57, 58, 60, 70, 72, 78, 85, 88, 93, 102, 105, 112, 120, 130, 133, 165, 168, 177, 190, 210, 232, 240, 253, 273, 280, 312, 330, 345, 357, 385, 408, 462, 520, 760, 840, 1320, 1365, 1848];
    var g = document.createElement('div'); g.className = 'rhv-grid'; g.innerHTML = L.map(function (n) { return '<span>' + fmt(n) + '</span>'; }).join(''); el.appendChild(g);
    var c = ctl(el, '<label>Test n = <input type="text" inputmode="numeric" size="10" value="1849"></label> <button type="button" class="rh-chip on">Test with Euler’s rule</button>'), inp = c.querySelector('input');
    function go() { var s = inp.value.replace(/[\s,]/g, ''); if (!/^\d{1,8}$/.test(s) || +s < 1) { note(el, 'Please type a whole number from 1 to 99,999,999.'); return; } var n = +s; for (var a = 1; 3 * a * a < n; a++) for (var b = a + 1; a * b + (a + b) * (b + 1) <= n; b++) if ((n - a * b) % (a + b) === 0) { var cc = (n - a * b) / (a + b); note(el, '<b>' + fmt(n) + ' is not convenient:</b> ' + fmt(n) + ' = ' + a + '·' + b + ' + ' + b + '·' + cc + ' + ' + cc + '·' + a + ' (a = ' + a + ', b = ' + b + ', c = ' + cc + ').'); return; }
      note(el, '<b>' + fmt(n) + ' is convenient:</b> it cannot be written as ab + bc + ca with 0 < a < b < c.' + (L.indexOf(n) < 0 ? ' That would be a 66th, so something is wrong; please tell us.' : ' It is on Euler’s list.')); }
    c.querySelector('button').addEventListener('click', go); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); go(); };
  V.expo = function (el) { var D = [[3, 4, 7, 8, 11, 19, 43, 67, 163], [15, 20, 24, 35, 40, 51, 52, 84, 88, 91, 115, 120, 123, 132, 148, 168, 187, 195, 228, 232, 235, 267, 280, 312, 340, 372, 403, 408, 420, 427, 435, 483, 520, 532, 555, 595, 627, 660, 708, 715, 760, 795, 840, 1012, 1092, 1155, 1320, 1380, 1428, 1435, 1540, 1848, 1995, 3003, 3315, 5460], [23, 31, 59, 83, 107, 139, 211, 283, 307, 331, 379, 499, 547, 643, 883, 907, 4027], [39, 55, 56, 68, 136, 155, 184, 203, 219, 259, 260, 264, 276, 291, 292, 308, 323, 328, 355, 388, 456, 552, 564, 568, 580, 616, 651, 667, 723, 763, 772, 820, 852, 868, 915, 952, 955, 987, 1003, 1027, 1032, 1060, 1128, 1131, 1140, 1204, 1227, 1240, 1243, 1288, 1387, 1411, 1443, 1507, 1555, 1560, 1635, 1659, 1672, 1716, 1752, 1768, 1771, 1780, 1860, 1947, 1992, 2020, 2035, 2040, 2067, 2139, 2163, 2212, 2244, 2280, 2379, 2392, 2436, 2451, 2580, 2632, 2667, 2715, 2755, 2760, 2788, 2968, 3108, 3172, 3192, 3220, 3243, 3355, 3432, 3480, 3507, 3588, 3640, 3795, 3828, 4020, 4123, 4180, 4260, 4323, 4420, 4440, 4452, 4488, 4515, 4740, 5083, 5115, 5160, 5187, 5208, 5412, 5467, 6052, 6123, 6195, 6307, 6328, 6355, 6360, 6420, 6580, 6612, 6708, 6820, 7035, 7140, 7315, 7395, 7480, 7540, 7672, 7755, 7995, 8008, 8052, 8547, 8580, 8680, 8715, 8835, 8932, 9240, 9595, 9867, 9955, 10168, 10803, 10920, 10948, 11067, 11715, 12180, 12595, 13195, 14008, 14155, 14280, 14547, 14763, 14820, 16555, 17220, 17427, 19240, 19320, 19380, 19635, 19947, 20020, 20148, 20155, 23640, 25608, 30340, 31395, 33915, 34840, 40755, 42420, 43435, 44115, 46852, 53592, 57387, 57715, 58548, 73140, 82555, 92568, 105315, 111435, 198660, 207480, 228228, 264180, 435435], [47, 79, 103, 127, 131, 179, 227, 347, 443, 523, 571, 619, 683, 691, 739, 787, 947, 1051, 1123, 1723, 1747, 1867, 2203, 2347, 2683, 12451, 37363]];
    redo(el, function () { var P = Plot(el, 290, { logx: true }).range(2, 2e6, 0.3, 5.7).axes('d, where −d is the discriminant of the field', 'exponent of the class group'), col = [P.c.g, P.c.gold, P.c.blue, P.c.g, P.c.rose];
      D.forEach(function (L, i) { var ys = L.map(function (_, k) { return i + 1 + ((k * 7) % 11 - 5) * 0.03; }); P.dots(L, ys, col[i], 2); var m = L[L.length - 1]; P.line([m, m], [i + 0.62, i + 1.38], P.c.ink, [3, 3], 1); });
      P.done(); note(el, 'Fields with exponent 1, 2, 3, 4, 5: ' + D.map(function (L) { return L.length; }).join(', ') + ', which is ' + D.reduce(function (s, L) { return s + L.length; }, 0) + ' in all. The dashed marks show the last field in each row. We searched every field up to d = 10¹¹ directly; beyond that the proof takes over.'); }); };
  V.race4 = function (el) { redo(el, function () { var N = 1e6, s = sieve(N), xs = [], ys = [], d = 0, behind = 0, first = 0, st = 0; for (var n = 3; n <= N; n += 2) { if (!s[n]) d += (n % 4 === 3) ? 1 : -1; if (d < 0) { behind += 2; if (!first) first = n; } if (++st % 150 === 0) { xs.push(n); ys.push(d); } }
    Plot(el, 280, { logx: true }).range(10, N, -20, 260).axes('x', 'lead of the 4k + 3 primes').h(0, C().gold).line(xs, ys, C().g, null, 1.6).done();
    note(el, 'Up to one million the 4k + 1 primes are ahead for only ' + (100 * behind / N).toFixed(2) + '% of the numbers, first at ' + fmt(first) + '. At one million the lead is ' + d + '.'); }); };
  V.goldbach = function (el) { redo(el, function () { var N = 6000, s = sieve(N), xs = [], ys = [], mn = 1e9; for (var n = 4; n <= N; n += 2) { var c = 0; for (var p = 2; p <= n / 2; p++) if (!s[p] && !s[n - p]) c++; xs.push(n); ys.push(c); if (c < mn) mn = c; }
    Plot(el, 300).range(0, N, 0, Math.max.apply(null, ys) * 1.05).axes('even number', 'ways to write it as two primes').dots(xs, ys, C().g, 1.3).done(); note(el, 'Every even number from 4 to 6,000 has at least ' + mn + ' way. The numbers with the fewest ways are small ones; the comet’s lower edge rises.'); }); };
  V.pow2 = function (el) { var c = ctl(el, '<label>Even n = <input type="text" inputmode="numeric" size="16" value="1000000000000"></label> <button type="button" class="rh-chip on">Split it</button>'), inp = c.querySelector('input');
    function two(n) { for (var p = 2n; p <= n / 2n && p < 200000n; p += (p === 2n ? 1n : 2n)) if (isPrimeBig(p) && isPrimeBig(n - p)) return [p, n - p]; return null; }
    function go() { var s = inp.value.replace(/[\s,]/g, ''); if (!/^\d{1,18}$/.test(s)) { note(el, 'Please type an even whole number of at most 18 digits.'); return; } var n = BigInt(s); if (n < 4n || (n & 1n)) { note(el, 'Please type an even number, 4 or more.'); return; } var r = two(n); if (r) { note(el, '<b>' + fmt2(n) + ' = ' + fmt2(r[0]) + ' + ' + fmt2(r[1]) + '</b>, two primes and no powers of 2.'); return; }
      for (var k = 1n; (1n << k) < n; k++) { r = two(n - (1n << k)); if (r) { note(el, fmt2(n) + ' = ' + fmt2(r[0]) + ' + ' + fmt2(r[1]) + ' + 2^' + k + '.'); return; } } note(el, 'No split found with small first primes.'); }
    function fmt2(b) { return b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    c.querySelector('button').addEventListener('click', go); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); go(); };
  V.roots = function (el) { var c = ctl(el, '<label>n = <output>17</output> <input type="range" min="3" max="40" value="17"></label>'), r = c.querySelector('input'), o = c.querySelector('output');
    function draw() { clear(el); var n = +r.value; o.textContent = n; var P = Plot(el, 300), x = P.x, cx = P.W / 2, cy = P.H / 2, R = Math.min(P.W, P.H) * 0.42, k; x.clearRect(0, 0, P.W, P.H); x.strokeStyle = P.c.line; x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.moveTo(cx - R - 12, cy); x.lineTo(cx + R + 12, cy); x.moveTo(cx, cy - R - 12); x.lineTo(cx, cy + R + 12); x.stroke();
      x.strokeStyle = P.c.gold; x.lineWidth = 1.6; x.beginPath(); for (k = 0; k <= n; k++) { var a = 2 * Math.PI * k / n, X = cx + R * Math.cos(a), Y = cy - R * Math.sin(a); if (k) x.lineTo(X, Y); else x.moveTo(X, Y); } x.stroke(); x.fillStyle = P.c.g; for (k = 0; k < n; k++) { a = 2 * Math.PI * k / n; x.beginPath(); x.arc(cx + R * Math.cos(a), cy - R * Math.sin(a), 4, 0, 7); x.fill(); }
      var ph = 0; for (k = 1; k <= n; k++) { var g = k, h = n; while (h) { var t = g % h; g = h; h = t; } if (g === 1) ph++; } note(el, 'The ' + n + '-th roots of unity. The cyclotomic field they generate has degree ' + ph + ', and its zeta function is a product of ' + ph + ' Dirichlet L-functions.'); }
    r.addEventListener('input', draw); redo(el, draw); };
  V.three = function (el) { var c = ctl(el, '<label>Odd n = <input type="text" inputmode="numeric" size="10" value="2027"></label> <button type="button" class="rh-chip on">Find three primes</button>'), inp = c.querySelector('input');
    function go() { var s = inp.value.replace(/[\s,]/g, ''); if (!/^\d{1,7}$/.test(s)) { note(el, 'Please type an odd whole number from 7 to 9,999,999.'); return; } var n = +s; if (n < 7 || n % 2 === 0) { note(el, 'Please type an odd number, 7 or more.'); return; } var sv = sieve(Math.max(n, 1000)), p, q, one = null, cnt = 0, full = n <= 6000;
      for (p = 2; 3 * p <= n && (full || !one); p++) { if (sv[p]) continue; for (q = p; p + 2 * q <= n; q++) { if (sv[q]) continue; var r = n - p - q; if (!sv[r]) { cnt++; if (!one) one = [p, q, r]; if (!full) break; } } }
      note(el, one ? '<b>' + fmt(n) + ' = ' + fmt(one[0]) + ' + ' + fmt(one[1]) + ' + ' + fmt(one[2]) + '.</b>' + (full ? ' There are ' + fmt(cnt) + ' ways in all.' : '') : 'None found, which should not happen.'); }
    c.querySelector('button').addEventListener('click', go); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); go(); };
  V.knot = function (el) { var K = { 'Unknot (a circle)': function (t) { return [3 * Math.cos(t), 3 * Math.sin(t), 0]; }, 'Trefoil': function (t) { return [Math.sin(t) + 2 * Math.sin(2 * t), Math.cos(t) - 2 * Math.cos(2 * t), -Math.sin(3 * t)]; }, 'Figure-eight': function (t) { return [(2 + Math.cos(2 * t)) * Math.cos(3 * t), (2 + Math.cos(2 * t)) * Math.sin(3 * t), Math.sin(4 * t)]; }, 'Cinquefoil': function (t) { return [Math.cos(2 * t) * (3 + Math.cos(5 * t)), Math.sin(2 * t) * (3 + Math.cos(5 * t)), Math.sin(5 * t)]; } };
    var names = Object.keys(K), c = ctl(el, '<label>Knot <select>' + names.map(function (n, i) { return '<option' + (i === 1 ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>'), sel = c.querySelector('select');
    function draw() { clear(el); var f = K[sel.value], P = Plot(el, 300), x = P.x, n = 700, pts = [], i, sc = Math.min(P.W, P.H) / 9.5; x.clearRect(0, 0, P.W, P.H); for (i = 0; i <= n; i++) { var q = f(2 * Math.PI * i / n); pts.push([P.W / 2 + sc * q[0], P.H / 2 - sc * q[1], q[2]]); }
      function runs(up) { var out = [], cur = null; for (var k = 0; k < n; k++) { var hi = (pts[k][2] + pts[k + 1][2]) / 2 >= 0; if (hi === up) { if (!cur) { cur = [pts[k]]; out.push(cur); } cur.push(pts[k + 1]); } else cur = null; } return out; }
      function stroke(r, col, w, cap) { x.strokeStyle = col; x.lineWidth = w; x.lineCap = cap; x.lineJoin = 'round'; x.beginPath(); r.forEach(function (p, k) { if (k) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.stroke(); }
      runs(false).forEach(function (r) { stroke(r, P.c.g, 6, 'round'); });                       // the strands underneath
      runs(true).forEach(function (r) { stroke(r, P.c.bg, 16, 'butt'); });                        // a gap where a strand passes over
      runs(true).forEach(function (r) { stroke(r, P.c.g, 6, 'round'); });
      note(el, sel.selectedIndex === 0 ? 'The unknot. Any drawing that can be untangled to this is the unknot too.' : 'The ' + sel.value.toLowerCase() + ' knot. Where the line breaks, the strand passes underneath.'); }
    sel.addEventListener('change', draw); redo(el, draw); };
  V.artin = function (el) { var c = ctl(el, '<label>Base <select><option>2</option><option>3</option><option>5</option><option>6</option><option>7</option><option selected>10</option></select></label>'), sel = c.querySelector('select'), F = null;
    function draw() { clear(el); var a = +sel.value, p = primes(200000), xs = [], ys = [], y = 0, n = 0, i; F = F || p.map(function (q) { return q > 2 ? pfactors(q - 1) : []; }); for (i = 1; i < p.length; i++) { var q = p[i]; if (a % q === 0) continue; n++; if (isRoot(a % q, q, F[i])) y++; if (i % 20 === 0 && q > 50) { xs.push(q); ys.push(y / n); } }
      var P = Plot(el, 280, { logx: true }).range(50, 200000, 0.3, 0.46).axes('primes up to x', 'share with ' + a + ' as a primitive root'); P.h(0.3739558136, P.c.gold).line(xs, ys, P.c.g, null, 2).done();
      note(el, 'Of the ' + fmt(n) + ' primes up to 200,000 that do not divide ' + a + ', the base ' + a + ' is a primitive root for ' + fmt(y) + ': ' + (100 * y / n).toFixed(2) + '%. Artin’s constant is 37.40%.'); }
    sel.addEventListener('change', draw); redo(el, draw); };
  V.split = function (el) { redo(el, function () { var p = primes(200000), xs = [], a = [], b = [], c = [], n0 = 0, n1 = 0, n3 = 0, i; for (i = 2; i < p.length; i++) { var q = p[i]; if (q % 3 === 2) n1++; else if (powmod(2, (q - 1) / 3, q) === 1) n3++; else n0++; if (i % 20 === 0 && q > 100) { var t = n0 + n1 + n3; xs.push(q); a.push(n0 / t); b.push(n1 / t); c.push(n3 / t); } }
    var P = Plot(el, 280, { logx: true }).range(100, 200000, 0, 0.62).axes('primes up to x', 'share of primes'); P.h(1 / 3, P.c.gold).h(1 / 2, P.c.gold).h(1 / 6, P.c.gold).line(xs, a, P.c.rose, null, 2).line(xs, b, P.c.g, null, 2).line(xs, c, P.c.blue, null, 2).done(); var t = n0 + n1 + n3;
    note(el, 'Up to 200,000: no root for ' + (100 * n0 / t).toFixed(2) + '% of primes (red), one root for ' + (100 * n1 / t).toFixed(2) + '% (green), three roots for ' + (100 * n3 / t).toFixed(2) + '% (blue).'); }); };
  V.ternary = function (el) { redo(el, function () { var N = 3000, ok = new Uint8Array(N + 1), x, y, z; for (z = 0; 10 * z * z <= N; z++) for (y = 0; y * y + 10 * z * z <= N; y++) for (x = y; x * x + y * y + 10 * z * z <= N; x++) ok[x * x + y * y + 10 * z * z] = 1;
    var cols = el.clientWidth < 480 ? 30 : 50, rows = Math.ceil(1500 / cols), P = Plot(el, Math.round(rows * (el.clientWidth < 480 ? 12 : 9)) + 10), cx = P.x, w = (P.W - 4) / cols, h = (P.H - 4) / rows, bad = []; cx.clearRect(0, 0, P.W, P.H);
    for (var k = 0; k < 1500; k++) { var n = 2 * k + 1, good = ok[n]; if (!good) bad.push(n); cx.fillStyle = good ? P.c.g : P.c.rose; cx.globalAlpha = good ? 0.28 : 1; cx.fillRect(2 + (k % cols) * w, 2 + Math.floor(k / cols) * h, w - 1, h - 1); } cx.globalAlpha = 1;
    note(el, 'Odd numbers up to 3,000 that the form cannot make (' + bad.length + '): ' + bad.map(fmt).join(', ') + '. Each row holds ' + cols + ' odd numbers, starting from 1.'); }); };
  V.satotate = function (el) { redo(el, function () { var p = primes(4000), nb = 16, hs = new Array(nb).fill(0), cnt = 0; for (var i = 2; i < p.length; i++) { var q = p[i]; if (q === 31) continue; var sq = new Int8Array(q); sq.fill(-1); sq[0] = 0; for (var k = 1; k <= (q - 1) / 2; k++) sq[k * k % q] = 1; var a = 0; for (var x = 0; x < q; x++) a -= sq[(((x * x) % q * x) % q + x + 1) % q]; var t = a / (2 * Math.sqrt(q)), bn = Math.min(nb - 1, Math.floor((t + 1) / 2 * nb)); hs[bn]++; cnt++; }
    var w = 2 / nb, xs = [], ys = [], cx = [], cy = []; for (i = 0; i < nb; i++) { xs.push(-1 + (i + 0.5) * w); ys.push(hs[i] / (cnt * w)); } for (i = 0; i <= 200; i++) { var u = -1 + i / 100; cx.push(u); cy.push(2 / Math.PI * Math.sqrt(Math.max(0, 1 - u * u))); }
    var P = Plot(el, 280).range(-1, 1, 0, 0.85).axes('a_p ÷ 2√p', 'share'); P.bars(xs, ys, w, P.c.g).line(cx, cy, P.c.gold, null, 2.2).done(); note(el, cnt + ' primes counted. For each one the page counts the solutions of y² = x³ + x + 1 modulo p directly.'); }); };
  V.twins = function (el) { redo(el, function () { var N = 2e6, s = sieve(N + 2), xs = [], ys = [], cy = [], c = 0, I = 0, C2 = 0.6601618158; for (var n = 3; n <= N; n++) { if (!s[n] && !s[n + 2]) c++; var l = Math.log(n); I += 2 * C2 / (l * l); if (n % 4000 === 0) { xs.push(n); ys.push(c); cy.push(I); } }
    Plot(el, 280).range(0, N, 0, 16000).axes('x', 'twin prime pairs up to x').line(xs, cy, C().gold, null, 2.4).line(xs, ys, C().g, null, 1.6).done(); note(el, 'Up to two million there are ' + fmt(c) + ' twin pairs. The prediction is ' + fmt(I) + '.'); }); };

  hosts.forEach(function (el) { var f = V[el.getAttribute('data-viz')]; if (!f) return; try { f(el); el.classList.add('rhv-on'); } catch (e) { el.hidden = true; if (window.console) console.error('rhviz', el.getAttribute('data-viz'), e); } });
})();
