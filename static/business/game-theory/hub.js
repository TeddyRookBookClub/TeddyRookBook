/* Game Theory course: the shared kit (window.GT) and the hub page's hero.

   The kit is loaded by the hub and by the chapter pages, before each chapter's sim.js. In node it is a module
   (require('hub.js') returns GT) so the game math can be unit-tested.

   A game in normal form with two players (Osborne's notation: players 1 and 2, actions, payoff functions u1, u2):
     g = { rows: ['Quiet','Fink'], cols: ['Quiet','Fink'], A: [[2,0],[3,1]], B: [[2,3],[0,1]], p1: 'Row', p2: 'Column' }
   A[i][j] = u1(row i, column j), B[i][j] = u2(row i, column j). Row player's payoff is always written first.

   Math:   GT.br1(g,j,alive) GT.br2(g,i,alive)  best responses (B1, B2) to a pure action, as index lists
           GT.pureNE(g)                          all pure-strategy Nash equilibria [[i,j],…]
           GT.dominates(g,pl,a,b,alive,weak)     does action a dominate action b for player pl (1 or 2)?
           GT.dominatedAll(g,alive,weak)         every dominated action now: [{pl, idx, by}]
           GT.iesds(g)                           iterated elimination of strictly dominated actions (pure dominators)
           GT.mixed2x2(g)                        all Nash equilibria of a 2×2 game, pure and mixed: [{p, q}] with
                                                 p = P(row 0), q = P(column 0); plus .seg for continua
           GT.maximin2(A)                        value and optimal mix for the row player of a 2×n zero-sum game
           GT.rng(seed)                          a seeded random number generator (mulberry32)
   Look:   GT.matrixHTML(g, o)                   the course's payoff-matrix markup (the same markup the lesson pages use)
           GT.drawMatrix(c, box, g, o)           the same matrix drawn on a dark canvas; returns hit-test geometry
           GT.draw.{arrow,label,rrect,bg,panel}  canvas helpers in the house style; GT.C the palette             */
