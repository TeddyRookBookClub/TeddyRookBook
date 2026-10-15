/* HVAC course, Lesson 2: dew point and humidity lab.
   Saturation vapor pressure over water from the Magnus formula with the Alduchov and Eskridge (1996) constants:
   e_s(T) = 611.2 Pa * exp(17.625 T / (T + 243.04)), T in °C. Dew point: T_d = b*g/(a - g), g = ln(RH) + aT/(b + T).
   Water per cubic meter from the ideal gas law (as in OpenStax College Physics 2e, Example 13.12): rho = e*M/(R*T),
   M = 18.015 g/mol, R = 8.314 J/(mol K). Checked against OpenStax Table 13.5 (within 0.5 percent, 0 to 40 °C).
   The chart plots vapor pressure against temperature: cooling air without adding or removing water is a horizontal move. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-dewpoint');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var A = 17.625, B = 243.04, E0 = 611.2, M = 18.015, R = 8.314462618;
  function c2f(c) { return c * 9 / 5 + 32; } function f2c(f) { return (f - 32) * 5 / 9; }
  function es(fT) { var c = f2c(fT); return E0 * Math.exp(A * c / (c + B)); }          // Pa
  function dew(fT, rh) { var c = f2c(fT), g = Math.log(rh) + A * c / (B + c); return c2f(B * g / (A - g)); }
  function tAtE(e) { var g = Math.log(e / E0); return c2f(B * g / (A - g)); }           // °F where e_s = e
  function rho(e, fT) { return e * M / (R * (f2c(fT) + 273.15)); }                        // g/m^3
  W.HVACdew = { es: es, dew: dew, rho: rho };   // exposed for testing

  root.innerHTML = '';
  root.classList.add('hv-stack');
  var stage = T.h('div', { class: 'tr-w-stage' }); root.appendChild(stage);
  var cols = T.h('div', { class: 'hv-cols' }); root.appendChild(cols);
  var side = T.h('div'); cols.appendChild(side);
  var side2 = T.h('div'); cols.appendChild(side2);
  var X0 = 58, X1 = 504, Y0 = 296, Y1 = 22, TMIN = 20, TMAX = 100, EMAX = 7000;
  function sx(f) { return X0 + (f - TMIN) / (TMAX - TMIN) * (X1 - X0); }
  function sy(e) { return Y0 - e / EMAX * (Y0 - Y1); }
  function fx(x) { return TMIN + (x - X0) / (X1 - X0) * (TMAX - TMIN); }
  function ey(y) { return (Y0 - y) / (Y0 - Y1) * EMAX; }
  var svg = S('svg', { viewBox: '0 0 520 344', class: 'hv-dp', role: 'img', 'aria-label': 'Chart of water vapor pressure against air temperature, with the saturation curve, lines of equal relative humidity, the air’s state, its dew point and a cold surface' }, stage);
  // bands and curves
  function curve(rh) { var d = ''; for (var f = TMIN; f <= TMAX + 0.01; f += 1) { var e = rh * es(f); d += (d ? ' L' : 'M') + sx(f).toFixed(1) + ',' + sy(e).toFixed(1); } return d; }
  function band(r1, r2) { var d = '', f; for (f = TMIN; f <= TMAX + 0.01; f += 1) d += (d ? ' L' : 'M') + sx(f).toFixed(1) + ',' + sy(r1 * es(f)).toFixed(1); for (f = TMAX; f >= TMIN - 0.01; f -= 1) d += ' L' + sx(f).toFixed(1) + ',' + sy(Math.min(EMAX, r2 * es(f))).toFixed(1); return d + ' Z'; }
  S('rect', { class: 'dp-plot', x: X0, y: Y1, width: X1 - X0, height: Y0 - Y1 }, svg);
  S('path', { class: 'dp-damp', d: band(0.6, 1) }, svg);
  S('path', { class: 'dp-good', d: band(0.3, 0.5) }, svg);
  var gridG = S('g', null, svg), tickG = S('g', null, svg);
  [0.3, 0.5, 0.6].forEach(function (r) { S('path', { class: 'dp-rh', d: curve(r) }, svg); });
  S('path', { class: 'dp-sat', d: curve(1) }, svg);
  // curve labels
  function lab(x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, class: cls || 'hv-ts', 'text-anchor': anchor || 'start' }, svg); t.textContent = s; return t; }
  lab(sx(84), sy(es(84)) - 6, '100% (saturated)', 'hv-tag dp-satl', 'end');
  lab(sx(99), sy(0.6 * es(99)) - 4, '60%', 'hv-ts', 'end'); lab(sx(99), sy(0.5 * es(99)) + 12, '50%', 'hv-ts', 'end'); lab(sx(99), sy(0.3 * es(99)) + 12, '30%', 'hv-ts', 'end');
  // freezing line
  S('path', { class: 'dp-freeze', d: 'M' + sx(32) + ',' + Y1 + ' V' + Y0 }, svg);
  lab(sx(32) + 4, Y1 + 12, 'freezing', 'hv-ts');
  // dynamic elements
  var surf = S('path', { class: 'dp-surf' }, svg), surfT = lab(0, 0, '', 'hv-tag dp-surfl', 'middle');
  var condZone = S('rect', { class: 'dp-cz' }, svg);
  var dline = S('path', { class: 'dp-dline' }, svg), dpt = S('circle', { class: 'dp-dpt', r: 6 }, svg), dlab = lab(0, 0, '', 'hv-tag dp-dlab', 'end');
  var trail = S('path', { class: 'dp-trail' }, svg), parcel = S('circle', { class: 'dp-parcel', r: 6, opacity: 0 }, svg);
  var pt = S('circle', { class: 'dp-pt', r: 9 }, svg), plab = lab(0, 0, '', 'hv-tag dp-plab', 'start');
  var hit = S('circle', { class: 'dp-hit', r: 24 }, svg);
  // a glass that sweats
  var glass = S('g', { class: 'dp-glass', transform: 'translate(78 38)' }, svg);
  S('path', { class: 'dp-g', d: 'M0,0 L4,40 H28 L32,0 Z' }, glass);
  S('path', { class: 'dp-gw', d: 'M2,14 L4,38 H28 L30,14 Z' }, glass);
  var drops = S('g', { class: 'dp-drops' }, glass);
  [[3, 10], [29, 18], [7, 26], [26, 31], [15, 36], [30, 6]].forEach(function (p) { S('path', { class: 'dp-drop', d: 'M' + p[0] + ',' + p[1] + ' q-2.4,4 0,5 q2.4,-1 0,-5 z' }, drops); });
  var frost = S('path', { class: 'dp-frost', d: 'M-2,-2 L34,-2 L30,42 H2 Z' }, glass);
  lab(94, 94, 'the cold surface', 'hv-ts', 'middle');

  // ---------- side ----------
  side.innerHTML =
    '<div class="hv-head"><h3>Dew point lab</h3><span>cool air until it drips</span></div>' +
    '<label class="tr-field">Air temperature: <span class="v dp-v1"></span><input type="range" class="dp-t" min="40" max="100" step="1" value="78" aria-label="Air temperature, degrees Fahrenheit"></label>' +
    '<label class="tr-field">Relative humidity: <span class="v dp-v2"></span><input type="range" class="dp-rh" min="5" max="100" step="1" value="55" aria-label="Relative humidity, percent"></label>' +
    '<label class="tr-field">Cold surface (a coil, a window, a pipe, a glass): <span class="v dp-v3"></span><input type="range" class="dp-s" min="20" max="90" step="1" value="50" aria-label="Surface temperature, degrees Fahrenheit"></label>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn pri dp-run">▶ Blow this air across the surface</button></div>' +
    '<div class="tr-w-ctrl" role="group" aria-label="Examples"><button type="button" class="hs-btn ghost dp-ex" data-ex="ice">Glass of ice water</button><button type="button" class="hs-btn ghost dp-ex" data-ex="win">Cold window</button><button type="button" class="hs-btn ghost dp-ex" data-ex="pipe">Damp basement pipe</button></div>' +
    '';
  side2.innerHTML = '<p class="hv-legend" style="margin:0 0 .4rem"><span><i style="background:rgba(46,158,91,.45)"></i>EPA’s ideal indoor range, 30 to 50% relative humidity</span><span><i style="background:rgba(210,59,46,.3)"></i>above 60%: damp enough for mold</span><span><i style="background:#2f7fc1"></i>saturated air (100%)</span></p><div class="tr-out dp-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s) || side2.querySelector(s); };
  var iT = q('.dp-t'), iRH = q('.dp-rh'), iS = q('.dp-s'), elOut = q('.dp-out'), bRun = q('.dp-run');
  function umode() { try { return W.TRBUnits ? W.TRBUnits.mode() : 'both'; } catch (e) { return 'both'; } }
  function mn(x) { return String(Math.round(x)).replace('-', '−'); }
  function tf(f) { var m = umode(), a = mn(f) + '°F', b = mn(f2c(f)) + '°C'; return m === 'us' ? a : m === 'metric' ? b : a + ' (' + b + ')'; }
  function ts(f) { return umode() === 'metric' ? mn(f2c(f)) + '°C' : mn(f) + '°F'; }
  function dgap(g) { var m = umode(), a = Math.round(g) + ' F°', b = Math.round(g * 5 / 9) + ' C°'; return m === 'us' ? a : m === 'metric' ? b : a + ' (' + b + ')'; }
  function ticks() {
    gridG.innerHTML = ''; tickG.innerHTML = '';
    var m = umode(), f, c, e;
    for (e = 0; e <= EMAX; e += 1000) {
      S('path', { class: 'dp-grid', d: 'M' + X0 + ',' + sy(e).toFixed(1) + ' H' + X1 }, gridG);
      var t = S('text', { class: 'hv-ts', x: X0 - 6, y: sy(e) + 3.5, 'text-anchor': 'end' }, tickG); t.textContent = (e / 1000).toFixed(0);
    }
    if (m !== 'metric') for (f = TMIN; f <= TMAX; f += 10) {
      S('path', { class: 'dp-grid', d: 'M' + sx(f).toFixed(1) + ',' + Y1 + ' V' + Y0 }, gridG);
      var t2 = S('text', { class: 'hv-ts', x: sx(f), y: Y0 + 14, 'text-anchor': 'middle' }, tickG); t2.textContent = f + '°F';
    }
    if (m !== 'us') for (c = -5; c <= 35; c += 5) {
      var x = sx(c2f(c)); if (m === 'metric') S('path', { class: 'dp-grid', d: 'M' + x.toFixed(1) + ',' + Y1 + ' V' + Y0 }, gridG);
      var t3 = S('text', { class: m === 'metric' ? 'hv-ts' : 'hv-ts dp-c', x: x, y: Y0 + (m === 'metric' ? 14 : 27), 'text-anchor': 'middle' }, tickG); t3.textContent = c + '°C';
    }
    var yl = S('text', { class: 'hv-ts', x: 14, y: (Y0 + Y1) / 2, 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + (Y0 + Y1) / 2 + ')' }, tickG); yl.textContent = 'water vapor pressure, kPa';
    var xl = S('text', { class: 'hv-ts', x: (X0 + X1) / 2, y: 342, 'text-anchor': 'middle' }, tickG); xl.textContent = 'air temperature';
  }
  var anim = null;
  function update() {
    var t = +iT.value, rh = +iRH.value / 100, s = +iS.value, e = rh * es(t), td = rh >= 1 ? t : dew(t, rh), rv = rho(e, t);
    q('.dp-v1').textContent = tf(t); q('.dp-v2').textContent = Math.round(rh * 100) + '%'; q('.dp-v3').textContent = tf(s);
    pt.setAttribute('cx', sx(t).toFixed(1)); pt.setAttribute('cy', sy(e).toFixed(1)); hit.setAttribute('cx', sx(t).toFixed(1)); hit.setAttribute('cy', sy(e).toFixed(1));
    plab.setAttribute('x', (sx(t) + 12).toFixed(1)); plab.setAttribute('y', (sy(e) - 10).toFixed(1)); plab.textContent = 'the air: ' + ts(t) + ', ' + Math.round(rh * 100) + '%';
    if (sx(t) > 400) { plab.setAttribute('x', (sx(t) - 12).toFixed(1)); plab.setAttribute('text-anchor', 'end'); } else plab.setAttribute('text-anchor', 'start');
    var xd = sx(Math.max(TMIN, td));
    dline.setAttribute('d', 'M' + sx(t).toFixed(1) + ',' + sy(e).toFixed(1) + ' H' + xd.toFixed(1));
    dpt.setAttribute('cx', xd.toFixed(1)); dpt.setAttribute('cy', sy(e).toFixed(1));
    dlab.setAttribute('x', (xd - 9).toFixed(1)); dlab.setAttribute('y', (sy(e) + 4).toFixed(1)); dlab.textContent = 'dew point ' + ts(td);
    var xs = sx(s);
    surf.setAttribute('d', 'M' + xs.toFixed(1) + ',' + Y1 + ' V' + Y0);
    surfT.setAttribute('x', xs.toFixed(1)); surfT.setAttribute('y', (Y1 + 40).toFixed(1)); surfT.textContent = 'surface ' + ts(s);
    var wet = s < td, frosty = wet && s < 32;
    condZone.setAttribute('x', X0); condZone.setAttribute('y', Y1); condZone.setAttribute('height', Y0 - Y1);
    condZone.setAttribute('width', Math.max(0, xd - X0).toFixed(1));
    drops.setAttribute('opacity', wet && !frosty ? 1 : 0); frost.setAttribute('opacity', frosty ? 0.85 : 0);
    var html = '<p>Dew point: <span class="big">' + tf(td) + '</span></p>';
    html += '<p>Water vapor: ' + (e / 1000).toFixed(2) + ' kPa, about <b>' + rv.toFixed(1) + ' grams per cubic meter</b> of air.</p>';
    html += rh > 0.6 ? '<p class="hv-warn">Above 60 percent: EPA says that’s damp enough to invite mold indoors.</p>'
          : rh >= 0.3 && rh <= 0.5 ? '<p class="hv-ok">In EPA’s ideal indoor range, 30 to 50 percent.</p>'
          : rh < 0.3 ? '<p>Below 30 percent: dry air.</p>' : '<p>Between 50 and 60 percent: acceptable, but EPA prefers 30 to 50.</p>';
    if (frosty) html += '<p class="hv-warn">The surface is below freezing and below the dew point: frost forms on it.</p>';
    else if (wet) html += '<p class="hv-warn">The surface is ' + dgap(td - s) + ' below the dew point: water condenses on it.</p>';
    else html += '<p class="hv-ok">The surface is ' + dgap(s - td) + ' above the dew point: it stays dry.</p>';
    elOut.innerHTML = html;
    if (!anim) { parcel.setAttribute('opacity', 0); trail.setAttribute('d', ''); }
  }
  // drag the state point on the chart
  function toSvg(ev) { var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; var m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : p; }
  var dragging = false;
  function setFrom(ev) {
    var p = toSvg(ev), f = Math.max(40, Math.min(100, fx(p.x))), e = Math.max(0, ey(p.y)), rh = Math.max(0.05, Math.min(1, e / es(f)));
    iT.value = Math.round(f); iRH.value = Math.round(rh * 100); stopAnim(); update();
  }
  // drag the point (its large hit circle blocks scrolling only while you hold it); tap anywhere else to jump there
  var moved = false;
  hit.addEventListener('pointerdown', function (ev) { dragging = true; moved = false; try { hit.setPointerCapture(ev.pointerId); } catch (e) { } ev.preventDefault(); });
  hit.addEventListener('pointermove', function (ev) { if (dragging) { moved = true; setFrom(ev); } });
  hit.addEventListener('pointerup', function () { dragging = false; });
  hit.addEventListener('pointercancel', function () { dragging = false; });
  svg.addEventListener('click', function (ev) { if (ev.target === hit) return; var p = toSvg(ev); if (p.x < X0 || p.x > X1 || p.y < Y1 || p.y > Y0) return; setFrom(ev); });
  // cool the air across the surface: left at constant vapor, then down the saturation curve, then back to room temperature
  function stopAnim() { anim = null; bRun.textContent = '▶ Blow this air across the surface'; }
  function run() {
    var t = +iT.value, rh = +iRH.value / 100, s = +iS.value, e = rh * es(t), td = rh >= 1 ? t : dew(t, rh);
    var pts = [], k, n = 40;
    for (k = 0; k <= n; k++) { var f = t + (Math.max(s, td) - t) * k / n; pts.push([f, e]); }
    if (s < td) for (k = 1; k <= n; k++) { var f2 = td + (s - td) * k / n; pts.push([f2, es(f2)]); }
    var eEnd = Math.min(e, es(s));
    for (k = 1; k <= n; k++) { pts.push([s + (t - s) * k / n, eEnd]); }
    anim = { pts: pts, i: 0, t: t, s: s, e: e, eEnd: eEnd, td: td };
    bRun.textContent = '■ Stop';
    if (T.reduced) { anim.i = pts.length - 1; finish(); }
  }
  function finish() {
    var a = anim; if (!a) return;
    var d = 'M' + a.pts.map(function (p) { return sx(p[0]).toFixed(1) + ',' + sy(p[1]).toFixed(1); }).join(' L');
    trail.setAttribute('d', d);
    var last = a.pts[a.pts.length - 1]; parcel.setAttribute('cx', sx(last[0])); parcel.setAttribute('cy', sy(last[1])); parcel.setAttribute('opacity', 1);
    var rhNew = a.eEnd / es(a.t), removed = rho(a.e, a.s) - rho(a.eEnd, a.s), html = elOut.innerHTML;
    if (a.s < a.td) html += '<p><b>Across the surface:</b> the air cools to its dew point, then keeps dropping water as it cools to ' + tf(a.s) + ': about ' + Math.max(0, removed).toFixed(1) + ' g of water from each cubic meter. Warmed back to ' + tf(a.t) + ', it’s down to <b>' + Math.round(rhNew * 100) + '%</b> relative humidity. That’s how an air conditioner coil dries the air.</p>';
    else html += '<p><b>Across the surface:</b> the air cools but never reaches its dew point, so no water condenses and its moisture doesn’t change. Make the surface colder than ' + tf(a.td) + ' to see water drop out.</p>';
    elOut.innerHTML = html;
    anim = null; bRun.textContent = '↺ Run it again';
  }
  T.loop(root, function (dt) {
    if (!anim) return;
    anim.i = Math.min(anim.pts.length - 1, anim.i + dt * 40);
    var k = Math.floor(anim.i), p = anim.pts[k];
    parcel.setAttribute('cx', sx(p[0]).toFixed(1)); parcel.setAttribute('cy', sy(p[1]).toFixed(1)); parcel.setAttribute('opacity', 1);
    trail.setAttribute('d', 'M' + anim.pts.slice(0, k + 1).map(function (q2) { return sx(q2[0]).toFixed(1) + ',' + sy(q2[1]).toFixed(1); }).join(' L'));
    if (k >= anim.pts.length - 1) finish();
  });
  bRun.addEventListener('click', function () { if (anim) { stopAnim(); update(); } else { update(); run(); } });
  side.querySelectorAll('.dp-ex').forEach(function (b) {
    b.addEventListener('click', function () {
      var ex = b.dataset.ex; stopAnim();
      if (ex === 'ice') { iT.value = 80; iRH.value = 60; iS.value = 32; }      // ice water sits at the freezing point
      if (ex === 'win') { iT.value = 70; iRH.value = 45; iS.value = 35; }      // example values only
      if (ex === 'pipe') { iT.value = 72; iRH.value = 70; iS.value = 55; }     // example values only
      update();
    });
  });
  [iT, iRH, iS].forEach(function (i) { i.addEventListener('input', function () { stopAnim(); update(); }); });
  D.addEventListener('trb-units', function () { ticks(); update(); });
  ticks(); update();
})(window, document);
