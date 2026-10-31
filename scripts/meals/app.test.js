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

// ---------- from scratch: substitution, scaling, merging, nutrition ----------
var cat2 = JSON.parse(JSON.stringify(catalog));
cat2.items.push(
  item('flour', 'All-purpose flour', 'baking', { keep: 'pantry', g_per_cup: 125, buy: { packs: [{ label: '5-lb bag', amount: 5, unit: 'lb' }] }, allergens: ['wheat'], diet: ['vegan', 'vegetarian'], nutrition: N100(364, 10.3, 1, 0.2, 76.3, 2.7, 0.3, 2) }),
  item('yeast', 'Active dry yeast', 'baking', { keep: 'pantry', g_per_cup: 149, counts: { package: 7 }, buy: { packs: [{ label: '3-packet strip', amount: 3, unit: 'package' }] }, diet: ['vegan', 'vegetarian', 'gluten-free'], nutrition: N100(325, 40.4, 7.6, 1, 41.2, 26.9, 0, 51) }),
  item('bread', 'Sandwich bread, white', 'bakery', { counts: { slice: 28 }, buy: { packs: [{ label: '20-oz loaf', amount: 20, unit: 'oz' }] }, allergens: ['wheat'], diet: ['vegan', 'vegetarian'], nutrition: N100(266, 7.6, 3.3, 0.7, 49.4, 2.4, 5.7, 490) }),
  item('crumbs', 'Dry breadcrumbs', 'baking', { keep: 'pantry', g_per_cup: 108, buy: { packs: [{ label: '15-oz canister', amount: 15, unit: 'oz' }] }, allergens: ['wheat'], nutrition: N100(395, 13.4, 5.3, 1.2, 71.9, 4.5, 6.2, 732) }),
  item('broth', 'Chicken broth', 'canned', { keep: 'pantry', g_per_cup: 240, buy: { packs: [{ label: '32-oz carton', amount: 1, unit: 'quart' }] }, nutrition: N100(6, 0.6, 0.2, 0.1, 0.4, 0, 0.2, 371) }),
  item('wings', 'Chicken wings', 'meat', { buy: { packs: [], loose: { unit: 'lb', step: 0.25 } }, nutrition: N100(191, 17.5, 12.9, 3.7, 0, 0, 0, 73) }),
  item('tomato', 'Tomatoes', 'produce', { keep: 'counter', g_per_cup: 180, counts: { each: 123 }, count_label: 'medium tomato', buy: { packs: [], loose: { unit: 'each', step: 1 } }, diet: ['vegan', 'vegetarian', 'gluten-free'], nutrition: N100(18, 0.9, 0.2, 0, 3.9, 1.2, 2.6, 5) })
);
var pans = [{ id: '9x5', label: '9 × 5-inch loaf pan', f: 1 }, { id: '8x4', label: '8½ × 4½-inch loaf pan', f: 0.75 }];
var scratchRaw = { recipes: [
  { id: 'crumbs-s', name: 'Dry breadcrumbs', kind: 'scratch', makes: [{ item: 'crumbs', by: 'g', n: 150 }], batch: { step: 0.25, min: 0.25 }, ingredients: [ing('bread', 8, 'slice')],
    stages: [{ do: 'Dry at 300°F', station: 'oven', temp: 300, cook: 20 }], plan: { keep_days: 90, freeze: true }, nutrition: { from: 'ingredients' } },
  { id: 'bread-s', name: 'Sandwich bread', kind: 'scratch', makes: [{ item: 'bread', by: 'slice', n: 16 }], batch: { step: 0.25, min: 0.75, pans: pans },
    ingredients: [ing('flour', 480, 'g'), ing('yeast', 7, 'g'), ing('salt', 9, 'g'), ing('milk', 1, 'cup'), ing('water', 0.3333, 'cup')],
    stages: [{ do: 'Mix and knead', active: 25, wait: 90 }, { do: 'Shape', active: 10, wait: 50 }, { do: 'Bake at 350°F', station: 'oven', temp: 350, cook: 38 }, { do: 'Cool', wait: 60, bg: true }],
    plan: { keep_days: 3, freeze: true, lead_days: 0 }, nutrition: { from: 'ingredients' } },
  { id: 'stock-s', name: 'Chicken stock', kind: 'scratch', makes: [{ item: 'broth', by: 'cup', n: 12 }], batch: { step: 0.25, min: 0.25 }, ingredients: [ing('wings', 3, 'lb'), ing('water', 16, 'cup')],
    stages: [{ do: 'Simmer', station: 'simmer', cook: 210, bg: true }], plan: { keep_days: 2, freeze: true }, nutrition: { from: 'usda', fdc: 172884, per100: { kcal: 36, protein: 2.52, fat: 1.2, satfat: 0.32, carb: 3.53, fiber: 0, sugars: 1.58, sodium: 143 } } },
  { id: 'sub-s', name: 'Crumb stand-in', kind: 'stand-in', makes: [{ item: 'milk', by: 'cup', n: 1 }], batch: { step: 0.25 }, ingredients: [ing('water', 1, 'cup')], stages: [], plan: {}, nutrition: { from: 'item' } }
] };
var D2 = M.norm({ catalog: cat2, recipes: recipes }), CAT2 = D2.cat, SS = M.normScratch(scratchRaw, CAT2);
eq(SS.byItem.bread, 'bread-s', 'scratch recipe found by the item it makes');
ok(SS.order.indexOf('crumbs-s') < SS.order.indexOf('bread-s'), 'a recipe comes before the scratch recipes it uses (crumbs before bread)');
eq(SS.byId['crumbs-s'].needs.join(), 'bread-s', 'crumbs need homemade bread');
near(SS.byId['bread-s'].makes[0].g, 16 * 28, 1e-9, 'one loaf stands in for 16 store slices');
var b1 = M.scratchBatches(SS.byId['bread-s'], 1.5);
eq(b1.n, 1.5, '1.5 loaves needed → 1.5'); eq(b1.pans.map(function (p) { return p.count + 'x' + p.id; }).join(), '2x8x4', '1.5 loaves → two 8½ × 4½ pans');
var b2 = M.scratchBatches(SS.byId['bread-s'], 1.6);
eq(b2.n, 1.75, '1.6 loaves → 1.75'); eq(b2.pans.map(function (p) { return p.count + 'x' + p.id; }).join(), '1x9x5,1x8x4', '1.6 loaves → a 9 × 5 and an 8½ × 4½');
eq(M.scratchBatches(SS.byId['bread-s'], 1.03).n, 1, 'within 6% of a loaf → one loaf');
eq(M.scratchBatches(SS.byId['bread-s'], 0.3).n, 0.75, 'small need → the smallest pan');
eq(M.scratchBatches(SS.byId['stock-s'], 0.3).n, 0.5, 'rounds up to the step (¼ batch)');
near(M.scratchFor(SS.byId['bread-s'], { bread: 24 * 28 }).raw, 1.5, 1e-9, '24 slices = 1.5 loaves');
var scS = M.scaleScratch(SS.byId['bread-s'], 1.5, CAT2);
near(scS[0].g, 720, 1e-9, 'flour scales by weight: 1.5 × 480 g'); near(scS[1].g, 10.5, 1e-9, 'yeast scales by weight: 1.5 × 7 g'); near(scS[2].g, 13.5, 1e-9, 'salt scales by weight');
// the shopping list: "toast" uses 8 slices for 4 servings; making the bread swaps it for flour, yeast, salt, milk
recipes.recipes.push({ id: 'toast', name: 'Toast', servings: 4, meal: ['breakfast'], protein: 'vegetarian', method: [], tags: [], times: { total: 5 }, ingredients: [ing('bread', 8, 'slice'), ing('milk', 1, 'cup')], steps: [], allergens: ['wheat', 'milk'], diet: ['vegetarian'] });
recipes.recipes.push({ id: 'pancake', name: 'Pancakes', servings: 4, meal: ['breakfast'], protein: 'vegetarian', method: [], tags: [], times: { total: 20 }, ingredients: [ing('flour', 1, 'cup'), ing('tomato', 2, 'each')], steps: [], allergens: ['wheat'], diet: ['vegetarian'] });
recipes.recipes.push({ id: 'meatballs', name: 'Meatballs', servings: 4, meal: ['dinner'], protein: 'beef', method: [], tags: [], times: { total: 40 }, ingredients: [ing('beef', 1, 'lb'), ing('crumbs', 0.5, 'cup'), ing('broth', 2, 'cup')], steps: [], allergens: ['wheat'], diet: [] });
D2 = M.norm({ catalog: cat2, recipes: recipes }); CAT2 = D2.cat; SS = M.normScratch(scratchRaw, CAT2);
var G4 = [{ k: 'adult', n: 4, f: 1 }];
var sp = { start: '2026-07-06', days: 7, slots: { breakfast: true, lunch: true, dinner: true, snack: false }, cells: { '0|breakfast': [{ r: 'toast' }], '1|breakfast': [{ r: 'toast' }], '2|breakfast': [{ r: 'toast' }], '1|lunch': [{ r: 'pancake' }] }, guests: {} };
function mk(ids) { return { S: SS, make: function (id) { return ids.indexOf(id) >= 0; } }; }
var rep = {}, plainL = M.shoppingList(sp, G4, D2.recipes, CAT2, {}), madeL = M.shoppingList(sp, G4, D2.recipes, CAT2, { scratch: mk(['bread']), report: rep });
function rowOf(l, id) { return l.filter(function (r) { return r.id === id; })[0]; }
ok(rowOf(plainL, 'bread') && !rowOf(madeL, 'bread'), 'making the bread takes it off the list');
eq(rep.made.length, 1, 'the report lists one thing made from scratch');
near(rep.made[0].items.bread, 24 * 28, 1e-6, '3 breakfasts × 8 slices = 24 slices needed');
eq(rep.made[0].b.n, 1.5, 'so 1½ loaves are made');
near(rowOf(madeL, 'flour').g, 720 + 125, 0.01, 'the bread’s flour merges with the pancakes’ flour');
ok(rowOf(madeL, 'flour').uses.indexOf('Sandwich bread (homemade)') >= 0 && rowOf(madeL, 'flour').uses.indexOf('Pancakes') >= 0, 'the merged flour row lists both uses');
near(rowOf(madeL, 'milk').g, 244 * 3 + 244 * 1.5, 0.01, 'the bread’s milk merges with the toast’s milk');
ok(!rowOf(madeL, 'water'), 'water from a scratch recipe is never on the list');
ok(rowOf(madeL, 'yeast') && /packet|strip|pantry/.test(rowOf(madeL, 'yeast').buy), 'yeast is bought in packets (' + (rowOf(madeL, 'yeast') || {}).buy + ')');
eq(Object.keys(rep.made[0].byDay).sort().join(), '0,1,2', 'needs are recorded by the day they’re eaten');
// nested: meatballs need crumbs; making crumbs and bread makes the bread for the crumbs too
var rep2 = {}, nest = M.shoppingList({ start: '2026-07-06', days: 7, slots: sp.slots, cells: { '3|dinner': [{ r: 'meatballs' }] }, guests: {} }, G4, D2.recipes, CAT2, { scratch: mk(['crumbs', 'bread']), report: rep2 });
eq(rep2.made.map(function (j) { return j.s.id; }).join(), 'crumbs-s,bread-s', 'homemade crumbs call for homemade bread');
near(rep2.made[1].items.bread, M.scaleScratch(SS.byId['crumbs-s'], rep2.made[0].b.n, CAT2)[0].g, 1e-6, 'the bread needed is what the crumbs use');
ok(!rowOf(nest, 'crumbs') && !rowOf(nest, 'bread') && rowOf(nest, 'flour'), 'neither crumbs nor bread is bought; flour is');
eq(rowOf(nest, 'flour').uses.join(), 'Sandwich bread (homemade)', 'the flour is for the homemade bread');
var nest2 = M.shoppingList({ start: '2026-07-06', days: 7, slots: sp.slots, cells: { '3|dinner': [{ r: 'meatballs' }] }, guests: {} }, G4, D2.recipes, CAT2, { scratch: mk(['crumbs']) });
ok(rowOf(nest2, 'bread') && rowOf(nest2, 'bread').uses[0] === 'Dry breadcrumbs (homemade)', 'homemade crumbs from store bread put the bread on the list');
// nutrition of the homemade version, computed from its ingredients
var bn = M.scratchNutr(SS.byId['bread-s'], CAT2, 'bread'), batchK = (480 * 364 + 7 * 325 + 9 * 0 + 244 * 61 + 0.3333 * 237 * 0) / 100;
near(bn.n.kcal, batchK / (16 * 28) * 100, 0.01, 'homemade bread: a batch’s calories over the 16 slices it replaces');
var CW = M.catalogWith(CAT2, SS, { bread: true });
near(M.recipeNutrition(D2.recipes.toast, CW).n.kcal, (2 * batchK / 16 + 244 * 61 / 100 / 4 * 4 / 4 * 1) , 0.5, 'toast with homemade bread: 2 homemade slices a serving (plus its milk)');
ok(M.recipeNutrition(D2.recipes.toast, CW).n.kcal > M.recipeNutrition(D2.recipes.toast, CAT2).n.kcal, 'homemade slices are bigger than store slices, so the toast has more calories');
eq(CW.bread.scratch, 'bread-s', 'the swapped item says where its numbers come from');
eq(M.catalogWith(CAT2, SS, {}), CAT2, 'nothing made → the same catalog');
near(M.scratchNutr(SS.byId['stock-s'], CAT2, 'broth').n.sodium, 143, 1e-9, 'strained stock uses its USDA home-made numbers');
eq(M.scratchNutr(SS.byId['sub-s'], CAT2, 'milk').n, CAT2.milk.n, '"from: item" uses the store item’s numbers');

