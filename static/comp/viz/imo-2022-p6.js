/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2022-p6. */
(window.CompViz = window.CompViz || {})['imo-2022-p6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 440, aria: '' };
  V.aria = 'A square board split into peak cells and tree cells. The tree cells form one tree: a frame along the top and left edges with diagonal ribbons hanging from it.';
  var ns = [6, 7, 8, 10, 12, 13], ni = 2, showNum = false;
  function peak(i, j, n) {
    if (i >= 2 && j >= 2) return (i - j) % 3 === 0;
    if (i > j) { var t = i; i = j; j = t; }
    if (n % 6 === 4 && j === n - 1) return i === 0;
    return i === 0 ? j % 6 === 5 : (j % 6 === 1 || j % 6 === 3);
  }
  function kind(i, j) { // 0 frame, 1/2 ribbon colors
    if (i < 2 || j < 2) return 0;
    var d = j - i, m = M.floor((d - 1) / 3); return 1 + (((m % 2) + 2) % 2);
  }
  V.buttons = [['Next n', function () { ni = (ni + 1) % ns.length; }], ['Numbers', function () { showNum = !showNum; }]];
  V.draw = function (c, L) {
    var n = ns[ni], cs = M.min(50, 400 / n), x0 = 20, y0 = 20, s = '', i, j;
    var P = [], num = {}, q = [[0, 0]], k = 1, cols = [c.green, c.blue, c.purple];
    for (i = 0; i < n; i++) { P.push([]); for (j = 0; j < n; j++) P[i].push(peak(i, j, n)); }
    num['0,0'] = k++;
    var edges = [];
    while (q.length) {
      var u = q.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var a = u[0] + d[0], b = u[1] + d[1];
        if (a < 0 || b < 0 || a >= n || b >= n || P[a][b] || num[a + ',' + b]) return;
        num[a + ',' + b] = k++; q.push([a, b]); edges.push([u, [a, b]]);
      });
    }
    var tree = k - 1, pk = 0, pe = 0;
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      var X = x0 + j * cs, Y = y0 + i * cs;
      if (P[i][j]) { pk++; num[i + ',' + j] = k++; pe += (i > 0) + (j > 0) + (i < n - 1) + (j < n - 1); s += re(X, Y, cs, cs, c.goldSoft, c.grid); }
      else s += re(X, Y, cs, cs, c.bg, c.grid);
    }
    edges.forEach(function (e) {
      var a = e[0], b = e[1], col = cols[M.max(kind(a[0], a[1]), kind(b[0], b[1]))];
      if (kind(a[0], a[1]) !== kind(b[0], b[1])) col = c.red;
      s += ln(x0 + (a[1] + .5) * cs, y0 + (a[0] + .5) * cs, x0 + (b[1] + .5) * cs, y0 + (b[0] + .5) * cs, col, M.max(2, cs / 7));
    });
    s += ci(x0 + cs / 2, y0 + cs / 2, cs / 4, c.green);
    if (showNum) for (i = 0; i < n; i++) for (j = 0; j < n; j++) s += tx(x0 + (j + .5) * cs, y0 + (i + .5) * cs + cs * .17, num[i + ',' + j], P[i][j] ? c.gold : c.ink, M.max(8, cs * .42), 'middle', 600);
    var bx = x0 + n * cs + 18;
    L('n', bx, 40, 'n=' + n, c.ink, 'l');
    L('t', bx, 80, '\\text{tree cells: }' + tree, c.green, 'l');
    L('p', bx, 115, '\\text{peaks: }' + pk, c.gold, 'l');
    L('f', bx, 160, '\\text{pairs: }' + (tree - 1) + '+' + pe + '=' + (tree - 1 + pe), c.muted, 'l');
    L('g', bx, 195, '\\text{paths}=' + tree + '+' + pe + '=' + (tree + pe), c.ink, 'l');
    L('h', bx, 235, '2n^2-2n+1=' + (2 * n * n - 2 * n + 1), c.green, 'l');
    return s;
  };
  V.cap = function () { return 'n = ' + ns[ni] + '. Gold cells are peaks. Green lines: the frame. Blue and purple: the ribbons. Red: the single link from each ribbon to the frame. The dot marks the root, numbered 1.'; };
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
