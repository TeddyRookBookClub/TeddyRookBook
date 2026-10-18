/* Ancient Egypt in 3-D (/egypt/3d/): a small 3-D viewer written for Teddy Rook Book.
   WebGL 1 with flat-shaded, low-poly meshes, a sun and sky light and distance haze; if WebGL is missing it draws the same
   meshes on a 2-D canvas (painter's algorithm). Orbit, zoom and pan by mouse, touch and keyboard; labels; guided tours;
   see-through shells; per-model switches. Models are registered by models.js through TRB3D.add(model).
   No outside libraries. Coordinates are meters: x east, y up, z south (so north is -z). */
(function (G) {
  'use strict';
  var T = G.TRB3D = G.TRB3D || {};
  T.models = T.models || [];
  T.add = function (m) { T.models.push(m); };
  var M = Math, PI = M.PI;
  var reduced = false; try { reduced = G.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  /* ------------------------------------------------------------------ vectors */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function addv(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = M.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpv(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function hex(c) { var n = parseInt(c.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
  T.v = { sub: sub, add: addv, mul: mul, dot: dot, cross: cross, norm: norm, lerp: lerp, lerpv: lerpv };

  /* ------------------------------------------------------------------ meshes
     Mesh: flat triangles with a color each. Every closed primitive orients its faces outward from its own center,
     so back faces can be culled. Lines (edges) are kept apart and drawn on top as thin strokes. */
  function Mesh() { this.p = []; this.n = []; this.c = []; this.l = []; this.tris = 0; }
  Mesh.prototype.tri = function (a, b, c, col, inside) {
    var n = cross(sub(b, a), sub(c, a));
    if (M.hypot(n[0], n[1], n[2]) < 1e-9) return this;
    if (inside) { var cen = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]; if (dot(n, sub(cen, inside)) < 0) { var t = b; b = c; c = t; n = mul(n, -1); } }
    n = norm(n); var C = typeof col === 'string' ? hex(col) : col;
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (var i = 0; i < 3; i++) { this.n.push(n[0], n[1], n[2]); this.c.push(C[0], C[1], C[2]); }
    this.tris++; return this;
  };
  // a planar polygon (convex, in order), facing away from `inside` (or toward `up` when given as {dir})
  Mesh.prototype.poly = function (pts, col, inside) {
    for (var i = 1; i < pts.length - 1; i++) this.tri(pts[0], pts[i], pts[i + 1], col, inside);
    return this;
  };
  Mesh.prototype.face = function (pts, col, dir) { // polygon whose normal should point along dir
    var n = cross(sub(pts[1], pts[0]), sub(pts[2], pts[0]));
    if (dot(n, dir) < 0) pts = pts.slice().reverse();
    for (var i = 1; i < pts.length - 1; i++) this.tri(pts[0], pts[i], pts[i + 1], col);
    return this;
  };
  Mesh.prototype.line = function (a, b) { this.l.push(a[0], a[1], a[2], b[0], b[1], b[2]); return this; };
  Mesh.prototype.loop = function (pts) { for (var i = 0; i < pts.length; i++) this.line(pts[i], pts[(i + 1) % pts.length]); return this; };
  // a convex solid from a bottom ring and a top ring of the same length (rings in the same rotational order)
  Mesh.prototype.rings = function (bot, top, col, o) {
    o = o || {}; var n = bot.length, cen = [0, 0, 0], i;
    for (i = 0; i < n; i++) { cen = addv(cen, bot[i]); cen = addv(cen, top[i]); }
    cen = mul(cen, 1 / (2 * n));
    var cs = o.cols || {};
    for (i = 0; i < n; i++) { var j = (i + 1) % n; this.poly([bot[i], bot[j], top[j], top[i]], cs.side || (o.sideCols && o.sideCols[i]) || col, cen); }
    if (!o.noTop) this.poly(top, cs.top || col, cen);
    if (!o.noBottom) this.poly(bot, cs.bottom || col, cen);
    if (o.edges) { this.loop(bot); this.loop(top); for (i = 0; i < n; i++) this.line(bot[i], top[i]); }
    return this;
  };
  Mesh.prototype.box = function (x0, y0, z0, x1, y1, z1, col, o) {
    var b = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], t = [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    return this.rings(b, t, col, o);
  };
  // a box centered at (cx, cz) on the ground plane y0..y1, size w (x) by d (z)
  Mesh.prototype.cbox = function (cx, y0, cz, w, h, d, col, o) { return this.box(cx - w / 2, y0, cz - d / 2, cx + w / 2, y0 + h, cz + d / 2, col, o); };
  // a frustum (battered walls): bottom w0 x d0 at y0, top w1 x d1 at y1, centered at (cx, cz); top may be shifted by (ox, oz)
  Mesh.prototype.frustum = function (cx, cz, y0, y1, w0, d0, w1, d1, col, o) {
    o = o || {}; var ox = o.ox || 0, oz = o.oz || 0;
    var b = [[cx - w0 / 2, y0, cz - d0 / 2], [cx + w0 / 2, y0, cz - d0 / 2], [cx + w0 / 2, y0, cz + d0 / 2], [cx - w0 / 2, y0, cz + d0 / 2]];
    if (w1 <= 0.0001 && d1 <= 0.0001) { // a pyramid
      var apex = [cx + ox, y1, cz + oz], cen = [cx, y0 + (y1 - y0) / 4, cz], cs = o.sideCols || [];
      for (var i = 0; i < 4; i++) this.tri(b[i], b[(i + 1) % 4], apex, cs[i] || col, cen);
      if (!o.noBottom) this.poly(b, col, cen);
      if (o.edges) { this.loop(b); for (var k = 0; k < 4; k++) this.line(b[k], apex); }
      return this;
    }
    var t = [[cx + ox - w1 / 2, y1, cz + oz - d1 / 2], [cx + ox + w1 / 2, y1, cz + oz - d1 / 2], [cx + ox + w1 / 2, y1, cz + oz + d1 / 2], [cx + ox - w1 / 2, y1, cz + oz + d1 / 2]];
    return this.rings(b, t, col, o);
  };
  // a vertical prism over a convex footprint [[x, z], ...]
  Mesh.prototype.prism = function (fp, y0, y1, col, o) {
    return this.rings(fp.map(function (q) { return [q[0], y0, q[1]]; }), fp.map(function (q) { return [q[0], y1, q[1]]; }), col, o);
  };
  Mesh.prototype.cyl = function (cx, cz, y0, y1, r0, r1, seg, col, o) {
    var b = [], t = [];
    for (var i = 0; i < seg; i++) { var a = i / seg * 2 * PI; b.push([cx + r0 * M.cos(a), y0, cz + r0 * M.sin(a)]); t.push([cx + r1 * M.cos(a), y1, cz + r1 * M.sin(a)]); }
    return this.rings(b, t, col, o);
  };
  // a passage: a box swept from A to B (floor centerline points), width w across, height h measured vertically
  Mesh.prototype.passage = function (A, B, w, h, col, o) {
    var d = sub(B, A), side = norm(cross(d, [0, 1, 0])); if (!isFinite(side[0]) || M.hypot(side[0], side[2]) < 1e-6) side = [1, 0, 0];
    var s = mul(side, w / 2), up = [0, h, 0];
    var b = [sub(A, s), addv(A, s), addv(B, s), sub(B, s)];
    var t = b.map(function (p) { return addv(p, up); });
    // order the ring around the box: A-s, A+s, B+s, B-s at the floor; the same raised
    return this.rings(b, t, col, o);
  };
  // a gable-roofed room: floor rect (x0..x1, z0..z1) at y0, walls to y1, ridge (along x) at y2
  Mesh.prototype.gable = function (x0, z0, x1, z1, y0, y1, y2, col, o) {
    this.box(x0, y0, z0, x1, y1, z1, col, { noTop: true, edges: o && o.edges });
    var zm = (z0 + z1) / 2, cen = [(x0 + x1) / 2, (y1 + y2) / 2, zm];
    this.poly([[x0, y1, z0], [x1, y1, z0], [x1, y2, zm], [x0, y2, zm]], col, cen);
    this.poly([[x0, y1, z1], [x0, y2, zm], [x1, y2, zm], [x1, y1, z1]], col, cen);
    this.tri([x0, y1, z0], [x0, y2, zm], [x0, y1, z1], col, cen);
    this.tri([x1, y1, z0], [x1, y1, z1], [x1, y2, zm], col, cen);
    if (o && o.edges) { this.line([x0, y1, z0], [x0, y2, zm]); this.line([x0, y2, zm], [x0, y1, z1]); this.line([x1, y1, z0], [x1, y2, zm]); this.line([x1, y2, zm], [x1, y1, z1]); this.line([x0, y2, zm], [x1, y2, zm]); }
    return this;
  };
  // a triangle with its own vertex normals (smooth shading)
  Mesh.prototype.triN = function (a, b, c, na, nb, nc, col) {
    var cs = Array.isArray(col) && Array.isArray(col[0]) ? col : null, C = cs ? null : typeof col === 'string' ? hex(col) : col;
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    [na, nb, nc].forEach(function (n, k) { var q = cs ? cs[k] : C; this.n.push(n[0], n[1], n[2]); this.c.push(q[0], q[1], q[2]); }, this);
    this.tris++; return this;
  };
  // a ground grid over [x0, x1] x [z0, z1] with height f(x, z) and color fc(x, z, y), smoothly shaded
  Mesh.prototype.terrain = function (x0, z0, x1, z1, nx, nz, f, fc) {
    var dx = (x1 - x0) / nx, dz = (z1 - z0) / nz;
    function nf(x, z) { return norm([-(f(x + dx * 0.5, z) - f(x - dx * 0.5, z)) / dx, 1, -(f(x, z + dz * 0.5) - f(x, z - dz * 0.5)) / dz]); }
    for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++) {
      var xa = x0 + i * dx, xb = xa + dx, za = z0 + j * dz, zb = za + dz;
      var p00 = [xa, f(xa, za), za], p10 = [xb, f(xb, za), za], p11 = [xb, f(xb, zb), zb], p01 = [xa, f(xa, zb), zb];
      var n00 = nf(xa, za), n10 = nf(xb, za), n11 = nf(xb, zb), n01 = nf(xa, zb);
      var c00 = fc(xa, za, p00[1]), c10 = fc(xb, za, p10[1]), c11 = fc(xb, zb, p11[1]), c01 = fc(xa, zb, p01[1]);
      this.triN(p00, p01, p11, n00, n01, n11, [c00, c01, c11]); this.triN(p00, p11, p10, n00, n11, n10, [c00, c11, c10]);
    }
    return this;
  };
  // rotate about the y axis (angle a, radians, counterclockwise seen from above with x east, z south) about (cx, cz)
  Mesh.prototype.rotY = function (a, cx, cz, from) {
    var c = M.cos(a), s = M.sin(a), f = (from || 0) * 9, P = this.p, N = this.n, i;
    cx = cx || 0; cz = cz || 0;
    for (i = f; i < P.length; i += 3) { var x = P[i] - cx, z = P[i + 2] - cz; P[i] = cx + x * c + z * s; P[i + 2] = cz - x * s + z * c; var nx = N[i], nz = N[i + 2]; N[i] = nx * c + nz * s; N[i + 2] = -nx * s + nz * c; }
    return this;
  };
  Mesh.prototype.mark = function () { return this.p.length / 9; }; // triangle index, for rotating only what came after
  T.Mesh = Mesh;
  T.mesh = function () { return new Mesh(); };

  /* ------------------------------------------------------------------ matrices (column-major, as WebGL wants) */
  function persp(fov, asp, n, f) { var t = 1 / M.tan(fov / 2), r = 1 / (n - f); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (n + f) * r, -1, 0, 0, 2 * n * f * r, 0]; }
  function lookAt(e, c, u) {
    var z = norm(sub(e, c)), x = norm(cross(u, z)), y = cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
  }
  function mm(a, b) { var o = new Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
  function xf(m, p) { var x = p[0], y = p[1], z = p[2]; return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]]; }

  /* ------------------------------------------------------------------ ray tests (label occlusion, hidden edges in 2-D) */
  function bbox(o) {
    var P = o.mesh.p, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (var i = 0; i < P.length; i += 3) for (var k = 0; k < 3; k++) { if (P[i + k] < lo[k]) lo[k] = P[i + k]; if (P[i + k] > hi[k]) hi[k] = P[i + k]; }
    return [lo, hi];
  }
  function hitBox(e, d, lo, hi) { var t0 = 0, t1 = 1; for (var k = 0; k < 3; k++) { if (M.abs(d[k]) < 1e-12) { if (e[k] < lo[k] || e[k] > hi[k]) return false; continue; } var a = (lo[k] - e[k]) / d[k], b = (hi[k] - e[k]) / d[k]; if (a > b) { var t = a; a = b; b = t; } t0 = M.max(t0, a); t1 = M.min(t1, b); if (t0 > t1) return false; } return true; }
  // does the segment e -> e + d (t in (0.002, tmax)) cross a triangle of object o (placed at o.off)?
  function rayHits(o, e, d, tmax) {
    if (!o.bb) o.bb = bbox(o);
    var ee = sub(e, o.off); if (!hitBox(ee, d, o.bb[0], o.bb[1])) return false;
    var P = o.mesh.p;
    for (var i = 0; i < P.length; i += 9) {
      var e1x = P[i + 3] - P[i], e1y = P[i + 4] - P[i + 1], e1z = P[i + 5] - P[i + 2], e2x = P[i + 6] - P[i], e2y = P[i + 7] - P[i + 1], e2z = P[i + 8] - P[i + 2];
      var px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x, det = e1x * px + e1y * py + e1z * pz;
      if (M.abs(det) < 1e-12) continue;
      var inv = 1 / det, tx = ee[0] - P[i], ty = ee[1] - P[i + 1], tz = ee[2] - P[i + 2], u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) continue;
      var qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (d[0] * qx + d[1] * qy + d[2] * qz) * inv; if (v < 0 || u + v > 1) continue;
      var t = (e2x * qx + e2y * qy + e2z * qz) * inv; if (t > 0.002 && t < tmax) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ the WebGL renderer */
  var VS = 'attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform mat4 vp;uniform vec3 off;uniform vec3 eye;varying vec3 vn;varying vec3 vc;varying float vd;varying vec2 vw;' +
    'void main(){vec3 w=p+off;vn=n;vc=c;vd=distance(w,eye);vw=w.xz;gl_Position=vp*vec4(w,1.0);}';
  var FS = 'precision highp float;varying vec3 vn;varying vec3 vc;varying float vd;varying vec2 vw;uniform vec3 sun;uniform vec3 sky;uniform vec3 gnd;uniform vec3 fog;uniform vec2 fr;uniform vec4 isl;uniform float a;uniform float lit;' +
    'void main(){vec3 N=normalize(vn);if(!gl_FrontFacing)N=-N;float d=max(dot(N,sun),0.0);float h=0.5+0.5*N.y;vec3 amb=mix(gnd,sky,h);' +
    'vec3 col=mix(vc,vc*(amb+vec3(1.0,0.96,0.88)*d*0.62),lit);float f=clamp((vd-fr.x)/(fr.y-fr.x),0.0,1.0);f=f*f*0.9;' +
    'float g=smoothstep(isl.z,isl.w,distance(vw,isl.xy));col=mix(col,fog,max(f,g));gl_FragColor=vec4(col,a*(1.0-g*g));}';
  var LVS = 'attribute vec3 p;uniform mat4 vp;uniform vec3 off;void main(){gl_Position=vp*vec4(p+off,1.0);gl_Position.z-=0.0004*gl_Position.w;}';
  var LFS = 'precision mediump float;uniform vec4 col;void main(){gl_FragColor=col;}';
  function GL(canvas) {
    var gl = null;
    try { gl = canvas.getContext('webgl', { antialias: true, alpha: false, premultipliedAlpha: false }) || canvas.getContext('experimental-webgl'); } catch (e) { gl = null; }
    if (!gl) return null;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    function prog(v, f, attrs) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); attrs.forEach(function (a, i) { gl.bindAttribLocation(p, i, a); }); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link'); var u = {}; var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (var i = 0; i < n; i++) { var nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); } return { p: p, u: u }; }
    var P, L;
    try { P = prog(VS, FS, ['p', 'n', 'c']); L = prog(LVS, LFS, ['p']); } catch (e) { return null; }
    var R = { kind: 'webgl', gl: gl };
    R.upload = function (obj) {
      var m = obj.mesh, buf = function (arr) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return b; };
      obj.gl = { p: buf(m.p), n: buf(m.n), c: buf(m.c), count: m.p.length / 3, l: m.l.length ? buf(m.l) : null, lcount: m.l.length / 3 };
    };
    R.release = function (obj) { if (!obj.gl) return; ['p', 'n', 'c', 'l'].forEach(function (k) { if (obj.gl[k]) gl.deleteBuffer(obj.gl[k]); }); obj.gl = null; };
    R.draw = function (S) {
      gl.viewport(0, 0, S.pw, S.ph);
      var bg = S.bg; gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      gl.useProgram(P.p); var u = P.u;
      gl.uniformMatrix4fv(u.vp, false, new Float32Array(S.vp)); gl.uniform3fv(u.eye, S.eye); gl.uniform3fv(u.sun, S.sun);
      gl.uniform3fv(u.sky, S.sky); gl.uniform3fv(u.gnd, S.gnd); gl.uniform3fv(u.fog, S.bg); gl.uniform2fv(u.fr, S.fogR); gl.uniform4fv(u.isl, S.isl);
      for (var i = 0; i < 3; i++) gl.enableVertexAttribArray(i);
      function bind(o) { gl.bindBuffer(gl.ARRAY_BUFFER, o.gl.p); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ARRAY_BUFFER, o.gl.n); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ARRAY_BUFFER, o.gl.c); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0); gl.uniform3fv(u.off, o.off); gl.uniform1f(u.lit, o.unlit ? 0 : 1); }
      // opaque first
      gl.disable(gl.BLEND); gl.depthMask(true);
      S.list.forEach(function (o) { if (o.alpha < 0.999) return; if (o.ds) gl.disable(gl.CULL_FACE); else { gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); } bind(o); gl.uniform1f(u.a, 1); gl.drawArrays(gl.TRIANGLES, 0, o.gl.count); });
      // then see-through shells, far to near, back faces before front faces
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.enable(gl.CULL_FACE);
      S.list.filter(function (o) { return o.alpha < 0.999 && o.alpha > 0.001; }).sort(function (a, b) { return b.dist - a.dist; }).forEach(function (o) {
        bind(o); gl.uniform1f(u.a, o.alpha);
        if (o.ds) { gl.disable(gl.CULL_FACE); gl.drawArrays(gl.TRIANGLES, 0, o.gl.count); gl.enable(gl.CULL_FACE); return; }
        gl.cullFace(gl.FRONT); gl.drawArrays(gl.TRIANGLES, 0, o.gl.count); gl.cullFace(gl.BACK); gl.drawArrays(gl.TRIANGLES, 0, o.gl.count);
      });
      gl.depthMask(true); gl.disable(gl.CULL_FACE);
      for (i = 1; i < 3; i++) gl.disableVertexAttribArray(i);
      // edges
      gl.useProgram(L.p); gl.uniformMatrix4fv(L.u.vp, false, new Float32Array(S.vp));
      S.list.forEach(function (o) {
        if (!o.gl.l || !o.edgeCol) return; var la = o.edgeAlpha * (o.alpha < 0.999 ? M.max(0.35, o.alpha * 2.5) : 1); if (la <= 0.01) return;
        gl.uniform3fv(L.u.off, o.off); gl.uniform4fv(L.u.col, [o.edgeCol[0], o.edgeCol[1], o.edgeCol[2], la]);
        gl.bindBuffer(gl.ARRAY_BUFFER, o.gl.l); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.LINES, 0, o.gl.lcount);
      });
      gl.disable(gl.BLEND);
    };
    return R;
  }

  /* ------------------------------------------------------------------ the 2-D canvas fallback: the same scene, sorted by depth */
  function C2(canvas) {
    var ctx = canvas.getContext('2d'); if (!ctx) return null;
    var R = { kind: '2d' };
    R.upload = function () { }; R.release = function () { };
    R.draw = function (S) {
      var W = S.pw, H = S.ph, vp = S.vp, polys = [];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = 'rgb(' + S.bg.map(function (v) { return M.round(v * 255); }).join(',') + ')'; ctx.fillRect(0, 0, W, H);
      S.list.forEach(function (o) {
        if (o.inner && !S.xray) return;
        var P = o.mesh.p, N = o.mesh.n, C = o.mesh.c, off = o.off, see = o.alpha < 0.999;
        for (var i = 0; i < P.length; i += 9) {
          var a = [P[i] + off[0], P[i + 1] + off[1], P[i + 2] + off[2]], n = [N[i], N[i + 1], N[i + 2]];
          var toEye = sub(S.eye, a), facing = dot(n, toEye) > 0;
          if (!facing && !o.ds && !see) continue;
          var q = [], zs = 0, bad = false;
          for (var k = 0; k < 3; k++) { var c = xf(vp, [P[i + k * 3] + off[0], P[i + k * 3 + 1] + off[1], P[i + k * 3 + 2] + off[2]]); if (c[3] < S.near * 0.5) { bad = true; break; } q.push((c[0] / c[3] * 0.5 + 0.5) * W, (0.5 - c[1] / c[3] * 0.5) * H); zs += c[3]; }
          if (bad) continue;
          var nn = facing ? n : mul(n, -1), d = M.max(0, dot(nn, S.sun)), h = 0.5 + 0.5 * nn[1], dist = zs / 3;
          var cxw = (P[i] + P[i + 3] + P[i + 6]) / 3 + off[0], czw = (P[i + 2] + P[i + 5] + P[i + 8]) / 3 + off[2], gI = M.hypot(cxw - S.isl[0], czw - S.isl[1]), gF = M.min(1, M.max(0, (gI - S.isl[2]) / (S.isl[3] - S.isl[2]))); gF = gF * gF * (3 - 2 * gF);
          if (gF > 0.995) continue;
          var col = [0, 0, 0];
          for (var j = 0; j < 3; j++) { var amb = S.gnd[j] + (S.sky[j] - S.gnd[j]) * h, base = C[i + j], v = o.unlit ? base : base * (amb + [1, 0.96, 0.88][j] * d * 0.62); var f = M.min(1, M.max(0, (M.hypot(toEye[0], toEye[1], toEye[2]) - S.fogR[0]) / (S.fogR[1] - S.fogR[0]))); f = M.max(f * f * 0.9, gF); v = v + (S.bg[j] - v) * f; col[j] = M.round(M.min(1, v) * 255); }
          polys.push({ q: q, z: dist, c: 'rgba(' + col.join(',') + ',' + (see ? o.alpha.toFixed(3) : 1) + ')', see: see });
        }
      });
      polys.sort(function (a, b) { return b.z - a.z; });
      ctx.lineJoin = 'round'; ctx.lineWidth = 0.6;
      polys.forEach(function (p) { var q = p.q; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); ctx.lineTo(q[4], q[5]); ctx.closePath(); ctx.fillStyle = p.c; ctx.fill(); if (!p.see) { ctx.strokeStyle = p.c; ctx.stroke(); } });
      // edges
      S.list.forEach(function (o) {
        var Lp = o.mesh.l; if (!Lp.length || !o.edgeCol) return; var la = o.edgeAlpha * (o.alpha < 0.999 ? M.max(0.35, o.alpha * 2.5) : 1); if (la <= 0.01) return;
        ctx.strokeStyle = 'rgba(' + o.edgeCol.map(function (v) { return M.round(v * 255); }).join(',') + ',' + la + ')'; ctx.lineWidth = 1; ctx.beginPath();
        if (o.inner && !S.xray) return;
        for (var i = 0; i < Lp.length; i += 6) { var a = xf(vp, [Lp[i] + o.off[0], Lp[i + 1] + o.off[1], Lp[i + 2] + o.off[2]]), b = xf(vp, [Lp[i + 3] + o.off[0], Lp[i + 4] + o.off[1], Lp[i + 5] + o.off[2]]); if (a[3] < S.near || b[3] < S.near) continue;
          if (o.alpha >= 0.999 && o.mesh.p.length) { var mid = [(Lp[i] + Lp[i + 3]) / 2 + o.off[0], (Lp[i + 1] + Lp[i + 4]) / 2 + o.off[1], (Lp[i + 2] + Lp[i + 5]) / 2 + o.off[2]]; if (rayHits(o, S.eye, sub(mid, S.eye), 0.995)) continue; } ctx.moveTo((a[0] / a[3] * 0.5 + 0.5) * W, (0.5 - a[1] / a[3] * 0.5) * H); ctx.lineTo((b[0] / b[3] * 0.5 + 0.5) * W, (0.5 - b[1] / b[3] * 0.5) * H); }
        ctx.stroke();
      });
    };
    return R;
  }

  /* ------------------------------------------------------------------ the viewer */
  function el(tag, cls, html, attrs) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - M.pow(-2 * t + 2, 3) / 2; }
  function wrapAng(a) { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; }

  function Viewer(root, opts) {
    opts = opts || {};
    var self = this, models = T.models, cur = null, scene = null, R = null, forced2d = /[?&]render=2d/.test(location.search) || opts.force2d;
    var cam = { t: [0, 0, 0], yaw: 0, pitch: 0.5, d: 100 }, anim = null, raf = 0, dirty = true, W = 300, H = 200, dpr = 1;
    var showLabels = true, xray = false, vals = {}, stopIx = -1, sAnim = null;
    root.innerHTML = '';
    root.classList.add('td-ready');
    // the picker
    var picker = el('div', 'td-picker', null, { role: 'tablist', 'aria-label': 'Choose a model' });
    models.forEach(function (m) {
      var b = el('button', 'td-pick', '<span class="td-pi" aria-hidden="true">' + m.icon + '</span><span class="td-pt">' + esc(m.title) + '</span>', { type: 'button', role: 'tab', 'aria-selected': 'false', 'data-id': m.id, id: 'td-tab-' + m.id });
      b.addEventListener('click', function () { self.open(m.id, true); });
      picker.appendChild(b);
    });
    picker.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; var i = models.indexOf(cur); i = (i + (e.key === 'ArrowRight' ? 1 : models.length - 1)) % models.length;
      self.open(models[i].id, true); var t = picker.querySelector('[data-id="' + models[i].id + '"]'); if (t) t.focus(); e.preventDefault(); e.stopPropagation();
    });
    root.appendChild(picker);
    var head = el('div', 'td-head'); root.appendChild(head);
    var stage = el('div', 'td-stage'); root.appendChild(stage);
    var canvas = el('canvas', 'td-canvas', null, { tabindex: '0', role: 'img' }); stage.appendChild(canvas);
    var labels = el('div', 'td-labels'); stage.appendChild(labels);
    var hud = el('div', 'td-hud', '<span class="td-compass" aria-hidden="true"><svg viewBox="-20 -20 40 40" width="40" height="40"><circle r="18" class="td-cring"/><path class="td-needle" d="M0 -14 L5 3 L0 0 L-5 3 Z"/><text class="td-cn" y="-5.5" text-anchor="middle">N</text></svg></span><span class="td-scale"><i></i><b></b></span>');
    stage.appendChild(hud);
    var needle = hud.querySelector('svg'), scaleBar = hud.querySelector('.td-scale i'), scaleTxt = hud.querySelector('.td-scale b');
    var tools = el('div', 'td-tools'); stage.appendChild(tools);
    function tool(label, icon, fn, pressed) { var b = el('button', 'td-tool', icon, { type: 'button', 'aria-label': label, title: label }); if (pressed != null) b.setAttribute('aria-pressed', pressed ? 'true' : 'false'); b.addEventListener('click', fn); tools.appendChild(b); return b; }
    var bIn = tool('Zoom in (+)', '<svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>', function () { zoom(0.75); });
    var bOut = tool('Zoom out (−)', '<svg viewBox="0 0 20 20"><path d="M4 10h12"/></svg>', function () { zoom(1 / 0.75); });
    var bReset = tool('Reset the view (R)', '<svg viewBox="0 0 20 20"><path d="M4.5 9a6 6 0 1 1 1.6 5"/><path d="M4 4v5h5"/></svg>', function () { self.reset(); });
    var bLab = tool('Labels on or off (L)', '<svg viewBox="0 0 20 20"><path d="M3 5h9l5 5-5 5H3z"/><circle cx="7" cy="10" r="1.3"/></svg>', function () { setLabels(!showLabels); }, true);
    var bX = tool('See through (X)', '<svg viewBox="0 0 20 20"><path d="M10 3l7 12H3z"/><path d="M10 8v5M8 11h4" class="td-thin"/></svg>', function () { setX(!xray); }, false);
    var bFull = null;
    if (stage.requestFullscreen) bFull = tool('Full screen (F)', '<svg viewBox="0 0 20 20"><path d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5"/></svg>', function () { if (document.fullscreenElement) document.exitFullscreen(); else stage.requestFullscreen().catch(function () { }); });
    var note = el('div', 'td-note', '', { role: 'status' }); stage.appendChild(note);
    var help = el('p', 'td-help', 'Drag to turn · Right-drag, Shift-drag or two fingers to pan · Scroll or pinch to zoom · Keys: arrows turn, Shift+arrows pan, + and − zoom, R resets, L labels, X see-through, N and P step through the tour.');
    var bar = el('div', 'td-bar'); root.appendChild(bar);
    var tour = el('div', 'td-tour'); root.appendChild(tour);
    root.appendChild(help);
    var tourCap = el('div', 'td-cap', '', { 'aria-live': 'polite' });
    var tPrev = el('button', 'hs-btn td-tprev', '‹ Back', { type: 'button' }), tNext = el('button', 'hs-btn pri td-tnext', 'Start the tour ›', { type: 'button' });
    tour.appendChild(tPrev); tour.appendChild(tourCap); tour.appendChild(tNext);
    tPrev.addEventListener('click', function () { step(-1); }); tNext.addEventListener('click', function () { step(1); });

    // renderer
    if (!forced2d) R = GL(canvas);
    if (!R) {
      if (!forced2d) { var c2 = canvas.cloneNode(false); stage.replaceChild(c2, canvas); canvas = c2; } // a canvas that tried WebGL can't give a 2-D context
      R = C2(canvas);
      note.innerHTML = forced2d ? 'Drawing without WebGL (test mode).' : 'Your browser didn’t offer WebGL, so this is a simpler 2-D drawing of the same model. It works the same way, a little slower. The plans and measurements below tell the same story.';
      var nx = el('button', 'td-nx', '×', { type: 'button', 'aria-label': 'Hide this note' }); nx.addEventListener('click', function () { note.classList.remove('on'); }); note.appendChild(nx);
      note.classList.add('on'); root.classList.add('td-2d');
    }
    self.kind = R ? R.kind : 'none';
    if (!R) { stage.innerHTML = '<p class="td-none">This page needs a browser that can draw on a canvas. The descriptions and measurements below give the same information.</p>'; return; }
    if (R.kind === 'webgl') canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); }, false);

    function colors() {
      var dk = isDark();
      return dk ? { bg: hex('#14211a'), sky: [0.44, 0.47, 0.52], gnd: [0.36, 0.33, 0.29], label: 'dark' } : { bg: hex('#e9efe9'), sky: [0.52, 0.55, 0.6], gnd: [0.44, 0.4, 0.34], label: 'light' };
    }
    function fit() {
      var r = stage.getBoundingClientRect(); dpr = M.min(R.kind === 'webgl' ? 2 : 1.5, G.devicePixelRatio || 1);
      if (R.kind === '2d') dpr = 1;
      W = M.max(100, r.width); H = M.max(100, r.height);
      var pw = M.round(W * dpr), ph = M.round(H * dpr);
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      dirty = true; kick();
    }
    function eye(c) { var cp = M.cos(c.pitch); return [c.t[0] + c.d * cp * M.sin(c.yaw), c.t[1] + c.d * M.sin(c.pitch), c.t[2] + c.d * cp * M.cos(c.yaw)]; }
    var FOV = 45 * PI / 180;
    function matrices() {
      var e = eye(cam), rad = scene ? scene.radius : 100;
      var near = M.max(0.05, cam.d * 0.02), far = cam.d + rad * 4;
      var P = persp(FOV, W / H, near, far), V = lookAt(e, cam.t, [0, 1, 0]);
      return { vp: mm(P, V), eye: e, near: near };
    }
    function stateList() {
      var list = [], e = eye(cam);
      scene.objects.forEach(function (o) {
        if (o.when && !o.when(vals)) return;
        var off = o.anim ? o.anim(vals).off || [0, 0, 0] : [0, 0, 0], a = 1;
        if (o.shell && xray) a = o.xa || 0.16;
        if (o.anim) { var an = o.anim(vals); if (an.alpha != null) a *= an.alpha; }
        if (o.alphaFix != null) a = o.alphaFix * (o.shell && xray ? 0.5 : 1);
        if (a <= 0.001) return;
        o.off = off; o.alpha = a; o.dist = M.hypot(o.c[0] + off[0] - e[0], o.c[1] + off[1] - e[1], o.c[2] + off[2] - e[2]);
        list.push(o);
      });
      return list;
    }
    function draw() {
      if (!scene) return;
      var mx = matrices(), C = colors(), rad = scene.radius;
      var S = { pw: canvas.width, ph: canvas.height, vp: mx.vp, eye: mx.eye, near: mx.near, sun: scene.sun || norm([0.45, 0.8, 0.35]), sky: C.sky, gnd: C.gnd, bg: C.bg, fogR: [cam.d + rad * 1.2, cam.d + rad * 5], isl: scene.island || [0, 0, 1e6, 2e6], xray: xray, list: stateList() };
      R.draw(S); lastList = S.list;
      placeLabels(mx.vp, mx.eye);
      hudUpdate(mx.vp);
    }
    function frame() {
      raf = 0; var now = performance.now();
      if (anim) {
        var t = M.min(1, (now - anim.t0) / anim.dur), k = ease(t), a = anim.from, b = anim.to;
        cam.t = lerpv(a.t, b.t, k); cam.yaw = a.yaw + wrapAng(b.yaw - a.yaw) * k; cam.pitch = lerp(a.pitch, b.pitch, k); cam.d = M.exp(lerp(M.log(a.d), M.log(b.d), k));
        if (t >= 1) anim = null; dirty = true;
      }
      if (sAnim) {
        var u = M.min(1, (now - sAnim.t0) / sAnim.dur); vals[sAnim.key] = lerp(sAnim.from, sAnim.to, ease(u)); if (u >= 1) sAnim = null; dirty = true; syncBar();
      }
      if (dirty) { dirty = false; draw(); }
      if (anim || sAnim) kick();
    }
    function kick() { if (!raf) raf = G.requestAnimationFrame(frame); }
    function redraw() { dirty = true; kick(); }
    self.redraw = redraw;
    function clampCam() {
      var m = cur; cam.pitch = M.max(m.minPitch != null ? m.minPitch : -0.15, M.min(1.5, cam.pitch)); cam.d = M.max(m.minD || 2, M.min(m.maxD || 5000, cam.d));
      var lim = m.panLimit || scene.radius * 1.5; cam.t[0] = M.max(-lim, M.min(lim, cam.t[0])); cam.t[2] = M.max(-lim, M.min(lim, cam.t[2])); cam.t[1] = M.max(m.minY != null ? m.minY : -60, M.min(m.maxY || 300, cam.t[1]));
    }
    function fitD(d) { var asp = W / H; return asp < 1.3 ? d * M.pow(1.3 / asp, 0.8) : d; } // narrow screens step back
    function goTo(v, instant) {
      var to = { t: v.t.slice(), yaw: v.yaw, pitch: v.pitch, d: M.min(cur.maxD || 1e9, fitD(v.d)) };
      if (instant || reduced) { anim = null; cam = to; redraw(); return; }
      anim = { from: { t: cam.t.slice(), yaw: cam.yaw, pitch: cam.pitch, d: cam.d }, to: to, t0: performance.now(), dur: 950 }; kick();
    }
    function zoom(k) { anim = null; cam.d *= k; clampCam(); redraw(); }
    function pan(dx, dy) { // screen pixels
      anim = null; var s = 2 * cam.d * M.tan(FOV / 2) / H, cy = M.cos(cam.yaw), sy = M.sin(cam.yaw), sp = M.sin(cam.pitch), cp = M.cos(cam.pitch);
      var right = [cy, 0, -sy], fwd = [-sy, 0, -cy];
      // drag right moves the scene right (target left); drag down moves the target forward on the ground
      cam.t = addv(cam.t, mul(right, -dx * s));
      if (cp > 0.25) cam.t = addv(cam.t, mul(fwd, dy * s / M.max(0.35, sp))); else cam.t[1] += dy * s;
      clampCam(); redraw();
    }
    function orbit(dx, dy) { anim = null; cam.yaw -= dx * 0.008; cam.pitch += dy * 0.006; clampCam(); redraw(); }
    self.reset = function () { stopIx = -1; tourShow(); goTo(cur.view); };

    /* ---------- labels */
    var labEls = [];
    function buildLabels() {
      labels.innerHTML = ''; labEls = [];
      (scene.labels || []).forEach(function (L, i) {
        var b = el('button', 'td-lab' + (L.x ? ' td-labx' : '') + (L.warn ? ' td-labw' : ''), '<span class="td-dot"></span><span class="td-ln"></span><span class="td-lt">' + esc(L.t) + '</span>', { type: 'button', 'aria-label': L.t + (L.note ? ': ' + L.note : '') });
        b.addEventListener('click', function () { say('<b>' + esc(L.t) + '</b>' + (L.note ? ': ' + esc(L.note) : '')); labEls.forEach(function (o) { o.b.classList.remove('on'); }); b.classList.add('on'); });
        labels.appendChild(b); labEls.push({ b: b, L: L });
      });
    }
    var lastList = [];
    function occluded(p, e) {
      var d = sub(p, e);
      for (var j = 0; j < lastList.length; j++) { var o = lastList[j]; if (o.alpha < 0.999 || o.noOcc || o.unlit) continue; if (rayHits(o, e, d, 0.97)) return true; }
      return false;
    }
    function placeLabels(vp, e) {
      var placed = [[W - 54, 0, W, tools.offsetHeight + 12], [0, H - 52, 180, H]];
      var items = labEls.map(function (o) {
        var L = o.L, vis = showLabels && (!L.x || xray) && (!L.when || L.when(vals)) && (!L.notX || !xray);
        var off = L.anim ? L.anim(vals) : [0, 0, 0], p = addv(L.p, off), c = xf(vp, p), dist = M.hypot(p[0] - e[0], p[1] - e[1], p[2] - e[2]);
        if (L.maxD && cam.d > L.maxD) vis = false; if (L.minD && cam.d < L.minD) vis = false;
        if (c[3] <= 0) vis = false;
        var sx = (c[0] / c[3] * 0.5 + 0.5) * W, sy = (0.5 - c[1] / c[3] * 0.5) * H;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) vis = false;
        var occ = vis && !L.noOcc && occluded(p, e);
        return { o: o, vis: vis, occ: occ, x: sx, y: sy, d: dist, pri: (L.pri || 0) - (occ ? 10 : 0) };
      });
      items.sort(function (a, b) { return (b.pri - a.pri) || (a.d - b.d); });
      items.forEach(function (it) {
        var b = it.o.b;
        if (!it.vis) { if (!b.hidden) b.hidden = true; return; }
        b.hidden = false;
        b.classList.toggle('td-occ', it.occ);
        if (it.occ) { b.style.transform = 'translate(' + M.round(it.x) + 'px,' + M.round(it.y) + 'px)'; return; }
        var o = it.o; if (!o.w) { var lt = b.lastChild; if (lt.offsetWidth) { o.w = lt.offsetWidth; o.h = lt.offsetHeight; } }
        var w = o.w || 90, h = o.h || 22, x = it.x, y = it.y, ok = true;
        var dx = M.min(0, W - 6 - (x - 7 + w)); if (x - 7 + dx < 4) dx = 4 - (x - 7);
        var box = function (lift) { return [x - 7 + dx, y - 7 - lift - h, x - 7 + dx + w, y - 7 - lift]; };
        var bx = box(0), tries = 0;
        while (tries < 4 && placed.some(function (q) { return !(bx[2] < q[0] || bx[0] > q[2] || bx[3] < q[1] || bx[1] > q[3]); })) { tries++; bx = box(tries * (h + 2)); }
        if (tries >= 4) ok = false;
        b.classList.toggle('td-collide', !ok);
        if (ok) placed.push(bx);
        b.style.transform = 'translate(' + M.round(x) + 'px,' + M.round(y) + 'px)';
        b.style.setProperty('--lift', (ok ? tries * (h + 2) : 0) + 'px');
        b.style.setProperty('--dx', M.round(dx) + 'px');
      });
    }
    function hudUpdate(vp) {
      needle.style.transform = 'rotate(' + (cam.yaw * 180 / PI).toFixed(1) + 'deg)';
      var ppm = (H / 2) / M.tan(FOV / 2) / cam.d, nice = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000], L = nice[0];
      for (var i = 0; i < nice.length; i++) if (nice[i] * ppm <= 110) L = nice[i];
      scaleBar.style.width = M.round(L * ppm) + 'px'; scaleTxt.textContent = (L >= 1000 ? L / 1000 + ' km' : L + ' m') + (cur && cur.scaleNote ? '' : '');
    }

    /* ---------- caption, tour, switches */
    function say(html) { tourCap.innerHTML = '<div class="td-capin">' + html + '</div>'; }
    function tourShow() {
      var n = cur.tour.length;
      tPrev.hidden = stopIx < 0;
      tNext.textContent = stopIx < 0 ? 'Start the tour ›' : stopIx >= n - 1 ? 'Back to the start ↺' : 'Next ›';
      if (stopIx < 0) say('<span class="td-k">' + esc(cur.title) + '</span> ' + cur.lead);
      else { var s = cur.tour[stopIx]; say('<span class="td-k">Stop ' + (stopIx + 1) + ' of ' + n + ' · ' + esc(s.title) + '</span> ' + s.text); }
    }
    function step(dir) {
      var n = cur.tour.length;
      if (dir > 0 && stopIx >= n - 1) { self.reset(); return; }
      stopIx = M.max(-1, M.min(n - 1, stopIx + dir));
      if (stopIx < 0) { self.reset(); return; }
      var s = cur.tour[stopIx];
      if (s.xray != null) setX(s.xray, true);
      if (s.set) for (var k in s.set) setVal(k, s.set[k]);
      if (s.labels != null) setLabels(s.labels);
      goTo(s.cam); tourShow();
    }
    function setLabels(on) { showLabels = on; bLab.setAttribute('aria-pressed', on ? 'true' : 'false'); root.classList.toggle('td-nolab', !on); redraw(); }
    function setX(on, quiet) { if (!cur.xray) on = false; xray = on; bX.setAttribute('aria-pressed', on ? 'true' : 'false'); redraw(); }
    function setVal(k, v) {
      var sw = (cur.switches || []).filter(function (s) { return s.id === k; })[0];
      if (sw && sw.type === 'range' && !reduced && vals[k] != null && vals[k] !== v) { sAnim = { key: k, from: vals[k], to: v, t0: performance.now(), dur: sw.dur || 2200 }; kick(); }
      else { vals[k] = v; redraw(); }
      syncBar();
    }
    var barCtl = {};
    function buildBar() {
      bar.innerHTML = ''; barCtl = {};
      (cur.switches || []).forEach(function (s) {
        var g = el('div', 'td-sw', '<span class="td-swl" id="td-sw-' + s.id + '">' + esc(s.label) + '</span>', { role: s.type === 'seg' ? 'group' : null });
        if (s.type === 'seg') {
          g.setAttribute('aria-labelledby', 'td-sw-' + s.id);
          var bs = s.options.map(function (o) { var b = el('button', 'td-seg', esc(o[1]), { type: 'button', 'aria-pressed': 'false' }); b.addEventListener('click', function () { setVal(s.id, o[0]); }); g.appendChild(b); return b; });
          barCtl[s.id] = function () { bs.forEach(function (b, i) { b.setAttribute('aria-pressed', vals[s.id] === s.options[i][0] ? 'true' : 'false'); }); };
        } else if (s.type === 'range') {
          var wrap = el('span', 'td-rng'), lo = el('span', 'td-rl', esc(s.ends[0])), hi = el('span', 'td-rl', esc(s.ends[1]));
          var r = el('input', null, null, { type: 'range', min: '0', max: '1', step: '0.01', 'aria-labelledby': 'td-sw-' + s.id, value: String(vals[s.id] || 0) });
          r.addEventListener('input', function () { sAnim = null; vals[s.id] = +r.value; syncBar(); redraw(); });
          var go = el('button', 'hs-btn td-play', '▶ ' + esc(s.play), { type: 'button' });
          go.addEventListener('click', function () { setVal(s.id, vals[s.id] > 0.5 ? 0 : 1); });
          wrap.appendChild(lo); wrap.appendChild(r); wrap.appendChild(hi); g.appendChild(wrap); g.appendChild(go);
          barCtl[s.id] = function () { if (+r.value !== vals[s.id]) r.value = vals[s.id]; go.innerHTML = vals[s.id] > 0.5 ? '◀ ' + esc(s.back) : '▶ ' + esc(s.play); if (s.readout) g.querySelector('.td-swl').textContent = s.label + ' ' + s.readout(vals[s.id]); };
        }
        bar.appendChild(g);
      });
      bar.hidden = !(cur.switches || []).length;
      syncBar();
    }
    function syncBar() { for (var k in barCtl) barCtl[k](); }

    /* ---------- opening a model */
    self.open = function (id, user) {
      var m = models.filter(function (x) { return x.id === id; })[0] || models[0];
      if (scene && cur === m) return;
      if (scene) scene.objects.forEach(function (o) { R.release(o); });
      cur = m; anim = null; sAnim = null; stopIx = -1; vals = {};
      (m.switches || []).forEach(function (s) { vals[s.id] = s.value; });
      var t0 = performance.now();
      scene = m.build(T);
      scene.objects.forEach(function (o) {
        var P = o.mesh.p, c = [0, 0, 0], n = P.length / 3 || 1; for (var i = 0; i < P.length; i += 3) { c[0] += P[i]; c[1] += P[i + 1]; c[2] += P[i + 2]; } o.c = [c[0] / n, c[1] / n, c[2] / n];
        o.edgeCol = o.edge ? hex(o.edge) : null; o.edgeAlpha = o.edgeAlpha == null ? 0.5 : o.edgeAlpha; o.off = [0, 0, 0]; o.alpha = 1;
        R.upload(o);
      });
      self.buildMs = performance.now() - t0;
      self.tris = scene.objects.reduce(function (s, o) { return s + o.mesh.p.length / 9; }, 0);
      picker.querySelectorAll('.td-pick').forEach(function (b) { var on = b.getAttribute('data-id') === m.id; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
      head.innerHTML = '<h2 class="td-title">' + esc(m.title) + '</h2><p class="td-sub">' + m.sub + '</p>';
      canvas.setAttribute('aria-label', '3-D model: ' + m.title + '. ' + m.alt + ' Use the arrow keys to turn it, plus and minus to zoom.');
      bX.hidden = !m.xray; xray = !!m.xrayDefault; bX.setAttribute('aria-pressed', xray ? 'true' : 'false');
      buildLabels(); buildBar(); tourShow();
      fit(); cam = { t: m.view.t.slice(), yaw: m.view.yaw, pitch: m.view.pitch, d: M.min(m.maxD || 1e9, fitD(m.view.d)) };
      document.querySelectorAll('.td-info').forEach(function (s) { s.hidden = s.getAttribute('data-model') !== m.id; });
      if (user) { try { history.replaceState(null, '', '#' + m.id); } catch (e) { } }
      if (opts.onOpen) opts.onOpen(m);
      fit(); redraw();
    };
    self.state = function () { return { id: cur.id, cam: JSON.parse(JSON.stringify(cam)), xray: xray, labels: showLabels, vals: JSON.parse(JSON.stringify(vals)), stop: stopIx, kind: R.kind, tris: self.tris, buildMs: self.buildMs }; };
    self.step = step; self.setX = setX; self.setLabels = setLabels; self.setVal = setVal;
    self.drawMs = function (n) { var t0 = performance.now(); for (var i = 0; i < (n || 10); i++) draw(); return (performance.now() - t0) / (n || 10); };

    /* ---------- input */
    var ptrs = {}, last = null, mode = null, pinch0 = null;
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    canvas.addEventListener('pointerdown', function (e) {
      canvas.focus({ preventScroll: true }); ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { }
      var ids = Object.keys(ptrs);
      if (ids.length === 1) { mode = (e.button === 2 || e.button === 1 || e.shiftKey || e.ctrlKey || e.metaKey) ? 'pan' : 'orbit'; last = { x: e.clientX, y: e.clientY }; }
      else if (ids.length === 2) { mode = 'pinch'; pinch0 = pinchInfo(); }
      root.classList.add('td-drag'); e.preventDefault();
    });
    function pinchInfo() { var p = Object.keys(ptrs).map(function (k) { return ptrs[k]; }); return { d: M.hypot(p[0].x - p[1].x, p[0].y - p[1].y), x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 }; }
    canvas.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (mode === 'pinch' && Object.keys(ptrs).length >= 2) { var p = pinchInfo(); if (pinch0.d > 10 && p.d > 10) { cam.d *= pinch0.d / p.d; } pan(p.x - pinch0.x, p.y - pinch0.y); pinch0 = p; clampCam(); return; }
      if (!last) return; var dx = e.clientX - last.x, dy = e.clientY - last.y; last = { x: e.clientX, y: e.clientY };
      if (mode === 'pan') pan(dx, dy); else orbit(dx, dy);
    });
    function up(e) { delete ptrs[e.pointerId]; var n = Object.keys(ptrs).length; if (n === 0) { mode = null; last = null; root.classList.remove('td-drag'); } else if (n === 1) { mode = 'orbit'; var k = Object.keys(ptrs)[0]; last = { x: ptrs[k].x, y: ptrs[k].y }; } }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up);
    canvas.addEventListener('wheel', function (e) { e.preventDefault(); var k = M.exp((e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * 0.0015); zoom(M.max(0.5, M.min(2, k))); }, { passive: false });
    root.addEventListener('keydown', function (e) {
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key, sh = e.shiftKey, hit = true;
      if (e.target !== canvas && /^(Enter| )$/.test(k)) return;
      if (k === 'ArrowLeft') sh ? pan(40, 0) : orbit(-30, 0);
      else if (k === 'ArrowRight') sh ? pan(-40, 0) : orbit(30, 0);
      else if (k === 'ArrowUp') sh ? pan(0, 40) : orbit(0, -20);
      else if (k === 'ArrowDown') sh ? pan(0, -40) : orbit(0, 20);
      else if (k === '+' || k === '=' || k === 'PageUp') zoom(0.8);
      else if (k === '-' || k === '_' || k === 'PageDown') zoom(1.25);
      else if (k === 'r' || k === 'R' || k === 'Home' || k === '0') self.reset();
      else if (k === 'l' || k === 'L') setLabels(!showLabels);
      else if ((k === 'x' || k === 'X') && cur.xray) setX(!xray);
      else if (k === 'n' || k === 'N' || k === ']') step(1);
      else if (k === 'p' || k === 'P' || k === '[') step(-1);
      else if ((k === 'f' || k === 'F') && bFull) bFull.click();
      else hit = false;
      if (hit) e.preventDefault();
    });
    try { new ResizeObserver(fit).observe(stage); } catch (e) { G.addEventListener('resize', fit); }
    try { new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { }
    document.addEventListener('fullscreenchange', function () { root.classList.toggle('td-fs', document.fullscreenElement === stage); fit(); });
    G.addEventListener('hashchange', function () { var id = location.hash.slice(1); if (models.some(function (m) { return m.id === id; })) { self.open(id); root.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); } });
  }
  T.Viewer = Viewer;
  T.init = function () {
    var root = document.getElementById('td-app'); if (!root || !T.models.length) return;
    var id = location.hash.slice(1), has = T.models.some(function (m) { return m.id === id; });
    var v = T.viewer = new Viewer(root, {});
    if (v.open) { v.open(has ? id : T.models[0].id); if (has) setTimeout(function () { root.scrollIntoView({ block: 'start' }); }, 0); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', T.init); else setTimeout(T.init, 0);
})(window);