(function (root) {
  'use strict';
  var GT = {};
  var EPS = 1e-9;

  /* ---------- small math helpers ---------- */
  GT.rng = function (seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  GT.range = function (n) { var r = []; for (var i = 0; i < n; i++) r.push(i); return r; };
  function aliveOf(g, alive) { return alive || { rows: GT.range(g.rows.length), cols: GT.range(g.cols.length) }; }
  GT.aliveOf = aliveOf;

  /* best responses of player 1 to column j, and of player 2 to row i, among the actions still alive */
  GT.br1 = function (g, j, alive) {
    var al = aliveOf(g, alive), best = -Infinity, out = [];
    al.rows.forEach(function (i) { if (g.A[i][j] > best + EPS) { best = g.A[i][j]; out = [i]; } else if (Math.abs(g.A[i][j] - best) <= EPS) out.push(i); });
    return out;
  };
  GT.br2 = function (g, i, alive) {
    var al = aliveOf(g, alive), best = -Infinity, out = [];
    al.cols.forEach(function (j) { if (g.B[i][j] > best + EPS) { best = g.B[i][j]; out = [j]; } else if (Math.abs(g.B[i][j] - best) <= EPS) out.push(j); });
    return out;
  };
  /* all pure-strategy Nash equilibria: cells where each action is a best response to the other */
  GT.pureNE = function (g, alive) {
    var al = aliveOf(g, alive), out = [];
    al.rows.forEach(function (i) { al.cols.forEach(function (j) {
      if (GT.br1(g, j, al).indexOf(i) >= 0 && GT.br2(g, i, al).indexOf(j) >= 0) out.push([i, j]);
    }); });
    return out;
  };
  GT.isNE = function (g, i, j) { return GT.pureNE(g).some(function (e) { return e[0] === i && e[1] === j; }); };
  /* the gain from the best unilateral deviation at a cell (0 at a Nash equilibrium) */
  GT.deviationGain = function (g, i, j) {
    var b1 = GT.br1(g, j)[0], b2 = GT.br2(g, i)[0];
    return { d1: g.A[b1][j] - g.A[i][j], to1: b1, d2: g.B[i][b2] - g.B[i][j], to2: b2 };
  };

  /* dominance: does action a dominate action b for player pl, against the opponent's actions still alive?
     strict: better against every opponent action. weak: never worse, and better against at least one. */
  GT.dominates = function (g, pl, a, b, alive, weak) {
    var al = aliveOf(g, alive), opp = pl === 1 ? al.cols : al.rows, strictSome = false;
    if (a === b) return false;
    for (var k = 0; k < opp.length; k++) {
      var o = opp[k], ua = pl === 1 ? g.A[a][o] : g.B[o][a], ub = pl === 1 ? g.A[b][o] : g.B[o][b];
      if (weak) { if (ua < ub - EPS) return false; if (ua > ub + EPS) strictSome = true; }
      else if (!(ua > ub + EPS)) return false;
    }
    return weak ? strictSome : opp.length > 0;
  };
  /* which actions are dominated right now, and by which action (the first one found) */
  GT.dominatedAll = function (g, alive, weak) {
    var al = aliveOf(g, alive), out = [];
    [1, 2].forEach(function (pl) {
      var own = pl === 1 ? al.rows : al.cols;
      own.forEach(function (b) {
        for (var k = 0; k < own.length; k++) if (GT.dominates(g, pl, own[k], b, al, weak)) { out.push({ pl: pl, idx: b, by: own[k] }); return; }
      });
    });
    return out;
  };
  /* iterated elimination of strictly dominated actions (by pure actions), one action per step.
     For strict dominance the order does not change what survives. */
  GT.iesds = function (g, weak) {
    var al = { rows: GT.range(g.rows.length), cols: GT.range(g.cols.length) }, steps = [], guard = 0;
    while (guard++ < 100) {
      var d = GT.dominatedAll(g, al, weak);
      if (!d.length) break;
      var s = d[0]; steps.push({ pl: s.pl, idx: s.idx, by: s.by });
      if (s.pl === 1) al.rows = al.rows.filter(function (r) { return r !== s.idx; }); else al.cols = al.cols.filter(function (c) { return c !== s.idx; });
    }
    return { steps: steps, alive: al, solved: al.rows.length === 1 && al.cols.length === 1 };
  };

  /* expected payoff of a matrix M when row mixes x (vector) and column mixes y (vector) */
  GT.expected = function (M, x, y) {
    var s = 0; for (var i = 0; i < x.length; i++) for (var j = 0; j < y.length; j++) s += x[i] * y[j] * M[i][j]; return s;
  };

  /* every Nash equilibrium of a 2×2 game. p = probability that player 1 plays row 0, q = probability player 2 plays column 0.
     d1(q) = u1(row0,q) − u1(row1,q) is linear in q; player 1's best response is p=1 if d1>0, p=0 if d1<0, any p if d1=0.
     Likewise d2(p) = u2(p,col0) − u2(p,col1). Equilibria are where the two best-response correspondences cross. */
  GT.d1 = function (g, q) { return q * (g.A[0][0] - g.A[1][0]) + (1 - q) * (g.A[0][1] - g.A[1][1]); };
  GT.d2 = function (g, p) { return p * (g.B[0][0] - g.B[0][1]) + (1 - p) * (g.B[1][0] - g.B[1][1]); };
  function root01(f0, f1) { // root of the linear function with values f0 at 0 and f1 at 1, if strictly inside (0,1)
    if (Math.abs(f1 - f0) < EPS) return null; var t = f0 / (f0 - f1); return t > EPS && t < 1 - EPS ? t : null;
  }
  GT.mixed2x2 = function (g) {
    var out = [], seg = [];
    function inBR1(p, q) { var d = GT.d1(g, q); return d > EPS ? Math.abs(p - 1) < EPS : d < -EPS ? Math.abs(p) < EPS : true; }
    function inBR2(p, q) { var d = GT.d2(g, p); return d > EPS ? Math.abs(q - 1) < EPS : d < -EPS ? Math.abs(q) < EPS : true; }
    function add(p, q) { if (inBR1(p, q) && inBR2(p, q) && !out.some(function (e) { return Math.abs(e.p - p) < 1e-7 && Math.abs(e.q - q) < 1e-7; })) out.push({ p: p, q: q }); }
    [1, 0].forEach(function (p) { [1, 0].forEach(function (q) { add(p, q); }); });
    var qs = root01(GT.d1(g, 0), GT.d1(g, 1)), ps = root01(GT.d2(g, 0), GT.d2(g, 1));
    if (qs !== null && ps !== null) add(ps, qs);
    // degenerate cases: a player indifferent everywhere, or indifferent at a pure action of the other: report continua
    var d1const = Math.abs(GT.d1(g, 0)) < EPS && Math.abs(GT.d1(g, 1)) < EPS, d2const = Math.abs(GT.d2(g, 0)) < EPS && Math.abs(GT.d2(g, 1)) < EPS;
    [0, 1].forEach(function (p) { if (Math.abs(GT.d2(g, p)) < EPS) { // player 2 indifferent at pure p: q in the set where p is a best response
      var a = null, b = null; for (var k = 0; k <= 200; k++) { var q = k / 200; if (inBR1(p, q)) { if (a === null) a = q; b = q; } }
      if (a !== null && b - a > EPS) seg.push({ p0: p, p1: p, q0: a, q1: b });
    } });
    [0, 1].forEach(function (q) { if (Math.abs(GT.d1(g, q)) < EPS) {
      var a = null, b = null; for (var k = 0; k <= 200; k++) { var p = k / 200; if (inBR2(p, q)) { if (a === null) a = p; b = p; } }
      if (a !== null && b - a > EPS) seg.push({ p0: a, p1: b, q0: q, q1: q });
    } });
    if (qs !== null && Math.abs(GT.d2(g, 0)) < EPS && Math.abs(GT.d2(g, 1)) < EPS) seg.push({ p0: 0, p1: 1, q0: qs, q1: qs });
    if (ps !== null && d1const) seg.push({ p0: ps, p1: ps, q0: 0, q1: 1 });
    out.seg = seg; out.degenerate = d1const || d2const || seg.length > 0;
    return out;
  };

  /* a 2×n zero-sum game, A = row player's payoffs (the column player gets −A, or "1 − A" for probabilities).
     The row player picks p = P(row 0) to maximize the worst case min_j [p A0j + (1−p) A1j]. */
  GT.maximin2 = function (A) {
    var n = A[0].length, cand = [0, 1];
    for (var j = 0; j < n; j++) for (var k = j + 1; k < n; k++) {
      // where the lines for columns j and k cross: p(A0j − A1j) + A1j = p(A0k − A1k) + A1k
      var den = (A[0][j] - A[1][j]) - (A[0][k] - A[1][k]);
      if (Math.abs(den) > EPS) { var p = (A[1][k] - A[1][j]) / den; if (p > 0 && p < 1) cand.push(p); }
    }
    var best = { p: 0, v: -Infinity };
    cand.forEach(function (p) {
      var m = Infinity; for (var j = 0; j < n; j++) m = Math.min(m, p * A[0][j] + (1 - p) * A[1][j]);
      if (m > best.v + EPS) best = { p: p, v: m };
    });
    return best;
  };

  /* fractions for display: 0.6666 → "2/3" when a small denominator fits */
  GT.frac = function (x, maxDen) {
    maxDen = maxDen || 12; if (!isFinite(x)) return '—';
    for (var d = 1; d <= maxDen; d++) { var n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) return d === 1 ? String(n).replace('-', '−') : (n < 0 ? '−' : '') + Math.abs(n) + '/' + d; }
    return null;
  };
  GT.num = function (v, d) { // payoffs: integers plain, otherwise up to d decimals, real minus sign
    if (!isFinite(v)) return '—'; var s = Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.abs(Math.round(v))) : Math.abs(v).toFixed(d === undefined ? 1 : d).replace(/\.?0+$/, '');
    return (v < -1e-9 && s !== '0' ? '−' : '') + s;
  };

  /* ---------- the payoff-matrix markup (HTML) ----------
     o: { id, label (aria), cap (caption HTML), ne: true | [[i,j]], br: true (underline best responses),
          x: {rows:[i], cols:[j]} crossed-out actions, hi: [i,j] highlighted cell, cls: extra class } */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  GT.matrixHTML = function (g, o) {
    o = o || {};
    var ne = o.ne === true ? GT.pureNE(g) : (o.ne || []), x = o.x || { rows: [], cols: [] };
    var isNE = function (i, j) { return ne.some(function (e) { return e[0] === i && e[1] === j; }); };
    var p1 = g.p1 || 'Player 1', p2 = g.p2 || 'Player 2', nc = g.cols.length;
    var label = o.label || ('Payoff matrix. ' + p1 + ' chooses a row, ' + p2 + ' chooses a column. In each cell, ' + p1 + '’s payoff is first.');
    var h = '<figure class="gth-mx' + (o.cls ? ' ' + o.cls : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + '>';
    h += '<div class="gth-mx-w"><table aria-label="' + esc(label) + '">';
    h += '<thead><tr><td class="gth-mx-c"></td><th class="gth-p2" colspan="' + nc + '" scope="colgroup">' + esc(p2) + '</th></tr>';
    h += '<tr><th class="gth-p1" scope="col">' + esc(p1) + '</th>';
    g.cols.forEach(function (c, j) { h += '<th scope="col"' + (x.cols.indexOf(j) >= 0 ? ' class="gth-x"' : '') + '>' + esc(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    g.rows.forEach(function (r, i) {
      h += '<tr' + (x.rows.indexOf(i) >= 0 ? ' class="gth-x"' : '') + '><th scope="row">' + esc(r) + '</th>';
      g.cols.forEach(function (c, j) {
        var b1 = o.br && GT.br1(g, j).indexOf(i) >= 0, b2 = o.br && GT.br2(g, i).indexOf(j) >= 0;
        var cls = []; if (isNE(i, j)) cls.push('gth-ne'); if (x.cols.indexOf(j) >= 0) cls.push('gth-x'); if (o.hi && o.hi[0] === i && o.hi[1] === j) cls.push('gth-hi');
        h += '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '><span class="gth-u1' + (b1 ? ' gth-br' : '') + '">' + GT.num(g.A[i][j], 2) + '</span>, <span class="gth-u2' + (b2 ? ' gth-br' : '') + '">' + GT.num(g.B[i][j], 2) + '</span></td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    if (o.cap) h += '<figcaption>' + o.cap + '</figcaption>';
    return h + '</figure>';
  };

  /* ---------- canvas drawing in the house style ---------- */
  GT.C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', ink: '#dbe7ef', muted: '#8fb3c6',
    line: 'rgba(120,170,200,.25)', panel: 'rgba(11,27,39,.9)', p1: '#ffd479', p2: '#74c0fc', ne: '#63e6be', sim: '#06111a' };
  var FONT = 'system-ui,-apple-system,"Segoe UI",sans-serif';
  GT.FONT = FONT;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  GT.clamp = clamp;
  var draw = GT.draw = {};
  draw.rrect = function (c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  draw.bg = function (c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  draw.label = function (c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = (o.bold ? '600 ' : o.weight ? o.weight + ' ' : '') + (o.size || 12) + 'px ' + (o.mono ? 'ui-monospace,Menlo,Consolas,monospace' : o.serif ? 'Georgia,serif' : FONT);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.alpha !== undefined) c.globalAlpha = o.alpha;
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); var w = c.measureText(text).width; c.restore(); return w;
  };
  draw.arrow = function (c, x, y, dx, dy, col, o) {
    o = o || {};
    var len = Math.hypot(dx, dy); if (len < 2) return;
    var ux = dx / len, uy = dy / len, hw = o.head || clamp(3 + len * 0.16, 4, 9), lw = o.width || 2.5;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.glow) { c.shadowColor = col; c.shadowBlur = 9; }
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx - ux * hw * 1.3, y + dy - uy * hw * 1.3); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x + dx, y + dy);
    c.lineTo(x + dx - ux * hw * 1.9 - uy * hw * 0.85, y + dy - uy * hw * 1.9 + ux * hw * 0.85);
    c.lineTo(x + dx - ux * hw * 1.9 + uy * hw * 0.85, y + dy - uy * hw * 1.9 - ux * hw * 0.85);
    c.closePath(); c.fill(); c.restore();
  };
  /* wrapped text; returns the number of lines drawn. Words in **double stars** are drawn in col2 (bold). */
  draw.wrap = function (c, text, x, y, maxW, lineH, col, o) {
    o = o || {}; var size = o.size || 13, words = String(text).split(' '), lines = [], cur = '';
    c.save(); c.font = (o.bold ? '600 ' : '') + size + 'px ' + FONT;
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (c.measureText(t.replace(/\*\*/g, '')).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); if (o.max && lines.length > o.max) { lines = lines.slice(0, o.max); lines[o.max - 1] += '…'; }
    c.textBaseline = 'middle'; c.textAlign = 'left';
    var hot = false;
    lines.forEach(function (ln, k) {
      var xx = x, yy = y + k * lineH, parts = ln.split('**');
      if (o.align === 'center') { xx = x + (maxW - c.measureText(ln.replace(/\*\*/g, '')).width) / 2; }
      parts.forEach(function (pt, pi) {
        if (pi > 0) hot = !hot;
        c.font = (hot || o.bold ? '700 ' : '') + size + 'px ' + FONT; c.fillStyle = hot ? (o.col2 || '#fff') : col; c.fillText(pt, xx, yy); xx += c.measureText(pt).width;
      });
    });
    c.restore(); return lines.length;
  };
  draw.panel = function (c, x, y, w, h, title) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; draw.rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) draw.label(c, title, x + 10, y + 13, GT.C.muted, { size: 10.5, bold: true });
  };

  /* The payoff matrix on a canvas. box = {x, y, w, h}. o (all optional):
       u1, u2: functions (i,j) → true to underline that payoff (marked best responses)
       ne: [[i,j]] cells to glow green; hi: [i,j] a highlighted cell; sel: [i,j] keyboard cursor
       dead: {rows:{i: t}, cols:{j: t}} crossed-out actions, t from 0 to 1 animates the strike
       rowHi / colHi: index of a highlighted row or column; flash: {i,j,col,t}; size: font size
       cellFill(i,j) → color or null; names: false to hide player names
     Returns geometry: {cell(i,j) → {x,y,w,h}, row(i) → rect of the header, col(j) → rect, hit(x,y) → {i,j,half} | {row} | {col} | null} */
  GT.drawMatrix = function (c, box, g, o) {
    o = o || {};
    var C = GT.C, nr = g.rows.length, nc = g.cols.length, names = o.names !== false;
    var top = names ? 22 : 0, headH = o.headH || clamp(box.h * 0.1, 24, 34), headW = o.headW || clamp(box.w * 0.18, 54, 118);
    var cw = (box.w - headW) / nc, ch = (box.h - top - headH) / nr;
    var x0 = box.x + headW, y0 = box.y + top + headH;
    var fs = o.size || clamp(Math.min(cw / 4.4, ch / 2.3), 12, 26);
    function cell(i, j) { return { x: x0 + j * cw, y: y0 + i * ch, w: cw, h: ch }; }
    var G = { cell: cell, row: function (i) { return { x: box.x, y: y0 + i * ch, w: headW, h: ch }; }, col: function (j) { return { x: x0 + j * cw, y: box.y + top, w: cw, h: headH }; }, x0: x0, y0: y0, cw: cw, ch: ch, fs: fs };
    var deadR = (o.dead && o.dead.rows) || {}, deadC = (o.dead && o.dead.cols) || {};
    function fitSize(t, size, maxW) { c.save(); while (size > 9) { c.font = '600 ' + size + 'px ' + FONT; if (c.measureText(t).width <= maxW) break; size -= 0.5; } c.restore(); return size; }
    // player names
    if (names) {
      draw.label(c, g.p2 || 'Player 2', x0 + (box.w - headW) / 2, box.y + 9, C.p2, { size: 12, bold: true, align: 'center' });
      draw.label(c, g.p1 || 'Player 1', box.x + 4, box.y + top + headH / 2, C.p1, { size: 12, bold: true });
    }
    // header cells
    for (var j = 0; j < nc; j++) {
      var hc = G.col(j), dj = deadC[j] || 0;
      if (o.colHi === j) { c.fillStyle = 'rgba(116,192,252,.14)'; draw.rrect(c, hc.x + 2, hc.y + 2, hc.w - 4, hc.h - 4, 6); c.fill(); }
      draw.label(c, g.cols[j], hc.x + hc.w / 2, hc.y + hc.h / 2, C.p2, { size: fitSize(g.cols[j], clamp(fs * 0.62, 11, 15), hc.w - 8), bold: true, align: 'center', alpha: 1 - 0.6 * dj });
    }
    for (var i = 0; i < nr; i++) {
      var hr = G.row(i), di = deadR[i] || 0;
      if (o.rowHi === i) { c.fillStyle = 'rgba(255,212,121,.13)'; draw.rrect(c, hr.x + 2, hr.y + 2, hr.w - 4, hr.h - 4, 6); c.fill(); }
      draw.label(c, g.rows[i], hr.x + hr.w - 10, hr.y + hr.h / 2, C.p1, { size: fitSize(g.rows[i], clamp(fs * 0.62, 11, 15), hr.w - 14), bold: true, align: 'right', alpha: 1 - 0.6 * di });
    }
    // cells
    var ne = o.ne || [];
    for (i = 0; i < nr; i++) for (j = 0; j < nc; j++) {
      var r = cell(i, j), dead = Math.max(deadR[i] || 0, deadC[j] || 0), isNe = ne.some(function (e) { return e[0] === i && e[1] === j; });
      c.fillStyle = (o.cellFill && o.cellFill(i, j)) || ((i + j) % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.06)');
      draw.rrect(c, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 8); c.fill();
      if (o.rowHi === i || o.colHi === j) { c.fillStyle = o.rowHi === i ? 'rgba(255,212,121,.07)' : 'rgba(116,192,252,.08)'; c.fill(); }
      if (isNe) { c.save(); c.strokeStyle = C.ne; c.lineWidth = 2.5; c.shadowColor = C.ne; c.shadowBlur = 12; draw.rrect(c, r.x + 3, r.y + 3, r.w - 6, r.h - 6, 8); c.stroke(); c.restore(); }
      if (o.hi && o.hi[0] === i && o.hi[1] === j) { c.save(); c.strokeStyle = '#fff'; c.lineWidth = 2; draw.rrect(c, r.x + 3, r.y + 3, r.w - 6, r.h - 6, 8); c.stroke(); c.restore(); }
      if (o.sel && o.sel[0] === i && o.sel[1] === j) { c.save(); c.strokeStyle = C.pink; c.lineWidth = 2; c.setLineDash([5, 4]); draw.rrect(c, r.x + 5, r.y + 5, r.w - 10, r.h - 10, 7); c.stroke(); c.restore(); }
      if (o.flash && o.flash.i === i && o.flash.j === j && o.flash.t > 0) { c.save(); c.globalAlpha = o.flash.t; c.fillStyle = o.flash.col || C.red; draw.rrect(c, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 8); c.fill(); c.restore(); }
      var alpha = 1 - 0.72 * dead, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      var s1 = GT.num(g.A[i][j], 1), s2 = GT.num(g.B[i][j], 1);
      c.save(); c.font = '700 ' + fs + 'px ' + FONT; var w1 = c.measureText(s1).width, w2 = c.measureText(s2).width, wc = c.measureText(', ').width; c.restore();
      var tot = w1 + wc + w2, xa = cx - tot / 2;
      draw.label(c, s1, xa, cy, C.p1, { size: fs, weight: 700, alpha: alpha, plain: true });
      draw.label(c, ',', xa + w1 + 1, cy, C.muted, { size: fs, alpha: alpha, plain: true });
      draw.label(c, s2, xa + w1 + wc, cy, C.p2, { size: fs, weight: 700, alpha: alpha, plain: true });
      var ul = function (x, w, col) { c.save(); c.globalAlpha = alpha; c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 2, cy + fs * 0.62); c.lineTo(x + w + 2, cy + fs * 0.62); c.stroke(); c.restore(); };
      if (o.u1 && o.u1(i, j)) ul(xa, w1, C.p1);
      if (o.u2 && o.u2(i, j)) ul(xa + w1 + wc, w2, C.p2);
      G['t' + i + '_' + j] = { x1: xa, w1: w1, x2: xa + w1 + wc, w2: w2, cy: cy };
    }
    // strikes for crossed-out actions
    Object.keys(deadR).forEach(function (k) { var t = deadR[k]; if (t <= 0) return; var a = G.row(+k), b = cell(+k, nc - 1); c.save(); c.strokeStyle = C.red; c.lineWidth = 3; c.lineCap = 'round'; c.globalAlpha = 0.9; c.beginPath(); var yy = a.y + a.h / 2; c.moveTo(a.x + 6, yy); c.lineTo(a.x + 6 + (b.x + b.w - 6 - a.x - 6) * Math.min(1, t), yy); c.stroke(); c.restore(); });
    Object.keys(deadC).forEach(function (k) { var t = deadC[k]; if (t <= 0) return; var a = G.col(+k), b = cell(nr - 1, +k); c.save(); c.strokeStyle = C.red; c.lineWidth = 3; c.lineCap = 'round'; c.globalAlpha = 0.9; c.beginPath(); var xx = a.x + a.w / 2; c.moveTo(xx, a.y + 4); c.lineTo(xx, a.y + 4 + (b.y + b.h - 4 - a.y - 4) * Math.min(1, t)); c.stroke(); c.restore(); });
    G.hit = function (x, y) {
      if (x >= x0 && x <= x0 + nc * cw && y >= y0 && y <= y0 + nr * ch) { var jj = Math.floor((x - x0) / cw), ii = Math.floor((y - y0) / ch); return { i: ii, j: jj, half: (x - (x0 + jj * cw)) < cw / 2 ? 1 : 2 }; }
      if (x >= box.x && x < x0 && y >= y0 && y <= y0 + nr * ch) return { row: Math.floor((y - y0) / ch) };
      if (y >= box.y + top && y < y0 && x >= x0 && x <= x0 + nc * cw) return { col: Math.floor((x - x0) / cw) };
      return null;
    };
    return G;
  };

  /* the header width a matrix needs for its row labels (canvas c), between lo and hi */
  GT.headW = function (c, g, lo, hi) {
    c.save(); c.font = '600 14px ' + FONT; var w = 0; g.rows.forEach(function (r) { w = Math.max(w, c.measureText(r).width); }); w = Math.max(w, c.measureText(g.p1 || 'Player 1').width * 0.86); c.restore();
    return clamp(w + 22, lo, hi);
  };
  /* lab-seg helper: mark the pressed button */
  GT.seg = function (groupEl, attr, val) { if (!groupEl) return; groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); };

  if (typeof module === 'object' && module.exports) module.exports = GT;
  if (typeof window !== 'undefined') window.GT = GT;
})(typeof window !== 'undefined' ? window : this);

