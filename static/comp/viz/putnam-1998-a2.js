/* Our own diagram for the Putnam solutions guide: two areas under an arc (1998 A2). */
(window.CompViz = window.CompViz || {})['putnam-1998-a2'] = function (el, api) {
  var W = 640, H = 320, ARIA = 'A quarter of the unit circle with a highlighted arc. The region below the arc is shaded blue (A) and the region to its left orange (B). Sliders move and resize the arc; the readout shows A plus B equal to the arc length.';
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
  var len = 0.6, start = 0.3, X0 = 40, Y0 = 290, R = 250;
  function P(x, y) { return f1(X0 + R * x) + ' ' + f1(Y0 - R * y); }
  function draw() {
    var c = api.colors(), a = start, b = start + len, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', i, N = 40;
    var arc = ''; for (i = 0; i <= N; i++) { var t = a + (b - a) * i / N; arc += 'L' + P(M.cos(t), M.sin(t)); }
    var arcR = ''; for (i = N; i >= 0; i--) { var t2 = a + (b - a) * i / N; arcR += 'L' + P(M.cos(t2), M.sin(t2)); }
    s += '<path d="M' + P(M.cos(b), 0) + 'L' + P(M.cos(a), 0) + arc + 'Z" fill="' + c.blueSoft + '" stroke="none"/>';
    s += '<path d="M' + P(0, M.sin(a)) + 'L' + P(0, M.sin(b)) + arcR + 'Z" fill="' + c.orangeSoft + '" stroke="none"/>';
    var q = ''; for (i = 0; i <= 60; i++) { var t3 = M.PI / 2 * i / 60; q += (i ? 'L' : 'M') + P(M.cos(t3), M.sin(t3)); }
    s += '<path d="' + q + '" fill="none" stroke="' + c.grid + '" stroke-width="2"/>';
    s += '<path d="M' + arc.slice(1) + '" fill="none" stroke="' + c.green + '" stroke-width="4"/>';
    s += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + (X0 + R + 20) + '" y2="' + Y0 + '" stroke="' + c.axis + '"/><line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X0 + '" y2="' + (Y0 - R - 20) + '" stroke="' + c.axis + '"/>';
    svg.innerHTML = s;
    var A = (b - a) / 2 + (M.sin(2 * a) - M.sin(2 * b)) / 4, B = (b - a) / 2 + (M.sin(2 * b) - M.sin(2 * a)) / 4;
    L('a', X0 + R * (M.cos(a) + M.cos(b)) / 2, Y0 - 18, 'A', c.blue, 'c');
    L('b', X0 + 18, Y0 - R * (M.sin(a) + M.sin(b)) / 2, 'B', c.orange, 'l');
    L('f1', 330, 60, 'A = ' + A.toFixed(4), c.blue, 'l');
    L('f2', 330, 100, 'B = ' + B.toFixed(4), c.orange, 'l');
    L('f3', 330, 145, 'A+B = ' + (A + B).toFixed(4), c.ink, 'l');
    L('f4', 330, 190, '\\beta-\\alpha = ' + len.toFixed(4), c.green, 'l');
    L('f5', 330, 240, 'A+B = \\tfrac{\\beta-\\alpha}{2}+\\tfrac{\\beta-\\alpha}{2}', c.muted, 'l');
    cap.textContent = 'The arc (green) has length ' + len.toFixed(2) + '. Slide it along the quarter circle: A (below) and B (to the left) change, but A + B stays equal to the arc length.';
  }
  function slider(lbl, min, max, val, fn) {
    var l = D.createElement('label'); l.style.cssText = 'display:flex;gap:6px;align-items:center;flex:1 1 200px;font-size:.92em'; l.textContent = lbl;
    var r = D.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = 0.01; r.value = val; r.style.cssText = 'flex:1;min-width:100px';
    r.addEventListener('input', function () { fn(+r.value); draw(); }); l.appendChild(r); bar.appendChild(l); return r;
  }
  var sp = slider('position', 0, 0.97, start, function (v) { start = M.min(v, M.PI / 2 - len); });
  slider('length', 0.1, 1.4, len, function (v) { len = v; start = M.min(start, M.PI / 2 - len); sp.value = start; });
  api.onTheme(draw); draw();
};
