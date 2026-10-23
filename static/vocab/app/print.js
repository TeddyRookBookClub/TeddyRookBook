/* /vocabulary/print/: lays out the word cards four to a page (2 x 2) for US Letter or A4, with a title page for each volume.
   ?vol=1|2|3|4|all  ?size=letter|a4. The sheets have the printed page's exact size; after laying them out, fit() measures
   every card and steps its type, line spacing and picture down (then drops the example sentence) until nothing is cut off.
   Sets window.__voPrintReady = true when done, and window.__voFitReport = { cards, overflow: [words], levels: {level: n} };
   window.__voFit() fits again (make-pdf.js calls it under print media and fails if any card still overflows). */
(function (W, D) {
  'use strict';
  var VP = W.MathLadder.vocabPages, $ = VP.$, esc = VP.esc;
  function param(k, d) { try { var m = new RegExp('[?&]' + k + '=([^&]+)').exec(W.location.search); return m ? decodeURIComponent(m[1]) : d; } catch (e) { return d; } }
  VP.ready(function (VO) {
    var vol = param('vol', '1'), size = param('size', 'letter'), book = $('#vp-book');
    var vs = $('#vp-vol'), ss = $('#vp-size'); vs.value = vol; ss.value = size;
    function go() { var u = W.location.pathname + '?vol=' + vs.value + '&size=' + ss.value; W.location.href = u; }
    vs.addEventListener('change', go); ss.addEventListener('change', go);
    $('#vp-print').addEventListener('click', function () { W.print(); });
    // the page size for printing
    var st = D.createElement('style');
    st.textContent = size === 'a4' ? '@page{size:A4;margin:9mm}' : '@page{size:letter;margin:0.35in}';
    D.head.appendChild(st);
    D.documentElement.classList.add('vop-paper-' + (size === 'a4' ? 'a4' : 'letter'));
    var vols = vol === 'all' ? [1, 2, 3, 4] : [+vol || 1], html = '';
    vols.forEach(function (v) {
      var topics = VO.topics().filter(function (t) { return t.n > (v - 1) * 25 && t.n <= v * 25; });
      var words = [];
      topics.forEach(function (t) { VO.entries(t.key).forEach(function (e) { words.push({ e: e, t: t }); }); });
      html += '<div class="vop-sheetw"><section class="vop-sheet vop-title"><div class="vop-title-in"><p class="vop-tb">Teddy Rook Book · Vocabulary Ladder</p><h2>1,000 Words, Pictured</h2><p class="vop-tv">Volume ' + v + ' of 4 · Topics ' + ((v - 1) * 25 + 1) + '–' + (v * 25) + '</p>' +
        '<p class="vop-ti">Each card gives a word, how to say it (the capital letters are stressed), its meaning, a memory hook with a picture, an example and its Greek or Latin parts. To learn a word: say the hook out loud, picture the scene, then cover the card and try to recall the meaning. Come back to it tomorrow and again next week.</p>' +
        '<ol class="vop-toc">' + topics.map(function (t) { return '<li value="' + t.n + '">' + esc(t.title) + (VO.entries(t.key).length ? '' : ' <i>(being written)</i>') + '</li>'; }).join('') + '</ol>' +
        '<p class="vop-tf">Free at teddyrookbook.com/vocabulary/, with flashcards, quizzes and practice.</p></div></section></div>';
      for (var i = 0; i < words.length; i += 4) {
        html += '<div class="vop-sheetw"><section class="vop-sheet">' + words.slice(i, i + 4).map(function (x) { return '<div class="vop-cell">' + VO.cardHTML(x.e, { mode: 'print' }) + '<p class="vop-cellt">' + x.t.n + '. ' + esc(x.t.title) + '</p></div>'; }).join('') + '</section></div>';
      }
    });
    book.innerHTML = html;
    // the on-screen preview: scale the page-sized sheets to the window
    function scale() { var sw = (size === 'a4' ? 191.5 / 25.4 : 7.78) * 96 + 0.44 * 96 + 2, k = Math.min(1, (book.clientWidth || sw) / sw); book.style.setProperty('--k', String(Math.max(0.2, k))); }
    scale(); W.addEventListener('resize', scale);
    // fit every card: step its type, line spacing and picture down until nothing overflows; last, drop the example sentence
    var LEVELS = [{ fs: 1, pw: 3.3 }, { fs: 0.96, pw: 3.2 }, { fs: 0.92, pw: 3.1 }, { fs: 0.88, pw: 2.95 }, { fs: 0.85, pw: 2.8, lh: 1.27 }, { fs: 0.82, pw: 2.65, lh: 1.24 },
      { fs: 0.79, pw: 2.5, lh: 1.21 }, { fs: 0.76, pw: 2.35, lh: 1.18 }, { fs: 0.76, pw: 2.35, lh: 1.18, noex: true }, { fs: 0.72, pw: 2.1, lh: 1.15, noex: true }];
    function over(c) { return c.scrollHeight > c.clientHeight + 0.5 || c.scrollWidth > c.clientWidth + 0.5; }
    function setLevel(c, i) {
      var L = LEVELS[i], cell = c.parentNode; c.setAttribute('data-fit', String(i));
      c.style.setProperty('--fs', String(L.fs)); if (L.lh) c.style.setProperty('--lh', String(L.lh)); else c.style.removeProperty('--lh');
      cell.style.setProperty('--pw', L.pw + 'in'); c.classList.toggle('vo-fit-noex', !!L.noex);
    }
    function fit() {
      var cards = Array.prototype.slice.call(book.querySelectorAll('.vop-cell > .vo-card')), todo = cards.filter(over); // one layout for all
      for (var i = 1; i < LEVELS.length && todo.length; i++) {
        todo.forEach(function (c) { if ((+c.getAttribute('data-fit') || 0) < i) setLevel(c, i); }); // write all, then read all
        todo = todo.filter(over);
      }
      var levels = {}; cards.forEach(function (c) { var l = c.getAttribute('data-fit') || '0'; levels[l] = (levels[l] || 0) + 1; });
      W.__voFitReport = { cards: cards.length, overflow: todo.map(function (c) { return c.getAttribute('data-word'); }), levels: levels };
      return W.__voFitReport;
    }
    W.__voFit = fit;
    var fontsReady = D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve();
    fontsReady.then(function () { W.requestAnimationFrame(function () { fit(); W.__voPrintReady = true; }); });
    W.addEventListener('beforeprint', fit);
  });
})(window, document);
