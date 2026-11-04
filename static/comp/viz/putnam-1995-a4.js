/* Our own diagram for the Putnam solutions guide: the cut point of a necklace (1995 A4). */
(window.CompViz = window.CompViz || {})['putnam-1995-a4'] = function (el, api) {
  var W = 640, H = 330, ARIA = 'Two step graphs. The top one is the running total of label minus one around a random necklace, ending at minus one, with its last highest point marked. The bottom one starts just after that point and stays at or below minus one after the start.';
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
  var n = 12, x = [];
  function fresh() {
    var t; do { x = []; var s = 0; for (var i = 0; i < n - 1; i++) { var v = M.floor(M.random() * 5) - 1; x.push(v); s += v; } x.push(n - 1 - s); t = x[n - 1]; } while (t < -2 || t > 4);
  }
  function walk(arr) { var s = [0], i; for (i = 0; i < arr.length; i++) s.push(s[i] + arr[i] - 1); return s; }
  function plot(s, y0, h, c, mark, title, key) {
    var lo = M.min.apply(null, s), hi = M.max.apply(null, s), sc = h / M.max(1, hi - lo), x0 = 60, dx = 540 / n, out = '';
    function Y(v) { return y0 + (hi - v) * sc; }
    out += '<line x1="' + x0 + '" y1="' + f1(Y(0)) + '" x2="' + (x0 + 540) + '" y2="' + f1(Y(0)) + '" stroke="' + c.axis + '"/>';
    out += '<line x1="' + x0 + '" y1="' + f1(Y(-1)) + '" x2="' + (x0 + 540) + '" y2="' + f1(Y(-1)) + '" stroke="' + c.gold + '" stroke-dasharray="5 4"/>';
    var d = '';
    s.forEach(function (v, i) { d += (i ? 'L' : 'M') + f1(x0 + i * dx) + ' ' + f1(Y(v)); });
    out += '<path d="' + d + '" fill="none" stroke="' + c.blue + '" stroke-width="2"/>';
    s.forEach(function (v, i) { out += '<circle cx="' + f1(x0 + i * dx) + '" cy="' + f1(Y(v)) + '" r="' + (i === mark ? 7 : 3.5) + '" fill="' + (i === mark ? c.red : c.blue) + '"/>'; });
    L(key + 't', x0, y0 - 14, title, c.ink, 'l');
    L(key + '0', x0 - 8, Y(0), '0', c.muted, 'r'); L(key + '1', x0 - 8, Y(-1), '-1', c.gold, 'r');
    return out;
  }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    var w = walk(x), best = -1e9, j = 0, i;
    for (i = 0; i < n; i++) if (w[i] >= best) { best = w[i]; j = i; }
    s += plot(w, 45, 100, c, j, 'x_i:\\ ' + x.join(',\\,'), 'a');
    var y = x.slice(j).concat(x.slice(0, j)), w2 = walk(y);
    s += plot(w2, 210, 95, c, -1, '\\text{start at bead } ' + (j + 1) + ':\\ ' + y.join(',\\,'), 'b');
    svg.innerHTML = s;
    cap.textContent = 'Top: running total of (label − 1) for ' + n + ' beads; it ends at −1. The red dot is the last place where it is highest (among the first ' + n + ' positions). Bottom: starting the string just after that bead, every running total after the start is −1 or lower, so the first k labels sum to at most k − 1.';
  }
  btn('New necklace', function () { fresh(); draw(); });
  fresh(); api.onTheme(draw); draw();
};
