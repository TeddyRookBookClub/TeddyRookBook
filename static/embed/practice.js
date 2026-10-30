/* Embed: ladder practice in a frame (/embed/practice/).
     ?topic=<topic id>   one topic, as on its topic page: learn it (3 right answers, the last 2 in a row), or its review when due
     ?course=<key>       the ladder's practice for that course, as on /<ladder>/practice/?course=<key>: new topics in teaching
                         order, mixed reviews and checkpoints (no daily-goal stop and no "what's next" card)
   Runs on the shared engine (static/math/core/, static/math/app/ui.js); the page picks the ladder from the parameter before
   ui.js loads (layouts/embed/single.html). Lessons come from the topic's own page on this site, minus anything on the
   withheld list (data/embed.json "withheld": material shared with permission that isn't cleared for embeds).
   Progress is the ladders' usual localStorage save (trb-math-v1); in a frame the browser keeps it apart from the full site.
   Without storage everything still works for the visit (the engine keeps going in memory). */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, E = ML.engine, ui = ML.ui, el = ui.el, esc = ui.esc;
  var head = D.getElementById('emb-head'), task = D.getElementById('emb-task');
  var q = new URLSearchParams(W.location.search), topic = (q.get('topic') || '').trim(), course = (q.get('course') || '').trim();
  var WH = []; try { WH = JSON.parse(D.getElementById('emb-withheld').textContent) || []; } catch (e) { }
  var loaded = {}, root = ML.cfg.root || '/';

  E.setFilter(function (id) {
    var c = String(id).split('.')[0], T0 = E.graph().T[id];
    if (T0 && T0.soon) return false;
    if (!ML.cfg.gen || !ML.cfg.gen[c]) return false;
    return loaded[c] ? !!(ML.hasGen && ML.hasGen(id)) : true;
  });
  function courseOf(id) { return String(id).split('.')[0]; }
  function load(keys) {
    var todo = keys.filter(function (k, i) { return keys.indexOf(k) === i && !loaded[k]; });
    return Promise.all(todo.map(function (k) { return ML.loadCourse(k).then(function () { loaded[k] = true; }); }));
  }
  function open(url) { if (W.TRBEmbed) W.TRBEmbed.open(url); }
  function msg(html) {
    task.innerHTML = '<div class="mlp-soon emb-msg">' + html + '<p><a href="' + root + 'developers/">How these embeds work</a></p></div>';
  }
  function withheld(u) { return WH.some(function (p) { return String(u || '').indexOf(p) >= 0; }); }

  /* ---------- the lesson, from the topic's page ---------- */
  function clean(html) {
    // drop sentences and list items that point to withheld material, then unwrap any link to it that is left
    WH.forEach(function (p) {
      var x = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp('<li>(?:(?!</li>)[\\s\\S])*?href="[^"]*' + x + '[\\s\\S]*?</li>', 'g'), '');
      html = html.replace(new RegExp('\\s*[^.!?>]*<a [^>]*href="[^"]*' + x + '[^"]*"[^>]*>[\\s\\S]*?</a>[^.!?<]*[.!?]', 'g'), '');
    });
    return html;
  }
  function lessonInto(host, T) {
    var det = el('details', 'mlp-inlesson emb-lesson');
    det.innerHTML = '<summary>The lesson: ' + esc(T.title) + '</summary>';
    host.appendChild(det);
    var got = false;
    det.addEventListener('toggle', function () {
      if (!det.open || got) return; got = true;
      var wait = el('p', 'mlp-loading', 'Loading the lesson…'); wait.style.padding = '0 1rem'; det.appendChild(wait);
      fetch(T.url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(clean(html), 'text/html'), les = doc.querySelector('article.mlp-lesson');
        if (!les) { wait.innerHTML = 'The lesson for this topic is coming soon. Each problem shows its worked steps after you answer.'; return; }
        les.removeAttribute('id');
        les.querySelectorAll('a[href]').forEach(function (a) { if (withheld(a.getAttribute('href'))) a.replaceWith(D.createTextNode(a.textContent)); });
        det.removeChild(wait); det.appendChild(D.importNode(les, true));
        ML.lessonUI(det.querySelector('.mlp-lesson'));
      }).catch(function () { wait.innerHTML = '<a href="' + T.url + '">Open the lesson on Teddy Rook Book</a>.'; });
    });
    return det;
  }
  function showLesson(det) {
    if (!det) return;
    det.open = true;
    setTimeout(function () { var ex = det.querySelector('.mlp-ex'); if (ex && ex._showAll) ex._showAll(); (ex || det).scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 400);
  }

  /* ---------- header ---------- */
  function stats() {
    var xp = E.xpToday(), due = E.dueCount();
    return '<div class="emb-stats">' + ui.ring(xp, E.goal(), 40) + '<span><b>' + xp + '</b> / ' + E.goal() + ' XP today<br>' + due + ' review' + (due === 1 ? '' : 's') + ' due</span></div>';
  }
  function topicHead(T) {
    var c = ui.course(T.course), L = ui.ladderOf(T.course), st = E.status(T.id);
    head.innerHTML = '<div class="emb-htext"><p class="emb-eye">' + esc(L.short) + (c ? ' · ' + esc(c.title) : '') + '</p>' +
      '<h1 class="emb-title"><a href="' + T.url + '">' + esc(T.title) + '</a></h1>' +
      '<p class="emb-st"><span class="mlp-pill" data-st="' + st + '">' + (st === 'passed' ? '✓ Passed' : st === 'due' ? '↻ Review due' : ui.LABEL[st]) + '</span></p></div>' + stats();
  }
  function courseHead(c) {
    var L = ui.ladderOf(c.key), p = E.courseProgress(c.key);
    head.innerHTML = '<div class="emb-htext"><p class="emb-eye">' + esc(L.title) + ' · Practice</p>' +
      '<h1 class="emb-title"><a href="' + c.url + '">' + esc(c.title) + '</a></h1>' +
      '<p class="emb-st">' + p.passed + ' of ' + p.total + ' topics passed</p></div>' + stats();
  }

  /* ---------- one topic ---------- */
  function startTopic(T) {
    var paint = function () { topicHead(T); };
    paint(); E.on(paint); open(T.url);
    task.innerHTML = '<p class="mlp-loading">Getting your problems ready…</p>';
    load([T.course]).then(function () {
      task.innerHTML = '';
      if (!ML.hasGen || !ML.hasGen(T.id)) { msg('<p><b>Practice for this topic is coming soon.</b> You can read its lesson on <a href="' + T.url + '">Teddy Rook Book</a>.</p>'); return; }
      var det = lessonInto(task, T), box = el('div'); task.appendChild(box);
      (function go(first) {
        box.innerHTML = '';
        if (E.status(T.id) === 'due') {
          box.appendChild(el('p', 'mlp-pnote', '<b>A review is due.</b> Two problems keep this topic fresh.'));
          var b2 = el('div'); box.appendChild(b2);
          ML.runner(b2, { mode: 'review', items: [{ id: T.id, k: 0 }, { id: T.id, k: 1 }], autofocus: !first, onDone: function () {
            var row = el('div', 'mlp-acts'); row.appendChild(ui.btn('Practice more', 'ghost', function () { go(false); })); b2.appendChild(row);
          } });
          return;
        }
        if (E.rec(T.id).s === 2) box.appendChild(el('p', 'mlp-pnote', '<b>You’ve passed this topic.</b> Extra practice earns XP.'));
        var b = el('div'); box.appendChild(b);
        ML.runner(b, { mode: 'learn', topic: T.id, autofocus: !first, onPause: function () { showLesson(det); } });
      })(true);
    });
  }

  /* ---------- a course ---------- */
  function startCourse(c) {
    if (E.course() !== c.key) E.setCourse(c.key);
    open(c.url);
    var first = true, guard = 0;
    function banner(icon, eyebrow, title, text) {
      return '<div class="mlp-tbanner emb-banner"><div class="mlp-tbanner-icon" aria-hidden="true">' + icon + '</div><div><p class="mlp-eyebrow">' + eyebrow + '</p><h2>' + title + '</h2>' + (text ? '<p>' + text + '</p>' : '') + '</div></div>';
    }
    function top() { if (!first) try { W.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { } }
    function run() {
      courseHead(c);
      var t = E.next();
      var ids = t.type === 'learn' ? [t.id] : t.type === 'review' ? t.items.map(function (x) { return x.id; }) : t.type === 'checkpoint' ? t.items : [];
      var need = ids.map(courseOf).filter(function (k) { return !loaded[k]; });
      if (need.length && guard++ < 20) { task.innerHTML = '<p class="mlp-loading">Getting your problems ready…</p>'; return load(need).then(run); }
      guard = 0; task.innerHTML = '';
      var af = !first; first = false;
      if (t.type === 'learn') {
        var T = E.graph().T[t.id], tc = ui.course(T.course), ol = t.ladder ? ui.ladderOf(T.course) : null;
        var why = t.reason === 'prereq' ? 'A skill from ' + (ol ? 'the ' + esc(ol.title) : esc(tc ? tc.title : 'an earlier course')) + ' first'
          : t.reason === 'continue' ? 'Keep going' : t.reason === 'retry' ? 'Try again' : 'New topic' + (tc ? ' · ' + esc(tc.title) : '');
        var hd = el('div'); hd.innerHTML = banner(tc ? tc.icon : '📘', why, '<a href="' + T.url + '">' + esc(T.title) + '</a>', esc(T.short || ''));
        task.appendChild(hd.firstChild);
        var det = lessonInto(task, T), box = el('div'); task.appendChild(box);
        if (E.rec(t.id).s === 0) det.open = true;
        ML.runner(box, { mode: 'learn', topic: t.id, autofocus: af, onDone: function () { run(); top(); }, onPause: function () { showLesson(det); } });
      } else if (t.type === 'review' || t.type === 'checkpoint') {
        var quiz = t.type === 'checkpoint', uniq = (quiz ? t.items : t.items.map(function (x) { return x.id; })).filter(function (x, i, a) { return a.indexOf(x) === i; });
        var hd2 = el('div');
        hd2.innerHTML = quiz ? banner('🏁', 'Checkpoint', 'A quick checkpoint quiz', t.items.length + ' mixed problems from topics you passed recently. You’ll see every answer and its steps at the end.')
          : banner('🔁', 'Review', 'Mixed review', t.items.length + ' problems from ' + uniq.length + ' topic' + (uniq.length > 1 ? 's' : '') + ' you’ve passed.');
        task.appendChild(hd2.firstChild);
        var box2 = el('div'); task.appendChild(box2);
        var titles = {}; uniq.forEach(function (id) { titles[id] = (E.graph().T[id] || {}).title; });
        ML.runner(box2, { mode: quiz ? 'quiz' : 'review', items: t.items, titles: titles, autofocus: af, onDone: function () {
          var row = el('div', 'mlp-acts'); row.appendChild(ui.btn('Continue', 'pri', function () { run(); top(); })); box2.appendChild(row);
        } });
      } else if (t.type === 'done') {
        msg('<p class="mlp-bigemoji" aria-hidden="true">🎉</p><p><b>All caught up in ' + esc(c.title) + '.</b> Every topic you can work on right now is passed, and no reviews are due. Come back for your reviews, or see the course on <a href="' + c.url + '">Teddy Rook Book</a>.</p>');
      } else {
        msg('<p>Practice for ' + esc(c.title) + ' isn’t ready yet. See the course on <a href="' + c.url + '">Teddy Rook Book</a>.</p>');
      }
    }
    run();
  }

  if (!topic && !course) { msg('<p><b>Which practice?</b> This embed needs a topic or a course, like <code>?topic=g3.add-within-1000</code> or <code>?course=alg1</code>.</p>'); return; }
  ui.graph().then(function () {
    var G = E.graph();
    if (topic) {
      var T = G.T[topic];
      if (!T || withheld(T.url)) return msg('<p><b>That topic wasn’t found.</b> The id “' + esc(topic) + '” isn’t on Teddy Rook Book.</p>');
      return startTopic(T);
    }
    var c = ui.course(course);
    if (!c || !G.byCourse[course]) return msg('<p><b>That course wasn’t found.</b> “' + esc(course) + '” isn’t a course key on Teddy Rook Book.</p>');
    startCourse(c);
  }, function () {
    task.innerHTML = '<p class="mlp-soon emb-msg">The practice didn’t load. Check the connection and reload the page.</p>';
  });
})(window, document);
