/* Inventors Ladder, From Scratch course: interactive visuals named fs-…, registered with window.MathLadder.viz.register.
   Loaded on the course's topic pages after static/math/viz/core.js. Vanilla JavaScript (canvas and plain HTML), no
   libraries, no network requests. Follows the site's light or dark theme and prefers-reduced-motion (then nothing moves
   until Play is pressed). Every control is a real button, slider or focusable element, so all of it works by keyboard.

   USE   <div class="ml-viz" data-viz="fs-lemon" data-opts='{"n":3}'></div>

   VISUALS (options in brackets)
     fs-lemon     lemon cells in series or parallel, electrode metals and depth, a red LED or a meter  [n, wiring]
     fs-magnet    a nail electromagnet: turns, cells and core; current, heating and paper clips lifted  [turns]
     fs-motor     a homopolar motor (AA cell, disc magnet, copper wire) spinning; flip the magnet  []
     fs-induct    a magnet moved through a coil: flux, the induced voltage, a needle and two LEDs  [turns]
     fs-morse     a Morse key that sounds and decodes what you tap; type a message to hear it  [wpm]
     fs-filament  a filament lamp: voltage, the gas inside and the filament; glow, temperature and life  [gas, mat]
     fs-radio     crystal radio tuning: an LC circuit's resonance picks one station; the diode recovers the sound  [c]
     fs-press     the printing press: set type from the upper and lower case, ink, pull, and compare pen and press
   Each canvas has an aria-label, and a live readout under it says the numbers in words.
   The numbers inside the models are rough, rule-of-thumb values for a kitchen-table build; the lessons say so. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, PI = M.PI, fm = V.fmt;
  function nm(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ce(tag, cls, html) { return V.el(tag, cls, html); }

  /* ---------- a canvas scene: wrapper, canvas, controls row, readout; redraws on theme change and resize ---------- */
  function scene(el, opts, o) {
    el.classList.add('fsv');
    var wrap = ce('div', 'fsv-wrap'); el.appendChild(wrap);
    var c = V.canvas(wrap, { aspect: o.aspect || 1.7, max: o.max || 380, min: o.min || 220 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || 'Picture');
    var ctl = ce('div', 'ml-ctl fsv-ctl'); wrap.appendChild(ctl);
    var ro = V.readout(wrap);
    var S = { el: el, wrap: wrap, c: c, ctx: c.ctx, ctl: ctl, ro: ro, k: V.colors(), draw: function () { } };
    S.redraw = function () { S.k = V.colors(); var x = S.ctx; x.clearRect(0, 0, c.w, c.h); x.fillStyle = S.k.bg; x.fillRect(0, 0, c.w, c.h); S.draw(); };
    S.say = function (s) { c.cv.setAttribute('aria-label', s.replace(/<[^>]+>/g, '')); };
    V.onTheme(S.redraw); c.onResize(S.redraw);
    S.fs = function () { return c.w < 520 ? 11 : 13; };
    S.txt = function (s, x, y, q) {
      q = q || {}; var ctx = S.ctx; ctx.save(); ctx.font = (q.w || 600) + ' ' + (q.size || S.fs()) + 'px system-ui,sans-serif';
      ctx.fillStyle = q.color || S.k.ink; ctx.textAlign = q.align || 'left'; ctx.textBaseline = q.base || 'middle'; ctx.fillText(s, x, y); ctx.restore();
    };
    S.line = function (x1, y1, x2, y2, col, lw, dash) { var ctx = S.ctx; ctx.save(); ctx.strokeStyle = col || S.k.ink; ctx.lineWidth = lw || 2; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); };
    S.poly = function (pts, stroke, lw, fill, close) { var ctx = S.ctx; if (pts.length < 2) return; ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close || fill) ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.stroke(); } ctx.restore(); };
    S.circ = function (x, y, r, fill, stroke, lw) { var ctx = S.ctx; ctx.save(); ctx.beginPath(); ctx.arc(x, y, M.max(0.5, r), 0, 2 * PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } ctx.restore(); };
    S.ell = function (x, y, rx, ry, fill, stroke, lw) { var ctx = S.ctx; ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, M.max(0.5, rx), M.max(0.5, ry), 0, 0, 2 * PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } ctx.restore(); };
    S.rect = function (x, y, w, h, fill, stroke, r, lw) { var ctx = S.ctx; ctx.save(); ctx.beginPath(); if (r && ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } ctx.restore(); };
    S.arrow = function (x1, y1, x2, y2, col, lw) {
      var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(10, L * 0.45); if (L < 2) return; var ctx = S.ctx;
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.45), y2 - hs * M.sin(a - 0.45)); ctx.lineTo(x2 - hs * M.cos(a + 0.45), y2 - hs * M.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    S.glow = function (x, y, r, rgb, a) { if (a <= 0.01) return; var ctx = S.ctx, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * PI); ctx.fill(); ctx.restore(); };
    S.playBtn = function (lp) {
      var b = V.button(ctl, '▶ Play', function () { if (lp.running()) { lp.stop(); } else { lp.start(); } sync(); }, 'fsv-play');
      function sync() { b.textContent = lp.running() ? '⏸ Pause' : '▶ Play'; b.setAttribute('aria-pressed', String(lp.running())); }
      lp.stop(); if (!V.reduced) lp.start(); sync(); return b;
    };
    return S;
  }
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  var COPPER = '#c8703a', ZINC = '#9aa3aa', STEEL = '#6f7a82';

  /* ======================================================================= fs-lemon */
  V.register('fs-lemon', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.9, label: 'Lemon cells joined by wires to a red LED' });
    var METALS = { zc: { name: 'zinc nail + copper', e: 0.9 }, sc: { name: 'steel paper clip + copper', e: 0.45 }, cc: { name: 'copper + copper', e: 0 } };
    var st = { n: clamp(M.round(nm(opts.n, 3)), 1, 6), wiring: opts.wiring === 'parallel' ? 'parallel' : 'series', metal: 'zc', depth: 2, load: 'led' };
    V.slider(S.ctl, { label: 'Lemons', min: 1, max: 6, step: 1, value: st.n, input: function (v) { st.n = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Electrode depth (cm)', min: 1, max: 4, step: 0.5, value: st.depth, input: function (v) { st.depth = v; S.redraw(); } });
    V.seg(S.ctl, { label: 'Wiring', items: [['series', 'Series'], ['parallel', 'Parallel']], value: st.wiring, change: function (v) { st.wiring = v; S.redraw(); } });
    V.seg(S.ctl, { label: 'Metals', items: [['zc', 'Zinc + copper'], ['sc', 'Steel + copper'], ['cc', 'Copper + copper']], value: st.metal, change: function (v) { st.metal = v; S.redraw(); } });
    V.seg(S.ctl, { label: 'Connected to', items: [['led', 'Red LED'], ['meter', 'Meter only']], value: st.load, change: function (v) { st.load = v; S.redraw(); } });
    function model() {
      var e = METALS[st.metal].e, r = 3000 / st.depth; // ohms per lemon, rough
      var E = st.wiring === 'series' ? e * st.n : e, R = st.wiring === 'series' ? r * st.n : r / st.n;
      var I = 0, VF = 1.8; if (st.load === 'led' && E > VF) I = (E - VF) / (R + 30);
      return { E: E, R: R, I: I, mA: I * 1000 };
    }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, m = model(), n = st.n;
      var area = w * 0.72, cw = area / n, lw = M.min(cw * 0.42, 52), lh = lw * 0.72, y = h * 0.58;
      var tops = [];
      for (var i = 0; i < n; i++) {
        var cx = 18 + cw * (i + 0.5);
        S.ell(cx, y, lw, lh, '#f2d23c', '#c9a514', 2);
        S.circ(cx + lw * 0.95, y - lh * 0.1, 3, '#c9a514');
        var zx = cx - lw * 0.35, cux = cx + lw * 0.35, depthPx = lh * 0.35 * st.depth / 2;
        var zc = st.metal === 'cc' ? COPPER : st.metal === 'sc' ? STEEL : ZINC;
        S.rect(zx - 3, y - lh - 18, 6, 18 + depthPx, zc, null); S.rect(cux - 3, y - lh - 18, 6, 18 + depthPx, COPPER, null);
        S.txt('−', zx, y - lh - 26, { align: 'center', size: 13, color: k.muted }); S.txt('+', cux, y - lh - 26, { align: 'center', size: 13, color: k.muted });
        tops.push([zx, cux, y - lh - 18]);
      }
      var wy = y - lh - 34, col = k.ink;
      if (st.wiring === 'series') {
        for (i = 0; i < n - 1; i++) { var a = tops[i], b = tops[i + 1]; S.poly([[a[1], a[2]], [a[1], wy + 8], [b[0], wy + 8], [b[0], b[2]]], col, 2); }
        var neg = [tops[0][0], tops[0][2]], pos = [tops[n - 1][1], tops[n - 1][2]];
      } else {
        S.line(tops[0][0], wy + 14, tops[n - 1][0], wy + 14, col, 2); S.line(tops[0][1], wy, tops[n - 1][1], wy, col, 2);
        for (i = 0; i < n; i++) { S.line(tops[i][0], tops[i][2], tops[i][0], wy + 14, col, 2); S.line(tops[i][1], tops[i][2], tops[i][1], wy, col, 2); }
        neg = [tops[0][0], wy + 14]; pos = [tops[n - 1][1], wy];
      }
      // the load at the right
      var lx = w * 0.86, ly = h * 0.38;
      S.poly([[pos[0], pos[1]], [pos[0], 16], [lx + 10, 16], [lx + 10, ly - 18]], k.red, 2);
      S.poly([[neg[0], neg[1]], [neg[0], h - 14], [lx - 10, h - 14], [lx - 10, ly + 18]], k.blue, 2);
      if (st.load === 'led') {
        var bright = clamp(m.mA / 1.2, 0, 1), vis = m.mA > 0.04;
        if (vis) S.glow(lx, ly, 34 + 30 * bright, '255,60,60', 0.25 + 0.6 * bright);
        S.ell(lx, ly, 11, 14, vis ? 'rgba(255,' + M.round(90 - 50 * bright) + ',' + M.round(90 - 50 * bright) + ',1)' : (dark() ? '#5a2b2b' : '#f3c4c4'), '#b02a2a', 2);
        S.txt('LED', lx, ly + 30, { align: 'center', size: 12, color: k.muted });
      } else {
        S.rect(lx - 26, ly - 20, 52, 40, k.panel, k.axis, 6); S.txt(fm(m.E, 2) + ' V', lx, ly, { align: 'center', w: 700 });
        S.txt('meter', lx, ly + 32, { align: 'center', size: 12, color: k.muted });
      }
      var txt = n + (n === 1 ? ' lemon' : ' lemons') + (n > 1 ? ' in ' + st.wiring : '') + ' with ' + METALS[st.metal].name + ': about <b>' + fm(m.E, 2) + ' V</b> with nothing connected';
      if (st.metal === 'cc') txt += '. Two pieces of the same metal make no voltage at all: the cell needs two different metals.';
      else if (st.load === 'led') txt += m.mA > 0.04 ? '. Through the red LED flows about <b>' + fm(m.mA, 2) + ' mA</b>: it glows ' + (m.mA > 0.8 ? 'clearly' : m.mA > 0.25 ? 'dimly (look in a dark room)' : 'very faintly') + '.' : '. That is below the LED\'s turn-on voltage of about 1.8 V, so it stays dark.';
      else txt += '. Inside, the lemons\' resistance totals about ' + fm(m.R / 1000, 1) + ' kΩ.';
      S.ro.set(txt); S.say(txt);
    };
    S.redraw();
  });

  /* ======================================================================= fs-magnet */
  V.register('fs-magnet', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.9, label: 'A nail electromagnet lifting paper clips' });
    var st = { turns: clamp(M.round(nm(opts.turns, 40) / 10) * 10, 10, 150), cells: 1, core: 'iron' };
    V.slider(S.ctl, { label: 'Turns of wire', min: 10, max: 150, step: 10, value: st.turns, input: function (v) { st.turns = v; S.redraw(); } });
    V.seg(S.ctl, { label: 'AA cells', items: [['1', '1 cell (1.5 V)'], ['2', '2 cells (3 V)']], value: '1', change: function (v) { st.cells = +v; S.redraw(); } });
    V.seg(S.ctl, { label: 'Core', items: [['iron', 'Iron nail'], ['air', 'Drinking straw']], value: st.core, change: function (v) { st.core = v; S.redraw(); } });
    function model() {
      var len = st.turns * 0.025 + 0.3, R = 0.134 * len, r = 0.15 * st.cells; // 26-gauge magnet wire, about 0.134 ohm per meter
      var I = 1.5 * st.cells / (R + r), NI = st.turns * I, P = I * I * R;
      var clips = st.core === 'iron' ? M.min(25, M.floor(NI / 15)) : M.floor(NI / 400);
      return { len: len, R: R, I: I, NI: NI, P: P, clips: clips };
    }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, m = model();
      var x0 = w * 0.16, x1 = w * 0.72, y = h * 0.36, th = 9;
      // field lines
      var f = clamp(m.NI / (st.core === 'iron' ? 300 : 3000), 0.08, 1);
      for (var j = 1; j <= 3; j++) { S.ctx.save(); S.ctx.globalAlpha = f * (1 - j * 0.22); S.ell((x0 + x1) / 2, y, (x1 - x0) / 2 + j * 16, th + j * 20, null, k.purple, 1.5); S.ctx.restore(); }
      // core
      if (st.core === 'iron') { S.rect(x0 - 10, y - th / 2, x1 - x0 + 30, th, STEEL, null, 2); S.poly([[x1 + 20, y - th / 2], [x1 + 34, y], [x1 + 20, y + th / 2]], null, 1, STEEL); S.rect(x0 - 18, y - th, 8, th * 2, STEEL, null, 2); }
      else S.rect(x0 - 10, y - th / 2, x1 - x0 + 30, th, dark() ? '#3a4a42' : '#e8eef0', k.axis, 2);
      // coil
      var nShow = M.min(60, st.turns / 2.5), dx = (x1 - x0) / nShow;
      for (var i = 0; i < nShow; i++) { var xx = x0 + i * dx + dx / 2; S.line(xx - 2, y - th / 2 - 4, xx + 2, y + th / 2 + 4, COPPER, M.max(1.2, M.min(3, dx * 0.6))); }
      // battery and leads
      var bx = w * 0.42, by = h * 0.82;
      for (var c = 0; c < st.cells; c++) { var cx = bx - 30 + c * 62; S.rect(cx, by - 11, 56, 22, dark() ? '#4a5a52' : '#2b2f33', null, 4); S.rect(cx + 56, by - 5, 5, 10, k.axis, null); S.txt('AA', cx + 28, by, { align: 'center', color: '#fff', size: 11 }); }
      S.poly([[x0, y + th / 2 + 4], [x0, by], [bx - 30, by]], COPPER, 2);
      S.poly([[x1, y + th / 2 + 4], [x1, by + 24], [bx - 30 + st.cells * 62 - 1, by + 24], [bx - 30 + st.cells * 62 - 1, by]], COPPER, 2);
      // paper clips hanging from the tip
      var tx = x1 + 34, ty = y + 4, nc = M.min(m.clips, 12);
      for (i = 0; i < nc; i++) { var cy = ty + 4 + i * 11; if (cy > h - 10) break; S.rect(tx - 4, cy, 8, 13, null, k.muted, 3, 1.6); }
      if (m.clips > nc) S.txt('+' + (m.clips - nc), tx + 10, ty + 12, { size: 11, color: k.muted });
      // pile of clips on the table
      for (i = 0; i < 6; i++) S.rect(tx - 20 + i * 6, h - 12 - (i % 2) * 3, 12, 6, null, k.muted, 2, 1.2);
      S.line(0, h - 4, w, h - 4, k.axis, 1.5);
      if (m.P > 2) S.txt('HOT', x0 + (x1 - x0) / 2, y - th - 16, { align: 'center', color: k.red, w: 800 });
      var txt = st.turns + ' turns (about ' + fm(m.len, 1) + ' m of thin magnet wire, ' + fm(m.R, 2) + ' Ω) on ' + (st.core === 'iron' ? 'an iron nail' : 'a plastic straw') + ' with ' + st.cells + ' AA cell' + (st.cells > 1 ? 's' : '') + ': about <b>' + fm(m.I, 1) + ' A</b>, or ' + M.round(m.NI) + ' ampere-turns. It lifts about <b>' + m.clips + '</b> paper clip' + (m.clips === 1 ? '' : 's') + '.';
      txt += ' The wire turns about ' + fm(m.P, 1) + ' W into heat' + (m.P > 2 ? ', so it gets hot within seconds: connect it only briefly.' : '.');
      S.ro.set(txt); S.say(txt);
    };
    S.redraw();
  });

  /* ======================================================================= fs-motor */
  V.register('fs-motor', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.6, label: 'A homopolar motor: a copper wire spins on a battery standing on a magnet' });
    var st = { up: 'N', amps: 3, ang: 0 };
    V.slider(S.ctl, { label: 'Current (A)', min: 0, max: 5, step: 0.5, value: st.amps, input: function (v) { st.amps = v; if (!lp.running()) S.redraw(); } });
    V.seg(S.ctl, { label: 'Magnet', items: [['N', 'North pole up'], ['S', 'South pole up']], value: st.up, change: function (v) { st.up = v; if (!lp.running()) S.redraw(); } });
    var lp = V.loop(el, function (dt) { st.ang += dt * st.amps * 1.6 * (st.up === 'N' ? 1 : -1); S.redraw(); });
    S.playBtn(lp);
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, cx = w * 0.4, base = h * 0.84, bh = h * 0.5, bw = M.min(46, w * 0.09);
      S.line(0, base + 12, w, base + 12, k.axis, 1.5);
      // magnet
      S.rect(cx - bw * 0.9, base, bw * 1.8, 12, '#8d96a0', k.axis, 3);
      S.txt(st.up === 'N' ? 'N' : 'S', cx + bw * 1.15, base + 6, { size: 11, color: k.muted });
      // battery: negative end down on the magnet
      S.rect(cx - bw / 2, base - bh, bw, bh, dark() ? '#47534d' : '#2b2f33', null, 5);
      S.rect(cx - bw / 2, base - bh, bw, bh * 0.3, '#b8963e', null, 5);
      S.rect(cx - 6, base - bh - 6, 12, 7, k.axis, null, 2);
      S.txt('+', cx, base - bh * 0.85, { align: 'center', color: '#fff', w: 800 }); S.txt('AA', cx, base - bh * 0.4, { align: 'center', color: '#fff', size: 11 });
      // spinning wire: a rectangle loop seen from the side, its width shrinks with cos(angle)
      var R = bw * 1.25, ca = M.cos(st.ang), sa = M.sin(st.ang), top = base - bh - 6, bot = base + 4;
      var xL = cx - R * ca, xR = cx + R * ca, front = sa > 0;
      var wc = COPPER;
      S.poly([[cx, top], [xL, top + 6], [xL, bot - 3]], wc, front ? 3 : 2);
      S.poly([[cx, top], [xR, top + 6], [xR, bot - 3]], wc, front ? 2 : 3);
      // force arrow on the bottom of the wire near the magnet
      if (st.amps > 0) { // a curved arrow around the battery shows which way it turns
        var dir = st.up === 'N' ? 1 : -1, ay = top - 20, ar = R * 0.9, ctx = S.ctx, a0 = dir > 0 ? 0.25 * PI : 0.75 * PI, a1 = dir > 0 ? 0.75 * PI : 0.25 * PI;
        ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(cx, ay, ar, ar * 0.3, 0, M.min(a0, a1), M.max(a0, a1)); ctx.stroke(); ctx.restore();
        var ex = cx + ar * M.cos(a1), ey = ay + ar * 0.3 * M.sin(a1); S.arrow(ex + dir * 10, ey - 2, ex, ey, k.red, 2.4);
      }
      // labels
      var gx = w * 0.68; S.txt('F = B I L', gx, h * 0.2, { w: 700, size: S.fs() + 2 });
      var F = 0.3 * st.amps * 0.01;
      S.txt('B ≈ 0.3 T at the magnet\'s edge', gx, h * 0.2 + 22, { size: 11, color: k.muted, w: 500 });
      S.txt('L ≈ 1 cm of wire touching it', gx, h * 0.2 + 38, { size: 11, color: k.muted, w: 500 });
      S.txt('F ≈ ' + fm(F * 1000, 0) + ' mN', gx, h * 0.2 + 60, { w: 700, color: k.red });
      var txt = st.amps === 0 ? 'No current, no force: the wire stands still.' : 'About ' + fm(st.amps, 1) + ' A flows down the wire, out through the magnet\'s edge and back into the battery. The magnet\'s field pushes on that current with about ' + fm(F * 1000, 0) + ' millinewtons, so the wire spins ' + (st.up === 'N' ? 'one way' : 'the other way (flipping the magnet reverses the force)') + '.';
      S.ro.set(txt); S.say(txt);
    };
    S.redraw();
  });

  /* ======================================================================= fs-induct */
  V.register('fs-induct', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.7, label: 'Move the magnet through the coil. A graph shows the voltage it makes.' });
    var st = { turns: clamp(nm(opts.turns, 500), 50, 1000), mag: 1, x: -1, shake: false, f: 4, t: 0, hist: [], phi: 0, emf: 0, last: null };
    V.slider(S.ctl, { label: 'Turns in the coil', min: 50, max: 1000, step: 50, value: st.turns, input: function (v) { st.turns = v; } });
    V.seg(S.ctl, { label: 'Magnet', items: [['1', 'One disc'], ['3', 'Stack of three']], value: '1', change: function (v) { st.mag = +v; } });
    V.slider(S.ctl, { label: 'Shakes per second', min: 1, max: 8, step: 1, value: st.f, input: function (v) { st.f = v; } });
    var sb = V.button(S.ctl, 'Shake', function () { st.shake = !st.shake; sb.textContent = st.shake ? 'Stop shaking' : 'Shake'; sb.setAttribute('aria-pressed', String(st.shake)); lp.start(); });
    var cv = S.c.cv; cv.tabIndex = 0;
    S.wrap.appendChild(ce('p', 'fsv-hint', 'Drag the magnet left and right, or click the picture and use the arrow keys. Faster is stronger.'));
    function px2x(px) { return (px - S.c.w * 0.36) / (S.c.w * 0.26); }
    V.drag(cv, {
      hit: function (px, py) { return py < S.c.h * 0.55 ? 'm' : null; },
      start: function () { st.shake = false; sb.textContent = 'Shake'; lp.start(); },
      move: function (hd, px) { st.x = clamp(px2x(px), -1.3, 1.3); }
    });
    cv.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); st.shake = false; st.x = clamp(st.x + (e.key === 'ArrowRight' ? 0.35 : -0.35), -1.3, 1.3); lp.start(); }
    });
    function flux(x) { return 1e-4 * (st.mag === 3 ? 2.6 : 1) * M.exp(-x * x / 0.18); } // webers through one turn, rough
    var quiet = 0;
    var lp = V.loop(el, function (dt) {
      if (!dt) return;
      st.t += dt;
      if (st.shake) st.x = 1.1 * M.sin(2 * PI * st.f * st.t);
      var ph = flux(st.x), emf = st.last == null ? 0 : -st.turns * (ph - st.last) / dt;
      st.last = ph; st.emf = st.emf * 0.5 + emf * 0.5;
      st.hist.push(st.emf); if (st.hist.length > 240) st.hist.shift();
      quiet = M.abs(st.emf) < 0.002 && !st.shake ? quiet + dt : 0;
      S.redraw();
      if (quiet > 3) lp.stop();
    });
    lp.stop(); if (!V.reduced) lp.start();
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, cy = h * 0.27, cx = w * 0.36, cl = w * 0.17, ch = h * 0.17;
      // coil: loops
      var n = 14; for (var i = 0; i < n; i++) { var xx = cx - cl / 2 + cl * i / (n - 1); S.ell(xx, cy, 5, ch / 2, null, COPPER, 2); }
      // magnet
      var mx = cx + st.x * w * 0.26, mw = w * 0.12, mh = ch * 0.45;
      S.rect(mx - mw / 2, cy - mh / 2, mw / 2, mh, '#d6336c', null, 3); S.rect(mx, cy - mh / 2, mw / 2, mh, '#1c6fd6', null, 3);
      S.txt('N', mx - mw / 4, cy, { align: 'center', color: '#fff', w: 800 }); S.txt('S', mx + mw / 4, cy, { align: 'center', color: '#fff', w: 800 });
      // leads to meter and LEDs
      var gx = w * 0.82, gy = cy;
      S.poly([[cx - cl / 2, cy + ch / 2], [cx - cl / 2, h * 0.5], [gx - 20, h * 0.5], [gx - 20, gy + 26]], COPPER, 1.6);
      S.poly([[cx + cl / 2, cy + ch / 2], [cx + cl / 2, h * 0.47], [gx + 20, h * 0.47], [gx + 20, gy + 26]], COPPER, 1.6);
      // galvanometer
      var R = M.min(34, w * 0.07); S.circ(gx, gy, R, k.panel, k.axis, 2);
      var a = clamp(st.emf / 1.5, -1, 1) * 1.1; S.line(gx, gy + R * 0.6, gx + R * 0.85 * M.sin(a), gy + R * 0.6 - R * 1.1 * M.cos(a), k.red, 2.4);
      S.txt('0', gx, gy - R + 9, { align: 'center', size: 10, color: k.muted });
      // two LEDs back to back: red lights for one direction, green for the other
      var on1 = st.emf > 1.8, on2 = st.emf < -1.8;
      if (on1) S.glow(gx - 22, gy + R + 18, 26, '255,60,60', 0.8); if (on2) S.glow(gx + 22, gy + R + 18, 26, '60,200,90', 0.8);
      S.circ(gx - 22, gy + R + 18, 7, on1 ? '#ff4d4d' : (dark() ? '#5a2b2b' : '#f3c4c4'), '#b02a2a', 1.5);
      S.circ(gx + 22, gy + R + 18, 7, on2 ? '#40c057' : (dark() ? '#244a30' : '#c3ecd0'), '#2b8a3e', 1.5);
      // graph of emf
      var g = { x: 12, y: h * 0.6, w: w - 24, h: h * 0.36 }, sc = 3;
      S.rect(g.x, g.y, g.w, g.h, k.panel, null, 6);
      S.line(g.x, g.y + g.h / 2, g.x + g.w, g.y + g.h / 2, k.axis, 1);
      S.line(g.x, g.y + g.h / 2 - g.h / 2 * 1.8 / sc, g.x + g.w, g.y + g.h / 2 - g.h / 2 * 1.8 / sc, k.green, 1, [4, 4]);
      S.line(g.x, g.y + g.h / 2 + g.h / 2 * 1.8 / sc, g.x + g.w, g.y + g.h / 2 + g.h / 2 * 1.8 / sc, k.green, 1, [4, 4]);
      var pts = []; for (i = 0; i < st.hist.length; i++) pts.push([g.x + g.w * i / 239, g.y + g.h / 2 - clamp(st.hist[i] / sc, -1, 1) * g.h / 2 * 0.95]);
      S.poly(pts, k.blue, 2);
      S.txt('voltage (last 4 s)', g.x + 6, g.y + 10, { size: 11, color: k.muted, w: 500 });
      S.txt('±1.8 V: an LED lights', g.x + g.w - 6, g.y + 10, { size: 11, color: k.green, w: 500, align: 'right' });
      var v = M.abs(st.emf), txt = 'Coil of ' + st.turns + ' turns. Voltage now: <b>' + fm(st.emf, 2) + ' V</b>. ' + (v < 0.01 ? 'The magnet is still, so the flux is not changing: no voltage.' : v > 1.8 ? 'Fast enough to light an LED!' : 'The needle kicks; move faster or add turns to light an LED.');
      S.ro.set(txt); S.say(txt);
    };
    S.redraw();
  });

  /* ======================================================================= fs-morse */
  var MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----' };
  var DEC = {}; Object.keys(MORSE).forEach(function (c) { DEC[MORSE[c]] = c; });
  ML.morse = { table: MORSE };
  V.register('fs-morse', function (el, opts) {
    el.classList.add('fsv');
    var wpm = clamp(nm(opts.wpm, 8), 5, 20), unit = function () { return 1200 / wpm; };
    var AC = null, osc = null, gain = null, sound = true;
    function audio() { if (!sound) return null; try { if (!AC) { var C = W.AudioContext || W.webkitAudioContext; if (!C) return null; AC = new C(); gain = AC.createGain(); gain.gain.value = 0; gain.connect(AC.destination); osc = AC.createOscillator(); osc.frequency.value = 620; osc.connect(gain); osc.start(); } if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } }
    function tone(on) { var a = audio(); if (!a || !gain) return; gain.gain.setTargetAtTime(on ? 0.15 : 0, a.currentTime, 0.006); }
    var wrap = ce('div', 'fsv-wrap'); el.appendChild(wrap);
    wrap.appendChild(ce('p', 'fsv-hint', 'Press and hold the key for a dash, tap it for a dot. On a keyboard, focus the key and use the space bar.'));
    var key = ce('button', 'fsm-key', 'Telegraph key'); key.type = 'button'; key.setAttribute('aria-pressed', 'false');
    wrap.appendChild(key);
    var c = V.canvas(wrap, { height: 54 }); c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', 'The marks you have sent, as a strip of dots and dashes');
    var codeEl = ce('p', 'fsm-code'), outEl = ce('p', 'fsm-out'); outEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(ce('p', 'fsv-hint', 'Code heard:')); wrap.appendChild(codeEl); wrap.appendChild(ce('p', 'fsv-hint', 'Decoded:')); wrap.appendChild(outEl);
    var row = ce('div', 'ml-ctl fsv-ctl'); wrap.appendChild(row);
    V.slider(row, { label: 'Speed (words per minute)', min: 5, max: 20, step: 1, value: wpm, fmt: function (v) { return v + ' wpm (dot = ' + M.round(1200 / v) + ' ms)'; }, input: function (v) { wpm = v; } });
    V.button(row, 'Clear', function () { marks = []; code = ''; text = ''; cur = ''; show(); });
    var sbtn = V.button(row, 'Sound: on', function () { sound = !sound; sbtn.textContent = 'Sound: ' + (sound ? 'on' : 'off'); if (!sound) tone(false); });
    var r2 = ce('div', 'fsm-row'); wrap.appendChild(r2);
    var inp = ce('input'); inp.type = 'text'; inp.value = opts.msg || 'SOS'; inp.maxLength = 40; inp.setAttribute('aria-label', 'A message to send in Morse code'); r2.appendChild(inp);
    var pbtn = V.button(r2, 'Send it', function () { playMsg(inp.value); });
    var tbtn = V.button(r2, 'Show the code table', function () { tbl.hidden = !tbl.hidden; tbtn.textContent = tbl.hidden ? 'Show the code table' : 'Hide the code table'; });
    var tbl = ce('div', 'fsm-table'); tbl.hidden = true; Object.keys(MORSE).forEach(function (ch) { tbl.appendChild(ce('span', '', '<b>' + ch + '</b> ' + MORSE[ch].replace(/\./g, '·').replace(/-/g, '–'))); }); wrap.appendChild(tbl);
    var marks = [], code = '', text = '', cur = '', downAt = 0, upAt = 0, timer = 0, down = false, playing = false;
    function show() {
      codeEl.textContent = (code + (cur ? cur : '')).replace(/\./g, '·').replace(/-/g, '–') || ' ';
      outEl.textContent = text + (cur ? '_' : '') || ' ';
      drawStrip();
    }
    function drawStrip() {
      var k = V.colors(), ctx = c.ctx; ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = k.panel; ctx.fillRect(0, 0, c.w, c.h);
      var u = unit(), scale = 6 / u, x = c.w - 8; ctx.fillStyle = k.green;
      for (var i = marks.length - 1; i >= 0 && x > 0; i--) { var mk = marks[i], wd = M.max(4, mk.d * scale); x -= wd; ctx.fillRect(x, c.h / 2 - 7, wd, 14); x -= M.max(4, (mk.gap || u) * scale); }
    }
    function endLetter() { if (cur) { text += DEC[cur] || '?'; code += cur + ' '; cur = ''; } }
    function sched() {
      clearTimeout(timer); var u = unit();
      timer = setTimeout(function () { if (down) return; endLetter(); show(); timer = setTimeout(function () { if (down) return; if (text && text.slice(-1) !== ' ') { text += ' '; code += '/ '; } show(); }, u * 4); }, u * 2.2);
    }
    function press() { if (down || playing) return; down = true; downAt = performance.now(); key.setAttribute('aria-pressed', 'true'); tone(true); clearTimeout(timer); }
    function release() {
      if (!down) return; down = false; tone(false); key.setAttribute('aria-pressed', 'false');
      var t = performance.now(), d = t - downAt, gap = upAt ? downAt - upAt : unit(); upAt = t;
      marks.push({ d: d, gap: gap }); if (marks.length > 60) marks.shift();
      cur += d < unit() * 2 ? '.' : '-'; show(); sched();
    }
    key.addEventListener('pointerdown', function (e) { e.preventDefault(); try { key.setPointerCapture(e.pointerId); } catch (x) { } press(); });
    key.addEventListener('pointerup', release); key.addEventListener('pointercancel', release); key.addEventListener('lostpointercapture', release);
    key.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) press(); } });
    key.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); release(); } });
    key.addEventListener('click', function (e) { e.preventDefault(); });
    key.addEventListener('blur', release);
    function playMsg(s) {
      if (playing) return; s = String(s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); if (!s) return;
      playing = true; pbtn.disabled = true; marks = []; code = ''; text = ''; cur = ''; show();
      var u = unit(), seq = [], words = s.split(' ');
      words.forEach(function (wd, wi) {
        wd.split('').forEach(function (ch, ci) { var m = MORSE[ch]; if (!m) return; m.split('').forEach(function (sym, si) { seq.push({ on: sym === '.' ? u : 3 * u, sym: sym, gap: si < m.length - 1 ? u : (ci < wd.length - 1 ? 3 * u : (wi < words.length - 1 ? 7 * u : 0)), ch: si === m.length - 1 ? ch : null, word: si === m.length - 1 && ci === wd.length - 1 && wi < words.length - 1 }); }); });
      });
      var i = 0, lastGap = u;
      (function step() {
        if (i >= seq.length) { playing = false; pbtn.disabled = false; show(); return; }
        var q = seq[i++]; key.setAttribute('aria-pressed', 'true'); tone(true); cur += q.sym; show();
        setTimeout(function () {
          tone(false); key.setAttribute('aria-pressed', 'false'); marks.push({ d: q.on, gap: lastGap }); lastGap = q.gap || u;
          if (q.ch) { endLetter(); if (q.word) { text += ' '; code += '/ '; } } show();
          setTimeout(step, q.gap || 10);
        }, q.on);
      })();
    }
    V.onTheme(drawStrip); c.onResize(drawStrip); show();
  });

  /* ======================================================================= fs-filament */
  function kelvinRGB(T) { // approximate color of a hot body (after Tanner Helland's fit), returns 'r,g,b'
    var t = T / 100, r, g, b;
    if (t <= 66) { r = 255; g = 99.47 * M.log(t) - 161.12; b = t <= 19 ? 0 : 138.52 * M.log(t - 10) - 305.04; }
    else { r = 329.7 * M.pow(t - 60, -0.1332); g = 288.12 * M.pow(t - 60, -0.0755); b = 255; }
    return [r, g, b].map(function (v) { return M.round(clamp(v, 0, 255)); }).join(',');
  }
  V.register('fs-filament', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.6, min: 330, max: 400, label: 'A filament lamp: the filament glows, and in air it burns through' });
    var MAT = { thread: { name: 'carbonized cotton thread', T: 2000, life: 15 }, bamboo: { name: 'carbonized bamboo', T: 2050, life: 1200 }, tungsten: { name: 'tungsten wire', T: 2800, life: 1000 } };
    var GAS = { air: 'air', vacuum: 'a vacuum', argon: 'argon gas' };
    var st = { v: 100, gas: GAS[opts.gas] ? opts.gas : 'air', mat: MAT[opts.mat] ? opts.mat : 'bamboo', ox: 0, broken: false };
    V.slider(S.ctl, { label: 'Voltage, % of rating', min: 0, max: 130, step: 5, value: st.v, fmt: function (v) { return v + '%'; }, input: function (v) { st.v = v; kick(); } });
    V.seg(S.ctl, { label: 'Inside the bulb', items: [['air', 'Air'], ['vacuum', 'Vacuum'], ['argon', 'Argon']], value: st.gas, change: function (v) { st.gas = v; kick(); } });
    V.seg(S.ctl, { label: 'Filament', items: [['thread', 'Cotton thread'], ['bamboo', 'Bamboo'], ['tungsten', 'Tungsten']], value: st.mat, change: function (v) { st.mat = v; st.ox = 0; st.broken = false; kick(); } });
    V.button(S.ctl, 'New filament', function () { st.ox = 0; st.broken = false; kick(); });
    function temp() { var m = MAT[st.mat]; return st.broken || st.v === 0 ? 293 : 293 + (m.T - 293) * M.pow(st.v / 100, 0.42 * 1.6); }
    var lp = V.loop(el, function (dt) {
      var T = temp();
      if (st.gas === 'air' && !st.broken && T > 900) { st.ox += dt * (T - 900) / 900 * 0.45; if (st.ox >= 1) { st.ox = 1; st.broken = true; } }
      S.redraw(); if (st.broken || st.gas !== 'air' || T <= 900) lp.stop();
    });
    function kick() { S.redraw(); lp.start(); }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, nar = w < 560, cx = nar ? w * 0.5 : w * 0.32, cy = nar ? h * 0.3 : h * 0.42, R = nar ? M.min(w * 0.2, h * 0.19) : M.min(w * 0.2, h * 0.34), T = temp(), m = MAT[st.mat];
      var hot = T > 800, a = clamp((T - 800) / 1800, 0, 1);
      if (hot) S.glow(cx, cy + R * 0.1, R * 2.1, kelvinRGB(T), 0.25 + 0.6 * a);
      // glass
      S.ell(cx, cy, R, R * 1.05, st.gas === 'air' ? 'rgba(180,200,220,0.08)' : 'rgba(180,200,220,0.14)', k.axis, 2);
      S.rect(cx - R * 0.42, cy + R * 0.95, R * 0.84, R * 0.45, '#9aa3aa', k.axis, 4);
      for (var i = 0; i < 3; i++) S.line(cx - R * 0.42, cy + R * (1.05 + i * 0.13), cx + R * 0.42, cy + R * (1.05 + i * 0.13), k.axis, 1);
      // lead-in wires and filament
      var fx1 = cx - R * 0.35, fx2 = cx + R * 0.35, fy = cy - R * 0.15;
      S.line(cx - R * 0.15, cy + R * 0.95, fx1, fy, k.muted, 2); S.line(cx + R * 0.15, cy + R * 0.95, fx2, fy, k.muted, 2);
      var col = hot ? 'rgb(' + kelvinRGB(T) + ')' : (dark() ? '#777' : '#333');
      var pts = []; for (i = 0; i <= 40; i++) { var t = i / 40; pts.push([fx1 + (fx2 - fx1) * t, fy - M.sin(t * PI) * R * 0.45]); }
      if (st.broken) { S.poly(pts.slice(0, 17), col, 2.2); S.poly(pts.slice(23), col, 2.2); }
      else S.poly(pts, col, hot ? 3 : 2.2);
      if (st.gas === 'air' && st.ox > 0) { S.ctx.save(); S.ctx.globalAlpha = st.ox * 0.6; S.circ(cx, fy - R * 0.45, R * 0.15 * st.ox, k.muted); S.ctx.restore(); }
      // meters
      var gx = nar ? 14 : w * 0.62, y0 = nar ? h * 0.66 : h * 0.2, lh = nar ? 22 : M.max(20, h * 0.11), bw = nar ? w * 0.5 : w * 0.3;
      var light = st.broken || T < 900 ? 0 : M.pow(st.v / 100, 3.4) * (st.mat === 'tungsten' ? 1 : 0.35);
      S.txt('Temperature: about ' + M.round((T - 273) / 50) * 50 + ' °C', gx, y0, { w: 700 });
      S.txt('Light: ' + (light ? fm(light * 100, 0) + '% of a tungsten lamp at its rating' : 'none'), gx, y0 + lh, {});
      var life;
      if (st.broken) life = 'burned out';
      else if (T < 900) life = 'cold, so it lasts';
      else if (st.gas === 'air') life = 'seconds: the oxygen burns it';
      else { var L = m.life * M.pow(st.v / 100, -13) * (st.gas === 'argon' ? 1.6 : 1); life = L > 1e5 ? 'very long (it is barely glowing)' : 'about ' + fm(L > 100 ? M.round(L / 10) * 10 : L, 0) + ' hours'; }
      S.txt('Life: ' + life, gx, y0 + 2 * lh, {});
      if (st.gas === 'air' && !st.broken && T > 900) { S.rect(gx, y0 + 3 * lh - 6, bw, 12, k.panel, k.axis, 6); S.rect(gx, y0 + 3 * lh - 6, bw * st.ox, 12, k.red, null, 6); S.txt('burning away', gx, y0 + 3 * lh + 16, { size: 11, color: k.muted }); }
      var txt = (st.broken ? 'The ' + m.name + ' filament has burned through. ' : 'A ' + m.name + ' filament in ' + GAS[st.gas] + ' at ' + st.v + '% of its rated voltage: about ' + M.round((T - 273) / 50) * 50 + ' °C. ') +
        (st.broken ? 'Hot carbon or metal joins with oxygen in the air. Try a vacuum, then press New filament.' : 'Expected life: ' + life + '.' + (st.v > 100 && st.gas !== 'air' ? ' Running above the rating gives more light but a much shorter life.' : ''));
      S.ro.set(txt); S.say(txt);
    };
    kick();
  });

  /* ======================================================================= fs-radio */
  V.register('fs-radio', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.5, max: 420, min: 300, label: 'Tuning a crystal radio: a resonance curve over the AM band, and the signal before and after the diode' });
    var ST = [{ f: 610, s: 0.55, n: 'Station A' }, { f: 880, s: 1, n: 'Station B' }, { f: 1130, s: 0.35, n: 'Station C' }, { f: 1450, s: 0.7, n: 'Station D' }];
    var st = { c: clamp(nm(opts.c, 150), 40, 365), L: 240, t: 0 };
    V.slider(S.ctl, { label: 'Tuning capacitor (pF)', min: 40, max: 365, step: 1, value: st.c, input: function (v) { st.c = v; S.redraw(); } });
    V.seg(S.ctl, { label: 'Coil', items: [['180', '180 µH'], ['240', '240 µH'], ['300', '300 µH']], value: '240', change: function (v) { st.L = +v; S.redraw(); } });
    function f0() { return 1 / (2 * PI * M.sqrt(st.L * 1e-6 * st.c * 1e-12)) / 1000; }
    function resp(f) { var Q = 40, x = Q * (f / f0() - f0() / f); return 1 / M.sqrt(1 + x * x); }
    var lp = V.loop(el, function (dt) { st.t += dt; S.redraw(); });
    S.playBtn(lp);
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, gx = 34, gw = w - 48, gy = 18, gh = h * 0.36;
      function X(f) { return gx + (f - 500) / 1250 * gw; }
      S.rect(gx, gy, gw, gh, k.panel, null, 6); S.line(gx, gy + gh, gx + gw, gy + gh, k.axis, 1.4);
      [600, 800, 1000, 1200, 1400, 1600].forEach(function (f) { S.line(X(f), gy + gh, X(f), gy + gh + 4, k.axis, 1); S.txt(String(f), X(f), gy + gh + 13, { align: 'center', size: 10, color: k.muted, w: 500 }); });
      S.txt('kHz', gx + gw, gy + gh + 26, { align: 'right', size: 10, color: k.muted, w: 500 });
      ST.forEach(function (s) { S.rect(X(s.f) - 3, gy + gh - gh * 0.85 * s.s, 6, gh * 0.85 * s.s, k.goldSoft, k.gold, 2, 1); S.txt(s.n.slice(-1), X(s.f), gy + gh - gh * 0.85 * s.s - 9, { align: 'center', size: 11, color: k.gold }); });
      var pts = []; for (var f = 500; f <= 1750; f += 4) pts.push([X(f), gy + gh - gh * 0.92 * resp(f)]);
      S.poly(pts, k.green, 2.2);
      var F = f0(); if (F >= 500 && F <= 1750) S.line(X(F), gy, X(F), gy + gh, k.green, 1, [4, 4]);
      // what gets through
      var heard = ST.map(function (s) { return { s: s, a: s.s * resp(s.f) }; }).sort(function (a, b) { return b.a - a.a; });
      var top = heard[0], amp = top.a;
      // waveforms: tuned RF (AM), after diode, audio
      var wy = gy + gh + 40, bh = (h - wy - 10) / 3, ww = w - 24;
      var labels = ['Radio wave at the coil (AM)', 'After the diode: one half only', 'In the earphone: the sound'];
      for (var r = 0; r < 3; r++) {
        var y = wy + bh * r + bh / 2, p = [];
        S.txt(labels[r], 12, wy + bh * r + 7, { size: 10, color: k.muted, w: 500 });
        for (var i = 0; i <= 300; i++) {
          var x = i / 300, env = 1 + 0.6 * M.sin(2 * PI * (3 * x + st.t * 0.6)), car = M.sin(2 * PI * 48 * x), v = amp * env * car;
          if (r === 1) v = M.max(0, v); if (r === 2) v = amp * env * 0.5;
          p.push([12 + ww * x, y + 4 - v * bh * 0.28]);
        }
        S.poly(p, r === 2 ? k.purple : k.blue, r === 2 ? 2 : 1.2);
      }
      var second = heard[1], txt = 'Tuned to about <b>' + fm(F, 0) + ' kHz</b> (f = 1/(2π√(LC)) with L = ' + st.L + ' µH, C = ' + st.c + ' pF). ';
      if (amp < 0.15) txt += 'No station is near that frequency: you hear almost nothing.';
      else txt += 'You hear <b>' + top.s.n + '</b> at ' + top.s.f + ' kHz' + (amp > 0.6 ? ', loud and clear' : ', faintly') + (second.a > 0.4 * amp && second.a > 0.12 ? ', with ' + second.s.n + ' leaking in underneath' : '') + '.';
      S.ro.set(txt); S.say(txt);
    };
    S.redraw();
  });

  /* ======================================================================= fs-press */
  V.register('fs-press', function (el, opts) {
    el.classList.add('fsp');
    var MEASURE = 48, MAXL = 3;
    function uw(ch) { if (ch === ' ') return 2; if ('ijlt.,:;\'!fr'.indexOf(ch) >= 0) return 2; if ('mwMW'.indexOf(ch) >= 0) return 5; if (/[A-Z]/.test(ch)) return 4; return 3; }
    var lines = [[]], cur = 0, mirrored = true;
    var tabs = ce('div', 'fsp-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Printing press steps'); el.appendChild(tabs);
    var names = ['1. Set the type', '2. Ink and pull', '3. Pen or press?'], panels = [], tbtn = [];
    var uid = V.uid('fsp');
    names.forEach(function (n, i) {
      var b = ce('button', '', n); b.type = 'button'; b.setAttribute('role', 'tab'); b.id = uid + '-t' + i; b.setAttribute('aria-controls', uid + '-p' + i);
      b.addEventListener('click', function () { sel(i); }); b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var j = (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3; sel(j); tbtn[j].focus(); } });
      tabs.appendChild(b); tbtn.push(b);
      var p = ce('div', 'fsp-panel'); p.id = uid + '-p' + i; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', b.id); el.appendChild(p); panels.push(p);
    });
    function sel(i) { tbtn.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; panels[j].hidden = i !== j; }); if (i === 1) enterPress(); }

    /* ---- panel 1: the type case and the composing stick ---- */
    var P1 = panels[0];
    P1.appendChild(ce('p', '', 'Tap or drag metal letters, called <b>sorts</b>, from the type case into the composing stick. Every sort carries its letter <b>backward</b>, so the print comes out the right way round. On a keyboard, tab into the case and type letters, or press Enter on a sort.'));
    var stickWrap = ce('div', 'fsp-stickwrap'); P1.appendChild(stickWrap);
    var stick = ce('div', 'fsp-stick'); stick.setAttribute('aria-label', 'Composing stick'); stickWrap.appendChild(stick);
    var gauge = ce('div', 'fsp-gauge'); stickWrap.appendChild(gauge);
    var msg1 = ce('p', 'fsp-msg'); msg1.setAttribute('aria-live', 'polite'); P1.appendChild(msg1);
    var b1 = ce('div', 'fsp-btns'); P1.appendChild(b1);
    V.button(b1, 'Justify this line', justify);
    V.button(b1, 'Take out last sort', function () { var L = lines[cur]; if (L.length) L.pop(); else if (cur > 0) { lines.pop(); cur--; } unjust(); render(); });
    V.button(b1, 'Next line', function () { if (lines.length >= MAXL) { say('Three lines fill this little forme. Justify them and go to step 2.'); return; } if (!lines[cur].length) { say('Set some letters on this line first.'); return; } lines.push([]); cur = lines.length - 1; render(); });
    V.button(b1, 'Empty the stick', function () { lines = [[]]; cur = 0; render(); say('The sorts go back in the case.'); });
    var mirB = V.button(b1, 'Read it as printed', function () { mirrored = !mirrored; mirB.textContent = mirrored ? 'Read it as printed' : 'Show the metal again'; mirB.setAttribute('aria-pressed', String(!mirrored)); render(); });
    var caseBox = ce('div', 'fsp-case'); P1.appendChild(caseBox);
    function tray(title, chars, extra) {
      var t = ce('div', 'fsp-tray'); t.appendChild(ce('h4', '', title)); var g = ce('div', 'fsp-grid'); t.appendChild(g);
      chars.split('').forEach(function (ch) { g.appendChild(sortKey(ch)); }); (extra || []).forEach(function (x) { g.appendChild(x); }); caseBox.appendChild(t); return t;
    }
    function sortKey(ch, label) {
      var b = ce('button', 'fsp-k' + (ch === ' ' ? ' fsp-kw' : ''), '<span>' + (ch === ' ' ? 'space' : ch) + '</span>'); b.type = 'button';
      b.setAttribute('aria-label', label || (ch === ' ' ? 'a space' : (/[A-Z]/.test(ch) ? 'capital ' + ch : /[a-z]/.test(ch) ? 'small ' + ch : ch === '.' ? 'period' : ch === ',' ? 'comma' : ch)));
      b.dataset.ch = ch; return b;
    }
    tray('Upper case: capitals', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    tray('Lower case: small letters, points and spaces', 'abcdefghijklmnopqrstuvwxyz.,', [sortKey(' ')]);
    P1.appendChild(ce('p', 'fsp-small', 'Why “upper case” and “lower case”? Printers kept their sorts in a pair of wooden trays on a sloping stand. Capitals lived in the upper tray and small letters, used far more often, in the lower tray, closer to the hand. The names stuck to the letters.'));
    function width(L) { var s = 0; L.forEach(function (x) { s += x.w; }); return s; }
    function add(ch) {
      var L = lines[cur], w0 = uw(ch);
      if (width(L) + w0 > MEASURE) { if (lines.length < MAXL && ch !== ' ') { lines.push([]); cur++; L = lines[cur]; say('That line was full, so a new line began.'); } else { say('No room left on this line. Justify it, or take a sort out.'); return; } }
      L.push({ ch: ch, w: w0 }); unjust(); render();
    }
    function unjust() { lines[cur].just = false; }
    function justify() {
      var L = lines[cur]; while (L.length && L[L.length - 1].ch === ' ') L.pop(); while (L.length && L[0].ch === ' ') L.shift();
      if (!L.length) { say('Set some letters first.'); return; }
      var gaps = [], letters = 0; L.forEach(function (x, i) { if (x.ch === ' ') { if (i && L[i - 1].ch !== ' ') gaps.push(i); } else letters += x.w; });
      var nl = L.filter(function (x) { return x.ch !== ' '; });
      var fill = MEASURE - letters;
      if (fill < gaps.length) { say('Too long to justify: take out a letter or two.'); render(); return; }
      var out = [], wordStarts = 0;
      if (!gaps.length) { var lft = M.floor(fill / 2); if (lft) out.push({ ch: ' ', w: lft }); nl.forEach(function (x) { out.push(x); }); if (fill - lft) out.push({ ch: ' ', w: fill - lft }); }
      else {
        var base = M.floor(fill / gaps.length), extra = fill - base * gaps.length, words = [], wd = [];
        L.forEach(function (x) { if (x.ch === ' ') { if (wd.length) { words.push(wd); wd = []; } } else wd.push(x); }); if (wd.length) words.push(wd);
        words.forEach(function (wd2, i) { wd2.forEach(function (x) { out.push(x); }); if (i < words.length - 1) out.push({ ch: ' ', w: base + (i < extra ? 1 : 0) }); });
      }
      out.just = true; lines[cur] = out; render(); say('Justified: thin and thick spaces now fill the line exactly, so it locks up tight.');
      void wordStarts;
    }
    function say(s) { msg1.textContent = s; }
    function render() {
      stick.innerHTML = ''; stick.classList.toggle('fsp-unmir', !mirrored);
      lines.forEach(function (L, i) {
        var row = ce('div', 'fsp-line' + (i === cur ? ' fsp-cur' : '') + (L.just ? ' fsp-full' : '') + (width(L) > MEASURE ? ' fsp-overfull' : ''));
        row.style.flexDirection = mirrored ? 'row-reverse' : 'row';
        L.forEach(function (x) { var s = ce('span', 'fsp-s' + (x.ch === ' ' ? ' fsp-sp' : ''), x.ch === ' ' ? '' : '<span>' + x.ch + '</span>'); s.style.width = (x.w / MEASURE * 100) + '%'; row.appendChild(s); });
        row.setAttribute('aria-label', 'Line ' + (i + 1) + ': ' + (L.map(function (x) { return x.ch; }).join('').trim() || 'empty') + (L.just ? ', justified' : ''));
        row.setAttribute('role', 'img'); stick.appendChild(row);
      });
      var L = lines[cur], w0 = width(L);
      gauge.innerHTML = '<span>Line ' + (cur + 1) + ' of up to ' + MAXL + '</span><span>' + (L.just ? 'justified' : w0 + ' of ' + MEASURE + ' units used') + '</span>';
    }
    // tapping, typing and dragging sorts
    var drag = null;
    caseBox.addEventListener('pointerdown', function (e) {
      var b = e.target.closest('.fsp-k'); if (!b) return;
      drag = { ch: b.dataset.ch, x: e.clientX, y: e.clientY, moved: false, ghost: null, id: e.pointerId, b: b };
      try { b.setPointerCapture(e.pointerId); } catch (x) { }
    });
    caseBox.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && M.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) { drag.moved = true; drag.ghost = ce('div', 'fsp-ghost', '<span>' + (drag.ch === ' ' ? '' : drag.ch) + '</span>'); el.appendChild(drag.ghost); }
      if (drag.moved) { e.preventDefault(); drag.ghost.style.left = (e.clientX - 19) + 'px'; drag.ghost.style.top = (e.clientY - 22) + 'px'; var r = stick.getBoundingClientRect(); stick.classList.toggle('fsp-over', e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom); }
    });
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null; stick.classList.remove('fsp-over');
      if (d.ghost) d.ghost.remove();
      if (!d.moved) { if (e.type === 'pointerup') { add(d.ch); d.skipClick = true; lastTap = performance.now(); } return; }
      var r = stick.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) add(d.ch); else say('Drop the sort onto the composing stick.');
    }
    var lastTap = 0;
    caseBox.addEventListener('pointerup', endDrag); caseBox.addEventListener('pointercancel', endDrag);
    caseBox.addEventListener('click', function (e) { var b = e.target.closest('.fsp-k'); if (!b) return; if (e.detail !== 0 && performance.now() - lastTap < 1000) return; add(b.dataset.ch); }); // keyboard Enter / Space (pointer taps are added on pointerup)
    caseBox.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 && /[A-Za-z.,]/.test(e.key)) { e.preventDefault(); add(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); var L = lines[cur]; if (L.length) L.pop(); unjust(); render(); }
    });

    /* ---- panel 2: the press ---- */
    var P2 = panels[1];
    P2.appendChild(ce('p', '', 'Lock the type in its frame, ink it, lay damp paper on it, run it under the press and pull the bar. Do the steps in order, like a pressman.'));
    var box = ce('div', 'fsp-pressbox'); P2.appendChild(box);
    var svgWrap = ce('div'); box.appendChild(svgWrap);
    var right = ce('div'); box.appendChild(right);
    var NS = 'http://www.w3.org/2000/svg';
    svgWrap.innerHTML = pressSVG();
    var svg = svgWrap.querySelector('svg');
    function q(s) { return svg.querySelector(s); }
    var steps = ce('ol', 'fsp-steps'); right.appendChild(steps);
    var msg2 = ce('p', 'fsp-msg'); msg2.setAttribute('aria-live', 'polite'); right.appendChild(msg2);
    var sheetH = ce('h3', '', 'The printed sheet'); right.appendChild(sheetH);
    var sheet = ce('div', 'fsp-sheet'); right.appendChild(sheet);
    var countP = ce('p', 'fsp-small'); right.appendChild(countP);
    var ps = { locked: false, dabs: 0, damp: false, paper: false, inBed: false, pull: 0, printed: 0, sheetDone: false };
    sheet.innerHTML = '<p class="fsp-blank">Nothing printed yet.</p>';
    function stepRow(label, fn) { var li = ce('li'); var mark = ce('span', '', '○'); mark.setAttribute('aria-hidden', 'true'); var b = V.button(li, label, fn); li.insertBefore(mark, b); steps.appendChild(li); return { li: li, b: b, mark: mark }; }
    var sLock = stepRow('Lock up the forme', function () { if (ps.locked) { say2('Already locked tight.'); return; } ps.locked = true; say2('Wooden wedges called quoins squeeze the type in its iron frame, the chase. Now no letter can wiggle.'); upd(); });
    var sInk = stepRow('Dab ink with the ink balls', function () { if (!ps.locked) { say2('Lock up the forme first, or the ink balls will pull sorts out.'); return; } if (ps.inBed) { say2('Run the bed back out before inking.'); return; } ps.dabs++; animDab(); say2(ps.dabs < 3 ? 'Dab ' + ps.dabs + ': the type needs a few more dabs to be evenly black.' : ps.dabs <= 5 ? 'Dab ' + ps.dabs + ': a good, even coat of sticky, oil-based ink.' : 'Dab ' + ps.dabs + ': that is a lot of ink. It may blot.'); upd(); });
    var sDamp = stepRow('Dampen the paper and lay it on', function () { if (ps.paper) { say2('The paper is already in place.'); return; } if (ps.dabs === 0) { say2('Ink the type before laying the paper on.'); return; } ps.damp = true; ps.paper = true; say2('Damp paper is softer, so it presses into the inked letters and takes the ink well.'); upd(); });
    var sRun = stepRow('Roll the bed under the platen', function () { if (!ps.paper) { say2('Lay the paper on first.'); return; } ps.inBed = true; say2('The pressman cranks the bed in until the type sits under the platen.'); upd(); });
    var pullRow = ce('li'); steps.appendChild(pullRow);
    var pullMark = ce('span', '', '○'); pullMark.setAttribute('aria-hidden', 'true'); pullRow.appendChild(pullMark);
    var pullB = V.button(pullRow, 'Pull the bar', function () { if (canPull()) animPull(); });
    function canPull() { if (!ps.inBed) { say2('Roll the bed in first.'); return false; } if (ps.sheetDone) { say2('This sheet is printed. Press Print another sheet to ink up again.'); return false; } return true; }
    pullRow.appendChild(ce('span', 'fsp-small', 'or drag the bar in the picture'));
    var again = stepRow('Print another sheet', function () { ps.sheetDone = false; ps.dabs = 0; ps.paper = false; ps.damp = false; ps.inBed = false; ps.pull = 0; setBar(0); upd(); say2('Ink the type again for the next sheet. A real press crew kept this up all day.'); });
    function say2(s) { msg2.textContent = s; }
    function upd() {
      sLock.mark.textContent = ps.locked ? '✓' : '○'; sLock.mark.className = ps.locked ? 'fsp-done' : '';
      sInk.mark.textContent = ps.dabs >= 3 ? '✓' : ps.dabs ? '◐' : '○'; sInk.mark.className = ps.dabs >= 3 ? 'fsp-done' : '';
      sDamp.mark.textContent = ps.paper ? '✓' : '○'; sDamp.mark.className = ps.paper ? 'fsp-done' : '';
      sRun.mark.textContent = ps.inBed ? '✓' : '○'; sRun.mark.className = ps.inBed ? 'fsp-done' : '';
      pullMark.textContent = ps.pull >= 1 ? '✓' : '○'; pullMark.className = ps.pull >= 1 ? 'fsp-done' : '';
      q('.fsp-quoin').setAttribute('opacity', ps.locked ? 1 : 0.25);
      q('.fsp-inkcoat').setAttribute('opacity', M.min(1, ps.dabs / 4));
      q('.fsp-paper').setAttribute('opacity', ps.paper ? 1 : 0);
      q('.fsp-bed').setAttribute('transform', 'translate(' + (ps.inBed ? 0 : -70) + ',0)');
      countP.textContent = ps.printed ? 'Sheets printed so far: ' + ps.printed + '.' : '';
    }
    function animDab() { var b = q('.fsp-balls'); if (V.reduced) return; b.setAttribute('transform', 'translate(0,14)'); setTimeout(function () { b.setAttribute('transform', 'translate(0,0)'); }, 160); }
    function setBar(f) {
      ps.pull = f; var th = f * 25, r = th * PI / 180, ex = 200 + 92 * M.cos(r), ey = 78 + 92 * M.sin(r);
      q('.fsp-bar').setAttribute('transform', 'rotate(' + th + ' 200 78)'); q('.fsp-platen').setAttribute('transform', 'translate(0,' + (f * 8) + ')');
      q('.fsp-armline').setAttribute('d', 'M318 134 L' + ex.toFixed(1) + ' ' + (ey + 3).toFixed(1)); q('.fsp-hand').setAttribute('cx', ex.toFixed(1)); q('.fsp-hand').setAttribute('cy', (ey + 3).toFixed(1));
      barH.setAttribute('cx', ex.toFixed(1)); barH.setAttribute('cy', ey.toFixed(1)); barH.setAttribute('aria-valuenow', String(M.round(f * 100)));
    }
    function animPull() {
      if (V.reduced) { setBar(1); done(); return; }
      var t0 = performance.now(); (function fr(t) { var f = M.min(1, (t - t0) / 600); setBar(f); if (f < 1) requestAnimationFrame(fr); else done(); })(t0);
    }
    function done() {
      var quality = ps.dabs === 0 ? 'blank' : ps.dabs < 3 ? 'q-patchy' : ps.dabs > 7 ? 'q-blot' : !ps.damp ? 'q-patchy' : ps.pull < 0.85 ? 'q-faint' : 'good';
      ps.printed++; ps.sheetDone = true; showSheet(quality);
      say2(quality === 'good' ? 'A crisp page! The letters that were backward on the metal now read the right way.' : quality === 'q-patchy' ? 'Patchy: too little ink. Next time dab three to five times.' : quality === 'q-blot' ? 'Blotchy: too much ink squeezed out around the letters.' : quality === 'q-faint' ? 'Faint: pull the bar all the way.' : 'Nothing printed.');
      upd();
      setTimeout(function () { if (ps.pull >= 1) { /* the bar springs back */ setBar(0); ps.pull = 1; pullMark.textContent = '✓'; } }, 700);
    }
    function showSheet(cls) {
      sheet.className = 'fsp-sheet' + (cls && cls !== 'good' ? ' ' + cls : ''); sheet.innerHTML = '';
      var any = false;
      lines.forEach(function (L) {
        if (!L.length) return; any = true; var row = ce('div', 'fsp-pl');
        // words as running text, spaces as stretchy gaps sized like the space sorts, so a justified line fills the measure
        var word = '', full = !!L.just;
        function flush() { if (word) { row.appendChild(ce('span', 'fsp-pc', word.replace(/&/g, '&amp;').replace(/</g, '&lt;'))); word = ''; } }
        L.forEach(function (x) { if (x.ch === ' ') { flush(); var g = ce('span', 'fsp-gap'); g.style.flexGrow = full ? String(x.w) : '0'; g.style.minWidth = (x.w * 0.18) + 'em'; row.appendChild(g); } else word += x.ch; });
        flush(); sheet.appendChild(row);
      });
      if (!any || cls === 'blank') sheet.innerHTML = '<p class="fsp-blank">Blank paper.</p>';
      sheet.setAttribute('aria-label', 'Printed sheet: ' + lines.map(function (L) { return L.map(function (x) { return x.ch; }).join('').replace(/\s+/g, ' ').trim(); }).join(' / '));
    }
    // the bar handle: drag it, or use the arrow keys
    var barH = q('.fsp-barhit');
    barH.setAttribute('tabindex', '0'); barH.setAttribute('role', 'slider'); barH.setAttribute('aria-label', 'Press bar'); barH.setAttribute('aria-valuemin', '0'); barH.setAttribute('aria-valuemax', '100'); barH.setAttribute('aria-valuenow', '0');
    var bd = null;
    function svgPt(e) { var r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 400, (e.clientY - r.top) / r.height * 260]; }
    barH.addEventListener('pointerdown', function (e) { if (!canPull()) return; bd = e.pointerId; try { barH.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); });
    barH.addEventListener('pointermove', function (e) { if (bd !== e.pointerId) return; var p = svgPt(e), a = M.atan2(p[1] - 78, p[0] - 200); setBar(clamp(a / (25 * PI / 180), 0, 1)); });
    function bup(e) { if (bd !== e.pointerId) return; bd = null; if (ps.pull > 0.15) done(); else setBar(0); }
    barH.addEventListener('pointerup', bup); barH.addEventListener('pointercancel', bup);
    barH.addEventListener('keydown', function (e) {
      if (!/Arrow|Home|End/.test(e.key)) return; e.preventDefault(); if (!canPull()) return;
      var f = ps.pull + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 0.2 : e.key === 'End' ? 1 : e.key === 'Home' ? -1 : -0.2); f = clamp(f, 0, 1); setBar(f); if (f >= 1) done();
    });
    function enterPress() {
      if (!lines.some(function (L) { return L.some(function (x) { return x.ch !== ' '; }); })) {
        lines = [[]]; cur = 0; 'Let there be light'.split('').forEach(add); justify(); say2('No type was set yet, so a sample line is ready for you: Let there be light.');
      }
      var lbl = lines.map(function (L) { return L.map(function (x) { return x.ch; }).join('').replace(/\s+/g, ' ').trim(); }).filter(Boolean).join(' / ');
      q('.fsp-formetxt').textContent = lbl.length > 28 ? lbl.slice(0, 26) + '…' : lbl;
      svg.setAttribute('aria-label', 'A wooden screw press. A pressman holds the bar. The forme holds your type: ' + lbl);
      upd();
    }
    function pressSVG() {
      return '<svg class="fsp-press" viewBox="0 0 400 260" role="img" aria-label="A wooden screw press">' +
        '<rect x="0" y="236" width="400" height="24" fill="var(--mv-line)"/>' +
        // frame
        '<rect x="96" y="18" width="16" height="220" fill="var(--fsp-wood)" stroke="var(--fsp-wood2)"/><rect x="288" y="18" width="16" height="220" fill="var(--fsp-wood)" stroke="var(--fsp-wood2)"/>' +
        '<rect x="88" y="10" width="224" height="18" rx="3" fill="var(--fsp-wood)" stroke="var(--fsp-wood2)"/><rect x="104" y="58" width="192" height="14" fill="var(--fsp-wood)" stroke="var(--fsp-wood2)"/>' +
        // screw
        '<rect x="193" y="28" width="14" height="62" fill="var(--fsp-metal)"/><path d="M193 34 l14 6 M193 44 l14 6 M193 54 l14 6 M193 64 l14 6 M193 74 l14 6" stroke="#5b6166" stroke-width="2"/>' +
        // bar (pivot at 200,78)
        '<g class="fsp-bar"><rect x="200" y="74" width="92" height="8" rx="4" fill="#5b6166"/><circle cx="292" cy="78" r="7" fill="#3d4246"/></g>' +
        // platen
        '<g class="fsp-platen"><rect x="160" y="90" width="80" height="14" rx="2" fill="var(--fsp-wood2)"/></g>' +
        // bed with forme, ink coat and paper
        '<g class="fsp-bed" transform="translate(-70,0)"><rect x="120" y="150" width="170" height="14" fill="var(--fsp-wood2)"/>' +
        '<rect x="150" y="128" width="100" height="22" fill="#5b6166"/><rect x="156" y="132" width="88" height="14" fill="var(--fsp-sort)"/>' +
        '<rect class="fsp-inkcoat" x="156" y="132" width="88" height="5" fill="#1d2320" opacity="0"/>' +
        '<g class="fsp-quoin" opacity=".25"><path d="M150 128 l-8 0 l8 22 z" fill="var(--fsp-wood)"/><path d="M250 128 l8 0 l-8 22 z" fill="var(--fsp-wood)"/></g>' +
        '<rect class="fsp-paper" x="152" y="124" width="96" height="5" fill="var(--fsp-paper)" stroke="#b8963e" opacity="0"/>' +
        '<text class="fsp-formetxt" x="200" y="160" font-size="8" text-anchor="middle" fill="#fff" font-family="Georgia,serif"></text></g>' +
        // rails and table legs
        '<rect x="104" y="164" width="250" height="8" fill="var(--fsp-wood)"/><rect x="330" y="172" width="10" height="66" fill="var(--fsp-wood)"/>' +
        // ink balls on the side
        '<g class="fsp-balls"><path d="M38 76 l0 -30" stroke="var(--fsp-wood2)" stroke-width="5"/><ellipse cx="38" cy="82" rx="15" ry="9" fill="#3d3027"/><path d="M68 76 l0 -30" stroke="var(--fsp-wood2)" stroke-width="5"/><ellipse cx="68" cy="82" rx="15" ry="9" fill="#3d3027"/></g>' +
        '<text x="53" y="104" font-size="9" text-anchor="middle" fill="var(--mv-muted)" font-family="system-ui,sans-serif">ink balls</text>' +
        // the pressman (cartoon skin #ffcc4d, outline #e8a93a)
        '<g class="fsp-man"><rect x="314" y="190" width="10" height="46" fill="#3b4a5a"/><rect x="330" y="190" width="10" height="46" fill="#3b4a5a"/>' +
        '<path d="M312 128 q15 -10 30 0 l4 64 h-38 z" fill="#00562f"/>' +
        '<path class="fsp-armline" d="M318 134 L292 81" stroke="#00562f" stroke-width="9" stroke-linecap="round"/><circle class="fsp-hand" cx="292" cy="81" r="6" fill="#ffcc4d" stroke="#e8a93a" stroke-width="1.5"/>' +
        '<circle cx="327" cy="110" r="15" fill="#ffcc4d" stroke="#e8a93a" stroke-width="2"/><path d="M312 106 q15 -18 30 0 q-6 -6 -15 -6 q-9 0 -15 6z" fill="#6b4a2b"/>' +
        '<circle cx="321" cy="111" r="1.6" fill="#1d2320"/><path d="M318 117 q5 3 9 0" stroke="#1d2320" stroke-width="1.4" fill="none"/></g>' +
        // invisible big hit area on the bar's end
        '<circle class="fsp-barhit" cx="292" cy="78" r="22" fill="transparent" style="cursor:grab"/>' +
        '</svg>';
    }

    /* ---- panel 3: pen or press ---- */
    var P3 = panels[2];
    P3.appendChild(ce('p', '', 'How much faster was the press? Both numbers come in ranges, because people and presses worked at different speeds. Choose a working day and run it.'));
    var c3 = ce('div', 'ml-ctl'); P3.appendChild(c3);
    var hrs = 12; V.slider(c3, { label: 'Hours in the working day', min: 8, max: 14, step: 1, value: hrs, input: function (v) { hrs = v; reset3(); } });
    var runB = V.button(c3, 'Run one working day', run3);
    var cnt = ce('div', 'fsp-count'); P3.appendChild(cnt);
    function lane(title, note) { var d = ce('div', 'fsp-lane'); d.appendChild(ce('h3', '', title)); var big = ce('p', 'fsp-big', '0'); d.appendChild(big); var bar = ce('div', 'fsp-bar'); var i = ce('i'); bar.appendChild(i); d.appendChild(bar); d.appendChild(ce('p', 'fsp-small', note)); cnt.appendChild(d); return { big: big, bar: i }; }
    var LS = lane('A scribe with a pen', 'Pages written. Studies of dated medieval manuscripts find most scribes copied about 2 to 3 leaves (4 to 6 pages) a day, and anywhere from under 1 to about 10 leaves.');
    var LP = lane('A hand press and its crew', 'Sheets printed on one side. Later records give about 200 to 250 an hour for a two-man hand press (the 1573 Frankfurt printing rules, and Joseph Moxon in 1683). Gutenberg\'s first presses were probably slower.');
    var out3 = ce('p', 'fsp-msg'); out3.setAttribute('aria-live', 'polite'); P3.appendChild(out3);
    var bible = ce('p', ''); P3.appendChild(bible);
    function reset3() { LS.big.textContent = '0'; LP.big.textContent = '0'; LS.bar.style.width = '0'; LP.bar.style.width = '0'; out3.textContent = ''; bibleCalc(); }
    function n0(x) { return M.round(x).toLocaleString('en-US'); }
    function run3() {
      var sLo = 4, sHi = 6, pLo = 200 * hrs, pHi = 250 * hrs, t0 = performance.now(), dur = V.reduced ? 0 : 2200; runB.disabled = true;
      (function fr(t) {
        var f = dur ? M.min(1, (t - t0) / dur) : 1;
        LS.big.textContent = n0(sLo * f) + ' to ' + n0(sHi * f); LP.big.textContent = n0(pLo * f) + ' to ' + n0(pHi * f);
        LS.bar.style.width = (sHi / pHi * 100 * f) + '%'; LP.bar.style.width = (100 * f) + '%';
        if (f < 1) requestAnimationFrame(fr); else { runB.disabled = false; out3.textContent = 'In ' + hrs + ' hours: a scribe writes about 4 to 6 pages; a press crew prints about ' + n0(pLo) + ' to ' + n0(pHi) + ' sheet sides, each carrying one or more pages. That is hundreds of times as many, once the type is set.'; }
      })(t0);
    }
    function bibleCalc() {
      bible.innerHTML = '<b>One Gutenberg Bible</b> has about 1,288 pages. At 4 to 6 pages a day, one scribe would need about ' + n0(1288 / 6) + ' to ' + n0(1288 / 4) + ' working days for a single copy. The press made about 180 copies (estimates run from about 160 to 185). Setting all that type by hand was the slow part: the whole job took a team of workers a few years, from soon after 1450 to about 1454 or 1455.';
    }
    var facts = ce('div', 'fsp-facts'); P3.appendChild(facts);
    [['Type metal', 'Mostly lead, with tin and antimony added. It melts easily, fills the mould sharply and hardens almost at once.'],
     ['Punch, matrix and hand mould', 'A steel punch carved with a letter is struck into softer copper to make a matrix. The matrix sits in a two-part hand mould; pour in metal, open it, and out drops a sort. Repeat, thousands of times.'],
     ['Oil-based ink', 'Watery ink used by scribes runs off metal. Printers used a sticky ink made with oil, like a varnish with soot in it, that clings to type.'],
     ['The press', 'A screw press like those long used to squeeze grapes for wine and olives for oil, rebuilt to press paper evenly onto type.'],
     ['The Bible', 'Printed in Mainz and finished by about 1454 or 1455; about 180 copies, about three-quarters on paper and the rest on vellum. 49 copies survive in whole or in large part.']]
      .forEach(function (f) { facts.appendChild(ce('div', 'fsp-fact', '<b>' + f[0] + '.</b> ' + f[1])); });

    render(); sel(0); bibleCalc();
  });
})(window, document);
