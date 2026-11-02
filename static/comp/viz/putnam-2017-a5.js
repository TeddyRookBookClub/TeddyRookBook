/* Our own diagram for the Putnam solutions guide: the slowly turning angle that decides who leads. */
(window.CompViz = window.CompViz || {})['putnam-2017-a5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math, NMAX = 20000;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A dial split into three sectors for players A, B and C. An arrow shows the angle of the product at a cube root of unity; as the number of cards grows the arrow keeps turning, slower and slower, through all three sectors. Bars show how far each player is above or below one third.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  // theta_n = sum of arg(omega + m - 1), m = 1..n (unwrapped)
  var TH = new Float64Array(NMAX + 1), wr = -0.5, wi = M.sqrt(3) / 2, n;
  for (n = 1; n <= NMAX; n++) TH[n] = TH[n - 1] + M.atan2(wi, wr + n - 1);
  var k = 0, nOf = function (k) { return M.max(1, M.round(M.pow(NMAX, k / 200))); };
  function f(v) { return (+v).toFixed(1); }
  function draw() {
    var c = api.colors(), N = nOf(k), th = TH[N], cx = 170, cy = 165, R = 120, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    var who = [['A', 1, c.blue], ['B', 2, c.orange], ['C', 0, c.purple]], i;
    for (i = 0; i < 3; i++) {
      var mid = 2 * M.PI * who[i][1] / 3, a0 = mid - M.PI / 3, a1 = mid + M.PI / 3;
      s += '<path d="M' + cx + ' ' + cy + 'L' + f(cx + R * M.cos(a0)) + ' ' + f(cy - R * M.sin(a0)) + 'A' + R + ' ' + R + ' 0 0 0 ' + f(cx + R * M.cos(a1)) + ' ' + f(cy - R * M.sin(a1)) + 'Z" fill="' + who[i][2] + '" opacity="0.18" stroke="' + c.grid + '"/>';
      L('s' + i, cx + (R + 18) * M.cos(mid), cy - (R + 18) * M.sin(mid), '\\text{' + who[i][0] + '}', who[i][2]);
    }
    var ax = cx + (R - 12) * M.cos(th), ay = cy - (R - 12) * M.sin(th);
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + f(ax) + '" y2="' + f(ay) + '" stroke="' + c.ink + '" stroke-width="3"/><circle cx="' + f(ax) + '" cy="' + f(ay) + '" r="6" fill="' + c.ink + '"/><circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + c.ink + '"/>';
    var best = 0, v = [];
    for (i = 0; i < 3; i++) { v[i] = M.cos(th - 2 * M.PI * who[i][1] / 3); if (v[i] > v[best]) best = i; }
    for (i = 0; i < 3; i++) {
      var bx = 400 + i * 75, h = 70 * v[i];
      s += '<line x1="' + (bx - 10) + '" y1="200" x2="' + (bx + 50) + '" y2="200" stroke="' + c.axis + '"/>';
      s += '<rect x="' + bx + '" y="' + f(h > 0 ? 200 - h : 200) + '" width="40" height="' + f(M.abs(h)) + '" fill="' + who[i][2] + '" opacity="' + (i === best ? 1 : 0.45) + '" rx="3"/>';
      L('b' + i, bx + 20, 290, '\\text{' + who[i][0] + '}', who[i][2]);
    }
    svg.innerHTML = s;
    L('n', 400, 30, 'n = ' + N + ' \\text{ cards}', c.ink, 'l');
    L('p', 400, 62, 'P_r - \\tfrac13 \\propto \\cos\\!\\big(\\theta_n - \\tfrac{2\\pi r}{3}\\big)', c.ink, 'l');
    L('t', 400, 98, '\\theta_n = \\textstyle\\sum_m \\arg(\\omega{+}m{-}1)', c.muted, 'l');
    cap.textContent = 'n = ' + N + ': ' + who[best][0] + ' has the best chance. The arrow keeps turning (in smaller and smaller steps), so every player leads again and again.';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    if (k >= 200) k = 0;
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); k++; draw(); if (k >= 200) stop(); }, 90);
  });
  btn('Step', function () { stop(); k = M.min(200, k + 10); draw(); });
  btn('Reset', function () { stop(); k = 0; draw(); });
  if (api.reduced()) k = 120;
  api.onTheme(draw); draw();
};
