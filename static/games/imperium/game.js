/* Imperium: a conquest game on maps of the Roman and Greek worlds, with optional Latin / Greek along the way. */
(function (W, D) {
  'use strict';
  var I = W.IMPERIUM, MAPS = W.IMPERIUM_MAPS, root = D.getElementById('imperium');
  if (!root || !I || !MAPS) return;
  var $ = function (s, r) { return (r || root).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function mix(hex, base, k) { // blend two #rrggbb colours
    var a = parseInt(hex.slice(1), 16), b = parseInt(base.slice(1), 16), o = '#';
    [16, 8, 0].forEach(function (s) { var v = Math.round(((a >> s) & 255) * k + ((b >> s) & 255) * (1 - k)); o += ('0' + v.toString(16)).slice(-2); });
    return o;
  }
  var SAVE = 'trb-imperium-v1', PREF = 'trb-imperium-prefs';
  var NEUTRAL = '#b9ae93';
  var prefs = { sc: 'italia', fac: null, opp: 3, diff: 'normal', start: 'hist', lang: 'both', quiz: true, fast: false };
  try { var sp = JSON.parse(W.localStorage.getItem(PREF)); if (sp) for (var k in sp) prefs[k] = sp[k]; } catch (e) { }
  function normLang(v) { return v === true ? 'both' : v === false ? 'en' : (v === 'x' || v === 'en' ? v : 'both'); }
  prefs.lang = normLang(prefs.lang);
  function savePrefs() { try { W.localStorage.setItem(PREF, JSON.stringify(prefs)); } catch (e) { } }

  // ------------------------------------------------------------------ setup screen
  function scen(id) { return I.SCENARIOS.filter(function (s) { return s.id === id; })[0] || I.SCENARIOS[0]; }
  function setup() {
    var sc = scen(prefs.sc); prefs.sc = sc.id;
    if (!sc.factions.some(function (f) { return f.id === prefs.fac; })) prefs.fac = sc.factions[0].id;
    var maxOpp = Math.min(5, sc.factions.length - 1); if (prefs.opp > maxOpp) prefs.opp = maxOpp; if (prefs.opp < 1) prefs.opp = 1;
    var T = I.TEXT[sc.lang], saved = null;
    try { saved = JSON.parse(W.localStorage.getItem(SAVE)); } catch (e) { }
    var h = '<div class="im-setup">' +
      '<header class="im-head"><div><h1>Imperium</h1><p>Conquer the ancient world, one province at a time. Choose a war, pick your side, and learn a little Latin or Greek along the way (or switch that off and just play).</p></div></header>' +
      (saved ? '<p class="im-resume"><button type="button" class="im-btn pri" data-act="resume">Continue your saved game</button> <span>' + esc(scen(saved.sc).title) + ' · turn ' + saved.round + '</span></p>' : '') +
      '<h2>1 · Choose a war</h2><div class="im-scens">';
    ['Rome', 'Greece'].forEach(function (side) {
      h += '<div class="im-grp"><h3>' + (side === 'Rome' ? 'Rome <small>played in Latin</small>' : 'Greece <small>played in Greek</small>') + '</h3>';
      I.SCENARIOS.filter(function (s) { return s.side === side; }).forEach(function (s) {
        h += '<button type="button" class="im-scen' + (s.id === sc.id ? ' on' : '') + '" data-sc="' + s.id + '"><b class="' + (s.lang === 'gr' ? 'grc' : 'lat') + '">' + esc(s.title) + '</b><span>' + esc(s.sub) + ' · ' + esc(s.date) + '</span><small>' +
          Object.keys(MAPS[s.map].terr).length + ' territories</small></button>';
      });
      h += '</div>';
    });
    h += '</div><p class="im-blurb">' + esc(sc.blurb) + '</p>' +
      '<h2>2 · Choose your side</h2><div class="im-facs">' + sc.factions.map(function (f) {
        return '<button type="button" class="im-fac' + (f.id === prefs.fac ? ' on' : '') + '" data-fac="' + f.id + '"><i style="background:' + f.color + '"></i><b>' + esc(f.leader || f.en) + '</b><span>' + esc(f.leader ? f.en : 'no leader recorded') + ' · <span class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '">' + esc(f.name) + '</span></span><small>' + esc(f.note) + '</small></button>';
      }).join('') + '</div>' +
      '<h2>3 · Set up the game</h2><div class="im-opts">' +
      opt('Opponents', 'opp', range(1, maxOpp).map(function (n) { return [n, n]; })) +
      opt('Difficulty', 'diff', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']]) +
      opt('Starting positions', 'start', [['hist', 'Historical'], ['rand', 'Random deal'], ['pick', 'I choose mine']]) +
      opt('Language of the map and the story', 'lang', [['x', T.langName], ['both', T.langName + ' + English'], ['en', 'English']]) +
      opt('Word challenges', 'quiz', [[true, 'On (can be skipped)'], [false, 'Off']]) +
      opt('Computer’s moves', 'fast', [[false, 'Normal speed'], [true, 'Fast']]) +
      '</div><p class="im-note">' + startNote() + '</p>' +
      '<p><button type="button" class="im-btn pri big" data-act="start">Start the war</button></p>' + helpHTML(sc) + '</div>';
    root.innerHTML = h;
    function opt(label, key, vals) {
      return '<div class="im-opt"><span>' + esc(label) + '</span><div class="im-seg">' + vals.map(function (v) { return '<button type="button" data-k="' + key + '" data-v="' + v[0] + '"' + (String(prefs[key]) === String(v[0]) ? ' class="on"' : '') + '>' + esc(v[1]) + '</button>'; }).join('') + '</div></div>';
    }
    function startNote() {
      return { hist: '<b>Historical:</b> each side starts in its own homeland. The other lands are independent and must be conquered.', rand: '<b>Random deal:</b> the whole map is dealt out among the players.', pick: '<b>I choose mine:</b> you and the computer take turns claiming territories, then you place your soldiers.' }[prefs.start];
    }
    $$('[data-sc]').forEach(function (b) { b.onclick = function () { prefs.sc = b.dataset.sc; savePrefs(); setup(); }; });
    $$('[data-fac]').forEach(function (b) { b.onclick = function () { prefs.fac = b.dataset.fac; savePrefs(); setup(); }; });
    $$('[data-k]').forEach(function (b) { b.onclick = function () { var v = b.dataset.v; prefs[b.dataset.k] = v === 'true' ? true : v === 'false' ? false : /^\d+$/.test(v) ? +v : v; savePrefs(); setup(); }; });
    $('[data-act="start"]').onclick = function () { newGame(); };
    var rs = $('[data-act="resume"]'); if (rs) rs.onclick = function () { resume(saved); };
  }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function helpHTML(sc) {
    var T = I.TEXT[sc.lang];
    return '<details class="im-help"><summary>How to play</summary><ol>' +
      '<li><b>Goal:</b> defeat every rival. Independent (grey) lands don’t have to be taken, but they count towards your reinforcements.</li>' +
      '<li><b>Each turn has three steps.</b> <i>' + T.phasesEn[0] + '</i>: place your new soldiers (one for every three territories, at least three, plus a bonus for holding a whole region). <i>' + T.phasesEn[1] + '</i>: attack neighbouring lands as often as you like. <i>' + T.phasesEn[2] + '</i>: make one move of soldiers between your own connected lands.</li>' +
      '<li><b>Battles</b> are settled with dice. The attacker rolls up to three and the defender up to two; the highest dice are compared, then the next highest, and the defender wins ties. Roll one exchange at a time, or press <i>Roll to the end</i> to keep rolling until you win or have one soldier left. One soldier always stays behind.</li>' +
      '<li><b>The dice</b> are the six-sided cubes the ancients used, called <i>tesserae</i> in Latin and <i>κύβοι</i> in Greek. Like ours, opposite faces add up to seven.</li>' +
      '<li><b>Spoils:</b> if you take at least one territory in a turn you win a word card. Three of a kind, or one of each kind, can be traded for extra soldiers at the start of a turn.</li>' +
      '<li><b>Learning is optional.</b> The map, the turn steps and the story of the war can appear in ' + T.langName + ', in English, or in both. The three buttons at the top of the game switch between them at any time. With word challenges on, each new card asks what its word means: a right answer earns one extra soldier, and you can always skip. Both can be switched off here or during the game.</li>' +
      '<li><b>Sea routes</b> are the dashed lines. Territories joined by one count as neighbours.</li>' +
      '<li><b>History:</b> the sides, their leaders and their homelands follow the sources where a leader is known. Alliances are not part of the game, so every side fights for itself.</li></ol></details>';
  }

  // ------------------------------------------------------------------ game state
  var S = null, sc, map, NM, T, ADJ, REG, busy = false, ui = { sel: null, tgt: null, amt: 1 };
  function facOf(p) { return sc.factions[S.players[p].fi]; }
  function vb(f, s, pl) { return f.en + ' ' + (/^The .*s$/.test(f.en) ? pl : s) + ' '; } // "The Samnites attack" / "Rome attacks"
  function X() { return S.lang !== 'en'; } function B() { return S.lang === 'both'; } // show the ancient language / show both
  function tname(id) { return X() ? NM[id].n : NM[id].en; }
  function terrs() { return Object.keys(map.terr); }
  function owned(p) { return terrs().filter(function (t) { return S.own[t] === p; }); }
  function load(scId) {
    sc = scen(scId); map = MAPS[sc.map]; NM = I.NAMES[sc.map]; T = I.TEXT[sc.lang]; REG = I.REGIONS[sc.map];
    ADJ = {}; terrs().forEach(function (t) { ADJ[t] = []; });
    map.adj.concat(map.links).forEach(function (e) { if (ADJ[e[0]].indexOf(e[1]) < 0) { ADJ[e[0]].push(e[1]); ADJ[e[1]].push(e[0]); } });
  }
  function newGame() {
    load(prefs.sc);
    var me = sc.factions.filter(function (f) { return f.id === prefs.fac; })[0];
    var opp = sc.order.filter(function (id) { return id !== me.id; }).slice(0, prefs.opp);
    var facs = [me.id].concat(opp);
    S = { sc: sc.id, lang: normLang(prefs.lang), quiz: !!prefs.quiz, fast: !!prefs.fast, diff: prefs.diff, round: 1, turn: 0, phase: 'reinforce', pool: 0, own: {}, arm: {}, log: [], deck: [], took: false, moved: false,
      players: facs.map(function (id, i) { return { fi: sc.factions.map(function (f) { return f.id; }).indexOf(id), human: i === 0, alive: true, cards: [], bonus: 0 }; }) };
    var all = terrs(), nP = S.players.length;
    all.forEach(function (t) { S.own[t] = -1; S.arm[t] = 2; });
    if (prefs.start === 'hist') {
      var maxHome = Math.max.apply(null, S.players.map(function (p, i) { return facOf(i).home.length; })), tot = Math.max(9, maxHome * 3);
      sc.factions.forEach(function (f) { f.home.forEach(function (t) { S.arm[t] = 3; }); });
      S.players.forEach(function (p, i) {
        var hs = facOf(i).home; hs.forEach(function (t) { S.own[t] = i; S.arm[t] = 0; });
        for (var n = 0; n < tot; n++) S.arm[hs[n % hs.length]]++;
      });
      begin();
    } else if (prefs.start === 'rand') {
      shuffle(all).forEach(function (t, n) { S.own[t] = n % nP; S.arm[t] = 1; });
      S.players.forEach(function (p, i) { var mine = owned(i), extra = Math.round(all.length * 1.3 / nP); for (var n = 0; n < extra; n++) S.arm[mine[rnd(mine.length)]]++; });
      begin();
    } else {
      all.forEach(function (t) { S.arm[t] = 0; });
      S.phase = 'claim'; S.turn = 0; draw(); say('Claim a territory. You and your rivals take turns until the map is full.');
    }
  }
  function begin() { S.phase = 'reinforce'; S.turn = 0; S.round = 1; draw(); startTurn(); }

  // ------------------------------------------------------------------ rendering
  function draw() {
    var names = terrs();
    var svg = '<svg id="im-map" viewBox="0 0 ' + map.w + ' ' + map.h + '" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="im-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="7" height="7" fill="#e3dac2"/><line x1="0" y1="0" x2="0" y2="7" stroke="#cdc2a4" stroke-width="2"/></pattern>' +
      '<radialGradient id="im-sea" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#a9cbd9"/><stop offset="1" stop-color="#7fa9bd"/></radialGradient></defs>' +
      '<rect width="' + map.w + '" height="' + map.h + '" fill="url(#im-sea)"/><path d="' + map.wild + '" fill="url(#im-hatch)" fill-rule="evenodd" stroke="#8a7a58" stroke-width=".7"/><g id="im-links">' +
      map.links.map(function (l) { var a = map.terr[l[0]], b = map.terr[l[1]]; return '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>'; }).join('') + '</g><g id="im-terrs">' +
      names.map(function (t) { return '<path class="im-t" data-t="' + t + '" d="' + map.terr[t].d + '" fill-rule="evenodd"/>'; }).join('') + '</g><g id="im-arrow"></g><g id="im-tokens">' +
      names.map(function (t) { var m = map.terr[t]; return '<g class="im-tok" data-t="' + t + '" transform="translate(' + m.x + ' ' + m.y + ')"><text class="im-nm" y="21"></text><circle r="10.5"/><text class="im-n" y="4"></text></g>'; }).join('') + '</g></svg>';
    root.innerHTML = '<div class="im-game"><div class="im-top"><div class="im-title"><b class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '">' + esc(sc.title) + '</b><small>' + esc(sc.sub) + ' · ' + esc(sc.date) + '</small></div>' +
      '<ol class="im-phases" id="im-phases"></ol><div class="im-tbtns"><button type="button" class="im-btn sm" data-act="zoom-" aria-label="Zoom out">−</button><button type="button" class="im-btn sm" data-act="zoom+" aria-label="Zoom in">+</button><span class="im-seg im-langseg" id="im-lang"><button type="button" data-lang="x">' + T.langName + '</button><button type="button" data-lang="both">Both</button><button type="button" data-lang="en">English</button></span><button type="button" class="im-btn sm" data-act="opts">⚙ Options</button><button type="button" class="im-btn sm" data-act="quit">New game</button></div></div>' +
      '<div class="im-msg" id="im-msg"></div><div class="im-body"><div class="im-mapwrap" id="im-mapwrap">' + svg + '</div>' +
      '<aside class="im-side"><div class="im-panel" id="im-battle" hidden></div><div class="im-panel" id="im-actions"></div><div class="im-panel" id="im-info"></div><div class="im-panel"><h3>Who holds what</h3><div id="im-players"></div></div>' +
      '<div class="im-panel"><h3>Your spoils <small id="im-cardhint"></small></h3><div id="im-cards"></div></div><div class="im-panel"><h3>Regions</h3><div id="im-regions"></div></div><div class="im-panel"><h3>The story so far</h3><div id="im-log" class="im-log"></div></div></aside></div><div id="im-modal" class="im-modal" hidden></div></div>';
    $('#im-map').addEventListener('click', function (e) { var g = e.target.closest('[data-t]'); if (g) onTerr(g.dataset.t); });
    $('#im-map').addEventListener('mouseover', function (e) { var g = e.target.closest('[data-t]'); if (g) info(g.dataset.t); });
    $('[data-act="quit"]').onclick = function () { if (!W.confirm || W.confirm('Leave this game and set up a new one? Your saved game stays until you start another.')) { S = null; busy = false; setup(); } };
    $('[data-act="opts"]').onclick = optionsModal;
    $$('[data-lang]').forEach(function (b) { b.onclick = function () { S.lang = b.dataset.lang; prefs.lang = S.lang; savePrefs(); refresh(); if (ui.sel && ui.tgt) battlePanel(null); }; });
    var z = 1; function zoom(d) { z = Math.max(1, Math.min(3.5, z + d)); var m = $('#im-map'); m.style.width = (z * 100) + '%'; m.style.height = z === 1 && W.innerWidth >= 900 ? '100%' : 'auto'; }
    zoom(0); if (W.innerWidth >= 900) setTimeout(function () { var g = $('.im-game'); if (g) g.scrollIntoView({ block: 'start' }); }, 50);
    if (W.innerWidth < 700) zoom(1); // phones start zoomed in; drag to pan
    $('[data-act="zoom+"]').onclick = function () { zoom(.5); }; $('[data-act="zoom-"]').onclick = function () { zoom(-.5); };
    refresh();
  }
  function refresh() {
    if (!S) return;
    var me = S.turn, human = S.players[me] && S.players[me].human && !busy;
    $$('.im-t').forEach(function (p) {
      var t = p.dataset.t, o = S.own[t];
      p.style.fill = o < 0 ? (S.arm[t] === 0 && S.phase === 'claim' ? '#efe6cf' : mix(NEUTRAL, '#efe6cf', .55)) : mix(facOf(o).color, '#f3ead2', .5);
      p.classList.toggle('sel', ui.sel === t); p.classList.toggle('tgt', ui.tgt === t);
      p.classList.toggle('can', human && canClick(t));
    });
    $$('.im-tok').forEach(function (g) {
      var t = g.dataset.t, o = S.own[t];
      g.querySelector('circle').style.fill = o < 0 ? '#7d745f' : facOf(o).color;
      g.querySelector('.im-n').textContent = S.arm[t] || '';
      var nm = g.querySelector('.im-nm'); nm.textContent = tname(t).replace(/^(ἡ|αἱ|τὸ|τὰ|οἱ) /, ''); nm.setAttribute('class', 'im-nm' + (X() && sc.lang === 'gr' ? ' grc' : ''));
      g.classList.toggle('sel', ui.sel === t); g.classList.toggle('tgt', ui.tgt === t); g.style.display = S.phase === 'claim' && o < 0 ? 'none' : '';
    });
    // phases
    var idx = { reinforce: 0, attack: 1, fortify: 2 }[S.phase];
    $('#im-phases').innerHTML = S.phase === 'claim' || S.phase === 'place' ? '<li class="on"><b>' + (S.phase === 'claim' ? 'Claim territories' : 'Place your soldiers') + '</b></li>' :
      T.phases.map(function (p, i) { return '<li' + (i === idx ? ' class="on"' : '') + '>' + (X() ? '<b class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '" title="' + T.phasesEn[i] + '">' + p + '</b>' + (B() ? '<small>' + T.phasesEn[i] + '</small>' : '') : '<b title="' + p + '">' + T.phasesEn[i] + '</b>') + '</li>'; }).join('');
    // players
    $('#im-players').innerHTML = '<table class="im-stats"><thead><tr><th>Side</th><th title="Territories held">Lands</th><th title="Soldiers on the map">Troops</th><th title="Whole regions held">Regions</th><th title="New soldiers at the start of the next turn">Per turn</th><th title="Word cards">Cards</th></tr></thead><tbody>' + S.players.map(function (p, i) {
      var f = facOf(i), ts = owned(i), n = ts.reduce(function (s, t) { return s + S.arm[t]; }, 0), rg = REG.filter(function (r) { return r.t.every(function (t) { return S.own[t] === i; }); });
      return '<tr class="' + (i === S.turn && S.phase !== 'claim' ? 'cur' : '') + (p.alive ? '' : ' dead') + '"><td><i style="background:' + f.color + '"></i><b>' + esc(f.leader || f.en) + '</b>' + (p.human ? ' <em>you</em>' : '') + (f.leader ? '<small>' + esc(f.en) + '</small>' : '') + '</td><td>' + ts.length + '</td><td>' + n + '</td><td title="' + esc(rg.map(function (r) { return r.en; }).join(', ')) + '">' + rg.length + '</td><td>' + (p.alive ? '+' + income(i) : '–') + '</td><td>' + p.cards.length + '</td></tr>';
    }).join('') + (function () { var ts = terrs().filter(function (t) { return S.own[t] < 0; }); return ts.length ? '<tr class="neu"><td><i style="background:#7d745f"></i>Independent</td><td>' + ts.length + '</td><td>' + ts.reduce(function (s, t) { return s + S.arm[t]; }, 0) + '</td><td></td><td></td><td></td></tr>' : ''; })() + '</tbody></table>';
    $('#im-regions').innerHTML = REG.map(function (r) {
      var cnt = {}; r.t.forEach(function (t) { cnt[S.own[t]] = (cnt[S.own[t]] || 0) + 1; });
      var o = S.own[r.t[0]], whole = o >= 0 && cnt[o] === r.t.length;
      var bar = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (k) { return '<i style="flex:' + cnt[k] + ';background:' + (+k < 0 ? '#b9ae93' : facOf(+k).color) + '" title="' + esc(+k < 0 ? 'Independent' : facOf(+k).leader || facOf(+k).en) + ': ' + cnt[k] + '"></i>'; }).join('');
      return '<div class="im-reg"><div><span>' + esc(r.en) + '</span><b>+' + r.bonus + ' per turn</b></div><div class="im-bar">' + bar + '</div><small>' + (whole ? 'Held by <b style="color:' + facOf(o).color + '">' + esc(facOf(o).leader || facOf(o).en) + '</b>' : 'You hold ' + (cnt[0] || 0) + ' of ' + r.t.length + '; nobody holds it all') + '</small></div>';
    }).join('');
    $$('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === S.lang); });
    cardsPanel(); actions(); logPanel();
  }
  function info(t) {
    var o = S.own[t], r = REG.filter(function (r) { return r.t.indexOf(t) >= 0; })[0], n = NM[t];
    $('#im-info').innerHTML = '<h3>' + (X() ? '<span class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '" title="' + esc(n.en) + '">' + esc(n.n) + '</span>' + (B() ? ' <small>' + esc(n.en) + '</small>' : '') : '<span title="' + esc(n.n) + '">' + esc(n.en) + '</span>') + '</h3><p>' +
      (o < 0 ? 'Independent' : 'Held by <b style="color:' + facOf(o).color + '">' + esc(facOf(o).leader || facOf(o).en) + '</b>') + ' · ' + S.arm[t] + ' soldier' + (S.arm[t] === 1 ? '' : 's') + '<br><small>Region: ' + esc(r.en) + ' (+' + r.bonus + ' for all ' + r.t.length + ') · borders ' + ADJ[t].map(function (x) { return esc(tname(x)); }).join(', ') + '</small></p>';
  }
  function say(html) { var m = $('#im-msg'); if (m) m.innerHTML = html; }
  function log(en, x) { S.log.unshift({ en: en, x: x || '' }); if (S.log.length > 60) S.log.pop(); }
  function logPanel() {
    $('#im-log').innerHTML = S.log.slice(0, 40).map(function (l) { return '<p>' + (X() && l.x ? '<span class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '" title="' + esc(l.en) + '">' + esc(l.x) + '</span>' + (B() ? ' <small>' + esc(l.en) + '</small>' : '') : '<small>' + esc(l.en) + '</small>') + '</p>'; }).join('');
  }
  function arrow(a, b) {
    var g = $('#im-arrow'); if (!g) return;
    if (!a) { g.innerHTML = ''; return; }
    var A = map.terr[a], B = map.terr[b]; g.innerHTML = '<line x1="' + A.x + '" y1="' + A.y + '" x2="' + B.x + '" y2="' + B.y + '"/>';
  }

  // ------------------------------------------------------------------ rules
  function income(p) {
    var n = Math.max(3, Math.floor(owned(p).length / 3));
    REG.forEach(function (r) { if (r.t.every(function (t) { return S.own[t] === p; })) n += r.bonus; });
    return n;
  }
  function rollDice(n) { var a = []; for (var i = 0; i < n; i++) a.push(1 + rnd(6)); return a.sort(function (x, y) { return y - x; }); }
  function exchange(from, to) {
    var na = Math.min(3, S.arm[from] - 1), nd = Math.min(2, S.arm[to]), A = rollDice(na), Dd = rollDice(nd), la = 0, ld = 0;
    for (var i = 0; i < Math.min(na, nd); i++) { if (A[i] > Dd[i]) ld++; else la++; }
    S.arm[from] -= la; S.arm[to] -= ld;
    return { A: A, D: Dd, la: la, ld: ld, na: na };
  }
  function capture(from, to, moveN) {
    var att = S.own[from], def = S.own[to];
    S.own[to] = att; S.arm[to] = moveN; S.arm[from] -= moveN; S.took = true;
    log(vb(facOf(att), 'takes', 'take') + NM[to].en + '.', T.taken(NM[to]));
    if (def >= 0 && !owned(def).length) {
      S.players[def].alive = false; log(vb(facOf(def), 'is', 'are') + 'defeated.', T.out(facOf(def)));
      S.players[att].cards = S.players[att].cards.concat(S.players[def].cards); S.players[def].cards = [];
    }
  }
  function winner() { var a = S.players.filter(function (p) { return p.alive; }); return a.length === 1 ? S.players.indexOf(a[0]) : -1; }
  function drawCard() {
    if (!S.deck.length) S.deck = shuffle(I.WORDS[sc.lang].map(function (w, i) { return { w: w[0], m: w[1], t: i % 3 }; }));
    return S.deck.pop();
  }
  var KIND = [['🛡', 'Infantry'], ['🐎', 'Cavalry'], ['⛵', 'Fleet']];
  function findSet(cards) { // best tradeable set: returns [indices, value] or null
    var by = [[], [], []]; cards.forEach(function (c, i) { by[c.t].push(i); });
    if (by[0].length && by[1].length && by[2].length) return [[by[0][0], by[1][0], by[2][0]], 10];
    for (var t = 2; t >= 0; t--) if (by[t].length >= 3) return [by[t].slice(0, 3), [4, 6, 8][t]];
    return null;
  }
  function trade(p) {
    var s = findSet(S.players[p].cards); if (!s) return 0;
    S.players[p].cards = S.players[p].cards.filter(function (c, i) { return s[0].indexOf(i) < 0; });
    log(vb(facOf(p), 'trades', 'trade') + 'three word cards for ' + s[1] + ' soldiers.');
    return s[1];
  }
  function connected(a, b, p) { // path through p's own territories
    var seen = {}, q = [a]; seen[a] = 1;
    while (q.length) { var x = q.shift(); if (x === b) return true; ADJ[x].forEach(function (y) { if (!seen[y] && S.own[y] === p) { seen[y] = 1; q.push(y); } }); }
    return false;
  }

  // ------------------------------------------------------------------ turn flow
  function persist() { try { W.localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { } }
  function resume(saved) { S = saved; S.lang = normLang(S.lang); load(S.sc); busy = false; ui = { sel: null, tgt: null, amt: 1 }; draw(); if (S.phase === 'reinforce' && S.pool === 0) startTurn(); else prompt(); }
  function startTurn() {
    var p = S.turn, pl = S.players[p];
    if (!pl.alive) return nextTurn();
    S.took = false; S.moved = false; S.phase = 'reinforce'; ui.sel = ui.tgt = null; arrow();
    S.pool = income(p) + pl.bonus; pl.bonus = 0;
    log(vb(facOf(p), 'receives', 'receive') + S.pool + ' new soldiers.', T.reinforce);
    if (pl.human) { busy = false; persist(); refresh(); prompt(); if (pl.cards.length >= 5) say('You hold five word cards, so you must trade a set in before placing soldiers.'); }
    else { busy = true; refresh(); aiTurn(p); }
  }
  function nextTurn() {
    if (!S) return;
    var n = S.players.length;
    do { S.turn = (S.turn + 1) % n; if (S.turn === 0) S.round++; } while (!S.players[S.turn].alive);
    startTurn();
  }
  function endTurn() {
    var p = S.turn, pl = S.players[p];
    ui.sel = ui.tgt = null; arrow(); $('#im-battle').hidden = true;
    if (S.took) {
      var c = drawCard(); pl.cards.push(c);
      if (pl.human) { log('You win a word card: ' + c.w + ' (' + c.m + ').'); if (S.quiz) return quiz(c, nextTurn); }
    }
    nextTurn();
  }
  function finish(w) {
    busy = true; try { W.localStorage.removeItem(SAVE); } catch (e) { }
    var won = S.players[w].human, f = facOf(w);
    refresh();
    modal('<h2 class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '">' + (won ? T.win : T.lose) + '</h2><p>' + (won ? 'You have won the war in ' + S.round + ' turns. ' + (T.winQuote ? '<i class="lat">' + T.winQuote + '</i> (“I came, I saw, I conquered.”)' : '“We have won.”') : esc(f.leader || f.en) + ' has conquered you. (“You have been defeated.”)') +
      '</p><p><button type="button" class="im-btn pri" id="im-again">Play again</button></p>');
    $('#im-again').onclick = function () { S = null; busy = false; setup(); };
  }
  function prompt() {
    var p = S.players[S.turn]; if (!p.human) return;
    if (S.phase === 'claim') say('Claim a territory. You and your rivals take turns until the map is full.');
    else if (S.phase === 'place') say('Place your soldiers: <b>' + S.pool + '</b> left. Click one of your territories.');
    else if (S.phase === 'reinforce') say('<b>' + S.pool + '</b> new soldier' + (S.pool === 1 ? '' : 's') + ' to place. Click one of your territories.');
    else if (S.phase === 'attack') say(ui.sel ? (ui.tgt ? 'Roll the dice, or choose another target.' : 'Now click a neighbouring enemy territory to attack from <b>' + esc(tname(ui.sel)) + '</b>.') : 'Click one of your territories with at least two soldiers to attack from it, or end your attacks.');
    else if (S.phase === 'fortify') say(S.moved ? 'You have made your move. End your turn.' : ui.sel ? 'Click one of your connected territories to move soldiers there.' : 'You may move soldiers once between your own connected territories, or end your turn.');
    refresh();
  }
  function canClick(t) {
    var me = S.turn, mine = S.own[t] === me;
    if (S.phase === 'claim') return S.own[t] < 0 && S.arm[t] === 0;
    if (S.phase === 'place' || S.phase === 'reinforce') return mine && S.pool > 0;
    if (S.phase === 'attack') return (mine && S.arm[t] > 1) || (ui.sel && !mine && ADJ[ui.sel].indexOf(t) >= 0);
    if (S.phase === 'fortify') return !S.moved && mine && (ui.sel ? t !== ui.sel && connected(ui.sel, t, me) : S.arm[t] > 1);
    return false;
  }
  function onTerr(t) {
    info(t);
    if (busy || !S.players[S.turn].human) return;
    var me = S.turn, mine = S.own[t] === me;
    if (S.phase === 'claim') { if (S.own[t] < 0 && S.arm[t] === 0) { S.own[t] = me; S.arm[t] = 1; claimRound(); } return; }
    if (S.phase === 'place' || S.phase === 'reinforce') {
      if (!mine || S.pool <= 0) return;
      if (S.phase === 'reinforce' && S.players[me].cards.length >= 5) return say('Trade in a set of word cards first.');
      var n = Math.min(S.pool, ui.amt === 'all' ? S.pool : ui.amt); S.arm[t] += n; S.pool -= n;
      if (S.pool === 0) { if (S.phase === 'place') return placeDone(); S.phase = 'attack'; }
      persist(); return prompt();
    }
    if (S.phase === 'attack') {
      if (mine) { ui.sel = S.arm[t] > 1 ? t : null; ui.tgt = null; arrow(); $('#im-battle').hidden = true; }
      else if (ui.sel && ADJ[ui.sel].indexOf(t) >= 0) { ui.tgt = t; arrow(ui.sel, t); battlePanel(null); }
      return prompt();
    }
    if (S.phase === 'fortify' && !S.moved) {
      if (!ui.sel) { if (mine && S.arm[t] > 1) ui.sel = t; }
      else if (t === ui.sel) ui.sel = null;
      else if (mine && connected(ui.sel, t, me)) return moveModal(ui.sel, t, 1, S.arm[ui.sel] - 1, S.arm[ui.sel] - 1, 'Move soldiers', function (n) { S.arm[ui.sel] -= n; S.arm[t] += n; S.moved = true; ui.sel = null; persist(); prompt(); });
      else if (mine && S.arm[t] > 1) ui.sel = t;
      return prompt();
    }
  }
  function actions() {
    var el = $('#im-actions'), p = S.players[S.turn], h = '';
    if (!p || !p.human || busy) { el.innerHTML = '<p class="im-wait">' + (S.phase === 'claim' ? 'Your rivals are choosing…' : esc(facOf(S.turn).leader || facOf(S.turn).en) + ' is moving…') + '</p>'; return; }
    if (S.phase === 'place' || S.phase === 'reinforce') {
      h = '<div class="im-row"><span>Place</span><div class="im-seg">' + [1, 5, 'all'].map(function (v) { return '<button type="button" data-amt="' + v + '"' + (String(ui.amt) === String(v) ? ' class="on"' : '') + '>' + (v === 'all' ? 'All' : v) + '</button>'; }).join('') + '</div><span>per click</span></div>';
      if (S.phase === 'place') h += '<button type="button" class="im-btn" data-a="autoplace">Place the rest for me</button>';
    } else if (S.phase === 'attack') h = '<button type="button" class="im-btn pri" data-a="endattack">End attacks →</button>';
    else if (S.phase === 'fortify') h = '<button type="button" class="im-btn pri" data-a="endturn">End turn →</button>';
    el.innerHTML = h;
    $$('[data-amt]', el).forEach(function (b) { b.onclick = function () { ui.amt = b.dataset.amt === 'all' ? 'all' : +b.dataset.amt; actions(); }; });
    var x;
    if ((x = $('[data-a="endattack"]', el))) x.onclick = function () { S.phase = 'fortify'; ui.sel = ui.tgt = null; arrow(); $('#im-battle').hidden = true; persist(); prompt(); };
    if ((x = $('[data-a="endturn"]', el))) x.onclick = function () { busy = true; endTurn(); };
    if ((x = $('[data-a="autoplace"]', el))) x.onclick = function () { aiPlace(S.turn, S.pool); S.pool = 0; placeDone(); };
  }
  function cardsPanel() {
    var p = S.players[0], set = findSet(p.cards), el = $('#im-cards');
    var canTrade = set && S.turn === 0 && S.phase === 'reinforce' && !busy;
    $('#im-cardhint').textContent = p.cards.length ? '' : '(take a territory to win one)';
    el.innerHTML = p.cards.map(function (c) { return '<span class="im-card k' + c.t + '" title="' + KIND[c.t][1] + '"><i>' + KIND[c.t][0] + '</i><b class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '">' + esc(c.w) + '</b><small>' + esc(c.m) + '</small></span>'; }).join('') +
      (set ? '<button type="button" class="im-btn' + (canTrade ? ' pri' : '') + '" id="im-trade"' + (canTrade ? '' : ' disabled') + '>Trade a set for ' + set[1] + ' soldiers</button>' + (canTrade ? '' : '<small class="im-hint">You can trade at the start of your turn.</small>') :
        p.cards.length ? '<small class="im-hint">Three of a kind (4, 6 or 8 soldiers) or one of each (10) can be traded.</small>' : '');
    var b = $('#im-trade'); if (b && canTrade) b.onclick = function () { S.pool += trade(0); persist(); prompt(); };
  }

  // ------------------------------------------------------------------ battle (human)
  function diceHTML(vals, cls) { return vals.map(function (v) { return '<span class="im-die ' + cls + ' d' + v + '">' + '<i></i>'.repeat(v) + '</span>'; }).join(''); }
  function battlePanel(res) {
    var el = $('#im-battle'), a = ui.sel, d = ui.tgt; if (!a || !d) { el.hidden = true; return; }
    var fa = facOf(S.own[a]), od = S.own[d], human = S.players[S.own[a]].human && !busy, can = S.arm[a] > 1 && od !== S.own[a];
    el.hidden = false;
    el.innerHTML = '<h3>' + esc(tname(a)) + ' <span class="im-vs">→</span> ' + esc(tname(d)) + '</h3>' +
      '<div class="im-brow"><span style="color:' + fa.color + '"><b>' + S.arm[a] + '</b> attacking</span><span class="im-dice">' + (res ? diceHTML(res.A, 'att') : '') + '</span></div>' +
      '<div class="im-brow"><span style="color:' + (od < 0 ? '#6d654f' : facOf(od).color) + '"><b>' + S.arm[d] + '</b> defending</span><span class="im-dice">' + (res ? diceHTML(res.D, 'def') : '') + '</span></div>' +
      (res ? '<p class="im-bres">' + 'Defender lost ' + res.ld + ' · attacker lost ' + res.la + '.' + '</p>' : '<p class="im-bres">' + (X() ? '<span class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '" title="' + T.diceEn + '">' + T.dice + '</span>' + (B() ? ' <small>' + T.diceEn + '</small>' : '') : '<small>' + T.diceEn + '</small>') + '</p>') +
      (human && can ? '<div class="im-bbtns"><button type="button" class="im-btn" id="im-roll">Roll once</button><button type="button" class="im-btn pri" id="im-blitz" title="Keep rolling until you win or have one soldier left">Roll to the end ⏩</button><button type="button" class="im-btn" id="im-stop">Stop</button></div>' :
        human ? '<p class="im-bres">Not enough soldiers to attack again.</p>' : '');
    if (human && can) {
      $('#im-roll').onclick = function () { fight(false); }; $('#im-blitz').onclick = function () { fight(true); };
      $('#im-stop').onclick = function () { ui.tgt = null; arrow(); el.hidden = true; prompt(); };
    }
  }
  var announced = null;
  async function fight(all) {
    var a = ui.sel, d = ui.tgt, me = S.turn, res, game = S;
    if (announced !== a + '>' + d + '@' + S.round) { announced = a + '>' + d + '@' + S.round; log(vb(facOf(me), 'attacks', 'attack') + NM[d].en + '.', T.attack(facOf(me), NM[d])); }
    if (all) { // keep rolling, quickly, until the territory falls or one soldier is left
      busy = true; var la = 0, ld = 0;
      while (S.arm[d] > 0 && S.arm[a] > 1) { res = exchange(a, d); la += res.la; ld += res.ld; battlePanel(res); refresh(); await sleep(110); if (S !== game) return; }
      busy = false; res.la = la; res.ld = ld;
    } else res = exchange(a, d);
    if (S.arm[d] === 0) {
      battlePanel(res);
      var min = Math.min(res.na, S.arm[a] - 1), max = S.arm[a] - 1;
      var done = function (n) {
        capture(a, d, n); arrow(); ui.tgt = null; ui.sel = S.arm[d] > 1 ? d : (S.arm[a] > 1 ? a : null); $('#im-battle').hidden = true;
        var w = winner(); if (w >= 0) return finish(w);
        persist(); prompt();
      };
      if (max <= min) done(max); else moveModal(a, d, min, max, max, esc(tname(d)) + ' is yours. How many soldiers move in?', done, true);
      return;
    }
    battlePanel(res);
    if (S.arm[a] <= 1) { log(vb(facOf(me), 'is', 'are') + 'driven back from ' + NM[d].en + '.', T.repelled); }
    persist(); refresh();
  }
  function moveModal(a, b, min, max, def, title, cb, forced) {
    modal('<h2>' + title + '</h2><p>' + esc(tname(a)) + ' → ' + esc(tname(b)) + '</p><p class="im-slide"><button type="button" class="im-btn sm" id="im-m-">−</button><input type="range" id="im-mv" min="' + min + '" max="' + max + '" value="' + def + '"><button type="button" class="im-btn sm" id="im-mp">+</button> <b id="im-mvn">' + def + '</b></p>' +
      '<p><button type="button" class="im-btn pri" id="im-mok">Move</button>' + (forced ? '' : ' <button type="button" class="im-btn" id="im-mno">Cancel</button>') + '</p>');
    var r = $('#im-mv'), n = $('#im-mvn'); function sync() { n.textContent = r.value; }
    r.oninput = sync; $('#im-m-').onclick = function () { r.value = Math.max(min, +r.value - 1); sync(); }; $('#im-mp').onclick = function () { r.value = Math.min(max, +r.value + 1); sync(); };
    $('#im-mok').onclick = function () { var v = +r.value; closeModal(); cb(v); };
    var no = $('#im-mno'); if (no) no.onclick = function () { closeModal(); prompt(); };
  }
  function modal(html) { var m = $('#im-modal'); m.innerHTML = '<div class="im-mbox">' + html + '</div>'; m.hidden = false; }
  function closeModal() { var m = $('#im-modal'); if (m) { m.hidden = true; m.innerHTML = ''; } }
  function quiz(c, then) {
    var pool = I.WORDS[sc.lang].filter(function (w) { return w[1] !== c.m; }), opts = shuffle(shuffle(pool).slice(0, 3).map(function (w) { return w[1]; }).concat([c.m]));
    modal('<p class="im-q">Spoils of war: a new word. What does it mean?</p><h2 class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '">' + esc(c.w) + '</h2><div class="im-qopts">' + opts.map(function (o) { return '<button type="button" class="im-btn" data-o="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') +
      '</div><p id="im-qres" class="im-qres"></p><p><button type="button" class="im-btn" id="im-qskip">Skip</button> <label class="im-qoff"><input type="checkbox" id="im-qoff"> Don’t ask again this game</label></p>');
    var answered = false;
    function go() { if ($('#im-qoff').checked) S.quiz = false; closeModal(); then(); }
    $$('[data-o]').forEach(function (b) {
      b.onclick = function () {
        if (answered) return; answered = true;
        var ok = b.dataset.o === c.m; b.classList.add(ok ? 'right' : 'wrong');
        $$('[data-o]').forEach(function (x) { if (x.dataset.o === c.m) x.classList.add('right'); x.disabled = true; });
        if (ok) S.players[0].bonus++;
        $('#im-qres').innerHTML = (ok ? '<b>Right!</b> One extra soldier joins you next turn. ' : '<b>Not quite.</b> ') + '<span class="' + (sc.lang === 'gr' ? 'grc' : 'lat') + '">' + esc(c.w) + '</span> means “' + esc(c.m) + '”.';
        $('#im-qskip').textContent = 'Continue'; $('#im-qskip').classList.add('pri');
      };
    });
    $('#im-qskip').onclick = go;
  }
  function optionsModal() {
    modal('<h2>Options</h2><p><label><input type="checkbox" id="im-o-quiz"' + (S.quiz ? ' checked' : '') + '> Word challenges when you win a card</label></p><p><label><input type="checkbox" id="im-o-fast"' + (S.fast ? ' checked' : '') + '> Fast computer moves</label></p><p><button type="button" class="im-btn pri" id="im-o-ok">Done</button></p>' + helpHTML(sc));
    $('#im-o-ok').onclick = function () { S.quiz = $('#im-o-quiz').checked; S.fast = $('#im-o-fast').checked; prefs.quiz = S.quiz; prefs.fast = S.fast; savePrefs(); closeModal(); refresh(); };
  }

  // ------------------------------------------------------------------ choosing territories by hand
  function claimRound() {
    busy = true; refresh();
    var free = function () { return terrs().filter(function (t) { return S.own[t] < 0; }); };
    (async function () {
      for (var i = 1; i < S.players.length && free().length; i++) { await sleep(S.fast ? 60 : 260); if (!S) return; var t = aiClaim(i, free()); S.own[t] = i; S.arm[t] = 1; refresh(); }
      busy = false;
      if (!free().length) {
        var per = Math.round(terrs().length * 1.3 / S.players.length);
        for (var j = 1; j < S.players.length; j++) aiPlace(j, per);
        S.phase = 'place'; S.pool = per; S.turn = 0;
      }
      prompt();
    })();
  }
  function aiClaim(p, free) {
    var best = null, bs = -1e9;
    free.forEach(function (t) {
      var s = Math.random() * 1.5; ADJ[t].forEach(function (x) { if (S.own[x] === p) s += 2; });
      var r = REG.filter(function (r) { return r.t.indexOf(t) >= 0; })[0]; s += r.t.filter(function (x) { return S.own[x] === p; }).length / r.t.length * 3;
      if (ADJ[t].length <= 3) s += .5;
      if (s > bs) { bs = s; best = t; }
    });
    return best;
  }
  function placeDone() { S.phase = 'reinforce'; S.turn = 0; ui.amt = 1; startTurn(); }

  // ------------------------------------------------------------------ computer players
  function enemies(t, p) { return ADJ[t].filter(function (x) { return S.own[x] !== p; }); }
  function threat(t, p) { return enemies(t, p).reduce(function (s, x) { return s + S.arm[x] * (S.own[x] < 0 ? .25 : 1); }, 0); }
  function regionOf(t) { return REG.filter(function (r) { return r.t.indexOf(t) >= 0; })[0]; }
  function value(e, p) { // how much p wants territory e
    var r = regionOf(e), mine = r.t.filter(function (x) { return S.own[x] === p; }).length, o = S.own[e], v = 0;
    if (mine === r.t.length - 1) v += 3 + r.bonus; else v += mine / r.t.length * 2;
    if (o >= 0) { if (r.t.every(function (x) { return S.own[x] === o; })) v += 2 + r.bonus; if (owned(o).length === 1) v += 5 + S.players[o].cards.length; }
    return v;
  }
  function aiPlace(p, n) {
    for (var i = 0; i < n; i++) {
      var mine = owned(p), border = mine.filter(function (t) { return enemies(t, p).length; }), pool = border.length ? border : mine;
      pool.sort(function (a, b) { return (threat(b, p) - S.arm[b]) - (threat(a, p) - S.arm[a]); });
      S.arm[S.diff === 'easy' ? pool[rnd(pool.length)] : pool[rnd(Math.min(2, pool.length))]]++;
    }
  }
  function bestAttack(p, extra) { // extra = soldiers about to be added (for planning reinforcement)
    var best = null, bs = -1e9, easy = S.diff === 'easy', hard = S.diff === 'hard';
    owned(p).forEach(function (b) {
      var a = S.arm[b] + (extra || 0); if (a < 2) return;
      enemies(b, p).forEach(function (e) {
        var d = S.arm[e], adv = a - 1 - d;
        if (!extra && adv < (easy ? 2 : hard ? (d < 3 ? 1 : 0) : 1)) return;
        var s = adv * (hard ? .6 : 1) + value(e, p) * (easy ? .3 : 1.2) - d * .3 + Math.random() * (easy ? 6 : hard ? .5 : 1.5);
        if (s > bs) { bs = s; best = [b, e]; }
      });
    });
    return best;
  }
  async function aiTurn(p) {
    var step = function () { return sleep(S && S.fast ? 90 : 420); }, pl = S.players[p], game = S;
    var alive = function () { return S === game; };
    while (findSet(pl.cards) && (pl.cards.length >= 5 || S.diff !== 'easy')) S.pool += trade(p);
    // reinforce
    if (S.diff === 'easy') aiPlace(p, S.pool);
    else {
      var guard = 0;
      if (S.diff === 'hard') { // shore up a threatened territory inside a region we hold
        var weak = owned(p).filter(function (t) { var r = regionOf(t); return r.t.every(function (x) { return S.own[x] === p; }) && threat(t, p) > S.arm[t] * 1.5; });
        if (weak.length) { guard = Math.floor(S.pool / 3); S.arm[weak[0]] += guard; }
      }
      var plan = bestAttack(p, S.pool - guard), tgt = plan ? plan[0] : owned(p)[0];
      S.arm[tgt] += S.pool - guard;
    }
    S.pool = 0; S.phase = 'attack'; refresh(); await step(); if (!alive()) return;
    // attack
    var taken = 0, cap = { easy: 2, normal: 7, hard: 14 }[S.diff];
    while (taken < cap) {
      var at = bestAttack(p); if (!at) break;
      var b = at[0], e = at[1]; ui.sel = b; ui.tgt = e; arrow(b, e);
      log(vb(facOf(p), 'attacks', 'attack') + NM[e].en + '.', T.attack(facOf(p), NM[e]));
      var res = null;
      while (S.arm[b] > 1 && S.arm[e] > 0 && (S.arm[b] - 1 >= S.arm[e] + (S.diff === 'easy' ? 1 : 0) || res === null)) { res = exchange(b, e); battlePanel(res); refresh(); await sleep(S.fast ? 40 : 230); if (!alive()) return; }
      if (S.arm[e] === 0) {
        var max = S.arm[b] - 1, min = Math.min(res.na, max), stay = enemies(b, p).filter(function (x) { return x !== e; }).length ? Math.max(1, Math.floor(max / 3)) : 0;
        capture(b, e, Math.max(min, max - stay)); taken++;
        var w = winner(); if (w >= 0) { refresh(); return finish(w); }
        if (S.players[0].human && !S.players[0].alive) { refresh(); return finish(p); }
      } else log(vb(facOf(p), 'is', 'are') + 'driven back from ' + NM[e].en + '.', T.repelled);
      refresh(); await step(); if (!alive()) return;
    }
    ui.sel = ui.tgt = null; arrow(); $('#im-battle').hidden = true;
    // fortify: bring an idle inland stack up to the border
    S.phase = 'fortify';
    if (S.diff !== 'easy' || Math.random() < .5) {
      var inland = owned(p).filter(function (t) { return !enemies(t, p).length && S.arm[t] > 1; }).sort(function (x, y) { return S.arm[y] - S.arm[x]; })[0];
      if (inland) {
        var dest = owned(p).filter(function (t) { return enemies(t, p).length && connected(inland, t, p); }).sort(function (x, y) { return threat(y, p) - S.arm[y] - (threat(x, p) - S.arm[x]); })[0];
        if (dest) { S.arm[dest] += S.arm[inland] - 1; S.arm[inland] = 1; }
      }
    }
    refresh(); await step(); if (!alive()) return;
    endTurn();
  }
  W.__imperium = { state: function () { return S; }, auto: function () { if (S) { S.players[0].human = false; S.fast = true; if (!busy) { busy = true; aiTurn(S.turn); } } } };
  setup();
})(window, document);
