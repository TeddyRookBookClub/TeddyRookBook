/* Our own visualization for the Teddy Rook Book math challenge "cm-level-chord". */
(window.CompViz = window.CompViz || {})['cm-level-chord'] = function (el, api) {
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
V.split = 450;
V.H = 320; var h = 0.5, x = 0, found = [];
V.aria = 'The trail f(x) = sin squared of 5 pi x over 2 minus x. A chord of fixed length slides along it; the lower graph shows f(x+h) minus f(x). For h = 1/2, 1/3 and 1/4 the lower graph crosses zero. For h = 2/5 it is a constant negative line, so there is no level chord.';
function f(t) { var s = M.sin(2.5 * M.PI * t); return s * s - t; }
function g(t) { return f(t + h) - f(t); }
V.reset = function () { x = 0; found = []; };
V.advance = function (dt) { var x1 = M.min(1 - h, x + dt * 0.12); if (g(x) * g(x1) <= 0 && M.abs(g(x) - g(x1)) > 1e-12) found.push(x - g(x) * (x1 - x) / (g(x1) - g(x))); x = x1; if (x >= 1 - h - 1e-9) return false; };
V.done = function () { return x >= 1 - h - 1e-9; };
V.final = function () { var N = 400; found = []; for (var i = 0; i < N; i++) { var a = i * (1 - h) / N, b = (i + 1) * (1 - h) / N; if (g(a) * g(b) <= 0) found.push(a); } x = 1 - h; };
function pick(v) { return function () { h = v; V.reset(); V.final(); }; }
V.buttons = [['h = 1/2', pick(0.5)], ['h = 1/3', pick(1 / 3)], ['h = 1/4', pick(0.25)], ['h = 2/5', pick(0.4)]];
V.draw = function (c, L) {
var x0 = 40, w = 400, ty = 30, th = 150, gy = 205, gh = 90, s = '';
function X(t) { return x0 + t * w; } function Yf(v) { return ty + th - (v + 1) / 2 * th; } function Yg(v) { return gy + gh / 2 - v / 1.6 * gh; }
var xs = [], ys = [], ys2 = [], xs2 = [];
for (var i = 0; i <= 200; i++) { var t = i / 200; xs.push(t); ys.push(f(t)); if (t <= 1 - h + 1e-9) { xs2.push(t); ys2.push(g(t)); } }
s += ln(X(0), Yf(0), X(1), Yf(0), c.grid, 1.5) + pa(plot(x0, ty, w, th, xs, ys, [0, 1], [-1, 1]), c.green, 2.5);
s += ln(X(0), Yg(0), X(1), Yg(0), c.axis, 1.2) + pa(plot(x0, gy, w, gh, xs2, ys2, [0, 1], [0.8, -0.8].reverse()), c.blue, 2);
s += tx(X(1) + 6, Yg(0) + 4, '0', c.muted, 11, 'start');
var lev = M.abs(g(x)) < 0.02;
s += ln(X(x), Yf(f(x)), X(x + h), Yf(f(x + h)), lev ? c.gold : c.red, 3) + ci(X(x), Yf(f(x)), 4, c.ink) + ci(X(x + h), Yf(f(x + h)), 4, c.ink);
s += ln(X(x), gy, X(x), gy + gh, c.muted, 1, '3 3') + ci(X(x), Yg(g(x)), 4, c.blue);
found.forEach(function (t) { s += ci(X(t), Yg(0), 5, c.gold) + ln(X(t), Yf(f(t)), X(t + h), Yf(f(t + h)), c.gold, 2); });
var lab = { 0.5: '\\tfrac12', 0.4: '\\tfrac25', 0.25: '\\tfrac14' }[h] || '\\tfrac13';
L('h', 460, 50, 'h=' + lab, c.ink, 'l');
L('f', 460, 95, 'f(x)=\\sin^2\\tfrac{5\\pi x}{2}-x', c.green, 'l');
L('g', 460, 140, 'f(x+h)-f(x)', c.blue, 'l');
L('r', 460, 200, h === 0.4 ? '\\text{constant } -\\tfrac25:\\ \\text{never level}' : found.length ? '\\text{level chord found}' : '', h === 0.4 ? c.red : c.gold, 'l');
L('t', 460, 250, h === 0.4 ? '' : '\\sum_k g(\\tfrac km)=f(1)-f(0)=0', c.muted, 'l');
return s;
};
V.cap = function () { return h === 0.4 ? 'With h = 2/5 this trail has no level stretch: the difference is always −2/5.' : 'Gold: level chords of length ' + (h === 0.5 ? '1/2' : h === 0.25 ? '1/4' : '1/3') + '. The lower graph must cross zero.'; };
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
