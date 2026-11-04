/* Our own diagram for the Putnam solutions guide: seven points that defeat four colors (1994 A3). */
(window.CompViz = window.CompViz || {})['putnam-1994-a3'] = function (el, api) {
  var W = 640, H = 320, ARIA = 'A right isosceles triangle with seven marked points: the corners A, B, C, points P and Q on the legs, and points R and S on the long side. Dashed red segments join pairs at distance at least 2 minus root 2. Stepping through shows that four colors cannot avoid a repeated color on a dashed pair.';
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
  var e = M.SQRT2 - 1, d = 2 - M.SQRT2, step = 0;
  var PT = { C: [0, 0], A: [1, 0], B: [0, 1], P: [e, 0], Q: [0, e], R: [e, d], S: [d, e] };
  var X0 = 50, Y0 = 285, Sc = 255;
  function xy(n) { return [X0 + Sc * PT[n][0], Y0 - Sc * PT[n][1]]; }
  var STEPS = [
    'Seven points. d = 2 − √2 ≈ 0.586. Dashed segments join points at distance at least d ("far").',
    'The corners A, B, C are pairwise far, so they need three different colors.',
    'P and Q are each far from A and B, so each is color 3 or color 4. They are far from each other, so one is 3 and the other 4.',
    'Case P has color 4: R is far from A, B, C and P, which use all four colors. No color is left for R.',
    'Case Q has color 4: S is far from A, B, C and Q. Again no color is left. So some color repeats at distance ≥ d.'
  ];
  var FAR = [['A','B'],['A','C'],['B','C'],['P','A'],['P','B'],['Q','A'],['Q','B'],['P','Q'],['R','A'],['R','B'],['R','C'],['R','P'],['S','A'],['S','B'],['S','C'],['S','Q']];
  function draw() {
    var c = api.colors(), pal = [c.blue, c.orange, c.purple, c.teal], s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    s += '<path d="M' + xy('C').join(' ') + 'L' + xy('A').join(' ') + 'L' + xy('B').join(' ') + 'Z" fill="' + c.greenSoft + '" stroke="' + c.green + '" stroke-width="2"/>';
    var col = {}; if (step >= 1) { col.A = 0; col.B = 1; col.C = 2; }
    if (step === 2) { col.P = -1; col.Q = -1; }
    if (step === 3) { col.P = 3; col.Q = 2; col.R = -2; }
    if (step === 4) { col.Q = 3; col.P = 2; col.S = -2; }
    var HL = [null, ['AB','AC','BC'], ['PA','PB','QA','QB','PQ'], ['RA','RB','RC','RP'], ['SA','SB','SC','SQ']][step];
    FAR.forEach(function (pr) {
      var on = !HL || HL.indexOf(pr[0] + pr[1]) >= 0;
      var a = xy(pr[0]), b = xy(pr[1]);
      s += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + (on ? c.red : c.grid) + '" stroke-width="' + (on ? 1.6 : 1) + '" stroke-dasharray="5 4"/>';
    });
    pal.forEach(function (p, i) { s += '<rect x="' + (440 + i * 44) + '" y="180" width="16" height="16" rx="3" fill="' + p + '"/>'; });
    Object.keys(PT).forEach(function (n) {
      var p = xy(n), k = col[n], fill = k >= 0 ? pal[k] : c.panel;
      s += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="9" fill="' + fill + '" stroke="' + (k === -2 ? c.red : c.ink) + '" stroke-width="' + (k === -2 ? 3 : 1.5) + '"/>';
      if (k === -1) s += '<path d="M' + f1(p[0]) + ' ' + f1(p[1] - 9) + 'A9 9 0 0 1 ' + f1(p[0]) + ' ' + f1(p[1] + 9) + 'Z" fill="' + pal[2] + '"/><path d="M' + f1(p[0]) + ' ' + f1(p[1] + 9) + 'A9 9 0 0 1 ' + f1(p[0]) + ' ' + f1(p[1] - 9) + 'Z" fill="' + pal[3] + '"/>';
    });
    svg.innerHTML = s;
    var off = { C: [-18, 12], A: [16, 12], B: [-22, 0], P: [0, 21], Q: [-22, 0], R: [16, -12], S: [16, -12] };
    Object.keys(PT).forEach(function (n) { var p = xy(n); L('n' + n, p[0] + off[n][0], p[1] + off[n][1], n, c.ink, 'c'); });
    L('d', 360, 60, 'd = 2-\\sqrt2,\\quad e=\\sqrt2-1', c.ink, 'l');
    L('pq', 360, 100, '|PQ| = e\\sqrt2 = d', c.ink, 'l');
    L('rb', 360, 140, '|RB| = e\\sqrt2 = d,\\ |RP| = d', c.ink, 'l');
    L('k', 360, 188, '\\text{colors}', c.ink, 'l'); [1, 2, 3, 4].forEach(function (t, i) { L('k' + t, 460 + i * 44, 188, String(t), c.ink, 'l'); });
    L('st', 360, 240, '\\text{step } ' + (step + 1) + ' / 5', c.muted, 'l');
    cap.textContent = STEPS[step];
  }
  btn('Back', function () { step = M.max(0, step - 1); draw(); });
  btn('Next', function () { step = M.min(4, step + 1); draw(); });
  api.onTheme(draw); draw();
};
