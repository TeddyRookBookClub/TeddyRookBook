/* Our own visualization for the Teddy Rook Book math challenge "cm-cubic-shuffle". */
(window.CompViz = window.CompViz || {})['cm-cubic-shuffle'] = function (el, api) {
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
V.split = 310;
V.H = 300; var k = 0, acc = 0, TH = [2, 4, 8].map(function (m) { return 2 * M.PI * m / 9; });
V.aria = 'A unit circle with points at angles 2 pi over 9, 4 pi over 9 and 8 pi over 9. Doubling the angle moves each point to the next and the last back to the first. Below, the roots 2 cos theta on a number line.';
V.reset = function () { k = 0; acc = 0; };
V.advance = function (dt) { acc += dt; if (acc > 1.5) { acc = 0; k = (k + 1) % 3; } };
V.step = function () { k = (k + 1) % 3; };
V.draw = function (c, L) {
var cx = 150, cy = 140, R = 100, s = ci(cx, cy, R, 'none', c.axis, 1.5) + ln(cx - R - 15, cy, cx + R + 15, cy, c.grid, 1) + ln(cx, cy - R - 15, cx, cy + R + 15, c.grid, 1);
var col = [c.blue, c.green, c.orange], j = (k + 1) % 3;
var a0 = TH[k], a1 = TH[j] + (j === 0 ? 2 * M.PI : 0);
var arc = []; for (var t = 0; t <= 1.0001; t += 0.05) { var a = a0 + (2 * a0 - a0) * t; arc.push([cx + (R + 14) * M.cos(a), cy - (R + 14) * M.sin(a)]); }
s += pa(poly(arc), c.gold, 2.5);
var e = arc[arc.length - 1]; s += ci(e[0], e[1], 4, c.gold);
for (var i = 0; i < 3; i++) {
var x = cx + R * M.cos(TH[i]), y = cy - R * M.sin(TH[i]);
s += ln(cx, cy, x, y, col[i], i === k ? 3 : 1.5) + ci(x, y, i === k ? 7 : 5, col[i]);
s += ln(x, y, x, 270, col[i], 1, '3 3');
}
s += ln(30, 270, 290, 270, c.axis, 1.5);
[-2, -1, 0, 1, 2].forEach(function (v) { s += ln(cx + v * R / 2 * 1, 266, cx + v * R / 2, 274, c.axis, 1.2) + tx(cx + v * R / 2, 290, v, c.muted, 11); });
L('a', 330, 50, 'x=2\\cos\\theta:\\quad x^3-3x=2\\cos3\\theta', c.ink, 'l');
L('b', 330, 95, 'x^2-2=2\\cos2\\theta', c.ink, 'l');
var nm = ['\\tfrac{2\\pi}{9}', '\\tfrac{4\\pi}{9}', '\\tfrac{8\\pi}{9}'], im = ['\\tfrac{4\\pi}{9}', '\\tfrac{8\\pi}{9}', '\\tfrac{16\\pi}{9}\\equiv-\\tfrac{2\\pi}{9}'];
L('c', 330, 150, '\\theta=' + nm[k] + '\\ \\mapsto\\ 2\\theta=' + im[k], col[k], 'l');
L('d', 330, 205, '\\text{so } r\\mapsto r^2-2 \\text{ permutes the roots}', c.green, 'l');
L('e', 330, 250, '\\prod(r^2-2)=abc=-1', c.green, 'l');
return s;
};
V.cap = function () { var v = [2 * M.cos(TH[k]), 2 * M.cos(TH[(k + 1) % 3])]; return 'Root ' + v[0].toFixed(4) + ' squared minus 2 is ' + (v[0] * v[0] - 2).toFixed(4) + ', which is the root ' + v[1].toFixed(4) + '.'; };
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
