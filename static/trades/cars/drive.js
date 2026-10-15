/* Cars course, Lesson 7: gears and torque, and the differential in a turn.
   Gears: ratio = driven teeth ÷ driving teeth; output speed = input ÷ ratio; output torque ≈ input × ratio (friction ignored);
   power = torque × rpm ÷ 5,252 (hp, lb·ft) stays the same. Final drive 3.50:1 is the Navy course's average passenger-car figure.
   Differential: inner and outer wheel paths are R ∓ t/2, so wheel speeds are v·(R ∓ t/2)/R and the carrier turns at their average.
   1 lb·ft = 1.355818 N·m and 1 mph = 0.44704 m/s (NIST). */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-drive');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg, NM = 1.355818, MPH = 0.44704;
  function f(x, d) { return T.fmt(x, d); }
  root.innerHTML = '<div class="tr-seg dr-tabs" role="group" aria-label="Choose a demonstration" style="margin-bottom:.6rem"><button type="button" data-v="g" aria-pressed="true">Gears and torque</button><button type="button" data-v="d" aria-pressed="false">The differential in a turn</button></div>';
  var paneG = T.h('div', { class: 'tr-w-grid dr-g' }), paneD = T.h('div', { class: 'tr-w-grid dr-d' });
  root.appendChild(paneG); root.appendChild(paneD); paneD.hidden = true;
  root.querySelectorAll('.dr-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      root.querySelectorAll('.dr-tabs button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      paneG.hidden = b.dataset.v !== 'g'; paneD.hidden = b.dataset.v !== 'd';
    });
  });

  // ===================== gears =====================
  var gStage = T.h('div', { class: 'tr-w-stage' }), gSide = T.h('div'); paneG.appendChild(gStage); paneG.appendChild(gSide);
  var gsvg = S('svg', { viewBox: '0 0 440 250', role: 'img', 'aria-label': 'Two meshing gears, the driving gear on the left', class: 'tr-gear' }, gStage);
  var g1 = S('g', null, gsvg), g2 = S('g', null, gsvg);
  var p1 = S('path', { class: 'gr-1' }, g1), p2 = S('path', { class: 'gr-2' }, g2);
  var h1 = S('circle', { class: 'gr-hub', r: 6 }, g1), h2 = S('circle', { class: 'gr-hub', r: 6 }, g2);
  var m1 = S('path', { class: 'gr-mark' }, g1), m2 = S('path', { class: 'gr-mark' }, g2);
  var l1 = S('text', { class: 'gr-t', 'text-anchor': 'middle' }, gsvg), l2 = S('text', { class: 'gr-t', 'text-anchor': 'middle' }, gsvg);
  gSide.innerHTML =
    '<label class="tr-field">Driving gear (from the engine): <span class="v g-v1"></span><input type="range" class="g-n1" min="8" max="40" step="1" value="12" aria-label="Driving gear teeth"></label>' +
    '<label class="tr-field">Driven gear (to the wheels): <span class="v g-v2"></span><input type="range" class="g-n2" min="8" max="60" step="1" value="36" aria-label="Driven gear teeth"></label>' +
    '<label class="tr-field">Engine torque: <span class="v g-v3"></span><input type="range" class="g-tq" min="50" max="400" step="10" value="150" aria-label="Engine torque in pound-feet"></label>' +
    '<label class="tr-field">Engine speed: <span class="v g-v4"></span><input type="range" class="g-rpm" min="800" max="6000" step="100" value="2000" aria-label="Engine speed in rpm"></label>' +
    '<label class="tr-field" style="flex-direction:row;align-items:center;gap:.5rem"><input type="checkbox" class="g-fd"> Add a 3.50:1 final drive (the differential)</label>' +
    '<div class="tr-out g-out" aria-live="polite"></div>';
  var q = function (s) { return gSide.querySelector(s); };
  var N1, N2, mod, c1x, c2x, cy = 125, ang = 0;
  function gearPath(N, m) {
    var rp = m * N / 2, ro = rp + m, rr = rp - 1.25 * m, p = 2 * Math.PI / N, d = '';
    for (var i = 0; i < N; i++) {
      var a = i * p, pts = [[rr, a - 0.5 * p], [rr, a - 0.24 * p], [ro, a - 0.11 * p], [ro, a + 0.11 * p], [rr, a + 0.24 * p]];
      pts.forEach(function (q, k) { d += (i === 0 && k === 0 ? 'M' : 'L') + (q[0] * Math.cos(q[1])).toFixed(1) + ',' + (q[0] * Math.sin(q[1])).toFixed(1); });
    }
    return d + 'Z';
  }
  function buildGears() {
    N1 = +q('.g-n1').value; N2 = +q('.g-n2').value;
    mod = Math.min(4.2, 392 / (N1 + N2 + 4), 220 / (N2 + 2.5));
    var r1 = mod * N1 / 2, r2 = mod * N2 / 2, span = r1 + r2 + 2 * mod + r1 + r2;
    c1x = 220 - span / 2 + r1 + mod; c2x = c1x + r1 + r2;
    p1.setAttribute('d', gearPath(N1, mod)); p2.setAttribute('d', gearPath(N2, mod));
    m1.setAttribute('d', 'M0,0 L' + (r1 - 2 * mod).toFixed(1) + ',0'); m2.setAttribute('d', 'M0,0 L' + (r2 - 2 * mod).toFixed(1) + ',0');
    l1.setAttribute('x', c1x.toFixed(1)); l1.setAttribute('y', (cy + r1 + mod + 18).toFixed(1)); l1.textContent = N1 + ' teeth';
    l2.setAttribute('x', c2x.toFixed(1)); l2.setAttribute('y', Math.min(246, cy + r2 + mod + 18).toFixed(1)); l2.textContent = N2 + ' teeth';
    placeGears();
  }
  function placeGears() {
    var a1 = ang, a2 = -ang * N1 / N2 + Math.PI + Math.PI / N2;
    g1.setAttribute('transform', 'translate(' + c1x.toFixed(1) + ',' + cy + ') rotate(' + (a1 * 180 / Math.PI).toFixed(2) + ')');
    g2.setAttribute('transform', 'translate(' + c2x.toFixed(1) + ',' + cy + ') rotate(' + (a2 * 180 / Math.PI).toFixed(2) + ')');
  }
  function gearText() {
    var tq = +q('.g-tq').value, rpm = +q('.g-rpm').value, fd = q('.g-fd').checked, r = N2 / N1;
    q('.g-v1').textContent = N1 + ' teeth'; q('.g-v2').textContent = N2 + ' teeth';
    q('.g-v3').textContent = tq + ' lb·ft (' + f(tq * NM, 0) + ' N·m)'; q('.g-v4').textContent = f(rpm, 0) + ' rpm';
    var os = rpm / r, ot = tq * r, hp = tq * rpm / 5252;
    var h = '<p>Gear ratio: <b>' + r.toFixed(2) + ' : 1</b> (' + N2 + ' ÷ ' + N1 + ')</p>' +
      '<p>Output speed: ' + f(rpm, 0) + ' ÷ ' + r.toFixed(2) + ' = <b>' + f(os, 0) + ' rpm</b></p>' +
      '<p>Output torque: about ' + tq + ' × ' + r.toFixed(2) + ' = <span class="big">' + f(ot, 0) + ' lb·ft</span> (' + f(ot * NM, 0) + ' N·m), less a little friction</p>' +
      '<p>Power in and out: ' + tq + ' × ' + f(rpm, 0) + ' ÷ 5,252 = <b>' + f(hp, 0) + ' hp</b>. Gears trade speed for torque; they don’t add power.</p>';
    if (fd) h += '<p>Through a 3.50:1 final drive, the wheels turn at <b>' + f(os / 3.5, 0) + ' rpm</b> with about <b>' + f(ot * 3.5, 0) + ' lb·ft</b>.</p>';
    h += '<p class="hs-small">' + (r > 1 ? 'A small gear driving a big one: slower and stronger, like a low gear.' : r < 1 ? 'A big gear driving a small one: faster and weaker, like overdrive.' : 'Equal gears: same speed, same torque, opposite direction.') + '</p>';
    q('.g-out').innerHTML = h;
  }
  ['.g-n1', '.g-n2'].forEach(function (s) { q(s).addEventListener('input', function () { buildGears(); gearText(); }); });
  ['.g-tq', '.g-rpm', '.g-fd'].forEach(function (s) { q(s).addEventListener('input', gearText); });
  buildGears(); gearText();

  // ===================== differential =====================
  var dStage = T.h('div', { class: 'tr-w-stage' }), dSide = T.h('div'); paneD.appendChild(dStage); paneD.appendChild(dSide);
  var dsvg = S('svg', { viewBox: '0 0 440 300', role: 'img', 'aria-label': 'A car seen from above driving around a curve, with the inner and outer wheel paths', class: 'tr-diff' }, dStage);
  var OX = 220, OY = 270, RD = 160;
  var arcIn = S('path', { class: 'df-trk' }, dsvg), arcOut = S('path', { class: 'df-trk' }, dsvg), arcMid = S('path', { class: 'df-mid' }, dsvg);
  S('circle', { class: 'df-o', cx: OX, cy: OY, r: 4 }, dsvg);
  var tO = S('text', { class: 'gr-t', x: OX, y: OY - 12, 'text-anchor': 'middle' }, dsvg); tO.textContent = 'center of the turn';
  var car = S('g', null, dsvg);
  var body = S('rect', { class: 'df-body', rx: 8 }, car), axle = S('path', { class: 'df-axle' }, car);
  var wIn = S('g', null, car), wOut = S('g', null, car), wFr1 = S('rect', { class: 'df-tire0', rx: 3 }, car), wFr2 = S('rect', { class: 'df-tire0', rx: 3 }, car);
  var tireIn = S('rect', { class: 'df-tire', rx: 3 }, wIn), tireOut = S('rect', { class: 'df-tire', rx: 3 }, wOut);
  var stripIn = S('path', { class: 'df-strip' }, wIn), stripOut = S('path', { class: 'df-strip' }, wOut);
  var diffc = S('circle', { class: 'df-diff', r: 7 }, car);
  var bars = S('g', null, dsvg);
  dSide.innerHTML =
    '<label class="tr-field">Turn radius (to the middle of the axle): <span class="v d-v1"></span><input type="range" class="d-r" min="4" max="50" step="0.5" value="8" aria-label="Turn radius in meters"></label>' +
    '<label class="tr-field">Track width (wheel to wheel): <span class="v d-v2"></span><input type="range" class="d-t" min="1.2" max="2" step="0.05" value="1.6" aria-label="Track width in meters"></label>' +
    '<label class="tr-field">Car speed: <span class="v d-v3"></span><input type="range" class="d-s" min="5" max="40" step="1" value="15" aria-label="Car speed in miles per hour"></label>' +
    '<label class="tr-field" style="flex-direction:row;align-items:center;gap:.5rem"><input type="checkbox" class="d-ice"> Inner wheel on ice (open differential)</label>' +
    '<div class="tr-out d-out" aria-live="polite"></div>';
  var qd = function (s) { return dSide.querySelector(s); };
  var DT = 0.65; // example tire diameter, m
  var pos = -Math.PI * 0.9, spin = { i: 0, o: 0 };
  function dvals() {
    var R = +qd('.d-r').value, t = +qd('.d-t').value, v = +qd('.d-s').value, ice = qd('.d-ice').checked;
    var fi = (R - t / 2) / R, fo = (R + t / 2) / R;
    if (ice) { fi = 2; fo = 0; }
    return { R: R, t: t, v: v, ice: ice, fi: fi, fo: fo, fc: (fi + fo) / 2 };
  }
  function dtext() {
    var d = dvals(), vm = d.v * MPH, rpm = vm / (Math.PI * DT) * 60;
    qd('.d-v1').textContent = d.R.toFixed(1) + ' m (' + f(d.R / 0.3048, 0) + ' ft)';
    qd('.d-v2').textContent = d.t.toFixed(2) + ' m';
    qd('.d-v3').textContent = d.v + ' mph';
    var h;
    if (d.ice) {
      h = '<p class="warn">Stuck! With an open differential, the wheel on ice gets the torque and spins while the other stands still.</p>' +
        '<p>The carrier still turns at the average of the two wheels: (200% + 0%) ÷ 2 = 100%. A limited-slip differential sends more torque to the wheel with grip.</p>';
    } else {
      h = '<p>Outer wheel: <b>' + f(d.fo * 100, 1) + '%</b> of the carrier’s speed, ' + f(d.v * d.fo, 1) + ' mph</p>' +
        '<p>Inner wheel: <b>' + f(d.fi * 100, 1) + '%</b>, ' + f(d.v * d.fi, 1) + ' mph</p>' +
        '<p>Carrier (ring gear): the average, <b>100%</b></p>' +
        '<p>In one full circle the outer wheel rolls <b>' + f(2 * Math.PI * (d.R + d.t / 2), 1) + ' m</b> and the inner wheel <b>' + f(2 * Math.PI * (d.R - d.t / 2), 1) + ' m</b>: ' + f(2 * Math.PI * d.t, 1) + ' m farther.</p>' +
        '<p class="hs-small">With tires about 0.65 m (25.6 in) across (an example size), the carrier turns ' + f(rpm, 0) + ' rpm, the outer wheel ' + f(rpm * d.fo, 0) + ' and the inner wheel ' + f(rpm * d.fi, 0) + '.</p>';
    }
    qd('.d-out').innerHTML = h;
  }
  function arcD(r) { return 'M' + (OX - r) + ',' + OY + ' A' + r + ',' + r + ' 0 0 1 ' + (OX + r) + ',' + OY; }
  function ddraw(dt) {
    var d = dvals(), w = Math.max(18, Math.min(110, RD * d.t / d.R));
    arcIn.setAttribute('d', arcD(RD - w / 2)); arcOut.setAttribute('d', arcD(RD + w / 2)); arcMid.setAttribute('d', arcD(RD));
    var spd = d.ice ? 0 : 0.18 * d.v / 15;
    if (!T.reduced) { pos += dt * spd; if (pos > -0.1) pos = -Math.PI + 0.1; }
    var cx = OX + RD * Math.cos(pos), cyy = OY + RD * Math.sin(pos), heading = pos * 180 / Math.PI + 90;
    car.setAttribute('transform', 'translate(' + cx.toFixed(1) + ',' + cyy.toFixed(1) + ') rotate(' + heading.toFixed(1) + ')');
    // car frame: x = forward, +y = toward the center of the turn
    var L = 64, W = w + 18;
    body.setAttribute('x', -L / 2); body.setAttribute('y', -W / 2); body.setAttribute('width', L); body.setAttribute('height', W);
    axle.setAttribute('d', 'M' + (-L / 2 + 12) + ',' + (-w / 2) + ' V' + (w / 2));
    diffc.setAttribute('cx', -L / 2 + 12); diffc.setAttribute('cy', 0);
    [[tireIn, wIn, w / 2], [tireOut, wOut, -w / 2]].forEach(function (a) {
      a[0].setAttribute('x', -10); a[0].setAttribute('y', -5); a[0].setAttribute('width', 20); a[0].setAttribute('height', 10);
      a[1].setAttribute('transform', 'translate(' + (-L / 2 + 12) + ',' + a[2].toFixed(1) + ')');
    });
    [[wFr1, -w / 2], [wFr2, w / 2]].forEach(function (a) { a[0].setAttribute('x', L / 2 - 22); a[0].setAttribute('y', a[1] - 5); a[0].setAttribute('width', 20); a[0].setAttribute('height', 10); });
    // spinning tread stripes show each rear wheel's speed
    var base = (d.ice ? 0.9 : spd) * 260;
    if (!T.reduced) { spin.i = (spin.i + dt * base * d.fi) % 20; spin.o = (spin.o + dt * base * d.fo) % 20; }
    stripIn.setAttribute('d', 'M' + (-10 + spin.i % 20 - 10) + ',-5 v10 M' + (spin.i % 20) + ',-5 v10');
    stripOut.setAttribute('d', 'M' + (-10 + spin.o % 20 - 10) + ',-5 v10 M' + (spin.o % 20) + ',-5 v10');
    // bars
    bars.innerHTML = '';
    [['inner', d.fi], ['carrier', d.fc], ['outer', d.fo]].forEach(function (b, k) {
      var y = 14 + k * 18, len = Math.max(0, Math.min(2, b[1])) * 70;
      S('text', { class: 'gr-t', x: 8, y: y + 9 }, bars).textContent = b[0];
      S('rect', { class: k === 1 ? 'df-barc' : 'df-bar', x: 62, y: y, width: len.toFixed(1), height: 11, rx: 3 }, bars);
      S('text', { class: 'gr-t', x: 66 + len, y: y + 9 }, bars).textContent = f(b[1] * 100, 0) + '%';
    });
  }
  ['.d-r', '.d-t', '.d-s', '.d-ice'].forEach(function (s) { qd(s).addEventListener('input', function () { dtext(); ddraw(0); }); });
  dtext(); ddraw(0);

  // one animation loop for both panes
  T.loop(root, function (dt) {
    if (!paneG.hidden && !T.reduced) {
      var rpm = +q('.g-rpm').value;
      ang += dt * 2 * Math.PI * 0.3 * (rpm / 2000);
      placeGears();
    }
    if (!paneD.hidden) ddraw(dt);
  });
})(window, document);
