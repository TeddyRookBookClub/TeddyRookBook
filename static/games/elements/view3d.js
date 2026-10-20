/* The Elements (Science Lab): the 3-D atom view. Own WebGL 1 (point sprites: shaded spheres for the nucleus and the
   shell electrons, soft additive dots for the orbital clouds, lines for rings and axes); if WebGL is missing or lost,
   the same scene is drawn on a 2-D canvas, depth-sorted. Drag to spin, pinch or scroll to zoom, keys on the canvas.

   TRBElView.create({ view, gl: canvas, ov: canvas, onPick(orbital|null), onFrame() }) -> api
     api.set(element)               element object from the data (needs z, config.full, shells, model)
     api.mode('shell'|'orbital')    which picture
     api.layout('together'|'apart') orbital view: every occupied orbital at its true relative size, or the orbitals of one
                                    subshell side by side, each drawn the same size so its shape shows
     api.sub(label)                 the subshell shown side by side (e.g. '3d')
     api.hide(label, bool)          hide or show one subshell (together);  api.hidden() -> {label: true}
     api.focus(label|null)          zoom so that subshell fills the view (null: the whole atom)
     api.reset(), api.zoomBy(f), api.orbitals(), api.select(orbital|null), api.pickAt(x, y), api.renderer: 'webgl'|'2d'
   Coordinates: physics x, y, z (z up) are drawn as X = x, Y = z, Z = −y (a proper rotation), so z points up the screen. */
