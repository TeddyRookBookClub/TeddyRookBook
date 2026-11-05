/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-2023-p6. */
(window.CompViz = window.CompViz || {})['imo-2023-p6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  var st = 0, NST = 0;
  function stepper(n) { NST = n; V.reset = function () { st = 0; }; V.step = function () { st = M.min(NST, st + 1); }; V.back = function () { st = M.max(0, st - 1); }; V.final = function () { st = NST; }; }
  function PL(P, q, nm, c, o) { var p = P(q); o = o || [0, -11]; return dot(p, c.ink, 3.6) + tx([p[0] + o[0], p[1] + o[1] + 5], nm, c.ink, 14, 'middle', 600); }
  function AU(P, q, ctr, nm, c) { var p = P(q), r = P(ctr), d = G.sub(p, r), l = G.len(d) || 1; return PL(P, q, nm, c, [d[0] / l * 15, d[1] / l * 15]); }
  function CC(P, o, r, k, w, da) { return ci(P(o), r * P.s, null, k, w || 2, da); }
  function LN(P, a, b, k, w, da) { return ln(P(a), P(b), k, w || 2, da); }
  function XL(P, a, b, t, k, w, da) { var d = G.sub(b, a); return ln(P(G.sub(a, G.mul(d, t))), P(G.add(b, G.mul(d, t))), k, w || 1.5, da); }
  function foot(p, a, b) { var d = G.sub(b, a); return G.add(a, G.mul(d, G.dt(G.sub(p, a), d) / G.dt(d, d))); }
  function unit(v) { return G.mul(v, 1 / G.len(v)); }
  function cci(o1, r1, o2, r2) { var d = G.dist(o1, o2), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = M.sqrt(M.max(0, r1 * r1 - a * a)), u = unit(G.sub(o2, o1)), m = G.add(o1, G.mul(u, a)), n = [-u[1], u[0]]; return [G.add(m, G.mul(n, h)), G.sub(m, G.mul(n, h))]; }
  V.aria = 'An equilateral triangle ABC with points A1, B1, C1 inside on the three axes, the crossing points A2, B2, C2, a circle through A1, B1, A2, B2 whose chords A1A2 and B1B2 cross at R, and the three circles through A, A1, A2 and its partners, which all pass through two common points.';
  var gx = 72, gy = 88; stepper(2);
  var CAPS = ['The angles at A1, B1, C1 are 2x, 2y, 2z with x + y + z = 240°. Then ∠BA2C = x, so A1 is the centre of the circle through B, C and A2.',
    'A1, B1, A2, B2 lie on one circle, and its chords A1A2 and B1B2 cross at R inside. R has the same negative power for the circles AA1A2 and BB1B2, so those two circles cross.',
    'A linear relation between the three power functions, with weights sin x sin(z − y) and so on, puts both crossing points on the third circle as well.'];
  var F = ['\\angle BA_2C=x', 'CA_1\\cdot CB_2=CB_1\\cdot CA_2', '\\textstyle\\sum \\sin x\\sin(z-y)\\,\\mathrm{pow}_A=0'];
  V.sliders = [['x', 61, 89, 1, function () { return gx; }, function (v) { gx = v; }], ['y', 61, 89, 1, function () { return gy; }, function (v) { gy = v; }]];
  function rd(d) { return d * M.PI / 180; }
  function apex(P, Q, Rr, a) { var m = G.mid(P, Q), d = G.dist(P, Q) / 2 / M.tan(a); return G.add(m, G.mul(unit(G.sub(Rr, m)), d)); }
  function build() {
    var A = [0, 1], B = [-M.sqrt(3) / 2, -0.5], C = [M.sqrt(3) / 2, -0.5], gz = 240 - gx - gy;
    var A1 = apex(B, C, A, rd(gx)), B1 = apex(C, A, B, rd(gy)), C1 = apex(A, B, C, rd(gz));
    var A2 = G.meet(B, G.sub(C1, B), C, G.sub(B1, C)), B2 = G.meet(C, G.sub(A1, C), A, G.sub(C1, A)), C2 = G.meet(A, G.sub(B1, A), B, G.sub(A1, B));
    var wa = G.circ(A, A1, A2), wb = G.circ(B, B1, B2), wc = G.circ(C, C1, C2), ps = G.circ(A1, B1, A2), R = G.meet(A1, G.sub(A2, A1), B1, G.sub(B2, B1));
    var d = G.dist(wa.o, wb.o), a = (wa.r * wa.r - wb.r * wb.r + d * d) / (2 * d), h = M.sqrt(M.max(0, wa.r * wa.r - a * a)), u = unit(G.sub(wb.o, wa.o)), m = G.add(wa.o, G.mul(u, a)), n = [-u[1], u[0]];
    return { A: A, B: B, C: C, A1: A1, B1: B1, C1: C1, A2: A2, B2: B2, C2: C2, wa: wa, wb: wb, wc: wc, ps: ps, R: R, X: G.add(m, G.mul(n, h)), Y: G.sub(m, G.mul(n, h)), gz: gz };
  }
  function cl(p) { return [M.max(-2.2, M.min(2.2, p[0])), M.max(-2.2, M.min(2.2, p[1]))]; }
  V.draw = function (c, L) {
    var q = build(), pts = [[-1, -0.6], [1, 1.05]], s = '', i;
    if (q.gz <= 60 || q.gz >= 90) { L('f', 20, 338, '', c.ink, 'l'); return tx([320, 180], 'Choose x and y with 150° < x + y < 180°.', c.ink, 16); }
    if (st >= 2) pts.push(cl(q.X), cl(q.Y));
    var T = fitter(pts, 24, 18, 616, 312), dg = M.abs(gx - gy) < 0.5 || M.abs(gy - q.gz) < 0.5 || M.abs(gx - q.gz) < 0.5;
    s += pa(poly([T(q.A), T(q.B), T(q.C)], 1), c.ink, 2);
    [[q.B, q.A1, q.C], [q.C, q.B1, q.A], [q.A, q.C1, q.B]].forEach(function (t) { s += pa(poly(t.map(T)), c.muted, 1.2); });
    s += LN(T, q.B, q.A2, c.teal, 1.2) + LN(T, q.C, q.A2, c.teal, 1.2) + LN(T, q.C, q.B2, c.teal, 1.2) + LN(T, q.A, q.B2, c.teal, 1.2) + LN(T, q.A, q.C2, c.teal, 1.2) + LN(T, q.B, q.C2, c.teal, 1.2);
    if (st === 0) s += CC(T, q.A1, G.dist(q.A1, q.B), c.gold, 1.6, '5 4');
    if (st >= 1) s += CC(T, q.ps.o, q.ps.r, c.green, 1.6, '5 4') + LN(T, q.A1, q.A2, c.green, 2) + LN(T, q.B1, q.B2, c.green, 2);
    if (st >= 2 && !dg) s += CC(T, q.wa.o, q.wa.r, c.blue, 2) + CC(T, q.wb.o, q.wb.r, c.red, 2) + CC(T, q.wc.o, q.wc.r, c.purple, 2) + ci(T(q.X), 6, null, c.ink, 2) + ci(T(q.Y), 6, null, c.ink, 2);
    var ctr = [0, 0];
    s += AU(T, q.A, ctr, 'A', c) + AU(T, q.B, ctr, 'B', c) + AU(T, q.C, ctr, 'C', c);
    s += PL(T, q.A1, 'A₁', c, [0, 16]) + PL(T, q.B1, 'B₁', c, [-14, -4]) + PL(T, q.C1, 'C₁', c, [14, -4]) + PL(T, q.A2, 'A₂', c, [0, -10]) + PL(T, q.B2, 'B₂', c, [12, 6]) + PL(T, q.C2, 'C₂', c, [-12, 6]);
    if (st >= 1) s += PL(T, q.R, 'R', c, [-4, 16]);
    if (st >= 2 && !dg) s += PL(T, q.X, 'X', c, [14, -8]) + PL(T, q.Y, 'Y', c, [14, -8]);
    L('f', 20, 338, F[st] + '\\quad (z=' + q.gz + '^\\circ)', c.ink, 'l');
    return s;
  };
  V.cap = function () { var gz = 240 - gx - gy; if (gz <= 60 || gz >= 90) return 'z = 240° − x − y must lie between 60° and 90°.'; if (st >= 2 && (gx === gy || gy === gz || gx === gz)) return 'Two of x, y, z are equal: triangle A1B1C1 is isosceles and one circle collapses to a line. Move a slider.'; return CAPS[st]; };
  V.H = 360;
  /* ---- frame (shared by the IMO diagrams; each file is self-contained) ---- */
  function f1(n) { return (+n).toFixed(1); }
  function at(o) { var s = ''; for (var k in o) if (o[k] != null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function ln(p, q, k, w, da) { return '<line' + at({ x1: f1(p[0]), y1: f1(p[1]), x2: f1(q[0]), y2: f1(q[1]), stroke: k, 'stroke-width': w || 2, 'stroke-dasharray': da, 'stroke-linecap': 'round' }) + '/>'; }
  function ci(p, r, f, k, w, da) { return '<circle' + at({ cx: f1(p[0]), cy: f1(p[1]), r: f1(r), fill: f || 'none', stroke: k, 'stroke-width': k ? (w || 2) : null, 'stroke-dasharray': da }) + '/>'; }
  function pa(d, k, w, f, da) { return '<path' + at({ d: d, fill: f || 'none', stroke: k, 'stroke-width': k ? (w || 2) : null, 'stroke-dasharray': da, 'stroke-linejoin': 'round' }) + '/>'; }
  function re(x, y, w, h, f, k, r) { return '<rect' + at({ x: f1(x), y: f1(y), width: f1(w), height: f1(h), rx: r || 0, fill: f, stroke: k, 'stroke-width': k ? 1.5 : null }) + '/>'; }
  function tx(p, s, k, sz, an, wt) { return '<text' + at({ x: f1(p[0]), y: f1(p[1]), fill: k, 'font-size': sz || 15, 'text-anchor': an || 'middle', 'font-weight': wt, 'font-family': 'system-ui,sans-serif' }) + '>' + s + '</text>'; }
  function poly(p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); }
  function dot(p, k, r) { return ci(p, r || 4.5, k); }
  // plane geometry on [x, y] pairs
  var G = {
    add: function (a, b) { return [a[0] + b[0], a[1] + b[1]]; }, sub: function (a, b) { return [a[0] - b[0], a[1] - b[1]]; },
    mul: function (a, t) { return [a[0] * t, a[1] * t]; }, mid: function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; },
    len: function (a) { return M.sqrt(a[0] * a[0] + a[1] * a[1]); }, dist: function (a, b) { return G.len(G.sub(a, b)); },
    cr: function (a, b) { return a[0] * b[1] - a[1] * b[0]; }, dt: function (a, b) { return a[0] * b[0] + a[1] * b[1]; },
    dir: function (t) { return [M.cos(t), M.sin(t)]; },
    rot: function (v, t) { return [v[0] * M.cos(t) - v[1] * M.sin(t), v[0] * M.sin(t) + v[1] * M.cos(t)]; },
    meet: function (p, d, q, e) { var t = G.cr(G.sub(q, p), e) / G.cr(d, e); return G.add(p, G.mul(d, t)); },
    circ: function (a, b, c) { var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])), A = G.dt(a, a), B = G.dt(b, b), C = G.dt(c, c);
      var o = [(A * (b[1] - c[1]) + B * (c[1] - a[1]) + C * (a[1] - b[1])) / d, (A * (c[0] - b[0]) + B * (a[0] - c[0]) + C * (b[0] - a[0])) / d]; return { o: o, r: G.dist(o, a) }; },
    lc: function (p, d, o, r) { var a = G.dt(d, d), b = 2 * G.dt(d, G.sub(p, o)), c = G.dt(G.sub(p, o), G.sub(p, o)) - r * r, D = b * b - 4 * a * c;
      if (D < 0) return []; D = M.sqrt(D); return [G.add(p, G.mul(d, (-b - D) / (2 * a))), G.add(p, G.mul(d, (-b + D) / (2 * a)))]; },
    other: function (p, d, o, r, known) { var s = G.lc(p, d, o, r); if (!s.length) return null; return G.dist(s[0], known) > G.dist(s[1], known) ? s[0] : s[1]; },
    refl: function (p, a, d) { var u = G.mul(d, 1 / G.len(d)), v = G.sub(p, a), t = G.dt(v, u); return G.sub(G.add(a, G.mul(u, 2 * t)), v); }
  };
  // fit math points (y up) into the drawing area
  function fitter(pts, x0, y0, x1, y1) {
    var a = 1e9, b = -1e9, c = 1e9, d = -1e9; pts.forEach(function (p) { a = M.min(a, p[0]); b = M.max(b, p[0]); c = M.min(c, p[1]); d = M.max(d, p[1]); });
    var s = M.min((x1 - x0) / (b - a || 1), (y1 - y0) / (d - c || 1)), ox = (x0 + x1) / 2 - s * (a + b) / 2, oy = (y0 + y1) / 2 + s * (c + d) / 2;
    var f = function (p) { return [ox + s * p[0], oy - s * p[1]]; }; f.s = s; return f;
  }
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
    seen[key] = 1; var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.3vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  (V.sliders || []).forEach(function (s) {
    var lab = D.createElement('label'); lab.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:.9em;min-height:40px';
    var inp = D.createElement('input'); inp.type = 'range'; inp.min = s[1]; inp.max = s[2]; inp.step = s[3]; inp.value = s[4](); inp.style.width = '120px';
    inp.setAttribute('aria-label', s[0]); lab.appendChild(D.createTextNode(s[0])); lab.appendChild(inp); bar.appendChild(lab);
    inp.addEventListener('input', function () { s[5](+inp.value); render(); });
  });
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
  if (V.reset) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