// ---------- the garden: what's covered, when ----------
var GM = M.normGardenMap({ crops: { tomatoes: { months: [7, 8, 9], store_months: 0 }, potatoes: { months: [8], store_months: 6 } }, animals: { hens: { months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], store_months: 1 } },
  items: [{ item: 'tomato', crop: 'tomatoes', f: 1 }, { item: 'eggs', animal: 'hens', f: 1 }, { item: 'potato', crop: 'potatoes', f: 1 }] });
var grow = { crops: { tomatoes: { on: true, m: [7, 8, 9] }, potatoes: { on: true, m: [8], store: true } }, animals: { hens: { on: false, m: [] } } };
eq(M.growCovers(grow, GM, 'tomato', 8).how, 'harvest', 'tomatoes in August: from the garden');
eq(M.growCovers(grow, GM, 'tomato', 11), null, 'tomatoes in November: bought (they don’t store)');
eq(M.growCovers(grow, GM, 'potato', 12).how, 'stored', 'potatoes in December: from storage (6 months after August)');
eq(M.growCovers(grow, GM, 'potato', 3), null, 'potatoes in March: past their storage months');
eq(M.growCovers({ crops: { potatoes: { on: true, m: [8], store: false } } }, GM, 'potato', 12), null, 'not stored → bought outside the harvest');
eq(M.growCovers(grow, GM, 'eggs', 5), null, 'hens turned off → eggs bought');
eq(M.growCovers({ crops: { tomatoes: { on: true, m: [11, 12, 1] } } }, GM, 'tomato', 1).how, 'harvest', 'harvest months can run past December');
eq(M.monthOf({ start: '2026-07-30' }, 3), 8, 'plan day 3 from July 30 is in August');
var gl = M.shoppingList(sp, G4, D2.recipes, CAT2, { garden: { covers: function (id, d) { return M.growCovers(grow, GM, id, M.monthOf(sp, d)); } } });
ok(rowOf(gl, 'g:tomato') && rowOf(gl, 'g:tomato').garden && !rowOf(gl, 'tomato'), 'July tomatoes move to “From your garden”');
eq(rowOf(gl, 'g:tomato').section, 'garden', 'garden rows have their own section');
ok(/tomato/.test(rowOf(gl, 'g:tomato').need), 'garden rows say how much to pick (' + rowOf(gl, 'g:tomato').need + ')');
var spN = JSON.parse(JSON.stringify(sp)); spN.start = '2026-11-02';
var glN = M.shoppingList(spN, G4, D2.recipes, CAT2, { garden: { covers: function (id, d) { return M.growCovers(grow, GM, id, M.monthOf(spN, d)); } } });
ok(rowOf(glN, 'tomato') && !rowOf(glN, 'g:tomato'), 'November tomatoes are bought');
var gp = M.growPlan(gl, GM, { tomatoes: { n: 'Tomatoes', y: 71, sq: 7, dh: [52, 120], se: 'warm' } }, 52, {});
near(gp[0].lb, rowOf(gl, 'g:tomato').g * 52 / 453.59237, 1e-6, 'grow view: a year of the plan’s tomatoes in pounds');
near(gp[0].sqft, gp[0].lb / 0.71, 1e-6, 'space = pounds ÷ yield per square foot (71 lb per 100 sq ft)');
eq(gp[0].plants, Math.ceil(gp[0].sqft / 7), 'plants = space ÷ space per plant');

