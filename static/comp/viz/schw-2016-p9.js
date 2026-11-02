/* Our own visualization for the Teddy Rook Book Schweitzer selection: schw-2016-p9. */
(window.CompViz = window.CompViz || {})['schw-2016-p9'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360 };
  V.aria = 'Four random points in the plane. For a chosen point, the triangle of the other three is drawn together with its doubled, upside-down copy; at least one of the four points always lands in the copy built from the others.';
  var q = [], k = 0;
  function g() { var u = 1 - M.random(), v = M.random(); return M.sqrt(-2 * M.log(u)) * M.cos(2 * M.PI * v); }
  function ar(a, b, c) { return M.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2; }
  function fresh() { for (var t = 0; t < 50; t++) { q = []; for (var i = 0; i < 4; i++) q.push([320 + 62 * g(), 180 + 48 * g()]); if (M.min(ar(q[1], q[2], q[3]), ar(q[0], q[2], q[3]), ar(q[0], q[1], q[3]), ar(q[0], q[1], q[2])) > 600) break; } k = 0; }
  function inside(i) {
    var o = [0, 1, 2, 3].filter(function (j) { return j !== i; }), a = q[o[0]], b = q[o[1]], c = q[o[2]], p = q[i];
    var d = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
    var l1 = ((p[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (p[1] - a[1])) / d, l2 = ((b[0] - a[0]) * (p[1] - a[1]) - (p[0] - a[0]) * (b[1] - a[1])) / d;
    var l = [1 - l1 - l2, l1, l2]; return l[0] <= 1 && l[1] <= 1 && l[2] <= 1;
  }
  fresh();
  V.buttons = [['New points', fresh], ['Next point', function () { k = (k + 1) % 4; }]];
  V.draw = function (c, L) {
    var o = [0, 1, 2, 3].filter(function (j) { return j !== k; }), a = q[o[0]], b = q[o[1]], d = q[o[2]], s = '';
    var big = [[b[0] + d[0] - a[0], b[1] + d[1] - a[1]], [a[0] + d[0] - b[0], a[1] + d[1] - b[1]], [a[0] + b[0] - d[0], a[1] + b[1] - d[1]]];
    var all = big.concat(q), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    all.forEach(function (p) { x0 = M.min(x0, p[0]); x1 = M.max(x1, p[0]); y0 = M.min(y0, p[1]); y1 = M.max(y1, p[1]); });
    var sc = M.min(560 / M.max(x1 - x0, 1), 290 / M.max(y1 - y0, 1), 3), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    function T(p) { return [320 + (p[0] - cx) * sc, 195 + (p[1] - cy) * sc]; }
    s += pa(poly(big.map(T), 1), c.gold, 2, c.gold, 0.18) + pa(poly([a, b, d].map(T), 1), c.green, 2.5, c.green, 0.18);
    var cols = [c.blue, c.orange, c.purple, c.teal];
    q.forEach(function (p0, i) { var p = T(p0); s += ci(p[0], p[1], i === k ? 8 : 5.5, cols[i], i === k ? c.ink : '', 2); L('p' + i, p[0] + 14, p[1] - 12, 'q_' + i, cols[i], 'l'); });
    var n = 0; for (var i = 0; i < 4; i++) if (inside(i)) n++;
    L('t', 16, 24, '\\text{weights } \\le 1', c.gold, 'l');
    L('u', 624, 24, n + '\\text{ of 4 caught}', c.ink, 'r');
    return s;
  };
  V.cap = function () { return 'Point q' + k + (inside(k) ? ' lies' : ' does not lie') + ' in the gold region built from the other three. Try every point: at least one is always caught.'; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
  function pa(d, k, w, f, op) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (op ? ' fill-opacity="' + op + '"' : '') + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + ' stroke-linejoin="round"/>'; }
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
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
    svg.innerHTML = '<rect x="0" y="0" width="' + W + '" height="' + V.H + '" fill="' + c.panel + '"/>' + V.draw(c, L);
    for (var k in labs) if (!seen[k]) L(k, 0, 0, '');
    cap.textContent = V.cap();
  }
  (V.buttons || []).forEach(function (b) { var e = D.createElement('button'); e.type = 'button'; e.className = 'cp-btn'; e.textContent = b[0]; e.addEventListener('click', function () { b[1](); render(); }); bar.appendChild(e); });
  api.onTheme(render);
  render();
};
