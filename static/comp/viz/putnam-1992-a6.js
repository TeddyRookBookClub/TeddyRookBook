/* Our own animation for the Putnam solutions guide: random tetrahedra on a sphere, and the eight-choices argument. */
(window.CompViz = window.CompViz || {})['putnam-1992-a6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 360, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'Left: a sphere with a random tetrahedron; the center lights up when it is inside, and a counter tracks the fraction, which settles near one eighth. In the second mode, three lines through the center and a fourth point are fixed, and eight small pictures show the eight ways to choose line ends; exactly one of them surrounds the center.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col + (t ? '' : ';display:none');
    if (o.t !== t) { o.t = t; if (t) api.tex(t, o.d); }
  }
  function rnd() { var v; do { v = [M.random() * 2 - 1, M.random() * 2 - 1, M.random() * 2 - 1]; } while (dot(v, v) > 1 || dot(v, v) < 1e-4); var n = M.sqrt(dot(v, v)); return [v[0] / n, v[1] / n, v[2] / n]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function det(a, b, c) { return a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]); }
  function coef(u, p) { // solve c1 u1 + c2 u2 + c3 u3 = -p (Cramer)
    var q = [-p[0], -p[1], -p[2]], d = det(u[0], u[1], u[2]);
    return [det(q, u[1], u[2]) / d, det(u[0], q, u[2]) / d, det(u[0], u[1], q) / d];
  }
  var ang = 0.4, tilt = 0.35;
  function proj(v, cx, cy, r) {
    var x = v[0] * M.cos(ang) + v[2] * M.sin(ang), z = -v[0] * M.sin(ang) + v[2] * M.cos(ang);
    var y = v[1] * M.cos(tilt) - z * M.sin(tilt), z2 = v[1] * M.sin(tilt) + z * M.cos(tilt);
    return [cx + r * x, cy - r * y, z2];
  }
  function f(n) { return (+n).toFixed(1); }
  function tetra(P, cx, cy, r, c, ok, w) {
    var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + c.blueSoft + '" stroke="' + c.axis + '" stroke-width="' + (w ? 1 : 1.5) + '"/>';
    var Q = P.map(function (p) { return proj(p, cx, cy, r); }), i, j;
    for (i = 0; i < 4; i++) for (j = i + 1; j < 4; j++)
      s += '<line x1="' + f(Q[i][0]) + '" y1="' + f(Q[i][1]) + '" x2="' + f(Q[j][0]) + '" y2="' + f(Q[j][1]) + '" stroke="' + (ok ? c.green : c.muted) + '" stroke-width="' + (w || 2) + '"/>';
    Q.forEach(function (q, k) { s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + (w ? 3 : 5) + '" fill="' + (k === 3 ? c.red : c.ink) + '" opacity="' + (q[2] < 0 ? 0.55 : 1) + '"/>'; });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (w ? 3.5 : 6) + '" fill="' + (ok ? c.gold : c.panel) + '" stroke="' + (ok ? c.gold : c.ink) + '" stroke-width="1.5"/>';
    return s;
  }
  var mode = 'sim', trials = 0, hits = 0, cur = null, curOk = false, hist = [];
  var U = null, P4 = null, C = null;
  function newTrial() {
    var P = [rnd(), rnd(), rnd(), rnd()], c = coef([P[0], P[1], P[2]], P[3]);
    cur = P; curOk = c[0] > 0 && c[1] > 0 && c[2] > 0; trials++; if (curOk) hits++;
    if (trials % 5 === 0 || trials < 40) hist.push(hits / trials); if (hist.length > 160) hist = hist.filter(function (_, i) { return i % 2; });
  }
  function newLines() { U = [rnd(), rnd(), rnd()]; P4 = rnd(); C = coef(U, P4); }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    for (var k in labs) L(k, 0, 0, '', c.ink);
    if (mode === 'sim') {
      if (!cur) newTrial();
      s += tetra(cur, 165, 185, 135, c, curOk);
      var gx = 350, gy = 210, gw = 270, gh = 120;
      s += '<rect x="' + gx + '" y="' + (gy - gh) + '" width="' + gw + '" height="' + gh + '" fill="none" stroke="' + c.grid + '"/>';
      var y8 = gy - gh * (0.125 / 0.5);
      s += '<line x1="' + gx + '" y1="' + f(y8) + '" x2="' + (gx + gw) + '" y2="' + f(y8) + '" stroke="' + c.gold + '" stroke-dasharray="5 4" stroke-width="1.5"/>';
      if (hist.length > 1) {
        var d = hist.map(function (v, i) { return (i ? 'L' : 'M') + f(gx + gw * i / (hist.length - 1)) + ' ' + f(gy - gh * M.min(v, 0.5) / 0.5); }).join('');
        s += '<path d="' + d + '" fill="none" stroke="' + c.green + '" stroke-width="2"/>';
      }
      L('t1', 350, 40, '\\text{trials} = ' + trials, c.ink, 'l');
      L('t2', 350, 66, '\\text{center inside} = ' + hits, c.green, 'l');
      L('t3', 350, 236, '\\frac{\\text{inside}}{\\text{trials}} = ' + (trials ? (hits / trials).toFixed(4) : '0') + '\\ \\to\\ \\tfrac18 = 0.125', c.ink, 'l');
      L('t4', gx + gw - 18, y8 - 12, '\\tfrac18', c.gold);
      cap.textContent = curOk ? 'This tetrahedron surrounds the center (gold).' : 'This tetrahedron misses the center.';
    } else {
      if (!U) newLines();
      var cx = 150, cy = 190, r = 125, i;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + c.blueSoft + '" stroke="' + c.axis + '" stroke-width="1.5"/>';
      var cols = [c.purple, c.teal, c.orange];
      for (i = 0; i < 3; i++) {
        var a = proj(U[i], cx, cy, r), b = proj([-U[i][0], -U[i][1], -U[i][2]], cx, cy, r);
        s += '<line x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '" stroke="' + cols[i] + '" stroke-width="2.5"/>';
        s += '<circle cx="' + f(a[0]) + '" cy="' + f(a[1]) + '" r="5" fill="' + cols[i] + '"/><circle cx="' + f(b[0]) + '" cy="' + f(b[1]) + '" r="5" fill="' + c.panel + '" stroke="' + cols[i] + '" stroke-width="2"/>';
      }
      var p4 = proj(P4, cx, cy, r);
      s += '<circle cx="' + f(p4[0]) + '" cy="' + f(p4[1]) + '" r="6" fill="' + c.red + '"/><circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + c.ink + '"/>';
      for (var m = 0; m < 8; m++) {
        var e = [m & 4 ? -1 : 1, m & 2 ? -1 : 1, m & 1 ? -1 : 1];
        var P = [0, 1, 2].map(function (j) { return [e[j] * U[j][0], e[j] * U[j][1], e[j] * U[j][2]]; }).concat([P4]);
        var ok = e[0] * C[0] > 0 && e[1] * C[1] > 0 && e[2] * C[2] > 0;
        var tx = 300 + (m % 4) * 84, ty = 70 + M.floor(m / 4) * 120;
        s += '<rect x="' + (tx - 2) + '" y="' + (ty - 2) + '' + '" width="80" height="104" rx="6" fill="none" stroke="' + (ok ? c.gold : c.grid) + '" stroke-width="' + (ok ? 3 : 1) + '"/>';
        s += tetra(P, tx + 38, ty + 40, 32, c, ok, 1.2);
        s += '<text x="' + (tx + 38) + '" y="' + (ty + 95) + '" text-anchor="middle" font-size="15" font-family="system-ui,sans-serif" fill="' + (ok ? c.gold : c.muted) + '">' + e.map(function (v) { return v > 0 ? '+' : '−'; }).join(' ') + '</text>';
      }
      L('e1', 300, 28, '-P_4 = c_1u_1 + c_2u_2 + c_3u_3', c.ink, 'l');
      L('e2', 300, 322, '\\text{inside} \\iff \\varepsilon_i = \\operatorname{sign}(c_i)\\ \\text{for all } i', c.gold, 'l');
      cap.textContent = 'Three lines through the center and the red fourth point are fixed. Of the 8 ways to choose one end of each line, exactly one (gold) surrounds the center. Signs of c: ' + C.map(function (v) { return v > 0 ? '+' : '−'; }).join(' ') + '.';
    }
    svg.innerHTML = s;
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    pb.textContent = 'Pause';
    timer = setInterval(function () {
      if (!el.isConnected) return stop();
      if (mode === 'sim') { for (var i = 0; i < (trials < 60 ? 1 : 25); i++) newTrial(); ang += 0.05; }
      else { ang += 0.04; }
      draw();
    }, 120);
  });
  btn('Step', function () { stop(); if (mode === 'sim') newTrial(); else newLines(); draw(); });
  btn('Run 1000', function () { mode = 'sim'; for (var i = 0; i < 1000; i++) newTrial(); draw(); });
  btn('Simulate', function () { mode = 'sim'; draw(); });
  btn('Eight choices', function () { mode = 'eight'; if (!U) newLines(); draw(); });
  if (api.reduced()) { for (var i = 0; i < 400; i++) newTrial(); }
  api.onTheme(draw); draw();
};
