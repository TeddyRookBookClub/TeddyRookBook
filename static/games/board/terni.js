/* Terni Lapilli ("three pebbles each"): the Roman three-in-a-row. The whole game is small enough to solve exactly,
   so the statistics here are not estimates: they say what happens with perfect play. */
(function (root) {
  'use strict';
  var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var ADJ = [[1, 3, 4], [0, 2, 4], [1, 5, 4], [0, 6, 4], [0, 1, 2, 3, 5, 6, 7, 8], [2, 8, 4], [3, 7, 4], [6, 8, 4], [5, 7, 4]];
  function won(b, c) { for (var i = 0; i < 8; i++) { var l = LINES[i]; if (b[l[0]] === c && b[l[1]] === c && b[l[2]] === c) return true; } return false; }
  function count(b, c) { var n = 0; for (var i = 0; i < 9; i++) if (b[i] === c) n++; return n; }
  function moves(b, c) { // b: 9-char string; returns [{f, t, b}] (f = -1 when placing)
    var out = [], i, j, a;
    if (count(b, c) < 3) { for (i = 0; i < 9; i++) if (b[i] === '.' && !(RULE.nc && i === 4 && b === '.........')) out.push({ f: -1, t: i, b: b.slice(0, i) + c + b.slice(i + 1) }); return out; }
    for (i = 0; i < 9; i++) if (b[i] === c) for (j = 0; j < ADJ[i].length; j++) { a = ADJ[i][j]; if (b[a] === '.') { var n = b.split(''); n[i] = '.'; n[a] = c; out.push({ f: i, t: a, b: n.join('') }); } }
    return out;
  }
  var RULE = { nc: false }, VC = {}; // nc: the first pebble may not go on the centre
  var V = null; // key "board|side" -> [result for the side to move: 1 win, -1 loss, 0 draw; moves to the end]
  function solve() {
    if (VC[RULE.nc]) return (V = VC[RULE.nc]); V = VC[RULE.nc] = {};
    var succ = {}, stack = ['.........|X'], k, seen = {}; seen[stack[0]] = 1;
    while (stack.length) {
      k = stack.pop(); var b = k.slice(0, 9), c = k[10], o = c === 'X' ? 'O' : 'X';
      if (won(b, o)) { V[k] = [-1, 0]; continue; }
      var ms = moves(b, c); if (!ms.length) { V[k] = [-1, 0]; continue; }
      succ[k] = ms.map(function (m) { return m.b + '|' + o; });
      succ[k].forEach(function (s) { if (!seen[s]) { seen[s] = 1; stack.push(s); } });
    }
    var keys = Object.keys(succ), changed = true, round = 0;
    while (changed) {
      changed = false; round++; var add = [];
      keys.forEach(function (key) {
        if (V[key]) return; var ss = succ[key], allWin = true, maxd = 0, best = -1;
        for (var i = 0; i < ss.length; i++) { var v = V[ss[i]]; if (!v) { allWin = false; continue; } if (v[0] === -1) { if (best < 0 || v[1] < best) best = v[1]; } if (v[0] !== 1) allWin = false; else if (v[1] > maxd) maxd = v[1]; }
        if (best >= 0) add.push([key, [1, best + 1]]); else if (allWin) add.push([key, [-1, maxd + 1]]);
      });
      add.forEach(function (a) { V[a[0]] = a[1]; changed = true; });
    }
    Object.keys(seen).forEach(function (key) { if (!V[key]) V[key] = [0, 0]; });
    return V;
  }
  // Every move for side c, with its exact result for c: r = 1 win, 0 draw, -1 loss; n = moves until the end with best play.
  function analyse(b, c) {
    var v = solve(), o = c === 'X' ? 'O' : 'X';
    var out = moves(b, c).map(function (m) { var x = won(m.b, c) ? [-1, 0] : (v[m.b + '|' + o] || [0, 0]); return { m: m, r: -x[0], n: x[1] + 1 }; });
    out.sort(function (a, z) { return z.r - a.r || (a.r === 1 ? a.n - z.n : z.n - a.n); });
    return out;
  }
  var api = { RULE: RULE, moves: moves, won: won, count: count, analyse: analyse, solve: solve, LINES: LINES, ADJ: ADJ };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.TerniEngine = api;

  var D = root.document, el = D.getElementById('terni'); if (!el) return;
  function $(s) { return el.querySelector(s); }
  var pref = { level: 2, hints: true, first: 'you', nc: true };
  try { var sv = JSON.parse(root.localStorage.getItem('trb-terni')); if (sv) for (var k in sv) pref[k] = sv[k]; } catch (e) { }
  function save() { try { root.localStorage.setItem('trb-terni', JSON.stringify(pref)); } catch (e) { } }
  var B, turn, me, sel, over, busy, an, st, score = { w: 0, l: 0 };
  el.innerHTML = '<div class="bg-top"><h1>Terni Lapilli</h1><select id="l-level" aria-label="Opponent"><option value="1">Opponent: easy</option><option value="2">Opponent: medium</option><option value="3">Opponent: perfect</option></select>' +
    '<select id="l-first" aria-label="Who starts"><option value="you">You start</option><option value="them">Opponent starts</option></select>' +
    '<select id="l-nc" aria-label="Opening rule"><option value="1">First pebble: not the centre</option><option value="0">First pebble: anywhere</option></select><button type="button" class="bg-btn" id="l-hint">💡 Move statistics</button><button type="button" class="bg-btn" id="l-new">New game</button></div>' +
    '<div class="bg-main"><div><div class="tl-wrap" id="l-board"></div><div class="bg-msg" id="l-msg"></div></div>' +
    '<div class="bg-side"><div class="bg-box" id="l-stats"></div><div class="bg-box" id="l-hbox"><h3>Your moves, best first</h3><ol class="bg-hints" id="l-hints"></ol>' +
    '<div class="bg-legend"><span><i class="sw q0"></i>wins</span><span><i class="sw q2"></i>draws</span><span><i class="sw q4"></i>loses</span></div>' +
    '<p class="bg-small">These are exact. The game has only a few thousand positions, so every one has been worked out to the end.</p></div>' +
    '<details class="bg-box bg-rules" id="l-rules"></details></div></div>';
  var XY = [[50, 50], [150, 50], [250, 50], [50, 150], [150, 150], [250, 150], [50, 250], [150, 250], [250, 250]], QC = { 1: '#1a8a4a', 0: '#e2b800', '-1': '#c0392b' }, QN = { 1: 0, 0: 2, '-1': 4 };
  function newGame() { RULE.nc = !!pref.nc; B = '.........'; me = pref.first === 'you' ? 'X' : 'O'; turn = 'X'; sel = -1; over = null; busy = false; st = { n: 0, kept: 0, slips: 0, last: null }; step(); }
  function step() {
    var other = turn === 'X' ? 'O' : 'X';
    if (won(B, other)) over = other === me ? 'win' : 'lose';
    else if (!moves(B, turn).length) over = turn === me ? 'lose' : 'win';
    if (over) { score[over === 'win' ? 'w' : 'l']++; an = null; return draw(); }
    an = turn === me ? analyse(B, me) : null; draw();
    if (turn !== me) { busy = true; setTimeout(reply, 550); }
  }
  function reply() {
    var a = analyse(B, turn), m = a[0].m, r = Math.random();
    if ((pref.level === 1 && r < 0.6) || (pref.level === 2 && r < 0.22)) m = a[Math.floor(Math.random() * a.length)].m;
    B = m.b; turn = me; busy = false; step();
  }
  function play(x) {
    st.n++; var best = an[0].r; if (x.r === best) st.kept++; else st.slips++; st.last = { r: x.r, best: best };
    B = x.m.b; sel = -1; turn = me === 'X' ? 'O' : 'X'; step();
  }
  function tap(i) {
    if (over || busy || turn !== me || !an) return;
    var placing = count(B, me) < 3, x;
    if (placing) { x = an.filter(function (y) { return y.m.t === i; })[0]; if (x) play(x); return; }
    if (sel >= 0) { x = an.filter(function (y) { return y.m.f === sel && y.m.t === i; })[0]; if (x) return play(x); }
    sel = B[i] === me && sel !== i ? i : -1; draw();
  }
  function txt(x) { return x.r === 1 ? 'wins in ' + x.n : x.r === 0 ? 'draw' : 'loses in ' + x.n; }
  function draw() {
    var h = '<svg viewBox="0 0 300 300" role="img" aria-label="Board"><rect width="300" height="300" rx="14" fill="#d9c7a0"/><g stroke="#6b4a2a" stroke-width="5" stroke-linecap="round" fill="none">' +
      '<rect x="50" y="50" width="200" height="200"/><path d="M150 50V250M50 150H250M50 50L250 250M250 50L50 250"/></g>', i, placing = !over && count(B, me) < 3;
    var by = {}; if (an && pref.hints) an.forEach(function (x) { var k = placing ? x.m.t : (sel >= 0 ? (x.m.f === sel ? x.m.t : null) : 's' + x.m.f); if (k != null && !(k in by)) by[k] = x; });
    var targets = {}; if (an && !placing && sel >= 0) an.forEach(function (x) { if (x.m.f === sel) targets[x.m.t] = 1; });
    for (i = 0; i < 9; i++) {
      var c = B[i], x = XY[i][0], y = XY[i][1], hint = by[i], src = by['s' + i];
      h += '<g class="tl-pt" data-i="' + i + '"><circle cx="' + x + '" cy="' + y + '" r="40" fill="transparent"/>';
      if (c === '.') h += '<circle cx="' + x + '" cy="' + y + '" r="' + (hint || targets[i] ? 22 : 9) + '" fill="' + (hint ? QC[hint.r] : targets[i] ? '#b8963e' : '#6b4a2a') + '"' + (hint || targets[i] ? ' opacity=".85"' : '') + '/>' + (hint ? '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">' + (hint.r === 0 ? '=' : hint.n) + '</text>' : '');
      else h += '<circle cx="' + x + '" cy="' + y + '" r="30" fill="' + (c === me ? '#f6efdc' : '#7a1f2b') + '" stroke="' + (i === sel ? '#f3dfa3' : src ? QC[src.r] : (c === me ? '#8a7a55' : '#3d0c14')) + '" stroke-width="' + (i === sel || src ? 7 : 3) + '"/><circle cx="' + x + '" cy="' + y + '" r="17" fill="none" stroke="' + (c === me ? '#c9b98f' : '#a8414e') + '" stroke-width="2"/>';
      h += '</g>';
    }
    $('#l-board').innerHTML = h + '</svg>';
    Array.prototype.forEach.call(el.querySelectorAll('.tl-pt'), function (g) { g.onclick = function () { tap(+g.dataset.i); }; });
    $('#l-msg').innerHTML = over ? (over === 'win' ? '<b class="la">Vicisti!</b> = You have won.' : '<b class="la">Victus es.</b> = You are beaten.') :
      turn !== me ? 'Your opponent is thinking…' : placing ? '<b class="la">Pone lapillum.</b> = Place a pebble. <i>(' + (3 - count(B, me)) + ' left)</i>' : '<b class="la">Move lapillum.</b> = Move a pebble' + (sel >= 0 ? ': now tap where it goes.' : ': tap one of yours.');
    var pos = an ? an[0] : null;
    $('#l-stats').innerHTML = '<h3>This game</h3><table>' + (pref.hints ? '<tr><td>With perfect play from here</td><td>' + (over ? '–' : pos ? (pos.r === 1 ? 'you win in ' + pos.n : pos.r === 0 ? 'a draw' : 'you lose in ' + pos.n) : '…') + '</td></tr>' +
      '<tr><td>Your moves that kept the best result</td><td>' + st.kept + ' of ' + st.n + '</td></tr><tr><td>Slips</td><td>' + st.slips + '</td></tr>' : '') +
      '<tr><td>Games won : lost (this visit)</td><td>' + score.w + ' : ' + score.l + '</td></tr></table>';
    var hl = $('#l-hints');
    if (pref.hints) hl.innerHTML = !an ? '<li>' + (over ? 'The game is over.' : 'Waiting…') + '</li>' : an.filter(function (x) { return sel < 0 || x.m.f === sel; }).map(function (x) {
      return '<li data-f="' + x.m.f + '" data-t="' + x.m.t + '"><i class="sw q' + QN[x.r] + '"></i><span>' + (x.m.f < 0 ? 'place on ' : NAMES[x.m.f] + ' → ') + NAMES[x.m.t] + '</span><b>' + txt(x) + '</b></li>'; }).join('');
    Array.prototype.forEach.call(hl.querySelectorAll('[data-t]'), function (li) { li.onclick = function () { var x = an && an.filter(function (y) { return y.m.f === +li.dataset.f && y.m.t === +li.dataset.t; })[0]; if (x && !busy && !over && turn === me) play(x); }; });
    $('#l-hint').classList.toggle('on', pref.hints); $('#l-hbox').hidden = !pref.hints;
  }
  var NAMES = ['top left', 'top', 'top right', 'left', 'centre', 'right', 'bottom left', 'bottom', 'bottom right'];
  $('#l-rules').innerHTML = '<summary>Rules and the history</summary>' +
    '<p>Each player has three pebbles. You are the pale ones.</p><ul><li><b>First, place.</b> Take turns putting one pebble on any empty point until all six are down.</li><li><b>Then, move.</b> Take turns sliding one of your pebbles along a line to the next point, if it is empty. The centre connects to every point; a corner connects to the centre and the two points beside it.</li><li><b>Three in a line wins</b>, across, down or through the centre, whether you get it by placing or by moving.</li><li>If you cannot move at all, you lose.</li></ul>' +
    '<h4>The move statistics</h4><p>With 💡 on, every point you could play shows what follows with perfect play on both sides: green wins (the number is how many moves it takes, counting both sides), yellow “=” is a draw, red loses. Unlike the chess and tabula figures, these are exact, because the whole game has been solved. If the first pebble may go anywhere, whoever starts wins by taking the centre. That is why the game is usually played with the centre closed for the first pebble, which is how it starts here; with that rule, perfect play is a draw.</p>' +
    '<h4>Words</h4><table><tbody><tr><td class="la">terni lapilli</td><td>three pebbles each</td></tr><tr><td class="la">lapillus</td><td>a little stone, a pebble</td></tr><tr><td class="la">pono, ponere</td><td>to place</td></tr><tr><td class="la">moveo, movere</td><td>to move</td></tr><tr><td class="la">vinco, vincere</td><td>to win</td></tr></tbody></table>' +
    '<h4>Is this an ancient game?</h4><p>Yes, and it is still played, as three men’s morris. Boards for it are scratched into the paving and steps of Roman buildings all over the empire. Ovid mentions it in the <i>Art of Love</i> (3.365–366):</p>' +
    '<p class="la" style="font-size:1.1rem">Parva tabella capit ternos utrimque lapillos,<br>in qua vicisse est continuasse suos.</p><p>“A little board takes three pebbles for each side; on it, to win is to have lined up your own.”</p><p>The modern name <i>terni lapilli</i> comes from that couplet. Noughts and crosses (tic-tac-toe) is its simpler descendant, without the moving.</p>';
  $('#l-level').value = pref.level; $('#l-first').value = pref.first; $('#l-nc').value = pref.nc ? '1' : '0';
  $('#l-nc').onchange = function () { pref.nc = this.value === '1'; save(); newGame(); };
  $('#l-level').onchange = function () { pref.level = +this.value; save(); };
  $('#l-first').onchange = function () { pref.first = this.value; save(); newGame(); };
  $('#l-hint').onclick = function () { pref.hints = !pref.hints; save(); draw(); };
  $('#l-new').onclick = newGame;
  root.__terni = { get B() { return B; }, tap: tap, get an() { return an; } };
  newGame();
})(typeof window !== 'undefined' ? window : this);
