/* Magnetic Bottles: the numbers behind "What each setting does" and "Find a better bottle".
   Shared by the page, its Web Worker (explore-worker.js) and the Node tests: window.MBExplore / module.exports.
   Every number comes from the exact formulas in physics.js (window.MagBottles); nothing here is fitted or guessed.

   metrics(fam, P, need, Q)  the outputs the panel shows, for one set of settings
   jobs.nudge / map / find / pareto   generators that do the work in small pieces (yielding messages between pieces)
   runner(post, budget)      runs jobs in slices of `budget` ms, so the thread that runs them never stalls for long
   client(urls)              (browser) runs jobs in a Web Worker, or on the page in small slices if workers are not available */
(function (root) {
  'use strict';
  var MB = root.MagBottles;
  if (!MB && typeof require === 'function') MB = require('./physics.js');
  var PI = Math.PI, TAU = 2 * PI;
  var now = (typeof performance !== 'undefined' && performance.now) ? function () { return performance.now(); } : function () { return Date.now(); };

  /* ---------- the settings: the same ranges and steps as the sliders in sim.js ---------- */
  var SET = {
    f1: [{ k: 'eps', min: 0.05, max: 0.9, step: 0.01 }, { k: 'tau', min: -0.9, max: 0.9, step: 0.01 }, { k: 'delta', min: 0.0001, step: 0.0001 }],
    f2: [{ k: 'eps', min: 0.2, max: 2.5, step: 0.01 }, { k: 'S', min: 0.4, max: 2.5, step: 0.01 }, { k: 'lam', min: 0.5, max: 3, step: 0.01 },
         { k: 'tau', min: -1.5, max: 1.5, step: 0.01 }, { k: 'delta', min: 0.001, step: 0.001 }]
  };
  function spec(fam, k) { for (var i = 0; i < SET[fam].length; i++) if (SET[fam][i].k === k) return SET[fam][i]; return null; }
  function keys(fam) { return SET[fam].map(function (s) { return s.k; }); }
  /* nested flux surfaces need 0 < delta < dmax (paper, Secs. 3 and 4) */
  function dmax(fam, P) {
    if (fam === 'f1') { var O2 = 1 - P.tau * P.tau, u = 1 - O2 * P.eps; return u * u / 4; }
    var s = Math.sin(Math.min(P.S, PI / 2)); return 0.5 * s * s;
  }
  /* the delta slider stops at 98% of the limit, rounded down to its step (as in sim.js) */
  function deltaTop(fam, P) { var s = spec(fam, 'delta').step; return Math.floor(0.98 * dmax(fam, P) / s) * s; }
  function lo(fam, k) { return spec(fam, k).min; }
  function hi(fam, k, P) { return k === 'delta' ? 0.98 * dmax(fam, P) : spec(fam, k).max; }
  function valid(fam, P) {
    for (var i = 0; i < SET[fam].length; i++) {
      var s = SET[fam][i], v = P[s.k];
      if (!(v >= s.min - 1e-12)) return false;
      if (s.k !== 'delta' && v > s.max + 1e-12) return false;
    }
    return P.delta <= 0.98 * dmax(fam, P) + 1e-12;
  }
  function copy(P) { var o = {}; for (var k in P) o[k] = P[k]; return o; }
  function snap(fam, P) {                          // settings rounded to the sliders' steps; delta rounded down so it stays allowed
    var o = copy(P);
    SET[fam].forEach(function (s) {
      var d = s.step < 0.001 ? 4 : s.step < 0.01 ? 3 : 2;
      if (s.k === 'delta') return;
      o[s.k] = +Math.min(s.max, Math.max(s.min, Math.round(o[s.k] / s.step) * s.step)).toFixed(d);
    });
    var sd = spec(fam, 'delta').step, dd = sd < 0.001 ? 4 : 3;
    o.delta = +Math.max(sd, Math.min(deltaTop(fam, o), Math.floor(o.delta / sd + 1e-9) * sd)).toFixed(dd);
    return o;
  }

  /* ---------- the outputs ---------- */
  /* Family 2's twist on the axis: there chi does not matter, so iota is the average over ze of (h + eps cos 2ze) / cosh(nu) */
  function iotaAxis2(P, n) {
    n = n || 96; var h = Math.sqrt(4 * P.S * P.S + P.eps * P.eps), s = 0;
    for (var i = 0; i < n; i++) { var z = TAU * i / n; s += (h + P.eps * Math.cos(2 * z)) / Math.cosh(P.eps * Math.sin(2 * z) / 2 + P.tau); }
    return s / n;
  }
  /* |B| on the edge: the lowest and highest values among n spread-out points (as the panel samples them), each then polished by a
     small compass search over the two surface angles, so the answer is the true extreme rather than the nearest sample */
  function edgeB(m, n, polish) {
    var p = [0, 0, 0], B = [0, 0, 0];
    function bm(t, z) { m.surf(1, t, z, p); m.B(p[0], p[1], p[2], B); return Math.sqrt(B[0] * B[0] + B[1] * B[1] + B[2] * B[2]); }
    var vlo = 1e300, vhi = -1e300, tl = 0, zl = 0, th = 0, zh = 0;
    for (var i = 0; i < n; i++) {
      var t = TAU * ((i * 0.618034) % 1), z = TAU * i / n, b = bm(t, z);
      if (b < vlo) { vlo = b; tl = t; zl = z; } if (b > vhi) { vhi = b; th = t; zh = z; }
    }
    if (polish !== false) {
      var s0 = 2.5 * TAU / Math.sqrt(n);
      vlo = compass(function (a, c) { return bm(a, c); }, tl, zl, s0, vlo);
      vhi = -compass(function (a, c) { return -bm(a, c); }, th, zh, s0, -vhi);
    }
    return [vlo, vhi];
  }
  function compass(fn, x, y, s, fx, tol, cap) {     // minimise fn(x, y) from (x, y), step s halving down to tol
    var n = 0; tol = tol || 1e-6; cap = cap || 400;
    while (s > tol && n < cap) {
      var moved = false;
      for (var d = 0; d < 4; d++) {
        var nx = x + (d === 0 ? s : d === 1 ? -s : 0), ny = y + (d === 2 ? s : d === 3 ? -s : 0), v = fn(nx, ny); n++;
        if (v < fx) { fx = v; x = nx; y = ny; moved = true; break; }
      }
      if (!moved) s /= 2;
    }
    return fx;
  }
  /* the mirror gap: turn the edge over (x, y, z) -> (x, -y, -z) and find the largest distance from the turned copy to the real
     edge. Same method as MagBottles.mirrorGap (closest point by Gauss-Newton from the nearest of a cloud of edge points), plus a
     compass search that moves the source point to where the distance is largest. */
  function gap(m, G) {
    var nt = G[0], nz = G[1], mt = G[2], mz = G[3], N = nt * nz, X = new Float64Array(N), Y = new Float64Array(N), Z = new Float64Array(N);
    var p = [0, 0, 0], q = [0, 0, 0], ax = [0, 0, 0], pa = [0, 0, 0], pb = [0, 0, 0], minor = 0, i, j, k;
    for (i = 0; i < nt; i++) for (j = 0; j < nz; j++) {
      k = i * nz + j; m.surf(1, TAU * i / nt, TAU * j / nz, p); X[k] = p[0]; Y[k] = p[1]; Z[k] = p[2];
      m.surf(0, 0, TAU * j / nz, ax); minor += Math.hypot(p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]) / N;
    }
    var mx = 0, my = 0, mzz = 0, h = 1e-6;
    function d2(th, ze) { m.surf(1, th, ze, pa); return (pa[0] - mx) * (pa[0] - mx) + (pa[1] - my) * (pa[1] - my) + (pa[2] - mzz) * (pa[2] - mzz); }
    function descend(th, ze) {
      var cur = d2(th, ze);
      for (var it = 0; it < 30 && cur > 1e-28; it++) {
        m.surf(1, th, ze, p); m.surf(1, th + h, ze, pa); m.surf(1, th, ze + h, pb);
        var t0 = (pa[0] - p[0]) / h, t1 = (pa[1] - p[1]) / h, t2 = (pa[2] - p[2]) / h, z0 = (pb[0] - p[0]) / h, z1 = (pb[1] - p[1]) / h, z2 = (pb[2] - p[2]) / h;
        var r0 = p[0] - mx, r1 = p[1] - my, r2 = p[2] - mzz;
        var A = t0 * t0 + t1 * t1 + t2 * t2, Bq = t0 * z0 + t1 * z1 + t2 * z2, C = z0 * z0 + z1 * z1 + z2 * z2, g1 = t0 * r0 + t1 * r1 + t2 * r2, g2 = z0 * r0 + z1 * r1 + z2 * r2, det = A * C - Bq * Bq;
        if (!(det > 0)) break;
        var dth = -(C * g1 - Bq * g2) / det, dze = -(A * g2 - Bq * g1) / det, ok = false;
        for (var hv = 0; hv < 12; hv++) { var nd = d2(th + dth, ze + dze); if (nd < cur) { th += dth; ze += dze; cur = nd; ok = true; break; } dth /= 2; dze /= 2; }
        if (!ok) break;
      }
      return cur;
    }
    function dist(tha, zeb) {                          // distance from the turned-over point (tha, zeb) to the real edge
      m.surf(1, tha, zeb, q); mx = q[0]; my = -q[1]; mzz = -q[2];
      var best = 1e300, bk = 0;
      for (var k = 0; k < N; k++) { var dd = (X[k] - mx) * (X[k] - mx) + (Y[k] - my) * (Y[k] - my) + (Z[k] - mzz) * (Z[k] - mzz); if (dd < best) { best = dd; bk = k; } }
      var res = descend(TAU * Math.floor(bk / nz) / nt, TAU * (bk % nz) / nz), bt = 0, bd = 1e300;
      for (var c = 0; c < 48; c++) { var dc = d2(TAU * c / 48, -zeb); if (dc < bd) { bd = dc; bt = TAU * c / 48; } }
      return Math.sqrt(Math.min(res, best, descend(bt, -zeb)));
    }
    var S = [];
    for (var a = 0; a < mt; a++) for (var b = 0; b < mz; b++) S.push({ a: a, b: b, d: dist(TAU * (a + 0.37) / mt, TAU * (b + 0.21) / mz) });
    S.sort(function (u, v) { return v.d - u.d; });
    var g = S[0].d;
    if (g > 1e-6 * minor) {
      /* polish the largest sample and the next largest ones that lie in other places (the largest distance can sit in more
         than one spot, and the coarse samples do not always pick the right one) */
      var picks = [S[0]];
      for (var i2 = 1; i2 < S.length && picks.length < G[6]; i2++) {
        var far = picks.every(function (p0) { var da = Math.abs(p0.a - S[i2].a), db = Math.abs(p0.b - S[i2].b); return Math.min(da, mt - da) > 1 || Math.min(db, mz - db) > 1; });
        if (far && S[i2].d > 0.7 * g) picks.push(S[i2]);
      }
      picks.forEach(function (p0) {
        var v = -compass(function (x, y) { return -dist(x, y); }, TAU * (p0.a + 0.37) / mt, TAU * (p0.b + 0.21) / mz, 0.6 * TAU / Math.max(mt, mz), -p0.d, G[4], G[5]);
        if (v > g) g = v;
      });
    }
    return { gap: g < 1e-6 * minor ? 0 : g, minor: minor };   // below a millionth of the plasma radius is round-off: exactly symmetric
  }

  /* two levels of care: PANEL matches the live numbers on the page; MAP is quicker, for the maps and the searches */
  var QP = { io: 1, bn: 400, gap: [16, 48, 8, 24, 1e-5, 200, 3], avg: [64, 96] };
  var QM = { io: 0.6, bn: 160, gap: [12, 28, 6, 16, 3e-3, 30, 3], avg: [32, 48] };
  var ALL = { V: 1, bV: 1, io: 1, rip: 1, gap: 1 };
  function metrics(fam, P, need, Q) {
    need = need || ALL; Q = Q || QM;
    var m = MB.make(fam, P), r = { dmax: m.dmax, pa: m.pAxis };
    if (fam === 'f1') { r.V = m.volume; r.bV = m.betaV; r.ia = 2; r.ie = 2; r.sh = 0; }
    else {
      if (need.V || need.bV) { var av = m.averages(Q.avg[0], Q.avg[1]); r.V = av.V; r.bV = av.betaV; }
      if (need.io) { r.ia = m.iota(0); r.ie = m.iota(1, Q.io); r.sh = r.ie - r.ia; }
    }
    if (need.rip) { var eb = edgeB(m, Q.bn); r.bmin = eb[0]; r.bmax = eb[1]; r.rip = eb[1] / eb[0]; }
    if (need.gap) { var g = gap(m, Q.gap); r.gap = g.gap; r.minor = g.minor; r.gapRel = g.gap / g.minor; }
    return r;
  }
  /* the outputs one can map, search or plot, with the direction that counts as better */
  var OUT = {
    V: { need: { V: 1 }, f: function (r) { return r.V; }, better: 1 },
    bV: { need: { bV: 1 }, f: function (r) { return r.bV; }, better: 1 },
    ie: { need: { io: 1 }, f: function (r) { return r.ie; }, better: 0, f2only: true },
    sh: { need: { io: 1 }, f: function (r) { return r.sh; }, better: 0, f2only: true },
    ash: { need: { io: 1 }, f: function (r) { return Math.abs(r.sh); }, better: 1, f2only: true },
    rip: { need: { rip: 1 }, f: function (r) { return r.rip; }, better: -1 },
    gap: { need: { gap: 1 }, f: function (r) { return r.gapRel; }, better: -1 }
  };
  function outOf(fam, P, o, Q) { return OUT[o].f(metrics(fam, P, OUT[o].need, Q)); }

  /* ---------- quasi-random points (Halton) for scans and clouds ---------- */
  var PR = [2, 3, 5, 7, 11, 13];
  function halton(i, b) { var f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }

  /* ---------- the jobs ---------- */
  /* nudge: the change in every output when each setting is raised, and when it is lowered, by a small step from P */
  function nudgeStep(fam, k, P) {
    var s = spec(fam, k);
    if (k === 'delta') return Math.max(s.step, 0.1 * P.delta);     // delta spans a wide range: a 10% step
    return Math.max(s.step, 0.04 * (s.max - s.min));
  }
  function* nudge(a) {
    var fam = a.fam, P = a.P, base = metrics(fam, P, { V: 1, bV: 1, io: 1, rip: 1 }, QP);
    var g = gap(MB.make(fam, P), QP.gap); base.gap = g.gap; base.minor = g.minor; base.gapRel = g.gap / g.minor;
    yield { t: 'base', r: base };
    var ks = keys(fam), first = a.first ? [a.first].concat(ks.filter(function (k) { return k !== a.first; })) : ks;
    for (var i = 0; i < first.length; i++) for (var dir = 1; dir >= -1; dir -= 2) {
      var k = first[i], h = nudgeStep(fam, k, P), P2 = copy(P), s = spec(fam, k);
      P2[k] = P[k] + dir * h;
      var row = { t: 'nudge', k: k, h: h, dir: dir };
      if (dir > 0 && P2[k] > (k === 'delta' ? 0.98 * dmax(fam, P) : s.max) + 1e-12) { row.blocked = 'top'; yield row; continue; }
      if (dir < 0 && P2[k] < s.min - 1e-12) { row.blocked = 'bottom'; yield row; continue; }
      if (!valid(fam, P2)) { row.blocked = 'delta'; yield row; continue; }
      var r = metrics(fam, P2, { V: 1, bV: 1, io: 1, rip: 1 }, QP);
      yield null;
      g = gap(MB.make(fam, P2), QP.gap); r.gap = g.gap; r.minor = g.minor; r.gapRel = g.gap / g.minor;
      row.r = r; yield row;
    }
  }
  /* axis range of a map: the slider range; for delta, up to the largest allowed value anywhere on the map */
  function mapRange(fam, k, P, other) {
    if (k !== 'delta') { var s = spec(fam, k); return [s.min, s.max]; }
    var top = 0, so = spec(fam, other), P2 = copy(P);
    for (var i = 0; i <= 200; i++) { P2[other] = so.min + (so.max - so.min) * i / 200; top = Math.max(top, 0.98 * dmax(fam, P2)); }
    return [spec(fam, 'delta').min, top];
  }
  /* map: the output o over a grid of the settings kx, ky (the rest held at P), coarse points first */
  function* map(a) {
    var fam = a.fam, P = copy(a.P), nx = a.nx, ny = a.ny, xr = mapRange(fam, a.kx, P, a.ky), yr = mapRange(fam, a.ky, P, a.kx);
    var done = new Uint8Array(nx * ny), out = [], t0 = now();
    yield { t: 'range', xr: xr, yr: yr };
    for (var lev = 8; lev >= 1; lev /= 2) {
      for (var j = 0; j < ny; j += lev) for (var i = 0; i < nx; i += lev) {
        var id = j * nx + i; if (done[id]) continue; done[id] = 1;
        P[a.kx] = xr[0] + (xr[1] - xr[0]) * i / (nx - 1); P[a.ky] = yr[0] + (yr[1] - yr[0]) * j / (ny - 1);
        var v = valid(fam, P) ? outOf(fam, P, a.o, QM) : NaN;
        out.push(id, v, lev);
        if (now() - t0 > 30) { yield { t: 'pts', d: out }; out = []; t0 = now(); }
      }
      if (out.length) { yield { t: 'pts', d: out }; out = []; t0 = now(); }
      yield { t: 'level', lev: lev };
    }
  }
  /* pareto: n bottles spread over every setting (tau >= 0: the sign of tau only turns the bottle over), delta up to kmax of its limit */
  function* pareto(a) {
    var fam = a.fam, ks = keys(fam), out = [], t0 = now(), need = {};
    a.outs.forEach(function (o) { for (var q in OUT[o].need) need[q] = 1; });
    for (var i = 1; i <= a.n; i++) {
      var P = {}, f = 0;
      for (var d = 0; d < ks.length; d++) {
        var u = halton(i + 17, PR[d]), s = spec(fam, ks[d]);
        if (ks[d] === 'delta') f = 0.04 + (a.kmax - 0.04) * u;
        else if (ks[d] === 'tau') P.tau = s.max * u;
        else P[ks[d]] = s.min + (s.max - s.min) * u;
      }
      P.delta = f * dmax(fam, P); P = snap(fam, P);
      if (P.delta > a.kmax * dmax(fam, P)) P.delta = Math.max(spec(fam, 'delta').step, P.delta - spec(fam, 'delta').step);
      if (!valid(fam, P)) continue;
      var r = metrics(fam, P, need, QM), row = [i];
      for (d = 0; d < a.outs.length; d++) row.push(OUT[a.outs[d]].f(r));
      out.push({ P: P, v: row.slice(1) });
      if (now() - t0 > 30) { yield { t: 'pts', d: out }; out = []; t0 = now(); }
    }
    if (out.length) yield { t: 'pts', d: out };
  }
  /* find: the best settings for a goal. A coarse scan (quasi-random points over the free settings), then Nelder-Mead from the
     best point found, in coordinates scaled to 0..1 across each slider. Delta is searched as a fraction of its limit, so
     "keep delta below kmax of its limit" is a simple bound. Settings never leave the sliders' ranges. */
  var GOALS = {
    bV: { o: 'bV', sign: 1 }, V: { o: 'V', sign: 1 }, sh: { o: 'ash', sign: 1 }, rip: { o: 'rip', sign: -1 }, gap: { o: 'gap', sign: -1, only: ['tau'] }
  };
  function* find(a) {
    var fam = a.fam, goal = GOALS[a.goal], P0 = copy(a.P), free = (goal.only || a.free).filter(function (k) { return spec(fam, k); });
    var o = goal.o, need = copy(OUT[o].need), kmax = a.kmax, minV = a.minV || 0, fmin = 0.02, evals = 0;
    if (minV > 0) need.V = 1;
    var dFixed = free.indexOf('delta') < 0, nd = free.length, tsg = P0.tau < 0 ? -1 : 1;
    /* every output here is the same for tau and -tau (the bottle turned over), so tau is searched from 0 up, keeping its sign.
       While searching, the rules get a small safety margin, so that rounding the answer to the sliders' steps keeps them. */
    var kS = kmax - 0.004, minVS = minV * 1.006;
    function toP(u) {
      var P = copy(P0), f = 0;
      for (var d = 0; d < nd; d++) {
        var k = free[d], s = spec(fam, k), x = Math.min(1, Math.max(0, u[d]));
        if (k === 'delta') f = fmin + (kS - fmin) * x; else if (k === 'tau') P.tau = tsg * s.max * x; else P[k] = s.min + (s.max - s.min) * x;
      }
      if (!dFixed) P.delta = Math.max(spec(fam, 'delta').min, f * dmax(fam, P));
      return P;
    }
    function score(P, strict) {                        // the value to minimise, and whether the rules hold
      evals++;
      var kk = strict ? kmax : kS, mv = strict ? minV : minVS;
      if (!valid(fam, P) || P.delta > kk * dmax(fam, P) * (1 + 1e-9)) return { s: 1e9, ok: false };
      var r = metrics(fam, P, need, QM), v = OUT[o].f(r);
      if (!(v === v)) return { s: 1e9, ok: false };
      if (mv > 0 && r.V < mv) return { s: 1e6 + (mv - r.V), ok: false, v: v, r: r };
      return { s: -goal.sign * v, ok: true, v: v, r: r };
    }
    function toU(P) {
      return free.map(function (k) { var s = spec(fam, k); return k === 'delta' ? (P.delta / dmax(fam, P) - fmin) / (kS - fmin) : k === 'tau' ? Math.abs(P.tau) / s.max : (P[k] - s.min) / (s.max - s.min); });
    }
    /* 1. the coarse scan */
    var nScan = a.nScan || (nd <= 1 ? 15 : nd <= 3 ? 120 : 360), cand = [], t0 = now(), batch = [];
    var u0 = toU(P0).map(function (x) { return Math.min(1, Math.max(0, x)); }), s0 = score(P0, true);
    cand.push({ u: u0, s: score(toP(u0)).s });
    for (var i = 1; i <= nScan; i++) {
      var u = []; for (var d = 0; d < nd; d++) u.push(nd === 1 ? (i - 0.5) / nScan : halton(i, PR[d]));
      var sc = score(toP(u)); cand.push({ u: u, s: sc.s });
      batch.push(toP(u), sc.ok);
      if (now() - t0 > 25) { yield { t: 'scan', d: batch, i: i, n: nScan }; batch = []; t0 = now(); }
    }
    if (batch.length) yield { t: 'scan', d: batch, i: nScan, n: nScan };
    cand.sort(function (x, y) { return x.s - y.s; });
    /* 2. Nelder-Mead from the best scan points that lie apart from each other (up to three), each restarted once from
       where it stopped with a fresh simplex, which helps it past early stalls */
    var starts = [cand[0]];
    for (i = 1; i < cand.length && starts.length < (nd <= 1 ? 1 : nd <= 2 ? 2 : 3); i++) {
      if (!(cand[i].s < 1e5)) break;
      var far = starts.every(function (st) { var dd = 0; for (var q = 0; q < nd; q++) dd += Math.pow(cand[i].u[q] - st.u[q], 2); return Math.sqrt(dd) > 0.25; });
      if (far) starts.push(cand[i]);
    }
    var ends = [];
    for (var run = 0; run < starts.length; run++) {
      var uS = starts[run].u, res;
      for (var pass = 0; pass < (nd <= 1 ? 1 : 2); pass++) {
        var gen = nelderMead(function (uu) { return score(toP(uu)).s; }, uS, pass ? 0.05 : 0.12, a.maxIt || 120);
        while (!(res = gen.next()).done) { if (res.value) yield { t: 'path', run: run, P: toP(res.value.u), s: res.value.s }; }
        uS = res.value.u;
      }
      /* then a compass search along each setting, which also finds answers that sit on the edge of a slider's range */
      var cu = uS.slice(), cs = res.value.s, step = 0.08, nIt = 0;
      while (step > 1e-3 && nIt < 200) {
        var moved = false;
        for (var cd = 0; cd < nd && !moved; cd++) for (var sg = -1; sg <= 1 && !moved; sg += 2) {
          var tu = cu.slice(); tu[cd] = Math.min(1, Math.max(0, tu[cd] + sg * step)); if (tu[cd] === cu[cd]) continue;
          var ts = score(toP(tu)).s; nIt++;
          if (ts < cs) { cu = tu; cs = ts; moved = true; yield { t: 'path', run: run, P: toP(cu), s: cs }; }
        }
        if (!moved) step /= 2;
      }
      ends.push({ u: cu, s: cs });
    }
    ends.sort(function (x, y) { return x.s - y.s; });
    /* 3. the answer must sit on the sliders' steps and still obey the rules: try the nearest steps first, then the other
       roundings of each setting, for each end point in turn; your own bottle wins a tie */
    var pick = null, bestFin = null;
    for (var e = 0; e < ends.length && !pick; e++) {
      var Pc = toP(ends[e].u), base = snap(fam, Pc), tries = [base], ks = free.filter(function (k) { return k !== 'delta'; });
      if (base.delta > kmax * dmax(fam, base)) base.delta = +(base.delta - spec(fam, 'delta').step).toFixed(4);
      for (var mask = 1; mask < (1 << ks.length) && mask < 64; mask++) {
        var Q = copy(base);
        for (var q2 = 0; q2 < ks.length; q2++) if (mask & (1 << q2)) { var sp = spec(fam, ks[q2]), v0 = Pc[ks[q2]] / sp.step; Q[ks[q2]] = +(Math.min(sp.max, Math.max(sp.min, (Math.round(v0) === Math.floor(v0) ? Math.ceil(v0) : Math.floor(v0)) * sp.step))).toFixed(2); }
        var dst = spec(fam, 'delta').step;
        if (!dFixed) Q.delta = +Math.min(Q.delta, Math.floor(kmax * dmax(fam, Q) / dst + 1e-9) * dst).toFixed(4);
        tries.push(Q);
      }
      for (var tq = 0; tq < tries.length; tq++) {
        var Pt = tries[tq]; if (!valid(fam, Pt)) continue;
        var ft = score(Pt, true);
        if (ft.ok && (!bestFin || ft.s < bestFin.s)) { bestFin = ft; pick = Pt; }
        if (tq === 0 && ft.ok) break;                   // the nearest steps are fine: done
      }
    }
    var kept = false;
    if (s0.ok && (!pick || s0.s <= bestFin.s + 1e-12 * Math.abs(s0.s))) { pick = P0; bestFin = s0; kept = true; }
    if (!pick) { yield { t: 'best', P: snap(fam, toP(ends[0].u)), ok: false, evals: evals }; return; }
    yield { t: 'best', P: pick, ok: true, v: bestFin.v, r: metrics(fam, pick, ALL, QM), evals: evals, kept: kept };
  }
  /* Nelder-Mead in the unit box (points are clipped to the box). Yields the best vertex after each step; returns it at the end. */
  function* nelderMead(fn, x0, size, maxIt) {
    var n = x0.length, S = [], F = [];
    function clip(x) { return x.map(function (v) { return Math.min(1, Math.max(0, v)); }); }
    S.push(clip(x0)); F.push(fn(S[0]));
    for (var i = 0; i < n; i++) { var x = x0.slice(); x[i] += x[i] + size > 1 ? -size : size; S.push(clip(x)); F.push(fn(S[i + 1])); }
    for (var it = 0; it < maxIt; it++) {
      var idx = F.map(function (v, k) { return k; }).sort(function (p, q) { return F[p] - F[q]; });
      S = idx.map(function (k) { return S[k]; }); F = idx.map(function (k) { return F[k]; });
      yield { u: S[0], s: F[0] };
      var spread = 0; for (i = 1; i <= n; i++) for (var d = 0; d < n; d++) spread = Math.max(spread, Math.abs(S[i][d] - S[0][d]));
      if (spread < 2e-4 || Math.abs(F[n] - F[0]) < 1e-9 * (1 + Math.abs(F[0]))) break;
      var c = new Array(n).fill(0); for (i = 0; i < n; i++) for (d = 0; d < n; d++) c[d] += S[i][d] / n;
      var xr = clip(c.map(function (v, d) { return v + (v - S[n][d]); })), fr = fn(xr);
      if (fr < F[0]) {
        var xe = clip(c.map(function (v, d) { return v + 2 * (v - S[n][d]); })), fe = fn(xe);
        if (fe < fr) { S[n] = xe; F[n] = fe; } else { S[n] = xr; F[n] = fr; }
      } else if (fr < F[n - 1]) { S[n] = xr; F[n] = fr; }
      else {
        var xc = clip(fr < F[n] ? c.map(function (v, d) { return v + 0.5 * (xr[d] - v); }) : c.map(function (v, d) { return v + 0.5 * (S[n][d] - v); })), fc = fn(xc);
        if (fc < Math.min(fr, F[n])) { S[n] = xc; F[n] = fc; }
        else for (i = 1; i <= n; i++) { S[i] = clip(S[i].map(function (v, d) { return S[0][d] + 0.5 * (v - S[0][d]); })); F[i] = fn(S[i]); }
      }
    }
    var b = 0; for (i = 1; i <= n; i++) if (F[i] < F[b]) b = i;
    return { u: S[b], s: F[b] };
  }
  var jobs = { nudge: nudge, map: map, pareto: pareto, find: find };

  /* ---------- running jobs in slices ---------- */
  function runner(post, budget, defer) {
    var live = {}, order = ['nudge', 'map', 'find', 'pareto'], timer = null;
    defer = defer || function (f) { return setTimeout(f, 0); };
    function tick() {
      timer = null;
      var chans = order.filter(function (c) { return live[c]; }); if (!chans.length) return;
      var share = budget / chans.length, msgs = [];
      chans.forEach(function (c) {
        var j = live[c], t0 = now();
        while (live[c] === j && now() - t0 < share) {
          var r;
          try { r = j.gen.next(); } catch (e) { msgs.push({ ch: c, id: j.id, err: String(e && e.message || e) }); delete live[c]; break; }
          if (r.value) msgs.push({ ch: c, id: j.id, m: r.value });
          if (r.done) { msgs.push({ ch: c, id: j.id, done: true }); delete live[c]; break; }
        }
      });
      if (msgs.length) post(msgs);
      if (!timer && Object.keys(live).length) timer = defer(tick);
    }
    return {
      start: function (ch, id, type, args) { live[ch] = { id: id, gen: jobs[type](args) }; if (!timer) timer = defer(tick); },
      cancel: function (ch) { delete live[ch]; }
    };
  }

  /* ---------- the browser side: a Web Worker when possible, otherwise small slices on the page ---------- */
  function client(urls) {
    var subs = {}, ids = 0, worker = null, local = null, pending = {};
    function deliver(list) {
      list.forEach(function (x) { var s = subs[x.ch]; if (s && s.id === x.id) { if (x.err && root.console) root.console.error('MBExplore', x.err); s.fn(x.m, !!x.done || !!x.err); if (x.done || x.err) { delete subs[x.ch]; delete pending[x.ch]; } } });
    }
    function useLocal() {
      if (local) return;
      worker = null;
      local = runner(deliver, 12, function (f) { return setTimeout(f, 0); });
      for (var c in pending) local.start(c, pending[c].id, pending[c].type, pending[c].args);
    }
    try {
      if (urls && urls.worker && typeof Worker !== 'undefined') {
        worker = new Worker(urls.worker);
        worker.onmessage = function (e) { deliver(e.data); };
        worker.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); useLocal(); };
        worker.postMessage({ init: [urls.physics, urls.explore] });
      }
    } catch (e) { worker = null; }
    if (!worker) useLocal();
    return {
      run: function (ch, type, args, fn) {
        var id = ++ids; subs[ch] = { id: id, fn: fn }; pending[ch] = { id: id, type: type, args: args };
        if (worker) worker.postMessage({ ch: ch, id: id, type: type, args: args }); else local.start(ch, id, type, args);
        return id;
      },
      cancel: function (ch) { delete subs[ch]; delete pending[ch]; if (worker) worker.postMessage({ cancel: ch }); else if (local) local.cancel(ch); },
      worker: function () { return !!worker; }
    };
  }

  /* one client for the whole page (guide.js and finder.js share it); the addresses come from data- attributes on the lab */
  var sharedClient = null;
  function shared() {
    if (sharedClient) return sharedClient;
    var el = typeof document !== 'undefined' && document.getElementById('magnetic-bottles-lab'), u = null;
    function abs(x) { try { return new URL(x, root.location.href).href; } catch (e) { return x; } }
    if (el && el.dataset && el.dataset.worker) u = { worker: abs(el.dataset.worker), physics: abs(el.dataset.physics), explore: abs(el.dataset.explore) };
    return (sharedClient = client(u));
  }

  var api = { shared: shared, SET: SET, spec: spec, keys: keys, dmax: dmax, deltaTop: deltaTop, lo: lo, hi: hi, valid: valid, snap: snap, copy: copy,
    metrics: metrics, edgeB: edgeB, gap: gap, iotaAxis2: iotaAxis2, OUT: OUT, GOALS: GOALS, QP: QP, QM: QM, ALL: ALL, nudgeStep: nudgeStep,
    mapRange: mapRange, jobs: jobs, nelderMead: nelderMead, halton: halton, runner: runner, client: client, outOf: outOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MBExplore = api;
})(typeof self !== 'undefined' ? self : this);
