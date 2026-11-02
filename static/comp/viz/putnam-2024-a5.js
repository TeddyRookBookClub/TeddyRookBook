/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2024-a5. */
(window.CompViz = window.CompViz || {})['putnam-2024-a5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; var r = 4, ang = 0.6, RS = [0, 2, 4, 6, 8], ri = 2, curve = [];
  V.aria = 'A big circle of radius 9 and a small disk of radius 1 at distance r from the center. From a point P on the big circle, two tangent lines cut off the arc of endpoints Q that make the chord hit the disk. A graph shows the probability as a function of r, smallest at r equal to 0.';
  function prob(rr) { var s = 0, N = 360; for (var i = 0; i < N; i++) { var t = (i + .5) / N * 2 * M.PI, d = M.sqrt(81 + rr * rr - 18 * rr * M.cos(t)); s += M.asin(M.min(1, 1 / d)); } return 2 / M.PI * s / N; }
  for (var k = 0; k <= 40; k++) curve.push(prob(k / 5));
  V.reset = function () { ang = 0.6; };
  V.advance = function (dt) { ang += dt * 0.5; };
  V.step = function () { ri = (ri + 1) % RS.length; r = RS[ri]; };
  V.final = function () { ang = 2.2; };
  V.draw = function (c, L) {
    var cx = 150, cy = 160, S = 14, s = '', i;
    var P = [9 * M.cos(ang), 9 * M.sin(ang)], dx = r - P[0], dy = -P[1], d = M.sqrt(dx * dx + dy * dy), b = M.atan2(dy, dx), al = M.asin(M.min(1, 1 / d));
    function sc(q) { return [cx + q[0] * S, cy - q[1] * S]; }
    function hit(phi) { var ux = M.cos(phi), uy = M.sin(phi), tt = -2 * (P[0] * ux + P[1] * uy); return [P[0] + tt * ux, P[1] + tt * uy]; }
    var Q1 = hit(b - al), Q2 = hit(b + al), a1 = M.atan2(Q1[1], Q1[0]), a2 = M.atan2(Q2[1], Q2[0]);
    s += ci(cx, cy, 9 * S, 'none', c.ink, 2);
    var T2 = 2 * M.PI, md = function (u) { return ((u % T2) + T2) % T2; }, d12 = md(a2 - a1), dP = md(ang - a1);
    var ccw = dP > d12, span = ccw ? d12 : T2 - d12, A1 = sc(Q1), A2 = sc(Q2);
    s += pa('M' + f1(A1[0]) + ' ' + f1(A1[1]) + 'A' + 9 * S + ' ' + 9 * S + ' 0 ' + (span > M.PI ? 1 : 0) + ' ' + (ccw ? 0 : 1) + ' ' + f1(A2[0]) + ' ' + f1(A2[1]), c.red, 6);
    var PP = sc(P);
    s += ln(PP[0], PP[1], A1[0], A1[1], c.orange, 1.5) + ln(PP[0], PP[1], A2[0], A2[1], c.orange, 1.5);
    s += ci(cx + r * S, cy, S, c.blue, c.blue, 1) + ci(cx, cy, 2.5, c.muted) + ci(PP[0], PP[1], 5, c.ink);
    L('P', PP[0] + (PP[0] - cx) * .12, PP[1] + (PP[1] - cy) * .12, 'P', c.ink);
    var x0 = 360, y0 = 40, w = 250, h = 190, lo = 0.06, hi = 0.115, pts = [];
    s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.5) + ln(x0, y0, x0, y0 + h, c.axis, 1.5);
    for (i = 0; i <= 40; i++) pts.push([x0 + i / 40 * w, y0 + h - (curve[i] - lo) / (hi - lo) * h]);
    s += pa(poly(pts), c.green, 2.5);
    var mx = x0 + r / 8 * w, my = y0 + h - (prob(r) - lo) / (hi - lo) * h;
    s += ci(mx, my, 6, c.orange) + tx(x0, y0 + h + 22, '0', c.muted, 15) + tx(x0 + w, y0 + h + 22, '8', c.muted, 15) + tx(x0 + w / 2, y0 + h + 22, 'r', c.muted, 16);
    L('f', x0 - 10, 275, '\\Pr=\\dfrac{2}{\\pi}\\cdot\\overline{\\arcsin\\frac{1}{|P-c|}}', c.ink, 'l');
    L('v', x0 + w, y0 - 14, 'r=' + r + ':\\ ' + prob(r).toFixed(4), c.orange, 'r');
    L('a', 20, 305, '\\text{red arc: }4\\arcsin\\frac{1}{|P-c|}', c.red, 'l');
    return s;
  };
  V.cap = function () { return 'Step changes r. Chords from P hit the blue disk exactly when the other end lands on the red arc. Averaged over P, this is smallest when the disk is centered.'; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
  function pa(d, k, w, f, da, op) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + (op ? ' fill-opacity="' + op + '"' : '') + ' stroke-linejoin="round"/>'; }
  function tx(x, y, s, k, sz, an) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 16) + '" text-anchor="' + (an || 'middle') + '" font-family="system-ui,sans-serif">' + s + '</text>'; }
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
  if (V.step) btn('Step', function () { stop(); V.step(); render(); });
  if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
