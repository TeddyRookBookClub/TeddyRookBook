/* Stained-glass color lab: pick what goes into the melt, then tap pieces of a lancet window to glaze them. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var A = [
    { k: 'co', n: 'Cobalt', c: '#1f3fa8', d: '#4a6fe0', how: 'ions', t: 'Cobalt ions soak up red, orange and yellow light, so the light that gets through is deep blue. A small pinch colors a whole pot. This is the blue of many cathedral windows.' },
    { k: 'cu2', n: 'Copper, in air', c: '#2f9e9a', d: '#4cc4bf', how: 'ions', t: 'With plenty of air in the furnace, copper sits in the glass as ions that soak up red light. What passes through is blue-green, like turquoise.' },
    { k: 'cu0', n: 'Copper, starved of air', c: '#a3161c', d: '#d8423f', how: 'particles', t: 'Starve the fire of air and the copper clumps into tiny specks of metal, which turn the glass red. Medieval red was so dark that makers "flashed" it: a thin red layer on clear glass.' },
    { k: 'fe', n: 'Iron', c: '#6f9a3e', d: '#8fc25a', how: 'ions', t: 'Iron is in most sand, which is why old window glass looks faintly green. More iron gives greens and yellows; with sulfur it can make amber and brown.' },
    { k: 'mn', n: 'Manganese', c: '#8a3f8f', d: '#b36ab8', how: 'ions', t: 'Manganese gives pinks and purples. A little of it can also cancel the green of iron, so glassmakers used it to make clearer glass.' },
    { k: 'au', n: 'Gold', c: '#c2185b', d: '#ea4c89', how: 'particles', t: 'Specks of gold a few dozen millionths of a millimeter across make a rose-red called gold ruby. Johann Kunckel made it around 1679. The Roman Lycurgus Cup (4th century AD) gets its glow from specks of gold and silver.' },
    { k: 'ag', n: 'Silver stain', c: '#e0b21c', d: '#f0c84a', how: 'particles', t: 'Painted on the surface and fired, a silver compound turns glass yellow; on blue glass it makes green. Glaziers found this early in the 14th century, so one piece could hold two colors.' },
    { k: 'cr', n: 'Chromium', c: '#1e7b4f', d: '#3fae78', how: 'ions', t: 'Chromium gives an emerald green. It is a newer color: chromium was only discovered in 1797, so no medieval window has it.' }
  ];
  var START = { border: 'cu0', q: ['co', 'co', 'ag', 'co'], med: ['cu0', 'ag', 'fe', 'au'], ctr: 'co' };
  Cx.viz('pc-glass', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}.vb-glass{display:grid;gap:1rem}@media(min-width:700px){.vb-glass{grid-template-columns:minmax(180px,260px) 1fr;align-items:start}}.vb-gw .vb-svg{max-width:240px}.vb-sw i{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid rgba(0,0,0,.3)}.vb-lab{margin:.2rem 0 .4rem;font-weight:600;font-size:.88rem}.vb-card{margin-top:.6rem;font-size:.92rem;line-height:1.5}.vb-card p{margin:.3rem 0}.vb-tag{font-size:.75rem;font-weight:600;border:1px solid currentColor;border-radius:99px;padding:1px 8px;opacity:.8;margin-left:.3rem;white-space:nowrap}');
    var cur = 0;
    root.innerHTML = '<div class="vb-glass"><div class="vb-gw"><svg class="vb-svg" viewBox="0 0 240 400" role="img" aria-label="A lancet window made of colored glass"></svg></div>' +
      '<div class="vb-gp"><p class="vb-lab">1. Choose what goes into the glass:</p><div class="vb-row vb-wrap" role="group" aria-label="What goes into the glass">' +
      A.map(function (a, i) { return '<button type="button" class="cx-btn vb-sw" data-i="' + i + '" aria-pressed="' + (i ? 'false' : 'true') + '"><i style="background:' + a.c + '"></i>' + a.n + '</button>'; }).join('') + '</div>' +
      '<p class="vb-lab">2. Tap pieces of the window to glaze them, or fill a whole part:</p><div class="vb-row vb-wrap">' +
      '<button type="button" class="cx-btn" data-p="border">Border</button><button type="button" class="cx-btn" data-p="q">Diamonds</button><button type="button" class="cx-btn" data-p="med">Medallion</button><button type="button" class="cx-btn" data-p="reset">Start again</button></div>' +
      '<div class="vb-card" aria-live="polite"></div></div></div>';
    var svg = root.querySelector('svg'), card = root.querySelector('.vb-card'), col, pieces = [];
    function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
    var arch = 'M20 390 V150 A130 130 0 0 1 120 24 A130 130 0 0 1 220 150 V390 Z';
    function build() {
      svg.innerHTML = ''; pieces = []; col = U.colors();
      var defs = el('defs', {}), cp = el('clipPath', { id: 'vbArch' }, defs); el('path', { d: arch }, cp);
      var g = el('g', { 'clip-path': 'url(#vbArch)' });
      var s = 30, i, j, n = 0;
      for (j = 0; j * s / 2 < 420; j++) for (i = -1; i * s < 260; i++) {
        var x = i * s + (j & 1 ? s / 2 : 0), y = j * s / 2;
        pieces.push({ e: el('path', { d: 'M' + x + ' ' + (y - s / 2) + 'L' + (x + s / 2) + ' ' + y + 'L' + x + ' ' + (y + s / 2) + 'L' + (x - s / 2) + ' ' + y + 'Z' }, g), part: 'q', k: START.q[n++ % 4] });
      }
      var b = el('path', { d: arch, fill: 'none', 'stroke-width': 22 }, g); pieces.push({ e: b, part: 'border', k: START.border, stroke: 1 });
      var m = [[120, 210], [154, 244], [120, 278], [86, 244]];
      m.forEach(function (c, i) { pieces.push({ e: el('circle', { cx: c[0], cy: c[1], r: 30 }), part: 'med', k: START.med[i] }); });
      pieces.push({ e: el('circle', { cx: 120, cy: 244, r: 20 }), part: 'med', k: START.ctr });
      pieces.forEach(function (p) { p.e.setAttribute('stroke', col.lead); if (!p.stroke) p.e.setAttribute('stroke-width', 2.2); p.e.style.cursor = 'pointer'; p.e.addEventListener('click', function () { p.k = A[cur].k; paint(); }); });
      el('path', { d: arch, fill: 'none', stroke: col.lead, 'stroke-width': 3 });
      el('path', { d: 'M31 390 V150 A119 119 0 0 1 120 39 A119 119 0 0 1 209 150 V390 Z', fill: 'none', stroke: col.lead, 'stroke-width': 2 });
      paint();
    }
    function find(k) { for (var i = 0; i < A.length; i++) if (A[i].k === k) return A[i]; }
    function paint() {
      var dk = U.dark();
      pieces.forEach(function (p) { var a = find(p.k), c = dk ? a.d : a.c; if (p.stroke) p.e.setAttribute('stroke', c); else p.e.setAttribute('fill', c); });
    }
    function show() {
      var a = A[cur];
      card.innerHTML = '<p><b>' + a.n + '</b> <span class="vb-tag">' + (a.how === 'ions' ? 'color from metal ions' : 'color from tiny metal specks') + '</span></p><p>' + a.t + '</p>';
    }
    root.querySelectorAll('[data-i]').forEach(function (bt) { bt.onclick = function () { cur = +bt.dataset.i; root.querySelectorAll('[data-i]').forEach(function (x) { x.setAttribute('aria-pressed', x === bt); x.classList.toggle('vb-on', x === bt); }); show(); }; });
    root.querySelectorAll('[data-p]').forEach(function (bt) { bt.onclick = function () {
      var p = bt.dataset.p;
      if (p === 'reset') { build(); return; }
      pieces.forEach(function (x) { if (x.part === p) x.k = A[cur].k; }); paint();
    }; });
    root.querySelector('[data-i="0"]').classList.add('vb-on');
    build(); show(); U.onTheme(function () { var ks = pieces.map(function (p) { return p.k; }); build(); pieces.forEach(function (p, i) { p.k = ks[i]; }); paint(); });
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
