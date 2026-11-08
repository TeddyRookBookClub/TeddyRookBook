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

  function provider(tr, D, P, ctx) {
    var o = tr.opt || {}; ctx = ctx || {};
    switch (tr.kind) {
      case 'bible':
        var B = D.bible && D.bible[o.ver === '66' ? '66' : '73'], ver = o.ver === '66' ? '66' : '73', b0 = C.dnOf(o.bstart);
        if (!B) return null;
        return {
          item: function (k, dn) {
            var n = o.mode === 'dates' && b0 != null ? dn - b0 + 1 : (+o.from || 1) + k;
            if (n < 1 || n > B.length) return null;
            return { label: 'Day ' + n + ': ' + B[n - 1][0], mins: B[n - 1][1], url: ctx.base + 'bible-in-a-year/#day-' + n + '-' + ver, ref: n };
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
        return {
          item: function (k) { var x = ch[st + k]; if (!x) return null; return { label: x.ct + ': ' + x.t, url: ctx.base.replace(/\/$/, '') + x.u, ref: x.id }; },
          done: function (it) { return !!(P.passed && P.passed(it.ref)); }
        };
      case 'trade':
        var T = D.trades && D.trades[o.tr], s2 = Math.max(0, +o.from || 0);
        if (!T) return null;
        return { item: function (k) { var x = T.ls[s2 + k]; if (!x) return null; return { label: 'Lesson ' + (s2 + k + 1) + ': ' + x[0], url: ctx.base.replace(/\/$/, '') + x[1], mins: +x[2] || tr.mins }; } };
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
          var n0 = first.ref, n1 = last.ref, B = D.bible[o.ver === '66' ? '66' : '73'];
          var read = P.bible ? Object.keys(P.bible(o.ver === '66' ? '66' : '73')).length : 0;
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
        case 'ladder':
          if (!L.length) break;
          var ch = chain(D, o), st = Math.max(0, +o.from || 0), idx = st + last.k, fin = [];
          for (var j = st + first.k; j <= idx; j++) { if (ch[j] && (!ch[j + 1] || ch[j + 1].c !== ch[j].c)) fin.push(ch[j].ct); }
          r.text.push(plural(L.length, 'lesson') + ', through ' + last.label);
          if (fin.length) r.text.push('Finishes ' + fin.join(', '));
          break;
        case 'trade': if (L.length) r.text.push(plural(L.length, 'lesson') + ', through ' + last.label); break;
        case 'exercise': r.text.push(plural(L.length, 'session') + ' = ' + hrs(m) + ' of activity'); ex.push(tr); break;
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

  return { provider: provider, summary: summary, holidayDates: holidayDates, HOL: HOL, PARTS: PARTS, mealDays: mealDays, chain: chain, gbCum: gbCum, hrs: hrs, plural: plural };
});
