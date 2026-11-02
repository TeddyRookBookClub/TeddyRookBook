/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2026-4-3'] = function (el, api) {
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
  V.H = 320; V.T = 6; V.loop = true; V.steps = 12;
  V.aria = 'Left: a charged particle launched at 45 degrees arcs back to the plate it entered through. Right: it enters a magnetic field and turns a half circle. A button changes the mass, which changes the size of the half circle.';
  var q = 1, qs = [1, 2, 4], qi = 0;
  V.extra = function (btn, render) { var b = btn('Mass ×1', function () { qi = (qi + 1) % 3; q = qs[qi]; b.textContent = 'Mass ×' + q; render(); }); };
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 320, c.panel), Lp = 200, x0 = 40, yb = 230, ya = 60, k;
    s += rc(x0 - 10, ya - 6, Lp + 40, 8, c.blue) + rc(x0 - 10, yb, Lp + 40, 8, c.red);
    s += rc(x0 - 10, yb, 18, 8, c.panel) + rc(x0 + Lp - 8, yb, 18, 8, c.panel);
    s += tx(x0 + Lp + 36, ya + 2, 'A', c.muted, 13, 'start') + tx(x0 + Lp + 36, yb + 8, 'B (higher V)', c.muted, 13, 'start');
    var ph1 = M.min(1, t / 3), pts = [], i;
    for (i = 0; i <= 40; i++) { var u = ph1 * i / 40; pts.push([x0 + Lp * u, yb - 2 * Lp / 2 * u * (1 - u) * 1.0]); }
    s += pa(poly(pts), c.green, 2.5);
    var cx = 360, top = 90, r0 = 60, r = r0 * M.sqrt(q);
    s += rc(cx - 20, top, 290, 210, c.purpleSoft);
    for (i = 0; i < 5; i++) for (k = 0; k < 4; k++) s += ci(cx + i * 55, top + 30 + k * 50, 2.5, c.purple);
    var ph2 = M.max(0, M.min(1, (t - 3) / 2.5)), Px = cx + 20, arc = [];
    for (i = 0; i <= 40; i++) { var a = M.PI * ph2 * i / 40; arc.push([Px + r - r * M.cos(a), top + r * M.sin(a)]); }
    s += ln(Px, top - 40, Px, top, c.green, 2.5, ph2 > 0 ? '' : '4 4');
    if (ph2 > 0) s += pa(poly(arc), c.green, 2.5);
    s += ci(Px, top, 4, c.ink) + ci(Px + 2 * r, top, 4, c.ink);
    var cur = t < 3 ? pts[pts.length - 1] : arc[arc.length - 1];
    s += ci(cur[0], cur[1], 6, c.gold);
    L('L', x0, 290, 'L = \\dfrac{m v^2}{eE}', c.ink, 'l');
    L('r', 620, 34, 'r = \\dfrac{mv}{eB} = \\dfrac{\\sqrt{m\\cdot mv^2}}{eB}', c.ink, 'r');
    L('P', Px - 8, top - 14, 'P', c.ink, 'r');
    L('R', Px + 2 * r + 8, top - 14, 'R', c.ink, 'l');
    L('pr', 348, 306, 'PR = 2r = ' + (q === 1 ? '' : '\\sqrt{' + q + '}\\,') + '(PR)_{m}', c.gold, 'l');
    return s;
  };
  V.cap = function () { return 'Same path in the plates means the same m v². A heavier particle is slower, but its momentum mv = √(m · mv²) is larger, so its half circle is wider by √(mass ratio).'; };
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
