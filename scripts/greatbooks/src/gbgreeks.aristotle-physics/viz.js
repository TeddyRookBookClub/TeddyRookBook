/* gbgreeks.aristotle-physics: visuals gb-four-causes, gb-fall-rules (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

/* Aristotle's four causes for a few familiar things (Physics II.3). */
ML.viz.register('gb-four-causes', function (el, opts, V) {
  var stage = document.createElement('div'); stage.className = 'gb-stage gb-causes'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var THINGS = [
    ['A bronze statue', 'bronze', 'the shape of a runner', 'the sculptor, using the art of sculpture', 'to honor a winner at the games'],
    ['A house', 'bricks, stones and timber', 'the builder\'s plan: a shelter with walls and a roof', 'the builder', 'to shelter people and their things'],
    ['An oak tree', 'wood, sap and leaves', 'what it is to be an oak', 'a parent oak, by way of an acorn', 'a grown oak that bears acorns of its own'],
    ['A walk after dinner', 'the body that walks', 'the kind of activity a walk is', 'the person deciding to walk', 'health (Aristotle\'s own example)'],
    ['A bird\'s nest', 'twigs, grass and mud', 'the cup shape that holds eggs', 'the bird building it', 'to keep the eggs and chicks safe']
  ];
  var NAMES = [['Material', 'What is it made of?'], ['Form', 'What is it? What pattern does it follow?'], ['Moving cause', 'What made it or started the change?'], ['End', 'What is it for?']];
  var grid = document.createElement('div'); grid.className = 'gb-causes-grid'; stage.appendChild(grid);
  var cells = NAMES.map(function (n, i) { var d = document.createElement('div'); d.className = 'gb-cause gb-cause-' + i; d.innerHTML = '<b>' + n[0] + '</b><span class="gb-cause-q">' + n[1] + '</span><span class="gb-cause-a" aria-live="polite"></span>'; grid.appendChild(d); return d.querySelector('.gb-cause-a'); });
  var btns = [], wrap = document.createElement('div'); wrap.className = 'ml-seg'; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', 'Thing'); ctl.appendChild(wrap);
  function pick(i) { THINGS[i].slice(1).forEach(function (a, j) { cells[j].textContent = a; }); btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); }); }
  THINGS.forEach(function (t, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t[0]; b.addEventListener('click', function () { pick(i); }); wrap.appendChild(b); btns.push(b); });
  pick(opts.start || 0);
});

/* Two balls of the same size, 1 kg (wood) and 10 kg (iron), dropped from 40 m. */
ML.viz.register('gb-fall-rules', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.5, max: 360, min: 230 }), ro = V.readout(el);
  var H = 40, g = 9.8, mode = opts.mode || 'ar', t = 0, run = null, rad = 0.1, rho = 1.2, Cd = 0.47, A = Math.PI * rad * rad;
  var BALLS = [{ m: 1, name: '1 kg wooden ball' }, { m: 10, name: '10 kg iron ball' }];
  function simAir(m, T) { var y = 0, v = 0, dt = 0.002, tt = 0; while (tt < T && y < H) { var a = g - 0.5 * rho * Cd * A * v * v / m; v += a * dt; y += v * dt; tt += dt; } return Math.min(y, H); }
  function landAir(m) { var y = 0, v = 0, dt = 0.001, tt = 0; while (y < H) { var a = g - 0.5 * rho * Cd * A * v * v / m; v += a * dt; y += v * dt; tt += dt; } return tt; }
  var tAir = BALLS.map(function (b) { return landAir(b.m); }), tVac = Math.sqrt(2 * H / g);
  // Aristotle's rule: steady speed, proportional to weight; we set the heavy ball to land when it does in the vacuum
  var vAr = BALLS.map(function (b) { return H / tVac * b.m / 10; });
  function pos(i, T) { if (mode === 'ar') return Math.min(H, vAr[i] * T); if (mode === 'vac') return Math.min(H, 0.5 * g * T * T); return simAir(BALLS[i].m, T); }
  function land(i) { return mode === 'ar' ? H / vAr[i] : mode === 'vac' ? tVac : tAir[i]; }
  function draw() {
    var k = V.colors(), ctx = c.ctx, top = 22, bot = c.h - 26, sx = [c.w * 0.36, c.w * 0.64];
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    ctx.fillStyle = k.muted; ctx.fillRect(c.w * 0.12, bot, c.w * 0.76, 3);
    ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (var hgt = 0; hgt <= H; hgt += 10) { var yy = top + (bot - top) * (1 - hgt / H); ctx.fillText(hgt + ' m', c.w * 0.12 - 4, yy); ctx.fillRect(c.w * 0.12, yy, 6, 1); }
    BALLS.forEach(function (b, i) {
      var y = top + (bot - top) * pos(i, t) / H, r = 11, done = pos(i, t) >= H - 1e-9;
      ctx.fillStyle = i ? k.muted : k.gold; ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx[i], Math.min(y, bot - r), r, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = k.ink; ctx.textAlign = 'center'; ctx.font = '600 12px system-ui,sans-serif'; ctx.fillText(b.m + ' kg', sx[i], bot + 14);
      if (done) { ctx.fillStyle = k.green; ctx.fillText('landed ' + V.fmt(land(i), 2) + ' s', sx[i], top - 8); }
    });
    var msg = mode === 'ar' ? '<b>Aristotle\'s rule</b> (On the Heavens I.6): a body twice as heavy takes half the time. The 10 kg ball should land in ' + V.fmt(land(1), 2) + ' s and the 1 kg ball in ' + V.fmt(land(0), 1) + ' s, ten times as long.'
      : mode === 'vac' ? '<b>No air</b> (Galileo, Newton): every body gains speed at the same rate, so both land together after <b>' + V.fmt(tVac, 2) + ' s</b>. Aristotle thought motion in a void was impossible; this is what it does.'
      : '<b>Real air</b>: same-size balls. Air resistance matters more to the light one, so it lands a little later (' + V.fmt(tAir[0], 2) + ' s against ' + V.fmt(tAir[1], 2) + ' s), but nowhere near ten times later.';
    ro.set(msg);
  }
  function play() {
    t = 0; if (run) { run.stop(); run = null; }
    var end = Math.max(land(0), land(1));
    if (RM) { t = end; draw(); return; }
    run = V.loop(el, function (dt) { t = Math.min(end, t + dt * (mode === 'ar' ? 2.5 : 1)); draw(); if (t >= end && run) { run.stop(); run = null; } });
  }
  V.seg(B.ctl, { label: 'Rule', items: [['ar', 'Aristotle\'s rule'], ['vac', 'No air'], ['air', 'Real air']], value: mode, change: function (v) { mode = v; t = 0; draw(); } });
  V.button(B.ctl, RM ? 'Show landing' : 'Drop', play, 'pri');
  c.onResize(draw); V.onTheme(draw); draw();
});
