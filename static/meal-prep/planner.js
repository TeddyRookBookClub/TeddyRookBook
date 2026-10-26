/* Meal Prep planner (/meal-prep/plan/). Needs model.js, common.js and pictures.js.
   State lives in localStorage "trb-meals-v1" (see common.js); the math is in model.js.
   Moving meals: drag with a mouse, long-press and drag on a touch screen, or tap (or press Enter on) a recipe
   and then tap (or arrow to and press Enter on) a meal slot. Every chip also has a menu with the same moves. */
(function (W, D) {
  'use strict';
  var M = W.MealModel, C = W.MealCommon, P = W.MealPictures;
  var root = D.getElementById('mp'); if (!root || !M || !C) return;
  var $ = C.$, $$ = C.$$, esc = C.esc;
  var st = C.loadState(), data = null, ALL = {}, undoStack = [];
  var lib = { q: '', f: {}, meal: '' };
  var placing = null; // {kind, r, from:{k,i}, label}

  function plan() { return C.plan(st); }
  function save() { var ok = C.saveState(st); $('#mp-nostore').hidden = ok; return ok; }
  function snapshot() { undoStack.push(JSON.stringify(st)); if (undoStack.length > 30) undoStack.shift(); }
  function undo() { if (!undoStack.length) return; st = C.fix(JSON.parse(undoStack.pop())); refreshRecipes(); save(); renderAll(); msg('Undone.'); }
  var msgT = 0;
  function msg(t, canUndo) {
    var m = $('#mp-msg');
    var host = dlg && dlg.open ? dlg : root; if (m.parentNode !== host) host.appendChild(m);
    m.innerHTML = esc(t) + (canUndo && undoStack.length ? ' <button type="button" class="mp-linkbtn" id="mp-undo">Undo</button>' : '');
    m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(function () { m.classList.remove('on'); }, canUndo ? 7000 : 4000);
  }
  root.addEventListener('click', function (e) { if (e.target.id === 'mp-undo') undo(); });
  function refreshRecipes() { ALL = data ? C.recipes(data, st) : {}; Object.keys(ALL).forEach(function (k) { delete ALL[k]._f; }); }
  function change(what, note, canUndo) { save(); if (what === 'all') renderAll(); else { renderCal(); renderSetupSum(); if (st.view !== 'cal') renderView(); } if (note) msg(note, canUndo); }
  function slotsOn(p) { return M.SLOTS.filter(function (s) { return p.slots[s] !== false; }); }
  function cellName(k) { var x = M.parseKey(k); return C.dayLabel(plan(), x.d, true) + ' ' + C.SLOTNAME[x.s].toLowerCase(); }

  // ---------- plans bar ----------
  function renderPlans() {
    var h = '<div class="mp-plantabs" role="tablist" aria-label="Saved plans">';
    st.plans.forEach(function (p) { h += '<button type="button" role="tab" class="mp-plantab" data-plan="' + p.id + '" aria-selected="' + (p.id === st.cur) + '">' + esc(p.name) + '</button>'; });
    h += '<button type="button" class="mp-plantab add" id="mp-newplan" aria-label="New plan">＋ New plan</button></div>';
    h += '<button type="button" class="hs-btn ghost mp-planmenu" id="mp-planmenu" aria-label="Rename, copy or delete this plan">⋯</button>';
    $('#mp-plans').innerHTML = h;
  }
  $('#mp-plans').addEventListener('click', function (e) {
    var b = e.target.closest('[data-plan]');
    if (b) { st.cur = b.dataset.plan; save(); renderAll(); return; }
    if (e.target.closest('#mp-newplan')) newPlanDialog();
    if (e.target.closest('#mp-planmenu')) planMenu();
  });
  function newPlanDialog() {
    var p0 = plan(), letter = String.fromCharCode(65 + st.plans.length % 26);
    sheet('New plan', '<label class="mp-f">Name <input type="text" id="np-name" value="Week ' + letter + '" maxlength="40"></label>' +
      '<div class="mp-radios"><label><input type="radio" name="np-how" value="blank" checked> Start empty</label><label><input type="radio" name="np-how" value="copy"> Copy “' + esc(p0.name) + '”</label></div>' +
      '<div class="mp-dlgbtns"><button type="button" class="hs-btn pri" id="np-ok">Create plan</button></div>', function (dlg) {
      $('#np-ok', dlg).addEventListener('click', function () {
        var nm = $('#np-name', dlg).value.trim() || 'Plan ' + (st.plans.length + 1), how = $('input[name=np-how]:checked', dlg).value;
        var p = C.newPlan(nm, p0);
        if (how === 'copy') { p.cells = JSON.parse(JSON.stringify(p0.cells)); p.guests = JSON.parse(JSON.stringify(p0.guests)); p.extras = JSON.parse(JSON.stringify(p0.extras)); }
        st.plans.push(p); st.cur = p.id; closeSheet(); save(); renderAll(); msg('Made “' + nm + '”. Switch plans with the tabs at the top.');
      });
      setTimeout(function () { $('#np-name', dlg).select(); }, 30);
    });
  }
  function planMenu() {
    var p = plan();
    sheet('“' + p.name + '”', '<label class="mp-f">Name <input type="text" id="pm-name" value="' + esc(p.name) + '" maxlength="40"></label>' +
      '<div class="mp-dlgbtns"><button type="button" class="hs-btn pri" id="pm-ren">Rename</button><button type="button" class="hs-btn" id="pm-dup">Make a copy</button>' +
      (st.plans.length > 1 ? '<button type="button" class="hs-btn" id="pm-del">Delete this plan</button>' : '') + '<button type="button" class="hs-btn ghost" id="pm-clear">Clear all meals</button></div>' +
      '<p class="hs-small">Keep a few plans and switch between them, like “Week A” and “Week B”, “School weeks” and “Summer”.</p>', function (dlg) {
      $('#pm-ren', dlg).addEventListener('click', function () { p.name = $('#pm-name', dlg).value.trim() || p.name; closeSheet(); save(); renderPlans(); });
      $('#pm-dup', dlg).addEventListener('click', function () { var c = JSON.parse(JSON.stringify(p)); c.id = C.uid('p'); c.name = p.name + ' (copy)'; st.plans.push(c); st.cur = c.id; closeSheet(); save(); renderAll(); msg('Copied. You are now editing “' + c.name + '”.'); });
      var del = $('#pm-del', dlg); if (del) del.addEventListener('click', function () { snapshot(); st.plans = st.plans.filter(function (x) { return x.id !== p.id; }); st.cur = st.plans[0].id; closeSheet(); save(); renderAll(); msg('Deleted “' + p.name + '”.', true); });
      $('#pm-clear', dlg).addEventListener('click', function () { snapshot(); p.cells = {}; p.guests = {}; closeSheet(); change('cal', 'Cleared every meal in “' + p.name + '”.', true); });
    });
  }

  // ---------- settings ----------
  function renderSetup() {
    var p = plan();
    $('#mp-start').value = p.start;
    $('#mp-len').value = String(p.len);
    $('#mp-slots').innerHTML = M.SLOTS.map(function (s) { return '<label class="mp-cb"><input type="checkbox" data-slot="' + s + '"' + (p.slots[s] !== false ? ' checked' : '') + '> ' + C.SLOTNAME[s] + '</label>'; }).join('');
    $('#mp-people').innerHTML = st.people.map(function (g, i) {
      return '<div class="mp-person"><span>' + esc(g.label) + '</span><span class="mp-step"><button type="button" data-pp="' + i + '" data-d="-1" aria-label="One fewer: ' + esc(g.label) + '">−</button><output aria-live="polite">' + g.n + '</output><button type="button" data-pp="' + i + '" data-d="1" aria-label="One more: ' + esc(g.label) + '">＋</button></span></div>';
    }).join('');
    $('#mp-factors').innerHTML = st.people.map(function (g, i) { return '<label class="mp-f mp-fac">' + esc(g.label) + ' <input type="number" min="0.1" max="3" step="0.05" value="' + g.f + '" data-fac="' + i + '"></label>'; }).join('') + '<button type="button" class="mp-linkbtn" id="mp-facreset">Back to the usual sizes</button>';
    $('#mp-avoid').innerHTML = '<span class="mp-cbh">Allergens:</span>' + M.ALLERGENS.map(function (a) { return '<label class="mp-cb"><input type="checkbox" data-avoid="' + a + '"' + (st.avoid.indexOf(a) >= 0 ? ' checked' : '') + '> ' + esc(data ? data.allergenName[a] : a) + '</label>'; }).join('');
    $('#mp-diet').innerHTML = '<span class="mp-cbh">Only:</span>' + [['vegetarian', 'Vegetarian'], ['vegan', 'Vegan'], ['glutenFree', 'Gluten-free'], ['dairyFree', 'Dairy-free']].map(function (d) { return '<label class="mp-cb"><input type="checkbox" data-diet="' + d[0] + '"' + (st.diet[d[0]] ? ' checked' : '') + '> ' + d[1] + '</label>'; }).join('');
    $('#mp-norepeat').value = String(st.rules.noRepeat);
    if (!$('#mp-norepeat').value) $('#mp-norepeat').value = '6';
    $('#mp-makeall').checked = !!st.makeAll;
    $('#mp-busy').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) { return '<label class="mp-cb"><input type="checkbox" data-busy="' + d + '"' + (st.rules.busy.indexOf(d) >= 0 ? ' checked' : '') + '> ' + C.DOW[d] + '</label>'; }).join('');
    renderSetupSum();
  }
  function renderSetupSum() {
    var p = plan(), n = M.householdPeople(st.people), sv = M.householdServings(st.people);
    $('#mp-people-sum').textContent = n + (n === 1 ? ' person' : ' people') + ' · about ' + M.fmtNum(sv) + ' adult-sized portions a meal';
    var av = st.avoid.length ? ' · avoiding ' + st.avoid.length + (st.avoid.length === 1 ? ' allergen' : ' allergens') : '';
    $('#mp-setup-sum').textContent = C.shortDate(C.dateOf(p, 0)) + ' – ' + C.shortDate(C.dateOf(p, p.days - 1)) + ' · ' + n + (n === 1 ? ' person' : ' people') + av;
    if (data) {
      var made = Object.keys(C.made(data, st)).map(function (id) { return data.cat[id].name.replace(/ \(.*\)$/, '').toLowerCase(); });
      $('#mp-make-sum').textContent = made.length ? 'Making at home: ' + made.join(', ') + '.' : 'Buying everything ready-made.';
      var gr = [];
      Object.keys(st.grow.crops).forEach(function (k) { if (st.grow.crops[k].on && data.G.crops[k]) gr.push(C.growName(data, k) + ' (' + C.monthsText(st.grow.crops[k].m) + ')'); });
      ['hens', 'bees'].forEach(function (k) { var a = st.grow.animals[k]; if (a && a.on) gr.push(k === 'hens' ? 'eggs' : 'honey'); });
      $('#mp-grow-sum').textContent = gr.length ? 'You grow: ' + gr.join(', ') + '.' : 'Nothing yet. Tell the planner what you grow and it takes those off the shopping list while they’re in season.';
    }
  }
  var setup = $('#mp-setup');
  setup.addEventListener('change', function (e) {
    var t = e.target, p = plan();
    if (t.id === 'mp-start' && t.value) { p.start = t.value; p.days = C.planDays(p); change('cal'); }
    else if (t.id === 'mp-len') { snapshot(); p.len = t.value === 'month' ? 'month' : +t.value; p.days = C.planDays(p); trimPlan(p); change('cal', t.value === 'month' ? 'The plan runs ' + p.days + ' days, through ' + C.shortDate(C.dateOf(p, p.days - 1)) + '.' : null); }
    else if (t.dataset.slot) { p.slots[t.dataset.slot] = t.checked; change('cal'); }
    else if (t.dataset.fac != null) { var v = +t.value; if (v > 0 && v <= 3) { st.people[+t.dataset.fac].f = v; change('cal'); } }
    else if (t.dataset.avoid) { var a = t.dataset.avoid; st.avoid = st.avoid.filter(function (x) { return x !== a; }); if (t.checked) st.avoid.push(a); save(); renderLib(); renderSetupSum(); warnAvoid(); }
    else if (t.dataset.diet) { st.diet[t.dataset.diet] = t.checked; save(); renderLib(); warnAvoid(); }
    else if (t.id === 'mp-makeall') { st.makeAll = t.checked; save(); renderSetupSum(); if (st.view !== 'cal') renderView(); msg(t.checked ? 'The shopping list now lists ingredients for what you can make at home (bread, tortillas, stock and more). Use “Buy instead” on any of them.' : 'Buying ready-made again, except items you chose to make one by one.'); }
    else if (t.id === 'mp-norepeat') { st.rules.noRepeat = +t.value; save(); renderCal(); }
    else if (t.dataset.busy) { var d = +t.dataset.busy; st.rules.busy = st.rules.busy.filter(function (x) { return x !== d; }); if (t.checked) st.rules.busy.push(d); save(); renderCal(); }
  });
  setup.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pp]');
    if (b) { var g = st.people[+b.dataset.pp]; g.n = Math.max(0, Math.min(20, g.n + +b.dataset.d)); b.parentNode.querySelector('output').textContent = g.n; change('cal'); return; }
    if (e.target.closest('#mp-grow-open')) { if (W.MealViews) W.MealViews.growDialog(api, null); return; }
    if (e.target.id === 'mp-facreset') { st.people.forEach(function (g) { var d = M.DEFAULT_GROUPS.filter(function (x) { return x.k === g.k; })[0]; if (d) g.f = d.f; }); renderSetup(); change('cal'); }
  });
  setup.addEventListener('toggle', function () { try { W.localStorage.setItem('trb-meals-setup', setup.open ? '1' : '0'); } catch (e) { } });
  function trimPlan(p) { Object.keys(p.cells).forEach(function (k) { if (M.parseKey(k).d >= p.days) delete p.cells[k]; }); }
  // meals already in the plan that the new "avoid" settings rule out
  function warnAvoid() {
    var p = plan(), bad = {};
    Object.keys(p.cells).forEach(function (k) { p.cells[k].forEach(function (e) { var r = ALL[e.r]; if (r && !C.allowed(data, st, r)) bad[r.name] = 1; }); });
    var b = Object.keys(bad); if (b.length) msg('Already in the plan and now ruled out: ' + b.join(', ') + '. They are marked ⚠ on the calendar.');
    renderCal();
  }

  // ---------- recipe library ----------
  var FILTERS = [
    ['m:breakfast', 'Breakfast'], ['m:lunch', 'Lunch'], ['m:dinner', 'Dinner'], ['m:side', 'Sides'], ['m:snack', 'Snacks'],
    ['quick', '⚡ Quick'], ['budget', '💲 Budget'], ['kid-friendly', '🧒 Kid-friendly'], ['freezer-friendly', '❄️ Freezer'], ['lunchbox', '🎒 Lunchbox'],
    ['slow-cooker', 'Slow cooker'], ['sheet-pan', 'Sheet pan'], ['one-pot', 'One pot'], ['grill', 'Grill'], ['mine', '⭐ My recipes'], ['garden', '🌱 From my garden']
  ];
  // recipes that use something the household grows, in season (or stored) during this plan
  function fromGarden(r) {
    var p = plan(), cov = C.covers(data, st, p);
    return r.ing.some(function (i) { if (!i.item || i.opt) return false; for (var d = 0; d < p.days; d += 7) if (cov(i.item, d) || cov(i.item, Math.min(p.days - 1, d + 6))) return true; return false; });
  }
  function growsAny() { return Object.keys(st.grow.crops).some(function (k) { return st.grow.crops[k].on; }) || ['hens', 'bees'].some(function (k) { return st.grow.animals[k] && st.grow.animals[k].on; }); }
  function libMatches(r) {
    if (!C.allowed(data, st, r)) return false;
    var f = lib.f, meals = Object.keys(f).filter(function (k) { return f[k] && k.indexOf('m:') === 0; });
    if (meals.length && !meals.some(function (m) { return r.meals.indexOf(m.slice(2)) >= 0; })) return false;
    for (var k in f) {
      if (!f[k] || k.indexOf('m:') === 0) continue;
      if (k === 'mine') { if (!r.own) return false; }
      else if (k === 'garden') { if (!fromGarden(r)) return false; }
      else if (k === 'quick') { if (!M.isQuick(r, 30) && !C.has(r, 'quick')) return false; }
      else if (!C.has(r, k)) return false;
    }
    if (lib.q) {
      var q = lib.q.toLowerCase(), hay = (r.name + ' ' + r.tags.join(' ') + ' ' + r.protein + ' ' + r.ing.map(function (i) { var it = i.item && data.cat[i.item]; return it ? it.name : (i.w && i.w.name) || ''; }).join(' ')).toLowerCase();
      if (q.split(/\s+/).some(function (w) { return w && hay.indexOf(w) < 0; })) return false;
    }
    return true;
  }
  function libItemHTML(r) {
    var bits = [], t = M.totalMinutes(r);
    if (t) bits.push(C.mins(t));
    if (r.own) bits.push('mine');
    if (growsAny() && fromGarden(r)) bits.push('🌱 from your garden');
    return '<li><button type="button" class="mp-rec" data-drag="r" data-r="' + esc(r.id) + '" aria-label="' + esc(r.name) + ': place on the calendar"><span class="mp-emo" aria-hidden="true">' + esc(C.emoji(r)) + '</span><span class="mp-rn">' + esc(r.name) + '<small>' + esc(bits.join(' · ')) + '</small></span></button>' +
      '<button type="button" class="mp-recinfo" data-info="' + esc(r.id) + '" aria-label="About ' + esc(r.name) + '">ⓘ</button></li>';
  }
  function renderLib() {
    if (!data) return;
    $('#mp-fchips').innerHTML = FILTERS.filter(function (f) { return f[0] !== 'garden' || growsAny() || lib.f.garden; }).map(function (f) { return '<button type="button" class="mp-chipf" data-f="' + f[0] + '" aria-pressed="' + !!lib.f[f[0]] + '">' + f[1] + '</button>'; }).join('');
    var list = Object.keys(ALL).map(function (k) { return ALL[k]; }).filter(libMatches);
    var groups = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['side', 'Sides'], ['snack', 'Snacks']], used = {}, h = '';
    if (lib.target) h += '<p class="mp-libtarget">Adding to <b>' + esc(cellName(lib.target)) + '</b> <button type="button" class="mp-linkbtn" id="mp-libtarget-x">cancel</button></p>';
    var mine = list.filter(function (r) { return r.own; });
    if (mine.length && !lib.f.mine) { h += '<h3>⭐ My recipes</h3><ul>' + mine.sort(byName).map(libItemHTML).join('') + '</ul>'; mine.forEach(function (r) { used[r.id] = 1; }); }
    var pref = lib.target ? M.parseKey(lib.target).s : null;
    if (pref === 'snack') pref = 'snack';
    var order = groups.slice(); if (pref) order.sort(function (a, b) { return (b[0] === pref) - (a[0] === pref); });
    order.forEach(function (g) {
      var rs = list.filter(function (r) { return !used[r.id] && r.meals[0] === g[0]; }).sort(byName);
      if (!rs.length) return; rs.forEach(function (r) { used[r.id] = 1; });
      h += '<h3>' + g[1] + '</h3><ul>' + rs.map(libItemHTML).join('') + '</ul>';
    });
    var rest = list.filter(function (r) { return !used[r.id]; });
    if (rest.length) h += '<h3>More</h3><ul>' + rest.sort(byName).map(libItemHTML).join('') + '</ul>';
    if (!list.length) h += '<p class="hs-small">No recipes match. Clear a filter or the search' + (st.avoid.length || Object.keys(st.diet).some(function (k) { return st.diet[k]; }) ? ', or check “Food to avoid” in the plan settings' : '') + '.</p>';
    $('#mp-lib-list').innerHTML = h;
  }
  function byName(a, b) { return a.name.localeCompare(b.name); }
  $('#mp-q').addEventListener('input', function () { lib.q = this.value.trim(); renderLib(); });
  $('#mp-fchips').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; lib.f[b.dataset.f] = !lib.f[b.dataset.f]; renderLib(); });
  $('#mp-lib-list').addEventListener('click', function (e) {
    if (e.target.id === 'mp-libtarget-x') { lib.target = null; renderLib(); return; }
    var info = e.target.closest('[data-info]'); if (info) { recipeInfo(info.dataset.info); return; }
    var b = e.target.closest('.mp-rec'); if (!b || (e.detail && dragJust())) return;
    var r = ALL[b.dataset.r];
    if (lib.target) { addTo(lib.target, r.id); var k = lib.target; lib.target = null; closeLib(); renderLib(); focusCell(k); return; }
    startPlacing({ kind: 'add', r: r.id, label: C.emoji(r) + ' ' + r.name });
  });
  $('#mp-open-lib').addEventListener('click', function () { lib.target = null; renderLib(); openLib(); });
  $('#mp-lib-x').addEventListener('click', function () { lib.target = null; closeLib(); });
  function isPhone() { return W.matchMedia('(max-width: 859px)').matches; }
  function openLib() { root.classList.add('lib-open'); if (isPhone()) { D.body.classList.add('mp-noscroll'); setTimeout(function () { $('#mp-q').focus({ preventScroll: true }); }, 50); } }
  function closeLib() { root.classList.remove('lib-open'); D.body.classList.remove('mp-noscroll'); }
  $('#mp-newrec').addEventListener('click', function () { editRecipe(null); });

  // ---------- calendar ----------
  function chipHTML(k, e, i) {
    var r = ALL[e.r], p = plan();
    if (!r) return '<span class="mp-chip gone">Recipe not found <button type="button" class="mp-linkbtn" data-rm="' + k + '" data-i="' + i + '">remove</button></span>';
    var bad = !C.allowed(data, st, r), sub = [];
    if (e.lo) sub.push('↺ leftovers');
    if (e.full) sub.push('whole recipe');
    var lo = Object.keys(p.cells).some(function (k2) { return p.cells[k2].some(function (x) { return x.lo === k && x.r === e.r; }); });
    if (lo) sub.push('↺ makes leftovers');
    return '<button type="button" class="mp-chip' + (e.lo ? ' lo' : '') + (bad ? ' bad' : '') + '" data-drag="c" data-k="' + k + '" data-i="' + i + '" aria-label="' + esc(r.name + (e.lo ? ' (leftovers)' : '') + ', ' + cellName(k)) + '. Press Enter for options.">' +
      '<span class="mp-emo" aria-hidden="true">' + esc(C.emoji(r)) + '</span><span class="mp-cn">' + (bad ? '⚠ ' : '') + esc(r.name) + (sub.length ? '<small>' + esc(sub.join(' · ')) + '</small>' : '') + '</span></button>';
  }
  function renderCal() {
    if (!data) return;
    var p = plan(), slots = slotsOn(p), weeks = C.weeks(p), h = '', rules = M.checkRules(p, ALL, { noRepeat: st.rules.noRepeat, busy: st.rules.busy, quickMax: 30 }), flag = {};
    rules.forEach(function (x) { flag[x.d + '|' + x.s] = x.why; });
    root.style.setProperty('--mp-slots', slots.length);
    weeks.forEach(function (w) {
      h += '<section class="mp-week" id="mp-w' + w.w + '" aria-label="' + esc(C.weekLabel(p, w)) + '"><div class="mp-weekhead"><h2>' + esc(C.weekLabel(p, w)) + '</h2>' +
        '<button type="button" class="hs-btn ghost mp-wbtn" data-wmenu="' + w.w + '">Week options ⋯</button></div>' +
        '<div class="mp-grid" style="--n:' + slots.length + '"><div class="mp-gh" aria-hidden="true"><span></span>' + slots.map(function (s) { return '<span>' + C.SLOTICON[s] + ' ' + C.SLOTNAME[s] + '</span>'; }).join('') + '</div>';
      for (var d = w.from; d <= w.to; d++) {
        var dt = C.dateOf(p, d), busy = st.rules.busy.indexOf(dt.getDay()) >= 0, today = C.iso(dt) === C.iso(new Date());
        h += '<div class="mp-day' + (today ? ' today' : '') + '" data-day="' + d + '"><div class="mp-dl"><button type="button" class="mp-dbtn" data-dmenu="' + d + '" aria-label="' + esc(C.dayLabel(p, d, true)) + ': day options"><b>' + C.DOW[dt.getDay()] + '</b> <span>' + C.shortDate(dt) + '</span>' + (busy ? '<small title="Busy day: quick dinners">⚡ busy</small>' : '') + '</button></div>';
        slots.forEach(function (s) {
          var k = M.cellKey(d, s), es = p.cells[k] || [], g = p.guests[k] || 0, f = flag[k];
          h += '<div class="mp-cell" data-k="' + k + '" aria-label="' + esc(cellName(k)) + '"><span class="mp-sl">' + C.SLOTNAME[s] + '</span>' + es.map(function (e, i) { return chipHTML(k, e, i); }).join('') +
            (g ? '<span class="mp-guest">' + (g > 0 ? '+' : '') + g + (Math.abs(g) === 1 ? ' person' : ' people') + '</span>' : '') +
            (f ? '<span class="mp-rule" title="' + (f === 'repeat' ? 'Repeats within ' + st.rules.noRepeat + ' days' : 'Busy day: this takes longer than 30 minutes') + '">' + (f === 'repeat' ? '🔁 repeat' : '⏱ long for a busy day') + '</span>' : '') +
            '<button type="button" class="mp-add" data-addk="' + k + '" aria-label="Add a meal to ' + esc(cellName(k)) + '">＋</button></div>';
        });
        h += '</div>';
      }
      h += '</div></section>';
    });
    $('#mp-weeks').innerHTML = h;
    $('#mp-weekjump').innerHTML = weeks.length > 1 ? weeks.map(function (w) { return '<a href="#mp-w' + w.w + '" class="mp-jump">Week ' + (w.w + 1) + '</a>'; }).join('') : '';
    if (placing) markTargets();
  }
  function focusCell(k) { var c = $('.mp-cell[data-k="' + k + '"]'); if (c) { var b = c.querySelector('.mp-chip:last-of-type') || c.querySelector('.mp-add'); if (b) b.focus({ preventScroll: false }); } }
  function addTo(k, r, extra) {
    var p = plan(); snapshot();
    (p.cells[k] = p.cells[k] || []).push(Object.assign({ r: r }, extra || {}));
    change('cal', 'Added ' + ALL[r].name + ' to ' + cellName(k) + '.', true);
  }
  $('#mp-weeks').addEventListener('click', function (e) {
    if (e.detail && dragJust()) return;
    var t = e.target;
    if (placing) { var tc = t.closest(placing.days ? '.mp-day' : '.mp-cell'); if (tc) { e.preventDefault(); placeAt(tc); } return; }
    var add = t.closest('[data-addk]'); if (add) { lib.target = add.dataset.addk; renderLib(); openLib(); if (!isPhone()) $('#mp-q').focus(); return; }
    var chip = t.closest('.mp-chip[data-k]'); if (chip) { chipMenu(chip.dataset.k, +chip.dataset.i); return; }
    var rm = t.closest('[data-rm]'); if (rm) { var p = plan(); p.cells[rm.dataset.rm].splice(+rm.dataset.i, 1); change('cal'); return; }
    var dm = t.closest('[data-dmenu]'); if (dm) { dayMenu(+dm.dataset.dmenu); return; }
    var wm = t.closest('[data-wmenu]'); if (wm) { weekMenu(+wm.dataset.wmenu); }
  });
  $('#mp-weeks').addEventListener('keydown', function (e) {
    var chip = e.target.closest('.mp-chip[data-k]');
    if (chip && !placing && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); removeEntry(chip.dataset.k, +chip.dataset.i); }
  });
  function removeEntry(k, i) {
    var p = plan(), e = p.cells[k][i], r = ALL[e.r]; snapshot();
    p.cells[k].splice(i, 1); if (!p.cells[k].length) delete p.cells[k];
    // leftovers that depended on it become ordinary meals (they still need cooking)
    if (!e.lo) Object.keys(p.cells).forEach(function (k2) { p.cells[k2].forEach(function (x) { if (x.lo === k && x.r === e.r) delete x.lo; }); });
    change('cal', 'Removed ' + (r ? r.name : 'the meal') + '.', true);
  }

  // ---------- menus ----------
  function chipMenu(k, i) {
    var p = plan(), e = p.cells[k][i], r = ALL[e.r]; if (!r) return;
    var x = M.parseKey(k), sv = M.cellServings(p, k, st.people) + (+e.x || 0), g = p.guests[k] || 0;
    var next = x.d + 1 < p.days ? M.cellKey(x.d + 1, 'lunch') : null, hasLunch = p.slots.lunch !== false;
    var url = C.recipeURL(data, r);
    var h = '<p class="mp-dlgsub">' + esc(cellName(k)) + (e.lo ? ' · leftovers' : '') + '</p>';
    h += '<div class="mp-dlgrow"><span>People at this meal</span><span class="mp-step"><button type="button" id="cm-gm" aria-label="One fewer person">−</button><output id="cm-g">' + (g > 0 ? '+' : '') + g + '</output><button type="button" id="cm-gp" aria-label="One more person">＋</button></span></div>';
    h += '<p class="hs-small" id="cm-sv">' + svText(p, k, e, r) + '</p>';
    if (!e.lo) h += '<label class="mp-cb"><input type="checkbox" id="cm-full"' + (e.full ? ' checked' : '') + '> Cook the whole recipe (makes ' + r.servings + '), extra for the freezer or another day</label>';
    h += '<div class="mp-dlgbtns mp-col">';
    if (!e.lo && next && hasLunch) h += '<button type="button" class="hs-btn" id="cm-lo">↺ Cook extra for tomorrow’s lunch</button>';
    if (!e.lo) h += '<button type="button" class="hs-btn" id="cm-lo2">↺ Leftovers for another meal…</button>';
    h += '<button type="button" class="hs-btn" id="cm-move">↔ Move…</button><button type="button" class="hs-btn" id="cm-copy">⧉ Copy to…</button><button type="button" class="hs-btn" id="cm-swap">⇄ Swap with another meal…</button>';
    h += url ? '<a class="hs-btn" href="' + esc(url) + '">📖 Open the recipe</a>' : '<button type="button" class="hs-btn" id="cm-edit">✏️ Edit my recipe</button>';
    h += '<button type="button" class="hs-btn" id="cm-rm">🗑 Remove</button></div>';
    sheet(C.emoji(r) + ' ' + r.name, h, function (dlg) {
      function setG(d) { snapshot(); var n = Math.max(-20, Math.min(30, (p.guests[k] || 0) + d)); if (n) p.guests[k] = n; else delete p.guests[k]; $('#cm-g', dlg).textContent = (n > 0 ? '+' : '') + n; $('#cm-sv', dlg).innerHTML = svText(p, k, e, r); save(); renderCal(); }
      $('#cm-gm', dlg).addEventListener('click', function () { setG(-1); });
      $('#cm-gp', dlg).addEventListener('click', function () { setG(1); });
      var full = $('#cm-full', dlg); if (full) full.addEventListener('change', function () { if (full.checked) e.full = true; else delete e.full; $('#cm-sv', dlg).innerHTML = svText(p, k, e, r); save(); renderCal(); });
      var lo = $('#cm-lo', dlg); if (lo) lo.addEventListener('click', function () { snapshot(); p.cells = M.addLeftovers(p, k, e.r, next); closeSheet(); change('cal', 'Cooking extra ' + r.name + ' on ' + C.dayLabel(p, x.d, true) + ' for ' + cellName(next) + '.', true); });
      var lo2 = $('#cm-lo2', dlg); if (lo2) lo2.addEventListener('click', function () { closeSheet(); startPlacing({ kind: 'lo', r: e.r, from: { k: k, i: i }, label: 'leftovers of ' + r.name }); });
      $('#cm-move', dlg).addEventListener('click', function () { closeSheet(); startPlacing({ kind: 'move', r: e.r, from: { k: k, i: i }, label: r.name, once: true }); });
      $('#cm-copy', dlg).addEventListener('click', function () { closeSheet(); startPlacing({ kind: 'copy', r: e.r, from: { k: k, i: i }, label: r.name }); });
      $('#cm-swap', dlg).addEventListener('click', function () { closeSheet(); startPlacing({ kind: 'swap', r: e.r, from: { k: k, i: i }, label: r.name, once: true }); });
      var ed = $('#cm-edit', dlg); if (ed) ed.addEventListener('click', function () { closeSheet(); editRecipe(r.id); });
      $('#cm-rm', dlg).addEventListener('click', function () { closeSheet(); removeEntry(k, i); });
    });
  }
  function svText(p, k, e, r) {
    var sv = M.cellServings(p, k, st.people) + (+e.x || 0);
    if (e.lo) return 'Eaten as leftovers by about ' + M.fmtNum(sv) + ' adult-sized portions (cooked with the meal it comes from).';
    var cooks = M.cookings(p, st.people, 0, p.days - 1, ALL).filter(function (c) { return c.key === k && c.r === e.r; })[0], tot = cooks ? cooks.servings : sv;
    return 'Cooking ' + M.fmtNum(tot) + ' adult-sized portions' + (tot > sv + 0.01 ? ' (' + M.fmtNum(sv) + ' now, ' + M.fmtNum(tot - sv) + ' for later)' : '') + '. The recipe makes ' + r.servings + ', so it’s scaled ×' + M.fmtNum(Math.round(tot / r.servings * 100) / 100) + '.';
  }
  function dayMenu(d) {
    var p = plan();
    sheet(C.dayLabel(p, d, true), '<div class="mp-dlgbtns mp-col"><button type="button" class="hs-btn" id="dm-copy">⧉ Copy this day to…</button><button type="button" class="hs-btn" id="dm-swap">⇄ Swap with another day…</button><button type="button" class="hs-btn" id="dm-shop">🛒 Shopping list for this day</button><button type="button" class="hs-btn" id="dm-clear">🗑 Clear this day</button></div>', function (dlg) {
      $('#dm-copy', dlg).addEventListener('click', function () { closeSheet(); startPlacing({ kind: 'copyday', d: d, days: true, label: C.dayLabel(p, d, true) + '’s meals' }); });
      $('#dm-swap', dlg).addEventListener('click', function () { closeSheet(); startPlacing({ kind: 'swapday', d: d, days: true, once: true, label: C.dayLabel(p, d, true) }); });
      $('#dm-shop', dlg).addEventListener('click', function () { closeSheet(); st.shopRange = 'd' + d; setView('shop'); });
      $('#dm-clear', dlg).addEventListener('click', function () { snapshot(); M.SLOTS.forEach(function (s) { delete p.cells[M.cellKey(d, s)]; delete p.guests[M.cellKey(d, s)]; }); closeSheet(); change('cal', 'Cleared ' + C.dayLabel(p, d, true) + '.', true); });
    });
  }
  function weekMenu(w) {
    var p = plan(), weeks = C.weeks(p), wk = weeks[w];
    var others = weeks.filter(function (x) { return x.w !== w; });
    var h = '<div class="mp-dlgbtns mp-col"><button type="button" class="hs-btn" id="wm-shuf">🔀 Shuffle this week…</button>';
    if (others.length) h += '<div class="mp-dlgrow"><label class="mp-f">Copy this week to <select id="wm-to">' + others.map(function (x) { return '<option value="' + x.w + '">Week ' + (x.w + 1) + '</option>'; }).join('') + (others.length > 1 ? '<option value="all">every other week</option>' : '') + '</select></label><button type="button" class="hs-btn" id="wm-copy">Copy</button></div>';
    h += '<button type="button" class="hs-btn" id="wm-shop">🛒 Shopping list for this week</button><button type="button" class="hs-btn" id="wm-prep">🔪 Prep day for this week</button><button type="button" class="hs-btn" id="wm-clear">🗑 Clear this week</button></div>';
    sheet(C.weekLabel(p, wk), h, function (dlg) {
      $('#wm-shuf', dlg).addEventListener('click', function () { closeSheet(); shuffleDialog(w); });
      var cp = $('#wm-copy', dlg); if (cp) cp.addEventListener('click', function () {
        snapshot(); var to = $('#wm-to', dlg).value, targets = to === 'all' ? others.map(function (x) { return x.w; }) : [+to];
        targets.forEach(function (t) { p.cells = M.copyWeek(p, w, t); });
        closeSheet(); change('cal', 'Copied week ' + (w + 1) + ' to ' + (to === 'all' ? 'every other week' : 'week ' + (+to + 1)) + '.', true);
      });
      $('#wm-shop', dlg).addEventListener('click', function () { closeSheet(); st.shopRange = 'w' + w; setView('shop'); });
      $('#wm-prep', dlg).addEventListener('click', function () { closeSheet(); st.prepWeek = w; setView('prep'); });
      $('#wm-clear', dlg).addEventListener('click', function () { snapshot(); for (var d = wk.from; d <= wk.to; d++) M.SLOTS.forEach(function (s) { delete p.cells[M.cellKey(d, s)]; delete p.guests[M.cellKey(d, s)]; }); closeSheet(); change('cal', 'Cleared week ' + (w + 1) + '.', true); });
    });
  }

  // ---------- placing (tap, keyboard, and the menus' Move / Copy / Swap) ----------
  function startPlacing(o) {
    placing = o; closeLib();
    var verb = { add: 'Tap a meal slot to add ', move: 'Tap where to move ', copy: 'Tap each meal slot to copy ', swap: 'Tap the meal to swap with ', lo: 'Tap the meal for ', copyday: 'Tap each day to copy ', swapday: 'Tap the day to swap with ' }[o.kind];
    $('#mp-placetxt').textContent = verb + o.label + (o.kind === 'add' ? ' (as many as you like)' : '') + '.';
    $('#mp-placebar').hidden = false;
    root.classList.add('placing'); markTargets();
    var first = o.from ? $('.mp-cell[data-k="' + o.from.k + '"]') : o.days ? $('.mp-day[data-day="' + o.d + '"]') : $('.mp-cell');
    if (first) first.focus({ preventScroll: !!(o.from || o.days) });
  }
  function markTargets() {
    $$('.mp-cell, .mp-day').forEach(function (c) { c.removeAttribute('tabindex'); c.classList.remove('target', 'src'); c.removeAttribute('role'); });
    if (!placing) return;
    $$(placing.days ? '.mp-day' : '.mp-cell').forEach(function (c) {
      c.classList.add('target'); c.tabIndex = 0; c.setAttribute('role', 'button');
      if (placing.from && c.dataset.k === placing.from.k) c.classList.add('src');
      if (placing.days && +c.dataset.day === placing.d) c.classList.add('src');
    });
  }
  function stopPlacing() { placing = null; $('#mp-placebar').hidden = true; root.classList.remove('placing'); markTargets(); }
  $('#mp-placedone').addEventListener('click', stopPlacing);
  function placeAt(el) {
    var o = placing, p = plan(); if (!o) return;
    if (o.days) {
      var d = +el.dataset.day; if (d === o.d) return;
      snapshot();
      if (o.kind === 'copyday') { p.cells = M.copyDay(p, o.d, d); msg('Copied to ' + C.dayLabel(p, d, true) + '.', true); }
      else { var sw = M.swapDays(p, o.d, d); p.cells = sw.cells; p.guests = sw.guests; msg('Swapped ' + C.dayLabel(p, o.d, true) + ' and ' + C.dayLabel(p, d, true) + '.', true); }
    } else {
      var k = el.dataset.k;
      if (o.from && k === o.from.k && o.kind !== 'add') { if (o.once) stopPlacing(); return; }
      snapshot();
      if (o.kind === 'add') { (p.cells[k] = p.cells[k] || []).push({ r: o.r }); msg('Added ' + ALL[o.r].name + ' to ' + cellName(k) + '.', true); }
      else if (o.kind === 'move' || o.kind === 'copy') { p.cells = M.moveEntry(p, o.from.k, o.from.i, k, o.kind === 'copy'); msg((o.kind === 'move' ? 'Moved to ' : 'Copied to ') + cellName(k) + '.', true); }
      else if (o.kind === 'lo') { p.cells = M.addLeftovers(p, o.from.k, o.r, k); msg('Leftovers of ' + ALL[o.r].name + ' for ' + cellName(k) + '.', true); }
      else if (o.kind === 'swap') {
        var a = p.cells[o.from.k] || [], b = p.cells[k] || [];
        if (b.length) p.cells[o.from.k] = b; else delete p.cells[o.from.k];
        p.cells[k] = a; msg('Swapped ' + cellName(o.from.k) + ' and ' + cellName(k) + '.', true);
      }
    }
    save(); var focusK = el.dataset.k, focusD = el.dataset.day;
    if (o.once) stopPlacing();
    renderCal(); renderSetupSum();
    var again = focusK ? $('.mp-cell[data-k="' + focusK + '"]') : $('.mp-day[data-day="' + focusD + '"]');
    if (again) { if (placing) again.focus({ preventScroll: true }); else focusCell(focusK || ''); }
  }
  // arrow keys move between targets in placing mode; Enter or Space places; Escape stops
  D.addEventListener('keydown', function (e) {
    if (!placing) return;
    if (e.key === 'Escape') { stopPlacing(); msg('Stopped.'); return; }
    var el = D.activeElement; if (!el || !el.classList || !el.classList.contains('target')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); placeAt(el); return; }
    var p = plan(), slots = slotsOn(p), tgt = null;
    if (placing.days) {
      var d = +el.dataset.day;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') tgt = $('.mp-day[data-day="' + Math.min(p.days - 1, d + 1) + '"]');
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') tgt = $('.mp-day[data-day="' + Math.max(0, d - 1) + '"]');
    } else {
      var x = M.parseKey(el.dataset.k), si = slots.indexOf(x.s);
      if (e.key === 'ArrowRight') tgt = si < slots.length - 1 ? M.cellKey(x.d, slots[si + 1]) : x.d < p.days - 1 ? M.cellKey(x.d + 1, slots[0]) : null;
      if (e.key === 'ArrowLeft') tgt = si > 0 ? M.cellKey(x.d, slots[si - 1]) : x.d > 0 ? M.cellKey(x.d - 1, slots[slots.length - 1]) : null;
      if (e.key === 'ArrowDown') tgt = x.d < p.days - 1 ? M.cellKey(x.d + 1, x.s) : null;
      if (e.key === 'ArrowUp') tgt = x.d > 0 ? M.cellKey(x.d - 1, x.s) : null;
      if (tgt) tgt = $('.mp-cell[data-k="' + tgt + '"]');
    }
    if (tgt) { e.preventDefault(); tgt.focus(); }
  });

  // ---------- drag and drop (mouse, pen and touch) ----------
  var drag = null, justDragged = false;
  function dragJust() { return justDragged; }
  root.addEventListener('pointerdown', function (e) {
    var src = e.target.closest('[data-drag]'); if (!src || e.button > 0 || placing) return;
    var touch = e.pointerType === 'touch';
    drag = { src: src, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, touch: touch, on: false, timer: 0 };
    if (touch) drag.timer = setTimeout(function () { if (drag && !drag.on) begin(); }, 320);
  });
  W.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.x = e.clientX; drag.y = e.clientY;
    var dist = Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0);
    if (!drag.on) {
      if (drag.touch) { if (dist > 10) { clearTimeout(drag.timer); drag = null; } return; }
      if (dist > 6) begin(); else return;
    }
    e.preventDefault(); moveGhost();
  }, { passive: false });
  // while dragging on a touch screen, don't let the page scroll
  D.addEventListener('touchmove', function (e) { if (drag && drag.on) e.preventDefault(); }, { passive: false });
  root.addEventListener('contextmenu', function (e) { if (drag || e.target.closest('[data-drag]') && e.pointerType !== 'mouse' && W.matchMedia('(pointer: coarse)').matches) e.preventDefault(); });
  W.addEventListener('pointerup', function (e) { if (!drag || e.pointerId !== drag.id) return; clearTimeout(drag.timer); if (drag.on) finish(e); drag = null; });
  W.addEventListener('pointercancel', function (e) { if (!drag || e.pointerId !== drag.id) return; clearTimeout(drag.timer); if (drag.on) cancelDrag(); drag = null; });
  function begin() {
    var s = drag.src; drag.on = true;
    if (navigator.vibrate && drag.touch) try { navigator.vibrate(12); } catch (e) { }
    var g = D.createElement('div'); g.className = 'mp-ghost'; g.innerHTML = s.innerHTML; g.setAttribute('aria-hidden', 'true'); D.body.appendChild(g); drag.ghost = g;
    drag.kind = s.dataset.drag; drag.r = s.dataset.r; drag.k = s.dataset.k; drag.i = +s.dataset.i;
    root.classList.add('dragging'); D.body.classList.add('mp-dragging');
    if (drag.kind === 'c') $('#mp-trash').hidden = false;
    if (isPhone()) closeLib();
    moveGhost(); autoScroll();
  }
  function moveGhost() {
    if (!drag || !drag.ghost) return;
    drag.ghost.style.transform = 'translate(' + (drag.x + 8) + 'px,' + (drag.y - (drag.touch ? 54 : 10)) + 'px)';
    var el = D.elementFromPoint(drag.x, drag.y), c = el && (el.closest('.mp-cell') || el.closest('#mp-trash'));
    if (drag.over && drag.over !== c) drag.over.classList.remove('over');
    drag.over = c; if (c) c.classList.add('over');
  }
  function autoScroll() {
    if (!drag || !drag.on) return;
    var h = W.innerHeight, edge = 70, dy = 0;
    if (drag.y < edge) dy = -Math.ceil((edge - drag.y) / 4); else if (drag.y > h - edge) dy = Math.ceil((drag.y - (h - edge)) / 4);
    if (dy) { W.scrollBy(0, dy); moveGhost(); }
    W.requestAnimationFrame(autoScroll);
  }
  function endDragUI() {
    if (drag.ghost) drag.ghost.remove(); if (drag.over) drag.over.classList.remove('over');
    root.classList.remove('dragging'); D.body.classList.remove('mp-dragging'); $('#mp-trash').hidden = true; justDragged = true; setTimeout(function () { justDragged = false; }, 0);
  }
  function cancelDrag() { endDragUI(); }
  function finish(e) {
    var over = drag.over, p = plan(); endDragUI();
    if (!over) return;
    if (over.id === 'mp-trash') { if (drag.kind === 'c') removeEntry(drag.k, drag.i); return; }
    var k = over.dataset.k;
    if (drag.kind === 'r') { addTo(k, drag.r); return; }
    if (k === drag.k) return;
    var copy = e.ctrlKey || e.altKey || e.metaKey;
    snapshot(); p.cells = M.moveEntry(p, drag.k, drag.i, k, copy);
    change('cal', (copy ? 'Copied to ' : 'Moved to ') + cellName(k) + '.', true);
  }
  D.addEventListener('click', function (e) { if (e.detail && dragJust() && e.target.closest && e.target.closest('[data-drag]')) { e.preventDefault(); e.stopPropagation(); } }, true);

  // ---------- dialogs ----------
  var dlg = null, dlgReturn = null;
  function sheet(title, html, mount, cls) {
    if (!dlg) {
      dlg = D.createElement('dialog'); dlg.className = 'mp-dlg'; dlg.setAttribute('aria-labelledby', 'mp-dlgt');
      root.appendChild(dlg);
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.mp-dlgx')) closeSheet(); });
      dlg.addEventListener('close', function () { var ae = D.activeElement; if (!placing && dlgReturn && dlgReturn.isConnected && (!ae || ae === D.body || dlg.contains(ae))) dlgReturn.focus({ preventScroll: true }); });
    }
    dlgReturn = D.activeElement;
    dlg.className = 'mp-dlg' + (cls ? ' ' + cls : '');
    dlg.innerHTML = '<div class="mp-dlgin"><div class="mp-dlghead"><h2 id="mp-dlgt">' + esc(title) + '</h2><button type="button" class="mp-dlgx" aria-label="Close">✕</button></div><div class="mp-dlgbody">' + html + '</div></div>';
    if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } }
    if (mount) mount(dlg);
    var f = dlg.querySelector('.mp-dlgbody button, .mp-dlgbody input, .mp-dlgbody select, .mp-dlgbody a'); if (f && !f.matches('input[type=text]')) f.focus({ preventScroll: true });
    return dlg;
  }
  function closeSheet() { if (dlg && dlg.open) { try { dlg.close(); } catch (e) { dlg.removeAttribute('open'); } } }
  W.MealPlannerUI = { sheet: sheet, closeSheet: closeSheet };

  function recipeInfo(id) {
    var r = ALL[id]; if (!r) return;
    var f = C.flags(data, r), rn = M.recipeNutrition(r, C.cat(data, st)), url = C.recipeURL(data, r);
    var h = '<p class="mp-dlgsub">' + esc(r.intro || '') + '</p><p class="hs-small">Makes ' + r.servings + (r.size ? ' (' + esc(r.size) + ' each)' : '') + (M.totalMinutes(r) ? ' · ' + C.mins(M.totalMinutes(r)) : '') + (f.allergens.length ? ' · Contains: ' + f.allergens.map(function (a) { return data.allergenName[a] || a; }).join(', ') : '') + '</p>';
    if (rn.status === 'none') h += '<p class="mp-pending">Nutrition coming: the USDA numbers for these ingredients haven’t been added yet.</p>';
    else h += '<p class="hs-small">About <b>' + Math.round(rn.n.kcal) + ' calories</b> a serving' + (rn.status === 'partial' ? ' (not counting ' + esc(rn.missing.join(', ')) + ')' : '') + '. An estimate from USDA data.</p>';
    h += '<ul class="mp-inglist">' + M.scaleRecipe(r, r.servings, data.cat).map(function (x) { return '<li>' + C.ingLine(x) + '</li>'; }).join('') + '</ul>';
    h += '<div class="mp-dlgbtns"><button type="button" class="hs-btn pri" id="ri-place">Place on the calendar</button>' + (url ? '<a class="hs-btn" href="' + esc(url) + '">📖 Full recipe</a>' : '') + '<button type="button" class="hs-btn" id="ri-edit">' + (r.own ? '✏️ Edit' : '⧉ Make my own version') + '</button></div>';
    sheet(C.emoji(r) + ' ' + r.name, h, function (d) {
      $('#ri-place', d).addEventListener('click', function () { closeSheet(); if (lib.target) { addTo(lib.target, r.id); lib.target = null; closeLib(); renderLib(); } else startPlacing({ kind: 'add', r: r.id, label: C.emoji(r) + ' ' + r.name }); });
      $('#ri-edit', d).addEventListener('click', function () { closeSheet(); editRecipe(r.own ? r.id : null, r.own ? null : r); });
    });
  }

  // ---------- shuffle ----------
  $('#mp-shuffle').addEventListener('click', function () { shuffleDialog(null); });
  function shuffleDialog(w) {
    var p = plan(), weeks = C.weeks(p), slots = slotsOn(p);
    var h = '<label class="mp-f">Shuffle <select id="sh-scope">' + weeks.map(function (x) { return '<option value="' + x.w + '"' + (w === x.w ? ' selected' : '') + '>Week ' + (x.w + 1) + '</option>'; }).join('') + '<option value="all"' + (w == null && weeks.length > 1 ? ' selected' : '') + '>The whole plan</option></select></label>' +
      '<div class="mp-radios"><label><input type="radio" name="sh-how" value="fill" checked> Fill the empty slots only</label><label><input type="radio" name="sh-how" value="all"> Replace everything (leftovers stay)</label></div>' +
      '<div class="mp-f"><span>Meals to fill</span><div class="mp-checks">' + slots.map(function (s) { return '<label class="mp-cb"><input type="checkbox" data-shs="' + s + '"' + (s === 'dinner' || (s === 'breakfast') ? ' checked' : '') + '> ' + C.SLOTNAME[s] + '</label>'; }).join('') + '</div></div>' +
      '<label class="mp-cb"><input type="checkbox" id="sh-lib"' + (Object.keys(lib.f).some(function (k) { return lib.f[k]; }) ? ' checked' : '') + '> Only recipes that match the library filters</label>' +
      '<p class="hs-small">Rules (in Plan settings): no repeats within ' + (st.rules.noRepeat || 'any number of') + ' days' + (st.rules.busy.length ? '; quick dinners on ' + st.rules.busy.slice().sort().map(function (d) { return C.DOWL[d]; }).join(', ') : '') + '. Food to avoid is always left out.</p>' +
      '<div class="mp-dlgbtns"><button type="button" class="hs-btn pri" id="sh-go">🔀 Shuffle</button></div>';
    sheet('Shuffle meals', h, function (d) {
      $('#sh-go', d).addEventListener('click', function () {
        var sc = $('#sh-scope', d).value, from = 0, to = p.days - 1;
        if (sc !== 'all') { var wk = weeks[+sc]; from = wk.from; to = wk.to; }
        var useLib = $('#sh-lib', d).checked, pool = {};
        var picked = $$('[data-shs]', d).filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.shs; });
        if (!picked.length) { msg('Pick at least one meal to fill.'); return; }
        picked.forEach(function (s) { pool[s] = Object.keys(ALL).filter(function (id) { var r = ALL[id]; return r.meals.indexOf(s) >= 0 && C.allowed(data, st, r) && (!useLib || libMatches(r)); }); });
        var empty = picked.filter(function (s) { return !pool[s].length; });
        snapshot();
        p.cells = M.shuffle(p, { slots: picked, pool: pool, recipes: ALL, noRepeat: st.rules.noRepeat, busy: st.rules.busy, quickMax: 30, fillOnly: $('input[name=sh-how]:checked', d).value === 'fill', from: from, to: to, seed: Date.now() & 0xffffffff });
        closeSheet(); change('cal', 'Shuffled ' + (sc === 'all' ? 'the whole plan' : 'week ' + (+sc + 1)) + '.' + (empty.length ? ' No recipes fit for ' + empty.map(function (s) { return C.SLOTNAME[s].toLowerCase(); }).join(' or ') + '.' : ''), true);
      });
    });
  }

  // ---------- views ----------
  function setView(v) {
    st.view = v; save(); $('#mp-msg').classList.remove('on');
    $$('#mp-tabs [role=tab]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.v === v); b.tabIndex = b.dataset.v === v ? 0 : -1; });
    ['cal', 'shop', 'nutr', 'prep', 'kids', 'grow'].forEach(function (x) { $('#mp-' + x).hidden = x !== v; });
    if (v !== 'cal') { stopPlacing(); closeLib(); }
    renderView();
  }
  $('#mp-tabs').addEventListener('click', function (e) { var b = e.target.closest('[role=tab]'); if (b) setView(b.dataset.v); });
  $('#mp-tabs').addEventListener('keydown', function (e) {
    var tabs = $$('#mp-tabs [role=tab]'), i = tabs.indexOf(D.activeElement); if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); setView(n.dataset.v); }
  });
  function renderView() {
    if (!data) return;
    var v = st.view, V = W.MealViews;
    if (v === 'cal') return;
    if (V && V[v]) V[v]($('#mp-' + v), api);
  }
  function renderAll() {
    if (!data) return;
    refreshRecipes(); renderPlans(); renderSetup(); renderLib(); renderCal(); setView(st.view || 'cal');
  }
  $('#mp-export').addEventListener('click', function () { if (W.MealViews && W.MealViews.exportDialog) W.MealViews.exportDialog(api); });

  // ---------- own recipes (editor in recipe-editor.js) ----------
  function editRecipe(id, base) { if (W.MealEditor) W.MealEditor.open(api, id, base); }

  // what the other planner scripts (views, editor, pictures) can use
  var api = {
    get st() { return st; }, set st(v) { st = v; }, get data() { return data; }, get ALL() { return ALL; },
    plan: plan, save: save, msg: msg, sheet: sheet, closeSheet: closeSheet, snapshot: snapshot, refreshRecipes: refreshRecipes, renderAll: renderAll, renderLib: renderLib, renderCal: renderCal, renderView: renderView, setView: setView, change: change, slotsOn: slotsOn
  };
  W.MealPlanner = api;

  // ?harvest= hand-off from the Food Garden Planner (static/garden/garden.js builds the link): "key:6-10" or "key:11-2.5"
  function applyHarvest(q) {
    var out = [];
    String(q || '').split(',').forEach(function (tok) {
      var p = tok.split(':'), key = p[0], an = key === 'hens' || key === 'bees';
      if (!key || !(an ? data.G.animals[key] : data.G.crops[key])) return;
      var ms = [];
      String(p[1] || '').split('.').forEach(function (seg) {
        var r = /^(\d{1,2})(?:-(\d{1,2}))?$/.exec(seg); if (!r) return;
        var a = +r[1], b = r[2] ? +r[2] : a; if (a < 1 || a > 12 || b < 1 || b > 12) return;
        for (var m = a, n = 0; n < 12; n++) { if (ms.indexOf(m) < 0) ms.push(m); if (m === b) break; m = m % 12 + 1; }
      });
      var def = (an ? data.G.animals : data.G.crops)[key] || {};
      if (!ms.length) ms = key === 'bees' ? [8, 9] : (def.months || []).slice();
      ms.sort(function (a, b) { return a - b; });
      (an ? st.grow.animals : st.grow.crops)[key] = { on: true, m: ms, store: !!def.store_months };
      out.push(C.growName(data, key).replace(/ \(.*\)$/, '').toLowerCase() + ' (' + C.monthsText(ms) + ')');
    });
    return out;
  }
  W.MealPlannerHarvest = applyHarvest;

  // ---------- start ----------
  var openSetup = null; try { openSetup = W.localStorage.getItem('trb-meals-setup'); } catch (e) { }
  setup.open = openSetup == null ? !C.storageOK || !st.plans.some(function (p) { return Object.keys(p.cells).length; }) : openSetup === '1';
  $('#mp-nostore').hidden = C.storageOK;
  C.load(root.dataset.src, function (err, d) {
    if (err) { $('#mp-weeks').innerHTML = '<p class="mp-warn">The recipes didn’t load (' + esc(err.message) + '). Check your connection and reload the page.</p>'; return; }
    data = d; refreshRecipes();
    // arriving from a recipe page with ?add=<id>
    var m = /[?&]add=([a-z0-9-]+)/.exec(location.search);
    renderAll();
    if (m && ALL[m[1]]) { setView('cal'); startPlacing({ kind: 'add', r: m[1], label: C.emoji(ALL[m[1]]) + ' ' + ALL[m[1]].name }); try { history.replaceState(null, '', location.pathname); } catch (e) { } }
    // arriving from the Food Garden Planner with ?harvest=tomatoes:6-10,cucumbers:5-9,hens:1-12 (crop keys from data/garden, months 1-12)
    var hv = /[?&]harvest=([^&#]*)/.exec(location.search);
    if (hv) {
      var got = applyHarvest(decodeURIComponent(hv[1]));
      try { history.replaceState(null, '', location.pathname); } catch (e) { }
      if (got.length) { save(); lib.f.garden = true; renderAll(); setView('cal'); msg('From your Garden Planner: ' + got.join(', ') + '. Recipes that use them are marked 🌱, and the shopping list takes them off while they’re in season.'); }
    }
    root.classList.add('ready');
  });
})(window, document);
