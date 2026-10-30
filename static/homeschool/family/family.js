/* Family Study (/homeschool/family/): one theme for the whole family, then each child's lessons, worksheets, quizzes,
   test and project at their own level. The plan logic is in plan.js (window.TRBFamily); the problems come from the
   ladders' generators through the shared Math Ladder API (ML.loadTopics, ML.makeProblem, ML.typeset, ML.viz).
   Saved in this browser under 'trb-family-v1' (a household key: profiles.js keeps it shared by every learner):
     { v: 1, cur: <id>, units: [{ id, key, weeks, days, seed, kids: [{ name, age, lv, pid }], made, pl?, add? }] }
   pl = { u: page URL, m: minutes a day, days: [title per school day] } once the unit is in the lesson planner;
   add = true asks the planner to switch "Family study" on for these children on its next load.
   Everything happens in the browser; nothing is sent anywhere.                                                        */
(function (W, D) {
  'use strict';
  var root = D.getElementById('fam'); if (!root) return;
  var F = W.TRBFamily, ML = W.MathLadder || {};
  var KEY = 'trb-family-v1', PLAN = 'trb-planner-v1', MAXU = 20;
  var ROOT = root.dataset.root || '/', PLANNER = root.dataset.planner || '/homeschool/planner/';
  var $ = function (s, el) { return (el || root).querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(u) { return /^https?:/.test(u) ? u : ROOT + String(u).replace(/^\//, ''); }
  function shown(u) { u = String(u); if (/^https?:/.test(u)) return u.replace(/^https?:\/\//, ''); return 'teddyrookbook.com/' + (u.indexOf(ROOT) === 0 ? u.slice(ROOT.length) : u.replace(/^\//, '')); } // a link written out on paper
  function msg(t) { var m = $('#fam-msg'); m.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(function () { m.textContent = ''; }, 6000); }
  var SUBJ = { history: ['🏛️', 'History'], science: ['🔬', 'Science'], geography: ['🗺️', 'Geography and civics'], language: ['📖', 'Language arts'], art: ['🎨', 'Art'], math: ['🧮', 'Math'], logic: ['🧠', 'Logic'], nature: ['🌿', 'Nature study'] };
  var ORDER = ['history', 'science', 'geography', 'language', 'math', 'art', 'logic', 'nature'];
  var DEPTH = ['Everyone', 'Going deeper (ages 8 and up)', 'Deepest (ages 11 and up)'];
  var LIB = null, UNITS = {}, T = {};

  // ---------- saved state ----------
  function newId() { return 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }
  function readJSON(k) { try { return JSON.parse(W.localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  var S = readJSON(KEY); if (!S || !Array.isArray(S.units)) S = { v: 1, cur: '', units: [] };
  function rec() { return S.units.filter(function (u) { return u.id === S.cur; })[0]; }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { msg('This browser’s storage is full or turned off, so the unit can’t be saved here. Use “Save unit file”.'); return false; } }
  function plannerKids() { var p = readJSON(PLAN); return p && Array.isArray(p.kids) ? p.kids.map(function (k) { return { name: k.name, age: +k.age || 7, pid: k.pid || '' }; }) : []; }
  var PF = W.TRBProfiles && W.TRBProfiles.on && W.TRBProfiles.on() ? W.TRBProfiles : null;
  function learnerKids() { return PF ? PF.list().map(function (p) { return { name: p.name, age: +p.age || 7, pid: p.id }; }) : []; }
  function freshRec(key) {
    var kids = plannerKids(); if (!kids.length) kids = learnerKids(); if (!kids.length) kids = [{ name: 'Child 1', age: 7 }];
    return { id: newId(), key: key || 'ancient-egypt', weeks: 6, days: 4, seed: 1 + Math.floor(Math.random() * 99999), kids: kids.map(function (k) { return { name: k.name, age: k.age, lv: '', pid: k.pid || '' }; }), made: Date.now() };
  }
  function fixRec(r) {
    if (!r || typeof r !== 'object') return null;
    r.id = String(r.id || newId()); r.weeks = Math.max(2, Math.min(12, +r.weeks || 6)); r.days = Math.max(1, Math.min(5, +r.days || 4)); r.seed = +r.seed || 1;
    r.kids = (Array.isArray(r.kids) ? r.kids : []).slice(0, 8).map(function (k, i) { return { name: String(k.name || 'Child ' + (i + 1)).slice(0, 30), age: Math.max(3, Math.min(18, +k.age || 7)), lv: F.LV[k.lv] ? k.lv : '', pid: k.pid || '' }; });
    if (!r.kids.length) r.kids = [{ name: 'Child 1', age: 7, lv: '', pid: '' }];
    return r;
  }

  // ---------- library ----------
  fetch(root.dataset.src).then(function (r) { return r.json(); }).then(function (d) {
    LIB = d.units; T = d.T || {}; LIB.forEach(function (u) { UNITS[u.key] = u; });
    S.units = S.units.map(fixRec).filter(function (r) { return r && UNITS[r.key]; });
    var h = /[#&]u=([\w-]+)/.exec(W.location.hash);
    if (h && S.units.some(function (u) { return u.id === h[1]; })) S.cur = h[1];
    if (!rec()) { var r = freshRec(); S.units.unshift(r); S.cur = r.id; }
    var wk = /[#&]w=(\d+)/.exec(W.location.hash); if (wk) view.week = +wk[1] - 1;
    drawUnits(); drawKids(); drawLen(); update(true);
  }).catch(function () { $('#fam-units').innerHTML = '<p class="fam-err">The unit library could not load. Check your connection and reload the page.</p>'; });

  // ---------- step 1: the theme ----------
  var filt = 'all';
  function drawUnits() {
    var r = rec(), subs = ORDER.filter(function (s) { return LIB.some(function (u) { return u.subject === s; }); });
    $('#fam-filter').innerHTML = '<button type="button" data-f="all" aria-pressed="' + (filt === 'all') + '">All</button>' + subs.map(function (s) { return '<button type="button" data-f="' + s + '" aria-pressed="' + (filt === s) + '">' + SUBJ[s][0] + ' ' + esc(SUBJ[s][1]) + '</button>'; }).join('');
    var list = LIB.filter(function (u) { return filt === 'all' || u.subject === filt; }).sort(function (a, b) { return ORDER.indexOf(a.subject) - ORDER.indexOf(b.subject) || (a.title < b.title ? -1 : 1); });
    $('#fam-units').innerHTML = list.map(function (u) {
      return '<label class="fam-unit' + (u.key === r.key ? ' on' : '') + '"><input type="radio" name="fam-unit" value="' + u.key + '"' + (u.key === r.key ? ' checked' : '') + '><span class="fam-ui" aria-hidden="true">' + u.icon + '</span><span class="fam-ut"><b>' + esc(u.title) + '</b><small>' + esc(SUBJ[u.subject] ? SUBJ[u.subject][1] : u.subject) + '</small><span>' + esc(u.blurb) + '</span></span></label>';
    }).join('');
  }
  $('#fam-filter').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { filt = b.dataset.f; drawUnits(); } });
  $('#fam-units').addEventListener('change', function (e) {
    if (e.target.name !== 'fam-unit') return; var r = rec();
    if (r.pl) { var n = freshRec(e.target.value); n.kids = r.kids.slice(); n.weeks = r.weeks; n.days = r.days; S.units.unshift(n); S.cur = n.id; msg('Started a new unit. “' + UNITS[r.key].title + '” stays in your saved units and in the lesson planner.'); }
    else r.key = e.target.value;
    view.week = 0; drawUnits(); update();
  });

  // ---------- step 2: the children ----------
  function drawKids() {
    var r = rec(), ages = '';
    $('#fam-kids').innerHTML = r.kids.map(function (k, i) {
      var a = ''; for (var x = 3; x <= 18; x++) a += '<option value="' + x + '"' + (x === k.age ? ' selected' : '') + '>' + x + '</option>';
      var auto = F.levelOf(k.age), lv = '<option value=""' + (k.lv ? '' : ' selected') + '>Level ' + auto + ' (by age)</option>' + F.LEVELS.map(function (L) { return '<option value="' + L.k + '"' + (k.lv === L.k ? ' selected' : '') + '>Level ' + L.k + ' (ages ' + L.ages + ')</option>'; }).join('');
      return '<div class="fam-kid" data-k="' + i + '"><input type="text" class="fam-name" value="' + esc(k.name) + '" maxlength="30" aria-label="Name" data-f="name">' +
        '<label>Age <select data-f="age">' + a + '</select></label><label class="fam-lvl">Work at <select data-f="lv">' + lv + '</select></label>' +
        (r.kids.length > 1 ? '<button type="button" class="fam-x" data-f="del" aria-label="Remove ' + esc(k.name) + '">✕</button>' : '') + '</div>';
    }).join('');
    var pk = plannerKids(), lk = learnerKids();
    $('#fam-from').innerHTML = (pk.length ? '<button type="button" class="hs-btn ghost" data-from="planner">🗓️ Use the children in my lesson planner (' + pk.length + ')</button>' : '') + (lk.length ? '<button type="button" class="hs-btn ghost" data-from="learners">👤 Use my learners (' + lk.length + ')</button>' : '');
  }
  $('#fam-kids').addEventListener('change', function (e) {
    var t = e.target, f = t.dataset.f; if (!f) return; var r = rec(), k = r.kids[+t.closest('.fam-kid').dataset.k];
    if (f === 'age') { k.age = +t.value; drawKids(); }
    if (f === 'lv') k.lv = t.value;
    if (f === 'name') k.name = t.value.trim().slice(0, 30) || k.name;
    update();
  });
  $('#fam-kids').addEventListener('click', function (e) { var b = e.target.closest('[data-f=del]'); if (!b) return; rec().kids.splice(+b.closest('.fam-kid').dataset.k, 1); drawKids(); update(); });
  $('#fam-addkid').addEventListener('click', function () { var r = rec(); if (r.kids.length >= 8) { msg('Up to eight children in one unit.'); return; } r.kids.push({ name: 'Child ' + (r.kids.length + 1), age: 9, lv: '', pid: '' }); drawKids(); update(); var n = root.querySelectorAll('.fam-name'); n[n.length - 1].select(); });
  $('#fam-from').addEventListener('click', function (e) {
    var b = e.target.closest('[data-from]'); if (!b) return;
    var list = b.dataset.from === 'planner' ? plannerKids() : learnerKids();
    rec().kids = list.slice(0, 8).map(function (k) { return { name: k.name, age: k.age, lv: '', pid: k.pid || '' }; });
    drawKids(); update(); msg('Children set from your ' + (b.dataset.from === 'planner' ? 'lesson planner' : 'learners') + '.');
  });

  // ---------- step 3: length ----------
  function drawLen() { var r = rec(); $('#fam-weeks').value = String(r.weeks); $('#fam-days').value = String(r.days); }
  $('#fam-weeks').addEventListener('change', function () { rec().weeks = +this.value; view.week = 0; update(); });
  $('#fam-days').addEventListener('change', function () { rec().days = +this.value; update(); });

  // ---------- the plan ----------
  var P = null, view = { week: 0 }, sets = {}, ready = null;
  function allIds(p) { var s = {}; p.W.forEach(function (w) { w.kids.forEach(function (c) { [c.ws, c.quiz, c.test].forEach(function (sp) { if (sp) sp.ids.forEach(function (x) { s[x[0]] = 1; }); }); }); }); return Object.keys(s); }
  function update(first) {
    var r = rec(); if (!r || !UNITS[r.key]) return;
    P = F.build(UNITS[r.key], r.kids, { weeks: r.weeks, days: r.days, seed: r.seed }, T); sets = {};
    if (view.week >= P.W.length || view.week < 0) view.week = 0;
    if (r.pl) r.pl.days = F.plannerDays(P);
    save();
    ready = ML.loadTopics ? ML.loadTopics(allIds(P)) : Promise.resolve(false);
    drawOut();
    if (!first) { try { W.history.replaceState(null, '', '#u=' + r.id); } catch (e) { } }
  }
  function setOf(sp) { if (!sp) return []; var k = sp.seed; if (!sets[k]) sets[k] = F.makeSet(ML, sp); return sets[k]; }
  function topic(id) { return T[id] || { t: id, u: '' }; }
  function lvName(k) { var L = F.LV[k.lv]; return 'Level ' + k.lv + ' · ages ' + L.ages; }
  function kidColor(i) { return ['#b5442f', '#2d6aa8', '#3d8a4a', '#7a4fb0', '#c7811a', '#1f7f86', '#a8336f', '#555'][i % 8]; }

  function drawSaved() {
    var box = $('#fam-saved');
    if (S.units.length < 2) { box.innerHTML = ''; box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<b>Your units</b> ' + S.units.map(function (u) { var U = UNITS[u.key]; return '<span class="fam-chip' + (u.id === S.cur ? ' on' : '') + '"><button type="button" data-open="' + u.id + '">' + U.icon + ' ' + esc(U.title) + ' <small>' + u.weeks + ' wk' + (u.pl ? ' · in planner' : '') + '</small></button><button type="button" class="fam-chip-x" data-drop="' + u.id + '" aria-label="Delete ' + esc(U.title) + '">✕</button></span>'; }).join('');
  }
  $('#fam-saved').addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'), d = e.target.closest('[data-drop]');
    if (o) { S.cur = o.dataset.open; view.week = 0; drawUnits(); drawKids(); drawLen(); update(); }
    if (d) {
      var u = S.units.filter(function (x) { return x.id === d.dataset.drop; })[0]; if (!u) return;
      if (!W.confirm('Delete “' + UNITS[u.key].title + '”?' + (u.pl ? ' It also leaves the lesson planner.' : ''))) return;
      S.units = S.units.filter(function (x) { return x !== u; });
      if (!S.units.length) S.units.push(freshRec());
      if (S.cur === u.id) S.cur = S.units[0].id;
      drawUnits(); drawKids(); drawLen(); update();
    }
  });

  function itemHTML(it, w, ki, paper) {
    var c = ki == null ? null : w.kids[ki], lk = function (t, u) { return paper ? esc(t) + ' <span class="fam-url">' + esc(shown(url(u))) + '</span>' : '<a href="' + esc(url(u)) + '">' + esc(t) + '</a>'; };
    switch (it.kind) {
      case 'read': return '📖 ' + (it.again ? 'Read again: ' : 'Read aloud: ') + lk(it.t, it.u);
      case 'more': return '📚 More: ' + lk(it.t, it.u);
      case 'talk': return '💬 Talk it over ' + (it.part < 0 ? '(follow-up questions)' : w.together.ask.length > 1 ? '(' + esc(UNITS[P.key].parts[w.parts[it.part]].title) + ')' : '');
      case 'do': return '✂️ Together: ' + esc(UNITS[P.key].parts[w.parts[it.part]].do.split('. ')[0]) + '.';
      case 'lesson': var t = topic(it.id); return '🪜 Lesson: ' + (t.u ? lk(t.t, t.u) : esc(t.t)) + (paper || !t.ls ? '' : ' <small>' + esc(t.ls) + '</small>');
      case 'ws': return '📝 Worksheet: ' + (it.ids.length > 1 ? 'the problems for these lessons' : 'the problems for this lesson');
      case 'quiz': return '✅ Weekly quiz (' + c.quiz.n + ' questions)';
      case 'test': return '🏁 End-of-unit test (' + c.test.n + ' questions)';
      case 'proj': return '🛠 Project: ' + (it.step === 'start' ? 'read the task and make a plan' : it.step === 'finish' ? 'finish it and share it with the family' : 'keep working on it');
    }
    return '';
  }
  function talkHTML(w) {
    var U = UNITS[P.key];
    if (w.together.ask.length) return w.together.ask.map(function (a, i) { return (w.together.ask.length > 1 ? '<p class="fam-pt">' + esc(U.parts[w.parts[i]].title) + '</p>' : '') + '<ol class="fam-ask">' + a.map(function (q, j) { return '<li><span class="fam-depth">' + DEPTH[j] + '</span> ' + esc(q) + '</li>'; }).join('') + '</ol>'; }).join('');
    var t = w.together.follow;
    return '<ol class="fam-ask">' + ['What is one new thing you learned this week about ' + t.toLowerCase().replace(/^the /, 'the ') + '?', 'How does this week’s reading connect to what we read last week? Tell it in your own words.', 'What question about ' + t.toLowerCase() + ' is still open for you, and where could you look for the answer?'].map(function (q, j) { return '<li><span class="fam-depth">' + DEPTH[j] + '</span> ' + esc(q) + '</li>'; }).join('') + '</ol>';
  }
  function togetherHTML(w, paper) {
    var U = UNITS[P.key], t = w.together;
    var reads = t.reads.map(function (r) { return '<li>' + itemHTML({ kind: 'read', t: r[0], u: r[1], again: t.again }, w, null, paper) + '</li>'; }).join('') + t.more.map(function (r) { return '<li>' + itemHTML({ kind: 'more', t: r[0], u: r[1] }, w, null, paper) + '</li>'; }).join('');
    return '<div class="fam-tog"><h4>Together</h4><ul class="fam-list">' + reads + '</ul>' +
      '<h5>Talk it over</h5>' + talkHTML(w) +
      '<h5>Family activity</h5>' + w.parts.map(function (pi) { return '<p class="fam-do">' + (w.parts.length > 1 ? '<b>' + esc(U.parts[pi].title) + ':</b> ' : '') + esc(U.parts[pi].do) + (w.m > 1 && w.k > 0 ? ' <i>(Keep going with it, or try it a new way.)</i>' : '') + '</p>'; }).join('') + '</div>';
  }
  function kidWeekHTML(w, ki, paper) {
    var k = P.kids[ki], c = w.kids[ki];
    var h = '<div class="fam-kw" style="--kc:' + kidColor(ki) + '"><h4><span class="fam-dot"></span>' + esc(k.name) + ' <small>' + lvName(k) + '</small></h4><ul class="fam-list">' + c.topics.map(function (id) { return '<li>' + itemHTML({ kind: 'lesson', id: id }, w, ki, paper) + '</li>'; }).join('') + '</ul>';
    if (!paper) {
      h += '<div class="fam-mats">' + [['ws', '📝 Worksheet', c.ws], ['quiz', '✅ Weekly quiz', c.quiz], ['test', '🏁 End-of-unit test', c.test]].filter(function (x) { return x[2]; }).map(function (x) {
        return '<details class="fam-mat" data-w="' + (w.n - 1) + '" data-k="' + ki + '" data-s="' + x[0] + '"><summary>' + x[1] + ' <small>' + x[2].n + ' problems</small></summary><div class="fam-matbody"><p class="hs-small">Loading the problems…</p></div></details>';
      }).join('');
      if (c.proj) h += '<details class="fam-mat"><summary>🛠 Project <small>' + (c.proj === 'start' ? 'starts this week' : c.proj === 'finish' ? 'due this week' : 'in progress') + '</small></summary><div class="fam-matbody">' + projectHTML(ki) + '</div></details>';
      h += '</div>';
    }
    return h + '</div>';
  }
  function projectHTML(ki) {
    var k = P.kids[ki], pr = (UNITS[P.key].projects || {})[k.lv]; if (!pr) return '';
    return '<div class="fam-proj"><h5>' + esc(pr.t) + '</h5><p>' + esc(pr.do) + '</p><table class="fam-rub"><thead><tr><th>What to look for</th><th>Not yet</th><th>Almost</th><th>Yes</th></tr></thead><tbody>' + pr.rubric.map(function (x) { return '<tr><td>' + esc(x) + '</td><td>☐</td><td>☐</td><td>☐</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function daysHTML(w, paper) { // on paper the links are left out here: each week's lists above give them
    var h = '<div class="fam-days">', ih = function (it, w, ki) { var x = itemHTML(it, w, ki, paper); return paper ? x.replace(/ <span class="fam-url">[^<]*<\/span>/g, '') : x; };
    w.days.forEach(function (d, di) {
      h += '<div class="fam-day"><h5>Day ' + (di + 1) + '</h5>' + (d.together.length ? '<div class="fam-dt"><b>Together</b><ul>' + d.together.map(function (it) { return '<li>' + ih(it, w, null) + '</li>'; }).join('') + '</ul></div>' : '') +
        P.kids.map(function (k, ki) { var l = d.kids[ki]; return l.length ? '<div class="fam-dk" style="--kc:' + kidColor(ki) + '"><b><span class="fam-dot"></span>' + esc(k.name) + '</b><ul>' + l.map(function (it) { return '<li>' + ih(it, w, ki) + '</li>'; }).join('') + '</ul></div>' : ''; }).join('') + '</div>';
    });
    return h + '</div>';
  }
  function drawOut() {
    var r = rec(), U = UNITS[P.key], w = P.W[view.week];
    drawSaved();
    $('#fam-sum').innerHTML = '<span class="fam-big" aria-hidden="true">' + U.icon + '</span><div><h3>' + esc(U.title) + '</h3><p>' + P.weeks + ' weeks, ' + P.days + ' day' + (P.days > 1 ? 's' : '') + ' a week · ' + P.kids.map(function (k, i) { return '<span class="fam-kn" style="--kc:' + kidColor(i) + '"><span class="fam-dot"></span>' + esc(k.name) + ' (' + k.age + ', level ' + k.lv + ')</span>'; }).join(' ') + '</p>' + (r.pl ? '<p class="hs-small">✓ In your lesson planner as “Family study”. <a href="' + esc(PLANNER) + '">Open the planner</a></p>' : '') + '</div>';
    $('#fam-kprint').innerHTML = P.kids.map(function (k, i) { return '<button type="button" class="hs-btn" data-print="' + i + '">🖨 ' + esc(k.name) + '’s copy</button>'; }).join('');
    $('#fam-wsel').innerHTML = P.W.map(function (x, i) { return '<option value="' + i + '"' + (i === view.week ? ' selected' : '') + '>Week ' + x.n + ': ' + esc(x.title) + '</option>'; }).join('');
    $('#fam-prev').disabled = view.week === 0; $('#fam-next').disabled = view.week === P.W.length - 1;
    $('#fam-week').innerHTML = '<h3 class="fam-wh">Week ' + w.n + ': ' + esc(w.title) + '</h3><div class="fam-grid">' + togetherHTML(w) + '<div class="fam-kids">' + P.kids.map(function (k, ki) { return kidWeekHTML(w, ki); }).join('') + '</div></div><h4 class="fam-dh">Day by day</h4>' + daysHTML(w);
  }
  $('#fam-prev').addEventListener('click', function () { if (view.week > 0) { view.week--; drawOut(); } });
  $('#fam-next').addEventListener('click', function () { if (view.week < P.W.length - 1) { view.week++; drawOut(); } });
  $('#fam-wsel').addEventListener('change', function () { view.week = +this.value; drawOut(); });
  // worksheets on screen: made when opened
  root.addEventListener('toggle', function (e) {
    var d = e.target; if (!d.classList || !d.classList.contains('fam-mat') || !d.open || !d.dataset.s || d.dataset.done) return;
    d.dataset.done = '1';
    var c = P.W[+d.dataset.w].kids[+d.dataset.k], sp = c[d.dataset.s], body = d.querySelector('.fam-matbody');
    ready.then(function () { body.innerHTML = sheetHTML(setOf(sp), sp, null) + '<details class="fam-keybox"><summary>Answer key</summary>' + keyHTML(setOf(sp)) + '</details>'; finishMath(body); });
  }, true);

  // ---------- worksheets ----------
  function letter(i) { return String.fromCharCode(65 + i); }
  function cleanQ(q) { return String(q).replace(/<p class="[a-z]+-readme">[\s\S]*?<\/p>/g, ''); }
  function vizDiv(p) { if (!p.viz || !p.viz.name) return ''; var o = {}; for (var x in (p.viz.opts || {})) o[x] = p.viz.opts[x]; o.interactive = false; return '<div class="ml-viz fam-viz" data-viz="' + esc(p.viz.name) + '" data-opts="' + esc(JSON.stringify(o)) + '" aria-label="' + esc(p.viz.label || 'A picture for this problem') + '"></div>'; }
  function blankHTML(a) {
    if (a.t === 'mc') return '<ol class="fam-ch" type="A">' + a.choices.map(function (c, i) { return '<li><span class="fam-bub">' + letter(i) + '</span> ' + c + '</li>'; }).join('') + '</ol>';
    if (a.t === 'tf') return '<p class="fam-tf"><span class="fam-bub">T</span> True <span class="fam-bub">F</span> False</p>';
    if (a.t === 'multi') return '<div class="fam-parts">' + a.parts.map(function (pt) { return '<div class="fam-part">' + (pt.label ? '<span>' + pt.label + '</span> ' : '') + blankHTML(pt.a) + '</div>'; }).join('') + '</div>';
    return '<p class="fam-line">Answer: <span></span></p>';
  }
  function sheetHTML(items, sp, k) {
    if (!items.length) return '<p class="hs-small">No problems could be made for these lessons right now. Try reloading the page.</p>';
    var A = k && k.lv === 'A';
    return (A ? '<p class="fam-note">Read each question and its choices aloud. Your child can point to an answer or circle it.</p>' : '') +
      '<ol class="fam-qs">' + items.map(function (x) { var p = x.p; return '<li class="fam-q"><div class="fam-qt">' + cleanQ(p.q) + '</div>' + vizDiv(p) + blankHTML(p.a) + '</li>'; }).join('') + '</ol>';
  }
  function keyHTML(items) {
    return '<ol class="fam-key">' + items.map(function (x) { var kk = F.keyOf(x.p, ML); return '<li>' + (kk.letter ? '<b>' + kk.letter + '.</b> ' : '') + '<span class="fam-kt">' + kk.text + '</span> <small>' + esc(topic(x.id).t) + '</small></li>'; }).join('') + '</ol>';
  }
  function finishMath(el) {
    try { if (ML.typeset) ML.typeset(el); } catch (e) { }
    var vs = [].slice.call(el.querySelectorAll('.fam-viz'));
    return Promise.all(vs.map(function (v) { return (ML.needViz ? ML.needViz(v.dataset.viz) : Promise.resolve(false)).then(function () { try { if (ML.viz) ML.viz.mount(v); } catch (e) { } }); }));
  }

  // ---------- printing ----------
  var prBox = $('#fam-print');
  function cover(title, who) {
    var U = UNITS[P.key];
    return '<div class="fam-cover"><p class="fam-brand">Teddy Rook Book · Family Study</p><h1>' + U.icon + ' ' + esc(U.title) + '</h1><p class="fam-who">' + who + '</p><p>' + esc(U.blurb) + '</p><p>' + P.weeks + ' weeks, ' + P.days + ' school day' + (P.days > 1 ? 's' : '') + ' a week.</p>' + title + '</div>';
  }
  function sheetPage(title, sp, k, ki) {
    return '<section class="fam-sheet fam-page"><div class="fam-sh"><b>' + esc(title) + '</b><span>Name: ' + (k ? esc(k.name) : '') + '<i></i> Date: <i></i></span></div>' + sheetHTML(setOf(sp), sp, k) + '</section>';
  }
  function teacherHTML() {
    var U = UNITS[P.key];
    var h = cover('<h2>Teacher’s copy</h2><p>The week-by-week plan, what to read and talk about together, each child’s lessons, the projects with their rubrics, and every answer key.</p>' + levelNote(), P.kids.map(function (k) { return esc(k.name) + ' (age ' + k.age + ', level ' + k.lv + ')'; }).join(' · '));
    P.W.forEach(function (w) {
      h += '<section class="fam-page fam-pweek"><h2>Week ' + w.n + ': ' + esc(w.title) + '</h2>' + togetherHTML(w, true) + '<div class="fam-kids">' + P.kids.map(function (k, ki) { return kidWeekHTML(w, ki, true); }).join('') + '</div><h4>Day by day</h4>' + daysHTML(w, true) + '</section>';
    });
    h += '<section class="fam-page"><h2>Projects</h2>' + P.kids.map(function (k, ki) { return '<h3>' + esc(k.name) + ' <small>' + lvName(k) + '</small></h3>' + projectHTML(ki); }).join('') + '<p class="hs-small">Projects start in week ' + (P.projFrom + 1) + ' and are shared with the family in the last week.</p></section>';
    h += '<section class="fam-page"><h2>Answer keys</h2>';
    P.W.forEach(function (w) {
      P.kids.forEach(function (k, ki) {
        var c = w.kids[ki];
        [['Worksheet', c.ws], ['Weekly quiz', c.quiz], ['End-of-unit test', c.test]].forEach(function (x) { if (x[1]) h += '<div class="fam-keyset"><h4>Week ' + w.n + ' · ' + esc(k.name) + ' · ' + x[0] + '</h4>' + keyHTML(setOf(x[1])) + '</div>'; });
      });
    });
    return h + '</section>';
  }
  function childHTML(ki) {
    var k = P.kids[ki], h = cover('<h2>' + esc(k.name) + '’s copy</h2><p>Your lessons for each week, your worksheets and quizzes, the end-of-unit test, and your project.</p>', esc(k.name) + ' · ' + lvName(k));
    h += '<section class="fam-page"><h2>My project</h2>' + projectHTML(ki) + '<p class="hs-small">Start in week ' + (P.projFrom + 1) + '. Share it with your family in week ' + P.weeks + '.</p></section>';
    P.W.forEach(function (w) {
      var c = w.kids[ki];
      h += '<section class="fam-page fam-pweek"><h2>Week ' + w.n + ': ' + esc(w.title) + '</h2><h4>My lessons</h4><ul class="fam-list">' + c.topics.map(function (id) { return '<li>☐ ' + itemHTML({ kind: 'lesson', id: id }, w, ki, true) + '</li>'; }).join('') + '</ul><h4>Day by day</h4><ol class="fam-cd">' + w.days.map(function (d, di) { return '<li><b>Day ' + (di + 1) + '</b> ' + d.together.concat(d.kids[ki]).map(function (it) { return '<span>☐ ' + itemHTML(it, w, ki, true).replace(/ <span class="fam-url">[^<]*<\/span>/, '') + '</span>'; }).join('') + '</li>'; }).join('') + '</ol></section>';
      h += sheetPage('Week ' + w.n + ' worksheet · ' + w.title, c.ws, k, ki);
      if (c.quiz) h += sheetPage('Week ' + w.n + ' quiz · ' + w.title, c.quiz, k, ki);
      if (c.test) h += sheetPage('End-of-unit test · ' + UNITS[P.key].title, c.test, k, ki);
    });
    return h;
  }
  function levelNote() { return '<p class="hs-small">Levels: ' + F.LEVELS.map(function (L) { return L.k + ' ages ' + L.ages; }).join(', ') + '. A child’s level comes from their age unless you choose another.</p>'; }
  function doPrint(which) {
    ready.then(function () {
      var html = which === 'teacher' ? teacherHTML() : childHTML(+which);
      var theme = D.documentElement.getAttribute('data-theme');
      D.documentElement.setAttribute('data-theme', 'light'); // pictures are drawn in the light colors for paper
      prBox.innerHTML = '<p class="fam-back hs-noprint"><button type="button" class="hs-btn pri" id="fam-back">← Back to the plan</button> <button type="button" class="hs-btn" id="fam-again">🖨 Print</button></p>' + html;
      D.body.classList.add('fam-printing'); W.scrollTo(0, 0);
      function back() { W.removeEventListener('afterprint', back); D.body.classList.remove('fam-printing'); prBox.innerHTML = ''; if (theme) D.documentElement.setAttribute('data-theme', theme); else D.documentElement.removeAttribute('data-theme'); var o = $('#fam-out'); if (o) W.scrollTo(0, o.offsetTop - 10); }
      $('#fam-back').addEventListener('click', back);
      $('#fam-again').addEventListener('click', function () { W.print(); });
      finishMath(prBox).then(function () { setTimeout(function () { W.addEventListener('afterprint', back); W.print(); }, 250); });
    });
  }
  $('#fam-tprint').addEventListener('click', function () { doPrint('teacher'); });
  $('#fam-kprint').addEventListener('click', function (e) { var b = e.target.closest('[data-print]'); if (b) doPrint(b.dataset.print); });
  $('#fam-new').addEventListener('click', function () { rec().seed = 1 + Math.floor(Math.random() * 99999); update(); msg('New problems made for every worksheet, quiz and test.'); });

  // ---------- the lesson planner ----------
  $('#fam-toplanner').addEventListener('click', function () {
    var r = rec(); if (!P) return;
    r.pl = { u: W.location.pathname, t: UNITS[r.key].title, m: 60, days: F.plannerDays(P) }; r.add = true;
    if (!save()) return;
    W.location.href = PLANNER + '#family=' + r.id;
  });
  // ---------- files ----------
  function download(name, type, data) { var b = new Blob([data], { type: type }), a = D.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  $('#fam-save').addEventListener('click', function () { var r = rec(); download('family-study-' + r.key + '.json', 'application/json', JSON.stringify({ trbFamily: 1, unit: { key: r.key, weeks: r.weeks, days: r.days, seed: r.seed, kids: r.kids } }, null, 1)); msg('Unit file saved. Use “Open unit file” to load it on any device.'); });
  $('#fam-open').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return; var fr = new FileReader();
    fr.onload = function () {
      try { var j = JSON.parse(fr.result), u = fixRec(j.unit || j); if (!u || !UNITS[u.key]) throw 0; u.id = newId(); delete u.pl; delete u.add; u.made = Date.now(); S.units.unshift(u); S.units = S.units.slice(0, MAXU); S.cur = u.id; view.week = 0; drawUnits(); drawKids(); drawLen(); update(); msg('Unit loaded.'); }
      catch (e) { msg('That file isn’t a unit from this page.'); }
    };
    fr.readAsText(f); this.value = '';
  });
  $('#fam-another').addEventListener('click', function () { var r = rec(), n = freshRec(r.key); n.kids = r.kids.slice(); S.units.unshift(n); S.units = S.units.slice(0, MAXU); S.cur = n.id; view.week = 0; drawUnits(); drawKids(); drawLen(); update(); msg('A new unit is started. Pick its theme above.'); W.scrollTo({ top: $('#fam-s1').offsetTop - 10, behavior: 'smooth' }); });
})(window, document);
