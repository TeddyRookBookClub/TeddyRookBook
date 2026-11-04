/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1989-b1. */
(window.CompViz = window.CompViz || {})['putnam-1989-b1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; V.crop = 315;
  V.aria = 'A square target with the region of points nearer the center than any edge shaded. Its boundary is made of four parabola arcs. Random darts land on the target, green inside the region and red outside, and a running estimate approaches (4 root 2 minus 5) over 3, about 0.219.';
  var darts, hit, tot, acc;
  function inR(x, y) { return M.hypot(x, y) < 1 - M.max(M.abs(x), M.abs(y)); }
  function throwN(k) { for (var i = 0; i < k; i++) { var x = 2 * M.random() - 1, y = 2 * M.random() - 1, h = inR(x, y); tot++; if (h) hit++; if (darts.length < 900) darts.push([x, y, h]); } }
  V.reset = function () { darts = []; hit = 0; tot = 0; acc = 0; };
  V.step = function () { throwN(100); };
  V.advance = function (dt) { acc += dt; if (acc > 0.05) { acc = 0; throwN(darts.length < 900 ? 6 : 400); } if (tot > 80000) return false; };
  V.done = function () { return tot > 80000; };
  V.final = function () { throwN(80000); };
  V.draw = function (c, L) {
    var s = '', cx = 160, cy = 160, R = 140, d = '';
    function X(u) { return cx + R * u; } function Y(v) { return cy - R * v; }
    s += '<rect x="' + X(-1) + '" y="' + Y(1) + '" width="' + 2 * R + '" height="' + 2 * R + '" fill="none" stroke="' + c.ink + '" stroke-width="2.5"/>';
    for (var i = 0; i <= 240; i++) { var a = i / 240 * 2 * M.PI, m = M.max(M.abs(M.cos(a)), M.abs(M.sin(a))), r = 1 / (1 + m); d += (i ? 'L' : 'M') + f1(X(r * M.cos(a))) + ' ' + f1(Y(r * M.sin(a))); }
    s += pa(d + 'Z', c.green, 2.5, c.greenSoft);
    s += ln(X(-1), Y(-1), X(1), Y(1), c.grid, 1, '4 4') + ln(X(-1), Y(1), X(1), Y(-1), c.grid, 1, '4 4');
    darts.forEach(function (p) { s += ci(X(p[0]), Y(p[1]), 2.2, p[2] ? c.green : c.red); });
    s += ci(cx, cy, 4, c.gold);
    var e = M.SQRT2 - 1; s += ci(X(e), Y(e), 4, c.ink);
    L('a', 330, 40, '|OP|<1-x\\iff y^2<1-2x', c.ink, 'l');
    L('b', 330, 80, '\\text{corner of region: } x=y=\\sqrt2-1', c.muted, 'l');
    L('c', 330, 125, 'P=\\frac{4\\sqrt2-5}{3}\\approx0.2190', c.gold, 'l');
    L('d', 330, 175, '\\text{darts: } ' + tot, c.muted, 'l');
    L('e', 330, 205, '\\text{fraction inside: } ' + (tot ? (hit / tot).toFixed(4) : '—'), c.green, 'l');
    return s;
  };
  V.cap = function () { return 'The shaded region is bounded by four parabolas, one for each edge. Only the first 900 darts are drawn.'; };
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
