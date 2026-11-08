/* Life Planner content tracks: what each occurrence of a reading, learning or meals track is, and what a period adds up to.
   Pure logic with the data passed in; loads in the browser (window.LPTracks) and in Node for the tests.

   provider(track, D, P) → { item(k, dn), done(it) }   (lp-core.js calls item for occurrence k on day dn)
     D = the data loaded for the page (each part fetched only when a track needs it; built by layouts/life-planner/list.html):
       D.bible  { '73': [[label, minutes], …365], '66': […] }      (data/bibleyear.json; minutes ≈ verses ÷ 6)
       D.gb     { days: [[kind, title, url, minutes, [rung ids]], …365] }   (data/greatbooks/year.yaml)
       D.hc     { 'MM-DD': [label, minutes, url] }                 (data/harvard/days: the Reading Guide's minutes)
       D.lad[L] { order: [course keys], c: { key: { t, u, ts: [[id, title, slug], …] } } }   one file per ladder
       D.trades { key: { t, u, ls: [[title, url, minutes], …] } }
       D.meals  { r: { id: [name, minutes, url] } }                (Meal Prep recipes: prep + cook minutes)
     P = progress read from this browser (per learner):
       P.bible(ver) → { day: 1 }   ticks from /bible-in-a-year/ (trb-homeschool-v1)
       P.passed(id) → true when a ladder topic or Great Books rung is passed (trb-math-v1)
       P.meals → the Meal Prep planner's saved state (trb-meals-v1) or null
   Track kinds and their options (track.opt):
     bible   { ver: '73'|'66', mode: 'dates' (day N on bstart + N − 1, the Bible in a Year page's start) | 'seq' (from day `from`, one a time) }
     gb      { from: plan day (0-based), stop } each time covers track.mins minutes of the Great Books in a Year plan; when the
             plan is done the track goes on with reading time in the works themselves (or ends, with stop: true)
     hc      the Harvard Classics reading for that calendar date
     ladder  { l: ladder key, c: course key, from: topic number in the course (0-based) }  then the ladder's next courses
     trade   { tr: trade key, from: lesson (0-based) }
     cook    { slot: 'dinner' }  the recipes planned in Meal Prep for that day and meal, with their minutes
     holiday { h: key }  dates from holidayDates(): plan the menu two weeks ahead, shop two days ahead, cook on the day */
