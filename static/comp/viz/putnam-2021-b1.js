/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2021-b1. */
(window.CompViz = window.CompViz || {})['putnam-2021-b1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; var th = 0.35, sp = 0.25, AV = 2 - 6 / M.PI;
  V.aria = 'Rotated unit squares centered at the grid corners. Gold patches show where neighboring squares overlap; their area per cell equals the chance that a dropped square misses every corner. A graph plots that chance against the angle.';
  function pr(t) { return 2 * (1 - M.cos(t)) * (1 - M.sin(t)); }
  V.reset = function () { th = 0.02; };
  V.advance = function (dt) { th += dt * sp; if (th >= M.PI / 2 - 0.02) { th = M.PI / 2 - 0.02; return false; } };
  V.done = function () { return th >= M.PI / 2 - 0.021; };
  V.step = function () { th += 0.12; if (th > M.PI / 2 - 0.02) th = 0.02; };
  V.final = function () { th = 0.5; };
  V.draw = function (c, L) {
    var S = 78, ox = 40, oy = 40, co = M.cos(th), si = M.sin(th), s = '';
    function P(x, y) { return [ox + x * S, oy + y * S]; }
    function rot(u, v, cx, cy) { return P(cx + co * u - si * v, cy + si * u + co * v); }
    var i, j;
    s += '<g>';
    for (i = 0; i <= 3; i++) s += ln(ox + i * S, oy, ox + i * S, oy + 3 * S, c.grid, 1) + ln(ox, oy + i * S, ox + 3 * S, oy + i * S, c.grid, 1);
    var clip = '<clipPath id="b1c"><rect x="' + ox + '" y="' + oy + '" width="' + 3 * S + '" height="' + 3 * S + '"/></clipPath>';
    s += clip + '<g clip-path="url(#b1c)">';
    for (i = -1; i <= 4; i++) for (j = -1; j <= 4; j++) {
      s += pa(poly([rot(-.5, -.5, i, j), rot(.5, -.5, i, j), rot(.5, .5, i, j), rot(-.5, .5, i, j)], 1), c.blue, 1.4, c.blueSoft || c.blue, '', 0.25);
    }
    for (i = -1; i <= 4; i++) for (j = -1; j <= 4; j++) {
      [[1, 0], [0, 1]].forEach(function (d) {
        var a = co * d[0] + si * d[1], b = -si * d[0] + co * d[1];
        var x0 = M.max(-.5, a - .5), x1 = M.min(.5, a + .5), y0 = M.max(-.5, b - .5), y1 = M.min(.5, b + .5);
        if (x1 > x0 && y1 > y0) s += pa(poly([rot(x0, y0, i, j), rot(x1, y0, i, j), rot(x1, y1, i, j), rot(x0, y1, i, j)], 1), c.gold, 1, c.gold, '', 0.85);
      });
    }
    s += '</g>';
    for (i = 0; i <= 3; i++) for (j = 0; j <= 3; j++) s += ci(ox + i * S, oy + j * S, 3, c.ink);
    s += '</g>';
    var x0 = 330, y0 = 40, w = 280, h = 200, top = 0.45, k, pts = [];
    s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.5) + ln(x0, y0, x0, y0 + h, c.axis, 1.5);
    for (k = 0; k <= 60; k++) { var t = k / 60 * M.PI / 2; pts.push([x0 + t / (M.PI / 2) * w, y0 + h - pr(t) / top * h]); }
    s += pa(poly(pts), c.green, 2.5);
    var ya = y0 + h - AV / top * h; s += ln(x0, ya, x0 + w, ya, c.gold, 1.5, '6 4');
    var mx = x0 + th / (M.PI / 2) * w, my = y0 + h - pr(th) / top * h;
    s += ln(mx, y0 + h, mx, my, c.muted, 1, '3 3') + ci(mx, my, 6, c.orange);
    s += tx(x0, y0 + h + 22, '0', c.muted, 15) + tx(x0 + w, y0 + h + 22, '90°', c.muted, 15);
    L('f', x0 + 8, y0 - 18, 'p(\\theta)=2(1-\\cos\\theta)(1-\\sin\\theta)', c.green, 'l');
    L('a', x0 + w, ya - 14, '\\text{average } 2-\\tfrac{6}{\\pi}\\approx0.090', c.gold, 'r');
    L('t', 40, 300, '\\theta=' + (th * 180 / M.PI).toFixed(0) + '^\\circ,\\ \\ p=' + pr(th).toFixed(3), c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'Blue: the turned square placed at every corner. A dropped square misses all corners exactly when its center avoids the blue. Gold: overlaps of neighbors, whose total area per cell is the chance of missing.'; };
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
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {}, lbg = 'transparent', seen = {};
  function L(key, x, y, s, col, an) {
    seen[key] = 1;
    var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var playing = false, last = 0;
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
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
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
