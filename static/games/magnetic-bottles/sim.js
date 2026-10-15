/* Magnetic Bottles (/games/magnetic-bottles/): a 3-D explorer of the exact plasma equilibria in arXiv:2610.07304.
   The formulas live in physics.js (window.MagBottles). This file draws the 3-D view (painter's algorithm on a 2-D canvas),
   the four slices, the iota chart and the live numbers. */
(function () {
  'use strict';
  var L = window.TRBLab, MB = window.MagBottles, root = document.getElementById('magnetic-bottles-lab');
  if (!root || !L || !MB) return;
  function $(id) { return document.getElementById(id); }
  var PI = Math.PI, TAU = 2 * PI, reduced = L.reduced, store = L.store('magnetic-bottles');
  var view = $('mb-view'), cv = $('mb-cv'), G = L.canvas(cv), ctx = G.c;
  var hud = $('mb-hud'), legend = $('mb-legend'), readEl = $('mb-read'), checkDl = $('mb-check-dl'), checkNote = $('mb-check-note');
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', ink: '#dbe7ef', muted: '#8fb3c6' };

  /* ---------- numbers as text ---------- */
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(v) {
    if (!isFinite(v)) return '—'; if (v === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = Math.round(v / Math.pow(10, e));
    if (m >= 10) { m = 1; e++; }
    return (m === 1 ? '' : m + ' × ') + '10' + String(e).split('').map(function (c) { return SUP[c]; }).join('');
  }
  function f(v, d) { return L.fmt(v, d); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- color maps (lightness rises with the value) ---------- */
  var MAPS = {
    p: [[0, 38, 26, 84], [0.25, 112, 40, 128], [0.5, 214, 72, 120], [0.72, 255, 135, 110], [0.88, 255, 212, 121], [1, 255, 246, 214]],
    B: [[0, 22, 52, 102], [0.3, 40, 110, 190], [0.55, 116, 192, 252], [0.8, 99, 230, 190], [1, 222, 255, 240]]
  };
  function cmap(name, t, o) {
    var s = MAPS[name]; t = clamp(t, 0, 1);
    for (var i = 1; i < s.length; i++) if (t <= s[i][0] || i === s.length - 1) {
      var a = s[i - 1], b = s[i], u = (t - a[0]) / (b[0] - a[0] || 1);
      o[0] = a[1] + (b[1] - a[1]) * u; o[1] = a[2] + (b[2] - a[2]) * u; o[2] = a[3] + (b[3] - a[3]) * u; return o;
    }
    return o;
  }
  function cssGrad(name) { return 'linear-gradient(90deg,' + MAPS[name].map(function (s) { return 'rgb(' + s[1] + ',' + s[2] + ',' + s[3] + ') ' + Math.round(s[0] * 100) + '%'; }).join(',') + ')'; }

  /* ---------- settings ---------- */
  var DEF = { f1: { eps: 0.5, tau: 0.5, delta: 1 / 64 }, f2: { eps: 1.2, S: 1.4, lam: 1.6, tau: 0.5, delta: 0.14 } };
  var SL = {
    f1: [{ k: 'eps', name: 'Elongation ε', min: 0.05, max: 0.9, step: 0.01, d: 2 },
         { k: 'tau', name: 'Symmetry breaking τ₀', min: -0.9, max: 0.9, step: 0.01, d: 2 },
         { k: 'delta', name: 'Size of the plasma δ', min: 0.0001, max: 0, step: 0.0001, d: 4 }],
    f2: [{ k: 'eps', name: 'Focal distance ε', min: 0.2, max: 2.5, step: 0.01, d: 2 },
         { k: 'S', name: 'Axis size S', min: 0.4, max: 2.5, step: 0.01, d: 2 },
         { k: 'lam', name: 'Vertical scale λ', min: 0.5, max: 3, step: 0.01, d: 2 },
         { k: 'tau', name: 'Symmetry breaking τ₁', min: -1.5, max: 1.5, step: 0.01, d: 2 },
         { k: 'delta', name: 'Size of the plasma δ', min: 0.001, max: 0, step: 0.001, d: 3 }]
  };
  var PRE = {
    f1: { label: 'The paper’s Figure 2 (ε = 0.5, δ = 1/64):', items: [{ t: 'τ₀ = −0.5', tau: -0.5 }, { t: 'τ₀ = 0', tau: 0 }, { t: 'τ₀ = 0.5', tau: 0.5 }], base: { eps: 0.5, delta: 1 / 64 } },
    f2: { label: 'The paper’s Figure 5 settings (ε = 1.2, S = 1.4, λ = 1.6, δ = 0.14):', items: [{ t: 'τ₁ = 0', tau: 0 }, { t: 'τ₁ = 0.5', tau: 0.5 }, { t: 'τ₁ = 1', tau: 1 }], base: { eps: 1.2, S: 1.4, lam: 1.6, delta: 0.14 } }
  };
  var ABOUT = {
    f1: 'The stretched, lopsided Solov’ev bottle. Every field line closes after one trip around, having circled the axis exactly twice: ι = 2 on every surface.',
    f2: 'The complex-phase bottle. Its axis is a flat ellipse, and the twist ι changes from the axis to the edge. Field lines usually never close.'
  };
  function sane(fam, saved) {
    var P = {}, d = DEF[fam]; saved = saved || {};
    SL[fam].forEach(function (s) { var v = +saved[s.k]; P[s.k] = isFinite(v) && (s.k === 'delta' ? v > 0 : v >= s.min && v <= s.max) ? v : d[s.k]; });
    var dm = MB.make(fam, P).dmax; if (!(P.delta < 0.98 * dm)) P.delta = Math.min(d.delta, 0.5 * dm);
    return P;
  }
  var st = {
    fam: store.get('fam', 'f1') === 'f2' ? 'f2' : 'f1',
    P: { f1: sane('f1', store.get('p1', null)), f2: sane('f2', store.get('p2', null)) },
    cut: store.get('cut', true) !== false, mirror: !!store.get('mirror', false), lines: store.get('lines', true) !== false,
    flow: store.get('flow', !reduced) !== false && !(reduced && store.get('flow', null) === null), color: store.get('color', 'p') === 'B' ? 'B' : 'p'
  };
  function save() { store.set('fam', st.fam); store.set('p1', st.P.f1); store.set('p2', st.P.f2); store.set('cut', st.cut); store.set('mirror', st.mirror); store.set('lines', st.lines); store.set('flow', st.flow); store.set('color', st.color); }

  /* ---------- camera ---------- */
  var YAW0 = -PI / 2 + 0.55, PITCH0 = 0.6;
  var cam = { yaw: YAW0, pitch: PITCH0, zoom: 1, spin: !reduced, cx: 0, cy: 0, cz: 0, R: 1, tcx: 0, tcy: 0, tcz: 0, tR: 1, snap: true };
  var drag = null, ptrs = {}, nptr = 0, pinch = null, dirty = true;

  /* ---------- quality (mesh size) adapts to how fast the device draws ---------- */
  var QL = [{ nt: 12, nz: 48 }, { nt: 18, nz: 72 }, { nt: 28, nz: 116 }, { nt: 38, nz: 156 }];
  var qual = (Math.min(window.innerWidth, window.innerHeight) < 600 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) ? 1 : 2;
  var perf = { ema: 0, n: 0, lowered: false, raised: false };

  /* ---------- the model and its drawable geometry ---------- */
  var M = null, M0 = null, info = {}, geo = null, needBuild = true, slowT = 0, seed = 1;
  /* cut-open view: layer k covers the toroidal angle c..2pi-c, so the opening is centered on ze = 0, where the flip axis passes */
  var LAY_CUT = [{ r: 1, c: 0.75, f: 1 }, { r: 0.7, c: 0.52, f: 0.78 }, { r: 0.4, c: 0.3, f: 0.56 }];
  var LAY_GLASS = [{ r: 1, c: 0, f: 1, a: 1 }, { r: 0.5, c: 0, f: 0.6, a: 2 }];

  function axisPt(ze, o) { return M.surf(0, 0, ze, o); }
  function build() {
    needBuild = false;
    var P = st.P[st.fam];
    M = MB.make(st.fam, P);
    var P0 = Object.assign({}, P, { tau: 0 }), m0 = MB.make(st.fam, P0);
    M0 = P.delta < 0.995 * m0.dmax ? m0 : null;
    var q = QL[qual], V = [], Qd = [], qv = [], qa = [], qn = [], Sg = [], sk = [], sz = [], sl = [];
    var p = [0, 0, 0], a = [0, 0, 0], b = [0, 0, 0], B = [0, 0, 0];
    function vert(x, y, z) { V.push(x, y, z); return V.length / 3 - 1; }
    function val(r, th, ze) {
      if (st.color === 'p') return 1 - r * r;
      M.surf(r, th, ze, p); M.B(p[0], p[1], p[2], B); return Math.sqrt(B[0] * B[0] + B[1] * B[1] + B[2] * B[2]);
    }
    /* a quad with its outward normal: `out` is a direction that should point away from the solid */
    function quad(i0, i1, i2, i3, v, alpha, ox, oy, oz) {
      var ax = V[3 * i2] - V[3 * i0], ay = V[3 * i2 + 1] - V[3 * i0 + 1], az = V[3 * i2 + 2] - V[3 * i0 + 2];
      var bx = V[3 * i3] - V[3 * i1], by = V[3 * i3 + 1] - V[3 * i1 + 1], bz = V[3 * i3 + 2] - V[3 * i1 + 2];
      var nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx, nn = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      if (nx * ox + ny * oy + nz * oz < 0) nn = -nn;
      Qd.push(i0, i1, i2, i3); qv.push(v); qa.push(alpha); qn.push(nx / nn, ny / nn, nz / nn);
    }
    var layers = st.cut ? LAY_CUT : LAY_GLASS, minor = 0, nmin = 0;
    layers.forEach(function (ly, li) {
      var nt = Math.max(8, Math.round(q.nt * ly.f)), span = TAU - 2 * ly.c, nz = Math.max(12, Math.round(q.nz * (0.35 + 0.65 * ly.f) * span / TAU)), base = V.length / 3;
      for (var j = 0; j <= nz; j++) for (var i = 0; i < nt; i++) { M.surf(ly.r, TAU * i / nt, ly.c + span * j / nz, p); vert(p[0], p[1], p[2]); }
      for (j = 0; j < nz; j++) {
        var zc = ly.c + span * (j + 0.5) / nz; axisPt(zc, a);
        for (i = 0; i < nt; i++) {
          var i2 = (i + 1) % nt, k0 = base + j * nt + i, k1 = base + j * nt + i2, k2 = base + (j + 1) * nt + i2, k3 = base + (j + 1) * nt + i;
          var cx = (V[3 * k0] + V[3 * k2]) / 2, cy = (V[3 * k0 + 1] + V[3 * k2 + 1]) / 2, cz = (V[3 * k0 + 2] + V[3 * k2 + 2]) / 2;
          quad(k0, k1, k2, k3, val(ly.r, TAU * (i + 0.5) / nt, zc), st.cut ? 0 : ly.a, cx - a[0], cy - a[1], cz - a[2]);
          if (li === 0) { minor += Math.hypot(cx - a[0], cy - a[1], cz - a[2]); nmin++; }
        }
      }
    });
    minor /= nmin || 1;
    /* end faces of the cut: a ring at each step, on both sides of the opening */
    if (st.cut) {
      var caps = [];
      LAY_CUT.forEach(function (ly, k) {
        var rin = k + 1 < LAY_CUT.length ? LAY_CUT[k + 1].r : 0, nt = Math.max(8, Math.round(q.nt * ly.f)), rings = k + 1 < LAY_CUT.length ? 2 : 3;
        caps.push({ ze: ly.c, r0: rin, r1: ly.r, nt: nt, rings: rings, sgn: -1 }, { ze: TAU - ly.c, r0: rin, r1: ly.r, nt: nt, rings: rings, sgn: 1 });
      });
      caps.forEach(function (cp) {
        axisPt(cp.ze - 1e-4, a); axisPt(cp.ze + 1e-4, b);
        var tx = (b[0] - a[0]) * cp.sgn, ty = (b[1] - a[1]) * cp.sgn, tz = (b[2] - a[2]) * cp.sgn, base = V.length / 3;
        for (var rr = 0; rr <= cp.rings; rr++) { var r = cp.r0 + (cp.r1 - cp.r0) * rr / cp.rings; for (var i = 0; i < cp.nt; i++) { M.surf(r, TAU * i / cp.nt, cp.ze, p); vert(p[0], p[1], p[2]); } }
        for (rr = 0; rr < cp.rings; rr++) for (i = 0; i < cp.nt; i++) {
          var i2 = (i + 1) % cp.nt, rm = cp.r0 + (cp.r1 - cp.r0) * (rr + 0.5) / cp.rings;
          quad(base + rr * cp.nt + i, base + rr * cp.nt + i2, base + (rr + 1) * cp.nt + i2, base + (rr + 1) * cp.nt + i, val(rm, TAU * (i + 0.5) / cp.nt, cp.ze), 0, tx, ty, tz);
        }
      });
    }
    var nq = qv.length;
    /* field lines on the edge surface, lifted a little so they sit on top of it */
    var lines = [], lift = 0.025 * minor, cutEdge = st.cut ? LAY_CUT[0].c : -1, zc0 = [0, 0];
    if (M.fam === 'f1') {
      for (var l = 0; l < 3; l++) {
        var n = 240, pts = [], zs = [];
        for (var i = 0; i <= n; i++) { var ze = TAU * i / n; M.surf(1, 0.35 + TAU * l / 3, ze, p); pts.push(p[0], p[1], p[2]); zs.push(ze); }
        lines.push({ pts: pts, zs: zs, closed: true });
      }
    } else {
      for (l = 0; l < 2; l++) {
        var tr = M.trace(1, 0.4 + PI * l, 3, minor / 30, 6), zs2 = [], pp = [];
        for (i = 0; i < tr.length; i += 3) { M.chiZeta(tr[i], tr[i + 1], tr[i + 2], zc0); var zz = zc0[1]; if (zz < 0) zz += TAU; zs2.push(zz); pp.push(tr[i], tr[i + 1], tr[i + 2]); }
        lines.push({ pts: pp, zs: zs2, closed: false });
      }
    }
    var lineDrift = 0;
    lines.forEach(function (ln, li) {
      ln.v0 = V.length / 3; ln.vis = [];
      for (var i = 0; i < ln.zs.length; i++) {
        var x = ln.pts[3 * i], y = ln.pts[3 * i + 1], z = ln.pts[3 * i + 2];
        lineDrift = Math.max(lineDrift, Math.abs(M.psi(x, y, z) / M.delta - 1));
        axisPt(ln.zs[i], a); var dx = x - a[0], dy = y - a[1], dz = z - a[2], dn = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        vert(x + lift * dx / dn, y + lift * dy / dn, z + lift * dz / dn);
        var zm = ln.zs[i] % TAU; ln.vis.push(!st.cut || (zm > cutEdge + 0.03 && zm < TAU - cutEdge - 0.03));
      }
      for (i = 0; i + 1 < ln.zs.length; i++) if (ln.vis[i] && ln.vis[i + 1]) { Sg.push(ln.v0 + i, ln.v0 + i + 1); sk.push(0); sl.push(li); }
    });
    /* the magnetic axis */
    var na = 160, av0 = V.length / 3, axA = st.cut ? -LAY_CUT[LAY_CUT.length - 1].c - 0.02 : 0, axB = st.cut ? -axA : TAU;
    for (i = 0; i <= na; i++) { axisPt(axA + (axB - axA) * i / na, p); vert(p[0], p[1], p[2]); }
    for (i = 0; i < na; i++) { Sg.push(av0 + i, av0 + i + 1); sk.push(1); sl.push(-1); }
    /* the mirror cage: the edge surface turned over about the x axis */
    var cage = [], mv0 = V.length / 3;
    /* in the cut-open view the cage covers the same toroidal range as the bottle; that range is its own mirror image */
    var cA = st.cut ? LAY_CUT[0].c : 0, cB = TAU - cA, nr = st.cut ? 13 : 16;
    for (var k = 0; k < nr; k++) { var ring = [], zk = st.cut ? cA + (cB - cA) * k / (nr - 1) : TAU * k / nr; for (i = 0; i <= 32; i++) { M.surf(1, TAU * i / 32, zk, p); ring.push(vert(p[0], -p[1], -p[2])); } cage.push(ring); }
    for (k = 0; k < 5; k++) { var tl = []; for (i = 0; i <= 120; i++) { M.surf(1, TAU * k / 5 + 0.2, cA + (cB - cA) * i / 120, p); tl.push(vert(p[0], -p[1], -p[2])); } cage.push(tl); }
    var maxis = []; for (i = 0; i <= 120; i++) { axisPt(axA + (axB - axA) * i / 120, p); maxis.push(vert(p[0], -p[1], -p[2])); }
    var nvMain = mv0;
    /* bounds of the bottle (and of its mirror image) for the camera */
    function bounds(i0, i1) { var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (var i = i0; i < i1; i++) for (var c = 0; c < 3; c++) { var v = V[3 * i + c]; if (v < lo[c]) lo[c] = v; if (v > hi[c]) hi[c] = v; } return [lo, hi]; }
    var bb = bounds(0, nvMain), bm = bounds(mv0, V.length / 3);
    geo = {
      V: new Float64Array(V), nv: V.length / 3, Q: new Int32Array(Qd), qv: new Float32Array(qv), qa: new Uint8Array(qa), qn: new Float32Array(qn), nq: nq,
      S: new Int32Array(Sg), sk: new Uint8Array(sk), sl: new Int16Array(sl), ns: sk.length, lines: lines, cage: cage, maxis: maxis, bb: bb, bm: bm, minor: minor
    };
    var n = geo.nv; geo.X = new Float32Array(n); geo.Y = new Float32Array(n); geo.Z = new Float32Array(n); geo.px = new Float32Array(n); geo.py = new Float32Array(n);
    /* color range */
    var lo = 1e9, hi = -1e9; for (i = 0; i < nq; i++) { if (qv[i] < lo) lo = qv[i]; if (qv[i] > hi) hi = qv[i]; }
    geo.vlo = lo; geo.vhi = hi;
    var eb = [1e9, -1e9]; // |B| on the edge surface
    for (i = 0; i < 400; i++) { M.surf(1, TAU * ((i * 0.618034) % 1), TAU * i / 400, p); M.B(p[0], p[1], p[2], B); var bmg = Math.hypot(B[0], B[1], B[2]); eb[0] = Math.min(eb[0], bmg); eb[1] = Math.max(eb[1], bmg); }
    info.edgeB = eb; info.lineDrift = lineDrift; info.minor = minor;
    setTarget();
    makeParticles();
    fastReadouts();
    clearTimeout(slowT); slowT = setTimeout(slow, 160);
    dirty = true;
  }
  function setTarget() {
    var lo = geo.bb[0].slice(), hi = geo.bb[1].slice();
    if (st.mirror) for (var c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], geo.bm[0][c]); hi[c] = Math.max(hi[c], geo.bm[1][c]); }
    cam.tcx = (lo[0] + hi[0]) / 2; cam.tcy = (lo[1] + hi[1]) / 2; cam.tcz = (lo[2] + hi[2]) / 2;
    cam.tR = 0.5 * Math.sqrt((hi[0] - lo[0]) * (hi[0] - lo[0]) + (hi[1] - lo[1]) * (hi[1] - lo[1]) + (hi[2] - lo[2]) * (hi[2] - lo[2]));
    if (cam.snap || reduced) { cam.cx = cam.tcx; cam.cy = cam.tcy; cam.cz = cam.tcz; cam.R = cam.tR; cam.snap = false; }
  }

  /* ---------- moving particles: beads that slide along the field lines ---------- */
  var beads = [];
  function makeParticles() {
    beads = [];
    geo.lines.forEach(function (ln, li) {
      var n = ln.zs.length, per = M.fam === 'f1' ? 7 : 16;
      for (var k = 0; k < per; k++) beads.push({ l: li, s: (n - 1) * (k + 0.5 * (li % 2)) / per, x: 0, y: 0, z: 0, on: false });
    });
  }
  function moveBeads(dt) {
    var spd = M.fam === 'f1' ? 22 : 30;
    beads.forEach(function (b) {
      var ln = geo.lines[b.l], n = ln.zs.length;
      b.s += spd * dt; if (b.s >= n - 1) b.s -= (n - 1);
      var i = Math.floor(b.s), u = b.s - i, j = Math.min(n - 1, i + 1), V = geo.V, a = ln.v0 + i, c = ln.v0 + j;
      b.x = V[3 * a] + (V[3 * c] - V[3 * a]) * u; b.y = V[3 * a + 1] + (V[3 * c + 1] - V[3 * a + 1]) * u; b.z = V[3 * a + 2] + (V[3 * c + 2] - V[3 * a + 2]) * u;
      b.on = ln.vis[i] && ln.vis[j];
    });
  }
  var sprite = (function () {
    var s = document.createElement('canvas'); s.width = s.height = 32; var g = s.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.25, 'rgba(255,224,150,0.9)'); gr.addColorStop(0.6, 'rgba(255,170,120,0.25)'); gr.addColorStop(1, 'rgba(255,150,120,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return s;
  })();

  /* ---------- projection ---------- */
  var VIEW = { s: 1, D: 3, ox: 0, oy: 0, cy: 1, sy: 0, cp: 1, sp: 0 };
  function setView() {
    VIEW.cy = Math.cos(cam.yaw); VIEW.sy = Math.sin(cam.yaw); VIEW.cp = Math.cos(cam.pitch); VIEW.sp = Math.sin(cam.pitch);
    VIEW.D = 3.4 * cam.R; VIEW.s = cam.zoom * Math.min(G.w, G.h * 1.15) * 0.5 / cam.R; VIEW.ox = G.w / 2; VIEW.oy = G.h / 2 + (G.w < 600 ? 10 : 0);
  }
  var tp = [0, 0, 0, 0, 0];
  function proj(x, y, z, o) {
    x -= cam.cx; y -= cam.cy; z -= cam.cz;
    var x1 = VIEW.cy * x - VIEW.sy * y, y1 = VIEW.sy * x + VIEW.cy * y;
    var Y = y1 * VIEW.sp + z * VIEW.cp, Z = y1 * VIEW.cp - z * VIEW.sp, k = VIEW.D / (VIEW.D + Z);
    o[0] = VIEW.ox + VIEW.s * x1 * k; o[1] = VIEW.oy - VIEW.s * Y * k; o[2] = Z; o[3] = x1; o[4] = Y; return o;
  }
  function projectAll() {
    var V = geo.V, n = geo.nv;
    for (var i = 0; i < n; i++) { proj(V[3 * i], V[3 * i + 1], V[3 * i + 2], tp); geo.px[i] = tp[0]; geo.py[i] = tp[1]; geo.Z[i] = tp[2]; geo.X[i] = tp[3]; geo.Y[i] = tp[4]; }
  }

  /* ---------- shading ---------- */
  var LX = -0.42, LY = 0.66, LZ = -0.62, ln0 = Math.sqrt(LX * LX + LY * LY + LZ * LZ); LX /= ln0; LY /= ln0; LZ /= ln0;
  var HX = LX, HY = LY, HZ = LZ - 1, hn = Math.sqrt(HX * HX + HY * HY + HZ * HZ); HX /= hn; HY /= hn; HZ /= hn;
  var colCache = {}, rgb = [0, 0, 0], ALPHA = [1, 0.3, 0.5];
  /* key = (((alpha class * 32 + color) * 33 + light) * 8 + specular) * 6 + rim */
  function shadeKey(key) {
    var s = colCache[key]; if (s) return s;
    var ri = key % 6, si = Math.floor(key / 6) % 8, li = Math.floor(key / 48) % 33, ci = Math.floor(key / 1584) % 32, ac = Math.floor(key / 50688);
    return shade(ci, li, si, ri, ac, key);
  }
  function shade(ci, li, si, ri, ac, key) {
    cmap(st.color, ci / 31, rgb);
    var lv = li / 32, sp = si / 7 * 0.42, rim = ri / 5 * 0.45, tint = st.color === 'p' ? [249, 168, 212] : [116, 192, 252];
    var out = [0, 0, 0];
    for (var c = 0; c < 3; c++) { var v = rgb[c] * lv; v += (255 - v) * sp; v += (tint[c] - v) * rim; out[c] = Math.round(clamp(v, 0, 255)); }
    var s = 'rgba(' + out[0] + ',' + out[1] + ',' + out[2] + ',' + ALPHA[ac] + ')';
    colCache[key] = s; return s;
  }

  /* ---------- drawing the 3-D view ---------- */
  var items = [], dmap = null;
  function draw() {
    var t0 = performance.now();
    G.fit(); setView(); projectAll();
    var w = G.w, h = G.h, X = geo.X, Y = geo.Y, Z = geo.Z, px = geo.px, py = geo.py, D = VIEW.D;
    ctx.clearRect(0, 0, w, h);
    var cpt = proj(cam.cx, cam.cy, cam.cz, [0, 0, 0, 0, 0]), glowR = VIEW.s * cam.R * 1.1;
    var gr = ctx.createRadialGradient(cpt[0], cpt[1], 0, cpt[0], cpt[1], glowR);
    gr.addColorStop(0, st.color === 'p' ? 'rgba(249,168,212,0.10)' : 'rgba(116,192,252,0.10)'); gr.addColorStop(1, 'rgba(6,17,26,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    if (st.mirror) drawFlipAxis();
    /* collect what to draw, farthest first */
    var nq = geo.nq, ns = geo.ns, nb = st.flow && st.lines ? beads.length : 0, tot = nq + ns + nb;
    if (!dmap || dmap.length < tot) dmap = new Float32Array(tot + 64);
    items.length = 0;
    var Q = geo.Q, qn = geo.qn, qa = geo.qa, bias = 0.6 * geo.minor * TAU / QL[qual].nt;
    var shadeIdx = geo.shadeIdx && geo.shadeIdx.length >= nq ? geo.shadeIdx : (geo.shadeIdx = new Int32Array(nq));
    var span = geo.vhi - geo.vlo || 1, cy = VIEW.cy, sy = VIEW.sy, cp = VIEW.cp, sp = VIEW.sp;
    for (var q = 0; q < nq; q++) {
      var a = Q[4 * q], b = Q[4 * q + 1], c = Q[4 * q + 2], d = Q[4 * q + 3];
      var cxm = (X[a] + X[b] + X[c] + X[d]) / 4, cym = (Y[a] + Y[b] + Y[c] + Y[d]) / 4, czm = (Z[a] + Z[b] + Z[c] + Z[d]) / 4;
      var nx = qn[3 * q], ny = qn[3 * q + 1], nz = qn[3 * q + 2];
      var n1 = cy * nx - sy * ny, n2y = sy * nx + cy * ny, NX = n1, NY = n2y * sp + nz * cp, NZ = n2y * cp - nz * sp;
      var vx = cxm, vy = cym, vz = czm + D, vn = Math.sqrt(vx * vx + vy * vy + vz * vz), dot = (NX * vx + NY * vy + NZ * vz) / vn;
      if (dot > 0) { if (qa[q] === 0) continue; NX = -NX; NY = -NY; NZ = -NZ; dot = -dot; }
      var diff = Math.max(0, NX * LX + NY * LY + NZ * LZ), spec = Math.pow(Math.max(0, NX * HX + NY * HY + NZ * HZ), 14), rim = Math.pow(1 + dot, 3);
      var ci = Math.round(clamp((geo.qv[q] - geo.vlo) / span, 0, 1) * 31);
      if (st.color === 'p') ci = Math.round((0.12 + 0.88 * geo.qv[q]) * 31);
      var li = Math.round(clamp(0.24 + 0.86 * diff, 0, 1) * 32), si = Math.round(clamp(spec, 0, 1) * 7), ri = Math.round(clamp(rim, 0, 1) * 5);
      shadeIdx[q] = (((qa[q] * 32 + ci) * 33 + li) * 8 + si) * 6 + ri;
      dmap[q] = czm; items.push(q);
    }
    var S = geo.S, sk = geo.sk;
    for (var s = 0; s < ns; s++) { if (sk[s] === 0 && !st.lines) continue; var i0 = S[2 * s], i1 = S[2 * s + 1]; dmap[nq + s] = (Z[i0] + Z[i1]) / 2 - bias; items.push(nq + s); }
    for (var k = 0; k < nb; k++) { var bd = beads[k]; if (!bd.on) continue; proj(bd.x, bd.y, bd.z, tp); bd.px = tp[0]; bd.py = tp[1]; bd.pz = tp[2]; dmap[nq + ns + k] = tp[2] - bias * 1.2; items.push(nq + ns + k); }
    items.sort(function (u, v) { return dmap[v] - dmap[u]; });
    var cnt = items.length, glass = !st.cut, sc = VIEW.s / 100;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (var j = 0; j < cnt; j++) {
      var it = items[j];
      if (it < nq) {
        a = Q[4 * it]; b = Q[4 * it + 1]; c = Q[4 * it + 2]; d = Q[4 * it + 3];
        ctx.fillStyle = shadeKey(shadeIdx[it]);
        var ax = px[a], ay = py[a], bx = px[b], by = py[b], cx2 = px[c], cy2 = py[c], dx = px[d], dy = py[d];
        if (!glass) { // grow each quad by about half a pixel so no seams show between neighbours
          var mx = (ax + bx + cx2 + dx) / 4, my = (ay + by + cy2 + dy) / 4, g1 = Math.abs(cx2 - ax) + Math.abs(cy2 - ay) + Math.abs(dx - bx) + Math.abs(dy - by), gk = 1 + 1.6 / (g1 + 0.5);
          ax = mx + (ax - mx) * gk; ay = my + (ay - my) * gk; bx = mx + (bx - mx) * gk; by = my + (by - my) * gk; cx2 = mx + (cx2 - mx) * gk; cy2 = my + (cy2 - my) * gk; dx = mx + (dx - mx) * gk; dy = my + (dy - my) * gk;
        }
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.lineTo(dx, dy); ctx.closePath(); ctx.fill();
      } else if (it < nq + ns) {
        /* a run of connected line segments that come one after another in depth order is drawn as one path */
        s = it - nq; i0 = S[2 * s]; i1 = S[2 * s + 1];
        var isAxis = sk[s] === 1;
        ctx.beginPath(); ctx.moveTo(px[i0], py[i0]); ctx.lineTo(px[i1], py[i1]);
        while (j + 1 < cnt) {
          var nx2 = items[j + 1] - nq; if (nx2 < 0 || nx2 >= ns || sk[nx2] !== sk[s] || S[2 * nx2] !== S[2 * s + 1]) break;
          s = nx2; j++; ctx.lineTo(px[S[2 * s + 1]], py[S[2 * s + 1]]);
        }
        ctx.strokeStyle = isAxis ? 'rgba(255,212,121,0.30)' : 'rgba(255,212,121,0.24)'; ctx.lineWidth = isAxis ? 6 : 5; ctx.stroke();
        ctx.strokeStyle = isAxis ? '#ffffff' : C.gold; ctx.lineWidth = isAxis ? 2 : 1.7; ctx.stroke();
      } else {
        bd = beads[it - nq - ns]; var r = clamp(9 * VIEW.D / (VIEW.D + bd.pz) * Math.max(0.7, Math.min(1.3, sc * 0.9)), 4, 12);
        ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(sprite, bd.px - r, bd.py - r, 2 * r, 2 * r); ctx.globalCompositeOperation = 'source-over';
      }
    }
    if (st.mirror) drawCage();
    dirty = false;
    var dt = performance.now() - t0; perf.ema = perf.n ? perf.ema * 0.95 + dt * 0.05 : dt; perf.n++;
    if (perf.n % 30 === 1) { cv.dataset.quality = qual; cv.dataset.ms = perf.ema.toFixed(1); } // for testing
    adapt();
  }
  function drawFlipAxis() {
    var ext = Math.max(cam.R * 1.25, Math.abs(geo.bb[0][0]) * 1.15, Math.abs(geo.bb[1][0]) * 1.15), a = proj(-ext, 0, 0, [0, 0, 0, 0, 0]), b = proj(ext, 0, 0, [0, 0, 0, 0, 0]);
    ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(219,231,239,0.5)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(219,231,239,0.75)'; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
    var lx = b[0] + (b[0] - a[0]) * 0.02, ly = b[1] + (b[1] - a[1]) * 0.02 - 8; ctx.fillText('flip axis (x)', clamp(lx, 40, G.w - 40), clamp(ly, 14, G.h - 6)); ctx.restore();
  }
  function drawCage() {
    var px = geo.px, py = geo.py, Z = geo.Z;
    ctx.save(); ctx.lineWidth = 1.2;
    geo.cage.forEach(function (pl) {
      for (var i = 0; i + 1 < pl.length; i++) {
        var a = pl[i], b = pl[i + 1], back = (Z[a] + Z[b]) / 2 > 0;
        ctx.strokeStyle = back ? 'rgba(249,168,212,0.32)' : 'rgba(249,168,212,0.85)';
        ctx.beginPath(); ctx.moveTo(px[a], py[a]); ctx.lineTo(px[b], py[b]); ctx.stroke();
      }
    });
    ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(249,168,212,0.95)'; ctx.beginPath();
    geo.maxis.forEach(function (v, i) { if (i) ctx.lineTo(px[v], py[v]); else ctx.moveTo(px[v], py[v]); }); ctx.stroke();
    ctx.restore();
  }
  function adapt() {
    if (perf.n === 40 && perf.ema > 24 && qual > 0 && !perf.lowered) { qual--; perf.lowered = true; perf.n = 0; needBuild = true; }
    else if (perf.n === 40 && perf.ema > 24 && qual > 0) { qual--; perf.n = 0; needBuild = true; }
    else if (perf.n === 150 && perf.ema < 7 && qual < 3 && !perf.lowered && !perf.raised) { qual++; perf.raised = true; perf.n = 0; needBuild = true; }
  }

  /* ---------- HUD, legend and numbers ---------- */
  function updateHud() {
    var P = st.P[st.fam], t = P.tau, sym = Math.abs(t) < 1e-9;
    var line1 = st.fam === 'f1' ? '<b>Family 1</b> · stretched Solov’ev · ι = 2' : '<b>Family 2</b> · complex phase · ' + (info.iota ? 'ι ' + f(info.iota[0], 2) + ' → ' + f(info.iota[info.iota.length - 1], 2) : 'sheared ι');
    var line2 = (st.fam === 'f1' ? 'τ₀' : 'τ₁') + ' = ' + f(t, 2) + ' · ' + (sym ? '<span class="mb-sym-ok">stellarator symmetric</span>' : '<span class="mb-sym-no">symmetry broken</span>');
    hud.innerHTML = line1 + '<br>' + line2;
    var bar = '<span class="mb-bar" style="background:' + cssGrad(st.color) + '"></span>';
    var lg = st.color === 'p' ? 'pressure: edge' + bar + 'core' : '|B|: ' + f(geo.vlo, 2) + bar + f(geo.vhi, 2);
    lg += '<br><i style="background:' + C.gold + '"></i>field line<i style="background:#fff"></i>axis';
    if (st.mirror) lg += '<i style="background:' + C.pink + '"></i>turned over';
    legend.innerHTML = lg;
  }
  function row(k, v) { return '<dt>' + k + '</dt><dd>' + v + '</dd>'; }
  function fastReadouts() {
    var P = st.P[st.fam], html = '';
    html += row('Volume <var>V</var>', f(M.volume, 3));
    html += row('Average β (β<sub>V</sub>)', f(100 * M.betaV, 2) + '%');
    if (M.fam === 'f1') html += row('Twist ι', '2, every surface');
    else html += row('Twist ι, axis → edge', info.iota ? f(info.iota[0], 3) + ' → ' + f(info.iota[info.iota.length - 1], 3) : '…');
    html += row('Pressure on the axis', f(M.pAxis, 4) + ' <span class="lab-small">(edge 0)</span>');
    html += row('|<b>B</b>| on the edge', f(info.edgeB[0], 2) + ' to ' + f(info.edgeB[1], 2));
    html += row('Mirror gap', info.gap === undefined ? '…' : info.gap.gap < 1e-6 * info.gap.minor ? '0 (symmetric)' : f(info.gap.gap, 3) + ' <span class="lab-small">(' + f(info.gap.gap / info.gap.minor, 1) + '× the plasma radius)</span>');
    html += row('Allowed δ', '0 to ' + f(M.dmax, M.fam === 'f1' ? 4 : 3));
    readEl.innerHTML = html;
    updateHud();
  }
  /* the expensive numbers wait until the sliders rest */
  function slow() {
    if (!M) return;
    var m = M;
    info.gap = MB.mirrorGap(m, 16, 48, 8, 24);
    if (m.fam === 'f2') {
      var rs = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
      info.iota = rs.map(function (x) { return m.iota(Math.sqrt(x)); });
      info.iota0 = Math.abs(m.P.tau) > 1e-9 ? rs.map(function (x) { return MB.make('f2', Object.assign({}, m.P, { tau: 0 })).iota(Math.sqrt(x)); }) : null;
    } else { info.iota = [2, 2]; info.iota0 = null; }
    fastReadouts(); drawIota(); runCheck(); drawSections();
  }
  function runCheck() {
    var c = MB.check(M, 60, seed), se = MB.surfErr(M, 3, 12, 24), extra, extraName;
    if (M.fam === 'f1') {
      var rnd = MB.rng(seed + 7), p = [0, 0, 0], q = [0, 0, 0], B = [0, 0, 0], e = 0, h = 1e-6;
      for (var i = 0; i < 40; i++) {
        var r = Math.sqrt(rnd()), th = TAU * rnd(), ze = TAU * rnd();
        M.surf(r, th, ze + h, p); M.surf(r, th, ze - h, q); var x = (p[0] + q[0]) / 2, y = (p[1] + q[1]) / 2, z = (p[2] + q[2]) / 2;
        M.surf(r, th, ze, p); M.B(p[0], p[1], p[2], B); var Om = M.Omega, bm = Math.hypot(B[0], B[1], B[2]);
        M.surf(r, th, ze + h, q); var qx = q[0], qy = q[1], qz = q[2]; M.surf(r, th, ze - h, q);
        e = Math.max(e, Math.hypot(Om * (qx - q[0]) / (2 * h) - B[0], Om * (qy - q[1]) / (2 * h) - B[1], Om * (qz - q[2]) / (2 * h) - B[2]) / bm);
      }
      extra = e; extraName = 'Field-line formula Ω <span class="mb-nb">d<b>x</b>/dζ = <b>B</b></span>';
    } else { extra = info.lineDrift; extraName = 'Traced field line stays on ψ = δ'; }
    function cell(v) { var ok = v < 1e-6; return sci(v) + ' <span class="' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓' : '✗') + '</span>'; }
    checkDl.innerHTML = row('∇ · <b>B</b> = 0', cell(c.div)) + row('<b>J</b> × <b>B</b> = ∇<var>p</var>', cell(c.force)) + row('(<b>B</b>·∇)<b>B</b> = −∇<var>Q</var>', cell(c.lorentz)) +
      row('<b>B</b> · ∇ψ = 0', cell(c.bpsi)) + row('Drawn surfaces on ψ = const', cell(se)) + row(extraName, cell(extra));
    checkNote.textContent = 'Each number is the largest relative error found at 60 random points inside the plasma (set ' + seed + '), with derivatives measured over tiny steps. Zero would be perfect; computer round-off alone gives about 10⁻¹⁰. A wrong formula would give numbers near 1.';
  }

  /* ---------- the iota chart ---------- */
  var IO = { cv: $('mb-iota'), hover: -1 }; IO.G = L.canvas(IO.cv);
  function drawIota() {
    var g = IO.G; g.fit(); var c = g.c, w = g.w, h = g.h, ys = info.iota || [2, 2], y0 = info.iota0;
    c.clearRect(0, 0, w, h);
    var all = ys.concat(y0 || []), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var mid = (lo + hi) / 2, half = Math.max(0.012, (hi - lo) / 2 * 1.25); lo = mid - half; hi = mid + half;
    var L0 = 44, R0 = 10, T0 = 12, B0 = 26, pw = w - L0 - R0, ph = h - T0 - B0;
    function X(t) { return L0 + pw * t; } function Y(v) { return T0 + ph * (1 - (v - lo) / (hi - lo)); }
    c.font = '10px system-ui,sans-serif'; c.fillStyle = C.muted; c.strokeStyle = 'rgba(120,170,200,0.18)'; c.lineWidth = 1;
    var step = niceStep((hi - lo) / 3), v0 = Math.ceil(lo / step) * step;
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (var v = v0; v <= hi + 1e-12; v += step) { var yy = Math.round(Y(v)) + 0.5; c.beginPath(); c.moveTo(L0, yy); c.lineTo(w - R0, yy); c.stroke(); c.fillText(f(v, step < 0.01 ? 3 : 2), L0 - 5, yy); }
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText('axis', X(0) + 10, h - B0 + 5); c.fillText('edge', X(1) - 12, h - B0 + 5); c.fillText('ψ / δ →', X(0.5), h - B0 + 5);
    c.textAlign = 'left'; c.textBaseline = 'top'; c.font = 'italic 12px Georgia,serif'; c.fillText('ι', 4, 2); c.font = '10px system-ui,sans-serif';
    function curve(arr, col, dash, wd) {
      c.setLineDash(dash); c.strokeStyle = col; c.lineWidth = wd; c.beginPath();
      arr.forEach(function (v, i) { var x = X(i / (arr.length - 1)), y = Y(v); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.setLineDash([]);
    }
    if (y0) curve(y0, C.blue, [5, 4], 1.6);
    curve(ys, C.gold, [], 2.2);
    if (IO.hover >= 0 && IO.hover < ys.length) {
      var i = IO.hover, x = X(i / (ys.length - 1));
      c.strokeStyle = 'rgba(219,231,239,0.4)'; c.beginPath(); c.moveTo(x, T0); c.lineTo(x, T0 + ph); c.stroke();
      c.fillStyle = C.gold; c.beginPath(); c.arc(x, Y(ys[i]), 4, 0, TAU); c.fill(); c.strokeStyle = '#06111a'; c.lineWidth = 2; c.stroke();
      var txt = 'ψ/δ = ' + f(i / (ys.length - 1), 3) + ': ι = ' + f(ys[i], 4) + (y0 ? ' (τ = 0: ' + f(y0[i], 4) + ')' : '');
      c.font = '11px system-ui,sans-serif'; var tw = c.measureText(txt).width + 12, tx = clamp(x - tw / 2, 2, w - tw - 2);
      c.fillStyle = 'rgba(11,27,39,0.92)'; c.fillRect(tx, 2, tw, 18); c.fillStyle = C.ink; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(txt, tx + 6, 11);
    }
    var tn = M.fam === 'f1' ? 'τ₀' : 'τ₁';
    $('mb-iota-cap').innerHTML = (M.fam === 'f1' ? 'Family 1 has ι = 2 on every surface: no shear. ' : 'How much the field lines twist, from the axis to the edge. ') +
      '<span class="mb-key" style="border-color:' + C.gold + '"></span> this bottle (' + tn + ' = ' + f(M.P.tau, 2) + ')' + (y0 ? ' &nbsp;<span class="mb-key dash" style="border-color:' + C.blue + '"></span> the same with ' + tn + ' = 0' : '');
  }
  function niceStep(x) { var e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; }
  IO.cv.addEventListener('pointermove', function (e) {
    var r = IO.cv.getBoundingClientRect(), t = (e.clientX - r.left - 44) / (r.width - 54), n = (info.iota || [0, 0]).length;
    var i = Math.round(clamp(t, 0, 1) * (n - 1)); if (i !== IO.hover) { IO.hover = i; drawIota(); }
  });
  IO.cv.addEventListener('pointerleave', function () { IO.hover = -1; drawIota(); });

  /* ---------- the four slices ---------- */
  var XS = { cv: $('mb-xs') }; XS.G = L.canvas(XS.cv);
  var PHIS = [0, PI / 4, PI / 2, 3 * PI / 4], PHIN = ['φ = 0°', 'φ = 45°', 'φ = 90°', 'φ = 135°'];
  var heat = document.createElement('canvas'), hctx = heat.getContext('2d');
  function drawSections() {
    if (!M) return;
    var box = XS.cv.parentNode, W = box.clientWidth - 16; if (W < 100) return;
    var cols = W >= 640 ? 4 : 2, rows = 4 / cols, gap = 10, mt = 20, mb = 18, ml = 34, mr = 6;
    var cw = (W - gap * (cols - 1)) / cols, pw = cw - ml - mr;
    var data = PHIS.map(function (phi) {
      var cur = MB.section(M, 1, phi, 96), gh = M0 ? MB.section(M0, 1, phi, 96) : null, mi = null;
      if (st.mirror) { mi = MB.section(M, 1, -phi, 96); for (var i = 1; i < mi.length; i += 2) mi[i] = -mi[i]; }
      var lo = [1e9, 1e9], hi = [-1e9, -1e9];
      [cur, gh, mi].forEach(function (a) { if (!a) return; for (var i = 0; i < a.length; i += 2) { if (!(a[i] === a[i])) continue; lo[0] = Math.min(lo[0], a[i]); hi[0] = Math.max(hi[0], a[i]); lo[1] = Math.min(lo[1], a[i + 1]); hi[1] = Math.max(hi[1], a[i + 1]); } });
      return { phi: phi, cur: cur, gh: gh, mi: mi, lo: lo, hi: hi, ax: MB.section(M, 0, phi, 1), ax0: M0 ? MB.section(M0, 0, phi, 1) : null };
    });
    var sR = 0, sZ = 0; data.forEach(function (d) { sR = Math.max(sR, d.hi[0] - d.lo[0]); sZ = Math.max(sZ, d.hi[1] - d.lo[1]); });
    var ph = clamp(pw * sZ / sR, 0.55 * pw, 1.25 * pw), scale = Math.max(sR / pw, sZ / ph) * 1.16;
    var H = rows * (ph + mt + mb) + (rows - 1) * gap;
    XS.cv.style.height = Math.round(H) + 'px'; var g = XS.G; g.fit(); var c = g.c; c.clearRect(0, 0, g.w, g.h);
    var N = W < 640 ? 64 : 92, rgbv = [0, 0, 0];
    data.forEach(function (d, k) {
      var col = k % cols, rw = Math.floor(k / cols), x0 = col * (cw + gap) + ml, y0 = rw * (ph + mt + mb + gap) + mt;
      var Rc = (d.lo[0] + d.hi[0]) / 2, Zc = (d.lo[1] + d.hi[1]) / 2, R0 = Rc - pw / 2 * scale, Z1 = Zc + ph / 2 * scale;
      function sx(R) { return x0 + (R - R0) / scale; } function sy(z) { return y0 + (Z1 - z) / scale; }
      c.save(); c.beginPath(); c.rect(x0, y0, pw, ph); c.clip();
      c.fillStyle = '#081a28'; c.fillRect(x0, y0, pw, ph);
      /* psi on a grid of nodes */
      var nx = N, nz = Math.max(16, Math.round(N * ph / pw)), cs = Math.cos(d.phi), sn = Math.sin(d.phi), grid = new Float64Array((nx + 1) * (nz + 1));
      for (var j = 0; j <= nz; j++) for (var i = 0; i <= nx; i++) { var R = R0 + pw * scale * i / nx, z = Z1 - ph * scale * j / nz; grid[j * (nx + 1) + i] = R > 0 ? M.psi(R * cs, R * sn, z) / M.delta : NaN; }
      /* pressure as a glowing heat map */
      heat.width = nx + 1; heat.height = nz + 1; var img = hctx.createImageData(nx + 1, nz + 1);
      for (i = 0; i < grid.length; i++) { var u = grid[i]; if (u >= 0 && u <= 1) { cmap('p', 1 - u, rgbv); img.data[4 * i] = rgbv[0]; img.data[4 * i + 1] = rgbv[1]; img.data[4 * i + 2] = rgbv[2]; img.data[4 * i + 3] = 255; } }
      hctx.putImageData(img, 0, 0); c.imageSmoothingEnabled = true;
      var cellw = pw / nx, cellh = ph / nz; c.drawImage(heat, x0 - cellw / 2, y0 - cellh / 2, pw + cellw, ph + cellh);
      /* faint grid */
      var st2 = niceStep(pw * scale / 3); c.strokeStyle = 'rgba(120,170,200,0.12)'; c.lineWidth = 1;
      for (var v = Math.ceil(R0 / st2) * st2; v < R0 + pw * scale; v += st2) { c.beginPath(); c.moveTo(Math.round(sx(v)) + 0.5, y0); c.lineTo(Math.round(sx(v)) + 0.5, y0 + ph); c.stroke(); }
      for (v = Math.ceil((Z1 - ph * scale) / st2) * st2; v < Z1; v += st2) { c.beginPath(); c.moveTo(x0, Math.round(sy(v)) + 0.5); c.lineTo(x0 + pw, Math.round(sy(v)) + 0.5); c.stroke(); }
      /* contours by marching squares */
      [0.2, 0.4, 0.6, 0.8, 1].forEach(function (lv) {
        c.strokeStyle = lv === 1 ? C.gold : 'rgba(255,255,255,0.38)'; c.lineWidth = lv === 1 ? 2 : 1; c.beginPath();
        march(grid, nx, nz, lv, function (ax, az, bx, bz) { c.moveTo(x0 + ax * pw / nx, y0 + az * ph / nz); c.lineTo(x0 + bx * pw / nx, y0 + bz * ph / nz); });
        c.stroke();
      });
      function poly(a, col, dash, wd) {
        if (!a) return; c.setLineDash(dash); c.strokeStyle = col; c.lineWidth = wd; c.beginPath();
        var n = a.length / 2, pen = false;
        for (var i = 0; i <= n; i++) { var k2 = 2 * (i % n); if (!(a[k2] === a[k2])) { pen = false; continue; } if (pen) c.lineTo(sx(a[k2]), sy(a[k2 + 1])); else c.moveTo(sx(a[k2]), sy(a[k2 + 1])); pen = true; }
        c.stroke(); c.setLineDash([]);
      }
      if (d.gh && Math.abs(M.P.tau) > 1e-9) { poly(d.gh, 'rgba(116,192,252,0.85)', [5, 4], 1.4); c.strokeStyle = 'rgba(116,192,252,0.85)'; c.lineWidth = 1.4; c.beginPath(); c.arc(sx(d.ax0[0]), sy(d.ax0[1]), 3.5, 0, TAU); c.stroke(); }
      if (d.mi) poly(d.mi, 'rgba(249,168,212,0.95)', [3, 3], 1.5);
      c.fillStyle = '#fff'; c.shadowColor = C.gold; c.shadowBlur = 8; c.beginPath(); c.arc(sx(d.ax[0]), sy(d.ax[1]), 3, 0, TAU); c.fill(); c.shadowBlur = 0;
      c.restore();
      c.strokeStyle = 'rgba(120,170,200,0.3)'; c.lineWidth = 1; c.strokeRect(x0 + 0.5, y0 + 0.5, pw - 1, ph - 1);
      /* labels */
      c.fillStyle = C.ink; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'bottom'; c.fillText(PHIN[k], x0, y0 - 4);
      c.fillStyle = C.muted; c.font = '10px system-ui,sans-serif'; c.textBaseline = 'top'; c.textAlign = 'center';
      for (v = Math.ceil(R0 / st2) * st2; v < R0 + pw * scale - 1e-9; v += st2) { var xx = sx(v); if (xx > x0 + 10 && xx < x0 + pw - 20) c.fillText(f(v, st2 < 0.1 ? 2 : 1), xx, y0 + ph + 3); }
      c.textAlign = 'right'; c.textBaseline = 'middle';
      for (v = Math.ceil((Z1 - ph * scale) / st2) * st2; v < Z1; v += st2) { var yy = sy(v); if (yy > y0 + 6 && yy < y0 + ph - 6) c.fillText(f(v, st2 < 0.1 ? 2 : 1), x0 - 4, yy); }
      c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('z', x0 + 4, y0 + 3);
      c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText('R', x0 + pw - 1, y0 + ph + 3);
    });
    $('mb-xs-cap').innerHTML = 'Rings: ψ/δ = 0.2, 0.4, 0.6, 0.8 (white) and the edge, ψ = δ (gold). White dot: the magnetic axis. ' +
      (Math.abs(M.P.tau) > 1e-9 ? (M0 ? 'Dashed blue: the edge and axis with τ = 0. ' : 'With τ = 0 this δ would be too big for nested surfaces, so no τ = 0 outline is shown. ') : 'τ = 0 here, so this bottle is stellarator symmetric. ') +
      (st.mirror ? 'Pink: the edge of the bottle turned over. ' : '') + 'R is the distance from the vertical center line, z the height.';
  }
  /* marching squares on a node grid g (row-major, (nx+1) x (nz+1)); calls seg(i, j, i, j) in grid units */
  function march(g, nx, nz, lv, seg) {
    var w = nx + 1;
    function lerp(a, b) { return (lv - a) / (b - a); }
    for (var j = 0; j < nz; j++) for (var i = 0; i < nx; i++) {
      var a = g[j * w + i], b = g[j * w + i + 1], c = g[(j + 1) * w + i + 1], d = g[(j + 1) * w + i];
      if (!(a === a && b === b && c === c && d === d)) continue;
      var k = (a > lv ? 1 : 0) | (b > lv ? 2 : 0) | (c > lv ? 4 : 0) | (d > lv ? 8 : 0);
      if (k === 0 || k === 15) continue;
      var T = [i + lerp(a, b), j], Rt = [i + 1, j + lerp(b, c)], Bt = [i + lerp(d, c), j + 1], Lt = [i, j + lerp(a, d)];
      var segs;
      switch (k) {
        case 1: case 14: segs = [[Lt, T]]; break;
        case 2: case 13: segs = [[T, Rt]]; break;
        case 3: case 12: segs = [[Lt, Rt]]; break;
        case 4: case 11: segs = [[Rt, Bt]]; break;
        case 6: case 9: segs = [[T, Bt]]; break;
        case 7: case 8: segs = [[Lt, Bt]]; break;
        case 5: segs = [[Lt, T], [Rt, Bt]]; break;
        case 10: segs = [[T, Rt], [Bt, Lt]]; break;
      }
      for (var s = 0; s < segs.length; s++) seg(segs[s][0][0], segs[s][0][1], segs[s][1][0], segs[s][1][1]);
    }
  }

  /* ---------- the panel: family, presets, sliders, toggles ---------- */
  var famBtns = root.querySelectorAll('[data-fam]'), colBtns = root.querySelectorAll('[data-color]');
  function sliderMax(s) { return s.k === 'delta' ? Math.floor(0.98 * MB.make(st.fam, st.P[st.fam]).dmax / s.step) * s.step : s.max; }
  function buildPanel() {
    famBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.fam === st.fam ? 'true' : 'false'); });
    $('mb-about').textContent = ABOUT[st.fam];
    $('mb-pre-label').textContent = PRE[st.fam].label;
    $('mb-presets').innerHTML = PRE[st.fam].items.map(function (it, i) { return '<button type="button" data-pre="' + i + '" aria-pressed="false">' + it.t + '</button>'; }).join('');
    $('mb-sliders').innerHTML = SL[st.fam].map(function (s) {
      var id = 'mb-s-' + s.k;
      return '<div class="lab-field"><span><label for="' + id + '">' + s.name + (s.k === 'delta' ? ' <small id="mb-dmax"></small>' : '') + '</label><output id="' + id + '-o" for="' + id + '"></output></span>' +
        '<input type="range" id="' + id + '" data-k="' + s.k + '" min="' + s.min + '" max="' + (s.max || 1) + '" step="' + s.step + '"></div>';
    }).join('');
    syncSliders();
  }
  function syncSliders() {
    var P = st.P[st.fam];
    SL[st.fam].forEach(function (s) {
      var el = $('mb-s-' + s.k), out = $('mb-s-' + s.k + '-o');
      if (s.k === 'delta') { var mx = sliderMax(s); el.max = mx; if (P.delta > mx) P.delta = mx; $('mb-dmax').textContent = '(max ' + f(MB.make(st.fam, P).dmax, s.d) + ')'; }
      el.value = P[s.k]; out.textContent = s.k === 'delta' && Math.abs(P.delta - 1 / 64) < 1e-12 ? '1/64' : f(P[s.k], s.d);
      el.setAttribute('aria-valuetext', s.name + ' ' + out.textContent);
    });
    var pre = PRE[st.fam];
    $('mb-presets').querySelectorAll('button').forEach(function (b) {
      var it = pre.items[+b.dataset.pre], on = Math.abs(P.tau - it.tau) < 1e-9; for (var k in pre.base) if (Math.abs(P[k] - pre.base[k]) > 1e-9) on = false;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function changed() { syncSliders(); save(); needBuild = true; }
  root.addEventListener('input', function (e) {
    var k = e.target.dataset && e.target.dataset.k; if (!k) return;
    st.P[st.fam][k] = +e.target.value; changed();
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    if (b.dataset.fam && b.dataset.fam !== st.fam) { st.fam = b.dataset.fam; info = {}; cam.snap = true; buildPanel(); save(); needBuild = true; }
    else if (b.dataset.pre !== undefined) {
      var pre = PRE[st.fam], it = pre.items[+b.dataset.pre];
      Object.assign(st.P[st.fam], pre.base, { tau: it.tau }); changed();
      L.toast(view, it.tau === 0 ? 'τ = 0: Landreman’s stellarator-symmetric bottle' : 'τ = ' + f(it.tau, 1) + ': stellarator symmetry broken');
    }
    else if (b.dataset.color) { st.color = b.dataset.color; colCache = {}; colBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); save(); needBuild = true; }
  });
  function bindChk(id, key, rebuild) {
    var el = $(id); el.checked = st[key];
    el.addEventListener('change', function () {
      st[key] = el.checked; save();
      if (key === 'mirror') { setTarget(); drawSections(); fastReadouts(); if (el.checked) L.toast(view, Math.abs(st.P[st.fam].tau) < 1e-9 ? 'The turned-over bottle fits exactly: symmetric' : 'Pink: the bottle turned over. It does not fit.'); }
      if (rebuild) needBuild = true; dirty = true;
    });
  }
  bindChk('mb-cut', 'cut', true); bindChk('mb-mirror', 'mirror', false); bindChk('mb-lines', 'lines', false); bindChk('mb-flow', 'flow', false);
  colBtns.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.color === st.color ? 'true' : 'false'); });
  $('mb-recheck').addEventListener('click', function () { seed++; runCheck(); });

  /* ---------- turning, zooming ---------- */
  var spinBtn = $('mb-spin');
  function setSpin(on) { cam.spin = on; spinBtn.textContent = on ? '❚❚' : '▶'; spinBtn.setAttribute('aria-label', on ? 'Stop the slow spin' : 'Start the slow spin'); spinBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); dirty = true; }
  setSpin(cam.spin);
  spinBtn.addEventListener('click', function () { setSpin(!cam.spin); });
  $('mb-home').addEventListener('click', function () { cam.yaw = YAW0; cam.pitch = PITCH0; cam.zoom = 1; dirty = true; });
  function zoom(k) { cam.zoom = clamp(cam.zoom * k, 0.4, 5); dirty = true; }
  $('mb-zin').addEventListener('click', function () { zoom(1.2); });
  $('mb-zout').addEventListener('click', function () { zoom(1 / 1.2); });
  cv.addEventListener('pointerdown', function (e) {
    try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; nptr = Object.keys(ptrs).length;
    if (nptr === 2) { var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: cam.zoom }; }
    drag = true;
  });
  cv.addEventListener('pointermove', function (e) {
    var p = ptrs[e.pointerId]; if (!p) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (nptr >= 2 && pinch) { var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]]; cam.zoom = clamp(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, 0.4, 5); }
    else { cam.yaw += dx * 0.009; cam.pitch = clamp(cam.pitch + dy * 0.008, -1.45, 1.45); }
    dirty = true;
  });
  function up(e) { delete ptrs[e.pointerId]; nptr = Object.keys(ptrs).length; if (nptr < 2) pinch = null; if (!nptr) drag = null; }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); zoom(Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, done = true;
    if (k === 'ArrowLeft') cam.yaw -= 0.1; else if (k === 'ArrowRight') cam.yaw += 0.1;
    else if (k === 'ArrowUp') cam.pitch = clamp(cam.pitch - 0.08, -1.45, 1.45); else if (k === 'ArrowDown') cam.pitch = clamp(cam.pitch + 0.08, -1.45, 1.45);
    else if (k === '+' || k === '=') zoom(1.2); else if (k === '-' || k === '_') zoom(1 / 1.2);
    else if (k === '0') { cam.yaw = YAW0; cam.pitch = PITCH0; cam.zoom = 1; }
    else if (k === ' ') setSpin(!cam.spin);
    else if (k === 'c' || k === 'C') $('mb-cut').click();
    else if (k === 'm' || k === 'M') $('mb-mirror').click();
    else done = false;
    if (done) { e.preventDefault(); dirty = true; }
  });

  /* ---------- the frame loop ---------- */
  buildPanel();
  var rsT = 0;
  window.addEventListener('resize', function () { dirty = true; clearTimeout(rsT); rsT = setTimeout(function () { drawSections(); drawIota(); }, 150); });
  L.loop(function (dt) {
    if (needBuild) build();
    var moving = false;
    if (cam.spin && !drag) { cam.yaw += dt * 0.16; moving = true; }
    var k = 1 - Math.exp(-dt * 5), dc = Math.abs(cam.tcx - cam.cx) + Math.abs(cam.tcy - cam.cy) + Math.abs(cam.tcz - cam.cz) + Math.abs(cam.tR - cam.R);
    if (dc > 1e-5) { cam.cx += (cam.tcx - cam.cx) * k; cam.cy += (cam.tcy - cam.cy) * k; cam.cz += (cam.tcz - cam.cz) * k; cam.R += (cam.tR - cam.R) * k; moving = true; }
    if (st.flow && st.lines && beads.length) { moveBeads(reduced ? 0 : dt); if (!reduced) moving = true; }
    if (moving || dirty) draw();
  }, view);
})();
