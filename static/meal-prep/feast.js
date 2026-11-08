/* Meal Prep: the holiday collection pages (Christmas, Easter, Lunar New Year; layouts/meal-prep/feast.html).
   1. Your menu: checkboxes (dinner dishes, scaled to the guests) and batch steppers (cookies and candy) -> one shopping list
      (model.js shoppingList), copy, print, and "put it in my planner" (?add=id,id,...).
   2. The planning tool named by data-tool:
        roast  dinner time + roast + weight -> a dated plan from USDA's minutes-per-pound, with the menu's oven dishes fitted
               into the oven (two racks) while the roast rests; Christmas adds the cookie-swap planner, Easter the egg plan.
        party  Lunar New Year: guests -> dumplings, wrappers, filling batches and folding time, and a countdown to dinner.
   Page facts come from <script id="fe-data">. Choices are remembered in localStorage ("trb-feast-<key>-v1") when the
   browser allows it; the page works without it. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('mp-feast'); if (!root) return;
  var M = W.MealModel, C = W.MealCommon;
  var $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var T = JSON.parse($('#fe-data').textContent), RI = T.r, TOOL = root.dataset.tool;
  var KEY = 'trb-feast-' + T.key + '-v1', st = {};
  try { st = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var MAIN = { roast: 1, ham: 1, lamb: 1, dumplings: 1, mains: 1 }; // courses served as full portions

  // ---------- the menu ----------
  var boxes = $$('#fe-pick input[type=checkbox]');
  if (st.menu) boxes.forEach(function (b) { b.checked = st.menu.indexOf(b.value) >= 0; });
  var guests = st.g > 0 ? st.g : 8;
  if (typeof st.half === 'boolean') $('#fe-half').checked = st.half;
  var crows = $$('#fe-cookies .fe-crow'), batches = {};
  crows.forEach(function (row) {
    var id = row.dataset.id, out = $('output', row);
    batches[id] = st.b && st.b[id] != null ? st.b[id] : +out.textContent || 0;
    out.textContent = batches[id];
    $$('button', row).forEach(function (btn) { btn.addEventListener('click', function () { setBatch(id, batches[id] + (+btn.dataset.d)); }); });
  });
  function setBatch(id, n) {
    batches[id] = Math.max(0, Math.min(20, n));
    var row = $('#fe-cookies .fe-crow[data-id="' + id + '"]'); if (row) $('output', row).textContent = batches[id];
    changed();
  }
  function menu() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }); }
  function baked() { return Object.keys(batches).filter(function (id) { return batches[id] > 0; }); }
  function servingsFor(id) {
    var r = RI[id] || {};
    if (r.m === 'cookies') return batches[id] * (r.s || 1);
    if (partyNeed && /dumplings$/.test(id)) { var nd = menu().filter(function (x) { return /dumplings$/.test(x); }).length || 1; return Math.max(1, Math.round(partyNeed / 8 / nd * 2) / 2); } // the recipes serve about 8 dumplings
    return MAIN[r.c] || !$('#fe-half').checked ? guests : Math.max(1, Math.round(guests * 0.5 * 2) / 2);
  }
  var data = null, lastList = [], partyNeed = 0;
  function allIds() { return menu().concat(baked().filter(function (id) { return menu().indexOf(id) < 0; })); }

  function shop() {
    var ids = allIds(), nb = baked().length, nm = menu().length;
    $('#fe-shopsum').textContent = ids.length ? '(' + (nm ? nm + (nm === 1 ? ' dish' : ' dishes') + ' for ' + guests + (guests === 1 ? ' guest' : ' guests') : '') + (nm && nb ? '; ' : '') + (nb ? nb + ' kinds of baking' : '') + ')' : '';
    if (!data) return;
    if (!ids.length) { $('#fe-shop').innerHTML = '<p class="mp-empty">Check some dishes above to build the list.</p>'; lastList = []; return; }
    var plan = { days: 1, start: C.iso(new Date()), cells: { '0|dinner': ids.filter(function (id) { return data.builtin[id]; }).map(function (id) { return { r: id, x: servingsFor(id) }; }) }, guests: {}, slots: {} };
    var list = M.shoppingList(plan, [{ k: 'adult', n: 0, f: 1 }], data.builtin, data.cat, { sectionOrder: data.sectionOrder });
    lastList = list;
    var h = '', sec = null;
    list.forEach(function (row) {
      if (row.section !== sec) { if (sec !== null) h += '</ul>'; sec = row.section; h += '<h3>' + esc(C.sectionName(data, sec)) + '</h3><ul>'; }
      h += '<li><b>' + esc(row.name) + '</b>' + (row.buy ? ' <span>' + esc(row.buy) + '</span>' : '') + (row.uses && row.uses.length ? '<small>' + esc(row.uses.join(', ')) + '</small>' : '') + '</li>';
    });
    $('#fe-shop').innerHTML = '<div class="fe-shoplist">' + h + (sec !== null ? '</ul>' : '') + '</div>';
  }
  function planLink() { var ids = allIds(); $('#fe-plan').href = root.dataset.plan + (ids.length ? '?add=' + ids.join(',') : ''); }
  function changed() {
    st.menu = menu(); st.g = guests; st.half = $('#fe-half').checked; st.b = batches; save();
    $('#fe-g').textContent = guests;
    planLink(); shop(); tool();
  }
  boxes.forEach(function (b) { b.addEventListener('change', changed); });
  $('#fe-half').addEventListener('change', changed);
  $('#fe-gm').addEventListener('click', function () { guests = Math.max(1, guests - 1); changed(); });
  $('#fe-gp').addEventListener('click', function () { guests = Math.min(60, guests + 1); changed(); });
  $('#fe-copy').addEventListener('click', function () {
    var txt = M.listText(lastList, T.title + ' shopping list'), btn = this;
    function done(ok) { btn.textContent = ok ? '✓ Copied' : 'Select the list and copy it'; setTimeout(function () { btn.textContent = '📋 Copy the shopping list'; }, 2500); }
    if (W.navigator.clipboard && W.navigator.clipboard.writeText) W.navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); else done(false);
  });

  // ---------- dates ----------
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function clock(d) { var h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + pad(m) + (h < 12 ? ' a.m.' : ' p.m.'); }
  function dayName(d) { return DAYS[d.getDay()] + ', ' + MONS[d.getMonth()] + ' ' + d.getDate(); }
  function dur(min) { min = Math.round(min); if (min < 60) return min + ' min'; var h = Math.floor(min / 60), m = min % 60; return h + ' hr' + (m ? ' ' + m + ' min' : ''); }
  function addMin(d, m) { return new Date(d.getTime() + m * 60000); }
  function addDays(d, n, h, m) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, h == null ? d.getHours() : h, m || 0); }
  function rnd(d, step) { var s = (step || 15) * 60000; return new Date(Math.floor(d.getTime() / s) * s); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function easter(y) { // Western (Gregorian) Easter Sunday: the anonymous Gregorian algorithm
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da);
  }
  function nextDate(fn) { var y = today().getFullYear(), d = fn(y); return d < today() ? fn(y + 1) : d; }
  function defaultDate() {
    if (T.key === 'christmas') return nextDate(function (y) { return new Date(y, 11, 25); });
    if (T.key === 'easter') return nextDate(easter);
    for (var i = 0; i < T.dates.length; i++) { var p = T.dates[i][0].split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] - 1); if (d >= today()) return d; } // the eve: the reunion dinner
    return addDays(today(), 7, 0);
  }
  function bindInputs(ids, fn) {
    ids.forEach(function (id) {
      var el = $('#' + id); if (!el) return; var k = 'tl_' + id;
      if (st[k] != null && st[k] !== '') el.value = st[k];
      el.addEventListener('change', function () { st[k] = el.value; save(); fn(); });
      if (el.type === 'number') el.addEventListener('input', function () { st[k] = el.value; fn(); });
    });
    var dt = $('#tl-date'); if (dt && !dt.value) dt.value = isoDate(defaultDate());
  }
  function dinnerAt() {
    var dv = ($('#tl-date').value || '').split('-'), tv = ($('#tl-time').value || '17:00').split(':');
    var d = new Date(+dv[0], +dv[1] - 1, +dv[2], +tv[0] || 0, +tv[1] || 0);
    return isNaN(d) ? null : d;
  }
  function render(steps, warn) {
    steps.sort(function (a, b) { return a.t - b.t; });
    lastSteps = steps;
    var h = '', day = '';
    steps.forEach(function (s) {
      var dn = dayName(s.t);
      if (dn !== day) { h += '<li class="fe-day">' + esc(dn) + '</li>'; day = dn; }
      h += '<li class="fe-s ' + s.k + '"><time>' + esc(clock(s.t)) + '</time><span>' + esc(s.txt) + '</span></li>';
    });
    $('#tl-out').innerHTML = h;
    var w = $('#tl-warn'); w.hidden = !warn.length; w.innerHTML = warn.map(esc).join('<br>');
    printout();
  }
  var lastSteps = [];

  // the dishes on the menu, sorted by what they need on the day
  function dayDishes() {
    var o = { oven: [], stove: [], ahead: [], after: [] };
    menu().concat(baked()).forEach(function (id) {
      var d = T.day[id], r = RI[id]; if (!d || !r) return;
      if (d.oven) o.oven.push({ id: id, temp: d.oven[0], min: d.oven[1], last: !!d.last, name: r.n, e: r.e });
      if (d.stove > 0) (d.after_roast ? o.after : o.stove).push({ id: id, min: d.stove, last: !!d.last, name: r.n, e: r.e });
      if (d.ahead) o.ahead.push({ id: id, days: d.ahead, name: r.n, e: r.e });
      if (d.ahead_part) o.ahead.push({ id: id, days: 1, name: r.n, e: r.e, part: d.ahead_part });
    });
    return o;
  }
  function aheadSteps(add, dinner, list) {
    list.forEach(function (a) {
      var d = addDays(dinner, -Math.min(a.days, a.part ? 1 : 2), a.part ? 14 : 10, 0);
      add(d, a.e + ' ' + (a.part ? 'For ' + a.name + ': ' + a.part + '.' : 'Make ' + a.name + ' (keeps up to ' + a.days + (a.days === 1 ? ' day' : ' days') + ').'), 'ahead');
    });
  }

  // ---------- tool: roast (Christmas, Easter) ----------
  function roastPlan() {
    var dinner = dinnerAt(), warn = [], steps = [];
    if (!dinner) { $('#tl-out').innerHTML = '<li>Enter a dinner date and time.</li>'; return; }
    function add(t, txt, k) { steps.push({ t: t, txt: txt, k: k || '' }); }
    var rk = $('#tl-roast').value, R = T.roasts[rk]; if (!R) return;
    var lb = parseFloat($('#tl-lb').value); if (!(lb > 0)) lb = 6; lb = Math.min(25, Math.max(1, lb));
    if (lb < R.lb[0] || lb > R.lb[1]) warn.push('USDA’s times are for ' + R.lb[0] + ' to ' + R.lb[1] + ' lb. Outside that range, start checking the temperature early and often.');
    var lo = lb * R.per_lb[0], hi = lb * R.per_lb[1], rest = R.rest, carve = 10;
    var dd = dayDishes(), recipeName = (RI[R.recipe || rk] || {}).n || R.label;
    // side dishes bake while the roast rests: two racks, working back from dinner
    var racks = [addMin(dinner, -5), addMin(dinner, -5)], placed = [], over = [];
    var out_ = addMin(dinner, -(rest + carve));
    dd.oven.slice().sort(function (a, b) { return (b.last - a.last) || (b.min - a.min); }).forEach(function (o) {
      var ri = racks[0] >= racks[1] ? 0 : 1, end = racks[ri], start = addMin(end, -o.min);
      if (start < out_) { over.push(o); return; }
      racks[ri] = start; placed.push({ o: o, start: start });
    });
    var tIn = rnd(addMin(out_, -hi), 15); out_ = addMin(tIn, hi);
    add(addMin(tIn, -30), 'Heat the oven to ' + R.oven + '°F. Set the ' + recipeName.toLowerCase() + ' on the rack in the roasting pan.', 'roast');
    add(tIn, 'Into the oven. Plan on ' + dur(lo) + ' to ' + dur(hi) + ' (' + R.src + ').', 'roast');
    add(addMin(tIn, Math.max(30, lo - 30)), 'Start checking with a food thermometer in the thickest part, not touching bone. Done is ' + R.done + '.', 'roast');
    if (R.glaze) add(addMin(out_, -R.glaze), 'Uncover, turn the oven to 400°F and brush on the glaze; glaze twice more, 10 minutes apart.', 'roast');
    add(out_, 'Out of the oven by now. Tent it with foil and rest about ' + rest + ' minutes.', 'roast');
    dd.after.forEach(function (s) { add(addMin(out_, 2), s.e + ' ' + s.name + ': make it from the pan drippings while the roast rests (about ' + dur(s.min) + ').', 'stove'); });
    add(addMin(dinner, -carve), 'Carve and plate.', 'roast');
    add(dinner, 'Dinner is served.', 'dinner');
    var temps = placed.map(function (p) { return p.o.temp; }), top = Math.max.apply(null, temps.concat([0]));
    if (placed.length) add(addMin(out_, 1), 'Oven free: turn it to ' + top + '°F for the side dishes.', 'oven');
    placed.forEach(function (p) { add(rnd(p.start, 5), p.o.e + ' ' + p.o.name + ' into the oven' + (p.o.temp < top ? ' (the recipe says ' + p.o.temp + '°F; check it a few minutes early)' : ' at ' + p.o.temp + '°F') + ', about ' + dur(p.o.min) + '.', 'oven'); });
    over.forEach(function (o) {
      var m = Math.round(o.min * (o.temp > R.oven ? 1.3 : 1));
      add(rnd(addMin(out_, -m), 5), o.e + ' ' + o.name + ': it won’t fit in the rest time, so bake it on the lower rack with the roast for its last ' + dur(m) + (o.temp > R.oven ? ' (at ' + R.oven + '°F it takes about a third longer than the recipe’s ' + o.temp + '°F)' : '') + '. Keep it covered until dinner.', 'oven');
    });
    dd.stove.forEach(function (s) { add(rnd(addMin(dinner, -(s.min + 5)), 5), s.e + ' Start ' + s.name + ' on the stove (about ' + dur(s.min) + ').', 'stove'); });
    aheadSteps(add, dinner, dd.ahead);
    add(addMin(dinner, 120), 'Refrigerate the leftovers within 2 hours of dinner, in shallow containers.', 'after');
    render(steps, warn);
  }

  // ---------- Christmas: the cookie-swap planner ----------
  function swapPlan() {
    var el = $('#sw-out'); if (!el) return;
    var n = Math.max(2, Math.min(40, parseInt($('#sw-bakers').value, 10) || 6)), each = parseInt($('#sw-each').value, 10) || 12, extra = $('#sw-extra').checked ? 12 : 0;
    var id = $('#sw-cookie').value, y = T.yield[id] || 24, r = RI[id] || { n: id, e: '' };
    var need = n * each + extra, b = Math.ceil(need / y), make = b * y;
    el.innerHTML = '<p><b>Bake ' + need + ' cookies</b>: ' + n + ' people × ' + each + ' each' + (extra ? ', plus a dozen for the tasting table' : '') + '. That’s <b>' + b + (b === 1 ? ' batch' : ' batches') + '</b> of ' + esc(r.e + ' ' + r.n) + ' (' + make + ' cookies, so ' + (make - need) + ' spare).</p>' +
      '<p>Pack ' + n + ' bags or boxes of ' + each + ', one for each person, yours included. You’ll go home with ' + n * each + ' cookies: ' + each + ' of yours and ' + (n - 1) * each + ' from ' + (n - 1) + (n === 2 ? ' other baker.' : ' other bakers.') + '</p>';
    $('#sw-use').dataset.id = id; $('#sw-use').dataset.b = b;
  }

  // ---------- Easter: the egg plan ----------
  function eggPlan() {
    var el = $('#eg-out'); if (!el) return;
    var dv = ($('#tl-date').value || '').split('-'), e = new Date(+dv[0], +dv[1] - 1, +dv[2]);
    if (isNaN(e)) { el.innerHTML = ''; return; }
    var kids = Math.max(0, parseInt($('#eg-kids').value, 10) || 0), eat = Math.max(0, parseInt($('#eg-eat').value, 10) || 0);
    var cook = addDays(e, -2, 0), hunt = kids * 6, total = eat + hunt;
    el.innerHTML = '<ul>' +
      '<li><b>' + dayName(cook) + ':</b> hard-cook ' + (eat ? eat + ' eggs for eating' : 'your eggs') + (hunt ? ' and ' + hunt + ' for the hunt (about 6 per child), ' + total + ' in all, or ' + Math.ceil(total / 12) + (Math.ceil(total / 12) === 1 ? ' dozen' : ' dozen') : '') + '. Dye them the same day with food-grade dyes and refrigerate them.</li>' +
      '<li><b>' + dayName(e) + ':</b> keep the eggs cold until just before the hunt. Hiding and hunting together should take no more than 2 hours (USDA).</li>' +
      (hunt ? '<li>Keep the hunt eggs separate. FDA advises not eating eggs that were hidden or played with, so plan to eat only the eggs that stayed in the refrigerator, or hunt with plastic eggs.</li>' : '') +
      '<li><b>Eat by ' + dayName(addDays(cook, 7, 0)) + ':</b> hard-cooked eggs keep 1 week in the refrigerator (FDA).</li></ul>';
  }

  // ---------- tool: party (Lunar New Year) ----------
  function partyPlan() {
    var P = T.party, dinner = dinnerAt(), warn = [], steps = [];
    var pg = $('#pp-out');
    var main = $('#pp-role').value === 'main', folders = Math.max(1, parseInt($('#pp-folders').value, 10) || 2), speed = $('#pp-skill').value === 'pro' ? P.fold_per_min : 1;
    var need = Math.ceil(guests * (main ? P.per_main : P.per_feast) / 6) * 6, batchesN = Math.ceil(need / P.filling_batch), packs = Math.ceil(need / P.wrappers_per_pack), mins = Math.ceil(need / (folders * speed));
    pg.innerHTML = '<p><b>' + need + ' dumplings</b> for ' + guests + (guests === 1 ? ' guest' : ' guests') + ' (' + (main ? 'the main dish' : 'one dish of several') + '): ' + batchesN + (batchesN === 1 ? ' batch' : ' batches') + ' of filling (split between pork and vegetable if you like) and ' + packs + (packs === 1 ? ' package' : ' packages') + ' of wrappers. ' +
      'With ' + folders + (folders === 1 ? ' folder' : ' folders') + ', folding takes about ' + dur(mins) + '.</p><p class="hs-small">' + esc(P.note) + '</p>';
    if (need !== partyNeed) { partyNeed = need; shop(); }
    if (!dinner) { $('#tl-out').innerHTML = '<li>Enter a dinner date and time.</li>'; return; }
    function add(t, txt, k) { steps.push({ t: t, txt: txt, k: k || '' }); }
    var dd = dayDishes(), dumps = menu().filter(function (id) { return /dumplings$/.test(id); });
    add(addDays(dinner, -3, 18), 'Shop for everything, and buy a bag of oranges or tangerines for the table.', 'ahead');
    if (dumps.length) {
      var foldStart = rnd(addMin(dinner, -(mins + 75)), 15);
      add(addDays(dinner, -7, 14), 'Optional head start: fold a batch of dumplings and freeze them on floured trays, then bag them. Frozen dumplings cook in 2 to 3 extra minutes.', 'ahead');
      add(addDays(dinner, 0, 11), 'Make the dumpling filling' + (dumps.length > 1 ? 's' : '') + ' and refrigerate. Squeeze the salted cabbage very dry first.', 'ahead');
      add(foldStart, 'Folding party: set out wrappers (under a damp towel), filling, a bowl of water and floured trays. About ' + dur(mins) + ' for ' + need + ' dumplings. Keep the filled trays in the refrigerator if it’s warm.', 'roast');
      add(addMin(dinner, -40), 'Bring a big pot of water to a boil for the dumplings.', 'stove');
      add(addMin(dinner, -25), '🥟 Boil the dumplings in batches (or pan-fry potstickers). Cut one open: the pork filling should reach 160°F.', 'stove');
    }
    dd.stove.filter(function (s) { return !/dumplings$/.test(s.id); }).forEach(function (s) {
      add(rnd(addMin(dinner, -(s.min + (s.last ? 0 : 10))), 5), s.e + ' ' + s.name + ': start about ' + dur(s.min) + ' before dinner' + (s.last ? ', so it comes to the table hot' : '') + '.', 'stove');
    });
    aheadSteps(add, dinner, dd.ahead.filter(function (a) { return !/dumplings$/.test(a.id); }));
    add(dinner, 'Dinner is served. Leave a little fish on the platter for a year of plenty, if your family keeps that custom.', 'dinner');
    add(addMin(dinner, 120), 'Refrigerate the leftovers within 2 hours.', 'after');
    var ny = addDays(dinner, 1, 10);
    add(addDays(ny, 14, 18), 'Lantern Festival, the 15th day of the New Year: a good night for tangyuan.', 'after');
    if (dinner.getHours() < 12) warn.push('The reunion dinner is usually an evening meal.');
    render(steps, warn);
  }

  // ---------- the printout ----------
  function printout() {
    var ids = allIds(), h = '<h1>' + esc(T.title) + '</h1><p>' + guests + (guests === 1 ? ' guest' : ' guests') + ($('#tl-date') && $('#tl-date').value ? ' · ' + esc(dayName(new Date($('#tl-date').value + 'T12:00'))) : '') + '</p>';
    h += '<h2>Menu</h2><ul class="fe-pm">' + ids.map(function (id) { var r = RI[id]; return r ? '<li>' + esc(r.e + ' ' + r.n) + (r.m === 'cookies' ? ' × ' + batches[id] + (batches[id] === 1 ? ' batch' : ' batches') : '') + '</li>' : ''; }).join('') + '</ul>';
    if (lastSteps.length) {
      h += '<h2>Plan</h2><ol class="fe-pt">'; var day = '';
      lastSteps.forEach(function (s) { var dn = dayName(s.t); if (dn !== day) { h += '<li class="fe-day">' + esc(dn) + '</li>'; day = dn; } h += '<li><b>' + esc(clock(s.t)) + '</b> ' + esc(s.txt) + '</li>'; });
      h += '</ol>';
    }
    h += '<h2>Shopping list</h2>';
    var sec = null, sl = '';
    lastList.forEach(function (row) { if (row.section !== sec) { if (sec !== null) sl += '</ul>'; sec = row.section; sl += '<h3>' + esc(data ? C.sectionName(data, sec) : sec) + '</h3><ul>'; } sl += '<li>☐ ' + esc(row.name) + (row.buy ? ' — ' + esc(row.buy) : '') + '</li>'; });
    h += '<div class="fe-ps">' + sl + (sec !== null ? '</ul>' : '') + '</div><p>Refrigerate leftovers within 2 hours. teddyrookbook.com/meal-prep/' + esc(T.key) + '/</p>';
    $('#fe-printout').innerHTML = h;
  }
  $('#fe-print').addEventListener('click', function () { printout(); W.print(); });

  // ---------- wire up the tool ----------
  function tool() { if (TOOL === 'roast') { roastPlan(); eggPlan(); swapPlan(); } else if (TOOL === 'party') partyPlan(); }
  bindInputs(['tl-date', 'tl-time', 'tl-roast', 'tl-lb', 'sw-bakers', 'sw-each', 'sw-cookie', 'eg-kids', 'eg-eat', 'pp-role', 'pp-folders', 'pp-skill'], tool);
  var ex = $('#sw-extra'); if (ex) { if (typeof st.sw_extra === 'boolean') ex.checked = st.sw_extra; ex.addEventListener('change', function () { st.sw_extra = ex.checked; save(); swapPlan(); }); }
  var su = $('#sw-use'); if (su) su.addEventListener('click', function () { setBatch(su.dataset.id, +su.dataset.b); su.textContent = '✓ Added to your baking list'; setTimeout(function () { su.textContent = 'Use this in my shopping list'; }, 2500); });
  var rk = $('#tl-roast');
  function roastFromMenu() { if (!rk || st['tl_tl-roast']) return; var m = menu(); for (var k in T.roasts) if (m.indexOf(T.roasts[k].recipe || k) >= 0 && !T.roasts[k].recipe) { rk.value = k; break; } }
  roastFromMenu();
  boxes.forEach(function (b) { b.addEventListener('change', roastFromMenu); });

  // ---------- start ----------
  $('#fe-g').textContent = guests;
  planLink(); tool(); shop();
  C.load(root.dataset.src, function (err, d) {
    if (err) { $('#fe-shop').innerHTML = '<p class="mp-warn">The recipes didn’t load (' + esc(err.message) + '). Check your connection and reload the page.</p>'; return; }
    data = d; shop(); printout();
  });
})(window, document);
