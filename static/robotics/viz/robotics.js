/* Robotics Ladder visual kit: interactive visuals named rb-…, registered with window.MathLadder.viz.register.
   Loaded after static/math/viz/core.js on every Robotics Ladder page. Vanilla JavaScript on a canvas, no libraries, no
   network requests. Follows the site's light or dark theme (redraws when it changes) and prefers-reduced-motion (then
   nothing moves until Play is pressed).

   USE   <div class="ml-viz" data-viz="rb-pid" data-opts='{"kp":2}'></div>

   VISUALS (options in brackets)
     rb-sta        sense, think, act: a robot drives toward a wall and uses (or ignores) its distance sensor  [sensor]
     rb-circuit    battery, switch, resistor and LED; or a plain resistor for Ohm's law  [mode: kids|led|ohm, v, r]
     rb-divider    a light sensor in a voltage divider read by an analog pin; or a bare analog input  [mode: divider|adc, bits]
     rb-pwm        pulse-width modulation: duty cycle, the average voltage and a motor's speed  [duty, v]
     rb-grid       a robot on a grid running a short block program, step by step  [prog: 0..3]
     rb-lever      a cardboard arm as a lever: pivot, effort and load distances  [a, b]
     rb-fsm        a line follower's state machine: press sensor readings and watch the state change
     rb-gears      a driver gear and a driven gear: speed and torque  [t1, t2]
     rb-arm        a two-link arm: forward kinematics with angle sliders, or inverse kinematics by dragging the target  [mode: fk|ik, l1, l2]
     rb-frames     a robot's own frame on the world map and a point seen by its sensor  [x, y, th]
     rb-pid        a PID controller moving a cart to a target, with a graph; or a first-order step response  [mode: pid|first, kp, ki, kd, tau]
     rb-noise      a noisy sensor and a filter: none, moving average or complementary  [filter: none|avg|comp]
     rb-kalman     a one-dimensional Kalman filter tracking a moving cart  [r, q]
     rb-diffdrive  differential drive: two wheel speeds, the path, and odometry drift  [vl, vr, drift]
     rb-astar      a grid planner: breadth-first search or A*, with walls you can click  [algo: bfs|astar]
     rb-threshold  color thresholding of a small camera image, the mask, its center and the steering error  [t]
     rb-pinhole    the pinhole camera: object size, distance, focal length and image size  [h, z, f]
     rb-ros        a ROS 2 graph: nodes passing messages on topics  [rate]
     rb-encoder    a wheel encoder counting ticks as the wheel turns  [cpr, r]
   Every canvas has an aria-label, and a live readout under it says the numbers in words. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, PI = M.PI, fm = V.fmt;
  function nm(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------- a scene: wrapper, canvas, controls row, readout; redraws on theme change and resize ---------- */
  function scene(el, opts, o) {
    el.classList.add('rbv');
    var wrap = V.el('div', 'rbv-wrap'); el.appendChild(wrap);
    if (opts.task) wrap.appendChild(V.el('p', 'rbv-task', opts.task));
    var c = V.canvas(wrap, { aspect: o.aspect || 1.7, max: o.max || 400, min: o.min || 210 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', opts.label || o.label || 'Robotics picture');
    var ctl = V.el('div', 'ml-ctl rbv-ctl'); wrap.appendChild(ctl);
    var ro = V.readout(wrap);
    var S = { c: c, ctx: c.ctx, ctl: ctl, ro: ro, k: V.colors(), draw: function () { } };
    S.redraw = function () { S.k = V.colors(); S.ctx.clearRect(0, 0, c.w, c.h); S.ctx.fillStyle = S.k.bg; S.ctx.fillRect(0, 0, c.w, c.h); S.draw(); };
    S.say = function (s) { c.cv.setAttribute('aria-label', s.replace(/<[^>]+>/g, '')); };
    V.onTheme(S.redraw); c.onResize(S.redraw);
    S.txt = function (s, x, y, q) {
      q = q || {}; var ctx = S.ctx; ctx.save(); ctx.font = (q.w || 600) + ' ' + (q.size || (c.w < 520 ? 11 : 13)) + 'px system-ui,sans-serif';
      ctx.fillStyle = q.color || S.k.ink; ctx.textAlign = q.align || 'left'; ctx.textBaseline = q.base || 'middle'; ctx.fillText(s, x, y); ctx.restore();
    };
    S.line = function (x1, y1, x2, y2, col, lw, dash) { var ctx = S.ctx; ctx.save(); ctx.strokeStyle = col || S.k.ink; ctx.lineWidth = lw || 2; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); };
    S.poly = function (pts, stroke, lw, fill, close) { var ctx = S.ctx; if (pts.length < 2) return; ctx.save(); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close || fill) ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.stroke(); } ctx.restore(); };
    S.circ = function (x, y, r, fill, stroke, lw) { var ctx = S.ctx; ctx.save(); ctx.beginPath(); ctx.arc(x, y, M.max(0.5, r), 0, 2 * PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } ctx.restore(); };
    S.rect = function (x, y, w, h, fill, stroke, r) { var ctx = S.ctx; ctx.save(); ctx.beginPath(); if (r && ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.restore(); };
    S.arrow = function (x1, y1, x2, y2, col, lw) {
      var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(9, L * 0.45); if (L < 2) return; var ctx = S.ctx;
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw || 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.45), y2 - hs * M.sin(a - 0.45)); ctx.lineTo(x2 - hs * M.cos(a + 0.45), y2 - hs * M.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    /* a small graph in a box: G = S.graph(x, y, w, h, xmin, xmax, ymin, ymax) -> {X, Y, frame(xl, yl), plot(arr, col)} */
    S.graph = function (gx, gy, gw, gh, x0, x1, y0, y1) {
      var G = { X: function (x) { return gx + (x - x0) / (x1 - x0) * gw; }, Y: function (y) { return gy + gh - (y - y0) / (y1 - y0) * gh; } };
      G.frame = function (xl, yl) {
        S.rect(gx, gy, gw, gh, S.k.panel, null); S.line(gx, gy + gh, gx + gw, gy + gh, S.k.axis, 1.4); S.line(gx, gy, gx, gy + gh, S.k.axis, 1.4);
        if (xl) S.txt(xl, gx + gw, gy + gh + 11, { align: 'right', color: S.k.muted, w: 500 });
        if (yl) S.txt(yl, gx + 4, gy + 8, { color: S.k.muted, w: 500 });
      };
      G.plot = function (pts, col, lw, dash) { var p = []; for (var i = 0; i < pts.length; i++) p.push([G.X(pts[i][0]), clamp(G.Y(pts[i][1]), gy - 2, gy + gh + 2)]); S.poly(p, col, lw || 2.2); if (dash) { } };
      return G;
    };
    S.playBtn = function (lp, playing) {
      var b = V.button(ctl, playing ? 'Pause' : 'Play', function () { if (lp.running()) { lp.stop(); b.textContent = 'Play'; } else { lp.start(); b.textContent = 'Pause'; } });
      b.classList.add('rbv-play'); if (!playing) lp.stop(); return b;
    };
    return S;
  }
  function autoplay(opts) { return opts.play === undefined ? !V.reduced : !!opts.play; }
  function robotBody(S, x, y, ang, sz, col) { // a top-down robot: body, two wheels, a front marker
    var ctx = S.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    S.rect(-sz * 0.35, -sz * 0.62, sz * 0.7, sz * 0.16, S.k.ink, null, 2); S.rect(-sz * 0.35, sz * 0.46, sz * 0.7, sz * 0.16, S.k.ink, null, 2);
    S.rect(-sz * 0.5, -sz * 0.45, sz, sz * 0.9, col || S.k.green, S.k.ink, 6);
    S.poly([[sz * 0.5, 0], [sz * 0.22, -sz * 0.18], [sz * 0.22, sz * 0.18]], null, 0, S.k.bg);
    ctx.restore();
  }

  // ============================================================ rb-sta: sense, think, act
  V.register('rb-sta', function (el, opts) {
    var S = scene(el, opts, { aspect: 2.2, label: 'A robot drives toward a wall' });
    var sensor = opts.sensor !== false, x = 0, phase = 'go', turn = 0;
    V.seg(S.ctl, { label: 'Sensor', items: [['on', 'Sensor on'], ['off', 'Sensor off']], value: sensor ? 'on' : 'off', change: function (v) { sensor = v === 'on'; reset(); } });
    V.button(S.ctl, 'Start over', reset);
    function reset() { x = 0; phase = 'go'; turn = 0; S.redraw(); }
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, wall = w - 40, sz = M.min(56, h * 0.26), rx = 40 + x * (wall - 80 - sz / 2), ry = h * 0.55;
      S.rect(wall, 18, 16, h - 36, k.muted, null, 3); S.txt('wall', wall + 8, 12, { align: 'center', color: k.muted, w: 500 });
      var dist = M.max(0, (wall - (rx + sz / 2))) / (wall - 80) * 100;
      if (sensor) { var ctx = S.ctx; ctx.save(); ctx.globalAlpha = 0.25; S.poly([[rx + sz / 2, ry], [wall, ry - 26], [wall, ry + 26]], null, 0, k.blue); ctx.restore(); }
      robotBody(S, rx, ry, -turn, sz, k.green);
      var think = !sensor ? 'no information, keep going' : dist > 25 ? 'far away, keep going' : 'too close, stop and turn';
      var act = phase === 'bump' ? 'bumped the wall' : phase === 'turn' ? 'turning away' : 'both motors forward';
      var y0 = 22, gap = M.min(150, (w - 60) / 3);
      [['Sense', sensor ? 'distance ' + M.round(dist) + ' cm' : 'sensor off'], ['Think', think], ['Act', act]].forEach(function (p, i) {
        S.txt(p[0], 18 + i * gap, y0, { color: [k.blue, k.purple, k.orange][i], w: 700 });
      });
      S.ro.set('<b>Sense:</b> ' + (sensor ? 'distance ' + M.round(dist) + ' cm' : 'nothing (sensor off)') + ' · <b>Think:</b> ' + think + ' · <b>Act:</b> ' + act + '.');
      S.say('Robot ' + M.round(dist) + ' cm from the wall. ' + act);
    };
    var lp = V.loop(el, function (dt) {
      var w = S.c.w, sz = M.min(56, S.c.h * 0.26), wall = w - 40, span = wall - 80 - sz / 2, dist = (1 - x) * 100 * span / (wall - 80);
      if (phase === 'go') { x += dt * 0.25; if (sensor && dist < 22) phase = 'turn'; if (x >= 1) { x = 1; phase = 'bump'; } }
      else if (phase === 'turn') { turn = M.min(PI / 2, turn + dt * 1.6); if (turn >= PI / 2) { phase = 'done'; } }
      else if (phase === 'bump' || phase === 'done') { }
      S.redraw();
    });
    S.playBtn(lp, autoplay(opts));
    S.redraw();
  });

  // ============================================================ rb-circuit
  V.register('rb-circuit', function (el, opts) {
    var mode = opts.mode || 'led', on = mode === 'ohm' ? true : !!opts.on, v = nm(opts.v, mode === 'ohm' ? 6 : 5), r = nm(opts.r, mode === 'ohm' ? 100 : 220), vf = 2;
    var S = scene(el, opts, { aspect: 1.9, label: 'A simple circuit' });
    if (mode !== 'ohm') V.button(S.ctl, 'Flip the switch', function () { on = !on; S.redraw(); });
    if (mode !== 'kids') {
      V.slider(S.ctl, { label: 'Battery voltage', min: mode === 'ohm' ? 1 : 3, max: 12, step: 0.5, value: v, fmt: function (x) { return fm(x, 1) + ' V'; }, input: function (x) { v = x; S.redraw(); } });
      V.slider(S.ctl, { label: 'Resistor', min: mode === 'ohm' ? 10 : 47, max: 1000, step: 1, value: r, fmt: function (x) { return M.round(x) + ' Ω'; }, input: function (x) { r = x; S.redraw(); } });
    }
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, L = 40, R = w - 40, T = 40, B = h - 40;
      var I = mode === 'ohm' ? v / r : (on && v > vf ? (v - vf) / r : 0); if (mode === 'kids') I = on ? 0.015 : 0;
      var wire = on && I > 0 ? k.gold : k.muted;
      S.line(L, T, R, T, wire, 3); S.line(R, T, R, B, wire, 3); S.line(R, B, L, B, wire, 3); S.line(L, B, L, T, wire, 3);
      // battery on the left side
      var by = (T + B) / 2; S.rect(L - 16, by - 26, 32, 52, k.bg, null); S.line(L - 14, by - 8, L + 14, by - 8, k.ink, 3); S.line(L - 8, by + 6, L + 8, by + 6, k.ink, 5);
      S.txt('+', L + 20, by - 14, { color: k.red, w: 700 }); S.txt(mode === 'kids' ? 'battery' : fm(v, 1) + ' V', L + 22, by + 18, { w: 600 });
      // switch on the top
      if (mode !== 'ohm') {
        var sx = L + (R - L) * 0.3; S.rect(sx - 24, T - 6, 48, 12, k.bg, null);
        S.circ(sx - 20, T, 4, k.ink); S.circ(sx + 20, T, 4, k.ink);
        if (on) S.line(sx - 20, T, sx + 20, T, k.ink, 3); else S.line(sx - 20, T, sx + 14, T - 18, k.ink, 3);
        S.txt(on ? 'switch closed' : 'switch open', sx, T - 26, { align: 'center', color: k.muted, w: 500 });
      }
      // resistor on the right side (zigzag)
      if (mode !== 'kids') {
        var ry = (T + B) / 2; S.rect(R - 10, ry - 34, 20, 68, k.bg, null);
        var zz = []; for (var i = 0; i <= 8; i++) zz.push([R + (i % 2 ? 9 : -9) * (i && i < 8 ? 1 : 0), ry - 32 + i * 8]); S.poly(zz, k.ink, 2.4);
        S.txt(M.round(r) + ' Ω', R - 16, ry, { align: 'right' });
      }
      // LED on the bottom
      if (mode !== 'ohm') {
        var lx = L + (R - L) * 0.55, glow = clamp(I / 0.02, 0, 1.4);
        if (glow > 0) { var ctx = S.ctx; ctx.save(); ctx.globalAlpha = 0.25 + 0.4 * M.min(1, glow); S.circ(lx, B, 26 * M.min(1.2, glow) + 6, k.red); ctx.restore(); }
        S.rect(lx - 14, B - 12, 28, 24, k.bg, null); S.poly([[lx - 10, B - 11], [lx - 10, B + 11], [lx + 9, B]], k.ink, 2, glow > 0 ? k.red : k.bg); S.line(lx + 10, B - 11, lx + 10, B + 11, k.ink, 2.4);
        S.txt('LED', lx, B + 24, { align: 'center', color: k.muted, w: 500 });
      }
      // current arrows
      if (I > 0) { S.arrow(L + (R - L) * 0.55, T + 14, L + (R - L) * 0.75, T + 14, k.blue, 2); S.txt('current', L + (R - L) * 0.65, T + 28, { align: 'center', color: k.blue, w: 500 }); }
      var s;
      if (mode === 'kids') s = on ? 'The switch closes the loop, so current flows all the way around and the LED lights.' : 'The switch is open. The loop is broken, so no current flows and the LED is dark.';
      else if (mode === 'ohm') s = 'I = V / R = ' + fm(v, 1) + ' V ÷ ' + M.round(r) + ' Ω = ' + fm(1000 * I, 1) + ' mA.';
      else if (!on) s = 'Switch open: no current, LED off.';
      else s = 'The resistor drops ' + fm(v - vf, 1) + ' V (the LED takes about ' + vf + ' V), so I = ' + fm(v - vf, 1) + ' V ÷ ' + M.round(r) + ' Ω = ' + fm(1000 * I, 1) + ' mA.' + (I > 0.02 ? ' That is more than the 20 mA a typical small LED is rated for: use a bigger resistor.' : ' A safe current for a typical small LED.');
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-divider: light sensor divider, or ADC
  V.register('rb-divider', function (el, opts) {
    var mode = opts.mode || 'divider', bits = nm(opts.bits, 10), light = 50, vin = mode === 'adc' ? 1.65 : 3.3;
    var S = scene(el, opts, { aspect: 1.9, label: mode === 'adc' ? 'An analog input' : 'A light sensor in a voltage divider' });
    if (mode === 'adc') V.slider(S.ctl, { label: 'Voltage at the pin', min: 0, max: 3.3, step: 0.01, value: vin, fmt: function (x) { return fm(x, 2) + ' V'; }, input: function (x) { vin = x; S.redraw(); } });
    else V.slider(S.ctl, { label: 'Light level', min: 1, max: 100, step: 1, value: light, fmt: function (x) { return M.round(x) + '%'; }, input: function (x) { light = x; S.redraw(); } });
    V.seg(S.ctl, { label: 'Resolution', items: [['8', '8-bit'], ['10', '10-bit'], ['12', '12-bit']], value: String(bits), change: function (x) { bits = +x; S.redraw(); } });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, vout, rl = 0, top = 1023;
      top = M.pow(2, bits) - 1;
      if (mode === 'adc') vout = vin; else { rl = 200000 / (light + 1); vout = 3.3 * 10000 / (rl + 10000); }
      var count = M.round(vout / 3.3 * top);
      if (mode !== 'adc') {
        var x = 60, t = 30, b = h - 30, mid = (t + b) / 2;
        S.line(x, t, x, b, k.muted, 3); S.txt('3.3 V', x + 8, t, {}); S.txt('GND', x + 8, b, {});
        S.rect(x - 14, t + 18, 28, mid - t - 36, k.bg, k.ink, 4); S.txt('light sensor', x - 20, (t + mid) / 2, { align: 'right', size: 11 });
        S.txt(fm(rl / 1000, 1) + ' kΩ', x + 20, (t + mid) / 2, { size: 11, color: k.muted });
        S.rect(x - 14, mid + 18, 28, b - mid - 36, k.bg, k.ink, 4); S.txt('10 kΩ', x + 20, (mid + b) / 2, { size: 11, color: k.muted });
        S.line(x, mid, x + 70, mid, k.gold, 3); S.circ(x, mid, 4, k.gold); S.txt('to A0: ' + fm(vout, 2) + ' V', x + 74, mid, { color: k.gold, w: 700 });
        var sunx = w - 60, ctx = S.ctx; ctx.save(); ctx.globalAlpha = 0.2 + 0.8 * light / 100; S.circ(sunx, 50, 18, k.gold); ctx.restore(); S.txt('light', sunx, 80, { align: 'center', color: k.muted, w: 500 });
      }
      // the ADC bar
      var gx = mode === 'adc' ? 40 : M.max(230, w * 0.45), gw = w - gx - 30, gy = h * 0.55;
      S.rect(gx, gy, gw, 22, k.panel, k.grid); S.rect(gx, gy, gw * vout / 3.3, 22, k.blueSoft, null);
      S.txt('0', gx, gy + 34, { color: k.muted }); S.txt(String(top), gx + gw, gy + 34, { align: 'right', color: k.muted });
      S.txt('reading ' + count, gx + gw * vout / 3.3, gy - 12, { align: 'center', color: k.blue, w: 700 });
      var s = (mode === 'adc' ? '' : 'Vout = 3.3 V × 10 kΩ ÷ (' + fm(rl / 1000, 1) + ' kΩ + 10 kΩ) = ' + fm(vout, 2) + ' V. ') + 'A ' + bits + '-bit converter splits 0 to 3.3 V into steps 0 to ' + top + ', so the reading is about ' + count + ' (one step is ' + fm(3300 / top, 2) + ' mV).';
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-pwm
  V.register('rb-pwm', function (el, opts) {
    var duty = nm(opts.duty, 40), vs = nm(opts.v, 5), ang = 0;
    var S = scene(el, opts, { aspect: 2, label: 'A PWM signal' });
    V.slider(S.ctl, { label: 'Duty cycle', min: 0, max: 100, step: 1, value: duty, fmt: function (x) { return M.round(x) + '%'; }, input: function (x) { duty = x; S.redraw(); } });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, gw = w - 150, G = S.graph(40, 26, gw, h - 70, 0, 4, 0, vs * 1.15);
      G.frame('time', 'volts');
      var pts = []; for (var p = 0; p < 4; p++) { var a = p, b = p + duty / 100; pts.push([a, duty > 0 ? vs : 0], [b, duty > 0 ? vs : 0], [b, 0], [p + 1, 0]); if (duty >= 100) pts.push([p + 1, vs]); }
      var q = [[0, 0]].concat(pts); G.plot(q, k.blue, 2.4);
      var avg = vs * duty / 100; S.line(G.X(0), G.Y(avg), G.X(4), G.Y(avg), k.orange, 2, [6, 5]); S.txt('average ' + fm(avg, 2) + ' V', G.X(4) - 4, G.Y(avg) - 10, { align: 'right', color: k.orange, w: 700 });
      S.txt(vs + ' V', 36, G.Y(vs), { align: 'right', size: 11, color: k.muted });
      var cx = w - 60, cy = h / 2, R = M.min(40, h * 0.22); S.circ(cx, cy, R, k.panel, k.ink, 2);
      for (var i = 0; i < 3; i++) { var t = ang + i * 2 * PI / 3; S.line(cx, cy, cx + R * 0.85 * M.cos(t), cy + R * 0.85 * M.sin(t), k.green, 4); }
      S.txt('motor', cx, cy + R + 14, { align: 'center', color: k.muted, w: 500 });
      var s = 'On for ' + M.round(duty) + '% of each cycle, so the average is ' + M.round(duty) + '% of ' + vs + ' V = ' + fm(avg, 2) + ' V. The motor spins at roughly that fraction of full speed.';
      S.ro.set(s); S.say(s);
    };
    var lp = V.loop(el, function (dt) { ang += dt * 12 * duty / 100; S.redraw(); });
    S.playBtn(lp, autoplay(opts)); S.redraw();
  });

  // ============================================================ rb-grid: block program on a grid
  var PROGS = [
    { name: 'Square', code: [['repeat', 4, [['fwd', 2], ['right']]]] },
    { name: 'Zigzag', code: [['fwd', 2], ['left'], ['fwd', 1], ['right'], ['fwd', 2], ['left'], ['fwd', 1], ['right'], ['fwd', 1]] },
    { name: 'Stairs', code: [['repeat', 3, [['fwd', 1], ['left'], ['fwd', 1], ['right']]]] },
    { name: 'There and back', code: [['fwd', 4], ['right'], ['right'], ['fwd', 4]] }
  ];
  function flatten(code, out) { out = out || []; code.forEach(function (c) { if (c[0] === 'repeat') for (var i = 0; i < c[1]; i++) flatten(c[2], out); else out.push(c); }); return out; }
  function codeText(code, ind) { ind = ind || ''; var s = []; code.forEach(function (c) { if (c[0] === 'repeat') { s.push(ind + 'repeat ' + c[1] + ' times:'); s = s.concat(codeText(c[2], ind + '   ')); } else s.push(ind + (c[0] === 'fwd' ? 'forward ' + c[1] : c[0] === 'left' ? 'turn left' : 'turn right')); }); return s; }
  V.register('rb-grid', function (el, opts) {
    var pi = clamp(nm(opts.prog, 0) | 0, 0, PROGS.length - 1), steps, n, st;
    var S = scene(el, opts, { aspect: 1.7, label: 'A robot on a grid runs a program' });
    V.seg(S.ctl, { label: 'Program', items: PROGS.map(function (p, i) { return [String(i), p.name]; }), value: String(pi), change: function (v) { pi = +v; reset(); } });
    V.button(S.ctl, 'Step', function () { step(); S.redraw(); });
    V.button(S.ctl, 'Run all', function () { while (n < steps.length) step(); S.redraw(); });
    V.button(S.ctl, 'Reset', reset);
    function reset() { steps = flatten(PROGS[pi].code); n = 0; st = { x: 1, y: 5, d: 0, trail: [[1, 5]] }; S.redraw(); }
    function step() { if (n >= steps.length) return; var c = steps[n++]; var DX = [1, 0, -1, 0], DY = [0, -1, 0, 1]; if (c[0] === 'fwd') { for (var i = 0; i < c[1]; i++) { st.x += DX[st.d]; st.y += DY[st.d]; st.trail.push([st.x, st.y]); } } else if (c[0] === 'left') st.d = (st.d + 1) % 4; else st.d = (st.d + 3) % 4; }
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, cols = 8, rows = 7, panel = M.min(190, w * 0.38), cs = M.min((w - panel - 30) / cols, (h - 20) / rows), ox = 10, oy = (h - cs * rows) / 2;
      for (var i = 0; i <= cols; i++) S.line(ox + i * cs, oy, ox + i * cs, oy + rows * cs, k.grid, 1);
      for (var j = 0; j <= rows; j++) S.line(ox, oy + j * cs, ox + cols * cs, oy + j * cs, k.grid, 1);
      var P = function (p) { return [ox + (p[0] + 0.5) * cs, oy + (p[1] + 0.5) * cs]; };
      S.poly(st.trail.map(P), k.gold, 4);
      var c0 = P([st.x, st.y]); robotBody(S, c0[0], c0[1], [0, -PI / 2, PI, PI / 2][st.d], cs * 0.7, k.green);
      var lines = codeText(PROGS[pi].code), px = ox + cols * cs + 18;
      lines.forEach(function (s, i) { S.txt(s, px, 22 + i * 18, { size: 12, w: 500, color: k.ink }); });
      var s = 'Step ' + n + ' of ' + steps.length + '. The robot is at column ' + st.x + ', row ' + st.y + ', facing ' + ['right', 'up', 'left', 'down'][st.d] + '.';
      S.ro.set(s); S.say(s);
    };
    reset();
  });

  // ============================================================ rb-lever: cardboard arm as a lever
  V.register('rb-lever', function (el, opts) {
    var a = nm(opts.a, 5), b = nm(opts.b, 15), push = 0.5;
    var S = scene(el, opts, { aspect: 2.1, label: 'A lever arm' });
    V.slider(S.ctl, { label: 'Pivot to where you push (cm)', min: 2, max: 20, step: 1, value: a, input: function (x) { a = x; S.redraw(); } });
    V.slider(S.ctl, { label: 'Pivot to the gripper (cm)', min: 2, max: 25, step: 1, value: b, input: function (x) { b = x; S.redraw(); } });
    V.slider(S.ctl, { label: 'Push', min: 0, max: 1, step: 0.01, value: push, fmt: function (x) { return M.round(x * 100) + '%'; }, input: function (x) { push = x; S.redraw(); } });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, sc = (w - 80) / 47, px = 40 + 22 * sc, py = h * 0.6, ang = (push - 0.5) * 0.5;
      var e = [px - a * sc * M.cos(ang), py + a * sc * M.sin(ang)], g = [px + b * sc * M.cos(ang), py - b * sc * M.sin(ang)];
      S.poly([[px - 12, py + 30], [px + 12, py + 30], [px, py]], k.ink, 1.5, k.muted);
      S.line(e[0], e[1], g[0], g[1], '#c49a63', 9); S.circ(px, py, 5, k.ink);
      S.arrow(e[0], e[1] - 40 * (push - 0.5) - 20, e[0], e[1] - 4, k.blue, 2.4); S.txt('push', e[0], e[1] - 50, { align: 'center', color: k.blue, w: 700 });
      S.circ(g[0], g[1], 7, k.orange); S.txt('gripper', g[0], g[1] - 18, { align: 'center', color: k.orange, w: 700 });
      var ratio = b / a, s = 'The gripper is ' + fm(ratio, 2) + ' times as far from the pivot as your push, so it moves ' + fm(ratio, 2) + ' times as far, and pushes back with 1/' + fm(ratio, 2) + ' of your force.';
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-fsm: line-follower state machine
  V.register('rb-fsm', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.9, label: 'A state machine for a line follower' });
    var st = 'FORWARD', last = 'both sensors on the line';
    var T = { 'both': 'FORWARD', 'left': 'TURN LEFT', 'right': 'TURN RIGHT', 'none': 'SEARCH' };
    [['both', 'Both see the line'], ['left', 'Only left sees it'], ['right', 'Only right sees it'], ['none', 'Neither sees it']].forEach(function (b) {
      V.button(S.ctl, b[1], function () { st = T[b[0]]; last = b[1].toLowerCase(); S.redraw(); });
    });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, R = M.min(48, w * 0.1);
      var P = { 'FORWARD': [w / 2, h * 0.3], 'TURN LEFT': [w * 0.2, h * 0.66], 'TURN RIGHT': [w * 0.8, h * 0.66], 'SEARCH': [w / 2, h * 0.8] };
      var names = Object.keys(P);
      for (var i = 0; i < names.length; i++) for (var j = i + 1; j < names.length; j++) S.line(P[names[i]][0], P[names[i]][1], P[names[j]][0], P[names[j]][1], k.grid, 2);
      names.forEach(function (n) { var p = P[n], on = n === st; S.circ(p[0], p[1], R, on ? k.greenSoft : k.panel, on ? k.green : k.muted, on ? 4 : 1.5); S.txt(n, p[0], p[1], { align: 'center', size: w < 520 ? 10 : 12, w: 700, color: on ? k.green : k.ink }); });
      var act = { 'FORWARD': 'both motors forward', 'TURN LEFT': 'slow the left motor', 'TURN RIGHT': 'slow the right motor', 'SEARCH': 'spin slowly to find the line' }[st];
      var s = 'Input: ' + last + '. State: ' + st + '. Action: ' + act + '.';
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-gears
  V.register('rb-gears', function (el, opts) {
    var t1 = nm(opts.t1, 12), t2 = nm(opts.t2, 36), ang = 0;
    var S = scene(el, opts, { aspect: 1.9, label: 'Two gears' });
    V.slider(S.ctl, { label: 'Driver teeth', min: 8, max: 40, step: 1, value: t1, input: function (x) { t1 = x; S.redraw(); } });
    V.slider(S.ctl, { label: 'Driven teeth', min: 8, max: 60, step: 1, value: t2, input: function (x) { t2 = x; S.redraw(); } });
    function gear(cx, cy, r, n, a, col) {
      var pts = [], tooth = r * 0.16; for (var i = 0; i < n * 4; i++) { var t = a + i * 2 * PI / (n * 4), rr = (i % 4 < 2) ? r + tooth / 2 : r - tooth / 2; pts.push([cx + rr * M.cos(t), cy + rr * M.sin(t)]); }
      S.poly(pts, S.k.ink, 1.4, col, true); S.circ(cx, cy, r * 0.18, S.k.bg, S.k.ink); S.line(cx, cy, cx + r * 0.7 * M.cos(a), cy + r * 0.7 * M.sin(a), S.k.ink, 3);
    }
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, m = M.min((w - 40) / (2 * (t1 + t2) * 1.08), (h - 50) / (2 * M.max(t1, t2) * 1.08)), r1 = t1 * m, r2 = t2 * m, cy = h / 2 - 8, c1 = w / 2 - (r1 + r2) / 2, c2 = c1 + r1 + r2;
      gear(c1, cy, r1, t1, ang, k.blueSoft); gear(c2, cy, r2, t2, -ang * t1 / t2 + PI / t2, k.orangeSoft);
      S.txt('driver', c1, cy + r1 + 18, { align: 'center', color: k.blue, w: 700 }); S.txt('driven', c2, cy + r2 + 18 > h - 6 ? h - 8 : cy + r2 + 18, { align: 'center', color: k.orange, w: 700 });
      var g = t2 / t1, s = 'Gear ratio ' + t2 + ' : ' + t1 + ' = ' + fm(g, 2) + '. The driven gear turns ' + fm(g, 2) + ' times slower and, without losses, with ' + fm(g, 2) + ' times the torque. It also turns the other way.';
      S.ro.set(s); S.say(s);
    };
    var lp = V.loop(el, function (dt) { ang += dt * 1.2; S.redraw(); });
    S.playBtn(lp, autoplay(opts)); S.redraw();
  });

  // ============================================================ rb-arm: two-link arm, FK or IK
  V.register('rb-arm', function (el, opts) {
    var mode = opts.mode || 'fk', l1 = nm(opts.l1, 10), l2 = nm(opts.l2, 7), th1 = nm(opts.th1, 40), th2 = nm(opts.th2, 50), tx = 9, ty = 8, elbow = 'down';
    var S = scene(el, opts, { aspect: 1.45, max: 440, label: 'A two-link robot arm' });
    var s1, s2;
    if (mode === 'fk') {
      s1 = V.slider(S.ctl, { label: 'Shoulder θ₁', min: -180, max: 180, step: 1, value: th1, fmt: function (x) { return M.round(x) + '°'; }, input: function (x) { th1 = x; S.redraw(); } });
      s2 = V.slider(S.ctl, { label: 'Elbow θ₂', min: -170, max: 170, step: 1, value: th2, fmt: function (x) { return M.round(x) + '°'; }, input: function (x) { th2 = x; S.redraw(); } });
    } else {
      V.seg(S.ctl, { label: 'Elbow', items: [['down', 'Elbow down'], ['up', 'Elbow up']], value: elbow, change: function (v) { elbow = v; S.redraw(); } });
      V.el && S.ctl.appendChild(V.el('span', 'rbv-hint', 'Drag the target.'));
    }
    var P = null;
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, reach = l1 + l2, sc = M.min(w / 2, h * 0.9) / (reach * 1.1), ox = w / 2, oy = h * 0.92;
      if (mode === 'ik') { oy = h * 0.92; sc = M.min(w / (2.2 * reach), h * 0.85 / (reach * 1.05)); }
      P = { X: function (x) { return ox + x * sc; }, Y: function (y) { return oy - y * sc; }, x: function (px) { return (px - ox) / sc; }, y: function (py) { return (oy - py) / sc; } };
      S.ctx.save(); S.ctx.setLineDash([4, 6]); S.ctx.strokeStyle = k.grid; S.ctx.lineWidth = 1.5; S.ctx.beginPath(); S.ctx.arc(ox, oy, reach * sc, PI, 2 * PI); S.ctx.stroke(); if (l1 !== l2) { S.ctx.beginPath(); S.ctx.arc(ox, oy, M.abs(l1 - l2) * sc, PI, 2 * PI); S.ctx.stroke(); } S.ctx.restore();
      S.line(0, oy, w, oy, k.axis, 1.5);
      var ok = true, a1 = th1 * PI / 180, a2 = th2 * PI / 180;
      if (mode === 'ik') {
        var c2 = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
        if (c2 > 1 || c2 < -1) ok = false;
        else { a2 = M.acos(c2) * (elbow === 'down' ? 1 : -1); a1 = M.atan2(ty, tx) - M.atan2(l2 * M.sin(a2), l1 + l2 * M.cos(a2)); }
      }
      var ex = l1 * M.cos(a1), ey = l1 * M.sin(a1), hx = ex + l2 * M.cos(a1 + a2), hy = ey + l2 * M.sin(a1 + a2);
      if (mode === 'ik') { S.circ(P.X(tx), P.Y(ty), 11, k.redSoft, k.red, 2); S.line(P.X(tx) - 6, P.Y(ty), P.X(tx) + 6, P.Y(ty), k.red, 2); S.line(P.X(tx), P.Y(ty) - 6, P.X(tx), P.Y(ty) + 6, k.red, 2); }
      if (ok) {
        S.line(P.X(0), P.Y(0), P.X(ex), P.Y(ey), k.blue, 10); S.line(P.X(ex), P.Y(ey), P.X(hx), P.Y(hy), k.orange, 8);
        S.circ(P.X(0), P.Y(0), 8, k.ink); S.circ(P.X(ex), P.Y(ey), 6, k.ink); S.circ(P.X(hx), P.Y(hy), 6, k.green);
      } else { S.line(P.X(0), P.Y(0), P.X(l1 * M.cos(M.atan2(ty, tx))), P.Y(l1 * M.sin(M.atan2(ty, tx))), k.blue, 10); S.line(P.X(l1 * M.cos(M.atan2(ty, tx))), P.Y(l1 * M.sin(M.atan2(ty, tx))), P.X(reach * M.cos(M.atan2(ty, tx))), P.Y(reach * M.sin(M.atan2(ty, tx))), k.orange, 8); S.circ(P.X(0), P.Y(0), 8, k.ink); }
      var d1 = M.round(a1 * 180 / PI), d2 = M.round(a2 * 180 / PI), s;
      if (mode === 'fk') s = 'Links ' + l1 + ' and ' + l2 + '. θ₁ = ' + d1 + '°, θ₂ = ' + d2 + '°. The hand is at x = ' + fm(hx, 2) + ', y = ' + fm(hy, 2) + '.';
      else s = ok ? 'Target (' + fm(tx, 1) + ', ' + fm(ty, 1) + '): θ₁ = ' + d1 + '°, θ₂ = ' + d2 + '° (' + (elbow === 'down' ? 'elbow down' : 'elbow up') + '). The other elbow choice reaches it too.' : 'Target (' + fm(tx, 1) + ', ' + fm(ty, 1) + ') is ' + fm(M.hypot(tx, ty), 2) + ' from the shoulder. The arm reaches only from ' + M.abs(l1 - l2) + ' to ' + reach + ', so there is no solution.';
      S.ro.set(s); S.say(s);
    };
    if (mode === 'ik') V.drag(S.c.cv, {
      touchAction: 'pan-y',
      hit: function (px, py) { return P && M.hypot(px - P.X(tx), py - P.Y(ty)) < 26 ? 1 : null; },
      move: function (hd, px, py) { tx = clamp(P.x(px), -l1 - l2 - 2, l1 + l2 + 2); ty = clamp(P.y(py), 0, l1 + l2 + 2); S.redraw(); }
    });
    S.redraw();
  });

  // ============================================================ rb-frames: robot frame in the world
  V.register('rb-frames', function (el, opts) {
    var x = nm(opts.x, 3), y = nm(opts.y, 2), th = nm(opts.th, 30), px = 2, py = 1;
    var S = scene(el, opts, { aspect: 1.5, max: 420, label: 'A robot frame on a world map' });
    V.slider(S.ctl, { label: 'Robot x (m)', min: 0, max: 6, step: 0.5, value: x, input: function (v) { x = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Robot y (m)', min: 0, max: 5, step: 0.5, value: y, input: function (v) { y = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Heading θ', min: -180, max: 180, step: 5, value: th, fmt: function (v) { return M.round(v) + '°'; }, input: function (v) { th = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Point ahead, in robot frame (m)', min: 0, max: 3, step: 0.5, value: px, input: function (v) { px = v; S.redraw(); } });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, sc = M.min((w - 40) / 9, (h - 40) / 7), ox = 30, oy = h - 24;
      var X = function (a) { return ox + a * sc; }, Y = function (b) { return oy - b * sc; };
      for (var i = 0; i <= 8; i++) S.line(X(i), Y(0), X(i), Y(6.5), k.grid2 || k.grid, 1);
      for (var j = 0; j <= 6; j++) S.line(X(0), Y(j), X(8.5), Y(j), k.grid2 || k.grid, 1);
      S.arrow(X(0), Y(0), X(8.5), Y(0), k.axis, 2); S.arrow(X(0), Y(0), X(0), Y(6.5), k.axis, 2); S.txt('world x', X(8.5), Y(0) - 10, { align: 'right', color: k.muted, w: 500 }); S.txt('world y', X(0) + 6, Y(6.5) + 6, { color: k.muted, w: 500 });
      var a = th * PI / 180, c = M.cos(a), s = M.sin(a);
      S.arrow(X(x), Y(y), X(x + 1.2 * c), Y(y + 1.2 * s), k.red, 3); S.arrow(X(x), Y(y), X(x - 1.2 * s), Y(y + 1.2 * c), k.green, 3);
      S.txt('x_r', X(x + 1.35 * c), Y(y + 1.35 * s), { color: k.red, w: 700 }); S.txt('y_r', X(x - 1.35 * s), Y(y + 1.35 * c), { color: k.green, w: 700 });
      var wx = x + c * px - s * py, wy = y + s * px + c * py;
      S.line(X(x), Y(y), X(wx), Y(wy), k.gold, 1.5, [4, 4]); S.circ(X(wx), Y(wy), 6, k.gold); S.circ(X(x), Y(y), 5, k.ink);
      var t = 'The point is (' + fm(px, 1) + ', ' + fm(py, 1) + ') in the robot frame and (' + fm(wx, 2) + ', ' + fm(wy, 2) + ') on the world map: x = ' + fm(x, 1) + ' + ' + fm(px, 1) + ' cos θ − ' + fm(py, 1) + ' sin θ, y = ' + fm(y, 1) + ' + ' + fm(px, 1) + ' sin θ + ' + fm(py, 1) + ' cos θ.';
      S.ro.set(t); S.say(t);
    };
    S.redraw();
  });

  // ============================================================ rb-pid: PID on a cart, or first-order response
  V.register('rb-pid', function (el, opts) {
    var mode = opts.mode || 'pid', kp = nm(opts.kp, 2), ki = nm(opts.ki, 0), kd = nm(opts.kd, 0.5), tau = nm(opts.tau, 1);
    var S = scene(el, opts, { aspect: 1.6, max: 440, label: mode === 'pid' ? 'A PID controller moves a cart' : 'A first-order step response' });
    if (mode === 'pid') {
      V.slider(S.ctl, { label: 'Kp', min: 0, max: 10, step: 0.1, value: kp, input: function (v) { kp = v; S.redraw(); } });
      V.slider(S.ctl, { label: 'Ki', min: 0, max: 5, step: 0.1, value: ki, input: function (v) { ki = v; S.redraw(); } });
      V.slider(S.ctl, { label: 'Kd', min: 0, max: 5, step: 0.1, value: kd, input: function (v) { kd = v; S.redraw(); } });
    } else V.slider(S.ctl, { label: 'Time constant τ (s)', min: 0.2, max: 3, step: 0.1, value: tau, fmt: function (v) { return fm(v, 1) + ' s'; }, input: function (v) { tau = v; S.redraw(); } });
    function sim() { // cart with friction: x'' = u - 0.6 x' (unit mass); target 1 m; u limited to +-8
      var dt = 0.01, x = 0, v = 0, I = 0, ep = 1, out = [], mx = 0, settle = null;
      for (var t = 0; t <= 10; t += dt) {
        var e = 1 - x; I += e * dt; var d = (e - ep) / dt; ep = e; if (t === 0) d = 0;
        var u = clamp(kp * e + ki * I + kd * d, -8, 8); v += (u - 0.6 * v) * dt; x += v * dt;
        out.push([t, x]); mx = M.max(mx, x); if (M.abs(e) > 0.02) settle = null; else if (settle === null) settle = t;
      }
      return { pts: out, over: M.max(0, mx - 1), settle: settle, end: x };
    }
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k;
      if (mode === 'first') {
        var G = S.graph(44, 20, w - 70, h - 54, 0, 6, 0, 1.15); G.frame('time (s)', 'fraction of final');
        var pts = []; for (var t = 0; t <= 6; t += 0.03) pts.push([t, 1 - M.exp(-t / tau)]); G.plot(pts, k.blue, 2.6);
        S.line(G.X(0), G.Y(1), G.X(6), G.Y(1), k.muted, 1, [5, 5]); S.line(G.X(0), G.Y(0.632), G.X(tau), G.Y(0.632), k.orange, 1.6, [4, 4]); S.line(G.X(tau), G.Y(0.632), G.X(tau), G.Y(0), k.orange, 1.6, [4, 4]);
        S.txt('63%', G.X(0) - 4, G.Y(0.632), { align: 'right', color: k.orange, size: 11 }); S.txt('τ', G.X(tau), G.Y(0) + 11, { align: 'center', color: k.orange, w: 700 });
        var s0 = 'After one time constant (' + fm(tau, 1) + ' s) the response has covered 63% of the way; after 3τ (' + fm(3 * tau, 1) + ' s) about 95%; after 5τ about 99%.';
        S.ro.set(s0); S.say(s0); return;
      }
      var r = sim(), G2 = S.graph(44, 64, w - 70, h - 98, 0, 10, 0, 1.6); G2.frame('time (s)', 'position (m)');
      S.line(G2.X(0), G2.Y(1), G2.X(10), G2.Y(1), k.orange, 1.6, [6, 5]); S.txt('target', G2.X(10) - 2, G2.Y(1) - 9, { align: 'right', color: k.orange, w: 600, size: 11 });
      G2.plot(r.pts, k.blue, 2.6);
      // the cart along the top, at the final time
      var tr = 30, L = 44, Rr = w - 26; S.line(L, tr + 14, Rr, tr + 14, k.axis, 1.5); var tgt = L + (Rr - L) * 0.6, cx = L + (Rr - L) * 0.6 * clamp(r.end, -0.2, 1.6);
      S.line(tgt, tr - 12, tgt, tr + 14, k.orange, 2); S.rect(cx - 16, tr - 4, 32, 16, k.green, k.ink, 3); S.circ(cx - 9, tr + 13, 3, k.ink); S.circ(cx + 9, tr + 13, 3, k.ink);
      var s = 'Kp ' + fm(kp, 1) + ', Ki ' + fm(ki, 1) + ', Kd ' + fm(kd, 1) + ': overshoot ' + M.round(r.over * 100) + ' cm, ' + (r.settle !== null ? 'settles within 2 cm after ' + fm(r.settle, 1) + ' s.' : 'does not settle within 10 s.') + ' After 10 s it is ' + M.round(M.abs(1 - r.end) * 100) + ' cm from the target.';
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-noise: noisy sensor and filters
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = M.imul(t ^ (t >>> 15), t | 1); t ^= t + M.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(R) { var u = 0, v = 0; while (!u) u = R(); v = R(); return M.sqrt(-2 * M.log(u)) * M.cos(2 * PI * v); }
  V.register('rb-noise', function (el, opts) {
    var f = opts.filter || 'avg', n = 8, alpha = 0.95, sigma = 3, seed = 7;
    var S = scene(el, opts, { aspect: 1.7, max: 420, label: 'A noisy sensor and a filter' });
    V.seg(S.ctl, { label: 'Filter', items: [['none', 'No filter'], ['avg', 'Moving average'], ['comp', 'Complementary']], value: f, change: function (v) { f = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Noise σ', min: 0.5, max: 6, step: 0.5, value: sigma, input: function (v) { sigma = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Average of N', min: 1, max: 30, step: 1, value: n, input: function (v) { n = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Complementary α', min: 0.5, max: 0.995, step: 0.005, value: alpha, fmt: function (v) { return fm(v, 3); }, input: function (v) { alpha = v; S.redraw(); } });
    V.button(S.ctl, 'New noise', function () { seed++; S.redraw(); });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, R = rng(seed), N = 200, dt = 0.05, truth = [], raw = [], gyro = [], est = [];
      for (var i = 0; i < N; i++) { var t = i * dt, a = 20 * M.sin(t * 0.6) + (t > 5 ? 10 : 0) * 0; truth.push(a); raw.push(a + sigma * gauss(R)); gyro.push(i ? (a - truth[i - 1]) / dt + 0.8 + 0.3 * gauss(R) : 0); }
      var e = raw[0];
      for (i = 0; i < N; i++) {
        if (f === 'none') e = raw[i];
        else if (f === 'avg') { var s = 0, c = 0; for (var j = M.max(0, i - n + 1); j <= i; j++) { s += raw[j]; c++; } e = s / c; }
        else e = i ? alpha * (e + gyro[i] * dt) + (1 - alpha) * raw[i] : raw[0];
        est.push(e);
      }
      var G = S.graph(40, 16, w - 60, h - 48, 0, N * dt, -32, 32); G.frame('time (s)', 'tilt angle (°)');
      var P = function (arr) { return arr.map(function (v, i) { return [i * dt, v]; }); };
      var ctx = S.ctx; ctx.save(); ctx.globalAlpha = 0.5; G.plot(P(raw), k.muted, 1.2); ctx.restore();
      G.plot(P(truth), k.green, 1.6); G.plot(P(est), k.blue, 2.6);
      var err = 0, lag = 0; for (i = 20; i < N; i++) err += (est[i] - truth[i]) * (est[i] - truth[i]); err = M.sqrt(err / (N - 20));
      var s2 = (f === 'none' ? 'Raw readings: ' : f === 'avg' ? 'Average of the last ' + n + ': ' : 'Complementary, α = ' + fm(alpha, 3) + ': ') + 'typical error ' + fm(err, 2) + '° (the noise alone is ' + fm(sigma, 1) + '°). Gray: raw readings. Green: the true angle. Blue: the filtered estimate.' + (f === 'avg' && n > 10 ? ' A long average is smooth but lags behind.' : '');
      S.ro.set(s2); S.say(s2);
    };
    S.redraw();
  });

  // ============================================================ rb-kalman: 1-D Kalman filter
  V.register('rb-kalman', function (el, opts) {
    var r = nm(opts.r, 4), q = nm(opts.q, 0.05), seed = 3;
    var S = scene(el, opts, { aspect: 1.7, max: 420, label: 'A one-dimensional Kalman filter' });
    V.slider(S.ctl, { label: 'Measurement noise R', min: 0.25, max: 16, step: 0.25, value: r, input: function (v) { r = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Process noise Q', min: 0.01, max: 2, step: 0.01, value: q, input: function (v) { q = v; S.redraw(); } });
    V.button(S.ctl, 'New run', function () { seed++; S.redraw(); });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, Rn = rng(seed), N = 60, x = 0, vel = 0.5, tr = [], z = [], est = [], band = [], xe = 0, P = 10, K = 0;
      for (var i = 0; i < N; i++) {
        vel += 0.08 * gauss(Rn); x += vel; tr.push(x); var zi = x + M.sqrt(r) * gauss(Rn); z.push(zi);
        xe = xe + 0.5; P = P + q; K = P / (P + r); xe = xe + K * (zi - xe); P = (1 - K) * P; est.push(xe); band.push(M.sqrt(P));
      }
      var lo = M.min.apply(null, z.concat(tr)) - 3, hi = M.max.apply(null, z.concat(tr)) + 3, G = S.graph(44, 16, w - 64, h - 48, 0, N, lo, hi); G.frame('step', 'position');
      var up = [], dn = []; for (i = 0; i < N; i++) { up.push([G.X(i), G.Y(est[i] + 2 * band[i])]); dn.unshift([G.X(i), G.Y(est[i] - 2 * band[i])]); }
      var ctx = S.ctx; ctx.save(); ctx.globalAlpha = 0.6; S.poly(up.concat(dn), null, 0, k.blueSoft); ctx.restore();
      for (i = 0; i < N; i++) S.circ(G.X(i), G.Y(z[i]), 2.4, k.muted);
      G.plot(tr.map(function (v, i) { return [i, v]; }), k.green, 1.6); G.plot(est.map(function (v, i) { return [i, v]; }), k.blue, 2.6);
      var s = 'Gain after settling K = ' + fm(K, 3) + '. Each step, the estimate moves ' + M.round(K * 100) + '% of the way toward the new reading. Large R (noisy sensor) lowers K and trusts the prediction; large Q (an unpredictable cart) raises K and trusts the sensor. Dots: readings. Green: truth. Blue: estimate with its ±2σ band.';
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-diffdrive
  V.register('rb-diffdrive', function (el, opts) {
    var vl = nm(opts.vl, 0.3), vr = nm(opts.vr, 0.4), drift = !!opts.drift, W0 = 0.3, t = 0, pose, est, path, epath;
    var S = scene(el, opts, { aspect: 1.5, max: 440, label: 'A differential-drive robot' });
    V.slider(S.ctl, { label: 'Left wheel (m/s)', min: -0.5, max: 0.5, step: 0.05, value: vl, fmt: function (v) { return fm(v, 2); }, input: function (v) { vl = v; reset(); } });
    V.slider(S.ctl, { label: 'Right wheel (m/s)', min: -0.5, max: 0.5, step: 0.05, value: vr, fmt: function (v) { return fm(v, 2); }, input: function (v) { vr = v; reset(); } });
    V.seg(S.ctl, { label: 'Odometry', items: [['off', 'Perfect wheels'], ['on', 'Right wheel 2% small']], value: drift ? 'on' : 'off', change: function (v) { drift = v === 'on'; reset(); } });
    function reset() { t = 0; pose = { x: 0, y: -1, th: 0 }; est = { x: 0, y: -1, th: 0 }; path = [[0, -1]]; epath = [[0, -1]]; S.redraw(); }
    function adv(p, l, r, dt) { var v = (l + r) / 2, om = (r - l) / W0; p.x += v * M.cos(p.th) * dt; p.y += v * M.sin(p.th) * dt; p.th += om * dt; }
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, sc = M.min(w, h) / 5, ox = w / 2, oy = h / 2;
      var X = function (x) { return ox + x * sc; }, Y = function (y) { return oy - y * sc; };
      S.poly(path.map(function (p) { return [X(p[0]), Y(p[1])]; }), k.gold, 3);
      if (drift) S.poly(epath.map(function (p) { return [X(p[0]), Y(p[1])]; }), k.purple, 2);
      robotBody(S, X(pose.x), Y(pose.y), -pose.th, M.max(26, 0.3 * sc), k.green);
      var v = (vl + vr) / 2, om = (vr - vl) / W0, R = M.abs(om) > 1e-9 ? v / om : Infinity;
      var s = 'v = (' + fm(vr, 2) + ' + ' + fm(vl, 2) + ')/2 = ' + fm(v, 3) + ' m/s; ω = (' + fm(vr, 2) + ' − ' + fm(vl, 2) + ')/0.3 m = ' + fm(om, 3) + ' rad/s; ' + (isFinite(R) ? 'turning radius ' + fm(M.abs(R), 2) + ' m.' : 'straight line.') + (drift ? ' Purple: where odometry thinks the robot went, from wheel counts that assume perfect wheels. The gap grows with distance.' : '');
      S.ro.set(s); S.say(s);
    };
    var lp = V.loop(el, function (dt) {
      t += dt; if (t > 40) reset();
      adv(pose, vl, vr * (drift ? 0.98 : 1), dt); adv(est, vl, vr, dt);
      path.push([pose.x, pose.y]); epath.push([est.x, est.y]); if (path.length > 2500) { path.shift(); epath.shift(); }
      S.redraw();
    });
    reset(); S.playBtn(lp, autoplay(opts));
  });

  // ============================================================ rb-astar: BFS and A* on a grid
  V.register('rb-astar', function (el, opts) {
    var algo = opts.algo || 'astar', cols = 14, rows = 9, wall = {}, start = [1, 4], goal = [12, 4], res, shown = 0, timer = null;
    [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [3, 6], [3, 7]].forEach(function (c) { wall[c[0] + ',' + c[1]] = 1; });
    var S = scene(el, opts, { aspect: 1.55, max: 440, label: 'A grid path planner' });
    V.seg(S.ctl, { label: 'Planner', items: [['bfs', 'Breadth-first'], ['astar', 'A*']], value: algo, change: function (v) { algo = v; plan(); } });
    V.button(S.ctl, 'Search step by step', function () { animate(); });
    S.ctl.appendChild(V.el('span', 'rbv-hint', 'Click a cell to add or remove a wall.'));
    function plan() {
      var key = function (c) { return c[0] + ',' + c[1]; }, g = {}, came = {}, order = [], open = [[start, 0]], closed = {};
      g[key(start)] = 0;
      var hh = function (c) { return algo === 'astar' ? M.abs(c[0] - goal[0]) + M.abs(c[1] - goal[1]) : 0; };
      while (open.length) {
        var bi = 0; for (var i = 1; i < open.length; i++) if (open[i][1] < open[bi][1] - 1e-9 || (M.abs(open[i][1] - open[bi][1]) < 1e-9 && algo === 'astar' && hh(open[i][0]) < hh(open[bi][0]))) bi = i;
        var cur = open.splice(bi, 1)[0][0], kc = key(cur); if (closed[kc]) continue; closed[kc] = 1; order.push(cur);
        if (cur[0] === goal[0] && cur[1] === goal[1]) break;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = [cur[0] + d[0], cur[1] + d[1]], kn = key(nx);
          if (nx[0] < 0 || nx[1] < 0 || nx[0] >= cols || nx[1] >= rows || wall[kn] || closed[kn]) return;
          var ng = g[kc] + 1; if (g[kn] === undefined || ng < g[kn]) { g[kn] = ng; came[kn] = cur; open.push([nx, ng + hh(nx)]); }
        });
      }
      var path = [], c = goal; if (g[key(goal)] !== undefined) { while (c) { path.unshift(c); c = came[key(c)]; } }
      res = { order: order, path: path, len: g[key(goal)] }; shown = order.length; S.redraw();
    }
    function animate() { if (timer) clearInterval(timer); shown = 0; timer = setInterval(function () { shown++; if (shown >= res.order.length) { clearInterval(timer); timer = null; } S.redraw(); }, V.reduced ? 120 : 45); }
    var geo;
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, cs = M.min((w - 20) / cols, (h - 20) / rows), ox = (w - cs * cols) / 2, oy = (h - cs * rows) / 2; geo = { cs: cs, ox: ox, oy: oy };
      var seen = {}; for (var i = 0; i < shown && i < res.order.length; i++) seen[res.order[i][0] + ',' + res.order[i][1]] = 1;
      for (var x = 0; x < cols; x++) for (var y = 0; y < rows; y++) { var kk = x + ',' + y; S.rect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2, wall[kk] ? k.ink : seen[kk] ? k.blueSoft : k.panel, null, 3); }
      if (shown >= res.order.length && res.path.length) S.poly(res.path.map(function (c) { return [ox + (c[0] + 0.5) * cs, oy + (c[1] + 0.5) * cs]; }), k.orange, 4);
      S.circ(ox + (start[0] + 0.5) * cs, oy + (start[1] + 0.5) * cs, cs * 0.32, k.green); S.circ(ox + (goal[0] + 0.5) * cs, oy + (goal[1] + 0.5) * cs, cs * 0.32, k.red);
      var s = (algo === 'astar' ? 'A* (Manhattan distance as the guess)' : 'Breadth-first search') + ' looked at ' + M.min(shown, res.order.length) + ' cells. ' + (res.path.length ? 'Shortest path: ' + res.len + ' moves.' : 'No path: the goal is walled off.');
      S.ro.set(s); S.say(s + ' Green is the start, red the goal.');
    };
    S.c.cv.addEventListener('click', function (e) {
      if (!geo) return; var r = S.c.cv.getBoundingClientRect(), x = M.floor((e.clientX - r.left - geo.ox) / geo.cs), y = M.floor((e.clientY - r.top - geo.oy) / geo.cs);
      if (x < 0 || y < 0 || x >= cols || y >= rows || (x === start[0] && y === start[1]) || (x === goal[0] && y === goal[1])) return;
      var kk = x + ',' + y; if (wall[kk]) delete wall[kk]; else wall[kk] = 1; plan();
    });
    plan();
  });

  // ============================================================ rb-threshold: color thresholding
  V.register('rb-threshold', function (el, opts) {
    var T = nm(opts.t, 60), bx = 0.62, view = 'mask';
    var S = scene(el, opts, { aspect: 2, max: 380, label: 'Color thresholding of a camera image' });
    V.slider(S.ctl, { label: 'Redness threshold', min: 0, max: 200, step: 1, value: T, input: function (v) { T = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Ball position', min: 0.1, max: 0.9, step: 0.01, value: bx, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { bx = v; S.redraw(); } });
    var W0 = 32, H0 = 20;
    function pix(x, y) { // a small synthetic image: a red ball on a brown-green floor, with some texture
      var R = rng(x * 131 + y * 71 + 5), d = M.hypot(x - bx * W0, (y - 11) * 1.0), r, g, b;
      if (d < 4.2) { r = 205 + 30 * R(); g = 40 + 40 * R(); b = 40 + 30 * R(); } else if (y < 8) { r = 150 + 40 * R(); g = 160 + 40 * R(); b = 170 + 40 * R(); } else { r = 120 + 50 * R(); g = 100 + 40 * R(); b = 60 + 30 * R(); }
      return [r, g, b];
    }
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, cs = M.min((w - 30) / (2 * W0), (h - 30) / H0), ox1 = 10, ox2 = 20 + W0 * cs, oy = 22, sx = 0, n = 0;
      for (var y = 0; y < H0; y++) for (var x = 0; x < W0; x++) {
        var p = pix(x, y), red = p[0] - (p[1] + p[2]) / 2, on = red > T;
        S.ctx.fillStyle = 'rgb(' + (p[0] | 0) + ',' + (p[1] | 0) + ',' + (p[2] | 0) + ')'; S.ctx.fillRect(ox1 + x * cs, oy + y * cs, cs + 0.5, cs + 0.5);
        S.ctx.fillStyle = on ? k.ink : k.panel; S.ctx.fillRect(ox2 + x * cs, oy + y * cs, cs + 0.5, cs + 0.5);
        if (on) { sx += x; n++; }
      }
      S.txt('camera image', ox1, 10, { color: k.muted, w: 500 }); S.txt('mask: red − (green + blue)/2 > ' + T, ox2, 10, { color: k.muted, w: 500 });
      var cx = n ? sx / n : null, s;
      S.line(ox2 + W0 * cs / 2, oy, ox2 + W0 * cs / 2, oy + H0 * cs, k.muted, 1, [3, 3]);
      if (cx !== null) { S.line(ox2 + (cx + 0.5) * cs, oy, ox2 + (cx + 0.5) * cs, oy + H0 * cs, k.orange, 2.4); var err = cx + 0.5 - W0 / 2; s = n + ' pixels pass. Their center is at column ' + fm(cx + 0.5, 1) + ' of ' + W0 + '; the image center is ' + (W0 / 2) + ', so the steering error is ' + fm(err, 1) + ' pixels (' + (err > 0 ? 'turn right' : err < 0 ? 'turn left' : 'straight ahead') + ').' + (n > 80 ? ' The threshold is so low that floor pixels pass too.' : ''); }
      else s = 'No pixels pass the threshold: the robot sees no ball.';
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-pinhole
  V.register('rb-pinhole', function (el, opts) {
    var H = nm(opts.h, 0.2), Z = nm(opts.z, 2), f = nm(opts.f, 600);
    var S = scene(el, opts, { aspect: 2.2, max: 340, label: 'A pinhole camera' });
    V.slider(S.ctl, { label: 'Object height (m)', min: 0.05, max: 1, step: 0.05, value: H, fmt: function (v) { return fm(v, 2) + ' m'; }, input: function (v) { H = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Distance (m)', min: 0.5, max: 8, step: 0.1, value: Z, fmt: function (v) { return fm(v, 1) + ' m'; }, input: function (v) { Z = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Focal length (pixels)', min: 200, max: 1200, step: 10, value: f, input: function (v) { f = v; S.redraw(); } });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, ax = h / 2, ph = w * 0.22, fpx = 40 + f / 1200 * (ph - 60), sc = (w - ph - 40) / 8, objx = ph + Z * sc, obh = M.min(ax - 12, H * sc * 2.5);
      S.line(10, ax, w - 10, ax, k.grid, 1.4);
      S.rect(ph - 4, ax - 30, 8, 60, k.ink, null); S.ctx.clearRect(ph - 4, ax - 2, 8, 4); S.ctx.fillStyle = k.bg; S.ctx.fillRect(ph - 4, ax - 2, 8, 4);
      S.line(ph - fpx, 14, ph - fpx, h - 14, k.muted, 2); S.txt('sensor', ph - fpx - 4, 10, { align: 'center', color: k.muted, w: 500 });
      S.line(objx, ax, objx, ax - obh, k.green, 6); S.txt('object', objx, ax + 14, { align: 'center', color: k.green, w: 600 });
      var ih = obh * fpx / (objx - ph); S.line(objx, ax - obh, ph - fpx, ax + ih, k.orange, 1.4, [5, 4]); S.line(ph - fpx, ax, ph - fpx, ax + ih, k.orange, 5);
      var hp = f * H / Z, s = 'Image height = f × H ÷ Z = ' + f + ' × ' + fm(H, 2) + ' m ÷ ' + fm(Z, 1) + ' m ≈ ' + fm(hp, 1) + ' pixels. Twice as far away, half as tall. The image is upside down.';
      S.ro.set(s); S.say(s);
    };
    S.redraw();
  });

  // ============================================================ rb-ros: nodes and topics
  V.register('rb-ros', function (el, opts) {
    var rate = nm(opts.rate, 10), t = 0, alive = { cam: true };
    var S = scene(el, opts, { aspect: 2, max: 360, label: 'A ROS 2 graph of nodes and topics' });
    V.slider(S.ctl, { label: 'Camera rate (Hz)', min: 1, max: 30, step: 1, value: rate, input: function (v) { rate = v; } });
    V.button(S.ctl, 'Stop or start the camera node', function () { alive.cam = !alive.cam; });
    var N = [['camera', 'camera node'], ['detect', 'ball detector'], ['ctrl', 'controller'], ['motor', 'motor driver']], Tp = ['/image', '/ball', '/cmd_vel'];
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, n = N.length, gap = (w - 20) / n, y = h * 0.5, bw = M.min(gap - 26, 120), bh = 44;
      for (var i = 0; i < n; i++) {
        var cx = 10 + gap * (i + 0.5);
        if (i < n - 1) { var x1 = cx + bw / 2, x2 = 10 + gap * (i + 1.5) - bw / 2; S.arrow(x1, y, x2, y, k.muted, 2); S.txt(Tp[i], (x1 + x2) / 2, y - 16, { align: 'center', color: k.purple, w: 700, size: 11 });
          var live = i === 0 ? alive.cam : alive.cam; if (live) { var ph = (t * rate) % 1; S.circ(x1 + (x2 - x1) * ph, y, 4, k.gold); } }
        var dead = i === 0 && !alive.cam; S.rect(cx - bw / 2, y - bh / 2, bw, bh, dead ? k.panel : k.blueSoft, dead ? k.muted : k.blue, 8);
        S.txt(N[i][1], cx, y, { align: 'center', size: w < 520 ? 10 : 12, w: 700, color: dead ? k.muted : k.ink });
      }
      var s = alive.cam ? 'The camera node publishes on /image ' + rate + ' times a second. Each node subscribes to the topic before it and publishes the next. No node calls another directly.' : 'The camera node is stopped. The other nodes keep running but get no new messages, so the controller should stop the motors when its input goes quiet.';
      S.ro.set(s); S.say(s);
    };
    var lp = V.loop(el, function (dt) { t += dt; S.redraw(); });
    S.playBtn(lp, autoplay(opts)); S.redraw();
  });

  // ============================================================ rb-encoder
  V.register('rb-encoder', function (el, opts) {
    var cpr = nm(opts.cpr, 20), r = nm(opts.r, 3), ang = 0;
    var S = scene(el, opts, { aspect: 2, max: 340, label: 'A wheel encoder' });
    V.slider(S.ctl, { label: 'Counts per turn', min: 4, max: 60, step: 1, value: cpr, input: function (v) { cpr = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Wheel radius (cm)', min: 1, max: 8, step: 0.5, value: r, fmt: function (v) { return fm(v, 1) + ' cm'; }, input: function (v) { r = v; S.redraw(); } });
    V.button(S.ctl, 'Reset count', function () { ang = 0; S.redraw(); });
    S.draw = function () {
      var w = S.c.w, h = S.c.h, k = S.k, cx = w * 0.28, cy = h / 2, R = M.min(h * 0.4, w * 0.22);
      S.circ(cx, cy, R, k.panel, k.ink, 2);
      for (var i = 0; i < cpr; i++) { var a = ang + i * 2 * PI / cpr; S.rect(cx + R * 0.78 * M.cos(a) - 3, cy + R * 0.78 * M.sin(a) - 3, 6, 6, k.ink, null); }
      S.circ(cx, cy - R * 0.78, 7, null, k.red, 2.5); S.txt('sensor', cx, cy - R - 10, { align: 'center', color: k.red, w: 600 });
      var ticks = M.floor(ang / (2 * PI) * cpr + 1e-9), dist = ticks / cpr * 2 * PI * r;
      S.txt('ticks: ' + ticks, w * 0.58, h * 0.38, { size: 16, w: 700 }); S.txt('distance: ' + fm(dist, 1) + ' cm', w * 0.58, h * 0.58, { size: 16, w: 700, color: k.blue });
      var s = ticks + ' ticks ÷ ' + cpr + ' per turn × 2π × ' + fm(r, 1) + ' cm = ' + fm(dist, 1) + ' cm. One tick is ' + fm(2 * PI * r / cpr, 2) + ' cm of travel.';
      S.ro.set(s); S.say(s);
    };
    var lp = V.loop(el, function (dt) { ang += dt * 1.4; S.redraw(); });
    S.playBtn(lp, autoplay(opts)); S.redraw();
  });
})(window, document);
