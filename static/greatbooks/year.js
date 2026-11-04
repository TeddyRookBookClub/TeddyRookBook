/* Great Books in a Year (/great-books/year/, layouts/math/gbyear.html): the Today card, the tracks, done marks, the week
   grid's selection and keyboard moves, the month lists and the optional pace line.
   Data: <script id="gby-data"> (from data/greatbooks/year.yaml, made by scripts/greatbooks/year-plan.py, and the Harvard
   Classics guide). Saved in localStorage 'trb-gbyear-v1' (per learner: static/js/profiles.js swaps every trb- key, and
   family backups include it):
     { v: 1, cur: the learner's day (0 = not started), done: [day numbers], track: 'young' | 'full' | 'family',
       pace: true when the pace line is on, start: 'YYYY-MM-DD' (only with pace) }
   The days don't follow the calendar: marking the current day done moves on to the next day not yet done.
   The XP-today line reads the ladder engine's own save ('trb-math-v1', read only). */
(function (W, D) {
  'use strict';
  var KEY = 'trb-gbyear-v1', TRACKS = ['young', 'full', 'family'];
  var root = D.getElementById('gby'), dataEl = D.getElementById('gby-data');
  if (!root || !dataEl) return;
  var Y; try { Y = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var N = Y.days || Y.plan.length, P = {}, i;
  for (i = 0; i < Y.plan.length; i++) P[Y.plan[i].d] = Y.plan[i];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sget(k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { W.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function sdel(k) { try { W.localStorage.removeItem(k); } catch (e) { } }

  /* ---------- state ---------- */
  function blank() { return { v: 1, cur: 0, done: [], track: 'full', pace: false }; }
  function load() {
    var s = blank(), o = null;
    try { o = JSON.parse(sget(KEY) || 'null'); } catch (e) { o = null; }
    if (!o || typeof o !== 'object') return s;
    var c = parseInt(o.cur, 10); if (c >= 0 && c <= N) s.cur = c;
    if (Array.isArray(o.done)) {
      var seen = {};
      o.done.forEach(function (d) { d = parseInt(d, 10); if (d >= 1 && d <= N && !seen[d]) { seen[d] = 1; s.done.push(d); } });
      s.done.sort(function (a, b) { return a - b; });
    }
    if (TRACKS.indexOf(o.track) >= 0) s.track = o.track;
    if (o.pace === true) s.pace = true;
    if (typeof o.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.start)) s.start = o.start;
    return s;
  }
  var S = load(), sel = S.cur || 1;
  function save() { sset(KEY, JSON.stringify(S)); }
  function isDone(d) { return S.done.indexOf(d) >= 0; }
  function setDone(d, on) {
    var k = S.done.indexOf(d);
    if (on && k < 0) { S.done.push(d); S.done.sort(function (a, b) { return a - b; }); }
    if (!on && k >= 0) S.done.splice(k, 1);
  }
  function nextOpen(from) { // the first day not done after `from`, wrapping around; 0 when every day is done
    for (var j = 1; j <= N; j++) { var d = ((from - 1 + j) % N) + 1; if (!isDone(d)) return d; }
    return 0;
  }

  /* ---------- dates ---------- */
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dayNum(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5) : null; }
  function todayNum() { var d = new Date(); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function xpToday() { // the ladder engine's XP for today, and its daily goal (read only)
    try {
      var o = JSON.parse(sget('trb-math-v1') || 'null'); if (!o) return null;
      var d = new Date(), day = Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2020, 0, 1)) / 864e5);
      return { xp: (o.xp && +o.xp[String(day)]) || 0, goal: +o.goal || 40 };
    } catch (e) { return null; }
  }

  /* ---------- the Today card ---------- */
  var card = D.getElementById('gby-card');
  var status = D.createElement('p'); status.className = 'mlp-sr'; status.setAttribute('aria-live', 'polite'); root.appendChild(status);
  card.removeAttribute('aria-live');
  function say(t) { status.textContent = ''; setTimeout(function () { status.textContent = t; }, 30); }
  function T() { return TRACKS.indexOf(S.track); }
  function R(id) { return Y.rungs[id] || { t: id, u: '#', a: '' }; }
  function rlink(r, hash, text) { return '<a href="' + esc(r.u + (hash || '')) + '">' + (text || esc(r.t)) + '</a>'; }
  function pathLink(r) {
    if (S.track === 'young') return 'Read ' + rlink(r, '#path-young', 'the young readers’ path') + ' and try its activity, if it has one.';
    if (S.track === 'family') return 'Read ' + rlink(r, '#path-young', 'the young readers’ path') + ' aloud together. Older readers can add ' + rlink(r, '#path-full', 'the full lesson') + '.';
    return 'Read ' + rlink(r, '#path-full', 'the full lesson') + ' (For teens and adults).';
  }
  function qs(n, r) { return 'Answer <b>' + n + '</b> practice questions in ' + rlink(r, '#practice', 'the practice at the bottom of the rung’s page') + (S.track === 'family' ? ', taking turns' : '') + '.'; }
  function todo(e) {
    var t = T(), q = e.q[t], r = e.id ? R(e.id) : null, out = [];
    if (e.k === 'a') {
      out.push(pathLink(r));
      out.push(qs(q, r) + ' After you pass the rung, press <b>Keep practicing</b> to go on.');
    } else if (e.k === 'b') {
      out.push('Answer <b>' + q + '</b> more questions in ' + rlink(r, '#practice', 'the rung’s practice') + (S.track === 'family' ? ', taking turns' : '') + '.');
      out.push('Do a review round of <b>' + e.r[t] + '</b> on the <a href="' + esc(Y.practice) + '">Practice page</a>. If nothing is due there, answer ' + e.r[t] + ' more on this rung.');
      if (S.track === 'full') out.push('Read ' + rlink(r, '#path-deep', 'Going deeper') + ' if you like, and think over the family questions at the end of the lesson.');
      else if (S.track === 'young') out.push('Finish the activity if you haven’t, and talk over one of the family questions at the end of the lesson with a grown-up.');
      else out.push('Talk it over together: the family questions are at the end of the lesson.');
    } else if (e.k === 'one') {
      out.push(pathLink(r));
      out.push(qs(q, r));
      out.push(S.track === 'full' ? 'Think over one or two of the family questions at the end of the lesson.' : 'Talk over one or two of the family questions at the end of the lesson.');
    } else if (e.k === 'review') {
      var ids = e.ids || [], each = ids.length ? Math.ceil(q / ids.length) : q;
      out.push('If the <a href="' + esc(Y.practice) + '">Practice page</a> has reviews due, do those first. They count.');
      if (ids.length) out.push('Then answer about <b>' + each + '</b> questions on each of this week’s rungs: ' + ids.map(function (id) { return rlink(R(id), '#practice'); }).join(', ') + '.');
      else out.push('Then answer <b>' + q + '</b> questions on any rungs you have done.');
    } else if (e.k === 'catch') {
      out.push('Finish anything left from earlier days.');
      out.push('Caught up? Answer <b>' + q + '</b> questions on any rung you have done, or do the reviews on the <a href="' + esc(Y.practice) + '">Practice page</a>, or read on in a book you liked.');
    } else {
      out.push('The last day. Pick three rungs you liked best and answer about <b>' + Math.ceil(q / 3) + '</b> questions on each.');
      out.push('Talk it over: which book would you like to read in full next?');
    }
    return out;
  }
  function hcBox(e) {
    var d = new Date(), id = ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2), h = Y.hc[id];
    if (!h) return '';
    var ids = e.id ? [e.id] : (e.ids || []), same = null, also = [];
    ids.forEach(function (x) { var r = R(x); if (r.hc && r.hc.indexOf(id) >= 0 && !same) same = r; });
    var html = '<div class="gby-hc"><p><b>Fifteen minutes more (optional):</b> the Harvard Classics reading for ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', <a href="' + esc(Y.hcbase + h[0] + '/') + '">' + esc(h[1]) + '</a>' + (h[2] || h[3] ? ' (' + esc([h[2], h[3]].filter(Boolean).join(', ')) + ')' : '') + '.</p>';
    if (same) html += '<p class="gby-same">Today’s reading is by ' + esc(same.a) + ', the author of ' + esc(same.t.replace(/^[^:]+:\s*/, '')) + '.</p>';
    else if (e.id && R(e.id).hc) {
      also = R(e.id).hc.slice(0, 4).map(function (x) {
        var hh = Y.hc[x]; if (!hh) return '';
        var m = +x.slice(0, 2), dd = +x.slice(3);
        return '<a href="' + esc(Y.hcbase + hh[0] + '/') + '">' + MONTHS[m - 1] + ' ' + dd + '</a>';
      }).filter(Boolean);
      if (also.length) html += '<p>' + esc(R(e.id).a) + ' is also in the Harvard Classics on ' + also.join(', ') + '.</p>';
    }
    return html + '</div>';
  }
  function paceLine() {
    if (!S.pace || !S.start || !S.cur) return '';
    var s0 = dayNum(S.start); if (s0 == null) return '';
    var exp = todayNum() - s0 + 1;
    if (exp < 1) return '<p class="gby-pace">Your start date hasn’t come yet. Enjoy the head start.</p>';
    exp = Math.min(N, exp);
    var diff = S.done.length - exp, n = Math.abs(diff);
    if (!diff) return '<p class="gby-pace">Right on pace: one day of the plan for each day since you started.</p>';
    if (diff > 0) return '<p class="gby-pace">You’re ' + n + ' day' + (n > 1 ? 's' : '') + ' ahead of one a day.</p>';
    return '<p class="gby-pace">You’re ' + n + ' day' + (n > 1 ? 's' : '') + ' behind one a day. That’s fine: catch-up days are there for this, and the plan waits for you.</p>';
  }
  function render(focusSel) {
    var e = P[sel], t = T(), r = e.id ? R(e.id) : null, h = '';
    var tag = isDone(sel) ? '<span class="gby-tag done">Done</span>' : (S.cur && sel === S.cur ? '<span class="gby-tag">Your day</span>' : '');
    h += '<p class="gby-dayline"><b>Day ' + sel + '</b> <span>of ' + N + ' · week ' + e.w + ' · ' + esc(Y.kl[e.k]) + '</span> ' + tag + '</p>';
    if (r) h += '<p class="gby-rung">' + rlink(r) + '</p><p class="gby-by">' + esc(r.a) + (r.v ? ' · volume ' + esc([].concat(r.v).join('–')) : '') + '</p>';
    else h += '<p class="gby-rung">' + esc(Y.kl[e.k]) + '</p>';
    if (!S.cur) h += '<div class="gby-start-box"><p>Choose who is reading above, then start. Your place is saved in this browser for this learner, and the plan waits for you: mark a day done when you finish it.</p><p><button type="button" class="mlp-btn pri big" data-act="start">Start the year</button></p><p class="gby-by">Here is what day ' + sel + ' looks like:</p></div>';
    h += '<ol class="gby-todo">' + todo(e).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
    var x = xpToday();
    h += '<p class="gby-xp">About <b>' + e.x[t] + ' XP</b> for this day' + (x ? ' · XP today so far: <b>' + x.xp + '</b> of ' + x.goal : '') + '</p>';
    h += hcBox(e);
    if (S.cur) {
      h += '<div class="gby-acts">';
      if (!isDone(sel)) h += '<button type="button" class="mlp-btn pri" data-act="done">Mark day ' + sel + ' done</button>';
      else h += '<button type="button" class="mlp-btn ghost" data-act="undo">Mark day ' + sel + ' not done</button>';
      if (sel !== S.cur && S.cur) h += '<button type="button" class="mlp-btn" data-act="mine">Back to my day (day ' + S.cur + ')</button>';
      h += '</div>';
      h += paceLine();
      if (S.done.length >= N) h += '<p class="gby-pace">Every day is done. You have climbed the whole ladder in your own time. Well read!</p>';
    }
    h += '<div class="gby-nav"><button type="button" class="mlp-btn small ghost" data-act="prev"' + (sel <= 1 ? ' disabled' : '') + '>← Day ' + Math.max(1, sel - 1) + '</button><button type="button" class="mlp-btn small ghost" data-act="next"' + (sel >= N ? ' disabled' : '') + '>Day ' + Math.min(N, sel + 1) + ' →</button></div>';
    card.innerHTML = h;
    paintGrid(focusSel);
    paintMonths();
    D.getElementById('gby-reset').hidden = !S.cur;
  }
  card.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act'), msg = '';
    if (a === 'start') { S.cur = 1; sel = 1; save(); msg = 'Started. Day 1.'; }
    else if (a === 'done') {
      setDone(sel, true);
      if (sel === S.cur) { var nx = nextOpen(S.cur); if (nx) S.cur = nx; sel = S.cur; msg = 'Day marked done. Now on day ' + S.cur + '.'; }
      else msg = 'Day ' + sel + ' marked done.';
      save();
    } else if (a === 'undo') { setDone(sel, false); save(); msg = 'Day ' + sel + ' marked not done.'; }
    else if (a === 'mine') { sel = S.cur; msg = 'Day ' + sel + '.'; }
    else if (a === 'prev') { sel = Math.max(1, sel - 1); msg = 'Day ' + sel + '.'; }
    else if (a === 'next') { sel = Math.min(N, sel + 1); msg = 'Day ' + sel + '.'; }
    render();
    var f = card.querySelector('[data-act="' + (a === 'prev' || a === 'next' ? a : 'done') + '"]:not([disabled])') || card.querySelector('.gby-acts .mlp-btn, [data-act="next"]:not([disabled]), [data-act="prev"]:not([disabled])');
    if (f) f.focus();
    if (msg) say(msg);
  });

  /* ---------- week grid ---------- */
  var grid = D.getElementById('gby-grid'), cells = {};
  Array.prototype.forEach.call(grid.querySelectorAll('.gby-c'), function (b) { cells[+b.getAttribute('data-d')] = b; });
  function paintGrid(focusSel) {
    for (var d in cells) {
      var b = cells[d], n = +d;
      b.classList.toggle('is-done', isDone(n));
      b.classList.toggle('is-cur', !!S.cur && n === S.cur);
      b.classList.toggle('is-sel', n === sel);
      b.tabIndex = n === sel ? 0 : -1;
      if (n === sel) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      var lab = b.getAttribute('data-l') || b.getAttribute('aria-label'); b.setAttribute('data-l', lab);
      b.setAttribute('aria-label', lab + (isDone(n) ? ', done' : '') + (S.cur && n === S.cur ? ', your day' : ''));
    }
    if (focusSel && cells[sel]) cells[sel].focus();
  }
  function cardVisible() { var r = card.getBoundingClientRect(); return r.bottom > 0 && r.top < (W.innerHeight || 800); }
  grid.addEventListener('click', function (ev) {
    var b = ev.target.closest('.gby-c'); if (!b) return;
    sel = +b.getAttribute('data-d'); render(true);
    var e = P[sel]; say('Showing day ' + sel + (e.id ? ': ' + R(e.id).t : ': ' + Y.kl[e.k]) + ', in the Today card above.');
    if (!cardVisible()) { try { D.getElementById('gby-today').scrollIntoView({ block: 'start', behavior: W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } catch (e2) { } }
  });
  grid.addEventListener('keydown', function (ev) {
    var b = ev.target.closest('.gby-c'); if (!b) return;
    var d = +b.getAttribute('data-d'), to = null;
    if (ev.key === 'ArrowRight') to = d + 1; else if (ev.key === 'ArrowLeft') to = d - 1;
    else if (ev.key === 'ArrowDown') to = d + 7; else if (ev.key === 'ArrowUp') to = d - 7;
    else if (ev.key === 'Home') to = 1; else if (ev.key === 'End') to = N;
    if (to === null) return;
    ev.preventDefault();
    to = Math.max(1, Math.min(N, to));
    cells[d].tabIndex = -1; cells[to].tabIndex = 0; cells[to].focus();
  });

  /* ---------- month lists ---------- */
  var msel = D.getElementById('gby-msel'), months = root.querySelectorAll('.gby-month'), rows = {};
  Array.prototype.forEach.call(root.querySelectorAll('.gby-mt tr[data-d]'), function (tr) { rows[+tr.getAttribute('data-d')] = tr; });
  function monthOf(d) { for (var m = 1; m <= 12; m++) if (d <= Math.floor(m * N / 12)) return m; return 12; }
  function showMonth(v) { Array.prototype.forEach.call(months, function (s) { s.hidden = v !== 'all' && s.getAttribute('data-m') !== String(v); }); }
  function paintMonths() {
    for (var d in rows) {
      var tr = rows[d], n = +d, done = isDone(n);
      tr.classList.toggle('is-done', done); tr.classList.toggle('is-cur', !!S.cur && n === S.cur);
      var box = tr.lastElementChild; box.innerHTML = done ? '<span aria-hidden="true">☑</span><span class="mlp-sr">done</span>' : '<span aria-hidden="true">☐</span>';
    }
  }
  msel.value = String(monthOf(S.cur || 1)); showMonth(msel.value);
  msel.addEventListener('change', function () { showMonth(msel.value); });
  D.getElementById('gby-print').addEventListener('click', function () { showMonth(msel.value); W.print(); });

  /* ---------- settings ---------- */
  var radios = root.querySelectorAll('input[name="gby-track"]'), paceOn = D.getElementById('gby-pace-on'), paceDate = D.getElementById('gby-pace-date'), start = D.getElementById('gby-start');
  function paintSettings() {
    root.setAttribute('data-track', S.track);
    Array.prototype.forEach.call(radios, function (r) { r.checked = r.value === S.track; });
    paceOn.checked = !!S.pace; paceDate.hidden = !S.pace; start.value = S.start || '';
    start.max = ymd(new Date(Date.now() + 864e5 * 400));
  }
  Array.prototype.forEach.call(radios, function (r) {
    r.addEventListener('change', function () { if (!r.checked) return; S.track = r.value; save(); paintSettings(); render(); });
  });
  paceOn.addEventListener('change', function () {
    S.pace = paceOn.checked;
    if (S.pace && !S.start) S.start = ymd(new Date(Date.now() - 864e5 * Math.max(0, S.done.length - 1)));
    if (!S.pace) delete S.start;
    save(); paintSettings(); render();
  });
  start.addEventListener('change', function () { if (dayNum(start.value) != null) { S.start = start.value; save(); render(); } });
  D.getElementById('gby-reset').addEventListener('click', function () {
    if (!W.confirm('Start the year over? This clears the days marked done for this learner.')) return;
    sdel(KEY); S = load(); sel = 1; paintSettings(); render(); say('The year is reset.');
  });
  W.addEventListener('storage', function (ev) { if (ev.key === KEY) { S = load(); sel = S.cur || 1; paintSettings(); render(); } });

  paintSettings();
  render();
})(window, document);
