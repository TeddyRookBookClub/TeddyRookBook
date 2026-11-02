/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-2016-p2. */
(window.CompViz = window.CompViz || {})['imo-2016-p2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.aria = 'A 9 by 9 table filled with the letters I, M and O by the rule (j + floor(i/3)) mod 3. Step highlights one line at a time whose length is a multiple of 3 and shows its letter counts. Another view marks the block centers and the lines through them.';
  var n = 9, lines = [], idx = -1, mode = 0;
  (function () {
    var i, j, s;
    for (i = 0; i < n; i++) { var r = [], q = []; for (j = 0; j < n; j++) { r.push([i, j]); q.push([j, i]); } lines.push(['row', r], ['column', q]); }
    for (s = 0; s < 2 * n - 1; s++) { var u = [], w = []; for (i = 0; i < n; i++) { j = s - i; if (j >= 0 && j < n) u.push([i, j]); j = i - (s - n + 1); if (j >= 0 && j < n) w.push([i, j]); }
      if (u.length % 3 === 0) lines.push(['diagonal ↙', u]); if (w.length % 3 === 0) lines.push(['diagonal ↘', w]); }
  })();
  function let_(i, j) { return (j + M.floor(i / 3)) % 3; }
  V.reset = function () { idx = -1; mode = 0; };
  V.step = function () { mode = 0; idx = (idx + 1) % lines.length; };
  V.advance = function (dt) { V.t = (V.t || 0) + dt; if (V.t > 0.9) { V.t = 0; V.step(); } };
  V.buttons = [['Block centers', function () { mode = 1; }]];
  V.draw = function (c, L) {
    var s = '', z = 34, x0 = 20, y0 = 26, on = {}, cols = [c.green, c.blue, c.orange], soft = [c.greenSoft, c.blueSoft, c.orangeSoft], i, j;
    if (mode === 0 && idx >= 0) lines[idx][1].forEach(function (p) { on[p] = 1; });
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      var g = let_(i, j), x = x0 + j * z, y = y0 + i * z, cen = i % 3 === 1 && j % 3 === 1;
      var hl = mode === 0 ? on[[i, j]] : 0;
      s += re(x, y, z, z, hl ? soft[g] : c.panel, c.grid, 0);
      s += tx([x + z / 2, y + z / 2 + 6], 'IMO'.charAt(g), mode === 0 && idx >= 0 && !hl ? c.muted : cols[g], 17, 'middle', 700);
      if (mode === 1) { var cnt = cen ? 4 : 1; s += tx([x + z - 5, y + 11], cnt, cen ? c.red : c.muted, 10, 'end', 700); if (cen) s += re(x + 2, y + 2, z - 4, z - 4, 'none', c.red, 4); }
    }
    for (i = 0; i <= 3; i++) { s += ln([x0 + 3 * i * z, y0], [x0 + 3 * i * z, y0 + n * z], c.axis, 2) + ln([x0, y0 + 3 * i * z], [x0 + n * z, y0 + 3 * i * z], c.axis, 2); }
    L('r', 350, 50, '\\text{letter} = (j+\\lfloor i/3\\rfloor) \\bmod 3', c.ink, 'l');
    if (mode === 0 && idx >= 0) {
      var ct = [0, 0, 0]; lines[idx][1].forEach(function (p) { ct[let_(p[0], p[1])]++; });
      L('a', 350, 120, '\\text{' + lines[idx][0] + ', length } ' + lines[idx][1].length, c.ink, 'l');
      L('b', 350, 160, '\\color{green}{I:' + ct[0] + '}\\quad \\color{blue}{M:' + ct[1] + '}\\quad \\color{orange}{O:' + ct[2] + '}', c.ink, 'l');
    } else if (mode === 1) {
      L('a', 350, 120, '\\text{center: on 4 lines}', c.red, 'l'); L('b', 350, 160, '\\text{other cells: on 1}', c.muted, 'l');
      L('c', 350, 210, '3m^2+3c=4m^2', c.ink, 'l'); L('d', 350, 250, 'c=m^2/3 \\Rightarrow 9\\mid n', c.ink, 'l');
    }
    return s;
  };
  V.cap = function () {
    if (mode === 1) return 'Each red block center lies on four lines of the family (its row, its column and two diagonals); every other cell lies on exactly one.';
    return idx < 0 ? 'Press Play or Step to check every row, column and diagonal whose length is a multiple of 3.' : 'Line ' + (idx + 1) + ' of ' + lines.length + ': one third of each letter.';
  };
  V.H = 340;
  /* ---- frame (shared by the imoB diagrams; each file is self-contained) ---- */
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
