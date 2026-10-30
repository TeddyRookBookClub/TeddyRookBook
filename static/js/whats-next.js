/* "What's next" card: up to four next steps for the learner using this browser, built only from this browser's saves.
   Sources: the lesson planner's digest (trb-planner-days, today's lessons for the child linked to this learner, or the
   only child of a plan when no learners are set up), the ladders (trb-math-v1: Continue, and topics due for review),
   the Harvard Classics (trb-hc-v1: the next reading), phonics practice (trb-phonics-v1: the next step).
   Stays hidden when there is nothing to show. Course and step names come from #trb-wn-data (layouts/_partials/whats-next.html). */
(function (W, D) {
  'use strict';
  var box = D.getElementById('trb-wn'); if (!box) return;
  var M = {}; try { M = JSON.parse(D.getElementById('trb-wn-data').textContent) || {}; } catch (e) { }
  var L = M.L || {}, C = M.C || {}, PH = M.ph || [];
  function get(k) { try { return JSON.parse(W.localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var PF = W.TRBProfiles && W.TRBProfiles.on() ? W.TRBProfiles : null, act = PF ? PF.active() : null;
  var now = new Date(), items = [];
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  // 1. the planner: today's lessons for this learner's child, not yet ticked
  var dg = get('trb-planner-days');
  if (dg && Array.isArray(dg.kids)) {
    var kid = null;
    dg.kids.forEach(function (k) { if (!kid && act && k.pid === act.id) kid = k; });
    if (!kid && !act && dg.kids.length === 1) kid = dg.kids[0];
    if (kid && Array.isArray(kid.days)) {
      var hs = (get('trb-homeschool-v1') || {}).done || {}, ml = (get('trb-math-v1') || {}).t || {}, mu = (get('trb-music-read-v1') || {}).done || {};
      var day = kid.days.filter(function (d) { return dg.mode === 'date' ? d.d === iso(now) : d.dow === now.getDay(); })[0];
      if (day) {
        var left = (day.items || []).filter(function (it) {
          var p = it[4] || '';
          if (p.charAt(0) === 'm' && ml[p.slice(2)] && ml[p.slice(2)].s === 2) return false;
          if (p.charAt(0) === 'u' && mu[p.slice(2)]) return false;
          return !(it[2] && hs[it[2]] && hs[it[2]][it[3]]);
        });
        left.slice(0, 2).forEach(function (it, i) { items.push({ k: 'plan', t: it[0], u: it[1], more: i === 1 && left.length > 2 ? left.length - 2 : 0 }); });
      }
    }
  }

  // 2. the ladders: Continue, and reviews due
  var S = get('trb-math-v1');
  if (S && S.t && typeof S.t === 'object') {
    var EPOCH = Date.UTC(2020, 0, 1), today = Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - EPOCH) / 864e5);
    var best = null, bestLast = -1, due = {}, rp = Array.isArray(S.rp) ? S.rp : [];
    Object.keys(S.t).forEach(function (id) {
      var r = S.t[id], ck = id.split('.')[0], c = C[ck]; if (!r || !c) return;
      var last = (+r.last || 0) + (rp.indexOf(id) >= 0 ? 0.5 : 0);
      if (r.s >= 1 && last > bestLast) { bestLast = last; best = id; }
      if (r.s === 2 && +r.due <= today) due[c[1]] = (due[c[1]] || 0) + 1;
    });
    if (best) {
      var lk = C[best.split('.')[0]][1], cur = lk === 'math' ? S.cur : (S.cl || {})[lk], cc = C[cur] || C[best.split('.')[0]], lad = L[lk];
      if (lad) items.push({ k: 'lad', t: 'Continue ' + cc[0] + ' · ' + lad[1], u: '/' + lad[0] + '/practice/' });
    }
    var dk = Object.keys(due).sort(function (a, b) { return due[b] - due[a]; })[0];
    if (dk && L[dk]) items.push({ k: 'rev', t: due[dk] + ' topic' + (due[dk] === 1 ? '' : 's') + ' due for review · ' + L[dk][1], u: '/' + L[dk][0] + '/practice/' });
  }

  // 3. Harvard Classics: the reading after the last one finished (none when today's is done)
  var hc = get('trb-hc-v1');
  if (hc && /^\d\d-\d\d$/.test(hc.last || '')) {
    var MN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    var tid = ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    if (hc.last !== tid) {
      var nd = new Date(2024, +hc.last.slice(0, 2) - 1, +hc.last.slice(3) + 1); // a leap year, so February 29 has its reading
      var nid = ('0' + (nd.getMonth() + 1)).slice(-2) + '-' + ('0' + nd.getDate()).slice(-2);
      var nm = MN[nd.getMonth()];
      items.push({ k: 'hc', t: (nid === tid ? 'Today’s' : 'Next') + ' Harvard Classics reading · ' + nm.charAt(0).toUpperCase() + nm.slice(1) + ' ' + nd.getDate(), u: '/harvard-classics/' + nm + '-' + nd.getDate() + '/' });
    }
  }

  // 4. phonics: the first step not finished, once a child has started
  var ph = get('trb-phonics-v1');
  if (ph && ph.p && Array.isArray(ph.kids)) {
    var kc = ph.cur || (ph.kids[0] || {}).id, pp = ph.p[kc] || {};
    if (Object.keys(pp).length) {
      var nx = PH.filter(function (s) { var q = pp[s.k] || {}; return !(s.a || []).every(function (a) { return q[a] > 0; }); })[0];
      if (nx) items.push({ k: 'ph', t: 'Phonics: ' + nx.t, u: '/homeschool/actual-reading/phonics-practice/' + nx.k + '/' });
    }
  }

  if (!items.length) return;
  // at most four: planner lessons first, then one of each of the others
  var out = items.filter(function (x) { return x.k === 'plan'; }).slice(0, 2);
  items.forEach(function (x) { if (x.k !== 'plan' && out.length < 4) out.push(x); });
  var ICON = { plan: '📅', lad: '🪜', rev: '🔁', hc: '📚', ph: '🔤' };
  var css = D.createElement('style');
  css.textContent = '.trb-wn{margin:0 0 1.2rem;border:1.5px solid #9dbba9;border-left:5px solid #00562f;border-radius:12px;background:var(--entry);padding:.65rem .9rem .7rem;font-size:.95rem}' +
    '.trb-wn[hidden]{display:none}.trb-wn h2{margin:0 0 .35rem!important;font:700 1.05rem/1.3 Georgia,serif!important;color:#004225}' +
    '.trb-wn ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.3rem .9rem}' +
    '.trb-wn li{margin:0;line-height:1.35}.trb-wn a{display:flex;gap:.45rem;align-items:baseline;color:var(--primary);text-decoration:none;box-shadow:none;padding:.2rem 0}' +
    '.trb-wn a:hover span:last-child{text-decoration:underline}.trb-wn small{color:var(--secondary)}' +
    '[data-theme=dark] .trb-wn{border-color:#2a4636;border-left-color:#6cc79a}[data-theme=dark] .trb-wn h2{color:#6cc79a}@media print{.trb-wn{display:none}}';
  D.head.appendChild(css);
  box.innerHTML = '<h2>What’s next' + (act ? ' for ' + esc(act.name) : '') + '</h2><ul>' + out.map(function (x) {
    return '<li><a href="' + esc(x.u) + '"' + (/^https?:/.test(x.u) ? ' target="_blank" rel="noopener"' : '') + '><span aria-hidden="true">' + ICON[x.k] + '</span><span>' + esc(x.t) + (x.more ? ' <small>and ' + x.more + ' more today</small>' : '') + '</span></a></li>';
  }).join('') + '</ul>';
  box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'What’s next');
  box.hidden = false;
})(window, document);
