/* Case builder page (layouts/debate/case.html). Model in case-core.js; cases saved in TRBDebate part "cases". */
(function () {
  'use strict';
  var D = window.TRBDebate, T = window.DebateTimerCore, C = window.DebateCaseCore, $ = D.$, $$ = D.$$, esc = D.esc;
  var root = $('#dbc');
  if (!root || !C) return;
  var formats = T.normalizeAll(D.json('db-formats') || []);
  function fmtBy(k) { for (var i = 0; i < formats.length; i++) if (formats[i].key === k) return formats[i]; return null; }
  var cases = D.part('cases', []);
  var ui = D.part('ui', {});
  var cur = null;
  var form = $('#dbc-form'), pick = $('#dbc-pick'), msg = $('#dbc-msg');
  if (!D.canSave()) $('#dbc-nostore').hidden = false;
  var saveT = 0;
  function save(now) { if (cur) cur.updated = Date.now(); clearTimeout(saveT); if (now) D.save(); else saveT = setTimeout(D.save, 400); }

  function fillPick() {
    cases.sort(function (a, b) { return b.updated - a.updated; });
    pick.innerHTML = cases.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name || 'Untitled case') + '</option>'; }).join('');
    if (cur) pick.value = cur.id;
  }
  function open(id) {
    cur = null;
    cases.forEach(function (c) { if (c.id === id) cur = c; });
    if (!cur) { if (cases.length) cur = cases[0]; else { cur = C.make({ name: 'My first case' }); cases.push(cur); } }
    ui.case = cur.id;
    fillPick();
    renderAll();
  }

  /* ---------- drawing ---------- */
  function sideOptions() {
    var f = fmtBy(cur.fmt);
    var sides = f ? f.sides : [{ name: 'Affirmative' }, { name: 'Negative' }];
    var sel = $('#dbc-side');
    var opts = ['<option value="">Either side</option>'].concat(sides.map(function (s) { return '<option>' + esc(s.name) + '</option>'; }));
    if (cur.side && !sides.some(function (s) { return s.name === cur.side; })) opts.push('<option>' + esc(cur.side) + '</option>');
    sel.innerHTML = opts.join('');
    sel.value = cur.side || '';
  }
  function renderAll() {
    $$('[data-f]', form).forEach(function (inp) {
      var k = inp.dataset.f;
      if (inp.type === 'checkbox') inp.checked = !!cur[k];
      else if (k !== 'side') inp.value = cur[k] == null ? '' : cur[k];
    });
    sideOptions();
    $('#dbc-vcbox').hidden = !cur.useVC;
    renderDefs();
    renderConts();
    $$('textarea', form).forEach(function (t) { if (!t._fit) t._fit = D.autosize(t); else t._fit(); });
    stats();
  }
  function renderDefs() {
    $('#dbc-defs').innerHTML = (cur.defs || []).map(function (d, i) {
      return '<div class="dbc-def" data-d="' + i + '"><label class="dbx-f">Word or phrase <input type="text" data-df="term" value="' + esc(d.term) + '" maxlength="200"></label>' +
        '<label class="dbx-f dbc-grow">Definition <input type="text" data-df="def" value="' + esc(d.def) + '"></label>' +
        '<label class="dbx-f">Source <input type="text" data-df="src" value="' + esc(d.src) + '" placeholder="Dictionary, law, expert"></label>' +
        '<button type="button" class="hs-btn dbc-x" data-act="deldef" aria-label="Remove this definition">✕</button></div>';
    }).join('');
  }
  var HINT = {
    claim: 'What you say is true, in one sentence.',
    warrant: 'Why it’s true: the reasoning that links your evidence to the claim.',
    evidence: 'The words from your source, quoted exactly.',
    cite: 'Author, qualifications, publication, date (and page or link).',
    impact: 'Why it matters: who is helped or hurt, how much, how soon.'
  };
  function renderConts() {
    var h = '';
    cur.contentions.forEach(function (k, i) {
      h += '<fieldset class="dbx-fs dbc-cont" data-c="' + i + '"><legend>Contention ' + (i + 1) + '</legend>' +
        '<div class="dbc-chead"><label class="dbx-f dbc-grow">Tag (a short title a judge can write down) <input type="text" data-cf="tag" value="' + esc(k.tag) + '" maxlength="500"></label>' +
        '<div class="dbc-mv"><button type="button" class="hs-btn" data-act="cup" aria-label="Move contention ' + (i + 1) + ' up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" class="hs-btn" data-act="cdown" aria-label="Move contention ' + (i + 1) + ' down"' + (i === cur.contentions.length - 1 ? ' disabled' : '') + '>↓</button>' +
        '<button type="button" class="hs-btn" data-act="delcont" aria-label="Delete contention ' + (i + 1) + '">✕</button></div></div>';
      k.cards.forEach(function (cd, j) {
        h += '<div class="dbc-card" data-k="' + j + '"><div class="dbc-khead"><b>' + C.letter(j) + '.</b> <span class="hs-small">Point ' + (j + 1) + '</span>' +
          '<span class="dbc-mv"><button type="button" class="dbc-ib" data-act="kup" aria-label="Move point up"' + (j === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button type="button" class="dbc-ib" data-act="kdown" aria-label="Move point down"' + (j === k.cards.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button type="button" class="dbc-ib" data-act="delcard" aria-label="Delete point">✕</button></span></div><div class="dbc-kgrid">';
        C.CARD.forEach(function (f) {
          var big = f === 'evidence' || f === 'warrant';
          h += '<label class="dbx-f dbc-' + f + '"><span><span class="dbc-tagf dbc-t-' + f + '">' + C.LABEL[f] + '</span> <small>' + esc(HINT[f]) + '</small></span>' +
            (f === 'cite' ? '<input type="text" data-kf="cite" value="' + esc(cd.cite) + '">' : '<textarea rows="' + (big ? 3 : 2) + '" data-kf="' + f + '">' + esc(cd[f]) + '</textarea>') + '</label>';
        });
        h += '</div></div>';
      });
      h += '<button type="button" class="hs-btn" data-act="addcard">＋ Point in contention ' + (i + 1) + '</button></fieldset>';
    });
    $('#dbc-conts').innerHTML = h;
  }
  function stats() {
    var w = C.wordCount(cur), s150 = C.readSec(cur, 150), s200 = C.readSec(cur, 200);
    var f = fmtBy(cur.fmt), limit = null, lname = '';
    if (f) {
      var sideId = null; f.sides.forEach(function (s) { if (s.name === cur.side) sideId = s.id; });
      f.speeches.some(function (s) { if (s.kind === 'constructive' && (!sideId || s.side === sideId)) { limit = s.sec; lname = s.short || s.name; return true; } return false; });
    }
    var h = '<p><b>' + w + ' words</b> · about ' + T.clock(s150) + ' at a conversational 150 words a minute, ' + T.clock(s200) + ' at a quick 200.';
    if (limit) h += ' The ' + esc(lname) + ' in ' + esc(f.name) + ' is ' + T.clock(limit) + (s150 > limit ? ': <b class="dbc-over">at 150 words a minute this runs long</b>.' : '.');
    h += '</p>';
    var g = C.gaps(cur);
    if (g.length) h += '<details class="dbc-gaps"><summary>Still to fill in (' + g.length + ')</summary><ul>' + g.slice(0, 30).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>';
    else h += '<p class="dbc-ok">Every part is filled in.</p>';
    $('#dbc-stats').innerHTML = h;
  }

  /* ---------- editing ---------- */
  form.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset.f) {
      var k = t.dataset.f;
      cur[k] = t.type === 'checkbox' ? t.checked : t.value;
      if (k === 'name') fillPick();
      if (k === 'useVC') $('#dbc-vcbox').hidden = !cur.useVC;
      if (k === 'fmt') { if (/^(ld|lincoln)/i.test(cur.fmt) && !cur.useVC) { cur.useVC = true; renderAll(); } else sideOptions(); }
    } else if (t.dataset.df) {
      var d = cur.defs[+t.closest('[data-d]').dataset.d]; if (d) d[t.dataset.df] = t.value;
    } else if (t.dataset.cf) {
      cur.contentions[+t.closest('[data-c]').dataset.c].tag = t.value;
    } else if (t.dataset.kf) {
      var c = cur.contentions[+t.closest('[data-c]').dataset.c];
      var cd = c && c.cards[+t.closest('[data-k]').dataset.k];
      if (cd) cd[t.dataset.kf] = t.value;
    } else return;
    save(); stats();
  });
  form.addEventListener('change', function (e) { if (e.target.dataset.f === 'side' || e.target.dataset.f === 'fmt') { cur[e.target.dataset.f] = e.target.value; save(true); stats(); } });
  form.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var a = b.dataset.act;
    var ce = b.closest('[data-c]'), ci = ce ? +ce.dataset.c : -1;
    var ke = b.closest('[data-k]'), ki = ke ? +ke.dataset.k : -1;
    var c = cur.contentions[ci], focus = null;
    if (a === 'deldef') cur.defs.splice(+b.closest('[data-d]').dataset.d, 1);
    else if (a === 'cup') { C.move(cur.contentions, ci, -1); focus = '[data-c="' + (ci - 1) + '"] [data-act="cup"]'; }
    else if (a === 'cdown') { C.move(cur.contentions, ci, 1); focus = '[data-c="' + (ci + 1) + '"] [data-act="cdown"]'; }
    else if (a === 'delcont') { if (hasText(c) && !confirm('Delete contention ' + (ci + 1) + ' and its points?')) return; cur.contentions.splice(ci, 1); if (!cur.contentions.length) cur.contentions.push(C.contention('')); }
    else if (a === 'addcard') { c.cards.push(C.card()); focus = '[data-c="' + ci + '"] [data-k="' + (c.cards.length - 1) + '"] textarea'; }
    else if (a === 'kup') { C.move(c.cards, ki, -1); focus = '[data-c="' + ci + '"] [data-k="' + (ki - 1) + '"] [data-act="kup"]'; }
    else if (a === 'kdown') { C.move(c.cards, ki, 1); focus = '[data-c="' + ci + '"] [data-k="' + (ki + 1) + '"] [data-act="kdown"]'; }
    else if (a === 'delcard') { if (hasText(c.cards[ki]) && !confirm('Delete this point?')) return; c.cards.splice(ki, 1); if (!c.cards.length) c.cards.push(C.card()); }
    renderAll(); save(true);
    if (focus) { var f = form.querySelector(focus); if (f && !f.disabled) f.focus(); else if (f) { var t = f.closest('[data-c]'); if (t) t.querySelector('input,textarea').focus(); } }
  });
  function hasText(o) {
    if (!o) return false;
    return ['tag'].concat(C.CARD).some(function (f) { return String(o[f] || '').trim(); }) || (o.cards || []).some(hasText);
  }
  $('#dbc-adddef').addEventListener('click', function () { cur.defs.push({ term: '', def: '', src: '' }); renderDefs(); save(true); var t = $$('#dbc-defs [data-df="term"]'); if (t.length) t[t.length - 1].focus(); });
  $('#dbc-addcont').addEventListener('click', function () { cur.contentions.push(C.contention('')); renderAll(); save(true); var t = $$('[data-cf="tag"]', form); t[t.length - 1].focus(); });

  /* ---------- the case list ---------- */
  pick.addEventListener('change', function () { open(pick.value); D.save(); });
  $('#dbc-new').addEventListener('click', function () {
    var c = C.make({ name: 'Case ' + (cases.length + 1), fmt: cur ? cur.fmt : '' });
    cases.unshift(c); open(c.id); save(true);
    form.querySelector('[data-f="name"]').focus();
    form.querySelector('[data-f="name"]').select();
  });
  $('#dbc-dup').addEventListener('click', function () {
    var c = C.clean(JSON.parse(JSON.stringify(cur)));
    c.id = 'case' + Date.now().toString(36); c.name = cur.name + ' (copy)'; c.made = c.updated = Date.now();
    cases.unshift(c); open(c.id); save(true); D.say(msg, 'Copied. You’re now editing the copy.');
  });
  $('#dbc-del').addEventListener('click', function () {
    if (!confirm('Delete the case “' + (cur.name || 'Untitled') + '”? This can’t be undone.')) return;
    cases.splice(cases.indexOf(cur), 1); cur = null; open(cases[0] && cases[0].id); save(true); D.say(msg, 'Case deleted.');
  });

  /* ---------- export ---------- */
  function fname(ext) { return (String(cur.name || 'case').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'case') + ext; }
  $('#dbc-text').addEventListener('click', function () { var f = fmtBy(cur.fmt); D.download(fname('.txt'), C.toText(cur, f && f.name)); });
  $('#dbc-json').addEventListener('click', function () { D.download(fname('.case.json'), JSON.stringify({ kind: 'trb-debate-cases', v: 1, cases: [cur] }, null, 1), 'application/json'); });
  $('#dbc-jsonall').addEventListener('click', function () { D.download('debate-cases-' + D.stamp() + '.json', JSON.stringify({ kind: 'trb-debate-cases', v: 1, cases: cases }, null, 1), 'application/json'); });
  $('#dbc-load').addEventListener('click', function () {
    D.pickFile('.json,application/json', function (text) {
      var o; try { o = JSON.parse(text); } catch (e) { D.say(msg, 'That file isn’t a case file this page can read.'); return; }
      var list = o && o.kind === 'trb-debate-cases' ? o.cases : (o && o.kind === 'trb-debate-backup' && o.data ? o.data.cases : (o && o.contentions ? [o] : null));
      var added = 0, last = null;
      (list || []).forEach(function (x) {
        var c = C.clean(x); if (!c) return;
        cases.forEach(function (y) { if (y.id === c.id) c.id = c.id + '-' + Date.now().toString(36); });
        cases.unshift(c); added++; last = c;
      });
      if (!added) { D.say(msg, 'No cases found in that file.'); return; }
      open(last.id); save(true);
      D.say(msg, added === 1 ? 'Opened “' + last.name + '”.' : added + ' cases added.');
    });
  });
  function printHTML() {
    var c = cur, f = fmtBy(c.fmt);
    var h = '<h1>' + esc(c.name || 'Case') + '</h1><p class="dbc-pmeta">' + [f && f.name, c.side].filter(Boolean).map(esc).join(' · ') + '</p>';
    if (c.resolution) h += '<p class="dbc-pres">' + esc(c.resolution) + '</p>';
    function para(s) { return String(s || '').trim() ? '<p>' + esc(String(s).trim()).replace(/\n+/g, '</p><p>') + '</p>' : ''; }
    h += para(c.intro);
    var defs = (c.defs || []).filter(function (d) { return d.term || d.def; });
    if (defs.length) h += '<h2>Definitions</h2><dl>' + defs.map(function (d) { return '<dt>' + esc(d.term) + '</dt><dd>' + esc(d.def) + (d.src ? ' <cite>' + esc(d.src) + '</cite>' : '') + '</dd>'; }).join('') + '</dl>';
    if (c.useVC && (c.value || c.criterion || c.framework)) h += '<h2>Framework</h2><p><b>Value:</b> ' + esc(c.value) + '<br><b>Criterion:</b> ' + esc(c.criterion) + '</p>' + para(c.framework);
    c.contentions.forEach(function (k, i) {
      h += '<h2>Contention ' + (i + 1) + (k.tag ? ': ' + esc(k.tag) : '') + '</h2>';
      k.cards.forEach(function (cd, j) {
        if (!C.CARD.some(function (x) { return String(cd[x] || '').trim(); })) return;
        h += '<div class="dbc-pcard"><h3>' + C.letter(j) + '. ' + esc(cd.claim) + '</h3>';
        if (cd.warrant) h += '<p><b>Warrant.</b> ' + esc(cd.warrant) + '</p>';
        if (cd.evidence || cd.cite) h += '<blockquote>' + (cd.evidence ? '“' + esc(String(cd.evidence).replace(/^["“]|["”]$/g, '')) + '”' : '') + (cd.cite ? '<footer>' + esc(cd.cite) + '</footer>' : '') + '</blockquote>';
        if (cd.impact) h += '<p><b>Impact.</b> ' + esc(cd.impact) + '</p>';
        h += '</div>';
      });
    });
    if (String(c.conclusion || '').trim()) h += '<h2>Conclusion</h2>' + para(c.conclusion);
    h += '<p class="dbc-pfoot">' + C.wordCount(c) + ' words, about ' + T.clock(C.readSec(c, 150)) + ' at 150 words a minute · Made with the Teddy Rook Book case builder</p>';
    return h;
  }
  $('#dbc-print').addEventListener('click', function () { $('#dbc-printarea').innerHTML = printHTML(); document.documentElement.dataset.dbprint = 'case'; window.print(); });
  window.addEventListener('beforeprint', function () { if (cur) { $('#dbc-printarea').innerHTML = printHTML(); document.documentElement.dataset.dbprint = 'case'; } });
  window.addEventListener('afterprint', function () { delete document.documentElement.dataset.dbprint; });

  open(ui.case);
  D.save();
  window.__dbc = { cur: function () { return cur; }, cases: function () { return cases; } };
})();
