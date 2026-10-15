/* Construction course, Lesson 7: stair calculator. Divide the total rise (finished floor to finished floor) into equal
   risers no taller than the limit you enter; there is one fewer tread than risers, because the upper floor is the last
   step. The limits are inputs on purpose: maximum riser height, minimum tread depth, headroom and handrails are set by
   the local code. The numbers here are geometry only. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-stairs');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var st = { rise: 105, max: 7.5, tread: 10.5 }, climb = 0, climbing = false;
  root.innerHTML = '';
  root.classList.add('cn-stw');
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var left = T.h('div'); grid.appendChild(left);
  var stage = T.h('div', { class: 'tr-w-stage' }); left.appendChild(stage);
  var svg = S('svg', { viewBox: '0 50 520 300', role: 'img', 'aria-label': 'Side view of a straight stair: equal risers and treads between two floors' }, stage);
  var g = S('g', null, svg), ball = S('circle', { class: 'cn-stw-ball', r: 7 }, svg);
  var ctrl = T.h('div', { class: 'tr-w-ctrl' }, '<button type="button" class="hs-btn ghost stw-go">▶ Walk up the stairs</button>');
  left.appendChild(ctrl);
  var side = T.h('div'); grid.appendChild(side);
  side.innerHTML =
    '<label class="tr-field">Total rise, floor to floor: <span class="v stw-v1"></span><input type="range" class="stw-rise" min="40" max="150" step="0.25" value="105" aria-label="Total rise in inches"></label>' +
    '<label class="tr-field">Tallest riser your local code allows: <span class="v stw-v2"></span><input type="range" class="stw-max" min="6" max="8.5" step="0.125" value="7.5" aria-label="Maximum riser height in inches"></label>' +
    '<label class="tr-field">Tread depth: <span class="v stw-v3"></span><input type="range" class="stw-tread" min="8" max="14" step="0.25" value="10.5" aria-label="Tread depth in inches"></label>' +
    '<div class="tr-out stw-out" aria-live="polite"></div>' +
    '<p class="tr-w-note">Look up your local code’s limits for riser height, tread depth, headroom and handrails before you build; they vary from place to place.</p>';
  var q = function (s) { return side.querySelector(s); };
  function fr(x) { var n = Math.round(x * 16), w = Math.floor(n / 16), r = n % 16, d = 16; while (r && r % 2 === 0) { r /= 2; d /= 2; } return (w || !r ? w : '') + (r ? (w ? ' ' : '') + r + '/' + d : '') + '″'; }
  function ftin(x) { var n = Math.round(x * 16), ft = Math.floor(n / 192), r = (n - ft * 192) / 16; return (ft ? ft + '′ ' : '') + fr(r); }
  var geo = null;
  function update() {
    var n = Math.ceil(st.rise / st.max - 1e-9), R = st.rise / n, nt = n - 1, run = nt * st.tread, ang = Math.atan(R / st.tread) * 180 / Math.PI;
    var len = Math.sqrt(st.rise * st.rise + run * run);
    q('.stw-v1').textContent = ftin(st.rise) + ' (' + st.rise + ' in)';
    q('.stw-v2').textContent = fr(st.max);
    q('.stw-v3').textContent = fr(st.tread);
    q('.stw-out').innerHTML =
      '<p>Number of risers: <span class="big">' + n + '</span> <span class="hs-small">(' + st.rise + ' ÷ ' + st.max + ' = ' + (st.rise / st.max).toFixed(2) + ', rounded up)</span></p>' +
      '<p>Each riser: <b>' + fr(R) + '</b> <span class="hs-small">(' + R.toFixed(3) + ' in, all exactly the same)</span></p>' +
      '<p>Treads: <b>' + nt + '</b>, one fewer than the risers</p>' +
      '<p>Total run: <b>' + ftin(run) + '</b> <span class="hs-small">(' + nt + ' × ' + st.tread + ' in)</span></p>' +
      '<p>Stair angle: <b>' + ang.toFixed(1) + '°</b>; the stringer is about ' + ftin(len) + ' long along the slope.</p>';
    // drawing
    g.innerHTML = '';
    var sc = Math.min(400 / Math.max(run, 1), 236 / (st.rise + 36)), x0 = 470 - run * sc, y0 = 300, xr = 470, yt = y0 - st.rise * sc;
    S('path', { class: 'cn-stw-floor', d: 'M10,' + y0 + ' H' + (x0 + 2).toFixed(1) }, g);
    S('rect', { class: 'cn-stw-slab', x: 10, y: y0, width: 500, height: 10 }, g);
    S('rect', { class: 'cn-stw-up', x: xr, y: yt, width: 40, height: 14 }, g);
    S('path', { class: 'cn-stw-str', d: 'M' + x0.toFixed(1) + ',' + y0 + ' L' + xr + ',' + (yt + 14).toFixed(1) + ' L' + xr + ',' + (yt + 30).toFixed(1) + ' L' + (x0 + 30).toFixed(1) + ',' + y0 + ' Z' }, g);
    var d = 'M' + x0.toFixed(1) + ',' + y0, pts = [];
    for (var i = 0; i < n; i++) {
      var x = x0 + i * st.tread * sc, y = y0 - (i + 1) * R * sc;
      d += ' V' + y.toFixed(1);
      pts.push([x + (i < n - 1 ? st.tread * sc / 2 : 14), y]);
      if (i < n - 1) d += ' H' + (x + st.tread * sc).toFixed(1);
    }
    S('path', { class: 'cn-stw-steps', d: d }, g);
    // handrail along the nosings
    S('path', { class: 'cn-stw-rail', d: 'M' + (x0).toFixed(1) + ',' + (y0 - R * sc - 34 * sc).toFixed(1) + ' L' + (xr).toFixed(1) + ',' + (yt - 34 * sc).toFixed(1) }, g);
    // dimensions: one riser and one tread, total rise and run
    var i1 = Math.max(0, Math.floor(n / 2) - 1), rx = x0 + (i1 + 1) * st.tread * sc, ry0 = y0 - (i1 + 1) * R * sc, ry1 = ry0 - R * sc;
    S('path', { class: 'cn-stw-dim', d: 'M' + (rx + 8).toFixed(1) + ',' + ry0.toFixed(1) + ' V' + ry1.toFixed(1) }, g);
    var t1 = S('text', { class: 'tx-sm tx-b cn-stw-tr', x: (rx + 12).toFixed(1), y: ((ry0 + ry1) / 2 + 4).toFixed(1) }, g); t1.textContent = 'riser ' + fr(R);
    var tx0 = x0 + i1 * st.tread * sc;
    S('path', { class: 'cn-stw-dim', d: 'M' + tx0.toFixed(1) + ',' + (ry0 - 8).toFixed(1) + ' H' + rx.toFixed(1) }, g);
    var t2 = S('text', { class: 'tx-sm tx-b cn-stw-tt', x: (tx0 - 6).toFixed(1), y: (ry0 - 4).toFixed(1), 'text-anchor': 'end' }, g); t2.textContent = 'tread ' + fr(st.tread);
    S('path', { class: 'cn-stw-dim2', d: 'M500,' + y0 + ' V' + yt.toFixed(1) }, g);
    var t3 = S('text', { class: 'tx-sm', x: 506, y: ((y0 + yt) / 2).toFixed(1), transform: 'rotate(90 506 ' + ((y0 + yt) / 2).toFixed(1) + ')', 'text-anchor': 'middle' }, g); t3.textContent = 'total rise ' + ftin(st.rise);
    S('path', { class: 'cn-stw-dim2', d: 'M' + x0.toFixed(1) + ',' + (y0 + 22) + ' H' + xr }, g);
    var t4 = S('text', { class: 'tx-sm', x: ((x0 + xr) / 2).toFixed(1), y: y0 + 36, 'text-anchor': 'middle' }, g); t4.textContent = 'total run ' + ftin(run) + ' · ' + n + ' risers, ' + nt + ' treads';
    geo = { pts: pts, x0: x0, y0: y0 };
    if (!climbing) { ball.setAttribute('cx', (x0 - 20).toFixed(1)); ball.setAttribute('cy', (y0 - 7).toFixed(1)); }
  }
  function walk() {
    if (!geo) return;
    climbing = true; climb = 0;
    var pts = [[geo.x0 - 20, geo.y0]].concat(geo.pts), start = 0, dur = 0.45;
    function f(t) {
      if (!start) start = t;
      var s = (t - start) / 1000 / dur, i = Math.floor(s);
      if (i >= pts.length - 1) { ball.setAttribute('cx', pts[pts.length - 1][0]); ball.setAttribute('cy', pts[pts.length - 1][1] - 7); climbing = false; return; }
      var u = s - i, a = pts[i], b = pts[i + 1], hop = Math.sin(u * Math.PI) * 14;
      ball.setAttribute('cx', (a[0] + (b[0] - a[0]) * u).toFixed(1));
      ball.setAttribute('cy', (a[1] + (b[1] - a[1]) * u - 7 - hop).toFixed(1));
      W.requestAnimationFrame(f);
    }
    if (T.reduced) { var l = pts[pts.length - 1]; ball.setAttribute('cx', l[0]); ball.setAttribute('cy', l[1] - 7); climbing = false; }
    else W.requestAnimationFrame(f);
  }
  left.querySelector('.stw-go').addEventListener('click', walk);
  q('.stw-rise').addEventListener('input', function (e) { st.rise = +e.target.value; update(); });
  q('.stw-max').addEventListener('input', function (e) { st.max = +e.target.value; update(); });
  q('.stw-tread').addEventListener('input', function (e) { st.tread = +e.target.value; update(); });
  update();
})(window, document);
