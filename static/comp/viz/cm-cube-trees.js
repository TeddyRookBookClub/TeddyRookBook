/* Our own visualization for the Teddy Rook Book math challenge "cm-cube-trees". */
(window.CompViz = window.CompViz || {})['cm-cube-trees'] = function (el, api) {
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
V.split = 350;
V.H = 290; var tree = [], seen = {}, nseen = 0, acc = 0, cnt = 0;
V.aria = 'The cube graph with 8 corners and 12 edges. One random spanning tree of 7 edges is highlighted at a time. A counter shows how many different trees have appeared, out of 384.';
var E = []; for (var a = 0; a < 8; a++) for (var b = 0; b < 3; b++) if (!(a >> b & 1)) E.push([a, a | 1 << b]);
function wilson() { // a uniformly random spanning tree
var inT = [true, false, false, false, false, false, false, false], nxt = [], out = [];
for (var s = 1; s < 8; s++) {
var v = s; while (!inT[v]) { nxt[v] = v ^ (1 << M.floor(M.random() * 3)); v = nxt[v]; }
v = s; while (!inT[v]) { inT[v] = true; out.push([M.min(v, nxt[v]), M.max(v, nxt[v])]); v = nxt[v]; }
}
return out;
}
function next() { tree = wilson(); cnt++; var key = tree.map(function (e) { return E.findIndex(function (f) { return f[0] === e[0] && f[1] === e[1]; }); }).sort(function (x, y) { return x - y; }).join(','); if (!seen[key]) { seen[key] = 1; nseen++; } }
V.reset = function () { seen = {}; nseen = 0; cnt = 0; next(); };
V.advance = function (dt) { acc += dt; if (acc > 1.2) { acc = 0; next(); } };
V.step = function () { next(); };
V.final = function () { };
V.draw = function (c, L) {
function P(v) { var x = v & 1, y = v >> 1 & 1, z = v >> 2 & 1; return [70 + x * 150 + z * 70, 230 - y * 150 - z * 50]; }
var s = '', inTree = {};
tree.forEach(function (e) { inTree[e[0] + '-' + e[1]] = 1; });
E.forEach(function (e) { var p = P(e[0]), q = P(e[1]), t = inTree[e[0] + '-' + e[1]]; s += ln(p[0], p[1], q[0], q[1], t ? c.green : c.grid, t ? 5 : 2, t ? '' : '5 4'); });
for (var v = 0; v < 8; v++) { var p = P(v); s += ci(p[0], p[1], 8, c.bg, c.ink, 2); }
L('a', 360, 50, '\\tau=\\tfrac18\\cdot2^3\\cdot4^3\\cdot6=384', c.ink, 'l');
L('b', 360, 100, '\\text{Laplacian eigenvalues } 2|s|', c.muted, 'l');
L('c', 360, 160, '\\text{trees drawn: } ' + cnt, c.ink, 'l');
L('d', 360, 200, '\\text{different ones: } ' + nseen + '\\text{ of } 384', c.green, 'l');
return s;
};
V.cap = function () { return 'Green: a spanning tree of the cube, chosen fairly by Wilson\'s algorithm (loop-erased random walks).'; };
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
