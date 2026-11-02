/* Our own diagram for the Tokyo Tech physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['tt-2026-3'] = function (el, api) {
  'use strict';
  var D = document, W = 640, NS = 'http://www.w3.org/2000/svg', M = Math;
  var V = {H: 300, T: 6, loop: true, steps: 12, aria: '', extra: null};
  function f1(n, d) { return (+n).toFixed(d == null ? 1 : d); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
  function rc(x, y, w, h, f, k, sw) { return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(M.max(0, w)) + '" height="' + f1(M.max(0, h)) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (sw || 2) + '"' : '') + ' rx="3"/>'; }
  function pa(d, k, w, f, da) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linejoin="round"/>'; }
  function tx(x, y, s, k, sz, an) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 14) + '" text-anchor="' + (an || 'middle') + '" font-family="system-ui,sans-serif">' + s + '</text>'; }
  function ar(a, b, c, d, k, w) {
    var dx = c - a, dy = d - b, L = M.sqrt(dx * dx + dy * dy); if (L < 1) return '';
    var ux = dx / L, uy = dy / L, h = M.min(10, L * 0.6) + (w || 2);
    var bx = c - ux * h, by = d - uy * h;
    return ln(a, b, bx, by, k, w) + '<polygon points="' + f1(c) + ',' + f1(d) + ' ' + f1(bx - uy * h * 0.45) + ',' + f1(by + ux * h * 0.45) + ' ' + f1(bx + uy * h * 0.45) + ',' + f1(by - ux * h * 0.45) + '" fill="' + k + '"/>';
  }
  function poly(pts) { var s = ''; for (var i = 0; i < pts.length; i++) s += (i ? 'L' : 'M') + f1(pts[i][0]) + ' ' + f1(pts[i][1]); return s; }
  V.H = 380; V.T = 10; V.loop = true; V.steps = 8;
  V.aria = 'A pressure-volume diagram of the cycle: squeeze at the saturated pressure while vapor condenses, heat at fixed volume until all is vapor, expand without heat, and cool at fixed volume. A small cylinder shows the liquid forming and boiling away.';
  var v2 = 8 / 27, p3 = 45 / 8, p4 = 10 / 9;
  var X = function (v) { return 70 + v / 1.08 * 360; }, Y = function (p) { return 300 - p / 6 * 262; };
  function pt(u) {
    if (u < 1) return [1 - (1 - v2) * u, 1, u * 19 / 27];
    if (u < 2) { u -= 1; return [v2, 1 + (p3 - 1) * u, (1 - M.min(1, u * 1.6)) * 19 / 27]; }
    if (u < 3) { u -= 2; var v = v2 + (1 - v2) * u; return [v, p3 * M.pow(v2 / v, 4 / 3), 0]; }
    u -= 3; return [1, p4 - (p4 - 1) * u, 0];
  }
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 380, c.panel), u = t / V.T * 4, P = pt(u), j, d = '', q;
    s += ln(70, 300, 450, 300, c.axis, 1.6) + ln(70, 300, 70, 26, c.axis, 1.6);
    for (j = 0; j <= 80; j++) { q = pt(j / 20); d += (j ? 'L' : 'M') + f1(X(q[0])) + ' ' + f1(Y(q[1])); }
    s += pa(d + 'Z', c.gold, 2.4, c.goldSoft);
    [[1, 1], [v2, 1], [v2, p3], [1, p4]].forEach(function (q, i) { s += ci(X(q[0]), Y(q[1]), 5, c.ink); L('s' + i, X(q[0]) + (i % 3 ? -12 : 12), Y(q[1]) + (i === 2 ? -4 : i === 3 ? -14 : 14), String(i + 1), c.ink); });
    s += ci(X(P[0]), Y(P[1]), 8, c.red);
    L('pa', 62, 30, 'p', c.muted, 'r'); L('va', 452, 300, 'V', c.muted, 'l'); L('p0', 62, Y(1), 'p_0', c.muted, 'r');
    L('V1', X(1), 316, 'V_1', c.muted); L('V2', X(v2), 316, 'V_2', c.muted);
    var top = 60, bot = 250, ht = (bot - top) * P[0], lq = P[2] * 26, cxl = 500;
    s += pa('M' + (cxl - 40) + ' ' + (top - 10) + 'L' + (cxl - 40) + ' ' + bot + 'L' + (cxl + 40) + ' ' + bot + 'L' + (cxl + 40) + ' ' + (top - 10), c.ink, 2.4);
    s += rc(cxl - 38, bot - ht, 76, ht - lq, c.blueSoft) + rc(cxl - 38, bot - lq, 76, lq, c.blue) + rc(cxl - 40, bot - ht - 8, 80, 8, c.axis);
    var leg = M.min(3, M.floor(u)), F = ['W_{12}=p_0(V_1-V_2)', 'Q_{23}=nC_V\\Delta T+n_l(L-RT_0)', 'TV^{\\gamma-1}=\\text{const}', 'Q_{41}=-nC_V(T_4-T_0)'];
    L('leg', 70, 350, F[leg], c.ink, 'l');
    L('e', 470, 350, 'e=\\dfrac{W}{Q_{23}}=\\dfrac{2}{29}', c.green, 'l');
    L('liq', cxl, bot + 14, P[2] > 0.01 ? '\\text{liquid}' : '\\text{all vapor}', c.blue);
    return s;
  };
  V.cap = function (t) { return ['1 → 2: squeezed at the saturated pressure. The pressure stays at p₀ while vapor turns to liquid.', '2 → 3: heated at fixed volume. The liquid boils away, then the vapor warms up.', '3 → 4: expands with no heat in or out, cooling as it goes.', '4 → 1: cooled at fixed volume back to the start.'][M.min(3, M.floor(t / V.T * 4))]; };
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + V.H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', V.aria); svg.style.display = 'block';
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {}, lbg = 'transparent';
  function L(key, x, y, s, col, an) {
    var o = labs[key];
    if (!o) { o = labs[key] = {d: D.createElement('div'), s: null}; lay.appendChild(o.d); }
    var d = o.d;
    d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, d); else d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var t = 0, playing = false, last = 0, raf = 0;
  var bgu = '';
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9';
    if (V.bg) { var b = V.bg(c); if (b.url !== bgu) { bgu = b.url; svg.style.background = c.panel + ' url(' + b.url + ') no-repeat 0 0 / 100% ' + (b.h / V.H * 100) + '%'; } }
    svg.innerHTML = V.draw(t, c, L); if (V.cap) cap.textContent = V.cap(t);
  }
  function frame(ts) {
    raf = 0; if (!playing) return;
    if (!el.isConnected) { playing = false; return; }
    if (last) t += M.min(0.1, (ts - last) / 1000); last = ts;
    if (t >= V.T) { if (V.loop) t = t % V.T; else { t = V.T; stop(); } }
    if (el.offsetParent !== null) render();
    if (playing) raf = requestAnimationFrame(frame);
  }
  function stop() { playing = false; pb.textContent = 'Play'; pb.setAttribute('aria-pressed', 'false'); }
  function play() { if (t >= V.T && !V.loop) t = 0; playing = true; last = 0; pb.textContent = 'Pause'; pb.setAttribute('aria-pressed', 'true'); if (!raf) raf = requestAnimationFrame(frame); }
  var pb = btn('Play', function () { if (playing) stop(); else play(); });
  btn('Step', function () { stop(); var dt = V.T / V.steps; t = M.min(V.T, (M.floor(t / dt + 1e-6) + 1) * dt); if (t >= V.T && V.loop) t = 0; render(); });
  btn('Restart', function () { t = 0; render(); if (!api.reduced()) play(); });
  if (V.extra) V.extra(btn, render);
  api.onTheme(render);
  if (api.reduced()) { t = V.final == null ? V.T : V.final; render(); } else { render(); play(); }
};
