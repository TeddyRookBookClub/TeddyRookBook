/* Our own visualization for the Teddy Rook Book math challenge "cm-coin-ring". */
(window.CompViz = window.CompViz || {})['cm-coin-ring'] = function (el, api) {
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
V.H = 300; var n = 10, st = [], moves = [], mi = 0, acc = 0, flash = -1, mode = 10;
V.aria = 'Coins in a circle, colored by position mod 3. With 10 coins, some three-coin flips leave one tail. With 9, the three color counts of tails keep the same parity.';
function solve(n) { // GF(2): which triples flip only coin 0
var A = [], i, j, r, k;
for (i = 0; i < n; i++) { A.push([]); for (j = 0; j < n; j++) A[i].push(((i - j + n) % n) < 3 ? 1 : 0); A[i].push(i === 0 ? 1 : 0); }
var row = 0, piv = [];
for (j = 0; j < n && row < n; j++) {
for (r = row; r < n && !A[r][j]; r++);
if (r === n) continue; var t = A[r]; A[r] = A[row]; A[row] = t;
for (k = 0; k < n; k++) if (k !== row && A[k][j]) for (var q = 0; q <= n; q++) A[k][q] ^= A[row][q];
piv.push(j); row++;
}
var x = []; for (i = 0; i < piv.length; i++) if (A[i][n]) x.push(piv[i]); return x;
}
function setup(m) { mode = n = m; st = []; for (var i = 0; i < n; i++) st.push(0); mi = 0; flash = -1; moves = n % 3 ? solve(n) : []; }
function doMove(i) { flash = i; for (var k = 0; k < 3; k++) st[(i + k) % n] ^= 1; mi++; }
V.reset = function () { setup(mode); };
V.advance = function (dt) { acc += dt; if (acc < 0.8) return; acc = 0; if (n % 3) { if (mi >= moves.length) return false; doMove(moves[mi]); } else { if (mi >= 24) return false; doMove(M.floor(M.random() * n)); } };
V.step = function () { if (n % 3) { if (mi < moves.length) doMove(moves[mi]); } else doMove(M.floor(M.random() * n)); };
V.final = function () { if (n % 3) while (mi < moves.length) doMove(moves[mi]); };
V.done = function () { return n % 3 ? mi >= moves.length : mi >= 24; };
V.buttons = [['10 coins', function () { setup(10); }], ['9 coins', function () { setup(9); }]];
V.draw = function (c, L) {
var cx = 150, cy = 150, R = 105, s = '', cl = [c.blue, c.orange, c.purple];
if (flash >= 0) { var ps = []; for (var k = 0; k < 3; k++) { var a = 2 * M.PI * ((flash + k) % n) / n; ps.push([cx + R * M.sin(a), cy - R * M.cos(a)]); } s += pa(poly(ps), c.gold, 10, 'none'); }
for (var i = 0; i < n; i++) {
var a2 = 2 * M.PI * i / n, x = cx + R * M.sin(a2), y = cy - R * M.cos(a2);
s += ci(x, y, 17, st[i] ? c.ink : c.bg, cl[i % 3], 4) + tx(x, y + 5, st[i] ? 'T' : 'H', st[i] ? c.bg : c.ink, 14);
}
var cnt = [0, 0, 0]; for (i = 0; i < n; i++) cnt[i % 3] += st[i];
var tot = cnt[0] + cnt[1] + cnt[2];
L('m', 320, 50, n + '\\text{ coins}' + (n % 3 ? '' : ',\\ 3\\mid ' + n), c.ink, 'l');
L('k0', 320, 100, '\\text{tails, blue: } ' + cnt[0], c.blue, 'l');
L('k1', 320, 135, '\\text{tails, orange: } ' + cnt[1], c.orange, 'l');
L('k2', 320, 170, '\\text{tails, purple: } ' + cnt[2], c.purple, 'l');
var same = cnt[0] % 2 === cnt[1] % 2 && cnt[1] % 2 === cnt[2] % 2;
L('r', 320, 225, n % 3 ? (mi >= moves.length && tot === 1 ? '\\text{exactly one tail}' : '\\text{move } ' + mi + '\\text{ of } ' + moves.length) : (same ? '\\text{parities all match}' : ''), c.green, 'l');
return s;
};
V.cap = function () { return n % 3 ? 'With ' + n + ' coins, these ' + moves.length + ' moves (gold = the coins just flipped) leave a single tail.' : 'With 9 coins, every move flips one coin of each color, so the three tail counts stay all even or all odd. One tail alone is impossible.'; };
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
