/* Times tables on a circle: join point i to point k × i (counting around the circle, so mod n). Curves appear. */
(function () {
  var NAMES = { 2: 'a cardioid (heart shape), with 1 point', 3: 'a nephroid (kidney shape), with 2 points', 4: 'a curve with 3 points', 5: 'a curve with 4 points' };
  Cx.viz('ma-times', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}');
    var n = 200, k = 2, raf = 0, last = 0;
    root.innerHTML = '<div class="vb-row"><label class="cx-field"><span class="cx-lbl">Points</span><input type="range" min="10" max="400" step="1" value="200" class="vb-n"> <output class="vb-on">200</output></label>' +
      '<label class="cx-field"><span class="cx-lbl">Times table</span><input type="range" min="2" max="60" step="0.01" value="2" class="vb-k"> <output class="vb-ok">2</output></label>' +
      '<button type="button" class="cx-btn" data-a="play" aria-pressed="false">Play</button></div>' +
      '<canvas class="vb-cv" role="img"></canvas><p class="vb-cap" aria-live="off"></p>';
    var cv = root.querySelector('canvas'), cap = root.querySelector('.vb-cap'), ni = root.querySelector('.vb-n'), ki = root.querySelector('.vb-k'), pb = root.querySelector('[data-a=play]');
    ni.oninput = function () { n = +ni.value; root.querySelector('.vb-on').textContent = n; draw(); };
    ki.oninput = function () { k = +ki.value; root.querySelector('.vb-ok').textContent = k.toFixed(2).replace(/\.?0+$/, ''); draw(); };
    function step(t) { raf = 0; if (!pb.dataset.on) return; k += Math.min(50, t - (last || t)) * 0.0004; if (k > 60) k = 2; last = t; ki.value = k; root.querySelector('.vb-ok').textContent = k.toFixed(2); draw(); raf = requestAnimationFrame(step); }
    pb.onclick = function () {
      if (pb.dataset.on) { delete pb.dataset.on; pb.textContent = 'Play'; pb.setAttribute('aria-pressed', 'false'); return; }
      pb.dataset.on = 1; pb.textContent = 'Pause'; pb.setAttribute('aria-pressed', 'true'); last = 0; if (!raf) raf = requestAnimationFrame(step);
    };
    new IntersectionObserver(function (es) { if (!es[0].isIntersecting && pb.dataset.on) pb.onclick(); }).observe(cv);
    function draw() {
      var col = U.colors(), dk = U.dark(), c = U.size(cv, cv.parentNode.clientWidth < 500 ? 1 : 0.5), ctx = c.ctx, w = c.w, h = c.h;
      var R = Math.min(w, h) * 0.45, cx = w / 2, cy = h / 2, i;
      ctx.fillStyle = col.bg2; ctx.fillRect(0, 0, w, h);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.strokeStyle = col.dim; ctx.lineWidth = 1; ctx.stroke();
      function P(x) { var a = Math.PI / 2 + 2 * Math.PI * x / n; return [cx - R * Math.cos(a), cy - R * Math.sin(a)]; }
      ctx.lineWidth = n > 250 ? 0.7 : 1;
      for (i = 0; i < n; i++) {
        var a = P(i), b = P((i * k) % n);
        ctx.strokeStyle = 'hsla(' + Math.round(360 * i / n) + ',' + (dk ? '75%,65%' : '70%,40%') + ',0.75)';
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      if (n <= 40) for (i = 0; i < n; i++) { var p = P(i); ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, 7); ctx.fillStyle = col.fg; ctx.fill(); }
      var kr = Math.round(k * 100) / 100, whole = Math.abs(kr - Math.round(kr)) < 0.005 ? Math.round(kr) : 0;
      cv.setAttribute('aria-label', 'The ' + kr + ' times table drawn on a circle of ' + n + ' points');
      cap.textContent = 'Point 1 joins point ' + kr + ', point 2 joins point ' + Math.round(2 * kr * 100) / 100 + ', and so on, counting around the circle (so ' + n + ' is back at 0). ' +
        (whole && NAMES[whole] ? 'The ' + whole + ' times table makes ' + NAMES[whole] + '.' : whole ? 'With the ' + whole + ' times table the curve has ' + (whole - 1) + ' points.' : 'Between whole numbers the curve twists from one shape to the next.');
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
