/* Ancient Festival Tycoon: pure game logic, shared by the game page and its tests. No DOM here. */
(function (root, factory) {
  var C = factory();
  if (typeof module === 'object' && module.exports) module.exports = C; else root.FestCore = C;
})(this, function () {
  'use strict';
  var N = 44;
  function idx(x, y) { return y * N + x; }

  // Stable per-tile noise: the same tile in the same save always gets the same value.
  function hash(x, y, k, seed) {
    var h = (seed | 0) ^ Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((k | 0) + 1, 1442695041);
    h = Math.imul(h ^ (h >>> 15), 2246822519); h = Math.imul(h ^ (h >>> 13), 3266489917); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  // Everything that decides how one ground tile looks. It depends only on the tile and the seed.
  function groundTile(x, y, seed, nGrass) {
    var t = { grass: Math.floor(hash(x, y, 30, seed) * (nGrass || 4)), tuft: hash(x, y, 31, seed) < 0.35, tx: hash(x, y, 32, seed), ty: hash(x, y, 33, seed), shade: (hash(x, y, 20, seed) - 0.5) * 0.08, specks: [] };
    for (var k = 0; k < 4; k++) t.specks.push([hash(x, y, k * 4, seed), hash(x, y, k * 4 + 1, seed), hash(x, y, k * 4 + 2, seed), hash(x, y, k * 4 + 3, seed)]);
    return t;
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // Rotation: 0 = entrance on the +x side, 1 = +y, 2 = -x, 3 = -y. Odd turns swap width and depth.
  function dims(size, rot) { return (rot & 1) ? [size[1], size[0]] : [size[0], size[1]]; }
  function entrance(x, y, fw, fh, rot) {
    switch (rot & 3) {
      case 0: return { x: x + fw, y: y + Math.floor(fh / 2), side: 0 };
      case 1: return { x: x + Math.floor(fw / 2), y: y + fh, side: 1 };
      case 2: return { x: x - 1, y: y + Math.floor((fh - 1) / 2), side: 2 };
      default: return { x: x + Math.floor((fw - 1) / 2), y: y - 1, side: 3 };
    }
  }
  function tiles(x, y, fw, fh) { var t = []; for (var yy = y; yy < y + fh; yy++) for (var xx = x; xx < x + fw; xx++) t.push(idx(xx, yy)); return t; }

  // Breadth-first search over walkable tiles. walk(i) says whether tile i can be walked on.
  function bfs(from, walk) {
    var dist = new Int16Array(N * N).fill(-1), prev = new Int32Array(N * N).fill(-1), q = [from], h = 0;
    dist[from] = 0;
    while (h < q.length) {
      var c = q[h++], cx = c % N, cy = (c / N) | 0;
      for (var k = 0; k < 4; k++) {
        var nx = cx + (k === 0) - (k === 1), ny = cy + (k === 2) - (k === 3);
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        var n = idx(nx, ny);
        if (dist[n] >= 0 || !walk(n)) continue;
        dist[n] = dist[c] + 1; prev[n] = c; q.push(n);
      }
    }
    return { dist: dist, prev: prev };
  }
  function route(b, to) { var p = []; for (var c = to; c !== -1; c = b.prev[c]) p.unshift(c); p.shift(); return p; }

  // Money
  function fmt(n) { n = Math.round(n); var s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (n < 0 ? '−' : '') + s; }
  var INC = ['fees', 'sales', 'refund', 'reward'], OUT = ['build', 'upkeep', 'wages', 'land', 'tax'];
  function newDay() { var d = {}; INC.concat(OUT).forEach(function (k) { d[k] = 0; }); return d; }
  function newLedger() { return { today: newDay(), hist: [] }; }
  // book(): positive amounts for income categories, positive amounts for spending categories; returns the coin change.
  function book(L, cat, amt) {
    if (!L.today[cat] && L.today[cat] !== 0) L.today[cat] = 0;
    L.today[cat] += amt;
    return INC.indexOf(cat) >= 0 ? amt : -amt;
  }
  function totals(d) { var i = 0, o = 0; INC.forEach(function (k) { i += d[k] || 0; }); OUT.forEach(function (k) { o += d[k] || 0; }); return { inc: i, out: o, net: i - o }; }
  function closeDay(L, extra) {
    var t = totals(L.today), rec = { inc: t.inc, out: t.out, d: L.today };
    if (extra) for (var k in extra) rec[k] = extra[k];
    L.hist.push(rec); if (L.hist.length > 30) L.hist.shift();
    L.today = newDay(); return rec;
  }

  // Calendar: one game day is one month, twelve days make a year.
  function calendar(day, m0) {
    var n = (m0 || 0) + day - 1;
    return { month: ((n % 12) + 12) % 12, year: Math.floor(n / 12) + 1 };
  }
  function festsOn(list, day, m0) {
    var c = calendar(day, m0);
    return list.filter(function (f) { return f.m === c.month && (f.every ? c.year % f.every === (f.at || 0) : true); });
  }

  // Saves. defs: building sizes ({type: {size:[w,h], kind}}). opts.seed: a seed for saves that have none.
  function entranceOK(o, defs, paths) {
    var d = defs[o.type], dm = dims(d.size, o.rot || 0), e = entrance(o.x, o.y, dm[0], dm[1], o.rot || 0);
    return e.x >= 0 && e.y >= 0 && e.x < N && e.y < N && paths.indexOf(idx(e.x, e.y)) >= 0;
  }
  function migrate(o, defs, opts) {
    if (!o || typeof o !== 'object' || !Array.isArray(o.objects)) return null;
    opts = opts || {};
    if (!Array.isArray(o.paths)) o.paths = [];
    if (!o.v) { // the old 28-tile map: move it onto the middle plot of the bigger one
      o.paths = o.paths.map(function (i) { return ((i / 28 | 0) + 16) * N + (i % 28) + 8; });
      o.objects.forEach(function (q) { q.x += 8; q.y += 16; });
      var r = mulberry(21);
      for (var i = 0; i < 45; i++) { var tx = Math.floor(r() * N), ty = Math.floor(r() * N); if (tx < 8 || tx > 35 || ty < 16) o.objects.push({ type: r() < 0.6 ? 'olive' : 'cypress', x: tx, y: ty, seed: Math.floor(r() * 1000), wild: 1 }); }
      o.v = 2; o.land = 0; o.rank = 1;
    }
    if (o.v < 3) {
      if (o.seed == null) o.seed = opts.seed != null ? opts.seed : 1;
      o.objects = o.objects.filter(function (q) { return defs[q.type]; });
      o.objects.forEach(function (q) {
        if (q.rot != null) return;
        q.rot = 0;
        var d = defs[q.type];
        if (q.wild || !d || d.kind === 'decor') return;
        // Older buildings could use a path on any side. Keep them working: use the first turn
        // (same footprint) whose entrance touches a path, or the default turn if none does.
        var sq = d.size[0] === d.size[1], tries = sq ? [0, 1, 2, 3] : [0, 2];
        for (var t = 0; t < tries.length; t++) { q.rot = tries[t]; if (entranceOK(q, defs, o.paths)) return; }
        q.rot = 0;
      });
      if (!o.ledger) o.ledger = newLedger();
      if (o.m0 == null) o.m0 = o.setting === 'rome' ? 1 : 9;
      if (!o.staff) o.staff = [];
      if (!o.litter) o.litter = [];
      o.v = 3;
    }
    return o;
  }

  return { N: N, idx: idx, hash: hash, groundTile: groundTile, mulberry: mulberry, dims: dims, entrance: entrance, tiles: tiles, bfs: bfs, route: route,
    fmt: fmt, INC: INC, OUT: OUT, newDay: newDay, newLedger: newLedger, book: book, totals: totals, closeDay: closeDay,
    calendar: calendar, festsOn: festsOn, entranceOK: entranceOK, migrate: migrate };
});
