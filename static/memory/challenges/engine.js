/* Memory challenges engine: turns one list (data/memory/lists/<slug>.yaml, inlined as #mc-data) into its practice modes.
   Modes: study, learn in chunks (1-3-7-21 reviews), recall in order, match, fill the gaps, timed, blank page, schedule, print.
   Needs core.js (window.TRBMem). Progress: localStorage trb-memory-v1 -> lists[slug] = {c: {"from-to": chunk state}, best: {...}}. */
(function () {
  'use strict';
  var M = window.TRBMem, dataEl = document.getElementById('mc-data'), app = document.getElementById('mc-app');
  if (!M || !dataEl || !app) return;
  var L; try { L = M.normList(JSON.parse(dataEl.textContent)); } catch (e) { return; }
  var slug = L.slug, items = L.items || [], N = items.length;
  var F = {}; (L.fields || []).forEach(function (f) { F[f.key] = f.label; });
  var P = (L.prompts || []).filter(function (p) { return F[p.ask] && p.from && p.from.length; });
  var MAIN = L.main || (P[0] && P[0].ask);
  var SHOW = L.show || Object.keys(F);
  var CUE = (P.filter(function (p) { return p.ask === MAIN; })[0] || P[0] || { from: [] }).from;   // what to show when asking for the main field
  var CH = M.chunks(items);
  var tabs = document.getElementById('mc-tabs'), study = document.getElementById('mc-study');

  /* ---------- helpers ---------- */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'cls') e.className = attrs[k];
      else e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(text, fn, cls) { return h('button', { type: 'button', cls: 'mc-btn' + (cls ? ' ' + cls : ''), text: text, onclick: fn }); }
  function val(it, k) { return it[k] == null ? '' : String(it[k]); }
  function rand(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) { return M.shuffle(a, Math.random); }
  function store() { var o = M.load(); return { o: o, S: M.listState(o, slug) }; }
  function ckey(c) { return c.from + '-' + c.to; }
  function today() { return M.today(); }
  function niceDate(s) { try { return M.parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); } catch (e) { return s; } }
  function cueText(it, from) { return from.map(function (k) { return F[k] + ': ' + val(it, k); }).join(' · '); }
  // every answer that is right for "ask from these cues" (two items can share a cue: Grover Cleveland is 22 and 24)
  function rightAnswers(p, it) {
    var out = [];
    items.forEach(function (x) {
      if (!M.noquiz(x, p.ask) && p.from.every(function (k) { return M.norm(val(x, k)) === M.norm(val(it, k)); })) out = out.concat(M.answersFor(x, p.ask, MAIN));
    });
    return out;
  }
  function pool(k) { return items.map(function (x) { return val(x, k); }); }
  function key(v) { return M.isMath(v) ? 's:' + M.strict(v) : M.norm(v); }
  var nq = M.noquiz, usable = M.usable, mathCache = {};
  // answers with math symbols (or a prompt marked choice: true) are picked from choices, never typed
  function choiceOnly(p) {
    var k = p.ask + '|' + p.from.join(','); if (mathCache[k] == null) mathCache[k] = !!p.choice || items.some(function (x) { return M.isMath(val(x, p.ask)); });
    return mathCache[k];
  }
  function colMath(k) { return items.some(function (x) { return M.isMath(val(x, k)); }); }
  function noteEl(it) { return it.note ? h('p', { cls: 'mc-inote', text: it.note }) : null; }
  function check(typed, p, it) { return M.match(typed, rightAnswers(p, it), pool(p.ask)); }
  // three wrong choices for a prompt: nearby items first for ordered lists (harder), else random
  function choices(p, it, k) {
    k = k || 4;
    var right = rightAnswers(p, it).map(key), seen = {}, opts = [];
    right.forEach(function (r) { seen[r] = 1; });
    var idx = items.indexOf(it), cand = items.map(function (x, i) { return { x: x, d: Math.abs(i - idx) + Math.random() * 6 }; });
    cand.sort(function (a, b) { return a.d - b.d; });
    if (!L.order_matters || /^\d+$/.test(val(it, p.ask))) cand = shuffle(cand);
    if (/^\d+$/.test(val(it, p.ask))) cand.sort(function (a, b) { return Math.abs(+val(a.x, p.ask) - +val(it, p.ask)) - Math.abs(+val(b.x, p.ask) - +val(it, p.ask)) + (Math.random() - .5) * 4; });
    for (var i = 0; i < cand.length && opts.length < k - 1; i++) {
      if (nq(cand[i].x, p.ask)) continue;           // a never-asked value is never a distractor either
      var v = val(cand[i].x, p.ask), n = key(v);
      if (!n || seen[n]) continue; seen[n] = 1; opts.push(v);
    }
    opts.push(val(it, p.ask));
    return shuffle(opts);
  }
  function promptFor(it) { return P.filter(function (p) { return p.ask === MAIN; })[0] || P[0]; }
  function feedback(r, it, p) {
    if (r.ok) return r.how === 'exact' ? 'Right.' : 'Right: ' + val(it, p.ask) + '.';
    if (r.ambiguous) return 'Which one? Give a little more.';
    return 'It was: ' + val(it, p.ask) + '.';
  }

  /* An answer box: type, or tap one of four choices. calls done(ok, typedText) once. */
  function askBox(it, p, opts, done) {
    opts = opts || {};
    if (choiceOnly(p)) opts.tap = true;
    var wrap = h('div', { cls: 'mc-ask' });
    var q = h('div', { cls: 'mc-q' }, [
      h('div', { cls: 'mc-cue', text: opts.cue != null ? opts.cue : cueText(it, p.from) }),
      h('div', { cls: 'mc-askfor', text: F[p.ask] + '?' })
    ]);
    wrap.appendChild(q);
    var fb = h('p', { cls: 'mc-fb', role: 'status' }), finished = false;
    function finish(ok, txt) {
      if (finished) return; finished = true;
      wrap.classList.add(ok ? 'is-ok' : 'is-no');
      var ne = noteEl(it); if (ne) wrap.appendChild(ne);
      var wait = ok ? (opts.fast ? 250 : 550) : (opts.fast ? 900 : 1500);
      if (ne) wait += Math.min(5000, 1200 + it.note.length * 25);
      setTimeout(function () { done(ok, txt); }, wait);
    }
    if (opts.tap) {
      var grid = h('div', { cls: 'mc-choices' });
      choices(p, it).forEach(function (c, i) {
        grid.appendChild(h('button', { type: 'button', cls: 'mc-choice', 'data-k': i + 1, onclick: function () {
          if (finished) return;
          var r = check(c, p, it); this.classList.add(r.ok ? 'is-ok' : 'is-no');
          if (!r.ok) grid.querySelectorAll('.mc-choice').forEach(function (b) { if (check(b.textContent, p, it).ok) b.classList.add('is-ok'); });
          fb.textContent = feedback(r, it, p); finish(r.ok, c);
        } }, [h('span', { cls: 'mc-kn', text: String(i + 1), 'aria-hidden': 'true' }), c]));
      });
      wrap.appendChild(grid);
      wrap.addEventListener('keydown', function (e) { var b = grid.querySelector('[data-k="' + e.key + '"]'); if (b) { e.preventDefault(); b.click(); } });
      wrap.tabIndex = -1;
    } else {
      var inp = h('input', { type: 'text', cls: 'mc-in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': F[p.ask] });
      var go = btn('Check', submit, 'mc-primary'), give = btn('Show me', function () { fb.textContent = 'It was: ' + val(it, p.ask) + '.'; finish(false, ''); });
      function submit() {
        if (finished) return;
        if (!inp.value.trim()) { inp.focus(); return; }
        var r = check(inp.value, p, it);
        if (r.ambiguous) { fb.textContent = feedback(r, it, p); inp.select(); return; }
        fb.textContent = feedback(r, it, p); inp.readOnly = true; finish(r.ok, inp.value);
      }
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      wrap.appendChild(h('div', { cls: 'mc-row' }, [inp, go, give]));
    }
    wrap.appendChild(fb);
    setTimeout(function () { var f = wrap.querySelector('.mc-in') || wrap; try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }, 30);
    return wrap;
  }
  function modeToggle(cur, fn) {
    var row = h('div', { cls: 'mc-seg', role: 'group', 'aria-label': 'Answer by' });
    [['type', 'Type'], ['tap', 'Tap choices']].forEach(function (x) {
      row.appendChild(h('button', { type: 'button', cls: 'mc-btn' + (cur === x[0] ? ' is-on' : ''), 'aria-pressed': cur === x[0] ? 'true' : 'false', text: x[1], onclick: function () { fn(x[0]); } }));
    });
    return row;
  }
  var pref = { how: 'type' };
  try { var sv = JSON.parse(sessionStorage.getItem('trb-mc-pref') || 'null'); if (sv) { if (sv.how) pref.how = sv.how; if (sv.timed) pref.timed = sv.timed; if (sv.recite) pref.recite = sv.recite; if (sv.hints != null) pref.hints = sv.hints; } } catch (e) { }
  function setHow(x) { pref.how = x; try { sessionStorage.setItem('trb-mc-pref', JSON.stringify(pref)); } catch (e) { } }

  /* ---------- modes ---------- */
  var MODES = {};

  /* Study: the table (with "cover a column" self-testing) and picture cards for items with hooks */
  MODES.study = function (box) {
    study.hidden = false;
    var cover = document.getElementById('mc-cover'); cover.hidden = false; cover.innerHTML = '';
    var cur = '';
    function setCover(k) {
      cur = k;
      study.querySelectorAll('td[data-k]').forEach(function (td) { td.classList.toggle('is-covered', td.dataset.k === k); td.tabIndex = td.dataset.k === k ? 0 : -1; if (td.dataset.k !== k) td.removeAttribute('tabindex'); });
      cover.querySelectorAll('button').forEach(function (b) { var on = b.dataset.k === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    }
    cover.appendChild(h('span', { cls: 'mc-lab', text: 'Cover a column and test yourself:' }));
    [''].concat(SHOW).forEach(function (k) { var b = btn(k ? F[k] : 'None', function () { setCover(k); }); b.dataset.k = k; cover.appendChild(b); });
    study.querySelector('tbody').onclick = function (e) { var td = e.target.closest('td.is-covered'); if (td) td.classList.add('is-shown'); };
    study.querySelector('tbody').onkeydown = function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('td.is-covered')) { e.preventDefault(); e.target.classList.add('is-shown'); } };
    setCover('');
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Read it through once, out loud if you can. Then cover a column, say each answer, and tap the cell to check. Reading again feels easy; pulling it from your head is what makes it stick.' }));
    var hooked = items.filter(function (it) { return it.hook; });
    if (hooked.length) {
      box.appendChild(h('h2', { cls: 'mc-h', text: 'Picture it: memory hooks' }));
      box.appendChild(h('p', { cls: 'mc-small', text: 'Tap a card to see its hook. A silly, vivid picture is easy to find again. Better still, make up your own.' }));
      var g = h('div', { cls: 'mc-cards' });
      hooked.forEach(function (it) {
        var c = h('button', { type: 'button', cls: 'mc-flip', 'aria-pressed': 'false' }, [
          h('span', { cls: 'mc-ff' }, [h('b', { text: val(it, MAIN) }), h('small', { text: SHOW.filter(function (k) { return k !== MAIN; }).map(function (k) { return val(it, k); }).join(' · ') })]),
          h('span', { cls: 'mc-fb2', text: it.hook })
        ]);
        c.onclick = function () { var on = c.classList.toggle('is-flipped'); c.setAttribute('aria-pressed', on ? 'true' : 'false'); };
        g.appendChild(c);
      });
      box.appendChild(g);
    }
  };

  /* Learn in chunks: due chunks first, then the next new one; look, cover, recall; schedule on day 1, 3, 7, 21 */
  MODES.learn = function (box) {
    var st = store(), S = st.S, t = today();
    var due = CH.filter(function (c) { return M.isDue(S.c[ckey(c)], t); });
    var next = CH.filter(function (c) { return !S.c[ckey(c)]; })[0];
    box.appendChild(h('p', { cls: 'mc-tip', text: 'This list comes in ' + CH.length + ' chunks of ' + chunkSizes() + '. The mind holds about four things at once, so learn one chunk, recall it with the answers hidden, and only then add the next. Each chunk comes back on day 1, 3, 7 and 21.' }));
    if (due.length) {
      box.appendChild(h('div', { cls: 'mc-callout' }, [h('b', { text: 'Review first' }), ' ', due.length + (due.length > 1 ? ' chunks are' : ' chunk is') + ' due today. Old chunks before new ones.', h('div', { cls: 'mc-row' }, [btn('Review ' + due[0].label, function () { session(due[0], true); }, 'mc-primary')])]));
    } else if (next) {
      box.appendChild(h('div', { cls: 'mc-callout' }, [h('b', { text: 'Next up' }), ' ' + next.label + ' (' + (next.to - next.from) + ' items).', h('div', { cls: 'mc-row' }, [btn('Learn it', function () { session(next, false); }, 'mc-primary')])]));
    } else box.appendChild(h('div', { cls: 'mc-callout' }, [h('b', { text: 'All chunks learned.' }), ' Nothing is due today. Try Recall in order or the Blank page to see it all at once.']));
    var ol = h('ol', { cls: 'mc-chunks' });
    CH.forEach(function (c) {
      var s = S.c[ckey(c)], isDue = M.isDue(s, t);
      var status = !s ? 'new' : isDue ? 'due today' : s.s >= M.OFF.length ? 'kept · next ' + niceDate(s.d) : 'next review ' + niceDate(s.d);
      ol.appendChild(h('li', { cls: (isDue ? 'is-due' : s ? 'is-learned' : '') }, [
        h('span', { cls: 'mc-cl' }, [h('b', { text: c.label }), h('small', { text: items.slice(c.from, c.to).map(function (x) { return val(x, MAIN); }).join(', ') })]),
        h('span', { cls: 'mc-cs', text: status }),
        btn(!s ? 'Learn' : isDue ? 'Review' : 'Practice', function () { session(c, !!s); })
      ]));
    });
    box.appendChild(ol);

    function session(c, isReview) {
      box.innerHTML = ''; study.hidden = true;
      var set = items.slice(c.from, c.to), p = promptFor(set[0]);
      var head = h('div', { cls: 'mc-shead' }, [h('b', { text: c.label }), h('span', { text: isReview ? ' · review' : ' · new chunk' })]);
      box.appendChild(head);
      var stage = h('div'); box.appendChild(stage);
      if (isReview) recall(set, true); else look(set);
      function look(list) {
        stage.innerHTML = '';
        stage.appendChild(h('p', { cls: 'mc-tip', text: 'Encode: read each one aloud and picture it. Make the picture silly or big; link each one to the next.' }));
        var tb = h('table', { cls: 'mc-table' }, [h('thead', null, [h('tr', null, SHOW.map(function (k) { return h('th', { scope: 'col', text: F[k] }); }))])]);
        var tbody = h('tbody'); list.forEach(function (it) { tbody.appendChild(h('tr', null, SHOW.map(function (k) { return h('td', { text: val(it, k) }); }))); });
        tb.appendChild(tbody); stage.appendChild(h('div', { cls: 'mc-tablewrap' }, [tb]));
        var hooks = list.filter(function (x) { return x.hook; });
        if (hooks.length) stage.appendChild(h('ul', { cls: 'mc-hooks' }, hooks.map(function (x) { return h('li', null, [h('b', { text: val(x, MAIN) + ': ' }), x.hook]); })));
        stage.appendChild(h('div', { cls: 'mc-row' }, [btn('Cover it and recall', function () { recall(list, false); }, 'mc-primary')]));
      }
      function recall(list, firstReview) {
        var order = (L.order_matters ? list.slice() : shuffle(list)).filter(function (x) { return usable(p, x); }), i = 0, miss = [];
        stage.innerHTML = '';
        var prog = h('p', { cls: 'mc-small' }); stage.appendChild(prog);
        stage.appendChild(modeToggle(pref.how, function (x) { setHow(x); recall(list, firstReview); }));
        var slot = h('div'); stage.appendChild(slot);
        function one() {
          if (i >= order.length) return end();
          prog.textContent = 'Retrieve: ' + (i + 1) + ' of ' + order.length + (miss.length ? ' · ' + miss.length + ' to look at again' : '');
          slot.innerHTML = '';
          var it = order[i];
          slot.appendChild(askBox(it, p, { tap: pref.how === 'tap' }, function (ok) { if (!ok) miss.push(it); i++; one(); }));
        }
        function end() {
          var s2 = store(), k = ckey(c), t2 = today(), cur = s2.S.c[k];
          slot.innerHTML = ''; prog.textContent = '';
          var right = order.length - miss.length;
          if (firstReview) {   // a review counts once: right first time moves it along, a miss brings it back tomorrow
            s2.S.c[k] = M.review(cur, miss.length === 0, t2); M.save(s2.o); firstReview = false;
          } else if (!miss.length && !cur) { s2.S.c[k] = M.learn(t2); M.save(s2.o); }
          var now = s2.S.c[k];
          slot.appendChild(h('p', { cls: 'mc-result', text: right + ' of ' + order.length + ' right.' }));
          if (miss.length) {
            slot.appendChild(h('p', { text: 'Look again at the ones that slipped, then recall just those. Missed items come back sooner; that is the system working, not a failure.' }));
            slot.appendChild(h('div', { cls: 'mc-row' }, [btn('Look at the misses', function () { look(miss.slice()); }, 'mc-primary'), btn('Back to chunks', function () { render('learn'); })]));
            if (cur || now) slot.appendChild(h('p', { cls: 'mc-small', text: now ? 'Next review: ' + niceDate(now.d) + '.' : '' }));
          } else {
            var msg = now ? (now.s >= M.OFF.length ? 'Kept. It will check in again around ' + niceDate(now.d) + '.' : 'Next review: ' + niceDate(now.d) + ' (day ' + M.OFF[now.s] + ').') : '';
            slot.appendChild(h('p', { text: msg }));
            if (now && now.s === 0) slot.appendChild(planView(now.a));
            var after = CH.filter(function (x) { return !s2.S.c[ckey(x)]; })[0];
            slot.appendChild(h('div', { cls: 'mc-row' }, [after ? btn('Next chunk: ' + after.label, function () { session(after, false); }, 'mc-primary') : null, btn('Back to chunks', function () { render('learn'); })]));
          }
        }
        one();
      }
    }
  };
  function chunkSizes() {
    var a = CH.map(function (c) { return c.to - c.from; }), lo = Math.min.apply(0, a), hi = Math.max.apply(0, a);
    return lo === hi ? String(lo) : lo + ' to ' + hi;
  }
  function planView(a) {
    var ul = h('ul', { cls: 'mc-plan', 'aria-label': 'Review days' });
    ul.appendChild(h('li', null, [h('b', { text: 'Learned' }), niceDate(a)]));
    M.plan(a).forEach(function (x) { ul.appendChild(h('li', null, [h('b', { text: 'Day ' + x.day }), niceDate(x.date)])); });
    return ul;
  }

  /* Recall in order: the whole list or a stretch of it, typed or tapped, timed */
  MODES.recall = function (box) {
    var p = { ask: MAIN, from: [] };
    var sel = h('select', { cls: 'mc-sel', 'aria-label': 'Which part' });
    sel.appendChild(h('option', { value: '0-' + N, text: 'The whole list (' + N + ')' }));
    CH.forEach(function (c) { sel.appendChild(h('option', { value: c.from + '-' + c.to, text: c.label })); });
    if (CH.length > 2) for (var i = 0; i + 1 < CH.length; i += 2) sel.appendChild(h('option', { value: CH[i].from + '-' + CH[i + 1].to, text: CH[i].label + ' + next' }));
    var stop = h('input', { type: 'checkbox', id: 'mc-stop' });
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Say the list in order from memory. Each answer shows the one before it, the way a chain of pictures leads to the next link.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [h('label', { 'for': 'mc-part', cls: 'mc-lab', text: 'Part:' }), sel]));
    sel.id = 'mc-part';
    box.appendChild(h('div', { cls: 'mc-row' }, [stop, h('label', { 'for': 'mc-stop', text: 'Stop at the first mistake' })]));
    box.appendChild(modeToggle(pref.how, function (x) { setHow(x); render('recall'); }));
    var best = store().S.best.order;
    if (best) box.appendChild(h('p', { cls: 'mc-small', text: 'Best time for the whole list with no misses: ' + M.fmtTime(best) + '.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [btn('Start', start, 'mc-primary')]));
    function start() {
      var r = sel.value.split('-'), a = +r[0], b = +r[1], list = items.slice(a, b), i = 0, right = 0, t0 = Date.now(), misses = [], skipped = 0;
      var stopAt = stop.checked;
      box.innerHTML = ''; study.hidden = true;
      var top = h('div', { cls: 'mc-shead' }); box.appendChild(top);
      var trail = h('ol', { cls: 'mc-trail', start: a + 1 }); box.appendChild(trail);
      var slot = h('div'); box.appendChild(slot);
      var clock = setInterval(function () { top.textContent = (i + 1 > list.length ? list.length : i + 1) + ' of ' + list.length + ' · ' + M.fmtTime(Date.now() - t0); }, 200);
      function one() {
        if (i >= list.length) return end();
        var it = list[i], prev = i ? val(list[i - 1], MAIN) : null;
        slot.innerHTML = '';
        if (nq(it, MAIN)) { trail.appendChild(h('li', { cls: 'is-skip', text: val(it, MAIN) })); skipped++; i++; return one(); }   // never asked: shown, not scored
        var cueOk = CUE.length && CUE[0] !== MAIN && !nq(it, CUE[0]);
        var cue = (cueOk ? cueText(it, CUE.slice(0, 1)) : 'Item ' + (a + i + 1)) + (prev ? ' · after ' + prev : ' · first');
        slot.appendChild(askBox(it, { ask: MAIN, from: cueOk ? CUE.slice(0, 1) : [] }, { tap: pref.how === 'tap', cue: cue, fast: true }, function (ok) {
          trail.appendChild(h('li', { cls: ok ? 'is-ok' : 'is-no', text: val(it, MAIN) }));
          if (ok) right++; else misses.push(a + i + 1);
          i++;
          if (!ok && stopAt) return end(true);
          one();
        }));
      }
      function end(stopped) {
        clearInterval(clock);
        var ms = Date.now() - t0;
        slot.innerHTML = '';
        var asked = list.length - skipped;
        top.textContent = right + ' of ' + asked + ' right · ' + M.fmtTime(ms);
        var s = store(), msg = '';
        if (!misses.length && !stopped && a === 0 && b === N) {
          var b0 = s.S.best.order; if (b0 == null || ms < b0) { s.S.best.order = ms; M.save(s.o); msg = ' A new best time!'; }
        }
        slot.appendChild(h('p', { cls: 'mc-result', text: (stopped ? 'Stopped at number ' + (a + i) + '. ' : '') + right + ' of ' + (stopped ? i - skipped : asked) + ' right in ' + M.fmtTime(ms) + '.' + msg }));
        if (misses.length) slot.appendChild(h('p', { text: 'Look again at number' + (misses.length > 1 ? 's ' : ' ') + misses.join(', ') + '. Those are the links to strengthen first.' }));
        slot.appendChild(h('div', { cls: 'mc-row' }, [btn('Again', function () { render('recall'); }, 'mc-primary'), btn('Study the list', function () { go('study'); })]));
      }
      one();
    }
  };

  /* Match: pairs, five at a time, for any prompt direction */
  MODES.match = function (box) {
    var sel = h('select', { cls: 'mc-sel', id: 'mc-mp', 'aria-label': 'Match what to what' });
    P.forEach(function (p, i) { sel.appendChild(h('option', { value: i, text: p.from.map(function (k) { return F[k]; }).join(' + ') + ' → ' + F[p.ask] })); });
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Tap one on the left, then its partner on the right. Five pairs a round.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [h('label', { 'for': 'mc-mp', cls: 'mc-lab', text: 'Match:' }), sel]));
    var area = h('div'); box.appendChild(area);
    sel.onchange = round; var pool5 = [], rounds = 0, misses = 0, done = 0;
    function round() {
      var p = P[+sel.value || 0];
      if (pool5.length < 5) pool5 = pool5.concat(shuffle(items.filter(function (x) { return usable(p, x); })));
      // five items whose left and right texts are all different
      var pick = [], L1 = {}, R1 = {};
      while (pick.length < 5 && pool5.length) {
        var it = pool5.shift(); if (!usable(p, it)) continue;
        var lt = cueText(it, p.from), rt = key(val(it, p.ask));
        if (L1[lt] || R1[rt]) continue; L1[lt] = R1[rt] = 1; pick.push(it);
      }
      area.innerHTML = '';
      var left = h('div', { cls: 'mc-mcol' }), right = h('div', { cls: 'mc-mcol' }), on = null, got = 0;
      pick.forEach(function (it, i) { left.appendChild(h('button', { type: 'button', cls: 'mc-mb', 'data-i': i, text: p.from.map(function (k) { return val(it, k); }).join(' · ') })); });
      shuffle(pick.map(function (it, i) { return i; })).forEach(function (i) { right.appendChild(h('button', { type: 'button', cls: 'mc-mb', 'data-i': i, text: val(pick[i], p.ask) })); });
      left.onclick = function (e) { var b = e.target.closest('.mc-mb'); if (!b || b.disabled) return; if (on) on.classList.remove('is-on'); on = b; b.classList.add('is-on'); };
      right.onclick = function (e) {
        var b = e.target.closest('.mc-mb'); if (!b || b.disabled || !on) return;
        if (b.dataset.i === on.dataset.i || M.norm(b.textContent) === M.norm(val(pick[+on.dataset.i], p.ask))) {
          [b, on].forEach(function (x) { x.disabled = true; x.classList.remove('is-on'); x.classList.add('is-ok'); }); on = null; got++; done++;
          if (got === pick.length) { rounds++; area.appendChild(h('p', { cls: 'mc-result', text: 'Round ' + rounds + ' done. ' + done + ' matched, ' + misses + ' tries to fix so far.' })); area.appendChild(h('div', { cls: 'mc-row' }, [btn('Next round', round, 'mc-primary')])); area.querySelector('.mc-row .mc-primary').focus(); }
        } else { misses++; b.classList.add('is-no'); setTimeout(function () { b.classList.remove('is-no'); }, 500); }
      };
      area.appendChild(h('div', { cls: 'mc-match' }, [left, right]));
    }
    round();
  };

  /* Fill the gaps: the list with some answers blanked */
  MODES.gaps = function (box) {
    var dens = h('select', { cls: 'mc-sel', id: 'mc-dens' }, [h('option', { value: '.3', text: 'A few gaps' }), h('option', { value: '.5', text: 'Half' }), h('option', { value: '1', text: 'All of them' })]);
    var colSel = h('select', { cls: 'mc-sel', id: 'mc-gcol' });
    SHOW.forEach(function (k) { colSel.appendChild(h('option', { value: k, text: F[k], selected: k === MAIN ? 'selected' : null })); });
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Fill in the blanks from memory, then check. Enter moves to the next gap.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [h('label', { 'for': 'mc-gcol', cls: 'mc-lab', text: 'Blank out:' }), colSel, h('label', { 'for': 'mc-dens', cls: 'mc-lab', text: 'How many:' }), dens, btn('New gaps', make)]));
    var area = h('div'); box.appendChild(area);
    dens.onchange = colSel.onchange = make;
    function make() {
      var k = colSel.value, d = +dens.value, p = { ask: k, from: SHOW.filter(function (x) { return x !== k; }).slice(0, 1) };
      // rows with a never-asked field are not in the quiz at all
      var idx = items.map(function (x, i) { return i; }).filter(function (i) { return !SHOW.some(function (c) { return nq(items[i], c); }); }), gaps = {};
      shuffle(idx).slice(0, Math.max(1, Math.round(idx.length * d))).forEach(function (i) { gaps[i] = 1; });
      var asMenu = colMath(k) || P.some(function (q) { return q.ask === k && q.choice; }), menu = [];
      if (asMenu) { var seenV = {}; items.forEach(function (x) { var v = val(x, k), kk = key(v); if (!nq(x, k) && v && !seenV[kk]) { seenV[kk] = 1; menu.push(v); } }); menu = shuffle(menu); }
      area.innerHTML = '';
      var tbody = h('tbody'), inputs = [];
      items.forEach(function (it, i) {
        if (SHOW.some(function (c) { return nq(it, c); })) return;   // rows with a never-asked field are left out of this quiz
        tbody.appendChild(h('tr', null, SHOW.map(function (c) {
          if (c === k && gaps[i] && asMenu) { var se = h('select', { cls: 'mc-sel mc-gap', 'aria-label': F[c] + ', row ' + (i + 1) }, [h('option', { value: '', text: 'Choose…' })].concat(menu.map(function (v) { return h('option', { value: v, text: v }); }))); se._it = it; inputs.push(se); return h('td', null, [se]); }
          if (c === k && gaps[i]) { var inp = h('input', { type: 'text', cls: 'mc-in mc-gap', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': F[c] + ', row ' + (i + 1) }); inp._it = it; inputs.push(inp); return h('td', null, [inp]); }
          return h('td', { text: val(it, c) });
        })));
      });
      inputs.forEach(function (inp, j) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (inputs[j + 1]) inputs[j + 1].focus(); else checkAll(); } }); });
      var tb = h('table', { cls: 'mc-table mc-gtable' }, [h('thead', null, [h('tr', null, SHOW.map(function (c) { return h('th', { scope: 'col', text: F[c] }); }))]), tbody]);
      area.appendChild(h('div', { cls: 'mc-tablewrap' }, [tb]));
      var res = h('p', { cls: 'mc-result', role: 'status' });
      area.appendChild(h('div', { cls: 'mc-row' }, [btn('Check', checkAll, 'mc-primary'), res]));
      function checkAll() {
        var ok = 0;
        inputs.forEach(function (inp) {
          var r = M.match(inp.value, M.answersFor(inp._it, k, MAIN), pool(k));
          inp.classList.toggle('is-ok', r.ok); inp.classList.toggle('is-no', !r.ok);
          var td = inp.parentNode, sh = td.querySelector('.mc-was');
          if (!r.ok && !sh) td.appendChild(h('span', { cls: 'mc-was', text: val(inp._it, k) }));
          if (r.ok && sh) sh.remove();
          if (r.ok) ok++;
        });
        res.textContent = ok + ' of ' + inputs.length + ' right.';
      }
      if (inputs[0]) inputs[0].focus({ preventScroll: true });
    }
    make();
  };

  /* Timed: as many as you can in 60 seconds, any prompt, tap (or type) */
  MODES.timed = function (box) {
    var s0 = store().S.best;
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Sixty seconds, questions from every direction. Speed comes from retrieval you have practiced, so this is a good check after a few days of review. Keys 1 to 4 pick a choice.' }));
    box.appendChild(modeToggle(pref.timed || 'tap', function (x) { pref.timed = x; setHow(pref.how); render('timed'); }));
    if (s0.timed != null) box.appendChild(h('p', { cls: 'mc-small', text: 'Your best: ' + s0.timed + ' right in 60 seconds.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [btn('Start the clock', start, 'mc-primary')]));
    function start() {
      box.innerHTML = ''; study.hidden = true;
      var end = Date.now() + 60000, right = 0, asked = 0, over = false, deck = [];
      var top = h('div', { cls: 'mc-shead mc-clock' }); box.appendChild(top);
      var slot = h('div'); box.appendChild(slot);
      var tick = setInterval(function () { var left = Math.max(0, end - Date.now()); top.textContent = Math.ceil(left / 1000) + 's · ' + right + ' right'; if (!left) finish(); }, 200);
      function one() {
        if (over) return;
        if (!deck.length) deck = shuffle(items.slice());
        var it = deck.pop(), ok = P.filter(function (q) { return usable(q, it); });
        if (!ok.length) return one();
        var p = ok[rand(ok.length)];
        slot.innerHTML = '';
        slot.appendChild(askBox(it, p, { tap: (pref.timed || 'tap') === 'tap', fast: true }, function (ok) { asked++; if (ok) right++; one(); }));
      }
      function finish() {
        if (over) return; over = true; clearInterval(tick);
        var s = store(), nb = s.S.best.timed == null || right > s.S.best.timed;
        if (nb && right) { s.S.best.timed = right; M.save(s.o); }
        slot.innerHTML = '';
        top.textContent = 'Time!';
        slot.appendChild(h('p', { cls: 'mc-result', text: right + ' right out of ' + asked + '.' + (nb && right ? ' A new best!' : '') }));
        slot.appendChild(h('div', { cls: 'mc-row' }, [btn('Go again', function () { render('timed'); }, 'mc-primary')]));
      }
      one();
    }
  };

  /* Blank page: write all you remember, then compare */
  MODES.blank = function (box) {
    var ta = h('textarea', { cls: 'mc-ta', rows: 10, id: 'mc-ta', spellcheck: 'false', placeholder: 'One per line' + (L.order_matters ? ', in order' : '') });
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Close the book and write every ' + F[MAIN].toLowerCase() + ' you can remember' + (L.order_matters ? ', in order' : '') + '. Then compare. This is the hardest test and the best one: what you can pull out on a blank page is what you know.' }));
    box.appendChild(h('label', { 'for': 'mc-ta', cls: 'mc-lab', text: F[MAIN] + ' (one per line, or separated by commas)' }));
    box.appendChild(ta);
    var best = store().S.best.blank;
    var NB = items.filter(function (x) { return !nq(x, MAIN); }).length;   // never-asked items are not part of the count
    if (best != null) box.appendChild(h('p', { cls: 'mc-small', text: 'Your best: ' + best + ' of ' + NB + '.' }));
    var out = h('div', { role: 'status' });
    box.appendChild(h('div', { cls: 'mc-row' }, [btn('Compare', compare, 'mc-primary'), btn('Clear', function () { ta.value = ''; out.innerHTML = ''; ta.focus(); })]));
    box.appendChild(out);
    function compare() {
      var lines = ta.value.split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (lines.length === 1) lines = lines[0].split(/[,;]/).map(function (s) { return s.trim(); }).filter(Boolean);
      lines = lines.map(function (s) { return s.replace(/^\d+[\.\):]\s*/, ''); });
      var used = {}, hits = [], extra = [];
      lines.forEach(function (ln) {
        var found = -1;
        for (var i = 0; i < N && found < 0; i++) if (!used[i] && !nq(items[i], MAIN) && M.match(ln, M.answersFor(items[i], MAIN, MAIN), pool(MAIN)).ok) found = i;
        if (found < 0) extra.push(ln); else { used[found] = 1; hits.push(found); }
      });
      var inOrder = lis(hits);
      out.innerHTML = '';
      out.appendChild(h('p', { cls: 'mc-result', text: hits.length + ' of ' + NB + ' remembered' + (L.order_matters ? ', ' + inOrder + ' of them in the right order' : '') + '.' }));
      var ul = h('ol', { cls: 'mc-cmp' });
      items.forEach(function (it, i) { ul.appendChild(nq(it, MAIN) ? h('li', { cls: 'is-skip', text: val(it, MAIN) + ' (not asked)' }) : h('li', { cls: used[i] ? 'is-ok' : 'is-no', text: val(it, MAIN) + (used[i] ? '' : ' (missed)') })); });
      out.appendChild(ul);
      if (extra.length) out.appendChild(h('p', { cls: 'mc-small', text: 'Not on the list (check the spelling): ' + extra.join(', ') }));
      var s = store(); if (s.S.best.blank == null || hits.length > s.S.best.blank) { s.S.best.blank = hits.length; M.save(s.o); }
    }
    function lis(a) {   // longest increasing run kept in order
      var t = [];
      a.forEach(function (x) { var lo = 0, hi = t.length; while (lo < hi) { var m = (lo + hi) >> 1; if (t[m] < x) lo = m + 1; else hi = m; } t[lo] = x; });
      return t.length;
    }
  };

  /* Schedule: each chunk's review days */
  MODES.schedule = function (box) {
    var st = store(), S = st.S, t = today();
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Forgetting is normal: each review, just as it starts to slip, makes the memory fade more slowly next time. So every chunk comes back on day 1, 3, 7 and 21 after you learn it, then about once a month. A miss starts that chunk over from day 1.' }));
    var learned = CH.filter(function (c) { return S.c[ckey(c)]; });
    if (!learned.length) { box.appendChild(h('p', { text: 'Nothing learned yet. Start with Learn in chunks; your review days will show up here.' })); }
    else {
      var tb = h('tbody');
      CH.forEach(function (c) {
        var s = S.c[ckey(c)];
        var cells = [h('th', { scope: 'row', text: c.label })];
        if (!s) { cells.push(h('td', { colspan: 6, cls: 'mc-dim', text: 'not started' })); }
        else {
          cells.push(h('td', { text: niceDate(s.a) }));
          M.plan(s.a).forEach(function (x, j) { cells.push(h('td', { cls: j < s.s ? 'is-ok' : (j === s.s && s.d <= t ? 'is-due' : ''), text: (j < s.s ? '✓ ' : '') + niceDate(x.date) })); });
          cells.push(h('td', { cls: s.d <= t ? 'is-due' : '', text: s.d <= t ? 'today' : niceDate(s.d) }));
        }
        tb.appendChild(h('tr', null, cells));
      });
      box.appendChild(h('div', { cls: 'mc-tablewrap' }, [h('table', { cls: 'mc-table mc-sched' }, [h('thead', null, [h('tr', null, ['Chunk', 'Learned', 'Day 1', 'Day 3', 'Day 7', 'Day 21', 'Next'].map(function (x) { return h('th', { scope: 'col', text: x }); }))]), tb])]));
    }
    var b = S.best, bits = [];
    if (b.order) bits.push('whole list in order: ' + M.fmtTime(b.order));
    if (b.timed != null) bits.push('timed: ' + b.timed + ' right');
    if (b.blank != null) bits.push('blank page: ' + b.blank + ' of ' + N);
    if (bits.length) box.appendChild(h('p', { text: 'Your bests: ' + bits.join(' · ') + '.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [btn('Reset this list', function () {
      if (!confirm('Clear your progress and bests for this list on this device?')) return;
      var s = store(); delete s.o.lists[slug]; M.save(s.o); render('schedule');
    }, 'mc-quiet')]));
  };

  /* Recite (lists with recite: true, items {n, line} in order): line by line or word by word, with first-letter hints */
  MODES.recite = function (box) {
    var LN = MAIN, how = pref.recite || 'line', hints = pref.hints !== false;
    var seg = h('div', { cls: 'mc-seg', role: 'group', 'aria-label': 'Recite by' });
    [['line', 'Line by line'], ['word', 'Word by word']].forEach(function (x) { seg.appendChild(h('button', { type: 'button', cls: 'mc-btn' + (how === x[0] ? ' is-on' : ''), 'aria-pressed': how === x[0] ? 'true' : 'false', text: x[1], onclick: function () { pref.recite = x[0]; setHow(pref.how); render('recite'); } })); });
    var hb = h('input', { type: 'checkbox', id: 'mc-hints' }); hb.checked = hints; hb.onchange = function () { pref.hints = hb.checked; setHow(pref.how); render('recite'); };
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Say it from memory, in order. First-letter hints show the start of each word, the way a memory-work card does; turn them off when you are ready.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [seg, h('span', { cls: 'mc-nowrap' }, [hb, ' ', h('label', { 'for': 'mc-hints', text: 'First-letter hints' })])]));
    var best = store().S.best.recite;
    if (best != null) box.appendChild(h('p', { cls: 'mc-small', text: 'Your best: ' + best + '% with no hints shown.' }));
    var text = h('div', { cls: 'mc-recite', 'aria-live': 'polite' }); box.appendChild(text);
    var slot = h('div'); box.appendChild(slot);
    function initials(s) { return s.split(/\s+/).map(function (w) { return w.replace(/[A-Za-z\u00c0-\u024f0-9]+/, function (m) { return m[0] + m.slice(1).replace(/./g, '\u00b7'); }); }).join(' '); }
    var i = 0, right = 0, total = 0;
    if (how === 'line') {
      (function one() {
        if (i >= N) return end();
        var it = items[i]; slot.innerHTML = '';
        var NK = (L.fields || []).map(function (f) { return f.key; }).filter(function (k) { return k !== LN; })[0];
        var p = { ask: LN, from: NK ? [NK] : [] };
        var hint = hints ? h('p', { cls: 'mc-hint', text: initials(val(it, LN)) }) : null;
        slot.appendChild(askBox(it, p, { cue: 'Line ' + (i + 1) + ' of ' + N, fast: true }, function (ok) {
          total++; if (ok) right++;
          text.appendChild(h('span', { cls: ok ? 'is-ok' : 'is-no', text: val(it, LN) + ' ' })); i++; one();
        }));
        if (hint) slot.querySelector('.mc-q').appendChild(hint);
      })();
    } else {
      var words = []; items.forEach(function (it) { val(it, LN).split(/\s+/).filter(Boolean).forEach(function (w) { words.push(w); }); });
      var inp = h('input', { type: 'text', cls: 'mc-in', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Next word' });
      var hint = h('span', { cls: 'mc-hint' }), shown = 0;
      slot.appendChild(h('div', { cls: 'mc-row' }, [inp, hint, btn('Show the word', function () { put(false); })]));
      function plain(w) { return M.norm(w); }
      function put(ok) { text.appendChild(h('span', { cls: ok ? 'is-ok' : 'is-no', text: words[i] + ' ' })); total++; if (ok) right++; i++; inp.value = ''; nextHint(); if (i >= words.length) end(); }
      function nextHint() { hint.textContent = i < words.length && hints ? words[i].replace(/^([^A-Za-z0-9]*[A-Za-z0-9]).*$/, '$1…') : ''; }
      inp.addEventListener('keydown', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault(); var v = inp.value.trim(); if (!v || i >= words.length) return;
        var w = words[i], ok = plain(v) === plain(w) || (plain(w).length >= 6 && M.lev(plain(v), plain(w)) <= 1);
        put(ok);
      });
      nextHint(); setTimeout(function () { inp.focus(); }, 30);
      slot.appendChild(h('p', { cls: 'mc-small', text: 'Type each word and press space. Punctuation and capitals do not matter.' }));
    }
    function end() {
      slot.innerHTML = '';
      var pct = total ? Math.round(100 * right / total) : 0;
      slot.appendChild(h('p', { cls: 'mc-result', text: right + ' of ' + total + (how === 'line' ? ' lines' : ' words') + ' right (' + pct + '%).' }));
      if (!hints) { var s = store(); if (s.S.best.recite == null || pct > s.S.best.recite) { s.S.best.recite = pct; M.save(s.o); } }
      slot.appendChild(h('div', { cls: 'mc-row' }, [btn('Again', function () { render('recite'); }, 'mc-primary'), btn('Study it', function () { go('study'); })]));
    }
  };

  /* Print: study sheet or blank practice sheet (print CSS shows just that sheet) */
  MODES.print = function (box) {
    box.appendChild(h('p', { cls: 'mc-tip', text: 'Paper works well for memory work: print the study sheet for the memory-work box, and a blank sheet to fill in from memory and check.' }));
    box.appendChild(h('div', { cls: 'mc-row' }, [btn('Print the study sheet', function () { pr('study'); }, 'mc-primary'), btn('Print a blank practice sheet', function () { pr('blank'); })]));
    function pr(k) {
      document.documentElement.setAttribute('data-mcprint', k);
      var off = function () { document.documentElement.removeAttribute('data-mcprint'); window.removeEventListener('afterprint', off); };
      window.addEventListener('afterprint', off);
      window.print();
      setTimeout(off, 1500);
    }
  };

  /* ---------- tabs ---------- */
  var cur = '';
  function render(mode) {
    if (!MODES[mode]) mode = 'study';
    cur = mode;
    tabs.querySelectorAll('[data-mode]').forEach(function (b) { var on = b.dataset.mode === mode; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    app.innerHTML = '';
    study.hidden = mode !== 'study';
    var c = document.getElementById('mc-cover'); if (c) c.hidden = mode !== 'study';
    var box = h('div', { cls: 'mc-mode mc-mode-' + mode, role: 'tabpanel', 'aria-label': (tabs.querySelector('[data-mode="' + mode + '"]') || {}).textContent || mode });
    app.appendChild(box);
    MODES[mode](box);
  }
  function go(mode) {
    if (history.replaceState) history.replaceState(null, '', '#' + mode); render(mode);
  }
  tabs.hidden = false;
  if (!L.order_matters) delete MODES.recall;
  if (!L.recite) delete MODES.recite;
  tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-mode]'); if (b) go(b.dataset.mode); });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var bs = [].slice.call(tabs.querySelectorAll('[data-mode]')), i = bs.indexOf(document.activeElement);
    if (i < 0) return; e.preventDefault();
    var n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; n.focus(); go(n.dataset.mode);
  });
  window.addEventListener('hashchange', function () { var m = location.hash.slice(1); if (MODES[m] && m !== cur) render(m); });
  render((location.hash || '').slice(1) || (L.recite ? 'recite' : 'study'));
  window.TRBMemEngine = { render: render, chunks: CH, list: L };
})();