/* =====================================================================================
   THE HUB HERO: a spatial prisoner's dilemma after Nowak and May (Nature, 1992).
   Each square is a player who either cooperates (C) or defects (D). Every round each player plays the prisoner's
   dilemma with its eight neighbors and itself, scoring R = 1 for mutual cooperation, T = b for defecting against a
   cooperator, and S = P = 0 otherwise. Then every player copies the strategy of the highest scorer in its
   neighborhood (itself included). Colors: blue stayed C, red stayed D, green just switched to C, gold just switched to D.
   ===================================================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var LAB = window.TRBLab, root = document.getElementById('gth-lab'), cv = document.getElementById('gth-cv');
  if (!root || !LAB || !cv) return;
  function $(id) { return document.getElementById(id); }
  var K = LAB.canvas(cv), c = K.c, reduced = LAB.reduced;
  var S = { b: 1.85, n: 0, m: 0, cell: 8, cur: null, prev: null, score: null, gen: 0, paused: false, acc: 0, rate: 7, preset: 'kaleido', hover: -1, painting: null };
  var bIn = $('gth-b'), bOut = $('gth-b-o'), stat = $('gth-stat'), pauseB = $('gth-pause'), presets = $('gth-pre');
  var COL = { cc: '#3f7fd6', dd: '#e5484d', dc: '#2fbf8f', cd: '#f2b938' };
  function size() {
    K.fit();
    var cell = K.w < 520 ? 7 : 8, n = Math.max(20, Math.floor(K.w / cell)), m = Math.max(16, Math.floor(K.h / cell));
    if (n % 2 === 0) n--; if (m % 2 === 0) m--; // odd, so a single defector sits in the exact middle
    return { n: n, m: m, cell: Math.min(K.w / n, K.h / m) };
  }
  function seed(kind) {
    var z = size(); S.n = z.n; S.m = z.m; S.cell = z.cell; S.gen = 0; S.preset = kind;
    S.cur = new Uint8Array(S.n * S.m); S.prev = new Uint8Array(S.n * S.m); S.score = new Float32Array(S.n * S.m);
    var r = window.GT.rng(20261015 + Math.floor(Math.random() * 1e6));
    if (kind === 'kaleido') { S.cur.fill(1); S.cur[((S.m - 1) / 2) * S.n + (S.n - 1) / 2] = 0; }
    else if (kind === 'random') { for (var k = 0; k < S.cur.length; k++) S.cur[k] = r() < 0.9 ? 1 : 0; }
    else if (kind === 'islands') { S.cur.fill(0); for (var q = 0; q < 6; q++) { var cx = Math.floor(r() * S.n), cy = Math.floor(r() * S.m); for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) S.cur[((cy + dy + S.m) % S.m) * S.n + (cx + dx + S.n) % S.n] = 1; } }
    S.prev.set(S.cur);
  }
  // one synchronous round on a torus (wraps around at the edges)
  function step() {
    var n = S.n, m = S.m, cur = S.cur, sc = S.score, b = S.b, x, y, dx, dy, k;
    for (y = 0; y < m; y++) for (x = 0; x < n; x++) {
      var coop = 0; // cooperating players among the 3×3 neighborhood, self included
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) coop += cur[((y + dy + m) % m) * n + (x + dx + n) % n];
      sc[y * n + x] = cur[y * n + x] ? coop : b * coop; // C earns 1 per cooperator met, D earns b per cooperator met
    }
    var nxt = new Uint8Array(n * m);
    for (y = 0; y < m; y++) for (x = 0; x < n; x++) {
      k = y * n + x; var best = sc[k], s = cur[k];
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) { var kk = ((y + dy + m) % m) * n + (x + dx + n) % n; if (sc[kk] > best + 1e-9) { best = sc[kk]; s = cur[kk]; } }
      nxt[k] = s;
    }
    S.prev = cur; S.cur = nxt; S.gen++;
  }
  function render() {
    var n = S.n, m = S.m, cs = S.cell, ox = (K.w - n * cs) / 2, oy = (K.h - m * cs) / 2;
    c.fillStyle = '#06111a'; c.fillRect(0, 0, K.w, K.h);
    var nC = 0;
    for (var y = 0; y < m; y++) for (var x = 0; x < n; x++) {
      var k = y * n + x, a = S.prev[k], b2 = S.cur[k]; nC += b2;
      c.fillStyle = a && b2 ? COL.cc : !a && !b2 ? COL.dd : b2 ? COL.dc : COL.cd;
      c.fillRect(ox + x * cs, oy + y * cs, cs - (cs > 5 ? 1 : 0), cs - (cs > 5 ? 1 : 0));
    }
    if (S.hover >= 0) { var hx = S.hover % n, hy = Math.floor(S.hover / n); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.strokeRect(ox + hx * cs - 1, oy + hy * cs - 1, cs + 1, cs + 1); }
    var share = nC / (n * m);
    if (stat) stat.textContent = 'Round ' + S.gen + ' · cooperators ' + Math.round(share * 100) + '%';
  }
  function tick(dt) {
    if (S.paused || reduced) return;
    S.acc += dt * S.rate;
    var did = false; while (S.acc >= 1) { S.acc -= 1; step(); did = true; }
    if (did) render();
  }
  function restart(kind) {
    seed(kind || S.preset); window.GT.seg(presets, 'data-pre', S.preset);
    if (reduced) { for (var i = 0; i < (S.preset === 'kaleido' ? 46 : 30); i++) step(); } // a still frame partway in
    render();
  }
  function setB(v) { S.b = Math.round(v * 100) / 100; if (bIn) bIn.value = S.b; if (bOut) bOut.textContent = S.b.toFixed(2); }
  function setPause(p) { S.paused = p; if (pauseB) { pauseB.textContent = p ? '▶' : '❚❚'; pauseB.setAttribute('aria-label', p ? 'Play' : 'Pause'); } }
  function cellAt(e) {
    var r = cv.getBoundingClientRect(), cs = S.cell, ox = (K.w - S.n * cs) / 2, oy = (K.h - S.m * cs) / 2;
    var x = Math.floor((e.clientX - r.left - ox) / cs), y = Math.floor((e.clientY - r.top - oy) / cs);
    if (x < 0 || y < 0 || x >= S.n || y >= S.m) return -1; return y * S.n + x;
  }
  function paint(k) { // drop a small blob of the opposite strategy
    if (k < 0) return; var x = k % S.n, y = Math.floor(k / S.n), v = S.painting;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var kk = ((y + dy + S.m) % S.m) * S.n + (x + dx + S.n) % S.n; if (Math.abs(dx) + Math.abs(dy) < 2) { S.cur[kk] = v; S.prev[kk] = v; } }
    render();
  }
  cv.addEventListener('pointerdown', function (e) { var k = cellAt(e); if (k < 0) return; S.painting = S.cur[k] ? 0 : 1; paint(k); try { cv.setPointerCapture(e.pointerId); } catch (er) { } });
  cv.addEventListener('pointermove', function (e) { var k = cellAt(e); if (S.painting !== null) paint(k); else if (e.pointerType === 'mouse') { S.hover = k; if (S.paused || reduced) render(); } });
  cv.addEventListener('pointerup', function () { S.painting = null; });
  cv.addEventListener('pointerleave', function () { S.hover = -1; });
  cv.addEventListener('keydown', function (e) {
    if (e.key === ' ') { e.preventDefault(); setPause(!S.paused); }
    else if (e.key === 'r' || e.key === 'R') restart();
    else if (e.key === 'ArrowRight' || e.key === 's') { e.preventDefault(); step(); render(); }
  });
  if (bIn) bIn.addEventListener('input', function () { setB(+bIn.value); });
  if (pauseB) pauseB.addEventListener('click', function () { setPause(!S.paused); });
  var stepB = $('gth-step'); if (stepB) stepB.addEventListener('click', function () { step(); render(); });
  if (presets) presets.addEventListener('click', function (e) {
    var bt = e.target.closest('button[data-pre]'); if (!bt) return;
    var k = bt.getAttribute('data-pre'); if (k === 'kaleido') setB(1.85); else if (k === 'random') setB(1.65); else setB(1.5);
    restart(k);
  });
  window.addEventListener('resize', function () { var z = size(); if (z.n !== S.n || z.m !== S.m) restart(); else { S.cell = z.cell; render(); } });
  setB(S.b); if (reduced) setPause(true);
  restart('kaleido');
  LAB.loop(tick, cv);
  LAB.onTheme(function () { render(); });
})();
