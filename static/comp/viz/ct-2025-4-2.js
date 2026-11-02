/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2025-4-2'] = function (el, api) {
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
  V.H = 320; V.T = 8; V.loop = false; V.steps = 8;
  V.aria = 'A rod slides along rails at steady speed and charges a capacitor through a resistor. The current graph decays from its largest value toward zero, and energy bars show the stored energy and the heat growing equal.';
  var tau = 1.6;
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 320, c.panel), q = 1 - M.exp(-t / tau), I = M.exp(-t / tau);
    var ry = 60, ry2 = 200, rx = 120 + ((t * 22) % 160);
    s += ln(60, ry, 300, ry, c.axis, 3) + ln(60, ry2, 300, ry2, c.axis, 3);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) s += ci(150 + i * 45, 85 + j * 45, 2.5, c.muted);
    s += ln(60, ry, 60, 105, c.ink, 2) + ln(42, 105, 78, 105, c.ink, 3) + ln(42, 115, 78, 115, c.ink, 3) + ln(60, 115, 60, 135, c.ink, 2);
    s += rc(52, 135, 16, 40, c.panel, c.ink, 2) + ln(60, 175, 60, ry2, c.ink, 2);
    s += rc(82, 92, 10, 30 * q, c.redSoft);
    s += rc(rx - 4, ry - 10, 8, ry2 - ry + 20, c.gold, c.ink, 1);
    s += ar(rx + 10, 130, rx + 46, 130, c.ink, 2);
    if (I > 0.03) s += ar(rx, ry2 - 20, rx, ry2 - 20 - 50 * I, c.red, 3);
    var gx = 360, gy = 150, gw = 250, gh = 110, pts = [], n;
    s += ln(gx, gy, gx + gw, gy, c.axis, 1.5) + ln(gx, gy, gx, gy - gh, c.axis, 1.5);
    for (n = 0; n <= 100; n++) { var tt = V.T * n / 100; if (tt > t) break; pts.push([gx + gw * tt / V.T, gy - gh * 0.9 * M.exp(-tt / tau)]); }
    if (pts.length > 1) s += pa(poly(pts), c.red, 2.5);
    var by = 290, bw = 220, W = 1 * q, U = 0.5 * q, J = 0.5 * q;
    s += rc(gx + 50, by - 72, bw * W, 16, c.gold) + rc(gx + 50, by - 46, bw * U, 16, c.blue) + rc(gx + 50, by - 20, bw * J, 16, c.orange);
    L('W', gx + 44, by - 64, 'W', c.gold, 'r'); L('U', gx + 44, by - 38, 'U', c.blue, 'r'); L('J', gx + 44, by - 12, 'J', c.orange, 'r');
    L('I', gx + 6, 24, 'I = \\dfrac{vBl}{R}\\,e^{-t/RC}', c.red, 'l');
    L('F', gx + gw, 172, 'F = IBl', c.ink, 'r');
    L('E', 20, 236, 'W = CV_1^2,\\ \\ U = J = \\tfrac12 CV_1^2', c.ink, 'l');
    L('lab', 20, 270, '\\text{rod EMF } V_1 = vBl', c.muted, 'l');
    return s;
  };
  V.cap = function (t) { return t < V.T ? 'The capacitor fills up, pushes back, and the current fades. The force needed to keep the rod moving fades with it.' : 'Fully charged: half the work went into the capacitor and half became heat in the resistor.'; };
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
