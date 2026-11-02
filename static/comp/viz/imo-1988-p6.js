/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-1988-p6. */
(window.CompViz = window.CompViz || {})['imo-1988-p6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.aria = 'The curve a squared plus b squared equals k times (ab plus 1), drawn for k equal to 4 or 9, with its lattice points. Starting from a large solution, each jump replaces a by the other root kb minus a, then swaps the pair, until a coordinate reaches 0 and b squared equals k.';
  var k = 4, chains = { 4: [[112, 30], [30, 8], [8, 2], [2, 0]], 9: [[240, 27], [27, 3], [3, 0]] }, idx = 0, zoom = true;
  V.reset = function () { idx = 0; };
  V.step = function () { if (idx < chains[k].length - 1) idx++; };
  V.back = function () { if (idx > 0) idx--; };
  V.advance = function (dt) { V.t = (V.t || 0) + dt; if (V.t > 1.6) { V.t = 0; if (idx >= chains[k].length - 1) return false; idx++; } };
  V.done = function () { return idx >= chains[k].length - 1; };
  V.final = function () { idx = chains[k].length - 1; };
  V.buttons = [['k = 4', function () { k = 4; idx = 0; }], ['k = 9', function () { k = 9; idx = 0; }], ['Zoom', function () { zoom = !zoom; }]];
  V.draw = function (c, L) {
    var ch = chains[k], cur = ch[idx], prev = ch[M.max(0, idx - 1)], top = zoom ? M.max(cur[0], cur[1], prev[0], prev[1], 3) * 1.15 : ch[0][0] * 1.08, s = '';
    var x0 = 50, y0 = 320, S = 270 / top;
    function P(p) { return [x0 + p[0] * S, y0 - p[1] * S]; }
    s += ln(P([0, 0]), P([top, 0]), c.axis, 1.5) + ln(P([0, 0]), P([0, top]), c.axis, 1.5) + ln(P([0, 0]), P([top, top]), c.grid, 1.5, '5 5');
    // both branches: for each a solve b from b^2 - k a b + a^2 - k = 0
    function br(sgn) { var pts = [], N = 160; for (var i = 0; i <= N; i++) { var a = top * i / N, D = k * k * a * a - 4 * (a * a - k); if (D < 0) continue; var b = (k * a + sgn * M.sqrt(D)) / 2; if (b >= 0 && b <= top) pts.push(P([a, b])); } return pts; }
    var u = br(1), v = br(-1);
    if (u.length > 1) s += pa(poly(u), c.blue, 2); if (v.length > 1) s += pa(poly(v), c.blue, 2);
    ch.forEach(function (p, i) { if (p[0] <= top && p[1] <= top) { s += dot(P(p), i === idx ? c.red : c.ink, i === idx ? 6 : 4) + dot(P([p[1], p[0]]), c.muted, 3.5); } });
    if (idx > 0) { var pr = ch[idx - 1], mid = [pr[1], pr[0]]; // (a,b) -> (a',b) then swap
      var a1 = k * pr[1] - pr[0]; s += ln(P(pr), P([a1, pr[1]]), c.gold, 3) + ln(P([a1, pr[1]]), P(cur), c.green, 2, '4 4'); }
    s += tx([x0 + 270 + 8, y0 + 5], 'a', c.axis, 14, 'start') + tx([x0 - 8, y0 - 275], 'b', c.axis, 14, 'end');
    L('a', 380, 50, 'a^2+b^2=k(ab+1),\\ k=' + k, c.blue, 'l');
    L('b', 380, 95, '(a,b)=(' + cur[0] + ',' + cur[1] + ')', c.red, 'l');
    if (cur[1] > 0) L('c', 380, 140, "a'=kb-a=" + (k * cur[1] - cur[0]), c.gold, 'l');
    else L('c', 380, 140, 'b=0:\\ a^2=k=' + cur[0] + '^2', c.green, 'l');
    L('d', 380, 185, "a'=\\dfrac{b^2-k}{a}<a", c.ink, 'l');
    L('e', 380, 240, '\\text{jump ' + idx + ' of ' + (ch.length - 1) + '}', c.muted, 'l');
    return s;
  };
  V.cap = function () { return idx < chains[k].length - 1 ? 'Gold: jump from a to the other root a′ = kb − a. Green: swap the pair so the larger entry comes first. Zoom follows the current pair.' : 'The jumps end at a pair with a 0, and then k = ' + k + ' is a perfect square.'; };
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
