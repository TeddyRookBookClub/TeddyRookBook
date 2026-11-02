/* Our own diagram for the Tokyo Tech physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['tt-2026-2'] = function (el, api) {
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
  V.H = 352; V.T = 12; V.loop = false; V.steps = 12;
  V.aria = 'An LC circuit is pumped: the capacitor gap is widened whenever the charge peaks and put back whenever the charge is zero. The charge swing and the energy grow in steps.';
  var a = 2, b = 1, N = 3, sim = (function () {
    var o = [], g = 1, Q = 0, I = -1, dt = 1 / 2000, t = 0, st = 0, n2 = 0, n3 = 0, pI = I, pQ = Q, ev = [];
    while (t < 13.2) {
      I += -Q * g * dt; Q += I * dt; t += dt;
      if (st === 0 && pI * I <= 0 && n2 < N) { g = a; n2++; st = 1; ev.push([t, 1]); }
      else if (st === 1 && pQ * Q <= 0 && n3 < N) { g = b; n3++; st = 0; ev.push([t, 0]); }
      pI = I; pQ = Q; if (M.round(t * 2000) % 20 === 0) o.push([t, Q, 0.5 * I * I + 0.5 * g * Q * Q, g]);
    }
    return { o: o, ev: ev };
  })();
  var X = function (tt) { return 170 + tt / 13.2 * 450; }, YQ = function (q) { return 105 - q * 24; }, YE = function (e) { return 334 - e * 14; };
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 352, c.panel), o = sim.o, n = M.min(o.length - 1, M.floor(t / V.T * o.length)), cur = o[n], j, dq = '', de = '';
    s += ln(170, 105, 625, 105, c.grid, 1) + ln(170, 334, 625, 334, c.axis, 1.5) + ln(170, 34, 170, 176, c.axis, 1.5) + ln(170, 200, 170, 334, c.axis, 1.5);
    for (j = 0; j <= n; j += 2) { dq += (j ? 'L' : 'M') + f1(X(o[j][0])) + ' ' + f1(YQ(o[j][1])); de += (j ? 'L' : 'M') + f1(X(o[j][0])) + ' ' + f1(YE(o[j][2])); }
    s += pa(dq, c.blue, 2) + pa(de, c.gold, 2.5);
    sim.ev.forEach(function (e) { if (e[0] <= cur[0]) s += ln(X(e[0]), 30, X(e[0]), 334, e[1] ? c.orange : c.green, 1, '3 4'); });
    var gap = 14 + 14 * (cur[3] - 1) * 1.6, cy = 150, pq = M.max(-1, M.min(1, cur[1] / 3));
    s += rc(60 - gap / 2 - 8, cy - 50, 8, 100, c.ink) + rc(60 + gap / 2, cy - 50, 8, 100, c.ink);
    s += rc(60 - gap / 2 - 8, cy - 50, 8, 100 * M.abs(pq), pq > 0 ? c.red : c.blue) + rc(60 + gap / 2, cy - 50, 8, 100 * M.abs(pq), pq > 0 ? c.blue : c.red);
    L('gap', 60, cy + 70, cur[3] > 1.5 ? '\\text{gap } ad' : '\\text{gap } d', c.ink);
    L('C', 60, cy - 72, 'C\\propto\\dfrac{1}{\\text{gap}}', c.ink);
    L('Q', 162, 40, 'Q', c.blue, 'r'); L('E', 162, 220, 'E', c.gold, 'r');
    L('w', 178, 194, '\\text{widen at full charge: } E\\to E\\cdot\\tfrac{\\text{new gap}}{\\text{old gap}}', c.orange, 'l');
    L('r', 178, 220, '\\text{reset at } Q=0\\text{: free}', c.green, 'l');
    L('f', 178, 248, 'E_N=\\tfrac12CV^2\\,a^Nb^{\\,1-N}\\quad(a=2,\\ b=1)', c.ink, 'l');
    return s;
  };
  V.cap = function (t) { return 'Each widening at a charge peak does work against the plates’ attraction, so the energy steps up. Each reset happens with no charge on the plates, so it costs nothing.'; };
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
