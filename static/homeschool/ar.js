/* Actual Reading (Hannah Ward) pages: pick a lesson, open or show its PDF (on Hannah's site), tick it done.
   Ticks share the homeschool store (trb-homeschool-v1) under the course key "ar-<curriculum>". */
(function (W, D) {
  'use strict';
  var KEY = 'trb-homeschool-v1', st = { done: {} };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv && sv.done) st = sv; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } try { if (W.TRB && W.TRB.markActivity) W.TRB.markActivity(); } catch (e) { } }
  function cnt(o) { var c = 0; for (var k in o) if (o[k]) c++; return c; }

  // series page: progress on each card
  D.querySelectorAll('.ar-cards [data-ar][data-total]').forEach(function (a) {
    var c = cnt(st.done['ar-' + a.dataset.ar] || {}); if (!c) return;
    var p = a.querySelector('.ar-prog'); p.hidden = false; p.textContent = c + ' of ' + a.dataset.total + ' done';
  });

  var root = D.querySelector('.hs.ar[data-ar]'); if (!root) return;
  var course = 'ar-' + root.dataset.ar, total = +root.dataset.total;
  var done = st.done[course] || (st.done[course] = {});
  var btns = [].slice.call(D.querySelectorAll('.ar-grid button')), byN = {};
  btns.forEach(function (b) { byN[b.dataset.n] = b; });
  var $ = function (id) { return D.getElementById(id); };
  var cur = 0, shown = false, posKey = 'trb-ar-pos';

  function firstUndone() {
    var hi = 0; for (var k in done) if (done[k] && +k > hi) hi = +k;
    for (var i = hi + 1; i <= total; i++) if (!done[i] && byN[i] && byN[i].dataset.u) return i;
    for (i = 1; i <= total; i++) if (!done[i] && byN[i] && byN[i].dataset.u) return i;
    return 1;
  }
  function paint() {
    btns.forEach(function (b) { var n = +b.dataset.n; b.classList.toggle('done', !!done[n]); b.classList.toggle('cur', n === cur); b.setAttribute('aria-pressed', n === cur ? 'true' : 'false'); b.title = 'Lesson ' + n + (done[n] ? ' (done)' : '') + (b.dataset.u ? '' : ' (no download on Hannah’s page)'); });
    var c = cnt(done); $('ar-done-n').textContent = c;
    root.querySelector('.hs-bar b').style.width = Math.round(100 * c / total) + '%';
  }
  function view() {
    var b = byN[cur], u = b && b.dataset.u;
    if (u) $('ar-view').innerHTML = '<iframe src="' + u + '#view=FitH" title="Lesson ' + cur + ' PDF, from hannahwardeducation.com" loading="lazy"></iframe><p class="hs-small">If the lesson doesn’t show here (some phones only download PDFs), use <b>Open the lesson PDF</b> instead.</p>';
    else $('ar-view').innerHTML = '';
  }
  function go(n, scroll) {
    cur = Math.max(1, Math.min(total, n));
    var b = byN[cur], u = b && b.dataset.u;
    $('ar-title').textContent = 'Lesson ' + cur;
    var sec = b && b.closest('.hs-unit'); $('ar-where').textContent = (sec ? sec.querySelector('h2').textContent + ' · ' : '') + 'Lesson ' + cur + ' of ' + total;
    $('ar-open').hidden = !u; $('ar-show').hidden = !u; if (u) $('ar-open').href = u;
    $('ar-miss').hidden = !!u;
    $('ar-done').checked = !!done[cur];
    $('ar-prev').disabled = cur <= 1; $('ar-next').disabled = cur >= total;
    if (shown) view();
    D.querySelectorAll('.ar-daily input').forEach(function (x) { x.checked = false; x.closest('li').classList.remove('ticked'); }); // a fresh checklist for each lesson
    try { var p = JSON.parse(W.localStorage.getItem(posKey) || '{}'); p[course] = cur; W.localStorage.setItem(posKey, JSON.stringify(p)); } catch (e) { }
    paint();
    if (scroll) $('ar-today').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.n, true); }); });
  $('ar-prev').addEventListener('click', function () { go(cur - 1); });
  $('ar-next').addEventListener('click', function () { go(cur + 1); });
  $('ar-show').addEventListener('click', function () {
    shown = !shown; $('ar-view').hidden = !shown; this.setAttribute('aria-expanded', shown ? 'true' : 'false');
    this.textContent = shown ? '🙈 Hide it' : '👁 Show it here';
    if (shown) view(); else $('ar-view').innerHTML = '';
  });
  $('ar-done').addEventListener('change', function () {
    if (this.checked) done[cur] = 1; else delete done[cur];
    save(); paint();
    if (this.checked && cur < total) { var me = cur; setTimeout(function () { if (cur === me) go(firstUndone()); }, 450); }
  });
  D.querySelectorAll('.ar-daily input').forEach(function (x) { x.addEventListener('change', function () { x.closest('li').classList.toggle('ticked', x.checked); }); });
  var start = firstUndone();
  try { var p = JSON.parse(W.localStorage.getItem(posKey) || '{}'); if (p[course] && !done[p[course]]) start = p[course]; } catch (e) { }
  go(start);
})(window, document);
