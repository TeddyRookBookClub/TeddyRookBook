/* gbgreeks.aristotle-on-the-heavens: visuals gb-earth-shadow (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

/* The shadow on the Moon during an eclipse, cast by a ball, a flat disk or a cube turned different ways. */
ML.viz.register('gb-earth-shadow', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.7, max: 320, min: 200 }), ro = V.readout(el);
  var shape = 'ball', turn = 40, cover = 0.45;
  function outline(cx, cy, R) {
    if (shape === 'ball') { var o = []; for (var i = 0; i < 64; i++) { var a = i / 64 * 2 * Math.PI; o.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); } return o; }
    var th = turn * Math.PI / 180;
    if (shape === 'disk') { o = []; for (i = 0; i < 64; i++) { a = i / 64 * 2 * Math.PI; o.push([cx + R * Math.cos(th) * Math.cos(a), cy + R * Math.sin(a)]); } return o; }
    var pts = [], s = R * 0.8; [-1, 1].forEach(function (x) { [-1, 1].forEach(function (y) { [-1, 1].forEach(function (z) {
      var x1 = x * Math.cos(th) - z * Math.sin(th), z1 = x * Math.sin(th) + z * Math.cos(th), ph = 0.5, y1 = y * Math.cos(ph) - z1 * Math.sin(ph); pts.push([cx + x1 * s, cy + y1 * s]); }); }); });
    pts.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; }); // convex hull (monotone chain)
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = []; pts.forEach(function (p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    pts.slice().reverse().forEach(function (p) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function draw() {
    var k = V.colors(), ctx = c.ctx, mx = c.w * 0.5, my = c.h * 0.5, mr = Math.min(c.h * 0.36, c.w * 0.25);
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    ctx.fillStyle = '#e9e2c9'; ctx.strokeStyle = k.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill(); ctx.stroke();
    var R = mr * 1.6, sx = mx - mr - R + cover * 2 * mr * 1.1 + (shape === 'disk' ? (1 - Math.cos(turn * Math.PI / 180)) * R * 0.9 : 0);
    var ol = outline(sx, my, R);
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.clip();
    ctx.fillStyle = 'rgba(40,30,30,0.78)'; ctx.beginPath(); ol.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = k.ink; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('the Moon', mx, my + mr + 14);
    var edge = shape === 'ball' ? 'The edge of the shadow is always part of a circle, whichever way the ball is turned.' : shape === 'disk' ? (Math.abs(turn) > 80 ? 'Turned edge-on, a flat disk casts a nearly straight shadow edge.' : 'A flat disk casts a round edge only when it faces the Moon squarely; turned, its shadow is an oval.') : 'A cube casts a shadow with corners and straight sides.';
    ro.set(edge + ' Aristotle\'s argument: eclipses of the Moon always show a curved edge, at every time of night and year, so the Earth must be a sphere.');
  }
  V.seg(B.ctl, { label: 'Shape of the Earth', items: [['ball', 'Ball'], ['disk', 'Flat disk'], ['cube', 'Cube']], value: shape, change: function (v) { shape = v; draw(); } });
  V.slider(B.ctl, { label: 'Turn the Earth', min: 0, max: 85, step: 1, value: turn, fmt: function (v) { return v + '°'; }, input: function (v) { turn = v; draw(); } });
  V.slider(B.ctl, { label: 'Into the shadow', min: 0.1, max: 0.9, step: 0.01, value: cover, fmt: function (v) { return Math.round(v * 100) + '%'; }, input: function (v) { cover = v; draw(); } });
  c.onResize(draw); V.onTheme(draw); draw();
});
