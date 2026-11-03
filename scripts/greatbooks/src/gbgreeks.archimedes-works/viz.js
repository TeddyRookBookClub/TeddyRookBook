/* gbgreeks.archimedes-works: visuals gb-lever, gb-crown, gb-circle-pi (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}
function gbWeight(ctx, x, y, w, h, fill, line, label, ink) {
  ctx.fillStyle = fill; ctx.strokeStyle = line; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - w * 0.35, y - h); ctx.lineTo(x + w * 0.35, y - h); ctx.lineTo(x + w / 2, y); ctx.lineTo(x - w / 2, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y - h - 5, 5, Math.PI, 0); ctx.stroke();
  if (label) { ctx.fillStyle = ink; ctx.font = '700 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y - h / 2); }
}

/* ---------- the law of the lever ---------- */
ML.viz.register('gb-lever', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 2.1, max: 300, min: 190 }), ro = V.readout(el);
  var L = { m: opts.m1 || 3, d: opts.d1 || 4 }, R = { m: opts.m2 || 2, d: opts.d2 || 6 }, tilt = 0, goal = 0, an = null;
  function torque() { return R.m * R.d - L.m * L.d; }
  function draw() {
    var k = V.colors(), ctx = c.ctx, cx = c.w / 2, cy = c.h * 0.5, half = Math.min(c.w * 0.44, 330), u = half / 8;
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    ctx.fillStyle = k.muted; ctx.beginPath(); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx - 22, cy + 46); ctx.lineTo(cx + 22, cy + 46); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    ctx.fillStyle = k.gold; ctx.fillRect(-half, -5, 2 * half, 10);
    ctx.fillStyle = k.ink; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center';
    for (var i = -8; i <= 8; i++) { ctx.fillRect(i * u - 0.75, -5, 1.5, i % 2 ? 5 : 10); if (i && i % 2 === 0) ctx.fillText(String(Math.abs(i)), i * u, -10); }
    [[L, -1, k.blue, k.blueSoft], [R, 1, k.green, k.greenSoft]].forEach(function (s) {
      var x = s[1] * s[0].d * u, h = 14 + s[0].m * 6, w = 26 + s[0].m * 3;
      ctx.save(); ctx.translate(x, 5); ctx.rotate(-tilt); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
      gbWeight(ctx, 0, 22 + h, w, h, s[3], s[2], String(s[0].m), k.ink); ctx.restore();
    });
    ctx.restore();
    var lt = L.m * L.d, rt = R.m * R.d, q = torque();
    ro.set('Left: weight <b>' + L.m + '</b> × distance <b>' + L.d + '</b> = <b>' + lt + '</b>. Right: weight <b>' + R.m + '</b> × distance <b>' + R.d + '</b> = <b>' + rt + '</b>. ' +
      (q === 0 ? '<b>They balance.</b> The weights are in the reverse ratio of their distances: ' + L.m + ' : ' + R.m + ' = ' + R.d + ' : ' + L.d + '.' : 'The ' + (q > 0 ? 'right' : 'left') + ' side goes down.'));
  }
  function settle() {
    var q = torque(); goal = q === 0 ? 0 : (q > 0 ? 1 : -1) * Math.min(0.2, 0.06 + Math.abs(q) * 0.006);
    if (RM) { tilt = goal; draw(); return; }
    if (!an) an = V.loop(el, function (dt) { tilt += (goal - tilt) * Math.min(1, dt * 6); draw(); if (Math.abs(goal - tilt) < 0.001) { tilt = goal; draw(); an.stop(); an = null; } });
    else an.start();
  }
  var row = function (lab, s, key, min, max) { return V.slider(B.ctl, { label: lab, min: min, max: max, step: 1, value: s[key], input: function (v) { s[key] = v; settle(); } }); };
  row('Left weight', L, 'm', 1, 8); row('Left distance', L, 'd', 1, 8); row('Right weight', R, 'm', 1, 8); row('Right distance', R, 'd', 1, 8);
  c.onResize(draw); V.onTheme(draw); settle(); draw();
});

