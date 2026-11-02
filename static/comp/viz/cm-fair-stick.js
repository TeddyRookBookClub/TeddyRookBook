/* Our own visualization for the Teddy Rook Book math challenge "cm-fair-stick". */
(window.CompViz = window.CompViz || {})['cm-fair-stick'] = function (el, api) {
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
V.split = 380;
V.H = 310; var n = 0, hit = 0, pts = [], acc = 0, MAX = 5000;
V.aria = 'An equilateral triangle stands for all ways to break the stick: each point gives three lengths. A small hexagon around the center holds the breaks where no piece is more than twice another. Random breaks land in it about one time in ten.';
var A = [40, 280], B = [360, 280], C = [200, 280 - 160 * M.sqrt(3)];
function P(a, b, cc) { return [a * A[0] + b * B[0] + cc * C[0], a * A[1] + b * B[1] + cc * C[1]]; }
var hex = [[2, 2, 1], [2, 1, 2], [1, 2, 2]].map(function (q) { return q.map(function (v) { return v / 5; }); });
var hv = [[.4, .4, .2], [.5, .25, .25], [.4, .2, .4], [.25, .25, .5], [.2, .4, .4], [.25, .5, .25]];
function one() { var u = M.random(), v = M.random(), lo = M.min(u, v), hi = M.max(u, v), p = [lo, hi - lo, 1 - hi], s = p.slice().sort(); var h = s[2] <= 2 * s[0]; n++; if (h) hit++; pts.push([p, h]); if (pts.length > 400) pts.shift(); }
V.reset = function () { n = 0; hit = 0; pts = []; };
V.advance = function (dt) { acc += dt; var m = n < 20 ? (acc > 0.2 ? 1 : 0) : 6; if (m) acc = 0; for (var i = 0; i < m && n < MAX; i++) one(); if (n >= MAX) return false; };
V.step = function () { one(); };
V.final = function () { while (n < 1500) one(); };
V.done = function () { return n >= MAX; };
V.draw = function (c, L) {
var s = pa(poly([A, B, C], 1), c.ink, 2, c.bg);
var ctr = P(1 / 3, 1 / 3, 1 / 3);
[[1, 1, 0], [1, 0, 1], [0, 1, 1]].forEach(function (q) { var e = P(q[0] / 2, q[1] / 2, q[2] / 2); s += ln(ctr[0], ctr[1], e[0], e[1], c.muted, 1, '3 4'); var v = P(q[0] ? 0 : 1, q[1] ? 0 : 1, q[2] ? 0 : 1); s += ln(ctr[0], ctr[1], v[0], v[1], c.muted, 1, '3 4'); });
s += pa(poly(hv.map(function (q) { return P(q[0], q[1], q[2]); }), 1), c.green, 2, c.greenSoft);
pts.forEach(function (q) { var p = P(q[0][0], q[0][1], q[0][2]); s += ci(p[0], p[1], 1.8, q[1] ? c.green : c.muted); });
L('a', 390, 50, '\\text{a point }=(a,b,c),\\ a+b+c=1', c.ink, 'l');
L('b', 390, 95, '\\text{hexagon: } \\max\\le2\\min', c.green, 'l');
L('c', 390, 140, '\\text{each sixth: } \\tfrac{1/120}{1/12}', c.ink, 'l');
L('d', 390, 190, n ? '\\text{fraction so far: } ' + (hit / n).toFixed(3) : '', c.blue, 'l');
L('e', 390, 235, '\\text{answer: } \\tfrac1{10}', c.gold, 'l');
return s;
};
V.cap = function () { return n ? n + ' random breaks, ' + hit + ' of them fair (green dots).' : 'Press Play to break sticks at random.'; };
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
