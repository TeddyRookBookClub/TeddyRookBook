/* Practice drills page (layouts/debate/drills.html). Logic and built-in items in drills-core.js; scores in TRBDebate part "drills". */
(function () {
  'use strict';
  var D = window.TRBDebate, T = window.DebateTimerCore, R = window.DebateDrillsCore, $ = D.$, $$ = D.$$, esc = D.esc;
  var root = $('#dbd');
  if (!root || !R) return;
  var topics = D.json('db-topics') || [];
  var fallacyList = D.json('db-fallacies') || [];
  var base = ((D.json('db-base') || {}).base || '/');
  function site(u) { return /^https?:/.test(u) ? u : base + String(u || '').replace(/^\//, ''); }
  var st = D.part('drills', {});
  ['fallacy', 'weigh'].forEach(function (k) { st[k] = st[k] || { right: 0, tried: 0, seen: {} }; st[k].seen = st[k].seen || {}; });
  st.done = st.done || { steelman: 0, rebuttal: 0, cx: 0, impromptu: 0 };

  var shown = {};

  function topicLink(t) { return t.url ? '<a href="' + esc(t.url) + '">' + esc(t.topic || t.title) + '</a>' : esc(t.topic || t.title); }
  function resLine(x) { return '<p class="dbd-res">' + esc(x.resolution) + '</p>'; }
  function noTopics(el) { el.innerHTML = '<p>The topics are still being added. Try the <b>Fallacy spotter</b> or <b>Weighing</b> in the meantime.</p>'; }

  /* ---------- random resolution ---------- */
  var lastPick = null;
  function filters() { return { level: $('#dbd-level').value, category: $('#dbd-cat').value, format: $('#dbd-ffmt').value }; }
  function count() {
    var n = R.filterTopics(topics, filters()).length;
    $('#dbd-count').textContent = n + (n === 1 ? ' topic matches' : ' topics match');
    $('#dbd-pickgo').disabled = !n;
  }
  ['#dbd-level', '#dbd-cat', '#dbd-ffmt'].forEach(function (s) { $(s).addEventListener('change', function () { st.filters = filters(); D.save(); count(); }); });
  if (st.filters) { $('#dbd-level').value = st.filters.level || ''; $('#dbd-cat').value = st.filters.category || ''; $('#dbd-ffmt').value = st.filters.format || ''; }
  function catLabel(k, list) { var m = (list || []).filter(function (x) { return x.key === k; })[0]; return m ? m.label : k; }
  var meta = { levels: [], categories: [] };
  $$('#dbd-level option').forEach(function (o) { if (o.value) meta.levels.push({ key: o.value, label: o.textContent }); });
  $$('#dbd-cat option').forEach(function (o) { if (o.value) meta.categories.push({ key: o.value, label: o.textContent }); });
  $('#dbd-pickgo').addEventListener('click', function () {
    var t = R.pickOne(R.filterTopics(topics, filters()), null, lastPick);
    if (!t) return;
    lastPick = t;
    var side = Math.random() < 0.5 ? 'aff' : 'neg';
    var box = $('#dbd-picked');
    box.hidden = false;
    box.innerHTML = '<p class="dbd-meta">' + esc(catLabel(t.category, meta.categories)) + ' · ' + esc(catLabel(t.level, meta.levels)) + (t.kind ? ' · ' + esc(t.kind) + ' resolution' : '') + '</p>' +
      '<p class="dbd-res dbd-big">' + esc(t.resolution) + '</p>' +
      '<p class="dbd-side" id="dbd-side" hidden>You argue the <b>' + esc(R.sideLabel(t, side)) + '</b>.</p>' +
      '<div class="hs-actions"><button type="button" class="hs-btn" id="dbd-assign">🪙 Give me a side</button>' +
      '<button type="button" class="hs-btn" id="dbd-toimp">⏱️ Use for impromptu</button>' +
      '<a class="hs-btn" href="' + esc(t.url) + '">📖 Both sides of this topic</a></div>';
    $('#dbd-assign').addEventListener('click', function () { $('#dbd-side').hidden = false; this.disabled = true; });
    $('#dbd-toimp').addEventListener('click', function () { $('#dbd-itopic').value = t.resolution; $('#tab-impromptu').click(); });
  });
  count();

  /* ---------- impromptu ---------- */
  var imp = { round: null, raf: 0, iv: 0 };
  function impBuild() {
    var f = R.impromptuFormat(+$('#dbd-iprep').value, +$('#dbd-ispeak').value);
    var plan = T.buildPlan(f, {});
    imp.round = new T.Round(plan, { warn: [60, 30] });
    impDraw();
  }
  function impDraw() {
    var r = imp.round, s = r.seg(), left = r.leftMs / 1000;
    $('#dbd-iphase').textContent = (r.i === 0 ? 'Prep' : 'Speech') + (r.running ? '' : (left === s.sec ? ': ready' : ': paused'));
    $('#dbd-itime').textContent = T.clock(left);
    $('#dbd-iclock').dataset.level = left <= 0 ? 'over' : left <= 30 ? 'close' : left <= 60 ? 'warn' : '';
    $('#dbd-ibar').style.width = (Math.max(0, Math.min(1, 1 - left / (s.sec || 1))) * 100).toFixed(1) + '%';
    $('#dbd-igo').textContent = r.running ? '⏸ Pause' : (r.i === 0 ? (left === s.sec ? '▶ Start prep' : '▶ Resume prep') : (left === s.sec ? '▶ Start speaking' : '▶ Resume'));
    $('#dbd-iskip').hidden = r.i !== 0;
  }
  function impStep() {
    var r = imp.round;
    r.tick(performance.now()).forEach(function (e) {
      if (e.type === 'warn') $('#dbd-ilive').textContent = T.spoken(e.at) + ' left';
      if (e.type === 'zero') {
        if (r.i === 0) { r.next(performance.now()); r.start(performance.now()); $('#dbd-ilive').textContent = 'Prep is over. Start speaking.'; }
        else { $('#dbd-ilive').textContent = 'Time'; st.done.impromptu++; D.save(); }
      }
    });
    impDraw();
  }
  function impLoop() {
    imp.raf = 0;
    if (!imp.round.running) return;
    impStep();
    imp.raf = requestAnimationFrame(impLoop);
  }
  function impRun() {
    if (!imp.raf) imp.raf = requestAnimationFrame(impLoop);
    // animation frames stop in a background tab; this keeps the clock moving
    if (!imp.iv) imp.iv = setInterval(function () { if (imp.round.running && document.hidden) impStep(); }, 500);
  }
  $('#dbd-igo').addEventListener('click', function () { imp.round.toggle(performance.now()); impDraw(); impRun(); });
  $('#dbd-iskip').addEventListener('click', function () { var t = performance.now(); imp.round.next(t); imp.round.start(t); impDraw(); impRun(); });
  $('#dbd-ireset').addEventListener('click', function () { impBuild(); });
  ['#dbd-iprep', '#dbd-ispeak'].forEach(function (s) { $(s).addEventListener('change', function () { st.imp = { prep: $('#dbd-iprep').value, speak: $('#dbd-ispeak').value }; D.save(); impBuild(); }); });
  if (st.imp) { $('#dbd-iprep').value = st.imp.prep; $('#dbd-ispeak').value = st.imp.speak; }
  $('#dbd-inew').addEventListener('click', function () { var t = R.pickOne(topics); if (t) $('#dbd-itopic').value = t.resolution; else $('#dbd-itopic').focus(); });
  D.autosize($('#dbd-inotes'));
  impBuild();

  /* ---------- steelman it ---------- */
  var smItems = R.steelmanItems(topics), smCur = null;
  function smNew() {
    var el = $('#dbd-sm');
    if (!smItems.length) return noTopics(el);
    smCur = R.pickOne(smItems, null, smCur);
    var x = smCur;
    el.innerHTML = '<p class="dbd-meta">' + topicLink(x) + '</p>' + resLine(x) +
      '<div class="dbd-straw"><span class="dbd-lab">Strawman of the ' + esc(x.sideLabel) + ' view</span><p>' + esc(x.strawman) + '</p></div>' +
      '<label class="dbx-f dbd-wide">Your steelman: the ' + esc(x.sideLabel) + ' view at its strongest<textarea id="dbd-smt" rows="4"></textarea></label>' +
      '<div class="hs-actions"><button type="button" class="hs-btn pri" id="dbd-smgo">Compare with the model</button> <button type="button" class="hs-btn" id="dbd-smnext">Another one →</button></div>' +
      '<div id="dbd-smout" aria-live="polite"></div>';
    D.autosize($('#dbd-smt'));
    $('#dbd-smgo').addEventListener('click', function () {
      var mine = $('#dbd-smt').value.trim();
      var h = '<div class="dbd-model"><span class="dbd-lab">Why the strawman misses</span><p>' + esc(x.why) + '</p>' +
        '<span class="dbd-lab">A steelman</span><p>' + esc(x.steelman) + '</p></div>' +
        '<p class="dbd-check"><b>Check yours:</b> Would someone who holds this view agree with how you put it? Did you include their best reason, not just their conclusion? Did you avoid loaded words?</p>';
      if (!mine) h = '<p class="dbd-tip">Try writing your own first; you’ll learn more by comparing.</p>' + h;
      else { st.done.steelman++; D.save(); }
      $('#dbd-smout').innerHTML = h;
    });
    $('#dbd-smnext').addEventListener('click', smNew);
  }
  shown.steelman = function () { if (!smCur) smNew(); };

  /* ---------- rebuttal ---------- */
  var rbItems = R.rebuttalItems(topics), rbCur = null, rbClock = null;
  function rbNew() {
    var el = $('#dbd-rb');
    if (!rbItems.length) return noTopics(el);
    rbCur = R.pickOne(rbItems, null, rbCur);
    var x = rbCur;
    var h = '<p class="dbd-meta">' + topicLink(x) + '</p>' + resLine(x) +
      '<div class="dbd-straw dbd-arg"><span class="dbd-lab">The ' + esc(x.sideLabel) + ' argues</span><p><b>' + esc(x.claim) + '</b>' + (x.warrant ? ' ' + esc(x.warrant) : '') + '</p></div>' +
      '<p class="hs-small">You are the ' + esc(x.answerLabel) + '. Answer it.</p><div class="dbd-steps">';
    R.STEPS.forEach(function (s) {
      h += '<label class="dbx-f"><span><b>' + esc(s.label) + '…</b> <small>' + esc(s.hint) + '</small></span><textarea rows="2" data-step="' + s.k + '"></textarea></label>';
    });
    h += '</div><div class="hs-actions"><button type="button" class="hs-btn pri" id="dbd-rbgo">Check it</button> <button type="button" class="hs-btn" id="dbd-rbtime">⏱️ 1-minute timer</button> <button type="button" class="hs-btn" id="dbd-rbnext">Another one →</button> <span class="dbd-mini" id="dbd-rbclock" aria-live="off"></span></div><div id="dbd-rbout" aria-live="polite"></div>';
    el.innerHTML = h;
    $$('textarea', el).forEach(D.autosize);
    $('#dbd-rbgo').addEventListener('click', function () {
      var ans = {}; $$('[data-step]', el).forEach(function (t) { ans[t.dataset.step] = t.value; });
      var r = R.checkRebuttal(ans, x);
      var out = '<ul class="dbd-fb">' + r.steps.map(function (s) { return '<li class="' + (s.ok ? 'ok' : 'no') + '"><b>' + esc(s.label) + ':</b> ' + esc(s.note) + '</li>'; }).join('') + '</ul>';
      out += '<div class="dbd-model"><span class="dbd-lab">How the ' + esc(x.answerLabel) + ' often answers</span><p>' + esc(x.response) + '</p></div>';
      if (r.ok) { st.done.rebuttal++; D.save(); }
      $('#dbd-rbout').innerHTML = out;
    });
    $('#dbd-rbtime').addEventListener('click', function () { miniTimer($('#dbd-rbclock'), 60); });
    $('#dbd-rbnext').addEventListener('click', rbNew);
  }
  shown.rebuttal = function () { if (!rbCur) rbNew(); };

  // a small countdown in a span (for rebuttal and cross-ex answers)
  var mini = null;
  function miniTimer(span, sec) {
    if (mini) clearInterval(mini.iv);
    var end = Date.now() + sec * 1000;
    function tick() {
      var left = (end - Date.now()) / 1000;
      span.textContent = left > 0 ? T.clock(left) : 'Time';
      span.classList.toggle('is-over', left <= 0);
      if (left <= 0) clearInterval(mini.iv);
    }
    mini = { iv: setInterval(tick, 250) };
    tick();
  }

  /* ---------- cross-ex ---------- */
  var cxItems = R.cxItems(topics), cxCur = null;
  function cxMode() { var r = root.querySelector('input[name="dbd-cxm"]:checked'); return r ? r.value : 'answer'; }
  function cxNew() {
    var el = $('#dbd-cxc');
    if (!cxItems.length) return noTopics(el);
    cxCur = R.pickOne(cxItems, null, cxCur);
    var x = cxCur, h = '<p class="dbd-meta">' + topicLink(x) + '</p>' + resLine(x);
    if (cxMode() === 'answer') {
      var q = x.questions[Math.floor(Math.random() * x.questions.length)];
      h += '<p class="hs-small">You are the ' + esc(x.sideLabel) + '. The other side asks:</p><p class="dbd-q">“' + esc(q) + '”</p>' +
        '<p>Answer out loud in 30 seconds or less. Keep it short and honest; if the true answer is “yes, but,” say the yes and give the “but” in one sentence.</p>' +
        '<div class="hs-actions"><button type="button" class="hs-btn pri" id="dbd-cxt">⏱️ 30 seconds</button> <button type="button" class="hs-btn" id="dbd-cxnext">Another question →</button> <span class="dbd-mini" id="dbd-cxclock"></span></div>' +
        '<details class="dbd-tipsd"><summary>Tips for answering</summary><ul><li>Pause and think; a calm answer beats a fast one.</li><li>Don’t agree to a word you don’t accept (“disaster,” “always”). Restate it in your words.</li><li>If you don’t know, say so; you can explain in your next speech.</li><li>Refer back to your case: “As my second contention says…”</li></ul></details>';
    } else {
      h += '<p class="hs-small">You are the ' + esc(x.askerLabel) + '. The ' + esc(x.sideLabel) + ' has argued:</p><ul class="dbd-args">' + x.args.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
        '<label class="dbx-f dbd-wide">Write three questions you would ask<textarea id="dbd-cxw" rows="4" placeholder="1.\n2.\n3."></textarea></label>' +
        '<div class="hs-actions"><button type="button" class="hs-btn pri" id="dbd-cxshow">Compare with sample questions</button> <button type="button" class="hs-btn" id="dbd-cxnext">Another topic →</button></div><div id="dbd-cxout" aria-live="polite"></div>';
    }
    el.innerHTML = h;
    var t = $('#dbd-cxt'); if (t) t.addEventListener('click', function () { miniTimer($('#dbd-cxclock'), 30); st.done.cx++; D.save(); });
    var w = $('#dbd-cxw'); if (w) D.autosize(w);
    var s = $('#dbd-cxshow'); if (s) s.addEventListener('click', function () {
      $('#dbd-cxout').innerHTML = '<div class="dbd-model"><span class="dbd-lab">Sample questions for the ' + esc(x.sideLabel) + '</span><ol>' + x.questions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol></div>' +
        '<p class="dbd-check"><b>Check yours:</b> Is each question short, with one clear answer? Does it set up something you’ll say in your speech? Is it a real question, not a speech with a question mark?</p>';
      st.done.cx++; D.save();
    });
    $('#dbd-cxnext').addEventListener('click', cxNew);
  }
  $$('input[name="dbd-cxm"]').forEach(function (r) { r.addEventListener('change', cxNew); });
  shown.cx = function () { if (!cxCur) cxNew(); };

  /* ---------- fallacy spotter ---------- */
  var fCur = null;
  function score(k, el) {
    var s = st[k];
    el.textContent = s.tried ? 'Score: ' + s.right + ' of ' + s.tried + ' right' + (s.tried ? ' · ' + Object.keys(s.seen).length + ' of ' + (k === 'fallacy' ? R.FALLACIES.length : R.WEIGH.length) + ' seen' : '') : '';
  }
  function nextUnseen(list, seen, cur) {
    var fresh = list.filter(function (x) { return !seen[x.id] && (!cur || x.id !== cur.id); });
    return R.pickOne(fresh.length ? fresh : list, null, cur);
  }
  function fNew() {
    var el = $('#dbd-fq');
    fCur = nextUnseen(R.FALLACIES, st.fallacy.seen, fCur);
    var x = fCur, choices = R.fallacyChoices(x, null, fallacyList);
    var h = '<div class="dbd-ex">' + x.lines.map(function (l) { return '<p class="dbd-line' + (l[0] === 'Note' ? ' dbd-note' : '') + '"><b>' + esc(l[0] === 'Note' ? 'Note' : l[0]) + (l[0] === 'Note' ? ':' : '') + '</b> ' + esc(l[1]) + '</p>'; }).join('') + '</div>' +
      '<fieldset class="dbd-choices"><legend class="dbx-sr">Which fallacy?</legend>';
    choices.forEach(function (c) { h += '<button type="button" class="dbd-choice" data-slug="' + esc(c.slug) + '">' + esc(c.name) + '</button>'; });
    h += '</fieldset><div id="dbd-fout" aria-live="polite"></div>';
    el.innerHTML = h;
    var answered = false;
    $$('.dbd-choice', el).forEach(function (b) {
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var right = R.fallacyInfo(x.a, fallacyList);
        var ok = b.dataset.slug === right.slug;
        st.fallacy.tried++; if (ok) st.fallacy.right++; st.fallacy.seen[x.id] = 1; D.save();
        $$('.dbd-choice', el).forEach(function (c) { c.disabled = true; if (c.dataset.slug === right.slug) c.classList.add('is-right'); else if (c === b) c.classList.add('is-wrong'); });
        $('#dbd-fout').innerHTML = '<p class="dbd-verdict ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓ Right: ' : '✗ It’s ') + '<b>' + esc(right.name) + '</b>.</p><p>' + esc(x.ex) + '</p>' +
          '<p class="hs-small"><a href="' + esc(site(right.url)) + '">' + (x.a === 'none' ? 'Good reasoning that looks like a fallacy' : esc(right.name)) + ' on the Logic Ladder</a></p>' +
          '<div class="hs-actions"><button type="button" class="hs-btn pri" id="dbd-fnext">Next exchange →</button></div>';
        score('fallacy', $('#dbd-fscore'));
        $('#dbd-fnext').addEventListener('click', function () { fNew(); var f = $('.dbd-choice', el); if (f) f.focus(); });
      });
    });
  }
  shown.fallacy = function () { if (!fCur) fNew(); score('fallacy', $('#dbd-fscore')); };

  /* ---------- weighing ---------- */
  var wCur = null;
  function wNew() {
    var el = $('#dbd-wq');
    wCur = nextUnseen(R.WEIGH, st.weigh.seen, wCur);
    var x = wCur;
    var h = '<div class="dbd-vs"><div class="dbd-imp dbx-s0"><span class="dbd-lab">Side A’s impact</span><p>' + esc(x.a) + '</p></div><div class="dbd-imp dbx-s1"><span class="dbd-lab">Side B’s impact</span><p>' + esc(x.b) + '</p></div></div>' +
      '<p><b>Side A wants to show its impact matters more. Which kind of weighing gives Side A its best case?</b></p><div class="dbd-choices">';
    R.MECH.forEach(function (m) { h += '<button type="button" class="dbd-choice" data-k="' + m.k + '"><b>' + esc(m.label) + '</b><small>' + esc(m.q) + '</small></button>'; });
    h += '</div><div id="dbd-wout" aria-live="polite"></div>';
    el.innerHTML = h;
    var answered = false;
    $$('.dbd-choice', el).forEach(function (b) {
      b.addEventListener('click', function () {
        if (answered) return; answered = true;
        var ok = b.dataset.k === x.m;
        st.weigh.tried++; if (ok) st.weigh.right++; st.weigh.seen[x.id] = 1; D.save();
        $$('.dbd-choice', el).forEach(function (c) { c.disabled = true; if (c.dataset.k === x.m) c.classList.add('is-right'); else if (c === b) c.classList.add('is-wrong'); });
        var lab = R.MECH.filter(function (m) { return m.k === x.m; })[0].label;
        $('#dbd-wout').innerHTML = '<p class="dbd-verdict ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓ Right: ' : '✗ Best here: ') + '<b>' + esc(lab) + '</b>.</p><p>' + esc(x.ex) + '</p><div class="hs-actions"><button type="button" class="hs-btn pri" id="dbd-wnext">Next pair →</button></div>';
        score('weigh', $('#dbd-wscore'));
        $('#dbd-wnext').addEventListener('click', function () { wNew(); var f = $('.dbd-choice', el); if (f) f.focus(); });
      });
    });
  }
  shown.weigh = function () { if (!wCur) wNew(); score('weigh', $('#dbd-wscore')); };
  // weigh your own
  var wrows = $('#dbd-wrows');
  wrows.innerHTML = R.MECH.map(function (m) {
    return '<tr><th scope="row">' + esc(m.label) + ' <small>' + esc(m.q) + '</small></th>' + [0, 1].map(function (j) {
      return '<td><select data-m="' + m.k + '" data-j="' + j + '" aria-label="' + esc(m.label) + ', ' + (j ? 'their' : 'your') + ' impact">' + [1, 2, 3, 4, 5].map(function (n) { return '<option' + (n === 3 ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></td>';
    }).join('') + '</tr>';
  }).join('');
  function wSelf() {
    var sc = {};
    $$('select', wrows).forEach(function (s) { sc[s.dataset.m] = sc[s.dataset.m] || [3, 3]; sc[s.dataset.m][+s.dataset.j] = +s.value; });
    $('#dbd-wself-out').textContent = R.weighSentence($('#dbd-wa').value, $('#dbd-wb').value, sc);
  }
  $('#dbd-wself').addEventListener('input', wSelf);
  $('#dbd-wself').addEventListener('change', wSelf);
  wSelf();

  // tabs last, so the first one shown can fill itself in
  D.tabs($('#dbd-tabs'), 'dbd-', function (v) { if (shown[v]) shown[v](); }, 'drill');
  window.__dbd = { st: st };
})();
