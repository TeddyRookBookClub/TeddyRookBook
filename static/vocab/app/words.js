/* /vocabulary/words/: filters the server-rendered table (search, level, strand, part of speech, root, finished cards) and
   opens a word's card in a dialog (the full card for finished words). Filters are remembered in 'trb-vocab-v1' prefs. */
(function (W, D) {
  'use strict';
  var VP = W.MathLadder.vocabPages, $ = VP.$, $$ = VP.$$, esc = VP.esc;
  var rows = [], st = VP.load(), P = st.prefs.words = st.prefs.words || {};
  function init() {
    rows = $$('#vw-table tbody tr');
    var q = $('#vw-q'), lv = $('#vw-level'), sd = $('#vw-strand'), ps = $('#vw-pos'), rt = $('#vw-root'), rd = $('#vw-ready');
    try { var m = /[?&]q=([^&]+)/.exec(W.location.search); if (m) P.q = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { }
    q.value = P.q || ''; lv.value = P.l || ''; sd.value = P.s || ''; ps.value = P.p || ''; rt.value = P.r || ''; rd.checked = !!P.ready;
    function apply() {
      P.q = q.value; P.l = lv.value; P.s = sd.value; P.p = ps.value; P.r = rt.value; P.ready = rd.checked; VP.save(st);
      var term = q.value.trim().toLowerCase(), n = 0;
      rows.forEach(function (tr) {
        var ok = (!P.l || tr.dataset.l === P.l) && (!P.s || tr.dataset.s === P.s) && (!P.p || tr.dataset.p === P.p) && (!P.r || tr.dataset.r.indexOf(' ' + P.r + ' ') >= 0) && (!P.ready || tr.dataset.ready);
        if (ok && term) ok = tr.dataset.w.toLowerCase().indexOf(term) >= 0 || tr.children[2].textContent.toLowerCase().indexOf(term) >= 0;
        tr.hidden = !ok; if (ok) n++;
      });
      $('#vw-count').textContent = n === rows.length ? 'All ' + n + ' words' : n + ' of ' + rows.length + ' words';
    }
    [q, lv, sd, ps, rt, rd].forEach(function (x) { x.addEventListener(x === q ? 'input' : 'change', apply); });
    apply();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
  // open a finished word's card in a dialog (the link still goes to the word's own page with a modifier key or without JS)
  VP.ready(function (VO) {
    var dlg = $('#vw-dlg'), inner = $('#vw-dlg-in');
    D.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.vop-wl'); if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      var en = VO.entry(a.dataset.w); if (!en || !dlg || !dlg.showModal) return;
      e.preventDefault();
      inner.innerHTML = VO.cardHTML(en, { mode: 'card', speak: !!W.speechSynthesis }) + '<p class="vop-dlg-links"><a href="' + a.getAttribute('href') + '">Open this word’s page</a> · <a href="' + esc(D.getElementById('vop').getAttribute('data-base')) + 'advanced-vocabulary/' + esc(en.topic) + '/">The lesson and practice for its topic</a></p>';
      dlg.showModal();
    });
    if (dlg) dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  });
})(window, document);
