/* Mosaic Memory: tiles of a Roman floor mosaic shine for a moment; tap them back from memory.
   One more tile after a perfect board, one fewer after a missed board; the grid grows with the tile count.
   The pure rules (L) are exported for node tests; the game itself needs the page and brain-kit.js. */
(function (W, D) {
  'use strict';
  // ---------- rules (pure) ----------
  var L = {
    MAX: 24, BOARDS: 12, MISSES: 2,
    // level -> tiles to remember, grid side, how long they shine
    def: function (lv) {
      lv = Math.max(1, Math.min(L.MAX, lv | 0));
      var tiles = lv + 2, side = 3;
      while (Math.floor(side * side * 0.44) < tiles) side++;
      return { level: lv, tiles: tiles, side: side, showMs: Math.min(2600, 800 + 80 * tiles) };
    },
    // a finished board: all found with no slip = up, all found with one slip = stay, board lost = down
    judge: function (done, misses) { return !done ? 'down' : misses === 0 ? 'up' : 'stay'; },
    next: function (lv, res) { return Math.max(1, Math.min(L.MAX, lv + (res === 'up' ? 1 : res === 'down' ? -1 : 0))); },
    // 10 points a tile found, and a bonus of 5 a tile for a perfect board
    points: function (found, tiles, misses) { return found * 10 + (found === tiles && misses === 0 ? tiles * 5 : 0); }
  };
  if (typeof module === 'object' && module.exports) module.exports = L;
  if (!D) return;
  var root = D.getElementById('mmem'), K = W.TRBBrain;
  if (!root || !K) return;

  var SLUG = 'mosaic-memory', E = K.load(SLUG), G = null, esc = K.esc;
  var SOUND = K.soundPref(); K.setSound(SOUND);
  function $(s) { return root.querySelector(s); }
  function stop() { if (G) { clearTimeout(G.timer); G.timer = null; } }
  function later(ms, fn) { clearTimeout(G.timer); G.timer = setTimeout(fn, ms); }
  var ROSE = '<svg viewBox="0 0 40 40" aria-hidden="true"><g class="mmem-rose"><path d="M20 3c4 6 4 11 0 17c-4-6-4-11 0-17zM20 37c-4-6-4-11 0-17c4 6 4 11 0 17zM3 20c6-4 11-4 17 0c-6 4-11 4-17 0zM37 20c-6 4-11 4-17 0c6-4 11-4 17 0z"/><circle cx="20" cy="20" r="3.6"/></g></svg>';
  var CROSS = '<svg viewBox="0 0 40 40" aria-hidden="true"><path class="mmem-x" d="M11 11L29 29M29 11L11 29"/></svg>';

  function soundBtn() { return '<button class="bk-btn sm" id="mm-snd" aria-pressed="' + (SOUND ? 'true' : 'false') + '" aria-label="Sound effects" title="Sound effects">' + (SOUND ? '🔊' : '🔇') + '</button>'; }
  function wireSound() {
    var b = $('#mm-snd'); if (!b) return;
    b.onclick = function () { SOUND = K.saveSoundPref(!K.soundPref()); b.setAttribute('aria-pressed', SOUND ? 'true' : 'false'); b.textContent = SOUND ? '🔊' : '🔇'; K.sfx('ok'); };
  }

  // ---------- menu ----------
  function menu() {
    stop(); G = null; E = K.load(SLUG);
    var lv = K.startLevel(E, 1, L.MAX), d = L.def(lv);
    root.innerHTML = '<div class="bk-menu"><h1>Mosaic Memory<small>memoria: “memory” in Latin</small></h1>' +
      '<p>Tiles in a Roman floor mosaic shine gold for a moment, then fade back into the stone. Tap every tile that shone, from memory. Each perfect board adds a tile to the next one, and the grid grows as you go.</p>' +
      '<div class="bk-stats"><div class="bk-stat"><b>' + (E.best || 0) + '</b><span>Best score</span></div><div class="bk-stat"><b>' + (E.top ? L.def(E.top).tiles : '–') + '</b><span>Most tiles</span></div><div class="bk-stat"><b>' + (E.plays || 0) + '</b><span>Sessions</span></div></div>' +
      '<div class="bk-btns"><button class="bk-btn pri" id="mm-go">Start: ' + d.tiles + ' tiles on a ' + d.side + ' × ' + d.side + ' grid</button>' + (lv > 1 ? '<button class="bk-btn" id="mm-one">Start from 3 tiles</button>' : '') + '</div>' +
      '<div class="bk-opt"><span>Sound effects</span>' + soundBtn() + '</div>' +
      '<h2 style="font-size:1.05rem;margin:.9rem 0 .2rem">Your progress</h2>' + K.chart(E.sessions, { label: 'Score' }) +
      '<details class="bk-help" open><summary>How to play</summary><ul>' +
      '<li>A session is ' + L.BOARDS + ' boards and takes about two minutes.</li>' +
      '<li>Watch: some tiles shine gold with a rosette. When they fade, tap or click every one of them, in any order.</li>' +
      '<li>A perfect board earns a bonus and one more tile next time. One wrong tap is forgiven. A second wrong tap ends the board, and the next board has one tile fewer.</li>' +
      '<li>Keyboard: Tab to the board, arrow keys to move, Enter or Space to choose. P or Escape pauses.</li>' +
      '<li>Your next session starts one step below where you finished, as a warm-up.</li></ul></details>' +
      '<p class="bk-honest">A memory challenge for fun. Getting better at Mosaic Memory mostly means getting better at Mosaic Memory. <a href="' + esc(root.dataset.hub || '/games/brain-games/') + '">More brain games</a></p></div>';
    $('#mm-go').onclick = function () { start(lv); };
    if ($('#mm-one')) $('#mm-one').onclick = function () { start(1); };
    wireSound();
  }

  // ---------- a session ----------
  function start(lv) {
    stop();
    G = { level: lv, top: lv, board: 0, score: 0, res: [], phase: '', paused: false, timer: null };
    root.innerHTML = '<div class="bk-game"><div class="bk-hud"><button class="bk-btn sm" id="mm-menu">☰ Menu</button><div class="bk-info" id="mm-info"></div>' + soundBtn() + '<button class="bk-btn sm" id="mm-pause" aria-label="Pause" title="Pause (P)"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor"><rect x="3" y="2" width="3.6" height="12" rx="1"/><rect x="9.4" y="2" width="3.6" height="12" rx="1"/></svg></button></div>' +
      '<div class="bk-stage"><div class="mmem-frame"><div class="mmem-board" id="mm-board" aria-label="Mosaic board"></div></div></div><div class="bk-msg" id="mm-msg" aria-live="polite"></div></div>';
    $('#mm-menu').onclick = menu; $('#mm-pause').onclick = pause; wireSound();
    var bd = $('#mm-board');
    bd.addEventListener('click', function (e) { var t = e.target.closest('.mmem-t'); if (t) tap(+t.dataset.i); });
    K.gridKeys(bd, '.mmem-t', function () { return G && G.d ? G.d.side : 3; });
    board();
  }
  function hud() {
    $('#mm-info').innerHTML = '<b>Board ' + Math.min(G.board, L.BOARDS) + ' / ' + L.BOARDS + '</b><span>' + G.d.tiles + ' tiles</span><span>Score ' + G.score + '</span>';
  }
  function msg(h) { $('#mm-msg').innerHTML = h; }
  function board() {
    if (G.board >= L.BOARDS) return finish();
    G.board++;
    var d = G.d = L.def(G.level);
    G.target = {}; K.pick(d.side * d.side, d.tiles).forEach(function (i) { G.target[i] = 1; });
    G.found = 0; G.misses = 0; G.done = {};
    var bd = $('#mm-board'), h = '';
    bd.style.setProperty('--n', d.side);
    for (var i = 0; i < d.side * d.side; i++) h += '<button type="button" class="mmem-t s' + K.rnd(4) + '" data-i="' + i + '" aria-label="Row ' + (Math.floor(i / d.side) + 1) + ', column ' + (i % d.side + 1) + '">' + ROSE + CROSS + '</button>';
    bd.innerHTML = h; bd.classList.remove('live');
    hud(); msg('Watch the tiles…');
    G.phase = 'ready';
    later(K.reduced() ? 400 : 650, show);
  }
  function cells() { return $('#mm-board').querySelectorAll('.mmem-t'); }
  function show() {
    G.phase = 'show';
    var c = cells();
    for (var i in G.target) c[i].classList.add('lit');
    msg('Remember the gold tiles.'); K.sfx('flash');
    later(G.d.showMs, recall);
  }
  function recall() {
    G.phase = 'recall';
    var c = cells();
    for (var i in G.target) c[i].classList.remove('lit');
    $('#mm-board').classList.add('live');
    msg('Tap the ' + G.d.tiles + ' tiles that shone.');
  }
  function tap(i) {
    if (!G || G.phase !== 'recall' || G.paused || G.done[i]) return;
    var el = cells()[i]; G.done[i] = 1;
    if (G.target[i]) {
      G.found++; el.classList.add('hit'); el.setAttribute('aria-label', el.getAttribute('aria-label') + ': found'); K.sfx('tap');
      msg(G.found + ' of ' + G.d.tiles + ' found' + (G.misses ? ' (one slip)' : ''));
      if (G.found === G.d.tiles) endBoard(true);
    } else {
      G.misses++; el.classList.add('miss'); el.setAttribute('aria-label', el.getAttribute('aria-label') + ': not one of them'); K.sfx('bad');
      if (G.misses >= L.MISSES) endBoard(false);
      else msg('<span class="bad">Not that one.</span> One more slip ends the board.');
    }
  }
  function endBoard(done) {
    G.phase = 'feedback';
    $('#mm-board').classList.remove('live');
    var res = L.judge(done, G.misses), pts = L.points(G.found, G.d.tiles, G.misses);
    G.score += pts; G.res.push(res);
    if (!done) { var c = cells(); for (var i in G.target) if (!G.done[i]) c[i].classList.add('missed'); }
    G.level = L.next(G.level, res); G.top = Math.max(G.top, G.level);
    if (res === 'up') { K.sfx('up'); msg('<span class="ok"><span class="la">Optime!</span> A perfect board, +' + pts + '.</span> One more tile next.'); }
    else if (res === 'stay') { K.sfx('ok'); msg('<span class="ok"><span class="la">Bene!</span> All found, +' + pts + '.</span> Same size next.'); }
    else { K.sfx('down'); msg('<span class="bad">The dashed tiles were the ones you missed.</span> One tile fewer next.'); }
    hud();
    later(done ? 1200 : 2200, board);
  }
  function finish() {
    G.phase = 'over'; stop();
    var next = Math.max(1, G.level - 1), best = K.record(SLUG, { score: G.score, level: G.top, next: next });
    E = K.update(SLUG, function (e) { e.top = Math.max(e.top || 0, G.top); });
    var n = { up: 0, stay: 0, down: 0 }; G.res.forEach(function (r) { n[r]++; });
    K.sfx('end');
    var m = D.createElement('div'); m.className = 'bk-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Session over');
    m.innerHTML = '<div class="bk-box"><h2>Session over</h2>' + medallion(G.res) +
      '<p style="font-size:1.25rem"><b>' + G.score + '</b> points' + (best ? '<span class="bk-new">New best!</span>' : '') + '</p>' +
      '<p>' + n.up + ' perfect, ' + n.stay + ' with one slip, ' + n.down + ' missed. Most tiles this time: ' + L.def(G.top).tiles + '.</p>' +
      K.chart(E.sessions, { label: 'Score' }) +
      '<div class="bk-btns"><button class="bk-btn pri" id="mm-again">Play again</button><button class="bk-btn" id="mm-back">Menu</button></div></div>';
    $('.bk-game').appendChild(m);
    $('#mm-again').onclick = function () { start(K.startLevel(K.load(SLUG), 1, L.MAX)); };
    $('#mm-back').onclick = menu;
    $('#mm-again').focus({ preventScroll: true });
  }
  // a round floor medallion with one wedge per board: gold rosette = perfect, plain gold = one slip, grey stone = missed
  function medallion(res) {
    var s = '', N = res.length || 1;
    res.forEach(function (r, i) {
      var a0 = (i / N) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / N) * 2 * Math.PI - Math.PI / 2, R = 46;
      var x0 = 50 + R * Math.cos(a0), y0 = 50 + R * Math.sin(a0), x1 = 50 + R * Math.cos(a1), y1 = 50 + R * Math.sin(a1);
      s += '<path d="M50 50L' + x0.toFixed(2) + ' ' + y0.toFixed(2) + 'A' + R + ' ' + R + ' 0 0 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + 'Z" class="mmem-w ' + r + '"/>';
      if (r === 'up') { var am = (a0 + a1) / 2; s += '<circle cx="' + (50 + 33 * Math.cos(am)).toFixed(2) + '" cy="' + (50 + 33 * Math.sin(am)).toFixed(2) + '" r="3.2" class="mmem-dot"/>'; }
    });
    return '<svg class="mmem-med" viewBox="0 0 100 100" role="img" aria-label="Your boards as a mosaic medallion">' + s + '<circle cx="50" cy="50" r="13" class="mmem-hub"/></svg>';
  }

  // ---------- pause ----------
  function pause() {
    if (!G || G.paused || G.phase === 'over') return;
    G.paused = true; stop();
    var ph = G.phase;
    if (ph === 'ready' || ph === 'show') { var c = cells(); for (var i = 0; i < c.length; i++) c[i].classList.remove('lit'); }
    G.closePause = K.pauseOverlay($('.bk-game'), function () {
      G.paused = false; G.closePause = null;
      if (ph === 'ready' || ph === 'show') { G.board--; board(); }   // a fresh pattern: no peeking while paused
      else if (ph === 'feedback') board();
    }, menu, '<p>Board ' + G.board + ' of ' + L.BOARDS + ', score ' + G.score + '.</p>');
  }
  D.addEventListener('keydown', function (e) {
    if (!root.isConnected || !G || G.phase === 'over') return;
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      e.preventDefault();
      if (G.paused) { var r = root.querySelector('.bk-modal [data-a="r"]'); if (r) r.click(); } else pause();
    }
  });
  D.addEventListener('visibilitychange', function () { if (D.hidden) pause(); });
  menu();
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null);
