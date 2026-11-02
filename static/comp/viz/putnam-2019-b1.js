/* Our own diagram for the Putnam solutions guide: the squares among points on circles x^2 + y^2 = 2^k. */
(window.CompViz = window.CompViz || {})['putnam-2019-b1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'Lattice points on the circles of radius squared 1, 2, 4, 8, 16 together with the origin. One square at a time is highlighted: first the square formed by each circle, then the squares with a corner at the origin. A counter shows the total 5n + 1.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  function circlePts(k) { var h = M.pow(2, M.floor(k / 2)); return k % 2 ? [[h, h], [-h, h], [-h, -h], [h, -h]] : [[h, 0], [0, h], [-h, 0], [0, -h]]; }
  var n = 4, sq = [], idx = -1;
  function build() {
    sq = []; var k;
    for (k = 0; k <= n; k++) sq.push({ v: circlePts(k), t: 'circle ' + k });
    for (k = 0; k < n; k++) circlePts(k).forEach(function (p) { sq.push({ v: [[0, 0], p, [p[0] - p[1], p[1] + p[0]], [-p[1], p[0]]], t: 'corner' }); });
  }
  function draw() {
    var c = api.colors(), cx = 165, cy = 165, u = 34, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', k;
    for (k = 0; k <= n; k++) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (u * M.sqrt(M.pow(2, k))).toFixed(1) + '" fill="none" stroke="' + c.grid + '" stroke-width="1.5"/>';
    if (idx >= 0) {
      var q = sq[idx], d = q.v.map(function (p, i) { return (i ? 'L' : 'M') + (cx + u * p[0]) + ' ' + (cy - u * p[1]); }).join('') + 'Z';
      s += '<path d="' + d + '" fill="' + (q.t === 'corner' ? c.goldSoft : c.greenSoft) + '" stroke="' + (q.t === 'corner' ? c.gold : c.green) + '" stroke-width="2.5"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + c.red + '"/>';
    for (k = 0; k <= n; k++) circlePts(k).forEach(function (p) { s += '<circle cx="' + (cx + u * p[0]) + '" cy="' + (cy - u * p[1]) + '" r="4.5" fill="' + c.ink + '"/>'; });
    svg.innerHTML = s;
    var circ = n + 1, corner = 4 * n;
    L('a', 360, 40, 'P_' + n + ':\\ ' + (4 * (n + 1) + 1) + '\\text{ points}', c.ink, 'l');
    L('b', 360, 80, '\\text{circle squares: } n+1 = ' + circ, c.green, 'l');
    L('c', 360, 115, '\\text{corner at } 0:\\ 4n = ' + corner, c.gold, 'l');
    L('d', 360, 155, '\\text{total } 5n+1 = ' + (5 * n + 1), c.ink, 'l');
    L('e', 360, 210, 'N_1+N_3 = N_2+N_4', c.muted, 'l');
    cap.textContent = idx < 0 ? 'Each circle has exactly 4 lattice points. Press Play or Step to see the ' + (5 * n + 1) + ' squares one by one.'
      : 'Square ' + (idx + 1) + ' of ' + sq.length + (sq[idx].t === 'corner' ? ': a corner at the origin.' : ': the four points of one circle.');
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); idx = (idx + 1) % sq.length; draw(); }, 700);
  });
  btn('Step', function () { stop(); idx = (idx + 1) % sq.length; draw(); });
  [2, 3, 4].forEach(function (m) { btn('n = ' + m, function () { stop(); n = m; build(); idx = -1; draw(); }); });
  build(); api.onTheme(draw); draw();
};
