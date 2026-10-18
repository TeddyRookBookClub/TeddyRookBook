/* Test Prep pages: the practice app for a test page (/test-prep/<test>/) and an AP course page (/test-prep/ap/<key>/).
   Reads <script id="tp-data"> (layouts/test-prep/single.html). Built on Math Ladder's public API (runner.js "API FOR OTHER
   SECTIONS"): ML.loadTopics, ML.makeProblem (through TestPrep.build), ML.input, ML.check, ML.problemCard, ML.engine
   .recordResult and .addReview; and on TestPrep (tp-core.js) for sets, multiple choice and results.

   Test page   Versions: a test that changed has a tab for each version (data.versions: the current one first, e.g. the
               digital SAT and the paper SAT); each tab has its own sets, areas and rules. The URL hash (#paper) opens a tab.
               "Timed mixed set": a whole set shown like the real section: a navigator, flags, answers you can change, a
               countdown at each part's own pace (can be hidden, or turned off), parts (the SAT's modules, the paper SAT's
               no-calculator and calculator portions) that close behind you, and everything checked at the end.
               Keys: A–D (A–E with five choices) pick a choice; Enter in a typed answer goes on.
               "Practice by area": 10 questions from one area in the problem card, with feedback and steps after each.
   Grammar     /test-prep/grammar/ (data.kind 'verbal'): grammar and punctuation questions from tp-grammar.js
               (TestPrep.grammar), by rule or in a timed mixed set in a test's style; nothing is recorded.
   AP page     "Practice this unit": 8 mixed questions from the unit's topics in the generators' own answer formats.
   Results     right and wrong by area (or topic), time per question against the pace, every question with its steps
               (misses open), the topics to work on with links, and "Add these topics to my reviews" (ML.engine.addReview).
               With "Count my answers" on (default), each answer also goes to ML.engine.recordResult once, at the end.
   Storage     only through the engine (localStorage 'trb-math-v1'); nothing else is stored (the grammar page stores nothing).                               */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder, TP = W.TestPrep, dataEl = D.getElementById('tp-data'), root = D.getElementById('tp-root');
  if (!ML || !TP || !dataEl || !root) return;
  var data; try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var E = ML.engine, T = data.topics || {};
  var reduced = false; try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function typeset(e) { try { if (ML.typeset) ML.typeset(e); } catch (er) { } }
  function btn(text, cls, fn, attrs) { var b = el('button', 'mlp-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (attrs) for (var k in attrs) b.setAttribute(k, attrs[k]); return b; }
  function now() { return (W.performance && W.performance.now) ? W.performance.now() : Date.now(); }
  function fmt(s) { return TP.fmtTime(s); }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  function focus(e) { if (!e) return; try { e.focus({ preventScroll: true }); } catch (er) { try { e.focus(); } catch (e2) { } } }
  function scrollTo(e) { if (!e) return; try { e.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); } catch (er) { } }
  function title(id) { return (T[id] && T[id].t) || id; }
  function avail(id) { var t = T[id]; return !!t && !!t.g && !!(ML.hasGen && ML.hasGen(id)); }
  var live = el('div', 'tp-sr'); live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status'); root.appendChild(live);
  function say(s) { live.textContent = ''; setTimeout(function () { live.textContent = s; }, 30); }

  /* ---------------------------------------------------------------- loading */
  function allIds() { var out = []; Object.keys(T).forEach(function (id) { if (T[id].g) out.push(id); }); return out; }
  function load(ids) {
    if (ML.loadTopics) return ML.loadTopics(ids);
    var cs = {}; ids.forEach(function (id) { cs[id.split('.')[0]] = 1; });
    return Promise.all(Object.keys(cs).map(function (c) { return ML.loadCourse(c); }));
  }
  var loaded = load(allIds()).then(function () { return true; }, function () { return false; });

  /* ---------------------------------------------------------------- topic chips show progress */
  function paintChips() {
    if (!E || !E.rec) return;
    var chips = root.querySelectorAll('.tp-chip[data-id]');
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i], r = E.rec(c.getAttribute('data-id')), st = r.s === 2 ? 'passed' : r.s === 1 ? 'learning' : '';
      c.classList.toggle('st-passed', st === 'passed'); c.classList.toggle('st-learning', st === 'learning');
      var sr = c.querySelector('[data-st]'); if (sr) sr.textContent = st === 'passed' ? ' (passed)' : st === 'learning' ? ' (learning)' : '';
    }
  }
  paintChips(); if (E && E.on) E.on(paintChips);

  /* ---------------------------------------------------------------- answers: show and check */
  function choiceHtml(text) { return ML.html ? ML.html(text) : esc(text); }
  function letter(i) { return '<span class="tp-letter" aria-hidden="true">' + 'ABCDEFGH'[i] + '</span><span class="tp-sr">' + 'ABCDEFGH'[i] + ': </span>'; }
  function shownAnswer(p, v) {
    if (v === null || v === undefined || v === '' || v === -1) return '<i>no answer</i>';
    if (p.a.t === 'mc' && !Array.isArray(v)) return letter(v) + ' ' + choiceHtml(p.a.choices[v]);
    if (p.a.t === 'mc') return v.map(function (i) { return choiceHtml(p.a.choices[i]); }).join(', ');
    if (p.a.t === 'tf') return v ? 'True' : 'False';
    if (Array.isArray(v)) return esc(v.map(function (x) { return Array.isArray(x) ? '[' + x.join(', ') + ']' : x; }).join('; '));
    try { return ML.plain ? ML.plain(String(v)) : esc(v); } catch (e) { return esc(v); }
  }
  function rightAnswer(p) {
    if (p.a.t === 'mc' && !Array.isArray(p.a.v)) return letter(p.a.v) + ' ' + choiceHtml(p.a.choices[p.a.v]);
    try { return ML.fmtAnswer ? ML.fmtAnswer(p.a) : esc(ML.answerShow(p.a)); } catch (e) { return ''; }
  }
  function isEmpty(v) { return v === null || v === undefined || v === '' || v === -1 || (Array.isArray(v) && !v.length); }
  function grade(p, v) {
    if (isEmpty(v)) return { ok: false, empty: true };
    var r; try { r = ML.check(p.a, v, { q: p.q, unit: p.unit }); } catch (e) { r = { ok: false }; }
    return { ok: !!(r && r.ok && !r.invalid), msg: r && r.msg, invalid: !!(r && r.invalid) };
  }
  function mountViz(host, p) {
    if (!p.viz || !p.viz.name || !ML.viz) return;
    var v = el('div', 'ml-viz'); v.dataset.viz = p.viz.name; v.dataset.opts = JSON.stringify(p.viz.opts || {}); v.setAttribute('aria-label', p.viz.label || 'A picture for this problem');
    host.appendChild(v);
    (ML.needViz ? ML.needViz(p.viz.name) : Promise.resolve()).then(function () { try { ML.viz.mount(v); } catch (e) { } });
  }

  /* ---------------------------------------------------------------- results */
  // items: [{ id, area, p, typed }], res: [{ v, ok, ms, late, empty }]; o: { title, test, byTopic, allowed (s), used (s),
  // pace (s), recorded, again(), againText, done(), doneText }
  function results(host, items, res, o) {
    var sum = TP.summarize(o.test || { areas: [] }, items, res.map(function (r) { return { ok: r.ok, time: (r.ms || 0) / 1000 }; }));
    var answered = res.filter(function (r) { return !r.empty; }).length;
    var box = el('section', 'tp-results'); box.setAttribute('aria-labelledby', 'tp-res-h');
    var pct = sum.total ? Math.round(100 * sum.right / sum.total) : 0;
    box.appendChild(el('header', 'tp-res-head', '<div class="tp-res-ring" aria-hidden="true">' + ring(sum.right, sum.total) + '</div><div><p class="tp-eyebrow2">' + esc(o.title || 'Results') + '</p><h2 id="tp-res-h" tabindex="-1">' + sum.right + ' of ' + sum.total + ' right</h2><p>' + encourage(pct, sum.total - answered) + '</p></div>'));

    // time
    var avg = sum.time.avg, late = res.filter(function (r) { return r.late; }).length;
    var line = '<b>Time:</b> ' + fmt(o.used != null ? o.used : sum.time.total) + (o.allowed ? ' of ' + fmt(o.allowed) : '') + ' · about ' + Math.round(avg) + ' seconds a question' + (o.pace ? ' (the real pace is about ' + Math.round(o.pace) + ')' : '') + '.';
    if (late) line += ' ' + (late === 1 ? 'One answer came after time was up; it is marked below.' : late + ' answers came after time was up; they are marked below.');
    box.appendChild(el('div', 'tp-res-time', '<p>' + line + '</p>' + timeChart(items, res, o.pace)));

    // by area or by topic
    var groups = o.byTopic ? byTopic(items, res) : sum.byArea;
    if (groups.length > 1 || o.byTopic) {
      var ga = el('div', 'tp-res-areas', '<h3>' + (o.rules ? 'By rule' : o.byTopic ? 'By topic' : 'By area') + '</h3>'), ul = el('ul', 'tp-bars');
      groups.forEach(function (g) {
        var w = g.total ? Math.round(100 * g.right / g.total) : 0;
        ul.appendChild(el('li', '', '<span class="tp-bar-name">' + esc(g.title) + '</span><span class="tp-bar" role="img" aria-label="' + g.right + ' of ' + g.total + ' right"><b style="width:' + w + '%"></b></span><span class="tp-bar-n">' + g.right + ' of ' + g.total + '</span>'));
      });
      ga.appendChild(ul); box.appendChild(ga);
    }

    // topics to work on
    var work = el('div', 'tp-res-work');
    if (o.rules && sum.topics.length) {
      work.innerHTML = '<h3>Rules to review</h3><p class="tp-small">From the questions you missed, most missed first. Each link opens the rule on this page.</p>';
      var rl = el('ul', 'tp-worklist');
      sum.topics.forEach(function (t) { var r = o.rules[t.id] || { title: t.id }; rl.appendChild(el('li', '', (r.href ? '<a href="' + esc(r.href) + '">' + esc(r.title) + '</a>' : '<span>' + esc(r.title) + '</span>') + ' <small>missed ' + t.n + '</small>')); });
      work.appendChild(rl);
    } else if (sum.topics.length) {
      var ids = sum.topics.map(function (t) { return t.id; });
      work.innerHTML = '<h3>Topics to work on</h3><p class="tp-small">From the questions you missed, most missed first. Each link opens the lesson.</p>';
      var tl = el('ul', 'tp-worklist');
      sum.topics.forEach(function (t) {
        var info = T[t.id] || {};
        tl.appendChild(el('li', '', (info.u && info.w ? '<a href="' + esc(info.u) + '">' + esc(title(t.id)) + '</a>' : '<span>' + esc(title(t.id)) + '</span> <em class="tp-soon-tag">Being written</em>') + ' <small>' + (info.ct ? esc(info.ct) + ' · ' : '') + 'missed ' + t.n + '</small>'));
      });
      work.appendChild(tl);
      if (E && E.addReview) {
        var msg = el('p', 'tp-small tp-addmsg'); msg.setAttribute('role', 'status');
        var add = btn('Add ' + (ids.length === 1 ? 'this topic' : 'these ' + ids.length + ' topics') + ' to my reviews', 'gold', function () {
          var out; try { out = E.addReview(ids); } catch (e) { out = null; }
          if (!out) { msg.textContent = 'That didn’t work. Your browser may be blocking storage for this site.'; return; }
          add.disabled = true; add.textContent = 'Added to your reviews';
          var parts = [];
          if (out.review.length) parts.push(plural(out.review.length, 'topic') + ' you’ve passed ' + (out.review.length === 1 ? 'is' : 'are') + ' due for review today');
          if (out.learn.length) parts.push(plural(out.learn.length, 'topic') + ' you haven’t passed yet will be taught first');
          msg.innerHTML = 'Done. ' + esc(parts.join('; ')) + '. Start on the <a href="' + esc(practiceUrl(ids)) + '">practice page</a>.';
        });
        var row = el('div', 'mlp-acts'); row.appendChild(add); work.appendChild(row); work.appendChild(msg);
      }
    } else if (sum.total) {
      work.innerHTML = '<h3>Topics to work on</h3><p>None from this set: every question was right. A longer set, or another area, is a good next step.</p>';
    }
    box.appendChild(work);
    if (o.recorded) box.appendChild(el('p', 'tp-small', 'Your answers count toward your Math Ladder reviews and XP. <a href="' + esc(ladderUrl('progress/')) + '">See your progress</a>.'));

    // every question
    var qs = el('div', 'tp-res-qs', '<h3>Every question</h3><p class="tp-small">Misses are open. Tap any question to see its steps.</p>'), ol = el('ol', 'tp-qsum');
    items.forEach(function (it, i) {
      var r = res[i] || {}, p = it.p, li = el('li', r.ok ? 'ok' : 'no'), d = el('details');
      if (!r.ok) d.open = true;
      var area = o.byTopic ? (o.rules && o.rules[it.id] ? o.rules[it.id].title : title(it.id)) : areaTitle(it.area, o.test);
      d.innerHTML = '<summary><span class="tp-qsum-icon" aria-hidden="true">' + (r.ok ? '✓' : r.empty ? '–' : '↺') + '</span><span class="tp-qsum-n">' + (i + 1) + '</span><span class="tp-sr">' + (r.ok ? 'Right' : r.empty ? 'Not answered' : 'Missed') + '. </span><span class="tp-qsum-a">' + esc(area) + '</span>' + (r.late ? '<span class="tp-qsum-late">after time</span>' : '') + '<span class="tp-qsum-t"><span class="tp-sr">Time </span>' + fmt((r.ms || 0) / 1000) + '</span></summary>';
      var body = el('div', 'tp-qsum-body');
      body.appendChild(el('div', 'tp-qsum-q', p.q)); mountViz(body, p);
      if (p.a.t === 'mc' && !Array.isArray(p.a.v)) {
        var cl = el('ol', 'tp-qsum-choices');
        p.a.choices.forEach(function (c, j) { cl.appendChild(el('li', (j === p.a.v ? 'is-right' : '') + (j === r.v && j !== p.a.v ? ' is-yours' : ''), letter(j) + ' ' + choiceHtml(c) + (j === p.a.v ? ' <span class="tp-tag-ok">right answer</span>' : j === r.v ? ' <span class="tp-tag-you">your answer</span>' : ''))); });
        body.appendChild(cl);
        if (r.empty) body.appendChild(el('p', 'tp-qsum-you', '<b>Your answer:</b> <i>no answer</i>'));
      } else {
        body.appendChild(el('p', 'tp-qsum-you', '<b>Your answer:</b> ' + shownAnswer(p, r.v) + (r.ok ? ' <span class="tp-tag-ok">right</span>' : '')));
        if (!r.ok) body.appendChild(el('p', 'tp-qsum-right', '<b>Right answer:</b> ' + rightAnswer(p)));
      }
      body.appendChild(el('p', 'tp-steps-h', 'The steps'));
      body.appendChild(el('ol', 'mlp-steps', (p.steps || []).map(function (s) { return '<li>' + s + '</li>'; }).join('')));
      var info = o.rules ? null : T[it.id];
      if (o.rules && o.rules[it.id] && o.rules[it.id].href) body.appendChild(el('p', 'tp-small tp-qsum-topic', 'Rule: <a href="' + esc(o.rules[it.id].href) + '">' + esc(o.rules[it.id].title) + '</a>'));
      if (info) body.appendChild(el('p', 'tp-small tp-qsum-topic', 'Topic: ' + (info.u && info.w ? '<a href="' + esc(info.u) + '">' + esc(info.t) + '</a>' : esc(info.t)) + (info.ct ? ' · ' + esc(info.ct) : '')));
      d.appendChild(body); li.appendChild(d); ol.appendChild(li);
    });
    qs.appendChild(ol); box.appendChild(qs);

    var acts = el('div', 'mlp-acts tp-res-acts');
    if (o.again) acts.appendChild(btn(o.againText || 'Try another set', 'pri', o.again));
    if (o.done) acts.appendChild(btn(o.doneText || 'Back to the test page', '', o.done));
    box.appendChild(acts);

    host.innerHTML = ''; host.hidden = false; host.appendChild(box); typeset(box);
    setTimeout(function () { scrollTo(box); focus(box.querySelector('#tp-res-h')); }, 30);
    return box;
  }
  function areaTitle(k, test) { var a = ((test && test.areas) || data.areas || []).filter(function (x) { return x.key === k; })[0]; return a ? a.title : k; }
  function byTopic(items, res) {
    var m = {}, order = [];
    items.forEach(function (it, i) { if (!m[it.id]) { m[it.id] = { title: (rulesOf && rulesOf[it.id] && rulesOf[it.id].title) || title(it.id), right: 0, total: 0 }; order.push(it.id); } m[it.id].total++; if (res[i] && res[i].ok) m[it.id].right++; });
    return order.map(function (k) { return m[k]; });
  }
  var rulesOf = null;   // the grammar page's rules: key -> { title, href }
  var SLUG = { math: 'math', physics: 'physics', chemistry: 'chemistry', economics: 'economics', earth: 'earth-and-space' };
  function ladderUrl(path, lad) { var base = String(data.base || '/test-prep/').replace(/test-prep\/?$/, ''); return base + (SLUG[lad || 'math'] || 'math') + '/' + (path || ''); }
  function practiceUrl(ids) { return ladderUrl('practice/', (T[ids[0]] && T[ids[0]].l) || 'math'); }
  function ring(a, n) {
    var r = 26, c = 2 * Math.PI * r, f = n ? a / n : 0;
    return '<svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="' + r + '" class="bg"/><circle cx="32" cy="32" r="' + r + '" class="fg" stroke-dasharray="' + (c * f).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle">' + (n ? Math.round(100 * f) : 0) + '%</text></svg>';
  }
  function encourage(pct, blank) {
    var s = pct >= 90 ? 'Strong work. These topics are in good shape.' : pct >= 70 ? 'Solid. The misses below show exactly what to sharpen.' : pct >= 40 ? 'A good start. Work through the steps for each miss, then the topics below.' : 'Every miss below points to a lesson. Start with the topic you missed most, then come back for a short set.';
    if (blank) s += ' ' + plural(blank, 'question was', 'questions were') + ' left blank.';
    return s;
  }
  function timeChart(items, res, pace) {
    if (items.length < 2) return '';
    var secs = res.map(function (r) { return (r.ms || 0) / 1000; }), max = Math.max(pace || 0, Math.max.apply(null, secs)) * 1.1 || 1;
    var bars = items.map(function (it, i) { var r = res[i] || {}; return '<i class="' + (r.ok ? 'ok' : r.empty ? 'blank' : 'no') + '" style="height:' + Math.max(3, Math.round(100 * secs[i] / max)) + '%" title="Question ' + (i + 1) + ': ' + fmt(secs[i]) + '"></i>'; }).join('');
    return '<div class="tp-tchart" role="img" aria-label="A bar for the time on each question. The list below gives every time.">' + (pace ? '<span class="tp-tchart-pace" style="bottom:' + Math.round(100 * pace / max) + '%"></span>' : '') + bars + '</div><p class="tp-tchart-key" aria-hidden="true"><span><i class="ok"></i> right</span> <span><i class="no"></i> missed</span>' + (pace ? ' <span><i class="pace"></i> the real pace</span>' : '') + '</p>';
  }
  function record(items, res) {
    if (!E || !E.recordResult) return false;
    var n = 0;
    items.forEach(function (it, i) { var r = res[i]; if (!r || r.empty) return; try { E.recordResult(it.id, !!r.ok); n++; } catch (e) { } });
    return n > 0;
  }

  /* ---------------------------------------------------------------- the drill (area practice, AP unit practice) */
  function drill(host, o) {
    // o: { title, kicker, items, test, byTopic, rules, record, tag, onClose, again, againText, doneText }
    host.hidden = false; host.innerHTML = '';
    var wrap = el('div', 'tp-drill');
    var head = el('div', 'tp-drill-head', '<div><p class="tp-eyebrow2">' + esc(o.kicker || 'Practice') + '</p><h2 tabindex="-1">' + esc(o.title) + '</h2></div>');
    var res = [], done = false, items = o.items;
    head.appendChild(btn('End practice', 'ghost small', function () { finish(); }));
    wrap.appendChild(head);
    var cardHost = el('div', 'tp-drill-card'); wrap.appendChild(cardHost); host.appendChild(wrap);
    function close() { host.innerHTML = ''; host.hidden = true; if (o.onClose) o.onClose(); }
    if (!items.length) { cardHost.innerHTML = '<p class="tp-card">No problems could be made for this yet. Its topics are still being written.</p>'; return; }
    function finish() {
      if (done) return; done = true;
      var its = items.slice(0, res.length);
      if (!its.length) { close(); return; }
      var rec = o.record ? record(its, res) : false;
      results(host, its, res, { title: o.title, test: o.test, byTopic: o.byTopic, rules: o.rules, recorded: rec, again: o.again, againText: o.againText, done: close, doneText: o.doneText || 'Close' });
    }
    ML.problemCard(cardHost, {
      items: items.map(function (it) { return { id: it.id, problem: it.p }; }),
      feedback: true, steps: 'after', record: false, tag: o.tag || 'Practice', titles: titlesOf(items), summary: false, autofocus: false,
      onAnswer: function (info) { res.push({ v: info.answer, ok: !!info.ok, ms: info.ms || 0, empty: !!info.skipped }); },
      onDone: function () { finish(); }
    });
    setTimeout(function () { scrollTo(wrap); focus(head.querySelector('h2')); }, 30);
  }
  function titlesOf(items) { var t = {}; items.forEach(function (it) { t[it.id] = title(it.id); }); return t; }

  /* ---------------------------------------------------------------- the timed set */
  function timedSet(host, o) {
    // o: { test, items, parts: [{ name, n, secs, calculator, grid }] (TestPrep.buildSet), limit, showTimer, record, rules,
    //      onClose, again }
    var test = o.test, items = o.items, f = test.format || {};
    var parts = [], start = 0, allowed0 = 0;
    o.parts.forEach(function (q, k) { parts.push({ from: start, to: start + q.n, secs: q.secs, used: 0, over: false, k: k, name: q.name, calc: q.calculator, grid: q.grid }); start += q.n; allowed0 += q.secs; });
    var pace = items.length ? allowed0 / items.length : 0, calcRule = parts.some(function (p) { return p.calc; }) && parts.some(function (p) { return !p.calc; });
    var res = items.map(function () { return { v: null, ok: false, ms: 0, flag: false, late: false, empty: true }; });
    var pi = 0, cur = 0, shownAt = 0, tick = null, partStart = 0, showTimer = o.showTimer, finished = false, warned = false;
    var multi = parts.length > 1, partName = f.part_name || 'Part', pn = partName.toLowerCase();
    function pname(p) { p = p || P(); return p.name || partName + ' ' + (p.k + 1); }

    host.hidden = false; host.innerHTML = '';
    var wrap = el('div', 'tp-set');
    var bar = el('div', 'tp-runbar'), barL = el('div', 'tp-runbar-l'), timer = el('div', 'tp-timer'), barR = el('div', 'tp-runbar-r');
    var tText = el('span', 'tp-timer-t'); tText.setAttribute('role', 'timer'); tText.setAttribute('aria-live', 'off');
    var tBtn = btn('', 'ghost small tp-timer-btn', function () { showTimer = !showTimer; paintTimer(); say(showTimer ? 'Timer shown.' : 'Timer hidden.'); });
    timer.appendChild(el('span', 'tp-timer-icon', '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4l3 2M9 2h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'));
    timer.appendChild(tText); timer.appendChild(tBtn);
    var nav = el('nav', 'tp-nav'); nav.id = 'tp-nav'; nav.setAttribute('aria-label', 'Questions');
    var navBtn = btn('Questions', 'ghost small tp-navtoggle', function () { var open = nav.classList.toggle('open'); navBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) focus(nav.querySelector('[aria-current]') || nav.querySelector('button')); }, { 'aria-expanded': 'false', 'aria-controls': 'tp-nav' });
    var finBtn = btn(multi ? 'Finish<span class="tp-wide"> ' + esc(pn) + '</span>' : 'Finish', 'small tp-finbtn', function () { review(false); });
    barR.appendChild(navBtn); barR.appendChild(finBtn);
    bar.appendChild(barL); bar.appendChild(timer); bar.appendChild(barR); wrap.appendChild(bar);
    var body = el('div', 'tp-runbody'), stage = el('div', 'tp-stage');
    body.appendChild(nav); body.appendChild(stage); wrap.appendChild(body);
    host.appendChild(wrap);
    root.classList.add('is-running');
    W.addEventListener('beforeunload', guard);
    D.addEventListener('keydown', keys);

    function guard(e) { if (finished) return; e.preventDefault(); e.returnValue = ''; return ''; }
    function P() { return parts[pi]; }
    function elapsed() { return P().used + (partStart ? (now() - partStart) / 1000 : 0); }
    function left() { return P().secs - elapsed(); }
    function paintTimer() {
      var p = P(), t = !o.limit ? fmt(elapsed()) : p.over ? 'Time is up' : fmt(Math.max(0, Math.ceil(left())));
      tText.textContent = showTimer ? t : 'Timer hidden';
      tText.setAttribute('aria-label', showTimer ? (o.limit ? (p.over ? 'Time is up' : 'Time left ' + t) : 'Time used ' + t) : 'Timer hidden');
      timer.classList.toggle('is-hidden', !showTimer); timer.classList.toggle('is-low', o.limit && showTimer && !p.over && left() <= 300 && p.secs > 600);
      tBtn.textContent = showTimer ? 'Hide' : 'Show'; tBtn.setAttribute('aria-label', showTimer ? 'Hide the timer' : 'Show the timer');
    }
    function startClock() { partStart = now(); if (tick) clearInterval(tick); tick = setInterval(onTick, 500); paintTimer(); }
    function stopClock() { if (partStart) { P().used += (now() - partStart) / 1000; partStart = 0; } if (tick) { clearInterval(tick); tick = null; } }
    function onTick() {
      paintTimer();
      if (!o.limit || P().over) return;
      var l = left();
      if (!warned && l <= 300 && P().secs > 600) { warned = true; if (showTimer) say('Five minutes left.'); }
      if (l <= 0) { P().over = true; paintTimer(); review(true); }
    }
    function keepTime() { if (shownAt) { res[cur].ms += now() - shownAt; shownAt = now(); } }

    function paintBar() {
      var calc = f.calculator === false || f.hand || calcRule ? '<span class="tp-calc' + (P().calc ? '' : ' is-no') + '">' + (P().calc ? 'Calculator allowed' : 'No calculator') + '</span>' : '';
      barL.innerHTML = '<b>' + esc(test.title) + '</b><span>' + (multi ? esc(pname()) + ' · ' + (pi + 1) + ' of ' + parts.length : plural(items.length, 'question')) + '</span>' + calc;
    }
    function paintNav() {
      var p = P(), h = '<p class="tp-navtitle">' + (multi ? esc(pname()) : 'Questions') + '</p><ol class="tp-navgrid">', answered = 0;
      for (var i = p.from; i < p.to; i++) {
        var r = res[i], cls = (r.empty ? '' : 'is-ans') + (r.flag ? ' is-flag' : '');
        if (!r.empty) answered++;
        h += '<li><button type="button" data-i="' + i + '" class="' + cls + '"' + (i === cur && shownAt ? ' aria-current="step"' : '') + ' aria-label="Question ' + (i + 1 - p.from) + (r.empty ? ', not answered' : ', answered') + (r.flag ? ', flagged' : '') + '">' + (i + 1 - p.from) + '</button></li>';
      }
      h += '</ol><p class="tp-navcount">' + answered + ' of ' + (p.to - p.from) + ' answered</p><p class="tp-navkey" aria-hidden="true"><span><i class="is-ans"></i> answered</span> <span><i class="is-flag"></i> flagged</span></p>';
      nav.innerHTML = h;
      nav.querySelectorAll('button[data-i]').forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-i')); if (nav.classList.contains('open')) { nav.classList.remove('open'); navBtn.setAttribute('aria-expanded', 'false'); } }); });
    }

    function show(i) {
      keepTime();
      cur = i; shownAt = now();
      var p = P(), it = items[i], pr = it.p, r = res[i];
      stage.innerHTML = '';
      var card = el('article', 'tp-qcard'); card.setAttribute('aria-labelledby', 'tp-qh');
      if (p.over && o.limit) card.appendChild(el('p', 'tp-overnote', 'Time is up' + (multi ? ' for this ' + esc(pn) : '') + '. Keep going if you like; answers from here on are marked “after time.”'));
      var qh = el('header', 'tp-qhead', '<h2 id="tp-qh" tabindex="-1">Question ' + (i + 1 - p.from) + ' <small>of ' + (p.to - p.from) + '</small></h2>');
      var flag = btn('', 'ghost small tp-flag', function () { r.flag = !r.flag; paintFlag(); paintNav(); });
      function paintFlag() { flag.classList.toggle('on', r.flag); flag.setAttribute('aria-pressed', r.flag ? 'true' : 'false'); flag.innerHTML = '<span aria-hidden="true">⚑</span> ' + (r.flag ? 'Flagged' : 'Flag for review'); }
      paintFlag(); qh.appendChild(flag); card.appendChild(qh);
      card.appendChild(el('div', 'tp-qtext', pr.q));
      var vz = el('div', 'tp-qviz'); card.appendChild(vz); mountViz(vz, pr);
      if (it.typed) card.appendChild(el('p', 'tp-qdir', p.grid ? 'Type your answer. As on the paper SAT’s answer grid, the answer is zero or positive and fits in four characters: a whole number, a fraction like 3/4, or a decimal like .75.' : 'Type your answer. A fraction like 3/4, a decimal like 0.75, or a negative number like −2 is fine (up to five characters, six with a minus sign).'));
      var ans = el('div', 'tp-qans'); card.appendChild(ans);
      var foot = el('footer', 'tp-qfoot'), saved = el('span', 'tp-saved'); saved.setAttribute('aria-live', 'polite');
      var box; try { box = ML.input(ans, pr.a, { label: 'Your answer to question ' + (i + 1 - p.from), autofocus: false, keypad: it.typed ? 'auto' : false, choiceHtml: choiceHtml }); } catch (e) { box = null; ans.innerHTML = '<p class="tp-small">The answer box didn’t load. Please reload the page.</p>'; }
      if (box) {
        if (!r.empty) try { box.set(r.v); } catch (e) { }
        box.onChange(function (v) { var was = r.empty; r.v = v; r.empty = isEmpty(v); if (!r.empty && p.over && o.limit) r.late = true; if (was !== r.empty) paintNav(); saved.textContent = r.empty ? '' : 'Answer saved'; });
        if (box.onSubmit) box.onSubmit(function () { if (i + 1 < p.to) go(i + 1); else review(false); });
      }
      var back = btn('← Back', 'tp-back', function () { go(i - 1); }); back.disabled = i <= p.from;
      var nxt = i + 1 < p.to ? btn('Next →', 'pri tp-next', function () { go(i + 1); }) : btn('Check your work', 'pri tp-next', function () { review(false); });
      foot.appendChild(back); foot.appendChild(saved); foot.appendChild(nxt); card.appendChild(foot);
      stage.appendChild(card); typeset(card);
      paintNav();
      setTimeout(function () { focus(card.querySelector('#tp-qh')); }, 20);
    }
    function go(i) { var p = P(); if (i < p.from || i >= p.to) return; show(i); }
    function keys(e) {
      if (finished || !stage.querySelector('.tp-qcard')) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (items[cur].p.a.t === 'mc' && /^[a-e]$/i.test(e.key)) {
        var b = stage.querySelectorAll('.ml-choice')['abcde'.indexOf(e.key.toLowerCase())];
        if (b) { e.preventDefault(); b.click(); focus(b); }
      }
    }

    function review(timeUp) {
      keepTime(); shownAt = 0;
      var p = P(), blank = [], flagged = [], last = pi + 1 >= parts.length;
      for (var i = p.from; i < p.to; i++) { if (res[i].empty) blank.push(i); if (res[i].flag) flagged.push(i); }
      stage.innerHTML = '';
      var c = el('section', 'tp-review' + (timeUp ? ' is-timeup' : '')); c.setAttribute('aria-labelledby', 'tp-rvh');
      var h = timeUp ? (multi ? 'Time is up for the ' + esc(pname().toLowerCase()) : 'Time is up') : 'Check your work';
      var lead = timeUp ? 'On test day, ' + (multi ? 'this ' + esc(pn) : 'the section') + ' would end here. You can stop now, or keep working without the clock; answers from here on are marked “after time” in your results.' : (blank.length || flagged.length ? 'Before you finish, take another look at these.' : 'Every question has an answer.');
      c.innerHTML = '<h2 id="tp-rvh" tabindex="-1">' + h + '</h2><p>' + lead + '</p>';
      function list(label, arr) {
        if (!arr.length) return;
        var row = el('div', 'tp-rvrow', '<b>' + label + ':</b> ');
        arr.forEach(function (i) { row.appendChild(btn(String(i + 1 - p.from), 'small ghost', function () { go(i); }, { 'aria-label': label + ': question ' + (i + 1 - p.from) })); });
        c.appendChild(row);
      }
      list('Not answered', blank); list('Flagged', flagged);
      var acts = el('div', 'mlp-acts');
      acts.appendChild(btn(timeUp ? 'Keep going' : 'Back to the questions', '', function () { go(blank.length ? blank[0] : p.from); }));
      acts.appendChild(btn(last ? 'Finish and see results' : 'Go on to the ' + esc(pname(parts[pi + 1]).toLowerCase()), 'pri', function () { if (last) finish(); else nextPart(); }));
      c.appendChild(acts);
      if (!last) c.appendChild(el('p', 'tp-small', 'As on the real test, you can’t come back to this ' + esc(pn) + ' once you go on.'));
      stage.appendChild(c); paintNav();
      setTimeout(function () { focus(c.querySelector('h2')); }, 20);
      if (timeUp) say(h + '.');
    }
    function nextPart() {
      stopClock(); pi++; warned = false;
      stage.innerHTML = '';
      var c = el('section', 'tp-review tp-between');
      var calcNote = calcRule ? (P().calc ? ' You may use a calculator in this ' + esc(pn) + '.' : ' No calculator in this ' + esc(pn) + '.') : '';
      c.innerHTML = '<h2 tabindex="-1">' + esc(pname()) + ' <small>' + (pi + 1) + ' of ' + parts.length + '</small></h2><p>' + plural(P().to - P().from, 'question') + (o.limit ? ', with ' + fmt(P().secs) + ' on the clock' : '') + '.' + calcNote + ' Take a breath and stretch. The clock starts when you do.</p>' + (f.adaptive ? '<p class="tp-small">On the real SAT, the second module is harder or easier depending on how the first went. Ours mixes easy and hard questions in both.</p>' : '');
      var a = el('div', 'mlp-acts'); a.appendChild(btn('Start the ' + esc(pname().toLowerCase()), 'pri big', function () { startClock(); show(P().from); })); c.appendChild(a);
      stage.appendChild(c); paintBar(); paintNav(); paintTimer();
      setTimeout(function () { focus(c.querySelector('h2')); }, 20);
    }
    function finish() {
      keepTime(); stopClock(); finished = true; shownAt = 0;
      W.removeEventListener('beforeunload', guard); D.removeEventListener('keydown', keys);
      root.classList.remove('is-running');
      items.forEach(function (it, i) { var g = grade(it.p, res[i].v); res[i].ok = g.ok; res[i].empty = !!g.empty; });
      var used = parts.reduce(function (s, p) { return s + p.used; }, 0), allowed = o.limit ? parts.reduce(function (s, p) { return s + p.secs; }, 0) : 0;
      var rec = o.record ? record(items, res) : false;
      results(host, items, res, { title: test.title + ' · ' + plural(items.length, 'question'), test: test, used: used, allowed: allowed, pace: pace, recorded: rec, rules: o.rules, byTopic: !!o.rules, again: o.again, done: function () { host.innerHTML = ''; host.hidden = true; if (o.onClose) o.onClose(); } });
    }
    root._tpSet = { finish: finish, res: res, items: items }; // for tests

    paintBar(); startClock(); show(0);
    setTimeout(function () { scrollTo(wrap); }, 30);
  }

  /* ---------------------------------------------------------------- a test page */
  // one version of the test as a test object: the current version takes the top level's format, parts, sets and areas
  function versionTest(v) {
    return { key: data.key + (v.current ? '' : '-' + v.key), title: v.current ? data.title : data.title + ' (' + v.name + ')', test: data.test,
      format: v.format || data.format, parts: v.parts || data.parts, sets: v.sets || data.sets, areas: v.areas || data.areas, levels: data.levels };
  }
  function initTest() {
    var run = D.getElementById('tp-run'), rec = D.getElementById('tp-record'), vers = data.versions && data.versions.length ? data.versions : [{ key: 'current', current: true }];
    var tabs = root.querySelectorAll('.tp-vtab'), panels = root.querySelectorAll('.tp-ver'), cur = null;
    function panelOf(k) { return root.querySelector('.tp-ver[data-ver="' + k + '"]'); }
    function pick(k, fromUser) {
      if (!panelOf(k)) k = vers[0].key;
      cur = k;
      tabs.forEach(function (t) { var on = t.getAttribute('data-ver') === k; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; t.classList.toggle('on', on); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-ver') !== k; });
      if (fromUser) { try { var h = k === vers[0].key ? ' ' : '#' + k; W.history.replaceState(null, '', h === ' ' ? W.location.pathname + W.location.search : h); } catch (e) { } }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(t.getAttribute('data-ver'), true); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, j = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
        if (j >= 0) { e.preventDefault(); pick(tabs[j].getAttribute('data-ver'), true); focus(tabs[j]); }
      });
    });
    var hash = (W.location.hash || '').replace(/^#/, '');
    pick(hash && panelOf(hash) ? hash : vers[0].key, false);
    if (hash && panelOf(hash)) setTimeout(function () { scrollTo(root.querySelector('.tp-vtabs') || panelOf(hash)); }, 60);
    W.addEventListener('hashchange', function () { var h = (W.location.hash || '').replace(/^#/, ''); if (h && panelOf(h)) pick(h, false); });
    var shell = D.getElementById('tp-setup');
    function back(btnEl) { run.innerHTML = ''; run.hidden = true; shell.hidden = false; root.classList.remove('is-running'); scrollTo(shell); focus(btnEl); }
    vers.forEach(function (v) {
      var panel = panelOf(v.key); if (!panel) return;
      var test = versionTest(v), start = panel.querySelector('.tp-start');
      function areaOf(k) { return (test.areas || []).filter(function (a) { return a.key === k; })[0]; }
      loaded.then(function (ok) {
        start.disabled = false;
        panel.querySelectorAll('.tp-area-btn').forEach(function (b) { var a = areaOf(b.getAttribute('data-area')), n = a ? a.topics.filter(avail).length : 0; b.disabled = !n; if (!n) b.title = 'Its topics are still being written'; });
        if (!ok && panel === panels[0]) shell.insertBefore(el('p', 'tp-card tp-warn', 'Some practice files didn’t load. Check your connection and reload the page.'), shell.firstChild);
      });
      start.addEventListener('click', function () {
        var pickEl = panel.querySelector('input.tp-size-in:checked'), si = pickEl ? +pickEl.value : test.sets.length - 1, st = test.sets[si] || test.sets[test.sets.length - 1];
        var lim = panel.querySelector('.tp-limit'), shw = panel.querySelector('.tp-timer-on');
        start.disabled = true; start.textContent = 'Making your set…';
        setTimeout(function () {
          var set = TP.buildSet(test, st.parts, Date.now() % 1e9, { avail: avail });
          start.disabled = false; start.textContent = 'Start the set';
          if (!set.items.length) { say('No problems could be made yet.'); return; }
          shell.hidden = true;
          timedSet(run, { test: test, items: set.items, parts: set.parts, limit: !lim || lim.checked, showTimer: !shw || shw.checked, record: !rec || rec.checked, onClose: function () { back(start); }, again: function () { back(start); } });
        }, 30);
      });
      panel.querySelectorAll('.tp-area-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          var a = areaOf(b.getAttribute('data-area')); if (!a) return;
          (function go() {
            var set = TP.build(test, 10, Date.now() % 1e9, { area: a.key, avail: avail });
            shell.hidden = true;
            drill(run, { title: a.title, kicker: test.title + ' · practice by area', items: set.items, test: test, byTopic: true, record: !rec || rec.checked, tag: test.test, onClose: function () { back(b); }, again: go, againText: 'Ten more from this area', doneText: 'Back to the test page' });
          })();
        });
      });
    });
  }

  /* ---------------------------------------------------------------- an AP course page */
  function initAP() {
    var test = { key: 'ap-' + data.key, title: data.title, format: { choices: 4 }, levels: [1, 2, 3], areas: [] };
    (data.units || []).forEach(function (u) { test.areas.push({ key: 'u' + u.num, title: 'Unit ' + u.num + ': ' + u.title, share: 1, topics: u.topics || [], levels: [1, 2, 3] }); });
    loaded.then(function () {
      root.querySelectorAll('button[data-unit]').forEach(function (b) {
        var num = b.getAttribute('data-unit'), a = test.areas.filter(function (x) { return x.key === 'u' + num; })[0], n = a ? a.topics.filter(avail).length : 0;
        var host = root.querySelector('[data-run="' + num + '"]'), acts = b.parentNode;
        b.disabled = !n;
        if (!n) { b.title = 'Its topics are still being written'; return; }
        function go() {
          var set = TP.build(test, 8, Date.now() % 1e9, { area: a.key, avail: avail, native: true });
          acts.hidden = true;
          var rec = D.getElementById('tp-record');
          drill(host, { title: a.title, kicker: data.title + ' · practice this unit', items: set.items, test: test, byTopic: true, record: !rec || rec.checked, tag: 'Unit ' + num,
            onClose: function () { acts.hidden = false; focus(b); }, again: go, againText: 'Eight more from this unit', doneText: 'Close' });
        }
        b.addEventListener('click', go);
      });
    });
  }

  /* ---------------------------------------------------------------- the grammar page */
  function initVerbal() {
    var G = TP.grammar; if (!G) return;
    var run = D.getElementById('tp-run'), shell = D.getElementById('tp-setup'), start = shell.querySelector('.tp-start'), styles = data.styles || [];
    var rules = {}; G.RULES.forEach(function (r) { rules[r.key] = { title: r.title, href: '#rule-' + r.key }; });
    rulesOf = rules;
    var test = { key: 'grammar', title: 'Grammar', areas: G.DOMAINS.map(function (d) { return { key: d.key, title: d.title }; }), format: { choices: 4 } };
    function style() { var i = shell.querySelector('input.tp-style-in:checked'), k = i ? i.value : 'sat'; return styles.filter(function (s) { return s.key === k; })[0] || styles[0] || { key: 'sat', fmt: 'sat', pace: 71, label: 'SAT style' }; }
    // the rules, grouped, with an example each
    var list = D.getElementById('tp-rulelist'), hostRules = D.getElementById('tp-grules');
    list.innerHTML = ''; hostRules.innerHTML = '';
    G.DOMAINS.forEach(function (d) {
      var mine = G.RULES.filter(function (r) { return r.domain === d.key; });
      var sec = el('section', 'tp-rulegroup'); sec.appendChild(el('h3', '', esc(d.title)));
      var grp = el('div', 'tp-grulegroup', '<p class="tp-grule-d">' + esc(d.title) + '</p>'), ul = el('ul', 'tp-areas');
      mine.forEach(function (r) {
        var art = el('article', 'tp-rule', '<h4 id="rule-' + r.key + '" tabindex="-1">' + esc(r.title) + '</h4><p>' + r.rule + '</p><p class="tp-rule-ex"><span>Example</span> ' + r.example + '</p>');
        sec.appendChild(art);
        var li = el('li'), b = el('button', 'tp-area-btn', '<span class="tp-area-name"><b>' + esc(r.title) + '</b></span><span class="tp-area-go" aria-hidden="true">→</span>');
        b.type = 'button'; b.setAttribute('data-rule', r.key);
        b.addEventListener('click', function () {
          (function go() {
            var st = style(), set = G.build(8, Date.now() % 1e9, st.fmt, r.key);
            shell.hidden = true;
            drill(run, { title: r.title, kicker: 'Grammar · ' + st.label, items: set.items, test: test, byTopic: true, rules: rules, record: false, tag: st.label, onClose: function () { back(b); }, again: go, againText: 'Eight more on this rule', doneText: 'Back to grammar practice' });
          })();
        });
        li.appendChild(b); ul.appendChild(li);
      });
      grp.appendChild(ul); hostRules.appendChild(grp); list.appendChild(sec);
    });
    function back(btnEl) { run.innerHTML = ''; run.hidden = true; shell.hidden = false; root.classList.remove('is-running'); scrollTo(shell); focus(btnEl); }
    function paintPace() {
      var st = style(), p = shell.querySelector('[data-pace]'); if (p) p.textContent = st.pace_note || '';
      shell.querySelectorAll('.tp-gmins').forEach(function (m) { var sec = Math.round(st.pace * +m.getAttribute('data-n')), mm = Math.floor(sec / 60), ss = sec % 60; m.textContent = ss ? mm + ' min ' + ss + ' s' : mm + ' minutes'; });
    }
    shell.querySelectorAll('input.tp-style-in').forEach(function (i) { i.addEventListener('change', paintPace); });
    paintPace();
    loaded.then(function () { start.disabled = false; });
    start.addEventListener('click', function () {
      var st = style(), n = +((shell.querySelector('input.tp-size-in:checked') || {}).value || 10);
      var set = G.build(n, Date.now() % 1e9, st.fmt), lim = shell.querySelector('.tp-limit'), shw = shell.querySelector('.tp-timer-on');
      shell.hidden = true;
      var t = { key: 'grammar-' + st.key, title: 'Grammar · ' + st.label, areas: test.areas, format: { choices: 4 } };
      timedSet(run, { test: t, items: set.items, parts: [{ name: 'Grammar', n: set.items.length, secs: Math.round(st.pace * set.items.length), calculator: true }], limit: !lim || lim.checked, showTimer: !shw || shw.checked, record: false, rules: rules, onClose: function () { back(start); }, again: function () { back(start); } });
    });
    // a link to a rule from the results opens it
    root.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href^="#rule-"]'); if (!a) return; var h = D.getElementById(a.getAttribute('href').slice(1)); if (h) { e.preventDefault(); scrollTo(h); focus(h); } });
  }

  if (data.kind === 'test') initTest(); else if (data.kind === 'verbal') initVerbal(); else initAP();
})(window, document);
