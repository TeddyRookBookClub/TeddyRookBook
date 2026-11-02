/* Our own visualization for the Teddy Rook Book math challenge "cm-matrix-power". */
(window.CompViz = window.CompViz || {})['cm-matrix-power'] = function (el, api) {
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
V.split = 370;
V.H = 300; var u = 0, dir = 1;
V.aria = 'The plane with a grid and a unit circle. The matrix 2 1 1 2 is applied gradually. The direction (1, 1) stretches by 3 while the direction (1, -1) stays the same, so the circle becomes an ellipse.';
V.reset = function () { u = 0; dir = 1; };
V.advance = function (dt) { u += dir * dt / 2.5; if (u >= 1) { u = 1; dir = -1; } if (u <= 0) { u = 0; dir = 1; } };
V.step = function () { u = u >= 1 ? 0 : M.min(1, u + 0.25); };
V.final = function () { u = 1; };
V.draw = function (c, L) {
var a = 1 + u, b = u, SC = 34, ox = 170, oy = 150, s = '';
function T(p) { return [ox + (a * p[0] + b * p[1]) * SC, oy - (b * p[0] + a * p[1]) * SC]; }
for (var k = -2; k <= 2; k++) { var p1 = T([k, -2]), p2 = T([k, 2]), q1 = T([-2, k]), q2 = T([2, k]); s += ln(p1[0], p1[1], p2[0], p2[1], c.grid, 1.2) + ln(q1[0], q1[1], q2[0], q2[1], c.grid, 1.2); }
var ring = []; for (var i = 0; i <= 72; i++) { var t = 2 * M.PI * i / 72; ring.push(T([M.cos(t), M.sin(t)])); }
s += pa(poly(ring), c.purple, 2, c.purpleSoft);
var o = T([0, 0]), e = T([M.SQRT1_2, M.SQRT1_2]), f = T([M.SQRT1_2, -M.SQRT1_2]);
s += ln(o[0], o[1], e[0], e[1], c.green, 4) + ci(e[0], e[1], 5, c.green) + ln(o[0], o[1], f[0], f[1], c.orange, 4) + ci(f[0], f[1], 5, c.orange);
L('m', 380, 50, 'A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}', c.ink, 'l');
L('u', 380, 115, 'A\\begin{pmatrix}1\\\\1\\end{pmatrix}=3\\begin{pmatrix}1\\\\1\\end{pmatrix}', c.green, 'l');
L('w', 380, 180, 'A\\begin{pmatrix}1\\\\-1\\end{pmatrix}=\\begin{pmatrix}1\\\\-1\\end{pmatrix}', c.orange, 'l');
L('s', 380, 240, 'u^{T}A^{10}u=3^{10}\\cdot2', c.ink, 'l');
return s;
};
V.cap = function () { return 'Sliding from I to A (' + M.round(u * 100) + '% of the way): green stretches to 3 times its length, orange stays put.'; };
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
