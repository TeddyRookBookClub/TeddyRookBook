/* Tabula: backgammon in Roman dress. You are the pale pieces, moving from point 24 down to point 1. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tabula'), E = W.TabulaEngine; if (!root || !E) return;
  function $(s) { return root.querySelector(s); }
  var pref = { level: 2, hints: true };
  try { var sv = JSON.parse(W.localStorage.getItem('trb-tabula')); if (sv) for (var k in sv) pref[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem('trb-tabula', JSON.stringify(pref)); } catch (e) { } }
  var S, dice = null, left = [], opts = [], done = [], turnStart = null, sel = null, phase = 'roll', busy = false, over = null;
  var stat;
  function d6() { return 1 + Math.floor(Math.random() * 6); }
  root.innerHTML = '<div class="bg-top"><h1>Tabula</h1><select id="t-level" aria-label="Opponent"><option value="1">Opponent: easy</option><option value="2">Opponent: medium</option><option value="3">Opponent: hard</option></select>' +
    '<button type="button" class="bg-btn" id="t-hint">💡 Move statistics</button><button type="button" class="bg-btn" id="t-undo">↶ Take back</button><button type="button" class="bg-btn" id="t-new">New game</button></div>' +
    '<div class="bg-main"><div><div class="tb-wrap" id="t-board"></div><div class="bg-msg" id="t-msg"></div><p style="text-align:center"><button type="button" class="bg-btn pri" id="t-roll">🎲 Roll the dice</button></p></div>' +
    '<div class="bg-side"><div class="bg-box" id="t-stats"></div><div class="bg-box" id="t-hbox"><h3>Your choices for this roll, best first</h3><ol class="bg-hints" id="t-hints"></ol>' +
    '<div class="bg-legend"><span><i class="sw q0"></i>best</span><span><i class="sw q1"></i>good</span><span><i class="sw q2"></i>fair</span><span><i class="sw q3"></i>weak</span><span><i class="sw q4"></i>bad</span></div>' +
    '<p class="bg-small">The percentage is an estimate of your winning chances after that play, from the pip count, the checkers left open to a hit and the points you hold.</p></div>' +
    '<details class="bg-box bg-rules" id="t-rules"></details></div></div>';
  function qual(d) { return d <= 0.015 ? 0 : d <= 0.04 ? 1 : d <= 0.08 ? 2 : d <= 0.15 ? 3 : 4; }
  function newGame() { S = E.start(); dice = null; left = []; opts = []; done = []; sel = null; phase = 'roll'; busy = false; over = null; stat = { rolls: [[], []], hits: [0, 0], best: 0, plays: 0, lost: 0 }; draw(); }
  // ---------- my turn ----------
  function roll() {
    if (phase !== 'roll' || busy || over) return;
    dice = [d6(), d6()]; stat.rolls[0].push(dice); turnStart = S; done = []; sel = null;
    opts = E.rank(S, dice[0], dice[1]);
    var best = opts.length ? opts[0].w : 0; opts.forEach(function (o, n) { o.q = qual(best - o.w); o.n = n; });
    if (!opts.length) { phase = 'stuck'; draw(); return; }
    phase = 'move'; draw();
  }
  function live() { return opts.filter(function (o) { return done.every(function (st, i) { var x = o.steps[i]; return x && x.f === st.f && x.t === st.t && x.d === st.d; }); }); }
  function nextSteps() { // the single moves open to me now, each with the best outcome it can still lead to
    var m = {}, n = done.length;
    live().forEach(function (o) { var st = o.steps[n]; if (!st) return; var k = st.f + '>' + st.t + '>' + st.d; if (!m[k] || o.sc > m[k].o.sc) m[k] = { st: st, o: o }; });
    return Object.keys(m).map(function (k) { return m[k]; });
  }
  function tapPoint(i) { // i: 0..23, 24 = bar, -1 = bearing-off tray
    if (phase !== 'move' || busy) return;
    var ns = nextSteps();
    if (sel != null) {
      var c = ns.filter(function (x) { return x.st.f === sel && x.st.t === i; }).sort(function (a, b) { return b.o.sc - a.o.sc; })[0];
      if (c) return doStep(c.st);
    }
    sel = ns.some(function (x) { return x.st.f === i; }) && sel !== i ? i : null; draw();
  }
  function doStep(st) {
    S = E.apply(S, st); done.push(st); sel = null; if (st.hit) stat.hits[0]++;
    if (!nextSteps().length) endMyTurn(); else draw();
  }
  function endMyTurn() {
    var o = live()[0];
    if (o) { stat.plays++; if (o.n === 0) stat.best++; stat.lost += opts[0].w - o.w; stat.last = { n: o.n, of: opts.length, q: o.q }; }
    dice = null; opts = []; done = []; if (S.off === 15) { over = 'win'; phase = 'over'; return draw(); }
    phase = 'opp'; draw(); busy = true; setTimeout(oppTurn, 700);
  }
  function takeBack() { if (phase !== 'move' || !done.length) return; S = turnStart; done = []; sel = null; draw(); }
  // ---------- opponent ----------
  function oppTurn() {
    var f = E.flip(S), d = [d6(), d6()], r = E.rank(f, d[0], d[1]), pick = null;
    stat.rolls[1].push(d); dice = d;
    if (r.length) {
      if (pref.level === 1) pick = r[Math.min(r.length - 1, Math.floor(Math.random() * Math.max(1, Math.ceil(r.length / 2))))];
      else if (pref.level === 2) pick = r[0];
      else { // look one roll further: what is my best answer to each of the leading plays?
        var bestV = -1e9; r.slice(0, 6).forEach(function (c) {
          var me = E.flip(c.s), tot = 0, a, b;
          for (a = 1; a <= 6; a++) for (b = a; b <= 6; b++) { var rr = E.rank(me, a, b); tot += (rr.length ? rr[0].sc : E.evaluate(me)) * (a === b ? 1 : 2); }
          var v = -tot / 36; if (v > bestV) { bestV = v; pick = c; }
        });
      }
    }
    draw();
    var steps = pick ? pick.steps.slice() : [];
    (function go() {
      if (!steps.length) {
        setTimeout(function () { busy = false; dice = null; if (S.ooff === 15) { over = 'lose'; phase = 'over'; } else phase = 'roll'; draw(); }, pick ? 500 : 1300);
        return;
      }
      var st = steps.shift(), ff = E.flip(S); if (st.hit) stat.hits[1]++;
      S = E.flip(E.apply(ff, st)); draw(); setTimeout(go, 600);
    })();
    if (!pick) $('#t-msg').innerHTML = 'Zeno rolls ' + d[0] + ' and ' + d[1] + ' and cannot move.';
  }
  // ---------- drawing ----------
  var CW = 56, BW = 44, H = 520, TW = 12 * CW + BW + 70;
  function colX(i) { var c = i < 12 ? 11 - i : i - 12; return c * CW + (c >= 6 ? BW : 0); } // left edge of a point's column
  function draw() {
    var ns = phase === 'move' ? nextSteps() : [], srcQ = {}, dstQ = {}, h = '', i;
    ns.forEach(function (x) { if (!(x.st.f in srcQ) || x.o.q < srcQ[x.st.f].q) srcQ[x.st.f] = x.o; if (x.st.f === sel && (!(x.st.t in dstQ) || x.o.q < dstQ[x.st.t].q)) dstQ[x.st.t] = x.o; });
    var QC = ['#1a8a4a', '#8fbf3f', '#e2b800', '#e8862a', '#c0392b'];
    h += '<svg viewBox="0 0 ' + TW + ' ' + H + '" role="img" aria-label="Board"><rect width="' + TW + '" height="' + H + '" rx="10" fill="#6b4a2a"/><rect x="8" y="8" width="' + (12 * CW + BW) + '" height="' + (H - 16) + '" fill="#e9d9b5"/>' +
      '<rect x="' + (6 * CW + 8) + '" y="8" width="' + BW + '" height="' + (H - 16) + '" fill="#6b4a2a"/>';
    for (i = 0; i < 24; i++) {
      var x = colX(i) + 8, top = i >= 12, y0 = top ? 8 : H - 8, y1 = top ? 8 + 210 : H - 8 - 210, n = S.pts[i], cnt = Math.abs(n), mine = n > 0;
      var hl = sel != null && dstQ[i] ? QC[pref.hints ? dstQ[i].q : 0] : null;
      h += '<g class="tb-pt" data-i="' + i + '"><rect x="' + x + '" y="' + (top ? 8 : H / 2) + '" width="' + CW + '" height="' + (H / 2 - 8) + '" fill="transparent"/>' +
        '<polygon points="' + x + ',' + y0 + ' ' + (x + CW) + ',' + y0 + ' ' + (x + CW / 2) + ',' + y1 + '" fill="' + (hl || (i % 2 ? '#a8492f' : '#3f6b54')) + '"' + (hl ? ' stroke="#fff" stroke-width="2"' : '') + '/>' +
        '<text x="' + (x + CW / 2) + '" y="' + (top ? 8 + 228 : H - 8 - 218) + '" text-anchor="middle" font-size="12" fill="#6b4a2a">' + (i + 1) + '</text>';
      for (var k = 0; k < Math.min(cnt, 5); k++) {
        var cy = top ? 8 + 26 + k * 40 : H - 8 - 26 - k * 40, topOne = k === Math.min(cnt, 5) - 1;
        var ring = mine && topOne && phase === 'move' && sel == null && srcQ[i] && pref.hints ? QC[srcQ[i].q] : (mine && topOne && sel === i ? '#f3dfa3' : null);
        h += '<circle cx="' + (x + CW / 2) + '" cy="' + cy + '" r="24" fill="' + (mine ? '#f6efdc' : '#7a1f2b') + '" stroke="' + (ring || (mine ? '#8a7a55' : '#3d0c14')) + '" stroke-width="' + (ring ? 5 : 2) + '"/>' +
          '<circle cx="' + (x + CW / 2) + '" cy="' + cy + '" r="14" fill="none" stroke="' + (mine ? '#c9b98f' : '#a8414e') + '" stroke-width="1.5"/>';
        if (topOne && cnt > 5) h += '<text x="' + (x + CW / 2) + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + (mine ? '#3a2a16' : '#fff') + '">' + cnt + '</text>';
      }
      h += '</g>';
    }
    // bar
    var bx = 6 * CW + 8 + BW / 2;
    h += '<g class="tb-pt" data-i="24"><rect x="' + (6 * CW + 8) + '" y="8" width="' + BW + '" height="' + (H - 16) + '" fill="transparent"/>';
    for (i = 0; i < Math.min(S.bar, 4); i++) h += '<circle cx="' + bx + '" cy="' + (H / 2 + 40 + i * 30) + '" r="20" fill="#f6efdc" stroke="' + (phase === 'move' && srcQ[24] ? (sel === 24 ? '#f3dfa3' : pref.hints ? QC[srcQ[24].q] : '#8a7a55') : '#8a7a55') + '" stroke-width="4"/>';
    for (i = 0; i < Math.min(S.obar, 4); i++) h += '<circle cx="' + bx + '" cy="' + (H / 2 - 40 - i * 30) + '" r="20" fill="#7a1f2b" stroke="#3d0c14" stroke-width="2"/>';
    h += '</g>';
    // bearing-off tray
    var tx = 12 * CW + BW + 14, offHl = sel != null && dstQ[-1];
    h += '<g class="tb-pt" data-i="-1"><rect x="' + tx + '" y="8" width="50" height="' + (H - 16) + '" rx="6" fill="' + (offHl ? QC[pref.hints ? dstQ[-1].q : 0] : '#4f361d') + '"/>' +
      '<text x="' + (tx + 25) + '" y="' + (H - 40) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#f6efdc">' + S.off + '</text><text x="' + (tx + 25) + '" y="' + (H - 20) + '" text-anchor="middle" font-size="10" fill="#f6efdc">home</text>' +
      '<text x="' + (tx + 25) + '" y="50" text-anchor="middle" font-size="22" font-weight="700" fill="#e9a0b1">' + S.ooff + '</text><text x="' + (tx + 25) + '" y="68" text-anchor="middle" font-size="10" fill="#e9a0b1">Zeno</text></g>';
    // dice
    if (dice) {
      var used = done.map(function (s) { return s.d; }), show = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : dice.slice();
      show.forEach(function (d, n) { var u = used.indexOf(d); if (u >= 0) used.splice(u, 1); var dx = (phase === 'opp' ? 1.5 * CW : 7.5 * CW + BW) + n * 44 - (show.length > 2 ? 44 : 0) + 8;
        h += '<g opacity="' + (u >= 0 ? 0.35 : 1) + '"><rect x="' + dx + '" y="' + (H / 2 - 19) + '" width="38" height="38" rx="7" fill="#fbf6e6" stroke="#3a2a16" stroke-width="2"/><text x="' + (dx + 19) + '" y="' + (H / 2 + 8) + '" text-anchor="middle" font-size="24" font-weight="700" fill="#3a2a16">' + d + '</text></g>'; });
    }
    $('#t-board').innerHTML = h + '</svg>';
    Array.prototype.forEach.call(root.querySelectorAll('.tb-pt'), function (g) { g.onclick = function () { tapPoint(+g.dataset.i); }; });
    var msg = '';
    if (over) msg = over === 'win' ? '<b class="la">Vicisti!</b> = You have won' + (S.ooff === 0 ? ', and doubly: Zeno bore off nothing (a gammon).' : '.') : '<b class="la">Victus es.</b> = You are beaten' + (S.off === 0 ? ', and doubly: you bore off nothing (a gammon).' : '.');
    else if (phase === 'roll') msg = '<b class="la">Iace tesseras.</b> = Throw the dice.';
    else if (phase === 'stuck') msg = 'You rolled ' + dice[0] + ' and ' + dice[1] + '. <b class="la">Nihil movere potes.</b> = You cannot move anything.';
    else if (phase === 'move') msg = 'You rolled ' + dice[0] + ' and ' + dice[1] + (dice[0] === dice[1] ? ' (a double: four moves)' : '') + '. ' + (sel == null ? (S.bar ? 'Your checker on the bar must come in first: tap it.' : 'Tap one of your checkers.') : 'Now tap where it should go.');
    else if (phase === 'opp') msg = 'Zeno ' + (dice ? 'rolls ' + dice[0] + ' and ' + dice[1] + '.' : 'is rolling…');
    $('#t-msg').innerHTML = msg;
    var rb = $('#t-roll'); rb.hidden = !(phase === 'roll' || phase === 'stuck' || phase === 'over'); rb.textContent = phase === 'stuck' ? 'Pass the turn' : phase === 'over' ? 'Play again' : '🎲 Roll the dice';
    $('#t-undo').disabled = !(phase === 'move' && done.length); $('#t-hint').classList.toggle('on', pref.hints); $('#t-hbox').hidden = !pref.hints;
    stats(); hints();
  }
  function avg(a) { return a.length ? (a.reduce(function (s, d) { return s + d[0] + d[1]; }, 0) / a.length).toFixed(1) : '–'; }
  function dbl(a) { return a.filter(function (d) { return d[0] === d[1]; }).length; }
  function stats() {
    var p = E.pips(S), risk = (phase === 'roll' || phase === 'over') && !over ? E.riskNow(S) : null, cur = E.winChance((p[1] - p[0]) + (phase === 'roll' ? 4 : -4));
    $('#t-stats').innerHTML = '<h3>This game</h3><table><tr><td>Pips still to travel (you : Zeno)</td><td>' + p[0] + ' : ' + p[1] + '</td></tr>' +
      '<tr><td>Race</td><td>' + (p[0] === p[1] ? 'level' : (p[0] < p[1] ? 'you lead by ' + (p[1] - p[0]) : 'Zeno leads by ' + (p[0] - p[1]))) + '</td></tr>' +
      '<tr><td>Borne off (you : Zeno)</td><td>' + S.off + ' : ' + S.ooff + '</td></tr>' +
      '<tr><td>Hits made (you : Zeno)</td><td>' + stat.hits[0] + ' : ' + stat.hits[1] + '</td></tr>' +
      '<tr><td>Rolls so far, average total</td><td>' + avg(stat.rolls[0]) + ' : ' + avg(stat.rolls[1]) + '</td></tr>' +
      '<tr><td>Doubles thrown</td><td>' + dbl(stat.rolls[0]) + ' : ' + dbl(stat.rolls[1]) + '</td></tr>' +
      (risk != null ? '<tr><td>Chance Zeno hits you if he rolled now</td><td>' + Math.round(risk / 36 * 100) + '% <span class="bg-small">(' + risk + ' of 36 rolls)</span></td></tr>' : '') +
      (pref.hints ? '<tr><td>Times you chose the best play</td><td>' + stat.best + ' of ' + stat.plays + '</td></tr><tr><td>Average chances given up per turn</td><td>' + (stat.plays ? (stat.lost / stat.plays * 100).toFixed(1) + ' pts' : '–') + '</td></tr>' +
        (stat.last ? '<tr><td>Your last play</td><td><i class="sw q' + stat.last.q + '"></i> ' + (stat.last.n + 1) + ' of ' + stat.last.of + '</td></tr>' : '') : '') + '</table>' +
      '<p class="bg-small">An average roll moves 8⅙ pips. With two dice, a 7 is the likeliest total (6 rolls in 36); any one number shows on 11 rolls in 36.</p>';
  }
  function hints() {
    var el = $('#t-hints'); if (!pref.hints) return;
    if (phase !== 'move') { el.innerHTML = '<li>' + (phase === 'roll' ? 'Roll to see your choices.' : phase === 'opp' ? 'Zeno is playing.' : '–') + '</li>'; return; }
    var lv = live();
    el.innerHTML = lv.slice(0, 30).map(function (o) {
      return '<li data-n="' + o.n + '"><i class="sw q' + o.q + '"></i><span>' + o.steps.map(function (s) { return (s.f === 24 ? 'bar' : s.f + 1) + '→' + (s.t === -1 ? 'home' : s.t + 1) + (s.hit ? '✕' : ''); }).join(', ') + '</span><b>' + Math.round(o.w * 100) + '%</b></li>';
    }).join('') + (lv.length > 30 ? '<li class="bg-small">and ' + (lv.length - 30) + ' more</li>' : '');
    Array.prototype.forEach.call(el.querySelectorAll('[data-n]'), function (li) { li.onclick = function () {
      var o = opts[+li.dataset.n]; if (!o || phase !== 'move') return; var rest = o.steps.slice(done.length);
      rest.forEach(function (st) { S = E.apply(S, st); done.push(st); if (st.hit) stat.hits[0]++; }); sel = null; endMyTurn();
    }; });
  }
  $('#t-rules').innerHTML = '<summary>Rules and the history</summary>' +
    '<p>You play the pale checkers against Zeno’s dark red ones. Your checkers travel from point 24 round to point 1 (your home is the bottom right), and his travel the other way. The first to take all fifteen off the board wins.</p>' +
    '<h4>Moving</h4><ul><li>Roll two dice. Each die moves one checker that many points; one checker may use both. A double is played four times.</li><li>You may land on an empty point, a point you hold, or a point with just one enemy checker.</li><li>A point with two or more enemy checkers is closed: you cannot land there.</li><li>You must play both dice if you can. If only one can be played, it must be the larger when there is a choice.</li></ul>' +
    '<h4>Hitting</h4><ul><li>A single checker (a blot) can be hit. It goes to the bar in the middle.</li><li>A checker on the bar must come back in before anything else moves. It enters the far home board on the point shown by a die (a 1 enters on point 24, a 6 on point 19), if that point is not closed.</li></ul>' +
    '<h4>Bearing off</h4><ul><li>Once all your checkers are in your home board (points 1 to 6) you can take them off. A die takes off a checker from the point of that number.</li><li>If the number is higher than your farthest checker, take one off from the farthest point.</li><li>Winning before your opponent has borne off any checker counts double (a gammon).</li></ul>' +
    '<h4>The move statistics</h4><p>With 💡 on, every way of playing your roll is ranked. Rings on your checkers show how good the best play starting with that checker is; tap one and the points it can reach are coloured the same way, green best and red worst. The list ranks the complete plays, and you can tap a line to play it. The game panel shows the pip count (how far each side still has to travel) and the exact chance of being hit.</p>' +
    '<h4>Words</h4><table><tbody><tr><td class="la">tabula</td><td>board; also the name of the game</td></tr><tr><td class="la">alea</td><td>a game of dice; gambling</td></tr><tr><td class="la">tessera</td><td>a six-sided die</td></tr><tr><td class="la">calculus</td><td>a pebble; a playing piece</td></tr><tr><td class="la">iacio, iacere</td><td>to throw</td></tr></tbody></table>' +
    '<h4>Is this an ancient game?</h4><p>Its ancestor is. Romans played <i class="la">ludus duodecim scriptorum</i> (“the game of twelve lines”) and later <i class="la">tabula</i>, on a board of twenty-four points with fifteen checkers a side. A Greek epigram by Agathias describes an unlucky throw of the emperor Zeno, about AD 480, in enough detail to reconstruct the position. Tabula used three dice and both sides started with their checkers off the board, moving the same way. This game uses the modern backgammon rules that grew out of it, so that what you learn here works on any backgammon board. There is no doubling cube.</p>';
  $('#t-level').value = pref.level; $('#t-level').onchange = function () { pref.level = +this.value; save(); };
  $('#t-hint').onclick = function () { pref.hints = !pref.hints; save(); draw(); };
  $('#t-undo').onclick = takeBack; $('#t-new').onclick = newGame;
  $('#t-roll').onclick = function () { if (phase === 'over') return newGame(); if (phase === 'stuck') { dice = null; phase = 'opp'; draw(); busy = true; return setTimeout(oppTurn, 600); } roll(); };
  W.__tabula = { get S() { return S; }, get phase() { return phase; }, get opts() { return opts; }, roll: roll, tap: tapPoint };
  newGame();
})(window, document);
