/* Temperature and the Zeroth Law: the models behind the page. Works in the browser (window.ThermoZeroth) and in node
   (module.exports) for the tests in /tmp/work_th.

   1. Contact: blocks of real materials in a row on an insulating bench. Each solid block is cut into thin slices and heat
      flows between neighboring slices by Fourier's law, q = k A ΔT / Δx; between two touching blocks it also crosses a
      thin contact layer. Water is stirred, so it has one temperature, and heat crosses a thin film at its wall. Each step
      is implicit (backward Euler on a tridiagonal system), so it is stable at any time warp, and every flux is taken from
      one cell and given to its neighbor, so the total energy is conserved to rounding. A thermometer (2 J/K) can be dipped
      into the middle of a block or left in the room air at 20 °C.
   2. Disks: a flat (2-D) gas of hard disks with the mass of nitrogen molecules. Disks move in straight lines and bounce
      elastically; walls are mirrors (insulated) or "thermal" walls that send each disk back with a fresh velocity drawn
      from the wall temperature. In 2-D the average kinetic energy per molecule is k T.
   3. Touch: what your skin feels touching a material. Two thick bodies brought into contact meet at
      T_c = (e1 T1 + e2 T2) / (e1 + e2), with e = √(k ρ c), the thermal effusivity.

   Material data: specific heats from OpenStax University Physics Vol. 2, Table 1.3 (granite: College Physics 2e, Table
   14.1); thermal conductivities from Table 1.5 (granite: a middle value of the 1.7–4.0 W/(m·K) range listed on Wikipedia);
   densities from OpenStax University Physics Vol. 1, Table 14.1 (wood: oak). */
