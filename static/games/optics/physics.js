/* Optics Bench: the model (window.OpticsModel; also a Node module for the tests).
   Lengths in cm, wavelengths in nm, angles in radians (degrees only where a name says so). y points up.
   Every piece has a pose (x, y, a): u = (cos a, sin a) is the way it faces, v = (−sin a, cos a) runs across it.
   trace() follows each ray from each source: Snell's law at every glass surface, a Fresnel partial reflection
   split off as a weaker ray, total internal reflection past the critical angle, mirrors, screens and targets. */
(function (root) {
  'use strict';
  var PI = Math.PI, D2R = PI / 180;

  // ---------- materials: refractive index as a function of wavelength ----------
  // Sellmeier: n² = 1 + Σ Bᵢ λ² / (λ² − Cᵢ), λ in µm (SCHOTT data sheets for N-BK7 and N-SF11)
  function sellmeier(B, C) {
    return function (nm) { var l2 = (nm / 1000) * (nm / 1000), s = 1; for (var i = 0; i < 3; i++) s += B[i] * l2 / (l2 - C[i]); return Math.sqrt(s); };
  }
  // IAPWS R9-97 (Release on the refractive index of ordinary water substance), for liquid water. It gives the index
  // relative to vacuum; glass catalogs quote theirs relative to air, so we divide by the index of air, 1.00027.
  var N_AIR = 1.00027;
  function iapws(T, rho) {
    var a = [0.244257733, 0.00974634476, -0.00373234996, 0.000268678472, 0.0015892057, 0.00245934259, 0.90070492, -0.0166626219];
    var d = rho / 1000, th = T / 273.15, UV2 = 0.229202 * 0.229202, IR2 = 5.432937 * 5.432937;
    return function (nm) {
      var L2 = (nm / 589) * (nm / 589);
      var A = d * (a[0] + a[1] * d + a[2] * th + a[3] * L2 * th + a[4] / L2 + a[5] / (L2 - UV2) + a[6] / (L2 - IR2) + a[7] * d * d);
      return Math.sqrt((2 * A + 1) / (1 - A)) / N_AIR;
    };
  }
  var MATS = {
    bk7: { name: 'BK7 crown glass', short: 'BK7 glass', n: sellmeier([1.03961212, 0.231792344, 1.01046945], [0.00600069867, 0.0200179144, 103.560653]) },
    sf11: { name: 'SF11 dense flint glass', short: 'SF11 flint', n: sellmeier([1.73759695, 0.313747346, 1.89878101], [0.013188707, 0.0623068142, 155.23629]) },
    water: { name: 'water at 20 °C', short: 'water', n: iapws(293.15, 998.21) }
  };
  function nOf(mat, nm) { return (MATS[mat] || MATS.bk7).n(nm); }

  // the colors of white light we trace (nm), and the single colors on offer
  var WHITE = [410, 445, 480, 515, 550, 580, 610, 640, 680];
  var COLORS = { red: 650, yellow: 589, green: 532, blue: 450, violet: 405 };
  var LAM_D = 587.6; // the helium d line, where catalogs quote "the" index of a glass

  // ---------- pieces ----------
  var DEF = {
    laser: { color: 'red' },
    lamp: { color: 'white', spread: 8, count: 9 },
    sun: { width: 8, count: 13 },
    mirror: { len: 12 },
    cmirror: { R: 40, ap: 16 },
    lens: { R: 20, ap: 10, mat: 'bk7' },
    dlens: { R: 20, ap: 10, mat: 'bk7' },
    block: { w: 24, h: 12, mat: 'bk7' },
    prism: { side: 16, apex: 60, mat: 'sf11' },
    drop: { r: 10, mat: 'water' },
    screen: { len: 16 },
    target: { r: 1.6 },
    wall: { len: 30 },
    eye: {}
  };
  var EDGE = 0.2, CENTER_T = 0.4; // edge thickness of a convex lens, center thickness of a concave one (cm)
  var nextId = 1;
  function make(type, x, y, aDeg, params) {
    var p = { id: nextId++, type: type, x: x, y: y, a: (aDeg || 0) * D2R }, d = DEF[type] || {}, k;
    for (k in d) p[k] = d[k];
    if (params) for (k in params) p[k] = params[k];
    return p;
  }
  function isSource(p) { return p.type === 'laser' || p.type === 'lamp' || p.type === 'sun'; }
  function isGlass(p) { return p.type === 'lens' || p.type === 'dlens' || p.type === 'block' || p.type === 'prism' || p.type === 'drop'; }

  // lens shape in its own frame (axis along u): radius, half-aperture, thickness and sag of each face
  function lensGeom(p) {
    var a = p.ap / 2, R = Math.max(p.R, a + 0.3), sag = R - Math.sqrt(R * R - a * a);
    var t = p.type === 'lens' ? 2 * sag + EDGE : CENTER_T;
    return { a: a, R: R, sag: sag, t: t, edge: p.type === 'lens' ? EDGE : CENTER_T + 2 * sag };
  }
  // lensmaker's equation for a thick lens in air, both faces of radius R: 1/f = (n−1)[1/R1 − 1/R2 + (n−1)d/(n R1 R2)]
  function lensmaker(p, nm) {
    var g = lensGeom(p), n = nOf(p.mat, nm), R1 = p.type === 'lens' ? g.R : -g.R, R2 = -R1;
    var P = (n - 1) * (1 / R1 - 1 / R2 + (n - 1) * g.t / (n * R1 * R2));
    return 1 / P;
  }
  function lensThin(p, nm) { var g = lensGeom(p), n = nOf(p.mat, nm); return (p.type === 'lens' ? 1 : -1) * g.R / (2 * (n - 1)); }
  function prismVerts(p) {
    var A = p.apex * D2R / 2, b = p.side * Math.sin(A), h = p.side * Math.cos(A);
    return [[0, 2 * h / 3], [-b, -h / 3], [b, -h / 3]];
  }

  // local → world
  function W(p, lx, ly) { var c = Math.cos(p.a), s = Math.sin(p.a); return [p.x + c * lx - s * ly, p.y + s * lx + c * ly]; }
  function Wd(p, lx, ly) { var c = Math.cos(p.a), s = Math.sin(p.a); return [c * lx - s * ly, s * lx + c * ly]; }
  function seg(p, role, A, B, inside) {
    var a = W(p, A[0], A[1]), b = W(p, B[0], B[1]), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    var nx = dy / l, ny = -dx / l;
    if (inside) { var ci = W(p, inside[0], inside[1]); if ((a[0] + b[0]) / 2 * nx + (a[1] + b[1]) / 2 * ny - (ci[0] * nx + ci[1] * ny) < 0) { nx = -nx; ny = -ny; } }
    return { k: 0, ax: a[0], ay: a[1], bx: b[0], by: b[1], nx: nx, ny: ny, role: role, p: p };
  }
  function arc(p, role, C, r, mid, cosA, sgn) {
    var c = W(p, C[0], C[1]), m = Wd(p, mid[0], mid[1]);
    return { k: 1, cx: c[0], cy: c[1], r: r, mx: m[0], my: m[1], cosA: cosA, sgn: sgn, role: role, p: p };
  }
  function polygon(p, role, V) {
    var out = [], cx = 0, cy = 0, i;
    for (i = 0; i < V.length; i++) { cx += V[i][0] / V.length; cy += V[i][1] / V.length; }
    for (i = 0; i < V.length; i++) out.push(seg(p, role, V[i], V[(i + 1) % V.length], [cx, cy]));
    return out;
  }
  function surfaces(p, ideal) {
    var g, h;
    switch (p.type) {
      case 'mirror': return [seg(p, 'mirror', [0, -p.len / 2], [0, p.len / 2])];
      case 'wall': return [seg(p, 'absorb', [0, -p.len / 2], [0, p.len / 2])];
      case 'screen': return [seg(p, 'screen', [0, -p.len / 2], [0, p.len / 2])];
      case 'target': return [arc(p, 'target', [0, 0], p.r, [1, 0], -1, 1)];
      case 'cmirror': {
        var R = Math.max(p.R, p.ap / 2 + 0.5); h = p.ap / 2;
        return [arc(p, 'mirror', [R, 0], R, [-1, 0], Math.sqrt(R * R - h * h) / R, 1)];
      }
      case 'lens': case 'dlens': {
        g = lensGeom(p);
        if (ideal) { var t = seg(p, 'thin', [0, -g.a], [0, g.a]); t.f = lensmaker(p, LAM_D); return [t]; }
        var ca = Math.sqrt(g.R * g.R - g.a * g.a) / g.R, x0;
        if (p.type === 'lens') {
          x0 = g.t / 2 - g.sag; // where the faces meet the rim
          return [arc(p, 'glass', [-g.t / 2 + g.R, 0], g.R, [-1, 0], ca, 1), arc(p, 'glass', [g.t / 2 - g.R, 0], g.R, [1, 0], ca, 1),
            seg(p, 'absorb', [-x0, g.a], [x0, g.a]), seg(p, 'absorb', [-x0, -g.a], [x0, -g.a])];
        }
        x0 = g.t / 2 + g.sag;
        return [arc(p, 'glass', [-g.t / 2 - g.R, 0], g.R, [1, 0], ca, -1), arc(p, 'glass', [g.t / 2 + g.R, 0], g.R, [-1, 0], ca, -1),
          seg(p, 'absorb', [-x0, g.a], [x0, g.a]), seg(p, 'absorb', [-x0, -g.a], [x0, -g.a])];
      }
      case 'block': return polygon(p, 'glass', [[-p.w / 2, -p.h / 2], [p.w / 2, -p.h / 2], [p.w / 2, p.h / 2], [-p.w / 2, p.h / 2]]);
      case 'prism': return polygon(p, 'glass', prismVerts(p));
      case 'drop': return [arc(p, 'glass', [0, 0], p.r, [1, 0], -1, 1)];
    }
    return [];
  }

  // ---------- one surface hit ----------
  var EPS = 1e-6;
  function hitSeg(s, x, y, dx, dy) {
    var ex = s.bx - s.ax, ey = s.by - s.ay, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-14) return -1;
    var wx = s.ax - x, wy = s.ay - y, t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
    return t > EPS && u >= 0 && u <= 1 ? t : -1;
  }
  function onArc(s, px, py) { return s.cosA <= -1 || ((px - s.cx) * s.mx + (py - s.cy) * s.my) / s.r >= s.cosA - 1e-12; }
  function hitArc(s, x, y, dx, dy) {
    var ox = x - s.cx, oy = y - s.cy, b = ox * dx + oy * dy, c = ox * ox + oy * oy - s.r * s.r, D = b * b - c;
    if (D < 0) return -1;
    var q = Math.sqrt(D), t1 = -b - q, t2 = -b + q;
    if (t1 > EPS && onArc(s, x + t1 * dx, y + t1 * dy)) return t1;
    if (t2 > EPS && onArc(s, x + t2 * dx, y + t2 * dy)) return t2;
    return -1;
  }
  // unit normal at a hit, pointing out of the glass (or, for mirrors and screens, either way)
  function normalAt(s, px, py) {
    if (s.k === 0) return [s.nx, s.ny];
    var nx = (px - s.cx) / s.r, ny = (py - s.cy) / s.r;
    return [nx * s.sgn, ny * s.sgn];
  }

  // Fresnel equations for unpolarized light: reflected fraction R = (Rs + Rp)/2
  function fresnel(n1, n2, ci, ct) {
    var rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct), rp = (n1 * ct - n2 * ci) / (n1 * ct + n2 * ci);
    return { Rs: rs * rs, Rp: rp * rp, R: (rs * rs + rp * rp) / 2 };
  }
  // Snell's law in vector form. d: unit direction, n: unit normal pointing back toward the incoming ray.
  function refract(dx, dy, nx, ny, n1, n2) {
    var ci = -(dx * nx + dy * ny), eta = n1 / n2, k = 1 - eta * eta * (1 - ci * ci);
    var rx = dx + 2 * ci * nx, ry = dy + 2 * ci * ny;
    if (k < 0) return { tir: true, ci: ci, rx: rx, ry: ry, R: 1 };
    var ct = Math.sqrt(k), f = fresnel(n1, n2, ci, ct);
    return { tir: false, ci: ci, ct: ct, tx: eta * dx + (eta * ci - ct) * nx, ty: eta * dy + (eta * ci - ct) * ny, rx: rx, ry: ry, R: f.R, Rs: f.Rs, Rp: f.Rp };
  }

  // ---------- the rays each source sends out ----------
  function lams(color) { return color === 'white' ? WHITE : [COLORS[color] || 650]; }
  function emit(p, si) {
    var out = [], L = lams(p.color || 'white'), i, j, ux = Math.cos(p.a), uy = Math.sin(p.a);
    function ray(x, y, dx, dy, lam, k) { out.push({ x: x, y: y, dx: dx, dy: dy, lam: lam, I: 1, Is: 0.5, Ip: 0.5, src: si, k: k, weak: false, L: 0, mir: 0, tir: 0, tirMax: 0, lens: 0, prism: 0, glass: 0 }); }
    if (p.type === 'laser') { for (j = 0; j < L.length; j++) ray(p.x + ux * 0.3, p.y + uy * 0.3, ux, uy, L[j], 0); }
    else if (p.type === 'lamp') {
      var n = Math.max(1, p.count | 0), sp = p.spread * D2R;
      for (i = 0; i < n; i++) { var a = p.a + (n === 1 ? 0 : sp * (2 * i / (n - 1) - 1)); for (j = 0; j < L.length; j++) ray(p.x + Math.cos(a) * 0.6, p.y + Math.sin(a) * 0.6, Math.cos(a), Math.sin(a), L[j], i); }
    } else if (p.type === 'sun') {
      var m = Math.max(1, p.count | 0), vx = -uy, vy = ux;
      for (i = 0; i < m; i++) { var o = m === 1 ? 0 : p.width * (i / (m - 1) - 0.5); for (j = 0; j < WHITE.length; j++) ray(p.x + vx * o, p.y + vy * o, ux, uy, WHITE[j], i); }
    }
    return out;
  }

  // ---------- trace everything ----------
  // opts: ideal (thin lenses), minI (weakest partial reflection still followed), far (how far an escaping ray is drawn)
  function trace(pieces, opts) {
    opts = opts || {};
    var minI = opts.minI === undefined ? 0.0015 : opts.minI, far = opts.far || 400, maxSegs = opts.maxSegs || 12000, maxSteps = 240;
    var S = [], i, j;
    for (i = 0; i < pieces.length; i++) { var ss = surfaces(pieces[i], opts.ideal); for (j = 0; j < ss.length; j++) S.push(ss[j]); }
    var out = { segs: [], events: [], hits: [], escapes: [], truncated: false, surfaces: S }, stack = [];
    for (i = 0; i < pieces.length; i++) if (isSource(pieces[i])) { var e = emit(pieces[i], i); for (j = e.length - 1; j >= 0; j--) stack.push(e[j]); }
    while (stack.length) {
      var r = stack.pop(), srcP = pieces[r.src], logEv = !r.weak && srcP.type === 'laser';
      for (var step = 0; step < maxSteps; step++) {
        if (out.segs.length >= maxSegs) { out.truncated = true; break; }
        var best = -1, bs = null;
        for (i = 0; i < S.length; i++) {
          var t = S[i].k === 0 ? hitSeg(S[i], r.x, r.y, r.dx, r.dy) : hitArc(S[i], r.x, r.y, r.dx, r.dy);
          if (t > 0 && (best < 0 || t < best)) { best = t; bs = S[i]; }
        }
        if (!bs) {
          out.segs.push({ x1: r.x, y1: r.y, x2: r.x + r.dx * far, y2: r.y + r.dy * far, lam: r.lam, I: r.I, weak: r.weak, src: r.src, L0: r.L, len: far });
          out.escapes.push({ x: r.x, y: r.y, dx: r.dx, dy: r.dy, lam: r.lam, I: r.I, weak: r.weak, src: r.src, k: r.k, lens: r.lens, prism: r.prism });
          break;
        }
        var px = r.x + r.dx * best, py = r.y + r.dy * best;
        out.segs.push({ x1: r.x, y1: r.y, x2: px, y2: py, lam: r.lam, I: r.I, weak: r.weak, src: r.src, L0: r.L, len: best });
        r.L += best; r.x = px; r.y = py;
        var role = bs.role, pc = bs.p;
        if (role === 'absorb') break;
        if (role === 'screen' || role === 'target') {
          var vx = -Math.sin(pc.a), vy = Math.cos(pc.a);
          out.hits.push({ piece: pc, role: role, x: px, y: py, s: (px - pc.x) * vx + (py - pc.y) * vy, lam: r.lam, I: r.I, weak: r.weak, src: r.src, k: r.k, mir: r.mir, lens: r.lens, prism: r.prism, dx: r.dx, dy: r.dy });
          break;
        }
        var N = normalAt(bs, px, py), nx = N[0], ny = N[1], dn = r.dx * nx + r.dy * ny;
        if (role === 'mirror') {
          if (dn > 0) { nx = -nx; ny = -ny; dn = -dn; }
          var mdx = r.dx, mdy = r.dy;
          r.dx -= 2 * dn * nx; r.dy -= 2 * dn * ny;
          if (logEv) out.events.push({ type: 'mirror', piece: pc, x: px, y: py, nx: nx, ny: ny, thI: Math.acos(Math.min(1, -dn)), src: r.src, lam: r.lam, dx: mdx, dy: mdy, ox: r.dx, oy: r.dy }); r.I *= 0.95; r.Is *= 0.95; r.Ip *= 0.95; r.mir++; r.tir = 0;
          if (r.I < minI) break;
          continue;
        }
        if (role === 'thin') {
          // ideal thin lens: slope after = slope before − height / f (exact imaging of planes onto planes)
          var ux = Math.cos(pc.a), uy = Math.sin(pc.a), wx = -uy, wy = ux, du = r.dx * ux + r.dy * uy, dv = r.dx * wx + r.dy * wy;
          var hgt = (px - pc.x) * wx + (py - pc.y) * wy, sg = du >= 0 ? 1 : -1, slope = dv / Math.abs(du) - hgt / bs.f;
          var ox = sg * ux + slope * wx, oy = sg * uy + slope * wy, ol = Math.hypot(ox, oy);
          r.dx = ox / ol; r.dy = oy / ol; r.lens = pc.id; r.tir = 0;
          continue;
        }
        // glass: entering or leaving?
        var n = nOf(pc.mat, r.lam), entering = dn < 0, n1 = entering ? 1 : n, n2 = entering ? n : 1;
        if (!entering) { nx = -nx; ny = -ny; }
        var f = refract(r.dx, r.dy, nx, ny, n1, n2);
        var thI = Math.acos(Math.max(-1, Math.min(1, f.ci)));
        if (f.tir) {
          if (logEv) out.events.push({ type: 'tir', piece: pc, x: px, y: py, nx: nx, ny: ny, thI: thI, n1: n1, n2: n2, crit: Math.asin(n2 / n1), src: r.src, lam: r.lam, dx: r.dx, dy: r.dy, ox: f.rx, oy: f.ry });
          r.dx = f.rx; r.dy = f.ry; r.tir++; if (r.tir > r.tirMax) r.tirMax = r.tir;
          continue;
        }
        // in a flat world the plane of incidence is always the bench, so the s and p parts of the light stay separate exactly
        var thT = Math.acos(Math.max(-1, Math.min(1, f.ct))), IsR = r.Is * f.Rs, IpR = r.Ip * f.Rp, IR = IsR + IpR;
        if (logEv) out.events.push({ type: 'refract', piece: pc, x: px, y: py, nx: nx, ny: ny, thI: thI, thT: thT, n1: n1, n2: n2, R: r.I > 0 ? IR / r.I : f.R, entering: entering, src: r.src, lam: r.lam, crit: n1 > n2 ? Math.asin(n2 / n1) : 0, dx: r.dx, dy: r.dy, ox: f.tx / Math.hypot(f.tx, f.ty), oy: f.ty / Math.hypot(f.tx, f.ty) });
        if (IR >= minI) {
          stack.push({ x: px, y: py, dx: f.rx, dy: f.ry, lam: r.lam, I: IR, Is: IsR, Ip: IpR, src: r.src, k: r.k, weak: true, L: r.L, mir: r.mir, tir: 0, tirMax: r.tirMax, lens: r.lens, prism: r.prism, glass: r.glass });
        }
        var tl = Math.hypot(f.tx, f.ty);
        r.dx = f.tx / tl; r.dy = f.ty / tl; r.Is -= IsR; r.Ip -= IpR; r.I = r.Is + r.Ip; r.tir = 0;
        if (!entering) {
          if (pc.type === 'lens' || pc.type === 'dlens') r.lens = pc.id;
          if (pc.type === 'prism') r.prism = pc.id;
          r.glass++;
        }
        if (r.I < minI * 0.2) break;
      }
    }
    return out;
  }

  // ---------- measuring a lens: trace a ray close to the axis through the real surfaces ----------
  // returns the effective focal length h / tan(exit angle) and where that ray crosses the axis (from the lens center)
  function probeLens(p, nm, ideal, h) {
    var q = {}; for (var k in p) q[k] = p[k]; q.x = 0; q.y = 0; q.a = 0;
    h = h || 0.01;
    var S = surfaces(q, ideal), x = -60, y = h, dx = 1, dy = 0, n = nOf(q.mat, nm), inside = false;
    for (var step = 0; step < 6; step++) {
      var best = -1, bs = null;
      for (var i = 0; i < S.length; i++) { var t = S[i].k === 0 ? hitSeg(S[i], x, y, dx, dy) : hitArc(S[i], x, y, dx, dy); if (t > 0 && (best < 0 || t < best)) { best = t; bs = S[i]; } }
      if (!bs) break;
      x += dx * best; y += dy * best;
      if (bs.role === 'thin') { var sl = dy / dx - y / bs.f, l = Math.hypot(1, sl); dx = 1 / l; dy = sl / l; continue; }
      if (bs.role !== 'glass') return null;
      var N = normalAt(bs, x, y), nx = N[0], ny = N[1], ent = dx * nx + dy * ny < 0;
      if (!ent) { nx = -nx; ny = -ny; }
      var f = refract(dx, dy, nx, ny, ent ? 1 : n, ent ? n : 1);
      if (f.tir) return null;
      var tl = Math.hypot(f.tx, f.ty); dx = f.tx / tl; dy = f.ty / tl; inside = ent;
    }
    if (inside || Math.abs(dy) < 1e-15) return null;
    return { f: -h * dx / dy, xF: x - y * dx / dy };
  }

  // ---------- the rainbow: light leaving a round drop after k reflections inside ----------
  // impact parameter b = sin i (in drop radii). Deviation D_k = 2(i − r) + k(π − 2r); k = 0 is the outside reflection.
  // Intensity for unpolarized light: ½[(1−Rs)² Rs^k + (1−Rp)² Rp^k] (k ≥ 1), ½(Rs + Rp) (k = 0).
  function wrap2pi(a) { a %= 2 * PI; return a < 0 ? a + 2 * PI : a; }
  function antisolar(D) { return Math.abs(wrap2pi(D) - PI); } // angle between the leaving ray and the line back toward the Sun
  function dropRay(n, b, k) {
    var i = Math.asin(b), r = Math.asin(b / n), ci = Math.cos(i), ct = Math.cos(r), f = fresnel(1, n, ci, ct);
    if (k === 0) return { D: PI - 2 * i, I: f.R, theta: antisolar(PI - 2 * i) };
    var D = 2 * (i - r) + k * (PI - 2 * r), I = 0.5 * ((1 - f.Rs) * (1 - f.Rs) * Math.pow(f.Rs, k) + (1 - f.Rp) * (1 - f.Rp) * Math.pow(f.Rp, k));
    return { D: D, I: I, theta: antisolar(D) };
  }
  // Descartes: the rainbow ray (stationary deviation) has cos² i = (n² − 1) / (k(k + 2))
  function bowAngle(n, k) {
    var ci = Math.sqrt((n * n - 1) / (k * (k + 2))), i = Math.acos(ci);
    return { theta: dropRay(n, Math.sin(i), k).theta, i: i, b: Math.sin(i) };
  }
  // how much light leaves at each angle (bins of binDeg), for one index n; uniform impact parameters (a flat slice of a drop)
  function dropScatter(n, N, binDeg, maxDeg, kMax) {
    var nb = Math.round(maxDeg / binDeg), bins = [], k, j;
    for (k = 0; k <= kMax; k++) { bins.push(new Float64Array(nb)); }
    for (j = 0; j < N; j++) {
      var b = (j + 0.5) / N;
      for (k = 0; k <= kMax; k++) {
        var o = dropRay(n, b, k), d = o.theta / D2R;
        if (d < maxDeg) bins[k][Math.min(nb - 1, Math.floor(d / binDeg))] += o.I / N;
      }
    }
    return bins;
  }

  // the path of one ray through a drop (center c, radius R) that leaves after k reflections inside; sunlight travels along (sx, sy).
  // b: impact parameter in radii (sign picks the side). Returns the corner points and the direction it leaves in.
  function dropPath(cx, cy, R, sx, sy, n, k, b) {
    var px = -sy, py = sx, x = cx - sx * R * 2 + px * b * R, y = cy - sy * R * 2 + py * b * R, dx = sx, dy = sy, pts = [[x, y]];
    for (var j = 0; j <= k + 1; j++) {
      var ox = x - cx, oy = y - cy, bb = ox * dx + oy * dy, c = ox * ox + oy * oy - R * R, D = bb * bb - c;
      if (D < 0) return null;
      var t = j === 0 ? -bb - Math.sqrt(D) : -bb + Math.sqrt(D);
      x += dx * t; y += dy * t; pts.push([x, y]);
      var nx = (x - cx) / R, ny = (y - cy) / R;
      if (j === 0) { var f = refract(dx, dy, nx, ny, 1, n); dx = f.tx; dy = f.ty; }
      else if (j <= k) { var dn = dx * nx + dy * ny; dx -= 2 * dn * nx; dy -= 2 * dn * ny; }
      else { var g = refract(dx, dy, -nx, -ny, n, 1); if (g.tir) return null; dx = g.tx; dy = g.ty; }
      var l = Math.hypot(dx, dy); dx /= l; dy /= l;
    }
    return { pts: pts, dx: dx, dy: dy };
  }

  // ---------- ready-made benches ----------
  var SCENES = {
    snell: function () { return [make('laser', -6, 20, -90, { color: 'red' }), make('block', 0, 0, 0, { w: 30, h: 12, mat: 'bk7' })]; },
    mirrors: function () {
      return [make('laser', -44, -16, 0, { color: 'red' }), make('mirror', -26, -16, 135, { len: 8 }), make('mirror', 24, 18, 200, { len: 8 }),
        make('wall', 0, -14, 0, { len: 28 }), make('target', 40, -16, 0)];
    },
    fiber: function () { return [make('laser', -40, 6, -2, { color: 'green' }), make('block', 6, 0, 0, { w: 72, h: 3, mat: 'bk7' }), make('screen', 47, 0, 180, { len: 12 })]; },
    lens: function () { return [make('sun', -44, 0, 0, { width: 7, count: 15 }), make('lens', -14, 0, 0, { R: 20, ap: 10, mat: 'bk7' }), make('screen', 22, 0, 180, { len: 12 })]; },
    image: function () { return [make('lamp', -44, 3, -5.71, { color: 'yellow', spread: 3, count: 7 }), make('lens', -14, 0, 0, { R: 15, ap: 10, mat: 'bk7' }), make('screen', 34, 0, 180, { len: 16 })]; },
    prism: function () { return [make('laser', -40, -21, 33, { color: 'white' }), make('prism', -2, 17, 0, { side: 16, apex: 60, mat: 'sf11' }), make('screen', 33, -17, -33, { len: 20 })]; },
    rainbow: function () { return [make('sun', -46, 0, 0, { width: 19, count: 15 }), make('drop', 22, 0, 0, { r: 10, mat: 'water' }), make('eye', 22 - 30 * Math.cos(25 * D2R), 30 * Math.sin(25 * D2R), 0)]; },
    free: function () {
      return [make('sun', -44, 12, 0, { width: 8, count: 11 }), make('cmirror', 34, 12, 180, { R: 40, ap: 16 }), make('laser', -44, -12, 0, { color: 'green' }),
        make('dlens', -16, -14, 0, { R: 20, ap: 10, mat: 'bk7' }), make('block', 10, -16, 20, { w: 14, h: 7, mat: 'bk7' }), make('screen', 40, -16, 180, { len: 14 })];
    }
  };

  // ---------- what the screens, targets and laser beams show: the missions read these ----------
  function byId(pieces, id) { for (var i = 0; i < pieces.length; i++) if (pieces[i].id === id) return pieces[i]; return null; }
  function measure(pieces, tr) {
    var m = { screens: [], target: false, targetMirrors: 0, snell: null, tirRun: 0, tirPiece: null }, i, j;
    // screens: the main (not partly reflected) light from each source
    for (i = 0; i < pieces.length; i++) {
      var sc = pieces[i]; if (sc.type !== 'screen') continue;
      var per = {};
      for (j = 0; j < tr.hits.length; j++) {
        var h = tr.hits[j]; if (h.piece !== sc || h.weak) continue;
        var g = per[h.src] || (per[h.src] = { src: h.src, n: 0, lo: 1e9, hi: -1e9, sum: 0, wsum: 0, lams: {}, lenses: {}, prisms: {}, rays: {} });
        g.n++; g.lo = Math.min(g.lo, h.s); g.hi = Math.max(g.hi, h.s); g.sum += h.s * h.I; g.wsum += h.I;
        var L = g.lams[h.lam] || (g.lams[h.lam] = { n: 0, sum: 0 }); L.n++; L.sum += h.s;
        g.lenses[h.lens] = (g.lenses[h.lens] || 0) + 1; g.prisms[h.prism] = (g.prisms[h.prism] || 0) + 1; g.rays[h.k] = 1;
      }
      var groups = [];
      for (var k in per) {
        var q = per[k], src = pieces[q.src], ls = Object.keys(q.lams).map(Number).sort(function (a, b) { return a - b; });
        q.width = q.hi - q.lo; q.mean = q.wsum ? q.sum / q.wsum : 0; q.nLam = ls.length; q.nRays = Object.keys(q.rays).length;
        q.spread = ls.length > 1 ? Math.abs(q.lams[ls[ls.length - 1]].sum / q.lams[ls[ls.length - 1]].n - q.lams[ls[0]].sum / q.lams[ls[0]].n) : 0;
        q.redHi = ls.length > 1 ? (q.lams[ls[ls.length - 1]].sum / q.lams[ls[ls.length - 1]].n > q.lams[ls[0]].sum / q.lams[ls[0]].n) : true;
        var lk = Object.keys(q.lenses), pk = Object.keys(q.prisms);
        q.lens = lk.length === 1 && lk[0] !== '0' ? byId(pieces, +lk[0]) : null;   // every ray came through this one lens
        q.prism = pk.length === 1 && pk[0] !== '0' ? byId(pieces, +pk[0]) : null;
        q.srcType = src.type; q.white = (src.type === 'sun') || src.color === 'white'; q.srcPiece = src;
        groups.push(q);
      }
      m.screens.push({ piece: sc, groups: groups });
    }
    for (j = 0; j < tr.hits.length; j++) {
      var t = tr.hits[j];
      if (t.role === 'target' && !t.weak && pieces[t.src].type === 'laser') { m.target = true; m.targetMirrors = Math.max(m.targetMirrors, t.mir); }
    }
    var run = 0, last = null;
    for (j = 0; j < tr.events.length; j++) {
      var e = tr.events[j];
      if (e.type === 'refract' && e.entering && e.piece.type === 'block' && (!m.snell || e.thI > m.snell.thI)) m.snell = e;
      if (e.type === 'tir') { run = e.piece === last ? run + 1 : 1; last = e.piece; if (run > m.tirRun) { m.tirRun = run; m.tirPiece = e.piece; } }
      else { run = 0; last = null; }
    }
    return m;
  }
  // distance along a lens's axis from its center to a point
  function axisDist(lens, x, y) { return Math.abs((x - lens.x) * Math.cos(lens.a) + (y - lens.y) * Math.sin(lens.a)); }

  var API = {
    SCENES: SCENES, measure: measure, axisDist: axisDist, dropPath: dropPath, byId: byId,
    N_AIR: N_AIR, MATS: MATS, nOf: nOf, WHITE: WHITE, COLORS: COLORS, LAM_D: LAM_D, DEF: DEF, EDGE: EDGE, CENTER_T: CENTER_T,
    make: make, isSource: isSource, isGlass: isGlass, lensGeom: lensGeom, lensmaker: lensmaker, lensThin: lensThin, prismVerts: prismVerts,
    surfaces: surfaces, trace: trace, fresnel: fresnel, refract: refract, probeLens: probeLens, lams: lams,
    dropRay: dropRay, bowAngle: bowAngle, dropScatter: dropScatter, antisolar: antisolar, W: W
  };
  root.OpticsModel = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
