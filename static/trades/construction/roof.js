/* Construction course, Lesson 5: roof pitch calculator. Pitch is rise in inches per 12 inches of run.
   angle = atan(rise ÷ 12); rafter length = run × √(12² + rise²) ÷ 12 (Pythagoras). OSHA calls a roof of 4 in 12 or less
   "low slope" and one steeper than 4 in 12 "steep" (OSHA 3755, Protecting Roofing Workers).
   The lengths are the geometry only: real rafter layout also allows for the ridge board and the seat cut. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-roof');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var st = { rise: 6, span: 28, oh: 12, len: 40 }, shown = 6, raf = 0;
  root.innerHTML = '';
  root.classList.add('cn-rf');
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 520 330', role: 'img', 'aria-label': 'The end of a gable roof: rise, run, rafter length and roof angle for the chosen pitch' }, stage);
  svg.innerHTML = '<defs><marker id="rf-a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="cn-rf-ah"/></marker></defs>';
  var wall = S('path', { class: 'cn-rf-wall' }, svg);
  var attic = S('path', { class: 'cn-rf-attic' }, svg);
  var rafL = S('path', { class: 'cn-rf-raf' }, svg), rafR = S('path', { class: 'cn-rf-raf' }, svg);
  var tie = S('path', { class: 'cn-rf-tie' }, svg);
  var dRun = S('path', { class: 'cn-rf-dim', 'marker-start': 'url(#rf-a)', 'marker-end': 'url(#rf-a)' }, svg);
  var dRise = S('path', { class: 'cn-rf-dim', 'marker-start': 'url(#rf-a)', 'marker-end': 'url(#rf-a)' }, svg);
  var dRaf = S('path', { class: 'cn-rf-dim2' }, svg);
  var arc = S('path', { class: 'cn-rf-arc' }, svg);
  var tri = S('path', { class: 'cn-rf-tri' }, svg);
  var tRun = S('text', { class: 'tx-sm tx-b tx-ink', 'text-anchor': 'middle' }, svg);
  var tRise = S('text', { class: 'tx-sm tx-b tx-ink', 'text-anchor': 'start' }, svg);
  var tRaf = S('text', { class: 'tx-sm tx-b cn-rf-tr', 'text-anchor': 'middle' }, svg);
  var tAng = S('text', { class: 'tx-sm tx-b tx-ink' }, svg);
  var t12 = S('text', { class: 'tx-sm cn-rf-tt', 'text-anchor': 'middle' }, svg), tR = S('text', { class: 'tx-sm cn-rf-tt' }, svg);
  var badge = S('text', { class: 'tx-b cn-rf-badge', x: 260, y: 22, 'text-anchor': 'middle' }, svg);

  side.innerHTML =
    '<label class="tr-field">Pitch: <span class="v rf-v1"></span><input type="range" class="rf-rise" min="1" max="16" step="1" value="6" aria-label="Rise in inches per 12 inches of run"></label>' +
    '<div class="tr-seg rf-pre" role="group" aria-label="Common pitches"><button type="button" data-r="3">3 in 12</button><button type="button" data-r="4">4 in 12</button><button type="button" data-r="6">6 in 12</button><button type="button" data-r="8">8 in 12</button><button type="button" data-r="12">12 in 12</button></div>' +
    '<label class="tr-field">Building width (wall to wall): <span class="v rf-v2"></span><input type="range" class="rf-span" min="12" max="48" step="1" value="28" aria-label="Building width in feet"></label>' +
    '<label class="tr-field">Overhang past the wall: <span class="v rf-v3"></span><input type="range" class="rf-oh" min="0" max="24" step="1" value="12" aria-label="Overhang in inches, measured level"></label>' +
    '<label class="tr-field">Building length: <span class="v rf-v4"></span><input type="range" class="rf-len" min="16" max="80" step="1" value="40" aria-label="Building length in feet"></label>' +
    '<div class="tr-out rf-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  function ftin(x) { // feet → 15′ 7 3/8″ to the nearest 1/8 inch
    var n = Math.round(x * 96), ft = Math.floor(n / 96), r = n - ft * 96, inch = Math.floor(r / 8), e = r % 8, d = 8;
    while (e && e % 2 === 0) { e /= 2; d /= 2; }
    return ft + '′ ' + inch + (e ? ' ' + e + '/' + d : '') + '″';
  }
  function draw(rise) {
    var run = st.span / 2, oh = st.oh / 12, k = 10;               // px per foot
    var sc = Math.min(440 / (st.span + 2 * oh), 210 / Math.max(1, run * rise / 12 + 2.2)) || k;
    var cx = 260, base = 300, half = run * sc, H = run * rise / 12 * sc, ohp = oh * sc, ohd = oh * rise / 12 * sc;
    var xl = cx - half, xr = cx + half, yr = base - 64 - H, yw = base - 64;
    wall.setAttribute('d', 'M' + xl + ',' + yw + ' V' + base + ' H' + xr + ' V' + yw);
    attic.setAttribute('d', 'M' + xl + ',' + yw + ' L' + cx + ',' + yr + ' L' + xr + ',' + yw + ' Z');
    rafL.setAttribute('d', 'M' + (xl - ohp) + ',' + (yw + ohd) + ' L' + cx + ',' + yr);
    rafR.setAttribute('d', 'M' + (xr + ohp) + ',' + (yw + ohd) + ' L' + cx + ',' + yr);
    tie.setAttribute('d', 'M' + xl + ',' + yw + ' H' + xr);
    dRun.setAttribute('d', 'M' + (cx + 3) + ',' + (yw + 16) + ' H' + (xr - 3));
    tRun.setAttribute('x', (cx + half / 2).toFixed(1)); tRun.setAttribute('y', (yw + 32).toFixed(1));
    tRun.textContent = 'run ' + ftin(run);
    dRise.setAttribute('d', 'M' + cx + ',' + (yw - 3) + ' V' + (yr + 3));
    dRise.style.opacity = H > 14 ? 1 : 0;
    tRise.setAttribute('x', cx + 6); tRise.setAttribute('y', ((yw + yr) / 2 + 4).toFixed(1));
    tRise.textContent = 'rise ' + ftin(run * rise / 12);
    // rafter dimension, parallel to the left rafter
    var ang = Math.atan(rise / 12), nx = -Math.sin(ang), ny = -Math.cos(ang), off = 16;
    var ax = xl - ohp + nx * off, ay = yw + ohd + ny * off, bx = cx + nx * off, by = yr + ny * off;
    dRaf.setAttribute('d', 'M' + ax.toFixed(1) + ',' + ay.toFixed(1) + ' L' + bx.toFixed(1) + ',' + by.toFixed(1));
    tRaf.setAttribute('x', ((ax + bx) / 2 + nx * 10).toFixed(1)); tRaf.setAttribute('y', ((ay + by) / 2 + ny * 10 + 4).toFixed(1));
    tRaf.setAttribute('transform', 'rotate(' + (-ang * 180 / Math.PI).toFixed(1) + ' ' + ((ax + bx) / 2 + nx * 10).toFixed(1) + ' ' + ((ay + by) / 2 + ny * 10 + 4).toFixed(1) + ')');
    tRaf.textContent = 'rafter ' + ftin((run + oh) * Math.sqrt(144 + rise * rise) / 12);
    // angle arc at the right wall
    var r = 34, a0 = Math.PI, a1 = Math.PI - ang;
    arc.setAttribute('d', 'M' + (xr - r) + ',' + yw + ' A' + r + ',' + r + ' 0 0 1 ' + (xr + r * Math.cos(a1)).toFixed(1) + ',' + (yw - r * Math.sin(ang)).toFixed(1));
    tAng.setAttribute('x', (xr - r - 44).toFixed(1)); tAng.setAttribute('y', (yw - 6).toFixed(1));
    tAng.textContent = (ang * 180 / Math.PI).toFixed(1) + '°';
    // the pitch triangle drawn on the right rafter: 12 across, rise up
    var u = 3.2, fa = 0.42, axp = cx + half * fa, ayp = yr + (half * fa) * rise / 12 - 7;
    tri.setAttribute('d', 'M' + axp.toFixed(1) + ',' + ayp.toFixed(1) + ' h' + (12 * u) + ' v' + (rise * u).toFixed(1) + ' Z');
    t12.setAttribute('x', (axp + 6 * u).toFixed(1)); t12.setAttribute('y', (ayp - 4).toFixed(1)); t12.textContent = '12';
    tR.setAttribute('x', (axp + 12 * u + 4).toFixed(1)); tR.setAttribute('y', (ayp + rise * u / 2 + 4).toFixed(1)); tR.textContent = Math.round(rise);
    var low = rise <= 4;
    badge.textContent = (low ? 'Low slope' : 'Steep roof') + ' (OSHA: ' + (low ? '4 in 12 or less' : 'steeper than 4 in 12') + ')';
    badge.setAttribute('class', 'tx-b cn-rf-badge ' + (low ? 'lo' : 'hi'));
  }
  function frame() {
    raf = 0; shown += (st.rise - shown) * 0.2;
    if (Math.abs(st.rise - shown) < 0.01) shown = st.rise; else raf = W.requestAnimationFrame(frame);
    draw(shown);
  }
  function update() {
    var rise = st.rise, run = st.span / 2, f = Math.sqrt(144 + rise * rise) / 12, ang = Math.atan(rise / 12) * 180 / Math.PI;
    var raft = (run + st.oh / 12) * f, area = 2 * raft * st.len;
    q('.rf-v1').textContent = rise + ' in 12 (' + rise + ' inches up for every 12 inches across)';
    q('.rf-v2').textContent = st.span + ' ft';
    q('.rf-v3').textContent = st.oh + ' in (level)';
    q('.rf-v4').textContent = st.len + ' ft';
    side.querySelectorAll('.rf-pre button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.r === rise ? 'true' : 'false'); });
    q('.rf-out').innerHTML =
      '<p>Roof angle: <span class="big">' + ang.toFixed(1) + '°</span> <span class="hs-small">(angle = tan⁻¹(' + rise + ' ÷ 12))</span></p>' +
      '<p>Each foot of run takes <b>' + f.toFixed(3) + ' ft</b> of rafter <span class="hs-small">(√(12² + ' + rise + '²) ÷ 12)</span></p>' +
      '<p>Rafter, ridge to tail: <b>' + ftin(raft) + '</b> <span class="hs-small">(' + run + ' ft run + ' + st.oh + ' in overhang, × ' + f.toFixed(3) + ')</span></p>' +
      '<p>Total rise to the ridge: <b>' + ftin(run * rise / 12) + '</b></p>' +
      '<p>Roof surface, both sides: about <b>' + T.fmt(area) + ' sq ft</b> <span class="hs-small">(gable ends with no overhang counted)</span></p>' +
      '<p class="hs-small">Geometry only. Real rafter layout also allows for the ridge board and the seat cut where the rafter sits on the wall.</p>';
    if (T.reduced) { shown = rise; draw(rise); } else if (!raf) raf = W.requestAnimationFrame(frame);
  }
  q('.rf-rise').addEventListener('input', function (e) { st.rise = +e.target.value; update(); });
  q('.rf-span').addEventListener('input', function (e) { st.span = +e.target.value; draw(shown); update(); });
  q('.rf-oh').addEventListener('input', function (e) { st.oh = +e.target.value; draw(shown); update(); });
  q('.rf-len').addEventListener('input', function (e) { st.len = +e.target.value; update(); });
  q('.rf-pre').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.rise = +b.dataset.r; q('.rf-rise').value = st.rise; update(); });
  draw(shown); update();
})(window, document);
