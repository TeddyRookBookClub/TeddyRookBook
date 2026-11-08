/* Tests for the goal planner's math (static/meal-prep/goals-core.js) on the real Meal Prep data.
   Run: node scripts/meals/goals.test.js
   Targets are kept inside the stated ranges; planned days land within tolerance (calories within 10%, protein at least
   90% of the target) on sample inputs; portions, slots and excluded recipes are respected; weeks avoid repeats;
   swaps and the planner link work; diet filters hold. */
'use strict';
var path = require('path'), fs = require('fs');
var ROOT = path.join(__dirname, '..', '..');
var M = require(path.join(ROOT, 'static', 'meal-prep', 'model.js'));
var G = require(path.join(ROOT, 'static', 'meal-prep', 'goals-core.js'));
var loadRecipes = require('./load-recipes').loadRecipes;
var pass = 0, fail = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log('FAIL: ' + msg); } }
function eq(a, b, msg) { ok(a === b, msg + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

var cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/meals/catalog.json'), 'utf8'));
var rs = loadRecipes(ROOT).recipes;
var D = M.norm({ catalog: cat, recipes: { recipes: rs } });
// the exclusion list, built the way layouts/meal-prep/goals.html builds it
var cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/meals/goals.json'), 'utf8'));
var ex = [];
Object.keys(cfg.exclude).forEach(function (k) { cfg.exclude[k].forEach(function (id) { ex.push(id); }); });
var tgPath = path.join(ROOT, 'data/meals/recipes/thanksgiving.json');
if (fs.existsSync(tgPath)) JSON.parse(fs.readFileSync(tgPath, 'utf8')).collection.courses.forEach(function (c) {
  if (cfg.exclude_courses.indexOf(c.id) >= 0) c.items.forEach(function (i) { if (i.indexOf('r:') === 0) ex.push(i.slice(2)); });
});
ex.forEach(function (id) { ok(!!D.recipes[id], 'goals.json excludes a recipe that exists: ' + id); });
(cfg.presets || []).forEach(function (p) {
  var c = G.checkTargets({ kcal: p.kcal, protein: p.protein });
  ok(!c.notes.length, 'preset ' + p.id + ' is inside the ranges');
  ok(!/genuinely|honestly|straightforward/i.test(p.label + p.note), 'preset ' + p.id + ': wording');
});
var EXS = {}; ex.forEach(function (id) { EXS[id] = 1; });
var P = G.pool(M, D.recipes, D.cat, { exclude: ex });
ok(P.length > 200, 'the planner pool has plenty of recipes (' + P.length + ')');
ok(P.every(function (r) { return !EXS[r.id]; }), 'no excluded recipe is in the pool');

// ---------- targets stay in range ----------
var c = G.checkTargets({ kcal: 800 });
eq(c.t.kcal, 1200, 'calories below 1,200 move up to 1,200'); ok(c.notes.length === 1, 'and say why');
eq(G.checkTargets({ kcal: 9000 }).t.kcal, 5000, 'calories above 5,000 move down to 5,000');
eq(G.checkTargets({}).t.kcal, 2000, 'no calorie target: 2,000');
eq(G.checkTargets({ kcal: 2000, protein: 10 }).t.protein, 50, 'protein under 10% of calories moves up (2,000 kcal: 50 g)');
eq(G.checkTargets({ kcal: 2000, protein: 300 }).t.protein, 175, 'protein over 35% of calories moves down (2,000 kcal: 175 g)');
eq(G.checkTargets({ kcal: 2000, protein: 120 }).t.protein, 120, 'protein inside the range is kept');
eq(G.checkTargets({ kcal: 2000, carb: 50 }).t.carb, 225, 'carbohydrate under 45% moves up');
eq(G.checkTargets({ kcal: 2000, fat: 120 }).t.fat, 77, 'fat over 35% moves down');
eq(G.checkTargets({ kcal: 2000, fiber: 200 }).t.fiber, 70, 'fiber is capped');
ok(G.checkTargets({ kcal: 2000, protein: 0 }).t.protein === undefined, 'empty protein means no protein target');
for (var k = 250; k <= 12000; k += 250) {
  var tt = G.checkTargets({ kcal: k, protein: k / 10, carb: k / 20, fat: k / 15 }).t;
  ok(tt.kcal >= 1200 && tt.kcal <= 5000, 'kcal ' + k + ' -> ' + tt.kcal + ' in range');
  ok(tt.protein * 4 >= 0.0999 * tt.kcal && tt.protein * 4 <= 0.351 * tt.kcal, 'kcal ' + k + ': protein in 10-35%');
  ok(tt.carb * 4 >= 0.449 * tt.kcal && tt.carb * 4 <= 0.651 * tt.kcal, 'kcal ' + k + ': carbohydrate in 45-65%');
  ok(tt.fat * 9 >= 0.199 * tt.kcal && tt.fat * 9 <= 0.351 * tt.kcal, 'kcal ' + k + ': fat in 20-35%');
}
eq(G.proteinFor(G.lbToKg(170), 0.8), 62, '170 lb at 0.8 g/kg = 62 g');
eq(G.proteinFor(80, 1.6), 128, '80 kg at 1.6 g/kg = 128 g');
eq(G.proteinFor('', 1.2), null, 'no weight, no number');

// ---------- a planned day ----------
function checkDay(day, t, name, opts) {
  opts = opts || {};
  var seen = {};
  day.items.forEach(function (it) {
    var r = D.recipes[it.id], slot = G.SLOTS[it.slot];
    ok(!!r, name + ': ' + it.id + ' exists');
    ok(!EXS[it.id] || opts.noExclude, name + ': ' + it.id + ' is not excluded');
    ok(G.PORTIONS.indexOf(it.p) >= 0, name + ': portion ' + it.p + ' of ' + it.id + ' is ½ to 2 servings in quarter steps');
    ok(r && r.meals.some(function (m) { return slot.meals.indexOf(m) >= 0; }), name + ': ' + it.id + ' is a ' + slot.meals.join('/') + ' recipe');
    ok(!seen[it.id], name + ': ' + it.id + ' appears once'); seen[it.id] = 1;
    ok(['breakfast', 'lunch', 'dinner', 'snack'].indexOf(it.cell) >= 0, name + ': planner cell ' + it.cell);
  });
  ['breakfast', 'lunch', 'dinner'].forEach(function (s) { ok(day.items.some(function (it) { return it.slot === s; }), name + ': has ' + s); });
  var sum = 0; day.items.forEach(function (it) { sum += it.n.kcal; });
  ok(Math.abs(sum - day.total.kcal) < 0.5, name + ': the day total is the sum of its meals');
  ok(Math.abs(day.total.kcal - t.kcal) <= 0.10 * t.kcal, name + ': calories ' + Math.round(day.total.kcal) + ' within 10% of ' + t.kcal);
  if (t.protein) ok(day.total.protein >= 0.9 * t.protein, name + ': protein ' + Math.round(day.total.protein) + ' g at least 90% of ' + t.protein);
}
var SAMPLES = [[1200, 60], [1500, 75], [1800, 90], [2000, 50], [2000, 100], [2200, null], [2400, 120], [2600, 160], [2800, 150], [3000, 140], [3400, 180], [4000, 200], [4500, 220], [5000, 250]];
SAMPLES.forEach(function (s) {
  var t = G.checkTargets({ kcal: s[0], protein: s[1] }).t;
  [1, 2, 3].forEach(function (seed) { checkDay(G.planDay(P, t, { seed: seed }), t, s[0] + ' kcal/' + s[1] + ' g seed ' + seed); });
});
// out-of-range requests still give in-range days
var tLow = G.checkTargets({ kcal: 600, protein: 200 }).t, dLow = G.planDay(P, tLow, { seed: 5 });
ok(dLow.total.kcal >= 1200 * 0.9, 'a 600-calorie request never gives a day under 1,200 (less 10%): ' + Math.round(dLow.total.kcal));
var tHi = G.checkTargets({ kcal: 8000 }).t, dHi = G.planDay(P, tHi, { seed: 5 });
ok(dHi.total.kcal <= 5000 * 1.1, 'an 8,000-calorie request never gives a day over 5,000 (plus 10%): ' + Math.round(dHi.total.kcal));
// same seed, same day
var tA = G.checkTargets({ kcal: 2400, protein: 130 }).t;
eq(JSON.stringify(G.planDay(P, tA, { seed: 7 }).items.map(function (i) { return i.id + i.p; })), JSON.stringify(G.planDay(P, tA, { seed: 7 }).items.map(function (i) { return i.id + i.p; })), 'the same seed gives the same day');
// slots
eq(G.slotsFor(2000).join(), 'breakfast,lunch,dinner,side,snack', 'slots under 2,800');
ok(G.slotsFor(3000).indexOf('snack2') >= 0, 'a second snack from 2,800');

// ---------- diet filters ----------
[['vegetarian', function (f) { return f.vegetarian; }], ['glutenFree', function (f) { return f.glutenFree; }], ['dairyFree', function (f) { return f.dairyFree; }],
 ['fish', function (f) { return f.allergens.indexOf('fish') < 0 && f.allergens.indexOf('shellfish') < 0; }], ['nuts', function (f) { return f.allergens.indexOf('tree-nuts') < 0 && f.allergens.indexOf('peanuts') < 0; }],
 ['eggs', function (f) { return f.allergens.indexOf('eggs') < 0; }]].forEach(function (a) {
  var av = {}; av[a[0]] = true;
  var PP = G.pool(M, D.recipes, D.cat, { exclude: ex, avoid: av });
  ok(PP.length > 40 && PP.length < P.length, a[0] + ': a smaller pool (' + PP.length + ')');
  ok(PP.every(function (r) { return a[1](M.recipeFlags(D.recipes[r.id], D.cat)); }), a[0] + ': every recipe fits');
  var t = G.checkTargets({ kcal: 2000, protein: 90 }).t, d = G.planDay(PP, t, { seed: 2 });
  ok(d.items.every(function (it) { return a[1](M.recipeFlags(D.recipes[it.id], D.cat)); }), a[0] + ': the planned day fits');
  checkDay(d, t, a[0] + ' day');
});

// ---------- swap and alternatives ----------
var tS = G.checkTargets({ kcal: 2200, protein: 120 }).t, dS = G.planDay(P, tS, { seed: 4 });
var alts = G.alternatives(P, tS, dS, 'dinner', 8);
ok(alts.length === 8, 'eight other dinners offered');
ok(alts.every(function (a) { return !EXS[a.id] && D.recipes[a.id].meals.indexOf('dinner') >= 0 && G.PORTIONS.indexOf(a.p) >= 0; }), 'alternatives are dinners at allowed portions');
ok(alts.every(function (a) { return !dS.items.some(function (it) { return it.id === a.id; }); }), 'alternatives are not already in the day');
for (var i = 1; i < alts.length; i++) ok(alts[i].score >= alts[i - 1].score, 'alternatives are best first');
var sw = G.swap(P, tS, dS, 'dinner', alts[3].id);
ok(sw.items.some(function (it) { return it.slot === 'dinner' && it.id === alts[3].id; }), 'the swap puts the chosen dinner in');
ok(sw.items.every(function (it) { return G.PORTIONS.indexOf(it.p) >= 0; }), 'portions after a swap stay in range');
ok(Math.abs(sw.total.kcal - tS.kcal) <= 0.15 * tS.kcal, 'after a swap the day stays near the target (' + Math.round(sw.total.kcal) + ')');

// ---------- a week ----------
var tW = G.checkTargets({ kcal: 2400, protein: 140 }).t, wk = G.planWeek(P, tW, { seed: 3 });
eq(wk.length, 7, 'a week has 7 days');
wk.forEach(function (d, i) {
  checkDay(d, tW, 'week day ' + (i + 1));
  d.items.forEach(function (it) {
    if (it.cell !== 'lunch' && it.cell !== 'dinner') return;
    for (var j = Math.max(0, i - 3); j < i; j++) ok(!wk[j].items.some(function (x) { return x.id === it.id; }), 'week: ' + it.id + ' on day ' + (i + 1) + ' was not eaten in the 3 days before');
  });
});

// ---------- the planner link ----------
var q = G.plannerQuery(wk.slice(0, 2));
ok(/^[a-z0-9,:|-]+$/.test(q), 'the planner query uses only safe characters');
eq(q.split('|').length, 2, 'one group per day');
q.split('|').forEach(function (g) { g.split(',').forEach(function (x) { var p = x.split(':'); ok(M.SLOTS.indexOf(p[0]) >= 0 && !!D.recipes[p[1]], 'planner query part ' + x); }); });
var planner = fs.readFileSync(path.join(ROOT, 'static/meal-prep/planner.js'), 'utf8');
ok(/\[\?&\]day=/.test(planner) && planner.indexOf("kind: 'addday'") >= 0, 'the planner reads ?day=');

// ---------- the finder ----------
var byP = G.sortRows(P, 'protein', -1);
for (i = 1; i < byP.length; i++) if (byP[i].n.protein > byP[i - 1].n.protein + 1e-9) { ok(false, 'sorted by protein'); break; }
var byK = G.sortRows(P, 'kcal', 1); ok(byK[0].n.kcal <= byK[byK.length - 1].n.kcal, 'sorted by calories');
var byPPK = G.sortRows(P, 'ppk', -1); ok(G.ppk(byPPK[0]) >= G.ppk(byPPK[5]), 'sorted by protein per 100 calories');

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
