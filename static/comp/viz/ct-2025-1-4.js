/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2025-1-4'] = function (el, api) {
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
  V.H = 300; V.T = 8; V.loop = false; V.steps = 8;
  V.aria = 'Three electrons enter a region with the same speed. With both fields on, one goes straight. With only the magnetic field, one curves at constant speed. With only the electric field, one curves and speeds up.';
  var x0 = 150, x1 = 450, y0 = 150, v0 = 60, a = 5.6, R = 560, thx = M.asin(300 / R);
  function stS(t) { return [x0 - 120 + v0 * t, y0, v0]; }
  function st2(t) { var tau = t - 2; if (tau <= 0) return stS(t); var ti = M.min(tau, 5); return [x0 + v0 * tau, y0 - a * ti * ti / 2 - a * 5 * M.max(0, tau - 5), M.hypot(v0, a * ti)]; }
  function stB(t) { var tau = t - 2; if (tau <= 0) return stS(t); var th = M.min(v0 * tau / R, thx), r = M.max(0, v0 * tau - R * thx); return [x0 + R * M.sin(th) + r * M.cos(th), y0 + R * (1 - M.cos(th)) + r * M.sin(th), v0]; }
  function trail(f, t, k) { var p = [], i; for (i = 0; i <= 60; i++) { var q = f(t * i / 60); p.push([q[0], q[1]]); } return pa(poly(p), k, 2.5); }
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 300, c.panel) + rc(x0, 40, x1 - x0, 220, c.goldSoft, c.gold, 1.5);
    s += tx(x1 - 8, 254, 'field region', c.muted, 12, 'end');
    var e = st2(t), b = stB(t), q = stS(t);
    s += trail(stS, t, c.green) + trail(st2, t, c.red) + trail(stB, t, c.blue);
    s += ci(q[0], q[1], 6, c.green) + ci(e[0], e[1], 6, c.red) + ci(b[0], b[1], 6, c.blue);
    L('v1', 20, 18, 'v_1 = ' + f1(q[2] / v0, 2) + 'v_0', c.green, 'l');
    L('v2', 230, 18, 'v_2 = ' + f1(e[2] / v0, 2) + 'v_0', c.red, 'l');
    L('v3', 440, 18, 'v_3 = ' + f1(b[2] / v0, 2) + 'v_0', c.blue, 'l');
    L('a', 10, 286, '\\text{both: } eE = ev_0B', c.green, 'l');
    L('b', 230, 286, '\\text{B only: } W_B = 0', c.blue, 'l');
    L('c', 430, 286, '\\text{E only: } W_E > 0', c.red, 'l');
    return s;
  };
  V.cap = function (t) { return t < V.T ? 'Watch the speed readouts: only the electric force can change the speed.' : 'Result: v₂ > v₁ = v₃. The magnetic force bends the path but never changes the speed.'; };
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
