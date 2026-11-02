/* Our own visualization for the Teddy Rook Book math challenge "cm-angle-staircase". */
(window.CompViz = window.CompViz || {})['cm-angle-staircase'] = function (el, api) {
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
V.split = 320;
V.H = 310; var k = 0, acc = 0, NN = 12;
V.aria = 'Rays from the origin to the points (1, t n), where t n are the triangular numbers 1, 3, 6, 10 and so on. The angle between neighboring rays is the n-th term of the series. The wedges fill a right angle.';
function T(n) { return n * (n + 1) / 2; }
V.reset = function () { k = 0; acc = 0; };
V.advance = function (dt) { acc += dt; if (acc > 0.8) { acc = 0; k++; } if (k >= NN) { k = NN; return false; } };
V.step = function () { k = k >= NN ? 0 : k + 1; };
V.final = function () { k = NN; };
V.done = function () { return k >= NN; };
var cols = ['blue', 'green', 'orange', 'purple', 'teal', 'pink'];
V.draw = function (c, L) {
var ox = 40, oy = 280, R = 250, s = ln(ox, oy, ox + R + 20, oy, c.axis, 1.5) + ln(ox, oy, ox, oy - R - 20, c.axis, 1.5);
s += pa('M' + (ox + R) + ' ' + oy + 'A' + R + ' ' + R + ' 0 0 0 ' + ox + ' ' + (oy - R), c.grid, 1.5);
var sum = 0;
for (var n = 1; n <= k; n++) {
var a0 = M.atan(T(n - 1)), a1 = M.atan(T(n)); sum = a1;
var p0 = [ox + R * M.cos(a0), oy - R * M.sin(a0)], p1 = [ox + R * M.cos(a1), oy - R * M.sin(a1)], cl = cols[(n - 1) % 6];
s += pa('M' + ox + ' ' + oy + 'L' + f1(p0[0]) + ' ' + f1(p0[1]) + 'A' + R + ' ' + R + ' 0 0 0 ' + f1(p1[0]) + ' ' + f1(p1[1]) + 'Z', c[cl], 1, c[cl + 'Soft']);
}
L('a', 330, 50, '\\theta_n=\\arctan t_n-\\arctan t_{n-1}', c.ink, 'l');
L('b', 330, 95, '\\tan\\theta_n=\\frac{4n}{n^4-n^2+4}', c.ink, 'l');
L('c', 330, 145, 't_n=\\tfrac{n(n+1)}{2}=1,3,6,10,\\dots', c.muted, 'l');
L('d', 330, 200, k ? '\\theta_1+\\dots+\\theta_{' + k + '}=\\arctan ' + T(k) + '\\approx' + (sum * 180 / M.PI).toFixed(2) + '^\\circ' : '', c.green, 'l');
L('e', 330, 245, '\\to 90^\\circ=\\tfrac{\\pi}{2}', c.gold, 'l');
return s;
};
V.cap = function () { return k ? 'Wedge ' + k + ' is the angle between the rays to (1, ' + T(k - 1) + ') and (1, ' + T(k) + ').' : 'Press Play to add the angles one at a time.'; };
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
