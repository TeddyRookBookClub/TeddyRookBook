/* Math Ladder: a topic page. The lesson (worked examples step by step, try-it problems, visuals), the practice panel
   (learn mode with the climb rule; a review when one is due), the status pill and the related-topic chips.
   On a passed topic, "Study this again" (ML.engine.resetTopics) sets it back to not learned, after a confirm step. */
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
  var run = null, fresh = false;
  function again(note) { // "Study this again": a link after the note, with a confirm step
    var b = ui.el('button', 'mlp-linkbtn', 'Study this again'); b.type = 'button';
    note.appendChild(D.createTextNode(' ')); note.appendChild(b);
    b.addEventListener('click', function () {
      var t = ui.esc((E.graph().T[d.id] || {}).title || (D.querySelector('h1') || {}).textContent || 'this topic');
      ui.confirm(b, '<p><b>Study ' + t + ' again?</b></p><p>It goes back to not learned. Its reviews stop, and you pass it again with the lesson and practice. Your XP and streak stay.</p>', 'Yes, study it again', function () {
        E.resetTopics([d.id]); fresh = true; start();
        var h = D.getElementById('practice'); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, { after: note });
    });
  }
  function start() {
    if (!host) return;
    if (run && run.destroy) try { run.destroy(); } catch (e) { }
    run = null;
    if (!ML.hasGen || !ML.hasGen(d.id)) { host.innerHTML = '<div class="mlp-soon mlp-soon-p"><p><b>Practice coming soon.</b> Problems for this topic are still being written and checked.</p></div>'; return; }
    var r = E.rec(d.id), st = E.status(d.id), note = '';
    host.innerHTML = '';
    if (st === 'due') {
      note = ui.el('p', 'mlp-pnote', '<b>A review is due.</b> Two problems keep this topic fresh; the next review moves further out when you get both.');
      host.appendChild(note); again(note); var box = ui.el('div'); host.appendChild(box);
      run = ML.runner(box, { mode: 'review', items: [{ id: d.id, k: 0 }, { id: d.id, k: 1 }], autofocus: false, onDone: function (s) {
        var row = ui.el('div', 'mlp-acts'); row.appendChild(ui.btn('Practice more', 'ghost', start)); box.appendChild(row);
      } });
      return;
    }
    if (r.s === 2) { note = ui.el('p', 'mlp-pnote', '<b>You’ve passed this topic.</b> Extra practice earns XP; its reviews stay on schedule.'); host.appendChild(note); again(note); }
    else if (fresh) { fresh = false; note = ui.el('p', 'mlp-pnote', '<b>Ready to learn again.</b> Read the lesson above, then practice here. Your XP and streak stay.'); note.setAttribute('role', 'status'); host.appendChild(note); }
    var box2 = ui.el('div'); host.appendChild(box2);
    run = ML.runner(box2, { mode: 'learn', topic: d.id, nextTopic: d.next && d.next.url ? d.next : null, autofocus: false, onPause: lesson && lesson.querySelector('.mlp-ex') ? showExample : null });
  }
  start();
})(window, document);
