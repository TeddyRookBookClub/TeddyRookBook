/* Meal Prep: the hub, the recipe list (filters) and the recipe pages (scaling and nutrition). */
(function (W, D) {
  'use strict';
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function saved() { try { return JSON.parse(W.localStorage.getItem('trb-meals-v1') || 'null'); } catch (e) { return null; } }

  // ---------- hub: pick up where you left off ----------
  var hub = D.getElementById('mp-hub');
  if (hub) {
    var s = saved(), el = $('#mp-resume');
    if (s && s.plans && s.plans.length) {
      var n = 0, p = s.plans.filter(function (x) { return x.id === s.cur; })[0] || s.plans[0];
      Object.keys(p.cells || {}).forEach(function (k) { n += (p.cells[k] || []).length; });
      if (n) { el.innerHTML = '📅 Pick up where you left off: <b></b>, ' + n + (n === 1 ? ' meal' : ' meals') + ' planned' + (s.plans.length > 1 ? ' (' + s.plans.length + ' plans saved)' : '') + '. <a href="plan/">Open the planner →</a>'; $('b', el).textContent = p.name; el.hidden = false; el.className = 'mp-tip'; }
    }
  }

  // ---------- recipe list filters ----------
  var rl = D.getElementById('mp-recipes');
  if (rl) {
    var f = {}, av = {}, q = '';
    var MEALS = ['breakfast', 'lunch', 'dinner', 'side', 'snack'];
    function apply() {
      var meals = MEALS.filter(function (m) { return f[m]; }), tags = Object.keys(f).filter(function (k) { return f[k] && MEALS.indexOf(k) < 0; }), shown = 0;
      $$('.mp-rcard', rl).forEach(function (c) {
        var cm = c.dataset.meal.split(' '), ct = c.dataset.tags.split(' '), ca = c.dataset.al.split(' '), ok = true;
        if (meals.length && !meals.some(function (m) { return cm.indexOf(m) >= 0; })) ok = false;
        tags.forEach(function (t) { if (t === 'quick') { if (ct.indexOf('quick') < 0 && !(+c.dataset.min <= 30)) ok = false; } else if (ct.indexOf(t) < 0) ok = false; });
        Object.keys(av).forEach(function (a) { if (av[a] && ca.indexOf(a) >= 0) ok = false; });
        if (q && q.split(/\s+/).some(function (w) { return c.dataset.q.indexOf(w) < 0; })) ok = false;
        c.hidden = !ok; if (ok) shown++;
      });
      $$('.rl-group', rl).forEach(function (g) { g.hidden = !$$('.mp-rcard:not([hidden])', g).length; });
      $('#rl-none').hidden = shown > 0;
      $('#rl-count').textContent = shown + (shown === 1 ? ' recipe' : ' recipes');
    }
    rl.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; f[b.dataset.f] = !f[b.dataset.f]; b.setAttribute('aria-pressed', !!f[b.dataset.f]); apply(); });
    rl.addEventListener('change', function (e) { if (e.target.dataset.av) { av[e.target.dataset.av] = e.target.checked; apply(); } });
    $('#rl-q').addEventListener('input', function () { q = this.value.trim().toLowerCase(); apply(); });
    // arriving at #dinner etc. turns that meal on
    var h = location.hash.slice(1); if (MEALS.indexOf(h) >= 0) { f[h] = true; var b = $('[data-f="' + h + '"]', rl); if (b) b.setAttribute('aria-pressed', 'true'); }
    apply();
  }

  // ---------- one recipe ----------
  var rp = D.getElementById('mp-recipe');
  if (rp && W.MealModel && W.MealCommon) {
    var M = W.MealModel, C = W.MealCommon, data = null, r = null, n = 0, home = 0;
    var st = saved();
    if (st && st.people) home = M.householdServings(st.people);
    $('#rp-print').addEventListener('click', function () { W.print(); });
    C.load(rp.dataset.src, function (err, d) {
      if (err) return;
      data = d; r = d.builtin[rp.dataset.id]; if (!r) return;
      n = r.servings;
      if (home > 0 && Math.abs(home - r.servings) > 0.01) { var hb = $('#rp-home'); hb.hidden = false; hb.textContent = 'for my household (' + M.fmtNum(home) + ')'; hb.addEventListener('click', function () { n = home; draw(); }); }
      $('#rp-minus').addEventListener('click', function () { n = Math.max(1, Math.ceil(n) - 1); draw(); });
      $('#rp-plus').addEventListener('click', function () { n = Math.min(60, Math.floor(n) + 1); draw(); });
      $('#rp-reset').addEventListener('click', function () { n = r.servings; draw(); });
      draw(); nutrition();
      var chk = []; r.ing.forEach(function (i) { var it = i.item && d.cat[i.item]; if (it && it.checkLabel && chk.indexOf(it.name) < 0) chk.push(it.name); });
      if (chk.length) { var p = D.createElement('p'); p.className = 'hs-small'; p.textContent = 'Check the label on: ' + chk.join(', ') + '. Allergens and gluten in these vary by brand.'; $('#rp-ings').parentNode.appendChild(p); }
    });
    function draw() {
      $('#rp-n').textContent = M.fmtNum(n);
      $('#rp-reset').hidden = Math.abs(n - r.servings) < 0.01;
      var sc = M.scaleRecipe(r, n, data.cat), grp = '', h = '';
      sc.forEach(function (s) {
        if (s.ing.group && s.ing.group !== grp) { grp = s.ing.group; h += '<li class="mp-ingg"><h4>' + C.esc(grp) + '</h4></li>'; }
        h += '<li>' + C.ingLine(s) + '</li>';
      });
      $('#rp-ings').innerHTML = h;
      var note = $('#rp-scalenote');
      if (Math.abs(n - r.servings) > 0.01) { note.hidden = false; note.textContent = 'Scaled ×' + M.fmtNum(Math.round(n / r.servings * 100) / 100) + ' from ' + r.servings + ' servings and rounded to amounts you can measure (whole eggs and cans). Pan sizes and cooking times may change for a much bigger or smaller batch.'; }
      else note.hidden = true;
    }
    function nutrition() {
      var rn = M.recipeNutrition(r, data.cat), box = $('#rp-nutr');
      if (rn.status === 'none') return; // the page already says "Nutrition coming"
      var v = rn.n;
      function row(k, cls) { var lab = M.NLAB[k], pc = M.pctDV(k, v[k]); return '<div class="row' + (cls ? ' ' + cls : '') + '"><span>' + lab[0] + ' ' + fmt(k, v[k]) + lab[1] + '</span><span class="dv">' + (pc != null ? pc + '%' : '') + '</span></div>'; }
      function fmt(k, x) { return k === 'sodium' || k === 'calcium' || k === 'potassium' ? Math.round(x) : Math.round(x * 10) / 10; }
      var h = '<div class="mp-nf" role="group" aria-label="Nutrition per serving"><h3>Nutrition (estimate)</h3><div class="row"><span>Per serving' + (r.size ? ' (' + C.esc(r.size) + ')' : '') + '</span><span>' + r.servings + ' servings</span></div>' +
        '<div class="row big"><span>Calories</span><span>' + Math.round(v.kcal) + '</span></div><div class="row"><span></span><span class="dv">% Daily Value*</span></div>' +
        row('fat') + row('satfat', 'ind') + row('sodium') + row('carb') + row('fiber', 'ind') + row('sugar', 'ind') + row('protein') + row('calcium') + row('iron') + row('potassium') +
        '<p>* The % Daily Value tells you how much a nutrient in a serving adds to a daily diet; 2,000 calories a day is used for general nutrition advice (FDA). Estimated from USDA FoodData Central; your brands and portions will differ. Sugars here are total sugars.</p></div>';
      if (rn.status === 'partial') h += '<p class="hs-small">Not counted (no USDA numbers yet): ' + C.esc(rn.missing.join(', ')) + '.</p>';
      var srcs = [], seen = {};
      r.ing.forEach(function (i) { var it = i.item && data.cat[i.item]; if (!it || seen[it.id] || !it.n) return; seen[it.id] = 1; srcs.push('<li>' + C.esc(it.name) + ': ' + C.esc(it.nsrc || ('USDA FoodData Central' + (it.fdc ? ' ' + it.fdc : ''))) + (it.proxy ? ' <i>(a similar food, as an estimate)</i>' : '') + (i.opt ? ' <i>(optional, not counted)</i>' : i.noNutr ? ' <i>(mostly poured off, not counted)</i>' : '') + '</li>'); });
      if (srcs.length) h += '<details class="mp-mini"><summary>Where the numbers come from</summary><ul class="hs-small">' + srcs.join('') + '</ul></details>';
      box.innerHTML = h;
    }
  }
})(window, document);
