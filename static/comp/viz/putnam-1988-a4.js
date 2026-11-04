/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1988-a4. */
(window.CompViz = window.CompViz || {})['putnam-1988-a4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; V.crop = 405;
  V.aria = 'The plane cut into small squares of side one half, colored in a repeating three by three pattern with nine colors. A point moves around with the circle of radius 1 drawn around it. The squares with the same color as the point are outlined; the circle never touches them, so no two points of one color are exactly 1 apart.';
  var t, U = 64, ox = 12, oy = 12, GW = 6, GH = 4.5;
  V.reset = function () { t = 0; };
  V.advance = function (dt) { t += dt * 0.35; };
  V.step = function () { t += 0.45; };
  V.final = function () { t = 1.3; };
  V.draw = function (c, L) {
    var s = '', cols = [c.green, c.blue, c.red, c.gold, c.purple, c.orange, c.pink, c.teal, c.muted];
    var px = 2.9 + 1.25 * M.cos(t) + 0.3 * M.cos(2.7 * t), py = 2.25 + 0.9 * M.sin(1.3 * t);
    var ci0 = M.floor(px * 2), cj0 = M.floor(py * 2), mine = (ci0 % 3) * 3 + (cj0 % 3);
    for (var i = 0; i < GW * 2; i++) for (var j = 0; j < GH * 2; j++) {
      var k = (i % 3) * 3 + (j % 3), x = ox + i * U / 2, y = oy + (GH * 2 - 1 - j) * U / 2;
      s += '<rect x="' + x + '" y="' + y + '" width="' + U / 2 + '" height="' + U / 2 + '" fill="' + cols[k] + '" fill-opacity="' + (k === mine ? 0.6 : 0.2) + '"' + (k === mine ? ' stroke="' + c.ink + '" stroke-width="2.5"' : '') + '/>';
    }
    var X = ox + px * U, Y = oy + (GH - py) * U;
    s += ci(X, Y, U, null, c.ink, 2.5) + ln(X, Y, X + U * M.cos(t * 1.7), Y - U * M.sin(t * 1.7), c.ink, 1.5, '4 3');
    s += ci(X, Y, 6, c.ink) + tx(X + 0.5 * U * M.cos(t * 1.7) + 8, Y - 0.5 * U * M.sin(t * 1.7) - 6, '1', c.ink, 14);
    L('a', 410, 40, '\\text{squares of side } \\tfrac12', c.ink, 'l');
    L('b', 410, 78, '\\text{diagonal } \\tfrac{\\sqrt2}{2}<1', c.ink, 'l');
    L('c', 410, 125, '\\text{color } (i\\bmod 3,\\ j\\bmod 3)', c.ink, 'l');
    L('d', 410, 172, '\\text{same color, other square:}', c.muted, 'l');
    L('e', 410, 205, '\\text{gap}>\\tfrac32-\\tfrac12=1', c.green, 'l');
    L('f', 410, 255, '\\Rightarrow\\ \\text{no distance exactly } 1', c.gold, 'l');
    return s;
  };
  V.cap = function () { return 'Outlined: every square with the same color as the moving point. The unit circle never reaches them.'; };
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
