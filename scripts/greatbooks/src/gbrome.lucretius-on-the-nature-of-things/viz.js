/* gbrome.lucretius-on-the-nature-of-things: visuals gb-atoms (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

ML.viz.register('gb-atoms', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.6, max: 340, min: 210 }), ro = V.readout(el);
  var N = 140, seen = true, trail = [], parts = [], big, seed = 7, simT = 0, run = null;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function reset() {
    seed = 7; parts = []; trail = []; simT = 0; big = { x: 0.5, y: 0.5, vx: 0, vy: 0, r: 0.045, m: 40 };
    for (var i = 0; i < N; i++) { var a = rnd() * 6.283, s = 0.25 + rnd() * 0.3; parts.push({ x: rnd(), y: rnd() * 0.625, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 0.006 }); }
    big.y = 0.31;
  }
  function stepSim(dt) {
    var H = 0.625;
    parts.forEach(function (p) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < 0) { p.x = -p.x; p.vx = -p.vx; } if (p.x > 1) { p.x = 2 - p.x; p.vx = -p.vx; } if (p.y < 0) { p.y = -p.y; p.vy = -p.vy; } if (p.y > H) { p.y = 2 * H - p.y; p.vy = -p.vy; }
      var dx = p.x - big.x, dy = p.y - big.y, d = Math.hypot(dx, dy), R = big.r + p.r;
      if (d < R && d > 0) { var nx = dx / d, ny = dy / d, rv = (p.vx - big.vx) * nx + (p.vy - big.vy) * ny; if (rv < 0) { var j = -2 * rv / (1 + 1 / big.m); p.vx += j * nx; p.vy += j * ny; big.vx -= j * nx / big.m; big.vy -= j * ny / big.m; } p.x = big.x + nx * R; p.y = big.y + ny * R; }
    });
    big.x += big.vx * dt; big.y += big.vy * dt;
    if (big.x < big.r || big.x > 1 - big.r) { big.vx = -big.vx; big.x = Math.max(big.r, Math.min(1 - big.r, big.x)); }
    if (big.y < big.r || big.y > H - big.r) { big.vy = -big.vy; big.y = Math.max(big.r, Math.min(H - big.r, big.y)); }
    simT += dt; if (!trail.length || Math.hypot(trail[trail.length - 1][0] - big.x, trail[trail.length - 1][1] - big.y) > 0.004) trail.push([big.x, big.y]); if (trail.length > 600) trail.shift();
  }
  function draw() {
    var k = V.colors(), ctx = c.ctx, s = c.w; ctx.fillStyle = k.panel; ctx.fillRect(0, 0, c.w, c.h);
    ctx.strokeStyle = k.gold; ctx.lineWidth = 1.5; ctx.beginPath(); trail.forEach(function (p, i) { if (i) ctx.lineTo(p[0] * s, p[1] * s); else ctx.moveTo(p[0] * s, p[1] * s); }); ctx.stroke();
    if (seen) { ctx.fillStyle = k.blue; parts.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x * s, p.y * s, Math.max(1.6, p.r * s), 0, 7); ctx.fill(); }); }
    ctx.fillStyle = k.ink; ctx.beginPath(); ctx.arc(big.x * s, big.y * s, big.r * s, 0, 7); ctx.fill();
    ro.set(seen ? 'The small blue dots stand for bodies too small to see. They never stop moving, and each time one strikes the speck it nudges it a little.' : 'With the small bodies hidden, all you can see is the speck wandering this way and that, "impelled by unseen blows". That is the picture Lucretius drew.');
  }
  reset();
  for (var w = 0; w < 30; w++) stepSim(0.02);
  V.button(B.ctl, seen ? 'Hide the small bodies' : 'Show the small bodies', function () { seen = !seen; this.textContent = seen ? 'Hide the small bodies' : 'Show the small bodies'; draw(); }, 'pri');
  if (RM) V.button(B.ctl, 'Step forward', function () { for (var i = 0; i < 50; i++) stepSim(0.02); draw(); });
  else { run = V.loop(el, function (dt) { stepSim(Math.min(dt, 0.03)); draw(); }); V.button(B.ctl, 'Pause', function () { if (run.running()) { run.stop(); this.textContent = 'Play'; } else { run.start(); this.textContent = 'Pause'; } }); }
  V.button(B.ctl, 'Start again', function () { reset(); draw(); });
  c.onResize(draw); V.onTheme(draw); draw();
});

/* Mars: deferent radius 1.52 (period 1.88 years), epicycle radius 1 turning once a year with the Sun's direction.
   The same motion is a Sun-centered pair of circles: Earth (1 AU, 1 year) and Mars (1.52 AU, 1.88 years). */
