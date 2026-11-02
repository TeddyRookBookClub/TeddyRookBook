/* Our own visualization for the Teddy Rook Book math challenge "cm-rolling-coin". */
(window.CompViz = window.CompViz || {})['cm-rolling-coin'] = function (el, api) {
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
V.split = 345;
V.H = 330; var u = 0, LEN = 8 + 2 * M.PI, sp = 1.4;
V.aria = 'A disk of radius 1 rolls around the outside of a square of side 2. The region it covers fills in: four 2 by 2 rectangles along the sides and four quarter disks of radius 2 at the corners.';
var SC = 45, CX = 200, CY = 165;
function P(x, y) { return [CX + x * SC, CY - y * SC]; }
function cen(s) { // center of the disk after path length s, starting below the square
var seg = [[-1, -2, 1, 0], null, [2, -1, 0, 1], null, [1, 2, -1, 0], null, [-2, 1, 0, -1], null];
var cor = [[1, -1, -M.PI / 2], [1, 1, 0], [-1, 1, M.PI / 2], [-1, -1, M.PI]];
s = ((s % LEN) + LEN) % LEN;
for (var i = 0; i < 4; i++) {
var a = seg[2 * i]; if (s <= 2) return [a[0] + a[2] * s, a[1] + a[3] * s]; s -= 2;
var q = cor[i]; if (s <= M.PI / 2) return [q[0] + M.cos(q[2] + s), q[1] + M.sin(q[2] + s)]; s -= M.PI / 2;
}
return [-1, -2];
}
V.reset = function () { u = 0; };
V.advance = function (dt) { u += dt * sp; if (u >= LEN) { u = LEN; return false; } };
V.step = function () { u = M.min(LEN, u + LEN / 16); };
V.final = function () { u = LEN; };
V.done = function () { return u >= LEN; };
V.draw = function (c, L) {
var s = '', d = '', r = SC;
for (var x = 0; x <= u + 1e-9; x += 0.08) { var p = P.apply(null, cen(M.min(x, u))); d += 'M' + f1(p[0] - r) + ' ' + f1(p[1]) + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0'; }
var o = 3 * SC, a = P(-1, 1);
s += pa('M' + f1(CX - o) + ' ' + f1(CY - SC) + 'A' + 2 * SC + ' ' + 2 * SC + ' 0 0 1 ' + f1(a[0]) + ' ' + f1(CY - o) + 'H' + f1(CX + SC) + 'A' + 2 * SC + ' ' + 2 * SC + ' 0 0 1 ' + f1(CX + o) + ' ' + f1(CY - SC) + 'V' + f1(CY + SC) + 'A' + 2 * SC + ' ' + 2 * SC + ' 0 0 1 ' + f1(CX + SC) + ' ' + f1(CY + o) + 'H' + f1(CX - SC) + 'A' + 2 * SC + ' ' + 2 * SC + ' 0 0 1 ' + f1(CX - o) + ' ' + f1(CY + SC) + 'Z', c.muted, 1.2, 'none', '5 4');
if (d) s += pa(d, null, 0, c.greenSoft);
s += rc(CX - SC, CY - SC, 2 * SC, 2 * SC, c.grid, c.ink, 2);
var q = cen(u), pq = P(q[0], q[1]);
s += ci(pq[0], pq[1], SC, c.goldSoft, c.gold, 2.5) + ci(pq[0], pq[1], 3, c.ink);
L('a1', 420, 60, '\\text{4 strips: } 4\\cdot(2\\cdot2)=16', c.ink, 'l');
L('a2', 420, 100, '\\text{4 corners: } \\pi\\cdot2^2=4\\pi', c.ink, 'l');
L('a3', 420, 150, u >= LEN ? '\\text{area}=16+4\\pi\\approx28.57' : '', c.green, 'l');
L('a4', 420, 200, '\\text{center stays } 1 \\text{ from the square}', c.muted, 'l');
return s;
};
V.cap = function () { return u >= LEN ? 'Done: every point within 2 of the square got covered.' : 'The disk rolls on; the green region is what it has covered so far.'; };
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
