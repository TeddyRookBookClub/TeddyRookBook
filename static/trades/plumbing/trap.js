/* Plumbing course, Lesson 3: a P-trap, its water seal and the vent.
   The trap is modeled as a U-tube manometer. With air pressure p (inches of water) below atmospheric on the drain side, the
   drain-side column stands p inches taller than the fixture side; the drain side can't rise above the weir, so water spills
   and the fixture side drops. When the fixture side reaches the dip, the seal is broken. Seal depth is 3 in (HUD 24 CFR 3280.606
   calls for 2 to 4 in). 1 in of water = 249.08 Pa (NIST SP 811). The suction values during a drain (about 0.4 in with a working
   vent, about 5 in with the vent blocked) are illustrations, not measurements; HUD's inspection guide treats more than 1 in of
   movement in a trap as a sign of inadequate venting. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-trap');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg, PA_IN = 249.08;
  var SEAL = 3, PXIN = 50 / SEAL;               // inches; px per inch of water
  var WEIR = 180, DIP = 230, LX = 100, RX = 160, CY = 210;
  var st = { V: 2 * SEAL, ha: SEAL, hb: SEAL, p: 0, vent: true, ev: null, t: 0, sink: 0, slug: -1, slug2: -1, months: 0, gas: [], gt: 0 };

  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 440 340', role: 'img', 'aria-label': 'A sink with a P-trap, a trap arm to a drain stack, and a vent through the roof', class: 'pl-tp' }, stage);
  // room and roof
  S('path', { class: 'pl-tp-roof', d: 'M262,48 L440,22' }, svg);
  S('text', { class: 'pl-tp-t', x: 436, y: 16, 'text-anchor': 'end' }, svg).textContent = 'roof';
  // sink
  S('path', { class: 'pl-tp-sink', d: 'M20,40 H180 L166,92 H34 Z' }, svg);
  var sinkW = S('path', { class: 'pl-tp-water' }, svg);
  S('path', { class: 'pl-tp-faucet', d: 'M150,40 V22 H118 V30' }, svg);
  // pipes (outer then inner)
  var PIPE = 'M100,92 V' + CY + ' A30,30 0 0 0 160,' + CY + ' V180 Q160,170 170,170 L320,176';
  S('path', { class: 'pl-tp-po', d: PIPE }, svg); S('path', { class: 'pl-tp-pi', d: PIPE }, svg);
  S('path', { class: 'pl-tp-po', d: 'M330,330 V30' }, svg); S('path', { class: 'pl-tp-pi', d: 'M330,330 V30' }, svg);
  S('path', { class: 'pl-tp-po', d: 'M330,62 H440' }, svg); S('path', { class: 'pl-tp-pi', d: 'M330,62 H440' }, svg);
  S('rect', { class: 'pl-tp-pi2', x: 320, y: 160, width: 20, height: 26 }, svg);
  // trap water
  var tw = S('path', { class: 'pl-tp-tw' }, svg);
  // arm and stack water slugs
  var armW = S('path', { class: 'pl-tp-slug' }, svg);
  var stkW = S('rect', { class: 'pl-tp-slugr', x: 321, width: 18 }, svg);
  var stkW2 = S('rect', { class: 'pl-tp-slugr', x: 321, width: 18 }, svg);
  // vent cap and blockage
  S('path', { class: 'pl-tp-cap', d: 'M318,30 H342' }, svg);
  var nest = S('g', { class: 'pl-tp-nest' }, svg);
  S('ellipse', { cx: 330, cy: 34, rx: 16, ry: 9 }, nest);
  S('path', { d: 'M316,32 l28,4 M318,38 l24,-6 M322,28 l14,10' }, nest);
  // labels
  S('text', { class: 'pl-tp-t', x: 346, y: 122 }, svg).textContent = 'vent';
  S('text', { class: 'pl-tp-t', x: 346, y: 88 }, svg).textContent = 'from upstairs';
  S('text', { class: 'pl-tp-t', x: 342, y: 318 }, svg).textContent = 'to the sewer';
  S('text', { class: 'pl-tp-t', x: 200, y: 160 }, svg).textContent = 'trap arm';
  S('path', { class: 'pl-tp-dim', d: 'M60,' + WEIR + ' H86 M60,' + DIP + ' H86 M66,' + WEIR + ' V' + DIP }, svg);
  var sealT = S('text', { class: 'pl-tp-t pl-tp-b', x: 6, y: 208 }, svg);
  S('text', { class: 'pl-tp-t', x: 6, y: 194 }, svg).textContent = 'seal';
  // air arrows and gauge
  var airV = S('g', { class: 'pl-tp-air' }, svg);
  airV.innerHTML = '<path d="M352,120 V150 M346,142 l6,8 l6,-8"/><path d="M308,120 V150 M302,142 l6,8 l6,-8"/>';
  var bub = S('g', { class: 'pl-tp-bub' }, svg);
  var gasG = S('g', { class: 'pl-tp-gas' }, svg);
  var gauge = S('g', null, svg);
  S('rect', { class: 'pl-tp-gbox', x: 196, y: 196, width: 108, height: 54, rx: 8 }, gauge);
  S('text', { class: 'pl-tp-t', x: 250, y: 212, 'text-anchor': 'middle' }, gauge).textContent = 'air in the drain';
  var gT = S('text', { class: 'pl-tp-t pl-tp-big', x: 250, y: 238, 'text-anchor': 'middle' }, gauge);
  var monthT = S('text', { class: 'pl-tp-t pl-tp-b', x: 100, y: 120, 'text-anchor': 'middle' }, svg);

  side.innerHTML =
    '<div class="tr-w-ctrl pl-tp-btns"><button type="button" class="hs-btn tp-drain">Drain a full sink</button><button type="button" class="hs-btn ghost tp-flush">Flush upstairs</button></div>' +
    '<div class="tr-seg tp-vent" role="group" aria-label="Vent"><button type="button" data-v="1" aria-pressed="true">Vent open</button><button type="button" data-v="0" aria-pressed="false">Vent blocked</button></div>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost tp-month">Leave it unused for months</button><button type="button" class="hs-btn ghost tp-run">Run a little water</button></div>' +
    '<div class="tr-out tp-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  var out = q('.tp-out');

  function eq() {
    // equilibrium levels for current water V (inches above the dip, both legs) and suction p
    var V = st.V, p = st.p, hb = (V + p) / 2, ha = (V - p) / 2;
    if (hb > SEAL) { hb = SEAL; ha = SEAL - p; st.V = Math.min(st.V, hb + Math.max(0, ha)); }
    if (ha < 0) { ha = 0; hb = Math.min(SEAL, st.V); }
    if (hb < 0) { hb = 0; ha = Math.min(SEAL + 6, st.V); }
    return { ha: ha, hb: hb };
  }
  function broken() { return Math.min(st.ha, st.hb) < 0.25; }
  function render() {
    var ya = DIP - st.ha * PXIN, yb = DIP - st.hb * PXIN;
    // water path: fixture leg from ya down, bend, drain leg up to yb
    var d = '';
    if (ya < CY) d += 'M' + LX + ',' + ya.toFixed(1) + ' V' + CY + ' '; else d += 'M' + LX + ',' + CY + ' ';
    d += 'A30,30 0 0 0 ' + RX + ',' + CY;
    if (yb < CY) d += ' V' + yb.toFixed(1);
    tw.setAttribute('d', d);
    tw.setAttribute('class', 'pl-tp-tw' + (Math.min(st.ha, st.hb) <= 0.02 ? ' low' : ''));
    // sink water
    if (st.sink > 0.01) { var top = 92 - 46 * st.sink; var hw = 14 * (92 - top) / 52; sinkW.setAttribute('d', 'M' + (34 - hw).toFixed(1) + ',' + top.toFixed(1) + ' H' + (166 + hw).toFixed(1) + ' L166,92 H34 Z'); }
    else sinkW.setAttribute('d', '');
    // slugs
    if (st.slug >= 0 && st.slug <= 1.35) {
      var x0 = 170 + 150 * Math.min(1, st.slug), x1 = Math.max(170, x0 - 70);
      armW.setAttribute('d', st.slug < 1 ? 'M' + x1.toFixed(1) + ',' + (170 + (x1 - 170) * 0.04).toFixed(1) + ' L' + x0.toFixed(1) + ',' + (170 + (x0 - 170) * 0.04).toFixed(1) : '');
      var sy = st.slug > 0.9 ? 176 + (st.slug - 0.9) * 360 : -100;
      stkW.setAttribute('y', sy.toFixed(1)); stkW.setAttribute('height', st.slug > 0.9 ? 46 : 0);
    } else { armW.setAttribute('d', ''); stkW.setAttribute('height', 0); }
    if (st.slug2 >= 0 && st.slug2 <= 1.2) { stkW2.setAttribute('y', (50 + st.slug2 * 270).toFixed(1)); stkW2.setAttribute('height', 50); } else stkW2.setAttribute('height', 0);
    nest.style.display = st.vent ? 'none' : '';
    airV.style.display = st.vent && Math.abs(st.p) > 0.05 ? '' : 'none';
    var seal = Math.max(0, Math.min(st.ha, st.hb));
    sealT.textContent = seal.toFixed(1) + ' in';
    gT.textContent = (st.p > 0.005 ? '−' : '') + Math.abs(st.p).toFixed(1) + ' in';
    gT.setAttribute('class', 'pl-tp-t pl-tp-big' + (st.p > SEAL ? ' pl-tp-warn' : ''));
    monthT.textContent = st.ev === 'month' ? (st.months < 1 ? 'weeks pass…' : 'months pass…') : '';
    // bubbles through a breaking seal
    var bh = '';
    if (st.ev && broken() && st.p > 0.5) for (var i = 0; i < 4; i++) { var by = 150 + ((st.t * 90 + i * 25) % 90); bh += '<circle cx="' + (LX + (i % 2 ? 4 : -4)) + '" cy="' + (DIP - (by - 150)) .toFixed(1) + '" r="3"/>'; }
    bub.innerHTML = bh;
    // gas puffs
    var gh = '', into = broken();
    if (T.reduced) { var rp = PATHS[into ? 'room' : (st.vent ? 'vent' : 'stay')]; gh += '<path class="pl-tp-gasp" d="M' + rp.map(function (q) { return q.join(','); }).join(' L') + '"/>'; }
    st.gas.forEach(function (g) { gh += '<circle cx="' + g.x.toFixed(1) + '" cy="' + g.y.toFixed(1) + '" r="' + g.r.toFixed(1) + '" opacity="' + g.o.toFixed(2) + '"/>'; });
    gasG.innerHTML = gh;
    var o = '<p>Water seal: <span class="big">' + seal.toFixed(1) + ' in</span> of ' + SEAL + ' in';
    o += ' &nbsp;·&nbsp; it can hold back ' + T.fmt(seal * PA_IN, 0) + ' Pa (' + (seal * PA_IN / 6894.757).toFixed(3) + ' psi)</p>';
    o += '<p>Air pressure in the drain: <b>' + (st.p > 0.005 ? '−' : '') + Math.abs(st.p).toFixed(1) + ' in of water</b> compared with the room' + (st.p > SEAL ? ', more than the seal can hold' : '') + '</p>';
    if (into) o += '<p class="warn">Seal broken: sewer gas can come up through the drain into the room. ' + (st.vent ? 'Run some water to refill the trap.' : 'Unblock the vent, then run some water.') + '</p>';
    else if (seal < SEAL - 0.4) o += '<p class="warn">The seal is low but still holding. Running water refills it.</p>';
    else o += '<p class="ok">Seal holding: sewer gas stays in the drain and leaves through the vent.</p>';
    out.innerHTML = o;
  }
  // gas particles follow one of three paths
  var PATHS = { vent: [[330, 322], [330, 18]], stay: [[330, 322], [330, 200]],
    room: [[330, 322], [330, 176], [172, 172], [160, 192], [130, 232], [100, 205], [100, 92], [104, 26]] };
  function along(pts, d) {
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], L = Math.sqrt(dx * dx + dy * dy);
      if (d <= L) return [pts[i - 1][0] + dx * d / L, pts[i - 1][1] + dy * d / L, false];
      d -= L;
    }
    var e = pts[pts.length - 1]; return [e[0], e[1], true];
  }
  function gasStep(dt) {
    st.gt += dt;
    var path = broken() ? 'room' : (st.vent ? 'vent' : 'stay');
    if (!T.reduced && st.gt > 0.4) {
      st.gt = 0;
      st.gas.push({ path: path, d: 0, x: 330, y: 322, r: 3, o: 0.75, j: Math.random() * 6 - 3 });
      if (st.gas.length > 40) st.gas.shift();
    }
    st.gas.forEach(function (g) {
      if (broken() && g.path !== 'room' && g.y > 180) { g.path = 'room'; }
      g.d += (g.path === 'room' ? 85 : 55) * dt;
      var p = along(PATHS[g.path], g.d);
      g.x = p[0] + g.j * 0.5; g.y = p[1];
      g.r = Math.min(7, g.r + dt * 0.8);
      if (p[2]) g.o -= dt * 1.2;
    });
    st.gas = st.gas.filter(function (g) { return g.o > 0.05; });
  }
  function step(dt) {
    var ev = st.ev;
    if (ev) st.t += dt;
    var t = st.t;
    if (ev === 'drain') {
      st.sink = Math.max(0, 1 - t / 2.4);
      if (t < 2.4) st.V = Math.min(2 * SEAL, st.V + dt * 4);            // flow through the trap keeps it full
      st.slug = t < 0.5 ? -1 : (t - 0.5) / 2.4;
      var peak = st.vent ? 0.4 : 5;
      st.p = t < 1.2 ? 0 : t < 2.6 ? peak * (t - 1.2) / 1.4 : t < 3.4 ? peak : Math.max(0, peak * (1 - (t - 3.4) / 0.6));
      if (t > 4.4) { st.ev = null; st.p = 0; st.slug = -1; }
    } else if (ev === 'flush') {
      st.slug2 = t / 1.6;
      var pk = st.vent ? 0.3 : 4.2;
      st.p = t < 0.6 ? 0 : t < 1.0 ? pk * (t - 0.6) / 0.4 : t < 1.6 ? pk : Math.max(0, pk * (1 - (t - 1.6) / 0.5));
      if (t > 2.3) { st.ev = null; st.p = 0; st.slug2 = -1; }
    } else if (ev === 'month') {
      st.months = t / 1.2; st.V = Math.max(0, st.V - dt * 1.8);
      if (st.V <= 0) { st.ev = null; }
    } else if (ev === 'run') {
      st.V = Math.min(2 * SEAL, st.V + dt * 6); st.sink = Math.max(0, 0.15 - t * 0.15);
      if (st.V >= 2 * SEAL && t > 1) st.ev = null;
    }
    // while the seal is broken under suction, the siphon keeps pulling water out of the trap
    if (st.p > 0 && (st.V - st.p) / 2 < 0) st.V = Math.max(0.4, st.V - dt * 5);
    var e = eq();
    var k = Math.min(1, dt * 8);
    st.ha += (e.ha - st.ha) * k; st.hb += (e.hb - st.hb) * k;
    gasStep(dt);
    render();
    if (!st.ev) btns(true);
  }
  function btns(on) { side.querySelectorAll('.tp-drain,.tp-flush,.tp-month,.tp-run').forEach(function (b) { b.disabled = !on; }); }
  function start(ev) { st.ev = ev; st.t = 0; if (ev === 'drain') st.sink = 1; if (ev === 'run') st.sink = 0.15; btns(false); }
  q('.tp-drain').addEventListener('click', function () { start('drain'); });
  q('.tp-flush').addEventListener('click', function () { start('flush'); });
  q('.tp-month').addEventListener('click', function () { start('month'); });
  q('.tp-run').addEventListener('click', function () { start('run'); });
  side.querySelectorAll('.tp-vent button').forEach(function (b) {
    b.addEventListener('click', function () {
      st.vent = b.dataset.v === '1';
      side.querySelectorAll('.tp-vent button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      render();
    });
  });
  render();
  T.loop(root, step);
})(window, document);
