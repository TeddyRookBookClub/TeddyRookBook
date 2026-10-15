/* Construction course, Lesson 2: why a deeper joist sags so much less. A physics demonstration, not a span table.
   Simply supported joist under a uniform load: δ = 5 w L⁴ / (384 E I) (UC Davis ENG 104 handout), I = b h³ / 12 (MIT, Roylance).
   Actual sizes of dry 2× lumber: 1½ in thick; 5½, 7¼, 9¼, 11¼ in deep (Missouri S&T course notes, from the NDS Supplement).
   E (modulus of elasticity) at 12% moisture, million lb/in², from the USDA Wood Handbook table: Douglas-fir 1.95, western hemlock 1.63,
   Sitka spruce 1.57, ponderosa pine 1.29 (Oregon State University table, from the USDA Wood Handbook).
   The joist's own weight, knots, long-term creep and code limits are left out on purpose. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-beam');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var SIZES = [['2×6', 5.5], ['2×8', 7.25], ['2×10', 9.25], ['2×12', 11.25]];
  var WOOD = [['Douglas-fir', 1.95], ['Western hemlock', 1.63], ['Sitka spruce', 1.57], ['Ponderosa pine', 1.29]];
  var st = { size: 1, flat: false, span: 12, psf: 40, oc: 16, wood: 0 };
  root.innerHTML = '';
  root.classList.add('cn-bm');
  var head = T.h('p', { class: 'cn-bm-tag' }, '<b>Physics demonstration, not a span table.</b> Real joist sizes and spans come from your local code’s tables or an engineer.');
  root.appendChild(head);
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 10 520 300', role: 'img', 'aria-label': 'A joist resting on two supports, sagging under an even load; the top edge is squeezed and the bottom edge is stretched' }, stage);
  var X0 = 30, Y0 = 120;  // left support at X0; beam top at Y0
  var loadG = S('g', null, svg);
  var comp = S('path', { class: 'cn-bm-comp' }, svg), tens = S('path', { class: 'cn-bm-tens' }, svg);
  var outline = S('path', { class: 'cn-bm-beam' }, svg), na = S('path', { class: 'cn-bm-na' }, svg);
  var supL = S('path', { class: 'cn-bm-sup' }, svg), supR = S('path', { class: 'cn-bm-sup' }, svg);
  var ghost = S('path', { class: 'cn-bm-ghost' }, svg);
  var dim = S('path', { class: 'cn-bm-dim' }, svg), dimT = S('text', { class: 'tx-sm tx-b tx-ink', 'text-anchor': 'middle' }, svg);
  var sagL = S('path', { class: 'cn-bm-sagl' }, svg), sagT = S('text', { class: 'tx-sm tx-b', 'text-anchor': 'start' }, svg);
  var tC = S('text', { class: 'tx-sm cn-bm-tc' }, svg), tT = S('text', { class: 'tx-sm cn-bm-tt' }, svg);
  tC.textContent = 'top edge squeezed (compression)'; tT.textContent = 'bottom edge stretched (tension)';
  var exT = S('text', { class: 'tx-sm', x: 12, y: 24 }, svg);
  // cross-section inset
  var secG = S('g', { transform: 'translate(452,20)' }, svg);
  var secR = S('rect', { class: 'cn-bm-sec' }, secG), secT = S('text', { class: 'tx-sm tx-b tx-ink', 'text-anchor': 'middle' }, secG);

  side.innerHTML =
    '<div class="tr-field">Joist size (actual depth)<div class="tr-seg bm-size" role="group" aria-label="Joist size"></div></div>' +
    '<div class="tr-field">Which way up<div class="tr-seg bm-or" role="group" aria-label="Orientation"><button type="button" data-o="0" aria-pressed="true">On edge</button><button type="button" data-o="1" aria-pressed="false">Laid flat</button></div></div>' +
    '<label class="tr-field">Span between supports: <span class="v bm-v1"></span><input type="range" class="bm-span" min="4" max="20" step="0.5" value="12" aria-label="Span in feet"></label>' +
    '<label class="tr-field">Load on the floor: <span class="v bm-v2"></span><input type="range" class="bm-psf" min="0" max="100" step="5" value="40" aria-label="Floor load in pounds per square foot"></label>' +
    '<div class="tr-field">Joist spacing (on center)<div class="tr-seg bm-oc" role="group" aria-label="Joist spacing"><button type="button" data-v="12" aria-pressed="false">12 in</button><button type="button" data-v="16" aria-pressed="true">16 in</button><button type="button" data-v="24" aria-pressed="false">24 in</button></div></div>' +
    '<label class="tr-field">Wood: <select class="bm-wood" aria-label="Wood species"></select></label>' +
    '<div class="tr-out bm-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  SIZES.forEach(function (s, i) { var b = T.h('button', { type: 'button', 'data-i': i, 'aria-pressed': i === st.size ? 'true' : 'false', text: s[0] + ' (' + fr(s[1]) + '″)' }); q('.bm-size').appendChild(b); });
  WOOD.forEach(function (w, i) { var o = T.h('option', { value: i, text: w[0] + ' (E = ' + w[1].toFixed(2) + ' million psi)' }); q('.bm-wood').appendChild(o); });
  var bars = T.h('div', { class: 'cn-bm-bars', role: 'img', 'aria-label': 'Sag of each joist size at these settings' }); root.appendChild(bars);

  function fr(x) { // inches as a mixed fraction to 1/16
    var n = Math.round(x * 16), w = Math.floor(n / 16), r = n % 16, d = 16;
    while (r && r % 2 === 0) { r /= 2; d /= 2; }
    return (w ? w : (r ? '' : '0')) + (r ? (w ? ' ' : '') + r + '/' + d : '');
  }
  function sag(i, flat) {
    var b = flat ? SIZES[i][1] : 1.5, h = flat ? 1.5 : SIZES[i][1];
    var I = b * h * h * h / 12, w = st.psf * (st.oc / 12) / 12, L = st.span * 12, E = WOOD[st.wood][1] * 1e6;
    return { I: I, w: w, d: 5 * w * Math.pow(L, 4) / (384 * E * I), b: b, h: h };
  }
  var cur = 0, target = 0, raf = 0;
  function shape(sagPx) {
    var Lp = st.span * 23, hp = (st.flat ? 1.5 : SIZES[st.size][1]) * 3.2, n = 40, top = [], bot = [], mid = [];
    for (var i = 0; i <= n; i++) {
      var xi = i / n, f = (16 / 5) * xi * (1 - 2 * xi * xi + xi * xi * xi), x = X0 + xi * Lp, y = Y0 + f * sagPx;
      top.push([x, y]); bot.push([x, y + hp]); mid.push([x, y + hp / 2]);
    }
    return { top: top, bot: bot, mid: mid, Lp: Lp, hp: hp };
  }
  function P(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L'); }
  function render(sagPx) {
    var s = shape(sagPx), x1 = X0 + s.Lp;
    outline.setAttribute('d', 'M' + P(s.top) + ' L' + P(s.bot.slice().reverse()) + ' Z');
    comp.setAttribute('d', 'M' + P(s.top) + ' L' + P(s.mid.slice().reverse()) + ' Z');
    tens.setAttribute('d', 'M' + P(s.mid) + ' L' + P(s.bot.slice().reverse()) + ' Z');
    na.setAttribute('d', 'M' + P(s.mid));
    ghost.setAttribute('d', 'M' + X0 + ',' + Y0 + ' H' + x1.toFixed(1));
    var yb = Y0 + s.hp;
    supL.setAttribute('d', 'M' + X0 + ',' + yb.toFixed(1) + ' l-12,22 h24 z');
    supR.setAttribute('d', 'M' + x1.toFixed(1) + ',' + yb.toFixed(1) + ' l-12,22 h24 z');
    var yd = Math.max(yb + 34, Y0 + sagPx + (s.hp) + 22);
    dim.setAttribute('d', 'M' + X0 + ',' + yd + ' H' + x1.toFixed(1) + ' M' + X0 + ',' + (yb + 26).toFixed(1) + ' V' + (yd + 6) + ' M' + x1.toFixed(1) + ',' + (yb + 26).toFixed(1) + ' V' + (yd + 6));
    dimT.setAttribute('x', ((X0 + x1) / 2).toFixed(1)); dimT.setAttribute('y', (yd + 16).toFixed(1));
    dimT.textContent = 'span ' + st.span + ' ft';
    var xm = X0 + s.Lp / 2, ym = Y0 + sagPx;
    sagL.setAttribute('d', 'M' + xm.toFixed(1) + ',' + Y0 + ' V' + ym.toFixed(1)); sagL.style.display = sagPx > 3 ? '' : 'none';
    sagL.style.opacity = sagPx > 3 ? 1 : 0;
    sagT.setAttribute('x', (xm + 6).toFixed(1)); sagT.setAttribute('y', (ym + s.hp + 15).toFixed(1));
    tC.setAttribute('x', X0 - 6); tC.setAttribute('y', (Y0 - 46).toFixed(1));
    tT.setAttribute('x', X0 - 6); tT.setAttribute('y', (yd + 34).toFixed(1));
    // load arrows: density follows the load
    loadG.innerHTML = '';
    if (st.psf > 0) {
      var na_ = Math.max(4, Math.round(s.Lp / 22)), len = 8 + 22 * Math.sqrt(st.psf / 100);
      for (var i = 0; i <= na_; i++) {
        var xi = i / na_, x = X0 + xi * s.Lp, y = Y0 + (16 / 5) * xi * (1 - 2 * xi * xi + xi * xi * xi) * sagPx - 3;
        S('path', { class: 'cn-bm-arr', d: 'M' + x.toFixed(1) + ',' + (y - len).toFixed(1) + ' V' + y.toFixed(1) + ' m-3.5,-6 l3.5,6 l3.5,-6' }, loadG);
      }
      S('path', { class: 'cn-bm-arrl', d: 'M' + X0 + ',' + (Y0 - len - 3).toFixed(1) + ' H' + x1.toFixed(1) }, loadG);
    }
  }
  function frame() {
    raf = 0;
    cur += (target - cur) * 0.18;
    if (Math.abs(target - cur) < 0.05) cur = target; else raf = W.requestAnimationFrame(frame);
    render(cur);
  }
  function update() {
    var r = sag(st.size, st.flat), dIn = r.d;
    q('.bm-v1').textContent = st.span + ' ft (' + T.fmt(st.span * 12) + ' in)';
    q('.bm-v2').textContent = st.psf + ' lb per sq ft';
    // drawing: exaggerate 20×, then cap so it stays on the stage
    var EX = 20, px = dIn * EX * 23 / 12, cap = 92, shown = Math.min(px, cap), exag = shown / (dIn * 23 / 12);
    target = shown;
    exT.textContent = dIn > 0 ? 'Sag drawn ' + (px > cap ? 'about ' + Math.round(exag) : EX) + '× bigger than life; beam depth not to scale' : '';
    sagT.textContent = 'sag ' + (dIn >= 0.995 ? dIn.toFixed(2) : dIn.toFixed(3)) + ' in';
    secR.setAttribute('width', (r.b * 4).toFixed(1)); secR.setAttribute('height', (r.h * 4).toFixed(1));
    secR.setAttribute('x', (-r.b * 2).toFixed(1)); secR.setAttribute('y', 0);
    secT.setAttribute('x', 0); secT.setAttribute('y', (r.h * 4 + 14).toFixed(1));
    secT.textContent = fr(r.b) + '″ × ' + fr(r.h) + '″';
    var ratio = dIn > 0 ? Math.round(st.span * 12 / dIn) : 0;
    var r6 = sag(0, st.flat), r12 = sag(3, st.flat);
    q('.bm-out').innerHTML =
      '<p>Stiffness of the shape: I = b × h³ ÷ 12 = ' + fr(r.b) + ' × ' + fr(r.h) + '³ ÷ 12 = <b>' + T.fmt(r.I, r.I < 10 ? 2 : 1) + ' in⁴</b></p>' +
      '<p>Load on this joist: ' + st.psf + ' lb/sq ft × ' + (st.oc / 12).toFixed(2).replace(/\.?0+$/, '') + ' ft of floor = <b>' + T.fmt(st.psf * st.oc / 12, 1) + ' lb per foot</b></p>' +
      '<p>Sag at the middle: <span class="big">' + (dIn >= 0.995 ? dIn.toFixed(2) : dIn.toFixed(3)) + ' in</span>' + (dIn > 0.03 ? ' (about ' + fr(dIn) + '″)' : '') + '</p>' +
      (ratio ? '<p>That’s <b>1/' + T.fmt(ratio) + '</b> of the span.</p>' : '<p>No load, no sag.</p>') +
      (st.flat ? '<p class="cn-bm-hl">Laid flat, the same board is only 1½ inches deep, so it sags <b>' + T.fmt(sag(st.size, true).d / sag(st.size, false).d, 0) + ' times</b> as much as on edge.</p>'
               : '<p class="cn-bm-hl">A 2×12 is ' + (11.25 / 5.5).toFixed(2) + ' times as deep as a 2×6, so it sags about <b>' + T.fmt(r6.d / r12.d, 1) + ' times</b> less: depth cubed.</p>');
    // comparison bars
    var all = SIZES.map(function (s, i) { return sag(i, st.flat).d; }), mx = Math.max.apply(null, all) || 1;
    bars.innerHTML = '<p class="cn-bm-bh">Sag of each size with these settings' + (st.flat ? ' (laid flat)' : '') + '</p>' + SIZES.map(function (s, i) {
      return '<div class="cn-bm-row' + (i === st.size ? ' on' : '') + '"><span>' + s[0] + '</span><i style="width:' + (100 * all[i] / mx).toFixed(1) + '%"></i><b>' + (all[i] >= 0.995 ? all[i].toFixed(2) : all[i].toFixed(3)) + ' in</b></div>';
    }).join('');
    if (T.reduced) { cur = target; render(cur); } else if (!raf) raf = W.requestAnimationFrame(frame);
  }
  function seg(sel, fn) {
    q(sel).addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      q(sel).querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      fn(b); update();
    });
  }
  seg('.bm-size', function (b) { st.size = +b.dataset.i; });
  seg('.bm-or', function (b) { st.flat = b.dataset.o === '1'; });
  seg('.bm-oc', function (b) { st.oc = +b.dataset.v; });
  q('.bm-span').addEventListener('input', function (e) { st.span = +e.target.value; update(); });
  q('.bm-psf').addEventListener('input', function (e) { st.psf = +e.target.value; update(); });
  q('.bm-wood').addEventListener('change', function (e) { st.wood = +e.target.value; update(); });
  update();
})(window, document);
