/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2009-a1. */
(window.CompViz = window.CompViz || {})['putnam-2009-a1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; var st = 0, cnt;
  V.aria = 'Nine points in a 3 by 3 grid around a center point P. The four unit squares with a corner at P are added one by one, then the big corner square is subtracted once and the tilted square through the edge midpoints is subtracted twice. Each point shows how many times it has been counted; at the end only P remains, counted 4 times.';
  var P = [], SQ = [[[0,0],[1,0],[1,1],[0,1]],[[0,0],[-1,0],[-1,1],[0,1]],[[0,0],[-1,0],[-1,-1],[0,-1]],[[0,0],[1,0],[1,-1],[0,-1]],[[1,1],[-1,1],[-1,-1],[1,-1]],[[1,0],[0,1],[-1,0],[0,-1]],[[1,0],[0,1],[-1,0],[0,-1]]];
  for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) P.push([i, j]);
  function key(p) { return p[0] + ',' + p[1]; }
  V.reset = function () { st = 0; cnt = {}; P.forEach(function (p) { cnt[key(p)] = 0; }); };
  V.step = function () { if (st >= 7) return; var sg = st < 4 ? 1 : -1; SQ[st].forEach(function (p) { cnt[key(p)] += sg; }); st++; };
  var acc = 0;
  V.advance = function (dt) { acc += dt; if (acc > 1.1) { acc = 0; V.step(); } if (st >= 7) return false; };
  V.done = function () { return st >= 7; };
  V.final = function () { while (st < 7) V.step(); };
  V.draw = function (c, L) {
    var s = '', cx = 160, cy = 160, u = 95;
    function X(p) { return cx + u * p[0]; } function Y(p) { return cy - u * p[1]; }
    if (st > 0) { var q = SQ[st - 1]; s += pa(poly(q.map(function (p) { return [X(p), Y(p)]; }), 1), st <= 4 ? c.green : c.red, 3, st <= 4 ? c.greenSoft : c.redSoft); }
    P.forEach(function (p) {
      var k = cnt[key(p)], ctr = !p[0] && !p[1];
      s += ci(X(p), Y(p), ctr ? 9 : 7, ctr ? c.gold : c.ink);
      if (st) s += tx(X(p) + 20, Y(p) - 12, (k > 0 ? '+' : k < 0 ? '−' : '') + M.abs(k), k ? c.ink : c.muted, 15);
    });
    s += tx(cx - 14, cy + 28, 'P', c.gold, 17);
    var msg = ['\\text{four unit squares touch } P', '\\text{square 1 of 4: sum } 0', '\\text{square 2 of 4: sum } 0', '\\text{square 3 of 4: sum } 0', '\\text{square 4 of 4: sum } 0', '\\text{minus corner square}', '\\text{minus tilted square (1st time)}', '\\text{minus tilted square (2nd time)}'];
    L('a', 330, 60, msg[st], st > 4 ? c.red : c.green, 'l');
    L('b', 330, 120, '4f(P)+2\\textstyle\\sum_{\\text{edge}}f', c.ink, 'l');
    L('b2', 330, 150, '\\quad+\\textstyle\\sum_{\\text{corner}}f=0', c.ink, 'l');
    L('c', 330, 195, '\\textstyle\\sum_{\\text{corner}}f=0,\\quad \\sum_{\\text{edge}}f=0', c.muted, 'l');
    L('d', 330, 250, st >= 7 ? '4f(P)=0\\ \\Rightarrow\\ f(P)=0' : '', c.gold, 'l');
    return s;
  };
  V.cap = function () { return st >= 7 ? 'Only the center is left, counted 4 times; every other point cancels.' : 'The numbers show how many times each point has been counted so far.'; };
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
