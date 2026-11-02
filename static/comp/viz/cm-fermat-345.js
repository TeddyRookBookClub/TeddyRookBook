/* Our own visualization for the Teddy Rook Book math challenge "cm-fermat-345". */
(window.CompViz = window.CompViz || {})['cm-fermat-345'] = function (el, api) {
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
V.split = 410;
V.H = 300; var u = 0, acc = 0;
V.aria = 'A 3-4-5 right triangle with an equilateral triangle built on the leg of length 3. A point P moves toward the Fermat point. Rotating by 60 degrees turns PA plus PB plus PC into a broken path from B to the far corner C prime, which becomes straight at the Fermat point.';
var A = [0, 0], B = [4, 0], C = [0, 3], C2 = [-3 * M.sin(M.PI / 3), 3 * M.cos(M.PI / 3)];
function rot(p) { var a = M.PI / 3; return [p[0] * M.cos(a) - p[1] * M.sin(a), p[0] * M.sin(a) + p[1] * M.cos(a)]; }
var F = [1, 1]; for (var i = 0; i < 400; i++) { var w = [A, B, C].map(function (q) { return 1 / M.hypot(F[0] - q[0], F[1] - q[1]); }), sw = w[0] + w[1] + w[2]; F = [(w[1] * 4) / sw, (w[2] * 3) / sw]; }
var P0 = [2.6, 1.9];
function Pt() { var e = 1 - M.pow(1 - u, 2); return [P0[0] + (F[0] - P0[0]) * e, P0[1] + (F[1] - P0[1]) * e]; }
V.reset = function () { u = 0; acc = 0; };
V.advance = function (dt) { u += dt / 4; if (u >= 1) { u = 1; return false; } };
V.step = function () { u = u >= 1 ? 0 : M.min(1, u + 0.2); };
V.final = function () { u = 1; };
V.done = function () { return u >= 1; };
V.draw = function (c, L) {
var SC = 52, ox = 175, oy = 250;
function S(p) { return [ox + p[0] * SC, oy - p[1] * SC]; }
var P = Pt(), P2 = rot(P), a = S(A), b = S(B), cc = S(C), c2 = S(C2), p = S(P), p2 = S(P2), s = '';
s += pa(poly([a, b, cc], 1), c.ink, 2, c.greenSoft) + pa(poly([a, cc, c2], 1), c.muted, 1.5, c.goldSoft, '5 4');
s += pa(poly([a, p, p2], 1), c.purple, 1.5, c.purpleSoft);
s += ln(p[0], p[1], a[0], a[1], c.blue, 2) + ln(p[0], p[1], cc[0], cc[1], c.blue, 2) + ln(p[0], p[1], b[0], b[1], c.blue, 2);
s += pa(poly([b, p, p2, c2]), c.red, 3) + ln(b[0], b[1], c2[0], c2[1], c.gold, 1.2, '3 4');
[a, b, cc, c2].forEach(function (q) { s += ci(q[0], q[1], 4, c.ink); });
s += ci(p[0], p[1], 5, c.red) + ci(p2[0], p2[1], 4, c.purple);
L('A', a[0] + 4, a[1] + 14, 'A', c.ink, 'l'); L('B', b[0] + 8, b[1], 'B', c.ink, 'l'); L('C', cc[0] + 8, cc[1] - 8, 'C', c.ink, 'l'); L('C2', c2[0] - 8, c2[1], "C'", c.ink, 'r');
L('P', p[0] + 8, p[1] - 10, 'P', c.red, 'l'); L('P2', p2[0] - 8, p2[1] - 10, "P'", c.purple, 'r');
var sum = [A, B, C].reduce(function (t, q) { return t + M.hypot(P[0] - q[0], P[1] - q[1]); }, 0);
L('f1', 420, 50, 'PA+PB+PC', c.ink, 'l');
L('f2', 420, 85, '=BP+PP\'+P\'C\'', c.red, 'l');
L('f3', 420, 125, '=' + sum.toFixed(3), c.red, 'l');
L('f4', 420, 175, '\\ge BC\'=\\sqrt{25+12\\sqrt3}', c.gold, 'l');
L('f5', 420, 215, '\\approx6.766', c.gold, 'l');
return s;
};
V.cap = function () { return u >= 1 ? 'At the Fermat point the red path is straight, and the sum is as small as it can be.' : 'Triangle APP\' is equilateral, so PA = PP\'. The red path has the same length as PA + PB + PC.'; };
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
