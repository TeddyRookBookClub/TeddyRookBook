/* Teddy Rook Book lesson planner. Everything happens in this browser; the plan is saved in localStorage. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('pl'); if (!root) return;
  var DATA = JSON.parse(D.getElementById('pl-data').textContent);
  var KEY = 'trb-planner-v1', HS = 'trb-homeschool-v1';
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var COLORS = ['#b5442f', '#2d6aa8', '#3d8a4a', '#7a4fb0', '#c7811a', '#1f7f86', '#a8336f', '#555'];
  var PACES = [[1.3, 'Gentle'], [1, 'Normal'], [0.8, 'Brisk']];
  var $ = function (s, el) { return (el || root).querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var SUB = {}, COURSE = {};
  DATA.subjects.forEach(function (s) { SUB[s.key] = s; s.courses.forEach(function (c, i) { c.sub = s.key; c.i = i; COURSE[c.key] = c; c.lessons = c.lessons.map(function (l) { return [l.n, l.t, l.m]; }); }); });

  // ---------- state ----------
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function parseISO(s) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
  function nextMonday() { var d = new Date(); d.setHours(0, 0, 0, 0); var add = (8 - d.getDay()) % 7 || 7; d.setDate(d.getDate() + add); return iso(d); }
  function defSubs(age) {
    var o = {};
    DATA.subjects.forEach(function (s) {
      var c = s.courses.filter(function (c) { return age <= c.to; })[0] || s.courses[s.courses.length - 1];
      var m = 60; for (var i = 0; i < s.mins.length; i++) if (age <= s.mins[i][0]) { m = s.mins[i][1]; break; }
      var hw = 10; (s.hw || []).some(function (r) { if (age <= r[0]) { hw = r[1]; return true; } });
      o[s.key] = { on: age >= (s.start || s.courses[0].from), course: c.key, lesson: 1, mins: m, pace: 1, hw: hw };
    });
    return o;
  }
  function newKid(n, age) { return { name: 'Child ' + n, age: age, subs: defSubs(age) }; }
  var st = null;
  function fresh() { return { kids: [newKid(1, 7)], days: [1, 2, 3, 4, 5], mode: 'week', date: nextMonday(), offs: [], len: 36, view: 'overview', week: 0 }; }
  function valid(s) { return s && Array.isArray(s.kids) && s.kids.length && Array.isArray(s.days); }
  function fix(s) { // fill gaps from older or hand-edited plans
    s.kids.forEach(function (k, i) { k.name = k.name || 'Child ' + (i + 1); k.age = +k.age || 7; var d = defSubs(k.age); k.subs = k.subs || {}; for (var key in d) { if (!k.subs[key] || !COURSE[k.subs[key].course]) k.subs[key] = d[key]; if (k.subs[key].hw == null) k.subs[key].hw = d[key].hw; } });
    s.offs = s.offs || []; s.len = s.len == null ? 36 : +s.len; s.view = s.view || 'overview'; s.week = +s.week || 0; s.mode = s.mode === 'date' ? 'date' : 'week'; s.date = s.date || nextMonday();
    return s;
  }
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (valid(sv)) st = fix(sv); } catch (e) { }
  var fromHash = /[#&]plan=([^&]+)/.exec(W.location.hash);
  if (fromHash) { try { var hp = JSON.parse(decodeURIComponent(escape(atob(fromHash[1].replace(/-/g, '+').replace(/_/g, '/'))))); if (valid(hp)) st = fix(hp); } catch (e) { } }
  if (!st) st = fresh();
  var saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }, 250); }
  function done() { try { var h = JSON.parse(W.localStorage.getItem(HS) || 'null'); return (h && h.done) || {}; } catch (e) { return {}; } }
  function setDone(course, num, on) {
    var h; try { h = JSON.parse(W.localStorage.getItem(HS) || 'null'); } catch (e) { } if (!h || !h.done) h = { done: {} };
    var c = h.done[course] || (h.done[course] = {}); if (on) c[num] = 1; else delete c[num];
    try { W.localStorage.setItem(HS, JSON.stringify(h)); } catch (e) { }
  }
  function msg(t) { var m = $('#pl-msg'); m.textContent = t; clearTimeout(msg.t); msg.t = setTimeout(function () { m.textContent = ''; }, 4000); }

  // ---------- step 1: children ----------
  function kidHTML(k, i) {
    var ages = ''; for (var a = 4; a <= 18; a++) ages += '<option value="' + a + '"' + (a === k.age ? ' selected' : '') + '>' + a + '</option>';
    var rows = DATA.subjects.map(function (s) {
      var x = k.subs[s.key], c = COURSE[x.course];
      var opts = s.courses.map(function (cc) { return '<option value="' + cc.key + '"' + (cc.key === x.course ? ' selected' : '') + '>' + esc(cc.name) + '</option>'; }).join('');
      var paces = PACES.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === +x.pace ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('');
      return '<div class="pl-sub' + (x.on ? '' : ' off') + '" data-s="' + s.key + '">' +
        '<label class="pl-on"><input type="checkbox" data-f="on"' + (x.on ? ' checked' : '') + '> <span>' + s.icon + ' ' + esc(s.name) + '</span></label>' +
        '<label class="pl-f"><span>Book</span><select data-f="course">' + opts + '</select></label>' +
        '<label class="pl-f pl-sm"><span>From lesson</span><input type="number" min="1" max="' + c.lessons.length + '" value="' + x.lesson + '" data-f="lesson"></label>' +
        '<label class="pl-f pl-sm"><span>Minutes a week</span><input type="number" min="0" max="1200" step="5" value="' + x.mins + '" data-f="mins"></label>' +
        '<label class="pl-f pl-sm"><span>Study a day</span><input type="number" min="0" max="240" step="5" value="' + (x.hw || 0) + '" data-f="hw" title="Minutes of practice or study (rereading, drill, memory work) on days with a lesson"></label>' +
        '<label class="pl-f pl-sm"><span>Pace</span><select data-f="pace">' + paces + '</select></label>' +
        '<button type="button" class="pl-resume" data-f="resume" title="Start after the last lesson marked done on this site">↻ Pick up where we left off</button>' +
        '</div>';
    }).join('');
    return '<div class="pl-kid" data-k="' + i + '" style="--kc:' + COLORS[i % COLORS.length] + '">' +
      '<div class="pl-kidtop"><span class="pl-dot"></span><input class="pl-name" type="text" value="' + esc(k.name) + '" aria-label="Name" maxlength="30">' +
      '<label class="pl-age">Age <select data-f="age">' + ages + '</select></label>' +
      (st.kids.length > 1 ? '<button type="button" class="pl-x" data-f="del" aria-label="Remove ' + esc(k.name) + '">✕</button>' : '') + '</div>' +
      '<div class="pl-subs">' + rows + '</div></div>';
  }
  function renderKids() {
    $('#pl-kids').innerHTML = st.kids.map(kidHTML).join('');
  }
  $('#pl-kids').addEventListener('change', onKid);
  $('#pl-kids').addEventListener('input', function (e) { if (e.target.classList.contains('pl-name')) { var k = st.kids[+e.target.closest('.pl-kid').dataset.k]; k.name = e.target.value || 'Child'; update(); } });
  $('#pl-kids').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var ki = +b.closest('.pl-kid').dataset.k, k = st.kids[ki];
    if (b.dataset.f === 'del') { st.kids.splice(ki, 1); renderKids(); update(); }
    if (b.dataset.f === 'resume') {
      var s = SUB[b.closest('.pl-sub').dataset.s], dn = done(), best = null;
      s.courses.forEach(function (c) { var d = dn[c.key]; if (!d) return; c.lessons.forEach(function (l, j) { if (d[l[0]]) best = { c: c, j: j }; }); });
      if (!best) { msg('Nothing in ' + s.name + ' is marked done yet in this browser.'); return; }
      var c = best.c, j = best.j + 1; if (j >= c.lessons.length) { var nc = s.courses[c.i + 1]; if (nc) { c = nc; j = 0; } else { msg('That subject is all done!'); return; } }
      var x = k.subs[s.key]; x.course = c.key; x.lesson = c.lessons[j][0]; x.on = true; renderKids(); update();
      msg(k.name + ': ' + s.name + ' now starts at ' + c.name + ', lesson ' + x.lesson + '.');
    }
  });
  function onKid(e) {
    var t = e.target, f = t.dataset.f; if (!f) return;
    var ki = +t.closest('.pl-kid').dataset.k, k = st.kids[ki];
    if (f === 'age') { k.age = +t.value; k.subs = defSubs(k.age); renderKids(); update(); msg('Books and times reset to suggestions for age ' + k.age + '. Change any of them.'); return; }
    var x = k.subs[t.closest('.pl-sub').dataset.s];
    if (f === 'on') { x.on = t.checked; t.closest('.pl-sub').classList.toggle('off', !t.checked); }
    if (f === 'course') { x.course = t.value; x.lesson = 1; renderKids(); }
    if (f === 'lesson') { var n = COURSE[x.course].lessons.length; x.lesson = Math.max(1, Math.min(n, Math.round(+t.value) || 1)); t.value = x.lesson; }
    if (f === 'mins') x.mins = Math.max(0, +t.value || 0);
    if (f === 'pace') x.pace = +t.value;
    if (f === 'hw') x.hw = Math.max(0, +t.value || 0);
    update();
  }
  $('#pl-addkid').addEventListener('click', function () { st.kids.push(newKid(st.kids.length + 1, 7)); renderKids(); update(); var n = root.querySelectorAll('.pl-name'); n[n.length - 1].select(); });

  // ---------- step 2: week ----------
  function renderWeek() {
    $('#pl-days').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) { return '<label><input type="checkbox" value="' + d + '"' + (st.days.indexOf(d) >= 0 ? ' checked' : '') + '> ' + DOW[d] + '</label>'; }).join('');
    $('#pl-s-week').checked = st.mode === 'week'; $('#pl-s-date').checked = st.mode === 'date'; $('#pl-date').value = st.date;
    $('#pl-offbox').hidden = st.mode !== 'date';
    $('#pl-offs').innerHTML = st.offs.map(function (o, i) { return '<span class="pl-off"><input type="date" value="' + o + '" data-i="' + i + '"><button type="button" data-i="' + i + '" aria-label="Remove">✕</button></span>'; }).join('');
    $('#pl-len').value = String(st.len);
  }
  $('#pl-days').addEventListener('change', function () { st.days = [].map.call(root.querySelectorAll('#pl-days input:checked'), function (x) { return +x.value; }); if (!st.days.length) { st.days = [1]; renderWeek(); } update(); });
  root.querySelectorAll('input[name=pl-start]').forEach(function (r) { r.addEventListener('change', function () { st.mode = r.value; renderWeek(); update(); }); });
  $('#pl-date').addEventListener('change', function () { if (parseISO(this.value)) { st.date = this.value; st.mode = 'date'; renderWeek(); update(); } });
  $('#pl-addoff').addEventListener('click', function () { var d0 = parseISO(st.date) || new Date(); d0.setDate(d0.getDate() + 56); st.offs.push(iso(d0)); renderWeek(); update(); });
  $('#pl-offs').addEventListener('change', function (e) { if (e.target.dataset.i != null && parseISO(e.target.value)) { st.offs[+e.target.dataset.i] = e.target.value; update(); } });
  $('#pl-offs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { st.offs.splice(+b.dataset.i, 1); renderWeek(); update(); } });
  $('#pl-len').addEventListener('change', function () { st.len = +this.value; update(); });

  // ---------- the schedule ----------
  var P = null; // computed plan
  function compute() {
    var days = st.days.slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); }), nd = days.length;
    var tracks = [];
    st.kids.forEach(function (k, ki) {
      DATA.subjects.forEach(function (s) {
        var x = k.subs[s.key]; if (!x || !x.on || !(x.mins > 0)) return;
        var c0 = COURSE[x.course], items = [], t = 0;
        for (var ci = c0.i; ci < s.courses.length; ci++) {
          var c = s.courses[ci];
          c.lessons.forEach(function (l) {
            if (ci === c0.i && l[0] < x.lesson) return;
            var e = (l[2] || 20) * (c.rep || 1) * (x.pace || 1); items.push({ c: c, l: l, s: t, e: t + e }); t += e;
          });
        }
        if (!items.length) return;
        var per = x.mins / nd, plan = [], q = 0, rem = items.length ? items[0].e - items[0].s : 0;
        // fill each school day with about `per` minutes: finish a lesson if only a little is left, never start one in a tiny leftover
        while (q < items.length && plan.length < 4000) {
          var bud = per, list = [];
          while (q < items.length) {
            var it = items[q];
            if (rem <= bud + 0.25 * per) { list.push({ it: it, cont: rem < it.e - it.s - 0.01, fin: true, m: rem }); bud -= rem; q++; rem = q < items.length ? items[q].e - items[q].s : 0; if (bud < 0.25 * per) break; }
            else { if (bud < 0.25 * per && list.length) break; list.push({ it: it, cont: rem < it.e - it.s - 0.01, fin: false, m: bud }); rem -= bud; bud = 0; break; }
          }
          plan.push(list);
        }
        tracks.push({ k: ki, s: s, items: items, per: per, plan: plan, days: plan.length, hw: +x.hw || 0 });
      });
    });
    var need = tracks.reduce(function (m, tr) { return Math.max(m, tr.days); }, 0);
    var limit = st.len > 0 ? st.len * nd : need;
    var total = Math.min(need, limit, 520 * nd);
    // school calendar
    var cal = [], weeks = [];
    if (st.mode === 'date') {
      var start = parseISO(st.date) || new Date(), mon = new Date(start); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
      var offs = st.offs.map(parseISO).filter(Boolean).map(function (d) { return d.getTime(); });
      for (var g = 0; cal.length < total && g < 2000; g++) {
        var w0 = new Date(mon); w0.setDate(mon.getDate() + 7 * g); var w1 = new Date(w0); w1.setDate(w0.getDate() + 7);
        if (offs.some(function (o) { return o >= w0.getTime() && o < w1.getTime(); })) continue;
        var wd = [];
        days.forEach(function (dw) { var d = new Date(w0); d.setDate(w0.getDate() + ((dw + 6) % 7)); if (d >= start) wd.push(d); });
        if (!wd.length) continue;
        var wi = weeks.length; weeks.push({ n: wi + 1, mon: w0, from: cal.length });
        wd.forEach(function (d) { if (cal.length < total) cal.push({ w: wi, dow: d.getDay(), date: d }); });
      }
    } else {
      for (var i = 0; i < total; i++) { var wi2 = Math.floor(i / nd); if (!weeks[wi2]) weeks.push({ n: wi2 + 1, from: i }); cal.push({ w: wi2, dow: days[i % nd] }); }
    }
    // what happens on each day
    cal.forEach(function (d) { d.kids = st.kids.map(function () { return []; }); });
    tracks.forEach(function (tr) {
      for (var di = 0; di < cal.length && di < tr.plan.length; di++) if (tr.plan[di].length) cal[di].kids[tr.k].push({ s: tr.s, list: tr.plan[di], hw: tr.hw, m: tr.plan[di].reduce(function (a, e) { return a + e.m; }, 0) });
      tr.books = [];
      tr.plan.forEach(function (list, di) {
        list.forEach(function (e) {
          var last = tr.books[tr.books.length - 1];
          if (!last || last.c !== e.it.c) tr.books.push({ c: e.it.c, d0: di, d1: di, first: e.it.l[0], lastL: e.it.l[0] }); else { last.d1 = di; last.lastL = e.it.l[0]; }
        });
      });
    });
    P = { cal: cal, weeks: weeks, tracks: tracks, nd: nd, need: need, cut: need > cal.length };
    if (st.week >= weeks.length) st.week = Math.max(0, weeks.length - 1);
  }
  function fmtDate(d, long) { return d ? d.toLocaleDateString(undefined, long ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' }) : ''; }
  function dayLabel(d) { return st.mode === 'date' ? DOW[d.dow] + ' ' + fmtDate(d.date) : DOWL[d.dow]; }
  function weekLabel(w) { return 'Week ' + w.n + (w.mon ? ' · ' + fmtDate(P.cal[w.from].date) : ''); }
  function whenDay(di) { // "week 5" or "week 5 (Mar 3)"
    if (di >= P.cal.length) return 'after this plan';
    var d = P.cal[di], w = P.weeks[d.w]; return 'week ' + w.n + (d.date ? ' (' + fmtDate(d.date) + ')' : '');
  }
  function fm(m) { m = Math.round(m / 5) * 5 || (m > 0 ? 5 : 0); return m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + m % 60 + ' min' : '') : m + ' min'; }
  function dayTotals(groups) { var l = 0, h = 0; groups.forEach(function (g) { l += g.m; h += g.hw; }); return { l: l, h: h }; }
  function lessonText(e) { return 'Lesson ' + e.it.l[0] + ': ' + e.it.l[1]; }
  function lessonURL(e) { return e.it.c.url + 'lesson-' + e.it.l[0] + '/'; }

  // ---------- views ----------
  function update() { save(); compute(); render(); }
  function render() {
    root.querySelectorAll('.pl-tabs button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.v === st.view ? 'true' : 'false'); });
    var v = $('#pl-view');
    if (!P.tracks.length) { v.innerHTML = '<p class="pl-empty">Turn on at least one subject with some minutes a week, and the plan appears here.</p>'; return; }
    $('#pl-printsum').textContent = st.kids.map(function (k) { return k.name + ' (' + k.age + ')'; }).join(', ') + ' · ' + st.days.length + ' days a week' + (st.mode === 'date' ? ' · from ' + fmtDate(parseISO(st.date), true) : '');
    v.innerHTML = st.view === 'week' ? weekHTML() : st.view === 'all' ? allHTML() : overviewHTML();
  }
  function overviewHTML() {
    var total = P.cal.length, h = '', note = '';
    if (P.cut) note += '<p class="pl-note">This plan shows ' + P.weeks.length + ' weeks. Everything to the end of the last book takes about ' + Math.ceil(P.need / P.nd) + ' school weeks; choose “until every book is finished” to see it all.</p>';
    st.kids.forEach(function (k, ki) {
      var trs = P.tracks.filter(function (t) { return t.k === ki; }); if (!trs.length) return;
      var mins = trs.reduce(function (s, t) { return s + st.kids[ki].subs[t.s.key].mins; }, 0), hwk = trs.reduce(function (s, t) { return s + t.hw * P.nd; }, 0);
      h += '<div class="pl-ov" style="--kc:' + COLORS[ki % COLORS.length] + '"><h3><span class="pl-dot"></span>' + esc(k.name) + ' <small>age ' + k.age + ' · lessons about ' + fm(mins) + ' a week (' + fm(mins / P.nd) + ' a day)' + (hwk ? ', plus up to ' + fm(hwk) + ' of study (' + fm(hwk / P.nd) + ' a day)' : '') + '</small></h3>';
      trs.forEach(function (t) {
        h += '<div class="pl-ovrow"><div class="pl-ovs">' + t.s.icon + ' ' + esc(t.s.name) + '<small>' + st.kids[ki].subs[t.s.key].mins + ' min a week' + (t.hw ? ' + ' + t.hw + ' min study a day' : '') + '</small></div><div class="pl-bars">';
        t.books.forEach(function (b, bi) {
          if (b.d0 >= total) return;
          var l = 100 * b.d0 / total, w = Math.max(1.5, 100 * (Math.min(b.d1 + 1, total) - b.d0) / total);
          h += '<a class="pl-bar b' + (bi % 3) + '" href="' + esc(b.c.url) + '" style="left:' + l + '%;width:' + w + '%" title="' + esc(b.c.name + ': ' + whenDay(b.d0) + ' to ' + whenDay(b.d1)) + '"><span>' + esc(b.c.name.replace(/^(McGuffey's|Ray's|Webster's|Harvey's|D'Ooge's) /, '')) + '</span></a>';
        });
        h += '</div></div><ul class="pl-ovlist">';
        var later = [];
        t.books.forEach(function (b) {
          if (b.d0 >= total) { later.push(b.c.name); return; }
          var endL = b.d1 >= total ? (P.cal[total - 1] && t.plan[total - 1] && t.plan[total - 1].length ? t.plan[total - 1][t.plan[total - 1].length - 1].it.l[0] : b.lastL) : b.lastL;
          h += '<li><a href="' + esc(b.c.url) + '">' + esc(b.c.name) + '</a>: ' + (b.d1 >= total ? 'lessons ' + b.first + '–' + endL + ' in this plan, from ' + whenDay(b.d0) + '; it finishes later' : 'lessons ' + b.first + '–' + b.lastL + ', ' + whenDay(b.d0) + ' to ' + whenDay(b.d1)) + '</li>';
        });
        if (later.length) h += '<li class="pl-later">Then: ' + later.map(esc).join(', ') + '</li>';
        h += '</ul>';
      });
      h += '</div>';
    });
    var ticks = ''; var step = Math.max(1, Math.ceil(P.weeks.length / 12));
    for (var w = 0; w < P.weeks.length; w += step) ticks += '<span style="left:' + (100 * P.weeks[w].from / total) + '%">' + (P.weeks[w].mon ? fmtDate(P.cal[P.weeks[w].from].date) : 'Wk ' + P.weeks[w].n) + '</span>';
    return note + '<div class="pl-axis">' + ticks + '</div>' + h + '<p class="hs-small">Click a book to open its guides. In “Week by week” you can tick lessons done; ticks are shared with the lesson pages.</p>';
  }
  function dayCell(d, ki, dn) {
    var groups = d.kids[ki]; if (!groups.length) return '';
    var tt = dayTotals(groups);
    return groups.map(function (g) {
      return '<div class="pl-g"><span class="pl-gi" title="' + esc(g.s.name) + '">' + g.s.icon + '</span><div><div class="pl-gt">' + esc(g.s.name) + ' · ≈ ' + fm(g.m) + ' lesson' + (g.hw ? ' + ' + fm(g.hw) + ' study' : '') + '</div>' + g.list.map(function (e) {
        var isD = dn[e.it.c.key] && dn[e.it.c.key][e.it.l[0]];
        return '<div class="pl-l' + (isD ? ' done' : '') + '">' + (e.fin ? '<input type="checkbox" class="pl-ck" data-c="' + e.it.c.key + '" data-n="' + e.it.l[0] + '"' + (isD ? ' checked' : '') + ' aria-label="Done">' : '<span class="pl-ckph"></span>') +
          '<a href="' + esc(lessonURL(e)) + '">' + esc(lessonText(e)) + '</a>' + (e.cont ? ' <em>(continued)</em>' : '') + ' <small>' + esc(e.it.c.name) + '</small></div>';
      }).join('') + '</div></div>';
    }).join('') + '<div class="pl-tot">Total ≈ ' + fm(tt.l + tt.h) + ' <span>(' + fm(tt.l) + ' lessons' + (tt.h ? ' + ' + fm(tt.h) + ' study' : '') + ')</span></div>';
  }
  function weekHTML() {
    var w = P.weeks[st.week], dn = done(); if (!w) return '';
    var end = st.week + 1 < P.weeks.length ? P.weeks[st.week + 1].from : P.cal.length;
    var h = '<div class="pl-wnav"><button type="button" class="hs-btn" data-wk="-1"' + (st.week ? '' : ' disabled') + '>← Previous</button><select id="pl-wsel" aria-label="Week">' + P.weeks.map(function (x, i) { return '<option value="' + i + '"' + (i === st.week ? ' selected' : '') + '>' + esc(weekLabel(x)) + '</option>'; }).join('') + '</select><button type="button" class="hs-btn" data-wk="1"' + (st.week + 1 < P.weeks.length ? '' : ' disabled') + '>Next →</button>' + (st.mode === 'date' ? '<button type="button" class="hs-btn ghost" data-wk="today">This week</button>' : '') + '</div>';
    h += '<div class="pl-days-grid">';
    for (var i = w.from; i < end; i++) {
      var d = P.cal[i], body = '';
      st.kids.forEach(function (k, ki) { var c = dayCell(d, ki, dn); if (c) body += '<div class="pl-dk" style="--kc:' + COLORS[ki % COLORS.length] + '"><b><span class="pl-dot"></span>' + esc(k.name) + '</b>' + c + '</div>'; });
      h += '<div class="pl-day"><h3>' + esc(dayLabel(d)) + '</h3>' + (body || '<p class="hs-small">Nothing planned.</p>') + '</div>';
    }
    return h + '</div>';
  }
  function allHTML() {
    var dn = done(), h = '<p class="hs-small hs-noprint">Every school day of the plan. Use “Print or save as PDF” to keep a paper copy.</p>';
    P.weeks.forEach(function (w, wi) {
      var end = wi + 1 < P.weeks.length ? P.weeks[wi + 1].from : P.cal.length;
      h += '<div class="pl-wk"><h3>' + esc(weekLabel(w)) + '</h3><table class="pl-tab"><thead><tr><th>Day</th>' + st.kids.map(function (k, ki) { return '<th style="--kc:' + COLORS[ki % COLORS.length] + '"><span class="pl-dot"></span>' + esc(k.name) + '</th>'; }).join('') + '</tr></thead><tbody>';
      for (var i = w.from; i < end; i++) { var d = P.cal[i]; h += '<tr><th>' + esc(dayLabel(d)) + '</th>' + st.kids.map(function (k, ki) { return '<td>' + dayCell(d, ki, dn) + '</td>'; }).join('') + '</tr>'; }
      h += '</tbody></table></div>';
    });
    return h;
  }
  root.querySelector('.pl-tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { st.view = b.dataset.v; save(); render(); } });
  $('#pl-view').addEventListener('click', function (e) {
    var b = e.target.closest('[data-wk]'); if (!b) return;
    if (b.dataset.wk === 'today') { var now = new Date(); now.setHours(0, 0, 0, 0); var wi = 0; P.weeks.forEach(function (w, i) { if (P.cal[w.from].date <= now) wi = i; }); st.week = wi; }
    else st.week = Math.max(0, Math.min(P.weeks.length - 1, st.week + +b.dataset.wk));
    save(); render();
  });
  $('#pl-view').addEventListener('change', function (e) {
    if (e.target.id === 'pl-wsel') { st.week = +e.target.value; save(); render(); return; }
    if (e.target.classList.contains('pl-ck')) { setDone(e.target.dataset.c, e.target.dataset.n, e.target.checked); e.target.closest('.pl-l').classList.toggle('done', e.target.checked); }
  });

  // ---------- exports ----------
  function download(name, type, text) {
    var a = D.createElement('a'), blob = text instanceof Blob ? text : new Blob([text], { type: type });
    a.href = URL.createObjectURL(blob); a.download = name; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function slug() { return 'lesson-plan' + (st.mode === 'date' ? '-' + st.date : ''); }
  $('#pl-print').addEventListener('click', function () {
    var prev = st.view; if (prev !== 'all') { st.view = 'all'; render(); }
    root.classList.add('pl-printing');
    setTimeout(function () { W.print(); root.classList.remove('pl-printing'); if (prev !== 'all') { st.view = prev; render(); } }, 50);
  });
  $('#pl-csv').addEventListener('click', function () {
    var rows = [['Week', 'Date', 'Day', 'Child', 'Subject', 'Book', 'Lesson', 'Title', 'Part', 'Lesson minutes', 'Study minutes (subject, that day)', 'Link']];
    P.cal.forEach(function (d) {
      st.kids.forEach(function (k, ki) { d.kids[ki].forEach(function (g) { g.list.forEach(function (e) { rows.push([P.weeks[d.w].n, d.date ? iso(d.date) : '', DOWL[d.dow], k.name, g.s.name, e.it.c.name, e.it.l[0], e.it.l[1], e.cont ? 'continued' : 'new', Math.round(e.m), g.hw, location.origin + lessonURL(e)]); }); }); });
    });
    download(slug() + '.csv', 'text/csv', '﻿' + rows.map(function (r) { return r.map(function (c) { c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n'));
    msg('Spreadsheet saved. It opens in Excel, Numbers or Google Sheets.');
  });
  $('#pl-ics').addEventListener('click', function () {
    if (st.mode !== 'date') { msg('Choose a start date in step 2 first, so the lessons land on real days.'); $('#pl-s-date').focus(); return; }
    function icsEsc(s) { return String(s).replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); }
    function fold(l) { var out = ''; while (l.length > 74) { out += l.slice(0, 74) + '\r\n '; l = l.slice(74); } return out + l; }
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'), L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Teddy Rook Book//Lesson planner//EN', 'CALSCALE:GREGORIAN'];
    P.cal.forEach(function (d, di) {
      st.kids.forEach(function (k, ki) {
        var g = d.kids[ki]; if (!g.length) return;
        var next = new Date(d.date); next.setDate(next.getDate() + 1);
        var sum = k.name + ': ' + g.map(function (x) { return x.s.name + ' ' + x.list.map(function (e) { return e.it.l[0]; }).join(', '); }).join(' · ');
        var tt = dayTotals(g), desc = 'About ' + fm(tt.l) + ' of lessons' + (tt.h ? ' + ' + fm(tt.h) + ' of study' : '') + '\n\n' + g.map(function (x) { return x.s.name + ' (≈ ' + fm(x.m) + (x.hw ? ' + ' + fm(x.hw) + ' study' : '') + ')\n' + x.list.map(function (e) { return e.it.c.name + ', ' + lessonText(e) + (e.cont ? ' (continued)' : '') + '\n' + location.origin + lessonURL(e); }).join('\n'); }).join('\n\n');
        L.push('BEGIN:VEVENT', 'UID:trb-' + st.date + '-' + di + '-' + ki + '@teddyrookbook.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + iso(d.date).replace(/-/g, ''), 'DTEND;VALUE=DATE:' + iso(next).replace(/-/g, ''), fold('SUMMARY:' + icsEsc(sum)), fold('DESCRIPTION:' + icsEsc(desc)), 'TRANSP:TRANSPARENT', 'END:VEVENT');
      });
    });
    L.push('END:VCALENDAR');
    download(slug() + '.ics', 'text/calendar', L.join('\r\n'));
    msg('Calendar file saved. Open it to add the lessons to Apple, Google or Outlook calendar.');
  });
  $('#pl-save').addEventListener('click', function () { download(slug() + '.json', 'application/json', JSON.stringify({ trbPlanner: 1, plan: st }, null, 1)); msg('Plan file saved. Use “Open plan file” to load it on any device.'); });
  $('#pl-open').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () { try { var j = JSON.parse(r.result), p = j.plan || j; if (!valid(p)) throw 0; st = fix(p); renderKids(); renderWeek(); update(); msg('Plan loaded.'); } catch (e) { msg('That file isn’t a plan from this page.'); } };
    r.readAsText(f); this.value = '';
  });
  $('#pl-link').addEventListener('click', function () {
    var s = btoa(unescape(encodeURIComponent(JSON.stringify(st)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    var url = location.href.split('#')[0] + '#plan=' + s;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { msg('Link copied. Anyone who opens it sees this plan (it is all in the link; nothing is stored online).'); }, function () { W.prompt('Copy this link:', url); });
  });
  $('#pl-reset').addEventListener('click', function () { if (W.confirm('Start a new plan? This clears the plan saved in this browser (lessons marked done are kept).')) { st = fresh(); renderKids(); renderWeek(); update(); } });

  // picture: draw the current view (overview, or the selected week) on a canvas
  function makePicture(view) {
    var S = 2, Wd = 1200, pad = 40, lines = [];
    // build a list of drawing instructions, then size the canvas
    function add(t, o) { lines.push(Object.assign({ t: t, size: 18, color: '#1d2320', bold: false, indent: 0, gap: 6 }, o || {})); }
    add('Lesson plan', { size: 34, bold: true, color: '#004225', gap: 4, serif: true });
    add($('#pl-printsum').textContent, { size: 16, color: '#5d6862', gap: 18 });
    if (view === 'overview') {
      st.kids.forEach(function (k, ki) {
        var trs = P.tracks.filter(function (t) { return t.k === ki; }); if (!trs.length) return;
        add(k.name + ', age ' + k.age, { size: 24, bold: true, color: COLORS[ki % COLORS.length], gap: 8, serif: true });
        trs.forEach(function (t) {
          add(t.s.icon + ' ' + t.s.name + ' · ' + st.kids[ki].subs[t.s.key].mins + ' min a week' + (t.hw ? ' + ' + t.hw + ' min study a day' : ''), { bold: true, indent: 12, gap: 4 });
          var lat = []; t.books.forEach(function (b) { if (b.d0 >= P.cal.length) lat.push(b.c.name); else add(b.c.name + ': lessons ' + b.first + '–' + b.lastL + ', ' + whenDay(b.d0) + ' to ' + (b.d1 >= P.cal.length ? 'beyond this plan' : whenDay(b.d1)), { indent: 36, size: 16 }); });
          if (lat.length) add('Then: ' + lat.join(', '), { indent: 36, size: 16, color: '#5d6862' });
          lines[lines.length - 1].gap = 12;
        });
        lines[lines.length - 1].gap = 22;
      });
    } else {
      var w = P.weeks[st.week], end = st.week + 1 < P.weeks.length ? P.weeks[st.week + 1].from : P.cal.length;
      add(weekLabel(w), { size: 24, bold: true, color: '#004225', gap: 12, serif: true });
      for (var i = w.from; i < end; i++) {
        var d = P.cal[i]; add(dayLabel(d), { size: 20, bold: true, gap: 6, serif: true });
        st.kids.forEach(function (k, ki) {
          if (!d.kids[ki].length) return;
          var tt = dayTotals(d.kids[ki]);
          add(k.name + '  ·  about ' + fm(tt.l + tt.h) + ' (' + fm(tt.l) + ' lessons' + (tt.h ? ' + ' + fm(tt.h) + ' study' : '') + ')', { bold: true, indent: 12, color: COLORS[ki % COLORS.length], gap: 3 });
          d.kids[ki].forEach(function (g) { g.list.forEach(function (e) { add('☐ ' + g.s.name + ': ' + lessonText(e) + (e.cont ? ' (continued)' : '') + ' — ' + e.it.c.name + '  (≈ ' + fm(e.m) + ')', { indent: 36, size: 16, gap: 3 }); }); if (g.hw) add('   + ' + fm(g.hw) + ' ' + g.s.name.toLowerCase() + ' study', { indent: 36, size: 15, gap: 3, color: '#5d6862' }); });
          lines[lines.length - 1].gap = 10;
        });
        lines[lines.length - 1].gap = 18;
      }
    }
    add('teddyrookbook.com/homeschool/planner', { size: 14, color: '#8a948e', gap: 0 });
    var cv = D.createElement('canvas'), g = cv.getContext('2d');
    function font(l) { return (l.bold ? '700 ' : '400 ') + l.size + 'px ' + (l.serif ? 'Georgia, serif' : 'system-ui, -apple-system, "Segoe UI", sans-serif'); }
    // wrap
    var rows = []; lines.forEach(function (l) {
      g.font = font(l); var words = l.t.split(' '), cur = '', max = Wd - 2 * pad - l.indent - (l.indent ? 18 : 0), first = true;
      words.forEach(function (wd) { var t = cur ? cur + ' ' + wd : wd; if (g.measureText(t).width > max && cur) { rows.push({ l: l, t: cur, x: pad + l.indent + (first ? 0 : 18), h: l.size * 1.35, gap: 0 }); cur = wd; first = false; } else cur = t; });
      rows.push({ l: l, t: cur, x: pad + l.indent + (first ? 0 : 18), h: l.size * 1.35, gap: l.gap });
    });
    var H = pad * 2 + 8 + rows.reduce(function (s, r) { return s + r.h + r.gap; }, 0);
    if (H > 30000) return null;
    cv.width = Wd * S; cv.height = Math.ceil(H * S); g.scale(S, S);
    g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, Wd, H); g.fillStyle = '#004225'; g.fillRect(0, 0, Wd, 8);
    var y = pad + 8; g.textBaseline = 'top';
    rows.forEach(function (r) { g.font = font(r.l); g.fillStyle = r.l.color; g.fillText(r.t, r.x, y); y += r.h + r.gap; });
    return cv;
  }
  var pv = null, pvFile = null, pvView = 'week';
  function picName(view) { return slug() + (view === 'week' ? '-week-' + P.weeks[st.week].n : '-overview') + '.png'; }
  function refreshPic() {
    var cv = makePicture(pvView), img = pv.querySelector('img'), note = pv.querySelector('.pl-pv-note');
    pvFile = null;
    if (!cv) { img.removeAttribute('src'); note.textContent = 'That plan is too long for one picture. Choose “This week”, or a shorter plan.'; return; }
    note.textContent = canShareFiles() ? 'Tap “Save to Photos / Share”, then “Save Image” to put it in your photos.' : 'This is exactly the picture you’ll get, made in your browser.';
    img.src = cv.toDataURL('image/png');
    cv.toBlob(function (b) { pvFile = new File([b], picName(pvView), { type: 'image/png' }); }, 'image/png');
  }
  function canShareFiles() {
    try { return matchMedia('(pointer: coarse)').matches && navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })] }); } catch (e) { return false; }
  }
  $('#pl-png').addEventListener('click', function () {
    if (!pv) {
      pv = D.createElement('div'); pv.className = 'pl-pv'; pv.hidden = true;
      pv.innerHTML = '<div class="pl-pv-in" role="dialog" aria-label="Save the plan as a picture"><div class="pl-pv-opts"><label><input type="radio" name="pl-pv" value="week"> This week</label> <label><input type="radio" name="pl-pv" value="overview"> The overview</label></div><div class="pl-pv-img"><img alt="Preview of the plan picture"></div><p class="pl-pv-note hs-small"></p><div class="pl-pv-btns"><button type="button" class="hs-btn pri" id="pl-pv-share" hidden>📲 Save to Photos / Share</button><button type="button" class="hs-btn" id="pl-pv-dl">⬇ Download picture</button><button type="button" class="hs-btn ghost" id="pl-pv-x">Close</button></div></div>';
      root.appendChild(pv);
      pv.addEventListener('click', function (e) { if (e.target === pv || e.target.id === 'pl-pv-x') pv.hidden = true; });
      pv.addEventListener('change', function (e) { if (e.target.name === 'pl-pv') { pvView = e.target.value; refreshPic(); } });
      D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pv && !pv.hidden) pv.hidden = true; });
      pv.querySelector('#pl-pv-share').addEventListener('click', function () {
        if (!pvFile) return;
        navigator.share({ files: [pvFile], title: 'Lesson plan' }).catch(function (e) { if (e && e.name !== 'AbortError') download(pvFile.name, 'image/png', pvFile); });
      });
      pv.querySelector('#pl-pv-dl').addEventListener('click', function () { if (pvFile) { download(pvFile.name, 'image/png', pvFile); msg('Picture saved.'); } });
      if (canShareFiles()) { pv.querySelector('#pl-pv-share').hidden = false; pv.querySelector('#pl-pv-dl').classList.remove('pri'); pv.querySelector('#pl-pv-dl').textContent = '⬇ Download file'; }
    }
    pvView = st.view === 'week' ? 'week' : 'overview';
    pv.querySelector('input[value="' + pvView + '"]').checked = true;
    pv.hidden = false; refreshPic();
  });

  // ---------- start ----------
  renderKids(); renderWeek(); update();
})(window, document);