/* ---------- the crown: weighing in air and in water ---------- */
ML.viz.register('gb-crown', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.9, max: 320, min: 210 }), ro = V.readout(el);
  var M = 1000, f = opts.silver == null ? 0.25 : opts.silver, wet = 0, goal = 0, an = null, RHO_G = 19.3, RHO_S = 10.5;
  function vols() { var vc = M * (1 - f) / RHO_G + M * f / RHO_S, vg = M / RHO_G; return { vc: vc, vg: vg }; }
  function draw() {
    var k = V.colors(), ctx = c.ctx, cx = c.w / 2, top = 34, arm = Math.min(c.w * 0.32, 230), v = vols();
    var diff = (v.vc - v.vg) * wet, tilt = Math.max(-0.1, Math.min(0.1, diff * 0.004));
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    ctx.fillStyle = k.muted; ctx.fillRect(cx - 3, top, 6, c.h * 0.36); ctx.fillRect(cx - 40, top + c.h * 0.36, 80, 5);
    var lx = cx - arm * Math.cos(tilt), ly = top - arm * Math.sin(tilt), rx = cx + arm * Math.cos(tilt), ry = top + arm * Math.sin(tilt);
    ctx.strokeStyle = k.gold; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
    var tankTop = c.h * 0.62, tankH = c.h - tankTop - 6, surf = tankTop + 14, drop = (tankTop - 30 - top) + wet * (tankH * 0.7);
    [lx, rx].forEach(function (tx) {
      var tw = Math.min(110, arm * 0.8);
      ctx.fillStyle = k.blueSoft; ctx.fillRect(tx - tw / 2, surf, tw, tankTop + tankH - surf);
      ctx.strokeStyle = k.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx - tw / 2, tankTop); ctx.lineTo(tx - tw / 2, tankTop + tankH); ctx.lineTo(tx + tw / 2, tankTop + tankH); ctx.lineTo(tx + tw / 2, tankTop); ctx.stroke();
    });
    function hang(x, y, isCrown) {
      ctx.strokeStyle = k.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + drop); ctx.stroke();
      var by = y + drop, s = isCrown ? Math.cbrt(v.vc / v.vg) : 1, w = 46 * s, h = 26 * s;
      if (isCrown) {
        ctx.fillStyle = k.goldSoft; ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(x - w / 2, by + h); ctx.lineTo(x - w / 2, by); ctx.lineTo(x - w / 4, by + h * 0.45); ctx.lineTo(x, by - h * 0.1); ctx.lineTo(x + w / 4, by + h * 0.45); ctx.lineTo(x + w / 2, by); ctx.lineTo(x + w / 2, by + h); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else { ctx.fillStyle = k.gold; ctx.fillRect(x - w / 2, by + 4, w, h - 4); ctx.strokeStyle = k.ink; ctx.lineWidth = 1; ctx.strokeRect(x - w / 2, by + 4, w, h - 4); }
      ctx.fillStyle = k.ink; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(isCrown ? 'crown' : 'pure gold', x, by - 12 * s - 4);
    }
    hang(lx, ly, true); hang(rx, ry, false);
    var wc = M - v.vc * wet, wg = M - v.vg * wet;
    ro.set(wet < 0.5
      ? 'In air the crown (' + Math.round(f * 100) + '% silver) and the lump of pure gold both weigh <b>' + M + ' g</b>, so the balance is level. Press <b>Lower into water</b>.'
      : 'In water each loses the weight of the water it pushes aside (Floating Bodies I.7). The gold pushes aside <b>' + V.fmt(v.vg, 1) + ' cm³</b> and weighs ' + V.fmt(wg, 1) + ' g; the crown pushes aside <b>' + V.fmt(v.vc, 1) + ' cm³</b> and weighs ' + V.fmt(wc, 1) + ' g. ' + (f > 0 ? 'The crown is bulkier, gets a bigger push up, and the gold side sinks: <b>the crown is not pure gold.</b>' : 'Same bulk, same push: the balance stays level. <b>Pure gold.</b>'));
  }
  function anim() { if (RM) { wet = goal; draw(); return; } if (an) an.stop(); an = V.loop(el, function (dt) { wet += (goal - wet) * Math.min(1, dt * 4); if (Math.abs(goal - wet) < 0.003) { wet = goal; an.stop(); an = null; } draw(); }); }
  V.slider(B.ctl, { label: 'Silver mixed into the crown', min: 0, max: 0.5, step: 0.05, value: f, fmt: function (x) { return Math.round(x * 100) + '%'; }, input: function (x) { f = x; draw(); } });
  var b = V.button(B.ctl, 'Lower into water', function () { goal = goal ? 0 : 1; b.textContent = goal ? 'Lift out of water' : 'Lower into water'; anim(); }, 'pri');
  c.onResize(draw); V.onTheme(draw); draw();
});

/* ---------- Measurement of a Circle: trapping the circle between polygons ---------- */
ML.viz.register('gb-circle-pi', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.5, max: 340 }), ro = V.readout(el), n = opts.n || 6;
  function draw() {
    var k = V.colors(), ctx = c.ctx, cx = c.w / 2, cy = c.h / 2, r = Math.min(c.w, c.h) * 0.4;
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    function poly(R, col, fill) { ctx.beginPath(); for (var i = 0; i <= n; i++) { var a = Math.PI / 2 + 2 * Math.PI * i / n + (R > r ? Math.PI / n : 0); var x = cx + R * Math.cos(a), y = cy - R * Math.sin(a); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); }
    poly(r / Math.cos(Math.PI / n), k.gold, k.goldSoft);
    ctx.fillStyle = k.bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    poly(r, k.blue, k.blueSoft);
    ctx.strokeStyle = k.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke(); ctx.setLineDash([]);
    var lo = n * Math.sin(Math.PI / n), hi = n * Math.tan(Math.PI / n);
    ro.set('With <b>' + n + '</b> sides: inner perimeter ÷ diameter = <b style="color:' + k.blue + '">' + lo.toFixed(5) + '</b>, outer = <b style="color:' + k.gold + '">' + hi.toFixed(5) + '</b>. The circle lies between, so π is between them.' + (n === 96 ? ' Archimedes, working by hand with careful fractions, rounded these to <b>3 10/71</b> (3.14085) and <b>3 1/7</b> (3.14286).' : ' Double the sides to squeeze tighter.'));
  }
  V.seg(B.ctl, { label: 'Sides', items: [[6, '6'], [12, '12'], [24, '24'], [48, '48'], [96, '96']], value: n, change: function (v) { n = +v; draw(); } });
  c.onResize(draw); V.onTheme(draw); draw();
});
