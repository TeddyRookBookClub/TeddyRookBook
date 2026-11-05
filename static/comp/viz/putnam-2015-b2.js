/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2015-b2.
   One block of 30 consecutive integers: which numbers are sums (crossed off), how the rest form triples, and their sums. */
(window.CompViz = window.CompViz || {})['putnam-2015-b2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330, J = 500;
  // run the process for real (no formulas): numbers up to 30*J
  var isSum = {}, triples = [], x = 1, lim = 30 * J;
  while (true) {
    var t = [];
    while (t.length < 3) { if (!isSum[x]) t.push(x); x++; }
    if (t[2] > lim) break;
    var s = t[0] + t[1] + t[2]; isSum[s] = 1; triples.push([t, s]);
  }
  var j = 0;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block'; svg.style.borderRadius = '8px';
  box.appendChild(svg); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', function () { f(); render(); }); bar.appendChild(b); return b; }
  btn('← Block', function () { if (j > 0) j--; });
  btn('Block →', function () { if (j < J - 2) j++; });
  btn('Block 133', function () { j = 133; });
  btn('Block 466', function () { j = 466; });
  btn('Block 0', function () { j = 0; });
  function tx(x, y, s, k, sz, w) { return '<text x="' + x + '" y="' + y + '" fill="' + k + '" font-size="' + (sz || 14) + '" text-anchor="middle" font-family="system-ui,sans-serif"' + (w ? ' font-weight="' + w + '"' : '') + '>' + s + '</text>'; }
  function render() {
    var C = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + C.panel + '"/>', i, k;
    var base = 30 * j, tri = triples.slice(9 * j, 9 * j + 9), owner = {}, fills = [C.greenSoft, C.blueSoft];
    tri.forEach(function (tr, q) { tr[0].forEach(function (v) { owner[v] = q; }); });
    s += tx(320, 24, 'Block ' + j + ': the numbers ' + (base + 1) + ' to ' + (base + 30), C.ink, 16, 600);
    var cw = 58, ch = 44, gx = 30, gy = 42, crossed = [];
    for (i = 1; i <= 30; i++) {
      var v = base + i, r = Math.floor((i - 1) / 10), col = (i - 1) % 10, X = gx + col * cw, Y = gy + r * (ch + 12);
      var sum = !!isSum[v], q = owner[v];
      if (sum) crossed.push(i);
      s += '<rect x="' + (X + 2) + '" y="' + Y + '" width="' + (cw - 4) + '" height="' + ch + '" rx="6" fill="' + (sum ? C.bg : fills[q % 2]) + '" stroke="' + (sum ? C.red : C.axis) + '" stroke-width="' + (sum ? 2 : 1) + '"/>';
      s += tx(X + cw / 2, Y + 21, v, sum ? C.red : C.ink, 14, 600) + tx(X + cw / 2, Y + 37, sum ? 'sum' : 'T' + (q + 1), sum ? C.red : C.muted, 11);
      if (sum) s += '<line x1="' + (X + 8) + '" y1="' + (Y + 15) + '" x2="' + (X + cw - 8) + '" y2="' + (Y + 15) + '" stroke="' + C.red + '" stroke-width="2"/>';
    }
    s += tx(320, 222, 'Sums of the nine triples T1–T9 (offset from 90·' + j + ' = ' + (90 * j) + ' in brackets):', C.muted, 13);
    for (k = 0; k < 9; k++) {
      var sm = tri[k][1], X2 = 30 + k * 64, gold = (sm - 90 * j === 75), hit = (sm % 10000 === 2015);
      s += '<rect x="' + (X2 + 2) + '" y="236" width="60" height="50" rx="8" fill="' + (hit ? C.goldSoft : fills[k % 2]) + '" stroke="' + (gold ? C.gold : 'none') + '" stroke-width="2.5"/>';
      s += tx(X2 + 32, 258, sm, hit ? C.gold : C.ink, 14, 600) + tx(X2 + 32, 277, '(' + (sm - 90 * j) + ')', C.muted, 13);
    }
    s += tx(320, 312, 'Crossed offsets here: ' + crossed.join(', ') + ' — their sums came from block ' + Math.floor(j / 3), C.red, 13);
    svg.innerHTML = s;
    svg.setAttribute('aria-label', 'Block ' + j + ' of 30 numbers. Crossed off as sums: offsets ' + crossed.join(', ') + '. Triple sums: ' + tri.map(function (t) { return t[1]; }).join(', ') + '.');
    var hitTxt = tri.some(function (t) { return t[1] % 10000 === 2015; }) ? ' One of these sums ends in 2015.' : '';
    cap.textContent = 'Every block loses three numbers to sums, at offsets 6, ' + (crossed[1] || '?') + ' and 27, and the other 27 numbers form nine triples. The gold-outlined triple always has offset 75.' + hitTxt;
  }
  api.onTheme(render);
  render();
};
