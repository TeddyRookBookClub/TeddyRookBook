/* Circuit Builder: the electrical model. Pure functions, no page code, so it can be tested in node.
   The board is a grid of COLS × ROWS cells. Wires are unit edges between neighbouring grid points.
   Every part is two cells long: its terminals are the grid points one step either side of its centre.
   solve(board) finds the DC operating point with modified nodal analysis:
   - everything joined by wires, closed switches and ammeters is one node (they have no resistance);
   - batteries are an EMF with a small internal resistance (stamped as a Norton equivalent);
   - bulbs, resistors, the buzzer and the voltmeter are resistors;
   - an LED is a Shockley diode in series with a small resistance, solved by Newton's method with
     SPICE's junction-voltage limiting;
   - one node of each connected piece is the 0 V reference, and a tiny conductance (gmin) to ground keeps
     floating nodes solvable.
   Afterwards, the current in each wire segment comes from spreading each node's currents over its wires
   as if every unit of wire had the same tiny resistance. */
(function (root) {
  'use strict';
  var COLS = 12, ROWS = 8, NX = COLS + 1, NY = ROWS + 1, NP = NX * NY;
  var Q = 1.602176634e-19, KB = 1.380649e-23;            // exact SI values (NIST CODATA 2018)
  var VT = KB * 300 / Q;                                  // thermal voltage at 300 K: 0.025852 V
  var LED_N = 2, LED_NVT = LED_N * VT, LED_RS = 10, LED_IREF = 0.020, LED_IMAX = 0.040;
  var GMIN = 1e-12, GSHUNT = 1e-15;   // S: across each LED junction, and from every node to ground
  var SHORT_I = 2;                                        // A: a battery giving more than this is (nearly) short-circuited

  var LED_COLORS = {
    red: { name: 'Red', vf: 2.0, nm: 630, hex: '#ff6b6b' },
    yellow: { name: 'Yellow', vf: 2.1, nm: 590, hex: '#ffd43b' },
    green: { name: 'Green', vf: 2.2, nm: 565, hex: '#69db7c' },
    blue: { name: 'Blue', vf: 3.2, nm: 470, hex: '#4dabf7' }
  };
  // saturation current that gives the typical forward voltage at 20 mA
  function ledIs(color) {
    var c = LED_COLORS[color] || LED_COLORS.red;
    return LED_IREF / (Math.exp((c.vf - LED_IREF * LED_RS) / LED_NVT) - 1);
  }
  var RES_VALUES = [1, 2.2, 4.7, 10, 22, 47, 100, 220, 330, 470, 1000, 2200, 4700, 10000, 100000];

  var TYPES = {
    cell: { name: '1.5 V cell', emf: 1.5, r: 0.2, polar: true, src: true },
    battery9: { name: '9 V battery', emf: 9, r: 1.5, polar: true, src: true },
    bulb: { name: 'Bulb', R: 10, ratedV: 3, ratedI: 0.3, ratedP: 0.9, burnAt: 3 },
    resistor: { name: 'Resistor', R: 100, ratedP: 0.25 },
    led: { name: 'LED', polar: true },
    sw: { name: 'Switch', zero: true },
    buzzer: { name: 'Buzzer', R: 200 },
    ammeter: { name: 'Ammeter', polar: true, zero: true },
    voltmeter: { name: 'Voltmeter', R: 1e7, polar: true }
  };

  function idx(x, y) { return y * NX + x; }
  function px(i) { return i % NX; }
  function py(i) { return (i - i % NX) / NX; }
  function inGrid(x, y) { return x >= 0 && y >= 0 && x <= COLS && y <= ROWS; }
  function ekey(i, j) { return i < j ? i + '-' + j : j + '-' + i; }
  function eparse(k) { var s = k.split('-'); return [+s[0], +s[1]]; }

  // terminal points [t0, t1] of a part; t0 is + for batteries, the anode for an LED, the red lead for meters
  function ends(p) {
    var dx = p.o === 'h' ? 1 : 0, dy = 1 - dx;
    var a = [p.x - dx, p.y - dy], b = [p.x + dx, p.y + dy];
    return p.f ? [b, a] : [a, b];
  }
  function isZero(p, sw) {
    if (p.burned) return false;
    if (p.t === 'ammeter') return true;
    if (p.t === 'sw') return sw && Object.prototype.hasOwnProperty.call(sw, p.id) ? !!sw[p.id] : !!p.on;
    return false;
  }

  // can part p sit there? (ignoreId: the part being moved)
  function canPlace(board, p, ignoreId) {
    var e = ends(p), c = [p.x, p.y], i, q, qe;
    if (!inGrid(p.x, p.y) || !inGrid(e[0][0], e[0][1]) || !inGrid(e[1][0], e[1][1])) return 'edge';
    for (i = 0; i < board.parts.length; i++) {
      q = board.parts[i]; if (q.id === ignoreId) continue;
      qe = ends(q);
      if (q.x === p.x && q.y === p.y) return 'part';
      if (same(c, qe[0]) || same(c, qe[1])) return 'part';
      if (same([q.x, q.y], e[0]) || same([q.x, q.y], e[1])) return 'part';
    }
    var ci = idx(p.x, p.y);
    for (var k in board.wires) { var ij = eparse(k); if (ij[0] === ci || ij[1] === ci) return 'wire'; }
    return '';
  }
  function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }
  // can a wire join neighbouring points i and j?
  function canWire(board, i, j) {
    var dx = Math.abs(px(i) - px(j)), dy = Math.abs(py(i) - py(j));
    if (dx + dy !== 1) return false;
    for (var n = 0; n < board.parts.length; n++) { var c = idx(board.parts[n].x, board.parts[n].y); if (c === i || c === j) return false; }
    return true;
  }

  function UF(n) { this.p = new Int32Array(n); for (var i = 0; i < n; i++) this.p[i] = i; }
  UF.prototype.find = function (i) { var p = this.p; while (p[i] !== i) { p[i] = p[p[i]]; i = p[i]; } return i; };
  UF.prototype.union = function (a, b) { a = this.find(a); b = this.find(b); if (a !== b) this.p[b] = a; };

  // dense Gaussian elimination with partial pivoting; solves A x = b in place
  function gauss(A, b) {
    var n = b.length, i, j, k;
    for (k = 0; k < n; k++) {
      var piv = k, mx = Math.abs(A[k][k]);
      for (i = k + 1; i < n; i++) { var v = Math.abs(A[i][k]); if (v > mx) { mx = v; piv = i; } }
      if (mx < 1e-300) { A[k][k] = 1e-300; continue; }
      if (piv !== k) { var t = A[k]; A[k] = A[piv]; A[piv] = t; var tb = b[k]; b[k] = b[piv]; b[piv] = tb; }
      var rk = A[k], akk = rk[k];
      for (i = k + 1; i < n; i++) {
        var ri = A[i], f = ri[k] / akk; if (f === 0) continue;
        for (j = k; j < n; j++) ri[j] -= f * rk[j];
        b[i] -= f * b[k];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = b[i], r = A[i]; for (j = i + 1; j < n; j++) s -= r[j] * x[j]; x[i] = s / r[i]; }
    return x;
  }
  function zeros(n) { var a = new Array(n); for (var i = 0; i < n; i++) a[i] = 0; return a; }
  function matrix(n) { var m = new Array(n); for (var i = 0; i < n; i++) m[i] = zeros(n); return m; }

  function diodeI(Is, vd) { var a = vd / LED_NVT; if (a > 80) return Is * (Math.exp(80) * (1 + a - 80) - 1); return Is * (Math.exp(a) - 1); }
  function diodeG(Is, vd) { var a = vd / LED_NVT; return Is / LED_NVT * Math.exp(Math.min(a, 80)); }
  // SPICE3 pnjlim: keeps Newton's steps on the exponential sane
  function pnjlim(vnew, vold, vt, vcrit) {
    if (vnew > vcrit && Math.abs(vnew - vold) > vt + vt) {
      if (vold > 0) { var arg = 1 + (vnew - vold) / vt; vnew = arg > 0 ? vold + vt * Math.log(arg) : vcrit; }
      else vnew = vt * Math.log(vnew / vt);
      return { v: vnew, lim: true };
    }
    return { v: vnew, lim: false };
  }

  /* solve(board, opt): opt.sw = {id: bool} overrides switch states, opt.skip = {id: true} leaves parts out,
     opt.noFlow skips the wire currents. Returns per-part v (volts, t0 minus t1), i (amps, t0 → t1 through the part),
     p (watts taken by the part; negative for a battery that delivers), out (amps a battery delivers), wire currents, shorts. */
  function solve(board, opt) {
    opt = opt || {};
    var parts = board.parts, skip = opt.skip || {}, sw = opt.sw;
    var uf = new UF(NP), k, n, p, i;
    for (k in board.wires) { var ij = eparse(k); uf.union(ij[0], ij[1]); }
    var live = [];
    for (n = 0; n < parts.length; n++) {
      p = parts[n]; if (skip[p.id]) continue;
      var e = ends(p); p._a = idx(e[0][0], e[0][1]); p._b = idx(e[1][0], e[1][1]);
      live.push(p);
      if (isZero(p, sw)) uf.union(p._a, p._b);
    }
    var nodeOf = {}, N = 0;
    function node(pt) { var r = uf.find(pt); if (!(r in nodeOf)) nodeOf[r] = N++; return nodeOf[r]; }
    var els = [], leds = [];
    for (n = 0; n < live.length; n++) {
      p = live[n]; var T = TYPES[p.t];
      if (p.burned || isZero(p, sw) || p.t === 'sw') continue;   // open switches and burned parts carry nothing
      var a = node(p._a), b = node(p._b);
      if (T.src) els.push({ k: 'src', p: p, a: a, b: b, E: T.emf, G: 1 / T.r });
      else if (p.t === 'led') { var L = { k: 'led', p: p, a: a, b: b, m: -1, Is: ledIs(p.c), vd: 0 }; els.push(L); leds.push(L); }
      else els.push({ k: 'res', p: p, a: a, b: b, G: 1 / resOf(p) });
    }
    for (n = 0; n < leds.length; n++) leds[n].m = N++;
    // connected pieces and their 0 V reference
    var cu = new UF(Math.max(1, N));
    for (n = 0; n < els.length; n++) { cu.union(els[n].a, els[n].b); if (els[n].k === 'led') cu.union(els[n].a, els[n].m); }
    var ref = {}, isRef = zeros(N);
    for (n = 0; n < els.length; n++) if (els[n].k === 'src') { var rr = cu.find(els[n].b); if (!(rr in ref)) ref[rr] = els[n].b; }
    for (i = 0; i < N; i++) { var ri = cu.find(i); if (!(ri in ref)) ref[ri] = i; }
    for (k in ref) isRef[ref[k]] = 1;

    var V = zeros(N), iter = 0, converged = N === 0;
    var vcrit = {};
    for (n = 0; n < leds.length; n++) vcrit[n] = LED_NVT * Math.log(LED_NVT / (Math.SQRT2 * leds[n].Is));
    while (!converged && iter < 400) {
      iter++;
      var A = matrix(N), B = zeros(N);
      for (n = 0; n < els.length; n++) {
        var el = els[n];
        if (el.k === 'res' || el.k === 'src') {
          stamp(A, el.a, el.b, el.G);
          if (el.k === 'src') { B[el.a] += el.E * el.G; B[el.b] -= el.E * el.G; }
        } else {
          var gd = diodeG(el.Is, el.vd) + GMIN, id = diodeI(el.Is, el.vd), ieq = id - gd * el.vd;
          stamp(A, el.a, el.m, gd); B[el.a] -= ieq; B[el.m] += ieq;
          stamp(A, el.m, el.b, 1 / LED_RS);
        }
      }
      for (i = 0; i < N; i++) {
        if (isRef[i]) { A[i] = zeros(N); A[i][i] = 1; B[i] = 0; }
        else A[i][i] += GSHUNT;
      }
      var Vn = gauss(A, B);
      converged = true;
      for (n = 0; n < leds.length; n++) {
        var L2 = leds[n], vnew = Vn[L2.a] - Vn[L2.m], lim = pnjlim(vnew, L2.vd, LED_NVT, vcrit[n]);
        // converged when the junction voltage has settled, or its current has (a floating LED's voltage is only weakly defined)
        if (lim.lim || (Math.abs(lim.v - L2.vd) > 1e-9 && Math.abs(diodeI(L2.Is, lim.v) - diodeI(L2.Is, L2.vd)) > 1e-13 + 1e-9 * Math.abs(diodeI(L2.Is, L2.vd)))) converged = false;
        L2.vd = lim.v;
      }
      V = Vn;
    }
    // results
    var res = { v: {}, i: {}, p: {}, out: {}, wire: {}, shorts: [], over: [], nodeOf: nodeOf, uf: uf, iter: iter, converged: converged, srcP: 0, loadP: 0, lossP: 0 };
    function nv(pt) { var r = uf.find(pt); return r in nodeOf ? V[nodeOf[r]] : 0; }
    res.nv = nv;
    for (n = 0; n < live.length; n++) {
      p = live[n]; var v = nv(p._a) - nv(p._b), cur = 0, T2 = TYPES[p.t];
      if (p.burned || p.t === 'sw' || p.t === 'ammeter') { res.v[p.id] = v; res.i[p.id] = 0; res.p[p.id] = 0; continue; }
      if (T2.src) {
        var out = (T2.emf - v) / T2.r; cur = -out; res.out[p.id] = out;
        res.srcP += T2.emf * out; res.lossP += out * out * T2.r;
        if (out > SHORT_I) res.shorts.push(p.id);
      } else if (p.t === 'led') {
        var Le = null; for (var q = 0; q < leds.length; q++) if (leds[q].p === p) Le = leds[q];
        cur = diodeI(Le.Is, V[Le.a] - V[Le.m]);
        if (cur > LED_IMAX) res.over.push(p.id);
      } else {
        cur = v / resOf(p);
        if (p.t === 'bulb' && v * cur > T2.ratedP * T2.burnAt) res.over.push(p.id);
      }
      res.v[p.id] = v; res.i[p.id] = cur; res.p[p.id] = v * cur;
      if (!T2.src) res.loadP += v * cur;
    }
    if (!opt.noFlow) flows(board, live, res, uf, sw);
    return res;
  }
  function resOf(p) { return p.t === 'resistor' ? (p.R || 100) : TYPES[p.t].R; }
  function stamp(A, a, b, g) { A[a][a] += g; A[b][b] += g; A[a][b] -= g; A[b][a] -= g; }

  // current in every wire segment and in every closed switch and ammeter
  function flows(board, live, res, uf, sw) {
    var groups = {}, k, n, p, r;
    function grp(pt) { r = uf.find(pt); if (!groups[r]) groups[r] = { pts: [], at: {}, edges: [] }; var g = groups[r]; if (!(pt in g.at)) { g.at[pt] = g.pts.length; g.pts.push(pt); } return g; }
    for (k in board.wires) { var ij = eparse(k); var g = grp(ij[0]); grp(ij[1]); g.edges.push({ k: k, a: ij[0], b: ij[1], g: 1 }); }
    for (n = 0; n < live.length; n++) { p = live[n]; if (isZero(p, sw)) { var g2 = grp(p._a); grp(p._b); g2.edges.push({ part: p, a: p._a, b: p._b, g: 0.5 }); } }
    var inj = {};
    for (n = 0; n < live.length; n++) {
      p = live[n]; if (isZero(p, sw)) continue; var I = res.i[p.id] || 0; if (!I) continue;
      inj[p._b] = (inj[p._b] || 0) + I; inj[p._a] = (inj[p._a] || 0) - I;
    }
    for (r in groups) {
      var G = groups[r], m = G.pts.length; if (!G.edges.length) continue;
      var A = matrix(m), B = zeros(m), any = false;
      for (n = 0; n < G.edges.length; n++) { var e = G.edges[n]; stamp(A, G.at[e.a], G.at[e.b], e.g); }
      for (n = 0; n < m; n++) { B[n] = inj[G.pts[n]] || 0; if (Math.abs(B[n]) > 1e-15) any = true; }
      if (!any) { for (n = 0; n < G.edges.length; n++) setI(G.edges[n], 0); continue; }
      A[0] = zeros(m); A[0][0] = 1; B[0] = 0;
      var phi = gauss(A, B);
      for (n = 0; n < G.edges.length; n++) { var e2 = G.edges[n]; setI(e2, e2.g * (phi[G.at[e2.a]] - phi[G.at[e2.b]])); }
    }
    function setI(e, I) {
      if (e.part) { res.i[e.part.id] = I; res.p[e.part.id] = 0; }
      else res.wire[e.k] = I;   // from the lower-numbered point to the higher
    }
  }

  // adds wire segments along a path of grid points joined by straight horizontal or vertical runs
  function wirePath(board, pts) {
    for (var n = 1; n < pts.length; n++) {
      var x = pts[n - 1][0], y = pts[n - 1][1], X = pts[n][0], Y = pts[n][1];
      while (x !== X || y !== Y) {
        var nx = x + Math.sign(X - x), ny = x !== X ? y : y + Math.sign(Y - y);
        board.wires[ekey(idx(x, y), idx(nx, ny))] = 1; x = nx; y = ny;
      }
    }
    return board;
  }
  function clone(board) { return { parts: board.parts.map(function (p) { var q = {}; for (var k in p) if (k.charAt(0) !== '_') q[k] = p[k]; return q; }), wires: Object.assign({}, board.wires) }; }

  var API = {
    COLS: COLS, ROWS: ROWS, NX: NX, NY: NY, VT: VT, TYPES: TYPES, LED_COLORS: LED_COLORS, RES_VALUES: RES_VALUES,
    LED: { n: LED_N, rs: LED_RS, iref: LED_IREF, imax: LED_IMAX, is: ledIs, I: function (color, vd) { return diodeI(ledIs(color), vd); } },
    SHORT_I: SHORT_I, idx: idx, px: px, py: py, ekey: ekey, eparse: eparse, ends: ends, inGrid: inGrid,
    canPlace: canPlace, canWire: canWire, solve: solve, isZero: isZero, resOf: resOf, clone: clone, wirePath: wirePath
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.CircuitModel = API;
})(this);
