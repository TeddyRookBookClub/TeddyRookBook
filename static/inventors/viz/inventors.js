/* Inventors Ladder visual kit: interactive visuals named iv-…, registered with window.MathLadder.viz.register.
   Loaded after static/math/viz/core.js on every Inventors Ladder topic page. Vanilla JavaScript on a canvas, no libraries,
   no network requests, no drawings of people. Follows the site's light or dark theme (redraws when it changes) and
   prefers-reduced-motion (then nothing moves until Play is pressed).

   USE   <div class="ml-viz" data-viz="iv-lever" data-opts='{"mode":"float"}'></div>

   VISUALS (options in brackets)
     iv-lever      Archimedes: a lever with two weights you drag, or a block weighed in air and in water  [mode: lever|float]
     iv-aeolipile  Hero's steam ball: heat, steam jets and spin
     iv-camera     a dark room (camera obscura): rays through a hole make an upside-down image  [hole, depth]
     iv-mirror     mirror writing (Leonardo) or a line of type and its print (Gutenberg)  [mode: mirror|type, text]
     iv-incline    Galileo's ramp: a ball marked at equal times; gaps 1, 3, 5, 7
     iv-prism      Newton's prism, and the second prism that does not split one color
     iv-cannon     Newton's cannonball on a mountain: faster and faster until it orbits
     iv-charge     Franklin's one fluid: rubbing moves charge; like charges repel, unlike attract
     iv-pile       Volta's pile: stack zinc–card–copper cells, see the voltage
     iv-induction  Faraday: a magnet moved in a coil and a meter that moves only with change  [turns]
     iv-morse      Morse code: type to hear and see, or tap a key to send and decode
     iv-phone      telegraph on/off versus a telephone current shaped like the sound
     iv-filament   Edison's filament trials: material and vacuum, and how long it lasts
     iv-field      Tesla's rotating magnetic field from two or three phases  [phases]
     iv-wing       the Wrights' lift: angle of attack and speed, Smeaton's 0.005 against their 0.0033
     iv-calendar   Sagan's Cosmic Calendar: 13.8 billion years squeezed into one year
   Every canvas has an aria-label, and a live readout under it says the numbers in words. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, PI = M.PI, fm = V.fmt;
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------- a scene: wrapper, canvas, controls row, readout; redraws on theme change and resize ---------- */
  function scene(el, opts, o) {
    el.classList.add('ivv');
    var wrap = V.el('div', 'ivv-wrap'); el.appendChild(wrap);
    var c = V.canvas(wrap, { aspect: o.aspect || 1.7, max: o.max || 380, min: o.min || 200 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || 'Inventors picture');
    var ctl = V.el('div', 'ml-ctl ivv-ctl'); wrap.appendChild(ctl);
    var ro = V.readout(wrap);
    var S = { c: c, ctx: c.ctx, ctl: ctl, ro: ro, k: V.colors(), draw: function () { } };
    S.redraw = function () { S.k = V.colors(); S.ctx.clearRect(0, 0, c.w, c.h); S.ctx.fillStyle = S.k.bg; S.ctx.fillRect(0, 0, c.w, c.h); S.draw(); };
    S.say = function (s) { c.cv.setAttribute('aria-label', s.replace(/<[^>]+>/g, '')); };
    V.onTheme(S.redraw); c.onResize(S.redraw);
    S.fs = function () { return c.w < 520 ? 11 : 13; };
    S.txt = function (s, x, y, q) {
      q = q || {}; var ctx = S.ctx; ctx.save(); ctx.font = (q.w || 600) + ' ' + (q.size || S.fs()) + 'px ' + (q.font || 'system-ui,sans-serif');
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
    S.playBtn = function (lp, playing) {
      var b = V.button(ctl, playing ? 'Pause' : 'Play', function () { if (lp.running()) { lp.stop(); b.textContent = 'Play'; } else { lp.start(); b.textContent = 'Pause'; } });
      b.classList.add('ivv-play'); if (!playing) lp.stop(); return b;
    };
    return S;
  }
  function autoplay(opts) { return opts.play === undefined ? !V.reduced : !!opts.play; }

  // ============================================================ iv-lever: Archimedes' lever and floating bodies
  V.register('iv-lever', function (el, opts) {
    var mode = opts.mode === 'float' ? 'float' : 'lever';
    var S = scene(el, opts, { aspect: 2, label: mode === 'lever' ? 'A lever with a weight on each side' : 'A block weighed in air and in water' });
    if (mode === 'lever') {
      var w1 = 6, w2 = 3, d1 = 2, d2 = 4, ang = 0;
      var s1 = V.slider(S.ctl, { label: 'Left weight (kg)', min: 1, max: 10, step: 1, value: w1, input: function (v) { w1 = v; S.redraw(); } });
      var s2 = V.slider(S.ctl, { label: 'Right weight (kg)', min: 1, max: 10, step: 1, value: w2, input: function (v) { w2 = v; S.redraw(); } });
      var geo = function () { var w = S.c.w, h = S.c.h, cx = w / 2, cy = h * 0.55, unit = M.min((w / 2 - 30) / 5, 60); return { cx: cx, cy: cy, u: unit }; };
      V.drag(S.c.cv, {
        hit: function (px) { var g = geo(); return px < g.cx ? 'L' : 'R'; },
        move: function (hd, px) { var g = geo(), d = clamp(M.round(M.abs(px - g.cx) / g.u), 1, 5); if (hd === 'L') d1 = d; else d2 = d; S.redraw(); }
      });
      S.draw = function () {
        var k = S.k, g = geo(), m1 = w1 * d1, m2 = w2 * d2, diff = m2 - m1;
        ang = clamp(diff * 0.02, -0.28, 0.28);
        var ca = M.cos(ang), sa = M.sin(ang), L = g.u * 5.4;
        S.poly([[g.cx, g.cy], [g.cx - 18, g.cy + 34], [g.cx + 18, g.cy + 34]], k.ink, 1.5, k.panel);
        S.line(g.cx - L * ca, g.cy - L * sa, g.cx + L * ca, g.cy + L * sa, k.gold, 6);
        for (var i = -5; i <= 5; i++) { if (!i) continue; var x = g.cx + i * g.u * ca, y = g.cy + i * g.u * sa; S.circ(x, y, 2.5, k.ink); S.txt(String(M.abs(i)), x, y + 14, { align: 'center', color: k.muted, w: 500, size: 10 }); }
        function box(d, wt, side, col) {
          var x = g.cx + side * d * g.u * ca, y = g.cy + side * d * g.u * sa, sz = 10 + wt * 2.6;
          S.line(x, y, x, y + 6, k.ink, 1.5); S.rect(x - sz / 2, y - sz - 2, sz, sz, col, k.ink, 3); S.txt(wt + ' kg', x, y - sz - 12, { align: 'center' });
        }
        box(d1, w1, -1, k.blueSoft); box(d2, w2, 1, k.redSoft);
        S.txt('pivot', g.cx, g.cy + 46, { align: 'center', color: k.muted, w: 500 });
        var bal = diff === 0 ? 'balanced' : diff > 0 ? 'the right side goes down' : 'the left side goes down';
        S.ro.set('Left: ' + w1 + ' kg × ' + d1 + ' m = <b>' + m1 + '</b>. Right: ' + w2 + ' kg × ' + d2 + ' m = <b>' + m2 + '</b>. ' + (diff === 0 ? '<b>Balanced.</b>' : 'Not balanced: ' + bal + '.') + ' Drag on either side to move a weight.');
        S.say('Lever: left ' + w1 + ' kilograms at ' + d1 + ' meters, right ' + w2 + ' kilograms at ' + d2 + ' meters, ' + bal);
      };
    } else {
      var mats = { gold: [19.3, 'Gold', '#d4a017'], silver: [10.5, 'Silver', '#a8a9ad'], iron: [7.9, 'Iron', '#6b6f75'], stone: [2.6, 'Stone', '#9a8f80'], wood: [0.6, 'Oak', '#a0703c'] };
      var mat = 'silver', vol = 1, depth = 1;
      V.seg(S.ctl, { label: 'Material', items: Object.keys(mats).map(function (k2) { return [k2, mats[k2][1]]; }), value: mat, change: function (v) { mat = v; S.redraw(); } });
      V.slider(S.ctl, { label: 'Volume (liters)', min: 0.5, max: 3, step: 0.5, value: vol, input: function (v) { vol = v; S.redraw(); } });
      V.slider(S.ctl, { label: 'Lower into water', min: 0, max: 1, step: 0.05, value: depth, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { depth = v; S.redraw(); } });
      S.draw = function () {
        var k = S.k, w = S.c.w, h = S.c.h, m = mats[mat], rho = m[0], mass = rho * vol, wt = mass * 9.8;
        var tankX = w * 0.32, tankW = w * 0.36, top = h * 0.38, bot = h - 16, waterTop = top + 18;
        var bs = 26 + vol * 14, sub = depth;
        var floats = rho < 1, fsub = floats ? M.min(sub, rho) : sub;
        var by = waterTop - bs + bs * (floats ? M.min(sub, rho) : sub) + (floats && sub > rho ? 0 : 0);
        var bx = tankX + tankW / 2 - bs / 2;
        S.rect(tankX, waterTop, tankW, bot - waterTop, k.blueSoft, null);
        S.line(tankX, top, tankX, bot, k.ink, 2); S.line(tankX + tankW, top, tankX + tankW, bot, k.ink, 2); S.line(tankX, bot, tankX + tankW, bot, k.ink, 2);
        var sx = tankX + tankW / 2;
        S.line(sx, 14, sx, by, k.muted, 1.5);
        S.rect(sx - 34, 8, 68, 22, k.panel, k.ink, 4);
        var disp = fsub * vol, buoy = disp * 9.8, read = M.max(0, wt - buoy);
        S.txt(fm(read, 1) + ' N', sx, 19, { align: 'center', size: 12 });
        S.rect(bx, by, bs, bs, m[2], k.ink, 3);
        S.txt(m[1], bx + bs / 2, by + bs / 2, { align: 'center', color: '#fff', size: 11 });
        S.txt('scale', sx + 40, 19, { color: k.muted, w: 500 });
        S.ro.set(m[1] + ', ' + fm(vol, 1) + ' L: weighs <b>' + fm(wt, 1) + ' N</b> in air. ' + M.round(fsub * 100) + '% under water pushes aside ' + fm(disp, 2) + ' L of water, which weighs ' + fm(buoy, 1) + ' N. The scale reads <b>' + fm(read, 1) + ' N</b>' + (floats && sub >= rho ? ': it floats, so the scale reads zero.' : '.'));
        S.say(m[1] + ' block, scale reads ' + fm(read, 1) + ' newtons');
      };
    }
    S.redraw();
  });

  // ============================================================ iv-aeolipile: Hero's steam ball
  V.register('iv-aeolipile', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.6, label: "Hero's steam ball spinning" });
    var heat = 0.6, w = 0, th = 0, puffs = [];
    V.slider(S.ctl, { label: 'Heat', min: 0, max: 1, step: 0.05, value: heat, fmt: function (v) { return M.round(v * 100) + '%'; }, input: function (v) { heat = v; } });
    S.draw = function () {
      var k = S.k, W0 = S.c.w, H = S.c.h, cx = W0 / 2, cy = H * 0.36, R = M.min(H * 0.17, 54);
      // cauldron and fire
      var py = H * 0.68;
      S.rect(cx - R * 1.6, py, R * 3.2, H * 0.18, k.panel, k.ink, 8);
      S.txt('water', cx, py + H * 0.09, { align: 'center', color: k.muted, w: 500 });
      for (var i = 0; i < 5; i++) { var fx = cx - R * 1.2 + i * R * 0.6, fh = 8 + heat * 22 * (0.7 + 0.3 * M.sin(th * 7 + i)); S.poly([[fx - 8, H - 4], [fx, H - 4 - fh], [fx + 8, H - 4]], null, 0, heat > 0 ? k.orange : k.grid); }
      S.line(cx - R * 0.9, py, cx - R * 0.9, cy, k.ink, 3); S.line(cx + R * 0.9, py, cx + R * 0.9, cy, k.ink, 3);
      // the ball, seen along its axle: two bent nozzles on opposite sides; steam leaves each one backward, so the ball turns
      S.circ(cx, cy, R * 0.8, k.goldSoft, k.ink, 2); S.circ(cx, cy, 4, k.ink);
      for (var s = 0; s < 2; s++) {
        var a = th + s * PI, nx = cx + M.cos(a) * R * 0.8, ny = cy + M.sin(a) * R * 0.8, ox = nx + M.cos(a) * 10, oy = ny + M.sin(a) * 10;
        var tx = ox + M.sin(a) * 12, ty = oy - M.cos(a) * 12;
        S.line(nx, ny, ox, oy, k.ink, 4); S.line(ox, oy, tx, ty, k.ink, 4);
        if (heat > 0.05) S.arrow(tx, ty, tx + M.sin(a) * (8 + 22 * heat), ty - M.cos(a) * (8 + 22 * heat), k.blue, 1.6);
      }
      S.arrow(cx + R * 1.5, cy - 14, cx + R * 1.5, cy + 10, k.purple, 2);
      S.txt('spin', cx + R * 1.5 + 6, cy - 2, { color: k.purple, size: 11 });
      puffs.forEach(function (p) { S.circ(p.x, p.y, p.r, 'rgba(160,170,180,' + M.max(0, p.a) + ')'); });
      var rpm = w / (2 * PI) * 60;
      S.ro.set('Heat ' + M.round(heat * 100) + '%: steam jets push the nozzles back, spinning the ball at about <b>' + M.round(rpm) + '</b> turns a minute (a picture, not a measurement). With no heat, friction stops it.');
      S.say('Steam ball spinning at about ' + M.round(rpm) + ' turns a minute');
    };
    var lp = V.loop(el, function (dt) {
      var torque = heat * 9, fric = 0.9 * w + 0.6 * (w > 0 ? 1 : 0); w = M.max(0, w + (torque - fric) * dt); th += w * dt;
      if (heat > 0.1 && M.random() < heat * 0.6) { var cx = S.c.w / 2, cy = S.c.h * 0.36, R = M.min(S.c.h * 0.17, 54), a = th + (M.random() < 0.5 ? 0 : PI), ox = cx + M.cos(a) * (R * 0.8 + 10) + M.sin(a) * 12, oy = cy + M.sin(a) * (R * 0.8 + 10) - M.cos(a) * 12; puffs.push({ x: ox, y: oy, vx: M.sin(a) * 40, vy: -M.cos(a) * 40 - 10, r: 3, a: 0.6 }); }
      puffs.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 8; p.a -= dt * 0.5; }); puffs = puffs.filter(function (p) { return p.a > 0; });
      S.redraw();
    });
    S.playBtn(lp, autoplay(opts));
    S.redraw();
  });

  // ============================================================ iv-camera: camera obscura
  V.register('iv-camera', function (el, opts) {
    var S = scene(el, opts, { aspect: 2.1, label: 'Light from a tree passes through a small hole into a dark room' });
    var hole = opts.hole || 4, depth = opts.depth || 0.5, treeX = 0.2, treeH = 0.55;
    V.slider(S.ctl, { label: 'Hole size', min: 1, max: 20, step: 1, value: hole, fmt: function (v) { return v + ' mm'; }, input: function (v) { hole = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Room depth', min: 0.2, max: 1, step: 0.05, value: depth, fmt: function (v) { return fm(v * 4, 1) + ' m'; }, input: function (v) { depth = v; S.redraw(); } });
    function geo() { var w = S.c.w, h = S.c.h, wallX = w * 0.55, gy = h * 0.82; return { w: w, h: h, wallX: wallX, gy: gy, hy: h * 0.5, screenX: wallX + depth * (w - wallX - 16) }; }
    V.drag(S.c.cv, { hit: function (px) { var g = geo(); return px < g.wallX - 10 ? 't' : null; }, move: function (hd, px, py) { var g = geo(); treeX = clamp(px / g.wallX, 0.05, 0.75); treeH = clamp((g.gy - py) / (g.h * 0.8), 0.2, 0.8); S.redraw(); } });
    S.draw = function () {
      var k = S.k, g = geo(), tx = treeX * g.wallX, top = g.gy - treeH * g.h * 0.8, bot = g.gy;
      S.rect(0, g.gy, g.wallX, g.h - g.gy, k.greenSoft, null);
      S.rect(g.wallX, 8, g.w - g.wallX - 8, g.h - 16, 'rgba(0,0,0,0.55)', null);
      var hp = hole * 0.6;
      S.line(g.wallX, 8, g.wallX, g.hy - hp, k.ink, 4); S.line(g.wallX, g.hy + hp, g.wallX, g.h - 8, k.ink, 4);
      // tree
      S.line(tx, bot, tx, top + (bot - top) * 0.35, '#8b5a2b', 6);
      S.circ(tx, top + (bot - top) * 0.25, (bot - top) * 0.25, '#2f9e44', k.ink, 1);
      S.circ(tx, top, 4, k.red);
      // rays
      var sx = g.screenX;
      function ray(y0, col) {
        var y1 = g.hy - hp, y2 = g.hy + hp;
        [y1, y2].forEach(function (yh) { var t = (sx - tx) / (g.wallX - tx), ys = y0 + (yh - y0) * t; S.line(tx, y0, sx, ys, col, 1.2); });
        var t2 = (sx - tx) / (g.wallX - tx), a = y0 + (g.hy - hp - y0) * t2, b = y0 + (g.hy + hp - y0) * t2; return [M.min(a, b), M.max(a, b)];
      }
      var rt = ray(top, k.red), rb = ray(bot, k.gold);
      S.line(sx, 14, sx, g.h - 14, '#f8f9fa', 3);
      // image: an upside-down tree on the screen, blurred by hole size
      var it = (rt[0] + rt[1]) / 2, ib = (rb[0] + rb[1]) / 2, blur = (rt[1] - rt[0]);
      var ctx = S.ctx; ctx.save(); ctx.globalAlpha = clamp(0.35 + hole / 25, 0.35, 0.95);
      S.line(sx - 2, ib, sx - 2, ib + (it - ib) * 0.65, '#c08552', M.max(3, blur));
      S.circ(sx - 4, ib + (it - ib) * 0.75, M.max(4, M.abs(it - ib) * 0.25), '#69db7c'); ctx.restore();
      S.circ(sx - 2, it, 3, k.red);
      var size = M.abs(ib - it), obj = bot - top, ratio = size / obj;
      S.txt('outside', 8, 18, { color: k.muted, w: 500 }); S.txt('dark room', g.wallX + 8, 22, { color: '#f1f3f5', w: 500 });
      S.ro.set('The top of the tree (red) lands at the <b>bottom</b> of the screen: the image is upside down. Image height ÷ tree height = ' + fm(ratio, 2) + ' = room depth ÷ distance to the hole. A ' + hole + ' mm hole makes each point a spot about ' + fm(blur, 0) + ' px wide: ' + (hole <= 4 ? 'sharp but dim.' : hole <= 10 ? 'brighter, a little blurry.' : 'bright but blurry.') + ' Drag the tree.');
      S.say('Camera obscura: upside-down image, ' + fm(ratio, 2) + ' times the size of the tree');
    };
    S.redraw();
  });

  // ============================================================ iv-mirror: mirror writing and type
  V.register('iv-mirror', function (el, opts) {
    var mode = opts.mode === 'type' ? 'type' : 'mirror';
    var S = scene(el, opts, { aspect: 2.6, min: 160, max: 260, label: mode === 'type' ? 'A line of type and its printed page' : 'Mirror writing' });
    var text = opts.text || (mode === 'type' ? 'In principio' : 'Experience never errs'), flip = false;
    var inp = V.el('input', 'ivv-text'); inp.type = 'text'; inp.value = text; inp.maxLength = 28; inp.setAttribute('aria-label', 'Text to ' + (mode === 'type' ? 'set in type' : 'write in mirror writing'));
    S.ctl.appendChild(inp); inp.addEventListener('input', function () { text = inp.value; S.redraw(); });
    var b = V.button(S.ctl, mode === 'type' ? 'Print' : 'Mirror', function () { flip = !flip; b.textContent = flip ? 'Back' : (mode === 'type' ? 'Print' : 'Mirror'); S.redraw(); });
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, ctx = S.ctx, size = M.min(40, (w - 40) / M.max(6, text.length) * 1.7);
      if (mode === 'type') {
        var y = h * 0.5;
        if (!flip) {
          var n = text.length, cw = M.min(36, (w - 30) / M.max(1, n)), x0 = (w - cw * n) / 2;
          for (var i = 0; i < n; i++) {
            var ch = text[n - 1 - i]; S.rect(x0 + i * cw + 1, y - cw * 0.9, cw - 2, cw * 1.8, k.panel, k.ink, 2);
            ctx.save(); ctx.translate(x0 + i * cw + cw / 2, y); ctx.scale(-1, 1); S.txt(ch, 0, 0, { align: 'center', size: cw * 0.8, font: 'Georgia,serif', w: 700 }); ctx.restore();
          }
          S.txt('the type, seen from above: every letter is reversed', w / 2, 16, { align: 'center', color: k.muted, w: 500 });
        } else {
          S.rect(20, 24, w - 40, h - 48, '#fbf6e9', k.ink, 4);
          S.txt(text, w / 2, h / 2, { align: 'center', size: size, font: 'Georgia,serif', w: 700, color: '#1d2320' });
          S.txt('the printed page reads the right way round', w / 2, 14, { align: 'center', color: k.muted, w: 500 });
        }
        S.ro.set(flip ? 'Printed: <b>' + text.replace(/</g, '&lt;') + '</b>. Pressing the type onto paper swaps left and right, so reversed type prints forward.' : 'Each piece of type is a mirror image, and the line runs backward. Press Print.');
      } else {
        S.rect(20, 20, w - 40, h - 40, '#f4ead2', null, 4);
        ctx.save(); ctx.translate(w / 2, h / 2); if (!flip) ctx.scale(-1, 1);
        S.txt(text, 0, 0, { align: 'center', size: size, font: 'Georgia,serif', w: 500, color: '#5a3e1b' }); ctx.restore();
        if (flip) S.line(w / 2, 22, w / 2, h - 22, k.blue, 1, [4, 4]);
        S.ro.set(flip ? 'In the mirror it reads: <b>' + text.replace(/</g, '&lt;') + '</b>.' : 'Mirror writing runs right to left with every letter reversed, as in Leonardo\'s notebooks. Press Mirror to read it.');
      }
      S.say(mode === 'type' ? 'Type for: ' + text : 'Mirror writing of: ' + text);
    };
    S.redraw();
  });

  // ============================================================ iv-incline: Galileo's ramp
  V.register('iv-incline', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'A ball rolls down a ramp, marked at equal times' });
    var t = 0, run = false, marks = [], tilt = 6;
    V.slider(S.ctl, { label: 'Tilt', min: 2, max: 12, step: 1, value: tilt, fmt: function (v) { return v + '°'; }, input: function (v) { tilt = v; reset(); } });
    V.button(S.ctl, 'Release', function () { reset(); run = true; lp.start(); });
    function reset() { t = 0; marks = []; run = false; S.redraw(); }
    var T = 4; // time to the bottom at tilt 12 scaled
    function frac(tt) { var a = M.sin(tilt * PI / 180) / M.sin(12 * PI / 180); return clamp(a * (tt / T) * (tt / T), 0, 1); }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, x0 = 24, x1 = w - 24, y1 = h - 34, y0 = y1 - M.min(h - 64, (x1 - x0) * M.tan(tilt * PI / 180) * 2.5);
      S.line(x0, y0, x1, y1, k.gold, 6); S.line(x0, y1, x1, y1, k.muted, 1);
      var f = frac(t), bx = x0 + (x1 - x0) * f, by = y0 + (y1 - y0) * f;
      marks.forEach(function (m, i) { var mx = x0 + (x1 - x0) * m, my = y0 + (y1 - y0) * m; S.line(mx, my - 10, mx, my + 10, k.blue, 2); S.txt(String(i + 1), mx, my - 18, { align: 'center', color: k.blue, size: 11 }); });
      S.circ(bx, by - 8, 8, '#b08d57', k.ink, 1.5);
      var gaps = marks.map(function (m, i) { return m - (i ? marks[i - 1] : 0); }), u = gaps[0] || 1;
      S.ro.set(marks.length ? 'Marks after each equal time step. Gaps compared with the first: <b>' + gaps.map(function (g) { return fm(g / u, 1); }).join(', ') + '</b> (the odd numbers). Totals: ' + marks.map(function (m) { return fm(m / u, 1); }).join(', ') + ' (the squares).' : 'Press Release. A mark appears each second.');
      S.say('Ball on a ramp, ' + marks.length + ' marks');
    };
    var lp = V.loop(el, function (dt) { if (!run) return; var prev = t; t += dt; if (M.floor(t) > M.floor(prev) && frac(M.floor(t)) < 1) marks.push(frac(M.floor(t))); if (frac(t) >= 1) run = false; S.redraw(); });
    S.redraw();
  });

  // ============================================================ iv-prism: Newton's prism
  V.register('iv-prism', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'White light passing through a prism' });
    var second = false, pick = 3;
    var cols = [['red', '#e03131'], ['orange', '#f76707'], ['yellow', '#fcc419'], ['green', '#37b24d'], ['blue', '#1c7ed6'], ['indigo', '#4c3fd1'], ['violet', '#9c36b5']];
    V.seg(S.ctl, { label: 'Experiment', items: [['one', 'One prism'], ['two', 'Second prism']], value: 'one', change: function (v) { second = v === 'two'; S.redraw(); } });
    V.slider(S.ctl, { label: 'Color picked by the slit', min: 0, max: 6, step: 1, value: pick, fmt: function (v) { return cols[v][0]; }, input: function (v) { pick = v; S.redraw(); } });
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, px = w * 0.3, py = h * 0.55, s = M.min(h * 0.32, 80);
      S.line(0, py - 6, px - s * 0.3, py - 6, k.ink === '#1d2320' ? '#adb5bd' : '#f8f9fa', 5);
      S.poly([[px, py - s * 0.75], [px - s * 0.6, py + s * 0.45], [px + s * 0.6, py + s * 0.45]], k.ink, 1.5, 'rgba(160,200,255,0.25)');
      var ex = px + s * 0.25, ey = py - 4, endX = second ? w * 0.6 : w - 14;
      cols.forEach(function (c, i) { var dy = (i - 3) * (second ? 9 : 13) + 40 + i * 4; S.line(ex, ey, endX, ey + dy, c[1], 3); });
      if (!second) { S.txt('a long band of colors on the wall', w - 14, 16, { align: 'right', color: k.muted, w: 500 }); S.ro.set('White light comes out spread into colors: violet bends most, red least. The prism sorts colors that are already in the light.'); }
      else {
        var sy = ey + (pick - 3) * 9 + 40 + pick * 4, sx = endX;
        S.rect(sx - 3, py - h * 0.4, 6, h * 0.8, k.ink, null); S.rect(sx - 3, sy - 4, 6, 8, k.bg, null);
        var p2x = w * 0.76, p2y = sy;
        S.line(sx, sy, p2x - 8, p2y, cols[pick][1], 3);
        S.poly([[p2x, p2y - s * 0.55], [p2x - s * 0.45, p2y + s * 0.35], [p2x + s * 0.45, p2y + s * 0.35]], k.ink, 1.5, 'rgba(160,200,255,0.25)');
        S.line(p2x + s * 0.2, p2y, w - 10, p2y + 26 + pick * 3, cols[pick][1], 3);
        S.txt('slit', sx, py - h * 0.4 - 8, { align: 'center', color: k.muted, w: 500 });
        S.ro.set('The slit lets only <b>' + cols[pick][0] + '</b> through. The second prism bends it again but it stays ' + cols[pick][0] + ': one color does not split. This was Newton\'s crucial experiment.');
      }
      S.say(second ? 'Second prism: ' + cols[pick][0] + ' stays ' + cols[pick][0] : 'Prism spreads white light into seven colors');
    };
    S.redraw();
  });

  // ============================================================ iv-cannon: Newton's cannonball
  V.register('iv-cannon', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.4, max: 420, label: "Newton's cannon on a mountain" });
    var v = 5, path = [], st = null, done = '';
    V.slider(S.ctl, { label: 'Speed', min: 1, max: 10, step: 0.1, value: v, fmt: function (x) { return fm(x, 1) + ' km/s'; }, input: function (x) { v = x; } });
    V.button(S.ctl, 'Fire', function () { var Re = 6371, hm = 300; st = { x: 0, y: Re + hm, vx: v, vy: 0, t: 0 }; path = []; done = ''; lp.start(); });
    var GM = 398600; // km^3/s^2
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, cx = w / 2, cy = h / 2, R = M.min(w, h) * 0.3, sc = R / 6371;
      S.circ(cx, cy, R, k.blueSoft, k.blue, 1.5);
      S.poly([[cx - 10, cy - R + 2], [cx, cy - R - 300 * sc - 10], [cx + 10, cy - R + 2]], null, 0, k.muted);
      var pts = path.map(function (p) { return [cx + p[0] * sc, cy - p[1] * sc]; }); S.poly(pts, k.red, 2);
      if (st) S.circ(cx + st.x * sc, cy - st.y * sc, 4, k.ink);
      S.ro.set('Fired at <b>' + fm(v, 1) + ' km/s</b> (no air). ' + (done || (st ? 'Falling…' : 'Press Fire.')) + ' At about 7.9 km/s it falls around the Earth as fast as the ground curves away: an orbit. Above about 11.2 km/s it escapes.');
      S.say('Cannonball at ' + fm(v, 1) + ' kilometers per second. ' + done);
    };
    var lp = V.loop(el, function (dt) {
      if (!st || done) return;
      for (var i = 0; i < 40; i++) {
        var r = M.hypot(st.x, st.y), a = -GM / (r * r * r), h2 = 2; st.vx += a * st.x * h2; st.vy += a * st.y * h2; st.x += st.vx * h2; st.y += st.vy * h2; st.t += h2;
        if (path.length === 0 || st.t % 20 < h2) path.push([st.x, st.y]);
        r = M.hypot(st.x, st.y);
        if (r < 6371) { done = 'It lands ' + M.round(6371 * M.abs(M.atan2(st.x, st.y))) + ' km away.'; break; }
        if (st.t > 3000 && M.abs(M.atan2(st.x, st.y)) < 0.05 && st.x < 0) { done = 'It came all the way around: in orbit.'; break; }
        if (r > 40000) { done = 'It flies off into space.'; break; }
        if (st.t > 30000) { done = 'Still going: in orbit.'; break; }
      }
      S.redraw();
    });
    lp.stop();
    S.redraw();
  });

  // ============================================================ iv-charge: Franklin's one fluid
  V.register('iv-charge', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'Charge moving between glass and silk' });
    var q = 0, mode = 'rub', A = 3, B = 3, sep = 0.6;
    V.seg(S.ctl, { label: 'Show', items: [['rub', 'Rub glass and silk'], ['balls', 'Two charged balls']], value: mode, change: function (v) { mode = v; draw(); } });
    var rubBtn = V.button(S.ctl, 'Rub', function () { if (q < 8) q++; draw(); });
    var rstBtn = V.button(S.ctl, 'Start over', function () { q = 0; draw(); });
    var sA = V.slider(S.ctl, { label: 'Ball A charge', min: -4, max: 4, step: 1, value: A, input: function (v) { A = v; draw(); } });
    var sB = V.slider(S.ctl, { label: 'Ball B charge', min: -4, max: 4, step: 1, value: B, input: function (v) { B = v; draw(); } });
    function draw() { var r = mode === 'rub'; rubBtn.hidden = !r; rstBtn.hidden = !r; sA.el.hidden = r; sB.el.hidden = r; S.redraw(); }
    function signs(x, y, n, col) { for (var i = 0; i < M.abs(n); i++) S.txt(n > 0 ? '+' : '−', x + (i % 4) * 12 - 18, y + M.floor(i / 4) * 14, { align: 'center', color: col, w: 800, size: 14 }); }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h;
      if (mode === 'rub') {
        S.rect(w * 0.12, h * 0.4, w * 0.36, h * 0.18, 'rgba(160,200,255,0.35)', k.ink, 10); S.txt('glass', w * 0.3, h * 0.33, { align: 'center' });
        S.rect(w * 0.56, h * 0.35, w * 0.3, h * 0.3, k.goldSoft, k.ink, 14); S.txt('silk', w * 0.71, h * 0.28, { align: 'center' });
        signs(w * 0.3, h * 0.47, q, k.red); signs(w * 0.71, h * 0.47, -q, k.blue);
        S.ro.set('Glass: <b>' + (q ? '+' : '') + q + '</b>. Silk: <b>' + (q ? '−' + q : '0') + '</b>. Total: <b>0</b>. Rubbing moves Franklin\'s electric fluid from one to the other; it never makes or destroys any.');
        S.say('Glass plus ' + q + ', silk minus ' + q);
      } else {
        var y = h * 0.55, f = A * B, d = w * 0.18 + (f > 0 ? w * 0.08 : f < 0 ? -w * 0.06 : 0);
        var xa = w / 2 - d, xb = w / 2 + d;
        S.line(xa, 10, xa, y - 22, k.muted, 1); S.line(xb, 10, xb, y - 22, k.muted, 1);
        S.circ(xa, y, 22, A > 0 ? k.redSoft : A < 0 ? k.blueSoft : k.panel, k.ink); S.circ(xb, y, 22, B > 0 ? k.redSoft : B < 0 ? k.blueSoft : k.panel, k.ink);
        S.txt((A > 0 ? '+' : '') + A, xa, y, { align: 'center' }); S.txt((B > 0 ? '+' : '') + B, xb, y, { align: 'center' });
        if (f) { var s = f > 0 ? -1 : 1, L = M.min(40, 6 + M.abs(f) * 2.5); S.arrow(xa, y + 36, xa - s * L, y + 36, k.purple); S.arrow(xb, y + 36, xb + s * L, y + 36, k.purple); }
        var what = f > 0 ? 'Like charges: they <b>push apart</b>.' : f < 0 ? 'Unlike charges: they <b>pull together</b>.' : 'One ball has no charge: no push or pull between charges.';
        S.ro.set('A: ' + A + ', B: ' + B + '. ' + what + ' The force grows with both charges.');
        S.say('Ball A ' + A + ', ball B ' + B + '. ' + what);
      }
    };
    draw();
  });

  // ============================================================ iv-pile: Volta's pile
  V.register('iv-pile', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.5, max: 400, label: "Volta's pile of zinc, card and copper" });
    var cells = [1, 1, 1, 1], per = 0.8;
    V.button(S.ctl, 'Add a pair', function () { if (cells.length < 20) cells.push(1); S.redraw(); });
    V.button(S.ctl, 'Add one backward', function () { if (cells.length < 20) cells.push(-1); S.redraw(); });
    V.button(S.ctl, 'Remove top', function () { if (cells.length) cells.pop(); S.redraw(); });
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, n = cells.length, th = M.min(16, (h - 40) / M.max(1, n) / 3), x = w * 0.22, pw = M.min(110, w * 0.28), y = h - 14;
      for (var i = 0; i < n; i++) {
        var layers = cells[i] > 0 ? [['#9aa5b1', 'zinc'], ['#e9d8a6', 'card'], ['#c8723b', 'copper']] : [['#c8723b', 'copper'], ['#e9d8a6', 'card'], ['#9aa5b1', 'zinc']];
        layers.forEach(function (l) { y -= th; S.rect(x, y, pw, th - 1, l[0], k.ink, 2); });
      }
      if (n && th >= 9) { S.txt('copper', x + pw + 8, y + th * 0.5, { color: k.muted, w: 500 }); S.txt('card (brine)', x + pw + 8, y + th * 1.5, { color: k.muted, w: 500 }); S.txt('zinc', x + pw + 8, y + th * 2.5, { color: k.muted, w: 500 }); }
      var sum = cells.reduce(function (a, b) { return a + b; }, 0), volts = sum * per;
      var mx = w * 0.78, my = h * 0.42, mr = M.min(56, w * 0.14);
      S.circ(mx, my, mr, k.panel, k.ink, 2);
      var ang = PI + clamp(volts / 12, 0, 1) * PI; S.line(mx, my, mx + M.cos(ang) * mr * 0.85, my + M.sin(ang) * mr * 0.85, k.red, 3);
      S.txt(fm(volts, 1) + ' V', mx, my + mr * 0.5, { align: 'center', w: 700 });
      var back = cells.filter(function (c) { return c < 0; }).length;
      S.ro.set(n + ' pair' + (n === 1 ? '' : 's') + (back ? ' (' + back + ' backward)' : '') + ': ' + (n - back) + ' − ' + back + ' = ' + sum + ' useful pairs × about 0.8 V = <b>' + fm(volts, 1) + ' volts</b>.');
      S.say('Pile with ' + n + ' pairs, about ' + fm(volts, 1) + ' volts');
    };
    S.redraw();
  });

  // ============================================================ iv-induction: Faraday's magnet and coil
  V.register('iv-induction', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'A magnet moving into a coil connected to a meter' });
    var turns = opts.turns || 10, mx = 0.1, prev = 0.1, needle = 0, shake = 0, vel = 0;
    V.slider(S.ctl, { label: 'Turns of wire', min: 2, max: 30, step: 1, value: turns, input: function (v) { turns = v; } });
    V.button(S.ctl, 'Shake', function () { shake = 2.5; lp.start(); });
    function geo() { var w = S.c.w, h = S.c.h; return { w: w, h: h, cx: w * 0.55, cy: h * 0.45, cw: w * 0.26, ch: h * 0.34, ml: w * 0.22 }; }
    V.drag(S.c.cv, { hit: function () { return 'm'; }, move: function (hd, px) { var g = geo(); mx = clamp((px - g.ml / 2) / (g.w - g.ml), 0, 1); lp.start(); } });
    function flux(x) { var g = geo(), p = x * (g.w - g.ml) + g.ml, d = (p - (g.cx - g.cw / 2)) / (g.cw * 0.6); return 1 / (1 + M.exp(-d * 2.2)); }
    S.draw = function () {
      var k = S.k, g = geo();
      for (var i = 0; i < M.min(turns, 30); i++) { var x = g.cx - g.cw / 2 + (i + 0.5) * g.cw / M.min(turns, 30); S.line(x, g.cy - g.ch / 2, x + 4, g.cy + g.ch / 2, k.orange, 2); }
      var p = mx * (g.w - g.ml) + g.ml;
      S.rect(p - g.ml, g.cy - 12, g.ml / 2, 24, k.red, k.ink, 3); S.rect(p - g.ml / 2, g.cy - 12, g.ml / 2, 24, k.blue, k.ink, 3);
      S.txt('S', p - g.ml * 0.75, g.cy, { align: 'center', color: '#fff' }); S.txt('N', p - g.ml * 0.25, g.cy, { align: 'center', color: '#fff' });
      var gx = g.w * 0.86, gy = g.h * 0.82, gr = M.min(40, g.h * 0.16);
      S.line(g.cx + g.cw / 2, g.cy + g.ch / 2, gx, gy - gr, k.muted, 1.5); S.line(g.cx - g.cw / 2, g.cy + g.ch / 2, gx - gr, gy, k.muted, 1.5);
      S.circ(gx, gy, gr, k.panel, k.ink, 2);
      var a = -PI / 2 + clamp(needle, -1, 1) * 1.1; S.line(gx, gy, gx + M.cos(a) * gr * 0.85, gy + M.sin(a) * gr * 0.85, k.ink, 2.5);
      S.txt('meter', gx, gy + gr + 10, { align: 'center', color: k.muted, w: 500, size: 11 });
      var st = M.abs(needle) < 0.03 ? 'The magnet is still: <b>no current</b>.' : needle > 0 ? 'Magnet moving in: current one way.' : 'Magnet moving out: current the other way.';
      S.ro.set(st + ' ' + turns + ' turns. More turns, a stronger magnet or faster motion give more current. Drag the magnet.');
      S.say('Meter reading ' + fm(needle, 2) + '. ' + st);
    };
    var lp = V.loop(el, function (dt) {
      if (shake > 0) { shake -= dt; mx = 0.45 + 0.35 * M.sin(shake * 9); }
      if (dt > 0) { var dphi = (flux(mx) - flux(prev)) / dt; vel = vel * 0.6 + 0.4 * dphi; }
      prev = mx; needle += (clamp(vel * turns * 0.05, -1.2, 1.2) - needle) * M.min(1, dt * 12);
      S.redraw();
      if (shake <= 0 && M.abs(needle) < 0.005 && M.abs(vel) < 0.001) lp.stop();
    });
    S.redraw();
  });

  // ============================================================ iv-morse: Morse code
  var CODE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.' };
  var DECODE = {}; Object.keys(CODE).forEach(function (k) { DECODE[CODE[k]] = k; });
  var actx = null;
  function beep(on) {
    try {
      if (!actx) { var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return null; actx = new AC(); }
      if (on) { var o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 600; g.gain.value = 0.08; o.connect(g); g.connect(actx.destination); o.start(); return o; }
    } catch (e) { } return null;
  }
  V.register('iv-morse', function (el, opts) {
    var S = scene(el, opts, { aspect: 2.6, min: 170, max: 260, label: 'Morse code' });
    var text = 'SOS', seq = [], playT = -1, unit = 0.12, tone = null, sent = '', down = 0, buf = '', lastUp = 0, keyDown = false;
    var inp = V.el('input', 'ivv-text'); inp.type = 'text'; inp.value = text; inp.maxLength = 16; inp.setAttribute('aria-label', 'Word to send in Morse code');
    S.ctl.appendChild(inp); inp.addEventListener('input', function () { text = inp.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ''); build(); S.redraw(); });
    V.button(S.ctl, 'Play', function () { build(); playT = 0; lp.start(); });
    var key = V.button(S.ctl, 'Tap the key', function () { }); key.classList.add('ivv-key');
    V.button(S.ctl, 'Clear', function () { sent = ''; buf = ''; S.redraw(); });
    function press(e) { if (e) e.preventDefault(); if (keyDown) return; keyDown = true; down = performance.now(); tone = beep(true); lp.start(); }
    function release() { if (!keyDown) return; keyDown = false; var d = (performance.now() - down) / 1000; buf += d < unit * 2 ? '.' : '-'; lastUp = performance.now(); if (tone) { try { tone.stop(); } catch (e) { } tone = null; } S.redraw(); }
    key.addEventListener('pointerdown', press); key.addEventListener('pointerup', release); key.addEventListener('pointerleave', release);
    key.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') press(e); }); key.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') release(); });
    function build() { seq = []; text.split('').forEach(function (ch, i) { if (ch === ' ') { if (seq.length) seq[seq.length - 1][1] = 7; return; } var c = CODE[ch]; if (!c) return; c.split('').forEach(function (s, j) { seq.push([1, s === '.' ? 1 : 3]); seq.push([0, j < c.length - 1 ? 1 : 3]); }); }); while (seq.length && !seq[seq.length - 1][0]) seq.pop(); }
    build();
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, total = seq.reduce(function (a, s) { return a + s[1]; }, 0) || 1, x = 12, sc = (w - 24) / total, y = h * 0.32, tu = 0;
      seq.forEach(function (s) { var on = s[0] && playT >= 0 && playT >= tu * unit && playT < (tu + s[1]) * unit; if (s[0]) S.rect(x + tu * sc, y - 8, s[1] * sc - 1, 16, on ? k.gold : k.green, null, 3); tu += s[1]; });
      var codes = text.split('').map(function (ch) { return ch === ' ' ? '/' : (CODE[ch] || '').replace(/\./g, '·').replace(/-/g, '−'); }).join('   ');
      S.txt(codes, w / 2, y + 30, { align: 'center', size: 15, w: 700 });
      S.txt('You sent: ' + (sent + (buf ? ' [' + buf.replace(/\./g, '·').replace(/-/g, '−') + ']' : '')) , 12, h - 22, { color: k.blue });
      S.ro.set('<b>' + (text || '…') + '</b> = ' + codes + ' (' + total + ' dot-lengths). Tap the key (or hold Space on it): short for a dot, long for a dash; pause to end a letter.');
      S.say('Morse for ' + text + ': ' + codes);
    };
    var lp = V.loop(el, function (dt) {
      var busy = false;
      if (playT >= 0) {
        busy = true; playT += dt; var tu = 0, on = false; seq.forEach(function (s) { if (playT >= tu * unit && playT < (tu + s[1]) * unit && s[0]) on = true; tu += s[1]; });
        if (on && !tone) tone = beep(true); if (!on && tone && !keyDown) { try { tone.stop(); } catch (e) { } tone = null; }
        if (playT > tu * unit) { playT = -1; if (tone) { try { tone.stop(); } catch (e) { } tone = null; } }
      }
      if (keyDown) busy = true;
      if (!keyDown && buf && performance.now() - lastUp > unit * 3500) { sent += DECODE[buf] || '?'; buf = ''; }
      if (buf) busy = true;
      S.redraw(); if (!busy) lp.stop();
    });
    lp.stop();
    S.redraw();
  });

  // ============================================================ iv-phone: telegraph versus telephone current
  V.register('iv-phone', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'A sound wave, a telegraph signal and a telephone current' });
    var snd = 'vowel', t = 0;
    V.seg(S.ctl, { label: 'Sound', items: [['hum', 'Low hum'], ['whistle', 'Whistle'], ['vowel', 'Vowel "ah"']], value: snd, change: function (v) { snd = v; S.redraw(); } });
    function wave(x) { if (snd === 'hum') return M.sin(x * 2); if (snd === 'whistle') return M.sin(x * 7); return 0.6 * M.sin(x * 2) + 0.3 * M.sin(x * 4 + 1) + 0.25 * M.sin(x * 6 + 2); }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, rows = [['sound wave in the air', k.ink, function (x) { return wave(x); }], ['telegraph: only on or off', k.orange, function (x) { return wave(x) > 0 ? 0.8 : -0.8; }], ['telephone: current copies the wave', k.green, function (x) { return wave(x) * 0.9; }]];
      rows.forEach(function (r, i) {
        var y0 = h * (0.2 + i * 0.3), amp = h * 0.09, pts = [];
        for (var px = 12; px < w - 12; px += 2) pts.push([px, y0 - amp * r[2]((px / w) * 12 + t)]);
        S.line(12, y0, w - 12, y0, k.grid, 1); S.poly(pts, r[1], 2); S.txt(r[0], 14, y0 - amp - 10, { color: k.muted, w: 600, size: 11 });
      });
      S.ro.set('A telegraph can send only on and off, so the shape of a voice is lost. Bell\'s telephone sends a current that rises and falls with the sound wave, so the far end can rebuild the sound.');
      S.say('Sound wave, telegraph on-off signal and telephone current for a ' + snd);
    };
    var lp = V.loop(el, function (dt) { t += dt * 1.5; S.redraw(); });
    S.playBtn(lp, autoplay(opts));
    S.redraw();
  });

  // ============================================================ iv-filament: Edison's filament trials
  V.register('iv-filament', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'A light bulb filament test' });
    // hours of life in a good vacuum (rough, for comparison; documented: carbonized cotton thread over 13 h, bamboo over 1,000 h)
    var MATS = { cotton: ['Carbonized cotton thread', 14], paper: ['Carbonized cardboard', 100], bamboo: ['Carbonized bamboo', 1200], platinum: ['Platinum wire', 0.3], plain: ['Plain cotton thread (not carbonized)', 0] };
    var mat = 'cotton', vac = 0.9, t = 0, on = false, dead = false;
    V.seg(S.ctl, { label: 'Filament', items: [['platinum', 'Platinum'], ['cotton', 'Cotton (carbon)'], ['paper', 'Cardboard (carbon)'], ['bamboo', 'Bamboo (carbon)']], value: mat, change: function (v) { mat = v; reset(); } });
    V.slider(S.ctl, { label: 'Vacuum', min: 0, max: 1, step: 0.05, value: vac, fmt: function (v) { return v === 0 ? 'air' : M.round(v * 100) + '% pumped out'; }, input: function (v) { vac = v; reset(); } });
    V.button(S.ctl, 'Switch on', function () { reset(); on = true; lp.start(); });
    function reset() { t = 0; on = false; dead = false; S.redraw(); }
    function life() { var base = MATS[mat][1], air = 1 - vac; return base * M.pow(0.001, air * 1.2) * (vac > 0.97 ? 1 : 0.6) + 0.0005; }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, cx = w * 0.3, cy = h * 0.45, r = M.min(h * 0.3, 70), L = life(), glow = on && !dead ? 1 : 0;
      if (glow) { var g = S.ctx.createRadialGradient(cx, cy, 4, cx, cy, r * 1.6); g.addColorStop(0, 'rgba(255,214,90,0.9)'); g.addColorStop(1, 'rgba(255,214,90,0)'); S.ctx.fillStyle = g; S.ctx.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4); }
      S.circ(cx, cy, r, 'rgba(200,220,255,0.15)', k.ink, 1.5); S.rect(cx - r * 0.35, cy + r * 0.85, r * 0.7, r * 0.5, k.muted, k.ink, 3);
      var fc = dead ? k.muted : glow ? '#ffd43b' : k.ink;
      S.line(cx - r * 0.25, cy + r * 0.9, cx - r * 0.25, cy, k.ink, 1.5); S.line(cx + r * 0.25, cy + r * 0.9, cx + r * 0.25, cy, k.ink, 1.5);
      if (!dead) { var pts = []; for (var i = 0; i <= 20; i++) pts.push([cx - r * 0.25 + i * r * 0.025, cy - r * 0.4 * M.sin(i / 20 * PI)]); S.poly(pts, fc, glow ? 3 : 1.5); }
      else { S.line(cx - r * 0.25, cy, cx - r * 0.15, cy - r * 0.25, k.muted, 1.5); S.line(cx + r * 0.25, cy, cx + r * 0.12, cy - r * 0.2, k.muted, 1.5); }
      var gx = w * 0.56, gw = w * 0.4, gy = h * 0.2, gh = h * 0.55, maxL = 1200, lx = function (v) { return gx + M.log(1 + v) / M.log(1 + maxL) * gw; };
      S.rect(gx, gy, gw, gh, k.panel, null); S.txt('how long it lasts, in hours (log scale)', gx, gy - 10, { color: k.muted, w: 500, size: 11 });
      [1, 10, 100, 1000].forEach(function (v) { S.line(lx(v), gy + gh, lx(v), gy + gh + 4, k.axis, 1); S.txt(String(v), lx(v), gy + gh + 12, { align: 'center', color: k.muted, size: 10, w: 500 }); });
      S.rect(gx, gy + gh * 0.35, M.max(2, lx(L) - gx), gh * 0.3, dead ? k.redSoft : k.goldSoft, null);
      var hrs = t * L / 3;
      var desc = MATS[mat][0] + ', ' + (vac === 0 ? 'in air' : M.round(vac * 100) + '% of the air pumped out') + ': lasts about <b>' + (L < 0.05 ? 'a few seconds' : L < 1 ? fm(L * 60, 0) + ' minutes' : fm(L, 0) + ' hours') + '</b>.';
      S.ro.set(desc + (mat === 'platinum' ? ' Platinum glows but melts easily and costs a fortune.' : '') + (vac < 0.5 ? ' Oxygen in the air burns the hot filament.' : '') + ' (Rough comparison for teaching; the cotton and bamboo figures follow Edison\'s records.)');
      S.say(MATS[mat][0] + ', lasts about ' + fm(L, 2) + ' hours');
    };
    var lp = V.loop(el, function (dt) { if (!on || dead) { lp.stop(); return; } t += dt; if (t >= 3) { dead = true; on = false; } S.redraw(); });
    S.redraw();
  });

  // ============================================================ iv-field: Tesla's rotating field
  V.register('iv-field', function (el, opts) {
    var S = scene(el, opts, { aspect: 1.8, label: 'A rotating magnetic field made by two or three coils' });
    var ph = opts.phases === 3 ? 3 : 2, t = 0, speed = 0.5, off = false;
    V.seg(S.ctl, { label: 'Phases', items: [['2', 'Two coils'], ['3', 'Three coils']], value: String(ph), change: function (v) { ph = +v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Speed', min: 0.1, max: 1.5, step: 0.1, value: speed, input: function (v) { speed = v; } });
    var ob = V.button(S.ctl, 'Switch one coil off', function () { off = !off; ob.textContent = off ? 'Switch it back on' : 'Switch one coil off'; S.redraw(); });
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, cx = w * 0.3, cy = h / 2, R = M.min(h * 0.38, w * 0.24), cols = [k.red, k.blue, k.green], sum = [0, 0];
      S.circ(cx, cy, R, null, k.grid, 1);
      for (var i = 0; i < ph; i++) {
        var a = i * 2 * PI / (ph === 2 ? 4 : 3), cur = (off && i === 0) ? 0 : M.cos(t - i * 2 * PI / (ph === 2 ? 4 : 3));
        var dx = M.cos(a), dy = M.sin(a);
        S.rect(cx + dx * R * 1.05 - 8, cy - dy * R * 1.05 - 8, 16, 16, cols[i], k.ink, 3);
        S.arrow(cx, cy, cx + dx * R * 0.7 * cur, cy - dy * R * 0.7 * cur, cols[i], 2);
        sum[0] += dx * cur; sum[1] += dy * cur;
      }
      var sc = ph === 2 ? 0.7 : 0.7 / 1.5;
      S.arrow(cx, cy, cx + sum[0] * R * sc, cy - sum[1] * R * sc, k.ink, 4);
      var gx = w * 0.6, gw = w * 0.36, gy = h * 0.2, gh = h * 0.6;
      S.rect(gx, gy, gw, gh, k.panel, null); S.line(gx, gy + gh / 2, gx + gw, gy + gh / 2, k.axis, 1);
      for (var j = 0; j < ph; j++) { var pts = []; for (var x = 0; x <= gw; x += 3) { var tt = t - (gw - x) / gw * 2 * PI * 1.5; pts.push([gx + x, gy + gh / 2 - gh * 0.4 * ((off && j === 0) ? 0 : M.cos(tt - j * 2 * PI / (ph === 2 ? 4 : 3)))]); } S.poly(pts, cols[j], 2); }
      S.txt('coil currents', gx, gy - 9, { color: k.muted, w: 500, size: 11 });
      var mag = M.hypot(sum[0], sum[1]);
      S.ro.set(off ? 'With one coil off, the total field (black arrow) only grows and shrinks back and forth: it no longer turns, and a simple motor would not start by itself.' : 'The coil currents peak one after another, so the total field (black arrow) keeps the same length and <b>turns</b>, once per cycle. A metal rotor inside would be dragged around.');
      S.say(ph + ' phase field, ' + (off ? 'one coil off, not rotating' : 'rotating') + ', strength ' + fm(mag, 2));
    };
    var lp = V.loop(el, function (dt) { t += dt * speed * 2 * PI * 0.5; S.redraw(); });
    S.playBtn(lp, autoplay(opts));
    S.redraw();
  });

  // ============================================================ iv-wing: the Wrights' lift
  V.register('iv-wing', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'Lift on a wing against angle of attack' });
    var ang = 6, spd = 20, area = 300;
    V.slider(S.ctl, { label: 'Angle of attack', min: 0, max: 25, step: 1, value: ang, fmt: function (v) { return v + '°'; }, input: function (v) { ang = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Air speed', min: 10, max: 35, step: 1, value: spd, fmt: function (v) { return v + ' mph'; }, input: function (v) { spd = v; S.redraw(); } });
    function cl(a) { if (a <= 16) return 0.12 + a * 0.05; return M.max(0.35, 0.92 - (a - 16) * 0.07); }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, c = cl(ang), Lw = 0.0033 * area * spd * spd * c, Ls = 0.005 * area * spd * spd * c;
      // wing
      var cx = w * 0.22, cy = h * 0.5, len = M.min(w * 0.3, 140), a = -ang * PI / 180;
      S.ctx.save(); S.ctx.translate(cx, cy); S.ctx.rotate(a);
      S.ctx.beginPath(); S.ctx.moveTo(-len / 2, 0); S.ctx.quadraticCurveTo(0, -len * 0.14, len / 2, 0); S.ctx.quadraticCurveTo(0, -len * 0.08, -len / 2, 0); S.ctx.fillStyle = k.gold; S.ctx.fill(); S.ctx.strokeStyle = k.ink; S.ctx.lineWidth = 1.5; S.ctx.stroke(); S.ctx.restore();
      for (var i = 0; i < 4; i++) S.arrow(8, cy - 30 + i * 20, cx - len / 2 - 10, cy - 30 + i * 20, k.muted, 1.2);
      S.arrow(cx, cy - 8, cx, cy - 8 - clamp(Lw / 4, 4, h * 0.38), k.green, 3);
      S.txt('wind', 10, cy - 42, { color: k.muted, w: 500, size: 11 });
      // graph of C_L
      var gx = w * 0.52, gw = w * 0.44, gy = h * 0.1, gh = h * 0.66, X = function (v) { return gx + v / 25 * gw; }, Y = function (v) { return gy + gh - v / 1 * gh; };
      S.rect(gx, gy, gw, gh, k.panel, null); S.line(gx, gy + gh, gx + gw, gy + gh, k.axis, 1); S.line(gx, gy, gx, gy + gh, k.axis, 1);
      var pts = []; for (var d = 0; d <= 25; d += 0.5) pts.push([X(d), Y(cl(d))]); S.poly(pts, k.blue, 2);
      S.circ(X(ang), Y(c), 5, k.red);
      [0, 10, 20].forEach(function (a0) { S.txt(String(a0), X(a0), gy + gh + 10, { align: 'center', color: k.muted, size: 10, w: 500 }); }); [0.5, 1].forEach(function (c0) { S.line(gx - 3, Y(c0), gx, Y(c0), k.axis, 1); S.txt(String(c0), gx - 5, Y(c0), { align: 'right', color: k.muted, size: 10, w: 500 }); });
      S.txt('lift coefficient', gx + 4, gy + 10, { color: k.muted, w: 500, size: 11 }); S.txt('angle (°)', gx + gw, gy + gh + 22, { align: 'right', color: k.muted, w: 500, size: 11 });
      if (ang > 16) S.txt('stall', X(20), Y(cl(20)) - 14, { align: 'center', color: k.red });
      S.ro.set('Angle ' + ang + '°, ' + spd + ' mph, a 300 sq ft wing, C<sub>L</sub> ≈ ' + fm(c, 2) + '. Lift with the Wrights\' k = 0.0033: <b>' + M.round(Lw) + ' lb</b>. The old tables (k = 0.005) promised ' + M.round(Ls) + ' lb, about 1.5 times too much.' + (ang > 16 ? ' Past about 16° this wing stalls and lift falls.' : '') + ' (A simple model wing, for teaching.)');
      S.say('Lift ' + M.round(Lw) + ' pounds at ' + ang + ' degrees and ' + spd + ' miles per hour');
    };
    S.redraw();
  });

  // ============================================================ iv-calendar: Sagan's Cosmic Calendar
  V.register('iv-calendar', function (el, opts) {
    var S = scene(el, opts, { aspect: 2, label: 'The Cosmic Calendar' });
    var AGE = 13.8e9;
    var EV = [['Big bang', 13.8e9], ['Milky Way forms', 13.2e9], ['Sun and Earth form', 4.6e9], ['First life on Earth', 3.8e9], ['First animals', 0.6e9], ['First dinosaurs', 0.23e9], ['Dinosaurs die out', 0.066e9], ['Our species, Homo sapiens', 300000], ['Pyramids of Giza', 4500], ['Gutenberg\'s Bible', 570], ['Wright brothers fly', 123]];
    var pick = 6;
    var sel = V.el('select', 'ivv-sel'); sel.setAttribute('aria-label', 'Event');
    EV.forEach(function (e, i) { var o = D.createElement('option'); o.value = i; o.textContent = e[0]; if (i === pick) o.selected = true; sel.appendChild(o); });
    S.ctl.appendChild(sel); sel.addEventListener('change', function () { pick = +sel.value; S.redraw(); });
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function when(ago) {
      var sec = (1 - ago / AGE) * 365 * 86400, day = M.floor(sec / 86400), rest = sec - day * 86400, m = 0;
      while (m < 11 && day >= DAYS[m]) { day -= DAYS[m]; m++; }
      var hh = M.floor(rest / 3600), mm = M.floor((rest % 3600) / 60), ss = M.floor(rest % 60);
      return { m: m, d: day + 1, t: (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss, secBefore: ago / AGE * 365 * 86400 };
    }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, cw = (w - 24) / 12, y = 30;
      for (var i = 0; i < 12; i++) { S.rect(12 + i * cw + 1, y, cw - 2, 34, i === 11 ? k.goldSoft : k.panel, k.grid, 3); S.txt(MON[i], 12 + i * cw + cw / 2, y + 17, { align: 'center', size: 11, w: 600 }); }
      var e = EV[pick], q = when(e[1]), xm = 12 + (q.m + (q.d - 0.5) / DAYS[q.m]) * cw;
      S.arrow(xm, y + 64, xm, y + 38, k.red, 2.5);
      // a zoom bar: December day by day, or December 31 hour by hour
      var by = h * 0.62, bw = w - 24, inDec = q.m === 11, last = inDec && q.d === 31;
      S.rect(12, by, bw, 26, k.panel, k.grid, 3);
      S.txt(last ? 'December 31, midnight to midnight' : inDec ? 'December, day by day' : 'Zoom: pick a December event to see it here', 12, by - 10, { color: k.muted, w: 500, size: 11 });
      if (last) {
        for (var hh = 0; hh <= 24; hh += 6) { var hx = 12 + hh / 24 * bw; S.line(hx, by + 26, hx, by + 31, k.axis, 1); S.txt(hh + ':00', M.min(w - 22, M.max(22, hx)), by + 40, { align: 'center', size: 10, color: k.muted, w: 500 }); }
        var parts = q.t.split(':'), fx = 12 + (+parts[0] + parts[1] / 60 + parts[2] / 3600) / 24 * bw; S.line(fx, by - 2, fx, by + 28, k.red, 3);
      } else if (inDec) {
        [1, 8, 15, 22, 29].forEach(function (dd) { var dx = 12 + (dd - 1) / 31 * bw; S.line(dx, by + 26, dx, by + 31, k.axis, 1); S.txt('Dec ' + dd, M.min(w - 26, M.max(26, dx)), by + 40, { align: 'center', size: 10, color: k.muted, w: 500 }); });
        var p2 = q.t.split(':'), dfx = 12 + (q.d - 1 + (+p2[0] + p2[1] / 60) / 24) / 31 * bw; S.line(dfx, by - 2, dfx, by + 28, k.red, 3);
      }
      var sb = q.secBefore, before = sb < 60 ? fm(sb, 1) + ' seconds' : sb < 3600 ? fm(sb / 60, 1) + ' minutes' : sb < 86400 ? fm(sb / 3600, 1) + ' hours' : fm(sb / 86400, 1) + ' days';
      S.ro.set('<b>' + e[0] + '</b> (about ' + (e[1] >= 1e9 ? fm(e[1] / 1e9, 2) + ' billion' : e[1] >= 1e6 ? fm(e[1] / 1e6, 1) + ' million' : e[1].toLocaleString('en-US')) + ' years ago) falls on <b>' + MON[q.m] + ' ' + q.d + '</b> at ' + q.t + ', about ' + before + ' before midnight. One day = about 38 million years; one second = about 440 years.');
      S.say(e[0] + ' on ' + MON[q.m] + ' ' + q.d);
    };
    S.redraw();
  });
})(window, document);