(function (root, factory) {
  var api = factory(root.LPCore || (typeof require === 'function' ? require('./lp-core.js') : null));
  if (typeof module === 'object' && module.exports) module.exports = api; else root.LPTracks = api;
})(this, function (C) {
  'use strict';
  function maxR(L) { var m = -1; L.forEach(function (it) { if (it.r1 != null && it.r1 > m) m = it.r1; }); return m; }
  function fmtAmt(x) { return x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10); }
  function hrs(m) { var h = m / 60; return h >= 10 ? Math.round(h) + ' hours' : (Math.round(h * 10) / 10) + (h === 1 ? ' hour' : ' hours'); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  // ---- holidays: the Meal Prep collections and their dates ----
  var HOL = {
    thanksgiving: { t: 'Thanksgiving', icon: '🦃', date: function (y) { return C.nthDow(y, 11, 4, 4); } },
    christmas: { t: 'Christmas', icon: '🎄', date: function (y) { return C.dnYMD(y, 12, 25); } },
    easter: { t: 'Easter', icon: '🐣', date: function (y) { return C.easter(y); } },
    cookout: { t: 'Fourth of July', icon: '🎆', date: function (y) { return C.dnYMD(y, 7, 4); } },
    hanukkah: { t: 'Hanukkah', icon: '🕎', table: true },
    'lunar-new-year': { t: 'Lunar New Year', icon: '🧧', table: true }
  };
  var PARTS = [{ off: -14, t: 'plan the menu', mins: 30 }, { off: -2, t: 'shop', mins: 60 }, { off: 0, t: 'cook', mins: 0 }];
  // tables: { hanukkah: ['YYYY-MM-DD' first evening…], 'lunar-new-year': [...] } from the collections' data
  function holidayDates(h, a, b, tables) {
    var H = HOL[h], out = []; if (!H) return out;
    var y0 = C.ymd(a).y, y1 = C.ymd(b + 14).y, list = [];
    if (H.table) ((tables || {})[h] || []).forEach(function (s) { var d = C.dnOf(s); if (d != null) list.push(d); });
    else for (var y = y0; y <= y1; y++) list.push(H.date(y));
    list.forEach(function (d) { PARTS.forEach(function (p, i) { var x = d + p.off; if (x >= a && x <= b) out.push({ dn: x, part: i, day: d }); }); });
    return out.sort(function (p, q) { return p.dn - q.dn; });
  }

  // ---- Great Books: cumulative minutes from a plan day ----
  function gbCum(D, from) {
    var days = (D.gb && D.gb.days) || [], cum = [0];
    for (var i = from; i < days.length; i++) cum.push(cum[cum.length - 1] + (+days[i][3] || 10));
    return cum;
  }
  // the plan days [i..j] overlapping minutes [m0, m1)
  function gbSpan(cum, from, m0, m1) {
    var i = 0; while (i < cum.length - 1 && cum[i + 1] <= m0) i++;
    var j = i; while (j < cum.length - 2 && cum[j + 1] < m1) j++;
    return [from + i, from + j];
  }
  function gbTitle(day) { return day[0] === 'review' ? 'Review' : day[0] === 'catch' ? 'Catch-up day' : day[0] === 'end' ? 'Year’s end' : day[1]; }

  // the chain of ladder topics from a course on: that course, then the ladder's later courses
  function chain(D, o) {
    var L = D.lad && D.lad[o.l]; if (!L) return [];
    var out = [], i0 = L.order.indexOf(o.c); if (i0 < 0) return out;
    for (var i = i0; i < L.order.length; i++) { var c = L.c[L.order[i]]; (c.ts || []).forEach(function (t) { out.push({ id: t[0], t: t[1], u: c.u + t[2] + '/', c: L.order[i], ct: c.t }); }); }
    return out;
  }

  /* PACED TRACKS (the resolution builder): opt.per = items per session (a fraction is fine). Session k covers the items
     between k × per and (k + 1) × per, so the last of N sessions ends exactly at the last item. pace(k, per, total) →
     { i0, i1 (items touched, 0-based), fin: [items finished in this session], part: share of the session's items } */
  function pace(k, per, total) {
    var a = k * per, b = Math.min(total, (k + 1) * per); if (a >= total - 1e-9) return null;
    var i0 = Math.floor(a + 1e-9), i1 = Math.max(i0, Math.ceil(b - 1e-9) - 1), fin = [], ov = [];
    for (var i = i0; i <= i1; i++) { ov.push(Math.min(b, i + 1) - Math.max(a, i)); if (i + 1 <= b + 1e-9) fin.push(i); }
    return { i0: i0, i1: i1, fin: fin, ov: ov };
  }
  /* TRANSLATE IN A YEAR (D.tr, /languages/translate/plan.json): each work is a list of chunks [first ref, weight] (a chunk is
     the smallest piece a day may end on: verse ends at a sentence end, prose is one sentence; weight = lines or words).
     trSplit(w, a, b, N) shares chunks a..b−1 out over M = min(N, b − a) sessions by weight and returns each session's end
     (exclusive): session k covers chunks [k ? e[k−1] : a, e[k]). Every chunk is in exactly one session, none is empty, and
     the last ends at b. The same function makes the reader's day plans (static/languages/translate/tr.js), so a 365-day
     track lines up with the reader's days. */
  function trSplit(w, a, b, N) {
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
  // the last ref of chunk j of a work (verse: the line before the next chunk, or the book's last line; prose: the chunk itself)
  function trEnd(Wk, j) {
    if (Wk.x && Wk.x[j]) return Wk.x[j];
    if (Wk.unit !== 'line') return Wk.c[j][0];
    var nx = Wk.c[j + 1], cur = Wk.c[j][0].split('.');
    if (nx) { var p = nx[0].split('.'); if (p[0] === cur[0] && /^\d+$/.test(p[1])) return p[0] + '.' + (+p[1] - 1); }
    return Wk.last[cur[0]] || Wk.c[j][0];
  }
  function trRef(r) { return String(r).replace(/[a-z]$/, ''); }
  // a range for people: 1.1–33 in one book (verse), else 1.1–2.5 (prose sentence letters dropped)
  function trRange(r0, r1) { var a = trRef(r0), b = trRef(r1); if (a === b) return a; var p = a.split('.'), q = b.split('.'); return p.length === 2 && q.length === 2 && p[0] === q[0] ? a + '–' + q[1] : a + '–' + b; }
  // the resolution's lists (D.extra: { latin, asl, memory: [[title, url, minutes]] }; recipes from Meal Prep)
  function list(D, key) {
    if (key === 'recipes') {
      if (!D.meals) return null;
      if (!D._recipes) D._recipes = Object.keys(D.meals.r).map(function (id) { var r = D.meals.r[id]; return [r[0], r[2], r[1], r[3] || '']; })
        .filter(function (r) { return (r[3] === 'dinner' || r[3] === 'lunch') && r[2] >= 20 && r[2] <= 120; })
        .sort(function (p, q) { return p[2] - q[2] || (p[0] < q[0] ? -1 : 1); });
      return D._recipes;
    }
    if (/^trade:/.test(key)) { var tr = D.trades && D.trades[key.slice(6)]; return tr ? tr.ls : null; }
    return D.extra && D.extra[key];
  }
  function provider(tr, D, P, ctx) {
    var o = tr.opt || {}; ctx = ctx || {};
    switch (tr.kind) {
      case 'bible':
        var B = D.bible && D.bible[o.ver === '66' ? '66' : '73'], ver = o.ver === '66' ? '66' : '73', b0 = C.dnOf(o.bstart);
        if (!B) return null;
        if (o.per) {
          var f0 = Math.max(1, +o.from || 1), tot = B.length - f0 + 1;
          return {
            item: function (k) {
              var x = pace(k, +o.per, tot); if (!x) return null;
              var m = 0, names = [];
              for (var i = x.i0; i <= x.i1; i++) { m += x.ov[i - x.i0] * B[f0 + i - 1][1]; if (x.fin.indexOf(i) >= 0) names.push('Day ' + (f0 + i)); }
              var d1 = f0 + x.i0, d2 = f0 + x.i1;
              return { label: (d1 === d2 ? 'Day ' + d1 : 'Days ' + d1 + '–' + d2) + ': ' + B[d1 - 1][0].split(' · ')[0] + (d2 > d1 ? ' … ' + B[d2 - 1][0].split(' · ')[0] : ''),
                mins: Math.max(5, Math.round(m)), url: ctx.base + 'bible-in-a-year/#day-' + d1 + '-' + ver, ref: x.fin.map(function (i) { return f0 + i; }), r0: d1, r1: x.fin.length ? f0 + x.fin[x.fin.length - 1] : d1 - 1,
                sub: x.fin.length ? '' : 'part of a day' };
            },
            done: function (it) { var t = P.bible ? P.bible(ver) : {}; return !!(it.ref && it.ref.length && it.ref.every(function (n) { return t[n]; })); }
          };
        }
        return {
          item: function (k, dn) {
            var n = o.mode === 'dates' && b0 != null ? dn - b0 + 1 : (+o.from || 1) + k;
            if (n < 1 || n > B.length) return null;
            return { label: 'Day ' + n + ': ' + B[n - 1][0], mins: B[n - 1][1], url: ctx.base + 'bible-in-a-year/#day-' + n + '-' + ver, ref: n, r0: n, r1: n };
          },
          done: function (it) { return !!(P.bible && P.bible(ver)[it.ref]); }
        };
      case 'gb':
        if (!D.gb) return null;
        var from = Math.max(0, +o.from || 0), cum = gbCum(D, from), per = Math.max(5, +tr.mins || 15), total = cum[cum.length - 1];
        return {
          item: function (k) {
            var m0 = k * per;
            if (m0 >= total) return o.stop ? null : { label: 'Read on in a great book you met on the ladder', mins: per, url: ctx.base + 'great-books/', sub: 'The Great Books in a Year plan is finished', ref: [] };
            var sp = gbSpan(cum, from, m0, m0 + per), names = [], ids = [];
            for (var i = sp[0]; i <= sp[1]; i++) { var t = gbTitle(D.gb.days[i]); if (names.indexOf(t) < 0) names.push(t); (D.gb.days[i][4] || []).forEach(function (x) { if (ids.indexOf(x) < 0) ids.push(x); }); }
            return { label: names.join(' · '), mins: Math.min(per, total - m0), url: ctx.base.replace(/\/$/, '') + D.gb.days[sp[0]][2], ref: ids, sub: 'Plan day ' + (sp[0] + 1) + (sp[1] > sp[0] ? '–' + (sp[1] + 1) : '') };
          }
        };
      case 'hc':
        if (!D.hc) return null;
        return {
          item: function (k, dn) { var x = C.isoOf(dn).slice(5), h = D.hc[x]; if (!h) return null; return { label: h[0], mins: h[1], url: ctx.base.replace(/\/$/, '') + h[2] }; }
        };
      case 'ladder':
        var ch = chain(D, o), st = Math.max(0, +o.from || 0);
        if (!ch.length) return null;
        if (o.per) {
          var lim = Math.min(ch.length - st, +o.n || ch.length);
          return {
            item: function (k) {
              var x = pace(k, +o.per, lim); if (!x) return null;
              var a = ch[st + x.i0], fins = x.fin.map(function (i) { return ch[st + i].id; }), m = 0; x.ov.forEach(function (v) { m += v * (+tr.unit || 30); });
              return { label: a.ct + ': ' + a.t + (x.i1 > x.i0 ? ' + ' + (x.i1 - x.i0) + ' more' : ''), url: ctx.base.replace(/\/$/, '') + a.u, ref: fins.length ? fins : null, mins: Math.max(5, Math.round(m)), r1: x.fin.length ? x.fin[x.fin.length - 1] : -1, sub: x.fin.length ? '' : 'part of a lesson' };
            },
            done: function (it) { return !!(it.ref && P.passed && it.ref.every(P.passed)); }
          };
        }
        return {
          item: function (k) { var x = ch[st + k]; if (!x) return null; return { label: x.ct + ': ' + x.t, url: ctx.base.replace(/\/$/, '') + x.u, ref: x.id }; },
          done: function (it) { return !!(P.passed && P.passed(it.ref)); }
        };
      case 'trade':
        var T = D.trades && D.trades[o.tr], s2 = Math.max(0, +o.from || 0);
        if (!T) return null;
        return { item: function (k) { var x = T.ls[s2 + k]; if (!x) return null; return { label: 'Lesson ' + (s2 + k + 1) + ': ' + x[0], url: ctx.base.replace(/\/$/, '') + x[1], mins: +x[2] || tr.mins }; } };
      case 'lessons':
        var Ls = list(D, o.list), lim2 = Ls ? Math.min(Ls.length, +o.n || Ls.length) : 0;
        if (!Ls || !lim2) return null;
        return {
          item: function (k) {
            var x = pace(k, +o.per || 1, lim2); if (!x) return null;
            var a = Ls[x.i0], m = 0; x.ov.forEach(function (v, j) { m += v * (+tr.unit || +Ls[x.i0 + j][2] || 30); });
            var cont = x.fin.indexOf(x.i0) < 0 || (k > 0 && pace(k - 1, +o.per || 1, lim2).i1 === x.i0);
            return { label: (o.word ? o.word + ' ' + (x.i0 + 1) + ': ' : '') + a[0] + (x.i1 > x.i0 ? ' + ' + (x.i1 - x.i0) + ' more' : ''), url: /^https?:/.test(a[1]) ? a[1] : ctx.base.replace(/\/$/, '') + a[1], mins: Math.max(5, Math.round(m)), r1: x.fin.length ? x.fin[x.fin.length - 1] : -1, sub: cont ? 'continued' : '' };
          }
        };
      case 'translate':
        // opt { w: work key, a, b: chunk range, n: sessions }  (lp-resolve.js and the library set these from plan.json)
        var Wk = D.tr && D.tr.works && D.tr.works[o.w]; if (!Wk) return null;
        var ta = Math.max(0, +o.a || 0), tb = Math.min(Wk.c.length, o.b == null ? Wk.c.length : +o.b), wts = Wk.c.map(function (c) { return c[1]; });
        if (tb <= ta) return null;
        var ends = trSplit(wts, ta, tb, Math.max(1, +o.n || 365)), un = Wk.unit === 'line' ? ['line', 'lines'] : ['word', 'words'];
        return {
          item: function (k) {
            if (k >= ends.length) return null;
            var c0 = k ? ends[k - 1] : ta, c1 = ends[k] - 1, amt = 0; for (var i = c0; i <= c1; i++) amt += wts[i];
            var r0 = Wk.c[c0][0], r1 = trEnd(Wk, c1);
            return { label: Wk.s + ' ' + trRange(r0, r1) + ' (' + (Wk.unit === 'line' ? '' : 'about ') + amt + ' ' + (amt === 1 ? un[0] : un[1]) + ')',
              mins: Math.max(5, Math.round(amt * (+Wk.mpu || 1))), url: ctx.base.replace(/\/$/, '') + Wk.u + '#r=' + r0 + '-' + r1, r0: c0, r1: c1, sub: 'Day ' + (k + 1) + ' of ' + ends.length };
          }
        };
      case 'amount':
        var tot2 = +o.amount || 0; if (!tot2) return null;
        return {
          item: function (k) {
            var x = pace(k, +o.per, tot2); if (!x) return null;
            var amt = Math.min(tot2, (k + 1) * o.per) - k * o.per, m = amt * (+o.mpu || 60);
            return { label: tr.name + ': ' + fmtAmt(amt) + ' ' + (o.unit || ''), mins: Math.max(5, Math.round(m)), r1: Math.min(tot2, (k + 1) * o.per) };
          }
        };
      case 'cook':
        var meals = mealDays(P.meals, o.slot || 'dinner', D.meals);
        return {
          item: function (k, dn) {
            var m = meals[dn]; if (!m) return {};
            return { label: 'Cook: ' + m.names.join(', '), mins: m.mins || tr.mins, url: m.url ? ctx.base.replace(/\/$/, '') + m.url : '' };
          }
        };
      case 'holiday':
        var H = HOL[o.h], parts = {};
        (ctx.hol || []).forEach(function (x) { parts[x.dn] = x; });
        return {
          item: function (k, dn) {
            var x = parts[dn]; if (!x || !H) return null; var p = PARTS[x.part];
            return { label: H.t + ': ' + p.t, mins: p.mins || +tr.mins || 180, url: ctx.base + 'meal-prep/' + o.h + '/', sub: x.part < 2 ? C.MON[C.ymd(x.day).m - 1] + ' ' + C.ymd(x.day).d : '' };
          }
        };
    }
    return null;
  }
  // { dn: { names, mins, url } } from the Meal Prep planner's saved plans (every plan; its start + day number)
  function mealDays(st, slot, M) {
    var out = {}; if (!st || !Array.isArray(st.plans)) return out;
    var R = (M && M.r) || {}, mine = st.mine || {};
    st.plans.forEach(function (p) {
      var s = C.dnOf(p.start); if (s == null || !p.cells) return;
      Object.keys(p.cells).forEach(function (key) {
        var bits = key.split('|'), d = +bits[0]; if (bits[1] !== slot || !(d >= 0 && d < (+p.days || 31))) return;
        (p.cells[key] || []).forEach(function (e) {
          if (!e || !e.r || e.left) return;
          var r = R[e.r], my = mine[e.r], name = r ? r[0] : my && my.name, mins = r ? r[1] : my && my.times ? (+my.times.prep || 0) + (+my.times.cook || 0) : 0;
          if (!name) return;
          var o = out[s + d] || (out[s + d] = { names: [], mins: 0, url: '' });
          if (o.names.indexOf(name) < 0) { o.names.push(name); o.mins += mins || 0; if (!o.url && r) o.url = r[2]; }
        });
      });
    });
    return out;
  }

  /* summary(S, tracks, D, P, a, b) → { mins (tracks marked free, "already part of my day", left out), days, weeks (days ÷ 7),
   per: [{ track, n, mins, text: [lines] }], activity } */
  function summary(S, tracks, D, P, a, b) {
    a = Math.max(a, S.from); b = Math.min(b, S.to);
    var nd = b - a + 1, out = { mins: 0, days: nd, weeks: nd / 7, per: [], activity: null }, ex = [];
    tracks.forEach(function (tr) {
      if (tr.off) return;
      var L = (S.items[tr.id] || []).filter(function (it) { return it.dn >= a && it.dn <= b; });
      var m = 0; L.forEach(function (it) { m += it.mins; }); if (!tr.free) out.mins += m;
      var r = { track: tr, n: L.length, mins: m, text: [] }, last = L[L.length - 1], first = L[0], o = tr.opt || {};
      switch (tr.kind) {
        case 'bible':
          if (!L.length) break;
          var n0 = first.r0, n1 = last.r1, B = D.bible[o.ver === '66' ? '66' : '73'];
          var read = P.bible ? Object.keys(P.bible(o.ver === '66' ? '66' : '73')).length : 0;
          if (!(n1 >= 1)) { r.text.push('Started on day ' + n0); break; }
          r.text.push(n0 === 1 && n1 === B.length ? 'The whole Bible: all ' + B.length + ' days' : 'Days ' + n0 + '–' + n1 + ' of ' + B.length + (n1 === B.length ? ', to the end of the Bible' : ', through ' + B[n1 - 1][0].split(' · ')[0].split(';')[0]));
          if (read) r.text.push(plural(read, 'day') + ' already ticked on Bible in a Year');
          break;
        case 'gb':
          if (!L.length) break;
          var from = Math.max(0, +o.from || 0), cum = gbCum(D, from), used = 0, days = D.gb.days, done = [], lastT = '';
          L.forEach(function (it) { used += it.mins; });
          var before = 0; (S.items[tr.id] || []).forEach(function (it) { if (it.dn < a) before += it.mins; });
          for (var i = from; i < days.length; i++) {
            var end = cum[i - from + 1];
            if (end > before + used) break;
            if (end <= before) continue;
            var dk = days[i][0], nxt = days[i + 1];
            if ((dk === 'b' || dk === 'one') || (dk === 'a' && !(nxt && nxt[0] === 'b'))) { done.push(days[i][4][0]); lastT = days[i][1]; }
          }
          r.text.push('About ' + hrs(m) + ' of Great Books');
          if (done.length) r.text.push('≈ ' + plural(done.length, 'rung') + ' of the Great Books Ladder, through ' + lastT);
          if (cum[cum.length - 1] <= before + used + 0.5) {
            r.text.push(before < cum[cum.length - 1] ? 'The whole Great Books in a Year plan' + (from ? ' (from plan day ' + (from + 1) + ')' : '') : 'The Great Books in a Year plan was already finished');
            var extra = Math.max(0, before + used - Math.max(before, cum[cum.length - 1])); if (extra >= 60) r.text.push('Then about ' + hrs(extra) + ' reading the great books themselves');
          }
          break;
        case 'hc': r.text.push(plural(L.length, 'reading') + ' from the Five Foot Shelf, about ' + hrs(m)); break;
        case 'lessons':
          if (!L.length) break;
          var LL = list(D, o.list) || [], lim3 = Math.min(LL.length, +o.n || LL.length), r1 = maxR(L);
          r.text.push(r1 + 1 >= lim3 ? 'All ' + lim3 + ' ' + (o.many || 'lessons') : (r1 + 1) + ' of ' + lim3 + ' ' + (o.many || 'lessons') + (r1 >= 0 ? ', through ' + LL[r1][0] : ''));
          break;
        case 'translate':
          var Wt = D.tr && D.tr.works && D.tr.works[o.w]; if (!L.length || !Wt) break;
          var t0 = Math.max(0, +o.a || 0), t1 = Math.min(Wt.c.length, o.b == null ? Wt.c.length : +o.b), all = 0, upto = 0, rr = maxR(L);
          for (var q = t0; q < t1; q++) { all += Wt.c[q][1]; if (q <= rr) upto += Wt.c[q][1]; }
          var unl = Wt.unit === 'line' ? ' lines' : ' words', fmtn = function (x) { return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
          r.text.push(rr >= t1 - 1 ? Wt.s + ': all ' + fmtn(all) + unl + ' translated' : Wt.s + ': ' + fmtn(upto) + ' of ' + fmtn(all) + unl + ', through ' + trRef(trEnd(Wt, rr)));
          break;
        case 'amount':
          if (L.length) r.text.push(fmtAmt(last.r1) + ' of ' + fmtAmt(+o.amount) + ' ' + (o.unit || '') + (last.r1 >= +o.amount - 1e-6 ? ': the whole goal' : ''));
          break;
        case 'ladder':
          if (!L.length) break;
          if (o.per) {
            var chp = chain(D, o), stp = Math.max(0, +o.from || 0), limp = Math.min(chp.length - stp, +o.n || chp.length), rr = maxR(L);
            r.text.push(rr + 1 >= limp ? 'All ' + limp + ' lessons' + (o.n ? '' : ' of ' + chp[stp].ct) : (rr + 1) + ' of ' + limp + ' lessons' + (rr >= 0 ? ', through ' + chp[stp + rr].t : ''));
            break;
          }
          var ch = chain(D, o), st = Math.max(0, +o.from || 0), idx = st + last.k, fin = [];
          for (var j = st + first.k; j <= idx; j++) { if (ch[j] && (!ch[j + 1] || ch[j + 1].c !== ch[j].c)) fin.push(ch[j].ct); }
          r.text.push(plural(L.length, 'lesson') + ', through ' + last.label);
          if (fin.length) r.text.push('Finishes ' + fin.join(', '));
          break;
        case 'trade': if (L.length) r.text.push(plural(L.length, 'lesson') + ', through ' + last.label); break;
        case 'exercise': r.text.push(plural(L.length, 'session') + ' = ' + hrs(m) + ' of activity'); if (o.miles) r.text.push('≈ ' + Math.round(m / (+o.mpm || 20)) + ' miles at about ' + Math.round(60 / (+o.mpm || 20) * 10) / 10 + ' miles an hour'); ex.push(tr); break;
        case 'holiday': var cooks = L.filter(function (it) { return /: cook$/.test(it.label); }).length; r.text.push(cooks ? plural(cooks, 'holiday meal') + ', planned and shopped for ahead' : plural(L.length, 'step') + ' to get ready'); break;
        default: r.text.push(L.length + ' × ' + tr.name + (m ? ' (' + hrs(m) + ')' : ''));
      }
      if (S.missed[tr.id]) r.text.push(plural(S.missed[tr.id], 'time') + ' left out: no usable day (days off)');
      out.per.push(r);
    });
    // the activity guideline, week by week (full weeks only): 150 minutes of moderate activity (vigorous counts double) and
    // muscle-strengthening on 2 or more days
    if (ex.some(function (t) { return t.type !== 'stretch'; })) {
      var weeks = 0, met = 0, aer = 0, str = 0;
      for (var w = C.weekStart(a); w + 6 <= b; w += 7) {
        if (w < a) continue;
        weeks++; var mod = 0, sd = {};
        for (var d = w; d <= w + 6; d++) S.byDn[d].items.forEach(function (it) {
          var t = tracks[it.t]; if (!t || t.kind !== 'exercise') return;
          if (t.type === 'moderate') mod += it.mins; else if (t.type === 'vigorous') mod += 2 * it.mins; else if (t.type === 'strength') sd[d] = 1;
        });
        var s = Object.keys(sd).length; if (mod >= 150) aer++; if (s >= 2) str++; if (mod >= 150 && s >= 2) met++;
      }
      out.activity = { weeks: weeks, met: met, aer: aer, str: str };
    }
    return out;
  }

  return { trSplit: trSplit, trEnd: trEnd, trRange: trRange, pace: pace, list: list, provider: provider, summary: summary, holidayDates: holidayDates, HOL: HOL, PARTS: PARTS, mealDays: mealDays, chain: chain, gbCum: gbCum, hrs: hrs, plural: plural };
});