// ---------- prep day with from-scratch jobs ----------
var sch = M.scratchSchedule([{ s: SS.byId['bread-s'], n: 1.5, byDay: { 0: 0.5, 1: 0.5, 2: 0.5 } }], -1)[0];
eq(sch.parts.length, 1, 'bread for days 0–2 keeps from prep day'); eq(sch.parts[0].day, -1, 'made on prep day'); eq(sch.parts[0].freeze, null, 'nothing to freeze');
var sch2 = M.scratchSchedule([{ s: SS.byId['bread-s'], n: 1.5, byDay: { 0: 0.5, 5: 1 } }], -1)[0];
ok(sch2.parts[0].day === -1 && sch2.parts[0].freeze && sch2.parts[0].freeze.from === 5, 'bread for Saturday is baked on prep day and frozen');
near(sch2.parts[0].freeze.share, 2 / 3, 1e-9, 'the frozen share is Saturday’s part');
var mayo = { id: 'm', name: 'Mayo', plan: { keep_days: 2, freeze: false } };
var sch3 = M.scratchSchedule([{ s: mayo, n: 2, byDay: { 1: 1, 5: 1 } }], -1)[0];
eq(sch3.parts.map(function (p) { return p.day; }).join(), '-1,5', 'a short-keeping, unfreezable item is made again for later in the week');
var pick = M.scratchSchedule([{ s: { plan: { keep_days: 30, lead_days: 1 } }, n: 1, byDay: { 0: 1 } }], -1)[0];
eq(pick.parts[0].day, -1, 'pickles needed day 0 with a day’s lead: prep day');
var pick2 = M.scratchSchedule([{ s: { plan: { keep_days: 30, lead_days: 1 } }, n: 1, byDay: { 0: 1 } }], 0)[0];
eq(pick2.parts[0].day, -1, 'too late for a prep day on day 0: made the day before');
var pdS = M.prepDay([{ r: R.chick, servings: 4 }, { s: SS.byId['bread-s'], n: 1.5 }, { s: SS.byId['crumbs-s'], n: 0.5, after: ['bread-s'] }]);
var breadBake = pdS.steps.filter(function (s) { return s.j.s && s.j.s.id === 'bread-s' && s.inOven != null; })[0], chickBake = pdS.steps.filter(function (s) { return s.j.r && s.inOven != null; })[0], crumbBake = pdS.steps.filter(function (s) { return s.j.s && s.j.s.id === 'crumbs-s'; })[0];
eq(pdS.steps[0].j.s && pdS.steps[0].j.s.id, 'bread-s', 'the dough is mixed first, so it can rise');
eq(breadBake.inOven, 25 + 90 + 10 + 50, 'the bread goes in when it has risen twice');
ok(chickBake.inOven + 35 <= breadBake.inOven || chickBake.inOven >= breadBake.inOven + 38, 'the chicken bakes around the bread, not at the same time');
ok(crumbBake.at >= breadBake.ready + 60, 'crumbs from homemade bread wait until it has baked and cooled');
eq(breadBake.heat, 350, 'heat the oven for the bread');
ok(pdS.steps.every(function (s) { return s.at >= 0 && s.ready >= s.at; }), 'scratch steps have sane times');
eq(pdS.scratch, 2, 'two from-scratch jobs scheduled');
eq(pdS.steps.filter(function (s) { return s.sg && s.sg.bg; }).length, 1, 'cooling is background time');

