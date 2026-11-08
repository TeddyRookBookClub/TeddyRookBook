/* Meal Prep: the Thanksgiving dinner page (/meal-prep/thanksgiving/).
   1. Your menu: checkboxes -> one shopping list (model.js shoppingList), copy, print, and "put it in my planner" (?add=id,id,...).
   2. Timeline: dinner time + turkey weight + method + thawing -> a dated plan, working backward with USDA's thawing rates and
      roasting times, then fitting the menu's oven dishes into one oven (two racks) after the turkey comes out.
   Page facts come from <script id="tg-data"> (built from data/meals/recipes/thanksgiving.json). Choices are remembered in
   localStorage ("trb-tday-v1") when the browser allows it; the page works without it. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('mp-tday'); if (!root) return;
  var M = W.MealModel, C = W.MealCommon;
  var $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var T = JSON.parse($('#tg-data').textContent), CO = T.coll, RI = T.r;
  var KEY = 'trb-tday-v1', st = {};
  try { st = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var FULL = { turkey: 1, gravy: 1 }; // courses served as full portions; the rest can be half portions

  // ---------- the menu ----------
  var boxes = $$('#tg-pick input[type=checkbox]');
  if (st.menu && st.menu.length) boxes.forEach(function (b) { b.checked = st.menu.indexOf(b.value) >= 0; });
  var guests = st.g > 0 ? st.g : 10;
  if (typeof st.half === 'boolean') $('#tg-half').checked = st.half;
  function menu() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }); }
  function servingsFor(id) { var c = (RI[id] || {}).c; return FULL[c] || !$('#tg-half').checked ? guests : Math.max(1, Math.round(guests * 0.5 * 2) / 2); }
  var data = null, lastList = [];

  function shop() {
    var ids = menu();
    $('#tg-shopsum').textContent = ids.length ? '(' + ids.length + (ids.length === 1 ? ' dish, ' : ' dishes, ') + guests + (guests === 1 ? ' guest)' : ' guests)') : '';
    if (!data) return;
    if (!ids.length) { $('#tg-shop').innerHTML = '<p class="mp-empty">Check some dishes above to build the list.</p>'; lastList = []; return; }
    var plan = { days: 1, start: C.iso(new Date()), cells: { '0|dinner': ids.filter(function (id) { return data.builtin[id]; }).map(function (id) { return { r: id, x: servingsFor(id) }; }) }, guests: {}, slots: {} };
    var list = M.shoppingList(plan, [{ k: 'adult', n: 0, f: 1 }], data.builtin, data.cat, { sectionOrder: data.sectionOrder });
    lastList = list;
    var h = '', sec = null;
    list.forEach(function (row) {
      if (row.section !== sec) { if (sec !== null) h += '</ul>'; sec = row.section; h += '<h3>' + esc(C.sectionName(data, sec)) + '</h3><ul>'; }
      h += '<li><b>' + esc(row.name) + '</b>' + (row.buy ? ' <span>' + esc(row.buy) + '</span>' : '') + (row.uses && row.uses.length ? '<small>' + esc(row.uses.join(', ')) + '</small>' : '') + '</li>';
    });
    $('#tg-shop').innerHTML = '<div class="tg-shoplist">' + h + (sec !== null ? '</ul>' : '') + '</div>';
  }
  function planLink() { var ids = menu(); $('#tg-plan').href = root.dataset.plan + (ids.length ? '?add=' + ids.join(',') : ''); }
  function turkeys() { return menu().filter(function (id) { return (RI[id] || {}).c === 'turkey'; }); }
  function changed() {
    st.menu = menu(); st.g = guests; st.half = $('#tg-half').checked; save();
    $('#tg-g').textContent = guests;
    $('#tg-twoturkeys').hidden = turkeys().length < 2;
    var t = turkeys()[0]; if (t && CO.methods[t] && !st.methodSet) { $('#tl-method').value = t; }
    planLink(); shop(); timeline();
  }
  boxes.forEach(function (b) { b.addEventListener('change', changed); });
  $('#tg-half').addEventListener('change', changed);
  $('#tg-gm').addEventListener('click', function () { guests = Math.max(1, guests - 1); changed(); });
  $('#tg-gp').addEventListener('click', function () { guests = Math.min(60, guests + 1); changed(); });
  $('#tg-copy').addEventListener('click', function () {
    var txt = M.listText(lastList, 'Thanksgiving shopping list (' + guests + ' guests)'), btn = this;
    function done(ok) { btn.textContent = ok ? '✓ Copied' : 'Select the list and copy it'; setTimeout(function () { btn.textContent = '📋 Copy the shopping list'; }, 2500); }
    if (W.navigator.clipboard && W.navigator.clipboard.writeText) W.navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); else done(false);
  });

  // ---------- timeline ----------
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fourthThursday(y) { var d = new Date(y, 10, 1); var off = (4 - d.getDay() + 7) % 7; return new Date(y, 10, 1 + off + 21); }
  function defaultDate() { var now = new Date(), t = fourthThursday(now.getFullYear()); if (t < new Date(now.getFullYear(), now.getMonth(), now.getDate())) t = fourthThursday(now.getFullYear() + 1); return t; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function clock(d) { var h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + pad(m) + (h < 12 ? ' a.m.' : ' p.m.'); }
  function dayName(d) { return DAYS[d.getDay()] + ', ' + MONS[d.getMonth()] + ' ' + d.getDate(); }
  function dur(min) { min = Math.round(min); if (min < 60) return min + ' min'; var h = Math.floor(min / 60), m = min % 60; return h + ' hr' + (m ? ' ' + m + ' min' : ''); }
  function addMin(d, m) { return new Date(d.getTime() + m * 60000); }
  function rnd(d, step) { step = step || 15; var t = d.getTime(), s = step * 60000; return new Date(Math.floor(t / s) * s); } // round down: start a little early
  function lookup(tab, lb) {
    for (var i = 0; i < tab.length; i++) if (lb <= tab[i][1]) return [tab[i][2] * 60, tab[i][3] * 60];
    var last = tab[tab.length - 1]; return [last[2] * 60, last[3] * 60];
  }
  ['tl-date', 'tl-time', 'tl-lb', 'tl-method', 'tl-thaw'].forEach(function (id) {
    var el = $('#' + id), k = id.slice(3);
    if (st['tl_' + k] != null && st['tl_' + k] !== '') el.value = st['tl_' + k];
    el.addEventListener('change', function () { st['tl_' + k] = el.value; if (k === 'method') st.methodSet = true; save(); timeline(); });
    el.addEventListener('input', function () { if (el.type === 'number') { st['tl_' + k] = el.value; timeline(); } });
  });
  if (!$('#tl-date').value) $('#tl-date').value = isoDate(defaultDate());

  var lastSteps = [];
  function timeline() {
    var out = $('#tl-out'), warn = [];
    var dv = $('#tl-date').value.split('-'), tv = ($('#tl-time').value || '16:00').split(':');
    var dinner = new Date(+dv[0], +dv[1] - 1, +dv[2], +tv[0] || 16, +tv[1] || 0);
    if (isNaN(dinner)) { out.innerHTML = '<li>Enter a dinner date and time.</li>'; return; }
    if (st.tl_lb == null || st.tl_lb === '') $('#tl-lb').value = Math.min(24, Math.max(8, Math.round(guests * 1.25)));
    var lb = parseFloat($('#tl-lb').value); if (!(lb > 0)) lb = 14; lb = Math.min(30, Math.max(3, lb));
    var mk = $('#tl-method').value, me = CO.methods[mk] || CO.methods['classic-roast-turkey'], how = me.how, thaw = $('#tl-thaw').value;
    var steps = [];
    function add(t, txt, k) { steps.push({ t: t, txt: txt, k: k || '' }); }
    // cooking time [low, high] in minutes, and where the numbers come from
    var ct, src;
    if (how === 'roast') { ct = lookup(CO.ru, lb); src = 'USDA’s roasting table'; }
    else if (how === 'stuffed') { ct = lookup(CO.rs, lb); src = 'USDA’s table for stuffed turkeys'; }
    else if (how === 'breast') { var mid = 90 + (Math.min(8, Math.max(4, lb)) - 4) * 26; ct = [mid - 15, mid + 15]; src = 'USDA’s 1½ to 3¼ hours for a 4- to 8-lb breast'; if (lb > 8) warn.push('USDA’s breast times stop at 8 lb; a bigger breast will take longer. Check it early and often.'); }
    else if (how === 'spatchcock') { ct = [lb * 6, lb * 8]; src = 'our estimate for a flattened bird at 425°F'; }
    else if (how === 'smoke') { ct = [lb * 20, lb * 30]; src = 'USDA’s 20 to 30 minutes per pound'; if (lb > 12) warn.push('USDA suggests a turkey of 8 to 12 lb for smoking; a bigger bird takes too long to heat through. Consider roasting it, or smoking two smaller birds.'); }
    else { ct = [lb * 3, lb * 5]; src = 'USDA’s 3 to 5 minutes per pound'; if (lb > 12) warn.push('USDA says a turkey for frying should be 12 lb or less. Pick a smaller bird, or roast this one.'); }
    if ((how === 'roast' || how === 'stuffed') && lb > 24) warn.push('USDA’s table stops at 24 lb. Allow extra time and check the temperature early and often.');
    if (how === 'roast' || how === 'stuffed') { if (lb < 8) warn.push('For a bird under 8 lb, start checking well before the times shown.'); }
    // the oven dishes on the menu
    var ids = menu(), ovenD = [], stoveD = [], ahead = [], afterT = [];
    ids.forEach(function (id) {
      var d = CO.day[id], r = RI[id]; if (!d || !r) return;
      if (d.oven) ovenD.push({ id: id, temp: d.oven[0], min: d.oven[1], last: !!d.last, name: r.n, e: r.e });
      if (d.stove != null && d.stove > 0) (d.after_turkey ? afterT : stoveD).push({ id: id, min: d.stove, name: r.n, e: r.e });
      if (d.ahead) ahead.push({ id: id, days: d.ahead, name: r.n, e: r.e, text: r.a });
      if (d.ahead_part) ahead.push({ id: id, days: 1, name: r.n, e: r.e, part: d.ahead_part });
    });
    var usesOven = !!me.oven, carve = 15, minRest = how === 'fry' || how === 'smoke' ? 20 : 20;
    // fit oven dishes after the turkey comes out: two racks, working back from dinner; rest stretches to 45 min if needed
    function fit(ovenFree) {
      var racks = [addMin(dinner, -5), addMin(dinner, -5)], placed = [], over = [];
      var list = ovenD.slice().sort(function (a, b) { return (b.last - a.last) || (b.min - a.min); });
      list.forEach(function (o) {
        var ri = racks[0] >= racks[1] ? 0 : 1, end = racks[ri], start = addMin(end, -o.min);
        if (ovenFree && start < ovenFree) { over.push(o); return; }
        racks[ri] = start; placed.push({ o: o, start: start, end: end });
      });
      return { placed: placed, over: over };
    }
    var rest = 30, out_ = addMin(dinner, -(rest + carve)), F;
    if (usesOven) {
      F = fit(out_);
      if (F.over.length) { rest = 45; out_ = addMin(dinner, -(rest + carve)); F = fit(out_); }
    } else F = fit(null);
    var tIn = addMin(out_, -ct[1]); tIn = rnd(tIn, 15); out_ = addMin(tIn, ct[1]);
    // the day-of turkey steps
    if (how === 'fry') {
      add(addMin(tIn, -90), 'Set up the fryer outdoors on level ground, well away from the house, decks and trees (never in a garage or under a roof). Fill it to the oil line you marked with water, and set out the grease-rated fire extinguisher.', 'turkey');
      add(addMin(tIn, -50), 'Heat the oil to 350°F, watching the thermometer. Pat the turkey very dry and season it.', 'turkey');
      add(tIn, 'Burner off. Lower the turkey slowly into the oil, then relight and hold about 350°F. Fry ' + dur(ct[0]) + ' to ' + dur(ct[1]) + ' (' + src + '). Stay with the fryer.', 'turkey');
    } else if (how === 'smoke') {
      add(addMin(tIn, -60), 'Light the smoker or grill and bring it to 225 to 300°F. Season the turkey.', 'turkey');
      add(tIn, 'Turkey on the smoker. Plan on ' + dur(ct[0]) + ' to ' + dur(ct[1]) + ' (' + src + '); keep the lid closed and the air at 225 to 300°F.', 'turkey');
    } else {
      add(addMin(tIn, -45), 'Heat the oven to ' + me.oven + '°F. Take out the neck and giblets (if you haven’t), pat the turkey dry, and season it' + (how === 'stuffed' ? '. Mix the stuffing now and stuff the bird loosely, right before it goes in' : '') + '.', 'turkey');
      add(tIn, 'Turkey in the oven at ' + me.oven + '°F. Plan on ' + dur(ct[0]) + ' to ' + dur(ct[1]) + ' (' + src + ').', 'turkey');
    }
    add(addMin(tIn, ct[0] - 30), 'Start checking the turkey with a food thermometer: 165°F in the thickest part of the breast, the innermost thigh and the innermost wing' + (how === 'stuffed' ? ', and 165°F in the center of the stuffing' : '') + '.', 'turkey');
    add(out_, 'Turkey out' + (how === 'fry' ? ' of the oil (burner off first)' : how === 'smoke' ? ' of the smoker' : '') + ' by now. Tent it with foil and let it rest ' + rest + ' minutes (USDA’s minimum is 20). ' + (afterT.length ? 'Make the gravy from the drippings.' : 'Skim the drippings for gravy.'), 'turkey');
    add(addMin(dinner, -carve), 'Carve the turkey' + (how === 'stuffed' ? ' and spoon out the stuffing' : '') + '.', 'turkey');
    add(dinner, 'Dinner is served.', 'dinner');
    // oven dishes
    var temps = {}; F.placed.forEach(function (p) { temps[p.o.temp] = 1; });
    var hi = Math.max.apply(null, Object.keys(temps).map(Number).concat([0]));
    if (F.placed.length && usesOven) add(addMin(out_, 1), 'Oven free: turn it to ' + hi + '°F for the side dishes.', 'oven');
    else if (F.placed.length) { var first = F.placed.reduce(function (a, p) { return p.start < a ? p.start : a; }, F.placed[0].start); add(rnd(addMin(first, -20), 5), 'Heat the oven to ' + hi + '°F for the side dishes.', 'oven'); }
    F.placed.forEach(function (p) {
      var note = p.o.temp < hi ? ' (the recipe says ' + p.o.temp + '°F; check it a few minutes early)' : ' at ' + p.o.temp + '°F';
      add(rnd(p.start, 5), p.o.e + ' ' + p.o.name + ' into the oven' + note + ', about ' + dur(p.o.min) + '.', 'oven');
    });
    F.over.forEach(function (o) {
      var start = rnd(addMin(out_, -Math.round(o.min * 1.33)), 5);
      add(start, o.e + ' ' + o.name + ': no room after the turkey, so bake it on the lower rack with the turkey for its last ' + dur(o.min * 1.33) + ' (at ' + me.oven + '°F it takes about a third longer than the recipe’s ' + o.temp + '°F). Keep it covered until dinner.', 'oven');
    });
    // stovetop dishes finish just before dinner
    stoveD.forEach(function (s) { add(rnd(addMin(dinner, -(s.min + 5)), 5), s.e + ' Start ' + s.name + ' on the stove (about ' + dur(s.min) + ').', 'stove'); });
    afterT.forEach(function (s) { add(addMin(out_, 2), s.e + ' ' + s.name + ': pour off the pan juices and make it while the turkey rests (about ' + dur(s.min) + ').', 'stove'); });
    // brining and thawing (days ahead)
    var brine = me.brine, cookStartPrep = addMin(tIn, -45), thawDone = addMin(cookStartPrep, -60);
    if (brine && thaw === 'water') { warn.push('A turkey thawed in cold water must be cooked right away (USDA), so there’s no time to brine it. Thaw it in the refrigerator if you want to brine.'); brine = null; }
    if (brine === 'dry') {
      var salt = new Date(tIn.getFullYear(), tIn.getMonth(), tIn.getDate() - 2, 19, 0);
      add(salt, 'Dry-brine: salt the thawed turkey and refrigerate it uncovered (anywhere from 1 to 3 days before roasting works).', 'brine');
      thawDone = salt;
    } else if (brine === 'wet') {
      var bStart = addMin(tIn, -18 * 60); bStart = rnd(bStart, 30);
      add(addMin(bStart, -24 * 60), 'Make the brine and chill it overnight in the refrigerator. It must be cold before the turkey goes in.', 'brine');
      add(bStart, 'Brine the thawed turkey in the refrigerator (12 to 24 hours; keep it at 40°F or colder).', 'brine');
      add(addMin(tIn, -3 * 60), 'Lift the turkey out of the brine, throw the brine away, and pat the bird very dry. Refrigerate it uncovered until roasting.', 'brine');
      thawDone = bStart;
    }
    if (how === 'fry') add(new Date(tIn.getFullYear(), tIn.getMonth(), tIn.getDate() - 1, 15, 0), 'Measure the frying oil with water: turkey in the empty pot, cover with water, lift it out and mark the line. Dry the pot and turkey completely.', 'turkey');
    if (thaw === 'fridge') {
      var tdays = Math.ceil(lb / 4), start = rnd(addMin(thawDone, -tdays * 24 * 60), 60);
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), Math.min(start.getHours(), 18), 0);
      add(start, 'Move the frozen turkey to the refrigerator to thaw, in its wrapper on a tray: about ' + tdays + (tdays === 1 ? ' day' : ' days') + ' for ' + lb + ' lb (USDA: about 24 hours per 4 to 5 lb). Buy it before then.', 'thaw');
    } else if (thaw === 'water') {
      var hrs = lb * 0.5, ws = rnd(addMin(cookStartPrep, -hrs * 60 - 15), 15);
      add(ws, 'Start thawing the turkey in cold water, in its wrapper, about ' + dur(hrs * 60) + ' (USDA: 30 minutes per lb). Change the water every 30 minutes and cook it as soon as it’s thawed.', 'thaw');
      if (ws.getHours() < 5) warn.push('Cold-water thawing would have to start in the middle of the night. Start a refrigerator thaw a few days earlier instead.');
    } else {
      var pick = brine === 'dry' ? addMin(thawDone, -6 * 60) : new Date(tIn.getFullYear(), tIn.getMonth(), tIn.getDate() - 2, 12, 0);
      add(pick, 'Pick up the fresh turkey and keep it in the refrigerator (cook a fresh turkey within 1 to 2 days of buying).', 'thaw');
    }
    // make-ahead dishes, the days before
    ahead.forEach(function (a) {
      var d = new Date(dinner.getFullYear(), dinner.getMonth(), dinner.getDate() - Math.min(a.days, a.part ? 1 : 2), a.part ? 14 : 10, 0);
      add(d, a.e + ' ' + (a.part ? 'For ' + a.name + ': ' + a.part + '.' : 'Make ' + a.name + ' (keeps up to ' + a.days + (a.days === 1 ? ' day' : ' days') + ').'), 'ahead');
    });
    add(addMin(dinner, 120), 'Refrigerate the leftovers within 2 hours of dinner, in shallow containers. Save the carcass for stock.', 'after');
    steps.sort(function (a, b) { return a.t - b.t; });
    lastSteps = steps;
    // render, grouped by day
    var h = '', day = '';
    steps.forEach(function (s) {
      var dn = dayName(s.t);
      if (dn !== day) { h += '<li class="tg-day">' + esc(dn) + '</li>'; day = dn; }
      h += '<li class="tg-s ' + s.k + '"><time>' + esc(clock(s.t)) + '</time><span>' + esc(s.txt) + '</span></li>';
    });
    out.innerHTML = h;
    var w = $('#tl-warn'); w.hidden = !warn.length; w.innerHTML = warn.map(esc).join('<br>');
    printout();
  }

  // ---------- the printout (menu card, timeline, shopping list) ----------
  function printout() {
    var ids = menu(), byC = {}, order = [];
    ids.forEach(function (id) { var r = RI[id]; if (!r) return; if (!byC[r.c]) { byC[r.c] = []; order.push(r.c); } byC[r.c].push(r.e + ' ' + r.n); });
    var h = '<h1>Thanksgiving dinner</h1><p>' + guests + (guests === 1 ? ' guest' : ' guests') + ' · ' + esc($('#tl-date').value ? dayName(new Date($('#tl-date').value + 'T12:00')) : '') + '</p>';
    h += '<h2>Menu</h2><ul class="tg-pm">' + order.map(function (c) { return byC[c].map(function (n) { return '<li>' + esc(n) + '</li>'; }).join(''); }).join('') + '</ul>';
    h += '<h2>Timeline</h2><ol class="tg-pt">';
    var day = '';
    lastSteps.forEach(function (s) { var dn = dayName(s.t); if (dn !== day) { h += '<li class="tg-day">' + esc(dn) + '</li>'; day = dn; } h += '<li><b>' + esc(clock(s.t)) + '</b> ' + esc(s.txt) + '</li>'; });
    h += '</ol><h2>Shopping list</h2>';
    var sec = null, sl = '';
    lastList.forEach(function (row) { if (row.section !== sec) { if (sec !== null) sl += '</ul>'; sec = row.section; sl += '<h3>' + esc(data ? C.sectionName(data, sec) : sec) + '</h3><ul>'; } sl += '<li>☐ ' + esc(row.name) + (row.buy ? ' — ' + esc(row.buy) : '') + '</li>'; });
    h += '<div class="tg-ps">' + sl + (sec !== null ? '</ul>' : '') + '</div><p>Done is 165°F in the breast, innermost thigh and innermost wing. Leftovers in the refrigerator within 2 hours. teddyrookbook.com/meal-prep/thanksgiving/</p>';
    $('#tg-printout').innerHTML = h;
  }
  $('#tg-print').addEventListener('click', function () { printout(); W.print(); });

  // ---------- start ----------
  $('#tg-g').textContent = guests;
  $('#tg-twoturkeys').hidden = turkeys().length < 2;
  if (!st.methodSet && turkeys()[0] && CO.methods[turkeys()[0]]) $('#tl-method').value = turkeys()[0];
  planLink(); timeline(); shop();
  C.load(root.dataset.src, function (err, d) {
    if (err) { $('#tg-shop').innerHTML = '<p class="mp-warn">The recipes didn’t load (' + esc(err.message) + '). Check your connection and reload the page.</p>'; return; }
    data = d; shop(); printout();
  });
})(window, document);
