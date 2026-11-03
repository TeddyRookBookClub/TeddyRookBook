/* gbgreeks.euclid-proportion-and-number: visuals gb-euclid-gcd (gbsA, our own designs; theme colors from MathLadder.viz.colors()). */
var RM = typeof ML.viz.reduced === 'function' ? ML.viz.reduced() : !!ML.viz.reduced;
function gbBox(el, cls) {
  var stage = document.createElement('div'); stage.className = 'gb-stage ' + (cls || ''); el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  return { stage: stage, ctl: ctl };
}

/* ---------- VII.1–2: Euclid's algorithm as cutting squares from a rectangle ---------- */
ML.viz.register('gb-euclid-gcd', function (el, opts, V) {
  var B = gbBox(el), c = V.canvas(B.stage, { aspect: 1.6, max: 380 }), ro = V.readout(el);
  var a = opts.a || 21, b = opts.b || 15, shown = 0;
  function steps() { var out = [], x = Math.max(a, b), y = Math.min(a, b); while (y > 0) { var q = Math.floor(x / y), r = x - q * y; out.push([x, y, q, r]); x = y; y = r; } return out; }
  function squares() { // the squares cut off, in order: [x0, y0, side]
    var out = [], X = 0, Y = 0, w = Math.max(a, b), h = Math.min(a, b);
    while (w > 0 && h > 0) {
      if (w >= h) { var q = Math.floor(w / h); for (var i = 0; i < q; i++) out.push([X + i * h, Y, h]); X += q * h; w -= q * h; }
      else { var q2 = Math.floor(h / w); for (var j = 0; j < q2; j++) out.push([X, Y + j * w, w]); Y += q2 * w; h -= q2 * w; }
    }
    return out;
  }
  function draw() {
    var k = V.colors(), ctx = c.ctx, W = Math.max(a, b), H = Math.min(a, b), pad = 14, s = Math.min((c.w - 2 * pad) / W, (c.h - 2 * pad) / H), ox = (c.w - W * s) / 2, oy = (c.h - H * s) / 2;
    ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
    var sq = squares(), st = steps(), cols = [k.greenSoft, k.goldSoft, k.blueSoft, k.purpleSoft, k.orangeSoft, k.tealSoft], edge = [k.green, k.gold, k.blue, k.purple, k.orange, k.teal];
    var lim = 0, cnt = 0; for (var i = 0; i < shown && i < st.length; i++) lim += st[i][2];
    sq.forEach(function (q, idx) {
      if (idx >= lim) return; var si = 0, acc = 0; for (var j = 0; j < st.length; j++) { acc += st[j][2]; if (idx < acc) { si = j; break; } }
      ctx.fillStyle = cols[si % 6]; ctx.strokeStyle = edge[si % 6]; ctx.lineWidth = 1.5; ctx.fillRect(ox + q[0] * s, oy + q[1] * s, q[2] * s, q[2] * s); ctx.strokeRect(ox + q[0] * s + .5, oy + q[1] * s + .5, q[2] * s - 1, q[2] * s - 1);
      if (q[2] * s > 22) { ctx.fillStyle = k.ink; ctx.font = '600 ' + Math.min(16, q[2] * s / 2.4) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(q[2]), ox + (q[0] + q[2] / 2) * s, oy + (q[1] + q[2] / 2) * s); }
      cnt++;
    });
    ctx.strokeStyle = k.ink; ctx.lineWidth = 2.5; ctx.strokeRect(ox, oy, W * s, H * s);
    var lines = st.slice(0, shown).map(function (r) { return r[0] + ' = ' + r[2] + ' × ' + r[1] + (r[3] ? ' + ' + r[3] : ''); });
    var done = shown >= st.length, g = st[st.length - 1][1];
    ro.set('A rectangle ' + W + ' by ' + H + '. ' + (shown ? 'Cut off the largest squares you can: <b>' + lines.join('</b>; <b>') + '</b>.' : 'Press <b>Cut</b> to take away the largest squares that fit.') + (done ? ' The last square, side <b>' + g + '</b>, measures both ' + W + ' and ' + H + ': it is their greatest common measure' + (g === 1 ? ', only the unit, so Euclid calls the numbers <em>prime to one another</em> (VII.1).' : ' (VII.2).') : ''));
    cut.disabled = done;
  }
  var sa = V.slider(B.ctl, { label: 'Length', min: 2, max: 40, step: 1, value: Math.max(a, b), input: function (v) { a = v; if (a === b) b = Math.max(1, b - 1); shown = 0; draw(); } });
  var sb = V.slider(B.ctl, { label: 'Width', min: 1, max: 39, step: 1, value: Math.min(a, b), input: function (v) { b = v; if (a === b) a = Math.min(40, a + 1); shown = 0; draw(); } });
  var cut = V.button(B.ctl, 'Cut', function () { shown++; draw(); }, 'pri');
  V.button(B.ctl, 'Reset', function () { shown = 0; draw(); });
  c.onResize(draw); V.onTheme(draw); draw();
});
