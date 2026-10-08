/* The Royal Game of Ur, with the rules Irving Finkel read from a Babylonian tablet: 7 pieces each, four
   tetrahedral dice, rosettes give another throw and the middle rosette is safe. Move statistics are
   estimated by playing every possible move out to the end many times. */
(function (W, D) {
  'use strict';
  var N = 7, ROS = { 4: 1, 8: 1, 14: 1 };
  function rnd() { try { var a = new Uint32Array(1); W.crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); } }
  function throwDice() { var d = []; for (var i = 0; i < 4; i++) d.push(rnd() < 0.5 ? 1 : 0); return d; }
  // State: p[side] = sorted positions of that side's 7 pieces: 0 = not yet on the board, 1..14 = the path, 15 = home.
  function start() { return { p: [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]], turn: 0 }; }
  function shared(t) { return t >= 5 && t <= 12; }
  function moves(S, side, r) {
    if (!r) return [];
    var me = S.p[side], op = S.p[1 - side], out = [], seen = {};
    for (var i = 0; i < N; i++) {
      var f = me[i], t = f + r; if (f === 15 || t > 15 || seen[f]) continue; seen[f] = 1;
      if (t < 15 && me.indexOf(t) >= 0) continue;
      var hit = shared(t) && op.indexOf(t) >= 0; if (hit && t === 8) continue;
      out.push({ f: f, t: t, hit: hit, again: !!ROS[t] });
    }
    return out;
  }
  function apply(S, side, m) {
    var p = [S.p[0].slice(), S.p[1].slice()], me = p[side], op = p[1 - side];
    me[me.indexOf(m.f)] = m.t; me.sort(function (a, b) { return a - b; });
    if (m.hit) { op[op.indexOf(m.t)] = 0; op.sort(function (a, b) { return a - b; }); }
    return { p: p, turn: m.again ? side : 1 - side };
  }
  function done(S, side) { return S.p[side].every(function (x) { return x === 15; }); }
  // a quick player for the playouts: finish, hit, land on a rosette, get out of danger, else advance the leader
  function danger(S, side, t) { if (!shared(t) || t === 8) return 0; var op = S.p[1 - side], n = 0; op.forEach(function (o) { var d = t - o; if (o < 13 && d >= 1 && d <= 4) n += [0, 4, 6, 4, 1][d]; }); return n; }
  function quick(S, side, ms) {
    var best = null, bs = -1e9;
    ms.forEach(function (m) {
      var s = m.t * 0.6 + (m.t === 15 ? 6 : 0) + (m.hit ? 9 + m.t * 0.3 : 0) + (m.again ? 6 : 0) + (m.f === 8 ? -3 : 0) + (m.t === 8 ? 3 : 0) - danger(S, side, m.t) * 0.9 + danger(S, side, m.f) * 0.7 + rnd() * 1.5;
      if (s > bs) { bs = s; best = m; }
    });
    return best;
  }
  // fast playouts: plain arrays, a small xorshift generator, the same sensible move choice as quick()
  var xs = (Date.now() ^ 0x9e3779b9) >>> 0 || 1;
  function xr() { xs ^= xs << 13; xs >>>= 0; xs ^= xs >>> 17; xs ^= xs << 5; xs >>>= 0; return xs; }
  var BITS = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
  function playout(S) {
    var P = [S.p[0].slice(), S.p[1].slice()], side = S.turn;
    for (var k = 0; k < 800; k++) {
      var r = BITS[xr() & 15], me = P[side], op = P[1 - side], best = -1, bs = -1e9;
      if (r) for (var i = 0; i < N; i++) {
        var f = me[i], t = f + r; if (f === 15 || t > 15) continue;
        var dup = false; for (var j = 0; j < i; j++) if (me[j] === f) { dup = true; break; } if (dup) continue;
        var own = false; if (t < 15) for (j = 0; j < N; j++) if (me[j] === t) { own = true; break; } if (own) continue;
        var hit = -1; if (t >= 5 && t <= 12) for (j = 0; j < N; j++) if (op[j] === t) { hit = j; break; }
        if (hit >= 0 && t === 8) continue;
        var dz = 0; if (t >= 5 && t <= 12 && t !== 8) for (j = 0; j < N; j++) { var d = t - op[j]; if (op[j] < 13 && d >= 1 && d <= 4) dz += d === 1 || d === 3 ? 4 : d === 2 ? 6 : 1; }
        var sc = t * 0.6 + (t === 15 ? 6 : 0) + (hit >= 0 ? 9 + t * 0.3 : 0) + (ROS[t] ? 6 : 0) - dz * 0.9 + (xr() % 100) / 66;
        if (sc > bs) { bs = sc; best = i; }
      }
      if (best < 0) { side = 1 - side; continue; }
      var from = me[best], to = from + r; me[best] = to;
      if (to >= 5 && to <= 12) for (j = 0; j < N; j++) if (op[j] === to) { op[j] = 0; break; }
      if (to === 15) { var all = true; for (j = 0; j < N; j++) if (me[j] !== 15) { all = false; break; } if (all) return side; }
      if (!ROS[to]) side = 1 - side;
    }
    var a = 0, z = 0; for (var q = 0; q < N; q++) { a += P[0][q]; z += P[1][q]; } return a >= z ? 0 : 1;
  }
  // chance that `side` wins after each move, from n playouts each
  function rank(S, side, r, n) {
    var ms = moves(S, side, r);
    ms.forEach(function (m) { var S2 = apply(S, side, m), w = 0; if (done(S2, side)) w = n; else for (var i = 0; i < n; i++) if (playout(S2) === side) w++; m.w = w / n; });
    ms.sort(function (a, b) { return b.w - a.w; });
    return ms;
  }
  var api = { start: start, moves: moves, apply: apply, done: done, rank: rank, playout: playout, throwDice: throwDice, quick: quick };
  W.UrEngine = api;

  var root = D.getElementById('ur'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  var pref = { level: 2, hints: true, first: 'you', mode: 'cpu', stats: { w: 0, l: 0 } };
  try { var sv = JSON.parse(W.localStorage.getItem('trb-ur')); if (sv) for (var k in sv) pref[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem('trb-ur', JSON.stringify(pref)); } catch (e) { } }
  var S, dice = null, roll = 0, opts = [], phase = 'roll', busy = false, over = null, last = null, stat;
  function two() { return pref.mode === 'two'; }
  function name(side) { return two() ? (side === 0 ? 'Pale' : 'Dark') : (side === 0 ? 'You' : 'Your opponent'); }
  root.innerHTML = '<div class="bg-top"><h1>Royal Game of Ur</h1><select id="u-mode" aria-label="Players"><option value="cpu">Against the computer</option><option value="two">Two players, one device</option></select>' +
    '<select id="u-level" aria-label="Opponent"><option value="1">Opponent: easy</option><option value="2">Opponent: medium</option><option value="3">Opponent: hard</option></select>' +
    '<select id="u-first" aria-label="Who starts"><option value="you">Pale starts</option><option value="them">Dark starts</option></select><button type="button" class="bg-btn" id="u-hint">💡 Move statistics</button><button type="button" class="bg-btn" id="u-new">New game</button></div>' +
    '<div class="bg-main"><div><div class="ur-wrap" id="u-board"></div><div class="bg-msg" id="u-msg"></div><p style="text-align:center"><button type="button" class="bg-btn pri" id="u-roll">Throw the dice</button></p></div>' +
    '<div class="bg-side"><div class="bg-box" id="u-stats"></div><div class="bg-box" id="u-hbox"><h3>Moves for this throw, best first</h3><ol class="bg-hints" id="u-hints"></ol>' +
    '<div class="bg-legend"><span><i class="sw q0"></i>best</span><span><i class="sw q1"></i>good</span><span><i class="sw q2"></i>fair</span><span><i class="sw q3"></i>weak</span><span><i class="sw q4"></i>bad</span></div>' +
    '<p class="bg-small">Each percentage is the side to move’s chance of winning after that move, estimated by playing the game out from there 1,000 times with sensible moves on both sides.</p></div>' +
    '<details class="bg-box bg-rules" id="u-rules"></details></div></div>';
  function qual(d) { return d <= 0.02 ? 0 : d <= 0.05 ? 1 : d <= 0.1 ? 2 : d <= 0.18 ? 3 : 4; }
  function newGame() {
    S = start(); S.turn = pref.first === 'you' ? 0 : 1; dice = null; roll = 0; opts = []; phase = 'roll'; busy = false; over = null; last = null; stat = { thr: [0, 0], hits: [0, 0], best: 0, plays: 0 };
    turnBegin();
  }
  function cpuTurn() { return !two() && S.turn === 1; }
  function turnBegin() { phase = 'roll'; dice = null; opts = []; draw(); if (cpuTurn() && !over) { busy = true; setTimeout(doRoll, 650); } }
  function doRoll() {
    if (over || phase !== 'roll') return;
    dice = throwDice(); roll = dice.reduce(function (a, b) { return a + b; }, 0); stat.thr[S.turn] += roll;
    var side = S.turn, ms = moves(S, side, roll);
    if (!ms.length) { phase = 'pass'; opts = []; draw(); busy = true; setTimeout(function () { S = { p: S.p, turn: 1 - side }; busy = false; turnBegin(); }, W.__fast ? 10 : cpuTurn() ? 1100 : 1500); return; }
    var hintsNeeded = pref.hints && !cpuTurn();
    opts = cpuTurn() ? (pref.level === 3 ? rank(S, side, roll, 600) : ms) : (hintsNeeded ? rank(S, side, roll, 1000) : ms);
    if (hintsNeeded) { var b = opts[0].w; opts.forEach(function (o) { o.q = qual(b - o.w); }); }
    phase = 'move'; draw();
    if (cpuTurn()) setTimeout(function () {
      var m = pref.level === 3 ? opts[0] : pref.level === 2 ? quick(S, 1, opts) : (rnd() < 0.5 ? opts[Math.floor(rnd() * opts.length)] : quick(S, 1, opts));
      play(m);
    }, 700);
  }
  function play(m) {
    var side = S.turn;
    if (!cpuTurn() && pref.hints && opts[0] && opts[0].w != null) { stat.plays++; if (m === opts[0] || m.w >= opts[0].w - 0.02) stat.best++; }
    if (m.hit) stat.hits[side]++;
    last = { side: side, m: m };
    S = apply(S, side, m); busy = false;
    if (done(S, side)) { over = side; if (!two()) { pref.stats[side === 0 ? 'w' : 'l']++; save(); } phase = 'over'; return draw(); }
    turnBegin();
  }
  function tap(side, pos) {
    if (phase !== 'move' || busy || cpuTurn() || side !== S.turn) return;
    var m = opts.filter(function (o) { return o.f === pos; })[0]; if (m) play(m);
  }
  // board geometry: 8 columns x 3 rows; Pale (side 0) uses the bottom row, Dark the top row
  var C = 64;
  function cell(side, p) { // path position -> [col, row]
    var row = side === 0 ? 2 : 0;
    if (p >= 1 && p <= 4) return [4 - p, row];
    if (p >= 5 && p <= 12) return [p - 5, 1];
    if (p === 13 || p === 14) return [20 - p, row];
    return null;
  }
  var EXISTS = function (c, r) { return r === 1 || c < 4 || c > 5; };
  var ROSE = { '0,0': 1, '0,2': 1, '3,1': 1, '6,0': 1, '6,2': 1 };
  function sq(c, r) {
    var x = c * C + 70, y = r * C + 30, h = '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (C - 4) + '" height="' + (C - 4) + '" rx="4" fill="#e9dcc0" stroke="#5a3a1a" stroke-width="2"/>';
    if (ROSE[c + ',' + r]) { var cx = x + C / 2, cy = y + C / 2; h += '<g fill="#8c1d2c" stroke="#5a1020" stroke-width="1">'; for (var a = 0; a < 8; a++) { var an = a * Math.PI / 4; h += '<ellipse cx="' + (cx + Math.cos(an) * 13) + '" cy="' + (cy + Math.sin(an) * 13) + '" rx="9" ry="5" transform="rotate(' + (a * 45) + ' ' + (cx + Math.cos(an) * 13) + ' ' + (cy + Math.sin(an) * 13) + ')"/>'; } h += '</g><circle cx="' + cx + '" cy="' + cy + '" r="7" fill="#1f5fa8" stroke="#e9dcc0" stroke-width="2"/>'; }
    else if ((c + r) % 3 === 0) h += '<g fill="#1f5fa8">' + [[16, 16], [48, 16], [16, 48], [48, 48], [32, 32]].map(function (q) { return '<circle cx="' + (x + q[0]) + '" cy="' + (y + q[1]) + '" r="4"/>'; }).join('') + '</g>';
    else if ((c + r) % 3 === 1) h += '<path d="M' + (x + 12) + ' ' + (y + 32) + 'L' + (x + 32) + ' ' + (y + 12) + 'L' + (x + 52) + ' ' + (y + 32) + 'L' + (x + 32) + ' ' + (y + 52) + 'Z" fill="none" stroke="#1f5fa8" stroke-width="3"/>';
    else h += '<g stroke="#8c6a3a" stroke-width="2">' + [14, 26, 38, 50].map(function (q) { return '<line x1="' + (x + 10) + '" y1="' + (y + q) + '" x2="' + (x + 54) + '" y2="' + (y + q) + '"/>'; }).join('') + '</g>';
    return h;
  }
  function piece(side, x, y, cls, extra) {
    return '<g class="ur-pc ' + cls + '"' + extra + '><circle cx="' + x + '" cy="' + y + '" r="22" fill="' + (side === 0 ? '#f6efdc' : '#2b2b33') + '" stroke="' + (side === 0 ? '#8a7a55' : '#000') + '" stroke-width="3"/>' +
      [[0, 0], [-9, -9], [9, -9], [-9, 9], [9, 9]].map(function (q) { return '<circle cx="' + (x + q[0]) + '" cy="' + (y + q[1]) + '" r="3" fill="' + (side === 0 ? '#3a2a1a' : '#f6efdc') + '"/>'; }).join('') + '</g>';
  }
  var QC = ['#1a8a4a', '#8fbf3f', '#e2b800', '#e8862a', '#c0392b'];
  function draw() {
    var W2 = 8 * C + 140, H = 3 * C + 60, h = '<svg viewBox="0 0 ' + W2 + ' ' + H + '" role="img" aria-label="The board of the Royal Game of Ur"><rect width="' + W2 + '" height="' + H + '" rx="8" fill="#3a2414"/>';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 8; c++) if (EXISTS(c, r)) h += sq(c, r);
    var mv = phase === 'move' && !cpuTurn() ? opts : [], byF = {}; mv.forEach(function (m) { byF[m.f] = m; });
    // targets of the possible moves
    mv.forEach(function (m) { var ce = m.t < 15 ? cell(S.turn, m.t) : null; if (ce) h += '<rect x="' + (ce[0] * C + 74) + '" y="' + (ce[1] * C + 34) + '" width="' + (C - 8) + '" height="' + (C - 8) + '" rx="6" fill="none" stroke="' + (pref.hints && m.q != null ? QC[m.q] : '#d8b860') + '" stroke-width="4" stroke-dasharray="6 4"/>'; });
    [0, 1].forEach(function (side) {
      var off = 0, home = 0;
      S.p[side].forEach(function (p) {
        if (p === 0) { off++; return; } if (p === 15) { home++; return; }
        var ce = cell(side, p), m = side === S.turn ? byF[p] : null;
        h += piece(side, ce[0] * C + 70 + C / 2, ce[1] * C + 30 + C / 2, m ? 'can' : '', ' data-s="' + side + '" data-p="' + p + '"' + (m ? ' data-label="' + name(side) + ' piece on square ' + p + '"' : ''));
        if (m && pref.hints && m.w != null) h += '<text x="' + (ce[0] * C + 70 + C / 2) + '" y="' + (ce[1] * C + 30 + C - 2) + '" class="ur-pct" fill="' + QC[m.q] + '">' + Math.round(m.w * 100) + '%</text>';
      });
      // waiting pieces (left) and finished pieces (right of the bridge)
      var yRow = side === 0 ? 2 * C + 30 + C / 2 : 30 + C / 2, m0 = side === S.turn ? byF[0] : null;
      if (off) { h += piece(side, 36, yRow, m0 ? 'can' : '', ' data-s="' + side + '" data-p="0"' + (m0 ? ' data-label="Bring a new ' + name(side).toLowerCase() + ' piece on"' : '')) + '<text x="36" y="' + (yRow + 38) + '" class="ur-n">×' + off + '</text>'; if (m0 && pref.hints && m0.w != null) h += '<text x="36" y="' + (yRow - 26) + '" class="ur-pct" fill="' + QC[m0.q] + '">' + Math.round(m0.w * 100) + '%</text>'; }
      var hx = 4 * C + 70 + C, hy = yRow;
      h += '<text x="' + hx + '" y="' + (hy - 4) + '" class="ur-home">' + (side === 0 ? 'Pale' : 'Dark') + ' home</text><text x="' + hx + '" y="' + (hy + 18) + '" class="ur-home b">' + home + ' / 7</text>';
      var fin = mv.filter(function (m) { return m.t === 15; })[0];
      if (fin && side === S.turn) h += '<rect x="' + (hx - 52) + '" y="' + (hy - 24) + '" width="104" height="52" rx="8" fill="none" stroke="' + (pref.hints && fin.q != null ? QC[fin.q] : '#d8b860') + '" stroke-width="4" stroke-dasharray="6 4"/>';
    });
    // the four dice
    if (dice) dice.forEach(function (d, i) { var x = 4 * C + 70 + 12 + i * 30, y = 1 * C + 30 - 4; });
    h += '</svg>';
    $('#u-board').innerHTML = h;
    root.querySelectorAll('.ur-pc.can').forEach(function (g) { g.onclick = function () { tap(+g.dataset.s, +g.dataset.p); }; });
    var dh = dice ? '<span class="ur-dice">' + dice.map(function (d) { return '<i class="' + (d ? 'up' : '') + '"></i>'; }).join('') + '</span> <b>' + roll + '</b>' : '';
    var who = name(S.turn);
    var msg = over != null ? (two() ? '<b>' + name(over) + ' wins!</b> All seven pieces are home.' : over === 0 ? '<b>You win!</b> All seven of your pieces are home.' : '<b>Your opponent wins.</b> Try again?')
      : phase === 'roll' ? (cpuTurn() ? 'Your opponent throws…' : who + (two() ? '’s turn: throw the dice.' : ': throw the dice.'))
      : phase === 'pass' ? dh + ' ' + (roll === 0 ? 'A zero: ' : 'No move possible: ') + who + (two() || S.turn === 1 ? ' passes.' : ' pass.')
      : cpuTurn() ? dh + ' Your opponent is moving…' : dh + ' ' + who + ': tap a piece with a dashed target.' + (opts.some(function (o) { return o.again; }) ? ' <i>Landing on a rosette gives another throw.</i>' : '');
    if (last && phase === 'roll' && over == null && last.m.again && last.side === S.turn) msg = '<i>Rosette: another throw.</i> ' + msg;
    $('#u-msg').innerHTML = msg;
    var rb = $('#u-roll'); rb.disabled = !(phase === 'roll' && !cpuTurn() && over == null) && over == null; rb.textContent = over != null ? 'New game' : 'Throw the dice';
    var pip = function (s) { return S.p[s].reduce(function (a, b) { return a + (15 - b); }, 0); };
    $('#u-stats').innerHTML = '<h3>This game</h3><table><tr><td>Squares still to go (pale : dark)</td><td>' + pip(0) + ' : ' + pip(1) + '</td></tr><tr><td>Home (pale : dark)</td><td>' + S.p[0].filter(function (x) { return x === 15; }).length + ' : ' + S.p[1].filter(function (x) { return x === 15; }).length + '</td></tr>' +
      '<tr><td>Pieces sent back (by pale : by dark)</td><td>' + stat.hits[0] + ' : ' + stat.hits[1] + '</td></tr><tr><td>Total thrown (pale : dark)</td><td>' + stat.thr[0] + ' : ' + stat.thr[1] + '</td></tr>' +
      (pref.hints && stat.plays ? '<tr><td>Your moves within 2% of the best</td><td>' + stat.best + ' of ' + stat.plays + '</td></tr>' : '') +
      (!two() ? '<tr><td>Your record against the computer</td><td>' + pref.stats.w + ' won, ' + pref.stats.l + ' lost</td></tr>' : '') + '</table>' +
      '<p class="bg-small">The dice: 0 comes up 1 time in 16, 1 four times, 2 six times, 3 four times, 4 once. Average throw: 2.</p>';
    var hl = $('#u-hints');
    hl.innerHTML = phase === 'move' && !cpuTurn() && pref.hints ? opts.map(function (m, i) { return '<li data-n="' + i + '"><i class="sw q' + m.q + '"></i><span>' + (m.f === 0 ? 'new piece' : 'square ' + m.f) + ' → ' + (m.t === 15 ? 'home' : 'square ' + m.t) + (m.hit ? ' ✕ hit' : '') + (m.again ? ' ✿ again' : '') + '</span><b>' + Math.round(m.w * 100) + '%</b></li>'; }).join('') : '<li>' + (phase === 'move' && cpuTurn() ? 'Your opponent is moving…' : 'Throw the dice to see your moves.') + '</li>';
    hl.querySelectorAll('[data-n]').forEach(function (li) { li.onclick = function () { if (phase === 'move' && !busy && !cpuTurn()) play(opts[+li.dataset.n]); }; });
    $('#u-hint').classList.toggle('on', pref.hints); $('#u-hbox').hidden = !pref.hints;
    $('#u-level').hidden = two(); $('#u-first').options[0].textContent = two() ? 'Pale starts' : 'You start (pale)'; $('#u-first').options[1].textContent = two() ? 'Dark starts' : 'Opponent starts (dark)';
  }
  $('#u-rules').innerHTML = '<summary>Rules and the history</summary>' +
    '<ul><li>Each side has seven pieces. ' + 'Pale enters on the bottom row, dark on the top row. Each piece runs four squares along its own row (right to left), up the middle row (left to right), and two squares back along its own row to finish.</li>' +
    '<li><b>The dice</b> are four pyramids with two marked tips each; the throw is the number of marked tips pointing up, 0 to 4.</li>' +
    '<li>Move one piece exactly that many squares, or bring a new piece on. You may not land on your own piece. A piece leaves the board only with an exact throw.</li>' +
    '<li>Land on an enemy piece in the middle row and it goes back to the start.</li>' +
    '<li><b>Rosettes</b> (the flowers) give you another throw. The rosette in the middle of the middle row is safe: no one can be hit there.</li>' +
    '<li>If you cannot move, or throw 0, your turn passes. The first to bring all seven pieces home wins.</li></ul>' +
    '<h4>The move statistics</h4><p>With 💡 on, every piece you can move shows your chance of winning after that move. It is worked out by playing the rest of the game from there 1,000 times, with both sides choosing sensible moves (taking hits, rosettes and safety into account), so it is an estimate, not an exact figure, and it can move by a point or two each time.</p>' +
    '<h4>The history</h4><p>Boards like this one were found by Leonard Woolley in the Royal Cemetery at Ur, in Iraq, from around 2600–2400 BC; one of them is in the British Museum. The game was played across the Near East for over two thousand years. The rules used here come from a Babylonian clay tablet written in the second century BC and read by Irving Finkel of the British Museum. Some details, such as exactly how many pieces each side had, remain matters of reconstruction.</p>' +
    '<p class="bg-small">Ur is older than Greece and Rome, and its language was Sumerian, so this game has no Greek or Latin words to learn.</p>';
  $('#u-mode').value = pref.mode; $('#u-level').value = pref.level; $('#u-first').value = pref.first;
  $('#u-mode').onchange = function () { pref.mode = this.value; save(); newGame(); };
  $('#u-level').onchange = function () { pref.level = +this.value; save(); };
  $('#u-first').onchange = function () { pref.first = this.value; save(); newGame(); };
  $('#u-hint').onclick = function () { pref.hints = !pref.hints; save(); if (phase === 'move' && pref.hints && !cpuTurn() && opts.length && opts[0].w == null) { opts = rank(S, S.turn, roll, 1000); var b = opts[0].w; opts.forEach(function (o) { o.q = qual(b - o.w); }); } draw(); };
  $('#u-new').onclick = newGame;
  $('#u-roll').onclick = function () { if (over != null) return newGame(); doRoll(); };
  W.__ur = { get S() { return S; }, get phase() { return phase; }, get opts() { return opts; }, play: play, doRoll: doRoll, get over() { return over; }, newGame: newGame, setS: function (s) { S = s; } };
  newGame();
})(window, document);
