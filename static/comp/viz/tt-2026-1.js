/* Our own diagram for the Tokyo Tech physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['tt-2026-1'] = function (el, api) {
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
  V.H = 340; V.T = 12; V.loop = true; V.steps = 12;
  V.aria = 'Two blocks on parallel rails, joined by a slanted spring, slide toward each other, squeeze past while the spring is compressed, and swing apart. Below, a ball rides the spring-energy curve over the hill at zero separation.';
  var k = 1, m = 1, h = 0.6, l = 1, B = 1.05 * M.sqrt(l * (l - h)), S = 120, cx = 320, r1 = 48, r2 = r1 + h * S;
  function U(D) { var s = M.sqrt(D * D + h * h) - l; return 0.5 * k * s * s; }
  var sim = (function () { var o = [], D = 2 * B, v = 0, dt = 1 / 1200, i, n = 12 * 1200; for (i = 0; i <= n; i++) { if (i % 20 === 0) o.push(D); var s = M.sqrt(D * D + h * h), F = -k * (s - l) * D / s; v += 2 * F / m * dt; D += v * dt; } return o; })();
  var E0 = U(2 * B), px = function (D) { return 120 + (D + 1.38) / 2.76 * 400; }, py = function (u) { return 318 - u / 0.14 * 110; };
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 340, c.panel), D = sim[M.min(sim.length - 1, M.round(t * 60))], xp = cx + D / 2 * S, xq = cx - D / 2 * S, j;
    s += ln(30, r1 + 14, 610, r1 + 14, c.axis, 2) + ln(30, r2 + 14, 610, r2 + 14, c.axis, 2);
    s += ln(cx, r1 - 6, cx, r2 + 22, c.grid, 1, '4 4');
    var zz = 'M' + f1(xp) + ' ' + r1, dx = xq - xp, dy = r2 - r1, Ls = M.sqrt(dx * dx + dy * dy), nx = -dy / Ls, ny = dx / Ls;
    for (j = 1; j < 14; j++) zz += 'L' + f1(xp + dx * j / 14 + nx * (j % 2 ? 7 : -7)) + ' ' + f1(r1 + dy * j / 14 + ny * (j % 2 ? 7 : -7));
    var comp = M.sqrt(D * D + h * h) < l;
    s += pa(zz + 'L' + f1(xq) + ' ' + r2, comp ? c.orange : c.ink, 1.8);
    s += rc(xp - 16, r1 - 14, 32, 28, c.green) + rc(xq - 16, r2 - 14, 32, 28, c.blue);
    s += ar(600, r1 + 2, 600, r2 - 2, c.muted, 1.4) + ar(600, r2 - 2, 600, r1 + 2, c.muted, 1.4);
    L('P', xp, r1 - 26, 'P', c.green); L('Q', xq, r2 + 30, 'Q', c.blue); L('h', 614, (r1 + r2) / 2, 'h', c.muted, 'l');
    L('sym', 24, 20, 'x_P=-x_Q,\\ \\ D=x_P-x_Q', c.ink, 'l');
    var d = '', u; for (j = 0; j <= 80; j++) { u = -1.38 + 2.76 * j / 80; d += (j ? 'L' : 'M') + f1(px(u)) + ' ' + f1(py(U(u))); }
    s += ln(110, 318, 530, 318, c.axis, 1.5) + pa(d, c.gold, 2.5) + ln(110, py(E0), 530, py(E0), c.purple, 1.4, '6 4');
    s += ln(px(0), py(U(0)), px(0), 318, c.grid, 1, '3 3') + ci(px(D), py(U(D)), 8, c.red);
    L('U', 350, 186, 'U(D)=\\tfrac12k\\left(\\sqrt{D^2+h^2}-l\\right)^2', c.gold, 'l');
    L('Ut', px(0), py(U(0)) - 16, '\\tfrac12k(l-h)^2', c.ink);
    L('E', 104, py(E0), 'E', c.purple, 'r'); L('D', 538, 318, 'D', c.muted, 'l');
    L('B', 24, 172, 'B>B_0=\\sqrt{l(l-h)}', c.ink, 'l');
    return s;
  };
  V.cap = function (t) { var D = sim[M.min(sim.length - 1, M.round(t * 60))]; return M.sqrt(D * D + h * h) < l ? 'The spring is shorter than its natural length (orange): it pushes the blocks apart, and the ball climbs the hill at D = 0.' : 'The spring is stretched: it pulls the blocks together. They started with a bit more energy than the hill, so they always get over it.'; };
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
