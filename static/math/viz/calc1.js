/* Math Ladder visuals made for Calculus 1 (course key calc1). Registered on window.MathLadder.viz; load after viz/core.js
   and homeschool/calc/cas.js. Functions are strings in the CAS's plain syntax ("x^2", "sin(u)", "sqrt(x)").

   calc1-chain: the chain rule as rates multiplying. Three number lines: x, then u = g(x), then y = f(u). A short
     interval [x, x + Δx] is carried to the u line and then to the y line; each step stretches (or shrinks, or flips)
     it by about the local rate, and the two stretch factors multiply.
     opts:
       g: "x^2"          the inside function (in x)
       f: "sin(u)"       the outside function (in u)
       x: 1              starting x                    dx: 0.5     starting Δx (the slider runs from 1 down to 0.001)
       xmin: -2, xmax: 2 range of the x slider (and of the top number line)
       gname: "g", fname: "f"   names used in the readout
       task, label       as for every visual

   calc1-product: the product rule as a growing rectangle. Sides f(x) and g(x); when x grows by Δx the sides grow by
     Δf and Δg, adding a strip g·Δf, a strip f·Δg and a tiny corner Δf·Δg. Best with f and g positive and increasing.
     opts:
       f: "x", g: "x^2"   the two factors (positive on the range)
       x: 1.5, dx: 0.4    starting x and Δx            xmin: 0.5, xmax: 3   range of the x slider
       task, label

   calc1-ladder: a ladder sliding down a wall, for related rates. The foot moves out at a steady rate; the top's
     speed is −(x/y)·dx/dt, which grows as the top nears the floor.
     opts:
       L: 13              ladder length (ft)           rate: 2   dx/dt, the foot's speed (ft/s)
       x: 5               starting distance of the foot from the wall
       task, label                                                                                                   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) return;
  var M = Math, fm = V.fmt;

  if (!D.getElementById('calc1-viz-css')) {
    var st = D.createElement('style'); st.id = 'calc1-viz-css';
    st.textContent = '.c1v .c1v-task{margin:0 0 .6rem;padding:.5rem .7rem;border-radius:10px;background:var(--mv-card);border:1px solid var(--mv-line);border-left:4px solid #b8963e;font-size:.95rem;line-height:1.45}' +
      '.c1v .c1v-key{display:inline-block;width:.8em;height:.8em;border-radius:3px;margin-right:.3em;vertical-align:-.05em}' +
      '.c1v .ml-readout b{font-variant-numeric:tabular-nums}.c1v .c1v-big{font-size:1.02rem}';
    D.head.appendChild(st);
  }
  function cf(src, v) {
    var C = W.CAS; if (!C) throw new Error('calc1 visuals need the CAS');
    var g = C.compile(C.parse(String(src)), [v]);
    return function (x) { try { var y = g(x); if (y && typeof y === 'object') return M.abs(y.im) < 1e-12 ? y.re : NaN; return +y; } catch (e) { return NaN; } };
  }
  function nd(f, x) { var h = 1e-5 * M.max(1, M.abs(x)); return (f(x + h) - f(x - h)) / (2 * h); }
  function num(v, d) { var x = +v; return isFinite(x) ? x : d; }
  function frame(el, o, label) {
    el.classList.add('c1v'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = V.el('p', 'c1v-task', o.task); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = V.el('div', 'c1v-box'); el.appendChild(F.box);
    F.ctl = V.el('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    return F;
  }
  function key(c) { return '<span class="c1v-key" style="background:' + c + '"></span>'; }
  function arrow(ctx, x1, y1, x2, y2, col, w) {
    var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(10, L * 0.45);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w || 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(a), y2 - hs * 0.6 * M.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.45), y2 - hs * M.sin(a - 0.45)); ctx.lineTo(x2 - hs * M.cos(a + 0.45), y2 - hs * M.sin(a + 0.45)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function text(ctx, s, x, y, o) {
    o = o || {}; var k = V.colors(); ctx.save(); ctx.font = (o.bold ? '700 ' : '600 ') + (o.size || 13) + 'px ' + (o.serif ? 'Georgia,serif' : 'system-ui,sans-serif');
    ctx.fillStyle = o.color || k.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore();
  }
  function niceTicks(lo, hi, px) { var span = hi - lo, raw = span / M.max(2, px / 70), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m, st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m, out = []; for (var t = M.ceil(lo / st) * st; t <= hi + 1e-9; t += st) out.push(+t.toFixed(10)); return out; }

  // ------------------------------------------------------------------ calc1-chain
  V.register('calc1-chain', function (el, o) {
    o = Object.assign({ g: 'x^2', f: 'sin(u)', x: 1, dx: 0.5, xmin: -2, xmax: 2, gname: 'g', fname: 'f' }, o || {});
    var g = cf(o.g, 'x'), f = cf(o.f, 'u'), xmin = num(o.xmin, -2), xmax = num(o.xmax, 2), S = { x: num(o.x, 1), dx: num(o.dx, 0.5) };
    var F = frame(el, o, 'The chain rule as rates multiplying: x, then u = ' + o.gname + '(x), then y = ' + o.fname + '(u)');
    var c = V.canvas(F.box, { aspect: 1.55, min: 300, max: 420 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', 'Three number lines. A short interval on the x line is carried to the u line and then to the y line.');
    var sx = V.slider(F.ctl, { label: 'x', min: xmin, max: xmax, step: (xmax - xmin) / 400, value: S.x, input: function (v) { S.x = v; draw(); } });
    var sd = V.slider(F.ctl, { label: 'Δx (shrink it)', min: -3, max: 0, step: 0.01, value: M.log10(M.max(0.001, S.dx)), fmt: function (v) { return fm(M.pow(10, v), v < -2 ? 4 : 3); }, input: function (v) { S.dx = M.pow(10, v); draw(); } });
    // ranges of the u and y lines from samples over the x range (padded)
    function range(fn) { var lo = Infinity, hi = -Infinity; for (var i = 0; i <= 200; i++) { var v = fn(xmin + (xmax - xmin + 1) * i / 200); if (isFinite(v)) { lo = M.min(lo, v); hi = M.max(hi, v); } } if (!isFinite(lo)) { lo = -1; hi = 1; } if (hi - lo < 1e-6) { lo -= 1; hi += 1; } var p = (hi - lo) * 0.08; return [lo - p, hi + p]; }
    var Rx = [xmin - (xmax - xmin) * 0.05, xmax + 1 + (xmax - xmin) * 0.05], Ru = range(g), Ry = range(function (x) { return f(g(x)); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, pad = 26, L = 58, R = w - 18;
      ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var rows = [{ y: h * 0.17, R: Rx, name: 'x', col: k.blue }, { y: h * 0.5, R: Ru, name: 'u', col: k.purple }, { y: h * 0.83, R: Ry, name: 'y', col: k.green }];
      function X(row, v) { return L + (v - row.R[0]) / (row.R[1] - row.R[0]) * (R - L); }
      var x0 = S.x, x1 = S.x + S.dx, u0 = g(x0), u1 = g(x1), y0 = f(u0), y1 = f(u1), vals = [[x0, x1], [u0, u1], [y0, y1]];
      // connectors
      for (var i = 0; i < 2; i++) {
        var A = rows[i], B = rows[i + 1];
        for (var j = 0; j < 2; j++) { ctx.strokeStyle = j ? k.orange : k.muted; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(A, vals[i][j]), A.y + 8); ctx.lineTo(X(B, vals[i + 1][j]), B.y - 8); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.setLineDash([]);
      }
      rows.forEach(function (row, i) {
        ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, row.y); ctx.lineTo(R, row.y); ctx.stroke();
        niceTicks(row.R[0], row.R[1], R - L).forEach(function (t) { var px = X(row, t); ctx.strokeStyle = k.axis; ctx.beginPath(); ctx.moveTo(px, row.y - 4); ctx.lineTo(px, row.y + 4); ctx.stroke(); text(ctx, fm(t, 3), px, row.y + 15, { size: 11, color: k.muted, align: 'center' }); });
        text(ctx, row.name, 14, row.y, { size: 18, serif: true, bold: true, color: row.col });
        var a = X(row, vals[i][0]), b = X(row, vals[i][1]);
        ctx.strokeStyle = row.col; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(a, row.y); ctx.lineTo(b === a ? a + 0.5 : b, row.y); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.fillStyle = k.bg; ctx.strokeStyle = row.col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(a, row.y, 5, 0, 2 * M.PI); ctx.fill(); ctx.stroke();
      });
      var r1 = (u1 - u0) / (x1 - x0), r2 = M.abs(u1 - u0) > 1e-12 ? (y1 - y0) / (u1 - u0) : NaN;
      text(ctx, '× ' + fm(r1, 2), w - 16, (rows[0].y + rows[1].y) / 2, { align: 'right', color: k.purple, bold: true, size: 14 });
      text(ctx, '× ' + (isFinite(r2) ? fm(r2, 2) : '—'), w - 16, (rows[1].y + rows[2].y) / 2, { align: 'right', color: k.green, bold: true, size: 14 });
      text(ctx, 'stretch', w - 16, (rows[0].y + rows[1].y) / 2 + 16, { align: 'right', color: k.muted, size: 11 });
      text(ctx, 'stretch', w - 16, (rows[1].y + rows[2].y) / 2 + 16, { align: 'right', color: k.muted, size: 11 });
      ctx.restore();
      var gp = nd(g, x0), fp = nd(f, u0), tot = (y1 - y0) / (x1 - x0);
      F.out.set(key(k.purple) + 'Δu/Δx = <b>' + fm(r1, 3) + '</b> (close to ' + o.gname + '′(' + fm(x0, 2) + ') = <b>' + fm(gp, 3) + '</b>). ' +
        key(k.green) + 'Δy/Δu = <b>' + (isFinite(r2) ? fm(r2, 3) : '—') + '</b> (close to ' + o.fname + '′(u) = <b>' + fm(fp, 3) + '</b> at u = ' + fm(u0, 3) + ').<br>' +
        '<span class="c1v-big">Δy/Δx = <b>' + fm(tot, 3) + '</b>, and ' + o.fname + '′(' + o.gname + '(x))·' + o.gname + '′(x) = ' + fm(fp, 3) + ' × ' + fm(gp, 3) + ' = <b>' + fm(fp * gp, 3) + '</b>. The rates multiply.</span>');
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: function (q) { Object.assign(S, q || {}); sx.set(S.x); draw(); } };
  });

  // ------------------------------------------------------------------ calc1-product
  V.register('calc1-product', function (el, o) {
    o = Object.assign({ f: 'x', g: 'x^2', x: 1.5, dx: 0.4, xmin: 0.5, xmax: 3 }, o || {});
    var f = cf(o.f, 'x'), g = cf(o.g, 'x'), xmin = num(o.xmin, 0.5), xmax = num(o.xmax, 3), S = { x: num(o.x, 1.5), dx: num(o.dx, 0.4) };
    var F = frame(el, o, 'The product rule as the area of a growing rectangle with sides f(x) and g(x)');
    var c = V.canvas(F.box, { aspect: 1.35, min: 280, max: 440 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', 'A rectangle with width f(x) and height g(x), plus the strips added when x grows.');
    V.slider(F.ctl, { label: 'x', min: xmin, max: xmax, step: (xmax - xmin) / 300, value: S.x, input: function (v) { S.x = v; draw(); } });
    V.slider(F.ctl, { label: 'Δx', min: 0.01, max: 1, step: 0.01, value: S.dx, input: function (v) { S.dx = v; draw(); } });
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h;
      var a = f(S.x), b = g(S.x), a2 = f(S.x + S.dx), b2 = g(S.x + S.dx), da = a2 - a, db = b2 - b;
      ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      ctx.font = '600 12px system-ui,sans-serif'; var lw = ctx.measureText('g(x) = ' + fm(b, 2)).width;
      var ox = M.max(54, lw + 16), oy = h - 34, W2 = M.max(a, a2), H2 = M.max(b, b2), sc = M.min((w - ox - 24) / W2, (oy - 18) / H2); ox = M.max(ox, (w - W2 * sc) / 2);
      function rect(x, y, ww, hh, fill, stroke) { ctx.fillStyle = fill; ctx.fillRect(ox + x * sc, oy - (y + hh) * sc, ww * sc, hh * sc); ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.strokeRect(ox + x * sc, oy - (y + hh) * sc, ww * sc, hh * sc); }
      rect(0, 0, a, b, k.blueSoft, k.blue);
      if (da > 0) rect(a, 0, da, b, k.orangeSoft, k.orange);
      if (db > 0) rect(0, b, a, db, k.greenSoft, k.green);
      if (da > 0 && db > 0) rect(a, b, da, db, k.redSoft, k.red);
      text(ctx, 'f(x) = ' + fm(a, 2), ox + a * sc / 2, oy + 16, { align: 'center', color: k.blue });
      text(ctx, 'g(x) = ' + fm(b, 2), ox - 8, oy - b * sc / 2, { align: 'right', color: k.blue, size: 12 });
      if (da > 0) text(ctx, 'Δf', ox + (a + da / 2) * sc, oy + 16, { align: 'center', color: k.orange, bold: true });
      if (db > 0) text(ctx, 'Δg', ox - 8, oy - (b + db / 2) * sc, { align: 'right', color: k.green, bold: true });
      text(ctx, 'f·g', ox + a * sc / 2, oy - b * sc / 2, { align: 'center', color: k.blue, bold: true, size: 15 });
      if (da * sc > 26) text(ctx, 'g·Δf', ox + (a + da / 2) * sc, oy - b * sc / 2, { align: 'center', color: k.orange, bold: true, size: 12 });
      if (db * sc > 16) text(ctx, 'f·Δg', ox + a * sc / 2, oy - (b + db / 2) * sc, { align: 'center', color: k.green, bold: true, size: 12 });
      ctx.restore();
      var s1 = b * da, s2 = a * db, cor = da * db, tot = a2 * b2 - a * b;
      F.out.set('Change in area = ' + key(k.orange) + 'g·Δf <b>' + fm(s1, 3) + '</b> + ' + key(k.green) + 'f·Δg <b>' + fm(s2, 3) + '</b> + ' + key(k.red) + 'corner Δf·Δg <b>' + fm(cor, 4) + '</b> = <b>' + fm(tot, 3) + '</b>.<br>' +
        'Divide by Δx = ' + fm(S.dx, 2) + ': <b>' + fm(tot / S.dx, 3) + '</b>. The corner over Δx is only <b>' + fm(cor / S.dx, 4) + '</b>: it vanishes as Δx → 0, leaving f′g + fg′ = <b>' + fm(nd(f, S.x) * b + a * nd(g, S.x), 3) + '</b>.');
    }
    c.onResize(draw); V.onTheme(draw); draw();
  });

  // ------------------------------------------------------------------ calc1-ladder
  V.register('calc1-ladder', function (el, o) {
    o = Object.assign({ L: 13, rate: 2, x: 5 }, o || {});
    var L = num(o.L, 13), rate = num(o.rate, 2), S = { x: M.min(num(o.x, 5), L * 0.97) }, anim = null;
    var F = frame(el, o, 'A ladder sliding down a wall: the foot moves at a steady rate, the top speeds up');
    function lab(ctx, s, x, y, col, al) { var k = V.colors(); ctx.save(); ctx.font = '700 13px system-ui,sans-serif'; var tw = ctx.measureText(s).width, bx = al === 'right' ? x - tw - 6 : al === 'center' ? x - tw / 2 - 3 : x - 3; ctx.fillStyle = k.bg; ctx.globalAlpha = 0.85; ctx.fillRect(bx, y - 9, tw + 6, 18); ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(s, bx + 3, y); ctx.restore(); }
    var c = V.canvas(F.box, { aspect: 1.45, min: 260, max: 400 });
    c.cv.setAttribute('role', 'img'); c.cv.setAttribute('aria-label', 'A ladder leaning on a wall, with arrows showing how fast the foot and the top move.');
    var sx = V.slider(F.ctl, { label: 'x: foot to wall (ft)', min: 0.5, max: +(L * 0.97).toFixed(2), step: 0.05, value: S.x, input: function (v) { S.x = v; draw(); } });
    var pb = V.button(F.ctl, '▶ Let it slide', function () {
      if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Let it slide'; return; }
      if (S.x > L * 0.95) S.x = 1; pb.textContent = '❚❚ Pause';
      anim = V.loop(el, function (dt) { S.x = M.min(L * 0.97, S.x + rate * dt * (V.reduced ? 0 : 1) + (V.reduced ? 0.02 : 0)); sx.set(S.x); draw(); if (S.x >= L * 0.97) { anim.stop(); anim = null; pb.textContent = '▶ Let it slide'; } });
    }, 'pri');
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, oy = h - 30, sc = M.min((w - 130) / (L * 1.05), (oy - 20) / (L * 1.05)), ox = M.max(84, (w - L * sc) / 2);
      var x = S.x, y = M.sqrt(M.max(0, L * L - x * x)), dydt = -(x / y) * rate;
      ctx.save(); ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = k.grid; ctx.fillRect(ox - 12, 10, 12, oy - 10); ctx.fillRect(ox - 12, oy, w - ox - 10, 10);
      ctx.strokeStyle = k.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox, 10); ctx.lineTo(ox, oy); ctx.lineTo(w - 10, oy); ctx.stroke();
      ctx.strokeStyle = k.orange; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox + x * sc, oy); ctx.lineTo(ox, oy - y * sc); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = k.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(ox + 2, oy - 14); ctx.lineTo(ox + x * sc, oy - 14); ctx.stroke(); ctx.setLineDash([]);
      lab(ctx, 'x = ' + fm(x, 2), ox + x * sc / 2, oy - 28, k.blue, 'center');
      lab(ctx, 'y = ' + fm(y, 2), ox - 18, oy - y * sc / 2, k.green, 'right');
      lab(ctx, 'L = ' + fm(L, 2), ox + x * sc / 2 + 14, oy - y * sc / 2, k.orange);
      lab(ctx, 'dx/dt', ox + x * sc + rate * 14 + 8, oy - 12, k.blue);
      lab(ctx, 'dy/dt', ox - 18, oy - y * sc + M.min(oy - 20, -dydt * 14) / 2 + 2 + 20, k.green, 'right');
      var ar = 14;
      arrow(ctx, ox + x * sc, oy + 0, ox + x * sc + rate * ar, oy, k.blue, 3);
      var dl = M.min(oy - 20, -dydt * ar); arrow(ctx, ox + 4, oy - y * sc, ox + 4, oy - y * sc + dl, k.green, 3);
      ctx.restore();
      F.out.set('x² + y² = ' + fm(L * L, 2) + ', so 2x·dx/dt + 2y·dy/dt = 0 and dy/dt = −(x/y)·dx/dt.<br>' +
        key(k.blue) + 'Foot: dx/dt = <b>' + fm(rate, 2) + '</b> ft/s (steady). ' + key(k.green) + 'Top: dy/dt = −(' + fm(x, 2) + '/' + fm(y, 2) + ')(' + fm(rate, 2) + ') = <b>' + fm(dydt, 2) + '</b> ft/s' + (x / y > 2 ? ', and it keeps speeding up as y shrinks.' : '.'));
    }
    c.onResize(draw); V.onTheme(draw); draw();
  });
})(window, document);
