/* Math Ladder: the problem card used everywhere (window.MathLadder.runner), plus lesson behaviors and on-demand loading.

   ML.runner(container, opts) → { el, next(), destroy() }     builds a card inside container
     opts.mode   'learn'  one topic (opts.topic) with the climb rule and its progress dots; hints allowed; after a pass or a pause
                          it shows what happened and offers what next (opts.nextTopic = { title, url }, opts.onPause(info))
                 'review' a mixed review set: opts.items = [{ id, k }] from ML.engine.reviewSet(); feedback after every answer
                 'quiz'   a checkpoint: opts.items = [ids]; no hints and no feedback until the end, then every answer with its steps
                 'place'  placement: opts.session = ML.engine.placement(…); "I haven't learned this"; no feedback; a progress bar
                 'try'    one inline problem in a lesson (opts.topic); "Show the steps"; "Another one"; not recorded
     opts.onDone(summary)   summary = { mode, right, total, passed?, paused?, xp, log: [{ id, ok }] }
     opts.onAnswer(info)    after each answer: { id, ok, xp, res }
     opts.titles            { id: title } for showing which topic a mixed problem came from (after answering)
     opts.level             force a generator level (1 | 2 | 3)
   The card renders q with ML.typeset, an optional visual (p.viz) with ML.viz.mount, the answer box with ML.input, checks
   with ML.check, and records with ML.engine. Enter checks; Enter again goes on. Results are announced (aria-live).

   ML.loadCourse(key)  → Promise(true | false): loads static/<ladder>/gen/<key>.js, <ladder>/viz/<key>.js and the course's
                         visuals kit once, for a course of ANY ladder, using the list of files that exist (embedded at build
                         time in <script id="ml-cfg">: each course has `dir`, the static folder of its ladder).
   ML.needViz(name)    → Promise: makes sure the visual `name` is registered (loads math's viz/basic.js or viz/adv.js, or a
                         ladder's kit for names prefixed ph-, ch-, ec-, es-, lg-, eg-, sc-: static/<ladder>/viz/<ladder>.js and .css).
   ML.lessonUI(root)   worked examples revealed one step at a time, inline "try" problems, math and visuals in a lesson.
   ML.fmtAnswer(spec)  the correct answer of an answer spec as HTML (math typeset after insertion).

   API FOR OTHER SECTIONS (Test Prep and others; stable: these names and options will keep working)
   A page outside the ladders gets the config and the styles from the shared inline partials:
     {{ partial "inline/ml-head.html" . }}  and  {{ partial "inline/ml-cfg.html" "testprep" }}   then the scripts, in order:
     homeschool/calc/cas.js, math/core/gen.js, tex.js, check.js, input.js, engine.js, runner.js, math/viz/core.js
     (each with {{ partial "inline/ml-js.html" "math/core/engine.js" }} and so on). The graph of every ladder is at
     ML.cfg.graph (ML.engine.loadGraph() fetches it; ML.engine.graph().T[id] has each topic's title, url, course, prereqs).
   ML.loadCourse(key)                 → Promise(true|false)  a course's generators and visuals (any ladder)
   ML.loadTopics(ids)                 → Promise(true)  loads the generators of every course these topic ids belong to
   ML.hasGen(id)                      → is there a generator for this topic (after its course is loaded)
   ML.problem(id, { level, seed, mode }) → a problem { q, a, steps, hint?, viz?, unit?, id, seed, level } or null
                                        level 1 | 2 | 3 (default 2); seed: any number or string (same seed → same problem;
                                        default random); mode 'quiz' (default) | 'learn' | 'review' | 'place'. Retries a few
                                        seeds if a generator throws; null when the topic has no generator. Without a seed
                                        it avoids the learner's recent problems (ML.recent in gen.js; fresh: false turns
                                        that off). Every card the runner makes avoids them too.
   ML.makeProblem(id, seed, ctx)      the raw registry call (gen.js); throws on a malformed problem
   ML.check(spec, answer, { q, unit }) → { ok, msg?, invalid? }   (check.js)
   ML.problemCard(host, opts)         → { el, next(), destroy(), log }   a problem card (the same card the ladders use):
     opts.items     [{ id, level?, seed?, problem? }] (or topic ids): one problem each, in order. `problem` shows a ready-made
                    problem object instead of generating one (e.g. your own multiple-choice version of a generated problem).
     opts.level     default level (2)          opts.hints  true: offer the problem's hint (default false)
     opts.feedback  true (default): right or wrong after each answer;  false: "Answer saved." and nothing else until the end
     opts.steps     'after' (default with feedback: shown after a miss, "See the steps" after a right answer) |
                    'end' (default without feedback: every problem with its steps in a summary at the end) | 'never'
     opts.record    false (default): the ladders' progress is not touched | 'result': each answer goes to
                    ML.engine.recordResult(id, ok) (counted like a review answer) | 'review': ML.engine.reviewAnswer
     opts.skip      true: a "Skip" button (a skip counts as a miss, with skipped: true)
     opts.tag       a label in the card's corner (default "Practice")      opts.showTitle  show the topic's title on top
     opts.onAnswer(info)  after each answer: { id, ok, skipped, ms (time on this problem), answer, problem, res (the check
                    result), index, xp }
     opts.onDone(summary) { right, total, xp, ms, log: [{ id, ok, skipped, ms, p, ans }] }   opts.summary false: no summary card
   ML.engine.recordResult(id, ok, { xp })   count an answer given outside the ladders (engine.js header)
   ML.engine.addReview(ids)           → { review, learn }: passed topics come up for review today; the others are taught
                                        first on their ladder's practice page                                            */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  function cfg() {
    if (!ML.cfg) { try { ML.cfg = JSON.parse(D.getElementById('ml-cfg').textContent); } catch (e) { ML.cfg = { base: '/math/', gen: {}, viz: {}, vb: {}, courses: [] }; } }
    return ML.cfg;
  }
  function root() { var c = cfg(); return c.root || String(c.base || '/math/').replace(/[^\/]+\/?$/, ''); } // the site root ("/")
  function courseOf(key) { return (cfg().courses || []).filter(function (x) { return x.key === key; })[0]; }
  function dirOf(key) { var c = courseOf(key); return (c && c.dir) || 'math'; }
  var reduced = false; try { reduced = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function typeset(e) { try { if (ML.typeset) ML.typeset(e); } catch (er) { } }
  function btn(text, cls, fn) { var b = el('button', 'mlp-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }

  /* ---------------- loading scripts on demand ---------------- */
  var loads = {};
  function loadFile(path, v, css) { // path from the site root: "math/gen/alg1.js", "physics/viz/physics.js"
    var k = path; if (loads[k]) return loads[k];
    var full = root() + path, url = full + (v ? '?v=' + v : '');
    if (css) { if (!D.querySelector('link[href^="' + full + '"]')) { var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = url; D.head.appendChild(l); } return (loads[k] = Promise.resolve(true)); }
    if (D.querySelector('script[src^="' + full + '"]')) {
      // already on the page (maybe still loading): wait for it if needed
      var s0 = D.querySelector('script[src^="' + full + '"]');
      return (loads[k] = new Promise(function (res) { if (D.readyState === 'complete' || s0.dataset.done) res(true); else { s0.addEventListener('load', function () { res(true); }); s0.addEventListener('error', function () { res(false); }); W.addEventListener('load', function () { res(true); }); } }));
    }
    return (loads[k] = new Promise(function (res) {
      var s = D.createElement('script'); s.src = url; s.async = false;
      s.onload = function () { s.dataset.done = '1'; res(true); }; s.onerror = function () { res(false); };
      D.head.appendChild(s);
    }));
  }
  var BASIC = 'tenframe counters numberline hundredchart base10 placevalue numberbond arraygrid areamodel fractionbar fractioncircle fractionline decimalgrid percentbar ratiotable tapediagram clock coins balance integerline shapes geoboard angle transform pythagoras circlepi areaformulas volume nets dotplot boxplot'.split(' ');
  var ADV = 'graph slope linesystem parabola transformfn exponential logscale unitcircle trigwave polar complexplane sequence limit secant derivgraph riemann ftc solids taylor seriespartial vectors2d vectors3d surface gradient vectorfield lineintegral flux param3d matrix2d span slopefield phaseplane springmass dice normal sampling scatter venn tree'.split(' ');
  // visuals kits: math's basic and adv (static/math/viz/), and one per ladder (static/<dir>/viz/<dir>.js, names prefixed)
  var KIT_PREFIX = { 'ph-': 'physics', 'ch-': 'chemistry', 'ec-': 'economics', 'es-': 'earth', 'lg-': 'logic', 'eg-': 'egypt', 'sc-': 'scripts' };
  function vizFile(which) {
    var vb = cfg().vb || {}, dir = which === 'basic' || which === 'adv' ? 'math' : which;
    if (!vb[which] && !D.querySelector('script[src*="' + dir + '/viz/' + which + '.js"]')) return Promise.resolve(false);
    if (vb[which + '.css']) loadFile(dir + '/viz/' + which + '.css', vb[which + '.css'], true);
    return loadFile(dir + '/viz/' + which + '.js', vb[which]);
  }
  ML.needViz = function (name) {
    if (!ML.viz || (ML.viz.names && ML.viz.names().indexOf(name) >= 0)) return Promise.resolve(true);
    if (BASIC.indexOf(name) >= 0) return vizFile('basic');
    if (ADV.indexOf(name) >= 0) return vizFile('adv');
    var kit = KIT_PREFIX[String(name).slice(0, 3)]; if (kit) return vizFile(kit);
    return Promise.resolve(false);
  };
  ML.loadCourse = function (key) {
    var c = cfg(), course = courseOf(key), dir = dirOf(key), jobs = [];
    if (course && course.viz) jobs.push(vizFile(course.viz));
    if (c.viz && c.viz[key]) jobs.push(loadFile(dir + '/viz/' + key + '.js', c.viz[key]));
    var g = c.gen && c.gen[key] ? loadFile(dir + '/gen/' + key + '.js', c.gen[key]) : Promise.resolve(false);
    return Promise.all(jobs.concat([g])).then(function (r) { return r[r.length - 1]; });
  };
  ML.loadTopics = function (ids) {
    var ks = []; (ids || []).forEach(function (id) { var k = String(id).split('.')[0]; if (ks.indexOf(k) < 0) ks.push(k); });
    return Promise.all(ks.map(function (k) { return ML.loadCourse(k); })).then(function () { return true; });
  };
  ML.problem = function (id, o) {
    o = o || {};
    if (!hasGen(id)) return null;
    var given = !(o.seed === undefined || o.seed === null), seed = given ? o.seed : Math.floor(Math.random() * 1e9);
    function one(sd) {
      for (var t = 0; t < 4; t++) {
        try { return ML.makeProblem(id, t ? String(sd) + '~' + t : sd, { level: o.level || 2, mode: o.mode || 'quiz' }); }
        catch (e) { if (W.console) W.console.warn(e); }
      }
      return null;
    }
    // a given seed always makes the same problem; without one, skip the problems this learner saw recently
    if (given || o.fresh === false || !ML.recent) return one(seed);
    return ML.recent.pick(id, function (k) { return one(k ? seed + k * 7919 : seed); });
  };
  ML.problemCard = function (host, o) { return ML.runner(host, Object.assign({}, o || {}, { mode: 'card' })); };
  function hasGen(id) { try { return ML.hasGen ? ML.hasGen(id) : false; } catch (e) { return false; } }

  /* ---------------- formatting an answer ---------------- */
  function plain(v) { v = String(v); try { if (ML.plain) return ML.plain(v); } catch (e) { } return esc(v); }
  function fmtAnswer(a) {
    if (!a) return '';
    try {
      if (ML.answerShow && a.t !== 'mc' && a.t !== 'multi') return esc(ML.answerShow(a));
      switch (a.t) {
        case 'num': case 'expr': case 'eq': case 'ineq': return plain(a.v);
        case 'set': if (a.v === 'all') return 'All real numbers'; if (!a.v.length) return 'No solution'; return a.v.map(plain).join(', ');
        case 'tuple': return '(' + a.v.map(plain).join(', ') + ')';
        case 'matrix': if (ML.tex && ML.plainToTex) return ML.tex('\\begin{bmatrix}' + a.v.map(function (r) { return r.map(function (x) { try { return ML.plainToTex(String(x)); } catch (e) { return String(x); } }).join(' & '); }).join(' \\\\ ') + '\\end{bmatrix}'); return a.v.map(function (r) { return '[' + r.join(', ') + ']'; }).join(' ');
        case 'interval': return esc(String(a.v).replace(/-inf/g, '−∞').replace(/inf/g, '∞').replace(/\bU\b/g, '∪'));
        case 'mc': var cs = a.choices || []; return (Array.isArray(a.v) ? a.v : [a.v]).map(function (i) { return '<span class="mlp-ans-choice">' + cs[i] + '</span>'; }).join(', ');
        case 'tf': return a.v ? 'True' : 'False';
        case 'text': return esc(Array.isArray(a.v) ? a.v[0] : a.v);
        case 'multi': return a.parts.map(function (p) { return '<span class="mlp-ans-part">' + (p.label ? p.label + ' ' : '') + fmtAnswer(p.a) + '</span>'; }).join('<span class="mlp-ans-sep">; </span>');
      }
    } catch (e) { }
    return esc(a.v);
  }
  ML.fmtAnswer = fmtAnswer;

  /* ---------------- encouraging words ---------------- */
  var RIGHT = ['Right!', 'Yes, that’s it.', 'Correct.', 'Nice work.', 'Exactly right.', 'Well done.'];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------------- the card ---------------- */
  ML.runner = function (host, o) {
    o = o || {};
    var E = ML.engine, mode = o.mode || 'learn', items = (o.items || []).slice(), idx = 0, done = false;
    var card0 = mode === 'card', fbOn = !card0 || o.feedback !== false, stepsMode = card0 ? (o.steps || (fbOn ? 'after' : 'end')) : null, t0 = 0;
    var card = el('div', 'mlp-card mlp-card-' + mode), p = null, box = null, answered = false, hinted = false, curId = null, seedBase = Math.floor(Math.random() * 1e9);
    var log = [], right = 0, xpSum = 0, sat = 0, shown = 0;
    card.setAttribute('role', 'group'); card.setAttribute('aria-label', mode === 'place' ? 'Placement question' : mode === 'quiz' ? 'Checkpoint problem' : mode === 'try' ? 'Try one' : 'Practice problem');
    if (card0) card.className = 'mlp-card mlp-card-review mlp-card-card';
    var top = el('div', 'mlp-card-top'), meta = el('div', 'mlp-card-meta'), prog = el('div', 'mlp-card-prog'), xpEl = el('span', 'mlp-xp-float');
    top.appendChild(meta); top.appendChild(prog);
    var body = el('div', 'mlp-card-body'), qEl = el('div', 'mlp-q'), vizHost = el('div', 'mlp-qviz'), ansEl = el('div', 'mlp-ans');
    var hintEl = el('div', 'mlp-hint'); hintEl.hidden = true;
    var acts = el('div', 'mlp-acts'), fb = el('div', 'mlp-fb'), steps = el('div', 'mlp-steps-wrap'), after = el('div', 'mlp-after');
    fb.setAttribute('aria-live', 'polite'); fb.setAttribute('role', 'status');
    body.appendChild(qEl); body.appendChild(vizHost); body.appendChild(ansEl); body.appendChild(hintEl); body.appendChild(acts); body.appendChild(fb); body.appendChild(steps); body.appendChild(after);
    card.appendChild(top); card.appendChild(body); xpEl.setAttribute('aria-hidden', 'true');
    // "Report a problem" (static/js/report.js; the row stays hidden by CSS on pages without it): this problem's details
    var rep = el('div', 'mlp-report-row'), bRep = btn('Report a problem', '', function () {
      var R = W.TRB && W.TRB.report; if (R && R.open && p) R.open({ kind: 'Practice problem', problem: reportInfo() });
    });
    bRep.className = 'trb-report'; bRep.setAttribute('aria-label', 'Report a problem with this question'); rep.appendChild(bRep); card.appendChild(rep);
    host.innerHTML = ''; host.appendChild(card);

    var bCheck = btn('Check', 'pri', check), bHint = btn('Show a hint', 'ghost', showHint), bSkip = btn(card0 ? 'Skip' : 'I haven’t learned this', 'ghost', function () { if (!answered) record(false, true); });
    var bSteps = btn('Show the steps', 'ghost', function () { showSteps(); bSteps.hidden = true; });
    var bNext = btn('Next', 'pri', function () { next(); });

    function topicTitle(id) { return (o.titles && o.titles[id]) || (E && E.graph().T[id] && E.graph().T[id].title) || ''; }
    function levelFor(id) {
      if (o.level) return o.level;
      if (mode === 'learn') { var c = E ? E.climb(id) : { p: 0 }; return c.p >= 2 ? 2 : 1; }
      if (mode === 'review') { var r = E ? E.rec(id) : { iv: 0 }; return r.iv >= 3 ? 3 : 2; }
      if (mode === 'try') return 1;
      if (card0) { var it = items[idx]; return (it && it.level) || o.level || 2; }
      return 2;
    }
    function make(id) {
      if (card0) {
        var it = items[idx] || {};
        if (it.problem) return it.problem;
        if (!hasGen(id)) return null;
        return ML.problem(id, { level: levelFor(id), seed: it.seed, mode: o.genMode || 'quiz' });
      }
      if (!hasGen(id)) return null;
      var lv = levelFor(id), md = mode === 'try' ? 'learn' : mode;
      function one() {
        for (var t = 0; t < 4; t++) {
          try { return ML.makeProblem(id, seedBase + (sat++) * 7919 + t, { level: lv, mode: md }); }
          catch (e) { if (W.console) W.console.warn(e); }
        }
        return null;
      }
      // not one the learner saw recently (ML.recent, gen.js): redraws, then the least recently seen
      return ML.recent ? ML.recent.pick(id, one) : one();
    }

    function paintProgress() {
      if (mode === 'learn' && E) {
        var c = E.climb(o.topic), filled = 3 - Math.min(3, c.need), dots = '';
        for (var i = 0; i < 3; i++) dots += '<i class="' + (i < filled ? 'on' : '') + '"></i>';
        var txt = c.passed ? 'Passed' : c.need >= 3 ? 'Get 3 right, the last 2 in a row' : c.need === 2 ? (c.p >= 1 ? '2 right in a row to pass' : '2 more right to pass') : '1 more right to pass';
        prog.innerHTML = '<span class="mlp-dots" role="img" aria-label="Progress: ' + filled + ' of 3">' + dots + '</span><span class="mlp-dots-t">' + txt + '</span>';
      } else if (mode === 'review' || mode === 'quiz' || (card0 && o.progress !== false && items.length > 1)) {
        var n = items.length, segs = '';
        for (var j = 0; j < n; j++) segs += '<i class="' + (j < idx ? 'on' : j === idx ? 'cur' : '') + '"></i>';
        prog.innerHTML = '<span class="mlp-segs" aria-hidden="true">' + segs + '</span><span class="mlp-dots-t">Problem ' + Math.min(idx + 1, n) + ' of ' + n + '</span>';
      } else if (mode === 'place' && o.session) {
        var pr = o.session.progress();
        prog.innerHTML = '<span class="mlp-pbar" role="progressbar" aria-label="Placement progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(100 * pr.frac) + '"><b style="width:' + Math.round(100 * pr.frac) + '%"></b></span><span class="mlp-dots-t">Question ' + (pr.asked + 1) + '</span>';
      } else prog.innerHTML = '';
    }
    function setMeta() {
      if (mode === 'learn') meta.innerHTML = o.showTitle ? '<b>' + esc(topicTitle(o.topic)) + '</b>' : '';
      else if (mode === 'review') meta.innerHTML = '<span class="mlp-tag">Review</span>';
      else if (mode === 'quiz') meta.innerHTML = '<span class="mlp-tag gold">Checkpoint</span>';
      else if (mode === 'place') meta.innerHTML = '<span class="mlp-tag">Find your rung</span>';
      else if (card0) meta.innerHTML = o.showTitle ? '<b>' + esc(topicTitle(curId)) + '</b>' : '<span class="mlp-tag">' + esc(o.tag || 'Practice') + '</span>';
      else meta.innerHTML = '<span class="mlp-tag">Try one</span>';
    }

    function render(id) {
      curId = id; answered = false; hinted = false; p = make(id); card.mlpProblem = p; // (tests read the problem here)
      rep.style.display = p ? '' : 'none';
      qEl.innerHTML = ''; vizHost.innerHTML = ''; ansEl.innerHTML = ''; acts.innerHTML = ''; fb.innerHTML = ''; fb.className = 'mlp-fb'; steps.innerHTML = ''; after.innerHTML = ''; hintEl.hidden = true; hintEl.innerHTML = '';
      card.classList.remove('is-right', 'is-wrong');
      setMeta(); paintProgress();
      if (!p) {
        if (mode === 'review' || mode === 'quiz' || card0) { idx++; return next(true); }
        if (mode === 'place') { if (o.session) o.session.skip(id); return next(true); }
        qEl.innerHTML = '<p class="mlp-soon-p"><b>Practice coming soon.</b> Problems for this topic are still being written and checked.</p>';
        return;
      }
      qEl.innerHTML = p.q; typeset(qEl);
      if (p.viz && p.viz.name && ML.viz) {
        var v = el('div', 'ml-viz'); v.dataset.viz = p.viz.name; v.dataset.opts = JSON.stringify(p.viz.opts || {}); v.setAttribute('aria-label', p.viz.label || 'A picture for this problem');
        vizHost.appendChild(v); ML.needViz(p.viz.name).then(function () { try { ML.viz.mount(v); } catch (e) { } });
      }
      try { box = ML.input ? ML.input(ansEl, p.a, { unit: p.unit, label: mode === 'place' ? 'Your answer (or choose “I haven’t learned this”)' : 'Your answer', autofocus: false, keypad: mode === 'try' ? false : 'auto' }) : null; } catch (e) { if (W.console) W.console.error(e); box = null; }
      card.mlpBox = box;
      if (!box) ansEl.innerHTML = '<p class="mlp-small">The answer box didn’t load. Please reload the page.</p>';
      acts.appendChild(bCheck); bCheck.disabled = false;
      if ((mode === 'learn' || (card0 && o.hints)) && p.hint) { acts.appendChild(bHint); bHint.disabled = false; }
      if (mode === 'place' || (card0 && o.skip)) acts.appendChild(bSkip), bSkip.disabled = false;
      if (mode === 'try') { bSteps.hidden = false; acts.appendChild(bSteps); }
      if ((o.autofocus !== false || shown > 0) && box && box.focus) setTimeout(function () { try { if (!isOffscreen()) box.focus(); } catch (e) { } }, 30);
      shown++; t0 = Date.now();
    }
    function txt(h) { try { return (new DOMParser().parseFromString(String(h == null ? '' : h), 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim(); } catch (e) { return String(h || ''); } }
    function reportInfo() { // only the problem itself: no names, no progress (report.js reads only these fields too)
      var L = answered ? log[log.length - 1] : null, show = answered && fbOn && mode !== 'quiz' && mode !== 'place';
      return { topic: curId, topicTitle: topicTitle(curId), level: p.level, seed: p.seed, mode: card0 ? (o.genMode || 'quiz') : mode === 'try' ? 'learn' : mode,
        question: txt(p.q), answered: !!L, given: L ? (L.skipped ? 'skipped' : txt(yours(L))) : '', expected: show ? txt(fmtAnswer(p.a)) : '' };
    }
    function isOffscreen() { var r = card.getBoundingClientRect(); return r.top > W.innerHeight || r.bottom < 0; }
    function showHint() { if (!p || !p.hint || answered) return; hinted = true; hintEl.hidden = false; hintEl.innerHTML = '<b>Hint.</b> ' + p.hint; typeset(hintEl); bHint.disabled = true; }
    function getAnswer() {
      if (!box) return null;
      try { if (box.isEmpty && box.isEmpty()) return null; return box.value(); } catch (e) { return null; }
    }
    function check() {
      if (answered || !p) return;
      var a = getAnswer();
      if (a === null || a === undefined || a === '') { fb.className = 'mlp-fb nudge'; fb.textContent = mode === 'place' ? 'Type an answer, or choose “I haven’t learned this.”' : 'Type an answer first.'; if (box && box.focus) box.focus(); return; }
      var res; try { res = ML.check(p.a, a, { q: p.q, unit: p.unit }); } catch (e) { res = { ok: false, msg: 'That answer couldn’t be read. Check how it’s written.' }; }
      if (res && res.invalid) { fb.className = 'mlp-fb nudge'; fb.innerHTML = esc(res.msg || 'That answer couldn’t be read.'); return; }
      record(!!(res && res.ok), false, res, a);
    }
    function showSteps(open) {
      if (!p) return;
      steps.innerHTML = '<p class="mlp-steps-h">' + (open === 'wrong' ? 'Here’s how it goes:' : 'The steps') + '</p><ol class="mlp-steps">' + (p.steps || []).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol><p class="mlp-steps-a"><b>Answer:</b> ' + fmtAnswer(p.a) + '</p>';
      typeset(steps);
    }
    function floatXP(n) {
      if (!n) return;
      xpEl.textContent = '+' + n + ' XP'; (fb.classList.contains('right') || fb.classList.contains('neutral') ? fb : after).appendChild(xpEl);
      xpEl.classList.remove('go'); void xpEl.offsetWidth; xpEl.classList.add('go');
    }
    function record(ok, skipped, res, ans) {
      answered = true; bCheck.disabled = true; bHint.disabled = true; bSkip.disabled = true; if (box && box.disable) try { box.disable(); } catch (e) { }
      if (box && box.mark && res && mode !== 'quiz' && mode !== 'place' && fbOn) try { box.mark(res); } catch (e) { }
      if (box && box.keypad) try { box.keypad(false); } catch (e) { }
      var id = curId, out = { xp: 0 }, ms = t0 ? Date.now() - t0 : 0;
      if (E) {
        if (mode === 'learn') out = E.learnAnswer(id, ok, { hint: hinted });
        else if (mode === 'review' || (card0 && o.record === 'review')) out = E.reviewAnswer(id, ok);
        else if (mode === 'quiz') out = E.quizAnswer(id, ok);
        else if (card0 && o.record === 'result' && E.recordResult) out = E.recordResult(id, ok);
      }
      if (mode === 'place' && o.session) o.session.answer(id, ok);
      if (ok) right++; xpSum += out.xp || 0;
      log.push({ id: id, ok: ok, p: p, ans: ans, skipped: skipped, ms: ms });
      if (o.onAnswer) try { o.onAnswer(card0 ? { id: id, ok: ok, skipped: !!skipped, ms: ms, answer: ans, problem: p, res: res || null, index: idx, xp: out.xp || 0 } : { id: id, ok: ok, xp: out.xp || 0, res: out, ms: ms }); } catch (e) { }
      acts.innerHTML = '';
      if (mode === 'place') { next(); return; }
      if (mode === 'quiz' || (card0 && !fbOn)) {
        fb.className = 'mlp-fb neutral'; fb.textContent = 'Answer saved.';
        floatXP(out.xp); after.appendChild(bNext); bNext.textContent = idx + 1 >= items.length ? (card0 && o.summary === false ? 'Finish' : 'See your results') : 'Next problem'; focusNext(); return;
      }
      card.classList.add(ok ? 'is-right' : 'is-wrong');
      var from = mode === 'review' ? '<span class="mlp-from">From: ' + esc(topicTitle(id)) + '</span>' : '';
      if (ok) {
        fb.className = 'mlp-fb right'; fb.innerHTML = '<span class="mlp-fb-icon" aria-hidden="true">✓</span><span><b>' + pick(RIGHT) + '</b>' + (hinted ? ' (with a hint)' : '') + (res && res.msg ? ' <span class="mlp-fb-msg">' + esc(res.msg) + '</span>' : '') + ' ' + from + '</span>';
        floatXP(out.xp);
        if (stepsMode !== 'never') { var tg = btn('See the steps', 'ghost small', function () { showSteps(); tg.remove(); }); after.appendChild(tg); }
      } else {
        fb.className = 'mlp-fb wrong'; fb.innerHTML = '<span class="mlp-fb-icon" aria-hidden="true">↺</span><span><b>' + (skipped && card0 ? 'Skipped.' : 'Not quite.') + '</b>' + (res && res.msg ? ' <span class="mlp-fb-msg">' + esc(res.msg) + '</span>' : '') + ' ' + from + '</span>';
        if (stepsMode !== 'never') showSteps('wrong');
      }
      typeset(fb);
      paintProgress();
      if (mode === 'learn' && out.passed) return passed(out);
      if (mode === 'learn' && out.paused) return paused(out);
      if (mode === 'try') { after.appendChild(btn('Another one', 'pri', function () { render(o.topic); })); focusNext(); return; }
      after.appendChild(bNext);
      bNext.textContent = (mode === 'review' || card0) && idx + 1 >= items.length ? 'Finish' : 'Next problem';
      focusNext();
    }
    function focusNext() { setTimeout(function () { var b = after.querySelector('.mlp-btn.pri'); if (b) try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }, 20); }
    function passed(out) {
      paintProgress();
      var pn = el('div', 'mlp-done mlp-done-pass');
      pn.innerHTML = '<p class="mlp-done-big"><span aria-hidden="true">🎉</span> Topic passed!</p><p>You earned a 5 XP bonus. This topic will come back tomorrow for a quick two-problem review, then less and less often.</p>';
      var row = el('div', 'mlp-acts');
      if (o.nextTopic && o.nextTopic.url) { var a = el('a', 'mlp-btn pri', 'Next topic: ' + esc(o.nextTopic.title) + ' →'); a.href = o.nextTopic.url; row.appendChild(a); }
      if (o.onDone) row.appendChild(btn('Continue', o.nextTopic ? '' : 'pri', function () { finish({ passed: true }); }));
      row.appendChild(btn('Keep practicing', 'ghost', function () { render(o.topic); }));
      pn.appendChild(row); after.appendChild(pn); floatXP(out.xp);
      setTimeout(function () { var f = row.querySelector('a,.mlp-btn'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { } }, 30);
      if (o.onPass) try { o.onPass(out); } catch (e) { }
    }
    function paused(out) {
      var pn = el('div', 'mlp-done mlp-done-pause'), w = out.weak && E ? E.graph().T[out.weak] : null;
      pn.innerHTML = '<p class="mlp-done-big">Let’s pause this one.</p><p>Four misses in one sitting usually means a skill underneath needs a refresh. Look over the worked example again' + (w ? ', and practice <b>' + esc(w.title) + '</b>, the skill this one leans on most' : '') + '. This topic will be waiting for you.</p>';
      var row = el('div', 'mlp-acts');
      if (o.onPause) row.appendChild(btn('Show the worked example', '', function () { o.onPause(out); }));
      if (w && w.url) { var a = el('a', 'mlp-btn pri', 'Practice ' + esc(w.title)); a.href = w.url + '#practice'; row.appendChild(a); }
      if (o.onDone) row.appendChild(btn('Do something else', '', function () { finish({ paused: true, weak: out.weak }); }));
      row.appendChild(btn('Try a few more', 'ghost', function () { if (E) E.startLearn(o.topic); render(o.topic); }));
      pn.appendChild(row); after.appendChild(pn);
      setTimeout(function () { var f = row.querySelector('a,.mlp-btn'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { } }, 30);
    }
    function next(fromSkip) {
      if (done) return;
      if (mode === 'learn' || mode === 'try') return render(o.topic);
      if (mode === 'place') {
        var q = o.session.next();
        if (!q) return finish({});
        var c = q.split('.')[0];
        ML.loadCourse(c).then(function () { render(q); });
        return;
      }
      if (!fromSkip) idx++;
      if (idx >= items.length) return finish({});
      var it = items[idx]; render(it.id || it);
    }
    function finish(extra) {
      if (done) return; done = true;
      rep.remove();
      var sum = Object.assign({ mode: mode, right: right, total: log.length, xp: xpSum, log: log, ms: log.reduce(function (s, L) { return s + (L.ms || 0); }, 0) }, extra || {});
      if (mode === 'quiz') { if (E) E.checkpointDone(); quizSummary(sum); }
      else if (mode === 'review') reviewSummary(sum);
      else if (card0 && o.summary !== false) { if (stepsMode === 'end') quizSummary(sum); else reviewSummary(sum); }
      if (o.onDone) try { o.onDone(sum); } catch (e) { if (W.console) W.console.error(e); }
    }
    function yours(L) {
      var a = L.ans, sp = L.p.a;
      try {
        if (a === null || a === undefined || a === '' || a === -1) return '<i>no answer</i>';
        if (sp.t === 'mc') return (Array.isArray(a) ? a : [a]).map(function (i) { return '<span class="mlp-ans-choice">' + (sp.choices || [])[i] + '</span>'; }).join(', ');
        if (sp.t === 'tf') return a ? 'True' : 'False';
        if (sp.t === 'formula') { try { return esc('$' + ML._check.formulaTex(String(a)) + '$'); } catch (e2) { return esc(String(a)); } }
        if (sp.t === 'prop') { try { return esc(ML._check.propShow(String(a))); } catch (e3) { return esc(String(a)); } }
        if (sp.t === 'translit') { try { return esc(ML._check.translitShow(String(a))); } catch (e4) { return esc(String(a)); } }
        if (Array.isArray(a)) return esc(a.map(function (x) { return Array.isArray(x) ? '[' + x.join(', ') + ']' : x; }).join('; '));
        return plain(a);
      } catch (e) { return esc(String(a)); }
    }
    function reviewSummary(sum) {
      if (o.summary === false) return;
      card.classList.remove('is-right', 'is-wrong');
      body.innerHTML = card0 ? '<div class="mlp-done"><p class="mlp-done-big">' + sum.right + ' of ' + sum.total + ' right.</p></div>'
        : '<div class="mlp-done"><p class="mlp-done-big">Review done: ' + sum.right + ' of ' + sum.total + ' right.</p><p>' + (sum.right === sum.total ? 'Every one. These topics will wait longer before they come back.' : 'The ones you missed come back sooner, so they stick.') + '</p></div>';
    }
    function quizSummary(sum) {
      card.classList.remove('is-right', 'is-wrong'); prog.innerHTML = '';
      var h = card0 ? '<div class="mlp-done"><p class="mlp-done-big">' + sum.right + ' of ' + sum.total + ' right</p><p>' + (sum.right === sum.total ? 'Every one. Strong work.' : 'Look over the ones you missed below: each shows its steps.') + '</p><ol class="mlp-qsum">'
        : '<div class="mlp-done"><p class="mlp-done-big">Checkpoint: ' + sum.right + ' of ' + sum.total + ' right</p><p>' + (sum.right >= sum.total - 1 ? 'Strong work. You’ve kept these topics.' : 'Look over the ones you missed below. They’ll come back for review tomorrow.') + '</p><ol class="mlp-qsum">';
      log.forEach(function (L) {
        h += '<li class="' + (L.ok ? 'ok' : 'no') + '"><details' + (L.ok ? '' : ' open') + '><summary><span class="mlp-qsum-icon" aria-hidden="true">' + (L.ok ? '✓' : '↺') + '</span><span class="mlp-sr">' + (L.ok ? 'Right: ' : 'Missed: ') + '</span>' + esc(topicTitle(L.id)) + '</summary><div class="mlp-qsum-q">' + L.p.q + '</div>' + (L.ok ? '' : '<p class="mlp-qsum-you">Your answer: ' + yours(L) + '</p>') + '<ol class="mlp-steps">' + (L.p.steps || []).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol><p class="mlp-steps-a"><b>Answer:</b> ' + fmtAnswer(L.p.a) + '</p></details></li>';
      });
      body.innerHTML = h + '</ol></div>'; typeset(body);
    }

    card.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (!answered) { e.preventDefault(); check(); }
      else { var b = after.querySelector('.mlp-btn.pri'); if (b) { e.preventDefault(); b.click(); } }
    });

    // start
    if (mode === 'learn' && E) E.startLearn(o.topic);
    if (mode === 'learn' || mode === 'try') render(o.topic);
    else if (mode === 'place') next();
    else if (!items.length) { body.innerHTML = '<p class="mlp-small">Nothing to practice here right now.</p>'; }
    else { var it0 = items[0]; render(it0.id || it0); }

    return { el: card, next: next, destroy: function () { done = true; card.remove(); }, log: log };
  };

  /* ---------------- lessons ---------------- */
  ML.lessonUI = function (root, o) {
    o = o || {};
    if (!root) return;
    root.querySelectorAll('.mlp-ex[data-ex]:not([data-on])').forEach(function (ex) {
      ex.dataset.on = '1';
      var li = [].slice.call(ex.querySelectorAll('.mlp-ex-steps > li')), ans = ex.querySelector('.mlp-ex-a'), shown = 0;
      if (!li.length) return;
      ex.classList.add('stepping');
      li.forEach(function (x) { x.hidden = true; });
      if (ans) ans.hidden = true;
      var bar = el('div', 'mlp-ex-bar'), bOne = btn('Show the first step', 'pri small'), bAll = btn('Show all steps', 'ghost small'), live = el('p', 'mlp-sr');
      live.setAttribute('aria-live', 'polite');
      bar.appendChild(bOne); bar.appendChild(bAll); ex.appendChild(bar); ex.appendChild(live);
      function upd() {
        li.forEach(function (x, i) { x.hidden = i >= shown; });
        if (ans) ans.hidden = shown < li.length;
        if (shown >= li.length) { bar.remove(); ex.classList.add('all'); }
        else bOne.textContent = 'Show step ' + (shown + 1) + ' of ' + li.length;
      }
      bOne.addEventListener('click', function () { shown++; upd(); live.textContent = 'Step ' + shown + ' shown.'; var x = li[shown - 1]; if (x) { x.classList.add('new'); setTimeout(function () { x.classList.remove('new'); }, 900); } if (shown >= li.length && ans) { var f = ans; f.tabIndex = -1; } else bOne.focus(); });
      bAll.addEventListener('click', function () { shown = li.length; upd(); live.textContent = 'All steps shown.'; });
      ex._showAll = function () { shown = li.length; upd(); };
    });
    root.querySelectorAll('.mlp-try[data-try]:not([data-on])').forEach(function (t) {
      t.dataset.on = '1';
      var id = t.dataset.try;
      if (!hasGen(id)) { t.hidden = true; return; }
      t.hidden = false; ML.runner(t, { mode: 'try', topic: id, autofocus: false });
    });
    typeset(root);
    if (ML.viz && ML.viz.mountAll) {
      var need = [].map.call(root.querySelectorAll('.ml-viz:not([data-mounted])'), function (v) { return v.dataset.viz; });
      Promise.all(need.map(ML.needViz)).then(function () { ML.viz.mountAll(root); });
    }
  };
})(window, document);
