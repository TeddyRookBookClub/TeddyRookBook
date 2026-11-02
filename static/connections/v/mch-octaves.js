/* Music ∩ Chemistry: Newlands' 1865 "law of octaves" table (first four columns of his table, modern symbols), colored by
   each element's family today; and today's first rows for comparison. Our own drawing. Notes are an illustration only. */
Cx.viz('mch-octaves', function (v) {
  var NEW = [['H', 'Li', 'Be', 'B', 'C', 'N', 'O'], ['F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S'], ['Cl', 'K', 'Ca', 'Cr', 'Ti', 'Mn', 'Fe'], ['Co, Ni', 'Cu', 'Zn', 'Y', 'In', 'As', 'Se']];
  var FAM = { H: 'x', Li: 'alk', Na: 'alk', K: 'alk', Be: 'ae', Mg: 'ae', Ca: 'ae', B: 'b', Al: 'b', In: 'b', C: 'c', Si: 'c', N: 'n', P: 'n', As: 'n', O: 'o', S: 'o', Se: 'o', F: 'hal', Cl: 'hal', He: 'ng', Ne: 'ng', Ar: 'ng', Kr: 'ng', Ga: 'b', Ge: 'c', Br: 'hal' };
  var TODAY = [['H', '', '', '', '', '', '', '', 'He'], ['Li', 'Be', '', 'B', 'C', 'N', 'O', 'F', 'Ne'], ['Na', 'Mg', '', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'], ['K', 'Ca', '+10', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr']];
  var view = 'n', col = -1, NS = 'http://www.w3.org/2000/svg', SCALE = [0, 2, 4, 5, 7, 9, 11, 12];
  var s = v.svg('0 0 640 300', 'A table of element symbols. Columns that share a color hold elements of the same family.'); s.style.maxWidth = '680px'; s.style.margin = '0 auto';
  var ro = v.readout();
  function famCol(c, f) { return { alk: c.red, ae: c.orange, b: c.teal, c: c.ink, n: c.blue, o: c.purple, hal: c.math, ng: c.gold }[f]; }
  function E(t, a, txt) { var e = document.createElementNS(NS, t); for (var q in a) e.setAttribute(q, a[q]); if (txt != null) e.textContent = txt; s.appendChild(e); return e; }
  v.draw(function (c) {
    s.innerHTML = ''; var T = view === 'n' ? NEW : TODAY, cw = view === 'n' ? 80 : 66, x0 = view === 'n' ? 40 : 24, ch = 58, y0 = 30;
    E('text', { x: 6, y: 18, 'font-size': 13, fill: c.muted, 'font-family': 'system-ui,sans-serif' }, view === 'n' ? 'Newlands, 1865: each row is one of his octaves; each column should be one family' : 'Today: rows of 2, 8, 8, then 18 (the + stands for 10 transition metals)');
    T.forEach(function (row, r) {
      row.forEach(function (sym, k) {
        if (!sym) return; var f = FAM[sym], x = x0 + k * cw, y = y0 + r * ch, hot = k === col;
        var fc = f && f !== 'x' ? famCol(c, f) : null;
        E('rect', { x: x + 3, y: y + 3, width: cw - 6, height: ch - 6, rx: 7, fill: fc ? c.a(fc, hot ? 0.38 : 0.16) : (sym === '+10' ? c.panel : c.bg), stroke: hot ? c.gold : (fc || c.grid), 'stroke-width': hot ? 3 : 1.5 });
        E('text', { x: x + cw / 2, y: y + ch / 2 + 7, 'text-anchor': 'middle', 'font-size': sym.length > 3 ? 15 : 21, 'font-weight': 700, fill: fc || c.muted, 'font-family': 'system-ui,sans-serif' }, sym);
      });
    });
    if (view === 'n') for (var k = 0; k < 7; k++) { var t = E('rect', { x: x0 + k * cw, y: y0, width: cw, height: ch * 4, fill: 'transparent', style: 'cursor:pointer' }); t.dataset.k = k; }
  });
  s.addEventListener('click', function (e) { var k = e.target.dataset && e.target.dataset.k; if (k == null) return; col = +k; play(col); v.redraw(); });
  function play(k) {
    var names = NEW.map(function (r) { return r[k]; });
    names.forEach(function (n, r) { Cx.tone(130.81 * Math.pow(2, (SCALE[k] + 12 * r) / 12), 0.45, { type: 'triangle', gain: 0.18, when: r * 0.4 }); });
    ro.textContent = 'Column ' + (k + 1) + ': ' + names.join(', ') + '. Same color means same family today; a different color is where the pattern breaks.';
    v.say(ro.textContent);
  }
  v.select('Table', [['n', 'Newlands, 1865'], ['t', 'Today']], 'n', function (x) { view = x; col = -1; ro.textContent = ''; v.redraw(); });
  v.button('♪ Play an octave, Li to Na', function () {
    var row = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Na'];
    row.forEach(function (n, i) { Cx.tone(261.63 * Math.pow(2, SCALE[i] / 12), 0.4, { type: 'triangle', gain: 0.2, when: i * 0.38 }); });
    ro.textContent = 'Li, Be, B, C, N, O, F, Na: do re mi fa sol la ti do. In Newlands’ list, sodium is the eighth element from lithium, and it behaves like lithium.';
  }, { pri: true });
  ro.textContent = 'Tap a column to hear it and see whether its elements belong together.';
});
