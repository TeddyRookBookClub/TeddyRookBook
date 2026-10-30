/* The toolkit's language example: a Gospel passage in Koine Greek with the King James Version, word by word.
   1. language-data.js sets TRB_LANG = { passages: [[book, chapter, from, to, title], …], verses: [{ b, c, v, p, t, en }],
      lex: { index: { l: lemma, b: brief meaning } } }. A token t is [text, after, lex index, gloss, code, role].
      It is built from greek/ (the full Gospels are there) and english-kjv/ by the toolkit's build script.
   2. Grammar.greek(code, role) (lang/grammar.js) turns a grammar code like V-AAI-3S into words: { pos, parts, summary }.
   No network, no storage. */
(function (W, D) {
  'use strict';
  var X = W.TRB_LANG, Gr = W.Grammar, BOOK = { MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John' };
  var sel = D.getElementById('lx-passage'), box = D.getElementById('lx-verses'), word = D.getElementById('lx-word');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  sel.innerHTML = X.passages.map(function (p, i) { return '<option value="' + i + '">' + esc(p[4] + ' (' + BOOK[p[0]] + ' ' + p[1] + ':' + p[2] + '–' + p[3] + ')') + '</option>'; }).join('');
  function after(a) { a = a || ' '; return /\s$/.test(a) ? a : a + ' '; }   // punctuation after a word, then a space
  function show(i) {
    word.innerHTML = '<p class="lx-muted">No word chosen yet.</p>';
    var vs = X.verses.filter(function (v) { return v.p === i; });
    box.innerHTML = vs.map(function (v, n) {
      return '<div class="lx-v"><div class="lx-ref">' + BOOK[v.b] + ' ' + v.c + ':' + v.v + '</div><p class="lx-g" lang="grc">' +
        v.t.map(function (t, k) { return '<button type="button" data-v="' + n + '" data-k="' + k + '">' + esc(t[0]) + '</button>' + esc(after(t[1])); }).join('') +
        '</p><p class="lx-en">' + esc(v.en) + '</p></div>';
    }).join('');
    box.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var on = box.querySelector('button.on'); if (on) on.classList.remove('on'); b.classList.add('on');
      var t = vs[+b.dataset.v].t[+b.dataset.k], e2 = X.lex[t[2]] || {}, g = Gr ? Gr.greek(t[4], t[5]) : { pos: '', parts: [] };
      word.innerHTML = '<h2 lang="grc">' + esc(t[0]) + '</h2>' +
        '<p>Dictionary form <b lang="grc">' + esc(e2.l || '') + '</b>' + (g.pos ? ' · ' + esc(g.pos) : '') + '</p>' +
        '<p>Here: “' + esc(String(t[3] || '').replace(/[\[\]]/g, '')) + '”' + (e2.b ? ' · Meaning: ' + esc(e2.b) : '') + '</p>' +
        (g.parts && g.parts.length ? '<p class="lx-muted">' + esc(g.parts.map(function (p) { return p.k + ': ' + p.v; }).join(' · ')) + '</p>' : '');
    };
  }
  sel.addEventListener('change', function () { show(+sel.value); });
  show(0);
})(window, document);
