/* Rocket Builder: design a rocket from parts, then fly it from the equator to orbit (or not). Physics in physics.js (RKPhys). */
(function (W, D) {
  'use strict';
  var P = W.RKPhys, L = W.TRBLab, $ = function (id) { return D.getElementById(id); };
  var root = $('rocket-lab'); if (!root || !P || !L) return;
  var RE = P.RE, DEG = P.DEG, OM = P.OMEGA;
  var view = $('rk-view'), cv = L.canvas($('rk-cv')), ctx = cv.c, store = L.store('rocket-cfg');
  var COL = { bg: '#06111a', ink: '#dbe7ef', muted: '#8fb3c6', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  var STC = [COL.gold, COL.green, COL.pink];
  var fmt = L.fmt, reduced = L.reduced;

  // ---------- presets ----------
  function S(type, engines, tanks) { return { type: type, engines: engines, tanks: tanks }; }
  var PRESETS = {
    orbiter: { name: 'Two-stage orbiter', d: { payload: 'sat', stages: [S('kerolox', 2, 10), S('hydrolox', 1, 2)] }, mode: 'auto' },
    sounding: { name: 'Sounding rocket', d: { payload: 'probe', stages: [S('solid', 1, 1)] }, mode: 'up' },
    heavy: { name: 'Too heavy', d: { payload: 'small', stages: [S('kerolox', 1, 12)] }, mode: 'up' },
    one: { name: 'One stage (same parts)', d: { payload: 'small', stages: [S('kerolox', 4, 18)] }, mode: 'auto' },
    two: { name: 'Two stages (same parts)', d: { payload: 'small', stages: [S('kerolox', 3, 14), S('kerolox', 1, 4)] }, mode: 'auto' },
    solid: { name: 'Solid first stage', d: { payload: 'sat', stages: [S('solid', 3, 4), S('hydrolox', 1, 4)] }, mode: 'auto' },
    escape: { name: 'Three stages', d: { payload: 'small', stages: [S('kerolox', 4, 20), S('kerolox', 1, 5), S('hydrolox', 1, 2)] }, mode: 'auto' }
  };
  var LIMITS = { engines: [1, 9], tanks: [1, 40], motors: [1, 6], segs: [1, 8] };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function validDesign(d) {
    try {
      if (!d || !P.PAYLOADS[d.payload] || !d.stages || !d.stages.length || d.stages.length > 3) return false;
      return d.stages.every(function (s) { return P.ENG[s.type] && s.engines >= 1 && s.engines <= 9 && s.tanks >= 1 && s.tanks <= 40; });
    } catch (e) { return false; }
  }
  var design = store.get('design', null); if (!validDesign(design)) design = clone(PRESETS.orbiter.d);
  var presetKey = store.get('preset', 'orbiter'); if (!PRESETS[presetKey] || JSON.stringify(PRESETS[presetKey].d) !== JSON.stringify(design)) presetKey = '';
  var set = { spin: store.get('spin', true), drag: store.get('drag', true), autoStage: store.get('autoStage', true), target: store.get('target', 250), mode: store.get('mode', 'auto'), pitch: 60, throttle: 100 };
  if (['auto', 'up', 'pro', 'man'].indexOf(set.mode) < 0) set.mode = 'auto';
  var A = P.analyze(design);

  // ---------- state ----------
  var F = null, phase = 'build', paused = false, warpI = 0, WARPS = [1, 2, 5, 10, 50, 100, 1000, 10000];
  var viewMode = 'chase', camB = 0, camBTarget = 0; // 0 = chase camera, 1 = map camera
  var trail = [], parts = [], splashes = [], stars = [], clouds = [], tNow = 0, lastHud = 0, msgTimer = 0, flightRec = null;
  var flags = {};
  (function () { var r = mulberry(7); for (var i = 0; i < 160; i++) stars.push([r(), r(), 0.3 + r() * 0.7, r() < 0.12]); for (i = 0; i < 26; i++) clouds.push({ off: (r() - 0.5) * 140000, h: 1500 + r() * 7000, w: 1500 + r() * 4000, k: r() }); })();
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- geometry of the stack (meters, y up from the bottom of the first stage's engine bells) ----------
  function geometry(An) {
    var g = { stages: [] }, y = 0, st = An.stages, n = st.length;
    for (var i = 0; i < n; i++) {
      var s = st[i], E = s.E, o = { i: i, s: s, D: s.D, y0: y };
      o.bellY0 = y; o.bellY1 = y + E.bell; y = o.bellY1;
      if (!s.solid) { o.skirtY0 = y; y += 1.0; o.skirtY1 = y; }
      o.tankY0 = y; y += s.len; o.tankY1 = y;
      if (i < n - 1) {
        // the interstage belongs to this stage and hides the next stage's engines, which start 0.4 m above this stage's tanks
        var up = st[i + 1]; o.isY0 = y; o.isY1 = y + 0.4 + up.E.bell + (up.solid ? 0 : 1.0); o.isD1 = up.D; o.y1 = o.isY1; y += 0.4;
      } else o.y1 = y;
      g.stages.push(o);
    }
    var pl = An.payload; g.plY0 = g.stages[n - 1].tankY1 + 0.4; g.plD = pl.D; g.plLen = pl.len; g.top = g.plY0 + pl.len;
    return g;
  }
  var G = geometry(A);

  // ---------- drawing helpers ----------
  function cylGrad(c, x0, x1, base, hi) {
    var gr = c.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, shade(base, -0.45)); gr.addColorStop(0.32, hi || shade(base, 0.25)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(base, -0.55));
    return gr;
  }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    function f(v) { return Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); }
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  }
  var BODY = { kerolox: '#e9eef2', hydrolox: '#d9894a', solid: '#eef0ee' };
  // the rocket, in local units (meters, y up), from stage k upward; flame: {on, p (ambient pressure ratio), thr}
  function drawRocket(c, g, k, fl, time) {
    var i, o, s;
    // flames first (they sit under the bells)
    if (fl && fl.on) {
      o = g.stages[k]; s = o.s;
      // the engines' plumes merge into one, about as wide as the stage
      flame(c, 0, o.bellY0, Math.max(s.E.bellD, o.D * 0.72), s.type, fl, time);
    }
    for (i = g.stages.length - 1; i >= k; i--) {
      o = g.stages[i]; s = o.s;
      var D2 = o.D / 2, col = BODY[s.type], band = STC[i % 3];
      // engines / nozzles
      var nb2 = s.solid ? Math.min(s.engines, 3) : Math.min(s.engines, 5), bw2 = s.solid ? o.D / nb2 * 0.55 : Math.min(s.E.bellD, o.D / nb2 * 0.92);
      for (var j = 0; j < nb2; j++) {
        var bx = (j - (nb2 - 1) / 2) * (o.D / nb2) * (nb2 > 1 ? 0.98 : 0), t0 = o.bellY1, t1 = o.bellY0;
        c.beginPath(); c.moveTo(bx - bw2 * 0.22, -t0); c.lineTo(bx + bw2 * 0.22, -t0); c.lineTo(bx + bw2 / 2, -t1); c.lineTo(bx - bw2 / 2, -t1); c.closePath();
        c.fillStyle = cylGrad(c, bx - bw2 / 2, bx + bw2 / 2, '#7d8a94', '#c9d3da'); c.fill();
      }
      if (o.skirtY0 !== undefined) { c.fillStyle = cylGrad(c, -D2, D2, '#59646d'); c.fillRect(-D2 * 0.96, -o.skirtY1, D2 * 1.92, o.skirtY1 - o.skirtY0); }
      // tanks or motor casings
      if (s.solid) {
        var nm = Math.min(s.engines, 3), mw = o.D / nm * (nm > 1 ? 1.02 : 1);
        for (j = 0; j < nm; j++) {
          var mx = (j - (nm - 1) / 2) * (o.D / nm) * (nm > 1 ? 0.98 : 0);
          c.fillStyle = cylGrad(c, mx - mw / 2, mx + mw / 2, col); roundRect(c, mx - mw / 2, -o.tankY1, mw, o.tankY1 - o.tankY0, Math.min(mw * 0.35, 1.2)); c.fill();
          c.strokeStyle = 'rgba(40,50,60,.45)'; c.lineWidth = Math.max(0.06, mw * 0.02);
          for (var sg = 1; sg < s.tanks; sg++) { var yy = o.tankY0 + (o.tankY1 - o.tankY0) * sg / s.tanks; c.beginPath(); c.moveTo(mx - mw / 2, -yy); c.lineTo(mx + mw / 2, -yy); c.stroke(); }
          c.fillStyle = band; c.globalAlpha = 0.9; c.fillRect(mx - mw / 2, -(o.tankY0 + 0.6), mw, 0.35); c.globalAlpha = 1;
        }
      } else {
        c.fillStyle = cylGrad(c, -D2, D2, col); c.fillRect(-D2, -o.tankY1, o.D, o.tankY1 - o.tankY0);
        // a band in the stage color and a seam between the two propellant tanks
        c.fillStyle = band; c.fillRect(-D2, -(o.tankY0 + 0.25 + 0.4), o.D, 0.4);
        c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-D2, -(o.tankY0 + (o.tankY1 - o.tankY0) * 0.42), o.D, Math.max(0.08, o.D * 0.03));
        if (s.type === 'hydrolox') { c.fillStyle = 'rgba(255,255,255,.08)'; for (var q = o.tankY0 + 1; q < o.tankY1; q += 1.6) c.fillRect(-D2, -q, o.D, 0.05); }
      }
      // interstage (belongs to this stage; it hides the next stage's engines)
      if (o.isY0 !== undefined) {
        var a2 = o.isD1 / 2;
        c.beginPath(); c.moveTo(-D2, -o.isY0); c.lineTo(D2, -o.isY0); c.lineTo(a2, -o.isY1); c.lineTo(-a2, -o.isY1); c.closePath();
        c.fillStyle = cylGrad(c, -Math.max(D2, a2), Math.max(D2, a2), '#3e4a54'); c.fill();
      }
    }
    // payload fairing: a cylinder and an ogive nose
    var pd = g.plD / 2, topD = g.stages[g.stages.length - 1].D / 2, y0 = g.plY0, ycyl = y0 + g.plLen * 0.5, ytop = y0 + g.plLen;
    c.beginPath(); c.moveTo(-topD, -(y0 - 0.4)); c.lineTo(topD, -(y0 - 0.4));
    c.lineTo(pd, -(y0 + Math.abs(pd - topD) * 0.8)); c.lineTo(pd, -ycyl); c.quadraticCurveTo(pd, -(ycyl + (ytop - ycyl) * 0.75), 0, -ytop);
    c.quadraticCurveTo(-pd, -(ycyl + (ytop - ycyl) * 0.75), -pd, -ycyl); c.lineTo(-pd, -(y0 + Math.abs(pd - topD) * 0.8)); c.closePath();
    c.fillStyle = cylGrad(c, -pd, pd, '#f4f6f8'); c.fill();
    c.fillStyle = COL.gold; c.beginPath(); c.arc(0, -(ytop - g.plLen * 0.06), Math.max(0.12, pd * 0.12), 0, 6.283); c.fill();
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // one engine's flame, local units; it grows longer and wider as the air thins
  function flame(c, x, y, bw, type, fl, time) {
    var vac = 1 - fl.p, thr = Math.max(0.15, fl.thr), len = bw * (9 + 12 * vac) * (0.45 + 0.55 * thr), wid = bw * (1.3 + 3 * vac);
    var fk = reduced ? 1 : 0.94 + 0.12 * Math.sin(time * 37) * Math.sin(time * 23.3);
    len *= fk;
    var cols = type === 'kerolox' ? ['rgba(255,247,214,1)', 'rgba(255,176,72,.95)', 'rgba(255,96,40,0)'] : type === 'hydrolox' ? ['rgba(236,242,255,.95)', 'rgba(160,180,255,.5)', 'rgba(130,110,255,0)'] : ['rgba(255,255,236,1)', 'rgba(255,206,110,.95)', 'rgba(255,130,50,0)'];
    c.save();
    // a soft glow around the nozzle
    c.globalCompositeOperation = 'lighter';
    var gl = c.createRadialGradient(x, -y + len * 0.12, 0, x, -y + len * 0.12, len * 0.5);
    gl.addColorStop(0, type === 'hydrolox' ? 'rgba(170,190,255,.22)' : 'rgba(255,180,80,.3)'); gl.addColorStop(1, 'rgba(255,150,60,0)');
    c.fillStyle = gl; c.beginPath(); c.arc(x, -y + len * 0.12, len * 0.5, 0, 6.283); c.fill();
    c.globalCompositeOperation = 'source-over';
    // the plume, then its bright core
    var gr = c.createLinearGradient(0, -y, 0, -y + len);
    gr.addColorStop(0, cols[0]); gr.addColorStop(0.3, cols[1]); gr.addColorStop(1, cols[2]);
    c.fillStyle = gr; c.beginPath(); c.moveTo(x - bw * 0.42, -y); c.quadraticCurveTo(x - wid * 0.62, -y + len * 0.35, x, -y + len); c.quadraticCurveTo(x + wid * 0.62, -y + len * 0.35, x + bw * 0.42, -y); c.closePath(); c.fill();
    var gc = c.createLinearGradient(0, -y, 0, -y + len * 0.45); gc.addColorStop(0, 'rgba(255,255,250,.95)'); gc.addColorStop(1, 'rgba(255,255,240,0)');
    c.fillStyle = gc; c.beginPath(); c.moveTo(x - bw * 0.3, -y); c.quadraticCurveTo(x - bw * 0.32, -y + len * 0.2, x, -y + len * 0.45); c.quadraticCurveTo(x + bw * 0.32, -y + len * 0.2, x + bw * 0.3, -y); c.closePath(); c.fill();
    // shock diamonds in thick air
    if (fl.p > 0.25) {
      c.fillStyle = type === 'hydrolox' ? 'rgba(255,240,255,.6)' : 'rgba(255,255,230,.7)';
      for (var k = 1; k <= 4; k++) { var dy = k * bw * 1.1; if (dy > len * 0.7) break; c.beginPath(); c.ellipse(x, -y + dy, bw * 0.15 * (1 - k * 0.12), bw * 0.24, 0, 0, 6.283); c.fill(); }
    }
    c.restore();
  }

  // ---------- camera ----------
  var cam = { cx: 0, cy: RE, ax: 0, ay: 0, s: 1, up: Math.PI / 2 };
  function w2s(X, Y, cm) { cm = cm || cam; var dx = X - cm.cx, dy = Y - cm.cy, a = Math.PI / 2 - cm.up, ca = Math.cos(a), sa = Math.sin(a); return [cm.ax + (dx * ca - dy * sa) * cm.s, cm.ay - (dx * sa + dy * ca) * cm.s]; }
  function d2s(dx, dy, cm) { cm = cm || cam; var a = Math.PI / 2 - cm.up, ca = Math.cos(a), sa = Math.sin(a); return [dx * ca - dy * sa, -(dx * sa + dy * ca)]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function angLerp(a, b, t) { var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; }
  function siteAngle(t) { return Math.PI / 2 - (set.spin ? OM * t : 0); }
  function earthRot(t) { return set.spin ? -OM * t : 0; } // how far Earth has turned (radians, clockwise negative)
  function rotP(x, y, a) { var c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }

  function stackHeight() { var k = F ? F.st : 0; return G.top - G.stages[k].y0; }
  function chaseCam(px, py, h) {
    // close up at liftoff; the view widens slowly at first, then fast enough to bring the horizon back by about 30 km up
    var Lh = stackHeight(), b = phase === 'build', k = b ? 1.85 : 2.6, x = Math.min(1, Math.max(0, h) / 30000), Vh = Lh * k + 2.6 * Math.max(0, h) * x * x * (3 - 2 * x);
    return { cx: px, cy: py, ax: cv.w * (b ? (cv.w < 560 ? 0.5 : 0.42) : 0.5), ay: cv.h * (b ? 0.86 : 0.55 + 0.25 * Math.exp(-Math.max(0, h) / (2 * Lh))), s: cv.h / Vh, up: Math.atan2(py, px) };
  }
  function mapCam() {
    var span = RE * 1.25;
    if (F) {
      var r = Math.hypot(F.x, F.y), el = F.elements(); span = Math.max(span, r * 1.18);
      if (el.bound && el.ra < 30 * RE && el.rp > RE * 0.5) span = Math.max(span, el.ra * 1.12);
    }
    mapSpan = mapSpan ? mapSpan + (span - mapSpan) * 0.08 : span;
    return { cx: 0, cy: 0, ax: cv.w / 2, ay: cv.h * 0.56, s: Math.min(cv.w, cv.h) * 0.42 / mapSpan, up: Math.PI / 2 };
  }
  var mapSpan = 0;

  // ---------- sky and ground ----------
  function skyCol(h) {
    var stops = [[0, [86, 160, 214]], [8000, [52, 116, 186]], [20000, [22, 58, 112]], [40000, [10, 28, 52]], [70000, [6, 17, 26]]];
    if (h <= 0) return stops[0][1];
    for (var i = 1; i < stops.length; i++) if (h < stops[i][0]) { var t = (h - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]); return stops[i - 1][1].map(function (v, k) { return Math.round(lerp(v, stops[i][1][k], t)); }); }
    return stops[stops.length - 1][1];
  }
  function rgb(a, al) { return al === undefined ? 'rgb(' + a.join(',') + ')' : 'rgba(' + a.join(',') + ',' + al + ')'; }

  function drawBackground(hCam, dark) {
    var w = cv.w, h = cv.h, top = skyCol(hCam + cam.ay / cam.s + 6000), bot = skyCol(Math.max(0, hCam - (h - cam.ay) / cam.s));
    if (camB > 0.5) { ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, w, h); }
    else {
      var gr = ctx.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, rgb(top)); gr.addColorStop(1, rgb(bot));
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    }
    // stars when the sky is dark
    var darkness = camB > 0.5 ? 1 : Math.min(1, Math.max(0, (hCam - 18000) / 40000));
    if (darkness > 0.02) {
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], tw = reduced ? 1 : 0.75 + 0.25 * Math.sin(tNow * (1 + s[2] * 2) + i);
        ctx.fillStyle = 'rgba(219,231,239,' + (darkness * s[2] * tw * 0.8).toFixed(3) + ')';
        var r = s[3] ? 1.3 : 0.8; ctx.fillRect(s[0] * w, s[1] * h, r, r);
      }
    }
  }
  // Earth as seen by the camera: a big disc (drawn as a polygon when it is huge on screen), its air glow, and spin marks
  function drawEarth(time) {
    var cs = w2s(0, 0), Rpx = RE * cam.s, w = cv.w, h = cv.h;
    var big = Rpx > 30000, pts = [];
    function path() {
      ctx.beginPath();
      if (!big) { ctx.arc(cs[0], cs[1], Rpx, 0, 6.283); return; }
      // angular window around the point of Earth nearest the screen centre
      // a band from the surface down to well below the bottom of the screen (no far-away points: they upset the rasterizer)
      var cw = cam.cx, ch = cam.cy, a0 = Math.atan2(ch, cw), diag = Math.hypot(w, h) / cam.s, span = Math.min(Math.PI, diag / RE * 1.2 + 0.002), N = 96, Rin = Math.max(0, RE - diag * 1.5);
      for (var i = 0; i <= N; i++) { var a = a0 - span + 2 * span * i / N, p = w2s(RE * Math.cos(a), RE * Math.sin(a)); pts.push(p); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
      for (i = N; i >= 0; i -= 8) { a = a0 - span + 2 * span * i / N; p = w2s(Rin * Math.cos(a), Rin * Math.sin(a)); ctx.lineTo(p[0], p[1]); }
      ctx.closePath();
    }
    // the glow of the air: a soft band about 100 km thick
    var glowW = Math.max(6, 60000 * cam.s);
    if (!big) {
      var g2 = ctx.createRadialGradient(cs[0], cs[1], Rpx, cs[0], cs[1], Rpx + glowW);
      g2.addColorStop(0, 'rgba(116,192,252,.55)'); g2.addColorStop(0.4, 'rgba(116,192,252,.18)'); g2.addColorStop(1, 'rgba(116,192,252,0)');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cs[0], cs[1], Rpx + glowW, 0, 6.283); ctx.fill();
    }
    path();
    if (big) {
      // seen from close up: ocean near the launch site, a coast with land to the west
      ctx.fillStyle = '#1d4f6e'; ctx.fill();
    } else {
      var g = ctx.createRadialGradient(cs[0] - Rpx * 0.3, cs[1] - Rpx * 0.3, Rpx * 0.1, cs[0], cs[1], Rpx);
      g.addColorStop(0, '#2f78a8'); g.addColorStop(0.7, '#1b4f7a'); g.addColorStop(1, '#0f3150'); ctx.fillStyle = g; ctx.fill();
      // night side, and ticks every 15 degrees that turn with Earth
      ctx.save(); ctx.clip();
      var ng = ctx.createLinearGradient(cs[0] - Rpx, cs[1], cs[0] + Rpx, cs[1]); ng.addColorStop(0, 'rgba(0,0,0,0)'); ng.addColorStop(0.55, 'rgba(0,0,0,0)'); ng.addColorStop(1, 'rgba(2,8,14,.55)');
      ctx.fillStyle = ng; ctx.fillRect(cs[0] - Rpx, cs[1] - Rpx, 2 * Rpx, 2 * Rpx);
      ctx.strokeStyle = 'rgba(219,231,239,.22)'; ctx.lineWidth = 1.2;
      var rot = earthRot(time);
      for (var k = 0; k < 24; k++) { var a = rot + k * Math.PI / 12 + Math.PI / 2, f = k % 6 ? 0.96 : 0.92, p1 = w2s(RE * f * Math.cos(a), RE * f * Math.sin(a)), p2 = w2s(RE * 0.995 * Math.cos(a), RE * 0.995 * Math.sin(a)); ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = 'rgba(116,192,252,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cs[0], cs[1], Rpx, 0, 6.283); ctx.stroke();
    }
    if (big) {
      // land west of the launch site (a strip of coast), drawn on the ground surface
      var sa = siteAngle(time), landA0 = sa - 1500 / RE, landA1 = sa + 400000 / RE;
      ctx.beginPath(); var first = true;
      for (var i2 = 0; i2 <= 40; i2++) { var aa = landA0 + (landA1 - landA0) * i2 / 40, pp = w2s(RE * Math.cos(aa), RE * Math.sin(aa)); if (first) { ctx.moveTo(pp[0], pp[1]); first = false; } else ctx.lineTo(pp[0], pp[1]); }
      for (i2 = 40; i2 >= 0; i2--) { aa = landA0 + (landA1 - landA0) * i2 / 40; pp = w2s((RE - 3000) * Math.cos(aa), (RE - 3000) * Math.sin(aa)); ctx.lineTo(pp[0], pp[1]); }
      ctx.closePath(); ctx.fillStyle = '#2c5a3a'; ctx.fill();
      // the glow of the air along the horizon
      var hc = Math.hypot(cam.cx, cam.cy) - RE, ga = Math.min(1, Math.max(0, (hc - 3000) / 30000));
      if (pts.length && ga > 0) {
        ctx.save(); ctx.lineJoin = 'round'; ctx.globalAlpha = ga;
        var lw = Math.min(80, Math.max(4, 30000 * cam.s));
        for (var pass = 0; pass < 3; pass++) {
          ctx.strokeStyle = 'rgba(150,205,250,' + [0.10, 0.16, 0.3][pass] + ')'; ctx.lineWidth = lw * [2, 1, 0.35][pass];
          ctx.beginPath(); pts.forEach(function (p, j) { if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
  function drawClouds(time) {
    if (cam.s < 0.004) return; // too far away to see single clouds
    var sa = siteAngle(time);
    clouds.forEach(function (cl) {
      var a = sa + cl.off / RE, r = RE + cl.h, p = w2s(r * Math.cos(a), r * Math.sin(a)), w = cl.w * cam.s, hh = w * 0.22;
      if (p[0] < -w || p[0] > cv.w + w || p[1] < -hh * 3 || p[1] > cv.h + hh * 3 || w < 3) return;
      var up = d2s(Math.cos(a), Math.sin(a)), ang = Math.atan2(up[0], -up[1]);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); ctx.fillStyle = 'rgba(240,246,250,' + ((0.55 + 0.25 * cl.k) * Math.min(1, 1.2 * cv.w / w)).toFixed(3) + ')';
      ctx.beginPath(); ctx.ellipse(0, 0, w / 2, hh, 0, 0, 6.283); ctx.ellipse(-w * 0.18, -hh * 0.7, w * 0.22, hh * 0.9, 0, 0, 6.283); ctx.ellipse(w * 0.12, -hh * 0.8, w * 0.18, hh, 0, 0, 6.283); ctx.fill();
      ctx.restore();
    });
  }
  // the launch pad and its tower, fixed to the ground
  function drawPad(time) {
    var sa = siteAngle(time), ux = Math.cos(sa), uy = Math.sin(sa), ex = uy, ey = -ux, Hh = G.top - G.stages[0].y0;
    function P2(e, u) { return w2s(RE * ux + e * ex + u * ux, RE * uy + e * ey + u * uy); }
    var px = cam.s; if (px * Hh < 4) return;
    var base = P2(0, 0), dir = d2s(ux, uy), ang = Math.atan2(dir[0], -dir[1]);
    ctx.save(); ctx.translate(base[0], base[1]); ctx.rotate(ang); ctx.scale(px, px);
    // ground strip and the flame trench
    var Dm = A.D;
    ctx.fillStyle = '#56636b'; ctx.fillRect(-Dm * 3.5, 0, Dm * 7, 2.2);
    ctx.fillStyle = '#2b343a'; ctx.fillRect(-Dm * 0.9, 0, Dm * 1.8, 2.2);
    // tower: lattice to the west (left)
    var tx = -(Dm / 2 + 4), tw = 3.2, th = Hh * 1.08;
    ctx.strokeStyle = '#b6544a'; ctx.lineWidth = 0.35; ctx.fillStyle = 'rgba(182,84,74,.25)';
    ctx.fillRect(tx - tw, -th, tw, th); ctx.strokeRect(tx - tw, -th, tw, th);
    ctx.beginPath(); for (var y = 0; y < th; y += tw) { ctx.moveTo(tx - tw, -y); ctx.lineTo(tx, -y - tw); ctx.moveTo(tx, -y); ctx.lineTo(tx - tw, -y - tw); } ctx.stroke();
    // arms that swing away at launch
    var swing = F && !F.onPad ? 1 : (F && F.ignited ? 0.6 : 0);
    ctx.fillStyle = '#8c9aa4';
    [0.35, 0.7, 0.95].forEach(function (f) { var yy = -th * f; ctx.save(); ctx.translate(tx, yy); ctx.rotate(-swing * 1.1); ctx.fillRect(0, -0.5, Dm / 2 + 3.8, 1); ctx.restore(); });
    ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(tx - tw / 2, -th - 0.8, 0.7, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  // ---------- smoke and steam (stored fixed to the ground, so they stay behind as the rocket climbs) ----------
  function emit(x, y, size, life, kind, vx, vy) {
    if (parts.length > (reduced ? 90 : 320)) parts.shift();
    var a = -earthRot(F ? F.t : 0), p = rotP(x, y, a), v = rotP(vx || 0, vy || 0, a);
    parts.push({ x: p[0], y: p[1], vx: v[0], vy: v[1], s: size, age: 0, life: life, k: kind });
  }
  function drawParts(dtR) {
    var a = earthRot(F ? F.t : 0);
    for (var i = parts.length - 1; i >= 0; i--) {
      var q = parts[i]; q.age += dtR; if (q.age > q.life) { parts.splice(i, 1); continue; }
      q.x += q.vx * dtR; q.y += q.vy * dtR;
      var p = rotP(q.x, q.y, a), sp = w2s(p[0], p[1]), f = q.age / q.life, r = q.s * (1 + 2.5 * f) * cam.s;
      if (r < 0.6 || sp[0] < -r || sp[0] > cv.w + r || sp[1] < -r || sp[1] > cv.h + r) continue;
      var al = (1 - f) * (q.k === 'steam' ? 0.42 : q.k === 'boom' ? 0.7 : 0.35);
      ctx.fillStyle = q.k === 'boom' ? 'rgba(255,190,120,' + al.toFixed(3) + ')' : 'rgba(235,240,244,' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(sp[0], sp[1], r, 0, 6.283); ctx.fill();
    }
  }

  // ---------- the flight ----------
  function launch() {
    if (phase === 'flight' && F && !F.ended) return;
    A = P.analyze(design); G = geometry(A);
    F = new P.Flight(design, { spin: set.spin, drag: set.drag, autoStage: set.autoStage, target: set.target * 1000, mode: set.mode, manPitch: set.pitch * DEG, throttle: set.throttle / 100 });
    if (set.throttle <= 0) { set.throttle = 100; F.throttle = 1; }
    F.ignite();
    phase = 'flight'; paused = false; trail = []; parts = []; flags = {}; mapSpan = 0; viewMode = 'chase'; camBTarget = 0;
    flightRec = { sig: A.signature, n: A.n, maxEps: -1e99, orbit: false, m0: A.m0, payload: A.payload.mass };
    showTab('fly'); syncFlyControls(); hideSummary();
    say(set.mode === 'auto' ? (F.planOk ? 'Ignition! The autopilot has picked its pitch program.' : 'Ignition! The autopilot will try its best, but this rocket looks short of Δv for orbit.') : 'Ignition!');
    updateButtons();
  }
  function toPad() {
    if (F) recordFlight();
    F = null; phase = 'build'; paused = false; parts = []; trail = []; camB = camBTarget = 0; viewMode = 'chase';
    hideSummary(); updateButtons(); setPauseIcon(); say('');
  }
  function recordFlight() {
    if (!flightRec || !F) return;
    var rec = store.get('two', {}), k = flightRec.sig, r = rec[k] || {};
    var key = flightRec.n > 1 ? 'multi' : 'one';
    if (r[key] === undefined || flightRec.maxEps > r[key]) r[key] = flightRec.maxEps;
    rec[k] = r; var keys = Object.keys(rec); if (keys.length > 30) delete rec[keys[0]];
    store.set('two', rec);
    if (r.one !== undefined && r.multi !== undefined && r.multi > r.one + 1e6) mission('twostage', 'Same parts, but stacked in two stages: the rocket went much further. Dropping the empty stage pays!');
    flightRec.recorded = true;
  }

  function stepFlight(dtR) {
    if (!F || paused) return;
    var h = F.alt(), e = F.engine(h), burning = e.mdot > 0;
    var w = WARPS[warpI], cap = (burning || h < 100000) ? 50 : 10000;
    if (F.ap === 'coast' && F.mode === 'auto' && w < 20 && !burning) w = 20; // the coast up to apoapsis is sped up
    w = Math.min(w, cap); curWarp = w;
    var simDt = dtR * w;
    if (!F.ended) F.advance(simDt);
    F.debrisStep(simDt);
    // events
    F.events.splice(0).forEach(onEvent);
    // trail (inertial positions with their time)
    var lt = trail.length ? trail[trail.length - 1] : null, gap = F.alt() < 150000 ? 0.5 : 20;
    if (!lt || F.t - lt[2] >= gap) { trail.push([F.x, F.y, F.t, F.st]); if (trail.length > 5000) trail = trail.filter(function (_, i) { return i % 2 === 0 || i > trail.length - 200; }); }
    // smoke
    h = F.alt(); e = F.engine(h);
    if (e.mdot > 0 && h < 45000 && !F.ended) {
      var fr = F.frame(), dir = [Math.cos(F.pitch) * fr.ex + Math.sin(F.pitch) * fr.ux, Math.cos(F.pitch) * fr.ey + Math.sin(F.pitch) * fr.uy];
      var n = reduced ? 1 : (F.stage().solid ? 3 : 2), s0 = F.stage().D * 0.6, fLen = F.stage().E.bellD * (9 + 12 * (1 - P.pressure(h) / P.P0));
      for (var i = 0; i < n; i++) {
        var back = fLen * 0.7 + Math.random() * 6 * s0, side = (Math.random() - 0.5) * s0, qx = F.x - dir[0] * back + dir[1] * side, qy = F.y - dir[1] * back - dir[0] * side;
        if (Math.hypot(qx, qy) < RE + s0) continue;
        emit(F.x - dir[0] * back + dir[1] * side, F.y - dir[1] * back - dir[0] * side, s0 * (F.stage().solid ? 1.4 : 0.8), 2.5 + Math.random() * 3, 'smoke');
      }
      if (h < 150 && F.t < 40) {
        var sa = siteAngle(F.t), gx = RE * Math.cos(sa), gy = RE * Math.sin(sa), ex2 = Math.sin(sa), ey2 = -Math.cos(sa), ux2 = Math.cos(sa), uy2 = Math.sin(sa);
        var Dd = A.D;
        for (i = 0; i < (reduced ? 1 : 3); i++) { var sd = Math.random() < 0.5 ? -1 : 1, off = Dd * (1 + Math.random() * 3), v = Dd * (3 + Math.random() * 7); emit(gx + ex2 * sd * off + ux2 * Dd * 0.5, gy + ey2 * sd * off + uy2 * Dd * 0.5, Dd * (0.6 + Math.random() * 0.8), 2.5 + Math.random() * 3, 'steam', ex2 * sd * v + ux2 * Dd, ey2 * sd * v + uy2 * Dd); }
      }
    }
    if (F.onPad && burning && F.t > 1.5 && !flags.heavy) { flags.heavy = 1; say('Too heavy: the thrust is less than the weight, so it stays on the pad. It can only rise once enough propellant has burned away.'); }
    // missions that watch the state
    var el = F.elements(), r = Math.hypot(F.x, F.y);
    if (flightRec) { if (el.eps > flightRec.maxEps) flightRec.maxEps = el.eps; }
    if (F.alt() >= 100000 && !flags.karman) { flags.karman = 1; say('You crossed the Kármán line: 100 km up, a common edge of space.'); mission('karman', 'Edge of space! 100 km up the air is so thin that wings no longer work.'); }
    var vr = (F.vx * F.x + F.vy * F.y) / r;
    if (F.maxAlt >= 400000 && vr < 0 && el.rp < RE && !burning && !flags.up) { flags.up = 1; mission('straightup', 'Higher than the space station, and still falling back: going up is not orbit. Orbit needs sideways speed.'); }
    var orbit = el.bound && el.rp - RE >= 150000;
    if (orbit && !flags.orbit && !burningNow()) {
      flags.orbit = 1; flightRec.orbit = true;
      say('In orbit: ' + km(el.rp - RE) + ' × ' + km(el.ra - RE) + ' km, one lap every ' + fmt(el.T / 60, 1) + ' minutes.');
      mission('orbit', 'Orbit! You are falling around Earth at ' + fmt(el.v / 1000, 2) + ' km/s, missing the ground all the way round.');
      if (A.payload.mass >= 5000 && A.m0 <= 110000) mission('lean', 'A lean rocket: ' + fmt(A.payload.mass / 1000, 0) + ' t to orbit with only ' + fmt(A.m0 / 1000, 1) + ' t at liftoff.');
      if (A.n > 1) recordFlightSoft();
    }
    if (!flightRec.recorded && F.prop[F.st] <= 0 && F.st === F.n - 1 && !burning) recordFlightSoft();
  }
  function recordFlightSoft() { if (flightRec && !flightRec.recorded) recordFlight(); }
  function burningNow() { return F && F.engine(F.alt()).mdot > 0; }
  var curWarp = 1;
  function onEvent(ev) {
    if (ev.type === 'liftoff') {
      say(ev.padBurn > 500 ? 'Liftoff, at last: it burned ' + fmt(ev.padBurn / 1000, 1) + ' t of propellant on the pad before it was light enough.' : 'Liftoff! Thrust ' + fmt(ev.twr, 2) + ' times its weight.');
      mission('liftoff', ev.padBurn > 500 ? 'Liftoff! Thrust only beat weight once enough propellant had burned away.' : 'Liftoff! Thrust beat weight (T/W ' + fmt(ev.twr, 2) + ').');
    } else if (ev.type === 'stage') { say('Stage ' + (ev.stage - 1) + ' dropped. Stage ' + ev.stage + ' fires.'); updateButtons(); }
    else if (ev.type === 'burnout') { if (!F.autoStage || F.st === F.n - 1) say('Stage ' + ev.stage + ' is empty.' + (F.st < F.n - 1 ? ' Press Stage to drop it.' : '')); }
    else if (ev.type === 'cutoff') { say(ev.phase === 'coast' ? 'Engine off: apoapsis is at ' + set.target + ' km. Coasting up to it…' : 'Engine off.'); syncFlyControls(); }
    else if (ev.type === 'circ') { say('Now the sideways burn at apoapsis, to round off the orbit.'); syncFlyControls(); }
    else if (ev.type === 'escape') { say('Escape! Now moving faster than escape speed: Earth can no longer pull you back.'); mission('escape', 'Escape! Your speed beats Earth’s pull for good. Next stop: anywhere.'); if (camBTarget < 1) setView('map'); }
    else if (ev.type === 'ground') {
      var fr = F.frame(); for (var i = 0; i < (reduced ? 6 : 26); i++) emit(F.x + (Math.random() - 0.5) * 60, F.y + (Math.random() - 0.5) * 60, 10 + Math.random() * 20, 2 + Math.random() * 2, i % 3 ? 'smoke' : 'boom', fr.ex * (Math.random() - 0.5) * 40, fr.ey * (Math.random() - 0.5) * 40);
      say('The rocket came back down, at ' + fmt(ev.speed, 0) + ' m/s.'); recordFlightSoft(); showSummary();
    } else if (ev.type === 'splash') { emit(ev.x, ev.y, 30, 3, 'steam'); }
  }

  // ---------- drawing a frame ----------
  function km(m) { return Math.round(m / 1000).toLocaleString('en-US'); }
  function draw(dtR) {
    var w = cv.w, h = cv.h, t = F ? F.t : 0;
    // camera: blend between the chase camera and the map camera
    var px, py, hh;
    if (F) { px = F.x; py = F.y; hh = F.alt(); } else { var sa = siteAngle(0); px = RE * Math.cos(sa); py = RE * Math.sin(sa); hh = 0; }
    var c1 = chaseCam(px, py, hh);
    camB += (camBTarget - camB) * Math.min(1, dtR * (reduced ? 20 : 3.2)); if (Math.abs(camB - camBTarget) < 0.002) camB = camBTarget;
    if (camB > 0) {
      var c2 = mapCam(), b = smooth(camB);
      cam = { cx: lerp(c1.cx, c2.cx, b), cy: lerp(c1.cy, c2.cy, b), ax: lerp(c1.ax, c2.ax, b), ay: lerp(c1.ay, c2.ay, b), s: Math.exp(lerp(Math.log(c1.s), Math.log(c2.s), b)), up: angLerp(c1.up, c2.up, b) };
    } else cam = c1;
    drawBackground(hh, true);
    drawEarth(t);
    if (camB < 0.9) { drawClouds(t); drawPad(t); drawParts(dtR); }
    if (camB > 0.05) drawMapLayer(t);
    else drawGroundTrail(t);
    drawDebris();
    drawShip(t);
    if (phase === 'build') drawBuildOverlay();
    else drawBudget();
  }
  function smooth(x) { return x * x * (3 - 2 * x); }
  function drawGroundTrail(t) {
    if (trail.length < 2) return;
    var a = earthRot(t); ctx.save(); ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(235,242,248,.42)'; ctx.beginPath();
    for (var i = 0; i < trail.length; i++) { var q = trail[i], p = rotP(q[0], q[1], a - earthRot(q[2])), s = w2s(p[0], p[1]); if (i) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); }
    var s2 = w2s(F.x, F.y); ctx.lineTo(s2[0], s2[1]); ctx.stroke(); ctx.restore();
  }
  function drawMapLayer(t) {
    var al = Math.min(1, camB * 1.4);
    ctx.save(); ctx.globalAlpha = al;
    var cs = w2s(0, 0), Rpx = RE * cam.s;
    // the Kármán line
    ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(143,179,198,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cs[0], cs[1], (RE + 100000) * cam.s, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    // launch site
    var sa = siteAngle(t), sp = w2s(RE * Math.cos(sa), RE * Math.sin(sa));
    ctx.fillStyle = COL.gold; ctx.beginPath(); ctx.arc(sp[0], sp[1], 3, 0, 6.283); ctx.fill();
    // the past path (inertial), colored by stage
    if (trail.length > 1) {
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (var i = 1; i < trail.length; i++) {
        var q0 = trail[i - 1], q1 = trail[i], p0 = w2s(q0[0], q0[1]), p1 = w2s(q1[0], q1[1]);
        ctx.strokeStyle = STC[q1[3] % 3]; ctx.globalAlpha = al * (0.35 + 0.65 * i / trail.length);
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      }
      ctx.globalAlpha = al;
    }
    // the orbit this speed and height would give with the engines off
    if (F && F.alt() > 2000) {
      var el = F.elements(), sg = el.h < 0 ? -1 : 1, N = 240, maxR = Math.max(60 * RE, Math.hypot(F.x, F.y) * 3), first = true;
      ctx.strokeStyle = 'rgba(116,192,252,.8)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]); ctx.beginPath();
      var nuMax = el.e < 1 ? Math.PI : Math.acos(-1 / el.e) * 0.995;
      for (var k = 0; k <= N; k++) {
        var nu = -nuMax + 2 * nuMax * k / N, rr = el.p / (1 + el.e * Math.cos(nu));
        if (rr < RE || rr > maxR || !isFinite(rr)) { first = true; continue; }
        var ang = el.argp + sg * nu, pp = w2s(rr * Math.cos(ang), rr * Math.sin(ang));
        if (first) { ctx.moveTo(pp[0], pp[1]); first = false; } else ctx.lineTo(pp[0], pp[1]);
      }
      ctx.stroke(); ctx.setLineDash([]);
      // apoapsis and periapsis marks
      ctx.font = '600 11px system-ui,sans-serif';
      if (el.rp > RE) { var pe = w2s(el.rp * Math.cos(el.argp), el.rp * Math.sin(el.argp)); mark(pe, COL.green, 'Pe ' + km(el.rp - RE) + ' km'); }
      if (el.bound && el.ra < maxR) { var aa = el.argp + Math.PI, ap = w2s(el.ra * Math.cos(aa), el.ra * Math.sin(aa)); mark(ap, COL.gold, 'Ap ' + km(el.ra - RE) + ' km'); }
    }
    ctx.restore();
  }
  function mark(p, col, text) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 6.283); ctx.fill();
    var tw = ctx.measureText(text).width, x = Math.min(cv.w - tw - 6, Math.max(6, p[0] + 8)), y = Math.min(cv.h - 8, Math.max(14, p[1] - 6));
    ctx.fillStyle = 'rgba(6,17,26,.7)'; ctx.fillRect(x - 3, y - 11, tw + 6, 15); ctx.fillStyle = col; ctx.fillText(text, x, y);
  }
  function drawDebris() {
    if (!F) return;
    F.debris.forEach(function (d) {
      var p = w2s(d.x, d.y), o = G.stages[d.idx], len = (o.y1 - o.y0), sd = Math.max(cam.s, 22 / len);
      if (p[0] < -200 || p[0] > cv.w + 200 || p[1] < -200 || p[1] > cv.h + 200) return;
      if (camB > 0.6 || len * cam.s < 3) { ctx.fillStyle = 'rgba(219,231,239,.6)'; ctx.beginPath(); ctx.arc(p[0], p[1], 2, 0, 6.283); ctx.fill(); return; }
      var fr = { ux: d.x / Math.hypot(d.x, d.y), uy: d.y / Math.hypot(d.x, d.y) }, ex = fr.uy, ey = -fr.ux, th = d.pitch + d.rot;
      var ax = Math.cos(th) * ex + Math.sin(th) * fr.ux, ay = Math.cos(th) * ey + Math.sin(th) * fr.uy, sv = d2s(ax, ay), ang = Math.atan2(sv[0], -sv[1]);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); ctx.scale(sd, sd); ctx.translate(0, o.y0); ctx.globalAlpha = 0.9;
      drawStageOnly(o);
      ctx.restore();
    });
  }
  function drawStageOnly(o) {
    var s = o.s, D2 = o.D / 2;
    ctx.fillStyle = cylGrad(ctx, -D2, D2, BODY[s.type]); ctx.fillRect(-D2, -o.tankY1, o.D, o.tankY1 - o.tankY0);
    ctx.fillStyle = STC[o.i % 3]; ctx.fillRect(-D2, -(o.tankY0 + 0.65), o.D, 0.4);
    if (o.isY0 !== undefined) { var a2 = o.isD1 / 2; ctx.beginPath(); ctx.moveTo(-D2, -o.isY0); ctx.lineTo(D2, -o.isY0); ctx.lineTo(a2, -o.isY1); ctx.lineTo(-a2, -o.isY1); ctx.closePath(); ctx.fillStyle = '#3e4a54'; ctx.fill(); }
    ctx.fillStyle = '#7d8a94'; ctx.fillRect(-D2 * 0.5, -o.bellY1, o.D * 0.5, o.bellY1 - o.bellY0);
  }
  function drawShip(t) {
    var k = F ? F.st : 0, px, py, pitch, fl = null;
    if (F) {
      px = F.x; py = F.y; pitch = F.pitch;
      var h = F.alt(), e = F.engine(h);
      if (e.mdot > 0) fl = { on: true, p: P.pressure(h) / P.P0, thr: F.stage().solid ? 1 : F.throttle };
      if (F.ended) fl = null;
    } else { var sa = siteAngle(0); px = RE * Math.cos(sa); py = RE * Math.sin(sa); pitch = 90 * DEG; }
    var r = Math.hypot(px, py), ux = px / r, uy = py / r, ex = uy, ey = -ux;
    var ax = Math.cos(pitch) * ex + Math.sin(pitch) * ux, ay = Math.cos(pitch) * ey + Math.sin(pitch) * uy;
    var p = w2s(px, py), sv = d2s(ax, ay), ang = Math.atan2(sv[0], -sv[1]);
    var Lh = G.top - G.stages[k].y0, minPx = camB > 0.5 ? 0 : Math.max(44, Math.min(84, cv.h * 0.12)), sd = Math.max(cam.s, minPx / Lh);
    if (F && F.ended) { return; }
    if (camB > 0.5 || Lh * sd < 8) {
      // a bright marker, with a short flame streak while burning
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang);
      if (fl) { var g = ctx.createLinearGradient(0, 0, 0, 22); g.addColorStop(0, 'rgba(255,212,121,.9)'); g.addColorStop(1, 'rgba(255,135,135,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-3, 2); ctx.lineTo(3, 2); ctx.lineTo(0, 22 + (reduced ? 0 : Math.random() * 4)); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(4, 4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
      ctx.restore();
      var gl = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 14); gl.addColorStop(0, 'rgba(255,255,255,.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(p[0], p[1], 14, 0, 6.283); ctx.fill();
      return;
    }
    ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); ctx.scale(sd, sd); ctx.translate(0, G.stages[k].y0);
    drawRocket(ctx, G, k, fl, tNow);
    ctx.restore();
  }

  // ---------- the build view: labels next to the rocket and a Δv bar ----------
  function drawBuildOverlay() {
    var w = cv.w, h = cv.h, small = w < 560, k = 0;
    var sa = siteAngle(0), base = w2s(RE * Math.cos(sa), RE * Math.sin(sa)), sd = cam.s;
    ctx.save(); ctx.font = (small ? '600 10px' : '600 12px') + ' system-ui,sans-serif'; ctx.textBaseline = 'middle';
    // stage brackets on the right of the rocket
    var xr = base[0] + A.D * sd / 2 + (small ? 10 : 18);
    for (var i = 0; i < G.stages.length; i++) {
      var o = G.stages[i], s = o.s, y0 = base[1] - o.y0 * sd, y1 = base[1] - (o.isY1 || o.tankY1) * sd, ym = (y0 + y1) / 2;
      ctx.strokeStyle = STC[i % 3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xr, y0 - 2); ctx.lineTo(xr + 5, y0 - 2); ctx.lineTo(xr + 5, y1 + 2); ctx.lineTo(xr, y1 + 2); ctx.stroke();
      var t1 = 'Stage ' + (i + 1) + ' · ' + (s.solid ? s.engines + ' motor' + (s.engines > 1 ? 's' : '') : s.engines + ' engine' + (s.engines > 1 ? 's' : '')) + (small ? '' : ' · ' + s.E.short), t2 = fmt(s.mass / 1000, 1) + ' t · Δv ' + fmt(s.dvVac / 1000, 2) + (small ? '' : ' km/s');
      ctx.fillStyle = STC[i % 3]; ctx.fillText(t1, xr + 11, ym - 8); ctx.fillStyle = COL.ink; ctx.fillText(t2, xr + 11, ym + 8);
    }
    var yp = base[1] - (G.plY0 + G.plLen * 0.5) * sd;
    ctx.fillStyle = COL.ink; ctx.fillText(A.payload.name + ' · ' + fmt(A.payload.mass / 1000, 1) + ' t', xr + 11, yp);
    // Δv bar on the left
    var bx = small ? 14 : 26, by0 = h - (small ? 108 : 70), bh = Math.min(h * (small ? 0.5 : 0.62), 340), top = 16000, bw = small ? 14 : 18, yv = function (v) { return by0 - bh * Math.min(1, v / top); };
    ctx.fillStyle = 'rgba(6,17,26,.55)'; roundRect(ctx, bx - 8, by0 - bh - 10, (small ? 96 : 178), bh + 54, 10); ctx.fill();
    ctx.fillStyle = 'rgba(219,231,239,.1)'; ctx.fillRect(bx, by0 - bh, bw, bh);
    var acc = 0;
    A.stages.forEach(function (s, j) { ctx.fillStyle = STC[j % 3]; ctx.fillRect(bx, yv(acc + s.dvVac), bw, yv(acc) - yv(acc + s.dvVac)); acc += s.dvVac; });
    ctx.fillStyle = COL.ink; ctx.textAlign = 'left';
    function line(v, text, col) { var y = yv(v); ctx.strokeStyle = col; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(bx - 4, y); ctx.lineTo(bx + bw + 6, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.fillText(text, bx + bw + 9, y); }
    ctx.lineWidth = 1.2;
    line(9300, small ? 'orbit 9.3' : 'low orbit ≈ 9.3 km/s', COL.blue);
    line(12500, small ? 'escape 12.5' : 'escape ≈ 12.5 km/s', COL.pink);
    ctx.fillStyle = COL.gold; ctx.font = (small ? '700 12px' : '700 14px') + ' system-ui,sans-serif';
    ctx.fillText('Δv ' + fmt(acc / 1000, 2) + ' km/s', bx - 2, by0 + 18);
    ctx.font = (small ? '600 10px' : '600 12px') + ' system-ui,sans-serif'; ctx.fillStyle = COL.muted; ctx.fillText('in vacuum', bx - 2, by0 + 34);
    ctx.restore();
  }
  // the Δv budget while flying: speed gained, gravity loss, drag loss, steering loss
  function drawBudget() {
    if (!F) return;
    var w = cv.w, h = cv.h, small = w < 560, padW = padBox ? padBox : 0;
    var above = w - padW - 40 < 220, bw = above ? Math.min(360, w - 30) : Math.min(360, w - padW - 40), x = 12, y = h - (above ? 74 : 26), bh = 10;
    var gain = Math.max(0, F.dv - F.lossG - F.lossD - F.lossS), tot = Math.max(F.dv, 1), scale = bw / Math.max(10000, A.dvVac, F.dv);
    var segs = [[gain, COL.green, 'speed'], [F.lossG, COL.gold, 'gravity'], [F.lossD, COL.red, 'drag'], [F.lossS, COL.blue, 'steering']];
    ctx.save(); ctx.fillStyle = 'rgba(6,17,26,.6)'; ctx.fillRect(x - 6, y - 26, bw + 12, bh + 34);
    ctx.fillStyle = 'rgba(219,231,239,.1)'; ctx.fillRect(x, y, Math.max(bw, A.dvVac * scale), bh);
    ctx.strokeStyle = 'rgba(219,231,239,.35)'; ctx.strokeRect(x + 0.5, y + 0.5, A.dvVac * scale - 1, bh - 1);
    var xx = x; segs.forEach(function (s) { var ww = s[0] * scale; ctx.fillStyle = s[1]; ctx.fillRect(xx, y, ww, bh); xx += ww; });
    ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = COL.ink; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Δv used ' + fmt(F.dv / 1000, 2) + ' of ' + fmt(A.dvVac / 1000, 2) + ' km/s', x, y - 8);
    ctx.restore();
  }

  // ---------- HUD and panel readouts ----------
  var hud = $('rk-hud'), msg = $('rk-msg'), out = {};
  ['t', 'alt', 'gs', 'os', 'ap', 'pe', 'dv', 'lg', 'ld', 'ls', 'mq', 'prop', 'tw'].forEach(function (k) { out[k] = $('rk-o-' + k); });
  function clock(t) { var m = Math.floor(t / 60), s = Math.floor(t % 60); if (m >= 60) return Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; return 'T+' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  var PH = { vert: 'rising straight up', turn: 'gravity turn', coast: 'coasting up to apoapsis', circ: 'sideways burn at apoapsis', done: 'engines off' };
  function updateHud() {
    if (!F) {
      hud.innerHTML = '<b>On the pad</b><br>Liftoff mass ' + fmt(A.m0 / 1000, 1) + ' t<br>' + (A.twr > 1 ? '<span class="rk-ok">T/W ' + fmt(A.twr, 2) + ' ✓ it can lift off</span>' : '<span class="rk-no">T/W ' + fmt(A.twr, 2) + ' ✗ too heavy to lift off</span>');
      return;
    }
    var h = F.alt(), G2 = F.gammas(), el = F.elements(), e = F.engine(h), gs = G2.vAir, os = Math.hypot(F.vx, F.vy);
    var empty = F.prop[F.st] <= 0 && F.st === F.n - 1;
    var mode = empty ? 'Out of propellant' : F.mode === 'auto' ? 'Auto: ' + PH[F.ap] : F.mode === 'up' ? 'Straight up' : F.mode === 'pro' ? 'Prograde' : 'Manual pitch ' + Math.round(F.manPitch / DEG) + '°';
    var ap = el.bound ? km(el.ra - RE) + ' km' : '—', pe = el.rp > RE ? km(el.rp - RE) + ' km' : 'below ground';
    var lines = [
      '<b>' + clock(F.t) + '</b> · stage ' + (F.st + 1) + '/' + F.n + (curWarp > 1 ? ' · ⏩ ' + curWarp + '×' : '') + (paused ? ' · paused' : ''),
      'Altitude <b>' + (h < 10000 ? fmt(h / 1000, 2) : fmt(h / 1000, 1)) + ' km</b>',
      'Speed <b>' + fmt(gs / 1000, 2) + '</b> km/s ground · <b>' + fmt(os / 1000, 2) + '</b> orbital',
      'Ap <b>' + ap + '</b> · Pe <b>' + pe + '</b>' + (el.bound && el.rp > RE ? ' · lap ' + fmt(el.T / 60, 1) + ' min' : ''),
      mode + ' · throttle ' + Math.round((F.stage().solid && F.solidLit ? 1 : F.throttle) * 100) + '%' + (e.mdot > 0 ? ' 🔥' : '')
    ];
    hud.innerHTML = lines.join('<br>');
    var tot = 0; for (var i = F.st; i < F.n; i++) tot += F.prop[i];
    var o = {
      t: clock(F.t), alt: fmt(h / 1000, 1) + ' km', gs: fmt(gs, 0) + ' m/s', os: fmt(os, 0) + ' m/s', ap: ap, pe: pe,
      dv: fmt(F.dv, 0) + ' m/s', lg: fmt(F.lossG, 0) + ' m/s', ld: fmt(F.lossD, 0) + ' m/s', ls: fmt(F.lossS, 0) + ' m/s',
      mq: fmt(F.maxQ / 1000, 1) + ' kPa', prop: fmt(F.prop[F.st] / 1000, 1) + ' t (all: ' + fmt(tot / 1000, 1) + ' t)', tw: Math.round(e.T / 1000).toLocaleString('en-US') + ' kN · T/W ' + fmt(e.T / (F.m * P.G0), 2)
    };
    for (var k in o) if (out[k]) out[k].textContent = o[k];
  }
  function say(text) { if (!msg) return; msg.textContent = text; msg.classList.toggle('on', !!text); msgTimer = text ? 6 : 0; }
  function mission(id, text) { if (MS.done(id)) L.toast(view, '✓ ' + text); }

  // ---------- panel: build ----------
  var bPreset = $('rk-preset'), bPayload = $('rk-payload'), bStages = $('rk-stages'), bAdd = $('rk-add');
  Object.keys(P.PAYLOADS).forEach(function (k) { var o = D.createElement('option'); o.value = k; o.textContent = P.PAYLOADS[k].name + ' (' + fmt(P.PAYLOADS[k].mass / 1000, 1) + ' t)'; bPayload.appendChild(o); });
  Object.keys(PRESETS).forEach(function (k) { var o = D.createElement('option'); o.value = k; o.textContent = PRESETS[k].name; bPreset.appendChild(o); });
  var oc = D.createElement('option'); oc.value = ''; oc.textContent = 'Your own design'; bPreset.appendChild(oc);
  function saveDesign() { store.set('design', design); store.set('preset', presetKey); }
  function designChanged(keepPreset) {
    if (!keepPreset) presetKey = '';
    bPreset.value = presetKey; A = P.analyze(design); G = geometry(A); saveDesign();
    if (phase === 'flight') toPad();
    renderBuild();
  }
  function renderBuild() {
    bPayload.value = design.payload; bPreset.value = presetKey;
    var html = '';
    for (var i = design.stages.length - 1; i >= 0; i--) {
      var s = design.stages[i], si = A.stages[i], solid = s.type === 'solid', lim1 = solid ? LIMITS.motors : LIMITS.engines, lim2 = solid ? LIMITS.segs : LIMITS.tanks;
      html += '<div class="rk-st" data-i="' + i + '" style="--stc:' + STC[i % 3] + '">' +
        '<div class="rk-st-h"><b>Stage ' + (i + 1) + '</b><span>' + (i === 0 ? 'bottom, fires first' : i === design.stages.length - 1 ? 'top' : 'middle') + '</span>' + (i === design.stages.length - 1 && design.stages.length > 1 ? '<button type="button" class="rk-x" data-act="del" aria-label="Remove stage ' + (i + 1) + '">✕</button>' : '') + '</div>' +
        '<label class="lab-field"><span>Propellant</span><select data-k="type" aria-label="Stage ' + (i + 1) + ' propellant">' + ['kerolox', 'hydrolox', 'solid'].map(function (k) { return '<option value="' + k + '"' + (k === s.type ? ' selected' : '') + '>' + P.ENG[k].name + '</option>'; }).join('') + '</select></label>' +
        '<label class="lab-field"><span>' + (solid ? 'Motors' : 'Engines') + ' <output>' + s.engines + '</output></span><input type="range" data-k="engines" min="' + lim1[0] + '" max="' + lim1[1] + '" value="' + Math.min(s.engines, lim1[1]) + '" aria-label="Stage ' + (i + 1) + (solid ? ' motors' : ' engines') + '"></label>' +
        '<label class="lab-field"><span>' + (solid ? 'Segments per motor' : 'Tanks (10 t of propellant each)') + ' <output>' + s.tanks + '</output></span><input type="range" data-k="tanks" min="' + lim2[0] + '" max="' + lim2[1] + '" value="' + Math.min(s.tanks, lim2[1]) + '" aria-label="Stage ' + (i + 1) + (solid ? ' segments per motor' : ' tanks') + '"></label>' +
        '<p class="rk-st-f">' + fmt(si.mass / 1000, 1) + ' t (' + fmt(si.prop / 1000, 0) + ' t propellant) · burns ' + fmt(si.burn, 0) + ' s · Δv <b>' + fmt(si.dvVac / 1000, 2) + ' km/s</b></p></div>';
    }
    bStages.innerHTML = html; bAdd.disabled = design.stages.length >= 3;
    var o = { m0: fmt(A.m0 / 1000, 1) + ' t', twr: fmt(A.twr, 2) + (A.twr > 1 ? '' : ' (too heavy)'), dv: fmt(A.dvVac / 1000, 2) + ' km/s', one: A.n > 1 ? fmt(A.dvMerged / 1000, 2) + ' km/s' : 'it is one stage', ht: fmt(G.top, 0) + ' m × ' + fmt(A.D, 1) + ' m', pf: fmt(100 * A.payload.mass / A.m0, 1) + '%' };
    for (var k in o) { var el = $('rk-d-' + k); if (el) el.textContent = o[k]; }
    $('rk-d-twr').className = A.twr > 1 ? '' : 'rk-bad';
  }
  bStages.addEventListener('input', function (e) {
    var t = e.target, card = t.closest('.rk-st'); if (!card) return; var i = +card.dataset.i, k = t.dataset.k;
    if (k === 'engines' || k === 'tanks') {
      design.stages[i][k] = +t.value; var o = t.parentNode.querySelector('output'); if (o) o.textContent = t.value;
      presetKey = ''; bPreset.value = ''; A = P.analyze(design); G = geometry(A); saveDesign(); if (phase === 'flight') toPad();
      // refresh numbers without rebuilding the slider being dragged
      var si = A.stages[i]; card.querySelector('.rk-st-f').innerHTML = fmt(si.mass / 1000, 1) + ' t (' + fmt(si.prop / 1000, 0) + ' t propellant) · burns ' + fmt(si.burn, 0) + ' s · Δv <b>' + fmt(si.dvVac / 1000, 2) + ' km/s</b>';
      renderTotals();
    }
  });
  function renderTotals() {
    var o = { m0: fmt(A.m0 / 1000, 1) + ' t', twr: fmt(A.twr, 2) + (A.twr > 1 ? '' : ' (too heavy)'), dv: fmt(A.dvVac / 1000, 2) + ' km/s', one: A.n > 1 ? fmt(A.dvMerged / 1000, 2) + ' km/s' : 'it is one stage', ht: fmt(G.top, 0) + ' m × ' + fmt(A.D, 1) + ' m', pf: fmt(100 * A.payload.mass / A.m0, 1) + '%' };
    for (var k in o) { var el = $('rk-d-' + k); if (el) el.textContent = o[k]; }
    $('rk-d-twr').className = A.twr > 1 ? '' : 'rk-bad';
  }
  bStages.addEventListener('change', function (e) {
    var t = e.target, card = t.closest('.rk-st'); if (!card) return; var i = +card.dataset.i;
    if (t.dataset.k === 'type') {
      var s = design.stages[i]; s.type = t.value;
      if (s.type === 'solid') { s.engines = Math.min(s.engines, LIMITS.motors[1]); s.tanks = Math.min(s.tanks, LIMITS.segs[1]); }
      designChanged();
    } else if (t.dataset.k === 'engines' || t.dataset.k === 'tanks') renderBuild();
  });
  bStages.addEventListener('click', function (e) { var b = e.target.closest('[data-act="del"]'); if (!b) return; design.stages.pop(); designChanged(); });
  bAdd.addEventListener('click', function () { if (design.stages.length >= 3) return; design.stages.push(S('hydrolox', 1, 2)); designChanged(); });
  bPayload.addEventListener('change', function () { design.payload = bPayload.value; designChanged(); });
  bPreset.addEventListener('change', function () { loadPreset(bPreset.value); });
  function loadPreset(k) {
    if (!PRESETS[k]) return; design = clone(PRESETS[k].d); presetKey = k; set.mode = PRESETS[k].mode; store.set('mode', set.mode);
    designChanged(true); syncFlyControls();
  }

  // ---------- panel: fly ----------
  var fMode = $('rk-mode'), fPitch = $('rk-pitch'), fThr = $('rk-thr'), fTarget = $('rk-target'), fSpin = $('rk-spin'), fDrag = $('rk-drag'), fAuto = $('rk-autostage');
  function syncFlyControls() {
    var mode = F ? F.mode : set.mode;
    [].forEach.call(fMode.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.dataset.m === mode ? 'true' : 'false'); });
    var pv = Math.round((F ? (mode === 'man' ? F.manPitch : F.pitch) : set.pitch * DEG) / DEG);
    fPitch.value = Math.max(0, Math.min(90, pv)); $('rk-pitch-o').textContent = Math.max(0, Math.min(90, pv)) + '°';
    $('rk-pitch-f').hidden = mode !== 'man';
    var thr = F ? Math.round(F.throttle * 100) : set.throttle; fThr.value = thr; $('rk-thr-o').textContent = thr + '%';
    fTarget.value = set.target; $('rk-target-o').textContent = set.target + ' km'; $('rk-target-f').hidden = mode !== 'auto';
    fSpin.checked = set.spin; fDrag.checked = set.drag; fAuto.checked = set.autoStage; fSpin.disabled = !!(F && !F.onPad);
    padPitch.forEach(function (b) { b.hidden = mode !== 'man'; });
  }
  fMode.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; setMode(b.dataset.m);
  });
  function setMode(m) {
    set.mode = m; store.set('mode', m);
    if (F) {
      if (m === 'man' && F.mode !== 'man') F.manPitch = Math.max(0, Math.min(90 * DEG, F.pitch));
      if (m === 'auto' && F.mode !== 'auto') { F.ap = F.onPad ? 'vert' : (F.elements().bound && F.elements().rp - RE > 140000 ? 'done' : 'turn'); }
      F.mode = m;
    }
    syncFlyControls();
  }
  fPitch.addEventListener('input', function () { var v = +fPitch.value; set.pitch = v; $('rk-pitch-o').textContent = v + '°'; if (F) F.manPitch = v * DEG; });
  fThr.addEventListener('input', function () { solidNote(); var v = +fThr.value; set.throttle = v; $('rk-thr-o').textContent = v + '%'; if (F) { F.throttle = v / 100; if (v > 0 && F.stage() && F.stage().solid && F.ignited) F.solidLit = true; } });
  fTarget.addEventListener('input', function () { set.target = +fTarget.value; store.set('target', set.target); $('rk-target-o').textContent = set.target + ' km'; if (F) F.target = set.target * 1000; });
  fSpin.addEventListener('change', function () { set.spin = fSpin.checked; store.set('spin', set.spin); if (F && F.onPad) { toPad(); } });
  fDrag.addEventListener('change', function () { set.drag = fDrag.checked; store.set('drag', set.drag); if (F) F.drag = set.drag; });
  fAuto.addEventListener('change', function () { set.autoStage = fAuto.checked; store.set('autoStage', set.autoStage); if (F) F.autoStage = set.autoStage; });
  function doStage() {
    if (!F) return;
    if (F.doStage()) { F.events.splice(0).forEach(onEvent); }
  }
  function solidNote() { if (F && F.stage() && F.stage().solid && F.solidLit) say('A solid motor burns until it is empty: it cannot be throttled or switched off.'); }
  function throttleBy(d) { solidNote(); var v = Math.max(0, Math.min(100, Math.round((F ? F.throttle * 100 : set.throttle) + d))); set.throttle = v; if (F) { F.throttle = v / 100; if (v > 0 && F.stage().solid && F.ignited) F.solidLit = true; } syncFlyControls(); }
  function pitchBy(d) {
    if (F && F.mode !== 'man') setMode('man');
    var cur = F ? F.manPitch / DEG : set.pitch, v = Math.max(0, Math.min(90, Math.round(cur + d)));
    set.pitch = v; if (F) F.manPitch = v * DEG; syncFlyControls();
  }

  // ---------- buttons, tabs, overlay ----------
  var tabs = $('rk-tabs'), padEl = $('rk-padbtns'), padStage = root.querySelector('[data-pad="stage"]'), padPitch = [].slice.call(root.querySelectorAll('[data-pad="pl"],[data-pad="pr"]')), padBox = 0;
  function showTab(k) {
    [].forEach.call(tabs.querySelectorAll('button'), function (b) { var on = b.dataset.t === k; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    $('rk-build').hidden = k !== 'build'; $('rk-fly').hidden = k !== 'fly';
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) showTab(b.dataset.t); });
  function updateButtons() {
    var flying = phase === 'flight' && F && !F.ended;
    $('rk-launch').hidden = phase === 'flight'; $('rk-launch2').textContent = phase === 'flight' ? '↺ Back to the pad' : '🚀 Launch';
    $('rk-bigl').hidden = phase === 'flight';
    padEl.hidden = !flying;
    $('rk-stage-btn').disabled = !(flying && F.st < F.n - 1);
    setTimeout(measurePad, 0);
  }
  function measurePad() { padBox = padEl.hidden ? 0 : padEl.getBoundingClientRect().width + 12; }
  W.addEventListener('resize', measurePad);
  $('rk-launch').addEventListener('click', launch);
  $('rk-bigl').addEventListener('click', launch);
  $('rk-launch2').addEventListener('click', function () { if (phase === 'flight') toPad(); else launch(); });
  $('rk-stage-btn').addEventListener('click', doStage);
  padEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var k = b.dataset.pad;
    if (k === 'stage') doStage(); else if (k === 'tu') throttleBy(10); else if (k === 'td') throttleBy(-10); else if (k === 'pl') pitchBy(3); else if (k === 'pr') pitchBy(-3);
  });
  function setPauseIcon() { var b = $('rk-pause'); b.textContent = paused ? '▶' : '❚❚'; b.setAttribute('aria-label', paused ? 'Resume' : 'Pause'); }
  $('rk-pause').addEventListener('click', function () { paused = !paused; setPauseIcon(); });
  $('rk-reset').addEventListener('click', toPad);
  function setWarp(i) { warpI = Math.max(0, Math.min(WARPS.length - 1, i)); var b = $('rk-warp'); b.textContent = WARPS[warpI] + '×'; b.setAttribute('aria-label', 'Time warp ' + WARPS[warpI] + ' times; click for faster'); }
  $('rk-warp').addEventListener('click', function () { setWarp(warpI + 1 >= WARPS.length ? 0 : warpI + 1); });
  function setView(k) { viewMode = k; camBTarget = k === 'map' ? 1 : 0; var b = $('rk-viewbtn'); b.textContent = k === 'map' ? '🚀' : '🌍'; b.setAttribute('aria-label', k === 'map' ? 'Follow the rocket' : 'Show the whole orbit'); }
  $('rk-viewbtn').addEventListener('click', function () { setView(viewMode === 'map' ? 'chase' : 'map'); });
  var sum = $('rk-sum');
  function showSummary() {
    if (!F) return;
    sum.innerHTML = '<h3>Flight over</h3><p>Back on the ground after ' + clock(F.t).replace('T+', '') + '. Highest point <b>' + km(F.maxAlt) + ' km</b>, top speed <b>' + fmt(F.maxV / 1000, 2) + ' km/s</b>, Δv used <b>' + fmt(F.dv / 1000, 2) + ' km/s</b>.</p>' +
      '<p class="rk-sum-tip">' + (F.maxAlt < 100000 ? 'Tip: more Δv (more propellant, or lighter stages) and a T/W above about 1.3 will take you higher.' : 'Tip: to stay up, you need sideways speed: about 7.8 km/s, low down.') + '</p>' +
      '<div class="lab-row"><button type="button" class="lab-btn pri" data-s="again">🚀 Fly again</button><button type="button" class="lab-btn" data-s="build">🔧 Change the rocket</button></div>';
    sum.hidden = false;
  }
  function hideSummary() { sum.hidden = true; }
  sum.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.s === 'again') { toPad(); launch(); } else { toPad(); showTab('build'); } });

  // keyboard
  root.addEventListener('keydown', function (e) {
    var tg = e.target, tag = tg && tg.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key, done = true;
    if (k === ' ' && tag === 'BUTTON') return;
    if (k === ' ') { if (phase === 'build') launch(); else doStage(); }
    else if (k === 'ArrowUp' || k === 'w' || k === 'W') throttleBy(10);
    else if (k === 'ArrowDown' || k === 's' || k === 'S') throttleBy(-10);
    else if (k === 'z' || k === 'Z') throttleBy(100);
    else if (k === 'x' || k === 'X') throttleBy(-100);
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') pitchBy(2);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') pitchBy(-2);
    else if (k === 'p' || k === 'P') { paused = !paused; setPauseIcon(); }
    else if (k === 'r' || k === 'R') toPad();
    else if (k === 'm' || k === 'M') setView(viewMode === 'map' ? 'chase' : 'map');
    else if (k === '.' || k === '>') setWarp(warpI + 1);
    else if (k === ',' || k === '<') setWarp(warpI - 1);
    else done = false;
    if (done) e.preventDefault();
  });
  view.addEventListener('pointerdown', function () { try { view.focus({ preventScroll: true }); } catch (err) { } });

  // ---------- missions ----------
  var MITEMS = [
    { id: 'liftoff', title: 'Lift off', goal: 'Leave the ground. Thrust must beat weight: T/W above 1.' },
    { id: 'karman', title: 'Edge of space', goal: 'Cross the Kármán line, 100 km up.' },
    { id: 'straightup', title: 'Up is not orbit', goal: 'Fly straight up past 400 km, as high as the space station, and see what happens next.' },
    { id: 'orbit', title: 'Orbit!', goal: 'Reach orbit: periapsis above 150 km.' },
    { id: 'twostage', title: 'Two beat one', goal: 'Fly the same parts as one stage, then as two stages. The two-stage rocket must do much better.' },
    { id: 'escape', title: 'Escape Earth', goal: 'Go fast enough that Earth can never pull you back.' },
    { id: 'lean', title: 'Lean machine', goal: 'Put the 5 t Large satellite in orbit with a liftoff mass under 110 t.' }
  ];
  var PICK = {
    liftoff: ['heavy', 'This rocket is too heavy for its engine. Add engines or take away tanks until T/W is above 1, then launch.'],
    karman: ['sounding', 'A small solid rocket. Launch it straight up.'],
    straightup: ['sounding', 'Launch straight up, then speed up time with ⏩ and watch.'],
    orbit: ['orbiter', 'Launch on Auto and let the autopilot fly. Speed up time with ⏩.'],
    twostage: ['one', 'Fly this one-stage rocket first. Then choose "Two stages (same parts)" and fly that.'],
    escape: ['escape', 'Reach orbit on Auto, then push the throttle up to burn the rest of the propellant.'],
    lean: ['orbiter', 'This one works but weighs 136 t. Trim tanks and engines and keep the Large satellite.']
  };
  var MS = L.missions($('rk-missions'), 'rocket', MITEMS, function (id) {
    var p = PICK[id]; if (!p) return; loadPreset(p[0]); showTab('build'); L.toast(view, p[1]);
    try { view.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); } catch (e) { }
  });

  // ---------- main loop ----------
  L.loop(function (dt) {
    tNow += dt;
    cv.fit();
    if (phase === 'flight') stepFlight(dt);
    if (F && !F.ended && camBTarget === 0 && F.alt() > 140000 && !flags.autoMap) { flags.autoMap = 1; setView('map'); }
    if (F && camBTarget === 1 && F.alt() < 90000 && flags.autoMap && !flags.autoChase && (F.gammas().vr < 0)) { flags.autoChase = 1; setView('chase'); }
    draw(dt);
    if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) msg.classList.remove('on'); }
    if (tNow - lastHud > 0.12) { lastHud = tNow; updateHud(); if (F) { var cs2 = !(F.st < F.n - 1 && !F.ended); $('rk-stage-btn').disabled = cs2; padStage.disabled = cs2; syncThrottleOnly(); } }
  }, view);
  function syncThrottleOnly() { if (D.activeElement === fThr) return; var thr = Math.round(F.throttle * 100); if (+fThr.value !== thr) { fThr.value = thr; $('rk-thr-o').textContent = thr + '%'; } }

  // start
  setWarp(0); setView('chase'); showTab('build'); renderBuild(); syncFlyControls(); updateButtons(); updateHud();
  // test hook: lets the page's own checks read the state (no effect on play)
  W.__rocket = { get F() { return F; }, get A() { return A; }, launch: launch, toPad: toPad, setWarp: setWarp, loadPreset: loadPreset, setMode: setMode };
})(window, document);
