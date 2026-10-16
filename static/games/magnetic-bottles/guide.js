/* Magnetic Bottles: "What each setting does". One card per setting of the active family, with a small drawing made from the
   exact formulas at the current settings, the words from guide-text.js, and a live table of what a small raise does from here
   (finite differences on the exact formulas, worked out in explore.js, in a Web Worker when the browser has one). */
(function () {
  'use strict';
  var root = document.getElementById('magnetic-bottles-lab'), box = document.getElementById('mb-guide');
  var L = window.TRBLab, MB = window.MagBottles, X = window.MBExplore, TXT = window.MBGuideText;
  if (!root || !box || !L || !MB || !X || !TXT || !root.mbApi) return;
  function $(id) { return document.getElementById(id); }
  var PI = Math.PI, TAU = 2 * PI, f = L.fmt, store = L.store('magnetic-bottles');
  var tabsEl = $('mb-guide-tabs'), card = $('mb-guide-card');
  var C = { gold: '#ffd479', aqua: '#63e6be', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', ink: '#dbe7ef', muted: '#8fb3c6', grid: 'rgba(120,170,200,0.16)' };
  var state = root.mbApi.get(), sel = { f1: 'eps', f2: 'eps' }, saved = store.get('guide', null);
  if (saved) ['f1', 'f2'].forEach(function (fm) { if (saved[fm] && X.spec(fm, saved[fm])) sel[fm] = saved[fm]; });
  var client = X.shared(), results = {}, curKey = '', timer = 0, dirSel = store.get('guideDir', 'up') === 'down' ? 'down' : 'up';

  /* ---------- the outputs in the table ---------- */
  var ROWS = {
    f1: [['V', 'Volume <var>V</var>'], ['bV', 'Average β (β<sub>V</sub>)'], ['pa', 'Pressure on the axis'], ['ia', 'Twist ι (every surface)'],
         ['bmin', '|<b>B</b>| on the edge, weakest'], ['bmax', '|<b>B</b>| on the edge, strongest'], ['rip', 'Ripple (strongest ÷ weakest)'], ['gap', 'Mirror gap'], ['dmax', 'Top of δ’s range']],
    f2: [['V', 'Volume <var>V</var>'], ['bV', 'Average β (β<sub>V</sub>)'], ['pa', 'Pressure on the axis'], ['ia', 'Twist ι on the axis'], ['ie', 'Twist ι at the edge'], ['sh', 'Shear (edge − axis)'],
         ['bmin', '|<b>B</b>| on the edge, weakest'], ['bmax', '|<b>B</b>| on the edge, strongest'], ['rip', 'Ripple (strongest ÷ weakest)'], ['gap', 'Mirror gap'], ['dmax', 'Top of δ’s range']]
  };
  var ABS = { ia: 1, ie: 1, sh: 1 };
  function sig(v) { var a = Math.abs(v); return a === 0 ? '0' : a < 0.001 ? v.toExponential(2).replace('-', '−') : a < 0.1 ? f(v, 4) : f(v, 3); }
  function now(o, r, fam) {
    var v = r[o]; if (!isFinite(v)) return '—';
    if (o === 'bV') return f(100 * v, 2) + '%';
    if (o === 'pa') return sig(v);
    if (o === 'gap') return v === 0 ? '0' : f(v, 3);
    if (o === 'dmax') return f(v, fam === 'f1' ? 4 : 3);
    if (o === 'V') return v < 0.01 ? sig(v) : f(v, 3);
    return f(v, 3);
  }
  function change(o, a, b) {
    if (!(isFinite(a) && isFinite(b))) return '—';
    var d = b - a, sc = Math.max(Math.abs(a), Math.abs(b));
    if (sc === 0 || Math.abs(d) <= 1e-9 * sc) return '<span class="mb-nc">no change</span>';
    var up = d > 0, txt;
    if (ABS[o]) txt = (up ? '+' : '−') + (Math.abs(d) < 0.0005 ? '<0.001' : Math.abs(d).toFixed(3));
    else if (a === 0) txt = 'from 0';
    else { var pc = 100 * Math.abs(d) / Math.abs(a); txt = pc < 0.1 ? '<0.1%' : pc < 10 ? pc.toFixed(1) + '%' : Math.round(pc) + '%'; }
    return '<span class="' + (up ? 'mb-up' : 'mb-dn') + '"><span aria-hidden="true">' + (up ? '▲' : '▼') + '</span><span class="mb-sr">' + (up ? 'up' : 'down') + '</span> ' + txt + '</span>';
  }

  /* ---------- tabs ---------- */
  function cards() { return TXT[state.fam]; }
  function cardOf(k) { var c = cards(); for (var i = 0; i < c.length; i++) if (c[i].k === k) return c[i]; return c[0]; }
  function drawTabs() {
    var k = sel[state.fam];
    tabsEl.innerHTML = cards().map(function (c) {
      var on = c.k === k;
      return '<button type="button" role="tab" id="mb-gt-' + c.k + '" aria-controls="mb-guide-card" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-gk="' + c.k + '"><span class="mb-tab-sym">' + c.sym + '</span> ' + c.name + '</button>';
    }).join('');
    card.setAttribute('aria-labelledby', 'mb-gt-' + k);
  }
  function pick(k, focus) {
    if (sel[state.fam] === k && !focus) return;
    sel[state.fam] = k; store.set('guide', sel); drawTabs(); drawCard();
    if (focus) { var b = $('mb-gt-' + k); if (b) b.focus(); }
  }
  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('[data-gk]'); if (b) pick(b.dataset.gk); });
  tabsEl.addEventListener('keydown', function (e) {
    var ks = cards().map(function (c) { return c.k; }), i = ks.indexOf(sel[state.fam]), j = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % ks.length; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i + ks.length - 1) % ks.length;
    else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = ks.length - 1;
    if (j >= 0) { e.preventDefault(); pick(ks[j], true); }
  });
  /* the card follows the slider being moved */
  root.addEventListener('input', function (e) { var k = e.target && e.target.dataset && e.target.dataset.k; if (k && e.target.closest('#mb-sliders')) pick(k); });
  root.addEventListener('focusin', function (e) { var k = e.target && e.target.dataset && e.target.dataset.k; if (k && e.target.closest('#mb-sliders')) pick(k); });

  /* ---------- the card ---------- */
  var dcv = document.createElement('canvas'), dG = L.canvas(dcv);
  dcv.id = 'mb-draw'; dcv.setAttribute('role', 'img');
  /* lab.js clears a canvas whenever its box changes size, so draw again then */
  if (window.ResizeObserver) { try { new ResizeObserver(function () { drawPicSoon(); }).observe(dcv); } catch (er) { } }
  function drawCard() {
    var c = cardOf(sel[state.fam]), s = X.spec(state.fam, c.k), P = state.P;
    var range = c.k === 'delta' ? 'slider ' + f(s.min, state.fam === 'f1' ? 4 : 3) + ' to ' + f(X.deltaTop(state.fam, P), state.fam === 'f1' ? 4 : 3) + ' (98% of the limit)' : 'slider ' + f(s.min, 2) + ' to ' + f(s.max, 2);
    card.innerHTML =
      '<div class="mb-card-a"><div class="mb-draw" id="mb-draw-box"></div><p class="mb-draw-key" id="mb-draw-key"></p><p class="mb-what">' + c.what + '</p></div>' +
      '<div class="mb-card-b"><div class="mb-dir" role="group" aria-label="Which way to turn ' + c.sym + '">' +
        '<button type="button" data-dir="up" aria-pressed="' + (dirSel === 'up') + '"><span aria-hidden="true">▲</span> Turn it up</button>' +
        '<button type="button" data-dir="down" aria-pressed="' + (dirSel === 'down') + '"><span aria-hidden="true">▼</span> Turn it down</button></div>' +
        '<table class="mb-nudge" id="mb-nudge"></table><p class="mb-nudge-note">% is the change compared with now, from the exact formulas.</p></div>' +
      '<div class="mb-card-c">' + (dirSel === 'up' ? '<div class="mb-c-up"><h4>Turn it up</h4><ul>' + c.up.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>'
        : '<div class="mb-c-up"><h4>Turn it down</h4><p>' + c.down + ' The table shows the details, live.</p></div>') +
      '<div class="mb-c-lim"><h4>Its limits <span class="mb-range">(' + range + ')</span></h4><p>' + c.limits + '</p></div></div>';
    $('mb-draw-box').appendChild(dcv);
    drawPic(); drawTable();
  }
  function valTxt(k, v) { return k === 'delta' ? (Math.abs(v - 1 / 64) < 1e-12 ? '1/64' : f(v, state.fam === 'f1' ? 4 : 3)) : f(v, 2); }
  function drawTable() {
    var t = $('mb-nudge'); if (!t) return;
    var c = cardOf(sel[state.fam]), res = results[curKey], base = res && res.base, up = dirSel === 'up', row = res && res.rows[c.k + (up ? '+' : '-')], fam = state.fam;
    var cap, verb = up ? 'raise ' : 'lower ';
    if (!row) cap = 'Live: working out what a small ' + (up ? 'raise' : 'drop') + ' in ' + c.sym + ' does…';
    else if (row.blocked === 'top') cap = c.sym + ' is at the top of its slider' + (c.k === 'delta' ? ' (98% of its limit)' : '') + ', so it cannot go up from here.';
    else if (row.blocked === 'bottom') cap = c.sym + ' is at the bottom of its slider, so it cannot go down from here.';
    else if (row.blocked) cap = 'Raising ' + c.sym + ' from here would push δ past its limit. Lower δ first, and this table fills in.';
    else cap = 'Live: ' + verb + c.sym + ' by ' + stepTxt(c.k, row.h) + ', from ' + valTxt(c.k, state.P[c.k]);
    var html = '<caption>' + cap + '</caption><thead><tr><th scope="col">Output</th><th scope="col">Now</th><th scope="col">Change</th></tr></thead><tbody>';
    ROWS[fam].forEach(function (rw) {
      var o = rw[0];
      html += '<tr><th scope="row">' + rw[1] + '</th><td>' + (base ? now(o, base, fam) : '…') + '</td><td>' + (row && row.r && base ? change(o, base[o], row.r[o]) : row && row.blocked ? '—' : '…') + '</td></tr>';
    });
    t.innerHTML = html + '</tbody>';
    t.classList.toggle('mb-busy', !row);
  }
  function stepTxt(k, h) { return k === 'delta' ? '10% (' + sig(h) + ')' : f(h, 3).replace(/0$/, ''); }

  card.addEventListener('click', function (e) {
    var b = e.target.closest('[data-dir]'); if (!b || b.dataset.dir === dirSel) return;
    dirSel = b.dataset.dir; store.set('guideDir', dirSel); drawCard();
    var nb = card.querySelector('[data-dir="' + dirSel + '"]'); if (nb) nb.focus();
  });

  /* ---------- live numbers: ask the worker ---------- */
  function keyOf(st) { return st.fam + JSON.stringify(st.P); }
  function request() {
    curKey = keyOf(state);
    if (results[curKey] && results[curKey].done) { drawTable(); return; }
    var res = results[curKey] = { base: null, rows: {}, done: false }, key = curKey;
    client.run('nudge', 'nudge', { fam: state.fam, P: state.P, first: sel[state.fam] }, function (m, done) {
      if (m) { if (m.t === 'base') res.base = m.r; else if (m.t === 'nudge') res.rows[m.k + (m.dir > 0 ? '+' : '-')] = m; }
      if (done) res.done = true;
      if (key === curKey) drawTable();
    });
    var ks = Object.keys(results); if (ks.length > 40) delete results[ks[0]];
    drawTable();
  }
  root.addEventListener('mb:state', function (e) {
    var famChanged = e.detail.fam !== state.fam;
    state = e.detail;
    if (famChanged) { drawTabs(); drawCard(); }
    else drawPicSoon();
    clearTimeout(timer); timer = setTimeout(request, 220);
    var res = results[keyOf(state)]; if (!res) { var t = $('mb-nudge'); if (t) t.classList.add('mb-busy'); }
  });

  /* ---------- the drawings ---------- */
  var picT = 0;
  function drawPicSoon() { clearTimeout(picT); picT = setTimeout(drawPic, 60); }
  function poly(c, pts, tx, close) { var pen = false; c.beginPath(); for (var i = 0; i < pts.length; i += 2) { var x = pts[i], y = pts[i + 1]; if (!(x === x)) { pen = false; continue; } var p = tx(x, y); if (pen) c.lineTo(p[0], p[1]); else { c.moveTo(p[0], p[1]); pen = true; } } if (close) c.closePath(); }
  function sec(m, r, phi, n) { return MB.section(m, r, phi, n || 96); }
  function bounds(list, b) { b = b || [1e9, 1e9, -1e9, -1e9]; list.forEach(function (a) { if (!a) return; for (var i = 0; i < a.length; i += 2) { if (!(a[i] === a[i])) continue; b[0] = Math.min(b[0], a[i]); b[1] = Math.min(b[1], a[i + 1]); b[2] = Math.max(b[2], a[i]); b[3] = Math.max(b[3], a[i + 1]); } }); return b; }
  /* a transform that fits box b into the rectangle (x0, y0, w, h) with equal scales; y up */
  function fit(b, x0, y0, w, h, pad) {
    var bw = b[2] - b[0] || 1, bh = b[3] - b[1] || 1, s = Math.min((w - 2 * pad) / bw, (h - 2 * pad) / bh), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    var t = function (x, y) { return [x0 + w / 2 + (x - cx) * s, y0 + h / 2 - (y - cy) * s]; }; t.s = s; return t;
  }
  function ghostP(k, P, fam, dirHint) {        // the same bottle with setting k changed by a clearly visible amount, kept allowed
    var s = X.spec(fam, k), span = k === 'delta' ? P.delta * 0.6 : 0.18 * (s.max - s.min);
    if (k === 'lam') span = 0.4 * P.lam;
    var tries = dirHint < 0 ? [-1, 1] : [1, -1];
    for (var i = 0; i < 2; i++) { var Q = X.copy(P); Q[k] = P[k] + tries[i] * span; if (k !== 'delta' && (Q[k] > s.max || Q[k] < s.min)) continue; if (X.valid(fam, Q)) return Q; }
    return null;
  }
  function keyHtml(items) { return items.map(function (it) { return '<span class="mb-k"><i class="' + (it[2] || '') + '" style="border-color:' + it[0] + (it[2] === 'fdot' || it[2] === 'band' ? ';background:' + it[0] : '') + '"></i>' + it[1] + '</span>'; }).join(''); }
  function drawPic() {
    if (!dcv || !dG) return;
    var g = dG.fit(), c = g.c, w = g.w, h = g.h, fam = state.fam, P = state.P, cd = cardOf(sel[fam]), m = MB.make(fam, P), key = [];
    c.clearRect(0, 0, w, h);
    var kname = cd.sym + ' = ';
    c.lineJoin = 'round'; c.lineCap = 'round';
    function label(t, x, y, col, al, bl) { c.fillStyle = col || C.muted; c.font = '11px system-ui,sans-serif'; c.textAlign = al || 'left'; c.textBaseline = bl || 'middle'; c.fillText(t, x, y); }
    function stroke(pts, tx, col, wd, dash, fill) { poly(c, pts, tx, true); if (fill) { c.fillStyle = fill; c.fill(); } c.setLineDash(dash || []); c.strokeStyle = col; c.lineWidth = wd; c.stroke(); c.setLineDash([]); }
    function dot(p, col, r, hollow) { c.beginPath(); c.arc(p[0], p[1], r || 3, 0, TAU); if (hollow) { c.strokeStyle = col; c.lineWidth = 1.5; c.stroke(); } else { c.fillStyle = col; c.fill(); } }
    var aria = '';
    if (cd.draw === 'xs2') {
      var Gp = ghostP('eps', P, fam, dirSel === 'up' ? 1 : -1), mg = Gp ? MB.make(fam, Gp) : null, phis = [0, PI / 2], data = phis.map(function (ph) { return { cur: sec(m, 1, ph), gh: mg ? sec(mg, 1, ph) : null, ax: sec(m, 0, ph, 1), gax: mg ? sec(mg, 0, ph, 1) : null }; });
      var half = (w - 12) / 2, sc = 1e9, bs = data.map(function (d) { var b = bounds([d.cur, d.gh]); sc = Math.min(sc, (half - 28) / (b[2] - b[0] || 1), (h - 44) / (b[3] - b[1] || 1)); return b; });
      data.forEach(function (d, i) {
        var b = bs[i], x0 = i * (half + 12), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
        var tx = function (x, y) { return [x0 + half / 2 + (x - cx) * sc, 22 + (h - 30) / 2 - (y - cy) * sc]; };
        c.strokeStyle = C.grid; c.lineWidth = 1; c.strokeRect(x0 + 0.5, 18.5, half - 1, h - 20);
        if (d.gh) stroke(d.gh, tx, C.aqua, 1.6, [5, 4]);
        stroke(d.cur, tx, C.gold, 2, [], 'rgba(255,212,121,0.16)');
        dot(tx(d.ax[0], d.ax[1]), '#fff', 3);
        label(i ? 'φ = 90° (on the y-axis)' : 'φ = 0° (on the x-axis)', x0 + 4, 9, C.ink);
      });
      key = [[C.gold, 'now: ' + kname + f(P.eps, 2)]]; if (Gp) key.push([C.aqua, kname + f(Gp.eps, 2), 'dash']); key.push(['#fff', 'magnetic axis', 'dot']);
      aria = 'Two slices of the bottle, where the ring crosses the x-axis and the y-axis, now and with ε changed.';
    } else if (cd.draw === 'mirror') {
      var phi = 0, cur = sec(m, 1, phi), inner = sec(m, 0.6, phi), flip = Float64Array.from(cur), P0 = X.copy(P); P0.tau = 0;
      for (var i = 1; i < flip.length; i += 2) flip[i] = -flip[i];
      var m0 = X.valid(fam, P0) ? MB.make(fam, P0) : null, s0 = m0 ? sec(m0, 1, phi) : null, b = bounds([cur, flip, s0]), padY = (b[3] - b[1]) * 0.08; b[1] -= padY; b[3] += padY;
      var tx = fit(b, 0, 14, w, h - 14, 16), z0 = tx(b[0], 0)[1];
      c.setLineDash([3, 4]); c.strokeStyle = 'rgba(219,231,239,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(6, z0); c.lineTo(w - 6, z0); c.stroke(); c.setLineDash([]);
      c.font = '11px system-ui,sans-serif'; var fw = c.measureText('flip line: the x-axis').width + 12; c.fillStyle = 'rgba(6,17,26,0.85)'; c.fillRect(w - fw - 6, z0 - 19, fw, 16);
      label('flip line: the x-axis', w - 12, z0 - 11, C.ink, 'right');
      if (s0 && Math.abs(P.tau) > 1e-9) stroke(s0, tx, C.blue, 1.4, [5, 4]);
      stroke(flip, tx, C.pink, 1.6, [3, 3]);
      stroke(cur, tx, C.gold, 2, [], 'rgba(255,212,121,0.16)'); stroke(inner, tx, 'rgba(255,212,121,0.5)', 1);
      var ax = sec(m, 0, phi, 1); dot(tx(ax[0], ax[1]), '#fff', 3); dot(tx(ax[0], -ax[1]), C.pink, 3.5, true);
      label('slice at φ = 0°', 6, 7, C.ink, 'left', 'top');
      key = [[C.gold, 'now: ' + kname + f(P.tau, 2)], [C.pink, 'turned over', 'dash']]; if (s0 && Math.abs(P.tau) > 1e-9) key.push([C.blue, cd.sym + ' = 0', 'dash']);
      aria = 'A slice of the bottle and the same slice turned over about the x-axis. They match only when τ is 0.';
    } else if (cd.draw === 'rings') {
      var lim = X.copy(P); lim.delta = 0.999 * X.dmax(fam, P); var ml = MB.make(fam, lim), phR = fam === 'f1' ? 0 : PI / 2;
      var edge = sec(m, 1, phR), le = sec(ml, 1, phR), rings = [0.5, Math.SQRT1_2, Math.sqrt(0.75)].map(function (r) { return sec(m, r, phR); });
      var extra = [], b2 = bounds([edge, le]);
      var stack = fam === 'f2' && P.S >= PI / 2;
      if (fam === 'f1' || (fam === 'f2' && !stack)) { b2[0] = Math.min(b2[0], 0); }
      if (stack) { var zt = PI / (2 * P.lam); b2[1] = Math.min(b2[1], -zt * 1.05); b2[3] = Math.max(b2[3], zt * 1.05); }
      var tx2 = fit(b2, 0, 20, w, h - 24, 16);
      if (fam === 'f1' || !stack) {
        var p0 = tx2(0, b2[1]), p1 = tx2(0, b2[3]);
        if (fam === 'f1') { c.strokeStyle = 'rgba(219,231,239,0.45)'; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(p0[0], p0[1] + 8); c.lineTo(p1[0], p1[1] - 8); c.stroke(); c.setLineDash([]); label('center line', p0[0] + 5, p1[1] - 2, C.muted, 'left', 'top'); }
        else { var fz = tx2(0, 0), ff = tx2(Math.sqrt(P.eps), 0); c.strokeStyle = 'rgba(219,231,239,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(fz[0], fz[1]); c.lineTo(ff[0], ff[1]); c.stroke(); dot(ff, C.ink, 3.5); label('focus', ff[0], ff[1] + 12, C.ink, 'center'); label('line between the foci', fz[0] + 2, fz[1] - 10, C.muted, 'left'); }
      }
      if (stack) {
        [-1, 1].forEach(function (sg) {
          var zz = sg * PI / (2 * P.lam), a = tx2(b2[0], zz), bb = tx2(b2[2], zz); c.strokeStyle = C.red; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(6, a[1]); c.lineTo(w - 6, bb[1]); c.stroke(); c.setLineDash([]);
          var cp = Float64Array.from(edge); for (var i2 = 1; i2 < cp.length; i2 += 2) cp[i2] += sg * PI / P.lam; c.save(); c.globalAlpha = 0.35; stroke(cp, tx2, C.gold, 1.2); c.restore();
        });
        label('the next bottle in the stack', w - 8, tx2(0, PI / (2 * P.lam))[1] - 9, C.red, 'right');
      }
      stroke(le, tx2, C.red, 1.6, [5, 4]);
      rings.forEach(function (r) { stroke(r, tx2, 'rgba(255,255,255,0.35)', 1); });
      stroke(edge, tx2, C.gold, 2, [], 'rgba(255,212,121,0.14)');
      var axr = sec(m, 0, phR, 1); dot(tx2(axr[0], axr[1]), '#fff', 3);
      label('slice at φ = ' + (phR ? '90°' : '0°'), 6, 7, C.ink, 'left', 'top');
      key = [[C.gold, 'edge now: δ = ' + valTxt('delta', P.delta)], ['rgba(255,255,255,0.6)', 'inner layers'], [C.red, 'edge at the limit, δ = ' + f(X.dmax(fam, P), fam === 'f1' ? 4 : 3), 'dash']];
      aria = 'A slice of the bottle with its inner layers and the edge it would have at the largest allowed δ.';
    } else if (cd.draw === 'side') {
      var Gl = ghostP('lam', P, fam, dirSel === 'up' ? 1 : -1), mgl = Gl ? MB.make(fam, Gl) : null, cs = sec(m, 1, 0), gs = mgl ? sec(mgl, 1, 0) : null, b3 = bounds([cs, gs]);
      var tx3 = fit(b3, 0, 14, w, h - 14, 16);
      if (gs) stroke(gs, tx3, C.aqua, 1.6, [5, 4]);
      stroke(cs, tx3, C.gold, 2, [], 'rgba(255,212,121,0.16)');
      var bc = bounds([cs]), top = tx3(bc[2], bc[3]), bot = tx3(bc[2], bc[1]), xh = Math.min(w - 10, top[0] + 14);
      c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.moveTo(xh - 4, top[1]); c.lineTo(xh + 4, top[1]); c.moveTo(xh, top[1]); c.lineTo(xh, bot[1]); c.moveTo(xh - 4, bot[1]); c.lineTo(xh + 4, bot[1]); c.stroke();
      label('height ' + f(bc[3] - bc[1], 2), xh - 6, (top[1] + bot[1]) / 2, C.ink, 'right');
      var axs = sec(m, 0, 0, 1); dot(tx3(axs[0], axs[1]), '#fff', 3);
      label('slice at φ = 0°', 6, 7, C.ink, 'left', 'top');
      key = [[C.gold, 'now: λ = ' + f(P.lam, 2)]]; if (Gl) key.push([C.aqua, 'λ = ' + f(Gl.lam, 2), 'dash']);
      aria = 'A slice of the bottle now and with λ changed: only the height changes.';
    } else if (cd.draw === 'plan') {
      var Gq = ghostP(cd.k, P, fam, dirSel === 'up' ? 1 : -1), mq = Gq ? MB.make(fam, Gq) : null, pa = [0, 0, 0], axis = [], gax = [], rings2 = [], i3, j3;
      for (i3 = 0; i3 <= 96; i3++) { m.axis(TAU * i3 / 96, pa); axis.push(pa[0], pa[1]); if (mq) { mq.axis(TAU * i3 / 96, pa); gax.push(pa[0], pa[1]); } }
      var NT = 16, NZ = 96, grid = [];
      for (j3 = 0; j3 <= NZ; j3++) { var rg = []; for (i3 = 0; i3 < NT; i3++) { m.surf(1, TAU * i3 / NT, TAU * j3 / NZ, pa); rg.push(pa[0], pa[1]); } grid.push(rg); rings2.push(rg); }
      var b4 = bounds(rings2.concat([gax]));
      var tx4 = fit(b4, 0, 6, w, h - 6, 14), o = tx4(0, 0);
      c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(6, o[1]); c.lineTo(w - 6, o[1]); c.moveTo(o[0], 6); c.lineTo(o[0], h - 4); c.stroke();
      label('x', w - 10, o[1] - 8, C.muted); label('y', o[0] + 6, 12, C.muted);
      /* the plasma seen from above: every small patch of its edge, projected down */
      c.fillStyle = '#5b4a24'; c.strokeStyle = '#5b4a24'; c.lineWidth = 1;
      for (j3 = 0; j3 < NZ; j3++) for (i3 = 0; i3 < NT; i3++) {
        var A0 = grid[j3], A1 = grid[j3 + 1], i4 = (i3 + 1) % NT, q0 = tx4(A0[2 * i3], A0[2 * i3 + 1]), q1 = tx4(A0[2 * i4], A0[2 * i4 + 1]), q2 = tx4(A1[2 * i4], A1[2 * i4 + 1]), q3 = tx4(A1[2 * i3], A1[2 * i3 + 1]);
        c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]); c.lineTo(q2[0], q2[1]); c.lineTo(q3[0], q3[1]); c.closePath(); c.fill(); c.stroke();
      }
      if (mq) stroke(gax, tx4, C.aqua, 1.6, [5, 4]);
      stroke(axis, tx4, '#fff', 2);
      var A = m.axis(0, [0, 0, 0])[0], Bb = m.axis(PI / 2, [0, 0, 0])[1], fc = Math.sqrt(P.eps);
      var pA = tx4(A, 0), pB = tx4(0, Bb);
      c.strokeStyle = C.ink; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(pA[0], pA[1]); c.moveTo(o[0], o[1]); c.lineTo(pB[0], pB[1]); c.stroke(); c.setLineDash([]);
      label('a = ' + f(A, 2), (o[0] + pA[0]) / 2, o[1] + 9, C.ink, 'center');
      label('b = ' + f(Bb, 2), o[0] + 5, o[1] + (pB[1] - o[1]) * 0.3, C.ink, 'left');
      [-1, 1].forEach(function (sg) { dot(tx4(0, sg * fc), C.gold, 4.5); });
      if (mq && cd.k === 'eps') { var gf = Math.sqrt(Gq.eps); [-1, 1].forEach(function (sg) { dot(tx4(0, sg * gf), C.aqua, 4.5, true); }); }
      key = [['#fff', 'magnetic axis now'], [C.gold, 'foci, ±√ε = ±' + f(fc, 2) + ' on the y-axis', 'fdot'], ['#5b4a24', 'the plasma, seen from above', 'band']]; if (mq) key.push([C.aqua, cd.sym + ' = ' + f(Gq[cd.k], 2), 'dash']);
      aria = 'The bottle seen from above: the elliptical magnetic axis with its two foci on the y-axis.';
    }
    $('mb-draw-key').innerHTML = keyHtml(key);
    dcv.setAttribute('aria-label', aria);
  }

  drawTabs(); drawCard(); request();
  L.onTheme(function () { drawPic(); });
})();
