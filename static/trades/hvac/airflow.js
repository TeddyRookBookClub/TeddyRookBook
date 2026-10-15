/* HVAC course, Lesson 7: airflow through a duct system. An illustrative model, labeled as such on the page:
   every part resists flow with a pressure drop proportional to the square of its airflow (dP = R*Q^2, as for turbulent flow);
   parallel paths (four room branches and the duct leaks) share one pressure; the blower follows a simple fan curve,
   dP = P0*(1 - (Q/Qmax)^2), so it moves less air against more resistance. Calibrated so a clean, open, leak-free system moves
   its design airflow, set at 400 cfm per ton (the low end of DOE's 400-500 cfm per ton band, Energy Saver: Air-Source Heat Pumps).
   The leakage slider sets the share of air lost with all registers open; ENERGY STAR says 20 to 30 percent is typical. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-airflow');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  root.innerHTML = '';
  root.classList.add('hv-stack');
  var stage = T.h('div', { class: 'tr-w-stage' }); root.appendChild(stage);
  var cols = T.h('div', { class: 'hv-cols' }); root.appendChild(cols);
  var side = T.h('div'); cols.appendChild(side);
  var side2 = T.h('div'); cols.appendChild(side2);
  // ---------- model ----------
  var P0 = 1, QMAX = 1.6, RF = 0.08, RC = 0.14, RR = 0.09, RT = 0.10, RB = 3.18, CLOSED = 60;
  var FILT = { clean: 1, dirty: 4, clogged: 10 };
  function solve(o) {
    var g = o.open.map(function (op) { return 1 / Math.sqrt(op ? RB : RB * CLOSED); });
    var g0 = 4 / Math.sqrt(RB), gL = o.leak >= 0.999 ? 1e6 : o.leak / (1 - o.leak) * g0;
    var gsum = g.reduce(function (a, b) { return a + b; }, 0) + gL;
    var Rpar = 1 / (gsum * gsum), Rs = RF * FILT[o.filter] + RC + RR + RT, Rtot = Rs + Rpar;
    var Q = Math.sqrt(P0 / (Rtot + P0 / (QMAX * QMAX))), dP = Rtot * Q * Q, dPpar = Rpar * Q * Q;
    var branch = g.map(function (gi) { return gi * Math.sqrt(dPpar); }), leakQ = gL * Math.sqrt(dPpar);
    return { Q: Q, dP: dP, branch: branch, leak: leakQ };
  }
  W.HVACair = solve;
  var base = solve({ open: [1, 1, 1, 1], leak: 0, filter: 'clean' });

  // ---------- drawing ----------
  var svg = S('svg', { viewBox: '0 0 520 300', role: 'img', class: 'hv-af', 'aria-label': 'A forced-air duct system: blower and filter, cooling coil, supply trunk with four branches to room registers, duct leaks, and a return duct back to the filter' }, stage);
  svg.innerHTML = '<defs><marker id="af-a" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="af-ah"/></marker></defs>';
  var zone = S('rect', { class: 'af-zone', x: 120, y: 48, width: 392, height: 46, rx: 6 }, svg);
  var zoneT = S('text', { class: 'hv-ts af-zonet', x: 506, y: 88, 'text-anchor': 'end' }, svg);
  // rooms
  var ROOMX = [170, 270, 370, 470], regs = [], roomFill = [];
  ROOMX.forEach(function (x, i) {
    roomFill.push(S('rect', { class: 'af-room', x: x - 44, y: 4, width: 88, height: 26, rx: 5 }, svg));
    var t = S('text', { class: 'hv-ts', x: x, y: 21, 'text-anchor': 'middle' }, svg); t.textContent = 'room ' + (i + 1);
  });
  // ducts
  S('path', { class: 'af-duct', d: 'M70,150 V70 H480' }, svg);
  ROOMX.forEach(function (x) { S('path', { class: 'af-branch', d: 'M' + x + ',70 V36' }, svg); });
  S('path', { class: 'af-ret', d: 'M500,170 V276 H14 V214' }, svg);
  S('rect', { class: 'af-grille', x: 486, y: 150, width: 28, height: 22, rx: 3 }, svg);
  S('text', { class: 'hv-ts', x: 500, y: 192, 'text-anchor': 'middle' }, svg).textContent = 'return';
  S('text', { class: 'hv-ts', x: 260, y: 292, 'text-anchor': 'middle' }, svg).textContent = 'return duct: room air back to the blower';
  // registers (clickable)
  ROOMX.forEach(function (x, i) {
    var g = S('g', { class: 'af-reg', tabindex: 0, role: 'button', 'aria-label': 'Register in room ' + (i + 1) + ': open or close it', 'data-i': i }, svg);
    S('rect', { class: 'af-regb', x: x - 18, y: 30, width: 36, height: 9, rx: 2 }, g);
    S('path', { class: 'af-louver', d: 'M' + (x - 12) + ',34.5 H' + (x + 12) }, g);
    S('rect', { class: 'af-hit', x: x - 26, y: 24, width: 52, height: 22 }, g);
    regs.push(g);
  });
  // blower cabinet, coil, filter, gauge
  S('rect', { class: 'af-cab', x: 30, y: 150, width: 80, height: 104, rx: 6 }, svg);
  S('rect', { class: 'af-coil', x: 36, y: 154, width: 68, height: 26, rx: 3 }, svg);
  S('path', { class: 'af-acoil', d: 'M44,177 L70,158 L96,177' }, svg);
  S('text', { class: 'hv-ts', x: 118, y: 168 }, svg).textContent = 'coil';
  var fan = S('g', null, svg);
  S('circle', { class: 'af-fanr', cx: 70, cy: 218, r: 26 }, svg);
  for (var b = 0; b < 8; b++) S('path', { class: 'af-blade', d: 'M70,196 q7,5 5,12', transform: 'rotate(' + (b * 45) + ' 70 218)' }, fan);
  S('circle', { class: 'af-hub', cx: 70, cy: 218, r: 7 }, svg);
  S('text', { class: 'hv-ts', x: 70, y: 268, 'text-anchor': 'middle' }, svg).textContent = 'blower';
  var filt = S('rect', { class: 'af-filt', x: 8, y: 192, width: 14, height: 52, rx: 2 }, svg);
  S('text', { class: 'hv-ts', x: 15, y: 186, 'text-anchor': 'middle' }, svg).textContent = 'filter';
  S('circle', { class: 'af-gauge', cx: 160, cy: 214, r: 26 }, svg);
  S('path', { class: 'af-gscale', d: 'M141.6,232.4 A26,26 0 1 1 178.4,232.4' }, svg);
  var needle = S('path', { class: 'af-needle', d: 'M160,214 L160,194' }, svg);
  S('circle', { class: 'af-ghub', cx: 160, cy: 214, r: 3 }, svg);
  S('text', { class: 'hv-ts', x: 160, y: 254, 'text-anchor': 'middle' }, svg).textContent = 'static pressure';
  S('path', { class: 'af-tube', d: 'M134,214 H110' }, svg);
  // particles
  var partG = S('g', null, svg), parts = [];
  var PATHS = ROOMX.map(function (x) { return [[70, 150], [70, 70], [x, 70], [x, 36], [x, 8]]; });
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function at(p, d) { for (var i = 1; i < p.length; i++) { var L = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (d <= L || i === p.length - 1) { var f = L ? Math.min(1, d / L) : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f]; } d -= L; } return p[p.length - 1]; }
  var LENS = PATHS.map(plen);
  for (var i = 0; i < 40; i++) parts.push({ el: S('circle', { class: 'af-p', r: 2.6 }, partG), lane: i % 4, t: Math.random() });
  var leaks = [];
  [130, 205, 300, 330, 410, 445].forEach(function (x, k) { leaks.push({ el: S('path', { class: 'af-leak', d: 'M' + x + ',64 q5,-8 0,-16' }, svg), x: x, t: k / 6 }); });
  var retParts = [];
  for (var r = 0; r < 12; r++) retParts.push({ el: S('circle', { class: 'af-pr', r: 2.2 }, partG), t: r / 12 });
  var RET = [[500, 172], [500, 276], [14, 276], [14, 214]], RETL = plen(RET);

  // ---------- side ----------
  side.innerHTML =
    '<div class="hv-head"><h3>Airflow and ducts</h3><span>an illustrative model</span></div>' +
    '<div class="tr-field"><span>Filter</span><div class="tr-seg af-filter" role="group" aria-label="Filter"><button type="button" data-v="clean">Clean</button><button type="button" data-v="dirty">Dirty</button><button type="button" data-v="clogged">Clogged</button></div></div>' +
    '<label class="tr-field">Duct leakage, with every register open: <span class="v af-v1"></span><input type="range" class="af-leakr" min="0" max="40" step="1" value="25" aria-label="Duct leakage percent"></label>' +
    '<div class="tr-field"><span>The ducts run</span><div class="tr-seg af-where" role="group" aria-label="Where the ducts run"><button type="button" data-v="attic">In the attic or crawlspace</button><button type="button" data-v="inside">Inside the living space</button></div></div>' +
    '<div class="tr-field"><span>Registers (tap one in the drawing, too)</span><div class="tr-seg af-regs" role="group" aria-label="Registers">' + [0, 1, 2, 3].map(function (i) { return '<button type="button" data-i="' + i + '">Room ' + (i + 1) + '</button>'; }).join('') + '</div></div>' +
    '<label class="tr-field">System size: <select class="af-tons" aria-label="System size in tons">' + [1.5, 2, 2.5, 3, 3.5, 4, 5].map(function (t) { return '<option value="' + t + '"' + (t === 3 ? ' selected' : '') + '>' + t + ' tons</option>'; }).join('') + '</select></label>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost af-reset">↺ Clean, sealed and open</button></div>';
  side2.innerHTML = '<div class="tr-out af-out" aria-live="polite"></div><div class="af-bars" aria-hidden="true"></div>';
  var q = function (s) { return side.querySelector(s) || side2.querySelector(s); };
  var st = { filter: 'clean', leak: 0.25, where: 'attic', open: [1, 1, 1, 1], tons: 3 };
  var bars = q('.af-bars');
  bars.innerHTML = [0, 1, 2, 3].map(function (i) { return '<div class="af-bar"><span>Room ' + (i + 1) + '</span><div><b></b></div><em></em></div>'; }).join('') + '<div class="af-bar af-barl"><span>Lost</span><div><b></b></div><em></em></div>';
  var res = null;
  function cfm(x) { return T.fmt(x * 400 * st.tons, 0); }
  function update() {
    res = solve({ open: st.open, leak: st.leak, filter: st.filter });
    var design = 400 * st.tons, Qc = res.Q * design, perTon = Qc / st.tons;
    var rooms = res.branch.reduce(function (a, b) { return a + b; }, 0), lostShare = res.leak / res.Q;
    q('.af-v1').textContent = Math.round(st.leak * 100) + '%' + (st.leak >= 0.2 && st.leak <= 0.3 ? ' (typical, says ENERGY STAR)' : '');
    q('.af-filter').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.filter ? 'true' : 'false'); });
    q('.af-where').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.where ? 'true' : 'false'); });
    q('.af-regs').querySelectorAll('button').forEach(function (b) { var o = st.open[+b.dataset.i]; b.setAttribute('aria-pressed', o ? 'true' : 'false'); b.textContent = 'Room ' + (+b.dataset.i + 1) + (o ? ' open' : ' closed'); });
    var html = '<p>The blower moves <span class="big">' + T.fmt(Qc, 0) + ' cfm</span> (' + Math.round(res.Q * 100) + '% of the design ' + T.fmt(design, 0) + ' cfm).</p>';
    html += '<p>Through the coil: <b>' + T.fmt(perTon, 0) + ' cfm per ton</b>' + (perTon < 400 ? ' <span class="hv-warn">below DOE’s 400 to 500</span>' : perTon > 500 ? ' <span class="hv-warn">above DOE’s 400 to 500</span>' : ' <span class="hv-ok">within DOE’s 400 to 500 band</span>') + '.</p>';
    html += '<p>Reaching the rooms: <b>' + T.fmt(rooms * design, 0) + ' cfm</b>. Leaking out of the ducts: <b>' + T.fmt(res.leak * design, 0) + ' cfm</b> (' + Math.round(lostShare * 100) + '% of the blower’s air)' +
      (st.where === 'attic' ? ', <span class="hv-warn">lost outside the living space</span>.' : ', but it stays inside the house, so much less is wasted.') + '</p>';
    html += '<p class="hs-small">Static pressure: ' + (res.dP / base.dP).toFixed(2) + '× the clean, open system’s. ' +
      (st.filter !== 'clean' ? 'The dirty filter adds resistance, so the blower moves less air. ' : '') +
      (st.open.indexOf(0) >= 0 ? 'Closing registers doesn’t send that air elsewhere for free: pressure rises, total airflow drops, and more pushes out through the leaks. ' : '') + '</p>';
    q('.af-out').innerHTML = html;
    var mx = Math.max.apply(null, res.branch.concat([res.leak, base.branch[0] * 1.15]));
    var rowsB = bars.querySelectorAll('.af-bar');
    res.branch.concat([res.leak]).forEach(function (v, k) {
      rowsB[k].querySelector('b').style.width = (100 * v / mx).toFixed(1) + '%';
      rowsB[k].querySelector('em').textContent = T.fmt(v * design, 0) + ' cfm';
    });
    rowsB[4].querySelector('span').textContent = st.where === 'attic' ? 'Leaks (lost)' : 'Leaks (indoors)';
    // drawing state
    filt.setAttribute('class', 'af-filt af-f-' + st.filter);
    zone.setAttribute('class', 'af-zone ' + (st.where === 'attic' ? 'af-attic' : 'af-inside'));
    zoneT.textContent = st.where === 'attic' ? 'ducts in the attic: leaks are lost' : 'ducts inside: leaks stay in the house';
    regs.forEach(function (g, k) { g.classList.toggle('af-closed', !st.open[k]); });
    roomFill.forEach(function (rf, k) { rf.style.opacity = (0.25 + 0.75 * Math.min(1, res.branch[k] / base.branch[0])).toFixed(2); });
    var ang = Math.max(-120, Math.min(120, -120 + 120 * (res.dP / base.dP)));
    needle.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' 160 214)');
  }
  var spin = 0;
  T.loop(root, function (dt) {
    if (!res) return;
    var mv = T.reduced ? 0 : dt;
    spin = (spin + mv * 700 * res.Q) % 360; fan.setAttribute('transform', 'rotate(' + spin.toFixed(1) + ' 70 218)');
    parts.forEach(function (p) {
      var share = res.branch[p.lane] / (base.branch[0]);
      p.t = (p.t + mv * 0.35 * Math.max(0.05, share)) % 1;
      var pos = at(PATHS[p.lane], p.t * LENS[p.lane]);
      p.el.setAttribute('cx', pos[0].toFixed(1)); p.el.setAttribute('cy', pos[1].toFixed(1));
      p.el.setAttribute('opacity', share < 0.15 ? 0.15 : 0.85);
    });
    retParts.forEach(function (p) { p.t = (p.t + mv * 0.18 * res.Q) % 1; var pos = at(RET, p.t * RETL); p.el.setAttribute('cx', pos[0].toFixed(1)); p.el.setAttribute('cy', pos[1].toFixed(1)); });
    leaks.forEach(function (l, k) {
      l.t = (l.t + mv * 0.9) % 1;
      var vis = Math.min(1, res.leak / 0.12) * (k < Math.round(6 * Math.min(1, st.leak / 0.3)) ? 1 : 0);
      l.el.setAttribute('opacity', (vis * (T.reduced ? 0.8 : 1 - l.t)).toFixed(2));
      l.el.setAttribute('transform', 'translate(0 ' + (T.reduced ? 0 : -12 * l.t).toFixed(1) + ')');
    });
  });
  function toggleReg(i) { st.open[i] = st.open[i] ? 0 : 1; update(); }
  regs.forEach(function (g, i) {
    g.addEventListener('click', function () { toggleReg(i); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleReg(i); } });
  });
  q('.af-regs').querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { toggleReg(+b.dataset.i); }); });
  q('.af-filter').querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { st.filter = b.dataset.v; update(); }); });
  q('.af-where').querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { st.where = b.dataset.v; update(); }); });
  q('.af-leakr').addEventListener('input', function (e) { st.leak = +e.target.value / 100; update(); });
  q('.af-tons').addEventListener('change', function (e) { st.tons = +e.target.value; update(); });
  q('.af-reset').addEventListener('click', function () { st.filter = 'clean'; st.leak = 0; st.open = [1, 1, 1, 1]; q('.af-leakr').value = 0; update(); });
  update();
})(window, document);
