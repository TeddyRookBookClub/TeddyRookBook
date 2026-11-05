/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1999-p3. */
(window.CompViz = window.CompViz || {})['imo-1999-p3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 420, aria: '' };
  V.aria = 'An even square board in chessboard colors. One view shows the marked cells: on every fourth anti-diagonal, cells with both coordinates odd above the middle and both even below, plus their mirror image. The other view shows the witness cells, no two sharing a neighbor, on every other square ring.';
  var k = 4, mode = 0;
  function bstar(i, j, n) { var s = i + j; if (s % 4) return false; return (s <= n && i % 2 && j % 2) || (s >= n + 2 && !(i % 2) && !(j % 2)); }
  function wit(i, j, n) { var t = M.min(i, j, n + 1 - i, n + 1 - j); return (i + j) % 2 === 1 && (((i - j) % 4) + 4) % 4 === 3 && t % 2 === 1; }
  V.buttons = [['Smaller board', function () { if (k > 1) k--; }], ['Bigger board', function () { if (k < 8) k++; }], ['Marks / witnesses', function () { mode = 1 - mode; }]];
  V.final = function () { };
  V.draw = function (c, L) {
    var n = 2 * k, sz = M.min(380 / n, 46), x0 = 320 - sz * n / 2, y0 = 210 - sz * n / 2, s = '', cnt = [0, 0, 0];
    for (var i = 1; i <= n; i++) for (var j = 1; j <= n; j++) {
      var x = x0 + (j - 1) * sz, y = y0 + (i - 1) * sz, blk = (i + j) % 2 === 0;
      var t = M.min(i, j, n + 1 - i, n + 1 - j);
      var f = blk ? c.grid : c.panel;
      s += re(x, y, sz, sz, f, c.axis);
      if (mode && t % 2 === 1) s += re(x, y, sz, sz, c.greenSoft);
      if (!mode) {
        if (bstar(i, j, n)) { s += ci(x + sz / 2, y + sz / 2, sz * 0.3, c.blue); cnt[0]++; }
        if (bstar(i, n + 1 - j, n)) { s += ci(x + sz / 2, y + sz / 2, sz * 0.3, c.orange); cnt[1]++; }
      } else if (wit(i, j, n)) { s += re(x + sz * 0.22, y + sz * 0.22, sz * 0.56, sz * 0.56, c.red, null, 3); cnt[2]++; }
      if (blk && !mode) s += ci(x + sz / 2, y + sz / 2, 1.6, c.muted);
    }
    var q = k * (k + 1) / 2;
    if (!mode) L('f', 320, 405, 'n=' + n + ':\\ ' + cnt[0] + '\\text{ blue} + ' + cnt[1] + '\\text{ orange} = ' + (cnt[0] + cnt[1]) + ' = \\tfrac{n(n+2)}{4}', c.ink);
    else L('f', 320, 405, 'n=' + n + ':\\ ' + cnt[2] + ' = 1+\\dots+' + k + ' = ' + q + '\\text{ witness cells}', c.ink);
    return s;
  };
  V.cap = function () { return mode ? 'Witness cells (red) are white cells with i − j ≡ 3 (mod 4) on the shaded rings (every other ring from the outside). No two share a neighbor, so each needs its own black mark.' : 'Blue marks are black cells; every white cell touches one. Orange marks are the mirror image; every black cell touches one. Small dots show the black cells.'; };
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
