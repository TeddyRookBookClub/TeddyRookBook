/* gb-cartes: the first figures of Descartes's Geometry (Book I), redrawn.
   "Multiply": choose a unit AB. Mark BD on the same line and BC on a second line through B. Join A to C and draw DE
   parallel to CA; then BE = BD x BC (similar triangles: BE / BC = BD / BA, with BA = 1).
   "Square root": put GH on a line, add EG = 1 before it, draw a half-circle on EH; the upright line from G meets the
   circle at I, and GI is the square root of GH (GI x GI = EG x GH).
   opts: mode: "mult" | "root"; a: 2 (BD); b: 1.5 (BC); x: 3 (GH); quiet: true hides the readout. */
(function () {
  var V = ML.viz; if (!V) return;
  var M = Math, TAU = 2 * M.PI;
  V.register('gb-cartes', function (el, o) {
    o = o || {};
    var mode = o.mode || 'mult', a = o.a || 2, b = o.b || 1.5, x = o.x || 3, th = 35;
    var box = V.el('div'); el.appendChild(box);
    var c = V.canvas(box, { aspect: 1.6, min: 230, max: 400 }); c.cv.setAttribute('role', 'img');
    var ctl = V.el('div', 'ml-ctl'); el.appendChild(ctl);
    V.seg(ctl, { label: 'Construction', items: [['mult', 'Multiply two lines'], ['root', 'Square root of a line']], value: mode, change: function (v) { mode = v; show(); draw(); } });
    var s1 = V.slider(ctl, { label: 'BD', min: 0.5, max: 3, step: 0.1, value: a, input: function (v) { a = v; draw(); } });
    var s2 = V.slider(ctl, { label: 'BC', min: 0.5, max: 2.5, step: 0.1, value: b, input: function (v) { b = v; draw(); } });
    var s3 = V.slider(ctl, { label: 'GH', min: 0.2, max: 8, step: 0.1, value: x, input: function (v) { x = v; draw(); } });
    var out = V.readout(el); if (o.quiet) out.el.hidden = true;
    function show() { var m = mode === 'mult'; s1.el.hidden = s2.el.hidden = !m; s3.el.hidden = m; }
    show();
    function clear(k) { var q = c.ctx; q.save(); q.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); q.fillStyle = k.bg; q.fillRect(0, 0, c.w, c.h); q.restore(); }
    function line(p, q, col, wd, dash) { var g = c.ctx; g.save(); g.strokeStyle = col; g.lineWidth = wd || 2; g.setLineDash(dash || []); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.restore(); }
    function pt(p, lab, col, dx, dy) { var g = c.ctx; g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1], 4, 0, TAU); g.fill(); g.font = 'italic 700 14px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, p[0] + (dx || 0), p[1] + (dy || -12)); }
    function draw() { var k = V.colors(); clear(k); if (mode === 'mult') mult(k); else root(k); }
    function mult(k) {
      var w = c.w, h = c.h, prod = a * b, maxU = M.max(3.2, a + 0.3), maxV = M.max(prod, b) + 0.3;
      var t = th * M.PI / 180, ux = M.cos(t), uy = M.sin(t);
      var s = M.min((w - 50) / (maxU + maxV * ux), (h - 50) / (maxV * uy));
      var fw = s * (maxU + maxV * ux), fh = s * maxV * uy, B = [M.max(24, (w - fw) / 2), h - 26 - M.max(0, (h - 50 - fh) / 2)];
      function P1(d) { return [B[0] + s * d, B[1]]; } function P2(d) { return [B[0] + s * d * ux, B[1] - s * d * uy]; }
      line(B, P1(maxU), k.muted, 1.5); line(B, P2(maxV), k.muted, 1.5);
      var A = P1(1), D = P1(a), C = P2(b), E = P2(prod);
      line(A, C, k.blue, 2.5); line(D, E, k.red, 2.5);
      line(B, E, k.green, 5);
      pt(B, 'B', k.ink, -10, 10); pt(A, 'A', k.ink, 0, 14); pt(D, 'D', k.red, 0, 14); pt(C, 'C', k.blue, -12, -6); pt(E, 'E', k.red, -12, -6);
      c.cv.setAttribute('aria-label', 'Multiplying lines: with AB as the unit, BD = ' + V.fmt(a) + ' and BC = ' + V.fmt(b) + ' give BE = ' + V.fmt(prod));
      out.set('AB is the unit (1). BD = ' + V.fmt(a) + ', BC = ' + V.fmt(b) + '. DE is drawn parallel to AC, so triangles BAC and BDE have the same shape: BE ÷ BC = BD ÷ 1. So <b>BE = ' + V.fmt(a) + ' × ' + V.fmt(b) + ' = ' + V.fmt(prod, 2) + '</b>, a line, not an area.');
    }
    function root(k) {
      var w = c.w, h = c.h, tot = 1 + x, r = tot / 2, s = M.min((w - 40) / tot, (h - 40) / r);
      var y0 = h - 22, E = [20, y0], G = [20 + s, y0], H = [20 + s * tot, y0], K = [20 + s * r, y0], gi = M.sqrt(x), I = [G[0], y0 - s * gi];
      var g = c.ctx; g.save(); g.strokeStyle = k.blue; g.lineWidth = 2; g.beginPath(); g.arc(K[0], K[1], s * r, M.PI, TAU); g.stroke(); g.restore();
      line(E, H, k.ink, 2); line(E, G, k.gold, 5); line(G, I, k.green, 5);
      line(E, I, k.muted, 1.2, [4, 4]); line(I, H, k.muted, 1.2, [4, 4]);
      pt(E, 'E', k.ink, 0, 14); pt(G, 'G', k.ink, 0, 14); pt(H, 'H', k.ink, 0, 14); pt(K, 'K', k.blue, 0, 14); pt(I, 'I', k.green, 10, -8);
      c.cv.setAttribute('aria-label', 'Square root construction: GH = ' + V.fmt(x) + ', GI = ' + V.fmt(gi, 3));
      out.set('EG = 1 and GH = ' + V.fmt(x) + '. The half-circle stands on EH, with center K. The upright line from G meets it at I. The angle at I is a right angle, so GI × GI = EG × GH = ' + V.fmt(x) + '. So <b>GI = √' + V.fmt(x) + ' ≈ ' + V.fmt(gi, 3) + '</b>.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return {};
  });
})();
