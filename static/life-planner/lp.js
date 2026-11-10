/* Life Planner page (/life-planner/). Needs lp-core.js (dates, frequencies, the scheduler) and lp-tracks.js (Bible,
   Great Books, Harvard Classics, ladders, trades, meals, holidays, and the "if you stick to it" summary).

   SAVED   localStorage 'trb-lifeplan-v1' (a per-learner key: static/js/profiles.js swaps it with the learner, and the
           family backup file carries it):
           { v: 1, plan: { from, len: week|month|quarter|half|year|custom, to, budget: [Sun…Sat minutes], off: [{ from, to, label }] },
             tracks: [track], ticks: { '<track id>|YYYY-MM-DD': 1 }, tab, nid }
           track = { id, kind, name, icon, color, mins, f (lp-core.js FREQUENCIES), start, end, pref: [dows], keepOff, free,
                     off (paused), type (exercise), opt (lp-tracks.js), lib (the library key it came from) }
   READS   (never writes, except Bible ticks) trb-homeschool-v1 (Bible in a Year ticks, which this page also writes when a
           Bible day is ticked here), trb-math-v1 (ladder topics passed), trb-bibleyear-v1 (the Bible page's start date and
           version), trb-meals-v1 (the Meal Planner's plans).
   EXPORTS Print / PDF (print CSS: a summary page, then month or week pages), calendar .ics (RFC 5545), plan file (JSON). */
