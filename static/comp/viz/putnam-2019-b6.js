/* Our own diagram for the Putnam solutions guide: the set x + 2y = 0 (mod 5) in the plane lattice. */
(window.CompViz = window.CompViz || {})['putnam-2019-b6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A grid of lattice points labeled by x + 2y mod 5. Points with label 0 form the set S. A chosen point and its four neighbors are highlighted: a point outside S always has exactly one neighbor in S, and a point in S has none.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var NX = 9, NY = 8, px = 4, py = 3;
  function res(x, y) { return ((x + 2 * y) % 5 + 5) % 5; }
  function draw() {
    var c = api.colors(), u = 36, x0 = 22, y0 = 18, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', x, y;
    var nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (x = 0; x < NX; x++) for (y = 0; y < NY; y++) {
      var X = x0 + x * u, Y = y0 + (NY - 1 - y) * u, r = res(x, y), inS = r === 0;
      var isP = x === px && y === py, isN = M.abs(x - px) + M.abs(y - py) === 1;
      s += '<rect x="' + X + '" y="' + Y + '" width="' + (u - 4) + '" height="' + (u - 4) + '" rx="5" fill="' + (inS ? c.green : c.bg) + '" stroke="' + (isP ? c.gold : isN ? c.blue : c.grid) + '" stroke-width="' + (isP ? 4 : isN ? 3 : 1) + '"/>';
      s += '<text x="' + (X + u / 2 - 2) + '" y="' + (Y + u / 2 + 3) + '" text-anchor="middle" font-size="14" font-family="system-ui,sans-serif" fill="' + (inS ? c.panel : c.muted) + '">' + r + '</text>';
    }
    svg.innerHTML = s;
    var r0 = res(px, py), cnt = nb.filter(function (d) { return res(px + d[0], py + d[1]) === 0; }).length;
    L('a', 362, 40, 'S:\\ x+2y \\equiv 0 \\pmod 5', c.green, 'l');
    L('b', 362, 80, '\\text{steps: } \\pm1,\\ \\pm2', c.ink, 'l');
    L('d', 362, 150, '\\text{gold: } x+2y \\equiv ' + r0, c.gold, 'l');
    L('e', 362, 185, '\\text{neighbors in } S\\text{: } ' + cnt, c.blue, 'l');
    L('f', 362, 255, '\\text{general: } \\textstyle\\sum i\\,x_i \\bmod (2n{+}1)', c.ink, 'l');
    cap.textContent = r0 === 0 ? 'The gold point is in S, and none of its four neighbors is.' : 'The gold point is not in S, and exactly one of its four neighbors is.';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function next() { px = 1 + M.floor(M.random() * (NX - 2)); py = 1 + M.floor(M.random() * (NY - 2)); draw(); }
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); next(); }, 1200);
  });
  btn('Another point', function () { stop(); next(); });
  api.onTheme(draw); draw();
};
