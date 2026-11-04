/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1985-b4. */
(window.CompViz = window.CompViz || {})['putnam-1985-b4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; V.crop = 320;
  V.aria = 'A unit circle with a point p moving around it. For each position of p, the rectangle of good inside points, with corners on the circle, is shaded. A random inside point q is drawn with the rectangle whose diagonal is pq, green when it stays inside the circle and red when it pokes out. A running simulation estimates the probability, which approaches 4 over pi squared.';
  var th, q, tri, hit, acc, qa;
  function rnd() { var r = M.sqrt(M.random()), a = M.random() * 2 * M.PI; return [r * M.cos(a), r * M.sin(a)]; }
  function good(t, z) { return M.abs(z[0]) <= M.abs(M.cos(t)) && M.abs(z[1]) <= M.abs(M.sin(t)); }
  function trials(k) { for (var i = 0; i < k; i++) { var t = M.random() * 2 * M.PI; tri++; if (good(t, rnd())) hit++; } }
  V.reset = function () { th = 0.6; q = [0.3, -0.2]; tri = 0; hit = 0; acc = 0; qa = 0; };
  V.step = function () { th += M.PI / 12; q = rnd(); trials(2000); };
  V.advance = function (dt) { th += dt * 0.5; qa += dt; if (qa > 0.7) { qa = 0; q = rnd(); } trials(150); if (tri > 60000) return false; };
  V.done = function () { return tri > 60000; };
  V.final = function () { th = 0.75; q = [0.35, 0.25]; trials(60000); };
  V.draw = function (c, L) {
    var s = '', cx = 165, cy = 160, R = 130;
    function X(u) { return cx + R * u; } function Y(v) { return cy - R * v; }
    var a = M.abs(M.cos(th)), b = M.abs(M.sin(th)), p = [M.cos(th), M.sin(th)];
    s += ln(cx - R - 12, cy, cx + R + 12, cy, c.grid, 1) + ln(cx, cy - R - 12, cx, cy + R + 12, c.grid, 1);
    s += pa('M' + f1(X(-a)) + ' ' + f1(Y(b)) + 'H' + f1(X(a)) + 'V' + f1(Y(-b)) + 'H' + f1(X(-a)) + 'Z', c.green, 1.5, c.greenSoft);
    s += ci(cx, cy, R, null, c.ink, 2);
    var ok = good(th, q), col = ok ? c.green : c.red;
    s += pa('M' + f1(X(p[0])) + ' ' + f1(Y(p[1])) + 'H' + f1(X(q[0])) + 'V' + f1(Y(q[1])) + 'H' + f1(X(p[0])) + 'Z', col, 2.5, ok ? 'none' : c.redSoft);
    s += ln(X(p[0]), Y(p[1]), X(q[0]), Y(q[1]), col, 1.5, '4 3');
    s += ci(X(p[0]), Y(p[1]), 7, c.gold) + ci(X(q[0]), Y(q[1]), 6, c.blue);
    s += tx(X(p[0] * 1.13), Y(p[1] * 1.13) + 5, 'p', c.gold, 17) + tx(X(q[0]) + 13, Y(q[1]) - 9, 'q', c.blue, 17);
    var est = tri ? (hit / tri).toFixed(4) : '—';
    L('a', 330, 40, 'p=(\\cos\\theta,\\sin\\theta)', c.gold, 'l');
    L('b', 330, 80, '\\text{good } q:\\ |u|\\le|\\cos\\theta|,\\ |v|\\le|\\sin\\theta|', c.green, 'l');
    L('c', 330, 125, '\\text{area}=4|\\cos\\theta\\sin\\theta|=2|\\sin 2\\theta|', c.ink, 'l');
    L('d', 330, 172, 'P=\\frac{1}{\\pi}\\cdot 2\\cdot\\frac{2}{\\pi}=\\frac{4}{\\pi^2}\\approx 0.4053', c.ink, 'l');
    L('e', 330, 225, '\\text{simulated: } ' + est, c.muted, 'l');
    L('f', 330, 255, '\\text{trials: } ' + tri, c.muted, 'l');
    return s;
  };
  V.cap = function () { return 'Shaded: the inside points q that work for this p. The rectangle on diagonal pq is ' + (good(th, q) ? 'inside the circle.' : 'poking out of the circle.'); };
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
