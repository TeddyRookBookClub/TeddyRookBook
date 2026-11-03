/* gb-egg: a hen's egg through 21 days of incubation, after Harvey's daily inspections (On the Generation of Animals).
   A day slider; the drawing changes stage by stage (germinal disc, blood ring and beating heart, curled embryo with an
   eye, limbs and beak, feathers, a chick filling the shell, hatching). The beating dot pulses unless reduced motion is
   on. The note line says what Harvey reported and what is known today. opts: day: 4; quiet: true hides the note. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI;
  var NOTES = [
    [0, 'A fresh egg: a small white spot on the yolk, the germinal disc (Harvey’s <em>cicatricula</em>). Harvey showed that the chick starts here.'],
    [1, 'Day 1: the white spot spreads into rings. Nothing moves yet.'],
    [2, 'Day 2: today we know the heart starts beating at about two days, too small to see without a lens.'],
    [3, 'Day 3: a ring of blood vessels spreads over the yolk. With a lens and bright light, Harvey saw the faint beating point at the end of this day.'],
    [4, 'Day 4: Harvey’s “leaping point”: the heart, red and pulsing, “like the smallest spark of fire,” with blood vessels branching from it.'],
    [5, 'Days 5–6: the body curls; a dark eye is now the largest thing on it. Little buds will become wings and legs.'],
    [8, 'Days 7–10: beak, wings and legs take shape. Harvey saw the parts appear one after another: built up, not just growing bigger.'],
    [12, 'Days 11–16: feathers begin, claws harden, and the chick uses up more of the yolk and white.'],
    [18, 'Days 17–20: the chick fills the shell and turns its beak toward the air space at the round end.'],
    [21, 'Day 21: the chick breaks the shell with a little “egg tooth” on its beak, and hatches.']
  ];
  V.register('gb-egg', function (el, o) {
    o = o || {};
    var day = o.day == null ? 4 : +o.day, ph = 0;
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.45, min: 230, max: 380 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.slider(ctl, { label: 'Day of incubation', min: 0, max: 21, step: 1, value: day, fmt: function (v) { return 'day ' + v; }, input: function (v) { day = v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    if (!V.reduced) V.loop(el, function (dt) { ph = (ph + dt * 1.6) % 1; if (day >= 2 && day <= 6) draw(); });
    function note() { var n = NOTES[0][1]; NOTES.forEach(function (x) { if (day >= x[0]) n = x[1]; }); return n; }
    function clear(k) { var x = c.ctx; x.save(); x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.fillStyle = k.bg; x.fillRect(0, 0, c.w, c.h); x.restore(); }
    function draw() {
      var k = V.colors(), g = c.ctx, w = c.w, h = c.h, cx = w / 2, cy = h / 2, ry = h * 0.44, rx = ry * 0.74;
      clear(k);
      // shell (egg shape: wider at the round end on the left)
      g.beginPath();
      for (var i = 0; i <= 80; i++) { var t = TAU * i / 80, x = cx + rx * M.cos(t) * (1 - 0.12 * M.sin(t)), y = cy + ry * M.sin(t); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.closePath(); g.fillStyle = k.panel; g.fill(); g.strokeStyle = k.muted; g.lineWidth = 2.5; g.stroke();
      // air cell at the round (top) end
      var air = 0.06 + 0.012 * day;
      g.fillStyle = k.bg; g.beginPath(); g.ellipse(cx, cy - ry + ry * air + 9, rx * 0.5, ry * air, 0, 0, TAU); g.fill();
      g.fillStyle = k.muted; g.font = '11px system-ui,sans-serif'; g.textAlign = 'center'; g.textAlign = 'left'; g.fillText('\u2190 air space', cx + rx * 0.75, cy - ry * 0.88);
      // yolk shrinks as it is used
      var yr = ry * (0.42 - 0.012 * M.max(0, day - 8));
      var yy = cy + ry * 0.08;
      g.fillStyle = k.gold; g.globalAlpha = 0.55; g.beginPath(); g.arc(cx, yy, M.max(8, yr), 0, TAU); g.fill(); g.globalAlpha = 1;
      var beat = V.reduced ? 1 : 0.75 + 0.25 * M.sin(TAU * ph);
      if (day <= 1) {
        g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, yy - yr * 0.55, 5 + 4 * day, 0, TAU); g.fill();
        g.strokeStyle = k.muted; g.lineWidth = 1; g.stroke();
      } else if (day <= 4) {
        var R0 = yr * (0.35 + 0.15 * (day - 2));
        g.strokeStyle = k.red; g.lineWidth = 1.6; g.beginPath(); g.arc(cx, yy - yr * 0.2, R0, 0, TAU); g.stroke();
        if (day >= 3) for (var j = 0; j < 6; j++) { var a = j * TAU / 6 + 0.3; g.beginPath(); g.moveTo(cx, yy - yr * 0.2); g.quadraticCurveTo(cx + R0 * 0.6 * M.cos(a + 0.4), yy - yr * 0.2 + R0 * 0.6 * M.sin(a + 0.4), cx + R0 * M.cos(a), yy - yr * 0.2 + R0 * M.sin(a)); g.stroke(); }
        g.fillStyle = k.red; g.beginPath(); g.arc(cx, yy - yr * 0.2, (day === 2 ? 2 : 3 + day * 0.6) * beat, 0, TAU); g.fill();
      } else {
        // a curled embryo growing with the days
        var s = M.min(1, 0.25 + (day - 5) * 0.05), L = ry * 1.5 * s, ex = cx, ey = cy + ry * 0.05;
        g.save(); g.translate(ex, ey);
        g.fillStyle = k.orange; g.globalAlpha = day >= 11 ? 0.9 : 0.75;
        g.beginPath(); g.ellipse(0, L * 0.1, L * 0.32, L * 0.4, 0.3, 0, TAU); g.fill();       // body
        g.beginPath(); g.arc(-L * 0.12, -L * 0.36, L * 0.2, 0, TAU); g.fill();                  // head
        g.globalAlpha = 1;
        g.fillStyle = k.ink; g.beginPath(); g.arc(-L * 0.16, -L * 0.38, M.max(2.5, L * 0.07), 0, TAU); g.fill(); // eye
        if (day >= 7) { g.fillStyle = k.gold; g.beginPath(); g.moveTo(-L * 0.3, -L * 0.32); g.lineTo(-L * 0.44, -L * 0.28); g.lineTo(-L * 0.3, -L * 0.24); g.fill(); } // beak
        if (day >= 7) { g.strokeStyle = k.orange; g.lineWidth = M.max(2, L * 0.05); g.lineCap = 'round'; g.beginPath(); g.moveTo(L * 0.05, L * 0.4); g.lineTo(-L * 0.08, L * 0.58); g.moveTo(L * 0.18, L * 0.38); g.lineTo(L * 0.1, L * 0.58); g.stroke(); } // legs
        if (day >= 11) { g.strokeStyle = k.muted; g.lineWidth = 1; for (var f = 0; f < 10; f++) { var fa = f * 0.6; g.beginPath(); g.moveTo(L * 0.25 * M.cos(fa), L * 0.1 + L * 0.3 * M.sin(fa)); g.lineTo(L * 0.31 * M.cos(fa), L * 0.1 + L * 0.37 * M.sin(fa)); g.stroke(); } }
        if (day <= 6) { g.fillStyle = k.red; g.beginPath(); g.arc(L * 0.02, -L * 0.05, M.max(2.5, L * 0.06) * beat, 0, TAU); g.fill(); }
        g.restore();
        if (day >= 21) { g.strokeStyle = k.ink; g.lineWidth = 2; g.beginPath(); var zx = cx - rx * 0.8, zy = cy - ry * 0.45; g.moveTo(zx, zy); g.lineTo(zx + 10, zy + 8); g.lineTo(zx + 4, zy + 16); g.lineTo(zx + 14, zy + 24); g.stroke(); }
      }
      g.fillStyle = k.ink; g.font = '700 14px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText('Day ' + day, 12, 22);
      c.cv.setAttribute('aria-label', 'A hen’s egg on day ' + day + ' of incubation');
      out.set(note());
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
