/* Meal Prep: the math behind the planner (no page code here, so Node can test it: scripts/meals/app-tests.js).
   Units and conversions, scaling a recipe to the people eating, rounding to sensible amounts, buying in
   store packages, merging a shopping list, nutrition estimates, and shuffling a week with rules.
   Works on the normalized data made by norm() from data/meals (see the adapter at the bottom). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MealModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- units ----------
  var MASS = { g: 1, kg: 1000, oz: 28.349523, lb: 453.59237 };
  var VOL = { ml: 1, l: 1000, tsp: 4.928922, tbsp: 14.786765, cup: 236.588237, floz: 29.57353, pint: 473.176473, quart: 946.352946, gallon: 3785.411784, pinch: 0.3, dash: 0.6 };
  var ALIAS = {
    gram: 'g', grams: 'g', gr: 'g', kilogram: 'kg', kilograms: 'kg', kgs: 'kg', ounce: 'oz', ounces: 'oz', 'oz.': 'oz', pound: 'lb', pounds: 'lb', lbs: 'lb', 'lb.': 'lb',
    milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', ml: 'ml', liter: 'l', liters: 'l', litre: 'l', litres: 'l', teaspoon: 'tsp', teaspoons: 'tsp', t: 'tsp', 'tsp.': 'tsp',
    tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp', tbl: 'tbsp', 'tbsp.': 'tbsp', T: 'tbsp', cups: 'cup', c: 'cup', 'fl oz': 'floz', 'fl. oz': 'floz', 'fl-oz': 'floz', fluid_ounce: 'floz', 'fluid ounce': 'floz', 'fluid ounces': 'floz',
    pints: 'pint', pt: 'pint', quarts: 'quart', qt: 'quart', gallons: 'gallon', gal: 'gallon', pinches: 'pinch', dashes: 'dash',
    ea: 'each', whole: 'each', item: 'each', items: 'each', piece: 'each', pieces: 'each', pc: 'each', large: 'each', medium: 'each', small: 'each', '': 'each', count: 'each',
    cloves: 'clove', slices: 'slice', cans: 'can', packages: 'package', pkg: 'package', packs: 'package', pack: 'package', bunches: 'bunch', heads: 'head', stalks: 'stalk', ribs: 'stalk', rib: 'stalk',
    sprigs: 'sprig', leaves: 'leaf', jars: 'jar', bottles: 'bottle', boxes: 'box', bags: 'bag', sticks: 'stick', loaves: 'loaf', ears: 'ear', fillets: 'fillet', breasts: 'breast', thighs: 'thigh', links: 'link', tortillas: 'tortilla', buns: 'bun', strips: 'strip', dozens: 'dozen', doz: 'dozen'
  };
  function unitKey(u) {
    if (u == null) return 'each';
    var s = String(u).trim(); if (s === 'T') return 'tbsp';
    s = s.toLowerCase().replace(/\s+/g, ' ');
    if (MASS[s] || VOL[s]) return s;
    if (ALIAS[s] != null) return ALIAS[s];
    if (/s$/.test(s) && ALIAS[s.slice(0, -1)] != null) return ALIAS[s.slice(0, -1)];
    if (/s$/.test(s) && s.length > 3) return s.slice(0, -1);
    return s;
  }
  function kind(u) { u = unitKey(u); return MASS[u] ? 'mass' : VOL[u] ? 'vol' : 'count'; }

  // grams for an amount of a catalog item, or null if the item gives no way to convert
  function toGrams(item, amt, unit) {
    var u = unitKey(unit), a = +amt;
    if (!isFinite(a)) return null;
    if (MASS[u]) return a * MASS[u];
    if (item && item.units && item.units[u] != null) return a * item.units[u];
    if (VOL[u]) return item && item.gml ? a * VOL[u] * item.gml : null;
    if (u === 'dozen') return item && item.units && item.units.each ? a * 12 * item.units.each : null;
    return null;
  }
  // the same amount in another unit of the same item (via grams), or null
  function convert(item, amt, from, to) {
    var f = unitKey(from), t = unitKey(to);
    if (f === t) return +amt;
    if (VOL[f] && VOL[t]) return amt * VOL[f] / VOL[t];
    if (MASS[f] && MASS[t]) return amt * MASS[f] / MASS[t];
    var g = toGrams(item, amt, f); if (g == null) return null;
    if (MASS[t]) return g / MASS[t];
    if (item && item.units && item.units[t]) return g / item.units[t];
    if (VOL[t] && item && item.gml) return g / item.gml / VOL[t];
    return null;
  }

  // ---------- numbers people can measure ----------
  var FR = [[0, ''], [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [1 / 2, '½'], [2 / 3, '⅔'], [3 / 4, '¾'], [1, '']];
  var FR_TXT = { '⅛': '1/8', '¼': '1/4', '⅓': '1/3', '½': '1/2', '⅔': '2/3', '¾': '3/4' };
  // round x to the nearest of the allowed fractions (steps: list of fractions in FR to allow)
  function roundFrac(x, allow) {
    var w = Math.floor(x), f = x - w, best = 0, bd = 9;
    FR.forEach(function (p) { if (allow.indexOf(p[0]) < 0 && p[0] !== 0 && p[0] !== 1) return; var d = Math.abs(f - p[0]); if (d < bd - 1e-9) { bd = d; best = p[0]; } });
    return w + best;
  }
  function fmtFrac(x, plain) {
    if (x <= 0) return '0';
    var w = Math.floor(x + 1e-9), f = x - w, g = '';
    FR.forEach(function (p) { if (p[1] && Math.abs(f - p[0]) < 0.01) g = p[1]; });
    if (!g && f > 0.01) return fmtNum(x);
    if (plain && g) g = FR_TXT[g];
    return (w ? String(w) : '') + (w && g ? (plain ? ' ' : '') : '') + g || '0';
  }
  function fmtNum(x) {
    if (x >= 100) return String(Math.round(x));
    if (x >= 10) return String(Math.round(x * 2) / 2).replace(/\.0$/, '');
    return String(Math.round(x * 10) / 10).replace(/\.0$/, '');
  }
  var SING = { cup: 'cup', tsp: 'tsp', tbsp: 'tbsp', oz: 'oz', lb: 'lb', g: 'g', kg: 'kg', ml: 'ml', l: 'L', floz: 'fl oz', pint: 'pint', quart: 'quart', gallon: 'gallon', pinch: 'pinch', dash: 'dash', each: '' };
  var PLUR = { cup: 'cups', pint: 'pints', quart: 'quarts', gallon: 'gallons', pinch: 'pinches', dash: 'dashes' };
  function unitName(u, n) {
    u = unitKey(u).replace(/-/g, ' ');
    if (SING[u] != null) return n > 1 + 1e-9 && PLUR[u] ? PLUR[u] : SING[u];
    if (n > 1 + 1e-9) return /(shrimp|fish|count|zucchini)$/.test(u) ? u : /[^aeiou]y$/.test(u) ? u.slice(0, -1) + 'ies' : /(s|sh|ch|x|tomato|potato|mango)$/.test(u) ? u + 'es' : /f$/.test(u) ? u.slice(0, -1) + 'ves' : u + 's';
    return u;
  }

  // a scaled recipe amount, rounded for the kitchen: {n, unit, text}
  // whole things (eggs, cans, packages) round to whole numbers; produce to halves; spoons and cups to
  // measuring-set fractions; weights to half ounces or quarter pounds.
  var WHOLE = { can: 1, package: 1, jar: 1, bottle: 1, box: 1, bag: 1, egg: 1, tortilla: 1, bun: 1, slice: 1, link: 1, loaf: 1, stick: 0.5, fillet: 1, breast: 1, thigh: 1, ear: 1, clove: 1, strip: 1, leaf: 1, sprig: 1, dozen: 0.5 };
  function nice(amt, unit, item) {
    var u = unitKey(unit), a = +amt;
    if (!(a > 0)) return { n: 0, unit: u, text: '' };
    if (VOL[u] && u !== 'pinch' && u !== 'dash' && u !== 'ml' && u !== 'l') {
      var ml = a * VOL[u];
      if (u === 'floz' || u === 'pint' || u === 'quart' || u === 'gallon') {
        if (ml >= VOL.quart * 2 && u !== 'floz') { var q = roundFrac(ml / VOL.quart, [1 / 4, 1 / 2, 3 / 4]); return mk(q, 'quart'); }
        if (u === 'floz') return mk(Math.max(0.5, Math.round(a * 2) / 2), 'floz');
      }
      if (ml < VOL.tsp / 8 * 0.75) return mk(1, 'pinch');
      if (ml < VOL.tbsp - 0.5) { var t = ml / VOL.tsp; return mk(t < 1 ? Math.max(1 / 8, roundFrac(t, [1 / 8, 1 / 4, 1 / 2, 3 / 4])) : roundFrac(t, [1 / 4, 1 / 2, 3 / 4]), 'tsp'); }
      if (ml < VOL.cup / 4 - 1.5) { var tb = ml / VOL.tbsp; return mk(roundFrac(tb, [1 / 2]), 'tbsp'); }
      var c = ml / VOL.cup; return mk(c < 4 ? roundFrac(c, [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4]) : roundFrac(c, [1 / 2]), 'cup');
    }
    if (u === 'oz') { if (a >= 16 * 1.25) return mk(roundFrac(a / 16, [1 / 4, 1 / 2, 3 / 4]), 'lb'); return mk(a < 4 ? Math.max(0.5, Math.round(a * 2) / 2) : Math.round(a), 'oz'); }
    if (u === 'lb') { if (a < 0.75) return mk(Math.max(0.5, Math.round(a * 16 * 2) / 2), 'oz'); return mk(roundFrac(a, [1 / 4, 1 / 2, 3 / 4]), 'lb'); }
    if (u === 'g') { if (a >= 1000) return mk(Math.round(a / 50) * 50 / 1000, 'kg'); return mk(a < 20 ? Math.max(1, Math.round(a)) : Math.round(a / 5) * 5, 'g'); }
    if (u === 'kg') return mk(Math.round(a * 20) / 20, 'kg');
    if (u === 'ml') return mk(a < 20 ? Math.max(1, Math.round(a)) : Math.round(a / 5) * 5, 'ml');
    if (u === 'pinch' || u === 'dash') return mk(Math.max(1, Math.round(a)), u);
    // count units: whole things to whole numbers (at least one), produce and the like to halves
    var step = WHOLE[u] != null ? WHOLE[u] : (item && item.whole) ? 1 : 0.5;
    if (u === 'each' && item && item.whole) step = 1;
    var r = Math.max(step, Math.round(a / step) * step);
    return mk(r, u);
    function mk(n, uu) {
      var num = (uu === 'g' || uu === 'ml' || uu === 'kg' || uu === 'floz') ? fmtNum(n) : fmtFrac(n);
      var un = unitName(uu, n);
      return { n: n, unit: uu, text: num + (un ? ' ' + un : '') };
    }
  }

  // ---------- people ----------
  // household groups: [{k, label, n, f}] (f = portion factor). Servings are adult-sized portions.
  var DEFAULT_GROUPS = [
    { k: 'adult', label: 'Adults', n: 2, f: 1 },
    { k: 'teen', label: 'Teens', n: 0, f: 1.25 },
    { k: 'child', label: 'Children (4–12)', n: 2, f: 0.6 },
    { k: 'toddler', label: 'Toddlers (1–3)', n: 0, f: 0.4 }
  ];
  function householdServings(groups) {
    var s = 0; (groups || []).forEach(function (g) { s += Math.max(0, +g.n || 0) * Math.max(0, +g.f || 0); });
    return Math.round(s * 100) / 100;
  }
  function householdPeople(groups) { var s = 0; (groups || []).forEach(function (g) { s += Math.max(0, +g.n || 0); }); return s; }

  // ---------- recipes ----------
  // scale a recipe to `servings` portions: [{ing, item, amt, unit, g, nice}]
  function scaleRecipe(r, servings, cat) {
    var f = servings / (r.servings || 1);
    return r.ing.map(function (i) {
      var item = i.item ? cat[i.item] : null, a = (+i.amt || 0) * (i.fixed ? 1 : f);
      var g = item ? toGrams(item, a, i.unit) : null;
      return { ing: i, item: item, amt: a, unit: unitKey(i.unit), g: g, nice: i.amt ? nice(a, i.unit, item) : { text: i.unit && !i.amt ? i.unit : '', n: 0 } };
    });
  }

  // ---------- buying ----------
  // best way to buy `grams` of an item from its package sizes (item.buy: [{unit, g, label, loose, step}])
  // returns {n, opt, text, need} ; loose items (by the pound) round up to the item's step
  var TOL = 0.06; // a recipe that wants 1.04 cans gets 1 can
  // the cheapest-looking way to cover `grams`: least left over, then fewest packages; packs of up to
  // three sizes can be mixed (a 2-lb and a 1-lb package of ground beef); loose items round up to their step
  function purchase(item, grams) {
    var opts = ((item && item.buy) || []).filter(function (o) { return o.g > 0; });
    if (!opts.length || !(grams > 0)) return null;
    var need = grams * (1 - TOL), best = null;
    function consider(parts, total, count) {
      var waste = total - grams, score = Math.max(0, waste) + count * 20;
      if (!best || score < best.score - 1e-6) best = { parts: parts, score: score, g: total };
    }
    opts.filter(function (o) { return o.loose; }).forEach(function (o) {
      var st = o.step || 0.25, n = Math.max(o.min || st, Math.ceil((need / o.g) / st - 1e-9) * st);
      n = Math.round(n * 1000) / 1000;
      consider([{ n: n, opt: o }], n * o.g, 1);
    });
    var packs = opts.filter(function (o) { return !o.loose; }).sort(function (a, b) { return b.g - a.g; }).slice(0, 3);
    if (packs.length) {
      var lim = packs.map(function (o) { return Math.min(40, Math.ceil(need / o.g)); });
      (function rec(i, parts, total, count) {
        if (total >= need) { consider(parts, total, count); return; }
        if (i >= packs.length) return;
        for (var n = 0; n <= lim[i]; n++) {
          var t = total + n * packs[i].g;
          rec(i + 1, n ? parts.concat([{ n: n, opt: packs[i] }]) : parts, t, count + n);
          if (t >= need) break;
        }
      })(0, [], 0, 0);
    }
    if (!best) return null;
    return { parts: best.parts, n: best.parts[0].n, opt: best.parts[0].opt, text: best.parts.map(function (p) { return buyText(p.n, p.opt, item); }).join(' + '), g: best.g };
  }
  // "28-oz can" -> {noun:'can', size:'28 oz'}; "16-slice package" -> {noun:'package', size:'16 slices'};
  // "30-count" -> {noun:'package', size:'30 count'}; "6-pack cups" -> {noun:'pack', size:'6 cups'}; "bunch" -> {noun:'bunch'}
  var MEAS = /^(oz|ounce|lb|pound|fl[- ]oz|g|kg|ml|l|qt|quart|gal|gallon|pint|pt|inch|in)$/i;
  function parseLabel(lab) {
    lab = String(lab || '').trim().replace(/ \((meat)\)$/, '');
    var m = /^(?:1 )?(\d+(?:\.\d+)?)[- ]?(fl[- ]oz|[a-z]+)\.?(?:[- ](.+))?$/i.exec(lab);
    if (!m) return { noun: lab };
    var num = m[1], w = m[2], rest = m[3] || '', extra = '', pm = /^(.*?) \((.*)\)$/.exec(rest);
    if (pm) { rest = pm[1]; extra = ', ' + pm[2]; }
    if (MEAS.test(w)) return { noun: rest || 'package', size: num + ' ' + w.replace(/^fl-oz$/i, 'fl oz') + extra };
    if (/^(count|ct)$/i.test(w)) return { noun: rest || 'package', size: num + ' count' + extra };
    if (/^pack$/i.test(w)) return { noun: 'pack', size: num + (rest ? ' ' + rest : '') + extra };
    // "16-slice package", "25-cube jar", "4-envelope box", "2-crust box", "3-packet strip"
    return { noun: rest || 'package', size: num + ' ' + unitName(w, +num) + extra };
  }
  function labelText(n, lab, num) {
    var p = parseLabel(lab), t = num != null ? num : String(n);
    return t + ' ' + (n > 1 + 1e-9 ? pluralWords(p.noun) : p.noun) + (p.size ? ' (' + p.size + ')' : '');
  }
  function buyText(n, o, item) {
    if (o.loose) {
      var u = o.unit || 'lb';
      if (u === 'each') return item && item.countLabel ? labelText(n, item.countLabel, fmtFrac(n)) : fmtFrac(n) + ' ' + (item ? item.name.toLowerCase() : '');
      return fmtFrac(n) + ' ' + unitName(u, n);
    }
    var lab = String(o.label || unitName(o.unit || 'package', 1)).trim();
    if (/^(1 )?dozen$/i.test(lab)) return fmtFrac(n) + ' dozen';
    if (/^each$/i.test(lab)) return item && item.countLabel ? labelText(n, item.countLabel) : n + ' ' + (item ? item.name.toLowerCase() : '');
    return labelText(n, lab);
  }
  function pluralWords(lab) {
    // "can (28 oz)" -> "cans (28 oz)"; "bunch" -> "bunches"; "head of lettuce" -> "heads of lettuce"
    var m = /^(.*?)( \(.*\))?$/.exec(lab), w = m[1], rest = m[2] || '';
    var of = /^(\S+)( of .*)$/.exec(w); if (of) return unitName(of[1], 2) + of[2] + rest;
    var parts = w.split(' '), last = parts.pop();
    if (/^(dozen|each)$/.test(last) || /s$/.test(last)) return lab;
    return parts.concat([unitName(last, 2)]).join(' ') + rest;
  }
  // a total need in words: by weight for things bought by weight, by count for things bought by count
  function needText(item, grams, byUnit) {
    if (grams != null && grams > 0) {
      var u0 = item && item.buy && item.buy[0] ? item.buy[0].unit : 'lb';
      var byCount = item && item.units && item.units.each && !MASS[u0] && !VOL[u0] && (u0 === 'each' || u0 === 'dozen' || item.countLabel || !item.gml);
      if (byCount && !(item.keep === 'pantry' && item.gml)) { var n = grams / item.units.each, r = item.whole ? Math.ceil(n - 0.05) : n < 3 ? Math.round(n * 4) / 4 : Math.round(n * 2) / 2; r = Math.max(0.25, r); return 'about ' + (item.countLabel ? labelText(r, item.countLabel, fmtFrac(r)) : fmtFrac(r)); }
      if (item && item.gml && VOL[u0]) { var ml = grams / item.gml; if (ml >= VOL.quart * 1.5) return 'about ' + fmtFrac(roundFrac(ml / VOL.quart, [1 / 2])) + ' quarts'; return ml >= VOL.cup / 4 ? fmtFrac(roundFrac(ml / VOL.cup, [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4])) + ' ' + unitName('cup', ml / VOL.cup) : nice(ml / VOL.tbsp, 'tbsp').text; }
      if (item && item.gml && item.keep === 'pantry' && grams < 120) { var ml2 = grams / item.gml; return ml2 >= VOL.cup / 4 ? fmtFrac(roundFrac(ml2 / VOL.cup, [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4])) + ' ' + unitName('cup', ml2 / VOL.cup) : nice(ml2 / VOL.tbsp, 'tbsp').text; }
      var oz = grams / MASS.oz; if (grams < 3) return 'a little'; return oz >= 16 ? fmtNum(Math.round(oz / 16 * 100) / 100) + ' lb' : fmtNum(oz) + ' oz';
    }
    return Object.keys(byUnit || {}).map(function (u) { return nice(byUnit[u], u).text; }).join(' + ');
  }

  // ---------- plans ----------
  // plan: {start:'YYYY-MM-DD', days:N, slots:{breakfast:true,...}, cells:{'d|slot':[{r, lo, x}]}, guests:{'d|slot':n}}
  //   r = recipe id; lo = 'd|slot' this is leftovers of (no shopping, the cook makes extra); x = extra servings
  var SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
  function cellKey(d, s) { return d + '|' + s; }
  function parseKey(k) { var p = k.split('|'); return { d: +p[0], s: p[1] }; }
  function cellServings(plan, key, groups) {
    var g = plan.guests && plan.guests[key] ? +plan.guests[key] : 0;
    return Math.max(0, householdServings(groups) + g);
  }
  // every cooking event in a day range: [{key, d, s, r, servings, eats:[keys...]}]
  // a leftover entry adds its servings to the meal it comes from (when that meal is in the plan)
  function cookings(plan, groups, from, to, recipes) {
    from = from || 0; to = to == null ? plan.days - 1 : to;
    var out = [], idx = {};
    Object.keys(plan.cells || {}).forEach(function (k) {
      var p = parseKey(k); if (p.d < 0 || p.d >= plan.days || (plan.slots && plan.slots[p.s] === false)) return;
      (plan.cells[k] || []).forEach(function (e, i) {
        if (e.lo) return;
        var c = { key: k, i: i, d: p.d, s: p.s, r: e.r, servings: cellServings(plan, k, groups) + (+e.x || 0), eats: [k], full: !!e.full };
        idx[k + '#' + e.r] = c; out.push(c);
      });
    });
    Object.keys(plan.cells || {}).forEach(function (k) {
      var p = parseKey(k); if (p.d < 0 || p.d >= plan.days || (plan.slots && plan.slots[p.s] === false)) return;
      (plan.cells[k] || []).forEach(function (e) {
        if (!e.lo) return;
        var src = idx[e.lo + '#' + e.r];
        if (src) { src.servings += cellServings(plan, k, groups) + (+e.x || 0); src.eats.push(k); }
        else out.push({ key: k, d: p.d, s: p.s, r: e.r, servings: cellServings(plan, k, groups) + (+e.x || 0), eats: [k], orphan: true });
      });
    });
    // "cook the whole recipe": at least the recipe's own yield (the rest is for the freezer or another day)
    if (recipes) out.forEach(function (c) { var r = recipes[c.r]; c.eaten = c.servings; if (c.full && r && r.servings > c.servings) c.servings = r.servings; });
    out.sort(function (a, b) { return a.d - b.d || SLOTS.indexOf(a.s) - SLOTS.indexOf(b.s); });
    // keep the ones cooked in range
    return out.filter(function (c) { return c.d >= from && c.d <= to; });
  }

  // ---------- shopping list ----------
  // returns {rows:[{id, name, section, g, byUnit, need, buy, uses:[recipe names], writein, have}], unknown:[...]}
  function shoppingList(plan, groups, recipes, cat, opt) {
    opt = opt || {};
    var rows = {}, cooks = cookings(plan, groups, opt.from, opt.to, recipes);
    cooks.forEach(function (c) {
      var r = recipes[c.r]; if (!r || !(c.servings > 0)) return;
      scaleRecipe(r, c.servings, cat).forEach(function (s) {
        if (s.ing.opt && !opt.optional) return;
        if (s.item && s.item.noBuy) return;
        // whole things (eggs, cans, buns) are bought as the rounded amount the cook will use
        var g = s.g; if (s.item && kind(s.unit) === 'count' && s.nice.n > 0) { var g2 = toGrams(s.item, s.nice.n, s.nice.unit); if (g2 != null) g = g2; }
        addRow(rows, s.ing, s.item, s.amt, s.ing.unit, g, r.name);
      });
    });
    var list = Object.keys(rows).map(function (k) {
      var row = rows[k], item = row.item;
      if (item && row.g > 0 && !Object.keys(row.byUnit).length) {
        var p = purchase(item, row.g), small = Math.min.apply(null, item.buy.filter(function (o) { return !o.loose; }).map(function (o) { return o.g; }).concat([Infinity]));
        row.buy = p ? p.text : needText(item, row.g);
        if ((item.keep === 'pantry' || /condiment|spice|baking/.test(item.section)) && small < Infinity && row.g < small * 0.25) { row.check = item.keep === 'fridge' ? 'check fridge' : 'check pantry'; row.ifOut = row.buy; row.buy = row.check; }
        row.need = needText(item, row.g);
        row.buyG = p ? p.g : row.g;
      } else {
        // part (or all) of it could not be turned into grams: list what we have
        var parts = [];
        if (row.g > 0) parts.push(needText(item, row.g));
        Object.keys(row.byUnit).forEach(function (u) { if (row.byUnit[u] > 0) parts.push(nice(row.byUnit[u], u, item).text); else if (!row.amtless) row.amtless = true; });
        row.buy = parts.join(' + ') || (row.amtless ? 'some' : '');
        row.need = row.buy;
      }
      row.have = !!(opt.pantry && opt.pantry[k]);
      return row;
    });
    // extra items the cook adds by hand: listed as written, in their store section
    (opt.extras || []).forEach(function (x, i) {
      var item = x.item ? cat[x.item] : null;
      list.push({ id: 'x:' + (x.id || i), item: item, name: x.name || (item && item.name) || '', section: x.section || (item ? item.section : 'other'), g: 0, byUnit: {}, uses: [], writein: !item, extra: true, buy: x.qty || '', need: x.qty || '', have: !!(opt.pantry && opt.pantry['x:' + (x.id || i)]) });
    });
    var order = opt.sectionOrder || [];
    list.sort(function (a, b) {
      var ia = order.indexOf(a.section), ib = order.indexOf(b.section);
      if (ia < 0) ia = 99; if (ib < 0) ib = 99;
      return ia - ib || String(a.section).localeCompare(String(b.section)) || a.name.localeCompare(b.name);
    });
    return list;
  }
  function addRow(rows, ing, item, amt, unit, g, rname, extra) {
    var w = ing.w, key = item ? item.id : 'w:' + String((w && w.name) || '').trim().toLowerCase();
    if (key === 'w:') return;
    var row = rows[key] || (rows[key] = { id: key, item: item, name: item ? item.name : String(w.name).trim(), section: item ? item.section : (w.section || 'Other'), g: 0, byUnit: {}, uses: [], writein: !item, extra: false });
    if (g != null) row.g += g;
    else { var u = unitKey(unit); row.byUnit[u] = (row.byUnit[u] || 0) + (+amt || 0); }
    if (rname && row.uses.indexOf(rname) < 0) row.uses.push(rname);
    if (extra) row.extra = true;
  }
  function listText(list, title) {
    var out = [], sec = null;
    if (title) out.push(title, '');
    list.forEach(function (r) {
      if (r.section !== sec) { if (sec !== null) out.push(''); sec = r.section; out.push(String(sec).toUpperCase()); }
      out.push((r.have ? '[x] ' : '[ ] ') + r.name + (r.buy ? ' — ' + r.buy : '') + (r.have ? ' (have it)' : ''));
    });
    return out.join('\n');
  }

  // ---------- nutrition ----------
  var NUTR = ['kcal', 'protein', 'fat', 'satfat', 'carb', 'fiber', 'sugar', 'sodium', 'calcium', 'iron', 'potassium'];
  // FDA Daily Values for adults and children 4 and up (2,000-calorie diet; 21 CFR 101.9)
  var DV = { kcal: 2000, fat: 78, satfat: 20, carb: 275, fiber: 28, protein: 50, sodium: 2300, calcium: 1300, iron: 18, potassium: 4700 };
  var NLAB = { kcal: ['Calories', ''], protein: ['Protein', 'g'], fat: ['Fat', 'g'], satfat: ['Saturated fat', 'g'], carb: ['Carbohydrate', 'g'], fiber: ['Fiber', 'g'], sugar: ['Sugars', 'g'], sodium: ['Sodium', 'mg'], calcium: ['Calcium', 'mg'], iron: ['Iron', 'mg'], potassium: ['Potassium', 'mg'] };
  // per serving of a recipe: {n:{...}, missing:[names], status:'full'|'partial'|'none'}
  function recipeNutrition(r, cat) {
    var tot = {}, missing = [], have = 0, any = false, gIn = 0, gOut = 0;
    NUTR.forEach(function (k) { tot[k] = 0; });
    (r.ing || []).forEach(function (i) {
      if (i.opt || i.noNutr) return;
      var item = i.item ? cat[i.item] : null;
      if (!item) {
        var w = i.w || {};
        if (w.n) { any = true; have++; NUTR.forEach(function (k) { if (w.n[k] != null) tot[k] += +w.n[k]; }); }
        else missing.push((w.name || 'an item') + ' (write-in)');
        return;
      }
      var g = i.amt ? toGrams(item, i.amt, i.unit) : 0;
      if (!item.n) { missing.push(item.name); gOut += g || 0; return; }
      if (g == null) { missing.push(item.name + ' (amount)'); return; }
      any = true; have++; gIn += g;
      var ge = g * (item.edible || 1); // bone-in weight → the part that is eaten
      NUTR.forEach(function (k) { if (item.n[k] != null) tot[k] += item.n[k] * ge / 100; });
    });
    var s = r.servings || 1, n = {};
    NUTR.forEach(function (k) { n[k] = tot[k] / s; });
    // too little of the recipe has numbers to say anything useful: treat it as "no data yet"
    var cover = gIn + gOut > 0 ? gIn / (gIn + gOut) : (any ? 1 : 0);
    return { n: n, missing: missing, cover: cover, status: !any || cover < 0.6 ? 'none' : missing.length ? 'partial' : 'full' };
  }
  function pctDV(k, v) { return DV[k] ? Math.round(v / DV[k] * 100) : null; }
  // per adult-sized portion for each day of the plan: [{d, n, meals, missing:[...], status}]
  function dayNutrition(plan, recipes, cat) {
    var days = [];
    for (var d = 0; d < plan.days; d++) {
      var n = {}, missing = [], meals = 0, none = 0; NUTR.forEach(function (k) { n[k] = 0; });
      SLOTS.forEach(function (s) {
        if (plan.slots && plan.slots[s] === false) return;
        (plan.cells[cellKey(d, s)] || []).forEach(function (e) {
          var r = recipes[e.r]; if (!r) return; meals++;
          var rn = recipeNutrition(r, cat);
          if (rn.status === 'none') { none++; missing.push(r.name); return; }
          NUTR.forEach(function (k) { n[k] += rn.n[k]; });
          rn.missing.forEach(function (m) { if (missing.indexOf(m) < 0) missing.push(m); });
        });
      });
      days.push({ d: d, n: n, meals: meals, missing: missing, status: !meals ? 'empty' : none === meals ? 'none' : missing.length ? 'partial' : 'full' });
    }
    return days;
  }

  // ---------- shuffling ----------
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function isQuick(r, max) { var t = totalMinutes(r); return t != null && t <= (max || 30); }
  function totalMinutes(r) { if (r.total != null) return +r.total; if (r.prep == null && r.cook == null) return null; return (+r.prep || 0) + (+r.cook || 0); }
  function weekday(plan, d) { var p = String(plan.start || '').split('-'); var dt = new Date(+p[0], +p[1] - 1, +p[2] + d); return isNaN(dt) ? d % 7 : dt.getDay(); }
  // fill (or refill) the slots of days [from..to]: opts {slots:[...], pool:{slot:[ids]}, noRepeat:N, busy:[weekday...], quickMax, fillOnly, seed, recipes}
  // returns a new cells object; never touches leftovers or other days
  function shuffle(plan, opts) {
    var R = rng(opts.seed || 1), cells = JSON.parse(JSON.stringify(plan.cells || {})), N = opts.noRepeat == null ? 6 : +opts.noRepeat;
    var recipes = opts.recipes, busy = opts.busy || [], from = opts.from || 0, to = opts.to == null ? plan.days - 1 : opts.to;
    var slots = (opts.slots || SLOTS).filter(function (s) { return !plan.slots || plan.slots[s] !== false; });
    if (!opts.fillOnly) for (var d0 = from; d0 <= to; d0++) slots.forEach(function (s) { var k = cellKey(d0, s); if (cells[k]) { cells[k] = cells[k].filter(function (e) { return e.lo || e.keep; }); if (!cells[k].length) delete cells[k]; } });
    function usedNear(id, d, s) {
      var n = win(N, s);
      for (var dd = d - n; dd <= d + n; dd++) { if (dd === d && false) continue; var c = cells[cellKey(dd, s)]; if (c && c.some(function (e) { return e.r === id && !e.lo; })) return true; }
      // the same recipe in another slot of the same day counts too
      return SLOTS.some(function (s2) { var c = cells[cellKey(d, s2)]; return c && c.some(function (e) { return e.r === id; }); });
    }
    for (var d = from; d <= to; d++) {
      var wd = weekday(plan, d), isBusy = busy.indexOf(wd) >= 0;
      slots.forEach(function (s) {
        var k = cellKey(d, s);
        if (cells[k] && cells[k].length) return;
        var pool = (opts.pool[s] || []).filter(function (id) { return recipes[id]; });
        if (!pool.length) return;
        var needQuick = isBusy && (s === 'dinner' || opts.quickAll);
        var tries = [
          pool.filter(function (id) { return !usedNear(id, d, s) && (!needQuick || isQuick(recipes[id], opts.quickMax)); }),
          needQuick ? pool.filter(function (id) { return isQuick(recipes[id], opts.quickMax) && !usedOnDay(id, d); }) : [],
          pool.filter(function (id) { return !usedNear(id, d, s); }),
          pool.filter(function (id) { return !usedOnDay(id, d); }),
          pool
        ];
        var c = null; for (var t = 0; t < tries.length && !c; t++) if (tries[t].length) c = tries[t][Math.floor(R() * tries[t].length)];
        cells[k] = [{ r: c }];
      });
    }
    function usedOnDay(id, d) { return SLOTS.some(function (s2) { var c = cells[cellKey(d, s2)]; return c && c.some(function (e) { return e.r === id; }); }); }
    return cells;
  }
  // breakfasts and snacks repeat happily in most homes: for them the rule is just "not two days running"
  function win(N, s) { return s === 'breakfast' || s === 'snack' ? Math.min(N, 1) : N; }
  // check: [{d, s, r, why}] for repeats within N days and slow meals on busy days
  function checkRules(plan, recipes, opts) {
    var out = [], N = opts.noRepeat == null ? 6 : +opts.noRepeat, busy = opts.busy || [];
    Object.keys(plan.cells).forEach(function (k) {
      var p = parseKey(k);
      (plan.cells[k] || []).forEach(function (e) {
        if (e.lo || !recipes[e.r]) return;
        for (var dd = p.d + 1; dd <= p.d + win(N, p.s); dd++) { var c = plan.cells[cellKey(dd, p.s)]; if (c && c.some(function (x) { return x.r === e.r && !x.lo; })) out.push({ d: dd, s: p.s, r: e.r, why: 'repeat' }); }
        if (p.s === 'dinner' && busy.indexOf(weekday(plan, p.d)) >= 0 && !isQuick(recipes[e.r], opts.quickMax)) out.push({ d: p.d, s: p.s, r: e.r, why: 'slow' });
      });
    });
    return out;
  }

  // ---------- plan edits (pure: return a new cells object) ----------
  function clone(o) { return JSON.parse(JSON.stringify(o || {})); }
  function copyDay(plan, from, to) {
    var c = clone(plan.cells);
    SLOTS.forEach(function (s) { var a = c[cellKey(from, s)]; if (a && a.length) c[cellKey(to, s)] = clone(a).map(function (e) { if (e.lo) { var p = parseKey(e.lo); e.lo = cellKey(p.d + (to - from), p.s); } return e; }); else delete c[cellKey(to, s)]; });
    return c;
  }
  function swapDays(plan, a, b) {
    var c = clone(plan.cells), g = clone(plan.guests);
    function remap(e) { if (e.lo) { var p = parseKey(e.lo); if (p.d === a) e.lo = cellKey(b, p.s); else if (p.d === b) e.lo = cellKey(a, p.s); } return e; }
    Object.keys(c).forEach(function (k) { c[k] = c[k].map(remap); });
    SLOTS.forEach(function (s) {
      var ka = cellKey(a, s), kb = cellKey(b, s), x = c[ka], y = c[kb];
      if (y) c[ka] = y; else delete c[ka];
      if (x) c[kb] = x; else delete c[kb];
      var gx = g[ka], gy = g[kb];
      if (gy != null) g[ka] = gy; else delete g[ka];
      if (gx != null) g[kb] = gx; else delete g[kb];
    });
    return { cells: c, guests: g };
  }
  function copyWeek(plan, wFrom, wTo) {
    var c = clone(plan.cells);
    for (var i = 0; i < 7; i++) {
      var a = wFrom * 7 + i, b = wTo * 7 + i; if (b >= plan.days) break;
      SLOTS.forEach(function (s) {
        var x = plan.cells[cellKey(a, s)];
        if (x && x.length) c[cellKey(b, s)] = clone(x).map(function (e) { if (e.lo) { var p = parseKey(e.lo); e.lo = cellKey(p.d + (b - a), p.s); } return e; });
        else delete c[cellKey(b, s)];
      });
    }
    return c;
  }
  // cook once, eat twice: put leftovers of a meal into another slot
  function addLeftovers(plan, srcKey, r, dstKey) {
    var c = clone(plan.cells), arr = c[dstKey] || (c[dstKey] = []);
    if (!arr.some(function (e) { return e.r === r && e.lo === srcKey; })) arr.push({ r: r, lo: srcKey });
    return c;
  }
  // move entry i of cell a to cell b (leftovers keep pointing to their source; a moved source carries its leftovers' link)
  function moveEntry(plan, a, i, b, copy) {
    var c = clone(plan.cells), src = c[a] || [], e = src[i]; if (!e) return c;
    if (!copy) { src.splice(i, 1); if (!src.length) delete c[a]; }
    var dst = c[b] || (c[b] = []);
    var ne = clone(e); if (copy) delete ne.keep;
    if (ne.lo === b) delete ne.lo; // leftovers dropped onto their own source meal: just the meal
    dst.push(ne);
    if (!copy && !e.lo) Object.keys(c).forEach(function (k) { c[k].forEach(function (x) { if (x.lo === a && x.r === e.r) x.lo = b; }); });
    return c;
  }

  // ---------- prep day ----------
  // order the cook-ahead jobs: slow cooker first (it runs longest), then the oven (hottest first, longest
  // first at each temperature, one dish after another), stovetop jobs while the oven works, then the
  // no-cook jobs; each job is {r, servings}. Minutes are from the start of the session.
  function station(r) {
    var pd = r.prepDay || {}, s = String(pd.station || '').toLowerCase(), eq = (r.method || []).concat(r.equip || []).join(' ').toLowerCase();
    if (/slow|crock|pressure/.test(s) || (!s && /slow-cooker|slow cooker/.test(eq))) return 'slow';
    if (/oven|sheet|bake|roast/.test(s) || (!s && (/oven|sheet-pan|baking dish|roasting/.test(eq) || pd.oven_f))) return 'oven';
    if (/stove|pot|skillet|grill/.test(s) || (!s && (r.cook > 0))) return 'stove';
    return 'counter';
  }
  function prepDay(list) {
    var by = { slow: [], oven: [], stove: [], counter: [] };
    list.forEach(function (x) {
      var r = x.r, pd = r.prepDay || {}, where = station(r);
      var active = +pd.active || +r.prep || 10, cook = where === 'counter' ? 0 : (+r.cook || 0);
      by[where].push({ r: r, servings: x.servings, where: where, active: active, cook: cook, temp: pd.oven_f || r.ovenF || null, what: pd.ahead || '', keeps: pd.keeps_days || null });
    });
    by.slow.sort(function (a, b) { return b.cook - a.cook; });
    by.oven.sort(function (a, b) { return (b.temp || 0) - (a.temp || 0) || b.cook - a.cook; });
    by.stove.sort(function (a, b) { return b.cook - a.cook; });
    var steps = [], hands = 0, ovenFree = 0, ovenTemp = null, stoveFree = 0;
    // hands: when the cook is next free; each job takes its active minutes of the cook's time
    by.slow.forEach(function (j) { steps.push({ at: hands, j: j, ready: hands + j.active + j.cook }); hands += j.active; });
    by.oven.forEach(function (j) {
      var at = Math.max(hands, ovenFree - j.active), into = Math.max(at + j.active, ovenFree);
      steps.push({ at: at, j: j, heat: ovenTemp !== j.temp ? j.temp : null, inOven: into, ready: into + j.cook });
      ovenTemp = j.temp; hands = at + j.active; ovenFree = into + j.cook;
    });
    by.stove.forEach(function (j) { var at = Math.max(hands, stoveFree); steps.push({ at: at, j: j, ready: at + j.active + j.cook }); hands = at + Math.max(j.active, Math.min(j.cook, 10)); stoveFree = at + j.active + j.cook; });
    by.counter.forEach(function (j) { steps.push({ at: hands, j: j, ready: hands + j.active }); hands += j.active; });
    steps.sort(function (a, b) { return a.at - b.at; });
    var end = 0, slowEnd = 0; steps.forEach(function (s) { if (s.j.where === 'slow') slowEnd = Math.max(slowEnd, s.ready); else end = Math.max(end, s.ready); });
    if (!end) end = hands;
    return { steps: steps, end: end, slowEnd: slowEnd, oven: by.oven.length, slow: by.slow.length };
  }

  // ---------- the adapter: data/meals (whatever its exact shape) -> what the app uses ----------
  function pick(o, names) { if (!o) return undefined; for (var i = 0; i < names.length; i++) if (o[names[i]] != null) return o[names[i]]; return undefined; }
  function arr(x) { return x == null ? [] : Array.isArray(x) ? x : typeof x === 'object' ? Object.keys(x).map(function (k) { var v = x[k]; return v && typeof v === 'object' && !Array.isArray(v) ? Object.assign({ id: k }, v) : v; }) : [x]; }
  function normNutr(n) {
    if (!n || typeof n !== 'object') return null;
    var map = { kcal: ['kcal', 'calories', 'energy_kcal', 'energy'], protein: ['protein', 'protein_g'], fat: ['fat', 'total_fat', 'fat_g'], satfat: ['satfat', 'sat_fat', 'saturated_fat', 'saturated_fat_g', 'fat_sat'], carb: ['carb', 'carbs', 'carbohydrate', 'carbohydrate_g'], fiber: ['fiber', 'fiber_g', 'fibre'], sugar: ['sugar', 'sugars', 'sugars_g', 'total_sugars'], sodium: ['sodium', 'sodium_mg'], calcium: ['calcium', 'calcium_mg'], iron: ['iron', 'iron_mg'], potassium: ['potassium', 'potassium_mg'] };
    var o = {}, any = false;
    Object.keys(map).forEach(function (k) { var v = pick(n, map[k]); if (v != null && isFinite(+v)) { o[k] = +v; any = true; } });
    return any ? o : null;
  }
  // grams per unit from the schema's "Converting an amount to grams" rules
  function normItem(x, id) {
    var it = { id: id || x.id || x.key, name: x.name, section: pick(x, ['section', 'aisle']) || 'other', units: {}, gml: null, buy: [], allergens: arr(x.allergens).map(allergenKey), diet: arr(x.diet), n: normNutr(x.nutrition), fdc: x.fdc && x.fdc.id ? x.fdc.id : null, proxy: !!(x.fdc && (x.fdc.match === 'proxy' || x.fdc.proxy)), edible: +x.edible > 0 ? +x.edible : 1, checkLabel: !!x.check_label, countLabels: x.count_labels || {}, nsrc: x.nutrition && x.nutrition.src || '', keep: x.keep || '', guides: arr(x.guides), aliases: arr(x.aliases), note: x.note || '', countLabel: x.count_label || null };
    if (x.g_per_cup) it.gml = +x.g_per_cup / VOL.cup;
    var c = x.counts || {};
    Object.keys(c).forEach(function (u) { if (isFinite(+c[u]) && +c[u] > 0) it.units[unitKey(u)] = +c[u]; });
    it.count = !!it.units.each;
    it.whole = it.count && /\begg|tortilla|\bbun|\broll|bagel|muffin|pita|\blink|\bchop|fillet|breast|thigh|\bear\b/i.test((it.name || '') + ' ' + (it.countLabel || ''));
    var b = x.buy || {};
    arr(b.loose ? [] : b.packs).forEach(function (p) {
      var g = toGrams(it, +p.amount || 1, p.unit);
      if (!(g > 0)) return;
      var u = unitKey(p.unit);
      it.buy.push({ unit: u, g: g, label: p.label || (fmtNum(+p.amount || 1) + ' ' + unitName(u, +p.amount || 1)), plural: p.plural || null, loose: false });
    });
    if (b.loose) {
      var lu = unitKey(b.loose.unit || 'lb'), lg = toGrams(it, 1, lu);
      if (lg > 0) it.buy.push({ unit: lu, g: lg, label: unitName(lu, 1), loose: true, step: +b.loose.step || (lu === 'lb' ? 0.25 : 1), min: b.loose.min ? +b.loose.min : null });
    }
    if (!it.buy.length && b && !arr(b.packs).length && !b.loose && x.buy) it.noBuy = true;
    if (!it.buy.length) {
      if (it.units.each) it.buy.push({ unit: 'each', g: it.units.each, label: 'each', loose: true, step: 1 });
      else it.buy.push({ unit: 'lb', g: MASS.lb, label: 'lb', loose: true, step: 0.25 });
    }
    return it;
  }
  function normIng(i) {
    if (typeof i === 'string') return { item: null, amt: 0, unit: 'each', w: { name: i, section: 'other' } };
    var o = { item: i.item || null, amt: +i.amount || 0, unit: i.unit || 'each', note: i.prep || i.note || '', opt: !!i.optional, fixed: !!i.fixed, taste: !!i.to_taste, group: i.group || '', noNutr: i.in_nutrition === false };
    if (!o.item) o.w = { name: i.name || '', section: i.section || 'other', n: normNutr(i.nutrition), allergens: arr(i.allergens) };
    return o;
  }
  function normRecipe(x, id) {
    var meals = arr(x.meal || x.meals).map(function (m) { return String(m).toLowerCase(); });
    if (!meals.length) meals = ['dinner'];
    var t = x.times || {}, pd = x.prep_day || null;
    var tags = arr(x.tags).map(function (s) { return String(s).toLowerCase(); });
    var method = arr(x.method).map(function (s) { return String(s).toLowerCase(); });
    var sw = [];
    if (x.swaps && typeof x.swaps === 'object' && !Array.isArray(x.swaps)) Object.keys(x.swaps).forEach(function (k) { if (x.swaps[k]) sw.push({ k: k, text: x.swaps[k] }); });
    var fr = x.freezer, lo = x.leftovers;
    var total = t.total != null ? +t.total : (+t.prep || 0) + (+t.cook || 0) + (+t.inactive || 0);
    return {
      id: id || x.id, name: x.name, emoji: x.emoji || '', intro: x.summary || '', servings: +x.servings || 4, size: x.serving_size || '',
      meals: meals, protein: x.protein || '', method: method, tags: tags,
      prep: +t.prep || 0, cook: +t.cook || 0, inactive: +t.inactive || 0, total: total,
      equip: arr(x.equipment), ovenF: pd && pd.oven_f ? +pd.oven_f : null,
      ing: arr(x.ingredients).map(normIng), steps: arr(x.steps).map(stepText), safety: arr(x.safety),
      makeAhead: x.make_ahead || '', freezer: fr && typeof fr === 'object' ? (fr.ok ? fr.text || 'Freezes well.' : '') : (fr || ''), freezeOk: !!(fr && (fr.ok || typeof fr === 'string')),
      leftovers: lo && typeof lo === 'object' ? lo.text || '' : (lo || ''), nextDay: lo && lo.next_day || null,
      kids: x.kids || '', swaps: sw, prepDay: pd, pairs: arr(x.pairs), allergens: x.allergens ? arr(x.allergens).map(allergenKey) : null, diet: x.diet ? arr(x.diet) : null,
      guides: arr(x.guides), own: !!x.own, updated: x.updated || null
    };
  }
  function stepText(s) { return typeof s === 'string' ? s : (s && (s.text || s.step || s.do)) || ''; }
  // raw: {catalog: [...]|{id:{}}|{items:[...]}, recipes: [...]|{id:{}}|{recipes:[...]}}
  function norm(raw) {
    var cat = {}, rec = {};
    var c = raw.catalog || raw.items || {}; if (c.items) c = c.items;
    (Array.isArray(c) ? c : Object.keys(c).map(function (k) { return Object.assign({ id: k }, c[k]); })).forEach(function (x) { var it = normItem(x); if (it.id) cat[it.id] = it; });
    var r = raw.recipes || {}; if (r.recipes) r = r.recipes;
    (Array.isArray(r) ? r : Object.keys(r).map(function (k) { return Object.assign({ id: k }, r[k]); })).forEach(function (x) { var rr = normRecipe(x); if (rr.id) rec[rr.id] = rr; });
    return { cat: cat, recipes: rec };
  }
  // allergens and diet flags for a recipe (from its ingredients)
  var ALLERGENS = ['milk', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soybeans', 'sesame'];
  function allergenKey(a) { a = String(a).toLowerCase().trim().replace(/[_ ]+/g, '-'); return { egg: 'eggs', dairy: 'milk', 'tree-nut': 'tree-nuts', treenuts: 'tree-nuts', nuts: 'tree-nuts', peanut: 'peanuts', soy: 'soybeans', soybean: 'soybeans', 'crustacean-shellfish': 'shellfish', gluten: 'wheat' }[a] || a; }
  function recipeFlags(r, cat) {
    if (r.allergens && r.diet && !r.own) {
      var dd = r.diet;
      return { allergens: r.allergens.slice(), vegetarian: dd.indexOf('vegetarian') >= 0 || dd.indexOf('vegan') >= 0, vegan: dd.indexOf('vegan') >= 0, glutenFree: dd.indexOf('gluten-free') >= 0, dairyFree: dd.indexOf('dairy-free') >= 0 || r.allergens.indexOf('milk') < 0, known: true };
    }
    var al = {}, veg = true, vegan = true, gf = true, df = true, known = true;
    r.ing.forEach(function (i) {
      if (i.opt) return;
      var it = i.item ? cat[i.item] : null;
      if (!it) { known = false; arr(i.w && i.w.allergens).forEach(function (a) { al[allergenKey(a)] = 1; }); return; }
      it.allergens.forEach(function (a) { al[allergenKey(a)] = 1; });
      var d = it.diet.map(function (x) { return String(x).toLowerCase(); });
      if (d.indexOf('vegetarian') < 0 && d.indexOf('vegan') < 0) veg = false;
      if (d.indexOf('vegan') < 0) vegan = false;
      if (d.indexOf('gluten-free') < 0 && d.indexOf('gluten_free') < 0 && d.indexOf('gf') < 0) gf = false;
    });
    if (al.milk) df = false;
    if (al.wheat) gf = false;
    var tg = r.tags || [];
    if (tg.indexOf('vegetarian') >= 0) veg = true;
    if (r.protein && r.protein !== 'vegetarian') { veg = false; vegan = false; }
    if (!r.ing.length) { veg = false; vegan = false; gf = false; df = false; known = false; }
    return { allergens: Object.keys(al), vegetarian: veg, vegan: vegan, glutenFree: gf, dairyFree: df, known: known };
  }

  return {
    MASS: MASS, VOL: VOL, unitKey: unitKey, kind: kind, toGrams: toGrams, convert: convert, nice: nice, fmtFrac: fmtFrac, fmtNum: fmtNum, unitName: unitName, roundFrac: roundFrac,
    DEFAULT_GROUPS: DEFAULT_GROUPS, householdServings: householdServings, householdPeople: householdPeople, scaleRecipe: scaleRecipe,
    purchase: purchase, needText: needText, labelText: labelText, parseLabel: parseLabel, SLOTS: SLOTS, cellKey: cellKey, parseKey: parseKey, cellServings: cellServings, cookings: cookings,
    shoppingList: shoppingList, listText: listText, NUTR: NUTR, DV: DV, NLAB: NLAB, recipeNutrition: recipeNutrition, pctDV: pctDV, dayNutrition: dayNutrition,
    rng: rng, isQuick: isQuick, totalMinutes: totalMinutes, weekday: weekday, shuffle: shuffle, checkRules: checkRules,
    copyDay: copyDay, swapDays: swapDays, copyWeek: copyWeek, addLeftovers: addLeftovers, moveEntry: moveEntry, prepDay: prepDay, station: station,
    norm: norm, normItem: normItem, normRecipe: normRecipe, normNutr: normNutr, ALLERGENS: ALLERGENS, allergenKey: allergenKey, recipeFlags: recipeFlags
  };
});
