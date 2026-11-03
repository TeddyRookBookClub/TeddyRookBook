/* gbrome.ptolemy-almagest: visuals gb-epicycle (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

ML.viz.register('gb-epicycle', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.25, max: 440, min: 260 }), ro = V.readout(el);
  var view = 'earth', T = 0, run = null, epi = 1, RD = 1.52, PD = 1.8808, trail = [];
  function geo(t) { // Earth-centered planet position with an adjustable epicycle (epi = 1 reproduces the Sun-centered model)
    var a = 2 * Math.PI * t / PD + 1.1, b = 2 * Math.PI * t;
    var cen = [RD * Math.cos(a), RD * Math.sin(a)], p = [cen[0] - epi * Math.cos(b), cen[1] - epi * Math.sin(b)];
    return { cen: cen, p: p };
  }
  function lon(t) { var g = geo(t); return Math.atan2(g.p[1], g.p[0]); }
  function retro(t) { var d = lon(t + 0.002) - lon(t); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d < 0; }
  function draw() {
    var k = V.colors(), ctx = c.ctx, cx = c.w / 2, cy = c.h / 2, s = Math.min(c.w, c.h) / 5.6;
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    function X(p) { return cx + p[0] * s; } function Y(p) { return cy - p[1] * s; }
    function circ(p, r, col, w, dash) { ctx.strokeStyle = col; ctx.lineWidth = w || 1.2; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.arc(X(p), Y(p), r * s, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    function dot(p, r, col, lab) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(p), Y(p), r, 0, 7); ctx.fill(); if (lab) { ctx.fillStyle = k.ink; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(lab, X(p) + r + 3, Y(p) - r - 2); } }
    var b = 2 * Math.PI * T, a = 2 * Math.PI * T / PD + 1.1;
    if (view === 'earth') {
      var g = geo(T);
      circ([0, 0], RD, k.muted, 1.2, [5, 4]);
      circ(g.cen, epi, k.blue, 1.2);
      ctx.strokeStyle = k.red; ctx.lineWidth = 1.6; ctx.beginPath(); trail.forEach(function (p, i) { if (i) ctx.lineTo(X(p), Y(p)); else ctx.moveTo(X(p), Y(p)); }); ctx.stroke();
      ctx.strokeStyle = k.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(g.cen), Y(g.cen)); ctx.lineTo(X(g.p), Y(g.p)); ctx.stroke();
      var sun = [-Math.cos(b) * 1.0, -Math.sin(b) * 1.0]; // the Sun's direction from Earth; the epicycle radius stays parallel to it
      ctx.strokeStyle = k.gold; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X([0, 0]), Y([0, 0])); ctx.lineTo(X(sun), Y(sun)); ctx.stroke(); ctx.setLineDash([]);
      dot(sun, 7, k.gold, 'Sun'); dot([0, 0], 7, k.green, 'Earth'); dot(g.cen, 3, k.blue); dot(g.p, 6, k.red, 'Mars');
    } else {
      circ([0, 0], 1, k.green, 1.2, [5, 4]); circ([0, 0], RD, k.red, 1.2, [5, 4]);
      var E = [Math.cos(b), Math.sin(b)], Mp = [RD * Math.cos(a), RD * Math.sin(a)], dx = Mp[0] - E[0], dy = Mp[1] - E[1], L = Math.hypot(dx, dy);
      ctx.strokeStyle = k.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(E), Y(E)); ctx.lineTo(X([E[0] + dx / L * 3, E[1] + dy / L * 3]), Y([E[0] + dx / L * 3, E[1] + dy / L * 3])); ctx.stroke();
      dot([0, 0], 8, k.gold, 'Sun'); dot(E, 6, k.green, 'Earth'); dot(Mp, 6, k.red, 'Mars');
    }
    var deg = (lon(T) * 180 / Math.PI + 360) % 360, rv = retro(T);
    ro.set((view === 'earth' ? 'Ptolemy\'s picture: Mars rides a small circle (the <b>epicycle</b>) whose center goes round the Earth on a big circle (the <b>deferent</b>). The red line is the path. ' : 'The same motion with the Sun in the middle: the line of sight from Earth to Mars points the same way as in Ptolemy\'s picture. ') +
      'Year ' + V.fmt(T, 2) + ': Mars is at ' + Math.round(deg) + '° along the zodiac, moving <b>' + (rv ? 'backward (retrograde)' : 'forward') + '</b>.' + (rv ? ' This happens when Earth passes Mars.' : ''));
  }
  function adv(dt) { T += dt; var g = geo(T); trail.push(g.p); if (trail.length > 900) trail.shift(); }
  function seed() { trail = []; var t0 = T - 2.2; for (var t = t0; t <= T; t += 0.004) trail.push(geo(t).p); }
  V.seg(B.ctl, { label: 'View', items: [['earth', 'Earth in the middle'], ['sun', 'Sun in the middle']], value: view, change: function (v) { view = v; draw(); } });
  V.slider(B.ctl, { label: 'Epicycle size', min: 0, max: 1.3, step: 0.05, value: epi, fmt: function (v) { return v ? V.fmt(v, 2) : 'none'; }, input: function (v) { epi = v; seed(); draw(); } });
  if (RM) V.slider(B.ctl, { label: 'Time (years)', min: 0, max: 4, step: 0.01, value: 0, input: function (v) { T = v; seed(); draw(); } });
  else { run = V.loop(el, function (dt) { adv(dt * 0.25); draw(); }); V.button(B.ctl, 'Pause', function () { if (run.running()) { run.stop(); this.textContent = 'Play'; } else { run.start(); this.textContent = 'Pause'; } }); }
  seed(); c.onResize(draw); V.onTheme(draw); draw();
});
