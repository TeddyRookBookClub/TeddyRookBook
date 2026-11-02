/* Our own visualization for the Teddy Rook Book math challenge "cm-wide-angle". */
(window.CompViz = window.CompViz || {})['cm-wide-angle'] = function (el, api) {
'use strict';
var D = document, W = 640, NS = 'http://www.w3.org/2000/svg', M = Math, V = { H: 300, aria: '' };
function f1(n) { return (+n).toFixed(1); }
function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
function rc(x, y, w, h, f, k, sw) { return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(M.max(0, w)) + '" height="' + f1(M.max(0, h)) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (sw || 1.5) + '"' : '') + '/>'; }
function pa(d, k, w, f, da) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linejoin="round"/>'; }
function tx(x, y, s, k, sz, an) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 14) + '" text-anchor="' + (an || 'middle') + '" font-family="system-ui,sans-serif">' + s + '</text>'; }
function poly(p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); }
function plot(x0, y0, w, h, xs, ys, xr, yr) { var p = []; for (var i = 0; i < xs.length; i++) p.push([x0 + (xs[i] - xr[0]) / (xr[1] - xr[0]) * w, y0 + h - (ys[i] - yr[0]) / (yr[1] - yr[0]) * h]); return poly(p); }
V.H = 300; var n = 0, hit = 0, hist = [], last = null, MAX = 4000;
V.aria = 'A circle with three random points forming a triangle, marked when it has an angle over 120 degrees. A graph shows the running fraction of such triangles settling near 1/3.';
function one() {
var a = [M.random(), M.random(), M.random()].sort(), g = [a[1] - a[0], a[2] - a[1], 1 - a[2] + a[0]];
var h = M.max(g[0], g[1], g[2]) > 2 / 3; n++; if (h) hit++; last = { a: a, h: h };
if (n <= 40 || n % 20 === 0) hist.push([n, hit / n]);
}
V.reset = function () { n = 0; hit = 0; hist = []; last = null; };
var acc = 0;
V.advance = function (dt) { acc += dt; var m = n < 30 ? (acc > 0.35 ? 1 : 0) : 12; if (m) acc = 0; for (var i = 0; i < m && n < MAX; i++) one(); if (n >= MAX) return false; };
V.step = function () { one(); };
V.final = function () { while (n < 2000) one(); };
V.done = function () { return n >= MAX; };
V.draw = function (c, L) {
var cx = 140, cy = 150, R = 110, s = ci(cx, cy, R, 'none', c.axis, 2);
if (last) {
var p = last.a.map(function (t) { return [cx + R * M.cos(2 * M.PI * t), cy - R * M.sin(2 * M.PI * t)]; });
s += pa(poly(p, 1), last.h ? c.red : c.green, 2.5, last.h ? c.redSoft : c.greenSoft);
p.forEach(function (q) { s += ci(q[0], q[1], 5, c.ink); });
}
var x0 = 300, y0 = 40, w = 320, h = 200;
s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.5) + ln(x0, y0, x0, y0 + h, c.axis, 1.5);
var yl = y0 + h - (1 / 3) / 0.7 * h; s += ln(x0, yl, x0 + w, yl, c.gold, 1.5, '6 4');
if (hist.length > 1) s += pa(plot(x0, y0, w, h, hist.map(function (q) { return M.log(q[0]); }), hist.map(function (q) { return q[1]; }), [0, M.log(MAX)], [0, 0.7]), c.blue, 2);
s += tx(x0 + w, y0 + h + 18, 'triangles (log scale)', c.muted, 12, 'end') + tx(x0 - 6, y0 + 6, '0.7', c.muted, 11, 'end') + tx(x0 - 6, y0 + h, '0', c.muted, 11, 'end');
L('third', x0 + w - 4, yl - 14, '\\tfrac13', c.gold, 'r');
L('est', x0 + 10, 272, n ? '\\text{fraction with an angle} > 120^\\circ:\\ ' + (hit / n).toFixed(3) : '', c.blue, 'l');
return s;
};
V.cap = function () { return n ? n + ' triangles so far; ' + hit + ' had an angle over 120°. Red: all three points fit in a third of the circle.' : 'Press Play to throw random triangles.'; };
el.innerHTML = '';
var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
var nar = V.split && el.clientWidth && el.clientWidth < 560, VW = nar ? V.split : W;
var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + V.H); svg.setAttribute('width', '100%');
svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', V.aria); svg.style.display = 'block'; svg.style.borderRadius = '8px';
var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
var side = D.createElement('div'); side.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:6px;font-size:15px'; if (nar) el.appendChild(side);
var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
var labs = {}, lbg = 'transparent', _seen = {};
function L(key, x, y, s, col, an) {
_seen[key] = 1;
var o = labs[key];
var sd = nar && x >= V.split;
if (!o) { o = labs[key] = { d: D.createElement('div'), s: null, sd: sd }; (sd ? side : lay).appendChild(o.d); }
if (o.sd) { o.d.style.cssText = 'color:' + (col || 'inherit') + (s ? '' : ';display:none'); }
else o.d.style.cssText = 'position:absolute;left:' + (x / VW * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
}
function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
var playing = false, _last = 0;
function render() {
var c = api.colors(); lbg = c.panel + 'd9'; _seen = {};
svg.innerHTML = rc(0, 0, W, V.H, c.panel) + V.draw(c, L);
for (var k in labs) if (!_seen[k]) L(k, 0, 0, '');
cap.textContent = V.cap ? V.cap() : '';
}
function frame(ts) {
if (!playing) return;
if (!el.isConnected) { playing = false; return; }
var dt = _last ? M.min(0.1, (ts - _last) / 1000) : 0; _last = ts;
if (V.advance(dt) === false) stop();
if (el.offsetParent !== null) render();
if (playing) requestAnimationFrame(frame);
}
function play() { if (playing) return; if (V.done && V.done()) V.reset(); playing = true; _last = 0; pb.textContent = 'Pause'; requestAnimationFrame(frame); }
function stop() { playing = false; pb.textContent = 'Play'; }
var pb = V.advance ? btn('Play', function () { if (playing) stop(); else play(); }) : { };
if (V.step) btn('Step', function () { stop(); V.step(); render(); });
if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
(V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
api.onTheme(render);
if (V.reset) V.reset();
if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
