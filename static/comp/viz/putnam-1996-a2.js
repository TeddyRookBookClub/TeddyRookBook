/* Our own diagram for the Putnam solutions guide: midpoints filling an annulus (1996 A2). */
(window.CompViz = window.CompViz || {})['putnam-1996-a2'] = function (el, api) {
  var W = 640, H = 300, ARIA = 'A small circle and a big circle. A point X moves on the small one and Y on the big one; their midpoint M leaves a trail that fills a ring with radii 1 and 2 around the middle of the two centers.';
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block'; svg.setAttribute('aria-label', ARIA);
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  function btn(tt, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = tt; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  function f1(v) { return (+v).toFixed(1); }
  var t = 0, timer = 0, pb, trail = [];
  var O1 = [55, 150], O2 = [255, 150], k = 20;
  function pos(tt) {
    var a = 1.7 * tt, b = 0.53 * tt + 1;
    var X = [O1[0] + k * M.cos(a), O1[1] - k * M.sin(a)], Y = [O2[0] + 3 * k * M.cos(b), O2[1] - 3 * k * M.sin(b)];
    return [X, Y, [(X[0] + Y[0]) / 2, (X[1] + Y[1]) / 2]];
  }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', m = [(O1[0] + O2[0]) / 2, O1[1]];
    s += '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="' + 2 * k + '" fill="' + c.greenSoft + '" stroke="' + c.green + '" stroke-dasharray="4 4"/><circle cx="' + m[0] + '" cy="' + m[1] + '" r="' + k + '" fill="' + c.panel + '" stroke="' + c.green + '" stroke-dasharray="4 4"/>';
    s += '<circle cx="' + O1[0] + '" cy="' + O1[1] + '" r="' + k + '" fill="none" stroke="' + c.blue + '" stroke-width="2"/><circle cx="' + O2[0] + '" cy="' + O2[1] + '" r="' + 3 * k + '" fill="none" stroke="' + c.purple + '" stroke-width="2"/>';
    trail.forEach(function (p) { s += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="1.4" fill="' + c.green + '"/>'; });
    var q = pos(t);
    s += '<line x1="' + f1(q[0][0]) + '" y1="' + f1(q[0][1]) + '" x2="' + f1(q[1][0]) + '" y2="' + f1(q[1][1]) + '" stroke="' + c.gold + '" stroke-width="2"/>';
    s += '<circle cx="' + f1(q[0][0]) + '" cy="' + f1(q[0][1]) + '" r="5" fill="' + c.blue + '"/><circle cx="' + f1(q[1][0]) + '" cy="' + f1(q[1][1]) + '" r="5" fill="' + c.purple + '"/><circle cx="' + f1(q[2][0]) + '" cy="' + f1(q[2][1]) + '" r="6" fill="' + c.red + '" stroke="' + c.ink + '"/>';
    s += '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="3" fill="' + c.ink + '"/>';
    svg.innerHTML = s;
    L('x', q[0][0], q[0][1] - 14, 'X', c.blue, 'c'); L('y', q[1][0], q[1][1] - 14, 'Y', c.purple, 'c'); L('m', q[2][0] + 10, q[2][1] + 12, 'M', c.red, 'l');
    L('f0', 350, 50, 'C=\\tfrac{O_1+O_2}{2},\\ |O_1O_2|=10', c.ink, 'l');
    L('f1', 350, 100, 'M=C+\\tfrac{u+3v}{2}', c.ink, 'l');
    L('f2', 350, 150, '2\\le |u+3v| \\le 4', c.ink, 'l');
    L('f3', 350, 200, '1\\le |M-C|\\le 2', c.green, 'l');
    cap.textContent = 'X runs around the small circle and Y around the big one at different speeds. Their midpoint M (red) leaves a trail that fills the ring between radius 1 and 2 around the midpoint C of the two centers.';
  }
  function stepT() { t += 0.06; trail.push(pos(t)[2]); if (trail.length > 1500) trail.shift(); draw(); }
  function stop() { clearInterval(timer); timer = 0; if (pb) pb.textContent = 'Play'; }
  if (api.reduced()) { for (var i = 0; i < 1200; i++) { t += 0.06; trail.push(pos(t)[2]); } }
  else pb = btn('Play', function () { if (timer) return stop(); pb.textContent = 'Pause'; timer = setInterval(function () { if (!el.isConnected) return stop(); stepT(); }, 40); });
  btn('Step', function () { stop(); for (var i = 0; i < 20; i++) { t += 0.06; trail.push(pos(t)[2]); } draw(); });
  btn('Clear trail', function () { trail = []; draw(); });
  api.onTheme(draw); draw();
};
