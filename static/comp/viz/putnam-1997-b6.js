/* Our own diagram for the Putnam solutions guide: a four-piece dissection of the 3-4-5 triangle (1997 B6). */
(window.CompViz = window.CompViz || {})['putnam-1997-b6'] = function (el, api) {
  var W = 640, H = 320, ARIA = 'The 3-4-5 triangle cut into four colored pieces: triangles at the two acute corners, a quadrilateral at the right angle, and a middle pentagon. A second view marks five points pairwise at least 25 over 13 apart.';
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
  var mode = 0, u = 6.6, X0 = 40, Y0 = 300;
  function P(a, b) { return [X0 + u * a, Y0 - u * b]; }
  var V = { A: [52, 0], B: [0, 39], C: [0, 0], P: [27, 0], Q: [20, 24], W: [32, 15], X: [0, 14], Y: [13, 0], Z: [12, 20] };
  var PIECES = [['A', 'P', 'W'], ['B', 'Q', 'X'], ['C', 'Y', 'Z', 'X'], ['Y', 'P', 'W', 'Q', 'Z']];
  var FIVE = ['A', 'B', 'C', 'P', 'Q'];
  function pt(n) { return P(V[n][0], V[n][1]); }
  function draw() {
    var c = api.colors(), fills = [c.blueSoft, c.purpleSoft, c.orangeSoft, c.tealSoft], s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    if (mode !== 1) PIECES.forEach(function (pc, i) { s += '<path d="M' + pc.map(function (n) { return pt(n).map(f1).join(' '); }).join('L') + 'Z" fill="' + fills[i] + '" stroke="' + c.ink + '" stroke-width="1.2"/>'; });
    s += '<path d="M' + pt('C').join(' ') + 'L' + pt('A').join(' ') + 'L' + pt('B').join(' ') + 'Z" fill="none" stroke="' + c.green + '" stroke-width="2.5"/>';
    if (mode !== 0) {
      [['A', 'P'], ['B', 'Q'], ['P', 'Q']].forEach(function (e) { var a = pt(e[0]), b = pt(e[1]); s += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + c.red + '" stroke-width="2.2" stroke-dasharray="6 4"/>'; });
      FIVE.forEach(function (n) { var p = pt(n); s += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="6" fill="' + c.red + '"/>'; });
    }
    svg.innerHTML = s;
    var off = { A: [10, 10], B: [-12, 0], C: [-12, 10], P: [0, 16], Q: [12, -10], W: [14, -6], X: [-12, 0], Y: [0, 16], Z: [-12, -10] };
    Object.keys(V).forEach(function (n) { var p = pt(n), show = mode !== 1 || FIVE.indexOf(n) >= 0; L('v' + n, p[0] + off[n][0], p[1] + off[n][1], show ? n : '', c.ink, 'c'); });
    L('f1', 400, 60, '\\text{unit} = \\tfrac1{13}', c.muted, 'l');
    L('f2', 400, 105, '|AP|=|BQ|=|PQ|=25', c.red, 'l');
    L('f3', 400, 150, '|PQ|^2 = 7^2+24^2', c.ink, 'l');
    L('f4', 400, 205, '\\text{every piece: diameter} \\le 25', c.ink, 'l');
    L('f5', 400, 250, '\\Rightarrow\\ \\text{least diameter } \\tfrac{25}{13}', c.green, 'l');
    cap.textContent = ['The four pieces: corner triangles at A and B, a corner piece at C, and a middle pentagon. Each has diameter at most 25/13.', 'Five points pairwise at least 25/13 apart (red): with four pieces, two of them must share one.', 'Both together: where two red points share a piece (A and P, B and Q, P and Q), they are exactly 25/13 apart, so the bound is sharp.'][mode];
  }
  btn('Pieces', function () { mode = 0; draw(); });
  btn('Five points', function () { mode = 1; draw(); });
  btn('Both', function () { mode = 2; draw(); });
  api.onTheme(draw); draw();
};
