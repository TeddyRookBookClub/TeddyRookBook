/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2024-4-1'] = function (el, api) {
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
  V.H = 340; V.T = 8; V.loop = true; V.steps = 8;
  V.aria = 'Equipotential lines of a positive and a negative point charge, drawn at equal steps of potential. A probe slides along the line through the charges, and a graph below shows the potential along that line.';
  var cache = {}, qx1 = 230, qx2 = 410, qy = 125, sc = 60, step = 0.25;
  function pot(x, y) { var a = M.hypot(x - qx2, y - qy) / sc, b = M.hypot(x - qx1, y - qy) / sc; return 1 / M.max(a, 0.05) - 1 / M.max(b, 0.05); }
  function img(c) {
    var key = c.ink + c.panel; if (cache[key]) return cache[key];
    var w = 640, h = 250, cv = D.createElement('canvas'); cv.width = w; cv.height = h;
    var g = cv.getContext('2d'), im = g.createImageData(w, h), lv = new Int16Array(w * h), x, y, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) lv[y * w + x] = M.floor(pot(x, y) / step + 0.5);
    function rgb(hex) { var v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
    var ink = rgb(c.ink), bg = rgb(c.panel), rd = rgb(c.red), bl = rgb(c.blue);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x; var v = lv[i], edge = (x < w - 1 && lv[i + 1] !== v) || (y < h - 1 && lv[i + w] !== v), p = i * 4, col = bg;
      if (edge && M.abs(v) < 24) col = ink; else { var tnt = M.min(1, M.abs(v) / 14) * 0.25; var k = v > 0 ? rd : bl; col = [bg[0] + (k[0] - bg[0]) * tnt, bg[1] + (k[1] - bg[1]) * tnt, bg[2] + (k[2] - bg[2]) * tnt]; }
      im.data[p] = col[0]; im.data[p + 1] = col[1]; im.data[p + 2] = col[2]; im.data[p + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return (cache[key] = cv.toDataURL());
  }
  V.bg = function (c) { return {url: img(c), h: 250}; };
  V.draw = function (t, c, L) {
    var s = rc(0, 250, 640, 90, c.panel);
    s += ci(qx1, qy, 12, c.blue) + tx(qx1, qy + 5, '\u2212', '#fff', 18) + ci(qx2, qy, 12, c.red) + tx(qx2, qy + 5, '+', '#fff', 18);
    s += ln(320, 0, 320, 250, c.gold, 2.5, '7 5');
    var gy = 300, i, pts = [], px = 30 + (t / V.T) * 580;
    s += ln(20, gy, 620, gy, c.axis, 1.2);
    for (i = 0; i <= 300; i++) { var x = 20 + i * 2; if (M.abs(x - qx1) < 9 || M.abs(x - qx2) < 9) { if (pts.length > 1) s += pa(poly(pts), c.green, 2.5); pts = []; continue; } pts.push([x, gy - M.max(-38, M.min(38, pot(x, qy) * 9))]); }
    if (pts.length > 1) s += pa(poly(pts), c.green, 2.5);
    var near = M.abs(px - qx1) < 14 || M.abs(px - qx2) < 14, pv = pot(px, qy);
    s += ln(px, qy, px, gy, c.muted, 1, '3 3') + ci(px, qy, 6, c.gold, c.ink, 1.5) + ci(px, gy - M.max(-38, M.min(38, pv * 9)), 5, c.gold);
    L('f', 16, 16, 'V = kq\\left(\\dfrac{1}{r_+} - \\dfrac{1}{r_-}\\right)', c.ink, 'l');
    L('z', 328, 236, 'V = 0', c.gold, 'l');
    L('pv', 624, 268, near ? '\\text{near a charge}' : 'V \\approx ' + f1(pv, 2) + '\\ \\text{(arb. units)}', c.ink, 'r');
    return s;
  };
  V.cap = function () { return 'Lines are drawn at equal steps of potential. They crowd around each charge, where the field is strong, and the middle line is the V = 0 line.'; };
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
