/* Numbers in Order: numerals appear at random spots on a wax tablet, then turn into blank tiles; touch the tiles in order.
   Modelled on the task in Inoue and Matsuzawa (2007): a masking mode (the numbers hide at your first touch) and a
   limited-hold mode (they hide after 650, 430 or 210 ms). A training ladder adapts with a two-up, one-down staircase.
   Pure rules (N) are exported for node tests. */
(function (W, D) {
  'use strict';
  // ---------- rules (pure) ----------
  var N = {
    // k numbers; ms = how long they show (0 = until your first touch, then they hide)
    LADDER: [
      { k: 3, ms: 0 }, { k: 4, ms: 0 }, { k: 5, ms: 0 },
      { k: 5, ms: 2000 }, { k: 5, ms: 1300 }, { k: 5, ms: 900 },
      { k: 5, ms: 650 }, { k: 5, ms: 430 }, { k: 5, ms: 210 },
      { k: 6, ms: 650 }, { k: 6, ms: 430 }, { k: 6, ms: 210 },
      { k: 7, ms: 650 }, { k: 7, ms: 430 }, { k: 7, ms: 210 },
      { k: 8, ms: 650 }, { k: 8, ms: 430 }, { k: 8, ms: 210 },
      { k: 9, ms: 650 }, { k: 9, ms: 430 }, { k: 9, ms: 210 }],
    TIMES: [0, 2000, 1300, 900, 650, 430, 210],
    TRIALS: 20, TEST: [650, 430, 210], TEST_EACH: 10,
    ROMAN: ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    STAIR: { up: 2, down: 1, min: 1, max: 21 },
    // k distinct cells on a cols x rows tablet; the numbers are 1..k, or (gaps) k different numbers from 1 to 9 as in the study's test
    layout: function (cols, rows, k, gaps, r) {
      r = r || Math.random;
      function ri(n) { return Math.floor(r() * n); }
      function pickN(n, m) { var a = []; for (var i = 0; i < n; i++) a.push(i); for (var j = a.length - 1; j > 0; j--) { var q = ri(j + 1), t = a[j]; a[j] = a[q]; a[q] = t; } return a.slice(0, m); }
      var cells = pickN(cols * rows, k), nums;
      if (gaps) nums = pickN(9, k).map(function (x) { return x + 1; }).sort(function (a, b) { return a - b; });
      else { nums = []; for (var i = 1; i <= k; i++) nums.push(i); }
      return { cols: cols, rows: rows, cells: cells, nums: nums };   // cells[j] holds nums[j]; touch j = 0, 1, 2...
    },
    label: function (n, roman) { return roman ? N.ROMAN[n] : String(n); },
    timeName: function (ms) { return ms ? (ms >= 1000 ? (ms / 1000).toFixed(1).replace(/\.0$/, '') + ' s' : ms + ' ms') : 'until your first touch'; },
    points: function (lv) { return 10 * lv; },
    testPlan: function (r) {
      r = r || Math.random;
      var a = [];
      N.TEST.forEach(function (ms) { for (var i = 0; i < N.TEST_EACH; i++) a.push(ms); });
      for (var j = a.length - 1; j > 0; j--) { var q = Math.floor(r() * (j + 1)), t = a[j]; a[j] = a[q]; a[q] = t; }
      return a;
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = N;
  if (!D) return;
  var root = D.getElementById('nio'), K = W.TRBBrain;
  if (!root || !K) return;

  var SLUG = 'numbers-in-order', E = K.load(SLUG), G = null, esc = K.esc;
  var SOUND = K.soundPref(); K.setSound(SOUND);
  var opt = { roman: !!E.roman, k: E.fk || 5, ms: typeof E.fms === 'number' ? E.fms : 650, gaps: !!E.fgaps };
  function $(s) { return root.querySelector(s); }
  function now() { return performance.now(); }
  function stepName(lv) { var s = N.LADDER[lv - 1]; return s.k + ' numbers, ' + (s.ms ? 'shown ' + N.timeName(s.ms) : 'hidden at first touch'); }
  function soundBtn() { return '<button class="bk-btn sm" id="nio-snd" aria-pressed="' + (SOUND ? 'true' : 'false') + '" aria-label="Sound effects" title="Sound effects">' + (SOUND ? '🔊' : '🔇') + '</button>'; }
  function wireSound() {
    var b = $('#nio-snd'); if (!b) return;
    b.onclick = function () { SOUND = K.saveSoundPref(!K.soundPref()); b.setAttribute('aria-pressed', SOUND ? 'true' : 'false'); b.textContent = SOUND ? '🔊' : '🔇'; K.sfx('ok'); };
  }
  function seg(name, items, cur) {
    return '<div class="bk-seg" role="group" aria-label="' + esc(name) + '">' + items.map(function (it) { return '<button type="button" data-v="' + it[0] + '" aria-pressed="' + (String(it[0]) === String(cur) ? 'true' : 'false') + '">' + it[1] + '</button>'; }).join('') + '</div>';
  }
  function stop() { if (G) { clearTimeout(G.timer); cancelAnimationFrame(G.raf); } }

  // ---------- menu ----------
  function menu() {
    stop(); G = null; E = K.load(SLUG);
    var lv = K.startLevel(E, 1, N.LADDER.length), tests = E.tests || [], lastTest = tests[tests.length - 1];
    var best210 = tests.reduce(function (m, t) { return Math.max(m, t.a210); }, -1);
    root.innerHTML = '<div class="bk-menu"><h1>Numbers in Order<small>ordine: “in order” in Latin</small></h1>' +
      '<p>Numbers appear at random spots on a wax tablet, then turn into blank tiles. Touch the tiles in order, smallest first. It is the task that made Ayumu the chimpanzee famous, and like him, you get better with practice. <button class="nio-link" id="nio-about">About Ayumu and the study ›</button></p>' +
      '<div class="bk-stats four"><div class="bk-stat"><b>' + (E.top || '–') + '</b><span>Highest step</span></div><div class="bk-stat"><b>' + (E.best || 0) + '</b><span>Best score</span></div><div class="bk-stat"><b>' + (E.trials || 0) + '</b><span>Trials done</span></div><div class="bk-stat"><b>' + (best210 >= 0 ? best210 + '%' : '–') + '</b><span>Best at 210 ms</span></div></div>' +
      '<div class="bk-btns"><button class="bk-btn pri" id="nio-go">Training ladder: step ' + lv + '</button><button class="bk-btn" id="nio-test">The study’s test</button><button class="bk-btn" id="nio-free">Free practice</button></div>' +
      '<p class="bk-small" style="text-align:center;margin-top:-.4rem">Step ' + lv + ': ' + stepName(lv) + '.</p>' +
      '<div class="bk-opt"><span>Numerals</span>' + seg('Numerals', [[0, '1 2 3'], [1, 'I II III']], opt.roman ? 1 : 0) + '</div>' +
      '<div class="bk-opt"><span>Sound effects</span>' + soundBtn() + '</div>' +
      '<h2 style="font-size:1.05rem;margin:.9rem 0 .2rem">Your progress on the ladder</h2>' + K.chart(E.sessions, { key: 'level', label: 'Highest step' }) +
      (tests.length ? '<h2 style="font-size:1.05rem;margin:.9rem 0 .2rem">Your tests at 210 ms</h2>' + K.chart(tests.map(function (t) { return { t: t.t, a: t.a210 }; }), { key: 'a', label: 'Percent right at 210 ms' }) : '') +
      record() +
      '<details class="bk-help"><summary>How to play</summary><ul>' +
      '<li>Press <b>Show</b> (or the space bar). The numbers appear. Touch the smallest one first, then the rest in order.</li>' +
      '<li><b>Masking:</b> on the first steps the numbers stay until your first touch, then the rest turn into blank tiles. <b>Limited hold:</b> later the numbers vanish on their own after a set time, down to 210 milliseconds, about a fifth of a second.</li>' +
      '<li>A wrong touch ends the trial and shows where the numbers were.</li>' +
      '<li>The ladder: two trials right in a row take you up a step, one miss takes you down a step. A session is ' + N.TRIALS + ' trials. Steps 7 to 9 use the study’s five numbers and its three display times.</li>' +
      '<li>The study’s test: ' + (N.TEST.length * N.TEST_EACH) + ' trials of five numbers chosen from 1 to 9, ' + N.TEST_EACH + ' each at 650, 430 and 210 ms, mixed up. Take it now and again after a few weeks of practice.</li>' +
      '<li>Keyboard: Tab to the tiles, arrow keys to move between them, Enter to touch. P or Escape pauses.</li></ul></details>' +
      '<p class="bk-honest">A memory challenge for fun. Practice makes you much better at this task; it does not make you smarter in general. <a href="' + esc(root.dataset.hub || '/games/brain-games/') + '">More brain games</a></p></div>';
    root.querySelectorAll('.bk-seg[aria-label="Numerals"] button').forEach(function (b) { b.onclick = function () { opt.roman = b.dataset.v === '1'; E = K.update(SLUG, function (e) { e.roman = opt.roman; }); menu(); }; });
    $('#nio-go').onclick = function () { start('ladder', lv); };
    $('#nio-test').onclick = function () { start('test'); };
    $('#nio-free').onclick = freeMenu;
    $('#nio-about').onclick = about;
    wireSound();
  }
  // lifetime accuracy for each number count and display time
  function record() {
    var A = E.acc || {}, keys = Object.keys(A);
    if (!keys.length) return '';
    var ks = [3, 4, 5, 6, 7, 8, 9].filter(function (k) { return N.TIMES.some(function (ms) { return A[k + '/' + ms]; }); });
    var ts = N.TIMES.filter(function (ms) { return ks.some(function (k) { return A[k + '/' + ms]; }); });
    var h = '<details class="bk-help"><summary>Your record: percent right, all time</summary><div class="nio-tw"><table class="nio-rec"><thead><tr><th scope="col">Numbers</th>' +
      ts.map(function (ms) { return '<th scope="col">' + (ms ? N.timeName(ms) : 'at touch') + '</th>'; }).join('') + '</tr></thead><tbody>';
    ks.forEach(function (k) {
      h += '<tr><th scope="row">' + k + '</th>' + ts.map(function (ms) { var a = A[k + '/' + ms]; return '<td>' + (a ? Math.round(100 * a[0] / a[1]) + '%<small> of ' + a[1] + '</small>' : '·') + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div></details>';
  }
  function freeMenu() {
    stop(); G = null;
    root.innerHTML = '<div class="bk-menu"><h1>Free practice<small>exercitatio: “practice”</small></h1><p>Pick the size of the challenge. A practice run is ' + N.TRIALS + ' trials and does not move you on the ladder.</p>' +
      '<div class="bk-opt"><span>How many numbers</span>' + seg('How many numbers', [3, 4, 5, 6, 7, 8, 9].map(function (k) { return [k, k]; }), opt.k) + '</div>' +
      '<div class="bk-opt"><span>How long they show</span>' + seg('How long they show', N.TIMES.map(function (ms) { return [ms, ms ? N.timeName(ms) : 'Until first touch']; }), opt.ms) + '</div>' +
      '<div class="bk-opt"><span>Which numbers</span>' + seg('Which numbers', [[0, '1, 2, 3… in a row'], [1, 'Any from 1 to 9']], opt.gaps ? 1 : 0) + '</div>' +
      '<div class="bk-btns"><button class="bk-btn pri" id="nio-fgo">Start practice</button><button class="bk-btn" id="nio-video">Like the famous video: 1 to 9, hidden at first touch</button><button class="bk-btn" id="nio-fback">Back</button></div></div>';
    function pick(name, fn) { root.querySelectorAll('.bk-seg[aria-label="' + name + '"] button').forEach(function (b) { b.onclick = function () { fn(+b.dataset.v); save(); freeMenu(); }; }); }
    function save() { E = K.update(SLUG, function (e) { e.fk = opt.k; e.fms = opt.ms; e.fgaps = opt.gaps; }); }
    pick('How many numbers', function (v) { opt.k = v; });
    pick('How long they show', function (v) { opt.ms = v; });
    pick('Which numbers', function (v) { opt.gaps = v === 1; });
    $('#nio-fgo').onclick = function () { start('free'); };
    $('#nio-video').onclick = function () { opt.k = 9; opt.ms = 0; opt.gaps = false; save(); start('free'); };
    $('#nio-fback').onclick = menu;
  }
  function about() {
    var src = D.getElementById('nio-study');
    var m = D.createElement('div'); m.className = 'bk-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'About Ayumu and the study');
    m.innerHTML = '<div class="bk-box nio-about">' + (src ? src.innerHTML : '<p>See the notes below the game.</p>') + '<div class="bk-btns"><button class="bk-btn pri" id="nio-close">Close</button></div></div>';
    root.appendChild(m);
    var c = m.querySelector('#nio-close'); c.onclick = function () { m.remove(); $('#nio-about') && $('#nio-about').focus({ preventScroll: true }); }; c.focus({ preventScroll: true });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') c.click(); });
  }

  // ---------- a session ----------
  function start(mode, lv) {
    stop();
    G = { mode: mode, lv: lv || 1, top: lv || 1, run: 0, i: 0, n: mode === 'test' ? N.TEST.length * N.TEST_EACH : N.TRIALS, right: 0, score: 0, lats: [],
      plan: mode === 'test' ? N.testPlan() : null, byMs: {}, phase: '', paused: false };
    root.innerHTML = '<div class="bk-game"><div class="bk-hud"><button class="bk-btn sm" id="nio-menu">☰ Menu</button><div class="bk-info" id="nio-info"></div>' + soundBtn() + '<button class="bk-btn sm" id="nio-pause" aria-label="Pause" title="Pause (P)"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor"><rect x="3" y="2" width="3.6" height="12" rx="1"/><rect x="9.4" y="2" width="3.6" height="12" rx="1"/></svg></button></div>' +
      '<div class="bk-stage nio-stage" id="nio-stage"><div class="nio-ready" id="nio-ready"><button class="bk-btn pri nio-show" id="nio-show">Show <span aria-hidden="true">▶</span></button><p class="nio-next" id="nio-next"></p></div><div class="nio-tab" id="nio-tab" aria-label="Wax tablet"></div></div>' +
      '<div class="bk-msg" id="nio-msg" aria-live="polite"></div></div>';
    $('#nio-menu').onclick = menu; $('#nio-pause').onclick = pause; $('#nio-show').onclick = go; wireSound();
    $('#nio-tab').addEventListener('click', function (e) { var b = e.target.closest('.nio-sq'); if (b) touch(+b.dataset.j); });
    trial();
  }
  function spec() {
    if (G.mode === 'ladder') { var s = N.LADDER[G.lv - 1]; return { k: s.k, ms: s.ms, gaps: false }; }
    if (G.mode === 'test') return { k: 5, ms: G.plan[G.i], gaps: true };
    return { k: opt.k, ms: opt.ms, gaps: opt.gaps };
  }
  function hud() {
    var s = G.spec, what = s.k + ' numbers · ' + (s.ms ? N.timeName(s.ms) : 'hide at touch');
    $('#nio-info').innerHTML = '<b>' + (G.mode === 'ladder' ? 'Step ' + G.lv : G.mode === 'test' ? 'Test' : 'Practice') + '</b><span>' + what + '</span><span>Trial ' + Math.min(G.i + 1, G.n) + ' / ' + G.n + '</span>' + (G.mode === 'ladder' ? '<span>Score ' + G.score + '</span>' : '<span>' + G.right + ' right</span>');
  }
  function msg(h) { $('#nio-msg').innerHTML = h; }
  function trial() {
    if (G.i >= G.n) return finish();
    var s = G.spec = spec(), st = $('#nio-stage'), land = st.clientWidth >= st.clientHeight * 0.9, cols = land ? 8 : 5, rows = land ? 5 : 8;
    G.lay = N.layout(cols, rows, s.k, s.gaps); G.next = 0; G.firstAt = 0;
    var tab = $('#nio-tab'), byCell = {}, h = '';
    G.lay.cells.forEach(function (c, j) { byCell[c] = j; });
    tab.style.setProperty('--c', cols); tab.style.setProperty('--r', rows);
    for (var c = 0; c < cols * rows; c++) {
      if (byCell[c] == null) { h += '<span class="nio-cell"></span>'; continue; }
      var j = byCell[c], lab = N.label(G.lay.nums[j], opt.roman);
      h += '<button type="button" class="nio-sq" data-j="' + j + '" aria-label="Blank tile" tabindex="-1"><span class="nio-n' + (lab.length > 2 ? ' l3' : lab.length > 1 ? ' l2' : '') + '">' + lab + '</span></button>';
    }
    tab.innerHTML = h; tab.className = 'nio-tab wait';
    G.phase = 'wait'; hud();
    var sb = $('#nio-show'); sb.hidden = false; $('#nio-ready').hidden = false;
    $('#nio-next').innerHTML = (G.moved > 0 ? '<b>▲ Step ' + G.lv + '</b>' : G.moved < 0 ? '<b>▼ Step ' + G.lv + '</b>' : G.mode === 'ladder' ? 'Step ' + G.lv : G.mode === 'test' ? 'Test trial ' + (G.i + 1) : 'Trial ' + (G.i + 1)) + ': ' + s.k + ' numbers, ' + (s.ms ? 'shown ' + N.timeName(s.ms) : 'hidden at your first touch');
    G.moved = 0;
    msg(G.i === 0 ? 'Press <b>Show</b> when you are ready.' : '');
    var ae = D.activeElement;
    if (!ae || ae === D.body || root.contains(ae)) sb.focus({ preventScroll: true });
  }
  function squares() { return $('#nio-tab').querySelectorAll('.nio-sq'); }
  function go() {
    if (!G || G.phase !== 'wait' || G.paused) return;
    var sb = $('#nio-show'); sb.hidden = true; $('#nio-ready').hidden = true;
    var tab = $('#nio-tab'), sq = squares();
    G.phase = 'show'; tab.className = 'nio-tab show';
    for (var i = 0; i < sq.length; i++) { sq[i].tabIndex = 0; sq[i].setAttribute('aria-label', 'Number ' + G.lay.nums[+sq[i].dataset.j]); }
    msg('');
    G.raf = requestAnimationFrame(function (t0) {
      G.shownAt = t0;
      if (G.spec.ms) {
        var f = function (t) { if (!G || G.phase !== 'show') return; if (t - t0 >= G.spec.ms - 8) { G.shownFor = t - t0; mask(); } else G.raf = requestAnimationFrame(f); };
        G.raf = requestAnimationFrame(f);
      }
    });
    if (sq[0]) sq[0].focus({ preventScroll: true });
  }
  function mask() {
    if (G.phase !== 'show') return;
    G.phase = 'answer';
    $('#nio-tab').className = 'nio-tab masked';
    squares().forEach(function (b) { if (!b.classList.contains('done')) b.setAttribute('aria-label', 'Blank tile'); });
  }
  function touch(j) {
    if (!G || G.paused || (G.phase !== 'show' && G.phase !== 'answer')) return;
    var b = $('#nio-tab').querySelector('.nio-sq[data-j="' + j + '"]');
    if (!b || b.classList.contains('done')) return;
    if (!G.firstAt) { G.firstAt = now(); G.lats.push(G.firstAt - (G.shownAt || G.firstAt)); }
    if (j === G.next) {
      G.next++; b.classList.add('done'); b.setAttribute('aria-label', 'Number ' + G.lay.nums[j] + ', done'); K.sfx('tap');
      if (G.phase === 'show') mask();   // the first right touch hides the rest, as in the study's masking task
      if (G.next === G.spec.k) end(true);
    } else { b.classList.add('wrong'); end(false, j); }
  }
  function end(ok, wrong) {
    G.phase = 'fb'; cancelAnimationFrame(G.raf);
    var s = G.spec, key = s.k + '/' + s.ms, tab = $('#nio-tab');
    E = K.update(SLUG, function (e) { e.trials = (e.trials || 0) + 1; e.acc = e.acc || {}; var a = e.acc[key] || [0, 0]; a[0] += ok ? 1 : 0; a[1]++; e.acc[key] = a; });
    if (G.mode === 'test') { var m = G.byMs[s.ms] || (G.byMs[s.ms] = [0, 0]); m[0] += ok ? 1 : 0; m[1]++; }
    var lat = G.lats.length ? G.lats[G.lats.length - 1] : 0, latTxt = lat ? ' First touch after ' + (lat / 1000).toFixed(2) + ' s.' : '';
    if (ok) {
      G.right++;
      if (G.mode === 'ladder') { var p = N.points(G.lv); G.score += p; }
      K.sfx('ok'); msg('<span class="ok"><span class="la">' + (s.ms && s.ms <= 430 ? 'Optime!' : 'Bene!') + '</span> All in order' + (G.mode === 'ladder' ? ', +' + p : '') + '.</span>' + latTxt);
    } else {
      tab.className = 'nio-tab reveal';
      squares().forEach(function (q) { q.setAttribute('aria-label', 'Number ' + G.lay.nums[+q.dataset.j] + (q.classList.contains('done') ? ', done' : '')); });
      K.sfx('bad');
      msg('<span class="bad">That was ' + N.label(G.lay.nums[wrong], opt.roman) + '; ' + N.label(G.lay.nums[G.next], opt.roman) + ' came next.</span>');
    }
    var moved = 0;
    if (G.mode === 'ladder') {
      var r = K.stair({ level: G.lv, run: G.run }, ok, N.STAIR);
      moved = r.moved; G.lv = r.level; G.run = r.run; G.top = Math.max(G.top, G.lv);
      if (moved > 0) { K.sfx('up'); msg($('#nio-msg').innerHTML + ' <b>Up to step ' + G.lv + '.</b>'); }
      if (moved < 0) msg($('#nio-msg').innerHTML + ' Back to step ' + G.lv + '.');
    }
    G.i++;
    G.moved = moved;
    later(ok ? 700 : 1800, trial);
  }
  function later(ms, fn) { clearTimeout(G.timer); G.timer = setTimeout(function () { if (G && !G.paused) fn(); else if (G) G.pending = fn; }, ms); }
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s.length ? s[Math.floor(s.length / 2)] : 0; }
  function finish() {
    G.phase = 'over'; stop();
    var acc = Math.round(100 * G.right / G.n), med = median(G.lats), body = '', best = false;
    if (G.mode === 'ladder') {
      best = K.record(SLUG, { score: G.score, level: G.top, next: Math.max(1, G.lv - 1), acc: acc, rt: Math.round(med) });
      E = K.update(SLUG, function (e) { e.top = Math.max(e.top || 0, G.top); });
      body = '<p style="font-size:1.25rem"><b>' + G.score + '</b> points' + (best ? '<span class="bk-new">New best!</span>' : '') + '</p><p>Highest step: ' + G.top + ' (' + stepName(G.top) + '). ' + G.right + ' of ' + G.n + ' trials right.</p>' + K.chart(E.sessions, { key: 'level', label: 'Highest step' });
    } else if (G.mode === 'test') {
      var a = {}; N.TEST.forEach(function (ms) { var m = G.byMs[ms] || [0, 1]; a[ms] = Math.round(100 * m[0] / m[1]); });
      E = K.update(SLUG, function (e) { e.tests = (e.tests || []).concat([{ t: Date.now(), a650: a[650], a430: a[430], a210: a[210] }]).slice(-30); });
      body = '<p>Five numbers from 1 to 9, ten trials at each display time:</p>' + bars([[ 'You, 650 ms', a[650]], ['You, 430 ms', a[430]], ['You, 210 ms', a[210]],
        ['Cook and Wilson’s two students at 210 ms, before practice', 42, '38% and 46%'], ['The same students at 210 ms, after about 15,000 practice trials', 95, '94% and 96%']]) +
        '<p class="bk-small">Ayumu’s scores are shown in a graph in Inoue and Matsuzawa’s paper. His accuracy stayed about the same at all three times, while the untrained students did worse as the time got shorter.</p>';
    } else body = '<p>' + G.right + ' of ' + G.n + ' right (' + acc + '%) with ' + G.spec.k + ' numbers, ' + N.timeName(G.spec.ms) + '.</p>';
    K.sfx('end');
    var m = D.createElement('div'); m.className = 'bk-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Session over');
    m.innerHTML = '<div class="bk-box"><h2>' + (G.mode === 'test' ? 'Test done' : 'Session over') + '</h2>' + body +
      (med ? '<p class="bk-small">Your typical first touch came ' + (med / 1000).toFixed(2) + ' s after the numbers appeared. You have done ' + (E.trials || 0) + ' trials in all.</p>' : '') +
      '<div class="bk-btns"><button class="bk-btn pri" id="nio-again">' + (G.mode === 'test' ? 'Take it again' : 'Play again') + '</button><button class="bk-btn" id="nio-back">Menu</button></div></div>';
    $('.bk-game').appendChild(m);
    var mode = G.mode;
    $('#nio-again').onclick = function () { start(mode, K.startLevel(K.load(SLUG), 1, N.LADDER.length)); };
    $('#nio-back').onclick = menu; $('#nio-again').focus({ preventScroll: true });
  }
  function bars(rows) {
    return '<div class="nio-bars">' + rows.map(function (r) { return '<div class="nio-br"><span>' + r[0] + '</span><i><b style="width:' + r[1] + '%"></b></i><em>' + (r[2] || r[1] + '%') + '</em></div>'; }).join('') + '</div>';
  }

  // ---------- pause ----------
  function pause() {
    if (!G || G.paused || G.phase === 'over') return;
    G.paused = true; var ph = G.phase;
    if (ph === 'show') { cancelAnimationFrame(G.raf); G.phase = 'held'; }
    K.pauseOverlay($('.bk-game'), function () {
      if (!G) return;
      G.paused = false;
      if (ph === 'show') trial();   // the numbers were on show: a fresh trial with new spots
      else if (G.pending) { var f = G.pending; G.pending = null; f(); }
    }, menu, '<p>Trial ' + Math.min(G.i + 1, G.n) + ' of ' + G.n + '.</p>');
  }
  D.addEventListener('keydown', function (e) {
    if (!root.isConnected || !G || G.phase === 'over') return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var k = e.key;
    if (k === 'p' || k === 'P' || k === 'Escape') { e.preventDefault(); if (G.paused) { var r = root.querySelector('.bk-modal [data-a="r"]'); if (r) r.click(); } else pause(); return; }
    if (!G.paused && G.phase === 'wait' && (k === ' ' || k === 'Enter') && !(e.target && e.target.classList && e.target.classList.contains('bk-btn') && e.target.id !== 'nio-show')) { e.preventDefault(); go(); }
  });
  D.addEventListener('visibilitychange', function () { if (D.hidden) pause(); });
  menu();
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null);
