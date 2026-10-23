/* /vocabulary/quiz/: quick rounds (word → meaning, meaning → word, word in context, synonyms and opposites, roots), from
   a topic, a level, a root, "my hard words" or everything; untimed or with a timer per question. Problems come from
   MathLadder.vocab.gen.make. Misses go to localStorage 'trb-vocab-v1' qmiss (the flashcards' "My hard words"). */
(function (W, D) {
  'use strict';
  var VP = W.MathLadder.vocabPages, $ = VP.$, $$ = VP.$$, esc = VP.esc;
  var KINDS = { meaning: ['meaning'], word: ['word', 'hook'], context: ['cloze', 'cloze3', 'usage'], syn: ['synonym', 'antonym'], roots: ['roots'] };
  VP.ready(function (VO) {
    var st = VP.load(), Q = st.quiz.prefs = st.quiz.prefs || {};
    if (!Q.kind) Q.kind = 'topic'; if (!Q.types) Q.types = ['meaning', 'word', 'context', 'syn']; if (!Q.n) Q.n = '10'; if (Q.t == null) Q.t = '0';
    function save() { VP.save(st); }
    var ready = VP.withEntries(VO), readySet = {}; ready.forEach(function (r) { readySet[r.w] = 1; });
    function scopes(kind) {
      if (kind === 'topic') return VO.topics().map(function (t) { var ws = t.words.filter(function (r) { return readySet[r.w]; }).map(function (r) { return r.w; }); return { v: t.key, label: t.n + '. ' + t.title + (ws.length ? '' : ' (being written)'), words: ws }; });
      if (kind === 'level') { var o = []; for (var l = 1; l <= 10; l++) { var ws = ready.filter(function (r) { return r.level === l; }).map(function (r) { return r.w; }); o.push({ v: String(l), label: 'Level ' + l + ' · ' + ws.length + ' words', words: ws }); } return o; }
      if (kind === 'root') return VO.rootKeys().map(function (k) { var R0 = VO.ROOT(k), ws = R0.words.filter(function (w) { return readySet[w]; }); return { v: k, label: R0.form + ' (' + R0.means + ') · ' + ws.length, words: ws }; }).sort(function (a, b) { return (b.words.length >= 4) - (a.words.length >= 4) || a.label.localeCompare(b.label); });
      if (kind === 'hard') { var hw = VP.hardWords(st).filter(function (w) { return readySet[w]; }); return [{ v: 'hard', label: 'My hard words · ' + hw.length, words: hw }]; }
      return [{ v: 'all', label: 'All ' + ready.length + ' words', words: ready.map(function (r) { return r.w; }) }];
    }
    function scope() { var ss = scopes(Q.kind), w = Q['which_' + Q.kind]; return ss.filter(function (x) { return x.v === w && x.words.length; })[0] || ss.filter(function (x) { return x.words.length; })[0] || ss[0] || { words: [] }; }
    // ---- setup
    var kindBox = $('#vq-kind'), which = $('#vq-which'), types = $('#vq-types'), note = $('#vq-note');
    function syncSeg(box, v) { $$('button', box).forEach(function (b) { var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
    function fill() {
      var ss = scopes(Q.kind), sc = scope();
      which.innerHTML = ss.map(function (x) { return '<option value="' + esc(x.v) + '"' + (x.words.length ? '' : ' disabled') + (x.v === sc.v ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('');
      $('#vq-which-l').hidden = ss.length < 2;
      $$('button', types).forEach(function (b) { b.setAttribute('aria-pressed', String(Q.types.indexOf(b.dataset.v) >= 0)); });
      note.hidden = !!sc.words.length; note.textContent = Q.kind === 'hard' ? 'No hard words yet: words you miss in quizzes or grade Again or Hard in the flashcards gather here.' : 'The cards for these words are being written. Choose another set.';
      $('#vq-go').disabled = !sc.words.length;
    }
    kindBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; Q.kind = b.dataset.v; save(); syncSeg(kindBox, Q.kind); fill(); });
    which.addEventListener('change', function () { Q['which_' + Q.kind] = which.value; save(); fill(); });
    types.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var v = b.dataset.v, i = Q.types.indexOf(v); if (i >= 0 && Q.types.length > 1) Q.types.splice(i, 1); else if (i < 0) Q.types.push(v); save(); fill(); });
    var nSel = $('#vq-n'), tSel = $('#vq-t'); nSel.value = Q.n; tSel.value = Q.t;
    nSel.addEventListener('change', function () { Q.n = nSel.value; save(); });
    tSel.addEventListener('change', function () { Q.t = tSel.value; save(); });
    syncSeg(kindBox, Q.kind); fill();
    // ---- a round
    var run = $('#vq-run'), R = VP.rand(), items = [], at = 0, right = 0, log = [], timer = null, tLeft = 0, t0 = 0, answered = false;
    function makeOne(word, prefer) {
      var e = VO.entry(word); if (!e) return null;
      var kinds = []; Q.types.forEach(function (t) { kinds = kinds.concat(KINDS[t]); });
      kinds = R.shuffle(kinds); if (prefer) kinds.unshift(prefer);
      for (var i = 0; i < kinds.length; i++) { var p = VO.gen.make(kinds[i], e, VO.entries(e.topic), R); if (p && p.a && p.a.t === 'mc') { p.word = word; return p; } }
      var p2 = VO.gen.make('meaning', e, VO.entries(e.topic), R); if (p2) p2.word = word; return p2;
    }
    function start() {
      var sc = scope(), n = +Q.n, words = [];
      while (words.length < n && sc.words.length) words = words.concat(R.shuffle(sc.words));
      words = words.slice(0, n);
      items = words.map(function (w) { return makeOne(w); }).filter(Boolean);
      at = 0; right = 0; log = []; t0 = Date.now();
      $('#vq-setup').hidden = true; run.hidden = false; show();
      run.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('#vq-go').addEventListener('click', start);
    function show() {
      clearInterval(timer); answered = false;
      if (at >= items.length) return done();
      var p = items[at], secs = +Q.t;
      run.innerHTML = '<div class="vop-qhead"><span>Question ' + (at + 1) + ' of ' + items.length + '</span><span class="vop-prog"><i style="width:' + Math.round(100 * at / items.length) + '%"></i></span><span>' + right + ' right</span></div>' +
        (secs ? '<div class="vop-timer" aria-hidden="true"><i id="vq-tbar"></i></div>' : '') +
        '<div class="vop-qcard"><p class="vop-qq">' + p.q + '</p><div class="vop-opts">' + p.a.choices.map(function (c, i) { return '<button type="button" class="vop-opt" data-i="' + i + '"><span class="vop-optl">' + String.fromCharCode(65 + i) + '</span><span>' + esc(c) + '</span></button>'; }).join('') + '</div><div class="vop-fb" id="vq-fb" hidden></div>' +
        '<div class="vop-qact"><button type="button" class="mlp-btn pri" id="vq-next" hidden>' + (at + 1 < items.length ? 'Next question' : 'See my score') + '</button><button type="button" class="vop-link" id="vq-quit">End the quiz</button></div></div>';
      $$('.vop-opt', run).forEach(function (b) { b.addEventListener('click', function () { answer(+b.dataset.i); }); });
      $('#vq-next').addEventListener('click', function () { at++; show(); });
      $('#vq-quit').addEventListener('click', function () { items = items.slice(0, at + (answered ? 1 : 0)); done(); });
      var first = $('.vop-opt', run); if (first) first.focus({ preventScroll: true });
      if (secs) {
        tLeft = secs * 10; var bar0 = $('#vq-tbar');
        timer = setInterval(function () { tLeft--; if (bar0) bar0.style.width = Math.max(0, tLeft / (secs * 10) * 100) + '%'; if (tLeft <= 0) { clearInterval(timer); answer(-1); } }, 100);
      }
    }
    function answer(i) {
      if (answered) return; answered = true; clearInterval(timer);
      var p = items[at], ok = i === p.a.v;
      if (ok) right++; else { st.qmiss[p.word] = Date.now(); save(); }
      log.push({ w: p.word, ok: ok, timeout: i < 0 });
      $$('.vop-opt', run).forEach(function (b) { var k = +b.dataset.i; b.disabled = true; if (k === p.a.v) b.classList.add('ok'); else if (k === i) b.classList.add('no'); });
      var fb = $('#vq-fb'); fb.hidden = false; fb.className = 'vop-fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = (ok ? '<b class="vop-okm">✓ Right.</b> ' : '<b class="vop-nom">' + (i < 0 ? '⏱ Time is up.' : '✗ Not quite.') + '</b> ') + p.steps.slice(0, 2).join(' ');
      var nx = $('#vq-next'); nx.hidden = false; nx.focus({ preventScroll: true });
    }
    function done() {
      clearInterval(timer);
      var secs = Math.round((Date.now() - t0) / 1000), miss = log.filter(function (x) { return !x.ok; }), uniqMiss = [];
      miss.forEach(function (x) { if (uniqMiss.indexOf(x.w) < 0) uniqMiss.push(x.w); });
      st.quiz.last = { right: right, n: log.length, secs: secs, at: Date.now() }; save();
      run.innerHTML = '<div class="vop-qcard vop-result"><h2>' + right + ' of ' + log.length + ' right</h2><p>' + (log.length ? Math.round(100 * right / log.length) + '% · ' : '') + Math.floor(secs / 60) + ' min ' + (secs % 60) + ' s</p>' +
        (uniqMiss.length ? '<h3>Words to review</h3><ul class="vop-misslist">' + uniqMiss.map(function (w) { var e = VO.entry(w); return '<li><a href="' + VP.wordUrl(w) + '"><b>' + esc(w) + '</b></a> ' + esc(e ? e.def : '') + '</li>'; }).join('') + '</ul><p class="mlp-small">These words are now in <a href="' + esc((D.getElementById('vop').getAttribute('data-base') || '/vocabulary/') + 'flashcards/?deck=hard:hard') + '">your hard words</a> for the flashcards.</p>' : '<p>A perfect round. Try a harder set, or turn on the timer.</p>') +
        '<p class="vop-qact"><button type="button" class="mlp-btn pri" id="vq-again">Another round</button> <button type="button" class="mlp-btn" id="vq-setup-b">Change the settings</button></p></div>';
      $('#vq-again').addEventListener('click', start);
      $('#vq-setup-b').addEventListener('click', function () { run.hidden = true; $('#vq-setup').hidden = false; fill(); });
    }
    D.addEventListener('keydown', function (e) {
      if (run.hidden || e.ctrlKey || e.metaKey || e.altKey) return; var t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
      var k = e.key.toUpperCase();
      if (!answered && /^[A-D1-4]$/.test(k)) { var i = /[A-D]/.test(k) ? k.charCodeAt(0) - 65 : +k - 1; if (items[at] && i < items[at].a.choices.length) { e.preventDefault(); answer(i); } }
    });
    W.__vqStarted = true;
  });
})(window, document);
