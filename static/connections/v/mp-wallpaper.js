/* Wallpaper groups explorer: builds a tiling from one motif with each of the 17 plane symmetry groups.
   Symmetry operations are the general positions from the International Tables, in cell (fractional) coordinates. */
(function () {
  var H = Math.sqrt(3) / 2;
  var L = { obl: [[1, 0], [0.32, 0.86]], rect: [[1, 0], [0, 0.72]], crect: [[1, 0], [0, 1.3]], sq: [[1, 0], [0, 1]], hex: [[1, 0], [-0.5, H]] };
  // op: [a,b,c,d,e,f] means x' = a x + b y + e, y' = c x + d y + f
  function O(s) { return s; }
  var I = [1, 0, 0, 1, 0, 0], R2 = [-1, 0, 0, -1, 0, 0], MX = [-1, 0, 0, 1, 0, 0], MY = [1, 0, 0, -1, 0, 0];
  var R4 = [[0, -1, 1, 0, 0, 0], [0, 1, -1, 0, 0, 0]];
  var R3 = [[0, -1, 1, -1, 0, 0], [-1, 1, -1, 0, 0, 0]];
  var R6 = [[0, 1, -1, 1, 0, 0], [1, -1, 1, 0, 0, 0]];
  var M31 = [[0, -1, -1, 0, 0, 0], [-1, 1, 0, 1, 0, 0], [1, 0, 1, -1, 0, 0]];
  var M3b = [[0, 1, 1, 0, 0, 0], [1, -1, 0, -1, 0, 0], [-1, 0, -1, 1, 0, 0]];
  var G = [
    { n: 'p1', o: 'o', lat: 'obl', ops: [I], d: 'Only sliding (translations). No turns, no mirrors.' },
    { n: 'p2', o: '2222', lat: 'obl', ops: [I, R2], d: 'Half-turns: spin any copy 180° about the right point and the pattern lands on itself.' },
    { n: 'pm', o: '**', lat: 'rect', ops: [I, MX], d: 'Parallel mirror lines.' },
    { n: 'pg', o: 'xx', lat: 'rect', ops: [I, [-1, 0, 0, 1, 0, 0.5]], d: 'Glide reflections: reflect, then slide along the mirror, like footprints.' },
    { n: 'cm', o: '*x', lat: 'crect', c: 1, ops: [I, MX], d: 'Mirrors, with glides halfway between them.' },
    { n: 'pmm', o: '*2222', lat: 'rect', ops: [I, R2, MX, MY], d: 'Mirrors in two directions at right angles, with half-turns where they cross.' },
    { n: 'pmg', o: '22*', lat: 'rect', ops: [I, R2, [-1, 0, 0, 1, 0.5, 0], [1, 0, 0, -1, 0.5, 0]], d: 'Mirrors one way, glides the other way, and half-turns.' },
    { n: 'pgg', o: '22x', lat: 'rect', ops: [I, R2, [-1, 0, 0, 1, 0.5, 0.5], [1, 0, 0, -1, 0.5, 0.5]], d: 'Glides in two directions and half-turns, but no mirrors.' },
    { n: 'cmm', o: '2*22', lat: 'crect', c: 1, ops: [I, R2, MX, MY], d: 'Mirrors both ways, plus extra half-turns between them.' },
    { n: 'p4', o: '442', lat: 'sq', ops: [I, R2, R4[0], R4[1]], d: 'Quarter-turns (90°), no mirrors.' },
    { n: 'p4m', o: '*442', lat: 'sq', ops: [I, R2, R4[0], R4[1], MX, MY, [0, 1, 1, 0, 0, 0], [0, -1, -1, 0, 0, 0]], d: 'Quarter-turns and mirrors in four directions, like a checkerboard.' },
    { n: 'p4g', o: '4*2', lat: 'sq', ops: [I, R2, R4[0], R4[1], [-1, 0, 0, 1, 0.5, 0.5], [1, 0, 0, -1, 0.5, 0.5], [0, 1, 1, 0, 0.5, 0.5], [0, -1, -1, 0, 0.5, 0.5]], d: 'Quarter-turns, with mirrors that do not pass through the quarter-turn points. A woven look.' },
    { n: 'p3', o: '333', lat: 'hex', ops: [I, R3[0], R3[1]], d: 'Third-turns (120°), no mirrors.' },
    { n: 'p3m1', o: '*333', lat: 'hex', ops: [I, R3[0], R3[1]].concat(M31), d: 'Third-turns, all sitting on mirror lines.' },
    { n: 'p31m', o: '3*3', lat: 'hex', ops: [I, R3[0], R3[1]].concat(M3b), d: 'Third-turns, some on mirrors and some off them.' },
    { n: 'p6', o: '632', lat: 'hex', ops: [I, R3[0], R3[1], R2, R6[0], R6[1]], d: 'Sixth-turns (60°), no mirrors.' },
    { n: 'p6m', o: '*632', lat: 'hex', ops: [I, R3[0], R3[1], R2, R6[0], R6[1]].concat(M31, M3b), d: 'Sixth-turns and mirrors in six directions: the most symmetric of all, like a honeycomb or a snowflake.' }
  ];
  function rnd(s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function motif(seed) { // a lopsided leaf and a dot, in cell units, near the cell origin
    var r = rnd(seed), pts = [], k, n = 7;
    for (k = 0; k < n; k++) {
      var t = k / n * Math.PI * 2, rr = 0.07 + 0.08 * r();
      pts.push([0.26 + rr * Math.cos(t) * (1.2 + 0.4 * r()), 0.12 + rr * Math.sin(t) * 0.75]);
    }
    pts.splice(1, 0, [0.48 + 0.06 * r(), 0.1 + 0.05 * r()]); // a tail makes it lopsided
    return { leaf: pts, dot: [0.2 + 0.05 * r(), 0.14 + 0.04 * r()] };
  }
  Cx.viz('mp-wallpaper', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}');
    var gi = 16, seed = 7, showCell = true, mt = motif(seed), off = [0, 0];
    root.innerHTML = '<div class="vb-row"><label class="cx-field"><span class="cx-lbl">Group</span><select class=""></select></label>' +
      '<button type="button" class="cx-btn" data-a="new">New motif</button>' +
      '<label class="cx-chk"><input type="checkbox" checked> Show the repeating cell</label></div>' +
      '<canvas class="vb-cv" width="640" height="400" role="img"></canvas><p class="vb-cap" aria-live="polite"></p>';
    var sel = root.querySelector('select'), cv = root.querySelector('canvas'), cap = root.querySelector('.vb-cap');
    G.forEach(function (g, i) { var o = document.createElement('option'); o.value = i; o.textContent = g.n + '  (' + g.o + ')'; sel.appendChild(o); });
    sel.value = gi;
    sel.onchange = function () { gi = +sel.value; draw(); };
    root.querySelector('[data-a=new]').onclick = function () { seed = (seed * 31 + 17) % 9973; mt = motif(seed); draw(); };
    root.querySelector('input').onchange = function (e) { showCell = e.target.checked; draw(); };
    var drag = null;
    cv.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY, off[0], off[1]]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; off = [drag[2] + (e.clientX - drag[0]) / 300, drag[3] + (e.clientY - drag[1]) / 300]; draw(); });
    cv.addEventListener('pointerup', function () { drag = null; });
    function draw() {
      var g = G[gi], B = L[g.lat], c = U.size(cv, 0.62), ctx = c.ctx, w = c.w, h = c.h, col = U.colors();
      var s = Math.min(w, h) / (g.lat === 'crect' ? 3 : 3.4);
      ctx.fillStyle = col.bg2; ctx.fillRect(0, 0, w, h);
      function P(x, y) { return [w / 2 + s * (x * B[0][0] + y * B[1][0]), h / 2 - s * (x * B[0][1] + y * B[1][1])]; }
      function ap(op, p) { return [op[0] * p[0] + op[1] * p[1] + op[4], op[2] * p[0] + op[3] * p[1] + op[5]]; }
      var ops = g.ops.slice();
      if (g.c) ops = ops.concat(g.ops.map(function (o) { return [o[0], o[1], o[2], o[3], o[4] + 0.5, o[5] + 0.5]; }));
      var lf = mt.leaf.map(function (p) { return [p[0] + off[0] * 0.3, p[1] - off[1] * 0.3]; }), dt = [mt.dot[0] + off[0] * 0.3, mt.dot[1] - off[1] * 0.3];
      var n = Math.ceil(Math.max(w, h) / s) + 2, pal = col.glass;
      ctx.lineJoin = 'round';
      for (var i = -n; i <= n; i++) for (var j = -n; j <= n; j++) {
        var q = P(i, j); if (q[0] < -s * 2 || q[0] > w + s * 2 || q[1] < -s * 2 || q[1] > h + s * 2) continue;
        ops.forEach(function (op, k) {
          ctx.beginPath();
          lf.forEach(function (p, m) { var t = ap(op, p), z = P(t[0] + i, t[1] + j); m ? ctx.lineTo(z[0], z[1]) : ctx.moveTo(z[0], z[1]); });
          ctx.closePath();
          var det = op[0] * op[3] - op[1] * op[2];
          ctx.fillStyle = pal[(det < 0 ? 3 : 0) + (k % 3)];
          ctx.fill(); ctx.strokeStyle = col.lead; ctx.lineWidth = 1.2; ctx.stroke();
          var t = ap(op, dt), z = P(t[0] + i, t[1] + j);
          ctx.beginPath(); ctx.arc(z[0], z[1], s * 0.025, 0, 7); ctx.fillStyle = col.fg; ctx.fill();
        });
      }
      if (showCell) {
        ctx.beginPath(); [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(function (p, m) { var z = P(p[0], p[1]); m ? ctx.lineTo(z[0], z[1]) : ctx.moveTo(z[0], z[1]); });
        ctx.closePath(); ctx.setLineDash([6, 4]); ctx.lineWidth = 2.5; ctx.strokeStyle = col.accent; ctx.stroke(); ctx.setLineDash([]);
      }
      cv.setAttribute('aria-label', 'A tiling with symmetry group ' + g.n + ', built from ' + ops.length + ' copies of one motif per cell.');
      cap.innerHTML = '<b>' + g.n + '</b> <span class="vb-dim">(orbifold ' + g.o + ')</span>: ' + g.d + ' Each cell holds ' + ops.length + ' cop' + (ops.length > 1 ? 'ies' : 'y') + ' of the motif. Copies that are mirror images of the motif are green, purple or teal.';
    }
    draw();
    U.onResize(root, draw); U.onTheme(draw);
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
