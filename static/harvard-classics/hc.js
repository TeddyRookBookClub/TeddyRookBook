/* The Harvard Classics, fifteen minutes a day: page scripts for /harvard-classics/ (front page, today, calendar, days).
   "Today" is the visitor's own local date (new Date()). The only thing stored is a per-device convenience, the last
   reading finished: localStorage 'trb-hc-v1' = {last: "MM-DD", at: ms, view: "month"|"year"}. */
(function () {
  'use strict';
  var D = document, W = window, KEY = 'trb-hc-v1';
  var M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function load() { try { var o = JSON.parse(W.localStorage.getItem(KEY) || 'null'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function save(patch) { try { var o = load(); for (var k in patch) o[k] = patch[k]; W.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function pad(n) { return ('0' + n).slice(-2); }
  function idOf(d) { return pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dateName(id) { return M[+id.slice(0, 2) - 1] + ' ' + (+id.slice(3)); }
  function slugOf(id) { return M[+id.slice(0, 2) - 1].toLowerCase() + '-' + (+id.slice(3)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var DAYS = []; try { DAYS = JSON.parse((D.getElementById('hc-days') || {}).textContent || '[]') || []; } catch (e) { }
  var POS = {}; DAYS.forEach(function (d, i) { POS[d[0]] = i; });
  var now = new Date();
  // the reading for the visitor's date; February 29 follows the guide (its own reading, or the one the page names)
  function todayId(leap) { var id = idOf(now); if (id === '02-29' && !(id in POS)) id = leap || '02-28'; return id; }
  function nextOf(id) { var i = POS[id]; return i == null || !DAYS.length ? null : DAYS[(i + 1) % DAYS.length]; }
  function base() { var e = D.querySelector('[data-base]'); return e ? e.getAttribute('data-base') : '/harvard-classics/'; }
  function link(d) { return base() + d[1] + '/'; }

  // "Last read": a day counts as finished when the end of its reading comes into view.
  function watchEnd(article) {
    var end = article && article.querySelector('.hc-end'), id = article && article.getAttribute('data-id');
    if (!end || !id) return;
    var done = function () { save({ last: id, at: Date.now() }); };
    if ('IntersectionObserver' in W) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { done(); io.disconnect(); } }); });
      io.observe(end);
    } else W.addEventListener('scroll', function f() { if (end.getBoundingClientRect().top < W.innerHeight) { done(); W.removeEventListener('scroll', f); } });
  }

  // "Pick up where you left off", when the last reading finished isn't today's or the day before it
  function cont(tid) {
    var box = D.getElementById('hc-cont'), st = load(); if (!box || !st.last || !(st.last in POS)) return;
    var nx = nextOf(st.last); if (!nx || st.last === tid || nx[0] === tid) return;
    var last = DAYS[POS[st.last]];
    box.innerHTML = 'The last reading you finished was <b>' + esc(dateName(last[0])) + '</b>, “' + esc(last[2]) + '.” <a href="' + esc(link(nx)) + '">Go on to ' + esc(dateName(nx[0])) + ': ' + esc(nx[2]) + ' →</a>';
    box.hidden = false;
  }

  /* ── a day page ── */
  var day = D.getElementById('hc-day');
  if (day && !D.getElementById('hc-todaypg')) watchEnd(day);

  /* ── today ── */
  var tp = D.getElementById('hc-todaypg');
  if (tp) {
    var tid = todayId(tp.getAttribute('data-leap')), slot = D.getElementById('hc-slot'), nojs = D.getElementById('hc-nojs');
    var lab = D.getElementById('hc-tdate'); if (lab) lab.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (nojs) nojs.remove();
    tp.querySelectorAll('.hc-all details').forEach(function (d) { d.open = false; });
    cont(tid);
    var d = DAYS[POS[tid]];
    if (!d) {
      slot.innerHTML = '<p class="hc-loading">There’s no reading for ' + esc(dateName(tid)) + ' here yet. Choose another day below or from the <a href="' + esc(base()) + 'calendar/">calendar</a>.</p>';
    } else {
      slot.innerHTML = '<p class="hc-loading">Finding the reading for ' + esc(dateName(tid)) + '…</p>';
      fetch(link(d)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
        var art = new DOMParser().parseFromString(html, 'text/html').getElementById('hc-day');
        if (!art) throw new Error('no article');
        var h1 = art.querySelector('h1'); // this page's own h1 is "Today's reading"; the day's title becomes its h2
        if (h1) { var h2 = D.createElement('h2'); h2.innerHTML = h1.innerHTML; h2.className = 'hc-title'; h1.replaceWith(h2); }
        slot.textContent = '';
        slot.appendChild(D.importNode(art, true));
        D.title = dateName(tid) + ': ' + d[2] + ' · Harvard Classics';
        watchEnd(slot.querySelector('.hc-day'));
      }).catch(function () {
        slot.innerHTML = '<p class="hc-loading">The reading couldn’t be loaded just now. <a href="' + esc(link(d)) + '">Open ' + esc(dateName(tid)) + ': ' + esc(d[2]) + ' →</a></p>';
      });
    }
  }

  /* ── calendar ── */
  var cal = D.getElementById('hc-cal');
  if (cal) {
    var Y = now.getFullYear(), tid2 = todayId('02-28'), st = load(), cur = now.getMonth() + 1, view = st.view === 'year' ? 'year' : 'month';
    var mh = /^#m(\d{1,2})$/.exec(location.hash); if (mh && +mh[1] >= 1 && +mh[1] <= 12) { cur = +mh[1]; view = 'month'; }
    var ys = D.getElementById('hc-year'); if (ys) ys.textContent = Y;
    // weekdays for this year
    cal.querySelectorAll('.hc-month').forEach(function (sec) {
      var li = sec.querySelector('.hc-grid li'); if (li) li.style.gridColumnStart = new Date(Y, +sec.getAttribute('data-m') - 1, 1).getDay() + 1;
    });
    var ta = cal.querySelector('.hc-grid a[data-id="' + idOf(now) + '"]') || cal.querySelector('.hc-grid a[data-id="' + tid2 + '"]');
    if (ta) { ta.setAttribute('aria-current', 'date'); ta.setAttribute('aria-label', ta.getAttribute('aria-label') + ' (today)'); }
    var tl = cal.querySelector('.hc-mlist li[data-id="' + tid2 + '"]'); if (tl) tl.classList.add('hc-now');
    if (st.last) { var la = cal.querySelector('.hc-grid a[data-id="' + st.last + '"]'); if (la) { la.classList.add('hc-last'); la.title = 'The last reading you finished'; } }
    var tools = D.getElementById('hc-ctools'), mlab = D.getElementById('hc-mlab'), prev = D.getElementById('hc-prev'), next = D.getElementById('hc-next');
    tools.hidden = false;
    function show() {
      cal.classList.toggle('month', view === 'month'); cal.classList.toggle('year', view === 'year');
      cal.querySelectorAll('.hc-month').forEach(function (s) { s.classList.toggle('on', +s.getAttribute('data-m') === cur); });
      mlab.textContent = view === 'month' ? M[cur - 1] + ' ' + Y : String(Y);
      prev.hidden = next.hidden = view !== 'month';
      tools.querySelectorAll('.hc-seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === view)); });
      try { history.replaceState(null, '', view === 'month' ? '#m' + cur : location.pathname); } catch (e) { }
    }
    function go(dm) { cur = (cur + dm + 11) % 12 + 1; show(); }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    D.getElementById('hc-gotoday').addEventListener('click', function () {
      cur = now.getMonth() + 1; show();
      var t = cal.querySelector('.hc-grid a[aria-current="date"]'), sec = D.getElementById('m' + cur);
      if (sec) sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
      if (t) t.focus({ preventScroll: true });
    });
    tools.querySelectorAll('.hc-seg button').forEach(function (b) {
      b.addEventListener('click', function () { view = b.getAttribute('data-v'); save({ view: view }); show(); });
    });
    D.addEventListener('keydown', function (e) {
      if (view !== 'month' || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); } else if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
    });
    show();
    cont(tid2);
  }

  /* ── front page ── */
  if (D.querySelector('.hc-front')) cont(todayId((D.getElementById('hc-card') || { getAttribute: function () { return ''; } }).getAttribute('data-leap')));
})();
