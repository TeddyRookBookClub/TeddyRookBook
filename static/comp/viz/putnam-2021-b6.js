/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2021-b6. */
(window.CompViz = window.CompViz || {})['putnam-2021-b6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; var K = 0, KM = 7, acc = 0;
  V.aria = 'Graphs of the distribution function after repeated median-of-three steps. Each step makes the curve steeper at one half, but never steeper than the dashed line with slope (3/2) to the power k.';
  function g(p) { return 3 * p * p - 2 * p * p * p; }
  function G(x, k) { for (var i = 0; i < k; i++) x = g(x); return x; }
  function mu(k) { var s = 0, N = 400; for (var i = 0; i < N; i++) s += G((i + .5) / N * .5, k); return 2 * s * .5 / N; }
  V.reset = function () { K = 0; acc = 0; };
  V.advance = function (dt) { acc += dt; if (acc > 1.2) { acc = 0; K++; if (K >= KM) { K = KM; return false; } } };
  V.done = function () { return K >= KM; };
  V.step = function () { K = (K + 1) % (KM + 1); };
  V.final = function () { K = 3; };
  V.draw = function (c, L) {
    var x0 = 60, y0 = 30, w = 360, h = 240, s = '', k, i;
    s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.5) + ln(x0, y0, x0, y0 + h, c.axis, 1.5);
    s += ln(x0 + w / 2, y0, x0 + w / 2, y0 + h, c.grid, 1, '3 4');
    for (k = 0; k <= K; k++) {
      var pts = [];
      for (i = 0; i <= 120; i++) { var x = i / 120; pts.push([x0 + x * w, y0 + h - G(x, k) * h]); }
      s += pa(poly(pts), k === K ? c.blue : c.muted, k === K ? 3 : 1.2);
    }
    var sl = M.pow(1.5, K), a = .5 - .5 / sl, b = .5 + .5 / sl;
    s += ln(x0 + a * w, y0 + h, x0 + b * w, y0, c.orange, 2, '7 5');
    s += tx(x0, y0 + h + 22, '0', c.muted, 15) + tx(x0 + w / 2, y0 + h + 22, '½', c.muted, 15) + tx(x0 + w, y0 + h + 22, '1', c.muted, 15);
    L('g', 440, 50, 'g(p)=3p^2-2p^3', c.ink, 'l');
    L('k', 440, 90, 'k=' + K + '\\text{ steps}', c.blue, 'l');
    L('d', 440, 130, '\\text{slope}\\le(\\tfrac32)^{k}', c.orange, 'l');
    L('m', 440, 185, '\\mu_k=' + mu(K).toFixed(4), c.ink, 'l');
    L('b', 440, 225, '\\tfrac14(\\tfrac23)^k=' + (0.25 * M.pow(2 / 3, K)).toFixed(4), c.gold, 'l');
    return s;
  };
  V.cap = function () { return 'Blue: the distribution function of the number left after ' + K + ' trimming steps. It always stays above the dashed line left of ½, which is why the expected distance from ½ is at least the gold value.'; };
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
