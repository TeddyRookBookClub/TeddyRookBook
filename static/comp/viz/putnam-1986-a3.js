/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1986-a3. */
(window.CompViz = window.CompViz || {})['putnam-1986-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; V.crop = 340;
  V.aria = 'Rays from a corner point toward the points (1, n) for n = 0, 1, 2, and so on. Each wedge between consecutive rays is one term of the series. The wedges fill up a right angle, so the sum is pi over 2.';
  var K, acc, MAX = 40;
  V.reset = function () { K = -1; acc = 0; };
  V.step = function () { if (K < MAX) K++; };
  V.advance = function (dt) { acc += dt; if (acc > (K < 6 ? 0.9 : 0.25)) { acc = 0; V.step(); } if (K >= MAX) return false; };
  V.done = function () { return K >= MAX; };
  V.final = function () { K = MAX; };
  V.draw = function (c, L) {
    var s = '', ox = 40, oy = 290, R = 255, cols = [c.green, c.blue, c.gold, c.purple, c.teal, c.orange];
    s += ln(ox, oy, ox + R + 15, oy, c.axis, 1.5) + ln(ox, oy, ox, oy - R - 15, c.axis, 1.5, '5 4');
    s += pa('M' + (ox + 40) + ' ' + oy + ' A 40 40 0 0 0 ' + ox + ' ' + (oy - 40), c.muted, 1.2);
    for (var n = 0; n <= K; n++) {
      var a0 = M.atan(n), a1 = M.atan(n + 1), col = cols[n % 6];
      var x0 = ox + R * M.cos(a0), y0 = oy - R * M.sin(a0), x1 = ox + R * M.cos(a1), y1 = oy - R * M.sin(a1);
      s += pa('M' + ox + ' ' + oy + 'L' + f1(x0) + ' ' + f1(y0) + 'A ' + R + ' ' + R + ' 0 0 0 ' + f1(x1) + ' ' + f1(y1) + 'Z', col, 1, col, null, n === K ? 0.55 : 0.25);
    }
    for (n = 0; n <= M.min(K + 1, 6); n++) { var a = M.atan(n); s += ci(ox + R * M.cos(a), oy - R * M.sin(a), 3.5, c.ink); if (n <= 3) s += tx(ox + (R + 22) * M.cos(a), oy - (R + 22) * M.sin(a) + 5, '(1,' + n + ')', c.muted, 13); }
    var sum = K < 0 ? 0 : M.atan(K + 1);
    L('a', 335, 40, '\\theta_n=\\arctan(n+1)-\\arctan n', c.ink, 'l');
    L('b', 335, 82, '\\tan\\theta_n=\\frac{(n+1)-n}{1+n(n+1)}=\\frac{1}{n^2+n+1}', c.ink, 'l');
    L('c', 335, 130, K < 0 ? '' : '\\theta_' + K + '=\\operatorname{arccot}(' + (K * K + K + 1) + ')', cols[(K < 0 ? 0 : K) % 6], 'l');
    L('d', 335, 175, '\\textstyle\\sum_{n=0}^{' + M.max(K, 0) + '}\\theta_n=\\arctan(' + (M.max(K, 0) + 1) + ')\\approx' + sum.toFixed(4), c.ink, 'l');
    L('e', 335, 220, '\\to\\ \\frac{\\pi}{2}\\approx1.5708', c.gold, 'l');
    return s;
  };
  V.cap = function () { return K < 0 ? 'Each term is the wedge between two neighboring rays.' : 'Terms 0 to ' + K + ' fill the wedges so far; together they never pass the vertical.'; };
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
