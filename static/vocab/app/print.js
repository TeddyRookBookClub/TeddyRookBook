/* /vocabulary/print/: print any set of word cards (or save them as a PDF from the browser's print window), laid out on
   the fly. Choose a selection (topics, a range, a level, a strand, a roots-course topic, "my hard words" or everything),
   the paper (US Letter or A4), 2, 4 or 6 cards to a page, and color or black and white. One print holds at most 25 topics
   (250 cards, about 63 pages); larger selections print in parts. The sheets have the printed page's exact size; after
   laying them out, fit() measures every card and steps its type, line spacing and picture down (then drops the example
   sentence) until nothing is cut off.
   URL (the same state, for links and scripts): ?sel=topics:1,5,9 | range:1-25 | level:3 | strand:2 | roots:all |
   roots:<slug> | hard | all  &part=N  &size=letter|a4  &per=2|4|6  &bw=1   (old links: ?vol=1-4|all)
   For scripts (scripts/vocab/make-pdf.js --check): window.__voPrintReady (true when laid out and fitted),
   window.__voFitReport = { cards, overflow: [words], levels: { level: n } }, window.__voFit() (fit again). */
(function (W, D) {
  'use strict';
  var VP = W.MathLadder.vocabPages, $ = VP.$, $$ = VP.$$, esc = VP.esc;
  var CAP_T = 25, CAP_C = 250, AUTO = 60; // topics and cards in one print; cards laid out without pressing the button
  var PER = { 2: { fs: 1.18, pw: 3.6 }, 4: { fs: 1, pw: 3.3 }, 6: { fs: 0.86, pw: 2.3 } };
  var LEVELS = [{ f: 1, p: 1 }, { f: 0.96, p: 0.97 }, { f: 0.92, p: 0.94 }, { f: 0.88, p: 0.9 }, { f: 0.85, p: 0.85, lh: 1.27 }, { f: 0.82, p: 0.8, lh: 1.24 },
    { f: 0.79, p: 0.76, lh: 1.21 }, { f: 0.76, p: 0.71, lh: 1.18 }, { f: 0.76, p: 0.71, lh: 1.18, noex: true }, { f: 0.72, p: 0.64, lh: 1.15, noex: true },
    { f: 0.68, p: 0.58, lh: 1.12, noex: true }, { f: 0.64, p: 0.52, lh: 1.1, noex: true }];
  function param(k) { try { var m = new RegExp('[?&]' + k + '=([^&]*)').exec(W.location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; } catch (e) { return null; } }
  W.__voPrintReady = false;
  VP.ready(function (VO) {
    var st = VP.load(), P = st.prefs.print = st.prefs.print || {};
    var T = VO.topics(), RT = [];
    try { RT = JSON.parse(($('#vp-roots-data') || {}).textContent || '[]') || []; } catch (e) { RT = []; }
    var book = $('#vp-book'), sum = $('#vp-sum'), ready = $('#vp-ready'), partsBox = $('#vp-parts'), goBox = $('#vp-go');
    function save() { VP.save(st); }
    // ---- state: from the URL, else the last visit, else topic 1
    var S = { kind: P.kind || 'topics', topics: (P.topics || [1]).slice(), from: P.from || 1, to: P.to || 10, level: P.level || 1, strand: P.strand || 1, roots: P.roots || 'all', size: P.size || 'letter', per: P.per || 4, bw: !!P.bw, part: 0 };
    var urlSel = param('sel'), vol = param('vol');
    if (!urlSel && vol) urlSel = vol === 'all' ? 'all' : 'range:' + ((+vol - 1) * 25 + 1) + '-' + (+vol * 25);
    if (urlSel) {
      var m = /^(\w+)(?::(.*))?$/.exec(urlSel) || [], k = m[1], v = m[2] || '';
      if (k === 'topics') S.topics = v.split(',').map(Number).filter(function (n) { return n >= 1 && n <= 100; });
      if (k === 'range') { var r = v.split('-').map(Number); S.from = r[0] || 1; S.to = r[1] || S.from; }
      if (k === 'level') S.level = Math.min(10, Math.max(1, +v || 1));
      if (k === 'strand') S.strand = Math.min(10, Math.max(1, +v || 1));
      if (k === 'roots') S.roots = v || 'all';
      if (/^(topics|range|level|strand|roots|hard|all)$/.test(k)) S.kind = k;
      S.part = +(param('part') || 0);
    }
    if (param('size')) S.size = param('size') === 'a4' ? 'a4' : 'letter';
    if (param('per') && PER[param('per')]) S.per = +param('per');
    if (param('bw') != null) S.bw = param('bw') === '1';
    if (!PER[S.per]) S.per = 4;
    // ---- the selection: { label, items: [{ e, cap }], topics: [topic] | null, parts: [{ label, topics, items }], stem }
    function topicItems(ts) { var o = []; ts.forEach(function (t) { VO.entries(t.key).forEach(function (e) { o.push({ e: e, cap: t.n + '. ' + t.title }); }); }); return o; }
    function byList(a, b) { return (VO.find(a) || { n: 0 }).n - (VO.find(b) || { n: 0 }).n; }
    function rootsWords(rt) {
      var w = (rt.cards || []).slice();
      VO.rootKeys().forEach(function (k) { var R0 = VO.ROOT(k); if (R0.topic === rt.id) w = w.concat(R0.words); });
      var seen = {}; return w.filter(function (x) { var l = String(x).toLowerCase(); if (seen[l] || !VO.entry(x)) return false; seen[l] = 1; return true; }).sort(byList);
    }
    function rangeLabel(ts) {
      var ns = ts.map(function (t) { return t.n; }), run = ns.every(function (n, i) { return !i || n === ns[i - 1] + 1; });
      return ts.length === 1 ? 'Topic ' + ns[0] + ': ' + ts[0].title : run ? 'Topics ' + ns[0] + '–' + ns[ns.length - 1] : ts.length + ' topics (' + ns.slice(0, 6).join(', ') + (ns.length > 6 ? '…' : '') + ')';
    }
    function selection() {
      var ts = null, label = '', items = null, stem = '';
      if (S.kind === 'topics') { ts = T.filter(function (t) { return S.topics.indexOf(t.n) >= 0; }); label = ts.length ? rangeLabel(ts) : 'No topics chosen'; stem = 'topics:' + ts.map(function (t) { return t.n; }).join(','); }
      if (S.kind === 'range') { var a = Math.min(S.from, S.to), b = Math.max(S.from, S.to); ts = T.filter(function (t) { return t.n >= a && t.n <= b; }); label = rangeLabel(ts); stem = 'range:' + a + '-' + b; }
      if (S.kind === 'level') { ts = T.filter(function (t) { return t.level === S.level; }); label = 'Level ' + S.level + ' (topics ' + ts[0].n + '–' + ts[ts.length - 1].n + ')'; stem = 'level:' + S.level; }
      if (S.kind === 'strand') { ts = T.filter(function (t) { return t.strand === S.strand; }); label = 'Strand: ' + (VO.strands()[S.strand - 1] || S.strand); stem = 'strand:' + S.strand; }
      if (S.kind === 'all') { ts = T.slice(); label = 'Everything (all 100 topics)'; stem = 'all'; }
      if (S.kind === 'roots') {
        var list = S.roots === 'all' ? RT : RT.filter(function (r) { return r.slug === S.roots; }), seen = {}; items = [];
        list.forEach(function (rt) { rootsWords(rt).forEach(function (w) { if (seen[w]) return; seen[w] = 1; items.push({ e: VO.entry(w), cap: 'Roots: ' + rt.title }); }); });
        label = S.roots === 'all' ? 'Greek and Latin Roots: the course’s words' : 'Greek and Latin Roots: ' + (list[0] ? list[0].title : ''); stem = 'roots:' + S.roots;
      }
      if (S.kind === 'hard') {
        items = VP.hardWords(st).filter(function (w) { return VO.entry(w); }).sort(byList).map(function (w) { var t = VO.topic(VO.entry(w).topic); return { e: VO.entry(w), cap: t ? t.n + '. ' + t.title : '' }; });
        label = 'My hard words'; stem = 'hard';
      }
      if (ts) items = topicItems(ts);
      var parts = [];
      if (ts && ts.length > CAP_T) for (var i = 0; i < ts.length; i += CAP_T) { var pt = ts.slice(i, i + CAP_T); parts.push({ label: (S.kind === 'topics' ? 'Part ' + (parts.length + 1) + ': ' : '') + rangeLabel(pt), topics: pt, items: topicItems(pt) }); }
      if (!ts && items.length > CAP_C) for (var j = 0; j < items.length; j += CAP_C) parts.push({ label: 'Part ' + (parts.length + 1) + ': cards ' + (j + 1) + '–' + Math.min(items.length, j + CAP_C), topics: null, items: items.slice(j, j + CAP_C) });
      return { label: label, items: items, topics: ts, parts: parts, stem: stem };
    }
    function pages(n) { return n ? Math.ceil(n / S.per) + 1 : 0; }
    function num(n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ','); }
    // ---- the setup controls
    var kindBox = $('#vp-kind'), perBox = $('#vp-per'), inkBox = $('#vp-ink'), tl = $('#vp-topics'), html = '';
    function seg(box, v) { $$('button', box).forEach(function (b) { var on = b.dataset.v === String(v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
    for (var lv = 1; lv <= 10; lv++) {
      html += '<fieldset class="vp-lv"><legend>Level ' + lv + '</legend>' + T.filter(function (t) { return t.level === lv; }).map(function (t) { return '<label class="vp-t"><input type="checkbox" value="' + t.n + '"> <span>' + t.n + '. ' + esc(t.title) + '</span></label>'; }).join('') + '</fieldset>';
    }
    tl.innerHTML = html;
    function opts(sel, list, v) { sel.innerHTML = list.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
    var tOpts = T.map(function (t) { return [t.n, t.n + '. ' + t.title]; });
    opts($('#vp-from'), tOpts, S.from); opts($('#vp-to'), tOpts, S.to);
    var lvOpts = []; for (var i2 = 1; i2 <= 10; i2++) lvOpts.push([i2, 'Level ' + i2 + ': topics ' + ((i2 - 1) * 10 + 1) + '–' + i2 * 10]);
    opts($('#vp-level'), lvOpts, S.level);
    opts($('#vp-strand'), VO.strands().map(function (s, i) { return [i + 1, s]; }), S.strand);
    opts($('#vp-roots'), [['all', 'All the course’s words']].concat(RT.map(function (r) { return [r.slug, r.title + ' (' + rootsWords(r).length + ' cards)']; })), S.roots);
    $('#vp-size').value = S.size;
    function show() {
      seg(kindBox, S.kind); seg(perBox, S.per); seg(inkBox, S.bw ? 'bw' : 'color');
      $$('input', tl).forEach(function (c) { c.checked = S.topics.indexOf(+c.value) >= 0; });
      $$('.vp-panel').forEach(function (p) { p.hidden = p.getAttribute('data-p') !== S.kind; });
      var hw = VP.hardWords(st).filter(function (w) { return VO.entry(w); }).length;
      $('#vp-hardnote').textContent = hw ? hw + ' word' + (hw === 1 ? '' : 's') + ': the ones you graded Again or Hard in the flashcards, or missed in a quiz in the last 30 days.' : 'No hard words yet. Words you grade Again or Hard in the flashcards, or miss in a quiz, gather here.';
      var sel = selection(), n = sel.items.length;
      sum.textContent = !n ? (S.kind === 'topics' ? 'Tick at least one topic.' : S.kind === 'hard' ? '' : 'Nothing to print.') : sel.label + ' · ' + num(n) + ' card' + (n === 1 ? '' : 's') + (sel.parts.length ? ', in ' + sel.parts.length + ' parts' : ', about ' + pages(n) + ' pages');
      partsBox.hidden = !sel.parts.length; goBox.hidden = !!sel.parts.length || !n;
      if (sel.parts.length) {
        $('#vp-parts-msg').textContent = 'One print holds up to ' + CAP_T + ' topics (' + CAP_C + ' cards), so it stays quick on any device. Print this selection in parts:';
        $('#vp-partbtns').innerHTML = sel.parts.map(function (p, i) { return '<button type="button" class="mlp-btn' + (S.part === i + 1 ? ' pri' : '') + '" data-part="' + (i + 1) + '">' + esc(p.label) + ' <small>' + p.items.length + ' cards</small></button>'; }).join('');
      }
      return sel;
    }
    function remember() { P.kind = S.kind; P.topics = S.topics; P.from = S.from; P.to = S.to; P.level = S.level; P.strand = S.strand; P.roots = S.roots; P.size = S.size; P.per = S.per; P.bw = S.bw; save(); }
    function changed(layoutChange) {
      var keepPart = layoutChange && S.part; if (!layoutChange) S.part = 0; remember();
      var sel = show(), n = keepPart ? (sel.parts[S.part - 1] || { items: [] }).items.length : sel.items.length; clearBook();
      if ((keepPart || !sel.parts.length) && n && n <= AUTO) layOut();
    }
    kindBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { S.kind = b.dataset.v; changed(); } });
    perBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { S.per = +b.dataset.v; changed(true); } });
    inkBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { S.bw = b.dataset.v === 'bw'; changed(true); } });
    tl.addEventListener('change', function () { S.topics = $$('input', tl).filter(function (c) { return c.checked; }).map(function (c) { return +c.value; }); changed(); });
    $('#vp-none').addEventListener('click', function () { S.topics = []; changed(); });
    $('#vp-from').addEventListener('change', function (e) { S.from = +e.target.value; changed(); });
    $('#vp-to').addEventListener('change', function (e) { S.to = +e.target.value; changed(); });
    $('#vp-level').addEventListener('change', function (e) { S.level = +e.target.value; changed(); });
    $('#vp-strand').addEventListener('change', function (e) { S.strand = +e.target.value; changed(); });
    $('#vp-roots').addEventListener('change', function (e) { S.roots = e.target.value; changed(); });
    $('#vp-size').addEventListener('change', function (e) { S.size = e.target.value === 'a4' ? 'a4' : 'letter'; changed(true); });
    $('#vp-lay').addEventListener('click', function () { layOut(); });
    $('#vp-partbtns').addEventListener('click', function (e) { var b = e.target.closest('button[data-part]'); if (b) { S.part = +b.dataset.part; show(); layOut(); } });
    $('#vp-print').addEventListener('click', function () { W.print(); });
    function clearBook() { book.innerHTML = ''; ready.hidden = true; W.__voPrintReady = false; W.__voFitReport = null; }
    // ---- black and white: every color in the pictures becomes its gray (the drawings stay vector)
    function gray(r, g, b) { var y = Math.round(0.299 * r + 0.587 * g + 0.114 * b), h = (y < 16 ? '0' : '') + y.toString(16); return '#' + h + h + h; }
    function toGray(svg) {
      return svg.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g, function (m, h) { if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return gray(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)); })
        .replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+\s*)?\)/g, function (m, r, g, b, a) { var y = Math.round(0.299 * r + 0.587 * g + 0.114 * b); return a ? 'rgba(' + y + ',' + y + ',' + y + a + ')' : 'rgb(' + y + ',' + y + ',' + y + ')'; });
    }
    function cardHTML(e) { var h = VO.cardHTML(e, { mode: 'print' }); return S.bw ? h.replace(/<svg[^]*?<\/svg>/g, toGray) : h; }
    // ---- lay out and fit
    var pageStyle = D.createElement('style'); D.head.appendChild(pageStyle);
    function scale() { var sw = (S.size === 'a4' ? 191.5 / 25.4 : 7.78) * 96 + 0.44 * 96 + 2, k = Math.min(1, (book.clientWidth || sw) / sw); book.style.setProperty('--k', String(Math.max(0.2, k))); }
    W.addEventListener('resize', scale);
    function layOut() {
      var sel = selection(), part = S.part ? sel.parts[S.part - 1] : null, items = part ? part.items : sel.items, ts = part ? part.topics : sel.topics;
      if (sel.parts.length && !part) { show(); return; }
      if (!items.length) { clearBook(); return; }
      W.__voPrintReady = false;
      try { W.history.replaceState(null, '', W.location.pathname + '?sel=' + sel.stem + (part ? '&part=' + S.part : '') + '&size=' + S.size + '&per=' + S.per + (S.bw ? '&bw=1' : '')); } catch (e) { }
      pageStyle.textContent = S.size === 'a4' ? '@page{size:A4;margin:9mm}' : '@page{size:letter;margin:0.35in}';
      D.documentElement.classList.toggle('vop-paper-a4', S.size === 'a4');
      book.className = 'vop-book vop-per-' + S.per + (S.bw ? ' vop-bw' : '');
      var L0 = PER[S.per], title = !part ? sel.label : S.kind === 'all' ? 'Everything, part ' + S.part + ' of ' + sel.parts.length + ': ' + part.label : S.kind === 'topics' ? part.label : sel.label + ', part ' + S.part + ' of ' + sel.parts.length + (ts ? ': ' + part.label : '');
      var h = '<div class="vop-sheetw"><section class="vop-sheet vop-title"><div class="vop-title-in"><p class="vop-tb">Teddy Rook Book · Vocabulary Ladder</p><h2>Word Cards</h2><p class="vop-tv">' + esc(title) + '</p><p class="vop-tc">' + items.length + ' card' + (items.length === 1 ? '' : 's') + '</p>' +
        '<p class="vop-ti">Each card gives a word, how to say it (the capital letters are stressed), its meaning, a memory hook with a picture, an example and its Greek or Latin parts. To learn a word: say the hook out loud, picture the scene, then cover the card and try to recall the meaning. Come back to it tomorrow and again next week.</p>' +
        (ts && ts.length > 1 ? '<ol class="vop-toc">' + ts.map(function (t) { return '<li value="' + t.n + '">' + esc(t.title) + '</li>'; }).join('') + '</ol>' : '') +
        '<p class="vop-tf">Free at teddyrookbook.com/vocabulary/, with flashcards, quizzes and practice.</p></div></section></div>';
      for (var i = 0; i < items.length; i += S.per) {
        h += '<div class="vop-sheetw"><section class="vop-sheet">' + items.slice(i, i + S.per).map(function (x) { return '<div class="vop-cell" style="--pw:' + L0.pw + 'in">' + cardHTML(x.e).replace('<article class="vo-card vo-card-print', '<article style="--fs:' + L0.fs + '" class="vo-card vo-card-print') + '<p class="vop-cellt">' + esc(x.cap) + '</p></div>'; }).join('') + '</section></div>';
      }
      book.innerHTML = h; scale();
      ready.hidden = false; $('#vp-status').textContent = 'Laying out ' + num(items.length) + ' cards…';
      var fontsReady = D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve();
      fontsReady.then(function () {
        W.requestAnimationFrame(function () {
          var r = fit();
          goBox.hidden = true;
          $('#vp-status').textContent = title + ' · ' + num(items.length) + ' card' + (items.length === 1 ? '' : 's') + ' on ' + pages(items.length) + ' pages (' + (S.size === 'a4' ? 'A4' : 'US Letter') + ', ' + S.per + ' to a page, ' + (S.bw ? 'black and white' : 'color') + '). ' +
            (r.overflow.length ? r.overflow.length + ' card(s) are still too full to fit: ' + r.overflow.join(', ') + '.' : 'Every card fits.');
          W.__voPrintReady = true;
        });
      });
    }
    function over(c) { return c.scrollHeight > c.clientHeight + 0.5 || c.scrollWidth > c.clientWidth + 0.5; }
    function setLevel(c, i) {
      var L = LEVELS[i], L0 = PER[S.per], cell = c.parentNode; c.setAttribute('data-fit', String(i));
      c.style.setProperty('--fs', String(Math.round(L0.fs * L.f * 1000) / 1000)); if (L.lh) c.style.setProperty('--lh', String(L.lh)); else c.style.removeProperty('--lh');
      cell.style.setProperty('--pw', Math.round(L0.pw * L.p * 100) / 100 + 'in'); c.classList.toggle('vo-fit-noex', !!L.noex);
    }
    function fit() {
      var cards = Array.prototype.slice.call(book.querySelectorAll('.vop-cell > .vo-card')), todo = cards.filter(over); // one layout for all
      for (var i = 1; i < LEVELS.length && todo.length; i++) {
        todo.forEach(function (c) { if ((+c.getAttribute('data-fit') || 0) < i) setLevel(c, i); }); // write all, then read all
        todo = todo.filter(over);
      }
      var levels = {}; cards.forEach(function (c) { var l = c.getAttribute('data-fit') || '0'; levels[l] = (levels[l] || 0) + 1; });
      W.__voFitReport = { cards: cards.length, overflow: todo.map(function (c) { return c.getAttribute('data-word'); }), levels: levels };
      return W.__voFitReport;
    }
    W.__voFit = fit;
    W.addEventListener('beforeprint', function () { if (book.querySelector('.vo-card')) fit(); });
    // ---- start: lay out a URL's selection (or part), or a small remembered one; otherwise wait for the button
    var first = show();
    if (urlSel ? (!first.parts.length || S.part) && first.items.length : !first.parts.length && first.items.length && first.items.length <= AUTO) layOut();
    else { book.innerHTML = ''; W.__voPrintReady = true; W.__voFitReport = { cards: 0, overflow: [], levels: {} }; }
  });
})(window, document);
