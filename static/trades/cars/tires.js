/* Cars course, Lesson 10: tire sidewall decoder. Parses a size such as P215/65R15 95H (NHTSA, DOT HS 809 361) and works out
   sidewall height = width × aspect ÷ 100, overall diameter = rim × 25.4 + 2 × sidewall, and revolutions per mile.
   Speed symbols and their mph limits are from the NHTSA brochure; km/h uses 1 mph = 1.609344 km/h (NIST). */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-tires');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var SPEED = { Q: 99, R: 106, S: 112, T: 118, U: 124, H: 130, V: 149, W: 168, Y: 186 };
  function f(x, d) { return T.fmt(x, d); }
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  side.innerHTML =
    '<label class="tr-field">Tire size from the sidewall<input type="text" class="ti-in" value="P215/65R15 95H" autocomplete="off" spellcheck="false" style="font:700 1.15rem ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em;max-width:16rem;text-transform:uppercase"></label>' +
    '<div class="tr-seg ti-ex" role="group" aria-label="Examples"><button type="button" data-v="P215/65R15 95H">P215/65R15 95H</button><button type="button" data-v="P195/70R14 90S">P195/70R14 90S</button><button type="button" data-v="LT245/75R16 120/116R">LT245/75R16</button><button type="button" data-v="235/40R18 95W">235/40R18 95W</button></div>' +
    '<div class="tr-out ti-out" aria-live="polite" style="margin-top:.6rem"></div>';
  var svg = S('svg', { viewBox: '0 0 420 350', role: 'img', 'aria-label': 'A tire and wheel drawn to scale from the size code, with the sidewall height and diameters marked', class: 'tr-tire' }, stage);
  var codeG = S('g', null, svg);
  var tire = S('circle', { class: 'ti-tire' }, svg), rim = S('circle', { class: 'ti-rim' }, svg), hub = S('circle', { class: 'ti-hub', r: 14 }, svg);
  var dimO = S('path', { class: 'ti-dim' }, svg), dimR = S('path', { class: 'ti-dim2' }, svg), dimS = S('path', { class: 'ti-dim3' }, svg);
  var tO = S('text', { class: 'ti-t' }, svg), tR = S('text', { class: 'ti-t' }, svg), tS = S('text', { class: 'ti-t' }, svg);
  var inp = side.querySelector('.ti-in'), out = side.querySelector('.ti-out');
  side.querySelectorAll('.ti-ex button').forEach(function (b) { b.addEventListener('click', function () { inp.value = b.dataset.v; show(); }); });
  var COLORS = ['#2f80c4', '#2b9466', '#b98a10', '#c2185b', '#8a5cc2', '#d4581f', '#0f9b9b'];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function show() {
    var raw = inp.value.toUpperCase().replace(/\s+/g, ' ').trim();
    var m = raw.match(/^(P|LT)?\s?(\d{3})\s?\/\s?(\d{2})\s?(ZR|R|D|B)\s?(\d{2})(?:\s+(\d{2,3})(?:\/(\d{2,3}))?\s?([A-Z])?)?$/);
    codeG.innerHTML = '';
    if (!m) {
      out.innerHTML = '<p>Type the size the way it’s printed, for example <b>P215/65R15 95H</b>: a width, a slash, the aspect ratio, R for radial, and the wheel size, then the load index and speed symbol.</p>';
      [tire, rim].forEach(function (c) { c.setAttribute('r', 0); }); dimO.setAttribute('d', ''); dimR.setAttribute('d', ''); dimS.setAttribute('d', '');
      tO.textContent = tR.textContent = tS.textContent = '';
      return;
    }
    var pre = m[1] || '', w = +m[2], ar = +m[3], cons = m[4], rimIn = +m[5], li = m[6], li2 = m[7], sp = m[8];
    var parts = [];
    if (pre) parts.push([pre, pre === 'P' ? 'Passenger-vehicle tire.' : 'Light-truck tire.']);
    parts.push([String(w), 'Width: ' + w + ' mm from sidewall to sidewall (' + f(w / 25.4, 1) + ' in).']);
    parts.push(['/' + ar, 'Aspect ratio: the sidewall is ' + ar + '% as tall as the tire is wide.']);
    parts.push([cons, cons === 'R' ? 'Radial construction.' : cons === 'ZR' ? 'Radial; ZR is used for tires rated over 186 mph.' : 'Not a radial tire; see the tire maker’s information.']);
    parts.push([String(rimIn), 'Wheel (rim) diameter: ' + rimIn + ' inches.']);
    if (li) parts.push([li + (li2 ? '/' + li2 : ''), (li2 ? 'Load indexes: codes' : 'Load index: a code') + ' for how much weight the tire can carry. A load chart turns it into pounds.']);
    if (sp) parts.push([sp, SPEED[sp] ? 'Speed symbol: rated for ' + SPEED[sp] + ' mph (' + f(SPEED[sp] * 1.609344, 0) + ' km/h).' : 'Speed symbol: check the tire maker’s chart for this letter.']);
    // chips across the top of the drawing
    var x = 200, widths = parts.map(function (p) { return p[0].length * 13 + 6; }), total = widths.reduce(function (a, b) { return a + b; }, 0);
    x = 200 - total / 2;
    parts.forEach(function (p, k) {
      var t = S('text', { x: (x + widths[k] / 2).toFixed(1), y: 30, 'text-anchor': 'middle', class: 'ti-code', style: 'fill:' + COLORS[k % COLORS.length] }, codeG);
      t.textContent = p[0]; x += widths[k];
    });
    var side_mm = w * ar / 100, dia_mm = rimIn * 25.4 + 2 * side_mm, rev = 1609344 / (Math.PI * dia_mm);
    var h = parts.map(function (p, k) { return '<p><b style="font-family:ui-monospace,Menlo,Consolas,monospace;color:' + COLORS[k % COLORS.length] + '">' + esc(p[0]) + '</b> ' + p[1] + '</p>'; }).join('');
    h += '<p style="margin-top:.5rem">Sidewall height: ' + w + ' × ' + ar + '% = <b>' + f(side_mm, 0) + ' mm</b> (' + f(side_mm / 25.4, 1) + ' in)</p>' +
      '<p>Overall diameter: ' + rimIn + ' in + 2 × ' + f(side_mm / 25.4, 1) + ' in = <span class="big">' + f(dia_mm / 25.4, 1) + ' in</span> (' + f(dia_mm, 0) + ' mm)</p>' +
      '<p>About <b>' + f(rev, 0) + '</b> turns per mile when new.</p>' +
      '<p class="hs-small">Worked out from the code; real tires vary a little. Use the size on your door label or in your owner’s manual.</p>';
    out.innerHTML = h;
    // drawing to scale
    var scale = 250 / dia_mm, ro = dia_mm / 2 * scale, rr = rimIn * 25.4 / 2 * scale, cx = 180, cy = 185;
    tire.setAttribute('cx', cx); tire.setAttribute('cy', cy); tire.setAttribute('r', ro.toFixed(1));
    rim.setAttribute('cx', cx); rim.setAttribute('cy', cy); rim.setAttribute('r', rr.toFixed(1));
    hub.setAttribute('cx', cx); hub.setAttribute('cy', cy);
    dimO.setAttribute('d', 'M' + (cx - ro) + ',' + (cy + ro + 14) + ' H' + (cx + ro) + ' M' + (cx - ro) + ',' + (cy + ro + 8) + ' v12 M' + (cx + ro) + ',' + (cy + ro + 8) + ' v12');
    tO.setAttribute('x', cx); tO.setAttribute('y', Math.min(346, cy + ro + 34)); tO.setAttribute('text-anchor', 'middle'); tO.textContent = 'overall ' + f(dia_mm / 25.4, 1) + ' in';
    dimR.setAttribute('d', 'M' + (cx - rr) + ',' + cy + ' H' + (cx + rr));
    tR.setAttribute('x', cx); tR.setAttribute('y', cy - 8); tR.setAttribute('text-anchor', 'middle'); tR.textContent = 'rim ' + rimIn + ' in';
    dimS.setAttribute('d', 'M' + (cx + rr) + ',' + (cy - 30) + ' H' + (cx + ro));
    tS.setAttribute('x', cx + ro + 6); tS.setAttribute('y', cy - 36); tS.setAttribute('text-anchor', 'start'); tS.textContent = 'sidewall ' + f(side_mm / 25.4, 1) + ' in';
  }
  inp.addEventListener('input', show);
  show();
})(window, document);
