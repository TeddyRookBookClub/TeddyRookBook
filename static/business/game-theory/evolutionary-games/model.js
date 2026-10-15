/* Game Theory, Chapter 14 (Evolutionary Game Theory): hawk–dove replicator dynamics (and a finite population that
   imitates), the spatial prisoner's dilemma of Nowak and May, and rock–paper–scissors replicator dynamics.
   window.GT14M in the browser, module.exports in node (tested in /tmp/work_gt2/test/gt14.test.js). */
(function (root) {
  'use strict';
  /* ---------- hawk–dove (Maynard Smith and Price) ----------
     Prize V, cost of losing a fight C. Hawk vs hawk: (V − C)/2 each; hawk vs dove: V and 0; dove vs dove: V/2 each.
     x = share of hawks. */
  function hdPay(x, V, Cc) { var h = x * (V - Cc) / 2 + (1 - x) * V, d = (1 - x) * V / 2; return { H: h, D: d, avg: x * h + (1 - x) * d }; }
  function hdDot(x, V, Cc) { var p = hdPay(x, V, Cc); return x * (1 - x) * (p.H - p.D); }
  function hdESS(V, Cc) { return Cc > V ? V / Cc : 1; }
  function rk4(f, x, dt) { var k1 = f(x), k2 = f(x + dt / 2 * k1), k3 = f(x + dt / 2 * k2), k4 = f(x + dt * k3); return x + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); }
  function hdStep(x, V, Cc, dt) { return Math.min(1, Math.max(0, rk4(function (y) { return hdDot(y, V, Cc); }, x, dt))); }
  /* rest points and their stability: sign of d(xdot)/dx */
  function hdRest(V, Cc) {
    var pts = [0, 1]; if (Cc > V) pts.splice(1, 0, V / Cc);
    return pts.map(function (x) { var e = 1e-6, s = (hdDot(Math.min(1, x + e), V, Cc) - hdDot(Math.max(0, x - e), V, Cc)) / (Math.min(1, x + e) - Math.max(0, x - e)); return { x: x, stable: s < 0 }; });
  }
  /* a finite population: each round every animal meets k random others, then each animal looks at one random other
     and copies it with probability (difference in average payoff) / (largest possible difference): pairwise
     proportional imitation, which follows the replicator equation on average (Schlag 1998). */
  function Pop(n, x0, R) { this.n = n; this.R = R; this.s = []; var h = Math.round(n * x0); for (var i = 0; i < n; i++) this.s.push(i < h ? 1 : 0); this.shuffle(); }
  Pop.prototype.shuffle = function () { var s = this.s, R = this.R; for (var i = s.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = s[i]; s[i] = s[j]; s[j] = t; } };
  Pop.prototype.share = function () { var h = 0; this.s.forEach(function (x) { h += x; }); return h / this.n; };
  Pop.prototype.round = function (V, Cc, k, rate) {
    var n = this.n, s = this.s, R = this.R, pay = new Array(n), i, j, t;
    for (i = 0; i < n; i++) { var tot = 0; for (t = 0; t < k; t++) { j = Math.floor(R() * (n - 1)); if (j >= i) j++; tot += s[i] ? (s[j] ? (V - Cc) / 2 : V) : (s[j] ? 0 : V / 2); } pay[i] = tot / k; }
    var span = V - Math.min(0, (V - Cc) / 2) + 1e-9, ns = s.slice(); // the largest possible payoff gap
    for (i = 0; i < n; i++) { if (R() > rate) continue; j = Math.floor(R() * (n - 1)); if (j >= i) j++; var d = pay[j] - pay[i]; if (d > 0 && R() < d / span) ns[i] = s[j]; }
    this.s = ns; return this.share();
  };

  /* ---------- the spatial prisoner's dilemma (Nowak and May 1992) ----------
     An L×L grid that wraps around. Each cell is a cooperator (1) or defector (0) and plays its 8 neighbors and itself:
     C meets C: 1; D meets C: b; C meets D: 0; D meets D: 0. Then every cell copies the best scorer in its 3×3 block
     (itself included; it keeps its own strategy unless someone scores strictly more). */
  function Grid(L) { this.L = L; this.s = new Uint8Array(L * L); this.prev = new Uint8Array(L * L); this.score = new Float64Array(L * L); this.gen = 0; }
  Grid.prototype.fill = function (mode, R, frac) {
    var L = this.L, s = this.s; s.fill(1);
    if (mode === 'one') s[Math.floor(L / 2) * L + Math.floor(L / 2)] = 0;
    else for (var i = 0; i < L * L; i++) s[i] = R() < frac ? 0 : 1;
    this.prev.set(s); this.gen = 0;
  };
  Grid.prototype.step = function (b) {
    var L = this.L, s = this.s, sc = this.score, x, y, dx, dy;
    for (y = 0; y < L; y++) for (x = 0; x < L; x++) {
      var me = s[y * L + x], c = 0;
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) c += s[((y + dy + L) % L) * L + ((x + dx + L) % L)];
      sc[y * L + x] = me ? c : b * c; // c counts cooperators among the 9 (including itself)
    }
    var ns = new Uint8Array(L * L);
    for (y = 0; y < L; y++) for (x = 0; x < L; x++) {
      var bi = y * L + x, best = sc[bi], st = s[bi];
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) { var k = ((y + dy + L) % L) * L + ((x + dx + L) % L); if (sc[k] > best) { best = sc[k]; st = s[k]; } }
      ns[bi] = st;
    }
    this.prev = s; this.s = ns; this.gen++;
  };
  Grid.prototype.coop = function () { var c = 0; for (var i = 0; i < this.s.length; i++) c += this.s[i]; return c / this.s.length; };

  /* ---------- rock–paper–scissors ----------
     Strategies 0, 1, 2; each beats the next one along (0 beats 2, 1 beats 0, 2 beats 1). A win pays w, a loss −l, a tie 0. */
  function rpsMatrix(w, l) { return [[0, -l, w], [w, 0, -l], [-l, w, 0]]; }
  function repDot(A, x) { var f = [0, 0, 0], avg = 0, i, j; for (i = 0; i < 3; i++) { for (j = 0; j < 3; j++) f[i] += A[i][j] * x[j]; avg += x[i] * f[i]; } return [x[0] * (f[0] - avg), x[1] * (f[1] - avg), x[2] * (f[2] - avg)]; }
  function repStep(A, x, dt) {
    function add(a, b, k) { return [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]]; }
    var k1 = repDot(A, x), k2 = repDot(A, add(x, k1, dt / 2)), k3 = repDot(A, add(x, k2, dt / 2)), k4 = repDot(A, add(x, k3, dt));
    var y = [x[0] + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), x[1] + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]), x[2] + dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])];
    y = y.map(function (v) { return Math.max(1e-12, v); }); var s = y[0] + y[1] + y[2]; return y.map(function (v) { return v / s; });
  }

  var api = { hdPay: hdPay, hdDot: hdDot, hdESS: hdESS, hdStep: hdStep, hdRest: hdRest, Pop: Pop, Grid: Grid, rpsMatrix: rpsMatrix, repDot: repDot, repStep: repStep };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GT14M = api;
})(this);
