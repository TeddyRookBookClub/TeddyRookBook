/* /vocabulary/flashcards/: decks by topic, root, level, "my hard words" or all; picture side and word side; spaced review
   (MathLadder.vocabPages.sched). Prefs and progress in localStorage 'trb-vocab-v1' (see common.js). */
(function (W, D) {
  'use strict';
  var VP = W.MathLadder.vocabPages, $ = VP.$, $$ = VP.$$, esc = VP.esc;
  VP.ready(function (VO) {
    var st = VP.load(), P = st.prefs;
    if (!P.kind) P.kind = 'topic'; if (!P.dir) P.dir = 'p'; if (!P.order) P.order = 'srs'; if (!P.nw) P.nw = '10';
    try { var qk = /[?&]deck=([a-z]+):([\w-]+)/.exec(W.location.search); if (qk) { P.kind = qk[1]; P['which_' + qk[1]] = qk[2]; } } catch (e) { }
    function save() { VP.save(st); }
    function dayStats() { if (st.day.d !== VP.today()) st.day = { d: VP.today(), nw: 0, rv: 0 }; return st.day; }
    var ready = VP.withEntries(VO), readySet = {}; ready.forEach(function (r) { readySet[r.w] = 1; });
    // ---- decks
    function decksOf(kind) {
      if (kind === 'topic') return VO.topics().map(function (t) { var n = t.words.filter(function (r) { return readySet[r.w]; }).length; return { v: t.key, label: t.n + '. ' + t.title + (n ? '' : ' (being written)'), words: t.words.filter(function (r) { return readySet[r.w]; }).map(function (r) { return r.w; }), off: !n }; });
      if (kind === 'root') return VO.rootKeys().map(function (k) { var R0 = VO.ROOT(k), ws = R0.words.filter(function (w) { return readySet[w]; }); return { v: k, label: R0.form + ' (' + R0.means + ') · ' + ws.length + ' words', words: ws, off: ws.length < 2, n: ws.length }; }).filter(function (d) { return d.n > 0 || true; }).sort(function (a, b) { return (b.words.length >= 2) - (a.words.length >= 2) || a.label.localeCompare(b.label); });
      if (kind === 'level') { var out = []; for (var l = 1; l <= 10; l++) { var ws2 = ready.filter(function (r) { return r.level === l; }).map(function (r) { return r.w; }); out.push({ v: String(l), label: 'Level ' + l + ' · ' + ws2.length + ' words', words: ws2, off: !ws2.length }); } return out; }
      if (kind === 'hard') { var hw = VP.hardWords(st).filter(function (w) { return readySet[w]; }); return [{ v: 'hard', label: 'My hard words · ' + hw.length, words: hw, off: !hw.length }]; }
      return [{ v: 'all', label: 'All ' + ready.length + ' words with cards', words: ready.map(function (r) { return r.w; }), off: !ready.length }];
    }
    function deck() {
      var ds = decksOf(P.kind), w = P['which_' + P.kind];
      var d = ds.filter(function (x) { return x.v === w && !x.off; })[0] || ds.filter(function (x) { return !x.off; })[0] || ds[0];
      return d || { v: '', label: 'No cards yet', words: [] };
    }
    function cardsOf(d) { var dirs = P.dir === 'x' ? ['p', 'w'] : [P.dir], out = []; d.words.forEach(function (w) { dirs.forEach(function (s) { out.push({ id: s + '>' + w, w: w, side: s }); }); }); return out; }
    // ---- faces
    function faces(cd) {
      var e = VO.entry(cd.w), back = '<div class="vop-face vop-back">' + VO.cardHTML(e, { mode: 'card', speak: !!W.speechSynthesis }) + '</div>';
      var front = cd.side === 'p'
        ? '<div class="vop-face vop-front"><span class="vop-tag">Picture side</span>' + VO.cardHTML(e, { mode: 'front', quiet: true }) + '<p class="vop-q">What is the word?</p></div>'
        : '<div class="vop-face vop-front vop-wordface"><span class="vop-tag">Word side</span>' + VO.cardHTML(e, { mode: 'word' }) + '<p class="vop-q">What does it mean? Can you picture its memory hook?</p></div>';
      return [front, back];
    }
    // ---- the session
    var queue = [], cur = null, shown = 0, seen = {}, extra = false;
    var stage = $('#vf-stage'), flipB = $('#vf-flip'), grade = $('#vf-grade');
    function build() {
      var all = cardsOf(deck()), now = Date.now(), d = dayStats();
      var due = all.filter(function (c) { var s = st.cards[c.id]; return s && s.d <= now; });
      var fresh = all.filter(function (c) { return !st.cards[c.id]; });
      if (P.order === 'shuffle') { due = shuffle(due); fresh = shuffle(fresh); } else if (P.order === 'srs') due.sort(function (a, b) { return st.cards[a.id].d - st.cards[b.id].d; });
      var room = P.kind === 'hard' ? 9999 : Math.max(0, +P.nw - d.nw);
      queue = due.concat(fresh.slice(0, room));
      if (P.kind === 'hard') queue = queue.concat(all.filter(function (c) { var s = st.cards[c.id]; return s && s.d > now; }));
      if (P.order === 'shuffle') queue = shuffle(queue);
      if (extra) { var later = all.filter(function (c) { var s = st.cards[c.id]; return s && s.d > now; }); if (P.order !== 'list') later = shuffle(later); queue = queue.concat(later, fresh.slice(room)); }
      seen = {}; next();
    }
    function shuffle(a) { return VP.rand().shuffle(a); }
    function counts() {
      var all = cardsOf(deck()), now = Date.now(), o = { total: all.length, learned: 0, mature: 0, due: 0, nw: 0 };
      all.forEach(function (c) { var s = st.cards[c.id]; if (!s) { o.nw++; return; } if (s.r > 0) o.learned++; if (s.i >= 21) o.mature++; if (s.d <= now) o.due++; });
      return o;
    }
    function render() {
      bar();
      if (!cur) {
        var dk = deck(), c = counts(), nextDue = Infinity;
        cardsOf(dk).forEach(function (cd) { var s = st.cards[cd.id]; if (s && s.d < nextDue) nextDue = s.d; });
        var when = nextDue < Infinity ? VP.ivlText({ i: Math.max(0.0001, (nextDue - Date.now()) / VP.DAY) }) : '';
        stage.innerHTML = !dk.words.length
          ? '<div class="vop-done"><h3>No cards here yet</h3><p>' + (P.kind === 'hard' ? 'Words you grade <i>Again</i> or <i>Hard</i>, and words you miss in a quiz, gather here.' : 'The cards for this deck are being written. Try another deck.') + '</p></div>'
          : '<div class="vop-done"><h3>All done for now</h3><p>' + (c.nw && dayStats().nw >= +P.nw ? 'You’ve had today’s ' + esc(P.nw) + ' new cards. ' : '') + (when ? 'The next review is due in about ' + esc(when) + '. ' : '') + 'Come back later, or keep going now.</p><p><button type="button" class="mlp-btn pri" id="vf-more">Study more anyway</button></p></div>';
        var more = $('#vf-more'); if (more) more.addEventListener('click', function () { extra = true; build(); stage.focus(); });
        flipB.hidden = true; grade.hidden = true; return;
      }
      var F = faces(cur); shown = 0;
      stage.innerHTML = '<div class="vop-card" id="vf-card">' + F[0] + '</div>';
      stage._back = F[1];
      flipB.hidden = false; grade.hidden = true;
      var s = st.cards[cur.id], now = Date.now();
      $$('.vg', grade).forEach(function (b) { b.querySelector('small').textContent = VP.ivlText(VP.sched(s, +b.dataset.q, now)); });
      $('#vf-open').setAttribute('href', VP.wordUrl(cur.w));
    }
    function turn() {
      if (!cur || shown) return; shown = 1;
      var card = $('#vf-card'); card.innerHTML = stage._back; card.classList.add('turned');
      flipB.hidden = true; grade.hidden = false; var g3 = $('.vg3', grade); if (g3 && D.activeElement === flipB) g3.focus();
    }
    function bar() {
      var c = counts(), done = Object.keys(seen).length, left = queue.length + (cur ? 1 : 0);
      $('#vf-pos').textContent = cur ? (done + 1) + ' of ' + (done + left) : done ? done + ' studied' : '';
      $('#vf-prog').style.width = (done + left ? Math.round(100 * done / (done + left)) : 0) + '%';
      $('#vf-due').textContent = c.due + ' due · ' + c.nw + ' new';
      var d = dayStats(); $('#vf-today').textContent = 'Today: ' + d.rv + ' reviewed, ' + d.nw + ' new';
      var hard = VP.hardWords(st).length;
      $('#vf-nums').innerHTML = '<div><b>' + c.total + '</b>cards in this deck</div><div><b>' + c.learned + '</b>learned</div><div><b>' + c.mature + '</b>known well (3+ weeks)</div><div><b>' + c.due + '</b>due now</div><div><b>' + hard + '</b>hard words</div><div><b>' + Object.keys(st.cards).length + '</b>cards studied in all</div>';
    }
    function next() { cur = queue.shift() || null; render(); }
    function rate(q) {
      if (!cur || grade.hidden) return;
      var now = Date.now(), d = dayStats(), was = st.cards[cur.id];
      if (!was) d.nw++; d.rv++;
      st.cards[cur.id] = VP.sched(was, q, now); seen[cur.id] = 1;
      if (q >= 3 && st.qmiss[cur.w]) delete st.qmiss[cur.w];
      save();
      if (q === 1) queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 3)), 0, cur);
      next();
    }
    flipB.addEventListener('click', turn);
    stage.addEventListener('click', function (e) { if (!e.target.closest('button,a')) turn(); });
    $$('.vg', grade).forEach(function (b) { b.addEventListener('click', function () { rate(+b.dataset.q); stage.focus({ preventScroll: true }); }); });
    $('#vf-skip').addEventListener('click', function () { if (cur) { queue.push(cur); next(); } });
    D.addEventListener('keydown', function (e) {
      var t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return; if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.key === ' ' || e.key === 'Enter') && cur && !shown) { if (t && (t.tagName === 'BUTTON' || t.tagName === 'A') && t !== flipB) return; e.preventDefault(); turn(); }
      else if (/^[1-4]$/.test(e.key) && shown) { e.preventDefault(); rate(+e.key); }
      else if ((e.key === 's' || e.key === 'S') && cur) { queue.push(cur); next(); }
    });
    $('#vf-reset').addEventListener('click', function () {
      if (!W.confirm('Reset your progress for this deck? Other decks keep theirs.')) return;
      cardsOf(deck()).forEach(function (c) { delete st.cards[c.id]; });
      save(); extra = false; build();
    });
    // ---- settings
    var kindBox = $('#vf-kind'), which = $('#vf-which'), dirBox = $('#vf-dir');
    function syncSeg(box, v) { $$('button', box).forEach(function (b) { var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
    function fillWhich() {
      var ds = decksOf(P.kind), d = deck();
      which.innerHTML = ds.map(function (x) { return '<option value="' + esc(x.v) + '"' + (x.off ? ' disabled' : '') + (x.v === d.v ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('');
      $('#vf-which-l').hidden = ds.length < 2;
    }
    kindBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; P.kind = b.dataset.v; save(); syncSeg(kindBox, P.kind); fillWhich(); extra = false; build(); });
    which.addEventListener('change', function () { P['which_' + P.kind] = which.value; save(); extra = false; build(); });
    dirBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; P.dir = b.dataset.v; save(); syncSeg(dirBox, P.dir); extra = false; build(); });
    var ord = $('#vf-order'), nw = $('#vf-new'); ord.value = P.order; nw.value = P.nw;
    ord.addEventListener('change', function () { P.order = ord.value; save(); build(); });
    nw.addEventListener('change', function () { P.nw = nw.value; save(); build(); });
    syncSeg(kindBox, P.kind); syncSeg(dirBox, P.dir); fillWhich(); build();
    W.__vfStarted = true;
  });
})(window, document);
