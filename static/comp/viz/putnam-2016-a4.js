/* Our own diagram for the Putnam solutions guide (not from the exam paper): a 7x7 tiling with 16 tiles, then a strip. */
(window.CompViz = window.CompViz || {})['putnam-2016-a4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330;
  // tiles as lists of [row, col]; 15 L-trominoes + 1 skew tetromino, then a 2-wide strip (2 L + 2 skew)
  var T = [
    [[0,0],[0,1],[1,1]], [[0,2],[0,3],[1,3]], [[0,4],[1,4],[1,5]], [[0,5],[0,6],[1,6]],
    [[1,0],[2,0],[2,1]], [[1,2],[2,2],[2,3]], [[2,4],[3,4],[3,5]], [[2,5],[2,6],[3,6]],
    [[3,0],[4,0],[4,1]], [[3,1],[3,2],[4,2]], [[3,3],[4,3],[4,4]], [[4,5],[4,6],[5,6]],
    [[5,0],[6,0],[6,1]], [[5,1],[5,2],[6,2]], [[5,3],[6,3],[6,4]], [[5,4],[5,5],[6,5],[6,6]],
    [[0,7],[0,8],[1,7]], [[1,8],[2,8],[2,7],[3,7]], [[3,8],[4,8],[4,7],[5,7]], [[5,8],[6,8],[6,7]]
  ];
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A 7 by 7 grid. Sixteen dots mark the cells whose row and column are both odd. Tiles are placed one at a time, each covering exactly one dot; then a two-wide strip of four more tiles extends it to 7 by 9.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var lab = D.createElement('div'); lab.style.cssText = 'position:absolute;left:66%;top:12%;font-size:clamp(11px,2.6vw,16px);line-height:1.9'; lay.appendChild(lab);
  var shown = -1;
  function draw() {
    var c = api.colors(), s = 0, cs = 34, x0 = 18, y0 = 40, i, j, k = shown;
    var cols = k >= 16 ? 9 : 7, h = '';
    h += '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    for (i = 0; i < 7; i++) for (j = 0; j < cols; j++)
      h += '<rect x="' + (x0 + j * cs) + '" y="' + (y0 + i * cs) + '" width="' + cs + '" height="' + cs + '" fill="none" stroke="' + c.grid + '"/>';
    var pal = [c.greenSoft, c.blueSoft, c.goldSoft, c.tealSoft, c.purpleSoft, c.orangeSoft];
    for (s = 0; s <= k && s < T.length; s++) {
      var t = T[s], skew = t.length === 4, fill = skew ? c.redSoft : (s >= 16 ? c.goldSoft : pal[s % 4]);
      t.forEach(function (q) {
        h += '<rect x="' + (x0 + q[1] * cs + 1.5) + '" y="' + (y0 + q[0] * cs + 1.5) + '" width="' + (cs - 3) + '" height="' + (cs - 3) + '" fill="' + fill + '" stroke="' + (skew ? c.red : s >= 16 ? c.gold : c.green) + '" stroke-width="1.5" rx="3"/>';
      });
    }
    for (i = 0; i < 7; i += 2) for (j = 0; j < cols; j += 2)
      h += '<circle cx="' + (x0 + j * cs + cs / 2) + '" cy="' + (y0 + i * cs + cs / 2) + '" r="5" fill="' + c.ink + '"/>';
    h += '<text x="' + x0 + '" y="26" fill="' + c.muted + '" font-size="14" font-family="system-ui,sans-serif">' + (cols === 9 ? '7 × 9 (m = 4, n = 5)' : '7 × 7 (m = n = 4)') + '</text>';
    svg.innerHTML = h;
    var placed = Math.max(0, Math.min(k + 1, T.length));
    lab.innerHTML = '';
    lab.appendChild(texNode('\\text{dots: } mn = ' + (cols === 9 ? 20 : 16), c.ink));
    lab.appendChild(texNode('\\text{tiles: } ' + placed, c.green));
    lab.appendChild(texNode('\\text{L: } 3 \\text{ cells, skew: } 4', c.muted));
    cap.textContent = k < 0 ? 'Each dot needs its own tile, since no tile can reach two dots. Press Step or Play.'
      : k < 15 ? 'Tile ' + placed + ': an L covering exactly one dot.'
      : k === 15 ? 'The 16th tile is the one skew piece (red). 15 × 3 + 4 = 49 cells: the 7 × 7 square needs exactly 16 tiles.'
      : k < 19 ? 'Growing: a strip two cells wide, built as an L, a staircase of skew pieces, and an L.'
      : 'The strip used 4 tiles for its 4 new dots, so 7 × 9 uses 20 = 4 × 5 tiles. Repeat to reach any size.';
  }
  function texNode(t, col) { var d = D.createElement('div'); d.style.color = col; api.tex(t, d); return d; }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    if (shown >= T.length - 1) shown = -1;
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); shown++; draw(); if (shown >= T.length - 1) stop(); }, 450);
  });
  btn('Step', function () { stop(); shown = shown >= T.length - 1 ? -1 : shown + 1; draw(); });
  btn('Reset', function () { stop(); shown = -1; draw(); });
  if (api.reduced()) shown = 15;
  api.onTheme(draw); draw();
};
