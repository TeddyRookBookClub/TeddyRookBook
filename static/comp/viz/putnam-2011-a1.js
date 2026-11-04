/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2011-a1. */
(window.CompViz = window.CompViz || {})['putnam-2011-a1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 330; var N = 12, T = [[3, 7], [9, 10], [5, 4], [12, 4], [7, 9], [1, 2], [10, 5]], ti = 0;
  V.aria = 'A 13 by 13 grid of lattice points from 0 to 12. Green points are possible spiral endpoints, red points are not. One spiral at a time is drawn to a green point: two segments when y is greater than x, otherwise six segments.';
  function ok(x, y) { return (y > x && x >= 1) || (x >= 3 && y >= 4); }
  function lens(x, y) { if (y > x && x >= 1) return [x, y]; var l4 = y > x ? 4 : x + 1; return [1, 2, 3, l4, x + 2, l4 + y - 2]; }
  V.reset = function () { ti = 0; };
  V.step = function () { ti = (ti + 1) % T.length; };
  var acc = 0;
  V.advance = function (dt) { acc += dt; if (acc > 2.2) { acc = 0; V.step(); } };
  V.draw = function (c, L) {
    var s = '', u = 10.5, ox = 70, oy = 152, x, y, bad = 0;
    function X(a) { return ox + a * u; } function Y(b) { return oy - b * u; }
    s += ln(X(-5), Y(0), X(14), Y(0), c.axis, 1) + ln(X(0), Y(-14), X(0), Y(13.5), c.axis, 1);
    for (x = 0; x <= N; x++) for (y = 0; y <= N; y++) { var g = ok(x, y); if (!g) bad++; s += ci(X(x), Y(y), 2.8, g ? c.green : c.red); }
    var t = T[ti], l = lens(t[0], t[1]), d = [[1, 0], [0, 1], [-1, 0], [0, -1]], p = [0, 0], q = [[X(0), Y(0)]];
    l.forEach(function (len, i) { p = [p[0] + d[i % 4][0] * len, p[1] + d[i % 4][1] * len]; q.push([X(p[0]), Y(p[1])]); });
    s += pa(poly(q), c.blue, 2.5) + ci(X(t[0]), Y(t[1]), 6, 'none', c.gold, 3) + ci(X(0), Y(0), 4, c.ink);
    L('a', 300, 40, '\\text{lengths } ' + l.join(' < '), c.blue, 'l');
    L('b', 300, 80, '\\text{end } (' + t[0] + ',' + t[1] + ')', c.gold, 'l');
    L('c', 300, 130, 'x=\\ell_1-\\ell_3+\\ell_5-\\cdots', c.ink, 'l');
    L('d', 300, 165, 'y=\\ell_2-\\ell_4+\\ell_6-\\cdots', c.ink, 'l');
    L('e', 300, 215, '\\text{reachable: } y>x\\ge1\\ \\text{or}\\ x\\ge3,\\,y\\ge4', c.green, 'l');
    L('f', 300, 255, '\\text{not reachable here: } ' + bad + '=5\\cdot' + N + '-2', c.red, 'l');
    return s;
  };
  V.cap = function () { return 'Green: endpoints of some growing spiral. Red: impossible endpoints (shown for a 12 by 12 box). The blue spiral ends at the gold circle.'; };
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
