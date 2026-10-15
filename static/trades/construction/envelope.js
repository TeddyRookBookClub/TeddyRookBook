/* Construction course, Lesson 6: one wall, four jobs. A wall section (outside on the left, the room on the right) that
   shows how the envelope controls water, air, vapor and heat.
   - Water: siding sheds most rain; what gets behind it runs down the weather-resistive barrier and out the bottom
     (DOE Building Science Education Solution Center, drainage plane). Remove the barrier and the sheathing gets wet.
   - Air: the air barrier stops wind-driven air; a gap lets it through (DOE air sealing guide).
   - Vapor and heat: steady conduction through layers in series, q = ΔT ÷ R (OpenStax College Physics 2e, 14.5).
     Batts 3.5 in thick are R-11 (OpenStax). Wood k = 0.12 W/m·K, the middle of OpenStax's 0.08–0.16 range, gives about
     R-1.2 per inch for sheathing, siding and studs. Foam sheathing of R-5 or R-10 is the range ENERGY STAR recommends when
     re-siding in zones 4–8. Drywall, paint and air films are left out. Dew point from OpenStax Table 13.5 (saturation vapor
     density), interpolated. Studs are 1½ in wide every 16 in; heat through studs and cavities is added as parallel paths. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-envelope');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var SAT = [[-20, 0.89], [-10, 2.36], [0, 4.84], [5, 6.80], [10, 9.40], [15, 12.8], [20, 17.2], [25, 23.0], [30, 30.4], [37, 44.0], [40, 51.1]];
  function sat(c) { // g/m³ at c °C, log-linear between table rows
    if (c <= SAT[0][0]) return SAT[0][1];
    for (var i = 1; i < SAT.length; i++) if (c <= SAT[i][0]) { var a = SAT[i - 1], b = SAT[i], f = (c - a[0]) / (b[0] - a[0]); return Math.exp(Math.log(a[1]) + f * (Math.log(b[1]) - Math.log(a[1]))); }
    return SAT[SAT.length - 1][1];
  }
  function dew(c, rh) { var v = sat(c) * rh, lo = -20, hi = c; for (var k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (sat(m) > v) hi = m; else lo = m; } return (lo + hi) / 2; }
  var F2C = function (f) { return (f - 32) * 5 / 9; }, C2F = function (c) { return c * 9 / 5 + 32; };
  var RW = 0.0254 / 0.12 * 5.678; // R per inch of wood (US units)
  var st = { tab: 'water', wrb: true, gap: false, vr: true, leak: false, foam: 0, studs: true, tin: 70, tout: 20, rh: 40, wet: 0, cond: 0 };
  root.innerHTML = '';
  root.classList.add('cn-ev');
  var tabs = T.h('div', { class: 'tr-seg cn-ev-tabs', role: 'group', 'aria-label': 'What the wall controls' },
    '<button type="button" data-t="water" aria-pressed="true">💧 Water</button><button type="button" data-t="air" aria-pressed="false">💨 Air</button><button type="button" data-t="vapor" aria-pressed="false">☁️ Vapor</button><button type="button" data-t="heat" aria-pressed="false">🔥 Heat</button>');
  root.appendChild(tabs);
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 450 330', role: 'img', 'aria-label': 'A wall section: siding, weather-resistive barrier, sheathing, insulated stud cavity, vapor retarder and drywall, with the outdoors on the left and the room on the right' }, stage);
  // ---------- the wall ----------
  var X = { sid0: 132, sid1: 148, wrb: 151, sh0: 152, sh1: 162, ins1: 262, vr: 263, dw1: 274 };
  S('rect', { class: 'cn-ev-out', x: 0, y: 0, width: X.sid0, height: 300 }, svg);
  S('rect', { class: 'cn-ev-in', x: X.dw1, y: 0, width: 450 - X.dw1, height: 300 }, svg);
  S('path', { class: 'cn-ev-ground', d: 'M0,300 H' + X.sh1 + ' M' + X.dw1 + ',300 H450' }, svg);
  var foamR = S('rect', { class: 'cn-ev-foam', y: 18, height: 270 }, svg);
  var sheath = S('rect', { class: 'cn-ev-sheath', x: X.sh0, y: 18, width: X.sh1 - X.sh0, height: 270 }, svg);
  var wetR = S('rect', { class: 'cn-ev-wet', x: X.sh0, y: 18, width: X.sh1 - X.sh0, height: 270, opacity: 0 }, svg);
  S('rect', { class: 'cn-ev-ins', x: X.sh1, y: 32, width: X.ins1 - X.sh1, height: 242 }, svg);
  var insTex = ''; for (var y = 40; y < 270; y += 14) insTex += 'M' + (X.sh1 + 4) + ',' + y + ' q12,-7 24,0 t24,0 t24,0 t24,0';
  S('path', { class: 'cn-ev-instex', d: insTex }, svg);
  S('rect', { class: 'cn-ev-plate', x: X.sh1, y: 18, width: X.ins1 - X.sh1, height: 14 }, svg);
  S('rect', { class: 'cn-ev-plate', x: X.sh1, y: 274, width: X.ins1 - X.sh1, height: 14 }, svg);
  var vrL = S('path', { class: 'cn-ev-vr', d: 'M' + X.vr + ',32 V274' }, svg);
  S('rect', { class: 'cn-ev-dw', x: X.ins1 + 2, y: 18, width: X.dw1 - X.ins1 - 2, height: 270 }, svg);
  var wrbL = S('path', { class: 'cn-ev-wrb', d: 'M' + X.wrb + ',14 V292' }, svg);
  var sd = 'M' + X.sid0 + ',10'; for (var yy = 10; yy < 290; yy += 20) sd += ' L' + (X.sid1 - 2) + ',' + yy + ' L' + X.sid0 + ',' + (yy + 20) + ' L' + X.sid1 + ',' + (yy + 20);
  S('path', { class: 'cn-ev-siding', d: sd + ' L' + X.sid1 + ',10 Z' }, svg);
  var gapG = S('g', { class: 'cn-ev-gapg' }, svg);
  S('rect', { class: 'cn-ev-hole', x: X.wrb - 2, y: 142, width: X.sh1 - X.wrb + 4, height: 12 }, gapG);
  S('rect', { class: 'cn-ev-hole', x: X.ins1, y: 146, width: X.dw1 - X.ins1 + 2, height: 10 }, gapG);
  S('rect', { class: 'cn-ev-box', x: X.dw1 - 2, y: 138, width: 8, height: 26, rx: 1 }, gapG);
  // temperature profile (vapor and heat tabs)
  var prof = S('path', { class: 'cn-ev-prof' }, svg), dewL = S('path', { class: 'cn-ev-dew' }, svg), condZ = S('rect', { class: 'cn-ev-condz', y: 18, height: 270 }, svg);
  var tTin = S('text', { class: 'tx-sm tx-b cn-ev-hot', 'text-anchor': 'end' }, svg), tTout = S('text', { class: 'tx-sm tx-b cn-ev-cold' }, svg), tDew = S('text', { class: 'tx-sm cn-ev-dewt', 'text-anchor': 'end' }, svg);
  var tSh = S('text', { class: 'tx-sm tx-b tx-ink', 'text-anchor': 'middle' }, svg);
  // labels
  var lab = function (x, y, t, a, c) { var e = S('text', { class: 'tx-sm ' + (c || ''), x: x, y: y, 'text-anchor': a || 'middle' }, svg); e.textContent = t; return e; };
  lab(66, 322, 'OUTSIDE', 'middle', 'tx-b'); lab(362, 322, 'INSIDE', 'middle', 'tx-b');
  var labs = S('g', { class: 'cn-ev-labs' }, svg);
  function lead(t, ly, x2, side_) {
    var x1 = side_ ? 284 : 126, gg = S('g', null, labs), e = S('text', { class: 'tx-sm tx-ink', x: side_ ? x1 + 3 : x1 - 3, y: ly + 4, 'text-anchor': side_ ? 'start' : 'end' }, gg); e.textContent = t;
    S('path', { class: 'cn-ev-lead', d: 'M' + x1 + ',' + ly + ' H' + x2 }, gg); return gg;
  }
  lead('siding', 52, 140); lead('weather barrier', 70, X.wrb); lead('sheathing', 88, X.sh0 + 5);
  var foamLab = lead('foam', 106, X.sh0 - 4);
  var vrLab = lead('vapor retarder', 52, X.vr, 1); lead('drywall', 70, X.dw1 - 5, 1);
  var insLab = S('text', { class: 'tx-sm tx-b tx-ink', x: (X.sh1 + X.ins1) / 2, y: 48, 'text-anchor': 'middle' }, labs); insLab.textContent = 'insulation';
  // particles
  var pg = S('g', null, svg), pool = [], P = [];
  for (var i = 0; i < 90; i++) pool.push(S('circle', { r: 0, class: 'cn-ev-pt' }, pg));
  var arrowsG = S('g', null, svg);
  var keyL = T.h('div', { class: 'cn-ev-key' }); stage.appendChild(keyL);

  side.innerHTML = '<h3 class="ev-h"></h3><p class="ev-p"></p><div class="ev-ctrl"></div><div class="tr-out ev-res" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  var TAB = {
    water: ['Water: drain what gets past the siding', 'Siding sheds most of the rain, but wind can drive some behind it. The weather-resistive barrier is the drainage plane: water runs down its face and out the bottom. Each layer laps over the one below, like shingles.',
      '<div class="tr-seg" role="group" aria-label="Weather-resistive barrier"><button type="button" class="ev-t" data-k="wrb" aria-pressed="true">Barrier in place</button></div>'],
    air: ['Air: stop the drafts', 'Wind pushes outside air into the wall, and in winter warm indoor air rises and leaks out up high. A continuous air barrier (here the taped sheathing and wrap) stops it. Gaps around outlets, pipes and wires are where air sneaks through.',
      '<div class="tr-seg" role="group" aria-label="Air barrier"><button type="button" class="ev-t" data-k="gap" aria-pressed="false">Leave a gap at the outlet</button></div>'],
    vapor: ['Vapor: keep moisture from finding a cold surface', 'Warm indoor air holds water vapor. If it reaches a layer colder than its dew point, the vapor condenses into liquid water. In cold climates a vapor retarder goes on the warm side; an air leak carries moisture right past it.',
      '<div class="tr-seg" role="group" aria-label="Vapor controls"><button type="button" class="ev-t" data-k="vr" aria-pressed="true">Vapor retarder</button><button type="button" class="ev-t" data-k="leak" aria-pressed="false">Air leak</button></div>' +
      '<div class="tr-field">Foam sheathing outside<div class="tr-seg ev-foam" role="group" aria-label="Foam sheathing"><button type="button" data-v="0" aria-pressed="true">None</button><button type="button" data-v="5" aria-pressed="false">R-5</button><button type="button" data-v="10" aria-pressed="false">R-10</button></div></div>' +
      '<label class="tr-field">Outdoor temperature: <span class="v ev-v1"></span><input type="range" class="ev-tout" min="-10" max="60" step="1" value="20" aria-label="Outdoor temperature, degrees Fahrenheit"></label>' +
      '<label class="tr-field">Indoor humidity: <span class="v ev-v3"></span><input type="range" class="ev-rh" min="20" max="70" step="5" value="40" aria-label="Indoor relative humidity in percent"></label>'],
    heat: ['Heat: slow it down with R-value', 'Heat flows from warm to cold. Each layer resists it, and R-values in a row add up. Studs are wood, which conducts heat several times better than glass wool, so every stud is a small thermal bridge.',
      '<div class="tr-field">Foam sheathing outside<div class="tr-seg ev-foam" role="group" aria-label="Foam sheathing"><button type="button" data-v="0" aria-pressed="true">None</button><button type="button" data-v="5" aria-pressed="false">R-5</button><button type="button" data-v="10" aria-pressed="false">R-10</button></div></div>' +
      '<div class="tr-seg" role="group" aria-label="Studs"><button type="button" class="ev-t" data-k="studs" aria-pressed="true">Count the studs</button></div>' +
      '<label class="tr-field">Outdoor temperature: <span class="v ev-v1"></span><input type="range" class="ev-tout" min="-10" max="60" step="1" value="20" aria-label="Outdoor temperature, degrees Fahrenheit"></label>' +
      '<label class="tr-field">Indoor temperature: <span class="v ev-v2"></span><input type="range" class="ev-in" min="60" max="78" step="1" value="70" aria-label="Indoor temperature, degrees Fahrenheit"></label>']
  };
  function wall() {
    var Rs = 0.5 * RW, Rsid = 0.5 * RW, Rins = 11, Rf = st.foam;
    var cav = Rins + Rs + Rsid + Rf, stud = 3.5 * RW + Rs + Rsid + Rf, f = 1.5 / 16;
    var eff = 1 / ((1 - f) / cav + f / stud);
    return { cav: cav, stud: stud, eff: eff, Rins: Rins, Rs: Rs, Rsid: Rsid, Rf: Rf };
  }
  function setTab(t) {
    st.tab = t; P = []; pool.forEach(function (c) { c.setAttribute('r', 0); });
    tabs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === t ? 'true' : 'false'); });
    q('.ev-h').textContent = TAB[t][0]; q('.ev-p').textContent = TAB[t][1]; q('.ev-ctrl').innerHTML = TAB[t][2];
    side.querySelectorAll('.ev-t').forEach(function (b) {
      b.setAttribute('aria-pressed', st[b.dataset.k] ? 'true' : 'false');
      if (b.dataset.k === 'wrb') b.textContent = st.wrb ? 'Barrier in place' : 'Barrier removed';
      b.addEventListener('click', function () { st[b.dataset.k] = !st[b.dataset.k]; if (b.dataset.k === 'wrb') { b.textContent = st.wrb ? 'Barrier in place' : 'Barrier removed'; } b.setAttribute('aria-pressed', st[b.dataset.k] ? 'true' : 'false'); st.wet = 0; st.cond = 0; update(); });
    });
    var fo = q('.ev-foam'); if (fo) fo.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.foam = +b.dataset.v; fo.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); st.cond = 0; update(); });
    if (fo) fo.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.v === st.foam ? 'true' : 'false'); });
    var io = q('.ev-tout'); if (io) { io.value = st.tout; io.addEventListener('input', function () { st.tout = +io.value; st.cond = 0; update(); }); }
    var ii = q('.ev-in'); if (ii) { ii.value = st.tin; ii.addEventListener('input', function () { st.tin = +ii.value; update(); }); }
    var ir = q('.ev-rh'); if (ir) { ir.value = st.rh; ir.addEventListener('input', function () { st.rh = +ir.value; st.cond = 0; update(); }); }
    st.wet = 0; st.cond = 0;
    update();
  }
  function update() {
    var t = st.tab, w = wall();
    wrbL.style.display = st.wrb ? '' : 'none';
    gapG.style.display = (t === 'air' && st.gap) || (t === 'vapor' && st.leak) ? '' : 'none';
    vrL.style.display = st.vr ? '' : 'none'; vrLab.style.opacity = st.vr ? 1 : 0.35;
    var fw = st.foam ? st.foam * 1.6 : 0;
    foamR.setAttribute('x', X.sh0 - fw); foamR.setAttribute('width', fw); foamR.style.display = fw ? '' : 'none'; foamLab.style.display = fw ? '' : 'none';
    var showT = t === 'vapor' || t === 'heat';
    [prof, dewL, condZ, tTin, tTout, tDew, tSh].forEach(function (e) { e.style.display = showT ? '' : 'none'; });
    if (showT) profile(w);
    var v1 = q('.ev-v1'), v2 = q('.ev-v2'), v3 = q('.ev-v3');
    if (v1) v1.textContent = st.tout + ' °F'; if (v2) v2.textContent = st.tin + ' °F'; if (v3) v3.textContent = st.rh + '%';
    var out = q('.ev-res');
    var html = '', key = '';
    if (t === 'water') {
      html = st.wrb ? '<p>Water that gets behind the siding runs down the barrier and drains out at the bottom. <b class="ok">The sheathing stays dry.</b></p>'
                    : '<p class="warn">With no drainage plane, water that gets past the siding soaks into the wood sheathing.</p><p>Wood that stays wet can rot, and the damage is often hidden inside the wall until it’s serious.</p>';
      key = '<span><i class="k-w"></i>rain</span>';
    } else if (t === 'air') {
      html = st.gap ? '<p class="warn">Air streams through the unsealed gap around the outlet box.</p><p>Leaks like this make drafts, waste heating and cooling, and carry moisture into the wall. Caulk, foam or gaskets seal them.</p>'
                    : '<p><b class="ok">The air barrier stops the wind.</b> Siding alone doesn’t: air passes right through its laps.</p>';
      key = '<span><i class="k-a"></i>air</span>';
    } else if (t === 'vapor') {
      var tinC = F2C(st.tin), dp = C2F(dew(tinC, st.rh / 100)), tsh = shTemp(w);
      var risk = tsh < dp;
      html = '<p>Indoor air at ' + st.tin + ' °F and ' + st.rh + '% humidity has a dew point of <b>' + dp.toFixed(0) + ' °F</b>.</p>' +
        '<p>Inner face of the sheathing: <span class="big">' + tsh.toFixed(0) + ' °F</span></p>' +
        (risk ? '<p class="warn">That’s colder than the dew point, so vapor that reaches it can condense.' + (st.vr && !st.leak ? ' The vapor retarder keeps most of it away.' : '') + '</p>'
              : '<p class="ok">That’s warmer than the dew point, so vapor won’t condense there.</p>') +
        '<p class="hs-small">Try adding foam sheathing outside: it keeps the sheathing warmer. EPA suggests keeping indoor humidity below 60 percent, ideally 30 to 50.</p>';
      key = '<span><i class="k-v"></i>water vapor</span><span><i class="k-c"></i>condensed water</span><span><i class="k-t"></i>temperature</span><span><i class="k-d"></i>dew point</span>';
    } else {
      var dT = Math.max(0, st.tin - st.tout), R = st.studs ? w.eff : w.cav, qq = dT / R;
      html = '<p>Cavity path: R-' + w.cav.toFixed(1) + '; through a stud: R-' + w.stud.toFixed(1) + '</p>' +
        '<p>Whole wall' + (st.studs ? ', studs counted' : ', studs ignored') + ': <span class="big">R-' + R.toFixed(1) + '</span></p>' +
        '<p>Heat lost: <b>' + qq.toFixed(2) + ' Btu per hour</b> through each square foot; <b>' + T.fmt(qq * 100 * 24) + ' Btu a day</b> through 100 sq ft of wall.</p>' +
        '<p class="hs-small">q = ΔT ÷ R = (' + st.tin + ' − ' + st.tout + ') ÷ ' + R.toFixed(1) + '. Drywall, paint and the thin air films on each surface add a little more R, and plates, headers and corners add more wood.</p>';
      key = '<span><i class="k-h"></i>heat flow</span><span><i class="k-t"></i>temperature</span>';
    }
    out.innerHTML = html; keyL.innerHTML = key;
  }
  function shTemp(w) { var dT = st.tin - st.tout; return st.tin - dT * w.Rins / w.cav; }
  function profile(w) {
    // temperature (°F) mapped to y: 80 °F at y 40, -20 °F at y 280
    var Y = function (f) { return 40 + (80 - f) * 2.4; };
    var dT = st.tin - st.tout, tsh = shTemp(w), tf = st.tin - dT * (w.Rins + w.Rs) / w.cav, tsid = st.tout + dT * 0 + dT * (w.Rsid) / w.cav;
    var xs = [[450, st.tin], [X.dw1, st.tin], [X.sh1, tsh], [X.sh0, tf], [X.sh0 - (st.foam ? st.foam * 1.6 : 0), st.tout + dT * w.Rsid / w.cav], [X.sid1, st.tout + dT * w.Rsid / w.cav], [X.sid0, st.tout], [0, st.tout]];
    prof.setAttribute('d', 'M' + xs.map(function (p) { return p[0].toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' L'));
    var dp = C2F(dew(F2C(st.tin), st.rh / 100));
    dewL.setAttribute('d', 'M' + X.sid0 + ',' + Y(dp).toFixed(1) + ' H450');
    var vis = st.tab === 'vapor';
    dewL.style.display = vis ? '' : 'none'; tDew.style.display = vis ? '' : 'none';
    tDew.setAttribute('x', 446); tDew.setAttribute('y', (Y(dp) - 5).toFixed(1)); tDew.textContent = 'dew point ' + dp.toFixed(0) + ' °F';
    tTin.setAttribute('x', 446); tTin.setAttribute('y', (Y(st.tin) - 6).toFixed(1)); tTin.textContent = st.tin + ' °F';
    tTout.setAttribute('x', 4); tTout.setAttribute('y', (Y(st.tout) - 6).toFixed(1)); tTout.textContent = st.tout + ' °F';
    tSh.setAttribute('x', X.sh1 + 30); tSh.setAttribute('y', (Y(tsh) + 16).toFixed(1)); tSh.textContent = tsh.toFixed(0) + ' °F';
    // zone of the cavity colder than the dew point
    var x0 = X.sh1, x1 = X.sh1;
    if (tsh < dp) { var frac = (dp - tsh) / Math.max(0.1, st.tin - tsh); x1 = X.sh1 + (X.ins1 - X.sh1) * Math.min(1, frac); }
    condZ.setAttribute('x', x0); condZ.setAttribute('width', Math.max(0, x1 - x0)); condZ.style.display = vis && x1 > x0 ? '' : 'none';
    st.condX = x1;
  }
  // ---------- animation ----------
  var spawnT = 0;
  function add(p) { if (P.length < pool.length) P.push(p); }
  function step(dt) {
    var t = st.tab;
    spawnT += dt;
    var rate = t === 'water' ? 0.05 : t === 'air' ? 0.06 : t === 'vapor' ? 0.07 : 0.09;
    while (spawnT > rate) {
      spawnT -= rate;
      if (t === 'water') add({ k: 'w', x: Math.random() * 150 - 60, y: -6, vx: 70, vy: 160, s: 'fall', behind: Math.random() < 0.25 });
      else if (t === 'air') { var yy = 30 + Math.random() * 250; if (st.gap && Math.random() < 0.35) yy = 143 + Math.random() * 10; add({ k: 'a', x: -5, y: yy, vx: 90 + Math.random() * 30, vy: 0, s: 'go' }); }
      else if (t === 'vapor') {
        if (st.leak && Math.random() < 0.5) add({ k: 'v', x: 450, y: 140 + Math.random() * 20, vx: -110, vy: 0, s: 'leak' });
        else add({ k: 'v', x: 300 + Math.random() * 145, y: 30 + Math.random() * 250, vx: -30 - Math.random() * 20, vy: 0, s: 'go' });
      } else {
        var stud = st.studs && Math.random() < 0.18;
        add({ k: 'h', x: 446, y: stud ? 200 + Math.random() * 30 : 30 + Math.random() * 250, vx: -1, vy: 0, s: stud ? 'stud' : 'go' });
      }
    }
    var w = wall();
    P = P.filter(function (p) {
      if (p.k === 'w') {
        if (p.s === 'fall') { p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > 300) return false; if (p.x >= X.sid0 - 2) { if (p.behind && p.y > 30 && p.y < 270) { p.s = 'behind'; p.x = X.sid1 + 1; } else { p.s = 'run'; p.x = X.sid0 - 2; } } }
        else if (p.s === 'run') { p.y += 90 * dt; if (p.y > 300) return false; }
        else if (p.s === 'behind') {
          if (st.wrb) { p.x = X.wrb - 1.5; p.y += 70 * dt; if (p.y > 288) { p.s = 'out'; } }
          else { p.x += 30 * dt; if (p.x >= X.sh0 + 3) { st.wet = Math.min(1, st.wet + 0.035); return false; } p.y += 20 * dt; }
        }
        else if (p.s === 'out') { p.x -= 40 * dt; p.y += 60 * dt; if (p.y > 302) return false; }
      } else if (p.k === 'a') {
        var inGap = st.gap && p.y > 141 && p.y < 157;
        p.x += p.vx * dt;
        if (!inGap && p.x > X.wrb - 3) { p.vx = 0; p.life = (p.life || 0.35) - dt; if (p.life <= 0) return false; }
        if (inGap && p.x > X.dw1 + 6) { p.vy += (Math.random() - 0.5) * 60 * dt; p.y += p.vy * dt; p.vx *= 0.985; if (p.x > 450 || p.vx < 15) return false; }
      } else if (p.k === 'v') {
        if (p.s === 'drop') { p.life -= dt * 0.15; return p.life > 0; }
        var block = st.vr && p.s !== 'leak';
        p.x += p.vx * dt; p.y += (Math.random() - 0.5) * 40 * dt;
        if (block && p.x < X.vr + 3 && !p.pass) { if (Math.random() < 0.08) p.pass = true; else { p.vx = Math.abs(p.vx) * 0.6; p.x = X.vr + 3; p.bounce = (p.bounce || 0) + 1; if (p.bounce > 2) return false; } }
        if (p.vx > 0 && p.x > 450) return false;
        var tsh = shTemp(w), dp = C2F(dew(F2C(st.tin), st.rh / 100));
        if (p.x < X.sh1 + 2) { if (tsh < dp) { p.s = 'drop'; p.x = X.sh1 + 2 + Math.random() * 3; p.life = 1; st.cond = Math.min(1, st.cond + 0.01); } else return false; }
        if (p.s === 'leak' && p.x < X.sh1 + 2 && !(tsh < dp)) return false;
      } else if (p.k === 'h') {
        var spd = p.s === 'stud' ? 130 : 60 * (11 + w.Rs + w.Rsid) / w.cav;
        p.x -= spd * dt; if (p.x < -4) return false;
      }
      return true;
    });
    wetR.setAttribute('opacity', (0.85 * st.wet).toFixed(2));
    pool.forEach(function (c, i) {
      var p = P[i];
      if (!p) { c.setAttribute('r', 0); return; }
      c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1));
      c.setAttribute('r', p.k === 'v' && p.s === 'drop' ? 3 : p.k === 'h' ? 2.6 : 2.2);
      c.setAttribute('class', 'cn-ev-pt ' + p.k + (p.s === 'drop' ? ' drop' : '') + (p.s === 'stud' ? ' stud' : ''));
    });
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setTab(b.dataset.t); });
  setTab('water');
  if (T.reduced) { for (var k = 0; k < 160; k++) step(0.03); } else T.loop(root, step);
})(window, document);
