/* Plumbing course, Lesson 8: the leak counter.
   gallons per day = drips per minute × 1,440 × drop size (mL) ÷ 3,785.412 mL per gallon (NIST: 1 gal = 3.785412 L).
   The default drop size, 0.361 mL, is back-calculated from EPA WaterSense's two figures (1 drip per second → more than
   3,000 gallons a year; 10 drips per minute → more than 500 gallons a year). EPA's septic program: a running toilet can waste
   up to 200 gallons a day; EPA WaterSense: average household leaks can waste more than 9,300 gallons a year; a WaterSense
   toilet uses 1.28 gallons per flush. 1 CCF = 100 ft³ = 748.05 gal (NIST). The water price is the reader's own. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-leak');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg, ML_GAL = 3785.412, CCF = 748.05;
  var DEF = 0.361;
  var st = { mode: 'drip', dpm: 60, ml: DEF, gpd: 200, price: 10, unit: 'k', jug: 0, total: 0, hours: 0, drops: [], dt: 0 };
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 300 300', role: 'img', 'aria-label': 'A dripping faucet over a one-gallon jug that fills as the hours go by', class: 'pl-lk' }, stage);
  var gDrip = S('g', null, svg);
  S('path', { class: 'pl-lk-fau', d: 'M0,40 H80 Q100,40 100,60 V78 H82 V64 Q82,58 76,58 H0 Z' }, gDrip);
  S('rect', { class: 'pl-lk-hand', x: 30, y: 22, width: 30, height: 12, rx: 4 }, gDrip);
  var dropsG = S('g', null, gDrip);
  var stream = S('path', { class: 'pl-lk-stream', d: 'M91,80 V196' }, gDrip);
  var gToil = S('g', null, svg);
  S('rect', { class: 'pl-lk-tank', x: 30, y: 20, width: 110, height: 66, rx: 8 }, gToil);
  S('rect', { class: 'pl-lk-tw', x: 36, y: 38, width: 98, height: 42, rx: 4 }, gToil);
  S('path', { class: 'pl-lk-bowl', d: 'M8,96 H160 Q156,146 110,156 L104,186 H78 L74,156 Q12,146 8,96 Z' }, gToil);
  var tStream = S('path', { class: 'pl-lk-stream thin', d: 'M92,86 Q94,140 91,196' }, gToil);
  S('text', { class: 'pl-lk-t', x: 168, y: 56 }, gToil).textContent = 'water seeping';
  S('text', { class: 'pl-lk-t', x: 168, y: 72 }, gToil).textContent = 'or running';
  // jug
  S('path', { class: 'pl-lk-jug', d: 'M56,206 h70 v-10 h-16 v-8 h-38 v8 h-16 z' }, svg);
  S('path', { class: 'pl-lk-jugb', d: 'M56,206 V286 Q56,294 64,294 H118 Q126,294 126,286 V206' }, svg);
  var jugW = S('rect', { class: 'pl-lk-w', x: 59, width: 64, rx: 4 }, svg);
  S('text', { class: 'pl-lk-t', x: 136, y: 222 }, svg).textContent = 'a 1-gallon jug';
  var hrT = S('text', { class: 'pl-lk-t pl-lk-b', x: 136, y: 252 }, svg);
  var totT = S('text', { class: 'pl-lk-t', x: 136, y: 270 }, svg);
  S('text', { class: 'pl-lk-t pl-lk-sm', x: 136, y: 288 }, svg).textContent = 'jug time: 1 second = 1 hour';

  side.innerHTML =
    '<div class="tr-seg lk-mode" role="group" aria-label="What is leaking"><button type="button" data-m="drip" aria-pressed="true">Dripping faucet</button><button type="button" data-m="toilet" aria-pressed="false">Leaking toilet</button></div>' +
    '<div class="lk-drip"><div class="tr-seg lk-pre" role="group" aria-label="EPA examples"><button type="button" data-d="60">1 drip a second</button><button type="button" data-d="10">Showerhead, 10 a minute</button></div>' +
    '<label class="tr-field">Drips per minute: <span class="v lk-v1"></span><input type="range" class="lk-dpm" min="1" max="240" step="1" aria-label="Drips per minute"></label>' +
    '<label class="tr-field">Drop size: <span class="v lk-v2"></span><input type="range" class="lk-ml" min="0.1" max="1" step="0.001" aria-label="Drop size in milliliters"></label></div>' +
    '<div class="lk-toil" hidden><label class="tr-field">Leak rate: <span class="v lk-v3"></span><input type="range" class="lk-gpd" min="1" max="200" step="1" aria-label="Gallons per day"></label>' +
    '<p class="hs-small">EPA’s septic program says a single leaky or running toilet can waste up to 200 gallons a day. A slow flapper leak may be far less; the meter test tells you yours.</p></div>' +
    '<div class="lk-price"><label class="tr-field">Your water price (from your bill; $10 is just an example): <span class="v lk-v4"></span><input type="number" class="lk-p" min="0" max="200" step="0.25" inputmode="decimal" aria-label="Water price in dollars"></label>' +
    '<div class="tr-seg lk-unit" role="group" aria-label="Price unit"><button type="button" data-u="k" aria-pressed="true">per 1,000 gallons</button><button type="button" data-u="c" aria-pressed="false">per CCF (748 gal)</button></div></div>' +
    '<div class="tr-out lk-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  var out = q('.lk-out');
  function gpd() { return st.mode === 'drip' ? st.dpm * 1440 * st.ml / ML_GAL : st.gpd; }
  function update() {
    q('.lk-dpm').value = st.dpm; q('.lk-ml').value = st.ml; q('.lk-gpd').value = st.gpd; q('.lk-p').value = st.price;
    q('.lk-v1').textContent = st.dpm + (st.dpm === 60 ? ' (one a second)' : '');
    q('.lk-v2').textContent = st.ml.toFixed(2) + ' mL' + (Math.abs(st.ml - DEF) < 0.0015 ? ' (matches EPA’s figures)' : '');
    q('.lk-v3').textContent = st.gpd + ' gallons a day';
    q('.lk-v4').textContent = '$' + (+st.price).toFixed(2) + (st.unit === 'k' ? ' per 1,000 gal' : ' per CCF');
    q('.lk-drip').hidden = st.mode !== 'drip'; q('.lk-toil').hidden = st.mode === 'drip';
    gDrip.style.display = st.mode === 'drip' ? '' : 'none'; gToil.style.display = st.mode === 'drip' ? 'none' : '';
    side.querySelectorAll('.lk-pre button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.d === st.dpm && Math.abs(st.ml - DEF) < 0.0015 ? 'true' : 'false'); });
    var d = gpd(), y = d * 365, perGal = st.unit === 'k' ? st.price / 1000 : st.price / CCF, cost = y * perGal;
    var o = '<p><span class="big">' + T.fmt(d, d < 10 ? 1 : 0) + ' gallons a day</span></p>';
    o += '<p><b>' + T.fmt(d * 30, 0) + '</b> gallons a month · <b>' + T.fmt(y, 0) + '</b> gallons a year</p>';
    o += '<p>Cost at your price: <b>$' + T.fmt(cost, cost < 100 ? 2 : 0) + ' a year</b>' + (perGal > 0 ? '' : ' (enter your price)') + '</p>';
    o += '<p>That’s the water for about <b>' + T.fmt(y / 1.28, 0) + '</b> flushes of a WaterSense toilet (1.28 gallons each).</p>';
    var frac = Math.min(1, y / 9300);
    o += '<div class="pl-lk-cmp"><span style="width:' + (100 * frac).toFixed(1) + '%"></span></div><p class="hs-small">Compared with EPA’s figure for the average household’s leaks: more than 9,300 gallons a year' + (y >= 9300 ? '. This one leak beats it.' : '.') + '</p>';
    if (st.mode === 'drip' && st.dpm === 60 && Math.abs(st.ml - DEF) < 0.0015) o += '<p class="ok">✓ Matches EPA: a faucet dripping once a second can waste more than 3,000 gallons a year.</p>';
    if (st.mode === 'drip' && st.dpm === 10 && Math.abs(st.ml - DEF) < 0.0015) o += '<p class="ok">✓ Matches EPA: a showerhead leaking 10 drips a minute wastes more than 500 gallons a year.</p>';
    out.innerHTML = o;
    stream.style.display = st.mode === 'drip' && st.dpm >= 200 ? '' : 'none';
    tStream.setAttribute('class', 'pl-lk-stream' + (st.gpd < 60 ? ' thin' : ''));
  }
  function frame(dt) {
    var d = gpd();
    // jug: 1 real second = 1 hour
    st.hours += dt; var add = d / 24 * dt;
    st.jug += add; st.total += add;
    while (st.jug >= 1) st.jug -= 1;
    var h = 84 * st.jug;
    jugW.setAttribute('y', (290 - h).toFixed(1)); jugW.setAttribute('height', h.toFixed(1));
    hrT.textContent = Math.floor(st.hours) + ' hours';
    totT.textContent = T.fmt(st.total, st.total < 10 ? 1 : 0) + ' gallons so far';
    // drops at real speed
    if (st.mode === 'drip' && !T.reduced && st.dpm < 200) {
      st.dt += dt;
      var every = 60 / st.dpm;
      if (st.dt >= every) { st.dt = 0; st.drops.push({ y: 82, v: 0 }); }
      st.drops.forEach(function (p) { p.v += 900 * dt; p.y += p.v * dt; });
      st.drops = st.drops.filter(function (p) { return p.y < 286 - 84 * st.jug; });
      dropsG.innerHTML = st.drops.map(function (p) { return '<path class="pl-lk-drop" d="M91,' + (p.y - 14).toFixed(1) + ' q8,12 0,17 q-8,-5 0,-17 z"/>'; }).join('');
    } else dropsG.innerHTML = st.mode === 'drip' && st.dpm < 200 ? '<path class="pl-lk-drop" d="M91,84 q8,12 0,17 q-8,-5 0,-17 z"/>' : '';
  }
  function reset() { st.jug = 0; st.total = 0; st.hours = 0; }
  side.querySelectorAll('.lk-mode button').forEach(function (b) { b.addEventListener('click', function () { st.mode = b.dataset.m; side.querySelectorAll('.lk-mode button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); reset(); update(); }); });
  side.querySelectorAll('.lk-pre button').forEach(function (b) { b.addEventListener('click', function () { st.dpm = +b.dataset.d; st.ml = DEF; reset(); update(); }); });
  side.querySelectorAll('.lk-unit button').forEach(function (b) { b.addEventListener('click', function () { st.unit = b.dataset.u; side.querySelectorAll('.lk-unit button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); update(); }); });
  q('.lk-dpm').addEventListener('input', function () { st.dpm = +this.value; reset(); update(); });
  q('.lk-ml').addEventListener('input', function () { st.ml = +this.value; reset(); update(); });
  q('.lk-gpd').addEventListener('input', function () { st.gpd = +this.value; reset(); update(); });
  q('.lk-p').addEventListener('input', function () { var v = parseFloat(this.value); st.price = isFinite(v) && v >= 0 ? v : 0; update(); q('.lk-p').value = this.value; });
  update();
  T.loop(root, frame);
})(window, document);
