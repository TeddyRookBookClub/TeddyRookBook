/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2023-p5. */
(window.CompViz = window.CompViz || {})['imo-2023-p5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 440, aria: '' };
  V.aria = 'A triangle of circles with one red circle per row, placed in blocks of 1, 2, 4 and 8 rows. Each circle shows the best red count of a path ending there.';
  var ns = [4, 7, 8, 12, 15], ni = 4, sc = true;
  V.buttons = [['Next n', function () { ni = (ni + 1) % ns.length; }], ['Scores', function () { sc = !sc; }]];
  V.draw = function (c, L) {
    var n = ns[ni], r, j, s = '', R = [], f = [], gap = M.min(38, 390 / n), rad = gap * .4, cx = 250, y0 = 30;
    var bc = [c.blueSoft, c.purpleSoft, c.tealSoft, c.orangeSoft];
    for (r = 1; r <= n; r++) { var a = M.floor(M.log(r) / M.LN2 + 1e-9), b = r - M.pow(2, a); R.push(2 * b); }
    for (r = 0; r < n; r++) {
      f.push([]);
      for (j = 0; j <= r; j++) {
        var m = 0;
        if (r > 0) { if (j > 0) m = f[r - 1][j - 1]; if (j < r) m = M.max(m, f[r - 1][j]); }
        f[r].push(m + (R[r] === j ? 1 : 0));
      }
    }
    for (r = 0; r < n; r++) {
      var blk = M.floor(M.log(r + 1) / M.LN2 + 1e-9), Y = y0 + r * gap * .88;
      if (r + 1 === M.pow(2, blk)) {
        var h = (M.pow(2, blk) * gap * .88), yy = Y - gap * .44;
        s += re(cx - (n / 2 + .5) * gap, yy, (n + 1) * gap, M.min(h, (n - r) * gap * .88), bc[blk % 4], null, 6);
        L('b' + blk, cx + (n / 2 + .7) * gap, Y, '\\text{block }' + blk, c.muted, 'l');
      }
      for (j = 0; j <= r; j++) {
        var X = cx + (j - r / 2) * gap, red = R[r] === j;
        s += ci(X, Y, rad, red ? c.red : c.bg, red ? c.red : c.axis, 1.5);
        if (sc) s += tx(X, Y + rad * .38, f[r][j], red ? c.bg : c.ink, M.max(8, rad), 'middle', 600);
      }
    }
    var best = M.max.apply(null, f[n - 1]);
    L('a', 470, y0 + n * gap * .88 + 4, '\\text{best path: }' + best + '=\\lfloor\\log_2 ' + n + '\\rfloor+1', c.green, 'r');
    return s;
  };
  V.cap = function () { return 'n = ' + ns[ni] + '. In row 2^a + b the red circle is number 2b + 1 from the left. A path can catch at most one red circle in each shaded block. The numbers are the best red counts of paths ending at each circle.'; };
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
