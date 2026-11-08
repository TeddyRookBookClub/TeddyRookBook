/* Meal Prep: the goal planner's math (/meal-prep/goals/). No DOM; runs in the browser (window.MealGoals) and in node
   (scripts/meals/goals.test.js). Recipe nutrition comes from model.js (recipeNutrition: USDA FoodData Central numbers
   per serving), so the numbers match every recipe page.

   How a day is picked (the page explains this in plain words):
   1. Targets are checked first: calories 1,200 to 5,000; protein 10 to 35% of calories, carbohydrate 45 to 65% and
      fat 20 to 35% (the National Academies' Acceptable Macronutrient Distribution Ranges). Anything outside is moved
      to the nearest edge, with a note saying so.
   2. The day has meal slots (breakfast, lunch, dinner, a side with dinner, a snack; a second snack from 2,800 kcal).
      Each slot draws only from recipes made for that meal, minus holiday dishes, sauces and desserts (goals.json).
   3. Every slot gets a portion: ½ to 2 servings in quarter steps (a side or snack can also be skipped).
   4. A score adds up how far the day is from the targets: calories (no cost within 5%), protein (falling short costs
      more than going over), carbohydrate, fat and fiber when set, plus the Dietary Guidelines limits (saturated fat
      under 10% of calories, sodium under 2,300 mg), plus a small cost for portions far from one serving.
   5. Start from a few random good picks, then try every recipe and portion in each slot, one slot at a time, keeping
      any change that lowers the score, until nothing improves. Keep the best of several starts. Same seed, same day. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MealGoals = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LIMITS = { kcal: [1200, 5000], protein: [0.10, 0.35], carb: [0.45, 0.65], fat: [0.20, 0.35], fiber: [0, 70] };
  var KEYS = ['kcal', 'protein', 'fat', 'satfat', 'carb', 'fiber', 'sugar', 'sodium'];
  var PORTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  var OPTIONAL = [0].concat(PORTIONS); // a side or snack may be left out
  // slot: the planner cell it goes in, the meals it draws from, its rough share of the day (for the first picks)
  var SLOTS = {
    breakfast: { cell: 'breakfast', meals: ['breakfast'], share: 0.25, label: 'Breakfast' },
    lunch: { cell: 'lunch', meals: ['lunch'], share: 0.30, label: 'Lunch' },
    dinner: { cell: 'dinner', meals: ['dinner'], share: 0.30, label: 'Dinner' },
    side: { cell: 'dinner', meals: ['side'], share: 0.05, label: 'Side with dinner', optional: true },
    snack: { cell: 'snack', meals: ['snack'], share: 0.10, label: 'Snack', optional: true },
    snack2: { cell: 'snack', meals: ['snack'], share: 0.10, label: 'Second snack', optional: true }
  };

  function num(x) { x = +x; return isFinite(x) ? x : null; }
  function round(x, s) { return Math.round(x / s) * s; }

  // Clean up targets: {kcal, protein, carb, fat, fiber} (grams; empty = not set) -> {t, notes[]}
  function checkTargets(raw) {
    var t = {}, notes = [];
    var k = num(raw && raw.kcal);
    if (k == null || k <= 0) { k = 2000; notes.push('No calorie target was set, so the plan uses 2,000, the reference on Nutrition Facts labels.'); }
    if (k < LIMITS.kcal[0]) { notes.push('Calorie targets start at 1,200 here. Very low-calorie eating should only be done with a doctor’s care.'); k = LIMITS.kcal[0]; }
    if (k > LIMITS.kcal[1]) { notes.push('Calorie targets stop at 5,000 here; that is already far above what nearly all adults need.'); k = LIMITS.kcal[1]; }
    t.kcal = round(k, 10);
    [['protein', 4, 'Protein'], ['carb', 4, 'Carbohydrate'], ['fat', 9, 'Fat']].forEach(function (m) {
      var g = num(raw && raw[m[0]]); if (g == null || g <= 0) return;
      var lo = LIMITS[m[0]][0] * t.kcal / m[1], hi = LIMITS[m[0]][1] * t.kcal / m[1];
      if (g < lo || g > hi) {
        var ng = g < lo ? Math.ceil(lo) : Math.floor(hi); // stay inside after rounding
        notes.push(m[2] + ' was set to ' + ng + ' g: at ' + t.kcal.toLocaleString('en-US') + ' calories, the recommended range is ' + Math.ceil(lo) + ' to ' + Math.floor(hi) + ' g (' + Math.round(LIMITS[m[0]][0] * 100) + ' to ' + Math.round(LIMITS[m[0]][1] * 100) + '% of calories).');
        g = ng;
      }
      t[m[0]] = Math.min(Math.floor(hi), Math.max(Math.ceil(lo), Math.round(g)));
    });
    var f = num(raw && raw.fiber);
    if (f != null && f > 0) t.fiber = Math.round(Math.min(LIMITS.fiber[1], f));
    return { t: t, notes: notes };
  }

  // protein range from body weight (kg) and grams per kg -> grams (whole numbers)
  function proteinFor(kg, gPerKg) { kg = num(kg); gPerKg = num(gPerKg); if (!kg || !gPerKg || kg <= 0) return null; return Math.round(kg * gPerKg); }
  function lbToKg(lb) { return lb * 0.45359237; }

  // The slots for a calorie target
  function slotsFor(kcal) { var s = ['breakfast', 'lunch', 'dinner', 'side', 'snack']; if (kcal >= 2800) s.push('snack2'); return s; }

  // Build the pool: [{id, name, emoji, meals, n:{per serving}, flags}] from model.js data.
  // opt: {exclude:[ids], avoid:{vegetarian, glutenFree, dairyFree, fish, nuts, eggs, milk, wheat, soy}}
  function pool(M, recipes, cat, opt) {
    opt = opt || {};
    var ex = {}; (opt.exclude || []).forEach(function (id) { ex[id] = 1; });
    var av = opt.avoid || {}, out = [];
    Object.keys(recipes).sort().forEach(function (id) {
      var r = recipes[id]; if (ex[id] || r.own) return;
      var rn = M.recipeNutrition(r, cat); if (rn.status === 'none' || !(rn.n.kcal > 0)) return;
      var f = M.recipeFlags(r, cat), al = f.allergens;
      if (av.vegetarian && !f.vegetarian) return;
      if (av.glutenFree && !f.glutenFree) return;
      if (av.dairyFree && !f.dairyFree) return;
      if (av.fish && (al.indexOf('fish') >= 0 || al.indexOf('shellfish') >= 0)) return;
      if (av.nuts && (al.indexOf('tree-nuts') >= 0 || al.indexOf('peanuts') >= 0)) return;
      if (av.eggs && al.indexOf('eggs') >= 0) return;
      if (av.soy && al.indexOf('soybeans') >= 0) return;
      if (av.sesame && al.indexOf('sesame') >= 0) return;
      var n = {}; KEYS.forEach(function (k) { n[k] = +rn.n[k] || 0; });
      out.push({ id: id, name: r.name, emoji: r.emoji || '', meals: r.meals.slice(), servings: r.servings, n: n });
    });
    return out;
  }
  function forSlot(P, slot) { var ms = SLOTS[slot].meals; return P.filter(function (p) { return p.meals.some(function (m) { return ms.indexOf(m) >= 0; }); }); }

  function totals(items) {
    var s = {}; KEYS.forEach(function (k) { s[k] = 0; });
    items.forEach(function (it) { if (!it || !it.p) return; KEYS.forEach(function (k) { s[k] += it.r.n[k] * it.p; }); });
    return s;
  }

  // How far a day's totals are from the targets (0 = right on). Each part is a share of its target, so they compare.
  function score(s, t, items) {
    var c = 0, ek = Math.abs(s.kcal - t.kcal) / t.kcal;
    c += 10 * Math.max(0, ek - 0.05) + 2 * ek;
    if (t.protein) { var sh = Math.max(0, (t.protein - s.protein) / t.protein), ov = Math.max(0, (s.protein - 1.3 * t.protein) / t.protein); c += 12 * sh + 3 * ov; }
    if (t.carb) c += 4 * Math.max(0, Math.abs(s.carb - t.carb) / t.carb - 0.1);
    if (t.fat) c += 4 * Math.max(0, Math.abs(s.fat - t.fat) / t.fat - 0.1);
    if (t.fiber) c += 4 * Math.max(0, (t.fiber - s.fiber) / t.fiber);
    var sf = s.kcal > 0 ? s.satfat * 9 / s.kcal : 0; if (sf > 0.10) c += 8 * (sf - 0.10) / 0.10;
    if (s.sodium > 2300) c += 2 * (s.sodium - 2300) / 2300;
    (items || []).forEach(function (it) { if (it && it.p) c += 0.03 * Math.abs(it.p - 1); });
    return c;
  }

  function rng(seed) { var a = (seed >>> 0) || 1; return function () { a = (a + 0x6D2B79F5) >>> 0; var x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

  // Plan one day. P: pool; t: checked targets; opt: {seed, avoid:{id:1} (recipes to leave out, e.g. eaten yesterday),
  // fixed:{slot:{id, p}} (kept as they are), starts}
  function planDay(P, t, opt) {
    opt = opt || {};
    var slots = opt.slots || slotsFor(t.kcal), rand = rng(opt.seed || 1), avoid = opt.avoid || {}, fixed = opt.fixed || {};
    var cand = {};
    slots.forEach(function (s) { cand[s] = forSlot(P, s).filter(function (r) { return !avoid[r.id]; }); if (!cand[s].length) cand[s] = forSlot(P, s); });
    function evalItems(items) { return score(totals(items), t, items); }
    function used(items, id, skip) { for (var i = 0; i < items.length; i++) if (i !== skip && items[i] && items[i].p && items[i].r.id === id) return true; return false; }
    var best = null, starts = opt.starts || 6;
    for (var st = 0; st < starts; st++) {
      // first picks: for each slot, a recipe near its share of the target (random among the closest few)
      var items = slots.map(function (s) {
        if (fixed[s]) { var fr = P.filter(function (r) { return r.id === fixed[s].id; })[0]; if (fr) return { s: s, r: fr, p: fixed[s].p, fixed: true }; }
        var want = SLOTS[s].share * t.kcal, list = cand[s];
        if (!list.length) return { s: s, r: null, p: 0 };
        var ranked = list.map(function (r) {
          var pr = t.protein ? (r.n.protein * 4 / r.n.kcal) - (t.protein * 4 / t.kcal) : 0;
          return { r: r, d: Math.abs(r.n.kcal - want) / want - (t.protein ? Math.min(pr, 0.1) : 0) };
        }).sort(function (a, b) { return a.d - b.d; });
        var pick = ranked[Math.floor(rand() * Math.min(8, ranked.length))].r;
        var p = Math.min(2, Math.max(0.5, round(want / pick.n.kcal, 0.25)));
        return { s: s, r: pick, p: p };
      });
      // drop duplicates from the first picks
      items.forEach(function (it, i) { if (it.r && used(items, it.r.id, i) && !it.fixed) { it.r = null; it.p = 0; } });
      var cur = evalItems(items), improved = true, pass = 0;
      while (improved && pass++ < 8) {
        improved = false;
        for (var i = 0; i < items.length; i++) {
          if (items[i].fixed) continue;
          var s = items[i].s, ports = SLOTS[s].optional ? OPTIONAL : PORTIONS, bestHere = { r: items[i].r, p: items[i].p, c: cur };
          // the same recipe at other portions, then every other recipe
          var tryList = cand[s];
          for (var j = 0; j < tryList.length; j++) {
            var r = tryList[j]; if (used(items, r.id, i)) continue;
            for (var q = 0; q < ports.length; q++) {
              var keep = items[i]; items[i] = { s: s, r: ports[q] ? r : null, p: ports[q] };
              var c = evalItems(items);
              if (c < bestHere.c - 1e-9) bestHere = { r: items[i].r, p: items[i].p, c: c };
              items[i] = keep;
            }
          }
          if (SLOTS[s].optional) { var k0 = items[i]; items[i] = { s: s, r: null, p: 0 }; var c0 = evalItems(items); if (c0 < bestHere.c - 1e-9) bestHere = { r: null, p: 0, c: c0 }; items[i] = k0; }
          if (bestHere.c < cur - 1e-9) { items[i] = { s: s, r: bestHere.r, p: bestHere.p }; cur = bestHere.c; improved = true; }
        }
      }
      if (!best || cur < best.c) best = { c: cur, items: items.map(function (x) { return { s: x.s, r: x.r, p: x.p, fixed: !!x.fixed }; }) };
    }
    return result(best.items, t);
  }

  function result(items, t) {
    var s = totals(items);
    var out = items.filter(function (it) { return it.r && it.p > 0; }).map(function (it) {
      var n = {}; KEYS.forEach(function (k) { n[k] = it.r.n[k] * it.p; });
      return { slot: it.s, cell: SLOTS[it.s].cell, label: SLOTS[it.s].label, id: it.r.id, name: it.r.name, emoji: it.r.emoji, p: it.p, servings: it.r.servings, n: n };
    });
    return { items: out, total: s, score: score(s, t, items), check: check(s, t) };
  }

  // How the day compares with the targets and limits: {kcal:{ok, pct}, protein:{ok}, satfatPct, sodiumOk, ...}
  function check(s, t) {
    var o = { kcal: { got: s.kcal, want: t.kcal, ok: Math.abs(s.kcal - t.kcal) <= 0.1 * t.kcal } };
    if (t.protein) o.protein = { got: s.protein, want: t.protein, ok: s.protein >= 0.9 * t.protein };
    if (t.carb) o.carb = { got: s.carb, want: t.carb, ok: Math.abs(s.carb - t.carb) <= 0.15 * t.carb };
    if (t.fat) o.fat = { got: s.fat, want: t.fat, ok: Math.abs(s.fat - t.fat) <= 0.15 * t.fat };
    if (t.fiber) o.fiber = { got: s.fiber, want: t.fiber, ok: s.fiber >= 0.85 * t.fiber };
    o.satfatPct = s.kcal > 0 ? s.satfat * 9 / s.kcal * 100 : 0;
    o.satfatOk = o.satfatPct <= 10;
    o.sodiumOk = s.sodium <= 2300;
    return o;
  }

  // Other choices for one slot of a planned day, best first: [{id, name, p, total, score}]
  function alternatives(P, t, day, slot, max) {
    var base = day.items.filter(function (it) { return it.slot !== slot; }).map(function (it) { return { s: it.slot, r: P.filter(function (r) { return r.id === it.id; })[0], p: it.p }; }).filter(function (x) { return x.r; });
    var taken = {}; base.forEach(function (x) { taken[x.r.id] = 1; });
    var cur = day.items.filter(function (it) { return it.slot === slot; })[0];
    var ports = SLOTS[slot].optional ? PORTIONS : PORTIONS, out = [];
    forSlot(P, slot).forEach(function (r) {
      if (taken[r.id] || (cur && cur.id === r.id)) return;
      var b = null;
      ports.forEach(function (p) { var items = base.concat([{ s: slot, r: r, p: p }]); var c = score(totals(items), t, items); if (!b || c < b.c) b = { p: p, c: c }; });
      out.push({ id: r.id, name: r.name, emoji: r.emoji, p: b.p, kcal: r.n.kcal * b.p, protein: r.n.protein * b.p, score: b.c });
    });
    return out.sort(function (a, b) { return a.score - b.score; }).slice(0, max || 8);
  }

  // Put a chosen recipe in a slot and rebalance the other portions (recipes stay; only portions move)
  function swap(P, t, day, slot, id) {
    var r = P.filter(function (x) { return x.id === id; })[0]; if (!r) return day;
    var items = slotsFor(t.kcal).map(function (s) {
      if (s === slot) return { s: s, r: r, p: 1 };
      var it = day.items.filter(function (x) { return x.slot === s; })[0];
      var rr = it ? P.filter(function (x) { return x.id === it.id; })[0] : null;
      return { s: s, r: rr || null, p: rr ? it.p : 0 };
    });
    // best portion for each slot in turn, two rounds
    for (var round2 = 0; round2 < 2; round2++) items.forEach(function (it, i) {
      if (!it.r) return; var ports = SLOTS[it.s].optional ? OPTIONAL : PORTIONS, best = { p: it.p, c: score(totals(items), t, items) };
      ports.forEach(function (p) { var keep = items[i]; items[i] = { s: it.s, r: it.r, p: p }; var c = score(totals(items), t, items); if (c < best.c - 1e-9) best = { p: p, c: c }; items[i] = keep; });
      items[i] = { s: it.s, r: it.r, p: best.p };
    });
    return result(items, t);
  }

  // A week: one day at a time, leaving out lunches and dinners from the last 3 days and breakfasts and snacks from yesterday
  function planWeek(P, t, opt) {
    opt = opt || {}; var days = [], n = opt.days || 7;
    for (var d = 0; d < n; d++) {
      var avoid = {};
      days.slice(-3).forEach(function (day, k, arr) {
        day.items.forEach(function (it) { if (it.cell === 'lunch' || it.cell === 'dinner' || k === arr.length - 1) avoid[it.id] = 1; });
      });
      days.push(planDay(P, t, { seed: (opt.seed || 1) * 31 + d * 7919, avoid: avoid, starts: opt.starts || 4 }));
    }
    return days;
  }

  // The planner link: ?day=breakfast:id,lunch:id,dinner:id,dinner:side,snack:id|… (one group per day)
  function plannerQuery(days) {
    return days.map(function (day) { return day.items.map(function (it) { return it.cell + ':' + it.id; }).join(','); }).join('|');
  }

  // Recipe finder: rows sorted by a key. rows from pool(); key: protein|kcal|ppk (protein per 100 kcal)|fiber|sodium; dir 1 or -1
  function ppk(r) { return r.n.kcal > 0 ? r.n.protein / r.n.kcal * 100 : 0; }
  function sortRows(rows, key, dir) {
    var f = key === 'ppk' ? ppk : function (r) { return r.n[key] || 0; };
    return rows.slice().sort(function (a, b) { return dir * (f(a) - f(b)) || a.name.localeCompare(b.name); });
  }

  return { LIMITS: LIMITS, KEYS: KEYS, PORTIONS: PORTIONS, SLOTS: SLOTS, checkTargets: checkTargets, proteinFor: proteinFor, lbToKg: lbToKg,
    slotsFor: slotsFor, pool: pool, forSlot: forSlot, totals: totals, score: score, planDay: planDay, check: check, alternatives: alternatives,
    swap: swap, planWeek: planWeek, plannerQuery: plannerQuery, ppk: ppk, sortRows: sortRows };
});
