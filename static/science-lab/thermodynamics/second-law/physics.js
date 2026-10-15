/* Entropy and the Second Law (/science-lab/thermodynamics/second-law/): the models, kept apart from the drawing so they
   can be tested in Node. window.Th3Phys (or module.exports):
   Gas        atoms with a smooth repulsive force, moved by a leapfrog (velocity Verlet) step on a whole-number grid,
              so one step can be undone exactly, bit for bit (the trick of Levesque and Verlet, 1993)
   Coins      counting: W(n) = N!/(n!(N−n)!) and random arrangements
   Einstein   two Einstein solids sharing energy quanta at random (Moore and Schroeder, Am. J. Phys. 65, 26 (1997))
   Demon      Maxwell's demon: a box with a tiny door, temperatures, and the information ledger
   rng, lnFact, lnC   helpers */
(function (root) {
  'use strict';

  /* ---------- helpers ---------- */
  function rng(seed) { // mulberry32: small, fast, repeatable
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var LF = [0];
  function lnFact(n) { // ln n!, exact sums of logs (kept in a table)
    n = Math.round(n); if (n < 0) return NaN;
    for (var k = LF.length; k <= n; k++) LF[k] = LF[k - 1] + Math.log(k);
    return LF[n];
  }
  function lnC(n, k) { return k < 0 || k > n ? -Infinity : lnFact(n) - lnFact(k) - lnFact(n - k); }

  /* ---------- 1. the gas that spreads (and can be run backward) ----------
     Units: lengths are whole numbers on a grid with H = 10⁹ steps from the bottom of the box to the top (so one grid step
     is a billionth of the height), time is counted in steps, every atom has mass 1. The state is (x_n, v_{n−½}).
     One step: v_{n+½} = v_{n−½} + A(x_n), x_{n+1} = x_n + v_{n+½}, where A is the force rounded to whole numbers.
     Because A depends only on the positions and everything is a whole number, the step can be undone exactly. */
  var GH = 1e9, GW = 2e9;
  function Gas(N, seed, opt) {
    opt = opt || {};
    this.N = N; this.H = GH; this.W = GW;
    this.d = opt.d || 0.04 * GH;            // the distance at which two atoms start to push on each other
    this.R = this.d / 2;                   // the same for an atom and a wall
    this.v0 = opt.v0 || this.d / 25;        // root-mean-square speed, grid steps per time step
    this.eps = 15 * this.v0 * this.v0;      // height of the pair potential U = ε (1 − r²/d²)³
    this.epsW = 40 * this.v0 * this.v0;     // wall potential U = ε_w (1 − s/R)⁴
    this.kp = 6 * this.eps / (this.d * this.d);
    this.kw = 4 * this.epsW / this.R;
    this.x = new Float64Array(N); this.y = new Float64Array(N); this.vx = new Float64Array(N); this.vy = new Float64Array(N);
    this.ax = new Float64Array(N); this.ay = new Float64Array(N);
    this.tag = new Float64Array(N);         // where each atom started (0 bottom … 1 top), for its color
    this.divider = true; this.t = 0; this.dir = 1;
    this.ncx = Math.max(1, Math.floor(GW / this.d)); this.ncy = Math.max(1, Math.floor(GH / this.d));
    this.head = new Int32Array(this.ncx * this.ncy); this.next = new Int32Array(N);
    this.place(seed || 1);
  }
  Gas.prototype.place = function (seed) {
    var r = rng(seed), N = this.N, d = this.d, i, j, k, tries;
    var xmax = GW / 2 - this.R * 1.2, xmin = this.R * 1.2, ymin = this.R * 1.2, ymax = GH - this.R * 1.2;
    for (i = 0; i < N; i++) {
      for (tries = 0; tries < 2000; tries++) {
        var px = xmin + (xmax - xmin) * r(), py = ymin + (ymax - ymin) * r(), ok = true;
        for (j = 0; j < i; j++) { var dx = px - this.x[j], dy = py - this.y[j]; if (dx * dx + dy * dy < d * d * 1.05) { ok = false; break; } }
        if (ok) break;
      }
      this.x[i] = Math.round(px); this.y[i] = Math.round(py);
    }
    var s = this.v0 / Math.SQRT2, mx = 0, my = 0;
    for (i = 0; i < N; i++) { this.vx[i] = gauss(r) * s; this.vy[i] = gauss(r) * s; mx += this.vx[i]; my += this.vy[i]; }
    for (i = 0; i < N; i++) { this.vx[i] = Math.round(this.vx[i] - mx / N); this.vy[i] = Math.round(this.vy[i] - my / N); }
    this.divider = true; this.t = 0; this.dir = 1;
    for (k = 0; k < 400; k++) this.step();  // settle in the left half behind the divider
    for (i = 0; i < N; i++) this.tag[i] = this.y[i] / GH;
    this.t = 0;
  };
  /* forces, rounded to whole numbers; pair forces are rounded once and applied equal and opposite, so momentum is kept exactly */
  Gas.prototype.accel = function () {
    var N = this.N, x = this.x, y = this.y, ax = this.ax, ay = this.ay, R = this.R, kw = this.kw, i, s, w;
    var wallR = this.divider ? GW / 2 : GW;
    for (i = 0; i < N; i++) {
      var fx = 0, fy = 0;
      s = x[i]; if (s < R) { w = 1 - s / R; fx += kw * w * w * w; }
      s = wallR - x[i]; if (s < R) { w = 1 - s / R; fx -= kw * w * w * w; }
      s = y[i]; if (s < R) { w = 1 - s / R; fy += kw * w * w * w; }
      s = GH - y[i]; if (s < R) { w = 1 - s / R; fy -= kw * w * w * w; }
      ax[i] = Math.round(fx); ay[i] = Math.round(fy);
    }
    // cell list (cells at least d wide), built from the positions only, so it is the same going forward or back
    var ncx = this.ncx, ncy = this.ncy, head = this.head, next = this.next, cw = GW / ncx, ch = GH / ncy;
    head.fill(-1);
    for (i = 0; i < N; i++) {
      var cx = Math.floor(x[i] / cw), cy = Math.floor(y[i] / ch);
      cx = cx < 0 ? 0 : cx >= ncx ? ncx - 1 : cx; cy = cy < 0 ? 0 : cy >= ncy ? ncy - 1 : cy;
      var c = cy * ncx + cx; next[i] = head[c]; head[c] = i;
    }
    var d2 = this.d * this.d, kp = this.kp;
    for (var c0y = 0; c0y < ncy; c0y++) for (var c0x = 0; c0x < ncx; c0x++) {
      var c0 = c0y * ncx + c0x;
      for (i = head[c0]; i >= 0; i = next[i]) {
        for (var nb = 0; nb < 5; nb++) {
          var ox = nb === 0 ? 0 : nb === 1 ? 1 : nb - 3, oy = nb < 2 ? 0 : 1; // self, right, and the three cells above
          var c1x = c0x + ox, c1y = c0y + oy;
          if (c1x < 0 || c1x >= ncx || c1y >= ncy) continue;
          var j = nb === 0 ? next[i] : head[c1y * ncx + c1x];
          for (; j >= 0; j = next[j]) {
            var dx = x[i] - x[j], dy = y[i] - y[j], r2 = dx * dx + dy * dy;
            if (r2 < d2) {
              var u = 1 - r2 / d2, g = kp * u * u, gx = Math.round(g * dx), gy = Math.round(g * dy);
              ax[i] += gx; ay[i] += gy; ax[j] -= gx; ay[j] -= gy;
            }
          }
        }
      }
    }
  };
  Gas.prototype.step = function () {
    this.accel();
    var N = this.N, x = this.x, y = this.y, vx = this.vx, vy = this.vy, ax = this.ax, ay = this.ay;
    for (var i = 0; i < N; i++) { vx[i] += ax[i]; vy[i] += ay[i]; x[i] += vx[i]; y[i] += vy[i]; }
    this.t += this.dir;
  };
  /* flip every velocity: (x_m, v_{m−½}) → (x_m, −v_{m+½}); the next steps retrace the path exactly */
  Gas.prototype.reverse = function () {
    this.accel();
    for (var i = 0; i < this.N; i++) { this.vx[i] = -(this.vx[i] + this.ax[i]); this.vy[i] = -(this.vy[i] + this.ay[i]); }
    this.dir = -this.dir;
  };
  Gas.prototype.clone = function () {
    var g = Object.create(Gas.prototype), k;
    for (k in this) if (Object.prototype.hasOwnProperty.call(this, k)) g[k] = this[k] && this[k].slice ? this[k].slice() : this[k];
    return g;
  };
  Gas.prototype.left = function () { var n = 0; for (var i = 0; i < this.N; i++) if (this.x[i] < GW / 2) n++; return n; };
  /* energy at a whole step (velocity = mean of the two half steps), in units of the mean kinetic energy at the start */
  Gas.prototype.energy = function () {
    this.accel();
    var K = 0, U = 0, N = this.N, i, j, d2 = this.d * this.d, R = this.R;
    for (i = 0; i < N; i++) { var ux = this.vx[i] + this.ax[i] / 2, uy = this.vy[i] + this.ay[i] / 2; K += 0.5 * (ux * ux + uy * uy); }
    var wallR = this.divider ? GW / 2 : GW;
    for (i = 0; i < N; i++) {
      var ss = [this.x[i], wallR - this.x[i], this.y[i], GH - this.y[i]];
      for (var q = 0; q < 4; q++) if (ss[q] < R) { var w = 1 - ss[q] / R; U += this.epsW * w * w * w * w; }
      for (j = i + 1; j < N; j++) { var dx = this.x[i] - this.x[j], dy = this.y[i] - this.y[j], r2 = dx * dx + dy * dy; if (r2 < d2) { var u = 1 - r2 / d2; U += this.eps * u * u * u; } }
    }
    return { K: K, U: U, E: K + U };
  };
  Gas.prototype.momentum = function () { var px = 0, py = 0; for (var i = 0; i < this.N; i++) { px += this.vx[i]; py += this.vy[i]; } return [px, py]; };
  /* coarse-grained entropy: S/k = ln W, W = number of ways to choose which n of the N atoms are on the left */
  function entropyLR(N, nLeft) { return lnC(N, nLeft); }

  /* ---------- 2. counting coins (or atoms) ---------- */
  var Coins = {
    lnW: lnC,
    prob: function (N, n) { return Math.exp(lnC(N, n) - N * Math.LN2); },   // chance of exactly n on the left
    allOneSide: function (N) { return Math.pow(2, -N); },
    toss: function (N, r) { var n = 0; for (var i = 0; i < N; i++) if (r() < 0.5) n++; return n; }
  };

  /* ---------- 3. two Einstein solids sharing quanta ----------
     Each oscillator holds a whole number of energy quanta. One move: pick an oscillator at random; if it has a quantum,
     give one to another oscillator picked at random (either solid). Every move and its reverse are equally likely, so in the
     long run every arrangement of the quanta is equally likely, and q_A is found with probability Ω_A Ω_B / Ω_total. */
  function lnOmega(N, q) { return N <= 0 ? (q === 0 ? 0 : -Infinity) : lnC(q + N - 1, q); }
  function Einstein(NA, NB, q, qA0, seed) {
    this.NA = NA; this.NB = NB; this.q = q; this.r = rng(seed || 7);
    this.n = new Int32Array(NA + NB); this.moves = 0;
    this.set(qA0 === undefined ? q : qA0);
    var best = 0, bestL = -Infinity, ls = [];
    for (var a = 0; a <= q; a++) { var l = lnOmega(NA, a) + lnOmega(NB, q - a); ls.push(l); if (l > bestL) { bestL = l; best = a; } }
    this.lnTot = ls; this.best = best; this.lnMax = bestL;
    var m = 0; for (a = 0; a <= q; a++) m = Math.max(m, ls[a]);
    var s = 0; for (a = 0; a <= q; a++) s += Math.exp(ls[a] - m);
    this.lnAll = m + Math.log(s);            // ln of the total number of arrangements, all splits together
  }
  Einstein.prototype.set = function (qA) {
    var n = this.n, NA = this.NA, NB = this.NB, r = this.r, k;
    n.fill(0);
    for (k = 0; k < qA; k++) n[Math.floor(r() * NA)]++;
    for (k = 0; k < this.q - qA; k++) n[NA + Math.floor(r() * NB)]++;
    this.qA = qA;
  };
  Einstein.prototype.step = function (m) {
    var n = this.n, M = n.length, NA = this.NA, r = this.r, qA = this.qA;
    for (var k = 0; k < m; k++) {
      var i = Math.floor(r() * M); if (n[i] === 0) continue;
      var j = Math.floor(r() * M);
      n[i]--; n[j]++;
      if (i < NA && j >= NA) qA--; else if (i >= NA && j < NA) qA++;
    }
    this.qA = qA; this.moves += m;
  };
  Einstein.prototype.prob = function (qA) { return Math.exp(this.lnTot[qA] - this.lnAll); };

  /* ---------- 4. Maxwell's demon ----------
     Molecules fly in a box (no collisions with each other), split by a wall with a small door in the middle. Units:
     box 2 × 1, mass 1. Each side's temperature comes from its mean kinetic energy (2-D: K = N k T), scaled so the start
     is 300 K. Every molecule that reaches the door goes into the demon's notebook: 1 bit. Gas entropy if each side
     settled down (2-D ideal gas): S/k = Σ N_s ln(A_s T_s / N_s) + constant. */
  function Demon(M, seed) {
    this.M = M; this.r = rng(seed || 11);
    this.x = new Float64Array(M); this.y = new Float64Array(M); this.vx = new Float64Array(M); this.vy = new Float64Array(M);
    this.gap = 0.16;   // door height (box height 1)
    this.open = false; this.bits = 0; this.passed = 0; this.erased = 0; this.heatOut = 0; this.flash = -1;
    var r = this.r, i, K = [0, 0], n = [0, 0];
    for (i = 0; i < M; i++) {   // half the molecules on each side
      var sd = i % 2; this.x[i] = sd + 0.04 + 0.92 * r(); this.y[i] = 0.04 + 0.92 * r();
      this.vx[i] = gauss(r); this.vy[i] = gauss(r); K[sd] += 0.5 * (this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i]); n[sd]++;
    }
    for (i = 0; i < M; i++) { var f = Math.sqrt(n[i % 2] / K[i % 2]); this.vx[i] *= f; this.vy[i] *= f; } // both sides start at exactly the same temperature
    this.kT0 = 1;           // 2-D: mean kinetic energy = kT
    this.S0 = this.entropy();
  }
  Demon.prototype.sides = function () {
    var o = { nL: 0, nR: 0, KL: 0, KR: 0 };
    for (var i = 0; i < this.M; i++) {
      var k = 0.5 * (this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i]);
      if (this.x[i] < 1) { o.nL++; o.KL += k; } else { o.nR++; o.KR += k; }
    }
    o.TL = o.nL ? 300 * (o.KL / o.nL) / this.kT0 : NaN; o.TR = o.nR ? 300 * (o.KR / o.nR) / this.kT0 : NaN;
    return o;
  };
  Demon.prototype.entropy = function () {
    var s = this.sides(), S = 0;
    if (s.nL) S += s.nL * Math.log((s.KL / s.nL) / s.nL);
    if (s.nR) S += s.nR * Math.log((s.KR / s.nR) / s.nR);
    return S;   // the areas are equal, so they drop out of the change
  };
  /* move for time dt (in box units with unit-variance velocity components); robot = 'auto' lets the demon open the door itself */
  Demon.prototype.step = function (dt, robot) {
    var M = this.M, x = this.x, y = this.y, vx = this.vx, vy = this.vy, g0 = 0.5 - this.gap / 2, g1 = 0.5 + this.gap / 2;
    var vth = Math.sqrt(2 * this.kT0) * 1.0;  // the robot's speed cut: faster than typical goes right, slower goes left
    for (var i = 0; i < M; i++) {
      var ox = x[i], nx = ox + vx[i] * dt, ny = y[i] + vy[i] * dt;
      if (ny < 0) { ny = -ny; vy[i] = -vy[i]; } else if (ny > 1) { ny = 2 - ny; vy[i] = -vy[i]; }
      if (nx < 0) { nx = -nx; vx[i] = -vx[i]; } else if (nx > 2) { nx = 4 - nx; vx[i] = -vx[i]; }
      if ((ox < 1) !== (nx < 1)) {   // reaching the middle wall
        var f = (1 - ox) / (nx - ox), yc = y[i] + (ny - y[i]) * f;
        var atDoor = yc > g0 && yc < g1;
        var through = false;
        if (atDoor) {
          this.bits++;
          if (robot) { var sp = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]); through = (vx[i] > 0) === (sp > vth); }
          else through = this.open;
        }
        if (through) { this.passed++; this.flash = i; }
        else { nx = 2 - nx; vx[i] = -vx[i]; }
      }
      x[i] = nx; y[i] = ny;
    }
  };
  /* the ledger, in units of Boltzmann's constant k */
  Demon.prototype.ledger = function (Troom) {
    var dS = this.entropy() - this.S0, memo = this.bits * Math.LN2, paid = this.erased * Math.LN2;
    return { dSgas: dS, memory: memo, paid: paid, total: dS + memo + paid, bits: this.bits, erased: this.erased,
      joules: this.erased * 1.380649e-23 * (Troom || 300) * Math.LN2 };
  };
  Demon.prototype.erase = function () { this.erased += this.bits; this.bits = 0; };

  var API = { rng: rng, gauss: gauss, lnFact: lnFact, lnC: lnC, Gas: Gas, GH: GH, GW: GW, entropyLR: entropyLR,
    Coins: Coins, Einstein: Einstein, lnOmega: lnOmega, Demon: Demon, kB: 1.380649e-23 };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Th3Phys = API;
})(this);
