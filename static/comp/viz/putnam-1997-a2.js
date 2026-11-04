/* Our own diagram for the Putnam solutions guide: the penny-passing game (1997 A2). */
(window.CompViz = window.CompViz || {})['putnam-1997-a2'] = function (el, api) {
  var W = 640, H = 320, ARIA = 'Players sit around a circle with the number of pennies each holds. Pressing Play passes 1 and 2 pennies alternately; players who run out leave, and for n = 2 to the m plus 2 the table halves each round until one player holds everything.';
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block'; svg.setAttribute('aria-label', ARIA);
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  function btn(tt, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = tt; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  function f1(v) { return (+v).toFixed(1); }
  var NS_ = [10, 18, 34], ni = 0, st, timer = 0, pb;
  function reset() { var n = NS_[ni]; st = { n: n, p: [], alive: [], i: 0, give: 1, moves: 0, last: null }; for (var k = 0; k < n; k++) { st.p.push(1); st.alive.push(k); } }
  function move() {
    if (st.alive.length < 2) return false;
    var cur = st.alive[st.i], nx = st.alive[(st.i + 1) % st.alive.length], amt = M.min(st.give, st.p[cur]);
    st.p[cur] -= amt; st.p[nx] += amt; st.last = [cur, nx, amt]; st.give = 3 - st.give; st.moves++;
    if (st.p[cur] === 0) { st.alive.splice(st.i, 1); st.i = st.alive.indexOf(nx); } else st.i = (st.i + 1) % st.alive.length;
    return true;
  }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', n = st.n, cx = 200, cy = 165, R = 130, k;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + c.grid + '" stroke-width="10"/>';
    for (k = 0; k < n; k++) {
      var a = -M.PI / 2 + 2 * M.PI * k / n, x = cx + R * M.cos(a), y = cy + R * M.sin(a), on = st.p[k] > 0;
      var nextUp = st.alive.length > 1 && st.alive[st.i] === k;
      s += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + (n > 20 ? 9 : 13) + '" fill="' + (on ? c.goldSoft : c.panel) + '" stroke="' + (nextUp ? c.red : on ? c.gold : c.grid) + '" stroke-width="' + (nextUp ? 3 : 1.5) + '"/>';
    }
    if (st.last) {
      var a1 = -M.PI / 2 + 2 * M.PI * st.last[0] / n, a2 = -M.PI / 2 + 2 * M.PI * st.last[1] / n, r2 = R - 26;
      s += '<line x1="' + f1(cx + r2 * M.cos(a1)) + '" y1="' + f1(cy + r2 * M.sin(a1)) + '" x2="' + f1(cx + r2 * M.cos(a2)) + '" y2="' + f1(cy + r2 * M.sin(a2)) + '" stroke="' + c.green + '" stroke-width="' + (st.last[2] * 2) + '"/>';
    }
    svg.innerHTML = s;
    for (k = 0; k < n; k++) {
      var b = -M.PI / 2 + 2 * M.PI * k / n;
      L('p' + k, cx + R * M.cos(b), cy + R * M.sin(b), st.p[k] ? String(st.p[k]) : '', c.ink, 'c');
    }
    for (k = n; k < 40; k++) if (labs['p' + k]) L('p' + k, 0, 0, '', c.ink, 'c');
    L('a', 370, 50, 'n = ' + n + ' = 2^{' + M.round(M.log(n - 2) / M.LN2) + '}+2', c.ink, 'l');
    L('b', 370, 95, '\\text{players left: }' + st.alive.length, c.ink, 'l');
    L('c', 370, 140, '\\text{next pass: }' + (st.alive.length > 1 ? st.give : '-'), c.ink, 'l');
    L('d', 370, 185, '\\text{moves: }' + st.moves, c.muted, 'l');
    L('e', 370, 240, 'T(k,a,b)\\ \\to\\ T(\\tfrac k2,\\,2a,\\,b)', c.green, 'l');
    var amts = st.alive.map(function (q) { return st.p[q]; });
    cap.textContent = st.alive.length < 2 ? 'One player holds all ' + n + ' pennies.' : 'Pennies held: ' + amts.join(', ') + '. Red ring: next to pass.';
  }
  function stop() { clearInterval(timer); timer = 0; if (pb) pb.textContent = 'Play'; }
  if (!api.reduced()) pb = btn('Play', function () { if (timer) return stop(); pb.textContent = 'Pause'; timer = setInterval(function () { if (!el.isConnected || !move()) return stop(); draw(); }, 160); });
  btn('Step', function () { stop(); move(); draw(); });
  btn('Skip ahead', function () { stop(); var k0 = st.alive.length; for (var g = 0; g < 4000 && st.alive.length === k0 && move(); g++); draw(); });
  btn('Change n', function () { stop(); ni = (ni + 1) % NS_.length; reset(); draw(); });
  reset(); api.onTheme(draw); draw();
};
