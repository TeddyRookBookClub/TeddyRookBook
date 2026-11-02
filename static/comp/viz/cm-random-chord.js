/* Our own visualization for the Teddy Rook Book math challenge "cm-random-chord". */
(window.CompViz = window.CompViz || {})['cm-random-chord'] = function (el, api) {
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
V.H = 300; var n = 0, sum = 0, ch = [], hist = [], acc = 0, MAX = 6000, EX = 16 / (3 * M.PI);
V.aria = 'A unit disk with random points, each with a chord through it in a random direction. A graph shows the running average chord length settling near 16 over 3 pi, about 1.698.';
function one() {
var x, y; do { x = 2 * M.random() - 1; y = 2 * M.random() - 1; } while (x * x + y * y >= 1);
var t = M.PI * M.random(), dx = M.cos(t), dy = M.sin(t), b = x * dx + y * dy, q = M.sqrt(b * b - x * x - y * y + 1);
var L0 = 2 * q; n++; sum += L0; ch.push([x, y, x + (-b - q) * dx, y + (-b - q) * dy, x + (-b + q) * dx, y + (-b + q) * dy]); if (ch.length > 25) ch.shift();
if (n <= 40 || n % 25 === 0) hist.push([n, sum / n]);
}
V.reset = function () { n = 0; sum = 0; ch = []; hist = []; };
V.advance = function (dt) { acc += dt; var m = n < 25 ? (acc > 0.3 ? 1 : 0) : 15; if (m) acc = 0; for (var i = 0; i < m && n < MAX; i++) one(); if (n >= MAX) return false; };
V.step = function () { one(); };
V.final = function () { while (n < 3000) one(); };
V.done = function () { return n >= MAX; };
V.draw = function (c, L) {
var cx = 140, cy = 150, R = 115, s = ci(cx, cy, R, c.bg, c.ink, 2);
ch.forEach(function (q, i) { var o = ((i + 1) / ch.length).toFixed(2); s += '<g opacity="' + o + '">' + ln(cx + q[2] * R, cy - q[3] * R, cx + q[4] * R, cy - q[5] * R, c.blue, 1.5) + ci(cx + q[0] * R, cy - q[1] * R, 3, c.orange) + '</g>'; });
var x0 = 300, y0 = 40, w = 320, h = 170, lo = 1.4, hi = 1.9;
s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.5) + ln(x0, y0, x0, y0 + h, c.axis, 1.5);
var yl = y0 + h - (EX - lo) / (hi - lo) * h, yp = y0 + h - (M.PI / 2 - lo) / (hi - lo) * h;
s += ln(x0, yl, x0 + w, yl, c.gold, 1.5, '6 4') + ln(x0, yp, x0 + w, yp, c.muted, 1, '2 4');
if (hist.length > 1) s += pa(plot(x0, y0, w, h, hist.map(function (q) { return M.log(q[0]); }), hist.map(function (q) { return M.max(lo, M.min(hi, q[1])); }), [0, M.log(MAX)], [lo, hi]), c.blue, 2);
s += tx(x0 - 6, y0 + 6, hi, c.muted, 11, 'end') + tx(x0 - 6, y0 + h, lo, c.muted, 11, 'end') + tx(x0 + w, y0 + h + 18, 'chords (log scale)', c.muted, 12, 'end');
L('e', x0 + w - 4, yl - 13, '\\tfrac{16}{3\\pi}\\approx1.698', c.gold, 'r');
L('p', x0 + w - 4, yp + 13, '\\tfrac{\\pi}{2}\\ (\\text{uniform height})', c.muted, 'r');
L('n', x0 + 6, 262, n ? '\\text{average so far: } ' + (sum / n).toFixed(4) : '', c.blue, 'l');
return s;
};
V.cap = function () { return n ? n + ' chords. Orange dots are the random points; each chord passes through its dot.' : 'Press Play to draw random chords.'; };
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
