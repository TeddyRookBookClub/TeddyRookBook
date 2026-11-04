/* Our own diagram for the Putnam solutions guide: a convex set meeting all four branches of xy = 1 and xy = -1 (2007 A2). */
(window.CompViz = window.CompViz || {})['putnam-2007-a2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden;touch-action:none';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'The four branches of the hyperbolas x y = 1 and x y = minus 1, one in each quadrant, with a draggable point on each branch. The quadrilateral they form is split into four triangles at the origin; each triangle has area at least 1, and the total is shown. It is smallest, 4, for the square with corners at plus or minus 1.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translateY(-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var cx = 165, cy = 165, u = 52, SG = [[1, 1], [-1, 1], [-1, -1], [1, -1]], t = [1.6, 0.7, 1.3, 0.55], drag = -1;
  function pt(i) { var a = t[i]; return [SG[i][0] * a, SG[i][1] / a]; } // point on the branch in quadrant i
  function S(p) { return [cx + u * p[0], cy - u * p[1]]; }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', i, k;
    s += '<line x1="' + (cx - 150) + '" y1="' + cy + '" x2="' + (cx + 150) + '" y2="' + cy + '" stroke="' + c.grid + '"/><line x1="' + cx + '" y1="' + (cy - 150) + '" x2="' + cx + '" y2="' + (cy + 150) + '" stroke="' + c.grid + '"/>';
    for (i = 0; i < 4; i++) {
      var d = '';
      for (k = 0; k <= 60; k++) { var a = 0.34 * M.pow(2.85 / 0.34, k / 60), q = S([SG[i][0] * a, SG[i][1] / a]); d += (k ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
      s += '<path d="' + d + '" fill="none" stroke="' + (i % 2 ? c.blue : c.purple) + '" stroke-width="2"/>';
    }
    var P = [0, 1, 2, 3].map(pt), tot = 0, cols = [c.goldSoft, c.greenSoft, c.goldSoft, c.greenSoft];
    for (i = 0; i < 4; i++) {
      var A = P[i], B = P[(i + 1) % 4], ar = M.abs(A[0] * B[1] - A[1] * B[0]) / 2, a1 = S(A), b1 = S(B);
      tot += ar;
      s += '<path d="M' + cx + ' ' + cy + 'L' + a1[0].toFixed(1) + ' ' + a1[1].toFixed(1) + 'L' + b1[0].toFixed(1) + ' ' + b1[1].toFixed(1) + 'Z" fill="' + cols[i] + '" stroke="' + c.axis + '" stroke-width="1"/>';
      var m = S([(A[0] + B[0]) / 3, (A[1] + B[1]) / 3]); L('t' + i, m[0] - 12, m[1], ar.toFixed(2), c.ink);
    }
    P.forEach(function (p) { var q = S(p); s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="9" fill="' + c.red + '" stroke="' + c.panel + '" stroke-width="2" style="cursor:grab"/>'; });
    svg.innerHTML = s;
    L('a', 360, 34, '\\text{each triangle:}', c.ink);
    L('g', 360, 62, '\\tfrac12\\left(\\tfrac ab+\\tfrac ba\\right) \\ge 1', c.ink);
    L('b', 360, 100, '\\text{total area} = ' + tot.toFixed(3), tot < 4.005 ? c.green : c.ink);
    L('c', 360, 136, '\\ge 4', c.gold);
    L('d', 360, 186, 'xy = 1', c.purple);
    L('e', 360, 220, 'xy = -1', c.blue);
    cap.textContent = tot < 4.005 ? 'Area 4: the square with corners (±1, ±1). No convex set meeting all four branches is smaller.'
      : 'Drag the red points along their branches. Each triangle from the origin has area at least 1.';
  }
  function local(ev) { var r = svg.getBoundingClientRect(); return [((ev.clientX - r.left) / r.width * W - cx) / u, -((ev.clientY - r.top) / r.height * H - cy) / u]; }
  svg.addEventListener('pointerdown', function (ev) {
    var p = local(ev), best = 1e9;
    for (var i = 0; i < 4; i++) { var q = pt(i), d = M.hypot(q[0] - p[0], q[1] - p[1]); if (d < best) { best = d; drag = i; } }
    if (best > 0.6) drag = -1; else { try { svg.setPointerCapture(ev.pointerId); } catch (e) { } }
  });
  svg.addEventListener('pointermove', function (ev) {
    if (drag < 0) return;
    var p = local(ev), x = M.abs(p[0]), y = M.abs(p[1]);
    // nearest point on the branch: blend the two coordinates' suggestions
    var a = M.sqrt(M.max(x, 0.05) / M.max(y, 0.05));
    t[drag] = M.min(2.8, M.max(0.36, a)); draw();
  });
  function end() { drag = -1; }
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  function btn(tx, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = tx; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  btn('Square', function () { t = [1, 1, 1, 1]; draw(); });
  btn('Random', function () { t = t.map(function () { return M.exp((M.random() - 0.5) * 1.8); }); draw(); });
  api.onTheme(draw); draw();
};
