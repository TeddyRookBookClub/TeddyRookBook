/* "Where should we start?": a parent-judged placement ladder for reading, spelling and arithmetic. */
(function (W, D) {
  'use strict';
  var DATA = JSON.parse(D.getElementById('pc-data').textContent);
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var run = null; // {name, age, queue:[subject], at, sub, i, lastEasy, lastHard, results:{key:{p, why}}}
  function startIndex(sub, age) { for (var j = 0; j < sub.start.length; j++) if (age <= sub.start[j][0]) return Math.min(sub.start[j][1], sub.points.length - 1); return 0; }
  $('pc-go').addEventListener('click', function () {
    var keys = [].slice.call(D.querySelectorAll('.pc-subs input:checked')).map(function (x) { return x.value; });
    if (!keys.length) return;
    run = { name: $('pc-name').value.trim(), age: +$('pc-age').value, queue: DATA.subjects.filter(function (s) { return keys.indexOf(s.key) >= 0; }), at: -1, results: {} };
    $('pc-who').hidden = true; nextSubject();
  });
  function nextSubject() {
    run.at++;
    if (run.at >= run.queue.length) return results();
    var s = run.sub = run.queue[run.at]; run.i = startIndex(s, run.age); run.lastEasy = -1; run.lastHard = -1; run.steps = 0;
    show();
  }
  function show() {
    var s = run.sub, p = s.points[run.i], who = run.name || 'your child';
    var h = '<p class="pc-prog">' + s.icon + ' ' + esc(s.name) + ' · subject ' + (run.at + 1) + ' of ' + run.queue.length + ' · check ' + (run.steps + 1) + '</p>' +
      '<p class="pc-ask">' + esc(p.ask || s.how).replace(/your child/g, esc(who)) + '</p>';
    if (p.dictate) h += '<p class="hs-small">These are for you to say aloud; turn the screen away while ' + esc(who) + ' writes.</p>';
    h += '<div class="pc-lines' + (p.big ? ' big' : '') + (p.dictate ? ' dict' : '') + '">' + p.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>';
    if (p.answers) h += '<details class="pc-ans"><summary>Show answers</summary><ol>' + p.answers.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ol></details>';
    h += '<p class="pc-q">How did it go?</p><div class="pc-judge">' + s.judge.map(function (j, k) { return '<button type="button" class="hs-btn' + (k === 1 ? ' pri' : '') + '" data-j="' + k + '">' + esc(j) + '</button>'; }).join('') + '</div>' +
      '<p class="pc-skip"><button type="button" class="hs-btn ghost" data-j="skip">Skip ' + esc(s.name.toLowerCase()) + '</button></p>';
    $('pc-run').innerHTML = h; $('pc-run').hidden = false; $('pc-run').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function place(i, why) { run.results[run.sub.key] = { p: run.sub.points[i], why: why }; nextSubject(); }
  $('pc-run').addEventListener('click', function (e) {
    var b = e.target.closest('[data-j]'); if (!b) return;
    var j = b.dataset.j, i = run.i, last = run.sub.points.length - 1; run.steps++;
    if (j === 'skip') return nextSubject();
    if (j === '1') return place(i, 'This level needed a little help: just right for learning.');
    if (j === '0') {
      run.lastEasy = i;
      if (run.lastHard === i + 1) return place(i, 'This level was comfortable and the next was too hard, so the first lessons will build confidence before moving on.');
      if (i === last) return place(i, 'Everything we checked was easy. Start here and move quickly; skip ahead whenever lessons feel too easy.');
      run.i = i + 1; return show();
    }
    run.lastHard = i;
    if (run.lastEasy === i - 1 && i > 0) return place(i - 1, 'This level was comfortable and the next was too hard, so the first lessons will build confidence before moving on.');
    if (i === 0) return place(0, 'Start right at the beginning. That is exactly what the first lessons are for.');
    run.i = i - 1; show();
  });
  function results() {
    $('pc-run').hidden = true;
    var keys = Object.keys(run.results), who = run.name || 'Your child';
    var h = '<h2>' + esc(who) + '’s starting points</h2>';
    if (!keys.length) h += '<p>No subjects were checked.</p>';
    else h += '<div class="pc-results">' + keys.map(function (k) {
      var r = run.results[k], s = DATA.subjects.filter(function (x) { return x.key === k; })[0], c = r.p.course, url = DATA.urls[c] || '#';
      var lessonUrl = /actual-reading/.test(url) ? url : url + 'lesson-' + r.p.lesson + '/';
      return '<div class="pc-r"><h3>' + s.icon + ' ' + esc(s.name) + '</h3><p class="pc-big"><a href="' + esc(lessonUrl) + '">' + esc(DATA.names[c] || c) + ', Lesson ' + r.p.lesson + ' →</a></p><p class="hs-small">' + esc(r.why) + '</p></div>';
    }).join('') + '</div>';
    h += '<div class="hs-actions hs-noprint">' + (keys.length ? '<button type="button" class="hs-btn pri big" id="pc-plan">🗓️ Put these in the lesson planner</button>' : '') +
      '<button type="button" class="hs-btn" id="pc-print">🖨 Print</button><button type="button" class="hs-btn ghost" id="pc-again">Check another child</button></div>' +
      '<p class="hs-small">A starting point is a suggestion, not a verdict. If the first week is too easy, skip ahead; if it’s a struggle, go back a little. Children often place differently in reading and arithmetic, and that’s normal.</p>';
    $('pc-res').innerHTML = h; $('pc-res').hidden = false; $('pc-res').scrollIntoView({ behavior: 'smooth', block: 'start' });
    var pl = $('pc-plan');
    if (pl) pl.addEventListener('click', function () {
      var picks = {}; keys.forEach(function (k) { picks[k] = { course: run.results[k].p.course, lesson: run.results[k].p.lesson }; });
      try { W.localStorage.setItem('trb-placement-v1', JSON.stringify({ name: run.name, age: run.age, picks: picks })); } catch (e) { }
      W.location.href = $('pc').querySelector('.hs-crumbs a').getAttribute('href') + 'planner/';
    });
    $('pc-print').addEventListener('click', function () { W.print(); });
    $('pc-again').addEventListener('click', function () { $('pc-res').hidden = true; $('pc-who').hidden = false; $('pc-name').value = ''; $('pc-name').focus(); });
  }
})(window, document);
