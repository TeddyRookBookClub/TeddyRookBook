/* A ladder's course page: topic chips colored by state, progress, Start or Continue, and the next topic up (a topic that
   is still being written is never offered as the next one). */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui, base = ML.cfg.base;
  var d = ui.data('ml-data'); if (!d) return;
  var root = D.getElementById('mlp-course'), key = d.course;
  E.setGraph({ partial: true, courses: ui.allCourses(), topics: d.topics });
  var soon = {}; (d.soon || []).forEach(function (id) { soon[id] = 1; });
  E.setFilter(function (id) { var T0 = E.graph().T[id]; return !soon[id] && !(T0 && T0.soon); });
  var ids = d.topics.filter(function (t) { return t.course === key; }).map(function (t) { return t.id; });
  var T = {}; d.topics.forEach(function (t) { T[t.id] = t; });

  function paint() {
    ui.paintChips(root, key);
    var passed = 0, due = 0, learning = 0, d0 = E.today();
    ids.forEach(function (id) { var r = E.rec(id); if (r.s === 2) { passed++; if (r.due <= d0) due++; } else if (r.s === 1) learning++; });
    var bar = root.querySelector('.mlp-bar'), pct = ids.length ? Math.round(100 * passed / ids.length) : 0;
    if (bar) { bar.querySelector('b').style.width = pct + '%'; bar.setAttribute('aria-valuenow', passed); }
    var ps = root.querySelector('[data-passed]'); if (ps) ps.textContent = passed;
    var dd = root.querySelector('[data-due]'); if (dd) dd.textContent = due ? ' · ' + due + ' review' + (due === 1 ? '' : 's') + ' due' : '';
    // units: how many passed
    root.querySelectorAll('[data-unit]').forEach(function (u) {
      var us = ids.filter(function (id) { return T[id].unit === u.dataset.unit; }), up = us.filter(function (id) { return E.isPassed(id); }).length;
      u.textContent = up ? up + ' of ' + us.length + ' passed' : us.length + ' topics';
    });
    // the next topic: the engine's choice for this course (a started-but-unpassed earlier skill comes first)
    var nx0 = E.courseNext(key), nextId = nx0 && nx0.id, nl = nextId ? ui.ladderOf(String(nextId).split('.')[0]) : null;
    var why = !nx0 ? '' : nx0.reason === 'prereq' ? (nl && nl.key !== ui.ladder().key ? 'First, from the ' + nl.title + ':' : 'First, from an earlier course:') : nx0.reason === 'continue' || nx0.reason === 'retry' ? 'Keep going with' : 'Next up:';
    var start = D.getElementById('mlp-cstart'), nx = D.getElementById('mlp-cnext');
    if (start) start.textContent = passed || learning ? (E.course() === key ? 'Continue' : 'Continue this course') : 'Start this course';
    if (nx) {
      if (nextId && T[nextId] && (passed || learning || E.course() === key)) { nx.hidden = false; nx.innerHTML = ui.esc(why) + ' <a href="' + T[nextId].url + '"><b>' + ui.esc(T[nextId].title) + '</b></a>' + (T[nextId].course !== key && ui.course(T[nextId].course) ? ' <span class="mlp-small">(' + ui.esc(ui.course(T[nextId].course).title) + ')</span>' : ''); }
      else if (!nextId && ids.length && passed === ids.length) { nx.hidden = false; nx.innerHTML = '<b>Course complete!</b> Every topic passed. Reviews will keep it fresh.'; }
      else nx.hidden = true;
    }
  }
  paint(); E.on(paint);
  ui.graph().then(paint, function () { }); // the full graph, for earlier-course skills more than one step back
})(window, document);
