/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2024-2-4'] = function (el, api) {
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
  V.H = 320; V.T = 6; V.loop = false; V.steps = 6;
  V.aria = 'A bottle rocket shoots small slugs of water downward and moves upward. Two bars show that the upward momentum of the rocket equals the downward momentum of the water.';
  var dt = 0.5, dv = 3, u = 80;
  function yAt(t) { var q = 0, k; for (k = 1; k <= 10; k++) q += dv * M.max(0, t - k * dt); return q; }
  function count(t) { return M.min(10, M.floor(t / dt + 1e-9)); }
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 320, c.panel), n = count(t), y = 0, i, x = 150;
    y = yAt(t); var yR = 200 - y;
    s += ln(40, 300, 300, 300, c.axis, 2);
    for (i = 1; i <= n; i++) { var ys = 276 - yAt(i * dt) + u * (t - i * dt); if (ys < 296) s += rc(x - 4, ys, 8, 12, c.blue); }
    s += pa('M' + (x - 22) + ' ' + (yR + 60) + 'L' + (x - 22) + ' ' + (yR - 10) + 'Q' + x + ' ' + (yR - 50) + ' ' + (x + 22) + ' ' + (yR - 10) + 'L' + (x + 22) + ' ' + (yR + 60) + 'Z', c.green, 2.5, c.panel);
    s += rc(x - 21, yR + 20 + n * 2, 42, 40 - n * 2, c.blueSoft) + rc(x - 5, yR + 60, 10, 14, c.green);
    if (n > 0) s += ar(x + 42, yR + 30, x + 42, yR - 12, c.green, 3) + ar(x - 42, yR + 70, x - 42, yR + 112, c.blue, 3);
    var bx = 300, base = 170, h = n * 12;
    s += ln(bx, base, 600, base, c.axis, 1.5);
    s += rc(bx + 20, base - h, 60, h, c.green) + rc(bx + 130, base, 60, h, c.blue);
    L('p1', bx + 50, 30, '\\text{rocket } M v \\uparrow', c.green);
    L('p2', bx + 160, 304, '\\text{water } \\Sigma\\,\\Delta m\\,u \\downarrow', c.blue);
    L('eq', 632, 112, 'M\\,\\Delta v - \\Delta m\\,u = 0', c.ink, 'r');
    L('th', 632, 150, 'F = \\dfrac{\\Delta m\\,u}{\\Delta t} = 2ps', c.ink, 'r');
    L('n', 50, 24, n ? n + '\\ \\text{slug' + (n > 1 ? 's' : '') + ' out}' : '\\text{at rest}', c.muted, 'l');
    return s;
  };
  V.cap = function (t) { return count(t) ? 'Each slug that shoots down at speed u gives the rocket the same upward kick. The bars stay equal: the total momentum is still zero.' : 'Before launch, nothing moves, so the total momentum is zero.'; };
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
