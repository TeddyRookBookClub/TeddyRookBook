/* Mixing Lab: the chemistry model (window.ChemModel; also a Node module for the tests).
   pH: exact charge balance with water's autoionization at 25 °C, Kw = 1.0e-14 (OpenStax Chemistry 2e, 14.1).
   Indicators: color charts from the sources listed on the page. Reaction rates: a 2-D box of hard disks in which an
   A–B collision reacts only if its energy along the line of centers reaches the activation energy (collision theory). */
(function (root) {
  'use strict';
  var KW = 1.0e-14;            // [H3O+][OH-] at 25 °C
  var KA_ACETIC = 1.8e-5;      // acetic acid, OpenStax Chemistry 2e, 14.7 and Appendix H
  var R = 8.314462618;         // molar gas constant, J/(mol K), CODATA 2018 (NIST)

  function log10(x) { return Math.log(x) / Math.LN10; }

  // ---------- pH ----------
  // Strong acid (HCl) and strong base (NaOH): charge balance [H3O+] + [Na+] = [OH-] + [Cl-], [OH-] = Kw/[H3O+].
  // With D = ([Cl-] - [Na+]): [H3O+] = (D + sqrt(D^2 + 4Kw)) / 2, written so it never loses digits.
  function hStrong(nAcid, nBase, V) {
    var D = (nAcid - nBase) / V, s = Math.sqrt(D * D + 4 * KW);
    return D >= 0 ? (D + s) / 2 : 2 * KW / (s - D);
  }
  function phStrong(nAcid, nBase, V) { return V > 0 ? -log10(hStrong(nAcid, nBase, V)) : NaN; }

  // A monoprotic acid HA (total concentration C, acid constant Ka; Ka = Infinity for a strong acid) with Na+ at
  // concentration Na: [H3O+] + [Na+] = [OH-] + [A-], [A-] = C·Ka/(Ka + [H3O+]). The left side minus the right side
  // grows steadily with [H3O+], so bisection on log[H3O+] always finds the one root.
  function phAcid(C, Ka, Na) {
    var strong = !isFinite(Ka);
    if (strong) return -log10(hStrong(C, Na, 1));
    var lo = -16, hi = 1.5;
    for (var i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2, h = Math.pow(10, mid);
      var f = h + Na - KW / h - C * Ka / (Ka + h);
      if (f > 0) hi = mid; else lo = mid;
    }
    return -(lo + hi) / 2;
  }
  // a titration: acid (concentration ca mol/L, volume Va L, Ka) plus Vb L of NaOH at cb mol/L
  function phTitration(ca, Va, Ka, cb, Vb) {
    var V = Va + Vb;
    return phAcid(ca * Va / V, Ka, cb * Vb / V);
  }
  function pKa(Ka) { return -log10(Ka); }

  // ---------- the shelf: typical pH values, from the sources on the page ----------
  // tint: the liquid's own color; op: how much it hides an indicator's color (0 clear .. 1 opaque)
  var SHELF = [
    { id: 'lemon', name: 'Lemon juice', short: 'Lemon', pH: 2.3, lo: 2.0, hi: 2.6, tint: [246, 232, 150], op: 0.35, src: 'FDA' },
    { id: 'vinegar', name: 'Vinegar', short: 'Vinegar', pH: 2.5, lo: 2.4, hi: 3.4, tint: [240, 238, 225], op: 0.08, src: 'FDA' },
    { id: 'cola', name: 'Cola', short: 'Cola', pH: 2.4, lo: 2.4, hi: 2.4, tint: [92, 46, 22], op: 0.62, src: 'JADA' },
    { id: 'coffee', name: 'Black coffee', short: 'Coffee', pH: 5.0, lo: 5.0, hi: 5.0, tint: [70, 42, 24], op: 0.72, src: 'OpenStax' },
    { id: 'milk', name: 'Milk', short: 'Milk', pH: 6.6, lo: 6.4, hi: 6.8, tint: [248, 246, 238], op: 0.55, src: 'FDA' },
    { id: 'water', name: 'Pure water', short: 'Water', pH: 7.0, lo: 7.0, hi: 7.0, tint: [200, 228, 245], op: 0.0, src: 'OpenStax' },
    { id: 'soda', name: 'Baking soda solution', short: 'Baking soda', pH: 8.3, lo: 8.3, hi: 8.3, tint: [235, 240, 240], op: 0.1, src: 'computed' },
    { id: 'soap', name: 'Soapy water', short: 'Soapy water', pH: 9.5, lo: 9.0, hi: 10.0, tint: [236, 240, 246], op: 0.3, src: 'Tarun' },
    { id: 'ammonia', name: 'Household ammonia', short: 'Ammonia', pH: 11.5, lo: 11.0, hi: 12.0, tint: [226, 240, 246], op: 0.05, src: 'PSU' }
  ];

  // ---------- indicators ----------
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ramp(stops, x) {
    if (x <= stops[0][0]) return stops[0][1].slice();
    for (var i = 1; i < stops.length; i++) {
      if (x <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i], t = (x - a[0]) / (b[0] - a[0]);
        return [lerp(a[1][0], b[1][0], t), lerp(a[1][1], b[1][1], t), lerp(a[1][2], b[1][2], t)];
      }
    }
    return stops[stops.length - 1][1].slice();
  }
  // universal indicator, after the usual chart: red to pH 3, orange and yellow 4-6, green 7, blue 8-10, violet from 11
  var UNI = [[0, [205, 32, 38]], [3, [226, 48, 40]], [4, [240, 116, 36]], [5, [246, 164, 34]], [6, [236, 206, 44]], [7, [52, 168, 74]], [8, [34, 150, 178]], [9, [40, 110, 204]], [10, [46, 78, 192]], [11, [78, 56, 168]], [14, [112, 40, 150]]];
  // red cabbage juice (University of Illinois chart): red 2, purple 4, violet 6, blue 8, blue-green 10, greenish yellow 12
  var CAB = [[0, [196, 26, 58]], [2, [208, 38, 74]], [4, [150, 50, 128]], [6, [112, 62, 176]], [8, [52, 92, 204]], [10, [36, 150, 142]], [12, [168, 198, 58]], [14, [196, 206, 46]]];
  // litmus: red below 4.5, blue above 8.3, purple between
  var LIT = [[4.5, [204, 46, 60]], [6.4, [132, 62, 150]], [8.3, [48, 82, 192]]];
  var INDICATORS = {
    none: { name: 'No indicator' },
    universal: { name: 'Universal indicator' },
    cabbage: { name: 'Red cabbage juice' },
    phenol: { name: 'Phenolphthalein' },
    litmus: { name: 'Litmus' }
  };
  // returns {rgb, a (0..1 strength of the color), name}
  function indicator(id, pH) {
    if (!isFinite(pH)) return { rgb: [200, 228, 245], a: 0, name: '' };
    if (id === 'universal') return { rgb: ramp(UNI, pH), a: 0.9, name: pH < 3.5 ? 'red' : pH < 4.5 ? 'orange' : pH < 6.5 ? 'yellow' : pH < 7.5 ? 'green' : pH < 10.5 ? 'blue' : 'violet' };
    if (id === 'cabbage') return { rgb: ramp(CAB, pH), a: 0.85, name: cabbageName(pH) };
    if (id === 'phenol') {
      var t = Math.max(0, Math.min(1, (pH - 8.2) / 1.8));
      return { rgb: [226, 52, 150], a: 0.9 * Math.pow(t, 0.8), name: pH < 8.2 ? 'colorless' : pH < 9 ? 'pale pink' : pH < 10 ? 'pink' : 'deep pink' };
    }
    if (id === 'litmus') return { rgb: ramp(LIT, pH), a: 0.85, name: pH < 4.5 ? 'red' : pH <= 8.3 ? 'purple' : 'blue' };
    return { rgb: [200, 228, 245], a: 0, name: '' };
  }
  function cabbageName(pH) { return pH <= 3 ? 'red' : pH <= 5 ? 'purple' : pH <= 7 ? 'violet' : pH <= 9 ? 'blue' : pH <= 11 ? 'blue-green' : 'greenish yellow'; }

  // ---------- reaction rates: a 2-D box of hard disks ----------
  // A + B → C + D. Every particle is a disk of radius r and mass 1. Lengths are in box units and time in seconds of box
  // time. The temperature sets kT through the rms speed: V0 box units per second at 298.15 K, so kT = V0²/2 · T/298.15.
  // kT stands for RT per mole: an A–B collision reacts when ½·μ·v_n² ≥ (Ea / RT)·kT, with v_n the closing speed along
  // the line of centers and μ the reduced mass. The bounce itself is elastic either way (the model's reaction gives off
  // no heat). With the supply on, products drift off without touching anything and fade, and fresh reactants come in.
  function mulberry(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  var A = 0, B = 1, C = 2, D = 3;
  function Box(o) {
    o = o || {};
    this.W = o.W || 80; this.H = o.H || 60; this.r = o.r || 1.2; this.V0 = o.V0 || 26;
    this.T = o.T || 298.15; this.Ea = o.Ea === undefined ? 7000 : o.Ea; this.cat = !!o.cat; this.catFactor = 0.5;
    this.topUp = o.topUp === undefined ? true : !!o.topUp; this.life = o.life || 2.5;
    this.rand = mulberry(o.seed || 12345); this.spare = null;
    this.p = []; this.feed = []; this.time = 0; this.events = []; this.keepEvents = o.keepEvents !== false;
    this.stats = { t: 0, coll: 0, react: 0, wall: 0 };
    this.nextId = 1; this.subFrac = o.subFrac || 0.2; this.specular = false;
  }
  var BP = Box.prototype;
  BP.gauss = function () {
    if (this.spare !== null) { var s = this.spare; this.spare = null; return s; }
    var u, v, q; do { u = this.rand() * 2 - 1; v = this.rand() * 2 - 1; q = u * u + v * v; } while (q >= 1 || q === 0);
    var f = Math.sqrt(-2 * Math.log(q) / q); this.spare = v * f; return u * f;
  };
  BP.kT = function () { return this.V0 * this.V0 / 2 * this.T / 298.15; };
  BP.EaEff = function () { return this.cat ? this.Ea * this.catFactor : this.Ea; };          // J/mol
  BP.barrier = function () { return this.EaEff() / (R * this.T) * this.kT(); };             // box energy units
  BP.count = function (k) { var n = 0; for (var i = 0; i < this.p.length; i++) if (this.p[i].k === k) n++; return n; };
  BP.make = function (k, x, y) {
    var s = Math.sqrt(this.kT());
    return { id: this.nextId++, k: k, x: x, y: y, vx: s * this.gauss(), vy: s * this.gauss(), m: 1, r: this.r, age: 0, fresh: 0 };
  };
  // a free spot for a new particle (tries random places, then takes the roomiest one it found)
  BP.spot = function () {
    var r = this.r, best = null, bestD = -1e9;
    for (var t = 0; t < 40; t++) {
      var x = r + this.rand() * (this.W - 2 * r), y = r + this.rand() * (this.H - 2 * r), dmin = 1e9;
      for (var i = 0; i < this.p.length; i++) { var q = this.p[i], d = Math.hypot(q.x - x, q.y - y) - q.r - r; if (d < dmin) dmin = d; }
      if (dmin > 0.2) return [x, y];
      if (dmin > bestD) { bestD = dmin; best = [x, y]; }
    }
    return best;
  };
  BP.add = function (k, n) { for (var i = 0; i < n; i++) { var s = this.spot(); this.p.push(this.make(k, s[0], s[1])); } };
  BP.remove = function (k, n) { for (var i = this.p.length - 1; i >= 0 && n > 0; i--) if (this.p[i].k === k) { this.p.splice(i, 1); n--; } };
  BP.setCount = function (k, n) { var c = this.count(k); if (n > c) this.add(k, n - c); else if (n < c) this.remove(k, c - n); };
  BP.clearProducts = function () { for (var i = this.p.length - 1; i >= 0; i--) if (this.p[i].k >= C) this.p.splice(i, 1); };
  BP.clear = function () { this.p = []; this.events = []; };
  BP.setT = function (T) { // heats or cools every particle at once, as if the bath changed instantly
    var f = Math.sqrt(T / this.T); this.T = T;
    for (var i = 0; i < this.p.length; i++) { this.p[i].vx *= f; this.p[i].vy *= f; }
  };
  BP.resetStats = function () { this.stats = { t: 0, coll: 0, react: 0, wall: 0 }; };
  BP.measuredT = function () {
    var e = 0, n = 0; for (var i = 0; i < this.p.length; i++) { var q = this.p[i]; if (q.ghost) continue; e += 0.5 * q.m * (q.vx * q.vx + q.vy * q.vy); n++; }
    return n ? e / n / (this.V0 * this.V0 / 2 / 298.15) : this.T;
  };
  // what collision theory predicts for A–B collisions and reactions per second of box time
  BP.predicted = function (nA, nB) {
    if (nA === undefined) { nA = this.count(A); nB = this.count(B); }
    var r = this.r, area = (this.W - 2 * r) * (this.H - 2 * r), mu = 0.5;
    var solid = 0; for (var i = 0; i < this.p.length; i++) if (!this.p[i].ghost) solid++;
    var eta = solid * Math.PI * r * r / (this.W * this.H);           // fraction of the floor covered by disks
    var g = (1 - 7 * eta / 16) / ((1 - eta) * (1 - eta));            // contact value for hard disks (Henderson 1975)
    var vrel = Math.sqrt(Math.PI * this.kT() / (2 * mu));            // mean relative speed in 2-D
    // near a wall part of a particle's surroundings is missing: on average 1/π of the circle of contact for centers
    // closer than rA + rB to the edge, which takes away (perimeter · 2r / π) / area of the collisions
    var wf = 1 - 2 * ((this.W - 2 * r) + (this.H - 2 * r)) * (2 * r) / Math.PI / area;
    var z = nA * nB / area * 2 * (2 * r) * vrel * g * wf;             // each A sweeps a strip 2(rA + rB) wide
    return { coll: z, rate: z * Math.exp(-this.EaEff() / (R * this.T)), g: g, eta: eta, wall: wf };
  };
  BP.vmax = function () { var v = 0; for (var i = 0; i < this.p.length; i++) { var q = this.p[i], s = q.vx * q.vx + q.vy * q.vy; if (s > v) v = s; } return Math.sqrt(v); };

  BP.wall = function (q) {
    var kT = this.kT(), s = Math.sqrt(kT / q.m), hit = false, self = this;
    if (this.specular) { // mirror walls (used by the tests to check that bounces keep the energy)
      if (q.x < q.r) { q.x = 2 * q.r - q.x; q.vx = -q.vx; } else if (q.x > this.W - q.r) { q.x = 2 * (this.W - q.r) - q.x; q.vx = -q.vx; }
      if (q.y < q.r) { q.y = 2 * q.r - q.y; q.vy = -q.vy; } else if (q.y > this.H - q.r) { q.y = 2 * (this.H - q.r) - q.y; q.vy = -q.vy; }
      return;
    }
    // thermostat walls: a particle leaves a wall with a fresh velocity drawn for the wall's temperature
    function vn() { return Math.sqrt(-2 * kT / q.m * Math.log(1 - self.rand())); }
    if (q.x < q.r) { q.x = 2 * q.r - q.x; q.vx = vn(); q.vy = s * this.gauss(); hit = true; }
    else if (q.x > this.W - q.r) { q.x = 2 * (this.W - q.r) - q.x; q.vx = -vn(); q.vy = s * this.gauss(); hit = true; }
    if (q.y < q.r) { q.y = 2 * q.r - q.y; q.vy = vn(); q.vx = s * this.gauss(); hit = true; }
    else if (q.y > this.H - q.r) { q.y = 2 * (this.H - q.r) - q.y; q.vy = -vn(); q.vx = s * this.gauss(); hit = true; }
    if (hit) this.stats.wall++;
  };

  BP.step = function (dt) {
    if (dt <= 0) return;
    var vm = Math.max(this.vmax(), 1e-6), nsub = Math.min(600, Math.max(1, Math.ceil(dt * vm / (this.subFrac * this.r)))), h = dt / nsub;
    for (var s = 0; s < nsub; s++) this.sub(h);
    // with the supply on, products are taken away after a while (fresh A and B came in when they formed)
    if (this.topUp) for (var i = this.p.length - 1; i >= 0; i--) { var q = this.p[i]; if (q.k >= C && q.age > this.life) this.p.splice(i, 1); }
  };
  BP.sub = function (h) {
    var p = this.p, n = p.length, i, q;
    for (i = 0; i < n; i++) { q = p[i]; q.x += q.vx * h; q.y += q.vy * h; q.age += h; this.wall(q); }
    this.time += h; this.stats.t += h;
    // a grid of cells at least one particle diameter wide finds the pairs that could touch
    var cs = 2 * this.r + 0.01, nx = Math.max(1, Math.floor(this.W / cs)), ny = Math.max(1, Math.floor(this.H / cs));
    var head = new Int32Array(nx * ny).fill(-1), next = new Int32Array(n);
    for (i = 0; i < n; i++) {
      q = p[i]; if (q.ghost) continue;   // products on their way out pass through everything
      var cx = Math.min(nx - 1, Math.max(0, Math.floor(q.x / this.W * nx))), cy = Math.min(ny - 1, Math.max(0, Math.floor(q.y / this.H * ny)));
      q.cell = cy * nx + cx; next[i] = head[q.cell]; head[q.cell] = i;
    }
    for (i = 0; i < n; i++) {
      q = p[i]; if (q.ghost) continue;
      var ci = q.cell % nx, cj = (q.cell - ci) / nx;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var x2 = ci + dx, y2 = cj + dy; if (x2 < 0 || y2 < 0 || x2 >= nx || y2 >= ny) continue;
        for (var j = head[y2 * nx + x2]; j !== -1; j = next[j]) if (j > i) this.pair(q, p[j], h);
      }
    }
    // the supply: for each pair used up, a fresh A and B come in at random places with the velocities the used pair had
    // just before they met, so the reactants keep the mix of speeds of a gas at the box's temperature
    while (this.feed.length) { var f = this.feed.pop(), sp = this.spot(), nq = this.make(f.k, sp[0], sp[1]); nq.vx = f.vx; nq.vy = f.vy; nq.fresh = 1; p.push(nq); }
  };
  BP.pair = function (a, b, h) {
    var dx = b.x - a.x, dy = b.y - a.y, Rr = a.r + b.r, d2 = dx * dx + dy * dy;
    if (d2 >= Rr * Rr) return false;
    var dvx = b.vx - a.vx, dvy = b.vy - a.vy, bb = dx * dvx + dy * dvy;
    if (bb >= 0) return false;                                       // already moving apart
    var v2 = dvx * dvx + dvy * dvy, tau = (bb + Math.sqrt(Math.max(0, bb * bb - v2 * (d2 - Rr * Rr)))) / v2;
    if (!(tau <= h * 1.0001) || tau < 0) tau = 0;                    // they overlapped already: bounce where they are
    a.x -= a.vx * tau; a.y -= a.vy * tau; b.x -= b.vx * tau; b.y -= b.vy * tau;   // back to the moment of contact
    dx = b.x - a.x; dy = b.y - a.y; var d = Math.sqrt(dx * dx + dy * dy) || 1e-9, nx = dx / d, ny = dy / d;
    var vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;               // closing speed along the line of centers (< 0)
    var mu = a.m * b.m / (a.m + b.m), react = false;
    if ((a.k === A && b.k === B) || (a.k === B && b.k === A)) {
      this.stats.coll++;
      var En = 0.5 * mu * vn * vn;
      react = En >= this.barrier();
      if (this.keepEvents) this.events.push({ x: a.x + nx * a.r, y: a.y + ny * a.r, E: En / this.kT() * R * this.T / 1000, react: react, t: this.time });
      if (react) {
        this.stats.react++;
        if (this.topUp) this.feed.push({ k: a.k, vx: a.vx, vy: a.vy }, { k: b.k, vx: b.vx, vy: b.vy });
        a.k = a.k === A ? C : D; b.k = b.k === A ? C : D; a.age = b.age = 0; a.ghost = b.ghost = this.topUp;
      }
    }
    var J = 2 * mu * vn;                                              // the bounce: elastic, reacting or not
    a.vx += J / a.m * nx; a.vy += J / a.m * ny; b.vx -= J / b.m * nx; b.vy -= J / b.m * ny;
    a.x += a.vx * tau; a.y += a.vy * tau; b.x += b.vx * tau; b.y += b.vy * tau;
    return react;
  };

  var api = {
    KW: KW, KA_ACETIC: KA_ACETIC, R: R, SHELF: SHELF, INDICATORS: INDICATORS, A: A, B: B, C: C, D: D,
    hStrong: hStrong, phStrong: phStrong, phAcid: phAcid, phTitration: phTitration, pKa: pKa,
    indicator: indicator, cabbageName: cabbageName, Box: Box, mulberry: mulberry
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ChemModel = api;
})(typeof window !== 'undefined' ? window : this);
