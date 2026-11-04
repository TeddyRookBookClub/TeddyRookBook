/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1996-p1. */
(window.CompViz = window.CompViz || {})['imo-1996-p1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 370;
  V.aria = 'A 20 by 12 grid of squares. For r = 73 a route of eleven moves of type (3,8) or (8,3) runs from the bottom-left square to the bottom-right square. For r = 97 the rows are split into a middle band and two outer bands, and a parity rule that never changes shows the far corner cannot be reached.';
  var route = [[0, 0], [3, 8], [11, 5], [3, 2], [0, 10], [8, 7], [0, 4], [8, 1], [11, 9], [3, 6], [11, 3], [19, 0]], k = 0, mode = 73, acc = 0;
  V.reset = function () { k = 0; acc = 0; };
  V.step = function () { if (mode === 73 && k < route.length - 1) k++; };
  V.back = function () { if (k > 0) k--; };
  V.advance = function (dt) { if (mode !== 73) return false; acc += dt; if (acc > 0.7) { acc = 0; V.step(); if (k >= route.length - 1) return false; } };
  V.done = function () { return mode !== 73 || k >= route.length - 1; };
  V.final = function () { k = route.length - 1; };
  V.buttons = [['r = 73', function () { mode = 73; V.reset(); }], ['r = 97', function () { mode = 97; k = 0; }]];
  V.draw = function (c, L) {
    var s = '', sz = 26, ox = 320 - 10 * sz, oy = 14, x, y;
    function px(x) { return ox + (x + 0.5) * sz; } function py(y) { return oy + (11 - y + 0.5) * sz; }
    for (x = 0; x < 20; x++) for (y = 0; y < 12; y++) {
      var f = 'none';
      if (mode === 97) { var mid = y >= 4 && y <= 7, inv = (x + (mid ? 1 : 0)) % 2; f = inv ? c.orangeSoft : c.blueSoft; }
      s += re(ox + x * sz + 1, oy + (11 - y) * sz + 1, sz - 2, sz - 2, f, c.grid, 2);
    }
    s += re(ox + 2, oy + 11 * sz + 2, sz - 4, sz - 4, 'none', c.green, 2) + re(ox + 19 * sz + 2, oy + 11 * sz + 2, sz - 4, sz - 4, 'none', c.red, 2) + tx(ox - 10, py(0) + 5, 'A', c.green, 14) + tx(ox + 20 * sz + 10, py(0) + 5, 'B', c.red, 14);
    if (mode === 73) {
      for (var i = 1; i <= k; i++) { var a = route[i - 1], b = route[i]; s += ln(px(a[0]), py(a[1]), px(b[0]), py(b[1]), c.purple, 2.5); }
      for (i = 0; i <= k; i++) s += ci(px(route[i][0]), py(route[i][1]), 5, i === k ? c.red : c.purple);
      L('m', 16, 350, 'r=73=8^2+3^2:\\ \\text{moves } (\\pm8,\\pm3),(\\pm3,\\pm8)\\quad\\text{move ' + k + ' of 11}', c.ink, 'l');
    } else {
      s += ln(ox - 6, py(3.5), ox + 20 * sz + 6, py(3.5), c.ink, 1.5, '6 4') + ln(ox - 6, py(7.5), ox + 20 * sz + 6, py(7.5), c.ink, 1.5, '6 4');
      L('m', 16, 350, 'r=97=9^2+4^2:\\ \\ (x\\bmod 2)+[\\text{middle band}]\\ \\text{never changes}', c.ink, 'l');
    }
    return s;
  };
  V.cap = function () { return mode === 73 ? 'Start is the green square, goal the red one. Each move jumps 8 one way and 3 the other.' : 'Blue and orange show the invariant: a (9,4) move flips both the column parity and the band; a (4,9) move keeps both. Start and goal have different shades.'; };
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
