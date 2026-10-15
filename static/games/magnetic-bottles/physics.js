/* Magnetic Bottles (/games/magnetic-bottles/): the two families of exact 3-D ideal-MHD equilibria without
   stellarator symmetry from O. Issan, J. Citrin, M. Landreman and B. Tracey, arXiv:2610.07304 (2026).
   Everything is in the paper's dimensionless units, with mu0 = 1, so J = curl B and J x B = grad p.
   Browser: window.MagBottles. Node: module.exports.

   A model m = MagBottles.make('f1' | 'f2', params) has:
     m.B(x, y, z, out)     magnetic field (out = [Bx, By, Bz])
     m.psi(x, y, z)        flux label: 0 on the magnetic axis, delta on the boundary
     m.Q(x, y, z)          the potential with (B.grad)B = -grad Q
     m.kp                  p = p_a - kp * psi
     m.surf(r, th, ze, o)  the point on the surface psi = r^2 delta at poloidal angle th and toroidal angle ze
     m.line(r, th0, n)     a field line on psi = r^2 delta (flat array x, y, z, ...)
     m.volume, m.betaV     volume inside the boundary and volume-averaged beta (edge pressure p_b = 0)
     m.iota(r)             rotational transform on psi = r^2 delta
     m.dmax                nested tori need 0 < delta < dmax                                       */
