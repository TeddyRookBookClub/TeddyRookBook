/* Culinary Ladder visual kit: interactive visuals named cu-…, registered with window.MathLadder.viz.register.
   Loaded after static/math/viz/core.js on every Culinary Ladder page. Vanilla JavaScript (canvas or plain HTML), no
   libraries, no network requests. Follows the site's light or dark theme (canvas visuals redraw when it changes).

   USE   <div class="ml-viz" data-viz="cu-cuts" data-opts='{"cut":"batonnet"}'></div>

   VISUALS (options in brackets)
     cu-scale    scale a recipe: old and new yield, every amount multiplied by the conversion factor
     cu-cuts     the classic knife cuts drawn at true size, with a credit-card calibration  [cut]
     cu-angle    a blade's edge at a chosen sharpening angle, with the spine height and a stack of coins  [angle]
     cu-cool     the danger zone (zone), or a two-stage cooling checker with presets (check)  [mode: zone|check]
     cu-temps    a quiz on USDA safe minimum internal temperatures, with the table
     cu-shelf    put foods on refrigerator shelves in the safe order, then check
     cu-carry    carryover cooking after the roast leaves the oven (carry), or the gray band at different oven temperatures (roast)  [mode]
     cu-sauces   the five mother sauces, their thickeners, their children and the Meal Prep recipes  [open]
     cu-bakers   a baker's percentage calculator with formulas (lean, pizza, brioche, pie 3-2-1, focaccia)  [preset]
     cu-sugar    a candy thermometer: the sugar stage, its uses and the syrup's color, with altitude
     cu-cost     recipe costing with yields and food-cost percent (recipe), or a menu-price calculator (price)  [mode]
     cu-plate    drag the parts of a dish on a plate, with a thirds grid or a clock, and notes on space and balance
     cu-setting  a formal place setting: tap any item to see what it is for
     cu-brigade  Escoffier's brigade as a chart: tap a role to see the job
     cu-plan     a backward schedule: serving time and minutes per item give each start time  [preset: capstone]
   Figures come from the sources named in each lesson (USDA FSIS, FDA Food Code 2022, the Exploratorium). The carryover
   picture is a simple model to show the idea, and says so. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, el = V.el;
  function nm(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function r2(x) { return M.round(x * 100) / 100; }
  function money(x) { return '$' + (M.round(x * 100) / 100).toFixed(2); }
  function wrap(el0, label) { el0.classList.add('cuv'); var w = el('div', 'cuv-wrap'); el0.appendChild(w); if (label) w.setAttribute('aria-label', label); return w; }
  function numIn(parent, label, value, o) {
    o = o || {}; var lab = el('label', 'cuv-num'), sp = el('span', '', label), inp = D.createElement('input');
    inp.type = 'number'; inp.value = value; inp.inputMode = 'decimal'; if (o.min != null) inp.min = o.min; if (o.max != null) inp.max = o.max; inp.step = o.step || 'any';
    lab.appendChild(sp); lab.appendChild(inp); parent.appendChild(lab); if (o.input) inp.addEventListener('input', function () { o.input(+inp.value); });
    return inp;
  }
  /* a canvas scene with controls and a readout that redraws on theme change and resize */
  function scene(el0, o) {
    el0.classList.add('cuv');
    var w = el('div', 'cuv-wrap'); el0.appendChild(w);
    var c = V.canvas(w, { aspect: o.aspect || 1.7, max: o.max || 380, min: o.min || 200 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', o.label || 'Culinary picture');
    var ctl = el('div', 'ml-ctl cuv-ctl'); w.appendChild(ctl);
    var ro = V.readout(w);
    var S = { c: c, ctx: c.ctx, ctl: ctl, ro: ro, w: w, k: V.colors(), draw: function () { } };
    S.redraw = function () { S.k = V.colors(); S.ctx.clearRect(0, 0, c.w, c.h); S.ctx.fillStyle = S.k.bg; S.ctx.fillRect(0, 0, c.w, c.h); S.draw(); };
    S.say = function (s) { c.cv.setAttribute('aria-label', String(s).replace(/<[^>]+>/g, '')); };
    S.txt = function (s, x, y, q) { q = q || {}; var x2 = S.ctx; x2.save(); x2.font = (q.w || 600) + ' ' + (q.size || (c.w < 460 ? 11 : 13)) + 'px system-ui,sans-serif'; x2.fillStyle = q.color || S.k.ink; x2.textAlign = q.align || 'left'; x2.textBaseline = q.base || 'middle'; x2.fillText(s, x, y); x2.restore(); };
    S.line = function (x1, y1, x2, y2, col, lw, dash) { var g = S.ctx; g.save(); g.strokeStyle = col || S.k.ink; g.lineWidth = lw || 2; g.lineCap = 'round'; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore(); };
    S.rect = function (x, y, ww, hh, fill, stroke, r) { var g = S.ctx; g.save(); g.beginPath(); if (r && g.roundRect) g.roundRect(x, y, ww, hh, r); else g.rect(x, y, ww, hh); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); } g.restore(); };
    S.circ = function (x, y, r, fill, stroke, lw) { var g = S.ctx; g.save(); g.beginPath(); g.arc(x, y, M.max(0.5, r), 0, 2 * M.PI); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1.5; g.stroke(); } g.restore(); };
    S.poly = function (pts, stroke, lw, fill) { var g = S.ctx; g.save(); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (fill) { g.closePath(); g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.lineJoin = 'round'; g.stroke(); } g.restore(); };
    V.onTheme(S.redraw); c.onResize(S.redraw);
    return S;
  }
  function dark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }

  // ============================================================ cu-scale
  V.register('cu-scale', function (el0, opts) {
    var w = wrap(el0, 'Recipe scaler');
    var rows = opts.rows || [['Carrots', 900, 'g'], ['Onion', 300, 'g'], ['Stock', 1500, 'mL'], ['Butter', 40, 'g'], ['Salt', 9, 'g']];
    var y0 = nm(opts.yield, 6), y1 = nm(opts.to, 20);
    var top = el('div', 'cuv-row'); w.appendChild(top);
    var a = numIn(top, 'Recipe makes (servings)', y0, { min: 1, input: draw }), b = numIn(top, 'You need (servings)', y1, { min: 1, input: draw });
    var out = el('div', 'cuv-out'); w.appendChild(out);
    var note = el('p', 'cuv-note', 'Strong seasonings and leaveners: start a little under the full factor in a big batch, then taste and adjust. Pan sizes and cooking times change too.'); w.appendChild(note);
    function draw() {
      var o = +a.value, n = +b.value; if (!(o > 0) || !(n > 0)) { out.innerHTML = '<p class="cuv-bad">Enter two yields above zero.</p>'; return; }
      var f = n / o, h = '<p class="cuv-big">Conversion factor: ' + n + ' ÷ ' + o + ' = <b>' + r2(f) + '</b></p><table class="cuv-tbl"><thead><tr><th scope="col">Ingredient</th><th scope="col">Recipe</th><th scope="col">Scaled</th></tr></thead><tbody>';
      rows.forEach(function (r) { var v = r[1] * f; h += '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + r[1] + ' ' + r[2] + '</td><td><b>' + (v >= 100 ? M.round(v) : r2(v)) + ' ' + r[2] + '</b></td></tr>'; });
      out.innerHTML = h + '</tbody></table>';
    }
    draw();
  });

  // ============================================================ cu-cuts (true size)
  var CUTS = {
    'fine-julienne': { n: 'Fine julienne', d: [1 / 16, 1 / 16, 1.5], t: 'stick', s: '¹⁄₁₆ × ¹⁄₁₆ × 1 to 2 in' },
    julienne: { n: 'Julienne', d: [1 / 8, 1 / 8, 2], t: 'stick', s: '⅛ × ⅛ × 1 to 2 in' },
    batonnet: { n: 'Batonnet', d: [1 / 4, 1 / 4, 2.5], t: 'stick', s: '¼ × ¼ × 2 to 2½ in' },
    'fine-brunoise': { n: 'Fine brunoise', d: [1 / 16], t: 'cube', s: '¹⁄₁₆ in cubes' },
    brunoise: { n: 'Brunoise', d: [1 / 8], t: 'cube', s: '⅛ in cubes' },
    small: { n: 'Small dice', d: [1 / 4], t: 'cube', s: '¼ in cubes' },
    medium: { n: 'Medium dice', d: [1 / 2], t: 'cube', s: '½ in cubes' },
    large: { n: 'Large dice', d: [3 / 4], t: 'cube', s: '¾ in cubes' },
    paysanne: { n: 'Paysanne', d: [1 / 2, 1 / 8], t: 'flat', s: '½ × ½ × ⅛ in' },
    rondelle: { n: 'Rondelle', d: [1, 1 / 4], t: 'round', s: 'rounds, here 1 in across, ¼ in thick' }
  };
  V.register('cu-cuts', function (el0, opts) {
    var S = scene(el0, { aspect: 1.9, max: 260, min: 210, label: 'Knife cuts at true size' });
    var cut = CUTS[opts.cut] ? opts.cut : 'batonnet', ppi = 96;
    try { var sv = +W.localStorage.getItem('cu-ppi'); if (sv > 50 && sv < 200) ppi = sv; } catch (e) { }
    var sel = el('label', 'cuv-num'); sel.appendChild(el('span', '', 'Cut')); var s = D.createElement('select');
    Object.keys(CUTS).forEach(function (k) { var o = D.createElement('option'); o.value = k; o.textContent = CUTS[k].n; if (k === cut) o.selected = true; s.appendChild(o); });
    s.addEventListener('change', function () { cut = s.value; S.redraw(); }); sel.appendChild(s); S.ctl.appendChild(sel);
    var cal = false; var cb = V.button(S.ctl, 'Calibrate the size', function () { cal = !cal; cb.textContent = cal ? 'Done calibrating' : 'Calibrate the size'; sl.el.style.display = cal ? '' : 'none'; S.redraw(); });
    var sl = V.slider(S.ctl, { label: 'Screen scale (pixels per inch)', min: 60, max: 180, step: 1, value: ppi, input: function (v) { ppi = v; try { W.localStorage.setItem('cu-ppi', String(v)); } catch (e) { } S.redraw(); } });
    sl.el.style.display = 'none';
    S.draw = function () {
      var g = S.ctx, k = S.k, w = S.c.w, h = S.c.h, c = CUTS[cut];
      var veg = dark() ? '#f0a35e' : '#e8590c', vegS = dark() ? '#ffd2a6' : '#a63f06';
      if (cal) {
        var cw = 3.37 * ppi, x0 = 14; S.rect(x0, 30, M.min(cw, w - 28), 2.125 * ppi > h - 60 ? h - 60 : 2.125 * ppi, k.blueSoft, k.blue, 10);
        S.txt('Hold a bank or library card here and move the slider until its width matches this box.', 14, 16, { color: k.muted, w: 500 });
        if (cw > w - 28) S.txt('Too wide for this screen: turn your phone sideways.', 14, h - 12, { color: k.red });
        S.ro.set('Calibration: ' + ppi + ' pixels per inch. A standard card is 3.37 inches wide.'); S.say('Calibration box'); return;
      }
      // ruler
      var rx = 14, ry = h - 34, inches = M.floor((w - 28) / ppi * 8) / 8;
      S.line(rx, ry, rx + inches * ppi, ry, k.ink, 1.5);
      for (var i = 0; i <= inches * 8; i++) { var x = rx + i * ppi / 8, big = i % 8 === 0, mid = i % 4 === 0; S.line(x, ry, x, ry - (big ? 14 : mid ? 10 : i % 2 === 0 ? 7 : 4), k.ink, big ? 1.5 : 1); if (big) S.txt(i ? (i / 8) + ' in' : '0', x, ry + 12, { align: 'center', size: 11, color: k.muted }); }
      var y = 26;
      S.txt(c.n + ': ' + c.s, 14, 14, { w: 700 });
      var top = 34;
      if (c.t === 'stick') { var L = c.d[2] * ppi, T = M.max(1, c.d[0] * ppi); for (var j = 0; j < 4; j++) S.rect(14, top + 6 + j * (T + 8), L, T, veg, vegS, 1); }
      else if (c.t === 'cube') { var Sz = M.max(1, c.d[0] * ppi), n = M.min(10, M.floor((w - 28) / (Sz + 6))); for (var q = 0; q < n; q++) { S.rect(14 + q * (Sz + 6), top + 8, Sz, Sz, veg, vegS, 1); } }
      else if (c.t === 'flat') { var P = c.d[0] * ppi, th = M.max(1, c.d[1] * ppi); for (var m = 0; m < 4; m++) { S.rect(14 + m * (P + 10), top + 8, P, P, veg, vegS, 2); } S.rect(14, top + 18 + P, P, th, veg, vegS, 1); S.txt('side view: ⅛ in thick', 22 + P, top + 18 + P + th / 2, { size: 11, color: k.muted, w: 500 }); }
      else { var D0 = c.d[0] * ppi; for (var r = 0; r < 3; r++) S.circ(14 + D0 / 2 + r * (D0 + 10), top + 8 + D0 / 2, D0 / 2, veg, vegS); S.rect(14 + 3 * (D0 + 10), top + 8, c.d[1] * ppi, D0, veg, vegS, 2); }
      S.ro.set('<b>' + c.n + '</b>: ' + c.s + '. Lay your pieces on the screen to compare' + (ppi === 96 ? ' (calibrate first if the inch marks don\'t match a ruler).' : '.'));
      S.say(c.n + ' drawn at true size, ' + c.s);
    };
    S.redraw();
  });

  // ============================================================ cu-angle
  V.register('cu-angle', function (el0, opts) {
    var S = scene(el0, { aspect: 1.8, max: 300, label: 'Sharpening angle' });
    var ang = clamp(nm(opts.angle, 15), 8, 30), bh = 1.5;
    V.slider(S.ctl, { label: 'Angle per side', min: 8, max: 30, step: 1, value: ang, fmt: function (v) { return v + '°'; }, input: function (v) { ang = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Blade height', min: 1, max: 2.5, step: 0.05, value: bh, fmt: function (v) { return V.fmt(v, 2) + ' in'; }, input: function (v) { bh = v; S.redraw(); } });
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, g = S.ctx;
      // left: edge close-up
      var cx = w * 0.24, by = h - 30, sc = M.min(w * 0.18, h * 0.5);
      var a = ang * M.PI / 180, half = M.tan(a) * sc * 0.9;
      S.poly([[cx, by], [cx - half, by - sc * 0.9], [cx - half * 0.9, by - sc * 1.5], [cx + half * 0.9, by - sc * 1.5], [cx + half, by - sc * 0.9]], k.ink, 1.5, dark() ? '#5a6b75' : '#c9d2d8');
      S.line(cx, by, cx, by - sc * 1.1, k.muted, 1, [4, 4]);
      S.txt(ang + '°', cx + half / 2 + 8, by - sc * 0.55, { color: k.red, w: 700 });
      S.txt(ang + '°', cx - half / 2 - 8, by - sc * 0.55, { color: k.red, w: 700, align: 'right' });
      S.txt('Edge, end view', cx, 14, { align: 'center', color: k.muted, w: 500 });
      // right: blade on stone
      var sx = w * 0.5, sw = w * 0.46, sy = h - 26;
      S.rect(sx, sy, sw, 14, dark() ? '#7a6a55' : '#b59b76', null, 3); S.txt('stone', sx + sw - 6, sy + 7, { align: 'right', size: 11, color: '#fff', w: 600 });
      var len = sw * 0.8, px = sx + 12, py = sy;
      var hpx = M.min(sw * 0.8, bh * 60), lift = M.sin(a) * hpx;
      // blade as a tilted rectangle: edge on the stone, spine raised
      var ex = px + 10, ey = py, sxp = ex + M.cos(a) * hpx, syp = py - lift;
      S.poly([[ex, ey], [ex + len * 0.6, ey], [sxp + len * 0.6, syp], [sxp, syp]], k.ink, 1.5, dark() ? '#5a6b75' : '#c9d2d8');
      S.line(sxp + len * 0.6 + 6, syp, sxp + len * 0.6 + 6, ey, k.blue, 2);
      var inch = M.sin(a) * bh, coins = inch / 0.069;
      S.txt(V.fmt(inch, 2) + ' in', sxp + len * 0.6 + 10, (syp + ey) / 2, { color: k.blue, w: 700 });
      S.txt('Blade on the stone, side view', sx + sw / 2, 14, { align: 'center', color: k.muted, w: 500 });
      S.ro.set('Angle ' + ang + '° per side, <b>' + 2 * ang + '° in all</b>. For a ' + V.fmt(bh, 2) + '-inch blade, lift the spine about <b>' + V.fmt(inch, 2) + ' inch</b>, about ' + M.round(coins) + ' stacked U.S. quarters (each about 0.069 inch thick). ' + (ang <= 15 ? 'A fine edge that cuts easily but needs gentle use.' : ang >= 22 ? 'A sturdy edge that lasts longer but cuts with more effort.' : 'A common, all-round edge.'));
      S.say('Edge at ' + ang + ' degrees per side; spine height ' + V.fmt(inch, 2) + ' inch');
    };
    S.redraw();
  });

  // ============================================================ cu-cool
  V.register('cu-cool', function (el0, opts) {
    var mode = opts.mode === 'zone' ? 'zone' : 'check';
    var S = scene(el0, { aspect: mode === 'zone' ? 2.2 : 1.6, max: 340, label: mode === 'zone' ? 'The temperature danger zone' : 'Two-stage cooling checker' });
    var t70 = 1.5, t41 = 4.5;
    if (mode === 'check') {
      var s1 = V.slider(S.ctl, { label: 'Hours to reach 70°F', min: 0.25, max: 6, step: 0.25, value: t70, fmt: function (v) { return V.fmt(v) + ' h'; }, input: function (v) { t70 = v; if (t41 <= t70) { t41 = t70 + 0.25; s2.set(t41); } S.redraw(); } });
      var s2 = V.slider(S.ctl, { label: 'Hours to reach 41°F (from 135°F)', min: 0.5, max: 12, step: 0.25, value: t41, fmt: function (v) { return V.fmt(v) + ' h'; }, input: function (v) { t41 = M.max(v, t70 + 0.25); S.redraw(); } });
      [['Full stockpot in the walk-in', 5, 11], ['Shallow pans, uncovered', 1.5, 4.5], ['Ice-water bath, stirred', 0.75, 2.5], ['Fast first stage, slow second', 1.75, 7]].forEach(function (p) { V.button(S.ctl, p[0], function () { t70 = p[1]; t41 = p[2]; s1.set(t70); s2.set(t41); S.redraw(); }); });
    }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h;
      if (mode === 'zone') {
        var x0 = 70, x1 = w - 20, y = h * 0.5, T0 = 0, T1 = 212, X = function (t) { return x0 + (t - T0) / (T1 - T0) * (x1 - x0); };
        S.rect(X(0), y - 16, X(212) - X(0), 32, k.panel, k.axis, 16);
        S.rect(X(41), y - 16, X(135) - X(41), 32, k.redSoft, null, 0);
        S.rect(X(40), y + 22, X(140) - X(40), 10, k.goldSoft, null, 4);
        [0, 32, 41, 70, 135, 165, 212].forEach(function (t) { S.line(X(t), y - 20, X(t), y + 20, k.axis, 1); S.txt(t + '°F', X(t), y - 30, { align: 'center', size: 11, color: k.muted }); });
        S.txt('Food Code: 41°F to 135°F', X(88), y, { align: 'center', w: 700, color: k.red });
        S.txt('USDA, for home cooks: 40°F to 140°F', X(90), y + 44, { align: 'center', size: 11, color: k.gold, w: 600 });
        S.txt('cold holding', X(20), y, { align: 'center', size: 11, color: k.blue });
        S.txt('hot holding', X(175), y, { align: 'center', size: 11, color: k.orange });
        S.ro.set('Bacteria grow fastest in the danger zone. Restaurants (FDA Food Code): hold cold food at 41°F or below and hot food at 135°F or above. Home cooks (USDA): 40°F to 140°F, and no more than 2 hours out (1 hour above 90°F).');
        S.say('Danger zone diagram'); return;
      }
      var gx = 44, gy = 16, gw = w - gx - 14, gh = h - gy - 34, tmax = 12;
      var X2 = function (t) { return gx + t / tmax * gw; }, Y = function (T) { return gy + gh - (T - 30) / (140 - 30) * gh; };
      S.rect(gx, gy, gw, gh, k.panel, null);
      S.rect(gx, Y(135), gw, Y(41) - Y(135), k.redSoft, null);
      for (var t = 0; t <= tmax; t += 2) { S.line(X2(t), gy + gh, X2(t), gy + gh + 4, k.axis, 1); S.txt(t + ' h', X2(t), gy + gh + 14, { align: 'center', size: 11, color: k.muted }); }
      [41, 70, 135].forEach(function (T) { S.line(gx, Y(T), gx + gw, Y(T), k.axis, 1, [3, 4]); S.txt(T + '°F', gx - 4, Y(T), { align: 'right', size: 11, color: k.muted }); });
      // limits
      S.line(X2(2), Y(70), X2(2), Y(135), k.gold, 2, [6, 4]); S.txt('2 h', X2(2) + 4, Y(130), { size: 11, color: k.gold, w: 700 });
      S.line(X2(6), Y(41), X2(6), Y(135), k.gold, 2, [6, 4]); S.txt('6 h', X2(6) + 4, Y(130), { size: 11, color: k.gold, w: 700 });
      // curve: 135 at 0, 70 at t70, 41 at t41 (smooth exponential-looking segments)
      var pts = [], i;
      for (i = 0; i <= 30; i++) { var u = i / 30; pts.push([X2(u * t70), Y(135 - (135 - 70) * (1 - M.pow(1 - u, 1.6)))]); }
      for (i = 1; i <= 30; i++) { var v = i / 30; pts.push([X2(t70 + v * (t41 - t70)), Y(70 - (70 - 41) * (1 - M.pow(1 - v, 1.6)))]); }
      var ok1 = t70 <= 2, ok2 = t41 <= 6;
      S.poly(pts.map(function (p) { return [p[0], clamp(p[1], gy - 4, gy + gh + 4)]; }), ok1 && ok2 ? k.green : k.red, 3);
      S.circ(X2(t70), Y(70), 5, ok1 ? k.green : k.red); if (t41 <= tmax) S.circ(X2(t41), Y(41), 5, ok2 ? k.green : k.red);
      S.ro.set('Stage 1, 135°F to 70°F: <b>' + V.fmt(t70) + ' h</b> (limit 2 h) ' + (ok1 ? '✓' : '✗') + '. All the way to 41°F: <b>' + V.fmt(t41) + ' h</b> (limit 6 h) ' + (ok2 ? '✓' : '✗') + '. ' + (ok1 && ok2 ? '<b>Passes</b> the Food Code\'s two-stage rule.' : '<b>Fails.</b> By the Food Code, reheat to 165°F and cool again, or discard, as your health department\'s rules say.'));
      S.say('Cooling curve: ' + (ok1 && ok2 ? 'passes' : 'fails'));
    };
    S.redraw();
  });

  // ============================================================ cu-temps (quiz)
  var TEMPS = [['Whole chicken', 165], ['Ground turkey', 165], ['Chicken wings', 165], ['Stuffing (cooked in or out of the bird)', 165], ['Duck breast', 165], ['Leftover chili, reheated', 165], ['Meat casserole', 165],
    ['Ground beef burgers', 160], ['Pork sausage (ground)', 160], ['Ground lamb', 160], ['Quiche or frittata', 160], ['Beef steak', 145], ['Pork chops', 145], ['Lamb roast', 145], ['Veal chop', 145], ['Salmon fillet', 145], ['Fresh (raw) ham', 145]];
  V.register('cu-temps', function (el0) {
    var w = wrap(el0, 'Safe temperature quiz');
    var q = el('p', 'cuv-big'), btns = el('div', 'cuv-btns'), fb = el('p', 'cuv-fb'), sc = el('p', 'cuv-note'); fb.setAttribute('aria-live', 'polite');
    w.appendChild(q); w.appendChild(btns); w.appendChild(fb); w.appendChild(sc);
    var ctl = el('div', 'ml-ctl'); w.appendChild(ctl);
    var tbl = el('div', 'cuv-out'); tbl.hidden = true; w.appendChild(tbl);
    var order = [], idx = 0, right = 0, done = 0, cur = null, answered = false;
    function shuffle() { order = TEMPS.slice(); for (var i = order.length - 1; i > 0; i--) { var j = M.floor(M.random() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; } idx = 0; }
    function next() {
      if (idx >= order.length) shuffle(); cur = order[idx++]; answered = false; q.innerHTML = 'USDA safe minimum internal temperature for: <b>' + esc(cur[0]) + '</b>?'; fb.textContent = ''; btns.innerHTML = '';
      [145, 155, 160, 165].forEach(function (t) { var b = el('button', 'ml-btn', t + '°F'); b.type = 'button'; b.addEventListener('click', function () { pick(t, b); }); btns.appendChild(b); });
    }
    function pick(t, b) {
      if (answered) return; answered = true; done++; var ok = t === cur[1]; if (ok) right++;
      b.classList.add(ok ? 'cuv-ok' : 'cuv-no');
      fb.innerHTML = (ok ? '✓ Right: ' : '✗ It\'s ') + '<b>' + cur[1] + '°F</b>' + (cur[1] === 145 && !/Salmon/.test(cur[0]) ? ', with a 3-minute rest.' : '.') + (cur[1] === 160 && /beef|lamb|sausage/i.test(cur[0]) ? ' (Restaurants follow the Food Code: 155°F for 17 seconds.)' : '');
      sc.textContent = 'Score: ' + right + ' of ' + done;
    }
    V.button(ctl, 'Next food', next);
    var tb = V.button(ctl, 'Show the table', function () { tbl.hidden = !tbl.hidden; tb.textContent = tbl.hidden ? 'Show the table' : 'Hide the table'; });
    tbl.innerHTML = '<table class="cuv-tbl"><thead><tr><th scope="col">Food</th><th scope="col">USDA safe minimum</th></tr></thead><tbody>' +
      [['Poultry: whole, parts, ground; stuffing; leftovers; casseroles', '165°F'], ['Ground beef, pork, veal, lamb; egg dishes', '160°F'], ['Beef, pork, veal, lamb steaks, chops, roasts', '145°F + 3-minute rest'], ['Fish', '145°F'], ['Fresh (raw) ham', '145°F + 3-minute rest']].map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table><p class="cuv-note">Source: USDA Food Safety and Inspection Service.</p>';
    shuffle(); next();
  });

  // ============================================================ cu-shelf
  V.register('cu-shelf', function (el0) {
    var w = wrap(el0, 'Refrigerator storage order');
    var ITEMS = [['Ready-to-eat food (salad, cooked dishes)', 0], ['Raw fish', 1], ['Raw whole cuts of beef and pork', 2], ['Raw ground meat', 3], ['Raw poultry', 4]];
    var list = el('ol', 'cuv-shelf'), fb = el('p', 'cuv-fb'); fb.setAttribute('aria-live', 'polite');
    w.appendChild(el('p', 'cuv-note', 'Top shelf first. Use the arrows to move each food, then check.')); w.appendChild(list);
    var ctl = el('div', 'ml-ctl'); w.appendChild(ctl); w.appendChild(fb);
    var cur = [];
    function shuffle() { cur = ITEMS.slice(); do { for (var i = cur.length - 1; i > 0; i--) { var j = M.floor(M.random() * (i + 1)), t = cur[i]; cur[i] = cur[j]; cur[j] = t; } } while (cur.every(function (x, i) { return x[1] === i; })); fb.textContent = ''; draw(); }
    function draw() {
      list.innerHTML = '';
      cur.forEach(function (it, i) {
        var li = el('li', 'cuv-shelf-row'); li.appendChild(el('span', 'cuv-shelf-lab', esc(it[0])));
        var up = el('button', 'ml-btn', '↑'), dn = el('button', 'ml-btn', '↓'); up.type = dn.type = 'button';
        up.setAttribute('aria-label', 'Move ' + it[0] + ' up'); dn.setAttribute('aria-label', 'Move ' + it[0] + ' down'); up.disabled = i === 0; dn.disabled = i === cur.length - 1;
        up.addEventListener('click', function () { var t = cur[i - 1]; cur[i - 1] = cur[i]; cur[i] = t; draw(); up2(i - 1); });
        dn.addEventListener('click', function () { var t = cur[i + 1]; cur[i + 1] = cur[i]; cur[i] = t; draw(); up2(i + 1); });
        li.appendChild(up); li.appendChild(dn); list.appendChild(li);
      });
    }
    function up2(i) { var b = list.children[i] && list.children[i].querySelector('button:not([disabled])'); if (b) b.focus(); }
    V.button(ctl, 'Check', function () {
      var wrong = cur.filter(function (x, i) { return x[1] !== i; }).length;
      fb.innerHTML = wrong ? '✗ ' + wrong + ' food' + (wrong > 1 ? 's are' : ' is') + ' on the wrong shelf. Think: which must be cooked hottest? That one goes lowest, so its drips land on nothing that won\'t be cooked as hot.' : '✓ <b>Safe order.</b> Top to bottom by the temperature each must be cooked to: ready-to-eat, fish (145°F), whole cuts (145°F), ground meat (155°F in restaurants), poultry (165°F).';
    });
    V.button(ctl, 'Mix them up', shuffle);
    shuffle();
  });

  // ============================================================ cu-carry
  V.register('cu-carry', function (el0, opts) {
    var mode = opts.mode === 'roast' ? 'roast' : 'carry';
    var S = scene(el0, { aspect: 1.7, max: 330, label: mode === 'roast' ? 'Slice of a roast' : 'Carryover cooking' });
    var oven = mode === 'roast' ? 450 : 375, pull = 128, size = 'roast';
    V.slider(S.ctl, { label: 'Oven temperature', min: 250, max: 500, step: 25, value: oven, fmt: function (v) { return v + '°F'; }, input: function (v) { oven = v; S.redraw(); } });
    if (mode === 'carry') {
      V.slider(S.ctl, { label: 'Pull temperature (center)', min: 110, max: 160, step: 1, value: pull, fmt: function (v) { return v + '°F'; }, input: function (v) { pull = v; S.redraw(); } });
      V.seg(S.ctl, { label: 'Size', items: [['steak', 'Steak'], ['roast', 'Pork loin'], ['big', 'Large rib roast']], value: size, change: function (v) { size = v; S.redraw(); } });
    }
    function rise() { var base = { steak: 4, roast: 8, big: 13 }[size]; return M.round(base * clamp((oven - 200) / 200, 0.4, 1.5)); }
    function word(T) { return T < 120 ? 'very rare' : T < 126 ? 'rare' : T < 135 ? 'medium-rare' : T < 145 ? 'medium' : T < 155 ? 'medium-well' : 'well done'; }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h;
      if (mode === 'roast') {
        var cx = w / 2, cy = h / 2 + 6, R = M.min(w * 0.36, h * 0.42), band = clamp((oven - 225) / 275, 0.05, 1) * 0.5;
        var g = S.ctx, grd = g.createRadialGradient(cx, cy, 0, cx, cy, R);
        var pink = dark() ? '#e77f8e' : '#e8798a', gray = dark() ? '#8d7f78' : '#9c8b83', crust = dark() ? '#6b3e1f' : '#7a4320';
        grd.addColorStop(0, pink); grd.addColorStop(clamp(1 - band - 0.08, 0.2, 0.92), pink); grd.addColorStop(clamp(1 - band, 0.25, 0.95), gray); grd.addColorStop(0.97, gray); grd.addColorStop(1, crust);
        g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 2 * M.PI); g.fillStyle = grd; g.fill(); g.lineWidth = 3; g.strokeStyle = crust; g.stroke(); g.restore();
        S.txt('A slice through the middle, center at the same final temperature', cx, 14, { align: 'center', color: k.muted, w: 500 });
        S.ro.set('Oven at <b>' + oven + '°F</b>: the gray, overcooked band is ' + (band > 0.3 ? 'thick' : band > 0.15 ? 'moderate' : 'thin') + '. Lower oven temperatures cook more evenly from edge to center; higher ones brown faster. (A simple picture to show the idea.)');
        S.say('Roast slice at oven ' + oven + ' degrees'); return;
      }
      var gx = 44, gy = 16, gw = w - gx - 12, gh = h - gy - 34, tmax = 60, T0 = 35, T1 = 175;
      var X = function (t) { return gx + t / tmax * gw; }, Y = function (T) { return gy + gh - (T - T0) / (T1 - T0) * gh; };
      S.rect(gx, gy, gw, gh, k.panel, null);
      [40, 60, 80, 100, 120, 140, 160].forEach(function (T) { S.line(gx, Y(T), gx + gw, Y(T), k.grid, 1); S.txt(T + '°', gx - 4, Y(T), { align: 'right', size: 11, color: k.muted }); });
      S.line(gx, Y(145), gx + gw, Y(145), k.gold, 1.5, [5, 4]); S.txt('USDA 145°F', gx + gw - 4, Y(145) - 8, { align: 'right', size: 11, color: k.gold, w: 700 });
      var tp = 40, rr = rise(), peak = pull + rr, pts = [], i;
      for (i = 0; i <= 40; i++) { var u = i / 40; pts.push([X(u * tp), Y(40 + (pull - 40) * (1 - M.exp(-3 * u)) / (1 - M.exp(-3)))]); }
      var tpk = { steak: 4, roast: 10, big: 16 }[size];
      for (i = 1; i <= 40; i++) { var t = i / 40 * (tmax - tp), T = t < tpk ? pull + rr * M.sin(t / tpk * M.PI / 2) : peak - (t - tpk) * 0.25; pts.push([X(tp + t), Y(T)]); }
      S.poly(pts.map(function (p) { return [p[0], clamp(p[1], gy, gy + gh)]; }), k.red, 3);
      S.line(X(tp), gy, X(tp), gy + gh, k.axis, 1, [3, 3]); S.txt('out of the oven', X(tp) - 4, gy + 10, { align: 'right', size: 11, color: k.muted });
      S.circ(X(tp + tpk), Y(peak), 5, k.red);
      S.txt('time →', gx + gw, gy + gh + 14, { align: 'right', size: 11, color: k.muted, w: 500 });
      S.ro.set('Pulled at <b>' + pull + '°F</b>; the center climbs about <b>' + rr + '°F</b> while resting, to about <b>' + peak + '°F</b> (' + word(peak) + '). Bigger roasts and hotter ovens carry over more. A simple model to show the idea; real meat varies, so use a thermometer.');
      S.say('Carryover: pulled at ' + pull + ', peaks near ' + peak);
    };
    S.redraw();
  });

  // ============================================================ cu-sauces
  var MOM = {
    bechamel: { n: 'Béchamel', l: 'Milk', t: 'White roux', kids: ['Mornay (cheese)', 'Soubise (onion purée)', 'Cream sauce (cream)', 'Cheddar cheese sauce'], r: 'recipes/bechamel-sauce/' },
    veloute: { n: 'Velouté', l: 'White stock (chicken, veal or fish)', t: 'Blond roux', kids: ['Suprême (chicken velouté + cream)', 'Allemande (yolks and cream)', 'Bercy (fish velouté, shallots, white wine)', 'Mushroom sauce'], r: 'recipes/chicken-veloute/' },
    espagnole: { n: 'Espagnole (brown sauce)', l: 'Brown stock, with mirepoix and tomato', t: 'Brown roux', kids: ['Demi-glace (reduced with brown stock)', 'Bordelaise (red wine, shallots)', 'Chasseur (mushrooms, shallots, white wine, tomato)', 'Robert (onion, white wine, mustard)'], r: 'recipes/espagnole-demi-glace/' },
    tomato: { n: 'Tomato sauce', l: 'Tomatoes with aromatics (classically stock)', t: 'Reduction (classically a roux too)', kids: ['Creole (onions, peppers, celery)', 'Portuguese (tomatoes, onion, garlic)', 'Provençale (garlic, olive oil, herbs)', 'Marinara (an Italian cousin)'], r: 'recipes/escoffier-tomato-sauce/' },
    hollandaise: { n: 'Hollandaise', l: 'Butter', t: 'Emulsified into egg yolks with lemon or a reduction', kids: ['Béarnaise (tarragon, shallot reduction)', 'Maltaise (blood orange)', 'Mousseline (whipped cream folded in)', 'Choron (béarnaise with tomato)'], r: 'recipes/hollandaise-sauce/' }
  };
  V.register('cu-sauces', function (el0, opts) {
    var w = wrap(el0, 'The five mother sauces');
    var btns = el('div', 'cuv-btns cuv-moms'), panel = el('div', 'cuv-card'); panel.setAttribute('aria-live', 'polite');
    w.appendChild(btns); w.appendChild(panel);
    var cur = MOM[opts.open] ? opts.open : 'bechamel', bs = {};
    Object.keys(MOM).forEach(function (k) { var b = el('button', 'ml-btn', MOM[k].n.replace(/ \(.*/, '')); b.type = 'button'; b.addEventListener('click', function () { show(k); }); bs[k] = b; btns.appendChild(b); });
    function show(k) {
      cur = k; var m = MOM[k]; Object.keys(bs).forEach(function (x) { bs[x].setAttribute('aria-pressed', String(x === k)); });
      panel.innerHTML = '<h4>' + m.n + '</h4><p class="cuv-eq"><span>' + m.l + '</span> <b>+</b> <span>' + m.t + '</span></p><p><b>Small sauces:</b></p><ul>' + m.kids.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul><p><a href="/meal-prep/' + m.r + '">Make it: the Meal Prep recipe, adapted from Escoffier</a></p>';
    }
    show(cur);
  });

  // ============================================================ cu-bakers
  var FORM = {
    lean: { n: 'Lean bread', rows: [['Bread flour', 100], ['Water', 68], ['Salt', 2], ['Instant yeast', 1]] },
    pizza: { n: 'Pizza dough', rows: [['Bread flour', 100], ['Water', 65], ['Salt', 2.5], ['Instant yeast', 0.5], ['Olive oil', 3]] },
    focaccia: { n: 'Focaccia', rows: [['Bread flour', 100], ['Water', 80], ['Salt', 2.2], ['Instant yeast', 1], ['Olive oil', 6]] },
    brioche: { n: 'Brioche', rows: [['Bread flour', 100], ['Eggs', 50], ['Milk', 10], ['Butter', 50], ['Sugar', 12], ['Salt', 2], ['Instant yeast', 1.5]] },
    pie: { n: 'Pie dough 3-2-1', rows: [['Pastry flour', 100], ['Cold butter', 66.7], ['Ice water', 33.3], ['Salt', 1.5]] }
  };
  V.register('cu-bakers', function (el0, opts) {
    var w = wrap(el0, 'Baker\'s percentage calculator');
    var pre = FORM[opts.preset] ? opts.preset : 'lean', by = 'flour', amt = 1000, rows = [];
    var ctl = el('div', 'ml-ctl'); w.appendChild(ctl);
    V.seg(ctl, { label: 'Formula', items: Object.keys(FORM).map(function (k) { return [k, FORM[k].n]; }), value: pre, change: function (v) { pre = v; load(); } });
    var row = el('div', 'cuv-row'); w.appendChild(row);
    var mode = V.seg(row, { label: 'Start from', items: [['flour', 'Flour weight'], ['dough', 'Dough weight']], value: by, change: function (v) { by = v; draw(); } });
    var inp = numIn(row, 'Grams', amt, { min: 1, input: function (v) { amt = v; draw(); } });
    var out = el('div', 'cuv-out'); w.appendChild(out);
    function load() { rows = FORM[pre].rows.map(function (r) { return [r[0], r[1]]; }); draw(); }
    function draw() {
      var tot = rows.reduce(function (a, r) { return a + (+r[1] || 0); }, 0), fl = by === 'flour' ? amt : amt * 100 / tot;
      var h = '<table class="cuv-tbl"><thead><tr><th scope="col">Ingredient</th><th scope="col">Baker\'s %</th><th scope="col">Grams</th></tr></thead><tbody>';
      rows.forEach(function (r, i) { h += '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + (i === 0 ? '100%' : '<input type="number" class="cuv-pct" data-i="' + i + '" value="' + r[1] + '" step="0.1" min="0" aria-label="' + esc(r[0]) + ' percent">%') + '</td><td><b>' + (fl * r[1] / 100 >= 100 ? M.round(fl * r[1] / 100) : r2(fl * r[1] / 100)) + ' g</b></td></tr>'; });
      h += '</tbody><tfoot><tr><th scope="row">Total</th><td>' + r2(tot) + '%</td><td><b>' + M.round(fl * tot / 100) + ' g</b></td></tr></tfoot></table>';
      var water = rows.filter(function (r) { return /water|milk/i.test(r[0]); }).reduce(function (a, r) { return a + (+r[1]); }, 0);
      h += '<p class="cuv-note">Flour is always 100%. ' + (water ? 'Hydration from water and milk: about ' + r2(water) + '%. ' : '') + (by === 'dough' ? 'Flour = dough ÷ (total ÷ 100) = ' + amt + ' ÷ ' + r2(tot / 100) + ' ≈ ' + M.round(fl) + ' g.' : '') + '</p>';
      out.innerHTML = h;
      Array.prototype.forEach.call(out.querySelectorAll('.cuv-pct'), function (x) { x.addEventListener('change', function () { rows[+x.getAttribute('data-i')][1] = M.max(0, +x.value || 0); draw(); }); });
    }
    load();
  });

  // ============================================================ cu-sugar
  var STG = [[230, 235, 'Thread', 'syrups, some glazes', 80], [235, 240, 'Soft ball', 'fudge, fondant, pralines', 85], [245, 250, 'Firm ball', 'caramels', 87], [250, 265, 'Hard ball', 'nougat, marshmallows, divinity', 92], [270, 290, 'Soft crack', 'taffy, butterscotch', 95], [300, 310, 'Hard crack', 'lollipops, brittle, spun sugar', 99], [320, 349, 'Caramel', 'caramel sauce, pralines, spun caramel (clear near 320°F, brown near 338°F)', 100], [350, 400, 'Burnt', 'too far: bitter', 100]];
  V.register('cu-sugar', function (el0) {
    var S = scene(el0, { aspect: 2.5, max: 240, min: 170, label: 'Candy thermometer' });
    var T = 240, alt = 0;
    V.slider(S.ctl, { label: 'Syrup temperature', min: 212, max: 360, step: 1, value: T, fmt: function (v) { return v + '°F'; }, input: function (v) { T = v; S.redraw(); } });
    V.slider(S.ctl, { label: 'Height above sea level', min: 0, max: 8000, step: 500, value: 0, fmt: function (v) { return v.toLocaleString() + ' ft'; }, input: function (v) { alt = v; S.redraw(); } });
    function stageAt(t) { var s = t + alt / 500; for (var i = 0; i < STG.length; i++) if (s >= STG[i][0] && s <= STG[i][1]) return STG[i]; return null; }
    S.draw = function () {
      var k = S.k, w = S.c.w, h = S.c.h, x0 = 40, x1 = w - 20, y = h * 0.42;
      var X = function (t) { return x0 + (t - 212) / (360 - 212) * (x1 - x0); }, off = alt / 500;
      S.rect(x0 - 6, y - 12, x1 - x0 + 12, 24, k.panel, k.axis, 12);
      STG.forEach(function (s, i) { var a = X(s[0] - off), b = X(M.min(360, s[1] - off)); if (b < x0) return; S.rect(M.max(x0, a), y - 10, b - M.max(x0, a), 20, ['#f7e7a1', '#f3d97a', '#efc955', '#e8b13a', '#d98f2b', '#c4701e', '#9c4f12', '#4a2a10'][i], null, 0); });
      [212, 240, 270, 300, 330, 360].forEach(function (t) { S.line(X(t), y + 12, X(t), y + 18, k.axis, 1); S.txt(t + '°', X(t), y + 28, { align: 'center', size: 11, color: k.muted }); });
      S.line(X(T), y - 22, X(T), y + 14, k.red, 3); S.circ(X(T), y - 24, 5, k.red);
      var st = stageAt(T);
      var col = T + off < 320 ? (dark() ? '#e6ece8' : '#f5f2e8') : T + off < 338 ? '#d99a3c' : T + off < 350 ? '#9c4f12' : '#3a1d08';
      S.circ(x0 + 18, h - 40, 18, col, k.axis); S.txt('syrup color', x0 + 44, h - 40, { size: 11, color: k.muted, w: 500 });
      S.txt(st ? st[2] : 'Between stages', w / 2, h - 40, { align: 'center', w: 700, size: 15 });
      S.ro.set('At <b>' + T + '°F</b>' + (alt ? ' and ' + alt.toLocaleString() + ' feet (about ' + V.fmt(off, 0) + '°F lower than sea level)' : ' at sea level') + ': ' + (st ? '<b>' + st[2] + '</b> stage, about ' + st[4] + '% sugar, used for ' + st[3] + '.' : 'between named stages; keep cooking and watching.') + ' Ranges from the Exploratorium.');
      S.say(T + ' degrees: ' + (st ? st[2] : 'between stages'));
    };
    S.redraw();
  });

  // ============================================================ cu-cost
  V.register('cu-cost', function (el0, opts) {
    var w = wrap(el0, 'Food cost calculator');
    var mode = opts.mode === 'price' ? 'price' : 'recipe';
    if (mode === 'price') {
      var row = el('div', 'cuv-row'); w.appendChild(row);
      var c = numIn(row, 'Portion cost ($)', 4.2, { min: 0, step: 0.01, input: dp }), p = numIn(row, 'Target food cost (%)', 30, { min: 1, max: 100, input: dp });
      var o = el('div', 'cuv-out'); o.setAttribute('aria-live', 'polite'); w.appendChild(o);
      function dp() { var cc = +c.value, pp = +p.value; o.innerHTML = cc >= 0 && pp > 0 ? '<p class="cuv-big">Menu price = ' + money(cc) + ' ÷ ' + r2(pp / 100) + ' = <b>' + money(cc / (pp / 100)) + '</b></p><p class="cuv-note">Chefs then round to a sensible price and compare with similar dishes nearby.</p>' : '<p class="cuv-bad">Enter a cost and a percent above zero.</p>'; }
      dp(); return;
    }
    var rows = opts.rows || [['Beef tenderloin', 'lb', 18, 70, 2.5], ['Shallots', 'lb', 4, 85, 0.25], ['Butter', 'lb', 5, 100, 0.25], ['Red wine', 'bottle', 12, 100, 0.25], ['Potatoes', 'lb', 1.2, 80, 2], ['Green beans', 'lb', 3.5, 88, 1]];
    var top = el('div', 'cuv-row'); w.appendChild(top);
    var por = numIn(top, 'Portions', 6, { min: 1, input: draw }), price = numIn(top, 'Menu price ($)', 34, { min: 0, step: 0.5, input: draw });
    var out = el('div', 'cuv-out'); w.appendChild(out);
    function draw() {
      var tot = 0, h = '<div class="cuv-scroll" tabindex="0" role="region" aria-label="Recipe cost table"><table class="cuv-tbl cuv-cost"><thead><tr><th scope="col">Ingredient</th><th scope="col">Price as bought</th><th scope="col">Yield %</th><th scope="col">Amount</th><th scope="col">Cost</th></tr></thead><tbody>';
      rows.forEach(function (r, i) { var ep = r[2] / (r[3] / 100), cost = ep * r[4]; tot += cost;
        h += '<tr><th scope="row">' + esc(r[0]) + '</th><td>$<input type="number" step="0.05" min="0" data-i="' + i + '" data-f="2" value="' + r[2] + '" aria-label="' + esc(r[0]) + ' price per ' + r[1] + '"> /' + r[1] + '</td><td><input type="number" step="1" min="1" max="100" data-i="' + i + '" data-f="3" value="' + r[3] + '" aria-label="' + esc(r[0]) + ' yield percent"></td><td><input type="number" step="0.05" min="0" data-i="' + i + '" data-f="4" value="' + r[4] + '" aria-label="' + esc(r[0]) + ' amount in ' + r[1] + '"> ' + r[1] + '</td><td>' + money(cost) + '</td></tr>'; });
      var n = M.max(1, +por.value || 1), pc = tot / n, pr = +price.value;
      h += '</tbody></table></div><p class="cuv-big">Recipe cost <b>' + money(tot) + '</b> · per portion <b>' + money(pc) + '</b>' + (pr > 0 ? ' · food cost <b>' + V.fmt(100 * pc / pr, 1) + '%</b>' : '') + '</p><p class="cuv-note">Usable cost = price ÷ yield. Food cost % = portion cost ÷ menu price. At 30%, this dish would sell for about ' + money(pc / 0.3) + '.</p>';
      out.innerHTML = h;
      Array.prototype.forEach.call(out.querySelectorAll('input'), function (x) { x.addEventListener('change', function () { rows[+x.getAttribute('data-i')][+x.getAttribute('data-f')] = M.max(+x.getAttribute('data-f') === 3 ? 1 : 0, +x.value || 0); draw(); }); });
    }
    draw();
  });

  // ============================================================ cu-plate
  V.register('cu-plate', function (el0) {
    var S = scene(el0, { aspect: 1.25, max: 420, min: 260, label: 'A plate to arrange' });
    var guide = 'thirds', P = [
      { n: 'Protein', x: 0.5, y: 0.72, r: 0.15, c: 'meat' }, { n: 'Starch', x: 0.33, y: 0.36, r: 0.11, c: 'starch' }, { n: 'Vegetable', x: 0.68, y: 0.36, r: 0.1, c: 'veg' },
      { n: 'Sauce', x: 0.38, y: 0.62, r: 0.035, c: 'sauce' }, { n: 'Sauce', x: 0.32, y: 0.68, r: 0.03, c: 'sauce' }, { n: 'Sauce', x: 0.29, y: 0.75, r: 0.025, c: 'sauce' }, { n: 'Garnish', x: 0.55, y: 0.58, r: 0.03, c: 'herb' }];
    V.seg(S.ctl, { label: 'Guide', items: [['thirds', 'Thirds grid'], ['clock', 'Clock'], ['none', 'None']], value: guide, change: function (v) { guide = v; S.redraw(); } });
    V.button(S.ctl, 'Crowd it', function () { P.forEach(function (p, i) { p.x = 0.5 + 0.08 * M.cos(i); p.y = 0.5 + 0.08 * M.sin(i * 1.7); }); S.redraw(); });
    V.button(S.ctl, 'Classic clock', function () { var L = [[0.5, 0.72], [0.33, 0.36], [0.68, 0.36], [0.38, 0.6], [0.33, 0.66], [0.3, 0.72], [0.55, 0.6]]; P.forEach(function (p, i) { p.x = L[i][0]; p.y = L[i][1]; }); S.redraw(); });
    var geo = function () { var w = S.c.w, h = S.c.h, R = M.min(w, h) * 0.46; return { cx: w / 2, cy: h / 2, R: R }; };
    var cols = function () { var d = dark(); return { meat: d ? '#a0603a' : '#8b4a26', starch: d ? '#e8d9a8' : '#f0dc9c', veg: d ? '#6cc77a' : '#2f9e44', sauce: d ? '#d0605a' : '#b02a2a', herb: d ? '#9be07c' : '#5fae3a' }; };
    V.drag(S.c.cv, {
      hit: function (x, y) { var g = geo(); for (var i = P.length - 1; i >= 0; i--) { var p = P[i], px = g.cx + (p.x - 0.5) * 2 * g.R, py = g.cy + (p.y - 0.5) * 2 * g.R; if (M.hypot(x - px, y - py) < M.max(14, p.r * 2 * g.R)) return i; } return null; },
      move: function (i, x, y) { var g = geo(); P[i].x = clamp(0.5 + (x - g.cx) / (2 * g.R), 0.02, 0.98); P[i].y = clamp(0.5 + (y - g.cy) / (2 * g.R), 0.02, 0.98); S.redraw(); }
    });
    S.draw = function () {
      var k = S.k, g = geo(), cc = cols(), ctx = S.ctx;
      S.circ(g.cx, g.cy, g.R, dark() ? '#e9ece9' : '#ffffff', k.axis, 2); S.circ(g.cx, g.cy, g.R * 0.78, null, dark() ? '#c9cfcb' : '#e2e6e3', 1.5);
      if (guide === 'thirds') { for (var i = 1; i < 3; i++) { var o = -g.R + i * 2 * g.R / 3; S.line(g.cx + o, g.cy - g.R, g.cx + o, g.cy + g.R, k.blue, 1, [4, 4]); S.line(g.cx - g.R, g.cy + o, g.cx + g.R, g.cy + o, k.blue, 1, [4, 4]); } }
      if (guide === 'clock') { for (var hh = 1; hh <= 12; hh++) { var a = hh / 12 * 2 * M.PI - M.PI / 2; S.txt(String(hh), g.cx + M.cos(a) * g.R * 0.9, g.cy + M.sin(a) * g.R * 0.9, { align: 'center', size: 11, color: k.blue }); } }
      var covered = 0, onRim = 0, sauceN = 0;
      P.forEach(function (p) {
        var px = g.cx + (p.x - 0.5) * 2 * g.R, py = g.cy + (p.y - 0.5) * 2 * g.R, r = p.r * 2 * g.R;
        if (p.c === 'meat') { S.rect(px - r * 1.2, py - r * 0.7, r * 2.4, r * 1.4, cc.meat, null, r * 0.4); }
        else if (p.c === 'veg') { for (var j = -2; j <= 2; j++) S.line(px - r * 0.9, py + j * r * 0.28, px + r * 0.9, py + j * r * 0.28 - r * 0.3, cc.veg, M.max(3, r * 0.18)); }
        else if (p.c === 'herb') { S.circ(px - r * 0.4, py, r * 0.6, cc.herb); S.circ(px + r * 0.4, py - r * 0.2, r * 0.5, cc.herb); }
        else S.circ(px, py, r, cc[p.c]);
        if (p.c === 'sauce') sauceN++;
        covered += p.c === 'meat' ? 2.4 * 1.4 * r * r : M.PI * r * r;
        if (M.hypot(px - g.cx, py - g.cy) + r * 0.6 > g.R * 0.78) onRim++;
      });
      var frac = covered / (M.PI * g.R * g.R * 0.78 * 0.78), dd = 0, pts = P.slice(0, 3).map(function (p) { return [p.x, p.y]; });
      for (var a1 = 0; a1 < 3; a1++) for (var b1 = a1 + 1; b1 < 3; b1++) dd = M.max(dd, M.hypot(pts[a1][0] - pts[b1][0], pts[a1][1] - pts[b1][1]));
      var notes = [];
      notes.push(onRim ? '✗ ' + onRim + ' item' + (onRim > 1 ? 's sit' : ' sits') + ' on the rim: keep the rim clean.' : '✓ The rim is clean.');
      notes.push(frac > 0.55 ? '✗ The plate looks crowded; leave more clear space.' : '✓ Good clear space (about ' + M.round(100 - frac * 100) + '% of the well).');
      notes.push(dd < 0.25 ? 'The three main parts are piled together; spread them so each can be seen.' : 'The main parts each have their own place.');
      notes.push(sauceN + ' sauce dots: an odd number, which most cooks find looks natural.');
      S.ro.set(notes.join(' '));
      S.say('Plate with protein, starch, vegetable, sauce and garnish. ' + notes[0]);
      S.txt('Drag the food', 8, 12, { size: 11, color: k.muted, w: 500 });
    };
    S.redraw();
  });

  // ============================================================ cu-setting
  V.register('cu-setting', function (el0) {
    var w = wrap(el0, 'A formal place setting');
    var IT = {
      napkin: ['Napkin', 'On the plate, or to the left of the forks. Unfold it on your lap when you sit.'],
      salad: ['Salad fork', 'Outermost on the left when salad comes before the main course. Use utensils from the outside in.'],
      dinner: ['Dinner fork', 'The main-course fork, nearest the plate on the left.'],
      plate: ['Dinner plate (or a charger)', 'In the center. A charger is a decorative base plate that the courses are set on and that is removed before the main course in many settings.'],
      knife: ['Dinner knife', 'Right of the plate, blade facing the plate.'],
      spoon: ['Soup spoon', 'Right of the knife, for a soup course served early in the meal.'],
      oyster: ['Oyster fork', 'The only fork on the right, outside the spoon, for a shellfish course.'],
      bread: ['Bread plate and butter knife', 'Upper left, above the forks. "b" for bread on the left.'],
      dessert: ['Dessert spoon and fork', 'Above the plate: spoon handle to the right, fork handle to the left.'],
      water: ['Water goblet', 'Above the dinner knife. "d" for drinks on the right.'],
      red: ['Red wine glass', 'To the right of the water glass; a larger bowl.'],
      white: ['White wine glass', 'Farther right, smaller; glasses are set in the order they are used.']
    };
    var svg = '<svg viewBox="0 0 360 230" class="cuv-svg" role="group" aria-label="Formal place setting. Tap an item.">' +
      g('napkin', '<rect x="8" y="110" width="28" height="64" rx="4" class="s-cloth"/>') +
      g('salad', fork(52, 112, 60)) + g('dinner', fork(72, 104, 74)) +
      g('plate', '<circle cx="150" cy="142" r="52" class="s-plate"/><circle cx="150" cy="142" r="38" class="s-rim"/>') +
      g('knife', '<path d="M224 98 L224 178 L230 178 L230 98 Q230 92 227 92 Q224 92 224 98 Z" class="s-metal"/>') +
      g('spoon', '<ellipse cx="246" cy="108" rx="7" ry="11" class="s-metal"/><rect x="244.5" y="118" width="3" height="60" class="s-metal"/>') +
      g('oyster', fork(266, 118, 52, 0.7)) +
      g('bread', '<circle cx="64" cy="58" r="22" class="s-plate"/><rect x="48" y="49" width="34" height="3.5" rx="1.5" class="s-metal"/>') +
      g('dessert', '<rect x="112" y="66" width="76" height="3.5" rx="1.5" class="s-metal"/><ellipse cx="190" cy="67.5" rx="7" ry="4" class="s-metal"/><rect x="112" y="78" width="72" height="3" rx="1.5" class="s-metal"/><path d="M108 74 h8 M108 77 h8 M108 80 h8 M108 83 h8" class="s-tine"/>') +
      g('water', glass(228, 54, 15)) + g('red', glass(262, 46, 13)) + g('white', glass(292, 58, 10)) +
      '</svg>';
    function g(id, inner) { return '<g class="cuv-it" data-it="' + id + '" tabindex="0" role="button" aria-label="' + IT[id][0] + '">' + inner + '</g>'; }
    function fork(x, y, h, s) { s = s || 1; return '<rect x="' + (x - 1.5) + '" y="' + (y + 16 * s) + '" width="3" height="' + (h - 16 * s) + '" class="s-metal"/><path d="M' + (x - 6 * s) + ' ' + y + ' v' + 14 * s + ' q0 5 6 6 q6 -1 6 -6 v' + (-14 * s) + ' M' + (x - 2 * s) + ' ' + y + ' v' + 14 * s + ' M' + (x + 2 * s) + ' ' + y + ' v' + 14 * s + '" class="s-tine"/>'; }
    function glass(x, y, r) { return '<path d="M' + (x - r) + ' ' + (y - r) + ' Q' + (x - r) + ' ' + (y + r) + ' ' + x + ' ' + (y + r) + ' Q' + (x + r) + ' ' + (y + r) + ' ' + (x + r) + ' ' + (y - r) + ' Z" class="s-glass"/><line x1="' + x + '" y1="' + (y + r) + '" x2="' + x + '" y2="' + (y + r + 10) + '" class="s-stem"/><line x1="' + (x - 6) + '" y1="' + (y + r + 10) + '" x2="' + (x + 6) + '" y2="' + (y + r + 10) + '" class="s-stem"/>'; }
    var box = el('div', 'cuv-svgbox', svg); w.appendChild(box);
    var info = el('div', 'cuv-card'); info.setAttribute('aria-live', 'polite'); info.innerHTML = '<p>Tap or select any item to see what it is for. Forks on the left, knives and spoons on the right, used from the outside in.</p>'; w.appendChild(info);
    function show(id, node) { Array.prototype.forEach.call(box.querySelectorAll('.cuv-it'), function (n) { n.classList.toggle('on', n === node); }); info.innerHTML = '<h4>' + IT[id][0] + '</h4><p>' + IT[id][1] + '</p>'; }
    Array.prototype.forEach.call(box.querySelectorAll('.cuv-it'), function (n) {
      n.addEventListener('click', function () { show(n.getAttribute('data-it'), n); });
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(n.getAttribute('data-it'), n); } });
    });
  });

  // ============================================================ cu-brigade
  var BR = {
    chef: ['Chef de cuisine', 'Runs the kitchen: the menu, the staff, ordering and costs, and the standard of every plate.'],
    exec: ['Executive chef', 'In large operations, oversees several kitchens or outlets; in small ones the same person as the chef de cuisine.'],
    sous: ['Sous-chef', '"Under-chef": second in command; runs service, trains cooks, and fills in for the chef.'],
    saucier: ['Saucier', 'Sauces and sautéed dishes; often the most senior station.'],
    poissonnier: ['Poissonnier', 'Fish, and often its sauces.'],
    rotisseur: ['Rôtisseur', 'Roasts and their jus; may lead the grillardin and friturier.'],
    grillardin: ['Grillardin', 'Grilled foods.'], friturier: ['Friturier', 'Fried foods.'],
    entremetier: ['Entremetier', 'Vegetables, starches, soups and eggs (in big kitchens split into potager and legumier).'],
    garde: ['Garde manger', 'The cold kitchen: salads, cold appetizers, pâtés and terrines, cured foods.'],
    patissier: ['Pâtissier', 'Pastry, breads and desserts.'], boucher: ['Boucher', 'Butchery: breaking down meat and poultry.'],
    tournant: ['Tournant', 'Works any station where help is needed.'],
    commis: ['Commis', 'Junior cooks who work under each chef de partie, learning the station.'],
    aboyeur: ['Aboyeur', '"Barker": calls the orders at the pass (today, often the expediter).'],
    plongeur: ['Plongeur', 'Washes dishes and pots; keeps the kitchen running.']
  };
  V.register('cu-brigade', function (el0) {
    var w = wrap(el0, 'The brigade de cuisine');
    function b(id) { return '<button type="button" class="cuv-br" data-r="' + id + '">' + BR[id][0] + '</button>'; }
    var html = '<div class="cuv-tree"><div class="cuv-lvl">' + b('exec') + '</div><div class="cuv-lvl">' + b('chef') + '</div><div class="cuv-lvl">' + b('sous') + b('aboyeur') + '</div>' +
      '<p class="cuv-lvl-lab">Chefs de partie (station chefs)</p><div class="cuv-lvl cuv-wrapl">' + ['saucier', 'poissonnier', 'rotisseur', 'grillardin', 'friturier', 'entremetier', 'garde', 'patissier', 'boucher', 'tournant'].map(b).join('') + '</div>' +
      '<div class="cuv-lvl">' + b('commis') + b('plongeur') + '</div></div>';
    var tree = el('div', '', html); w.appendChild(tree);
    var info = el('div', 'cuv-card'); info.setAttribute('aria-live', 'polite'); info.innerHTML = '<p>Tap a role to see the job. Escoffier organized the great hotel kitchens this way; most kitchens today combine stations.</p>'; w.appendChild(info);
    Array.prototype.forEach.call(tree.querySelectorAll('.cuv-br'), function (n) { n.addEventListener('click', function () { var r = n.getAttribute('data-r'); Array.prototype.forEach.call(tree.querySelectorAll('.cuv-br'), function (m) { m.setAttribute('aria-pressed', String(m === n)); }); info.innerHTML = '<h4>' + BR[r][0] + '</h4><p>' + BR[r][1] + '</p>'; }); });
  });

  // ============================================================ cu-plan
  V.register('cu-plan', function (el0, opts) {
    var w = wrap(el0, 'Backward schedule');
    var items = opts.preset === 'capstone' ? [['Oven on for the meat course', 10], ['Meat course: roast', 45], ['Meat course: rest', 15], ['Reheat the sauce', 10], ['Sear the fish course', 8], ['Warm the plates', 15], ['Glaze the vegetables', 12], ['Plate dessert', 6]] : [['Roast in the oven', 90], ['Roast rests', 20], ['Potatoes roast', 50], ['Pan sauce', 15], ['Blanch and glaze vegetables', 12], ['Plate and wipe rims', 5]];
    var serve = opts.preset === 'capstone' ? '19:30' : '19:00';
    var row = el('div', 'cuv-row'); w.appendChild(row);
    var lab = el('label', 'cuv-num'); lab.appendChild(el('span', '', 'Food leaves the kitchen at')); var t = D.createElement('input'); t.type = 'time'; t.value = serve; t.addEventListener('input', draw); lab.appendChild(t); row.appendChild(lab);
    var out = el('div', 'cuv-out'); w.appendChild(out);
    w.appendChild(el('p', 'cuv-note', 'Each line counts back from the serving time. Steps that run one after another (cook, then rest) are added together: a roast that rests starts its cooking earlier by the resting time.'));
    function fmt(m) { m = ((m % 1440) + 1440) % 1440; var h = M.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + ' ' + (h >= 12 ? 'p.m.' : 'a.m.'); }
    function draw() {
      var p = (t.value || '19:00').split(':'), s = (+p[0]) * 60 + (+p[1] || 0);
      var lst = items.map(function (it, i) { var extra = 0; if (/Roast in the oven/.test(it[0])) extra = (items.filter(function (x) { return /rests/.test(x[0]); })[0] || [0, 0])[1]; if (/roast$/.test(it[0])) extra = (items.filter(function (x) { return /: rest$/.test(x[0]); })[0] || [0, 0])[1]; if (/Oven on/.test(it[0])) extra = items.filter(function (x) { return /roast$|: rest$/.test(x[0]); }).reduce(function (a, x) { return a + x[1]; }, 0); return { n: it[0], m: it[1], i: i, start: s - it[1] - extra }; });
      lst.sort(function (a, b) { return a.start - b.start; });
      var h = '<table class="cuv-tbl"><thead><tr><th scope="col">Start at</th><th scope="col">Step</th><th scope="col">Minutes</th></tr></thead><tbody>';
      lst.forEach(function (x) { h += '<tr><td><b>' + fmt(x.start) + '</b></td><th scope="row">' + esc(x.n) + '</th><td><input type="number" min="1" step="1" value="' + x.m + '" data-i="' + x.i + '" aria-label="Minutes for ' + esc(x.n) + '"></td></tr>'; });
      out.innerHTML = h + '</tbody></table>';
      Array.prototype.forEach.call(out.querySelectorAll('input'), function (x) { x.addEventListener('change', function () { items[+x.getAttribute('data-i')][1] = M.max(1, M.round(+x.value || 1)); draw(); }); });
    }
    draw();
  });
})(window, document);
