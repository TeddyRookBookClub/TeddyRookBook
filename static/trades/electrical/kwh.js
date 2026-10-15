/* Electrical course, Lesson 2: what it costs to run things. DOE Energy Saver's method:
   kWh per day = watts × hours per day ÷ 1,000; cost = kWh × price per kWh. Typical wattages are from Virginia Cooperative Extension
   BSE-301NP (ranges; a typical value is used) and DOE (1,500 W kettle; 9 W LED); Level 2 charging at 7.2 kW is from DOE's AFDC.
   Default price: U.S. average residential price, July 2026, 18.31 cents/kWh (EIA Electricity Monthly Update, Sept. 24, 2026).
   Average home: 10,791 kWh in 2022, about 899 kWh a month (EIA). */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-kwh');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var APPL = [
    ['LED bulb', 9, '9 W (DOE, about 1,100 lumens)', 120, 5],
    ['Laptop', 50, '50 W', 120, 6],
    ['Ceiling fan', 120, '65–175 W', 120, 8],
    ['Flat-screen TV', 120, '120 W', 120, 4],
    ['Window fan', 150, '55–250 W', 120, 8],
    ['Microwave oven', 1000, '750–1,100 W', 120, 0.25],
    ['Coffee maker', 1000, '900–1,200 W', 120, 0.25],
    ['Toaster', 1100, '800–1,400 W', 120, 0.1],
    ['Vacuum cleaner', 1200, '1,000–1,440 W', 120, 0.25],
    ['Clothes iron', 1400, '1,000–1,800 W', 120, 0.25],
    ['Electric kettle', 1500, '1,500 W (DOE example)', 120, 0.25],
    ['Hair dryer', 1500, '1,200–1,875 W', 120, 0.2],
    ['Portable heater', 1500, '750–1,500 W', 120, 4],
    ['Dishwasher', 1800, '1,200–2,400 W', 120, 1],
    ['Clothes dryer', 3400, '1,800–5,000 W', 240, 0.7],
    ['Water heater (40 gal)', 4500, '4,500–5,500 W while heating', 240, 3],
    ['Level 2 EV charger', 7200, '7.2 kW (AFDC)', 240, 1]
  ];
  var PRICE0 = 18.31, AVG = 899;
  var list = [[10, 0.5], [0, 5], [12, 4]].map(function (x) { return { i: x[0], w: APPL[x[0]][1], h: x[1] }; });
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var left = T.h('div'), right = T.h('div'); grid.appendChild(left); grid.appendChild(right);
  var opts = APPL.map(function (a, i) { return '<option value="' + i + '">' + a[0] + ': ' + a[2] + '</option>'; }).join('');
  left.innerHTML =
    '<h3>Add an appliance</h3>' +
    '<label class="tr-field">Appliance <select class="k-ap">' + opts + '</select></label>' +
    '<label class="tr-field">Watts: <span class="v k-wv"></span><input type="range" class="k-w" min="5" max="7500" step="5" aria-label="Watts"></label>' +
    '<label class="tr-field">Hours a day: <span class="v k-hv"></span><input type="range" class="k-h" min="0.1" max="24" step="0.05" aria-label="Hours used per day"></label>' +
    '<p class="k-amps hs-small" aria-live="polite"></p>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn k-add">+ Add to my list</button><button type="button" class="hs-btn ghost k-clear">Clear the list</button></div>' +
    '<label class="tr-field">Your price per kWh, in cents: <input type="text" inputmode="decimal" class="k-price" value="' + PRICE0 + '" aria-label="Price per kilowatt-hour in cents" style="max-width:8rem"></label>' +
    '<p class="hs-small">18.31¢ is the U.S. average residential price for July 2026 (EIA). Your bill shows your own price.</p>';
  right.innerHTML = '<div class="el-k-meter"></div><div class="tr-out k-out" aria-live="polite"></div>';
  var q = function (s) { return root.querySelector(s); };
  var iA = q('.k-ap'), iW = q('.k-w'), iH = q('.k-h'), iP = q('.k-price'), out = q('.k-out');
  // the meter face
  var msvg = S('svg', { viewBox: '0 0 300 92', role: 'img', 'aria-label': 'Electric meter showing kilowatt-hours per month for your list', class: 'el-kmeter' }, q('.el-k-meter'));
  S('rect', { class: 'el-km-case', x: 4, y: 4, width: 292, height: 84, rx: 16 }, msvg);
  S('rect', { class: 'el-km-lcd', x: 20, y: 18, width: 180, height: 44, rx: 6 }, msvg);
  var mTxt = S('text', { class: 'el-km-num', x: 192, y: 52, 'text-anchor': 'end' }, msvg);
  S('text', { class: 'el-km-unit', x: 212, y: 38 }, msvg).textContent = 'kWh';
  S('text', { class: 'el-km-unit', x: 212, y: 54 }, msvg).textContent = 'a month';
  var mCost = S('text', { class: 'el-km-cost', x: 20, y: 80 }, msvg);
  var pulse = S('circle', { class: 'el-km-led', cx: 280, cy: 24, r: 5 }, msvg);
  function f(x, d) { return T.fmt(x, d); }
  function hrs(h) { return h < 1 ? f(h * 60, 0) + ' min' : (Math.abs(h - Math.round(h)) < 0.03 ? f(Math.round(h), 0) : f(h, 2).replace(/0$/, '')) + ' h'; }
  function price() { var p = parseFloat(String(iP.value).replace(/[^0-9.]/g, '')); return isFinite(p) && p > 0 && p < 500 ? p : PRICE0; }
  function pick(i, keepW) {
    var a = APPL[i];
    if (!keepW) { iW.value = a[1]; iH.value = a[4]; }
    sel();
  }
  function sel() {
    var a = APPL[+iA.value], w = +iW.value, h = +iH.value, v = a[3];
    q('.k-wv').textContent = f(w, 0) + ' W';
    q('.k-hv').textContent = hrs(h);
    iH.setAttribute('aria-valuetext', hrs(h));
    var kwh = w * h / 1000;
    q('.k-amps').innerHTML = 'Draws <b>' + f(w / v, 1) + ' A</b> at ' + v + ' V (amps = watts ÷ volts). Per day: ' + f(w, 0) + ' W × ' + hrs(h) + ' ÷ 1,000 = <b>' + f(kwh, 2) + ' kWh</b>.';
  }
  function render() {
    var p = price() / 100, tot = 0, rows = '', max = 0;
    list.forEach(function (it) { it.kwh = it.w * it.h * 30 / 1000; it.cost = it.kwh * p; tot += it.kwh; if (it.cost > max) max = it.cost; });
    list.forEach(function (it, k) {
      var a = APPL[it.i];
      rows += '<li><span class="el-k-name"><b>' + a[0] + '</b> <small>' + f(it.w, 0) + ' W × ' + hrs(it.h) + '/day</small></span>' +
        '<span class="el-k-bar" aria-hidden="true"><b style="width:' + (max ? Math.max(1.5, 100 * it.cost / max) : 0).toFixed(1) + '%"></b></span>' +
        '<span class="el-k-c">' + f(it.kwh, 1) + ' kWh · <b>$' + f(it.cost, 2) + '</b></span>' +
        '<button type="button" class="el-k-x" data-k="' + k + '" aria-label="Remove ' + a[0] + '">×</button></li>';
    });
    var cost = tot * p;
    out.innerHTML = (list.length ? '<ul class="el-k-list">' + rows + '</ul>' : '<p>Your list is empty. Add an appliance.</p>') +
      '<p>Total for 30 days: <span class="big">' + f(tot, 1) + ' kWh</span> ≈ <span class="big">$' + f(cost, 2) + '</span> a month, about $' + f(cost * 12, 0) + ' a year.</p>' +
      '<p class="hs-small">For scale, the average U.S. home bought about ' + AVG + ' kWh a month in 2022 (EIA). Your list is ' + f(100 * tot / AVG, 0) + ' percent of that.</p>';
    mTxt.textContent = f(tot, tot < 100 ? 1 : 0);
    mCost.textContent = '$' + f(cost, 2) + ' a month at ' + f(price(), 2) + '¢/kWh';
    out.querySelectorAll('.el-k-x').forEach(function (b) {
      b.addEventListener('click', function () { list.splice(+b.dataset.k, 1); render(); var nb = out.querySelector('.el-k-x') || q('.k-add'); nb.focus(); });
    });
    rate = tot;
  }
  iA.addEventListener('change', function () { pick(+iA.value); });
  iW.addEventListener('input', sel); iH.addEventListener('input', sel);
  iP.addEventListener('input', render);
  q('.k-add').addEventListener('click', function () { list.push({ i: +iA.value, w: +iW.value, h: +iH.value }); if (list.length > 12) list.shift(); render(); });
  q('.k-clear').addEventListener('click', function () { list = []; render(); });
  iA.value = 10; pick(10);
  var rate = 0, ph = 0;
  render();
  // the meter's test light blinks faster as the monthly energy grows (decorative)
  if (!T.reduced) T.loop(msvg, function (dt) {
    ph += dt * Math.min(8, 0.4 + rate / 120);
    pulse.setAttribute('opacity', (ph % 1) < 0.18 ? 1 : 0.2);
  });
})(window, document);
