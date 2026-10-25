/* The Harvard Classics, fifteen minutes a day: the print layout (/harvard-classics/export/print/). Reads the selection
   and the options from the address (see layouts/harvard-classics/print.html), fetches the month texts it needs, lays
   out the book with HCBook.dayBook() and print.css, and writes the page rules: the paper size and margins, and a
   named page for each day so the running heads can carry its date and title. Then it opens the print window (with
   &go=1). A test script can wait for window.__hcPrintReady and fill the contents' page numbers with
   window.__hcToc({ "03-01": 12, … }) after a first pass. */
(function () {
  'use strict';
  var B = window.HCBook, D = document, W = window;
  var X = JSON.parse(D.getElementById('hc-xp-data').textContent || '{}');
  var q = new URLSearchParams(location.search);
  var book = D.getElementById('hcp-book'), status = D.getElementById('hcp-status'), btn = D.getElementById('hcp-print');
  var M = B.MONTHS, xml = B.xml;
  var have = {}; (X.index || []).forEach(function (e) { have[e[0]] = e; });

  /* ── what to print ── */
  function flag(k, dflt) { var v = q.get(k); return v == null ? dflt : v === '1' || v === 'true'; }
  var ids = [];
  if (q.get('all')) ids = B.ALL.slice();
  else if (q.get('m')) q.get('m').split(',').forEach(function (m) { B.ALL.forEach(function (id) { if (+id.slice(0, 2) === +m) ids.push(id); }); });
  else if (q.get('day')) ids = [q.get('day')];
  else ids = B.decodeSel(q.get('d') || '');
  ids = B.order(ids.filter(function (id) { return have[id]; }), q.get('start'));
  var O = {
    size: { letter: 'letter', a4: 'a4', '6x9': '6x9' }[q.get('size')] || 'letter',
    type: q.get('type') === 'large' ? 'large' : 'normal',
    lay: q.get('lay') === 'run' ? 'run' : 'page',
    intro: flag('intro', true), gnotes: flag('gnotes', true), notes: flag('notes', true), pages: flag('pages', false),
    front: flag('front', true), openers: flag('openers', true), plan: flag('plan', false), go: flag('go', false),
    title: (q.get('title') || '').trim()
  };
  var range = q.get('range') || B.rangeName(ids) || (ids.length ? B.plural(ids.length, 'Reading') : '');
  if (!O.title) O.title = 'Fifteen Minutes a Day' + (range ? ': ' + range : '');

  /* ── the page: size, margins and type (inches and points) ── */
  var GEO = {
    letter: { w: 8.5, h: 11, normal: { fs: 11.5, lh: 1.42, side: 1.45, top: 0.95, bot: 0.9 }, large: { fs: 14, lh: 1.4, side: 1.1, top: 0.9, bot: 0.85 } },
    a4: { w: 8.27, h: 11.69, normal: { fs: 11.5, lh: 1.42, side: 1.35, top: 1, bot: 0.95 }, large: { fs: 14, lh: 1.4, side: 1.05, top: 0.95, bot: 0.9 } },
    '6x9': { w: 6, h: 9, normal: { fs: 10.5, lh: 1.38, side: 0.72, top: 0.78, bot: 0.72 }, large: { fs: 12.5, lh: 1.36, side: 0.58, top: 0.74, bot: 0.68 } }
  };
  var G = GEO[O.size], T = G[O.type], gut = O.pages ? 0.3 : 0;
  var side = T.side - gut, ch = G.h - T.top - T.bot;
  var root = D.documentElement.style;
  root.setProperty('--fs', T.fs + 'pt'); root.setProperty('--lh', String(T.lh)); root.setProperty('--gut', gut + 'in');
  root.setProperty('--ch', (ch - 0.06).toFixed(2) + 'in'); root.setProperty('--pw', (G.w - 2 * side).toFixed(2) + 'in');
  root.setProperty('--sink', (O.size === '6x9' ? 0.55 : 0.85) * (O.type === 'large' ? 0.9 : 1) + 'in');
  D.body.classList.add('sz-' + O.size, 'ty-' + O.type, O.lay === 'run' ? 'run' : 'paged');
  if (O.pages) D.body.classList.add('pgrefs');
  if (O.plan) D.body.classList.add('planmode');

  function cssStr(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') + '"'; }
  var HEAD = 'font-family:"HC Book","TeX Gyre Pagella",Palatino,Georgia,serif;font-size:' + ((O.size === '6x9' ? 6.6 : 7.1) * (O.type === 'large' ? 1.12 : 1)).toFixed(2) + 'pt;text-transform:uppercase;letter-spacing:.16em;color:#4d4d48;';
  var FOLIO = 'font-family:"HC Book","TeX Gyre Pagella",Palatino,Georgia,serif;font-size:' + (O.size === '6x9' ? 8.6 : 9.4) * (O.type === 'large' ? 1.12 : 1) + 'pt;color:#333;font-variant-numeric:oldstyle-nums;';
  function headRule(name, left, right) {
    return '@page ' + name + ':left{@top-center{content:' + cssStr(left) + ';' + HEAD + '}}\n@page ' + name + ':right{@top-center{content:' + cssStr(right) + ';' + HEAD + '}}\n';
  }
  var pageCSS = '@page{size:' + G.w + 'in ' + G.h + 'in;margin:' + T.top + 'in ' + side + 'in ' + T.bot + 'in;@bottom-center{content:counter(page);' + FOLIO + 'vertical-align:top;padding-top:.12in}}\n' +
    '@page tp{@bottom-center{content:none}}\n@page fm{@bottom-center{content:none}}\n@page mo{@bottom-center{content:none}}\n';

  /* ── fetching ── */
  function months(list) { var s = {}; list.forEach(function (id) { s[id.slice(0, 2)] = 1; }); return Object.keys(s).sort(); }
  function load(list) {
    var recs = {};
    return Promise.all(months(list).map(function (mm) {
      var u = (X.text || {})[mm];
      if (!u) return null;
      return fetch(u).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) { (j.days || []).forEach(function (d) { recs[d.id] = d; }); });
    })).then(function () { return list.map(function (id) { return recs[id]; }).filter(Boolean); });
  }
  function tick() { return new Promise(function (r) { setTimeout(r, 0); }); }

  /* ── the book ── */
  function titlePage(days) {
    var tp = B.titleParts(O.title), words = 0, mins = 0;
    days.forEach(function (d) { words += d.words || 0; mins += d.minutes || 0; });
    return '<section class="tp" style="page:tp">' +
      '<div class="tp-top"><p class="tp-eye">The Harvard Classics</p><h1 class="tp-t">' + xml(tp.main) + '</h1><p class="tp-orn" aria-hidden="true"><span></span></p>' +
      '<p class="tp-sub">' + xml(tp.sub || range || 'A reading for every day') + '</p></div>' +
      '<div class="tp-mid"><p>' + xml(B.rangeLine(O.title, range, days.map(function (d) { return d.id; }))) + '</p><p>' + xml(B.commas(words)) + ' words, ' + xml(B.timeName(mins)) + ' of reading</p></div>' +
      '<div class="tp-bot"><p class="tp-by">Chosen by Charles W. Eliot</p><p class="tp-from">' + (O.intro ? 'with the introductions from' : 'from') + ' <i>Fifteen Minutes a Day: The Reading Guide</i></p><p class="tp-pub">Teddy Rook Book</p></div>' +
      '</section>\n' +
      '<section class="colo" style="page:fm"><p>' + B.editionNote({ intro: O.intro, guideYear: X.year }) + '</p>' +
      '<p>' + (O.notes ? 'The footnotes of the volumes come at the end of each reading.' : 'The footnotes of the volumes are left out.') + (O.pages ? ' The small numbers in the margin are the page numbers of the volumes, so you can follow along in your own set.' : '') + '</p>' +
      '<p>Prepared by Teddy Rook Book, where every day’s reading is also on the web: ' + xml((X.dayurl || 'https://teddyrookbook.com/harvard-classics/').replace(/^https?:\/\//, '').replace(/\/$/, '')) + '. Made ' + xml(B.longDate(new Date().toISOString())) + '.</p></section>\n';
  }
  function toc(days) {
    var h = '<nav class="toc" style="page:fm" aria-labelledby="toc-h"><h1 id="toc-h">Contents</h1>', last = 0, multi = months(days.map(function (d) { return d.id; })).length > 1;
    days.forEach(function (d) {
      var m = B.monthOf(d.id);
      if (m !== last) { h += (last ? '</ol>' : '') + (multi ? '<p class="toc-m">' + (O.openers ? '<a href="#m-' + B.pad(m) + '">' + M[m - 1] + '</a>' : M[m - 1]) + '</p>' : '') + '<ol>'; last = m; }
      h += '<li><a href="#d-' + d.id + '"><span class="tn">' + (+d.id.slice(3)) + '</span><span class="tt">' + xml(d.title) + '</span><span class="tpn" data-id="' + d.id + '"></span></a></li>';
    });
    return h + '</ol></nav>\n';
  }
  function opener(m) {
    var mo = (X.months || [])[m - 1] || {}, ep = mo.epigraph || [];
    return '<section class="mo" style="page:mo" id="m-' + B.pad(m) + '"><h1>' + M[m - 1] + '</h1>' + (ep.length ? '<div class="ep"><p class="verse">' + ep.map(function (l) { return '<span class="l">' + xml(l) + '</span>'; }).join('<br/>') + '</p>' + (mo.by ? '<p class="ep-by">' + xml(mo.by) + '</p>' : '') + '</div>' : '') + '</section>\n';
  }
  var dopt = { intro: O.intro, gnotes: O.gnotes, notes: O.notes, pages: O.pages, print: true };
  function day(d) {
    var pg = O.lay === 'run' ? 'm' + d.id.slice(0, 2) : 'd' + B.fileId(d.id);
    return '<article class="day" id="d-' + d.id + '" style="page:' + pg + '">' + B.dayBook(d, dopt) + (O.lay === 'run' ? '<p class="orn" aria-hidden="true"></p>' : '') + '</article>\n';
  }
  // the first plain paragraph of a reading gets the drop cap (not in plays, where speeches open the text);
  // headings printed in capitals are set in small capitals
  function dropCaps(el) {
    el.querySelectorAll('.text p.h').forEach(function (h) { var t = h.textContent; if (/[A-Z]{2}/.test(t) && t === t.toUpperCase()) h.classList.add('caps'); });
    el.querySelectorAll('.reading .text').forEach(function (t) {
      if (t.querySelector('p.sp')) return;
      for (var c = t.firstElementChild; c; c = c.nextElementSibling) {
        if (c.matches('p.h')) continue;
        if (c.matches('p:not([class])') && /^[“‘"']?[A-Za-z]/.test(c.textContent.replace(/^\d+$/, ''))) c.classList.add('dc');
        break;
      }
    });
  }

  function planPage(days) {
    var mins = 0; days.forEach(function (d) { mins += d.minutes || 0; });
    var h = '<section class="plan"><h1>Reading plan</h1><p class="plan-t">' + xml(O.title) + '</p><p class="plan-s">' + xml(B.rangeLine(O.title, range, days.map(function (d) { return d.id; }))) + ', ' + xml(B.timeName(mins)) + ' of reading</p>', last = 0;
    days.forEach(function (d) {
      var m = B.monthOf(d.id);
      if (m !== last) { h += (last ? '</tbody></table>' : '') + '<h2>' + M[m - 1] + '</h2><table><tbody>'; last = m; }
      var w = (d.readings || []).map(function (r) { return (r.author ? xml(r.author) + ', ' : '') + '<i>' + xml(B.readingTitle(r)) + '</i>'; }).join('; ');
      var v = (d.readings || []).map(function (r) { return 'Vol. ' + r.volume + ', ' + B.pagesName(r).replace('pages', 'pp.').replace('page', 'p.'); }).join('; ');
      h += '<tr><td class="ck"><span></span></td><td class="pd">' + (+d.id.slice(3)) + '</td><td class="pt"><b>' + xml(d.title) + '</b><br><span>' + w + '</span><br><small>' + xml(v) + (d.minutes ? ' · ' + d.minutes + ' min' : '') + '</small></td></tr>';
    });
    return h + '</tbody></table></section>';
  }

  async function build() {
    if (!ids.length) { status.textContent = 'No readings were chosen. Go back to the export page and pick some days.'; return; }
    D.title = O.plan ? O.title + ': reading plan' : O.title;
    status.textContent = 'Loading ' + B.plural(ids.length, 'reading') + '…';
    var days = await load(ids);
    var css = pageCSS;
    if (O.plan) {
      css += '@page{@top-center{content:' + cssStr('Reading plan · ' + O.title) + ';' + HEAD + '}}\n';
      D.getElementById('hcp-pages').textContent = css;
      book.innerHTML = planPage(days);
    } else {
      var parts = [];
      if (O.front) { parts.push(titlePage(days)); if (days.length > 1) parts.push(toc(days)); }
      book.innerHTML = parts.join('');
      var last = 0, run = O.lay === 'run', short = function (s) { return s.length > 58 ? s.slice(0, 56).replace(/\s+\S*$/, '') + '…' : s; };
      for (var i = 0; i < days.length; i++) {
        var d = days[i], m = B.monthOf(d.id), html = '';
        if (m !== last) {
          if (O.openers) html += opener(m); else html += '<h1 class="sr">' + M[m - 1] + '</h1>';
          if (run) css += headRule('m' + B.pad(m), 'Fifteen Minutes a Day', M[m - 1]);
          last = m;
          if (i) { status.textContent = 'Laying out ' + M[m - 1] + '…'; await tick(); }
        }
        if (!run) css += headRule('d' + B.fileId(d.id), B.dateName(d.id), short(d.title));
        html += day(d);
        book.insertAdjacentHTML('beforeend', html);
      }
      D.getElementById('hcp-pages').textContent = css;
      dropCaps(book);
      if (!O.front || days.length < 2) D.body.classList.add('notoc');
    }
    try { await Promise.all(['400 12pt "HC Book"', 'italic 400 12pt "HC Book"'].map(function (f) { return D.fonts.load(f, 'Aa'); })); await D.fonts.load('12pt "HC Book"', 'αβγ'); } catch (e) { }
    if (D.fonts && D.fonts.ready) await D.fonts.ready;
    W.__hcPrintReady = true;
    W.__hcInfo = { ids: days.map(function (d) { return d.id; }), title: D.title };
    var n = days.length, words = 0; days.forEach(function (d) { words += d.words || 0; });
    var est = Math.ceil(words / ({ letter: 470, a4: 470, '6x9': 330 }[O.size] * (O.type === 'large' ? 0.68 : 1))) + (O.lay === 'page' ? Math.ceil(n / 2) : 0) + (O.openers && !O.plan ? months(ids).length : 0);
    status.textContent = O.plan ? 'The reading plan is ready: ' + B.plural(n, 'reading') + '.' : B.plural(n, 'reading') + ' laid out, roughly ' + B.commas(est) + ' pages. Press the button, or Ctrl+P (⌘P on a Mac).';
    btn.disabled = false;
    if (O.go) setTimeout(function () { W.print(); }, 400);
  }
  // the PDF script: page numbers for the contents
  W.__hcToc = function (map) {
    D.body.classList.add('tocnums');
    D.querySelectorAll('.toc .tpn').forEach(function (s) { var p = map[s.getAttribute('data-id')]; s.textContent = p ? String(p) : ''; });
  };
  btn.addEventListener('click', function () { W.print(); });
  build().catch(function (e) { status.textContent = 'The readings couldn’t be loaded just now (' + e.message + '). Try again in a moment.'; });
})();
