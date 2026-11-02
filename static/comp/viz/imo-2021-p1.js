/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2021-p1. */
(window.CompViz = window.CompViz || {})['imo-2021-p1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 300;
  V.aria = 'A number line from n to 2n with three marked cards whose pairwise sums are consecutive squares. Two of the three must share a pile.';
  var ns = [100, 150, 230, 400, 1000, 2021], ni = 0;
  function pick(n) { for (var k = 3; k < 200; k++) { var x = 2 * k * k - 4 * k, z = 2 * k * k + 4 * k; if (x >= n && z <= 2 * n) return k; } return 0; }
  V.buttons = [['Next n', function () { ni = (ni + 1) % ns.length; }]];
  V.draw = function (c, L) {
    var n = ns[ni], k = pick(n), x = 2 * k * k - 4 * k, y = 2 * k * k + 1, z = 2 * k * k + 4 * k, s = '', X0 = 40, X1 = 600, yl = 200;
    function P(v) { return X0 + (v - n) / n * (X1 - X0); }
    s += ln(X0, yl, X1, yl, c.axis, 2) + ln(X0, yl - 8, X0, yl + 8, c.axis, 2) + ln(X1, yl - 8, X1, yl + 8, c.axis, 2);
    s += tx(X0, yl + 64, 'n = ' + n, c.muted, 15, 'start') + tx(X1, yl + 64, '2n = ' + 2 * n, c.muted, 15, 'end');
    var pts = [[x, c.blue], [y, c.orange], [z, c.purple]];
    function arcp(a, b, h, col, lab, key) { var pa1 = P(a), pb = P(b), m = (pa1 + pb) / 2; s += pa('M' + f1(pa1) + ' ' + yl + ' Q ' + f1(m) + ' ' + f1(yl - 2 * h) + ' ' + f1(pb) + ' ' + yl, col, 2.5); L(key, m, yl - h - 4, lab, col); }
    arcp(x, y, 40, c.teal, x + '+' + y + '=' + (2 * k - 1) + '^2', 'a1');
    arcp(y, z, 40, c.teal, y + '+' + z + '=' + (2 * k + 1) + '^2', 'a2');
    arcp(x, z, 95, c.gold, x + '+' + z + '=' + (2 * k) + '^2', 'a3');
    pts.forEach(function (p, i) { s += re(P(p[0]) - 13, yl - 18, 26, 36, c.bg, p[1], 4); L('v' + i, P(p[0]), yl + 32 + (i % 2) * 18, String(p[0]), p[1]); });
    L('f', 20, 22, '2k^2-4k,\\ \\ 2k^2+1,\\ \\ 2k^2+4k\\qquad(k=' + k + ')', c.ink, 'l');
    L('g', 20, 50, k * k + 2 * k + '\\le n\\le ' + (2 * k * k - 4 * k), c.muted, 'l');
    return s;
  };
  V.cap = function () { return 'n = ' + ns[ni] + '. The three cards lie between n and 2n, and each pair adds up to a perfect square. With two piles, some pile gets two of them.'; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w, da) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + '/>'; }
  function pa(d, k, w, f, da) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linejoin="round"/>'; }
  function re(x, y, w, h, f, k, r) { return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + (r || 0) + '" fill="' + f + '"' + (k ? ' stroke="' + k + '" stroke-width="1.5"' : '') + '/>'; }
  function tx(x, y, s, k, sz, an, wt) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 16) + '" text-anchor="' + (an || 'middle') + '"' + (wt ? ' font-weight="' + wt + '"' : '') + ' font-family="system-ui,sans-serif">' + s + '</text>'; }
  function poly(p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); }
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + V.H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', V.aria); svg.style.display = 'block'; svg.style.borderRadius = '8px';
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {}, lbg = 'transparent', seen = {};
  function L(key, x, y, s, col, an) {
    seen[key] = 1;
    var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var playing = false, last = 0;
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
    svg.innerHTML = '<rect x="0" y="0" width="' + W + '" height="' + V.H + '" fill="' + c.panel + '"/>' + V.draw(c, L);
    for (var k in labs) if (!seen[k]) L(k, 0, 0, '');
    cap.textContent = V.cap ? V.cap() : '';
  }
  function frame(ts) {
    if (!playing) return;
    if (!el.isConnected) { playing = false; return; }
    var dt = last ? M.min(0.1, (ts - last) / 1000) : 0; last = ts;
    if (V.advance(dt) === false) stop();
    if (el.offsetParent !== null) render();
    if (playing) requestAnimationFrame(frame);
  }
  function play() { if (playing) return; if (V.done && V.done()) V.reset(); playing = true; last = 0; pb.textContent = 'Pause'; requestAnimationFrame(frame); }
  function stop() { playing = false; if (pb) pb.textContent = 'Play'; }
  var pb = V.advance ? btn('Play', function () { if (playing) stop(); else play(); }) : null;
  if (V.back) btn('Back', function () { stop(); V.back(); render(); });
  if (V.step) btn('Step', function () { stop(); V.step(); render(); });
  if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
