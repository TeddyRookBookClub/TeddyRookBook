/* Home page feature: a slowly turning magnetic bottle for fusion. The shape is Family 1 of the exact 3-D equilibria in
   arXiv:2610.07304, with the same formulas as /games/magnetic-bottles/physics.js: nested flux surfaces psi = r^2 delta,
   and field lines (constant u, v as the toroidal angle ze runs once around) that close after one turn while winding
   twice the short way (iota = 2). Plain 2-D canvases with additive blending, so the see-through surfaces need no depth
   sort: stars on a still layer, the soft glow on a smaller layer that the browser scales up, and the sharp lines on top.
   No libraries and no network. In Node, module.exports is the shape function, for the tests. */
(function () {
  'use strict';
  var PI = Math.PI, TAU = 2 * PI;

  /* eps = elongation, tau = symmetry breaking, frac = delta / dmax (nested tori need 0 < delta < dmax) */
  function geo(eps, tau, frac) {
    var O2 = 1 - tau * tau, O = Math.sqrt(O2), a = Math.sqrt(1 + eps) / O, b = Math.sqrt(1 - eps) / O, gam = Math.asin(tau),
      ua = -O2 * eps / 2, dmax = (1 - O2 * eps) * (1 - O2 * eps) / 4, rd = Math.sqrt(frac * dmax);
    /* the point at poloidal angle th and toroidal angle ze on psi = r^2 delta, written to o[k..k+2];
       z is measured from the middle of the bottle, zc = -tau / (2 Omega^2) */
    function surf(r, th, ze, o, k) {
      var u = ua + r * rd * Math.cos(th), v = r * rd * Math.sin(th), L = Math.sqrt((1 + Math.sqrt(1 - 4 * (u * u + v * v))) / 2),
        c = Math.cos(ze), s = Math.sin(ze);
      o[k] = a * (L * c + (u * c + v * s) / L);
      o[k + 1] = b * (L * s + (v * c - u * s) / L);
      o[k + 2] = (v * Math.cos(2 * ze + gam) - u * Math.sin(2 * ze + gam)) / O2;
    }
    return { surf: surf, zc: -tau / (2 * O2), delta: frac * dmax, dmax: dmax };
  }
  if (typeof module == 'object' && module.exports) { module.exports = geo; return; }

  try { run(); } catch (e) { }

  function run() {
    var cv = document.getElementById('sf-cv'), ctx = cv && cv.getContext && cv.getContext('2d'), host = cv && cv.parentNode;
    if (!ctx || !window.requestAnimationFrame) return;
    var G = geo(0.5, 0.4, 0.45), NL = 192, NB = 32, R0 = 1.5, FOC = 6, LX = -0.42, LY = 0.62, LZ = 0.66, MAXQ = 960;
    /* surfaces [r, rgb, alpha, glass, nt, nz]: glass 1 is lit like a glass shell, 0 only glows at its edges */
    var SF = [[1, '116,192,252', 0.7, 1, 20, 48], [0.55, '99,230,190', 0.35, 0, 14, 36]].map(mesh);
    /* field lines [r, start angle, rgb, brightness] */
    var FL = [[1, 0, '255,212,121', 1], [1, TAU / 3, '255,212,121', 1], [1, 2 * TAU / 3, '255,212,121', 1], [0.55, 1, '99,230,190', 0.6], [0.55, PI + 1, '249,168,212', 0.6]].map(fline);
    var AX = fline([0, 0, '255,228,240', 0.7]); AX.fl = 1;
    var X = new Float32Array(MAXQ), Y = new Float32Array(MAXQ), D = new Float32Array(MAXQ), V = new Float32Array(MAXQ), C = new Float32Array(MAXQ),
      Q = new Uint8Array(MAXQ), I = new Int16Array(MAXQ), K = new Int32Array(2 * NB + 1);

    /* outward unit normal of the surface psi = r^2 delta at (th, ze), written to n[k..k+2] */
    function normal(r, th, ze, n, k) {
      var a = [], h = 1e-3, ax = [];
      G.surf(r, th + h, ze, a, 0); G.surf(r, th - h, ze, a, 3); G.surf(r, th, ze + h, a, 6); G.surf(r, th, ze - h, a, 9); G.surf(0, 0, ze, ax, 0);
      var tx = a[0] - a[3], ty = a[1] - a[4], tz = a[2] - a[5], zx = a[6] - a[9], zy = a[7] - a[10], zz = a[8] - a[11];
      var nx = ty * zz - tz * zy, ny = tz * zx - tx * zz, nz = tx * zy - ty * zx, m = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      if (nx * (a[0] - ax[0]) + ny * (a[1] - ax[1]) + nz * (a[2] - ax[2]) < 0) m = -m;
      n[k] = nx / m; n[k + 1] = ny / m; n[k + 2] = nz / m;
    }
    function mesh(o) {
      var nt = o[4], nz = o[5], p = new Float32Array(3 * nt * nz), n = new Float32Array(3 * nt * nz), i, j, k;
      for (i = 0; i < nt; i++) for (j = 0; j < nz; j++) { k = 3 * (i * nz + j); G.surf(o[0], TAU * i / nt, TAU * j / nz, p, k); normal(o[0], TAU * i / nt, TAU * j / nz, n, k); }
      return { p: p, n: n, rgb: o[1], al: o[2], gl: o[3], nt: nt, nz: nz };
    }
    function fline(o) {
      var p = new Float32Array(3 * NL), n = new Float32Array(3 * NL);
      for (var i = 0; i < NL; i++) { G.surf(o[0], o[1], TAU * i / NL, p, 3 * i); normal(1, o[1], TAU * i / NL, n, 3 * i); }
      return { p: p, n: n, rgb: o[2], br: o[3], fl: o[0] < 1 ? 0.35 : 0.1, spr: sprite(o[2]) };
    }
    function sprite(rgb) {
      var c = document.createElement('canvas'), g = c.getContext('2d'), r;
      c.width = c.height = 32; r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(' + rgb + ',.8)'); r.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c;
    }
    function layer() { var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); host.insertBefore(c, cv); return c; }

    /* view: yaw turns the bottle about its own axis, el is how far above its plane we look from */
    var bg = layer(), sc = layer(), sx = sc.getContext('2d');
    var yaw = 0.6, el = 0.78, spin = 0, clock = 0, W = 0, H = 0, dpr = 1, gq = 1, s = 1, cx = 0, cy = 0, u = 1, cY, sY, cE, sE;
    function size() {
      var w = cv.clientWidth, h = cv.clientHeight, r = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h) return false;
      if (w === W && h === H && r === dpr) return true;
      W = w; H = h; dpr = r; cv.width = bg.width = Math.round(w * r); cv.height = bg.height = Math.round(h * r);
      gq = Math.max(0.5, r / 3); sc.width = Math.round(w * gq); sc.height = Math.round(h * gq);
      s = Math.min(W / 2.95, H / 2.75); cx = W / 2; cy = H / 2; u = s / 110;
      var b = bg.getContext('2d'), seed = 7, i, n = W * H / 1800;    // the stars, drawn once
      b.setTransform(r, 0, 0, r, 0, 0);
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (i = 0; i < n; i++) {
        var x = rnd() * W, y = rnd() * H, q = rnd();
        b.fillStyle = 'rgba(219,231,239,' + (0.12 + 0.6 * q * q * q).toFixed(3) + ')';
        b.beginPath(); b.arc(x, y, 0.4 + 0.8 * q, 0, TAU); b.fill();
      }
      return true;
    }
    /* project n points of p into X, Y (CSS px) and D (toward the viewer); with normals nn, C gets the normal's part
       toward the viewer and V its brightness under the light */
    function proj(p, n, nn) {
      for (var i = 0, k = 0; i < n; i++, k += 3) {
        var x = p[k] * cY - p[k + 1] * sY, y = p[k] * sY + p[k + 1] * cY, z = p[k + 2];
        var d = z * sE - y * cE, f = FOC / (FOC - d);
        X[i] = cx + s * x * f; Y[i] = cy - s * (y * sE + z * cE) * f; D[i] = d;
        if (nn) {
          x = nn[k] * cY - nn[k + 1] * sY; y = nn[k] * sY + nn[k + 1] * cY; z = nn[k + 2];
          var nc = z * sE - y * cE;
          C[i] = nc; V[i] = x * LX + (y * sE + z * cE) * LY + nc * LZ;
        }
      }
    }
    function fog(d) { return 0.3 + 0.7 * Math.max(0, Math.min(1, 0.5 + 0.5 * d / R0)); }
    function surface(S) {
      var nt = S.nt, nz = S.nz, nq = nt * nz, i, j, k, b, k0, k1, k2, k3;
      proj(S.p, nq, S.n);
      for (k = 0; k < nq; k++) {
        var nc = C[k], e = 1 - Math.abs(nc), rim = e * e * e;
        if (!S.gl) V[k] = (0.02 + 0.9 * rim) * fog(D[k]);
        else if (nc > 0) V[k] = (0.1 + 0.3 * Math.max(0, V[k]) + 0.9 * rim) * fog(D[k]);   // the near side: lit, with a bright rim
        else V[k] = (0.03 + 0.4 * rim) * fog(D[k]);              // the far side, seen through the near one
      }
      K.fill(0);
      for (i = 0; i < nt; i++) for (j = 0; j < nz; j++) {
        k0 = i * nz + j; k1 = i * nz + (j + 1) % nz; k3 = ((i + 1) % nt) * nz + j; k2 = k3 - j + (j + 1) % nz;
        var ar = (X[k2] - X[k0]) * (Y[k3] - Y[k1]) - (Y[k2] - Y[k0]) * (X[k3] - X[k1]);
        b = Math.min(NB - 1, (V[k0] + V[k1] + V[k2] + V[k3]) / 4 * NB | 0);
        Q[k0] = b = 2 * b + (ar > 0 ? 1 : 0); K[b + 1]++;          // same level and the same winding share one fill
      }
      for (b = 0; b < 2 * NB; b++) K[b + 1] += K[b];
      for (k = 0; k < nq; k++) I[K[Q[k]]++] = k;                  // quads sorted by fill (K[b] now ends fill b)
      for (b = 0, k = 0; b < 2 * NB; b++) {
        var a = S.al * ((b >> 1) + 0.5) / NB;
        if (a < 0.01) { k = K[b]; continue; }                    // too faint to see
        if (k === K[b]) continue;
        sx.beginPath();
        for (; k < K[b]; k++) {
          k0 = I[k]; i = k0 / nz | 0; j = k0 - i * nz;
          k1 = i * nz + (j + 1) % nz; k3 = ((i + 1) % nt) * nz + j; k2 = k3 - j + (j + 1) % nz;
          sx.moveTo(X[k0], Y[k0]); sx.lineTo(X[k1], Y[k1]); sx.lineTo(X[k2], Y[k2]); sx.lineTo(X[k3], Y[k3]); sx.closePath();
        }
        sx.fillStyle = 'rgba(' + S.rgb + ',' + a.toFixed(3) + ')'; sx.fill();
      }
    }
    /* how much of a line point shows: full on the near side of the bottle, dim behind it */
    function shows(L, i) { var t = Math.max(0, Math.min(1, (C[i] + 0.12) / 0.3)); return L.br * fog(D[i]) * (L.fl + (1 - L.fl) * t); }
    /* a closed curve on context g in 6 brightness levels, with [width, alpha] passes */
    function curve(L, g, passes) {
      var i, j, l, w;
      proj(L.p, NL, L.n);
      for (i = 0; i < NL; i++) { j = (i + 1) % NL; Q[i] = Math.min(5, (shows(L, i) + shows(L, j)) * 3 | 0); }
      for (l = 0; l < 6; l++) {
        g.beginPath();
        for (i = 0; i < NL; i++) if (Q[i] === l) {
          j = (i + 1) % NL;
          if (Q[(i + NL - 1) % NL] !== l || !i) g.moveTo(X[i], Y[i]);
          g.lineTo(X[j], Y[j]);
        }
        for (w = 0; w < passes.length; w++) {
          g.lineWidth = passes[w][0] * u; g.strokeStyle = 'rgba(' + L.rgb + ',' + (passes[w][1] * (l + 0.5) / 6).toFixed(3) + ')'; g.stroke();
        }
      }
    }
    function draw() {
      if (!size()) return;
      cY = Math.cos(yaw); sY = Math.sin(yaw); cE = Math.cos(el); sE = Math.sin(el);
      /* the soft glow: surfaces, the hot plasma along the magnetic axis, halos around the field lines */
      sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, sc.width, sc.height);
      sx.setTransform(gq, 0, 0, gq, 0, 0); sx.globalCompositeOperation = 'lighter'; sx.lineCap = sx.lineJoin = 'round';
      SF.forEach(surface);
      proj(AX.p, NL);
      sx.beginPath(); sx.moveTo(X[0], Y[0]); for (var i = 4; i < NL; i += 4) sx.lineTo(X[i], Y[i]); sx.closePath();
      [[44, 0.05], [24, 0.08], [10, 0.14]].forEach(function (q) { sx.lineWidth = q[0] * u; sx.strokeStyle = 'rgba(249,168,212,' + q[1] + ')'; sx.stroke(); });
      FL.forEach(function (L) { curve(L, sx, [[6, 0.14]]); });
      /* sharp lines keep their own color; sparks stream along them */
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      curve(AX, ctx, [[1.3, 0.85]]);
      FL.forEach(function (L, m) {
        ctx.globalCompositeOperation = 'source-over';
        curve(L, ctx, [[1.7, 1]]);
        ctx.globalCompositeOperation = 'lighter';
        for (var k = 0; k < 2; k++) {
          var t = ((clock * 0.04 + k / 2 + m * 0.13) % 1) * NL, i = t | 0, f = t - i, j = (i + 1) % NL;
          var x = X[i] + (X[j] - X[i]) * f, y = Y[i] + (Y[j] - Y[i]) * f, a = shows(L, i), r = (4 + 6 * a) * u;
          ctx.globalAlpha = Math.min(1, a); ctx.drawImage(L.spr, x - r, y - r, 2 * r, 2 * r);
        }
        ctx.globalAlpha = 1;
      });
    }

    /* the loop: runs only while the band is on screen and the tab is visible; reduced motion draws on demand */
    var mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)'), still = !!(mq && mq.matches);
    var raf = 0, last = 0, seen = false, drag = null, moved = false;
    function ok() { return seen && !document.hidden; }
    function kick() { if (!raf && ok()) { last = 0; raf = requestAnimationFrame(tick); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function tick(t) {
      raf = 0;
      try {
        if (!still && ok()) raf = requestAnimationFrame(tick);
        if (last && t - last < 28 && !still && !(drag && moved)) return;   // about 30 frames a second is plenty for a slow turn
        var dt = last ? Math.min(0.1, (t - last) / 1000) : 0; last = t;
        if (!still) {
          clock += dt; spin *= Math.exp(-2.5 * dt);
          if (!drag) yaw += (0.22 + spin) * dt;
        }
        draw();
      } catch (e) { stop(); }
    }
    if (mq && mq.addEventListener) mq.addEventListener('change', function () { still = mq.matches; kick(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; if (seen) kick(); else stop(); }, { rootMargin: '80px' }).observe(cv);
    else { seen = true; kick(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else kick(); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (still || !raf) kick(); }).observe(cv);
    else window.addEventListener('resize', kick);

    /* drag to turn (touch: sideways only, so the page still scrolls); a drag never follows the link */
    host.addEventListener('pointerdown', function (e) { if (e.button) return; drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId }; moved = false; });
    host.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = Math.max(8, e.timeStamp - drag.t);
      if (!moved) { if (dx * dx + dy * dy < 36) return; moved = true; try { host.setPointerCapture(e.pointerId); } catch (_) { } }
      yaw += dx * 0.01; spin = Math.max(-4, Math.min(4, dx * 10 / dt));
      if (e.pointerType !== 'touch') el = Math.max(0.12, Math.min(1.25, el + dy * 0.006));
      drag.x = e.clientX; drag.y = e.clientY; drag.t = e.timeStamp;
      if (still) kick();
    });
    function end(e) { if (drag && e.pointerId === drag.id) { if (e.timeStamp - drag.t > 80) spin = 0; drag = null; } }
    host.addEventListener('pointerup', end);
    host.addEventListener('pointercancel', end);
    host.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } });
    host.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
})();
