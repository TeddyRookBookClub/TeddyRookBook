/* Meal Prep print page (/meal-prep/print/): the saved plan laid out for paper or "Save as PDF". */
(function (W, D) {
  'use strict';
  var M = W.MealModel, C = W.MealCommon, $ = C.$, $$ = C.$$, esc = C.esc;
  var root = D.getElementById('mp-print'); if (!root) return;
  var st = C.loadState(), data = null;
  var q = {}; location.search.replace(/[?&]([^=&]+)=([^&]*)/g, function (_, k, v) { q[k] = decodeURIComponent(v); });
  if (q.plan && st.plans.some(function (p) { return p.id === q.plan; })) st.cur = q.plan;
  var inc = (q.inc || 'grid,shop').split(','), range = q.range || 'all';
  function plan() { return C.plan(st); }
  function opts() {
    var p = plan();
    $('#mpp-plan').innerHTML = st.plans.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === st.cur ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('');
    var r = '<option value="all">The whole plan</option>'; C.weeks(p).forEach(function (w) { if (p.days > 7) r += '<option value="w' + w.w + '">' + esc(C.weekLabel(p, w)) + '</option>'; });
    $('#mpp-range').innerHTML = r; $('#mpp-range').value = range; if (!$('#mpp-range').value) { range = 'all'; $('#mpp-range').value = 'all'; }
    $$('#mpp-inc input').forEach(function (b) { b.checked = inc.indexOf(b.value) >= 0; });
  }
  function weeksIn(p) { var ws = C.weeks(p), m = /^w(\d+)$/.exec(range); return m ? ws.filter(function (w) { return w.w === +m[1]; }) : ws; }
  function render() {
    var p = plan(), all = C.recipes(data, st), ws = weeksIn(p), from = ws[0].from, to = ws[ws.length - 1].to, h = '';
    var ppl = M.householdPeople(st.people), title = '<h1>' + esc(p.name) + '</h1><p class="mpp-sub">' + esc(C.rangeLabel(p, range)) + ' · ' + ppl + (ppl === 1 ? ' person' : ' people') + ' (about ' + M.fmtNum(M.householdServings(st.people)) + ' adult portions a meal)</p>';
    var any = Object.keys(p.cells).length > 0;
    if (!any) { $('#mpp').innerHTML = title + '<p class="mpp-empty">This plan has no meals yet. Go back to the planner and add some.</p>'; return; }
    var first = true;
    function page(body) { h += '<section class="mpp-page">' + (first ? title : '') + body + '</section>'; first = false; }
    if (inc.indexOf('grid') >= 0) ws.forEach(function (w) { page('<h2>' + esc(C.weekLabel(p, w)) + '</h2>' + C.weekGridHTML(data, st, p, w)); });
    if (inc.indexOf('shop') >= 0) page('<h2>Shopping list</h2>' + C.shopHTML(data, st, p, range, { uses: false }));
    if (inc.indexOf('prep') >= 0) ws.forEach(function (w) { page('<h2>Prep day · Week ' + (w.w + 1) + '</h2>' + prepHTML(p, w)); });
    if (inc.indexOf('cards') >= 0) {
      var cooked = C.cooked(data, st, p, from, to);
      page('<h2>Recipe cards</h2>' + (cooked.length ? cooked.map(function (c) { return C.cardHTML(data, c.r, Math.round(c.servings / c.times * 4) / 4); }).join('') : '<p class="mpp-empty">No recipes.</p>') + '<p class="mpp-foot">Amounts are for one cooking of each recipe at your household’s size (leftovers and extra portions included).</p>');
    }
    if (inc.indexOf('kids') >= 0) ws.forEach(function (w) {
      var slots = q.kids === 'all' ? M.SLOTS.filter(function (s) { return p.slots[s] !== false; }) : ['dinner'];
      h += '<section class="mpp-page"><h1 style="text-align:center;font-size:2.2rem">' + (slots.length > 1 ? 'What are we eating?' : 'What’s for dinner?') + '</h1><p class="mpp-sub" style="text-align:center">Week of ' + esc(C.shortDate(C.dateOf(p, w.from))) + '</p>' + C.kidsHTML(data, st, p, w, slots) + '</section>'; first = false;
    });
    h += '<p class="mpp-foot">Made with the Teddy Rook Book meal planner · teddyrookbook.com/meal-prep</p>';
    $('#mpp').innerHTML = h || '<p class="mpp-empty">Pick at least one thing to print.</p>';
  }
  function prepHTML(p, w) {
    var PP = C.prepPlan(data, st, p, w), jobs = PP.jobs, other = [];
    PP.scratch.forEach(function (x) { x.parts.forEach(function (pt) { if (pt.day !== PP.p) other.push({ s: x.s, pt: pt }); }); });
    var start = (st.prepStart || '13:00').split(':'), sm = +start[0] * 60 + (+start[1] || 0);
    function clock(m) { var t = (sm + m) % 1440, hh = Math.floor(t / 60), mm = Math.round(t % 60); return (hh % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + (hh >= 12 ? ' PM' : ' AM'); }
    var h = '', before = C.beforeJobs(jobs);
    if (before.length) h += '<h3>The day before</h3><ul>' + before.map(function (b) { return '<li><b>' + esc(C.dayLabel(p, PP.p - 1, true)) + '</b>: ' + esc(b.s.name) + ' ' + C.timesText(b.n) + ': ' + esc(C.beforeText(b)) + '.</li>'; }).join('') + '</ul>';
    if (!jobs.length) h += '<p class="mpp-empty">No make-ahead dishes picked for this week.</p>';
    else {
      var pd = M.prepDay(jobs);
      h += '<p class="mpp-sub">' + esc(C.dayLabel(p, PP.p, true)) + '</p><div class="mpp-prep"><ol>' + pd.steps.map(function (s) { var T = C.stepText(s, clock), j = s.j; return '<li><b>' + clock(s.at) + '</b> ' + esc(T.title) + ' (' + esc(T.label.toLowerCase()) + ')' + (s.heat ? ': heat the oven to ' + s.heat + '°F' : '') + '. ' + esc(T.what) + ' ' + esc(T.small) + '.' + (j.r && j.keeps ? ' Keeps about ' + j.keeps + (j.keeps === 1 ? ' day' : ' days') + ' in the fridge.' : '') + '</li>'; }).join('') +
        '<li><b>' + clock(pd.end) + '</b> Cool, label and pack. Refrigerate within 2 hours (1 hour above 90°F); reheat leftovers to 165°F.</li></ol></div>';
    }
    if (other.length) h += '<h3>From scratch on other days</h3><ul>' + other.sort(function (a, b) { return a.pt.day - b.pt.day; }).map(function (o) { return '<li><b>' + esc(C.dayLabel(p, o.pt.day, true)) + '</b>: ' + esc(o.s.name) + ' ' + C.timesText(o.pt.n) + (C.hasBefore(o.s) ? ' (start it the day before)' : '') + '</li>'; }).join('') + '</ul>';
    return h;
  }
  $('#mpp-plan').addEventListener('change', function () { st.cur = this.value; range = 'all'; opts(); render(); });
  $('#mpp-range').addEventListener('change', function () { range = this.value; render(); });
  $('#mpp-inc').addEventListener('change', function () { inc = $$('#mpp-inc input').filter(function (b) { return b.checked; }).map(function (b) { return b.value; }); render(); });
  $('#mpp-go').addEventListener('click', function () { W.print(); });
  C.load(root.dataset.src, function (err, d) {
    if (err) { $('#mpp').innerHTML = '<p class="mpp-empty">The recipes didn’t load. Reload the page.</p>'; return; }
    data = d; opts(); render();
  });
})(window, document);
