/* Math Ladder practice session (/math/practice/[?course=<key>]): asks the engine for the next task (a new topic with its
   lesson inline, a mixed review, a checkpoint), runs it one problem card at a time, then asks again. Shows XP today against
   the daily goal, the streak and reviews due; "done for today" when the goal is reached (you can keep going). */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui, cfg = ML.cfg, base = cfg.base, el = ui.el, esc = ui.esc;
  var task = D.getElementById('mlp-task'), stats = D.getElementById('mlp-sstats'), courseLine = D.getElementById('mlp-scourse');
  var loaded = {}, keepGoing = false, goalShown = E.xpToday() >= E.goal(), startNote = '';

  // ?course=<key>: start or switch to that course
  var q = new URLSearchParams(W.location.search), want = q.get('course');
  if (want && ui.course(want)) {
    if (E.course() !== want) { E.setCourse(want); startNote = want; }
    try { W.history.replaceState(null, '', W.location.pathname); } catch (e) { }
  }

  E.setFilter(function (id) {
    var c = String(id).split('.')[0];
    if (!cfg.gen || !cfg.gen[c]) return false;
    return loaded[c] ? !!(ML.hasGen && ML.hasGen(id)) : true;
  });
  function load(keys) {
    var todo = keys.filter(function (k, i) { return keys.indexOf(k) === i && !loaded[k]; });
    return Promise.all(todo.map(function (k) { return ML.loadCourse(k).then(function () { loaded[k] = true; }); }));
  }
  function courseOf(id) { return String(id).split('.')[0]; }

  function header() {
    var xp = E.xpToday(), goal = E.goal(), due = E.dueCount(), st = E.streak(), c = ui.course(E.course());
    stats.innerHTML = ui.ring(xp, goal, 58) + '<p><b>' + xp + '</b> / ' + goal + ' XP today<br>' + (st ? '<span>' + st + '-day streak</span> · ' : '') + '<span>' + due + ' review' + (due === 1 ? '' : 's') + ' due</span></p>';
    var opts = ui.courses().filter(function (k) { return k.n; }).map(function (k) { return '<option value="' + k.key + '"' + (c && k.key === c.key ? ' selected' : '') + '>' + esc(k.title) + '</option>'; }).join('');
    courseLine.innerHTML = '<label class="mlp-select"><span>Course</span><select id="mlp-scsel">' + (c ? '' : '<option value="">Choose a course</option>') + opts + '</select></label>' + (c ? '<a href="' + c.url + '">Course page</a> · <a href="' + base + 'map/?course=' + c.key + '">Skill map</a>' : '');
    D.getElementById('mlp-scsel').addEventListener('change', function () { if (this.value) { E.setCourse(this.value); startNote = this.value; run(); } });
  }

  function banner(icon, eyebrow, title, text) {
    return '<div class="mlp-tbanner"><div class="mlp-tbanner-icon" aria-hidden="true">' + icon + '</div><div><p class="mlp-eyebrow">' + eyebrow + '</p><h2>' + title + '</h2>' + (text ? '<p>' + text + '</p>' : '') + '</div></div>';
  }
  function goalPicker(host) {
    var row = el('div', 'mlp-goalbox'); row.appendChild(el('span', '', 'Daily goal:'));
    [20, 30, 40, 60, 80].forEach(function (g) { var b = ui.btn(g + ' XP', 'small', function () { E.setGoal(g); header(); row.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }); b.setAttribute('aria-pressed', String(E.goal() === g)); row.appendChild(b); });
    host.appendChild(row);
  }
  function doneForToday() {
    task.innerHTML = '';
    var box = el('section', 'mlp-done-day'); box.setAttribute('aria-label', 'Done for today');
    box.innerHTML = ui.ring(E.xpToday(), E.goal(), 96) + '<h2>Done for today!</h2><p>You reached your goal of ' + E.goal() + ' XP' + (E.streak() > 1 ? ' and kept a ' + E.streak() + '-day streak going' : '') + '. Short, steady practice beats long cramming, so this is a fine place to stop. Come back tomorrow for your reviews.</p>';
    var row = el('div', 'mlp-acts'); row.appendChild(ui.btn('Keep going', 'pri', function () { keepGoing = true; run(); }));
    var a = el('a', 'mlp-btn', 'See your progress'); a.href = base + 'progress/'; row.appendChild(a);
    box.appendChild(row); goalPicker(box); task.appendChild(box);
    row.querySelector('button').focus({ preventScroll: true });
  }
  function afterTask(sum) {
    header();
    if (!keepGoing && !goalShown && E.xpToday() >= E.goal()) { goalShown = true; return doneForToday(); }
    run();
  }
  function continueRow(host, label) {
    var row = el('div', 'mlp-acts'), b = ui.btn(label || 'Continue', 'pri', function () { afterTask(); });
    row.appendChild(b); host.appendChild(row); setTimeout(function () { b.focus({ preventScroll: true }); }, 30);
  }

  function lessonInto(host, t, open) {
    var det = el('details', 'mlp-inlesson'); det.open = !!open;
    det.innerHTML = '<summary>The lesson: ' + esc(t.title) + '</summary><p class="mlp-loading" style="padding:0 1.1rem">Loading the lesson…</p>';
    host.appendChild(det);
    fetch(t.url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html'), les = doc.querySelector('article.mlp-lesson');
      if (!les) { det.querySelector('.mlp-loading').innerHTML = 'The lesson for this topic is coming soon. Each problem below shows its worked steps after you answer.'; det.open = false; return; }
      les.removeAttribute('id'); det.removeChild(det.querySelector('.mlp-loading')); det.appendChild(D.importNode(les, true));
      ML.lessonUI(det.querySelector('.mlp-lesson'));
    }).catch(function () { det.querySelector('.mlp-loading').innerHTML = '<a href="' + t.url + '">Open the lesson page</a>.'; });
  }

  function showLearn(t) {
    var T = E.graph().T[t.id], c = ui.course(T.course), r = E.rec(t.id), fresh = r.s === 0;
    var why = t.reason === 'prereq' ? 'A skill from ' + esc(c ? c.title : 'an earlier course') + ' first' + (E.graph().T[t.for] ? ', for <b>' + esc(E.graph().T[t.for].title) + '</b>' : '')
      : t.reason === 'continue' ? 'Keep going' : t.reason === 'retry' ? 'Try again' : 'New topic' + (c ? ' · ' + esc(c.title) : '');
    task.innerHTML = '';
    if (startNote && ui.course(startNote)) {
      var sc = ui.course(startNote);
      task.appendChild(el('p', 'mlp-pnote', '<b>Starting ' + esc(sc.title) + '.</b> Earlier courses count as known. If a topic leans on something you haven’t learned, its page links to the skill underneath. Not sure? <a href="' + base + 'placement/">Find your rung</a>.'));
      startNote = '';
    }
    var hd = el('div'); hd.innerHTML = banner(c ? c.icon : '📘', why, '<a href="' + T.url + '">' + esc(T.title) + '</a>', esc(T.short || ''));
    task.appendChild(hd.firstChild);
    lessonInto(task, T, fresh);
    var box = el('div'); task.appendChild(box);
    ML.runner(box, { mode: 'learn', topic: t.id, autofocus: !fresh, onDone: afterTask, onPause: function () { var det = task.querySelector('.mlp-inlesson'); if (det) { det.open = true; var ex = det.querySelector('.mlp-ex'); if (ex && ex._showAll) ex._showAll(); (ex || det).scrollIntoView({ behavior: 'smooth', block: 'start' }); } } });
  }
  function showSet(t) {
    var quiz = t.type === 'checkpoint', ids = (quiz ? t.items : t.items.map(function (x) { return x.id; })).filter(function (x, i, a) { return a.indexOf(x) === i; });
    task.innerHTML = '';
    var hd = el('div');
    hd.innerHTML = quiz ? banner('🏁', 'Checkpoint', 'A quick checkpoint quiz', t.items.length + ' mixed problems from topics you passed recently. No hints this time; you’ll see every answer and its steps at the end. 2 XP for each right answer.')
      : banner('🔁', 'Review', 'Mixed review', t.items.length + ' problems from ' + ids.length + ' topic' + (ids.length > 1 ? 's' : '') + ' you’ve passed, mixed together. Working out which method each one needs is part of the practice.');
    task.appendChild(hd.firstChild);
    var box = el('div'); task.appendChild(box);
    var titles = {}; ids.forEach(function (id) { titles[id] = (E.graph().T[id] || {}).title; });
    ML.runner(box, { mode: quiz ? 'quiz' : 'review', items: t.items, titles: titles, onDone: function (sum) { continueRow(box, 'Continue'); } });
  }
  function showDone(t) {
    var c = ui.course(t.course);
    task.innerHTML = '';
    var box = el('section', 'mlp-done-day');
    if (t.soon) box.innerHTML = '<h2>Practice for ' + esc(c ? c.title : 'this course') + ' is coming soon</h2><p>Its problems are still being written and checked. You can read the lessons on the <a href="' + (c ? c.url : base) + '">course page</a>, or pick another course.</p>';
    else box.innerHTML = '<div class="mlp-bigemoji" aria-hidden="true">🎉</div><h2>All caught up' + (c ? ' in ' + esc(c.title) : '') + '</h2><p>Every topic you can work on right now is passed, and no reviews are due. ' + (t.next && t.next.length ? 'Ready for the next rung?' : 'You’ve reached the top of this part of the ladder.') + '</p>';
    var row = el('div', 'mlp-acts');
    (t.next || []).forEach(function (k) { var n = ui.course(k); if (n && n.n) row.appendChild(ui.btn('Start ' + esc(n.title), 'pri', function () { E.setCourse(k); startNote = ''; run(); })); });
    var a = el('a', 'mlp-btn', 'Back to the ladder'); a.href = base; row.appendChild(a);
    box.appendChild(row); task.appendChild(box);
  }
  function showStart() {
    task.innerHTML = '';
    var box = el('section', 'mlp-done-day');
    box.innerHTML = '<div class="mlp-bigemoji" aria-hidden="true">🪜</div><h2>Where would you like to start?</h2><p>Take the short placement check to find your rung, or choose a course above. Earlier courses count as known when you pick one; you can always step back.</p>';
    var row = el('div', 'mlp-acts'), a = el('a', 'mlp-btn pri', 'Find your rung'); a.href = base + 'placement/'; row.appendChild(a);
    var b = el('a', 'mlp-btn', 'See the ladder'); b.href = base; row.appendChild(b);
    box.appendChild(row); task.appendChild(box);
  }

  var guard = 0;
  function run() {
    header();
    if (!keepGoing && !goalShown && E.xpToday() >= E.goal()) { goalShown = true; return doneForToday(); }
    var t = E.next();
    var ids = t.type === 'learn' ? [t.id] : t.type === 'review' ? t.items.map(function (x) { return x.id; }) : t.type === 'checkpoint' ? t.items : [];
    var need = ids.map(courseOf).filter(function (k) { return !loaded[k]; });
    if (need.length && guard++ < 20) { task.innerHTML = '<p class="mlp-loading">Getting your problems ready…</p>'; return load(need).then(run); }
    guard = 0;
    if (t.type === 'learn') showLearn(t);
    else if (t.type === 'review' || t.type === 'checkpoint') showSet(t);
    else if (t.type === 'done') showDone(t);
    else showStart();
    try { W.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
  }
  ui.graph().then(function () { if (E.course()) load([E.course()]).then(run); else run(); }, function () {
    task.innerHTML = '<p class="mlp-soon">The list of topics didn’t load. Check your connection and reload the page.</p>';
  });
  E.on(function () { header(); });
})(window, document);
