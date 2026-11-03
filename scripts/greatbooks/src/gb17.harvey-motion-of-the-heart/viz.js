/* gb-harvey: Harvey's arithmetic (On the Motion of the Heart, chapter 9).
   Sliders: how much the left ventricle holds, what fraction it pushes out per beat, and beats in half an hour.
   A tank compares the blood pushed out in half an hour with all the blood in the body. A loop diagram shows the
   one-way circuit (the valves let blood pass only one way); dots move around it unless reduced motion is on.
   Units: Harvey's apothecary units (1 ounce = 8 drachms, 1 pound = 12 ounces) or modern liters.
   opts: hold: 2 (ounces); frac: 8 (1/8 pushed out); beats: 1000; units: "harvey" | "modern"; quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI;
  V.register('gb-harvey', function (el, o) {
    o = o || {};
    var hold = o.hold || 2, frac = o.frac || 8, beats = o.beats || 1000, units = o.units || 'harvey', ph = 0;
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.9, min: 230, max: 360 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'The ventricle holds', min: 1, max: 3, step: 0.5, value: hold, fmt: function (v) { return V.fmt(v) + ' oz'; }, input: function (v) { hold = v; draw(); } });
    V.seg(ctl, { label: 'Pushed out each beat', items: [['4', '1/4'], ['6', '1/6'], ['8', '1/8']], value: String(frac), change: function (v) { frac = +v; draw(); } });
    V.slider(ctl, { label: 'Beats in half an hour', min: 1000, max: 4000, step: 500, value: beats, fmt: function (v) { return v.toLocaleString('en-US'); }, input: function (v) { beats = v; draw(); } });
    V.seg(ctl, { label: 'Units', items: [['harvey', 'Harvey’s units'], ['modern', 'Liters']], value: units, change: function (v) { units = v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    var OZ_L = 0.0296; // one fluid ounce is about 29.6 mL (close enough for Harvey's ounce of blood)
    function lbOz(oz) { var lb = M.floor(oz / 12 + 1e-9), r = oz - 12 * lb; return lb + ' lb ' + V.fmt(r, 1) + ' oz'; }
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    var lp = V.reduced ? null : V.loop(el, function (dt) { ph = (ph + dt * 0.15) % 1; draw(); });
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h; clear(k);
      var per = hold / frac, total = per * beats, body = 5 / OZ_L; // a grown person has about 5 liters of blood (modern figure), about 169 ounces
      // left: the circuit
      var lw = M.min(w * 0.5, h * 1.25), cx = lw / 2 + 6, cy = h / 2, rx = lw / 2 - 18, ry = h / 2 - 26;
      g.strokeStyle = k.red; g.lineWidth = 7; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, M.PI, TAU); g.stroke();
      g.strokeStyle = k.blue; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, M.PI); g.stroke();
      // heart at the left end, the body at the right end (simplified: one loop; really the lungs make a second loop)
      var hx = cx - rx, bxl = cx + rx;
      for (var i = 0; i < 16; i++) { var a = M.PI + TAU * ((i / 16 + ph) % 1); g.fillStyle = M.sin(a) < 0 ? k.red : k.blue; g.beginPath(); g.arc(cx + rx * M.cos(a), cy + ry * M.sin(a), 3.4, 0, TAU); g.fill(); }
      g.fillStyle = k.pink; g.beginPath(); g.arc(hx, cy, 19, 0, TAU); g.fill();
      g.fillStyle = k.panel; g.strokeStyle = k.muted; g.lineWidth = 1; g.fillRect(bxl - 20, cy - 14, 40, 28); g.strokeRect(bxl - 20, cy - 14, 40, 28);
      g.font = '700 11px system-ui,sans-serif'; g.textAlign = 'center'; g.fillStyle = k.bg; g.fillText('heart', hx, cy + 4); g.fillStyle = k.ink; g.fillText('body', bxl, cy + 4);
      g.fillStyle = k.muted; g.font = '12px system-ui,sans-serif'; g.fillText('arteries: out', cx, cy - ry - 10); g.fillText('veins: back', cx, cy + ry + 18);
      // one-way valves: arrowheads along the flow (top: heart to body; bottom: body to heart)
      [[cx, cy - ry, 1], [cx, cy + ry, -1]].forEach(function (v) { g.fillStyle = k.ink; g.beginPath(); g.moveTo(v[0] + 9 * v[2], v[1]); g.lineTo(v[0] - 7 * v[2], v[1] - 7); g.lineTo(v[0] - 7 * v[2], v[1] + 7); g.closePath(); g.fill(); });
      // right: two bars
      var bx = lw + 24, bw = M.max(40, (w - bx - 20) / 2 - 10), top = 26, H = h - top - 44, mx = M.max(total, body) * 1.05;
      function bar(x, val, col, lab, sub) {
        var bh = H * val / mx; g.fillStyle = col; g.fillRect(x, top + H - bh, bw, bh);
        g.strokeStyle = k.muted; g.lineWidth = 1; g.strokeRect(x, top, bw, H);
        g.fillStyle = k.ink; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(lab, x + bw / 2, top + H + 15); g.font = '11px system-ui,sans-serif'; g.fillStyle = k.muted; g.fillText(sub, x + bw / 2, top + H + 30);
      }
      var fmtq = function (oz) { return units === 'harvey' ? lbOz(oz) : V.fmt(oz * OZ_L, 1) + ' L'; };
      bar(bx, total, k.redSoft, 'pumped', fmtq(total)); bar(bx + bw + 20, body, k.blueSoft, 'in the body', fmtq(body));
      var x = total / body;
      c.cv.setAttribute('aria-label', 'The heart pumps ' + fmtq(total) + ' in half an hour, against ' + fmtq(body) + ' of blood in the whole body');
      out.set('Each beat: ' + V.fmt(hold) + ' oz ÷ ' + frac + ' = ' + (units === 'harvey' ? V.fmt(per * 8, 2) + ' drachms' : V.fmt(per * OZ_L * 1000, 0) + ' mL') + '. In half an hour: ' + fmtq(total) +
        ', which is ' + V.fmt(x, 1) + ' times all the blood in the body. Food cannot make that much new blood, so <b>the same blood must go round and round</b>.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
