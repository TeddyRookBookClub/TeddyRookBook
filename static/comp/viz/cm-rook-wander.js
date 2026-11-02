/* Our own visualization for the Teddy Rook Book math challenge "cm-rook-wander". */
(window.CompViz = window.CompViz || {})['cm-rook-wander'] = function (el, api) {
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
V.H = 300; var pos, mv, walks = 0, tot = 0, trail = [], acc = 0, bw = 0, bt = 0;
V.aria = 'A rook takes random moves on a chessboard until it reaches h8. Its recent path is drawn. A counter shows the average number of moves over many walks, close to 70.';
function rnd(i) { var m = M.floor(M.random() * 7); return m < i ? m : m + 1; }
function mvOnce(p) { return M.random() < 0.5 ? [rnd(p[0]), p[1]] : [p[0], rnd(p[1])]; }
function newWalk() { pos = [0, 0]; mv = 0; trail = [[0, 0]]; }
function bg(m) { for (var j = 0; j < m; j++) { var p = [0, 0], c = 0; while (p[0] < 7 || p[1] < 7) { p = mvOnce(p); c++; } bw++; bt += c; } }
V.reset = function () { newWalk(); walks = 0; tot = 0; bw = 0; bt = 0; };
V.advance = function (dt) { acc += dt; bg(4); if (acc < 0.25) return; acc = 0; pos = mvOnce(pos); mv++; trail.push(pos); if (trail.length > 12) trail.shift(); if (pos[0] === 7 && pos[1] === 7) { walks++; tot += mv; newWalk(); } if (bw > 20000) return false; };
V.step = function () { pos = mvOnce(pos); mv++; trail.push(pos); if (trail.length > 12) trail.shift(); if (pos[0] === 7 && pos[1] === 7) { walks++; tot += mv; newWalk(); } };
V.final = function () { bg(3000); };
V.done = function () { return bw > 20000; };
V.draw = function (c, L) {
var X = 20, Y = 20, S = 32, s = '';
for (var i = 0; i < 8; i++) for (var j = 0; j < 8; j++) {
var line = i === 7 || j === 7;
s += rc(X + i * S, Y + (7 - j) * S, S, S, (i + j) % 2 ? c.bg : c.grid);
if (line && !(i === 7 && j === 7)) s += rc(X + i * S, Y + (7 - j) * S, S, S, c.blueSoft);
}
s += rc(X + 7 * S, Y, S, S, c.goldSoft, c.gold, 2) + rc(X, Y, 8 * S, 8 * S, 'none', c.ink, 2);
var p = trail.map(function (q) { return [X + (q[0] + 0.5) * S, Y + (7.5 - q[1]) * S]; });
if (p.length > 1) s += pa(poly(p), c.orange, 2.5);
s += ci(X + (pos[0] + 0.5) * S, Y + (7.5 - pos[1]) * S, 10, c.green, c.ink, 1.5);
s += tx(X + 7.5 * S, Y + 0.5 * S + 5, 'h8', c.ink, 12) + tx(X + 0.5 * S, Y + 7.5 * S + 5, 'a1', c.muted, 11);
L('a', 300, 50, '\\text{blue: shares a line with h8 (state A)}', c.blue, 'l');
L('b', 300, 95, 'E_B=7+E_A,\\quad E_A=63', c.ink, 'l');
L('c', 300, 140, 'E_B=70', c.green, 'l');
L('d', 300, 200, bw ? '\\text{average of } ' + bw + '\\text{ walks: } ' + (bt / bw).toFixed(2) : '', c.ink, 'l');
L('e', 300, 245, '\\text{this walk: } ' + mv + '\\text{ moves}', c.muted, 'l');
return s;
};
V.cap = function () { return 'The board shows one walk at a time; the average uses many fast walks run in the background.'; };
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
