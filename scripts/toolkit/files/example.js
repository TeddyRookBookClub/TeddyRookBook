/* The toolkit example: practice for one topic on the Teddy Rook engine. Read this file to see how the pieces fit:
   1. cfg.js sets MathLadder.cfg (where the files are: root, and which generator and visual files exist) and
      graph.js sets TRB_GRAPH (every course and topic, with prerequisites). Load them before the engine files.
   2. MathLadder.engine.setGraph(TRB_GRAPH) gives the engine the topics.
   3. MathLadder.loadCourse(courseKey) loads that course's problem generators and visuals (script tags, so it works
      from a file on disk too).
   4. MathLadder.runner(element, { mode: 'learn', topic: id }) shows the problem card: answer, check, worked steps.
      Pass a topic with 3 right answers, the last 2 in a row. Progress is saved in localStorage ('trb-math-v1').
   The lesson comes from content/<ladder>/lessons/<course>.json, drawn here by lessonHTML() (the same blocks the site
   uses); a browser only lets a page read those files when it is served by a web server, so from a file on disk the
   lesson shows a link to the site instead. Other options of runner(): see the comment at the top of math/core/runner.js. */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, G = W.TRB_GRAPH, cfg = ML.cfg;
  E.setGraph(G);
  var $ = function (id) { return D.getElementById(id); };
  var sL = $('ex-ladder'), sC = $('ex-course'), sT = $('ex-topic');
  var byCourse = {}; G.topics.forEach(function (t) { (byCourse[t.course] = byCourse[t.course] || []).push(t); });
  var T = {}; G.topics.forEach(function (t) { T[t.id] = t; });
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function opts(list, val, txt) { return list.map(function (x) { return '<option value="' + esc(x[val]) + '">' + esc(x[txt]) + '</option>'; }).join(''); }
  function dirOf(k) { var c = G.courses.filter(function (x) { return x.key === k; })[0]; return (c && c.dir) || 'math'; }

  sL.innerHTML = opts(cfg.ladders, 'key', 'title');
  function fillCourses() { sC.innerHTML = opts(G.courses.filter(function (c) { return c.dir === sL.value && byCourse[c.key]; }), 'key', 'title'); fillTopics(); }
  function fillTopics() { sT.innerHTML = opts(byCourse[sC.value] || [], 'id', 'title'); }
  function pick(id) {
    var t = T[id]; if (!t) return;
    sL.value = dirOf(t.course); fillCourses(); sC.value = t.course; fillTopics(); sT.value = id;
  }
  sL.addEventListener('change', function () { fillCourses(); go(sT.value); });
  sC.addEventListener('change', function () { fillTopics(); go(sT.value); });
  sT.addEventListener('change', function () { go(sT.value); });

  /* the lesson blocks, as the site draws them */
  function lessonHTML(L, id) {
    return '<article class="mlp-lesson">' + (L.blocks || []).map(function (b) {
      switch (b.t) {
        case 'p': return '<p>' + b.html + '</p>';
        case 'h': return '<h2 class="mlp-lh">' + esc(b.text) + '</h2>';
        case 'key': return '<div class="mlp-box mlp-key"><p class="mlp-box-lab">🔑 Key idea</p><div class="mlp-box-body">' + b.html + '</div></div>';
        case 'why': return '<div class="mlp-box mlp-why"><p class="mlp-box-lab">💡 Why it works</p><div class="mlp-box-body">' + b.html + '</div></div>';
        case 'mistake': return '<div class="mlp-box mlp-mistake"><p class="mlp-box-lab">⚠️ Common mistake</p><div class="mlp-box-body">' + b.html + '</div></div>';
        case 'note': return '<div class="mlp-note">' + b.html + '</div>';
        case 'list': return '<ul class="mlp-list">' + (b.items || []).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
        case 'table': return '<div class="mlp-table-wrap"><table class="mlp-table">' + (b.cap ? '<caption>' + b.cap + '</caption>' : '') + (b.head ? '<thead><tr>' + b.head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead>' : '') + '<tbody>' + (b.rows || []).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
        case 'ex': return '<section class="mlp-ex" data-ex><p class="mlp-box-lab">✏️ Worked example' + (b.title ? ': ' + b.title : '') + '</p><div class="mlp-ex-q">' + b.q + '</div><ol class="mlp-ex-steps">' + (b.steps || []).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' + (b.a ? '<p class="mlp-ex-a"><b>Answer:</b> ' + b.a + '</p>' : '') + '</section>';
        case 'viz': return '<figure class="mlp-fig"><div class="ml-viz" data-viz="' + esc(b.name) + '" data-opts="' + esc(JSON.stringify(b.opts || {})) + '" aria-label="' + esc(b.name) + '"></div>' + (b.cap ? '<figcaption>' + b.cap + '</figcaption>' : '') + '</figure>';
        case 'try': return '<div class="mlp-try" data-try="' + esc(id) + '"></div>';
        default: return '';
      }
    }).join('') + '</article>';
  }
  var lessons = {};
  function lesson(t) {
    var body = $('ex-lesson-body'), dir = dirOf(t.course), link = '<p><a href="' + esc(t.url) + '">Read the lesson on Teddy Rook Book</a>.</p>';
    if (W.location.protocol === 'file:') { body.innerHTML = link + '<p class="mlp-small">Serve this folder with a web server to read the lessons here (see README.md).</p>'; return; }
    body.innerHTML = '<p class="mlp-loading">Loading the lesson…</p>';
    if (!lessons[t.course]) lessons[t.course] = fetch('content/' + dir + '/lessons/' + t.course + '.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    lessons[t.course].then(function (all) {
      if (sT.value !== t.id) return;
      var L = all[t.id]; if (!L) { body.innerHTML = link; return; }
      var need = (L.blocks || []).filter(function (b) { return b.t === 'viz'; }).map(function (b) { return ML.needViz(b.name); });
      Promise.all(need).then(function () { body.innerHTML = lessonHTML(L, t.id); ML.lessonUI(body.firstChild); });
    }).catch(function () { lessons[t.course] = null; body.innerHTML = link; });
  }

  function go(id) {
    var t = T[id]; if (!t) return;
    try { if (W.location.hash.slice(1) !== id) W.history.replaceState(null, '', '#' + id); } catch (e) { }
    $('ex-title').textContent = t.title; $('ex-short').textContent = t.short || '';
    var host = $('ex-runner'); host.innerHTML = '<p class="mlp-loading">Loading…</p>';
    ML.loadCourse(t.course).then(function () {
      if (sT.value !== id) return;
      lesson(t);
      host.innerHTML = '';
      if (!ML.hasGen(id)) { host.innerHTML = '<p class="mlp-soon">This topic has no problems yet.</p>'; return; }
      ML.runner(host, { mode: E.status(id) === 'due' ? 'review' : 'learn', topic: id, items: [{ id: id, k: 0 }, { id: id, k: 1 }], autofocus: false,
        onPause: function () { $('ex-lesson').open = true; } });
    });
  }
  var start = decodeURIComponent(W.location.hash.slice(1)) || 'g3.add-within-1000';
  if (!T[start]) start = G.topics[0].id;
  pick(start); go(start);
})(window, document);
