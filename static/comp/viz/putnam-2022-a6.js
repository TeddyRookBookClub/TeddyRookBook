/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2022-a6. */
(window.CompViz = window.CompViz || {})['putnam-2022-a6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 330; var n = 2;
  V.aria = 'Equally spaced points on a half circle, projected down to the interval from minus one to one. Every other gap between the projected points is shaded; these n intervals have odd-power length sums equal to 1 up to the power 2n minus 1.';
  function z(j) { return M.cos(j * M.PI / (2 * n + 1)); }
  function S(p) { var s = 0; for (var j = 1; j <= 2 * n; j++) s += (j % 2 ? 1 : -1) * M.pow(z(j), p); return s; }
  V.step = function () { n = n % 5 + 1; };
  V.final = function () { n = 2; };
  V.draw = function (c, L) {
    var cx = 200, cy = 220, R = 170, s = '', j;
    s += pa('M' + (cx - R) + ' ' + cy + 'A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy, c.grid, 1.5);
    s += ln(cx - R - 10, cy, cx + R + 10, cy, c.axis, 1.5);
    for (j = 1; j <= 2 * n; j += 2) { var a = cx + R * z(j + 1), b = cx + R * z(j); s += '<rect x="' + f1(a) + '" y="' + (cy - 7) + '" width="' + f1(b - a) + '" height="14" fill="' + c.green + '" opacity="0.8"/>'; }
    for (j = 1; j <= 2 * n; j++) {
      var an = j * M.PI / (2 * n + 1), px = cx + R * M.cos(an), py = cy - R * M.sin(an);
      s += ln(px, py, px, cy, c.muted, 1, '3 4') + ln(cx, cy, px, py, c.grid, 1) + ci(px, py, 4.5, c.blue) + ci(px, cy, 3.5, c.ink);
    }
    s += tx(cx - R, cy + 26, '−1', c.muted, 15) + tx(cx + R, cy + 26, '1', c.muted, 15) + tx(cx, cy + 26, '0', c.muted, 15);
    L('z', 20, 300, 'z_j=\\cos\\dfrac{j\\pi}{2n+1},\\quad n=' + n, c.blue, 'l');
    L('h', 400, 30, '\\textstyle\\sum_i\\big(y_i^{\\,p}-x_i^{\\,p}\\big)', c.ink, 'l');
    for (var k = 1; k <= n + 1 && k <= 6; k++) {
      var v = S(2 * k - 1), good = M.abs(v - 1) < 1e-9;
      L('k' + k, 400, 40 + 40 * k, 'p=' + (2 * k - 1) + ':\\ ' + v.toFixed(6), good ? c.green : c.red, 'l');
    }
    for (k = n + 2; k <= 6; k++) L('k' + k, 0, 0, '');
    return s;
  };
  V.cap = function () { return 'n = ' + n + ': the green intervals give sum exactly 1 for the odd powers 1 to ' + (2 * n - 1) + ' and fail at power ' + (2 * n + 1) + '. Press Step for another n.'; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
  function pa(d, k, w, f, da, op) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + (op ? ' fill-opacity="' + op + '"' : '') + ' stroke-linejoin="round"/>'; }
  function tx(x, y, s, k, sz, an) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 16) + '" text-anchor="' + (an || 'middle') + '" font-family="system-ui,sans-serif">' + s + '</text>'; }
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
  if (V.step) btn('Step', function () { stop(); V.step(); render(); });
  if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