(function (W, D) {
  'use strict';
  var C = W.LPCore, T = W.LPTracks, root = D.getElementById('lp-app');
  if (!root || !C || !T) return;
  var CFG = JSON.parse(D.getElementById('lp-cfg').textContent), BASE = CFG.base || '/';
  var KEY = 'trb-lifeplan-v1', HS = 'trb-homeschool-v1', ML = 'trb-math-v1', BY = 'trb-bibleyear-v1', MEALS = 'trb-meals-v1';
  var COLORS = ['#2e7d4f', '#1d4f91', '#b8963e', '#7a2338', '#5b3f99', '#0f7c8a', '#c0562b', '#4d6b2f', '#8a5a2b', '#5d6862'];
  var DATA = { lad: {} }, LOADING = {}, FAILED = {};
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load(k) { try { return JSON.parse(W.localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function store(k, o) { try { W.localStorage.setItem(k, JSON.stringify(o)); return true; } catch (e) { return false; } }
  function fm(m) { m = Math.round(m || 0); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : ''); }
  function hrs(m) { var h = m / 60; return (h >= 10 ? Math.round(h) : Math.round(h * 10) / 10) + ' h'; }
  var UTC = { timeZone: 'UTC' };
  function fd(dn, o) { return new Date(dn * C.DAY).toLocaleDateString(undefined, Object.assign({}, UTC, o || { month: 'short', day: 'numeric' })); }
  function fdl(dn) { return fd(dn, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
  var TODAY = C.todayDn();

  // ---------- state ----------
  function addMonths(dn, n) { var p = C.ymd(dn), y = p.y, m = p.m + n; y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1; return C.dnYMD(y, m, Math.min(p.d, C.monthLen(y, m))); }
  function planRange(pl) {
    var a = C.dnOf(pl.from) || TODAY, b;
    switch (pl.len) {
      case 'week': b = a + 6; break;
      case 'month': b = addMonths(a, 1) - 1; break;
      case 'quarter': b = addMonths(a, 3) - 1; break;
      case 'half': b = addMonths(a, 6) - 1; break;
      case 'custom': b = C.dnOf(pl.to); if (b == null || b < a) b = a + 6; if (b - a > 399) b = a + 399; break;
      default: b = addMonths(a, 12) - 1;
    }
    return [a, b];
  }
  var st = load(KEY);
  function nid() { st.nid = (st.nid || 0) + 1; return 't' + st.nid; }
  function libItem(cat, key) { var L = CFG.lib[cat] || []; for (var i = 0; i < L.length; i++) if (L[i].key === key) return L[i]; return null; }
  function freqFrom(f) { var o = JSON.parse(JSON.stringify(f || { k: 'daily' })); if (o.k === 'months' && o.every && !(o.months && o.months.length)) { o.months = C.monthsList(o, C.dnOf(st.plan.from) || TODAY); delete o.every; } return o; }
  function colorNext() { var used = st.tracks.map(function (t) { return t.color; }); for (var i = 0; i < COLORS.length; i++) if (used.indexOf(COLORS[i]) < 0) return COLORS[i]; return COLORS[st.tracks.length % COLORS.length]; }
  function mk(o) { var t = Object.assign({ id: nid(), kind: 'custom', name: 'My task', icon: '⭐', mins: 15, f: { k: 'daily' }, start: '', end: '', pref: [], keepOff: false, free: false, opt: {} }, o); t.f = freqFrom(t.f); if (!t.color) t.color = colorNext(); return t; }
  function fromLib(cat, key, extra) {
    var it = libItem(cat, key); if (!it) return null;
    var kind = cat === 'chores' ? 'chore' : cat === 'exercise' ? 'exercise' : cat === 'meals' ? (it.cook ? 'cook' : 'meal') : 'custom';
    var o = { kind: kind, name: it.name, icon: it.icon, mins: it.mins, f: it.f, lib: cat + ':' + key };
    if (it.type) o.type = it.type; if (it.cook) o.opt = { slot: it.cook };
    return mk(Object.assign(o, extra || {}));
  }
  function bibleTrack() {
    var by = load(BY), hs = load(HS), ver = by && by.v === '66' ? '66' : '73', done = (hs && hs.done && hs.done['bible-' + ver]) || {};
    var o = { ver: ver, mode: 'seq', from: 1 };
    if (by && by.start) { o.mode = 'dates'; o.bstart = by.start; }
    else { for (var n = 1; n <= 365; n++) if (!done[n]) { o.from = n; break; } }
    return mk({ kind: 'bible', name: 'Bible in a Year', icon: '📖', mins: 16, f: { k: 'daily' }, opt: o, lib: 'read:bible' });
  }
  function gbTrack(mins) { return mk({ kind: 'gb', name: 'Great Books', icon: '📚', mins: mins || 15, f: { k: 'daily' }, opt: { from: 0 }, lib: 'read:gb' }); }
  function hcTrack() { return mk({ kind: 'hc', name: 'Harvard Classics', icon: '📜', mins: 15, f: { k: 'daily' }, lib: 'read:hc' }); }
  function holTrack(h) { var H = T.HOL[h]; return mk({ kind: 'holiday', name: H.t + ' cooking', icon: H.icon, mins: 180, f: { k: 'dates', dates: [] }, keepOff: true, opt: { h: h }, lib: 'hol:' + h }); }
  function fresh() {
    st = { v: 1, plan: { from: C.isoOf(TODAY), len: 'year', to: '', budget: [120, 120, 120, 120, 120, 120, 180], off: [] }, tracks: [], ticks: {}, tab: 'today', nid: 0, starter: true };
    var add = function (t) { if (t) st.tracks.push(t); };
    if (CFG.urls.bible) add(bibleTrack());
    if (CFG.urls.gb) add(gbTrack(15));
    add(fromLib('exercise', 'walk5')); add(fromLib('exercise', 'strength2'));
    ['bathroom', 'kitchen-clean', 'laundry', 'sheets', 'vacuum', 'dust', 'alarms', 'filter', 'gutters'].forEach(function (k) { add(fromLib('chores', k)); });
    add(fromLib('meals', 'meal-plan')); add(fromLib('meals', 'shop')); add(fromLib('meals', 'cook', { free: true }));
    if (CFG.hols.indexOf('thanksgiving') >= 0) add(holTrack('thanksgiving'));
    if (CFG.hols.indexOf('christmas') >= 0) add(holTrack('christmas'));
  }
  function valid(s) { return s && typeof s === 'object' && s.v === 1 && s.plan && Array.isArray(s.tracks); }
  function fix(s) {
    s.ticks = s.ticks && typeof s.ticks === 'object' ? s.ticks : {};
    var b = s.plan.budget; if (!Array.isArray(b) || b.length !== 7) s.plan.budget = [120, 75, 75, 75, 75, 75, 180];
    s.plan.budget = s.plan.budget.map(function (x) { return Math.max(0, Math.min(1440, Math.round(+x || 0))); });
    s.plan.off = Array.isArray(s.plan.off) ? s.plan.off.filter(function (o) { return o && C.dnOf(o.from) != null; }) : [];
    if (C.dnOf(s.plan.from) == null) s.plan.from = C.isoOf(TODAY);
    s.tracks = s.tracks.filter(function (t) { return t && t.id && t.f; });
    s.tracks.forEach(function (t) { t.opt = t.opt || {}; t.pref = t.pref || []; t.mins = Math.max(0, Math.min(720, +t.mins || 0)); });
    var mx = 0; s.tracks.forEach(function (t) { var n = +String(t.id).slice(1); if (n > mx) mx = n; }); s.nid = Math.max(s.nid || 0, mx);
    return s;
  }
  if (valid(st)) st = fix(st); else fresh();
  var saveFailed = false;
  function save() { saveFailed = !store(KEY, st); var m = $('#lp-nostore'); if (m) m.hidden = !saveFailed; }
  var view = { tab: st.tab || 'today', cur: TODAY };

  // ---------- progress read from the rest of the site ----------
  var P = {
    bible: function (ver) { var h = load(HS); return (h && h.done && h.done['bible-' + ver]) || {}; },
    passed: function (id) { var m = P._m || (P._m = load(ML) || {}); return !!(m.t && m.t[id] && m.t[id].s === 2); },
    meals: null
  };
  function refreshProgress() { P._m = null; P.meals = load(MEALS); }

  // ---------- data, fetched per track kind ----------
  function needs() {
    var n = {};
    st.tracks.forEach(function (t) {
      if (t.off) return;
      if (t.kind === 'bible') n.bible = 1; if (t.kind === 'gb') n.gb = 1; if (t.kind === 'hc') n.hc = 1; if (t.kind === 'translate') n.tr = 1;
      if (t.kind === 'ladder' && t.opt.l) n['lad:' + t.opt.l] = 1; if (t.kind === 'trade') n.trades = 1; if (t.kind === 'cook') n.meals = 1;
      if (t.kind === 'lessons') { if (t.opt.list === 'recipes') n.meals = 1; else if (/^trade:/.test(t.opt.list)) n.trades = 1; else n.extra = 1; }
    });
    return Object.keys(n);
  }
  function have(k) { return k.indexOf('lad:') === 0 ? !!DATA.lad[k.slice(4)] : !!DATA[k]; }
  function fetchData(k) {
    if (LOADING[k]) return LOADING[k];
    var url = k.indexOf('lad:') === 0 ? CFG.urls.lad[k.slice(4)] : CFG.urls[k];
    if (!url) { LOADING[k] = Promise.resolve(); return LOADING[k]; }
    // one retry that skips the browser cache; on failure the error goes to the console and the callers carry on (the
    // resolution builder then shows a rough estimate for the goals that needed this file, never a spinner)
    function get(opt) { return fetch(url, opt).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url); return r.json(); }); }
    LOADING[k] = get().catch(function () { return get({ cache: 'reload' }); }).then(function (j) {
      norm(k, j);
      if (k.indexOf('lad:') === 0) DATA.lad[k.slice(4)] = j; else DATA[k] = j;
    }).catch(function (e) {
      LOADING[k] = null; FAILED[k] = 1;
      try { console.error('Life Planner: couldn’t load ' + k + ':', e); } catch (e2) { }
      msg('Some of the planner’s data didn’t load. Check your connection and reload the page.');
    });
    return LOADING[k];
  }
  // the data files write each tuple as {a, b, c, d, e}: turn them back into lists
  function tup(x) { return x && typeof x === 'object' && !Array.isArray(x) && 'a' in x ? ['a', 'b', 'c', 'd', 'e'].filter(function (q) { return q in x; }).map(function (q) { return x[q]; }) : x; }
  function norm(k, j) {
    if (k === 'bible') Object.keys(j).forEach(function (v) { j[v] = j[v].map(tup); });
    if (k === 'gb') j.days = j.days.map(tup);
    if (k === 'hc') Object.keys(j).forEach(function (d) { j[d] = tup(j[d]); });
    if (k === 'trades') Object.keys(j).forEach(function (t) { j[t].ls = j[t].ls.map(tup); });
    if (k.indexOf('lad:') === 0) Object.keys(j.c).forEach(function (c) { j.c[c].ts = j.c[c].ts.map(tup); });
    if (k === 'extra') Object.keys(j).forEach(function (l) { j[l] = j[l].map(tup); });
  }
  function ensure(cb) {
    var miss = needs().filter(function (k) { return !have(k); });
    if (!miss.length) { cb(); return; }
    Promise.all(miss.map(fetchData)).then(cb);
  }

  // ---------- the schedule ----------
  var S = null, PV = {}, RANGE = [TODAY, TODAY + 364];
  // the schedule for a saved state s (the resolution builder previews plans that aren't saved yet)
  function computeFor(s) {
    refreshProgress();
    var R = planRange(s.plan), pvs = {};
    var plan = { from: C.isoOf(R[0]), to: C.isoOf(R[1]), budget: s.plan.budget, off: s.plan.off };
    var RANGE = R, PV = pvs;
    var tracks = s.tracks.map(function (t) {
      var ctx = { base: BASE };
      if (t.kind === 'holiday') {
        ctx.hol = T.holidayDates(t.opt.h, RANGE[0], RANGE[1], CFG.holTables);
        t = Object.assign({}, t, { f: { k: 'dates', dates: ctx.hol.map(function (x) { return C.isoOf(x.dn); }) } });
      }
      var pv = T.provider(t, DATA, P, ctx); if (pv) PV[t.id] = pv;
      if (['bible', 'gb', 'hc', 'ladder', 'trade', 'lessons', 'amount', 'translate'].indexOf(t.kind) >= 0 && !pv) t = Object.assign({}, t, { off: true });
      return t;
    });
    var sc = C.schedule(plan, tracks, pvs); sc.tracks = tracks;
    return { S: sc, PV: pvs, RANGE: R };
  }
  function compute() { var r = computeFor(st); S = r.S; PV = r.PV; RANGE = r.RANGE; }
  function tickKey(it) { return it.id + '|' + C.isoOf(it.dn); }
  function isDone(it) { var pv = PV[it.id]; return !!st.ticks[tickKey(it)] || !!(pv && pv.done && pv.done(it)); }
  function setDone(it, on) {
    var tr = trackById(it.id);
    if (tr && tr.kind === 'bible' && it.ref && (!Array.isArray(it.ref) || it.ref.length)) {
      var h = load(HS); if (!h || !h.done) h = { done: {} };
      var key = 'bible-' + (tr.opt.ver === '66' ? '66' : '73'), c = h.done[key] || (h.done[key] = {});
      (Array.isArray(it.ref) ? it.ref : [it.ref]).forEach(function (n) { if (on) c[n] = 1; else delete c[n]; });
      if (!store(HS, h)) msg('That tick couldn’t be saved: this browser’s storage is full or blocked.');
      return;
    }
    if (on) st.ticks[tickKey(it)] = 1; else delete st.ticks[tickKey(it)];
    save();
    try { if (W.TRB && W.TRB.markActivity) W.TRB.markActivity(); } catch (e) { }
  }
  function trackById(id) { for (var i = 0; i < st.tracks.length; i++) if (st.tracks[i].id === id) return st.tracks[i]; return null; }
  function findItem(id, dn) { var d = S && S.byDn[dn]; if (!d) return null; for (var i = 0; i < d.items.length; i++) if (d.items[i].id === id) return d.items[i]; return null; }

  // ---------- page frame ----------
  root.innerHTML =
    '<p class="hs-note lp-warn" id="lp-nostore" hidden>This browser isn’t saving: storage is full or blocked. Use “Save plan file” to keep your plan.</p>' +
    '<div class="lp-msg" id="lp-msg" role="status" aria-live="polite"></div>' +
    '<section class="hs-sec lp-plan" aria-labelledby="lp-plan-h">' +
    '<div class="lp-planhead"><h2 id="lp-plan-h">Your plan</h2><div class="lp-period" id="lp-period"></div></div>' +
    '<div class="lp-stats" id="lp-stats"></div>' +
    '<div class="lp-tabs" role="tablist" aria-label="Views" id="lp-tabs">' +
    [['today', 'Today'], ['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year at a glance'], ['sum', 'If you stick to it']].map(function (x) {
      return '<button type="button" role="tab" id="lp-tab-' + x[0] + '" aria-controls="lp-view" data-tab="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div>' +
    '<div class="lp-view" id="lp-view" role="tabpanel" tabindex="-1"></div>' +
    '<div class="lp-export" aria-label="Save and share">' +
    '<button type="button" class="hs-btn pri" id="lp-print">🖨 Print or save as PDF</button>' +
    '<button type="button" class="hs-btn" id="lp-ics">📅 Add to calendar</button>' +
    '<button type="button" class="hs-btn" id="lp-save">💾 Save plan file</button>' +
    '<label class="hs-btn">📂 Open plan file<input type="file" id="lp-open" accept=".json,application/json" class="lp-file"></label>' +
    '<button type="button" class="hs-btn ghost" id="lp-reset">Start over</button></div>' +
    '</section>' +
    '<section class="hs-sec lp-tracks" aria-labelledby="lp-tracks-h"><div class="lp-sechead"><h2 id="lp-tracks-h">Your tracks</h2><button type="button" class="hs-btn pri" id="lp-add">＋ Add a track</button></div>' +
    '<p class="hs-small" id="lp-starter"></p><ul class="lp-tlist" id="lp-tlist"></ul></section>' +
    '<section class="hs-sec lp-time" aria-labelledby="lp-time-h"><h2 id="lp-time-h">Your time</h2>' +
    '<p class="hs-small">Minutes you can give your plan on each day of the week, after work and everything else. Tasks that can move go to days with room; a day with more than its minutes is marked overloaded.</p>' +
    '<div class="lp-budget" id="lp-budget"></div>' +
    '<h3>Days off</h3><p class="hs-small">Vacations, busy days, holidays. Nothing that can move is put on a day off, and tasks on fixed days skip it unless you tell a track to keep going.</p>' +
    '<ul class="lp-offs" id="lp-offs"></ul>' +
    '<div class="lp-offadd"><label>From <input type="date" id="lp-off-from"></label><label>To <input type="date" id="lp-off-to"></label><label>Note <input type="text" id="lp-off-label" maxlength="40" placeholder="Vacation"></label><button type="button" class="hs-btn" id="lp-off-add">Add days off</button></div>' +
    '</section>' +
    '<dialog class="lp-dlg" id="lp-dlg" aria-labelledby="lp-dlg-h"><form method="dialog" class="lp-dlgin" id="lp-dlgform" novalidate></form></dialog>' +
    '';
  var PRINTBOX = D.createElement('div'); PRINTBOX.className = 'lp-printout'; PRINTBOX.id = 'lp-printout'; PRINTBOX.setAttribute('aria-hidden', 'true'); D.body.appendChild(PRINTBOX);

  var msgT = 0;
  function msg(t) { var m = $('#lp-msg'); if (!m) return; m.textContent = t; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(function () { m.classList.remove('on'); }, 5000); }

  // ---------- period ----------
  function renderPeriod() {
    var pl = st.plan, lens = [['week', 'One week'], ['month', 'One month'], ['quarter', 'Three months'], ['half', 'Six months'], ['year', 'One year'], ['custom', 'Choose an end date']];
    var y1 = C.ymd(TODAY).y + 1;
    $('#lp-period').innerHTML = '<label>Starts <input type="date" id="lp-from" value="' + esc(pl.from) + '"></label>' +
      '<label>Length <select id="lp-len">' + lens.map(function (l) { return '<option value="' + l[0] + '"' + (pl.len === l[0] ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('') + '</select></label>' +
      (pl.len === 'custom' ? '<label>Ends <input type="date" id="lp-to" value="' + esc(pl.to || C.isoOf(RANGE[1])) + '"></label>' : '') +
      '<button type="button" class="hs-btn ghost lp-jan" id="lp-jan" data-y="' + y1 + '">January 1, ' + y1 + ' to December 31</button>' +
      '<span class="hs-small lp-range">' + esc(fd(RANGE[0], { month: 'short', day: 'numeric', year: 'numeric' })) + ' – ' + esc(fd(RANGE[1], { month: 'short', day: 'numeric', year: 'numeric' })) + '</span>';
  }
  $('#lp-period').addEventListener('change', function (e) {
    if (e.target.id === 'lp-from' && C.dnOf(e.target.value) != null) st.plan.from = e.target.value;
    if (e.target.id === 'lp-len') { st.plan.len = e.target.value; if (st.plan.len === 'custom' && !st.plan.to) st.plan.to = C.isoOf(RANGE[1]); }
    if (e.target.id === 'lp-to' && C.dnOf(e.target.value) != null) st.plan.to = e.target.value;
    save(); all();
  });
  $('#lp-period').addEventListener('click', function (e) {
    if (e.target.id !== 'lp-jan') return;
    st.plan.from = e.target.dataset.y + '-01-01'; st.plan.len = 'year'; save(); view.cur = C.dnOf(st.plan.from); all();
  });

  // ---------- stats strip ----------
  /* "On track?": the resolution's sessions up to yesterday, done or not. Never a scolding: when some are open, it offers to
     spread them over the next week, or to move the finish date (lp-res.js re-paces the plan). */
  function onTrack() {
    if (!st.res || !S || TODAY <= S.from) return '';
    var due = 0, done = 0, mins = 0;
    for (var x = S.from; x < Math.min(TODAY, S.to + 1); x++) S.byDn[x].items.forEach(function (it) { var t = trackById(it.id); if (!t || !t.opt.res) return; due++; if (isDone(it)) done++; else mins += it.mins; });
    if (!due) return '';
    if (done >= due) return '<p class="lp-ontrack good">🎯 On track: all ' + due + ' resolution sessions so far are done.</p>';
    var left = due - done;
    return '<p class="lp-ontrack">🎯 ' + done + ' of ' + due + ' resolution sessions done so far. To catch up over the next week, add about ' + fm(Math.ceil(mins / 7)) + ' a day (the open ones are under “Still open” on the Today list), or <button type="button" class="hs-btn ghost" id="lp-movefin">move the finish date a week later</button>.' + (left > 30 ? ' A smaller target is fine too: Change a track any time.' : '') + '</p>';
  }
  function renderStats() {
    var tot = 0, overD = 0, overW = 0; S.days.forEach(function (d) { tot += d.load; if (d.over && d.load) overD++; }); S.weeks.forEach(function (w) { if (w.over) overW++; });
    var wk = tot / ((S.to - S.from + 1) / 7);
    $('#lp-stats').innerHTML = '<span><b>' + hrs(wk) + '</b> a week on average</span><span><b>' + hrs(tot) + '</b> in all</span><span><b>' + st.tracks.filter(function (t) { return !t.off; }).length + '</b> tracks</span>' +
      (overD ? '<span class="lp-bad"><b>' + overD + '</b> overloaded day' + (overD === 1 ? '' : 's') + (overW ? ', ' + overW + ' week' + (overW === 1 ? '' : 's') : '') + '</span>' : '<span class="lp-good">Every day fits your time</span>') + onTrack();
  }
  $('#lp-stats').addEventListener('click', function (e) { if (e.target.id === 'lp-movefin' && W.LPRes && W.LPRes.moveFinish) W.LPRes.moveFinish(7); });

  // ---------- views ----------
  function itemHTML(it, opt) {
    var tr = S.tracks[it.t], done = isDone(it), id = 'ck-' + it.id + '-' + it.dn;
    var name = it.url ? '<a href="' + esc(it.url) + '">' + esc(it.label) + '</a>' : esc(it.label);
    return '<li class="lp-it' + (done ? ' done' : '') + '" style="--c:' + esc(tr.color) + '"><input type="checkbox" class="lp-ck" id="' + id + '" data-id="' + esc(it.id) + '" data-dn="' + it.dn + '"' + (done ? ' checked' : '') + '>' +
      '<label for="' + id + '" class="lp-ic"><span aria-hidden="true">' + esc(tr.icon) + '</span><span class="lp-sr">' + (done ? 'Done: ' : 'Mark done: ') + esc(it.label) + '</span></label>' +
      '<span class="lp-lab">' + name + (it.sub ? ' <small>' + esc(it.sub) + '</small>' : '') + (opt && opt.track && tr.name !== it.label ? ' <small>' + esc(tr.name) + '</small>' : '') + '</span>' +
      '<span class="lp-min">' + (it.free ? '<span title="Doesn’t use your planning time">(' + fm(it.mins) + ')</span>' : fm(it.mins)) + '</span></li>';
  }
  function dayHead(d) { return '<span class="lp-load' + (d.over && d.load ? ' over' : '') + '">' + fm(d.load) + ' of ' + fm(d.cap) + (d.over && d.load ? ' · overloaded' : '') + '</span>'; }
  function clampCur() { if (view.cur < S.from) view.cur = S.from; if (view.cur > S.to) view.cur = S.to; }
  function nav(label, unit) {
    return '<div class="lp-nav"><button type="button" class="hs-btn ghost" data-nav="-1" aria-label="Previous ' + unit + '">‹</button><b>' + label + '</b><button type="button" class="hs-btn ghost" data-nav="1" aria-label="Next ' + unit + '">›</button>' +
      (TODAY >= S.from && TODAY <= S.to ? '<button type="button" class="hs-btn ghost" data-nav="0">Today</button>' : '') + '</div>';
  }
  function vToday() {
    clampCur();
    var d = S.byDn[view.cur], h = nav(esc(fdl(d.dn)) + (d.dn === TODAY ? ' · today' : ''), 'day');
    h += '<div class="lp-dayhead">' + dayHead(d) + (d.off ? ' <span class="lp-offtag">' + esc(d.off) + '</span>' : '') + '</div>';
    h += d.items.length ? '<ul class="lp-items">' + d.items.map(function (it) { return itemHTML(it, { track: true }); }).join('') + '</ul>' : '<p class="hs-small">Nothing planned for this day.</p>';
    // still open from the last week
    var open = [];
    for (var x = Math.max(S.from, d.dn - 7); x < d.dn; x++) S.byDn[x].items.forEach(function (it) { if (!isDone(it)) open.push(it); });
    if (open.length && d.dn <= TODAY) h += '<details class="lp-open"><summary>Still open from the last 7 days (' + open.length + ')</summary><ul class="lp-items">' + open.map(function (it) { return itemHTML(it, { track: true }).replace('<span class="lp-lab">', '<span class="lp-lab"><small>' + esc(fd(it.dn, { weekday: 'short', month: 'short', day: 'numeric' })) + '</small> '); }).join('') + '</ul></details>';
    // what's coming that happens rarely (so nothing is forgotten)
    var soon = [];
    for (var y = d.dn + 1; y <= Math.min(S.to, d.dn + 14); y++) S.byDn[y].items.forEach(function (it) { var tr = S.tracks[it.t]; if (C.perYear(tr.f) <= 12 || tr.kind === 'holiday') soon.push(it); });
    if (soon.length) h += '<h3 class="lp-h3">Coming up in the next two weeks</h3><ul class="lp-soon">' + soon.map(function (it) { return '<li><span aria-hidden="true">' + esc(S.tracks[it.t].icon) + '</span> ' + esc(fd(it.dn, { weekday: 'short', month: 'short', day: 'numeric' })) + ': ' + esc(it.label) + '</li>'; }).join('') + '</ul>';
    return h;
  }
  function vWeek() {
    clampCur();
    var w0 = C.weekStart(view.cur), h = nav('Week of ' + esc(fd(w0, { month: 'long', day: 'numeric', year: 'numeric' })), 'week') + '<div class="lp-week">';
    var tot = 0, cap = 0;
    for (var x = w0; x < w0 + 7; x++) {
      var d = S.byDn[x];
      if (!d) { h += '<div class="lp-wday out"><h3>' + esc(fd(x, { weekday: 'short', month: 'short', day: 'numeric' })) + '</h3><p class="hs-small">Outside the plan</p></div>'; continue; }
      tot += d.load; cap += d.cap;
      h += '<div class="lp-wday' + (d.dn === TODAY ? ' today' : '') + (d.over && d.load ? ' over' : '') + '"><h3><button type="button" class="lp-dbtn" data-day="' + d.dn + '">' + esc(fd(x, { weekday: 'short', month: 'short', day: 'numeric' })) + '</button></h3>' + dayHead(d) + (d.off ? '<span class="lp-offtag">' + esc(d.off) + '</span>' : '') +
        '<ul class="lp-items sm">' + d.items.map(function (it) { return itemHTML(it); }).join('') + '</ul></div>';
    }
    return h + '</div><p class="hs-small lp-wsum">This week: ' + fm(tot) + ' of ' + fm(cap) + (tot > cap ? ' · <b class="lp-badtxt">more than your time</b>' : '') + '</p>';
  }
  function monthGrid(y, m, compact) {
    var first = C.dnYMD(y, m, 1), last = C.dnYMD(y, m, C.monthLen(y, m)), g0 = C.weekStart(first), h = '<div class="lp-mgrid' + (compact ? ' compact' : '') + '" role="table" aria-label="' + esc(C.MON[m - 1] + ' ' + y) + '"><div class="lp-mrow lp-mhead" role="row">';
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(function (n) { h += '<span role="columnheader">' + n + '</span>'; });
    h += '</div>';
    for (var w = g0; w <= last; w += 7) {
      h += '<div class="lp-mrow" role="row">';
      for (var x = w; x < w + 7; x++) {
        var d = S.byDn[x], inM = x >= first && x <= last;
        if (!inM || !d) { h += '<span class="lp-mcell out" role="cell">' + (inM ? '<i>' + C.ymd(x).d + '</i>' : '') + '</span>'; continue; }
        var heat = d.cap ? Math.min(1, d.load / d.cap) : (d.load ? 1 : 0);
        h += '<span class="lp-mcell' + (d.over && d.load ? ' over' : '') + (x === TODAY ? ' today' : '') + (d.off ? ' off' : '') + '" role="cell" style="--h:' + heat.toFixed(2) + '"><button type="button" class="lp-dbtn" data-day="' + x + '" aria-label="' + esc(fdl(x)) + ': ' + d.items.length + ' tasks, ' + fm(d.load) + '">' + C.ymd(x).d + '</button>';
        if (compact) h += '<span class="lp-dots" aria-hidden="true">' + d.items.map(function (it) { return '<b style="background:' + esc(S.tracks[it.t].color) + '"></b>'; }).join('') + '</span>';
        else h += '<span class="lp-chips">' + d.items.map(function (it) { var tr = S.tracks[it.t]; return '<span class="lp-chip' + (isDone(it) ? ' done' : '') + '" style="--c:' + esc(tr.color) + '" title="' + esc(it.label + ' · ' + fm(it.mins)) + '"><span aria-hidden="true">' + esc(tr.icon) + '</span> ' + esc(short(it, tr)) + '</span>'; }).join('') + '</span>';
        h += '</span>';
      }
      h += '</div>';
    }
    return h + '</div>';
  }
  function short(it, tr) {
    if (tr.kind === 'bible' && it.ref) return 'Day ' + it.ref;
    if (tr.kind === 'gb' || tr.kind === 'hc') return tr.name;
    var s = it.label; return s.length > 34 ? s.slice(0, 32) + '…' : s;
  }
  function monthTotal(y, m) { var a = C.dnYMD(y, m, 1), b = C.dnYMD(y, m, C.monthLen(y, m)); return C.minutesIn(S, a, b); }
  function vMonth() {
    clampCur();
    var p = C.ymd(view.cur);
    return nav(esc(C.MON[p.m - 1] + ' ' + p.y), 'month') + '<p class="hs-small">' + fm(monthTotal(p.y, p.m)) + ' planned this month. Pick a day to see its list.</p>' + monthGrid(p.y, p.m, false);
  }
  function vQuarter() {
    clampCur();
    var p = C.ymd(view.cur), q0 = Math.floor((p.m - 1) / 3) * 3 + 1, h = nav('Quarter ' + ((q0 + 2) / 3) + ', ' + p.y, 'quarter') + '<div class="lp-quarter">';
    for (var i = 0; i < 3; i++) {
      var m = q0 + i, nonDaily = {};
      var a = C.dnYMD(p.y, m, 1), b = C.dnYMD(p.y, m, C.monthLen(p.y, m));
      for (var x = Math.max(a, S.from); x <= Math.min(b, S.to); x++) S.byDn[x].items.forEach(function (it) { var tr = S.tracks[it.t]; if (C.perYear(tr.f) <= 26 || tr.kind === 'holiday') (nonDaily[x] = nonDaily[x] || []).push(it); });
      h += '<div class="lp-qmonth"><h3>' + C.MON[m - 1] + ' <small>' + fm(monthTotal(p.y, m)) + '</small></h3>' + monthGrid(p.y, m, true);
      var keys = Object.keys(nonDaily);
      if (keys.length) h += '<ul class="lp-soon">' + keys.map(function (k) { return nonDaily[k].map(function (it) { return '<li><span aria-hidden="true">' + esc(S.tracks[it.t].icon) + '</span> ' + esc(fd(+k)) + ': ' + esc(it.label) + '</li>'; }).join(''); }).join('') + '</ul>';
      h += '</div>';
    }
    return h + '</div><p class="hs-small">The dots are each day’s tasks in their track colors. Under each month: the things that come up only now and then.</p>';
  }
  // year at a glance: one strip per track, a cell per week, shaded by how many times it happens that week
  function glance(a, b, print) {
    var w0 = C.weekStart(a), weeks = []; for (var w = w0; w <= b; w += 7) weeks.push(w);
    var h = '<div class="lp-glance' + (print ? ' pr' : '') + '" style="--n:' + weeks.length + '"><div class="lp-grow lp-gmon"><span class="lp-gname"></span><span class="lp-gcells">';
    var lastM = 0; weeks.forEach(function (w) { var m = C.ymd(Math.max(w, a)).m; h += '<i>' + (m !== lastM ? C.MON[m - 1].slice(0, 3) : '') + '</i>'; lastM = m; });
    h += '</span></div>';
    S.tracks.forEach(function (tr) {
      if (tr.off) return;
      var counts = weeks.map(function () { return 0; }), mx = 0;
      (S.items[tr.id] || []).forEach(function (it) { if (it.dn < a || it.dn > b) return; var i = Math.floor((it.dn - w0) / 7); counts[i]++; if (counts[i] > mx) mx = counts[i]; });
      var n = counts.reduce(function (s, c) { return s + c; }, 0);
      h += '<div class="lp-grow"><span class="lp-gname"><span aria-hidden="true">' + esc(tr.icon) + '</span> ' + esc(tr.name) + ' <small>' + n + '×</small></span><span class="lp-gcells" role="img" aria-label="' + esc(tr.name + ': ' + n + ' times, in ' + counts.filter(Boolean).length + ' of ' + weeks.length + ' weeks') + '">';
      counts.forEach(function (c) { h += '<b style="--c:' + esc(tr.color) + ';--o:' + (c ? (0.35 + 0.65 * c / mx).toFixed(2) : 0) + '"></b>'; });
      h += '</span></div>';
    });
    h += '<div class="lp-grow lp-gload"><span class="lp-gname">Overloaded weeks</span><span class="lp-gcells">';
    weeks.forEach(function (w) { var wk = null; S.weeks.forEach(function (x) { if (x.from <= Math.max(w, a) && x.to >= Math.max(w, a)) wk = x; }); h += '<b class="' + (wk && wk.over ? 'over' : '') + '"></b>'; });
    return h + '</span></div></div>';
  }
  function vYear() {
    return '<p class="hs-small">Every track across the whole plan, one square a week: darker means more times that week, a gap means it doesn’t happen that week. Red squares in the last row are weeks with more than your time.</p>' +
      '<div class="lp-gwrap">' + glance(S.from, S.to) + '</div>';
  }
  function sumHTML(a, b, print) {
    var R = T.summary(S, S.tracks, DATA, P, a, b), h = '';
    h += '<div class="lp-big"><div><b>' + hrs(R.mins / R.weeks) + '</b><span>a week on average</span></div><div><b>' + hrs(R.mins) + '</b><span>in all, over ' + R.days + ' days</span></div>' +
      (R.activity ? '<div><b>' + R.activity.met + ' of ' + R.activity.weeks + '</b><span>full weeks meet the activity guideline</span></div>' : '') + '</div>';
    h += '<table class="lp-sumt"><caption class="lp-sr">Hours and results by track</caption><thead><tr><th scope="col">Track</th><th scope="col">How often</th><th scope="col">A week</th><th scope="col">By the end</th></tr></thead><tbody>';
    var mx = 0; R.per.forEach(function (r) { if (r.mins > mx) mx = r.mins; });
    R.per.forEach(function (r) {
      var tr = r.track, wkm = r.mins / R.weeks;
      h += '<tr style="--c:' + esc(tr.color) + '"><th scope="row"><span aria-hidden="true">' + esc(tr.icon) + '</span> ' + esc(tr.name) + '</th><td>' + (tr.kind === 'holiday' ? 'Menu, shopping and cooking' : esc(C.freqText(tr.f)) + ', ' + fm(tr.mins)) + '</td>' +
        '<td class="lp-num">' + (tr.free ? '(' + fm(wkm) + ')' : fm(wkm)) + (print ? '' : '<span class="lp-bar"><b style="width:' + (mx ? (100 * r.mins / mx).toFixed(1) : 0) + '%"></b></span>') + '</td><td>' + r.text.map(esc).join('<br>') + '</td></tr>';
    });
    h += '</tbody></table>';
    if (R.per.some(function (r) { return r.track.free; })) h += '<p class="hs-small">Times in brackets are for tracks that are already part of your day; they aren’t counted in the totals.</p>';
    if (R.activity) h += '<p class="hs-small">Activity guideline (U.S. Physical Activity Guidelines for Americans, 2nd edition): at least 150 minutes of moderate activity a week (vigorous minutes count double) and muscle-strengthening on 2 or more days. Your plan has 150 minutes in ' + R.activity.aer + ' and 2 strength days in ' + R.activity.str + ' of ' + R.activity.weeks + ' full weeks.</p>';
    return h;
  }
  function vSum() {
    var p = view.sp || 'plan', a = S.from, b = S.to, c = view.cur;
    if (p === 'month') { var y = C.ymd(c); a = C.dnYMD(y.y, y.m, 1); b = C.dnYMD(y.y, y.m, C.monthLen(y.y, y.m)); }
    if (p === 'week') { a = C.weekStart(c); b = a + 6; }
    if (p === 'quarter') { var q = C.ymd(c), m0 = Math.floor((q.m - 1) / 3) * 3 + 1; a = C.dnYMD(q.y, m0, 1); b = addMonths(a, 3) - 1; }
    a = Math.max(a, S.from); b = Math.min(b, S.to);
    return '<div class="lp-sumhead"><p>If you stick to the plan from <b>' + esc(fd(a, { month: 'long', day: 'numeric', year: 'numeric' })) + '</b> to <b>' + esc(fd(b, { month: 'long', day: 'numeric', year: 'numeric' })) + '</b>:</p>' +
      '<label>Period <select id="lp-sp">' + [['plan', 'The whole plan'], ['quarter', 'This quarter'], ['month', 'This month'], ['week', 'This week']].map(function (o) { return '<option value="' + o[0] + '"' + (p === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label></div>' + sumHTML(a, b);
  }
  function renderView() {
    $$('#lp-tabs [role=tab]').forEach(function (b) { var on = b.dataset.tab === view.tab; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    $('#lp-view').setAttribute('aria-labelledby', 'lp-tab-' + view.tab);
    $('#lp-view').innerHTML = ({ today: vToday, week: vWeek, month: vMonth, quarter: vQuarter, year: vYear, sum: vSum })[view.tab]();
  }
  $('#lp-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; view.tab = st.tab = b.dataset.tab; save(); renderView(); });
  $('#lp-tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tabs = $$('#lp-tabs [role=tab]'), i = tabs.indexOf(D.activeElement); if (i < 0) return;
    var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click(); e.preventDefault();
  });
  $('#lp-view').addEventListener('click', function (e) {
    var n = e.target.closest('[data-nav]');
    if (n) {
      var dir = +n.dataset.nav;
      if (!dir) view.cur = TODAY;
      else if (view.tab === 'today') view.cur += dir;
      else if (view.tab === 'week') view.cur = C.weekStart(view.cur) + 7 * dir;
      else if (view.tab === 'month') { var p = C.ymd(view.cur); view.cur = addMonths(C.dnYMD(p.y, p.m, 1), dir); }
      else if (view.tab === 'quarter') { var q = C.ymd(view.cur); view.cur = addMonths(C.dnYMD(q.y, Math.floor((q.m - 1) / 3) * 3 + 1, 1), 3 * dir); }
      clampCur(); renderView(); var again = $('#lp-view [data-nav="' + n.dataset.nav + '"]'); if (again) again.focus();
      return;
    }
    var d = e.target.closest('[data-day]');
    if (d) { view.cur = +d.dataset.day; view.tab = 'today'; renderView(); $('#lp-view').focus(); }
  });
  $('#lp-view').addEventListener('change', function (e) {
    if (e.target.id === 'lp-sp') { view.sp = e.target.value; renderView(); return; }
    if (!e.target.classList.contains('lp-ck')) return;
    var it = findItem(e.target.dataset.id, +e.target.dataset.dn); if (!it) return;
    setDone(it, e.target.checked);
    $$('.lp-ck[data-id="' + it.id + '"][data-dn="' + it.dn + '"]').forEach(function (c) { c.checked = e.target.checked; var li = c.closest('.lp-it'); if (li) li.classList.toggle('done', e.target.checked); });
  });

  // ---------- tracks list ----------
  function trackDesc(t) {
    var o = t.opt || {}, s = C.freqText(t.f);
    if (t.kind === 'holiday') return 'Plan the menu two weeks ahead, shop two days ahead, cook on the day';
    s += ' · ' + fm(t.mins) + (t.kind === 'gb' ? ' a day' : '');
    if (t.kind === 'bible') s += ' · ' + (o.ver === '66' ? '66-book' : '73-book') + ' · ' + (o.mode === 'dates' ? 'Day 1 = ' + fd(C.dnOf(o.bstart), { month: 'short', day: 'numeric', year: 'numeric' }) : 'from day ' + (o.from || 1));
    if (t.kind === 'ladder') { var c = courseInfo(o.l, o.c); if (c) s += ' · ' + c.lt + ': ' + c.t + ', from topic ' + ((+o.from || 0) + 1); }
    if (t.start || t.end) s += ' · ' + (t.start ? 'from ' + fd(C.dnOf(t.start)) : '') + (t.end ? ' until ' + fd(C.dnOf(t.end)) : '');
    if (t.free) s += ' · doesn’t use your planning time';
    return s;
  }
  function courseInfo(l, k) { for (var i = 0; i < CFG.courses.length; i++) if (CFG.courses[i].l === l && CFG.courses[i].k === k) return CFG.courses[i]; return null; }
  function renderTracks() {
    $('#lp-starter').textContent = st.starter ? 'This is a starter plan to change: edit, pause or remove any track, and add your own.' : '';
    $('#lp-tlist').innerHTML = st.tracks.map(function (t, i) {
      var n = (S.items[t.id] || []).length;
      return '<li class="lp-tr' + (t.off ? ' paused' : '') + '" style="--c:' + esc(t.color) + '"><span class="lp-tric" aria-hidden="true">' + esc(t.icon) + '</span><span class="lp-trtx"><b>' + esc(t.name) + '</b>' + (t.off ? ' <small>(paused)</small>' : '') + '<small>' + esc(trackDesc(t)) + (t.off ? '' : ' · ' + n + ' time' + (n === 1 ? '' : 's') + ' in this plan') + '</small></span>' +
        '<span class="lp-trbtn"><button type="button" class="hs-btn ghost" data-edit="' + i + '" aria-label="Change ' + esc(t.name) + '">Change</button><button type="button" class="hs-btn ghost" data-pause="' + i + '" aria-label="' + (t.off ? 'Resume ' : 'Pause ') + esc(t.name) + '">' + (t.off ? 'Resume' : 'Pause') + '</button><button type="button" class="hs-btn ghost" data-del="' + i + '" aria-label="Remove ' + esc(t.name) + '">✕</button></span></li>';
    }).join('') || '<li class="hs-small">No tracks yet. Add one to start.</li>';
  }
  $('#lp-tlist').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.edit != null) editTrack(+b.dataset.edit);
    if (b.dataset.pause != null) { var t = st.tracks[+b.dataset.pause]; t.off = !t.off; st.starter = false; save(); all(); }
    if (b.dataset.del != null) { var t2 = st.tracks[+b.dataset.del]; if (W.confirm('Remove “' + t2.name + '” from your plan?')) { st.tracks.splice(+b.dataset.del, 1); st.starter = false; save(); all(); msg('Removed “' + t2.name + '”.'); } }
  });

  // ---------- time budget and days off ----------
  function renderBudget() {
    var order = [1, 2, 3, 4, 5, 6, 0];
    $('#lp-budget').innerHTML = order.map(function (d) { return '<label><span>' + C.DOWN[d] + '</span><input type="number" min="0" max="1440" step="5" data-dow="' + d + '" value="' + st.plan.budget[d] + '"> min</label>'; }).join('') +
      '<p class="hs-small lp-btot">' + fm(st.plan.budget.reduce(function (s, x) { return s + x; }, 0)) + ' a week</p>';
    $('#lp-offs').innerHTML = st.plan.off.map(function (o, i) { return '<li>' + esc(fd(C.dnOf(o.from), { month: 'short', day: 'numeric', year: 'numeric' })) + (o.to && o.to !== o.from ? ' – ' + esc(fd(C.dnOf(o.to), { month: 'short', day: 'numeric', year: 'numeric' })) : '') + (o.label ? ': ' + esc(o.label) : '') + ' <button type="button" class="hs-btn ghost" data-offdel="' + i + '" aria-label="Remove these days off">✕</button></li>'; }).join('') || '<li class="hs-small">None yet.</li>';
  }
  $('#lp-budget').addEventListener('change', function (e) { var d = e.target.dataset.dow; if (d == null) return; st.plan.budget[+d] = Math.max(0, Math.min(1440, Math.round(+e.target.value || 0))); save(); all(); });
  $('#lp-offs').addEventListener('click', function (e) { var b = e.target.closest('[data-offdel]'); if (!b) return; st.plan.off.splice(+b.dataset.offdel, 1); save(); all(); });
  $('#lp-off-add').addEventListener('click', function () {
    var f = $('#lp-off-from').value, t = $('#lp-off-to').value || f;
    if (C.dnOf(f) == null) { msg('Choose the first day off.'); $('#lp-off-from').focus(); return; }
    if (C.dnOf(t) < C.dnOf(f)) t = f;
    st.plan.off.push({ from: f, to: t, label: $('#lp-off-label').value.trim().slice(0, 40) });
    st.plan.off.sort(function (a, b) { return a.from < b.from ? -1 : 1; });
    $('#lp-off-from').value = $('#lp-off-to').value = $('#lp-off-label').value = '';
    save(); all(); msg('Days off added.');
  });

  // ---------- dialogs ----------
  var dlg = $('#lp-dlg'), dform = $('#lp-dlgform'), lastFocus = null;
  function openDlg(title, body, onOpen) {
    if (!dlg.contains(D.activeElement)) lastFocus = D.activeElement;
    dform.innerHTML = '<div class="lp-dlghead"><h2 id="lp-dlg-h">' + esc(title) + '</h2><button type="button" class="hs-btn ghost" id="lp-dlgx" aria-label="Close">✕</button></div>' + body;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    $('#lp-dlgx').addEventListener('click', closeDlg);
    if (onOpen) onOpen(dform);
  }
  function closeDlg() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  dlg.addEventListener('close', function () { if (!dlg.open && lastFocus && lastFocus.focus && D.contains(lastFocus)) lastFocus.focus(); });

  // library
  function srcHTML(src) { return (src || []).map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>'; }).join('; '); }
  function libRow(cat, it) {
    return '<li class="lp-lib"><span class="lp-tric" aria-hidden="true">' + esc(it.icon) + '</span><span class="lp-trtx"><b>' + esc(it.name) + '</b><small>' + esc(it.blurb || (C.freqText(freqFrom(it.f)) + ' · about ' + fm(it.mins))) + (it.range ? ' · Guidance: ' + esc(it.range) : '') + '</small>' +
      (it.note ? '<small>' + esc(it.note) + '</small>' : '') + (cat === 'chores' ? '<small class="lp-src">' + (it.src ? 'Source: ' + srcHTML(it.src) : 'Our own rough default') + '</small>' : '') + '</span>' +
      '<button type="button" class="hs-btn" data-lib="' + cat + ':' + esc(it.key) + '" aria-label="Add ' + esc(it.name) + '">Add</button></li>';
  }
  var CAT = { kitchen: 'Kitchen', bath: 'Bathroom', laundry: 'Laundry and beds', house: 'Around the house', safety: 'Home safety and upkeep', car: 'Car' };
  function openLibrary(tab) {
    tab = tab || 'read';
    var tabs = [['read', 'Reading'], ['learn', 'Learning'], ['exercise', 'Exercise'], ['chores', 'Chores'], ['meals', 'Meals'], ['own', 'Your own']];
    var body = '<div class="lp-tabs sm" role="tablist" aria-label="Library">' + tabs.map(function (x) { return '<button type="button" role="tab" data-ltab="' + x[0] + '" aria-selected="' + (x[0] === tab) + '">' + x[1] + '</button>'; }).join('') + '</div><div class="lp-libbody" id="lp-libbody" role="tabpanel"></div>';
    openDlg('Add a track', body, function (f) {
      function show(t) {
        tab = t; $$('[data-ltab]', f).forEach(function (b) { b.setAttribute('aria-selected', b.dataset.ltab === t ? 'true' : 'false'); });
        var h = '';
        if (t === 'read') {
          h += '<ul class="lp-libl">';
          if (CFG.urls.bible) h += '<li class="lp-lib"><span class="lp-tric" aria-hidden="true">📖</span><span class="lp-trtx"><b>Bible in a Year</b><small>A reading every day, about 15 to 20 minutes. Shares its ticks with the Bible in a Year page.</small></span><button type="button" class="hs-btn" data-add="bible">Add</button></li>';
          if (CFG.urls.gb) h += '<li class="lp-lib"><span class="lp-tric" aria-hidden="true">📚</span><span class="lp-trtx"><b>Great Books</b><small>Follows the Great Books in a Year plan rung by rung.</small><label class="lp-inl">Minutes a day <input type="number" id="lp-gbmin" min="5" max="120" step="5" value="15"></label></span><button type="button" class="hs-btn" data-add="gb">Add</button></li>';
          if (CFG.urls.hc) h += '<li class="lp-lib"><span class="lp-tric" aria-hidden="true">📜</span><span class="lp-trtx"><b>Harvard Classics, fifteen minutes a day</b><small>The 1930 Reading Guide’s reading for each date.</small></span><button type="button" class="hs-btn" data-add="hc">Add</button></li>';
          if (CFG.urls.tr && CFG.trGoals && CFG.trGoals.length) h += '<li class="lp-lib"><span class="lp-tric" aria-hidden="true">🏺</span><span class="lp-trtx"><b>Translate in a Year</b><small>A Latin or Greek classic, a passage a day, following the day plan in the reader (word help and a translation to check against).</small><label class="lp-inl">Work <select id="lp-trw">' + CFG.trGoals.map(function (g) { return '<option value="' + esc(g.k) + '">' + esc(g.t.replace(/^Translate /, '')) + ': ' + g.days + ' days, about ' + fm(g.mins) + ' a day</option>'; }).join('') + '</select></label></span><button type="button" class="hs-btn" data-add="translate">Add</button></li>';
          h += '</ul>';
        } else if (t === 'learn') {
          var groups = {}; CFG.courses.forEach(function (c) { (groups[c.lt] = groups[c.lt] || []).push(c); });
          h += '<div class="lp-libform"><h3>A ladder course</h3><p class="hs-small">One lesson is one topic, with its practice. Topics you pass on the ladder are ticked here too.</p>' +
            '<label>Course <select id="lp-course">' + Object.keys(groups).map(function (g) { return '<optgroup label="' + esc(g) + '">' + groups[g].map(function (c) { return '<option value="' + esc(c.l + '|' + c.k) + '">' + esc(c.t) + ' (' + c.n + ' topics)</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></label>' +
            '<label>Lessons a week <input type="number" id="lp-cn" min="1" max="7" value="3"></label><button type="button" class="hs-btn" data-add="ladder">Add</button></div>';
          if (CFG.trades.length) h += '<div class="lp-libform"><h3>A trade</h3><label>Course <select id="lp-trade">' + CFG.trades.map(function (x) { return '<option value="' + esc(x.k) + '">' + esc(x.t) + ' (' + x.n + ' lessons)</option>'; }).join('') + '</select></label>' +
            '<label>Lessons a week <input type="number" id="lp-tn" min="1" max="7" value="2"></label><button type="button" class="hs-btn" data-add="trade">Add</button></div>';
          h += '<h3>Other ideas</h3><ul class="lp-libl">' + CFG.lib.learn.map(function (it) { return libRow('learn', it); }).join('') + '</ul>';
        } else if (t === 'exercise') {
          h += '<p class="hs-small">The U.S. Physical Activity Guidelines for Americans (2nd edition, 2018) suggest adults get 150 to 300 minutes a week of moderate activity, such as brisk walking, or 75 to 150 minutes of vigorous activity, or a mix, plus muscle-strengthening activity on 2 or more days. If you have a chronic health condition or symptoms, the guidelines advise doing this under the care of a health care provider; if you haven’t been active, start slowly and build up.</p><ul class="lp-libl">' + CFG.lib.exercise.map(function (it) { return libRow('exercise', it); }).join('') + '</ul>';
        } else if (t === 'chores') {
          h += '<p class="hs-small">Each chore has a default, the range the guidance gives, and its source. All of them are adjustable, and the times are rough.</p>';
          var cats = {}; CFG.lib.chores.forEach(function (it) { (cats[it.cat] = cats[it.cat] || []).push(it); });
          Object.keys(cats).forEach(function (c) { h += '<h3>' + esc(CAT[c] || c) + '</h3><ul class="lp-libl">' + cats[c].map(function (it) { return libRow('chores', it); }).join('') + '</ul>'; });
        } else if (t === 'meals') {
          h += '<ul class="lp-libl">' + CFG.lib.meals.map(function (it) { return libRow('meals', it); }).join('') + '</ul><h3>Holidays</h3><p class="hs-small">From the Meal Prep collections: plan the menu two weeks before, shop two days before, and cook on the day.</p><ul class="lp-libl">' +
            CFG.hols.map(function (k) { var H = T.HOL[k]; return '<li class="lp-lib"><span class="lp-tric" aria-hidden="true">' + esc(H.icon) + '</span><span class="lp-trtx"><b>' + esc(H.t) + '</b></span><button type="button" class="hs-btn" data-add="hol:' + k + '">Add</button></li>'; }).join('') + '</ul>';
        } else {
          h += '<p>Anything else you want to keep up with: a hobby, a project, calling family, watering plants.</p><button type="button" class="hs-btn pri" data-add="custom">＋ Make your own track</button>';
        }
        $('#lp-libbody', f).innerHTML = h;
      }
      show(tab);
      f.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.ltab) { show(b.dataset.ltab); return; }
        var t = null;
        if (b.dataset.lib) { var p = b.dataset.lib.split(':'); t = fromLib(p[0], p[1]); if (p[0] === 'learn') t.kind = 'custom'; }
        else if (b.dataset.add === 'bible') t = bibleTrack();
        else if (b.dataset.add === 'gb') t = gbTrack(Math.max(5, Math.min(120, +$('#lp-gbmin', f).value || 15)));
        else if (b.dataset.add === 'hc') t = hcTrack();
        else if (b.dataset.add === 'translate') { var tg = CFG.trGoals.filter(function (g) { return g.k === $('#lp-trw', f).value; })[0] || CFG.trGoals[0]; t = mk({ kind: 'translate', name: tg.t.replace(/^Translate /, ''), icon: tg.la === 'grc' ? '🏛️' : '🏺', mins: tg.mins, f: { k: 'daily' }, opt: { w: tg.w, a: tg.a, b: tg.b, n: tg.days }, lib: 'read:tr-' + tg.k }); }
        else if (b.dataset.add === 'ladder') {
          var v = $('#lp-course', f).value.split('|'), c = courseInfo(v[0], v[1]), n = Math.max(1, Math.min(7, +$('#lp-cn', f).value || 3));
          t = mk({ kind: 'ladder', name: c.lt + ': ' + c.t, icon: c.li || '🪜', mins: c.m, f: { k: 'times', n: n }, opt: { l: c.l, c: c.k, from: 0 } });
          // start at the first topic not passed yet (read when its data arrives)
          t.opt.auto = 1;
        }
        else if (b.dataset.add === 'trade') { var k = $('#lp-trade', f).value, x = CFG.trades.filter(function (y) { return y.k === k; })[0]; t = mk({ kind: 'trade', name: x.t, icon: '🛠️', mins: 30, f: { k: 'times', n: Math.max(1, Math.min(7, +$('#lp-tn', f).value || 2)) }, opt: { tr: k, from: 0 } }); }
        else if (b.dataset.add && b.dataset.add.indexOf('hol:') === 0) t = holTrack(b.dataset.add.slice(4));
        else if (b.dataset.add === 'custom') { closeDlg(); editTrack(-1); return; }
        if (!t) return;
        st.tracks.push(t); st.starter = false; save(); closeDlg(); all(); msg('Added “' + t.name + '”. Use Change to set how often and how long.');
      });
    });
  }
  $('#lp-add').addEventListener('click', function () { openLibrary(); });

  // track editor
  var KINDS = [['daily', 'Every day'], ['weekdays', 'Weekdays (Monday to Friday)'], ['days', 'On certain days of the week'], ['times', 'A number of times a week (on days with room)'], ['weeks', 'Every week or every few weeks'], ['months', 'Every month or every few months'], ['inmonths', 'In certain months'], ['dates', 'On certain dates']];
  function editTrack(i) {
    var t = i >= 0 ? JSON.parse(JSON.stringify(st.tracks[i])) : mk({ name: '', icon: '⭐' }), f = t.f, o = t.opt || {};
    var fk = f.k === 'months' ? (f.months && f.months.length && !isEvery(f.months) ? 'inmonths' : 'months') : f.k;
    function isEvery(ms) { if (ms.length === 12) return true; var gaps = ms.map(function (m, j) { return ((ms[(j + 1) % ms.length] - m) + 12) % 12 || 12; }); return gaps.every(function (g) { return g === gaps[0]; }) && 12 % gaps[0] === 0; }
    var every = f.k === 'months' && f.months && f.months.length ? Math.round(12 / f.months.length) : 1;
    var on = f.on && f.on !== 'flex' ? (f.on.day != null ? 'day' : 'nth') : 'flex';
    function dayBoxes(name, sel) { return '<div class="lp-dows">' + [1, 2, 3, 4, 5, 6, 0].map(function (d) { return '<label><input type="checkbox" name="' + name + '" value="' + d + '"' + ((sel || []).indexOf(d) >= 0 ? ' checked' : '') + '> ' + C.DOWS[d] + '</label>'; }).join('') + '</div>'; }
    var colors = '<div class="lp-colors" role="radiogroup" aria-label="Color">' + COLORS.map(function (c, j) { return '<label class="lp-sw" style="--c:' + c + '"><input type="radio" name="color" value="' + c + '"' + (t.color === c ? ' checked' : '') + '><span class="lp-sr">Color ' + (j + 1) + '</span></label>'; }).join('') + '</div>';
    var body = '<div class="lp-form">' +
      '<label class="lp-wide">Name <input type="text" name="name" maxlength="80" required value="' + esc(t.name) + '"></label>' +
      '<label>Icon <input type="text" name="icon" maxlength="4" value="' + esc(t.icon) + '" class="lp-icon"></label>' +
      '<fieldset class="lp-wide"><legend>Color</legend>' + colors + '</fieldset>' +
      (t.kind === 'holiday' ? '<p class="lp-wide hs-small">' + esc(trackDesc(t)) + '. Cooking day estimate:</p>' :
      '<label class="lp-wide">How often <select name="fk">' + KINDS.map(function (k) { return '<option value="' + k[0] + '"' + (fk === k[0] ? ' selected' : '') + '>' + k[1] + '</option>'; }).join('') + '</select></label>' +
      '<div class="lp-wide lp-fsub" data-for="days"><span class="lp-lbl">Days</span>' + dayBoxes('d', f.k === 'days' ? f.d : [1]) + '</div>' +
      '<div class="lp-wide lp-fsub" data-for="times"><label>Times a week <input type="number" name="tn" min="1" max="7" value="' + (f.k === 'times' ? f.n : 2) + '"></label><span class="lp-lbl">Only on these days (leave all unticked for any day)</span>' + dayBoxes('td', f.k === 'times' ? f.d : []) + '</div>' +
      '<div class="lp-wide lp-fsub" data-for="weeks"><label>Every <select name="wn">' + [1, 2, 3, 4, 6, 8].map(function (n) { return '<option value="' + n + '"' + ((f.k === 'weeks' ? +f.n : 1) === n ? ' selected' : '') + '>' + (n === 1 ? 'week' : n + ' weeks') + '</option>'; }).join('') + '</select></label>' +
      '<label>On <select name="wd"><option value="">the day with the most room</option>' + [1, 2, 3, 4, 5, 6, 0].map(function (d) { return '<option value="' + d + '"' + (f.k === 'weeks' && f.dow === d ? ' selected' : '') + '>' + C.DOWN[d] + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="lp-wide lp-fsub" data-for="months"><label>Every <select name="mn">' + [1, 2, 3, 4, 6, 12].map(function (n) { return '<option value="' + n + '"' + (every === n ? ' selected' : '') + '>' + (n === 1 ? 'month' : n === 12 ? 'year' : n + ' months') + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="lp-wide lp-fsub" data-for="inmonths"><span class="lp-lbl">Months</span><div class="lp-dows">' + C.MON.map(function (m, j) { return '<label><input type="checkbox" name="ms" value="' + (j + 1) + '"' + (f.k === 'months' && (f.months || []).indexOf(j + 1) >= 0 ? ' checked' : '') + '> ' + m.slice(0, 3) + '</label>'; }).join('') + '</div></div>' +
      '<div class="lp-wide lp-fsub" data-for="months inmonths"><label>On <select name="on"><option value="flex"' + (on === 'flex' ? ' selected' : '') + '>the day with the most room that month</option><option value="day"' + (on === 'day' ? ' selected' : '') + '>a day of the month</option><option value="nth"' + (on === 'nth' ? ' selected' : '') + '>a weekday of the month</option></select></label>' +
      '<label data-on="day">Day <input type="number" name="md" min="1" max="31" value="' + (f.on && f.on.day || 1) + '"></label>' +
      '<label data-on="nth">The <select name="nth">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + ((f.on && f.on.nth || 1) === n ? ' selected' : '') + '>' + ['first', 'second', 'third', 'fourth', 'last'][n - 1] + '</option>'; }).join('') + '</select> <select name="ndow" aria-label="Weekday">' + [1, 2, 3, 4, 5, 6, 0].map(function (d) { return '<option value="' + d + '"' + ((f.on && f.on.dow != null ? f.on.dow : 6) === d ? ' selected' : '') + '>' + C.DOWN[d] + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="lp-wide lp-fsub" data-for="dates"><label class="lp-wide">Dates, one per line (YYYY-MM-DD) <textarea name="dates" rows="4">' + esc((f.dates || []).join('\n')) + '</textarea></label></div>') +
      '<label>' + (t.kind === 'gb' ? 'Minutes a day' : 'Minutes each time') + ' <input type="number" name="mins" min="0" max="720" step="1" value="' + t.mins + '"></label>' +
      (t.kind !== 'holiday' ? '<label>Starts (optional) <input type="date" name="start" value="' + esc(t.start || '') + '"></label><label>Ends (optional) <input type="date" name="end" value="' + esc(t.end || '') + '"></label>' : '') +
      (t.kind !== 'holiday' ? '<div class="lp-wide lp-fsub" data-for="times weeks months inmonths"><span class="lp-lbl">Preferred days, when there’s room</span>' + dayBoxes('pref', t.pref) + '</div>' : '') +
      '<label class="lp-wide lp-chk"><input type="checkbox" name="keepOff"' + (t.keepOff ? ' checked' : '') + '> Keep it on days off (fixed days only)</label>' +
      '<label class="lp-wide lp-chk"><input type="checkbox" name="free"' + (t.free ? ' checked' : '') + '> Already part of my day (show it, but don’t count it against my planning time)</label>' +
      kindFields(t) + '</div>' +
      '<div class="lp-dlgbtns"><button type="submit" class="hs-btn pri" value="ok">' + (i >= 0 ? 'Save changes' : 'Add this track') + '</button><button type="button" class="hs-btn ghost" id="lp-cancel">Cancel</button></div>';
    openDlg(i >= 0 ? 'Change “' + t.name + '”' : 'Your own track', body, function (fo) {
      function sync() {
        var k = fo.fk ? fo.fk.value : '', onv = fo.on ? fo.on.value : '';
        $$('.lp-fsub', fo).forEach(function (el) { el.hidden = el.dataset.for.split(' ').indexOf(k) < 0; });
        $$('[data-on]', fo).forEach(function (el) { el.hidden = el.dataset.on !== onv; });
      }
      sync(); fo.addEventListener('change', sync);
      $('#lp-cancel', fo).addEventListener('click', closeDlg);
      fo.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pick]'); if (!b) return;
        if (b.dataset.pick === 'bible') { var dn = P.bible(fo.ver.value), n = 1; while (dn[n] && n < 365) n++; fo.bfrom.value = n; fo.bmode.value = 'seq'; msg('Day ' + n + ' is your next unread day.'); }
        if (b.dataset.pick === 'gb') { ensureThen('gb', function () { var days = DATA.gb.days, k = 0; while (k < days.length && (days[k][4] || []).length && days[k][4].every(P.passed)) k++; fo.gbfrom.value = k + 1; msg('Plan day ' + (k + 1) + ' is the first one you haven’t finished.'); }); }
        if (b.dataset.pick === 'ladder') { ensureThen('lad:' + o.l, function () { var ch = T.chain(DATA, { l: o.l, c: fo.lc.value }), k = 0; while (k < ch.length && P.passed(ch[k].id)) k++; fo.lfrom.value = k + 1; msg('Topic ' + (k + 1) + ' is the first one not passed yet.'); }); }
      });
      fo.onsubmit = function (e) {
        e.preventDefault();
        var name = fo.name.value.trim(); if (!name) { fo.name.focus(); return; }
        t.name = name.slice(0, 80); t.icon = fo.icon.value.trim().slice(0, 4) || '⭐'; t.color = (fo.color && fo.color.value) || t.color;
        t.mins = Math.max(0, Math.min(720, Math.round(+fo.mins.value || 0)));
        if (t.kind !== 'holiday') {
          var k = fo.fk.value, nf = { k: k }, boxes = function (n) { return $$('input[name="' + n + '"]:checked', fo).map(function (x) { return +x.value; }); };
          if (k === 'days') { nf.d = boxes('d'); if (!nf.d.length) nf.d = [1]; }
          if (k === 'times') { nf.n = Math.max(1, Math.min(7, +fo.tn.value || 1)); var td = boxes('td'); if (td.length) { nf.d = td; nf.n = Math.min(nf.n, td.length); } }
          if (k === 'weeks') { nf.n = +fo.wn.value || 1; if (fo.wd.value !== '') nf.dow = +fo.wd.value; }
          if (k === 'months' || k === 'inmonths') {
            nf.k = 'months';
            nf.months = k === 'months' ? C.monthsList({ every: +fo.mn.value }, C.dnOf(t.start) || RANGE[0]) : boxes('ms');
            if (!nf.months.length) nf.months = [C.ymd(RANGE[0]).m];
            var ov = fo.on.value; nf.on = ov === 'day' ? { day: Math.max(1, Math.min(31, +fo.md.value || 1)) } : ov === 'nth' ? { nth: +fo.nth.value, dow: +fo.ndow.value } : 'flex';
          }
          if (k === 'dates') nf.dates = fo.dates.value.split(/[\s,]+/).filter(function (s) { return C.dnOf(s) != null; }).sort();
          t.f = nf;
          t.start = C.dnOf(fo.start.value) != null ? fo.start.value : ''; t.end = C.dnOf(fo.end.value) != null ? fo.end.value : '';
          t.pref = boxes('pref');
        }
        t.keepOff = fo.keepOff.checked; t.free = fo.free.checked;
        readKind(t, fo);
        if (i >= 0) st.tracks[i] = t; else st.tracks.push(t);
        st.starter = false; save(); closeDlg(); all(); msg(i >= 0 ? 'Saved.' : 'Added “' + t.name + '”.');
      };
    });
  }
  function ensureThen(k, cb) { if (have(k)) cb(); else fetchData(k).then(function () { if (have(k)) cb(); }); }
  function kindFields(t) {
    var o = t.opt || {};
    if (t.kind === 'bible') return '<fieldset class="lp-wide"><legend>Bible in a Year</legend><label>Version <select name="ver"><option value="73"' + (o.ver !== '66' ? ' selected' : '') + '>73 books (Catholic)</option><option value="66"' + (o.ver === '66' ? ' selected' : '') + '>66 books</option></select></label>' +
      '<label>Days <select name="bmode"><option value="seq"' + (o.mode !== 'dates' ? ' selected' : '') + '>one day of the plan each time, starting at a day number</option><option value="dates"' + (o.mode === 'dates' ? ' selected' : '') + '>the same dates as my Bible in a Year page</option></select></label>' +
      '<label>Start at day <input type="number" name="bfrom" min="1" max="365" value="' + (o.from || 1) + '"></label> <button type="button" class="hs-btn ghost" data-pick="bible">My next unread day</button>' +
      '<label>Day 1 is <input type="date" name="bstart" value="' + esc(o.bstart || (load(BY) || {}).start || '') + '"></label><p class="hs-small">“Same dates” uses Day 1 above (the Bible in a Year page’s start date, when it has one).</p></fieldset>';
    if (t.kind === 'gb') return '<fieldset class="lp-wide"><legend>Great Books in a Year</legend><label>Start at plan day <input type="number" name="gbfrom" min="1" max="365" value="' + ((+o.from || 0) + 1) + '"></label> <button type="button" class="hs-btn ghost" data-pick="gb">After the rungs I’ve passed</button></fieldset>';
    if (t.kind === 'ladder') {
      var cs = CFG.courses.filter(function (c) { return c.l === o.l; });
      return '<fieldset class="lp-wide"><legend>Ladder course</legend><label>Course <select name="lc">' + cs.map(function (c) { return '<option value="' + esc(c.k) + '"' + (c.k === o.c ? ' selected' : '') + '>' + esc(c.t) + '</option>'; }).join('') + '</select></label>' +
        '<label>Start at topic <input type="number" name="lfrom" min="1" max="999" value="' + ((+o.from || 0) + 1) + '"></label> <button type="button" class="hs-btn ghost" data-pick="ladder">My first topic not passed</button><p class="hs-small">When a course ends, the plan goes on to the ladder’s next course.</p></fieldset>';
    }
    if (t.kind === 'trade') return '<fieldset class="lp-wide"><legend>Trade course</legend><label>Start at lesson <input type="number" name="trfrom" min="1" max="99" value="' + ((+o.from || 0) + 1) + '"></label></fieldset>';
    if (t.kind === 'cook') return '<fieldset class="lp-wide"><legend>Meal Prep</legend><label>Meal <select name="slot">' + ['breakfast', 'lunch', 'dinner'].map(function (s) { return '<option value="' + s + '"' + (o.slot === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label><p class="hs-small">On days your <a href="' + esc(BASE) + 'meal-prep/plan/">Meal Planner</a> covers, this shows the recipes you planned and their prep and cook time; on other days, the minutes above.</p></fieldset>';
    if (t.kind === 'exercise') return '<fieldset class="lp-wide"><legend>Kind of activity</legend><label>Counts as <select name="type">' + [['moderate', 'moderate aerobic activity'], ['vigorous', 'vigorous aerobic activity'], ['strength', 'muscle-strengthening'], ['stretch', 'stretching (not part of the guideline’s minutes)']].map(function (x) { return '<option value="' + x[0] + '"' + (t.type === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label></fieldset>';
    return '';
  }
  function readKind(t, fo) {
    var o = t.opt = t.opt || {};
    if (t.kind === 'bible') { o.ver = fo.ver.value; o.mode = fo.bmode.value; o.from = Math.max(1, Math.min(365, +fo.bfrom.value || 1)); o.bstart = C.dnOf(fo.bstart.value) != null ? fo.bstart.value : ''; if (o.mode === 'dates' && !o.bstart) o.mode = 'seq'; }
    if (t.kind === 'gb') o.from = Math.max(0, Math.min(364, (+fo.gbfrom.value || 1) - 1));
    if (t.kind === 'ladder') { if (fo.lc.value !== o.c) { var c = courseInfo(o.l, fo.lc.value); if (c && t.name.indexOf(c.lt) === 0) t.name = c.lt + ': ' + c.t; } o.c = fo.lc.value; o.from = Math.max(0, (+fo.lfrom.value || 1) - 1); delete o.auto; }
    if (t.kind === 'trade') o.from = Math.max(0, (+fo.trfrom.value || 1) - 1);
    if (t.kind === 'cook') o.slot = fo.slot.value;
    if (t.kind === 'exercise') t.type = fo.type.value;
  }
  // a new ladder track starts at the first topic not passed yet, once its data is here
  function autoStarts() {
    var ch = false;
    st.tracks.forEach(function (t) {
      if (t.kind !== 'ladder' || !t.opt.auto || !DATA.lad[t.opt.l]) return;
      var c = T.chain(DATA, t.opt), k = 0, end = c.filter(function (x) { return x.c === t.opt.c; }).length;
      while (k < end && P.passed(c[k].id)) k++;
      t.opt.from = k >= end ? 0 : k; delete t.opt.auto; ch = true;
    });
    if (ch) save();
  }

  // ---------- exports ----------
  function download(name, type, text) {
    var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function periodPick(prefix) {
    return '<fieldset><legend>Period</legend>' + [['plan', 'The whole plan (' + fd(S.from, { month: 'short', day: 'numeric', year: 'numeric' }) + ' – ' + fd(S.to, { month: 'short', day: 'numeric', year: 'numeric' }) + ')'], ['quarter', 'The quarter you’re looking at'], ['month', 'The month you’re looking at'], ['week', 'The week you’re looking at'], ['custom', 'Choose dates']].map(function (p, j) {
      return '<label class="lp-chk"><input type="radio" name="per" value="' + p[0] + '"' + (j === 0 ? ' checked' : '') + '> ' + esc(p[1]) + '</label>';
    }).join('') + '<div class="lp-custom"><label>From <input type="date" name="pf" value="' + C.isoOf(S.from) + '" min="' + C.isoOf(S.from) + '" max="' + C.isoOf(S.to) + '"></label><label>To <input type="date" name="pt" value="' + C.isoOf(S.to) + '" min="' + C.isoOf(S.from) + '" max="' + C.isoOf(S.to) + '"></label></div></fieldset>';
  }
  function periodOf(fo) {
    var p = fo.per.value, c = view.cur, a = S.from, b = S.to;
    if (p === 'week') { a = C.weekStart(c); b = a + 6; }
    if (p === 'month') { var y = C.ymd(c); a = C.dnYMD(y.y, y.m, 1); b = C.dnYMD(y.y, y.m, C.monthLen(y.y, y.m)); }
    if (p === 'quarter') { var q = C.ymd(c); a = C.dnYMD(q.y, Math.floor((q.m - 1) / 3) * 3 + 1, 1); b = addMonths(a, 3) - 1; }
    if (p === 'custom') { a = C.dnOf(fo.pf.value) || S.from; b = C.dnOf(fo.pt.value) || S.to; if (b < a) b = a; }
    return [Math.max(a, S.from), Math.min(b, S.to)];
  }

  // print: a summary page, then the period month by month or week by week
  // the resolution's cover page (st.res, made by lp-res.js): the goals, their pace and the commitment
  function coverHTML() {
    var r = st.res; if (!r) return '';
    var y = C.ymd(RANGE[0]), title = r.title || ('My resolution for ' + (y.m >= 10 && y.d > 1 ? y.y + 1 : y.y));
    return '<section class="lpp-page lpp-cover"><p class="lpp-sub">Teddy Rook Book · Life Planner</p><h1 class="lpp-big">' + esc(title) + '</h1>' +
      '<p class="lpp-when">' + esc(fd(RANGE[0], { month: 'long', day: 'numeric', year: 'numeric' })) + ' – ' + esc(fd(RANGE[1], { month: 'long', day: 'numeric', year: 'numeric' })) + ' · ' + esc(r.daysText || '') + (r.mins ? ' · about ' + fm(r.mins) + ' a day' : '') + '</p>' +
      '<h2>This year I will</h2><ol class="lpp-goals">' + (r.goals || []).map(function (g) { return '<li><b>' + esc(g.icon || '') + ' ' + esc(g.title) + '</b>' + (g.pace ? '<br><span>' + esc(g.pace) + '</span>' : '') + '</li>'; }).join('') + '</ol>' +
      (r.milestones && r.milestones.length ? '<h2>Milestones</h2><table class="lpp-ms"><tbody>' + r.milestones.map(function (m) { return '<tr><th scope="row">' + esc(m.when) + '</th><td>' + m.lines.map(esc).join('<br>') + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
      '<p class="lpp-commit">I’ll take it one day at a time. When I miss a day, I’ll pick up where I left off.</p><p class="lpp-sign">Signed ______________________________ &nbsp; Date ______________</p></section>';
  }
  function printHTML(a, b, layout) {
    var h = coverHTML() + '<section class="lpp-page lpp-sum"><h1>Life plan <small>' + esc(fd(a, { month: 'long', day: 'numeric', year: 'numeric' })) + ' – ' + esc(fd(b, { month: 'long', day: 'numeric', year: 'numeric' })) + '</small></h1>' +
      '<p class="lpp-sub">Teddy Rook Book · Life Planner · time per day: ' + [1, 2, 3, 4, 5, 6, 0].map(function (d) { return C.DOWS[d] + ' ' + st.plan.budget[d]; }).join(', ') + ' min</p>' +
      '<h2>If you stick to it</h2>' + sumHTML(a, b, true) + '<h2>At a glance</h2>' + glance(a, b, true) + '</section>';
    var daily = S.tracks.filter(function (t) { return !t.off && t.kind !== 'bible' && (t.f.k === 'daily' || t.f.k === 'weekdays'); });
    var dailyIds = daily.map(function (t) { return t.id; });
    var legend = daily.length ? '<p class="lpp-legend">Every day: ' + daily.map(function (t) { return '☐ <span aria-hidden="true">' + esc(t.icon) + '</span> ' + esc(t.name); }).join(' · ') + '</p>' : '';
    function cellItems(d) {
      var ic = '', tx = '';
      d.items.forEach(function (it) {
        var tr = S.tracks[it.t];
        if (dailyIds.indexOf(it.id) >= 0) ic += '<span class="lpp-ic">☐' + esc(tr.icon) + '</span>';
        else tx += '<div class="lpp-t">☐ ' + esc(tr.icon) + ' ' + esc(short(it, tr)) + '</div>';
      });
      return (ic ? '<div class="lpp-ics">' + ic + '</div>' : '') + tx;
    }
    if (layout === 'week') {
      for (var w = C.weekStart(a); w <= b; w += 7) {
        var tot = 0; for (var x0 = Math.max(w, a); x0 <= Math.min(w + 6, b); x0++) tot += S.byDn[x0].load;
        h += '<section class="lpp-week"><h2>Week of ' + esc(fd(w, { month: 'long', day: 'numeric', year: 'numeric' })) + ' <small>' + fm(tot) + '</small></h2><table class="lpp-wt"><tbody>';
        for (var x = w; x < w + 7; x++) {
          if (x < a || x > b) continue;
          var d = S.byDn[x];
          h += '<tr><th scope="row">' + esc(fd(x, { weekday: 'short', month: 'short', day: 'numeric' })) + '<small>' + fm(d.load) + (d.off ? ' · ' + esc(d.off) : '') + '</small></th><td>' + d.items.map(function (it) { var tr = S.tracks[it.t]; return '<span class="lpp-w">☐ ' + esc(tr.icon) + ' ' + esc(it.label) + ' <small>' + fm(it.mins) + '</small></span>'; }).join('') + '</td></tr>';
        }
        h += '</tbody></table></section>';
      }
    } else {
      var p = C.ymd(a), y = p.y, m = p.m;
      while (C.dnYMD(y, m, 1) <= b) {
        var first = Math.max(a, C.dnYMD(y, m, 1)), last = Math.min(b, C.dnYMD(y, m, C.monthLen(y, m))), g0 = C.weekStart(first);
        h += '<section class="lpp-page lpp-month"><h2>' + C.MON[m - 1] + ' ' + y + ' <small>' + fm(C.minutesIn(S, first, last)) + ' planned</small></h2>' + legend + '<table class="lpp-cal"><thead><tr>' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (n) { return '<th scope="col">' + n + '</th>'; }).join('') + '</tr></thead><tbody>';
        for (var w2 = g0; w2 <= last; w2 += 7) {
          h += '<tr>';
          for (var x2 = w2; x2 < w2 + 7; x2++) {
            var d2 = S.byDn[x2];
            if (x2 < first || x2 > last || !d2) { h += '<td class="out"></td>'; continue; }
            h += '<td' + (d2.off ? ' class="off"' : '') + '><b class="lpp-n">' + C.ymd(x2).d + '</b>' + (d2.off ? '<i>' + esc(d2.off) + '</i>' : '') + cellItems(d2) + '</td>';
          }
          h += '</tr>';
        }
        h += '</tbody></table></section>';
        m++; if (m > 12) { m = 1; y++; }
      }
    }
    return h;
  }
  function doPrint(a, b, layout) {
    var box = $('#lp-printout'); box.innerHTML = printHTML(a, b, layout);
    D.documentElement.classList.add('lp-printing');
    var done = function () { D.documentElement.classList.remove('lp-printing'); W.removeEventListener('afterprint', done); };
    W.addEventListener('afterprint', done);
    setTimeout(function () { W.print(); setTimeout(done, 500); }, 60);
  }
  W.LPPrint = { html: printHTML, prepare: function (a, b, layout) { $('#lp-printout').innerHTML = printHTML(a == null ? S.from : a, b == null ? S.to : b, layout || 'month'); D.documentElement.classList.add('lp-printing'); } };
  $('#lp-print').addEventListener('click', function () {
    openDlg('Print or save as PDF', periodPick() + '<fieldset><legend>Pages</legend><label class="lp-chk"><input type="radio" name="lay" value="month" checked> A calendar page for each month (a year is about 14 pages)</label><label class="lp-chk"><input type="radio" name="lay" value="week"> A list for each week, with every task’s details</label></fieldset>' +
      '<p class="hs-small">The first page is the summary: hours a week, what you’ll finish, and the year at a glance. To make a PDF, choose “Save as PDF” in the print window.</p><div class="lp-dlgbtns"><button type="submit" class="hs-btn pri">🖨 Print</button></div>', function (fo) {
      fo.onsubmit = function (e) { e.preventDefault(); var r = periodOf(fo), lay = fo.lay.value; closeDlg(); doPrint(r[0], r[1], lay); };
    });
  });

  // calendar (.ics, RFC 5545)
  function icsText(a, b, o) {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Teddy Rook Book//Life Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Life plan'];
    function ie(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
    function d8(dn) { return C.isoOf(dn).replace(/-/g, ''); }
    function tm(dn, min) { var hh = Math.floor(min / 60), mm = min % 60; dn += Math.floor(hh / 24); hh %= 24; return d8(dn) + 'T' + (hh < 10 ? '0' : '') + hh + (mm < 10 ? '0' : '') + mm + '00'; }
    var t0 = (function () { var m = /^(\d\d):(\d\d)$/.exec(o.time || ''); return m ? +m[1] * 60 + +m[2] : 420; })();
    function when(dn, off, mins) { return o.timed ? ['DTSTART:' + tm(dn, t0 + off), 'DTEND:' + tm(dn, t0 + off + Math.max(5, mins))] : ['DTSTART;VALUE=DATE:' + d8(dn), 'DTEND;VALUE=DATE:' + d8(dn + 1)]; }
    function ev(uid, lines, sum, desc) { L.push('BEGIN:VEVENT', 'UID:' + uid + '@teddyrookbook.com', 'DTSTAMP:' + stamp); lines.forEach(function (l) { L.push(l); }); L.push('SUMMARY:' + ie(sum)); if (desc) L.push('DESCRIPTION:' + ie(desc)); if (!o.timed) L.push('TRANSP:TRANSPARENT'); L.push('END:VEVENT'); }
    var abs = function (u) { return !u ? '' : /^https?:/.test(u) ? u : 'https://teddyrookbook.com' + (u.charAt(0) === '/' ? u : '/' + u); };
    if (o.mode === 'daily') {
      for (var x = a; x <= b; x++) {
        var d = S.byDn[x]; if (!d.items.length) continue;
        var tot = 0; d.items.forEach(function (it) { tot += it.mins; });
        ev('lp-day-' + d8(x), when(x, 0, tot), 'Life plan: ' + d.items.length + ' task' + (d.items.length === 1 ? '' : 's') + ', ' + fm(tot), d.items.map(function (it) { return '☐ ' + it.label + ' (' + fm(it.mins) + ')' + (it.url ? ' ' + abs(it.url) : ''); }).join('\n'));
      }
    } else {
      // tasks that simply repeat (no content that changes, a fixed weekly or monthly rule, no end inside the plan
      // other than the period) become one event with an RRULE; days off become EXDATEs
      var rr = {}, rrOff = {}, off = 0;
      if (o.rrule) S.tracks.forEach(function (tr) {
        if (tr.off || PV[tr.id] || tr.kind === 'holiday' || tr.kind === 'cook') return;
        var f = tr.f, rule = null;
        if (f.k === 'daily') rule = 'FREQ=DAILY';
        else if (f.k === 'weekdays') rule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
        else if (f.k === 'days' && f.d && f.d.length) rule = 'FREQ=WEEKLY;BYDAY=' + f.d.slice().sort().map(function (x) { return ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][x]; }).join(',');
        else if (f.k === 'months' && f.on && f.on !== 'flex' && f.months && f.months.length) {
          rule = 'FREQ=MONTHLY;BYMONTH=' + f.months.slice().sort(function (p, q) { return p - q; }).join(',') + (f.on.day != null ? ';BYMONTHDAY=' + f.on.day : ';BYDAY=' + ((f.on.nth || 1) >= 5 ? '-1' : (f.on.nth || 1)) + ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][f.on.dow || 0]);
          if (f.on.day != null && f.on.day > 28) rule = null; // short months move the day: list those one by one
        }
        if (rule) { rr[tr.id] = rule; rrOff[tr.id] = off; off += Math.max(5, +tr.mins || 0); }
      });
      S.tracks.forEach(function (tr) {
        if (!rr[tr.id]) return;
        var L2 = (S.items[tr.id] || []).filter(function (it) { return it.dn >= a && it.dn <= b; }); if (!L2.length) return;
        // the rule's own dates between the first and last occurrence; any it would give that aren't in the plan (days off) are EXDATEs
        var have2 = {}; L2.forEach(function (it) { have2[it.dn] = 1; });
        var ruleDays = C.expand(Object.assign({}, tr, { start: '', end: '' }), L2[0].dn, L2[L2.length - 1].dn, S.from).fixed;
        var ex = ruleDays.filter(function (x) { return !have2[x]; });
        var lines = when(L2[0].dn, rrOff[tr.id], tr.mins).concat(['RRULE:' + rr[tr.id] + ';UNTIL=' + (o.timed ? tm(L2[L2.length - 1].dn, 23 * 60 + 59) : d8(L2[L2.length - 1].dn))]);
        if (ex.length) lines.push(o.timed ? 'EXDATE:' + ex.map(function (x) { return tm(x, t0 + rrOff[tr.id]); }).join(',') : 'EXDATE;VALUE=DATE:' + ex.map(d8).join(','));
        ev('lp-' + tr.id + '-rule-' + d8(L2[0].dn), lines, tr.icon + ' ' + tr.name, C.freqText(tr.f) + ', about ' + fm(tr.mins));
      });
      for (var x2 = a; x2 <= b; x2++) {
        var cur = off;
        S.byDn[x2].items.forEach(function (it) {
          if (rr[it.id]) return;
          var tr = S.tracks[it.t];
          ev('lp-' + it.id + '-' + d8(x2), when(x2, cur, it.mins), tr.icon + ' ' + it.label, (it.sub ? it.sub + '\n' : '') + 'About ' + fm(it.mins) + (it.url ? '\n' + abs(it.url) : ''));
          cur += Math.max(5, it.mins);
        });
      }
    }
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }
  // fold lines at 75 octets (UTF-8), never inside a character
  function fold(line) {
    var out = [], cur = '', n = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], cp = line.codePointAt(i); if (cp > 0xffff) { ch = line.slice(i, i + 2); i++; }
      var bytes = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4, lim = out.length ? 74 : 75;
      if (n + bytes > lim) { out.push(cur); cur = ''; n = 0; }
      cur += ch; n += bytes;
    }
    out.push(cur);
    return out.join('\r\n ');
  }
  W.LPSchedule = function () { return S; }; // for the tests
  W.LPIcs = function (a, b, o) { return icsText(a == null ? S.from : a, b == null ? S.to : b, o || {}); };
  $('#lp-ics').addEventListener('click', function () {
    openDlg('Add to calendar', periodPick() +
      '<fieldset><legend>Events</legend><label class="lp-chk"><input type="radio" name="mode" value="each" checked> One event for each task</label><label class="lp-chk"><input type="radio" name="mode" value="daily"> One event a day, listing that day’s tasks</label>' +
      '<label class="lp-chk"><input type="checkbox" name="rrule" checked> Use repeat rules for tasks that simply repeat (a smaller file)</label></fieldset>' +
      '<fieldset><legend>Time</legend><label class="lp-chk"><input type="radio" name="timed" value="0" checked> All-day events</label><label class="lp-chk"><input type="radio" name="timed" value="1"> At a time of day, one after another, starting at <input type="time" name="time" value="07:00"></label></fieldset>' +
      '<p class="hs-small">This saves an .ics file. Open it, or import it in Apple Calendar, Google Calendar or Outlook. Importing again later adds the plan again, so for a changed plan, remove the old events first (or import into a calendar of its own).</p><div class="lp-dlgbtns"><button type="submit" class="hs-btn pri">📅 Save calendar file</button></div>', function (fo) {
      fo.onsubmit = function (e) {
        e.preventDefault(); var r = periodOf(fo);
        download('life-plan-' + C.isoOf(r[0]) + '.ics', 'text/calendar', icsText(r[0], r[1], { mode: fo.mode.value, rrule: fo.rrule.checked, timed: fo.timed.value === '1', time: fo.time.value }));
        closeDlg(); msg('Calendar file saved.');
      };
    });
  });
  $('#lp-save').addEventListener('click', function () { download('life-plan.json', 'application/json', JSON.stringify({ site: 'teddyrookbook.com', kind: 'trb-lifeplan', v: 1, plan: st }, null, 1)); msg('Plan file saved. Use “Open plan file” to load it on any device.'); });
  $('#lp-open').addEventListener('change', function () {
    var file = this.files[0]; if (!file) return; var r = new FileReader();
    r.onload = function () { try { var j = JSON.parse(r.result), p = j && j.kind === 'trb-lifeplan' ? j.plan : null; if (!valid(p)) throw 0; st = fix(p); save(); all(); msg('Plan loaded.'); } catch (e) { msg('That file isn’t a plan from this page.'); } };
    r.readAsText(file); this.value = '';
  });
  $('#lp-reset').addEventListener('click', function () { if (W.confirm('Start over with the starter plan? Your tracks and ticks on this page are cleared (Bible and ladder progress stay).')) { fresh(); save(); view.cur = TODAY; all(); } });

  // ---------- draw everything ----------
  function all() {
    ensure(function () {
      autoStarts(); compute();
      renderPeriod(); renderStats(); renderView(); renderTracks(); renderBudget();
    });
  }
  // for the resolution builder (lp-res.js)
  W.LPApp = {
    CFG: CFG, DATA: DATA, P: P, TODAY: TODAY, COLORS: COLORS,
    get: function () { return st; }, set: function (s) { st = fix(s); save(); view.cur = Math.max(TODAY, C.dnOf(st.plan.from)); all(); },
    valid: valid, mk: function (o) { return mk(o); }, fromLib: function (c, k, x) { return fromLib(c, k, x); }, nid: function () { return nid(); },
    ensureFor: function (s, cb) { var keep = st; st = s; var miss = needs().filter(function (k) { return !have(k); }); st = keep; if (!miss.length) cb(); else Promise.all(miss.map(fetchData)).then(cb); },
    preview: function (s) { return computeFor(s); },
    failed: function (k) { return !!FAILED[k]; },
    load: function (keys, cb) { var miss = keys.filter(function (k) { return !have(k); }); if (!miss.length) cb(); else Promise.all(miss.map(fetchData)).then(cb); },
    // print or export a state that isn't saved (or the saved one): swap it in, build the output, swap back
    withState: function (s, fn) { var o = [st, S, PV, RANGE]; st = s; compute(); try { return fn(S); } finally { st = o[0]; S = o[1]; PV = o[2]; RANGE = o[3]; } },
    printHTML: function (a, b, lay) { return printHTML(a, b, lay); }, doPrint: function (a, b, lay) { doPrint(a, b, lay); },
    icsText: function (a, b, o) { return icsText(a, b, o); }, download: download, msg: msg, fm: fm, hrs: hrs, esc: esc, fd: fd, planRange: planRange, addMonths: addMonths,
    sumHTML: function (a, b, pr) { return sumHTML(a, b, pr); }, summary: function (a, b) { return T.summary(S, S.tracks, DATA, P, a, b); }, refresh: function () { all(); }
  };
  W.addEventListener('storage', function (e) { if ([KEY, HS, ML, MEALS, BY].indexOf(e.key) >= 0) { if (e.key === KEY) { var s = load(KEY); if (valid(s)) st = fix(s); } all(); } });
  if (!valid(load(KEY))) save();
  all();
})(window, document);
