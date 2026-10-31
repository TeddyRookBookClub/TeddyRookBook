/* Deck of cards memory trainer (/memory/challenges/deck-of-cards/). Needs core.js (TRBMem) and cards.js (TRBCards).
   A seeded shuffle (?seed=abc123&n=52) so a deck can be shared or tried again; views for memorizing; recall by tapping
   a sorted layout or typing shorthand; a score to the first mistake and in total; memorize and recall timers; bests in
   trb-memory-v1 (best["deck:<n>"] = fastest memorize time with a perfect recall, best["deckrun:<n>"] = most cards to the first mistake). */
(function () {
  'use strict';
  var M = window.TRBMem, K = window.TRBCards, root = document.getElementById('dk');
  if (!M || !K || !root) return;
  var qs = {}; try { new URLSearchParams(location.search).forEach(function (v, k) { qs[k] = v; }); } catch (e) { }
  var SIZES = [10, 20, 26, 52];
  var VIEWS = [['1', 'One at a time'], ['2', 'Two at a time'], ['3', 'Three at a time (PAO)'], ['fan', 'Fan'], ['grid', 'Grid'], ['list', 'List']];
  var st = {
    seed: /^[a-z0-9]{1,16}$/i.test(qs.seed || '') ? qs.seed.toLowerCase() : M.newSeed(),
    n: SIZES.indexOf(+qs.n) >= 0 ? +qs.n : 52, view: '1', pace: 0
  };
  try { var pv = JSON.parse(localStorage.getItem('trb-memory-v1') || '{}').deckPref; if (pv) { if (pv.view) st.view = pv.view; if (pv.pace != null) st.pace = pv.pace; if (!qs.n && SIZES.indexOf(pv.n) >= 0) st.n = pv.n; } } catch (e) { }
  var deck = [], pos = 0, tMem = 0, tRec = 0, memMs = 0, timer = null, auto = null, answer = [];

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'cls') e.className = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(t, f, c) { return h('button', { type: 'button', cls: 'mc-btn' + (c ? ' ' + c : ''), text: t, onclick: f }); }
  function savePref() { var o = M.load(); o.deckPref = { view: st.view, pace: st.pace, n: st.n }; M.save(o); }
  function stopTimers() { clearInterval(timer); clearInterval(auto); timer = auto = null; }
  function shareUrl() { return location.pathname + '?seed=' + st.seed + '&n=' + st.n; }
  function setUrl() { try { history.replaceState(null, '', shareUrl() + location.hash); } catch (e) { } }

  /* ---------- setup ---------- */
  function setup() {
    stopTimers(); root.innerHTML = '';
    var o = M.load();
    var size = h('div', { cls: 'mc-seg', role: 'group', 'aria-label': 'How many cards' });
    SIZES.forEach(function (n) {
      size.appendChild(h('button', { type: 'button', cls: 'mc-btn' + (st.n === n ? ' is-on' : ''), 'aria-pressed': st.n === n ? 'true' : 'false', text: n === 52 ? 'Full deck (52)' : n === 26 ? 'Half deck (26)' : n + ' cards', onclick: function () { st.n = n; savePref(); setUrl(); setup(); } }));
    });
    var view = h('select', { cls: 'mc-sel', id: 'dk-view' });
    VIEWS.forEach(function (v) { view.appendChild(h('option', { value: v[0], text: v[1], selected: st.view === v[0] ? 'selected' : null })); });
    view.onchange = function () { st.view = view.value; savePref(); setup(); };
    var pace = h('select', { cls: 'mc-sel', id: 'dk-pace' });
    [[0, 'When I tap'], [1, 'Every 1 second'], [2, 'Every 2 seconds'], [3, 'Every 3 seconds'], [5, 'Every 5 seconds']].forEach(function (p) { pace.appendChild(h('option', { value: p[0], text: p[1], selected: st.pace === p[0] ? 'selected' : null })); });
    pace.onchange = function () { st.pace = +pace.value; savePref(); };
    var seedIn = h('input', { type: 'text', cls: 'mc-in dk-seed', id: 'dk-seed', value: st.seed, maxlength: 16, autocomplete: 'off', spellcheck: 'false', 'aria-describedby': 'dk-seedhelp' });
    seedIn.onchange = function () { var v = seedIn.value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''); if (v) { st.seed = v; setUrl(); } seedIn.value = st.seed; };
    var bests = SIZES.map(function (n) { var b = o.best['deck:' + n], r = o.best['deckrun:' + n]; return b != null || r != null ? n + ' cards: ' + (b != null ? 'memorized in ' + M.fmtTime(b) : '') + (b != null && r != null ? ', ' : '') + (r != null && b == null ? 'best run ' + r + ' cards' : '') : null; }).filter(Boolean);
    root.appendChild(h('div', { cls: 'dk-setup' }, [
      h('div', { cls: 'mc-row' }, [h('span', { cls: 'mc-lab', text: 'Cards:' }), size]),
      h('div', { cls: 'mc-row' }, [h('label', { 'for': 'dk-view', cls: 'mc-lab', text: 'See them:' }), view, h('label', { 'for': 'dk-pace', cls: 'mc-lab', text: 'Next card:' }), pace]),
      h('div', { cls: 'mc-row' }, [h('label', { 'for': 'dk-seed', cls: 'mc-lab', text: 'Deck code:' }), seedIn, btn('New shuffle', function () { st.seed = M.newSeed(); seedIn.value = st.seed; setUrl(); }), btn('Copy link', function () { copy(location.origin + shareUrl(), this); })]),
      h('p', { cls: 'mc-small', id: 'dk-seedhelp', text: 'The same code always deals the same order, so you can try a deck again or send it to a friend.' }),
      h('div', { cls: 'mc-row' }, [btn('Start memorizing', memorize, 'mc-primary dk-start')]),
      bests.length ? h('p', { cls: 'mc-small', text: 'Your bests · ' + bests.join(' · ') }) : null
    ]));
  }
  function copy(text, b) {
    var done = function () { var t = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = t; }, 1400); };
    try { navigator.clipboard.writeText(text).then(done, function () { prompt('Copy this link:', text); }); } catch (e) { prompt('Copy this link:', text); }
  }

  /* ---------- memorize ---------- */
  function memorize() {
    stopTimers();
    deck = M.deal(st.seed, st.n); pos = 0; tMem = Date.now();
    root.innerHTML = '';
    var bar = h('div', { cls: 'dk-bar' }, [h('span', { cls: 'dk-time', id: 'dk-time', text: '0.0s' }), h('span', { cls: 'mc-small', text: ' memorizing · deck ' + st.seed })]);
    root.appendChild(bar);
    var stage = h('div', { cls: 'dk-stage', id: 'dk-stage' }); root.appendChild(stage);
    var ctrls = h('div', { cls: 'mc-row dk-ctrls' }); root.appendChild(ctrls);
    timer = setInterval(function () { var t = document.getElementById('dk-time'); if (t) t.textContent = M.fmtTime(Date.now() - tMem); }, 100);
    var step = st.view === '2' ? 2 : st.view === '3' ? 3 : 1;
    if (st.view === 'fan' || st.view === 'grid' || st.view === 'list') {
      showAll(stage, st.view);
      ctrls.appendChild(btn('Done: recall now', recall, 'mc-primary dk-done'));
    } else {
      var prev = btn('‹ Back', function () { if (pos > 0) { pos = Math.max(0, pos - step); draw(); } });
      var next = btn('Next ›', function () { advance(); }, 'mc-primary dk-next');
      ctrls.appendChild(prev); ctrls.appendChild(next); ctrls.appendChild(btn('Done: recall now', recall, 'dk-done'));
      ctrls.appendChild(h('span', { cls: 'mc-small', text: 'Keys: space or → next, ← back, Enter when done.' }));
      var advance = function () { if (pos + step >= deck.length) { recall(); return; } pos += step; draw(); };
      var draw = function () {
        stage.innerHTML = '';
        var grp = deck.slice(pos, pos + step), row = h('div', { cls: 'dk-group dk-g' + step });
        grp.forEach(function (c) { row.appendChild(h('div', { cls: 'dk-big', html: K.svg(c, { w: step === 1 ? 170 : step === 2 ? 140 : 110, title: M.cardName(c) }) })); });
        stage.appendChild(row);
        stage.appendChild(h('p', { cls: 'dk-count', text: (step === 1 ? 'Card ' + (pos + 1) : 'Cards ' + (pos + 1) + '–' + Math.min(deck.length, pos + step)) + ' of ' + deck.length }));
        if (step === 3) stage.appendChild(h('p', { cls: 'mc-small', text: 'PAO: the first card\'s person, doing the second card\'s action, with the third card\'s object. One picture, three cards.' }));
      };
      memorize.key = function (e) {
        if (e.target.closest && e.target.closest('input,textarea,select')) return;
        if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
        else if (e.key === 'Enter') { e.preventDefault(); recall(); }
      };
      draw();
      if (st.pace) auto = setInterval(advance, st.pace * 1000 * (step > 1 ? step * .8 : 1));
      setTimeout(function () { next.focus(); }, 20);
    }
  }
  document.addEventListener('keydown', function (e) { if (memorize.key && root.querySelector('.dk-next')) memorize.key(e); });
  function showAll(stage, v) {
    if (v === 'list') {
      var ol = h('ol', { cls: 'dk-list' });
      deck.forEach(function (c) { ol.appendChild(h('li', { cls: K.red(c) ? 'is-red' : '', text: K.label(c) + '  ' + M.cardName(c) })); });
      stage.appendChild(ol); return;
    }
    var box = h('div', { cls: v === 'fan' ? 'dk-fan' : 'dk-grid' });
    if (v === 'fan') {
      for (var i = 0; i < deck.length; i += 13) {
        var row = h('div', { cls: 'dk-fanrow' });
        deck.slice(i, i + 13).forEach(function (c, j) { row.appendChild(h('div', { cls: 'dk-fc', style: '--j:' + j, html: K.svg(c, { w: 64, title: (i + j + 1) + ': ' + M.cardName(c) }) })); });
        box.appendChild(h('p', { cls: 'mc-small', text: 'Cards ' + (i + 1) + '–' + Math.min(deck.length, i + 13) })); box.appendChild(row);
      }
    } else deck.forEach(function (c, j) { box.appendChild(h('div', { cls: 'dk-gc' }, [h('span', { cls: 'dk-n', text: String(j + 1) }), h('div', { html: K.svg(c, { w: 58, title: (j + 1) + ': ' + M.cardName(c) }) })])); });
    stage.appendChild(box);
  }

  /* ---------- recall ---------- */
  function recall() {
    stopTimers(); memorize.key = null;
    memMs = Date.now() - tMem; tRec = Date.now(); answer = [];
    root.innerHTML = '';
    root.appendChild(h('div', { cls: 'dk-bar' }, [h('span', { cls: 'dk-time', id: 'dk-time', text: '0.0s' }), h('span', { cls: 'mc-small', text: ' recalling · memorized in ' + M.fmtTime(memMs) })]));
    timer = setInterval(function () { var t = document.getElementById('dk-time'); if (t) t.textContent = M.fmtTime(Date.now() - tRec); }, 100);
    var tabs = h('div', { cls: 'mc-seg', role: 'group', 'aria-label': 'Recall by' });
    var tapB = btn('Tap the cards', function () { mode('tap'); }), typeB = btn('Type them', function () { mode('type'); });
    tabs.appendChild(tapB); tabs.appendChild(typeB);
    root.appendChild(h('div', { cls: 'mc-row' }, [tabs, btn('Settings', setup, 'mc-quiet')]));
    var area = h('div'); root.appendChild(area);
    var strip = h('ol', { cls: 'dk-strip', 'aria-label': 'Your order so far' });
    var info = h('p', { cls: 'mc-small', role: 'status' });
    var checkB = btn('Check', check, 'mc-primary dk-check');
    function mode(m) {
      tapB.classList.toggle('is-on', m === 'tap'); typeB.classList.toggle('is-on', m === 'type');
      tapB.setAttribute('aria-pressed', m === 'tap' ? 'true' : 'false'); typeB.setAttribute('aria-pressed', m === 'type' ? 'true' : 'false');
      area.innerHTML = '';
      if (m === 'tap') {
        area.appendChild(h('p', { cls: 'mc-small', text: 'Tap the cards in the order you saw them. Undo takes back the last one.' }));
        area.appendChild(strip);
        var lay = h('div', { cls: 'dk-sorted' });
        M.SUITS.forEach(function (s) {
          var row = h('div', { cls: 'dk-srow' });
          M.RANKS.forEach(function (r) {
            var c = r + s, inDeck = true;
            var b = h('button', { type: 'button', cls: 'dk-sc' + (K.red(c) ? ' is-red' : ''), 'data-c': c, 'aria-label': M.cardName(c), text: K.label(c) });
            b.onclick = function () { if (answer.length >= deck.length || answer.indexOf(c) >= 0) return; answer.push(c); sync(); };
            row.appendChild(b); return inDeck;
          });
          lay.appendChild(row);
        });
        area.appendChild(lay);
        area.appendChild(h('div', { cls: 'mc-row' }, [btn('Undo', function () { answer.pop(); sync(); }), btn('Clear', function () { answer = []; sync(); }), checkB, info]));
        sync();
      } else {
        var ta = h('textarea', { cls: 'mc-ta dk-ta', id: 'dk-ta', rows: 4, spellcheck: 'false', autocapitalize: 'characters', placeholder: 'e.g. KH 7S 10D AC' });
        ta.value = answer.join(' ');
        ta.oninput = function () { var r = M.parseCards(ta.value); answer = r.cards.slice(0, deck.length); sync(r.bad); };
        area.appendChild(h('label', { 'for': 'dk-ta', cls: 'mc-lab', text: 'Rank then suit: A 2–10 (or T) J Q K, and S H D C. Spaces optional.' }));
        area.appendChild(ta); area.appendChild(strip);
        area.appendChild(h('div', { cls: 'mc-row' }, [checkB, info]));
        sync(); setTimeout(function () { ta.focus(); }, 20);
      }
    }
    function sync(bad) {
      strip.innerHTML = '';
      answer.forEach(function (c, i) { strip.appendChild(h('li', { cls: K.red(c) ? 'is-red' : '', text: K.label(c) })); });
      root.querySelectorAll('.dk-sc').forEach(function (b) { b.disabled = answer.indexOf(b.dataset.c) >= 0; });
      var dup = answer.filter(function (c, i) { return answer.indexOf(c) !== i; });
      info.textContent = answer.length + ' of ' + deck.length + ' placed' + (dup.length ? ' · repeated: ' + dup.map(K.label).join(' ') : '') + (bad ? ' · not understood: ' + bad : '');
    }
    mode('tap');
  }
  function check() {
    stopTimers();
    var recMs = Date.now() - tRec, sc = M.score(deck, answer), o = M.load(), notes = [];
    if (sc.perfect && M.better(o, 'deck:' + st.n, memMs, true)) notes.push('New best memorize time for ' + st.n + ' cards!');
    if (sc.until > 0 && M.better(o, 'deckrun:' + st.n, sc.until, false)) notes.push('Your longest run so far.');
    o.deckRuns = (o.deckRuns || []).concat([{ d: M.today(), n: st.n, seed: st.seed, mem: memMs, rec: recMs, until: sc.until, total: sc.total }]).slice(-20);
    M.save(o);
    root.innerHTML = '';
    root.appendChild(h('p', { cls: 'mc-result', text: sc.perfect ? 'Perfect: all ' + sc.of + ' cards in order!' : sc.until + ' cards right before the first mistake · ' + sc.total + ' of ' + sc.of + ' in the right place' }));
    root.appendChild(h('p', { text: 'Memorized in ' + M.fmtTime(memMs) + ', recalled in ' + M.fmtTime(recMs) + '. ' + notes.join(' ') }));
    if (!sc.perfect) {
      var f = sc.first, had = answer[f];
      root.appendChild(h('p', { cls: 'dk-first', text: 'First mistake, card ' + (f + 1) + ': ' + (had ? 'you had ' + M.cardName(had) + ', it was ' : 'nothing there; it was ') + M.cardName(deck[f]) + '.' }));
    }
    var cmp = h('ol', { cls: 'dk-cmp', 'aria-label': 'Card by card' });
    deck.forEach(function (c, i) {
      var a = answer[i], ok = a === c;
      cmp.appendChild(h('li', { cls: ok ? 'is-ok' : 'is-no' + (i === sc.first ? ' is-first' : '') }, [
        h('span', { cls: 'dk-ci', text: String(i + 1) }),
        h('span', { cls: K.red(c) ? 'is-red' : '', text: K.label(c) }),
        ok ? null : h('span', { cls: 'dk-had', text: a ? K.label(a) : '–' })
      ]));
    });
    root.appendChild(h('p', { cls: 'mc-small', text: 'Each card: the true card, and in red what you put if it differs.' }));
    root.appendChild(cmp);
    root.appendChild(h('div', { cls: 'mc-row' }, [btn('Try this deck again', function () { memorize(); }, 'mc-primary'), btn('New shuffle', function () { st.seed = M.newSeed(); setUrl(); setup(); }), btn('Settings', setup)]));
  }
  setup();
  window.TRBDeck = { state: st, deal: function () { return deck; } };
})();
