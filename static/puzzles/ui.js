/* Brain Puzzles page script: the print-a-sheet builder and the on-screen play panel.
   Saves only small preferences (paper size, last level, answer key on/off) under localStorage "trb-puzzles-v1". */
(function () {
  'use strict';
  var P = window.TRBPuzzles;
  var dataEl = document.getElementById('pz-data');
  if (!P || !dataEl) return;
  var DATA; try { DATA = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var FAM = {}; DATA.families.forEach(function (f) { FAM[f.key] = f; });
  var GROUPS = DATA.groups;
  var STORE = 'trb-puzzles-v1';
  function loadPrefs() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function savePrefs(o) { try { var p = loadPrefs(); for (var k in o) p[k] = o[k]; localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* storage off: fine */ } }
  var prefs = loadPrefs();
  var esc = P.esc;
  function $(sel, el) { return (el || document).querySelector(sel); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var KEYCOLS = { sequences: 2, crosssum: 3, magic: 4, balance: 2, roman: 4, cages: 3, logicgrid: 2, crypto: 3, classics: 1, ladders: 4, anagrams: 4, wordsense: 2, mazes: 2, matchsticks: 2, pieces: 2, cubes: 3, bases: 2, ciphers: 1, morse: 1 };
  function keyCols(fam, it) {
    if (fam === 'sampler') return 2;
    if (fam === 'sudoku') return it && it.data && it.data.n === 9 ? 2 : 3;
    if (fam === 'nonogram') return it && it.data && it.data.g.length > 10 ? 2 : 3;
    return KEYCOLS[fam] || 2;
  }

  /* ================= print-a-sheet builder ================= */
  var B = document.getElementById('pz-builder');
  if (B) initBuilder(B);

  function initBuilder(root) {
    var q = new URLSearchParams(location.search);
    var st = {
      fam: FAM[q.get('f')] || q.get('f') === 'sampler' ? q.get('f') : (root.getAttribute('data-fam') || 'sampler'),
      level: P.levels.indexOf(q.get('l')) >= 0 ? q.get('l') : (prefs.level || 'easy'),
      kind: q.get('k') || 'auto',
      n: +q.get('n') || 0,
      paper: q.get('p') === 'a4' || q.get('p') === 'letter' ? q.get('p') : (prefs.paper || (/^en-US|^en-CA|^es-MX/.test(navigator.language || 'en-US') ? 'letter' : 'a4')),
      code: P.cleanCode(q.get('s')) || P.newCode(),
      key: prefs.key !== false, name: prefs.name !== false
    };
    if (!FAM[st.fam] && st.fam !== 'sampler') st.fam = 'sampler';
    var famOpts = '<option value="sampler">Mixed sampler (a different kind each time)</option>' + GROUPS.map(function (g) {
      return '<optgroup label="' + esc(g.name) + '">' + DATA.families.filter(function (f) { return f.group === g.key; }).map(function (f) { return '<option value="' + f.key + '">' + esc(f.name) + '</option>'; }).join('') + '</optgroup>';
    }).join('');
    root.innerHTML =
      '<div class="pz-controls pz-noprint">' +
      '<div class="pz-crow">' +
      '<label class="pz-fld pz-wide">Puzzle<select id="pz-f">' + famOpts + '</select></label>' +
      '<fieldset class="pz-lv"><legend>Level</legend>' + P.levels.map(function (l) { return '<button type="button" data-l="' + l + '" aria-pressed="false">' + P.levelName[l] + '</button>'; }).join('') + '</fieldset>' +
      '</div><div class="pz-crow">' +
      '<label class="pz-fld" id="pz-kw">Kind<select id="pz-k"></select></label>' +
      '<label class="pz-fld">How many<select id="pz-n"></select></label>' +
      '<label class="pz-fld">Paper<select id="pz-p"><option value="letter">US Letter</option><option value="a4">A4</option></select></label>' +
      '<label class="pz-fld">Sheet code<input id="pz-s" maxlength="8" autocomplete="off" spellcheck="false" aria-describedby="pz-scode-help"></label>' +
      '</div><div class="pz-crow pz-checks">' +
      '<label><input type="checkbox" id="pz-key"> Answer key on its own page</label>' +
      '<label><input type="checkbox" id="pz-name"> Name and date line</label>' +
      '</div><div class="pz-crow pz-acts">' +
      '<button type="button" class="hs-btn pri big" id="pz-print">🖨 Print this sheet</button>' +
      '<button type="button" class="hs-btn big" id="pz-new">🔄 New sheet</button>' +
      '<button type="button" class="hs-btn big" id="pz-link">🔗 Copy link</button>' +
      '</div><p class="hs-small" id="pz-scode-help">The same sheet code always makes the same puzzles, so you can print a sheet again later or share it.</p>' +
      '<p class="pz-status" id="pz-status" aria-live="polite"></p></div>' +
      '<div class="pz-pages" id="pz-pages" aria-label="Sheet preview"></div>';
    var fSel = $('#pz-f', root), kSel = $('#pz-k', root), nSel = $('#pz-n', root), pSel = $('#pz-p', root), sIn = $('#pz-s', root);
    fSel.value = st.fam; pSel.value = st.paper; sIn.value = st.code;
    $('#pz-key', root).checked = st.key; $('#pz-name', root).checked = st.name;
    function syncOpts() {
      var gen = P.fams[st.fam], kinds = st.fam === 'sampler' ? null : gen.kinds;
      $('#pz-kw', root).hidden = !kinds;
      if (kinds) { kSel.innerHTML = kinds.map(function (k) { return '<option value="' + k[0] + '">' + esc(k[1]) + '</option>'; }).join(''); if (!kinds.some(function (k) { return k[0] === st.kind; })) st.kind = 'auto'; kSel.value = st.kind; }
      else st.kind = 'auto';
      var f = FAM[st.fam], counts = f ? f.counts : [4, 6, 8, 10, 12], def = f ? f.def : 6;
      if (counts.indexOf(st.n) < 0) st.n = def;
      nSel.innerHTML = counts.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
      nSel.value = String(st.n);
      [].forEach.call(root.querySelectorAll('.pz-lv button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === st.level)); });
    }
    function urlSync() {
      var u = new URLSearchParams(location.search);
      u.set('f', st.fam); u.set('l', st.level); if (st.kind !== 'auto') u.set('k', st.kind); else u.delete('k');
      u.set('n', st.n); u.set('p', st.paper); u.set('s', st.code);
      try { history.replaceState(null, '', location.pathname + '?' + u.toString() + location.hash); } catch (e) { /* ignore */ }
    }
    var pending = 0;
    function update() {
      syncOpts(); urlSync();
      var my = ++pending;
      $('#pz-status', root).textContent = 'Making your sheet…';
      setTimeout(function () { if (my === pending) draw(); }, 30);
    }
    function draw() {
      var pagesBox = $('#pz-pages', root), status = $('#pz-status', root);
      try {
        var sheet = makeSheet(st);
        var out = layoutSheet(sheet, st);
        pagesBox.innerHTML = '';
        out.forEach(function (pg) { pagesBox.appendChild(pg); });
        fitPreview(pagesBox);
        var nk = out.filter(function (p) { return p.getAttribute('data-key') === '1'; }).length, np = out.length - nk;
        status.textContent = out.length + ' page' + (out.length > 1 ? 's' : '') + ': ' + np + ' with puzzles' + (nk ? ', ' + nk + ' answer key' : '') + '. Sheet code ' + st.code + '.';
      } catch (e) {
        status.textContent = 'Sorry, that sheet could not be made. Try New sheet.';
        if (window.console) console.warn(e);
      }
    }
    fSel.addEventListener('change', function () { st.fam = fSel.value; st.kind = 'auto'; st.n = 0; update(); });
    kSel.addEventListener('change', function () { st.kind = kSel.value; update(); });
    nSel.addEventListener('change', function () { st.n = +nSel.value; update(); });
    pSel.addEventListener('change', function () { st.paper = pSel.value; savePrefs({ paper: st.paper }); update(); });
    sIn.addEventListener('change', function () { var c = P.cleanCode(sIn.value); if (!c) c = P.newCode(); st.code = c; sIn.value = c; update(); });
    root.querySelector('.pz-lv').addEventListener('click', function (e) { var b = e.target.closest('button[data-l]'); if (!b) return; st.level = b.getAttribute('data-l'); savePrefs({ level: st.level }); update(); });
    $('#pz-key', root).addEventListener('change', function (e) { st.key = e.target.checked; savePrefs({ key: st.key }); update(); });
    $('#pz-name', root).addEventListener('change', function (e) { st.name = e.target.checked; savePrefs({ name: st.name }); update(); });
    $('#pz-new', root).addEventListener('click', function () { st.code = P.newCode(); sIn.value = st.code; update(); });
    $('#pz-print', root).addEventListener('click', function () { setPageSize(st.paper); window.print(); });
    $('#pz-link', root).addEventListener('click', function () {
      var b = this, done = function (ok) { b.textContent = ok ? '✓ Link copied' : 'Copy the address bar'; setTimeout(function () { b.textContent = '🔗 Copy link'; }, 2200); };
      try { navigator.clipboard.writeText(location.href).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
    });
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { fitPreview($('#pz-pages', root)); }, 120); });
    window.addEventListener('beforeprint', function () { setPageSize(st.paper); });
    /* links elsewhere on the page that pick a family for the builder */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-pz-pick]'); if (!a) return;
      e.preventDefault(); st.fam = a.getAttribute('data-pz-pick'); st.kind = 'auto'; st.n = 0; fSel.value = st.fam; update();
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    update();
  }

  function setPageSize(paper) {
    var s = document.getElementById('pz-pagesize');
    if (!s) { s = document.createElement('style'); s.id = 'pz-pagesize'; }
    document.body.appendChild(s); /* last in the page, so it wins over any other @page rule */
    s.textContent = '@page{size:' + (paper === 'a4' ? 'A4' : 'letter') + ' portrait;margin:0}';
  }

  /* make the puzzles for a sheet */
  function makeSheet(st) {
    var items = [], title, sub;
    if (st.fam === 'sampler') {
      var r = P.rng(st.code + '|sampler|' + st.level), keys = r.shuffle(P.order.filter(function (k) { return FAM[k]; }));
      for (var i = 0; i < st.n; i++) {
        var fk = keys[i % keys.length], f = FAM[fk], g = P.fams[fk];
        var it = f.bundle ? P.bundle(fk, st.level, st.code, i, f.bundle) : P.make(fk, st.level, st.code, i, { kind: 'auto' });
        var top = g.top ? g.top(st.level) : '';
        it.head = '<p class="pz-ititle">' + esc(f.name) + '</p><p class="pz-iins">' + esc(f.ins) + '</p>' + top;
        it.cols = Math.min(it.cols, 2);
        items.push(it);
      }
      title = 'Puzzle Sampler'; sub = P.levelName[st.level] + ' · ' + st.n + ' puzzles';
    } else {
      items = P.sheet(st.fam, st.level, st.code, st.n, { kind: st.kind });
      var fm = FAM[st.fam], gen = P.fams[st.fam];
      title = fm.name;
      var kname = ''; if (gen.kinds && st.kind !== 'auto') gen.kinds.forEach(function (k) { if (k[0] === st.kind) kname = k[1] + ' · '; });
      sub = kname + P.levelName[st.level] + ' · ' + st.n + (st.n === 1 ? ' puzzle' : ' puzzles');
    }
    var gen2 = P.fams[st.fam];
    return {
      items: items, title: title, sub: sub,
      ins: st.fam === 'sampler' ? 'A mix of puzzle kinds. Each one has its own short instructions.' : FAM[st.fam].ins,
      top: gen2 && gen2.top ? gen2.top(st.level) : '', keyTop: gen2 && gen2.keyTop ? gen2.keyTop(st.level) : ''
    };
  }

  function pageShell(st, title, sub, pageLabel, extras, isKey) {
    var pg = el('div', 'pz-page pz-' + st.paper + (isKey ? ' pz-keypage' : ''));
    pg.innerHTML = '<header class="pz-ph"><div><b class="pz-pt">' + esc(title) + '</b><span class="pz-ps">' + esc(sub) + '</span></div>' +
      '<div class="pz-pc">Sheet <b>' + esc(st.code) + '</b><span>' + esc(pageLabel) + '</span></div></header>' + (extras || '') +
      '<div class="pz-pbody"></div><footer class="pz-pf">Teddy Rook Book · teddyrookbook.com/puzzles · Free to print and share. Code ' + esc(st.code) + ' makes this same sheet again.</footer>';
    return pg;
  }
  function rowsOf(items, colsFn, html, startNum) {
    var rows = [], cur = null;
    items.forEach(function (it, i) {
      var c = colsFn(it);
      if (!cur || cur.cols !== c || cur.items.length >= c) { cur = { cols: c, items: [] }; rows.push(cur); }
      cur.items.push({ it: it, n: i + (startNum || 1) });
    });
    return rows.map(function (rw) {
      return '<div class="pz-row" style="--cols:' + rw.cols + '">' + rw.items.map(function (x) {
        return '<div class="pz-item' + (x.it.head ? '' : ' pz-i-' + x.it.fam) + '"><div class="pz-ihead"><span class="pz-num">' + x.n + '</span>' + (x.it.sub && !html.key ? '<span class="pz-isub">' + esc(x.it.sub) + '</span>' : '') + '</div>' +
          '<div class="pz-ibody">' + (html.key ? '' : (x.it.head || '')) + (html.key ? x.it.a : x.it.q) + '</div></div>';
      }).join('') + '</div>';
    });
  }
  function layoutSheet(sheet, st) {
    var meas = el('div', 'pz-measure'); meas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(meas);
    var extras1 = (st.name ? '<div class="pz-namel"><span>Name</span><i></i><span>Date</span><i class="pz-short"></i></div>' : '') + '<p class="pz-ins">' + esc(sheet.ins) + '</p>' + (sheet.top || '');
    function pack(rowsHtml, title, sub, firstExtras, isKey) {
      /* measure what fits on a first page and on the pages after it */
      var p1 = pageShell(st, title, sub, 'Page 1 of 1', firstExtras, isKey), pN = pageShell(st, title, sub, 'Page 2 of 2', '', isKey);
      meas.innerHTML = ''; meas.appendChild(p1); meas.appendChild(pN);
      var avail1 = p1.querySelector('.pz-pbody').clientHeight, availN = pN.querySelector('.pz-pbody').clientHeight;
      var box = pN.querySelector('.pz-pbody'), hs = [];
      rowsHtml.forEach(function (h) { box.innerHTML = h; var r = box.firstChild; var cs = getComputedStyle(r); hs.push(r.getBoundingClientRect().height + parseFloat(cs.marginBottom || 0)); });
      var pages = [[]], used = 0, avail = avail1;
      hs.forEach(function (h, i) {
        if (used + h > avail + 1 && pages[pages.length - 1].length) { pages.push([]); used = 0; avail = availN; }
        pages[pages.length - 1].push(rowsHtml[i]); used += h;
      });
      return pages;
    }
    var colsQ = function (it) { return it.cols || 1; };
    var qPages = pack(rowsOf(sheet.items, colsQ, {}), sheet.title, sheet.sub, extras1, false);
    var kPages = [];
    if (st.key) {
      var kc = keyCols(st.fam, sheet.items[0]);
      kPages = pack(rowsOf(sheet.items, function () { return kc; }, { key: true }), 'Answer key: ' + sheet.title, sheet.sub, sheet.keyTop || '', true);
    }
    document.body.removeChild(meas);
    var out = [], total = qPages.length;
    qPages.forEach(function (rows, i) {
      var pg = pageShell(st, sheet.title, sheet.sub, 'Page ' + (i + 1) + ' of ' + total, i === 0 ? extras1 : '', false);
      pg.querySelector('.pz-pbody').innerHTML = rows.join('');
      out.push(frame(pg, false));
    });
    kPages.forEach(function (rows, i) {
      var pg = pageShell(st, 'Answer key: ' + sheet.title, sheet.sub, 'Answers ' + (i + 1) + ' of ' + kPages.length, i === 0 ? (sheet.keyTop || '') : '', true);
      pg.querySelector('.pz-pbody').innerHTML = rows.join('');
      out.push(frame(pg, true));
    });
    return out;
  }
  function frame(pg, isKey) { var f = el('div', 'pz-frame'); if (isKey) f.setAttribute('data-key', '1'); f.appendChild(pg); return f; }
  function fitPreview(box) {
    if (!box) return;
    var w = box.clientWidth;
    [].forEach.call(box.querySelectorAll('.pz-frame'), function (f) {
      var pg = f.firstChild; pg.style.transform = '';
      var pw = pg.offsetWidth, ph = pg.offsetHeight, s = Math.min(1, w / pw);
      f.style.width = (pw * s) + 'px'; f.style.height = (ph * s) + 'px';
      pg.style.transform = s < 1 ? 'scale(' + s + ')' : '';
    });
  }

  /* ================= on-screen play ================= */
  var PL = document.getElementById('pz-play');
  if (PL) initPlay(PL);

  function initPlay(root) {
    var fam = root.getAttribute('data-fam'), gen = P.fams[fam], f = FAM[fam];
    if (!gen || !f) return;
    var st = { level: prefs.playLevel && prefs.playLevel[fam] || 'easy', kind: 'auto', code: P.newCode() };
    root.innerHTML =
      '<div class="pz-pbar">' +
      '<fieldset class="pz-lv"><legend class="hs-small">Level</legend>' + P.levels.map(function (l) { return '<button type="button" data-l="' + l + '" aria-pressed="false">' + P.levelName[l] + '</button>'; }).join('') + '</fieldset>' +
      (gen.kinds ? '<label class="pz-fld">Kind<select id="pz-pk">' + gen.kinds.map(function (k) { return '<option value="' + k[0] + '">' + esc(k[1]) + '</option>'; }).join('') + '</select></label>' : '') +
      '<button type="button" class="hs-btn" id="pz-pnew">🔄 New puzzle</button></div>' +
      '<div class="pz-board" id="pz-board"></div>' +
      '<div class="pz-pacts"><button type="button" class="hs-btn pri" id="pz-pcheck">✔ Check</button><button type="button" class="hs-btn" id="pz-pshow" aria-expanded="false">Show answer</button><span class="pz-pmsg" id="pz-pmsg" role="status" aria-live="polite"></span></div>' +
      '<div class="pz-board pz-pans" id="pz-pans" hidden></div>';
    var board = $('#pz-board', root), ans = $('#pz-pans', root), msg = $('#pz-pmsg', root), checkBtn = $('#pz-pcheck', root), showBtn = $('#pz-pshow', root);
    var checker = null, cur = null;
    function sync() { [].forEach.call(root.querySelectorAll('.pz-lv button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === st.level)); }); }
    function make() {
      sync(); msg.textContent = ''; ans.hidden = true; showBtn.setAttribute('aria-expanded', 'false'); showBtn.textContent = 'Show answer';
      try { cur = P.make(fam, st.level, st.code, 0, { kind: st.kind }); } catch (e) { msg.textContent = 'Could not make a puzzle. Try New puzzle.'; return; }
      board.innerHTML = ''; ans.innerHTML = cur.a;
      var g = P.fams[fam], top = g.top ? g.top(st.level) : '';
      checker = mount(fam, cur, board, top);
      checkBtn.hidden = !checker;
    }
    root.querySelector('.pz-lv').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-l]'); if (!b) return; st.level = b.getAttribute('data-l');
      var pl = loadPrefs().playLevel || {}; pl[fam] = st.level; savePrefs({ playLevel: pl });
      st.code = P.newCode(); make();
    });
    var ks = $('#pz-pk', root); if (ks) ks.addEventListener('change', function () { st.kind = ks.value; st.code = P.newCode(); make(); });
    $('#pz-pnew', root).addEventListener('click', function () { st.code = P.newCode(); make(); });
    checkBtn.addEventListener('click', function () { if (checker) msg.textContent = checker(); });
    showBtn.addEventListener('click', function () { var open = ans.hidden; ans.hidden = !open; showBtn.setAttribute('aria-expanded', String(open)); showBtn.textContent = open ? 'Hide answer' : 'Show answer'; });
    make();
  }
  function norm(s) { return String(s).toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/^0+(?=.)/, ''); }

  /* put a puzzle on screen and return a check function (or null) */
  function mount(fam, it, board, top) {
    var pl = it.play;
    if (pl && pl.kind === 'cells' && (fam === 'sudoku' || fam === 'cages')) return cellGrid(board, pl, fam);
    board.innerHTML = '<div class="pz-paper">' + (top || '') + it.q + '</div>';
    var paper = board.firstChild;
    if (pl && pl.kind === 'cells') return injectCells(paper, pl, fam);
    if (pl && pl.kind === 'nono') { paper.innerHTML = ''; return nonoPlay(paper, pl); }
    if (pl && pl.kind === 'lgrid') return lgridPlay(paper, pl);
    if (pl && pl.kind === 'maze') return mazePlay(paper, pl);
    if (it.choice) return choicePlay(paper, it.choice);
    if (it.ans) return answerPlay(paper, it.ans);
    return null;
  }
  function digitInput(inp, max) {
    inp.addEventListener('input', function () { var v = inp.value.replace(/[^0-9]/g, ''); if (max <= 9) v = v.slice(-1); else v = v.slice(-2); if (v && (+v < 1 || +v > max)) v = ''; inp.value = v; inp.classList.remove('pz-bad'); });
  }
  function arrowNav(container, sel, cols) {
    container.addEventListener('keydown', function (e) {
      var list = [].slice.call(container.querySelectorAll(sel)), i = list.indexOf(document.activeElement); if (i < 0) return;
      var d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key]; if (!d) return;
      var j = i + d; if (j >= 0 && j < list.length) { e.preventDefault(); list[j].focus(); }
    });
  }
  function cellGrid(board, pl, fam) {
    var n = pl.n, cageOf = [], labels = {};
    if (pl.cages) pl.cages.forEach(function (cg, ci) { cg.cells.forEach(function (x) { cageOf[x] = ci; }); var f0 = Math.min.apply(null, cg.cells); labels[f0] = cg.t + (cg.cells.length > 1 ? cg.op : ''); });
    var h = '<div class="pz-paper"><div class="pz-pg" style="--n:' + n + '" role="group" aria-label="' + n + ' by ' + n + ' grid">';
    for (var i = 0; i < n * n; i++) {
      var r = Math.floor(i / n), c = i % n, cls = [];
      if (pl.box) { if (r % pl.box[0] === 0) cls.push('t'); if (c % pl.box[1] === 0) cls.push('l'); }
      if (pl.cages) { if (r === 0 || cageOf[i - n] !== cageOf[i]) cls.push('t'); if (c === 0 || cageOf[i - 1] !== cageOf[i]) cls.push('l'); }
      if (r === n - 1) cls.push('b'); if (c === n - 1) cls.push('r');
      var gv = pl.givens[i];
      h += '<div class="pz-pcell ' + cls.join(' ') + '">' + (labels[i] ? '<span class="pz-clab">' + esc(labels[i]) + '</span>' : '') +
        '<input inputmode="numeric" autocomplete="off" aria-label="Row ' + (r + 1) + ', column ' + (c + 1) + '"' + (gv ? ' value="' + gv + '" readonly class="pz-giv"' : '') + '></div>';
    }
    board.innerHTML = h + '</div></div>';
    var inputs = [].slice.call(board.querySelectorAll('input'));
    inputs.forEach(function (inp) { if (!inp.readOnly) digitInput(inp, n); });
    arrowNav(board, 'input', n);
    return function () { return checkInputs(inputs, pl.sol); };
  }
  function checkInputs(inputs, sol) {
    var wrong = 0, empty = 0;
    inputs.forEach(function (inp, i) {
      inp.classList.remove('pz-bad');
      if (inp.readOnly) return;
      if (!inp.value) { empty++; return; }
      if (+inp.value !== sol[i]) { wrong++; inp.classList.add('pz-bad'); }
    });
    if (wrong) return wrong + ' square' + (wrong > 1 ? 's don’t' : ' doesn’t') + ' fit yet (marked). Keep going!';
    if (empty) return 'So far so good. ' + empty + ' square' + (empty > 1 ? 's' : '') + ' left.';
    return '🎉 Solved! Every square is right.';
  }
  function injectCells(paper, pl, fam) {
    var tds = [].slice.call(paper.querySelectorAll(fam === 'crosssum' ? 'td.pz-xn' : 'table.pz-grid td'));
    var inputs = [];
    tds.forEach(function (td, i) {
      var inp = document.createElement('input');
      inp.setAttribute('inputmode', 'numeric'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('aria-label', 'Square ' + (i + 1));
      if (pl.givens[i]) { inp.value = pl.givens[i]; inp.readOnly = true; inp.className = 'pz-giv'; }
      else digitInput(inp, 99);
      td.textContent = ''; td.appendChild(inp); inputs.push(inp);
    });
    arrowNav(paper, 'input', pl.n);
    return function () { return checkInputs(inputs, pl.sol); };
  }
  function nonoPlay(paper, pl) {
    var g = pl.g, cl = pl.clues, h = g.length, w = g[0].length, state = g.map(function (row) { return row.map(function () { return 0; }); });
    var mr = Math.max.apply(null, cl.rows.map(function (x) { return x.length; })), mc = Math.max.apply(null, cl.cols.map(function (x) { return x.length; }));
    var t = '<div class="pz-nscroll"><table class="pz-nplay" style="--w:' + w + '"><thead>';
    for (var k = 0; k < mc; k++) {
      t += '<tr><th colspan="' + mr + '"></th>';
      for (var c = 0; c < w; c++) { var cc = cl.cols[c], v = cc[k - (mc - cc.length)]; t += '<th class="pz-ncc' + (c % 5 === 0 && c ? ' l5' : '') + '">' + (v != null ? v : '') + '</th>'; }
      t += '</tr>';
    }
    t += '</thead><tbody>';
    for (var r = 0; r < h; r++) {
      t += '<tr' + (r % 5 === 0 && r ? ' class="t5"' : '') + '>';
      for (k = 0; k < mr; k++) { var rc = cl.rows[r], v2 = rc[k - (mr - rc.length)]; t += '<th class="pz-nrc">' + (v2 != null ? v2 : '') + '</th>'; }
      for (c = 0; c < w; c++) t += '<td' + (c % 5 === 0 && c ? ' class="l5"' : '') + '><button type="button" data-r="' + r + '" data-c="' + c + '" aria-label="Row ' + (r + 1) + ', column ' + (c + 1) + ': empty"></button></td>';
      t += '</tr>';
    }
    paper.innerHTML = '<p class="pz-note">Tap a square once to shade it, again to mark it with a dot (empty), and again to clear it.</p>' + (w > 8 ? '<p class="pz-note pz-swipe">Big grid: swipe sideways if it doesn’t all fit.</p>' : '') + t + '</tbody></table></div>';
    var names = ['empty', 'shaded', 'marked empty'];
    paper.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-r]'); if (!b) return;
      var rr = +b.getAttribute('data-r'), c2 = +b.getAttribute('data-c'), s = (state[rr][c2] + 1) % 3;
      state[rr][c2] = s; b.className = s === 1 ? 'on' : s === 2 ? 'dot' : ''; b.setAttribute('aria-label', 'Row ' + (rr + 1) + ', column ' + (c2 + 1) + ': ' + names[s]);
    });
    arrowNav(paper, 'button[data-r]', w);
    return function () {
      var wrong = 0, missing = 0;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var on = state[y][x] === 1; if (on && !g[y][x]) wrong++; if (!on && g[y][x]) missing++; }
      if (wrong) return wrong + ' shaded square' + (wrong > 1 ? 's are' : ' is') + ' not part of the picture.';
      if (missing) return 'No mistakes so far. ' + missing + ' more to shade.';
      return '🎉 Solved! The picture is complete.';
    };
  }
  function lgridPlay(paper, pl) {
    var marks = ['', '✗', '●'];
    paper.insertAdjacentHTML('afterbegin', '<p class="pz-note">Tap a square once for ✗ (no), again for ● (yes), and again to clear it.</p><p class="pz-note pz-swipe">The grid is wide. Swipe sideways to see all of it.</p>');
    [].forEach.call(paper.querySelectorAll('td.pz-lgc'), function (td) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'blank'); b.setAttribute('data-m', '0'); td.appendChild(b);
    });
    paper.addEventListener('click', function (e) {
      var b = e.target.closest('td.pz-lgc button'); if (!b) return;
      var m = (+b.getAttribute('data-m') + 1) % 3; b.setAttribute('data-m', m); b.textContent = marks[m]; b.setAttribute('aria-label', m === 0 ? 'blank' : m === 1 ? 'no' : 'yes');
    });
    return function () {
      var wrong = 0, yes = 0, need = 0;
      [].forEach.call(paper.querySelectorAll('td.pz-lgc'), function (td) {
        var rr = td.getAttribute('data-r').split('.').map(Number), cc = td.getAttribute('data-c').split('.').map(Number);
        var person = pl.sol[rr[0]].indexOf(rr[1]), truth = pl.sol[cc[0]][person] === cc[1], m = +td.firstChild.getAttribute('data-m');
        if (truth) need++;
        if (m === 2) { yes++; if (!truth) wrong++; }
        if (m === 1 && truth) wrong++;
        td.classList.toggle('pz-bad', (m === 2 && !truth) || (m === 1 && truth));
      });
      if (wrong) return wrong + ' mark' + (wrong > 1 ? 's are' : ' is') + ' wrong (shown in red).';
      if (yes < need) return 'No mistakes so far. ' + (need - yes) + ' more ● to place.';
      return '🎉 Solved! Every match is right.';
    };
  }
  function mazePlay(paper, pl) {
    var m = pl.m, path = [0], svg = paper.querySelector('svg');
    paper.insertAdjacentHTML('afterbegin', '<p class="pz-note">Use the arrow keys, or tap the next square, to draw your path. Tap a square on your path to back up to it.</p>');
    svg.setAttribute('tabindex', '0'); svg.setAttribute('aria-label', 'maze: use the arrow keys to move');
    var vb = svg.viewBox.baseVal, s = 20, o = 3, line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#0a7a45'); line.setAttribute('stroke-width', '5'); line.setAttribute('stroke-linecap', 'round'); line.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(line);
    var done = false;
    function draw() { line.setAttribute('points', path.map(function (c) { return (o + (c % m.w) * s + s / 2) + ',' + (o + Math.floor(c / m.w) * s + s / 2); }).join(' ')); }
    function step(n) {
      if (done) return;
      var i = path.indexOf(n);
      if (i >= 0) { path = path.slice(0, i + 1); draw(); return; }
      if (P.mazeNbrs(m, path[path.length - 1]).indexOf(n) < 0) return;
      path.push(n); draw();
      if (n === m.w * m.h - 1) { done = true; var mm = paper.closest('.pz-play').querySelector('.pz-pmsg'); if (mm) mm.textContent = '🎉 You made it out!'; }
    }
    svg.addEventListener('keydown', function (e) {
      var c = path[path.length - 1], d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: m.w, ArrowUp: -m.w }[e.key]; if (!d) return;
      e.preventDefault();
      var nx = c + d; if ((d === 1 && c % m.w === m.w - 1) || (d === -1 && c % m.w === 0)) return;
      if (path.length > 1 && path[path.length - 2] === nx) { path.pop(); draw(); return; }
      step(nx);
    });
    svg.addEventListener('click', function (e) {
      var pt = svg.getBoundingClientRect(), x = (e.clientX - pt.left) / pt.width * vb.width, y = (e.clientY - pt.top) / pt.height * vb.height;
      var cx = Math.floor((x - o) / s), cy = Math.floor((y - o) / s); if (cx < 0 || cy < 0 || cx >= m.w || cy >= m.h) return;
      step(cy * m.w + cx);
    });
    draw();
    return function () { return done ? '🎉 You made it out!' : 'Keep going. Your path is ' + (path.length - 1) + ' steps long so far.'; };
  }
  function choicePlay(paper, ch) {
    var L = ['A', 'B', 'C', 'D', 'E'], picked = -1;
    var row = el('div', 'pz-cbtns', L.slice(0, ch.n).map(function (l, i) { return '<button type="button" class="hs-btn" data-i="' + i + '" aria-pressed="false">' + l + '</button>'; }).join(''));
    paper.appendChild(row);
    row.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (!b) return; picked = +b.getAttribute('data-i');
      [].forEach.call(row.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); x.classList.remove('pz-bad', 'pz-good'); });
    });
    return function () {
      if (picked < 0) return 'Pick a letter first.';
      var b = row.children[picked]; b.classList.add(picked === ch.correct ? 'pz-good' : 'pz-bad');
      return picked === ch.correct ? '🎉 Right!' : 'Not that one. Try again.';
    };
  }
  function answerPlay(paper, list) {
    var box = el('div', 'pz-abox', list.map(function (a, i) { return '<label class="pz-fld">' + esc(a.label) + '<input type="text" autocomplete="off" spellcheck="false" data-i="' + i + '"></label>'; }).join(''));
    paper.appendChild(box);
    var inputs = [].slice.call(box.querySelectorAll('input'));
    return function () {
      var right = 0, filled = 0;
      inputs.forEach(function (inp, i) { inp.classList.remove('pz-bad', 'pz-good'); if (!inp.value.trim()) return; filled++; var good = norm(inp.value) === norm(list[i].value); if (good) right++; inp.classList.add(good ? 'pz-good' : 'pz-bad'); });
      if (!filled) return 'Type your answer first.';
      return right === inputs.length ? '🎉 Right!' : 'Not quite yet. Look again.';
    };
  }
})();
