/* Plumbing course, Lesson 2: water pressure and height.
   Static pressure at a tap = 0.4335 psi per foot × (water surface elevation − tap elevation). 0.4335 comes from NIST SP 811:
   foot of water (39.2 °F) = 2,988.98 Pa; 1 psi = 6,894.757 Pa. The 80 psi line is IRC P2903.3.1 as quoted by the City of Edmond, OK
   (and HUD 24 CFR 3280.609); PRV settings 45–75 psi follow City of San Diego guidance; 15 psi preferable / 8 psi minimum at fixtures
   follows HUD's Residential Rehabilitation Inspection Guide. No flow losses are modeled: these are static (no-flow) pressures. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-pressure');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg, PSI_FT = 2988.98 / 6894.757;
  var FLOOR = 10, TAP = 3;                       // feet per story; tap height above each floor
  var st = { H: 130, g: 0, n: 3, prv: false, set: 60 };
  var drag = false, off = 0;
  // drawing scale: elevation e (ft) -> y
  var Y0 = 300, K = 1.05, TX = 30;                // y of elevation 0; px per foot (auto-zoom, frozen while dragging); tower x offset
  function y(e) { return Y0 - e * K; }

  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 440 420', role: 'img', 'aria-label': 'A water tower and a building; gauges show the static water pressure at each floor', class: 'pl-pr' }, stage);
  svg.innerHTML = '<defs><linearGradient id="pr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="pl-pr-sky1"/><stop offset="1" class="pl-pr-sky2"/></linearGradient></defs>';
  S('rect', { x: 0, y: 0, width: 440, height: 420, fill: 'url(#pr-sky)' }, svg);
  var ground = S('path', { class: 'pl-pr-ground' }, svg);
  var main = S('path', { class: 'pl-pr-main' }, svg);
  var hgl = S('path', { class: 'pl-pr-hgl' }, svg);
  var hglT = S('text', { class: 'pl-pr-t', x: 436, 'text-anchor': 'end' }, svg);
  // tower
  var legs = S('path', { class: 'pl-pr-leg' }, svg);
  var riser = S('path', { class: 'pl-pr-riser' }, svg);
  var tower = S('g', { class: 'pl-pr-tank', tabindex: '0', role: 'slider', 'aria-label': 'Water level in the tower, feet above the tower base', 'aria-valuemin': 40, 'aria-valuemax': 230 }, svg);
  var tankBody = S('rect', { x: 56, width: 70, height: 36, rx: 12, class: 'pl-pr-tankb' }, tower);
  var tankWater = S('rect', { x: 59, width: 64, rx: 9, class: 'pl-pr-tankw' }, tower);
  var tankGrip = S('path', { class: 'pl-pr-grip' }, tower);
  var towerT = S('text', { class: 'pl-pr-t pl-pr-b', x: 91, 'text-anchor': 'middle' }, svg);
  // building
  var bldg = S('g', null, svg);
  var prvG = S('g', null, svg);
  var prvBox = S('rect', { width: 22, height: 14, rx: 3, class: 'pl-pr-prv' }, prvG);
  var prvT = S('text', { class: 'pl-pr-t pl-pr-b', 'text-anchor': 'end' }, prvG);
  // scale
  var scaleG = S('g', { class: 'pl-pr-scale' }, svg);
  S('text', { class: 'pl-pr-t', x: 4, y: 414 }, svg).textContent = 'Heights to scale; static pressure (no water flowing).';

  side.innerHTML =
    '<div class="tr-seg pl-pr-pre" role="group" aria-label="Examples"><button type="button" data-p="0" aria-pressed="true">Typical town</button><button type="button" data-p="1" aria-pressed="false">Bottom of a hill</button><button type="button" data-p="2" aria-pressed="false">Tall building</button></div>' +
    '<label class="tr-field">Water level in the tower: <span class="v pr-v1"></span><input type="range" class="pr-h" min="40" max="230" step="1" aria-label="Water level in the tower, feet"></label>' +
    '<label class="tr-field">Building’s ground compared with the tower’s: <span class="v pr-v2"></span><input type="range" class="pr-g" min="-90" max="40" step="1" aria-label="Building ground elevation compared with the tower base, feet"></label>' +
    '<label class="tr-field">Stories: <span class="v pr-v3"></span><input type="range" class="pr-n" min="1" max="8" step="1" aria-label="Number of stories"></label>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost pr-prv" aria-pressed="false">Add a pressure-reducing valve</button></div>' +
    '<label class="tr-field pr-setf" hidden>PRV setting: <span class="v pr-v4"></span><input type="range" class="pr-set" min="45" max="75" step="1" aria-label="PRV setting, psi"></label>' +
    '<div class="tr-out pr-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  var iH = q('.pr-h'), iG = q('.pr-g'), iN = q('.pr-n'), iS = q('.pr-set'), bP = q('.pr-prv'), out = q('.pr-out');
  var PRE = [{ H: 130, g: 0, n: 3, prv: false }, { H: 130, g: -80, n: 2, prv: false }, { H: 150, g: 20, n: 8, prv: false }];

  function f0(x) { return T.fmt(x, 0); }
  function cls(p) { return p <= 0 ? 'pl-pr-none' : p > 80 ? 'pl-pr-hi' : p < 8 ? 'pl-pr-lo2' : p < 15 ? 'pl-pr-lo' : 'pl-pr-ok'; }
  function draw() {
    var H = st.H, g = st.g, n = st.n;
    if (!drag) { var hi = Math.max(H, g + n * FLOOR) + 34, lo = Math.min(0, g) - 14; K = Math.min(3.2, 370 / (hi - lo)); Y0 = 20 + hi * K; }
    iH.value = H; iG.value = g; iN.value = n; iS.value = st.set;
    q('.pr-v1').textContent = H + ' ft above the tower base';
    q('.pr-v2').textContent = (g === 0 ? 'same level' : g > 0 ? g + ' ft higher (uphill)' : -g + ' ft lower (downhill)');
    q('.pr-v3').textContent = n + (n === 1 ? ' story' : ' stories');
    q('.pr-v4').textContent = st.set + ' psi';
    q('.pr-setf').hidden = !st.prv;
    bP.setAttribute('aria-pressed', st.prv ? 'true' : 'false');
    bP.textContent = st.prv ? 'Remove the pressure-reducing valve' : 'Add a pressure-reducing valve';
    // terrain: tower ground at x 20..110 elevation 0; slope to building ground from x 150..230; building x 250..380
    var bx = 250, bw = 120, gy = y(g), ty = y(0);
    ground.setAttribute('d', 'M0,' + ty + ' H130 C170,' + ty + ' 190,' + gy + ' 230,' + gy + ' H440 V420 H0 Z');
    var mainY = Math.max(ty, gy) + 14;
    main.setAttribute('d', 'M91,' + (ty + 2) + ' V' + (ty + 14) + ' H130 C170,' + (ty + 14) + ' 190,' + (gy + 14) + ' 230,' + (gy + 14) + ' H' + (bx + 14) + ' V' + (gy - 4));
    // tower
    var top = y(H);
    tower.setAttribute('aria-valuenow', H); tower.setAttribute('aria-valuetext', H + ' feet');
    tankBody.setAttribute('y', top - 6); tankWater.setAttribute('y', top); tankWater.setAttribute('height', 27);
    tankGrip.setAttribute('d', 'M80,' + (top + 9) + ' h22 M80,' + (top + 15) + ' h22');
    legs.setAttribute('d', 'M66,' + (top + 30) + ' L60,' + ty + ' M116,' + (top + 30) + ' L122,' + ty + ' M63,' + ((top + 30 + ty) / 2) + ' H119');
    riser.setAttribute('d', 'M91,' + (top + 30) + ' V' + (ty + 2));
    towerT.setAttribute('y', top - 12); towerT.textContent = 'drag the tank';
    // hydraulic grade line
    hgl.setAttribute('d', 'M126,' + top + ' H440');
    hglT.setAttribute('y', top - 4); hglT.textContent = 'water surface: ' + H + ' ft';
    // building
    var bt = gy - n * FLOOR * K;
    var h = '<rect class="pl-pr-bldg" x="' + bx + '" y="' + bt.toFixed(1) + '" width="' + bw + '" height="' + (gy - bt).toFixed(1) + '"/>';
    var entryE = g - 2, pEntry = PSI_FT * (H - entryE);
    var prvOut = st.prv ? Math.min(st.set, pEntry) : pEntry;
    var rows = [], lowP = Infinity, highP = -Infinity;
    for (var i = 0; i < n; i++) {
      var fe = g + i * FLOOR, te = fe + TAP, fy = y(fe), tyy = y(te);
      var p = Math.max(0, prvOut - PSI_FT * (te - entryE));
      if (pEntry <= 0) p = 0;
      rows.push(p); lowP = Math.min(lowP, p); highP = Math.max(highP, p);
      if (i > 0) h += '<path class="pl-pr-fl" d="M' + bx + ',' + fy.toFixed(1) + ' h' + bw + '"/>';
      h += '<path class="pl-pr-tap" d="M' + (bx + 14) + ',' + tyy.toFixed(1) + ' h12 v4"/>';
      h += '<rect class="' + cls(p) + '" x="' + (bx + 34) + '" y="' + (tyy - 4.5).toFixed(1) + '" width="' + Math.min(78, Math.max(2, p * 0.78)).toFixed(1) + '" height="7" rx="3"/>';
      h += '<text class="pl-pr-t pl-pr-b" x="' + (bx + bw + 6) + '" y="' + (tyy + 3.5).toFixed(1) + '">' + f0(p) + ' psi</text>';
    }
    h += '<path class="pl-pr-riser2" d="M' + (bx + 14) + ',' + (gy - 4) + ' V' + y(g + (n - 1) * FLOOR + TAP).toFixed(1) + '"/>';
    bldg.innerHTML = h;
    // PRV
    prvG.style.display = st.prv ? '' : 'none';
    prvBox.setAttribute('x', bx + 3); prvBox.setAttribute('y', gy + 7);
    prvT.setAttribute('x', bx - 4); prvT.setAttribute('y', gy + 18); prvT.textContent = 'PRV';
    // scale ticks every 50 ft
    var sc = '';
    var stepE = K > 2 ? 20 : 50;
    for (var e = -100; e <= 260; e += stepE) { var yy = y(e); if (yy < 10 || yy > 392) continue; sc += '<path d="M0,' + yy.toFixed(1) + ' h8"/><text class="pl-pr-t" x="11" y="' + (yy + 4).toFixed(1) + '">' + (e > 0 ? '+' : '') + e + ' ft</text>'; }
    scaleG.innerHTML = sc;
    // readout
    var o = '<p>Height of the water surface above the lowest tap: <b>' + f0(H - (g + TAP)) + ' ft</b></p>';
    o += '<p>Pressure where the water enters the building: <span class="big">' + f0(Math.max(0, pEntry)) + ' psi</span></p>';
    if (pEntry <= 0) o += '<p class="warn">The building is higher than the water surface: no water reaches it without a pump.</p>';
    else {
      o += '<p>Lowest floor: <b>' + f0(rows[0]) + ' psi</b> · top floor: <b>' + f0(rows[n - 1]) + ' psi</b> (' + f0(PSI_FT * FLOOR * (n - 1)) + ' psi less, ' + (n - 1) * FLOOR + ' ft higher)</p>';
      if (!st.prv && pEntry > 80) o += '<p class="warn">Over 80 psi. The model code quoted by the City of Edmond calls for a pressure-reducing valve here.</p>';
      else if (st.prv && pEntry > st.set) o += '<p class="ok">The PRV holds the house side at ' + st.set + ' psi; the street side stays at ' + f0(pEntry) + ' psi.</p>';
      else if (st.prv) o += '<p>The street pressure is below the PRV’s setting, so the valve stays wide open.</p>';
      if (rows[n - 1] > 0 && rows[n - 1] < 8) o += '<p class="warn">Top floor under 8 psi: below the least HUD’s inspection guide says will do.</p>';
      else if (rows[n - 1] > 0 && rows[n - 1] < 15) o += '<p class="warn">Top floor under 15 psi, the pressure HUD’s guide calls preferable at each fixture.</p>';
      else if (rows[n - 1] <= 0) o += '<p class="warn">The top floor is above the water surface: no water there.</p>';
    }
    o += '<p class="hs-small">P = 0.4335 psi/ft × (water surface − tap height). Colors: <span class="pl-pr-k pl-pr-ok"></span> 15–80 psi <span class="pl-pr-k pl-pr-lo"></span> under 15 <span class="pl-pr-k pl-pr-hi"></span> over 80.</p>';
    out.innerHTML = o;
  }
  function setPre(i) {
    var p = PRE[i]; st.H = p.H; st.g = p.g; st.n = p.n; st.prv = p.prv;
    side.querySelectorAll('.pl-pr-pre button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.p == i ? 'true' : 'false'); });
    draw();
  }
  function clearPre() { side.querySelectorAll('.pl-pr-pre button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); }
  side.querySelectorAll('.pl-pr-pre button').forEach(function (b) { b.addEventListener('click', function () { setPre(+b.dataset.p); }); });
  iH.addEventListener('input', function () { st.H = +iH.value; clearPre(); draw(); });
  iG.addEventListener('input', function () { st.g = +iG.value; clearPre(); draw(); });
  iN.addEventListener('input', function () { st.n = +iN.value; clearPre(); draw(); });
  iS.addEventListener('input', function () { st.set = +iS.value; draw(); });
  bP.addEventListener('click', function () { st.prv = !st.prv; draw(); });
  // drag the tank
  function evY(e) { var r = svg.getBoundingClientRect(); return (e.clientY - r.top) * 420 / r.height; }
  tower.addEventListener('pointerdown', function (e) { drag = true; off = evY(e) - y(st.H); try { tower.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); });
  tower.addEventListener('pointermove', function (e) { if (!drag) return; var H = Math.round((Y0 - (evY(e) - off)) / K); st.H = Math.max(40, Math.min(230, H)); clearPre(); draw(); });
  tower.addEventListener('pointerup', function () { drag = false; draw(); });
  tower.addEventListener('pointercancel', function () { drag = false; draw(); });
  tower.addEventListener('keydown', function (e) {
    var d = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 20, PageDown: -20 }[e.key];
    if (d) { st.H = Math.max(40, Math.min(230, st.H + d)); clearPre(); draw(); e.preventDefault(); }
  });
  draw();
})(window, document);
