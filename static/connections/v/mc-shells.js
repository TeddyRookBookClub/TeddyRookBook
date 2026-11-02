/* Why the periodic table is shaped 2, 8, 18, 32: shells as squares built from odd numbers, then the n + l filling order. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', LN = 'spdf', LC = [0, 2, 1, 3];
  // filling order (Madelung rule): by n + l, then by n
  var ORD = []; for (var t = 1; t <= 8; t++) for (var n = 1; n <= 7; n++) { var l = t - n; if (l >= 0 && l < n && l <= 3) ORD.push([n, l]); }
  Cx.viz('mc-shells', function (v) {
    var root = v.stage, U = VU(v, '.vb-st{padding:.6rem}.vb-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:0 0 .6rem}.vb-cv{display:block;width:100%;border-radius:9px;touch-action:none}.vb-svg{display:block;width:100%;height:auto;margin:auto}.vb-cap{font-size:.92rem;line-height:1.5;margin:.6rem 0 0}.vb-note{font-size:.82rem;opacity:.75;margin:.3rem 0 0}.vb-dim{opacity:.75}.vb-two{display:grid;gap:1rem}@media(min-width:760px){.vb-two{grid-template-columns:1.15fr 1fr}}.vb-two figure{margin:0;min-width:0}.vb-two .vb-row{margin:.5rem 0 0}');
    var sel = [3, 2], k = 0;
    root.innerHTML = '<div class="vb-two"><figure><svg class="vb-svg" viewBox="0 0 320 160" role="img" aria-label="Shells drawn as squares made of odd numbers"></svg><figcaption class="vb-cap" aria-live="polite"></figcaption></figure>' +
      '<figure><svg class="vb-svg" viewBox="0 0 250 250" role="img" aria-label="The order in which subshells fill"></svg>' +
      '<div class="vb-row"><button type="button" class="cx-btn pri" data-a="next">Fill the next subshell</button><button type="button" class="cx-btn" data-a="reset">Start over</button></div>' +
      '<figcaption class="vb-cap" aria-live="polite"></figcaption></figure></div>';
    var sv = root.querySelectorAll('svg'), caps = root.querySelectorAll('figcaption');
    function el(t, a, p) { var e = document.createElementNS(NS, t); for (var q in a) e.setAttribute(q, a[q]); p.appendChild(e); return e; }
    function tx(p, x, y, s, a) { var e = el('text', Object.assign({ x: x, y: y, 'text-anchor': 'middle', 'font-size': 10 }, a || {}), p); e.textContent = s; return e; }
    function squares() {
      var col = U.colors(), g = sv[0], cs = 16, x0; g.innerHTML = '';
      for (var n = 1; n <= 4; n++) {
        var w = n * cs; x0 = 40 + (n - 1) * 80 - w / 2;
        for (var l = 0; l < n; l++) {
          var grp = el('g', { tabindex: 0, role: 'button', 'aria-label': n + LN[l] + ' subshell' }, g); grp.style.cursor = 'pointer';
          for (var i = 0; i <= l; i++) for (var j = 0; j <= l; j++) {
            if (Math.max(i, j) !== l) continue;
            var x = x0 + i * cs, y = 106 - (j + 1) * cs, on = sel[0] === n && sel[1] === l;
            el('rect', { x: x, y: y, width: cs - 1, height: cs - 1, rx: 2, fill: col.glass[LC[l]], stroke: on ? col.fg : 'none', 'stroke-width': 2, opacity: on || !sel[0] ? 1 : 0.75 }, grp);
            el('circle', { cx: x + cs * 0.3, cy: y + cs * 0.5, r: 1.8, fill: '#fff' }, grp);
            el('circle', { cx: x + cs * 0.7, cy: y + cs * 0.5, r: 1.8, fill: '#fff' }, grp);
          }
          (function (n, l) {
            function go() { sel = [n, l]; squares(); }
            grp.addEventListener('click', go); grp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); var f = sv[0].querySelector('[aria-label="' + n + LN[l] + ' subshell"]'); if (f) f.focus(); } });
          })(n, l);
        }
        tx(g, x0 + w / 2, 122, 'n = ' + n, { fill: col.fg, 'font-weight': 700 });
        tx(g, x0 + w / 2, 136, n * n + ' orbital' + (n > 1 ? 's' : ''), { fill: col.dim, 'font-size': 9 });
        tx(g, x0 + w / 2, 150, 2 * n * n + ' electrons', { fill: col.fg, 'font-size': 9 });
      }
      var a = sel[0], b = sel[1], odd = [], m;
      for (m = 0; m < a; m++) odd.push(2 * m + 1);
      caps[0].innerHTML = 'Each square is a shell. Its L-shaped layers are subshells (s, p, d, f) of 1, 3, 5 and 7 orbitals, and each orbital (a small square) holds 2 electrons. Odd numbers add up to squares: ' +
        odd.join(' + ') + ' = ' + a * a + ', so shell ' + a + ' holds 2 × ' + a + '² = <b>' + 2 * a * a + '</b>. ' +
        'You picked <b>' + a + LN[b] + '</b>: ' + (2 * b + 1) + ' orbital' + (b ? 's' : '') + ' × 2 = ' + (4 * b + 2) + ' electrons, the width of the ' + LN[b] + ' block.';
    }
    function order() {
      var col = U.colors(), g = sv[1], cs = 30, x0 = 50, y0 = 22; g.innerHTML = '';
      ['s', 'p', 'd', 'f'].forEach(function (s, l) { tx(g, x0 + l * (cs + 14) + cs / 2, 14, s, { fill: col.dim, 'font-weight': 700 }); });
      for (var t = 2; t <= 8; t++) { // diagonals of equal n + l
        var pts = ORD.filter(function (o) { return o[0] + o[1] === t; });
        if (pts.length < 2) continue;
        var A = pts[pts.length - 1], B = pts[0];
        el('line', { x1: x0 + A[1] * (cs + 14) + cs / 2, y1: y0 + (A[0] - 1) * cs + cs / 2, x2: x0 + B[1] * (cs + 14) + cs / 2, y2: y0 + (B[0] - 1) * cs + cs / 2, stroke: col.dim, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, g);
      }
      var done = ORD.slice(0, k), total = 0, per = [], cur = 0;
      done.forEach(function (o) { if (o[1] === 0) { if (cur) per.push(cur); cur = 0; } cur += 4 * o[1] + 2; total += 4 * o[1] + 2; });
      ORD.forEach(function (o, i) {
        var x = x0 + o[1] * (cs + 14), y = y0 + (o[0] - 1) * cs, on = i < k;
        el('rect', { x: x, y: y + 2, width: cs, height: cs - 5, rx: 5, fill: on ? col.glass[LC[o[1]]] : col.bg2, stroke: i === k - 1 ? col.fg : col.glass[LC[o[1]]], 'stroke-width': i === k - 1 ? 2.2 : 1.2 }, g);
        tx(g, x + cs / 2, y + cs / 2 + 3.5, o[0] + LN[o[1]], { fill: on ? (o[1] === 1 ? '#1d1a10' : '#fff') : col.fg, 'font-weight': 700 });
        if (on) tx(g, x - 6, y + cs / 2 + 3, i + 1, { fill: col.dim, 'font-size': 7.5 });
      });
      for (var n = 1; n <= 7; n++) tx(g, 16, y0 + (n - 1) * cs + cs / 2 + 3, 'n=' + n, { fill: col.dim, 'font-size': 9 });
      var last = ORD[k - 1];
      caps[1].innerHTML = k === 0 ? 'Subshells fill in order of n + l (s = 0, p = 1, d = 2, f = 3), lowest first; on a tie, lower n goes first. Follow the dashed diagonals. Press the button to fill them.' :
        'Filled <b>' + last[0] + LN[last[1]] + '</b> (n + l = ' + (last[0] + last[1]) + '). Electrons so far: <b>' + total + '</b>, element ' + total + '. ' +
        'Rows of the table so far: ' + per.concat(cur ? [cur] : []).join(', ') + (k === ORD.length ? '. Each length, 2, 8, 18, 32, is a 2n² number, and all but the first come twice.' : '. A new row starts at every s.');
      root.querySelector('[data-a=next]').disabled = k === ORD.length;
    }
    root.querySelector('[data-a=next]').onclick = function () { if (k < ORD.length) k++; order(); };
    root.querySelector('[data-a=reset]').onclick = function () { k = 0; order(); };
    squares(); order(); U.onTheme(function () { squares(); order(); });
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
