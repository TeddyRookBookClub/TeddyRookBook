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
  function link(key, label) { var u = DATA.urls[key]; return u ? '<a href="' + esc(u) + '">' + esc(label || DATA.names[key] || key) + '</a>' : ''; }
  function rungLink(key) { var r = DATA.rung[key]; return r ? '<a href="' + esc(r.url) + '">Find your rung</a> on the ' + esc(r.ladder) : ''; }
  // the arithmetic result's matching Math Ladder course, and a choice of which to plan
  function mathLadder(p) {
    var ml = p.ml; if (!ml || !DATA.urls[ml]) return '';
    var who = run.name || 'your child', rp = DATA.links['math/placement'];
    return '<div class="pc-ml"><p class="pc-ml-h">🪜 On the Math Ladder: <b>' + link(ml, (DATA.names[ml] || '').replace(/^Math Ladder: /, '') + ' →') + '</b></p>' +
      '<p class="hs-small">The same skills, taught one topic at a time with practice that checks each answer, from Kindergarten to college.' + (rp ? ' To find the exact topic to start on, ' + esc(who) + ' can take <a href="' + esc(rp) + '">Find your rung</a>, a short check of at most 30 questions.' : '') + '</p>' +
      (DATA.subj[ml] ? '<fieldset class="pc-mc hs-noprint"><legend>In the planner, use</legend>' +
        '<label><input type="radio" name="pc-math" value="rays" checked> Ray\'s Arithmetic</label>' +
        '<label><input type="radio" name="pc-math" value="ml"> the Math Ladder</label>' +
        '<label><input type="radio" name="pc-math" value="both"> both</label></fieldset>' : '') + '</div>';
  }
  function byAge(rows) { for (var j = 0; j < (rows || []).length; j++) if (run.age <= rows[j].to) return rows[j]; return null; }
  // science and music aren't checked: a starting point by age
  function moreHTML() {
    var sc = byAge(DATA.science), mu = byAge(DATA.music), h = '';
    if (sc && DATA.urls[sc.course]) {
      var also = (sc.also || []).filter(function (k) { return DATA.urls[k]; });
      h += '<div class="pc-r pc-more"><h3>🔭 Science</h3><p class="pc-big">' + link(sc.course, (DATA.names[sc.course] || '') + (DATA.rung[sc.course] ? '' : ', Lesson 1') + ' →') + '</p><p class="hs-small">' + esc(sc.text) + '</p>' +
        (also.length ? '<p class="hs-small">Also good: ' + also.map(function (k) { return link(k); }).join(', ') + '.</p>' : '') +
        (DATA.rung[sc.course] ? '<p class="hs-small">Not sure of the level? ' + rungLink(sc.course) + '.</p>' : DATA.links['science-lab'] ? '<p class="hs-small"><a href="' + esc(DATA.links['science-lab']) + '">The Science Lab</a>: simulations to play with, for every age.</p>' : '') +
        (sc.plan !== false && DATA.subj[sc.course] ? '<label class="pc-addl hs-noprint"><input type="checkbox" class="pc-add" value="' + esc(sc.course) + '" data-off="science"> Put this in the planner (in place of the science book)</label>' : '') + '</div>';
    }
    if (mu && DATA.links.music) {
      var ml = [['music/piano-basics', 'Piano Basics'], ['music/reading-music', 'Reading Music'], ['music/songs', 'Songs'], ['music/metronome', 'Metronome'], ['music/rhythm', 'Rhythm trainer']].filter(function (x) { return DATA.links[x[0]]; });
      h += '<div class="pc-r pc-more"><h3>🎹 Music</h3><p class="pc-big">' + (DATA.links['music/piano-basics'] ? '<a href="' + esc(DATA.links['music/piano-basics']) + '">Piano Basics, Chapter 1 →</a>' : '<a href="' + esc(DATA.links.music) + '">Music →</a>') + '</p><p class="hs-small">' + esc(mu.text) + '</p>' +
        (ml.length > 1 ? '<p class="hs-small pc-mlinks">' + ml.map(function (x) { return '<a href="' + esc(DATA.links[x[0]]) + '">' + x[1] + '</a>'; }).join(' · ') + '</p>' : '') +
        (DATA.subj['mus-piano-basics'] ? '<label class="pc-addl hs-noprint"><input type="checkbox" class="pc-add" value="mus-piano-basics"> Put Music in the planner</label>' : '') + '</div>';
    }
    return h ? '<h3 class="pc-more-h">More places to start</h3><div class="pc-results">' + h + '</div>' : '';
  }
  function results() {
    $('pc-run').hidden = true;
    var keys = Object.keys(run.results), who = run.name || 'Your child';
    var h = '<h2>' + esc(who) + '’s starting points</h2>';
    if (!keys.length) h += '<p>No subjects were checked.</p>';
    else h += '<div class="pc-results">' + keys.map(function (k) {
      var r = run.results[k], s = DATA.subjects.filter(function (x) { return x.key === k; })[0], c = r.p.course, url = DATA.urls[c] || '#';
      var lessonUrl = /actual-reading/.test(url) ? url : url + 'lesson-' + r.p.lesson + '/';
      return '<div class="pc-r"><h3>' + s.icon + ' ' + esc(s.name) + '</h3><p class="pc-big"><a href="' + esc(lessonUrl) + '">' + esc(DATA.names[c] || c) + ', Lesson ' + r.p.lesson + ' →</a></p><p class="hs-small">' + esc(r.why) + '</p>' + (k === 'arithmetic' ? mathLadder(r.p) : '') + '</div>';
    }).join('') + '</div>';
    h += moreHTML();
    h += '<div class="hs-actions hs-noprint">' + (keys.length || DATA.music ? '<button type="button" class="hs-btn pri big" id="pc-plan">🗓️ Put these in the lesson planner</button>' : '') +
      '<button type="button" class="hs-btn" id="pc-print">🖨 Print</button><button type="button" class="hs-btn ghost" id="pc-again">Check another child</button></div>' +
      '<p class="hs-small">A starting point is a suggestion, not a verdict. If the first week is too easy, skip ahead; if it’s a struggle, go back a little. Children often place differently in reading and arithmetic, and that’s normal.</p>';
    $('pc-res').innerHTML = h; $('pc-res').hidden = false; $('pc-res').scrollIntoView({ behavior: 'smooth', block: 'start' });
    var pl = $('pc-plan');
    if (pl) pl.addEventListener('click', function () {
      var picks = {}; keys.forEach(function (k) { picks[k] = { course: run.results[k].p.course, lesson: run.results[k].p.lesson }; });
      // Math Ladder instead of (or as well as) Ray's; science and music when ticked
      var mc = $('pc-res').querySelector('input[name="pc-math"]:checked'), ml = run.results.arithmetic && run.results.arithmetic.p.ml;
      if (mc && ml && DATA.subj[ml] && mc.value !== 'rays') {
        picks[DATA.subj[ml]] = { course: ml, lesson: 1 };
        if (mc.value === 'ml') { delete picks.arithmetic; picks.arithmetic = { off: 1 }; picks['higher-math'] = { off: 1 }; }
      }
      [].forEach.call($('pc-res').querySelectorAll('input.pc-add:checked'), function (b) { if (DATA.subj[b.value]) { picks[DATA.subj[b.value]] = { course: b.value, lesson: 1 }; if (b.dataset.off) picks[b.dataset.off] = { off: 1 }; } });
      try { W.localStorage.setItem('trb-placement-v1', JSON.stringify({ name: run.name, age: run.age, picks: picks })); } catch (e) { }
      W.location.href = $('pc').querySelector('.hs-crumbs a').getAttribute('href') + 'planner/';
    });
    $('pc-print').addEventListener('click', function () { W.print(); });
    $('pc-again').addEventListener('click', function () { $('pc-res').hidden = true; $('pc-who').hidden = false; $('pc-name').value = ''; $('pc-name').focus(); });
  }
})(window, document);
