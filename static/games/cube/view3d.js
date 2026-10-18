/* Cube Solver: the 3-D cube on a canvas (TRBCube.View), written for this site.
   Draws every little cube (cubie) with its stickers, turns a layer smoothly for a move, shows an arrow for
   the move to make, and lets people drag to look around or tap a sticker to paint it.
   new View(canvas, {onPick(sticker), onKey(e)}) -> {setSize, setState, getState, animate, setArrow, setHighlight, resetView, flip, setPaintable, draw} */
(function (G) {
  'use strict';
  var NS = G.TRBCube;
  var STICKER = ['#f5f6f2', '#c8102e', '#009b48', '#ffd500', '#ff6a13', '#0051ba'];
  var UNPAINTED = '#4b5560', BODY = '#14171b';
  var AXES = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  // rotate v about unit axis n by angle a (right-hand rule)
  function rot(v, n, a) {
    var c = Math.cos(a), s = Math.sin(a), d = dot(n, v), x = cross(n, v);
    return [v[0] * c + x[0] * s + n[0] * d * (1 - c), v[1] * c + x[1] * s + n[1] * d * (1 - c), v[2] * c + x[2] * s + n[2] * d * (1 - c)];
  }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 'rgb(' + Math.round(Math.min(255, r * k)) + ',' + Math.round(Math.min(255, g * k)) + ',' + Math.round(Math.min(255, b * k)) + ')';
  }
  var reduced = false; try { reduced = G.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  function View(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d'), W = 300, H = 300, dpr = 1;
    var N = 3, M = NS.model(3), state = M.solved();
    var yaw = -0.6, pitch = 0.5, YAW0 = -0.6, PITCH0 = 0.5;
    var anim = null, arrow = null, highlight = {}, hits = [], paintable = true, raf = 0, focusSt = -1;
    var self = this;

    function fit() {
      var r = canvas.getBoundingClientRect(); dpr = Math.min(2, G.devicePixelRatio || 1);
      W = Math.max(50, r.width); H = Math.max(50, r.height);
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      draw();
    }
    // world -> view space
    function toView(p) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
      return [x, y * cp - z * sp, y * sp + z * cp];
    }
    function camDist() { return N * 5.2; }
    function proj(v) {
      var D = camDist(), f = Math.min(W, H) * 0.5 * D / (N * 2.05) * 0.93, k = f / (D - v[2]);
      return [W / 2 + v[0] * k, H / 2 - v[1] * k + H * 0.01];
    }
    function visible(nv, pv) { var D = camDist(); return nv[0] * (0 - pv[0]) + nv[1] * (0 - pv[1]) + nv[2] * (D - pv[2]) > 0; }
    function color(c) { return c >= 0 ? STICKER[c] : UNPAINTED; }

    function moveInfo(name) {
      var mv = M.moves[NS.moves.norm(name)]; if (!mv) return null;
      var n = M.NORM[mv.face], q = mv.q;
      return { n: n, layers: mv.layers, q: q, ang: -(q === 3 ? -1 : q) * Math.PI / 2, face: mv.face };
    }
    function layerOf(center, n) { return Math.round((N - 1 - dot(center, n)) / 2); }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      hits = [];
      var light = norm([-0.35, 0.65, 0.7]);
      var mi = null, t = 0;
      if (anim) { mi = anim.info; t = anim.p; }
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var groups = [[], [], []]; // far static, slab, near static
      var kmin = 99, kmax = -1;
      if (mi) mi.layers.forEach(function (k) { if (k < kmin) kmin = k; if (k > kmax) kmax = k; });
      var nView = mi ? toView(mi.n) : null, facingCam = nView ? nView[2] > 0 : false;
      M.cubies.forEach(function (cb) {
        var k = mi ? layerOf(cb.center, mi.n) : 0, g = 0;
        if (mi) { if (k >= kmin && k <= kmax) g = 1; else if (k < kmin) g = facingCam ? 2 : 0; else g = facingCam ? 0 : 2; }
        groups[g].push({ cb: cb, rotA: mi && g === 1 ? mi.ang * e : 0 });
      });
      groups.forEach(function (list) {
        list.forEach(function (it) { var c = it.rotA ? rot(it.cb.center, mi.n, it.rotA) : it.cb.center; it.depth = toView(c)[2]; });
        list.sort(function (a, b) { return a.depth - b.depth; });
        list.forEach(function (it) { drawCubie(it.cb, it.rotA, mi && mi.n, light); });
      });
      if (arrow && !anim) drawArrow(arrow);
      if (anim && arrow) drawArrow(arrow, 1 - e);
    }
    function drawCubie(cb, a, axis, light) {
      var c0 = cb.center;
      for (var ax = 0; ax < 3; ax++) for (var sg = -1; sg <= 1; sg += 2) {
        var n = [0, 0, 0]; n[ax] = sg;
        var u = AXES[(ax + 1) % 3], v = AXES[(ax + 2) % 3];
        var fc = add(c0, n, 1);
        var nr = a ? rot(n, axis, a) : n;
        var fcr = a ? rot(fc, axis, a) : fc;
        var nv = toView(nr), pv = toView(fcr);
        if (!visible(nv, pv)) continue;
        // is there a sticker on this side of the cubie?
        var st = -1;
        for (var i = 0; i < cb.st.length; i++) { var sn = M.nrm[cb.st[i]]; if (sn[0] === n[0] && sn[1] === n[1] && sn[2] === n[2]) st = cb.st[i]; }
        var quad = function (sz) {
          return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(function (o) {
            var p = add(add(fc, u, o[0] * sz), v, o[1] * sz);
            if (a) p = rot(p, axis, a);
            return proj(toView(p));
          });
        };
        var lit = 0.62 + 0.38 * Math.max(0, dot(norm(nv), light));
        poly(quad(1), BODY, null);
        if (st >= 0) {
          var q = quad(0.86);
          var col = color(state[st]);
          ctx.lineJoin = 'round';
          ctx.lineWidth = Math.max(1.5, Math.min(W, H) / (N * 60));
          poly(q, shade(col, lit), shade(col, lit));
          if (state[st] < 0) { var cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '600 ' + Math.max(9, Math.min(W, H) / (N * 9)) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', cx, cy); }
          if (highlight[st]) { ctx.lineWidth = 3.5; ctx.strokeStyle = '#ff4d6d'; ctx.setLineDash([5, 3]); outline(q); ctx.setLineDash([]); }
          if (st === focusSt) { ctx.lineWidth = 3; ctx.strokeStyle = '#63e6be'; outline(q); }
          hits.push({ st: st, q: q });
        }
      }
    }
    function poly(q, fill, stroke) {
      ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (var i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
    }
    function outline(q) { ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (var i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]); ctx.closePath(); ctx.stroke(); }

    function drawArrow(name, alpha) {
      var mi = moveInfo(name); if (!mi) return;
      alpha = alpha == null ? 1 : alpha;
      var n = mi.n, cw = mi.q !== 3, D = camDist();
      var fcView = toView([n[0] * N, n[1] * N, n[2] * N]), nV = toView(n);
      var vis = nV[0] * -fcView[0] + nV[1] * -fcView[1] + nV[2] * (D - fcView[2]);
      vis /= Math.hypot(-fcView[0], -fcView[1], D - fcView[2]);
      ctx.save(); ctx.globalAlpha = alpha;
      var all = mi.layers.length === N;
      if (vis > 0.18) {
        // curved arrow on the face itself
        var ax = n[0] ? 0 : n[1] ? 1 : 2, u = AXES[(ax + 1) % 3], v = AXES[(ax + 2) % 3];
        if (dot(cross(u, v), n) < 0) { var tmp = u; u = v; v = tmp; }
        var r = N * (all ? 0.78 : 0.6), sweep = (mi.q === 2 ? 1.75 : 0.95) * Math.PI * (cw ? -1 : 1), a0 = Math.PI * 0.75, pts = [];
        var depth = N + 0.08 + (all ? 0.02 : 0);
        for (var i = 0; i <= 28; i++) {
          var al = a0 + sweep * i / 28;
          var p = add(add([n[0] * depth, n[1] * depth, n[2] * depth], u, r * Math.cos(al)), v, r * Math.sin(al));
          pts.push(proj(toView(p)));
        }
        strokeArrow(pts, mi.q === 2 ? '2' : '');
      } else {
        // straight arrow on the most visible side next to the turning layer
        var best = null, bv = 0.15;
        for (var f = 0; f < 6; f++) {
          var g = M.NORM[f]; if (dot(g, n) !== 0) continue;
          var gc = toView([g[0] * N, g[1] * N, g[2] * N]), gV = toView(g);
          var vv = (gV[0] * -gc[0] + gV[1] * -gc[1] + gV[2] * (D - gc[2])) / Math.hypot(-gc[0], -gc[1], D - gc[2]);
          if (vv > bv) { bv = vv; best = g; }
        }
        if (best) {
          var w = cw ? [-n[0], -n[1], -n[2]] : n, dir = norm(cross(w, best));
          var kavg = mi.layers.reduce(function (s, k) { return s + k; }, 0) / mi.layers.length;
          var cn = (N - 1) - 2 * kavg, pts2 = [];
          for (var j = 0; j <= 10; j++) {
            var tt = -0.82 * N + 1.64 * N * j / 10;
            var p2 = add(add([best[0] * (N + 0.08), best[1] * (N + 0.08), best[2] * (N + 0.08)], n, cn), dir, tt);
            pts2.push(proj(toView(p2)));
          }
          strokeArrow(pts2, mi.q === 2 ? '2' : '');
        }
      }
      ctx.restore();
    }
    function strokeArrow(pts, label) {
      var L = pts.length, e = pts[L - 1], b = pts[L - 3], ang = Math.atan2(e[1] - b[1], e[0] - b[0]), s = Math.max(10, Math.min(W, H) / 26);
      function path() { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < L - 1; i++) ctx.lineTo(pts[i][0], pts[i][1]); }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      path(); ctx.strokeStyle = 'rgba(10,20,15,.85)'; ctx.lineWidth = s * 0.62; ctx.stroke();
      path(); ctx.strokeStyle = '#ffd479'; ctx.lineWidth = s * 0.34; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e[0] + Math.cos(ang) * s * 0.5, e[1] + Math.sin(ang) * s * 0.5);
      ctx.lineTo(e[0] + Math.cos(ang + 2.4) * s, e[1] + Math.sin(ang + 2.4) * s);
      ctx.lineTo(e[0] + Math.cos(ang - 2.4) * s, e[1] + Math.sin(ang - 2.4) * s);
      ctx.closePath(); ctx.fillStyle = '#ffd479'; ctx.strokeStyle = 'rgba(10,20,15,.85)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fill();
      if (label) {
        var m = pts[Math.floor(L / 2)];
        ctx.font = '700 ' + Math.round(s * 1.1) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(10,20,15,.9)'; ctx.strokeText('×2', m[0], m[1] - s * 0.9); ctx.fillStyle = '#ffd479'; ctx.fillText('×2', m[0], m[1] - s * 0.9);
      }
    }

    function frame(now) {
      raf = 0;
      if (anim) {
        if (!anim.t0) anim.t0 = now;
        anim.p = Math.min(1, (now - anim.t0) / anim.dur);
        if (anim.p >= 1) { var a = anim; anim = null; state = M.apply(state, a.name); draw(); if (a.done) a.done(); return; }
      }
      draw();
      if (anim) raf = G.requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = G.requestAnimationFrame(frame); }

    // pointer: drag to look around, tap to paint
    var down = null;
    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, yaw: yaw, pitch: pitch, drag: false, id: e.pointerId }; try { canvas.setPointerCapture(e.pointerId); } catch (er) { } });
    canvas.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.drag && Math.hypot(dx, dy) > 6) down.drag = true;
      if (down.drag) { yaw = down.yaw + dx * 0.009; pitch = Math.max(-1.45, Math.min(1.45, down.pitch + dy * 0.009)); kick(); }
    });
    function up(e) {
      if (!down) return;
      var d = down; down = null;
      if (!d.drag && paintable && opts.onPick) {
        var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        for (var i = hits.length - 1; i >= 0; i--) if (inside(x, y, hits[i].q)) { opts.onPick(hits[i].st); break; }
      }
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', function () { down = null; });
    function inside(x, y, q) {
      var c = false;
      for (var i = 0, j = q.length - 1; i < q.length; j = i++) if (((q[i][1] > y) !== (q[j][1] > y)) && (x < (q[j][0] - q[i][0]) * (y - q[i][1]) / (q[j][1] - q[i][1]) + q[i][0])) c = !c;
      return c;
    }
    canvas.addEventListener('keydown', function (e) {
      if (opts.onKey && opts.onKey(e) === true) { e.preventDefault(); return; }
      var k = e.key, used = true;
      if (k === 'ArrowLeft') yaw -= 0.15; else if (k === 'ArrowRight') yaw += 0.15;
      else if (k === 'ArrowUp') pitch = Math.max(-1.45, pitch - 0.15); else if (k === 'ArrowDown') pitch = Math.min(1.45, pitch + 0.15);
      else used = false;
      if (used) { e.preventDefault(); kick(); }
    });
    if ('ResizeObserver' in G) { try { new ResizeObserver(fit).observe(canvas); } catch (er) { } }
    G.addEventListener('resize', fit);

    this.setSize = function (n) { N = n; M = NS.model(n); state = M.solved(); anim = null; arrow = null; highlight = {}; kick(); };
    this.setState = function (s) { state = Int8Array.from(s); kick(); };
    this.getState = function () { return state; };
    this.animate = function (name, ms, done) {
      if (anim) { state = M.apply(state, anim.name); var d0 = anim.done; anim = null; if (d0) d0(); }
      var info = moveInfo(name);
      if (!info || reduced || ms <= 0) { state = M.apply(state, name); kick(); if (done) done(); return; }
      anim = { name: name, info: info, dur: ms, t0: 0, p: 0, done: done }; kick();
    };
    this.stop = function () { if (anim) { state = M.apply(state, anim.name); anim = null; kick(); } };
    this.busy = function () { return !!anim; };
    this.setArrow = function (name) { arrow = name || null; kick(); };
    this.setHighlight = function (list) { highlight = {}; (list || []).forEach(function (i) { highlight[i] = 1; }); kick(); };
    this.setFocus = function (i) { focusSt = i; kick(); };
    this.setPaintable = function (b) { paintable = b; };
    this.resetView = function () { yaw = YAW0; pitch = PITCH0; kick(); };
    this.flip = function () { yaw = yaw + Math.PI; pitch = -pitch; kick(); };
    this.view = function (y, p) { yaw = y; pitch = p; kick(); };
    this.draw = kick;
    this.fit = fit;
    fit();
    void self;
  }
  View.COLORS = STICKER; View.UNPAINTED = UNPAINTED;
  NS.View = View;
})(globalThis);
