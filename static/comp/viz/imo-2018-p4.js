/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-2018-p4. */
(window.CompViz = window.CompViz || {})['imo-2018-p4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.aria = 'One 4 by 4 block of the board split into four knight cycles of four cells, each in its own color. Amy places red stones; Ben answers on the opposite cell of the same cycle; the two remaining cells of that cycle are a knight move from Amy and are crossed out.';
  var CY = [[[1, 1], [2, 3], [4, 4], [3, 2]], [[1, 4], [3, 3], [4, 1], [2, 2]], [[1, 2], [3, 1], [4, 3], [2, 4]], [[1, 3], [2, 1], [4, 2], [3, 4]]];
  var moves = [], plan = [];
  function kn(p, q) { var a = M.abs(p[0] - q[0]), b = M.abs(p[1] - q[1]); return a * b === 2; }
  function shuffle() { // a random legal play for Amy: one stone per cycle, never a knight move from an earlier red stone
    for (var t = 0; t < 300; t++) {
      var a = [0, 1, 2, 3], out = [], ok = true; while (a.length) { var cn = a.splice(M.floor(M.random() * a.length), 1)[0];
        var opts = [0, 1, 2, 3].filter(function (k) { return out.every(function (m) { return !kn(CY[m.c][m.k], CY[cn][k]); }); });
        if (!opts.length) { ok = false; break; } out.push({ c: cn, k: opts[M.floor(M.random() * opts.length)] }); }
      if (ok) { plan = out; return; } }
    plan = [{ c: 0, k: 0 }, { c: 1, k: 1 }, { c: 2, k: 1 }, { c: 3, k: 0 }];
  }
  V.reset = function () { moves = []; shuffle(); };
  V.step = function () { if (moves.length < 4) moves.push(plan[moves.length]); };
  V.back = function () { moves.pop(); };
  V.advance = function (dt) { V.t = (V.t || 0) + dt; if (V.t > 1.2) { V.t = 0; if (moves.length >= 4) return false; V.step(); } };
  V.done = function () { return moves.length >= 4; };
  V.final = function () { while (moves.length < 4) V.step(); };
  V.draw = function (c, L) {
    var s = '', z = 70, x0 = 24, y0 = 30, col = [c.green, c.blue, c.purple, c.orange], st = {};
    moves.forEach(function (mv) { var cy = CY[mv.c]; st[cy[mv.k]] = 'R'; st[cy[(mv.k + 2) % 4]] = 'B'; st[cy[(mv.k + 1) % 4]] = st[cy[(mv.k + 3) % 4]] = 'X'; });
    function cen(p) { return [x0 + (p[1] - 0.5) * z, y0 + (p[0] - 0.5) * z]; }
    for (var i = 1; i <= 4; i++) for (var j = 1; j <= 4; j++) s += re(x0 + (j - 1) * z, y0 + (i - 1) * z, z, z, (i + j) % 2 ? c.panel : c.grid, c.axis, 0);
    CY.forEach(function (cy, n) { s += pa(poly(cy.map(cen), 1), col[n], 2.5, null, n % 2 ? '7 4' : null); cy.forEach(function (p) { s += dot(cen(p), col[n], 6); }); });
    for (var key in st) { var p = key.split(',').map(Number), q = cen(p);
      if (st[key] === 'R') s += ci(q, 20, c.red, c.ink, 1.5); else if (st[key] === 'B') s += ci(q, 20, c.blue, c.ink, 1.5);
      else s += ln(G.add(q, [-14, -14]), G.add(q, [14, 14]), c.red, 3) + ln(G.add(q, [14, -14]), G.add(q, [-14, 14]), c.red, 3); }
    L('a', 330, 50, '\\text{4 cycles per block, 25 blocks}', c.ink, 'l');
    L('b', 330, 90, '\\Rightarrow 100 \\text{ cycles, at most 1 red each}', c.ink, 'l');
    L('c', 330, 150, '\\text{Amy: } x+y \\text{ even} \\Rightarrow \\ge 100', c.green, 'l');
    L('d', 330, 210, '\\text{red stones: } ' + moves.length, c.red, 'l');
    L('e', 330, 250, '\\text{blue answers: } ' + moves.length, c.blue, 'l');
    return s;
  };
  V.cap = function () { return moves.length ? 'Amy has used ' + moves.length + ' of the 4 cycles in this block. Ben took the opposite cell each time; the crossed cells are a knight move from her stone.' : 'Each colored loop is a cycle of knight moves. Press Play or Step to watch Ben answer Amy inside each cycle.'; };
  V.H = 330;
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
