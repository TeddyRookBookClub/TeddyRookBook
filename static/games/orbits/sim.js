/* Orbit Lab (/science-lab/orbits/): Newton's cannon, Earth orbits, a trip to the Moon and a gravity assist, on one canvas.
   The physics is in physics.js (window.OrbitPhys); this file draws the scenes, handles input and checks the missions. */
(function () {
  'use strict';
  var L = window.TRBLab, O = window.OrbitPhys, root = document.getElementById('orbits-lab');
  if (!root || !L || !O) return;
  var K = O.K, TAU = O.TAU, RE = K.R_EARTH, GME = K.GM_EARTH, DEG = Math.PI / 180, KAPPA = 0.05, SID = K.SIDEREAL_DAY;
  function $(id) { return document.getElementById(id); }
  var view = $('orbits-view'), cv = $('orbits-cv'), G = L.canvas(cv), ctx = G.c, store = L.store('orbits');
  var hudA = $('orbits-hud'), hudB = $('orbits-hud2'), actBtn = $('orbits-act'), readEl = $('orbits-read'), tipEl = $('orbits-tip');
  var chartBox = $('orbits-chartbox'), chartEl = $('orbits-chart'), CH = L.canvas(chartEl), chartCap = $('orbits-chart-cap');
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', ink: '#dbe7ef', muted: '#8fb3c6' };
  var SHOTC = [C.gold, C.green, C.pink, C.blue, C.red, C.violet];
  var reduced = L.reduced;

  /* ---------- numbers as text ---------- */
  function grp(s) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function num(v, d) { return grp(L.fmt(v, d)); }
  function km(m) { if (!isFinite(m)) return '—'; var k = m / 1000; return num(k, Math.abs(k) < 100 ? 1 : 0) + ' km'; }
  function kms(v) { return isFinite(v) ? num(v / 1000, 2) + ' km/s' : '—'; }
  function dur(t) {
    if (!isFinite(t)) return '—';
    var neg = t < 0, s; t = Math.abs(t);
    if (t < 59.5) s = Math.round(t) + ' s';
    else if (t < 3600) s = Math.floor(t / 60) + ' min ' + Math.floor(t % 60) + ' s';
    else if (t < 86400) s = Math.floor(t / 3600) + ' h ' + Math.floor(t % 3600 / 60) + ' min';
    else s = Math.floor(t / 86400) + ' d ' + Math.floor(t % 86400 / 3600) + ' h';
    return (neg ? '−' : '') + s;
  }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(v, d) {
    if (!isFinite(v) || v === 0) return '—';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; e++; }
    return L.fmt(m, d) + ' × 10' + String(e).split('').map(function (c) { return SUP[c]; }).join('');
  }
  function warpText(w) { return '×' + (w < 1e4 ? num(w, w < 10 ? 1 : 0) : w < 1e6 ? num(w / 1000, 0) + 'k' : num(w / 1e6, 1) + 'M'); }
  function wrap360(a) { a %= 360; return a < 0 ? a + 360 : a; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- state ---------- */
  var S = {
    scene: null, sys: null, c: null, alive: false, running: true, warp: 1000, rate: 0, capped: false,
    cam: { x: 0, y: 0, s: 1e-5, ox: 0, oy: 0, auto: true, ms: 1e-5, blend: 0 }, follow: 'auto',
    trail: [], tstep: 1e4, shots: [], shotN: 0, maxR: 0, setup: null, el: null,
    launchT: 0, launchEl: null, lapK: 0, lapT: 0, measT: NaN, sec: null, secCount: 0, areasOn: !!store.get('areas', false),
    arrowsOn: store.get('arrows', true) !== false, k3: [], fx: [], rel: {}, rot: false, drag: null,
    burned: false, armed: false, planT: null, pred: null, predAge: 0, predDirty: true, moonMin: Infinity, dir: 1, as: null, side: -1
  };
  var b0 = [0, 0], b1 = [0, 0], b2 = [0, 0];

  /* ---------- camera ---------- */
  function sx(x) { return G.w / 2 + (x - S.cam.x) * S.cam.s; }
  function sy(y) { return G.h / 2 - (y - S.cam.y) * S.cam.s; }
  function wx(px) { return S.cam.x + (px - G.w / 2) / S.cam.s; }
  function wy(py) { return S.cam.y - (py - G.h / 2) / S.cam.s; }
  var Q = [0, 0];
  /* In the rotating view (Moon scene), a point recorded at time t is turned so the Moon stays where it is now. */
  function rp(x, y, t, out) {
    if (!S.rot || !S.sys.w) { out[0] = x; out[1] = y; return out; }
    var a = S.sys.w * (S.c.t - t), c = Math.cos(a), s = Math.sin(a);
    out[0] = c * x - s * y; out[1] = s * x + c * y; return out;
  }
  function camUpdate(dt) {
    if (S.drag) return; // hold the view still while something is being dragged
    var f = S.scene.fit(), cam = S.cam, tx = f.x + cam.ox, ty = f.y + cam.oy;
    var ts = cam.auto ? Math.min(G.w, G.h) * 0.5 / f.r : cam.ms;
    ts = clamp(ts, S.scene.sMin, S.scene.sMax);
    var k = reduced ? 1 : 1 - Math.exp(-dt * 4);
    cam.s = Math.exp(Math.log(cam.s) + (Math.log(ts) - Math.log(cam.s)) * k);
    if (cam.blend > 0) { cam.blend -= dt; cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; } else { cam.x = tx; cam.y = ty; }
    S.tstep = 1.5 / cam.s;
  }
  function zoomBy(f, px, py) {
    var cam = S.cam; if (px === undefined) { px = G.w / 2; py = G.h / 2; }
    var X = wx(px), Y = wy(py), ns = clamp(cam.s * f, S.scene.sMin, S.scene.sMax);
    cam.auto = false; cam.ms = ns;
    cam.ox += X - (cam.x + (px - G.w / 2) / ns) ; cam.oy += Y - (cam.y - (py - G.h / 2) / ns);
    cam.x += X - (cam.x + (px - G.w / 2) / ns) ; cam.y += Y - (cam.y - (py - G.h / 2) / ns);
    cam.s = ns;
  }
  function fitView() { S.cam.auto = true; S.cam.ox = 0; S.cam.oy = 0; S.cam.blend = 0.8; }

  /* ---------- drawing helpers ---------- */
  var STARS = null;
  function makeStars() {
    var c = document.createElement('canvas'), w = Math.round(G.w * G.dpr), h = Math.round(G.h * G.dpr), g, i, seed = 7;
    c.width = w; c.height = h; g = c.getContext('2d');
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var neb = g.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, Math.max(w, h) * 0.7);
    neb.addColorStop(0, 'rgba(70,90,160,.13)'); neb.addColorStop(1, 'rgba(6,17,26,0)');
    g.fillStyle = '#06111a'; g.fillRect(0, 0, w, h); g.fillStyle = neb; g.fillRect(0, 0, w, h);
    var n = Math.round(w * h / (2600 * G.dpr * G.dpr));
    for (i = 0; i < n; i++) {
      var r = (0.35 + rnd() * rnd() * 1.2) * G.dpr, a = 0.25 + rnd() * 0.65, t = rnd();
      g.fillStyle = t < 0.08 ? 'rgba(255,212,121,' + a + ')' : t < 0.16 ? 'rgba(116,192,252,' + a + ')' : 'rgba(219,231,239,' + a + ')';
      g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, TAU); g.fill();
    }
    STARS = c;
  }
  function glowDot(x, y, r, col, glow) {
    if (glow) {
      var g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, col); g.addColorStop(0.25, col + '88'); g.addColorStop(1, col + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  function label(t, x, y, col, align, size) {
    ctx.font = (size || 12) + 'px system-ui,-apple-system,Segoe UI,sans-serif'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(6,17,26,.85)'; ctx.strokeText(t, x, y);
    ctx.fillStyle = col || C.muted; ctx.fillText(t, x, y);
  }
  /* Stylized continents and the Arctic, seen from above the North Pole: blobs given as [angle, distance] from the center. */
  var LAND = [[20, 0.62, 0.25], [108, 0.56, 0.3], [172, 0.8, 0.15], [236, 0.5, 0.21], [302, 0.72, 0.19], [64, 0.86, 0.09], [350, 0.38, 0.1]].map(function (b, i) {
    var pts = [], cx = b[1] * Math.cos(b[0] * DEG), cy = b[1] * Math.sin(b[0] * DEG), k, f, rr;
    for (k = 0; k < 36; k++) {
      f = TAU * k / 36; rr = b[2] * (1 + 0.24 * Math.sin(3 * f + i) + 0.14 * Math.sin(5 * f + 2 * i) + 0.08 * Math.cos(8 * f + i * 3));
      var x = cx + rr * Math.cos(f), y = cy + rr * Math.sin(f); pts.push([Math.atan2(y, x), Math.hypot(x, y)]);
    }
    return pts;
  });
  function drawEarth(x, y, r, spin) {
    if (r < 3) { glowDot(x, y, 3, '#4dabf7', true); return; }
    var g = ctx.createRadialGradient(x, y, r * 0.96, x, y, r * 1.2);
    g.addColorStop(0, 'rgba(116,192,252,.5)'); g.addColorStop(1, 'rgba(116,192,252,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.2, 0, TAU); ctx.fill();
    var o = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    o.addColorStop(0, '#4dabf7'); o.addColorStop(0.6, '#1971c2'); o.addColorStop(1, '#0b3a6b');
    ctx.fillStyle = o; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (r > 10 && r < 2e5) {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      ctx.fillStyle = 'rgba(105,219,124,.62)';
      LAND.forEach(function (pts) {
        ctx.beginPath();
        pts.forEach(function (p, i) { var a = p[0] + spin, X = x + p[1] * r * Math.cos(a), Y = y - p[1] * r * Math.sin(a); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
        ctx.fill();
      });
      var ice = ctx.createRadialGradient(x, y, 0, x, y, r * 0.24);
      ice.addColorStop(0, 'rgba(248,252,255,.9)'); ice.addColorStop(0.55, 'rgba(235,245,255,.55)'); ice.addColorStop(1, 'rgba(235,245,255,0)');
      ctx.fillStyle = ice; ctx.beginPath(); ctx.arc(x, y, r * 0.24, 0, TAU); ctx.fill();
      var sh = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.2, x, y, r * 1.05);
      sh.addColorStop(0, 'rgba(255,255,255,.12)'); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,30,.4)');
      ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      ctx.restore();
    }
  }
  function drawMoon(x, y, r) {
    if (r < 2.5) { glowDot(x, y, 2.5, '#ced4da', true); return; }
    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#f1f3f5'); g.addColorStop(0.7, '#adb5bd'); g.addColorStop(1, '#5c636a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (r > 8 && r < 2e5) {
      ctx.fillStyle = 'rgba(73,80,87,.35)';
      [[0.3, 0.2, 0.18], [-0.35, 0.1, 0.12], [0.05, -0.4, 0.15], [-0.15, 0.45, 0.08], [0.45, -0.25, 0.07]].forEach(function (k) { ctx.beginPath(); ctx.arc(x + k[0] * r, y + k[1] * r, k[2] * r, 0, TAU); ctx.fill(); });
    }
  }
  function drawSun(x, y, r) {
    var R = Math.max(r, 7), g = ctx.createRadialGradient(x, y, R * 0.5, x, y, R * 5);
    g.addColorStop(0, 'rgba(255,212,121,.55)'); g.addColorStop(1, 'rgba(255,212,121,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 5, 0, TAU); ctx.fill();
    var c = ctx.createRadialGradient(x - R * 0.2, y - R * 0.2, 0, x, y, R);
    c.addColorStop(0, '#fff9db'); c.addColorStop(0.6, '#ffd43b'); c.addColorStop(1, '#f59f00');
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
  }
  var PCOL = { Mercury: '#adb5bd', Venus: '#ffe066', Earth: '#4dabf7', Mars: '#ff8787' };
  function drawPlanet(name, x, y, r) {
    if (name === 'Earth' && r >= 3) return drawEarth(x, y, r, 0);
    var col = PCOL[name] || '#ced4da';
    if (r < 3) { glowDot(x, y, 3, col, true); return; }
    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#fff'); g.addColorStop(0.25, col); g.addColorStop(1, 'rgba(20,20,30,1)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  /* A polyline of points [x, y, t], fading towards the oldest end if fade is set. */
  function strokePath(pts, col, w, fade, dash, xf) {
    var n = pts.length; if (n < 2) return;
    ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    var chunks = fade ? Math.max(1, Math.min(14, Math.ceil(n / 16))) : 1, per = Math.ceil((n - 1) / chunks), c, i;
    for (c = 0; c < chunks; c++) {
      var i0 = c * per, i1 = Math.min(n - 1, (c + 1) * per); if (i1 <= i0) break;
      ctx.globalAlpha = fade ? 0.12 + 0.88 * Math.pow((c + 1) / chunks, 1.5) : 1;
      ctx.beginPath();
      for (i = i0; i <= i1; i++) {
        var p = pts[i], X, Y;
        if (xf) { xf(p, Q); X = Q[0]; Y = Q[1]; } else { rp(p[0], p[1], p[2], Q); X = sx(Q[0]); Y = sy(Q[1]); }
        if (i === i0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; if (dash) ctx.setLineDash([]);
  }
  /* The conic (ellipse or hyperbola) for elements el around a focus at screen point (fx, fy) with scale k px/m. */
  function conicPts(el, maxR) {
    var pts = [], i, n = 240, nu, r;
    if (el.e < 1) { for (i = 0; i <= n; i++) { nu = TAU * i / n; r = el.p / (1 + el.e * Math.cos(nu)); pts.push([r * Math.cos(el.w + nu), r * Math.sin(el.w + nu)]); } }
    else {
      var nm = Math.acos(-1 / el.e) - 1e-4;
      for (i = 0; i <= n; i++) { nu = -nm + 2 * nm * i / n; r = el.p / (1 + el.e * Math.cos(nu)); if (r < maxR) pts.push([r * Math.cos(el.w + nu), r * Math.sin(el.w + nu)]); }
    }
    return pts;
  }
  function drawConic(el, fx, fy, k, col, alpha, maxR) {
    var pts = conicPts(el, maxR); if (pts.length < 2) return;
    ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.setLineDash([6, 5]);
    ctx.beginPath();
    pts.forEach(function (p, i) { var X = fx + p[0] * k, Y = fy - p[1] * k; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  /* Markers for the lowest and highest points of an orbit around a body of radius R0. */
  function drawMarks(el, fx, fy, k, R0, maxR) {
    if (el.e > 0.004 && el.rp > R0) {
      var px = fx + el.rp * Math.cos(el.w) * k, py = fy - el.rp * Math.sin(el.w) * k;
      glowDot(px, py, 3.5, C.pink, false); label('lowest ' + km(el.rp - R0), px > G.w * 0.6 ? px - 8 : px + 8, py - 10, C.pink, px > G.w * 0.6 ? 'right' : 'left', 11);
      if (el.e < 1 && el.ra < maxR) {
        var ax = fx - el.ra * Math.cos(el.w) * k, ay = fy + el.ra * Math.sin(el.w) * k;
        glowDot(ax, ay, 3.5, C.blue, false); label('highest ' + km(el.ra - R0), ax > G.w * 0.6 ? ax - 8 : ax + 8, ay - 10, C.blue, ax > G.w * 0.6 ? 'right' : 'left', 11);
      }
    }
  }
  function arrow(x, y, dx, dy, col, w, txt) {
    var L2 = Math.hypot(dx, dy); if (L2 < 4) return;
    var ux = dx / L2, uy = dy / L2, hx = x + dx, hy = y + dy, hs = Math.min(10, L2 * 0.4);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(hx - ux * hs * 0.6, hy - uy * hs * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - ux * hs - uy * hs * 0.55, hy - uy * hs + ux * hs * 0.55); ctx.lineTo(hx - ux * hs + uy * hs * 0.55, hy - uy * hs - ux * hs * 0.55); ctx.closePath(); ctx.fill();
    if (txt) label(txt, hx + ux * 10, hy + uy * 10, col, ux < -0.3 ? 'right' : 'left', 11);
  }
  function craftDot(x, y, col) {
    glowDot(x, y, 4, col || C.green, true);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fill();
  }
  /* Velocity (green) and gravity (pink) arrows on the craft. */
  function forceArrows(px, py, vx, vy, vlen) {
    if (!S.arrowsOn || !S.c || S.c.hit >= 0) return;
    for (var i = 0; i < S.sys.bodies.length; i++) {
      var b = S.sys.bodies[i]; O.posAt(b, S.c.t, b2);
      if (b.r * S.cam.s < 6 && Math.hypot(sx(b2[0]) - px, sy(b2[1]) - py) < 18) return;
    }
    var F = O.field(S.sys, S.c.x, S.c.y, 0, 0, S.c.t, {}), a = Math.hypot(F.ax, F.ay), v = Math.hypot(vx, vy);
    if (a > 0) arrow(px, py, F.ax / a * 34, -F.ay / a * 34, C.pink, 2, 'gravity');
    if (v > 0 && vlen !== 0) { var Lv = vlen || 40; arrow(px, py, vx / v * Lv, -vy / v * Lv, C.green, 2.2, S.scene.key === 'orbit' ? null : 'velocity'); }
  }
  function effects(now) {
    S.fx = S.fx.filter(function (f) { return now - f.t0 < f.life; });
    S.fx.forEach(function (f) {
      var u = (now - f.t0) / f.life, X = sx(f.x), Y = sy(f.y);
      if (f.kind === 'boom') {
        ctx.globalAlpha = 1 - u; ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(X, Y, 4 + 26 * u, 0, TAU); ctx.stroke();
        if (!reduced) { ctx.fillStyle = C.red; for (var i = 0; i < 8; i++) { var a = i * TAU / 8 + 0.3; ctx.beginPath(); ctx.arc(X + Math.cos(a) * 30 * u, Y + Math.sin(a) * 30 * u, 1.8, 0, TAU); ctx.fill(); } }
        ctx.globalAlpha = 1;
      } else if (f.kind === 'burn') {
        var c = S.c; if (!c) return; X = sx(c.x); Y = sy(c.y);
        var Lf = 26 * (1 - u) + 6, ux = -f.dx, uy = f.dy;
        var g = ctx.createRadialGradient(X, Y, 0, X, Y, Lf);
        g.addColorStop(0, 'rgba(255,240,200,.95)'); g.addColorStop(0.5, 'rgba(255,135,135,.6)'); g.addColorStop(1, 'rgba(255,135,135,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X, Y);
        ctx.lineTo(X + ux * Lf - uy * Lf * 0.35, Y + uy * Lf + ux * Lf * 0.35); ctx.lineTo(X + ux * Lf + uy * Lf * 0.35, Y + uy * Lf - ux * Lf * 0.35); ctx.closePath(); ctx.fill();
      }
    });
  }
  function offscreen(x, y, col, txt) {
    if (x > -8 && x < G.w + 8 && y > -8 && y < G.h + 8) return;
    var cx = G.w / 2, cy = G.h / 2, dx = x - cx, dy = y - cy, m = 22;
    var f = Math.min((G.w / 2 - m) / Math.abs(dx || 1e-9), (G.h / 2 - m) / Math.abs(dy || 1e-9)), X = cx + dx * f, Y = cy + dy * f, a = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(X, Y); ctx.rotate(a); ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill(); ctx.restore();
    label(txt, X - Math.cos(a) * 16, Y - Math.sin(a) * 16 + (Math.sin(a) > 0 ? -6 : 6), col, Math.cos(a) > 0.3 ? 'right' : Math.cos(a) < -0.3 ? 'left' : 'center', 11);
  }

  /* ---------- stepping ---------- */
  function onSub(s, x0, y0, t0) {
    var tr = S.trail, l;
    if (tr) { l = tr[tr.length - 1]; if (!l || Math.abs(s.x - l[0]) + Math.abs(s.y - l[1]) > S.tstep) { tr.push([s.x, s.y, s.t]); if (tr.length > 5000) tr.shift(); } }
    if (S.lapOn) {
      var k = Math.floor(Math.abs(s.ang) / TAU);
      if (k > S.lapK) {
        var d = Math.atan2(x0 * s.y - y0 * s.x, x0 * s.x + y0 * s.y), a0 = Math.abs(s.ang - d), a1 = Math.abs(s.ang);
        var tc = t0 + (k * TAU - a0) / ((a1 - a0) || 1) * (s.t - t0);
        S.measT = tc - (S.lapK === 0 ? S.launchT : S.lapT); S.lapT = tc; S.lapK = k; lapDone();
      }
    }
    if (S.sec) { var cu = S.sec.cur.pts; l = cu[cu.length - 1]; if (Math.abs(s.x - l[0]) + Math.abs(s.y - l[1]) > S.tstep * 2) cu.push([s.x, s.y]); }
    if (S.scene.sub) S.scene.sub(s);
  }
  function advance(dt) {
    var c = S.c; if (!c || !S.alive) { S.rate = 0; return; }
    var cap = c.hit < 0 ? KAPPA * O.timescale(S.sys, c.x, c.y, c.t) * 60 : S.warp;
    S.rate = Math.min(S.warp, cap); S.capped = S.warp > cap * 1.02;
    var tEnd = c.t + S.rate * dt, guard = 0;
    while (c.t < tEnd - 1e-6 && guard++ < 40) {
      var tn = tEnd;
      if (S.sec && S.sec.next < tn) tn = S.sec.next;
      if (S.planT !== null && S.planT >= c.t && S.planT < tn) tn = S.planT;
      var wasHit = c.hit >= 0;
      O.step(S.sys, c, tn - c.t, onSub);
      if (!wasHit && c.hit >= 0) { onHit(); if (!S.alive) return; }
      if (S.sec && c.t >= S.sec.next - 1e-6) closeSector();
      if (S.planT !== null && c.t >= S.planT - 1e-6) { S.planT = null; doBurn(); }
    }
  }
  function onHit() {
    var c = S.c, b = S.sys.bodies[c.hit];
    S.fx.push({ kind: 'boom', x: c.x, y: c.y, t0: performance.now(), life: 1000 });
    S.sec = null; S.lapOn = false;
    if (S.scene.hit) S.scene.hit(b);
  }
  /* Orbit bookkeeping for the cannon and Earth-orbit scenes: laps, measured period, equal-area slices. */
  function track() {
    var c = S.c; c.ang = 0; c.area = 0;
    S.launchT = c.t; S.lapK = 0; S.lapT = c.t; S.measT = NaN; S.lapOn = true;
    S.launchEl = O.elements(GME, c.x, c.y, c.vx, c.vy);
    S.sec = null; S.secDone = []; S.secCount = 0;
    if (S.areasOn && S.scene.key === 'orbit') startSectors();
  }
  function startSectors() {
    var c = S.c, el = O.elements(GME, c.x, c.y, c.vx, c.vy);
    S.secDone = []; S.secCount = 0;
    if (!el.bound || c.hit >= 0 || el.T > 400 * 86400) { S.sec = null; return; }
    S.sec = { dt: el.T / 12, next: c.t + el.T / 12, cur: { pts: [[c.x, c.y]], a0: c.area }, e: el.e };
  }
  function closeSector() {
    var c = S.c, sec = S.sec; sec.cur.pts.push([c.x, c.y]);
    S.secDone.push({ pts: sec.cur.pts, area: Math.abs(c.area - sec.cur.a0) }); if (S.secDone.length > 12) S.secDone.shift();
    S.secCount++; sec.cur = { pts: [[c.x, c.y]], a0: c.area }; sec.next += sec.dt;
    if (S.secCount >= 12 && sec.e >= 0.5) win('areas', 'Equal areas! Thin and fast near Earth, wide and slow far out: every slice has the same area.');
  }
  function lapDone() {
    var el = S.launchEl;
    if (S.scene.key === 'cannon' && S.lapK >= 1) win('around', 'Around the world! The ball is still falling, but the ground curves away just as fast.');
    if (S.lapK === 1 && el && el.bound) {
      var a = el.a, T = S.measT;
      S.k3 = S.k3.filter(function (p) { return Math.abs(p.a - a) / a > 0.01; }); S.k3.push({ a: a, T: T }); if (S.k3.length > 10) S.k3.shift();
      var lo = S.k3[0], hi = S.k3[0];
      S.k3.forEach(function (p) { if (p.a < lo.a) lo = p; if (p.a > hi.a) hi = p; });
      if (hi.a / lo.a >= 2) {
        var ra = hi.a / lo.a, rT = hi.T / lo.T;
        win('kepler3', 'Kepler’s third law: the orbit is ' + num(ra, 2) + '× as big, the period ' + num(rT, 2) + '× as long (' + num(ra, 2) + '^1.5 = ' + num(Math.pow(ra, 1.5), 2) + ').');
      }
    }
  }

  /* ---------- the four scenes ---------- */
  function val(id) { return parseFloat($(id).value); }
  /* The exact value of a slider + number pair (the number box can hold more digits than the slider). */
  function get(id) { var n = $(id + '-n'), x = n ? parseFloat(n.value) : NaN; return isFinite(x) ? x : toNum(id, val(id)); }

  var cannon = {
    key: 'cannon', name: 'Newton’s cannon', warp: 200, sMin: 1e-8, sMax: 2e-2, btn: '🔥 Fire',
    tip: 'Set a speed and fire the cannon sideways from the mountain top. Slow shots fall back; fast ones fall around Earth. Air is left out.',
    init: function () {
      S.sys = O.earthOnly(); S.shots = []; S.c = null; S.alive = false; S.trail = null; S.maxR = 0; S.sec = null; S.lapOn = false;
      cannon.note();
    },
    h: function () { return get('orbits-h') * 1000; },
    fire: function () {
      var h = cannon.h(), v = get('orbits-v') * 1000, shot = { trail: [[0, RE + h, 0]], col: SHOTC[S.shotN++ % SHOTC.length] };
      S.shots.push(shot); if (S.shots.length > 6) S.shots.shift(); S.maxR = 0;
      S.c = O.state(0, RE + h, v, 0, 0); S.trail = shot.trail; S.alive = true; S.running = true; syncPlay();
      track();
    },
    act: function () { cannon.fire(); },
    note: function () {
      var r = RE + cannon.h();
      $('orbits-cannon-note').textContent = 'At the top of the mountain, a circle around Earth needs ' + kms(O.circularSpeed(GME, r)) + ', and escaping needs ' + kms(O.escapeSpeed(GME, r)) + '.';
    },
    hit: function () {
      var c = S.c; S.alive = false;
      var ang = Math.atan2(c.hx, c.hy); if (ang < 0) ang += TAU; ang += S.lapK * TAU;
      S.shots[S.shots.length - 1].land = { x: c.x, y: c.y, d: ang * RE, t: c.hitT };
    },
    fit: function () {
      var r = (RE + cannon.h()) * 1.22, c = S.c;
      if (c) { var d = Math.hypot(c.x, c.y); S.maxR = Math.max(S.maxR, d); }
      return { x: 0, y: 0, r: Math.min(Math.max(r, S.maxR * 1.12), 45 * RE) };
    },
    grab: function (x, y) { var h = cannon.h(); return Math.hypot(x - sx(0), y - sy(RE + h)) < 26 ? 'cannon' : null; },
    tap: function (what) { if (what === 'cannon') cannon.fire(); },
    keys: function (k, big) { if (k === 'ArrowUp' || k === 'ArrowDown') { nudge('orbits-v', (k === 'ArrowUp' ? 1 : -1) * (big ? 0.1 : 0.01)); return true; } },
    draw: function () {
      var h = cannon.h(), k = S.cam.s, X0 = sx(0), Y0 = sy(0);
      S.shots.forEach(function (sh, i) {
        var cur = i === S.shots.length - 1;
        strokePath(sh.trail, sh.col, cur ? 2.4 : 1.6, cur, null);
        if (cur && S.c && S.alive) { var tr = sh.trail, l = tr[tr.length - 1]; ctx.strokeStyle = sh.col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(sx(l[0]), sy(l[1])); ctx.lineTo(sx(S.c.x), sy(S.c.y)); ctx.stroke(); }
      });
      drawEarth(X0, Y0, RE * k, 0);
      // the mountain, to scale
      var hp = h * k;
      if (hp > 2) {
        var beta = Math.min(0.5, 1.4 * h / RE), n = 14, i, pts = [];
        for (i = 0; i <= n; i++) {
          var u = i / n, a = -beta + 2 * beta * u, top = Math.pow(1 - Math.abs(2 * u - 1), 1.35), rr = RE + h * top * (0.9 + 0.1 * Math.cos(u * 23)) - 2e3;
          if (i === n / 2) rr = RE + h;
          pts.push([sx(rr * Math.sin(a)), sy(rr * Math.cos(a))]);
        }
        var g = ctx.createLinearGradient(0, sy(RE + h), 0, sy(RE));
        g.addColorStop(0, '#f1f3f5'); g.addColorStop(0.22, '#ced4da'); g.addColorStop(0.24, '#868e96'); g.addColorStop(1, '#495057');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx(RE * Math.sin(-beta) * 0.98), sy(RE * Math.cos(beta) * 0.98));
        pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); });
        ctx.lineTo(sx(RE * Math.sin(beta) * 0.98), sy(RE * Math.cos(beta) * 0.98)); ctx.closePath(); ctx.fill();
      }
      // the cannon
      var cx = sx(0), cy = sy(RE + h);
      ctx.save(); ctx.translate(cx, cy);
      ctx.fillStyle = '#8d5b3a'; ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-11, -7); ctx.lineTo(2, -7); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill();
      var bg = ctx.createLinearGradient(0, -13, 0, -5); bg.addColorStop(0, '#adb5bd'); bg.addColorStop(1, '#343a40');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-14, -12.5); ctx.lineTo(10, -11); ctx.lineTo(10, -6); ctx.lineTo(-14, -4.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.gold; ctx.fillRect(8, -11.5, 3, 6); ctx.fillRect(-9, -12, 2, 7.2);
      ctx.fillStyle = '#5c3d2e'; ctx.strokeStyle = '#d9a066'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-5, -1.5, 3.6, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.restore();
      S.shots.forEach(function (sh) { if (sh.land) { var X = sx(sh.land.x), Y = sy(sh.land.y); ctx.strokeStyle = sh.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - 4, Y - 4); ctx.lineTo(X + 4, Y + 4); ctx.moveTo(X + 4, Y - 4); ctx.lineTo(X - 4, Y + 4); ctx.stroke(); } });
      if (S.c && S.alive) { var px = sx(S.c.x), py = sy(S.c.y); glowDot(px, py, 4, S.shots[S.shots.length - 1].col, true); forceArrows(px, py, S.c.vx, S.c.vy); offscreen(px, py, C.gold, 'cannonball'); }
      if (!S.shots.length) label('Tap the cannon or press Fire', cx, cy - 26, C.gold, 'center', 12);
    },
    rows: [['t', 'Flight time'], ['v', 'Speed'], ['alt', 'Height'], ['grd', 'Distance over the ground'], ['res', 'What happened'], ['T', 'Time for one lap']],
    read: function () {
      var c = S.c;
      if (!c) return { t: '—', v: '—', alt: '—', grd: '—', res: 'Not fired yet', T: '—' };
      var r = Math.hypot(c.x, c.y), sh = S.shots[S.shots.length - 1], ang = Math.abs(c.ang), el = S.el, res;
      if (sh.land) res = 'Landed ' + km(sh.land.d) + ' away';
      else if (el.energy >= 0) res = 'Escaping Earth';
      else if (S.lapK > 0) res = 'In orbit, ' + S.lapK + (S.lapK > 1 ? ' laps' : ' lap');
      else res = el.rp < RE ? 'Falling (will land)' : 'Falling around Earth';
      return { t: dur(c.t), v: kms(Math.hypot(c.vx, c.vy)), alt: km(r - RE), grd: sh.land ? km(sh.land.d) : km(ang * RE), res: res, T: isFinite(S.measT) ? dur(S.measT) : '—' };
    },
    hud: function () { var c = S.c; return c && S.alive ? 'speed ' + kms(Math.hypot(c.vx, c.vy)) + ' · height ' + km(Math.hypot(c.x, c.y) - RE) : (c ? 'landed after ' + dur(c.hitT) : 'ready to fire'); }
  };

  var orbit = {
    key: 'orbit', name: 'Earth orbit', warp: 1000, sMin: 1e-8, sMax: 2e-2, btn: '◯ Circular',
    tip: 'Drag the satellite to move it. Drag the tip of its green arrow to aim and set its speed. The dashed line is the orbit you’ll get.',
    init: function () { S.sys = O.earthOnly(); readSetup(); orbit.launch(); },
    launch: function () {
      var su = S.setup, r = RE + su.alt, th = su.th, g = su.gam, tx = -Math.sin(th), ty = Math.cos(th), rx = Math.cos(th), ry = Math.sin(th);
      S.c = O.state(r * rx, r * ry, su.v * (Math.cos(g) * tx + Math.sin(g) * rx), su.v * (Math.cos(g) * ty + Math.sin(g) * ry), 0);
      S.trail = []; S.alive = true; S.spin0 = th; S.cam.blend = 0.7; S.el = O.elements(GME, S.c.x, S.c.y, S.c.vx, S.c.vy); track();
    },
    act: function () { setSetup({ v: O.circularSpeed(GME, RE + S.setup.alt), gam: 0 }); },
    /* Frame the whole ellipse (centered on its middle, not on Earth); an escaping path is followed out to 70 Earth radii. */
    fit: function () {
      var c = S.c, el = S.el;
      if (S.drag || !el) el = O.elements(GME, c.x, c.y, c.vx, c.vy);
      if (el.bound && el.ra < 70 * RE && c.hit < 0) {
        var ce = -el.a * el.e; return { x: ce * Math.cos(el.w), y: ce * Math.sin(el.w), r: Math.max(el.a * 1.15, RE * 1.4) };
      }
      return { x: 0, y: 0, r: Math.max((RE + S.setup.alt) * 1.25, Math.min(Math.hypot(c.x, c.y), 70 * RE) * 1.12) };
    },
    ARW: 13,
    grab: function (x, y) {
      var c = S.c; if (!c) return null;
      var px = sx(c.x), py = sy(c.y), v = Math.hypot(c.vx, c.vy), L2 = v / 1000 * orbit.ARW;
      var hit = v > 0 && Math.hypot(x - (px + c.vx / v * L2), y - (py - c.vy / v * L2)) < 24 ? 'arrow' : Math.hypot(x - px, y - py) < 24 ? 'sat' : null;
      if (hit) orbit.adopt();
      return hit;
    },
    /* Grabbing the satellite starts a new launch from where it is now, with its present speed and direction. */
    adopt: function () {
      var c = S.c; if (c.hit >= 0) return;
      var th = Math.atan2(c.y, c.x), tx = -Math.sin(th), ty = Math.cos(th);
      S.setup = { th: th, alt: Math.hypot(c.x, c.y) - RE, v: Math.hypot(c.vx, c.vy), gam: Math.atan2(c.vx * Math.cos(th) + c.vy * Math.sin(th), c.vx * tx + c.vy * ty) };
      writeSetup(); orbit.launch();
    },
    drag: function (what, x, y) {
      var su = S.setup, c = S.c;
      if (what === 'sat') { var X = wx(x), Y = wy(y); setSetup({ th: Math.atan2(Y, X), alt: clamp(Math.hypot(X, Y) - RE, 0, 1e9) }, true); }
      else {
        var dx = (x - sx(c.x)) / orbit.ARW * 1000, dy = -(y - sy(c.y)) / orbit.ARW * 1000, th = su.th;
        var tv = dx * -Math.sin(th) + dy * Math.cos(th), rv = dx * Math.cos(th) + dy * Math.sin(th);
        setSetup({ v: clamp(Math.hypot(dx, dy), 0, 15000), gam: Math.atan2(rv, tv) }, true);
      }
    },
    release: function () { orbit.launch(); },
    keys: function (k, big) {
      if (k === 'ArrowUp' || k === 'ArrowDown') { setSetup({ v: clamp(S.setup.v + (k === 'ArrowUp' ? 1 : -1) * (big ? 100 : 10), 0, 15000) }); return true; }
      if (k === 'ArrowLeft' || k === 'ArrowRight') { setSetup({ gam: S.setup.gam + (k === 'ArrowLeft' ? 1 : -1) * (big ? 10 : 1) * DEG }); return true; }
    },
    sub: null,
    draw: function () {
      var c = S.c, k = S.cam.s, X0 = sx(0), Y0 = sy(0), spin = (S.spin0 || 0) + TAU * c.t / SID;
      // equal-area slices
      if (S.sec) {
        var all = S.secDone.concat([{ pts: S.sec.cur.pts.concat([[c.x, c.y]]), cur: true }]);
        all.forEach(function (sc, i) {
          var idx = S.secCount - S.secDone.length + i;
          ctx.fillStyle = idx % 2 ? 'rgba(116,192,252,.2)' : 'rgba(255,212,121,.2)';
          ctx.beginPath(); ctx.moveTo(X0, Y0); sc.pts.forEach(function (p) { ctx.lineTo(sx(p[0]), sy(p[1])); }); ctx.closePath(); ctx.fill();
          if (!sc.cur && sc.pts.length > 1) {
            var m = sc.pts[Math.floor(sc.pts.length / 2)], lx = X0 + (sx(m[0]) - X0) * 0.62, ly = Y0 + (sy(m[1]) - Y0) * 0.62;
            if (Math.hypot(sx(m[0]) - X0, sy(m[1]) - Y0) > RE * k * 1.6) label(num(sc.area / 1e12, 1), lx, ly, idx % 2 ? C.blue : C.gold, 'center', 11);
          }
        });
      }
      strokePath(S.trail, C.green, 2, true);
      var el = O.elements(GME, c.x, c.y, c.vx, c.vy);
      if (c.hit < 0) drawConic(el, X0, Y0, k, C.gold, S.drag ? 0.95 : 0.6, 80 * RE);
      drawEarth(X0, Y0, RE * k, spin);
      if (c.hit < 0) drawMarks(el, X0, Y0, k, RE, 80 * RE);
      // a spot on the equator that turns with Earth (it starts under the launch point)
      if (RE * k > 12) { var spx = X0 + RE * k * 0.97 * Math.cos(spin), spy = Y0 - RE * k * 0.97 * Math.sin(spin); glowDot(spx, spy, 3, C.gold, false); }
      var px = sx(c.x), py = sy(c.y);
      if (c.hit >= 0) { label('crashed', px + 8, py, C.red); return; }
      forceArrows(px, py, c.vx, c.vy, 0);
      var v = Math.hypot(c.vx, c.vy), L2 = v / 1000 * orbit.ARW;
      if (v > 0) {
        arrow(px, py, c.vx / v * L2, -c.vy / v * L2, C.green, 2.4);
        var hx = px + c.vx / v * L2, hy = py - c.vy / v * L2;
        ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
        label(kms(v), hx + 14, hy - 12, C.green, 'left', 11);
      }
      craftDot(px, py, C.gold);
      offscreen(px, py, C.gold, 'satellite');
    },
    rows: [['t', 'Time'], ['v', 'Speed'], ['alt', 'Height'], ['pe', 'Lowest point'], ['ap', 'Highest point'], ['e', 'Eccentricity e'], ['a', 'Semi-major axis a'],
      ['T', 'Period (Kepler)'], ['Tm', 'Period (measured)'], ['k3', 'T² ÷ a³'], ['E', 'Energy per kg'], ['sl', 'Last slices']],
    read: function () {
      var c = S.c, el = S.el, r = Math.hypot(c.x, c.y);
      var sl = S.secDone && S.secDone.length ? S.secDone.slice(-3).map(function (s) { return num(s.area / 1e12, 2); }).join(' · ') + ' million km²' : (S.areasOn ? 'filling…' : 'turn on slices');
      if (c.hit >= 0) return { t: dur(c.hitT - S.launchT), v: 'crashed', alt: '0 km', pe: '—', ap: '—', e: '—', a: '—', T: '—', Tm: '—', k3: '—', E: '—', sl: '—' };
      return {
        t: dur(c.t - S.launchT), v: kms(Math.hypot(c.vx, c.vy)), alt: km(r - RE), pe: el.rp < RE ? 'inside Earth: crash' : km(el.rp - RE), ap: el.bound ? km(el.ra - RE) : 'none (escapes)',
        e: L.fmt(el.e, 3), a: el.bound ? km(el.a) : '—', T: el.bound ? dur(el.T) : '—', Tm: isFinite(S.measT) ? dur(S.measT) : 'after one lap',
        k3: el.bound ? sci(el.T * el.T / Math.pow(el.a / 1000, 3), 3) + ' s²/km³' : '—', E: num(el.energy / 1e6, 2) + ' MJ/kg', sl: sl
      };
    },
    hud: function () { var c = S.c; return c.hit >= 0 ? 'crashed into Earth' : 'speed ' + kms(Math.hypot(c.vx, c.vy)) + ' · height ' + km(Math.hypot(c.x, c.y) - RE); }
  };

  var moon = {
    key: 'moon', name: 'Trip to the Moon', warp: 600, sMin: 2e-10, sMax: 5e-3, btn: '🔥 Burn now', ph0: 3.5,
    tip: 'You’re in a parking orbit 200 km up. Drag the gold burn marker in the close-up (or use the slider) until the dashed path reaches the Moon, then press “Burn at the marker”.',
    follows: [['auto', 'Earth and Moon'], ['earth', 'Earth'], ['moon', 'Moon'], ['craft', 'Spacecraft']],
    init: function () {
      S.sys = O.earthMoon(moon.ph0); var b = S.sys.bodies;
      O.posAt(b[0], 0, b0); O.velAt(b[0], 0, b1);
      var r = RE + 200e3, vc = O.circularSpeed(GME, r), th = moon.ph0 - 160 * DEG;
      S.c = O.state(b0[0] + r * Math.cos(th), b0[1] + r * Math.sin(th), b1[0] - vc * Math.sin(th), b1[1] + vc * Math.cos(th), 0);
      S.alive = true; S.trail = []; S.burned = false; S.armed = false; S.planT = null; S.moonMin = Infinity; S.pred = null; S.predDirty = true;
      S.rel = { 0: [], 1: [] }; S.soiM = O.soi(K.GM_MOON, K.D_MOON, GME); S.lapOn = false; S.sec = null; S.tBurn = null;
      moon.ui();
    },
    ui: function () {
      $('orbits-arm').textContent = S.armed ? 'Cancel the planned burn' : 'Burn at the marker';
      $('orbits-arm').disabled = S.burned; $('orbits-ph').disabled = S.burned; $('orbits-ph-n').disabled = S.burned;
    },
    refBody: function () { var b = S.sys.bodies[1], c = S.c; O.posAt(b, c.t, b2); return Math.hypot(c.x - b2[0], c.y - b2[1]) < S.soiM ? 1 : 0; },
    phase: function (s) {
      var bs = S.sys.bodies; O.posAt(bs[0], s.t, b0); O.posAt(bs[1], s.t, b1);
      return wrap360((Math.atan2(b1[1] - b0[1], b1[0] - b0[0]) - Math.atan2(s.y - b0[1], s.x - b0[0])) / DEG);
    },
    wait: function (s, target) {
      var bs = S.sys.bodies; O.posAt(bs[0], s.t, b0); O.velAt(bs[0], s.t, b1);
      var rx = s.x - b0[0], ry = s.y - b0[1], n = (rx * (s.vy - b1[1]) - ry * (s.vx - b1[0])) / (rx * rx + ry * ry), rate = (n - S.sys.w) / DEG;
      if (rate <= 0) return null;
      return wrap360(moon.phase(s) - target) / rate;
    },
    target: function () { return get('orbits-ph'); },
    dv: function () { return get('orbits-dv') * 1000; },
    act: function () { doBurn(); },
    arm: function () {
      if (S.burned) return;
      if (S.armed) { S.armed = false; S.planT = null; }
      else { var w = moon.wait(S.c, moon.target()); if (w === null) return; S.armed = true; S.planT = S.c.t + w; S.running = true; syncPlay(); }
      S.predDirty = true; moon.ui();
    },
    burnDone: function (dv) {
      S.burned = true; S.armed = false; S.planT = null; S.tBurn = S.c.t; moon.ui();
      if (dv >= 1000 && moon.refBody() === 0 && S.warp < 20000) setWarp(20000);
    },
    sub: function (s) {
      var bs = S.sys.bodies, i, R = moon.insetR;
      for (i = 0; i < 2; i++) {
        O.posAt(bs[i], s.t, b0); var dx = s.x - b0[0], dy = s.y - b0[1], d = Math.hypot(dx, dy);
        if (i === 1 && d < S.moonMin) S.moonMin = d;
        if (d < R[i] * 1.5) { var a = S.rel[i], l = a[a.length - 1]; if (!l || Math.hypot(dx - l[0], dy - l[1]) > R[i] / 90) { a.push([dx, dy, s.t]); if (a.length > 2500) a.shift(); } }
      }
    },
    insetR: [15e6, 22e6],
    hit: function (b) { S.lapOn = false; if (b.name === 'Moon') win('moon', 'You reached the Moon, by landing on it the hard way, after ' + dur(S.c.t - (S.tBurn || 0)) + '.'); },
    predict: function () {
      var c = S.c, sys = S.sys, bs = sys.bodies; S.predDirty = false; S.predAge = 0;
      if (c.hit >= 0) { S.pred = null; return; }
      var s = O.copy(c), plan = !S.burned, tB = null, bp = null;
      if (plan) {
        var w = S.armed ? S.planT - c.t : moon.wait(c, moon.target());
        if (w === null) { S.pred = null; return; }
        O.step(sys, s, Math.max(0, w)); if (s.hit >= 0) { S.pred = null; return; }
        tB = s.t; burnOn(s, moon.dv(), S.dir, 0); bp = [s.x, s.y, s.t];
      }
      var pts = [[s.x, s.y, s.t]], last = pts[0], dmin = Infinity, tmin = s.t, tEnd = s.t + (plan ? 9 : 7) * 86400, M = [0, 0], E = [0, 0];
      var on = function (st) {
        O.posAt(bs[1], st.t, M); O.posAt(bs[0], st.t, E);
        var dM = Math.hypot(st.x - M[0], st.y - M[1]), dE = Math.hypot(st.x - E[0], st.y - E[1]);
        if (dM < dmin) { dmin = dM; tmin = st.t; }
        if (Math.hypot(st.x - last[0], st.y - last[1]) > Math.max(1.2e5, 0.012 * Math.min(dE, dM))) { last = [st.x, st.y, st.t]; pts.push(last); }
      };
      while (s.t < tEnd && s.hit < 0) {
        O.step(sys, s, Math.min(4 * 3600, tEnd - s.t), on);
        O.posAt(bs[0], s.t, E); if (Math.hypot(s.x - E[0], s.y - E[1]) > 1.3e9) break;
      }
      pts.push([s.x, s.y, s.t]);
      S.pred = { pts: pts, tB: tB, bp: bp, dmin: dmin, tmin: tmin, hit: s.hit, moonAt: O.posAt(bs[1], tmin, [0, 0]) };
    },
    fit: function () {
      var bs = S.sys.bodies, c = S.c, f = S.follow;
      if (f === 'earth') { O.posAt(bs[0], c.t, b0); return { x: b0[0], y: b0[1], r: 6e7 }; }
      if (f === 'moon') { O.posAt(bs[1], c.t, b0); return { x: b0[0], y: b0[1], r: 4e7 }; }
      if (f === 'craft') return { x: c.x, y: c.y, r: 6e7 };
      return { x: 0, y: 0, r: 4.45e8 };
    },
    grab: function (x, y) { var I = inset(); if (I && !S.burned && I.bi === 0 && Math.hypot(x - I.cx, y - I.cy) < I.R + 4) return 'node'; return null; },
    drag: function (what, x, y) {
      var I = inset(); if (!I) return;
      var a = Math.atan2(-(y - I.cy), x - I.cx), bs = S.sys.bodies, t = S.planT !== null ? S.planT : S.c.t;
      O.posAt(bs[0], t, b0); O.posAt(bs[1], t, b1);
      var ph = Math.round(wrap360((Math.atan2(b1[1] - b0[1], b1[0] - b0[0]) - a) / DEG));
      setVal('orbits-ph', ph); moon.retarget();
    },
    tap: function (what, x, y) { if (what === 'node') moon.drag(what, x, y); },
    retarget: function () { if (S.armed) { S.armed = false; S.planT = null; moon.arm(); } S.predDirty = true; },
    keys: function (k, big) {
      if ((k === 'ArrowLeft' || k === 'ArrowRight') && !S.burned) { setVal('orbits-ph', wrap360(val('orbits-ph') + (k === 'ArrowLeft' ? 1 : -1) * (big ? 10 : 1))); moon.retarget(); return true; }
      if (k === 'ArrowUp' || k === 'ArrowDown') { nudge('orbits-dv', (k === 'ArrowUp' ? 1 : -1) * (big ? 0.1 : 0.01)); S.predDirty = true; return true; }
    },
    insetFor: function () {
      var bs = S.sys.bodies, c = S.c;
      O.posAt(bs[1], c.t, b0); if (Math.hypot(c.x - b0[0], c.y - b0[1]) < 7e7 || c.hit === 1) return { bi: 1, R: moon.insetR[1], title: 'Close-up: the Moon' };
      O.posAt(bs[0], c.t, b0); if (Math.hypot(c.x - b0[0], c.y - b0[1]) < 6e7 || !S.burned) return { bi: 0, R: moon.insetR[0], title: 'Close-up: Earth' };
      return null;
    },
    draw: function () {
      var bs = S.sys.bodies, c = S.c, k = S.cam.s, i, D = (1 - S.sys.mu) * K.D_MOON;
      ctx.strokeStyle = 'rgba(143,179,198,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx(0), sy(0), D * k, 0, TAU); ctx.stroke();
      if (S.pred) {
        strokePath(S.pred.pts, S.burned ? C.gold : C.gold, 1.6, false, [7, 6]);
        if (!S.rot && S.pred.dmin < 1.5e8) { var mx = sx(S.pred.moonAt[0]), my = sy(S.pred.moonAt[1]); ctx.strokeStyle = 'rgba(206,212,218,.6)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(mx, my, Math.max(K.R_MOON * k, 5), 0, TAU); ctx.stroke(); ctx.setLineDash([]); label('Moon then', mx + 10, my + 14, C.muted, 'left', 11); }
      }
      strokePath(S.trail, C.green, 2, true);
      var ref = moon.refBody(); O.posAt(bs[ref], c.t, b0); O.velAt(bs[ref], c.t, b1);
      var el = O.elements(bs[ref].gm, c.x - b0[0], c.y - b0[1], c.vx - b1[0], c.vy - b1[1]);
      if (!S.rot && c.hit < 0 && el.bound && el.ra < 6e8 && el.a * k > 20) drawConic(el, sx(b0[0]), sy(b0[1]), k, C.blue, 0.45, 6e8);
      for (i = 0; i < 2; i++) {
        O.posAt(bs[i], c.t, b0); var X = sx(b0[0]), Y = sy(b0[1]), r = bs[i].r * k;
        if (i === 0) drawEarth(X, Y, r, TAU * c.t / SID); else drawMoon(X, Y, r);
        if (r < 14) label(bs[i].name, X + Math.max(r, 4) + 6, Y + 1, i ? '#ced4da' : C.blue, 'left', 12);
      }
      var px = sx(c.x), py = sy(c.y);
      if (c.hit < 0) { O.velAt(bs[ref], c.t, b1); forceArrows(px, py, c.vx - b1[0], c.vy - b1[1]); craftDot(px, py, C.gold); }
      else craftDot(px, py, C.red);
      if (S.moonMin < K.R_MOON + 1e7) win('moon', 'You reached the Moon: ' + km(S.moonMin - K.R_MOON) + ' from its surface, ' + dur(c.t - (S.tBurn || 0)) + ' after the burn.');
      offscreen(px, py, C.gold, 'spacecraft');
    },
    drawInset: function (I, X, Y, kk) {
      var bs = S.sys.bodies, c = S.c, P = [0, 0];
      if (I.bi === 0 && S.pred && S.pred.bp) {
        strokePath(S.pred.pts, C.gold, 1.4, false, [5, 5], function (p, out) { O.posAt(bs[0], p[2], P); out[0] = X(p[0] - P[0]); out[1] = Y(p[1] - P[1]); });
        O.posAt(bs[0], S.pred.tB, P); var bx = X(S.pred.bp[0] - P[0]), by = Y(S.pred.bp[1] - P[1]);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.stroke(); glowDot(bx, by, 3, C.gold, false);
        label('burn', bx + 10, by - 9, C.gold, 'left', 11);
        // direction to the Moon now
        O.posAt(bs[0], c.t, P); O.posAt(bs[1], c.t, b2); var a = Math.atan2(b2[1] - P[1], b2[0] - P[0]);
        arrow(X(0), Y(0), Math.cos(a) * I.Rpx * 0.95, -Math.sin(a) * I.Rpx * 0.95, 'rgba(206,212,218,.55)', 1.2, null);
        label('to Moon', X(0) + Math.cos(a) * I.Rpx * 0.7, Y(0) - Math.sin(a) * I.Rpx * 0.7 - 8, '#ced4da', 'center', 10);
      }
    },
    rows: [['t', 'Time'], ['ph', 'Moon ahead of you by'], ['dE', 'Height above Earth'], ['dM', 'Distance to the Moon'], ['vE', 'Speed (from Earth)'], ['vM', 'Speed (from the Moon)'], ['min', 'Closest to the Moon so far'], ['pr', 'Dashed path: closest to the Moon']],
    read: function () {
      var c = S.c, bs = S.sys.bodies;
      O.posAt(bs[0], c.t, b0); O.velAt(bs[0], c.t, b1); var dE = Math.hypot(c.x - b0[0], c.y - b0[1]), vE = Math.hypot(c.vx - b1[0], c.vy - b1[1]);
      O.posAt(bs[1], c.t, b0); O.velAt(bs[1], c.t, b1); var dM = Math.hypot(c.x - b0[0], c.y - b0[1]), vM = Math.hypot(c.vx - b1[0], c.vy - b1[1]);
      var p = S.pred, pr = '—';
      if (p) pr = p.hit === 1 ? 'hits the Moon' : p.hit === 0 ? 'falls back to Earth' : km(p.dmin - K.R_MOON) + ' up';
      return { t: dur(c.t), ph: num(moon.phase(c), 0) + '°', dE: c.hit === 1 ? 'on the Moon' : km(dE - RE), dM: km(dM - K.R_MOON) + ' up', vE: kms(vE), vM: kms(vM), min: isFinite(S.moonMin) ? km(S.moonMin - K.R_MOON) + ' up' : '—', pr: pr };
    },
    hud: function () {
      var c = S.c; if (c.hit === 1) return 'landed on the Moon (hard)'; if (c.hit === 0) return 'fell back to Earth';
      var w = S.armed ? 'burn in ' + dur(S.planT - c.t) : S.burned ? 'coasting' : 'parking orbit, 200 km up';
      O.posAt(S.sys.bodies[1], c.t, b0); return w + ' · Moon ' + km(Math.hypot(c.x - b0[0], c.y - b0[1]) - K.R_MOON) + ' away';
    }
  };

  var PLIST = ['mercury', 'venus', 'earth', 'mars'];
  var assist = {
    key: 'assist', name: 'Slingshot', warp: 172800, sMin: 5e-12, sMax: 1e-3, btn: '↺ Fly again',
    tip: 'A spacecraft heads for a planet. Watch its speed measured from the Sun before and after it swings past. Then try the other side.',
    follows: [['auto', 'Inner solar system'], ['planet', 'The planet'], ['craft', 'Spacecraft']],
    init: function () {
      var key = $('orbits-planet').value, pk = K.PLANETS[key], tca = 14 * 86400, w = Math.sqrt(K.GM_SUN / Math.pow(pk.a, 3));
      var ph = { mercury: 3.7, venus: 2.3, earth: 5.3, mars: 0.5 }; ph[key] = Math.PI / 2 - w * tca;
      S.sys = O.inner(ph); var bi = 1 + PLIST.indexOf(key), rp = pk.r + get('orbits-alt') * 1000, vinf = get('orbits-vinf') * 1000;
      var fb = O.flybyState(S.sys, bi, tca, rp, vinf, S.side), s = O.copy(fb.s);
      S.sys.noHit = true; O.step(S.sys, s, -tca); S.sys.noHit = false;
      s.t = Math.max(0, s.t); s.area = 0; s.ang = 0; s.n = 0;
      S.c = s; S.alive = true; S.trail = []; S.lapOn = false; S.sec = null; S.planT = null;
      S.rel = {}; S.rel[bi] = [];
      S.as = { bi: bi, key: key, tca: tca, rp: rp, soi: O.soi(pk.gm, pk.a, K.GM_SUN), inSoi: false, vIn: NaN, vOut: NaN, vrIn: NaN, vrOut: NaN, dIn: null, dOut: null, dmin: Infinity, elIn: null, samples: [], last: -1e9, turn: fb.turn };
      S.as.R = Math.max(3 * rp, 6 * pk.r);
    },
    act: function () { setScene('assist'); },
    sub: function (s) {
      var A = S.as, b = S.sys.bodies[A.bi]; O.posAt(b, s.t, b0);
      var dx = s.x - b0[0], dy = s.y - b0[1], d = Math.hypot(dx, dy);
      if (d < A.dmin) { A.dmin = d; A.tmin = s.t; }
      if (d < A.R * 1.6) { var a = S.rel[A.bi], l = a[a.length - 1]; if (!l || Math.hypot(dx - l[0], dy - l[1]) > A.R / 100) { a.push([dx, dy, s.t]); if (a.length > 3000) a.shift(); } }
    },
    after: function () {
      var A = S.as, c = S.c, b = S.sys.bodies[A.bi]; O.posAt(b, c.t, b0); O.velAt(b, c.t, b1);
      var d = Math.hypot(c.x - b0[0], c.y - b0[1]), vs = Math.hypot(c.vx, c.vy), ux = c.vx - b1[0], uy = c.vy - b1[1], vr = Math.hypot(ux, uy);
      if (!A.inSoi && d < A.soi && isNaN(A.vIn)) { A.inSoi = true; A.vIn = vs; A.vrIn = vr; A.dIn = [ux / vr, uy / vr]; A.elIn = O.elements(K.GM_SUN, c.x, c.y, c.vx, c.vy); }
      if (A.inSoi && d > A.soi && c.t > A.tca) {
        A.inSoi = false; A.vOut = vs; A.vrOut = vr; A.dOut = [ux / vr, uy / vr];
        var dv = A.vOut - A.vIn;
        if (dv >= 1000) win('assist', 'Slingshot! ' + kms(A.vIn) + ' → ' + kms(A.vOut) + ' measured from the Sun: ' + b.name + '’s pull gave you ' + kms(dv) + '.');
        else if (dv <= -1000) L.toast(view, 'Slowed down by ' + kms(-dv) + '. Passing in front of a planet takes speed away. Try passing behind it.');
      }
      if (c.t - A.last > 3600 * 6 || (d < 20 * A.R && c.t - A.last > 600)) { A.samples.push([c.t, vs, vr]); A.last = c.t; if (A.samples.length > 2000) A.samples.shift(); }
    },
    hit: function (b) { L.toast(view, 'Crashed into ' + b.name + '. Pass a little farther away.'); },
    fit: function () {
      var c = S.c, f = S.follow, b = S.sys.bodies[S.as.bi];
      if (f === 'planet') { O.posAt(b, c.t, b0); return { x: b0[0], y: b0[1], r: 2e9 }; }
      if (f === 'craft') return { x: c.x, y: c.y, r: 2e10 };
      return { x: 0, y: 0, r: 2.6e11 };
    },
    insetFor: function () { var A = S.as; return { bi: A.bi, R: A.R, title: 'Seen from ' + S.sys.bodies[A.bi].name }; },
    draw: function () {
      var bs = S.sys.bodies, c = S.c, k = S.cam.s, i, A = S.as;
      for (i = 1; i < bs.length; i++) { ctx.strokeStyle = i === A.bi ? 'rgba(255,212,121,.3)' : 'rgba(143,179,198,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx(0), sy(0), bs[i].R * k, 0, TAU); ctx.stroke(); }
      if (A.elIn) drawConic(A.elIn, sx(0), sy(0), k, C.pink, 0.45, 5 * K.AU);
      var O2 = O.elements(K.GM_SUN, c.x, c.y, c.vx, c.vy);
      O.posAt(bs[A.bi], c.t, b0); var dP = Math.hypot(c.x - b0[0], c.y - b0[1]);
      if (dP > A.soi && c.hit < 0) drawConic(O2, sx(0), sy(0), k, C.gold, 0.55, 5 * K.AU);
      strokePath(S.trail, C.green, 2.4, true);
      drawSun(sx(0), sy(0), K.R_SUN * k);
      for (i = 1; i < bs.length; i++) {
        O.posAt(bs[i], c.t, b0); var X = sx(b0[0]), Y = sy(b0[1]), r = bs[i].r * k;
        drawPlanet(bs[i].name, X, Y, r);
        if (i === A.bi) label(bs[i].name, X, Y + Math.max(r, 3) + 13, C.gold, 'center', 12); else label(bs[i].name, X + Math.max(r, 3) + 6, Y + 1, C.muted, 'left', 11);
        if (i === A.bi) { O.velAt(bs[i], c.t, b1); var v = Math.hypot(b1[0], b1[1]); arrow(X, Y, b1[0] / v * 30, -b1[1] / v * 30, 'rgba(255,212,121,.75)', 1.6, null); }
      }
      var px = sx(c.x), py = sy(c.y);
      if (c.hit < 0) { forceArrows(px, py, c.vx, c.vy); craftDot(px, py, C.green); } else craftDot(px, py, C.red);
      offscreen(px, py, C.green, 'spacecraft');
    },
    rows: [['t', 'Time to closest approach'], ['vs', 'Speed (from the Sun)'], ['vr', 'Speed (from the planet)'], ['d', 'Height above the planet'], ['min', 'Closest approach'], ['io', 'From the Sun: in → out'], ['iop', 'From the planet: in → out'], ['turn', 'Turned by']],
    read: function () {
      var A = S.as, c = S.c, b = S.sys.bodies[A.bi]; O.posAt(b, c.t, b0); O.velAt(b, c.t, b1);
      var d = Math.hypot(c.x - b0[0], c.y - b0[1]), turn = '—';
      if (A.dIn && A.dOut) turn = num(Math.acos(clamp(A.dIn[0] * A.dOut[0] + A.dIn[1] * A.dOut[1], -1, 1)) / DEG, 1) + '°';
      return {
        t: c.t < A.tca ? dur(A.tca - c.t) : dur(A.tca - c.t).replace('−', '+') + ' (after)', vs: kms(Math.hypot(c.vx, c.vy)), vr: kms(Math.hypot(c.vx - b1[0], c.vy - b1[1])),
        d: c.hit >= 0 ? 'crashed' : km(d - b.r), min: isFinite(A.dmin) && c.t > A.tca - 86400 ? km(A.dmin - b.r) + ' up' : '—',
        io: isNaN(A.vIn) ? '—' : kms(A.vIn) + ' → ' + (isNaN(A.vOut) ? '…' : kms(A.vOut)), iop: isNaN(A.vrIn) ? '—' : kms(A.vrIn) + ' → ' + (isNaN(A.vrOut) ? '…' : kms(A.vrOut)), turn: turn
      };
    },
    hud: function () { var c = S.c, A = S.as; return 'speed from the Sun ' + kms(Math.hypot(c.vx, c.vy)) + (isNaN(A.vOut) ? '' : ' · change ' + (A.vOut >= A.vIn ? '+' : '−') + kms(Math.abs(A.vOut - A.vIn))); }
  };
  var SCENES = { cannon: cannon, orbit: orbit, moon: moon, assist: assist };

  /* ---------- the close-up window ---------- */
  function inset() {
    if (!S.scene.insetFor) return null;
    var I = S.scene.insetFor(); if (!I) return null;
    var size = Math.round(Math.min(210, 0.37 * Math.min(G.w, G.h))), x0 = G.w - size - 10, y0 = 52;
    I.x0 = x0; I.y0 = y0; I.size = size; I.cx = x0 + size / 2; I.cy = y0 + size / 2 + 6; I.Rpx = size / 2 - 12;
    return I;
  }
  function drawInset() {
    var I = inset(); if (!I) return;
    var bs = S.sys.bodies, b = bs[I.bi], c = S.c, kk = I.Rpx / I.R;
    function X(dx) { return I.cx + dx * kk; } function Y(dy) { return I.cy - dy * kk; }
    ctx.save();
    ctx.fillStyle = '#040c13'; ctx.strokeStyle = 'rgba(120,170,200,.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(I.x0, I.y0, I.size, I.size + 12, 12); else ctx.rect(I.x0, I.y0, I.size, I.size + 12); ctx.fill(); ctx.stroke(); ctx.clip();
    if (b.name === 'Moon') drawMoon(X(0), Y(0), b.r * kk); else if (b.name === 'Earth' && S.scene.key === 'moon') drawEarth(X(0), Y(0), b.r * kk, TAU * c.t / SID); else drawPlanet(b.name, X(0), Y(0), b.r * kk);
    if (S.scene.drawInset) S.scene.drawInset(I, X, Y, kk);
    strokePath(S.rel[I.bi] || [], C.green, 1.8, true, null, function (p, out) { out[0] = X(p[0]); out[1] = Y(p[1]); });
    O.posAt(b, c.t, b0); var dx = c.x - b0[0], dy = c.y - b0[1];
    if (Math.hypot(dx, dy) < I.R * 1.6) craftDot(X(dx), Y(dy), c.hit >= 0 ? C.red : C.gold);
    else if (S.scene.key === 'assist') label(c.t < S.as.tca ? 'flyby in ' + dur(S.as.tca - c.t) : 'flyby over', I.cx, I.y0 + I.size - 8, C.muted, 'center', 11);
    label(I.title, I.x0 + 8, I.y0 + 11, C.ink, 'left', 11);
    var bar = Math.pow(10, Math.floor(Math.log10(I.R * 0.6))), bw = bar * kk;
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(I.x0 + 8, I.y0 + I.size + 4); ctx.lineTo(I.x0 + 8 + bw, I.y0 + I.size + 4); ctx.stroke();
    label(km(bar), I.x0 + 12 + bw, I.y0 + I.size + 4, C.muted, 'left', 10);
    ctx.restore();
  }

  /* ---------- burns (Moon scene) ---------- */
  function burnOn(s, dv, dir, bi) {
    var b = S.sys.bodies[bi]; O.velAt(b, s.t, b1);
    var ux = s.vx - b1[0], uy = s.vy - b1[1], u = Math.hypot(ux, uy) || 1;
    s.vx += dir * dv * ux / u; s.vy += dir * dv * uy / u;
    return [ux / u * dir, uy / u * dir];
  }
  function doBurn() {
    if (S.scene !== moon || !S.c || S.c.hit >= 0) return;
    var dv = moon.dv(); if (dv <= 0) return;
    var ref = moon.refBody(), u = burnOn(S.c, dv, S.dir, ref);
    var sk = 1 / Math.hypot(u[0], u[1]);
    S.fx.push({ kind: 'burn', dx: u[0] * sk, dy: u[1] * sk, t0: performance.now(), life: 700, x: S.c.x, y: S.c.y });
    L.toast(view, 'Burn: ' + (S.dir > 0 ? '+' : '−') + kms(dv) + (ref ? ' (measured from the Moon)' : ''));
    moon.burnDone(dv); S.predDirty = true;
  }

  /* ---------- missions ---------- */
  var MIS = [
    { id: 'around', title: 'Around the world', goal: 'Fire the cannon fast enough that the ball goes all the way around Earth without landing.' },
    { id: 'leo', title: 'Low Earth orbit', goal: 'Fly a nearly circular orbit (eccentricity under 0.02) between 160 and 2,000 km up.' },
    { id: 'areas', title: 'Equal areas', goal: 'Turn on the equal-area slices and fly one whole orbit with an eccentricity of 0.5 or more.' },
    { id: 'kepler3', title: 'Kepler’s third law', goal: 'Complete one lap, then a lap of an orbit at least twice as big (semi-major axis a), and compare the periods.' },
    { id: 'geo', title: 'Geostationary', goal: 'Find the circular orbit that takes one sidereal day (23 h 56 min) and goes the way Earth spins, so it hangs over one spot.' },
    { id: 'escape', title: 'Escape Earth', goal: 'Leave Earth for good: positive energy and more than 20 Earth radii away.' },
    { id: 'moon', title: 'Trip to the Moon', goal: 'From the parking orbit, burn your engine and pass within 10,000 km of the Moon’s surface.' },
    { id: 'assist', title: 'Slingshot', goal: 'Swing past a planet and leave at least 1 km/s faster than you came, measured from the Sun.' }
  ];
  var M = L.missions($('orbits-missions'), 'orbits', MIS, pick);
  function win(id, text) { if (M.done(id)) L.toast(view, '★ ' + text); }
  function pick(id) {
    var o = {
      around: ['cannon', { h: 500, v: 6.5 }, 'Raise the speed a little at a time. Somewhere near 7.6 km/s the ball stops landing.'],
      leo: ['orbit', { alt: 400, v: 7200, gam: 0 }, 'At 400 km a circle needs about 7.67 km/s, aimed level. Raise the speed, or press Circular.'],
      areas: ['orbit', { alt: 400, v: 8600, gam: 0, areas: true }, 'Raise the speed until e is 0.5 or more (about 9.5 km/s here) and watch one full lap.'],
      kepler3: ['orbit', { alt: 400, v: 7673, gam: 0 }, 'Watch one lap here, then set a height of about 8,000 km, press Circular and watch another lap.'],
      geo: ['orbit', { alt: 20000, v: O.circularSpeed(GME, RE + 20e6), gam: 0 }, 'Change the height, press Circular, and read the period. The gold dot on Earth shows a spot on the equator.'],
      escape: ['cannon', { h: 500, v: 10 }, 'Escape speed from the mountain top is shown under the sliders. Fire faster than that.'],
      moon: ['moon', {}, moon.tip],
      assist: ['assist', { side: -1 }, 'This run passes in front of Venus. Switch to “behind” to gain speed.']
    }[id];
    if (!o) return;
    var p = o[1];
    if (o[0] === 'cannon') { setVal('orbits-h', p.h); setVal('orbits-v', p.v); }
    if (o[0] === 'orbit') { if (p.areas) { S.areasOn = true; $('orbits-areas').checked = true; store.set('areas', true); } S.setup = { th: 0, alt: p.alt * 1000, v: p.v, gam: p.gam }; writeSetup(); }
    if (o[0] === 'assist') { S.side = p.side; syncSide(); $('orbits-planet').value = 'venus'; }
    setScene(o[0], true);
    if (o[0] === 'cannon') cannon.note();
    tipEl.textContent = o[2];
    var r = view.getBoundingClientRect(); if (r.top < 0 || r.bottom > window.innerHeight) view.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  function checkMissions() {
    var sc = S.scene.key, c = S.c, el = S.el;
    if ((sc === 'cannon' || sc === 'orbit') && c && S.alive && c.hit < 0 && el) {
      if (el.bound && el.e < 0.02 && el.rp - RE >= 160e3 && el.ra - RE <= 2000e3 && c.t - S.launchT >= el.T / 4) win('leo', 'Low Earth orbit! At 400 km up that means about 7.67 km/s and a lap every 92 minutes.');
      if (el.energy >= 0 && el.r > 20 * RE) win('escape', 'Escaped! Faster than escape speed, Earth’s pull slows you down but can never bring you back.');
      if (sc === 'orbit' && el.h > 0 && el.e < 0.01 && Math.abs(el.T - SID) < 300 && c.t - S.launchT > 3 * 3600) win('geo', 'Geostationary! 42,164 km from Earth’s center it keeps pace with the spin and hangs over one spot.');
    }
  }

  /* ---------- controls ---------- */
  function setVal(id, v) {
    var el = $(id); el.value = v;
    var n = $(id + '-n'); if (n) n.value = fmtNum(id, toNum(id, +el.value));
  }
  /* Log-scale sliders: altitude (orbit), closest approach (assist) and time speed. */
  var LOG = { 'orbits-alt0': [50, 500000], 'orbits-alt': [100, 300000] };
  function toNum(id, v) { var l = LOG[id]; return l ? l[0] * Math.pow(l[1] / l[0], v / 1000) : v; }
  function fromNum(id, x) { var l = LOG[id]; return l ? 1000 * Math.log(clamp(x, l[0], l[1]) / l[0]) / Math.log(l[1] / l[0]) : x; }
  function fmtNum(id, x) { return id === 'orbits-v' || id === 'orbits-dv' || id === 'orbits-sp' ? (+x).toFixed(3) : id === 'orbits-vinf' ? (+x).toFixed(1) : String(Math.round(x)); }
  function nudge(id, d) { var el = $(id); el.value = clamp(+el.value + d, +el.min, +el.max); el.dispatchEvent(new Event('input', { bubbles: true })); }
  function pair(id, fn) {
    var r = $(id), n = $(id + '-n');
    r.addEventListener('input', function () { if (n) n.value = fmtNum(id, toNum(id, +r.value)); fn(); });
    if (n) n.addEventListener('change', function () {
      var x = parseFloat(n.value); if (!isFinite(x)) { n.value = fmtNum(id, toNum(id, +r.value)); return; }
      x = LOG[id] ? clamp(x, LOG[id][0], LOG[id][1]) : clamp(x, +r.min, +r.max);
      r.value = fromNum(id, x); n.value = fmtNum(id, x); fn();
    });
    if (n && n.getAttribute('value')) r.value = fromNum(id, +n.value); else if (n) n.value = fmtNum(id, toNum(id, +r.value));
  }
  function readSetup() {
    S.setup = S.setup || { th: 0 };
    S.setup.alt = get('orbits-alt0') * 1000; S.setup.v = get('orbits-sp') * 1000; S.setup.gam = get('orbits-dir') * DEG;
  }
  function writeSetup() {
    var su = S.setup;
    $('orbits-alt0').value = fromNum('orbits-alt0', su.alt / 1000); $('orbits-alt0-n').value = Math.round(su.alt / 1000);
    $('orbits-sp').value = clamp(su.v / 1000, 0, 15); $('orbits-sp-n').value = (su.v / 1000).toFixed(3);
    var g = Math.round(wrap360(su.gam / DEG + 180) - 180); $('orbits-dir').value = g; $('orbits-dir-n').value = g;
  }
  function setSetup(o, dragging) {
    for (var k in o) S.setup[k] = o[k];
    S.setup.gam = (wrap360(S.setup.gam / DEG + 180) - 180) * DEG;
    writeSetup(); orbit.launch();
    if (dragging) S.trail = [];
  }
  function setWarp(w) { S.warp = clamp(w, 1, 1e6); $('orbits-warp').value = Math.round(Math.log10(S.warp) * 100); warpOut(); }
  function warpOut() {
    var w = S.warp, t = w < 60 ? num(w, 0) + ' s' : w < 3600 ? num(w / 60, w < 600 ? 1 : 0) + ' min' : w < 86400 ? num(w / 3600, w < 36000 ? 1 : 0) + ' h' : num(w / 86400, w < 864000 ? 1 : 0) + ' d';
    $('orbits-warp-o').textContent = warpText(w) + ' · ' + t + '/s';
  }
  function syncPlay() { var b = $('orbits-play'); b.textContent = S.running ? '❚❚' : '▶'; b.setAttribute('aria-label', S.running ? 'Pause' : 'Play'); b.title = (S.running ? 'Pause' : 'Play') + ' (Space)'; }
  function syncSide() { root.querySelectorAll('[data-side]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.side === S.side)); }); }
  function syncDir() { root.querySelectorAll('[data-dir]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.dir === S.dir)); }); }

  function setScene(key, keepSetup) {
    var sc = SCENES[key] || orbit; S.scene = sc; store.set('scene', sc.key);
    root.querySelectorAll('[data-scene]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.scene === sc.key)); });
    root.querySelectorAll('[data-for]').forEach(function (g) { g.hidden = g.dataset.for.split(' ').indexOf(sc.key) < 0; });
    S.rot = sc.key === 'moon' && $('orbits-rot').checked; S.fx = []; S.planT = null; S.armed = false; S.drag = null;
    var fs = $('orbits-follow');
    if (sc.follows) { fs.innerHTML = sc.follows.map(function (f) { return '<option value="' + f[0] + '">' + f[1] + '</option>'; }).join(''); fs.value = 'auto'; }
    S.follow = 'auto';
    S.cam.auto = true; S.cam.ox = 0; S.cam.oy = 0; S.cam.blend = 0;
    setWarp(sc.warp);
    sc.init();
    var f = sc.fit(); S.cam.x = f.x; S.cam.y = f.y; S.cam.s = clamp(Math.min(G.w, G.h) * 0.5 / f.r, sc.sMin, sc.sMax);
    S.running = true; syncPlay();
    actBtn.textContent = sc.btn; tipEl.textContent = sc.tip;
    readEl.innerHTML = sc.rows.map(function (r) { return '<dt>' + r[1] + '</dt><dd data-k="' + r[0] + '">—</dd>'; }).join('');
    chartBox.hidden = sc.key === 'moon';
    S.el = S.c ? O.elements(GME, S.c.x, S.c.y, S.c.vx, S.c.vy) : null;
    uiTick(true);
  }

  root.querySelectorAll('[data-scene]').forEach(function (b) { b.addEventListener('click', function () { setScene(b.dataset.scene); }); });
  pair('orbits-h', function () { cannon.note(); });
  pair('orbits-v', function () { });
  pair('orbits-alt0', function () { readSetup(); orbit.launch(); });
  pair('orbits-sp', function () { readSetup(); orbit.launch(); });
  pair('orbits-dir', function () { readSetup(); orbit.launch(); });
  pair('orbits-dv', function () { S.predDirty = true; });
  pair('orbits-ph', function () { moon.retarget(); });
  pair('orbits-alt', function () { setScene('assist'); });
  pair('orbits-vinf', function () { setScene('assist'); });
  $('orbits-planet').addEventListener('change', function () { setScene('assist'); });
  $('orbits-fire').addEventListener('click', function () { cannon.fire(); });
  $('orbits-clear').addEventListener('click', function () { cannon.init(); });
  $('orbits-circ').addEventListener('click', function () { orbit.act(); });
  $('orbits-relaunch').addEventListener('click', function () { orbit.launch(); });
  $('orbits-arm').addEventListener('click', function () { moon.arm(); });
  $('orbits-burn').addEventListener('click', function () { doBurn(); });
  $('orbits-again').addEventListener('click', function () { setScene('assist'); });
  root.querySelectorAll('[data-side]').forEach(function (b) { b.addEventListener('click', function () { S.side = +b.dataset.side; syncSide(); setScene('assist'); }); });
  root.querySelectorAll('[data-dir]').forEach(function (b) { b.addEventListener('click', function () { S.dir = +b.dataset.dir; syncDir(); S.predDirty = true; }); });
  $('orbits-areas').checked = S.areasOn;
  $('orbits-areas').addEventListener('change', function (e) { S.areasOn = e.target.checked; store.set('areas', S.areasOn); if (S.scene === orbit) { if (S.areasOn) startSectors(); else S.sec = null; } });
  $('orbits-arrows').checked = S.arrowsOn;
  $('orbits-arrows').addEventListener('change', function (e) { S.arrowsOn = e.target.checked; store.set('arrows', S.arrowsOn); });
  $('orbits-rot').addEventListener('change', function (e) { S.rot = e.target.checked && S.scene === moon; });
  $('orbits-follow').addEventListener('change', function (e) { S.follow = e.target.value; S.cam.auto = true; S.cam.ox = 0; S.cam.oy = 0; S.cam.blend = 0.8; });
  $('orbits-warp').addEventListener('input', function (e) { S.warp = Math.pow(10, +e.target.value / 100); warpOut(); });
  $('orbits-play').addEventListener('click', function () { S.running = !S.running; syncPlay(); });
  $('orbits-reset').addEventListener('click', function () { setScene(S.scene.key); });
  $('orbits-zin').addEventListener('click', function () { zoomBy(1.6); });
  $('orbits-zout').addEventListener('click', function () { zoomBy(1 / 1.6); });
  $('orbits-fit').addEventListener('click', fitView);
  actBtn.addEventListener('click', function () { S.scene.act(); });

  /* ---------- pointer, wheel and keys ---------- */
  var ptrs = {}, gest = null;
  function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  cv.addEventListener('pointerdown', function (e) {
    var p = pos(e); ptrs[e.pointerId] = p;
    try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    var ids = Object.keys(ptrs);
    if (ids.length === 2) {
      if (gest && gest.kind === 'grab' && S.scene.release) S.scene.release(gest.what);
      var a = ptrs[ids[0]], b = ptrs[ids[1]]; S.drag = null;
      gest = { kind: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, s0: S.cam.s }; return;
    }
    var what = S.scene.grab ? S.scene.grab(p[0], p[1]) : null;
    gest = what ? { kind: 'grab', what: what, x0: p[0], y0: p[1], moved: false } : { kind: 'pan', x0: p[0], y0: p[1], ox: S.cam.ox, oy: S.cam.oy, moved: false };
    if (what && what !== 'cannon' && what !== 'node') S.drag = what;
  });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId] || !gest) return;
    var p = pos(e); ptrs[e.pointerId] = p;
    if (gest.kind === 'pinch') {
      var ids = Object.keys(ptrs); if (ids.length < 2) return;
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      zoomBy(gest.s0 * d / gest.d0 / S.cam.s, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return;
    }
    if (Math.hypot(p[0] - gest.x0, p[1] - gest.y0) > 4) gest.moved = true;
    if (!gest.moved) return;
    if (gest.kind === 'grab') { if (S.scene.drag) S.scene.drag(gest.what, p[0], p[1]); }
    else { S.cam.ox = gest.ox - (p[0] - gest.x0) / S.cam.s; S.cam.oy = gest.oy + (p[1] - gest.y0) / S.cam.s; }
  });
  function up(e) {
    if (!ptrs[e.pointerId]) return;
    delete ptrs[e.pointerId];
    if (gest && gest.kind === 'pinch') { if (!Object.keys(ptrs).length) gest = null; return; }
    if (gest && gest.kind === 'grab') {
      if (!gest.moved && S.scene.tap) S.scene.tap(gest.what, gest.x0, gest.y0);
      else if (gest.moved && S.scene.release) S.scene.release(gest.what);
    }
    S.drag = null; gest = null;
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); var p = pos(e); zoomBy(Math.exp(-clamp(e.deltaY, -200, 200) * 0.0018), p[0], p[1]); }, { passive: false });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, done = true;
    if (k === ' ' || k === 'k') { S.running = !S.running; syncPlay(); }
    else if (k === 'r' || k === 'R') setScene(S.scene.key);
    else if (k === 'f' || k === 'F' || k === 'b' || k === 'B' || k === 'Enter') S.scene.act();
    else if (k === '+' || k === '=') zoomBy(1.4);
    else if (k === '-' || k === '_') zoomBy(1 / 1.4);
    else if (k === '0') fitView();
    else if (k >= '1' && k <= '4') setScene(['cannon', 'orbit', 'moon', 'assist'][+k - 1]);
    else done = !!(S.scene.keys && S.scene.keys(k, e.shiftKey));
    if (done) e.preventDefault();
  });

  /* ---------- the panel chart ---------- */
  function cssv(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  function drawChart() {
    if (chartBox.hidden) return;
    CH.fit(); var c = CH.c, w = CH.w, h = CH.h, ink = cssv('--ink'), mut = cssv('--muted'), line = cssv('--line'), acc = cssv('--acc'), dark = L.dark();
    var blue = dark ? '#74c0fc' : '#1971c2', gold = dark ? '#ffd479' : '#b8860b';
    c.clearRect(0, 0, w, h); c.font = '11px system-ui,sans-serif'; c.textBaseline = 'middle';
    var l = 44, r = 10, t = 10, b = 24, W = w - l - r, H = h - t - b;
    function axes() { c.strokeStyle = line; c.lineWidth = 1; c.strokeRect(l + 0.5, t + 0.5, W, H); }
    if (S.scene.key === 'assist') {
      var A = S.as, sm = A.samples, tmax = Math.max(2 * A.tca, S.c.t), vmax = 0;
      sm.forEach(function (p) { vmax = Math.max(vmax, p[1], p[2]); }); vmax = Math.max(10e3, Math.ceil(vmax / 10e3) * 10e3);
      var X = function (tt) { return l + tt / tmax * W; }, Y = function (v) { return t + H - v / vmax * H; };
      axes();
      c.fillStyle = mut; c.textAlign = 'right';
      for (var v = 0; v <= vmax; v += 10e3) { c.fillText(num(v / 1000, 0), l - 5, Y(v)); c.strokeStyle = line; c.beginPath(); c.moveTo(l, Y(v) + 0.5); c.lineTo(l + W, Y(v) + 0.5); c.stroke(); }
      c.textAlign = 'left'; c.fillText('0', l, h - 8); c.textAlign = 'right'; c.fillText(num(tmax / 86400, 0) + ' days', l + W, h - 8); c.textAlign = 'center'; c.fillText('time', l + W / 2, h - 8);
      c.save(); c.translate(11, t + H / 2); c.rotate(-Math.PI / 2); c.fillText('km/s', 0, 0); c.restore();
      c.setLineDash([4, 4]); c.strokeStyle = mut; c.beginPath(); c.moveTo(X(A.tca), t); c.lineTo(X(A.tca), t + H); c.stroke(); c.setLineDash([]);
      [[1, acc], [2, blue]].forEach(function (s) { c.strokeStyle = s[1]; c.lineWidth = 2; c.beginPath(); sm.forEach(function (p, i) { if (i) c.lineTo(X(p[0]), Y(p[s[0]])); else c.moveTo(X(p[0]), Y(p[s[0]])); }); c.stroke(); });
      chartCap.innerHTML = '<span style="color:' + acc + '">━</span> speed measured from the Sun, <span style="color:' + blue + '">━</span> from the planet. Dashed line: closest approach.';
      return;
    }
    // Kepler's third law: log–log plot of period against orbit size
    var ax0 = Math.log10(5000), ax1 = Math.log10(6e5), ay0 = 0, ay1 = 3.1;
    var KX = function (akm) { return l + (Math.log10(akm) - ax0) / (ax1 - ax0) * W; }, KY = function (Th) { return t + H - (Math.log10(Th) - ay0) / (ay1 - ay0) * H; };
    axes(); c.fillStyle = mut; c.textAlign = 'right';
    [[1, '1 h'], [10, '10 h'], [100, '4 d'], [1000, '42 d']].forEach(function (g) { c.fillText(g[1], l - 5, KY(g[0])); c.strokeStyle = line; c.beginPath(); c.moveTo(l, KY(g[0]) + 0.5); c.lineTo(l + W, KY(g[0]) + 0.5); c.stroke(); });
    c.textAlign = 'center';
    [[1e4, '10,000 km'], [1e5, '100,000 km']].forEach(function (g) { c.fillText(g[1], KX(g[0]), h - 8); c.strokeStyle = line; c.beginPath(); c.moveTo(KX(g[0]) + 0.5, t); c.lineTo(KX(g[0]) + 0.5, t + H); c.stroke(); });
    c.strokeStyle = gold; c.lineWidth = 1.5; c.beginPath();
    for (var i = 0; i <= 40; i++) { var ak = Math.pow(10, ax0 + (ax1 - ax0) * i / 40), Th = O.period(GME, ak * 1000) / 3600; if (i) c.lineTo(KX(ak), KY(Th)); else c.moveTo(KX(ak), KY(Th)); }
    c.stroke();
    var refs = [['400 km', 6771, O.period(GME, 6771e3) / 3600], ['GPS', 26571, O.period(GME, 26571e3) / 3600], ['GEO', 42164, SID / 3600], ['Moon', 384400, 27.3217 * 24]];
    c.textAlign = 'left';
    refs.forEach(function (rf) { var X = KX(rf[1]), Y = KY(rf[2]); c.fillStyle = mut; c.beginPath(); c.arc(X, Y, 2.5, 0, TAU); c.fill(); c.fillText(rf[0], X + (rf[0] === 'Moon' ? -30 : 5), Y + (rf[0] === 'Moon' ? -9 : 9)); });
    S.k3.forEach(function (p) { c.fillStyle = acc; c.beginPath(); c.arc(KX(p.a / 1000), KY(p.T / 3600), 4.5, 0, TAU); c.fill(); });
    var el = S.el;
    if (el && el.bound && S.c && S.c.hit < 0 && el.a / 1000 > 5000) { c.strokeStyle = blue; c.lineWidth = 2; c.beginPath(); c.arc(KX(el.a / 1000), KY(el.T / 3600), 6, 0, TAU); c.stroke(); }
    chartCap.innerHTML = 'Kepler’s third law: every orbit around Earth sits on the gold line, T² = (4π²/GM)·a³. <span style="color:' + blue + '">◯</span> your orbit now, <span style="color:' + acc + '">●</span> laps you measured.';
  }

  /* ---------- the frame ---------- */
  var lastUI = 0;
  function uiTick(force) {
    var now = performance.now(); if (!force && now - lastUI < 120) return; lastUI = now;
    var sc = S.scene, c = S.c, vals = sc.read();
    readEl.querySelectorAll('dd').forEach(function (d) { var v = vals[d.dataset.k]; if (v !== undefined && d.textContent !== v) d.textContent = v; });
    var t = sc.key === 'cannon' ? (c ? c.t : 0) : sc.key === 'orbit' ? c.t - S.launchT : c.t;
    var where = S.capped ? ' (slowed near ' + (sc.key === 'assist' ? nearest() : sc.key === 'moon' ? nearest() : 'Earth') + ')' : '';
    hudA.innerHTML = '<b>' + sc.name + '</b><br>' + (S.running ? '' : 'Paused · ') + 't = ' + dur(t) + '<br>time ' + warpText(S.alive ? S.rate || S.warp : S.warp) + where;
    hudB.textContent = sc.hud();
    drawChart();
  }
  function nearest() {
    var bs = S.sys.bodies, c = S.c, best = '', bt = Infinity;
    bs.forEach(function (b) { O.posAt(b, c.t, b0); var r = Math.hypot(c.x - b0[0], c.y - b0[1]), ts = Math.sqrt(r * r * r / b.gm); if (ts < bt) { bt = ts; best = b.name; } });
    return best === 'Sun' ? 'the Sun' : best === 'Moon' ? 'the Moon' : best;
  }
  var lastW = 0, lastH = 0;
  L.loop(function (dt) {
    G.fit();
    if (G.w !== lastW || G.h !== lastH || !STARS) { lastW = G.w; lastH = G.h; makeStars(); }
    if (S.running && !S.drag) {
      advance(dt);
      if (S.scene.after) S.scene.after();
    }
    var c = S.c;
    if (c && (S.scene === cannon || S.scene === orbit)) S.el = O.elements(GME, c.x, c.y, c.vx, c.vy);
    if (S.scene === moon) { S.predAge += dt; if (S.predDirty || (S.running && S.predAge > 0.35)) moon.predict(); }
    camUpdate(dt);
    ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    ctx.drawImage(STARS, 0, 0, G.w, G.h);
    S.scene.draw();
    effects(performance.now());
    drawInset();
    checkMissions();
    uiTick(false);
  }, view);
  L.onTheme(function () { uiTick(true); });
  window.addEventListener('resize', function () { CH.fit(); uiTick(true); });

  /* ---------- start ---------- */
  syncSide(); syncDir();
  S.setup = { th: 0, alt: 400e3, v: 8600, gam: 0 }; writeSetup();
  setScene(store.get('scene', 'cannon'), true);
  if (S.scene === cannon) cannon.fire();
  if (/[?&]debug\b/.test(location.search)) window.OrbitLabDebug = { S: S, setScene: setScene, missions: M };
})();
