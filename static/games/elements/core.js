/* The Elements (Science Lab): the math behind the atom views, the spectrum colors and the element sounds.
   No drawing here, so the same file runs in the page (window.TRBElCore) and in Node tests (require).

   Orbitals
     parseConfig("1s2 2s2 2p6 …")   -> [{ n, l, count, label: "2p" }]   (any order; "[Ar]" cores are expanded)
     madelung(subshells)             -> the same, sorted by (n + l, n): the Aufbau filling order
     slaterZeff(subs, Z, n, l)       -> effective nuclear charge for one electron in (n, l), Slater's 1930 rules
     nStar(n)                        -> Slater's effective principal quantum number (1, 2, 3, 3.7, 4.0, 4.2, 4.3)
     sizeZ(zeff, n, l)               -> the charge Z' used in the hydrogen-like function so that its mean radius equals
                                        Slater's estimate n*(n* + 1/2) / Zeff (in bohr); for 1s Z' = Zeff
     radial(n, l, Z, r)              -> hydrogen-like R_nl(r), normalized so that ∫ R² r² dr = 1 (r in bohr)
     meanR(n, l, Z)                  -> <r> = (3n² − l(l+1)) / (2Z)
     ylm(l, m, x, y, z)              -> real spherical harmonic (orthonormal on the unit sphere), for l = 0..3
     orbitals(l)                     -> [{ m, name, html }] the 2l + 1 real orbitals of a subshell
     fillOrbitals(count, l)          -> electrons in each of the 2l + 1 orbitals by Hund's rule (singles first)
     sample(n, l, m, Z, count, rnd)  -> Float32Array of count points [x, y, z, sign] drawn from |ψ|²
     rng(seed)                       -> a small seeded random generator (mulberry32)
   Light
     nmToRGB(nm)                     -> [r, g, b] 0–1, the color of a single wavelength on a black background
                                        (CIE 1931 2° observer, fitted by Wyman, Sloan and Shirley 2013, to sRGB)
   Sounds (artistic mappings)
     LIGHT_TO_SOUND = 2^40           -> a light frequency divided by 2^40 (40 octaves down) lands in the audible range
     lineHz(nm)                      -> audible frequency for a spectral line (air wavelength in nm)
     configMelody(subs)              -> [{ deg, midi, beats, label }] one note per subshell in filling order:
                                        the shell number n is the scale degree (n = 1 is do), after Sam Zhang (2006);
                                        the note lasts longer the more electrons the subshell holds
*/
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TRBElCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var M = Math, PI = M.PI;
  var L = 'spdfghi';
  var CORES = { He: '1s2', Ne: '1s2 2s2 2p6', Ar: '1s2 2s2 2p6 3s2 3p6', Kr: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6' };
  CORES.Xe = CORES.Kr + ' 4d10 5s2 5p6';
  CORES.Rn = CORES.Xe + ' 4f14 5d10 6s2 6p6';

  function parseConfig(s) {
    s = String(s || '').replace(/\[(He|Ne|Ar|Kr|Xe|Rn)\]/g, function (_, c) { return ' ' + CORES[c] + ' '; });
    var out = [], re = /(\d)([spdfg])(\d{1,2})/g, m;
    while ((m = re.exec(s))) out.push({ n: +m[1], l: L.indexOf(m[2]), count: +m[3], label: m[1] + m[2] });
    return out;
  }
  function madelung(subs) {
    return subs.slice().sort(function (a, b) { return (a.n + a.l) - (b.n + b.l) || a.n - b.n; });
  }
  function electrons(subs) { return subs.reduce(function (s, x) { return s + x.count; }, 0); }

  // Slater's rules. Groups: (1s)(2s,2p)(3s,3p)(3d)(4s,4p)(4d)(4f)(5s,5p)(5d)(5f)(6s,6p)(6d)(7s,7p)
  function slaterZeff(subs, Z, n, l) {
    var S = 0;
    subs.forEach(function (o) {
      var c = o.count, same = (o.n === n && o.l === l);
      if (same) c -= 1;
      if (c <= 0) return;
      if (l <= 1) {
        if (o.n === n && o.l <= 1) S += c * (n === 1 ? 0.30 : 0.35);
        else if (o.n === n) S += 0;                 // nd, nf of the same n sit to the right
        else if (o.n === n - 1) S += c * 0.85;
        else if (o.n < n - 1) S += c * 1.0;
      } else {
        if (same) S += c * 0.35;
        else if (o.n < n || (o.n === n && o.l < l)) S += c * 1.0;
      }
    });
    return Z - S;
  }
  var NSTAR = [0, 1, 2, 3, 3.7, 4.0, 4.2, 4.3];
  function nStar(n) { return NSTAR[n] || 4.3; }
  function meanR(n, l, Z) { return (3 * n * n - l * (l + 1)) / (2 * Z); }
  function sizeZ(zeff, n, l) {
    var ns = nStar(n), target = ns * (ns + 0.5) / zeff; // Slater-type orbital <r>
    return (3 * n * n - l * (l + 1)) / (2 * target);
  }

  function fact(k) { var f = 1; for (var i = 2; i <= k; i++) f *= i; return f; }
  function laguerre(k, a, x) { // generalized Laguerre L_k^(a)(x)
    if (k === 0) return 1;
    var L0 = 1, L1 = 1 + a - x;
    for (var i = 1; i < k; i++) { var L2 = ((2 * i + 1 + a - x) * L1 - (i + a) * L0) / (i + 1); L0 = L1; L1 = L2; }
    return L1;
  }
  function radial(n, l, Z, r) {
    var rho = 2 * Z * r / n;
    var N = M.sqrt(M.pow(2 * Z / n, 3) * fact(n - l - 1) / (2 * n * fact(n + l)));
    return N * M.exp(-rho / 2) * M.pow(rho, l) * laguerre(n - l - 1, 2 * l + 1, rho);
  }

  // real spherical harmonics, from x, y, z on the unit sphere (or any radius; they are divided by r^l)
  var c00 = 0.5 * M.sqrt(1 / PI), c1 = M.sqrt(3 / (4 * PI));
  var c2a = 0.5 * M.sqrt(15 / PI), c20 = 0.25 * M.sqrt(5 / PI), c22 = 0.25 * M.sqrt(15 / PI);
  var c33 = 0.25 * M.sqrt(35 / (2 * PI)), c32a = 0.5 * M.sqrt(105 / PI), c31 = 0.25 * M.sqrt(21 / (2 * PI)), c30 = 0.25 * M.sqrt(7 / PI), c32b = 0.25 * M.sqrt(105 / PI);
  function ylm(l, m, x, y, z) {
    var r = M.sqrt(x * x + y * y + z * z) || 1; x /= r; y /= r; z /= r;
    switch (l) {
      case 0: return c00;
      case 1: return c1 * (m === -1 ? y : m === 0 ? z : x);
      case 2: switch (m) {
        case -2: return c2a * x * y; case -1: return c2a * y * z; case 0: return c20 * (3 * z * z - 1);
        case 1: return c2a * x * z; default: return c22 * (x * x - y * y);
      }
      case 3: switch (m) {
        case -3: return c33 * y * (3 * x * x - y * y); case -2: return c32a * x * y * z; case -1: return c31 * y * (5 * z * z - 1);
        case 0: return c30 * z * (5 * z * z - 3); case 1: return c31 * x * (5 * z * z - 1);
        case 2: return c32b * z * (x * x - y * y); default: return c33 * x * (x * x - 3 * y * y);
      }
    }
    return 0;
  }
  var NAMES = {
    0: [['', '']],
    1: [['y', 'y'], ['z', 'z'], ['x', 'x']],
    2: [['xy', 'xy'], ['yz', 'yz'], ['z²', 'z<sup>2</sup>'], ['xz', 'xz'], ['x²−y²', 'x<sup>2</sup>−y<sup>2</sup>']],
    3: [['y(3x²−y²)', 'y(3x<sup>2</sup>−y<sup>2</sup>)'], ['xyz', 'xyz'], ['yz²', 'yz<sup>2</sup>'], ['z³', 'z<sup>3</sup>'], ['xz²', 'xz<sup>2</sup>'], ['z(x²−y²)', 'z(x<sup>2</sup>−y<sup>2</sup>)'], ['x(x²−3y²)', 'x(x<sup>2</sup>−3y<sup>2</sup>)']]
  };
  function orbitals(l) {
    return NAMES[l].map(function (nm, i) { return { m: i - l, name: nm[0], html: nm[1] }; });
  }
  function fillOrbitals(count, l) {
    var k = 2 * l + 1, out = [];
    for (var i = 0; i < k; i++) out.push((count > k + i ? 1 : 0) + (count > i ? 1 : 0));
    return out;
  }

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = M.imul(t ^ (t >>> 15), t | 1); t ^= t + M.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // the radius inside which a fraction q of the electron probability lies
  function radialTable(n, l, Z) {
    var rmax = (meanR(n, l, Z) * 4 + 6 / Z), N = 800, cdf = new Float64Array(N + 1), dr = rmax / N, s = 0;
    for (var i = 1; i <= N; i++) { var r = (i - 0.5) * dr, R = radial(n, l, Z, r); s += R * R * r * r * dr; cdf[i] = s; }
    return { cdf: cdf, dr: dr, total: s, N: N };
  }
  function quantileR(tab, q) {
    var t = q * tab.total, lo = 0, hi = tab.N;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (tab.cdf[mid] < t) lo = mid; else hi = mid; }
    var f = (t - tab.cdf[lo]) / ((tab.cdf[hi] - tab.cdf[lo]) || 1);
    return (lo + f) * tab.dr;
  }
  var YMAX = { 0: c00 * c00 };
  function yMax2(l, m) {
    var k = l + ':' + m; if (YMAX[k]) return YMAX[k];
    var best = 0;
    for (var i = 0; i <= 90; i++) for (var j = 0; j < 180; j++) {
      var th = i / 90 * PI, ph = j / 180 * 2 * PI, v = ylm(l, m, M.sin(th) * M.cos(ph), M.sin(th) * M.sin(ph), M.cos(th));
      if (v * v > best) best = v * v;
    }
    return (YMAX[k] = best * 1.02);
  }
  function sample(n, l, m, Z, count, rnd, qmax) {
    rnd = rnd || rng(n * 1000 + l * 100 + m + 7);
    var tab = radialTable(n, l, Z), out = new Float32Array(count * 4), ym = yMax2(l, m), q = qmax || 0.985;
    for (var i = 0; i < count; i++) {
      var r = quantileR(tab, rnd() * q), x, y, z, Y;
      do {
        z = 2 * rnd() - 1; var ph = 2 * PI * rnd(), s = M.sqrt(1 - z * z);
        x = s * M.cos(ph); y = s * M.sin(ph); Y = ylm(l, m, x, y, z);
      } while (rnd() * ym > Y * Y);
      // the overall sign of a wavefunction is a free choice: make the outermost lobe of R positive, as most pictures do
      var sign = (radial(n, l, Z, r) * Y * ((n - l - 1) % 2 ? -1 : 1)) >= 0 ? 1 : -1;
      out[i * 4] = x * r; out[i * 4 + 1] = y * r; out[i * 4 + 2] = z * r; out[i * 4 + 3] = sign;
    }
    return out;
  }
  // a whole atom: one entry per occupied orbital, in filling order, with its size, name and electrons
  function atomOrbitals(config, Z) {
    var subs = parseConfig(config), ord = madelung(subs), list = [];
    ord.forEach(function (s) {
      var zeff = slaterZeff(subs, Z, s.n, s.l), zs = sizeZ(zeff, s.n, s.l), fill = fillOrbitals(s.count, s.l), names = orbitals(s.l);
      names.forEach(function (o, i) {
        if (!fill[i]) return;
        list.push({ n: s.n, l: s.l, m: o.m, sub: s.label, name: s.label + (o.name ? '<sub>' + o.html + '</sub>' : ''), text: s.label + (o.name ? ' ' + o.name : ''),
          electrons: fill[i], subCount: s.count, zeff: zeff, Z: zs, r: meanR(s.n, s.l, zs), r90: quantileR(radialTable(s.n, s.l, zs), 0.9) });
      });
    });
    return list;
  }

  // ---------- light: wavelength to color (Wyman, Sloan & Shirley 2013, multi-lobe fit of the CIE 1931 functions)
  function g(x, mu, s1, s2) { var t = (x - mu) / (x < mu ? s1 : s2); return M.exp(-0.5 * t * t); }
  function cie(nm) {
    var X = 1.056 * g(nm, 599.8, 37.9, 31.0) + 0.362 * g(nm, 442.0, 16.0, 26.7) - 0.065 * g(nm, 501.1, 20.4, 26.2);
    var Y = 0.821 * g(nm, 568.8, 46.9, 40.5) + 0.286 * g(nm, 530.9, 16.3, 31.1);
    var Zc = 1.217 * g(nm, 437.0, 11.8, 36.0) + 0.681 * g(nm, 459.0, 26.0, 13.8);
    return [X, Y, Zc];
  }
  function gam(c) { c = M.max(0, M.min(1, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * M.pow(c, 1 / 2.4) - 0.055; }
  function nmToRGB(nm) {
    // hue: CIE color matching functions to linear sRGB, negative parts clipped (spectral colors lie outside sRGB).
    // Below 410 nm and above 640 nm the hue no longer changes on a screen, so it is held there.
    var xyz = cie(M.max(410, M.min(640, nm))), X = xyz[0], Y = xyz[1], Z = xyz[2];
    var r = M.max(0, 3.2406 * X - 1.5372 * Y - 0.4986 * Z), gg = M.max(0, -0.9689 * X + 1.8758 * Y + 0.0415 * Z), b = M.max(0, 0.0557 * X - 0.2040 * Y + 1.0570 * Z);
    var mx = M.max(r, gg, b) || 1;
    // the eye is less sensitive near the ends of the visible range: fade there
    var f = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 670 ? 0.3 + 0.7 * (750 - nm) / 80 : 1;
    f = M.max(0.3, M.min(1, f)) / mx;
    return [gam(r * f), gam(gg * f), gam(b * f)];
  }
  function rgbHex(c) { return '#' + c.map(function (v) { var h = M.round(M.max(0, M.min(1, v)) * 255).toString(16); return h.length < 2 ? '0' + h : h; }).join(''); }

  // ---------- sounds
  var C_LIGHT = 299792458, N_AIR = 1.000277, LIGHT_TO_SOUND = M.pow(2, 40);
  function lineHz(nm) { return C_LIGHT / (nm * 1e-9 * N_AIR) / LIGHT_TO_SOUND; }
  function hzToMidi(f) { return 69 + 12 * M.log(f / 440) / M.LN2; }
  var MAJOR = [0, 2, 4, 5, 7, 9, 11];
  function configMelody(subs) {
    return madelung(subs).map(function (s) {
      var deg = s.n; // 1 = do … 7 = ti
      return { deg: deg, midi: 60 + MAJOR[deg - 1], beats: 0.5 + s.count / 4, label: s.label + s.count, l: s.l, count: s.count };
    });
  }

  return {
    parseConfig: parseConfig, madelung: madelung, electrons: electrons, slaterZeff: slaterZeff, nStar: nStar, sizeZ: sizeZ,
    radial: radial, meanR: meanR, ylm: ylm, orbitals: orbitals, fillOrbitals: fillOrbitals, rng: rng, sample: sample,
    radialTable: radialTable, quantileR: quantileR, atomOrbitals: atomOrbitals, letters: L,
    nmToRGB: nmToRGB, rgbHex: rgbHex, cie: cie,
    LIGHT_TO_SOUND: LIGHT_TO_SOUND, lineHz: lineHz, hzToMidi: hzToMidi, configMelody: configMelody, MAJOR: MAJOR
  };
});
