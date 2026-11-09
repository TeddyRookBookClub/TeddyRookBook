/* Lepanto trainer (/memory/challenges/lepanto/): Chesterton's poem, 143 lines in 30 chunks (data/memory/lepanto.yaml, inlined as #lep-data).
   Learn a chunk: read it, first-letter cues, cloze (more and more words hidden), then recall it by typing or, where the browser can
   recognize speech on this device, by saying it. Passing a recall starts the chunk on the 1-3-7-21 schedule (core.js), stored in
   trb-memory-v1 lists.lepanto.c["<from>-<to>"] (0-based lines, `to` exclusive), the same shape the challenges index reads.
   Review (what's due), Chain (chunks 1..k in one go), Recital (the whole poem against a timer), Progress.
   The pure parts (words, cues, cloze, the recall checker) load in Node too: scripts/memory/test-lepanto.js. */
(function (root, factory) {
  var P = factory();
  if (typeof module === 'object' && module.exports) module.exports = P; else root.TRBLepanto = P;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var P = {};
  /* ---------------- words ---------------- */
  // spelling variants that count as the same word (British and American, St. and Saint)
  var SAME = { gray: 'grey', labor: 'labour', laboring: 'labouring', laborer: 'labourer', color: 'colour', colors: 'colours', rumor: 'rumour', saint: 'st', plumed: 'plumed' };
  P.norm = function (w) {
    w = String(w == null ? '' : w);
    if (w.normalize) w = w.normalize('NFD').replace(/[̀-ͯ]/g, '');
    w = w.toLowerCase().replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, '');
    return SAME[w] || w;
  };
  // the words of a text for checking: split on spaces, hyphens and dashes; punctuation and case dropped
  P.words = function (text) {
    return String(text == null ? '' : text).split(/[\s\-‐-―]+/).map(P.norm).filter(Boolean);
  };
  // display tokens (split on spaces) and, for each, how many check-words it holds
  P.tokens = function (line) {
    return String(line).split(/\s+/).filter(Boolean).map(function (t) { return { t: t, n: P.words(t).length }; });
  };
  /* ---------------- cues ---------------- */
  // first letters: every run of letters keeps its first letter; punctuation stays ("Spain—hurrah!" -> "S—h!")
  P.firstLetters = function (line) {
    return String(line).replace(/[A-Za-zÀ-ɏ'’]+/g, function (m) {
      var lead = (m.match(/^['’]*/) || [''])[0], rest = m.slice(lead.length);
      return lead + (rest.charAt(0) || '');
    });
  };
  // cloze: which tokens of a chunk to hide. level 1 every 4th word, 2 every 3rd, 3 every other, 4 all of them.
  // `shift` moves the gaps so a second pass hides different words.
  P.EVERY = [0, 4, 3, 2, 1];
  P.clozeHide = function (k, level, shift) {
    var n = P.EVERY[level] || 4; return ((k + (shift || 0)) % n) === n - 1 || n === 1;
  };
  P.blank = function (tok) {   // "Austria," -> "_______,"
    return tok.replace(/[A-Za-zÀ-ɏ'’]+/g, function (m) { return new Array(m.length + 1).join('_'); });
  };
  /* ---------------- the recall checker ---------------- */
  function lev(a, b) {
    if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
    var p = [], i, j; for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) { var prev = p[0]; p[0] = i; for (j = 1; j <= b.length; j++) { var t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; } }
    return p[b.length];
  }
  P.lev = lev;
  // a small slip in a word: one letter off in a word of 4+ letters, two in 8+ (speech: one in 3+, two in 6+)
  function near(a, b, lenient) {
    var L = Math.max(a.length, b.length); if (L < (lenient ? 3 : 4)) return false;
    var lim = L >= (lenient ? 6 : 8) ? 2 : 1;
    if (Math.abs(a.length - b.length) > lim) return false;
    return lev(a, b) <= lim;
  }
  /* check(targetText, typedText, {lenient}) -> {
       words: [{w, st}]  one per check-word of the target, st 'ok' | 'near' (small slip) | 'miss',
       extra: [word, ...] typed words that aren't in the target,
       ok, slips, missed, total, pass }
     The typed words are lined up with the target's by the cheapest edit path (a missed word or an extra word costs 1, a slip 0.4);
     "battleline" for "battle-line" and "for ever" / "forever" both line up at no cost. */
  P.check = function (target, typed, opt) {
    opt = opt || {};
    var T = P.words(target), U = P.words(typed), n = T.length, m = U.length, W = m + 1;
    var cost = new Float32Array((n + 1) * W), how = new Uint8Array((n + 1) * W);   // 1 match, 2 slip, 3 miss, 4 extra, 5 T2=U1, 6 T1=U2
    var i, j;
    for (i = 1; i <= n; i++) { cost[i * W] = i; how[i * W] = 3; }
    for (j = 1; j <= m; j++) { cost[j] = j; how[j] = 4; }
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      var a = T[i - 1], b = U[j - 1], best = cost[(i - 1) * W + j] + 1, hw = 3, c;
      if ((c = cost[i * W + j - 1] + 1) < best) { best = c; hw = 4; }
      if (a === b) { if ((c = cost[(i - 1) * W + j - 1]) < best) { best = c; hw = 1; } }
      else if (near(a, b, opt.lenient) && (c = cost[(i - 1) * W + j - 1] + 0.4) < best) { best = c; hw = 2; }
      if (i > 1 && T[i - 2] + a === b && (c = cost[(i - 2) * W + j - 1]) < best) { best = c; hw = 5; }
      if (j > 1 && U[j - 2] + b === a && (c = cost[(i - 1) * W + j - 2]) < best) { best = c; hw = 6; }
      cost[i * W + j] = best; how[i * W + j] = hw;
    }
    var st = new Array(n), extra = [];
    i = n; j = m;
    while (i > 0 || j > 0) {
      var hw2 = how[i * W + j];
      if (hw2 === 1) { st[--i] = 'ok'; j--; }
      else if (hw2 === 2) { st[--i] = 'near'; j--; }
      else if (hw2 === 3) { st[--i] = 'miss'; }
      else if (hw2 === 4) { extra.unshift(U[--j]); }
      else if (hw2 === 5) { st[--i] = 'ok'; st[--i] = 'ok'; j--; }
      else if (hw2 === 6) { st[--i] = 'ok'; j -= 2; }
      else break;
    }
    var okN = 0, slips = 0, missed = 0;
    st.forEach(function (s) { if (s === 'ok') okN++; else if (s === 'near') slips++; else missed++; });
    var allowed = opt.lenient ? Math.max(2, Math.round(n * 0.1)) : 0;
    return { words: T.map(function (w, k) { return { w: w, st: st[k] }; }), extra: extra, ok: okN, slips: slips, missed: missed, total: n,
      pass: n > 0 && missed === 0 && extra.length <= allowed };
  };
  // a token's state from its check-words: a token is right only when all of its words are
  P.tokenStates = function (lines, res) {
    var k = 0;
    return lines.map(function (line) {
      return P.tokens(line).map(function (tk) {
        var s = 'ok'; for (var q = 0; q < tk.n; q++) { var x = res.words[k++]; if (!x) continue; if (x.st === 'miss') s = 'miss'; else if (x.st === 'near' && s === 'ok') s = 'near'; }
        return { t: tk.t, st: tk.n ? s : 'ok' };
      });
    });
  };
  return P;
});

/* ======================= the page ======================= */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  var P = window.TRBLepanto, M = window.TRBMem, root = document.getElementById('lep'), dataEl = document.getElementById('lep-data');
  if (!P || !M || !root || !dataEl) return;
  var D; try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var LINES = D.lines, N = LINES.length, SLUG = 'lepanto', WPM = D.words;
  var CH = D.chunks.map(function (c, i) { return { i: i, from: c.from - 1, to: c.to, hook: c.hook, key: (c.from - 1) + '-' + c.to }; });
  var SC = D.scenes;
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  function sceneOf(line) { for (var i = 0; i < SC.length; i++) if (line + 1 >= SC[i].from && line + 1 <= SC[i].to) return i; return 0; }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k]; else if (k === 'cls') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(t, f, c) { return h('button', { type: 'button', cls: 'mc-btn' + (c ? ' ' + c : ''), text: t, onclick: f }); }
  function seg(label, opts, cur, fn) {
    var g = h('div', { cls: 'mc-seg lep-seg', role: 'group', 'aria-label': label });
    opts.forEach(function (o) { g.appendChild(h('button', { type: 'button', cls: 'mc-btn' + (cur === o[0] ? ' is-on' : ''), 'aria-pressed': cur === o[0] ? 'true' : 'false', text: o[1], onclick: function () { fn(o[0]); } })); });
    return g;
  }
  function rng(a, b) { return a === b ? 'line ' + a : 'lines ' + a + '–' + b; }
  function chunkName(c) { return (c.i + 1) + '. L' + rng(c.from + 1, c.to).slice(1) + ': ' + LINES[c.from].replace(/^\(/, '').split(/\s+/).slice(0, 4).join(' ').replace(/[,;:.!—]+$/, '') + '…'; }
  function niceDate(s) { try { return M.parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); } catch (e) { return s; } }

  /* ---------- storage ---------- */
  function store() { var o = M.load(), S = M.listState(o, SLUG); return { o: o, S: S }; }
  var pref = { c: 0, step: 'read', level: 1, input: 'type' };
  try { var sv = M.load().lepPref; if (sv) { if (sv.c >= 0 && sv.c < CH.length) pref.c = sv.c; if (sv.step) pref.step = sv.step; if (sv.level >= 1 && sv.level <= 4) pref.level = sv.level; if (sv.input) pref.input = sv.input; } } catch (e) { }
  function savePref() { var o = M.load(); o.lepPref = Object.assign({}, o.lepPref || {}, { c: pref.c, step: pref.step, level: pref.level, input: pref.input }); M.save(o); }
  // record a recall result for a chunk: the first pass learns it; after that each result moves it along (or back to tomorrow)
  function record(c, ok) {
    var s = store(), today = M.today(), st = s.S.c[c.key];
    if (!st) { if (!ok) return null; s.S.c[c.key] = M.learn(today); }
    else if (M.isDue(st, today) || !ok) s.S.c[c.key] = M.review(st, ok, today);
    M.save(s.o); return s.S.c[c.key];
  }
  function stateOf(c) { return store().S.c[c.key] || null; }
  function dueList() { var S = store().S, t = M.today(); return CH.filter(function (c) { return M.isDue(S.c[c.key], t); }); }

  /* ---------- speech (only where the browser recognizes speech on this device) ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, speech = { status: '', old: false };
  function speechOffered() { return !!SR && (typeof SR.available === 'function' || typeof SR.availableOnDevice === 'function'); }
  function speechStatus() {
    if (!SR) return Promise.resolve('none');
    try {
      if (typeof SR.available === 'function') return SR.available({ langs: ['en-US'], processLocally: true }).then(function (s) { return s === 'available' ? 'local' : (s === 'downloadable' || s === 'downloading') ? 'download' : 'none'; }, function () { return 'none'; });
      if (typeof SR.availableOnDevice === 'function') { speech.old = true; return SR.availableOnDevice('en-US').then(function (s) { return s === 'available' ? 'local' : (s === 'downloadable' || s === 'downloading') ? 'download' : 'none'; }, function () { return 'none'; }); }
    } catch (e) { }
    return Promise.resolve('none');
  }
  function speechInstall() {
    try {
      var p = speech.old ? SR.installOnDevice('en-US') : SR.install({ langs: ['en-US'], processLocally: true });
      return Promise.resolve(p).then(function (ok) { return ok ? speechStatus() : 'none'; }, function () { return 'none'; });
    } catch (e) { return Promise.resolve('none'); }
  }
  // a recognizer that stays on the device, or null when that can't be promised
  function recognizer() {
    if (speech.status !== 'local') return null;
    var r; try { r = new SR(); } catch (e) { return null; }
    if ('processLocally' in r) r.processLocally = true;
    else if (speech.old && 'mode' in r) r.mode = 'ondevice-only';
    else return null;
    r.lang = 'en-US'; r.continuous = true; r.interimResults = true;
    return r;
  }

  /* ---------- an answer box: type it, or say it ---------- */
  // calls done(text, spoken) when the learner asks to check
  function answerBox(box, label, done) {
    var ta = h('textarea', { cls: 'mc-ta lep-ta', rows: 6, autocomplete: 'off', autocapitalize: 'sentences', spellcheck: 'false', 'aria-label': label, placeholder: 'Type the lines from memory. Punctuation and capitals don’t matter.' });
    var spoken = false, rec = null, live = h('p', { cls: 'mc-small lep-live', 'aria-live': 'polite' });
    var row = h('div', { cls: 'mc-row' });
    var check = btn('Check', function () { stop(); done(ta.value, spoken); }, 'mc-primary');
    row.appendChild(check);
    var sayB = null;
    function stop() { if (rec) { try { rec.stop(); } catch (e) { } } }
    // the Say button appears only where the browser offers on-device recognition; the device check runs when it is tapped
    function listen() {
      if (rec) { stop(); return; }
      rec = recognizer(); if (!rec) { live.textContent = 'Speech isn\u2019t available here. Type it instead.'; return; }
      var base = ta.value ? ta.value.replace(/\s*$/, ' ') : '';
      rec.onresult = function (e) {
        var fin = '', tmp = '';
        for (var q = 0; q < e.results.length; q++) { if (e.results[q].isFinal) fin += e.results[q][0].transcript + ' '; else tmp += e.results[q][0].transcript; }
        ta.value = base + fin + tmp; spoken = true;
      };
      rec.onerror = function (e) { live.textContent = e && e.error === 'not-allowed' ? 'The microphone is blocked for this page. Type it instead.' : 'Speech stopped. You can type, or try again.'; };
      rec.onend = function () { rec = null; sayB.textContent = '\ud83c\udfa4 Say it'; sayB.classList.remove('is-on'); if (!live.textContent) live.textContent = 'Stopped listening. Check it, or tap Say it to go on.'; };
      try { live.textContent = ''; rec.start(); live.textContent = 'Listening on this device\u2026 say the lines, then tap Stop.'; sayB.textContent = '\u25a0 Stop'; sayB.classList.add('is-on'); } catch (e) { rec = null; live.textContent = 'Speech could not start. Type it instead.'; }
    }
    if (speechOffered() && speech.status !== 'none') {
      sayB = btn('\ud83c\udfa4 Say it', function () {
        if (speech.status === 'local') return listen();
        if (speech.status === 'download') {
          live.textContent = 'Your browser is fetching its English speech model, once. It runs on this device.';
          return speechInstall().then(function (s) { speech.status = s; if (s === 'local') listen(); else { live.textContent = 'Speaking isn\u2019t available in this browser. Typing works everywhere.'; sayB.remove(); } });
        }
        live.textContent = 'Checking whether this browser can recognize speech on this device\u2026';
        speechStatus().then(function (s) {
          speech.status = s;
          if (s === 'local') { live.textContent = ''; listen(); }
          else if (s === 'download') live.textContent = 'This browser can recognize speech on this device after it fetches its English model. Tap Say it again to fetch it.';
          else { live.textContent = 'This browser can\u2019t recognize speech on this device, and we never send your voice anywhere, so please type instead.'; sayB.remove(); }
        });
      });
      row.appendChild(sayB);
    }
    box.appendChild(ta); box.appendChild(row); box.appendChild(live);
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); check.click(); } });
    return { ta: ta, stop: stop };
  }
  // show a checked answer: the lines with each word marked, and a summary
  function showResult(box, lines, res, firstLine) {
    var ts = P.tokenStates(lines, res), ol = h('ol', { cls: 'lep-lines lep-res', start: firstLine + 1 });
    ts.forEach(function (row) {
      var li = h('li');
      row.forEach(function (tk, k) {
        if (k) li.appendChild(document.createTextNode(' '));
        li.appendChild(h('span', { cls: 'lep-w is-' + tk.st, text: tk.t, title: tk.st === 'miss' ? 'missed' : tk.st === 'near' ? 'a small slip' : null }));
      });
      ol.appendChild(li);
    });
    var sum = res.ok + ' of ' + res.total + ' words right' + (res.slips ? ', ' + res.slips + ' with a small slip' : '') + (res.missed ? ', ' + res.missed + ' missed' : '') + '.';
    box.appendChild(h('p', { cls: 'mc-result', text: res.pass ? 'Word for word! ' + sum : sum }));
    if (res.extra.length) box.appendChild(h('p', { cls: 'mc-small', text: 'Words you added that aren’t in the poem here: ' + res.extra.slice(0, 20).join(', ') + (res.extra.length > 20 ? '…' : '') + '.' }));
    box.appendChild(h('p', { cls: 'mc-small lep-key' }, [h('span', { cls: 'lep-w is-ok', text: 'right' }), ' ', h('span', { cls: 'lep-w is-near', text: 'small slip' }), ' ', h('span', { cls: 'lep-w is-miss', text: 'missed' })]));
    box.appendChild(ol);
  }
  function linesOl(a, b, fn, cls) {
    var ol = h('ol', { cls: 'lep-lines' + (cls ? ' ' + cls : ''), start: a + 1 });
    for (var i = a; i < b; i++) ol.appendChild(fn(i));
    return ol;
  }

  /* ---------- tabs ---------- */
  var TABS = [['learn', 'Learn a chunk'], ['review', 'Review'], ['chain', 'Chain'], ['recital', 'Recital'], ['progress', 'Progress']];
  var tab = 'learn';
  function shell(t) {
    if (t) tab = t;
    root.innerHTML = '';
    var due = dueList().length;
    var tabs = h('div', { cls: 'mc-tabs', role: 'tablist', 'aria-label': 'Ways to practice' });
    TABS.forEach(function (x) {
      var b = h('button', { type: 'button', role: 'tab', id: 'lep-tab-' + x[0], 'aria-selected': tab === x[0] ? 'true' : 'false', 'aria-controls': 'lep-panel', text: x[1] + (x[0] === 'review' && due ? ' (' + due + ')' : ''), onclick: function () { shell(x[0]); } });
      tabs.appendChild(b);
    });
    root.appendChild(tabs);
    var box = h('div', { cls: 'lep-box', role: 'tabpanel', id: 'lep-panel', 'aria-labelledby': 'lep-tab-' + tab });
    root.appendChild(box);
    ({ learn: learn, review: review, chain: chain, recital: recital, progress: progress })[tab](box);
  }

  /* ---------- Learn a chunk ---------- */
  var shift = 0;
  function learn(box) {
    var c = CH[pref.c], st = stateOf(c);
    var sel = h('select', { cls: 'mc-sel lep-sel', id: 'lep-chunk', 'aria-label': 'Chunk' });
    var S = store().S, t = M.today();
    SC.forEach(function (s, si) {
      var og = h('optgroup', { label: ROMAN[si] + '. ' + s.title });
      CH.forEach(function (x) { if (sceneOf(x.from) === si) { var y = S.c[x.key]; og.appendChild(h('option', { value: x.i, text: chunkName(x) + (y ? (M.isDue(y, t) ? '  • due' : '  ✓') : '') })); } });
      sel.appendChild(og);
    });
    sel.value = String(pref.c);
    sel.onchange = function () { pref.c = +sel.value; pref.step = 'read'; savePref(); shell(); };
    var prev = btn('←', function () { if (pref.c > 0) { pref.c--; pref.step = 'read'; savePref(); shell(); } }), next = btn('→', function () { if (pref.c < CH.length - 1) { pref.c++; pref.step = 'read'; savePref(); shell(); } });
    prev.setAttribute('aria-label', 'Previous chunk'); next.setAttribute('aria-label', 'Next chunk');
    if (pref.c === 0) prev.disabled = true; if (pref.c === CH.length - 1) next.disabled = true;
    box.appendChild(h('div', { cls: 'mc-row lep-pick' }, [h('label', { 'for': 'lep-chunk', cls: 'mc-lab', text: 'Chunk' }), sel, prev, next]));
    var sc = sceneOf(c.from);
    box.appendChild(h('p', { cls: 'mc-small' }, [h('b', { text: 'Scene ' + ROMAN[sc] + ', ' + SC[sc].title }), ' · ' + (c.to - c.from) + ' lines · ' + (st ? 'stage: ' + M.stageName(st) + (M.isDue(st, M.today()) ? ', due today' : ', next review ' + niceDate(st.d)) : 'not learned yet')]));
    box.appendChild(seg('Step', [['read', '1 Read'], ['cue', '2 First letters'], ['cloze', '3 Gaps'], ['check', '4 Recall']], pref.step, function (s) { pref.step = s; savePref(); shell(); }));
    var stage = h('div', { cls: 'lep-stage' }); box.appendChild(stage);
    if (c.from > 0 && pref.step !== 'read') stage.appendChild(h('p', { cls: 'lep-before' }, [h('span', { cls: 'mc-small', text: 'Just before (line ' + c.from + '): ' }), LINES[c.from - 1]]));
    if (pref.step === 'read') {
      stage.appendChild(h('p', { cls: 'mc-tip', text: 'Read it aloud two or three times, slowly, and picture each line. Say what happens in it in your own words. Then go on to step 2.' }));
      stage.appendChild(linesOl(c.from, c.to, function (i) { return h('li', { text: LINES[i] }); }));
      if (c.hook) stage.appendChild(h('p', { cls: 'lep-hook' }, [h('b', { text: 'Hook: ' }), c.hook]));
      stage.appendChild(h('div', { cls: 'mc-row' }, [btn('Next: first letters →', function () { pref.step = 'cue'; savePref(); shell(); }, 'mc-primary')]));
    } else if (pref.step === 'cue') {
      stage.appendChild(h('p', { cls: 'mc-tip', text: 'Each word shows only its first letter. Say the full line aloud from the letters; tap a line to check it, tap again to hide it.' }));
      stage.appendChild(linesOl(c.from, c.to, function (i) {
        var b = h('button', { type: 'button', cls: 'lep-cueline', 'aria-pressed': 'false', text: P.firstLetters(LINES[i]) });
        b.onclick = function () { var on = b.getAttribute('aria-pressed') === 'true'; b.setAttribute('aria-pressed', on ? 'false' : 'true'); b.textContent = on ? P.firstLetters(LINES[i]) : LINES[i]; };
        return h('li', null, [b]);
      }, 'lep-cues'));
      stage.appendChild(h('div', { cls: 'mc-row' }, [btn('Next: gaps →', function () { pref.step = 'cloze'; savePref(); shell(); }, 'mc-primary')]));
    } else if (pref.step === 'cloze') {
      stage.appendChild(seg('How many gaps', [[1, 'Every 4th word'], [2, 'Every 3rd'], [3, 'Every other'], [4, 'All']], pref.level, function (l) { pref.level = l; savePref(); shell(); }));
      stage.appendChild(h('p', { cls: 'mc-tip', text: 'Say the whole chunk aloud, filling each gap from memory. Tap a gap to check it. When it comes easily, hide more words.' }));
      var k = 0;
      stage.appendChild(linesOl(c.from, c.to, function (i) {
        var li = h('li');
        P.tokens(LINES[i]).forEach(function (tk, j) {
          if (j) li.appendChild(document.createTextNode(' '));
          var hide = tk.n > 0 && P.clozeHide(k, pref.level, shift); if (tk.n > 0) k++;
          if (!hide) { li.appendChild(document.createTextNode(tk.t)); return; }
          var g = h('button', { type: 'button', cls: 'lep-gap', 'aria-label': 'Hidden word: tap to show', text: P.blank(tk.t) });
          g.onclick = function () { g.textContent = tk.t; g.classList.add('is-shown'); g.removeAttribute('aria-label'); };
          li.appendChild(g);
        });
        return li;
      }));
      stage.appendChild(h('div', { cls: 'mc-row' }, [
        btn('Different gaps', function () { shift = (shift + 1) % 4; shell(); }),
        btn('Show all', function () { stage.querySelectorAll('.lep-gap').forEach(function (g) { g.click(); }); }),
        pref.level < 4 ? btn('More gaps', function () { pref.level++; savePref(); shell(); }) : null,
        btn('Next: recall →', function () { pref.step = 'check'; savePref(); shell(); }, 'mc-primary')]));
    } else {
      recallChunk(stage, c, false);
    }
  }
  // recall one chunk: type or say it, or recite aloud and mark it yourself. isReview: part of a review run
  function recallChunk(stage, c, isReview, after) {
    var text = LINES.slice(c.from, c.to).join('\n');
    var how = h('div');
    stage.appendChild(seg('How to check', [['type', 'Type or say it'], ['aloud', 'Say it aloud, then look']], pref.input, function (v) { pref.input = v; savePref(); stage.innerHTML = ''; recallChunk(stage, c, isReview, after); }));
    stage.appendChild(how);
    var cue = 'Starts: ' + P.firstLetters(LINES[c.from]);
    if (pref.input === 'aloud') {
      how.appendChild(h('p', { cls: 'mc-tip', text: 'Cover the page and say all ' + (c.to - c.from) + ' lines out loud. Then reveal them and be strict: a missed or changed word counts as a slip.' }));
      how.appendChild(h('p', { cls: 'lep-cue', text: cue }));
      var reveal = btn('Reveal the lines', function () {
        reveal.remove();
        how.appendChild(linesOl(c.from, c.to, function (i) { return h('li', { text: LINES[i] }); }));
        how.appendChild(h('div', { cls: 'mc-row' }, [btn('I had it word for word', function () { finish(true); }, 'mc-primary'), btn('I slipped', function () { finish(false); })]));
      }, 'mc-primary');
      how.appendChild(h('div', { cls: 'mc-row' }, [reveal]));
    } else {
      how.appendChild(h('p', { cls: 'mc-tip', text: 'Write (or say) the ' + (c.to - c.from) + ' lines from memory. Punctuation and capitals don’t count; every word does.' + (speechOffered() && speech.status !== 'none' ? ' To say it instead, tap Say it: speech is recognized on this device only, and nothing is sent anywhere.' : '') }));
      how.appendChild(h('p', { cls: 'lep-cue', text: cue }));
      var ab = answerBox(how, 'Lines ' + (c.from + 1) + ' to ' + c.to, function (val, spoken) {
        if (!val.trim()) { ab.ta.focus(); return; }
        var res = P.check(text, val, { lenient: spoken });
        how.innerHTML = '';
        showResult(how, LINES.slice(c.from, c.to), res, c.from);
        finish(res.pass, how);
      });
      if (!isReview) setTimeout(function () { try { ab.ta.focus({ preventScroll: true }); } catch (e) { } }, 0);
    }
    function finish(ok, into) {
      var st = record(c, ok), out = into || how;
      if (!into) out.innerHTML = '';
      var msg;
      if (ok) msg = st ? (st.n ? 'Next review: ' + niceDate(st.d) + '.' : 'Learned! It comes back for review on ' + niceDate(st.d) + ', then on day 3, 7 and 21.') : '';
      else msg = stateOf(c) ? 'It comes back tomorrow. Look at the slips, read it once more, and try again now if you like.' : 'Not yet: go back to the gaps for a minute, then try again. It counts as learned once you get it word for word.';
      out.appendChild(h('p', { cls: ok ? 'lep-ok' : 'lep-no', text: msg }));
      var row = h('div', { cls: 'mc-row' });
      if (after) row.appendChild(btn('Next', after, 'mc-primary'));
      else {
        row.appendChild(btn('Try again', function () { shell(); }, ok ? '' : 'mc-primary'));
        if (!ok) row.appendChild(btn('Back to the gaps', function () { pref.step = 'cloze'; savePref(); shell(); }));
        if (ok && c.i < CH.length - 1) row.appendChild(btn('Next chunk →', function () { pref.c = c.i + 1; pref.step = 'read'; savePref(); shell(); }, 'mc-primary'));
        if (ok && c.i > 0) row.appendChild(btn('Chain it to the start', function () { chainTo = c.i; shell('chain'); }));
      }
      out.appendChild(row);
      try { out.querySelector('.mc-btn').focus({ preventScroll: true }); } catch (e) { }
    }
  }

  /* ---------- Review: the chunks due today ---------- */
  function review(box) {
    var due = dueList(), S = store().S;
    if (!due.length) {
      var up = CH.map(function (c) { return { c: c, st: S.c[c.key] }; }).filter(function (x) { return x.st; }).sort(function (a, b) { return a.st.d < b.st.d ? -1 : 1; });
      box.appendChild(h('p', { cls: 'mc-result', text: up.length ? 'Nothing is due today.' : 'No chunks learned yet.' }));
      box.appendChild(h('p', { cls: 'mc-tip', text: up.length ? 'The next review is ' + chunkName(up[0].c) + ' on ' + niceDate(up[0].st.d) + '. Each chunk comes back on day 1, 3, 7 and 21 after you learn it, then about monthly.' : 'Start with the first chunk in Learn a chunk. Once you can recall it word for word, it comes back here on day 1, 3, 7 and 21.' }));
      box.appendChild(h('div', { cls: 'mc-row' }, [btn('Learn a chunk', function () { shell('learn'); }, 'mc-primary')]));
      return;
    }
    box.appendChild(h('p', { cls: 'mc-tip', text: due.length + (due.length > 1 ? ' chunks are' : ' chunk is') + ' ready for review. Old chunks before new ones: a quick recall now keeps each from fading. A chunk you get word for word moves to its next review day; a slip brings it back tomorrow.' }));
    var ul = h('ul', { cls: 'mc-chunks' });
    due.forEach(function (c) { ul.appendChild(h('li', { cls: 'is-due' }, [h('span', { cls: 'mc-cl' }, [h('b', { text: chunkName(c) }), h('small', { text: LINES[c.from] })]), h('span', { cls: 'mc-cs', text: M.stageName(S.c[c.key]) })])); });
    box.appendChild(ul);
    var go = btn('Start the review', function () { run(0); }, 'mc-primary');
    box.appendChild(h('div', { cls: 'mc-row' }, [go]));
    function run(k) {
      box.innerHTML = '';
      if (k >= due.length) {
        box.appendChild(h('p', { cls: 'mc-result', text: 'Review done.' }));
        box.appendChild(h('div', { cls: 'mc-row' }, [btn('Learn the next chunk', function () { var n = CH.filter(function (c) { return !stateOf(c); })[0]; if (n) pref.c = n.i; pref.step = 'read'; savePref(); shell('learn'); }, 'mc-primary'), btn('Progress', function () { shell('progress'); })]));
        return;
      }
      var c = due[k];
      box.appendChild(h('p', { cls: 'mc-shead', text: 'Review ' + (k + 1) + ' of ' + due.length + ' · ' + chunkName(c) }));
      if (c.from > 0) box.appendChild(h('p', { cls: 'lep-before' }, [h('span', { cls: 'mc-small', text: 'Just before (line ' + c.from + '): ' }), LINES[c.from - 1]]));
      var stage = h('div'); box.appendChild(stage);
      recallChunk(stage, c, true, function () { run(k + 1); });
    }
  }

  /* ---------- Chain: chunks a..b in one go ---------- */
  var chainTo = null;
  function chain(box) {
    var S = store().S, learned = CH.filter(function (c) { return S.c[c.key]; }).length;
    var last = 0; while (last < CH.length && S.c[CH[last].key]) last++;
    var to = chainTo != null ? chainTo : Math.max(0, last - 1); chainTo = null;
    var from = 0;
    var best = S.best.chain || 0;
    box.appendChild(h('p', { cls: 'mc-tip', text: 'A poem is a chain: each line should pull the next one after it. Recite from the start (or any chunk) through the chunk you just learned, without looking. This is how the whole poem gets built, link by link.' }));
    var fa = h('select', { cls: 'mc-sel', id: 'lep-cf' }), fb = h('select', { cls: 'mc-sel', id: 'lep-ct' });
    CH.forEach(function (c) { fa.appendChild(h('option', { value: c.i, text: chunkName(c) })); fb.appendChild(h('option', { value: c.i, text: chunkName(c) })); });
    fa.value = String(from); fb.value = String(to);
    box.appendChild(h('div', { cls: 'lep-form' }, [h('label', { 'for': 'lep-cf', cls: 'mc-lab', text: 'From' }), fa, h('label', { 'for': 'lep-ct', cls: 'mc-lab', text: 'Through' }), fb]));
    box.appendChild(h('p', { cls: 'mc-small', text: learned + ' of ' + CH.length + ' chunks learned' + (best ? '. Your longest clean chain from the start: chunks 1 to ' + best + ' (through line ' + CH[best - 1].to + ').' : '.') }));
    var stage = h('div'); box.appendChild(stage);
    function go() {
      var a = +fa.value, b = +fb.value; if (b < a) { var t = a; a = b; b = t; }
      var A = CH[a].from, B = CH[b].to;
      stage.innerHTML = '';
      stage.appendChild(h('p', { cls: 'lep-cue', text: (A > 0 ? 'After: “' + LINES[A - 1] + '”  ' : '') + 'Starts: ' + P.firstLetters(LINES[A]) }));
      if (pref.input === 'aloud') {
        stage.appendChild(h('p', { cls: 'mc-tip', text: 'Say lines ' + (A + 1) + ' to ' + B + ' aloud, then reveal them and mark each chunk.' }));
        var rv = btn('Reveal', function () {
          rv.remove();
          var marks = {};
          for (var q = a; q <= b; q++) (function (c) {
            stage.appendChild(h('p', { cls: 'mc-shead', text: chunkName(c) }));
            stage.appendChild(linesOl(c.from, c.to, function (i) { return h('li', { text: LINES[i] }); }));
            var r = h('div', { cls: 'mc-row' }); var y = btn('Had it', function () { marks[c.i] = true; y.classList.add('is-on'); n.classList.remove('is-on'); }), n = btn('Slipped', function () { marks[c.i] = false; n.classList.add('is-on'); y.classList.remove('is-on'); });
            r.appendChild(y); r.appendChild(n); stage.appendChild(r);
          })(CH[q]);
          stage.appendChild(h('div', { cls: 'mc-row' }, [btn('Done', function () { var res = []; for (var q = a; q <= b; q++) res.push(marks[q] === true); done(a, b, res); }, 'mc-primary')]));
        }, 'mc-primary');
        stage.appendChild(h('div', { cls: 'mc-row' }, [rv]));
      } else {
        var ab = answerBox(stage, 'Lines ' + (A + 1) + ' to ' + B, function (val, spoken) {
          if (!val.trim()) { ab.ta.focus(); return; }
          var res = P.check(LINES.slice(A, B).join('\n'), val, { lenient: spoken });
          stage.innerHTML = '';
          // per chunk: right when none of its words were missed
          var k = 0, per = [];
          for (var q = a; q <= b; q++) { var c = CH[q], nW = P.words(LINES.slice(c.from, c.to).join(' ')).length, okc = true; for (var z = 0; z < nW; z++) if (res.words[k + z].st === 'miss') okc = false; k += nW; per.push(okc); }
          showResult(stage, LINES.slice(A, B), res, A);
          done(a, b, per, res.pass);
        });
      }
    }
    function done(a, b, per, allPass) {
      var s = store(), clean = per.every(Boolean);
      if (a === 0 && clean && b + 1 > (s.S.best.chain || 0)) { s.S.best.chain = b + 1; M.save(s.o); }
      // a chain counts as a review for any chunk in it that is due
      var t = M.today(); for (var q = a; q <= b; q++) { var c = CH[q], st = s.S.c[c.key]; if (st && M.isDue(st, t)) record(c, per[q - a]); }
      var bad = []; per.forEach(function (ok, q) { if (!ok) bad.push(a + q + 1); });
      stage.appendChild(h('p', { cls: clean ? 'lep-ok' : 'lep-no', text: clean ? 'The whole chain held: chunks ' + (a + 1) + ' to ' + (b + 1) + '.' + (a === 0 && b + 1 >= (store().S.best.chain || 0) ? ' That’s your longest chain from the start.' : '') : 'Weak links: chunk' + (bad.length > 1 ? 's ' : ' ') + bad.join(', ') + '. Practice those on their own, then chain again.' }));
      stage.appendChild(h('div', { cls: 'mc-row' }, [btn('Again', function () { chainTo = b; shell('chain'); }, 'mc-primary'), bad.length ? btn('Practice chunk ' + bad[0], function () { pref.c = bad[0] - 1; pref.step = 'cue'; savePref(); shell('learn'); }) : null]));
    }
    box.appendChild(seg('How to check', [['type', 'Type or say it'], ['aloud', 'Say it aloud, then look']], pref.input, function (v) { pref.input = v; savePref(); chainTo = +fb.value; shell('chain'); }));
    box.appendChild(h('div', { cls: 'mc-row' }, [btn('Begin', go, 'mc-primary')]));
  }

  /* ---------- Recital: the whole poem against the clock ---------- */
  var PACES = [['stately', 'Stately', 110], ['steady', 'Steady', 135], ['brisk', 'Brisk', 170]];
  function mins(w) { return Math.round(WPM / w) + ' minutes'; }
  function recital(box) {
    var o = M.load(), S = M.listState(o, SLUG), pace = (o.lepPref && o.lepPref.pace) || 'steady';
    box.appendChild(h('p', { cls: 'mc-tip', text: 'The test of the whole thing: stand up and recite all ' + N + ' lines, aloud, from memory. At ' + WPM.toLocaleString() + ' words, a slow, stately reading takes about 12 minutes, a steady one about 10, and a brisk, galloping one about 8. Pick a pace to aim for, start the clock, and go.' }));
    box.appendChild(seg('Target pace', PACES.map(function (p) { return [p[0], p[1] + ' · ' + mins(p[2])]; }), pace, function (v) { var oo = M.load(); oo.lepPref = Object.assign({}, oo.lepPref || {}, { pace: v }); M.save(oo); shell('recital'); }));
    var target = PACES.filter(function (p) { return p[0] === pace; })[0], tMs = WPM / target[2] * 60000;
    if (S.best.recite) box.appendChild(h('p', { cls: 'mc-small', text: 'Your best recital with no peeks: ' + M.fmtTime(S.best.recite) + '.' + (S.best.reciteN ? ' Recitals finished: ' + S.best.reciteN + '.' : '') }));
    var clock = h('div', { cls: 'lep-clock', role: 'timer', 'aria-live': 'off', text: '0:00' });
    var bar = h('div', { cls: 'lep-pace', 'aria-hidden': 'true' }, [h('i')]);
    var sub = h('p', { cls: 'mc-small lep-sub', text: 'Target: ' + target[1].toLowerCase() + ', about ' + mins(target[2]) + '.' });
    box.appendChild(clock); box.appendChild(bar); box.appendChild(sub);
    var peeks = 0, t0 = 0, iv = null, peekBox = h('div', { cls: 'lep-peek', hidden: 'hidden' });
    var start = btn('Start', function () {
      t0 = Date.now(); peeks = 0; start.hidden = true; row2.hidden = false;
      iv = setInterval(tick, 250); tick();
      try { stopB.focus({ preventScroll: true }); } catch (e) { }
    }, 'mc-primary');
    var peekB = btn('Peek (first letters)', function () {
      var open = peekBox.hidden; peekBox.hidden = !open; peekB.classList.toggle('is-on', open);
      if (open) { peeks++; if (!peekBox.firstChild) fillPeek(); }
    });
    var stopB = btn('Done', function () { finish(); }, 'mc-primary');
    var quit = btn('Stop without saving', function () { clearInterval(iv); shell('recital'); }, 'mc-quiet');
    var row2 = h('div', { cls: 'mc-row', hidden: 'hidden' }, [stopB, peekB, quit]);
    box.appendChild(h('div', { cls: 'mc-row' }, [start])); box.appendChild(row2); box.appendChild(peekBox);
    function fillPeek() {
      SC.forEach(function (s, si) {
        peekBox.appendChild(h('p', { cls: 'mc-shead', text: ROMAN[si] + '. ' + s.title }));
        peekBox.appendChild(linesOl(s.from - 1, s.to, function (i) { return h('li', { text: P.firstLetters(LINES[i]) }); }, 'lep-cues'));
      });
    }
    function tick() {
      var ms = Date.now() - t0, s = Math.floor(ms / 1000);
      clock.textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2);
      bar.firstChild.style.width = Math.min(100, 100 * ms / tMs) + '%';
      bar.classList.toggle('is-over', ms > tMs);
    }
    function finish() {
      clearInterval(iv); var ms = Date.now() - t0;
      var oo = M.load(), SS = M.listState(oo, SLUG), rec = false;
      SS.best.reciteN = (SS.best.reciteN || 0) + 1;
      if (!peeks && (SS.best.recite == null || ms < SS.best.recite)) { SS.best.recite = ms; rec = true; }
      M.save(oo);
      box.innerHTML = '';
      var diff = ms - tMs, wpm = Math.round(WPM / (ms / 60000));
      box.appendChild(h('p', { cls: 'mc-result', text: 'The whole poem in ' + M.fmtTime(ms) + (peeks ? ', with ' + peeks + (peeks > 1 ? ' peeks' : ' peek') : ', no peeks') + '.' }));
      box.appendChild(h('p', { text: 'That is about ' + wpm + ' words a minute; your target was about ' + mins(target[2]) + ' (' + (Math.abs(diff) < 30000 ? 'right on it' : diff < 0 ? M.fmtTime(-diff) + ' quicker' : M.fmtTime(diff) + ' slower') + '). ' + (rec ? 'A new best for a clean recital. ' : '') + (wpm > 180 ? 'Fast is fine for practice, but for listeners slow down and let the drums land.' : '') }));
      box.appendChild(h('p', { cls: 'mc-small', text: 'The clock only knows how long you took. Be honest with yourself about the words: if a line went missing, practice that chunk and chain it again.' }));
      box.appendChild(h('div', { cls: 'mc-row' }, [btn('Again', function () { shell('recital'); }, 'mc-primary'), btn('Progress', function () { shell('progress'); })]));
    }
  }

  /* ---------- Progress ---------- */
  function progress(box) {
    var S = store().S, t = M.today(), lines = 0, kept = 0, due = 0;
    var grid = h('ol', { cls: 'lep-grid' });
    CH.forEach(function (c) {
      var st = S.c[c.key], cls = st ? (M.isDue(st, t) ? 'is-due' : st.s >= M.OFF.length ? 'is-kept' : 'is-learned') : '';
      if (st) { lines += c.to - c.from; if (st.s >= M.OFF.length) kept += c.to - c.from; if (M.isDue(st, t)) due++; }
      var b = h('button', { type: 'button', cls: 'lep-cell ' + cls, title: chunkName(c), 'aria-label': chunkName(c) + ': ' + (st ? M.stageName(st) + (M.isDue(st, t) ? ', due' : '') : 'new') }, [h('b', { text: String(c.i + 1) }), h('small', { text: st ? (M.isDue(st, t) ? 'due' : M.stageName(st)) : 'new' })]);
      b.onclick = function () { pref.c = c.i; pref.step = st ? 'check' : 'read'; savePref(); shell('learn'); };
      grid.appendChild(h('li', null, [b]));
    });
    box.appendChild(h('p', { cls: 'mc-result', text: lines + ' of ' + N + ' lines learned' + (kept ? ', ' + kept + ' kept for the long run' : '') + '.' }));
    box.appendChild(h('div', { cls: 'mc-bar lep-bar', 'aria-hidden': 'true' }, [h('i', { style: 'width:' + Math.round(100 * lines / N) + '%' })]));
    box.appendChild(h('p', { cls: 'mc-small', text: (due ? due + (due > 1 ? ' chunks are' : ' chunk is') + ' due for review. ' : '') + (S.best.chain ? 'Longest clean chain from the start: chunks 1 to ' + S.best.chain + '. ' : '') + (S.best.recite ? 'Best clean recital: ' + M.fmtTime(S.best.recite) + '.' : '') }));
    box.appendChild(grid);
    box.appendChild(h('p', { cls: 'mc-small lep-key' }, [h('span', { cls: 'lep-cell-k', text: 'new' }), ' ', h('span', { cls: 'lep-cell-k is-learned', text: 'learning (day 1 to 21)' }), ' ', h('span', { cls: 'lep-cell-k is-kept', text: 'kept' }), ' ', h('span', { cls: 'lep-cell-k is-due', text: 'due' })]));
    var pace = lines < N ? (function () { var left = N - lines; return 'At 5 new lines a week, the rest takes about ' + Math.ceil(left / 5) + ' weeks; at 10 a week, about ' + Math.ceil(left / 10) + '.'; })() : 'Every line learned. Keep it alive with a recital now and then.';
    box.appendChild(h('p', { cls: 'mc-tip', text: pace + ' Progress stays on this device, for whoever is signed in as the learner.' }));
    var rs = btn('Start over', function () {
      if (rs.dataset.sure) { var s = store(); delete s.o.lists[SLUG]; M.save(s.o); shell('progress'); return; }
      rs.dataset.sure = '1'; rs.textContent = 'Tap again to erase your Lepanto progress';
    }, 'mc-quiet');
    box.appendChild(h('div', { cls: 'mc-row' }, [rs]));
  }

  /* ---------- the whole poem below: read, first letters, gaps ---------- */
  function poemView() {
    var poem = document.getElementById('lep-poem'), bar = document.getElementById('lep-view');
    if (!poem || !bar) return;
    var orig = []; poem.querySelectorAll('.lep-t').forEach(function (el, i) { orig[i] = el.textContent; });
    var mode = 'read';
    function set(m) {
      mode = m; var k = 0;
      poem.querySelectorAll('.lep-t').forEach(function (el, i) {
        if (m === 'read') { el.textContent = orig[i]; return; }
        if (m === 'cue') { el.textContent = P.firstLetters(orig[i]); return; }
        el.textContent = '';
        P.tokens(orig[i]).forEach(function (tk, j) {
          if (j) el.appendChild(document.createTextNode(' '));
          var hide = tk.n > 0 && P.clozeHide(k, 2, 0); if (tk.n > 0) k++;
          if (!hide) { el.appendChild(document.createTextNode(tk.t)); return; }
          var g = h('button', { type: 'button', cls: 'lep-gap', 'aria-label': 'Hidden word: tap to show', text: P.blank(tk.t) });
          g.onclick = function () { g.textContent = tk.t; g.classList.add('is-shown'); g.removeAttribute('aria-label'); };
          el.appendChild(g);
        });
      });
      bar.innerHTML = ''; bar.appendChild(seg('Show the poem', [['read', 'Full text'], ['cue', 'First letters'], ['gaps', 'Every 3rd word hidden']], mode, set));
    }
    set('read'); bar.hidden = false;
  }

  var hash = (location.hash || '').slice(1);
  if (hash === 'learn' && dueList().length) tab = 'review';
  else { var mh = /^c(\d+)$/.exec(hash); if (mh && +mh[1] >= 1 && +mh[1] <= CH.length) { pref.c = +mh[1] - 1; pref.step = 'read'; } }
  shell();
  poemView();
})();
