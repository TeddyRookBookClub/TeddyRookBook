/* Tests for the Meal Prep planner's math (static/meal-prep/model.js). Run: node scripts/meals/app.test.js
   Scaling, unit conversion, purchase rounding, shopping-list merging, nutrition math, shuffle rules and plan
   edits, on a small fixture in the data/meals schema; then sanity checks over the real data/meals files. */
'use strict';
var path = require('path'), fs = require('fs');
var ROOT = path.join(__dirname, '..', '..');
var M = require(path.join(ROOT, 'static', 'meal-prep', 'model.js'));
var pass = 0, fail = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log('FAIL: ' + msg); } }
function eq(a, b, msg) { ok(a === b, msg + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }
function near(a, b, tol, msg) { ok(Math.abs(a - b) <= tol, msg + ' (got ' + a + ', want ' + b + ' ± ' + tol + ')'); }

// ---------- fixture (data/meals schema) ----------
function item(id, name, sec, o) { return Object.assign({ id: id, name: name, section: sec, keep: 'fridge', g_per_cup: null, counts: {}, count_label: null, buy: { packs: [], loose: null }, allergens: [], diet: [], nutrition: null }, o); }
var N100 = function (kcal, p, f, sf, c, fib, sug, na) { return { kcal: kcal, protein: p, fat: f, satfat: sf, carb: c, fiber: fib, sugars: sug, sodium: na }; };
var catalog = { items: [
  item('beef', 'Ground beef, 85% lean', 'meat', { buy: { packs: [{ label: '1-lb package', amount: 1, unit: 'lb' }, { label: '2-lb package', amount: 2, unit: 'lb' }] }, nutrition: N100(215, 18.6, 15, 5.9, 0, 0, 0, 66) }),
  item('chicken', 'Chicken breasts', 'meat', { counts: { breast: 227 }, buy: { packs: [], loose: { unit: 'lb', step: 0.25 } }, nutrition: N100(120, 22.5, 2.6, 0.6, 0, 0, 0, 45) }),
  item('eggs', 'Eggs, large', 'dairy', { counts: { each: 50 }, count_label: 'large egg', buy: { packs: [{ label: 'dozen', amount: 12, unit: 'each' }, { label: '18-count', amount: 18, unit: 'each' }] }, allergens: ['eggs'], diet: ['vegetarian', 'gluten-free'], nutrition: N100(143, 12.6, 9.5, 3.1, 0.7, 0, 0.4, 142) }),
  item('milk', 'Whole milk', 'dairy', { g_per_cup: 244, buy: { packs: [{ label: 'half gallon', amount: 0.5, unit: 'gallon' }, { label: 'gallon', amount: 1, unit: 'gallon' }] }, allergens: ['milk'], diet: ['vegetarian', 'gluten-free'], nutrition: N100(61, 3.2, 3.3, 1.9, 4.8, 0, 5.1, 43) }),
  item('tomatoes', 'Crushed tomatoes', 'canned', { keep: 'pantry', g_per_cup: 242, counts: { can: 794 }, buy: { packs: [{ label: '28-oz can', amount: 1, unit: 'can' }] }, diet: ['vegan', 'vegetarian', 'gluten-free'], nutrition: N100(32, 1.6, 0.3, 0, 7.3, 1.9, 4.4, 186) }),
  item('onion', 'Yellow onion', 'produce', { keep: 'counter', g_per_cup: 160, counts: { each: 150 }, count_label: 'medium onion', buy: { packs: [{ label: '3-lb bag', amount: 3, unit: 'lb' }], loose: { unit: 'each', step: 1 } }, diet: ['vegan', 'vegetarian', 'gluten-free'], nutrition: N100(40, 1.1, 0.1, 0, 9.3, 1.7, 4.2, 4) }),
  item('salt', 'Kosher salt', 'spices', { keep: 'pantry', g_per_cup: 150, buy: { packs: [{ label: '3-lb box', amount: 3, unit: 'lb' }] }, diet: ['vegan', 'vegetarian', 'gluten-free'], nutrition: N100(0, 0, 0, 0, 0, 0, 0, 38758) }),
  item('pasta', 'Spaghetti', 'grains', { keep: 'pantry', buy: { packs: [{ label: '1-lb box', amount: 1, unit: 'lb' }] }, allergens: ['wheat'], diet: ['vegan', 'vegetarian'], nutrition: N100(371, 13, 1.5, 0.3, 75, 3.2, 2.7, 6) }),
  item('cheese', 'American cheese slices', 'dairy', { counts: { slice: 21 }, buy: { packs: [{ label: '16-slice package', amount: 16, unit: 'slice' }] }, allergens: ['milk'], diet: ['vegetarian'], nutrition: null }),
  item('water', 'Water', 'beverages', { keep: 'pantry', g_per_cup: 237, nutrition: N100(0, 0, 0, 0, 0, 0, 0, 4) })
] };
function ing(it, a, u, o) { return Object.assign({ item: it, amount: a, unit: u, prep: '', optional: false, to_taste: false, fixed: false }, o); }
var recipes = { recipes: [
  { id: 'spag', name: 'Spaghetti', servings: 4, meal: ['dinner'], protein: 'beef', method: ['stovetop'], tags: ['budget'], times: { prep: 10, cook: 30, total: 40 }, equipment: [], ingredients: [ing('beef', 1, 'lb'), ing('tomatoes', 1, 'can'), ing('onion', 1, 'each'), ing('salt', 1, 'tsp'), ing('pasta', 1, 'lb'), ing('water', 4, 'cup')], steps: ['Cook.'], allergens: ['wheat'], diet: ['dairy-free'], prep_day: { ahead: 'Make the sauce', station: 'stove', active: 15, keeps_days: 4 } },
  { id: 'eggs', name: 'Scrambled eggs', servings: 4, meal: ['breakfast'], protein: 'vegetarian', method: ['stovetop'], tags: ['quick'], times: { prep: 2, cook: 5, total: 7 }, ingredients: [ing('eggs', 8, 'each'), ing('milk', 0.25, 'cup'), ing('salt', 1, 'pinch', { fixed: true })], steps: [], allergens: ['eggs', 'milk'], diet: ['vegetarian', 'gluten-free'] },
  { id: 'chick', name: 'Baked chicken', servings: 4, meal: ['dinner'], protein: 'chicken', method: ['oven'], tags: [], times: { prep: 10, cook: 35, total: 45 }, ingredients: [ing('chicken', 4, 'breast'), ing('salt', 0.5, 'tsp')], steps: [], allergens: [], diet: ['gluten-free', 'dairy-free'], prep_day: { ahead: 'Bake', station: 'oven', oven_f: 400, active: 10 } },
  { id: 'roast', name: 'Pot roast', servings: 6, meal: ['dinner'], protein: 'beef', method: ['slow-cooker'], tags: [], times: { prep: 20, cook: 480, total: 500 }, ingredients: [ing('beef', 2, 'lb'), ing('onion', 2, 'each')], steps: [], allergens: [], diet: [], prep_day: { ahead: 'Start it', station: 'slow-cooker', active: 20 } },
  { id: 'grill', name: 'Grilled cheese', servings: 2, meal: ['lunch', 'dinner'], protein: 'vegetarian', method: ['stovetop'], tags: ['quick'], times: { total: 15 }, ingredients: [ing('cheese', 4, 'slice')], steps: [], allergens: ['milk', 'wheat'], diet: ['vegetarian'] }
] };
var Dt = M.norm({ catalog: catalog, recipes: recipes }), CAT = Dt.cat, R = Dt.recipes;
var G = [{ k: 'adult', n: 2, f: 1 }, { k: 'teen', n: 0, f: 1.25 }, { k: 'child', n: 2, f: 0.6 }, { k: 'toddler', n: 1, f: 0.4 }];

// ---------- units ----------
near(M.toGrams(CAT.beef, 1, 'lb'), 453.59, 0.01, '1 lb = 453.59 g');
near(M.toGrams(CAT.milk, 1, 'cup'), 244, 0.01, 'milk: 1 cup = g_per_cup');
near(M.toGrams(CAT.milk, 3, 'tbsp'), 244 * 3 / 16, 0.05, 'milk: 3 tbsp = 3/16 cup');
near(M.toGrams(CAT.salt, 1, 'tsp'), 150 / 48, 0.01, 'salt: 1 tsp = 1/48 cup');
near(M.toGrams(CAT.tomatoes, 2, 'can'), 1588, 0.01, 'count unit from counts');
near(M.toGrams(CAT.eggs, 1, 'dozen'), 600, 0.01, 'a dozen eggs');
eq(M.toGrams(CAT.beef, 1, 'cup'), null, 'no volume without g_per_cup');
eq(M.toGrams(CAT.beef, 1, 'clove'), null, 'unknown count unit is not convertible');
near(M.toGrams(CAT.milk, 8, 'fl-oz'), 244 * 8 * 29.5735 / 236.588, 0.1, 'fl-oz (schema spelling) is a volume');
near(M.convert(null, 3, 'tsp', 'tbsp'), 1, 1e-6, '3 tsp = 1 tbsp');
near(M.convert(null, 16, 'tbsp', 'cup'), 1, 1e-3, '16 tbsp = 1 cup');
near(M.convert(null, 16, 'oz', 'lb'), 1, 1e-6, '16 oz = 1 lb');
near(M.convert(CAT.milk, 488, 'g', 'cup'), 2, 1e-6, 'grams back to cups by density');
eq(M.unitKey('Tablespoons'), 'tbsp', 'unit alias tablespoons'); eq(M.unitKey('T'), 'tbsp', 'T = tablespoon'); eq(M.unitKey('t'), 'tsp', 't = teaspoon');
eq(M.unitKey('cans'), 'can', 'plural count unit');

// ---------- rounding a scaled amount ----------
eq(M.nice(0.6667, 'cup').text, '⅔ cup', '2/3 cup');
eq(M.nice(1.49, 'cup').text, '1½ cups', '1.49 cups → 1½');
eq(M.nice(4, 'tsp').text, '1⅓ tbsp'.replace('1⅓ tbsp', '1½ tbsp'), '4 tsp → 1½ tbsp (half-tablespoon steps)');
eq(M.nice(0.1, 'tsp').text, '⅛ tsp', 'tiny teaspoon → ⅛');
eq(M.nice(0.01, 'tsp').text, '1 pinch', 'very tiny → pinch');
eq(M.nice(5, 'tbsp').text, '⅓ cup', '5 tbsp → ⅓ cup');
eq(M.nice(2.4, 'each', CAT.eggs).text, '2', 'eggs round to whole');
eq(M.nice(2.6, 'each', CAT.eggs).text, '3', 'eggs round to whole (up)');
eq(M.nice(0.3, 'each', CAT.eggs).text, '1', 'at least one egg');
eq(M.nice(1.3, 'each', CAT.onion).text, '1½', 'onions to halves');
eq(M.nice(1.3, 'can').text, '1 can', 'cans to whole');
eq(M.nice(1.6, 'can').text, '2 cans', 'cans to whole, plural');
eq(M.nice(1.3, 'lb').text, '1¼ lb', 'pounds to quarters');
eq(M.nice(0.5, 'lb').text, '8 oz', 'under ¾ lb → ounces');
eq(M.nice(20, 'oz').text, '1¼ lb', '20 oz → 1¼ lb');
eq(M.nice(2, 'small-can').text, '2 small cans', 'hyphenated count unit reads as words');

// ---------- people and scaling ----------
near(M.householdServings(G), 2 + 1.2 + 0.4, 1e-9, 'household portions 2 adults + 2 children + 1 toddler');
eq(M.householdPeople(G), 5, 'household people');
var sc = M.scaleRecipe(R.eggs, 6, CAT);
eq(sc[0].nice.text, '12', 'scaled eggs 8 × 1.5 = 12');
eq(sc[1].nice.text, '⅓ cup', 'scaled milk ¼ × 1.5 = ⅜ → ⅓ cup');
eq(sc[2].nice.text, '1 pinch', 'fixed ingredient does not scale');
near(sc[0].g, 600, 1e-6, 'scaled grams');

// ---------- buying ----------
function buy(id, g) { var p = M.purchase(CAT[id], g); return p && p.text; }
eq(buy('beef', 453.6 * 2.3), '1 package (2 lb) + 1 package (1 lb)', '2.3 lb beef → 2-lb + 1-lb packages');
eq(buy('beef', 453.6 * 1.03), '1 package (1 lb)', 'within 6% → one 1-lb package');
eq(buy('beef', 453.6 * 4), '2 packages (2 lb)', '4 lb → two 2-lb packages');
eq(buy('tomatoes', 794 * 1.3), '2 cans (28 oz)', '1.3 cans → 2 cans (28 oz)');
eq(buy('eggs', 50 * 14), '1 package (18 count)', '14 eggs → 18-count');
eq(buy('eggs', 50 * 12), '1 dozen', '12 eggs → 1 dozen');
eq(buy('eggs', 50 * 30), '1 package (18 count) + 1 dozen', '30 eggs → 18 + 12');
eq(buy('chicken', 453.6 * 1.1), '1¼ lb', 'loose chicken rounds up to ¼ lb');
eq(buy('onion', 150 * 2.2), '3 medium onions', 'loose onions by count');
eq(buy('onion', 150 * 15), '15 medium onions', '15 onions: loose beats two 3-lb bags (less left over)');
eq(buy('milk', 244 * 9), '1 gallon', '9 cups of milk → a gallon');
eq(buy('cheese', 21 * 20), '2 packages (16 slices)', 'slices → 16-slice packages');

// ---------- shopping list ----------
var plan = { start: '2026-10-26', days: 7, slots: { breakfast: true, lunch: true, dinner: true, snack: false }, cells: {}, guests: {} };
plan.cells['0|dinner'] = [{ r: 'spag' }];
plan.cells['1|lunch'] = [{ r: 'spag', lo: '0|dinner' }];
plan.cells['2|dinner'] = [{ r: 'roast' }];
plan.cells['0|breakfast'] = [{ r: 'eggs' }];
plan.guests['0|dinner'] = 2;
var cooks = M.cookings(plan, G, 0, 6, R);
var c0 = cooks.filter(function (c) { return c.key === '0|dinner'; })[0];
near(c0.servings, (3.6 + 2) + 3.6, 1e-9, 'leftovers add their portions to the meal they come from (guests count once)');
eq(cooks.filter(function (c) { return c.key === '1|lunch'; }).length, 0, 'a leftover meal is not cooked again');
var list = M.shoppingList(plan, G, R, CAT, {});
function row(id) { return list.filter(function (r) { return r.id === id; })[0]; }
var beefG = 453.59 * (9.2 / 4) + 453.59 * 2 * (3.6 / 6);
near(row('beef').g, beefG, 0.5, 'beef merged across two recipes');
eq(row('beef').uses.length, 2, 'beef lists both recipes');
ok(!row('water'), 'water is not on the shopping list');
eq(row('salt').check, 'check pantry', 'a little salt → check pantry');
ok(/box/.test(row('salt').ifOut), 'check pantry still says what to buy if out');
eq(row('tomatoes').buy, '2 cans (28 oz)', '2.3 cans (scaled) → the recipe rounds to whole cans: 2');
var onionsNeed = Math.max(0.5, Math.round(9.2 / 4 * 2) / 2) + Math.max(0.5, Math.round(3.6 / 6 * 2 * 2) / 2);
near(row('onion').g / 150, onionsNeed, 1e-6, 'onions bought as the rounded amounts the recipes use');
var withHave = M.shoppingList(plan, G, R, CAT, { pantry: { beef: true } });
ok(withHave.filter(function (r) { return r.id === 'beef'; })[0].have, 'pantry tick marks a row as have');
var withX = M.shoppingList(plan, G, R, CAT, { extras: [{ id: 'a', name: 'Paper towels', section: 'household', qty: '1 pack' }] });
ok(withX.some(function (r) { return r.extra && r.name === 'Paper towels' && r.buy === '1 pack'; }), 'extras appear as written');
var day0 = M.shoppingList(plan, G, R, CAT, { from: 2, to: 2 });
eq(day0.map(function (r) { return r.id; }).sort().join(','), 'beef,onion', 'per-day list has only that day\'s cooking');
var sorted = M.shoppingList(plan, G, R, CAT, { sectionOrder: ['produce', 'meat', 'dairy', 'canned', 'grains', 'spices'] });
eq(sorted[0].section, 'produce', 'sections follow the store order');
// cook the whole recipe
var plan2 = JSON.parse(JSON.stringify(plan)); plan2.cells['2|dinner'][0].full = true;
near(M.cookings(plan2, G, 2, 2, R)[0].servings, 6, 1e-9, '"whole recipe" cooks at least the recipe\'s yield');
// text export
ok(/^\[ \] /m.test(M.listText(list)), 'plain text list has checkboxes');

// ---------- nutrition ----------
var rn = M.recipeNutrition(R.eggs, CAT);
var expK = (400 * 143 + 61 * 61 + 0.308 * 150 / 236.588 * 0) / 100 / 4;
near(rn.n.kcal, expK, 0.5, 'per-serving calories = Σ grams × kcal/100 ÷ servings');
near(rn.n.sodium, (400 * 142 + 61 * 43 + 0.308 * 150 / 236.588 * 38758) / 100 / 4, 0.5, 'per-serving sodium includes the pinch of salt');
eq(rn.status, 'full', 'all ingredients have numbers');
eq(M.pctDV('sodium', 230), 10, '%DV sodium 230 mg = 10%');
eq(M.pctDV('kcal', 500), 25, '%DV calories');
eq(M.pctDV('sugar', 10), null, 'no DV for total sugars');
eq(M.recipeNutrition(R.grill, CAT).status, 'none', 'missing nutrition → none (shown as "nutrition coming")');
var partial = M.normRecipe({ id: 'p', name: 'P', servings: 1, meal: ['dinner'], ingredients: [ing('beef', 1, 'lb'), { item: null, name: 'Secret sauce', amount: 1, unit: 'tbsp' }] });
var pn = M.recipeNutrition(partial, CAT);
eq(pn.status, 'partial', 'a write-in without nutrition makes it partial');
ok(pn.missing[0].indexOf('Secret sauce') === 0, 'missing write-in is named');
var wi = M.normRecipe({ id: 'w', name: 'W', servings: 2, meal: ['dinner'], ingredients: [{ item: null, name: 'Bread', amount: 2, unit: 'slice', nutrition: { kcal: 160, protein: 6 } }] });
near(M.recipeNutrition(wi, CAT).n.kcal, 80, 1e-9, 'write-in nutrition is for the amount used, split across servings');
var dn = M.dayNutrition(plan, R, CAT);
near(dn[1].n.kcal, M.recipeNutrition(R.spag, CAT).n.kcal, 1e-6, 'leftovers count toward the day they are eaten');
near(dn[0].n.kcal, M.recipeNutrition(R.spag, CAT).n.kcal + rn.n.kcal, 1e-6, 'a day adds its meals');

// ---------- shuffle ----------
['q1', 'q2', 'q3'].forEach(function (k) { R[k] = Object.assign({}, R.grill, { id: k }); });
['s1', 's2'].forEach(function (k) { R[k] = Object.assign({}, R.chick, { id: k }); });
var pool = { dinner: ['spag', 'chick', 'roast', 'grill', 'q1', 'q2', 'q3', 's1', 's2'], breakfast: ['eggs'] };
var empty = { start: '2026-10-26', days: 14, slots: { breakfast: true, lunch: true, dinner: true, snack: false }, cells: {}, guests: {} };
for (var seed = 1; seed <= 30; seed++) {
  var cells = M.shuffle(empty, { slots: ['dinner'], pool: pool, recipes: R, noRepeat: 3, busy: [1, 3], quickMax: 30, seed: seed });
  var p2 = Object.assign({}, empty, { cells: cells });
  var viol = M.checkRules(p2, R, { noRepeat: 3, busy: [1, 3], quickMax: 30 });
  if (viol.length) { fail++; console.log('FAIL: shuffle seed ' + seed + ' broke a rule: ' + JSON.stringify(viol[0])); break; }
  if (seed === 30) pass++;
}
var c1 = M.shuffle(empty, { slots: ['dinner'], pool: pool, recipes: R, noRepeat: 3, busy: [1], seed: 7 });
var c2 = M.shuffle(empty, { slots: ['dinner'], pool: pool, recipes: R, noRepeat: 3, busy: [1], seed: 7 });
eq(JSON.stringify(c1), JSON.stringify(c2), 'shuffle is repeatable with the same seed');
eq(M.weekday(empty, 0), 1, '2026-10-26 is a Monday');
['0', '7'].forEach(function (d) { ok(R[c1[d + '|dinner'][0].r].total <= 30, 'Monday (busy) dinner is quick, day ' + d); });
var keep = JSON.parse(JSON.stringify(empty)); keep.cells['3|dinner'] = [{ r: 'roast' }]; keep.cells['4|lunch'] = [{ r: 'roast', lo: '3|dinner' }];
var c3 = M.shuffle(keep, { slots: ['dinner', 'lunch'], pool: { dinner: pool.dinner, lunch: ['grill'] }, recipes: R, noRepeat: 2, fillOnly: true, seed: 3 });
eq(c3['3|dinner'][0].r, 'roast', 'fill-only keeps placed meals');
eq(c3['4|lunch'][0].lo, '3|dinner', 'fill-only keeps leftovers');
var c4 = M.shuffle(keep, { slots: ['dinner', 'lunch'], pool: { dinner: pool.dinner, lunch: ['grill'] }, recipes: R, noRepeat: 2, fillOnly: false, seed: 3 });
eq(c4['4|lunch'][0].lo, '3|dinner', 'replace-all still keeps leftovers');
var bf = M.shuffle(empty, { slots: ['breakfast'], pool: { breakfast: ['eggs'] }, recipes: R, noRepeat: 6, seed: 2 });
eq(Object.keys(bf).length, 14, 'a one-recipe pool still fills every breakfast (rules relax rather than leave gaps)');
eq(M.checkRules(Object.assign({}, empty, { cells: { '0|breakfast': [{ r: 'eggs' }], '2|breakfast': [{ r: 'eggs' }] } }), R, { noRepeat: 6 }).length, 0, 'breakfast may repeat after a day');
eq(M.checkRules(Object.assign({}, empty, { cells: { '0|breakfast': [{ r: 'eggs' }], '1|breakfast': [{ r: 'eggs' }] } }), R, { noRepeat: 6 }).length, 1, 'breakfast two days running is flagged');

// ---------- plan edits ----------
var pe = { days: 14, cells: { '0|dinner': [{ r: 'spag' }], '1|lunch': [{ r: 'spag', lo: '0|dinner' }], '2|dinner': [{ r: 'chick' }] }, guests: { '0|dinner': 2 } };
var cd = M.copyDay(pe, 0, 5); eq(cd['5|dinner'][0].r, 'spag', 'copy a day');
var cd2 = M.copyDay(pe, 1, 6); eq(cd2['6|lunch'][0].lo, '5|dinner', 'copied leftovers point to the matching day');
var sw = M.swapDays(pe, 0, 2); eq(sw.cells['2|dinner'][0].r, 'spag', 'swap days moves meals'); eq(sw.cells['1|lunch'][0].lo, '2|dinner', 'swap days re-points leftovers'); eq(sw.guests['2|dinner'], 2, 'swap days moves guests');
var cw = M.copyWeek(pe, 0, 1); eq(cw['7|dinner'][0].r, 'spag', 'copy week'); eq(cw['8|lunch'][0].lo, '7|dinner', 'copy week keeps leftovers linked');
var mv = M.moveEntry(pe, '0|dinner', 0, '3|dinner'); ok(!mv['0|dinner'], 'move empties the source'); eq(mv['1|lunch'][0].lo, '3|dinner', 'moving a meal carries its leftovers link');
var cp = M.moveEntry(pe, '2|dinner', 0, '4|dinner', true); eq(cp['2|dinner'][0].r, 'chick', 'copy keeps the source'); eq(cp['4|dinner'][0].r, 'chick', 'copy adds the target');
var lo = M.addLeftovers(pe, '2|dinner', 'chick', '3|lunch'); eq(lo['3|lunch'][0].lo, '2|dinner', 'add leftovers');
eq(M.addLeftovers({ cells: lo }, '2|dinner', 'chick', '3|lunch')['3|lunch'].length, 1, 'adding the same leftovers twice does nothing');

// ---------- prep day ----------
var pd = M.prepDay([{ r: R.spag, servings: 4 }, { r: R.chick, servings: 4 }, { r: R.roast, servings: 6 }]);
eq(pd.steps[0].j.r.id, 'roast', 'slow cooker goes first');
eq(pd.steps.filter(function (s) { return s.j.where === 'oven'; })[0].heat, 400, 'oven step says to heat the oven');
ok(pd.end < pd.slowEnd, 'packing time does not wait for the slow cooker');
ok(pd.steps.every(function (s) { return s.at >= 0 && s.ready >= s.at; }), 'prep steps have sane times');

// ---------- labels ----------
eq(M.purchase(M.normItem({ id: 'x', name: 'X', section: 'p', counts: { each: 26 }, buy: { packs: [{ label: '30-count', amount: 30, unit: 'each' }] } }), 26 * 10).text, '1 package (30 count)', '"30-count" label');
eq(M.purchase(M.normItem({ id: 'x', name: 'Whole chicken', section: 'meat', counts: { each: 1800 }, count_label: '4-lb chicken', buy: { packs: [], loose: { unit: 'each', step: 1 } } }), 1800).text, '1 chicken (4 lb)', 'count label with a size');
eq(M.purchase(M.normItem({ id: 'x', name: 'Butter', section: 'dairy', counts: { stick: 113 }, buy: { packs: [{ label: '1-lb box (4 sticks)', amount: 1, unit: 'lb' }] } }), 900).text, '2 boxes (1 lb, 4 sticks)', 'label with a note');

// ---------- the real data, if it is there ----------
var dir = path.join(ROOT, 'data', 'meals');
if (fs.existsSync(path.join(dir, 'recipes.json')) && fs.existsSync(path.join(dir, 'catalog.json'))) {
  var real = M.norm({ catalog: JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8')), recipes: JSON.parse(fs.readFileSync(path.join(dir, 'recipes.json'), 'utf8')) });
  var ids = Object.keys(real.recipes), bad = [];
  ids.forEach(function (id) {
    var r = real.recipes[id];
    r.ing.forEach(function (i) { if (!i.item) return; var it = real.cat[i.item]; if (!it) bad.push(id + ': no item ' + i.item); else if (i.amt && M.toGrams(it, i.amt, i.unit) == null) bad.push(id + ': ' + i.item + ' in ' + i.unit); });
    [1, 2.6, 4, 9.5].forEach(function (s) { M.scaleRecipe(r, s, real.cat).forEach(function (x) { if (x.ing.amt && !x.nice.text) bad.push(id + ': empty amount at ' + s); if (/NaN|undefined/.test(x.nice.text)) bad.push(id + ': ' + x.nice.text); }); });
    var n = M.recipeNutrition(r, real.cat); if (n.status !== 'none' && !(n.n.kcal >= 0 && n.n.kcal < 3000)) bad.push(id + ': kcal ' + n.n.kcal);
  });
  eq(bad.length, 0, 'real recipes scale and convert cleanly' + (bad.length ? ': ' + bad.slice(0, 5).join('; ') : ''));
  var big = { start: '2026-10-26', days: 31, slots: { breakfast: true, lunch: true, dinner: true, snack: true }, cells: {}, guests: {} };
  ids.forEach(function (id, k) { var r = real.recipes[id]; big.cells[(k % 31) + '|' + (r.meals[0] === 'side' ? 'dinner' : r.meals[0])] = [{ r: id }]; });
  var bl = M.shoppingList(big, M.DEFAULT_GROUPS, real.recipes, real.cat, {});
  var badRows = bl.filter(function (r) { return !r.buy || /NaN|undefined|null/.test(r.buy + r.need); });
  eq(badRows.length, 0, 'every row of a month-long list has something to buy' + (badRows.length ? ': ' + badRows.slice(0, 5).map(function (r) { return r.name + '=' + r.buy; }).join('; ') : ''));
  console.log('real data: ' + ids.length + ' recipes, ' + Object.keys(real.cat).length + ' items, month list ' + bl.length + ' rows');
}

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
