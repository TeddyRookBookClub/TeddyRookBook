/* Math Ladder hub (/math/): progress on every rung, "you are here", the Continue card and the save code. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui, base = ML.cfg.base;
  var cont = D.getElementById('mlp-continue'), go = D.getElementById('mlp-hgo'), find = D.getElementById('mlp-hfind');
  var graphOK = false;

  function rungs() {
    var cur = E.course();
    D.querySelectorAll('.mlp-rung[data-course]').forEach(function (a) {
      var k = a.dataset.course, n = +a.dataset.n, here = a.querySelector('.mlp-here');
      a.classList.toggle('soon', !n);
      a.classList.toggle('here', k === cur);
      if (k === cur) a.id = 'mlp-here'; else if (a.id === 'mlp-here') a.removeAttribute('id');
      if (here) here.hidden = k !== cur;
      if (!graphOK || !n) return;
      var p = E.courseProgress(k), bar = a.querySelector('.mlp-rung-bar b'), t = a.querySelector('[data-pct]');
      bar.style.width = p.pct + '%';
      t.textContent = p.passed ? p.passed + ' / ' + p.total : '';
      a.setAttribute('aria-label', a.querySelector('b').textContent + ', ' + (p.passed ? p.passed + ' of ' + p.total + ' topics passed' : n + ' topics') + (k === cur ? ', you are here' : ''));
    });
  }
  function card() {
    var st = E.state(), cur = E.course(), active = cur || E.totalXP() > 0;
    cont.hidden = false;
    if (!active) {
      cont.className = 'mlp-continue mlp-welcome';
      cont.innerHTML = '<div class="mlp-tbanner-icon" aria-hidden="true">👋</div><div><h2>New here? Welcome.</h2><p>Take the short placement check to find your starting rung, or pick any course on the ladder and start at its first topic. Everything you do is saved in this browser.</p></div>' +
        '<div class="mlp-acts"><a class="mlp-btn pri" href="' + base + 'placement/">Find your rung</a></div>';
      return;
    }
    if (go) { go.textContent = 'Continue practicing'; }
    if (find && st.pl) find.textContent = 'Redo placement';
    var c = ui.course(cur), xp = E.xpToday(), goal = E.goal(), due = graphOK ? E.dueCount() : 0, t = graphOK ? E.next() : null, streak = E.streak();
    cont.className = 'mlp-continue';
    cont.innerHTML = ui.ring(xp, goal, 70) +
      '<div><p class="mlp-eyebrow">Continue' + (c ? ' · ' + ui.esc(c.title) : '') + '</p><h2>' + (t ? ui.taskLine(t) : 'Your next step is ready.') + '</h2>' +
      '<p class="mlp-cstats"><span><b>' + xp + '</b> of ' + goal + ' XP today</span>' + (due ? '<span><b>' + due + '</b> review' + (due === 1 ? '' : 's') + ' due</span>' : '') + (streak ? '<span><b>' + streak + '</b>-day streak</span>' : '') + (c ? '<span><a href="#mlp-here">Your rung on the ladder ↓</a></span>' : '') + '</p></div>' +
      '<a class="mlp-btn pri big" href="' + base + 'practice/">' + (xp >= goal ? 'Keep going' : 'Continue') + ' →</a>';
  }
  function paint() { rungs(); card(); }
  paint();
  E.on(paint);
  ui.graph().then(function () { graphOK = true; paint(); }, function () { });
  ui.savePanel(D.getElementById('mlp-save'), { onLoad: paint });
})(window, document);
