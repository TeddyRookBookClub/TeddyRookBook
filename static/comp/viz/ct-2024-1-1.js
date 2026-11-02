/* Our own diagram for the Common Test physics solutions guide (not from the exam paper). */
(window.CompViz = window.CompViz || {})['ct-2024-1-1'] = function (el, api) {
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
  V.aria = 'A right-triangle plate stands on the floor with one bottom corner against a wall. A push at the top corner grows; the torque bars compare the push with gravity until the plate starts to tip.';
  function Fof(t) { return M.min(0.9, t / 6 * 0.9); }
  V.draw = function (t, c, L) {
    var F = Fof(t), crit = 2 / 3, phi = F > crit ? M.min(0.35, (F - crit) * 3) : 0;
    var Ax = 120, Ay = 250, S = 150, s = '';
    function P(x, y) { var cs = M.cos(phi), sn = M.sin(phi); return [Ax + x * cs + y * sn, Ay - x * sn + y * cs]; }
    s += rc(0, 0, 640, 300, c.panel);
    s += rc(Ax - 22, 40, 22, 232, c.grid) + rc(Ax - 22, Ay, 330, 22, c.grid);
    var A = P(0, 0), C = P(S, 0), B = P(S, -S), G = P(2 * S / 3, -S / 3);
    s += pa(poly([A, C, B]) + 'Z', c.green, 2.5, c.greenSoft);
    s += ci(A[0], A[1], 6, c.gold) + tx(A[0] + 2, A[1] + 34, 'pivot', c.muted, 13);
    s += ln(A[0], Ay + 30, A[0] + 2 * S / 3, Ay + 30, c.muted, 1.2) + ln(A[0] + 2 * S / 3, Ay - 4, A[0] + 2 * S / 3, Ay + 34, c.muted, 1, '3 3');
    s += ar(G[0], G[1], G[0], G[1] + 55, c.blue, 3) + ci(G[0], G[1], 4, c.ink);
    var fl = 30 + F * 110;
    s += ar(B[0] + fl, B[1], B[0] + 2, B[1], c.red, 3);
    s += ln(Ax + S + 160, Ay, Ax + S + 160, Ay - S, c.muted, 1.2) + ln(Ax + S + 154, Ay - S, Ax + S + 166, Ay - S, c.muted, 1.2);
    var bx = 470, bw = 150;
    s += tx(bx, 70, 'torque about the pivot', c.muted, 13, 'start');
    s += rc(bx, 86, bw, 18, c.grid) + rc(bx, 86, bw * F / 0.9, 18, c.red);
    s += rc(bx, 150, bw, 18, c.grid) + rc(bx, 150, bw * crit / 0.9, 18, c.blue);
    s += ln(bx + bw * crit / 0.9, 80, bx + bw * crit / 0.9, 176, c.ink, 1.5, '4 3');
    L('tf', bx, 122, '\\tau_F = F\\,L = ' + f1(F, 2) + '\\,MgL', c.red, 'l');
    L('tg', bx, 186, '\\tau_g = Mg\\cdot\\tfrac{2L}{3}', c.blue, 'l');
    L('arm', A[0] + S / 3, Ay + 48, '\\tfrac{2L}{3}', c.ink);
    L('h', Ax + S + 176, Ay - S / 2, 'L', c.ink, 'l');
    L('F', B[0] + fl + 14, B[1], 'F', c.red, 'l');
    L('g', G[0] - 10, G[1] + 40, 'Mg', c.blue, 'r');
    L('res', bx + 40, 236, F >= crit - 1e-9 ? 'F_{\\max} = \\tfrac{2}{3}Mg' : 'F < \\tfrac{2}{3}Mg', F >= crit ? c.gold : c.ink);
    return s;
  };
  V.cap = function (t) { var F = Fof(t); return F < 2 / 3 ? 'Push F = ' + F.toFixed(2) + ' Mg: gravity’s torque still wins, so the plate stays put.' : 'Push F = ' + F.toFixed(2) + ' Mg: past 2/3 Mg the push wins and the plate tips about the pivot.'; };
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
