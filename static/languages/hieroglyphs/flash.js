/* Hieroglyph flashcards (/languages/hieroglyphs/flashcards/) with spaced review (the same simplified SM-2 as the Greek and Latin
   flashcards, static/lang/flash.js). Decks are built from the model at run time (MathLadder.egypt: ALPHA, SIGNS, NUMERALS, WORDS).
   Progress: localStorage 'trb-hiero-v1' { cards: { id: { r, e, i, l, d, s } }, day: { d, nw, rv }, prefs: { flash: {...} } },
   every access in try/catch (hiero.js); without storage the cards still work for the visit. Needs hiero.js. */
(function (W, D) {
  'use strict';
  var T = W.TRBHiero; if (!T) return;
  T.ready(function (E) {
    var $ = T.$, $$ = T.$$, esc = T.esc;
    var st = T.load(); st.cards = st.cards || {}; st.day = st.day || {}; st.prefs = st.prefs || {};
    var P = st.prefs.flash = st.prefs.flash || {};
    if (!P.deck) P.deck = 'alpha'; if (!P.dir) P.dir = 'f'; if (!P.order) P.order = 'srs'; if (!P.nw) P.nw = '10';
    try { var qd = /[?&]deck=([a-z]+)/.exec(W.location.search); if (qd) P.deck = qd[1]; } catch (e) { }
    function save() { T.save(st); }
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
    var S = E.SIGNS, order = E.SIGN_ORDER.slice();
    function valsOf(c) { return S[c].v; }
    function sameSound(c, pool) { var v = valsOf(c); return pool.filter(function (o) { return o !== c && valsOf(o).some(function (x) { return v.indexOf(x) >= 0; }); }); }
    var alphaSigns = E.ALPHA.map(function (a) { return a[2]; });
    var uniAll = order.filter(function (c) { return S[c].k === 'uni'; });
    var DECKS = [
      { key: 'alpha', name: 'The alphabet', sub: 'the 25 one-sound signs', kind: 's', items: alphaSigns, pool: uniAll },
      { key: 'bi', name: 'Two-sound signs', sub: 'common biliterals', kind: 's', items: order.filter(function (c) { return S[c].k === 'bi'; }) },
      { key: 'tri', name: 'Three-sound and word signs', sub: 'triliterals and ideograms', kind: 's', items: order.filter(function (c) { return S[c].k === 'tri' || (S[c].k === 'logo' && S[c].v.length); }) },
      { key: 'det', name: 'Determinatives', sub: 'the silent signs for meaning', kind: 'd', items: order.filter(function (c) { return S[c].k === 'det'; }) },
      { key: 'num', name: 'Numbers', sub: 'the signs for 1 to a million', kind: 'n', items: E.NUMERALS.slice().reverse().map(function (n) { return n[1]; }) },
      { key: 'words', name: 'Words', sub: 'from the Egyptology Ladder', kind: 'w', items: Object.keys(E.WORDS) }
    ];
    DECKS.forEach(function (d) { if (!d.pool) d.pool = d.items; });
    function deck() { return DECKS.filter(function (d) { return d.key === P.deck; })[0] || DECKS[0]; }
    function cardsOf(d) {
      var dirs = P.dir === 'x' ? ['>', '<'] : P.dir === 'r' ? ['<'] : ['>'], out = [];
      d.items.forEach(function (it) { dirs.forEach(function (dir) { out.push({ id: d.kind + dir + it, it: it, dir: dir, d: d }); }); });
      return out;
    }
    function numVal(c) { var v = 0; E.NUMERALS.forEach(function (n) { if (n[1] === c) v = n[0]; }); return v; }
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function alphaRow(c) { return E.ALPHA.filter(function (a) { return a[2] === c; })[0]; }
    function big(c) { return '<span class="hf-big eg-h" aria-label="' + esc('Hieroglyph ' + c + ', ' + S[c].n) + '" role="img">' + S[c].u + '</span>'; }
    function soundHTML(c) {
      var v = valsOf(c), A = alphaRow(c);
      return '<div class="hf-vals">' + v.map(function (x) { return '<span class="eg-tl hf-tl">' + esc(x) + '</span>'; }).join('<span class="hf-or">or</span>') + '</div>' +
        '<p class="hf-say">say “' + v.map(function (x) { return esc(A ? A[3] : E.say(x)); }).join('” or “') + '” · type <kbd>' + v.map(function (x) { return esc(E.mdc(x)); }).join('</kbd> or <kbd>') + '</kbd></p>' + (A && A[4] ? '<p class="hf-note">' + esc(A[4]) + '</p>' : '');
    }
    function detFront(c) {
      var parts = S[c].use.split(';').map(function (x) { return x.trim(); }), d = parts.filter(function (x) { return /^determinative of /.test(x); })[0];
      return d ? 'The determinative of<br><b>' + esc(d.replace(/^determinative of /, '')) + '</b>' : 'The sign for<br><b>' + esc(parts[0]) + '</b>';
    }
    // front and back of a card
    function faces(cd) {
      var c = cd.it, k = cd.d.kind, f, b, tag1, tag2;
      if (k === 's') {
        var others = sameSound(c, cd.d.pool);
        if (cd.dir === '>') { tag1 = 'Sign'; tag2 = 'Sound'; f = big(c) + '<p class="hf-q">What sound does it write?</p>'; b = soundHTML(c) + '<p class="hf-meta">' + esc(c) + ' · ' + esc(S[c].n) + (S[c].use ? '<br>' + esc(S[c].use) : '') + '</p>'; }
        else { tag1 = 'Sound'; tag2 = 'Sign'; f = soundHTML(c).replace(/<p class="hf-note">[\s\S]*$/, '') + '<p class="hf-q">Which sign writes ' + (valsOf(c).length > 1 ? 'these sounds' : 'this') + '?</p>';
          b = big(c) + '<p class="hf-meta">' + esc(c) + ' · ' + esc(S[c].n) + '</p>' + (others.length ? '<p class="hf-also">Also written: ' + others.map(function (o) { return '<span class="eg-h">' + S[o].u + '</span> ' + esc(o); }).join(', ') + '</p>' : ''); }
      } else if (k === 'd') {
        if (cd.dir === '>') { tag1 = 'Sign'; tag2 = 'Meaning'; f = big(c) + '<p class="hf-q">What kind of word does it mark?</p>'; b = '<p class="hf-ans">' + esc(S[c].use) + '</p><p class="hf-meta">' + esc(c) + ' · ' + esc(S[c].n) + '</p>'; }
        else { tag1 = 'Meaning'; tag2 = 'Sign'; f = '<p class="hf-ans">' + detFront(c) + '</p><p class="hf-q">Which sign is it?</p>'; b = big(c) + '<p class="hf-meta">' + esc(c) + ' · ' + esc(S[c].n) + '</p>'; }
      } else if (k === 'n') {
        if (cd.dir === '>') { tag1 = 'Sign'; tag2 = 'Number'; f = big(c) + '<p class="hf-q">What number does it stand for?</p>'; b = '<p class="hf-num">' + fmt(numVal(c)) + '</p><p class="hf-meta">' + esc(c) + ' · ' + esc(S[c].n) + '</p>'; }
        else { tag1 = 'Number'; tag2 = 'Sign'; f = '<p class="hf-num">' + fmt(numVal(c)) + '</p><p class="hf-q">Which sign writes it?</p>'; b = big(c) + '<p class="hf-meta">' + esc(c) + ' · ' + esc(S[c].n) + '</p>'; }
      } else {
        var w = E.WORDS[c], pic = '<div class="hf-word">' + T.glyphSVG(w.sp, { U: 74, max: 520, label: 'Hieroglyphs' }) + '</div>';
        var rd = '<div class="hf-vals"><span class="eg-tl hf-tl">' + esc(E.show(w.tl)) + '</span></div><p class="hf-say">say “' + esc(E.say(w.tl)) + '” · type <kbd>' + esc(E.mdc(w.tl)) + '</kbd></p>';
        if (cd.dir === '>') { tag1 = 'Word'; tag2 = 'Reading'; f = pic + '<p class="hf-q">Read it: what does it say and mean?</p>'; b = rd + '<p class="hf-ans">“' + esc(w.en) + '”</p>' + (w.note ? '<p class="hf-note">' + esc(w.note) + '</p>' : ''); }
        else { tag1 = 'Meaning'; tag2 = 'Word'; f = '<p class="hf-ans hf-en">“' + esc(w.en) + '”</p><p class="hf-q">How is it written and read?</p>'; b = '<div class="hf-word">' + T.glyphSVG(w.sp, { U: 60, max: 520, label: 'Hieroglyphs for ' + E.show(w.tl) }) + '</div>' + rd + (w.note ? '<p class="hf-note">' + esc(w.note) + '</p>' : ''); }
      }
      return [[tag1, f], [tag2, b]];
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
        stage.innerHTML = '<div class="fc-done"><h3>All done for now 🎉</h3><p>' + (c.nw && dayStats().nw >= +P.nw ? 'You’ve had today’s ' + P.nw + ' new cards from this deck. ' : '') + (when ? 'The next review is due in about ' + esc(when) + '. ' : '') + 'Come back later, or keep going now.</p><p><button type="button" class="cbtn play" id="hf-more">Study more anyway</button></p></div>';
        $('#hf-more').addEventListener('click', function () { extra = true; build(); stage.focus(); });
        flipB.hidden = true; grade.hidden = true; return;
      }
      var F = faces(cur); shown = 0;
      stage.innerHTML = '<div class="fc-card flip" id="fc-card">' + F.map(function (f, i) { return '<div class="fc-face fc-f' + i + (i === 0 ? ' front' : '') + '"><span class="fc-tag hf-tag' + i + '">' + esc(f[0]) + '</span>' + f[1] + '</div>'; }).join('') + '</div>';
      flipB.hidden = false; flipB.textContent = 'Show answer'; grade.hidden = true;
      var s = st.cards[cur.id], now = Date.now();
      $$('.g', grade).forEach(function (b) { b.querySelector('small').textContent = ivlText(sched(s, +b.dataset.q, now)); });
      var look = $('#hf-look'); if (look) { var base = look.getAttribute('href').split('#')[0].split('?')[0]; look.setAttribute('href', cur.d.kind === 'w' ? base + '?q=' + encodeURIComponent(E.mdc(E.WORDS[cur.it].tl)) : base + '#sign-' + cur.it); }
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
      cardsOf(deck()).forEach(function (c) { delete st.cards[c.id]; });
      var dk = deck(); ['>', '<'].forEach(function (dir) { dk.items.forEach(function (it) { delete st.cards[dk.kind + dir + it]; }); });
      save(); extra = false; build();
    });

    /* ---------- settings ---------- */
    var deckBox = $('#hf-decks');
    deckBox.innerHTML = DECKS.map(function (d) {
      var sample = d.kind === 'w' ? T.glyphSVG(E.WORDS[d.items[0]].sp, { U: 26, max: 70, label: '' }) : '<span class="eg-h">' + d.items.slice(0, 3).map(function (c) { return S[c].u; }).join('') + '</span>';
      return '<button type="button" role="radio" class="hf-deck" data-k="' + d.key + '"><span class="hf-dpic" aria-hidden="true">' + sample + '</span><span><b>' + esc(d.name) + '</b><small>' + esc(d.sub) + ' · ' + d.items.length + '</small></span></button>';
    }).join('');
    function syncDecks() { $$('.hf-deck', deckBox).forEach(function (b) { var on = b.dataset.k === deck().key; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; }); }
    deckBox.addEventListener('click', function (e) { var b = e.target.closest('.hf-deck'); if (!b) return; P.deck = b.dataset.k; save(); syncDecks(); extra = false; build(); });
    deckBox.addEventListener('keydown', function (e) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }; if (!keys[e.key]) return; e.preventDefault();
      var i = DECKS.indexOf(deck()), j = (i + keys[e.key] + DECKS.length) % DECKS.length; P.deck = DECKS[j].key; save(); syncDecks(); extra = false; build(); $('.hf-deck.on', deckBox).focus();
    });
    var dirBox = $('#hf-dir');
    function syncDir() { $$('button', dirBox).forEach(function (b) { var on = b.dataset.v === P.dir; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
    dirBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; P.dir = b.dataset.v; save(); syncDir(); extra = false; build(); });
    var ord = $('#hf-order'), nw = $('#hf-new'); ord.value = P.order; nw.value = P.nw;
    ord.addEventListener('change', function () { P.order = ord.value; save(); build(); });
    nw.addEventListener('change', function () { P.nw = nw.value; save(); build(); });
    syncDecks(); syncDir();
    T.fontReady(function () { }); build();
    W.__hfStarted = true;
  });
})(window, document);
