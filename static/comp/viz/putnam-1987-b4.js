/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1987-b4. */
(window.CompViz = window.CompViz || {})['putnam-1987-b4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; V.crop = 320;
  V.aria = 'The unit circle with the starting point (0.8, 0.6). Each step moves the point counterclockwise along the circle by an angle equal to its current height. The points rush toward (-1, 0), where the height is zero.';
  var pts, acc, MAX = 7;
  V.reset = function () { pts = [M.atan2(0.6, 0.8)]; acc = 0; };
  V.step = function () { if (pts.length <= MAX) { var t = pts[pts.length - 1]; pts.push(t + M.sin(t)); } };
  V.advance = function (dt) { acc += dt; if (acc > 1.2) { acc = 0; V.step(); } if (pts.length > MAX) return false; };
  V.done = function () { return pts.length > MAX; };
  V.final = function () { while (pts.length <= MAX) V.step(); };
  V.draw = function (c, L) {
    var s = '', cx = 165, cy = 165, R = 125, n = pts.length - 1;
    function P(t) { return [cx + R * M.cos(t), cy - R * M.sin(t)]; }
    s += ln(cx - R - 15, cy, cx + R + 15, cy, c.grid, 1) + ln(cx, cy - R - 15, cx, cy + R + 15, c.grid, 1);
    s += ci(cx, cy, R, null, c.ink, 2);
    for (var i = 1; i <= n; i++) {
      var a = pts[i - 1], b = pts[i], p = P(a), q = P(b), big = (b - a) > M.PI ? 1 : 0;
      s += pa('M' + f1(p[0]) + ' ' + f1(p[1]) + 'A ' + R + ' ' + R + ' 0 ' + big + ' 0 ' + f1(q[0]) + ' ' + f1(q[1]), i === n ? c.green : c.muted, i === n ? 5 : 3, null, null);
    }
    var t = pts[n], p0 = P(t);
    s += ln(p0[0], p0[1], p0[0], cy, c.gold, 2, '4 3');
    for (i = 0; i <= n; i++) { var z = P(pts[i]); s += ci(z[0], z[1], i === n ? 7 : 4.5, i === n ? c.gold : c.ink); }
    s += ci(cx - R, cy, 9, null, c.red, 2) + tx(cx - R - 4, cy + 26, '(-1,0)', c.red, 13, 'end');
    L('a', 330, 40, '\\theta_{n+1}=\\theta_n+\\sin\\theta_n', c.ink, 'l');
    L('b', 330, 80, '\\text{step } ' + (n + 1) + ':\\ \\theta=' + t.toFixed(6), c.green, 'l');
    L('c', 330, 120, 'x=' + M.cos(t).toFixed(6) + ',\\ y=' + M.sin(t).toFixed(6), c.ink, 'l');
    L('d', 330, 170, '\\pi-\\theta=' + (M.PI - t).toExponential(2).replace('e', '\\times10^{') + '}', c.muted, 'l');
    L('e', 330, 220, '\\theta\\to\\pi:\\ (x,y)\\to(-1,0)', c.gold, 'l');
    return s;
  };
  V.cap = function () { return 'Dashed: the current height y, which is also the next turning angle.'; };
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
  var leg = D.createElement('div'); leg.style.cssText = 'display:none;margin-top:6px;font-size:15px;line-height:1.6'; el.appendChild(leg);
  var VW = W, nar = false;
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {}, lbg = 'transparent', seen = {};
  function L(key, x, y, s, col, an) {
    seen[key] = 1;
    var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; }
    var par = nar ? leg : lay; if (o.d.parentNode !== par) par.appendChild(o.d);
    if (nar) o.d.style.cssText = 'overflow-x:auto;overflow-y:hidden;padding:1px 0;color:' + (col || 'inherit') + (s ? '' : ';display:none');
    else o.d.style.cssText = 'position:absolute;left:' + (x / VW * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var playing = false, last = 0;
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
    nar = !!V.crop && box.clientWidth > 0 && box.clientWidth < 520; VW = nar ? V.crop : W;
    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + V.H); leg.style.display = nar ? 'block' : 'none';
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
  window.addEventListener('resize', function () { if (el.isConnected && !playing) render(); });
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
