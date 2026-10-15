/* Absolute Zero and the Third Law (/science-lab/thermodynamics/third-law/): the models, kept apart from the drawing so
   they can be tested in Node. window.Th5Phys (or module.exports):
   Spins       an ideal spin-½ paramagnet in a field B, plus an internal field b from the spins' pull on each other:
               the cooling ladder of isothermal magnetization and adiabatic demagnetization
   Trap        atoms in a 3-D harmonic trap, cooled by evaporation (random elastic collisions, the hottest atoms escape)
   MARKS       the cosmic thermometer: temperatures with their sources */
(function (root) {
  'use strict';
  var kB = 1.380649e-23;          // J/K, exact (SI, 2019)
  var muB = 9.2740100657e-24;     // J/T, Bohr magneton (CODATA 2022)
  var hbar = 1.054571817e-34;     // J·s, exact (h is exact)
  var u = 1.66053906892e-27;      // kg, atomic mass unit (CODATA 2022)
  var mRb = 86.909180531 * u;     // rubidium-87 (atomic mass from NIST)

  /* ---------- 1. the spin ladder ----------
     x = μ_B B_eff / (k T), B_eff = √(B² + b²). Entropy per spin: S/(N k) = ln(2 cosh x) − x tanh x.
     The entropy depends only on B_eff/T, so with the sample insulated (S fixed), T is proportional to B_eff. */
  function Beff(B, b) { return Math.sqrt(B * B + b * b); }
  function sOfX(x) { x = Math.abs(x); var e = Math.exp(-2 * x); return Math.log1p(e) + 2 * x * e / (1 + e); }   // = ln(2 cosh x) − x tanh x, written so it never overflows
  function entropy(T, B, b) { return sOfX(muB * Beff(B, b) / (kB * T)); }    // S/(N k)
  function polar(T, B, b) { return Math.tanh(muB * Beff(B, b) / (kB * T)); }  // how lined up the spins are, 0 to 1
  /* heat capacity per spin, C/(N k) = x² / cosh² x */
  function heatCap(T, B, b) { var x = muB * Beff(B, b) / (kB * T); return x > 300 ? 0 : x * x / Math.pow(Math.cosh(x), 2); }
  /* one round: magnetize at T (heat Q leaves to the bath), then demagnetize with the sample insulated */
  function round(T, Bhigh, b) {
    var S0 = entropy(T, 0, b), S1 = entropy(T, Bhigh, b);
    var Q = T * (S0 - S1);                       // heat given to the bath, per spin, in units of k (so Q × k is joules)
    var T2 = T * Beff(0, b) / Beff(Bhigh, b);    // S(T2, 0) = S(T, B_high)
    return { T: T2, Q: Q, Shigh: S1, Slow: S0, ratio: Beff(0, b) / Beff(Bhigh, b) };
  }
  /* the temperature T at which the entropy (field B) equals s: solve by bisection on log T */
  function tempForS(s, B, b) {
    var lo = Math.log(1e-14), hi = Math.log(1e6);
    for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (entropy(Math.exp(m), B, b) < s) lo = m; else hi = m; }
    return Math.exp((lo + hi) / 2);
  }

  /* ---------- 2. evaporative cooling of trapped atoms ----------
     Model atoms (each standing for many real ones) move in an isotropic 3-D harmonic trap, exactly (in units where m = 1,
     ω = 1, and k T at the start = 1). Collisions are random pairs that keep momentum and energy: the relative velocity is
     turned to a random direction. Any atom whose energy is above the trap depth U escapes. Too few model atoms? Each is
     split in two, with the copy's position and velocity turned by random rotations, which keeps every atom's energy. */
  function rng(seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(r) { var a = 1 - r(), c = r(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * c); }
  function Trap(opt) {
    opt = opt || {};
    this.M = opt.M || 3000; this.r = rng(opt.seed || 5);
    this.T0 = opt.T0 || 50e-6;            // K at the start
    this.N0 = opt.N0 || 3e8;              // real atoms at the start
    this.f = opt.f || 100;                // trap frequency, Hz
    this.U = opt.U || 10;                 // trap depth in units of k T0
    this.rate = opt.rate || 0.08;         // collisions per atom per frame at the start
    this.cap = opt.cap || 1;
    this.life = opt.life || 4000;         // frames: atoms are also knocked out by the leftover gas in the vacuum chamber
    this.minM = opt.minM || 900;
    var M = this.M, r = this.r;
    this.p = new Float64Array(6 * M * 2); // x y z vx vy vz, room for doubling
    for (var i = 0; i < M; i++) { for (var k = 0; k < 6; k++) this.p[6 * i + k] = gauss(r); }
    this.n = M; this.w = this.N0 / M; this.lost = 0; this.t = 0; this.splits = 0;
    this.trim();
  }
  Trap.prototype.energy = function (i) { var p = this.p, o = 6 * i; return 0.5 * (p[o] * p[o] + p[o + 1] * p[o + 1] + p[o + 2] * p[o + 2] + p[o + 3] * p[o + 3] + p[o + 4] * p[o + 4] + p[o + 5] * p[o + 5]); };
  Trap.prototype.remove = function (i) { var p = this.p, o = 6 * i, l = 6 * (this.n - 1); for (var k = 0; k < 6; k++) p[o + k] = p[l + k]; this.n--; this.lost += this.w; };
  Trap.prototype.trim = function () { for (var i = this.n - 1; i >= 0; i--) if (this.energy(i) > this.U) this.remove(i); };
  /* kinetic temperature in units of T0: <v²>/3 */
  Trap.prototype.kT = function () { var p = this.p, s = 0; for (var i = 0; i < this.n; i++) { var o = 6 * i; s += p[o + 3] * p[o + 3] + p[o + 4] * p[o + 4] + p[o + 5] * p[o + 5]; } return this.n ? s / (3 * this.n) : 0; };
  Trap.prototype.kTpot = function () { var p = this.p, s = 0; for (var i = 0; i < this.n; i++) { var o = 6 * i; s += p[o] * p[o] + p[o + 1] * p[o + 1] + p[o + 2] * p[o + 2]; } return this.n ? s / (3 * this.n) : 0; };
  Trap.prototype.totalE = function () { var s = 0; for (var i = 0; i < this.n; i++) s += this.energy(i); return s; };
  Trap.prototype.N = function () { return this.n * this.w; };
  Trap.prototype.T = function () { return this.T0 * this.kT(); };
  function rot(r, v, o) { // a random rotation (uniform) applied to the 3-vector at v[o..o+2]
    var q0 = gauss(r), q1 = gauss(r), q2 = gauss(r), q3 = gauss(r), n = Math.sqrt(q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3); q0 /= n; q1 /= n; q2 /= n; q3 /= n;
    var x = v[o], y = v[o + 1], z = v[o + 2];
    v[o] = (1 - 2 * (q2 * q2 + q3 * q3)) * x + 2 * (q1 * q2 - q0 * q3) * y + 2 * (q1 * q3 + q0 * q2) * z;
    v[o + 1] = 2 * (q1 * q2 + q0 * q3) * x + (1 - 2 * (q1 * q1 + q3 * q3)) * y + 2 * (q2 * q3 - q0 * q1) * z;
    v[o + 2] = 2 * (q1 * q3 - q0 * q2) * x + 2 * (q2 * q3 + q0 * q1) * y + (1 - 2 * (q1 * q1 + q2 * q2)) * z;
  }
  Trap.prototype.split = function () {
    var n = this.n, p = this.p, r = this.r;
    for (var i = 0; i < n; i++) { var a = 6 * i, b = 6 * (n + i); for (var k = 0; k < 6; k++) p[b + k] = p[a + k]; rot(r, p, b); rot(r, p, b + 3); }
    this.n = 2 * n; this.w /= 2; this.splits++;
  };
  /* one frame: move along the exact harmonic orbits by angle dphi, then collide, then let the hottest escape */
  Trap.prototype.step = function (dphi) {
    var p = this.p, n = this.n, c = Math.cos(dphi), s = Math.sin(dphi), i, k, r = this.r;
    for (i = 0; i < n; i++) for (k = 0; k < 3; k++) { var o = 6 * i + k, x = p[o], v = p[o + 3]; p[o] = x * c + v * s; p[o + 3] = v * c - x * s; }
    // collision rate grows with density × speed: ∝ N / T in a harmonic trap (capped so the frame stays cheap)
    var kT = Math.max(1e-9, this.kT()), per = Math.min(this.cap, this.rate * (this.N() / this.N0) / kT);
    var m = Math.round(per * n / 2);
    for (k = 0; k < m && n > 1; k++) {
      var a = Math.floor(r() * n), b = Math.floor(r() * (n - 1)); if (b >= a) b++;
      var oa = 6 * a + 3, ob = 6 * b + 3;
      var cx = (p[oa] + p[ob]) / 2, cy = (p[oa + 1] + p[ob + 1]) / 2, cz = (p[oa + 2] + p[ob + 2]) / 2;
      var gx = p[oa] - p[ob], gy = p[oa + 1] - p[ob + 1], gz = p[oa + 2] - p[ob + 2], g = Math.sqrt(gx * gx + gy * gy + gz * gz) / 2;
      var ct = 2 * r() - 1, st = Math.sqrt(1 - ct * ct), ph = 2 * Math.PI * r(), ux = st * Math.cos(ph), uy = st * Math.sin(ph), uz = ct;
      p[oa] = cx + g * ux; p[oa + 1] = cy + g * uy; p[oa + 2] = cz + g * uz;
      p[ob] = cx - g * ux; p[ob + 1] = cy - g * uy; p[ob + 2] = cz - g * uz;
    }
    // background losses: each atom has a small chance per frame of being knocked out
    var lose = n * (1 - Math.exp(-1 / this.life)), whole = Math.floor(lose) + (r() < lose - Math.floor(lose) ? 1 : 0);
    for (k = 0; k < whole && this.n > 0; k++) this.remove(Math.floor(r() * this.n));
    this.trim();
    if (this.n < this.minM && this.n > 4) this.split();
    this.t += dphi;
    return per;
  };
  /* the ideal Bose gas in a harmonic trap condenses below T_c = 0.94 ħω N^(1/3) / k */
  Trap.prototype.Tc = function () { return 0.94 * hbar * 2 * Math.PI * this.f * Math.cbrt(Math.max(1, this.N())) / kB; };
  Trap.prototype.condensate = function () { if (this.n < 2) return 0; var T = this.T(), Tc = this.Tc(); return T < Tc ? 1 - Math.pow(T / Tc, 3) : 0; };
  /* sizes: cloud radius σ = √(kT/(mω²)) in meters, speed σ_v = √(kT/m) in m/s */
  Trap.prototype.sigma = function () { var w = 2 * Math.PI * this.f; return Math.sqrt(kB * this.T() / (mRb * w * w)); };
  Trap.prototype.sigmaV = function () { return Math.sqrt(kB * this.T() / mRb); };
  Trap.prototype.depthK = function () { return this.U * this.T0; };

  /* ---------- 3. the cosmic thermometer ---------- */
  var MARKS = [
    { T: 3.8e-11, name: 'Coldest ever made', note: 'An effective temperature of 38 picokelvin, reached in 2021 by a Bose–Einstein condensate of rubidium atoms falling down the 110-meter drop tower in Bremen, Germany.', src: 'APS Physics', url: 'https://physics.aps.org/articles/v14/119', lab: 1 },
    { T: 1.0e-7, name: 'Cold Atom Lab, in orbit', note: 'NASA’s Cold Atom Lab on the International Space Station reported temperatures as low as 100 nanokelvin in 2018.', src: 'NASA', url: 'https://www.nasa.gov/missions/station/iss-research/cold-atom-laboratory/space-station-experiment-reaches-ultracold-milestone/', lab: 1 },
    { T: 1.7e-7, name: 'First Bose–Einstein condensate', note: 'JILA, Boulder, Colorado, June 5, 1995: about 2,000 rubidium atoms below 170 billionths of a degree above absolute zero.', src: 'NIST', url: 'https://www.nist.gov/news-events/news/1995/07/physicists-create-new-state-matter-record-low-temperature', lab: 1 },
    { T: 1.0e-5, name: 'Laser cooling', note: 'Before the first condensate, lasers cooled the rubidium atoms to about 10 millionths of a degree above absolute zero.', src: 'NIST', url: 'https://www.nist.gov/news-events/news/1995/07/physicists-create-new-state-matter-record-low-temperature', lab: 1 },
    { T: 0.006, name: 'CUORE’s copper vessel', note: 'In 2014 the CUORE experiment in Italy held a cubic meter of copper at 6 millikelvin for 15 days.', src: 'Wikipedia: Absolute zero', url: 'https://en.wikipedia.org/wiki/Absolute_zero', lab: 1 },
    { T: 0.25, name: 'First magnetic cooling', note: 'In 1933 William Giauque and D. P. MacDougall reached 0.25 K by demagnetizing a paramagnetic salt, the trick in the cooling ladder above.', src: 'Wikipedia: Magnetic refrigeration', url: 'https://en.wikipedia.org/wiki/Magnetic_refrigeration', lab: 1 },
    { T: 1, name: 'Boomerang Nebula', note: 'About 1 K: the coldest natural place known, a cloud of gas blown out by a dying star, colder even than the glow of the Big Bang.', src: 'Wikipedia: Absolute zero', url: 'https://en.wikipedia.org/wiki/Absolute_zero' },
    { T: 2.17, name: 'Helium becomes a superfluid', note: 'Below 2.17 K liquid helium-4 flows with no viscosity at all. Pyotr Kapitsa, and John Allen with Don Misener, discovered it in 1937.', src: 'Wikipedia: Superfluid helium-4', url: 'https://en.wikipedia.org/wiki/Superfluid_helium-4' },
    { T: 2.725, name: 'Cosmic microwave background', note: 'The glow left over from the hot early universe fills all of space at 2.725 K, measured by NASA’s COBE satellite.', src: 'NASA LAMBDA (COBE FIRAS)', url: 'https://lambda.gsfc.nasa.gov/product/cobe/about_firas.html' },
    { T: 4.2, name: 'Liquid helium; mercury superconducts', note: 'Helium boils at about 4.2 K. Heike Kamerlingh Onnes first liquefied it in 1908, and in 1911 found that mercury loses all electrical resistance at 4.2 K: superconductivity.', src: 'Wikipedia: Heike Kamerlingh Onnes', url: 'https://en.wikipedia.org/wiki/Heike_Kamerlingh_Onnes' },
    { T: 48, name: 'Pluto', note: 'Pluto’s mean surface temperature is about −225 °C (−375 °F).', src: 'NASA', url: 'https://science.nasa.gov/solar-system/temperatures-across-our-solar-system/' },
    { T: 77.35, name: 'Liquid nitrogen boils', note: 'At 77 K (−196 °C, −321 °F).', src: 'Wikipedia: Orders of magnitude (temperature)', url: 'https://en.wikipedia.org/wiki/Orders_of_magnitude_(temperature)' },
    { T: 92, name: 'A “high-temperature” superconductor', note: 'Yttrium barium copper oxide (YBCO) superconducts below about 92 K, so liquid nitrogen is cold enough.', src: 'Wikipedia: Orders of magnitude (temperature)', url: 'https://en.wikipedia.org/wiki/Orders_of_magnitude_(temperature)' },
    { T: 183.95, name: 'Coldest air on Earth', note: '−89.2 °C (−128.6 °F), Vostok Station, Antarctica, 1983.', src: 'NASA', url: 'https://science.nasa.gov/solar-system/temperatures-across-our-solar-system/' },
    { T: 194.6, name: 'Dry ice', note: 'Solid carbon dioxide turns straight into gas at −78.5 °C (194.6 K).', src: 'Wikipedia: Orders of magnitude (temperature)', url: 'https://en.wikipedia.org/wiki/Orders_of_magnitude_(temperature)' },
    { T: 273.15, name: 'Water freezes', note: '0 °C is 273.15 K exactly: the Celsius scale is defined from the kelvin this way.', src: 'NIST SP 330', url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.330-2019.pdf' },
    { T: 310, name: 'Your body', note: 'About 37 °C (98.6 °F), or 310 K.', src: 'Wikipedia: Orders of magnitude (temperature)', url: 'https://en.wikipedia.org/wiki/Orders_of_magnitude_(temperature)' },
    { T: 373.15, name: 'Water boils', note: 'About 100 °C (212 °F) at sea level.', src: 'Wikipedia: Orders of magnitude (temperature)', url: 'https://en.wikipedia.org/wiki/Orders_of_magnitude_(temperature)' },
    { T: 737, name: 'Venus’s surface', note: 'A mean of 464 °C (867 °F): hot enough to melt lead.', src: 'NASA', url: 'https://science.nasa.gov/solar-system/temperatures-across-our-solar-system/' },
    { T: 5773, name: 'The Sun’s surface', note: 'About 5,500 °C (10,000 °F).', src: 'NASA', url: 'https://science.nasa.gov/sun/facts/' },
    { T: 2e6, name: 'The Sun’s corona', note: 'The Sun’s outer atmosphere reaches about 2 million °C (3.5 million °F).', src: 'NASA', url: 'https://science.nasa.gov/sun/facts/' },
    { T: 1.5e7, name: 'The Sun’s core', note: 'About 15 million °C (27 million °F), where hydrogen fuses into helium.', src: 'NASA', url: 'https://science.nasa.gov/sun/facts/' },
    { T: 1.5e8, name: 'Fusion plasma (ITER)', note: 'ITER’s plasma must reach 150 million °C, ten times hotter than the Sun’s core. See Magnetic Bottles for Fusion.', src: 'ITER Organization', url: 'https://www.iter.org/node/2303', link: 'games/magnetic-bottles/' }
  ];

  var API = { kB: kB, muB: muB, hbar: hbar, mRb: mRb, Beff: Beff, entropy: entropy, sOfX: sOfX, polar: polar, heatCap: heatCap, round: round, tempForS: tempForS, Trap: Trap, MARKS: MARKS, rng: rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Th5Phys = API;
})(this);
