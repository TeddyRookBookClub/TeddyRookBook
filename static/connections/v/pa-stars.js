/* Star patterns by Hankin's "polygons in contact" method: from the middle of every edge of a tiling,
   two rays leave at a contact angle and stop where they meet rays from the neighboring edges. */
(function () {
  var PI = Math.PI, r3 = Math.sqrt(3), r2 = Math.SQRT2;
  function poly(cx, cy, n, R, rot) { var p = []; for (var k = 0; k < n; k++) { var a = rot + 2 * PI * k / n; p.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); } return p; }
  // each tiling: list of polygons (counterclockwise in screen space after y-down is fine as long as consistent) in unit-edge length
  function tiling(kind, W, H) {
    var out = [], i, j, x, y;
    if (kind === 'hex') { // 6.6.6
      var Rh = 1; for (j = -1; j * 1.5 < H + 2; j++) for (i = -1; i * r3 < W + 2; i++) {
        x = i * r3 + (j & 1) * r3 / 2; y = j * 1.5; out.push(poly(x, y, 6, Rh, PI / 6));
      }
    } else if (kind === '488') { // octagons and squares
      var s = 1 + r2, Ro = 1 / (2 * Math.sin(PI / 8)), Rs = r2 / 2;
      for (j = -1; j * s < H + 2; j++) for (i = -1; i * s < W + 2; i++) {
        out.push(poly(i * s, j * s, 8, Ro, PI / 8));
        out.push(poly(i * s + s / 2, j * s + s / 2, 4, Rs, PI / 4));
      }
    } else if (kind === '31212') { // dodecagons and triangles
      var R12 = 1 / (2 * Math.sin(PI / 12)), a = 2 + r3, Rt = 1 / r3;
      for (j = -1; j * a * r3 / 2 < H + 3; j++) for (i = -1; i * a < W + 3; i++) {
        x = i * a + (j & 1) * a / 2; y = j * a * r3 / 2;
        out.push(poly(x, y, 12, R12, PI / 12));
        // two triangles per lattice point, in the gaps above-right and below-right
        var d = a / r3; // distance from dodecagon center to triangle center
        out.push(poly(x + d * Math.cos(-PI / 6), y + d * Math.sin(-PI / 6), 3, Rt, PI / 6 + PI / 3));
        out.push(poly(x + d * Math.cos(PI / 6), y + d * Math.sin(PI / 6), 3, Rt, PI / 6));
      }
    } else { // square 4.4.4.4
      for (j = -1; j < H + 2; j++) for (i = -1; i < W + 2; i++) out.push(poly(i + 0.5, j + 0.5, 4, r2 / 2, PI / 4));
    }
    return out;
  }
  function hit(p, d, q, e) { var den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-9) return null; var t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den; return [p[0] + d[0] * t, p[1] + d[1] * t]; }
  function rot(v, a) { var c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; }
  Cx.viz('pa-stars', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}');
    var kind = '488', ang = 67.5, showT = false;
    root.innerHTML = '<div class="vb-row"><label class="cx-field"><span class="cx-lbl">Start from</span><select class=""><option value="sq">squares</option><option value="hex">hexagons</option><option value="488" selected>octagons + squares</option><option value="31212">12-gons + triangles</option></select></label>' +
      '<label class="cx-field"><span class="cx-lbl">Contact angle</span><input type="range" min="15" max="85" step="0.5" value="67.5" class="vb-rng"> <output>67.5°</output></label>' +
      '<label class="cx-chk"><input type="checkbox" class="vb-t"> Show the starting tiles</label></div>' +
      '<canvas class="vb-cv" role="img"></canvas><p class="vb-cap"></p>';
    var cv = root.querySelector('canvas'), out = root.querySelector('output'), cap = root.querySelector('.vb-cap');
    root.querySelector('select').onchange = function (e) { kind = e.target.value; draw(); };
    root.querySelector('.vb-rng').oninput = function (e) { ang = +e.target.value; out.textContent = ang + '°'; draw(); };
    root.querySelector('.vb-t').onchange = function (e) { showT = e.target.checked; draw(); };
    function draw() {
      var c = U.size(cv, 0.6), ctx = c.ctx, w = c.w, h = c.h, col = U.colors();
      var sc = Math.max(26, Math.min(w, h) / 7), th = ang * PI / 180;
      ctx.fillStyle = col.bg2; ctx.fillRect(0, 0, w, h);
      var P = tiling(kind, w / sc, h / sc);
      ctx.save(); ctx.scale(sc, sc);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      P.forEach(function (p, idx) {
        var n = p.length, m = [], dir = [], k;
        for (k = 0; k < n; k++) { var a = p[k], b = p[(k + 1) % n]; m.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); var L = Math.hypot(b[0] - a[0], b[1] - a[1]); dir.push([(b[0] - a[0]) / L, (b[1] - a[1]) / L]); }
        var star = [];
        for (k = 0; k < n; k++) {
          var k2 = (k + 1) % n;
          var q = hit(m[k], rot(dir[k], th), m[k2], rot([-dir[k2][0], -dir[k2][1]], -th));
          star.push(m[k], q || m[k]);
        }
        // fill the star (inner region) and the petals between star and tile
        ctx.beginPath(); star.forEach(function (s, i) { i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath();
        ctx.fillStyle = col.glass[n === 3 ? 2 : n === 4 ? 1 : n === 6 ? 0 : n === 8 ? 0 : 4]; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
        if (showT) { ctx.beginPath(); p.forEach(function (s, i) { i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath(); ctx.strokeStyle = col.dim; ctx.lineWidth = 1.2 / sc; ctx.setLineDash([4 / sc, 3 / sc]); ctx.stroke(); ctx.setLineDash([]); }
        ctx.beginPath(); star.forEach(function (s, i) { i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath();
        ctx.strokeStyle = col.gold; ctx.lineWidth = 5 / sc; ctx.stroke();
        ctx.strokeStyle = col.lead; ctx.lineWidth = 1.4 / sc; ctx.stroke();
      });
      ctx.restore();
      var names = { sq: 'squares', hex: 'hexagons', '488': 'octagons and squares', '31212': '12-sided polygons and triangles' };
      cv.setAttribute('aria-label', 'A star pattern built from a tiling of ' + names[kind] + ' with a contact angle of ' + ang + ' degrees');
      cap.textContent = 'Every line starts at the middle of an edge of the hidden tiling. Change the angle and the stars open and close. ' +
        (kind === '488' ? 'At 67.5° the octagons hold the classic eight-pointed star.' : kind === '31212' ? 'Here the 12-gons grow twelve-pointed stars.' : kind === 'hex' ? 'Hexagons give six-pointed stars.' : 'Squares give a simple woven lattice of four-pointed stars.');
    }
    draw(); U.onResize(root, draw); U.onTheme(draw);
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
