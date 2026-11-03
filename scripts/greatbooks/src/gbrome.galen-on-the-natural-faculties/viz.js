/* gbrome.galen-on-the-natural-faculties: visuals gb-ureters (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

ML.viz.register('gb-ureters', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.4, max: 360, min: 230 }), ro = V.readout(el);
  var tie = { L: false, R: false }, fill = { L: 0, R: 0, bl: 0.15 }, run = null, drops = [];
  function draw() {
    var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, kx = [w * 0.27, w * 0.73], ky = h * 0.22, bx = w / 2, by = h * 0.78;
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
    ['L', 'R'].forEach(function (sd, i) {
      var x = kx[i];
      ctx.fillStyle = k.redSoft; ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, ky, 26, 38, i ? 0.25 : -0.25, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = k.ink; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('kidney', x + (i ? 38 : -38), ky - 32);
      var swell = 3 + 7 * fill[sd]; ctx.strokeStyle = k.gold; ctx.lineWidth = swell; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + (i ? -14 : 14), ky + 20); ctx.quadraticCurveTo(x + (i ? -40 : 40), (ky + by) / 2, bx + (i ? 24 : -24), by - 26); ctx.stroke();
      if (tie[sd]) { var tx = x + (i ? -36 : 36), ty = (ky + by) / 2 + 22; ctx.strokeStyle = k.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx - 12, ty - 4); ctx.lineTo(tx + 12, ty + 4); ctx.stroke(); ctx.fillStyle = k.ink; ctx.fillText('tied', tx + (i ? 30 : -30), ty + 4); }
    });
    ctx.fillStyle = k.panel; ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(bx, by, 46, 34, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.ellipse(bx, by, 45, 33, 0, 0, 7); ctx.clip(); ctx.fillStyle = k.goldSoft; ctx.fillRect(bx - 46, by + 34 - 68 * fill.bl, 92, 68 * fill.bl); ctx.restore();
    ctx.fillStyle = k.ink; ctx.textAlign = 'center'; ctx.fillText('bladder', bx, by + 50);
    drops.forEach(function (d) { ctx.fillStyle = k.gold; ctx.beginPath(); ctx.arc(d.x, d.y, 3, 0, 7); ctx.fill(); });
    var both = tie.L && tie.R, one = tie.L !== tie.R;
    ro.set(both ? '<b>Both tied:</b> the bladder stays empty, and each tube swells above its knot. Urine comes from the kidneys, down the ureters, and nowhere else.' : one ? '<b>One tied:</b> that side swells above the knot; urine still reaches the bladder from the other side.' : 'Nothing tied: urine made in the kidneys runs down both ureters into the bladder. Tie a ureter to test where urine comes from.');
  }
  function stepF(dt) {
    var w = c.w, h = c.h, kx = [w * 0.27, w * 0.73];
    ['L', 'R'].forEach(function (sd, i) { if (tie[sd]) fill[sd] = Math.min(1, fill[sd] + dt * 0.35); else { fill[sd] = Math.max(0, fill[sd] - dt * 0.8); if (Math.random() < dt * 2.2) drops.push({ s: sd, i: i, t: 0 }); } });
    drops.forEach(function (d) { d.t += dt * 0.55; var x0 = kx[d.i] + (d.i ? -14 : 14), y0 = h * 0.22 + 20, cxp = kx[d.i] + (d.i ? -40 : 40), cyp = (h * 0.22 + h * 0.78) / 2, x1 = w / 2 + (d.i ? 24 : -24), y1 = h * 0.78 - 26, u = d.t; d.x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cxp + u * u * x1; d.y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cyp + u * u * y1; });
    var arrived = drops.filter(function (d) { return d.t >= 1; }).length; drops = drops.filter(function (d) { return d.t < 1 && !(tie[d.s] && d.t > 0.5); });
    fill.bl = Math.min(0.9, fill.bl + arrived * 0.01); if (!tie.L || !tie.R) fill.bl = Math.max(0.1, fill.bl - dt * 0.01);
  }
  function settle() { if (RM) { fill.L = tie.L ? 1 : 0; fill.R = tie.R ? 1 : 0; fill.bl = tie.L && tie.R ? 0.05 : 0.5; draw(); } }
  var bl = V.button(B.ctl, 'Tie left ureter', function () { tie.L = !tie.L; bl.textContent = (tie.L ? 'Untie' : 'Tie') + ' left ureter'; settle(); draw(); });
  var br = V.button(B.ctl, 'Tie right ureter', function () { tie.R = !tie.R; br.textContent = (tie.R ? 'Untie' : 'Tie') + ' right ureter'; settle(); draw(); });
  V.button(B.ctl, 'Empty the bladder', function () { fill.bl = 0.05; draw(); });
  if (!RM) run = V.loop(el, function (dt) { stepF(dt); draw(); });
  c.onResize(draw); V.onTheme(draw); draw();
});
