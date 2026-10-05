/* Chess with ancient armies. Greeks against Trojans (Greek names) or Romans against Carthaginians (Latin names).
   The names are themed: chess itself reached Europe centuries after the ancient world. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('chess'), E = W.ChessEngine; if (!root || !E) return;
  function $(s) { return root.querySelector(s); }
  var tr = W.grTranslit || function (s) { return s; };
  var THEMES = {
    g: { name: 'Trojan War (Greek)', cls: 'gr', you: 'Greeks', them: 'Trojans', win: 'νίκη', winE: 'victory', lose: 'ἧττα', loseE: 'defeat',
      p: { k: ['βασιλεύς', 'king'], q: ['βασίλισσα', 'queen'], r: ['πύργος', 'tower'], b: ['τοξότης', 'archer'], n: ['ἱππεύς', 'horseman'], p: ['ὁπλίτης', 'hoplite (foot soldier)'] },
      kings: ['Agamemnon', 'Priam'] },
    l: { name: 'Punic War (Latin)', cls: 'la', you: 'Romans', them: 'Carthaginians', win: 'victoria', winE: 'victory', lose: 'clades', loseE: 'defeat',
      p: { k: ['rex', 'king'], q: ['regina', 'queen'], r: ['turris', 'tower'], b: ['sagittarius', 'archer'], n: ['eques', 'horseman'], p: ['miles', 'soldier'] },
      kings: ['Scipio', 'Hannibal'] }
  };
  var CHESS = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' }, GLY = { k: '♚\uFE0E', q: '♛\uFE0E', r: '♜\uFE0E', b: '♝\uFE0E', n: '♞\uFE0E', p: '♟\uFE0E' }, PTS = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  var pref = { theme: 'g', level: 2, hints: true };
  try { var sv = JSON.parse(W.localStorage.getItem('trb-chess')); if (sv) for (var k in sv) pref[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem('trb-chess', JSON.stringify(pref)); } catch (e) { } }
  var S, sel = -1, hist = [], an = null, last = null, over = null, thinking = false, quality = [], caps = { w: [], b: [] };
  function T() { return THEMES[pref.theme]; }
  function sqName(i) { return 'abcdefgh'[i & 7] + (8 - (i >> 3)); }
  function nameOf(p) { var t = T(), n = t.p[p.toLowerCase()]; return '<b class="' + t.cls + '">' + n[0] + '</b>' + (pref.theme === 'g' ? ' <i>' + tr(n[0]) + '</i>' : '') + ' = ' + n[1] + ' <i>(the ' + CHESS[p.toLowerCase()] + ')</i>'; }
  root.innerHTML = '<div class="bg-top"><h1>Chess of the Ancients</h1><select id="c-theme" aria-label="Armies"><option value="g">Trojan War (Greek names)</option><option value="l">Punic War (Latin names)</option></select>' +
    '<select id="c-level" aria-label="Opponent"><option value="1">Opponent: easy</option><option value="2">Opponent: medium</option><option value="3">Opponent: hard</option></select>' +
    '<button type="button" class="bg-btn" id="c-hint">💡 Move statistics</button><button type="button" class="bg-btn" id="c-undo">↶ Undo</button><button type="button" class="bg-btn" id="c-new">New game</button></div>' +
    '<div class="bg-main"><div><div class="ch-cap" id="c-capb"></div><div class="ch-board" id="c-board"></div><div class="ch-cap" id="c-capw"></div><div class="bg-msg" id="c-msg"></div></div>' +
    '<div class="bg-side"><div class="bg-box" id="c-stats"></div><div class="bg-box" id="c-hbox"><h3>Your moves, best first</h3><ol class="bg-hints" id="c-hints"></ol>' +
    '<div class="bg-legend"><span><i class="sw q0"></i>best</span><span><i class="sw q1"></i>good</span><span><i class="sw q2"></i>fair</span><span><i class="sw q3"></i>weak</span><span><i class="sw q4"></i>bad</span></div>' +
    '<p class="bg-small">The percentage is the engine’s estimate of your winning chances after that move, looking three moves ahead. It is a guide, not a certainty.</p></div>' +
    '<details class="bg-box bg-rules" id="c-rules"></details></div></div>';
  var bd = $('#c-board'), i;
  for (i = 0; i < 64; i++) { var b = D.createElement('button'); b.type = 'button'; b.className = 'ch-sq' + ((((i >> 3) + (i & 7)) % 2) ? ' dk' : ''); b.dataset.i = i; bd.appendChild(b); }
  bd.addEventListener('click', function (e) { var el = e.target.closest('.ch-sq'); if (el) tap(+el.dataset.i); });
  function qual(d) { return d <= 0.03 ? 0 : d <= 0.08 ? 1 : d <= 0.15 ? 2 : d <= 0.3 ? 3 : 4; } // drop in winning chance against the best move
  function newGame() { S = E.start(); sel = -1; hist = []; an = null; last = null; over = null; quality = []; caps = { w: [], b: [] }; draw(); analyse(); }
  function analyse() { // rank every legal move for the player
    an = null; if (over || S.turn !== 'w') return draw();
    setTimeout(function () {
      var a = E.analyse(S, 3), best = a.length ? E.winChance(a[0].s) : 0;
      a.forEach(function (x, n) { x.w = E.winChance(x.s); x.q = qual(best - x.w); x.n = n; });
      an = a; draw();
    }, 30);
  }
  function tap(i) {
    if (over || thinking || S.turn !== 'w') return;
    var p = S.b[i];
    if (sel >= 0) {
      var m = E.legal(S).filter(function (x) { return x.f === sel && x.t === i; })[0];
      if (m) return play(m);
    }
    sel = p && E.side(p) === 'w' && sel !== i ? i : -1; draw();
  }
  function record(m) { if (m.c) caps[E.side(m.p)].push(m.c); }
  function play(m) {
    if (an) { var x = an.filter(function (y) { return y.m.f === m.f && y.m.t === m.t; })[0]; if (x) quality.push({ n: x.n, of: an.length, d: an[0].w - x.w, q: x.q }); else quality.push(null); } else quality.push(null);
    hist.push({ m: m, u: E.make(S, m) }); record(m); last = m; sel = -1; an = null; check();
    draw(); if (over) return;
    thinking = true; setTimeout(reply, 250);
  }
  function reply() {
    var depth = [1, 2, 4][pref.level - 1], a = E.analyse(S, depth), m;
    if (pref.level === 1 && a.length > 1 && Math.random() < 0.45) m = a[Math.min(a.length - 1, 1 + Math.floor(Math.random() * 3))].m; else m = a[0].m;
    hist.push({ m: m, u: E.make(S, m) }); record(m); last = m; thinking = false; check(); analyse();
  }
  function check() { var s = E.status(S); over = s === 'mate' || s === 'stalemate' || s === 'draw50' || s === 'drawMat' ? s : null; }
  function undo() {
    if (thinking || hist.length < 1) return;
    var n = S.turn === 'w' ? 2 : 1; if (over && S.turn === 'b') n = 1;
    while (n-- && hist.length) { var h = hist.pop(); E.unmake(S, h.m, h.u); if (h.m.c) caps[E.side(h.m.p)].pop(); if (E.side(h.m.p) === 'w') quality.pop(); }
    last = hist.length ? hist[hist.length - 1].m : null; over = null; sel = -1; analyse();
  }
  function material(s) { var n = 0; S.b.forEach(function (p) { if (p && E.side(p) === s) n += PTS[p.toLowerCase()]; }); return n; }
  function draw() {
    var t = T(), moves = sel >= 0 ? E.legal(S).filter(function (m) { return m.f === sel; }) : [], kchk = !over || over === 'mate' ? (E.inCheck(S) ? E.kingSq(S, S.turn) : -1) : -1;
    var byPiece = {}, byTo = {};
    if (pref.hints && an) an.forEach(function (x) { if (!(x.m.f in byPiece)) byPiece[x.m.f] = x; if (x.m.f === sel) byTo[x.m.t] = x; });
    Array.prototype.forEach.call(bd.children, function (el, i) {
      var p = S.b[i], h = p ? '<span class="pc ' + E.side(p) + '">' + GLY[p.toLowerCase()] + '</span>' : '';
      var mv = moves.filter(function (m) { return m.t === i; })[0];
      if (mv) { var x = byTo[i]; h += x ? '<span class="ring r' + x.q + '"></span><span class="pct q' + x.q + '">' + Math.round(x.w * 100) + '%</span>' : '<span class="dot"></span>'; }
      else if (sel < 0 && byPiece[i] && S.turn === 'w' && !over) h += '<span class="ring r' + byPiece[i].q + '"></span>';
      if ((i & 7) === 0) h += '<span class="co">' + (8 - (i >> 3)) + '</span>'; if ((i >> 3) === 7) h += '<span class="co" style="top:auto;bottom:1px">' + 'abcdefgh'[i & 7] + '</span>';
      el.innerHTML = h;
      el.className = 'ch-sq' + ((((i >> 3) + (i & 7)) % 2) ? ' dk' : '') + (i === sel ? ' sel' : '') + (last && (last.f === i || last.t === i) ? ' last' : '') + (i === kchk ? ' chk' : '');
      el.setAttribute('aria-label', sqName(i) + (p ? ' ' + (E.side(p) === 'w' ? t.you : t.them) + ' ' + CHESS[p.toLowerCase()] : ''));
    });
    $('#c-capw').innerHTML = caps.w.map(function (p) { return '<span class="pc b" style="color:var(--wine)">' + GLY[p] + '</span>'; }).join('');
    $('#c-capb').innerHTML = caps.b.map(function (p) { return GLY[p.toLowerCase()]; }).join('');
    var msg;
    if (over === 'mate') msg = S.turn === 'b' ? '<b class="' + t.cls + '">' + t.win + '</b> ' + (pref.theme === 'g' ? '<i>' + tr(t.win) + '</i> ' : '') + '= ' + t.winE + '. Checkmate: ' + t.kings[1] + ' has fallen.' : '<b class="' + t.cls + '">' + t.lose + '</b> ' + (pref.theme === 'g' ? '<i>' + tr(t.lose) + '</i> ' : '') + '= ' + t.loseE + '. Checkmate: ' + t.kings[0] + ' has fallen.';
    else if (over) msg = 'Draw' + (over === 'stalemate' ? ' by stalemate: the side to move has no legal move but is not in check.' : over === 'draw50' ? ' by the fifty-move rule.' : ': neither side has enough pieces to give checkmate.');
    else if (thinking || S.turn === 'b') msg = 'The ' + t.them + ' are thinking…';
    else if (sel >= 0) msg = nameOf(S.b[sel]);
    else msg = (kchk >= 0 ? '<b>Check!</b> ' : '') + 'Your move, ' + t.you + '. Tap a piece to see its name and where it can go.';
    $('#c-msg').innerHTML = msg;
    stats(); hints();
    $('#c-hint').classList.toggle('on', pref.hints); $('#c-hbox').hidden = !pref.hints; $('#c-undo').disabled = !hist.length || thinking;
  }
  function stats() {
    var t = T(), mw = material('w'), mb = material('b'), w = an ? an[0].w : null, done = quality.filter(Boolean);
    var bestN = done.filter(function (q) { return q.n === 0; }).length, avg = done.length ? done.reduce(function (s, q) { return s + q.d; }, 0) / done.length : 0, lastQ = quality[quality.length - 1];
    $('#c-stats').innerHTML = '<h3>This game</h3><table><tr><td>Move</td><td>' + S.full + '</td></tr>' +
      '<tr><td>Material (' + t.you + ' : ' + t.them + ')</td><td>' + mw + ' : ' + mb + '</td></tr>' +
      '<tr><td>Captured by you / by them</td><td>' + caps.w.length + ' / ' + caps.b.length + '</td></tr>' +
      (pref.hints ? '<tr><td>Your winning chances</td><td>' + (w == null ? '…' : Math.round(w * 100) + '%') + '</td></tr></table>' + (w == null ? '' : '<div class="bg-bar"><i style="width:' + Math.round(w * 100) + '%"></i></div>') + '<table>' +
        '<tr><td>Times you chose the best move</td><td>' + bestN + ' of ' + done.length + '</td></tr>' +
        '<tr><td>Average chances given up per move</td><td>' + (done.length ? (avg * 100).toFixed(1) + ' pts' : '–') + '</td></tr>' +
        (lastQ ? '<tr><td>Your last move</td><td><i class="sw q' + lastQ.q + '"></i> ' + ord(lastQ.n + 1) + ' best of ' + lastQ.of + '</td></tr>' : '') : '') + '</table>' +
      '<p class="bg-small">Material counts pawn 1, knight and bishop 3, rook 5, queen 9.</p>';
  }
  function ord(n) { return n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'); }
  function hints() {
    var el = $('#c-hints'); if (!pref.hints) return;
    if (!an) { el.innerHTML = '<li>' + (over ? 'The game is over.' : S.turn === 'w' ? 'Working it out…' : 'Waiting for the reply…') + '</li>'; return; }
    var t = T(), list = sel >= 0 ? an.filter(function (x) { return x.m.f === sel; }) : an;
    el.innerHTML = list.slice(0, 40).map(function (x) {
      var n = t.p[x.m.p.toLowerCase()][0];
      return '<li data-f="' + x.m.f + '" data-t="' + x.m.t + '"><i class="sw q' + x.q + '"></i><span><span class="' + t.cls + '">' + n + '</span> ' + sqName(x.m.f) + (x.m.c ? '×' : '–') + sqName(x.m.t) + (x.m.fl === 'ck' || x.m.fl === 'cq' ? ' (castle)' : '') + (x.m.pr ? ' = queen' : '') + '</span><b>' + Math.round(x.w * 100) + '%</b></li>';
    }).join('');
    Array.prototype.forEach.call(el.children, function (li) { li.onclick = function () { var m = E.legal(S).filter(function (y) { return y.f === +li.dataset.f && y.t === +li.dataset.t; })[0]; if (m && !thinking && !over && S.turn === 'w') play(m); }; });
  }
  function rules() {
    var t = T(), rows = ['k', 'q', 'r', 'b', 'n', 'p'].map(function (p) {
      var mv = { k: 'One square in any direction. It may never move into attack.', q: 'Any distance in a straight line or diagonally.', r: 'Any distance in a straight line.', b: 'Any distance diagonally.', n: 'An L shape (two squares one way, one square across). The only piece that jumps over others.', p: 'One square forward (two on its first move); captures one square diagonally forward.' }[p];
      return '<tr><td style="font-size:1.4rem">' + GLY[p] + '</td><td><span class="' + t.cls + '">' + t.p[p][0] + '</span>' + (pref.theme === 'g' ? ' <i>' + tr(t.p[p][0]) + '</i>' : '') + '<br><span class="bg-small">' + t.p[p][1] + ' · ' + CHESS[p] + ' · ' + PTS[p] + (p === 'k' ? '' : ' pt') + '</span></td><td>' + mv + '</td></tr>';
    }).join('');
    $('#c-rules').innerHTML = '<summary>Rules and the pieces</summary><p>You command the ' + t.you + ' (the pale army, moving up the board) against the ' + t.them + '. Tap a piece, then tap where it should go.</p>' +
      '<table><tbody>' + rows + '</tbody></table>' +
      '<h4>Winning</h4><ul><li><b>Check</b>: a king is attacked and must escape at once (move, block, or capture the attacker).</li><li><b>Checkmate</b>: the king is in check and cannot escape. The game is over.</li><li><b>Draws</b>: stalemate (no legal move, but not in check), too few pieces to mate, or fifty moves with no capture or pawn move.</li></ul>' +
      '<h4>Special moves</h4><ul><li><b>Castling</b>: if neither has moved, the king goes two squares toward a rook and the rook jumps over it. Not allowed out of, through or into check. Tap the king, then the square two away.</li><li><b>En passant</b>: a pawn that has just advanced two squares can be captured by an enemy pawn beside it, as if it had moved one.</li><li><b>Promotion</b>: a pawn that reaches the far side becomes a queen (this game always chooses the queen).</li></ul>' +
      '<h4>The move statistics</h4><p>With 💡 on, the engine tries every move you could make and looks three moves ahead. Rings on your pieces show how good each piece’s best move is; tap a piece and each square it can reach is coloured and shows your estimated winning chances. Green is best, red is worst. The list beside the board ranks every move, and you can tap a line to play it.</p>' +
      '<h4>Is chess ancient?</h4><p>No. Chess grew out of an Indian game around AD 600 and reached Europe through Persia and the Arab world, long after classical Greece and Rome. The Greeks played <i>petteia</i> and the Romans <i>ludus latrunculorum</i>, board games of capture whose exact rules are lost. The armies and piece names here are a theme, not history; the archer stands in for the bishop.</p>';
  }
  $('#c-theme').value = pref.theme; $('#c-level').value = pref.level;
  $('#c-theme').onchange = function () { pref.theme = this.value; save(); rules(); draw(); };
  $('#c-level').onchange = function () { pref.level = +this.value; save(); };
  $('#c-hint').onclick = function () { pref.hints = !pref.hints; save(); draw(); };
  $('#c-undo').onclick = undo; $('#c-new').onclick = newGame;
  W.__chess = { get S() { return S; }, play: play, get an() { return an; }, get over() { return over; } };
  rules(); newGame();
})(window, document);
