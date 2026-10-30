/* Embed: the Greek or Latin word of the day (/embed/lang-word/?lang=grc|lat).
   The day's word is word number (day × 7) mod N of /embed/lang/word-<grc|lat>.json: common nouns, verbs and adjectives of
   the four Gospels, most frequent first, each with one real form, its grammar and a verse where it appears. The verse's
   English is the King James Version (public domain). Needs lang-embed.js; core.js (window.Gospels) for the voice. */
(function (W, D) {
  'use strict';
  var L = W.TRBLang, G = W.Gospels, box = D.getElementById('lw-card'); if (!L || !box) return;
  var o = L.opts(), grc = o.lang === 'grc', cls = grc ? 'grc' : 'lat', site = box.getAttribute('data-site') || '/';
  var BOOK = { MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  L.sources(o.lang);
  D.getElementById('lw-lang').textContent = grc ? 'Koine Greek' : 'Latin';
  D.getElementById('lw-date').textContent = 'Word of the day · ' + L.today();
  if (W.TRBEmbed) W.TRBEmbed.open(site + 'languages/flashcards/');
  function fail() { box.innerHTML = '<p class="mlp-soon">Today’s word didn’t load. <a href="' + site + 'languages/">See the Languages section on Teddy Rook Book</a>.</p>'; }
  L.get('word-' + o.lang + '.json').then(function (d) {
    var list = d.words || []; if (!list.length) return fail();
    var w = list[(L.day() * 7) % list.length];
    var verse = w.x.map(function (t, i) {
      var word = grc ? t[0] : t[1], before = grc ? '' : t[0], after = grc ? t[1] : t[2];
      if (after && !/\s$/.test(after)) after += ' ';
      return esc(before) + (i === w.h ? '<mark>' + esc(word) + '</mark>' : esc(word)) + esc(after);
    }).join('').trim();
    var ref = BOOK[w.r[0]] + ' ' + w.r[1] + ':' + w.r[2];
    var say = !!(W.speechSynthesis && G && G.Player);
    box.innerHTML =
      '<div class="lw-head"><h1 class="lw-w ' + cls + '" lang="' + (grc ? 'grc' : 'la') + '">' + esc(w.w) + '</h1>' +
      (say ? '<button type="button" class="lw-say" id="lw-say" aria-label="Hear ' + esc(w.w) + '">🔊 Hear it</button>' : '') + '</div>' +
      '<p class="lw-mean">“' + esc(w.g) + '”</p>' +
      '<p class="lw-meta">' + esc(w.p) + ' · used ' + w.n + ' times in the four Gospels</p>' +
      '<div class="lw-form"><span class="lw-lab">A real form</span> <b class="' + cls + '">' + esc(w.f) + '</b>' + (w.fp ? ' <span class="lw-fp">' + esc(w.fp) + '</span>' : '') + '</div>' +
      '<figure class="lw-ex"><blockquote><p class="lw-src ' + cls + '" lang="' + (grc ? 'grc' : 'la') + '">' + verse + '</p>' +
      '<p class="lw-en">' + esc(w.en) + '</p></blockquote>' +
      '<figcaption>' + esc(ref) + ' · English from the King James Version</figcaption></figure>' +
      '<p class="emb-wlinks"><a href="' + site + 'languages/flashcards/">Flashcards</a> <a href="' + site + 'languages/sentences/">Sentence drills</a> <a href="' + site + 'languages/reader/">Read the Gospels</a></p>';
    if (say) {
      var P = new G.Player();
      D.getElementById('lw-say').addEventListener('click', function () { P.stop(); P.speak(w.w, grc ? 'g' : 'l', 0.85); });
    }
  }).catch(fail);
})(window, document);
