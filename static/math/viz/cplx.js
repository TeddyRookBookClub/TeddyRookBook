/* Math Ladder visuals for Complex Analysis (course key cplx). Registered on window.MathLadder.viz; needs viz/core.js and
   the CAS (homeschool/calc/cas.js) for reading formulas; looks best with viz/adv.css, which these pages load. Styles for
   these visuals are injected below. Expressions use the CAS's plain syntax in z ("z^2+1", "exp(i*z)/(z^2+1)",
   "(z-i)/(z+i)"); i, e and pi are constants. log and ln are the principal natural logarithm Log (cut on the negative real
   axis), sqrt is the principal square root, z^c for a non-integer c is the principal power e^(c Log z). x and y stand for
   Re z and Im z, so non-analytic maps such as "conj(z)" or "x+2i*y" can be drawn too. Complex numbers in options are
   [re, im] pairs (a plain number means a real number).

   Shared options: task (an instruction line above the picture, HTML and $math$ allowed), label (the aria-label),
   height (px), edit: false (a still picture: no dragging, sliders or buttons), quiet: true (or readout: false: hides
   every value the visual works out, so a picture can sit inside a problem; each visual says what quiet hides).
   Keyboard: focus a picture (Tab); arrow keys move the selected handle (Shift for bigger steps); Enter or N selects
   the next handle.

   cplx-mapping   Two planes, z and w = f(z) (side by side, stacked on phones). A grid or a region in the z-plane and its
                  image; a point z0 you drag, with w0 = f(z0).
     opts: f: "z^2"            "z^2", "1/z", "exp", "log", "sin", "mobius" (with coeffs) or any expression in z
           coeffs: {"a": [1, 0], "b": [0, 0], "c": [1, 0], "d": [1, 0]}   for f: "mobius", w = (az + b)/(cz + d)
           shape: "grid"       or a region: {"type": "disk", "c": [0, 0], "r": 1} | {"type": "annulus", "c", "r0", "r1"} |
                               {"type": "sector", "c": [0, 0], "r0": 0, "r1": 2, "t0": 0, "t1": 1.5708} |
                               {"type": "strip", "y0": 0, "y1": 3.14159, "x0": -3, "x1": 3} (a horizontal strip; or "x0",
                               "x1" alone for a vertical one) | {"type": "halfplane", "side": "upper" | "lower" | "right" |
                               "left", "at": 0} | {"type": "rect", "x0", "x1", "y0", "y1"} | {"type": "line", "p": [0, 0],
                               "q": [1, 1]} (the whole line through p and q) | {"type": "circle", "c": [0, 0], "r": 1}
           grid: true          the coordinate grid and its image (default true when shape is "grid", else false)
           z0: [1, 1]          the draggable point (null: none)
           zoom: false         a small square at z0 (one red edge, so a flip shows) and its image; the readout gives
                               |f′(z0)| and arg f′(z0), or says that f is not complex differentiable at z0
           h: 0.3              the side of that square
           angles: false       two segments through z0 at the angles in rays: [0, 0.7854] and their images, with the angle
                               between them before and after
           points3: false      a Möbius map fixed by three points: drag z1, z2, z3 (opts.zs) in the z-plane; they go to
                               opts.ws (default 0, 1 and ∞; write "inf" for ∞); the formula, the image of the grid and of
                               a test point z0 are shown
           window: {"x": [-3, 3], "y": [-3, 3]}   the z-plane;   wwindow: the w-plane (default: the same)
           Quiet hides w0, the description of the image, |f′| and arg f′, and the Möbius formula.

   cplx-domaincolor   Domain coloring: each point z is colored by arg f(z) (red where f is positive real, then yellow,
                  green, cyan, blue, magenta counterclockwise) with brightness rings where |f| crosses a power of 2. Around
                  a zero the colors run once counterclockwise per order, around a pole clockwise; a branch cut is a seam
                  where the colors jump.
     opts: f: "z^2-1"   window: {"x": [-3, 3], "y": [-3, 3]}   rings: true
           marks: [{"z": [1, 0], "kind": "zero" | "pole" | "essential" | "removable", "order": 1}]   labeled marks
           cut: false          true marks the negative real axis as a cut (dashed); or {"from": [0, 0], "angle": 3.1416}
           disk: null          {"c": [0, 0], "r": 1}: draws the closed disk and marks where |f| is largest on it
           probe: true         a draggable probe with z, f(z), |f(z)| and arg f(z)
           overlay: false      two small graphs under the picture: |f(x)| along the real axis and |f(iy)| up the imaginary axis
           Quiet hides the formula, the probe values, the marks and the location of the maximum.

   cplx-branch    Following arg and log around the origin. Drag z (or press "Go around once"): a continuous argument that
                  grows by 2π each lap, beside the principal value Arg z in (−π, π], which jumps at the cut (red ray).
     opts: z: [-1, 0.5]   mode: "arg" | "log" | "power" | "product"
           c: "1/3"            the exponent for mode "power" ("1/3", "1/2", "2/3", "i", …): all values of z^c, principal circled
           w: [1, 1]           the second number for mode "product" (z, w and zw, Arg z + Arg w against Arg(zw))
           cut: 3.14159        the angle of the cut ray: the branch takes arguments in (cut − 2π, cut]; π is the principal one
           rungs: 2            mode "log": the values ln|z| + i(θ + 2πk) for k = −rungs … rungs
           Quiet hides the values of Arg, arg, the logarithms and the powers (the picture stays).

   cplx-contour   Contours, singular points and residues. The integral of f along the contour is computed numerically and
                  shown beside 2πi × (sum of the residues inside). Drag the contour: the value only changes when a
                  singular point crosses it.
     opts: f: "1/(z^2+1)"
           poles: [{"z": [0, 1], "order": 1}]   singular points (found automatically when f is rational in z, or a
                               rational function times exp, sin or cos of a polynomial)
           contour: {"type": "circle", "c": [0, 0], "r": 2, "dir": 1} | {"type": "rect", "x0", "x1", "y0", "y1"} |
                    {"type": "halfdisk", "R": 3} (upper half-disk: the segment [−R, R], then the arc) |
                    {"type": "segment", "a": [0, 0], "b": [1, 1]} | {"type": "arc", "c": [0, 0], "r": 1, "t0": 0, "t1": 3.1416} |
                    {"type": "path", "pts": [[x, y], …], "closed": true}
           drag: true          drag the contour (its center, radius, corners or points)
           parts: false        halfdisk: the segment and the arc separately, with the ML bound for the arc
           zprime: false       a toggle that leaves out z′(t), to show the wrong value it gives
           residues: true      label the residues of the poles inside
           mode: "integral" | "trig"   trig: the integrand g(cos θ, sin θ) with letters c and s (g: "1/(5+3c)"); the unit
                               circle z = e^(iθ) with θ on a slider; the integral over 0…2π and the residues of
                               g/(iz) inside the unit circle (give poles)
           window: {"x": [-3, 3], "y": [-3, 3]}
           Quiet hides the numerical value, the prediction and the residues (the contour and the singular points stay).

   cplx-series    Disks and annuli of convergence. Singular points, a center a you drag, the largest disk around a that
                  avoids them, and the error |f − S_N| of the partial sum shaded (dark green where S_N is accurate).
     opts: f: "1/(1+z^2)" (rational functions, exp, sin, cos, log(1+z), …)   a: [0, 0]   N: 6
           sing: [[0, 1], [0, -1]]   singular points (found automatically for rational f)
           mode: "taylor" | "laurent"   ring: 0 (laurent: which annulus, counted from the center: 0 is the punctured disk)
           real: false         a graph of f(x) and S_N(x) on the real line under the picture (a real a)
           terms: true         list the first terms of the series
           window: {"x": [-3, 3], "y": [-3, 3]}
           Quiet hides the radius, the ring's radii and the series terms.

   cplx-winding   The argument principle. A circle C (drag its center and its edge), the zeros (dots) and poles (crosses)
                  of f, and in the w-plane the image f(C) with a counter of its turns around 0, which equals zeros minus
                  poles inside C, counted with multiplicity.
     opts: f: "z^3-2z+1"   g: "z/2" (mode "rouche": f and f + g, a walker and a dog on a leash of length |g|)
           C: {"c": [0, 0], "r": 1}   mode: "argument" | "rouche"   trace: true (animate a point going around)
           zeros, poles: [[x, y], …] (found automatically for polynomial or rational f)
           window: {"x": [-3, 3], "y": [-3, 3]}   wwindow: the w-plane (default: fit to the image)
           Quiet hides the winding count, the counts inside C and the marks of zeros and poles inside C.          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, PI = M.PI, TAU = 2 * PI;

  // ================================================================ complex arithmetic on [re, im]
  function cadd(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function csub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function cdiv(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function cscale(k, a) { return [k * a[0], k * a[1]]; }
  function cabs(a) { return M.hypot(a[0], a[1]); }
  function Arg(a) { if (a[1] === 0 && a[0] < 0) return PI; return M.atan2(a[1], a[0]); } // in (−π, π]
  function cexp(a) { var r = M.exp(a[0]); return [r * M.cos(a[1]), r * M.sin(a[1])]; }
  function clog(a) { return [M.log(cabs(a)), Arg(a)]; }
  function cpowi(a, n) { var r = [1, 0], b = a, k = M.abs(n); while (k) { if (k & 1) r = cmul(r, b); b = cmul(b, b); k >>= 1; } return n < 0 ? cdiv([1, 0], r) : r; }
  function cpow(a, b) {
    if (b[1] === 0 && Number.isInteger(b[0]) && M.abs(b[0]) <= 64) return cpowi(a, b[0]);
    if (a[0] === 0 && a[1] === 0) return b[0] > 0 ? [0, 0] : [NaN, NaN];
    return cexp(cmul(b, clog(a)));
  }
  function csqrt(a) { var r = cabs(a), x = M.sqrt(M.max(0, (r + a[0]) / 2)), y = M.sqrt(M.max(0, (r - a[0]) / 2)); return [x, a[1] < 0 ? -y : y]; }
  function csin(a) { return [M.sin(a[0]) * M.cosh(a[1]), M.cos(a[0]) * M.sinh(a[1])]; }
  function ccos(a) { return [M.cos(a[0]) * M.cosh(a[1]), -M.sin(a[0]) * M.sinh(a[1])]; }
  function csinh(a) { return [M.sinh(a[0]) * M.cos(a[1]), M.cosh(a[0]) * M.sin(a[1])]; }
  function ccosh(a) { return [M.cosh(a[0]) * M.cos(a[1]), M.sinh(a[0]) * M.sin(a[1])]; }
  function fin(a) { return isFinite(a[0]) && isFinite(a[1]); }
  function cx(v) { // an option value as a complex number: [re, im], a number, or a CAS string such as "1+2i"
    if (Array.isArray(v)) return [+v[0] || 0, +v[1] || 0];
    if (typeof v === 'number') return [v, 0];
    if (typeof v === 'string') { if (/^\s*-?inf(inity)?\s*$/i.test(v) || v === '∞') return [Infinity, Infinity]; try { var f = compile(v, []); var r = f(); if (fin(r)) return r; } catch (e) { } }
    return [0, 0];
  }
  var CF = { exp: cexp, ln: clog, log: clog, sqrt: csqrt, sin: csin, cos: ccos, sinh: csinh, cosh: ccosh,
    tan: function (a) { return cdiv(csin(a), ccos(a)); }, tanh: function (a) { return cdiv(csinh(a), ccosh(a)); },
    cbrt: function (a) { return cpow(a, [1 / 3, 0]); }, conj: function (a) { return [a[0], -a[1]]; }, abs: function (a) { return [cabs(a), 0]; },
    real: function (a) { return [a[0], 0]; }, imag: function (a) { return [a[1], 0]; }, arg: function (a) { return [Arg(a), 0]; } };
  function qnum(v) { return typeof v === 'number' ? v : Number(v.n) / Number(v.d); }
  function parseT(src) { var C = W.CAS; if (!C) throw new Error('viz/cplx.js needs the CAS (homeschool/calc/cas.js)'); var t = C.parse(String(src)); if (!t) throw new Error('empty formula'); return t; }
  /* compile(src, vars, params): a function of complex arguments [re, im] (one per name in vars) returning [re, im].
     With vars ['z'], the letters x and y read Re z and Im z. params: {letter: number or [re, im]} for other letters. */
  function compile(src, vars, params) {
    var t = typeof src === 'object' ? src : parseT(src); vars = vars || ['z']; params = params || {};
    function build(n) {
      var k, fs;
      switch (n.k) {
        case 'n': k = [qnum(n.v), 0]; return function () { return k; };
        case 's': {
          var nm = n.name, ix = vars.indexOf(nm);
          if (ix >= 0) return function (E) { return E[ix]; };
          if (nm === 'i') return function () { return [0, 1]; };
          if (nm === 'e') return function () { return [M.E, 0]; };
          if (nm === 'π' || nm === 'pi') return function () { return [PI, 0]; };
          if (vars.length && (nm === 'x' || nm === 'y') && vars.indexOf('x') < 0) { var j = nm === 'x' ? 0 : 1; return function (E) { return [E[0][j], 0]; }; }
          if (nm in params) { k = cx(params[nm]); return function () { return k; }; }
          throw new Error('unknown letter ' + nm);
        }
        case '+': fs = n.a.map(build); return function (E) { var s0 = 0, s1 = 0; for (var i = 0; i < fs.length; i++) { var v = fs[i](E); s0 += v[0]; s1 += v[1]; } return [s0, s1]; };
        case '*': fs = n.a.map(build); return function (E) { var r = fs[0](E); for (var i = 1; i < fs.length; i++) r = cmul(r, fs[i](E)); return r; };
        case '^': {
          var b = n.a[0], e = n.a[1], fb = build(b), fe = build(e);
          if (e.k === 'n') { var ev = qnum(e.v); if (Number.isInteger(ev)) return function (E) { return cpowi(fb(E), ev); }; }
          if (b.k === 's' && b.name === 'e') return function (E) { return cexp(fe(E)); };
          return function (E) { return cpow(fb(E), fe(E)); };
        }
        case 'f': {
          var g = CF[n.name]; if (!g) throw new Error('unknown function ' + n.name);
          var fa = build(n.a[0]); return function (E) { return g(fa(E)); };
        }
      }
      throw new Error('cannot read this formula');
    }
    var F = build(t);
    var out = function () { var E = new Array(arguments.length); for (var i = 0; i < arguments.length; i++) E[i] = arguments[i]; try { var r = F(E); return r; } catch (er) { return [NaN, NaN]; } };
    out.tree = t; return out;
  }
  var NAMED = { exp: 'exp(z)', log: 'log(z)', ln: 'log(z)', sin: 'sin(z)', cos: 'cos(z)', sqrt: 'sqrt(z)' };
  function fOf(o) { // the map of an options object: f (a name or an expression), with coeffs for "mobius"
    var s = o.f == null ? 'z^2' : String(o.f);
    if (s === 'mobius') { var c = o.coeffs || {}, a = cx(c.a || 1), b = cx(c.b || 0), cc = cx(c.c || 0), d = cx(c.d || 1); var f = function (z) { return cdiv(cadd(cmul(a, z), b), cadd(cmul(cc, z), d)); }; f.mob = [a, b, cc, d]; return f; }
    var g = compile(NAMED[s] || s, ['z'], o.params); return function (z) { return g(z); };
  }

  // ================================================================ polynomials with complex coefficients (low -> high)
  function padd(p, q) { var r = []; for (var i = 0; i < M.max(p.length, q.length); i++) r.push(cadd(p[i] || [0, 0], q[i] || [0, 0])); return r; }
  function pmul(p, q) { var r = []; for (var i = 0; i < p.length + q.length - 1; i++) r.push([0, 0]); p.forEach(function (a, i) { q.forEach(function (b, j) { r[i + j] = cadd(r[i + j], cmul(a, b)); }); }); return r; }
  function hasVar(n, v) { if (n.k === 's') return n.name === v || (v === 'z' && (n.name === 'x' || n.name === 'y')); return !!(n.a && n.a.some(function (m) { return hasVar(m, v); })); }
  function polyOf(n, v) { // the polynomial in v that the tree n is, or null
    if (!hasVar(n, v)) { var c = compile(n, [])(); return fin(c) ? [c] : null; }
    if (n.k === 's') return n.name === v ? [[0, 0], [1, 0]] : null;
    if (n.k === '+') { var s = [[0, 0]]; for (var i = 0; i < n.a.length; i++) { var p = polyOf(n.a[i], v); if (!p) return null; s = padd(s, p); } return s; }
    if (n.k === '*') { var m = [[1, 0]]; for (i = 0; i < n.a.length; i++) { p = polyOf(n.a[i], v); if (!p) return null; m = pmul(m, p); } return m; }
    if (n.k === '^' && n.a[1].k === 'n') { var e = qnum(n.a[1].v); if (Number.isInteger(e) && e >= 0 && e <= 30) { var b = polyOf(n.a[0], v); if (!b) return null; var r = [[1, 0]]; for (i = 0; i < e; i++) r = pmul(r, b); return r; } }
    return null;
  }
  function trim(p) { p = p.slice(); while (p.length > 1 && cabs(p[p.length - 1]) < 1e-14) p.pop(); return p; }
  function peval(p, z) { var r = [0, 0]; for (var i = p.length - 1; i >= 0; i--) r = cadd(cmul(r, z), p[i]); return r; }
  function roots(p) { // all roots of a polynomial (Durand–Kerner), grouped by multiplicity: [{z, m}]
    p = trim(p); var n = p.length - 1; if (n < 1) return [];
    var lead = p[n], q = p.map(function (c) { return cdiv(c, lead); }), R = 1 + M.max.apply(null, q.slice(0, n).map(cabs)), z = [];
    for (var i = 0; i < n; i++) z.push(cmul([R * 0.9, 0], cexp([0, TAU * i / n + 0.4])));
    for (var it = 0; it < 800; it++) {
      var mv = 0;
      for (i = 0; i < n; i++) { var den = [1, 0]; for (var j = 0; j < n; j++) if (j !== i) den = cmul(den, csub(z[i], z[j])); var dz = cdiv(peval(q, z[i]), den); if (fin(dz)) { z[i] = csub(z[i], dz); mv = M.max(mv, cabs(dz)); } }
      if (mv < 1e-15) break;
    }
    var out = [];
    z.forEach(function (w) { var hit = null; out.forEach(function (o) { if (cabs(csub(o.z, w)) < 2e-3 * M.max(1, cabs(w))) hit = o; }); if (hit) { hit.sum = cadd(hit.sum, w); hit.m++; hit.z = cscale(1 / hit.m, hit.sum); } else out.push({ z: w, m: 1, sum: w }); });
    return out.map(function (o) { return { z: [M.abs(o.z[0]) < 1e-9 ? 0 : o.z[0], M.abs(o.z[1]) < 1e-9 ? 0 : o.z[1]], m: o.m }; });
  }
  /* singular(src): the isolated singular points of an expression in z that the formula shows: zeros of polynomial
     denominators (poles, with order) and the poles of an exponent or of the argument of exp, sin, cos (essential). */
  function singular(src) {
    var out = [];
    function add(z, m, kind) { for (var i = 0; i < out.length; i++) if (cabs(csub(out[i].z, z)) < 1e-6) { if (kind === 'essential') out[i].kind = 'essential'; else if (out[i].kind === 'pole') out[i].order += m; return; } out.push({ z: z, order: m, kind: kind }); }
    function walk(n, ess) {
      if (!n || !n.k) return;
      if (n.k === '^' && n.a[1].k === 'n' && qnum(n.a[1].v) < 0 && Number.isInteger(qnum(n.a[1].v))) {
        var p = polyOf(n.a[0], 'z'); if (p) { roots(p).forEach(function (r) { add(r.z, r.m * -qnum(n.a[1].v), ess ? 'essential' : 'pole'); }); return; }
      }
      if (n.k === '^' && n.a[0].k === 's' && n.a[0].name === 'e') { walk(n.a[1], true); return; }
      if (n.k === 'f' && /^(exp|sin|cos|sinh|cosh)$/.test(n.name)) { walk(n.a[0], true); return; }
      if (n.a) n.a.forEach(function (m) { walk(m, ess); });
    }
    try { walk(typeof src === 'object' ? src : parseT(src), false); } catch (e) { }
    return out;
  }

  // ================================================================ contours as pieces z(t), z′(t), t in [0, 1]
  function seg(a, b) { return { z: function (t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }, dz: function () { return [b[0] - a[0], b[1] - a[1]]; } }; }
  function arc(c, r, t0, t1) { return { z: function (t) { var th = t0 + (t1 - t0) * t; return [c[0] + r * M.cos(th), c[1] + r * M.sin(th)]; }, dz: function (t) { var th = t0 + (t1 - t0) * t, k = (t1 - t0) * r; return [-k * M.sin(th), k * M.cos(th)]; } }; }
  var GX = [-0.9061798459386640, -0.5384693101056831, 0, 0.5384693101056831, 0.9061798459386640], GW = [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891];
  function integrate(f, pieces, n, noDz) { // ∫ f(z) dz along the pieces (composite 5-point Gauss); noDz: ∫ f(z(t)) dt instead
    var s = [0, 0]; n = n || 400;
    pieces.forEach(function (pc) { for (var i = 0; i < n; i++) for (var j = 0; j < 5; j++) { var t = (i + 0.5 + GX[j] / 2) / n, v = f(pc.z(t)); if (!noDz) v = cmul(v, pc.dz(t)); s = cadd(s, cscale(GW[j] / 2 / n, v)); } });
    return s;
  }
  function winding(pieces, p, n) { // net turns of the closed contour around p
    var tot = 0, prev = null; n = n || 600;
    pieces.forEach(function (pc) { for (var i = 0; i <= n; i++) { var z = pc.z(i / n), a = M.atan2(z[1] - p[1], z[0] - p[0]); if (prev !== null) { var d = a - prev; while (d > PI) d -= TAU; while (d < -PI) d += TAU; tot += d; } prev = a; } });
    return M.round(tot / TAU);
  }
  function residue(f, a, rho) { // (1/2πi)∮_{|z−a|=ρ} f dz by the trapezoid rule (spectrally accurate on a circle)
    var N = 512, s = [0, 0];
    for (var k = 0; k < N; k++) { var e = [M.cos(TAU * k / N), M.sin(TAU * k / N)], z = cadd(a, cscale(rho, e)); s = cadd(s, cmul(f(z), cscale(rho, e))); }
    return cscale(1 / N, s); // (1/2πi) Σ f(z) iρe^{iθ} (2π/N) = (1/N) Σ f(z) ρ e^{iθ}
  }
  function nearest(list, z, skip) { var d = Infinity; list.forEach(function (p) { if (p !== skip) d = M.min(d, cabs(csub(p.z || p, z))); }); return d; }

  // ---- number formatting (4 significant digits; small integers, fractions and multiples of π when they fit)
  function gcdN(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function nice(x) {
    if (!isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    if (M.abs(x) < 5e-10) return '0';
    for (var q = 1; q <= 12; q++) { if (q > 1 && [3, 6, 7, 9, 11, 12].indexOf(q) < 0) continue; var p = M.round(x * q); if (gcdN(p, q) === 1 && M.abs(p / q - x) < 1e-9 * M.max(1, M.abs(x)) && M.abs(p) < 1e6) return (p < 0 ? '−' : '') + M.abs(p) + (q === 1 ? '' : '/' + q); }
    var r = x / PI; for (q = 1; q <= 12; q++) { p = M.round(r * q); if (p && M.abs(p / q - r) < 1e-9 && M.abs(p) < 100) return (p < 0 ? '−' : '') + (M.abs(p) === 1 ? '' : M.abs(p)) + 'π' + (q === 1 ? '' : '/' + q); }
    var s = M.abs(x) >= 1e5 || M.abs(x) < 1e-3 ? x.toExponential(3).replace(/\.?0+e/, 'e') : String(+x.toPrecision(4));
    return s.replace('-', '−');
  }
  function cfmt(z) { // "3 − 2i", "0.5i", "1"
    if (!fin(z)) return cabs(z) === Infinity || isNaN(z[0]) ? '∞' : '—';
    var re = M.abs(z[0]) < 1e-5 * M.max(1e-4, cabs(z)) ? 0 : z[0], im = M.abs(z[1]) < 1e-5 * M.max(1e-4, cabs(z)) ? 0 : z[1];
    if (!im) return nice(re);
    var is = nice(M.abs(im)); is = (is === '1' ? '' : /\//.test(is) ? '(' + is + ')' : is) + 'i';
    if (!re) return (im < 0 ? '−' : '') + is;
    return nice(re) + (im < 0 ? ' − ' : ' + ') + is;
  }

  // exported for node tests and other pages
  ML.cplx = { compile: compile, fOf: fOf, roots: roots, polyOf: polyOf, singular: singular, integrate: integrate, winding: winding, residue: residue,
    seg: seg, arc: arc, Arg: Arg, cx: cx, ops: { add: cadd, sub: csub, mul: cmul, div: cdiv, abs: cabs, exp: cexp, log: clog, pow: cpow, sqrt: csqrt, sin: csin, cos: ccos }, nice: nice, cfmt: cfmt };

  var V = ML.viz;
  if (!V || !D) { if (D && W.console) W.console.warn('viz/cplx.js: load viz/core.js first'); return; }
  var mk = V.el;

  // ================================================================ styles
  (function css() {
    if (D.getElementById('cplx-viz-css')) return;
    var s = D.createElement('style'); s.id = 'cplx-viz-css';
    s.textContent = [
      '.cx-v .cx-panes{display:flex;gap:.6rem;align-items:flex-start}',
      '.cx-v .cx-pane{flex:1 1 0;min-width:0}',
      '.cx-v.cx-stack .cx-panes{flex-direction:column;align-items:stretch}',
      '.cx-v.cx-stack .cx-pane{flex:none;width:100%}',
      '.cx-v .cx-ttl{display:flex;justify-content:space-between;gap:.5rem;font:600 .8rem system-ui,sans-serif;color:var(--mv-muted);margin:0 0 .25rem;letter-spacing:.02em}',
      '.cx-v .cx-ttl i{font:italic 600 .95rem Georgia,serif;color:var(--mv-ink)}',
      '.cx-v .cx-row{display:flex;flex-wrap:wrap;gap:.45rem .8rem;align-items:center;margin:.55rem 0 0}',
      '.cx-v .cx-chk{display:inline-flex;align-items:center;gap:.35rem;min-height:36px;font-size:.88rem;color:var(--mv-ink);cursor:pointer}',
      '.cx-v .cx-chk input{width:18px;height:18px;accent-color:var(--mv-acc)}',
      '.cx-v .cx-key{display:flex;flex-wrap:wrap;gap:.2rem .9rem;font-size:.8rem;color:var(--mv-muted);margin:.35rem 0 0}',
      '.cx-v .cx-key span{display:inline-block}',
      '.cx-v .cx-key b.sw{display:inline-block;width:.85em;height:.85em;border-radius:2px;margin-right:.35rem;vertical-align:middle}',
      '.cx-v .cx-key b.sw.ln{height:3px;width:1.2em;border-radius:2px}',
      '.cx-v .cx-key b.sw.dot{border-radius:50%}',
      '.cx-v .cx-tbl{border-collapse:collapse;font-size:.88rem;margin:.4rem 0 0;font-variant-numeric:tabular-nums}',
      '.cx-v .cx-tbl td,.cx-v .cx-tbl th{padding:.15rem .6rem .15rem 0;text-align:left}',
      '.cx-v .cx-tbl th{color:var(--mv-muted);font-weight:600}',
      '.cx-v .cx-ok{color:#00703c;font-weight:700}',
      'html[data-theme="dark"] .cx-v .cx-ok{color:#6cc79a}',
      '.cx-v .cx-bad{color:#c2255c;font-weight:700}',
      'html[data-theme="dark"] .cx-v .cx-bad{color:#f783ac}',
      '.cx-v .cx-mini{margin:.5rem 0 0}',
      '.cx-v .ml-readout{overflow-wrap:anywhere}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ================================================================ frame, planes, handles
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in (o || {})) if (o[k] !== undefined) r[k] = o[k]; return r; }
  function frame(el, o, label) {
    el.classList.add('mla', 'cx-v'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), edit: o.edit !== false };
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    if (F.quiet) F.out.el.hidden = true;
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    F.row = function () { var r = mk('div', 'cx-row'); el.insertBefore(r, F.out.el); return r; };
    F.say = function (h) { if (!F.quiet) F.out.set(h); };
    // panes: one or two canvases; two sit side by side and stack when the visual is narrower than 520 px
    F.panes = function (titles, q) {
      q = q || {}; var wrap = mk('div', 'cx-panes'); F.box.appendChild(wrap); var cs = [];
      titles.forEach(function (t) {
        var p = mk('div', 'cx-pane'); wrap.appendChild(p);
        if (t) { p.appendChild(mk('div', 'cx-ttl', '<span>' + t + '</span>')); }
        var c = V.canvas(p, { aspect: q.aspect || 1, max: q.max || 400, min: 200, height: o.height }); c.pane = p; cs.push(c);
      });
      function stack() { var w = el.clientWidth || 600; el.classList.toggle('cx-stack', titles.length > 1 && w < 520); }
      stack(); if ('ResizeObserver' in W) new ResizeObserver(stack).observe(el);
      return cs;
    };
    return F;
  }
  function win(w, d) { w = w || {}; var x = w.x || d.x || [-3, 3], y = w.y || d.y || [-3, 3]; return { xmin: +x[0], xmax: +x[1], ymin: +y[0], ymax: +y[1], equal: true }; }
  function rgba(hex, a) { if (!/^#/.test(hex)) return hex; var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function back(P, lab) { // background: grid and axes, with Re and Im labels
    P.clear(); P.grid(); P.axes({ x: lab === false ? '' : 'Re', y: lab === false ? '' : 'Im' });
  }
  function pill(c, s, x, y, col, q) { // a label with a soft background (pixel coordinates), kept inside the canvas
    q = q || {}; var ctx = c.ctx, k = V.colors();
    ctx.save(); ctx.font = (q.italic ? 'italic 600 ' : '600 ') + (q.size || 13) + 'px ' + (q.italic ? 'Georgia,serif' : 'system-ui,sans-serif');
    var w = ctx.measureText(s).width, h = (q.size || 13) + 7, bx = x + (q.dx == null ? 8 : q.dx), by = y + (q.dy == null ? -h - 4 : q.dy);
    if (q.align === 'center') bx = x - w / 2 - 5;
    bx = M.max(2, M.min(c.w - w - 12, bx)); by = M.max(2, M.min(c.h - h - 2, by));
    ctx.fillStyle = rgba(k.bg, 0.86); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, w + 10, h, 6); else ctx.rect(bx, by, w + 10, h); ctx.fill();
    ctx.fillStyle = col || k.ink; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
  }
  function knob(c, P, z, col, r) { var ctx = c.ctx, k = V.colors(), x = P.X(z[0]), y = P.Y(z[1]); r = r || 7; ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, TAU); ctx.fill(); ctx.restore(); }
  function dot(c, P, z, col, r) { var ctx = c.ctx; ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(P.X(z[0]), P.Y(z[1]), r || 5, 0, TAU); ctx.fill(); ctx.restore(); }
  function cross(c, P, z, col, r) { var ctx = c.ctx, x = P.X(z[0]), y = P.Y(z[1]); r = r || 6; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); ctx.restore(); }
  function path(c, P, pts, q) { // a polyline in math coordinates, broken at gaps (null) and at huge jumps
    q = q || {}; var ctx = c.ctx, k = V.colors(), v = P.view(), span = M.max(v.xmax - v.xmin, v.ymax - v.ymin), pen = false, last = null;
    ctx.save(); ctx.strokeStyle = q.color || k.blue; ctx.lineWidth = q.width || 2; ctx.setLineDash(q.dash || []); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
    pts.forEach(function (z) {
      if (!z || !fin(z) || M.abs(z[0]) > 1e4 * span || M.abs(z[1]) > 1e4 * span) { pen = false; last = null; return; }
      if (last && !q.nojump && cabs(csub(z, last)) > span * 0.6) pen = false;
      var px = M.max(-1e4, M.min(1e4, P.X(z[0]))), py = M.max(-1e4, M.min(1e4, P.Y(z[1])));
      if (pen) ctx.lineTo(px, py); else { ctx.moveTo(px, py); pen = true; } last = z;
    });
    ctx.stroke(); ctx.restore();
  }
  function fillPoly(c, P, pts, col) { var ctx = c.ctx; ctx.save(); ctx.fillStyle = col; ctx.beginPath(); pts.forEach(function (z, i) { ctx[i ? 'lineTo' : 'moveTo'](P.X(z[0]), P.Y(z[1])); }); ctx.closePath(); ctx.fill(); ctx.restore(); }
  function arrowAt(c, P, z, dir, col, s) { // a small arrowhead at z pointing along dir (math coordinates)
    var ctx = c.ctx, x = P.X(z[0]), y = P.Y(z[1]), a = M.atan2(-dir[1], dir[0]); s = s || 10;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + s * M.cos(a), y + s * M.sin(a)); ctx.lineTo(x + s * 0.8 * M.cos(a + 2.5), y + s * 0.8 * M.sin(a + 2.5)); ctx.lineTo(x + s * 0.8 * M.cos(a - 2.5), y + s * 0.8 * M.sin(a - 2.5)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  /* handles(c, P, list, o): draggable points. list: [{get() -> [x, y], set(z), off()?}]; o: {change(i), snap, step}.
     Mouse, touch and pen drag; with the canvas focused, arrow keys move the selected point, Enter or N picks the next. */
  function handles(c, P, list, o) {
    o = o || {}; var cur = 0, focus = false, cv = c.cv;
    function snap(v) { return o.snap ? M.round(v / o.snap) * o.snap : v; }
    function on(i) { return !(list[i].off && list[i].off()); }
    V.drag(cv, {
      hit: function (px, py) { var best = null, bd = 26; list.forEach(function (h, i) { if (!on(i)) return; var p = h.get(), d = M.hypot(P.X(p[0]) - px, P.Y(p[1]) - py); if (d < bd) { bd = d; best = i; } }); return best; },
      start: function (i) { cur = i; },
      move: function (i, px, py) { var v = P.view(); list[i].set([snap(M.max(v.xmin, M.min(v.xmax, P.x(px)))), snap(M.max(v.ymin, M.min(v.ymax, P.y(py))))]); if (o.change) o.change(i); }
    });
    cv.tabIndex = 0;
    cv.addEventListener('focus', function () { focus = true; if (o.change) o.change(-1); });
    cv.addEventListener('blur', function () { focus = false; if (o.change) o.change(-1); });
    cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (d && list.length && on(cur)) { var v = P.view(), st = (o.step || (v.xmax - v.xmin) / 60) * (e.shiftKey ? 5 : 1), p = list[cur].get(); list[cur].set([snap(p[0] + d[0] * st), snap(p[1] + d[1] * st)]); if (o.change) o.change(cur); e.preventDefault(); }
      else if ((e.key === 'Enter' || e.key === 'n' || e.key === 'N') && list.length > 1) { var k = 0; do { cur = (cur + 1) % list.length; k++; } while (!on(cur) && k < list.length); if (o.change) o.change(cur); e.preventDefault(); }
    });
    return { ring: function () { if (!focus || !list.length || !on(cur)) return; var p = list[cur].get(), ctx = c.ctx; ctx.save(); ctx.strokeStyle = V.colors().gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), 13, 0, TAU); ctx.stroke(); ctx.restore(); }, cur: function () { return cur; } };
  }
  function checkbox(parent, text, on, fn) { var l = mk('label', 'cx-chk'), i = D.createElement('input'); i.type = 'checkbox'; i.checked = !!on; l.appendChild(i); l.appendChild(D.createTextNode(text)); i.addEventListener('change', function () { fn(i.checked); }); parent.appendChild(l); return i; }
  function keyRow(parent, items) { var r = mk('div', 'cx-key'); items.forEach(function (it) { r.appendChild(mk('span', '', '<b class="sw ' + (it[2] || '') + '" style="background:' + it[0] + '"></b>' + it[1])); }); parent.appendChild(r); return r; }
  function iz(s) { return '<i>' + s + '</i>'; }
  function hookRedraw(cs, fn) { cs.forEach(function (c) { c.onResize(fn); }); V.onTheme(fn); }

  // ================================================================ cplx-mapping
  function pretty(s) { // a CAS formula a bit friendlier for a title: z^2 -> z², exp(z) -> e^z, * dropped
    return String(s).replace(/\*/g, '').replace(/\^2\b/g, '²').replace(/\^3\b/g, '³').replace(/\^4\b/g, '⁴').replace(/\^n\b/g, 'ⁿ').replace(/exp\(z\)/g, 'eᶻ').replace(/^exp$/, 'eᶻ').replace(/^log$/, 'Log z').replace(/log\(/g, 'Log(').replace(/^sin$/, 'sin z').replace(/conj\(z\)/g, 'z̄').replace(/-/g, '−');
  }
  function regionOf(sh, w) { // a region as a mesh map g(u, v), u, v in [0, 1], with boundary curves; or a curve
    var t = sh.type, c = cx(sh.c || [0, 0]), wx = w.xmax - w.xmin, wy = w.ymax - w.ymin, BIG = 60;
    function tanS(u) { return M.tan((M.min(0.997, M.max(0.003, u)) - 0.5) * PI); }
    if (t === 'disk' || t === 'annulus' || t === 'sector') {
      var r0 = t === 'disk' ? 0 : +(sh.r0 || 0), r1 = t === 'disk' ? +(sh.r || 1) : +(sh.r1 || sh.r || 1), t0 = t === 'sector' ? +(sh.t0 || 0) : 0, t1 = t === 'sector' ? +(sh.t1 == null ? PI / 2 : sh.t1) : TAU;
      return { g: function (u, v) { var r = r0 + u * (r1 - r0), th = t0 + v * (t1 - t0); return [c[0] + r * M.cos(th), c[1] + r * M.sin(th)]; }, nu: 24, nv: 72 };
    }
    if (t === 'strip' || t === 'rect') {
      var x0 = sh.x0 != null ? +sh.x0 : w.xmin - wx, x1 = sh.x1 != null ? +sh.x1 : w.xmax + wx, y0 = sh.y0 != null ? +sh.y0 : w.ymin - wy, y1 = sh.y1 != null ? +sh.y1 : w.ymax + wy;
      return { g: function (u, v) { return [x0 + u * (x1 - x0), y0 + v * (y1 - y0)]; }, nu: 60, nv: 40 };
    }
    if (t === 'halfplane') {
      var side = sh.side || 'upper', at = +(sh.at || 0), s = 2;
      return { g: function (u, v) { var a = tanS(u) * s, b = at + M.tan(M.min(0.997, M.max(0.003, v)) * PI / 2) * s; return side === 'upper' ? [a, b] : side === 'lower' ? [a, 2 * at - b] : side === 'right' ? [b, a] : [2 * at - b, a]; }, nu: 80, nv: 50 };
    }
    if (t === 'line') { var p = cx(sh.p || [0, 0]), q = cx(sh.q || [1, 0]), d = csub(q, p), L = cabs(d) || 1; return { curve: function (u) { return cadd(p, cscale(tanS(u) * 3 / L, d)); } }; }
    if (t === 'circle') { var rr = +(sh.r || 1); return { curve: function (u) { return [c[0] + rr * M.cos(TAU * u), c[1] + rr * M.sin(TAU * u)]; } }; }
    return null;
  }
  function mobOfPoints(zs) { // the Möbius matrix [[a, b], [c, d]] sending zs[0], zs[1], zs[2] to 0, 1, ∞ (entries may be ∞ = null)
    var z1 = zs[0], z2 = zs[1], z3 = zs[2], I1 = !fin(z1), I2 = !fin(z2), I3 = !fin(z3);
    if (I1) return [[[0, 0], csub(z2, z3)], [[1, 0], cscale(-1, z3)]];
    if (I2) return [[[1, 0], cscale(-1, z1)], [[1, 0], cscale(-1, z3)]];
    if (I3) return [[[1, 0], cscale(-1, z1)], [[0, 0], csub(z2, z1)]];
    var A = csub(z2, z3), B = csub(z2, z1);
    return [[A, cscale(-1, cmul(z1, A))], [B, cscale(-1, cmul(z3, B))]];
  }
  function mmul(X, Y) { return [[cadd(cmul(X[0][0], Y[0][0]), cmul(X[0][1], Y[1][0])), cadd(cmul(X[0][0], Y[0][1]), cmul(X[0][1], Y[1][1]))], [cadd(cmul(X[1][0], Y[0][0]), cmul(X[1][1], Y[1][0])), cadd(cmul(X[1][0], Y[0][1]), cmul(X[1][1], Y[1][1]))]]; }
  function minv(X) { return [[X[1][1], cscale(-1, X[0][1])], [cscale(-1, X[1][0]), X[0][0]]]; }
  function mapply(X, z) { if (!fin(z)) return cabs(X[1][0]) < 1e-12 ? [Infinity, Infinity] : cdiv(X[0][0], X[1][0]); var d = cadd(cmul(X[1][0], z), X[1][1]); if (cabs(d) < 1e-14) return [Infinity, Infinity]; return cdiv(cadd(cmul(X[0][0], z), X[0][1]), d); }
  function mobText(X) { // "(a z + b)/(c z + d)" normalized so that c = 1 (or d = 1 when c = 0)
    var n = cabs(X[1][0]) > 1e-12 ? X[1][0] : X[1][1], Y = X.map(function (r) { return r.map(function (v) { return cdiv(v, n); }); });
    function co(v, lead) { var s = cfmt(v); if (s === '0') return ''; var par = /[+−]/.test(s.replace(/^−/, '')) ? '(' + s + ')' : s; return lead ? (par === '1' ? '' : par === '−1' ? '−' : par) : par; }
    function lin(a, b) { var A = co(a, true), B = cfmt(b); if (!A && cabs(a) < 1e-12) return B; var s = (A === '' ? '' : A) + 'z'; if (B !== '0') s += (B[0] === '−' && !/[+−]/.test(B.slice(1)) ? ' − ' + B.slice(1) : ' + ' + (/[+−]/.test(B.replace(/^−/, '')) ? '(' + B + ')' : B)); return s; }
    var top = lin(Y[0][0], Y[0][1]), bot = lin(Y[1][0], Y[1][1]);
    var par = function (s) { return /[+−]/.test(s.replace(/^−/, '')) ? '(' + s + ')' : s; };
    return bot === '1' ? top : par(top) + '/' + par(bot);
  }
  V.register('cplx-mapping', function (el, o0) {
    var o = opt(o0, { f: 'z^2', shape: 'grid', z0: [1, 1], zoom: false, h: 0.3, angles: false, rays: [0, PI / 4], points3: false, window: null, wwindow: null });
    var F = frame(el, o, 'A complex function as a map from the z-plane to the w-plane');
    var p3 = !!o.points3, zs = (o.zs || [[-1, 0], [0, 1], [1, 0]]).map(cx), ws = (o.ws || [0, 1, 'inf']).map(cx), Tm = null;
    var f = p3 ? function (z) { return mapply(Tm, z); } : fOf(o);
    var name = o.name || (p3 ? 'T(z)' : pretty(o.f === 'mobius' ? 'mobius' : o.f)); if (o.f === 'mobius' && !o.name) name = mobText([[cx((o.coeffs || {}).a || 1), cx((o.coeffs || {}).b || 0)], [cx((o.coeffs || {}).c || 0), cx((o.coeffs || {}).d || 1)]]);
    var cs = F.panes(['<span><i>z</i>-plane</span>', '<span><i>w</i> = ' + name.replace(/z/g, '<i>z</i>') + '</span>']), cz = cs[0], cw = cs[1];
    var Wz = win(o.window, {}), Pz = V.plane(cz, Wz), Pw = V.plane(cw, win(o.wwindow || o.window, {}));
    var z0 = o.z0 ? cx(o.z0) : null, sh = typeof o.shape === 'object' && o.shape ? o.shape : null, showGrid = o.grid != null ? !!o.grid : !sh || p3;
    var reg = sh ? regionOf(sh, Wz) : null;
    function gridLines() { var s = (Wz.xmax - Wz.xmin) <= 4.5 && !p3 ? 0.5 : 1, L = []; for (var x = M.ceil(Wz.xmin / s) * s; x <= Wz.xmax + 1e-9; x += s) L.push({ v: true, a: x }); for (var y = M.ceil(Wz.ymin / s) * s; y <= Wz.ymax + 1e-9; y += s) L.push({ v: false, a: y }); return L; }
    function linePts(Ln, g, n) { var out = []; n = n || 240; for (var i = 0; i <= n; i++) { var t = i / n, z = Ln.v ? [Ln.a, Wz.ymin + t * (Wz.ymax - Wz.ymin)] : [Wz.xmin + t * (Wz.xmax - Wz.xmin), Ln.a]; out.push(g ? g(z) : z); } return out; }
    function meshFill(c, P, g, col) { // fill the image of the region mesh in one pass
      var ctx = c.ctx, nu = reg.nu, nv = reg.nv, v = P.view(), span = M.max(v.xmax - v.xmin, v.ymax - v.ymin);
      ctx.save(); ctx.fillStyle = col; ctx.beginPath();
      for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) {
        var q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(function (a) { return g(reg.g(a[0] / nu, a[1] / nv)); });
        if (!q.every(fin)) continue; var dm = M.max(cabs(csub(q[0], q[2])), cabs(csub(q[1], q[3]))); if (dm > span * 0.5) continue;
        q.forEach(function (z, k) { var px = M.max(-1e4, M.min(1e4, P.X(z[0]))), py = M.max(-1e4, M.min(1e4, P.Y(z[1]))); ctx[k ? 'lineTo' : 'moveTo'](px, py); }); ctx.closePath();
      }
      ctx.fill(); ctx.restore();
    }
    function meshLines(c, P, g, col) { // a few u- and v-lines of the region
      var n = 160, k, i, pts;
      for (k = 0; k <= 4; k++) { pts = []; for (i = 0; i <= n; i++) pts.push(g(reg.g(k / 4, i / n))); path(c, P, pts, { color: col, width: k === 0 || k === 4 ? 2.5 : 1.2 }); }
      for (k = 0; k <= 6; k++) { pts = []; for (i = 0; i <= n; i++) pts.push(g(reg.g(i / n, k / 6))); path(c, P, pts, { color: col, width: k === 0 || k === 6 ? 2.5 : 1.2 }); }
    }
    function draw() {
      var k = V.colors(), id = function (z) { return z; };
      if (p3) Tm = mmul(minv(mobOfPoints(ws)), mobOfPoints(zs));
      [[cz, Pz, id], [cw, Pw, f]].forEach(function (A) {
        var c = A[0], P = A[1], g = A[2]; back(P);
        if (reg && reg.g) { meshFill(c, P, g, rgba(k.green, 0.22)); meshLines(c, P, g, k.green); }
        if (reg && reg.curve) { var pts = []; for (var i = 0; i <= 600; i++) pts.push(g(reg.curve(i / 600))); path(c, P, pts, { color: k.green, width: 3 }); }
        if (showGrid) gridLines().forEach(function (Ln) { path(c, P, linePts(Ln, g === id ? null : g), { color: rgba(Ln.v ? k.orange : k.blue, Ln.a === 0 ? 0.95 : 0.6), width: Ln.a === 0 ? 2.2 : 1.3 }); });
      });
      if (p3) {
        var circ = []; for (var i = 0; i <= 400; i++) circ.push(i / 400); // the circle (or line) through z1, z2, z3, drawn through its images
        var Sinv = minv(mobOfPoints(zs)), on = circ.map(function (t) { return mapply(Sinv, [M.tan((t - 0.5) * PI * 0.998), 0]); });
        path(cz, Pz, on, { color: k.purple, width: 2.5, dash: [6, 4] }); path(cw, Pw, on.map(f), { color: k.purple, width: 2.5, dash: [6, 4] });
        zs.forEach(function (z, j) { if (fin(z)) { knob(cz, Pz, z, k.purple); pill(cz, 'z' + '₁₂₃'[j], Pz.X(z[0]), Pz.Y(z[1]), k.purple); } });
        ws.forEach(function (w, j) { if (fin(w)) { dot(cw, Pw, w, k.purple, 6); pill(cw, 'w' + '₁₂₃'[j], Pw.X(w[0]), Pw.Y(w[1]), k.purple); } });
      }
      var txt = [];
      if (z0 && o.zoom) {
        var h = +o.h, sq = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]].map(function (a) { return cadd(z0, [a[0] * h, a[1] * h]); });
        var bz = [], bw = []; for (var e0 = 0; e0 < 4; e0++) for (var s0 = 0; s0 < 30; s0++) { var zb = cadd(sq[e0], cscale(s0 / 30, csub(sq[(e0 + 1) % 4], sq[e0]))); bz.push(zb); bw.push(f(zb)); }
        fillPoly(cz, Pz, bz, rgba(k.gold, 0.3)); if (bw.every(fin)) fillPoly(cw, Pw, bw, rgba(k.gold, 0.3));
        for (var e = 0; e < 4; e++) { var a = sq[e], b = sq[(e + 1) % 4], pz = [], pw = []; for (var s = 0; s <= 30; s++) { var zz = cadd(a, cscale(s / 30, csub(b, a))); pz.push(zz); pw.push(f(zz)); } var col = e === 0 ? k.red : k.ink; path(cz, Pz, pz, { color: col, width: e === 0 ? 3 : 2 }); path(cw, Pw, pw, { color: col, width: e === 0 ? 3 : 2 }); if (e === 0) { arrowAt(cz, Pz, pz[22], csub(b, a), k.red); arrowAt(cw, Pw, pw[22], csub(pw[23], pw[21]), k.red); } }
        var dl = 1e-5 * M.max(1, cabs(z0)), fx = cscale(1 / (2 * dl), csub(f(cadd(z0, [dl, 0])), f(csub(z0, [dl, 0])))), fy = cscale(1 / (2 * dl), csub(f(cadd(z0, [0, dl])), f(csub(z0, [0, dl]))));
        var cr = cabs(csub(fy, cmul([0, 1], fx))) < 1e-4 * (1 + cabs(fx)), det = fx[0] * fy[1] - fy[0] * fx[1];
        if (!fin(fx) || !fin(fy)) txt.push('f is not defined near ' + iz('z') + '₀.');
        else if (cr) txt.push('∂f/∂y = i ∂f/∂x here, so ' + iz('f') + '′(' + iz('z') + '₀) = ' + cfmt(fx) + ': the square is turned by arg ' + iz('f') + '′ = ' + nice(Arg(fx)) + ' and scaled by |' + iz('f') + '′| = ' + nice(cabs(fx)) + '.');
        else txt.push('∂f/∂y = ' + cfmt(fy) + ' but i ∂f/∂x = ' + cfmt(cmul([0, 1], fx)) + ': not complex differentiable at ' + iz('z') + '₀. The square is ' + (det < 0 ? 'flipped' : 'stretched unevenly') + '.');
      }
      if (z0 && o.angles) {
        var L = (Wz.xmax - Wz.xmin) * 0.3, dirs = (o.rays || [0, PI / 4]).map(Number), ang = [];
        dirs.forEach(function (al, j) {
          var u = [M.cos(al), M.sin(al)], pz2 = [], pw2 = [], col2 = j ? k.teal : k.purple;
          for (var s2 = 0; s2 <= 60; s2++) { var z2 = cadd(z0, cscale(L * s2 / 60, u)); pz2.push(z2); pw2.push(f(z2)); }
          path(cz, Pz, pz2, { color: col2, width: 3 }); path(cw, Pw, pw2, { color: col2, width: 3 });
          var ep = 1e-4 * M.max(1, L); ang.push(Arg(csub(f(cadd(z0, cscale(ep, u))), f(z0))));
        });
        var a0 = M.abs(dirs[1] - dirs[0]) % TAU, a1 = M.abs(ang[1] - ang[0]) % TAU; if (a0 > PI) a0 = TAU - a0; if (a1 > PI) a1 = TAU - a1;
        txt.push('Angle between the curves at ' + iz('z') + '₀: ' + M.round(a0 * 180 / PI) + '°; between their images at ' + iz('w') + '₀: ' + M.round(a1 * 180 / PI) + '°.');
      }
      if (z0) { var w0 = f(z0), small = o.zoom ? 4 : 7; if (o.zoom) dot(cz, Pz, z0, k.red, 4); else knob(cz, Pz, z0, k.red); if (fin(w0) && !F.quiet) { if (o.zoom) dot(cw, Pw, w0, k.red, 4); else knob(cw, Pw, w0, k.red); pill(cw, 'w₀', Pw.X(w0[0]), Pw.Y(w0[1]), k.red); } pill(cz, 'z₀', Pz.X(z0[0]), Pz.Y(z0[1]), k.red); txt.unshift(iz('z') + '₀ = ' + cfmt(z0) + ', &nbsp;' + iz('w') + '₀ = ' + iz('f') + '(' + iz('z') + '₀) = ' + cfmt(w0) + '.'); }
      if (p3) txt.push(iz('T') + '(' + iz('z') + ') = ' + mobText(Tm).replace(/z/g, iz('z')) + (ws.some(function (w) { return !fin(w); }) ? ' (a point sent to ∞ has no dot on the right)' : '') + '.');
      if (H) H.ring();
      F.say(txt.join('<br>'));
    }
    var H = null;
    if (F.edit) {
      var list = [];
      if (z0) list.push({ get: function () { return z0; }, set: function (z) { z0 = z; } });
      if (p3) zs.forEach(function (z, j) { if (fin(z)) list.push({ get: function () { return zs[j]; }, set: function (v) { zs[j] = v; } }); });
      if (list.length) { H = handles(cz, Pz, list, { change: draw }); cz.cv.setAttribute('aria-label', 'z-plane. Arrow keys move the selected point; Enter selects the next point.'); }
    }
    hookRedraw(cs, draw); draw();
    return { update: draw };
  });

  // ================================================================ cplx-domaincolor
  function hsv(h, s, v) { // h in [0, 1) -> [r, g, b] 0..255
    var i = M.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), r, g, b;
    switch (((i % 6) + 6) % 6) { case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break; case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break; case 4: r = t; g = p; b = v; break; default: r = v; g = p; b = q; }
    return [M.round(r * 255), M.round(g * 255), M.round(b * 255)];
  }
  function colorOf(w, rings) {
    if (!fin(w)) return [128, 128, 128];
    var a = Arg(w) / TAU; if (a < 0) a += 1;
    var m = cabs(w), v = 0.9;
    if (rings) { var t = M.log2(m), fr = t - M.floor(t); v = 0.7 + 0.28 * M.sqrt(fr); }
    if (m < 1e-300) return [0, 0, 0];
    return hsv(a, 0.8, v);
  }
  V.register('cplx-domaincolor', function (el, o0) {
    var o = opt(o0, { f: 'z^2-1', window: null, rings: true, marks: [], cut: false, disk: null, probe: true, overlay: false });
    var F = frame(el, o, 'Domain coloring of a complex function');
    var f = fOf(o), ttl = F.quiet ? 'arg <i>f</i>(<i>z</i>) as color' : '<i>f</i>(<i>z</i>) = ' + pretty(o.f).replace(/z/g, '<i>z</i>');
    var c = F.panes([ttl], { max: 440 })[0], P = V.plane(c, win(o.window, {})), off = D.createElement('canvas'), img = null, imgKey = '';
    var pr = o.probe ? cx(o.probe === true ? [1, 0.5] : o.probe) : null, disk = o.disk ? { c: cx(o.disk.c || [0, 0]), r: +(o.disk.r || 1) } : null;
    var mini = null, Pm = null;
    if (o.overlay) { mini = V.canvas(F.box, { aspect: 2.4, max: 200, min: 140 }); mini.cv.classList.add('cx-mini'); Pm = V.plane(mini, { xmin: P.o.xmin, xmax: P.o.xmax, ymin: -0.3, ymax: 6 }); keyRow(F.box, [[V.colors().blue, '|' + iz('f') + '(' + iz('x') + ')| on the real axis', 'ln'], [V.colors().orange, '|' + iz('f') + '(' + iz('iy') + ')| up the imaginary axis', 'ln']]); }
    function render() { // the colored picture at most about 320 pixels across, scaled up
      var s = M.max(1, M.ceil(M.max(c.w, c.h) / 440)), W2 = M.ceil(c.w / s), H2 = M.ceil(c.h / s), key = W2 + 'x' + H2;
      if (img && key === imgKey) return; imgKey = key; off.width = W2; off.height = H2;
      var g = off.getContext('2d'), id = g.createImageData(W2, H2), d = id.data;
      for (var j = 0; j < H2; j++) for (var i = 0; i < W2; i++) { var z = [P.x((i + 0.5) * s), P.y((j + 0.5) * s)], col = colorOf(f(z), o.rings), q = 4 * (j * W2 + i); d[q] = col[0]; d[q + 1] = col[1]; d[q + 2] = col[2]; d[q + 3] = 255; }
      g.putImageData(id, 0, 0); img = off;
    }
    function maxOnDisk() { var best = null, bv = -1; for (var k = 0; k < 720; k++) { var z = cadd(disk.c, [disk.r * M.cos(TAU * k / 720), disk.r * M.sin(TAU * k / 720)]), v = cabs(f(z)); if (v > bv) { bv = v; best = z; } } var inner = -1; for (var a = 1; a <= 12; a++) for (k = 0; k < 48; k++) { var zz = cadd(disk.c, [disk.r * a / 12.5 * M.cos(TAU * k / 48), disk.r * a / 12.5 * M.sin(TAU * k / 48)]); inner = M.max(inner, cabs(f(zz))); } inner = M.max(inner, cabs(f(disk.c))); return { z: best, v: bv, inner: inner }; }
    function draw() {
      var k = V.colors(), ctx = c.ctx; render();
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(img, 0, 0, c.w, c.h); ctx.restore();
      P.axes({ x: 'Re', y: 'Im' });
      if (o.cut) { var cu = o.cut === true ? { from: [0, 0], angle: PI } : o.cut, a0 = cx(cu.from || [0, 0]), an = +(cu.angle == null ? PI : cu.angle); path(c, P, [a0, cadd(a0, [100 * M.cos(an), 100 * M.sin(an)])], { color: '#ffffff', width: 4, nojump: true }); path(c, P, [a0, cadd(a0, [100 * M.cos(an), 100 * M.sin(an)])], { color: '#1d2320', width: 2, dash: [7, 5], nojump: true }); }
      var txt = [];
      if (disk) { P.circle(disk.c[0], disk.c[1], disk.r, { color: '#ffffff', width: 3 }); P.circle(disk.c[0], disk.c[1], disk.r, { color: '#1d2320', width: 1.2, dash: [5, 4] }); if (!F.quiet) { var mx = maxOnDisk(); knob(c, P, mx.z, '#1d2320', 8); pill(c, 'max |f|', P.X(mx.z[0]), P.Y(mx.z[1]), k.ink); txt.push('On the closed disk, |' + iz('f') + '| is largest at ' + iz('z') + ' = ' + cfmt(mx.z) + ', on the edge: |' + iz('f') + '| = ' + nice(mx.v) + '. Inside, the largest sampled value is only ' + nice(mx.inner) + '.'); } }
      if (!F.quiet) (o.marks || []).forEach(function (m) { var z = cx(m.z), kind = m.kind || 'zero'; if (kind === 'pole') cross(c, P, z, '#ffffff', 8), cross(c, P, z, '#1d2320', 6); else { dot(c, P, z, '#ffffff', 7); dot(c, P, z, '#1d2320', 4.5); } pill(c, m.text || (kind + (m.order ? ' (order ' + m.order + ')' : '')), P.X(z[0]), P.Y(z[1]), k.ink); });
      // hue key in a corner
      var R = 17, cxp = c.w - R - 10, cyp = c.h - R - 10; ctx.save(); for (var t = 0; t < 72; t++) { var col = hsv(t / 72, 0.88, 0.9); ctx.strokeStyle = 'rgb(' + col.join(',') + ')'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cxp, cyp, R, -TAU * (t + 1) / 72, -TAU * t / 72); ctx.stroke(); } ctx.fillStyle = rgba(k.bg, 0.9); ctx.beginPath(); ctx.arc(cxp, cyp, R - 4, 0, TAU); ctx.fill(); ctx.fillStyle = k.ink; ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('arg', cxp, cyp); ctx.restore();
      if (pr) { knob(c, P, pr, '#1d2320', 7); var w = f(pr); if (!F.quiet) txt.unshift(iz('z') + ' = ' + cfmt(pr) + ': &nbsp;' + iz('f') + '(' + iz('z') + ') = ' + cfmt(w) + ', &nbsp;|' + iz('f') + '| = ' + nice(cabs(w)) + ', &nbsp;arg ' + iz('f') + ' = ' + nice(Arg(w)) + '.'); }
      if (mini) {
        Pm.set({ xmin: P.view().xmin, xmax: P.view().xmax }); var top = 1; for (var s2 = 0; s2 <= 200; s2++) { var xx = Pm.o.xmin + (Pm.o.xmax - Pm.o.xmin) * s2 / 200; top = M.max(top, M.min(50, cabs(f([xx, 0]))), M.min(50, cabs(f([0, xx])))); }
        Pm.set({ ymin: -top * 0.06, ymax: top * 1.08 }); Pm.clear(); Pm.grid(); Pm.axes({});
        Pm.plot(function (x) { return cabs(f([x, 0])); }, { color: k.blue, width: 2.5 }); Pm.plot(function (y) { return cabs(f([0, y])); }, { color: k.orange, width: 2.5 });
      }
      if (H) H.ring();
      F.say(txt.join('<br>'));
    }
    var H = null;
    if (pr && F.edit) { H = handles(c, P, [{ get: function () { return pr; }, set: function (z) { pr = z; } }], { change: draw }); c.cv.setAttribute('aria-label', 'Domain coloring. Arrow keys move the probe.'); }
    c.onResize(function () { img = null; draw(); }); V.onTheme(draw); if (mini) mini.onResize(draw); draw();
    return { update: draw };
  });

  // ================================================================ cplx-branch
  V.register('cplx-branch', function (el, o0) {
    var o = opt(o0, { z: [-1, 0.5], mode: 'arg', c: '1/3', w: [1, 1], cut: PI, rungs: 2 });
    var mode = o.mode, F = frame(el, o, 'Following the argument and the logarithm around the origin');
    var two = mode === 'log' || mode === 'power';
    var cs = F.panes(two ? ['<span><i>z</i>-plane</span>', mode === 'log' ? '<span>values of log <i>z</i></span>' : '<span>values of <i>z</i><sup>' + o.c + '</sup></span>'] : ['<span><i>z</i>-plane</span>'], { max: two ? 400 : 440 });
    var c = cs[0], P = V.plane(c, win(o.window, { x: [-2.5, 2.5], y: [-2.5, 2.5] })), cw = cs[1], Pw = null;
    var z = cx(o.z), w = cx(o.w), cut = +o.cut, cc = cx(o.c), theta = 0, trail = [], anim = null;
    function argB(v) { var a = M.atan2(v[1], v[0]); while (a > cut + 1e-12) a -= TAU; while (a <= cut - TAU + 1e-12) a += TAU; return a; } // the branch's argument in (cut − 2π, cut]
    theta = argB(z);
    var rat = (function () { var s = String(o.c).replace(/\s/g, ''), m = /^(-?\d+)\/(\d+)$/.exec(s); return m ? [+m[1], +m[2]] : /^-?\d+$/.test(s) ? [+s, 1] : null; })();
    if (two) {
      if (mode === 'log') Pw = V.plane(cw, { xmin: -2.4, xmax: 2.4, ymin: -(2 * o.rungs + 1.2) * PI, ymax: (2 * o.rungs + 1.2) * PI });
      else Pw = V.plane(cw, win(o.wwindow, { x: [-2.5, 2.5], y: [-2.5, 2.5] }));
    }
    function moveTo(v) { var a0 = M.atan2(z[1], z[0]), a1 = M.atan2(v[1], v[0]), d = a1 - a0; while (d > PI) d -= TAU; while (d < -PI) d += TAU; if (cabs(v) > 1e-9 && cabs(z) > 1e-9) theta += d; z = v; trail.push(z); if (trail.length > 600) trail.shift(); }
    function vals() { // [{w, k, principal}] for log or power
      var r = cabs(z), out = [], ks = [];
      if (mode === 'log') { for (var k = -o.rungs; k <= o.rungs; k++) ks.push(k); return ks.map(function (k) { return { w: [M.log(r), argB(z) + TAU * k], k: k }; }); }
      if (rat) { for (k = 0; k < rat[1]; k++) ks.push(k); } else for (k = -o.rungs; k <= o.rungs; k++) ks.push(k);
      return ks.map(function (k) { return { w: cexp(cmul(cc, [M.log(r), argB(z) + TAU * k])), k: k }; });
    }
    function draw() {
      var k = V.colors(); back(P);
      path(c, P, [[0, 0], [100 * M.cos(cut), 100 * M.sin(cut)]], { color: k.red, width: 3, dash: [8, 5], nojump: true });
      if (trail.length > 1) path(c, P, trail, { color: rgba(k.purple, 0.5), width: 2 });
      // the continuous angle as a spiral (one more lap = one more turn of the spiral)
      var r0 = M.min(0.35, cabs(z) * 0.4), sp = [], n = M.max(2, M.ceil(M.abs(theta) * 30)); for (var i = 0; i <= n; i++) { var t = theta * i / n, rr = r0 * (1 + 0.18 * M.abs(t) / TAU); sp.push([rr * M.cos(t), rr * M.sin(t)]); }
      path(c, P, sp, { color: k.gold, width: 2.5 }); if (sp.length > 2) arrowAt(c, P, sp[sp.length - 1], csub(sp[sp.length - 1], sp[sp.length - 2]), k.gold, 9);
      P.seg(0, 0, z[0], z[1], { color: k.ink, width: 1.5 });
      var txt = [], Az = argB(z), lap = M.round((theta - Az) / TAU);
      if (mode === 'product') {
        var zw = cmul(z, w); P.seg(0, 0, w[0], w[1], { color: k.ink, width: 1.5 }); P.seg(0, 0, zw[0], zw[1], { color: k.green, width: 2 });
        knob(c, P, w, k.blue); pill(c, 'w', P.X(w[0]), P.Y(w[1]), k.blue, { italic: true }); dot(c, P, zw, k.green, 6); pill(c, 'zw', P.X(zw[0]), P.Y(zw[1]), k.green, { italic: true });
        var s = Arg(z) + Arg(w), azw = Arg(zw);
        txt.push('Arg ' + iz('z') + ' + Arg ' + iz('w') + ' = ' + nice(Arg(z)) + ' + ' + nice(Arg(w)).replace(/^−/, '(−') + (Arg(w) < 0 ? ')' : '') + ' = ' + nice(s) + '; &nbsp;Arg(' + iz('zw') + ') = ' + nice(azw) + '. ' + (M.abs(s - azw) < 1e-9 ? '<span class="cx-ok">They agree.</span>' : '<span class="cx-bad">They differ by ' + (s > azw ? '' : '−') + '2π</span>: the sum left (−π, π].'));
      } else {
        txt.push('Continuous argument (following your path): ' + nice(theta) + '. &nbsp;' + (M.abs(cut - PI) < 1e-9 ? 'Principal Arg ' + iz('z') : 'This branch\'s arg') + ' = ' + nice(Az) + (lap ? ' (they differ by ' + (lap === 1 ? '' : lap === -1 ? '−' : lap) + '2π: ' + M.abs(lap) + (M.abs(lap) === 1 ? ' lap' : ' laps') + ' ' + (lap > 0 ? 'counterclockwise' : 'clockwise') + ').' : '.'));
      }
      knob(c, P, z, k.red); pill(c, 'z', P.X(z[0]), P.Y(z[1]), k.red, { italic: true });
      if (two) {
        back(Pw); var vs = vals(), cont = mode === 'log' ? [M.log(cabs(z)), theta] : cexp(cmul(cc, [M.log(cabs(z)), theta]));
        if (mode === 'log') path(cw, Pw, [[M.log(cabs(z)), -100], [M.log(cabs(z)), 100]], { color: rgba(k.muted, 0.6), width: 1.2, dash: [4, 4] });
        else if (rat && !F.quiet) { var rr2 = M.pow(cabs(z), rat[0] / rat[1]); Pw.circle(0, 0, rr2, { color: rgba(k.muted, 0.6), width: 1.2, dash: [4, 4] }); }
        vs.forEach(function (v) { if (!fin(v.w)) return; dot(cw, Pw, v.w, v.k === 0 ? k.red : k.blue, 5.5); if (!F.quiet) pill(cw, 'k = ' + String(v.k).replace('-', '−'), Pw.X(v.w[0]), Pw.Y(v.w[1]), v.k === 0 ? k.red : k.muted, { size: 11 }); });
        var pw0 = vs.filter(function (v) { return v.k === 0; })[0]; if (pw0 && fin(pw0.w)) { cw.ctx.save(); cw.ctx.strokeStyle = k.red; cw.ctx.lineWidth = 2.5; cw.ctx.beginPath(); cw.ctx.arc(Pw.X(pw0.w[0]), Pw.Y(pw0.w[1]), 11, 0, TAU); cw.ctx.stroke(); cw.ctx.restore(); }
        if (fin(cont)) knob(cw, Pw, cont, k.gold, 6);
        if (mode === 'log') txt.push('log ' + iz('z') + ' = ln ' + nice(cabs(z)) + ' + i(' + nice(Az) + ' + 2πk): the values sit 2π apart on a vertical line. ' + (M.abs(cut - PI) < 1e-9 ? 'The principal value' : 'This branch\'s value') + ' (k = 0, circled) is ' + cfmt(vs.filter(function (v) { return v.k === 0; })[0].w) + '. The gold point follows your path: each lap moves it one rung.');
        else txt.push('Values of ' + iz('z') + '<sup>' + o.c + '</sup> = e<sup>' + o.c + '·log z</sup>: ' + vs.map(function (v) { return cfmt(v.w); }).join(', ') + '. ' + (M.abs(cut - PI) < 1e-9 ? 'The principal value' : 'This branch\'s value') + ' (k = 0) is circled; the gold point follows your path.');
      }
      if (H) H.ring();
      F.say(txt.join('<br>'));
    }
    var H = null;
    if (F.edit) {
      var list = [{ get: function () { return z; }, set: function (v) { moveTo(v); } }];
      if (mode === 'product') list.push({ get: function () { return w; }, set: function (v) { w = v; } });
      H = handles(c, P, list, { change: draw }); c.cv.setAttribute('aria-label', 'z-plane with the cut. Arrow keys move z.');
      if (mode !== 'product') {
        var go = function (dir) {
          if (anim) return; var r = cabs(z), a = M.atan2(z[1], z[0]), done = 0;
          if (V.reduced) { for (var s = 1; s <= 72; s++) moveTo([r * M.cos(a + dir * TAU * s / 72), r * M.sin(a + dir * TAU * s / 72)]); draw(); return; }
          anim = V.loop(el, function (dt) { done = M.min(1, done + dt / 2.2); moveTo([r * M.cos(a + dir * TAU * done), r * M.sin(a + dir * TAU * done)]); draw(); if (done >= 1) { anim.stop(); anim = null; } });
        };
        V.button(F.ctl, 'Go around once ↺', function () { go(1); }, 'pri'); V.button(F.ctl, 'Back once ↻', function () { go(-1); });
        V.button(F.ctl, 'Reset', function () { z = cx(o.z); theta = argB(z); trail = []; draw(); });
      }
    }
    hookRedraw(cs, draw); draw();
    return { update: draw };
  });

  // ================================================================ cplx-contour
  function contourOf(ct) { // -> { pieces, closed, handles: [{get, set}] } built from a live contour object
    var t = ct.type || 'circle';
    if (t === 'circle') { var c = cx(ct.c || [0, 0]), r = +(ct.r || 1), dir = ct.dir === -1 ? -1 : 1; return { closed: true, pieces: [arc(c, r, dir > 0 ? 0 : TAU, dir > 0 ? TAU : 0)], arrows: [0.13, 0.63], handles: [{ get: function () { return cx(ct.c || [0, 0]); }, set: function (z) { ct.c = z; } }, { get: function () { var cc = cx(ct.c || [0, 0]); return [cc[0] + ct.r * M.SQRT1_2, cc[1] - ct.r * M.SQRT1_2]; }, set: function (z) { ct.r = M.max(0.15, cabs(csub(z, cx(ct.c || [0, 0])))); } }] }; }
    if (t === 'rect') { var a = [ct.x0, ct.y0], b = [ct.x1, ct.y0], d = [ct.x1, ct.y1], e = [ct.x0, ct.y1]; return { closed: true, pieces: [seg(a, b), seg(b, d), seg(d, e), seg(e, a)], arrows: [0.5], handles: [{ get: function () { return [ct.x0, ct.y0]; }, set: function (z) { ct.x0 = M.min(z[0], ct.x1 - 0.2); ct.y0 = M.min(z[1], ct.y1 - 0.2); } }, { get: function () { return [ct.x1, ct.y1]; }, set: function (z) { ct.x1 = M.max(z[0], ct.x0 + 0.2); ct.y1 = M.max(z[1], ct.y0 + 0.2); } }] }; }
    if (t === 'halfdisk') { var R = +(ct.R || 2); return { closed: true, pieces: [seg([-R, 0], [R, 0]), arc([0, 0], R, 0, PI)], arrows: [0.55], parts: ['segment from −R to R', 'arc'], handles: [{ get: function () { return [ct.R * M.SQRT1_2, ct.R * M.SQRT1_2]; }, set: function (z) { ct.R = M.max(0.3, cabs(z)); } }] }; }
    if (t === 'segment') { return { closed: false, pieces: [seg(cx(ct.a), cx(ct.b))], arrows: [0.6], handles: [{ get: function () { return cx(ct.a); }, set: function (z) { ct.a = z; } }, { get: function () { return cx(ct.b); }, set: function (z) { ct.b = z; } }] }; }
    if (t === 'arc') { return { closed: M.abs(M.abs((+ct.t1) - (+ct.t0)) - TAU) < 1e-9, pieces: [arc(cx(ct.c || [0, 0]), +(ct.r || 1), +(ct.t0 || 0), +(ct.t1 == null ? PI : ct.t1))], arrows: [0.6], handles: [] }; }
    var pts = (ct.pts || [[1, 0], [0, 1], [-1, 0]]).map(cx), cl = !!ct.closed, pcs = [];
    for (var i = 0; i < pts.length - 1; i++) pcs.push(seg(pts[i], pts[i + 1])); if (cl) pcs.push(seg(pts[pts.length - 1], pts[0]));
    return { closed: cl, pieces: pcs, arrows: [0.5], handles: pts.map(function (p, j) { return { get: function () { return ct.pts[j]; }, set: function (z) { ct.pts[j] = z; } }; }) };
  }
  V.register('cplx-contour', function (el, o0) {
    var o = opt(o0, { f: '1/(z^2+1)', poles: null, contour: { type: 'circle', c: [0, 0], r: 2, dir: 1 }, drag: true, parts: false, zprime: false, residues: true, mode: 'integral', g: '1/(5+3c)', window: null });
    var trig = o.mode === 'trig', F = frame(el, o, trig ? 'An integral over a full turn as a contour integral around the unit circle' : 'A contour integral and the singular points of the integrand');
    var f, gT = null;
    if (trig) { var gc = compile(o.g, ['c', 's']); gT = gc; f = function (z) { var iv = cdiv([1, 0], z), cc = cscale(0.5, cadd(z, iv)), ss = cdiv(csub(z, iv), [0, 2]); return cdiv(gc(cc, ss), [-z[1], z[0]]); }; }
    else f = fOf(o);
    var ct = JSON.parse(JSON.stringify(trig ? { type: 'circle', c: [0, 0], r: 1 } : o.contour)), dropDz = false, th = 1;
    var poles = (o.poles || (trig ? [] : singular(o.f))).map(function (p) { return Array.isArray(p) ? { z: cx(p), order: 1, kind: 'pole' } : { z: cx(p.z), order: p.order || 1, kind: p.kind || 'pole' }; });
    var title = trig ? '<span><i>z</i> = e<sup><i>iθ</i></sup> around the unit circle</span>' : (F.quiet ? '<span><i>z</i>-plane</span>' : '<span><i>f</i>(<i>z</i>) = ' + pretty(o.f).replace(/z/g, '<i>z</i>') + '</span>');
    var c = F.panes([title], { max: 440 })[0], P = V.plane(c, win(o.window, trig ? { x: [-3.2, 3.2], y: [-2.4, 2.4] } : {}));
    poles.forEach(function (p) { var dd = nearest(poles, p.z, p); p.res = residue(f, p.z, M.min(0.25, 0.4 * dd)); });
    function draw() {
      var k = V.colors(), C = contourOf(ct), txt = []; back(P);
      // the contour, with arrows for its direction
      C.pieces.forEach(function (pc, j) { var pts = []; for (var i = 0; i <= 240; i++) pts.push(pc.z(i / 240)); path(c, P, pts, { color: o.parts && C.parts && j === 1 ? k.purple : k.blue, width: 3 }); C.arrows.forEach(function (a) { arrowAt(c, P, pc.z(a), pc.dz(a), o.parts && C.parts && j === 1 ? k.purple : k.blue, 12); }); });
      // how close the contour comes to a singular point
      var near = Infinity; poles.forEach(function (p) { C.pieces.forEach(function (pc) { for (var i = 0; i <= 400; i++) near = M.min(near, cabs(csub(pc.z(i / 400), p.z))); }); });
      var inside = 0, sum = [0, 0];
      poles.forEach(function (p, pi) {
        var wd = C.closed ? winding(C.pieces, p.z) : 0, inn = wd !== 0; if (inn) { inside++; sum = cadd(sum, cscale(wd, p.res)); }
        var col = inn ? k.red : k.muted;
        if (p.kind === 'pole') cross(c, P, p.z, col, 7); else { c.ctx.save(); c.ctx.strokeStyle = col; c.ctx.lineWidth = 2.5; c.ctx.beginPath(); c.ctx.arc(P.X(p.z[0]), P.Y(p.z[1]), 6, 0, TAU); c.ctx.stroke(); c.ctx.restore(); }
        var lab = (p.kind === 'essential' ? 'essential' : p.order > 1 ? 'order ' + p.order : '') + (o.residues && !F.quiet && inn ? (p.kind === 'essential' || p.order > 1 ? ', ' : '') + 'Res = ' + cfmt(p.res) : '');
        if (lab) pill(c, lab, P.X(p.z[0]), P.Y(p.z[1]), col, { size: 12, dy: pi % 2 ? 8 : null });
      });
      if (trig) { var pt = [M.cos(th), M.sin(th)]; P.seg(0, 0, pt[0], pt[1], { color: k.ink, width: 1.5 }); knob(c, P, pt, k.gold); pill(c, 'e^(iθ)', P.X(pt[0]), P.Y(pt[1]), k.gold); }
      if (near < 0.02 * (P.view().xmax - P.view().xmin)) txt.push('<span class="cx-bad">The contour runs through (or right next to) a singular point, so the integral is not defined there.</span> Move it a little.');
      else {
        var I = integrate(f, C.pieces, 500);
        if (trig) {
          var s = 0, N = 2048; for (var q = 0; q < N; q++) { var tq = TAU * q / N, gv = gT([M.cos(tq), 0], [M.sin(tq), 0]); s += gv[0]; } s *= TAU / N;
          txt.push('∫<sub>0</sub><sup>2π</sup> ' + iz('g') + '(cos θ, sin θ) dθ ≈ ' + nice(s) + ' (computed numerically). With ' + iz('z') + ' = e<sup>' + iz('iθ') + '</sup>, cos θ = (' + iz('z') + ' + 1/' + iz('z') + ')/2 and dθ = d' + iz('z') + '/(' + iz('iz') + '): 2πi × (sum of residues inside) = ' + cfmt(cmul([0, TAU], sum)) + '.');
          txt.push('θ = ' + nice(th) + ': ' + iz('z') + ' = ' + cfmt([M.cos(th), M.sin(th)]) + ', cos θ = ' + nice(M.cos(th)) + '.');
        } else {
          txt.push((C.closed ? '∮' : '∫') + '<sub>C</sub> ' + iz('f') + '(' + iz('z') + ') d' + iz('z') + ' ≈ ' + cfmt(I) + ' (computed numerically along the contour).');
          if (C.closed) txt.push(inside ? '2πi × (sum of the residues inside) = 2πi × (' + cfmt(sum) + ') = ' + cfmt(cmul([0, TAU], sum)) + '.' : 'No singular point inside: Cauchy\'s theorem predicts 0.');
          if (o.parts && C.parts) { var Is = integrate(f, [C.pieces[0]], 500), Ia = integrate(f, [C.pieces[1]], 500), Mx = 0; for (var a = 0; a <= 360; a++) Mx = M.max(Mx, cabs(f(C.pieces[1].z(a / 360)))); txt.push('Segment: ' + cfmt(Is) + '; &nbsp;arc: ' + cfmt(Ia) + '. ML bound for the arc (R = ' + nice(ct.R) + '): ' + iz('M') + ' × ' + iz('L') + ' = ' + nice(Mx) + ' × ' + nice(PI * ct.R) + ' = ' + nice(Mx * PI * ct.R) + '.'); }
          if (dropDz) txt.push('<span class="cx-bad">Without z′(t):</span> ∫ ' + iz('f') + '(' + iz('z') + '(' + iz('t') + ')) d' + iz('t') + ' ≈ ' + cfmt(integrate(f, C.pieces, 500, true)) + ' (with t from 0 to 1 on each piece), which is not the contour integral.');
        }
      }
      if (H) { C.handles.forEach(function (hd) { knob(c, P, hd.get(), k.blue, 6); }); H.ring(); }
      F.say(txt.join('<br>'));
    }
    var H = null;
    if (F.edit && !trig && o.drag !== false) { var C0 = contourOf(ct); if (C0.handles.length) { H = handles(c, P, C0.handles, { change: draw }); c.cv.setAttribute('aria-label', 'Contour. Arrow keys move the selected handle; Enter selects the next handle.'); } }
    if (F.edit && trig) V.slider(F.ctl, { label: 'θ', min: 0, max: 6.28, step: 0.01, value: th, fmt: function (v) { return nice(v); }, input: function (v) { th = v; draw(); } });
    if (F.edit && o.zprime && !F.quiet) checkbox(F.ctl, ' Leave out z′(t) (the common mistake)', false, function (v) { dropDz = v; draw(); });
    hookRedraw([c], draw); draw();
    return { update: draw };
  });

  // ================================================================ cplx-series
  function coeffs(f, a, rho, n0, n1) { // Laurent (or Taylor) coefficients c_n, n0 ≤ n ≤ n1, from samples on |z − a| = ρ
    var N = 512, S = [], out = {};
    for (var k = 0; k < N; k++) { var th = TAU * k / N; S.push(f(cadd(a, [rho * M.cos(th), rho * M.sin(th)]))); }
    for (var n = n0; n <= n1; n++) { var s = [0, 0]; for (k = 0; k < N; k++) { var th2 = -n * TAU * k / N; s = cadd(s, cmul(S[k], [M.cos(th2), M.sin(th2)])); } out[n] = cscale(1 / N / M.pow(rho, n), s); }
    return out;
  }
  function supN(n) { var m = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }; return String(n).split('').map(function (ch) { return m[ch]; }).join(''); }
  V.register('cplx-series', function (el, o0) {
    var o = opt(o0, { f: '1/(1+z^2)', a: [0, 0], N: 6, sing: null, mode: 'taylor', ring: 0, real: false, terms: true, window: null });
    var F = frame(el, o, o.mode === 'laurent' ? 'Laurent series on an annulus' : 'A Taylor series and its disk of convergence');
    var f = fOf(o), lau = o.mode === 'laurent', a = cx(o.a), N = +o.N, ring = +o.ring;
    var sing = (o.sing || singular(o.f).map(function (p) { return p.z; })).map(cx);
    var c = F.panes([F.quiet ? '<span><i>z</i>-plane</span>' : '<span><i>f</i>(<i>z</i>) = ' + pretty(o.f).replace(/z/g, '<i>z</i>') + '</span>'], { max: 440 })[0], P = V.plane(c, win(o.window, {}));
    var off = D.createElement('canvas'), mini = null, Pm = null;
    if (o.real) { mini = V.canvas(F.box, { aspect: 2.4, max: 200, min: 140 }); mini.cv.classList.add('cx-mini'); Pm = V.plane(mini, { xmin: P.o.xmin, xmax: P.o.xmax, ymin: -1.5, ymax: 2.5 }); keyRow(F.box, [[V.colors().blue, iz('f') + '(' + iz('x') + ') on the real line', 'ln'], [V.colors().red, 'partial sum ' + iz('S') + '<sub>' + iz('N') + '</sub>(' + iz('x') + ')', 'ln']]); }
    keyRow(F.box, [['rgba(0,112,60,.85)', '|' + iz('f') + ' − ' + iz('S') + '<sub>' + iz('N') + '</sub>| tiny'], ['rgba(0,112,60,.3)', 'small'], ['rgba(214,51,108,.35)', 'large (the series fails)']]);
    function radii() { var ds = sing.map(function (s) { return cabs(csub(s, a)); }).filter(function (d) { return d > 1e-9; }).sort(function (x, y) { return x - y; }), rs = [0]; ds.forEach(function (d) { if (d - rs[rs.length - 1] > 1e-6) rs.push(d); }); rs.push(Infinity); return rs; }
    function draw() {
      var k = V.colors(), rs = radii(), rin, rout;
      if (lau) { var j = M.max(0, M.min(rs.length - 2, ring)); rin = rs[j]; rout = rs[j + 1]; } else { rin = 0; rout = rs[1]; }
      var rho = rout === Infinity ? (rin ? rin * 1.6 + 0.5 : 1.5) : rin ? M.sqrt(rin * rout) : 0.7 * rout;
      var n0 = lau ? -N : 0, cf = coeffs(f, a, rho, n0, N);
      function S(z) { var u = csub(z, a), s = [0, 0], p = [1, 0]; for (var n = 0; n <= N; n++) { s = cadd(s, cmul(cf[n], p)); p = cmul(p, u); } if (lau) { var iu = cdiv([1, 0], u), q = iu; for (n = -1; n >= n0; n--) { s = cadd(s, cmul(cf[n], q)); q = cmul(q, iu); } } return s; }
      // shade the error |f − S_N|
      back(P); var sc = M.max(1, M.ceil(M.max(c.w, c.h) / 200)), W2 = M.ceil(c.w / sc), H2 = M.ceil(c.h / sc); off.width = W2; off.height = H2;
      var g = off.getContext('2d'), id = g.createImageData(W2, H2), d = id.data;
      for (var y = 0; y < H2; y++) for (var x = 0; x < W2; x++) {
        var z = [P.x((x + 0.5) * sc), P.y((y + 0.5) * sc)], e = cabs(csub(f(z), S(z))), q2 = 4 * (y * W2 + x), col, al;
        if (!isFinite(e) || e > 1) { col = [214, 51, 108]; al = 0.35; } else { var t = M.max(0, M.min(1, (-M.log10(e + 1e-16) - 0) / 4)); col = [0, 112, 60]; al = 0.08 + 0.77 * t; }
        d[q2] = col[0]; d[q2 + 1] = col[1]; d[q2 + 2] = col[2]; d[q2 + 3] = M.round(al * 255);
      }
      g.putImageData(id, 0, 0); c.ctx.save(); c.ctx.imageSmoothingEnabled = true; c.ctx.drawImage(off, 0, 0, c.w, c.h); c.ctx.restore(); P.axes({ x: 'Re', y: 'Im' });
      if (rout < Infinity) P.circle(a[0], a[1], rout, { color: k.blue, width: 2.5, dash: [7, 4] });
      if (lau && rin > 0) P.circle(a[0], a[1], rin, { color: k.blue, width: 2.5, dash: [7, 4] });
      sing.forEach(function (s) { cross(c, P, s, k.red, 7); });
      knob(c, P, a, k.ink); pill(c, 'a', P.X(a[0]), P.Y(a[1]), k.ink, { italic: true });
      var txt = [];
      if (lau) txt.push('Annulus ' + nice(rin) + ' < |' + iz('z') + ' − ' + iz('a') + '| < ' + nice(rout) + ': one Laurent series converges there (dashed circles). Shading: the error of the terms from (' + iz('z') + ' − ' + iz('a') + ')' + supN(-N) + ' to (' + iz('z') + ' − ' + iz('a') + ')' + supN(N) + '.');
      else txt.push('Radius of convergence about ' + iz('a') + ' = ' + cfmt(a) + ': ' + (rout === Infinity ? '∞ (no singular point)' : nice(rout) + ', the distance to the nearest singular point') + '. Shading: the error of ' + iz('S') + '<sub>' + N + '</sub>, the sum up to (' + iz('z') + ' − ' + iz('a') + ')' + supN(N) + '.');
      if (o.terms) {
        var list = [], ns = lau ? [-3, -2, -1, 0, 1, 2] : [0, 1, 2, 3, 4], A = cfmt(a), base = A === '0' ? iz('z') : '(' + iz('z') + (a[0] < 0 || (a[0] === 0 && a[1] < 0) ? ' + ' + cfmt(cscale(-1, a)) : ' − ' + A) + ')';
        ns.forEach(function (n) { if (n < n0 || n > N) return; var v = cf[n]; if (cabs(v) < 1e-9) return; var vs = cfmt(v), par = /[+−]/.test(vs.replace(/^−/, '')) ? '(' + vs + ')' : vs; list.push((n === 0 ? vs : (par === '1' ? '' : par === '−1' ? '−' : par)) + (n === 0 ? '' : base + (n === 1 ? '' : supN(n)))); });
        txt.push('First terms: ' + (list.length ? list.join(' + ').replace(/\+ −/g, '− ') : '0') + ' + …');
      }
      if (mini) {
        Pm.clear(); Pm.grid(); Pm.axes({});
        Pm.plot(function (x) { var v = f([x, 0]); return M.abs(v[1]) < 1e-9 * (1 + M.abs(v[0])) ? v[0] : NaN; }, { color: k.blue, width: 3 });
        Pm.plot(function (x) { return S([x, 0])[0]; }, { color: k.red, width: 2, dash: [6, 4] });
      }
      if (H) H.ring();
      F.say(txt.join('<br>'));
    }
    var H = null;
    if (F.edit) {
      H = handles(c, P, [{ get: function () { return a; }, set: function (z) { a = z; } }], { change: draw }); c.cv.setAttribute('aria-label', 'z-plane. Arrow keys move the center a.');
      V.slider(F.ctl, { label: lau ? 'N (powers from −N to N)' : 'N (highest power)', min: 0, max: 30, step: 1, value: N, input: function (v) { N = v; draw(); } });
      if (lau) { var rr = radii(); if (rr.length > 2) V.seg(F.ctl, { label: 'Annulus', items: rr.slice(0, -1).map(function (r0, j) { return [j, nice(r0) + ' < |z − a| < ' + nice(rr[j + 1])]; }), value: M.min(ring, rr.length - 2), change: function (v) { ring = +v; draw(); } }); }
    }
    hookRedraw([c].concat(mini ? [mini] : []), draw); draw();
    return { update: draw };
  });

  // ================================================================ cplx-winding
  function zerosPoles(src) { // zeros and poles of a polynomial or a quotient of products of polynomials in z
    var t = parseT(src), Z = [], Pl = [];
    function addTo(L, rs, mult) { rs.forEach(function (r) { for (var i = 0; i < L.length; i++) if (cabs(csub(L[i].z, r.z)) < 1e-6) { L[i].m += r.m * mult; return; } L.push({ z: r.z, m: r.m * mult }); }); }
    var fs = t.k === '*' ? t.a : [t];
    for (var i = 0; i < fs.length; i++) {
      var fa = fs[i];
      if (fa.k === '^' && fa.a[1].k === 'n' && qnum(fa.a[1].v) < 0) { var p = polyOf(fa.a[0], 'z'); if (!p) return null; addTo(Pl, roots(p), -qnum(fa.a[1].v)); }
      else { var q = polyOf(fa, 'z'); if (!q) return null; addTo(Z, roots(q), 1); }
    }
    return { zeros: Z, poles: Pl };
  }
  V.register('cplx-winding', function (el, o0) {
    var o = opt(o0, { f: 'z^3-2z+1', g: 'z/2', C: { c: [0, 0], r: 1 }, mode: 'argument', trace: true, zeros: null, poles: null, window: null, wwindow: null });
    var rou = o.mode === 'rouche', F = frame(el, o, rou ? "Rouché's theorem: two image curves that wind the same number of times" : 'The argument principle: winding of the image curve');
    var f = fOf(o), g = rou ? compile(o.g, ['z']) : null, fg = rou ? function (z) { return cadd(f(z), g(z)); } : null;
    var Cc = { c: cx(o.C.c || [0, 0]), r: +(o.C.r || 1) }, t = 0, play = null;
    var zp = o.zeros || o.poles ? { zeros: (o.zeros || []).map(function (z) { return { z: cx(z), m: 1 }; }), poles: (o.poles || []).map(function (z) { return { z: cx(z), m: 1 }; }) } : zerosPoles(o.f) || { zeros: [], poles: [] };
    var zpg = rou ? zerosPoles('(' + o.f + ')+(' + o.g + ')') : null;
    var cs = F.panes(['<span><i>z</i>-plane: the circle <i>C</i></span>', rou ? '<span>images <i>f</i>(<i>C</i>) and (<i>f</i> + <i>g</i>)(<i>C</i>)</span>' : '<span><i>w</i>-plane: the image <i>f</i>(<i>C</i>)</span>']), cz = cs[0], cw = cs[1];
    var Pz = V.plane(cz, win(o.window, {})), Pw = V.plane(cw, win(o.wwindow, {}));
    function zc(s) { return [Cc.c[0] + Cc.r * M.cos(TAU * s), Cc.c[1] + Cc.r * M.sin(TAU * s)]; }
    function turns(fn, upto) { var tot = 0, prev = null, n = M.max(2, M.round(1440 * upto)); for (var i = 0; i <= n; i++) { var w = fn(zc(upto * i / n)), an = M.atan2(w[1], w[0]); if (prev !== null) { var d = an - prev; while (d > PI) d -= TAU; while (d < -PI) d += TAU; tot += d; } prev = an; } return tot / TAU; }
    function fitW(fns) { if (o.wwindow) return; var xs = [0], ys = [0]; fns.forEach(function (fn) { for (var i = 0; i < 360; i++) { var w = fn(zc(i / 360)); if (fin(w) && cabs(w) < 1e6) { xs.push(w[0]); ys.push(w[1]); } } }); var x0 = M.min.apply(null, xs), x1 = M.max.apply(null, xs), y0 = M.min.apply(null, ys), y1 = M.max.apply(null, ys), sp = M.max(x1 - x0, y1 - y0, 0.5) * 0.58, mx = (x0 + x1) / 2, my = (y0 + y1) / 2; Pw.set({ xmin: mx - sp, xmax: mx + sp, ymin: my - sp, ymax: my + sp }); }
    function inside(z) { return cabs(csub(z, Cc.c)) < Cc.r - 1e-9; }
    function draw() {
      var k = V.colors(), txt = []; back(Pz); fitW(rou ? [f, fg] : [f]); back(Pw);
      Pz.circle(Cc.c[0], Cc.c[1], Cc.r, { color: k.blue, width: 3 }); arrowAt(cz, Pz, zc(0.125), [-M.sin(TAU * 0.125), M.cos(TAU * 0.125)], k.blue, 12);
      var nZ = 0, nP = 0;
      zp.zeros.forEach(function (r) { var inn = inside(r.z); if (inn) nZ += r.m; if (F.quiet && inn) return; dot(cz, Pz, r.z, inn ? k.green : k.muted, 6); if (r.m > 1) pill(cz, '×' + r.m, Pz.X(r.z[0]), Pz.Y(r.z[1]), inn ? k.green : k.muted, { size: 11 }); });
      zp.poles.forEach(function (r) { var inn = inside(r.z); if (inn) nP += r.m; if (F.quiet && inn) return; cross(cz, Pz, r.z, inn ? k.red : k.muted, 7); if (r.m > 1) pill(cz, '×' + r.m, Pz.X(r.z[0]), Pz.Y(r.z[1]), inn ? k.red : k.muted, { size: 11 }); });
      var img = []; for (var i = 0; i <= 1440; i++) img.push(f(zc(i / 1440)));
      path(cw, Pw, img, { color: k.blue, width: 2.5 });
      if (rou) { var img2 = []; for (i = 0; i <= 1440; i++) img2.push(fg(zc(i / 1440))); path(cw, Pw, img2, { color: k.green, width: 2.5 }); }
      cross(cw, Pw, [0, 0], k.ink, 6); pill(cw, '0', Pw.X(0), Pw.Y(0), k.ink, { size: 11 });
      var zt = zc(t), wt = f(zt); knob(cz, Pz, zt, k.gold, 6);
      if (rou) { var dt = fg(zt); cw.ctx.save(); cw.ctx.strokeStyle = k.gold; cw.ctx.lineWidth = 2; cw.ctx.beginPath(); cw.ctx.moveTo(Pw.X(wt[0]), Pw.Y(wt[1])); cw.ctx.lineTo(Pw.X(dt[0]), Pw.Y(dt[1])); cw.ctx.stroke(); cw.ctx.restore(); knob(cw, Pw, dt, k.green, 6); }
      knob(cw, Pw, wt, k.gold, 6);
      var Wn = M.round(turns(f, 1)), sofar = turns(f, t);
      if (!rou) {
        txt.push('As ' + iz('z') + ' goes once around ' + iz('C') + ', ' + iz('f') + '(' + iz('z') + ') turns ' + nice(M.round(sofar * 100) / 100) + ' times around 0 so far' + (t > 0.999 ? '' : ' (drag the slider or press Play)') + '. Full turn: <b>' + Wn + '</b>.');
        txt.push('Inside ' + iz('C') + ': ' + nZ + ' zero' + (nZ === 1 ? '' : 's') + ' and ' + nP + ' pole' + (nP === 1 ? '' : 's') + ', counted with multiplicity: ' + nZ + ' − ' + nP + ' = ' + (nZ - nP) + '.');
      } else {
        var mf = Infinity, mg = 0; for (i = 0; i < 720; i++) { var z = zc(i / 720); mf = M.min(mf, cabs(f(z))); mg = M.max(mg, cabs(g(z))); }
        var Wg = M.round(turns(fg, 1)), nZ2 = zpg ? zpg.zeros.reduce(function (s, r) { return s + (inside(r.z) ? r.m : 0); }, 0) : null;
        txt.push('On ' + iz('C') + ': min |' + iz('f') + '| = ' + nice(mf) + ', max |' + iz('g') + '| = ' + nice(mg) + '. ' + (mg < mf ? '<span class="cx-ok">|g| < |f| all the way around</span>, so the leash never reaches the post 0: both curves wind ' + Wn + ' times.' : '<span class="cx-bad">|g| < |f| fails somewhere on C</span>, so Rouché\'s theorem does not apply to this circle.'));
        txt.push('Turns around 0: ' + iz('f') + '(' + iz('C') + '): ' + Wn + ', (' + iz('f') + ' + ' + iz('g') + ')(' + iz('C') + '): ' + Wg + '. Zeros inside ' + iz('C') + ': ' + iz('f') + ' has ' + nZ + (nZ2 != null ? ', ' + iz('f') + ' + ' + iz('g') + ' has ' + nZ2 : '') + '.');
      }
      if (H) H.ring();
      F.say(txt.join('<br>'));
    }
    var H = null, sl = null;
    if (F.edit) {
      H = handles(cz, Pz, [{ get: function () { return Cc.c; }, set: function (z) { Cc.c = z; } }, { get: function () { return [Cc.c[0] + Cc.r * M.SQRT1_2, Cc.c[1] - Cc.r * M.SQRT1_2]; }, set: function (z) { Cc.r = M.max(0.1, cabs(csub(z, Cc.c))); } }], { change: draw });
      cz.cv.setAttribute('aria-label', 'The circle C. Arrow keys move its center; Enter switches to its radius handle.');
      sl = V.slider(F.ctl, { label: 'trip around C', min: 0, max: 1, step: 0.005, value: t, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { t = v; draw(); } });
      if (o.trace && !V.reduced) V.button(F.ctl, 'Play', function () { if (play) return; t = 0; play = V.loop(el, function (dt) { t = M.min(1, t + dt / 6); sl.set(t); draw(); if (t >= 1) { play.stop(); play = null; } }); }, 'pri');
    }
    hookRedraw(cs, draw); t = o.trace === false || F.quiet ? 1 : 0.35; if (sl) sl.set(t); draw();
    return { update: draw };
  });
})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);
