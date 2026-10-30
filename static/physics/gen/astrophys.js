/* Physics Ladder: problem generators for Astrophysics (course key "astrophys").
   One generator per topic in data/physics/topics/astrophys.json, registered with MathLadder.gen (spec section 3),
   in the order of the topics file: Starlight, Binary Stars and Exoplanets, How Stars Work, Stellar Evolution and
   Compact Objects, Galaxies and Cosmology.
   Conventions (the Physics Ladder overview): SI units with the astronomer's units where they are the natural ones
   (AU, pc, solar units, km/s, eV); constants rounded as in the overview (c = 3.00 × 10^8 m/s, G = 6.67 × 10^-11
   N·m²/kg², M☉ = 1.99 × 10^30 kg, R☉ = 6.96 × 10^8 m, L☉ = 3.83 × 10^26 W, T☉ = 5772 K, σ = 5.67 × 10^-8 W/(m²·K⁴),
   k_B = 1.38 × 10^-23 J/K = 8.617 × 10^-5 eV/K, m_p = 1.67 × 10^-27 kg, 1 pc = 3.09 × 10^16 m, 1 yr = 3.16 × 10^7 s);
   every problem states the constants it needs. Data are given to 2 or 3 significant figures; answers accept 2% (rtol)
   or, for magnitudes, ±0.02 to ±0.05 mag (tol), unless rounding is the point.
   ML.__apTest (set only by the course's verification harness in the builder's work dir) receives { id, d, p } for each
   problem: the given numbers as shown and the problem, so that a separate script can recompute every answer by a
   different route. It is never set on the site. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, U = ML.util, M = Math;
  // ---------- constants (as stated in problems) ----------
  var K = {
    c: 3.00e8, G: 6.67e-11, Msun: 1.99e30, Rsun: 6.96e8, Lsun: 3.83e26, Tsun: 5772, sigma: 5.67e-8, kB: 1.38e-23,
    kEV: 8.617e-5, mp: 1.67e-27, me: 9.11e-31, h: 6.63e-34, hbar: 1.055e-34, AU: 1.496e11, pc: 3.09e16, ly: 9.46e15,
    yr: 3.16e7, eV: 1.602e-19, MeV: 1.602e-13, sigmaT: 6.65e-29, Rearth: 6.37e6, Mearth: 5.97e24, Rjup: 7.15e7,
    Mjup: 1.90e27, day: 86400, u: 931.5
  };
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  // ---------- numbers ----------
  function sig(x, n) { return x === 0 ? 0 : +(+x).toPrecision(n || 3); }
  function expo(x) { return M.floor(M.log10(M.abs(x)) + 1e-12); }
  function commas(s) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); return p.join('.'); }
  /* tx(x, n): TeX for x to n significant figures: a plain decimal for 0.001 <= |x| < 100000, else a × 10^{b} */
  function tx(x, n) {
    n = n || 3;
    if (x === 0) return '0';
    var neg = x < 0, a = M.abs(sig(x, n)), e = expo(a), s;
    if (e >= -3 && e < 5) { s = a.toFixed(M.max(0, n - 1 - e)); s = commas(s); }
    else { var m = (a / M.pow(10, e)).toFixed(n - 1); if (+m >= 10) { e++; m = (a / M.pow(10, e)).toFixed(n - 1); } s = m + ' \\times 10^{' + e + '}'; }
    return (neg ? '-' : '') + s;
  }
  /* td(x, dp): TeX for x with dp decimals (no sig-fig logic) */
  function td(x, dp) { var s = (+x).toFixed(dp); if (/^-0(\.0*)?$/.test(s)) s = s.slice(1); return commas(s); }
  function pd(x, dp) { var s = td(x, dp); return s.charAt(0) === '-' ? '(' + s + ')' : s; } // ready to subtract or multiply
  function px(x, n) { var s = tx(x, n); return s.charAt(0) === '-' ? '(' + s + ')' : s; }
  /* plain(x, n): an answer string for the checker: 4 significant figures, e-notation when large or small */
  function plain(x, n) {
    var r = sig(x, n || 4), a = M.abs(r);
    if (r === 0) return '0';
    if (a >= 1e-3 && a < 1e6) return String(r);
    return r.toExponential().replace('e+', 'e');
  }
  function num(x, opt) { // a number answer with relative tolerance (default 2%)
    opt = opt || {};
    var a = { t: 'num', v: plain(x, opt.n || 3) };
    if (opt.tol != null) a.tol = opt.tol; else a.rtol = opt.rtol || 0.02;
    return a;
  }
  function mag(x, tol) { return { t: 'num', v: plain(x, 4), tol: tol || 0.03 }; } // magnitudes: absolute tolerance
  function mc(R, correct, wrongs, k) { return U.mc(correct, wrongs, k || 4); }
  function chk(id, d, p, kind) { if (ML.__apTest) { d.k = kind; ML.__apTest({ id: id, d: d, p: p }); } return p; }
  function log10(x) { return M.log(x) / M.LN10; }
  function cube(x) { return x * x * x; }
  function G(id, fn) { ML.gen(id, function (R, ctx) { return fn(R, ctx || { level: 1 }); }); }
  // a value between lo and hi with n significant figures (log-uniform when the range spans a factor of ten or more)
  function rnd(R, lo, hi, n) {
    var x = hi / lo >= 10 ? M.exp(M.log(lo) + R.next() * (M.log(hi) - M.log(lo))) : lo + R.next() * (hi - lo);
    return sig(x, n || 2);
  }
  ML.__ap = { K: K, tx: tx, td: td, plain: plain, sig: sig };

  // =====================================================================================================
  // Unit 1. Starlight
  // =====================================================================================================

  G('astrophys.magnitude-equations', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['ratio', 'dm', 'ratio'], ['ratio', 'dm', 'mfaint', 'pair'], ['mfaint', 'pair', 'mix', 'sun', 'ratio']));
    var id = 'astrophys.magnitude-equations', p, d;
    if (kind === 'ratio') {
      var dm = L === 1 ? R.pick([1, 2, 2.5, 3, 4, 5, 7.5]) : sig(R.real(0.6, 6.5, 1), 2);
      var m1 = R.real(-1, 4, 1), m2 = +(m1 + dm).toFixed(2), r = M.pow(10, 0.4 * dm);
      var names = R.pick([['Vega', 'a faint star'], ['Star A', 'Star B'], ['Capella', 'a nearby star']]);
      d = { m1: m1, m2: m2, ans: r };
      p = { q: names[0] + ' has apparent magnitude $m = ' + td(m1, 1) + '$ and ' + names[1] + ' has $m = ' + td(m2, 1) + '$. How many times more flux do we receive from the brighter one?',
        a: num(r),
        steps: ['The brighter one has the <b>smaller</b> magnitude: ' + names[0] + '. The difference is $\\Delta m = ' + td(m2, 1) + ' - ' + pd(m1, 1) + ' = ' + td(dm, 1) + '$.',
          'Turn magnitudes back into a flux ratio: $F_1/F_2 = 10^{0.4\\,\\Delta m}$.',
          '$10^{0.4 \\times ' + td(dm, 1) + '} = 10^{' + td(0.4 * dm, 2) + '} \\approx ' + tx(r, 3) + '$.'],
        hint: 'Each magnitude is a factor of $10^{0.4} \\approx 2.512$; use $F_1/F_2 = 10^{0.4\\,\\Delta m}$.' };
    } else if (kind === 'dm') {
      var ratio = L === 1 ? R.pick([10, 100, 1000, 4, 40, 2, 20, 250]) : rnd(R, 1.5, 3000, 2), dmm = 2.5 * log10(ratio);
      d = { ratio: ratio, ans: dmm };
      p = { q: 'Star A delivers $' + tx(ratio, 2) + '$ times as much flux to Earth as star B. Find $m_B - m_A$.',
        a: mag(dmm, 0.02),
        steps: ['Use $m_B - m_A = -2.5\\log_{10}(F_B/F_A)$, with $F_B/F_A = 1/' + tx(ratio, 2) + '$.',
          '$-2.5\\log_{10}(1/' + tx(ratio, 2) + ') = 2.5\\log_{10}(' + tx(ratio, 2) + ')$.',
          '$= 2.5 \\times ' + td(log10(ratio), 3) + ' \\approx ' + td(dmm, 2) + '$. It is positive: the fainter star B has the larger magnitude.'],
        hint: 'Write $m_B - m_A = -2.5\\log_{10}(F_B/F_A)$ and mind which flux is on top.' };
    } else if (kind === 'mfaint') {
      var mA = R.real(-0.5, 5, 1), x = L === 2 ? R.pick([2, 3, 5, 10, 16, 25, 40, 60]) : rnd(R, 2, 500, 2), fainter = R.coin();
      var mB = fainter ? mA + 2.5 * log10(x) : mA - 2.5 * log10(x);
      d = { mA: mA, x: x, fainter: fainter, ans: mB };
      p = { q: 'Star A has $m = ' + td(mA, 1) + '$. Star B looks $' + tx(x, 2) + '$ times ' + (fainter ? 'fainter' : 'brighter') + ' than star A. What is the apparent magnitude of star B?',
        a: mag(mB, 0.03),
        steps: ['$F_B/F_A = ' + (fainter ? '1/' + tx(x, 2) : tx(x, 2)) + '$.',
          '$m_B = m_A - 2.5\\log_{10}(F_B/F_A) = ' + td(mA, 1) + (fainter ? ' + ' : ' - ') + '2.5\\log_{10}(' + tx(x, 2) + ')$.',
          '$= ' + td(mA, 1) + (fainter ? ' + ' : ' - ') + td(2.5 * log10(x), 2) + ' = ' + td(mB, 2) + '$. ' + (fainter ? 'Fainter, so the magnitude went up.' : 'Brighter, so the magnitude went down.')],
        hint: 'A ' + (fainter ? 'fainter' : 'brighter') + ' star has a ' + (fainter ? 'larger' : 'smaller') + ' magnitude.' };
    } else if (kind === 'pair') {
      var m0 = R.real(1, 6, 1), N = L === 2 ? R.pick([2, 2, 3, 4, 10]) : R.pick([2, 3, 5, 10, 25, 100]), mt = m0 - 2.5 * log10(N);
      d = { m0: m0, N: N, ans: mt };
      p = { q: (N === 2 ? 'A double star has two members that each have $m = ' + td(m0, 1) + '$. Too close to split by eye, they look like one star.' : 'A small star cluster holds $' + N + '$ stars that each have $m = ' + td(m0, 1) + '$. Seen without a telescope, they blur into one spot.') + ' What is the combined apparent magnitude?',
        a: mag(mt, 0.02),
        steps: ['Fluxes add, magnitudes do not: the total flux is $' + N + 'F$.',
          '$m_{\\text{total}} = m - 2.5\\log_{10}(' + N + ')$.',
          '$= ' + td(m0, 1) + ' - ' + td(2.5 * log10(N), 3) + ' = ' + td(mt, 2) + '$, a little brighter (smaller) than one star alone.'],
        hint: 'Add the fluxes first, then convert back to a magnitude.' };
    } else if (kind === 'mix') {
      var a1 = R.real(0, 4, 1), a2 = +(a1 + R.real(0.5, 2.5, 1)).toFixed(1), ft = M.pow(10, -0.4 * a1) + M.pow(10, -0.4 * a2), mc2 = -2.5 * log10(ft);
      var rr = M.pow(10, -0.4 * (a2 - a1));
      d = { a1: a1, a2: a2, ans: mc2 };
      p = { q: 'A binary star has components of apparent magnitude $' + td(a1, 1) + '$ and $' + td(a2, 1) + '$. What is the magnitude of the unresolved pair?',
        a: mag(mc2, 0.02),
        steps: ['Measure fluxes in units of the brighter star: $F_1 = 1$ and $F_2 = 10^{-0.4(' + td(a2, 1) + ' - ' + td(a1, 1) + ')} = ' + td(rr, 3) + '$.',
          'Total flux: $1 + ' + td(rr, 3) + ' = ' + td(1 + rr, 3) + '$ times the brighter star\'s.',
          '$m = ' + td(a1, 1) + ' - 2.5\\log_{10}(' + td(1 + rr, 3) + ') = ' + td(mc2, 2) + '$.'],
        hint: 'Convert each magnitude to a flux, add, and convert back.' };
    } else { // sun
      var star = R.pick([['Sirius', -1.46], ['Vega', 0.03], ['Polaris', 1.98], ['Betelgeuse', 0.50], ['Deneb', 1.25], ['Proxima Centauri', 11.13]]);
      var dsun = star[1] + 26.74, rs = M.pow(10, 0.4 * dsun);
      d = { m: star[1], ans: rs };
      p = { q: 'The Sun has $m = -26.74$ and ' + star[0] + ' has $m = ' + td(star[1], 2) + '$. How many times more flux reaches us from the Sun?',
        a: num(rs),
        steps: ['$\\Delta m = ' + td(star[1], 2) + ' - (-26.74) = ' + td(dsun, 2) + '$.',
          '$F_\\odot/F_\\star = 10^{0.4 \\times ' + td(dsun, 2) + '} = 10^{' + td(0.4 * dsun, 3) + '}$.',
          '$\\approx ' + tx(rs, 3) + '$.'],
        hint: 'Find the magnitude difference, then use $10^{0.4\\,\\Delta m}$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.distance-modulus', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['dist', 'appm', 'dist'], ['dist', 'absM', 'ly', 'appm'], ['plx', 'two', 'ly', 'dist']));
    var id = 'astrophys.distance-modulus', p, d;
    if (kind === 'dist') {
      var mu = L === 1 ? R.pick([0, 5, 10, 15, 2.5, 7.5, 12.5]) : null, m, Mabs;
      if (L === 1) { Mabs = R.real(-3, 6, 1); m = +(Mabs + mu).toFixed(1); }
      else { Mabs = R.real(-5, 7, 1); m = +(Mabs + R.real(1, 18, 1)).toFixed(1); mu = +(m - Mabs).toFixed(1); }
      var dd = M.pow(10, (mu + 5) / 5);
      d = { m: m, M: Mabs, ans: dd };
      p = { q: 'A star has apparent magnitude $m = ' + td(m, 1) + '$ and absolute magnitude $M = ' + td(Mabs, 1) + '$. How far away is it, in parsecs?',
        a: num(dd), unit: 'pc',
        steps: ['Distance modulus: $m - M = ' + td(m, 1) + ' - (' + td(Mabs, 1) + ') = ' + td(mu, 1) + '$.',
          'Solve $m - M = 5\\log_{10}(d/10\\text{ pc})$: $d = 10^{(m - M + 5)/5}$ pc.',
          '$d = 10^{' + td((mu + 5) / 5, 2) + '}\\text{ pc} \\approx ' + tx(dd, 3) + '\\text{ pc}$.'],
        hint: '$m - M = 5\\log_{10}(d/10\\text{ pc})$; undo the log.' };
    } else if (kind === 'appm') {
      var Mb = R.real(-4, 6, 1), dpc = L === 1 ? R.pick([100, 1000, 25, 50, 250, 400, 2000, 10000]) : rnd(R, 15, 5000, 2), mm = Mb + 5 * log10(dpc / 10);
      d = { M: Mb, d: dpc, ans: mm };
      p = { q: 'A star with absolute magnitude $M = ' + td(Mb, 1) + '$ is $' + tx(dpc, 2) + '$ pc away. What apparent magnitude do we see?',
        a: mag(mm, 0.03),
        steps: ['$m = M + 5\\log_{10}(d/10\\text{ pc})$.',
          '$d/10\\text{ pc} = ' + tx(dpc / 10, 3) + '$, and $5\\log_{10}(' + tx(dpc / 10, 3) + ') = ' + td(5 * log10(dpc / 10), 2) + '$.',
          '$m = ' + td(Mb, 1) + ' + ' + td(5 * log10(dpc / 10), 2) + ' = ' + td(mm, 2) + '$.'],
        hint: 'Start from $m - M = 5\\log_{10}(d/10\\text{ pc})$.' };
    } else if (kind === 'absM') {
      var m3 = R.real(2, 14, 1), d3 = rnd(R, 20, 3000, 2), M3 = m3 - 5 * log10(d3 / 10);
      d = { m: m3, d: d3, ans: M3 };
      p = { q: 'A star at $' + tx(d3, 2) + '$ pc has apparent magnitude $' + td(m3, 1) + '$. Find its absolute magnitude $M$.',
        a: mag(M3, 0.03),
        steps: ['$M = m - 5\\log_{10}(d/10\\text{ pc})$.',
          '$5\\log_{10}(' + tx(d3 / 10, 3) + ') = ' + td(5 * log10(d3 / 10), 2) + '$.',
          '$M = ' + td(m3, 1) + ' - ' + td(5 * log10(d3 / 10), 2) + ' = ' + td(M3, 2) + '$.'],
        hint: 'Absolute magnitude is what the star would show from 10 pc.' };
    } else if (kind === 'ly') {
      var dly = rnd(R, 60, 9000, 2), m4 = R.real(1, 12, 1), dp = dly / 3.26, M4 = m4 - 5 * log10(dp / 10);
      d = { dly: dly, m: m4, ans: M4 };
      p = { q: 'A star $' + tx(dly, 2) + '$ light-years away has $m = ' + td(m4, 1) + '$. Find its absolute magnitude. ($1\\text{ pc} = 3.26$ ly.)',
        a: mag(M4, 0.04),
        steps: ['Convert first: $d = ' + tx(dly, 2) + '/3.26 = ' + tx(dp, 3) + '$ pc.',
          '$5\\log_{10}(d/10\\text{ pc}) = 5\\log_{10}(' + tx(dp / 10, 3) + ') = ' + td(5 * log10(dp / 10), 2) + '$.',
          '$M = ' + td(m4, 1) + ' - ' + td(5 * log10(dp / 10), 2) + ' = ' + td(M4, 2) + '$.'],
        hint: 'The formula needs parsecs, not light-years.' };
    } else if (kind === 'plx') {
      var pa = sig(R.real(0.004, 0.25, 3), 2), m5 = R.real(0, 11, 1), d5 = 1 / pa, M5 = m5 + 5 + 5 * log10(pa);
      d = { p: pa, m: m5, ans: M5 };
      p = { q: 'Gaia measures a parallax of $' + tx(pa, 2) + '\'\'$ for a star with $m = ' + td(m5, 1) + '$. What is its absolute magnitude?',
        a: mag(M5, 0.03),
        steps: ['Distance from parallax: $d = 1/p = 1/' + tx(pa, 2) + ' = ' + tx(d5, 3) + '$ pc.',
          '$5\\log_{10}(d/10\\text{ pc}) = 5\\log_{10}(' + tx(d5 / 10, 3) + ') = ' + td(5 * log10(d5 / 10), 2) + '$.',
          '$M = ' + td(m5, 1) + ' - ' + pd(5 * log10(d5 / 10), 2) + ' = ' + td(M5, 2) + '$.'],
        hint: 'First $d = 1/p$ in parsecs, then the distance modulus.' };
    } else { // two identical stars
      var mA = R.real(2, 8, 1), dm2 = R.pick([2.5, 5, 3, 4, 7.5, 1.5, 6]), mB = +(mA + dm2).toFixed(1), d1 = rnd(R, 20, 400, 2), r2 = M.pow(10, dm2 / 5), d2 = d1 * r2;
      d = { mA: mA, mB: mB, d1: d1, ans: d2 };
      p = { q: 'Two stars have identical spectra, so they have the same absolute magnitude. Star A ($m = ' + td(mA, 1) + '$) is $' + tx(d1, 2) + '$ pc away. Star B has $m = ' + td(mB, 1) + '$. How far away is star B?',
        a: num(d2), unit: 'pc',
        steps: ['Subtract the two distance moduli; $M$ cancels: $m_B - m_A = 5\\log_{10}(d_B/d_A)$.',
          '$d_B/d_A = 10^{(m_B - m_A)/5} = 10^{' + td(dm2 / 5, 2) + '} = ' + tx(r2, 3) + '$.',
          '$d_B = ' + tx(r2, 3) + ' \\times ' + tx(d1, 2) + '\\text{ pc} = ' + tx(d2, 3) + '\\text{ pc}$.'],
        hint: 'Write the distance modulus for each star and subtract.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.extinction', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['dist', 'dim', 'concept'], ['red', 'over', 'dist', 'concept'], ['findA', 'red', 'over']));
    var id = 'astrophys.extinction', p, d;
    if (kind === 'dist') {
      var Mabs = R.real(-4, 4, 1), A = R.pick([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 1.2, 0.8]), mu0 = L === 1 ? R.pick([10, 12, 13, 11, 14]) : R.real(8, 15, 1);
      var m = +(Mabs + mu0 + A).toFixed(1), dd = M.pow(10, (m - Mabs - A + 5) / 5);
      d = { m: m, M: Mabs, A: A, ans: dd };
      p = { q: 'A star has $m_V = ' + td(m, 1) + '$ and $M_V = ' + td(Mabs, 1) + '$, and dust along the line of sight dims it by $A_V = ' + td(A, 1) + '$ mag. How far away is it?',
        a: num(dd), unit: 'pc',
        steps: ['With dust: $m - M = 5\\log_{10}(d/10\\text{ pc}) + A_V$.',
          '$5\\log_{10}(d/10\\text{ pc}) = ' + td(m, 1) + ' - (' + td(Mabs, 1) + ') - ' + td(A, 1) + ' = ' + td(m - Mabs - A, 1) + '$.',
          '$d = 10^{(' + td(m - Mabs - A, 1) + ' + 5)/5}\\text{ pc} = ' + tx(dd, 3) + '\\text{ pc}$.'],
        hint: 'Take the dust\'s $A_V$ out of $m - M$ before you undo the log.' };
    } else if (kind === 'dim') {
      var A2 = L === 1 ? R.pick([1, 2, 2.5, 5, 0.5, 1.5, 3]) : R.real(0.3, 4.5, 1), f = M.pow(10, 0.4 * A2);
      d = { A: A2, ans: f };
      p = { q: 'Dust in front of a star causes $A_V = ' + td(A2, 1) + '$ magnitudes of extinction. By what factor does the dust reduce the star\'s visual flux?',
        a: num(f),
        steps: ['Extinction is a magnitude difference: $A_V = m_{\\text{with dust}} - m_{\\text{without}}$.',
          'Flux factor: $10^{0.4 A_V} = 10^{0.4 \\times ' + td(A2, 1) + '} = 10^{' + td(0.4 * A2, 2) + '}$.',
          '$\\approx ' + tx(f, 3) + '$: the star looks that many times fainter.'],
        hint: 'A magnitude difference $\\Delta m$ is a flux factor of $10^{0.4\\,\\Delta m}$.' };
    } else if (kind === 'red') {
      var bv0 = R.pick([-0.3, -0.2, 0.0, 0.15, 0.3, 0.45, 0.6]), E = R.real(0.2, 1.2, 2), bv = +(bv0 + E).toFixed(2), Av = 3.1 * E;
      var M6 = R.real(-5, 1, 1), m6 = +(M6 + R.real(9, 13, 1) + Av).toFixed(1), dd2 = M.pow(10, (m6 - M6 - Av + 5) / 5);
      var full = L === 3;
      d = { bv: bv, bv0: bv0, m: m6, M: M6, full: full, ans: full ? dd2 : Av };
      p = { q: 'A star\'s spectrum says its true color index is $(B - V)_0 = ' + td(bv0, 2) + '$, but we measure $B - V = ' + td(bv, 2) + '$. ' + (full ? 'It has $m_V = ' + td(m6, 1) + '$ and $M_V = ' + td(M6, 1) + '$. Using $A_V = 3.1\\,E(B - V)$, how far away is it?' : 'Using $A_V = 3.1\\,E(B - V)$, find the visual extinction $A_V$.'),
        a: full ? num(dd2, { rtol: 0.03 }) : mag(Av, 0.03), unit: full ? 'pc' : 'mag',
        steps: ['Color excess (reddening): $E(B - V) = ' + td(bv, 2) + ' - (' + td(bv0, 2) + ') = ' + td(E, 2) + '$.',
          '$A_V = 3.1 \\times ' + td(E, 2) + ' = ' + td(Av, 2) + '$ mag.'].concat(full ? [
          '$5\\log_{10}(d/10\\text{ pc}) = m - M - A_V = ' + td(m6 - M6, 1) + ' - ' + td(Av, 2) + ' = ' + td(m6 - M6 - Av, 2) + '$.',
          '$d = 10^{(' + td(m6 - M6 - Av, 2) + ' + 5)/5}\\text{ pc} \\approx ' + tx(dd2, 3) + '\\text{ pc}$.'] : []),
        hint: 'Reddening is observed color minus true color; extinction is about 3.1 times it.' };
    } else if (kind === 'over') {
      var A3 = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), fac = M.pow(10, A3 / 5);
      d = { A: A3, ans: fac };
      p = { q: 'An astronomer ignores dust that causes $A_V = ' + td(A3, 1) + '$ mag of extinction toward a star of known $M_V$. By what factor does she overestimate the distance?',
        a: num(fac),
        steps: ['Without the dust term she sets $5\\log_{10}(d_{\\text{wrong}}/10\\text{ pc}) = m - M$; the truth is $5\\log_{10}(d/10\\text{ pc}) = m - M - A_V$.',
          'Subtract: $5\\log_{10}(d_{\\text{wrong}}/d) = A_V$.',
          '$d_{\\text{wrong}}/d = 10^{A_V/5} = 10^{' + td(A3 / 5, 2) + '} = ' + tx(fac, 3) + '$.'],
        hint: 'Write both distance moduli and subtract them.' };
    } else if (kind === 'findA') {
      var pa = sig(R.real(0.0015, 0.008, 4), 2), dd3 = 1 / pa, M7 = R.real(-2, 3, 1), Atrue = R.real(0.4, 2.8, 1), m7 = +(M7 + 5 * log10(dd3 / 10) + Atrue).toFixed(1);
      var A7 = m7 - M7 - 5 * log10(dd3 / 10);
      d = { p: pa, m: m7, M: M7, ans: A7 };
      p = { q: 'A star has parallax $' + tx(pa, 2) + '\'\'$, $m_V = ' + td(m7, 1) + '$ and (from its spectrum) $M_V = ' + td(M7, 1) + '$. How many magnitudes of extinction lie along the line of sight?',
        a: mag(A7, 0.04), unit: 'mag',
        steps: ['Distance: $d = 1/p = ' + tx(dd3, 3) + '$ pc, so $5\\log_{10}(d/10\\text{ pc}) = ' + td(5 * log10(dd3 / 10), 2) + '$.',
          '$m - M = ' + td(m7 - M7, 1) + '$, which is more than the distance alone explains.',
          '$A_V = ' + td(m7 - M7, 1) + ' - ' + pd(5 * log10(dd3 / 10), 2) + ' = ' + td(A7, 2) + '$ mag.'],
        hint: 'Distance from parallax, then $A_V = (m - M) - 5\\log_{10}(d/10\\text{ pc})$.' };
    } else { // concept
      var v = R.pick([
        ['A star\'s absorption lines say it is a hot B star, but its measured $B - V$ is $+0.6$, the color of a cool G star. What is the best explanation?',
          'Dust between us and the star scatters and absorbs more blue light than red, reddening it.',
          ['The star is cooler than its lines suggest, so the lines are misleading.', 'The star is moving away from us, and its redshift makes it redder.', 'The star has less hydrogen than other B stars.']],
        ['Two identical stars lie at the same distance, but one sits behind a dusty cloud. Compared with the other, how does it look?',
          'Fainter and redder; its spectral lines still show the same temperature.',
          ['Fainter, but exactly the same color.', 'The same brightness, but redder.', 'Fainter and bluer, because dust removes red light.']],
        ['Why does dust make starlight redder?',
          'Dust grains dim short (blue) wavelengths more than long (red) ones, so the light that gets through is relatively red.',
          ['Dust grains glow red and add red light to the beam.', 'Dust slows down blue light so it arrives later.', 'Dust Doppler-shifts every wavelength toward the red.']]]);
      d = { ans: 0 };
      p = { q: v[0], a: mc(R, v[1], v[2]),
        steps: ['Dust removes blue light more efficiently than red light, so a star behind dust is dimmed (extinction) and reddened.', 'Its absorption lines are not changed, so the spectrum still tells its true temperature; the difference between observed and true color measures the reddening.'],
        hint: 'What does dust do to blue light compared with red light?' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.color-index', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['which', 'bfromv', 'concept'], ['ratio', 'which', 'flux'], ['flux2', 'ratio', 'flux']));
    var id = 'astrophys.color-index', p, d;
    if (kind === 'which') {
      var bv1 = R.pick([-0.25, -0.1, 0.0, 0.3, 0.6, 0.9, 1.2, 1.6]), bv2;
      do { bv2 = R.pick([-0.2, 0.05, 0.4, 0.65, 1.0, 1.4, 1.8]); } while (M.abs(bv2 - bv1) < 0.3);
      var V1 = R.real(3, 9, 2), V2 = R.real(3, 9, 2), B1 = +(V1 + bv1).toFixed(2), B2 = +(V2 + bv2).toFixed(2);
      var hot = bv1 < bv2 ? 'X' : 'Y', bright = V1 < V2 ? 'X' : 'Y';
      var wrong = hot === 'X' ? 'Star Y' : 'Star X';
      d = { B1: B1, V1: V1, B2: B2, V2: V2, ans: hot };
      p = { q: 'Star X has $B = ' + td(B1, 2) + '$, $V = ' + td(V1, 2) + '$. Star Y has $B = ' + td(B2, 2) + '$, $V = ' + td(V2, 2) + '$. Which star has the hotter surface?',
        a: mc(R, 'Star ' + hot, [wrong, 'They have the same temperature', 'We need their distances to tell']),
        steps: ['Color index: X has $B - V = ' + td(bv1, 2) + '$; Y has $B - V = ' + td(bv2, 2) + '$.',
          'The smaller (more negative) $B - V$ means relatively more blue light, so a hotter surface.',
          'Star ' + hot + ' is hotter' + (hot !== bright ? ', even though star ' + bright + ' looks brighter: brightness depends on distance and size, color does not.' : '.') + ' Distance does not change the color index (ignoring dust).'],
        hint: 'Compare $B - V$, not $V$.' };
    } else if (kind === 'bfromv') {
      var V = R.real(2, 12, 2), bv = R.pick([-0.25, -0.12, 0.0, 0.33, 0.58, 0.65, 0.81, 1.15, 1.42, 1.85]), B = V + bv;
      d = { V: V, bv: bv, ans: B };
      p = { q: 'A star has $V = ' + td(V, 2) + '$ and color index $B - V = ' + td(bv, 2) + '$. What is its blue magnitude $B$?',
        a: mag(B, 0.01),
        steps: ['$B = V + (B - V)$.', '$B = ' + td(V, 2) + ' + (' + td(bv, 2) + ') = ' + td(B, 2) + '$.',
          bv > 0 ? 'Its $B$ magnitude is larger: the star is fainter in blue light than in yellow-green light, so it is on the cool, red side.' : 'Its $B$ magnitude is no larger than $V$: the star is relatively bright in blue light, so it is hot.'],
        hint: 'The color index is just $B$ minus $V$.' };
    } else if (kind === 'ratio') {
      var r = sig(R.real(0.2, 1.4, 2), 2), bvr = -2.5 * log10(r);
      d = { r: r, ans: bvr };
      p = { q: 'Compared with Vega (whose $B - V$ is defined as $0$), a star\'s ratio of blue flux to visual flux is $' + td(r, 2) + '$ times Vega\'s. What is the star\'s $B - V$?',
        a: mag(bvr, 0.02),
        steps: ['$B - V = -2.5\\log_{10}\\!\\left(\\dfrac{(F_B/F_V)_\\star}{(F_B/F_V)_{\\text{Vega}}}\\right)$.',
          '$= -2.5\\log_{10}(' + td(r, 2) + ') = -2.5 \\times (' + td(log10(r), 3) + ')$.',
          '$= ' + td(bvr, 2) + '$. ' + (r < 1 ? 'Less blue than Vega: a positive index, a cooler star.' : 'More blue than Vega: a negative index, a hotter star.')],
        hint: 'A color index is a magnitude difference, so it is $-2.5\\log_{10}$ of a flux ratio.' };
    } else if (kind === 'flux') {
      var bvf = R.pick([0.65, 1.0, 1.5, 1.85, -0.2, -0.3, 0.4, 1.2]), rr = M.pow(10, -0.4 * bvf);
      d = { bv: bvf, ans: rr };
      p = { q: 'A star has $B - V = ' + td(bvf, 2) + '$. Compared with a star of $B - V = 0$, by what factor is its ratio of blue to visual flux, $F_B/F_V$, larger or smaller? (Give the factor.)',
        a: num(rr),
        steps: ['$B - V = -2.5\\log_{10}$ of the ratio of the two stars\' $F_B/F_V$ values.',
          'So the factor is $10^{-0.4(B - V)} = 10^{' + td(-0.4 * bvf, 2) + '}$.',
          '$= ' + tx(rr, 3) + '$' + (rr < 1 ? ': relatively less blue light, so a cooler, redder star.' : ': relatively more blue light, so a hotter star.')],
        hint: 'Undo $-2.5\\log_{10}$: raise 10 to the power $-0.4(B - V)$.' };
    } else if (kind === 'flux2') {
      var s1 = R.pick([-0.3, -0.2, 0.0, 0.3]), s2 = R.pick([0.65, 1.0, 1.4, 1.85, 0.7, 0.8, 1.2, 1.5]), f2 = M.pow(10, 0.4 * (s2 - s1));
      d = { s1: s1, s2: s2, ans: f2 };
      p = { q: 'Star P has $B - V = ' + td(s1, 2) + '$ and star Q has $B - V = ' + td(s2, 2) + '$. By what factor is P\'s blue-to-visual flux ratio $F_B/F_V$ larger than Q\'s?',
        a: num(f2),
        steps: ['The difference of color indices is $(B - V)_Q - (B - V)_P = ' + td(s2 - s1, 2) + '$.',
          'A magnitude difference $\\Delta$ is a flux-ratio factor of $10^{0.4\\Delta}$.',
          '$10^{0.4 \\times ' + td(s2 - s1, 2) + '} = ' + tx(f2, 3) + '$, so the bluer star P is the hotter one.'],
        hint: 'Treat the difference of the two color indices like any magnitude difference.' };
    } else {
      var c = R.pick([
        ['Star A has $B - V = 1.4$ and star B has $B - V = 0.1$. Which statement is right?', 'Star B is hotter; star A gives out relatively less blue light.', ['Star A is hotter, because its color index is larger.', 'Star A is brighter, because its color index is larger.', 'Star B is farther away, because its index is smaller.']],
        ['What does a negative color index, such as $B - V = -0.3$, tell you?', 'The star is brighter in blue light than in yellow-green light, relative to Vega, so it is very hot.', ['The star is fainter than magnitude zero.', 'The star is moving toward us.', 'The star is cooler than Vega.']],
        ['The Sun has $B - V \\approx 0.65$. A red giant has $B - V \\approx 1.5$. What can you say?', 'The red giant\'s surface is cooler than the Sun\'s.', ['The red giant is hotter, since its index is larger.', 'The red giant is fainter than the Sun.', 'The red giant is closer than the Sun.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['$B - V = m_B - m_V$. Magnitudes grow as light gets fainter.', 'A large $B - V$ means the star is faint in blue compared with visual light: a cool, red star. A small or negative $B - V$ means a hot, blue star.'],
        hint: 'A larger magnitude means fainter. Which light is the star faint in when $B - V$ is large?' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.planck-function', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['peak', 'temp', 'peak'], ['flux', 'ratio', 'peak', 'temp'], ['ratio', 'radio', 'flux']));
    var id = 'astrophys.planck-function', p, d, b = 2.898e-3, hck = 1.4388e-2;
    if (kind === 'peak') {
      var obj = R.pick([['a red dwarf', 3200], ['the Sun', 5772], ['Sirius A', 9940], ['Rigel', 12100], ['an O star', 35000], ['Betelgeuse', 3600], ['a white dwarf', 25000], ['a brown dwarf', 1300]]);
      var named = L === 1 && R.coin(), T = named ? obj[1] : L === 1 ? R.int(13, 400) * 100 : sig(R.int(2500, 40000), 3), lam = b / T * 1e9;
      d = { T: T, ans: lam };
      p = { q: 'At what wavelength does ' + (named ? obj[0] + ', with $T = ' + tx(T, 4) + '$ K,' : 'a blackbody at $' + tx(T, 3) + '$ K') + ' emit the most energy per unit wavelength? (Wien\'s constant $b = 2.898 \\times 10^{-3}$ m·K.)',
        a: num(lam), unit: 'nm',
        steps: ['Wien\'s law: $\\lambda_{\\max} = b/T$.', '$\\lambda_{\\max} = 2.898 \\times 10^{-3}\\text{ m·K}/' + tx(T, 4) + '\\text{ K} = ' + tx(lam * 1e-9, 3) + '$ m.',
          '$= ' + tx(lam, 3) + '$ nm' + (lam < 400 ? ' (ultraviolet).' : lam > 700 ? ' (infrared).' : ' (visible).')],
        hint: 'Use $\\lambda_{\\max} T = 2.898 \\times 10^{-3}$ m·K.' };
    } else if (kind === 'temp') {
      var lam2 = L === 1 ? R.int(20, 200) * 5 : R.int(120, 2000), T2 = b / (lam2 * 1e-9);
      d = { lam: lam2, ans: T2 };
      p = { q: 'A star\'s spectrum peaks at $' + lam2 + '$ nm. Treating it as a blackbody, what is its surface temperature? ($b = 2.898 \\times 10^{-3}$ m·K.)',
        a: num(T2), unit: 'K',
        steps: ['Wien\'s law solved for $T$: $T = b/\\lambda_{\\max}$.', '$\\lambda_{\\max} = ' + lam2 + '\\text{ nm} = ' + tx(lam2 * 1e-9, 3) + '$ m.', '$T = 2.898 \\times 10^{-3}/' + tx(lam2 * 1e-9, 3) + ' = ' + tx(T2, 3) + '$ K.'],
        hint: 'Convert nanometers to meters, then $T = b/\\lambda_{\\max}$.' };
    } else if (kind === 'flux') {
      var T1 = sig(R.int(3000, 6000), 2), f = R.pick([1.5, 2, 2.5, 3, 4, 3.5]), T3 = T1 * f, ratio = M.pow(f, 4), both = L === 3;
      var F1 = 5.67e-8 * M.pow(T1, 4);
      d = { T1: T1, T3: T3, both: both, ans: both ? F1 : ratio };
      p = both ? { q: 'Integrating the Planck function over all wavelengths gives the flux leaving a blackbody\'s surface, $F = \\sigma T^4$. Find $F$ for a star\'s surface at $' + tx(T1, 2) + '$ K. ($\\sigma = 5.67 \\times 10^{-8}$ W/(m²·K⁴).)',
        a: num(F1), unit: 'W/m²',
        steps: ['$F = \\sigma T^4 = 5.67 \\times 10^{-8} \\times (' + tx(T1, 2) + ')^4$.', '$(' + tx(T1, 2) + ')^4 = ' + tx(M.pow(T1, 4), 3) + '$ K⁴.', '$F = ' + tx(F1, 3) + '$ W/m², every square meter of the surface.'],
        hint: 'The area under $B_\\lambda$ (times $\\pi$) is $\\sigma T^4$.' } : { q: 'Blackbody A is at $' + tx(T1, 2) + '$ K and blackbody B at $' + tx(T3, 3) + '$ K. How many times more power does each square meter of B radiate, summed over all wavelengths?',
        a: num(ratio),
        steps: ['The area under the Planck curve gives $F = \\sigma T^4$.', 'So $F_B/F_A = (T_B/T_A)^4 = (' + td(f, 1) + ')^4$.', '$= ' + tx(ratio, 3) + '$.'],
        hint: 'The total flux grows as the fourth power of temperature.' };
    } else if (kind === 'ratio') {
      var lamr = R.pick([400, 500, 550, 700, 1000, 2000, 600, 800, 900, 1200, 1500]), Ta = R.pick([3000, 4000, 5000, 6000, 3500]), Tb = Ta * R.pick([1.5, 2]), xa = hck / (lamr * 1e-9 * Ta), xb = hck / (lamr * 1e-9 * Tb);
      var rat = (M.exp(xa) - 1) / (M.exp(xb) - 1);
      d = { lam: lamr, Ta: Ta, Tb: Tb, ans: rat };
      p = { q: 'Compare blackbodies at $' + tx(Ta, 2) + '$ K and $' + tx(Tb, 2) + '$ K at the single wavelength $\\lambda = ' + lamr + '$ nm. Find $B_\\lambda(' + tx(Tb, 2) + '\\text{ K})/B_\\lambda(' + tx(Ta, 2) + '\\text{ K})$. (Use $hc/k = 1.4388 \\times 10^{-2}$ m·K.)',
        a: num(rat),
        steps: ['$B_\\lambda = \\dfrac{2hc^2}{\\lambda^5}\\,\\dfrac{1}{e^{x} - 1}$ with $x = hc/(\\lambda kT)$; the factor $2hc^2/\\lambda^5$ cancels in the ratio.',
          '$x_1 = 1.4388 \\times 10^{-2}/(' + tx(lamr * 1e-9, 3) + ' \\times ' + tx(Ta, 2) + ') = ' + td(xa, 3) + '$; $x_2 = ' + td(xb, 3) + '$.',
          'Ratio $= \\dfrac{e^{' + td(xa, 3) + '} - 1}{e^{' + td(xb, 3) + '} - 1} = ' + tx(rat, 3) + '$. The hotter body is brighter here too.'],
        hint: 'Only the factor $1/(e^{hc/\\lambda kT} - 1)$ changes with temperature.' };
    } else { // radio: long-wavelength limit
      var lr = R.pick([1, 2, 5, 21]) /* cm */, T4 = R.pick([3000, 4000, 5800, 10000, 3500, 6000, 7000, 9000]), T5 = T4 * R.pick([2, 3, 1.5, 2.5]), x4 = hck / (lr * 1e-2 * T4), x5 = hck / (lr * 1e-2 * T5);
      var rr2 = (M.exp(x4) - 1) / (M.exp(x5) - 1);
      d = { lam: lr, Ta: T4, Tb: T5, ans: rr2 };
      p = { q: 'At the radio wavelength $\\lambda = ' + lr + '$ cm, find the ratio $B_\\lambda(' + tx(T5, 2) + '\\text{ K})/B_\\lambda(' + tx(T4, 2) + '\\text{ K})$. ($hc/k = 1.4388 \\times 10^{-2}$ m·K.)',
        a: num(rr2),
        steps: ['$x = hc/(\\lambda kT)$: $x_1 = 1.4388 \\times 10^{-2}/(' + tx(lr * 1e-2, 2) + ' \\times ' + tx(T4, 2) + ') = ' + tx(x4, 3) + '$, $x_2 = ' + tx(x5, 3) + '$.',
          'For $x \\ll 1$, $e^x - 1 \\approx x$, so the ratio is about $x_1/x_2 = T_2/T_1$ (the Rayleigh–Jeans limit, $B_\\lambda \\approx 2ckT/\\lambda^4$).',
          'Ratio $\\approx ' + tx(rr2, 3) + '$: brighter, but only in proportion to $T$ at long wavelengths.'],
        hint: 'When $x$ is tiny, $e^x - 1 \\approx x$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.effective-temperature', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['radius', 'radius', 'lum'], ['temp', 'radius', 'lum', 'si'], ['km', 'ratio', 'temp', 'si']));
    var id = 'astrophys.effective-temperature', p, d, cls = [['a red giant', 100, 900, 3700, 4800], ['a supergiant', 2e4, 2e5, 3400, 20000], ['a red dwarf', 0.002, 0.08, 2900, 3800], ['a white dwarf', 0.0005, 0.05, 8000, 30000], ['a main-sequence A star', 10, 60, 7500, 10000]];
    var c = R.pick(cls), Lx = rnd(R, c[1], c[2], 2), Tx = sig(R.int(c[3], c[4]), 2);
    if (kind === 'radius') {
      var Rr = M.sqrt(Lx) * M.pow(5772 / Tx, 2);
      d = { L: Lx, T: Tx, ans: Rr };
      p = { q: c[0].charAt(0).toUpperCase() + c[0].slice(1) + ' has $L = ' + tx(Lx, 2) + '\\,L_\\odot$ and $T_{\\text{eff}} = ' + tx(Tx, 2) + '$ K. What is its radius in solar radii? (The Sun: $T_{\\text{eff}} = 5772$ K.)',
        a: num(Rr), unit: 'R☉',
        steps: ['In solar units, $L = R^2 T^4$, so $R/R_\\odot = \\sqrt{L/L_\\odot}\\,(T_\\odot/T)^2$.',
          '$\\sqrt{' + tx(Lx, 2) + '} = ' + tx(M.sqrt(Lx), 3) + '$ and $(5772/' + tx(Tx, 2) + ')^2 = ' + tx(M.pow(5772 / Tx, 2), 3) + '$.',
          '$R = ' + tx(M.sqrt(Lx), 3) + ' \\times ' + tx(M.pow(5772 / Tx, 2), 3) + ' = ' + tx(Rr, 3) + '\\,R_\\odot$.'],
        hint: 'Solve $L = 4\\pi R^2 \\sigma T^4$ for $R$, in solar units.' };
    } else if (kind === 'temp') {
      var R0 = rnd(R, 0.1, 400, 2), L0 = rnd(R, 0.01, 1e5, 2), T0 = 5772 * M.pow(L0 / (R0 * R0), 0.25);
      if (T0 < 2000 || T0 > 60000) { R0 = sig(M.sqrt(L0) * M.pow(5772 / sig(R.int(3500, 20000), 2), 2), 2); T0 = 5772 * M.pow(L0 / (R0 * R0), 0.25); }
      d = { L: L0, R: R0, ans: T0 };
      p = { q: 'A star has $L = ' + tx(L0, 2) + '\\,L_\\odot$ and $R = ' + tx(R0, 2) + '\\,R_\\odot$. Find its effective temperature. ($T_\\odot = 5772$ K.)',
        a: num(T0), unit: 'K',
        steps: ['$T/T_\\odot = \\left(\\dfrac{L/L_\\odot}{(R/R_\\odot)^2}\\right)^{1/4}$.',
          '$L/R^2 = ' + tx(L0, 2) + '/' + tx(R0 * R0, 3) + ' = ' + tx(L0 / (R0 * R0), 3) + '$; its fourth root is $' + tx(T0 / 5772, 3) + '$.',
          '$T = ' + tx(T0 / 5772, 3) + ' \\times 5772\\text{ K} = ' + tx(T0, 3) + '$ K.'],
        hint: 'Rearrange $L = R^2T^4$ (solar units) for $T$.' };
    } else if (kind === 'lum') {
      var R1 = rnd(R, 0.5, 50, 2), T1 = sig(R.int(3500, 12000), 2), L1 = R1 * R1 * M.pow(T1 / 5772, 4);
      d = { R: R1, T: T1, ans: L1 };
      p = { q: 'A star has radius $' + tx(R1, 2) + '\\,R_\\odot$ and effective temperature $' + tx(T1, 2) + '$ K. What is its luminosity in solar units? ($T_\\odot = 5772$ K.)',
        a: num(L1), unit: 'L☉',
        steps: ['$L/L_\\odot = (R/R_\\odot)^2 (T/T_\\odot)^4$.', '$(' + tx(R1, 2) + ')^2 = ' + tx(R1 * R1, 3) + '$; $(' + tx(T1, 2) + '/5772)^4 = ' + tx(M.pow(T1 / 5772, 4), 3) + '$.', '$L = ' + tx(L1, 3) + '\\,L_\\odot$.'],
        hint: 'Square the radius ratio and raise the temperature ratio to the fourth power.' };
    } else if (kind === 'si') {
      var Rm = rnd(R, 2e8, 5e10, 2), Tk = sig(R.int(3000, 25000), 2), LW = 4 * M.PI * Rm * Rm * 5.67e-8 * M.pow(Tk, 4);
      d = { R: Rm, T: Tk, ans: LW };
      p = { q: 'A star has radius $' + tx(Rm, 2) + '$ m and surface temperature $' + tx(Tk, 2) + '$ K. Find its luminosity in watts. ($\\sigma = 5.67 \\times 10^{-8}$ W/(m²·K⁴).)',
        a: num(LW), unit: 'W',
        steps: ['$L = 4\\pi R^2 \\sigma T^4$.', 'Surface area: $4\\pi R^2 = ' + tx(4 * M.PI * Rm * Rm, 3) + '$ m². Flux: $\\sigma T^4 = ' + tx(5.67e-8 * M.pow(Tk, 4), 3) + '$ W/m².', '$L = ' + tx(LW, 3) + '$ W (about $' + tx(LW / 3.83e26, 2) + '\\,L_\\odot$).'],
        hint: 'Luminosity is surface area times the flux $\\sigma T^4$ from each square meter.' };
    } else if (kind === 'km') {
      var wd = R.coin(), Lw = wd ? rnd(R, 0.001, 0.05, 2) : rnd(R, 3e4, 3e5, 2), Tw = wd ? sig(R.int(9000, 30000), 2) : sig(R.int(3300, 4200), 2), Rw = M.sqrt(Lw) * M.pow(5772 / Tw, 2);
      var val = wd ? Rw * 6.96e5 : Rw * 6.96e8 / 1.496e11;
      d = { L: Lw, T: Tw, wd: wd, ans: val };
      p = { q: (wd ? 'A white dwarf' : 'A red supergiant') + ' has $L = ' + tx(Lw, 2) + '\\,L_\\odot$ and $T = ' + tx(Tw, 2) + '$ K. Find its radius in ' + (wd ? 'kilometers' : 'AU') + '. ($T_\\odot = 5772$ K, $R_\\odot = 6.96 \\times 10^{5}$ km, $1\\text{ AU} = 1.496 \\times 10^{8}$ km.)',
        a: num(val), unit: wd ? 'km' : 'AU',
        steps: ['$R/R_\\odot = \\sqrt{L/L_\\odot}\\,(T_\\odot/T)^2 = \\sqrt{' + tx(Lw, 2) + '} \\times (5772/' + tx(Tw, 2) + ')^2 = ' + tx(Rw, 3) + '$.',
          wd ? '$R = ' + tx(Rw, 3) + ' \\times 6.96 \\times 10^{5}\\text{ km} = ' + tx(val, 3) + '$ km, about the size of Earth.' : '$R = ' + tx(Rw, 3) + ' \\times 6.96 \\times 10^{5}\\text{ km} = ' + tx(Rw * 6.96e5, 3) + '$ km.'].concat(wd ? [] : ['In AU: $' + tx(Rw * 6.96e5, 3) + '/1.496 \\times 10^{8} = ' + tx(val, 3) + '$ AU. Placed at the Sun, it would swallow the inner planets out to about that distance.']),
        hint: 'Get $R/R_\\odot$ first, then convert.' };
    } else { // ratio of luminosities
      var fr = R.pick([0.5, 2, 3, 10, 100, 0.01]), ft = R.pick([0.5, 0.6, 1.5, 2, 0.8]), lr = fr * fr * M.pow(ft, 4);
      d = { fr: fr, ft: ft, ans: lr };
      p = { q: 'Star B has $' + tx(fr, 2) + '$ times the radius of star A and $' + td(ft, 1) + '$ times its surface temperature. What is $L_B/L_A$?',
        a: num(lr),
        steps: ['$L \\propto R^2 T^4$, so $L_B/L_A = (R_B/R_A)^2 (T_B/T_A)^4$.', '$(' + tx(fr, 2) + ')^2 = ' + tx(fr * fr, 3) + '$ and $(' + td(ft, 1) + ')^4 = ' + tx(M.pow(ft, 4), 3) + '$.', '$L_B/L_A = ' + tx(lr, 3) + '$.'],
        hint: 'Square the radius ratio; raise the temperature ratio to the fourth power.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.boltzmann-excitation', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['kT', 'hyd', 'hyd'], ['hyd', 'gen', 'concept'], ['solveT', 'factor', 'gen', 'n3']));
    var id = 'astrophys.boltzmann-excitation', p, d, k = 8.617e-5;
    if (kind === 'kT') {
      var T = sig(R.int(3000, 40000), 2), kT = k * T;
      d = { T: T, ans: kT };
      p = { q: 'What is the thermal energy scale $kT$, in electron volts, in a stellar atmosphere at $' + tx(T, 2) + '$ K? ($k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(kT), unit: 'eV',
        steps: ['$kT = 8.617 \\times 10^{-5}\\text{ eV/K} \\times ' + tx(T, 2) + '\\text{ K}$.', '$kT = ' + tx(kT, 3) + '$ eV, ' + (kT < 10.2 ? 'far below the $10.2$ eV needed to lift hydrogen from $n = 1$ to $n = 2$; only the tail of the energy distribution can do it.' : 'comparable to atomic energies.')],
        hint: 'Multiply Boltzmann\'s constant in eV/K by the temperature.' };
    } else if (kind === 'hyd') {
      var T2 = L === 1 ? R.pick([5800, 8000, 10000, 12000, 15000, 20000, 6000, 7000, 9000]) : sig(R.int(4500, 25000), 2), kT2 = k * T2, r = 4 * M.exp(-10.2 / kT2);
      d = { T: T2, ans: r };
      p = { q: 'In a hydrogen atmosphere at $' + tx(T2, 2) + '$ K, find the ratio of atoms in level $n = 2$ to atoms in $n = 1$, $N_2/N_1$. ($g_n = 2n^2$, $E_2 - E_1 = 10.2$ eV, $k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(r),
        steps: ['Boltzmann: $\\dfrac{N_2}{N_1} = \\dfrac{g_2}{g_1}e^{-\\Delta E/kT}$ with $g_2/g_1 = 8/2 = 4$.', '$kT = ' + tx(kT2, 3) + '$ eV, so $\\Delta E/kT = 10.2/' + tx(kT2, 3) + ' = ' + td(10.2 / kT2, 2) + '$.', '$N_2/N_1 = 4e^{-' + td(10.2 / kT2, 2) + '} = ' + tx(r, 3) + '$.'],
        hint: 'Find $\\Delta E/kT$ first; the statistical weights give a factor of 4.' };
    } else if (kind === 'gen') {
      var ga = R.pick([1, 2, 3]), gb = R.pick([3, 5, 6, 8, 4, 7]), dE = R.real(1.5, 4.5, 1), T3 = sig(R.int(3500, 12000), 2), kT3 = k * T3, r3 = gb / ga * M.exp(-dE / kT3);
      d = { ga: ga, gb: gb, dE: dE, T: T3, ans: r3 };
      p = { q: 'An atom has a lower level $a$ with $g_a = ' + ga + '$ and an upper level $b$ with $g_b = ' + gb + '$, $' + td(dE, 1) + '$ eV higher. At $' + tx(T3, 2) + '$ K, what is $N_b/N_a$? ($k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(r3),
        steps: ['$\\dfrac{N_b}{N_a} = \\dfrac{g_b}{g_a}e^{-\\Delta E/kT}$.', '$kT = ' + tx(kT3, 3) + '$ eV; $\\Delta E/kT = ' + td(dE / kT3, 3) + '$.', '$N_b/N_a = ' + td(gb / ga, 3) + ' \\times e^{-' + td(dE / kT3, 3) + '} = ' + tx(r3, 3) + '$.'],
        hint: 'Use the Boltzmann factor times the ratio of statistical weights.' };
    } else if (kind === 'solveT') {
      var target = R.pick([1e-6, 1e-5, 1e-4, 1e-3, 5e-5, 2e-4]), T4 = 10.2 / (k * M.log(4 / target));
      d = { r: target, ans: T4 };
      p = { q: 'At what temperature does hydrogen have $N_2/N_1 = ' + tx(target, 1) + '$? ($g_2/g_1 = 4$, $\\Delta E = 10.2$ eV, $k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(T4), unit: 'K',
        steps: ['$' + tx(target, 1) + ' = 4e^{-10.2/kT}$, so $e^{-10.2/kT} = ' + tx(target / 4, 3) + '$.', 'Take logs: $10.2/kT = \\ln(4/' + tx(target, 1) + ') = ' + td(M.log(4 / target), 3) + '$.', '$T = \\dfrac{10.2}{8.617 \\times 10^{-5} \\times ' + td(M.log(4 / target), 3) + '} = ' + tx(T4, 3) + '$ K.'],
        hint: 'Isolate the exponential, then take the natural log.' };
    } else if (kind === 'factor') {
      var Ta = R.pick([5000, 6000, 7000]), Tb = R.pick([9000, 10000, 12000]), f = M.exp(-10.2 / (k * Tb)) / M.exp(-10.2 / (k * Ta));
      d = { Ta: Ta, Tb: Tb, ans: f };
      p = { q: 'By what factor does hydrogen\'s $N_2/N_1$ grow when the temperature rises from $' + tx(Ta, 2) + '$ K to $' + tx(Tb, 2) + '$ K? ($\\Delta E = 10.2$ eV, $k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(f),
        steps: ['The weights cancel: factor $= e^{-\\Delta E/kT_2}/e^{-\\Delta E/kT_1} = \\exp\\!\\left[\\dfrac{\\Delta E}{k}\\left(\\dfrac{1}{T_1} - \\dfrac{1}{T_2}\\right)\\right]$.',
          '$\\dfrac{\\Delta E}{k} = \\dfrac{10.2}{8.617 \\times 10^{-5}} = ' + tx(10.2 / k, 4) + '$ K; times $(1/' + Ta + ' - 1/' + Tb + ')$ gives $' + td(10.2 / k * (1 / Ta - 1 / Tb), 2) + '$.',
          'Factor $= e^{' + td(10.2 / k * (1 / Ta - 1 / Tb), 2) + '} = ' + tx(f, 3) + '$: a modest change in temperature makes a huge change in excitation.'],
        hint: 'Divide the two Boltzmann factors; the exponents subtract.' };
    } else if (kind === 'n3') {
      var T5 = sig(R.int(6000, 15000), 2), kT5 = k * T5, r5 = 18 / 8 * M.exp(-1.89 / kT5);
      d = { T: T5, ans: r5 };
      p = { q: 'For hydrogen at $' + tx(T5, 2) + '$ K, find $N_3/N_2$. ($g_n = 2n^2$, $E_3 - E_2 = 1.89$ eV, $k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(r5),
        steps: ['$g_3/g_2 = 18/8 = 2.25$.', '$kT = ' + tx(kT5, 3) + '$ eV; $\\Delta E/kT = ' + td(1.89 / kT5, 3) + '$.', '$N_3/N_2 = 2.25\\,e^{-' + td(1.89 / kT5, 3) + '} = ' + tx(r5, 3) + '$.'],
        hint: 'Same Boltzmann formula, with the weights of $n = 3$ and $n = 2$.' };
    } else {
      var cq = R.pick([
        ['Balmer absorption lines are strongest in A stars (about 9,000 to 10,000 K), not in the hotter O and B stars. Why?', 'In hotter stars most hydrogen is ionized, so few atoms are left in level $n = 2$ to absorb Balmer lines.', ['O and B stars contain much less hydrogen than A stars.', 'Hotter stars emit no visible light, so no lines form.', 'Balmer lines come only from atoms in the ground state.']],
        ['Why are Balmer lines weak in the Sun\'s spectrum, even though the Sun is mostly hydrogen?', 'At 5,800 K almost all hydrogen atoms are in $n = 1$; very few are excited to $n = 2$, where Balmer absorption starts.', ['The Sun has too little hydrogen in its atmosphere.', 'All of the Sun\'s hydrogen is ionized.', 'Balmer lines are hidden by the Sun\'s magnetic field.']]]);
      d = { ans: 0 };
      p = { q: cq[0], a: mc(R, cq[1], cq[2]),
        steps: ['Balmer lines need hydrogen atoms in $n = 2$. The Boltzmann factor makes that population grow steeply with temperature.', 'But above about 10,000 K hydrogen starts to ionize, removing atoms altogether, so the $n = 2$ population (and the line strength) peaks near 9,000 to 10,000 K.'],
        hint: 'Two effects compete: excitation rises with temperature, and so does ionization.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.ionization-sequence', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['feature', 'class'], ['concept', 'class', 'feature'], ['saha', 'saha', 'concept']));
    var id = 'astrophys.ionization-sequence', p, d;
    var CL = [['O', 30000, 45000, 'lines of ionized helium (He II)'], ['B', 10000, 30000, 'neutral helium (He I) lines'], ['A', 7500, 10000, 'the strongest hydrogen Balmer lines'], ['F', 6000, 7500, 'weakening hydrogen lines and ionized calcium lines'], ['G', 5200, 6000, 'strong ionized calcium (Ca II) and many metal lines'], ['K', 3700, 5200, 'neutral metal lines'], ['M', 2400, 3700, 'molecular bands such as titanium oxide (TiO)']];
    if (kind === 'feature') {
      var i = R.int(0, 6), c = CL[i], others = CL.filter(function (x, j) { return j !== i; }).map(function (x) { return x[0]; });
      d = { ans: c[0] };
      p = { q: 'A star\'s spectrum is dominated by ' + c[3] + '. Which spectral class is it?',
        a: mc(R, c[0], R.sample(others, 3)),
        steps: ['Each class is a temperature range: O hottest, then B, A, F, G, K, M.', c[3].charAt(0).toUpperCase() + c[3].slice(1) + ' mark class ' + c[0] + ' (about ' + tx(c[1], 2) + ' to ' + tx(c[2], 2) + ' K).'],
        hint: 'Think about which atoms or ions survive, and are excited, at each temperature.' };
    } else if (kind === 'class') {
      var j = R.int(0, 6), cc = CL[j], T = sig(R.int(cc[1] + 200, cc[2] - 200), 2);
      if (T <= cc[1] || T >= cc[2]) T = sig((cc[1] + cc[2]) / 2, 2);
      d = { T: T, ans: cc[0] };
      p = { q: 'A main-sequence star has a surface temperature of about $' + tx(T, 2) + '$ K. Which spectral class does it belong to?',
        a: mc(R, cc[0], R.sample(CL.filter(function (x, m) { return m !== j; }).map(function (x) { return x[0]; }), 3)),
        steps: ['Approximate ranges: O above 30,000 K; B 10,000 to 30,000; A 7,500 to 10,000; F 6,000 to 7,500; G 5,200 to 6,000; K 3,700 to 5,200; M below 3,700 K.', '$' + tx(T, 2) + '$ K falls in class ' + cc[0] + ', whose spectra show ' + cc[3] + '.'],
        hint: 'The sequence O B A F G K M runs from hot to cool.' };
    } else if (kind === 'saha') {
      var T2 = R.pick([8000, 9000, 9500, 10000, 11000, 12000, 15000]), ne = R.pick([1e19, 1e20, 3e20, 1e21]), kT = 8.617e-5 * T2;
      var r = 2.415e21 * M.pow(T2, 1.5) * M.exp(-13.6 / kT) / ne, frac = r / (1 + r), askf = L === 3 && R.coin();
      d = { T: T2, ne: ne, askf: askf, ans: askf ? frac * 100 : r };
      p = { q: 'For hydrogen the Saha equation reads $\\dfrac{N_{\\text{II}}}{N_{\\text{I}}} = \\dfrac{C\\,T^{3/2}}{n_e}e^{-13.6\\text{ eV}/kT}$ with $C = 2.415 \\times 10^{21}$ m⁻³K⁻³ᐟ². In a layer at $' + tx(T2, 2) + '$ K with $n_e = ' + tx(ne, 1) + '$ m⁻³, find ' + (askf ? 'the percent of hydrogen that is ionized.' : 'the ratio $N_{\\text{II}}/N_{\\text{I}}$ of ionized to neutral hydrogen.') + ' ($k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: askf ? Object.assign(num(frac * 100), { pct: true }) : num(r),
        steps: ['$kT = ' + tx(kT, 3) + '$ eV, so $e^{-13.6/kT} = e^{-' + td(13.6 / kT, 3) + '} = ' + tx(M.exp(-13.6 / kT), 3) + '$.',
          '$C\\,T^{3/2} = 2.415 \\times 10^{21} \\times ' + tx(M.pow(T2, 1.5), 3) + ' = ' + tx(2.415e21 * M.pow(T2, 1.5), 3) + '$ m⁻³.',
          '$N_{\\text{II}}/N_{\\text{I}} = ' + tx(2.415e21 * M.pow(T2, 1.5), 3) + ' \\times ' + tx(M.exp(-13.6 / kT), 3) + '/' + tx(ne, 1) + ' = ' + tx(r, 3) + '$.'].concat(askf ? ['Ionized fraction: $\\dfrac{N_{\\text{II}}}{N_{\\text{I}} + N_{\\text{II}}} = \\dfrac{' + tx(r, 3) + '}{1 + ' + tx(r, 3) + '} = ' + tx(frac * 100, 3) + '\\%$.'] : []),
        hint: 'Work out the exponential and the $T^{3/2}$ factor separately, then combine.' };
    } else {
      var cs = R.pick([
        ['Why do the spectra of O, B, A, F, G, K and M stars look so different?', 'Mainly because of temperature, which sets which atoms are ionized and which levels are excited; most stars have similar compositions.', ['Because each class is made of different chemical elements.', 'Because the classes are stars of different ages.', 'Because hotter stars are farther away, so their light is shifted.']],
        ['An M star shows strong titanium oxide (TiO) bands, while the Sun barely shows any. What does this tell you?', 'The M star is cool enough for molecules like TiO to survive; it need not contain more titanium.', ['The M star contains far more titanium than the Sun.', 'The M star is hotter than the Sun.', 'The M star is younger than the Sun.']],
        ['Cecilia Payne\'s 1925 analysis of stellar spectra showed that', 'stars are made mostly of hydrogen and helium, and spectral differences come from temperature.', ['hot stars are made of helium and cool stars of metals.', 'the Sun has the same composition as Earth\'s crust.', 'spectral classes are a sequence of stellar ages.']]]);
      d = { ans: 0 };
      p = { q: cs[0], a: mc(R, cs[1], cs[2]),
        steps: ['Line strengths depend on how many atoms are in the right ionization stage and the right level, which the Boltzmann and Saha equations set by temperature (and, less strongly, density).', 'So the spectral sequence O B A F G K M is a temperature sequence; compositions are broadly alike: about 3/4 hydrogen and 1/4 helium by mass.'],
        hint: 'What changes most from an O star to an M star?' };
    }
    return chk(id, d, p, kind);
  });

  // =====================================================================================================
  // Unit 2. Binary Stars and Exoplanets
  // =====================================================================================================

  G('astrophys.visual-binaries', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['a', 'mass', 'mass'], ['full', 'ly', 'a'], ['split', 'full', 'split']));
    var id = 'astrophys.visual-binaries', p, d;
    var Mt = R.real(0.6, 5, 1), plx = sig(R.real(0.02, 0.4, 3), 2), dpc = 1 / plx, aAU = rnd(R, 6, 90, 2), alpha = sig(aAU * plx, 2);
    aAU = alpha / plx; var P = sig(M.sqrt(cube(aAU) / Mt), 3); Mt = cube(aAU) / (P * P);
    if (kind === 'a') {
      var useD = R.coin(), dd = sig(dpc, 2), a2 = useD ? alpha * dd : alpha / plx;
      d = { alpha: alpha, p: useD ? undefined : plx, dist: useD ? dd : undefined, ans: a2 };
      p = { q: 'The two stars of a visual binary are separated (along the semi-major axis of their relative orbit) by $' + tx(alpha, 2) + '\'\'$ on the sky. The system ' + (useD ? 'is $' + tx(dd, 2) + '$ pc away.' : 'has a parallax of $' + tx(plx, 2) + '\'\'$.') + ' What is the semi-major axis in AU?',
        a: num(a2), unit: 'AU',
        steps: [useD ? 'The distance is already in parsecs.' : 'Distance: $d = 1/p = 1/' + tx(plx, 2) + ' = ' + tx(1 / plx, 3) + '$ pc.',
          'A length of 1 AU seen from 1 pc spans $1\'\'$ (that is how the parsec is defined), so $a\\,(\\text{AU}) = \\alpha\\,(\'\') \\times d\\,(\\text{pc})$.',
          '$a = ' + tx(alpha, 2) + ' \\times ' + tx(useD ? dd : 1 / plx, 3) + ' = ' + tx(a2, 3) + '$ AU.'],
        hint: 'Arcseconds times parsecs gives AU.' };
    } else if (kind === 'mass') {
      var a3 = rnd(R, 3, 60, 2), P3 = sig(R.real(0.4, 3) * M.sqrt(cube(a3)) / 1.3, 2), M3 = cube(a3) / (P3 * P3);
      if (M3 < 0.3 || M3 > 12) { P3 = sig(M.sqrt(cube(a3) / R.real(0.6, 4, 1)), 2); M3 = cube(a3) / (P3 * P3); }
      d = { a: a3, P: P3, ans: M3 };
      p = { q: 'Two stars orbit each other with a relative orbit of semi-major axis $' + tx(a3, 2) + '$ AU and period $' + tx(P3, 2) + '$ years. What is their total mass?',
        a: num(M3), unit: 'M☉',
        steps: ['Kepler\'s third law in solar units: $M_1 + M_2 = a^3/P^2$ (AU, years, solar masses).', '$a^3 = ' + tx(cube(a3), 3) + '$ and $P^2 = ' + tx(P3 * P3, 3) + '$.', '$M_1 + M_2 = ' + tx(M3, 3) + '\\,M_\\odot$.'],
        hint: 'Use $M_1 + M_2 = a^3/P^2$ with a in AU and P in years.' };
    } else if (kind === 'full' || kind === 'ly') {
      var dly = sig(dpc * 3.26, 2), dpc2 = kind === 'ly' ? dly / 3.26 : 1 / plx, a4 = alpha * dpc2, M4 = cube(a4) / (P * P);
      d = { alpha: alpha, p: kind === 'ly' ? undefined : plx, dly: kind === 'ly' ? dly : undefined, P: P, ans: M4 };
      p = { q: 'A visual binary ' + (kind === 'ly' ? 'lies $' + tx(dly, 2) + '$ light-years away' : 'has parallax $' + tx(plx, 2) + '\'\'$') + '. Its relative orbit has angular semi-major axis $' + tx(alpha, 2) + '\'\'$ and period $' + tx(P, 3) + '$ years. Find the total mass.' + (kind === 'ly' ? ' ($1\\text{ pc} = 3.26$ ly.)' : ''),
        a: num(M4, { rtol: 0.03 }), unit: 'M☉',
        steps: [kind === 'ly' ? 'Distance in parsecs: $d = ' + tx(dly, 2) + '/3.26 = ' + tx(dpc2, 3) + '$ pc.' : 'Distance: $d = 1/' + tx(plx, 2) + ' = ' + tx(dpc2, 3) + '$ pc.',
          'Semi-major axis: $a = ' + tx(alpha, 2) + ' \\times ' + tx(dpc2, 3) + ' = ' + tx(a4, 3) + '$ AU.',
          '$M_1 + M_2 = a^3/P^2 = ' + tx(cube(a4), 3) + '/' + tx(P * P, 3) + ' = ' + tx(M4, 3) + '\\,M_\\odot$.'],
        hint: 'Convert the angle to AU first; only then use Kepler\'s third law.' };
    } else { // split
      var q = R.pick([1.5, 2, 2.5, 3, 4, 1.25]), alphaA = sig(alpha / (1 + q), 2), alphaB = sig(alpha - alphaA, 2), a5 = (alphaA + alphaB) / plx, M5 = cube(a5) / (P * P);
      var MA = M5 * alphaB / (alphaA + alphaB), MB = M5 - MA;
      d = { alphaA: alphaA, alphaB: alphaB, p: plx, P: P, ans: [MA, MB] };
      p = { q: 'In a visual binary with parallax $' + tx(plx, 2) + '\'\'$ and period $' + tx(P, 3) + '$ yr, star A moves on an ellipse of angular semi-major axis $' + tx(alphaA, 2) + '\'\'$ around the center of mass, and star B on one of $' + tx(alphaB, 2) + '\'\'$. Find both masses.',
        a: { t: 'multi', parts: [{ label: '$M_A =$', a: num(MA, { rtol: 0.03 }), unit: 'M☉' }, { label: '$M_B =$', a: num(MB, { rtol: 0.03 }), unit: 'M☉' }] },
        steps: ['The relative orbit is the sum: $\\alpha = ' + tx(alphaA, 2) + ' + ' + tx(alphaB, 2) + ' = ' + tx(alphaA + alphaB, 3) + '\'\'$, so $a = \\alpha/p = ' + tx(a5, 3) + '$ AU.',
          'Total mass: $a^3/P^2 = ' + tx(M5, 3) + '\\,M_\\odot$.',
          'Center of mass: $M_A a_A = M_B a_B$, so $M_A/M_B = \\alpha_B/\\alpha_A = ' + tx(alphaB / alphaA, 3) + '$.',
          '$M_A = ' + tx(M5, 3) + ' \\times \\dfrac{' + tx(alphaB, 2) + '}{' + tx(alphaA + alphaB, 3) + '} = ' + tx(MA, 3) + '\\,M_\\odot$ and $M_B = ' + tx(MB, 3) + '\\,M_\\odot$. The heavier star moves on the smaller ellipse.'],
        hint: 'Add the two angular sizes for the relative orbit; the center of mass splits the total.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.spectroscopic-binaries', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['ratio', 'dop', 'ratio'], ['sep', 'dop', 'ratio', 'mass'], ['mass', 'msini', 'sep']));
    var id = 'astrophys.spectroscopic-binaries', p, d;
    var v1 = R.int(2, 12) * 5, q = R.pick([1.2, 1.5, 2, 2.5, 3, 4]), v2 = sig(v1 * q, 2), Pd = rnd(R, 2, 60, 2);
    if (kind === 'ratio') {
      d = { v1: v1, v2: v2, ans: v2 / v1 };
      p = { q: 'In a double-lined spectroscopic binary, star A\'s radial velocity swings by $\\pm ' + v1 + '$ km/s and star B\'s by $\\pm ' + tx(v2, 2) + '$ km/s. What is the mass ratio $M_A/M_B$?',
        a: num(v2 / v1),
        steps: ['Both stars circle the center of mass with the same period, and $M_A a_A = M_B a_B$.', 'Their speeds are proportional to their orbit sizes, so $M_A v_A = M_B v_B$ and $M_A/M_B = v_B/v_A$.', '$M_A/M_B = ' + tx(v2, 2) + '/' + v1 + ' = ' + tx(v2 / v1, 3) + '$: the slower star A is the heavier one.'],
        hint: 'The heavier star moves on the smaller orbit, so it moves more slowly.' };
    } else if (kind === 'dop') {
      var lam0 = R.pick([[656.28, 'H\\alpha'], [486.13, 'H\\beta'], [589.00, 'sodium D']]), dl = sig(R.real(0.02, 0.3, 3), 2), v = 3.00e5 * dl / lam0[0];
      d = { lam: lam0[0], dl: dl, ans: v };
      p = { q: 'The $' + lam0[1].replace('sodium D', '\\text{Na D}') + '$ line (rest wavelength $' + td(lam0[0], 2) + '$ nm) in one star of a binary shifts back and forth by up to $' + tx(dl, 2) + '$ nm. What is the star\'s radial-velocity amplitude? ($c = 3.00 \\times 10^{5}$ km/s.)',
        a: num(v), unit: 'km/s',
        steps: ['For speeds much less than $c$: $v_r = c\\,\\Delta\\lambda/\\lambda_0$.', '$v_r = 3.00 \\times 10^{5}\\text{ km/s} \\times ' + tx(dl, 2) + '/' + td(lam0[0], 2) + '$.', '$v_r = ' + tx(v, 3) + '$ km/s.'],
        hint: 'The fractional shift $\\Delta\\lambda/\\lambda$ equals $v/c$.' };
    } else if (kind === 'sep') {
      var vs = v1 + v2, a = vs * 1e3 * Pd * 86400 / (2 * M.PI), aAU = a / 1.496e11;
      d = { v1: v1, v2: v2, P: Pd, ans: aAU };
      p = { q: 'An eclipsing binary (so we see the orbit edge-on) has circular orbits with speeds $' + v1 + '$ km/s and $' + tx(v2, 2) + '$ km/s and period $' + tx(Pd, 2) + '$ days. What is the separation of the two stars, in AU? ($1\\text{ AU} = 1.496 \\times 10^{11}$ m.)',
        a: num(aAU), unit: 'AU',
        steps: ['Each star covers its circle once per period: $a_1 = v_1P/(2\\pi)$, $a_2 = v_2P/(2\\pi)$, so $a = a_1 + a_2 = (v_1 + v_2)P/(2\\pi)$.', '$P = ' + tx(Pd, 2) + ' \\times 86{,}400\\text{ s} = ' + tx(Pd * 86400, 3) + '$ s; $v_1 + v_2 = ' + tx(vs * 1e3, 3) + '$ m/s.', '$a = ' + tx(a, 3) + '$ m $= ' + tx(aAU, 3) + '$ AU.'],
        hint: 'Circumference over period is the speed, for each star.' };
    } else { // mass or msini
      var vs2 = v1 + v2, Pd2 = Pd, Ps = Pd2 * 86400, Mt = cube(vs2 * 1e3) * Ps / (2 * M.PI * 6.67e-11), MtS = Mt / 1.99e30, M1 = MtS * v2 / vs2, M2 = MtS * v1 / vs2, mini = kind === 'msini';
      if (mini) {
        d = { v1: v1, v2: v2, P: Pd2, ans: MtS };
        p = { q: 'A double-lined spectroscopic binary has radial-velocity amplitudes $' + v1 + '$ and $' + tx(v2, 2) + '$ km/s and period $' + tx(Pd2, 2) + '$ days; no eclipses are seen, so the tilt $i$ is unknown. What is the smallest the total mass can be? ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
          a: num(MtS, { rtol: 0.03 }), unit: 'M☉',
          steps: ['The measured speeds are $v\\sin i$, so the formula gives $(M_1 + M_2)\\sin^3 i = \\dfrac{(v_1 + v_2)^3P}{2\\pi G}$.', '$(v_1 + v_2)^3 = (' + tx(vs2 * 1e3, 3) + ')^3$ m³/s³ and $P = ' + tx(Ps, 3) + '$ s, giving $' + tx(Mt, 3) + '$ kg.', 'Since $\\sin i \\le 1$, the total mass is at least $' + tx(MtS, 3) + '\\,M_\\odot$ (the value for an edge-on orbit).'],
          hint: 'Radial velocities measure only $v\\sin i$; an edge-on orbit gives the smallest mass.' };
      } else {
        d = { v1: v1, v2: v2, P: Pd2, ans: [M1, M2] };
        p = { q: 'An eclipsing, double-lined binary (orbit edge-on, circular) has radial-velocity amplitudes $v_1 = ' + v1 + '$ km/s and $v_2 = ' + tx(v2, 2) + '$ km/s and period $' + tx(Pd2, 2) + '$ days. Find both masses. ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
          a: { t: 'multi', parts: [{ label: '$M_1 =$', a: num(M1, { rtol: 0.03 }), unit: 'M☉' }, { label: '$M_2 =$', a: num(M2, { rtol: 0.03 }), unit: 'M☉' }] },
          steps: ['Separation $a = (v_1 + v_2)P/(2\\pi)$; Kepler: $M_1 + M_2 = 4\\pi^2a^3/(GP^2) = \\dfrac{(v_1 + v_2)^3P}{2\\pi G}$.', 'With $v_1 + v_2 = ' + tx(vs2 * 1e3, 3) + '$ m/s and $P = ' + tx(Ps, 3) + '$ s: $M_1 + M_2 = ' + tx(Mt, 3) + '$ kg $= ' + tx(MtS, 3) + '\\,M_\\odot$.', 'Split by $M_1/M_2 = v_2/v_1 = ' + tx(v2 / v1, 3) + '$: $M_1 = ' + tx(MtS, 3) + ' \\times ' + tx(v2, 2) + '/' + tx(vs2, 3) + ' = ' + tx(M1, 3) + '\\,M_\\odot$, $M_2 = ' + tx(M2, 3) + '\\,M_\\odot$.'],
          hint: 'First the total mass from Kepler\'s third law, then split it with the speed ratio.' };
      }
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.eclipsing-binaries', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['small', 'which', 'small', 'lc'], ['large', 'tratio', 'which', 'lc'], ['depth', 'tratio', 'large', 'lc']));
    var id = 'astrophys.eclipsing-binaries', p, d;
    var v = R.int(10, 50) * 10, tab = R.real(0.5, 4, 1), tac = +(tab * R.real(2.5, 10)).toFixed(1);
    if (kind === 'small' || kind === 'large') {
      var dt = kind === 'small' ? tab : tac, Rkm = v * dt * 3600 / 2, Rs = Rkm / 6.96e5;
      d = { v: v, tab: tab, tac: kind === 'large' ? tac : undefined, ans: Rs };
      p = { q: 'In an edge-on eclipsing binary the stars move relative to each other at $' + v + '$ km/s. When the small star passes behind the large one, ' + (kind === 'small' ? 'it takes $' + td(tab, 1) + '$ h from first contact until it is completely hidden. What is the radius of the <b>small</b> star in solar radii?' : 'it takes $' + td(tab, 1) + '$ h from first contact until it is completely hidden, and $' + td(tac, 1) + '$ h from first contact until it starts to reappear. What is the radius of the <b>large</b> star in solar radii?') + ' ($R_\\odot = 6.96 \\times 10^{5}$ km.)',
        a: num(Rs), unit: 'R☉',
        steps: kind === 'small' ? ['From first contact to full eclipse, the small star moves its own diameter: $2R_s = v(t_b - t_a)$.', '$R_s = \\tfrac12 \\times ' + v + '\\text{ km/s} \\times ' + tx(tab * 3600, 3) + '\\text{ s} = ' + tx(Rkm, 3) + '$ km.', '$R_s = ' + tx(Rkm, 3) + '/6.96 \\times 10^{5} = ' + tx(Rs, 3) + '\\,R_\\odot$.']
          : ['From first contact until the small star\'s leading edge reaches the far side, it moves the large star\'s diameter: $2R_\\ell = v(t_c - t_a)$.', '$R_\\ell = \\tfrac12 \\times ' + v + '\\text{ km/s} \\times ' + tx(tac * 3600, 3) + '\\text{ s} = ' + tx(Rkm, 3) + '$ km.', '$R_\\ell = ' + tx(Rs, 3) + '\\,R_\\odot$. (The $' + td(tab, 1) + '$ h is not needed here; it gives the small star\'s size.)'],
        hint: 'Distance = speed × time; ask which length the star moves during that interval.' };
    } else if (kind === 'which') {
      var Th = sig(R.int(9000, 25000), 2), Tc = sig(R.int(3500, 6000), 2), hotSmall = R.coin();
      var ans = hotSmall ? 'When the small hot star passes behind the large cool star' : 'When the small cool star passes in front of the large hot star';
      var wr = hotSmall ? ['When the small hot star passes in front of the large cool star', 'Both eclipses are equally deep, because the same area is covered', 'When the bigger star is behind, since more of it is hidden'] : ['When the small cool star passes behind the large hot star', 'Both eclipses are equally deep, because the same area is covered', 'When the bigger star is in front, since it hides more light'];
      d = { ans: ans, hotSmall: hotSmall, Th: Th, Tc: Tc };
      p = { q: 'An edge-on binary has a ' + (hotSmall ? 'small hot star ($' + tx(Th, 2) + '$ K) and a large cool star ($' + tx(Tc, 2) + '$ K)' : 'small cool star ($' + tx(Tc, 2) + '$ K) and a large hot star ($' + tx(Th, 2) + '$ K)') + '. Each eclipse is total or annular. When does the deeper (primary) eclipse happen?',
        a: mc(R, ans, wr),
        steps: ['In either eclipse the area hidden is the small star\'s disk, $\\pi R_s^2$.', 'What changes is whose surface is hidden: each square meter shines in proportion to $T^4$.', 'The eclipse that hides the hotter surface removes more light: ' + (hotSmall ? 'the small hot star going behind the large one.' : 'the small cool star covering part of the hot large one.')],
        hint: 'The covered area is the same in both eclipses. What differs?' };
    } else if (kind === 'tratio') {
      var dp = sig(R.real(0.2, 0.7), 2), ratio = R.pick([2, 3, 4, 5, 8, 10, 16]), ds = sig(dp / ratio, 2), tr = M.pow(dp / ds, 0.25);
      d = { dp: dp, ds: ds, ans: tr };
      p = { q: 'An eclipsing binary has total and annular eclipses. The primary eclipse removes $' + Math.round(dp * 100) + '\\%$ of the light and the secondary removes $' + tx(ds * 100, 2) + '\\%$. What is the ratio of the two stars\' surface temperatures, $T_{\\text{hot}}/T_{\\text{cool}}$?',
        a: num(tr),
        steps: ['Both eclipses hide the same area (the small star\'s disk), so the depths are in the ratio of surface brightness: $\\dfrac{\\text{primary depth}}{\\text{secondary depth}} = \\dfrac{T_{\\text{hot}}^4}{T_{\\text{cool}}^4}$.', 'Depth ratio: $' + tx(dp * 100, 2) + '/' + tx(ds * 100, 2) + ' = ' + tx(dp / ds, 3) + '$.', '$T_{\\text{hot}}/T_{\\text{cool}} = (' + tx(dp / ds, 3) + ')^{1/4} = ' + tx(tr, 3) + '$.'],
        hint: 'Surface brightness goes as $T^4$; take a fourth root.' };
    } else if (kind === 'lc') {
      var Rb = R.real(1.5, 4, 1), Rsm2 = sig(Rb * R.real(0.25, 0.6, 2), 2), Tb = sig(R.int(3500, 12000), 2), Tsm2;
      do { Tsm2 = sig(R.int(3500, 20000), 2); } while (M.abs(Tsm2 - Tb) / M.min(Tsm2, Tb) < 0.4);
      var hotIsSmall = Tsm2 > Tb, letters = R.coin() ? ['A', 'B'] : ['B', 'A'], askBehind = R.coin();
      // the deeper (primary) eclipse hides the hotter surface; the visual tags it with letters[0]
      // askBehind: the dip when the small star is hidden behind the large one (hides the small star's surface)
      var askedIsDeeper = askBehind === hotIsSmall, ansL = askedIsDeeper ? letters[0] : letters[1];
      d = { Rb: Rb, Rs: Rsm2, Tb: Tb, Ts: Tsm2, prim: letters[0], behind: askBehind, ans: ansL };
      p = { q: 'The light curve below belongs to an edge-on binary: a large star at $' + tx(Tb, 2) + '$ K and a smaller one at $' + tx(Tsm2, 2) + '$ K. Which dip, A or B, happens when the small star ' + (askBehind ? 'is hidden behind the large star' : 'passes in front of the large star') + '?',
        a: mc(R, 'Dip ' + ansL, ['Dip ' + (ansL === 'A' ? 'B' : 'A'), 'Neither: both dips cover the same area, so they are equally deep', 'It cannot be told without the stars\' sizes']),
        viz: { name: 'astrophys-eclipse', opts: { R1: Rb, R2: Rsm2, T1: Tb, T2: Tsm2, phase: 0.25, sep: 3, names: ['large star', 'small star'], interactive: false, quiet: true, tags: { primary: letters[0], secondary: letters[1] } } },
        steps: ['In both eclipses the covered area is the small star\'s disk; each square meter shines in proportion to $T^4$.', askBehind ? 'With the small star behind, its own surface (at $' + tx(Tsm2, 2) + '$ K) is hidden.' : 'With the small star in front, it hides a patch of the large star\'s surface (at $' + tx(Tb, 2) + '$ K).', 'That is the ' + (askedIsDeeper ? 'hotter' : 'cooler') + ' surface, so this is the ' + (askedIsDeeper ? 'deeper' : 'shallower') + ' dip: ' + ansL + '.'],
        hint: 'Which surface is hidden in each eclipse, and which surface is brighter per square meter?' };
    } else { // depth
      var Rl = R.real(2, 6, 1), Rsm = R.real(0.5, 1.5, 1), Tl = sig(R.int(4000, 6000), 2), Tsm = sig(R.int(7000, 15000), 2), behind = R.coin();
      var Fl = Rl * Rl * M.pow(Tl / 1000, 4), Fs = Rsm * Rsm * M.pow(Tsm / 1000, 4), lost = behind ? Fs : Rsm * Rsm * M.pow(Tl / 1000, 4), dep = 100 * lost / (Fl + Fs);
      d = { Rl: Rl, Rs: Rsm, Tl: Tl, Ts: Tsm, behind: behind, ans: dep };
      p = { q: 'A binary has a large star ($R = ' + td(Rl, 1) + '\\,R_\\odot$, $T = ' + tx(Tl, 2) + '$ K) and a small star ($R = ' + td(Rsm, 1) + '\\,R_\\odot$, $T = ' + tx(Tsm, 2) + '$ K), seen edge-on. Treating the disks as uniformly bright, what percent of the total light is lost when the small star ' + (behind ? 'is completely hidden behind the large one?' : 'passes completely in front of the large one?'),
        a: Object.assign(num(dep), { pct: true }),
        steps: ['Each star\'s light $\\propto R^2T^4$. Using $T$ in thousands of K: large $' + td(Rl, 1) + '^2 \\times ' + td(Tl / 1000, 1) + '^4 = ' + tx(Fl, 3) + '$; small $' + td(Rsm, 1) + '^2 \\times ' + td(Tsm / 1000, 1) + '^4 = ' + tx(Fs, 3) + '$.',
          behind ? 'Hidden: the whole small star, $' + tx(Fs, 3) + '$.' : 'Hidden: a disk of the large star\'s surface the size of the small star, $' + td(Rsm, 1) + '^2 \\times ' + td(Tl / 1000, 1) + '^4 = ' + tx(lost, 3) + '$.',
          'Fraction lost: $' + tx(lost, 3) + '/' + tx(Fl + Fs, 3) + ' = ' + tx(dep, 3) + '\\%$.'],
        hint: 'Total light is the sum of $R^2T^4$ for both stars; work out which surface gets covered.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.exoplanet-transits', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['depth', 'radius', 'depth'], ['radius', 'orbit', 'depth'], ['duration', 'orbit', 'radius']));
    var id = 'astrophys.exoplanet-transits', p, d;
    if (kind === 'depth') {
      var jup = R.coin(), Rp = jup ? R.real(0.6, 1.8, 1) : R.real(0.8, 4, 1), Rst = R.real(0.5, 1.6, 1), ratio = jup ? Rp / (Rst * 9.73) : Rp / (Rst * 109), dep = ratio * ratio * 100;
      d = { Rp: Rp, Rs: Rst, jup: jup, ans: dep };
      p = { q: 'A planet of radius $' + td(Rp, 1) + '\\,R_' + (jup ? '\\text{J}' : '\\oplus') + '$ transits a star of radius $' + td(Rst, 1) + '\\,R_\\odot$. By what percent does the star dim during the transit? ($R_\\odot = ' + (jup ? '9.73\\,R_\\text{J}' : '109\\,R_\\oplus') + '$.)',
        a: Object.assign(num(dep), { pct: true }),
        steps: ['Star radius in planet units: $' + td(Rst, 1) + ' \\times ' + (jup ? '9.73' : '109') + ' = ' + tx(Rst * (jup ? 9.73 : 109), 3) + '$.', 'Radius ratio: $R_p/R_\\star = ' + tx(ratio, 3) + '$.', 'Depth $= (R_p/R_\\star)^2 = ' + tx(ratio * ratio, 3) + ' = ' + tx(dep, 3) + '\\%$.'],
        hint: 'The planet blocks its disk area out of the star\'s disk area.' };
    } else if (kind === 'radius') {
      var ppm = R.pick([80, 100, 150, 200, 400, 800, 1500, 5000, 10000, 15000]), Rs2 = R.real(0.4, 1.5, 1), r = M.sqrt(ppm * 1e-6), RpE = r * Rs2 * 109;
      d = { ppm: ppm, Rs: Rs2, ans: RpE };
      p = { q: 'A transit survey sees a star of radius $' + td(Rs2, 1) + '\\,R_\\odot$ dim by $' + tx(ppm, 2) + '$ parts per million every time a planet crosses it. What is the planet\'s radius in Earth radii? ($R_\\odot = 109\\,R_\\oplus$.)',
        a: num(RpE), unit: 'R⊕',
        steps: ['Depth $= ' + tx(ppm * 1e-6, 2) + ' = (R_p/R_\\star)^2$, so $R_p/R_\\star = \\sqrt{' + tx(ppm * 1e-6, 2) + '} = ' + tx(r, 3) + '$.', '$R_\\star = ' + td(Rs2, 1) + ' \\times 109 = ' + tx(Rs2 * 109, 3) + '\\,R_\\oplus$.', '$R_p = ' + tx(r, 3) + ' \\times ' + tx(Rs2 * 109, 3) + ' = ' + tx(RpE, 3) + '\\,R_\\oplus$.'],
        hint: 'Take the square root of the depth (as a fraction) first.' };
    } else if (kind === 'orbit') {
      var Pd = rnd(R, 1, 400, 2), Ms = R.real(0.3, 1.5, 1), Py = Pd / 365.25, a = M.pow(Ms * Py * Py, 1 / 3);
      d = { P: Pd, M: Ms, ans: a };
      p = { q: 'A transiting planet repeats every $' + tx(Pd, 2) + '$ days around a star of $' + td(Ms, 1) + '\\,M_\\odot$. What is the radius of its (circular) orbit in AU?',
        a: num(a), unit: 'AU',
        steps: ['Kepler\'s third law with $m_p \\ll M_\\star$: $a^3 = M_\\star P^2$ (AU, years, solar masses).', '$P = ' + tx(Pd, 2) + '/365.25 = ' + tx(Py, 3) + '$ yr, so $a^3 = ' + td(Ms, 1) + ' \\times ' + tx(Py * Py, 3) + ' = ' + tx(Ms * Py * Py, 3) + '$.', '$a = ' + tx(a, 3) + '$ AU.'],
        hint: 'Convert the period to years, then use $a^3 = MP^2$.' };
    } else { // duration
      var Pd3 = R.pick([2, 3, 4, 5, 8, 10, 12, 20]) * R.pick([1, 1.5]), Ms3 = R.real(0.6, 1.3, 1), Rs3 = R.real(0.6, 1.5, 1), a3 = M.pow(Ms3 * M.pow(Pd3 / 365.25, 2), 1 / 3), aR = a3 * 215, tdur = Pd3 * 24 * Rs3 / (M.PI * aR);
      d = { P: Pd3, M: Ms3, Rs: Rs3, ans: tdur };
      p = { q: 'A planet transits across the middle of a star ($M = ' + td(Ms3, 1) + '\\,M_\\odot$, $R = ' + td(Rs3, 1) + '\\,R_\\odot$) every $' + tx(Pd3, 2) + '$ days. Estimate how long each transit lasts, in hours. ($1\\text{ AU} = 215\\,R_\\odot$; treat the planet as small.)',
        a: num(tdur, { rtol: 0.03 }), unit: 'h',
        steps: ['Orbit: $a = (M P^2)^{1/3} = (' + td(Ms3, 1) + ' \\times (' + tx(Pd3, 2) + '/365.25)^2)^{1/3} = ' + tx(a3, 3) + '$ AU $= ' + tx(aR, 3) + '\\,R_\\odot$.',
          'During the transit the planet covers the star\'s diameter $2R_\\star$ at speed $2\\pi a/P$, so $t \\approx \\dfrac{2R_\\star}{2\\pi a/P} = \\dfrac{P R_\\star}{\\pi a}$.',
          '$t \\approx ' + tx(Pd3 * 24, 3) + '\\text{ h} \\times ' + td(Rs3, 1) + '/(\\pi \\times ' + tx(aR, 3) + ') = ' + tx(tdur, 3) + '$ h.'],
        hint: 'Time to cross = the star\'s diameter divided by the orbital speed.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.exoplanet-wobble', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['speed', 'speed', 'concept'], ['msini', 'vp', 'speed'], ['msini', 'true', 'msini']));
    var id = 'astrophys.exoplanet-wobble', p, d;
    if (kind === 'speed') {
      var jup = R.coin(), mp = jup ? R.real(0.3, 5, 1) : R.int(1, 20), vp = R.real(jup ? 8 : 20, jup ? 60 : 50, 1), Ms = R.real(0.5, 1.5, 1);
      var mkg = mp * (jup ? 1.90e27 : 5.97e24), vs = mkg * vp * 1e3 / (Ms * 1.99e30);
      d = { mp: mp, vp: vp, M: Ms, jup: jup, ans: vs };
      p = { q: 'A planet of $' + tx(mp, 2) + '$ ' + (jup ? 'Jupiter masses ($M_\\text{J} = 1.90 \\times 10^{27}$ kg)' : 'Earth masses ($M_\\oplus = 5.97 \\times 10^{24}$ kg)') + ' orbits a $' + td(Ms, 1) + '\\,M_\\odot$ star at $' + td(vp, 1) + '$ km/s. How fast does the star move around the center of mass, in m/s? ($M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(vs, { rtol: 0.03 }), unit: 'm/s',
        steps: ['Momentum about the center of mass balances: $M_\\star v_\\star = m_p v_p$.', '$m_p = ' + tx(mkg, 3) + '$ kg and $M_\\star = ' + tx(Ms * 1.99e30, 3) + '$ kg.', '$v_\\star = \\dfrac{' + tx(mkg, 3) + ' \\times ' + tx(vp * 1e3, 3) + '}{' + tx(Ms * 1.99e30, 3) + '} = ' + tx(vs, 3) + '$ m/s.'],
        hint: 'The star and planet carry equal and opposite momentum around their center of mass.' };
    } else if (kind === 'vp') {
      var Pd = rnd(R, 3, 1000, 2), Ms2 = R.real(0.5, 1.5, 1), Py = Pd / 365.25, a = M.pow(Ms2 * Py * Py, 1 / 3), v = 2 * M.PI * a * 1.496e8 / (Pd * 86400);
      d = { P: Pd, M: Ms2, ans: v };
      p = { q: 'A planet orbits a $' + td(Ms2, 1) + '\\,M_\\odot$ star every $' + tx(Pd, 2) + '$ days on a circular orbit. What is its orbital speed in km/s? ($1\\text{ AU} = 1.496 \\times 10^{8}$ km.)',
        a: num(v), unit: 'km/s',
        steps: ['Kepler: $a = (M P^2)^{1/3}$ with $P = ' + tx(Py, 3) + '$ yr, so $a = ' + tx(a, 3) + '$ AU $= ' + tx(a * 1.496e8, 3) + '$ km.', '$v = 2\\pi a/P = 2\\pi \\times ' + tx(a * 1.496e8, 3) + '\\text{ km}/' + tx(Pd * 86400, 3) + '\\text{ s}$.', '$v = ' + tx(v, 3) + '$ km/s.'],
        hint: 'Find the orbit\'s size first, then divide its circumference by the period.' };
    } else if (kind === 'msini' || kind === 'true') {
      var K = R.int(5, 120), Pd2 = rnd(R, 2, 800, 2), Ms3 = R.real(0.6, 1.4, 2), Ps = Pd2 * 86400, mkg2 = K * M.pow(Ms3 * 1.99e30, 2 / 3) * M.pow(Ps / (2 * M.PI * 6.67e-11), 1 / 3), mJ = mkg2 / 1.90e27;
      if (kind === 'msini') {
        d = { K: K, P: Pd2, M: Ms3, ans: mJ };
        p = { q: 'A star of $' + td(Ms3, 2) + '\\,M_\\odot$ shows a radial-velocity wobble of amplitude $K = ' + K + '$ m/s with period $' + tx(Pd2, 2) + '$ days. Find the planet\'s minimum mass, $m\\sin i$, in Jupiter masses. ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $M_\\text{J} = 1.90 \\times 10^{27}$ kg.)',
          a: num(mJ, { rtol: 0.03 }), unit: 'Jupiter masses',
          steps: ['For a light planet on a circular orbit, $m\\sin i = K\\,M_\\star^{2/3}\\left(\\dfrac{P}{2\\pi G}\\right)^{1/3}$.', '$M_\\star^{2/3} = (' + tx(Ms3 * 1.99e30, 3) + ')^{2/3} = ' + tx(M.pow(Ms3 * 1.99e30, 2 / 3), 3) + '$; $(P/2\\pi G)^{1/3} = (' + tx(Ps, 3) + '/' + tx(2 * M.PI * 6.67e-11, 3) + ')^{1/3} = ' + tx(M.pow(Ps / (2 * M.PI * 6.67e-11), 1 / 3), 3) + '$.',
            '$m\\sin i = ' + K + ' \\times ' + tx(M.pow(Ms3 * 1.99e30, 2 / 3), 3) + ' \\times ' + tx(M.pow(Ps / (2 * M.PI * 6.67e-11), 1 / 3), 3) + ' = ' + tx(mkg2, 3) + '$ kg $= ' + tx(mJ, 3) + '\\,M_\\text{J}$.'],
          hint: 'Combine momentum balance with Kepler\'s third law: $m\\sin i = K M_\\star^{2/3}(P/2\\pi G)^{1/3}$.' };
      } else {
        var msin = sig(mJ, 2), inc = R.pick([30, 45, 60, 20, 87, 75]), mt = msin / M.sin(inc * M.PI / 180);
        d = { msin: msin, i: inc, ans: mt };
        p = { q: 'Radial velocities give a planet $m\\sin i = ' + tx(msin, 2) + '\\,M_\\text{J}$. ' + (inc > 80 ? 'The planet also transits, and the transit shape gives $i = ' + inc + '^\\circ$.' : 'Precise measurements of the star\'s position on the sky (astrometry) show the orbit is tilted at $i = ' + inc + '^\\circ$ from face-on.') + ' What is the planet\'s true mass?',
          a: num(mt), unit: 'Jupiter masses',
          steps: ['The Doppler method measures only the velocity component along our line of sight, $K = v_\\star\\sin i$, so it yields $m\\sin i$.', '$m = \\dfrac{m\\sin i}{\\sin i} = \\dfrac{' + tx(msin, 2) + '}{\\sin ' + inc + '^\\circ} = \\dfrac{' + tx(msin, 2) + '}{' + td(M.sin(inc * M.PI / 180), 3) + '}$.', '$m = ' + tx(mt, 3) + '\\,M_\\text{J}$' + (inc > 80 ? ', almost the same: a transiting orbit is nearly edge-on.' : ', larger than the minimum.')],
          hint: 'Divide by $\\sin i$.' };
      }
    } else {
      var c = R.pick([
        ['The radial-velocity method gives a planet\'s $m\\sin i$. What does that tell you about its true mass $m$?', 'The true mass is at least $m\\sin i$; it is larger unless the orbit is edge-on.', ['The true mass is at most $m\\sin i$.', 'The true mass equals $m\\sin i$ for every orbit.', 'The true mass cannot be estimated at all.']],
        ['Why does a star wobble when a planet orbits it?', 'Star and planet both orbit their common center of mass, so the star moves in a small, slow orbit of its own.', ['The planet\'s gravity pulls the star\'s gas into a bulge that rotates.', 'The planet blocks some of the star\'s light, which shifts its lines.', 'Only the planet moves; the star\'s lines shift because of the planet\'s light.']],
        ['Two planets of equal mass orbit identical stars, one at 0.05 AU and one at 5 AU. Which star shows the larger radial-velocity wobble?', 'The star with the planet at 0.05 AU: a close planet moves faster, so its star does too.', ['The star with the planet at 5 AU, because a longer lever arm moves the star more.', 'Both wobble equally, because the masses are equal.', 'Neither; only planets heavier than Jupiter cause a wobble.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['Star and planet orbit their center of mass with equal and opposite momenta: $M_\\star v_\\star = m_p v_p$.', 'We measure only the line-of-sight part of the star\'s velocity, $K = v_\\star\\sin i$, so the method gives $m\\sin i$, a lower limit on the mass. A closer planet orbits faster ($v_p \\propto a^{-1/2}$), so its star\'s wobble is larger.'],
        hint: 'Think about the center of mass and about which part of the motion a Doppler shift can see.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.planet-temperature', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['solar', 'solar', 'hz'], ['stellar', 'dist', 'solar'], ['stellar', 'albedo', 'dist']));
    var id = 'astrophys.planet-temperature', p, d;
    if (kind === 'solar') {
      var Ls = rnd(R, 0.01, 50, 2), dd = rnd(R, 0.05, 10, 2), A = R.pick([0, 0.1, 0.3, 0.3, 0.5, 0.75]), T = 278 * M.pow((1 - A) * Ls, 0.25) / M.sqrt(dd);
      d = { L: Ls, d: dd, A: A, ans: T };
      p = { q: 'A fast-spinning planet with albedo $' + td(A, 2) + '$ orbits $' + tx(dd, 2) + '$ AU from a star of $' + tx(Ls, 2) + '\\,L_\\odot$. Find its equilibrium temperature, using $T = 278\\text{ K} \\times \\left[(1 - A)\\,L/L_\\odot\\right]^{1/4}(d/1\\text{ AU})^{-1/2}$.',
        a: num(T), unit: 'K',
        steps: ['$(1 - A)L/L_\\odot = ' + td(1 - A, 2) + ' \\times ' + tx(Ls, 2) + ' = ' + tx((1 - A) * Ls, 3) + '$; its fourth root is $' + tx(M.pow((1 - A) * Ls, 0.25), 3) + '$.', '$(d/1\\text{ AU})^{-1/2} = 1/\\sqrt{' + tx(dd, 2) + '} = ' + tx(1 / M.sqrt(dd), 3) + '$.', '$T = 278 \\times ' + tx(M.pow((1 - A) * Ls, 0.25), 3) + ' \\times ' + tx(1 / M.sqrt(dd), 3) + ' = ' + tx(T, 3) + '$ K.'],
        hint: 'Absorbed sunlight balances emitted heat; the 278 K is that balance for a black body at 1 AU from the Sun.' };
    } else if (kind === 'stellar') {
      var Ts = sig(R.int(3000, 9000), 2), Rs = R.real(0.2, 2.5, 1), d2 = rnd(R, 0.02, 5, 2), A2 = R.pick([0, 0.2, 0.3, 0.4, 0.6]);
      var T2 = Ts * M.pow(1 - A2, 0.25) * M.sqrt(Rs * 6.96e8 / (2 * d2 * 1.496e11));
      d = { Ts: Ts, Rs: Rs, d: d2, A: A2, ans: T2 };
      p = { q: 'A planet with albedo $' + td(A2, 1) + '$ orbits $' + tx(d2, 2) + '$ AU from a star with $T_\\star = ' + tx(Ts, 2) + '$ K and $R_\\star = ' + td(Rs, 1) + '\\,R_\\odot$. Assuming it spins fast enough to have one temperature all over, find its equilibrium temperature. ($R_\\odot = 6.96 \\times 10^{8}$ m, $1\\text{ AU} = 1.496 \\times 10^{11}$ m.)',
        a: num(T2), unit: 'K',
        steps: ['Absorbed $= (1 - A)\\,\\sigma T_\\star^4 (R_\\star/d)^2\\,\\pi R_p^2$; emitted $= 4\\pi R_p^2\\sigma T^4$. Setting them equal: $T = T_\\star(1 - A)^{1/4}\\sqrt{R_\\star/(2d)}$.',
          '$R_\\star/(2d) = ' + tx(Rs * 6.96e8, 3) + '/(2 \\times ' + tx(d2 * 1.496e11, 3) + ') = ' + tx(Rs * 6.96e8 / (2 * d2 * 1.496e11), 3) + '$; its square root is $' + tx(M.sqrt(Rs * 6.96e8 / (2 * d2 * 1.496e11)), 3) + '$.',
          '$T = ' + tx(Ts, 2) + ' \\times ' + td(M.pow(1 - A2, 0.25), 3) + ' \\times ' + tx(M.sqrt(Rs * 6.96e8 / (2 * d2 * 1.496e11)), 3) + ' = ' + tx(T2, 3) + '$ K.'],
        hint: 'Use $T = T_\\star(1 - A)^{1/4}\\sqrt{R_\\star/(2d)}$ with both lengths in meters.' };
    } else if (kind === 'dist') {
      var L3 = rnd(R, 0.01, 30, 2), A3 = R.pick([0.3, 0.3, 0.2, 0.5]), Tt = R.pick([200, 230, 255, 270, 300, 400, 1000]), d3 = M.pow(278 / Tt, 2) * M.sqrt((1 - A3) * L3);
      d = { L: L3, A: A3, T: Tt, ans: d3 };
      p = { q: 'How far from a star of $' + tx(L3, 2) + '\\,L_\\odot$ must a planet with albedo $' + td(A3, 1) + '$ orbit to have an equilibrium temperature of $' + Tt + '$ K? Use $T = 278\\text{ K} \\times \\left[(1 - A)\\,L/L_\\odot\\right]^{1/4}(d/1\\text{ AU})^{-1/2}$.',
        a: num(d3), unit: 'AU',
        steps: ['Solve for $d$: $\\dfrac{d}{1\\text{ AU}} = \\left(\\dfrac{278\\text{ K}}{T}\\right)^{2}\\sqrt{(1 - A)L/L_\\odot}$.', '$(278/' + Tt + ')^2 = ' + tx(M.pow(278 / Tt, 2), 3) + '$ and $\\sqrt{' + td(1 - A3, 1) + ' \\times ' + tx(L3, 2) + '} = ' + tx(M.sqrt((1 - A3) * L3), 3) + '$.', '$d = ' + tx(d3, 3) + '$ AU.'],
        hint: 'Square both sides after isolating $d^{-1/2}$.' };
    } else if (kind === 'albedo') {
      var a1 = R.pick([0.05, 0.1, 0.3]), a2 = R.pick([0.5, 0.65, 0.75, 0.9]), rr = M.pow((1 - a2) / (1 - a1), 0.25);
      d = { a1: a1, a2: a2, ans: rr };
      p = { q: 'Two planets orbit the same star at the same distance. Planet X has albedo $' + td(a1, 2) + '$ and planet Y has albedo $' + td(a2, 2) + '$. What is $T_Y/T_X$, the ratio of their equilibrium temperatures?',
        a: num(rr),
        steps: ['$T \\propto (1 - A)^{1/4}$ when the star and distance are the same.', '$T_Y/T_X = \\left(\\dfrac{1 - ' + td(a2, 2) + '}{1 - ' + td(a1, 2) + '}\\right)^{1/4} = (' + td((1 - a2) / (1 - a1), 3) + ')^{1/4}$.', '$= ' + td(rr, 3) + '$: the more reflective planet is colder, but only by the fourth root.'],
        hint: 'Only the factor $(1 - A)^{1/4}$ differs.' };
    } else { // hz
      var L4 = R.pick([0.0016, 0.01, 0.04, 0.09, 0.25, 4, 9, 16, 25, 100]), d4 = M.sqrt(L4);
      d = { L: L4, ans: d4 };
      p = { q: 'At what distance from a star of $' + tx(L4, 2) + '\\,L_\\odot$ would a planet receive the same flux of starlight that Earth gets from the Sun at 1 AU?',
        a: num(d4), unit: 'AU',
        steps: ['Flux $= L/(4\\pi d^2)$. Equal flux means $L/d^2 = L_\\odot/(1\\text{ AU})^2$.', '$d = \\sqrt{L/L_\\odot}\\text{ AU} = \\sqrt{' + tx(L4, 2) + '}$ AU.', '$d = ' + tx(d4, 3) + '$ AU. Habitable-zone distances scale the same way, as $\\sqrt{L}$.'],
        hint: 'Flux falls as $1/d^2$, so the distance scales as $\\sqrt{L}$.' };
    }
    return chk(id, d, p, kind);
  });

  // =====================================================================================================
  // Unit 3. How Stars Work
  // =====================================================================================================
  var GIVEN = '$G = 6.67 \\times 10^{-11}$ N·m²/kg², $M_\\odot = 1.99 \\times 10^{30}$ kg, $R_\\odot = 6.96 \\times 10^{8}$ m';

  G('astrophys.hydrostatic-equilibrium', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['mean', 'grad', 'grad'], ['pc', 'grad', 'scale'], ['pc', 'pr', 'scale']));
    var id = 'astrophys.hydrostatic-equilibrium', p, d;
    if (kind === 'mean') {
      var Ms = R.real(0.3, 15, 1), Rs = R.real(0.3, 8, 1), rho = 3 * Ms * K.Msun / (4 * M.PI * cube(Rs * K.Rsun));
      d = { M: Ms, R: Rs, ans: rho };
      p = { q: 'A star has $M = ' + td(Ms, 1) + '\\,M_\\odot$ and $R = ' + td(Rs, 1) + '\\,R_\\odot$. What is its mean density? (' + GIVEN.replace('$G = 6.67 \\times 10^{-11}$ N·m²/kg², ', '') + '.)',
        a: num(rho), unit: 'kg/m³',
        steps: ['$\\bar\\rho = \\dfrac{M}{\\tfrac43\\pi R^3}$.', '$M = ' + tx(Ms * K.Msun, 3) + '$ kg; $R = ' + tx(Rs * K.Rsun, 3) + '$ m, so $\\tfrac43\\pi R^3 = ' + tx(4 / 3 * M.PI * cube(Rs * K.Rsun), 3) + '$ m³.', '$\\bar\\rho = ' + tx(rho, 3) + '$ kg/m³ (water is 1000 kg/m³).'],
        hint: 'Mass divided by the volume of a sphere.' };
    } else if (kind === 'grad') {
      var x = R.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7]), mfr = sig(M.min(0.99, 1 - M.pow(1 - x, 3) * R.real(0.8, 1.6)), 2), rho2 = sig(rnd(R, 50, 20000, 2), 2);
      var r = x * K.Rsun, g = K.G * mfr * K.Msun / (r * r), dPdr = g * rho2;
      d = { x: x, m: mfr, rho: rho2, ans: dPdr };
      p = { q: 'In a Sun-like star, the layer at $r = ' + td(x, 1) + '\\,R_\\odot$ has density $' + tx(rho2, 2) + '$ kg/m³, and the mass inside it is $m(r) = ' + td(mfr, 2) + '\\,M_\\odot$. How fast does the pressure fall with radius there? Give $|dP/dr|$. (' + GIVEN + '.)',
        a: num(dPdr), unit: 'Pa/m',
        steps: ['Hydrostatic equilibrium: $\\dfrac{dP}{dr} = -\\dfrac{Gm(r)\\rho}{r^2}$; only the mass inside $r$ pulls on the layer.', 'Local gravity: $g = \\dfrac{Gm(r)}{r^2} = \\dfrac{6.67 \\times 10^{-11} \\times ' + tx(mfr * K.Msun, 3) + '}{(' + tx(r, 3) + ')^2} = ' + tx(g, 3) + '$ m/s².', '$|dP/dr| = g\\rho = ' + tx(g, 3) + ' \\times ' + tx(rho2, 2) + ' = ' + tx(dPdr, 3) + '$ Pa/m.'],
        hint: 'It is the same rule as $\\Delta P = \\rho g\\,\\Delta h$ in a lake, with $g = Gm(r)/r^2$.' };
    } else if (kind === 'pc') {
      var M2 = R.real(0.3, 10, 1), R2 = R.real(0.3, 6, 1), Pc = 3 * K.G * M.pow(M2 * K.Msun, 2) / (8 * M.PI * M.pow(R2 * K.Rsun, 4));
      d = { M: M2, R: R2, ans: Pc };
      p = { q: 'Model a star of $' + td(M2, 1) + '\\,M_\\odot$ and $' + td(R2, 1) + '\\,R_\\odot$ as a ball of uniform density. Integrate hydrostatic equilibrium to find its central pressure, $P_c = \\dfrac{3GM^2}{8\\pi R^4}$. (' + GIVEN + '.)',
        a: num(Pc), unit: 'Pa',
        steps: ['For uniform density, $m(r) = Mr^3/R^3$, so $\\dfrac{dP}{dr} = -\\dfrac{3GM^2}{4\\pi R^6}\\,r$; integrating from the surface ($P = 0$) to the center gives $P_c = \\dfrac{3GM^2}{8\\pi R^4}$.',
          '$M^2 = (' + tx(M2 * K.Msun, 3) + ')^2 = ' + tx(M.pow(M2 * K.Msun, 2), 3) + '$; $R^4 = (' + tx(R2 * K.Rsun, 3) + ')^4 = ' + tx(M.pow(R2 * K.Rsun, 4), 3) + '$.',
          '$P_c = \\dfrac{3 \\times 6.67 \\times 10^{-11} \\times ' + tx(M.pow(M2 * K.Msun, 2), 3) + '}{8\\pi \\times ' + tx(M.pow(R2 * K.Rsun, 4), 3) + '} = ' + tx(Pc, 3) + '$ Pa.'],
        hint: 'Square the mass and raise the radius to the fourth power, in SI units.' };
    } else if (kind === 'pr') {
      var M3 = R.real(0.5, 5, 1), R3 = R.real(0.5, 4, 1), xx = R.pick([0.25, 0.5, 0.6, 0.75, 0.8, 0.9]), Pc3 = 3 * K.G * M.pow(M3 * K.Msun, 2) / (8 * M.PI * M.pow(R3 * K.Rsun, 4)), Pr = Pc3 * (1 - xx * xx);
      d = { M: M3, R: R3, x: xx, ans: Pr };
      p = { q: 'In a uniform-density star of $' + td(M3, 1) + '\\,M_\\odot$ and $' + td(R3, 1) + '\\,R_\\odot$, the pressure is $P(r) = P_c\\left(1 - r^2/R^2\\right)$ with $P_c = 3GM^2/(8\\pi R^4)$. Find the pressure at $r = ' + td(xx, 2) + 'R$. (' + GIVEN + '.)',
        a: num(Pr), unit: 'Pa',
        steps: ['$P_c = \\dfrac{3GM^2}{8\\pi R^4} = ' + tx(Pc3, 3) + '$ Pa.', '$1 - (' + td(xx, 2) + ')^2 = ' + td(1 - xx * xx, 4) + '$.', '$P = ' + tx(Pc3, 3) + ' \\times ' + td(1 - xx * xx, 4) + ' = ' + tx(Pr, 3) + '$ Pa.'],
        hint: 'Find $P_c$ first, then scale by $1 - r^2/R^2$.' };
    } else { // scale
      var fm = R.pick([0.5, 2, 3, 4, 10]), fr = R.pick([0.5, 1.5, 2, 3, 5]), ratio = fm * fm / M.pow(fr, 4);
      d = { fm: fm, fr: fr, ans: ratio };
      p = { q: 'Star B has $' + td(fm, 1) + '$ times the mass and $' + td(fr, 1) + '$ times the radius of star A, with the same internal structure. Using $P_c \\propto GM^2/R^4$, find $P_{c,B}/P_{c,A}$.',
        a: num(ratio),
        steps: ['$\\dfrac{P_{c,B}}{P_{c,A}} = \\left(\\dfrac{M_B}{M_A}\\right)^{2}\\left(\\dfrac{R_A}{R_B}\\right)^{4}$.', '$= (' + td(fm, 1) + ')^2/(' + td(fr, 1) + ')^4 = ' + tx(fm * fm, 3) + '/' + tx(M.pow(fr, 4), 4) + '$.', '$= ' + tx(ratio, 3) + '$.'],
        hint: 'Weight grows as $M^2$; the pressure spreads it over an area and through a depth set by $R$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.central-conditions', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['Tc', 'Pc', 'Tc'], ['mu', 'scale', 'Pc'], ['gas', 'kT', 'scale']));
    var id = 'astrophys.central-conditions', p, d, GV = '$G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $R_\\odot = 6.96 \\times 10^{8}$ m, $m_p = 1.67 \\times 10^{-27}$ kg, $k = 1.38 \\times 10^{-23}$ J/K';
    if (kind === 'Tc' || kind === 'mu') {
      var Ms = R.real(0.2, 20, 1), Rs = sig(M.pow(Ms, 0.8) * R.real(0.8, 1.2), 2), mu = kind === 'mu' ? R.pick([0.5, 0.6, 0.62, 0.7, 0.85]) : 1;
      var T = K.G * Ms * K.Msun * mu * K.mp / (K.kB * Rs * K.Rsun);
      d = { M: Ms, R: Rs, mu: kind === 'mu' ? mu : undefined, ans: T };
      p = { q: 'Estimate the central temperature of a star with $M = ' + td(Ms, 1) + '\\,M_\\odot$ and $R = ' + tx(Rs, 2) + '\\,R_\\odot$ using $kT_c \\sim ' + (kind === 'mu' ? 'GM\\mu m_p/R' : 'GMm_p/R') + '$' + (kind === 'mu' ? ' with mean particle mass $\\mu = ' + mu + '$' : '') + '. (' + GV + '.)',
        a: num(T), unit: 'K',
        steps: ['A particle near the center must have thermal energy comparable to the gravitational energy per particle: $kT_c \\sim GM' + (kind === 'mu' ? '\\mu' : '') + ' m_p/R$.',
          '$GM' + (kind === 'mu' ? '\\mu' : '') + ' m_p = 6.67 \\times 10^{-11} \\times ' + tx(Ms * K.Msun, 3) + (kind === 'mu' ? ' \\times ' + mu : '') + ' \\times 1.67 \\times 10^{-27} = ' + tx(K.G * Ms * K.Msun * mu * K.mp, 3) + '$ J·m.',
          '$T_c \\sim \\dfrac{' + tx(K.G * Ms * K.Msun * mu * K.mp, 3) + '}{1.38 \\times 10^{-23} \\times ' + tx(Rs * K.Rsun, 3) + '} = ' + tx(T, 3) + '$ K.'],
        hint: 'Set the thermal energy $kT$ equal to the gravitational energy $GMm_p/R$ of one particle.' };
    } else if (kind === 'Pc') {
      var M2 = R.real(0.2, 20, 1), R2 = sig(M.pow(M2, 0.8) * R.real(0.8, 1.2), 2), Pc = K.G * M.pow(M2 * K.Msun, 2) / M.pow(R2 * K.Rsun, 4);
      d = { M: M2, R: R2, ans: Pc };
      p = { q: 'Estimate the central pressure of a star with $M = ' + td(M2, 1) + '\\,M_\\odot$ and $R = ' + tx(R2, 2) + '\\,R_\\odot$ from $P_c \\sim GM^2/R^4$. ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $R_\\odot = 6.96 \\times 10^{8}$ m.)',
        a: num(Pc), unit: 'Pa',
        steps: ['Replace $dP/dr$ by $P_c/R$, $m$ by $M$, $\\rho$ by $M/R^3$ and $r$ by $R$: $P_c/R \\sim GM(M/R^3)/R^2$, so $P_c \\sim GM^2/R^4$.', '$M^2 = ' + tx(M.pow(M2 * K.Msun, 2), 3) + '$ kg², $R^4 = ' + tx(M.pow(R2 * K.Rsun, 4), 3) + '$ m⁴.', '$P_c \\sim ' + tx(Pc, 3) + '$ Pa, about $' + tx(Pc / 101325, 2) + '$ atmospheres.'],
        hint: 'Turn the derivative into a ratio of typical sizes.' };
    } else if (kind === 'scale') {
      var Mr = R.pick([0.3, 0.5, 2, 4, 10, 20]), e = 0.8, ratio = Mr / M.pow(Mr, e);
      d = { Mr: Mr, ans: ratio };
      p = { q: 'On the main sequence, radius grows roughly as $R \\propto M^{0.8}$. Using $T_c \\propto M/R$, by what factor is the central temperature of a $' + td(Mr, 1) + '\\,M_\\odot$ star larger than the Sun\'s?',
        a: num(ratio),
        steps: ['$T_c \\propto M/R \\propto M/M^{0.8} = M^{0.2}$.', 'Factor $= ' + td(Mr, 1) + '^{0.2}$.', '$= ' + tx(ratio, 3) + '$: central temperatures differ much less than masses do.'],
        hint: 'Substitute $R \\propto M^{0.8}$ into $T_c \\propto M/R$.' };
    } else if (kind === 'kT') {
      var Tc = sig(R.real(5, 40, 1) * 1e6, 2), kTk = 8.617e-5 * Tc / 1000, avg = 1.5 * kTk;
      d = { T: Tc, ans: avg };
      p = { q: 'A star\'s core is at $' + tx(Tc, 2) + '$ K. What is the average kinetic energy of a particle there, $\\tfrac32kT$, in keV? ($k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(avg), unit: 'keV',
        steps: ['$kT = 8.617 \\times 10^{-5}\\text{ eV/K} \\times ' + tx(Tc, 2) + '\\text{ K} = ' + tx(kTk * 1000, 3) + '$ eV.', '$\\tfrac32kT = ' + tx(avg * 1000, 3) + '$ eV $= ' + tx(avg, 3) + '$ keV.', 'That is about a thousand times the 13.6 eV that ionizes hydrogen, so the core is fully ionized.'],
        hint: 'Multiply Boltzmann\'s constant in eV/K by the temperature, then by 3/2.' };
    } else { // gas: T from P and rho
      var P = sig(rnd(R, 1e15, 5e16, 2), 2), rho = sig(rnd(R, 2e4, 2e5, 2), 2), mu2 = R.pick([0.6, 0.62, 0.7, 0.8, 0.85]), T2 = P * mu2 * K.mp / (rho * K.kB);
      d = { P: P, rho: rho, mu: mu2, ans: T2 };
      p = { q: 'A stellar core has pressure $' + tx(P, 2) + '$ Pa and density $' + tx(rho, 2) + '$ kg/m³, with mean particle mass $\\mu = ' + mu2 + '$ (in units of $m_p$). Treating it as an ideal gas, find its temperature. ($m_p = 1.67 \\times 10^{-27}$ kg, $k = 1.38 \\times 10^{-23}$ J/K.)',
        a: num(T2), unit: 'K',
        steps: ['Ideal gas: $P = nkT$ with particle density $n = \\rho/(\\mu m_p)$, so $T = \\dfrac{P\\mu m_p}{\\rho k}$.', '$n = ' + tx(rho, 2) + '/(' + mu2 + ' \\times 1.67 \\times 10^{-27}) = ' + tx(rho / (mu2 * K.mp), 3) + '$ m⁻³.', '$T = P/(nk) = ' + tx(P, 2) + '/(' + tx(rho / (mu2 * K.mp), 3) + ' \\times 1.38 \\times 10^{-23}) = ' + tx(T2, 3) + '$ K.'],
        hint: 'Count particles: $n = \\rho/(\\mu m_p)$, then $P = nkT$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.virial-theorem', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['KE', 'lose', 'lose'], ['U', 'Tbar', 'lose', 'KE'], ['contract', 'Tbar', 'sat']));
    var id = 'astrophys.virial-theorem', p, d;
    if (kind === 'KE') {
      var U = -sig(rnd(R, 1e40, 5e42, 2), 2), askE = R.coin(), ans = askE ? U / 2 : -U / 2;
      d = { U: U, askE: askE, ans: ans };
      p = { q: 'A star in equilibrium has gravitational potential energy $U = ' + tx(U, 2) + '$ J. What is its ' + (askE ? 'total energy $E = K + U$' : 'total thermal (kinetic) energy $K$') + '?',
        a: num(ans), unit: 'J',
        steps: ['Virial theorem for a gas ball held by its own gravity: $2K + U = 0$, so $K = -U/2$.', '$K = ' + tx(-U / 2, 3) + '$ J' + (askE ? ', and $E = K + U = U/2$.' : '.'), askE ? '$E = ' + tx(U / 2, 3) + '$ J: negative, so the star is bound.' : 'The thermal energy is half the size of the gravitational energy.'],
        hint: 'Use $2K + U = 0$.' };
    } else if (kind === 'lose') {
      var dE = sig(rnd(R, 1e33, 1e41, 2), 2), askU = R.coin();
      d = { dE: dE, askU: askU, ans: askU ? -2 * dE : dE };
      p = { q: 'A contracting protostar in virial equilibrium radiates away $' + tx(dE, 2) + '$ J. By how much does its ' + (askU ? 'gravitational potential energy $U$' : 'thermal energy $K$') + ' change? (Give the change with its sign.)',
        a: num(askU ? -2 * dE : dE), unit: 'J',
        steps: ['$E = K + U$ and $2K + U = 0$ give $E = -K = U/2$.', 'Radiating means $\\Delta E = -' + tx(dE, 2) + '$ J. Then $\\Delta K = -\\Delta E = +' + tx(dE, 2) + '$ J and $\\Delta U = 2\\Delta E = ' + tx(-2 * dE, 2) + '$ J.', askU ? '$\\Delta U = ' + tx(-2 * dE, 2) + '$ J: gravity releases twice what is radiated; half leaves as light and half heats the gas.' : '$\\Delta K = +' + tx(dE, 2) + '$ J: losing energy makes the star <b>hotter</b>.'],
        hint: 'With $E = -K$, a drop in $E$ is a rise in $K$.' };
    } else if (kind === 'U') {
      var Ms = R.real(0.3, 10, 1), Rs = R.real(0.2, 5, 1), U2 = -0.6 * K.G * M.pow(Ms * K.Msun, 2) / (Rs * K.Rsun);
      d = { M: Ms, R: Rs, ans: U2 };
      p = { q: 'Treat a star of $' + td(Ms, 1) + '\\,M_\\odot$ and $' + td(Rs, 1) + '\\,R_\\odot$ as a uniform sphere, with $U = -\\tfrac35GM^2/R$. Find $U$, and hence its thermal energy is $-U/2$. Give $U$. (' + GIVEN + '.)',
        a: num(U2), unit: 'J',
        steps: ['$M = ' + tx(Ms * K.Msun, 3) + '$ kg, $R = ' + tx(Rs * K.Rsun, 3) + '$ m.', '$U = -0.6 \\times 6.67 \\times 10^{-11} \\times (' + tx(Ms * K.Msun, 3) + ')^2/' + tx(Rs * K.Rsun, 3) + '$.', '$U = ' + tx(U2, 3) + '$ J, so $K = ' + tx(-U2 / 2, 3) + '$ J.'],
        hint: 'Square the mass in kilograms and divide by the radius in meters.' };
    } else if (kind === 'Tbar') {
      var M3 = R.real(0.3, 10, 1), R3 = sig(M.pow(M3, 0.8), 2), mu = R.pick([0.5, 0.6, 0.62]), Tb = K.G * M3 * K.Msun * mu * K.mp / (5 * K.kB * R3 * K.Rsun);
      d = { M: M3, R: R3, mu: mu, ans: Tb };
      p = { q: 'For a uniform star the virial theorem gives $\\tfrac32NkT = \\tfrac{3}{10}GM^2/R$ with $N = M/(\\mu m_p)$, so $\\bar T = \\dfrac{GM\\mu m_p}{5kR}$. Find the mean temperature of a star with $' + td(M3, 1) + '\\,M_\\odot$, $' + tx(R3, 2) + '\\,R_\\odot$ and $\\mu = ' + mu + '$. (' + GIVEN + ', $m_p = 1.67 \\times 10^{-27}$ kg, $k = 1.38 \\times 10^{-23}$ J/K.)',
        a: num(Tb), unit: 'K',
        steps: ['$GM\\mu m_p = 6.67 \\times 10^{-11} \\times ' + tx(M3 * K.Msun, 3) + ' \\times ' + mu + ' \\times 1.67 \\times 10^{-27} = ' + tx(K.G * M3 * K.Msun * mu * K.mp, 3) + '$ J·m.', '$5kR = 5 \\times 1.38 \\times 10^{-23} \\times ' + tx(R3 * K.Rsun, 3) + ' = ' + tx(5 * K.kB * R3 * K.Rsun, 3) + '$ J·m/K.', '$\\bar T = ' + tx(Tb, 3) + '$ K: millions of kelvins on average.'],
        hint: 'Plug into $\\bar T = GM\\mu m_p/(5kR)$ in SI units.' };
    } else if (kind === 'contract') {
      var M4 = R.real(0.5, 3, 1), R1 = R.pick([100, 50, 20, 10]), R2 = R.pick([2, 1.5, 3, 5]), dU = 0.6 * K.G * M.pow(M4 * K.Msun, 2) * (1 / (R2 * K.Rsun) - 1 / (R1 * K.Rsun)), rad = dU / 2;
      d = { M: M4, R1: R1, R2: R2, ans: rad };
      p = { q: 'A uniform-density protostar of $' + td(M4, 1) + '\\,M_\\odot$ contracts from $' + R1 + '\\,R_\\odot$ to $' + R2 + '\\,R_\\odot$ while staying in virial equilibrium. How much energy does it radiate? ($U = -\\tfrac35GM^2/R$; ' + GIVEN + '.)',
        a: num(rad), unit: 'J',
        steps: ['Gravity releases $|\\Delta U| = \\tfrac35GM^2\\left(\\dfrac{1}{R_2} - \\dfrac{1}{R_1}\\right) = ' + tx(dU, 3) + '$ J.', 'Virial theorem: $\\Delta E = \\Delta U/2$, so half of the released energy is radiated and half heats the gas ($\\Delta K = -\\Delta U/2$).', 'Radiated: $' + tx(rad, 3) + '$ J.'],
        hint: 'Find the change in $U$, then use $\\Delta E = \\Delta U/2$.' };
    } else { // sat: satellite analog
      var m = R.pick([500, 1000, 2000, 5000]), h1 = R.pick([400, 500, 600]), h2 = h1 - R.pick([20, 50, 100]), r1 = 6.37e6 + h1 * 1e3, r2 = 6.37e6 + h2 * 1e3, GM = 3.99e14, dK = GM * m / 2 * (1 / r2 - 1 / r1);
      d = { m: m, h1: h1, h2: h2, ans: dK };
      p = { q: 'A $' + m + '$ kg satellite drops from a circular orbit at $' + h1 + '$ km altitude to one at $' + h2 + '$ km as air drag removes energy. By how much does its kinetic energy change? ($GM_\\oplus = 3.99 \\times 10^{14}$ m³/s², $R_\\oplus = 6.37 \\times 10^{6}$ m.)',
        a: num(dK, { rtol: 0.03 }), unit: 'J',
        steps: ['For a circular orbit $K = GMm/(2r)$ and $E = -GMm/(2r) = -K$: the same virial rule, $2K + U = 0$.', '$r_1 = ' + tx(r1, 4) + '$ m, $r_2 = ' + tx(r2, 4) + '$ m.', '$\\Delta K = \\dfrac{GMm}{2}\\left(\\dfrac{1}{r_2} - \\dfrac{1}{r_1}\\right) = +' + tx(dK, 3) + '$ J: drag makes it <b>speed up</b>, just as a star that loses energy heats up.'],
        hint: 'In a circular orbit $K = GMm/(2r)$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.kelvin-helmholtz', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['tkh', 'tkh', 'concept'], ['si', 'factor', 'nuclear'], ['rate', 'nuclear', 'si']));
    var id = 'astrophys.kelvin-helmholtz', p, d, GV = '$G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $R_\\odot = 6.96 \\times 10^{8}$ m, $L_\\odot = 3.83 \\times 10^{26}$ W, $1\\text{ yr} = 3.16 \\times 10^{7}$ s';
    if (kind === 'tkh' || kind === 'factor') {
      var Ms = L === 1 ? R.pick([1, 1, 2, 0.5, 5, 0.6, 0.8, 1.2, 3, 4]) : R.real(0.5, 10, 1), Rs = sig(M.pow(Ms, 0.8), 2), Ls = sig(M.pow(Ms, 3.5), 2), f = kind === 'factor' ? 0.3 : 1;
      var t = f * K.G * M.pow(Ms * K.Msun, 2) / (Rs * K.Rsun * Ls * K.Lsun) / K.yr;
      d = { M: Ms, R: Rs, L: Ls, f: f, ans: t / 1e6 };
      p = { q: (kind === 'factor' ? 'For a uniform sphere, contraction can supply at most about $\\tfrac{3}{10}GM^2/R$ of radiated energy. How long, at its present luminosity, could that power' : 'Estimate the Kelvin–Helmholtz time $t_{KH} \\approx GM^2/(RL)$, the time that gravitational contraction alone could power') + ' a star with $M = ' + tx(Ms, 2) + '\\,M_\\odot$, $R = ' + tx(Rs, 2) + '\\,R_\\odot$ and $L = ' + tx(Ls, 2) + '\\,L_\\odot$? Answer in millions of years. (' + GV + '.)',
        a: num(t / 1e6), unit: 'Myr',
        steps: ['Energy available: ' + (f === 1 ? '$\\sim GM^2/R$' : '$\\tfrac{3}{10}GM^2/R$') + '; time $=$ energy $/$ luminosity.', '$' + (f === 1 ? '' : '0.3 \\times ') + 'GM^2/R = ' + tx(f * K.G * M.pow(Ms * K.Msun, 2) / (Rs * K.Rsun), 3) + '$ J; $L = ' + tx(Ls * K.Lsun, 3) + '$ W.', '$t = ' + tx(t * K.yr, 3) + '$ s $= ' + tx(t, 3) + '$ yr $\\approx ' + tx(t / 1e6, 3) + '$ million years.'],
        hint: 'Divide the gravitational energy by the luminosity, then convert seconds to years.' };
    } else if (kind === 'si') {
      var Mkg = sig(rnd(R, 2e29, 2e31, 2), 2), Rm = sig(rnd(R, 2e8, 5e9, 2), 2), LW = sig(rnd(R, 1e25, 1e29, 2), 2), t2 = K.G * Mkg * Mkg / (Rm * LW) / K.yr;
      d = { M: Mkg, R: Rm, L: LW, ans: t2 };
      p = { q: 'A star has $M = ' + tx(Mkg, 2) + '$ kg, $R = ' + tx(Rm, 2) + '$ m and $L = ' + tx(LW, 2) + '$ W. Estimate its Kelvin–Helmholtz time $GM^2/(RL)$ in years. ($G = 6.67 \\times 10^{-11}$, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(t2), unit: 'yr',
        steps: ['$GM^2/R = 6.67 \\times 10^{-11} \\times (' + tx(Mkg, 2) + ')^2/' + tx(Rm, 2) + ' = ' + tx(K.G * Mkg * Mkg / Rm, 3) + '$ J.', 'Divide by $L$: $' + tx(K.G * Mkg * Mkg / (Rm * LW), 3) + '$ s.', 'In years: $' + tx(t2, 3) + '$ yr.'],
        hint: 'Gravitational energy over power gives a time.' };
    } else if (kind === 'nuclear') {
      var Ms2 = R.pick([1, 1, 0.5, 2, 3, 0.8, 0.6, 0.7, 0.9, 1.2, 1.5, 2.5]), Ls2 = sig(M.pow(Ms2, 3.5), 2), tn = 0.007 * 0.1 * Ms2 * K.Msun * K.c * K.c / (Ls2 * K.Lsun) / K.yr;
      d = { M: Ms2, L: Ls2, ans: tn / 1e9 };
      p = { q: 'A star of $' + tx(Ms2, 2) + '\\,M_\\odot$ and $' + tx(Ls2, 2) + '\\,L_\\odot$ can fuse about 10% of its mass, and fusion turns 0.7% of that mass into energy. How long can fusion power it, in billions of years? ($M_\\odot = 1.99 \\times 10^{30}$ kg, $c = 3.00 \\times 10^{8}$ m/s, $L_\\odot = 3.83 \\times 10^{26}$ W, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(tn / 1e9), unit: 'Gyr',
        steps: ['Energy: $E = 0.007 \\times 0.1 \\times Mc^2 = 7 \\times 10^{-4} \\times ' + tx(Ms2 * K.Msun, 3) + ' \\times (3.00 \\times 10^{8})^2 = ' + tx(7e-4 * Ms2 * K.Msun * 9e16, 3) + '$ J.', 'Time: $E/L = ' + tx(7e-4 * Ms2 * K.Msun * 9e16 / (Ls2 * K.Lsun), 3) + '$ s.', '$= ' + tx(tn, 3) + '$ yr $\\approx ' + tx(tn / 1e9, 3) + '$ billion years, hundreds of times the Kelvin–Helmholtz time.'],
        hint: 'Energy from $E = (\\text{mass fused})(0.007)c^2$, then divide by $L$.' };
    } else if (kind === 'rate') {
      var Ms3 = R.pick([1, 1, 0.5, 2, 0.6, 0.8, 0.9, 1.5]), Rs3 = sig(M.pow(Ms3, 0.8), 2), Ls3 = sig(M.pow(Ms3, 3.5), 2), v = 10 * Ls3 * K.Lsun * M.pow(Rs3 * K.Rsun, 2) / (3 * K.G * M.pow(Ms3 * K.Msun, 2)) * K.yr;
      d = { M: Ms3, R: Rs3, L: Ls3, ans: v };
      p = { q: 'If a star of $' + tx(Ms3, 2) + '\\,M_\\odot$, $' + tx(Rs3, 2) + '\\,R_\\odot$ and $' + tx(Ls3, 2) + '\\,L_\\odot$ were powered only by contraction (uniform density, virial equilibrium: radiated energy $= \\tfrac{3}{10}GM^2/R$), how fast would its radius have to shrink, in meters per year? (' + GV + '.)',
        a: num(v, { rtol: 0.03 }), unit: 'm/yr',
        steps: ['$L = \\dfrac{d}{dt}\\left(\\dfrac{3GM^2}{10R}\\right) = \\dfrac{3GM^2}{10R^2}\\left|\\dfrac{dR}{dt}\\right|$.', 'So $\\left|\\dfrac{dR}{dt}\\right| = \\dfrac{10LR^2}{3GM^2} = ' + tx(v / K.yr, 3) + '$ m/s.', 'Times $3.16 \\times 10^{7}$ s/yr: $' + tx(v, 3) + '$ m per year, too small to measure directly, yet over a few tens of millions of years it would use up the whole supply.'],
        hint: 'Differentiate the radiated energy with respect to time.' };
    } else {
      var c = R.pick([
        ['In the 1860s Kelvin and Helmholtz argued that the Sun shines by slowly contracting. Why was the idea abandoned?', 'Contraction could power the Sun for only tens of millions of years, but geology and later radioactive dating showed Earth is billions of years old.', ['Measurements showed the Sun is expanding, not contracting.', 'Contraction would make the Sun cooler, but it is very hot.', 'Gravity cannot release energy, because energy is conserved.']],
        ['What powers a protostar before fusion begins?', 'Gravitational contraction: half of the energy released heats the gas and half is radiated away.', ['Fusion of hydrogen in a thin outer shell.', 'Chemical burning of its gas.', 'Heat left over from the Big Bang.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['Contraction releases gravitational energy; by the virial theorem half heats the star and half is radiated.', 'For the Sun that supply lasts only about $GM^2/(RL) \\approx 3 \\times 10^{7}$ years, while Earth is about $4.5 \\times 10^{9}$ years old. Fusion, with hundreds of times more energy available, is the real source; contraction powers stars only before fusion starts and between burning stages.'],
        hint: 'Compare the time contraction could last with the age of Earth.' };
    }
    return chk(id, d, p, kind);
  });

  // atomic masses (u), AME2020, rounded to 6 decimals
  var AM = { H1: 1.007825, H2: 2.014102, He3: 3.016029, He4: 4.002603, C12: 12.000000, C13: 13.003355, N13: 13.005739, N14: 14.003074, N15: 15.000109, O15: 15.003066 };
  G('astrophys.fusion-chains', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['Q', 'frac', 'concept'], ['rate', 'mass', 'Q'], ['step', 'rate', 'mass']));
    var id = 'astrophys.fusion-chains', p, d;
    var Qall = (4 * AM.H1 - AM.He4) * 931.5;
    if (kind === 'Q' && R.coin()) {
      var nQ = R.int(2, 60);
      d = { n: nQ, ans: nQ * Qall };
      p = { q: 'In the Sun, four hydrogen-1 atoms end up as one helium-4 atom. Using atomic masses $m(^{1}\\text{H}) = 1.007825$ u and $m(^{4}\\text{He}) = 4.002603$ u, and $1\\text{ u} = 931.5$ MeV/$c^2$, how much energy is released in making $' + nQ + '$ helium-4 atoms?',
        a: num(nQ * Qall), unit: 'MeV',
        steps: ['For one helium-4 atom: $\\Delta m = 4 \\times 1.007825 - 4.002603 = 0.028697$ u.', '$E = 0.028697 \\times 931.5 = ' + td(Qall, 2) + '$ MeV.', 'For $' + nQ + '$ atoms: $' + nQ + ' \\times ' + td(Qall, 2) + ' = ' + tx(nQ * Qall, 3) + '$ MeV.'],
        hint: 'Find the energy for one helium atom, then multiply.' };
    } else if (kind === 'Q') {
      d = { ans: Qall };
      p = { q: 'In the Sun, four hydrogen-1 atoms end up as one helium-4 atom. Using atomic masses $m(^{1}\\text{H}) = 1.007825$ u and $m(^{4}\\text{He}) = 4.002603$ u, and $1\\text{ u} = 931.5$ MeV/$c^2$, how much energy is released?',
        a: num(Qall), unit: 'MeV',
        steps: ['Mass before: $4 \\times 1.007825 = 4.031300$ u. Mass after: $4.002603$ u. (Atomic masses include the electrons, so the positrons\' annihilation energy is counted automatically.)', '$\\Delta m = 4.031300 - 4.002603 = 0.028697$ u.', '$Q = 0.028697 \\times 931.5 = ' + td(Qall, 1) + '$ MeV.'],
        hint: 'Find the mass that disappears and convert with 931.5 MeV per u.' };
    } else if (kind === 'frac' && R.coin()) {
      var fr0 = (4 * AM.H1 - AM.He4) / (4 * AM.H1), mk = R.int(1, 40) * R.pick([1, 10, 1000]);
      d = { m: mk, ans: fr0 * mk };
      p = { q: 'When four hydrogen-1 atoms ($1.007825$ u each) become one helium-4 atom ($4.002603$ u), some mass turns into energy. If $' + tx(mk, 3) + '$ kg of hydrogen fuses into helium, how many kilograms of mass become energy?',
        a: num(fr0 * mk), unit: 'kg',
        steps: ['Fraction lost: $0.028697/4.031300 = 0.00712$.', 'Mass turned into energy: $0.00712 \\times ' + tx(mk, 3) + ' = ' + tx(fr0 * mk, 3) + '$ kg.'],
        hint: 'Find the fraction of the mass that is lost first.' };
    } else if (kind === 'frac') {
      var fr = (4 * AM.H1 - AM.He4) / (4 * AM.H1) * 100;
      d = { ans: fr };
      p = { q: 'When four hydrogen-1 atoms ($1.007825$ u each) become one helium-4 atom ($4.002603$ u), what percentage of the starting mass is turned into energy?',
        a: Object.assign(num(fr), { pct: true }),
        steps: ['Starting mass: $4.031300$ u. Lost: $0.028697$ u.', 'Fraction: $0.028697/4.031300 = 0.00712$.', 'About $' + td(fr, 2) + '\\%$.'],
        hint: 'Divide the mass lost by the starting mass.' };
    } else if (kind === 'rate' || kind === 'mass') {
      var Ls = L === 2 && kind === 'rate' ? R.pick([1, 1, 0.5, 2, 10, 100, 0.6, 1.5, 5, 15, 40, 90]) : rnd(R, 0.01, 1e4, 2), LW = Ls * K.Lsun, E1 = 26.7 * K.MeV, rate = LW / E1;
      var sub = kind === 'mass' ? R.pick(['mass', 'hyd']) : 'rate', ans = sub === 'rate' ? rate : sub === 'mass' ? LW / (K.c * K.c) : rate * 4 * K.mp;
      d = { L: Ls, sub: sub, ans: ans };
      p = { q: 'A star of $' + tx(Ls, 2) + '\\,L_\\odot$ is powered by the proton–proton chain, which releases $26.7$ MeV for each helium-4 nucleus made. ' + (sub === 'rate' ? 'How many helium nuclei does it make per second?' : sub === 'mass' ? 'How much mass does it turn into energy each second?' : 'How much hydrogen does it consume each second? (Use $1.67 \\times 10^{-27}$ kg per proton.)') + ' ($L_\\odot = 3.83 \\times 10^{26}$ W, $1\\text{ MeV} = 1.602 \\times 10^{-13}$ J' + (sub === 'mass' ? ', $c = 3.00 \\times 10^{8}$ m/s' : '') + '.)',
        a: num(ans), unit: sub === 'rate' ? 'per second' : 'kg/s',
        steps: sub === 'mass' ? ['$L = ' + tx(LW, 3) + '$ W.', 'Mass converted per second: $\\Delta m/\\Delta t = L/c^2 = ' + tx(LW, 3) + '/(3.00 \\times 10^{8})^2$.', '$= ' + tx(ans, 3) + '$ kg/s.']
          : ['$L = ' + tx(LW, 3) + '$ W; each reaction gives $26.7 \\times 1.602 \\times 10^{-13} = ' + tx(E1, 3) + '$ J.', 'Reactions per second: $' + tx(LW, 3) + '/' + tx(E1, 3) + ' = ' + tx(rate, 3) + '$.'].concat(sub === 'hyd' ? ['Each uses 4 protons: $4 \\times 1.67 \\times 10^{-27} \\times ' + tx(rate, 3) + ' = ' + tx(ans, 3) + '$ kg of hydrogen per second.'] : []),
        hint: sub === 'mass' ? 'Use $E = mc^2$ per second: $\\Delta m/\\Delta t = L/c^2$.' : 'Divide the luminosity by the energy per reaction.' };
      if (sub === 'rate') delete p.unit;
    } else if (kind === 'step') {
      var st = R.pick([
        ['^{2}\\text{H} + {}^{1}\\text{H} \\to {}^{3}\\text{He} + \\gamma', AM.H2 + AM.H1 - AM.He3, [['^{2}\\text{H}', AM.H2], ['^{1}\\text{H}', AM.H1], ['^{3}\\text{He}', AM.He3]]],
        ['^{3}\\text{He} + {}^{3}\\text{He} \\to {}^{4}\\text{He} + 2\\,{}^{1}\\text{H}', 2 * AM.He3 - AM.He4 - 2 * AM.H1, [['^{3}\\text{He}', AM.He3], ['^{4}\\text{He}', AM.He4], ['^{1}\\text{H}', AM.H1]]],
        ['^{12}\\text{C} + {}^{1}\\text{H} \\to {}^{13}\\text{N} + \\gamma', AM.C12 + AM.H1 - AM.N13, [['^{12}\\text{C}', AM.C12], ['^{1}\\text{H}', AM.H1], ['^{13}\\text{N}', AM.N13]]],
        ['^{13}\\text{C} + {}^{1}\\text{H} \\to {}^{14}\\text{N} + \\gamma', AM.C13 + AM.H1 - AM.N14, [['^{13}\\text{C}', AM.C13], ['^{1}\\text{H}', AM.H1], ['^{14}\\text{N}', AM.N14]]],
        ['^{14}\\text{N} + {}^{1}\\text{H} \\to {}^{15}\\text{O} + \\gamma', AM.N14 + AM.H1 - AM.O15, [['^{14}\\text{N}', AM.N14], ['^{1}\\text{H}', AM.H1], ['^{15}\\text{O}', AM.O15]]],
        ['^{15}\\text{N} + {}^{1}\\text{H} \\to {}^{12}\\text{C} + {}^{4}\\text{He}', AM.N15 + AM.H1 - AM.C12 - AM.He4, [['^{15}\\text{N}', AM.N15], ['^{1}\\text{H}', AM.H1], ['^{12}\\text{C}', AM.C12], ['^{4}\\text{He}', AM.He4]]]]);
      var Q = st[1] * 931.5;
      d = { r: st[0], dm: st[1], ans: Q };
      p = { q: 'Find the energy released by the step $' + st[0] + '$. Atomic masses: ' + st[2].map(function (x) { return '$' + x[0] + '$: $' + x[1].toFixed(6) + '$ u'; }).join('; ') + '. ($1\\text{ u} = 931.5$ MeV/$c^2$.)',
        a: num(Q), unit: 'MeV',
        steps: ['$Q = (\\text{mass before} - \\text{mass after})c^2$; the electron masses balance on both sides when atomic masses are used here.', '$\\Delta m = ' + td(st[1], 6) + '$ u.', '$Q = ' + td(st[1], 6) + ' \\times 931.5 = ' + td(Q, 2) + '$ MeV.'],
        hint: 'Add the masses on each side, subtract, and convert with 931.5 MeV per u.' };
    } else {
      var c = R.pick([
        ['Why is the first step of the proton–proton chain, $p + p \\to d + e^+ + \\nu_e$, so slow?', 'It needs the weak interaction to turn a proton into a neutron during the brief encounter, which almost never happens.', ['Protons have to wait for three others to collide with them at once.', 'Deuterium is unstable and usually falls apart into protons.', 'The Sun\'s core is too cool for protons ever to collide.']],
        ['In the CNO cycle, what role do carbon, nitrogen and oxygen play?', 'They are catalysts: they help four protons become one helium-4 nucleus and come back unchanged at the end of the cycle.', ['They are the fuel, which is used up as the star ages.', 'They are produced by the cycle, which is how stars make carbon.', 'They absorb the energy so that the star does not overheat.']],
        ['Which statement about the proton–proton chain is correct?', 'Four protons become one helium-4 nucleus through a series of two-particle reactions, releasing 26.7 MeV in all.', ['Four protons collide at the same moment and fuse into helium-4.', 'Two protons fuse directly into helium-2, the Sun\'s main product.', 'The chain turns helium into hydrogen and releases energy.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['The pp chain: $p + p \\to d + e^+ + \\nu_e$ (weak, slow), then $d + p \\to {}^{3}\\text{He} + \\gamma$, then $^{3}\\text{He} + {}^{3}\\text{He} \\to {}^{4}\\text{He} + 2p$. Every step joins only two particles.', 'In the CNO cycle, carbon-12 captures protons, decays and ends as carbon-12 again, so carbon, nitrogen and oxygen are catalysts. It dominates in stars more massive than about 1.3 Suns, whose cores are hotter.'],
        hint: 'Every nuclear reaction in a star joins just two particles at a time.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.fusion-tunneling', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['kT', 'barrier', 'ratio'], ['ratio', 'Tclass', 'barrier'], ['gamow', 'dB', 'gamow']));
    var id = 'astrophys.fusion-tunneling', p, d, k = 8.617e-5;
    var pairs = [['two protons', 1, 1, 0.5], ['a proton and a helium-4 nucleus', 1, 2, 0.8], ['a proton and a carbon-12 nucleus', 1, 6, 12 / 13], ['two helium-4 nuclei', 2, 2, 2]];
    if (kind === 'kT') {
      var T = sig(R.real(5, 30, 1) * 1e6, 2), kT = k * T / 1000;
      d = { T: T, ans: kT };
      p = { q: 'What is $kT$, in keV, in a stellar core at $' + tx(T, 2) + '$ K? ($k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(kT), unit: 'keV',
        steps: ['$kT = 8.617 \\times 10^{-5} \\times ' + tx(T, 2) + '$ eV.', '$= ' + tx(kT * 1000, 3) + '$ eV $= ' + tx(kT, 3) + '$ keV.'],
        hint: 'Multiply, then divide by 1000 to go from eV to keV.' };
    } else if (kind === 'barrier') {
      var pr = R.pick(pairs), r = R.pick([1, 1.5, 2, 3, 4, 1.2, 2.5, 3.5]), U = 1.44 * pr[1] * pr[2] / r;
      d = { Z1: pr[1], Z2: pr[2], r: r, ans: U };
      p = { q: 'How high is the electric potential-energy barrier between ' + pr[0] + ' (charges $' + (pr[1] === 1 ? '' : pr[1]) + 'e$ and $' + (pr[2] === 1 ? '' : pr[2]) + 'e$) at a separation of $' + r + '$ fm, where the strong force takes over? ($ke^2 = 1.44$ MeV·fm.)',
        a: num(U), unit: 'MeV',
        steps: ['$U = \\dfrac{kZ_1Z_2e^2}{r} = \\dfrac{1.44\\text{ MeV·fm} \\times ' + (pr[1] * pr[2]) + '}{' + r + '\\text{ fm}}$.', '$U = ' + tx(U, 3) + '$ MeV.'],
        hint: 'Coulomb energy $kZ_1Z_2e^2/r$, with $ke^2 = 1.44$ MeV·fm.' };
    } else if (kind === 'ratio') {
      var T2 = sig(R.real(10, 25, 1) * 1e6, 2), r2 = R.pick([1, 1.5, 2, 1.2]), U2 = 1.44 / r2, ratio = U2 * 1e6 / (k * T2);
      d = { T: T2, r: r2, ans: ratio };
      p = { q: 'In a core at $' + tx(T2, 2) + '$ K, how many times larger is the Coulomb barrier between two protons at $' + r2 + '$ fm than the typical thermal energy $kT$? ($ke^2 = 1.44$ MeV·fm, $k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(ratio),
        steps: ['Barrier: $U = 1.44/' + r2 + ' = ' + tx(U2, 3) + '$ MeV $= ' + tx(U2 * 1e6, 3) + '$ eV.', '$kT = 8.617 \\times 10^{-5} \\times ' + tx(T2, 2) + ' = ' + tx(k * T2, 3) + '$ eV.', 'Ratio: $' + tx(ratio, 3) + '$. Classically, almost no proton could ever get over.'],
        hint: 'Put both energies in eV, then divide.' };
    } else if (kind === 'Tclass') {
      var r3 = R.pick([1, 1.5, 2, 1.2]), avg = R.coin(), U3 = 1.44e6 / r3, Tn = avg ? 2 * U3 / (3 * k) : U3 / k;
      d = { r: r3, avg: avg, ans: Tn };
      p = { q: 'Without tunneling, two protons would need about the full Coulomb barrier at $' + r3 + '$ fm ($ke^2 = 1.44$ MeV·fm) to touch. At what temperature would ' + (avg ? 'the average kinetic energy $\\tfrac32kT$' : '$kT$') + ' equal that barrier? ($k = 8.617 \\times 10^{-5}$ eV/K.)',
        a: num(Tn), unit: 'K',
        steps: ['$U = 1.44/' + r3 + '$ MeV $= ' + tx(U3, 3) + '$ eV.', avg ? '$\\tfrac32kT = U$ gives $T = \\dfrac{2U}{3k}$.' : '$kT = U$ gives $T = U/k$.', '$T = ' + tx(Tn, 3) + '$ K, about a thousand times hotter than the Sun\'s core (15.7 million K).'],
        hint: 'Set the thermal energy equal to the barrier and solve for $T$.' };
    } else if (kind === 'gamow') {
      var pr2 = R.pick(pairs.slice(0, 2)), mr = pr2[1] * pr2[2] === 1 ? 469.1 : 749.6, alpha = 1 / 137.0, EG = 2 * mr * M.pow(M.PI * alpha * pr2[1] * pr2[2], 2) * 1000, E = R.int(1, 30), P = M.exp(-M.sqrt(EG / E));
      var askP = R.coin();
      d = { mr: mr, Z1: pr2[1], Z2: pr2[2], E: E, askP: askP, ans: askP ? P : EG };
      p = { q: 'The Gamow energy $E_G = 2m_rc^2(\\pi\\alpha Z_1Z_2)^2$ sets the tunneling probability, $P \\approx e^{-\\sqrt{E_G/E}}$. For ' + pr2[0] + ' (reduced mass $m_rc^2 = ' + td(mr, 1) + '$ MeV, $\\alpha = 1/137.0$), ' + (askP ? 'find $P$ at a collision energy of $E = ' + E + '$ keV.' : 'find $E_G$ in keV.'),
        a: num(askP ? P : EG, { rtol: 0.03 }), unit: askP ? undefined : 'keV',
        steps: ['$\\pi\\alpha Z_1Z_2 = \\pi \\times ' + (pr2[1] * pr2[2]) + '/137.0 = ' + td(M.PI * alpha * pr2[1] * pr2[2], 5) + '$.', '$E_G = 2 \\times ' + td(mr, 1) + '\\text{ MeV} \\times (' + td(M.PI * alpha * pr2[1] * pr2[2], 5) + ')^2 = ' + tx(EG / 1000, 3) + '$ MeV $= ' + tx(EG, 3) + '$ keV.'].concat(askP ? ['$P \\approx e^{-\\sqrt{' + tx(EG, 3) + '/' + E + '}} = e^{-' + td(M.sqrt(EG / E), 2) + '} = ' + tx(P, 3) + '$: tiny, but not zero.'] : []),
        hint: askP ? 'Compute $E_G$ first, in keV, then the exponent.' : 'Square $\\pi\\alpha Z_1Z_2$ and multiply by $2m_rc^2$.' };
      if (!askP) { /* unit set */ } else delete p.unit;
    } else { // dB: de Broglie estimate
      var pr3 = R.pick(pairs.slice(0, 3)), mr3 = pr3[3] * K.mp, ke2 = 2.31e-28, Tq = 4 * mr3 * M.pow(pr3[1] * pr3[2] * ke2, 2) / (3 * K.kB * K.h * K.h);
      d = { f: pr3[3], Z1: pr3[1], Z2: pr3[2], ans: Tq };
      p = { q: 'Quantum estimate: fusion becomes possible when a particle\'s de Broglie wavelength $h/p$ reaches the distance of closest approach $kZ_1Z_2e^2/E$. With $E = p^2/(2m_r) = \\tfrac32k_BT$ this gives $T = \\dfrac{4m_r(kZ_1Z_2e^2)^2}{3k_Bh^2}$. Evaluate it for ' + pr3[0] + ' ($m_r = ' + (pr3[3] === 0.5 ? '\\tfrac12' : pr3[3] === 0.8 ? '0.8' : '\\tfrac{12}{13}') + 'm_p$). ($ke^2 = 2.31 \\times 10^{-28}$ J·m, $m_p = 1.67 \\times 10^{-27}$ kg, $k_B = 1.38 \\times 10^{-23}$ J/K, $h = 6.63 \\times 10^{-34}$ J·s.)',
        a: num(Tq, { rtol: 0.03 }), unit: 'K',
        steps: ['$m_r = ' + tx(mr3, 3) + '$ kg and $kZ_1Z_2e^2 = ' + tx(pr3[1] * pr3[2] * ke2, 3) + '$ J·m.', '$T = \\dfrac{4 \\times ' + tx(mr3, 3) + ' \\times (' + tx(pr3[1] * pr3[2] * ke2, 3) + ')^2}{3 \\times 1.38 \\times 10^{-23} \\times (6.63 \\times 10^{-34})^2}$.', '$T \\approx ' + tx(Tq, 3) + '$ K' + (pr3[1] * pr3[2] === 1 ? ', close to the Sun\'s 15.7 million K: tunneling explains why the Sun can fuse at all.' : '; heavier, more highly charged nuclei need much hotter cores.')],
        hint: 'Set $h/\\sqrt{2m_rE}$ equal to $kZ_1Z_2e^2/E$ and solve for $E$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.energy-transport', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['N', 'N', 'concept'], ['time', 'ratio', 'N'], ['mfp', 'ell', 'time']));
    var id = 'astrophys.energy-transport', p, d;
    if (kind === 'N') {
      var ell = R.pick([1, 2, 5, 0.5, 0.6, 0.9, 2.5, 4]), D = R.pick([10, 20, 100, 1000, 50, 12, 40, 120, 400, 900]), unit = R.pick(['cm', 'm']), N = M.pow(D / ell, 2);
      d = { ell: ell, D: D, ans: N };
      p = { q: 'A photon random-walks in steps of $' + ell + '$ ' + unit + ' in random directions. About how many steps does it take to get $' + D + '$ ' + unit + ' from where it started?',
        a: num(N),
        steps: ['After $N$ random steps of length $\\ell$, the typical distance from the start is $\\sqrt{N}\\,\\ell$.', 'Set $\\sqrt{N}\\,\\ell = D$: $N = (D/\\ell)^2$.', '$N = (' + D + '/' + ell + ')^2 = ' + tx(N, 3) + '$ steps, not $' + tx(D / ell, 3) + '$.'],
        hint: 'Random steps add like the sides of a right triangle: distance grows as $\\sqrt{N}$.' };
    } else if (kind === 'time' || kind === 'ell') {
      var ell2 = R.pick([0.0005, 0.001, 0.002, 0.005, 0.01, 0.0006, 0.0009, 0.0025, 0.006, 0.009]), Rr = K.Rsun, t = Rr * Rr / (ell2 * K.c) / K.yr;
      if (kind === 'time') {
        d = { ell: ell2, ans: t };
        p = { q: 'If a photon in the Sun random-walks with a mean free path of $' + tx(ell2 * 1000, 2) + '$ mm all the way out, roughly how many years does it take to travel the Sun\'s radius? ($R_\\odot = 6.96 \\times 10^{8}$ m, $c = 3.00 \\times 10^{8}$ m/s, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
          a: num(t), unit: 'yr',
          steps: ['Steps needed: $N = (R/\\ell)^2$. Total path: $N\\ell = R^2/\\ell$. Time: $t = R^2/(\\ell c)$.', '$t = (6.96 \\times 10^{8})^2/(' + tx(ell2, 2) + ' \\times 3.00 \\times 10^{8}) = ' + tx(t * K.yr, 3) + '$ s.', '$t \\approx ' + tx(t, 3) + '$ years, against 2.3 seconds for a straight flight.'],
          hint: 'Time = total zigzag path length divided by $c$, with path $= R^2/\\ell$.' };
      } else {
        var tg = sig(t, 2), ellg = Rr * Rr / (tg * K.yr * K.c);
        d = { t: tg, ans: ellg * 1000 };
        p = { q: 'A model of the Sun says energy takes about $' + tx(tg, 2) + '$ years to random-walk from the center to the surface. What average mean free path does that imply, in millimeters? ($R_\\odot = 6.96 \\times 10^{8}$ m, $c = 3.00 \\times 10^{8}$ m/s, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
          a: num(ellg * 1000), unit: 'mm',
          steps: ['$t = R^2/(\\ell c)$, so $\\ell = R^2/(tc)$.', '$t = ' + tx(tg * K.yr, 3) + '$ s.', '$\\ell = ' + tx(ellg, 3) + '$ m $= ' + tx(ellg * 1000, 3) + '$ mm.'],
          hint: 'Rearrange $t = R^2/(\\ell c)$ for $\\ell$.' };
      }
    } else if (kind === 'ratio') {
      var ell3 = R.pick([0.001, 0.01, 0.0001, 0.002, 0.00012, 0.0005, 0.003, 0.009]), Rr3 = R.pick([1, 2, 0.5, 0.6, 0.8, 1.5]) * K.Rsun, ratio = Rr3 / ell3;
      d = { ell: ell3, R: Rr3 / K.Rsun, ans: ratio };
      p = { q: 'How many times longer does a random walk with mean free path $' + tx(ell3, 1) + '$ m take to cross a star of radius $' + td(Rr3 / K.Rsun, 1) + '\\,R_\\odot$ than a straight flight at the speed of light? ($R_\\odot = 6.96 \\times 10^{8}$ m.)',
        a: num(ratio),
        steps: ['Straight: $t_0 = R/c$. Random walk: $t = R^2/(\\ell c)$.', 'Ratio: $t/t_0 = R/\\ell$.', '$= ' + tx(Rr3, 3) + '/' + tx(ell3, 1) + ' = ' + tx(ratio, 3) + '$.'],
        hint: 'Divide $R^2/(\\ell c)$ by $R/c$.' };
    } else if (kind === 'mfp') {
      var ne = sig(rnd(R, 1e29, 1e32, 2), 2), ellm = 1 / (ne * K.sigmaT), N2 = M.pow(K.Rsun / ellm, 2), tt = K.Rsun * K.Rsun / (ellm * K.c) / K.yr;
      d = { ne: ne, ans: ellm * 1000 };
      p = { q: 'Photons in a star scatter off free electrons with cross-section $\\sigma_T = 6.65 \\times 10^{-29}$ m². If the electron density is $' + tx(ne, 2) + '$ m⁻³, what is the photon mean free path $\\ell = 1/(n_e\\sigma_T)$, in millimeters?',
        a: num(ellm * 1000), unit: 'mm',
        steps: ['A photon travels about $\\ell$ before it meets one electron\'s target area: $n_e\\sigma_T\\ell = 1$.', '$\\ell = 1/(' + tx(ne, 2) + ' \\times 6.65 \\times 10^{-29}) = ' + tx(ellm, 3) + '$ m.', '$\\ell = ' + tx(ellm * 1000, 3) + '$ mm. (A random walk this size across the Sun would take about $' + tx(tt, 2) + '$ years.)'],
        hint: 'Mean free path is one over (number density times cross-section).' };
    } else {
      var c = R.pick([
        ['In which part of the Sun does convection, rather than radiation, carry the energy outward?', 'The outer 30% of its radius, where the gas is cooler and more opaque and the temperature falls steeply.', ['The core, where the energy is made.', 'Only the corona, above the visible surface.', 'Nowhere: all of the Sun\'s energy moves by radiation.']],
        ['A photon made in the Sun\'s core escapes after a long random walk. Which statement is right?', 'Its energy takes on the order of 100,000 years to reach the surface, because it is absorbed and re-emitted countless times.', ['It reaches the surface in about 2 seconds, since it moves at the speed of light.', 'It reaches the surface in about 8 minutes, the light-travel time to Earth.', 'It never escapes; only neutrinos leave the core.']],
        ['When does convection take over from radiation in carrying a star\'s energy?', 'When the temperature would have to drop too steeply with height for radiation to carry the energy, so rising blobs of gas carry it instead.', ['Whenever the gas is hot enough to glow.', 'Only in stars that are shrinking.', 'Only where nuclear fusion is happening.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['In the radiative zone (about 0.25 to 0.7 of the Sun\'s radius) energy diffuses outward as photons are absorbed and re-emitted, a random walk that takes on the order of $10^{5}$ years.', 'Farther out the gas is cooler and more opaque; radiation would need a very steep temperature drop, so the gas churns instead: the convective zone, whose tops we see as granules on the surface.'],
        hint: 'Think about how hard it is for light to get through the gas.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.mass-luminosity', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['L', 'life', 'L'], ['M', 'ratio', 'life'], ['turnoff', 'exp', 'ratio']));
    var id = 'astrophys.mass-luminosity', p, d;
    if (kind === 'L') {
      var Ms = L === 1 ? R.pick([2, 3, 4, 5, 10, 0.5, 0.8, 0.6, 0.9, 1.2, 2.5, 3.5, 7, 9]) : R.real(0.5, 20, 1), Ls = M.pow(Ms, 3.5);
      d = { M: Ms, ans: Ls };
      p = { q: 'Using $L/L_\\odot \\approx (M/M_\\odot)^{3.5}$, what is the luminosity of a $' + td(Ms, 1) + '\\,M_\\odot$ main-sequence star?',
        a: num(Ls), unit: 'L☉',
        steps: ['$L = ' + td(Ms, 1) + '^{3.5}\\,L_\\odot$.', '$' + td(Ms, 1) + '^{3.5} = ' + td(Ms, 1) + '^3 \\times \\sqrt{' + td(Ms, 1) + '} = ' + tx(Ls, 3) + '$.', '$L \\approx ' + tx(Ls, 3) + '\\,L_\\odot$' + (Ms > 1 ? ', far more than ' + td(Ms, 1) + ' times the Sun.' : '.')],
        hint: 'Raise the mass ratio to the power 3.5.' };
    } else if (kind === 'life') {
      var M2 = L === 1 ? R.pick([2, 3, 5, 10, 0.5, 0.8, 1.5, 0.6, 0.9, 1.2, 3.5, 4, 7, 9]) : R.real(0.6, 25, 1), t = 10 * M.pow(M2, -2.5);
      d = { M: M2, ans: t };
      p = { q: 'A star lives on the main sequence for about $t \\approx 10\\text{ Gyr} \\times (M/M_\\odot)^{-2.5}$. How long does a $' + td(M2, 1) + '\\,M_\\odot$ star last?',
        a: num(t), unit: 'Gyr',
        steps: ['Lifetime $\\propto$ fuel/luminosity $\\propto M/M^{3.5} = M^{-2.5}$.', '$' + td(M2, 1) + '^{-2.5} = ' + tx(M.pow(M2, -2.5), 3) + '$.', '$t \\approx ' + tx(t, 3) + '$ Gyr' + (t < 1 ? ' $= ' + tx(t * 1000, 3) + '$ million years.' : '.')],
        hint: 'More fuel, but burned much faster.' };
    } else if (kind === 'M') {
      var L3 = rnd(R, 0.01, 1e5, 2), M3 = M.pow(L3, 1 / 3.5);
      d = { L: L3, ans: M3 };
      p = { q: 'A main-sequence star has $L = ' + tx(L3, 2) + '\\,L_\\odot$. Estimate its mass from $L \\propto M^{3.5}$.',
        a: num(M3), unit: 'M☉',
        steps: ['$M/M_\\odot = (L/L_\\odot)^{1/3.5}$.', '$= (' + tx(L3, 2) + ')^{0.286}$.', '$M \\approx ' + tx(M3, 3) + '\\,M_\\odot$.'],
        hint: 'Take the 3.5th root.' };
    } else if (kind === 'ratio') {
      var a = R.pick([0.5, 1, 2, 3, 0.6, 0.8, 1.2, 2.5]), b = a * R.pick([2, 3, 4, 5, 10, 6, 7, 8, 9]), r = M.pow(b / a, 2.5);
      d = { a: a, b: b, ans: r };
      p = { q: 'How many times longer does a $' + td(a, 1) + '\\,M_\\odot$ star stay on the main sequence than a $' + td(b, 1) + '\\,M_\\odot$ star? (Use $t \\propto M^{-2.5}$.)',
        a: num(r),
        steps: ['$t_1/t_2 = (M_1/M_2)^{-2.5} = (M_2/M_1)^{2.5}$.', '$= (' + td(b / a, 1) + ')^{2.5}$.', '$= ' + tx(r, 3) + '$: the lighter star wins by a wide margin.'],
        hint: 'Write the ratio and flip the negative power.' };
    } else if (kind === 'turnoff') {
      var age = R.pick([0.1, 0.5, 1, 2, 4, 6, 12, 0.05, 0.02, 0.025, 0.06, 0.09, 0.2, 0.4, 0.9, 2.5, 5, 10]), Mt = M.pow(age / 10, -0.4);
      d = { age: age, ans: Mt };
      p = { q: 'A star cluster is $' + tx(age, 2) + '$ billion years old. Using $t \\approx 10\\text{ Gyr}\\,(M/M_\\odot)^{-2.5}$, what is the mass of the stars just leaving the main sequence now (the turnoff mass)?',
        a: num(Mt), unit: 'M☉',
        steps: ['Stars at the turnoff have lifetimes equal to the cluster\'s age: $' + tx(age, 2) + ' = 10\\,M^{-2.5}$.', '$M^{-2.5} = ' + tx(age / 10, 3) + '$, so $M = (' + tx(age / 10, 3) + ')^{-0.4}$.', '$M \\approx ' + tx(Mt, 3) + '\\,M_\\odot$.'],
        hint: 'Set the lifetime equal to the age and solve for $M$.' };
    } else { // exp
      var a2 = R.pick([3, 3.5, 4, 2.5, 4.5]), e = 1 - a2;
      d = { a: a2, ans: e };
      p = { q: 'Suppose stars in some mass range follow $L \\propto M^{' + a2 + '}$, and each burns a fixed fraction of its mass. Lifetime then goes as $M^x$. What is $x$?',
        a: { t: 'num', v: plain(e), tol: 0.001 },
        steps: ['Lifetime $\\propto$ fuel/luminosity.', '$t \\propto M/M^{' + a2 + '} = M^{1 - ' + a2 + '}$.', '$x = ' + td(e, 1) + '$.'],
        hint: 'Divide the fuel ($\\propto M$) by the luminosity.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.eddington-limit', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['minM', 'ratio', 'minM'], ['Ledd', 'ratio', 'quasar'], ['force', 'quasar', 'Ledd']));
    var id = 'astrophys.eddington-limit', p, d, CE = 4 * M.PI * K.G * K.mp * K.c / K.sigmaT; // W per kg
    var GV = '$G = 6.67 \\times 10^{-11}$, $m_p = 1.67 \\times 10^{-27}$ kg, $c = 3.00 \\times 10^{8}$ m/s, $\\sigma_T = 6.65 \\times 10^{-29}$ m², $M_\\odot = 1.99 \\times 10^{30}$ kg';
    if (kind === 'Ledd') {
      var Ms = R.real(1, 150, 0), LE = CE * Ms * K.Msun;
      d = { M: Ms, ans: LE };
      p = { q: 'Find the Eddington luminosity $L_{\\text{Edd}} = 4\\pi GMm_pc/\\sigma_T$ for a star of $' + Ms + '\\,M_\\odot$, in watts. (' + GV + '.)',
        a: num(LE), unit: 'W',
        steps: ['Radiation pushing on electrons ($\\sigma_TL/4\\pi r^2c$) balances gravity on protons ($GMm_p/r^2$); $r^2$ cancels.', '$4\\pi Gm_pc/\\sigma_T = ' + tx(CE, 3) + '$ W per kg.', '$L_{\\text{Edd}} = ' + tx(CE, 3) + ' \\times ' + tx(Ms * K.Msun, 3) + ' = ' + tx(LE, 3) + '$ W (about $' + tx(LE / K.Lsun, 2) + '\\,L_\\odot$).'],
        hint: 'Set radiation force on an electron equal to gravity on a proton.' };
    } else if (kind === 'minM') {
      var Lx = sig(rnd(R, 1e5, 5e6, 2), 2), Mmin = Lx / 3.3e4;
      d = { L: Lx, ans: Mmin };
      p = { q: 'A star shines with $' + tx(Lx, 2) + '\\,L_\\odot$. Using $L_{\\text{Edd}} \\approx 3.3 \\times 10^{4}\\,(M/M_\\odot)\\,L_\\odot$, what is the least mass it can have without blowing off its outer layers?',
        a: num(Mmin), unit: 'M☉',
        steps: ['Stability needs $L \\le L_{\\text{Edd}} = 3.3 \\times 10^{4}\\,(M/M_\\odot)\\,L_\\odot$.', 'So $M \\ge L/(3.3 \\times 10^{4})$ in solar units.', '$M \\ge ' + tx(Lx, 2) + '/3.3 \\times 10^{4} = ' + tx(Mmin, 3) + '\\,M_\\odot$.'],
        hint: 'Solve $L = L_{\\text{Edd}}$ for $M$.' };
    } else if (kind === 'ratio') {
      var M2 = R.pick([20, 40, 60, 80, 100, 150]), L2 = sig(M2 * 3.3e4 * R.real(0.1, 0.9, 2), 2), rr = L2 / (3.3e4 * M2);
      d = { M: M2, L: L2, ans: rr };
      p = { q: 'A $' + M2 + '\\,M_\\odot$ star has $L = ' + tx(L2, 2) + '\\,L_\\odot$. What fraction of its Eddington luminosity is that? ($L_{\\text{Edd}} \\approx 3.3 \\times 10^{4}\\,(M/M_\\odot)\\,L_\\odot$.)',
        a: num(rr),
        steps: ['$L_{\\text{Edd}} = 3.3 \\times 10^{4} \\times ' + M2 + ' = ' + tx(3.3e4 * M2, 3) + '\\,L_\\odot$.', '$L/L_{\\text{Edd}} = ' + tx(L2, 2) + '/' + tx(3.3e4 * M2, 3) + '$.', '$= ' + tx(rr, 3) + '$. ' + (rr > 0.5 ? 'Close to the limit: such stars drive strong winds.' : 'Safely below the limit.')],
        hint: 'Work out $L_{\\text{Edd}}$ for this mass, then divide.' };
    } else if (kind === 'quasar') {
      var LW = sig(rnd(R, 1e38, 1e41, 2), 2), Mq = LW / CE / K.Msun;
      d = { L: LW, ans: Mq };
      p = { q: 'A quasar radiates $' + tx(LW, 2) + '$ W. If it shines at or below the Eddington limit, what is the smallest mass its central black hole can have, in solar masses? (' + GV + '.)',
        a: num(Mq), unit: 'M☉',
        steps: ['$L \\le L_{\\text{Edd}} = 4\\pi GMm_pc/\\sigma_T$, so $M \\ge \\dfrac{L\\sigma_T}{4\\pi Gm_pc}$.', '$4\\pi Gm_pc/\\sigma_T = ' + tx(CE, 3) + '$ W/kg, so $M \\ge ' + tx(LW, 2) + '/' + tx(CE, 3) + ' = ' + tx(LW / CE, 3) + '$ kg.', '$M \\ge ' + tx(Mq, 3) + '\\,M_\\odot$.'],
        hint: 'Solve $L_{\\text{Edd}} = L$ for $M$.' };
    } else { // force ratio
      var M5 = R.real(5, 100, 0), L5 = sig(rnd(R, 1e4, 3e6, 2), 2), rAU = R.pick([0.1, 1, 10]), Frad = K.sigmaT * L5 * K.Lsun / (4 * M.PI * M.pow(rAU * K.AU, 2) * K.c), Fg = K.G * M5 * K.Msun * K.mp / M.pow(rAU * K.AU, 2), ratio = Frad / Fg;
      d = { M: M5, L: L5, r: rAU, ans: ratio };
      p = { q: 'At $' + rAU + '$ AU from a star of $' + M5 + '\\,M_\\odot$ and $' + tx(L5, 2) + '\\,L_\\odot$, compare the radiation force on a free electron, $\\sigma_TL/(4\\pi r^2c)$, with the gravitational force on a proton. Find $F_{\\text{rad}}/F_{\\text{grav}}$. (' + GV + ', $L_\\odot = 3.83 \\times 10^{26}$ W, $1\\text{ AU} = 1.496 \\times 10^{11}$ m.)',
        a: num(ratio),
        steps: ['$F_{\\text{rad}}/F_{\\text{grav}} = \\dfrac{\\sigma_TL/(4\\pi r^2c)}{GMm_p/r^2} = \\dfrac{\\sigma_TL}{4\\pi GMm_pc}$: the distance cancels.', '$\\sigma_TL = ' + tx(K.sigmaT * L5 * K.Lsun, 3) + '$; $4\\pi GMm_pc = ' + tx(4 * M.PI * K.G * M5 * K.Msun * K.mp * K.c, 3) + '$.', 'Ratio $= ' + tx(ratio, 3) + '$' + (ratio > 1 ? ': above 1, radiation would blow the gas away.' : ': below 1, gravity wins.')],
        hint: 'Write both forces; notice that $r^2$ cancels.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.solar-neutrinos', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['rate', 'time', 'concept', 'rate'], ['flux', 'thumb', 'concept', 'rate'], ['thumb', 'flux', 'concept', 'time']));
    var id = 'astrophys.solar-neutrinos', p, d, E1 = 26.7 * K.MeV;
    if (kind === 'rate') {
      var Ls = L === 1 ? R.pick([0.5, 2, 10, 4, 0.1, 0.12, 0.35, 0.9, 3.5, 9]) : rnd(R, 0.01, 1e5, 2), rate = 2 * Ls * K.Lsun / E1;
      d = { L: Ls, ans: rate };
      p = { q: 'Each completed proton–proton chain releases $26.7$ MeV and two neutrinos. How many neutrinos per second does a star of $' + tx(Ls, 2) + '\\,L_\\odot$ give off? ($L_\\odot = 3.83 \\times 10^{26}$ W, $1\\text{ MeV} = 1.602 \\times 10^{-13}$ J.)',
        a: num(rate), unit: 'per second',
        steps: ['Chains per second $= L/(26.7\\text{ MeV}) = ' + tx(Ls * K.Lsun, 3) + '/' + tx(E1, 3) + ' = ' + tx(rate / 2, 3) + '$.', 'Two neutrinos each: $' + tx(rate, 3) + '$ neutrinos per second.'],
        hint: 'Count reactions per second, then neutrinos per reaction.' };
      delete p.unit;
    } else if (kind === 'flux' || kind === 'thumb') {
      var rateS = 2 * K.Lsun / E1, F = rateS / (4 * M.PI * K.AU * K.AU), A = R.pick([1, 2, 1.5, 0.5, 3, 4, 5, 10, 0.6, 0.7, 0.9, 1.2, 3.5, 6, 8, 9]), dAU = kind === 'flux' ? R.pick([1, 5.2, 0.39, 1.52, 9.58, 30.1, 0.72, 19.2]) : 1, Fd = F / (dAU * dAU);
      var ans = kind === 'flux' ? Fd : F * 1e-4 * A;
      d = { d: dAU, A: kind === 'thumb' ? A : undefined, ans: ans };
      p = { q: kind === 'flux' ? 'The Sun gives off about $' + tx(rateS, 3) + '$ neutrinos per second. How many cross each square meter per second at $' + dAU + '$ AU from the Sun? ($1\\text{ AU} = 1.496 \\times 10^{11}$ m.)' : 'The Sun gives off about $' + tx(rateS, 3) + '$ neutrinos per second. How many pass through a $' + A + '$ cm² patch of your skin (facing the Sun) each second? ($1\\text{ AU} = 1.496 \\times 10^{11}$ m.)',
        a: num(ans), unit: kind === 'flux' ? 'per m² per second' : 'per second',
        steps: ['Spread over a sphere: $F = N/(4\\pi d^2)$.', '$4\\pi d^2 = 4\\pi(' + tx(dAU * K.AU, 3) + ')^2 = ' + tx(4 * M.PI * M.pow(dAU * K.AU, 2), 3) + '$ m².'].concat(kind === 'flux' ? ['$F = ' + tx(Fd, 3) + '$ per m² per second.'] : ['$F = ' + tx(F, 3) + '$ per m² per s $= ' + tx(F * 1e-4, 3) + '$ per cm² per s.', 'Through $' + A + '$ cm²: $' + tx(ans, 3) + '$ per second, day and night, since they pass through Earth too.']),
        hint: 'Divide by the area of a sphere with radius equal to the distance.' };
      delete p.unit;
    } else if (kind === 'time') {
      var pl = R.pick([['Earth', 1], ['Mercury', 0.387], ['Venus', 0.723], ['Mars', 1.52], ['Jupiter', 5.20], ['Saturn', 9.58], ['Neptune', 30.1]]), dm = pl[1] * K.AU, t = dm / K.c / 60;
      d = { dAU: pl[1], ans: t };
      p = { q: 'Neutrinos made in the Sun\'s core fly out almost at the speed of light, unhindered. How many minutes after they are made do they reach ' + pl[0] + ', ' + (pl[1] === 1 ? '1 AU' : pl[1] + ' AU') + ' from the Sun? ($1\\text{ AU} = 1.496 \\times 10^{11}$ m, $c = 3.00 \\times 10^{8}$ m/s.)',
        a: num(t), unit: 'min',
        steps: ['$t = d/c = ' + tx(dm, 3) + '/3.00 \\times 10^{8}$ s.', '$= ' + tx(t * 60, 3) + '$ s $= ' + tx(t, 3) + '$ min.', 'Sunlight\'s energy, by contrast, spent on the order of $10^{5}$ years random-walking out of the interior first.'],
        hint: 'Distance divided by the speed of light.' };
    } else {
      var c = R.pick([
        ['Why can neutrinos from the Sun\'s core reach Earth directly, when light cannot?', 'Neutrinos interact so weakly with matter that almost all of them pass straight through the Sun (and Earth).', ['Neutrinos are faster than light.', 'Neutrinos are made at the surface, not in the core.', 'The Sun is transparent to every kind of particle.']],
        ['The "solar neutrino problem" was that early detectors found only about a third of the expected electron neutrinos. How was it resolved?', 'Neutrinos change flavor on the way: some electron neutrinos become muon and tau neutrinos, which those detectors could not see. The total matches the solar models.', ['The Sun turned out to be fusing much more slowly than models said.', 'The Sun\'s core was found to be much cooler than expected.', 'The missing neutrinos are absorbed by the Sun\'s outer layers.']],
        ['What do solar neutrino detectors tell us that sunlight cannot?', 'What fusion in the core is doing now, about 8 minutes ago, rather than what it was doing long ago.', ['The temperature of the Sun\'s corona.', 'The composition of the Sun\'s surface layers.', 'The speed of the solar wind.']],
        ['Which experiment showed in 2001–2002 that the total number of solar neutrinos of all flavors matches the solar models?', 'The Sudbury Neutrino Observatory (SNO) in Canada, using heavy water.', ['The Homestake chlorine experiment in South Dakota.', 'The LIGO observatories.', 'The Hubble Space Telescope.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['Neutrinos feel only the weak force, so they leave the core within seconds and reach Earth about 8 minutes later, carrying news of fusion as it happens.', 'Raymond Davis\'s Homestake experiment (from the late 1960s) saw about a third of the predicted electron neutrinos. Super-Kamiokande (1998) and SNO (2001–2002) showed that neutrinos oscillate between flavors and so have mass; SNO measured the full flux, in agreement with the solar models.'],
        hint: 'Neutrinos feel only the weak force.' };
    }
    return chk(id, d, p, kind);
  });

  // =====================================================================================================
  // Unit 4. Stellar Evolution and Compact Objects
  // =====================================================================================================

  G('astrophys.evolution-tracks', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['direction', 'order', 'radius'], ['radius', 'turnoff', 'direction'], ['giantR', 'young', 'turnoff']));
    var id = 'astrophys.evolution-tracks', p, d;
    if (kind === 'radius') {
      var L1 = R.pick([1, 2, 5, 10, 50, 1.2, 3.5, 8, 20, 40]), T1 = sig(R.int(4500, 9000), 2), f = R.pick([3, 10, 20, 50, 100, 3.5, 7, 15, 40, 90]), L2 = L1 * f, T2 = sig(T1 * R.real(0.5, 0.9, 2), 2), rr = M.sqrt(L2 / L1) * M.pow(T1 / T2, 2);
      d = { L1: L1, T1: T1, L2: L2, T2: T2, ans: rr };
      p = { q: 'A star leaves the main sequence at $L = ' + tx(L1, 2) + '\\,L_\\odot$, $T = ' + tx(T1, 2) + '$ K and later sits at $L = ' + tx(L2, 2) + '\\,L_\\odot$, $T = ' + tx(T2, 2) + '$ K. By what factor has its radius grown?',
        a: num(rr),
        steps: ['$L \\propto R^2T^4$, so $R_2/R_1 = \\sqrt{L_2/L_1}\\,(T_1/T_2)^2$.', '$\\sqrt{' + tx(L2 / L1, 3) + '} = ' + tx(M.sqrt(L2 / L1), 3) + '$; $(' + tx(T1, 2) + '/' + tx(T2, 2) + ')^2 = ' + tx(M.pow(T1 / T2, 2), 3) + '$.', '$R_2/R_1 = ' + tx(rr, 3) + '$: moving up and to the right on the H–R diagram means swelling.'],
        hint: 'Use $L \\propto R^2T^4$ for both points and divide.' };
    } else if (kind === 'giantR') {
      var Lg = R.pick([300, 1000, 2000, 2500, 3000, 350, 500, 700, 900, 1500]), Tg = sig(R.int(2900, 4000), 2), Rg = M.sqrt(Lg) * M.pow(5772 / Tg, 2), au = Rg * 6.96e8 / 1.496e11;
      d = { L: Lg, T: Tg, ans: au };
      p = { q: 'Near the top of its red-giant branch, a Sun-like star reaches about $L = ' + tx(Lg, 2) + '\\,L_\\odot$ with $T = ' + tx(Tg, 2) + '$ K. What is its radius in AU? ($T_\\odot = 5772$ K, $R_\\odot = 6.96 \\times 10^{8}$ m, $1\\text{ AU} = 1.496 \\times 10^{11}$ m.)',
        a: num(au), unit: 'AU',
        steps: ['$R/R_\\odot = \\sqrt{L/L_\\odot}\\,(T_\\odot/T)^2 = \\sqrt{' + tx(Lg, 2) + '} \\times (5772/' + tx(Tg, 2) + ')^2 = ' + tx(Rg, 3) + '$.', '$R = ' + tx(Rg, 3) + ' \\times 6.96 \\times 10^{8}\\text{ m} = ' + tx(Rg * 6.96e8, 3) + '$ m.', '$R = ' + tx(au, 3) + '$ AU, ' + (au > 0.72 ? 'past the orbit of Venus (0.72 AU).' : au > 0.39 ? 'past the orbit of Mercury (0.39 AU).' : 'inside the orbit of Mercury (0.39 AU).')],
        hint: 'Find $R/R_\\odot$ from $L$ and $T$, then convert.' };
    } else if (kind === 'turnoff') {
      var Lt = R.pick([1, 3, 10, 30, 100, 300, 1000, 1.2, 4, 12, 40, 90, 400, 900]) * R.pick([1, 2]), Mt = M.pow(Lt, 1 / 3.5), age = 10 * M.pow(Mt, -2.5);
      d = { L: Lt, ans: age };
      p = { q: 'The brightest main-sequence stars left in a star cluster have $L \\approx ' + tx(Lt, 2) + '\\,L_\\odot$. Using $L \\propto M^{3.5}$ and lifetime $10\\text{ Gyr} \\times (M/M_\\odot)^{-2.5}$, estimate the cluster\'s age in billions of years.',
        a: num(age), unit: 'Gyr',
        steps: ['Turnoff mass: $M = L^{1/3.5} = (' + tx(Lt, 2) + ')^{0.286} = ' + tx(Mt, 3) + '\\,M_\\odot$.', 'Those stars are just ending their main-sequence lives, so the cluster\'s age equals their lifetime.', '$t = 10 \\times ' + tx(Mt, 3) + '^{-2.5} = ' + tx(age, 3) + '$ Gyr.'],
        hint: 'Turn the turnoff luminosity into a mass, then into a lifetime.' };
    } else if (kind === 'young') {
      var f0 = R.pick([0.7, 0.7, 0.72, 0.75]), A = 0.3, T0 = 255 * M.pow(f0, 0.25);
      d = { f: f0, ans: T0 };
      p = { q: 'As hydrogen turns to helium, a main-sequence star\'s core contracts and heats, so its luminosity slowly rises. Models say the young Sun had about $' + Math.round(f0 * 100) + '\\%$ of today\'s luminosity. If Earth\'s equilibrium temperature is $255$ K today, what was it then (same albedo)?',
        a: num(T0), unit: 'K',
        steps: ['Equilibrium temperature goes as $L^{1/4}$.', '$T = 255\\text{ K} \\times (' + td(f0, 2) + ')^{1/4} = 255 \\times ' + td(M.pow(f0, 0.25), 3) + '$.', '$T \\approx ' + tx(T0, 3) + '$ K. (Earth nonetheless had liquid water then, the "faint young Sun" puzzle, probably answered by a stronger greenhouse effect.)'],
        hint: '$T \\propto L^{1/4}$ at a fixed distance.' };
    } else if (kind === 'order') {
      var right = 'main sequence → red giant → helium burning (horizontal branch or red clump) → asymptotic giant → planetary nebula and white dwarf';
      d = { ans: right };
      p = { q: 'Which order of stages is right for a star like the Sun after it forms?',
        a: mc(R, right, ['red giant → main sequence → white dwarf → planetary nebula → helium burning', 'main sequence → white dwarf → red giant → supernova → neutron star', 'main sequence → red supergiant → supernova → black hole']),
        steps: ['Core hydrogen runs out: the core contracts and heats, hydrogen burns in a shell, and the envelope swells into a red giant.', 'Helium ignites in the core (for a Sun-like star, in a flash), and the star settles as a smaller helium-burning star; when core helium runs out it climbs the asymptotic giant branch.', 'It sheds its envelope as a planetary nebula, leaving the hot core as a white dwarf. Only stars above about 8 solar masses end in supernovae.'],
        hint: 'Low-mass stars never explode; their cores end as white dwarfs.' };
    } else { // direction
      var cases = [
        ['A star\'s envelope swells and cools while its luminosity stays about the same (as after core hydrogen runs out in a massive star).', 'to the right (toward cooler temperatures)', ['to the left (toward hotter temperatures)', 'straight up', 'straight down']],
        ['A red giant grows larger and more luminous while its surface temperature drops a little.', 'up and slightly to the right', ['down and to the left', 'straight down', 'to the left along the main sequence']],
        ['A planetary nebula has been shed, and the exposed hot core fades as it cools.', 'down and to the right, along the white-dwarf cooling track (after first moving left)', ['up the main sequence', 'up and to the right', 'straight to the left']],
        ['A protostar shrinks at nearly constant surface temperature as it contracts toward the main sequence.', 'down (lower luminosity, nearly the same temperature)', ['up (higher luminosity)', 'to the right', 'along the main sequence']]];
      var c = R.pick(cases);
      d = { ans: c[1] };
      p = { q: c[0] + ' Which way does it move on the H–R diagram (luminosity up, temperature decreasing to the right)?',
        a: mc(R, c[1], c[2]),
        steps: ['On the H–R diagram, luminosity increases upward and temperature increases to the <b>left</b>.', 'Cooler means moving right; more luminous means moving up. Since $L = 4\\pi R^2\\sigma T^4$, moving right at constant $L$ means the star is growing.', 'So the star moves ' + c[1] + '.'],
        hint: 'Remember that temperature increases to the left.' };
    }
    return chk(id, d, p, kind);
  });

  var HB = 1.055e-34, ME = 9.11e-31;
  G('astrophys.degeneracy-pressure', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['ne', 'scale', 'ne'], ['pF', 'P', 'scale'], ['ratio', 'EF', 'P']));
    var id = 'astrophys.degeneracy-pressure', p, d, GV = '$\\hbar = 1.055 \\times 10^{-34}$ J·s, $m_e = 9.11 \\times 10^{-31}$ kg';
    var rho = sig(rnd(R, 1e7, 1e10, 2), 2), mue = 2, ne = rho / (mue * K.mp);
    if (kind === 'ne') {
      d = { rho: rho, ans: ne };
      p = { q: 'Matter in a white dwarf made of carbon and oxygen has two nucleons for every electron ($\\mu_e = 2$). How many electrons per cubic meter are there at a density of $' + tx(rho, 2) + '$ kg/m³? ($m_p = 1.67 \\times 10^{-27}$ kg.)',
        a: num(ne), unit: 'per cubic meter',
        steps: ['Each electron comes with mass $\\mu_e m_p = 2 \\times 1.67 \\times 10^{-27} = 3.34 \\times 10^{-27}$ kg.', '$n_e = \\rho/(\\mu_e m_p) = ' + tx(rho, 2) + '/3.34 \\times 10^{-27}$.', '$n_e = ' + tx(ne, 3) + '$ m⁻³.'],
        hint: 'Divide the density by the mass that goes with each electron.' };
      delete p.unit;
    } else if (kind === 'scale') {
      var f = R.pick([2, 3, 4, 8, 10, 0.5]), r = M.pow(f, 5 / 3);
      d = { f: f, ans: r };
      p = { q: 'For nonrelativistic degenerate electrons, $P \\propto n_e^{5/3}$. If a white dwarf\'s matter is squeezed to $' + td(f, 1) + '$ times its density, by what factor does the degeneracy pressure change?',
        a: num(r),
        steps: ['$P_2/P_1 = (n_2/n_1)^{5/3}$.', '$= ' + td(f, 1) + '^{5/3}$.', '$= ' + tx(r, 3) + '$, with no change in temperature needed.'],
        hint: 'Raise the density ratio to the 5/3 power.' };
    } else if (kind === 'pF') {
      var pF = HB * M.pow(3 * M.PI * M.PI * ne, 1 / 3), x = pF / (ME * K.c), askx = R.coin();
      d = { rho: rho, askx: askx, ans: askx ? x : pF };
      p = { q: 'In white-dwarf matter at $' + tx(rho, 2) + '$ kg/m³ ($\\mu_e = 2$, so $n_e = \\rho/(2m_p)$), electrons fill every state up to the Fermi momentum $p_F = \\hbar(3\\pi^2n_e)^{1/3}$. ' + (askx ? 'Find $p_F/(m_ec)$, which says how relativistic they are.' : 'Find $p_F$.') + ' (' + GV + ', $m_p = 1.67 \\times 10^{-27}$ kg' + (askx ? ', $c = 3.00 \\times 10^{8}$ m/s' : '') + '.)',
        a: num(askx ? x : pF), unit: askx ? undefined : 'kg·m/s',
        steps: ['$n_e = ' + tx(rho, 2) + '/(3.34 \\times 10^{-27}) = ' + tx(ne, 3) + '$ m⁻³.', '$(3\\pi^2n_e)^{1/3} = ' + tx(M.pow(3 * M.PI * M.PI * ne, 1 / 3), 3) + '$ m⁻¹, so $p_F = ' + tx(pF, 3) + '$ kg·m/s.'].concat(askx ? ['$m_ec = ' + tx(ME * K.c, 3) + '$ kg·m/s, so $p_F/(m_ec) = ' + tx(x, 3) + '$' + (x > 0.5 ? ': the fastest electrons move at a good fraction of $c$.' : ': still mostly nonrelativistic.')] : []),
        hint: 'First the electron density, then $\\hbar$ times the cube root.' };
      if (askx) delete p.unit;
    } else if (kind === 'P') {
      var ne2 = sig(rnd(R, 1e33, 1e36, 2), 2), Pd = M.pow(3 * M.PI * M.PI, 2 / 3) * HB * HB * M.pow(ne2, 5 / 3) / (5 * ME);
      d = { ne: ne2, ans: Pd };
      p = { q: 'Find the pressure of cold, nonrelativistic degenerate electrons at $n_e = ' + tx(ne2, 2) + '$ m⁻³, using $P = \\dfrac{(3\\pi^2)^{2/3}\\hbar^2}{5m_e}\\,n_e^{5/3}$. (' + GV + '.)',
        a: num(Pd), unit: 'Pa',
        steps: ['$(3\\pi^2)^{2/3} = ' + td(M.pow(3 * M.PI * M.PI, 2 / 3), 3) + '$ and $\\hbar^2/(5m_e) = ' + tx(HB * HB / (5 * ME), 3) + '$ J·m².', '$n_e^{5/3} = (' + tx(ne2, 2) + ')^{5/3} = ' + tx(M.pow(ne2, 5 / 3), 3) + '$ m⁻⁵.', '$P = ' + tx(Pd, 3) + '$ Pa, whatever the temperature.'],
        hint: 'Work out the three factors separately in SI units.' };
    } else if (kind === 'ratio') {
      var ne3 = sig(rnd(R, 1e34, 1e36, 2), 2), T3 = sig(rnd(R, 5e6, 3e7, 2), 2), Pd3 = M.pow(3 * M.PI * M.PI, 2 / 3) * HB * HB * M.pow(ne3, 5 / 3) / (5 * ME), Pt = ne3 * K.kB * T3, rr = Pd3 / Pt;
      d = { ne: ne3, T: T3, ans: rr };
      p = { q: 'Inside a white dwarf, $n_e = ' + tx(ne3, 2) + '$ m⁻³ and $T = ' + tx(T3, 2) + '$ K. Compare the electrons\' degeneracy pressure, $P = \\dfrac{(3\\pi^2)^{2/3}\\hbar^2}{5m_e}n_e^{5/3}$, with the ideal-gas pressure they would have, $n_ekT$. Find the ratio. (' + GV + ', $k = 1.38 \\times 10^{-23}$ J/K.)',
        a: num(rr),
        steps: ['Degeneracy pressure: $P_{\\text{deg}} = ' + tx(Pd3, 3) + '$ Pa.', 'Thermal: $n_ekT = ' + tx(ne3, 2) + ' \\times 1.38 \\times 10^{-23} \\times ' + tx(T3, 2) + ' = ' + tx(Pt, 3) + '$ Pa.', 'Ratio: $' + tx(rr, 3) + '$. ' + (rr > 1 ? 'Degeneracy wins: heat is not what holds the star up.' : 'At this low density the thermal pressure still matters.')],
        hint: 'Compute each pressure, then divide.' };
    } else { // EF
      var ne4 = sig(rnd(R, 1e33, 1e36, 2), 2), T4 = sig(rnd(R, 1e6, 3e7, 2), 2), pF4 = HB * M.pow(3 * M.PI * M.PI * ne4, 1 / 3), EF = pF4 * pF4 / (2 * ME), rr4 = EF / (K.kB * T4);
      d = { ne: ne4, T: T4, ans: rr4 };
      p = { q: 'Electrons are degenerate when their Fermi energy $E_F = p_F^2/(2m_e)$, with $p_F = \\hbar(3\\pi^2n_e)^{1/3}$, is much larger than $kT$. For $n_e = ' + tx(ne4, 2) + '$ m⁻³ and $T = ' + tx(T4, 2) + '$ K, find $E_F/kT$. (' + GV + ', $k = 1.38 \\times 10^{-23}$ J/K.)',
        a: num(rr4),
        steps: ['$p_F = ' + tx(pF4, 3) + '$ kg·m/s.', '$E_F = p_F^2/(2m_e) = ' + tx(EF, 3) + '$ J; $kT = ' + tx(K.kB * T4, 3) + '$ J.', '$E_F/kT = ' + tx(rr4, 3) + '$' + (rr4 > 10 ? ': strongly degenerate.' : rr4 > 1 ? ': partly degenerate.' : ': not degenerate; an ordinary gas.')],
        hint: 'Find $p_F$, then $E_F$, then compare with $kT$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.white-dwarf-mass-radius', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['scale', 'density', 'scale'], ['density', 'g', 'volume'], ['gamma', 'g', 'scale']));
    var id = 'astrophys.white-dwarf-mass-radius', p, d;
    if (kind === 'scale') {
      var M1 = R.pick([0.4, 0.5, 0.6, 0.7]), R1 = sig(8700 * M.pow(M1 / 0.6, -1 / 3), 2), M2 = R.pick([0.2, 0.3, 0.9, 1.0, 1.2, 0.25, 0.4, 0.5, 0.6, 0.8]), R2 = R1 * M.pow(M2 / M1, -1 / 3);
      d = { M1: M1, R1: R1, M2: M2, ans: R2 };
      p = { q: 'A $' + td(M1, 1) + '\\,M_\\odot$ white dwarf has a radius of $' + tx(R1, 2) + '$ km. Using $R \\propto M^{-1/3}$, estimate the radius of a $' + td(M2, 1) + '\\,M_\\odot$ white dwarf.',
        a: num(R2), unit: 'km',
        steps: ['$R_2 = R_1(M_2/M_1)^{-1/3}$.', '$(' + td(M2, 1) + '/' + td(M1, 1) + ')^{-1/3} = ' + td(M.pow(M2 / M1, -1 / 3), 3) + '$.', '$R_2 = ' + tx(R1, 2) + ' \\times ' + td(M.pow(M2 / M1, -1 / 3), 3) + ' = ' + tx(R2, 3) + '$ km: ' + (M2 > M1 ? 'heavier, so smaller.' : 'lighter, so larger.') + (M2 >= 1 ? ' (Near the Chandrasekhar limit real white dwarfs shrink even faster than this.)' : '')],
        hint: 'More mass, smaller radius: $R \\propto M^{-1/3}$.' };
    } else if (kind === 'density') {
      var Mw = R.pick([0.5, 0.6, 0.7, 1.0, 0.8, 0.9]), Rk = sig(8700 * M.pow(Mw / 0.6, -1 / 3) * R.real(0.9, 1.1, 2), 2), rho = Mw * K.Msun / (4 / 3 * M.PI * cube(Rk * 1e3)), tsp = R.coin();
      d = { M: Mw, R: Rk, tsp: tsp, ans: tsp ? rho * 5e-6 : rho };
      p = { q: 'A white dwarf has $' + td(Mw, 1) + '\\,M_\\odot$ packed into a radius of $' + tx(Rk, 2) + '$ km. ' + (tsp ? 'What would a teaspoon (5 cm³) of its average matter weigh in kilograms?' : 'What is its mean density?') + ' ($M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(tsp ? rho * 5e-6 : rho), unit: tsp ? 'kg' : 'kg/m³',
        steps: ['Volume: $\\tfrac43\\pi R^3 = \\tfrac43\\pi(' + tx(Rk * 1e3, 2) + '\\text{ m})^3 = ' + tx(4 / 3 * M.PI * cube(Rk * 1e3), 3) + '$ m³.', '$\\bar\\rho = ' + tx(Mw * K.Msun, 3) + '/' + tx(4 / 3 * M.PI * cube(Rk * 1e3), 3) + ' = ' + tx(rho, 3) + '$ kg/m³.'].concat(tsp ? ['A teaspoon is $5 \\times 10^{-6}$ m³: $' + tx(rho * 5e-6, 3) + '$ kg, about the mass of a car or more.'] : []),
        hint: 'Mass over the volume of a sphere, with the radius in meters.' };
    } else if (kind === 'g') {
      var Mg = R.pick([0.5, 0.6, 0.8, 1.0, 0.7, 0.9]), Rg = sig(8700 * M.pow(Mg / 0.6, -1 / 3), 2), esc = R.coin(), gs = K.G * Mg * K.Msun / M.pow(Rg * 1e3, 2), ve = M.sqrt(2 * K.G * Mg * K.Msun / (Rg * 1e3)) / 1e3;
      d = { M: Mg, R: Rg, esc: esc, ans: esc ? ve : gs };
      p = { q: 'Find the ' + (esc ? 'escape speed from' : 'surface gravity of') + ' a white dwarf with $' + td(Mg, 1) + '\\,M_\\odot$ and radius $' + tx(Rg, 2) + '$ km. ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(esc ? ve : gs), unit: esc ? 'km/s' : 'm/s²',
        steps: esc ? ['$v_{\\text{esc}} = \\sqrt{2GM/R}$.', '$2GM/R = 2 \\times 6.67 \\times 10^{-11} \\times ' + tx(Mg * K.Msun, 3) + '/' + tx(Rg * 1e3, 2) + ' = ' + tx(2 * K.G * Mg * K.Msun / (Rg * 1e3), 3) + '$ m²/s².', '$v_{\\text{esc}} = ' + tx(ve * 1e3, 3) + '$ m/s $= ' + tx(ve, 3) + '$ km/s, about 2% of the speed of light.']
          : ['$g = GM/R^2$.', '$= 6.67 \\times 10^{-11} \\times ' + tx(Mg * K.Msun, 3) + '/(' + tx(Rg * 1e3, 2) + ')^2$.', '$g = ' + tx(gs, 3) + '$ m/s², hundreds of thousands of times Earth\'s.'],
        hint: esc ? 'Use $\\sqrt{2GM/R}$ with $R$ in meters.' : 'Use $GM/R^2$ with $R$ in meters.' };
    } else if (kind === 'volume') {
      var a = R.pick([0.4, 0.5, 0.6]), b = R.pick([0.8, 1.0, 1.2, 0.9]), vr = a / b;
      d = { a: a, b: b, ans: vr };
      p = { q: 'Since $R \\propto M^{-1/3}$, the product $MR^3$ is the same for all (nonrelativistic) white dwarfs. What is the ratio of the volume of a $' + td(b, 1) + '\\,M_\\odot$ white dwarf to that of a $' + td(a, 1) + '\\,M_\\odot$ one?',
        a: num(vr),
        steps: ['$MR^3$ is constant, so $V \\propto R^3 \\propto 1/M$.', '$V_2/V_1 = M_1/M_2 = ' + td(a, 1) + '/' + td(b, 1) + '$.', '$= ' + tx(vr, 3) + '$: the heavier one takes up less room.'],
        hint: 'Cube the relation $R \\propto M^{-1/3}$.' };
    } else { // gamma
      var gs2 = R.pick([[5, 3], [2, 1], [3, 1], [3, 2], [7, 5]]), g = gs2[0] / gs2[1];
      var num1 = 2 * gs2[1] - gs2[0], den1 = 4 * gs2[1] - 3 * gs2[0]; // exponent (2 - γ)/(4 - 3γ) = (2b - a)/(4b - 3a)
      var e = ML.Q(num1, den1);
      d = { a: gs2[0], b: gs2[1], ans: e.toNumber() };
      p = { q: 'Suppose matter obeyed $P \\propto \\rho^{\\gamma}$ with $\\gamma = ' + (gs2[1] === 1 ? gs2[0] : '\\tfrac{' + gs2[0] + '}{' + gs2[1] + '}') + '$. Balancing $P \\propto M^{\\gamma}/R^{3\\gamma}$ against the pressure gravity requires, $P_c \\propto M^2/R^4$, gives $R \\propto M^{x}$. What is $x$?',
        a: { t: 'num', v: e.toPlain(), tol: 0.002 },
        steps: ['Set $M^{\\gamma}R^{-3\\gamma} \\propto M^2R^{-4}$, so $R^{4 - 3\\gamma} \\propto M^{2 - \\gamma}$ and $x = \\dfrac{2 - \\gamma}{4 - 3\\gamma}$.', 'With $\\gamma = ' + (gs2[1] === 1 ? gs2[0] : '\\tfrac{' + gs2[0] + '}{' + gs2[1] + '}') + '$: $x = ' + e.toTex() + '$.', gs2[0] === 5 && gs2[1] === 3 ? 'This is the white-dwarf case, $R \\propto M^{-1/3}$. At $\\gamma = 4/3$ (relativistic electrons) the denominator vanishes: no radius works except at one mass.' : 'Compare $\\gamma = 5/3$, which gives $-1/3$ for white dwarfs.'],
        hint: 'Equate the powers of $M$ and of $R$ on both sides.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.chandrasekhar-limit', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['mue', 'stable', 'mue'], ['estimate', 'mue', 'stable'], ['rel', 'pFratio', 'estimate']));
    var id = 'astrophys.chandrasekhar-limit', p, d;
    if (kind === 'mue') {
      var mix = L > 1 && R.coin(), comp = R.pick([['helium-4', 2, 4, 2], ['carbon-12', 2, 12, 6], ['oxygen-16', 2, 16, 8], ['iron-56', 56 / 26, 56, 26], ['neon-20', 2, 20, 10]]), X = R.pick([0.1, 0.2, 0.3, 0.5, 0.7, 0.4, 0.12, 0.15, 0.25, 0.35, 0.6]);
      var mue = mix ? 2 / (1 + X) : comp[2] / comp[3], Mch = 5.83 / (mue * mue);
      d = { A: mix ? undefined : comp[2], Z: mix ? undefined : comp[3], X: mix ? X : undefined, ans: Mch };
      if (mix) p = { q: 'The Chandrasekhar mass is $M_{\\text{Ch}} \\approx 5.83\\,M_\\odot/\\mu_e^2$, where $\\mu_e$ is the number of nucleons per electron. For fully ionized matter with hydrogen mass fraction $X = ' + X + '$ (the rest helium and heavier elements, each with about two nucleons per electron), $\\mu_e = 2/(1 + X)$. Find $M_{\\text{Ch}}$.',
        a: num(Mch), unit: 'M☉',
        steps: ['$\\mu_e = 2/(1 + ' + X + ') = ' + td(mue, 3) + '$.', '$\\mu_e^2 = ' + td(mue * mue, 3) + '$.', '$M_{\\text{Ch}} = 5.83/' + td(mue * mue, 3) + ' = ' + td(Mch, 2) + '\\,M_\\odot$: more electrons per nucleon support more mass.'],
        hint: 'Find $\\mu_e$ from the formula, square it, divide.' };
      else p = { q: 'The Chandrasekhar mass is $M_{\\text{Ch}} \\approx 5.83\\,M_\\odot/\\mu_e^2$, where $\\mu_e$ is the number of nucleons per electron. Find it for a core of pure ' + comp[0] + ' ($A = ' + comp[2] + '$, $Z = ' + comp[3] + '$).',
        a: num(Mch), unit: 'M☉',
        steps: ['$\\mu_e = A/Z = ' + comp[2] + '/' + comp[3] + ' = ' + td(mue, 3) + '$.', '$\\mu_e^2 = ' + td(mue * mue, 3) + '$.', '$M_{\\text{Ch}} = 5.83/' + td(mue * mue, 3) + ' = ' + td(Mch, 2) + '\\,M_\\odot$' + (comp[2] === 56 ? ': an iron core collapses at a lower mass, because it has fewer electrons per nucleon.' : '.')],
        hint: 'Count nucleons per electron: $A/Z$ for a fully ionized nucleus.' };
    } else if (kind === 'stable') {
      var Mw = R.pick([R.real(0.4, 1.3, 2), R.real(1.5, 3, 2)]), ok = Mw < 1.4;
      var right = ok ? 'Yes: below about $1.4\\,M_\\odot$, electron degeneracy pressure can hold it up.' : 'No: above about $1.4\\,M_\\odot$, no white dwarf can support itself, so it would collapse.';
      d = { M: Mw, ans: right };
      p = { q: 'Could a carbon–oxygen white dwarf of $' + td(Mw, 2) + '\\,M_\\odot$ exist in equilibrium?',
        a: mc(R, right, [ok ? 'No: every white dwarf above $0.5\\,M_\\odot$ collapses.' : 'Yes: a heavier white dwarf is just a larger white dwarf.', ok ? 'Only if it is still hot enough for gas pressure to hold it up.' : 'Yes, if it is hot enough, since thermal pressure can always take over.', 'It depends only on how fast it spins.']),
        steps: ['As mass grows, a white dwarf shrinks and its electrons are squeezed to relativistic speeds; their pressure then rises only as $\\rho^{4/3}$, no faster than gravity\'s demand.', 'Above the Chandrasekhar mass, about $1.4\\,M_\\odot$ for $\\mu_e = 2$, no radius gives a balance: ' + (ok ? 'this one is below it, so it is stable.' : 'this one is above it, so it cannot exist as a white dwarf.')],
        hint: 'Compare the mass with the Chandrasekhar limit.' };
    } else if (kind === 'estimate') {
      var mue2 = R.pick([2, 2, 2.15, 1, 1.5, 1.2, 1.8, 1.67]), est = M.pow(3.16e-26 / K.G, 1.5) / M.pow(mue2 * K.mp, 2) / K.Msun;
      d = { mue: mue2, ans: est };
      p = { q: 'A dimensional estimate of the maximum mass of a body held up by relativistic degenerate electrons is $M \\sim \\left(\\dfrac{\\hbar c}{G}\\right)^{3/2}\\dfrac{1}{(\\mu_em_p)^2}$. Evaluate it for $\\mu_e = ' + mue2 + '$ in solar masses. ($\\hbar c = 3.16 \\times 10^{-26}$ J·m, $G = 6.67 \\times 10^{-11}$, $m_p = 1.67 \\times 10^{-27}$ kg, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(est), unit: 'M☉',
        steps: ['$\\hbar c/G = 3.16 \\times 10^{-26}/6.67 \\times 10^{-11} = ' + tx(3.16e-26 / K.G, 3) + '$ kg²; to the 3/2 power: $' + tx(M.pow(3.16e-26 / K.G, 1.5), 3) + '$ kg³.', '$(\\mu_em_p)^2 = (' + tx(mue2 * K.mp, 3) + ')^2 = ' + tx(M.pow(mue2 * K.mp, 2), 3) + '$ kg².', '$M \\sim ' + tx(est * K.Msun, 3) + '$ kg $= ' + tx(est, 3) + '\\,M_\\odot$. The full calculation multiplies this by about 3.1, giving $5.83/\\mu_e^2$.'],
        hint: 'Compute $(\\hbar c/G)^{3/2}$ first; it has units of kg³.' };
    } else { // rel or pFratio
      var mue3 = 2, nRel = M.pow(ME * K.c / HB, 3) / (3 * M.PI * M.PI), rhoRel = mue3 * K.mp * nRel;
      if (kind === 'rel' && R.chance(0.7)) {
        var fR = R.pick([0.2, 0.25, 0.5, 2, 3, 4, 5, 10]), cmp = R.pick([['carbon–oxygen', 2, '2'], ['helium', 2, '2'], ['iron', 56 / 26, '2.15']]), nF = M.pow(fR * ME * K.c / HB, 3) / (3 * M.PI * M.PI), rhoF = cmp[1] * K.mp * nF;
        d = { f: fR, mue: cmp[1], ans: rhoF };
        p = { q: 'At what density do electrons in ' + cmp[0] + ' white-dwarf matter ($\\mu_e = ' + cmp[2] + '$) have Fermi momentum $p_F = \\hbar(3\\pi^2n_e)^{1/3}$ equal to $' + fR + 'm_ec$? ($\\hbar = 1.055 \\times 10^{-34}$ J·s, $m_e = 9.11 \\times 10^{-31}$ kg, $c = 3.00 \\times 10^{8}$ m/s, $m_p = 1.67 \\times 10^{-27}$ kg.)',
          a: num(rhoF), unit: 'kg/m³',
          steps: ['$p_F = ' + fR + 'm_ec$ means $n_e = \\dfrac{1}{3\\pi^2}\\left(\\dfrac{' + fR + 'm_ec}{\\hbar}\\right)^3$.', '$' + fR + 'm_ec/\\hbar = ' + tx(fR * ME * K.c / HB, 3) + '$ m⁻¹, so $n_e = ' + tx(nF, 3) + '$ m⁻³.', '$\\rho = \\mu_em_pn_e = ' + cmp[2] + ' \\times 1.67 \\times 10^{-27} \\times ' + tx(nF, 3) + ' = ' + tx(rhoF, 3) + '$ kg/m³.' + (fR > 1 ? ' The electrons there are relativistic.' : ' The electrons there are not yet relativistic.')],
          hint: 'Solve $\\hbar(3\\pi^2n_e)^{1/3} = p_F$ for $n_e$, then $\\rho = \\mu_em_pn_e$.' };
      } else if (kind === 'rel') {
        d = { ans: rhoRel };
        p = { q: 'At what density do electrons in carbon–oxygen matter ($\\mu_e = 2$) have Fermi momentum $p_F = \\hbar(3\\pi^2n_e)^{1/3}$ equal to $m_ec$, the point where relativity starts to soften their pressure? ($\\hbar = 1.055 \\times 10^{-34}$ J·s, $m_e = 9.11 \\times 10^{-31}$ kg, $c = 3.00 \\times 10^{8}$ m/s, $m_p = 1.67 \\times 10^{-27}$ kg.)',
          a: num(rhoRel), unit: 'kg/m³',
          steps: ['$p_F = m_ec$ means $n_e = \\dfrac{1}{3\\pi^2}\\left(\\dfrac{m_ec}{\\hbar}\\right)^3$.', '$m_ec/\\hbar = ' + tx(ME * K.c / HB, 3) + '$ m⁻¹, so $n_e = ' + tx(nRel, 3) + '$ m⁻³.', '$\\rho = 2m_pn_e = ' + tx(rhoRel, 3) + '$ kg/m³, a typical density near the centers of massive white dwarfs.'],
          hint: 'Solve $\\hbar(3\\pi^2n_e)^{1/3} = m_ec$ for $n_e$.' };
      } else {
        var rho = sig(rnd(R, 1e8, 1e11, 2), 2), ne = rho / (2 * K.mp), x = HB * M.pow(3 * M.PI * M.PI * ne, 1 / 3) / (ME * K.c);
        d = { rho: rho, ans: x };
        p = { q: 'In carbon–oxygen white-dwarf matter at $' + tx(rho, 2) + '$ kg/m³ ($\\mu_e = 2$), find $p_F/(m_ec)$ with $p_F = \\hbar(3\\pi^2n_e)^{1/3}$. ($\\hbar = 1.055 \\times 10^{-34}$ J·s, $m_e = 9.11 \\times 10^{-31}$ kg, $c = 3.00 \\times 10^{8}$ m/s, $m_p = 1.67 \\times 10^{-27}$ kg.)',
          a: num(x),
          steps: ['$n_e = \\rho/(2m_p) = ' + tx(ne, 3) + '$ m⁻³.', '$p_F = ' + tx(HB * M.pow(3 * M.PI * M.PI * ne, 1 / 3), 3) + '$ kg·m/s and $m_ec = ' + tx(ME * K.c, 3) + '$ kg·m/s.', '$p_F/(m_ec) = ' + tx(x, 3) + '$' + (x > 1 ? ': relativistic electrons, the regime of the Chandrasekhar limit.' : ': not yet fully relativistic.')],
          hint: 'Electron density first; then the Fermi momentum; then divide by $m_ec$.' };
      }
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.core-collapse', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['energy', 'fraction', 'energy'], ['tff', 'nu', 'energy'], ['kin', 'nu', 'tff']));
    var id = 'astrophys.core-collapse', p, d, GV = '$G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg';
    if (kind === 'energy') {
      var Mc = R.real(1.2, 2.0, 2), Rk = R.int(10, 20), E = 0.6 * K.G * M.pow(Mc * K.Msun, 2) / (Rk * 1e3);
      d = { M: Mc, R: Rk, ans: E };
      p = { q: 'A collapsing iron core of $' + td(Mc, 1) + '\\,M_\\odot$ shrinks from thousands of kilometers to a neutron star of radius $' + Rk + '$ km. Estimate the gravitational energy released, $\\approx \\tfrac35GM^2/R$. (' + GV + '.)',
        a: num(E), unit: 'J',
        steps: ['The starting radius is so much larger that its $\\tfrac35GM^2/R$ is small by comparison; the final radius sets the energy.', '$M = ' + tx(Mc * K.Msun, 3) + '$ kg; $R = ' + tx(Rk * 1e3, 2) + '$ m.', '$E \\approx 0.6 \\times 6.67 \\times 10^{-11} \\times (' + tx(Mc * K.Msun, 3) + ')^2/' + tx(Rk * 1e3, 2) + ' = ' + tx(E, 3) + '$ J.'],
        hint: 'Use the neutron star\'s radius in meters.' };
    } else if (kind === 'fraction') {
      var Et = R.pick([2, 3, 3, 4]) * 1e46, Elight = R.pick([1, 2, 3]) * 1e42, pct = Elight / Et * 100;
      d = { Et: Et, El: Elight, ans: pct };
      p = { q: 'A core-collapse supernova releases about $' + tx(Et, 1) + '$ J, and its light over the following months adds up to about $' + tx(Elight, 1) + '$ J. What percentage of the energy leaves as light?',
        a: Object.assign(num(pct), { pct: true }),
        steps: ['Fraction $= ' + tx(Elight, 1) + '/' + tx(Et, 1) + ' = ' + tx(Elight / Et, 2) + '$.', 'That is $' + tx(pct, 2) + '\\%$.', 'About 99% leaves as neutrinos and about 1% as the kinetic energy of the ejected gas; the light is the small remainder, though it can outshine a galaxy.'],
        hint: 'Divide and multiply by 100.' };
    } else if (kind === 'tff') {
      var Mc2 = R.real(1.2, 1.6, 2), Rk2 = R.int(15, 60) * 100, rho = Mc2 * K.Msun / (4 / 3 * M.PI * cube(Rk2 * 1e3)), t = M.sqrt(3 * M.PI / (32 * K.G * rho));
      d = { M: Mc2, R: Rk2, ans: t };
      p = { q: 'Estimate the free-fall time $t_{ff} = \\sqrt{3\\pi/(32G\\bar\\rho)}$ of an iron core of $' + td(Mc2, 1) + '\\,M_\\odot$ and radius $' + tx(Rk2, 2) + '$ km once its pressure support fails. (' + GV + '.)',
        a: num(t), unit: 's',
        steps: ['Mean density: $\\bar\\rho = M/(\\tfrac43\\pi R^3) = ' + tx(rho, 3) + '$ kg/m³.', '$32G\\bar\\rho = ' + tx(32 * K.G * rho, 3) + '$ s⁻².', '$t_{ff} = \\sqrt{3\\pi/' + tx(32 * K.G * rho, 3) + '} = ' + tx(t, 3) + '$ s: the collapse takes about a second or less.'],
        hint: 'Find the mean density first.' };
    } else if (kind === 'nu') {
      var E2 = R.pick([2, 3]) * 1e46, Enu = R.pick([10, 12, 15]), dk = R.pick([10, 50, 8, 20]), N = 0.99 * E2 / (Enu * K.MeV), dm = dk * 1e3 * K.pc, fl = N / (4 * M.PI * dm * dm) * 1e-4;
      var askF = L === 3 || R.coin();
      d = { E: E2, Enu: Enu, d: dk, askF: askF, ans: askF ? fl : N };
      p = { q: 'A supernova releases $' + tx(E2, 1) + '$ J, 99% of it as neutrinos with an average energy of $' + Enu + '$ MeV. ' + (askF ? 'If it is $' + dk + '$ kpc away, how many neutrinos cross each square centimeter at Earth?' : 'How many neutrinos does it emit?') + ' ($1\\text{ MeV} = 1.602 \\times 10^{-13}$ J' + (askF ? ', $1\\text{ pc} = 3.09 \\times 10^{16}$ m' : '') + '.)',
        a: num(askF ? fl : N),
        steps: ['Neutrino energy: $0.99 \\times ' + tx(E2, 1) + ' = ' + tx(0.99 * E2, 3) + '$ J.', 'Number: $' + tx(0.99 * E2, 3) + '/(' + Enu + ' \\times 1.602 \\times 10^{-13}) = ' + tx(N, 3) + '$.'].concat(askF ? ['At $d = ' + tx(dm, 3) + '$ m: $N/(4\\pi d^2) = ' + tx(N / (4 * M.PI * dm * dm), 3) + '$ per m² $= ' + tx(fl, 3) + '$ per cm².'] : []),
        hint: askF ? 'Count the neutrinos, then spread them over a sphere.' : 'Divide the neutrino energy by the energy per neutrino.' };
    } else { // kin
      var Ek = R.pick([0.5, 1, 1.5, 2]) * 1e44, Mej = R.pick([2, 5, 8, 10, 15]), v = M.sqrt(2 * Ek / (Mej * K.Msun)) / 1e3;
      d = { E: Ek, M: Mej, ans: v };
      p = { q: 'About $' + tx(Ek, 2) + '$ J of a supernova\'s energy goes into the motion of $' + Mej + '\\,M_\\odot$ of ejected gas. Estimate the typical speed of the gas in km/s. ($M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(v), unit: 'km/s',
        steps: ['$\\tfrac12Mv^2 = E$, so $v = \\sqrt{2E/M}$.', '$M = ' + tx(Mej * K.Msun, 3) + '$ kg; $2E/M = ' + tx(2 * Ek / (Mej * K.Msun), 3) + '$ m²/s².', '$v = ' + tx(v * 1e3, 3) + '$ m/s $= ' + tx(v, 3) + '$ km/s.'],
        hint: 'Kinetic energy $\\tfrac12Mv^2$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.neutron-star-physics', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['spin', 'B', 'spin'], ['density', 'g', 'B'], ['breakup', 'rhomin', 'density']));
    var id = 'astrophys.neutron-star-physics', p, d, GV = '$G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg';
    if (kind === 'spin') {
      var Ri = R.pick([3000, 5000, 6000, 8000, 3500, 4000, 7000]), Pi = R.pick([10, 20, 30, 60, 12, 25, 35, 50]) * 60, Rf = R.pick([10, 12, 15, 11, 13, 14]), Pf = Pi * M.pow(Rf / Ri, 2);
      d = { Ri: Ri, Pi: Pi, Rf: Rf, ans: Pf * 1000 };
      p = { q: 'A stellar core of radius $' + tx(Ri, 2) + '$ km turns once every $' + Pi / 60 + '$ minutes. It collapses to a neutron star of radius $' + Rf + '$ km. If it keeps its angular momentum and its shape of mass distribution, what is the new rotation period in milliseconds?',
        a: num(Pf * 1000), unit: 'ms',
        steps: ['$L = I\\omega$ with $I \\propto MR^2$: conserving $L$ means $R^2/P$ stays the same.', '$P_f = P_i(R_f/R_i)^2 = ' + Pi + '\\text{ s} \\times (' + Rf + '/' + tx(Ri, 2) + ')^2$.', '$P_f = ' + tx(Pf, 3) + '$ s $= ' + tx(Pf * 1000, 3) + '$ ms.'],
        hint: 'Angular momentum: $MR^2/P$ is conserved.' };
    } else if (kind === 'B') {
      var Bi = R.pick([0.01, 0.1, 1, 0.001]), Ri2 = R.pick([7e5, 1e5, 3e4, 1e4]), Rf2 = R.pick([10, 12]), Bf = Bi * M.pow(Ri2 / Rf2, 2);
      d = { Bi: Bi, Ri: Ri2, Rf: Rf2, ans: Bf };
      p = { q: 'A star\'s core has a magnetic field of $' + tx(Bi, 1) + '$ T over a radius of $' + tx(Ri2, 1) + '$ km. If the magnetic flux $BR^2$ is conserved as it collapses to a $' + Rf2 + '$ km neutron star, what is the new field?',
        a: num(Bf), unit: 'T',
        steps: ['Flux $\\Phi \\propto BR^2$ is constant.', '$B_f = B_i(R_i/R_f)^2 = ' + tx(Bi, 1) + ' \\times (' + tx(Ri2, 1) + '/' + Rf2 + ')^2$.', '$B_f = ' + tx(Bf, 3) + '$ T' + (Bf > 1e6 ? ', comparable to the $10^{8}$ T fields measured in pulsars.' : '.')],
        hint: 'Field times area stays the same.' };
    } else if (kind === 'density') {
      var Mn = R.pick([1.2, 1.4, 1.6, 2.0, 1.5]), Rn = R.pick([10, 11, 12, 13]), rho = Mn * K.Msun / (4 / 3 * M.PI * cube(Rn * 1e3)), tsp = R.coin();
      d = { M: Mn, R: Rn, tsp: tsp, ans: tsp ? rho * 5e-6 : rho };
      p = { q: 'A neutron star has $' + td(Mn, 1) + '\\,M_\\odot$ within a radius of $' + Rn + '$ km. ' + (tsp ? 'What would a teaspoon (5 cm³) of its average matter weigh, in kilograms?' : 'What is its mean density?') + ' ($M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(tsp ? rho * 5e-6 : rho), unit: tsp ? 'kg' : 'kg/m³',
        steps: ['Volume: $\\tfrac43\\pi(' + tx(Rn * 1e3, 2) + ')^3 = ' + tx(4 / 3 * M.PI * cube(Rn * 1e3), 3) + '$ m³.', '$\\bar\\rho = ' + tx(Mn * K.Msun, 3) + '/' + tx(4 / 3 * M.PI * cube(Rn * 1e3), 3) + ' = ' + tx(rho, 3) + '$ kg/m³, about the density of an atomic nucleus.'].concat(tsp ? ['Times $5 \\times 10^{-6}$ m³: $' + tx(rho * 5e-6, 3) + '$ kg, roughly a billion tonnes or more.'] : []),
        hint: 'Mass over volume, with the radius in meters.' };
    } else if (kind === 'g') {
      var Mn2 = R.pick([1.4, 1.4, 1.6, 2.0, 1.5]), Rn2 = R.pick([10, 12, 13, 11]), esc = R.coin(), gs = K.G * Mn2 * K.Msun / M.pow(Rn2 * 1e3, 2), ve = M.sqrt(2 * K.G * Mn2 * K.Msun / (Rn2 * 1e3)) / K.c;
      d = { M: Mn2, R: Rn2, esc: esc, ans: esc ? ve : gs };
      p = { q: esc ? 'Find the escape speed from the surface of a $' + td(Mn2, 1) + '\\,M_\\odot$, $' + Rn2 + '$ km neutron star, as a fraction of $c$. (' + GV + ', $c = 3.00 \\times 10^{8}$ m/s.)' : 'Find the surface gravity of a $' + td(Mn2, 1) + '\\,M_\\odot$, $' + Rn2 + '$ km neutron star. (' + GV + '.)',
        a: num(esc ? ve : gs), unit: esc ? undefined : 'm/s²',
        steps: esc ? ['$v = \\sqrt{2GM/R} = \\sqrt{2 \\times 6.67 \\times 10^{-11} \\times ' + tx(Mn2 * K.Msun, 3) + '/' + tx(Rn2 * 1e3, 2) + '}$.', '$v = ' + tx(ve * K.c, 3) + '$ m/s.', '$v/c = ' + tx(ve, 3) + '$: so close to $c$ that general relativity matters.'] : ['$g = GM/R^2 = 6.67 \\times 10^{-11} \\times ' + tx(Mn2 * K.Msun, 3) + '/(' + tx(Rn2 * 1e3, 2) + ')^2$.', '$g = ' + tx(gs, 3) + '$ m/s².', 'About $10^{11}$ times Earth\'s gravity.'],
        hint: esc ? 'Compute $\\sqrt{2GM/R}$ and divide by $c$.' : 'Use $GM/R^2$ in SI units.' };
      if (esc) delete p.unit;
    } else if (kind === 'breakup') {
      var Mn3 = R.pick([1.4, 1.6, 2.0, 1.5]), Rn3 = R.pick([10, 12, 14, 11, 13]), Pmin = 2 * M.PI * M.sqrt(cube(Rn3 * 1e3) / (K.G * Mn3 * K.Msun));
      d = { M: Mn3, R: Rn3, ans: Pmin * 1000 };
      p = { q: 'A spinning star flies apart if its equator moves faster than orbital speed. What is the shortest rotation period of a $' + td(Mn3, 1) + '\\,M_\\odot$, $' + Rn3 + '$ km neutron star, in milliseconds? (' + GV + '.)',
        a: num(Pmin * 1000), unit: 'ms',
        steps: ['At breakup, $\\omega^2R = GM/R^2$, so $P_{\\min} = 2\\pi\\sqrt{R^3/(GM)}$.', '$R^3/(GM) = ' + tx(cube(Rn3 * 1e3), 3) + '/' + tx(K.G * Mn3 * K.Msun, 3) + ' = ' + tx(cube(Rn3 * 1e3) / (K.G * Mn3 * K.Msun), 3) + '$ s².', '$P_{\\min} = ' + tx(Pmin * 1000, 3) + '$ ms. The fastest pulsar known spins at 716 times a second (1.4 ms).'],
        hint: 'Set the centripetal acceleration at the equator equal to surface gravity.' };
    } else { // rhomin
      var Pms = R.pick([1.4, 1.6, 3, 5, 33, 89]), Ps = Pms / 1000, rmin = 3 * M.PI / (K.G * Ps * Ps);
      d = { P: Pms, ans: rmin };
      p = { q: 'A pulsar flashes every $' + Pms + '$ ms. For a spinning sphere not to fly apart, its mean density must be at least $3\\pi/(GP^2)$. What is that minimum density? ($G = 6.67 \\times 10^{-11}$.)',
        a: num(rmin), unit: 'kg/m³',
        steps: ['Breakup: $\\omega^2 = GM/R^3 = \\tfrac43\\pi G\\bar\\rho$, with $\\omega = 2\\pi/P$, gives $\\bar\\rho_{\\min} = 3\\pi/(GP^2)$.', '$P = ' + tx(Ps, 3) + '$ s, so $GP^2 = ' + tx(K.G * Ps * Ps, 3) + '$.', '$\\bar\\rho_{\\min} = ' + tx(rmin, 3) + '$ kg/m³: ' + (rmin > 1e12 ? 'far denser than any white dwarf, so it must be a neutron star.' : 'already denser than ordinary matter.')],
        hint: 'Gravity at the equator must supply the centripetal acceleration.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.pulsar-spindown', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['Erot', 'Erot', 'age'], ['Edot', 'age', 'dP'], ['Edot', 'B', 'nebula']));
    var id = 'astrophys.pulsar-spindown', p, d, I = 1e38;
    var P = sig(R.pick([0.0334, 0.089, 0.15, 0.25, 0.5, 1.0, 0.033, 0.005]) * R.real(0.9, 1.1, 2), 2), Pdot = P < 0.01 ? sig(rnd(R, 1e-20, 1e-18, 2), 2) : P < 0.2 ? sig(rnd(R, 1e-15, 1e-12, 2), 2) : sig(rnd(R, 1e-16, 1e-13, 2), 2);
    if (kind === 'Erot') {
      var E = 2 * M.PI * M.PI * I / (P * P);
      d = { P: P, ans: E };
      p = { q: 'A pulsar with moment of inertia $I = 1.0 \\times 10^{38}$ kg·m² spins once every $' + tx(P, 2) + '$ s. How much rotational energy does it store?',
        a: num(E), unit: 'J',
        steps: ['$\\omega = 2\\pi/P = ' + tx(2 * M.PI / P, 3) + '$ rad/s.', '$E = \\tfrac12I\\omega^2 = \\tfrac12(1.0 \\times 10^{38})(' + tx(2 * M.PI / P, 3) + ')^2$.', '$E = ' + tx(E, 3) + '$ J.'],
        hint: '$E = \\tfrac12I\\omega^2$ with $\\omega = 2\\pi/P$.' };
    } else if (kind === 'Edot') {
      var Ed = 4 * M.PI * M.PI * I * Pdot / cube(P);
      d = { P: P, Pdot: Pdot, ans: Ed };
      p = { q: 'A pulsar ($I = 1.0 \\times 10^{38}$ kg·m²) has period $P = ' + tx(P, 2) + '$ s, which grows at $\\dot P = ' + tx(Pdot, 2) + '$ s/s. At what rate is it losing rotational energy?',
        a: num(Ed), unit: 'W',
        steps: ['$E = \\tfrac12I\\omega^2 = 2\\pi^2I/P^2$, so $\\dfrac{dE}{dt} = -\\dfrac{4\\pi^2I\\dot P}{P^3}$.', '$4\\pi^2I\\dot P = ' + tx(4 * M.PI * M.PI * I * Pdot, 3) + '$; $P^3 = ' + tx(cube(P), 3) + '$ s³.', '$|\\dot E| = ' + tx(Ed, 3) + '$ W.'],
        hint: 'Differentiate $E = 2\\pi^2I/P^2$ with respect to time.' };
    } else if (kind === 'age') {
      var tau = P / (2 * Pdot) / K.yr;
      d = { P: P, Pdot: Pdot, ans: tau };
      p = { q: 'A pulsar has $P = ' + tx(P, 2) + '$ s and $\\dot P = ' + tx(Pdot, 2) + '$ s/s. Estimate its characteristic age $\\tau = P/(2\\dot P)$ in years. ($1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(tau), unit: 'yr',
        steps: ['$\\tau = P/(2\\dot P) = ' + tx(P, 2) + '/(2 \\times ' + tx(Pdot, 2) + ')$.', '$= ' + tx(P / (2 * Pdot), 3) + '$ s.', '$= ' + tx(tau, 3) + '$ years. (It assumes the pulsar was born spinning much faster than now.)'],
        hint: 'Divide the period by twice its rate of change.' };
    } else if (kind === 'dP') {
      var yrs = R.pick([1, 10, 100, 1000]), dP = Pdot * yrs * K.yr;
      d = { Pdot: Pdot, yrs: yrs, ans: dP * 1e9 };
      p = { q: 'A pulsar slows down at $\\dot P = ' + tx(Pdot, 2) + '$ s/s. By how many nanoseconds does its period grow in ' + (yrs === 1 ? 'one year' : yrs + ' years') + '? ($1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(dP * 1e9), unit: 'ns',
        steps: ['$\\Delta P = \\dot P\\,\\Delta t = ' + tx(Pdot, 2) + ' \\times ' + tx(yrs * K.yr, 3) + '$ s.', '$\\Delta P = ' + tx(dP, 3) + '$ s $= ' + tx(dP * 1e9, 3) + '$ ns: tiny, yet radio timing measures it precisely.'],
        hint: 'Rate times time.' };
    } else if (kind === 'B') {
      var B = 3.2e15 * M.sqrt(P * Pdot);
      d = { P: P, Pdot: Pdot, ans: B };
      p = { q: 'If a pulsar loses its spin by magnetic dipole radiation, its surface field is about $B \\approx 3.2 \\times 10^{15}\\sqrt{P\\dot P}$ T (for $I = 10^{38}$ kg·m², $R = 10$ km). Estimate $B$ for $P = ' + tx(P, 2) + '$ s and $\\dot P = ' + tx(Pdot, 2) + '$.',
        a: num(B), unit: 'T',
        steps: ['$P\\dot P = ' + tx(P * Pdot, 3) + '$ s.', '$\\sqrt{P\\dot P} = ' + tx(M.sqrt(P * Pdot), 3) + '$.', '$B \\approx ' + tx(B, 3) + '$ T.'],
        hint: 'Multiply $P$ and $\\dot P$, take the root, scale.' };
    } else { // nebula: the Crab
      var Pc = 0.0337, Pdc = 4.2e-13, Ed2 = 4 * M.PI * M.PI * I * Pdc / cube(Pc), Lneb = R.pick([1.0, 1.3, 1.5]) * 1e31, frac = Lneb / Ed2;
      d = { L: Lneb, ans: frac };
      p = { q: 'The Crab pulsar has $P = 0.0337$ s and $\\dot P = 4.2 \\times 10^{-13}$ s/s, with $I = 1.0 \\times 10^{38}$ kg·m². The Crab Nebula around it radiates about $' + tx(Lneb, 2) + '$ W. What fraction of the pulsar\'s spin-down power does the nebula radiate?',
        a: num(frac),
        steps: ['$|\\dot E| = 4\\pi^2I\\dot P/P^3 = 4\\pi^2(10^{38})(4.2 \\times 10^{-13})/(0.0337)^3$.', '$|\\dot E| = ' + tx(Ed2, 3) + '$ W.', 'Fraction $= ' + tx(Lneb, 2) + '/' + tx(Ed2, 3) + ' = ' + tx(frac, 3) + '$: the spinning star easily pays for the nebula\'s glow.'],
        hint: 'Find the spin-down power, then divide.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.schwarzschild-radius', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['rs', 'M', 'concept'], ['density', 'rs', 'compact'], ['density', 'compact', 'M']));
    var id = 'astrophys.schwarzschild-radius', p, d, GV = '$G = 6.67 \\times 10^{-11}$, $c = 3.00 \\times 10^{8}$ m/s, $M_\\odot = 1.99 \\times 10^{30}$ kg';
    if (kind === 'rs') {
      var Ms = L === 1 ? R.pick([1, 3, 10, 30, 4.3e6, 6.5e9]) : sig(rnd(R, 3, 1e10, 2), 2), rs = 2 * K.G * Ms * K.Msun / (K.c * K.c) / 1e3;
      d = { M: Ms, ans: rs };
      p = { q: 'What is the Schwarzschild radius of a black hole of $' + tx(Ms, 2) + '\\,M_\\odot$, in kilometers? (' + GV + '.)',
        a: num(rs), unit: 'km',
        steps: ['$r_s = 2GM/c^2$: where the escape speed $\\sqrt{2GM/r}$ would equal $c$.', '$2GM = 2 \\times 6.67 \\times 10^{-11} \\times ' + tx(Ms * K.Msun, 3) + ' = ' + tx(2 * K.G * Ms * K.Msun, 3) + '$; $c^2 = 9.00 \\times 10^{16}$.', '$r_s = ' + tx(rs * 1e3, 3) + '$ m $= ' + tx(rs, 3) + '$ km (about 2.95 km per solar mass).'],
        hint: 'Set the escape speed equal to $c$.' };
    } else if (kind === 'M') {
      var rk = sig(rnd(R, 5, 3e7, 2), 2), Mm = rk * 1e3 * K.c * K.c / (2 * K.G) / K.Msun;
      d = { rs: rk, ans: Mm };
      p = { q: 'A black hole\'s event horizon has radius $' + tx(rk, 2) + '$ km. What is its mass in solar masses? (' + GV + '.)',
        a: num(Mm), unit: 'M☉',
        steps: ['$M = r_sc^2/(2G)$.', '$= ' + tx(rk * 1e3, 2) + ' \\times 9.00 \\times 10^{16}/(1.334 \\times 10^{-10}) = ' + tx(Mm * K.Msun, 3) + '$ kg.', '$M = ' + tx(Mm, 3) + '\\,M_\\odot$.'],
        hint: 'Solve $r_s = 2GM/c^2$ for $M$.' };
    } else if (kind === 'density') {
      var Md = sig(rnd(R, 3, 1e10, 2), 2), rs2 = 2 * K.G * Md * K.Msun / (K.c * K.c), rho = Md * K.Msun / (4 / 3 * M.PI * cube(rs2));
      d = { M: Md, ans: rho };
      p = { q: 'What is the mean density of a $' + tx(Md, 2) + '\\,M_\\odot$ black hole, its mass divided by the volume $\\tfrac43\\pi r_s^3$? (' + GV + '.)',
        a: num(rho), unit: 'kg/m³',
        steps: ['$r_s = 2GM/c^2 = ' + tx(rs2, 3) + '$ m.', 'Volume: $' + tx(4 / 3 * M.PI * cube(rs2), 3) + '$ m³.', '$\\bar\\rho = ' + tx(rho, 3) + '$ kg/m³. Because $r_s \\propto M$, $\\bar\\rho \\propto 1/M^2$: ' + (rho < 1e4 ? 'giant black holes are not dense at all on average.' : 'small black holes are extraordinarily dense.')],
        hint: 'Find $r_s$, then mass over volume.' };
    } else if (kind === 'compact') {
      var obj = R.pick([['Earth', 5.97e24, 6.37e6], ['the Sun', 1.99e30, 6.96e8], ['a white dwarf of 0.6 solar masses and radius 8,700 km', 0.6 * 1.99e30, 8.7e6], ['a neutron star of 1.4 solar masses and radius 12 km', 1.4 * 1.99e30, 1.2e4], ['Jupiter', 1.90e27, 6.99e7]]);
      var rs3 = 2 * K.G * obj[1] / (K.c * K.c), ratio = obj[2] / rs3;
      d = { M: obj[1], R: obj[2], ans: ratio };
      p = { q: 'How many times larger than its Schwarzschild radius is ' + obj[0] + '? (Mass $' + tx(obj[1], 3) + '$ kg, radius $' + tx(obj[2], 3) + '$ m; $G = 6.67 \\times 10^{-11}$, $c = 3.00 \\times 10^{8}$ m/s.)',
        a: num(ratio),
        steps: ['$r_s = 2GM/c^2 = ' + tx(rs3, 3) + '$ m.', '$R/r_s = ' + tx(obj[2], 3) + '/' + tx(rs3, 3) + '$.', '$= ' + tx(ratio, 3) + '$. ' + (ratio < 10 ? 'Only a few times: gravity here is strongly relativistic.' : 'Far larger, so ordinary Newtonian gravity works well.')],
        hint: 'Compute $r_s$ and divide.' };
    } else {
      var c = R.pick([
        ['If the Sun were suddenly replaced by a black hole of the same mass, what would happen to Earth\'s orbit?', 'Nothing: at Earth\'s distance the black hole pulls exactly as hard as the Sun did, so Earth keeps its orbit (in the dark).', ['Earth would be pulled in and swallowed.', 'Earth would fly off, because black holes repel light.', 'Earth\'s year would become much shorter.']],
        ['A star of 10 solar masses collapses to a 10-solar-mass black hole. At 1 AU from it, the gravitational pull compared with before is', 'the same: outside a spherical mass, gravity depends only on the mass and the distance.', ['far stronger, because black holes suck in everything nearby.', 'zero, because gravity cannot escape a black hole.', 'weaker, because the mass is hidden inside the horizon.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['By the shell theorem, outside a spherical body gravity is $GM/r^2$, whatever the body\'s size.', 'A black hole is different only very close in, within a few Schwarzschild radii (about 3 km per solar mass). Far away it pulls like any other mass.'],
        hint: 'What does gravity outside a sphere depend on?' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.gravitational-redshift', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['weak', 'weak', 'rate'], ['rate', 'zexact', 'weak'], ['gps', 'tower', 'zexact']));
    var id = 'astrophys.gravitational-redshift', p, d;
    if (kind === 'weak') {
      var wm = R.real(0.4, 1.1, 2), wr = sig(8700 * M.pow(wm / 0.6, -1 / 3), 2), obj = R.pick([['the Sun', 1.99e30, 6.96e8], ['a white dwarf of $' + td(wm, 2) + '\\,M_\\odot$ and radius $' + tx(wr, 2) + '$ km', wm * 1.99e30, wr * 1e3], ['a white dwarf of $' + td(wm, 2) + '\\,M_\\odot$ and radius $' + tx(wr, 2) + '$ km', wm * 1.99e30, wr * 1e3], ['Earth', 5.97e24, 6.37e6]]);
      var z = K.G * obj[1] / (obj[2] * K.c * K.c), askv = R.coin(), v = z * K.c / 1e3;
      d = { M: obj[1], R: obj[2], askv: askv, ans: askv ? v : z };
      p = { q: 'Light leaving the surface of ' + obj[0] + ' is redshifted by about $z \\approx GM/(Rc^2)$. ' + (askv ? 'Express the shift as an equivalent Doppler speed $cz$, in km/s.' : 'Find $z$.') + ' (Mass $' + tx(obj[1], 3) + '$ kg, radius $' + tx(obj[2], 3) + '$ m; $G = 6.67 \\times 10^{-11}$, $c = 3.00 \\times 10^{8}$ m/s.)',
        a: num(askv ? v : z), unit: askv ? 'km/s' : undefined,
        steps: ['$GM/(Rc^2) = 6.67 \\times 10^{-11} \\times ' + tx(obj[1], 3) + '/(' + tx(obj[2], 3) + ' \\times 9.00 \\times 10^{16})$.', '$z = ' + tx(z, 3) + '$.'].concat(askv ? ['$cz = ' + tx(v, 3) + '$ km/s, a shift you could mistake for motion if you did not know about gravity.'] : []),
        hint: 'Climbing out of a potential well $GM/R$ costs a fraction $GM/(Rc^2)$ of a photon\'s energy.' };
      if (!askv) delete p.unit;
    } else if (kind === 'rate') {
      var n = R.real(1.1, 10, 1), tau = R.pick([1, 10, 60, 2, 5, 30, 1.2, 3, 6, 12, 25, 50]), rate = M.sqrt(1 - 1 / n), tfar = tau / rate;
      d = { n: n, tau: tau, ans: tfar };
      p = { q: 'A clock hovers at $r = ' + n + 'r_s$ outside a black hole and ticks off $' + tau + '$ ' + (tau === 1 ? 'hour' : tau >= 30 ? 'minutes' : 'hours') + '. How much time passes for a distant observer?',
        a: num(tfar), unit: tau >= 30 ? 'min' : 'h',
        steps: ['A hovering clock runs slow by $\\sqrt{1 - r_s/r} = \\sqrt{1 - 1/' + n + '} = ' + td(rate, 4) + '$.', '$\\Delta t_\\infty = \\Delta\\tau/' + td(rate, 4) + '$.', '$\\Delta t_\\infty = ' + tx(tfar, 3) + '$ ' + (tau >= 30 ? 'min' : 'h') + '.'],
        hint: 'The far-away clock records more time: divide by $\\sqrt{1 - r_s/r}$.' };
    } else if (kind === 'zexact') {
      var n2 = R.real(1.1, 6, 1), z2 = 1 / M.sqrt(1 - 1 / n2) - 1;
      d = { n: n2, ans: z2 };
      p = { q: 'Light is emitted at $r = ' + n2 + 'r_s$ from a black hole and received far away. What is its redshift $z = \\lambda_{\\text{obs}}/\\lambda_{\\text{emit}} - 1$?',
        a: num(z2),
        steps: ['$\\lambda_{\\text{obs}}/\\lambda_{\\text{emit}} = 1/\\sqrt{1 - r_s/r}$.', '$= 1/\\sqrt{1 - 1/' + n2 + '} = ' + td(1 / M.sqrt(1 - 1 / n2), 4) + '$.', '$z = ' + td(z2, 3) + '$.'],
        hint: 'Clocks there run slow, so wave crests arrive stretched by $1/\\sqrt{1 - r_s/r}$.' };
    } else if (kind === 'gps') {
      var h = R.pick([20200, 23200, 35786, R.int(4, 300) * 100]), r = 6.37e6 + h * 1e3, GM = 3.99e14, grav = GM / (K.c * K.c) * (1 / 6.37e6 - 1 / r) * 86400 * 1e6, vel = -GM / r / (2 * K.c * K.c) * 86400 * 1e6, askNet = R.coin();
      d = { h: h, askNet: askNet, ans: askNet ? grav + vel : grav };
      p = { q: 'A satellite clock orbits at $' + tx(h, 3) + '$ km altitude. ' + (askNet ? 'Combining gravitational time dilation (it runs fast by $\\tfrac{GM}{c^2}(\\tfrac{1}{R_\\oplus} - \\tfrac1r)$ per unit time) with the slowing from its orbital speed ($v^2/2c^2$, with $v^2 = GM/r$), how many microseconds per day does it gain on a clock on the ground?' : 'Gravity alone makes it run fast compared with a ground clock by a fraction $\\tfrac{GM}{c^2}\\left(\\tfrac{1}{R_\\oplus} - \\tfrac{1}{r}\\right)$. How many microseconds does it gain per day?') + ' ($GM_\\oplus = 3.99 \\times 10^{14}$ m³/s², $R_\\oplus = 6.37 \\times 10^{6}$ m, $c = 3.00 \\times 10^{8}$ m/s; ignore Earth\'s rotation.)',
        a: num(askNet ? grav + vel : grav, { rtol: 0.03 }), unit: 'μs',
        steps: ['$r = ' + tx(r, 4) + '$ m; $\\tfrac{1}{R_\\oplus} - \\tfrac{1}{r} = ' + tx(1 / 6.37e6 - 1 / r, 4) + '$ m⁻¹.', 'Gravitational gain: $\\tfrac{GM}{c^2}(\\ldots) \\times 86{,}400\\text{ s} = ' + tx(grav, 3) + '$ μs per day.'].concat(askNet ? ['Speed: $v^2/(2c^2) \\times 86{,}400 = ' + tx(-vel, 3) + '$ μs per day lost.', 'Net: $' + tx(grav + vel, 3) + '$ μs per day. GPS clocks are set to run slow before launch to cancel it.'] : ['Without correcting for this, GPS positions would drift by kilometers each day.']),
        hint: 'Multiply the fractional rate difference by the number of seconds in a day.' };
    } else { // tower
      var hh = R.pick([22.5, R.int(2, 99) * 10, 828, R.int(1, 99)]), f = 9.8 * hh / (K.c * K.c);
      d = { h: hh, ans: f };
      p = { q: 'Gamma rays sent up a tower $' + hh + '$ m tall arrive with their frequency lowered by $\\Delta f/f = gh/c^2$. Find $\\Delta f/f$. ($g = 9.8$ m/s², $c = 3.00 \\times 10^{8}$ m/s.)',
        a: num(f),
        steps: ['Climbing a height $h$ costs energy $mgh$ for any mass-energy $m$; for a photon, $\\Delta E/E = gh/c^2$, and $E = hf$.', '$\\Delta f/f = 9.8 \\times ' + hh + '/(9.00 \\times 10^{16})$.', '$= ' + tx(f, 3) + '$. ' + (hh < 30 ? 'Pound and Rebka measured this in 1959 at Harvard, the first laboratory test of gravitational redshift.' : 'Tiny, but modern atomic clocks can detect height differences of centimeters this way.')],
        hint: 'Treat the photon\'s energy as if it had mass $E/c^2$ climbing in a field $g$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.tidal-forces', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['tidal', 'scale', 'tidal'], ['moonsun', 'roche', 'tidal'], ['spag', 'radius', 'roche']));
    var id = 'astrophys.tidal-forces', p, d;
    if (kind === 'tidal') {
      var cases = [['the Moon', 7.35e22, 3.84e8, 'across Earth (diameter $1.27 \\times 10^{7}$ m)', 1.27e7], ['the Sun', 1.99e30, 1.50e11, 'across Earth (diameter $1.27 \\times 10^{7}$ m)', 1.27e7], ['Jupiter', 1.90e27, 4.22e8, 'across Io (diameter $3.64 \\times 10^{6}$ m)', 3.64e6], ['Earth', 5.97e24, 3.84e8, 'across the Moon (diameter $3.47 \\times 10^{6}$ m)', 3.47e6]];
      var c = R.pick(cases); if (R.coin()) c = ['a planet', sig(rnd(R, 1e24, 2e27, 2), 2), sig(rnd(R, 2e8, 2e9, 2), 2), 'across a moon of diameter $' + tx(R.int(5, 50) * 1e5, 2) + '$ m', 0]; if (!c[4]) c[4] = +(c[3].match(/\$([0-9.]+) \\times 10\^\{(\d+)\}/) || [0, 1, 6]).slice(1).reduce(function (a, b) { return a * M.pow(10, b); }); var da = 2 * K.G * c[1] * c[4] / cube(c[2]);
      d = { M: c[1], r: c[2], dr: c[4], ans: da };
      p = { q: 'Find the difference in the gravitational acceleration from ' + c[0] + ' (mass $' + tx(c[1], 3) + '$ kg, distance $' + tx(c[2], 3) + '$ m) ' + c[3] + ', using $\\Delta a \\approx 2GM\\,\\Delta r/r^3$. ($G = 6.67 \\times 10^{-11}$.)',
        a: num(da), unit: 'm/s²',
        steps: ['$a(r) = GM/r^2$, so $da/dr = -2GM/r^3$ and, for $\\Delta r \\ll r$, $|\\Delta a| \\approx 2GM\\,\\Delta r/r^3$.', '$2GM\\Delta r = ' + tx(2 * K.G * c[1] * c[4], 3) + '$; $r^3 = ' + tx(cube(c[2]), 3) + '$.', '$\\Delta a = ' + tx(da, 3) + '$ m/s².'],
        hint: 'Use the linear approximation of $GM/r^2$.' };
    } else if (kind === 'scale') {
      var k = R.pick([2, 3, 0.5, 10, 4, 0.6, 0.9, 1.5, 6, 9]), tr = 1 / cube(k), gr = 1 / (k * k), askG = R.coin();
      d = { f: k, askG: askG, ans: askG ? tr / gr : tr };
      p = { q: 'A moon is moved to $' + td(k, 1) + '$ times its distance from its planet. ' + (askG ? 'By what factor does the ratio (tidal force on it)/(gravitational force on it) change?' : 'By what factor does the tidal stretching force on it change?'),
        a: num(askG ? tr / gr : tr),
        steps: ['Gravity goes as $1/r^2$; tidal force (a difference of gravity) goes as $1/r^3$.', 'Tidal factor: $1/' + td(k, 1) + '^3 = ' + tx(tr, 3) + '$; gravity factor: $1/' + td(k, 1) + '^2 = ' + tx(gr, 3) + '$.', askG ? 'Ratio changes by $' + tx(tr, 3) + '/' + tx(gr, 3) + ' = ' + tx(tr / gr, 3) + '$, that is $1/r$.' : 'So the tidal force changes by a factor of $' + tx(tr, 3) + '$.'],
        hint: 'Tidal forces fall off as $1/r^3$.' };
    } else if (kind === 'moonsun') {
      var rS = 1.50e11, rM = R.pick([3.63e8, 3.84e8, 4.06e8]), ratio = (1.99e30 / 7.35e22) * cube(rM / rS);
      d = { rM: rM, ans: ratio };
      p = { q: 'Compare the tides raised on Earth by the Sun ($1.99 \\times 10^{30}$ kg at $1.50 \\times 10^{11}$ m) and the Moon ($7.35 \\times 10^{22}$ kg at $' + tx(rM, 3) + '$ m). Find (Sun\'s tidal effect)/(Moon\'s).',
        a: num(ratio),
        steps: ['Tidal acceleration $\\propto M/r^3$, so the ratio is $\\dfrac{M_\\odot}{M_{\\text{Moon}}}\\left(\\dfrac{r_{\\text{Moon}}}{r_\\odot}\\right)^3$.', '$M_\\odot/M_{\\text{Moon}} = ' + tx(1.99e30 / 7.35e22, 3) + '$; $(r_{\\text{Moon}}/r_\\odot)^3 = ' + tx(cube(rM / rS), 3) + '$.', 'Ratio $= ' + tx(ratio, 3) + '$: the Sun pulls Earth 180 times harder than the Moon does, yet raises smaller tides.'],
        hint: 'Tides depend on $M/r^3$, not $M/r^2$.' };
    } else if (kind === 'roche') {
      var pl = R.pick([['Saturn', 6.03e4, 687], ['Jupiter', 7.15e4, 1330], ['Earth', 6.37e3, 5510], ['Neptune', 2.48e4, 1640]]), rhom = R.pick([500, 900, 1000, 2000, 3000, 600, 700, 800, 1500, 2500]), dR = pl[1] * M.pow(2 * pl[2] / rhom, 1 / 3);
      d = { Rp: pl[1], rhoP: pl[2], rhom: rhom, ans: dR };
      p = { q: 'A small rigid moon of density $' + tx(rhom, 2) + '$ kg/m³ approaches ' + pl[0] + ' (radius $' + tx(pl[1], 3) + '$ km, density $' + tx(pl[2], 3) + '$ kg/m³). Loose rocks on its surface are pulled off when the tidal pull beats the moon\'s own gravity, at $d = R_P\\left(2\\rho_P/\\rho_m\\right)^{1/3}$. Find $d$ in km.',
        a: num(dR), unit: 'km',
        steps: ['A rock on the near side feels the moon\'s gravity $Gm/r^2$ and the tidal pull $2GM\\,r/d^3$; equal when $d^3 = 2Mr^3/m$, and writing the masses with densities gives $d = R_P(2\\rho_P/\\rho_m)^{1/3}$.', '$(2 \\times ' + tx(pl[2], 3) + '/' + tx(rhom, 2) + ')^{1/3} = ' + td(M.pow(2 * pl[2] / rhom, 1 / 3), 3) + '$.', '$d = ' + tx(pl[1], 3) + ' \\times ' + td(M.pow(2 * pl[2] / rhom, 1 / 3), 3) + ' = ' + tx(dR, 3) + '$ km. (A fluid body breaks up farther out, near $2.44R_P(\\rho_P/\\rho_m)^{1/3}$.)'],
        hint: 'Compare the moon\'s self-gravity at its surface with the tidal pull across its radius.' };
    } else if (kind === 'spag') {
      var Mb = sig(rnd(R, 3, 1e9, 2), 2), dr = 2, rs = 2 * K.G * Mb * K.Msun / (K.c * K.c), da2 = 2 * K.G * Mb * K.Msun * dr / cube(rs);
      d = { M: Mb, ans: da2 };
      p = { q: 'A 2 m tall astronaut falls feet first toward a black hole of $' + tx(Mb, 2) + '\\,M_\\odot$. What is the difference in gravitational acceleration between feet and head as she crosses the event horizon? Use $\\Delta a = 2GM\\Delta r/r^3$ with $r = r_s = 2GM/c^2$. ($G = 6.67 \\times 10^{-11}$, $c = 3.00 \\times 10^{8}$ m/s, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(da2), unit: 'm/s²',
        steps: ['$r_s = ' + tx(rs, 3) + '$ m.', '$\\Delta a = 2GM(2\\text{ m})/r_s^3 = ' + tx(2 * K.G * Mb * K.Msun * 2, 3) + '/' + tx(cube(rs), 3) + '$.', '$\\Delta a = ' + tx(da2, 3) + '$ m/s², ' + (da2 > 1e3 ? 'enough to stretch her apart ("spaghettification") before she even reaches the horizon.' : 'gentle: at a giant black hole she would cross the horizon without feeling anything unusual.')],
        hint: 'Find $r_s$ first; then $\\Delta a \\propto M/r_s^3 \\propto 1/M^2$.' };
    } else { // radius
      var Mb2 = R.int(3, 60), amax = R.pick([10, 100, 1000, 50, 500, 12, 35, 90, 350, 900]) * 9.8, dr2 = 2, rr = M.pow(2 * K.G * Mb2 * K.Msun * dr2 / amax, 1 / 3), rs2 = 2 * K.G * Mb2 * K.Msun / (K.c * K.c);
      d = { M: Mb2, a: amax, ans: rr / 1e3 };
      p = { q: 'At what distance from a $' + Mb2 + '\\,M_\\odot$ black hole does the tidal difference across a 2 m body reach $' + tx(amax, 3) + '$ m/s²? Give the distance in km. ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: num(rr / 1e3), unit: 'km',
        steps: ['$2GM\\Delta r/r^3 = \\Delta a$, so $r = (2GM\\Delta r/\\Delta a)^{1/3}$.', '$2GM\\Delta r = ' + tx(2 * K.G * Mb2 * K.Msun * dr2, 3) + '$; divided by $' + tx(amax, 3) + '$: $' + tx(2 * K.G * Mb2 * K.Msun * dr2 / amax, 3) + '$ m³.', '$r = ' + tx(rr, 3) + '$ m $= ' + tx(rr / 1e3, 3) + '$ km, far outside the horizon ($r_s = ' + tx(rs2 / 1e3, 3) + '$ km).'],
        hint: 'Solve the tidal formula for $r$.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.accretion-power', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['eff', 'compare', 'eff'], ['L', 'mdot', 'compare'], ['quasar', 'eddrate', 'L']));
    var id = 'astrophys.accretion-power', p, d;
    var WD = [[0.4, 10700], [0.5, 9700], [0.6, 8700], [0.7, 7900], [0.8, 7100], [0.9, 6500], [1.0, 5800], [1.1, 5000], [1.2, 4000]];
    function nsObj() { return ['a neutron star', R.pick([1.2, 1.3, 1.4, 1.4, 1.5, 1.6, 1.8, 2.0]), R.int(10, 13)]; }
    function wdObj() { var w = R.pick(WD); return ['a white dwarf', w[0], w[1]]; }
    var objs = [nsObj(), nsObj(), wdObj(), wdObj()];
    if (kind === 'eff' || kind === 'compare') {
      var o = R.pick(objs), e = K.G * o[1] * K.Msun / (o[2] * 1e3), eff = e / (K.c * K.c), askEff = kind === 'eff' && R.coin();
      var ans = kind === 'compare' ? e / (0.007 * K.c * K.c) : askEff ? eff * 100 : e;
      d = { M: o[1], R: o[2], kind2: kind === 'compare' ? 'c' : askEff ? 'eff' : 'e', ans: ans };
      p = { q: 'Gas falls from far away onto ' + o[0] + ' of $' + td(o[1], 1) + '\\,M_\\odot$ and radius $' + tx(o[2], 2) + '$ km. ' + (kind === 'compare' ? 'How many times more energy does each kilogram release than fusing a kilogram of hydrogen into helium (which releases $0.007c^2$)?' : askEff ? 'What percentage of the gas\'s rest energy $mc^2$ is released?' : 'How much energy does each kilogram release?') + ' ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $c = 3.00 \\times 10^{8}$ m/s.)',
        a: askEff ? Object.assign(num(ans), { pct: true }) : num(ans), unit: kind === 'eff' && !askEff ? 'J/kg' : undefined,
        steps: ['Falling from far away to radius $R$ releases $GM/R$ per kilogram.', '$GM/R = 6.67 \\times 10^{-11} \\times ' + tx(o[1] * K.Msun, 3) + '/' + tx(o[2] * 1e3, 2) + ' = ' + tx(e, 3) + '$ J/kg.'].concat(kind === 'compare' ? ['Fusion: $0.007 \\times 9.00 \\times 10^{16} = 6.3 \\times 10^{14}$ J/kg. Ratio: $' + tx(ans, 3) + '$.'] : askEff ? ['As a fraction of $c^2 = 9.00 \\times 10^{16}$ J/kg: $' + tx(eff, 3) + '$, or $' + tx(ans, 3) + '\\%$.'] : []),
        hint: 'Potential energy per kilogram at the surface is $GM/R$.' };
      if (!(kind === 'eff' && !askEff)) delete p.unit;
    } else if (kind === 'L' || kind === 'mdot') {
      var o2 = R.pick(objs.slice(0, 2)), e2 = K.G * o2[1] * K.Msun / (o2[2] * 1e3);
      if (kind === 'L') {
        var md = sig(rnd(R, 1e10, 1e15, 2), 2), Lacc = e2 * md;
        d = { M: o2[1], R: o2[2], mdot: md, ans: Lacc };
        p = { q: 'Gas from a companion star lands on a neutron star ($' + td(o2[1], 1) + '\\,M_\\odot$, radius $' + o2[2] + '$ km) at $' + tx(md, 2) + '$ kg/s. What is the accretion luminosity $L = GM\\dot m/R$? ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
          a: num(Lacc), unit: 'W',
          steps: ['$GM/R = ' + tx(e2, 3) + '$ J/kg.', '$L = ' + tx(e2, 3) + ' \\times ' + tx(md, 2) + '$.', '$L = ' + tx(Lacc, 3) + '$ W (about $' + tx(Lacc / K.Lsun, 2) + '\\,L_\\odot$), mostly as X-rays.'],
          hint: 'Energy per kilogram times kilograms per second.' };
      } else {
        var Lx = sig(rnd(R, 1e28, 1e31, 2), 2), md2 = Lx / e2;
        d = { M: o2[1], R: o2[2], L: Lx, ans: md2 };
        p = { q: 'An X-ray binary shines with $L = ' + tx(Lx, 2) + '$ W, powered by gas falling onto a neutron star of $' + td(o2[1], 1) + '\\,M_\\odot$ and radius $' + o2[2] + '$ km. How much mass must fall in per second? ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
          a: num(md2), unit: 'kg/s',
          steps: ['$L = GM\\dot m/R$, so $\\dot m = LR/(GM)$.', '$GM/R = ' + tx(e2, 3) + '$ J/kg.', '$\\dot m = ' + tx(Lx, 2) + '/' + tx(e2, 3) + ' = ' + tx(md2, 3) + '$ kg/s.'],
          hint: 'Divide the luminosity by the energy released per kilogram.' };
      }
    } else if (kind === 'quasar') {
      var Lq = sig(rnd(R, 1e38, 1e41, 2), 2), eps = R.pick([0.06, 0.1, 0.1, 0.2, 0.3, 0.07, 0.08, 0.09, 0.15, 0.25]), mq = Lq / (eps * K.c * K.c) * K.yr / K.Msun;
      d = { L: Lq, eps: eps, ans: mq };
      p = { q: 'A quasar shines with $' + tx(Lq, 2) + '$ W. If gas spiraling into its black hole radiates a fraction $\\epsilon = ' + eps + '$ of its rest energy, how many solar masses must it swallow per year? ($c = 3.00 \\times 10^{8}$ m/s, $M_\\odot = 1.99 \\times 10^{30}$ kg, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(mq), unit: 'M☉ per year',
        steps: ['$L = \\epsilon\\dot mc^2$, so $\\dot m = L/(\\epsilon c^2) = ' + tx(Lq, 2) + '/(' + eps + ' \\times 9.00 \\times 10^{16}) = ' + tx(Lq / (eps * K.c * K.c), 3) + '$ kg/s.', 'Per year: $' + tx(Lq / (eps * K.c * K.c) * K.yr, 3) + '$ kg.', '$= ' + tx(mq, 3) + '\\,M_\\odot$ per year.'],
        hint: 'Luminosity = efficiency × mass rate × $c^2$.' };
      delete p.unit;
    } else { // eddrate
      var Mn = 1.4, Rk = R.pick([10, 12]), LE = 4 * M.PI * K.G * Mn * K.Msun * K.mp * K.c / K.sigmaT, e3 = K.G * Mn * K.Msun / (Rk * 1e3), mE = LE / e3, askYr = R.coin(), ans = askYr ? mE * K.yr / K.Msun : mE;
      d = { R: Rk, askYr: askYr, ans: ans };
      p = { q: 'A $1.4\\,M_\\odot$ neutron star of radius $' + Rk + '$ km accretes gas. At what rate ' + (askYr ? 'in solar masses per year' : 'in kg/s') + ' would its accretion luminosity $GM\\dot m/R$ reach the Eddington limit $4\\pi GMm_pc/\\sigma_T$? ($G = 6.67 \\times 10^{-11}$, $m_p = 1.67 \\times 10^{-27}$ kg, $c = 3.00 \\times 10^{8}$ m/s, $\\sigma_T = 6.65 \\times 10^{-29}$ m², $M_\\odot = 1.99 \\times 10^{30}$ kg' + (askYr ? ', $1\\text{ yr} = 3.16 \\times 10^{7}$ s' : '') + '.)',
        a: num(ans), unit: askYr ? undefined : 'kg/s',
        steps: ['$GM\\dot m/R = 4\\pi GMm_pc/\\sigma_T$ gives $\\dot m_{\\text{Edd}} = 4\\pi Rm_pc/\\sigma_T$: $G$ and $M$ cancel.', '$\\dot m = 4\\pi(' + tx(Rk * 1e3, 2) + ')(1.67 \\times 10^{-27})(3.00 \\times 10^{8})/6.65 \\times 10^{-29} = ' + tx(mE, 3) + '$ kg/s.'].concat(askYr ? ['Per year: $' + tx(mE * K.yr / K.Msun, 3) + '\\,M_\\odot$.'] : []),
        hint: 'Set the accretion luminosity equal to the Eddington luminosity.' };
      if (askYr) delete p.unit;
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.gravitational-waves', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['dL', 'fgw', 'concept'], ['energy', 'distance', 'fgw', 'concept'], ['bound', 'energy', 'concept']));
    var id = 'astrophys.gravitational-waves', p, d;
    if (kind === 'dL') {
      var h = sig(R.real(0.5, 3, 1), 2) * 1e-21, Larm = R.pick([4000, 3000, 4000]), dL = h * Larm;
      d = { h: h, L: Larm, ans: dL };
      p = { q: 'A gravitational wave with strain $h = ' + tx(h, 2) + '$ passes a detector arm $' + tx(Larm, 2) + '$ m long. By how much does the arm\'s length change, $\\Delta L = hL$?',
        a: num(dL), unit: 'm',
        steps: ['Strain is the fractional change in length: $h = \\Delta L/L$.', '$\\Delta L = ' + tx(h, 2) + ' \\times ' + tx(Larm, 2) + '$ m.', '$\\Delta L = ' + tx(dL, 3) + '$ m, less than a hundredth of a proton\'s width.'],
        hint: 'Strain times length.' };
    } else if (kind === 'fgw') {
      var forb = R.pick([10, 20, 35, 50, 100, 0.0001]), askOrb = R.coin(), fg = 2 * forb;
      d = { f: forb, askOrb: askOrb, ans: askOrb ? forb : fg };
      p = { q: askOrb ? 'A detector records gravitational waves at $' + tx(fg, 2) + '$ Hz from two orbiting black holes. How many orbits per second do they make?' : 'Two compact stars orbit each other $' + tx(forb, 2) + '$ times per second. At what frequency do they emit gravitational waves?',
        a: num(askOrb ? forb : fg), unit: 'Hz',
        steps: ['An orbiting pair looks the same after half an orbit (the two masses have swapped places), so the wave pattern repeats twice per orbit.', '$f_{\\text{GW}} = 2f_{\\text{orb}}$.', askOrb ? '$f_{\\text{orb}} = ' + tx(fg, 2) + '/2 = ' + tx(forb, 2) + '$ Hz.' : '$f_{\\text{GW}} = 2 \\times ' + tx(forb, 2) + ' = ' + tx(fg, 2) + '$ Hz.'],
        hint: 'The pattern repeats every half orbit.' };
    } else if (kind === 'energy') {
      var dm = R.pick([3, 3.1, 2.5, 5, 9]), E = dm * K.Msun * K.c * K.c, askSun = R.coin(), sunLife = K.Lsun * 1e10 * K.yr, ans = askSun ? E / sunLife : E;
      d = { dm: dm, askSun: askSun, ans: ans };
      p = { q: 'In a black-hole merger about $' + dm + '\\,M_\\odot$ of mass-energy left as gravitational waves in a fraction of a second. ' + (askSun ? 'How many times the Sun\'s entire 10-billion-year light output is that?' : 'How much energy is that?') + ' ($M_\\odot = 1.99 \\times 10^{30}$ kg, $c = 3.00 \\times 10^{8}$ m/s' + (askSun ? ', $L_\\odot = 3.83 \\times 10^{26}$ W, $1\\text{ yr} = 3.16 \\times 10^{7}$ s' : '') + '.)',
        a: num(ans), unit: askSun ? undefined : 'J',
        steps: ['$E = \\Delta mc^2 = ' + dm + ' \\times 1.99 \\times 10^{30} \\times 9.00 \\times 10^{16}$.', '$E = ' + tx(E, 3) + '$ J.'].concat(askSun ? ['The Sun over 10 billion years: $3.83 \\times 10^{26} \\times 3.16 \\times 10^{17} = ' + tx(sunLife, 3) + '$ J. Ratio: $' + tx(ans, 3) + '$.'] : []),
        hint: 'Use $E = mc^2$.' };
      if (askSun) delete p.unit;
    } else if (kind === 'distance') {
      var Mpc = R.pick([40, 410, 440, 100, 1000]), ly = Mpc * 3.26e6;
      d = { Mpc: Mpc, ans: ly / 1e6 };
      p = { q: 'A gravitational-wave source is about $' + Mpc + '$ Mpc away. How long ago, in millions of years, did the waves leave it? Gravitational waves travel at the speed of light. ($1\\text{ pc} = 3.26$ ly.)',
        a: num(ly / 1e6), unit: 'million years',
        steps: ['$' + Mpc + '\\text{ Mpc} = ' + tx(Mpc * 1e6, 3) + '$ pc $= ' + tx(ly, 3) + '$ ly.', 'Light (and gravitational waves) cover one light-year per year.', 'They left about $' + tx(ly / 1e6, 3) + '$ million years ago.'],
        hint: 'Convert to light-years; each light-year takes a year.' };
    } else if (kind === 'bound') {
      var Mpc2 = R.pick([40, 40, 30, 100]), dt = R.pick([1.7, 1.7, 2, 10]), frac = K.c * dt / (Mpc2 * 1e6 * K.pc);
      d = { Mpc: Mpc2, dt: dt, ans: frac };
      p = { q: 'Gravitational waves and gamma rays from a neutron-star merger $' + Mpc2 + '$ Mpc away arrived within $' + dt + '$ s of each other. Assuming they left together, by at most what fraction could their speeds differ? ($c = 3.00 \\times 10^{8}$ m/s, $1\\text{ pc} = 3.09 \\times 10^{16}$ m.)',
        a: num(frac),
        steps: ['Over a trip of time $t = d/c$, a speed difference $\\Delta v$ makes an arrival gap $\\Delta t \\approx t\\,\\Delta v/c$, so $\\Delta v/c \\approx c\\,\\Delta t/d$.', '$d = ' + tx(Mpc2 * 1e6 * K.pc, 3) + '$ m.', '$\\Delta v/c \\lesssim 3.00 \\times 10^{8} \\times ' + dt + '/' + tx(Mpc2 * 1e6 * K.pc, 3) + ' = ' + tx(frac, 2) + '$: gravity travels at the speed of light.'],
        hint: 'The fractional delay equals the fractional speed difference.' };
    } else {
      var c = R.pick([
        ['What are gravitational waves?', 'Ripples in spacetime itself that travel at the speed of light, stretching and squeezing distances across their direction of travel.', ['Sound waves that travel through the gas between galaxies.', 'Waves on the surface of water or in air, driven by gravity.', 'Beams of gravitons that pull detectors toward the source.']],
        ['When was the first direct detection of gravitational waves, and what made them?', 'September 14, 2015, by LIGO: two black holes of about 36 and 29 solar masses merging about 1.3 billion light-years away.', ['1974, from the Hulse–Taylor binary pulsar exploding.', '1987, from Supernova 1987A in the Large Magellanic Cloud.', '2019, from the Event Horizon Telescope\'s image of M87\'s black hole.']],
        ['How did astronomers know gravitational waves were real before LIGO?', 'The orbit of the Hulse–Taylor binary pulsar, discovered in 1974, shrinks at exactly the rate general relativity predicts for energy lost to gravitational waves.', ['Satellites measured Earth\'s orbit shrinking.', 'Telescopes photographed the waves around the Sun.', 'Ocean tides showed the waves passing through Earth.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['General relativity (Einstein, 1916) predicts that accelerating masses send out waves of spacetime curvature at the speed of light; they are not sound and not water or air waves.', 'The Hulse–Taylor pulsar\'s orbital decay confirmed them indirectly (Nobel Prize 1993). LIGO detected them directly on September 14, 2015, from merging black holes (Nobel Prize 2017).'],
        hint: 'They are a prediction of general relativity, not of fluid mechanics.' };
    }
    return chk(id, d, p, kind);
  });

  // =====================================================================================================
  // Unit 5. Galaxies and Cosmology
  // =====================================================================================================
  var KPC = 3.09e19, MPC = 3.09e22;

  G('astrophys.rotation-curves', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['mass', 'period', 'mass'], ['kepler', 'dark', 'mass'], ['flat', 'dark', 'density']));
    var id = 'astrophys.rotation-curves', p, d, GV = '$G = 6.67 \\times 10^{-11}$, $1\\text{ kpc} = 3.09 \\times 10^{19}$ m, $M_\\odot = 1.99 \\times 10^{30}$ kg';
    var v = R.int(10, 30) * 10, r = R.int(2, 40);
    if (kind === 'mass') {
      var Mr = M.pow(v * 1e3, 2) * r * KPC / K.G / K.Msun;
      d = { v: v, r: r, ans: Mr };
      p = { q: 'Gas clouds $' + r + '$ kpc from the center of a spiral galaxy orbit at $' + v + '$ km/s. How much mass lies inside that radius, in solar masses? (' + GV + '.)',
        a: num(Mr), unit: 'M☉',
        steps: ['For a circular orbit, $v^2/r = GM(r)/r^2$ (only the mass inside counts, as for a sphere), so $M(r) = v^2r/G$.', '$v^2r = (' + tx(v * 1e3, 3) + ')^2 \\times ' + tx(r * KPC, 3) + ' = ' + tx(v * v * 1e6 * r * KPC, 3) + '$.', '$M = ' + tx(Mr * K.Msun, 3) + '$ kg $= ' + tx(Mr, 3) + '\\,M_\\odot$.'],
        hint: 'Set the centripetal acceleration equal to $GM(r)/r^2$.' };
    } else if (kind === 'period') {
      var T = 2 * M.PI * r * KPC / (v * 1e3) / K.yr / 1e6;
      d = { v: v, r: r, ans: T };
      p = { q: 'A star orbits its galaxy\'s center at $' + r + '$ kpc with speed $' + v + '$ km/s. How long does one orbit take, in millions of years? ($1\\text{ kpc} = 3.09 \\times 10^{19}$ m, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(T), unit: 'Myr',
        steps: ['$T = 2\\pi r/v$.', '$= 2\\pi \\times ' + tx(r * KPC, 3) + '/' + tx(v * 1e3, 3) + ' = ' + tx(T * 1e6 * K.yr, 3) + '$ s.', '$T \\approx ' + tx(T, 3) + '$ million years.'],
        hint: 'Circumference over speed.' };
    } else if (kind === 'kepler') {
      var r1 = R.int(3, 10), f = R.pick([2, 3, 4, 5]), v2 = v * M.sqrt(1 / f);
      d = { v: v, r1: r1, f: f, ans: v2 };
      p = { q: 'Stars at $' + r1 + '$ kpc in a galaxy orbit at $' + v + '$ km/s. If nearly all of the galaxy\'s mass lay inside $' + r1 + '$ kpc, how fast would gas at $' + (f * r1) + '$ kpc orbit?',
        a: num(v2), unit: 'km/s',
        steps: ['With all the mass inside, $v = \\sqrt{GM/r}$, so $v \\propto r^{-1/2}$ (a Keplerian decline, like the planets).', '$v_2 = ' + v + '\\sqrt{' + r1 + '/' + (f * r1) + '} = ' + v + '/\\sqrt{' + f + '}$.', '$v_2 = ' + tx(v2, 3) + '$ km/s. Real rotation curves stay near ' + v + ' km/s instead, which is the evidence for dark matter.'],
        hint: 'With the mass fixed, $v^2r$ is constant.' };
    } else if (kind === 'dark') {
      r = R.int(3, 12); var r2 = r * R.pick([2, 3, 4, 5]), Mvis = sig(M.pow(v * 1e3, 2) * r * KPC / K.G / K.Msun * R.real(0.6, 1, 1), 2), Mtot = M.pow(v * 1e3, 2) * r2 * KPC / K.G / K.Msun, Md = Mtot - Mvis;
      d = { v: v, r2: r2, Mvis: Mvis, ans: Md };
      p = { q: 'A galaxy\'s rotation curve stays flat at $' + v + '$ km/s out to $' + r2 + '$ kpc, but its stars and gas add up to only $' + tx(Mvis, 2) + '\\,M_\\odot$. How much dark matter lies within $' + r2 + '$ kpc? (' + GV + '.)',
        a: num(Md, { rtol: 0.03 }), unit: 'M☉',
        steps: ['Total mass inside $r$: $M = v^2r/G = (' + tx(v * 1e3, 3) + ')^2(' + tx(r2 * KPC, 3) + ')/6.67 \\times 10^{-11}$.', '$M = ' + tx(Mtot * K.Msun, 3) + '$ kg $= ' + tx(Mtot, 3) + '\\,M_\\odot$.', 'Dark: $' + tx(Mtot, 3) + ' - ' + tx(Mvis, 2) + ' = ' + tx(Md, 3) + '\\,M_\\odot$, ' + tx(100 * Md / Mtot, 2) + '% of the total.'],
        hint: 'The rotation speed weighs everything inside $r$, seen or not.' };
    } else if (kind === 'flat') {
      var ra = R.int(5, 15), rb = ra * R.pick([2, 3, 4, 5]), fr = rb / ra;
      d = { ra: ra, rb: rb, ans: fr };
      p = { q: 'A galaxy\'s rotation curve is flat (same speed) from $' + ra + '$ kpc out to $' + rb + '$ kpc. By what factor is the mass inside $' + rb + '$ kpc larger than the mass inside $' + ra + '$ kpc?',
        a: num(fr),
        steps: ['$M(r) = v^2r/G$.', 'With $v$ the same, $M \\propto r$.', 'Factor $= ' + rb + '/' + ra + ' = ' + tx(fr, 3) + '$: mass keeps growing where hardly any light does.'],
        hint: 'Use $M(r) = v^2r/G$ with constant $v$.' };
    } else { // density of the dark halo for a flat curve
      var rho = M.pow(v * 1e3, 2) / (4 * M.PI * K.G * M.pow(r * KPC, 2)), rhoS = rho * cube(KPC / 1000) / K.Msun;
      d = { v: v, r: r, ans: rhoS };
      p = { q: 'For a flat rotation curve, $M(r) = v^2r/G$, so the density at radius $r$ is $\\rho = \\dfrac{1}{4\\pi r^2}\\dfrac{dM}{dr} = \\dfrac{v^2}{4\\pi Gr^2}$. Find $\\rho$ at $' + r + '$ kpc for $v = ' + v + '$ km/s, in solar masses per cubic parsec. (' + GV + ', $1\\text{ pc} = 3.09 \\times 10^{16}$ m.)',
        a: num(rhoS), unit: 'M☉/pc³',
        steps: ['$\\rho = (' + tx(v * 1e3, 3) + ')^2/(4\\pi \\times 6.67 \\times 10^{-11} \\times (' + tx(r * KPC, 3) + ')^2) = ' + tx(rho, 3) + '$ kg/m³.', 'One cubic parsec is $(3.09 \\times 10^{16})^3 = ' + tx(cube(KPC / 1000), 3) + '$ m³.', '$\\rho = ' + tx(rhoS, 3) + '\\,M_\\odot$/pc³, and it falls as $1/r^2$.'],
        hint: 'Differentiate $M(r) = v^2r/G$ and divide by the area of a shell.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.supermassive-black-holes', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['mass', 'rs', 'mass'], ['angle', 'fraction', 'rs'], ['shadow', 'speed', 'influence']));
    var id = 'astrophys.supermassive-black-holes', p, d;
    if (kind === 'mass') {
      var a = R.int(30, 200) * 10, Pp = sig(R.real(5, 60, 1), 2), Mm = cube(a) / (Pp * Pp);
      d = { a: a, P: Pp, ans: Mm / 1e6 };
      p = { q: 'A star near the center of a galaxy follows an ellipse with semi-major axis $' + tx(a, 3) + '$ AU and period $' + tx(Pp, 2) + '$ years. What mass does it orbit, in millions of solar masses?',
        a: num(Mm / 1e6), unit: 'million M☉',
        steps: ['Kepler\'s third law: $M = a^3/P^2$ (AU, years, solar masses), with the star\'s own mass negligible.', '$a^3 = ' + tx(cube(a), 3) + '$; $P^2 = ' + tx(Pp * Pp, 3) + '$.', '$M = ' + tx(Mm, 3) + '\\,M_\\odot \\approx ' + tx(Mm / 1e6, 3) + '$ million solar masses.'],
        hint: 'Use $M = a^3/P^2$ in solar units.' };
    } else if (kind === 'angle') {
      var al = sig(R.real(0.08, 0.2, 3), 3), dk = sig(R.real(7.8, 8.4, 2), 2), Pp2 = sig(R.real(12, 20, 1), 3), a2 = al * dk * 1000, M2 = cube(a2) / (Pp2 * Pp2);
      d = { alpha: al, dist: dk, P: Pp2, ans: M2 / 1e6 };
      p = { q: 'The star S2 orbits Sagittarius A* with an angular semi-major axis of $' + tx(al, 3) + '\'\'$ and a period of $' + tx(Pp2, 3) + '$ years. The galactic center is $' + tx(dk, 2) + '$ kpc away. Find the black hole\'s mass in millions of solar masses.',
        a: num(M2 / 1e6, { rtol: 0.03 }), unit: 'million M☉',
        steps: ['$a\\,(\\text{AU}) = \\alpha\\,(\'\') \\times d\\,(\\text{pc}) = ' + tx(al, 3) + ' \\times ' + tx(dk * 1000, 3) + ' = ' + tx(a2, 3) + '$ AU.', '$M = a^3/P^2 = ' + tx(cube(a2), 3) + '/' + tx(Pp2 * Pp2, 3) + '$.', '$M = ' + tx(M2, 3) + '\\,M_\\odot \\approx ' + tx(M2 / 1e6, 3) + '$ million.'],
        hint: 'Convert the angle to AU first, as for a visual binary.' };
    } else if (kind === 'rs') {
      var Mb = R.pick([4.3e6, 6.5e9, 1e8, 2e7, 1e9, 3e6]), rs = 2 * K.G * Mb * K.Msun / (K.c * K.c), askAU = Mb > 5e7;
      d = { M: Mb, askAU: askAU, ans: askAU ? rs / K.AU : rs / 1e3 };
      p = { q: 'What is the Schwarzschild radius of a $' + tx(Mb, 2) + '\\,M_\\odot$ black hole, in ' + (askAU ? 'AU' : 'km') + '? ($G = 6.67 \\times 10^{-11}$, $c = 3.00 \\times 10^{8}$ m/s, $M_\\odot = 1.99 \\times 10^{30}$ kg' + (askAU ? ', $1\\text{ AU} = 1.496 \\times 10^{11}$ m' : '') + '.)',
        a: num(askAU ? rs / K.AU : rs / 1e3), unit: askAU ? 'AU' : 'km',
        steps: ['$r_s = 2GM/c^2 = 2 \\times 6.67 \\times 10^{-11} \\times ' + tx(Mb * K.Msun, 3) + '/9.00 \\times 10^{16}$.', '$r_s = ' + tx(rs, 3) + '$ m.', askAU ? '$r_s = ' + tx(rs / K.AU, 3) + '$ AU.' : '$r_s = ' + tx(rs / 1e3, 3) + '$ km.'],
        hint: 'About 3 km per solar mass.' };
    } else if (kind === 'fraction') {
      var Mb2 = R.pick([4.3e6, 4.3e6, 1e8, 6.5e9]), v = R.int(18, 30) * 10, r = R.int(5, 20), Mg = M.pow(v * 1e3, 2) * r * KPC / K.G / K.Msun, fr = Mb2 / Mg * 100;
      d = { Mb: Mb2, v: v, r: r, ans: fr };
      p = { q: 'A galaxy\'s central black hole has $' + tx(Mb2, 2) + '\\,M_\\odot$. Its rotation speed at $' + r + '$ kpc is $' + v + '$ km/s. What percentage of the mass inside $' + r + '$ kpc is in the black hole? ($G = 6.67 \\times 10^{-11}$, $1\\text{ kpc} = 3.09 \\times 10^{19}$ m, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: Object.assign(num(fr), { pct: true }),
        steps: ['Mass inside $r$: $v^2r/G = ' + tx(Mg * K.Msun, 3) + '$ kg $= ' + tx(Mg, 3) + '\\,M_\\odot$.', 'Fraction: $' + tx(Mb2, 2) + '/' + tx(Mg, 3) + ' = ' + tx(fr / 100, 3) + '$.', 'That is $' + tx(fr, 3) + '\\%$: tiny. The black hole dominates only the innermost region.'],
        hint: 'Weigh the galaxy with its rotation curve first.' };
    } else if (kind === 'shadow') {
      var tg = R.pick([['Sagittarius A*', 4.3e6, 8.2e3], ['M87*', 6.5e9, 16.8e6]]), rs2 = 2 * K.G * tg[1] * K.Msun / (K.c * K.c), th = M.sqrt(27) * rs2 / (tg[2] * 3.09e16) * 206265 * 1e6;
      d = { M: tg[1], dpc: tg[2], ans: th };
      p = { q: 'A black hole\'s "shadow", the dark disk seen against glowing gas, has a diameter of about $\\sqrt{27}\\,r_s$. For ' + tg[0] + ' ($' + tx(tg[1], 2) + '\\,M_\\odot$, $' + tx(tg[2] / 1000, 3) + '$ kpc away), what angle does it span, in microarcseconds? ($r_s = 2GM/c^2$; $G = 6.67 \\times 10^{-11}$, $c = 3.00 \\times 10^{8}$ m/s, $M_\\odot = 1.99 \\times 10^{30}$ kg, $1\\text{ pc} = 3.09 \\times 10^{16}$ m, $1\\text{ rad} = 206{,}265\'\'$.)',
        a: num(th, { rtol: 0.03 }), unit: 'μas',
        steps: ['$r_s = ' + tx(rs2, 3) + '$ m, so the shadow is $\\sqrt{27} \\times ' + tx(rs2, 3) + ' = ' + tx(M.sqrt(27) * rs2, 3) + '$ m across.', 'Angle: $' + tx(M.sqrt(27) * rs2, 3) + '/' + tx(tg[2] * 3.09e16, 3) + ' = ' + tx(M.sqrt(27) * rs2 / (tg[2] * 3.09e16), 3) + '$ rad.', 'Times $206{,}265 \\times 10^{6}$: $' + tx(th, 3) + '$ μas. The Event Horizon Telescope imaged rings of about this size.'],
        hint: 'Size over distance gives the angle in radians.' };
    } else if (kind === 'speed') {
      var Mb3 = 4.3e6, a3 = R.int(90, 110) * 10, e = R.pick([0.88, 0.89, 0.9, 0.85]), rp = a3 * (1 - e), GM = K.G * Mb3 * K.Msun, vp = M.sqrt(GM * (2 / (rp * K.AU) - 1 / (a3 * K.AU))) / 1e3;
      d = { a: a3, e: e, ans: vp };
      p = { q: 'A star orbits the $4.3 \\times 10^{6}\\,M_\\odot$ black hole at the Milky Way\'s center on an ellipse with $a = ' + tx(a3, 3) + '$ AU and eccentricity $e = ' + e + '$. How fast does it move at its closest approach? Use $v^2 = GM(2/r - 1/a)$. ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $1\\text{ AU} = 1.496 \\times 10^{11}$ m.)',
        a: num(vp), unit: 'km/s',
        steps: ['Closest approach: $r_p = a(1 - e) = ' + tx(rp, 3) + '$ AU $= ' + tx(rp * K.AU, 3) + '$ m.', '$GM = ' + tx(GM, 3) + '$ m³/s²; $2/r_p - 1/a = ' + tx(2 / (rp * K.AU) - 1 / (a3 * K.AU), 3) + '$ m⁻¹.', '$v = ' + tx(vp * 1e3, 3) + '$ m/s $= ' + tx(vp, 3) + '$ km/s, a few percent of the speed of light.'],
        hint: 'Use the vis-viva equation at $r = a(1 - e)$.' };
    } else { // influence
      var Mb4 = R.pick([4.3e6, 1e8, 1e9, 6.5e9]), sg = R.pick([100, 150, 200, 250, 300, 350, 120]), ri = K.G * Mb4 * K.Msun / M.pow(sg * 1e3, 2) / 3.09e16;
      d = { M: Mb4, s: sg, ans: ri };
      p = { q: 'A black hole dominates the motions of stars out to roughly $r = GM/\\sigma^2$, where $\\sigma$ is the stars\' typical speed. Find $r$ in parsecs for $M = ' + tx(Mb4, 2) + '\\,M_\\odot$ and $\\sigma = ' + sg + '$ km/s. ($G = 6.67 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $1\\text{ pc} = 3.09 \\times 10^{16}$ m.)',
        a: num(ri), unit: 'pc',
        steps: ['$GM = ' + tx(K.G * Mb4 * K.Msun, 3) + '$ m³/s²; $\\sigma^2 = ' + tx(M.pow(sg * 1e3, 2), 3) + '$ m²/s².', '$r = ' + tx(K.G * Mb4 * K.Msun / M.pow(sg * 1e3, 2), 3) + '$ m.', '$r = ' + tx(ri, 3) + '$ pc: a tiny region compared with a galaxy tens of thousands of parsecs across.'],
        hint: 'Where the black hole\'s pull sets an orbital speed like the stars\' own.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.distance-ladder', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['cepheid', 'sn', 'plx'], ['cepheid', 'error', 'sn'], ['chain', 'error', 'cepheid']));
    var id = 'astrophys.distance-ladder', p, d;
    if (kind === 'cepheid') {
      var P = R.pick([3, 5, 10, 20, 30, 50]) * R.pick([1, 1.2]), Mv = -2.43 * (log10(P) - 1) - 4.05, mu = R.real(12, 30, 1), m = +(Mv + mu).toFixed(1), dd = M.pow(10, (m - Mv + 5) / 5), Mpc = dd / 1e6;
      d = { P: P, m: m, ans: Mpc };
      p = { q: 'A Cepheid in a distant galaxy pulsates with a period of $' + tx(P, 2) + '$ days and has average apparent magnitude $m = ' + td(m, 1) + '$. Using the period–luminosity relation $M_V = -2.43(\\log_{10}P - 1) - 4.05$ (P in days), find the galaxy\'s distance in megaparsecs.',
        a: num(Mpc, { rtol: 0.03 }), unit: 'Mpc',
        steps: ['$\\log_{10}' + tx(P, 2) + ' = ' + td(log10(P), 3) + '$, so $M_V = -2.43(' + td(log10(P) - 1, 3) + ') - 4.05 = ' + td(Mv, 2) + '$.', '$m - M = ' + td(m, 1) + ' - (' + td(Mv, 2) + ') = ' + td(m - Mv, 2) + '$.', '$d = 10^{(' + td(m - Mv, 2) + ' + 5)/5}$ pc $= ' + tx(dd, 3) + '$ pc $= ' + tx(Mpc, 3) + '$ Mpc.'],
        hint: 'Period gives absolute magnitude; then use the distance modulus.' };
    } else if (kind === 'sn') {
      var mu2 = R.real(30, 42, 1), m2 = +(-19.3 + mu2).toFixed(1), dd2 = M.pow(10, (m2 + 19.3 + 5) / 5) / 1e6;
      d = { m: m2, ans: dd2 };
      p = { q: 'A type Ia supernova peaks at apparent magnitude $' + td(m2, 1) + '$. Taking its peak absolute magnitude as $M = -19.3$, how far away is it, in Mpc?',
        a: num(dd2, { rtol: 0.03 }), unit: 'Mpc',
        steps: ['$m - M = ' + td(m2, 1) + ' + 19.3 = ' + td(m2 + 19.3, 1) + '$.', '$d = 10^{(' + td(m2 + 19.3, 1) + ' + 5)/5}$ pc $= ' + tx(dd2 * 1e6, 3) + '$ pc.', '$d \\approx ' + tx(dd2, 3) + '$ Mpc.'],
        hint: 'Distance modulus with $M = -19.3$.' };
    } else if (kind === 'plx') {
      var pm = sig(R.real(0.2, 20, 1), 2), dpc = 1000 / pm;
      d = { p: pm, ans: dpc };
      p = { q: 'Gaia measures a parallax of $' + tx(pm, 2) + '$ milliarcseconds for a Cepheid in our galaxy. How far away is it, in parsecs?',
        a: num(dpc), unit: 'pc',
        steps: ['$d\\,(\\text{pc}) = 1/p\\,(\'\')$.', '$p = ' + tx(pm, 2) + '\\text{ mas} = ' + tx(pm / 1000, 2) + '\'\'$.', '$d = ' + tx(dpc, 3) + '$ pc. Nearby Cepheids like this calibrate the period–luminosity relation.'],
        hint: 'Convert milliarcseconds to arcseconds first.' };
    } else if (kind === 'error') {
      var dm = R.pick([0.05, 0.1, 0.15, 0.2, 0.3, 0.5]), pc = (M.pow(10, dm / 5) - 1) * 100;
      d = { dm: dm, ans: pc };
      p = { q: 'If the zero point of the Cepheid period–luminosity relation is off by $' + td(dm, 2) + '$ magnitudes (stars brighter than assumed), by what percentage are all distances built on it, including supernova distances, too small?',
        a: Object.assign(num(pc), { pct: true }),
        steps: ['An error $\\Delta M$ in absolute magnitude changes the distance modulus by the same amount: $d_{\\text{true}}/d_{\\text{wrong}} = 10^{\\Delta M/5}$.', '$10^{' + td(dm, 2) + '/5} = ' + td(M.pow(10, dm / 5), 4) + '$.', 'About $' + tx(pc, 2) + '\\%$; every rung above inherits it, so the Hubble constant would be off by the same percentage.'],
        hint: 'A magnitude error $\\Delta$ is a distance factor $10^{\\Delta/5}$.' };
    } else { // chain
      var dC = R.int(10, 40), mSN1 = +(5 * log10(dC * 1e6 / 10) - 19.3 + R.real(-0.2, 0.2, 2)).toFixed(2), Mcal = mSN1 - 5 * log10(dC * 1e6 / 10), mSN2 = +(mSN1 + R.real(5, 10, 1)).toFixed(2), dfar = M.pow(10, (mSN2 - Mcal + 5) / 5) / 1e6;
      d = { dC: dC, m1: mSN1, m2: mSN2, ans: dfar };
      p = { q: 'Cepheids put galaxy A at $' + dC + '$ Mpc. A type Ia supernova in galaxy A peaked at $m = ' + td(mSN1, 2) + '$. A type Ia supernova in a far galaxy B peaked at $m = ' + td(mSN2, 2) + '$. Assuming the two supernovae had the same peak luminosity, how far away is galaxy B, in Mpc?',
        a: num(dfar, { rtol: 0.03 }), unit: 'Mpc',
        steps: ['Calibrate: $M = m - 5\\log_{10}(d/10\\text{ pc}) = ' + td(mSN1, 2) + ' - 5\\log_{10}(' + tx(dC * 1e5, 2) + ') = ' + td(Mcal, 2) + '$.', 'For galaxy B: $m - M = ' + td(mSN2, 2) + ' - (' + td(Mcal, 2) + ') = ' + td(mSN2 - Mcal, 2) + '$.', '$d = 10^{(' + td(mSN2 - Mcal, 2) + ' + 5)/5}$ pc $= ' + tx(dfar, 3) + '$ Mpc. (Shortcut: $d_B = d_A \\times 10^{(m_B - m_A)/5}$.)'],
        hint: 'Use galaxy A to find the supernova\'s absolute magnitude, then apply it to galaxy B.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.redshift-scale-factor', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['z', 'a', 'lam'], ['grow', 'z', 'concept'], ['two', 'density', 'lam']));
    var id = 'astrophys.redshift-scale-factor', p, d;
    var lines = [['Lyman-alpha', 121.6], ['H-alpha', 656.3], ['H-beta', 486.1], ['oxygen [O III]', 500.7], ['calcium K', 393.4]];
    if (kind === 'z' || kind === 'lam') {
      var ln = R.pick(lines), z = kind === 'z' ? sig(R.real(0.05, 8, 2), 2) : R.pick([0.5, 1, 2, 3, 5, 6, 7, 1.5, 0.1, 0.12, 0.2, 0.3, 0.35, 0.6, 0.8, 0.9, 2.5, 4]), lo = ln[1] * (1 + z);
      if (kind === 'z') { lo = sig(lo, 4); z = lo / ln[1] - 1; }
      d = { lam: ln[1], lo: kind === 'z' ? lo : undefined, z: kind === 'lam' ? z : undefined, ans: kind === 'z' ? z : lo };
      p = kind === 'z' ? { q: 'The ' + ln[0] + ' line, emitted at $' + td(ln[1], 1) + '$ nm, is observed in a distant galaxy at $' + tx(lo, 4) + '$ nm. What is the galaxy\'s redshift $z$?',
        a: num(z),
        steps: ['$1 + z = \\lambda_{\\text{obs}}/\\lambda_{\\text{emit}} = ' + tx(lo, 4) + '/' + td(ln[1], 1) + ' = ' + td(1 + z, 3) + '$.', '$z = ' + td(z, 3) + '$.'],
        hint: 'Divide observed by emitted wavelength, then subtract 1.' } : { q: 'A quasar has redshift $z = ' + z + '$. At what wavelength do we observe its ' + ln[0] + ' line, emitted at $' + td(ln[1], 1) + '$ nm?',
        a: num(lo), unit: 'nm',
        steps: ['$\\lambda_{\\text{obs}} = (1 + z)\\lambda_{\\text{emit}}$.', '$= ' + td(1 + z, 2) + ' \\times ' + td(ln[1], 1) + '$ nm.', '$= ' + tx(lo, 4) + '$ nm' + (lo > 750 ? ', in the infrared.' : lo < 380 ? ', in the ultraviolet.' : '.')],
        hint: 'Multiply by $1 + z$.' };
    } else if (kind === 'a' || kind === 'grow') {
      var z2 = R.pick([0.25, 0.5, 1, 1.5, 2, 3, 4, 9, 1100]), a = 1 / (1 + z2);
      d = { z: z2, ans: kind === 'a' ? a : 1 + z2 };
      p = kind === 'a' ? { q: 'Light from a galaxy arrives with redshift $z = ' + z2 + '$. When it left, what was the scale factor $a$ (with $a = 1$ today)?',
        a: num(a),
        steps: ['$1 + z = a_{\\text{now}}/a_{\\text{then}} = 1/a$.', '$a = 1/(1 + ' + z2 + ')$.', '$a = ' + tx(a, 3) + '$: distances between galaxies were ' + tx(a, 3) + ' of today\'s.'],
        hint: 'Wavelengths stretch in proportion to the scale factor.' } : { q: 'Light reaches us from a galaxy with redshift $z = ' + z2 + '$. By what factor have distances between galaxies grown since the light left?',
        a: num(1 + z2),
        steps: ['The wavelength stretched along with space: $\\lambda_{\\text{obs}}/\\lambda_{\\text{emit}} = a_{\\text{now}}/a_{\\text{then}}$.', 'So the growth factor is $1 + z = ' + tx(1 + z2, 4) + '$.'],
        hint: 'The stretch of the wavelength is the stretch of space.' };
    } else if (kind === 'two') {
      var z1 = R.pick([2, 3, 4, 5]), z3 = R.pick([0.5, 1, 1.5, 0.6, 0.8, 1.2]), zr = (1 + z1) / (1 + z3) - 1;
      d = { z1: z1, z2: z3, ans: zr };
      p = { q: 'Light from a quasar reaches us with $z = ' + z1 + '$. On its way, it passed a galaxy whose own light reaches us with $z = ' + z3 + '$. What redshift did that galaxy\'s astronomers measure for the quasar light as it passed them?',
        a: num(zr),
        steps: ['Redshifts multiply as stretch factors: $1 + z_{\\text{total}} = (1 + z_{\\text{quasar→galaxy}})(1 + z_{\\text{galaxy→us}})$.', '$1 + z = ' + (1 + z1) + '/' + (1 + z3) + ' = ' + td((1 + z1) / (1 + z3), 3) + '$.', '$z = ' + td(zr, 3) + '$.'],
        hint: 'Work with $1 + z$, the stretch factor, not $z$.' };
    } else if (kind === 'density') {
      var z4 = R.pick([1, 2, 3, 9, 99, 1100]), fac = cube(1 + z4);
      d = { z: z4, ans: fac };
      p = { q: 'How many times denser was ordinary matter (on average) when light now seen at $z = ' + z4 + '$ was emitted?',
        a: num(fac),
        steps: ['Matter is conserved, so its density goes as $1/a^3$, and $1/a = 1 + z$.', 'Factor $= (1 + ' + z4 + ')^3 = ' + (1 + z4) + '^3$.', '$= ' + tx(fac, 3) + '$.'],
        hint: 'Volumes scale as $a^3$.' };
    } else {
      var c = R.pick([
        ['What does a cosmological redshift of a distant galaxy mainly measure?', 'How much the universe expanded while the light was traveling: $1 + z$ is the ratio of the scale factor now to then.', ['How fast the galaxy is moving through space, like a car moving away.', 'How hot the galaxy is.', 'How much dust lies between us and the galaxy.']],
        ['A galaxy at $z = 2$ is sometimes said to recede faster than light. Which statement is right?', 'Distances between far galaxies can grow faster than $c$; this does not break relativity, because nothing moves through space faster than light.', ['It is impossible; the formula $v = cz$ is exact, so its speed is $2c$.', 'The galaxy must have been launched by an explosion faster than light.', 'Its redshift must be a Doppler shift, so its speed is less than $c$ and distances cannot grow faster.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['In an expanding universe the wavelength of light stretches by the same factor as distances between galaxies while it travels: $1 + z = a_{\\text{now}}/a_{\\text{then}}$.', 'For nearby galaxies this looks like a Doppler shift with $v \\approx cz$, but for distant ones it is the stretching of space during the trip, not motion through space.'],
        hint: 'Think of the light\'s wavelength stretching along with space.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.hubble-time', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['dist', 'H0', 'time'], ['pec', 'tension', 'dist'], ['matter', 'pec', 'tension']));
    var id = 'astrophys.hubble-time', p, d;
    if (kind === 'dist') {
      var z = sig(R.real(0.002, 0.05, 3), 2), H0 = R.pick([70, 70, 67, 73, 68, 69, 71, 72]), dd = 3e5 * z / H0;
      d = { z: z, H0: H0, ans: dd };
      p = { q: 'A nearby galaxy has redshift $z = ' + tx(z, 2) + '$. Using $H_0 = ' + H0 + '$ km/s/Mpc and $c = 3.00 \\times 10^{5}$ km/s, how far away is it?',
        a: num(dd), unit: 'Mpc',
        steps: ['For $z \\ll 1$, $v \\approx cz = 3.00 \\times 10^{5} \\times ' + tx(z, 2) + ' = ' + tx(3e5 * z, 3) + '$ km/s.', 'Hubble\'s law: $d = v/H_0 = ' + tx(3e5 * z, 3) + '/' + H0 + '$.', '$d = ' + tx(dd, 3) + '$ Mpc.'],
        hint: 'Small $z$: $v = cz$, then $d = v/H_0$.' };
    } else if (kind === 'H0') {
      var dd2 = R.int(10, 200), v = sig(dd2 * R.real(65, 75, 1), 3), H = v / dd2;
      d = { d: dd2, v: v, ans: H };
      p = { q: 'A galaxy $' + dd2 + '$ Mpc away (by Cepheids) recedes at $' + tx(v, 3) + '$ km/s. What value of the Hubble constant does it give?',
        a: num(H), unit: 'km/s/Mpc',
        steps: ['$H_0 = v/d$.', '$= ' + tx(v, 3) + '/' + dd2 + '$.', '$H_0 = ' + tx(H, 3) + '$ km/s/Mpc.'],
        hint: 'Speed divided by distance.' };
    } else if (kind === 'time') {
      var H2 = R.int(60, 80), t = 3.09e19 / H2 / K.yr / 1e9;
      d = { H0: H2, ans: t };
      p = { q: 'Find the Hubble time $1/H_0$ in billions of years for $H_0 = ' + H2 + '$ km/s/Mpc. ($1\\text{ Mpc} = 3.09 \\times 10^{19}$ km, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(t), unit: 'Gyr',
        steps: ['$H_0 = ' + H2 + '$ km/s per $3.09 \\times 10^{19}$ km $= ' + tx(H2 / 3.09e19, 3) + '$ s⁻¹.', '$1/H_0 = ' + tx(3.09e19 / H2, 3) + '$ s.', 'Divide by $3.16 \\times 10^{16}$ s per billion years: $' + tx(t, 3) + '$ Gyr.'],
        hint: 'Put $H_0$ in units of 1/s by converting megaparsecs to km.' };
    } else if (kind === 'pec') {
      var dd3 = R.int(5, 30), H3 = 70, vpec = R.pick([-300, -200, 200, 300, 400, -400]), vobs = dd3 * H3 + vpec, dnaive = vobs / H3, err = (dnaive - dd3) / dd3 * 100;
      d = { vobs: vobs, vpec: vpec, ans: dd3 };
      p = { q: 'A galaxy\'s spectrum shows a recession velocity of $' + tx(vobs, 3) + '$ km/s, but $' + (vpec > 0 ? '+' : '') + vpec + '$ km/s of that is its own motion within its group (a peculiar velocity), not expansion. With $H_0 = 70$ km/s/Mpc, how far away is it?',
        a: num(dd3), unit: 'Mpc',
        steps: ['Expansion part: $' + tx(vobs, 3) + ' - (' + (vpec > 0 ? '' : '') + vpec + ') = ' + tx(vobs - vpec, 3) + '$ km/s.', '$d = ' + tx(vobs - vpec, 3) + '/70 = ' + tx(dd3, 3) + '$ Mpc.', 'Ignoring the peculiar velocity would give $' + tx(dnaive, 3) + '$ Mpc, off by ' + tx(M.abs(err), 2) + '%; that is why the Hubble constant is measured far out, where peculiar velocities matter less.'],
        hint: 'Only the expansion part of the velocity follows Hubble\'s law.' };
    } else if (kind === 'tension') {
      var t67 = 3.09e19 / 67 / K.yr / 1e9, t73 = 3.09e19 / 73 / K.yr / 1e9;
      d = { ans: t67 - t73 };
      p = { q: 'Measurements of the Hubble constant range from about 67 km/s/Mpc (from the cosmic microwave background) to about 73 km/s/Mpc (from Cepheids and supernovae). By how many billion years do the two Hubble times, $1/H_0$, differ? ($1\\text{ Mpc} = 3.09 \\times 10^{19}$ km, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(t67 - t73, { rtol: 0.04 }), unit: 'Gyr',
        steps: ['$1/H_0$ in Gyr is $(3.09 \\times 10^{19}/H_0)/(3.16 \\times 10^{16})$.', '$H_0 = 67$: $' + tx(t67, 3) + '$ Gyr; $H_0 = 73$: $' + tx(t73, 3) + '$ Gyr.', 'Difference: $' + tx(t67 - t73, 2) + '$ Gyr. The disagreement, called the Hubble tension, is an open question.'],
        hint: 'Compute each Hubble time and subtract.' };
    } else { // matter-only age
      var H4 = R.pick([67, 70, 73, 68, 71, 72]), tH = 3.09e19 / H4 / K.yr / 1e9, tm = 2 / 3 * tH;
      d = { H0: H4, ans: tm };
      p = { q: 'In a flat universe with only matter, the scale factor grows as $a \\propto t^{2/3}$, so $H = \\dot a/a = 2/(3t)$ and the age is $t_0 = \\tfrac23\\,(1/H_0)$. For $H_0 = ' + H4 + '$ km/s/Mpc, what age would that give, in Gyr? ($1\\text{ Mpc} = 3.09 \\times 10^{19}$ km, $1\\text{ yr} = 3.16 \\times 10^{7}$ s.)',
        a: num(tm), unit: 'Gyr',
        steps: ['Hubble time: $1/H_0 = ' + tx(tH, 3) + '$ Gyr.', '$t_0 = \\tfrac23 \\times ' + tx(tH, 3) + '$.', '$t_0 = ' + tx(tm, 3) + '$ Gyr, younger than the oldest stars (about 12 to 13 Gyr): one sign that the universe is not matter alone. With dark energy, the age comes out near 13.8 Gyr.'],
        hint: 'Multiply the Hubble time by 2/3.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.friedmann-equation', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['rhoc', 'atoms', 'curv'], ['omega', 'H', 'rhoc'], ['Hz', 'escape', 'omega']));
    var id = 'astrophys.friedmann-equation', p, d;
    var H0 = R.pick([67, 70, 73, 68, 72, 69, 71]), Hs = H0 / 3.09e19, rhoc = 3 * Hs * Hs / (8 * M.PI * K.G);
    if (kind === 'rhoc' || kind === 'atoms') {
      var ans = kind === 'rhoc' ? rhoc : rhoc / 1.67e-27;
      d = { H0: H0, ans: ans };
      p = { q: (kind === 'rhoc' ? 'Find the critical density $\\rho_c = 3H_0^2/(8\\pi G)$' : 'The critical density is $\\rho_c = 3H_0^2/(8\\pi G)$. How many hydrogen atoms ($1.67 \\times 10^{-27}$ kg each) per cubic meter would that be') + ' for $H_0 = ' + H0 + '$ km/s/Mpc? ($1\\text{ Mpc} = 3.09 \\times 10^{19}$ km, $G = 6.67 \\times 10^{-11}$.)',
        a: num(ans), unit: kind === 'rhoc' ? 'kg/m³' : undefined,
        steps: ['$H_0 = ' + H0 + '/3.09 \\times 10^{19} = ' + tx(Hs, 3) + '$ s⁻¹, so $H_0^2 = ' + tx(Hs * Hs, 3) + '$ s⁻².', '$\\rho_c = 3 \\times ' + tx(Hs * Hs, 3) + '/(8\\pi \\times 6.67 \\times 10^{-11}) = ' + tx(rhoc, 3) + '$ kg/m³.'].concat(kind === 'atoms' ? ['Divide by $1.67 \\times 10^{-27}$ kg: about $' + tx(ans, 2) + '$ atoms per cubic meter, emptier than any laboratory vacuum.'] : []),
        hint: 'Convert $H_0$ to 1/s first.' };
      if (kind === 'atoms') delete p.unit;
    } else if (kind === 'omega') {
      var rho = sig(rhoc * R.real(0.05, 1.5, 2), 2), Om = rho / rhoc;
      d = { H0: H0, rho: rho, ans: Om };
      p = { q: 'If the universe\'s average density were $' + tx(rho, 2) + '$ kg/m³ and $H_0 = ' + H0 + '$ km/s/Mpc, what would the density parameter $\\Omega = \\rho/\\rho_c$ be? ($\\rho_c = 3H_0^2/8\\pi G$; $1\\text{ Mpc} = 3.09 \\times 10^{19}$ km, $G = 6.67 \\times 10^{-11}$.)',
        a: num(Om),
        steps: ['$\\rho_c = ' + tx(rhoc, 3) + '$ kg/m³.', '$\\Omega = ' + tx(rho, 2) + '/' + tx(rhoc, 3) + ' = ' + tx(Om, 3) + '$.', Om > 1.02 ? 'Above 1: positive curvature (a "closed" geometry).' : Om < 0.98 ? 'Below 1: negative curvature (an "open" geometry).' : 'Very close to 1: nearly flat.'],
        hint: 'Find $\\rho_c$, then divide.' };
    } else if (kind === 'curv') {
      var Om2 = R.pick([0.3, 0.8, 1.0, 1.2, 2.0, 0.05, 0.06, 0.09, 0.15, 0.35, 0.6, 1.5]), ans2 = Om2 > 1 ? 'positive ($k > 0$): like the surface of a sphere, triangles add up to more than 180°' : Om2 < 1 ? 'negative ($k < 0$): like a saddle, triangles add up to less than 180°' : 'zero ($k = 0$): flat, triangles add up to exactly 180°';
      var all = ['positive ($k > 0$): like the surface of a sphere, triangles add up to more than 180°', 'negative ($k < 0$): like a saddle, triangles add up to less than 180°', 'zero ($k = 0$): flat, triangles add up to exactly 180°'];
      d = { Om: Om2, ans: ans2 };
      p = { q: 'A universe has total density parameter $\\Omega = ' + Om2 + '$. According to the Friedmann equation, what is the curvature of space?',
        a: mc(R, ans2, all.filter(function (x) { return x !== ans2; }).concat(['it depends only on the shape of the universe\'s edge'])),
        steps: ['Divide the Friedmann equation by $H^2$: $1 = \\Omega - \\dfrac{kc^2}{a^2H^2}$, so $\\dfrac{kc^2}{a^2H^2} = \\Omega - 1$.', '$\\Omega - 1 = ' + td(Om2 - 1, 2) + '$, so $k$ is ' + (Om2 > 1 ? 'positive.' : Om2 < 1 ? 'negative.' : 'zero.'), 'Curvature describes the geometry of space everywhere, not an edge or a pancake shape.'],
        hint: 'Compare $\\Omega$ with 1.' };
    } else if (kind === 'H') {
      var rho2 = sig(rnd(R, 1e-27, 1e-24, 2), 2), Hh = M.sqrt(8 * M.PI * K.G * rho2 / 3) * 3.09e19;
      d = { rho: rho2, ans: Hh };
      p = { q: 'A flat universe ($k = 0$) has density $' + tx(rho2, 2) + '$ kg/m³. What is its expansion rate $H$, in km/s/Mpc? ($G = 6.67 \\times 10^{-11}$, $1\\text{ Mpc} = 3.09 \\times 10^{19}$ km.)',
        a: num(Hh), unit: 'km/s/Mpc',
        steps: ['With $k = 0$, $H^2 = 8\\pi G\\rho/3$.', '$H = \\sqrt{8\\pi \\times 6.67 \\times 10^{-11} \\times ' + tx(rho2, 2) + '/3} = ' + tx(Hh / 3.09e19, 3) + '$ s⁻¹.', 'Times $3.09 \\times 10^{19}$ km/Mpc: $H = ' + tx(Hh, 3) + '$ km/s/Mpc.'],
        hint: 'Solve the flat Friedmann equation for $H$.' };
    } else if (kind === 'Hz') {
      var z = R.pick([0.5, 1, 2, 3, 0.3, 1.5, 0.35, 0.4, 0.7, 0.8, 1.2, 2.5]), Om3 = 0.31, OL = 0.69, Hz = H0 * M.sqrt(Om3 * cube(1 + z) + OL);
      d = { H0: H0, z: z, ans: Hz };
      p = { q: 'In a flat universe with $\\Omega_m = 0.31$ and $\\Omega_\\Lambda = 0.69$ (radiation negligible), $H(z) = H_0\\sqrt{\\Omega_m(1 + z)^3 + \\Omega_\\Lambda}$. With $H_0 = ' + H0 + '$ km/s/Mpc, what was $H$ at $z = ' + z + '$?',
        a: num(Hz), unit: 'km/s/Mpc',
        steps: ['Matter density scales as $(1 + z)^3$: $0.31 \\times ' + td(1 + z, 1) + '^3 = ' + td(Om3 * cube(1 + z), 3) + '$.', 'Add $0.69$: $' + td(Om3 * cube(1 + z) + OL, 3) + '$; square root: $' + td(M.sqrt(Om3 * cube(1 + z) + OL), 3) + '$.', '$H = ' + H0 + ' \\times ' + td(M.sqrt(Om3 * cube(1 + z) + OL), 3) + ' = ' + tx(Hz, 3) + '$ km/s/Mpc: the universe expanded faster in the past.'],
        hint: 'Scale each density to that redshift, add, take the root.' };
    } else { // escape analog
      var Om4 = R.pick([0.3, 0.5, 2, 4, 0.1, 1.5, 0.12, 0.25, 0.6, 0.8, 1.2, 3.5]), ratio = 1 / M.sqrt(Om4);
      d = { Om: Om4, ans: ratio };
      p = { q: 'Think of a ball of galaxies of radius $R$ expanding at $v = HR$, with mass $M = \\tfrac43\\pi R^3\\rho$. Show that $v/v_{\\text{esc}} = 1/\\sqrt{\\Omega}$ and evaluate it for $\\Omega = ' + Om4 + '$.',
        a: num(ratio),
        steps: ['$v_{\\text{esc}}^2 = 2GM/R = \\tfrac83\\pi G\\rho R^2$ and $v^2 = H^2R^2$.', '$v^2/v_{\\text{esc}}^2 = \\dfrac{3H^2}{8\\pi G\\rho} = \\dfrac{\\rho_c}{\\rho} = \\dfrac{1}{\\Omega}$.', '$v/v_{\\text{esc}} = 1/\\sqrt{' + Om4 + '} = ' + td(ratio, 3) + '$: ' + (ratio > 1 ? 'faster than escape speed, so (without dark energy) it expands forever.' : 'slower than escape speed, so (without dark energy) it would fall back.')],
        hint: 'Compare the kinetic and potential energy of the shell, as for a rocket escaping Earth.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.cosmic-eras', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['scale', 'scale', 'ratio'], ['ratio', 'zeq', 'zL'], ['acc', 'growth', 'zeq']));
    var id = 'astrophys.cosmic-eras', p, d, Om = 0.31, Or = 9.0e-5, OL = 0.69;
    if (kind === 'scale') {
      var z = R.pick([R.int(1, 9), R.int(10, 99), R.int(100, 3000)]), rad = R.coin(), f = rad ? M.pow(1 + z, 4) : cube(1 + z);
      d = { z: z, rad: rad, ans: f };
      p = { q: 'By what factor was the energy density of ' + (rad ? 'radiation (photons and neutrinos)' : 'matter') + ' higher at $z = ' + z + '$ than today?',
        a: num(f),
        steps: [rad ? 'Radiation: the number of photons per volume goes as $a^{-3}$, and each photon\'s energy as $a^{-1}$ (its wavelength stretches), so $\\rho_r \\propto a^{-4} = (1 + z)^4$.' : 'Matter: the mass is conserved and the volume grows as $a^3$, so $\\rho_m \\propto a^{-3} = (1 + z)^3$.', '$(1 + z) = ' + (1 + z) + '$.', 'Factor $= ' + (1 + z) + '^{' + (rad ? 4 : 3) + '} = ' + tx(f, 3) + '$.'],
        hint: rad ? 'Fewer photons per volume and each one redder.' : 'Same mass, bigger volume.' };
    } else if (kind === 'ratio') {
      var z2 = R.pick([0, R.int(1, 99) * 100, R.int(1, 20) * 1000, 1100]), r = Or / Om * (1 + z2);
      d = { z: z2, ans: r };
      p = { q: 'Today radiation has $\\Omega_r = 9.0 \\times 10^{-5}$ and matter $\\Omega_m = 0.31$. What was the ratio of radiation to matter energy density, $\\rho_r/\\rho_m$, at $z = ' + z2 + '$?',
        a: num(r),
        steps: ['$\\rho_r/\\rho_m \\propto a^{-4}/a^{-3} = 1/a = 1 + z$.', '$\\rho_r/\\rho_m = (\\Omega_r/\\Omega_m)(1 + z) = (' + tx(Or / Om, 3) + ')(' + (1 + z2) + ')$.', '$= ' + tx(r, 3) + '$' + (r > 1 ? ': radiation dominated then.' : ': matter dominated.')],
        hint: 'Radiation thins out one extra power of $a$ faster than matter.' };
    } else if (kind === 'zeq') {
      var Om2 = R.pick([0.3, 0.31, 0.32, 0.25, 0.35]), Or2 = sig(R.real(8, 9.5, 1) * 1e-5, 2), zeq = Om2 / Or2 - 1;
      d = { Om: Om2, Or: Or2, ans: zeq };
      p = { q: 'With $\\Omega_m = ' + Om2 + '$ and $\\Omega_r = ' + tx(Or2, 2) + '$ today, at what redshift were the energy densities of matter and radiation equal?',
        a: num(zeq),
        steps: ['Equal when $\\Omega_r(1 + z)^4 = \\Omega_m(1 + z)^3$, that is $1 + z = \\Omega_m/\\Omega_r$.', '$1 + z = ' + Om2 + '/' + tx(Or2, 2) + ' = ' + tx(Om2 / Or2, 4) + '$.', '$z_{\\text{eq}} \\approx ' + tx(zeq, 3) + '$, about 50,000 years after the Big Bang.'],
        hint: 'Set the two densities equal and solve for $1 + z$.' };
    } else if (kind === 'zL' || kind === 'acc') {
      var Om3 = R.pick([0.3, 0.31, 0.27, 0.35]), OL3 = +(1 - Om3).toFixed(2), acc = kind === 'acc', z3 = M.pow((acc ? 2 : 1) * OL3 / Om3, 1 / 3) - 1;
      d = { Om: Om3, OL: OL3, acc: acc, ans: z3 };
      p = { q: acc ? 'The expansion speeds up when $\\Omega_\\Lambda > \\tfrac12\\Omega_m(1 + z)^3$ (dark energy\'s push beats matter\'s pull). With $\\Omega_m = ' + Om3 + '$ and $\\Omega_\\Lambda = ' + OL3 + '$, at what redshift did the acceleration begin?' : 'With $\\Omega_m = ' + Om3 + '$ and $\\Omega_\\Lambda = ' + OL3 + '$ today, at what redshift were the densities of matter and dark energy equal? (Dark energy\'s density stays constant.)',
        a: num(z3),
        steps: [acc ? 'Set $\\Omega_\\Lambda = \\tfrac12\\Omega_m(1 + z)^3$: $(1 + z)^3 = 2\\Omega_\\Lambda/\\Omega_m$.' : 'Set $\\Omega_m(1 + z)^3 = \\Omega_\\Lambda$: $(1 + z)^3 = \\Omega_\\Lambda/\\Omega_m$.', '$(1 + z)^3 = ' + td((acc ? 2 : 1) * OL3 / Om3, 3) + '$, so $1 + z = ' + td(1 + z3, 3) + '$.', '$z = ' + td(z3, 2) + '$: ' + (acc ? 'roughly 6 billion years ago.' : 'only about 3 to 4 billion years ago; dark energy\'s rule is recent.')],
        hint: 'Matter scales as $(1 + z)^3$; dark energy does not scale.' };
    } else { // growth: a(t) power laws
      var era = R.pick(['matter', 'radiation']), f2 = R.int(2, 40), g = era === 'matter' ? M.pow(f2, 2 / 3) : M.sqrt(f2);
      d = { era: era, f: f2, ans: g };
      p = { q: 'During the ' + era + '-dominated era, the scale factor grows as $a \\propto t^{' + (era === 'matter' ? '2/3' : '1/2') + '}$. While the age of the universe grows by a factor of ' + f2 + ', by what factor do distances between galaxies grow?',
        a: num(g),
        steps: ['$a_2/a_1 = (t_2/t_1)^{' + (era === 'matter' ? '2/3' : '1/2') + '}$.', '$= ' + f2 + '^{' + (era === 'matter' ? '2/3' : '1/2') + '}$.', '$= ' + tx(g, 3) + '$.'],
        hint: 'Raise the time ratio to the era\'s power.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.cmb', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['T', 'z', 'concept'], ['peak', 'dipole', 'T'], ['energy', 'peak', 'dipole']));
    var id = 'astrophys.cmb', p, d;
    if (kind === 'T') {
      var z = R.pick([R.int(1, 20), R.int(2, 99) * 10, 1100, R.int(5, 40) * 100]), T = 2.725 * (1 + z);
      d = { z: z, ans: T };
      p = { q: 'The cosmic microwave background is at $2.725$ K today. What was its temperature at $z = ' + z + '$?',
        a: num(T), unit: 'K',
        steps: ['Each photon\'s wavelength stretches with the scale factor, so the blackbody temperature goes as $1/a = 1 + z$.', '$T = 2.725\\text{ K} \\times (1 + ' + z + ')$.', '$T = ' + tx(T, 3) + '$ K.'],
        hint: 'Temperature scales as $1 + z$.' };
    } else if (kind === 'z') {
      var Tt = R.pick([3000, 273, 5800, R.int(4, 99), R.int(10, 99) * 10, R.int(10, 50) * 100]), z2 = Tt / 2.725 - 1;
      d = { T: Tt, ans: z2 };
      p = { q: 'At what redshift was the cosmic background radiation at $' + tx(Tt, 3) + '$ K? (Today: 2.725 K.)',
        a: num(z2),
        steps: ['$1 + z = T/T_0 = ' + Tt + '/2.725$.', '$1 + z = ' + tx(Tt / 2.725, 4) + '$.', '$z = ' + tx(z2, 4) + '$.' + (Tt === 3000 ? ' This is when hydrogen atoms formed and the light set free.' : Tt === 273 ? ' The whole universe was then at the freezing point of water.' : '')],
        hint: 'Solve $T = T_0(1 + z)$ for $z$.' };
    } else if (kind === 'peak') {
      var then = R.coin(), T2 = then ? R.int(29, 31) * 100 : 2.725, lam = 2.898e-3 / T2;
      d = { T: T2, ans: then ? lam * 1e9 : lam * 1e3 };
      p = { q: then ? 'When the background light was released, the universe was at about $' + T2 + '$ K. At what wavelength did its blackbody spectrum peak, in nm? ($b = 2.898 \\times 10^{-3}$ m·K.)' : 'At what wavelength does the 2.725 K cosmic microwave background peak, in millimeters? ($b = 2.898 \\times 10^{-3}$ m·K.)',
        a: num(then ? lam * 1e9 : lam * 1e3), unit: then ? 'nm' : 'mm',
        steps: ['Wien\'s law: $\\lambda_{\\max} = b/T = 2.898 \\times 10^{-3}/' + T2 + '$ m.', then ? '$= ' + tx(lam, 3) + '$ m $= ' + tx(lam * 1e9, 3) + '$ nm, near-infrared light: the young universe glowed like a red-orange star.' : '$= ' + tx(lam, 3) + '$ m $= ' + tx(lam * 1e3, 3) + '$ mm, in the microwave band.'],
        hint: 'Use $\\lambda_{\\max} = b/T$.' };
    } else if (kind === 'dipole') {
      var v = R.int(20, 40) * 10 + R.pick([0, 5, 9]), dT = 2.725 * v / 3e5 * 1000;
      d = { v: v, ans: dT };
      p = { q: 'Because of our motion at $' + v + '$ km/s relative to the background radiation, it looks slightly hotter ahead of us and cooler behind, by $\\Delta T \\approx T v/c$. Find $\\Delta T$ in millikelvins. ($T = 2.725$ K, $c = 3.00 \\times 10^{5}$ km/s.)',
        a: num(dT), unit: 'mK',
        steps: ['$v/c = ' + v + '/3.00 \\times 10^{5} = ' + tx(v / 3e5, 3) + '$.', '$\\Delta T = 2.725\\text{ K} \\times ' + tx(v / 3e5, 3) + ' = ' + tx(dT / 1000, 3) + '$ K.', '$\\Delta T = ' + tx(dT, 3) + '$ mK. After removing this dipole, the remaining variations are about 100 times smaller still.'],
        hint: 'A first-order Doppler shift of the temperature.' };
    } else if (kind === 'energy') {
      var z3 = R.pick([0, R.int(1, 9), R.int(10, 99), 1100, R.int(2, 30) * 100]), u = 7.566e-16 * M.pow(2.725 * (1 + z3), 4);
      d = { z: z3, ans: u };
      p = { q: 'The energy density of blackbody radiation is $u = aT^4$ with $a = 7.566 \\times 10^{-16}$ J/(m³·K⁴). What was the background radiation\'s energy density at $z = ' + z3 + '$ (today $T = 2.725$ K)?',
        a: num(u), unit: 'J/m³',
        steps: ['$T = 2.725 \\times (1 + ' + z3 + ') = ' + tx(2.725 * (1 + z3), 4) + '$ K.', '$T^4 = ' + tx(M.pow(2.725 * (1 + z3), 4), 3) + '$ K⁴.', '$u = ' + tx(u, 3) + '$ J/m³' + (z3 > 0 ? ', $(1 + z)^4 = ' + tx(M.pow(1 + z3, 4), 3) + '$ times today\'s.' : '.')],
        hint: 'Scale $T$ first, then raise it to the fourth power.' };
    } else {
      var c = R.pick([
        ['Where in the sky does the cosmic microwave background come from?', 'From every direction, almost equally: it fills all of space and was released everywhere at once.', ['From one point in the sky, where the Big Bang happened.', 'From the center of the Milky Way.', 'From the Sun, reflected by interplanetary dust.']],
        ['Why did the universe become transparent at about 3,000 K, rather than at the 158,000 K that matches hydrogen\'s 13.6 eV?', 'There are about a billion photons per atom, so even at 3,000 K the high-energy tail of the photon spectrum held enough ionizing photons until then.', ['Hydrogen has a lower ionization energy in space.', 'Dark matter absorbed the ionizing photons.', 'At higher temperatures, atoms are transparent anyway.']],
        ['What did the COBE satellite\'s measurement in 1990 show about the cosmic microwave background?', 'Its spectrum is an almost perfect blackbody at 2.725 K, as expected for light from a hot, dense early universe.', ['It comes from a ring of dust around the solar system.', 'Its temperature is different in every direction by about 50%.', 'It is the combined light of distant stars.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['About 380,000 years after the Big Bang, at about 3,000 K, electrons and nuclei combined into atoms and the universe became transparent. That light has traveled freely ever since, stretched by a factor of about 1,100 into microwaves.', 'It fills space uniformly, so we see it in every direction, the same to about one part in 100,000 once our own motion is removed. Arno Penzias and Robert Wilson discovered it in 1965.'],
        hint: 'The background was released everywhere at once.' };
    }
    return chk(id, d, p, kind);
  });

  G('astrophys.nucleosynthesis', function (R, ctx) {
    var L = lv(ctx), kind = R.pick(by(ctx, ['Y', 'reverse', 'concept'], ['boltz', 'decay', 'Y'], ['decay', 'stars', 'boltz']));
    var id = 'astrophys.nucleosynthesis', p, d;
    if (kind === 'Y') {
      var r = R.pick([[1, 7], [1, 6], [1, 5], [1, 8], [1, 4], [1, 10]]), rr = r[0] / r[1], Y = 2 * rr / (1 + rr);
      d = { r: rr, ans: Y };
      p = { q: 'When nuclei started forming, there was 1 neutron for every ' + r[1] + ' protons. If essentially every neutron ended up in helium-4, what fraction of the mass became helium ($Y$)?',
        a: num(Y),
        steps: ['Take ' + (r[1] + 1) + ' nucleons: 1 neutron and ' + r[1] + ' protons. Each helium-4 needs 2 neutrons and 2 protons.', 'So the neutron pairs with one proton: 2 nucleons out of ' + (r[1] + 1) + ' end up in helium. In general $Y = \\dfrac{2(n/p)}{1 + n/p}$.', '$Y = 2/' + (r[1] + 1) + ' = ' + td(Y, 3) + '$.'],
        hint: 'Every neutron brings one proton with it into helium.' };
    } else if (kind === 'reverse') {
      var Y2 = R.real(0.2, 0.3, 3), r2 = Y2 / (2 - Y2);
      d = { Y: Y2, ans: r2 };
      p = { q: 'Measurements of the oldest gas give a primordial helium mass fraction of $Y = ' + Y2 + '$. What neutron-to-proton ratio $n/p$ at the time of nucleosynthesis does that imply?',
        a: num(r2),
        steps: ['$Y = \\dfrac{2(n/p)}{1 + n/p}$; solve for $n/p$: $Y + Y(n/p) = 2(n/p)$.', '$n/p = Y/(2 - Y) = ' + Y2 + '/' + td(2 - Y2, 3) + '$.', '$n/p = ' + td(r2, 3) + '$, about 1 neutron for every ' + td(1 / r2, 1) + ' protons.'],
        hint: 'Rearrange $Y = 2r/(1 + r)$.' };
    } else if (kind === 'boltz') {
      var kT = R.real(0.5, 3, 2), r3 = M.exp(-1.293 / kT);
      d = { kT: kT, ans: r3 };
      p = { q: 'Early on, weak reactions kept neutrons and protons in equilibrium, with $n/p = e^{-\\Delta mc^2/kT}$ and $\\Delta mc^2 = 1.293$ MeV. What was $n/p$ when $kT = ' + kT + '$ MeV?',
        a: num(r3),
        steps: ['$\\Delta mc^2/kT = 1.293/' + kT + ' = ' + td(1.293 / kT, 3) + '$.', '$n/p = e^{-' + td(1.293 / kT, 3) + '}$.', '$n/p = ' + td(r3, 3) + '$.' + (kT <= 0.8 ? ' Around $kT \\approx 0.8$ MeV the reactions became too slow to keep up, freezing the ratio near 1/5.' : '')],
        hint: 'A Boltzmann factor with the neutron–proton mass difference.' };
    } else if (kind === 'decay') {
      var r0 = R.pick([0.2, 0.17, 0.18, 0.19, 0.21]), t = R.int(18, 30) * 10, tau = 879, n = r0 * M.exp(-t / tau), pp = 1 + r0 * (1 - M.exp(-t / tau)), rf = n / pp;
      d = { r0: r0, t: t, ans: rf };
      p = { q: 'After freeze-out, $n/p = ' + td(r0, 3) + '$. Free neutrons then decay into protons with mean lifetime $879$ s. What is $n/p$ after $' + t + '$ s, when deuterium finally survives and helium forms?',
        a: num(rf),
        steps: ['Start with $' + td(r0, 3) + '$ neutrons per proton. After time $t$: neutrons $' + td(r0, 3) + 'e^{-t/879} = ' + td(n, 4) + '$.', 'Each decay adds a proton: protons $1 + ' + td(r0, 3) + '(1 - e^{-t/879}) = ' + td(pp, 4) + '$.', '$n/p = ' + td(n, 4) + '/' + td(pp, 4) + ' = ' + td(rf, 3) + '$, about 1 neutron for every ' + M.round(1 / rf) + ' protons.'],
        hint: 'Neutrons decay exponentially, and every lost neutron becomes a proton.' };
    } else if (kind === 'stars') {
      var Lg = R.pick([2, 2.5, 3, 4]) * 1e10, tg = R.pick([10, 12, 13]), Mb = R.pick([6, 8, 10]) * 1e10, E = Lg * K.Lsun * tg * 1e9 * K.yr, mHe = E / (0.0071 * K.c * K.c), frac = mHe / K.Msun / Mb * 100;
      d = { L: Lg, t: tg, Mb: Mb, ans: frac };
      p = { q: 'Suppose a galaxy has shone at $' + tx(Lg, 2) + '\\,L_\\odot$ for $' + tg + '$ billion years, all of it from turning hydrogen into helium (which releases $0.0071c^2$ per kilogram of hydrogen). Its stars and gas hold $' + tx(Mb, 2) + '\\,M_\\odot$. What percentage of that mass could stars have turned into helium? ($L_\\odot = 3.83 \\times 10^{26}$ W, $1\\text{ yr} = 3.16 \\times 10^{7}$ s, $c = 3.00 \\times 10^{8}$ m/s, $M_\\odot = 1.99 \\times 10^{30}$ kg.)',
        a: Object.assign(num(frac, { rtol: 0.03 }), { pct: true }),
        steps: ['Energy: $' + tx(Lg * K.Lsun, 3) + '\\text{ W} \\times ' + tx(tg * 1e9 * K.yr, 3) + '\\text{ s} = ' + tx(E, 3) + '$ J.', 'Hydrogen burned (about the helium made): $E/(0.0071c^2) = ' + tx(mHe, 3) + '$ kg $= ' + tx(mHe / K.Msun, 3) + '\\,M_\\odot$.', 'Fraction: $' + tx(frac, 2) + '\\%$, far below the 25% observed: most helium must be primordial.'],
        hint: 'Total energy radiated, divided by the energy per kilogram of helium made.' };
    } else {
      var c = R.pick([
        ['Where did most of the helium in the universe come from?', 'The first few minutes after the Big Bang; stars have added only a few percent since.', ['Stars, which have turned about a quarter of all hydrogen into helium.', 'Supernovae, which make helium from iron.', 'The decay of uranium and thorium in planets.']],
        ['Why did nucleosynthesis in the early universe stop at helium, with only traces of lithium?', 'There are no stable nuclei with 5 or 8 nucleons, and the universe cooled and thinned within minutes, before heavier elements could build up.', ['Helium is the heaviest element that can exist.', 'The universe was too cold to fuse anything at all.', 'Dark matter absorbed the heavier nuclei.']],
        ['Big Bang nucleosynthesis predicts about 25% helium by mass. Measurements of the oldest gas find about 24 to 25%. What does this agreement support?', 'That the early universe was hot and dense, cooling through about $10^{9}$ K in its first few minutes, as the Big Bang model says.', ['That all stars are the same age.', 'That the universe has always been the same temperature.', 'That helium is made only in the cores of stars.']]]);
      d = { ans: 0 };
      p = { q: c[0], a: mc(R, c[1], c[2]),
        steps: ['In the first seconds the neutron-to-proton ratio froze out near 1/5 and then fell to about 1/7 as neutrons decayed. After 3 to 4 minutes, deuterium could survive, and nearly every neutron ended up in helium-4: $Y \\approx 2(1/7)/(1 + 1/7) = 0.25$.', 'Stars over the age of the galaxy can have made only a few percent more, so the observed 24 to 25% helium is a fossil of the hot early universe.'],
        hint: 'Compare how much helium stars could make with how much there is.' };
    }
    return chk(id, d, p, kind);
  });

})(window.MathLadder);

/* ---- More forms of the same questions (round 7, "widen"; Physics and Earth ladders): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - check a number: the question and a classmate's numeric answer, either the generator's own answer or that answer
     off by a common slip (a factor of 2, 4 or 10), and "Is that right?" (Yes / No; not in placement);
   - two at once: two different questions of the topic, answered together (short questions only, multiple-choice or
     numeric, each keeping its own unit; at most one of them with a picture, which then comes first).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'astrophys', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function numable(p) { // a single numeric answer with a plain decimal value (not a fraction or an expression)
    var a = p.a;
    return !!a && a.t === 'num' && /^-?\d+(\.\d+)?(e-?\d+)?$/.test(String(a.v)) && +a.v !== 0 && isFinite(+a.v) &&
      !(a.tol && a.tol >= Math.abs(+a.v) / 3) && !((a.rtol || 0) > 0.3); // a slip by a factor of 2 must fall outside the tolerance
  }
  function sig(v) { var m = String(v).replace(/e.*$/, '').replace(/^-?0*\.?0*/, '').replace('.', ''); return Math.min(6, Math.max(3, m.length)); }
  function show(x, n) { // a number as the classmate would write it: 3 significant figures, scientific notation when large or small
    var ax = Math.abs(x);
    if (ax >= 1e5 || ax < 1e-3) { var e = Math.floor(Math.log10(ax)), m = Number((x / Math.pow(10, e)).toPrecision(n || 3)); if (Math.abs(m) >= 10) { m = m / 10; e++; } return '$' + m + ' \\times 10^{' + e + '}$'; }
    var s = String(Number(x.toPrecision(n || 3)));
    return '$' + (ax >= 1e4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') : s) + '$';
  }
  function numCheckForm(R, p) {
    var a = p.a, v = +a.v, n = sig(a.v), right = R.coin(), f = R.pick([2, 0.5, 10, 0.1, 4, 0.25]), shown = right ? v : v * f;
    var who = 'A classmate worked it out and got', u = p.unit ? ' ' + p.unit : '';
    var q = p.q + '<p>' + who + ': <b>' + show(shown, n) + u + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right.' : 'No. The answer is ' + show(v, n) + u + '; ' + (f > 1 ? 'the classmate\'s answer is ' + f + ' times too big.' : 'the classmate\'s answer is ' + Math.round(1 / f) + ' times too small.'))].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf' && !numable(p))) return false;
    if (p.a.t !== 'num' && p.unit) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function part(l, x) { var o = { label: l, a: x.a }; if (x.unit) o.unit = x.unit; return o; }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [part('1.', p), part('2.', p2)] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (mode !== 'place' && numable(p)) forms.push('ncheck');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : f === 'ncheck' ? numCheckForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
