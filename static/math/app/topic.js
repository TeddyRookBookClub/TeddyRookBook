/* Math Ladder: a topic page. The lesson (worked examples step by step, try-it problems, visuals), the practice panel
   (learn mode with the climb rule; a review when one is due), the status pill and the related-topic chips. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui;
  var d = ui.data('ml-data'); if (!d) return;
  E.setGraph(d.graph);
  var pill = D.getElementById('mlp-status'), host = D.getElementById('mlp-runner'), lesson = D.getElementById('lesson');
  var head = D.querySelector('.mlp-practice-head'), mini = ui.el('div', 'mlp-mini'); if (head) head.appendChild(mini);

  function paint() {
    var st = E.status(d.id);
    if (pill) { pill.dataset.st = st; pill.textContent = st === 'passed' ? '✓ Passed' : st === 'due' ? '↻ Review due' : ui.LABEL[st]; }
    ui.paintChips(D.getElementById('mlp-topic'), d.course);
    mini.innerHTML = ui.ring(E.xpToday(), E.goal(), 44) + '<span><b>' + E.xpToday() + '</b> / ' + E.goal() + ' XP today</span>';
  }
  paint(); E.on(paint);

  if (lesson) ML.lessonUI(lesson);

  function showExample() {
    var ex = lesson && lesson.querySelector('.mlp-ex');
    if (!ex) { if (lesson) lesson.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (ex._showAll) ex._showAll();
    ex.classList.add('flash'); setTimeout(function () { ex.classList.remove('flash'); }, 1600);
    ex.scrollIntoView({ behavior: 'smooth', block: 'start' }); ex.tabIndex = -1; try { ex.focus({ preventScroll: true }); } catch (e) { }
  }
  function start() {
    if (!host) return;
    if (!ML.hasGen || !ML.hasGen(d.id)) { host.innerHTML = '<div class="mlp-soon mlp-soon-p"><p><b>Practice coming soon.</b> Problems for this topic are still being written and checked.</p></div>'; return; }
    var r = E.rec(d.id), st = E.status(d.id), note = '';
    host.innerHTML = '';
    if (st === 'due') {
      note = ui.el('p', 'mlp-pnote', '<b>A review is due.</b> Two problems keep this topic fresh; the next review moves further out when you get both.');
      host.appendChild(note); var box = ui.el('div'); host.appendChild(box);
      ML.runner(box, { mode: 'review', items: [{ id: d.id, k: 0 }, { id: d.id, k: 1 }], autofocus: false, onDone: function (s) {
        var row = ui.el('div', 'mlp-acts'); row.appendChild(ui.btn('Practice more', 'ghost', start)); box.appendChild(row);
      } });
      return;
    }
    if (r.s === 2) host.appendChild(ui.el('p', 'mlp-pnote', '<b>You’ve passed this topic.</b> Extra practice earns XP; its reviews stay on schedule.'));
    var box2 = ui.el('div'); host.appendChild(box2);
    ML.runner(box2, { mode: 'learn', topic: d.id, nextTopic: d.next && d.next.url ? d.next : null, autofocus: false, onPause: lesson && lesson.querySelector('.mlp-ex') ? showExample : null });
  }
  start();
})(window, document);
