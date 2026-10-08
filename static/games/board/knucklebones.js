/* Knucklebones (Latin tali, Greek astragaloi): four sheep's ankle bones, each landing on one of four sides worth
   1, 3, 4 or 6. Two games: Augustus's game, as Suetonius describes it, and "Venus hunt", a modern variant with a
   re-throw. Every probability shown is worked out exactly from the chances of each side. */
(function (W, D) {
  'use strict';
  var SIDES = [1, 3, 4, 6], P = { 1: 0.1, 3: 0.4, 4: 0.4, 6: 0.1 };
  function rnd() { try { var a = new Uint32Array(1); W.crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); } }
  function bone() { var r = rnd(); return r < 0.1 ? 1 : r < 0.5 ? 3 : r < 0.9 ? 4 : 6; }
  function isVenus(t) { return t.slice().sort().join() === '1,3,4,6'; }
  function isDog(t) { return t.every(function (x) { return x === 1; }); }
  function score(t) { return isVenus(t) ? 30 : isDog(t) ? 0 : t.reduce(function (a, b) { return a + b; }, 0); }
  // every outcome of throwing n bones, with its probability
  function outcomes(n) { var out = [[[], 1]]; for (var i = 0; i < n; i++) { var nx = []; out.forEach(function (o) { SIDES.forEach(function (s) { nx.push([o[0].concat([s]), o[1] * P[s]]); }); }); out = nx; } return out; }
  var OUT = [0, 1, 2, 3, 4].map(outcomes);
  // keeping the bones in `keep` (indexes) and throwing the rest again: chance of Venus and expected score
  function keepStats(t, keep) {
    var kept = keep.map(function (i) { return t[i]; }), v = 0, e = 0;
    OUT[4 - keep.length].forEach(function (o) { var full = kept.concat(o[0]); if (isVenus(full)) v += o[1]; e += o[1] * score(full); });
    return { venus: v, exp: e };
  }
  function allKeeps(t) { // every subset of the four bones, best expected score first
    var out = [];
    for (var m = 0; m < 16; m++) { var k = []; for (var i = 0; i < 4; i++) if (m & (1 << i)) k.push(i); var s = keepStats(t, k); s.keep = k; s.m = m; out.push(s); }
    // the same kept values give the same result: keep one of each
    var seen = {}; out = out.filter(function (s) { var key = s.keep.map(function (i) { return t[i]; }).sort().join(); if (seen[key]) return false; seen[key] = 1; return true; });
    out.sort(function (a, b) { return b.exp - a.exp || b.venus - a.venus; });
    return out;
  }
  W.KnuckleEngine = { P: P, score: score, isVenus: isVenus, keepStats: keepStats, allKeeps: allKeeps, outcomes: outcomes };

  var root = D.getElementById('knuckle'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  var pref = { game: 'venus', mode: 'cpu', hints: true, stats: { w: 0, l: 0, d: 0 } };
  try { var sv = JSON.parse(W.localStorage.getItem('trb-knucklebones')); if (sv) for (var k in sv) pref[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem('trb-knucklebones', JSON.stringify(pref)); } catch (e) { } }
  var G = null, busy = false;
  function two() { return pref.mode === 'two'; }
  function name(p) { return two() ? 'Player ' + (p + 1) : p === 0 ? 'You' : 'Your opponent'; }
  function cpuTurn() { return !two() && G && G.turn === 1; }
  root.innerHTML = '<div class="bg-top"><h1>Knucklebones</h1><select id="k-game" aria-label="Game"><option value="venus">Venus hunt (with a re-throw)</option><option value="aug">Augustus’s game (the pot)</option></select>' +
    '<select id="k-mode" aria-label="Players"><option value="cpu">Against the computer</option><option value="two">Two players, one device</option></select><button type="button" class="bg-btn" id="k-hint">💡 Statistics</button><button type="button" class="bg-btn" id="k-new">New game</button></div>' +
    '<div class="bg-main"><div><div class="kb-table" id="k-table"></div><div class="bg-msg" id="k-msg"></div><p class="kb-acts" id="k-acts"></p></div>' +
    '<div class="bg-side"><div class="bg-box" id="k-stats"></div><div class="bg-box" id="k-hbox"></div><details class="bg-box bg-rules" id="k-rules"></details></div></div>';
  function newGame() {
    G = { game: pref.game, turn: 0, round: 1, rounds: 5, sc: [0, 0], purse: [12, 12], pot: 0, t: null, phase: 'throw', keep: {}, log: [], venus: [0, 0], throws: [0, 0], rethrown: false };
    busy = false; draw(); if (cpuTurn()) cpuPlay();
  }
  function throwAll() { G.t = [bone(), bone(), bone(), bone()]; G.throws[G.turn]++; G.keep = {}; }
  function endTurn(txt) {
    G.log.unshift(txt); if (G.log.length > 8) G.log.pop();
    if (G.game === 'venus') { if (G.turn === 1) G.round++; if (G.round > G.rounds) return finish(); }
    else { if (G.purse[0] <= 0 || G.purse[1] <= 0 || (G.turn === 1 && G.round >= 10)) return finish(); if (G.turn === 1) G.round++; }
    G.turn = 1 - G.turn; G.t = null; G.phase = 'throw'; G.rethrown = false; draw();
    if (cpuTurn()) cpuPlay();
  }
  function finish() {
    G.phase = 'over'; var a = G.game === 'venus' ? G.sc : G.purse, r = a[0] > a[1] ? 'w' : a[0] < a[1] ? 'l' : 'd';
    if (!two()) { pref.stats[r]++; save(); }
    G.result = r; G.t = G.t || null; draw();
  }
  function settleAug() { // Suetonius: each dog (1) or six puts a denarius in the pot; a Venus takes the pot
    var t = G.t, p = G.turn, txt = name(p) + ' threw ' + t.join(', ');
    if (isVenus(t)) { G.venus[p]++; G.purse[p] += G.pot; txt += ': Venus! Takes the pot of ' + G.pot + '.'; G.pot = 0; }
    else { var n = t.filter(function (x) { return x === 1 || x === 6; }).length, pay = Math.min(n, G.purse[p]); G.purse[p] -= pay; G.pot += pay; txt += n ? ': ' + n + ' dog' + (n > 1 ? 's and sixes' : ' or six') + ', pays ' + pay + ' into the pot.' : ': nothing to pay.'; }
    return txt;
  }
  function act(a) {
    if (busy || G.phase === 'over') return;
    if (a === 'throw' && G.phase === 'throw') {
      throwAll();
      if (G.game === 'aug') { G.phase = 'shown'; draw(); var txt = settleAug(); busy = true; setTimeout(function () { busy = false; endTurn(txt); }, cpuTurn() ? 1300 : 1800); return; }
      G.phase = 'choose'; draw(); return;
    }
    if (G.phase === 'choose' && (a === 'stand' || a === 'rethrow')) {
      if (a === 'rethrow') { var keep = Object.keys(G.keep).map(Number); if (keep.length === 4) a = 'stand'; else { G.t = G.t.map(function (x, i) { return G.keep[i] ? x : bone(); }); G.rethrown = true; } }
      var s = score(G.t); G.sc[G.turn] += s; if (isVenus(G.t)) G.venus[G.turn]++;
      var txt2 = name(G.turn) + (G.rethrown ? ' threw again and finished with ' : ' kept ') + G.t.join(', ') + ' = ' + (isVenus(G.t) ? 'Venus, 30 points' : isDog(G.t) ? 'the Dog, 0 points' : s + ' points') + '.';
      G.phase = 'shown'; draw(); busy = true; setTimeout(function () { busy = false; endTurn(txt2); }, cpuTurn() ? 1300 : 1400);
    }
  }
  function cpuPlay() {
    busy = true;
    setTimeout(function () {
      busy = false; act('throw');
      if (G.game === 'venus' && G.phase === 'choose') {
        busy = true;
        setTimeout(function () { var best = allKeeps(G.t)[0]; G.keep = {}; best.keep.forEach(function (i) { G.keep[i] = 1; }); draw(); setTimeout(function () { busy = false; act(best.keep.length === 4 ? 'stand' : 'rethrow'); }, 700); }, 800);
      }
    }, 700);
  }
  var FACE = { 1: 'canis', 3: '3', 4: '4', 6: 'senio' };
  function boneSVG(v, kept, i) {
    var lab = v === 1 ? '1' : v === 6 ? '6' : String(v), shape = v === 1 || v === 6 ? 'M14 30C8 18 14 6 30 8C46 10 54 22 48 34C42 46 22 46 14 30Z' : 'M10 26C8 14 20 6 32 8C46 10 56 18 52 30C48 42 30 46 20 42C14 40 11 33 10 26Z';
    return '<button type="button" class="kb-bone' + (kept ? ' kept' : '') + '" data-b="' + i + '" aria-pressed="' + !!kept + '" aria-label="Bone showing ' + v + (kept ? ', kept' : '') + '"><svg viewBox="0 0 60 50"><path d="' + shape + '" fill="#efe3c6" stroke="#8a6a3a" stroke-width="2.5"/><path d="M20 22C26 18 34 18 40 24" fill="none" stroke="#c9b48a" stroke-width="2"/><text x="31" y="33" text-anchor="middle">' + lab + '</text></svg><small>' + FACE[v] + '</small></button>';
  }
  function pct(x) { return x >= 0.995 ? '100%' : x < 0.0005 && x > 0 ? '<0.1%' : (Math.round(x * 1000) / 10) + '%'; }
  function draw() {
    var who = name(G.turn), t = G.t;
    $('#k-table').innerHTML = (t ? '<div class="kb-bones">' + t.map(function (v, i) { return boneSVG(v, G.keep[i], i); }).join('') + '</div>' : '<div class="kb-bones kb-empty">' + [0, 1, 2, 3].map(function () { return '<span class="kb-ghost"></span>'; }).join('') + '</div>') +
      (G.game === 'aug' ? '<div class="kb-pot">Pot: <b>' + G.pot + '</b> denarii</div>' : '');
    root.querySelectorAll('.kb-bone').forEach(function (b) { b.onclick = function () { if (G.phase !== 'choose' || cpuTurn() || busy) return; var i = +b.dataset.b; if (G.keep[i]) delete G.keep[i]; else G.keep[i] = 1; draw(); }; });
    var msg;
    if (G.phase === 'over') msg = two() ? (G.result === 'd' ? 'A tie!' : '<b>' + name(G.result === 'w' ? 0 : 1) + ' wins!</b>') : G.result === 'w' ? '<b class="la">Vicisti!</b> = You have won.' : G.result === 'd' ? '<b class="la">Pares estis.</b> = A tie.' : '<b class="la">Victus es.</b> = You are beaten.';
    else if (cpuTurn()) msg = 'Your opponent is throwing…';
    else if (G.phase === 'throw') msg = '<b class="la">Iace talos!</b> = Throw the bones! <i>(' + who + ', round ' + G.round + (G.game === 'venus' ? ' of ' + G.rounds : '') + ')</i>';
    else if (G.phase === 'choose') msg = isVenus(t) ? '<b>Venus!</b> All four sides different: the best throw. Keep it.' : 'Tap the bones you want to keep, then throw the others again once, or keep all four.';
    else msg = G.log[0] || '';
    if (G.phase === 'shown' && G.game === 'aug' && t) msg = name(G.turn) + ' threw ' + t.join(', ') + (isVenus(t) ? ': <b>Venus!</b>' : '');
    $('#k-msg').innerHTML = msg;
    var acts = '';
    if (G.phase === 'over') acts = '<button type="button" class="bg-btn pri" data-a="new">Play again</button>';
    else if (!cpuTurn() && G.phase === 'throw') acts = '<button type="button" class="bg-btn pri" data-a="throw">🦴 Throw the bones</button>';
    else if (!cpuTurn() && G.phase === 'choose') { var nk = Object.keys(G.keep).length; acts = '<button type="button" class="bg-btn" data-a="stand">Keep all four</button> <button type="button" class="bg-btn pri" data-a="rethrow"' + (nk === 4 ? ' disabled' : '') + '>Throw the other ' + (4 - nk) + ' again</button>'; }
    $('#k-acts').innerHTML = acts;
    root.querySelectorAll('[data-a]').forEach(function (b) { b.onclick = function () { if (b.dataset.a === 'new') return newGame(); act(b.dataset.a); }; });
    // statistics
    var s = '<h3>This game</h3><table>';
    if (G.game === 'venus') s += '<tr><td>Score, ' + name(0).toLowerCase() + ' : ' + name(1).toLowerCase() + '</td><td>' + G.sc[0] + ' : ' + G.sc[1] + '</td></tr><tr><td>Round</td><td>' + Math.min(G.round, G.rounds) + ' of ' + G.rounds + '</td></tr>';
    else s += '<tr><td>Denarii, ' + name(0).toLowerCase() + ' : ' + name(1).toLowerCase() + '</td><td>' + G.purse[0] + ' : ' + G.purse[1] + '</td></tr><tr><td>In the pot</td><td>' + G.pot + '</td></tr><tr><td>Round</td><td>' + Math.min(G.round, 10) + ' of 10</td></tr>';
    s += '<tr><td>Venus throws</td><td>' + G.venus[0] + ' : ' + G.venus[1] + '</td></tr>' + (!two() ? '<tr><td>Your record (won, tied, lost)</td><td>' + pref.stats.w + ', ' + pref.stats.d + ', ' + pref.stats.l + '</td></tr>' : '') + '</table>';
    s += '<p class="bg-small">' + G.log.slice(0, 4).map(function (x) { return x.replace(/</g, '&lt;'); }).join('<br>') + '</p>';
    $('#k-stats').innerHTML = s;
    var hb = $('#k-hbox');
    if (!pref.hints) hb.hidden = true;
    else {
      hb.hidden = false;
      if (G.game === 'venus' && G.phase === 'choose' && t && !cpuTurn()) {
        var ks = allKeeps(t), best = ks[0].exp, cur = keepStats(t, Object.keys(G.keep).map(Number));
        hb.innerHTML = '<h3>What to keep, best first</h3><p class="bg-small">Your choice now: chance of Venus <b>' + pct(cur.venus) + '</b>, average score <b>' + cur.exp.toFixed(1) + '</b>.</p><ol class="bg-hints">' +
          ks.slice(0, 8).map(function (k) { var d = best - k.exp, q = d < 0.05 ? 0 : d < 0.5 ? 1 : d < 1.2 ? 2 : d < 2.5 ? 3 : 4; return '<li data-m="' + k.m + '"><i class="sw q' + q + '"></i><span>' + (k.keep.length === 4 ? 'keep all four' : k.keep.length ? 'keep ' + k.keep.map(function (i) { return t[i]; }).join(', ') : 'throw all four again') + '</span><b>' + k.exp.toFixed(1) + '</b></li>'; }).join('') + '</ol><p class="bg-small">The number is the average score that choice gives; exact, from the chance of each side.</p>';
        hb.querySelectorAll('[data-m]').forEach(function (li) { li.onclick = function () { var m = +li.dataset.m; G.keep = {}; for (var i = 0; i < 4; i++) if (m & (1 << i)) G.keep[i] = 1; draw(); }; });
      } else {
        var v = 24 * P[1] * P[3] * P[4] * P[6], dogP = Math.pow(P[1], 4), none = Math.pow(0.8, 4), ev = 0; [0, 1, 2, 3, 4].forEach(function (n) { var c = [1, 4, 6, 4, 1][n]; ev += n * c * Math.pow(0.2, n) * Math.pow(0.8, 4 - n); });
        hb.innerHTML = '<h3>The odds of one throw</h3><table><tr><td>Venus (1, 3, 4 and 6)</td><td>' + pct(v) + '</td></tr><tr><td>The Dog (four 1s)</td><td>' + pct(dogP) + '</td></tr>' +
          (G.game === 'aug' ? '<tr><td>No 1 or 6 at all (pay nothing)</td><td>' + pct(none) + '</td></tr><tr><td>Average paid per throw</td><td>' + ev.toFixed(2) + ' denarii</td></tr>' : '<tr><td>Average score, keeping the first throw</td><td>' + (OUT[4].reduce(function (a, o) { return a + o[1] * score(o[0]); }, 0)).toFixed(1) + '</td></tr>') +
          '</table><p class="bg-small">Each bone is taken to land on 3 or 4 four times in ten each, and on 1 or 6 once in ten each, roughly what real sheep’s knucklebones do. Real bones vary.</p>';
      }
    }
    $('#k-hint').classList.toggle('on', pref.hints);
  }
  $('#k-rules').innerHTML = '<summary>Rules and the history</summary>' +
    '<p>Each knucklebone lands on one of four long sides, worth <b>1</b>, <b>3</b>, <b>4</b> or <b>6</b>. The broad sides, 3 and 4, come up most often. Throwing all four sides different (1, 3, 4, 6) is the <b>Venus</b>, the best throw; four 1s is the <b>Dog</b>.</p>' +
    '<h4>Venus hunt <small>(a modern variant)</small></h4><ul><li>Five rounds each. Throw all four bones, then either keep them or keep some and throw the rest again, once.</li><li>Your score for the round is the total of the four sides; a Venus scores 30, more than any total; the Dog scores 0.</li><li>Highest total after five rounds wins.</li></ul>' +
    '<h4>Augustus’s game <small>(as Suetonius describes it)</small></h4><ul><li>Each player starts with 12 denarii. Take turns throwing the four bones.</li><li>For every 1 (the Dog) and every 6 you throw, put one denarius into the pot.</li><li>Throw a Venus and you take the whole pot.</li><li>After ten rounds each, or when someone runs out, the richer player wins.</li></ul>' +
    '<p>Suetonius (<i>Life of Augustus</i> 71) quotes a letter in which the emperor describes playing this way with friends over dinner. This game is pure chance; the statistics show the odds.</p>' +
    '<h4>Words</h4><table><tbody><tr><td class="la">talus, tali</td><td>a knucklebone (Latin)</td></tr><tr><td class="gr">ἀστράγαλος</td><td>astrágalos, a knucklebone (classical Greek, not New Testament)</td></tr><tr><td class="la">Venus</td><td>the best throw, all four sides different</td></tr><tr><td class="la">canis</td><td>the dog: a 1, and the worst throw of four 1s</td></tr><tr><td class="la">senio</td><td>the six</td></tr><tr><td class="la">iacio, iacere</td><td>to throw (<span class="la">iace talos!</span> = throw the bones!)</td></tr><tr><td class="la">denarius</td><td>a silver coin</td></tr></tbody></table>' +
    '<h4>The history</h4><p>Knucklebones are among the oldest gaming pieces in the world, found in graves and sanctuaries across the ancient Mediterranean, and they were also copied in bronze, glass and stone. Children played catching games with them; adults gambled with them like dice. A Roman throw was named by the sides that came up, and the Venus was proverbially the lucky one.</p>';
  $('#k-game').value = pref.game; $('#k-mode').value = pref.mode;
  $('#k-game').onchange = function () { pref.game = this.value; save(); newGame(); };
  $('#k-mode').onchange = function () { pref.mode = this.value; save(); newGame(); };
  $('#k-hint').onclick = function () { pref.hints = !pref.hints; save(); draw(); };
  $('#k-new').onclick = newGame;
  W.__kb = { get G() { return G; }, act: act, newGame: newGame };
  newGame();
})(window, document);
