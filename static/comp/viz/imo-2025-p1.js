/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2025-p1. */
(window.CompViz = window.CompViz || {})['imo-2025-p1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 380;
  V.aria = 'The triangle of lattice points with a plus b at most n plus 1, covered by n lines. The buttons switch between covers with 0, 1 and 3 sunny lines; sunny lines are drawn in gold.';
  var n = 5, k = 3;
  V.buttons = [['n − 1', function () { n = M.max(3, n - 1); }], ['n + 1', function () { n = M.min(8, n + 1); }], ['0 sunny', function () { k = 0; }], ['1 sunny', function () { k = 1; }], ['3 sunny', function () { k = 3; }]];
  function lines() {
    var out = [], i;
    if (k === 0) for (i = 1; i <= n; i++) out.push({ p: [0, i], d: [1, 0], s: 0 });
    if (k === 1) { for (i = 1; i < n; i++) out.push({ p: [0, i], d: [1, 0], s: 0 }); out.push({ p: [1, n], d: [1, 1], s: 1 }); }
    if (k === 3) { for (i = n + 1; i >= 5; i--) out.push({ p: [i, 0], d: [1, -1], s: 0 }); out.push({ p: [1, 1], d: [1, 1], s: 1 }, { p: [1, 2], d: [2, -1], s: 1 }, { p: [2, 1], d: [1, -2], s: 1 }); }
    return out;
  }
  V.draw = function (c, L) {
    var s = '', g = (V.H - 40) / (n + 0.7), x0 = 24 - 0.35 * g, y0 = V.H - 20 + 0.35 * g, a, b;
    function P(x, y) { return [x0 + x * g, y0 - y * g]; }
    var lo = P(0.35, 0.35), hi = P(n + 0.65, n + 0.65);
    s += '<defs><clipPath id="imo25c"><rect x="' + f1(lo[0]) + '" y="' + f1(hi[1]) + '" width="' + f1(hi[0] - lo[0]) + '" height="' + f1(lo[1] - hi[1]) + '"/></clipPath></defs>';
    s += '<g clip-path="url(#imo25c)">';
    lines().forEach(function (l) { var e1 = P(l.p[0] - 20 * l.d[0], l.p[1] - 20 * l.d[1]), e2 = P(l.p[0] + 20 * l.d[0], l.p[1] + 20 * l.d[1]); s += ln(e1[0], e1[1], e2[0], e2[1], l.s ? c.gold : c.blue, l.s ? 3.5 : 2.5); });
    s += '</g>';
    var nb = 0;
    for (a = 1; a <= n; a++) for (b = 1; a + b <= n + 1; b++) { var q = P(a, b), bd = a === 1 || b === 1 || a + b === n + 1; if (bd) nb++; s += ci(q[0], q[1], g * 0.13 + 2, bd ? c.red : c.ink); }
    var ax = P(0.4, 0.4); s += ln(ax[0], ax[1], P(n + 0.6, 0)[0], ax[1], c.axis, 1) + ln(ax[0], ax[1], ax[0], P(0, n + 0.6)[1], c.axis, 1);
    L('a', 420, 50, 'n=' + n + ',\\ k=' + k, c.ink, 'l');
    L('b', 420, 90, '\\text{sunny lines: gold}', c.gold, 'l');
    L('c', 420, 130, '3n-3=' + nb + '\\ \\text{on the sides}', c.red, 'l');
    L('d', 420, 170, '\\text{others: at most 2 each}', c.muted, 'l');
    L('e', 420, 210, '2n=' + (2 * n) + (2 * n < nb ? '<' : '\\ge') + (3 * n - 3), c.muted, 'l');
    return s;
  };
  V.cap = function () { return 'Red dots are on the three side lines. ' + (k === 3 ? 'The blue diagonals peel off everything except a size-3 triangle, which three sunny lines cover.' : k === 1 ? 'Horizontal lines plus one sunny line through the top point.' : 'All horizontal lines: no sunny line at all.') + ' Two sunny lines is impossible for every n.'; };
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
