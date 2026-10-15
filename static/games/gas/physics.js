/* Gas in a Box model: a 2-D gas of hard disks (helium and argon atoms, drawn to scale) in a box whose top wall is a piston.
   Units inside the model: lengths in nanometers (nm), times in picoseconds (ps), masses in atomic mass units (u), so speeds
   are in nm/ps (1 nm/ps = 1000 m/s), energies in u·nm²/ps² (= 1.66054 zJ) and a 2-D pressure, a force per length of wall,
   in u/ps² (= 1.66054 mN/m). Temperature in kelvin, with Boltzmann's constant k = 1.380649e-23 J/K (exact, SI 2019).
   Collisions are elastic. Each frame is cut into small sub-steps; inside a sub-step every pair that will touch is found
   with a cell grid and the exact moment of contact is solved for, so collisions happen at the true contact distance.
   Walls are mirrors, the moving piston bounces molecules in its own frame (so it does work on the gas), and "thermostat"
   walls send each molecule that hits them back with a fresh velocity drawn from the wall's temperature (diffuse walls).
   Works in the browser (window.GasModel) and in node (module.exports) for the tests. */
(function (root) {
  'use strict';
  var U_KG = 1.66053906660e-27;          // atomic mass constant, kg (CODATA 2018)
  var KB_SI = 1.380649e-23;              // Boltzmann constant, J/K (exact since 2019)
  var KB = KB_SI / U_KG * 1e-6;          // k in u·nm²/ps² per kelvin = 0.0083144626
  var ZJ = U_KG * 1e6 * 1e21;            // 1 u·nm²/ps² in zeptojoules = 1.66054
  var MNM = U_KG * 1e24 * 1e3;           // 1 u/ps² in millinewtons per meter = 1.66054
  // Masses: standard atomic weights. Radii: van der Waals radii (Bondi 1964), He 140 pm, Ar 188 pm.
  var SPECIES = [
    { id: 'he', name: 'helium', sym: 'He', m: 4.0026, r: 0.140 },
    { id: 'ar', name: 'argon', sym: 'Ar', m: 39.948, r: 0.188 }
  ];

  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // o: {W, Hmax, Hmin, cap, seed, radii:[rHe, rAr]}
  function create(o) {
    o = o || {};
    var W = o.W || 28, Hmax = o.Hmax || 21, CAP = o.cap || 640;
    var rad = o.radii || [SPECIES[0].r, SPECIES[1].r], mass = [SPECIES[0].m, SPECIES[1].m];
    var rand = rng(o.seed === undefined ? 12345 : o.seed), spare = null;
    function gauss() {
      if (spare !== null) { var s = spare; spare = null; return s; }
      var u = 0, v = 0; while (u <= 1e-300) u = rand(); v = rand();
      var m = Math.sqrt(-2 * Math.log(u)); spare = m * Math.sin(2 * Math.PI * v); return m * Math.cos(2 * Math.PI * v);
    }
    var g = {
      W: W, Hmax: Hmax, Hmin: o.Hmin || Hmax * 0.2, H: Hmax, n: 0, cap: CAP,
      x: new Float64Array(CAP), y: new Float64Array(CAP), vx: new Float64Array(CAP), vy: new Float64Array(CAP),
      kind: new Uint8Array(CAP), tag: new Int32Array(CAP), rad: rad, mass: mass,
      thermo: false, Twall: 300, divider: false, dHalf: 0.1,
      imp: 0, time: 0, work: 0, heat: 0, pairs: 0, hits: null, rand: rand, gauss: gauss, nextTag: 1, maxSub: 400
    };
    var x = g.x, y = g.y, vx = g.vx, vy = g.vy, kind = g.kind;
    var cs = 0.55, ncx = Math.ceil(W / cs), ncy = Math.ceil(Hmax / cs) + 1;
    var head = new Int32Array(ncx * ncy), next = new Int32Array(CAP), sideL = new Uint8Array(CAP);

    // Where a molecule of kind k may sit: [x0, x1] × [y0, y1] for its center.
    function region(k, side) {
      var r = rad[k], xd = W / 2;
      if (g.divider) return side === 0 ? [r, xd - g.dHalf - r, r, g.H - r] : [xd + g.dHalf + r, W - r, r, g.H - r];
      return [r, W - r, r, g.H - r];
    }
    // Add count molecules of kind k at temperature T (Maxwell–Boltzmann velocities). With the divider in, helium goes on
    // the left and argon on the right unless side (0 left, 1 right) is given.
    g.add = function (k, count, T, side) {
      var added = 0;
      for (var c = 0; c < count && g.n < CAP; c++) {
        var sd = side === undefined ? k : side, R = region(k, sd), r = rad[k], px = 0, py = 0;
        for (var tries = 0; tries < 60; tries++) {
          px = R[0] + (R[1] - R[0]) * rand(); py = R[2] + (R[3] - R[2]) * rand();
          var ok = true;
          for (var j = 0; j < g.n; j++) { var dx = x[j] - px, dy = y[j] - py, s = rad[kind[j]] + r + 0.02; if (dx * dx + dy * dy < s * s) { ok = false; break; } }
          if (ok) break;
        }
        var i = g.n++, sig = Math.sqrt(KB * T / mass[k]);
        x[i] = px; y[i] = py; kind[i] = k; vx[i] = sig * gauss(); vy[i] = sig * gauss(); g.tag[i] = g.nextTag++;
        added++;
      }
      return added;
    };
    // Remove count molecules of kind k (the most recently added first).
    g.remove = function (k, count) {
      for (var i = g.n - 1; i >= 0 && count > 0; i--) {
        if (kind[i] !== k) continue;
        var l = --g.n;
        x[i] = x[l]; y[i] = y[l]; vx[i] = vx[l]; vy[i] = vy[l]; kind[i] = kind[l]; g.tag[i] = g.tag[l];
        count--;
      }
    };
    g.clear = function () { g.n = 0; };
    g.count = function (k) { var c = 0; for (var i = 0; i < g.n; i++) if (kind[i] === k) c++; return c; };
    g.ke = function (k) { var e = 0; for (var i = 0; i < g.n; i++) if (k === undefined || kind[i] === k) e += 0.5 * mass[kind[i]] * (vx[i] * vx[i] + vy[i] * vy[i]); return e; };
    // 2-D: each molecule has two ways to move (x and y), so its average kinetic energy is kT, and T = KE / (N k).
    g.temperature = function (k) { var c = k === undefined ? g.n : g.count(k); return c ? g.ke(k) / (c * KB) : 0; };
    // Scale every speed by the same factor so the gas is at temperature T (heating or cooling "by hand").
    g.setTemperature = function (T) { var t0 = g.temperature(); if (!(t0 > 0)) return; var f = Math.sqrt(T / t0); for (var i = 0; i < g.n; i++) { vx[i] *= f; vy[i] *= f; } };
    // Give every molecule the same speed (the one with kinetic energy kT) in a random direction.
    g.sameSpeed = function (T) { for (var i = 0; i < g.n; i++) { var v = Math.sqrt(2 * KB * T / mass[kind[i]]), a = 2 * Math.PI * rand(); vx[i] = v * Math.cos(a); vy[i] = v * Math.sin(a); } };
    g.setDivider = function (on) {
      g.divider = !!on; if (!on) return;
      var xd = W / 2;   // molecules caught in the slot are nudged to the side their center is on
      for (var i = 0; i < g.n; i++) { var r = rad[kind[i]]; if (x[i] < xd) { if (x[i] > xd - g.dHalf - r) x[i] = xd - g.dHalf - r; } else if (x[i] < xd + g.dHalf + r) x[i] = xd + g.dHalf + r; }
    };
    g.area = function () { return W * g.H; };
    g.perimeter = function () { return 2 * W + 2 * g.H; };
    g.maxSpeed = function () { var m = 0; for (var i = 0; i < g.n; i++) { var s = vx[i] * vx[i] + vy[i] * vy[i]; if (s > m) m = s; } return Math.sqrt(m); };

    function hit(w, s, j) { if (g.hits && g.hits.length < 600) g.hits.push(w, s, j); }

    // A thermostat wall sends the molecule back with a velocity drawn from the wall's temperature: the speed away from
    // the wall from the flux-weighted distribution v·exp(−mv²/2kT), the speed along it from a Gaussian.
    function wallNormal(m) { var u = 0; while (u <= 1e-300) u = rand(); return Math.sqrt(-2 * KB * g.Twall / m * Math.log(u)); }
    function wallTangent(m) { return Math.sqrt(KB * g.Twall / m) * gauss(); }

    // Pair collisions during a sub-step of length h: for each nearby pair, solve |d + w t| = r1 + r2 for the first contact
    // time t in [0, h]. The velocities are swapped along the line of centers (elastic, equal and opposite impulses) and the
    // start positions are shifted so that, moving in a straight line for the whole sub-step, each molecule ends exactly
    // where it would after bouncing at time t.
    function pairs(h) {
      var n = g.n, i, j, c;
      head.fill(-1);
      for (i = 0; i < n; i++) {
        var cx = Math.floor(x[i] / cs), cy = Math.floor(y[i] / cs);
        if (cx < 0) cx = 0; else if (cx >= ncx) cx = ncx - 1; if (cy < 0) cy = 0; else if (cy >= ncy) cy = ncy - 1;
        c = cy * ncx + cx; next[i] = head[c]; head[c] = i;
        sideL[i] = x[i] < W / 2 ? 1 : 0;
      }
      for (var cyy = 0; cyy < ncy; cyy++) for (var cxx = 0; cxx < ncx; cxx++) {
        c = cyy * ncx + cxx;
        for (i = head[c]; i >= 0; i = next[i]) {
          for (j = next[i]; j >= 0; j = next[j]) test(i, j, h);
          if (cxx + 1 < ncx) for (j = head[c + 1]; j >= 0; j = next[j]) test(i, j, h);
          if (cyy + 1 < ncy) {
            var b = c + ncx;
            if (cxx > 0) for (j = head[b - 1]; j >= 0; j = next[j]) test(i, j, h);
            for (j = head[b]; j >= 0; j = next[j]) test(i, j, h);
            if (cxx + 1 < ncx) for (j = head[b + 1]; j >= 0; j = next[j]) test(i, j, h);
          }
        }
      }
    }
    function test(i, j, h) {
      if (g.divider && sideL[i] !== sideL[j]) return;
      var dx = x[j] - x[i], dy = y[j] - y[i], wx = vx[j] - vx[i], wy = vy[j] - vy[i];
      var b = dx * wx + dy * wy; if (b >= 0) return;               // moving apart
      var s = rad[kind[i]] + rad[kind[j]], c = dx * dx + dy * dy - s * s, t = 0;
      if (c > 0) {
        var a = wx * wx + wy * wy, disc = b * b - a * c; if (disc <= 0) return;
        t = c / (-b + Math.sqrt(disc));                               // = (−b − √disc)/a, written to avoid cancellation
        if (t > h) return;
      }
      // contact positions and the unit vector between the centers
      var px = dx + wx * t, py = dy + wy * t, d = Math.sqrt(px * px + py * py); if (d <= 0) return;
      var nx = px / d, ny = py / d, vn = wx * nx + wy * ny; if (vn >= 0) return;
      var mi = mass[kind[i]], mj = mass[kind[j]], J = 2 * mi * mj / (mi + mj) * vn;   // impulse on i along n (J < 0 pushes j away)
      var ax = J / mi * nx, ay = J / mi * ny, bx = J / mj * nx, by = J / mj * ny;
      vx[i] += ax; vy[i] += ay; vx[j] -= bx; vy[j] -= by;
      x[i] -= ax * t; y[i] -= ay * t; x[j] += bx * t; y[j] += by * t;
      g.pairs++;
    }

    // Walls after the molecules have moved for h. The piston goes from H0 to H1 = H0 + u h during the sub-step.
    function walls(h, H0, H1, u) {
      var n = g.n, L = 2 * W + H0 + H1, xd = W / 2, th = g.thermo;
      for (var i = 0; i < n; i++) {
        var k = kind[i], r = rad[k], m = mass[k], ox, oy, dp, ts;
        // divider (always a plain mirror)
        if (g.divider) {
          if (sideL[i]) { var lim = xd - g.dHalf - r; if (x[i] > lim) { if (vx[i] > 0) { x[i] = 2 * lim - x[i]; vx[i] = -vx[i]; } else x[i] = lim; } }
          else { var lim2 = xd + g.dHalf + r; if (x[i] < lim2) { if (vx[i] < 0) { x[i] = 2 * lim2 - x[i]; vx[i] = -vx[i]; } else x[i] = lim2; } }
        }
        // left wall (x = 0) and right wall (x = W)
        if (x[i] < r) {
          if (vx[i] < 0) {
            ox = vx[i]; oy = vy[i]; ts = (r - x[i]) / -ox; if (ts > h) ts = h;
            if (th) { vx[i] = wallNormal(m); vy[i] = wallTangent(m); y[i] += (vy[i] - oy) * ts; } else vx[i] = -ox;
            x[i] = r + vx[i] * ts; dp = m * (vx[i] - ox); g.imp += dp / L;
            if (th) g.heat += 0.5 * m * (vx[i] * vx[i] + vy[i] * vy[i] - ox * ox - oy * oy);
            hit(0, y[i], dp);
          } else x[i] = r;
        } else if (x[i] > W - r) {
          if (vx[i] > 0) {
            ox = vx[i]; oy = vy[i]; ts = (x[i] - (W - r)) / ox; if (ts > h) ts = h;
            if (th) { vx[i] = -wallNormal(m); vy[i] = wallTangent(m); y[i] += (vy[i] - oy) * ts; } else vx[i] = -ox;
            x[i] = W - r + vx[i] * ts; dp = m * (ox - vx[i]); g.imp += dp / L;
            if (th) g.heat += 0.5 * m * (vx[i] * vx[i] + vy[i] * vy[i] - ox * ox - oy * oy);
            hit(1, y[i], dp);
          } else x[i] = W - r;
        }
        // floor (y = 0)
        if (y[i] < r) {
          if (vy[i] < 0) {
            ox = vx[i]; oy = vy[i]; ts = (r - y[i]) / -oy; if (ts > h) ts = h;
            if (th) { vy[i] = wallNormal(m); vx[i] = wallTangent(m); x[i] += (vx[i] - ox) * ts; } else vy[i] = -oy;
            y[i] = r + vy[i] * ts; dp = m * (vy[i] - oy); g.imp += dp / L;
            if (th) g.heat += 0.5 * m * (vx[i] * vx[i] + vy[i] * vy[i] - ox * ox - oy * oy);
            hit(2, x[i], dp);
          } else y[i] = r;
        }
        // piston (y = H, moving at u): bounce in the piston's own frame, v' = 2u − v for a mirror
        var top = H1 - r;
        if (y[i] > top) {
          if (vy[i] > u) {
            ox = vx[i]; oy = vy[i];
            var tc = (H0 - r - (y[i] - oy * h)) / (oy - u); if (tc < 0) tc = 0; else if (tc > h) tc = h;
            if (th) { vy[i] = u - wallNormal(m); vx[i] = wallTangent(m); x[i] += (vx[i] - ox) * (h - tc); } else vy[i] = 2 * u - oy;
            y[i] = H0 - r + u * tc + vy[i] * (h - tc); if (y[i] > top) y[i] = top;
            dp = m * (vy[i] - oy);                 // momentum given to the gas (negative: downward)
            g.imp -= dp / L; g.work += dp * u;     // work done on the gas = force on the gas × piston velocity × time
            if (th) g.heat += 0.5 * m * (vx[i] * vx[i] + vy[i] * vy[i] - ox * ox - oy * oy) - dp * u;
            hit(3, x[i], -dp);
          } else y[i] = top;
        }
      }
    }

    // Advance by dt picoseconds while the piston moves at u nm/ps (the caller keeps H inside [Hmin, Hmax]).
    // Returns the number of sub-steps used. Sub-steps are short enough that no molecule moves more than 0.08 nm in one,
    // so every pair that can touch during a sub-step is in the same or a neighboring grid cell.
    g.step = function (dt, u) {
      u = u || 0;
      var vmax = Math.max(g.maxSpeed(), Math.abs(u)), nsub = Math.max(1, Math.ceil(vmax * dt / 0.08));
      if (nsub > g.maxSub) { nsub = g.maxSub; dt = nsub * 0.08 / vmax; }
      var h = dt / nsub;
      for (var s = 0; s < nsub; s++) {
        pairs(h);
        for (var i = 0; i < g.n; i++) { x[i] += vx[i] * h; y[i] += vy[i] * h; }
        var H0 = g.H, H1 = H0 + u * h;
        walls(h, H0, H1, u);
        g.H = H1;
      }
      g.time += dt;
      return nsub;
    };
    return g;
  }

  // Helpers used by the page and the tests.
  // 2-D Maxwell–Boltzmann speed distribution: f(v) = (m v / kT) exp(−m v² / 2kT); fraction with speed below v: 1 − exp(−m v²/2kT).
  function mb2d(v, m, T) { var a = m / (KB * T); return a * v * Math.exp(-0.5 * a * v * v); }
  function mb2dCdf(v, m, T) { return 1 - Math.exp(-0.5 * m * v * v / (KB * T)); }
  // Hard-disk equation of state (Henderson 1975): P A / N k T = (1 + η²/8) / (1 − η)², η = covered fraction of the area.
  function hardDiskZ(eta) { return (1 + eta * eta / 8) / ((1 - eta) * (1 - eta)); }

  var api = { create: create, SPECIES: SPECIES, KB: KB, KB_SI: KB_SI, U_KG: U_KG, ZJ: ZJ, MNM: MNM, mb2d: mb2d, mb2dCdf: mb2dCdf, hardDiskZ: hardDiskZ, rng: rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GasModel = api;
})(typeof window !== 'undefined' ? window : this);