(function (root) {
  'use strict';
  var KB = 1.380649e-23;                 // Boltzmann constant, J/K (exact since 2019)
  var U_KG = 1.66053906660e-27;          // atomic mass constant, kg (CODATA 2018)
  var M_N2 = 28.0134 * U_KG;             // one nitrogen molecule, kg

  var MATERIALS = {
    copper:   { name: 'Copper',   c: 387,  rho: 8920, k: 390 },
    aluminum: { name: 'Aluminum', c: 900,  rho: 2700, k: 220 },
    iron:     { name: 'Iron',     c: 452,  rho: 7860, k: 80 },
    granite:  { name: 'Granite',  c: 840,  rho: 2700, k: 2.8 },
    water:    { name: 'Water',    c: 4186, rho: 1000, k: 0.6, stirred: true },
    wood:     { name: 'Wood',     c: 1700, rho: 710,  k: 0.12 }
  };
  var ORDER = ['copper', 'aluminum', 'iron', 'granite', 'water', 'wood'];
  var H_CONTACT = 3000;    // W/(m²·K): the thin layer where two blocks touch (tiny air gaps between rough surfaces)
  var H_FILM = 500;        // W/(m²·K): the film of slower water along the wall of the stirred water's can
  var SLICES = 12;
  var PROBE_C = 2;         // J/K: the thermometer bulb, about 2 g of glass and liquid
  var PROBE_G = 0.4;       // W/K in a block (time constant 5 s)
  var PROBE_GAIR = 0.02;   // W/K in air (time constant 100 s)
  var ROOM = 20;           // °C

  // ---------------------------------------------------------------- 1. contact
  // blocks: [{mat, m, T}], T in °C
  function Contact(blocks) {
    this.touch = false; this.time = 0;
    this.probe = { T: ROOM, at: -1, E0: 0 };     // at: index of the block it is dipped in, or -1 for the air
    this.airE = 0;                               // energy given to the room air by the thermometer, J
    this.setBlocks(blocks || []);
  }
  Contact.prototype.setBlocks = function (blocks) {
    this.blocks = blocks.map(function (b) { return makeBlock(b.mat, b.m, b.T); });
    this.build(); this.resetLedger();
  };
  function makeBlock(mat, m, T) {
    var M = MATERIALS[mat], L = Math.cbrt(m / M.rho), n = M.stirred ? 1 : SLICES, b = { mat: mat, m: m, L: L, A: L * L, n: n, C: m * M.c, T0: T, cells: [] };
    for (var i = 0; i < n; i++) b.cells.push(T);
    return b;
  }
  Contact.prototype.setBlock = function (i, mat, m, T) {
    this.blocks[i] = makeBlock(mat, m, T); this.build(); this.resetLedger();
  };
  // flatten the cells, with the conductance from each cell to the next one in the row
  Contact.prototype.build = function () {
    var cells = [], C = [], G = [], owner = [], self = this;
    this.blocks.forEach(function (b, bi) {
      var M = MATERIALS[b.mat];
      b.start = cells.length;
      for (var s = 0; s < b.n; s++) {
        cells.push(b.cells[s]); C.push(b.C / b.n); owner.push(bi);
        G.push(s < b.n - 1 ? M.k * b.A * b.n / b.L : 0); // within the block
      }
    });
    this.T = new Float64Array(cells); this.C = new Float64Array(C); this.owner = owner;
    this.Gin = new Float64Array(G);
    // conductance across each boundary between block i and block i+1 when touching
    this.Gc = [];
    for (var i = 0; i + 1 < this.blocks.length; i++) this.Gc.push(contactG(this.blocks[i], this.blocks[i + 1]));
    this.applyTouch(this.touch);
    void self;
  };
  function halfR(b) { var M = MATERIALS[b.mat]; return M.stirred ? 1 / H_FILM : (b.L / (2 * b.n)) / M.k; }
  function contactG(a, b) { return Math.min(a.A, b.A) / (halfR(a) + halfR(b) + 1 / H_CONTACT); }
  Contact.prototype.applyTouch = function (on) {
    this.touch = !!on;
    var G = this.Gin;
    for (var i = 0; i + 1 < this.blocks.length; i++) {
      var last = this.blocks[i].start + this.blocks[i].n - 1;
      G[last] = this.touch ? this.Gc[i] : 0;
    }
  };
  Contact.prototype.resetLedger = function () {
    this.E0 = this.blocks.map(function (b) { return b.C * b.T0; });
    this.probe.E0 = PROBE_C * this.probe.T; this.airE = 0; this.time = 0;
  };
  Contact.prototype.blockT = function (i) {      // a block's average temperature
    var b = this.blocks[i], s = 0; for (var c = 0; c < b.n; c++) s += this.T[b.start + c]; return s / b.n;
  };
  Contact.prototype.blockE = function (i) { return this.blocks[i].C * this.blockT(i); };
  Contact.prototype.probeCell = function () { var b = this.blocks[this.probe.at]; return b ? b.start + (b.n >> 1) : -1; };
  // the change in energy of each block, the thermometer and the air since the start: they always add to zero
  Contact.prototype.ledger = function () {
    var self = this, rows = this.blocks.map(function (b, i) { return self.blockE(i) - self.E0[i]; });
    return { blocks: rows, probe: PROBE_C * this.probe.T - this.probe.E0, air: this.airE,
      total: rows.reduce(function (a, v) { return a + v; }, 0) + PROBE_C * this.probe.T - this.probe.E0 + this.airE };
  };
  Contact.prototype.totalE = function () { var s = 0; for (var i = 0; i < this.T.length; i++) s += this.C[i] * this.T[i]; return s + PROBE_C * this.probe.T + this.airE; };
  // the temperature everything in contact will end at: Σ m c T / Σ m c (blocks only)
  Contact.prototype.finalT = function () {
    var num = 0, den = 0; for (var i = 0; i < this.blocks.length; i++) { num += this.blockE(i); den += this.blocks[i].C; } return num / den;
  };
  Contact.prototype.predictFinal = function () {    // from the starting temperatures
    var num = 0, den = 0; this.blocks.forEach(function (b) { num += b.C * b.T0; den += b.C; }); return num / den;
  };
  // heat flowing across each boundary, W (positive: left to right)
  Contact.prototype.flows = function () {
    var out = [];
    for (var i = 0; i + 1 < this.blocks.length; i++) { var a = this.blocks[i].start + this.blocks[i].n - 1; out.push(this.Gin[a] * (this.T[a] - this.T[a + 1])); }
    return out;
  };
  // the biggest temperature gap left anywhere heat can flow (blocks in contact, and the thermometer in its block), °C
  Contact.prototype.spread = function () {
    var n = this.T.length, lo = Infinity, hi = -Infinity, i;
    if (this.touch) { for (i = 0; i < n; i++) { if (this.T[i] < lo) lo = this.T[i]; if (this.T[i] > hi) hi = this.T[i]; } }
    else for (var b = 0; b < this.blocks.length; b++) { var B = this.blocks[b], l = Infinity, h = -Infinity; for (i = 0; i < B.n; i++) { var t = this.T[B.start + i]; if (t < l) l = t; if (t > h) h = t; } if (h - l > hi - lo) { hi = h; lo = l; } }
    var s = hi > lo ? hi - lo : 0, pc = this.probeCell();
    if (pc >= 0) s = Math.max(s, Math.abs(this.probe.T - this.T[pc]));
    return s;
  };
  // the fastest any temperature is changing, °C per second
  Contact.prototype.maxRate = function () {
    var n = this.T.length, T = this.T, G = this.Gin, best = 0;
    for (var i = 0; i < n; i++) {
      var f = 0; if (i > 0) f += G[i - 1] * (T[i - 1] - T[i]); if (i < n - 1) f += G[i] * (T[i + 1] - T[i]);
      var r = Math.abs(f / this.C[i]); if (r > best) best = r;
    }
    var pc = this.probeCell(); if (pc >= 0) best = Math.max(best, Math.abs(PROBE_G * (T[pc] - this.probe.T) / PROBE_C));
    return best;
  };
  // advance by dt seconds, in substeps no longer than maxSub
  Contact.prototype.step = function (dt, maxSub) {
    if (!(dt > 0)) return;
    var nsub = Math.max(1, Math.min(80, Math.ceil(dt / (maxSub || 0.25)))), h = dt / nsub;
    for (var s = 0; s < nsub; s++) { this.probeStep(h); this.implicit(h); }
    this.time += dt;
    // keep each block's cells in its record so a rebuild keeps them
    for (var b = 0; b < this.blocks.length; b++) { var B = this.blocks[b]; for (var c = 0; c < B.n; c++) B.cells[c] = this.T[B.start + c]; }
  };
  // thermometer and the cell it sits in (or the air): an exact two-body exchange, so it conserves energy and never overshoots
  Contact.prototype.probeStep = function (h) {
    var p = this.probe, pc = this.probeCell();
    if (pc < 0) {                                   // in the room air, which is far bigger than the thermometer
      var Tn = ROOM + (p.T - ROOM) * Math.exp(-PROBE_GAIR * h / PROBE_C);
      this.airE += PROBE_C * (p.T - Tn); p.T = Tn; return;
    }
    var Ca = PROBE_C, Cb = this.C[pc], Tf = (Ca * p.T + Cb * this.T[pc]) / (Ca + Cb), f = Math.exp(-PROBE_G * h * (1 / Ca + 1 / Cb));
    p.T = Tf + (p.T - Tf) * f; this.T[pc] = Tf + (this.T[pc] - Tf) * f;
  };
  // backward Euler: C_i (T_i' − T_i)/h = G_{i−1}(T_{i−1}' − T_i') + G_i (T_{i+1}' − T_i'), solved by the Thomas algorithm
  Contact.prototype.implicit = function (h) {
    var n = this.T.length, T = this.T, G = this.Gin, C = this.C;
    var a = this._a || (this._a = []), bb = this._b || (this._b = []), c = this._c || (this._c = []), d = this._d || (this._d = []);
    for (var i = 0; i < n; i++) {
      var gl = i > 0 ? G[i - 1] : 0, gr = i < n - 1 ? G[i] : 0;
      a[i] = -gl * h; c[i] = -gr * h; bb[i] = C[i] + (gl + gr) * h; d[i] = C[i] * T[i];
    }
    for (i = 1; i < n; i++) { var w = a[i] / bb[i - 1]; bb[i] -= w * c[i - 1]; d[i] -= w * d[i - 1]; }
    T[n - 1] = d[n - 1] / bb[n - 1];
    for (i = n - 2; i >= 0; i--) T[i] = (d[i] - c[i] * T[i + 1]) / bb[i];
  };
  Contact.prototype.dipProbe = function (at) { this.probe.at = at; };

  // ---------------------------------------------------------------- 2. disks
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // o: {N, W, H, r, seed, vs (m/s per model unit per second), T0}
  function Disks(o) {
    o = o || {};
    this.N = o.N || 200; this.W = o.W || 160; this.H = o.H || 80; this.r = o.r || 1.1; this.vs = o.vs || 8;
    this.m = M_N2; this.rand = rng(o.seed || 7); this.walls = 'mirror'; this.Tw = 300; this.wallQ = 0; this.hits = 0; this.time = 0;
    this.x = new Float64Array(this.N); this.y = new Float64Array(this.N); this.vx = new Float64Array(this.N); this.vy = new Float64Array(this.N);
    this.cs = 2.4 * this.r; this.ncx = Math.ceil(this.W / this.cs); this.ncy = Math.ceil(this.H / this.cs);
    this.head = new Int32Array(this.ncx * this.ncy); this.next = new Int32Array(this.N); this.spare = null;
    this.place(); this.sameSpeed(o.T0 || 300);
  }
  Disks.prototype.gauss = function () {
    if (this.spare !== null) { var s = this.spare; this.spare = null; return s; }
    var u = 0; while (u <= 1e-300) u = this.rand(); var v = this.rand(), m = Math.sqrt(-2 * Math.log(u));
    this.spare = m * Math.sin(2 * Math.PI * v); return m * Math.cos(2 * Math.PI * v);
  };
  Disks.prototype.place = function () {   // on a jittered grid so nothing overlaps
    var cols = Math.ceil(Math.sqrt(this.N * this.W / this.H)), rows = Math.ceil(this.N / cols), dx = this.W / cols, dy = this.H / rows, j = 0.5 * Math.max(0, Math.min(dx, dy) - 2.2 * this.r);
    for (var i = 0; i < this.N; i++) {
      var cx = (i % cols + 0.5) * dx, cy = (Math.floor(i / cols) + 0.5) * dy;
      this.x[i] = cx + (this.rand() * 2 - 1) * j * 0.5; this.y[i] = cy + (this.rand() * 2 - 1) * j * 0.5;
    }
  };
  // every disk at the same speed, in a random direction, with total kinetic energy N k T (2-D)
  Disks.prototype.sameSpeed = function (T) {
    var v = Math.sqrt(2 * KB * T / this.m) / this.vs;
    for (var i = 0; i < this.N; i++) { var a = this.rand() * 2 * Math.PI; this.vx[i] = v * Math.cos(a); this.vy[i] = v * Math.sin(a); }
  };
  Disks.prototype.ke = function () { var s = 0; for (var i = 0; i < this.N; i++) s += this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i]; return 0.5 * this.m * s * this.vs * this.vs; }; // J
  Disks.prototype.temperature = function () { return this.ke() / (this.N * KB); }; // 2-D: <KE> = k T
  Disks.prototype.speed = function (i) { return Math.hypot(this.vx[i], this.vy[i]) * this.vs; }; // m/s
  // the 2-D Maxwell–Boltzmann distribution of speeds, per (m/s)
  function mb2(v, T, m) { var a = (m || M_N2) / (KB * T); return a * v * Math.exp(-0.5 * a * v * v); }
  Disks.prototype.wallKick = function (i, nx, ny) {  // a thermal wall: fresh velocity from the wall's temperature
    var s = Math.sqrt(KB * this.Tw / this.m) / this.vs, u = 0; while (u <= 1e-300) u = this.rand();
    var vn = s * Math.sqrt(-2 * Math.log(u)), vt = s * this.gauss(), before = this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i];
    this.vx[i] = nx * vn - ny * vt; this.vy[i] = ny * vn + nx * vt;
    this.wallQ += 0.5 * this.m * (this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i] - before) * this.vs * this.vs;
  };
  Disks.prototype.step = function (dt) {
    var vmax = 0, i; for (i = 0; i < this.N; i++) { var v2 = this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i]; if (v2 > vmax) vmax = v2; }
    vmax = Math.sqrt(vmax); var nsub = Math.max(1, Math.ceil(dt * vmax / (0.4 * this.r))), h = dt / nsub;
    for (var s = 0; s < nsub; s++) this.sub(h);
    this.time += dt;
  };
  Disks.prototype.sub = function (h) {
    var N = this.N, x = this.x, y = this.y, vx = this.vx, vy = this.vy, r = this.r, W = this.W, H = this.H, th = this.walls === 'thermal', i;
    for (i = 0; i < N; i++) {
      x[i] += vx[i] * h; y[i] += vy[i] * h;
      if (x[i] < r) { x[i] = 2 * r - x[i]; if (th) this.wallKick(i, 1, 0); else vx[i] = Math.abs(vx[i]); }
      else if (x[i] > W - r) { x[i] = 2 * (W - r) - x[i]; if (th) this.wallKick(i, -1, 0); else vx[i] = -Math.abs(vx[i]); }
      if (y[i] < r) { y[i] = 2 * r - y[i]; if (th) this.wallKick(i, 0, 1); else vy[i] = Math.abs(vy[i]); }
      else if (y[i] > H - r) { y[i] = 2 * (H - r) - y[i]; if (th) this.wallKick(i, 0, -1); else vy[i] = -Math.abs(vy[i]); }
    }
    // collisions through a cell grid
    var head = this.head, next = this.next, cs = this.cs, ncx = this.ncx, ncy = this.ncy, d2 = 4 * r * r;
    head.fill(-1);
    for (i = 0; i < N; i++) { var cx = Math.min(ncx - 1, Math.max(0, Math.floor(x[i] / cs))), cy = Math.min(ncy - 1, Math.max(0, Math.floor(y[i] / cs))), c = cy * ncx + cx; next[i] = head[c]; head[c] = i; }
    for (var gy = 0; gy < ncy; gy++) for (var gx = 0; gx < ncx; gx++) {
      for (i = head[gy * ncx + gx]; i >= 0; i = next[i]) {
        for (var oy = 0; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
          if (oy === 0 && ox < 0) continue;
          var X = gx + ox, Y = gy + oy; if (X < 0 || X >= ncx || Y >= ncy) continue;
          for (var j = (oy === 0 && ox === 0) ? next[i] : head[Y * ncx + X]; j >= 0; j = next[j]) {
            var dx = x[j] - x[i], dy = y[j] - y[i], dd = dx * dx + dy * dy;
            if (dd >= d2 || dd === 0) continue;
            var dvx = vx[j] - vx[i], dvy = vy[j] - vy[i], dot = dx * dvx + dy * dvy;
            if (dot >= 0) continue;                       // already moving apart
            var k = dot / dd;                             // equal masses: swap the velocity parts along the line of centers
            vx[i] += k * dx; vy[i] += k * dy; vx[j] -= k * dx; vy[j] -= k * dy; this.hits++;
          }
        }
      }
    }
  };

  // ---------------------------------------------------------------- 3. touch
  function effusivity(mat) { var M = MATERIALS[mat] || mat; return Math.sqrt(M.k * M.rho * M.c); }
  // the skin, as the "human body" of the tables: c = 3500 J/(kg·K) (College Physics 2e), k = 0.2 W/(m·K) (fatty tissue,
  // University Physics Vol. 2), ρ = 1050 kg/m³ (blood, University Physics Vol. 1)
  var SKIN = { name: 'Skin', c: 3500, rho: 1050, k: 0.2 };
  function contactTemp(T1, e1, T2, e2) { return (e1 * T1 + e2 * T2) / (e1 + e2); }
  // heat flux out of the first body, W/m², t seconds after touching
  function contactFlux(T1, e1, T2, e2, t) { return e1 * e2 / (e1 + e2) * (T1 - T2) / Math.sqrt(Math.PI * t); }

  var api = { KB: KB, M_N2: M_N2, MATERIALS: MATERIALS, ORDER: ORDER, SLICES: SLICES, PROBE_C: PROBE_C, ROOM: ROOM, H_CONTACT: H_CONTACT, H_FILM: H_FILM,
    Contact: Contact, Disks: Disks, mb2: mb2, effusivity: effusivity, SKIN: SKIN, contactTemp: contactTemp, contactFlux: contactFlux };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ThermoZeroth = api;
})(this);
