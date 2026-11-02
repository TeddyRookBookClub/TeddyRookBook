/* Rose window: a compass-and-straightedge construction, one step at a time, for 6, 8, 12 or 16 petals. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', PI = Math.PI;
  Cx.viz('mp-rose', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}.vb-st .vb-svg{max-width:420px}');
    var n = 12, step = 0, R = 180, cx = 200, cy = 200;
    root.innerHTML = '<div class="vb-row"><label class="cx-field"><span class="cx-lbl">Petals</span><select class=""><option>6</option><option>8</option><option selected>12</option><option>16</option></select></label>' +
      '<button type="button" class="cx-btn" data-a="back">← Back</button><button type="button" class="cx-btn pri" data-a="next">Next step →</button></div>' +
      '<svg class="vb-svg" viewBox="0 0 400 400" role="img" aria-label="A rose window under construction"></svg><p class="vb-cap" aria-live="polite"></p>';
    var svg = root.querySelector('svg'), cap = root.querySelector('.vb-cap');
    root.querySelector('select').onchange = function (e) { n = +e.target.value; draw(); };
    root.querySelector('[data-a=next]').onclick = function () { if (step < 6) step++; draw(); };
    root.querySelector('[data-a=back]').onclick = function () { if (step > 0) step--; draw(); };
    function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
    function pt(r, a) { return [cx + r * Math.cos(a - PI / 2), cy + r * Math.sin(a - PI / 2)]; }
    function txt() {
      var divide = {
        6: 'Keep the compass open to the same radius. Starting at the top, step it around the circle: it fits exactly 6 times, because each chord equals the radius (the triangles are equilateral).',
        8: 'Draw a diameter, then its perpendicular bisector (swing equal arcs from both ends). That gives 4 points. Bisect each quarter the same way to get 8.',
        12: 'Step the compass around the circle at the same radius to get 6 points, then bisect each of those arcs to get 12.',
        16: 'Draw two perpendicular diameters for 4 points, bisect to get 8, and bisect again to get 16.'
      }[n];
      return [
        'Every rose window starts with one circle. Fix the compass point at the center and draw the outer rim.',
        divide,
        'Join opposite points through the center with a straightedge. These spokes will hold the stone tracery.',
        'Each petal is a small circle, sitting in its slice. For the small circles to touch each other and the rim, their radius must be r = R·sin(180°/n) ÷ (1 + sin(180°/n)). Masons found it with the compass by bisecting angles.',
        'Draw a hub circle in the middle and arcs (foils) joining it to the petals. Lancet points form where two arcs cross.',
        'Erase the construction lines and keep the stone.',
        'Add the glass. In a real window, pieces of colored glass are held in lead strips, and the stone tracery carries the weight.'
      ][step];
    }
    function draw() {
      var col = U.colors(), fin = step >= 5; svg.innerHTML = '';
      var guide = { fill: 'none', stroke: col.dim, 'stroke-width': 1, 'stroke-dasharray': '4 3' };
      var stone = { fill: 'none', stroke: fin ? col.lead : col.fg, 'stroke-width': fin ? 3 : 2 };
      var thin = Object.assign({}, stone, { 'stroke-width': fin ? 2 : 1.4 });
      el('rect', { x: 0, y: 0, width: 400, height: 400, fill: col.bg2, rx: 12 });
      var s = Math.sin(PI / n), rp = R * s / (1 + s), rc = R - rp, hub = R * 0.24, i, a, p, q;
      var lob = (rc - rp - hub) * 0.34, lr = (hub + rc - rp) / 2;
      var gG = el('g', {}), cG = el('g', {}), sG = el('g', {});
      function C(x, y, r, at, g) { return el('circle', Object.assign({ cx: x, cy: y, r: r }, at), g); }
      if (step >= 6) {
        C(cx, cy, R, { fill: col.glass[3] }, gG);
        for (i = 0; i < n; i++) {
          a = 2 * PI * i / n; p = pt(rc, a); q = pt(lr, a + PI / n);
          C(p[0], p[1], rp, { fill: col.glass[i % 2 ? 1 : 0] }, gG);
          C(p[0], p[1], rp * 0.38, { fill: col.glass[2] }, gG);
          C(q[0], q[1], lob, { fill: col.glass[5] }, gG);
        }
        C(cx, cy, hub, { fill: col.glass[4] }, gG);
        C(cx, cy, hub * 0.4, { fill: col.glass[2] }, gG);
      }
      C(cx, cy, R, stone, sG);
      if (!fin) C(cx, cy, 3, { fill: col.accent }, cG);
      if (step >= 1 && !fin) for (i = 0; i < n; i++) {
        p = pt(R, 2 * PI * i / n);
        if (step === 1) C(p[0], p[1], n === 6 ? R : R * 0.5, guide, cG);
        C(p[0], p[1], 4, { fill: col.accent }, cG);
      }
      if (step >= 2) for (i = 0; i < n / 2; i++) {
        p = pt(R, 2 * PI * i / n); q = pt(R, 2 * PI * i / n + PI);
        el('line', Object.assign({ x1: p[0], y1: p[1], x2: q[0], y2: q[1] }, fin ? thin : guide), fin ? sG : cG);
      }
      if (step === 3) C(cx, cy, rc, guide, cG);
      if (step >= 3) for (i = 0; i < n; i++) {
        p = pt(rc, 2 * PI * i / n); C(p[0], p[1], rp, stone, sG);
        if (fin) C(p[0], p[1], rp * 0.38, thin, sG);
      }
      if (step >= 4) {
        C(cx, cy, hub, stone, sG); if (fin) C(cx, cy, hub * 0.4, thin, sG);
        for (i = 0; i < n; i++) { q = pt(lr, 2 * PI * i / n + PI / n); C(q[0], q[1], lob, stone, sG); }
      }
      svg.setAttribute('aria-label', 'Rose window with ' + n + ' petals, step ' + (step + 1) + ' of 7');
      cap.innerHTML = '<b>Step ' + (step + 1) + ' of 7.</b> ' + txt();
      root.querySelector('[data-a=back]').disabled = step === 0;
      root.querySelector('[data-a=next]').disabled = step === 6;
    }
    draw(); U.onTheme(draw);
  });
  function VU(v, css) {
    if (css && !document.getElementById('vb-css-' + v.id)) { var st = document.createElement('style'); st.id = 'vb-css-' + v.id; st.textContent = css; document.head.appendChild(st); }
    v.stage.classList.add('vb-st');
    return {
      dark: v.dark, still: function () { return v.reduced; }, onTheme: v.onTheme,
      colors: function () { var c = v.colors(), d = c.dark; return { bg2: c.bg, fg: c.ink, dim: c.muted, accent: c.green, gold: c.gold, lead: d ? '#0b0d0e' : '#2a2622',
        glass: d ? ['#4a86e8', '#e0584a', '#e6b93e', '#3faa72', '#9a6ad6', '#4fb8c8'] : ['#2d63b8', '#c0392b', '#d9a521', '#2e8b57', '#7a4bb0', '#2a9bb0'] }; },
      size: function (cv, ratio) {
        var w = cv.parentNode.clientWidth || 600, h = Math.round(w * ratio), r = Math.min(2, window.devicePixelRatio || 1);
        if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.height = h + 'px'; }
        var ctx = cv.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0); return { ctx: ctx, w: w, h: h };
      },
      onResize: function (el, f) { var t, lw = el.clientWidth; try { new ResizeObserver(function () { if (!el.clientWidth || el.clientWidth === lw) return; lw = el.clientWidth; clearTimeout(t); t = setTimeout(f, 80); }).observe(el); } catch (e) { } }
    };
  }
})();