(function (W, D) {
  'use strict';
  var C = W.TRBElCore, M = Math, PI = M.PI;
  var reduced = false; try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  var PAL = { // [positive lobe, negative lobe] for s, p, d, f
    0: [[0.42, 0.74, 1.0], [0.80, 0.58, 1.0]],
    1: [[0.33, 0.93, 0.72], [1.0, 0.66, 0.36]],
    2: [[1.0, 0.80, 0.40], [1.0, 0.45, 0.60]],
    3: [[0.78, 0.60, 1.0], [0.42, 0.88, 1.0]]
  };
  var PROTON = [0.93, 0.33, 0.31], NEUTRON = [0.74, 0.78, 0.82], ELECTRON = [0.45, 0.75, 0.99], GOLD = [1.0, 0.83, 0.47];
  var DIST = 3.4, FOV = 0.62, COT = 1 / M.tan(FOV / 2);

  function create(o) {
    var view = o.view, cgl = o.gl, cov = o.ov, ctx = cov.getContext('2d');
    var force2d = /[?&]gl=0\b/.test(W.location.search) || o.force2d;
    var gl = null;
    if (!force2d) { try { gl = cgl.getContext('webgl', { antialias: true, alpha: false }) || cgl.getContext('experimental-webgl'); } catch (e) { gl = null; } }
    var api = {};
    var S = { mode: 'shell', layout: 'apart', sub: null, el: null, yaw: 0.6, pitch: 0.5, zoom: 1.18, tZoom: 1.18, t: 0, idle: 99, hidden: {}, sel: null, w: 300, h: 200, dpr: 1 };
    var nuc = null, orbs = [], cloudScale = 1, shellR = [], cloudCount = 0, built = false;
    var prog = null, sphBuf = null, lineBuf = null, cloudBuf = null, maxPt = 64;

    /* ------------------------------------------------------------ the nucleus: packed balls, protons and neutrons mixed */
    function nucleus(p, n) {
      var A = M.max(1, p + n), rnd = C.rng(A * 131 + p), pts = [], R = A === 1 ? 0 : M.pow(A / 0.62, 1 / 3), ga = PI * (3 - M.sqrt(5)), i, j, k;
      for (i = 0; i < A; i++) {
        var r = R * M.cbrt((i + 0.5) / A), y = 1 - 2 * (i + 0.5) / A, s = M.sqrt(M.max(0, 1 - y * y)), th = ga * i;
        pts.push([r * s * M.cos(th), r * y, r * s * M.sin(th)]);
      }
      for (k = 0; k < 40 && A > 1; k++) { // push overlapping balls apart, keep them inside the ball of radius R
        for (i = 0; i < A; i++) for (j = i + 1; j < A; j++) {
          var a = pts[i], b = pts[j], dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], d = M.sqrt(dx * dx + dy * dy + dz * dz) || 1e-3;
          if (d < 1.9) { var f = (1.9 - d) / d * 0.25; a[0] -= dx * f; a[1] -= dy * f; a[2] -= dz * f; b[0] += dx * f; b[1] += dy * f; b[2] += dz * f; }
        }
        for (i = 0; i < A; i++) { var q = pts[i], l = M.hypot(q[0], q[1], q[2]), lim = M.max(0.01, R - 0.6); if (l > lim) { q[0] *= lim / l; q[1] *= lim / l; q[2] *= lim / l; } }
      }
      var kinds = []; for (i = 0; i < A; i++) kinds.push(i < p ? 1 : 0);
      for (i = A - 1; i > 0; i--) { j = M.floor(rnd() * (i + 1)); var t = kinds[i]; kinds[i] = kinds[j]; kinds[j] = t; }
      var ext = 1; pts.forEach(function (q) { ext = M.max(ext, M.hypot(q[0], q[1], q[2]) + 1); });
      return { pts: pts, kinds: kinds, ext: ext, A: A };
    }
    function buildShell() {
      var e = S.el, m = e.model || {}, p = m.protons || e.z, n = m.neutrons == null ? 0 : m.neutrons;
      nuc = nucleus(p, n);
      var Rd = 0.034 * M.cbrt(nuc.A) + 0.035, sh = e.shells || [], ns = sh.length || 1, r0 = Rd + 0.13;
      nuc.scale = Rd / nuc.ext; nuc.rd = Rd;
      shellR = sh.map(function (c, k) { return ns === 1 ? 0.62 : r0 + (1 - r0) * k / (ns - 1); });
    }

    /* ------------------------------------------------------------ the orbitals: points drawn from |ψ|² */
    function buildOrbitals() {
      var e = S.el;
      orbs = C.atomOrbitals(e.config.full, e.z);
      var outer = 0; orbs.forEach(function (ob) { outer = M.max(outer, ob.r90); });
      cloudScale = 1 / outer;
      var small = W.innerWidth < 700 || /Mobi|Android/i.test(W.navigator.userAgent);
      var budget = (gl ? (small ? 140000 : 240000) : 16000), per = M.min(gl ? 9000 : 900, budget / e.z);
      var total = 0;
      orbs.forEach(function (ob, i) {
        var cnt = M.max(gl ? 400 : 120, M.round(per * ob.electrons));
        ob.pts = C.sample(ob.n, ob.l, ob.m, ob.Z, cnt, C.rng(e.z * 977 + i * 31 + 3), 0.96);
        ob.first = total; ob.count = cnt; total += cnt; ob.idx = i;
      });
      cloudCount = total; built = true;
      if (gl) {
        var a = new Float32Array(total * 7), rnd = C.rng(e.z);
        orbs.forEach(function (ob) {
          var pal = PAL[ob.l] || PAL[0];
          for (var k = 0; k < ob.count; k++) {
            var o4 = k * 4, o7 = (ob.first + k) * 7, c = ob.pts[o4 + 3] > 0 ? pal[0] : pal[1];
            a[o7] = ob.pts[o4]; a[o7 + 1] = ob.pts[o4 + 2]; a[o7 + 2] = -ob.pts[o4 + 1];
            a[o7 + 3] = c[0]; a[o7 + 4] = c[1]; a[o7 + 5] = c[2]; a[o7 + 6] = rnd();
          }
        });
        gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuf); gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);
      }
    }
    // side by side: a denser sample of just the shown subshell, made when it is first needed
    var gal = null, galBuf = null;
    function gallery() {
      if (gal && gal.el === S.el && gal.sub === S.sub && gal.gl === !!gl) return gal;
      var list = orbs.filter(function (ob) { return ob.sub === S.sub; }), per = gl ? (W.innerWidth < 700 ? 9000 : 14000) : 3200, total = 0;
      gal = { el: S.el, sub: S.sub, gl: !!gl, items: list.map(function (ob, i) {
        var cnt = M.round(per * (0.6 + 0.4 * ob.electrons) / 1.4);
        var it = { ob: ob, pts: C.sample(ob.n, ob.l, ob.m, ob.Z, cnt, C.rng(S.el.z * 7919 + ob.idx * 13 + 5), 0.96), first: total, count: cnt };
        total += cnt; return it;
      }) };
      if (gl) {
        var a = new Float32Array(total * 7), rnd = C.rng(S.el.z + 1);
        gal.items.forEach(function (it) {
          var pal = PAL[it.ob.l] || PAL[0];
          for (var k = 0; k < it.count; k++) {
            var o4 = k * 4, o7 = (it.first + k) * 7, c = it.pts[o4 + 3] > 0 ? pal[0] : pal[1];
            a[o7] = it.pts[o4]; a[o7 + 1] = it.pts[o4 + 2]; a[o7 + 2] = -it.pts[o4 + 1]; a[o7 + 3] = c[0]; a[o7 + 4] = c[1]; a[o7 + 5] = c[2]; a[o7 + 6] = rnd();
          }
        });
        if (!galBuf) galBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, galBuf); gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);
      }
      return gal;
    }
    function defaultSub() { // the subshell that sets the element's block, the outermost one of that kind
      var b = C.letters.indexOf(S.el.block || 's'), best = null;
      orbs.forEach(function (ob) { if (ob.l === b && (!best || ob.n > best.n)) best = ob; });
      if (!best) best = orbs[orbs.length - 1];
      return best ? best.sub : null;
    }
    function ensure() { if (!built) buildOrbitals(); if (!S.sub || !orbs.some(function (ob) { return ob.sub === S.sub; })) S.sub = defaultSub(); }

    api.set = function (e) {
      S.el = e; S.sel = null; S.hidden = {}; S.tZoom = baseZoom(); S.sub = null; built = false; orbs = [];
      buildShell();
      if (S.mode === 'orbital') ensure();
      if (o.onPick) o.onPick(null);
    };
    api.mode = function (m) {
      if (m && m !== S.mode) { S.mode = m; S.sel = null; S.tZoom = baseZoom(); S.pitch = m === 'shell' ? 0.5 : 0.3; if (m === 'orbital') ensure(); if (o.onPick) o.onPick(null); }
      return S.mode;
    };
    api.layout = function (l) { if (l) { S.layout = l; S.sel = null; S.tZoom = 1; ensure(); if (o.onPick) o.onPick(null); } return S.layout; };
    api.sub = function (lab) { if (lab) { S.sub = lab; S.sel = null; if (o.onPick) o.onPick(null); } return S.sub; };
    api.orbitals = function () { if (S.el) ensure(); return orbs; };
    api.hide = function (lab, h) { if (h) S.hidden[lab] = true; else delete S.hidden[lab]; if (S.sel && S.hidden[S.sel.sub]) { S.sel = null; if (o.onPick) o.onPick(null); } };
    api.hidden = function () { return S.hidden; };
    api.focus = function (lab) {
      if (!lab) { S.tZoom = baseZoom(); return; }
      var r = 0; orbs.forEach(function (ob) { if (ob.sub === lab) r = M.max(r, ob.r90); });
      if (r) S.tZoom = M.min(500, M.max(1, 0.85 / (r * cloudScale)));
    };
    api.reset = function () { S.yaw = 0.6; S.pitch = S.mode === 'shell' ? 0.5 : 0.3; S.tZoom = baseZoom(); S.sel = null; S.idle = 99; if (o.onPick) o.onPick(null); };
    function baseZoom() { return S.mode === 'shell' ? 1.18 : 1; }
    api.select = function (ob) { S.sel = ob; };
    api.state = S;

    /* ------------------------------------------------------------ camera and layout */
    function rot() { // yaw about the vertical axis, then pitch toward the viewer
      var cy = M.cos(S.yaw), sy = M.sin(S.yaw), cp = M.cos(S.pitch), sp = M.sin(S.pitch);
      return [cy, 0, -sy, sy * sp, cp, cy * sp, sy * cp, -sp, cy * cp];
    }
    function ppu() { return COT * M.min(S.w, S.h) / 2; } // CSS px per world unit at distance 1
    // one entry per drawn orbital: scale and camera-space offset
    function placements() {
      var out = [];
      if (S.mode !== 'orbital') return out;
      if (S.layout === 'apart') {
        var list = gallery().items, k = list.length;
        if (!k) return out;
        var asp = S.w / S.h, cols = 1, rows = k, bestR = 0;
        for (var cc = 1; cc <= k; cc++) { // the grid that lets each orbital be drawn biggest
          var rr0 = M.ceil(k / cc), size = M.min(asp / cc, 0.9 / rr0);
          if (size > bestR * 1.04) { bestR = size; cols = cc; rows = rr0; }
        }
        var halfH = DIST / COT * (S.h / M.min(S.w, S.h)) / S.zoom, halfW = halfH * asp;
        var top = 0.07 * 2 * halfH, bot = 0.02 * 2 * halfH; // room for the caption at the top
        var cw = 2 * halfW / cols, ch = (2 * halfH - top - bot) / rows, cr = 0.40 * M.min(cw, ch * 0.84);
        list.forEach(function (it, i) {
          var ob = it.ob, r = M.floor(i / cols), c = i % cols, inRow = M.min(cols, k - r * cols);
          var x = -halfW + cw * (c + 0.5) + (cols - inRow) * cw / 2, y = halfH - top - ch * (r + 0.5) + ch * 0.06;
          out.push({ ob: ob, sc: cr / ob.r90, off: [x, y, 0], cell: cr, pts: it.pts, first: it.first, count: it.count, gal: true });
        });
      } else {
        orbs.forEach(function (ob) { if (!S.hidden[ob.sub]) out.push({ ob: ob, sc: cloudScale, off: [0, 0, 0], pts: ob.pts, first: ob.first, count: ob.count }); });
      }
      return out;
    }
    function proj(R, x, y, z, out, sc, off) {
      sc = sc || 1; x *= sc; y *= sc; z *= sc;
      var X = R[0] * x + R[1] * y + R[2] * z, Y = R[3] * x + R[4] * y + R[5] * z, Z = R[6] * x + R[7] * y + R[8] * z;
      if (off) { X += off[0]; Y += off[1]; Z += off[2]; }
      var w = DIST / S.zoom - Z, f = ppu() / w;
      out[0] = S.w / 2 + X * f; out[1] = S.h / 2 - Y * f; out[2] = w; out[3] = f; return out;
    }
    // dot brightness: the same average glow over each orbital's area, whatever its size and point count, shared out where
    // orbitals of a similar size lie on top of each other
    function alphas(pl, maxDot) {
      return pl.map(function (p) {
        var n = 1;
        if (S.layout !== 'apart') pl.forEach(function (q) { if (q !== p && q.ob.r90 <= p.ob.r90 * 1.6 && q.ob.r90 >= p.ob.r90 / 4) n++; });
        var R = M.max(2, p.ob.r90 * p.sc * ppu() * S.zoom / DIST), area = PI * R * R;
        // sparse clouds get bigger, fainter dots so they read as a glow rather than as grain
        var dot = M.max(2, M.min(maxDot, 1.5 * M.sqrt(area / p.count)));
        var al = 0.42 * area / (p.count * dot * dot * 0.55) / M.sqrt(n);
        return { dot: dot, al: M.max(0.002, M.min(0.8, al)) * (0.75 + 0.25 * p.ob.electrons) * (S.sel && S.sel !== p.ob ? 0.14 : 1) };
      });
    }

    /* ------------------------------------------------------------ WebGL */
    var POS = 'vec3 p=uR*(aP*uSc)+uOff;float w=uD-p.z;gl_Position=vec4(p.x*uF/uA,p.y*uF,((w-uD+2.5)/5.0*2.0-1.0)*w,w);';
    var UNI = 'uniform mat3 uR;uniform float uD;uniform float uF;uniform float uA;uniform float uSc;uniform vec3 uOff;';
    var VS = 'attribute vec3 aP;attribute vec3 aC;attribute float aS;' + UNI + 'uniform float uPx;uniform float uT;uniform float uTw;varying vec3 vC;' +
      'void main(){' + POS + 'float tw=1.0-uTw*0.28*(0.5+0.5*sin(uT*(0.8+aS*1.7)+aS*40.0));vC=aC*tw;gl_PointSize=max(1.0,uPx/w);}';
    var FS_SPH = 'precision mediump float;varying vec3 vC;void main(){vec2 q=gl_PointCoord*2.0-1.0;float r2=dot(q,q);if(r2>1.0)discard;' +
      'vec3 n=vec3(q.x,-q.y,sqrt(1.0-r2));vec3 L=normalize(vec3(-0.45,0.6,0.75));float d=max(dot(n,L),0.0);float sp=pow(max(dot(reflect(-L,n),vec3(0,0,1)),0.0),24.0);' +
      'vec3 c=vC*(0.28+0.8*d)+vec3(0.5)*sp;c*=mix(1.0,0.72,smoothstep(0.7,1.0,r2));gl_FragColor=vec4(c,1.0);}';
    var FS_GLOW = 'precision mediump float;varying vec3 vC;uniform float uAl;void main(){vec2 q=gl_PointCoord*2.0-1.0;float r2=dot(q,q);if(r2>1.0)discard;' +
      'gl_FragColor=vec4(vC*exp(-r2*3.0)*uAl,1.0);}';
    var VS_L = 'attribute vec3 aP;' + UNI + 'void main(){' + POS + '}';
    var FS_L = 'precision mediump float;uniform vec4 uC;void main(){gl_FragColor=uC;}';
    function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    function program(vs, fs) {
      var p = gl.createProgram(); gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
      return { p: p, u: u, aP: gl.getAttribLocation(p, 'aP'), aC: gl.getAttribLocation(p, 'aC'), aS: gl.getAttribLocation(p, 'aS') };
    }
    function initGL() {
      try {
        prog = { sph: program(VS, FS_SPH), glow: program(VS, FS_GLOW), line: program(VS_L, FS_L) };
        sphBuf = gl.createBuffer(); lineBuf = gl.createBuffer(); cloudBuf = gl.createBuffer();
        var r = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE); maxPt = r ? r[1] : 64;
        return true;
      } catch (e) { if (W.console) W.console.warn('Using 2-D drawing: ' + e.message); return false; }
    }
    if (gl && !initGL()) gl = null;
    api.renderer = gl ? 'webgl' : '2d';
    if (!gl) cgl.style.display = 'none';
    cgl.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); gl = null; gal = null; api.renderer = '2d'; cgl.style.display = 'none'; built = false; if (S.mode === 'orbital' && S.el) ensure(); });

    function use(p, R, sc, off) {
      gl.useProgram(p.p);
      gl.uniformMatrix3fv(p.u.uR, false, [R[0], R[3], R[6], R[1], R[4], R[7], R[2], R[5], R[8]]);
      gl.uniform1f(p.u.uD, DIST / S.zoom); gl.uniform1f(p.u.uF, COT * M.min(S.w, S.h) / S.h); gl.uniform1f(p.u.uA, S.w / S.h);
      gl.uniform1f(p.u.uSc, sc == null ? 1 : sc); gl.uniform3fv(p.u.uOff, off || [0, 0, 0]);
    }
    function attrib(p, on) {
      [p.aP, p.aC, p.aS].forEach(function (a, i) {
        if (a < 0) return;
        if (on) { gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, [3, 3, 1][i], gl.FLOAT, false, 28, [0, 12, 24][i]); }
        else gl.disableVertexAttribArray(a);
      });
    }
    function drawGL(R) {
      var dpr = S.dpr, W2 = M.round(S.w * dpr), H2 = M.round(S.h * dpr);
      if (cgl.width !== W2 || cgl.height !== H2) { cgl.width = W2; cgl.height = H2; }
      gl.viewport(0, 0, W2, H2);
      gl.clearColor(0.024, 0.067, 0.102, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      // spheres first (they write depth), then lines and clouds test against them
      var sp = spheres();
      if (sp.n) {
        var ps = prog.sph; use(ps, R); gl.uniform1f(ps.u.uT, 0); gl.uniform1f(ps.u.uTw, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, sphBuf); gl.bufferData(gl.ARRAY_BUFFER, sp.a, gl.DYNAMIC_DRAW);
        attrib(ps, true); gl.disable(gl.BLEND);
        sp.groups.forEach(function (g) { gl.uniform1f(ps.u.uPx, 2 * g.r * ppu() * dpr); gl.drawArrays(gl.POINTS, g.first, g.n); });
        attrib(ps, false);
      }
      var L = lines();
      if (L.n) {
        var lp = prog.line;
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf); gl.bufferData(gl.ARRAY_BUFFER, L.a, gl.DYNAMIC_DRAW);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        L.parts.forEach(function (pt) {
          use(lp, R, 1, pt.off); gl.enableVertexAttribArray(lp.aP); gl.vertexAttribPointer(lp.aP, 3, gl.FLOAT, false, 12, 0);
          gl.uniform4fv(lp.u.uC, pt.c); gl.drawArrays(gl.LINES, pt.first, pt.n);
        });
        gl.disableVertexAttribArray(lp.aP); gl.depthMask(true);
      }
      if (S.mode === 'orbital' && cloudCount) {
        var pg = prog.glow, pl = placements(), al = alphas(pl, 9);
        gl.bindBuffer(gl.ARRAY_BUFFER, S.layout === 'apart' ? galBuf : cloudBuf);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
        pl.forEach(function (p, i) {
          use(pg, R, p.sc, p.off); attrib(pg, true);
          gl.uniform1f(pg.u.uT, S.t); gl.uniform1f(pg.u.uTw, reduced ? 0 : 1);
          gl.uniform1f(pg.u.uPx, al[i].dot * dpr * DIST / S.zoom); gl.uniform1f(pg.u.uAl, al[i].al);
          gl.drawArrays(gl.POINTS, p.first, p.count);
        });
        attrib(pg, false); gl.depthMask(true); gl.disable(gl.BLEND);
      }
    }

    /* ------------------------------------------------------------ geometry shared by both renderers */
    function spheres() {
      var list = [], groups = [];
      if (!nuc) return { n: 0, groups: [], list: [] };
      var sc = nuc.scale;
      if (S.mode === 'shell') {
        nuc.pts.forEach(function (q, i) { list.push([q[0] * sc, q[1] * sc, q[2] * sc, nuc.kinds[i] ? PROTON : NEUTRON]); });
        groups.push({ first: 0, n: list.length, r: 0.93 * sc });
        var sh = S.el.shells || [], first = list.length;
        sh.forEach(function (cnt, k) {
          var R = shellR[k], w = reduced ? 0 : 0.42 / (1 + k * 0.5);
          for (var j = 0; j < cnt; j++) { var th = 2 * PI * j / cnt + S.t * w + k * 0.7; list.push([R * M.cos(th), 0, R * M.sin(th), ELECTRON]); }
        });
        var er = M.min(0.026, 0.4 * 2 * PI * (shellR[shellR.length - 1] || 1) / M.max(8, M.max.apply(null, sh.concat([1]))));
        groups.push({ first: first, n: list.length - first, r: er });
      } else if (S.layout === 'together') {
        list.push([0, 0, 0, GOLD]); groups.push({ first: 0, n: 1, r: 0.014 / M.sqrt(S.zoom) });
      }
      var a = new Float32Array(list.length * 7);
      list.forEach(function (q, i) { a.set([q[0], q[1], q[2], q[3][0], q[3][1], q[3][2], 0], i * 7); });
      return { n: list.length, a: a, list: list, groups: groups };
    }
    function lines() {
      var v = [], parts = [];
      function ring(R, seg, c) { var f = v.length / 3; for (var i = 0; i < seg; i++) { var a0 = 2 * PI * i / seg, a1 = 2 * PI * (i + 1) / seg; v.push(R * M.cos(a0), 0, R * M.sin(a0), R * M.cos(a1), 0, R * M.sin(a1)); } parts.push({ first: f, n: seg * 2, c: c }); }
      function axes(len, off, c) { var f = v.length / 3; v.push(-len, 0, 0, len, 0, 0, 0, -len, 0, 0, len, 0, 0, 0, -len, 0, 0, len); parts.push({ first: f, n: 6, c: c, off: off }); }
      if (S.mode === 'shell') shellR.forEach(function (R) { ring(R, 120, [0.56, 0.70, 0.78, 0.36]); });
      else if (S.layout === 'together') axes(1.02 / S.zoom, null, [0.56, 0.70, 0.78, 0.2]);
      else placements().forEach(function (p) { axes(p.cell * 1.15, p.off, [0.56, 0.70, 0.78, 0.16]); });
      return { n: v.length / 3, a: new Float32Array(v), parts: parts };
    }

    /* ------------------------------------------------------------ 2-D renderer (fallback) and labels */
    var sprites = {};
    function sprite(c) {
      var key = c.join(); if (sprites[key]) return sprites[key];
      var s = D.createElement('canvas'), N = 64; s.width = s.height = N; var x = s.getContext('2d');
      var col = function (k) { return 'rgb(' + M.round(M.min(1, c[0] * k) * 255) + ',' + M.round(M.min(1, c[1] * k) * 255) + ',' + M.round(M.min(1, c[2] * k) * 255) + ')'; };
      var g = x.createRadialGradient(N * 0.38, N * 0.33, N * 0.03, N / 2, N / 2, N / 2);
      g.addColorStop(0, '#fff'); g.addColorStop(0.16, col(1.05)); g.addColorStop(0.72, col(0.66)); g.addColorStop(1, col(0.36));
      x.fillStyle = g; x.beginPath(); x.arc(N / 2, N / 2, N / 2, 0, 2 * PI); x.fill();
      return (sprites[key] = s);
    }
    function draw2D(R) {
      var c = ctx, P = [0, 0, 0, 0], items = [];
      c.fillStyle = '#06111a'; c.fillRect(0, 0, S.w, S.h);
      var L = lines();
      L.parts.forEach(function (pt) {
        for (var i = pt.first; i < pt.first + pt.n; i += 2) {
          var a = proj(R, L.a[i * 3], L.a[i * 3 + 1], L.a[i * 3 + 2], [0, 0, 0, 0], 1, pt.off), b = proj(R, L.a[i * 3 + 3], L.a[i * 3 + 4], L.a[i * 3 + 5], [0, 0, 0, 0], 1, pt.off);
          items.push({ z: (a[2] + b[2]) / 2, line: [a[0], a[1], b[0], b[1]], c: pt.c });
        }
      });
      var sp = spheres();
      sp.groups.forEach(function (g) {
        for (var i = g.first; i < g.first + g.n; i++) { var q = sp.list[i]; proj(R, q[0], q[1], q[2], P); items.push({ z: P[2], x: P[0], y: P[1], r: g.r * P[3], c: q[3] }); }
      });
      items.sort(function (a, b) { return b.z - a.z; });
      items.forEach(function (it) {
        if (it.line) { c.strokeStyle = 'rgba(' + M.round(it.c[0] * 255) + ',' + M.round(it.c[1] * 255) + ',' + M.round(it.c[2] * 255) + ',' + it.c[3] + ')'; c.lineWidth = 1; c.beginPath(); c.moveTo(it.line[0], it.line[1]); c.lineTo(it.line[2], it.line[3]); c.stroke(); }
        else { var r = M.max(1.2, it.r); c.drawImage(sprite(it.c), it.x - r, it.y - r, 2 * r, 2 * r); }
      });
      if (S.mode === 'orbital') {
        var pl = placements(), al = alphas(pl, 2.6);
        c.save(); c.globalCompositeOperation = 'lighter';
        pl.forEach(function (p, i) {
          var ob = p.ob, pal = PAL[ob.l] || PAL[0], sz = al[i].dot;
          var cs = [pal[0], pal[1]].map(function (q) { return 'rgba(' + M.round(q[0] * 255) + ',' + M.round(q[1] * 255) + ',' + M.round(q[2] * 255) + ',' + M.min(1, al[i].al * 0.8).toFixed(3) + ')'; });
          var pts = p.pts;
          for (var k = 0; k < p.count; k++) {
            var o4 = k * 4; proj(R, pts[o4], pts[o4 + 2], -pts[o4 + 1], P, p.sc, p.off); if (P[2] <= 0.02) continue;
            c.fillStyle = pts[o4 + 3] > 0 ? cs[0] : cs[1]; c.fillRect(P[0] - sz / 2, P[1] - sz / 2, sz, sz);
          }
        });
        c.restore();
      }
    }
    function pill(c, x, y, t, col) {
      var wd = c.measureText(t).width + 12;
      c.fillStyle = 'rgba(6,17,26,0.8)'; c.beginPath(); rr(c, x - wd / 2, y - 10, wd, 20, 10); c.fill();
      c.fillStyle = col; c.fillText(t, x, y + 0.5);
    }
    function labels(R) {
      var c = ctx, P = [0, 0, 0, 0];
      c.textAlign = 'center'; c.textBaseline = 'middle';
      if (S.mode === 'shell') {
        c.font = '600 12px system-ui, sans-serif';
        (S.el.shells || []).forEach(function (cnt, k) {
          var best = null;
          for (var i = 0; i < 36; i++) { var a = 2 * PI * i / 36, R0 = shellR[k]; proj(R, R0 * M.cos(a), 0, R0 * M.sin(a), P); if (!best || P[0] > best.x) best = { x: P[0], y: P[1] }; }
          pill(c, best.x, best.y, String(cnt), '#ffd479');
        });
      } else if (S.layout === 'together') {
        var ax = 1.02 / S.zoom;
        c.font = 'italic 600 14px Georgia, serif';
        [['x', ax, 0, 0], ['y', 0, 0, -ax], ['z', 0, ax, 0]].forEach(function (q) { proj(R, q[1] * 1.07, q[2] * 1.07, q[3] * 1.07, P); if (P[0] > 10 && P[0] < S.w - 10 && P[1] > 10 && P[1] < S.h - 10) { c.fillStyle = 'rgba(219,231,239,0.75)'; c.fillText(q[0], P[0], P[1]); } });
      } else {
        c.font = '600 13px system-ui, sans-serif';
        placements().forEach(function (p) {
          var f = ppu() / (DIST / S.zoom), x = S.w / 2 + p.off[0] * f, y = S.h / 2 - (p.off[1] - p.cell * 1.08) * f;
          var t = p.ob.text + '  ·  ' + p.ob.electrons + ' e⁻';
          pill(c, x, M.min(S.h - 12, y), t, S.sel === p.ob ? '#ffd479' : '#dbe7ef');
        });
      }
    }
    function rr(c, x, y, w, h, r) { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

    /* ------------------------------------------------------------ frames */
    function fit() {
      var r = view.getBoundingClientRect(), dpr = M.min(2, W.devicePixelRatio || 1);
      S.w = M.max(50, r.width); S.h = M.max(50, r.height); S.dpr = dpr;
      var w2 = M.round(S.w * dpr), h2 = M.round(S.h * dpr);
      if (cov.width !== w2 || cov.height !== h2) { cov.width = w2; cov.height = h2; }
    }
    var last = performance.now(), visible = true;
    if ('IntersectionObserver' in W) { try { new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(view); } catch (e) { } }
    function frame(now) {
      W.requestAnimationFrame(frame);
      var dt = M.min(0.05, M.max(0, (now - last) / 1000)); last = now;
      if (D.hidden || !visible || !S.el) return;
      try { render(dt); } catch (err) { if (W.console) W.console.error(err); }
    }
    function render(dt) {
      fit();
      S.idle += dt;
      if (!reduced) { S.t += dt; if (S.idle > 3) S.yaw += dt * 0.16; }
      S.zoom = reduced ? S.tZoom : S.zoom * M.pow(S.tZoom / S.zoom, M.min(1, dt * 7));
      if (M.abs(S.zoom / S.tZoom - 1) < 1e-3) S.zoom = S.tZoom;
      var R = rot();
      ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
      if (gl) { ctx.clearRect(0, 0, S.w, S.h); drawGL(R); } else draw2D(R);
      labels(R);
      api.frames = (api.frames || 0) + 1;
      if (o.onFrame) o.onFrame();
    }
    W.requestAnimationFrame(frame);
    api.render = function () { if (S.el) render(0); };

    /* ------------------------------------------------------------ picking an orbital */
    api.pickAt = function (x, y) {
      if (S.mode !== 'orbital') return null;
      var R = rot(), P = [0, 0, 0, 0], pl = placements(), best = null, bestN = 0, rad = 14;
      if (S.layout === 'apart') { // the nearest cell
        var f = ppu() / (DIST / S.zoom), bd = 1e9;
        pl.forEach(function (p) { var dx = S.w / 2 + p.off[0] * f - x, dy = S.h / 2 - p.off[1] * f - y, d = dx * dx + dy * dy; if (d < bd && d < M.pow(p.cell * f * 1.3, 2)) { bd = d; best = p.ob; } });
        return best;
      }
      pl.forEach(function (p) {
        var ob = p.ob, n = 0, step = ob.count > 1200 ? 4 : 1;
        for (var k = 0; k < ob.count; k += step) {
          var o4 = k * 4; proj(R, ob.pts[o4], ob.pts[o4 + 2], -ob.pts[o4 + 1], P, p.sc);
          var dx = P[0] - x, dy = P[1] - y; if (dx * dx + dy * dy < rad * rad) n += step;
        }
        n /= ob.count; // the share of this orbital's cloud under the finger
        if (n > bestN) { bestN = n; best = ob; }
      });
      return bestN > 0.003 ? best : null;
    };

    /* ------------------------------------------------------------ input */
    var ptrs = {}, drag = null, pinch = null;
    function pos(ev) { var r = view.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
    function clampZ(z) { return M.max(0.4, M.min(S.mode === 'orbital' && S.layout === 'together' ? 600 : 5, z)); }
    cov.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      ptrs[ev.pointerId] = pos(ev); try { cov.setPointerCapture(ev.pointerId); } catch (e) { }
      var ids = Object.keys(ptrs);
      if (ids.length === 1) drag = { x: ptrs[ids[0]][0], y: ptrs[ids[0]][1], moved: 0 };
      else if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: M.hypot(a[0] - b[0], a[1] - b[1]), z: S.tZoom }; drag = null; }
      S.idle = 0;
    });
    cov.addEventListener('pointermove', function (ev) {
      if (!ptrs[ev.pointerId]) return;
      ptrs[ev.pointerId] = pos(ev);
      var ids = Object.keys(ptrs);
      if (pinch && ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]], d = M.hypot(a[0] - b[0], a[1] - b[1]); S.tZoom = S.zoom = clampZ(pinch.z * d / M.max(10, pinch.d)); }
      else if (drag) {
        var p = ptrs[ids[0]], dx = p[0] - drag.x, dy = p[1] - drag.y; drag.x = p[0]; drag.y = p[1]; drag.moved += M.abs(dx) + M.abs(dy);
        S.yaw += dx * 0.009; S.pitch = M.max(-1.45, M.min(1.45, S.pitch + dy * 0.009));
      }
      S.idle = 0;
    });
    function up(ev) {
      if (!ptrs[ev.pointerId]) return;
      var p = ptrs[ev.pointerId]; delete ptrs[ev.pointerId];
      if (drag && drag.moved < 8 && S.mode === 'orbital') { var ob = api.pickAt(p[0], p[1]); S.sel = ob; if (o.onPick) o.onPick(ob); }
      if (Object.keys(ptrs).length < 2) pinch = null;
      if (!Object.keys(ptrs).length) drag = null;
    }
    cov.addEventListener('pointerup', up); cov.addEventListener('pointercancel', up);
    cov.addEventListener('wheel', function (ev) { ev.preventDefault(); S.tZoom = clampZ(S.tZoom * M.exp(-ev.deltaY * (ev.deltaMode === 1 ? 0.05 : 0.0015))); S.idle = 0; }, { passive: false });
    cov.addEventListener('keydown', function (ev) {
      var k = ev.key, h = true;
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (k === 'ArrowLeft') S.yaw -= 0.15; else if (k === 'ArrowRight') S.yaw += 0.15;
      else if (k === 'ArrowUp') S.pitch = M.max(-1.45, S.pitch - 0.15); else if (k === 'ArrowDown') S.pitch = M.min(1.45, S.pitch + 0.15);
      else if (k === '+' || k === '=') S.tZoom = clampZ(S.tZoom * 1.25); else if (k === '-' || k === '_') S.tZoom = clampZ(S.tZoom / 1.25);
      else if (k === '0') api.reset();
      else h = false;
      if (h) { ev.preventDefault(); S.idle = 0; }
    });
    api.zoomBy = function (f) { S.tZoom = clampZ(S.tZoom * f); S.idle = 0; };
    return api;
  }
  W.TRBElView = { create: create, PAL: PAL };
})(window, document);
