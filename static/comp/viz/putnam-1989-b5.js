/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1989-b5. */
(window.CompViz = window.CompViz || {})['putnam-1989-b5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; V.crop = 320;
  V.aria = 'An isosceles trapezoid inscribed in the unit circle with its two diagonals meeting at E and the segment from the center O to E. The shape changes over time, and the readout shows the ratio (s1 minus s2) over d, which equals plus or minus 2 sin(alpha minus beta) and reaches 2 when the diagonals are perpendicular.';
  var t, fixed;
  V.reset = function () { t = 0; fixed = false; };
  V.advance = function (dt) { if (!fixed) t += dt * 0.45; };
  V.step = function () { fixed = false; t += 0.5; };
  V.final = function () { fixed = true; };
  V.buttons = [['Perpendicular', function () { fixed = true; }]];
  function ang() { return fixed ? [2 * M.PI / 3, M.PI / 6] : [2.05 + 0.45 * M.sin(t), 0.55 + 0.35 * M.sin(0.73 * t + 1)]; }
  V.draw = function (c, L) {
    var s = '', cx = 160, cy = 160, R = 135, ab = ang(), al = ab[0], be = ab[1];
    function P(x, y) { return [cx + R * x, cy - R * y]; }
    var A = P(-M.sin(al), M.cos(al)), B = P(M.sin(al), M.cos(al)), C = P(M.sin(be), M.cos(be)), D = P(-M.sin(be), M.cos(be));
    var e = M.sin(al + be) / (M.sin(al) + M.sin(be)), E = P(0, e);
    s += ci(cx, cy, R, null, c.muted, 1.5);
    s += pa('M' + A.map(f1).join(' ') + 'L' + B.map(f1).join(' ') + 'L' + C.map(f1).join(' ') + 'L' + D.map(f1).join(' ') + 'Z', c.ink, 2.5, c.greenSoft);
    s += ln(A[0], A[1], C[0], C[1], c.blue, 2) + ln(B[0], B[1], D[0], D[1], c.blue, 2);
    s += ln(cx, cy, E[0], E[1], c.red, 3.5);
    s += ln(A[0], A[1], B[0], B[1], c.green, 4) + ln(C[0], C[1], D[0], D[1], c.gold, 4);
    s += ci(cx, cy, 4.5, c.ink) + ci(E[0], E[1], 5, c.red);
    s += tx(cx - 12, cy + 5, 'O', c.ink, 14, 'end') + tx(E[0] + 10, E[1] - 6, 'E', c.red, 15, 'start');
    [[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D']].forEach(function (q) { s += tx(cx + (q[0][0] - cx) * 1.12, cy + (q[0][1] - cy) * 1.12 + 5, q[1], c.ink, 15); });
    var s1 = 2 * M.sin(al), s2 = 2 * M.sin(be), d = M.abs(e), deg = M.abs(al - be) * 180 / M.PI; if (deg > 90) deg = 180 - deg;
    L('a', 335, 36, 's_1=2\\sin\\alpha=' + s1.toFixed(3), c.green, 'l');
    L('b', 335, 70, 's_2=2\\sin\\beta=' + s2.toFixed(3), c.gold, 'l');
    L('c', 335, 104, 'd=|OE|=' + d.toFixed(3), c.red, 'l');
    L('d', 335, 150, d < 0.01 ? '\\text{(here } d\\approx0)' : '\\frac{s_1-s_2}{d}=' + ((s1 - s2) / d).toFixed(3), c.ink, 'l');
    L('e', 335, 200, '=\\pm2\\sin(\\alpha-\\beta)\\le2', c.ink, 'l');
    L('f', 335, 245, '\\text{angle between diagonals: } ' + deg.toFixed(1) + '^\\circ', c.blue, 'l');
    return s;
  };
  V.cap = function () { return fixed ? 'Perpendicular diagonals: the ratio is exactly 2.' : 'Press Perpendicular to see the case where the bound 2 is reached.'; };
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
