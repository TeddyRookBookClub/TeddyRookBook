/* Our own animation for the Putnam solutions guide: the pairing strategy in the peg game. */
(window.CompViz = window.CompViz || {})['putnam-2020-b2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 250, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A row of holes grouped into pairs by brackets. Pegs move right. One player moves at random; the other always answers by moving the partner peg into the same pair, so every pair is again full or empty, until the random player has no move.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var n, k, holes, off, mover, pairer, turn, last, msg, over;
  function setup(nn, kk) {
    n = nn; k = kk; holes = []; for (var i = 0; i < n; i++) holes.push(i < k ? 1 : 0);
    last = null; over = false; turn = 'Alice';
    if (n % 2 === 0 && k % 2 === 0) { off = 0; pairer = 'Bob'; msg = 'Both even: Bob keeps every pair full or empty.'; }
    else if (n % 2 === 1 && k % 2 === 0) { off = 1; pairer = 'Alice'; holes[0] = 0; holes[k] = 1; last = [0, k]; turn = 'Bob'; msg = 'Alice opens: hole 1 to hole k+1. Hole 1 stays empty for good.'; }
    else if (n % 2 === 1) { off = 0; pairer = 'Alice'; holes[k - 1] = 0; holes[n - 1] = 1; last = [k - 1, n - 1]; turn = 'Bob'; msg = 'Alice opens: hole k to the last hole, which then never changes.'; }
    else { off = 1; pairer = 'Alice'; holes[0] = 0; holes[n - 1] = 1; last = [0, n - 1]; turn = 'Bob'; msg = 'Alice opens: hole 1 to the last hole. Both end holes are now fixed for good.'; }
  }
  function pairOf(i) { return i - ((i - off) % 2); }
  function legal() {
    var mv = [], i, j; for (i = 0; i < n; i++) if (holes[i]) for (j = i + 1; j < n; j++) if (!holes[j]) mv.push([i, j]);
    return mv;
  }
  function step() {
    if (over) return;
    var mv = legal();
    if (turn !== pairer) {
      if (!mv.length) { over = true; msg = turn + ' cannot move and loses. ' + pairer + ' wins.'; return; }
      var m = mv[M.floor(M.random() * mv.length)]; holes[m[0]] = 0; holes[m[1]] = 1; last = m;
      msg = turn + ' moves a peg from hole ' + (m[0] + 1) + ' to hole ' + (m[1] + 1) + '.';
    } else {
      var a = pairOf(last[0]), b = pairOf(last[1]), from = holes[a] ? a : a + 1, to = holes[b] ? b + 1 : b;
      holes[from] = 0; holes[to] = 1; last = [from, to];
      msg = pairer + ' answers inside the same two pairs: hole ' + (from + 1) + ' to hole ' + (to + 1) + '. Every pair is full or empty again.';
    }
    turn = turn === 'Alice' ? 'Bob' : 'Alice';
  }
  function draw() {
    var c = api.colors(), u = 48, x0 = (W - n * u) / 2, y0 = 95, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', i;
    for (i = off; i + 1 < n; i += 2) {
      s += '<rect x="' + (x0 + i * u + 3) + '" y="' + (y0 - 30) + '" width="' + (2 * u - 6) + '" height="60" rx="10" fill="none" stroke="' + c.gold + '" stroke-width="2" stroke-dasharray="6 4"/>';
    }
    for (i = 0; i < n; i++) {
      s += '<circle cx="' + (x0 + i * u + u / 2) + '" cy="' + y0 + '" r="15" fill="' + c.bg + '" stroke="' + c.axis + '" stroke-width="2"/>';
      if (holes[i]) s += '<circle cx="' + (x0 + i * u + u / 2) + '" cy="' + y0 + '" r="11" fill="' + c.green + '"/>';
      s += '<text x="' + (x0 + i * u + u / 2) + '" y="' + (y0 + 50) + '" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="' + c.muted + '">' + (i + 1) + '</text>';
    }
    if (last) { var a = x0 + last[0] * u + u / 2, b = x0 + last[1] * u + u / 2; s += '<path d="M' + a + ' ' + (y0 - 18) + 'Q' + ((a + b) / 2) + ' ' + (y0 - 60) + ' ' + b + ' ' + (y0 - 18) + '" fill="none" stroke="' + c.red + '" stroke-width="2.5"/>'; }
    svg.innerHTML = s;
    L('a', 16, 190, 'n = ' + n + ',\\ k = ' + k, c.ink, 'l');
    L('b', 16, 222, '\\text{pairing player: ' + pairer + '}', c.gold, 'l');
    cap.textContent = msg + (over ? '' : ' Next: ' + turn + '.');
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    if (over) { setup(n, k); }
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); step(); draw(); if (over) stop(); }, 1100);
  });
  btn('Step', function () { stop(); step(); draw(); });
  btn('n=10, k=4', function () { stop(); setup(10, 4); draw(); });
  btn('n=9, k=4', function () { stop(); setup(9, 4); draw(); });
  btn('n=9, k=3', function () { stop(); setup(9, 3); draw(); });
  btn('n=10, k=3', function () { stop(); setup(10, 3); draw(); });
  setup(10, 4); api.onTheme(draw); draw();
};
