/* Nine Men's Morris: the bigger relative of Terni Lapilli. Place nine pieces, then slide them; three in a row
   (a mill) lets you take an enemy piece. With three pieces left you may fly to any empty point.
   Move statistics come from a short look-ahead search, so they are estimates. */
(function (W, D) {
  'use strict';
  // 24 points: outer square 0-7, middle 8-15, inner 16-23, each numbered clockwise from the top-left corner
  var ADJ = [], MILLS = [];
  (function () {
    for (var s = 0; s < 3; s++) for (var i = 0; i < 8; i++) {
      var p = s * 8 + i; ADJ[p] = [s * 8 + (i + 1) % 8, s * 8 + (i + 7) % 8];
      if (i % 2 === 1) { if (s > 0) ADJ[p].push(p - 8); if (s < 2) ADJ[p].push(p + 8); }
    }
    for (s = 0; s < 3; s++) for (i = 0; i < 8; i += 2) MILLS.push([s * 8 + i, s * 8 + i + 1, s * 8 + (i + 2) % 8]);
    for (i = 1; i < 8; i += 2) MILLS.push([i, i + 8, i + 16]);
  })();
  var MILLS_AT = []; for (var q = 0; q < 24; q++) MILLS_AT[q] = MILLS.filter(function (m) { return m.indexOf(q) >= 0; });
  function inMill(b, p, c) { return MILLS_AT[p].some(function (m) { return b[m[0]] === c && b[m[1]] === c && b[m[2]] === c; }); }
  function count(b, c) { var n = 0; for (var i = 0; i < 24; i++) if (b[i] === c) n++; return n; }
  // S: { b: array of 24 (0 empty, 1, 2), hand: [_, n1, n2], turn: 1|2 }
  function start() { var b = []; for (var i = 0; i < 24; i++) b.push(0); return { b: b, hand: [0, 9, 9], turn: 1, quiet: 0 }; }
  function removable(b, o) { var all = [], free = []; for (var i = 0; i < 24; i++) if (b[i] === o) { all.push(i); if (!inMill(b, i, o)) free.push(i); } return free.length ? free : all; }
  function moves(S) { // each move: {f (-1 = placing), t, x (point taken, or -1)}
    var c = S.turn, o = 3 - c, b = S.b, out = [], froms = [];
    if (S.hand[c] > 0) froms = [-1];
    else { for (var i = 0; i < 24; i++) if (b[i] === c) froms.push(i); }
    var fly = S.hand[c] === 0 && count(b, c) === 3;
    froms.forEach(function (f) {
      var tos = f < 0 || fly ? b.map(function (v, i) { return v ? -1 : i; }).filter(function (i) { return i >= 0; }) : ADJ[f].filter(function (i) { return !b[i]; });
      tos.forEach(function (t) {
        var nb = b.slice(); if (f >= 0) nb[f] = 0; nb[t] = c;
        if (inMill(nb, t, c)) removable(nb, o).forEach(function (x) { out.push({ f: f, t: t, x: x }); });
        else out.push({ f: f, t: t, x: -1 });
      });
    });
    return out;
  }
  function apply(S, m) {
    var c = S.turn, b = S.b.slice(), hand = S.hand.slice();
    if (m.f >= 0) b[m.f] = 0; else hand[c]--;
    b[m.t] = c; if (m.x >= 0) b[m.x] = 0;
    return { b: b, hand: hand, turn: 3 - c, quiet: m.x >= 0 ? 0 : S.quiet + 1 };
  }
  function lost(S) { var c = S.turn; if (S.hand[c] === 0 && count(S.b, c) < 3) return true; return S.hand[c] === 0 && !moves(S).length; }
  function evaluate(S, c) { // from c's point of view
    var o = 3 - c, b = S.b, pc = count(b, c) + S.hand[c], po = count(b, o) + S.hand[o];
    if (S.hand[o] === 0 && count(b, o) < 3) return 1000; if (S.hand[c] === 0 && count(b, c) < 3) return -1000;
    var sc = (pc - po) * 30, mob = function (x) { var n = 0; for (var i = 0; i < 24; i++) if (b[i] === x) ADJ[i].forEach(function (a) { if (!b[a]) n++; }); return n; };
    sc += (mob(c) - mob(o)) * 1.5;
    MILLS.forEach(function (m) { var a = 0, z = 0; m.forEach(function (p) { if (b[p] === c) a++; else if (b[p] === o) z++; }); if (a === 3) sc += 6; if (z === 3) sc -= 6; if (a === 2 && z === 0) sc += 4; if (z === 2 && a === 0) sc -= 5; });
    if (S.hand[o] === 0 && count(b, o) >= 3) { var tmp = { b: b, hand: S.hand, turn: o }; if (!moves(tmp).length) return 900; }
    return sc;
  }
  function search(S, depth, alpha, beta, c) {
    if (lost(S)) return S.turn === c ? -1000 - depth : 1000 + depth;
    if (depth === 0) return evaluate(S, c);
    var ms = moves(S), best = S.turn === c ? -1e9 : 1e9;
    ms.sort(function (a, b) { return (b.x >= 0) - (a.x >= 0); });
    for (var i = 0; i < ms.length; i++) {
      var v = search(apply(S, ms[i]), depth - 1, alpha, beta, c);
      if (S.turn === c) { if (v > best) best = v; if (best > alpha) alpha = best; } else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }
  function rank(S, depth) {
    var c = S.turn, ms = moves(S);
    var d = depth || (S.hand[c] > 0 ? 2 : 3);
    if ((S.hand[1] === 0 && count(S.b, 1) === 3) || (S.hand[2] === 0 && count(S.b, 2) === 3)) d = Math.max(1, d - 1); // flying: many more moves to look at
    ms.forEach(function (m) { m.v = search(apply(S, m), d - 1, -1e9, 1e9, c); m.w = 1 / (1 + Math.exp(-m.v / 30)); });
    ms.sort(function (a, b) { return b.v - a.v; });
    return ms;
  }
  W.MorrisEngine = { start: start, moves: moves, apply: apply, lost: lost, rank: rank, ADJ: ADJ, MILLS: MILLS, inMill: inMill, count: count };

  var root = D.getElementById('morris'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  var pref = { level: 2, hints: true, first: 'you', mode: 'cpu', stats: { w: 0, l: 0, d: 0 } };
  try { var sv = JSON.parse(W.localStorage.getItem('trb-morris')); if (sv) for (var k in sv) pref[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem('trb-morris', JSON.stringify(pref)); } catch (e) { } }
  var S, an = null, sel = -1, pend = null, over = null, busy = false, seen = {}, st;
  function two() { return pref.mode === 'two'; }
  function cpu() { return !two() && S.turn === 2; }
  function name(c) { return two() ? (c === 1 ? 'Pale' : 'Dark') : (c === 1 ? 'You' : 'Your opponent'); }
  root.innerHTML = '<div class="bg-top"><h1>Nine Men’s Morris</h1><select id="m-mode" aria-label="Players"><option value="cpu">Against the computer</option><option value="two">Two players, one device</option></select>' +
    '<select id="m-level" aria-label="Opponent"><option value="1">Opponent: easy</option><option value="2">Opponent: medium</option><option value="3">Opponent: hard</option></select>' +
    '<select id="m-first" aria-label="Who starts"><option value="you">Pale starts</option><option value="them">Dark starts</option></select><button type="button" class="bg-btn" id="m-hint">💡 Move statistics</button><button type="button" class="bg-btn" id="m-new">New game</button></div>' +
    '<div class="bg-main"><div><div class="mo-wrap" id="m-board"></div><div class="bg-msg" id="m-msg"></div></div>' +
    '<div class="bg-side"><div class="bg-box" id="m-stats"></div><div class="bg-box" id="m-hbox"><h3>Moves, best first</h3><ol class="bg-hints" id="m-hints"></ol>' +
    '<div class="bg-legend"><span><i class="sw q0"></i>best</span><span><i class="sw q1"></i>good</span><span><i class="sw q2"></i>fair</span><span><i class="sw q3"></i>weak</span><span><i class="sw q4"></i>bad</span></div>' +
    '<p class="bg-small">The percentage is an estimate of the chances for the side to move, from a search two or three moves ahead that counts pieces, mills, half-made mills and room to move. The game itself has been solved: with perfect play from the start it is a draw.</p></div>' +
    '<details class="bg-box bg-rules" id="m-rules"></details></div></div>';
  function qual(d) { return d <= 0.02 ? 0 : d <= 0.06 ? 1 : d <= 0.12 ? 2 : d <= 0.22 ? 3 : 4; }
  function newGame() { S = start(); S.turn = pref.first === 'you' ? 1 : 2; sel = -1; pend = null; over = null; busy = false; seen = {}; st = { mills: [0, 0, 0], best: 0, plays: 0 }; step(); }
  function step() {
    if (lost(S)) { over = 3 - S.turn; record(over === 1 ? 'w' : 'l'); an = null; return draw(); }
    var key = S.b.join('') + S.turn + S.hand.join(','); seen[key] = (seen[key] || 0) + 1;
    if (seen[key] >= 3 || S.quiet >= 60) { over = 'draw'; record('d'); an = null; return draw(); }
    an = cpu() ? null : (pref.hints ? rank(S) : moves(S));
    if (an && pref.hints) { var b = an[0].w; an.forEach(function (m) { m.q = qual(b - m.w); }); }
    draw();
    if (cpu()) { busy = true; setTimeout(reply, 500); }
  }
  function record(r) { if (two()) return; pref.stats[r]++; save(); }
  function reply() {
    var ms = rank(S, pref.level === 3 ? 4 : 2), m = ms[0];
    if (pref.level === 1 && Math.random() < 0.55) m = ms[Math.floor(Math.random() * ms.length)];
    else if (pref.level === 2 && Math.random() < 0.2) m = ms[Math.min(ms.length - 1, 1 + Math.floor(Math.random() * 2))];
    busy = false; doMove(m);
  }
  function doMove(m) {
    if (!cpu() && pref.hints && an && an[0].w != null) { st.plays++; if (m.w >= an[0].w - 0.02) st.best++; }
    if (m.x >= 0) st.mills[S.turn]++;
    S = apply(S, m); sel = -1; pend = null; step();
  }
  function tap(i) {
    if (over || busy || cpu() || !an) return;
    if (pend) { var r = an.filter(function (m) { return m.f === pend.f && m.t === pend.t && m.x === i; })[0]; if (r) doMove(r); return; }
    var placing = S.hand[S.turn] > 0, cand;
    if (placing || sel >= 0) {
      cand = an.filter(function (m) { return m.f === (placing ? -1 : sel) && m.t === i; });
      if (cand.length) { if (cand[0].x < 0) return doMove(cand[0]); pend = { f: cand[0].f, t: i }; return draw(); }
    }
    if (!placing) { sel = S.b[i] === S.turn && sel !== i && an.some(function (m) { return m.f === i; }) ? i : -1; draw(); }
  }
  var XY = (function () { var o = [], R = [[30, 270], [70, 230], [110, 190]]; for (var s = 0; s < 3; s++) { var a = R[s][0], z = R[s][1], m = 150; [[a, a], [m, a], [z, a], [z, m], [z, z], [m, z], [a, z], [a, m]].forEach(function (p) { o.push(p); }); } return o; })();
  var QC = ['#1a8a4a', '#8fbf3f', '#e2b800', '#e8862a', '#c0392b'];
  function draw() {
    var h = '<svg viewBox="0 0 300 300" role="img" aria-label="Board"><rect width="300" height="300" rx="4" fill="#d6d0c2"/><g stroke="#5f584b" stroke-width="4" fill="none" stroke-linecap="round"><rect x="30" y="30" width="240" height="240"/><rect x="70" y="70" width="160" height="160"/><rect x="110" y="110" width="80" height="80"/><path d="M150 30V110M150 190V270M30 150H110M190 150H270"/></g>';
    var placing = !over && S.hand[S.turn] > 0, by = {}, tgt = {};
    if (an && pref.hints && !pend) an.forEach(function (m) { var k = placing ? m.t : sel >= 0 ? (m.f === sel ? m.t : null) : 's' + m.f; if (k != null && !(k in by)) by[k] = m; });
    if (an && !pend && sel >= 0) an.forEach(function (m) { if (m.f === sel) tgt[m.t] = 1; });
    var take = {}; if (pend && an) an.forEach(function (m) { if (m.f === pend.f && m.t === pend.t) take[m.x] = m; });
    var nb = S.b.slice(); if (pend) { if (pend.f >= 0) nb[pend.f] = 0; nb[pend.t] = S.turn; }
    for (var i = 0; i < 24; i++) {
      var x = XY[i][0], y = XY[i][1], c = nb[i], hint = by[i], src = by['s' + i], tk = take[i];
      h += '<g class="mo-pt" data-i="' + i + '" data-label="point ' + (i + 1) + '"><circle cx="' + x + '" cy="' + y + '" r="20" fill="transparent"/>';
      if (!c) h += '<circle cx="' + x + '" cy="' + y + '" r="' + (hint || tgt[i] ? 13 : 6) + '" fill="' + (hint ? QC[hint.q] : tgt[i] ? '#b8963e' : '#6b4a2a') + '"' + (hint || tgt[i] ? ' opacity=".85"' : '') + '/>';
      else h += '<circle cx="' + x + '" cy="' + y + '" r="16" fill="' + (c === 1 ? '#f6efdc' : '#7a1f2b') + '" stroke="' + (tk ? '#c0392b' : i === sel ? '#f3dfa3' : src ? QC[src.q] : c === 1 ? '#8a7a55' : '#3d0c14') + '" stroke-width="' + (tk || i === sel || src ? 5 : 2.5) + '"' + (tk ? ' stroke-dasharray="4 3"' : '') + '/>';
      h += '</g>';
    }
    $('#m-board').innerHTML = h + '</svg>';
    root.querySelectorAll('.mo-pt').forEach(function (g) { g.onclick = function () { tap(+g.dataset.i); }; });
    var c = S.turn, who = name(c);
    $('#m-msg').innerHTML = over ? (over === 'draw' ? '<b class="la">Pares estis.</b> = You are equals: a draw.' : two() ? '<b>' + name(over) + ' wins!</b>' : over === 1 ? '<b class="la">Vicisti!</b> = You have won.' : '<b class="la">Victus es.</b> = You are beaten.')
      : cpu() ? 'Your opponent is thinking…' : pend ? '<b class="la">Tolle lapillum!</b> = Take a pebble! ' + who + ' made a mill: tap an enemy piece to remove.'
      : placing ? '<b class="la">Pone lapillum.</b> = Place a pebble. <i>(' + who + ': ' + S.hand[c] + ' left in hand)</i>'
      : (count(S.b, c) === 3 ? '<b class="la">Vola!</b> = Fly! ' + who + ' has three pieces left and may jump to any empty point. ' : '<b class="la">Move lapillum.</b> = Move a pebble. ') + (sel >= 0 ? 'Now tap where it goes.' : who + ': tap one of your pieces.');
    var pos = an && an[0] && an[0].w != null ? an[0].w : null;
    $('#m-stats').innerHTML = '<h3>This game</h3><table><tr><td>Pieces (on board + in hand), pale : dark</td><td>' + (count(S.b, 1) + S.hand[1]) + ' : ' + (count(S.b, 2) + S.hand[2]) + '</td></tr><tr><td>Mills made, pale : dark</td><td>' + st.mills[1] + ' : ' + st.mills[2] + '</td></tr>' +
      (pref.hints && pos != null && !over ? '<tr><td>' + who + ' to move: estimated chances</td><td>' + Math.round(pos * 100) + '%</td></tr>' : '') + (pref.hints && st.plays ? '<tr><td>Moves within 2% of the best</td><td>' + st.best + ' of ' + st.plays + '</td></tr>' : '') +
      (!two() ? '<tr><td>Your record (won, drawn, lost)</td><td>' + pref.stats.w + ', ' + pref.stats.d + ', ' + pref.stats.l + '</td></tr>' : '') + '</table>';
    var hl = $('#m-hints'), NM = function (p) { return p < 0 ? 'hand' : String(p + 1); };
    var list = an && pref.hints ? an.filter(function (m) { return (!pend || (m.f === pend.f && m.t === pend.t)) && (placing || sel < 0 || m.f === sel); }) : [];
    hl.innerHTML = list.length ? list.slice(0, 40).map(function (m) { return '<li data-k="' + m.f + ',' + m.t + ',' + m.x + '"><i class="sw q' + m.q + '"></i><span>' + (m.f < 0 ? 'place on ' + NM(m.t) : NM(m.f) + ' → ' + NM(m.t)) + (m.x >= 0 ? ', take ' + NM(m.x) : '') + '</span><b>' + Math.round(m.w * 100) + '%</b></li>'; }).join('') : '<li>' + (over ? 'The game is over.' : cpu() ? 'Waiting…' : 'No moves.') + '</li>';
    hl.querySelectorAll('[data-k]').forEach(function (li) { li.onclick = function () { var p = li.dataset.k.split(',').map(Number), m = an.filter(function (x) { return x.f === p[0] && x.t === p[1] && x.x === p[2]; })[0]; if (m && !busy && !cpu() && !over) doMove(m); }; });
    $('#m-hint').classList.toggle('on', pref.hints); $('#m-hbox').hidden = !pref.hints; $('#m-level').hidden = two();
    $('#m-first').options[0].textContent = two() ? 'Pale starts' : 'You start (pale)'; $('#m-first').options[1].textContent = two() ? 'Dark starts' : 'Opponent starts (dark)';
  }
  $('#m-rules').innerHTML = '<summary>Rules and the history</summary>' +
    '<ul><li><b>Place.</b> Each side has nine pieces. Take turns putting one on any empty point until all eighteen are down.</li><li><b>Move.</b> Then take turns sliding a piece along a line to the next empty point.</li>' +
    '<li><b>Mills.</b> Three of your pieces in a straight line along one side or one cross-line make a mill. Each time you make one, by placing or by moving, take one enemy piece off the board. You may not take a piece that is in a mill unless all of them are.</li>' +
    '<li><b>Flying.</b> When you are down to three pieces, you may jump a piece to any empty point.</li>' +
    '<li>You lose when you have only two pieces, or cannot move. The game is drawn if the same position comes up three times, or after 60 moves in a row with no piece taken.</li></ul>' +
    '<h4>The move statistics</h4><p>With 💡 on, each point shows how good that move looks, and the list gives an estimated percentage. The computer looks two or three moves ahead and judges the positions it reaches; it does not see everything, so treat the figures as advice. In 1996 Ralph Gasser showed by computer that perfect play from the start leads to a draw.</p>' +
    '<h4>Words</h4><table><tbody><tr><td class="la">lapillus</td><td>a little stone, a pebble</td></tr><tr><td class="la">pono, ponere</td><td>to place</td></tr><tr><td class="la">moveo, movere</td><td>to move</td></tr><tr><td class="la">tollo, tollere</td><td>to lift, to take away</td></tr><tr><td class="la">volo, volare</td><td>to fly</td></tr></tbody></table>' +
    '<h4>The history</h4><p>Nine men’s morris is the big sister of <a href="/games/terni/">Terni Lapilli</a>, which Ovid mentions. How old the nine-piece game is remains uncertain: boards of this pattern are scratched into stone at many ancient and medieval sites, but most cannot be dated securely. It was one of the most popular board games of medieval Europe, and the English name comes from “merels”, the pieces.</p>';
  $('#m-mode').value = pref.mode; $('#m-level').value = pref.level; $('#m-first').value = pref.first;
  $('#m-mode').onchange = function () { pref.mode = this.value; save(); newGame(); };
  $('#m-level').onchange = function () { pref.level = +this.value; save(); };
  $('#m-first').onchange = function () { pref.first = this.value; save(); newGame(); };
  $('#m-hint').onclick = function () { pref.hints = !pref.hints; save(); if (!over && !cpu()) { an = pref.hints ? rank(S) : moves(S); if (pref.hints) { var b = an[0].w; an.forEach(function (m) { m.q = qual(b - m.w); }); } } draw(); };
  $('#m-new').onclick = newGame;
  W.__morris = { get S() { return S; }, get an() { return an; }, doMove: doMove, tap: tap, get over() { return over; }, newGame: newGame };
  newGame();
})(window, document);
