/* Construction course, Lesson 8: estimating materials. Volume = length × width × thickness; 1 cubic yard = 3 × 3 × 3 =
   27 cubic feet. Sheets = surface area ÷ area of one sheet. Studs at a set spacing = length ÷ spacing, plus one to close
   the end. You choose the extra margin for cuts and waste; suppliers sell in their own sizes, so check before ordering. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-estimate');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var st = { tab: 'concrete', L: 20, Wd: 12, th: 4, rl: 12, rw: 10, rh: 8, ceil: true, open: 40, sheet: 32, wl: 16, oc: 16, extra: 10 };
  root.innerHTML = '';
  root.classList.add('cn-es');
  var tabs = T.h('div', { class: 'tr-seg cn-es-tabs', role: 'group', 'aria-label': 'What to estimate' },
    '<button type="button" data-t="concrete" aria-pressed="true">Concrete slab</button><button type="button" data-t="drywall" aria-pressed="false">Drywall for a room</button><button type="button" data-t="studs" aria-pressed="false">Studs and plates</button>');
  root.appendChild(tabs);
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var svg = S('svg', { viewBox: '0 0 460 120', role: 'img', 'aria-label': 'A picture of the quantity: cubic yards, sheets or studs' }, stage);
  var side = T.h('div'); grid.appendChild(side);
  var q = function (s) { return side.querySelector(s); };
  function rng(cls, label, min, max, step, val, unit) {
    return '<label class="tr-field">' + label + ': <span class="v ' + cls + 'v"></span><input type="range" class="' + cls + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + ' in ' + unit + '"></label>';
  }
  var PANES = {
    concrete: rng('es-L', 'Length', 4, 60, 1, st.L, 'feet') + rng('es-W', 'Width', 4, 40, 1, st.Wd, 'feet') + rng('es-th', 'Thickness', 3, 12, 0.5, st.th, 'inches'),
    drywall: rng('es-rl', 'Room length', 6, 30, 1, st.rl, 'feet') + rng('es-rw', 'Room width', 6, 30, 1, st.rw, 'feet') + rng('es-rh', 'Wall height', 7, 12, 0.5, st.rh, 'feet') +
      rng('es-op', 'Doors and windows (area to subtract)', 0, 120, 2, st.open, 'square feet') +
      '<div class="tr-field">Sheet size<div class="tr-seg es-sheet" role="group" aria-label="Sheet size"><button type="button" data-v="32" aria-pressed="true">4 × 8 ft</button><button type="button" data-v="48" aria-pressed="false">4 × 12 ft</button></div></div>' +
      '<div class="tr-seg es-ceil" role="group" aria-label="Ceiling"><button type="button" aria-pressed="true">Include the ceiling</button></div>',
    studs: rng('es-wl', 'Wall length', 4, 40, 1, st.wl, 'feet') + '<div class="tr-field">Spacing<div class="tr-seg es-oc" role="group" aria-label="Stud spacing"><button type="button" data-v="16" aria-pressed="true">16 in on center</button><button type="button" data-v="24" aria-pressed="false">24 in on center</button></div></div>'
  };
  side.innerHTML = '<div class="es-pane"></div>' + rng('es-x', 'Extra for cuts and waste (your choice)', 0, 25, 1, st.extra, 'percent') + '<div class="tr-out es-out" aria-live="polite"></div>';
  function bind() {
    var map = { 'es-L': 'L', 'es-W': 'Wd', 'es-th': 'th', 'es-rl': 'rl', 'es-rw': 'rw', 'es-rh': 'rh', 'es-op': 'open', 'es-wl': 'wl', 'es-x': 'extra' };
    Object.keys(map).forEach(function (c) { var i = q('.' + c); if (i) { i.value = st[map[c]]; i.addEventListener('input', function () { st[map[c]] = +i.value; update(); }); } });
    var sh = q('.es-sheet'); if (sh) sh.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.sheet = +b.dataset.v; sh.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); update(); });
    if (sh) sh.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.v === st.sheet ? 'true' : 'false'); });
    var ce = q('.es-ceil'); if (ce) { var b = ce.querySelector('button'); b.setAttribute('aria-pressed', st.ceil ? 'true' : 'false'); b.addEventListener('click', function () { st.ceil = !st.ceil; b.setAttribute('aria-pressed', st.ceil ? 'true' : 'false'); update(); }); }
    var oc = q('.es-oc'); if (oc) { oc.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.v === st.oc ? 'true' : 'false'); }); oc.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.oc = +b.dataset.v; oc.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); update(); }); }
  }
  function setTab(t) {
    st.tab = t; q('.es-pane').innerHTML = PANES[t];
    tabs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === t ? 'true' : 'false'); });
    bind(); update();
  }
  function V(c, v) { var e = q('.' + c + 'v'); if (e) e.textContent = v; }
  function icons(n, kind) {
    svg.innerHTML = '';
    var L = { yard: [8, 56, 58, 60], sheet: [12, 36, 64, 72], stud: [20, 22, 100, 108] }[kind]; // cols, cell w, cell h, row h
    var max = L[0] * 4, shown = Math.min(n, max), rows = Math.max(1, Math.ceil(Math.ceil(shown) / L[0]));
    var H = 34 + rows * L[3];
    svg.setAttribute('viewBox', '0 0 460 ' + H);
    for (var i = 0; i < Math.ceil(shown); i++) {
      var c = i % L[0], r = Math.floor(i / L[0]), frac = Math.min(1, shown - i), x = 10 + c * L[1], y = 8 + r * L[3];
      if (kind === 'yard') {
        var s = 24, hgt = 26 * frac;
        S('path', { class: 'cn-es-cube2', d: 'M' + x + ',' + (y + 12 + 26 - hgt) + ' v' + hgt + ' l' + s + ',12 v-' + hgt + ' z' }, svg);
        S('path', { class: 'cn-es-cube3', d: 'M' + (x + s) + ',' + (y + 24 + 26 - hgt) + ' v' + hgt + ' l' + s + ',-12 v-' + hgt + ' z' }, svg);
        S('path', { class: 'cn-es-cube', d: 'M' + x + ',' + (y + 12 + 26 - hgt) + ' l' + s + ',-12 l' + s + ',12 l-' + s + ',12 z' }, svg);
      } else if (kind === 'sheet') {
        var hh = st.sheet === 48 ? 60 : 42;
        S('rect', { class: 'cn-es-sheet', x: x, y: y + (60 - hh), width: 22 * (frac < 1 ? frac : 1), height: hh, rx: 1.5 }, svg);
      } else {
        S('rect', { class: 'cn-es-stud', x: x, y: y + 92 * (1 - frac), width: 8, height: 92 * frac, rx: 1 }, svg);
      }
    }
    var cap = { yard: 'each block = 1 cubic yard (3 × 3 × 3 ft = 27 cubic feet)', sheet: 'each panel = one ' + (st.sheet === 48 ? '4 × 12' : '4 × 8') + ' ft sheet', stud: 'each stick = one stud' }[kind];
    var t = S('text', { class: 'tx-sm', x: 10, y: H - 10 }, svg); t.textContent = cap + (n > max ? ' · showing ' + max + ' of ' + T.fmt(n, kind === 'yard' ? 2 : 0) : '');
  }
  function update() {
    var x = 1 + st.extra / 100, out = '';
    V('es-x', st.extra + '%');
    if (st.tab === 'concrete') {
      V('es-L', st.L + ' ft'); V('es-W', st.Wd + ' ft'); V('es-th', st.th + ' in');
      var cf = st.L * st.Wd * st.th / 12, cy = cf / 27, cyx = cy * x;
      out = '<p>Volume: ' + st.L + ' × ' + st.Wd + ' × ' + st.th + '/12 ft = <b>' + T.fmt(cf, 1) + ' cubic feet</b></p>' +
        '<p>÷ 27 cubic feet per cubic yard = <b>' + cy.toFixed(2) + ' cubic yards</b></p>' +
        '<p>With ' + st.extra + '% extra: <span class="big">' + cyx.toFixed(2) + ' cubic yards</span></p>' +
        '<p class="hs-small">Concrete is sold by the cubic yard. Thickness, base, reinforcement and joints for a real slab come from the plans and the local code.</p>';
      icons(cyx, 'yard');
    } else if (st.tab === 'drywall') {
      V('es-rl', st.rl + ' ft'); V('es-rw', st.rw + ' ft'); V('es-rh', st.rh + ' ft'); V('es-op', st.open + ' sq ft');
      var walls = 2 * (st.rl + st.rw) * st.rh, ceil = st.ceil ? st.rl * st.rw : 0, area = Math.max(0, walls + ceil - st.open), sheets = area / st.sheet, n = Math.ceil(sheets * x - 1e-9);
      out = '<p>Walls: 2 × (' + st.rl + ' + ' + st.rw + ') × ' + st.rh + ' = <b>' + T.fmt(walls) + ' sq ft</b>' + (st.ceil ? '; ceiling: ' + st.rl + ' × ' + st.rw + ' = <b>' + T.fmt(ceil) + ' sq ft</b>' : '') + '</p>' +
        '<p>Minus openings: <b>' + T.fmt(area) + ' sq ft</b> to cover</p>' +
        '<p>÷ ' + st.sheet + ' sq ft per sheet = ' + sheets.toFixed(1) + '; with ' + st.extra + '% extra: <span class="big">' + n + ' sheets</span></p>';
      icons(n, 'sheet');
    } else {
      V('es-wl', st.wl + ' ft');
      var studs = Math.floor(st.wl * 12 / st.oc) + 1, nx = Math.ceil(studs * x - 1e-9), plates = 3 * st.wl;
      out = '<p>Studs: ' + st.wl * 12 + ' in ÷ ' + st.oc + ' in, rounded down, + 1 = <b>' + studs + '</b></p>' +
        '<p>With ' + st.extra + '% extra: <span class="big">' + nx + ' studs</span></p>' +
        '<p>Plates (one bottom, two top): 3 × ' + st.wl + ' ft = <b>' + plates + ' linear feet</b></p>' +
        '<p class="hs-small">Corners, openings and wall intersections need extra studs; Lesson 4’s wall builder shows where they go.</p>';
      icons(nx, 'stud');
    }
    q('.es-out').innerHTML = out;
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setTab(b.dataset.t); });
  setTab('concrete');
})(window, document);
