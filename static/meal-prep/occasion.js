/* Meal Prep: holiday and party collection pages (layouts/meal-prep/occasion.html): /meal-prep/cookout/, /game-day/, /hanukkah/.
   1. Your menu: checkboxes -> one shopping list (model.js shoppingList), copy, print, and "put it in my planner" (?add=id,id,...).
   2. How much: per-guest amounts times the number of guests.
   3. Countdown: date + serving time + how long food stays out -> a dated plan that works backward from serving time:
      make-ahead jobs in the days before, oven dishes fitted onto two racks, grill, stove, frying and slow-cooker starts,
      and reminders to put food away after 2 hours (1 hour above 90°F, USDA).
   Page facts come from <script id="oc-data"> (built from data/meals/recipes/<slug>.json). Choices are remembered in
   localStorage ("trb-occ-<slug>-v1") when the browser allows it; the page works without it. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('mp-occ'); if (!root) return;
  var M = W.MealModel, C = W.MealCommon;
  var $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var T = JSON.parse($('#oc-data').textContent), CO = T.coll, RI = T.r, EV = CO.event || {};
  var KEY = 'trb-occ-' + root.dataset.slug + '-v1', st = {};
  try { st = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var FULL = {}; (CO.full || []).forEach(function (c) { FULL[c] = 1; });

  // ---------- the menu ----------
  var boxes = $$('#oc-pick input[type=checkbox]');
  if (st.menu && st.menu.length) boxes.forEach(function (b) { b.checked = st.menu.indexOf(b.value) >= 0; });
  var guests = st.g > 0 ? st.g : 10;
  if (typeof st.half === 'boolean') $('#oc-half').checked = st.half;
  function menu() { var seen = {}; return boxes.filter(function (b) { if (!b.checked || seen[b.value]) return false; seen[b.value] = 1; return true; }).map(function (b) { return b.value; }); }
  function servingsFor(id) { var c = (RI[id] || {}).c; return FULL[c] || !$('#oc-half').checked ? guests : Math.max(1, Math.round(guests * 0.5 * 2) / 2); }
  var data = null, lastList = [];

  function shop() {
    var ids = menu();
    $('#oc-shopsum').textContent = ids.length ? '(' + ids.length + (ids.length === 1 ? ' dish, ' : ' dishes, ') + guests + (guests === 1 ? ' guest)' : ' guests)') : '';
    if (!data) return;
    if (!ids.length) { $('#oc-shop').innerHTML = '<p class="mp-empty">Check some dishes above to build the list.</p>'; lastList = []; return; }
    var plan = { days: 1, start: C.iso(new Date()), cells: { '0|dinner': ids.filter(function (id) { return data.builtin[id]; }).map(function (id) { return { r: id, x: servingsFor(id) }; }) }, guests: {}, slots: {} };
    var list = M.shoppingList(plan, [{ k: 'adult', n: 0, f: 1 }], data.builtin, data.cat, { sectionOrder: data.sectionOrder });
    lastList = list;
    var h = '', sec = null;
    list.forEach(function (row) {
      if (row.section !== sec) { if (sec !== null) h += '</ul>'; sec = row.section; h += '<h3>' + esc(C.sectionName(data, sec)) + '</h3><ul>'; }
      h += '<li><b>' + esc(row.name) + '</b>' + (row.buy ? ' <span>' + esc(row.buy) + '</span>' : '') + (row.uses && row.uses.length ? '<small>' + esc(row.uses.join(', ')) + '</small>' : '') + '</li>';
    });
    $('#oc-shop').innerHTML = '<div class="oc-shoplist">' + h + (sec !== null ? '</ul>' : '') + '</div>';
  }
  function planLink() { var ids = menu(); $('#oc-plan').href = root.dataset.plan + (ids.length ? '?add=' + ids.join(',') : ''); }
  // families who keep kosher don't serve meat and dairy at one meal: a gentle note when the menu mixes them
  function kosher() {
    var el = $('#oc-kosher'); if (!el) return;
    var ids = menu(), d = ids.filter(function (id) { return CO.dairy.indexOf(id) >= 0; }), m = ids.filter(function (id) { return CO.meat.indexOf(id) >= 0; });
    el.hidden = !(d.length && m.length);
    if (!el.hidden) el.innerHTML = '<b>Keeping kosher?</b> This menu has meat (' + esc(m.map(function (id) { return RI[id].n; }).join(', ')) + ') and dairy (' + esc(d.map(function (id) { return RI[id].n; }).join(', ')) + '). Families who keep kosher serve them at separate meals. Several dairy dishes have a dairy-free swap on their recipe page, and latkes go with applesauce at a meat meal.';
  }
  function howmuch() {
    $('#oc-hmg').textContent = guests;
    $$('#oc-hm tbody tr').forEach(function (tr) {
      var v = parseFloat(tr.dataset.per) * guests, u = tr.dataset.unit;
      var s = v >= 10 ? String(Math.ceil(v)) : String(Math.ceil(v * 2) / 2);
      tr.querySelector('.oc-amt').textContent = s + ' ' + (s === '1' ? u.replace(/s$/, '') : u);
    });
  }
  function changed() {
    st.menu = menu(); st.g = guests; st.half = $('#oc-half').checked; save();
    $('#oc-g').textContent = guests;
    planLink(); shop(); kosher(); howmuch(); countdown();
  }
  boxes.forEach(function (b) { b.addEventListener('change', changed); });
  $('#oc-half').addEventListener('change', changed);
  $('#oc-gm').addEventListener('click', function () { guests = Math.max(1, guests - 1); changed(); });
  $('#oc-gp').addEventListener('click', function () { guests = Math.min(80, guests + 1); changed(); });
  $('#oc-copy').addEventListener('click', function () {
    var txt = M.listText(lastList, T.title + ' shopping list (' + guests + ' guests)'), btn = this;
    function done(ok) { btn.textContent = ok ? '✓ Copied' : 'Select the list and copy it'; setTimeout(function () { btn.textContent = '📋 Copy the shopping list'; }, 2500); }
    if (W.navigator.clipboard && W.navigator.clipboard.writeText) W.navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); else done(false);
  });

  // ---------- countdown ----------
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function clock(d) { var h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + pad(m) + (h < 12 ? ' a.m.' : ' p.m.'); }
  function dayName(d) { return DAYS[d.getDay()] + ', ' + MONS[d.getMonth()] + ' ' + d.getDate(); }
  function dur(min) { min = Math.round(min); if (min < 60) return min + ' min'; var h = Math.floor(min / 60), m = min % 60; return h + ' hr' + (m ? ' ' + m + ' min' : ''); }
  function addMin(d, m) { return new Date(d.getTime() + m * 60000); }
  function rnd(d, step) { var s = (step || 5) * 60000; return new Date(Math.floor(d.getTime() / s) * s); }
  function defaultDate() {
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (EV.date === 'july4') { var j = new Date(today.getFullYear(), 6, 4); if (j < today) j = new Date(today.getFullYear() + 1, 6, 4); return j; }
    if (EV.date === 'sunday') return new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((7 - today.getDay()) % 7 || 7));
    if (EV.date === 'hanukkah') { for (var i = 0; i < CO.dates.length; i++) { var p = CO.dates[i][1].split('-'), end = new Date(+p[0], +p[1] - 1, +p[2]); if (end >= today) { var q = CO.dates[i][0].split('-'), s = new Date(+q[0], +q[1] - 1, +q[2]); return s < today ? today : s; } } }
    return today;
  }
  ['oc-date', 'oc-time', 'oc-hours', 'oc-hot'].forEach(function (id) {
    var el = $('#' + id); if (!el) return;
    var k = 'cd_' + id.slice(3);
    if (st[k] != null && st[k] !== '') { if (el.type === 'checkbox') el.checked = !!st[k]; else el.value = st[k]; }
    el.addEventListener('change', function () { st[k] = el.type === 'checkbox' ? el.checked : el.value; save(); countdown(); });
    if (el.type === 'number') el.addEventListener('input', function () { st[k] = el.value; countdown(); });
  });
  if (!$('#oc-date').value) $('#oc-date').value = isoDate(defaultDate());

  var lastSteps = [];
  function countdown() {
    var out = $('#oc-out');
    var dv = $('#oc-date').value.split('-'), tv = ($('#oc-time').value || EV.time || '18:00').split(':');
    var serve = new Date(+dv[0], +dv[1] - 1, +dv[2], +tv[0] || 0, +tv[1] || 0);
    if (isNaN(serve)) { out.innerHTML = '<li>Enter a date and time.</li>'; return; }
    var hours = parseFloat($('#oc-hours').value); if (!(hours > 0)) hours = EV.hours || 3; hours = Math.min(12, hours);
    var hot = !!($('#oc-hot') && $('#oc-hot').checked), limit = hot ? 60 : 120;
    var steps = [];
    function add(t, txt, k) { steps.push({ t: t, txt: txt, k: k || '' }); }
    var ids = menu(), ovenD = [], grill = [], fry = [];
    ids.forEach(function (id) {
      var d = CO.day[id], r = RI[id]; if (!d || !r) return;
      var who = r.e + ' ' + r.n;
      if (d.ahead && !d.ahead_part) add(new Date(serve.getFullYear(), serve.getMonth(), serve.getDate() - Math.min(d.ahead, 2), 10, 0), who + ': make it now, or any time up to ' + d.ahead + (d.ahead === 1 ? ' day' : ' days') + ' ahead' + (r.c === 'snacks' ? ' (cookies and dry snacks keep in an airtight tin; anything with eggs or dairy goes in the refrigerator).' : ', and keep it in the refrigerator.'), 'ahead');
      if (d.ahead_part) add(new Date(serve.getFullYear(), serve.getMonth(), serve.getDate() - 1, 15, 0), who + ': ' + d.ahead_part + '.', 'ahead');
      if (d.oven) ovenD.push({ id: id, temp: d.oven[0], min: d.oven[1], last: !!d.last, who: who, reheat: !!d.ahead });
      if (d.grill) grill.push({ min: d.grill, last: !!d.last, who: who });
      if (d.fry) fry.push({ min: d.fry, who: who, last: !!d.last });
      if (d.stove) add(rnd(addMin(serve, -(d.stove + 5))), who + (d.ahead ? ': reheat it on the stove to 165°F' : ': start it on the stove') + ' (about ' + dur(d.stove) + ').', 'stove');
      if (d.slow) add(rnd(addMin(serve, -d.slow)), who + ': reheat to 165°F (stove or microwave), then keep it warm in a slow cooker on low or warm, at 140°F or above.', 'stove');
      if (d.chill) add(rnd(addMin(serve, -d.chill)), who + ': put it together (about ' + dur(d.chill) + ') and keep it cold until serving.', 'cold');
      if (d.ahead && !d.oven && !d.stove && !d.slow) add(addMin(serve, -10), who + ': set it out. Keep cold dishes over ice or in a cooler until they go on the table.', 'cold');
    });
    // oven: two racks, working back from serving time; dishes marked "last" come out just before serving
    if (ovenD.length) {
      var racks = [addMin(serve, -5), addMin(serve, -5)], placed = [];
      ovenD.sort(function (a, b) { return (b.last - a.last) || (b.min - a.min); }).forEach(function (o) {
        var ri = racks[0] >= racks[1] ? 0 : 1, end = racks[ri], start = addMin(end, -o.min);
        racks[ri] = start; placed.push({ o: o, start: start, end: end });
      });
      var hi = Math.max.apply(null, placed.map(function (p) { return p.o.temp; }));
      var first = placed.reduce(function (a, p) { return p.start < a ? p.start : a; }, placed[0].start);
      add(rnd(addMin(first, -20)), 'Heat the oven to ' + hi + '°F' + (placed.length > 1 ? ', with racks in the upper and lower thirds' : '') + '.', 'oven');
      placed.forEach(function (p) {
        var note = p.o.temp < hi ? ' (the recipe says ' + p.o.temp + '°F; at ' + hi + '°F check it a few minutes early, or turn the oven down when it goes in)' : ' at ' + p.o.temp + '°F';
        add(rnd(p.start), p.o.who + (p.o.reheat ? ': into the oven to reheat' : ': into the oven') + note + ', about ' + dur(p.o.min) + (p.o.reheat ? ', until 165°F in the center' : '') + '.', 'oven');
      });
    }
    // grill: long cooks first, quick things last, so everything comes off close to serving time
    if (grill.length) {
      var gs = grill.map(function (g) { return { g: g, start: rnd(addMin(serve, -(g.min + (g.last ? 0 : g.min >= 30 ? 15 : 8)))) }; });
      var g0 = gs.reduce(function (a, x) { return x.start < a ? x.start : a; }, gs[0].start);
      add(rnd(addMin(g0, -30)), 'Light the grill: about 30 minutes ahead for charcoal, 10 to 15 for gas. Set up a hot side and a cooler side. Clean, oiled grates; clean platters for cooked food; food thermometer ready.', 'grill');
      gs.forEach(function (x) { add(x.start, x.g.who + ': on the grill, about ' + dur(x.g.min) + (x.g.min >= 30 ? ' (keep it on the cooler side; check with a thermometer)' : '') + '.', 'grill'); });
    }
    // frying: right before serving, with the warm oven ready
    if (fry.length) {
      var f0 = serve; fry.sort(function (a, b) { return (a.last - b.last) || (b.min - a.min); }); // sweets first, latkes and wings last, hottest at serving
      var t = serve; fry.forEach(function (f) { t = addMin(t, -f.min); });
      f0 = rnd(t);
      add(addMin(f0, -15), 'Set up for frying: heavy pan, thermometer, a lid or sheet pan beside the stove, paper towels, and a rack in a baking sheet in a 200°F oven to keep things warm. Kids back from the stove.', 'fry');
      var ft = f0; fry.forEach(function (f) { add(ft, f.who + ': fry in batches (about ' + dur(f.min) + ') and keep warm in the oven.', 'fry'); ft = addMin(ft, f.min); });
    }
    add(serve, (EV.label || 'Time to eat') + '.', 'serve');
    // putting food away: the 2-hour rule (1 hour above 90°F)
    var end = addMin(serve, hours * 60), k = 1;
    for (var tt = addMin(serve, limit); tt < end; tt = addMin(serve, limit * ++k)) {
      add(tt, (limit * k / 60) + (limit * k === 60 ? ' hour' : ' hours') + ' since the food went out. Put perishable dishes that have been out ' + (hot ? '1 hour' : '2 hours') + ' back in the refrigerator or cooler and bring out fresh platters' + (hot ? ' (1 hour is the limit above 90°F)' : ' (USDA: no more than 2 hours)') + '. Keep hot dishes at 140°F or above.', 'safe');
      if (k > 10) break;
    }
    add(end, 'Time to put the food away: leftovers into the refrigerator in shallow containers (none should have been out more than ' + (hot ? '1 hour' : '2 hours') + '). Eat them within 3 to 4 days.', 'safe');
    steps.sort(function (a, b) { return a.t - b.t; });
    lastSteps = steps;
    var h = '', day = '';
    steps.forEach(function (s) {
      var dn = dayName(s.t);
      if (dn !== day) { h += '<li class="oc-day">' + esc(dn) + '</li>'; day = dn; }
      h += '<li class="oc-s ' + s.k + '"><time>' + esc(clock(s.t)) + '</time><span>' + esc(s.txt) + '</span></li>';
    });
    out.innerHTML = h || '<li>Check some dishes to build the plan.</li>';
    printout();
  }

  // ---------- the printout (menu, countdown, shopping list) ----------
  function printout() {
    var ids = menu();
    var h = '<h1>' + esc(T.title) + '</h1><p>' + guests + (guests === 1 ? ' guest' : ' guests') + ' · ' + esc($('#oc-date').value ? dayName(new Date($('#oc-date').value + 'T12:00')) : '') + '</p>';
    h += '<h2>Menu</h2><ul class="oc-pm">' + ids.map(function (id) { var r = RI[id]; return r ? '<li>' + esc(r.e + ' ' + r.n) + '</li>' : ''; }).join('') + '</ul>';
    h += '<h2>Countdown</h2><ol class="oc-pt">';
    var day = '';
    lastSteps.forEach(function (s) { var dn = dayName(s.t); if (dn !== day) { h += '<li class="oc-day">' + esc(dn) + '</li>'; day = dn; } h += '<li><b>' + esc(clock(s.t)) + '</b> ' + esc(s.txt) + '</li>'; });
    h += '</ol><h2>Shopping list</h2>';
    var sec = null, sl = '';
    lastList.forEach(function (row) { if (row.section !== sec) { if (sec !== null) sl += '</ul>'; sec = row.section; sl += '<h3>' + esc(data ? C.sectionName(data, sec) : sec) + '</h3><ul>'; } sl += '<li>☐ ' + esc(row.name) + (row.buy ? ' — ' + esc(row.buy) : '') + '</li>'; });
    h += '<div class="oc-ps">' + sl + (sec !== null ? '</ul>' : '') + '</div><p>Perishable food out no more than 2 hours (1 hour above 90°F). teddyrookbook.com/' + esc(T.url) + '</p>';
    $('#oc-printout').innerHTML = h;
  }
  $('#oc-print').addEventListener('click', function () { printout(); W.print(); });

  // ---------- start ----------
  $('#oc-g').textContent = guests;
  planLink(); kosher(); howmuch(); countdown(); shop();
  C.load(root.dataset.src, function (err, d) {
    if (err) { $('#oc-shop').innerHTML = '<p class="mp-warn">The recipes didn’t load (' + esc(err.message) + '). Check your connection and reload the page.</p>'; return; }
    data = d; shop(); printout();
  });
})(window, document);
