/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1995-p5. */
(window.CompViz = window.CompViz || {})['imo-1995-p5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 420;
  V.aria = 'A convex hexagon whose corners at C and F are equilateral. Reflecting in line BE swaps A and D and sends C, F to C prime and F prime outside. Points G and H move on arcs where the angles AGB and DHE are 120 degrees; the broken path from C prime through G and H to F prime is never shorter than the straight segment, which equals CF.';
  var tg = 0.5, th = 0.5, dir = 1, sc = 60, cx0 = 320, cy0 = 195;
  var B = [-2, 0], E = [2.2, 0], A = [0.1, 1.55], Dd = [0.1, -1.55];
  function apex(p, q, side) { var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], k = M.sqrt(3) / 2; var a1 = [mx - dy * k, my + dx * k], a2 = [mx + dy * k, my - dx * k]; return (a1[0] - side[0]) * (a1[0] - side[0]) + (a1[1] - side[1]) * (a1[1] - side[1]) > (a2[0] - side[0]) * (a2[0] - side[0]) + (a2[1] - side[1]) * (a2[1] - side[1]) ? a1 : a2; }
  var C = apex(B, Dd, E), F = apex(E, A, B), Cp = [C[0], -C[1]], Fp = [F[0], -F[1]];
  function arcPt(p, q, apx, t) { var o = [(p[0] + q[0] + apx[0]) / 3, (p[1] + q[1] + apx[1]) / 3], r = M.hypot(p[0] - o[0], p[1] - o[1]), a = M.atan2(p[1] - o[1], p[0] - o[0]), b = M.atan2(q[1] - o[1], q[0] - o[0]), m = M.atan2(-(apx[1] - o[1]), -(apx[0] - o[0]));
    var d1 = ((a - m + 3 * M.PI) % (2 * M.PI)) - M.PI, d2 = ((b - m + 3 * M.PI) % (2 * M.PI)) - M.PI, ang = m + d1 + (d2 - d1) * t; return [o[0] + r * M.cos(ang), o[1] + r * M.sin(ang)]; }
  function dd(p, q) { return M.hypot(p[0] - q[0], p[1] - q[1]); }
  function S(p) { return [cx0 + p[0] * sc, cy0 - p[1] * sc]; }
  V.reset = function () { tg = 0.5; th = 0.5; dir = 1; };
  V.advance = function (dt) { tg += dir * dt * 0.25; th = 1 - tg; if (tg > 0.9) { tg = 0.9; dir = -1; } if (tg < 0.1) { tg = 0.1; dir = 1; } th = 1 - tg; };
  V.step = function () { tg += 0.2; if (tg > 0.9) tg = 0.1; th = 1 - tg; };
  V.final = function () { tg = 0.35; th = 0.6; };
  V.draw = function (c, L) {
    var G = arcPt(A, B, Cp, tg), H = arcPt(Dd, E, Fp, th), s = '', P = [A, B, C, Dd, E, F].map(S);
    s += pa(poly(P, 1), c.ink, 2, c.grid);
    s += ln(S(B)[0], S(B)[1], S(E)[0], S(E)[1], c.muted, 1.5, '6 4');
    s += pa(poly([A, B, Cp].map(S), 1), c.purple, 1.5, c.purpleSoft) + pa(poly([Dd, E, Fp].map(S), 1), c.purple, 1.5, c.purpleSoft);
    s += ln(S(C)[0], S(C)[1], S(F)[0], S(F)[1], c.green, 2, '3 4') + ln(S(Cp)[0], S(Cp)[1], S(Fp)[0], S(Fp)[1], c.green, 3);
    s += pa(poly([A, G, B].map(S)), c.blue, 2) + pa(poly([Dd, H, E].map(S)), c.blue, 2) + pa(poly([Cp, G, H, Fp].map(S)), c.red, 2.5);
    var lab = [['A', A, [0, -14]], ['B', B, [-14, 0]], ['C', C, [-12, 10]], ['D', Dd, [0, 15]], ['E', E, [14, 0]], ['F', F, [12, -10]], ["C'", Cp, [-12, -10]], ["F'", Fp, [12, 10]], ['G', G, [6, 14]], ['H', H, [-6, -14]]];
    lab.forEach(function (q) { var p = S(q[1]); s += ci(p[0], p[1], 4, q[0].indexOf("'") > 0 ? c.purple : (q[0] === 'G' || q[0] === 'H' ? c.red : c.ink)); L(q[0], p[0] + q[2][0], p[1] + q[2][1], q[0], c.ink); });
    var lhs = dd(A, G) + dd(G, B) + dd(G, H) + dd(Dd, H) + dd(H, E);
    L('f', 14, 404, 'AG+GB+GH+DH+HE=' + lhs.toFixed(2) + '\\ \\ge\\ CF=' + dd(C, F).toFixed(2), c.ink, 'l');
    return s;
  };
  V.cap = function () { return "Purple: equilateral triangles ABC' and DEF', mirror images of BCD and EFA in line BE. Since AG + GB = GC' and DH + HE = HF', the red broken line has the length on the left."; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w, da) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + '/>'; }
  function pa(d, k, w, f, da) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linejoin="round"/>'; }
  function re(x, y, w, h, f, k, r) { return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + (r || 0) + '" fill="' + f + '"' + (k ? ' stroke="' + k + '" stroke-width="1.5"' : '') + '/>'; }
  function tx(x, y, s, k, sz, an, wt) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 16) + '" text-anchor="' + (an || 'middle') + '"' + (wt ? ' font-weight="' + wt + '"' : '') + ' font-family="system-ui,sans-serif">' + s + '</text>'; }
  function poly(p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); }
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + V.H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', V.aria); svg.style.display = 'block'; svg.style.borderRadius = '8px';
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {}, lbg = 'transparent', seen = {};
  function L(key, x, y, s, col, an) {
    seen[key] = 1;
    var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var playing = false, last = 0;
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
    svg.innerHTML = '<rect x="0" y="0" width="' + W + '" height="' + V.H + '" fill="' + c.panel + '"/>' + V.draw(c, L);
    for (var k in labs) if (!seen[k]) L(k, 0, 0, '');
    cap.textContent = V.cap ? V.cap() : '';
  }
  function frame(ts) {
    if (!playing) return;
    if (!el.isConnected) { playing = false; return; }
    var dt = last ? M.min(0.1, (ts - last) / 1000) : 0; last = ts;
    if (V.advance(dt) === false) stop();
    if (el.offsetParent !== null) render();
    if (playing) requestAnimationFrame(frame);
  }
  function play() { if (playing) return; if (V.done && V.done()) V.reset(); playing = true; last = 0; pb.textContent = 'Pause'; requestAnimationFrame(frame); }
  function stop() { playing = false; if (pb) pb.textContent = 'Play'; }
  var pb = V.advance ? btn('Play', function () { if (playing) stop(); else play(); }) : null;
  if (V.back) btn('Back', function () { stop(); V.back(); render(); });
  if (V.step) btn('Step', function () { stop(); V.step(); render(); });
  if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
