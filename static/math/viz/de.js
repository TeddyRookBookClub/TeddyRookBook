/* Math Ladder visuals for Differential Equations (course key "de"), registered on window.MathLadder.viz.
   Load after viz/core.js (and viz/adv.js, whose .mla layout classes these reuse). Each visual works with mouse, touch
   and keyboard, follows the light or dark theme, keeps a live text readout and has an aria-label.

   de-phaseline: an autonomous equation y' = f(y): the graph of f beside the phase line, and solution curves y(t).
     opts:
       f: "y*(1 - y/4) - H"        the right side in y (CAS plain syntax; other letters are parameters)
       params: {"H": [0, 2, 0, 0.05]}   sliders [min, max, value, step] (optional)
       ymin: -1, ymax: 5           the y window (shared by both panels)
       tmax: 6                     length of the t axis
       y0: 1                       starting value of the highlighted solution (drag it, or use the arrow keys)
       curves: 7                   how many background solutions to draw (0 for none)
       task, label                 a task line above / the aria-label
     Equilibria are found numerically and marked: filled dot = stable, hollow = unstable, half-filled = semi-stable.

   de-fourier: partial sums of a Fourier series converging to a periodic function, with the jumps' midpoints marked.
     opts:
       fn: "square"                on (-L, L) for ext "full": "square" (−1 | 1), "saw" (x), "tri" (|x|), "para" (x²),
                                   "half" (0 | 1), "ramp" (0 | x); on (0, L) for ext "odd"/"even": "const" (1), "x", "Lmx" (L − x), "para" (x²)
       ext: "full"                 "full" series on (−L, L), or the "odd" (sine series) / "even" (cosine series) extension of a function on (0, L)
       L: 1                        half-period (a number, or "pi")
       N: 3, maxN: 40              terms in the partial sum (slider) and the most offered
       coef: true                  a strip of coefficient sizes under the graph
       task, label

   de-pde: heat flow in a rod or a vibrating string on 0 ≤ x ≤ π with fixed (zero) ends, animated in time.
     opts:
       type: "heat"                "heat" (u_t = k u_xx) or "wave" (u_tt = c² u_xx)
       k: 1, c: 1                  diffusivity / wave speed
       modes: [[1, 1], [3, 0.5]]   initial shape u(x, 0) = Σ b_n sin nx, as [n, b_n] pairs
       shape: null                 or a preset initial shape: "pluck" (a triangle), "box" (a raised block), "bump"
       vel: []                     wave only: initial velocity u_t(x, 0) = Σ g_n sin nx, as [n, g_n]
       terms: 25                   terms used for a preset shape
       tmax: 3                     length of the time slider (seconds of model time)
       showModes: false            draw the separate modes faintly
       play: false                 start playing (never when the visitor prefers less motion)
       task, label                                                                                                   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/de.js: load viz/core.js first'); return; }
  var M = Math, PI = M.PI, fm = V.fmt;
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in o || {}) if (o[k] !== undefined) r[k] = o[k]; return r; }
  function num(v, d) { if (typeof v === 'number') return v; if (v === 'pi') return PI; var x = parseFloat(v); return isFinite(x) ? x : d; }
  function el(tag, cls, html) { return V.el(tag, cls, html); }
  function frame(e, o, label) {
    e.classList.add('mla'); e.setAttribute('role', 'group'); if (!e.getAttribute('aria-label')) e.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = el('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); e.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (er) { } }
    F.box = el('div', 'mla-box'); e.appendChild(F.box);
    F.ctl = el('div', 'ml-ctl'); e.appendChild(F.ctl);
    F.out = V.readout(e);
    return F;
  }
  function rgba(hex, a) { var v = parseInt(String(hex).slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function txt(ctx, s, x, y, q) { q = q || {}; var k = V.colors(); ctx.save(); ctx.fillStyle = q.color || k.ink; ctx.font = (q.italic ? 'italic ' : '') + (q.bold ? '700 ' : '') + (q.size || 13) + 'px ' + (q.italic ? 'Georgia,serif' : 'system-ui,sans-serif'); ctx.textAlign = q.align || 'left'; ctx.textBaseline = q.base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }
  function compile(src, vars, P) { // CAS plain string -> fast function; extra letters read from P
    var C = W.CAS; if (!C) throw new Error('viz/de.js needs the CAS');
    var t = C.parse(String(src)), ex = Object.keys(C.freeVars(t)).filter(function (v) { return vars.indexOf(v) < 0 && v !== 'e' && v !== 'π' && v !== 'pi'; });
    var g = C.compile(t, vars.concat(ex));
    return function () { var a = Array.prototype.slice.call(arguments); ex.forEach(function (n) { a.push(P && P[n] != null ? P[n] : 1); }); try { var r = g.apply(null, a); return typeof r === 'number' ? r : NaN; } catch (er) { return NaN; } };
  }
  function params(p) { var out = []; for (var k in p || {}) { var v = p[k]; if (typeof v === 'number') v = [v - 5, v + 5, v]; if (Array.isArray(v)) out.push({ name: k, min: v[0], max: v[1], value: v[2] != null ? v[2] : v[0], step: v[3] || 0.05 }); else out.push({ name: k, min: v.min, max: v.max, value: v.value, step: v.step || 0.05, label: v.label }); } return out; }

  // ------------------------------------------------------------------------------------------------ de-phaseline
  V.register('de-phaseline', function (e, o) {
    o = opt(o, { f: 'y*(1 - y/4)', ymin: -1, ymax: 5, tmax: 6, y0: 1, curves: 7 });
    var P = {}, ps = params(o.params); ps.forEach(function (p) { P[p.name] = p.value; });
    var f = compile(o.f, ['y'], P), y0 = num(o.y0, 1), ymin = num(o.ymin, -1), ymax = num(o.ymax, 5), tmax = num(o.tmax, 6);
    var F = frame(e, o, 'Phase line and solution curves for y′ = ' + o.f), c = V.canvas(F.box, { aspect: 1.55, max: 440, min: 300 });
    c.cv.setAttribute('aria-label', 'Left: the graph of f(y) and the phase line. Right: solutions y(t). Up and down arrow keys move the starting value.'); c.cv.tabIndex = 0;
    ps.forEach(function (p) { V.slider(F.ctl, { label: p.label || p.name, min: p.min, max: p.max, step: p.step, value: p.value, input: function (v) { P[p.name] = v; draw(); } }); });
    var L = {};
    function layout() { var w = c.w, h = c.h, pad = 8, gw = M.max(110, M.min(220, w * 0.36)); L = { ax: pad + 26, aw: gw - 30, bx: gw + 22, bw: w - gw - 30, top: 22, hh: h - 50 }; }
    function Y(y) { return L.top + (ymax - y) / (ymax - ymin) * L.hh; }
    function yOf(py) { return ymax - (py - L.top) / L.hh * (ymax - ymin); }
    function equilibria() {
      var N = 1200, out = [], h = (ymax - ymin) / N, prev = f(ymin), py = ymin, fmax = 0, i, v;
      for (i = 0; i <= N; i++) { v = f(ymin + i * h); if (isFinite(v)) fmax = M.max(fmax, M.abs(v)); }
      for (i = 1; i <= N; i++) {
        var y = ymin + i * h, fy = f(y);
        if (isFinite(prev) && isFinite(fy)) {
          if (prev === 0) out.push(py);
          else if (prev * fy < 0) { var a = py, b = y, fa = prev; for (var j = 0; j < 50; j++) { var m = (a + b) / 2, fmv = f(m); if (fa * fmv <= 0) b = m; else { a = m; fa = fmv; } } out.push((a + b) / 2); }
          else if (i > 1) { var y2 = py - h, f2 = f(y2); if (M.abs(prev) < M.abs(f2) && M.abs(prev) < M.abs(fy) && M.abs(prev) < 1e-3 * (fmax || 1)) { // touching zero: refine by minimizing |f|
            var lo = y2, hi = y; for (var k2 = 0; k2 < 60; k2++) { var m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (M.abs(f(m1)) < M.abs(f(m2))) hi = m2; else lo = m1; } var yz = (lo + hi) / 2; if (M.abs(f(yz)) < 1e-6 * (fmax || 1)) out.push(yz); } }
        }
        prev = fy; py = y;
      }
      var uniq = []; out.forEach(function (z) { if (!uniq.some(function (u) { return M.abs(u - z) < h * 1.5; })) uniq.push(z); });
      return uniq.map(function (z) { var d = (ymax - ymin) * 1e-3, l = f(z - d), r = f(z + d); return { y: z, cls: l > 0 && r < 0 ? 'stable' : l < 0 && r > 0 ? 'unstable' : 'semi-stable' }; });
    }
    function sol(yy0) { var pts = [[0, yy0]], y = yy0, h = tmax / 400, span = ymax - ymin; for (var i = 1; i <= 400; i++) { var t = (i - 1) * h, k1 = f(y), k2 = f(y + h * k1 / 2), k3 = f(y + h * k2 / 2), k4 = f(y + h * k3); y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; if (!isFinite(y) || y > ymax + span || y < ymin - span) break; pts.push([i * h, y]); } return pts; }
    function draw() {
      layout(); var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, eqs = equilibria();
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      // left panel: f(y) sideways, phase line at f = 0
      var fmax = 0; for (var i = 0; i <= 200; i++) { var v = f(ymin + (ymax - ymin) * i / 200); if (isFinite(v)) fmax = M.max(fmax, M.abs(v)); } fmax = fmax || 1;
      var cx = L.ax + L.aw / 2, FX = function (v) { return cx + v / fmax * (L.aw / 2 - 6); };
      ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L.ax, L.top); ctx.lineTo(L.ax, L.top + L.hh); ctx.stroke();
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L.ax - 4, Y(0)); ctx.lineTo(L.ax + L.aw, Y(0)); ctx.stroke();
      // the phase line itself
      ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, L.top); ctx.lineTo(cx, L.top + L.hh); ctx.stroke();
      // f(y) curve
      ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2.4; ctx.beginPath(); var started = false; for (i = 0; i <= 300; i++) { var yy = ymin + (ymax - ymin) * i / 300, fv = f(yy); if (!isFinite(fv)) { started = false; continue; } if (started) ctx.lineTo(FX(fv), Y(yy)); else { ctx.moveTo(FX(fv), Y(yy)); started = true; } } ctx.stroke(); ctx.restore();
      // arrows on the phase line between equilibria
      var cuts = [ymin].concat(eqs.map(function (q) { return q.y; }), [ymax]);
      for (i = 0; i < cuts.length - 1; i++) { var a = cuts[i], b = cuts[i + 1]; if (b - a < (ymax - ymin) * 0.06) continue; var ym = (a + b) / 2, s = f(ym); if (!isFinite(s) || s === 0) continue; var up = s > 0, py = Y(ym); ctx.fillStyle = up ? k.green : k.red; ctx.beginPath(); if (up) { ctx.moveTo(cx, py - 9); ctx.lineTo(cx - 7, py + 6); ctx.lineTo(cx + 7, py + 6); } else { ctx.moveTo(cx, py + 9); ctx.lineTo(cx - 7, py - 6); ctx.lineTo(cx + 7, py - 6); } ctx.closePath(); ctx.fill(); }
      txt(ctx, 'f(y)', L.ax + L.aw - 2, 10, { align: 'right', italic: true, size: 12, color: k.purple });
      txt(ctx, 'y', L.ax - 6, 10, { italic: true, size: 13, align: 'right' });
      // y tick labels
      var step = (ymax - ymin) > 12 ? 5 : (ymax - ymin) > 6 ? 2 : 1;
      for (var tv = M.ceil(ymin / step) * step; tv <= ymax + 1e-9; tv += step) { txt(ctx, fm(tv), L.ax - 6, Y(tv), { align: 'right', size: 11, color: k.muted }); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L.bx, Y(tv)); ctx.lineTo(L.bx + L.bw, Y(tv)); ctx.stroke(); }
      // right panel: solutions
      var TX = function (t) { return L.bx + t / tmax * L.bw; };
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L.bx, L.top); ctx.lineTo(L.bx, L.top + L.hh); ctx.moveTo(L.bx, Y(M.max(ymin, M.min(ymax, 0)))); ctx.lineTo(L.bx + L.bw, Y(M.max(ymin, M.min(ymax, 0)))); ctx.stroke();
      txt(ctx, 't', L.bx + L.bw - 4, Y(M.max(ymin, M.min(ymax, 0))) + 12, { italic: true, size: 13, align: 'right' });
      eqs.forEach(function (q) { ctx.save(); ctx.strokeStyle = q.cls === 'stable' ? k.green : q.cls === 'unstable' ? k.red : k.gold; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(L.bx, Y(q.y)); ctx.lineTo(L.bx + L.bw, Y(q.y)); ctx.stroke(); ctx.restore(); });
      var nC = o.curves | 0; ctx.save(); ctx.beginPath(); ctx.rect(L.bx, L.top - 2, L.bw + 2, L.hh + 4); ctx.clip();
      for (i = 0; i < nC; i++) { var s0 = ymin + (ymax - ymin) * (i + 0.5) / nC, pts = sol(s0); ctx.strokeStyle = rgba(k.teal, 0.55); ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach(function (p, j) { if (j) ctx.lineTo(TX(p[0]), Y(p[1])); else ctx.moveTo(TX(p[0]), Y(p[1])); }); ctx.stroke(); }
      var main = sol(y0); ctx.strokeStyle = k.blue; ctx.lineWidth = 3; ctx.beginPath(); main.forEach(function (p, j) { if (j) ctx.lineTo(TX(p[0]), Y(p[1])); else ctx.moveTo(TX(p[0]), Y(p[1])); }); ctx.stroke(); ctx.restore();
      // equilibrium dots on the phase line
      eqs.forEach(function (q) { var py = Y(q.y), col = q.cls === 'stable' ? k.green : q.cls === 'unstable' ? k.red : k.gold; ctx.save(); ctx.lineWidth = 2.5; ctx.strokeStyle = col; ctx.fillStyle = k.bg; ctx.beginPath(); ctx.arc(cx, py, 7, 0, 2 * PI); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; if (q.cls === 'stable') { ctx.beginPath(); ctx.arc(cx, py, 7, 0, 2 * PI); ctx.fill(); } else if (q.cls === 'semi-stable') { var fl = f(q.y - (ymax - ymin) * 1e-3) > 0; ctx.beginPath(); ctx.arc(cx, py, 7, fl ? 0 : PI, fl ? PI : 2 * PI); ctx.fill(); } ctx.restore(); });
      // the draggable start
      var kp = [L.bx, Y(y0)]; ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = k.blue; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(kp[0], kp[1], 8, 0, 2 * PI); ctx.fill(); ctx.stroke(); ctx.fillStyle = k.blue; ctx.beginPath(); ctx.arc(kp[0], kp[1], 3.5, 0, 2 * PI); ctx.fill(); if (focus) { ctx.strokeStyle = k.gold; ctx.setLineDash([4, 3]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(kp[0], kp[1], 13, 0, 2 * PI); ctx.stroke(); } ctx.restore();
      // readout
      var end = main[main.length - 1][1], fate = main.length < 401 ? (end > y0 ? 'grows past the window' : 'falls past the window') : 'levels off near ' + fm(end, 2);
      var near = eqs.filter(function (q) { return M.abs(q.y - end) < (ymax - ymin) * 0.02; })[0]; if (near && main.length >= 401) fate = 'approaches the ' + near.cls + ' equilibrium ' + fm(near.y, 2);
      var parts = eqs.length ? eqs.map(function (q) { return '<b>' + fm(q.y, 2) + '</b> (' + q.cls + ')'; }).join(', ') : 'none in this window';
      F.out.set('Equilibria: ' + parts + '. Arrows show the sign of <i>f</i>(<i>y</i>): up where <i>f</i> &gt; 0, down where <i>f</i> &lt; 0. ' + ps.map(function (p) { return p.name + ' = ' + fm(P[p.name], 2); }).join(', ') + (ps.length ? '. ' : '') + 'The solution from <i>y</i>(0) = ' + fm(y0, 2) + ' ' + fate + '.');
    }
    var focus = false;
    V.drag(c.cv, { hit: function (px, py) { return M.abs(px - L.bx) < 30 || px > L.bx ? 1 : null; }, move: function (hd, px, py) { y0 = M.max(ymin, M.min(ymax, M.round(yOf(py) * 20) / 20)); draw(); } });
    c.cv.addEventListener('keydown', function (ev) { var d = ev.key === 'ArrowUp' ? 1 : ev.key === 'ArrowDown' ? -1 : 0; if (!d) return; y0 = M.max(ymin, M.min(ymax, M.round((y0 + d * (ymax - ymin) / (ev.shiftKey ? 10 : 50)) * 100) / 100)); draw(); ev.preventDefault(); });
    c.cv.addEventListener('focus', function () { focus = true; draw(); }); c.cv.addEventListener('blur', function () { focus = false; draw(); });
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ------------------------------------------------------------------------------------------------ de-fourier
  var BASE = {
    square: function (x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }, saw: function (x) { return x; }, tri: function (x) { return M.abs(x); }, para: function (x) { return x * x; },
    half: function (x) { return x > 0 ? 1 : 0; }, ramp: function (x) { return x > 0 ? x : 0; }, 'const': function () { return 1; }, x: function (x) { return x; }
  };
  var FNAME = { square: 'a square wave', saw: 'f(x) = x', tri: 'f(x) = |x|', para: 'f(x) = x²', half: 'a half-on step', ramp: 'a ramp that is 0 on the left', 'const': 'f(x) = 1', x: 'f(x) = x', Lmx: 'f(x) = L − x' };
  V.register('de-fourier', function (e, o) {
    o = opt(o, { fn: 'square', ext: 'full', L: 1, N: 3, maxN: 40, coef: true });
    var Lh = num(o.L, 1), ext = o.ext, base = o.fn === 'Lmx' ? function (x) { return Lh - x; } : (BASE[o.fn] || BASE.square), maxN = M.max(1, M.min(80, o.maxN | 0)), S = { N: M.max(1, M.min(maxN, o.N | 0)) };
    function f0(x) { // one period on (-L, L)
      if (ext === 'odd') return x > 0 ? base(x) : x < 0 ? -base(-x) : 0;
      if (ext === 'even') return base(M.abs(x));
      return base(x);
    }
    function per(x) { var p = 2 * Lh, y = ((x + Lh) % p + p) % p - Lh; return y; }
    function fp(x) { return f0(per(x)); }
    // coefficients by Simpson's rule (split at 0 where most jumps sit)
    var a = [], b = [];
    function simpson(g, lo, hi, n) { var hh = (hi - lo) / n, s = g(lo) + g(hi); for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * g(lo + i * hh); return s * hh / 3; }
    function integ(g) { var eps = 1e-9; return simpson(g, -Lh + eps, -eps, 1200) + simpson(g, eps, Lh - eps, 1200); }
    for (var n = 0; n <= maxN; n++) { (function (n) { var w = n * PI / Lh; a[n] = integ(function (x) { return f0(x) * M.cos(w * x); }) / Lh; b[n] = n ? integ(function (x) { return f0(x) * M.sin(w * x); }) / Lh : 0; })(n); }
    for (n = 0; n <= maxN; n++) { if (M.abs(a[n]) < 1e-7) a[n] = 0; if (M.abs(b[n]) < 1e-7) b[n] = 0; }
    function SN(x) { var s = a[0] / 2; for (var k = 1; k <= S.N; k++) { var w = k * PI / Lh; s += a[k] * M.cos(w * x) + b[k] * M.sin(w * x); } return s; }
    var kindName = ext === 'odd' ? 'sine series (odd extension)' : ext === 'even' ? 'cosine series (even extension)' : 'Fourier series';
    var F = frame(e, o, 'Partial sums of the ' + kindName + ' of ' + (FNAME[o.fn] || o.fn)), c = V.canvas(F.box, { aspect: 1.9, max: 380, min: 240 });
    c.cv.setAttribute('aria-label', 'The function and a Fourier partial sum over three periods.'); c.cv.style.touchAction = 'pan-y'; c.cv.style.touchAction = 'pan-y';
    var c2 = o.coef ? V.canvas(F.box, { height: 74 }) : null; if (c2) { c2.cv.style.marginTop = '6px'; c2.cv.setAttribute('aria-hidden', 'true'); }
    var sl = V.slider(F.ctl, { label: 'terms N', min: 1, max: maxN, step: 1, value: S.N, input: function (v) { S.N = v; draw(); } });
    // jumps of the periodic function (where one-sided limits differ)
    var jumps = []; (function () { var cand = [0, Lh, -Lh]; cand.forEach(function (x0) { var d = 1e-7, l = fp(x0 - d), r = fp(x0 + d); if (M.abs(l - r) > 1e-4) jumps.push([x0, (l + r) / 2]); }); })();
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, x0 = -3 * Lh, x1 = 3 * Lh, ymn = Infinity, ymx = -Infinity, i;
      for (i = 0; i <= 600; i++) { var xx = x0 + (x1 - x0) * i / 600, v1 = fp(xx); ymn = M.min(ymn, v1); ymx = M.max(ymx, v1); }
      var pad = (ymx - ymn) * 0.28 || 1; ymn -= pad; ymx += pad;
      var P = V.plane(c, { xmin: x0, xmax: x1, ymin: ymn, ymax: ymx }), isPi = o.L === 'pi';
      P.clear(); if (isPi) { var spY = (ymx - ymn) > 8 ? 2 : (ymx - ymn) > 4 ? 1 : 0.5; P.grid({ minor: false, step: PI / 2, stepY: spY }); P.axes({ labels: false }); var ya = P.Y(0); for (var mm = -3; mm <= 3; mm++) { if (!mm) continue; var lab = (M.abs(mm) === 1 ? (mm < 0 ? '−' : '') : (mm < 0 ? '−' : '') + M.abs(mm)) + 'π', pxx = P.X(mm * PI); if (pxx > 12 && pxx < c.w - 12) txt(ctx, lab, pxx, M.min(ya + 12, c.h - 10), { align: 'center', size: 12, color: k.muted }); } var dyv = spY; for (var yv = M.ceil(ymn / dyv) * dyv; yv <= ymx; yv += dyv) { if (M.abs(yv) < dyv / 2) continue; txt(ctx, fm(yv, 3), M.max(P.X(0) - 5, 28), P.Y(yv), { align: 'right', size: 12, color: k.muted }); } } else { P.grid({ minor: false }); P.axes(); }
      // the function, drawn piecewise (gaps at jumps)
      ctx.save(); ctx.strokeStyle = rgba(k.ink, 0.55); ctx.lineWidth = 2.2; ctx.setLineDash([6, 4]); ctx.beginPath(); var prev = null;
      for (i = 0; i <= 1200; i++) { var x = x0 + (x1 - x0) * i / 1200, y = fp(x); if (prev && M.abs(y - prev[1]) > (ymx - ymn) * 0.2) { ctx.stroke(); ctx.beginPath(); ctx.moveTo(P.X(x), P.Y(y)); } else if (prev) ctx.lineTo(P.X(x), P.Y(y)); else ctx.moveTo(P.X(x), P.Y(y)); prev = [x, y]; }
      ctx.stroke(); ctx.restore();
      // partial sum
      ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 2.6; ctx.beginPath(); for (i = 0; i <= 1600; i++) { var xs = x0 + (x1 - x0) * i / 1600, ys = SN(xs); if (i) ctx.lineTo(P.X(xs), P.Y(ys)); else ctx.moveTo(P.X(xs), P.Y(ys)); } ctx.stroke(); ctx.restore();
      // jump midpoints
      var shown = [];
      jumps.forEach(function (j) { for (var m = -3; m <= 3; m++) { var xj = j[0] + 2 * Lh * m; if (xj < x0 - 1e-9 || xj > x1 + 1e-9 || shown.some(function (s) { return M.abs(s - xj) < 1e-9; })) continue; shown.push(xj); P.point(xj, j[1], { color: 'gold', r: 5.5, hollow: true }); } });
      // overshoot near the first jump
      var over = '';
      if (jumps.length) { var j0 = jumps[0][0], mx = -Infinity, lo = Infinity, hiF = M.max(fp(j0 - 1e-7), fp(j0 + 1e-7)), loF = M.min(fp(j0 - 1e-7), fp(j0 + 1e-7)); for (i = 1; i <= 800; i++) { var xq = j0 - Lh * 0.5 + Lh * i / 800, sv = SN(xq); mx = M.max(mx, sv); lo = M.min(lo, sv); } var jump = hiF - loF; var ov = 100 * M.max(0, mx - hiF) / jump; if (jump > 1e-6) over = ' At the jump at x = ' + (o.L === 'pi' && M.abs(j0) > 1e-9 ? (j0 < 0 ? '−' : '') + 'π' : fm(j0, 2)) + ' the partial sums pass through the midpoint ' + fm(jumps[0][1], 2) + (ov >= 1 ? '; just beside it they overshoot by ' + fm(ov, 1) + '% of the jump. As N grows, the overshoot gets narrower but tends to about 9% of the jump instead of disappearing (the Gibbs phenomenon).' : '. Add terms and watch a small overshoot (about 9% of the jump) form beside it.'); }
      // coefficient strip
      if (c2) { var g = c2.ctx, W2 = c2.w, H2 = c2.h, nShow = M.min(maxN, 24), bw = (W2 - 50) / nShow, mxc = 0; for (i = 1; i <= nShow; i++) mxc = M.max(mxc, M.abs(a[i]), M.abs(b[i])); mxc = mxc || 1;
        g.fillStyle = k.bg; g.fillRect(0, 0, W2, H2); txt(g, ext === 'even' ? '|aₙ|' : ext === 'odd' ? '|bₙ|' : '|aₙ|, |bₙ|', 4, 12, { size: 11, color: k.muted });
        for (i = 1; i <= nShow; i++) { var hA = M.abs(a[i]) / mxc * (H2 - 26), hB = M.abs(b[i]) / mxc * (H2 - 26), xb = 44 + (i - 1) * bw; g.fillStyle = i <= S.N ? k.blue : rgba(k.muted, 0.35); if (ext !== 'odd' && hA > 0.5) g.fillRect(xb, H2 - 14 - hA, M.max(2, bw * (ext === 'full' ? 0.4 : 0.7)), hA); g.fillStyle = i <= S.N ? k.orange : rgba(k.muted, 0.35); if (ext !== 'even' && hB > 0.5) g.fillRect(xb + (ext === 'full' ? bw * 0.42 : 0), H2 - 14 - hB, M.max(2, bw * (ext === 'full' ? 0.4 : 0.7)), hB); if (i === 1 || i % 5 === 0) txt(g, String(i), xb + bw * 0.35, H2 - 6, { size: 10, color: k.muted, align: 'center' }); } }
      F.out.set('Dashed: ' + (FNAME[o.fn] || o.fn) + (ext === 'full' ? '' : ' on (0, ' + fm(Lh, 3) + '), extended as an ' + (ext === 'odd' ? 'odd' : 'even') + ' function') + ' with period ' + (o.L === 'pi' ? '2π' : fm(2 * Lh, 3)) + '. Blue: the sum of the first ' + S.N + ' term' + (S.N === 1 ? '' : 's') + ' of its ' + kindName + '.' + (jumps.length ? over : ' This extension has no jumps, so the partial sums close in on it everywhere, and quickly.'));
    }
    c.onResize(draw); if (c2) c2.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw, set: function (N) { S.N = N; sl.set(N); draw(); } };
  });

  // ------------------------------------------------------------------------------------------------ de-pde
  V.register('de-pde', function (e, o) {
    o = opt(o, { type: 'heat', k: 1, c: 1, modes: [[1, 1], [3, 0.5]], shape: null, vel: [], terms: 25, tmax: 3, showModes: false, play: false });
    var heat = o.type !== 'wave', kk = num(o.k, 1), cc = num(o.c, 1), modes = [];
    if (o.shape === 'pluck') for (var n = 1; n <= o.terms; n++) modes.push([n, 8 / (PI * PI * n * n) * M.sin(n * PI / 2)]);
    else if (o.shape === 'box') for (n = 1; n <= o.terms; n++) modes.push([n, (2 / (n * PI)) * (M.cos(n * PI / 3) - M.cos(2 * n * PI / 3))]);
    else if (o.shape === 'bump') for (n = 1; n <= o.terms; n++) modes.push([n, n === 1 ? 0.5 : 0]); // fallback: a pure mode
    else modes = (o.modes || []).map(function (m) { return [m[0] | 0, +m[1]]; });
    var vel = heat ? [] : (o.vel || []).map(function (m) { return [m[0] | 0, +m[1]]; });
    var S = { t: 0 }, T = num(o.tmax, 3), anim = null;
    function u(x, t) { var s = 0; modes.forEach(function (m) { var nn = m[0]; s += m[1] * (heat ? M.exp(-kk * nn * nn * t) : M.cos(nn * cc * t)) * M.sin(nn * x); }); if (!heat) vel.forEach(function (m) { var nn = m[0]; s += m[1] / (nn * cc) * M.sin(nn * cc * t) * M.sin(nn * x); }); return s; }
    var umax = 0; for (var i = 0; i <= 200; i++) { var xx = PI * i / 200; umax = M.max(umax, M.abs(u(xx, 0))); if (!heat) for (var j = 1; j <= 20; j++) umax = M.max(umax, M.abs(u(xx, T * j / 20))); } umax = umax || 1;
    var F = frame(e, o, heat ? 'Heat flow in a rod with ends held at 0' : 'A vibrating string with fixed ends'), c = V.canvas(F.box, { aspect: 1.9, max: 340, min: 220 });
    c.cv.setAttribute('aria-label', heat ? 'The temperature along the rod at the chosen time, with the rod colored by temperature.' : 'The shape of the string at the chosen time.'); c.cv.style.touchAction = 'pan-y';
    var ts = V.slider(F.ctl, { label: 'time t', min: 0, max: T, step: T / 300, value: 0, fmt: function (v) { return fm(v, 2); }, input: function (v) { S.t = v; stop(); draw(); } });
    var pb = V.button(F.ctl, '▶ Play', toggle, 'pri');
    function stop() { if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Play'; } }
    function toggle() {
      if (anim) { stop(); return; }
      if (S.t >= T - 1e-9) S.t = 0; pb.textContent = '❚❚ Pause';
      anim = V.loop(e, function (dt) { S.t = M.min(T, S.t + dt * T / 6); ts.set(S.t); draw(); if (S.t >= T) stop(); }); anim.start();
    }
    function heatColor(v) { var s = M.max(-1, M.min(1, v / umax)); if (s >= 0) return 'rgba(' + M.round(214) + ',' + M.round(51 + (1 - s) * 120) + ',' + M.round(108 * (1 - s) + 40) + ',' + (0.25 + 0.75 * s) + ')'; return 'rgba(28,111,214,' + (0.25 + 0.75 * -s) + ')'; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, t = S.t;
      var P = V.plane(c, { xmin: -0.25, xmax: PI + 0.25, ymin: -umax * 1.25 - (heat ? umax * 0.55 : 0), ymax: umax * 1.25 });
      P.clear(); P.grid({ minor: false, step: PI / 4, stepY: umax / 2 }); P.axes({ labels: false });
      ['π/4', 'π/2', '3π/4'].forEach(function (lb, i3) { txt(ctx, lb, P.X(PI * (i3 + 1) / 4), P.Y(0) + 12, { align: 'center', size: 11, color: k.muted }); });
      (heat ? [1] : [-1, 1]).forEach(function (sg) { txt(ctx, fm(sg * umax, 2), M.max(P.X(0) - 5, 26), P.Y(sg * umax), { align: 'right', size: 11, color: k.muted }); });
      if (o.showModes) modes.concat(vel).slice(0, 6).forEach(function (m) { ctx.save(); ctx.strokeStyle = rgba(k.purple, 0.35); ctx.lineWidth = 1.3; ctx.beginPath(); for (var i2 = 0; i2 <= 200; i2++) { var x2 = PI * i2 / 200, y2 = m[1] * (heat ? M.exp(-kk * m[0] * m[0] * t) : M.cos(m[0] * cc * t)) * M.sin(m[0] * x2); if (i2) ctx.lineTo(P.X(x2), P.Y(y2)); else ctx.moveTo(P.X(x2), P.Y(y2)); } ctx.stroke(); ctx.restore(); });
      if (!heat) { ctx.save(); ctx.strokeStyle = rgba(k.blue, 0.22); ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.beginPath(); for (i = 0; i <= 200; i++) { var xi = PI * i / 200; if (i) ctx.lineTo(P.X(xi), P.Y(u(xi, 0))); else ctx.moveTo(P.X(xi), P.Y(u(xi, 0))); } ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.strokeStyle = heat ? k.red : k.blue; ctx.lineWidth = 3; ctx.beginPath(); for (i = 0; i <= 300; i++) { var x = PI * i / 300; if (i) ctx.lineTo(P.X(x), P.Y(u(x, t))); else ctx.moveTo(P.X(x), P.Y(u(x, t))); } ctx.stroke(); ctx.restore();
      P.point(0, 0, { color: 'ink', r: 5 }); P.point(PI, 0, { color: 'ink', r: 5 });
      P.text('0', 0, 0, { dy: 14, align: 'center', size: 12, color: 'muted' }); P.text('π', PI, 0, { dy: 14, align: 'center', size: 12, color: 'muted' });
      if (heat) { var y0 = -umax * 1.45, hh = M.max(10, (P.Y(y0) - P.Y(y0 + umax * 0.3))); for (i = 0; i < 120; i++) { var xa = PI * i / 120, xb = PI * (i + 1) / 120; ctx.fillStyle = heatColor(u((xa + xb) / 2, t)); ctx.fillRect(P.X(xa), P.Y(y0) - hh / 2, P.X(xb) - P.X(xa) + 0.6, hh); } ctx.strokeStyle = k.axis; ctx.lineWidth = 1; ctx.strokeRect(P.X(0), P.Y(y0) - hh / 2, P.X(PI) - P.X(0), hh); P.text('the rod, colored by temperature', PI / 2, y0, { dy: hh / 2 + 10, align: 'center', size: 11, color: 'muted' }); }
      var s;
      if (heat) { var lead = modes.filter(function (m) { return m[1]; }).slice(0, 3); s = 'At <i>t</i> = ' + fm(t, 2) + ', each mode sin <i>nx</i> has shrunk by the factor <i>e</i><sup>−' + (kk === 1 ? '' : fm(kk)) + '<i>n</i>²<i>t</i></sup>: ' + lead.map(function (m) { return 'mode ' + m[0] + ' to ' + fm(100 * M.exp(-kk * m[0] * m[0] * t), 1) + '%'; }).join(', ') + '. High modes (sharp wiggles) die first, so the profile smooths out and sinks toward 0.'; }
      else { var lead2 = modes.filter(function (m) { return m[1]; }).concat(vel).slice(0, 3); s = 'At <i>t</i> = ' + fm(t, 2) + '. Mode <i>n</i> vibrates with period ' + (cc === 1 ? '2π/<i>n</i>' : '2π/(' + fm(cc) + '<i>n</i>)') + (lead2.length ? ': ' + lead2.map(function (m) { return 'mode ' + m[0] + ' every ' + fm(2 * PI / (m[0] * cc), 2); }).join(', ') : '') + '. With no damping the shape never decays; it keeps re-forming. Dashed: the starting shape.'; }
      F.out.set(s);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    if (o.play && !V.reduced) toggle();
    return { draw: draw, destroy: function () { stop(); } };
  });
})(window, document);
