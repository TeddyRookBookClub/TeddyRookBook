/* Our own animation for the Putnam solutions guide: random blackening on a strip of squares. */
(window.CompViz = window.CompViz || {})['putnam-2020-a4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 280, M = Math, N = 24;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A strip of 24 white squares between two black ends. A random white square points at a random neighbor, which turns black. When only isolated white squares remain, the count is recorded; the running average of leftovers per square approaches 1 over e.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var exact = (function () { var e = 0, fct = 1, k; for (k = 0; k <= N + 1; k++) { if (k) fct *= k; e += (k % 2 ? -1 : 1) / fct; } return (N + 1) * e; })();
  var col, last = null, runs = 0, total = 0, done = false;
  function reset() { col = [1]; for (var i = 0; i < N; i++) col.push(0); col.push(1); last = null; done = false; }
  function finished() { for (var i = 1; i <= N; i++) if (!col[i] && (!col[i - 1] || !col[i + 1])) return false; return true; }
  function move() {
    if (done) { reset(); return; }
    var wh = []; for (var i = 1; i <= N; i++) if (!col[i]) wh.push(i);
    var s = wh[M.floor(M.random() * wh.length)], t = s + (M.random() < 0.5 ? -1 : 1);
    last = [s, t, !col[t]]; col[t] = 1;
    if (finished()) { done = true; runs++; total += left(); }
  }
  function left() { var n = 0; for (var i = 1; i <= N; i++) if (!col[i]) n++; return n; }
  function quick() { reset(); while (!done) move(); }
  function draw() {
    var c = api.colors(), u = 24, x0 = 8, y0 = 40, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', i;
    for (i = 0; i <= N + 1; i++) s += '<rect x="' + (x0 + i * u) + '" y="' + y0 + '" width="' + (u - 2) + '" height="' + (u - 2) + '" rx="3" fill="' + (col[i] ? c.ink : c.bg) + '" stroke="' + c.axis + '"/>';
    if (last) {
      var a = x0 + last[0] * u + u / 2 - 1, b = x0 + last[1] * u + u / 2 - 1;
      s += '<path d="M' + a + ' ' + (y0 - 4) + 'Q' + ((a + b) / 2) + ' ' + (y0 - 22) + ' ' + b + ' ' + (y0 - 4) + '" fill="none" stroke="' + (last[2] ? c.red : c.muted) + '" stroke-width="2.5"/>';
      s += '<circle cx="' + b + '" cy="' + (y0 - 4) + '" r="3.5" fill="' + (last[2] ? c.red : c.muted) + '"/>';
    }
    if (done) for (i = 1; i <= N; i++) if (!col[i]) s += '<circle cx="' + (x0 + i * u + u / 2 - 1) + '" cy="' + (y0 + 36) + '" r="4" fill="' + c.gold + '"/>';
    svg.innerHTML = s;
    L('a', 16, 130, '\\text{runs: } ' + runs + ',\\ \\text{ average left} / N = ' + (runs ? (total / runs / N).toFixed(3) : '-'), c.ink, 'l');
    L('b', 16, 168, '\\text{exact: } \\tfrac{w(24)}{24} = \\tfrac{25}{24}\\textstyle\\sum_{k=0}^{25}\\tfrac{(-1)^k}{k!} = ' + (exact / N).toFixed(4), c.green, 'l');
    L('c', 16, 206, 'w(L)-w(L-1) = \\tfrac{w(L-2)}{L-1}', c.muted, 'l');
    L('d', 16, 244, '\\tfrac{w(N)}{N} \\to \\tfrac1e \\approx 0.3679', c.gold, 'l');
    cap.textContent = done ? 'Stopped: ' + left() + ' white squares are left, all isolated (gold dots).' : last ? (last[2] ? 'A white square pointed at a white neighbor, which turns black.' : 'It pointed at a square that was already black: nothing changes.') : 'Press Play to start blackening.';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); move(); draw(); }, 260);
  });
  btn('Step', function () { stop(); move(); draw(); });
  btn('Run 200 strips', function () { stop(); for (var i = 0; i < 200; i++) quick(); draw(); });
  reset();
  if (api.reduced()) { for (var i = 0; i < 50; i++) quick(); }
  api.onTheme(draw); draw();
};
