/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2026-2-4'] = function (el, api) {
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
  V.H = 320; V.T = 10; V.loop = false; V.steps = 10;
  V.aria = 'Block A hits block B1, which is joined to block B2 by a spring. The pair drifts right while the spring stretches and squeezes. Energy bars split the pair’s energy into its overall motion and its internal motion.';
  var m = 1, Mm = 2, v0 = 90, k = 6.25, N = 140, w = 30;
  var sim = (function () {
    var out = [], dt = 1 / 600, xa = 40, va = v0, x1 = 200, v1 = 0, x2 = 340, v2 = 0, hit = false, tt = 0, i = 0;
    while (tt <= 10 + 1e-9) {
      if (i % 10 === 0) out.push([xa, x1, x2, v1, v2, hit]);
      if (!hit && xa + w >= x1) { hit = true; var nv = (m - Mm) / (m + Mm) * va; v1 = 2 * m / (m + Mm) * va; va = nv; }
      var f = k * ((x2 - x1) - N);
      v1 += f / Mm * dt; v2 -= f / Mm * dt; x1 += v1 * dt; x2 += v2 * dt; xa += va * dt; tt += dt; i++;
    }
    return out;
  })();
  V.draw = function (t, c, L) {
    var s = rc(0, 0, 640, 320, c.panel), st = sim[M.min(sim.length - 1, M.round(t * 60))], gy = 130;
    s += ln(10, gy + 16, 630, gy + 16, c.axis, 2);
    s += rc(st[0], gy - 14, w, 30, c.purple);
    var a = st[1] + w, b = st[2], zz = 'M' + a + ' ' + gy, j;
    for (j = 1; j < 12; j++) zz += 'L' + f1(a + (b - a) * j / 12) + ' ' + (gy + (j % 2 ? -9 : 9));
    s += pa(zz + 'L' + b + ' ' + gy, c.ink, 1.8);
    s += rc(st[1], gy - 16, w, 32, c.green) + rc(st[2], gy - 16, w, 32, c.green);
    L('A', st[0] + w / 2, gy - 30, 'A', c.purple); L('B1', st[1] + w / 2, gy - 30, 'B_1', c.green); L('B2', st[2] + w / 2, gy - 30, 'B_2', c.green);
    var Vc = m / (m + Mm) * v0, Etot = st[5] ? 0.5 * Mm * (st[3] * st[3] + st[4] * st[4]) + 0.5 * k * M.pow(st[2] - st[1] - N, 2) : 0;
    var Ecm = st[5] ? Mm * Vc * Vc : 0, sp = 0.5 * k * M.pow(st[2] - st[1] - N, 2), sc = 220 / (2 * Mm * Vc * Vc), by = 200;
    s += rc(140, by, Ecm * sc, 18, c.blue) + rc(140 + Ecm * sc, by, (Etot - Ecm - sp) * sc, 18, c.gold) + rc(140 + (Etot - sp) * sc, by, sp * sc, 18, c.orange);
    s += rc(140, by, 220, 18, null, c.axis, 1);
    L('l1', 132, by + 9, '\\text{energy of B}', c.ink, 'r');
    L('k1', 140, by + 36, '\\text{whole-pair motion } MV^2', c.blue, 'l');
    L('k2', 140, by + 60, '\\text{internal motion}', c.gold, 'l');
    L('k3', 140, by + 84, '\\text{spring}', c.orange, 'l');
    L('x', 400, by + 36, '\\tfrac12 k x_{\\max}^2 = 2MV^2 - MV^2', c.ink, 'l');
    L('x2', 400, by + 72, 'x_{\\max} = V\\sqrt{\\dfrac{2M}{k}}', c.ink, 'l');
    L('V', 16, 24, 'V = \\dfrac{m}{m+M}\\,v_0', c.ink, 'l');
    return s;
  };
  V.cap = function (t) { return 'The whole-pair part (blue) never changes after the hit. The rest trades back and forth between the blocks’ relative motion and the spring. It is all in the spring at maximum stretch.'; };
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
