/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2024-p5. */
(window.CompViz = window.CompViz || {})['imo-2024-p5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 320;
  V.aria = 'A small board with hidden monsters. The snail walks row 2 to find its monster, then goes around it, or climbs a staircase when the monster is at the edge. It always reaches the bottom row within three attempts.';
  var C = 7, R = C + 1, S = 36, X0 = 24, Y0 = 34, mon = {}, plan = [], ai = 0, cix = 0, acc = 0, known = {}, hit = {}, edge = false;
  function key(r, c) { return r + ',' + c; }
  function newBoard(forceEdge) {
    var cols = []; for (var i = 1; i <= C; i++) cols.push(i);
    for (i = cols.length - 1; i > 0; i--) { var j = M.floor(M.random() * (i + 1)), t = cols[i]; cols[i] = cols[j]; cols[j] = t; }
    if (forceEdge) { var e = M.random() < 0.5 ? 1 : C, p = cols.indexOf(e); cols[p] = cols[0]; cols[0] = e; }
    mon = {}; for (var r = 2; r <= C; r++) mon[r] = cols[r - 2];
    makePlan();
  }
  function walk(path) { var out = []; for (var i = 0; i < path.length; i++) { out.push(path[i]); if (mon[path[i][0]] === path[i][1]) return { p: out, hit: path[i] }; if (path[i][0] === R) break; } return { p: out, hit: null }; }
  function makePlan() {
    plan = []; var a = [[1, 1]]; for (var c = 1; c <= C; c++) a.push([2, c]);
    var w = walk(a); plan.push(w); var c0 = w.hit[1], k, r;
    edge = (c0 === 1 || c0 === C);
    if (!edge) {
      [-1, 1].forEach(function (d) {
        if (plan.length > 1 && !plan[plan.length - 1].hit) return;
        var p = [[1, c0 + d], [2, c0 + d], [3, c0 + d], [3, c0]]; for (r = 4; r <= R; r++) p.push([r, c0]);
        plan.push(walk(p));
      });
    } else {
      var fl = c0 === C, T = function (p) { return fl ? p.map(function (q) { return [q[0], C + 1 - q[1]]; }) : p; };
      var st = [[1, 2]]; for (r = 2; r < C; r++) { st.push([r, r]); st.push([r, r + 1]); } st.push([C, C]); st.push([R, C]);
      w = walk(T(st)); plan.push(w);
      if (w.hit) {
        var hr = w.hit[0], hc = fl ? C + 1 - w.hit[1] : w.hit[1], p = [], idx;
        if (hc === hr) { for (k = 0; k < st.length; k++) { p.push(st[k]); if (st[k][0] === hr - 1 && st[k][1] === hr - 1) break; } p.push([hr, hr - 1]); for (c = hr - 2; c >= 1; c--) p.push([hr, c]); }
        else { for (k = 0; k < st.length; k++) { p.push(st[k]); if (st[k][0] === hr && st[k][1] === hr) break; } for (c = hr - 1; c >= 1; c--) p.push([hr, c]); }
        for (r = hr + 1; r <= R; r++) p.push([r, 1]);
        plan.push(walk(T(p)));
      }
    }
  }
  V.reset = function () { ai = 0; cix = 0; acc = 0; known = {}; hit = {}; };
  function mark() {
    var q = plan[ai].p[cix]; if (!q) return;
    if (mon[q[0]] === q[1]) { hit[key(q[0], q[1])] = 1; for (var c = 1; c <= C; c++) if (c !== q[1]) known[key(q[0], c)] = 1; for (var r = q[0] + 1; r < R; r++) known[key(r, q[1])] = 1; }
    else known[key(q[0], q[1])] = 1;
  }
  V.step = function () {
    if (ai >= plan.length) return; mark(); cix++;
    if (cix >= plan[ai].p.length) { if (ai < plan.length - 1) { ai++; cix = 0; } else { ai = plan.length; } }
  };
  V.advance = function (dt) { acc += dt; if (acc > 0.32) { acc = 0; V.step(); } if (ai >= plan.length) return false; };
  V.done = function () { return ai >= plan.length; };
  V.final = function () { while (ai < plan.length) V.step(); };
  V.buttons = [['New board', function () { newBoard(false); V.reset(); }], ['Monster at the edge', function () { newBoard(true); V.reset(); }]];
  V.draw = function (c, L) {
    var s = '', r, cc, a = M.min(ai, plan.length - 1), show = ai >= plan.length;
    for (r = 1; r <= R; r++) for (cc = 1; cc <= C; cc++) {
      var x = X0 + (cc - 1) * S, y = Y0 + (r - 1) * S, k = key(r, cc), f = c.bg;
      if (r === 1 || r === R) f = c.greenSoft; else if (known[k]) f = c.blueSoft;
      s += re(x, y, S - 3, S - 3, f, c.grid, 5);
      if (hit[k]) s += tx(x + S / 2 - 1.5, y + S / 2 + 5, '✱', c.red, 20, 'middle', 700);
      else if (show && mon[r] === cc) s += tx(x + S / 2 - 1.5, y + S / 2 + 5, '✱', c.muted, 16);
    }
    for (var i = 0; i <= a && i < plan.length; i++) {
      var p = plan[i].p, upto = i < ai ? p.length : cix, pts = [];
      for (var j = 0; j < upto && j < p.length; j++) pts.push([X0 + (p[j][1] - 0.5) * S - 1.5, Y0 + (p[j][0] - 0.5) * S - 1.5]);
      if (pts.length > 1) s += pa(poly(pts), [c.orange, c.purple, c.green][i], 3);
      if (i === a && pts.length && !show) s += ci0(pts[pts.length - 1], c);
    }
    var tx0 = X0 + C * S + 22;
    s += tx(tx0, Y0 + 14, 'Attempt ' + (M.min(ai, plan.length - 1) + 1) + (show ? ' — done' : ''), c.ink, 17, 'start', 600);
    s += re(tx0, Y0 + 32, 14, 14, c.blueSoft) + tx(tx0 + 22, Y0 + 44, 'known to be safe', c.muted, 14, 'start');
    s += tx(tx0 + 7, Y0 + 72, '✱', c.red, 16) + tx(tx0 + 22, Y0 + 72, 'monster found', c.muted, 14, 'start');
    s += ln(tx0, Y0 + 92, tx0 + 14, Y0 + 92, c.orange, 3) + tx(tx0 + 22, Y0 + 97, '1st', c.muted, 14, 'start');
    s += ln(tx0 + 60, Y0 + 92, tx0 + 74, Y0 + 92, c.purple, 3) + tx(tx0 + 82, Y0 + 97, '2nd', c.muted, 14, 'start');
    s += ln(tx0 + 120, Y0 + 92, tx0 + 134, Y0 + 92, c.green, 3) + tx(tx0 + 142, Y0 + 97, '3rd', c.muted, 14, 'start');
    L('a', tx0, Y0 + 140, '\\text{one monster per row}', c.ink, 'l');
    L('b', tx0, Y0 + 168, '\\text{at most one per column}', c.ink, 'l');
    L('c', tx0, Y0 + 205, edge ? '\\text{edge: staircase}' : '\\text{middle: go around}', c.gold, 'l');
    L('d', tx0, Y0 + 245, 'n=3', c.green, 'l');
    return s;
  };
  function ci0(p, c) { return ci(p[0], p[1], 9, c.gold, c.ink, 1.5); }
  V.cap = function () { return 'A ' + R + '-row, ' + C + '-column board (the real one has 2024 rows and 2023 columns). ' + (ai >= plan.length ? 'The snail reached the bottom row on attempt ' + plan.length + '. Grey stars show the monsters it never needed to meet.' : 'Finding a monster clears the rest of its row and its column.'); };
  newBoard(false);
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
