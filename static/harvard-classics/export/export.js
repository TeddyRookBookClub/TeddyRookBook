/* The Harvard Classics, fifteen minutes a day: the export page (/harvard-classics/export/). Choose readings (days on
   a mini calendar, a range of dates, months, the days coming up, an author, a work or a volume), choose what goes in,
   and make an EPUB or a text file right here (hc-book.js), or open the print layout for a PDF.
   The page data (#hc-xp-data, from partials/harvard-classics/export-data.html) has one short entry a day and the
   addresses of the month texts, which are fetched only when a file is made.
   Remembered on this device: localStorage 'trb-hc-v1' → .export = {d: selection, start, label, o: options}, next to
   what hc.js keeps there (the last reading finished). Links in: ?day=MM-DD, ?m=3 (or 3,4), ?all=1, ?d=<selection>. */
(function () {
  'use strict';
  var D = document, W = window, B = W.HCBook, KEY = 'trb-hc-v1';
  var app = D.getElementById('hc-xapp'), root = D.getElementById('hc-xp');
  if (!app || !B) return;
  var X = {}; try { X = JSON.parse(D.getElementById('hc-xp-data').textContent || '{}'); } catch (e) { }
  var M = B.MONTHS, MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load() { try { var o = JSON.parse(W.localStorage.getItem(KEY) || 'null'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function store(patch) { try { var o = load(); for (var k in patch) o[k] = patch[k]; W.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }

  /* ── the index ── */
  var IDX = {}, LIST = [], AUTH = {}, WORK = {}, VOL = {};
  (X.index || []).forEach(function (e) {
    var d = { id: e[0], title: e[1], words: e[2] || 0, minutes: e[3] || 0, reads: e[4] || [] };
    IDX[d.id] = d; LIST.push(d.id);
    d.reads.forEach(function (r) {
      var add = function (map, k, fresh) { var o = map[k] || (map[k] = fresh); if (o.ids[o.ids.length - 1] !== d.id) o.ids.push(d.id); };
      if (r.a) add(AUTH, r.a, { name: r.a, ids: [] });
      add(WORK, r.v + '|' + r.a + '|' + r.w, { v: r.v, a: r.a, w: r.w, ids: [] });
      add(VOL, r.v, { v: r.v, ids: [] });
    });
  });
  var VOLS = {}; (X.vols || []).forEach(function (v) { VOLS[v[0]] = { short: v[1], title: v[2] }; });

  /* ── state ── */
  var DEF = { intro: true, gnotes: true, notes: true, pages: false, front: true, openers: true, size: 'letter', type: 'normal', lay: 'page', title: '' };
  var S = { sel: {}, start: null, label: null, o: {}, cur: new Date().getMonth() + 1, anchor: null, focus: null }, k;
  for (k in DEF) S.o[k] = DEF[k];
  var now = new Date();
  function idOf(d) { return B.pad(d.getMonth() + 1) + '-' + B.pad(d.getDate()); }
  function ids() { return B.order(Object.keys(S.sel).filter(function (id) { return IDX[id]; }), S.start); }
  function setSelQuiet(list, start) { S.sel = {}; list.forEach(function (id) { if (IDX[id]) S.sel[id] = 1; }); S.start = start || null; if (list.length) S.cur = B.monthOf(B.order(list, start)[0]); }
  function setSel(list, start, label, add) {
    if (!add) S.sel = {};
    list.forEach(function (id) { if (IDX[id]) S.sel[id] = 1; });
    S.start = add ? null : start || null;
    S.label = add ? null : label || null;
    if (list.length) S.cur = B.monthOf(list[0]);
    changed();
  }
  var saved = load().export || {};
  var q = new URLSearchParams(location.search);
  if (q.get('day') && IDX[q.get('day')]) setSelQuiet([q.get('day')]);
  else if (q.get('m')) setSelQuiet([].concat.apply([], q.get('m').split(',').map(function (m) { return LIST.filter(function (id) { return B.monthOf(id) === +m; }); })));
  else if (q.get('all')) setSelQuiet(LIST.slice());
  else if (q.get('d')) setSelQuiet(B.decodeSel(q.get('d')), q.get('start'));
  else if (saved.d) { setSelQuiet(B.decodeSel(saved.d), saved.start); S.label = saved.label || null; }
  else if (IDX[idOf(now)]) setSelQuiet([idOf(now)]);
  if (saved.o) for (k in DEF) if (typeof saved.o[k] === typeof DEF[k]) S.o[k] = saved.o[k];
  if (q.get('day') || q.get('m') || q.get('all') || q.get('d')) S.o.title = '';

  function rangeLabel(list) { return S.label || B.rangeName(list) || (list.length ? B.plural(list.length, 'Reading') : ''); }
  function autoTitle(list) { return 'Fifteen Minutes a Day' + (list.length ? ': ' + rangeLabel(list) : ''); }
  function title(list) { return S.o.title.trim() || autoTitle(list); }

  /* ── the calendar ── */
  var grid = $('hc-xgrid'), Y = now.getFullYear();
  function monthIds(m) { return LIST.filter(function (id) { return B.monthOf(id) === m; }); }
  function drawCal() {
    var m = S.cur, n = B.MLEN[m - 1], h = '', first = new Date(Y, m - 1, 1).getDay();
    $('hc-xclab').textContent = M[m - 1];
    $('hc-cmn1').textContent = $('hc-cmn2').textContent = M[m - 1];
    for (var d = 1; d <= n; d++) {
      var id = B.pad(m) + '-' + B.pad(d), e = IDX[id];
      if (!e) continue;
      var on = !!S.sel[id], today = id === idOf(now);
      h += '<button type="button" class="hc-xd' + (today ? ' now' : '') + (id === '02-29' ? ' leap' : '') + '" data-id="' + id + '" aria-pressed="' + on + '" tabindex="-1"' + (d === 1 ? ' style="grid-column-start:' + (first + 1) + '"' : '') +
        ' aria-label="' + esc(M[m - 1] + ' ' + d + ': ' + e.title + (today ? ' (today)' : '') + (id === '02-29' ? ' (leap years)' : '')) + '" title="' + esc(e.title) + '"><b>' + d + '</b><span>' + esc(e.title) + '</span></button>';
    }
    grid.innerHTML = h;
    var f = (S.focus && B.monthOf(S.focus) === m && grid.querySelector('[data-id="' + S.focus + '"]')) || grid.querySelector('[aria-pressed="true"]') || grid.querySelector('.now') || grid.firstElementChild;
    if (f) f.tabIndex = 0;
    var counts = {}; Object.keys(S.sel).forEach(function (id) { var mm = B.monthOf(id); counts[mm] = (counts[mm] || 0) + 1; });
    var ch = '', mp = '', i;
    for (i = 1; i <= 12; i++) ch += '<button type="button" data-m="' + i + '"' + (i === m ? ' aria-current="true"' : '') + ' aria-label="' + M[i - 1] + (counts[i] ? ', ' + counts[i] + ' chosen' : ', none chosen') + '"><span>' + MS[i - 1] + '</span><small>' + (counts[i] || '·') + '</small></button>';
    $('hc-xmchips').innerHTML = ch;
    for (i = 1; i <= 12; i++) { var all = monthIds(i), full = all.length > 0 && all.every(function (x) { return S.sel[x]; }); mp += '<button type="button" class="hc-btn" data-m="' + i + '" aria-pressed="' + full + '">' + M[i - 1] + '</button>'; }
    $('hc-xmonths').innerHTML = mp;
  }
  function toggleDay(id, shift) {
    if (shift && S.anchor && S.anchor !== id) {
      var a = B.POS[S.anchor], b = B.POS[id], lo = Math.min(a, b), hi = Math.max(a, b), val = !!S.sel[S.anchor];
      B.ALL.slice(lo, hi + 1).forEach(function (x) { if (IDX[x]) { if (val) S.sel[x] = 1; else delete S.sel[x]; } });
    } else { if (S.sel[id]) delete S.sel[id]; else S.sel[id] = 1; S.anchor = id; }
    S.focus = id; S.label = null; S.start = null;
    changed();
    var btn = grid.querySelector('[data-id="' + id + '"]'); if (btn) btn.focus();
  }
  grid.addEventListener('click', function (e) { var b = e.target.closest('.hc-xd'); if (b) toggleDay(b.getAttribute('data-id'), e.shiftKey); });
  grid.addEventListener('keydown', function (e) {
    var b = e.target.closest('.hc-xd'); if (!b) return;
    var list = Array.prototype.slice.call(grid.querySelectorAll('.hc-xd')), i = list.indexOf(b), j = i;
    if (e.key === 'ArrowRight') j = i + 1; else if (e.key === 'ArrowLeft') j = i - 1; else if (e.key === 'ArrowDown') j = i + 7; else if (e.key === 'ArrowUp') j = i - 7;
    else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = list.length - 1;
    else if (e.key === 'PageDown' || e.key === 'PageUp') { e.preventDefault(); go(e.key === 'PageDown' ? 1 : -1, 'same'); return; }
    else return;
    e.preventDefault();
    if (j < 0 || j >= list.length) { go(j < 0 ? -1 : 1, j < 0 ? 'last' : 'first'); return; }
    list[i].tabIndex = -1; list[j].tabIndex = 0; list[j].focus(); S.focus = list[j].getAttribute('data-id');
  });
  function go(dm, where) {
    S.cur = (S.cur + dm + 11) % 12 + 1; S.focus = null; drawCal();
    if (where) {
      var l = grid.querySelectorAll('.hc-xd'), t = where === 'last' ? l[l.length - 1] : where === 'first' ? l[0] : grid.querySelector('[tabindex="0"]');
      if (t) { l.forEach(function (x) { x.tabIndex = -1; }); t.tabIndex = 0; t.focus(); S.focus = t.getAttribute('data-id'); }
    }
  }
  $('hc-cprev').addEventListener('click', function () { go(-1); });
  $('hc-cnext').addEventListener('click', function () { go(1); });
  $('hc-xmchips').addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) { S.cur = +b.getAttribute('data-m'); S.focus = null; drawCal(); var c = $('hc-xmchips').querySelector('[data-m="' + S.cur + '"]'); if (c) c.focus(); } });
  $('hc-cmall').addEventListener('click', function () { monthIds(S.cur).forEach(function (id) { S.sel[id] = 1; }); S.label = null; S.start = null; changed(); });
  $('hc-cmnone').addEventListener('click', function () { monthIds(S.cur).forEach(function (id) { delete S.sel[id]; }); S.label = null; S.start = null; changed(); });
  $('hc-clear').addEventListener('click', function () { S.sel = {}; S.label = null; S.start = null; changed(); });

  /* ── the ways to choose ── */
  var tabs = Array.prototype.slice.call(app.querySelectorAll('[role="tab"]'));
  function showTab(t, focus) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $(x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showTab(t); });
    t.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (j == null) return; e.preventDefault(); showTab(tabs[(j + tabs.length) % tabs.length], true);
    });
  });
  var addBox = $('hc-add');
  function add() { return addBox.checked; }
  // one day
  var jump = $('hc-jump');
  jump.value = Y + '-' + idOf(now);
  jump.addEventListener('change', function () { var v = /^\d{4}-(\d\d)-(\d\d)$/.exec(jump.value); if (!v) return; var id = v[1] + '-' + v[2]; if (!IDX[id]) return; S.cur = +v[1]; S.focus = id; drawCal(); });
  $('hc-only').addEventListener('click', function () { var v = /^\d{4}-(\d\d)-(\d\d)$/.exec(jump.value), id = v ? v[1] + '-' + v[2] : idOf(now); if (IDX[id]) { S.focus = id; setSel([id], id, null, add()); } });
  // a range of dates
  function fillDays(ms, ds) {
    var m = +ms.value, n = B.MLEN[m - 1], keep = ds.value, h = '';
    for (var d = 1; d <= n; d++) h += '<option value="' + d + '">' + d + (m === 2 && d === 29 ? ' (leap day)' : '') + '</option>';
    ds.innerHTML = h; ds.value = keep && +keep <= n ? keep : '1';
  }
  [['hc-fm', 'hc-fd'], ['hc-tm', 'hc-td']].forEach(function (p, i) {
    var ms = $(p[0]), ds = $(p[1]);
    ms.innerHTML = M.map(function (n, j) { return '<option value="' + (j + 1) + '">' + n + '</option>'; }).join('');
    var d0 = i ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6) : now;
    ms.value = String(d0.getMonth() + 1); fillDays(ms, ds); ds.value = String(d0.getDate());
    ms.addEventListener('change', function () { fillDays(ms, ds); });
  });
  $('hc-range-go').addEventListener('click', function () {
    var a = B.pad(+$('hc-fm').value) + '-' + B.pad(+$('hc-fd').value), b = B.pad(+$('hc-tm').value) + '-' + B.pad(+$('hc-td').value);
    var pb = B.POS[b], list = [];
    for (var p = B.POS[a]; ; p = (p + 1) % 366) { list.push(B.ALL[p]); if (p === pb) break; }
    setSel(list, a, null, add());
  });
  // months
  $('hc-xmonths').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-m]'); if (!b) return;
    var m = +b.getAttribute('data-m'), list = monthIds(m), full = list.every(function (id) { return S.sel[id]; });
    if (full) { list.forEach(function (id) { delete S.sel[id]; }); S.label = null; S.start = null; S.cur = m; changed(); }
    else {
      var onlyMonths = Object.keys(S.sel).every(function (id) { return monthIds(B.monthOf(id)).every(function (x) { return S.sel[x]; }); });
      setSel(list, null, null, add() || onlyMonths);
      S.cur = m; drawCal();
    }
    var nb = $('hc-xmonths').querySelector('[data-m="' + m + '"]'); if (nb) nb.focus();
  });
  $('hc-all').addEventListener('click', function () { setSel(LIST.slice(), null, null, false); });
  // coming up
  app.querySelector('.hc-xsoon').addEventListener('click', function (e) {
    var b = e.target.closest('[data-soon]'); if (!b) return;
    var kind = b.getAttribute('data-soon'), t = new Date(now.getFullYear(), now.getMonth(), now.getDate()), n = 1;
    if (kind === 'week') { t = new Date(t.getFullYear(), t.getMonth(), t.getDate() - t.getDay()); n = 7; }
    else if (kind === '7') n = 7; else if (kind === '30') n = 30;
    else if (kind === 'month') n = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate() - t.getDate() + 1;
    var list = [];
    for (var i = 0; i < n; i++) { var id = idOf(new Date(t.getFullYear(), t.getMonth(), t.getDate() + i)); if (IDX[id]) list.push(id); }
    setSel(list, list[0], null, add());
  });
  // author, work, volume
  function byName(a, b) { return a.localeCompare(b, 'en', { sensitivity: 'base' }); }
  $('hc-author').innerHTML = Object.keys(AUTH).sort(byName).map(function (a) { return '<option value="' + esc(a) + '">' + esc(a) + ' (' + B.plural(AUTH[a].ids.length, 'day') + ')</option>'; }).join('');
  var wsel = '', lastV = null;
  Object.keys(WORK).map(function (key) { return WORK[key]; }).sort(function (a, b) { return a.v - b.v || byName(a.a + a.w, b.a + b.w); }).forEach(function (w) {
    if (w.v !== lastV) { wsel += (lastV != null ? '</optgroup>' : '') + '<optgroup label="' + esc('Volume ' + w.v + (VOLS[w.v] ? ': ' + VOLS[w.v].short : '')) + '">'; lastV = w.v; }
    wsel += '<option value="' + esc(w.v + '|' + w.a + '|' + w.w) + '">' + esc(w.w + (w.a ? ', ' + w.a : '')) + ' (' + B.plural(w.ids.length, 'day') + ')</option>';
  });
  $('hc-work').innerHTML = wsel + (lastV != null ? '</optgroup>' : '');
  $('hc-vol').innerHTML = Object.keys(VOL).map(Number).sort(function (a, b) { return a - b; }).map(function (v) { return '<option value="' + v + '">' + esc('Volume ' + v + (VOLS[v] ? ': ' + VOLS[v].short : '')) + ' (' + B.plural(VOL[v].ids.length, 'day') + ')</option>'; }).join('');
  $('hc-author-go').addEventListener('click', function () { var a = AUTH[$('hc-author').value]; if (a) setSel(a.ids, null, a.name, add()); });
  $('hc-work-go').addEventListener('click', function () {
    var w = WORK[$('hc-work').value]; if (!w) return;
    var last = w.a ? w.a.split(' ').filter(function (x) { return !/^(Jr\.|Sr\.)$/.test(x); }).pop().replace(/,$/, '') : '';
    setSel(w.ids, null, w.w + (w.a && w.w.indexOf(last) < 0 ? ', by ' + w.a : ''), add());
  });
  $('hc-vol-go').addEventListener('click', function () { var v = VOL[$('hc-vol').value]; if (v) setSel(v.ids, null, 'Volume ' + v.v + (VOLS[v.v] && VOLS[v.v].short ? ' (' + VOLS[v.v].short + ')' : ''), add()); });

  /* ── options ── */
  var CHK = ['intro', 'gnotes', 'notes', 'pages', 'front', 'openers'];
  CHK.forEach(function (key) { var c = $('o-' + key); c.checked = !!S.o[key]; c.addEventListener('change', function () { S.o[key] = c.checked; changed(true); }); });
  ['size', 'type', 'lay'].forEach(function (key) {
    var g = $('o-' + key), bs = Array.prototype.slice.call(g.querySelectorAll('[role="radio"]'));
    var set = function (v, focus) { S.o[key] = v; bs.forEach(function (b) { var on = b.getAttribute('data-v') === v; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); }); };
    set(S.o[key]);
    bs.forEach(function (b, i) {
      b.addEventListener('click', function () { set(b.getAttribute('data-v')); changed(true); });
      b.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
        if (j == null) return; e.preventDefault(); set(bs[(j + bs.length) % bs.length].getAttribute('data-v'), true); changed(true);
      });
    });
  });
  var tIn = $('o-title');
  tIn.value = S.o.title;
  tIn.addEventListener('input', function () { S.o.title = tIn.value; changed(true); });

  /* ── the cover ── */
  var canvas = $('hc-cover');
  function coverOpts(list) {
    var vols = {}; list.forEach(function (id) { IDX[id].reads.forEach(function (r) { vols[r.v] = 1; }); });
    return { title: title(list), range: rangeLabel(list), count: list.length ? B.plural(list.length, 'reading') : '', vols: Object.keys(vols).map(Number) };
  }
  function drawCover() { var ctx = canvas.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); B.cover(ctx, canvas.width, canvas.height, coverOpts(ids())); }
  var fontsLoaded = (function () {
    var base = root.getAttribute('data-fonts') || '/harvard-classics/fonts/';
    if (!W.FontFace || !D.fonts) return Promise.resolve();
    var faces = [new FontFace('HC Book', 'url(' + base + 'hcbook-regular.woff) format("woff")', { style: 'normal', weight: '400' }), new FontFace('HC Book', 'url(' + base + 'hcbook-italic.woff) format("woff")', { style: 'italic', weight: '400' })];
    return Promise.all(faces.map(function (f) { return f.load().then(function (x) { D.fonts.add(x); }); })).then(drawCover).catch(function () { });
  })();

  /* ── the summary ── */
  var sumN = $('hc-xsum-n'), sumD = $('hc-xsum-d'), status = $('hc-xstatus'), match = $('hc-xmatch');
  var GO = ['go-epub', 'go-pdf', 'go-txt', 'go-plan', 'go-plantxt'].map($), saveT = 0;
  var PDF_CAP = 92, PARTS = null;
  // parts of up to n days that keep whole months together (the whole year comes out as the four quarters)
  function chunk(list, n) {
    var out = [], cur = [], i = 0;
    while (i < list.length) {
      var m = list[i].slice(0, 2), month = [];
      while (i < list.length && list[i].slice(0, 2) === m) month.push(list[i++]);
      if (cur.length && cur.length + month.length > n) { out.push(cur); cur = []; }
      cur = cur.concat(month);
    }
    if (cur.length) out.push(cur);
    return out;
  }
  function partName(p, k, n) { var r = B.rangeName(p); return r || B.spanName(p) || ('Part ' + (k + 1) + ' of ' + n); }
  function changed(optsOnly) {
    var list = ids(), words = 0, mins = 0;
    list.forEach(function (id) { words += IDX[id].words; mins += IDX[id].minutes; });
    if (!optsOnly) drawCal();
    if (!list.length) { sumN.textContent = 'No readings chosen yet.'; sumD.textContent = 'Tick some days on the calendar, or pick one of the ways above.'; }
    else {
      var rn = B.rangeName(list);
      sumN.textContent = B.plural(list.length, 'reading') + ' · ' + B.commas(words) + ' words · ' + B.timeName(mins) + ' of reading';
      sumD.textContent = (S.label ? S.label + '. ' : '') + (list.length === 366 ? 'Every day of the year.' : rn ? rn + '.' : B.spanName(list) + ', not every day between.');
    }
    tIn.placeholder = autoTitle(list);
    GO.forEach(function (b) { b.disabled = !list.length; });
    drawCover();
    // a PDF is made by the browser's print window, which gets slow past a quarter of the year (about 900 pages):
    // bigger selections print in parts of up to 92 days, and the EPUB takes any size
    var hint = '';
    PARTS = list.length > PDF_CAP ? chunk(list, PDF_CAP) : null;
    $('go-pdf').disabled = !list.length || !!PARTS;
    if (PARTS) {
      hint = 'A PDF of ' + B.plural(list.length, 'reading') + ' would run to well over a thousand pages, which is slow to lay out in a browser, so it prints in parts of up to ' + PDF_CAP + ' days. Make each part as its own PDF: ' +
        PARTS.map(function (p, k) { return '<button type="button" class="hc-btn" data-part="' + k + '">' + esc(partName(p, k, PARTS.length)) + '</button>'; }).join(' ') +
        ' For the whole selection in one file, the EPUB is quicker and works on any e-reader.';
    }
    match.innerHTML = hint; match.hidden = !hint;
    clearTimeout(saveT);
    saveT = setTimeout(function () { var o = {}; for (var key in DEF) o[key] = S.o[key]; store({ export: { d: B.encodeSel(Object.keys(S.sel)), start: S.start, label: S.label, o: o } }); }, 250);
  }

  /* ── making files ── */
  var cache = {};
  function fetchDays(list) {
    var mm = {}; list.forEach(function (id) { mm[id.slice(0, 2)] = 1; });
    return Promise.all(Object.keys(mm).map(function (m) {
      if (cache[m]) return cache[m];
      var u = (X.text || {})[m];
      if (!u) return Promise.reject(new Error('no text for month ' + m));
      return (cache[m] = fetch(u).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).catch(function (e) { delete cache[m]; throw e; }));
    })).then(function (js) { var by = {}; js.forEach(function (j) { (j.days || []).forEach(function (d) { by[d.id] = d; }); }); return list.map(function (id) { return by[id]; }).filter(Boolean); });
  }
  // a plain file name that every system and browser keeps: "Fifteen Minutes a Day - March 3-9.epub"
  function fileName(list, ext) {
    var t = title(list).replace(/:\s*/g, ' - ').replace(/[\u2013\u2014]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '').replace(/Æ/g, 'AE').replace(/æ/g, 'ae').replace(/Œ/g, 'OE').replace(/œ/g, 'oe');
    if (t.normalize) t = t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    return t.replace(/[^\x20-\x7e]+/g, '').replace(/[\\/?%*|"<>:]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 120) + ext;
  }
  function save(blob, name) {
    var a = D.createElement('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = name; a.style.display = 'none'; D.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 30000);
  }
  function opts(list) {
    var o = {}; for (var key in S.o) o[key] = S.o[key];
    o.title = title(list); o.range = rangeLabel(list); o.months = X.months; o.guideYear = X.year; o.url = X.dayurl;
    return o;
  }
  function busy(on, msg) { GO.forEach(function (b) { b.disabled = on || !ids().length; }); if (PARTS) $('go-pdf').disabled = true; app.setAttribute('aria-busy', String(on)); if (msg != null) status.textContent = msg; }
  function uuid() {
    if (W.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function coverJpeg(list) {
    return fontsLoaded.then(function () {
      return new Promise(function (res) {
        var c = D.createElement('canvas'); c.width = 1600; c.height = 2560;
        B.cover(c.getContext('2d'), 1600, 2560, coverOpts(list));
        c.toBlob(function (b) { if (!b) return res(null); b.arrayBuffer().then(function (ab) { res(new Uint8Array(ab)); }); }, 'image/jpeg', 0.86);
      });
    });
  }
  function today() { var d = new Date(); return d.getFullYear() + '-' + B.pad(d.getMonth() + 1) + '-' + B.pad(d.getDate()); }
  $('go-epub').addEventListener('click', function () {
    var list = ids(); if (!list.length) return;
    busy(true, 'Getting the texts of ' + B.plural(list.length, 'reading') + '…');
    var o = opts(list);
    Promise.all([fetchDays(list), coverJpeg(list)]).then(function (r) {
      status.textContent = 'Making the EPUB…';
      o.id = 'urn:uuid:' + uuid(); o.date = today(); o.modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z'); o.cover = r[1];
      return B.zip(B.epub(r[0], o), B.browserDeflate(), new Date());
    }).then(function (bytes) {
      var name = fileName(list, '.epub');
      save(new Blob([bytes], { type: 'application/epub+zip' }), name);
      busy(false, 'Your EPUB is ready: “' + name + '” (' + (bytes.length / 1048576).toFixed(1) + ' MB), saved to your downloads. The steps below get it onto your reader.');
    }).catch(function (e) { busy(false, 'Something went wrong making the EPUB (' + e.message + '). Try again in a moment.'); });
  });
  function printURL(list, extra) {
    var o = S.o, p = new URLSearchParams();
    p.set('d', B.encodeSel(list)); if (S.start) p.set('start', S.start);
    p.set('size', o.size); p.set('type', o.type); p.set('lay', o.lay);
    CHK.forEach(function (key) { p.set(key, o[key] ? '1' : '0'); });
    p.set('title', title(list)); p.set('range', rangeLabel(list));
    for (var key in extra) p.set(key, extra[key]);
    return (root.getAttribute('data-print') || '/harvard-classics/export/print/') + '?' + p.toString();
  }
  function openPrint(url, what) {
    var w = W.open(url, '_blank');
    if (!w) { status.innerHTML = 'Your browser kept the new tab from opening. <a href="' + esc(url) + '" target="_blank" rel="noopener">Open the ' + what + '</a>.'; return; }
    status.textContent = 'The ' + what + ' opened in a new tab. Its print window comes up when it’s ready: choose Save as PDF there.';
  }
  $('go-pdf').addEventListener('click', function () { var list = ids(); if (list.length && list.length <= PDF_CAP) openPrint(printURL(list, { go: '1' }), 'print layout'); });
  match.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-part]'); if (!b || !PARTS) return;
    var k = +b.getAttribute('data-part'), p = PARTS[k]; if (!p) return;
    openPrint(printURL(p, { go: '1', title: title(ids()) + ' (part ' + (k + 1) + ' of ' + PARTS.length + ')', range: rangeLabel(p) }), 'print layout for ' + partName(p, k, PARTS.length));
  });
  $('go-plan').addEventListener('click', function () { var list = ids(); if (list.length) openPrint(printURL(list, { plan: '1', go: '1' }), 'reading plan'); });
  $('go-txt').addEventListener('click', function () {
    var list = ids(); if (!list.length) return;
    busy(true, 'Getting the texts of ' + B.plural(list.length, 'reading') + '…');
    fetchDays(list).then(function (days) {
      var name = fileName(list, '.txt');
      save(new Blob([B.bookText(days, opts(list))], { type: 'text/plain;charset=utf-8' }), name);
      busy(false, 'Your text file is ready: “' + name + '”, saved to your downloads.');
    }).catch(function (e) { busy(false, 'Something went wrong (' + e.message + '). Try again in a moment.'); });
  });
  $('go-plantxt').addEventListener('click', function () {
    var list = ids(); if (!list.length) return;
    busy(true, 'Making the reading plan…');
    fetchDays(list).then(function (days) {
      var name = fileName(list, ' - reading plan.txt');
      save(new Blob([B.planText(days, opts(list))], { type: 'text/plain;charset=utf-8' }), name);
      busy(false, 'Your reading plan is ready: “' + name + '”, saved to your downloads.');
    }).catch(function (e) { busy(false, 'Something went wrong (' + e.message + '). Try again in a moment.'); });
  });

  app.hidden = false;
  changed();
  W.__hcExport = { ids: ids, state: S };
})();
