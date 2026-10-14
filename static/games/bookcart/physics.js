/* Book Cart physics: a chain of n books (rigid slabs) joined end to end by springy bindings, standing on a cart that rolls
   on a straight track. Equations of motion from Lagrange's equations in generalized coordinates q = (x, θ1 … θn),
   where x is the cart position and θi is book i's angle from straight up (absolute, clockwise positive).
   M(q) q̈ = b(q, q̇) + F e_x, solved each step by Cholesky; integrated with an implicit Newmark (trapezoidal) step, or RK4.
   The books face you with their covers, so each one swings in the plane of its cover. The bottom book turns on a free pivot
   on the cart, and can carry a counterweight on an arm reaching past the pivot the other way (rc metres, mc kilograms).
   SI units throughout: metres, kilograms, seconds, newtons, joules. */
(function (root) {
  'use strict';
  var G_EARTH = 9.80665;

  // A seeded random generator so the same level always gets the same books.
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // Real-world book sizes: 20–28 cm tall, 14–17 cm wide, 2.5–5 cm thick, paper and board at about 650–800 kg/m³.
  function makeBooks(n, seed) {
    var r = rng(seed || 7), out = [];
    for (var i = 0; i < n; i++) {
      var l = 0.20 + 0.08 * r(), t = 0.025 + 0.025 * r(), w = 0.14 + 0.03 * r(), rho = 650 + 150 * r();
      out.push({ l: l, t: t, w: w, m: rho * l * t * w, hue: i });
    }
    return out;
  }

  // Build a system. o: {books, M (cart kg), g, sBase, sBind, zeta, fric (rolling coefficient), aMax, xEnd, mc, rc}
  function System(o) {
    var b = o.books, n = b.length, s = this;
    s.n = n; s.books = b; s.M = o.M || 15; s.g = o.g === undefined ? G_EARTH : o.g; s.fric = o.fric === undefined ? 0.012 : o.fric;
    s.l = new Float64Array(n + 1); s.m = new Float64Array(n + 1); s.I = new Float64Array(n + 1);
    s.mu = new Float64Array(n + 2); s.D = new Float64Array(n + 1); s.S = new Float64Array(n + 2);
    s.k = new Float64Array(n + 2); s.c = new Float64Array(n + 2);
    for (var i = 1; i <= n; i++) { var bk = b[i - 1]; s.l[i] = bk.l; s.m[i] = bk.m; s.I[i] = bk.m * (bk.l * bk.l + bk.w * bk.w) / 12; /* a slab l tall and w wide, turning about its centre */ }
    // S[i] = mass of all books above book i
    s.S[n] = 0; for (i = n - 1; i >= 1; i--) s.S[i] = s.S[i + 1] + s.m[i + 1];
    s.mBooks = 0; for (i = 1; i <= n; i++) s.mBooks += s.m[i];
    for (i = 1; i <= n; i++) { s.mu[i] = s.l[i] * (s.m[i] / 2 + s.S[i]); s.D[i] = s.l[i] * s.l[i] * (s.m[i] / 4 + s.S[i]) + s.I[i]; }
    s.height = 0; for (i = 1; i <= n; i++) s.height += s.l[i];
    s.mu1 = s.mu[1]; s.D1 = s.D[1]; s.aMax = o.aMax || 14;
    s.setCounterweight(o.mc || 0, o.rc || 0);
    s.xEnd = o.xEnd || Math.max(2.2, 0.55 * s.height + 1.2);
    s.kBump = 3000 * s.mTot; s.cBump = 2 * Math.sqrt(s.kBump * s.mTot) * 0.6;
    s.setStiffness(o.sBase || 0, o.sBind === undefined ? 1.6 : o.sBind, o.zeta === undefined ? 0.06 : o.zeta);
    s.N = n + 1; s.A = new Float64Array(s.N * s.N); s.Lc = new Float64Array(s.N * s.N);
    s.bv = new Float64Array(s.N); s.z = new Float64Array(s.N); s.e = new Float64Array(s.N); s.tmp = new Float64Array(s.N);
    s.cs = new Float64Array(n + 1); s.sn = new Float64Array(n + 1);
  }
  // A counterweight mc (kg) at distance rc (m) from the pivot, fixed to the bottom book and pointing the opposite way. It enters the
  // equations exactly as if book 1 were less top-heavy (μ1 − mc·rc) and harder to turn (D1 + mc·rc²), and it adds to the moving mass.
  System.prototype.setCounterweight = function (mc, rc) {
    var s = this; s.mc = mc; s.rc = rc;
    s.mu[1] = s.mu1 - mc * rc; s.D[1] = s.D1 + mc * rc * rc;
    s.mTot = s.M + s.mBooks + mc; s.Fmax = s.mTot * s.aMax;
    if (s.kBump) { s.kBump = 3000 * s.mTot; s.cBump = 2 * Math.sqrt(s.kBump * s.mTot) * 0.6; }
  };
  // The net "top-heaviness" about the pivot (kg·m) of the straight stack: books' mass × height of their centre, minus the counterweight's.
  System.prototype.netMoment = function () { return this.mBooks * this.comHeight() - this.mc * this.rc; };
  System.prototype.comHeight = function () { var d = 0, mh = 0; for (var j = 1; j <= this.n; j++) { mh += this.m[j] * (d + this.l[j] / 2); d += this.l[j]; } return mh / this.mBooks; };
  // Gravity's "tipping stiffness" at joint j: weight above × lever arm, for a straight stack (N·m per radian).
  // (Measured with Earth's gravity, so a stiffness setting means the same spring on the Moon.)
  System.prototype.gravStiff = function (j) {
    var tot = 0, d = 0;
    for (var i = j; i <= this.n; i++) { tot += this.m[i] * (d + this.l[i] / 2); d += this.l[i]; }
    return G_EARTH * tot;
  };
  // Joint 1 is the spring clamp holding the bottom book in the cart; joints 2…n are the bindings between books.
  // Each stiffness is a multiple of the gravity tipping stiffness at that joint. Damping gives a modal damping ratio ≈ zeta.
  System.prototype.setStiffness = function (sBase, sBind, zeta) {
    var s = this; s.sBase = sBase; s.sBind = sBind; s.zeta = zeta;
    for (var j = 1; j <= s.n; j++) {
      var kg = s.gravStiff(j), k = (j === 1 ? sBase : sBind) * kg;
      // damping sized on the next book alone, so the quick local wobbles are damped at about zeta (and the integrator stays stable)
      var Jl = s.m[j] * s.l[j] * s.l[j] / 4 + s.I[j];
      s.k[j] = k; s.c[j] = 2 * zeta * Math.sqrt(Math.max(k, 0.25 * kg) * Jl);
    }
    s.k[s.n + 1] = 0; s.c[s.n + 1] = 0;
  };

  // Mass matrix A (row-major, N×N) and the right-hand side without the motor force.
  System.prototype.build = function (st) {
    var s = this, n = s.n, N = s.N, A = s.A, b = s.bv, cs = s.cs, sn = s.sn, j, k;
    var x = st[0], v = st[N];
    for (j = 1; j <= n; j++) { cs[j] = Math.cos(st[j]); sn[j] = Math.sin(st[j]); }
    A[0] = s.mTot; b[0] = 0;
    for (j = 1; j <= n; j++) {
      var w = st[N + j];
      A[j] = A[j * N] = s.mu[j] * cs[j];
      A[j * N + j] = s.D[j];
      b[0] += s.mu[j] * sn[j] * w * w;
      for (k = j + 1; k <= n; k++) { A[j * N + k] = A[k * N + j] = s.l[j] * s.mu[k] * (cs[j] * cs[k] + sn[j] * sn[k]); }
    }
    // rolling resistance (smoothed sign) and the bumpers at the ends of the track
    var Nn = s.mTot * s.g, fr = -s.fric * Nn * Math.tanh(v / 0.03), fb = 0, over = Math.abs(x) - s.xEnd;
    if (over > 0) { var sg = x > 0 ? 1 : -1; fb = -sg * s.kBump * over - (sg * v > 0 ? s.cBump * v : 0); }
    b[0] += fr + fb; s._fr = fr; s._fb = fb;

    for (j = 1; j <= n; j++) {
      var acc = s.g * s.mu[j] * sn[j];
      for (k = 1; k <= n; k++) if (k !== j) {
        var Ljk = j < k ? s.l[j] * s.mu[k] : s.l[k] * s.mu[j], wk = st[N + k];
        acc -= Ljk * (sn[j] * cs[k] - cs[j] * sn[k]) * wk * wk;
      }
      // spring-damper torques: tau_j acts between book j-1 (or the cart) and book j
      if (s.noSpring) { b[j] = acc; continue; }
      var tj = -s.k[j] * (st[j] - (j > 1 ? st[j - 1] : 0)) - s.c[j] * (st[N + j] - (j > 1 ? st[N + j - 1] : 0));
      var tj1 = j < n ? -s.k[j + 1] * (st[j + 1] - st[j]) - s.c[j + 1] * (st[N + j + 1] - st[N + j]) : 0;
      b[j] = acc + tj - tj1;
    }
    // wind: the same sideways drag force on every book (N), from F = ½ ρ C_d A v²; set by s.wind
    var fw = s.wind || 0;
    if (fw) { b[0] += n * fw; var above = 0; for (j = n; j >= 1; j--) { b[j] += fw * cs[j] * s.l[j] * (above + 0.5); above += 1; } }
  };
  // Cholesky factorisation A = L Lᵀ (A is symmetric positive definite) and a solve.
  System.prototype.chol = function () {
    var N = this.N, A = this.A, L = this.Lc, i, j, k, sum;
    for (i = 0; i < N; i++) for (j = 0; j <= i; j++) {
      sum = A[i * N + j]; for (k = 0; k < j; k++) sum -= L[i * N + k] * L[j * N + k];
      L[i * N + j] = i === j ? Math.sqrt(sum) : sum / L[j * N + j];
    }
  };
  System.prototype.solve = function (rhs, out) {
    var N = this.N, L = this.Lc, y = this.tmp, i, k, sum;
    for (i = 0; i < N; i++) { sum = rhs[i]; for (k = 0; k < i; k++) sum -= L[i * N + k] * y[k]; y[i] = sum / L[i * N + i]; }
    for (i = N - 1; i >= 0; i--) { sum = y[i]; for (k = i + 1; k < N; k++) sum -= L[k * N + i] * out[k]; out[i] = sum / L[i * N + i]; }
  };
  // Time derivative of the state. ctl(st) returns {F: newtons} or {a: wanted cart acceleration}; the motor force is capped at ±Fmax.
  // State: [x, θ1…θn, v, ω1…ωn, work done by the motor, energy lost to friction and damping].
  System.prototype.deriv = function (st, ctl, out) {
    var s = this, n = s.n, N = s.N, i;
    s.build(st); s.chol(); s.solve(s.bv, s.z);
    var e0 = s.e; if (!s.unit) { s.unit = new Float64Array(N); s.unit[0] = 1; } s.solve(s.unit, e0);
    var c = ctl ? ctl(st) : null, F = 0;
    if (c) F = c.a !== undefined ? (c.a - s.z[0]) / e0[0] : c.F;
    if (F > s.Fmax) F = s.Fmax; else if (F < -s.Fmax) F = -s.Fmax;
    for (i = 0; i < N; i++) { out[i] = st[N + i]; out[N + i] = s.z[i] + F * e0[i]; }
    var v = st[N], loss = -s._fr * v;
    if (s._fb !== 0) { var sg = st[0] > 0 ? 1 : -1; if (sg * v > 0) loss += s.cBump * v * v; }
    for (var j = 1; j <= n; j++) { var r = st[N + j] - (j > 1 ? st[N + j - 1] : 0); loss += s.c[j] * r * r; }
    var pw = 0; if (s.wind) { var vxb = v; for (j = 1; j <= n; j++) { var cj = Math.cos(st[j]), wj = st[N + j]; pw += s.wind * (vxb + cj * wj * s.l[j] / 2); vxb += cj * wj * s.l[j]; } }
    out[2 * N] = F * v + pw; out[2 * N + 1] = loss;
    s.lastF = F; s.lastAcc = out[N];
  };
  System.prototype.newState = function () { return new Float64Array(2 * this.N + 2); };
  // One RK4 step of length h.
  System.prototype.step = function (st, h, ctl) {
    var L = st.length, s = this;
    if (!s.k1 || s.k1.length !== L) { s.k1 = new Float64Array(L); s.k2 = new Float64Array(L); s.k3 = new Float64Array(L); s.k4 = new Float64Array(L); s.ts = new Float64Array(L); }
    var k1 = s.k1, k2 = s.k2, k3 = s.k3, k4 = s.k4, ts = s.ts, i;
    s.deriv(st, ctl, k1); var F1 = s.lastF, a1 = s.lastAcc;
    for (i = 0; i < L; i++) ts[i] = st[i] + 0.5 * h * k1[i]; s.deriv(ts, ctl, k2);
    for (i = 0; i < L; i++) ts[i] = st[i] + 0.5 * h * k2[i]; s.deriv(ts, ctl, k3);
    for (i = 0; i < L; i++) ts[i] = st[i] + h * k3[i]; s.deriv(ts, ctl, k4);
    for (i = 0; i < L; i++) st[i] += h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    s.lastF = F1; s.lastAcc = a1;
  };
  // One step of the Newmark average-acceleration (trapezoidal) method. The stiff, linear springs and dampers in the bindings are
  // treated implicitly, so very stiff bindings stay stable at the same step size; gravity, the spinning (Coriolis and centrifugal)
  // terms, friction, wind and the motor are evaluated at the predicted state. Second-order accurate; keeps st[2N+2] = acceleration
  // of every coordinate between steps (stored in s.acc).
  System.prototype.stepNM = function (st, h, ctl, iters) {
    var s = this, n = s.n, N = s.N, i, j, it, F = 0;
    if (!s.acc || s.acc.length !== N) s.acc = new Float64Array(N);
    if (!s.qs || s.qs.length !== 2 * N + 2) { s.qs = new Float64Array(2 * N + 2); s.qe = new Float64Array(2 * N + 2); s.rhs = new Float64Array(N); s.vold = new Float64Array(N); s.aNew = new Float64Array(N); }
    var acc = s.acc, qs = s.qs, qe = s.qe, rhs = s.rhs, h2 = h * h / 4, aN = s.aNew, A = s.A;
    // predictor: the part of the new position and velocity that depends only on the old acceleration
    for (i = 0; i < N; i++) { s.vold[i] = st[N + i]; qs[i] = st[i] + h * st[N + i] + h2 * acc[i]; qs[N + i] = st[N + i] + 0.5 * h * acc[i]; aN[i] = acc[i]; }
    iters = iters || 3;
    for (it = 0; it < iters; it++) {
      for (i = 0; i < N; i++) { qe[i] = qs[i] + h2 * aN[i]; qe[N + i] = qs[N + i] + 0.5 * h * aN[i]; }
      s.noSpring = true; s.build(qe); s.noSpring = false;
      for (i = 0; i < N; i++) rhs[i] = s.bv[i];
      for (j = 1; j <= n; j++) {
        var kj = s.k[j], cj = s.c[j];
        var phi = qs[j] - (j > 1 ? qs[j - 1] : 0), phid = qs[N + j] - (j > 1 ? qs[N + j - 1] : 0);
        var t = -kj * phi - cj * phid; rhs[j] += t; if (j > 1) rhs[j - 1] -= t;
        var d = 0.5 * h * cj + h2 * kj;
        A[j * N + j] += d; if (j > 1) { A[(j - 1) * N + j - 1] += d; A[j * N + j - 1] -= d; A[(j - 1) * N + j] -= d; }
      }
      s.chol(); s.solve(rhs, s.z);
      if (!s.unit) { s.unit = new Float64Array(N); s.unit[0] = 1; } s.solve(s.unit, s.e);
      var c = ctl ? ctl(qe) : null; F = 0;
      if (c) F = c.a !== undefined ? (c.a - s.z[0]) / s.e[0] : c.F;
      if (F > s.Fmax) F = s.Fmax; else if (F < -s.Fmax) F = -s.Fmax;
      for (i = 0; i < N; i++) aN[i] = s.z[i] + F * s.e[i];
    }
    for (i = 0; i < N; i++) { acc[i] = aN[i]; st[i] = qs[i] + h2 * aN[i]; st[N + i] = qs[N + i] + 0.5 * h * aN[i]; }
    // energy bookkeeping with the same trapezoid rule
    var vm = 0.5 * (s.vold[0] + st[N]), loss = -s._fr * vm, pw = 0;
    if (s._fb !== 0) { var sg = st[0] > 0 ? 1 : -1; if (sg * vm > 0) loss += s.cBump * vm * vm; }
    for (j = 1; j <= n; j++) { var r = 0.5 * (s.vold[j] + st[N + j]) - (j > 1 ? 0.5 * (s.vold[j - 1] + st[N + j - 1]) : 0); loss += s.c[j] * r * r; }
    if (s.wind) { var vxb = vm; for (j = 1; j <= n; j++) { var cc = Math.cos(st[j]), wj = 0.5 * (s.vold[j] + st[N + j]); pw += s.wind * (vxb + cc * wj * s.l[j] / 2); vxb += cc * wj * s.l[j]; } }
    var Fp = s.lastF === undefined ? F : s.lastF;
    st[2 * N] += h * (0.5 * (F + Fp) * vm + pw); st[2 * N + 1] += h * loss;
    s.lastF = F; s.lastAcc = acc[0];
  };
  // Start the Newmark stepper from rest-consistent accelerations for a new or edited state.
  System.prototype.initAcc = function (st, ctl) { var s = this, N = s.N, tmp = new Float64Array(2 * N + 2); s.deriv(st, ctl || null, tmp); if (!s.acc || s.acc.length !== N) s.acc = new Float64Array(N); for (var i = 0; i < N; i++) s.acc[i] = tmp[N + i]; };
  // Energies (J): kinetic ½ q̇ᵀ M q̇, gravitational (zero with the stack straight down at the pivot height), springs, bumpers.
  System.prototype.energy = function (st) {
    var s = this, n = s.n, N = s.N, i, j, ke = 0;
    s.build(st);
    for (i = 0; i < N; i++) { var row = 0; for (j = 0; j < N; j++) row += s.A[i * N + j] * st[N + j]; ke += 0.5 * st[N + i] * row; }
    var pg = 0, ps = 0; for (j = 1; j <= n; j++) { pg += s.g * s.mu[j] * (Math.cos(st[j]) + 1); var ph = st[j] - (j > 1 ? st[j - 1] : 0); ps += 0.5 * s.k[j] * ph * ph; }
    var over = Math.abs(st[0]) - s.xEnd, pb = over > 0 ? 0.5 * s.kBump * over * over : 0;
    return { ke: ke, pg: pg, ps: ps + pb, total: ke + pg + ps + pb };
  };
  // Positions of the joints (x, y) relative to the track, with the pivot at height h0; plus the centre of mass of the books.
  System.prototype.points = function (st, h0) {
    var s = this, n = s.n, x = st[0], y = h0, pts = [[x, y]], mx = 0, my = 0;
    for (var j = 1; j <= n; j++) {
      var sx = Math.sin(st[j]), cy = Math.cos(st[j]);
      mx += s.m[j] * (x + sx * s.l[j] / 2); my += s.m[j] * (y + cy * s.l[j] / 2);
      x += sx * s.l[j]; y += cy * s.l[j]; pts.push([x, y]);
    }
    var cw = [st[0] - Math.sin(st[1]) * s.rc, h0 - Math.cos(st[1]) * s.rc];
    return { pts: pts, com: [mx / s.mBooks, my / s.mBooks], cw: cw };
  };
  // Centre of mass of the books relative to the pivot, and its velocity; lean angle from the pivot.
  System.prototype.comState = function (st) {
    var s = this, n = s.n, N = s.N, px = 0, py = 0, vx = 0, vy = 0, ax = 0, ay = 0, avx = 0, avy = 0;
    for (var j = 1; j <= n; j++) {
      var sj = Math.sin(st[j]), cj = Math.cos(st[j]), w = st[N + j];
      var cx = ax + sj * s.l[j] / 2, cy = ay + cj * s.l[j] / 2, cvx = avx + cj * w * s.l[j] / 2, cvy = avy - sj * w * s.l[j] / 2;
      px += s.m[j] * cx; py += s.m[j] * cy; vx += s.m[j] * cvx; vy += s.m[j] * cvy;
      ax += sj * s.l[j]; ay += cj * s.l[j]; avx += cj * w * s.l[j]; avy -= sj * w * s.l[j];
    }
    px /= s.mBooks; py /= s.mBooks; vx /= s.mBooks; vy /= s.mBooks;
    var r2 = px * px + py * py, lean = Math.atan2(px, py), leanRate = (py * vx - px * vy) / r2;
    return { x: px, y: py, vx: vx, vy: vy, lean: lean, leanRate: leanRate, r: Math.sqrt(r2) };
  };

  // The swing, treating the stack as one stiff pendulum: its angle ψ from straight up (the books' centre of gravity seen from the pivot),
  // its rate, and its swing energy measured from hanging still, E = ½ J ψ̇² + g P (cos ψ + 1), where J is the moment of inertia about the
  // pivot and P the net top-heaviness (books minus counterweight). Reaching the top and stopping there takes E = Etop = 2 g P.
  System.prototype.swing = function (st) {
    var s = this, c = s.comState(st), J = s.inertia(), P = s.netMoment();
    return { psi: c.lean, rate: c.leanRate, E: 0.5 * J * c.leanRate * c.leanRate + s.g * P * (Math.cos(c.lean) + 1), Etop: 2 * s.g * P, J: J, P: P };
  };
  // Moment of inertia of the straight stack and counterweight about the pivot (kg·m²).
  System.prototype.inertia = function () { var J = 0, d = 0; for (var j = 1; j <= this.n; j++) { J += this.m[j] * Math.pow(d + this.l[j] / 2, 2) + this.I[j]; d += this.l[j]; } return J + this.mc * this.rc * this.rc; };

  // ---------- linear stability with the cart held still: A θ̈ = (G − K) θ ----------
  function jacobiEig(a, n) { // symmetric n×n (row-major); returns eigenvalues
    var A = Float64Array.from(a), it, p, q, i;
    for (it = 0; it < 100; it++) {
      var off = 0; for (p = 0; p < n; p++) for (q = p + 1; q < n; q++) off += A[p * n + q] * A[p * n + q];
      if (off < 1e-22) break;
      for (p = 0; p < n; p++) for (q = p + 1; q < n; q++) {
        var apq = A[p * n + q]; if (Math.abs(apq) < 1e-30) continue;
        var th = (A[q * n + q] - A[p * n + p]) / (2 * apq), t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (i = 0; i < n; i++) { var aip = A[i * n + p], aiq = A[i * n + q]; A[i * n + p] = c * aip - s * aiq; A[i * n + q] = s * aip + c * aiq; }
        for (i = 0; i < n; i++) { var api = A[p * n + i], aqi = A[q * n + i]; A[p * n + i] = c * api - s * aqi; A[q * n + i] = s * api + c * aqi; }
      }
    }
    var ev = []; for (i = 0; i < n; i++) ev.push(A[i * n + i]); return ev.sort(function (x, y) { return y - x; });
  }
  System.prototype.modes = function () {
    var s = this, n = s.n, i, j, k;
    var M = new Float64Array(n * n), B = new Float64Array(n * n), L = new Float64Array(n * n);
    for (i = 1; i <= n; i++) for (j = 1; j <= n; j++) M[(i - 1) * n + j - 1] = i === j ? s.D[i] : i < j ? s.l[i] * s.mu[j] : s.l[j] * s.mu[i];
    for (i = 1; i <= n; i++) { B[(i - 1) * n + i - 1] = s.g * s.mu[i] - s.k[i] - s.k[i + 1]; if (i < n) { B[(i - 1) * n + i] = s.k[i + 1]; B[i * n + i - 1] = s.k[i + 1]; } }
    for (i = 0; i < n; i++) for (j = 0; j <= i; j++) { var sum = M[i * n + j]; for (k = 0; k < j; k++) sum -= L[i * n + k] * L[j * n + k]; L[i * n + j] = i === j ? Math.sqrt(sum) : sum / L[j * n + j]; }
    // C = L⁻¹ B L⁻ᵀ
    var Y = new Float64Array(n * n), C = new Float64Array(n * n);
    for (var col = 0; col < n; col++) for (i = 0; i < n; i++) { var v = B[i * n + col]; for (k = 0; k < i; k++) v -= L[i * n + k] * Y[k * n + col]; Y[i * n + col] = v / L[i * n + i]; }
    for (var row = 0; row < n; row++) for (i = 0; i < n; i++) { var w = Y[row * n + i]; for (k = 0; k < i; k++) w -= L[i * n + k] * C[row * n + k]; C[row * n + i] = w / L[i * n + i]; }
    var ev = jacobiEig(C, n), up = ev.filter(function (e) { return e > 0; });
    return { rate: up.length ? Math.sqrt(up[0]) : 0, unstable: up.length, freqs: ev.filter(function (e) { return e < 0; }).map(function (e) { return Math.sqrt(-e) / (2 * Math.PI); }).sort(function (a, b) { return a - b; }) };
  };

  // Drag on one book in a side wind: F = ½ ρ C_d A v², with air at 1.2 kg/m³, C_d ≈ 1.2 for a block, and A = height × thickness
  // (the wind blows along the track, so it meets the book's spine or page edge, not its cover).
  System.prototype.windForce = function (speed) { var A = 0, i; for (i = 0; i < this.n; i++) A += this.books[i].l * this.books[i].t; A /= this.n; return 0.5 * 1.2 * 1.2 * A * speed * Math.abs(speed); };
  root.BCPhys = { System: System, makeBooks: makeBooks, rng: rng, G: G_EARTH };
  if (typeof module !== 'undefined') module.exports = root.BCPhys;
})(typeof window !== 'undefined' ? window : globalThis);
