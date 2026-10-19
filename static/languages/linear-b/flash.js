/* Linear B flashcards (/languages/linear-b/flashcards/) with spaced review (the same simplified SM-2 as the Greek, Latin and
   hieroglyph flashcards). Decks are built at run time from the kit's model (MathLadder.scripts: SIGNS, LOGO, num).
   Progress: localStorage 'trb-linb-v1' { cards: { id: { r, e, i, l, d, s } }, day: { d, nw, rv }, prefs: {...} }.
   Every storage access is in try/catch; without storage the cards still work for the visit. */
(function (W, D) {
  'use strict';
  var KEY = 'trb-linb-v1';
  function load() { try { var s = W.localStorage.getItem(KEY); return s ? JSON.parse(s) || {} : {}; } catch (e) { return {}; } }
  function store(o) { try { W.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ready(fn) { if (W.MathLadder && W.MathLadder.scripts) fn(W.MathLadder.scripts); else W.addEventListener('load', function () { if (W.MathLadder && W.MathLadder.scripts) fn(W.MathLadder.scripts); else { var m = $('#fc-msg'); if (m) m.textContent = 'The signs could not load. Please reload the page.'; } }); }
  ready(function (E) {
    var st = load(); st.cards = st.cards || {}; st.day = st.day || {}; st.prefs = st.prefs || {};
    var P = st.prefs; if (!P.deck) P.deck = 'v'; if (!P.dir) P.dir = 'f'; if (!P.order) P.order = 'srs'; if (!P.nw) P.nw = '10';
    try { var qd = /[?&]deck=([a-z0-9]+)/.exec(W.location.search); if (qd) P.deck = qd[1]; } catch (e) { }
    function save() { store(st); }
    function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function dayStats() { if (st.day.d !== today()) st.day = { d: today(), nw: 0, rv: 0 }; return st.day; }
    var MIN = 60e3, DAY = 864e5;
    function sched(c, q, now) {
      c = c ? JSON.parse(JSON.stringify(c)) : { r: 0, e: 2.5, i: 0, l: 0 };
      if (q === 1) { c.l++; c.r = 0; c.e = Math.max(1.3, c.e - 0.2); c.i = 0; c.d = now + MIN; }
      else {
        if (c.r === 0) c.i = q === 2 ? 0.5 : q === 3 ? 1 : 4;
        else if (c.r === 1 && q === 3) c.i = Math.max(3, c.i * 2);
        else c.i = Math.max(c.i + 1, c.i * (q === 2 ? 1.2 : q === 3 ? c.e : c.e * 1.3));
        if (q === 2) c.e = Math.max(1.3, c.e - 0.15);
        if (q === 4) c.e += 0.15;
        c.r++; c.d = now + c.i * DAY;
      }
      c.s = now; return c;
    }
    function ivlText(c) { if (!c || c.i === 0) return '< 1 min'; var d = c.i; if (d < 1) return Math.round(d * 24) + ' h'; if (d < 30) return Math.round(d) + ' d'; if (d < 365) return Math.round(d / 30) + ' mo'; return (d / 365).toFixed(1) + ' y'; }

    /* ---------- decks, from the model ---------- */
    var ROWNAME = { '': 'The vowels', d: 'The d row', j: 'The j row', k: 'The k row', m: 'The m row', n: 'The n row', p: 'The p row', q: 'The q row', r: 'The r row', s: 'The s row', t: 'The t row', w: 'The w row', z: 'The z row' };
    var DECKS = [];
    E.ROWS.forEach(function (r) {
      var items = E.VOWELS.map(function (v) { return E.gridCell(r, v); }).filter(Boolean).map(function (s) { return s.v; });
      DECKS.push({ key: r || 'v', name: ROWNAME[r], sub: r ? E.ROW_NOTE[r] : 'a, e, i, o, u', kind: 's', items: items });
    });
    DECKS.push({ key: 'sp', name: 'Special signs', sub: 'a2, a3, au, dwe, nwa, pu2 …', kind: 's', items: E.SIGNS.filter(function (s) { return s.kind === 'special'; }).map(function (s) { return s.v; }) });
    DECKS.push({ key: 'logo', name: 'Logograms', sub: 'people, animals, goods, vessels', kind: 'l', items: Object.keys(E.LOGO).filter(function (k) { return E.LOGO[k].kind === 'logo'; }) });
    DECKS.push({ key: 'num', name: 'Numbers', sub: 'the Aegean number marks', kind: 'n', items: ['1', '3', '5', '8', '10', '20', '40', '70', '100', '300', '1000', '4000', '10000', '24', '152', '1952'] });
    function deck() { return DECKS.filter(function (d) { return d.key === P.deck; })[0] || DECKS[0]; }
    function cardsOf(d) {
      var dirs = P.dir === 'x' ? ['>', '<'] : P.dir === 'r' ? ['<'] : ['>'], out = [];
      d.items.forEach(function (it) { dirs.forEach(function (dir) { out.push({ id: d.kind + dir + it, it: it, dir: dir, d: d }); }); });
      return out;
    }
    function big(u, label) { return '<span class="lbf-big sc-b" role="img" aria-label="' + esc(label) + '">' + esc(u) + '</span>'; }
    function examples(v) {
      var ex = E.wordsWith(v).slice(0, 2);
      return ex.length ? '<p class="lbf-ex">' + ex.map(function (k) { return '<span class="sc-b">' + esc(E.toSigns(k)) + '</span> <span class="sc-tl">' + esc(k) + '</span> ' + esc(E.WORDS[k].en); }).join('<br>') + '</p>' : '';
    }
    function faces(cd) {
      var k = cd.d.kind, f, b, t1, t2;
      if (k === 's') {
        var S = E.sign(cd.it), say = S.kind === 'special' ? ' (read ' + esc(S.say) + ')' : S.doubt ? ' (doubtful)' : '';
        var meta = '<p class="lbf-meta">' + esc(S.n) + (S.kind === 'grid' ? ' · ' + (S.c ? 'consonant ' + esc(E.ROW_NOTE[S.c]) : 'a vowel alone') : ' · a special sign') + '</p>';
        if (cd.dir === '>') { t1 = 'Sign'; t2 = 'Value'; f = big(S.u, 'Linear B sign ' + S.n) + '<p class="lbf-q">What is its value?</p>'; b = '<p class="lbf-ans">' + esc(S.v) + say + '</p>' + meta + examples(S.v); }
        else { t1 = 'Value'; t2 = 'Sign'; f = '<p class="lbf-ans">' + esc(S.v) + say + '</p><p class="lbf-q">Which sign writes it?</p>'; b = big(S.u, 'Linear B sign ' + S.n) + meta + examples(S.v); }
      } else if (k === 'l') {
        var L = E.LOGO[cd.it];
        if (cd.dir === '>') { t1 = 'Logogram'; t2 = 'Meaning'; f = big(L.u, 'Linear B logogram ' + L.n) + '<p class="lbf-q">What does it stand for?</p>'; b = '<p class="lbf-ans" style="font-style:normal">' + esc(L.en) + '</p><p class="lbf-meta">' + esc(L.key) + ' · ' + esc(L.n) + '</p>'; }
        else { t1 = 'Meaning'; t2 = 'Logogram'; f = '<p class="lbf-ans" style="font-style:normal">' + esc(L.en) + '</p><p class="lbf-q">Which logogram is it?</p>'; b = big(L.u, 'Linear B logogram ' + L.n) + '<p class="lbf-meta">' + esc(L.key) + ' · ' + esc(L.n) + '</p>'; }
      } else {
        var n = +cd.it, parts = E.numParts(n).map(function (p) { return p.count + ' × ' + p.place; }).join(' + ');
        if (cd.dir === '>') { t1 = 'Marks'; t2 = 'Number'; f = big(E.num(n), 'Aegean number') + '<p class="lbf-q">What number is it?</p>'; b = '<p class="lbf-num">' + n + '</p><p class="lbf-meta">' + esc(parts) + '</p>'; }
        else { t1 = 'Number'; t2 = 'Marks'; f = '<p class="lbf-num">' + n + '</p><p class="lbf-q">How is it written?</p>'; b = big(E.num(n), 'Aegean number') + '<p class="lbf-meta">' + esc(parts) + '</p>'; }
      }
      return [[t1, f], [t2, b]];
    }

    /* ---------- the session ---------- */
    var queue = [], cur = null, shown = 0, seen = {}, extra = false;
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function build() {
      var all = cardsOf(deck()), now = Date.now(), d = dayStats();
      var due = all.filter(function (c) { var s = st.cards[c.id]; return s && s.d <= now; });
      var fresh = all.filter(function (c) { return !st.cards[c.id]; });
      if (P.order === 'shuffle') { shuffle(due); shuffle(fresh); } else if (P.order === 'srs') due.sort(function (a, b) { return st.cards[a.id].d - st.cards[b.id].d; });
      var room = Math.max(0, +P.nw - d.nw);
      queue = due.concat(fresh.slice(0, room));
      if (P.order === 'shuffle') shuffle(queue);
      if (extra) { var later = all.filter(function (c) { var s = st.cards[c.id]; return s && s.d > now; }); if (P.order !== 'list') shuffle(later); queue = queue.concat(later, fresh.slice(room)); }
      seen = {}; next();
    }
    function counts() {
      var all = cardsOf(deck()), now = Date.now(), o = { total: all.length, learned: 0, mature: 0, due: 0, nw: 0 };
      all.forEach(function (c) { var s = st.cards[c.id]; if (!s) { o.nw++; return; } if (s.r > 0) o.learned++; if (s.i >= 21) o.mature++; if (s.d <= now) o.due++; });
      return o;
    }
    var stage = $('#fc-stage'), flipB = $('#fc-flip'), grade = $('#fc-grade');
    function render() {
      updateBar();
      if (!cur) {
        var c = counts(), nextDue = Infinity;
        cardsOf(deck()).forEach(function (cd) { var s = st.cards[cd.id]; if (s && s.d < nextDue) nextDue = s.d; });
        var when = nextDue < Infinity ? ivlText({ i: Math.max(0.0001, (nextDue - Date.now()) / DAY) }) : '';
        stage.innerHTML = '<div class="fc-done"><h3>All done for now 🎉</h3><p>' + (c.nw && dayStats().nw >= +P.nw ? 'You’ve had today’s ' + esc(P.nw) + ' new cards. ' : '') + (when ? 'The next review is due in about ' + esc(when) + '. ' : '') + 'Come back later, or keep going now.</p><p><button type="button" class="cbtn play" id="lbf-more">Study more anyway</button></p></div>';
        $('#lbf-more').addEventListener('click', function () { extra = true; build(); stage.focus(); });
        flipB.hidden = true; grade.hidden = true; return;
      }
      var F = faces(cur); shown = 0;
      stage.innerHTML = '<div class="fc-card flip" id="fc-card">' + F.map(function (f, i) { return '<div class="fc-face fc-f' + i + (i === 0 ? ' front' : '') + '"><span class="fc-tag">' + esc(f[0]) + '</span>' + f[1] + '</div>'; }).join('') + '</div>';
      flipB.hidden = false; flipB.textContent = 'Show answer'; grade.hidden = true;
      var s = st.cards[cur.id], now = Date.now();
      $$('.g', grade).forEach(function (b) { b.querySelector('small').textContent = ivlText(sched(s, +b.dataset.q, now)); });
      var look = $('#lbf-look'); if (look) { var base = look.getAttribute('href').split('?')[0].split('#')[0]; look.setAttribute('href', cur.d.kind === 's' ? base + '?q=' + encodeURIComponent(cur.it) : base + (cur.d.kind === 'l' ? '#logograms' : '#numbers')); }
    }
    function turn() {
      if (!cur || shown) return; shown = 1;
      var card = $('#fc-card'); card.classList.add('turned'); $$('.fc-face', card).forEach(function (f, i) { f.classList.toggle('front', i === 1); });
      flipB.hidden = true; grade.hidden = false; var g3 = $('.g3', grade); if (g3 && D.activeElement === flipB) g3.focus();
    }
    function updateBar() {
      var c = counts(), done = Object.keys(seen).length, left = queue.length + (cur ? 1 : 0);
      $('#fc-pos-lbl').textContent = cur ? (done + 1) + ' of ' + (done + left) : done ? done + ' studied' : '';
      $('#fc-prog').style.width = (done + left ? Math.round(100 * done / (done + left)) : 0) + '%';
      $('#fc-due').textContent = c.due + ' due · ' + c.nw + ' new';
      var d = dayStats(); $('#fc-today').textContent = 'Today: ' + d.rv + ' reviewed, ' + d.nw + ' new';
      $('#fc-nums').innerHTML = '<div><b>' + c.total + '</b>cards in this deck</div><div><b>' + c.learned + '</b>learned</div><div><b>' + c.mature + '</b>known well (3+ weeks)</div><div><b>' + c.due + '</b>due now</div><div><b>' + Object.keys(st.cards).length + '</b>cards studied (all decks)</div>';
    }
    function next() { cur = queue.shift() || null; render(); }
    function rate(q) {
      if (!cur || grade.hidden) return;
      var now = Date.now(), d = dayStats(), was = st.cards[cur.id];
      if (!was) d.nw++; d.rv++;
      st.cards[cur.id] = sched(was, q, now); seen[cur.id] = 1; save();
      if (q === 1) queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 3)), 0, cur);
      next();
    }
    flipB.addEventListener('click', turn);
    stage.addEventListener('click', function (e) { if (!e.target.closest('button')) turn(); });
    $$('.g', grade).forEach(function (b) { b.addEventListener('click', function () { rate(+b.dataset.q); stage.focus({ preventScroll: true }); }); });
    $('#fc-skip').addEventListener('click', function () { if (cur) { queue.push(cur); next(); } });
    D.addEventListener('keydown', function (e) {
      var t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return; if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.key === ' ' || e.key === 'Enter') && cur && !shown) { if (t && t.tagName === 'BUTTON' && t !== flipB) return; e.preventDefault(); turn(); }
      else if (/^[1-4]$/.test(e.key) && shown) { e.preventDefault(); rate(+e.key); }
      else if ((e.key === 's' || e.key === 'S') && cur) { queue.push(cur); next(); }
    });
    $('#fc-reset').addEventListener('click', function () {
      if (!W.confirm('Reset your progress for the deck “' + deck().name + '”? Other decks keep theirs.')) return;
      var dk = deck(); ['>', '<'].forEach(function (dir) { dk.items.forEach(function (it) { delete st.cards[dk.kind + dir + it]; }); });
      save(); extra = false; build();
    });

    /* ---------- settings ---------- */
    var deckBox = $('#lbf-decks');
    deckBox.innerHTML = DECKS.map(function (d) {
      var pic = d.kind === 's' ? d.items.slice(0, 3).map(function (v) { return E.sign(v).u; }).join('') : d.kind === 'l' ? d.items.slice(0, 2).map(function (k) { return E.LOGO[k].u; }).join('') : E.num(152);
      return '<button type="button" role="radio" class="lbf-deck" data-k="' + d.key + '"><span class="lbf-dpic sc-b" aria-hidden="true">' + esc(pic) + '</span><span><b>' + esc(d.name) + '</b><small>' + esc(d.sub) + ' · ' + d.items.length + '</small></span></button>';
    }).join('');
    function syncDecks() { $$('.lbf-deck', deckBox).forEach(function (b) { var on = b.dataset.k === deck().key; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; }); }
    deckBox.addEventListener('click', function (e) { var b = e.target.closest('.lbf-deck'); if (!b) return; P.deck = b.dataset.k; save(); syncDecks(); extra = false; build(); });
    deckBox.addEventListener('keydown', function (e) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }; if (!keys[e.key]) return; e.preventDefault();
      var i = DECKS.indexOf(deck()), j = (i + keys[e.key] + DECKS.length) % DECKS.length; P.deck = DECKS[j].key; save(); syncDecks(); extra = false; build(); $('.lbf-deck.on', deckBox).focus();
    });
    var dirBox = $('#lbf-dir');
    function syncDir() { $$('button', dirBox).forEach(function (b) { var on = b.dataset.v === P.dir; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
    dirBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; P.dir = b.dataset.v; save(); syncDir(); extra = false; build(); });
    var ord = $('#lbf-order'), nw = $('#lbf-new'); ord.value = P.order; nw.value = P.nw;
    ord.addEventListener('change', function () { P.order = ord.value; save(); build(); });
    nw.addEventListener('change', function () { P.nw = nw.value; save(); build(); });
    syncDecks(); syncDir(); build();
    W.__lbfStarted = true;
  });
})(window, document);
