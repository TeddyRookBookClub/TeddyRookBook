/* Science Lab units: "Check yourself" quizzes (.u-quiz), the "I finished this chapter" box (.u-done) and done ticks
   on the chapter strip (.u-nav) and the hub's chapter cards (.u-chapters). Progress lives in this browser only,
   through TRBLab.store('unit-<unit>') under the key 'chapters'.

   Quiz markup:
   <ol class="u-quiz">
     <li class="u-q" data-a="1"><p>Question?</p>
       <ul class="u-opts"><li><button type="button">First</button></li><li><button type="button">Second (right)</button></li></ul>
       <details><summary>Show the answer</summary><p>Why the second one is right.</p></details></li>
   </ol>
   <p class="u-score" aria-live="polite"></p>                                                                   */
(function (W, D) {
  'use strict';
  function store(unit) {
    if (W.TRBLab) return W.TRBLab.store('unit-' + unit);
    var data = {}; return { get: function (k, d) { return k in data ? data[k] : d; }, set: function (k, v) { data[k] = v; } };
  }
  function init() {
    // quizzes
    D.querySelectorAll('.u-quiz').forEach(function (quiz) {
      var qs = quiz.querySelectorAll('.u-q'), score = quiz.parentNode.querySelector('.u-score'), right = 0, answered = 0;
      qs.forEach(function (q) {
        var a = +q.dataset.a, btns = q.querySelectorAll('.u-opts button'), det = q.querySelector('details');
        btns.forEach(function (b, i) {
          b.addEventListener('click', function () {
            if (q.dataset.done) return;
            q.dataset.done = '1'; answered++;
            if (i === a) right++;
            btns.forEach(function (x, xi) {
              if (xi === a) { x.classList.add('right'); x.insertAdjacentText('afterbegin', '✓ '); }
              else if (x === b) { x.classList.add('wrong'); x.insertAdjacentText('afterbegin', '✗ '); }
              x.setAttribute('aria-disabled', 'true');
            });
            if (det) det.open = true;
            if (score) score.textContent = answered === qs.length ? 'You got ' + right + ' of ' + qs.length + ' right.' + (right === qs.length ? ' Nicely done!' : ' Read the explanations, then try the simulation again.') : '';
          });
        });
      });
    });
    // chapter progress
    function mark(root, done) {
      root.querySelectorAll('[data-chapter]').forEach(function (a) { a.classList.toggle('done', !!done[a.dataset.chapter]); });
    }
    D.querySelectorAll('.u-nav[data-unit], .u-chapters[data-unit]').forEach(function (el) {
      var done = store(el.dataset.unit).get('chapters', {});
      mark(el, done);
      if (el.classList.contains('u-chapters')) {
        var n = el.querySelectorAll('[data-chapter]').length, c = el.querySelectorAll('.done').length, p = el.parentNode.querySelector('.u-progress');
        if (p) p.textContent = c ? c + ' of ' + n + ' chapters done' : '';
      }
    });
    D.querySelectorAll('.u-done[data-unit]').forEach(function (box) {
      var st = store(box.dataset.unit), k = box.dataset.chapter, input = box.querySelector('.u-done-box');
      if (!input) return;
      input.checked = !!st.get('chapters', {})[k];
      input.addEventListener('change', function () {
        var done = st.get('chapters', {}); if (input.checked) done[k] = 1; else delete done[k];
        st.set('chapters', done);
        D.querySelectorAll('.u-nav[data-unit="' + box.dataset.unit + '"]').forEach(function (n) { mark(n, done); });
      });
    });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
