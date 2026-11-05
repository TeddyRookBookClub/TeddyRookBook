/* Our own diagram for the Putnam solutions guide: peeling a flat triangulated patch layer by layer (2007 A6). */
(window.CompViz = window.CompViz || {})['putnam-2007-a6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 340, M = Math, S = 4, Q3 = M.sqrt(3) / 2;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A hexagonal patch of the triangle grid. Each step removes the rim of triangles touching the boundary. The boundary length drops from 24 to 18, 12, 6 and then 0, while the six corners that hold only two triangles always give a turning total of 6.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(0,-50%);white-space:nowrap;font-size:clamp(10px,2.3vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; if (t) api.tex(t, o.d); else o.d.innerHTML = ''; }
  }
  function r(i, j) { return M.max(M.abs(i), M.abs(j), M.abs(i + j)); }
  var tris = [], i, j;
  for (i = -S; i <= S; i++) for (j = -S; j <= S; j++) {
    var up = [[i, j], [i + 1, j], [i, j + 1]], dn = [[i + 1, j], [i, j + 1], [i + 1, j + 1]];
    [up, dn].forEach(function (t) { var m = M.max.apply(null, t.map(function (v) { return r(v[0], v[1]); })); if (m <= S) tris.push({ v: t, m: m }); });
  }
  var CX = 210, CY = 170, U = 36, q = S; // q = side of what is left
  function P(v) { return (CX + U * (v[0] + v[1] / 2)).toFixed(1) + ',' + (CY - U * Q3 * v[1]).toFixed(1); }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    tris.forEach(function (t) {
      if (t.m > q) { s += '<polygon points="' + t.v.map(P).join(' ') + '" fill="none" stroke="' + c.grid + '" stroke-width="1"/>'; return; }
      var rim = t.m === q;
      s += '<polygon points="' + t.v.map(P).join(' ') + '" fill="' + (rim ? c.gold : c.green) + '" fill-opacity="' + (rim ? 0.28 : 0.14) + '" stroke="' + c.green + '" stroke-width="1.2" stroke-linejoin="round"/>';
    });
    if (q > 0) {
      var cs = [[q, 0], [0, q], [-q, q], [-q, 0], [0, -q], [q, -q]];
      s += '<polygon points="' + cs.map(P).join(' ') + '" fill="none" stroke="' + c.ink + '" stroke-width="2.5" stroke-linejoin="round"/>';
      cs.forEach(function (v) { var p = P(v).split(','); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + c.red + '"/>'; });
    }
    svg.innerHTML = s;
    var Lb = 6 * q, F = 6 * q * q, rim = q ? 12 * q - 6 : 0;
    L('a', 420, 60, q ? 'L = ' + Lb + '\\ \\text{boundary edges}' : 'L = 0', c.ink);
    L('b', 420, 100, F + '\\ \\text{triangles left}', c.green);
    L('c', 420, 140, q ? '\\textstyle\\sum (3-t_\\kappa) = 6\\cdot 1 = 6' : '\\text{nothing left}', c.red);
    L('d', 420, 180, q ? '\\text{rim: } ' + rim + ' \\le 3L-6 = ' + (3 * Lb - 6) : '', c.gold);
    L('e', 420, 220, q > 1 ? '\\text{next } L = ' + (6 * q - 6) + ' \\le L-6' : '', c.muted);
    cap.textContent = q === S ? 'Red dots: the six corners holding only 2 triangles (turning 3 − 2 = 1). Every other boundary corner holds 3 (turning 0). The gold rim is removed next.'
      : q > 0 ? 'Peeled ' + (S - q) + (S - q === 1 ? ' layer' : ' layers') + '. The boundary is 6 edges shorter each time, so the peeling must stop.'
      : 'All 96 triangles are gone after 4 layers. With boundary length n, the solution caps the count at n².';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  btn('Peel one layer', function () { if (q > 0) q--; draw(); });
  btn('Reset', function () { q = S; draw(); });
  api.onTheme(draw); draw();
};
