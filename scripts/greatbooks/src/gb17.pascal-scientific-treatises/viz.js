/* Pascal: the barometer on the Puy de Dôme, and the arithmetical triangle. Our own designs. */
(function () {
  function isReduced(V) { return typeof V.reduced === 'function' ? V.reduced() : !!V.reduced; }
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* gb-pascal-barometer: carry a mercury (or water) barometer from the town (460 m) to the summit (1,465 m).
     Pressure from the isothermal barometric formula P = P0 exp(-h / 8,430 m); column h = P / (rho g). */
  ML.viz.register('gb-pascal-barometer', function (el, o, V) {
    o = o || {};
    var TOWN = 460, TOP = 1465, P0 = 101325, HS = 8430, G = 9.80665;
    var st = { h: TOWN, liq: 'hg' };
    var c = V.canvas(el, { aspect: 1.55, max: 380, min: 230 });
    var ctl = V.el('div', 'gbsc-ctl');
    el.appendChild(ctl);
    var sl = V.slider(ctl, { label: o.young ? 'Climb the mountain' : 'Height above sea level', min: TOWN, max: TOP, step: 5, value: TOWN,
      fmt: function (v) { return grp(Math.round(v)) + ' m'; }, input: function (v) { st.h = v; draw(); } });
    if (!o.young) V.seg(ctl, { label: 'Liquid in the tube', items: [['hg', 'Mercury'], ['w', 'Water']], value: 'hg', change: function (v) { st.liq = v; draw(); } });
    var out = V.readout(el);
    function P(h) { return P0 * Math.exp(-h / HS); }
    function col(h, liq) { return P(h) / ((liq === 'hg' ? 13595 : 998) * G); } // meters
    function draw() {
      var k = V.colors(), x = c.ctx, w = c.w, h = c.h;
      x.clearRect(0, 0, w, h); x.fillStyle = k.bg; x.fillRect(0, 0, w, h);
      // left part: the mountain
      var mw = w * 0.58, base = h - 18, peakY = 28, peakX = mw * 0.62;
      x.fillStyle = k.blueSoft; x.fillRect(0, 0, mw, base);
      x.beginPath(); x.moveTo(0, base); x.lineTo(mw * 0.12, base - 10);
      x.bezierCurveTo(mw * 0.35, base - 30, mw * 0.48, peakY + 40, peakX, peakY);
      x.bezierCurveTo(mw * 0.75, peakY + 30, mw * 0.85, base - 40, mw, base - 15); x.lineTo(mw, base); x.closePath();
      x.fillStyle = k.greenSoft; x.fill(); x.strokeStyle = k.green; x.lineWidth = 2; x.stroke();
      // town at the foot
      var townY = base - 10;
      x.fillStyle = k.muted; for (var i = 0; i < 4; i++) { x.fillRect(mw * 0.04 + i * 11, townY - 12 - (i % 2) * 4, 8, 12 + (i % 2) * 4); }
      x.font = '12px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillStyle = k.ink;
      x.fillText('Clermont', mw * 0.03, base + 14);
      x.textAlign = 'center'; x.fillText('Puy de Dôme', peakX, peakY - 10);
      // marker along the slope: interpolate height linearly from town to peak
      var f = (st.h - TOWN) / (TOP - TOWN), my = townY + (peakY - townY) * f;
      // find x on the slope for that y (sample the left flank curve)
      var mx = mw * 0.12 + (peakX - mw * 0.12) * Math.pow(f, 0.8);
      x.fillStyle = k.red; x.beginPath(); x.arc(mx, my - 4, 5, 0, 7); x.fill();
      x.strokeStyle = k.red; x.lineWidth = 1.5; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(mx, my - 4); x.lineTo(mw + 8, my - 4); x.stroke(); x.setLineDash([]);
      // right part: the tube
      var hc = col(st.h, st.liq), full = st.liq === 'hg' ? 0.80 : 11.0, ref = col(TOWN, st.liq);
      var tx = mw + (w - mw) * 0.42, tw = Math.max(14, (w - mw) * 0.14), tTop = 14, tBot = h - 40, dishY = tBot - 6;
      var sc = (dishY - tTop - 6) / full, colTop = dishY - hc * sc, refTop = dishY - ref * sc;
      x.fillStyle = k.panel; x.fillRect(tx - tw / 2, tTop, tw, dishY - tTop);
      x.fillStyle = st.liq === 'hg' ? (k.muted) : k.blue; x.globalAlpha = st.liq === 'hg' ? 0.85 : 0.55;
      x.fillRect(tx - tw / 2, colTop, tw, dishY - colTop); x.globalAlpha = 1;
      x.strokeStyle = k.ink; x.lineWidth = 1.5; x.beginPath(); x.moveTo(tx - tw / 2, dishY); x.lineTo(tx - tw / 2, tTop + tw / 2);
      x.arc(tx, tTop + tw / 2, tw / 2, Math.PI, 0); x.lineTo(tx + tw / 2, dishY); x.stroke();
      // dish
      x.fillStyle = st.liq === 'hg' ? k.muted : k.blue; x.globalAlpha = 0.6; x.fillRect(tx - tw * 2, dishY, tw * 4, 10); x.globalAlpha = 1;
      x.strokeStyle = k.ink; x.strokeRect(tx - tw * 2, dishY - 4, tw * 4, 18);
      // town level mark
      if (!o.young) { x.strokeStyle = k.gold; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(tx - tw, refTop); x.lineTo(tx + tw * 1.2, refTop); x.stroke(); x.setLineDash([]); }
      // scale
      x.fillStyle = k.muted; x.font = '11px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle';
      var stepM = st.liq === 'hg' ? 0.1 : 1;
      for (var m = 0; m <= full + 1e-9; m += stepM) { var yy = dishY - m * sc; x.fillRect(tx + tw / 2 + 2, yy, 5, 1); if (Math.round(m / stepM) % (st.liq === 'hg' ? 2 : 2) === 0) x.fillText(st.liq === 'hg' ? Math.round(m * 100) + ' cm' : Math.round(m) + ' m', tx + tw / 2 + 9, yy); }
      x.textAlign = 'center'; x.fillStyle = k.ink; x.textBaseline = 'alphabetic';
      x.fillText(st.liq === 'hg' ? 'mercury' : 'water', tx, h - 8);
      if (colTop - tTop > 24) { x.fillStyle = k.muted; x.textAlign = 'right'; x.textBaseline = 'middle'; x.font = '11px system-ui,sans-serif'; x.fillText('empty', tx - tw / 2 - 5, (tTop + colTop) / 2); }
      var cm = hc * 100, drop = (ref - hc) * 100;
      if (o.young) out.set('At ' + grp(Math.round(st.h)) + ' m the mercury stands <b>' + cm.toFixed(1) + ' cm</b> high' + (drop > 0.05 ? ', ' + drop.toFixed(1) + ' cm lower than in town.' : '.'));
      else out.set('Height ' + grp(Math.round(st.h)) + ' m · air pressure <b>' + (P(st.h) / 1000).toFixed(1) + ' kPa</b> · ' + (st.liq === 'hg' ? 'mercury column <b>' + cm.toFixed(1) + ' cm</b>' : 'water column <b>' + hc.toFixed(2) + ' m</b>') + (drop > 0.05 ? ' (' + (st.liq === 'hg' ? drop.toFixed(1) + ' cm' : (ref - hc).toFixed(2) + ' m') + ' below the town reading)' : ''));
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { update: function () { draw(); } };
  });

  /* gb-pascal-triangle: the triangle as rows of buttons. Modes: the sum rule, row sums, a diagonal sum, odd numbers. */
  ML.viz.register('gb-pascal-triangle', function (el, o, V) {
    o = o || {};
    var N = Math.max(4, Math.min(12, o.rows || 10)), T = [];
    for (var n = 0; n < N; n++) { T[n] = []; for (var k = 0; k <= n; k++) T[n][k] = (k === 0 || k === n) ? 1 : T[n - 1][k - 1] + T[n - 1][k]; }
    var mode = 'sum', sel = null;
    var wrap = V.el('div', 'gb-tri'); el.appendChild(wrap);
    var cells = [];
    for (n = 0; n < N; n++) {
      var row = V.el('div', 'gb-tri-row'); cells[n] = [];
      for (k = 0; k <= n; k++) {
        var b = V.el('button', 'gb-tri-cell', String(T[n][k])); b.type = 'button';
        b.setAttribute('aria-label', 'Row ' + n + ', place ' + k + ': ' + T[n][k]);
        (function (n, k) { b.addEventListener('click', function () { sel = [n, k]; paint(); }); })(n, k);
        row.appendChild(b); cells[n][k] = b;
      }
      wrap.appendChild(row);
    }
    var ctl = V.el('div', 'gbsc-ctl'); el.appendChild(ctl);
    if (!o.young) V.seg(ctl, { label: 'What to show', items: [['sum', 'Sum rule'], ['row', 'Row sums'], ['diag', 'Diagonal sums'], ['odd', 'Odd numbers']], value: 'sum', change: function (v) { mode = v; paint(); } });
    var out = V.readout(el);
    function cls(n, k, c) { if (cells[n] && cells[n][k]) cells[n][k].classList.add(c); }
    function paint() {
      cells.forEach(function (r) { r.forEach(function (b) { b.classList.remove('gb-on', 'gb-src', 'gb-odd'); b.setAttribute('aria-pressed', 'false'); }); });
      if (mode === 'odd') {
        for (var n = 0; n < N; n++) for (var k = 0; k <= n; k++) if (T[n][k] % 2) cls(n, k, 'gb-odd');
        out.set('The odd numbers are shaded. With more rows they make a pattern of triangles inside triangles (Sierpinski’s triangle, described in 1915).'); return;
      }
      if (!sel) { out.set(o.young ? 'Tap any number.' : 'Tap a cell. Rows and places are counted from 0, so row 4 is 1, 4, 6, 4, 1.'); return; }
      var n0 = sel[0], k0 = sel[1], v = T[n0][k0];
      cells[n0][k0].setAttribute('aria-pressed', 'true');
      if (mode === 'sum') {
        cls(n0, k0, 'gb-on');
        if (n0 === 0 || k0 === 0 || k0 === n0) { out.set('This cell is on the edge, so it is 1' + (n0 === 0 ? ' (the generator at the top).' : ': there is only one cell above it.')); return; }
        cls(n0 - 1, k0 - 1, 'gb-src'); cls(n0 - 1, k0, 'gb-src');
        out.set(o.young ? T[n0 - 1][k0 - 1] + ' + ' + T[n0 - 1][k0] + ' = <b>' + v + '</b>' :
          T[n0 - 1][k0 - 1] + ' + ' + T[n0 - 1][k0] + ' = <b>' + v + '</b>. It also counts the ways to choose ' + k0 + ' things from ' + n0 + ': $\\binom{' + n0 + '}{' + k0 + '} = ' + v + '$.');
      } else if (mode === 'row') {
        var s = 0; for (var j = 0; j <= n0; j++) { cls(n0, j, 'gb-on'); s += T[n0][j]; }
        out.set('Row ' + n0 + ' adds up to <b>' + grp(s) + '</b> = $2^{' + n0 + '}$: each step down doubles the total, because every cell is passed on to two cells below.');
      } else if (mode === 'diag') {
        if (k0 === 0) { cls(n0, 0, 'gb-on'); out.set('Pick a cell that is not on the left edge.'); return; }
        var t = 0, parts = [];
        for (var i = k0 - 1; i <= n0 - 1; i++) { cls(i, k0 - 1, 'gb-src'); t += T[i][k0 - 1]; parts.push(T[i][k0 - 1]); }
        cls(n0, k0, 'gb-on');
        out.set(parts.join(' + ') + ' = <b>' + t + '</b>: the cells down a diagonal add up to the cell just below and to the right of the last one. Pascal proves this as his second consequence.');
      }
    }
    paint();
    return { update: paint };
  });
})();
