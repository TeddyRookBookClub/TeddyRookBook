/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2022-p1. */
(window.CompViz = window.CompViz || {})['imo-2022-p1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 250;
  V.aria = 'A row of twelve coins of two kinds. Each step moves the run that contains the k-th coin to the front. The number of runs never goes up; for k between 6 and 9 the row ends up sorted.';
  var n = 6, k = 8, row = [], hist = [], acc = 0, t = 0, moving = null;
  function runs(a) { var r = 1; for (var i = 1; i < a.length; i++) if (a[i] !== a[i - 1]) r++; return r; }
  function chain(a, j) { var l = j, r = j; while (l > 0 && a[l - 1] === a[j]) l--; while (r < a.length - 1 && a[r + 1] === a[j]) r++; return [l, r]; }
  function op(a) { var c = chain(a, k - 1); return a.slice(c[0], c[1] + 1).concat(a.slice(0, c[0]), a.slice(c[1] + 1)); }
  function sorted(a) { for (var i = 1; i < n; i++) if (a[i] !== a[0]) return false; return true; }
  function fresh() { row = []; for (var i = 0; i < n; i++) row.push(0, 1); for (i = row.length - 1; i > 0; i--) { var j = M.floor(M.random() * (i + 1)), q = row[i]; row[i] = row[j]; row[j] = q; } hist = [row.slice()]; }
  function badRow() { var h = M.floor(n / 2), a = [], i; for (i = 0; i < h; i++) a.push(0); for (i = 0; i < h; i++) a.push(1); for (i = 0; i < n - h; i++) a.push(0); for (i = 0; i < n - h; i++) a.push(1); row = a; hist = [row.slice()]; }
  V.reset = function () { row = hist[0].slice(); hist = [row.slice()]; acc = 0; t = 0; };
  V.step = function () { if (sorted(row) && hist.length > 1) return; row = op(row); hist.push(row.slice()); };
  V.advance = function (dt) { acc += dt; if (acc > 1.1) { acc = 0; V.step(); if ((sorted(row) && hist.length > 1) || hist.length > 14) return false; } };
  V.done = function () { return (sorted(row) && hist.length > 1) || hist.length > 14; };
  V.final = function () { for (var i = 0; i < 12 && !(sorted(row) && hist.length > 1); i++) V.step(); };
  V.buttons = [['k − 1', function () { k = M.max(1, k - 1); V.reset(); }], ['k + 1', function () { k = M.min(2 * n, k + 1); V.reset(); }], ['New row', function () { fresh(); }], ['Four long runs', function () { badRow(); }]];
  V.draw = function (c, L) {
    var s = '', R = 19, gap = 44, x0 = 320 - (2 * n - 1) * gap / 2, rows = hist.slice(-3), y0 = 70;
    rows.forEach(function (a, ri) {
      var y = y0 + ri * 56, cur = ri === rows.length - 1, ch = chain(a, k - 1), op1 = cur ? 1 : 0.45;
      s += '<g opacity="' + op1 + '">';
      if (cur && !(sorted(a) && hist.length > 1)) s += re(x0 + ch[0] * gap - R - 4, y - R - 4, (ch[1] - ch[0]) * gap + 2 * R + 8, 2 * R + 8, c.goldSoft, c.gold, 10);
      for (var i = 0; i < a.length; i++) { var x = x0 + i * gap; s += ci(x, y, R, a[i] ? c.orangeSoft : c.blueSoft, a[i] ? c.orange : c.blue, 2.5) + tx(x, y + 5.5, a[i] ? 'B' : 'A', c.ink, 15, 'middle', 600); }
      s += '</g>';
    });
    var xk = x0 + (k - 1) * gap; s += pa('M' + f1(xk) + ' 30 l-7 -10 h14 z', c.red, 1, c.red) + tx(xk, 18, 'k = ' + k, c.red, 14);
    var r = runs(row), ok = k >= n && k <= M.ceil(3 * n / 2);
    L('r', 20, 238, '\\text{runs } r=' + r + (sorted(row) ? '\\ \\text{— sorted}' : ''), r === 2 ? c.green : c.ink, 'l');
    L('g', 620, 238, 'n\\le k\\le\\lceil 3n/2\\rceil:\\ ' + (ok ? '\\text{yes}' : '\\text{no}'), ok ? c.green : c.red, 'r');
    return s;
  };
  V.cap = function () { return 'n = ' + n + ' coins of each kind, step ' + (hist.length - 1) + '. The gold box is the run holding coin k; it moves to the front. The latest row is at the bottom.'; };
  fresh();
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
