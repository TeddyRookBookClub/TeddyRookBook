/* Bible in a Year (/bible-in-a-year/): draws the year's readings from data/bibleyear.json (embedded as #by-data).
   Saves: 'trb-bibleyear-v1' = {v: "73"|"66", start: "YYYY-MM-DD"}; ticks in 'trb-homeschool-v1' done["bible-73"|"bible-66"][day],
   shared with the lesson planner's "Bible in a Year" subject. Links go to Bible Gateway: Douay-Rheims (DRA) for the 73-book
   version, with the psalms moved to its Greek/Latin numbering and Esther's additions to its chapters 10:4-16; the World
   English Bible (WEB) for the 66-book version. A hash like #day-12-66 opens that day in that version. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('by'); if (!root) return;
  var DATA = JSON.parse(D.getElementById('by-data').textContent);
  var KEY = 'trb-bibleyear-v1', HS = 'trb-homeschool-v1';
  var ONE = { Obad: 1, Phlm: 1, '2John': 1, '3John': 1, Jude: 1 };
  var NAME = {}; DATA.books.forEach(function (b) { NAME[b.k] = b.n; });
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load(k) { try { return JSON.parse(W.localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function store(k, o) { try { W.localStorage.setItem(k, JSON.stringify(o)); return true; } catch (e) { return false; } }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function parseISO(s) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  var st = load(KEY) || {};
  if (st.v !== '66') st.v = '73';
  if (!parseISO(st.start)) st.start = today().getFullYear() + '-01-01';
  var hm = /^#day-(\d+)(?:-(73|66))?$/.exec(W.location.hash);
  if (hm && hm[2]) st.v = hm[2];

  // ---------- text of a reading ----------
  function label(it) {
    var b = it.b, n = b === 'Ps' ? (it.t ? 'Psalms' : 'Psalm') : NAME[b], s;
    if (typeof it.f === 'string') return n + ' ' + it.f + ' <span class="by-add">(Greek addition)</span>';
    s = ONE[b] && !it.vr ? n : n + ' ' + it.f + (it.t ? '–' + it.t : ''); // a one-chapter book is named alone
    if (it.vr) s += ':' + it.vr[0] + '–' + it.vr[1];
    if (it.st) s += ' <span class="by-add">(' + it.st + ')</span>';
    return s;
  }
  function plain(it) { return label(it).replace(/<[^>]+>/g, ''); }
  // ---------- Bible Gateway links ----------
  function vulgPs(h) { // Hebrew psalm number -> Douay-Rheims (Greek/Latin) number
    if (h <= 8 || h >= 148) return String(h);
    if (h <= 10) return '9';
    if (h <= 113) return String(h - 1);
    if (h <= 115) return '113';
    if (h === 116) return '114-115';
    if (h <= 146) return String(h - 1);
    return '146-147';
  }
  var DRA_ESTH = { A: '11:2-12:6', B: '13:1-7', C: '13:8-14:19', D: '15', E: '16', F: '10:4-11:1' };
  function search(it, v) {
    var b = it.b, n = b === 'Ps' ? 'Psalm' : NAME[b], r;
    if (v === '73' && b === 'Ps') return n + ' ' + vulgPs(it.f) + (it.vr ? ':' + it.vr[0] + '-' + it.vr[1] : '');
    if (v === '73' && b === 'Esth' && typeof it.f === 'string') return n + ' ' + DRA_ESTH[it.f];
    r = it.f + (it.t ? '-' + it.t : '') + (it.vr ? ':' + it.vr[0] + '-' + it.vr[1] : '');
    if (v === '73' && b === 'Esth' && (it.t || it.f) === 10) r = it.t ? it.f + ':1-10:3' : '10:1-3'; // the Douay's chapter 10 goes on into addition F
    return n + ' ' + r;
  }
  function href(it, v) { return 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(search(it, v)) + '&version=' + (v === '73' ? 'DRA' : 'WEB'); }
  function item(it, v) {
    var h = '<a href="' + esc(href(it, v)) + '" target="_blank" rel="noopener">' + label(it) + '</a>';
    if (it.dc) h += ' <span class="by-badge">' + esc(DATA.badge) + '</span>';
    if (it.dcp) h += ' <span class="by-badge">Verses ' + esc(it.dcp) + ': ' + esc(DATA.badge) + '</span>';
    return '<span class="by-it' + (it.dc ? ' dc' : '') + '">' + h + '</span>';
  }

  // ---------- ticks ----------
  function course() { return 'bible-' + st.v; }
  function doneMap() { var h = load(HS); return (h && h.done && h.done[course()]) || {}; }
  function setDone(n, on) {
    var h = load(HS); if (!h || !h.done) h = { done: {} };
    var c = h.done[course()] || (h.done[course()] = {}); if (on) c[n] = 1; else delete c[n];
    if (!store(HS, h)) say('That tick couldn’t be saved: this browser’s storage is full or blocked.');
    try { if (W.TRB && W.TRB.markActivity) W.TRB.markActivity(); } catch (e) { }
  }
  function say(t) { $('by-progtxt').textContent = t; }

  // ---------- drawing ----------
  var fmt = { weekday: 'short', month: 'short', day: 'numeric' };
  function dateOf(n) { var d = parseISO(st.start); d.setDate(d.getDate() + n - 1); return d; }
  function todayN() { return Math.round((today() - parseISO(st.start)) / 864e5) + 1; }
  function draw() {
    var P = DATA.plans[st.v], dn = doneMap(), tn = todayN(), h = '', i = 0;
    root.classList.toggle('v66', st.v === '66');
    while (i < P.length) {
      var e = P[i].e, j = i; while (j < P.length && P[j].e === e) j++;
      h += '<section class="by-era"><h2>' + esc(DATA.eras[e]) + ' <small>Days ' + (i + 1) + '–' + j + '</small></h2><table class="by-tab"><thead><tr><th scope="col"><span class="by-sr">Read</span></th><th scope="col">Day</th><th scope="col">Reading</th><th scope="col">Psalms and Proverbs</th></tr></thead><tbody>';
      for (var k = i; k < j; k++) {
        var n = k + 1, d = P[k], on = !!dn[n];
        h += '<tr id="day-' + n + '" class="' + (on ? 'done' : '') + (n === tn ? ' today' : '') + '"><td class="by-ck"><input type="checkbox" data-n="' + n + '"' + (on ? ' checked' : '') + ' aria-label="Day ' + n + ' read"></td>' +
          '<th scope="row" class="by-day">Day ' + n + ' <small>' + esc(dateOf(n).toLocaleDateString(undefined, fmt)) + (n === tn ? ' · today' : '') + '</small></th>' +
          '<td class="by-main">' + d.r.map(function (it) { return item(it, st.v); }).join('<span class="by-sep">; </span>') + '</td>' +
          '<td class="by-par">' + d.p.map(function (it) { return item(it, st.v); }).join('; ') + '</td></tr>';
      }
      h += '</tbody></table></section>';
      i = j;
    }
    $('by-plan').innerHTML = h;
    root.querySelectorAll('.by-seg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.v ? 'true' : 'false'); });
    $('by-start').value = st.start;
    $('by-printhead').textContent = 'Teddy Rook Book · Bible in a Year · ' + (st.v === '73' ? '73-book (Catholic) version' : '66-book version') + ' · Day 1: ' + parseISO(st.start).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    prog();
  }
  function prog() {
    var dn = doneMap(), c = 0; for (var n = 1; n <= DATA.days; n++) if (dn[n]) c++;
    $('by-barfill').style.width = (100 * c / DATA.days) + '%';
    say(c + ' of ' + DATA.days + ' days read' + (c === DATA.days ? '. You read the whole Bible!' : ''));
    var tn = todayN(); $('by-gotoday').disabled = !(tn >= 1 && tn <= DATA.days);
  }
  function go(n) {
    var row = $('day-' + n); if (!row) return;
    row.scrollIntoView({ block: 'center' });
    row.classList.add('flash'); setTimeout(function () { row.classList.remove('flash'); }, 1600);
  }
  function save() { store(KEY, { v: st.v, start: st.start }); }

  // ---------- events ----------
  root.querySelector('.by-seg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && b.dataset.v !== st.v) { st.v = b.dataset.v; save(); draw(); } });
  $('by-start').addEventListener('change', function () { if (parseISO(this.value)) { st.start = this.value; save(); draw(); } });
  // "January 1": of this year until September, then of the coming year
  var jan1 = today().getFullYear() + (today().getMonth() >= 9 ? 1 : 0) + '-01-01';
  $('by-jan1').textContent = 'January 1, ' + jan1.slice(0, 4);
  $('by-jan1').addEventListener('click', function () { st.start = jan1; save(); draw(); });
  $('by-today0').addEventListener('click', function () { st.start = iso(today()); save(); draw(); go(1); });
  $('by-gotoday').addEventListener('click', function () { go(todayN()); });
  $('by-next').addEventListener('click', function () { var dn = doneMap(); for (var n = 1; n <= DATA.days; n++) if (!dn[n]) { go(n); return; } say('Every day is ticked. Well done!'); });
  $('by-print').addEventListener('click', function () { W.print(); });
  $('by-plan').addEventListener('change', function (e) {
    var t = e.target; if (!t.dataset || !t.dataset.n) return;
    setDone(+t.dataset.n, t.checked); t.closest('tr').classList.toggle('done', t.checked); prog();
  });
  W.addEventListener('hashchange', function () { var m = /^#day-(\d+)(?:-(73|66))?$/.exec(W.location.hash); if (m) { if (m[2] && m[2] !== st.v) { st.v = m[2]; draw(); } go(+m[1]); } });
  W.addEventListener('storage', function (e) { if (e.key === HS) draw(); });

  $('by-tools').hidden = false;
  draw();
  if (hm) go(+hm[1]);
})(window, document);
