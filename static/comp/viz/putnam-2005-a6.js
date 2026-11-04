/* Our own diagram for the Putnam solutions guide: random inscribed polygons and their acute angles (2005 A6). */
(window.CompViz = window.CompViz || {})['putnam-2005-a6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math, TAU = 2 * M.PI;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'Random points on a circle joined into a convex polygon. Vertices with an acute angle are marked in red, and the two gaps next to such a vertex are highlighted: together they cover more than half the circle. A running count compares the share of polygons with an acute angle to n times n minus 2 over 2 to the n minus 1.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translateY(-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var n = 5, th = [], trials = 0, hits = 0;
  function sample() { var a = []; for (var i = 0; i < n; i++) a.push(M.random() * TAU); return a.sort(function (x, y) { return x - y; }); }
  function acute(a) { // indices i with gap before + gap after > pi
    var out = [], i;
    for (i = 0; i < n; i++) {
      var g1 = (a[i] - a[(i + n - 1) % n] + TAU) % TAU, g2 = (a[(i + 1) % n] - a[i] + TAU) % TAU;
      if (g1 + g2 > M.PI) out.push(i);
    }
    return out;
  }
  function one() { th = sample(); trials++; if (acute(th).length) hits++; }
  function draw() {
    var c = api.colors(), cx = 160, cy = 160, r = 130, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    function P(t) { return [cx + r * M.cos(t), cy - r * M.sin(t)]; }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + c.grid + '" stroke-width="1.5"/>';
    var ac = acute(th), i;
    ac.forEach(function (k) { // arc from previous to next vertex through k
      var a0 = th[(k + n - 1) % n], a1 = th[(k + 1) % n], span = (a1 - a0 + TAU) % TAU, p0 = P(a0), p1 = P(a1);
      s += '<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 ' + (span > M.PI ? 1 : 0) + ' 0 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" fill="none" stroke="' + c.red + '" stroke-width="6" opacity="0.45"/>';
    });
    s += '<path d="' + th.map(function (t, j) { var p = P(t); return (j ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') + 'Z" fill="' + c.greenSoft + '" stroke="' + c.green + '" stroke-width="2"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + c.muted + '"/>';
    for (i = 0; i < n; i++) { var p = P(th[i]), isA = ac.indexOf(i) >= 0; s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (isA ? 8 : 5) + '" fill="' + (isA ? c.red : c.ink) + '"/>'; }
    svg.innerHTML = s;
    var f = n * (n - 2) / M.pow(2, n - 1);
    L('a', 330, 36, 'n = ' + n + '\\text{ points}', c.ink);
    L('b', 330, 76, '\\text{acute} \\iff g_i + g_{i+1} > \\pi', c.red);
    L('c', 330, 120, '\\text{this polygon: } ' + ac.length + '\\text{ acute}', ac.length ? c.red : c.muted);
    L('d', 330, 160, '\\text{share: } ' + hits + '/' + trials, c.ink);
    L('g', 330, 188, '\\approx ' + (hits / M.max(1, trials)).toFixed(4), c.ink);
    L('e', 330, 232, '\\dfrac{n(n-2)}{2^{n-1}} = ' + f.toFixed(4), c.gold);
    cap.textContent = ac.length === 2 ? 'Two acute angles, and they are neighbors: they share a gap. That is the overlap the solution subtracts.'
      : ac.length === 1 ? 'One acute angle: the red arc (its two gaps) is longer than half the circle.' : 'No acute angle: every pair of neighboring gaps covers at most half the circle.';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  btn('New polygon', function () { one(); draw(); });
  btn('1000 more', function () { for (var k = 0; k < 1000; k++) one(); draw(); });
  [4, 5, 6, 8].forEach(function (m) { btn('n = ' + m, function () { n = m; trials = hits = 0; one(); draw(); }); });
  one(); api.onTheme(draw); draw();
};