(function (root) {
  'use strict';
  var PI = Math.PI, TAU = 2 * PI;

  /* ---------- family 1: the stretched asymmetric Solov'ev equilibrium, iota = 2 ---------- */
  function fam1(P) {
    var eps = P.eps, t = P.tau, d = P.delta;
    var a = Math.sqrt(1 + eps), b = Math.sqrt(1 - eps), O2 = 1 - t * t, O = Math.sqrt(O2);
    var zc = -t / (2 * O2), gam = Math.asin(t), ua = -O2 * eps / 2, rd = Math.sqrt(d);
    var C0 = -1 + t * t / (2 * O2) + O2 * eps * eps / 2, tmp = [0, 0, 0];
    function B(x, y, z, o) {
      var s = x * x / (a * a) + y * y / (b * b), u = 1 - s;
      var F = Math.sqrt(1 - u * u - 4 * z * z - 4 * t * s * z), g = 2 * z + t * s;
      o[0] = (g * x - a * F * y / b) / s;
      o[1] = (g * y + b * F * x / a) / s;
      o[2] = 1 - s - 2 * t * z;
      return o;
    }
    function Q(x, y, z) { return O2 / 2 * (x * x + y * y + 4 * z * z) + 2 * t * z; }
    function psi(x, y, z) {
      B(x, y, z, tmp);
      return O2 / 2 * (Q(x, y, z) + 0.5 * (tmp[0] * tmp[0] + tmp[1] * tmp[1] + tmp[2] * tmp[2]) + C0);
    }
    /* the field-line coordinates: (u, v) is fixed along a field line, and Omega dx/dze = B */
    function map(u, v, ze, o) {
      var L = Math.sqrt((1 + Math.sqrt(1 - 4 * (u * u + v * v))) / 2), c = Math.cos(ze), s = Math.sin(ze);
      o[0] = a / O * (L * c + (u * c + v * s) / L);
      o[1] = b / O * (L * s + (v * c - u * s) / L);
      o[2] = zc + (v * Math.cos(2 * ze + gam) - u * Math.sin(2 * ze + gam)) / O2;
      return o;
    }
    function surf(r, th, ze, o) { return map(ua + r * rd * Math.cos(th), r * rd * Math.sin(th), ze, o); }
    function line(r, th0, n) {
      var out = new Float64Array(3 * (n + 1)), p = [0, 0, 0];
      for (var i = 0; i <= n; i++) { surf(r, th0, TAU * i / n, p); out[3 * i] = p[0]; out[3 * i + 1] = p[1]; out[3 * i + 2] = p[2]; }
      return out;
    }
    var B2avg = 1 - O2 * eps * eps / 2 + d / O2;
    return {
      fam: 'f1', P: P, B: B, Q: Q, psi: psi, map: map, surf: surf, line: line, kp: 2 / O2, delta: d,
      dmax: (1 - O2 * eps) * (1 - O2 * eps) / 4, Omega: O, zc: zc, ua: ua,
      volume: 2 * PI * PI * Math.sqrt(1 - eps * eps) * d / (O2 * O),
      betaV: 2 * (d / O2) / B2avg, B2avg: B2avg, pAxis: 2 * d / O2,
      iota: function () { return 2; },
      axis: function (ze, o) {
        o[0] = Math.sqrt((1 + eps) * (1 - O2 * eps)) / O * Math.cos(ze);
        o[1] = Math.sqrt((1 - eps) * (1 + O2 * eps)) / O * Math.sin(ze);
        o[2] = zc + eps / 2 * Math.sin(2 * ze + gam);
        return o;
      }
    };
  }

  /* ---------- family 2: the complex-phase equilibrium with sheared iota ---------- */
  function fam2(P) {
    var eps = P.eps, S = P.S, lam = P.lam, t1 = P.tau, d = P.delta, sh = PI / 2 - S;
    var cw = [0, 0];
    /* K = conj(w) sqrt(1 + eps / conj(w)^2), principal square root; returns [Re K, Im K] */
    function Kof(x, y, o) {
      var ur = x * x - y * y, ui = -2 * x * y, m2 = ur * ur + ui * ui;
      var tr = 1 + eps * ur / m2, ti = -eps * ui / m2;           // 1 + eps / conj(w)^2
      var m = Math.sqrt(tr * tr + ti * ti), sr = Math.sqrt((m + tr) / 2), si = (ti < 0 ? -1 : 1) * Math.sqrt((m - tr) / 2);
      o[0] = x * sr + y * si; o[1] = x * si - y * sr;             // (x - i y)(sr + i si)
      return o;
    }
    var kk = [0, 0];
    function parts(x, y, z, o) {
      Kof(x, y, kk);
      var Kr = kk[0], Ki = kk[1];
      var Xr = x * Kr - y * Ki + sh, Xi = x * Ki + y * Kr + t1;  // Xi = w K + pi/2 - S + i tau1
      var cr = Math.cos(Xr), sr = Math.sin(Xr), ch = Math.cosh(Xi), shh = Math.sinh(Xi);
      var sinr = sr * ch, sini = cr * shh, cosr = cr * ch, cosi = -sr * shh;
      var k2 = Kr * Kr + Ki * Ki;
      // W = i sin(Xi) / (2K) = i sin(Xi) conj(K) / (2|K|^2)
      var nr = sinr * Kr + sini * Ki, ni = sini * Kr - sinr * Ki;  // sin(Xi) conj(K)
      var Wr = -ni / (2 * k2), Wi = nr / (2 * k2);
      var el = Math.cos(lam * z), es = -Math.sin(lam * z);       // e^{-i lam z}
      o[0] = el * Wr - es * Wi; o[1] = el * Wi + es * Wr;
      o[2] = (el * cosr - es * cosi) / lam;
      o[3] = Wr * Wr + Wi * Wi;
      return o;
    }
    var pp = [0, 0, 0, 0];
    function B(x, y, z, o) { parts(x, y, z, pp); o[0] = pp[0]; o[1] = pp[1]; o[2] = pp[2]; return o; }
    function Q(x, y, z) { parts(x, y, z, pp); var s = Math.sin(lam * z); return -pp[3] / 2 + s * s / (2 * lam * lam); }
    function psi(x, y, z) { parts(x, y, z, pp); var s = Math.sin(lam * z); return (s * s + lam * lam * pp[2] * pp[2]) / 2; }
    /* elliptic coordinates: x = a_c cos ze, y = b_c sin ze, with sigma = a_c b_c = Re(w K) and Im(w K) = eps sin(2 ze) / 2 */
    function ell(sig, ze, o) {
      var h = Math.sqrt(4 * sig * sig + eps * eps);
      o[0] = Math.sqrt((h - eps) / 2) * Math.cos(ze); o[1] = Math.sqrt((h + eps) / 2) * Math.sin(ze);
      return o;
    }
    /* the surface psi = r^2 delta, with poloidal angle chi defined by (lam Bz, -sin lam z) = sqrt(2 psi) (-cos chi, sin chi) */
    function xiOf(q, chi, ze) {
      var sl = -q * Math.sin(chi), cl = Math.sqrt(1 - sl * sl), nu = eps * Math.sin(2 * ze) / 2 + t1;
      var A = Math.cosh(nu) * cl, Bc = Math.sinh(nu) * sl;
      return Math.asin(q * Math.cos(chi) / Math.sqrt(A * A + Bc * Bc)) - Math.atan2(Bc, A);
    }
    function surf(r, chi, ze, o) {
      var q = r * Math.sqrt(2 * d), sl = -q * Math.sin(chi);
      ell(S + xiOf(q, chi, ze), ze, o);
      o[2] = Math.asin(sl) / lam;
      return o;
    }
    /* the rotational transform from the field-line equation for chi along ze (paper, Sec. 4) */
    function dchi(q, chi, ze) {
      var sig = S + xiOf(q, chi, ze), h = Math.sqrt(4 * sig * sig + eps * eps), nu = eps * Math.sin(2 * ze) / 2 + t1;
      var c = Math.cosh(nu), sn = Math.sin(chi);
      return (h + eps * Math.cos(2 * ze)) * Math.sqrt((1 - q * q * sn * sn) / (c * c - q * q));
    }
    /* iota = average of d chi / d ze. The equation repeats every pi in ze, so follow chi over N such periods and
       average the step per period with smooth weights (a weighted Birkhoff average, which converges much faster
       than a plain average). */
    var iotaCache = {};
    function iota(r, N, steps) {
      N = N || 200; steps = steps || 32;
      var key = r + ':' + N + ':' + steps; if (iotaCache[key] !== undefined) return iotaCache[key];
      var q = r * Math.sqrt(2 * d), chi = 0, hs = PI / steps, sw = 0, sg = 0;
      for (var n = 0; n < N; n++) {
        var c0 = chi, ze = 0;
        for (var i = 0; i < steps; i++) {
          var k1 = dchi(q, chi, ze), k2 = dchi(q, chi + hs / 2 * k1, ze + hs / 2), k3 = dchi(q, chi + hs / 2 * k2, ze + hs / 2), k4 = dchi(q, chi + hs * k3, ze + hs);
          chi += hs / 6 * (k1 + 2 * k2 + 2 * k3 + k4); ze += hs;
        }
        var tt = (n + 0.5) / N, w = Math.exp(-1 / (tt * (1 - tt)));
        sw += w; sg += w * (chi - c0);
      }
      return (iotaCache[key] = sg / sw / PI);
    }
    /* a field line: RK4 on dx/ds = B/|B| from the surface point (r, chi0, ze = 0), for `transits` turns around the torus */
    function trace(r, chi0, transits, ds, every) {
      var p = surf(r, chi0, 0, [0, 0, 0]), x = p[0], y = p[1], z = p[2], k = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
      var pts = [x, y, z], phi = Math.atan2(y, x), phi0 = phi, praw = phi, goal = TAU * transits, n = 0, b = [0, 0, 0];
      function f(X, Y, Z, o) { B(X, Y, Z, b); var m = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]); o[0] = b[0] / m; o[1] = b[1] / m; o[2] = b[2] / m; }
      f(x, y, z, k[0]);
      var dir = (x * k[0][1] - y * k[0][0]) >= 0 ? 1 : -1;      // follow the field the way it goes around the torus
      var h = dir * ds;
      while (n < 400000) {
        f(x, y, z, k[0]);
        f(x + h / 2 * k[0][0], y + h / 2 * k[0][1], z + h / 2 * k[0][2], k[1]);
        f(x + h / 2 * k[1][0], y + h / 2 * k[1][1], z + h / 2 * k[1][2], k[2]);
        f(x + h * k[2][0], y + h * k[2][1], z + h * k[2][2], k[3]);
        x += h / 6 * (k[0][0] + 2 * k[1][0] + 2 * k[2][0] + k[3][0]);
        y += h / 6 * (k[0][1] + 2 * k[1][1] + 2 * k[2][1] + k[3][1]);
        z += h / 6 * (k[0][2] + 2 * k[1][2] + 2 * k[2][2] + k[3][2]);
        var ph = Math.atan2(y, x), dp = ph - praw; praw = ph; if (dp > PI) dp -= TAU; if (dp < -PI) dp += TAU; phi += dp; n++;
        if (n % every === 0) pts.push(x, y, z);
        if (Math.abs(phi - phi0) >= goal) { pts.push(x, y, z); break; }
      }
      return new Float64Array(pts);
    }
    function line(r, th0, n, transits) { return trace(r, th0, transits || 3, 0.01, 4); }
    /* volume, <psi>, <|B_perp|^2>, <(lam Bz)^2> by quadrature over (xi, ze) with the z-integral done exactly */
    function averages(nx, nz) {
      nx = nx || 64; nz = nz || 96;
      var xb = Math.asin(Math.sqrt(2 * d)), V = 0, Ipsi = 0, IW = 0, IX = 0;
      for (var j = 0; j < nz; j++) {
        var ze = TAU * (j + 0.5) / nz, nu = eps * Math.sin(2 * ze) / 2 + t1, ch = Math.cosh(nu), c2 = ch * ch, sh2 = c2 - 1, ce = eps * Math.cos(2 * ze);
        for (var i = 0; i < nx; i++) {
          var th = -PI / 2 + PI * (i + 0.5) / nx, xi = xb * Math.sin(th), w = xb * Math.cos(th) * (PI / nx) * (TAU / nz);
          var s1 = Math.sin(xi), s2 = s1 * s1, c1 = Math.cos(xi), h = Math.sqrt(4 * (S + xi) * (S + xi) + eps * eps);
          var arg = (2 * d - s2) / (c2 - s2); if (arg <= 0) continue;
          var U = Math.asin(Math.sqrt(Math.min(1, arg))), J = (h + ce) / (2 * h) * w / lam;
          var al = s2 * c2, be = s1 * c1 * ch * Math.sinh(nu), ga = c1 * c1 * sh2 + 1, hc = (al - ga) / 2, R = Math.sqrt(hc * hc + be * be);
          var cos2t0 = R > 0 ? -hc / R : 1, s2U = Math.sin(2 * U);
          var Lz = 2 * U;                                                   // length in lam z
          var Ip = (s2 * (U + s2U / 2) + c2 * (U - s2U / 2)) / 2;          // integral of psi over lam z
          var Is = U - cos2t0 * s2U / 2;                                    // integral of sin^2(lam z)
          V += J * Lz; Ipsi += J * Ip; IX += J * (2 * Ip - Is);
          IW += J * Lz * (c1 * c1 + sh2) / (2 * (h + ce));
        }
      }
      var M = Ipsi / V, A = IW / V, C = IX / V;
      return { V: V, M: M, A: A, C: C, B2avg: A + C / (lam * lam), betaV: 2 * (d - M) / (lam * lam * A + C) };
    }
    var av = null;
    var m = {
      fam: 'f2', P: P, B: B, Q: Q, psi: psi, surf: surf, line: line, trace: trace, kp: 1 / (lam * lam), delta: d,
      dmax: 0.5 * Math.pow(Math.sin(Math.min(S, PI / 2)), 2), Kof: Kof, ell: ell, dchi: dchi, averages: averages,
      pAxis: d / (lam * lam), iota: iota,
      axis: function (ze, o) { ell(S, ze, o); o[2] = 0; return o; },
      chiZeta: function (x, y, z, o) {                                 // (chi, ze) of a point, for tests
        parts(x, y, z, pp); Kof(x, y, cw);
        var sig = x * cw[0] - y * cw[1], h = Math.sqrt(4 * sig * sig + eps * eps);
        o[0] = Math.atan2(-Math.sin(lam * z), -lam * pp[2]); o[1] = Math.atan2(y / Math.sqrt((h + eps) / 2), x / Math.sqrt((h - eps) / 2));
        return o;
      }
    };
    Object.defineProperty(m, 'volume', { get: function () { return (av = av || averages()).V; } });
    Object.defineProperty(m, 'betaV', { get: function () { return (av = av || averages()).betaV; } });
    Object.defineProperty(m, 'B2avg', { get: function () { return (av = av || averages()).B2avg; } });
    return m;
  }

  /* a small seeded random generator (mulberry32) */
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ---------- checks by central differences at random points inside the plasma ---------- */
  function check(m, n, seed, step) {
    var rnd = rng(seed || 12345);
    var p = [0, 0, 0], q0 = m.surf(0, 0, 0, [0, 0, 0]), q1 = m.surf(1, 0, 0, [0, 0, 0]);
    var h = step || 1e-5 * Math.hypot(q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]);
    var bp = [0, 0, 0], bm = [0, 0, 0], b0 = [0, 0, 0], G = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    var gp = [0, 0, 0], gq = [0, 0, 0], res = { div: 0, force: 0, lorentz: 0, bpsi: 0, n: n, h: h };
    for (var k = 0; k < n; k++) {
      var r = Math.sqrt(0.04 + 0.96 * rnd());
      m.surf(r, TAU * rnd(), TAU * rnd(), p);
      var x = p[0], y = p[1], z = p[2];
      m.B(x, y, z, b0);
      for (var j = 0; j < 3; j++) {
        var e = [0, 0, 0]; e[j] = h;
        m.B(x + e[0], y + e[1], z + e[2], bp); m.B(x - e[0], y - e[1], z - e[2], bm);
        for (var i = 0; i < 3; i++) G[i][j] = (bp[i] - bm[i]) / (2 * h);       // G[i][j] = dB_i / dx_j
        gp[j] = (m.psi(x + e[0], y + e[1], z + e[2]) - m.psi(x - e[0], y - e[1], z - e[2])) / (2 * h);
        gq[j] = (m.Q(x + e[0], y + e[1], z + e[2]) - m.Q(x - e[0], y - e[1], z - e[2])) / (2 * h);
      }
      var gn = 0; for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) gn += G[i][j] * G[i][j]; gn = Math.sqrt(gn);
      var Bm = Math.sqrt(b0[0] * b0[0] + b0[1] * b0[1] + b0[2] * b0[2]);
      var Jx = G[2][1] - G[1][2], Jy = G[0][2] - G[2][0], Jz = G[1][0] - G[0][1];
      var fx = Jy * b0[2] - Jz * b0[1], fy = Jz * b0[0] - Jx * b0[2], fz = Jx * b0[1] - Jy * b0[0];
      var dpx = -m.kp * gp[0], dpy = -m.kp * gp[1], dpz = -m.kp * gp[2];
      var lx = G[0][0] * b0[0] + G[0][1] * b0[1] + G[0][2] * b0[2] + gq[0];
      var ly = G[1][0] * b0[0] + G[1][1] * b0[1] + G[1][2] * b0[2] + gq[1];
      var lz = G[2][0] * b0[0] + G[2][1] * b0[1] + G[2][2] * b0[2] + gq[2];
      var Fs = gn * Bm, gpn = Math.sqrt(gp[0] * gp[0] + gp[1] * gp[1] + gp[2] * gp[2]);
      res.div = Math.max(res.div, Math.abs(G[0][0] + G[1][1] + G[2][2]) / gn);
      res.force = Math.max(res.force, Math.hypot(fx - dpx, fy - dpy, fz - dpz) / Fs);
      res.lorentz = Math.max(res.lorentz, Math.hypot(lx, ly, lz) / Fs);
      res.bpsi = Math.max(res.bpsi, Math.abs(b0[0] * gp[0] + b0[1] * gp[1] + b0[2] * gp[2]) / (Bm * gpn));
    }
    return res;
  }
  /* how far the drawn surfaces are from the flux surface they claim to be: max |psi / (r^2 delta) - 1| */
  function surfErr(m, nr, nt, nz) {
    var p = [0, 0, 0], e = 0;
    for (var a = 1; a <= nr; a++) {
      var r = a / nr;
      for (var i = 0; i < nt; i++) for (var j = 0; j < nz; j++) {
        m.surf(r, TAU * i / nt, TAU * j / nz, p);
        e = Math.max(e, Math.abs(m.psi(p[0], p[1], p[2]) / (r * r * m.delta) - 1));
      }
    }
    return e;
  }

  /* stellarator symmetry is a half turn about the x axis: (x, y, z) -> (x, -y, -z). mirrorGap turns the boundary over and
     measures the largest distance from the turned copy to the real boundary (0 when the shape is stellarator symmetric),
     and the mean distance from the axis to the boundary for scale. */
  function mirrorGap(m, nt, nz, mt, mz) {
    nt = nt || 24; nz = nz || 64; mt = mt || 10; mz = mz || 32;
    var N = nt * nz, X = new Float64Array(N), Y = new Float64Array(N), Z = new Float64Array(N), p = [0, 0, 0], q = [0, 0, 0], ax = [0, 0, 0], minor = 0;
    for (var i = 0; i < nt; i++) for (var j = 0; j < nz; j++) {
      var k = i * nz + j; m.surf(1, TAU * i / nt, TAU * j / nz, p); X[k] = p[0]; Y[k] = p[1]; Z[k] = p[2];
      m.surf(0, 0, TAU * j / nz, ax); minor += Math.hypot(p[0] - ax[0], p[1] - ax[1], p[2] - ax[2]) / N;
    }
    var gap = 0, h = 1e-6, pa = [0, 0, 0], pb = [0, 0, 0], mx = 0, my = 0, mzz = 0;
    function d2(th, ze) { m.surf(1, th, ze, pa); return (pa[0] - mx) * (pa[0] - mx) + (pa[1] - my) * (pa[1] - my) + (pa[2] - mzz) * (pa[2] - mzz); }
    function descend(th, ze) {                               // Gauss-Newton with step halving: closest point on the boundary
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
    for (var a = 0; a < mt; a++) for (var b = 0; b < mz; b++) {
      var tha = TAU * (a + 0.37) / mt, zeb = TAU * (b + 0.21) / mz;
      m.surf(1, tha, zeb, q); mx = q[0]; my = -q[1]; mzz = -q[2];
      var best = 1e300, bk = 0;
      for (k = 0; k < N; k++) { var dd = (X[k] - mx) * (X[k] - mx) + (Y[k] - my) * (Y[k] - my) + (Z[k] - mzz) * (Z[k] - mzz); if (dd < best) { best = dd; bk = k; } }
      var res = descend(TAU * Math.floor(bk / nz) / nt, TAU * (bk % nz) / nz);
      /* second start: a half turn about the x axis sends the toroidal angle ze to about -ze; scan the poloidal angle there */
      var bt = 0, bd = 1e300;
      for (var c = 0; c < 48; c++) { var dc = d2(TAU * c / 48, -zeb); if (dc < bd) { bd = dc; bt = TAU * c / 48; } }
      res = Math.min(res, best, descend(bt, -zeb));
      gap = Math.max(gap, Math.sqrt(res));
    }
    return { gap: gap, minor: minor };
  }
  /* points of the surface psi = r^2 delta in the half-plane at toroidal angle phi, as [R0, z0, R1, z1, ...] */
  function section(m, r, phi, n) {
    var out = new Float64Array(2 * n), p = [0, 0, 0], c = Math.cos(phi), s = Math.sin(phi);
    for (var i = 0; i < n; i++) {
      var th = TAU * i / n, ze = phi, f = 1;
      for (var it = 0; it < 40; it++) {                      // Newton on the toroidal angle of the point
        m.surf(r, th, ze, p); f = Math.atan2(p[1] * c - p[0] * s, p[0] * c + p[1] * s);
        if (Math.abs(f) < 1e-12) break;
        m.surf(r, th, ze + 1e-6, p); var f2 = Math.atan2(p[1] * c - p[0] * s, p[0] * c + p[1] * s), df = (f2 - f) / 1e-6;
        var stp = -f / (df || 1); if (stp > 0.5) stp = 0.5; if (stp < -0.5) stp = -0.5; ze += stp;
      }
      m.surf(r, th, ze, p);
      var R = p[0] * c + p[1] * s, ok = Math.abs(f) < 1e-8 && R > 0;   // a point the solver could not place is left out (NaN)
      out[2 * i] = ok ? R : NaN; out[2 * i + 1] = ok ? p[2] : NaN;
    }
    return out;
  }

  function make(fam, P) { return fam === 'f1' ? fam1(P) : fam2(P); }
  var api = { make: make, fam1: fam1, fam2: fam2, check: check, surfErr: surfErr, mirrorGap: mirrorGap, section: section, rng: rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MagBottles = api;
})(typeof window !== 'undefined' ? window : this);
