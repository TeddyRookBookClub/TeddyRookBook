/* Vocabulary Ladder pages (flashcards, quizzes, word list, word pages, print): shared helpers on MathLadder.vocabPages.
   Data: the page's #vop[data-src] is /vocabulary/data/words.json ({ topic key: [entries] }, built by Hugo from
   data/vocab/words/*.json); the list, topics and roots are in the kit (MathLadder.vocab, static/vocab/viz/vocab.js).
   Storage: localStorage 'trb-vocab-v1' = { cards: { id: { r, e, i, l, d, s, g } }, day: { d, nw, rv }, prefs: {…},
   qmiss: { word: time }, quiz: { prefs: {…}, last: {…} } }. Every access is in try/catch; without storage the pages
   still work for the visit. Card ids: 'p>' + word (picture first) and 'w>' + word (word first). */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, VP = ML.vocabPages = ML.vocabPages || {};
  var KEY = 'trb-vocab-v1', DAY = 864e5, MIN = 6e4;
  VP.KEY = KEY;
  VP.load = function () { try { var s = W.localStorage.getItem(KEY); var o = s ? JSON.parse(s) || {} : {}; o.cards = o.cards || {}; o.day = o.day || {}; o.prefs = o.prefs || {}; o.qmiss = o.qmiss || {}; o.quiz = o.quiz || {}; return o; } catch (e) { return { cards: {}, day: {}, prefs: {}, qmiss: {}, quiz: {} }; } };
  VP.save = function (o) { try { W.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } };
  VP.$ = function (s, r) { return (r || D).querySelector(s); };
  VP.$$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  VP.esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  VP.today = function () { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  // a random source with the same methods as the ladder generators' R
  VP.rand = function () {
    var R = { real: function () { return Math.random(); } };
    R.int = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
    R.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    R.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    R.sample = function (a, k) { return R.shuffle(a).slice(0, k); };
    R.coin = function () { return Math.random() < 0.5; };
    R.chance = function (p) { return Math.random() < p; };
    R.nz = function (a, b) { var v = 0; while (!v) v = R.int(a, b); return v; };
    return R;
  };
  // spaced review: the same simplified SM-2 as the site's other flashcards (q: 1 Again, 2 Hard, 3 Good, 4 Easy)
  VP.sched = function (c, q, now) {
    c = c ? JSON.parse(JSON.stringify(c)) : { r: 0, e: 2.5, i: 0, l: 0 };
    if (q === 1) { c.l++; c.r = 0; c.e = Math.max(1.3, c.e - 0.2); c.i = 0; c.d = now + MIN; }
    else {
      if (c.r === 0) c.i = q === 2 ? 0.5 : q === 3 ? 1 : 4;
      else if (c.r === 1 && q === 3) c.i = Math.max(3, c.i * 2);
      else c.i = Math.max(c.i + 1, c.i * (q === 2 ? 1.2 : q === 3 ? c.e : c.e * 1.3));
      if (q === 2) c.e = Math.max(1.3, c.e - 0.15);
      if (q === 4) c.e += 0.15;
      c.r++; c.d = now + c.i * DAY;
    }
    c.s = now; c.g = q; return c;
  };
  VP.ivlText = function (c) { if (!c || c.i === 0) return '< 1 min'; var d = c.i; if (d < 1) return Math.round(d * 24) + ' h'; if (d < 30) return Math.round(d) + ' d'; if (d < 365) return Math.round(d / 30) + ' mo'; return (d / 365).toFixed(1) + ' y'; };
  VP.DAY = DAY;
  // "my hard words": cards graded Again or Hard last time or forgotten before, and words missed in a quiz in the last 30 days
  VP.hardWords = function (st) {
    var out = {}, now = Date.now();
    Object.keys(st.cards || {}).forEach(function (id) { var c = st.cards[id], w = id.slice(2); if (c && (c.g === 1 || c.g === 2 || c.l > 0)) out[w] = 1; });
    Object.keys(st.qmiss || {}).forEach(function (w) { if (now - st.qmiss[w] < 30 * DAY) out[w] = 1; });
    return Object.keys(out);
  };
  // load the word entries, then run fn(VO, entriesByTopic)
  VP.ready = function (fn) {
    function go() {
      var VO = ML.vocab, host = D.getElementById('vop');
      if (!VO || !host) return;
      var src = host.getAttribute('data-src');
      if (!src) { fn(VO, {}); return; }
      fetch(src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (data) { VO.addEntries(data); fn(VO, data); })
        .catch(function () { var m = host.querySelector('.vop-msg'); if (m) m.textContent = 'The words could not load. Please check your connection and reload the page.'; fn(VO, {}); });
    }
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
  };
  // the words that have full entries, in list order
  VP.withEntries = function (VO) { return VO.list().filter(function (r) { return !!VO.entry(r.w); }); };
  VP.wordUrl = function (w) { var host = D.getElementById('vop'), base = host ? host.getAttribute('data-base') || '/vocabulary/' : '/vocabulary/'; return base + 'words/' + encodeURIComponent(String(w).toLowerCase().replace(/\s+/g, '-')) + '/'; };
  // say a word aloud with the browser's own voice, when it has one
  VP.speak = function (w) { try { W.speechSynthesis.cancel(); var u = new W.SpeechSynthesisUtterance(w); u.rate = 0.85; u.lang = 'en-US'; W.speechSynthesis.speak(u); } catch (e) { } };
  D.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('.vop .vo-speak'); if (b) { ev.preventDefault(); VP.speak(b.getAttribute('data-say')); } });
})(window, document);
