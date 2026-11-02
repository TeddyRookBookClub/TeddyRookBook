/* Our own visualization for the Teddy Rook Book math challenge "cm-sphere-hull". */
(window.CompViz = window.CompViz || {})['cm-sphere-hull'] = function (el, api) {
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
V.split = 290;
V.H = 300; var pts = [], runs = 0, tot = 0, sr = 0, stot = 0, acc = 0, flash = 0;
V.aria = 'Random points are added on a circle until the polygon they form contains the center; then a new run starts. The running average count approaches 5. A background simulation of the same game on a sphere approaches 7.';
function inside(a) { var s = a.slice().sort(function (x, y) { return x - y; }); for (var i = 0; i < s.length; i++) { var g = (i + 1 < s.length ? s[i + 1] : s[0] + 1) - s[i]; if (g >= 0.5) return false; } return s.length >= 3; }
function sph() { var v; do { v = [M.random() * 2 - 1, M.random() * 2 - 1, M.random() * 2 - 1]; } while (v[0] * v[0] + v[1] * v[1] + v[2] * v[2] > 1 || v[0] * v[0] + v[1] * v[1] + v[2] * v[2] < 1e-6); return v; }
function det(a, b, c) { return a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]); }
function tet(p, q, r, s) { var d = [det(q, r, s), -det(p, r, s), det(p, q, s), -det(p, q, r)]; return (d[0] > 0 && d[1] > 0 && d[2] > 0 && d[3] > 0) || (d[0] < 0 && d[1] < 0 && d[2] < 0 && d[3] < 0); }
function sphereRun() { var P = []; for (;;) { var p = sph(); for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) for (var k = j + 1; k < P.length; k++) if (tet(P[i], P[j], P[k], p)) { sr++; stot += P.length + 1; return; } P.push(p); } }
function add() { if (flash) { pts = []; flash = 0; } pts.push(M.random()); if (inside(pts)) { runs++; tot += pts.length; flash = 1; } }
V.reset = function () { pts = []; runs = 0; tot = 0; sr = 0; stot = 0; flash = 0; };
V.advance = function (dt) { acc += dt; for (var i = 0; i < 6 && sr < 30000; i++) sphereRun(); if (acc < (flash ? 0.9 : 0.35)) return; acc = 0; add(); if (runs >= 300) return false; };
V.step = function () { add(); };
V.final = function () { for (var i = 0; i < 4000; i++) sphereRun(); var r = 0; while (runs < 400) add(); };
V.done = function () { return runs >= 300; };
V.draw = function (c, L) {
var cx = 140, cy = 150, R = 110, s = ci(cx, cy, R, 'none', c.axis, 2) + ci(cx, cy, 4, c.ink);
var srt = pts.slice().sort(function (x, y) { return x - y; }), P = srt.map(function (t) { return [cx + R * M.cos(2 * M.PI * t), cy - R * M.sin(2 * M.PI * t)]; });
if (P.length >= 2) s += pa(poly(P, P.length > 2), flash ? c.green : c.blue, 2.5, flash ? c.greenSoft : c.blueSoft);
P.forEach(function (q) { s += ci(q[0], q[1], 5, c.ink); });
L('a', 300, 50, '\\Pr(N>n)=\\frac{2n}{2^n}\\ \\text{(circle)}', c.ink, 'l');
L('b', 300, 95, '\\Pr(N>n)=\\frac{n^2-n+2}{2^n}\\ \\text{(sphere)}', c.ink, 'l');
L('c', 300, 150, runs ? '\\text{circle: average } ' + (tot / runs).toFixed(2) + '\\text{ over } ' + runs + '\\text{ runs}\\ (\\to5)' : '\\text{circle: } \\to 5', c.blue, 'l');
L('d', 300, 195, sr ? '\\text{sphere: average } ' + (stot / sr).toFixed(2) + '\\text{ over } ' + sr + '\\text{ runs}\\ (\\to7)' : '\\text{sphere: } \\to 7', c.green, 'l');
return s;
};
V.cap = function () { return flash ? 'The center is inside after ' + pts.length + ' points. A new run starts next.' : pts.length + ' point' + (pts.length === 1 ? '' : 's') + ' so far; the center is still outside.'; };
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
