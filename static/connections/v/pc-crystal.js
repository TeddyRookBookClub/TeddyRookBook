/* The seven crystal systems: a turning unit cell (drag to turn it) with its edge lengths and angles. */
(function () {
  var D = Math.PI / 180;
  var S = [
    { n: 'Cubic', a: 1, b: 1, c: 1, al: 90, be: 90, ga: 90, rule: 'a = b = c, all angles 90°', ex: 'table salt (halite), pyrite, diamond' },
    { n: 'Tetragonal', a: 0.85, b: 0.85, c: 1.35, al: 90, be: 90, ga: 90, rule: 'a = b ≠ c, all angles 90°', ex: 'zircon, rutile' },
    { n: 'Orthorhombic', a: 0.75, b: 1.05, c: 1.35, al: 90, be: 90, ga: 90, rule: 'a, b, c all different, all angles 90°', ex: 'topaz, olivine, the common form of sulfur' },
    { n: 'Hexagonal', a: 1, b: 1, c: 1.4, al: 90, be: 90, ga: 120, rule: 'a = b ≠ c, two angles 90° and one 120°', ex: 'ice (hence six-armed snowflakes), beryl (emerald), graphite. The dashed lines show how three cells make a hexagonal prism' },
    { n: 'Trigonal', a: 1, b: 1, c: 1, al: 72, be: 72, ga: 72, rule: 'a = b = c, three equal angles that are not 90° (a squashed cube)', ex: 'calcite, and ruby and sapphire (both are corundum)' },
    { n: 'Monoclinic', a: 0.8, b: 1.05, c: 1.25, al: 90, be: 112, ga: 90, rule: 'a, b, c all different; one angle is not 90°', ex: 'gypsum, sugar (sucrose), the mica in granite' },
    { n: 'Triclinic', a: 0.8, b: 1.05, c: 1.25, al: 80, be: 108, ga: 98, rule: 'a, b, c all different; no angle is 90°', ex: 'turquoise, kyanite' }
  ];
  function vecs(s) { // standard crystallographic setting: a along x, b in the xy plane
    var ca = Math.cos(s.al * D), cb = Math.cos(s.be * D), cg = Math.cos(s.ga * D), sg = Math.sin(s.ga * D);
    var A = [s.a, 0, 0], B = [s.b * cg, s.b * sg, 0];
    var cx = cb, cy = (ca - cb * cg) / sg, cz = Math.sqrt(Math.max(0, 1 - cx * cx - cy * cy));
    return [A, B, [s.c * cx, s.c * cy, s.c * cz]];
  }
  Cx.viz('pc-crystal', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}');
    var si = 0, yaw = 0.6, pitch = 0.35, raf = 0, last = 0, drag = null, seen = true;
    var btns = S.map(function (s, i) { return '<button type="button" class="cx-btn" data-i="' + i + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + s.n + '</button>'; }).join('');
    root.innerHTML = '<div class="vb-row vb-wrap" role="group" aria-label="Crystal system">' + btns + '</div>' +
      '<canvas class="vb-cv" role="img"></canvas><p class="vb-cap" aria-live="polite"></p><p class="vb-note">Drag the cell to turn it.</p>';
    var cv = root.querySelector('canvas'), cap = root.querySelector('.vb-cap');
    root.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { si = +b.dataset.i; root.querySelectorAll('[data-i]').forEach(function (x) { x.classList.toggle('vb-on', x === b); x.setAttribute('aria-pressed', x === b); }); draw(); }; });
    cv.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY, yaw, pitch]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; yaw = drag[2] + (e.clientX - drag[0]) / 120; pitch = Math.max(-1.3, Math.min(1.3, drag[3] + (e.clientY - drag[1]) / 120)); draw(); });
    cv.addEventListener('pointerup', function () { drag = null; });
    function draw() {
      var s = S[si], V = vecs(s), col = U.colors(), c = U.size(cv, cv.parentNode.clientWidth < 500 ? 0.85 : 0.5), ctx = c.ctx, w = c.w, h = c.h;
      var cy_ = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var ctr = [0, 0, 0]; V.forEach(function (v) { ctr[0] += v[0] / 2; ctr[1] += v[1] / 2; ctr[2] += v[2] / 2; });
      if (s.ga === 120) ctr = [0, 0, V[2][2] / 2];
      var sc = Math.min(w, h) * (s.ga === 120 ? 0.3 : 0.36);
      function pr(p) { // z is up; turn about z (yaw) then tilt (pitch)
        var x = p[0] - ctr[0], y = p[1] - ctr[1], z = p[2] - ctr[2];
        var x1 = x * cy_ - y * sy, y1 = x * sy + y * cy_;
        var y2 = y1 * cp - z * sp, z2 = y1 * sp + z * cp;
        return [w / 2 + sc * x1, h / 2 - sc * z2, y2];
      }
      function add(i, j, k) { return [i * V[0][0] + j * V[1][0] + k * V[2][0], i * V[0][1] + j * V[1][1] + k * V[2][1], i * V[0][2] + j * V[1][2] + k * V[2][2]]; }
      ctx.fillStyle = col.bg2; ctx.fillRect(0, 0, w, h);
      var corners = [], i, j, k;
      for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) for (k = 0; k < 2; k++) corners.push({ p: pr(add(i, j, k)), id: [i, j, k] });
      if (s.ga === 120) { // the hexagonal prism that three such cells make
        ctx.setLineDash([5, 4]); ctx.strokeStyle = col.accent; ctx.lineWidth = 1.4;
        [0, 1].forEach(function (z) {
          ctx.beginPath();
          [[1, 0], [1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1]].forEach(function (q, m) { var p = pr(add(q[0], q[1], z)); m ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
          ctx.closePath(); ctx.stroke();
        });
        [[1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1]].forEach(function (q) { var p = pr(add(q[0], q[1], 0)), r = pr(add(q[0], q[1], 1)); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(r[0], r[1]); ctx.stroke(); });
        ctx.setLineDash([]);
      }
      // edges
      ctx.lineCap = 'round';
      corners.forEach(function (A) { corners.forEach(function (B) {
        var d = 0, ax = -1; for (var q = 0; q < 3; q++) if (A.id[q] !== B.id[q]) { d++; ax = q; }
        if (d !== 1 || A.id[ax] > B.id[ax]) return;
        var base = A.id[0] + A.id[1] + A.id[2] - A.id[ax] === 0;
        ctx.beginPath(); ctx.moveTo(A.p[0], A.p[1]); ctx.lineTo(B.p[0], B.p[1]);
        ctx.strokeStyle = base ? col.glass[[1, 3, 0][ax]] : col.dim; ctx.lineWidth = base ? 4 : 1.6; ctx.stroke();
      }); });
      corners.sort(function (a, b) { return b.p[2] - a.p[2]; }).forEach(function (A) {
        var r = sc * 0.07 * (1 - A.p[2] * 0.15);
        ctx.beginPath(); ctx.arc(A.p[0], A.p[1], r, 0, 7); ctx.fillStyle = col.gold; ctx.fill(); ctx.strokeStyle = col.lead; ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      [['a', [0.5, 0, 0], 1], ['b', [0, 0.5, 0], 3], ['c', [0, 0, 0.5], 0]].forEach(function (L) {
        var p = pr(add(L[1][0], L[1][1], L[1][2])), o = pr([ctr[0], ctr[1], ctr[2]]), dx = p[0] - w / 2, dy = p[1] - h / 2, m = Math.hypot(dx, dy) || 1;
        ctx.fillStyle = col.glass[L[2]]; ctx.fillText(L[0], p[0] + dx / m * 16, p[1] + dy / m * 16);
      });
      cv.setAttribute('aria-label', s.n + ' unit cell: ' + s.rule);
      cap.innerHTML = '<b>' + s.n + ':</b> ' + s.rule + '. Edges a, b, c' + (s.al === 90 && s.be === 90 && s.ga === 90 ? '' : '; angles α = ' + s.al + '°, β = ' + s.be + '°, γ = ' + s.ga + '°') + '. Examples: ' + s.ex + '.';
    }
    function tick(t) { raf = 0; if (!seen) return; if (!drag) { yaw += Math.min(50, t - (last || t)) * 0.0004; draw(); } last = t; raf = requestAnimationFrame(tick); }
    draw(); U.onResize(root, draw); U.onTheme(draw);
    if (!U.still()) {
      new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen && !raf) { last = 0; raf = requestAnimationFrame(tick); } }).observe(cv);
    }
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
