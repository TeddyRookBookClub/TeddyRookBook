/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1990-a3. */
(window.CompViz = window.CompViz || {})['putnam-1990-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; V.crop = 280;
  V.aria = 'A convex lattice pentagon on a grid, with each vertex colored by the parities of its coordinates. Two vertices of the same color lie on one side, so their midpoint is a lattice point on that side; cutting off a corner there gives a smaller pentagon. In the smaller pentagon, two same-colored vertices are joined by a diagonal, and the midpoint of that diagonal is a lattice point strictly inside. Pick\'s theorem then gives area at least 5/2.';
  var st, acc, P0 = [[0, 1], [1, 0], [2, 2], [2, 4], [1, 3]], P1 = [[0, 1], [1, 0], [2, 3], [2, 4], [1, 3]];
  V.reset = function () { st = 0; acc = 0; };
  V.step = function () { if (st < 4) st++; };
  V.advance = function (dt) { acc += dt; if (acc > 2) { acc = 0; V.step(); } if (st >= 4) return false; };
  V.done = function () { return st >= 4; };
  V.final = function () { st = 4; };
  V.draw = function (c, L) {
    var s = '', u = 52, ox = 70, oy = 285, pc = [c.green, c.blue, c.red, c.gold];
    function X(p) { return ox + u * p[0]; } function Y(p) { return oy - u * p[1]; }
    function pc4(p) { return pc[(p[0] & 1) * 2 + (p[1] & 1)]; }
    var x, y;
    for (x = -1; x <= 3; x++) s += ln(X([x, 0]), Y([0, -0.4]), X([x, 0]), Y([0, 4.4]), c.grid, 1);
    for (y = 0; y <= 4; y++) s += ln(X([-1.4, 0]), Y([0, y]), X([3.4, 0]), Y([0, y]), c.grid, 1);
    function poly(P) { return P.map(function (p, i) { return (i ? 'L' : 'M') + X(p) + ' ' + Y(p); }).join('') + 'Z'; }
    var P = st >= 2 ? P1 : P0;
    if (st >= 2) s += pa(poly([[1, 0], [2, 2], [2, 3]]), c.red, 1.5, c.redSoft, '4 3');
    s += pa(poly(P), c.ink, 2.5, c.greenSoft);
    if (st === 1) s += ln(X([2, 2]), Y([2, 2]), X([2, 4]), Y([2, 4]), c.gold, 5);
    if (st >= 3) s += ln(X([0, 1]), Y([0, 1]), X([2, 3]), Y([2, 3]), c.blue, 3, '6 4');
    P.forEach(function (p) { s += ci(X(p), Y(p), 8, pc4(p), c.ink, 1.5); });
    if (st === 1) s += ci(X([2, 3]), Y([2, 3]), 6, c.ink);
    if (st >= 3) s += ci(X([1, 2]), Y([1, 2]), 11, null, c.gold, 3) + ci(X([1, 2]), Y([1, 2]), 3.5, c.gold);
    L('a', 330, 36, '\\text{4 parity types for } (x \\bmod 2,\\ y\\bmod 2)', c.ink, 'l');
    L('b', 330, 72, '5\\text{ vertices}\\ \\Rightarrow\\ \\text{two share a type}', c.ink, 'l');
    var msg = ['\\text{vertices colored by type}', '\\text{same type on a side}', '\\text{cut off a corner}', '\\text{same type on a diagonal}', 'A=I+\\tfrac B2-1\\ \\ge\\ 1+\\tfrac52-1=\\tfrac52'];
    L('c', 330, 130, msg[st], st === 4 ? c.gold : c.green, 'l');
    L('d', 330, 180, ['', '\\text{midpoint } (2,3) \\text{ is on the side}', '\\text{a smaller lattice pentagon}', '\\text{midpoint } (1,2) \\text{ is inside}', '\\text{interior point } (1,2)'][st], st >= 3 ? c.gold : c.muted, 'l');
    L('e', 330, 230, st >= 4 ? '\\text{by Pick’s theorem, with } B\\ge5' : '', c.muted, 'l');
    return s;
  };
  V.cap = function () { return ['Vertex colors show the parity of the coordinates.', 'The two vertices joined in gold share a type; their midpoint is a lattice point.', 'Cutting off the shaded corner leaves a smaller convex lattice pentagon.', 'Now the matching pair is joined by a diagonal, so the midpoint is strictly inside.', 'With an interior lattice point, Pick\'s theorem gives area at least 5/2.'][st]; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
  function pa(d, k, w, f, da, op) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + (op ? ' fill-opacity="' + op + '"' : '') + ' stroke-linejoin="round"/>'; }
  function tx(x, y, s, k, sz, an) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 16) + '" text-anchor="' + (an || 'middle') + '" font-family="system-ui,sans-serif">' + s + '</text>'; }
  function poly(p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); }
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + V.H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', V.aria); svg.style.display = 'block'; svg.style.borderRadius = '8px';
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var leg = D.createElement('div'); leg.style.cssText = 'display:none;margin-top:6px;font-size:15px;line-height:1.6'; el.appendChild(leg);
  var VW = W, nar = false;
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {}, lbg = 'transparent', seen = {};
  function L(key, x, y, s, col, an) {
    seen[key] = 1;
    var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; }
    var par = nar ? leg : lay; if (o.d.parentNode !== par) par.appendChild(o.d);
    if (nar) o.d.style.cssText = 'overflow-x:auto;overflow-y:hidden;padding:1px 0;color:' + (col || 'inherit') + (s ? '' : ';display:none');
    else o.d.style.cssText = 'position:absolute;left:' + (x / VW * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var playing = false, last = 0;
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
    nar = !!V.crop && box.clientWidth > 0 && box.clientWidth < 520; VW = nar ? V.crop : W;
    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + V.H); leg.style.display = nar ? 'block' : 'none';
    svg.innerHTML = '<rect x="0" y="0" width="' + W + '" height="' + V.H + '" fill="' + c.panel + '"/>' + V.draw(c, L);
    for (var k in labs) if (!seen[k]) L(k, 0, 0, '');
    cap.textContent = V.cap ? V.cap() : '';
  }
  function frame(ts) {
    if (!playing) return;
    if (!el.isConnected) { playing = false; return; }
    var dt = last ? M.min(0.1, (ts - last) / 1000) : 0; last = ts;
    if (V.advance(dt) === false) stop();
    if (el.offsetParent !== null) render();
    if (playing) requestAnimationFrame(frame);
  }
  function play() { if (playing) return; if (V.done && V.done()) V.reset(); playing = true; last = 0; pb.textContent = 'Pause'; requestAnimationFrame(frame); }
  function stop() { playing = false; if (pb) pb.textContent = 'Play'; }
  var pb = V.advance ? btn('Play', function () { if (playing) stop(); else play(); }) : null;
  if (V.step) btn('Step', function () { stop(); V.step(); render(); });
  if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  window.addEventListener('resize', function () { if (el.isConnected && !playing) render(); });
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
