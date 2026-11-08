/* Translate in a Year reader (/languages/translate/<work>/, layout layouts/languages/translate.html).
   DATA   <work>.json  { t, a, la, title, ed, en, verse, books: [{n, t, i}], n (units), parts: [[first, last]], ch: [first unit of
                      each chunk], w: [weight of each chunk: lines or words] }
          <work>-<p>.json  { i (first unit), u: [[ref, text]], tr: [[first unit, last unit, translation]] }  fetched per part
          (built by scripts/translate/build.py from the Perseus texts; see /languages/translate/ for editions and licenses)
   PLANS  The page's plans (data-plans: [{t, days, from: book, to: book}]) cut the chunks of those books into `days` portions with
          split() below, the same function as LPTracks.trSplit (lp-tracks.js), so a Life Planner track of N days lines up.
   URL    #d=12&p=0 (day 12 of plan 0) or #r=1.300-1.330 (a range of units, from a Life Planner session)
   SAVED  localStorage 'trb-translate-v1' (per learner): { <work>: { t: { 'r0|r1': text }, d: { <plan key>: { <day>: 1 } } } }.
          Every read and write is in try/catch; without storage the page still works and says so. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.TRNReader = api;
})(this, function () {
  'use strict';
  function split(w, a, b, N) {
    var n = b - a, M = Math.max(1, Math.min(N, n)), W = 0, cum = [0], out = [], prev = 0, k, j;
    for (k = a; k < b; k++) { W += w[k]; cum.push(W); }
    for (k = 0; k < M; k++) {
      if (k === M - 1) { out.push(b); break; }
      var t = (k + 1) * W / M; j = prev + 1;
      while (j < n && cum[j] < t) j++;
      if (j > prev + 1 && t - cum[j - 1] <= cum[j] - t) j--;
      j = Math.max(prev + 1, Math.min(n - (M - 1 - k), j));
      out.push(a + j); prev = j;
    }
    return out;
  }
  // the chunk range [a, b) of a plan's books
  function planRange(meta, p) {
    var bi = function (n) { for (var i = 0; i < meta.books.length; i++) if (String(meta.books[i].n) === String(n)) return i; return -1; };
    var f = p.from != null ? bi(p.from) : 0, t = p.to != null ? bi(p.to) : meta.books.length - 1;
    var u0 = meta.books[Math.max(0, f)].i, u1 = t + 1 < meta.books.length ? meta.books[t + 1].i : meta.n;
    var a = 0, b = meta.ch.length; while (a < meta.ch.length && meta.ch[a] < u0) a++; b = a; while (b < meta.ch.length && meta.ch[b] < u1) b++;
    return [a, b];
  }
  var api = { split: split, planRange: planRange };
  if (typeof document === 'undefined') return api;

  var W = window, D = document, box = D.getElementById('trn'); if (!box) return api;
  var WORK = box.dataset.work, BASE = box.dataset.base, PLANS = JSON.parse(box.dataset.plans || '[]'), KEY = 'trb-translate-v1';
  var $ = function (s, r) { return (r || D).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var storeOK = true;
  function loadAll() { try { return JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { storeOK = false; return {}; } }
  function saveAll(o) { try { W.localStorage.setItem(KEY, JSON.stringify(o)); storeOK = true; return true; } catch (e) { storeOK = false; return false; } }
  function mine() { var o = loadAll(), m = o[WORK] || {}; m.t = m.t || {}; m.d = m.d || {}; return m; }
  function putMine(m) { var o = loadAll(); o[WORK] = m; var ok = saveAll(o); $('#trn-nostore').hidden = ok; return ok; }

  var META = null, PART = {}, view = { plan: 0, day: 1, r: null }, ends = [], pr = [0, 0];
  function fmtn(x) { return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function ref(r) { return String(r).replace(/[a-z]$/, ''); }
  function partOf(i) { for (var p = 0; p < META.parts.length; p++) if (i >= META.parts[p][0] && i <= META.parts[p][1]) return p; return 0; }
  function getParts(i0, i1, cb) {
    var need = []; for (var p = partOf(i0); p <= partOf(i1); p++) if (!PART[p]) need.push(p);
    Promise.all(need.map(function (p) {
      return fetch(BASE + WORK + '-' + (p + 1) + '.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { PART[p] = j; });
    })).then(cb).catch(function () { $('#trn-text').innerHTML = '<p class="trn-err">The text didn’t load. Check your connection and reload the page.</p>'; });
  }
  function unit(i) { var P = PART[partOf(i)]; return P.u[i - P.i]; }
  function bookOf(i) { var b = META.books[0]; META.books.forEach(function (x) { if (x.i <= i) b = x; }); return b; }
  function chunkEnd(c) { return c + 1 < META.ch.length ? META.ch[c + 1] - 1 : META.n - 1; }
  function makePlan() {
    var p = PLANS[view.plan] || PLANS[0]; pr = planRange(META, p); ends = split(META.w, pr[0], pr[1], p.days);
    view.day = Math.max(1, Math.min(ends.length, view.day));
  }
  function dayUnits(d) { var c0 = d > 1 ? ends[d - 2] : pr[0], c1 = ends[d - 1] - 1; return [META.ch[c0], chunkEnd(c1)]; }
  function planKey() { var p = PLANS[view.plan] || PLANS[0]; return (p.from || '') + '-' + (p.to || '') + '-' + p.days; }
  // lines, or words (counted the way the build script counts them), in units i0..i1 (their parts must be loaded)
  function amount(i0, i1) {
    if (META.verse) return i1 - i0 + 1;
    var a = 0; for (var i = i0; i <= i1; i++) a += (unit(i)[1].match(/[^\s\[\]⟨⟩—–,.;:?!·“”‘’"']+/g) || []).length;
    return a;
  }
  function unitWord(n) { return META.verse ? (n === 1 ? 'line' : 'lines') : 'words'; }
  function rangeText(r0, r1) { var a = ref(r0), b = ref(r1); if (a === b) return a; var p = a.split('.'), q = b.split('.'); return p.length === 2 && q.length === 2 && p[0] === q[0] && META.verse ? a + '–' + q[1] : a + '–' + b; }

  // ---------- tokens and the word help ----------
  function tokens(t) {
    var out = '', i = 0, m, re = /([A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u017e\u0370-\u037d\u0386\u0388-\u03ff\u1f00-\u1ffe\u0300-\u036f]+(?:[’'](?=\s|$|[,.;:·]))?)|([^A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u017e\u0370-\u037d\u0386\u0388-\u03ff\u1f00-\u1ffe\u0300-\u036f]+)/g;
    while ((m = re.exec(t))) { if (m[1]) out += '<button type="button" class="tw">' + esc(m[1]) + '</button>'; else out += esc(m[2]); }
    return out;
  }
  function lookup(w) {
    var bare = w.replace(/[’']$/, ''), lw = bare.toLowerCase(), grc = META.la === 'grc';
    var h = '<p class="wp-lang">' + (grc ? 'Greek' : 'Latin') + ' word</p><p class="wp-word ' + (grc ? 'grc' : 'lat') + '">' + esc(w) + '</p><ul class="trn-links">';
    h += '<li><a href="https://www.perseus.tufts.edu/hopper/morph?l=' + encodeURIComponent(lw) + '&la=' + (grc ? 'greek' : 'la') + '" target="_blank" rel="noopener">Perseus Word Study Tool</a><small>' + (grc ? 'Possible forms, with the Liddell–Scott (LSJ) and Middle Liddell entries' : 'Possible forms, with the Lewis &amp; Short and Elementary Lewis entries') + '</small></li>';
    h += '<li><a href="https://logeion.uchicago.edu/' + encodeURIComponent(lw) + '" target="_blank" rel="noopener">Logeion</a><small>Several dictionaries side by side</small></li>';
    if (WORK === 'john' && view.ch) h += '<li><a href="' + esc(BASE.replace(/translate\/$/, '')) + 'reader/#JHN' + view.ch + '">John ' + view.ch + ' in the Gospel Reader</a><small>Every word of the chapter explained on this site</small></li>';
    h += '</ul>';
    if (/[’']$/.test(w)) h += '<p class="wp-note">The mark at the end (’) shows a vowel was dropped before the next word (elision). Add the vowel back to look it up: often α, ε or ο.</p>';
    if (!grc && /que$/i.test(bare) && bare.length > 4) h += '<p class="wp-note">Words ending in <i>-que</i> may be a word plus <i>-que</i>, “and.” If the dictionary finds nothing, try it without <i>-que</i>.</p>';
    return h;
  }

  // ---------- render ----------
  function render() {
    var i0, i1;
    if (view.r) { i0 = view.r[0]; i1 = view.r[1]; }
    else { var du = dayUnits(view.day); i0 = du[0]; i1 = du[1]; }
    $('#trn-text').innerHTML = '<p class="muted">Loading…</p>';
    getParts(i0, i1, function () { draw(i0, i1); });
  }
  function draw(i0, i1) {
    var u0 = unit(i0), u1 = unit(i1), amt = amount(i0, i1), m = mine(), k = u0[0] + '|' + u1[0], dk = planKey();
    view.ch = WORK === 'john' ? u0[0].split('.')[0] : null;
    var head = (view.r ? 'From your plan' : 'Day ' + view.day + ' of ' + ends.length) + ' · ' + esc(META.t) + ' ' + esc(rangeText(u0[0], u1[0])) + ' · ' + (META.verse ? '' : 'about ') + fmtn(amt) + ' ' + unitWord(amt);
    var h = '<div class="trn-head"><h2>' + head + '</h2>' + (view.r ? '' : '<label class="trn-done"><input type="checkbox" id="trn-done"' + ((m.d[dk] || {})[view.day] ? ' checked' : '') + '> Done</label>') + '</div>';
    h += '<div class="trn-pass ' + (META.la === 'grc' ? 'grc' : 'lat') + (META.verse ? ' verse' : ' prose') + '" lang="' + (META.la === 'grc' ? 'grc' : 'la') + '">';
    var lastBook = null;
    for (var i = i0; i <= i1; i++) {
      var u = unit(i), r = u[0], bk = bookOf(i);
      if (bk !== lastBook && (bk.i === i || i === i0)) { h += '<p class="trn-book">' + esc(bk.t) + (bk.i === i ? '' : ' (continued)') + '</p>'; lastBook = bk; }
      if (META.verse) {
        var ln = r.split('.')[1];
        h += '<div class="tl"><span class="ln' + (+ln % 5 === 0 ? ' five' : '') + '">' + esc(ln) + '</span><span class="tx">' + tokens(u[1]) + '</span></div>';
      } else {
        var sec = ref(r), parts = sec.split('.'), first = !/[a-z]$/.test(r);
        var mark = WORK === 'john' ? parts[1] : WORK === 'catiline' ? '§' + parts[1] : parts.slice(1).join('.');
        h += (first || i === i0 ? '<sup class="sn">' + esc(mark) + (first ? '' : ' (cont.)') + '</sup>' : '') + tokens(u[1]) + ' ';
      }
    }
    h += '</div>';
    h += '<div class="trn-mine"><label for="trn-ta"><b>Your translation</b></label><textarea id="trn-ta" rows="' + Math.min(14, Math.max(5, Math.round((i1 - i0 + 1) / (META.verse ? 2.5 : 2)))) + '" placeholder="Write your English here. It is saved in this browser as you type.">' + esc(m.t[k] || '') + '</textarea>' +
      '<p class="trn-saved hs-small" id="trn-saved" aria-live="polite"></p>' +
      '<div class="trn-acts"><button type="button" class="cbtn trn-check" id="trn-check" aria-expanded="false" aria-controls="trn-key">Check your translation</button><button type="button" class="cbtn" id="trn-print">🖨 Print</button><button type="button" class="cbtn" id="trn-export">⬇ Save all my translations (.txt)</button></div></div>';
    // the public-domain translation: the blocks that overlap this passage
    var blocks = [], seen = {};
    for (var p = partOf(i0); p <= partOf(i1); p++) (PART[p].tr || []).forEach(function (x) { if (x[0] <= i1 && x[1] >= i0 && !seen[x[0]]) { seen[x[0]] = 1; blocks.push(x); } });
    blocks.sort(function (a, c) { return a[0] - c[0]; });
    h += '<div class="trn-key" id="trn-key" hidden><p class="trn-keyh">' + esc(META.en) + '</p>';
    var outside = false;
    blocks.forEach(function (x) {
      var r0 = PART[partOf(x[0])] ? unit(x[0])[0] : '', r1 = PART[partOf(x[1])] ? unit(x[1])[0] : '';
      if (x[0] < i0 || x[1] > i1) outside = true;
      h += '<div class="trn-kb"><p class="trn-kr">' + (r0 && r1 ? esc(rangeText(r0, r1)) : '') + '</p><p class="trn-kt">' + esc(x[2]) + '</p></div>';
    });
    if (outside) h += '<p class="hs-small trn-kn">The translation’s paragraphs don’t always break where today’s passage does, so it may start a little before or run a little past your lines. The numbers above each paragraph say which ' + (META.verse ? 'lines' : 'sections') + ' it covers.</p>';
    if (!blocks.length) h += '<p class="hs-small">No translation is paired with these lines.</p>';
    h += '</div>';
    $('#trn-text').innerHTML = h;
    // nav state
    var sel = $('#trn-day'); if (sel && !view.r) sel.value = String(view.day);
    $('#trn-prev').disabled = !!view.r || view.day <= 1; $('#trn-next').disabled = !!view.r || view.day >= ends.length;
    $('#trn-range').hidden = !view.r;
    if (view.r) $('#trn-range-t').textContent = 'You came from your Life Planner: ' + META.t + ' ' + rangeText(u0[0], u1[0]) + '.';
    progress();
    var ta = $('#trn-ta'), tmr = null;
    ta.addEventListener('input', function () {
      clearTimeout(tmr); tmr = setTimeout(function () {
        var mm = mine(); if (ta.value.trim()) mm.t[k] = ta.value; else delete mm.t[k];
        $('#trn-saved').textContent = putMine(mm) ? 'Saved in this browser.' : 'This browser isn’t letting the page save. Copy your work somewhere safe.';
      }, 400);
    });
  }
  function progress() {
    var m = mine(), d = m.d[planKey()] || {}, n = Object.keys(d).filter(function (x) { return +x <= ends.length; }).length;
    $('#trn-prog').textContent = n ? n + ' of ' + ends.length + ' days done' : ends.length + ' days';
  }
  function fillDays() {
    var h = '';
    for (var d = 1; d <= ends.length; d++) {
      h += '<option value="' + d + '">Day ' + d + '</option>';
    }
    $('#trn-day').innerHTML = h;
    var bh = '';
    META.books.forEach(function (b, j) {
      if (b.i < META.ch[pr[0]] || (pr[1] < META.ch.length && b.i >= META.ch[pr[1]])) return;
      bh += '<option value="' + j + '">' + esc(b.t) + '</option>';
    });
    $('#trn-book').innerHTML = '<option value="">Go to…</option>' + bh;
    $('#trn-book').parentNode.hidden = META.books.length < 2;
  }
  function dayOfUnit(i) { for (var d = 1; d <= ends.length; d++) { var du = dayUnits(d); if (i >= du[0] && i <= du[1]) return d; } return 1; }

  // ---------- URL ----------
  function readHash() {
    var h = W.location.hash.slice(1), q = {}; h.split('&').forEach(function (x) { var p = x.split('='); if (p[0]) q[p[0]] = decodeURIComponent(p[1] || ''); });
    if (q.p != null && PLANS[+q.p]) view.plan = +q.p;
    if (q.d) view.day = +q.d || 1;
    view.r = null; view.rq = q.r || null;
  }
  function writeHash() { var s = view.r ? '#r=' + view.rq : '#p=' + view.plan + '&d=' + view.day; if (W.location.hash !== s) history.replaceState(null, '', s); }
  // resolve #r=REF0-REF1 to unit indices (loads the parts that might hold them)
  function resolveRange(cb) {
    if (!view.rq) { cb(); return; }
    var m = /^([\d.]+[a-z]?)-([\d.]+[a-z]?)$/.exec(view.rq); if (!m) { view.rq = null; cb(); return; }
    var b0 = m[1].split('.')[0], b1 = m[2].split('.')[0], p0 = 0, p1 = META.parts.length - 1;
    META.books.forEach(function (b) { var p = partOf(b.i); if (String(b.n) === b0) p0 = p; if (String(b.n) === b1) p1 = p; });
    getParts(META.parts[p0][0], META.parts[Math.max(p0, p1)][1], function () {
      var i0 = -1, i1 = -1;
      for (var p = p0; p <= Math.max(p0, p1); p++) PART[p].u.forEach(function (u, j) { if (u[0] === m[1] && i0 < 0) i0 = PART[p].i + j; if (u[0] === m[2]) i1 = PART[p].i + j; });
      if (i0 >= 0 && i1 >= i0 && i1 - i0 < 3000) view.r = [i0, i1]; else view.rq = null;
      cb();
    });
  }

  // ---------- export and print ----------
  function exportText() {
    var m = mine(), keys = Object.keys(m.t);
    if (!keys.length) { alert('Nothing saved yet. Write a translation first.'); return; }
    var lines = [META.a + ', ' + META.t + ': my translation', ''];
    // order by where each passage starts: the refs sort by their numbers
    keys.sort(function (a, b) { var x = a.split('|')[0].match(/\d+|[a-z]/g), y = b.split('|')[0].match(/\d+|[a-z]/g); for (var i = 0; i < Math.max(x.length, y.length); i++) { var p = x[i] || '', q = y[i] || ''; if (p !== q) return /\d/.test(p) && /\d/.test(q) ? +p - +q : p < q ? -1 : 1; } return 0; });
    keys.forEach(function (k) { var r = k.split('|'); lines.push(META.t + ' ' + rangeText(r[0], r[1]), m.t[k].trim(), ''); });
    var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }), a = D.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = WORK + '-my-translation.txt'; D.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---------- events ----------
  box.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.classList.contains('tw')) {
      D.querySelectorAll('.tw.sel').forEach(function (x) { x.classList.remove('sel'); }); t.classList.add('sel');
      $('#trn-word').innerHTML = lookup(t.textContent);
      if (W.matchMedia('(max-width: 900px)').matches) $('#trn-word').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (t.id === 'trn-prev' && view.day > 1) { view.day--; go(); }
    if (t.id === 'trn-next' && view.day < ends.length) { view.day++; go(); }
    if (t.id === 'trn-check') { var k = $('#trn-key'), on = k.hidden; k.hidden = !on; t.setAttribute('aria-expanded', on ? 'true' : 'false'); t.textContent = on ? 'Hide the translation' : 'Check your translation'; }
    if (t.id === 'trn-print') W.print();
    if (t.id === 'trn-export') exportText();
    if (t.id === 'trn-back') { view.r = null; view.rq = null; if (view.rday) view.day = view.rday; go(); }
  });
  box.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'trn-plan') { view.plan = +t.value; view.day = 1; makePlan(); fillDays(); go(); }
    if (t.id === 'trn-day') { view.day = +t.value; go(); }
    if (t.id === 'trn-book' && t.value !== '') { view.day = dayOfUnit(META.books[+t.value].i); t.value = ''; go(); }
    if (t.id === 'trn-done') { var m = mine(), dk = planKey(); m.d[dk] = m.d[dk] || {}; if (t.checked) m.d[dk][view.day] = 1; else delete m.d[dk][view.day]; putMine(m); progress(); }
  });
  function go() { view.r = null; view.rq = null; writeHash(); render(); var h = $('#trn-text'); if (h.getBoundingClientRect().top < 0) h.scrollIntoView({ block: 'start' }); }
  W.addEventListener('hashchange', function () { readHash(); makePlan(); $('#trn-plan').value = String(view.plan); fillDays(); resolveRange(function () { if (view.r) view.rday = dayOfUnit(view.r[0]); render(); }); });

  // ---------- start ----------
  fetch(BASE + WORK + '.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
    META = j; readHash();
    $('#trn-plan').innerHTML = PLANS.map(function (p, i) { return '<option value="' + i + '">' + esc(p.t) + '</option>'; }).join('');
    $('#trn-plan').value = String(view.plan);
    makePlan(); fillDays();
    if (!storeOK || (function () { try { W.localStorage.setItem('trb-translate-test', '1'); W.localStorage.removeItem('trb-translate-test'); return false; } catch (e) { return true; } })()) $('#trn-nostore').hidden = false;
    resolveRange(function () { if (view.r) view.rday = dayOfUnit(view.r[0]); render(); });
  }).catch(function () { $('#trn-text').innerHTML = '<p class="trn-err">The text didn’t load. Check your connection and reload the page.</p>'; });
  return api;
});
