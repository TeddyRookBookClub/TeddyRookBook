/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2024-3-2'] = function (el, api) {
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
  V.H = 280; V.T = 15; V.loop = true; V.steps = 5;
  V.aria = 'A string fixed at both ends vibrates as a standing wave with one to five loops. A graph beside it shows that the frequency grows in proportion to the number of loops.';
  V.draw = function (t, c, L) {
    var n = M.floor(t / 3) + 1, ph = t * 2 * M.PI * 1.2, s = rc(0, 0, 640, 280, c.panel);
    var x0 = 40, x1 = 400, y0 = 120, A = 45 * M.cos(ph), i, pts = [], pts2 = [];
    for (i = 0; i <= 120; i++) { var x = x0 + (x1 - x0) * i / 120, sn = M.sin(n * M.PI * i / 120); pts.push([x, y0 - A * sn]); pts2.push([x, y0 + 45 * sn]); }
    var env = pts2.map(function (p) { return p; });
    s += pa(poly(env), c.grid, 1.5, null, '4 4');
    s += pa(poly(pts2.map(function (p) { return [p[0], 2 * y0 - p[1]]; })), c.grid, 1.5, null, '4 4');
    s += pa(poly(pts), c.green, 3);
    s += rc(x0 - 12, y0 - 60, 10, 120, c.axis) + rc(x1 + 2, y0 - 60, 10, 120, c.axis);
    for (i = 0; i <= n; i++) s += ci(x0 + (x1 - x0) * i / n, y0, 5, c.ink);
    for (i = 0; i < n; i++) s += ci(x0 + (x1 - x0) * (i + 0.5) / n, y0 - A, 4, c.gold);
    s += ar(x0 + 2, 205, x1 - 2, 205, c.muted, 1.2) + ar(x1 - 2, 205, x0 + 2, 205, c.muted, 1.2);
    if (n > 1) s += ln(x0, 232, x0 + 2 * (x1 - x0) / n, 232, c.red, 4);
    var gx = 450, gy = 240, gw = 160, gh = 190;
    s += ln(gx, gy, gx + gw, gy, c.axis, 1.5) + ln(gx, gy, gx, gy - gh, c.axis, 1.5);
    s += ln(gx, gy, gx + gw * 5.5 / 5.5, gy - gh * 5.5 / 6, c.grid, 1.5, '5 4');
    for (i = 1; i <= 5; i++) s += ci(gx + gw * i / 5.5, gy - gh * i / 6, i === n ? 7 : 4, i <= n ? (i === n ? c.gold : c.blue) : c.grid) + tx(gx + gw * i / 5.5, gy + 18, i, c.muted, 12);
    L('Lr', (x0 + x1) / 2, 192, 'L', c.ink);
    L('lam', x0 + 10, 258, '\\lambda = \\dfrac{2L}{n} = \\dfrac{2L}{' + n + '}', c.red, 'l');
    L('n', 220, 26, 'n = ' + n + '\\ \\text{loop' + (n > 1 ? 's' : '') + '}', c.ink);
    L('f', gx + 6, 30, 'f_n = \\dfrac{v}{\\lambda} = n\\,\\dfrac{v}{2L}', c.ink, 'l');
    L('ax', gx + gw - 10, gy + 34, 'n', c.muted);
    return s;
  };
  V.cap = function (t) { var n = M.floor(t / 3) + 1; return n + ' loop' + (n > 1 ? 's' : '') + ': each loop is half a wavelength, so the wavelength is 2L/' + n + ' and the frequency is ' + n + ' times the lowest one.'; };
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
