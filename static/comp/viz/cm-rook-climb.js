/* Our own visualization for the Teddy Rook Book math challenge "cm-rook-climb". */
(window.CompViz = window.CompViz || {})['cm-rook-climb'] = function (el, api) {
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
var N = 5, S = 50, X0 = 24, Y0 = 22, F = {}, ord = [], k = 0, acc = 0;
for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
var v = 0;
if (x === 0 && y === 0) v = 1; else if (x === y && x > 0 && x < N - 1) v = 0;
else { for (var a = 0; a < x; a++) v += F[a + ',' + y]; for (var b = 0; b < y; b++) v += F[x + ',' + b]; }
F[x + ',' + y] = v; ord.push([x, y]);
}
V.H = 300;
V.aria = 'A 5 by 5 board. Each square gets the number of rook routes that stop there: the sum of the numbers to its left in the row and below it in the column. The three middle diagonal squares are forbidden and get 0. The top-right corner gets 370.';
V.reset = function () { k = 0; acc = 0; };
V.advance = function (dt) { acc += dt; if (acc > 0.7) { acc = 0; k++; } if (k >= 25) { k = 25; return false; } };
V.step = function () { if (k < 25) k++; };
V.final = function () { k = 25; };
V.done = function () { return k >= 25; };
function P(x, y) { return [X0 + x * S, Y0 + (N - 1 - y) * S]; }
V.draw = function (c, L) {
var s = '', cur = k ? ord[k - 1] : null;
for (var i = 0; i < 25; i++) {
var q = ord[i], p = P(q[0], q[1]), bad = q[0] === q[1] && q[0] > 0 && q[0] < 4;
var fill = bad ? c.redSoft : (q[0] + q[1]) % 2 ? c.bg : c.grid;
if (cur && !bad && ((q[1] === cur[1] && q[0] < cur[0]) || (q[0] === cur[0] && q[1] < cur[1]))) fill = c.greenSoft;
if (cur && q[0] === cur[0] && q[1] === cur[1]) fill = c.goldSoft;
s += rc(p[0], p[1], S, S, fill, c.axis, 1);
if (bad) s += tx(p[0] + S / 2, p[1] + S / 2 + 6, '×', c.red, 22);
else if (i < k) s += tx(p[0] + S / 2, p[1] + S / 2 + 6, F[q[0] + ',' + q[1]], c.ink, F[q[0] + ',' + q[1]] > 99 ? 16 : 18);
}
s += rc(X0, Y0, N * S, N * S, 'none', c.ink, 2);
var p0 = P(0, 0), p4 = P(4, 4);
s += tx(p0[0] + S / 2, Y0 + N * S + 0, '', c.muted, 12);
s += tx(p0[0] + S / 2, p0[1] + S - 6, 'start', c.muted, 10) + tx(p4[0] + S / 2, p4[1] + 12, 'goal', c.muted, 10);
L('rule', 300, 70, 'f(x,y)=\\sum_{x\'<x} f(x\',y)+\\sum_{y\'<y} f(x,y\')', c.ink, 'l');
L('row', 300, 120, '\\text{bottom row: }1,1,2,4,8', c.muted, 'l');
L('diag', 300, 160, '\\text{diagonal squares: }0', c.red, 'l');
L('ans', 300, 210, k >= 25 ? 'f(4,4)=2(107+50+20+8)=370' : '', c.green, 'l');
return s;
};
V.cap = function () {
if (!k) return 'Press Play or Step to fill the board one square at a time.';
var q = ord[k - 1], v = F[q[0] + ',' + q[1]];
return 'Square (' + q[0] + ', ' + q[1] + '): ' + (q[0] === q[1] && q[0] > 0 && q[0] < 4 ? 'forbidden, so 0 routes stop here.' : 'the green squares add up to ' + v + '.');
};
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
