/* Our own visualization for the Teddy Rook Book math challenge "cm-near-twins". */
(window.CompViz = window.CompViz || {})['cm-near-twins'] = function (el, api) {
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
V.H = 300; var ph = 0, acc = 0, NP = 4;
V.aria = 'A triangle with sides 13, 14 and 15. Its incircle has radius 4, so the incenter is at height 4. The centroid is one third of the way up the height 12, also at height 4. The two points are 1/3 apart.';
function P(x, y) { return [40 + x * 20, 270 - y * 20]; }
V.reset = function () { ph = 0; acc = 0; };
V.advance = function (dt) { acc += dt; if (acc > 1.6) { acc = 0; ph++; } if (ph >= NP) { ph = NP; return false; } };
V.step = function () { ph = ph >= NP ? 0 : ph + 1; };
V.final = function () { ph = NP; };
V.done = function () { return ph >= NP; };
V.draw = function (c, L) {
var A = P(5, 12), B = P(0, 0), C = P(14, 0), I = P(6, 4), G = P(19 / 3, 4), s = '';
s += pa(poly([A, B, C], 1), c.ink, 2.5, c.greenSoft);
L('a', A[0], A[1] - 14, 'A', c.ink); L('b', B[0] - 10, B[1] + 10, 'B', c.ink); L('c', C[0] + 10, C[1] + 10, 'C', c.ink);
L('s13', (A[0] + B[0]) / 2 - 16, (A[1] + B[1]) / 2, '13', c.muted); L('s15', (A[0] + C[0]) / 2 + 16, (A[1] + C[1]) / 2, '15', c.muted); L('s14', (B[0] + C[0]) / 2, B[1] + 14, '14', c.muted);
if (ph >= 1) { s += ci(I[0], I[1], 80, 'none', c.blue, 2) + ln(I[0], I[1], I[0], I[1] + 80, c.blue, 1.5, '4 3') + ci(I[0], I[1], 4, c.blue); L('r', I[0] - 8, I[1] + 40, 'r=4', c.blue, 'r'); }
if (ph >= 2) {
var Ma = P(7, 0), Mb = P(9.5, 6), Mc = P(2.5, 6);
s += ln(A[0], A[1], Ma[0], Ma[1], c.orange, 1.5, '6 4') + ln(B[0], B[1], Mb[0], Mb[1], c.orange, 1.5, '6 4') + ln(C[0], C[1], Mc[0], Mc[1], c.orange, 1.5, '6 4') + ci(G[0], G[1], 4, c.orange);
}
if (ph >= 3) s += ln(30, I[1], 340, I[1], c.gold, 1.5, '2 4');
var x0 = 360;
L('l1', x0, 50, ph >= 1 ? 'r=\\dfrac{\\text{area}}{s}=\\dfrac{84}{21}=4' : '', c.blue, 'l');
L('l2', x0, 100, ph >= 1 ? 'I=(6,\\,4)' : '', c.blue, 'l');
L('l3', x0, 145, ph >= 2 ? 'G=\\Big(\\tfrac{0+14+5}{3},\\,\\tfrac{12}{3}\\Big)=\\Big(\\tfrac{19}{3},\\,4\\Big)' : '', c.orange, 'l');
L('l4', x0, 200, ph >= 3 ? '\\text{same height } 4' : '', c.gold, 'l');
L('l5', x0, 245, ph >= 4 ? 'IG=\\tfrac{19}{3}-6=\\tfrac13' : '', c.green, 'l');
return s;
};
V.cap = function () { return ['The 13-14-15 triangle, with B and C on the x-axis and A = (5, 12).', 'The incircle: radius 4, center I = (6, 4).', 'The medians meet at the centroid G.', 'Both centers sit on the line at height 4.', 'So the distance is just the difference of x-coordinates: 1/3.'][ph]; };
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
