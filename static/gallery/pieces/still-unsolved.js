/* Still unsolved: four famous open problems, each with a small playground. Twin primes (find the next pair; count pairs
   against the Hardy–Littlewood prediction), Goldbach (split an even number into two primes; the "comet" of how many ways),
   Collatz (follow a start to 1) and the Riemann hypothesis (Hardy's Z function on the critical line, by the
   Riemann–Siegel formula; its sign changes are the zeros). Our own drawing. */
Gallery.piece('still-unsolved', function (g) {
  var M = Math, mode = 'twin', data = null, VAL = { twin: '1000000000000', goldbach: '1000000', collatz: '27', riemann: '10' };
  var c = g.canvas({ aspect: 0.5, max: 360, min: 230, label: 'A chart for the problem you picked' });
  // ----- primes: a sieve for charts, Miller–Rabin (deterministic for n < 3.3 × 10^24 with these bases) for single numbers
  function sieve(n) { var a = new Uint8Array(n + 1), i, j; a.fill(1); a[0] = a[1] = 0; for (i = 2; i * i <= n; i++) if (a[i]) for (j = i * i; j <= n; j += i) a[j] = 0; return a; }
  function pw(b, e, m) { var r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
  var SP = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n];
  function isPrime(n) {
    if (n < 2n) return false; for (var i = 0; i < SP.length; i++) { if (n === SP[i]) return true; if (n % SP[i] === 0n) return false; }
    var d = n - 1n, s = 0; while (!(d & 1n)) { d >>= 1n; s++; }
    for (i = 0; i < 12; i++) { var x = pw(SP[i], d, n); if (x === 1n || x === n - 1n) continue; var ok = false; for (var r = 1; r < s; r++) { x = x * x % n; if (x === n - 1n) { ok = true; break; } } if (!ok) return false; }
    return true;
  }
  function big(s) { s = String(s).replace(/[^0-9]/g, ''); return s ? BigInt(s) : null; }
  function fmtB(b) { return b.toLocaleString('en-US'); }
  // ----- Riemann–Siegel: Z(t) = 2 Σ cos(θ(t) − t ln n)/√n + remainder, n ≤ √(t/2π)
  function theta(t) { return t / 2 * M.log(t / (2 * M.PI)) - t / 2 - M.PI / 8 + 1 / (48 * t) + 7 / (5760 * t * t * t); }
  function Z(t) {
    var a = M.sqrt(t / (2 * M.PI)), N = M.floor(a), th = theta(t), s = 0, n;
    for (n = 1; n <= N; n++) s += M.cos(th - t * M.log(n)) / M.sqrt(n);
    var p = a - N, c0 = M.cos(2 * M.PI * (p * p - p - 1 / 16)) / M.cos(2 * M.PI * p);
    return 2 * s + (N % 2 ? 1 : -1) * M.pow(a, -0.5) * c0;
  }
  var TW = null, GB = null;
  function run() {
    var v = big(inp.value), x;
    if (mode === 'twin') {
      if (v == null) v = 0n; if (v > 10n ** 18n) v = 10n ** 18n;
      var p = v < 3n ? 3n : v; if (p % 2n === 0n) p++;
      for (x = 0; x < 200000; x++, p += 2n) if (isPrime(p) && isPrime(p + 2n)) break;
      o1.innerHTML = 'Next twin primes after ' + fmtB(v) + ': <b>' + fmtB(p) + '</b> and <b>' + fmtB(p + 2n) + '</b>';
      if (!TW) { var S = sieve(2000002), cnt = 0, pts = [], C2 = 0.6601618158, I = 0; for (x = 3; x <= 2000000; x++) { if (S[x] && S[x + 2]) cnt++; if (x > 2) I += 1 / (M.log(x) * M.log(x)); if (x % 10000 === 0) pts.push([x, cnt, 2 * C2 * I]); } TW = pts; }
      var L = TW[TW.length - 1]; o2.innerHTML = 'Pairs below 2,000,000: <b>' + g.fmt(L[1]) + '</b> · prediction <b>' + g.fmt(L[2]) + '</b>';
      g.say(o1.textContent);
    } else if (mode === 'goldbach') {
      if (v == null || v < 4n) v = 4n; if (v % 2n) v++; if (v > 10n ** 18n) v = 10n ** 18n;
      var q = 2n; while (!(isPrime(q) && isPrime(v - q))) q = q === 2n ? 3n : q + 2n;
      o1.innerHTML = '<b>' + fmtB(v) + '</b> = <b>' + fmtB(q) + '</b> + <b>' + fmtB(v - q) + '</b>';
      var ways = '';
      if (v <= 2000000n) { var n = Number(v), S2 = sieve(n), w = 0; for (x = 2; x <= n / 2; x++) if (S2[x] && S2[n - x]) w++; ways = 'Ways to write it as a sum of two primes: <b>' + g.fmt(w) + '</b>'; }
      else ways = 'The smallest prime that works is shown (counting every way is only done up to 2,000,000).';
      o2.innerHTML = ways;
      if (!GB) { var T = 20000, S3 = sieve(T), P = [], out = []; for (x = 2; x <= T; x++) if (S3[x]) P.push(x); for (n = 4; n <= T; n += 2) { w = 0; for (var k = 0; P[k] <= n / 2; k++) if (S3[n - P[k]]) w++; out.push([n, w]); } GB = out; }
      g.say(o1.textContent);
    } else if (mode === 'collatz') {
      if (v == null || v < 1n) v = 1n; if (v > 10n ** 40n) v = 10n ** 40n;
      var o = [v], b = v, mx = v; while (b !== 1n && o.length < 20000) { b = b % 2n ? 3n * b + 1n : b / 2n; o.push(b); if (b > mx) mx = b; }
      data = o; o1.innerHTML = 'Start <b>' + fmtB(v) + '</b>: <b>' + (o.length - 1) + '</b> steps to reach 1';
      o2.innerHTML = 'Highest point on the way: <b>' + fmtB(mx) + '</b>';
      g.say(o1.textContent);
    } else {
      var t0 = M.max(10, M.min(100000, Number(v == null ? 10 : v))), t1 = t0 + (c.w < 520 ? 20 : 40), z = [], zs = [], prev = null, st = 0.02;
      for (x = t0; x <= t1; x += st) { var y = Z(x); z.push([x, y]); if (prev && (prev[1] < 0) !== (y < 0)) { var lo = prev[0], hi = x, ylo = prev[1]; for (k = 0; k < 40; k++) { var m = (lo + hi) / 2, ym = Z(m); if ((ym < 0) === (ylo < 0)) { lo = m; ylo = ym; } else hi = m; } zs.push((lo + hi) / 2); } prev = [x, y]; }
      data = { z: z, zs: zs, t0: t0, t1: t1 };
      function NT(T) { var a = T / (2 * M.PI); return a * M.log(a) - a + 7 / 8; }
      o1.innerHTML = 'Zeros found for t from ' + g.fmt(t0, 1) + ' to ' + g.fmt(t1, 1) + ': <b>' + zs.length + '</b> (the formula expects about <b>' + g.fmt(NT(t1) - NT(t0), 1) + '</b>)';
      o2.innerHTML = zs.length ? 'First one here: t ≈ <b>' + zs[0].toFixed(2) + '</b>' : '';
      g.say(o1.textContent);
    }
    g.redraw();
  }
  function axes(x, col, l, b, W, H, xl, ticksY) {
    x.strokeStyle = col.axis; x.lineWidth = 1; x.beginPath(); x.moveTo(l, 8); x.lineTo(l, H - b); x.lineTo(W - 8, H - b); x.stroke();
    x.fillStyle = col.muted; x.font = '12px system-ui'; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText(xl, (W + l) / 2, H - b + 6);
    x.textAlign = 'right'; x.textBaseline = 'middle'; ticksY.forEach(function (q) { x.fillText(q[1], l - 5, q[0]); });
  }
  g.draw(function (col) {
    var x = c.ctx, W = c.w, H = c.h, l = 52, b = 26, i; c.clear(col.bg);
    function line(P, fx, fy, color, w) { x.strokeStyle = color; x.lineWidth = w; x.beginPath(); P.forEach(function (p, i) { if (i) x.lineTo(fx(p), fy(p)); else x.moveTo(fx(p), fy(p)); }); x.stroke(); }
    if (mode === 'twin' && TW) {
      var mx = TW[TW.length - 1][2] * 1.05, fx = function (p) { return l + (W - l - 10) * p[0] / 2e6; };
      axes(x, col, l, b, W, H, 'x, up to 2,000,000', [[H - b, '0'], [8 + (H - b - 8) * (1 - 15000 / mx), '15,000']]);
      line(TW, fx, function (p) { return H - b - (H - b - 8) * p[1] / mx; }, col.green, 3);
      x.setLineDash([7, 6]); line(TW, fx, function (p) { return H - b - (H - b - 8) * p[2] / mx; }, col.gold, 2); x.setLineDash([]);
      x.textAlign = 'left'; x.fillStyle = col.green; x.fillText('twin pairs counted', l + 10, 18); x.fillStyle = col.gold; x.fillText('Hardy–Littlewood prediction (dashed)', l + 10, 36);
    } else if (mode === 'goldbach' && GB) {
      var my = 0; GB.forEach(function (p) { if (p[1] > my) my = p[1]; });
      axes(x, col, l, b, W, H, 'even number, up to 20,000 (height: ways)', [[H - b, '0'], [8 + (H - b - 8) * (1 - 200 / my), '200']]);
      x.fillStyle = col.a(col.blue, 0.6); GB.forEach(function (p) { x.fillRect(l + (W - l - 10) * p[0] / 20000, H - b - (H - b - 8) * p[1] / my, 1.5, 1.5); });
    } else if (mode === 'collatz' && data) {
      var lm = 0; data.forEach(function (v) { var q = M.log10(Number(v)); if (q > lm) lm = q; }); lm = M.max(1, lm);
      axes(x, col, l, b, W, H, 'step (height: the number, log scale)', [[H - b, '1'], [8, '1e' + lm.toFixed(0)]]);
      x.strokeStyle = col.green; x.lineWidth = 2; x.beginPath(); data.forEach(function (v, i) { var X = l + (W - l - 10) * i / M.max(1, data.length - 1), Y = H - b - (H - b - 8) * M.log10(Number(v)) / lm; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); }); x.stroke();
    } else if (mode === 'riemann' && data) {
      var A = 0; data.z.forEach(function (p) { if (M.abs(p[1]) > A) A = M.abs(p[1]); }); A *= 1.1;
      var fx2 = function (p) { return l + (W - l - 10) * (p[0] - data.t0) / (data.t1 - data.t0); }, fy2 = function (p) { return 8 + (H - b - 8) * (0.5 - p[1] / (2 * A)); };
      axes(x, col, l, b, W, H, 't from ' + g.fmt(data.t0, 1) + ' to ' + g.fmt(data.t1, 1) + ' (height: Z(t))', [[fy2([0, 0]), '0']]);
      x.strokeStyle = col.grid; x.beginPath(); x.moveTo(l, fy2([0, 0])); x.lineTo(W - 10, fy2([0, 0])); x.stroke();
      line(data.z, fx2, fy2, col.purple, 2);
      x.fillStyle = col.red; data.zs.forEach(function (t) { x.beginPath(); x.arc(fx2([t]), fy2([0, 0]), 4, 0, 7); x.fill(); });
    }
  });
  var row = g.group(), inp = g.el('input'), lab = g.el('label', 'gx-field'), cap = g.el('span', 'gx-lbl', '');
  inp.type = 'text'; inp.inputMode = 'numeric'; inp.style.cssText = 'font:inherit;min-height:36px;padding:.2rem .4rem;border-radius:8px;border:1.5px solid var(--gx-bd);background:var(--gx-card);color:var(--gx-tx);width:13rem;max-width:100%';
  var CAP = { twin: 'Search after', goldbach: 'Even number', collatz: 'Start', riemann: 't from (10 or more)' };
  g.select({ label: 'Problem', parent: row, value: mode, options: [['twin', 'Twin primes'], ['goldbach', 'Goldbach'], ['collatz', 'Collatz'], ['riemann', 'Riemann hypothesis']], change: function (v) { VAL[mode] = inp.value; mode = v; cap.textContent = CAP[v]; inp.value = VAL[v]; data = null; run(); } });
  var row2 = g.group(); lab.appendChild(cap); lab.appendChild(inp); row2.appendChild(lab);
  g.button('Go', run, { parent: row2, pri: true });
  g.button('Try a random one', function () { var r = g.rng(Date.now() & 0xfffff)(); inp.value = mode === 'riemann' ? String(M.round(10 + r * 990)) : mode === 'goldbach' ? String(2 * M.round(r * 5e8) + 4) : String(M.round(1 + r * 1e9)); run(); }, { parent: row2 });
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
  var o1 = g.out(), o2 = g.out();
  c.onresize = function () { g.redraw(); };
  cap.textContent = CAP[mode]; inp.value = VAL[mode]; run();
});
