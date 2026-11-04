/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-1991-a1. */
(window.CompViz = window.CompViz || {})['putnam-1991-a1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 310;
  V.aria = 'A 2 by 3 rectangle rolls to the right along the x-axis, turning a quarter turn clockwise about a corner four times. The point that starts at (1, 1) traces four quarter-circle arcs, and the area under the path is shaded. Each arc region splits into a quarter disk and two right triangles, with areas pi/2 + 1, 5 pi/4 + 2, 5 pi/4 + 2 and pi/2 + 1, for a total of 6 + 7 pi/2.';
  var sT, PV = [2, 5, 7, 10], RECT = [[0, 0], [2, 0], [2, 3], [0, 3]];
  function rot(p, px, f) { var a = f * M.PI / 2, c = M.cos(a), s = M.sin(a), x = p[0] - px; return [px + x * c + p[1] * s, -x * s + p[1] * c]; }
  function pose(p, v) { var k = M.min(M.floor(v), 4), q = p; for (var i = 0; i < k; i++) q = rot(q, PV[i], 1); if (k < 4) q = rot(q, PV[k], v - k); return q; }
  V.reset = function () { sT = 0; };
  V.advance = function (dt) { sT = M.min(4, sT + dt * 0.4); if (sT >= 4) return false; };
  V.step = function () { sT = M.min(4, M.floor(sT + 1e-9) + 1); };
  V.done = function () { return sT >= 4; };
  V.final = function () { sT = 4; };
  V.draw = function (c, L) {
    var s = '', u = 52, ox = 30, oy = 268;
    function X(x) { return ox + u * x; } function Y(y) { return oy - u * y; }
    function pt(p) { return f1(X(p[0])) + ' ' + f1(Y(p[1])); }
    var tr = [], n = M.max(2, M.round(sT * 40));
    for (var i = 0; i <= n; i++) tr.push(pose([1, 1], sT * i / n));
    s += pa('M' + X(1) + ' ' + oy + tr.map(function (p) { return 'L' + pt(p); }).join('') + 'L' + f1(X(tr[tr.length - 1][0])) + ' ' + oy + 'Z', null, 0, c.greenSoft);
    for (var k = 0; k < M.floor(sT + 1e-9); k++) {
      var a = pose([1, 1], k), b = pose([1, 1], k + 1), pv = [PV[k], 0];
      s += ln(X(pv[0]), oy, X(a[0]), Y(a[1]), c.gold, 1.5, '4 3') + ln(X(pv[0]), oy, X(b[0]), Y(b[1]), c.gold, 1.5, '4 3');
      s += ln(X(a[0]), oy, X(a[0]), Y(a[1]), c.muted, 1, '2 3') + ln(X(b[0]), oy, X(b[0]), Y(b[1]), c.muted, 1, '2 3');
    }
    s += ln(X(-0.4), oy, X(11.4), oy, c.axis, 1.5);
    for (i = 0; i <= 11; i++) s += ln(X(i), oy, X(i), oy + 5, c.axis, 1) + (i % 1 === 0 ? tx(X(i), oy + 20, '' + i, c.muted, 12) : '');
    var R = RECT.map(function (p) { return pose(p, sT); });
    s += pa('M' + R.map(pt).join('L') + 'Z', c.ink, 2.5, c.blueSoft);
    s += pa('M' + tr.map(pt).join('L'), c.green, 3);
    var cur = tr[tr.length - 1];
    s += ci(X(cur[0]), Y(cur[1]), 6, c.red);
    var kk = M.min(3, M.floor(sT)); if (sT < 4) s += ci(X(PV[kk]), oy, 5, c.gold);
    var lab = ['\\tfrac{\\pi}{2}+1', '\\tfrac{5\\pi}{4}+2', '\\tfrac{5\\pi}{4}+2', '\\tfrac{\\pi}{2}+1'], cx = [2, 4.6, 7.6, 10];
    for (k = 0; k < 4; k++) L('a' + k, X(cx[k]), 34, k < M.floor(sT + 1e-9) ? lab[k] : '', c.green);
    L('t', 630, 62, sT >= 4 ? '\\text{area}=6+\\tfrac{7\\pi}{2}\\approx16.996' : '\\text{quarter turn about } (' + PV[kk] + ',0)', sT >= 4 ? c.gold : c.ink, 'r');
    return s;
  };
  V.cap = function () { return sT >= 4 ? 'Each arc region is a quarter disk (between the gold radii) plus two right triangles.' : 'The red point starts at (1, 1); gold marks the current pivot.'; };
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
