/* Our own picture for the Putnam solutions guide: the running sign sum, cut into runs, and the run-end formula. */
(window.CompViz = window.CompViz || {})['putnam-2020-b6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330, M = Math, N = 70;
  function fa(k) { return M.floor(M.sqrt(2 * k * k) + 1e-9) - k; } // floor(k(sqrt2-1)); exact for these small k
  var S = [0], k, runs = [];
  for (k = 1; k <= N; k++) S.push(S[k - 1] + (fa(k) % 2 ? -1 : 1));
  for (k = 1; k <= N; k++) { var j = fa(k); if (!runs[j]) runs[j] = { a: k, b: k }; runs[j].b = k; }
  if (runs[runs.length - 1].b + 3 > N) runs.pop(); // drop a run that may be cut off
  var top = 0; S.forEach(function (v) { if (v > top) top = v; });
  var x0 = 34, x1 = 622, yb = 250, yt = 46;
  function X(n) { return x0 + (x1 - x0) * n / N; }
  function Y(v) { return yb - (yb - yt) * v / (top + 1); }
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A step graph of the running sum S(n) for n up to 70. Shaded bands mark the runs where the sign stays the same. For the chosen run, its end value is shown equal to S at a much smaller index, plus 2 when the run number is even. The graph never goes below zero.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(key, x, y, t, col) {
    var o = labs[key]; if (!o) { o = labs[key] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(-50%,-50%);white-space:nowrap;font-size:clamp(10px,2.5vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var m = 3;
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', i, r;
    for (i = 0; i < runs.length; i++) {
      r = runs[i];
      s += '<rect x="' + X(r.a - 1).toFixed(1) + '" y="' + yt + '" width="' + (X(r.b) - X(r.a - 1)).toFixed(1) + '" height="' + (yb - yt) + '" fill="' + (i % 2 ? c.redSoft : c.greenSoft) + '" opacity="' + (i === m ? 1 : 0.45) + '"/>';
    }
    for (i = 0; i <= top + 1; i++) s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(i).toFixed(1) + '" y2="' + Y(i).toFixed(1) + '" stroke="' + c.grid + '"/>' +
      '<text x="' + (x0 - 8) + '" y="' + (Y(i) + 5).toFixed(1) + '" text-anchor="end" font-size="13" font-family="system-ui,sans-serif" fill="' + c.muted + '">' + i + '</text>';
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + yb + '" y2="' + yb + '" stroke="' + c.axis + '" stroke-width="1.5"/>';
    for (i = 10; i <= N; i += 10) s += '<text x="' + X(i).toFixed(1) + '" y="' + (yb + 18) + '" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="' + c.muted + '">' + i + '</text>';
    var d = 'M' + X(0) + ' ' + Y(0);
    for (i = 1; i <= N; i++) d += 'L' + X(i).toFixed(1) + ' ' + Y(S[i]).toFixed(1);
    s += '<path d="' + d + '" fill="none" stroke="' + c.ink + '" stroke-width="2" stroke-linejoin="round"/>';
    for (i = 1; i <= N; i++) if (S[i] === 0) s += '<circle cx="' + X(i).toFixed(1) + '" cy="' + yb + '" r="4" fill="' + c.red + '"/>';
    r = runs[m];
    var e = r.b, sm = fa(m + 1), tm = S[e];
    s += '<line x1="' + X(sm).toFixed(1) + '" y1="' + Y(S[sm]).toFixed(1) + '" x2="' + X(e).toFixed(1) + '" y2="' + Y(S[sm]).toFixed(1) + '" stroke="' + c.teal + '" stroke-width="2" stroke-dasharray="5 4"/>';
    if (m % 2 === 0) s += '<line x1="' + X(e).toFixed(1) + '" y1="' + Y(S[sm]).toFixed(1) + '" x2="' + X(e).toFixed(1) + '" y2="' + Y(tm).toFixed(1) + '" stroke="' + c.gold + '" stroke-width="2.5"/>';
    s += '<circle cx="' + X(sm).toFixed(1) + '" cy="' + Y(S[sm]).toFixed(1) + '" r="6" fill="' + c.teal + '"/>';
    s += '<circle cx="' + X(e).toFixed(1) + '" cy="' + Y(tm).toFixed(1) + '" r="6" fill="' + c.gold + '" stroke="' + c.ink + '" stroke-width="1"/>';
    svg.innerHTML = s;
    L('f', W / 2, 20, 'T_{' + m + '} = S(' + e + ') = S(\\lfloor ' + (m + 1) + '\\alpha\\rfloor)' + (m % 2 ? '' : ' + 2') + ' = S(' + sm + ')' + (m % 2 ? '' : ' + 2') + ' = ' + tm, c.ink);
    L('g', W / 2, 300, '\\text{run } R_{' + m + '} = \\{' + r.a + ',\\dots,' + r.b + '\\},\\ \\text{sign } ' + (m % 2 ? '-1' : '+1'), m % 2 ? c.red : c.green);
    cap.textContent = 'Run ' + m + ' covers n = ' + r.a + ' to ' + r.b + '. Its end value (gold) equals S(' + sm + ') (teal)' + (m % 2 ? '' : ' plus 2') + '. Red dots mark where the sum touches 0.';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  function go(dm) { m = (m + dm + runs.length) % runs.length; draw(); }
  pb = btn('Play', function () {
    if (timer) return stop();
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); go(1); }, 1400);
  });
  btn('Previous run', function () { stop(); go(-1); });
  btn('Next run', function () { stop(); go(1); });
  api.onTheme(draw); draw();
};
