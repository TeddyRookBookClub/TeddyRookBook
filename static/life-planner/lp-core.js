/* Life Planner core (/life-planner/): dates, how often a track happens, and the scheduler. Pure logic, no DOM, no storage.
   Loads in the browser (window.LPCore) and in Node (module.exports) for the tests (scripts/lifeplan/test-core.js).

   DATES   A day is a whole number: days since 1970-01-01 (a "dn"). dow(dn): 0 = Sunday … 6 = Saturday. Weeks start on Monday.

   FREQUENCIES  (track.f)
     {k:'daily'}                         every day                                    fixed
     {k:'weekdays'}                      Monday to Friday                             fixed
     {k:'days', d:[0..6]}                weekly on those days                          fixed
     {k:'times', n:N, d?:[0..6]}         N times a week, on the days with the most room (only days in d, if given)   flexible
     {k:'weeks', n:N, dow?:D}            every N weeks: on weekday D, or on the day with the most room that week   flexible unless dow
     {k:'months', months:[1..12], on:'flex'|{day:D}|{nth:1-5, dow:D}}
                                         in those months: on day D (the last day if the month is shorter), on the nth weekday
                                         (5 = the last one), or 'flex' (the day with the most room that month)
     {k:'months', every:N, on:…}         every N months from the plan's first month (turned into a months list)
     {k:'dates', dates:['YYYY-MM-DD',…]} on those dates                                fixed
   A track may also have start and end dates ('YYYY-MM-DD') and keepOff (stay on days off; fixed tracks only).

   PARTIAL WEEKS AND MONTHS  At the edges of a plan (or a track's start and end) a week or month may be cut short. A
   flexible job in a cut window gets round(n × days / full length) times, so a 5-a-week walk in a 3-day first week happens
   twice. The schedule is always worked out for the whole plan, and every view (Today, Week, Month…) shows a slice of it,
   so the same task never moves when you switch views.

   THE SCHEDULER  schedule(plan, tracks, providers)
     1. Every day of the plan gets a budget: plan.budget[dow] minutes, or 0 on a day off (plan.off: [{from, to, label}]).
     2. Fixed occurrences go on their days (skipped on a day off unless the track keeps them). A provider (a content track
        like Bible in a Year) may name each one and change its minutes, or end the track (null).
     3. Flexible jobs (a window of days and how many times) are placed one at a time: windows that end first go first,
        then shorter windows, then longer tasks, then the order of the tracks. For each time, the scheduler picks among
        the window's days (not days off, not a day that already has that track) by, in order:
          a. the task fits in the day's minutes that are left;
          b. the track's preferred days (track.pref);
          c. distance from the same track's other days, up to 7 ÷ times (so 2 strength days don't land back to back);
          d. the most minutes left; e. the earliest day.
        If no day has room, the task still goes on the day with the most room, and that day shows as overloaded.
        A window with no usable day (all days off) is counted as missed.
     4. A day is overloaded when its tasks add up to more than its minutes; a week, when its days add up to more than its
        minutes. Nothing random: the same plan always gives the same schedule.
   Result: { from, to, days: [{ dn, cap, load, off, items: [it] }], items: { trackId: [it] (in date order) }, missed: { trackId: n },
             weeks: [{ from, to, cap, load, over }] }
   it = { t: track index, id: track id, dn, mins, k: the occurrence number (0, 1, …), label, url, ref, flex }

   PROVIDERS  providers[track.id] = { item(k, dn) → null | { label?, mins?, url?, ref? } }   (optional; see lp-tracks.js) */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.LPCore = api;
})(this, function () {
  'use strict';
  var DAY = 864e5;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dnOf(iso) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? Math.round(Date.UTC(+m[1], m[2] - 1, +m[3]) / DAY) : null; }
  function isoOf(dn) { var d = new Date(dn * DAY); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function ymd(dn) { var d = new Date(dn * DAY); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; }
  function dnYMD(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / DAY); }
  function dow(dn) { return ((dn + 4) % 7 + 7) % 7; }
  function weekStart(dn) { return dn - (dow(dn) + 6) % 7; }
  function monthLen(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function todayDn(now) { var d = now || new Date(); return dnYMD(d.getFullYear(), d.getMonth() + 1, d.getDate()); }
  // nth weekday of a month (nth 5 = the last)
  function nthDow(y, m, nth, wd) {
    if (nth >= 5) { var last = dnYMD(y, m, monthLen(y, m)); return last - ((dow(last) - wd + 7) % 7); }
    var first = dnYMD(y, m, 1); return first + ((wd - dow(first) + 7) % 7) + (nth - 1) * 7;
  }
  // Western Easter (the Gregorian computus, "Anonymous Gregorian algorithm")
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31),
      da = ((h + l - 7 * m + 114) % 31) + 1;
    return dnYMD(y, mo, da);
  }

  function isFixed(f) {
    if (!f) return true;
    if (f.k === 'times') return false;
    if (f.k === 'weeks') return f.dow == null;
    if (f.k === 'months') return f.on && f.on !== 'flex';
    return true;
  }
  // months list for {every:N}: counted from the plan's first month
  function monthsList(f, planFrom) {
    if (Array.isArray(f.months) && f.months.length) return f.months.filter(function (m) { return m >= 1 && m <= 12; });
    var n = Math.max(1, Math.min(12, +f.every || 1)), m0 = ymd(planFrom).m, out = [];
    for (var i = 0; i < 12; i += n) out.push((m0 - 1 + i) % 12 + 1);
    return out.sort(function (a, b) { return a - b; });
  }

  /* expand(track, a, b, planFrom) → { fixed: [dn], jobs: [{ from, to, n }] } for the days a..b (the track's active days) */
  function expand(tr, a, b, planFrom) {
    var f = tr.f || { k: 'daily' }, fixed = [], jobs = [], dn, i;
    if (a > b) return { fixed: fixed, jobs: jobs };
    switch (f.k) {
      case 'daily': for (dn = a; dn <= b; dn++) fixed.push(dn); break;
      case 'weekdays': for (dn = a; dn <= b; dn++) if (dow(dn) >= 1 && dow(dn) <= 5) fixed.push(dn); break;
      case 'days': var ds = f.d || []; for (dn = a; dn <= b; dn++) if (ds.indexOf(dow(dn)) >= 0) fixed.push(dn); break;
      case 'times':
        for (var w = weekStart(a); w <= b; w += 7) {
          var lo = Math.max(a, w), hi = Math.min(b, w + 6), len = hi - lo + 1, n = Math.max(0, Math.min(7, +f.n || 1));
          var c = len === 7 ? n : Math.round(n * len / 7);
          if (c > 0) jobs.push({ from: lo, to: hi, n: c, d: f.d && f.d.length ? f.d : null });
        }
        break;
      case 'weeks':
        var every = Math.max(1, +f.n || 1), anchor = weekStart(a);
        for (var w2 = anchor; w2 <= b; w2 += 7 * every) {
          var lo2 = Math.max(a, w2), hi2 = Math.min(b, w2 + 6);
          if (f.dow != null) { var day = w2 + (f.dow + 6) % 7; if (day >= a && day <= b) fixed.push(day); }
          else if (Math.round((hi2 - lo2 + 1) / 7) >= 1) jobs.push({ from: lo2, to: hi2, n: 1 });
        }
        break;
      case 'months':
        var ms = monthsList(f, planFrom), s = ymd(a), y = s.y, m = s.m;
        while (dnYMD(y, m, 1) <= b) {
          if (ms.indexOf(m) >= 0) {
            var first = dnYMD(y, m, 1), last = dnYMD(y, m, monthLen(y, m)), on = f.on || 'flex';
            if (on === 'flex') {
              var lo3 = Math.max(a, first), hi3 = Math.min(b, last);
              if (hi3 >= lo3 && (hi3 - lo3 + 1) * 2 >= last - first + 1) jobs.push({ from: lo3, to: hi3, n: 1 });
            } else {
              var dd = on.day != null ? dnYMD(y, m, Math.min(on.day, monthLen(y, m))) : nthDow(y, m, on.nth || 1, on.dow || 0);
              if (dd >= a && dd <= b) fixed.push(dd);
            }
          }
          m++; if (m > 12) { m = 1; y++; }
        }
        break;
      case 'dates':
        (f.dates || []).forEach(function (s2) { var d2 = dnOf(s2); if (d2 != null && d2 >= a && d2 <= b) fixed.push(d2); });
        fixed.sort(function (p, q) { return p - q; });
        for (i = fixed.length - 1; i > 0; i--) if (fixed[i] === fixed[i - 1]) fixed.splice(i, 1);
        break;
    }
    return { fixed: fixed, jobs: jobs };
  }

  // days off: [{from, to}] → set of dn
  function offSet(off) {
    var set = {};
    (off || []).forEach(function (o) { var a = dnOf(o.from), b = dnOf(o.to || o.from); if (a == null) return; if (b == null || b < a) b = a; for (var d = a; d <= b && d - a < 400; d++) set[d] = o.label || 'Day off'; });
    return set;
  }

  function schedule(plan, tracks, providers) {
    providers = providers || {};
    var A = dnOf(plan.from), B = dnOf(plan.to), budget = plan.budget || [60, 45, 45, 45, 45, 45, 120];
    if (A == null || B == null || B < A) return null;
    if (B - A > 400) B = A + 400;
    var off = offSet(plan.off), days = [], byDn = {};
    for (var dn = A; dn <= B; dn++) { var o = { dn: dn, cap: off[dn] ? 0 : Math.max(0, +budget[dow(dn)] || 0), load: 0, off: off[dn] || '', items: [] }; days.push(o); byDn[dn] = o; }
    var items = {}, missed = {}, jobs = [];
    function active(tr) {
      var a = A, b = B, s = dnOf(tr.start), e = dnOf(tr.end);
      if (s != null && s > a) a = s; if (e != null && e < b) b = e; return [a, b];
    }
    function put(it) { var d = byDn[it.dn]; d.items.push(it); if (!it.free) d.load += it.mins; (items[it.id] = items[it.id] || []).push(it); }
    // 2. fixed occurrences, named by their provider in date order
    tracks.forEach(function (tr, t) {
      if (tr.off) return;
      var r = active(tr), ex = expand(tr, r[0], r[1], A), pv = providers[tr.id], k = 0;
      items[tr.id] = items[tr.id] || []; missed[tr.id] = 0;
      ex.fixed.forEach(function (d) {
        if (off[d] && !tr.keepOff) return;
        var it = { t: t, id: tr.id, dn: d, mins: +tr.mins || 0, k: k, label: tr.name, flex: false, free: !!tr.free };
        if (pv && pv.item) { var x = pv.item(k, d); if (x === null) return; if (x) apply(it, x); }
        k++; put(it);
      });
      ex.jobs.forEach(function (j) { jobs.push({ t: t, tr: tr, from: j.from, to: j.to, n: j.n, d: j.d }); });
    });
    function apply(it, x) { for (var q in x) if (Object.prototype.hasOwnProperty.call(x, q) && x[q] != null && q !== 't' && q !== 'id' && q !== 'dn' && q !== 'k') it[q] = x[q]; }
    // 3. flexible jobs
    jobs.sort(function (p, q) { return p.to - q.to || (p.to - p.from) - (q.to - q.from) || (+q.tr.mins || 0) - (+p.tr.mins || 0) || p.t - q.t; });
    function has(d, id) { var L = byDn[d].items; for (var i = 0; i < L.length; i++) if (L[i].id === id) return true; return false; }
    function gap(d, id) { var g = 7; for (var x = 1; x < 7; x++) { if ((byDn[d - x] && has(d - x, id)) || (byDn[d + x] && has(d + x, id))) { g = x; break; } } return g; }
    jobs.forEach(function (j) {
      var tr = j.tr, mins = +tr.mins || 0, want = Math.max(1, Math.floor(7 / Math.max(1, j.n))), pref = tr.pref || [];
      for (var c = 0; c < j.n; c++) {
        var best = null, bs = null;
        for (var d = j.from; d <= j.to; d++) {
          if (off[d] || has(d, tr.id) || (j.d && j.d.indexOf(dow(d)) < 0)) continue;
          var day = byDn[d], room = day.cap - day.load;
          var s = [tr.free || room >= mins ? 1 : 0, pref.indexOf(dow(d)) >= 0 ? 1 : 0, Math.min(gap(d, tr.id), want), room, -d];
          if (!bs || cmp(s, bs) > 0) { bs = s; best = d; }
        }
        if (best == null) { missed[tr.id] = (missed[tr.id] || 0) + 1; continue; }
        put({ t: j.t, id: tr.id, dn: best, mins: mins, k: 0, label: tr.name, flex: true, free: !!tr.free });
      }
    });
    function cmp(p, q) { for (var i = 0; i < p.length; i++) { if (p[i] !== q[i]) return p[i] > q[i] ? 1 : -1; } return 0; }
    // name the flexible occurrences in date order (fixed ones are already named); then sort every list and day
    tracks.forEach(function (tr) {
      var L = items[tr.id]; if (!L) return;
      L.sort(function (p, q) { return p.dn - q.dn; });
      var pv = providers[tr.id], drop = [];
      if (!isFixed(tr.f)) {
        L.forEach(function (it, k) {
          it.k = k;
          if (pv && pv.item) {
            var before = it.mins, x = pv.item(k, it.dn);
            if (x === null) { drop.push(it); return; }
            if (x) { apply(it, x); if (!it.free) byDn[it.dn].load += it.mins - before; }
          }
        });
        drop.forEach(function (it) { var day = byDn[it.dn]; day.items.splice(day.items.indexOf(it), 1); if (!it.free) day.load -= it.mins; L.splice(L.indexOf(it), 1); });
      }
    });
    days.forEach(function (d) { d.items.sort(function (p, q) { return p.t - q.t; }); d.over = d.load > d.cap; });
    // 4. weeks
    var weeks = [];
    for (var w = weekStart(A); w <= B; w += 7) {
      var wk = { from: Math.max(A, w), to: Math.min(B, w + 6), cap: 0, load: 0 };
      for (var x = wk.from; x <= wk.to; x++) { wk.cap += byDn[x].cap; wk.load += byDn[x].load; }
      wk.over = wk.load > wk.cap; weeks.push(wk);
    }
    return { from: A, to: B, days: days, byDn: byDn, items: items, missed: missed, weeks: weeks };
  }

  // minutes of one track (or all) in a slice of the schedule
  function minutesIn(S, a, b, id) {
    var m = 0; for (var d = Math.max(a, S.from); d <= Math.min(b, S.to); d++) S.byDn[d].items.forEach(function (it) { if (!id || it.id === id) m += it.mins; });
    return m;
  }
  // a short "how often" text for a frequency
  var DOWN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var NTH = ['', 'first', 'second', 'third', 'fourth', 'last'];
  function freqText(f) {
    f = f || { k: 'daily' };
    switch (f.k) {
      case 'daily': return 'Every day';
      case 'weekdays': return 'Weekdays';
      case 'days': var d = (f.d || []).slice().sort(); return d.length === 7 ? 'Every day' : d.length === 1 ? 'Every ' + DOWN[d[0]] : d.map(function (x) { return DOWS[x]; }).join(', ');
      case 'times': return (+f.n === 1 ? 'Once' : +f.n === 2 ? 'Twice' : f.n + ' times') + ' a week';
      case 'weeks': return (+f.n === 1 ? 'Weekly' : 'Every ' + f.n + ' weeks') + (f.dow != null ? ' on ' + DOWN[f.dow] + 's' : '');
      case 'months':
        var on = f.on && f.on !== 'flex' ? (f.on.day != null ? ' on day ' + f.on.day : ' on the ' + NTH[f.on.nth || 1] + ' ' + DOWN[f.on.dow || 0]) : '';
        if (f.every && !(f.months && f.months.length)) return (+f.every === 1 ? 'Monthly' : +f.every === 12 ? 'Once a year' : 'Every ' + f.every + ' months') + on;
        var ms = f.months || [];
        return (ms.length === 12 ? 'Monthly' : ms.length === 1 ? 'Every ' + MON[ms[0] - 1] : 'In ' + ms.map(function (m) { return MON[m - 1].slice(0, 3); }).join(', ')) + on;
      case 'dates': return 'On ' + (f.dates || []).length + ' set day' + ((f.dates || []).length === 1 ? '' : 's');
    }
    return '';
  }
  // times per year a frequency gives, roughly (for the library list)
  function perYear(f) {
    switch ((f || {}).k) {
      case 'daily': return 365; case 'weekdays': return 261; case 'days': return 52 * (f.d || []).length;
      case 'times': return 52 * (+f.n || 1); case 'weeks': return Math.round(52 / (+f.n || 1));
      case 'months': return f.months && f.months.length ? f.months.length : Math.floor(12 / (+f.every || 1));
      case 'dates': return (f.dates || []).length;
    }
    return 0;
  }

  return {
    DAY: DAY, dnOf: dnOf, isoOf: isoOf, ymd: ymd, dnYMD: dnYMD, dow: dow, weekStart: weekStart, monthLen: monthLen, todayDn: todayDn,
    nthDow: nthDow, easter: easter, isFixed: isFixed, monthsList: monthsList, expand: expand, offSet: offSet, schedule: schedule,
    minutesIn: minutesIn, freqText: freqText, perYear: perYear, DOWN: DOWN, DOWS: DOWS, MON: MON
  };
});
