/* Meal Prep: the "Meet your goals" page (/meal-prep/goals/).
   1. Goal planner: targets -> a day or a week of recipes (goals-core.js), each meal with its portion and numbers,
      day totals against the targets, swap any meal, and send the day(s) to the meal planner (?day=…).
   2. Recipe finder: every recipe per serving, filtered and sorted by protein, calories, protein per 100 kcal, fiber or sodium.
   Choices are remembered in localStorage ("trb-goals-v1") when the browser allows it; the page works without it. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('mp-goals'); if (!root) return;
  var M = W.MealModel, C = W.MealCommon, G = W.MealGoals;
  var $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CFG = JSON.parse($('#gl-data').textContent), KEY = 'trb-goals-v1', st = {};
  try { st = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var data = null, ALLP = [], P = [], people = st.people > 0 ? st.people : 1, seed = 1, view = null, T = null;
  var rbase = root.dataset.rbase;
  var fmt = function (x) { return Math.round(x).toLocaleString('en-US'); };
  function portion(p) { var w = Math.floor(p), f = p - w, fr = f === 0.25 ? '¼' : f === 0.5 ? '½' : f === 0.75 ? '¾' : ''; return (w || !fr ? String(w || '') : '') + fr + (p === 1 ? ' serving' : ' servings'); }

  // ---------- inputs ----------
  var ids = ['kcal', 'protein', 'carb', 'fat', 'fiber'];
  ids.forEach(function (k) { if (st[k] != null) $('#gl-' + k).value = st[k]; });
  (st.av || []).forEach(function (a) { var b = $('[data-av="' + a + '"]'); if (b) b.checked = true; });
  $('#gl-people').textContent = people;
  function readTargets() { var t = {}; ids.forEach(function (k) { var v = $('#gl-' + k).value; t[k] = v === '' ? null : +v; }); return t; }
  function avoid() { var a = {}; $$('[data-av]').forEach(function (b) { if (b.checked) a[b.dataset.av] = true; }); return a; }
  function remember() { var t = readTargets(); ids.forEach(function (k) { st[k] = t[k]; }); st.av = Object.keys(avoid()); st.people = people; save(); }
  $$('.gl-preset').forEach(function (b) { b.addEventListener('click', function () { $('#gl-kcal').value = b.dataset.kcal; $('#gl-protein').value = b.dataset.protein; $$('.gl-preset').forEach(function (x) { x.classList.toggle('on', x === b); }); remember(); if (data) run(view && view.week ? 'week' : 'day'); }); });
  $('#gl-pm').addEventListener('click', function () { people = Math.max(1, people - 1); $('#gl-people').textContent = people; remember(); if (view) render(); });
  $('#gl-pp').addEventListener('click', function () { people = Math.min(12, people + 1); $('#gl-people').textContent = people; remember(); if (view) render(); });
  $$('[data-av]').forEach(function (b) { b.addEventListener('change', function () { remember(); buildPool(); renderFinder(); }); });

  // protein helper
  function helper() {
    var w = +$('#gl-wt').value, kg = $('#gl-wu').value === 'kg' ? w : G.lbToKg(w), g = G.proteinFor(kg, +$('#gl-gpk').value);
    var ok = g && kg >= 30 && kg <= 320;
    $('#gl-helpout').textContent = ok ? 'About ' + g + ' g of protein a day (' + $('#gl-gpk').value + ' g × ' + Math.round(kg) + ' kg).' : 'Enter a weight to see a protein number.';
    $('#gl-useprot').disabled = !ok; $('#gl-useprot').dataset.g = ok ? g : '';
  }
  ['#gl-wt', '#gl-wu', '#gl-gpk'].forEach(function (s) { $(s).addEventListener('input', helper); $(s).addEventListener('change', helper); });
  $('#gl-useprot').addEventListener('click', function () { $('#gl-protein').value = this.dataset.g; remember(); if (data) run(view && view.week ? 'week' : 'day'); });

  // ---------- planning ----------
  function buildPool() { if (!data) return; P = G.pool(M, data.builtin, data.cat, { exclude: CFG.exclude, avoid: avoid() }); ALLP = G.pool(M, data.builtin, data.cat, { exclude: CFG.holiday || [], avoid: avoid() }); }
  function run(kind) {
    remember();
    var ct = G.checkTargets(readTargets()); T = ct.t;
    $('#gl-notes').innerHTML = ct.notes.map(function (n) { return '<p class="mp-warn">' + esc(n) + '</p>'; }).join('');
    if (!P.length) { $('#gl-out').innerHTML = '<p class="mp-warn">No recipes fit those choices. Try leaving fewer things out.</p>'; return; }
    view = kind === 'week' ? { week: true, days: G.planWeek(P, T, { seed: seed }) } : { week: false, days: [G.planDay(P, T, { seed: seed })] };
    $('#gl-again').disabled = false;
    render();
  }
  $('#gl-day').addEventListener('click', function () { seed = 1; run('day'); });
  $('#gl-week').addEventListener('click', function () { seed = 1; run('week'); });
  $('#gl-again').addEventListener('click', function () { seed += 1; run(view && view.week ? 'week' : 'day'); });

  function meter(label, got, want, unit, ok, note) {
    var pct = want ? Math.min(150, got / want * 100) : 0;
    return '<div class="gl-meter' + (ok ? ' ok' : ' off') + '"><div class="gl-mt"><b>' + esc(label) + '</b><span>' + fmt(got) + unit + (want ? ' of ' + fmt(want) + unit : '') + (note ? ' · ' + esc(note) : '') + '</span></div>' +
      (want ? '<div class="gl-bar" aria-hidden="true"><i style="width:' + (pct / 1.5).toFixed(1) + '%"></i><em style="left:' + (100 / 1.5).toFixed(1) + '%"></em></div>' : '') + '</div>';
  }
  function dayHTML(day, di) {
    var c = day.check, h = '<div class="gl-day" data-day="' + di + '">';
    if (view.week) h += '<h3>Day ' + (di + 1) + '</h3>';
    h += '<div class="mp-tablewrap"><table class="gl-meals"><caption class="gl-sr">Meals for ' + (view.week ? 'day ' + (di + 1) : 'the day') + ', with the portion for one adult</caption><thead><tr><th scope="col">Meal</th><th scope="col">Recipe and portion</th><th scope="col">Calories</th><th scope="col">Protein</th><th scope="col" class="hs-noprint"><span class="gl-sr">Swap</span></th></tr></thead><tbody>';
    day.items.forEach(function (it) {
      var batches = Math.max(1, Math.ceil((people * it.p) / it.servings));
      h += '<tr><th scope="row">' + esc(it.label) + '</th><td><span class="gl-slotm">' + esc(it.label) + '</span><a href="' + esc(rbase + it.id + '/') + '"><span aria-hidden="true">' + esc(it.emoji) + '</span> ' + esc(it.name) + '</a><small>' + portion(it.p) + (people > 1 ? ' each · make ' + batches + (batches === 1 ? ' batch' : ' batches') + ' (serves ' + it.servings + ') for ' + people : ' · recipe serves ' + it.servings) + '</small></td>' +
        '<td>' + fmt(it.n.kcal) + '</td><td>' + fmt(it.n.protein) + ' g</td><td class="hs-noprint"><button type="button" class="gl-swap" data-day="' + di + '" data-slot="' + it.slot + '" aria-label="Swap ' + esc(it.label.toLowerCase()) + ': ' + esc(it.name) + '">Swap</button></td></tr>';
    });
    h += '</tbody><tfoot><tr><th scope="row">Day</th><td>' + day.items.length + ' dishes</td><td>' + fmt(day.total.kcal) + '</td><td>' + fmt(day.total.protein) + ' g</td><td class="hs-noprint"></td></tr></tfoot></table></div>';
    h += '<div class="gl-meters">' + meter('Calories', day.total.kcal, T.kcal, '', c.kcal.ok, c.kcal.ok ? 'within 10%' : 'not within 10%');
    if (c.protein) h += meter('Protein', day.total.protein, T.protein, ' g', c.protein.ok, c.protein.ok ? 'met' : 'short');
    if (c.carb) h += meter('Carbohydrate', day.total.carb, T.carb, ' g', c.carb.ok);
    if (c.fat) h += meter('Fat', day.total.fat, T.fat, ' g', c.fat.ok);
    if (c.fiber) h += meter('Fiber', day.total.fiber, T.fiber, ' g', c.fiber.ok);
    h += '</div><ul class="gl-facts">' +
      '<li class="' + (c.satfatOk ? 'ok' : 'off') + '">Saturated fat ' + fmt(day.total.satfat) + ' g, ' + c.satfatPct.toFixed(0) + '% of calories ' + (c.satfatOk ? '(under the 10% limit)' : '(over the 10% limit)') + '</li>' +
      '<li class="' + (c.sodiumOk ? 'ok' : 'off') + '">Sodium ' + fmt(day.total.sodium) + ' mg ' + (c.sodiumOk ? '(under 2,300 mg)' : '(over 2,300 mg; go easy on the salt)') + '</li>' +
      (c.protein ? '' : '<li>Protein ' + fmt(day.total.protein) + ' g</li>') + '<li>Carbohydrate ' + fmt(day.total.carb) + ' g · Fat ' + fmt(day.total.fat) + ' g · Fiber ' + fmt(day.total.fiber) + ' g</li></ul>';
    h += '<div class="gl-alt" id="gl-alt-' + di + '" hidden></div>';
    if (view.week) h += '<p class="hs-noprint"><a class="hs-btn ghost" href="' + esc(root.dataset.plan + '?day=' + encodeURIComponent(G.plannerQuery([day]))) + '">📅 Put day ' + (di + 1) + ' in my meal planner</a></p>';
    return h + '</div>';
  }
  function render() {
    if (!view) return;
    var h = '<h3 class="gl-outh">' + (view.week ? 'Your week' : 'Your day') + ': ' + fmt(T.kcal) + ' calories' + (T.protein ? ', ' + fmt(T.protein) + ' g protein' : '') + '</h3>';
    if (view.week) {
      var avgK = 0, avgP = 0; view.days.forEach(function (d) { avgK += d.total.kcal / view.days.length; avgP += d.total.protein / view.days.length; });
      h += '<p>Each day averages ' + fmt(avgK) + ' calories and ' + fmt(avgP) + ' g protein. Portions are for one adult.</p>';
    } else h += '<p>Portions are for one adult. Tap a recipe for the steps; tap Swap to see other choices.</p>';
    view.days.forEach(function (d, i) { h += dayHTML(d, i); });
    var q = G.plannerQuery(view.days);
    h += '<div class="gl-cta hs-noprint"><a class="hs-btn pri" id="gl-toplan" href="' + esc(root.dataset.plan + '?day=' + encodeURIComponent(q)) + '">📅 Put ' + (view.week ? 'the week' : 'this day') + ' in my meal planner</a><button type="button" class="hs-btn ghost" id="gl-print">🖨 Print</button></div>' +
      '<p class="hs-small">In the planner, tap the day to start on. It adds each meal to its slot (the side goes with dinner) and scales to the household you set there, then makes the shopping list.</p>';
    $('#gl-out').innerHTML = h;
    $('#gl-print').addEventListener('click', function () { W.print(); });
  }
  // swap: show the best other choices for that slot; picking one rebalances the portions
  $('#gl-out').addEventListener('click', function (e) {
    var b = e.target.closest('.gl-swap');
    if (b) {
      var di = +b.dataset.day, slot = b.dataset.slot, box = $('#gl-alt-' + di);
      if (!box.hidden && box.dataset.slot === slot) { box.hidden = true; return; }
      var alts = G.alternatives(P, T, view.days[di], slot, 8);
      box.dataset.slot = slot; box.hidden = false;
      box.innerHTML = '<p><b>Other choices for ' + esc(G.SLOTS[slot].label.toLowerCase()) + '</b>, best fit first:</p><ul>' + alts.map(function (a) {
        return '<li><button type="button" class="gl-pick" data-day="' + di + '" data-slot="' + slot + '" data-id="' + a.id + '"><span aria-hidden="true">' + esc(a.emoji) + '</span> ' + esc(a.name) + ' <small>' + portion(a.p) + ' · ' + fmt(a.kcal) + ' cal · ' + fmt(a.protein) + ' g protein</small></button></li>';
      }).join('') + '</ul><button type="button" class="hs-btn ghost gl-altx">Close</button>';
      var first = $('.gl-pick', box); if (first) first.focus();
      return;
    }
    var p = e.target.closest('.gl-pick');
    if (p) { var d = +p.dataset.day; view.days[d] = G.swap(P, T, view.days[d], p.dataset.slot, p.dataset.id); render(); var row = $('.gl-day[data-day="' + d + '"]'); if (row) row.scrollIntoView({ block: 'nearest' }); return; }
    if (e.target.closest('.gl-altx')) { var bx = e.target.closest('.gl-alt'); bx.hidden = true; }
  });

  // ---------- recipe finder ----------
  var shown = 30;
  function renderFinder() {
    if (!data) return;
    var meal = $('#gf-meal').value, sv = $('#gf-sort').value.split(':'), minp = +$('#gf-minp').value || 0, maxk = +$('#gf-maxk').value || 0, q = $('#gf-q').value.trim().toLowerCase();
    var rows = ALLP.filter(function (r) {
      if (meal && r.meals.indexOf(meal) < 0) return false;
      if (minp && r.n.protein < minp) return false;
      if (maxk && r.n.kcal > maxk) return false;
      if (q && r.name.toLowerCase().indexOf(q) < 0 && r.id.indexOf(q.replace(/\s+/g, '-')) < 0) return false;
      return true;
    });
    rows = G.sortRows(rows, sv[0], +sv[1]);
    $('#gf-count').textContent = rows.length + (rows.length === 1 ? ' recipe' : ' recipes') + (rows.length > shown ? ', showing ' + shown : '') + '.';
    $('#gf-list').innerHTML = rows.slice(0, shown).map(function (r) {
      return '<li><a href="' + esc(rbase + r.id + '/') + '"><span class="mp-emo" aria-hidden="true">' + esc(r.emoji) + '</span><span class="gl-fn"><b>' + esc(r.name) + '</b><small>' + esc(r.meals.join(', ')) + '</small></span></a>' +
        '<dl class="gl-fnum"><div><dt>Protein</dt><dd>' + fmt(r.n.protein) + ' g</dd></div><div><dt>Calories</dt><dd>' + fmt(r.n.kcal) + '</dd></div><div><dt>Per 100 cal</dt><dd>' + G.ppk(r).toFixed(1) + ' g</dd></div><div><dt>Fiber</dt><dd>' + fmt(r.n.fiber) + ' g</dd></div><div><dt>Sodium</dt><dd>' + fmt(r.n.sodium) + ' mg</dd></div></dl></li>';
    }).join('') || '<li class="mp-empty">No recipes match. Try fewer filters.</li>';
    $('#gf-more').hidden = rows.length <= shown;
  }
  ['#gf-meal', '#gf-sort', '#gf-minp', '#gf-maxk', '#gf-q'].forEach(function (s) { $(s).addEventListener('input', function () { shown = 30; renderFinder(); }); });
  $('#gf-more').addEventListener('click', function () { shown += 30; renderFinder(); });

  C.load(root.dataset.src, function (err, d) {
    if (err) { var m = 'The recipes didn’t load (' + esc(err.message) + '). Check your connection and reload the page.'; $('#gl-out').innerHTML = '<p class="mp-warn">' + m + '</p>'; $('#gf-list').innerHTML = '<li class="mp-warn">' + m + '</li>'; return; }
    data = d; buildPool();
    $('#gl-out').innerHTML = '<p class="mp-empty">Set your targets, then tap <b>Plan a day</b> or <b>Plan a week</b>.</p>';
    renderFinder();
  });
})(window, document);
