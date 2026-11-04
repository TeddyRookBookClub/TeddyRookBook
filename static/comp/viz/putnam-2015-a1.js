/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2015-a1. */
(window.CompViz = window.CompViz || {})['putnam-2015-a1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 330; var a = 0.5, b = 4, p = M.sqrt(a * b), tt = 0;
  V.aria = 'The hyperbola xy equals 1 with points A, P, B, where P is the point whose tangent is parallel to AB. The two regions between the curve and the chords AP and PB are shaded. A squeeze map moves P to (1, 1); then the picture is symmetric about the line y equals x, and the two areas are equal.';
  V.reset = function () { tt = 0; };
  V.advance = function (dt) { tt = M.min(1, tt + dt / 3); if (tt >= 1) return false; };
  V.done = function () { return tt >= 1; };
  V.final = function () { tt = 1; };
  V.step = function () { tt = tt >= 1 ? 0 : M.min(1, tt + 0.25); };
  V.draw = function (c, L) {
    var s = '', ox = 30, oy = 300, u = 68, sq = M.pow(p, tt), i;
    function X(x) { return ox + x / sq * u; } function Y(y) { return oy - y * sq * u; }
    s += ln(ox, oy, ox + 300, oy, c.axis, 1.5) + ln(ox, oy, ox, 10, c.axis, 1.5);
    if (tt >= 1) s += ln(X(0), Y(0), ox + 280, oy - 280, c.muted, 1.5, '5 4');
    function region(x1, x2, col, sc) { var q = [], k; for (k = 0; k <= 60; k++) { var x = x1 + (x2 - x1) * k / 60; q.push([X(x), Y(1 / x)]); } return pa(poly(q, 1), col, 2, sc); }
    s += region(a, p, c.blue, c.blueSoft) + region(p, b, c.gold, c.goldSoft);
    var q = []; for (i = 0; i <= 200; i++) { var x = 0.3 + (5.6 - 0.3) * i / 200; var Xp = X(x), Yp = Y(1 / x); if (Xp < ox + 310 && Yp > 5) q.push([Xp, Yp]); } s += pa(poly(q), c.green, 3);
    [[a, 'A'], [p, 'P'], [b, 'B']].forEach(function (z) { s += ci(X(z[0]), Y(1 / z[0]), 5, c.ink) + tx(X(z[0]) + 12, Y(1 / z[0]) - 8, z[1], c.ink, 15); });
    var area = (p - a) * (1 / a + 1 / p) / 2 - M.log(p / a);
    L('a', 360, 40, 'p=\\sqrt{ab}=' + p.toFixed(3), c.ink, 'l');
    L('b', 360, 80, '(x,y)\\mapsto(x/s,\\ s\\,y)', c.green, 'l');
    L('b2', 360, 108, 's=' + sq.toFixed(3), c.green, 'l');
    L('c', 360, 140, '\\det=1:\\ \\text{areas kept}', c.muted, 'l');
    L('d', 360, 185, '\\text{area}_{AP}=' + area.toFixed(4), c.blue, 'l');
    L('e', 360, 225, '\\text{area}_{PB}=' + area.toFixed(4), c.gold, 'l');
    L('f', 360, 270, tt >= 1 ? 'P\\mapsto(1,1)' : '', c.ink, 'l');
    L('g', 360, 300, tt >= 1 ? '\\text{mirror in } y=x' : '', c.ink, 'l');
    return s;
  };
  V.cap = function () { return tt >= 1 ? 'After the squeeze, reflecting in the dashed line y = x swaps the blue and gold regions.' : 'The squeeze stretches one axis and shrinks the other by the same factor, keeping the hyperbola and all areas.'; };
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
