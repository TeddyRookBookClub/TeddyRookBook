/* Conway's Game of Life (1970): a grid of cells, each alive or dead. Each tick, a live cell with 2 or 3 live neighbors
   stays alive, a dead cell with exactly 3 comes alive, and every other cell is dead next tick. Our own drawing.
   The world is a little bigger than the view, and cells that reach its outer rim are removed (so gliders fly away). */
Gallery.piece('game-of-life', function (g) {
  var M = Math, VW = 80, VH = 50, PAD = 14, WW = VW + 2 * PAD, WH = VH + 2 * PAD, A = new Uint8Array(WW * WH), B = new Uint8Array(WW * WH);
  var STEP = 1e-7, gen = 0, rate = 10, acc = 0, cur = [40, 25], grid = true;
  var c = g.canvas({ aspect: VH / VW, max: 560, min: 220, label: 'The Game of Life grid' });
  var RLE = {
    glider: 'bo$2bo$3o!', blinker: '3o!', toad: 'b3o$3o!', rpent: 'b2o$2o$bo!',
    pulsar: '2b3o3b3o2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2$2b3o3b3o$o4bobo4bo$o4bobo4bo$o4bobo4bo2$2b3o3b3o!',
    gun: '24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!',
    lwss: 'bo2bo$o$o3bo$4o!'
  };
  var PRE = [['glider', 'Glider'], ['blinker', 'Blinker'], ['toad', 'Toad'], ['pulsar', 'Pulsar'], ['lwss', 'Spaceship'], ['gun', 'Glider gun'], ['rpent', 'R-pentomino'], ['random', 'Random soup']];
  function place(rle, x0, y0) {
    var x = x0, y = y0, n = '', i, ch;
    for (i = 0; i < rle.length; i++) {
      ch = rle[i];
      if (ch >= '0' && ch <= '9') { n += ch; continue; }
      var k = n ? +n : 1; n = '';
      if (ch === 'b') x += k; else if (ch === 'o') { while (k--) { set(x, y, 1); x++; } } else if (ch === '$') { y += k; x = x0; } else if (ch === '!') break;
    }
  }
  function size(rle) { var rows = rle.replace('!', '').split('$'), w = 0, h = 0; rows.forEach(function (r) { var m, x = 0, re = /(\d*)([bo])/g; while ((m = re.exec(r))) x += m[1] ? +m[1] : 1; w = M.max(w, x); var t = /(\d+)$/.exec(r); h += t ? +t[1] : 1; }); return [w, h]; }
  function set(x, y, v) { x += PAD; y += PAD; if (x >= 0 && y >= 0 && x < WW && y < WH) A[y * WW + x] = v; }
  function get(x, y) { return A[(y + PAD) * WW + x + PAD]; }
  function load(k) {
    A.fill(0); gen = 0;
    if (k === 'random') { var r = g.rng(Date.now() & 0xffff); for (var y = 0; y < VH; y++) for (var x = 0; x < VW; x++) if (r() < 0.28) set(x, y, 1); }
    else { var s = size(RLE[k]), ox = k === 'gun' ? 2 : M.floor((VW - s[0]) / 2), oy = k === 'gun' ? 2 : M.floor((VH - s[1]) / 2); if (k === 'glider' || k === 'lwss') { ox = 4; oy = k === 'lwss' ? 22 : 4; } place(RLE[k], ox, oy); }
    stats(); g.redraw();
  }
  function tick() {
    var x, y, i, n;
    for (y = 1; y < WH - 1; y++) for (x = 1; x < WW - 1; x++) {
      i = y * WW + x; n = A[i - WW - 1] + A[i - WW] + A[i - WW + 1] + A[i - 1] + A[i + 1] + A[i + WW - 1] + A[i + WW] + A[i + WW + 1];
      B[i] = n === 3 || (n === 2 && A[i]) ? 1 : 0;
    }
    for (x = 0; x < WW; x++) { B[x] = 0; B[(WH - 1) * WW + x] = 0; } for (y = 0; y < WH; y++) { B[y * WW] = 0; B[y * WW + WW - 1] = 0; }
    var t = A; A = B; B = t; gen++; stats();
  }
  function stats() { var p = 0; for (var y = 0; y < VH; y++) for (var x = 0; x < VW; x++) p += get(x, y); o1.innerHTML = 'Generation <b>' + g.fmt(gen) + '</b>'; o2.innerHTML = 'Live cells in view: <b>' + g.fmt(p) + '</b>'; }
  g.draw(function (col) {
    var x = c.ctx, cs = c.w / VW, ch = c.h / VH; c.clear(col.bg);
    if (grid && cs >= 6) { x.strokeStyle = col.grid; x.lineWidth = 1; x.beginPath(); for (var i = 1; i < VW; i++) { x.moveTo(M.round(i * cs) + 0.5, 0); x.lineTo(M.round(i * cs) + 0.5, c.h); } for (i = 1; i < VH; i++) { x.moveTo(0, M.round(i * ch) + 0.5); x.lineTo(c.w, M.round(i * ch) + 0.5); } x.stroke(); }
    x.fillStyle = col.green;
    for (var yy = 0; yy < VH; yy++) for (var xx = 0; xx < VW; xx++) if (get(xx, yy)) x.fillRect(xx * cs + 0.5, yy * ch + 0.5, M.max(1, cs - 1), M.max(1, ch - 1));
    if (document.activeElement === c.el) { x.strokeStyle = col.gold; x.lineWidth = 2; x.strokeRect(cur[0] * cs, cur[1] * ch, cs, ch); }
  });
  var row = g.group();
  var sel = g.select({ label: 'Pattern', parent: row, value: 'gun', options: PRE, change: function (v) { load(v); g.say('Loaded: ' + sel.options[sel.selectedIndex].text); } });
  g.button('Clear', function () { A.fill(0); gen = 0; stats(); g.redraw(); }, { parent: row });
  g.slider({ label: 'Speed', min: 1, max: 30, value: rate, parent: row, fmt: function (v) { return v + '/s'; }, input: function (v) { rate = v; } });
  g.loop(function (dt) { if (dt === STEP) { tick(); g.redraw(); return; } acc += dt * rate; var k = 0; while (acc >= 1 && k < 4) { tick(); acc -= 1; k++; } if (acc > 1) acc = 0; g.redraw(); }, { stepSize: STEP, stepText: 'Step one generation', parent: g.group() });
  var o1 = g.out(), o2 = g.out();
  var paint = 1;
  function cell(X, Y) { return [M.floor(X / (c.w / VW)), M.floor(Y / (c.h / VH))]; }
  g.drag(c.el, {
    down: function (X, Y) { var p = cell(X, Y); paint = get(p[0], p[1]) ? 0 : 1; set(p[0], p[1], paint); cur = p; stats(); g.redraw(); },
    move: function (X, Y) { var p = cell(X, Y); if (p[0] >= 0 && p[1] >= 0 && p[0] < VW && p[1] < VH) { set(p[0], p[1], paint); cur = p; stats(); g.redraw(); } }
  });
  function mv(dx, dy) { cur = [M.max(0, M.min(VW - 1, cur[0] + dx)), M.max(0, M.min(VH - 1, cur[1] + dy))]; g.redraw(); }
  g.keys(c.el, { ArrowLeft: function () { mv(-1, 0); }, ArrowRight: function () { mv(1, 0); }, ArrowUp: function () { mv(0, -1); }, ArrowDown: function () { mv(0, 1); },
    ' ': function () { set(cur[0], cur[1], get(cur[0], cur[1]) ? 0 : 1); stats(); g.redraw(); g.say(get(cur[0], cur[1]) ? 'Cell on' : 'Cell off'); }, Enter: function () { tick(); g.redraw(); } });
  c.el.addEventListener('focus', g.redraw); c.el.addEventListener('blur', g.redraw);
  c.el.setAttribute('aria-label', 'The Game of Life grid. Tap or drag to draw cells. With the keyboard: arrow keys move, Space turns a cell on or off, Enter steps.');
  c.onresize = function () { g.redraw(); };
  load('gun');
});
