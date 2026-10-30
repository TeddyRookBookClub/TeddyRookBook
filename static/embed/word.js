/* Embed: the Vocabulary word of the day (/embed/word/[?word=<word>]).
   The day's word is the same for everyone on a given date: word number (day × 7) mod N of the Vocabulary Ladder's list
   (#emb-words: the URL names of the words with full entries, in list order; day = days since 1970-01-01 in the visitor's
   own calendar). Its entry comes from the word's own page (/vocabulary/words/<word>/, #vw-entry) and is drawn with the
   Vocabulary kit (static/vocab/viz/vocab.js): picture, meaning, memory hook and example. Stores nothing. */
(function (W, D) {
  'use strict';
  var box = D.getElementById('emb-wcard'), host = D.getElementById('emb-word'), base = host.getAttribute('data-base');
  var VO = W.MathLadder && W.MathLadder.vocab, list = [];
  try { list = JSON.parse(D.getElementById('emb-words').textContent) || []; } catch (e) { }
  function slug(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, '-'); }
  var d = new Date(), day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  var q = new URLSearchParams(W.location.search), asked = q.get('word'), pick = list.length ? list[(day * 7) % list.length] : '', fixed = false;
  if (asked && list.indexOf(slug(asked)) >= 0) { pick = slug(asked); fixed = true; }
  var dateEl = D.getElementById('emb-wdate');
  if (dateEl) dateEl.textContent = fixed ? 'A word to learn' : 'Word of the day · ' + d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  function fail() { box.innerHTML = '<p class="mlp-soon">Today’s word didn’t load. <a href="' + base + '">See all the words on Teddy Rook Book</a>.</p>'; }
  if (!pick || !VO || !VO.cardHTML) return fail();
  var url = base + encodeURIComponent(pick) + '/';
  if (W.TRBEmbed) W.TRBEmbed.open(url);
  fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
    var doc = new DOMParser().parseFromString(html, 'text/html'), s = doc.getElementById('vw-entry'), e = s ? JSON.parse(s.textContent) : null;
    if (!e || !e.word) return fail();
    box.innerHTML = VO.cardHTML(e, { mode: 'card', speak: !!W.speechSynthesis }).replace('<h3 class="vo-w"', '<h1 class="vo-w"').replace('</h3>', '</h1>') +
      '<p class="emb-wlinks"><a href="' + url + '">More about “' + VO.esc(e.word) + '”</a> <a href="' + base.replace(/words\/$/, '') + 'flashcards/">Flashcards</a></p>';
  }).catch(fail);
  box.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.vo-speak'); if (!b) return;
    try { W.speechSynthesis.cancel(); var u = new W.SpeechSynthesisUtterance(b.getAttribute('data-say')); u.rate = 0.85; u.lang = 'en-US'; W.speechSynthesis.speak(u); } catch (e) { }
  });
})(window, document);