// ---------- the real data, if it is there ----------
var dir = path.join(ROOT, 'data', 'meals');
if (fs.existsSync(path.join(dir, 'recipes.json')) && fs.existsSync(path.join(dir, 'catalog.json'))) {
  var real = M.norm({ catalog: JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8')), recipes: { recipes: require('./load-recipes').loadRecipes(path.join(dir, '..', '..')).recipes } });
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
  // from scratch on the real data: every recipe scales, has nutrition for what it makes, and a month of meals with
  // everything made at home still gives a clean list
  var rs = JSON.parse(fs.readFileSync(path.join(dir, 'scratch.json'), 'utf8')), RS = M.normScratch(rs, real.cat), badS = [];
  Object.keys(RS.byId).forEach(function (id) {
    var s = RS.byId[id];
    if (rs.recipes.filter(function (x) { return x.id === id; })[0].makes.length !== s.makes.length) badS.push(id + ': a "makes" item didn’t convert');
    [0.25, 1, 2.3].forEach(function (n) { M.scaleScratch(s, n, real.cat).forEach(function (x) { if (!x.item) badS.push(id + ': unknown item'); else if (x.g == null || !(x.g > 0) || /NaN|undefined/.test(x.nice.text)) badS.push(id + ': ' + x.ing.item + ' at ×' + n); }); });
    s.makes.forEach(function (m) { var sn = M.scratchNutr(s, real.cat, m.item); if (!sn || !(sn.n.kcal >= 0) || isNaN(sn.n.sodium)) badS.push(id + ': no nutrition for ' + m.item); });
  });
  eq(badS.length, 0, 'real scratch recipes scale and have nutrition' + (badS.length ? ': ' + badS.slice(0, 5).join('; ') : ''));
  var repR = {}, all = M.shoppingList(big, M.DEFAULT_GROUPS, real.recipes, real.cat, { scratch: { S: RS, make: function () { return true; } }, report: repR });
  var badR = all.filter(function (r) { return !r.buy || /NaN|undefined|null/.test(r.buy + r.need); });
  eq(badR.length, 0, 'a month with everything made at home has a clean list' + (badR.length ? ': ' + badR.slice(0, 5).map(function (r) { return r.name + '=' + r.buy; }).join('; ') : ''));
  ok(repR.made.length >= 15 && all.every(function (r) { return !r.item || !RS.byItem[r.item.id] || r.uses.every(function (u) { return / \(homemade\)$/.test(u); }); }), 'every item with a scratch recipe is swapped out; only starters for homemade batches (yogurt) are bought (' + repR.made.length + ' made)');
  var CWR = M.catalogWith(real.cat, RS, (function () { var o = {}; Object.keys(RS.byItem).forEach(function (k) { o[k] = true; }); return o; })()), badN = [];
  ids.forEach(function (id) { var n = M.recipeNutrition(real.recipes[id], CWR); if (n.status !== 'none' && !(n.n.kcal > 0 && n.n.kcal < 3000)) badN.push(id + ' ' + n.n.kcal); });
  eq(badN.length, 0, 'real recipes with homemade ingredients have sane nutrition' + (badN.length ? ': ' + badN.join('; ') : ''));
  var gmR = M.normGardenMap(JSON.parse(fs.readFileSync(path.join(dir, 'garden-map.json'), 'utf8')));
  var everything = { crops: {}, animals: { hens: { on: true, m: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } } }; Object.keys(gmR.crops).forEach(function (k) { everything.crops[k] = { on: true, m: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }; });
  var allG = M.shoppingList(big, M.DEFAULT_GROUPS, real.recipes, real.cat, { garden: { covers: function (id, d) { return M.growCovers(everything, gmR, id, M.monthOf(big, d)); } } });
  ok(allG.filter(function (r) { return r.garden; }).length > 20 && allG.every(function (r) { return !r.garden || (r.need && !/NaN/.test(r.need)); }), 'growing everything moves the produce and eggs to the garden section');
  // ---------- breads ----------
  var groups = []; rs.recipes.forEach(function (r) { if (groups.indexOf(r.group) < 0) groups.push(r.group); });
  eq(groups.slice(0, 7).join(' / '), 'Yeast breads / Enriched breads / Sourdough / Flatbreads and tortillas / Quick breads / Boiled breads: pretzels and bagels / Pastry and crackers', 'the library groups the breads, in order');
  ['soft-pretzels', 'bagels', 'sourdough-bread', 'sourdough-starter', 'croissants', 'english-muffins', 'pita', 'naan', 'challah', 'brioche', 'milk-bread', 'rye-bread', 'focaccia', 'ciabatta', 'cinnamon-rolls', 'sweet-rolls', 'cornbread', 'irish-soda-bread', 'banana-bread', 'zucchini-bread', 'crackers', 'lavash', 'hoagie-rolls', 'breadsticks', 'italian-bread', 'oatmeal-bread', 'potato-bread', 'whole-wheat-sandwich-bread']
    .forEach(function (id) { ok(!!RS.byId[id], 'bread recipe ' + id + ' is in the library'); });
  eq(RS.byItem['wheat-bread'], 'whole-wheat-sandwich-bread', 'store whole-wheat bread is made as the all whole-wheat loaf');
  eq(RS.byItem['pretzel-rolls'] + ',' + RS.byItem['soft-pretzels'] + ',' + RS.byItem.bagels + ',' + RS.byItem.croissants + ',' + RS.byItem.sourdough, 'soft-pretzels,soft-pretzels,bagels,croissants,sourdough-bread', 'pretzels, pretzel buns, bagels, croissants and sourdough each have a Make it recipe');
  ['english-muffins', 'pita', 'naan', 'hoagie-rolls', 'rye-bread', 'challah', 'hawaiian-rolls', 'cinnamon-rolls', 'italian-bread', 'potato-bread', 'whole-grain-crackers'].forEach(function (id) { ok(!!RS.byItem[id], id + ' has a Make it recipe'); });
  var pz = RS.byId['soft-pretzels'];
  eq(M.scratchFor(pz, { 'soft-pretzels': 16 * real.cat['soft-pretzels'].units.each }).n, 2, '16 pretzels is two batches');
  eq(M.scratchFor(pz, { 'pretzel-rolls': 12 * real.cat['pretzel-rolls'].units.each }).n, 1.5, '12 pretzel buns is 1½ batches');
  eq(M.scratchFor(pz, { 'soft-pretzels': 4 * real.cat['soft-pretzels'].units.each, 'pretzel-rolls': 4 * real.cat['pretzel-rolls'].units.each }).n, 1, '4 pretzels and 4 buns share one batch');
  var pz2 = M.scaleScratch(pz, 2, real.cat), soda2 = pz2.filter(function (x) { return x.ing.item === 'baking-soda'; })[0], flour2 = pz2.filter(function (x) { return x.ing.item === 'flour'; })[0];
  eq(Math.round(flour2.g), 1000, 'a double batch of pretzels takes 1000 g flour');
  eq(Math.round(soda2.g), 110, 'but the soda bath stays ½ cup (110 g)');
  var pzN = M.scratchNutr(pz, real.cat, 'soft-pretzels'), perPz = pzN.n.sodium * real.cat['soft-pretzels'].units.each / 100;
  ok(perPz > 300 && perPz < 1200, 'a homemade pretzel’s sodium leaves out the soda bath (' + Math.round(perPz) + ' mg)');
  ok(/history only/.test(rs.recipes.filter(function (r) { return r.id === 'soft-pretzels'; })[0].old_way), 'lye appears as history only');
  var sd = RS.byId['sourdough-bread'], pdSD = M.prepDay([{ s: sd, n: 1 }, { s: RS.byId.brioche, n: 1 }]);
  ok(pdSD.steps.every(function (s) { return !s.sg || !s.sg.before; }), 'day-before stages (starter, overnight chills) stay off the prep-day timeline');
  var sdBake = pdSD.steps.filter(function (s) { return s.j.s === sd && s.inOven != null; })[0], brBake = pdSD.steps.filter(function (s) { return s.j.s === RS.byId.brioche && s.inOven != null; })[0];
  ok(sdBake && brBake && (sdBake.inOven + 45 <= brBake.inOven || brBake.inOven + 17 <= sdBake.inOven), 'the sourdough (475°F) and brioche (375°F) take turns in the oven');
  ok(pdSD.end < 6 * 60, 'with the overnight work done, prep day for both is under 6 hours (' + pdSD.end + ' min)');
  var badK = rs.recipes.filter(function (r) { return groups.indexOf(r.group) < 7 && !r.keeps.some(function (k) { return /NDSU|Missouri|Clemson|Alaska|Cornell/.test(k); }); }).map(function (r) { return r.id; });
  eq(badK.join(), '', 'every bread’s storage time names its source');
  var fake = M.norm({ catalog: JSON.parse(fs.readFileSync(path.join(dir, 'catalog.json'), 'utf8')), recipes: [{ id: 'deli-brunch', name: 'Deli brunch', servings: 4, meal: ['lunch'], ingredients: [{ item: 'bagels', amount: 4, unit: 'each' }, { item: 'soft-pretzels', amount: 4, unit: 'each' }, { item: 'rye-bread', amount: 8, unit: 'slice' }], steps: ['Serve.'] }] });
  var bp = { start: '2026-10-26', days: 7, slots: { lunch: true }, cells: { '0|lunch': [{ r: 'deli-brunch' }] }, guests: {} }, repB = {};
  var bList = M.shoppingList(bp, M.DEFAULT_GROUPS, fake.recipes, real.cat, { scratch: { S: RS, make: function (id) { return id !== 'rye-bread'; } }, report: repB });
  var bNames = bList.map(function (r) { return r.name; });
  ok(bNames.indexOf(real.cat.bagels.name) < 0 && bNames.indexOf(real.cat['soft-pretzels'].name) < 0 && bNames.indexOf(real.cat['bread-flour'].name) >= 0, 'Make it swaps bagels and pretzels for flour (' + bNames.join(', ') + ')');
  ok(bNames.indexOf(real.cat['rye-bread'].name) >= 0, 'rye bread left as Buy stays on the list');
  var soda = bList.filter(function (r) { return r.item && r.item.id === 'baking-soda'; })[0];
  ok(soda && /Soft pretzels/.test(soda.uses.join()), 'the pretzel bath’s baking soda is on the list for the homemade pretzels');
  console.log('real data: ' + ids.length + ' recipes, ' + Object.keys(real.cat).length + ' items, month list ' + bl.length + ' rows, ' + Object.keys(RS.byId).length + ' scratch recipes');
}

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
