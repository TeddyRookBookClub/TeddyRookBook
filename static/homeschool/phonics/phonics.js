/* Phonics Practice (Teddy Rook Book), a companion to Hannah Ward's reading lessons.
   Kid mode: one task at a time, big touch targets, no timers, gentle feedback.
   The voice (browser speechSynthesis) only ever says whole words and sentences, never single sounds.
   Progress per child in localStorage "trb-phonics-v1". Data: window.PHONICS (from data/phonics.json). */
(function (W, D) {
  'use strict';
  var DATA = W.PHONICS, PD = W.PhonicsDecode, root = D.getElementById('pp');
  if (!DATA || !PD || !root) return;
  var KEY = 'trb-phonics-v1', ROUND = 6;
  var HUB = (D.querySelector('.hs-crumbs a[href$="/phonics-practice/"]') || {}).href || '';

  // ---------------- store ----------------
  var st = { v: 1, kids: [{ id: 'k1', name: 'Reader 1' }], cur: 'k1', voice: true, p: {} };
  try {
    var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null');
    if (sv && sv.kids && sv.kids.length) { st.kids = sv.kids; st.cur = sv.cur; st.voice = sv.voice !== false; st.p = sv.p || {}; }
  } catch (e) { }
  if (!st.kids.some(function (k) { return k.id === st.cur; })) st.cur = st.kids[0].id;
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function kid() { for (var i = 0; i < st.kids.length; i++) if (st.kids[i].id === st.cur) return st.kids[i]; return st.kids[0]; }
  function prog(key, id) { var p = st.p[id || st.cur] || (st.p[id || st.cur] = {}); return p[key] || (p[key] = {}); }
  function stepDone(s, id) { var p = prog(s.key, id); return s.acts.every(function (a) { return p[a] > 0; }); }
  function actsDone(s, id) { var p = prog(s.key, id); return s.acts.filter(function (a) { return p[a] > 0; }).length; }

  // ---------------- helpers ----------------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pickN(a, n) { return shuffle(a).slice(0, n); }
  function plain(w) { return String(w).replace(/\|/g, ''); }
  var PRAISE = ['Yes!', 'You did it!', 'Great reading!', 'Nice work!', 'Well done!', 'Super!', 'That’s it!'];
  function praise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

  var SVG = {
    igloo: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M5 52a27 27 0 0 1 54 0z" fill="#eef6fb" stroke="#5f86a6" stroke-width="2.5"/><path d="M9 40h46M15 30h34M23 21h18M20 52v-12M32 40V30M44 52v-12M26 30v-9M38 30v-9" stroke="#9db8cc" stroke-width="2"/><path d="M24 52v-6a8 8 0 0 1 16 0v6z" fill="#3c5a73"/><path d="M2 52h60" stroke="#5f86a6" stroke-width="2.5" stroke-linecap="round"/></svg>',
    coin: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="#e9b949" stroke="#b8862b" stroke-width="3"/><circle cx="32" cy="32" r="18" fill="none" stroke="#c99a35" stroke-width="2.5"/><path d="M32 22l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6-6.2 3.6 1.4-7-5.2-4.8 7-.8z" fill="#c99a35"/><path d="M19 22a16 16 0 0 1 8-6" stroke="#fff3c4" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'
  };
  function pic(p, label) {
    if (!p) return '';
    if (p.indexOf('svg:') === 0) return '<span class="pp-pic" role="img" aria-label="' + esc(label || '') + '">' + (SVG[p.slice(4)] || '') + '</span>';
    return '<span class="pp-pic" role="img" aria-label="' + esc(label || '') + '">' + p + '</span>';
  }
  function picFor(w) { return DATA.pics[plain(w)] || ''; }

  // ---------------- voice: whole words and sentences only ----------------
  var canSpeak = 'speechSynthesis' in W && typeof W.SpeechSynthesisUtterance === 'function', voice = null;
  function pickVoice() {
    try {
      var vs = W.speechSynthesis.getVoices() || [];
      voice = vs.filter(function (v) { return /^en[-_]US/i.test(v.lang) && v.localService; })[0] || vs.filter(function (v) { return /^en[-_]US/i.test(v.lang); })[0] || vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
    } catch (e) { }
  }
  if (canSpeak) { pickVoice(); try { W.speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { } }
  function speak(text) {
    if (!st.voice || !canSpeak || !text) return;
    try {
      W.speechSynthesis.cancel();
      var u = new W.SpeechSynthesisUtterance(String(text).replace(/[“”]/g, '"'));
      u.lang = 'en-US'; if (voice) u.voice = voice; u.rate = 0.8;
      W.speechSynthesis.speak(u);
    } catch (e) { }
  }

  // ---------------- children (both pages) ----------------
  function addKid(name) {
    name = String(name || '').trim().slice(0, 24); if (!name) return false;
    var id = 'k' + Date.now().toString(36);
    if (st.kids.length === 1 && st.kids[0].name === 'Reader 1' && !Object.keys(st.p[st.kids[0].id] || {}).length) st.kids = [];
    st.kids.push({ id: id, name: name }); st.cur = id; save(); return true;
  }

  if (root.classList.contains('pp-hub')) { hub(); return; }

  // =========================================================
  // Step page
  // =========================================================
  var idx = -1;
  DATA.steps.forEach(function (s, i) { if (s.key === root.dataset.step) idx = i; });
  if (idx < 0) return;
  var S = DATA.steps[idx], CTX = PD.context(DATA, idx), CTXS = [];
  var stage = D.getElementById('pp-stage'), actsEl = D.getElementById('pp-acts'), kidEl = D.getElementById('pp-kid');
  var ACTS = {
    cards: ['🃏', idx === 0 ? 'Letter cards' : 'Sound cards'], 'case': ['🔠', 'Big and small'], sound: ['👂', 'Find the sound'],
    first: ['🖼️', 'First sound'], middle: ['🎯', 'Middle sound'], blend: ['👉', 'Sound it out'], family: ['🏠', 'Word families'],
    build: ['🧱', 'Build it'], pick: ['🔍', 'Read and pick'], heart: ['❤️', 'Heart words'], sentences: ['📝', 'Sentences'], story: ['📖', 'Story']
  };
  var touched = false; // move focus only after the child has started

  // words with their sound units at this step
  function unitsOf(w) { var r = PD.check(plain(w), CTX); return r.ok && r.units ? r.units : null; }
  function stepUnitsBefore(i) { var o = []; for (var k = 0; k <= i; k++) (DATA.steps[k].units || []).forEach(function (u) { o.push(u); }); return o; }
  var LETTERS = DATA.steps[0].units; // all 26 letter sounds (qu for q)

  // ---- children bar ----
  var sel = D.getElementById('pp-child');
  function fillKids() {
    sel.innerHTML = st.kids.map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === st.cur ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('');
  }
  fillKids();
  sel.addEventListener('change', function () { st.cur = sel.value; save(); paintActs(); if (cur.act) startAct(cur.act); });
  var addF = D.getElementById('pp-addf'), addB = D.getElementById('pp-add');
  addB.addEventListener('click', function () { addF.hidden = !addF.hidden; if (!addF.hidden) D.getElementById('pp-name').focus(); });
  D.getElementById('pp-addx').addEventListener('click', function () { addF.hidden = true; addB.focus(); });
  addF.addEventListener('submit', function (e) {
    e.preventDefault(); var inp = D.getElementById('pp-name');
    if (addKid(inp.value)) { inp.value = ''; addF.hidden = true; fillKids(); paintActs(); startAct(cur.act || S.acts[0]); }
  });
  var sndB = D.getElementById('pp-sound');
  function paintSound() { sndB.setAttribute('aria-pressed', st.voice ? 'true' : 'false'); sndB.textContent = st.voice ? '🔊 Voice on' : '🔇 Voice off'; }
  if (!canSpeak) { st.voice = false; sndB.disabled = true; sndB.title = 'This browser has no speech voice.'; }
  paintSound();
  sndB.addEventListener('click', function () { st.voice = !st.voice; if (!st.voice && canSpeak) try { W.speechSynthesis.cancel(); } catch (e) { } save(); paintSound(); });
  var fullB = D.getElementById('pp-full');
  function setFull(on) {
    kidEl.classList.toggle('pp-isfull', on); D.documentElement.classList.toggle('pp-noscroll', on);
    fullB.setAttribute('aria-pressed', on ? 'true' : 'false'); fullB.textContent = on ? '✕ Close big screen' : '⛶ Big screen';
  }
  fullB.addEventListener('click', function () { setFull(!kidEl.classList.contains('pp-isfull')); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && kidEl.classList.contains('pp-isfull')) { setFull(false); fullB.focus(); } });

  // ---- print ----
  D.querySelectorAll('[data-print]').forEach(function (b) {
    b.addEventListener('click', function () { D.documentElement.setAttribute('data-pp-print', b.dataset.print); W.print(); });
  });
  W.addEventListener('afterprint', function () { D.documentElement.removeAttribute('data-pp-print'); });

  // ---- activity buttons ----
  function paintActs() {
    var p = prog(S.key);
    actsEl.innerHTML = S.acts.map(function (a) {
      var n = p[a] || 0;
      return '<button type="button" class="pp-act' + (cur.act === a ? ' on' : '') + '" data-act="' + a + '" aria-pressed="' + (cur.act === a) + '">' +
        '<span class="pp-act-ic" aria-hidden="true">' + ACTS[a][0] + '</span><span class="pp-act-t">' + ACTS[a][1] + '</span>' +
        (n ? '<span class="pp-act-ok" aria-label="done">✓</span>' : '') + '</button>';
    }).join('');
  }
  actsEl.addEventListener('click', function (e) { var b = e.target.closest('[data-act]'); if (b) { touched = true; startAct(b.dataset.act); } });

  // ---- stage scaffolding ----
  var cur = { act: null, items: [], i: 0, data: null };
  function frame(title, body, opts) {
    opts = opts || {};
    var dots = '';
    if (opts.total) { for (var k = 0; k < opts.total; k++) dots += '<i class="' + (k < opts.at ? 'd' : k === opts.at ? 'c' : '') + '"></i>'; dots = '<span class="pp-dots" aria-label="' + (opts.at + 1) + ' of ' + opts.total + '">' + dots + '</span>'; }
    stage.innerHTML = '<div class="pp-top"><h2>' + esc(title) + '</h2>' + dots + '</div><div class="pp-task">' + body + '</div>' +
      '<p class="pp-fb" id="pp-fb" aria-live="polite"></p><div class="pp-ctl" id="pp-ctl"></div>';
    if (touched) { var f = stage.querySelector('[data-focus]') || stage.querySelector('.pp-task button, .pp-task input'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
  }
  function fb(html, cls) { var f = D.getElementById('pp-fb'); if (f) { f.className = 'pp-fb ' + (cls || ''); f.innerHTML = html; } }
  function ctl(html) { var c = D.getElementById('pp-ctl'); c.innerHTML = html; return c; }
  function nextBtn(label, fn) {
    var c = ctl('<button type="button" class="pp-next" id="pp-next">' + (label || 'Next →') + '</button>');
    var b = c.querySelector('button'); b.addEventListener('click', function () { touched = true; fn(); });
    try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
  }
  function advance() { cur.i++; if (cur.i >= cur.items.length) finish(); else RUN[cur.act](); }
  function finish() {
    var p = prog(S.key); p[cur.act] = (p[cur.act] || 0) + 1; save(); paintActs();
    var all = stepDone(S), n = Math.min(p[cur.act], 3), stars = '';
    for (var k = 0; k < 3; k++) stars += '<span class="' + (k < n ? 'on' : '') + '">★</span>';
    var nextA = S.acts[(S.acts.indexOf(cur.act) + 1) % S.acts.length];
    var nextStep = DATA.steps[idx + 1];
    frame(ACTS[cur.act][1], '<div class="pp-done"><p class="pp-stars" aria-label="' + n + ' of 3 stars">' + stars + '</p><p class="pp-done-t">Well done, ' + esc(kid().name) + '!</p>' +
      (all ? '<p>You finished every activity in this step. 🎉</p>' : '<p>You finished “' + esc(ACTS[cur.act][1]) + '.”</p>') + '</div>');
    var c = ctl('<button type="button" class="pp-next ghost" id="pp-again">↻ Again</button>' +
      (all && nextStep ? '<a class="pp-next" href="../' + nextStep.key + '/">Step ' + nextStep.n + ': ' + esc(nextStep.title) + ' →</a>' : '<button type="button" class="pp-next" id="pp-on">' + ACTS[nextA][0] + ' ' + esc(ACTS[nextA][1]) + ' →</button>'));
    c.querySelector('#pp-again').addEventListener('click', function () { touched = true; startAct(cur.act); });
    var on = c.querySelector('#pp-on'); if (on) on.addEventListener('click', function () { touched = true; startAct(nextA); });
    var f = c.querySelector('.pp-next:last-child'); if (touched && f) f.focus({ preventScroll: true });
  }
  function startAct(a) {
    if (!RUN[a]) a = S.acts[0];
    cur = { act: a, items: [], i: 0, data: {} };
    cur.items = (ITEMS[a] || function () { return []; })();
    paintActs();
    if (!cur.items.length) { frame(ACTS[a][1], '<p class="pp-empty">Nothing to practice here yet.</p>'); return; }
    RUN[a]();
  }
  // answer buttons: correct one → onRight; wrong ones fade, no penalty
  function wireChoices(sel, right, onRight) {
    stage.querySelectorAll(sel).forEach(function (b) {
      b.addEventListener('click', function () {
        touched = true;
        if (b.dataset.v === right) {
          stage.querySelectorAll(sel).forEach(function (x) { x.disabled = true; });
          b.classList.add('right'); b.disabled = false; b.setAttribute('aria-disabled', 'true');
          onRight(b);
        } else { b.classList.add('wrong'); b.disabled = true; fb('Not quite. Try another one.', 'try'); }
      });
    });
  }

  // ---------------- items for each activity ----------------
  var LETTER_SAME = { c: 'k', k: 'c' };
  function letterOpts(right, pool, n) {
    var opts = [right], tries = 0;
    while (opts.length < n && tries++ < 200) {
      var g = pool[Math.floor(Math.random() * pool.length)];
      if (opts.indexOf(g) < 0 && LETTER_SAME[right] !== g) opts.push(g);
    }
    return shuffle(opts);
  }
  var CONFUSE = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'w', w: 'm', n: 'u', u: 'n' };
  var ITEMS = {
    cards: function () { return S.units.slice(); },
    'case': function () { return pickN(LETTERS.filter(function (u) { return u.g.length === 1; }), ROUND); },
    sound: function () { return pickN(S.units.filter(function (u) { return u.g.length <= 2; }), ROUND); },
    first: function () { return pickN(S.first || [], ROUND); },
    middle: function () { return pickN(S.middle || [], ROUND); },
    blend: function () { return pickN(S.words.filter(function (w) { return unitsOf(w); }), ROUND); },
    pick: function () {
      var w = S.words.filter(function (x) { return picFor(x) && unitsOf(x); });
      return pickN(w, Math.min(ROUND, w.length));
    },
    build: function () {
      var w = S.words.filter(function (x) { return picFor(x) && unitsOf(x) && plain(x).length <= 6; });
      return pickN(w, Math.min(ROUND - 1, w.length));
    },
    family: function () { return pickN(S.families || [], 5); },
    heart: function () {
      var mine = S.heart.slice(), old = [];
      for (var k = 0; k < idx; k++) old = old.concat(DATA.steps[k].heart || []);
      return shuffle(mine.concat(pickN(old, Math.max(2, ROUND - mine.length))));
    },
    sentences: function () { return S.sentences.slice(); },
    story: function () { return [0]; }
  };

  // ---------------- word display ----------------
  function heartHTML(h) {
    var w = h.w, i = w.toLowerCase().indexOf(h.h.toLowerCase());
    if (i < 0) return esc(w);
    return esc(w.slice(0, i)) + '<span class="pp-h">' + esc(w.slice(i, i + h.h.length)) + '</span>' + esc(w.slice(i + h.h.length));
  }
  function heartMap() { var m = {}; for (var k = 0; k <= idx; k++) (DATA.steps[k].heart || []).forEach(function (h) { m[h.w.toLowerCase()] = h; }); return m; }
  // a sentence as tappable words (tap a word to hear it)
  function sentenceHTML(t) {
    return String(t).split(/(\s+)/).map(function (tok) {
      if (/^\s+$/.test(tok)) return ' ';
      var m = tok.match(/^([^A-Za-z]*)([A-Za-z][A-Za-z'’]*)([^A-Za-z]*)$/);
      if (!m) return esc(tok);
      return esc(m[1]) + '<button type="button" class="pp-w" data-say="' + esc(m[2]) + '">' + esc(m[2]) + '</button>' + esc(m[3]);
    }).join('');
  }
  function wireWords() { stage.querySelectorAll('.pp-w').forEach(function (b) { b.addEventListener('click', function () { touched = true; speak(b.dataset.say); b.classList.add('heard'); }); }); }
  // sound boxes for a word
  function boxesHTML(units) {
    var br = PD.breaks(units), html = '', n = 0;
    units.forEach(function (t, i) {
      var g = t.t === 'end' ? t.g : t.t === 'h' ? t.g : t.g.replace(/_e$/, '');
      var cls = 'pp-sb' + (t.t === 'v' ? ' v' : '') + (t.t === 's' ? ' si' : '') + (t.t === 'end' ? ' en' : '') + (/_e$/.test(t.g) ? ' sp' : '') + (br[i] && i ? ' br' : '');
      if (t.t === 's') { html += '<span class="' + cls + '" data-i="' + i + '" aria-hidden="true">e</span>'; return; }
      html += '<button type="button" class="' + cls + '" data-i="' + i + '" data-n="' + (n++) + '" aria-label="sound ' + n + ': ' + esc(g) + '">' + esc(g) + '</button>';
    });
    return html;
  }
  // draw the arc that joins a split vowel to its silent e
  function drawArcs(wrap) {
    var old = wrap.querySelector('svg.pp-arc'); if (old) old.remove();
    var sp = wrap.querySelectorAll('.pp-sb.sp'), si = wrap.querySelectorAll('.pp-sb.si');
    if (!sp.length || !si.length) return;
    var r = wrap.getBoundingClientRect(), a = sp[0].getBoundingClientRect(), b = si[0].getBoundingClientRect();
    var x1 = a.left + a.width / 2 - r.left, x2 = b.left + b.width / 2 - r.left, y = a.bottom - r.top + 4, h = 18;
    var svg = D.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'pp-arc'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', r.width); svg.setAttribute('height', y + h + 4);
    svg.innerHTML = '<path d="M' + x1 + ' ' + y + ' Q ' + ((x1 + x2) / 2) + ' ' + (y + h * 2) + ' ' + x2 + ' ' + y + '" fill="none" stroke-width="3" stroke-linecap="round"/>';
    wrap.appendChild(svg);
  }

  // ---------------- activities ----------------
  var RUN = {};
  RUN.cards = function () {
    var u = cur.items[cur.i], letters = idx === 0;
    var big = letters ? (u.g === 'qu' ? 'Qu qu' : u.g.toUpperCase() + u.g) : u.g.replace('_', '–');
    var kw = u.key, ku = null;
    if (!letters) { var r = PD.check(kw, PD.context(DATA, Math.max(idx, 2))); if (r.ok && r.units && r.how !== 'heart') ku = r.units; }
    var kwHTML = esc(kw);
    if (ku) kwHTML = ku.map(function (t) {
      var g = t.t === 'end' ? t.g : t.g.replace(/_e$/, ''), mine = t.g === u.g || (u.g === '-' + t.g) || (t.t === 's' && /_e$/.test(u.g)) || (/_e$/.test(u.g) && t.g === u.g);
      return mine ? '<b>' + esc(g) + '</b>' : esc(g);
    }).join('');
    frame(ACTS.cards[1], '<div class="pp-cardv"><div class="pp-bigg" aria-label="' + esc(u.g.replace('_', ' ')) + '">' + esc(big) + '</div>' +
      (u.pic ? '<div class="pp-cpic">' + pic(u.pic, u.key) + '</div>' : '') +
      '<p class="pp-key">' + esc(u.g.replace('_', '–')) + ' as in <span class="pp-kw">' + kwHTML + '</span> <button type="button" class="pp-say-b" id="pp-sayk" aria-label="Hear the word ' + esc(kw) + '">🔊</button></p>' +
      '<p class="pp-gsay"><b>Grown-up:</b> ' + esc(u.say) + '</p></div>', { total: cur.items.length > 12 ? 0 : cur.items.length, at: cur.i });
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(kw); });
    var c = ctl('<button type="button" class="pp-next ghost" id="pp-prev"' + (cur.i ? '' : ' disabled') + '>←</button><span class="pp-count">' + (cur.i + 1) + ' of ' + cur.items.length + '</span><button type="button" class="pp-next" id="pp-nx">' + (cur.i + 1 < cur.items.length ? 'Next →' : 'Done ✓') + '</button>');
    c.querySelector('#pp-prev').addEventListener('click', function () { touched = true; cur.i = Math.max(0, cur.i - 1); RUN.cards(); });
    c.querySelector('#pp-nx').addEventListener('click', function () { touched = true; advance(); });
    if (touched) c.querySelector('#pp-nx').focus({ preventScroll: true });
  };

  RUN['case'] = function () {
    var u = cur.items[cur.i], up = cur.i % 2 === 0, g = u.g;
    var pool = LETTERS.filter(function (x) { return x.g.length === 1; }).map(function (x) { return x.g; });
    var opts = [g];
    if (CONFUSE[g] && Math.random() < 0.6) opts.push(CONFUSE[g]);
    while (opts.length < 3) { var o = pool[Math.floor(Math.random() * pool.length)]; if (opts.indexOf(o) < 0) opts.push(o); }
    opts = shuffle(opts);
    var show = up ? g.toUpperCase() : g, f = function (x) { return up ? x : x.toUpperCase(); };
    frame(ACTS['case'][1], '<p class="pp-q">' + (up ? 'Find the small letter that matches.' : 'Find the big letter that matches.') + '</p><div class="pp-bigg pp-one">' + esc(show) + '</div>' +
      '<div class="pp-opts">' + opts.map(function (o) { return '<button type="button" class="pp-opt pp-optl" data-v="' + o + '">' + esc(f(o)) + '</button>'; }).join('') + '</div>', { total: cur.items.length, at: cur.i });
    wireChoices('.pp-opt', g, function () { fb(praise() + ' ' + esc(g.toUpperCase()) + ' and ' + esc(g) + ' are the same letter.', 'ok'); nextBtn(null, advance); });
  };

  RUN.sound = function () {
    var u = cur.items[cur.i], vowels = idx === 1;
    var pool = (vowels ? S.units : LETTERS).map(function (x) { return x.g; });
    var opts = vowels ? ['a', 'e', 'i', 'o', 'u'] : letterOpts(u.g, pool, 3);
    frame(ACTS.sound[1], '<div class="pp-gbox"><b>Grown-up, say this sound:</b> the first sound in <i>' + esc(u.key) + '</i>' + (u.pic ? ' ' + pic(u.pic, u.key) : '') + '. Keep it short and clear. <button type="button" class="pp-say-b" id="pp-sayk" aria-label="Hear the word ' + esc(u.key) + '">🔊</button></div>' +
      '<p class="pp-q">👂 Listen. Which letter makes that sound?</p>' +
      '<div class="pp-opts' + (vowels ? ' five' : '') + '">' + opts.map(function (o) { return '<button type="button" class="pp-opt pp-optl" data-v="' + o + '">' + esc(o) + '</button>'; }).join('') + '</div>', { total: cur.items.length, at: cur.i });
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(u.key); });
    wireChoices('.pp-opt', u.g, function () { fb(praise() + ' <b>' + esc(u.g) + '</b>, as in ' + esc(u.key) + '.', 'ok'); nextBtn(null, advance); });
  };

  RUN.first = function () {
    var w = cur.items[cur.i], g = w.slice(0, w[0] === 'q' ? 2 : 1);
    var pool = LETTERS.map(function (x) { return x.g; }).filter(function (x) { return x !== 'x' && x !== 'qu'; });
    var opts = letterOpts(g, pool, 3);
    frame(ACTS.first[1], '<div class="pp-cpic big">' + pic(picFor(w), 'a picture') + '</div><p class="pp-word-h" id="pp-wh" aria-hidden="true">&nbsp;</p>' +
      '<p class="pp-q"><button type="button" class="pp-say-b" id="pp-sayk" aria-label="Hear the word">🔊</button> What sound does it start with? Tap the letter.</p>' +
      '<div class="pp-opts">' + opts.map(function (o) { return '<button type="button" class="pp-opt pp-optl" data-v="' + o + '">' + esc(o) + '</button>'; }).join('') + '</div>', { total: cur.items.length, at: cur.i });
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(w); });
    speak(w);
    wireChoices('.pp-opt', g, function () {
      var h = D.getElementById('pp-wh'); h.innerHTML = '<b>' + esc(g) + '</b>' + esc(w.slice(g.length)); h.removeAttribute('aria-hidden');
      fb(praise() + ' <b>' + esc(w) + '</b> starts with ' + esc(g) + '.', 'ok'); speak(w); nextBtn(null, advance);
    });
  };

  RUN.middle = function () {
    var w = cur.items[cur.i], v = w[1];
    frame(ACTS.middle[1], '<div class="pp-cpic big">' + pic(picFor(w), 'a picture') + '</div>' +
      '<p class="pp-q"><button type="button" class="pp-say-b" id="pp-sayk" aria-label="Hear the word">🔊</button> Which vowel is in the middle?</p>' +
      '<div class="pp-mid"><span>' + esc(w[0]) + '</span><span class="gap" id="pp-gap">?</span><span>' + esc(w[2]) + '</span></div>' +
      '<div class="pp-opts five">' + ['a', 'e', 'i', 'o', 'u'].map(function (o) { return '<button type="button" class="pp-opt pp-optl" data-v="' + o + '">' + o + '</button>'; }).join('') + '</div>', { total: cur.items.length, at: cur.i });
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(w); });
    speak(w);
    wireChoices('.pp-opt', v, function () { var gp = D.getElementById('pp-gap'); gp.textContent = v; gp.classList.add('ok'); fb(praise() + ' <b>' + esc(w) + '</b>.', 'ok'); speak(w); nextBtn(null, advance); });
  };

  RUN.blend = function () {
    var w = plain(cur.items[cur.i]), units = unitsOf(w), p = picFor(w);
    var nBtn = units.filter(function (t) { return t.t !== 's'; }).length;
    frame(ACTS.blend[1], '<p class="pp-q">Tap each sound and say it. Then slide your finger and say it fast.</p>' +
      '<div class="pp-boxes" id="pp-boxes">' + boxesHTML(units) + '</div>' +
      '<label class="pp-slide-l"><span class="pp-vh">Slide to blend the sounds</span><input type="range" class="pp-slide" id="pp-slide" min="0" max="100" value="0" step="1"></label>' +
      '<div class="pp-reveal" id="pp-rev" hidden><span class="pp-rw">' + esc(w) + '</span>' + (p ? pic(p, w) : '') + '</div>', { total: cur.items.length, at: cur.i });
    var wrap = D.getElementById('pp-boxes'), boxes = [].slice.call(wrap.querySelectorAll('button.pp-sb')), next = 0, done = false;
    drawArcs(wrap);
    function mark(k) { boxes.forEach(function (b, j) { b.classList.toggle('lit', j < k); b.classList.toggle('nx', j === k && !done); }); }
    mark(0);
    boxes.forEach(function (b, j) {
      b.addEventListener('click', function () { touched = true; if (j <= next) { next = Math.max(next, j + 1); b.classList.add('tap'); setTimeout(function () { b.classList.remove('tap'); }, 250); mark(next); if (next >= nBtn) fb('Now slide and say it fast!', ''); } else fb('Start with the first sound.', 'try'); });
    });
    var sl = D.getElementById('pp-slide');
    function onSlide() {
      var v = +sl.value; touched = true;
      if (!done) mark(Math.max(next, Math.ceil(v / 100 * nBtn - 0.001)));
      if (v >= 96 && !done) {
        done = true; wrap.classList.add('blended'); mark(nBtn); drawArcs(wrap);
        D.getElementById('pp-rev').hidden = false;
        fb(praise() + ' You read <b>' + esc(w) + '</b>.', 'ok'); speak(w);
        nextBtn(null, advance);
        var c = D.getElementById('pp-ctl'); c.insertAdjacentHTML('afterbegin', '<button type="button" class="pp-next ghost" id="pp-hear">🔊 Hear it</button>');
        D.getElementById('pp-hear').addEventListener('click', function () { speak(w); });
      }
    }
    sl.addEventListener('input', onSlide); sl.addEventListener('change', onSlide);
    ctl('<button type="button" class="pp-skip" id="pp-skip">Skip this word</button>').querySelector('button').addEventListener('click', function () { touched = true; advance(); });
    W.addEventListener('resize', function rz() { if (!D.body.contains(wrap)) { W.removeEventListener('resize', rz); return; } drawArcs(wrap); });
  };

  RUN.pick = function () {
    var w = plain(cur.items[cur.i]), right = picFor(w);
    var pool = S.words.map(plain).filter(function (x) { return picFor(x) && picFor(x) !== right; });
    if (pool.length < 4) for (var k in DATA.pics) if (DATA.pics[k] !== right && pool.indexOf(k) < 0) pool.push(k);
    var others = [], seen = {}; seen[right] = 1;
    shuffle(pool).forEach(function (x) { if (others.length < 2 && !seen[picFor(x)]) { seen[picFor(x)] = 1; others.push(x); } });
    var opts = shuffle([w].concat(others));
    frame(ACTS.pick[1], '<p class="pp-q">Read the word. Then tap its picture.</p><div class="pp-bigw">' + esc(w) + '</div>' +
      '<div class="pp-opts pics">' + opts.map(function (o) { return '<button type="button" class="pp-opt pp-optp" data-v="' + esc(o) + '" aria-label="picture ' + (opts.indexOf(o) + 1) + '">' + pic(picFor(o), '') + '</button>'; }).join('') + '</div>', { total: cur.items.length, at: cur.i });
    wireChoices('.pp-opt', w, function () { fb(praise() + ' That says <b>' + esc(w) + '</b>.', 'ok'); speak(w); nextBtn(null, advance); });
  };

  RUN.build = function () {
    var w = plain(cur.items[cur.i]), units = unitsOf(w);
    var ans = units.map(function (t) { return t.t === 's' ? 'e' : t.t === 'end' ? t.g : t.g.replace(/_e$/, ''); });
    var pool = []; stepUnitsBefore(idx).forEach(function (u) { if (u.t !== 'end' && !/_/.test(u.g) && pool.indexOf(u.g) < 0) pool.push(u.g); });
    var mineNew = (S.units || []).map(function (u) { return u.g; }).filter(function (g) { return !/_/.test(g) && ans.indexOf(g) < 0; });
    var extra = []; shuffle(mineNew).slice(0, 1).forEach(function (g) { extra.push(g); });
    shuffle(pool).forEach(function (g) { if (extra.length < 3 && ans.indexOf(g) < 0 && extra.indexOf(g) < 0 && g.length <= 2) extra.push(g); });
    var tiles = shuffle(ans.concat(extra)).map(function (g, k) { return { g: g, k: k, used: false }; });
    var slots = ans.map(function () { return null; });
    frame(ACTS.build[1], '<div class="pp-cpic">' + pic(picFor(w), 'a picture') + '</div>' +
      '<p class="pp-q"><button type="button" class="pp-say-b" id="pp-sayk" aria-label="Hear the word">🔊</button> Say the word slowly. Tap the tiles to build it.</p>' +
      '<div class="pp-slots" id="pp-slots"></div><div class="pp-tiles" id="pp-tiles"></div>', { total: cur.items.length, at: cur.i });
    D.getElementById('pp-sayk').addEventListener('click', function () { speak(w); });
    speak(w);
    var sEl = D.getElementById('pp-slots'), tEl = D.getElementById('pp-tiles'), solved = false;
    function paint() {
      sEl.innerHTML = slots.map(function (t, k) { return '<button type="button" class="pp-slot' + (t ? ' full' : '') + '" data-k="' + k + '" aria-label="' + (t ? 'Box ' + (k + 1) + ': ' + esc(t.g) + '. Tap to take it back.' : 'Box ' + (k + 1) + ', empty') + '"' + (solved ? ' disabled' : '') + '>' + (t ? esc(t.g) : '') + '</button>'; }).join('');
      tEl.innerHTML = tiles.map(function (t) { return '<button type="button" class="pp-tile" data-k="' + t.k + '"' + (t.used || solved ? ' disabled' : '') + '>' + esc(t.g) + '</button>'; }).join('');
    }
    function place(t) {
      var k = slots.indexOf(null); if (k < 0 || t.used) return;
      slots[k] = t; t.used = true; paint();
      if (slots.indexOf(null) < 0) {
        var right = slots.every(function (s, j) { return s.g === ans[j]; });
        if (right) { solved = true; paint(); sEl.classList.add('ok'); fb(praise() + ' You built <b>' + esc(w) + '</b>.', 'ok'); speak(w); nextBtn(null, advance); }
        else { slots.forEach(function (s, j) { if (s.g !== ans[j]) sEl.children[j].classList.add('off'); }); fb('Almost! Tap a box to take a tile back, then try again.', 'try'); }
      } else fb('', '');
    }
    sEl.addEventListener('click', function (e) { var b = e.target.closest('.pp-slot'); if (!b || solved) return; touched = true; var k = +b.dataset.k; if (slots[k]) { slots[k].used = false; slots[k] = null; paint(); } });
    tEl.addEventListener('click', function (e) { var b = e.target.closest('.pp-tile'); if (!b) return; touched = true; place(tiles[+b.dataset.k]); var nx = tEl.querySelector('.pp-tile:not([disabled])'); if (nx && !solved) nx.focus({ preventScroll: true }); });
    stage.onkeydown = function (e) {
      if (cur.act !== 'build' || solved || e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') { for (var k = slots.length - 1; k >= 0; k--) if (slots[k]) { slots[k].used = false; slots[k] = null; paint(); break; } e.preventDefault(); return; }
      if (!/^[a-z]$/i.test(e.key)) return;
      var key = e.key.toLowerCase(), want = ans[slots.indexOf(null)] || '';
      var t = tiles.filter(function (x) { return !x.used && x.g === key; })[0] || tiles.filter(function (x) { return !x.used && x.g === want && want[0] === key; })[0] || tiles.filter(function (x) { return !x.used && x.g[0] === key; })[0];
      if (t) { place(t); e.preventDefault(); }
    };
    paint();
    ctl('<button type="button" class="pp-skip" id="pp-skip">Skip this word</button>').querySelector('button').addEventListener('click', function () { touched = true; advance(); });
  };

  RUN.family = function () {
    var f = cur.items[cur.i], used = {};
    var onsets = shuffle(f.words.map(function (w) { return w.slice(0, w.length - f.end.length); }));
    frame(ACTS.family[1], '<p class="pp-q">The <b>-' + esc(f.end) + '</b> family. Tap a letter to make a word, and read it.</p>' +
      '<div class="pp-fam"><span class="pp-on" id="pp-on">?</span><span class="pp-end">' + esc(f.end) + '</span></div>' +
      '<div class="pp-opts">' + onsets.map(function (o) { return '<button type="button" class="pp-opt pp-optl" data-o="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
      '<p class="pp-famlist" id="pp-fl"></p>', { total: cur.items.length, at: cur.i });
    var last = '';
    stage.querySelectorAll('[data-o]').forEach(function (b) {
      b.addEventListener('click', function () {
        touched = true; var o = b.dataset.o; last = o + f.end;
        D.getElementById('pp-on').textContent = o; D.getElementById('pp-on').classList.add('ok');
        used[o] = 1; b.classList.add('right');
        D.getElementById('pp-fl').innerHTML = f.words.filter(function (w) { return used[w.slice(0, w.length - f.end.length)]; }).map(esc).join(' · ');
        var n = Object.keys(used).length;
        fb('Read it: <b>' + esc(last) + '</b>. ' + (n < onsets.length ? (onsets.length - n) + ' more to make.' : 'You made the whole family!'), n < onsets.length ? '' : 'ok');
        var c = ctl('<button type="button" class="pp-next ghost" id="pp-hear">🔊 Check it</button>' + (n >= onsets.length ? '<button type="button" class="pp-next" id="pp-next">Next →</button>' : ''));
        c.querySelector('#pp-hear').addEventListener('click', function () { speak(last); });
        var nb = c.querySelector('#pp-next'); if (nb) { nb.addEventListener('click', function () { touched = true; advance(); }); nb.focus({ preventScroll: true }); }
      });
    });
  };

  RUN.heart = function () {
    var h = cur.items[cur.i];
    frame(ACTS.heart[1], '<p class="pp-q">A heart word. Sound out what you can; learn the <span class="pp-hk">♥</span> part by heart.</p>' +
      '<div class="pp-bigw pp-hw-big">' + heartHTML(h) + '</div>', { total: cur.items.length, at: cur.i });
    var c = ctl('<button type="button" class="pp-next ghost" id="pp-hear">🔊 Hear it</button><button type="button" class="pp-next" id="pp-next">I can read it ✓</button>');
    c.querySelector('#pp-hear').addEventListener('click', function () { speak(h.w); });
    c.querySelector('#pp-next').addEventListener('click', function () { touched = true; advance(); });
    if (touched) c.querySelector('#pp-next').focus({ preventScroll: true });
  };

  RUN.sentences = function () {
    var t = cur.items[cur.i];
    frame(ACTS.sentences[1], '<p class="pp-q">Read the sentence. Tap a word if you need help with it.</p><p class="pp-sent">' + sentenceHTML(t) + '</p>', { total: cur.items.length, at: cur.i });
    wireWords();
    var c = ctl('<button type="button" class="pp-next" id="pp-did">I read it! ✓</button>');
    c.querySelector('#pp-did').addEventListener('click', function () {
      touched = true; fb(praise() + (st.voice && canSpeak ? ' Now listen to it.' : ''), 'ok'); speak(t);
      var c2 = ctl('<button type="button" class="pp-next ghost" id="pp-hear">🔊 Again</button><button type="button" class="pp-next" id="pp-next">Next →</button>');
      c2.querySelector('#pp-hear').addEventListener('click', function () { speak(t); });
      c2.querySelector('#pp-next').addEventListener('click', function () { touched = true; advance(); });
      c2.querySelector('#pp-next').focus({ preventScroll: true });
    });
    if (touched) c.querySelector('#pp-did').focus({ preventScroll: true });
  };

  RUN.story = function () {
    var p = prog(S.key), read = p.read || {};
    frame(ACTS.story[1], '<p class="pp-q">Pick a story to read.</p><div class="pp-stories">' + S.stories.map(function (s, k) {
      return '<button type="button" class="pp-storyb" data-k="' + k + '">📖 ' + esc(s.title) + (read[s.title] ? ' <span class="pp-act-ok" aria-label="read before">✓</span>' : '') + '</button>';
    }).join('') + '</div>');
    stage.querySelectorAll('.pp-storyb').forEach(function (b) { b.addEventListener('click', function () { touched = true; storyLine(S.stories[+b.dataset.k], -1); }); });
  };
  function storyLine(s, k) {
    var n = s.lines.length;
    if (k < 0) {
      frame(s.title, '<div class="pp-stitle"><span aria-hidden="true">📖</span><p class="pp-sent">' + sentenceHTML(s.title) + '</p><p class="hs-small">' + n + ' short lines. Tap a word if you need help.</p></div>');
      wireWords();
      nextBtn('Start reading →', function () { storyLine(s, 0); });
      return;
    }
    if (k >= n) {
      var p = prog(S.key); p.read = p.read || {}; p.read[s.title] = 1; save();
      cur.items = [0]; cur.i = 0; finish();
      fb('You read “' + esc(s.title) + '.”', 'ok');
      return;
    }
    frame(s.title, '<p class="pp-sent pp-line">' + sentenceHTML(s.lines[k]) + '</p>', { total: n, at: k });
    wireWords();
    var c = ctl('<button type="button" class="pp-next ghost" id="pp-back"' + (k ? '' : ' disabled') + '>←</button><button type="button" class="pp-next" id="pp-next">' + (k + 1 < n ? 'Next line →' : 'The end ✓') + '</button>');
    c.querySelector('#pp-back').addEventListener('click', function () { touched = true; storyLine(s, k - 1); });
    c.querySelector('#pp-next').addEventListener('click', function () { touched = true; storyLine(s, k + 1); });
    if (touched) c.querySelector('#pp-next').focus({ preventScroll: true });
  }

  // start
  var start = S.acts[0], p0 = prog(S.key);
  for (var a = 0; a < S.acts.length; a++) if (!p0[S.acts[a]]) { start = S.acts[a]; break; }
  startAct(start);

  // =========================================================
  // Hub page: children and step progress
  // =========================================================
  function hub() {
    var list = D.getElementById('pp-kidlist'), form = D.getElementById('pp-addf');
    function paint() {
      list.innerHTML = st.kids.map(function (k) {
        var done = DATA.steps.filter(function (s) { return stepDone(s, k.id); }).length;
        return '<div class="pp-kidc' + (k.id === st.cur ? ' on' : '') + '"><button type="button" class="pp-kidb" data-id="' + esc(k.id) + '" aria-pressed="' + (k.id === st.cur) + '"><b>' + esc(k.name) + '</b><span>' + done + ' of ' + DATA.steps.length + ' steps done</span></button>' +
          '<button type="button" class="pp-mini" data-ren="' + esc(k.id) + '" aria-label="Rename ' + esc(k.name) + '">✎</button>' +
          (st.kids.length > 1 ? '<button type="button" class="pp-mini" data-del="' + esc(k.id) + '" aria-label="Remove ' + esc(k.name) + '">✕</button>' : '') + '</div>';
      }).join('');
      D.querySelectorAll('.pp-step[data-step]').forEach(function (a) {
        var s = DATA.steps.filter(function (x) { return x.key === a.dataset.step; })[0]; if (!s) return;
        var n = actsDone(s), t = s.acts.length, el = a.querySelector('.pp-step-p');
        a.classList.toggle('done', n === t);
        el.textContent = n === t ? '✓ Done' : n ? n + ' of ' + t : '';
        el.setAttribute('aria-label', n === t ? 'done' : n + ' of ' + t + ' activities done');
      });
    }
    list.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.id) { st.cur = b.dataset.id; save(); paint(); var nb = list.querySelector('[data-id="' + st.cur + '"]'); if (nb) nb.focus(); return; }
      var k = st.kids.filter(function (x) { return x.id === (b.dataset.ren || b.dataset.del); })[0]; if (!k) return;
      if (b.dataset.ren) { var nm = W.prompt('New name for ' + k.name + ':', k.name); if (nm && nm.trim()) { k.name = nm.trim().slice(0, 24); save(); paint(); } }
      else if (W.confirm('Remove ' + k.name + ' and their stars from this browser?')) {
        st.kids = st.kids.filter(function (x) { return x !== k; }); delete st.p[k.id];
        if (st.cur === k.id) st.cur = st.kids[0].id; save(); paint();
      }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); var inp = D.getElementById('pp-name'); if (addKid(inp.value)) { inp.value = ''; paint(); } });
    paint();
  }
})(window, document);
