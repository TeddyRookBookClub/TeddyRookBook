/* Citizenship test practice (/american-history/citizenship-test/).
   Reads the official USCIS lists from #us-data (data/civics/uscis/2025.json and 2008.json, rendered by layouts/uscis/practice.html).
   Study cards by section, a mock interview (20 or 10 questions at random, stops once passed or failed, read aloud on request,
   typed or self-marked answers) and the version choice. Progress is kept in localStorage 'trb-uscis-v1' (this browser only):
   { v: '2025'|'2008', known: { '2025': { '12': 1 (knew it) | 0 (still learning) }, '2008': {...} }, mocks: [ { v, d, r, w, n, pass, s } ] } */
(function () {
  'use strict';
  var root = document.getElementById('us'), dataEl = document.getElementById('us-data');
  if (!root || !dataEl) return;
  var DATA; try { DATA = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var KEY = 'trb-uscis-v1';
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return s && typeof s === 'object' ? s : {}; } catch (e) { return {}; } }
  var S = load();
  if (!S.known || typeof S.known !== 'object') S.known = {};
  if (!Array.isArray(S.mocks)) S.mocks = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private window or storage off: keep going without saving */ } }
  var V = S.v === '2008' ? '2008' : '2025';
  function D() { return DATA[V]; }
  function known() { return S.known[V] || (S.known[V] = {}); }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(text, cls, fn) { var b = el('button', 'hs-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var NUMS = ['', 'one', 'two', 'three', 'four', 'five'];

  // ---------------------------------------------------------------- reading aloud (browser speech, if it has one)
  var SYN = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  function say(text) {
    if (!SYN) return;
    try { SYN.cancel(); var u = new SpeechSynthesisUtterance(String(text).replace(/[“”"]/g, '')); u.lang = 'en-US'; u.rate = 0.92; SYN.speak(u); } catch (e) { /* no voice */ }
  }

  // ---------------------------------------------------------------- matching a typed answer with the official answers (MATCH-START)
  var STOP = {}; ('the a an of to and in for on by it is was are be that this with they their from its at as or year years us united states because he she i we you my our').split(' ').forEach(function (w) { STOP[w] = 1; });
  var NEG = { vice: 1, not: 1, no: 1, never: 1, anti: 1, dont: 1, cannot: 1, cant: 1, non: 1 };
  var NUMW = {}; ('one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand').split(' ').forEach(function (w) { NUMW[w] = 1; });
  function plain(s) { return String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"'); }
  function toks(s, all) { // significant words, lightly stemmed (all: keep the small words too)
    s = plain(s).toLowerCase().replace(/u\.s\./g, 'us').replace(/-/g, ' ').replace(/[^a-z0-9' ]+/g, ' ');
    var out = [];
    s.split(/\s+/).forEach(function (w) { w = w.replace(/'s$|'$/, '').replace(/'/g, ''); if (!w || (!all && STOP[w])) return; if (w.length > 3) w = w.replace(/s$/, ''); if (out.indexOf(w) < 0) out.push(w); });
    return out;
  }
  function variants(a) {
    a = plain(a);
    var extra = a.match(/\[Also acceptable are (.*)\.\]/), base = a.replace(/\s*\[.*?\]/g, '').trim(), items = [base], out = [];
    if (extra) extra[1].split(/,\s*(?:and\s+)?|\s+and\s+/).forEach(function (x) { if (x.trim()) items.push(x.trim()); });
    items.forEach(function (it) {
      var alts = /\w\/\w/.test(it) ? [it].concat(it.split('/')) : [it];
      alts.forEach(function (alt) {
        out.push(alt.replace(/[()]/g, ' '), alt.replace(/\([^)]*\)/g, ' '));
        var m = alt.match(/^(?:The )?([A-Za-z -]+) \((\d+)\)( years)?$/);
        if (m && m[1].split(/[ -]/).every(function (w) { return NUMW[w.toLowerCase()]; })) out.push(m[2]);
        out.push(alt.replace(/((?:[A-Za-z]+[ -])*[A-Za-z]+) \((\d+)\)/g, function (all, w, d) { // "Citizens eighteen (18)" -> "Citizens 18"
          var ws = w.split(/[ -]/), k = ws.length; while (k > 0 && NUMW[ws[k - 1].toLowerCase()]) k--;
          return k === ws.length ? all : ws.slice(0, k).concat([d]).join(' ');
        }).replace(/[()]/g, ' '));
      });
    });
    return out;
  }
  function matches(typed, a, many) {
    var T = toks(typed), TA = toks(typed, true); if (!TA.length) return false;
    return variants(a).some(function (v) {
      var t = toks(v);
      if (!t.length) { // an answer made only of small words ("The United States"): all of its words must be there
        var ta = toks(v, true).filter(function (x) { return x !== 'the' && x !== 'a' && x !== 'an'; });
        return ta.length > 0 && ta.every(function (x) { return TA.indexOf(x) >= 0; });
      }
      var hit = t.filter(function (x) { return T.indexOf(x) >= 0; }).length;
      if (!(hit === t.length || (t.length >= 4 && hit / t.length >= 0.75))) return false;
      return many || !T.some(function (x) { return NEG[x] && t.indexOf(x) < 0; }); // "vice president" is not "president"
    });
  }
  function need(q) { var m = q.q.match(/\b(?:Name|What are) (two|three|five)\b/); return m ? ({ two: 2, three: 3, five: 5 })[m[1]] : 1; }
  function judge(q, typed) { var many = need(q) > 1, hit = q.a.filter(function (a) { return matches(typed, a, many); }); return { hit: hit, ok: hit.length >= need(q) }; }
  // (MATCH-END)

  // ---------------------------------------------------------------- shared pieces of a card
  function tags(q, withMark) {
    var w = el('span', 'tags');
    if (q.star) w.appendChild(el('span', 'us-tag star', '★ 65/20 list'));
    if (q.changes) w.appendChild(el('span', 'us-tag', 'Answer changes'));
    if (q.local) w.appendChild(el('span', 'us-tag', 'Depends on where you live'));
    if (withMark) { var k = known()[q.n]; if (k === 1) w.appendChild(el('span', 'us-tag know', 'Known')); if (k === 0) w.appendChild(el('span', 'us-tag learn', 'Still learning')); }
    return w;
  }
  function answersBox(q) {
    var box = el('div', 'ans');
    box.appendChild(el('p', 'lab', q.a.length > 1 ? 'Official answers (any one counts' + (need(q) > 1 ? '; name ' + NUMS[need(q)] : '') + '):' : 'Official answer:'));
    var ul = el('ul'); q.a.forEach(function (a) { ul.appendChild(el('li', null, a)); }); box.appendChild(ul);
    if (q.note) box.appendChild(el('p', 'hs-small', q.note));
    if (q.changes || q.local) {
      var w = el('p', 'us-warn');
      w.appendChild(document.createTextNode(q.changes ? 'This answer changes with elections or appointments. Give the answer that is true on the day of your interview; USCIS lists the current answers at ' : 'This answer depends on where you live. Look it up on your state’s official website, and see '));
      var a = el('a', null, 'uscis.gov/citizenship/testupdates'); a.href = 'https://www.uscis.gov/citizenship/testupdates'; w.appendChild(a); w.appendChild(document.createTextNode('.'));
      box.appendChild(w);
    }
    return box;
  }

  // ---------------------------------------------------------------- study cards
  var sel = $('us-sec'), order = [], pos = 0, shown = false, shuffled = false;
  function partOf(q) { return q.section + '|' + q.part; }
  function fillSections() {
    sel.innerHTML = '';
    var d = D();
    function opt(parent, val, text) { var o = el('option', null, text); o.value = val; parent.appendChild(o); }
    opt(sel, 'all', 'All ' + d.total + ' questions');
    opt(sel, 'star', '65/20: the 20 starred questions');
    opt(sel, 'learn', 'Still learning');
    opt(sel, 'new', 'Not marked yet');
    d.sections.forEach(function (s) {
      var g = el('optgroup'); g.label = s.title;
      s.parts.forEach(function (p) { opt(g, s.title + '|' + p.title, p.title + ' (' + p.from + '–' + p.to + ')'); });
      sel.appendChild(g);
    });
    sel.value = 'all';
  }
  function pick() {
    var f = sel.value, k = known();
    var qs = D().questions.filter(function (q) {
      if (f === 'all') return true; if (f === 'star') return q.star; if (f === 'learn') return k[q.n] === 0; if (f === 'new') return k[q.n] == null;
      return partOf(q) === f;
    });
    order = shuffled ? shuffle(qs) : qs; pos = 0; shown = false; drawCard();
  }
  function progress() {
    var k = known(), n = Object.keys(k).filter(function (x) { return k[x] === 1; }).length, t = D().total;
    $('us-known').textContent = n + ' of ' + t + ' known';
    $('us-bar').style.width = Math.round(100 * n / t) + '%';
  }
  function drawCard() {
    var card = $('us-card'); card.innerHTML = ''; progress();
    $('us-prev').disabled = pos <= 0; $('us-next').disabled = pos >= order.length - 1;
    if (!order.length) { card.appendChild(el('p', null, sel.value === 'learn' ? 'No cards are marked “Still learning” yet. Mark cards as you study, or finish a mock interview, and the ones to review gather here.' : 'No cards here yet.')); $('us-pos').textContent = ''; return; }
    var q = order[pos];
    $('us-pos').textContent = 'Card ' + (pos + 1) + ' of ' + order.length;
    var meta = el('p', 'meta'); meta.appendChild(el('span', 'qn', 'Question ' + q.n)); meta.appendChild(tags(q, true)); card.appendChild(meta);
    card.appendChild(el('p', 'qt', q.q));
    var acts = el('div', 'acts');
    if (!shown) {
      acts.appendChild(btn('Show answer', 'us-primary', function () { shown = true; drawCard(); focusIn('us-card'); }));
    } else {
      card.appendChild(answersBox(q));
      acts.appendChild(btn('✓ I knew it', 'yes', function () { mark(q, 1); }));
      acts.appendChild(btn('Still learning', 'nope', function () { mark(q, 0); }));
    }
    card.appendChild(acts);
  }
  function focusIn(id) { var b = document.querySelector('#' + id + ' .acts button'); if (b) b.focus(); }
  function mark(q, v) {
    known()[q.n] = v; save();
    var f = sel.value;
    if ((f === 'learn' && v === 1) || f === 'new') { order.splice(pos, 1); if (pos >= order.length) pos = Math.max(0, order.length - 1); }
    else if (pos < order.length - 1) pos++;
    shown = false; drawCard(); focusIn('us-card');
  }
  sel.addEventListener('change', pick);
  $('us-shuffle').addEventListener('click', function () { shuffled = true; pick(); });
  $('us-prev').addEventListener('click', function () { if (pos > 0) { pos--; shown = false; drawCard(); } });
  $('us-next').addEventListener('click', function () { if (pos < order.length - 1) { pos++; shown = false; drawCard(); } });
  $('us-say').addEventListener('click', function () { if (order[pos]) say(order[pos].q); });
  $('us-reset').addEventListener('click', function () { if (window.confirm('Clear your marks for the ' + V + ' version?')) { S.known[V] = {}; save(); pick(); } });
  if (!SYN) { [$('us-say')].forEach(function (b) { b.disabled = true; b.title = 'This browser cannot read aloud'; }); $('us-auto').disabled = true; $('us-auto').parentNode.appendChild(el('span', 'hs-small', ' (this browser cannot read aloud)')); }

  // ---------------------------------------------------------------- mock interview
  var M = null;
  function rules() {
    var d = D(), sen = $('us-senior').checked;
    $('us-mock-rules').textContent = sen
      ? 'The ' + V + ' version for applicants 65 or older with 20 years as a permanent resident: 10 questions from the 20 starred ones; 6 correct passes.'
      : 'The ' + V + ' version: ' + d.asked + ' questions at random from all ' + d.total + '; ' + d.passMark + ' correct passes.';
  }
  function startMock() {
    var d = D(), sen = $('us-senior').checked, pool = d.questions.filter(function (q) { return !sen || q.star; });
    var n = sen ? 10 : d.asked;
    M = { qs: shuffle(pool).slice(0, n), n: n, pass: sen ? 6 : d.passMark, i: 0, r: 0, w: 0, log: [], sen: sen, v: V };
    $('us-mock-start').hidden = true; $('us-mock-end').hidden = true; $('us-mock-run').hidden = false;
    drawMock(true);
  }
  function drawMock(first) {
    var q = M.qs[M.i], card = $('us-mcard'); card.innerHTML = '';
    $('us-mq').textContent = 'Question ' + (M.i + 1) + ' of up to ' + M.n;
    $('us-ms').textContent = M.r + ' right, ' + M.w + ' missed · ' + M.pass + ' right to pass';
    var meta = el('p', 'meta'); meta.appendChild(el('span', 'qn', 'List number ' + q.n)); meta.appendChild(tags(q, false)); card.appendChild(meta);
    var qt = el('p', 'qt', q.q); qt.id = 'us-mqt'; card.appendChild(qt);
    var acts = el('div', 'acts');
    if (SYN) acts.appendChild(btn('🔊 Read again', '', function () { say(q.q); }));
    if (!(q.changes || q.local)) {
      var lab = el('label', 'hs-small', 'Your answer' + (need(q) > 1 ? ' (name ' + NUMS[need(q)] + ', separated by commas)' : '')); lab.setAttribute('for', 'us-in');
      var row = el('div', 'us-type'), inp = el('input'); inp.type = 'text'; inp.id = 'us-in'; inp.autocomplete = 'off'; inp.setAttribute('autocapitalize', 'off');
      var check = btn('Check my answer', 'us-primary', function () { if (!inp.value.trim()) { inp.focus(); return; } afterAnswer(q, judge(q, inp.value), inp.value); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check.click(); } });
      row.appendChild(inp); row.appendChild(check); card.appendChild(lab); card.appendChild(row);
    } else {
      card.appendChild(el('p', 'us-warn', q.changes ? 'The answer to this one changes with elections or appointments' + (q.local ? ' and depends on where you live' : '') + '. Say your answer out loud, then show the official answer and mark yourself.' : 'The answer to this one depends on where you live. Say your answer out loud, then show the official answer and mark yourself.'));
    }
    acts.appendChild(btn('Show the official answers', '', function () { afterAnswer(q, null, ''); }));
    card.appendChild(acts);
    if ($('us-auto').checked) say(q.q);
    if (!first) { var f = $('us-in') || card.querySelector('button'); if (f) f.focus(); }
  }
  function afterAnswer(q, res, typed) {
    var card = $('us-mcard'), acts = card.querySelector('.acts'), inp = $('us-in');
    if (inp) { inp.disabled = true; var b = inp.nextSibling; if (b) b.disabled = true; }
    acts.innerHTML = '';
    if (res) {
      var v = el('p', 'us-verdict ' + (res.ok ? 'ok' : 'no'));
      v.textContent = res.ok ? 'That matches the official list' + (res.hit.length ? ': ' + res.hit.slice(0, 5).join('; ') : '') + '.'
        : res.hit.length ? 'That names ' + res.hit.length + ' of the ' + need(q) + ' answers needed (' + res.hit.join('; ') + '). Compare with the list below.'
          : 'That does not match an answer on the list. Compare with the official answers below; the officer judges spoken answers, so count it right if you said the same thing.';
      card.insertBefore(v, acts);
    }
    card.insertBefore(answersBox(q), acts);
    var yes = btn(res ? 'Count it right' : '✓ I knew it', 'yes' + (res && res.ok ? ' us-primary' : ''), function () { record(q, true, typed); });
    var no = btn(res ? 'Count it wrong' : 'I missed it', 'nope' + (res && !res.ok ? ' us-primary' : ''), function () { record(q, false, typed); });
    acts.appendChild(yes); acts.appendChild(no);
    (res && !res.ok ? no : yes).focus();
  }
  function record(q, ok, typed) {
    if (ok) M.r++; else M.w++;
    M.log.push({ q: q, ok: ok, typed: typed });
    if (!ok) { known()[q.n] = 0; save(); }
    M.i++;
    if (M.r >= M.pass || M.w > M.n - M.pass || M.i >= M.n) endMock(); else drawMock(false);
  }
  function endMock() {
    var passed = M.r >= M.pass, end = $('us-mock-end'); end.innerHTML = '';
    $('us-mock-run').hidden = true; end.hidden = false;
    var box = el('div', 'us-result');
    var h = el('h3', null, passed ? 'You passed this mock interview.' : 'Not this time.'); h.tabIndex = -1; box.appendChild(h);
    box.appendChild(el('p', null, M.r + ' right and ' + M.w + ' missed out of ' + M.log.length + ' asked. The pass mark is ' + M.pass + ' right out of up to ' + M.n + (M.log.length < M.n ? ', so the interview stopped once the result was decided.' : '.')));
    if (M.w) box.appendChild(el('p', 'hs-small', 'The questions you missed are now in the “Still learning” set of the study cards.'));
    var ol = el('ol');
    M.log.forEach(function (x) {
      var li = el('li'); li.appendChild(el('span', 'r ' + (x.ok ? 'ok' : 'no'), x.ok ? '✓ ' : '✗ '));
      li.appendChild(document.createTextNode('Question ' + x.q.n + ': ' + x.q.q + ' '));
      li.appendChild(el('span', 'hs-small', '(' + x.q.a.slice(0, 3).join('; ') + (x.q.a.length > 3 ? '; …' : '') + ')'));
      ol.appendChild(li);
    });
    box.appendChild(ol);
    var acts = el('div', 'acts');
    acts.appendChild(btn('Start another mock interview', 'us-primary', function () { startMock(); }));
    if (M.w) acts.appendChild(btn('Study the ones I missed', '', function () { setTab('us-t-study'); sel.value = 'learn'; shuffled = false; pick(); }));
    box.appendChild(acts); end.appendChild(box);
    S.mocks.unshift({ v: M.v, d: new Date().toISOString().slice(0, 10), r: M.r, w: M.w, n: M.n, pass: M.pass, s: M.sen ? 1 : 0 }); S.mocks = S.mocks.slice(0, 10); save();
    showHist(); h.focus();
  }
  function showHist() {
    var hd = $('us-hist'); hd.innerHTML = '';
    var mine = S.mocks.filter(function (m) { return m.v === V; });
    if (!mine.length) return;
    hd.appendChild(el('p', null, 'Your last mock interviews on the ' + V + ' version (in this browser): ' + mine.slice(0, 5).map(function (m) { return m.d + ', ' + m.r + ' right, ' + m.w + ' missed (' + (m.r >= m.pass ? 'passed' : 'not passed') + ')'; }).join(' · ')));
  }
  $('us-begin').addEventListener('click', startMock);
  $('us-senior').addEventListener('change', rules);

  // ---------------------------------------------------------------- tabs, version, print
  var tabs = [].slice.call(root.querySelectorAll('[role=tab]'));
  function setTab(id) {
    tabs.forEach(function (t) { var on = t.id === id; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; $(t.getAttribute('aria-controls')).hidden = !on; });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setTab(t.id); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, j = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
      if (j == null) return; e.preventDefault(); j = (j + tabs.length) % tabs.length; setTab(tabs[j].id); tabs[j].focus();
    });
  });
  function setVersion(v) {
    V = v === '2008' ? '2008' : '2025'; S.v = V; save(); root.setAttribute('data-v', V);
    [].forEach.call(root.querySelectorAll('input[name=us-v]'), function (r) { r.checked = r.value === V; });
    [].forEach.call(root.querySelectorAll('.us-full'), function (f) { f.hidden = f.getAttribute('data-ver') !== V; });
    fillSections(); shuffled = false; pick(); rules(); showHist();
    M = null; $('us-mock-start').hidden = false; $('us-mock-run').hidden = true; $('us-mock-end').hidden = true;
  }
  [].forEach.call(root.querySelectorAll('input[name=us-v]'), function (r) { r.addEventListener('change', function () { if (r.checked) setVersion(r.value); }); });
  $('us-print').addEventListener('click', function () { window.print(); });
  setVersion(V);
})();
