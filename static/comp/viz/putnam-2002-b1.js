/* Our own diagram for the Putnam solutions guide: many simulated seasons of the self-reinforcing shooter (2002 B1). */
(window.CompViz = window.CompViz || {})['putnam-2002-b1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math, RUNS = 3000, MAXN = 100;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A bar chart of the number of hits after n shots over 3000 simulated runs. As n grows from 2 to 100, the bars stay level near the dashed line at height 1 over n minus 1: every count of hits is equally likely.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(-100%,-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var hits = new Int32Array(RUNS), n = 2;
  function reset() { for (var r = 0; r < RUNS; r++) hits[r] = 1; n = 2; }
  function shoot() { // shot number n+1
    if (n >= MAXN) return;
    for (var r = 0; r < RUNS; r++) if (M.random() < hits[r] / n) hits[r]++;
    n++;
  }
  function draw() {
    var c = api.colors(), x0 = 40, x1 = 620, y0 = 270, top = 60, cnt = [], k, mx = 0;
    for (k = 0; k <= n; k++) cnt.push(0);
    for (var r = 0; r < RUNS; r++) cnt[hits[r]]++;
    var p = 1 / (n - 1), scale = (y0 - top) / (2.2 * p), bw = (x1 - x0) / (n - 1);
    var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" stroke="' + c.axis + '"/>';
    for (k = 1; k <= n - 1; k++) {
      var h = cnt[k] / RUNS * scale, x = x0 + (k - 1) * bw;
      s += '<rect x="' + (x + bw * 0.08).toFixed(2) + '" y="' + (y0 - h).toFixed(2) + '" width="' + M.max(0.6, bw * 0.84).toFixed(2) + '" height="' + h.toFixed(2) + '" fill="' + c.greenSoft + '" stroke="' + c.green + '" stroke-width="' + (bw > 6 ? 1 : 0) + '"/>';
    }
    var yl = y0 - p * scale;
    s += '<line x1="' + x0 + '" y1="' + yl.toFixed(1) + '" x2="' + x1 + '" y2="' + yl.toFixed(1) + '" stroke="' + c.gold + '" stroke-width="2.5" stroke-dasharray="7 5"/>';
    s += '<text x="' + x0 + '" y="' + (y0 + 20) + '" fill="' + c.muted + '" font-size="13" font-family="system-ui,sans-serif">1 hit</text>';
    s += '<text x="' + x1 + '" y="' + (y0 + 20) + '" fill="' + c.muted + '" font-size="13" font-family="system-ui,sans-serif" text-anchor="end">' + (n - 1) + (n === 2 ? ' hit' : ' hits') + '</text>';
    svg.innerHTML = s;
    L('a', 620, 26, 'n = ' + n + '\\text{ shots, ' + RUNS + ' runs}', c.ink);
    L('b', 620, 50, 'P(k \\text{ hits}) = \\tfrac{1}{n-1} = ' + (p < 0.1 ? p.toFixed(4) : p.toFixed(3)), c.gold);
    cap.textContent = n < MAXN ? 'Bars: share of runs with each number of hits. They stay level at 1/(n − 1).'
      : 'After 100 shots every count from 1 to 99 is about equally common, so exactly 50 hits has chance 1/99.';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    if (n >= MAXN) reset();
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); shoot(); draw(); if (n >= MAXN) stop(); }, 90);
  });
  btn('Next shot', function () { stop(); shoot(); draw(); });
  btn('To 100', function () { stop(); while (n < MAXN) shoot(); draw(); });
  btn('Reset', function () { stop(); reset(); draw(); });
  reset(); while (n < 12) shoot();
  api.onTheme(draw); draw();
};
