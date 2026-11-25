/* Pyramid Explorer: the viewer. Draws the pyramids in model.js with WebGL: orbit and zoom, a see-through casing, a walk
   mode, labels, and the lists of spaces, patterns and candidates. Only surfaces are drawn, each facing one way, so the
   graphics card discards every face that points away from you. No outside libraries.
   Use: <div data-pyramid-explorer></div> after model.js and this file, or PyramidExplorer.mount(element). */
(function (G) {
  'use strict';
  var D = G.PX_DATA, M = Math, doc = G.document;
  if (!D || !doc) return;
  var CUBIT = D.CUBIT, PYR = D.pyramids;
  function f(x, d) { return (+x).toFixed(d == null ? 2 : d); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function el(tag, cls, html) { var e = doc.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------------------------------------------------------------- vectors and matrices (column-major) */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = M.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerpv(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function dist(a, b) { return M.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
  function persp(fov, asp, n, fr) { var t = 1 / M.tan(fov / 2), r = 1 / (n - fr); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (n + fr) * r, -1, 0, 0, 2 * n * fr * r, 0]; }
  function lookAt(e, c, u) { var z = norm(sub(e, c)), x = norm(cross(u, z)), y = cross(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]; }
  function mm(a, b) { var o = new Array(16), i, j, k, s; for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) { s = 0; for (k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
  function proj(m, p) { var x = p[0], y = p[1], z = p[2], w = m[3] * x + m[7] * y + m[11] * z + m[15]; return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, w]; }

  /* ---------------------------------------------------------------- geometry */
  function earclip(p) { // triangles (index triples) of a simple polygon
    var n = p.length, idx = [], i, area = 0, out = [], guard = 0;
    for (i = 0; i < n; i++) { idx.push(i); var q = p[(i + 1) % n]; area += p[i][0] * q[1] - q[0] * p[i][1]; }
    if (area < 0) idx.reverse();
    function cr(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    while (idx.length > 3 && guard++ < 4000) {
      var cut = false;
      for (i = 0; i < idx.length; i++) {
        var ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length], a = p[ia], b = p[ib], c = p[ic];
        if (cr(a, b, c) <= 1e-12) continue;
        var ok = true;
        for (var j = 0; j < idx.length && ok; j++) { var k = idx[j]; if (k === ia || k === ib || k === ic) continue; var t = p[k]; if (cr(a, b, t) >= -1e-12 && cr(b, c, t) >= -1e-12 && cr(c, a, t) >= -1e-12) ok = false; }
        if (ok) { out.push([ia, ib, ic]); idx.splice(i, 1); cut = true; break; }
      }
      if (!cut) idx.splice(0, 1);
    }
    if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
    return out;
  }
  // one prism: returns triangles facing into the space, doorway triangles facing out, edge lines and a bounding box
  function sweep(part) {
    var a = part.a, b = part.b, d = sub(b, a), hl = M.hypot(d[0], d[2]), u, v, along;
    if (hl > 1e-6) { u = [d[2] / hl, 0, -d[0] / hl]; v = [0, 1, 0]; along = [d[0] / hl, 0, d[2] / hl]; }
    else { u = [1, 0, 0]; v = [0, 0, 1]; along = norm(d); }
    var p = part.p, n = p.length, i, area = 0;
    for (i = 0; i < n; i++) { var q = p[(i + 1) % n]; area += p[i][0] * q[1] - q[0] * p[i][1]; }
    var ccw = area > 0, A = [], B = [], tris = [], door = [], edges = [];
    function pt(base, k) { return add(add(base, mul(u, p[k][0])), mul(v, p[k][1])); }
    for (i = 0; i < n; i++) { A.push(pt(a, i)); B.push(pt(b, i)); }
    function tri(arr, x, y, z, want) { if (dot(cross(sub(y, x), sub(z, x)), want) < 0) { var t = y; y = z; z = t; } arr.push(x, y, z); }
    for (i = 0; i < n; i++) {
      var j = (i + 1) % n, eu = p[j][0] - p[i][0], ev = p[j][1] - p[i][1];
      var inn = add(mul(u, ccw ? -ev : ev), mul(v, ccw ? eu : -eu));
      tri(tris, A[i], A[j], B[j], inn); tri(tris, A[i], B[j], B[i], inn);
      edges.push(A[i], B[i], A[i], A[j], B[i], B[j]);
    }
    var faces = earclip(p);
    [[A, part.ends[0], 1], [B, part.ends[1], -1]].forEach(function (e) {
      if (e[1] === 'open') return;
      var want = mul(along, e[2]);
      faces.forEach(function (fc) {
        if (e[1] === 'cap') tri(tris, e[0][fc[0]], e[0][fc[1]], e[0][fc[2]], want);
        else { var o = mul(along, -e[2] * 0.03); tri(door, add(e[0][fc[0]], o), add(e[0][fc[1]], o), add(e[0][fc[2]], o), mul(want, -1)); }
      });
    });
    var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    A.concat(B).forEach(function (q) { for (var k = 0; k < 3; k++) { lo[k] = M.min(lo[k], q[k] - 0.02); hi[k] = M.max(hi[k], q[k] + 0.02); } });
    return { tris: tris, door: door, edges: edges, lo: lo, hi: hi };
  }
  function dashes(edges, on, off) {
    var out = [], i;
    for (i = 0; i < edges.length; i += 2) {
      var a = edges[i], b = edges[i + 1], L = dist(a, b), t = 0;
      if (L < on) { out.push(a, b); continue; }
      while (t < L) { out.push(lerpv(a, b, t / L), lerpv(a, b, M.min(L, t + on) / L)); t += on + off; }
    }
    return out;
  }
  function shell(levels) { // outer casing: triangles facing outward, plus outline edges
    var tris = [], edges = [], i, k;
    function ring(L) { return [[-L.hx, L.y, -L.hz], [L.hx, L.y, -L.hz], [L.hx, L.y, L.hz], [-L.hx, L.y, L.hz]]; }
    var side = [[0, 0, -1], [1, 0, 0], [0, 0, 1], [-1, 0, 0]];
    function tri(x, y, z, want) { var nn = cross(sub(y, x), sub(z, x)); if (M.hypot(nn[0], nn[1], nn[2]) < 1e-9) return; if (dot(nn, want) < 0) { var t = y; y = z; z = t; } tris.push(x, y, z); }
    for (i = 0; i < levels.length - 1; i++) {
      var r0 = ring(levels[i]), r1 = ring(levels[i + 1]);
      for (k = 0; k < 4; k++) {
        var j = (k + 1) % 4, want = add(side[k], [0, 0.5, 0]);
        tri(r0[k], r0[j], r1[j], want); tri(r0[k], r1[j], r1[k], want);
        edges.push(r0[k], r1[k]);
        if (i === 0 || levels[i].y !== levels[i + 1].y) edges.push(r0[k], r0[j]);
        if (levels[i].y !== levels[i + 1].y && levels[i + 1].hx > 0.01) edges.push(r1[k], r1[j]);
      }
    }
    var top = levels[levels.length - 1];
    if (top.hx > 0.01) { var r = ring(top); tri(r[0], r[1], r[2], [0, 1, 0]); tri(r[0], r[2], r[3], [0, 1, 0]); }
    return { tris: tris, edges: edges };
  }

  var STONE = { lime: [0.82, 0.77, 0.64], granite: [0.69, 0.43, 0.38], rock: [0.58, 0.51, 0.42], rough: [0.64, 0.58, 0.47] };
  var VS = 'attribute vec3 aP;attribute vec3 aN;attribute vec4 aC;uniform mat4 uM;varying vec3 vP;varying vec3 vN;varying vec4 vC;void main(){vP=aP;vN=aN;vC=aC;gl_Position=uM*vec4(aP,1.0);}';
  var FS = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n' +
    'uniform vec3 uCam;uniform vec3 uSun;uniform vec3 uEmis;uniform float uAlpha;uniform float uBand;uniform float uLit;varying vec3 vP;varying vec3 vN;varying vec4 vC;' +
    'void main(){vec3 c=vC.rgb;float d=distance(uCam,vP);' +
    'if(uBand>0.0){float b=step(0.5,fract(vP.y/(2.0*uBand)));c*=1.0-0.07*b*clamp(1.0-d/300.0,0.0,1.0);}' +
    'if(uLit>0.5){vec3 n=normalize(vN);vec3 l=mix(vec3(0.47,0.41,0.35),vec3(1.0),0.5+0.5*n.y)*0.62+vec3(0.3)*max(dot(n,uSun),0.0)+vec3(0.32,0.28,0.22)*max(dot(n,normalize(uCam-vP)),0.0)/(1.0+d*d/500.0);c*=l;}' +
    'gl_FragColor=vec4(c+uEmis,vC.a*uAlpha);}';

  function mount(root, opts) {
    opts = opts || {};
    root.classList.add('px');
    root.innerHTML = '';
    var picker = el('div', 'px-picker'); picker.setAttribute('role', 'tablist'); picker.setAttribute('aria-label', 'Choose a pyramid');
    PYR.forEach(function (p) { var b = el('button', 'px-pick', '<b>' + esc(p.name) + '</b><span>' + esc(p.site) + '</span>'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('data-pyr', p.id); picker.appendChild(b); });
    var body = el('div', 'px-body'), stage = el('div', 'px-stage'), aside = el('div', 'px-aside');
    stage.innerHTML = '<canvas class="px-gl" tabindex="0" aria-label="3-D model. Drag to turn it, scroll to zoom."></canvas><div class="px-labels"></div>' +
      '<div class="px-nogl">This browser could not start WebGL, so the 3-D model cannot be drawn. The lists beside it still work.</div>' +
      '<div class="px-bar"><div class="px-grp px-seg" role="group" aria-label="Camera"><button type="button" data-mode="orbit" aria-pressed="true">Orbit</button><button type="button" data-mode="walk" aria-pressed="false">Walk</button></div>' +
      '<div class="px-grp"><label>Stone opacity <input class="px-opac" type="range" min="0" max="100" value="22" aria-label="Stone opacity"></label></div>' +
      '<div class="px-grp"><label><input class="px-tcand" type="checkbox" checked> Candidates</label><label><input class="px-tlab" type="checkbox" checked> Labels</label></div>' +
      '<button type="button" class="px-reset">Reset view</button></div>' +
      '<div class="px-help"></div><div class="px-hud"></div>' +
      '<div class="px-pad" aria-label="Walk controls"><button type="button" data-k="KeyW">Forward</button><button type="button" data-k="KeyE">Up</button><button type="button" data-k="KeyS">Back</button><button type="button" data-k="KeyQ">Down</button></div>';
    aside.innerHTML = '<div class="px-head"><h2 class="px-title"></h2><p class="px-sub"></p><p class="px-today"></p></div>' +
      '<div class="px-tabs" role="tablist"><button type="button" role="tab" data-tab="spaces" aria-selected="true">Known spaces</button><button type="button" role="tab" data-tab="patterns" aria-selected="false">Patterns</button><button type="button" role="tab" data-tab="cands" aria-selected="false">Candidates</button></div>' +
      '<div class="px-pane" data-pane="spaces"></div><div class="px-pane" data-pane="patterns" hidden></div><div class="px-pane" data-pane="cands" hidden></div>';
    body.appendChild(stage); body.appendChild(aside); root.appendChild(picker); root.appendChild(body);
    var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    var canvas = $('.px-gl'), labBox = $('.px-labels'), hudEl = $('.px-hud'), helpEl = $('.px-help'), opac = $('.px-opac'), tCand = $('.px-tcand'), tLab = $('.px-tlab');

    /* ---- side panel ---- */
    var cur = null, byId = {}, all = [], selected = null;
    function dots(n) { var s = ''; for (var i = 0; i < 5; i++) s += i < n ? '<i>●</i>' : '○'; return '<span class="px-dots" title="Support ' + n + ' of 5">' + s + '</span>'; }
    var TAG = { detected: 'detected', pattern: 'pattern', disputed: 'disputed claim' };
    function fillPanel(p) {
      $('.px-title').textContent = p.name;
      $('.px-sub').textContent = p.king + ' · ' + p.site + ' · ' + p.when;
      $('.px-today').textContent = p.today;
      $('[data-pane="spaces"]').innerHTML = '<p>Choose a space to go there. Only surfaces are modeled: the outer casing and the walls of each open space. The stone between them is left out.</p>' +
        p.spaces.map(function (s) { return '<button type="button" class="px-item" data-go="' + s.id + '"><span class="px-nm">' + esc(s.name) + '</span><span class="px-dm">' + esc(s.dims) + '</span><span class="px-nt">' + esc(s.note) + '</span></button>'; }).join('') +
        '<div class="px-unc"><b>Simplified or uncertain</b><ul>' + p.uncertain.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul></div><p class="px-src"><b>Measurements from:</b> ' + esc(p.sources) + '</p>';
      $('[data-pane="patterns"]').innerHTML = '<p>Each table compares a surveyed value with the simple number the builders seem to have aimed for. One royal cubit is 0.5236 m.</p>' +
        p.patterns().map(function (s, i) { return '<h3>' + (i + 1) + '. ' + esc(s.h) + '</h3>' + s.html; }).join('');
      $('[data-pane="cands"]').innerHTML = '<p>Spaces that may exist but have not been entered, ranked by how much supports them. Patterns say where it is reasonable to look. They do not show that a room is there.</p>' +
        '<div class="px-key"><span><span class="px-sw"></span>Detected by instruments</span><span><span class="px-sw p"></span>Suggested by pattern only</span>' + (p.cands.some(function (c) { return c.cls === 'disputed'; }) ? '<span><span class="px-sw d"></span>Disputed claim</span>' : '') + '</div>' +
        p.cands.map(function (c) { return '<button type="button" class="px-item" data-go="' + c.id + '"><span class="px-nm">' + c.id + ' ' + esc(c.name) + ' <span class="px-tag ' + c.cls + '">' + TAG[c.cls] + '</span> ' + dots(c.score) + '</span><span class="px-dm">' + esc(c.where) + '</span><span class="px-nt">' + esc(c.basis) + '</span></button>'; }).join('') +
        (p.candNote ? '<p class="px-note">' + esc(p.candNote) + '</p>' : '') + '<p class="px-note">Shapes and positions of candidates are illustrative.</p>';
      $$('.px-pane').forEach(function (e) { e.scrollTop = 0; });
    }
    $$('.px-tabs button').forEach(function (b) {
      b.addEventListener('click', function () { var t = b.getAttribute('data-tab'); $$('.px-tabs button').forEach(function (o) { o.setAttribute('aria-selected', o === b); }); $$('.px-pane').forEach(function (e) { e.hidden = e.getAttribute('data-pane') !== t; }); });
    });

    /* ---- WebGL ---- */
    var gl = null;
    try { gl = canvas.getContext('webgl', { antialias: true, alpha: false }) || canvas.getContext('experimental-webgl'); } catch (e) { gl = null; }
    var prog, loc = {}, batches = [], facing = [], labels = [], dirty = true;
    if (gl) {
      var sh = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) gl = null;
    }
    if (!gl) { root.classList.add('px-nowebgl'); }
    else {
      gl.useProgram(prog);
      ['aP', 'aN', 'aC'].forEach(function (n) { loc[n] = gl.getAttribLocation(prog, n); gl.enableVertexAttribArray(loc[n]); });
      ['uM', 'uCam', 'uSun', 'uEmis', 'uAlpha', 'uBand', 'uLit'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    var COL = {};
    function readColors() {
      var cs = G.getComputedStyle(root), cv = doc.createElement('canvas').getContext('2d');
      function col(name, fb) {
        var s = cs.getPropertyValue(name).trim() || fb; cv.fillStyle = '#000'; cv.fillStyle = s; var v = cv.fillStyle, m;
        if (v.charAt(0) === '#') { var n = parseInt(v.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
        m = v.match(/[\d.]+/g) || [0, 0, 0]; return [m[0] / 255, m[1] / 255, m[2] / 255];
      }
      COL = { sky: col('--px-sky', '#dfe7ea'), ground: col('--px-ground', '#c9b993'), line: col('--px-stoneline', '#3d4a50'), detected: col('--px-detected', '#a3660f'), pattern: col('--px-pattern', '#7d3a9c'), disputed: col('--px-disputed', '#6b7479'), casing: col('--px-casing', '#d9cba8') };
    }
    function batch(pts, color, o) { // pts: array of [x,y,z]; triangles (o.lines false) or line pairs
      o = o || {};
      var n = pts.length, buf = new Float32Array(n * 10), i, k = 0, nn = [0, 0, 0];
      for (i = 0; i < n; i++) {
        if (!o.lines && i % 3 === 0) nn = norm(cross(sub(pts[i + 1], pts[i]), sub(pts[i + 2], pts[i])));
        var p = pts[i]; buf[k++] = p[0]; buf[k++] = p[1]; buf[k++] = p[2]; buf[k++] = nn[0]; buf[k++] = nn[1]; buf[k++] = nn[2]; buf[k++] = color[0]; buf[k++] = color[1]; buf[k++] = color[2]; buf[k++] = color[3] == null ? 1 : color[3];
      }
      var vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
      var b = { vbo: vbo, n: n, lines: !!o.lines, lit: o.lines || o.unlit ? 0 : 1, band: o.band || 0, alpha: 1, blend: !!o.blend, cull: o.cull !== false, order: o.order || 0, emis: [0, 0, 0], group: o.group || '', vis: true };
      batches.push(b); return b;
    }
    function countFaces(pts) { for (var i = 0; i < pts.length; i += 3) { var nn = cross(sub(pts[i + 1], pts[i]), sub(pts[i + 2], pts[i])), c = mul(add(add(pts[i], pts[i + 1]), pts[i + 2]), 1 / 3); facing.push(c[0], c[1], c[2], nn[0], nn[1], nn[2]); } }
    var casingB = null, groundB = null, meshOf = {};
    function build(p) {
      batches.forEach(function (b) { gl.deleteBuffer(b.vbo); }); batches = []; facing = []; meshOf = {};
      var edgeAll = [];
      p.spaces.forEach(function (s) {
        var tris = [], door = [], thin = []; s.boxes = [];
        s.parts.forEach(function (part) { var r = sweep(part); tris = tris.concat(r.tris); door = door.concat(r.door); edgeAll = edgeAll.concat(r.edges); s.boxes.push([r.lo, r.hi]); if (s.thin) thin.push(add(part.a, [0, 0.1, 0]), add(part.b, [0, 0.1, 0])); });
        (s.solid || []).forEach(function (bx) { // a box seen from outside (sarcophagus)
          var lo = bx.min, hi = bx.max, c = mul(add(lo, hi), 0.5), q = function (i, j, k) { return [i ? hi[0] : lo[0], j ? hi[1] : lo[1], k ? hi[2] : lo[2]]; }, fs = [[[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]]], st = [];
          fs.forEach(function (fc) { var v = fc.map(function (t) { return q(t[0], t[1], t[2]); }), want = sub(mul(add(v[0], v[2]), 0.5), c); [[0, 1, 2], [0, 2, 3]].forEach(function (t) { var x = v[t[0]], y = v[t[1]], z = v[t[2]]; if (dot(cross(sub(y, x), sub(z, x)), want) < 0) { var w = y; y = z; z = w; } st.push(x, y, z); }); });
          batch(st, [0.42, 0.27, 0.24, 1], { group: 'known' }); countFaces(st);
        });
        meshOf[s.id] = batch(tris, STONE[s.stone].concat([1]), { group: 'known' }); countFaces(tris);
        if (door.length) { batch(door, [0.04, 0.05, 0.05, 1], { unlit: true, group: 'known' }); countFaces(door); }
        if (thin.length) batch(thin, STONE[s.stone].concat([1]), { lines: true, group: 'known' });
      });
      batch(edgeAll, COL.line.concat([0.6]), { lines: true, blend: true, group: 'known' });
      p.cands.forEach(function (c) {
        var tris = [], edges = [], col = COL[c.cls]; c.boxes = [];
        c.parts.forEach(function (part) { var r = sweep(part); tris = tris.concat(r.tris); edges = edges.concat(r.edges); c.boxes.push([r.lo, r.hi]); });
        batch(tris, col.concat([0.2]), { unlit: true, blend: true, cull: false, order: 2, group: 'cand' });
        batch(c.cls === 'detected' ? edges : dashes(edges, c.cls === 'pattern' ? 0.9 : 0.35, c.cls === 'pattern' ? 0.6 : 0.5), col.concat([1]), { lines: true, group: 'cand' });
      });
      var gs = M.max(700, p.levels[0].hx * 7), gq = [[-gs, -0.03, -gs], [-gs, -0.03, gs], [gs, -0.03, gs], [-gs, -0.03, -gs], [gs, -0.03, gs], [gs, -0.03, -gs]];
      groundB = batch(gq, COL.ground.concat([1]), { blend: true, order: 1, group: 'ground' }); countFaces(gq);
      var sl = shell(p.levels);
      casingB = batch(sl.tris, COL.casing.concat([1]), { blend: true, order: 3, band: p.band, group: 'casing' }); countFaces(sl.tris);
      batch(sl.edges, COL.line.concat([0.8]), { lines: true, blend: true, order: 4, group: 'outline' });
      batches.sort(function (a, b) { return a.order - b.order; });
    }

    /* ---- labels ---- */
    function buildLabels(p) {
      labBox.innerHTML = ''; labels = [];
      all.forEach(function (s) {
        var b = el('button', 'px-lab' + (s.cls ? ' ' + s.cls : '')); b.type = 'button';
        b.textContent = s.cls ? s.id + ' ' + s.name : (s.short || s.name);
        b.addEventListener('click', function () { go(s.id); });
        labBox.appendChild(b); labels.push({ el: b, s: s, at: s.view, cand: !!s.cls });
      });
    }

    /* ---- camera ---- */
    var mode = 'orbit', orb = { t: [0, 38, 0], az: 2.25, el: 0.2, dist: 400 }, walk = { p: [0, 20, -150], yaw: M.PI, pitch: 0 }, tween = null, MVP = null, camPos = [0, 0, 0];
    var reduce = false; try { reduce = G.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
    function home() { return { t: [0, cur.levels[cur.levels.length - 1].y * 0.26, 0], az: 2.25, el: 0.2, dist: cur.home }; }
    function offs() { return [M.cos(orb.el) * M.sin(orb.az), M.sin(orb.el), -M.cos(orb.el) * M.cos(orb.az)]; }
    function fwd() { return [M.sin(walk.yaw) * M.cos(walk.pitch), M.sin(walk.pitch), -M.cos(walk.yaw) * M.cos(walk.pitch)]; }
    function place() {
      var w = canvas.width || 1, h = canvas.height || 1, view, near;
      if (mode === 'orbit') { camPos = add(orb.t, mul(offs(), orb.dist)); view = lookAt(camPos, orb.t, [0, 1, 0]); near = M.max(0.05, M.min(20, orb.dist / 60)); }
      else { camPos = walk.p.slice(); view = lookAt(camPos, add(camPos, fwd()), [0, 1, 0]); near = 0.05; }
      MVP = mm(persp(55 * M.PI / 180, w / h, near, 6000), view);
    }
    function setMode(m) {
      if (m === mode) return;
      place();
      if (m === 'walk') { var o = offs(); walk.p = camPos.slice(); walk.yaw = M.atan2(-o[0], o[2]); walk.pitch = M.asin(-o[1]); }
      else { var fw = fwd(), dd = 30; orb.t = add(walk.p, mul(fw, dd)); orb.dist = dd; orb.el = M.asin(M.max(-1, M.min(1, -fw[1]))); orb.az = M.atan2(-fw[0], fw[2]); }
      mode = m; tween = null;
      $$('.px-seg button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m); });
      root.classList.toggle('px-walking', m === 'walk'); help(); dirty = true;
    }
    function help() {
      helpEl.innerHTML = mode === 'orbit'
        ? '<strong>Orbit.</strong> Drag to turn. Scroll or pinch to zoom. Right-drag or Shift-drag to slide the view. Lower the stone opacity to see inside.'
        : '<strong>Walk.</strong> Drag to look around. W A S D or the arrow keys to move, Q and E to sink and rise, Shift to go faster. There are no collisions, so you can pass through stone.';
    }
    function setOpacity(pct) {
      opac.value = pct; var o = pct / 100;
      if (casingB) { casingB.alpha = o; casingB.vis = o > 0.005; casingB.opaque = o > 0.985; }
      if (groundB) { groundB.alpha = M.max(o, 0.12); groundB.opaque = o > 0.985; }
      dirty = true;
    }
    function go(id) {
      var s = byId[id]; if (!s || !gl) return;
      if (s.cls && !tCand.checked) { tCand.checked = true; }
      if (selected && meshOf[selected]) meshOf[selected].emis = [0, 0, 0];
      selected = id; if (meshOf[id]) meshOf[id].emis = [0.06, 0.1, 0.16];
      $$('.px-item').forEach(function (b) { b.classList.toggle('sel', b.getAttribute('data-go') === id); });
      if (mode === 'orbit') { if (+opac.value > 30) setOpacity(22); fly({ t: s.view, dist: s.far ? 70 : 30 }); }
      else fly({ p: s.view, yaw: (s.look == null ? 180 : s.look) * M.PI / 180, pitch: 0 });
      if (G.matchMedia && G.matchMedia('(max-width: 820px)').matches && stage.scrollIntoView) stage.scrollIntoView({ block: 'nearest' });
    }
    function fly(to) {
      var from = mode === 'orbit' ? { t: orb.t.slice(), dist: orb.dist, az: orb.az, el: orb.el } : { p: walk.p.slice(), yaw: walk.yaw, pitch: walk.pitch };
      tween = { from: from, to: to, t0: G.performance.now(), dur: reduce ? 1 : 800 }; dirty = true;
    }
    function stepTween(now) {
      if (!tween) return;
      var k = M.min(1, (now - tween.t0) / tween.dur), e = k < 0.5 ? 2 * k * k : 1 - M.pow(-2 * k + 2, 2) / 2, F = tween.from, T = tween.to;
      if (mode === 'orbit') {
        if (T.t) orb.t = lerpv(F.t, T.t, e);
        if (T.dist != null) orb.dist = F.dist + (T.dist - F.dist) * e;
        if (T.az != null) orb.az = F.az + (T.az - F.az) * e;
        if (T.el != null) orb.el = F.el + (T.el - F.el) * e;
      } else {
        walk.p = lerpv(F.p, T.p, e);
        var dy = ((T.yaw - F.yaw + M.PI * 3) % (M.PI * 2)) - M.PI; walk.yaw = F.yaw + dy * e; walk.pitch = F.pitch + (T.pitch - F.pitch) * e;
      }
      if (k >= 1) tween = null; dirty = true;
    }

    /* ---- input ---- */
    var ptrs = {}, pinch = 0, keys = {};
    function clampD(d) { return M.max(1.5, M.min(2500, d)); }
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    canvas.addEventListener('pointerdown', function (e) { try { canvas.setPointerCapture(e.pointerId); } catch (x) { } ptrs[e.pointerId] = { x: e.clientX, y: e.clientY, b: e.button, sh: e.shiftKey }; pinch = 0; tween = null; try { canvas.focus({ preventScroll: true }); } catch (x) { } });
    ['pointerup', 'pointercancel'].forEach(function (ev) { canvas.addEventListener(ev, function (e) { delete ptrs[e.pointerId]; pinch = 0; }); });
    canvas.addEventListener('pointermove', function (e) {
      var p = ptrs[e.pointerId]; if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      var ids = Object.keys(ptrs);
      if (ids.length === 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = M.hypot(a.x - b.x, a.y - b.y);
        if (pinch && mode === 'orbit') orb.dist = clampD(orb.dist * pinch / d); else if (pinch) walk.p = add(walk.p, mul(fwd(), (d - pinch) * 0.05));
        pinch = d; dirty = true; return;
      }
      if (mode === 'orbit') {
        if (p.b === 2 || p.sh) { var sc = orb.dist * 0.0016, o = offs(), right = norm(cross([0, 1, 0], o)), up = cross(o, right); orb.t = add(add(orb.t, mul(right, -dx * sc)), mul(up, dy * sc)); }
        else { orb.az -= dx * 0.006; orb.el = M.max(-1.2, M.min(1.5, orb.el + dy * 0.006)); }
      } else { walk.yaw -= dx * 0.004; walk.pitch = M.max(-1.5, M.min(1.5, walk.pitch + dy * 0.004)); }
      dirty = true;
    });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault(); tween = null; var dl = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      if (mode === 'orbit') orb.dist = clampD(orb.dist * M.exp(dl * 0.0012)); else walk.p = add(walk.p, mul(fwd(), -dl * 0.02));
      dirty = true;
    }, { passive: false });
    function active() { var a = doc.activeElement; return a === canvas || (a && stage.contains(a)); }
    G.addEventListener('keydown', function (e) { if (!active()) return; var t = e.target.tagName; if (t === 'INPUT' && e.target.type !== 'range' && e.target.type !== 'checkbox') return; if (/^(Key[WASDQE]|Arrow|Shift)/.test(e.code)) { keys[e.code] = true; if (/^Arrow/.test(e.code) && e.target.type !== 'range') e.preventDefault(); } });
    G.addEventListener('keyup', function (e) { keys[e.code] = false; });
    G.addEventListener('blur', function () { keys = {}; });
    $$('.px-pad button').forEach(function (b) {
      var k = b.getAttribute('data-k');
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); keys[k] = true; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { keys[k] = false; }); });
    });
    function stepKeys(dt) {
      var on = function (a, b) { return (keys[a] || keys[b]) ? 1 : 0; };
      var fb = on('KeyW', 'ArrowUp') - on('KeyS', 'ArrowDown'), lr = on('KeyD', 'ArrowRight') - on('KeyA', 'ArrowLeft'), ud = (keys.KeyE ? 1 : 0) - (keys.KeyQ ? 1 : 0);
      if (!fb && !lr && !ud) return;
      tween = null; var sp = (keys.ShiftLeft || keys.ShiftRight ? 24 : 5) * dt;
      if (mode === 'walk') { walk.p = add(add(walk.p, mul(fwd(), fb * sp)), mul([M.cos(walk.yaw), 0, M.sin(walk.yaw)], lr * sp)); walk.p[1] += ud * sp; }
      else { orb.az -= lr * dt * 1.2; orb.el = M.max(-1.2, M.min(1.5, orb.el + ud * dt * 0.8)); orb.dist = clampD(orb.dist * M.exp(-fb * dt * 1.2)); }
      dirty = true;
    }
    $$('.px-seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-mode'), was = mode; setMode(m);
        if (m === 'walk' && was === 'orbit' && orb.dist > cur.home * 0.3) { var e0 = cur.spaces[0]; fly({ p: [e0.view[0], M.max(2, e0.view[1]), -(cur.levels[0].hz + 45)], yaw: M.PI, pitch: 0 }); }
      });
    });
    opac.addEventListener('input', function () { setOpacity(+opac.value); });
    tCand.addEventListener('change', function () { dirty = true; });
    tLab.addEventListener('change', function () { labBox.style.display = tLab.checked ? '' : 'none'; dirty = true; });
    $('.px-reset').addEventListener('click', function () { setMode('orbit'); setOpacity(22); fly(home()); });
    root.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-go]'); if (b) go(b.getAttribute('data-go')); });

    /* ---- frame ---- */
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      var dpr = M.min(G.devicePixelRatio || 1, 2); canvas.width = M.round(w * dpr); canvas.height = M.round(h * dpr); dirty = true;
    }
    function whereAmI(p) {
      for (var i = 0; i < all.length; i++) { var s = all[i]; if (s.cls && !tCand.checked) continue; for (var j = 0; j < s.boxes.length; j++) { var lo = s.boxes[j][0], hi = s.boxes[j][1]; if (p[0] >= lo[0] && p[0] <= hi[0] && p[1] >= lo[1] && p[1] <= hi[1] && p[2] >= lo[2] && p[2] <= hi[2]) return (s.cls ? 'candidate ' + s.id + ' ' : '') + s.name; } }
      if (p[1] < 0) return 'bedrock';
      var h = D.halfAt(cur.levels, p[1]); if (M.abs(p[0]) < h.hx && M.abs(p[2]) < h.hz) return 'solid masonry';
      return 'open air';
    }
    function hud() {
      var p = camPos, n = 0, i;
      for (i = 0; i < facing.length; i += 6) if ((p[0] - facing[i]) * facing[i + 3] + (p[1] - facing[i + 1]) * facing[i + 4] + (p[2] - facing[i + 2]) * facing[i + 5] > 0) n++;
      hudEl.innerHTML = 'You are in <b>' + esc(whereAmI(p)) + '</b><br>' + f(M.abs(p[0]), 1) + ' m ' + (p[0] >= 0 ? 'east' : 'west') + ', ' + f(M.abs(p[2]), 1) + ' m ' + (p[2] >= 0 ? 'south' : 'north') + ', ' + f(M.abs(p[1]), 1) + ' m ' + (p[1] >= 0 ? 'up' : 'down') + ' (' + f(M.abs(p[1]) / CUBIT, 0) + ' cubits)<br>Surfaces facing you: ' + n + ' of ' + facing.length / 6;
    }
    function placeLabels() {
      if (!tLab.checked) return;
      var w = stage.clientWidth, h = stage.clientHeight, used = [], i, j, edge = M.min(90, w * 0.2);
      var order = labels.slice().sort(function (a, b) { return dist(a.at, camPos) - dist(b.at, camPos); });
      for (i = 0; i < order.length; i++) {
        var L = order[i], show = !(L.cand && !tCand.checked);
        if (show) {
          var q = proj(MVP, L.at), x = (q[0] + 1) / 2 * w, y = (1 - q[1]) / 2 * h;
          show = q[2] > 0.3 && x > edge && x < w - edge && y > 70 && y < h - 20 && (mode === 'orbit' || dist(L.at, camPos) < 25);
          for (j = 0; show && j < used.length; j++) if (M.abs(used[j][0] - x) < 96 && M.abs(used[j][1] - y) < 20) show = false;
          if (show) { used.push([x, y]); L.el.style.left = x + 'px'; L.el.style.top = y + 'px'; }
        }
        L.el.style.display = show ? '' : 'none';
      }
    }
    function draw() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(COL.sky[0], COL.sky[1], COL.sky[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(loc.uM, false, new Float32Array(MVP)); gl.uniform3fv(loc.uCam, camPos); gl.uniform3fv(loc.uSun, norm([-0.45, 0.7, 0.55]));
      batches.forEach(function (b) {
        if (!b.vis || (b.group === 'cand' && !tCand.checked)) return;
        var blend = b.blend && !b.opaque;
        if (blend) { gl.enable(gl.BLEND); gl.depthMask(false); } else { gl.disable(gl.BLEND); gl.depthMask(true); }
        if (b.cull && !b.lines) { gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); } else gl.disable(gl.CULL_FACE);
        gl.bindBuffer(gl.ARRAY_BUFFER, b.vbo);
        gl.vertexAttribPointer(loc.aP, 3, gl.FLOAT, false, 40, 0); gl.vertexAttribPointer(loc.aN, 3, gl.FLOAT, false, 40, 12); gl.vertexAttribPointer(loc.aC, 4, gl.FLOAT, false, 40, 24);
        gl.uniform1f(loc.uAlpha, b.alpha); gl.uniform1f(loc.uBand, b.band); gl.uniform1f(loc.uLit, b.lit); gl.uniform3fv(loc.uEmis, b.emis);
        gl.drawArrays(b.lines ? gl.LINES : gl.TRIANGLES, 0, b.n);
      });
      gl.depthMask(true);
    }
    var last = 0;
    function frame(now) {
      G.requestAnimationFrame(frame);
      var dt = M.min(0.1, (now - last) / 1000); last = now;
      stepTween(now); stepKeys(dt);
      if (!dirty || !cur) return; dirty = false;
      place(); draw(); placeLabels(); hud();
    }

    /* ---- choosing a pyramid ---- */
    function show(id, quiet) {
      var p = null; PYR.forEach(function (q) { if (q.id === id) p = q; }); if (!p) p = PYR[0];
      cur = p; all = p.spaces.concat(p.cands); byId = {}; all.forEach(function (s) { byId[s.id] = s; }); selected = null;
      $$('.px-pick').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-pyr') === p.id); });
      fillPanel(p);
      if (gl) {
        readColors(); build(p); buildLabels(p);
        mode = 'walk'; setMode('orbit'); var h = home(); orb.t = h.t; orb.az = h.az; orb.el = h.el; orb.dist = h.dist; tween = null;
        setOpacity(+opac.value > 30 ? 22 : +opac.value); dirty = true;
      }
      if (!quiet) { try { G.history.replaceState(null, '', '#' + p.id); } catch (e) { try { G.location.hash = p.id; } catch (x) { } } }
    }
    picker.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-pyr]'); if (b) show(b.getAttribute('data-pyr')); });
    G.addEventListener('hashchange', function () { var h = (G.location.hash || '').slice(1); if (h && cur && h !== cur.id && PYR.some(function (q) { return q.id === h; })) show(h, true); });
    if (gl) {
      G.addEventListener('resize', resize);
      if (G.ResizeObserver) new G.ResizeObserver(resize).observe(stage);
      try { new G.MutationObserver(function () { readColors(); if (cur) { var o = +opac.value; build(cur); setOpacity(o); if (selected && meshOf[selected]) meshOf[selected].emis = [0.06, 0.1, 0.16]; } }).observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] }); } catch (e) { }
    }
    var first = (G.location.hash || '').slice(1) || opts.pyramid || root.getAttribute('data-pyramid') || 'khufu';
    show(first, true);
    if (gl) { help(); resize(); place(); hud(); G.requestAnimationFrame(frame); }
    return { show: show, go: go, setMode: setMode, setOpacity: setOpacity };
  }

  G.PyramidExplorer = { mount: mount };
  function auto() { Array.prototype.forEach.call(doc.querySelectorAll('[data-pyramid-explorer]'), function (r) { if (!r.__px) r.__px = mount(r); }); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', auto); else auto();
})(window);

/* Follow the site's light or dark setting: html[data-theme] is "dark", "light" or "auto" (the reader's system setting). */
(function () {
  var r = document.documentElement;
  function t() { var a = r.getAttribute('data-theme'), d = a === 'dark' || (a !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    Array.prototype.forEach.call(document.querySelectorAll('[data-pyramid-explorer]'), function (p) { p.classList.toggle('px-dark', !!d); }); }
  t(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', t);
  try { new MutationObserver(t).observe(r, { attributes: true, attributeFilter: ['data-theme'] }); window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { t(); r.classList.toggle('px-tick'); }); } catch (e) {}
})();
