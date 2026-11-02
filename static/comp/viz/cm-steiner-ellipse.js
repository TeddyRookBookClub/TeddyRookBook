/* Our own visualization for the Teddy Rook Book math challenge "cm-steiner-ellipse". */
(window.CompViz = window.CompViz || {})['cm-steiner-ellipse'] = function (el, api) {
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
V.split = 390;
V.H = 300; var u = 0, dir = 1;
V.aria = 'An equilateral triangle in its circumcircle is slid by an affine map into a 3-4-5 right triangle in an ellipse. The ratio of the ellipse area to the triangle area stays 4 pi over 3 root 3 the whole time.';
var E = [[0, 0], [4, 0], [2, 2 * M.sqrt(3)]], T = [[0, 0], [4, 0], [0, 3]];
function aff(s) { // affine map sending E to the blend of E and T
var Q = E.map(function (e, i) { return [e[0] + (T[i][0] - e[0]) * s, e[1] + (T[i][1] - e[1]) * s]; });
var a = (Q[1][0] - Q[0][0]) / 4, c2 = (Q[1][1] - Q[0][1]) / 4;
var b = (Q[2][0] - Q[0][0] - 2 * a) / (2 * M.sqrt(3)), d = (Q[2][1] - Q[0][1] - 2 * c2) / (2 * M.sqrt(3));
return function (p) { return [Q[0][0] + a * p[0] + b * p[1], Q[0][1] + c2 * p[0] + d * p[1]]; };
}
V.reset = function () { u = 0; dir = 1; };
V.advance = function (dt) { u += dir * dt / 3; if (u >= 1) { u = 1; dir = -1; } if (u <= 0) { u = 0; dir = 1; } };
V.step = function () { u = u >= 1 ? 0 : M.min(1, u + 0.25); };
V.final = function () { u = 1; };
V.draw = function (c, L) {
var f = aff(u), SC = 42, ox = 110, oy = 230;
function S(p) { return [ox + p[0] * SC, oy - p[1] * SC]; }
var cc = [2, 2 / M.sqrt(3)], r = 4 / M.sqrt(3), ring = [];
for (var i = 0; i <= 72; i++) { var t = 2 * M.PI * i / 72; ring.push(S(f([cc[0] + r * M.cos(t), cc[1] + r * M.sin(t)]))); }
var tri = E.map(function (p) { return S(f(p)); }), g = S(f([2, 2 / M.sqrt(3)]));
var s = pa(poly(ring), c.blue, 2.5, c.blueSoft) + pa(poly(tri, 1), c.ink, 2.5, c.greenSoft) + ci(g[0], g[1], 4, c.orange);
var area = M.abs((tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1])) / 2 / SC / SC;
L('a', 400, 50, '\\text{triangle area: }' + area.toFixed(2), c.green, 'l');
L('b', 400, 95, '\\text{ellipse area: }' + (area * 4 * M.PI / (3 * M.sqrt(3))).toFixed(2), c.blue, 'l');
L('c', 400, 145, '\\frac{\\text{ellipse}}{\\text{triangle}}=\\frac{4\\pi}{3\\sqrt3}\\approx2.418', c.ink, 'l');
L('d', 400, 205, u >= 1 ? '6\\cdot\\frac{4\\pi}{3\\sqrt3}=\\frac{8\\pi}{\\sqrt3}\\approx14.51' : '', c.gold, 'l');
L('e', 400, 250, '\\text{orange: the centroid stays the center}', c.orange, 'l');
return s;
};
V.cap = function () { return u <= 0 ? 'An equilateral triangle in its circle: the best possible ratio.' : u >= 1 ? 'The 3-4-5 triangle in its Steiner ellipse.' : 'An affine map stretches both shapes, but the area ratio does not change.'; };
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
