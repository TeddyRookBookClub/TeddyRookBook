#!/usr/bin/env node
// Checks the Meal Prep data in data/meals/: schema, recipe ingredients in the catalog, units convertible,
// derived fields, guides and sources, nutrition present and per-serving totals sane.
// Usage: node scripts/meals/check-data.js [--allow-pending] [--totals] [site_dir]
//   --allow-pending  nutrition not fetched yet is a warning instead of an error
//   --totals         print per-serving nutrition for every recipe
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const ALLOW_PENDING = args.includes('--allow-pending');
const SHOW_TOTALS = args.includes('--totals');
const SITE = args.find(a => !a.startsWith('--')) || path.resolve(__dirname, '..', '..');
const D = p => path.join(SITE, 'data', 'meals', p);
const load = p => JSON.parse(fs.readFileSync(D(p), 'utf8'));

const errors = [], warnings = [];
const err = m => errors.push(m);
const warn = m => warnings.push(m);

const meta = load('meta.json');
const catalog = load('catalog.json').items;
const recipes = load('recipes.json').recipes;
const guides = {};
for (const f of fs.readdirSync(D('guides')).filter(f => f.endsWith('.json'))) {
  const g = JSON.parse(fs.readFileSync(D('guides/' + f), 'utf8'));
  if (g.key + '.json' !== f) err(`guide ${f}: key ${g.key} does not match file name`);
  guides[g.key] = g;
}

const MASS = meta.units.mass, VOL = meta.units.volume;
const SECTIONS = new Set(meta.sections.map(s => s.id));
const ALLERGENS = meta.allergens.map(a => a.id);
const DIETS = new Set(meta.diets.map(d => d.id));
const NUTS = meta.nutrients.map(n => n.id);
const CORE = ['kcal', 'protein', 'fat', 'satfat', 'carb', 'fiber', 'sugars', 'sodium', 'calcium', 'iron', 'potassium'];
const KEEP = new Set(['pantry', 'fridge', 'freezer', 'counter']);
const byId = new Map();
const isNum = x => typeof x === 'number' && isFinite(x);
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---------- unit conversion (same rules as the schema) ----------
function toGrams(item, amount, unit) {
  if (unit in MASS) return amount * MASS[unit];
  if (unit in VOL) return item.g_per_cup ? amount * VOL[unit] * item.g_per_cup / VOL.cup : null;
  if (item.counts && unit in item.counts) return amount * item.counts[unit];
  return null;
}

// ---------- guide references ----------
function guideRefOk(ref) {
  const [key, sec] = ref.split('#');
  const g = guides[key];
  if (!g) return false;
  return !sec || g.sections.some(s => s.id === sec);
}

// ---------- catalog ----------
for (const it of catalog) {
  const w = `item ${it.id}`;
  if (!ID_RE.test(it.id || '')) err(`${w}: bad id`);
  if (byId.has(it.id)) err(`${w}: duplicate id`);
  byId.set(it.id, it);
  if (!it.name) err(`${w}: no name`);
  if (!SECTIONS.has(it.section)) err(`${w}: unknown section ${it.section}`);
  if (!KEEP.has(it.keep)) err(`${w}: bad keep ${it.keep}`);
  if (it.g_per_cup !== null && !(isNum(it.g_per_cup) && it.g_per_cup > 0 && it.g_per_cup < 400)) err(`${w}: bad g_per_cup`);
  for (const [u, g] of Object.entries(it.counts || {})) {
    if (!meta.units.count.includes(u)) err(`${w}: count unit ${u} not in meta.units.count`);
    if (!(isNum(g) && g > 0 && g < 10000)) err(`${w}: bad grams for ${u}`);
  }
  for (const a of it.allergens) if (!ALLERGENS.includes(a)) err(`${w}: unknown allergen ${a}`);
  for (const d of it.diet) if (!DIETS.has(d)) err(`${w}: unknown diet ${d}`);
  if (it.diet.includes('vegan') && !it.diet.includes('vegetarian')) err(`${w}: vegan without vegetarian`);
  if (it.diet.includes('vegan') && it.allergens.some(a => ['milk', 'eggs', 'fish', 'shellfish'].includes(a))) err(`${w}: vegan but has animal allergen`);
  if (it.diet.includes('dairy-free') === it.allergens.includes('milk')) err(`${w}: dairy-free must equal "no milk allergen"`);
  if (it.diet.includes('gluten-free') && it.allergens.includes('wheat')) err(`${w}: gluten-free but contains wheat`);
  if (it.diet.includes('vegetarian') && it.allergens.some(a => a === 'fish' || a === 'shellfish')) err(`${w}: vegetarian but fish/shellfish`);
  for (const ref of it.guides) if (!guideRefOk(ref)) err(`${w}: guide link ${ref} does not resolve`);
  const buy = it.buy || {};
  const packs = buy.packs || [];
  for (const p of packs) {
    if (!(isNum(p.amount) && p.amount > 0)) err(`${w}: pack ${p.label} bad amount`);
    if (toGrams(it, p.amount, p.unit) === null) err(`${w}: pack ${p.label} unit ${p.unit} not convertible`);
  }
  if (buy.loose) {
    if (toGrams(it, buy.loose.step, buy.loose.unit) === null) err(`${w}: loose unit ${buy.loose.unit} not convertible`);
  }
  if (!packs.length && !buy.loose && it.id !== 'water') err(`${w}: no way to buy it`);
  if (it.edible !== null && it.edible !== undefined && !(it.edible > 0.2 && it.edible <= 1 && it.edible_src)) err(`${w}: edible must be 0.2-1 with edible_src`);
  // FDC + nutrition
  const f = it.fdc || {};
  if (f.proxy && !catalog.some(x => x.id === f.proxy)) err(`${w}: proxy ${f.proxy} not in catalog`);
  if (!f.proxy && f.status !== 'none' && !f.id && !f.query) err(`${w}: no FDC id, query or proxy`);
  const n = it.nutrition;
  if (!n) {
    (ALLOW_PENDING ? warn : err)(`${w}: nutrition pending (FDC ${f.id || f.query || 'proxy ' + f.proxy})`);
  } else {
    const REQ = ['kcal', 'protein', 'fat', 'carb', 'sodium'];
    for (const k of CORE) {
      if (isNum(n[k]) && n[k] >= 0) continue;
      if (n[k] === null && !REQ.includes(k) && (n.missing || []).includes(k)) { warn(`${w}: FDC has no ${k}`); continue; }
      err(`${w}: nutrition.${k} missing or negative`);
    }
    for (const k of Object.keys(n)) if (k !== 'src' && k !== 'missing' && !NUTS.includes(k)) err(`${w}: unknown nutrient ${k}`);
    if ((n.satfat || 0) > n.fat + 0.5) err(`${w}: saturated fat > total fat`);
    if ((n.fiber || 0) > n.carb + 1 || (n.sugars || 0) > n.carb + 1) err(`${w}: fiber or sugars > carbohydrate`);
    if (n.protein + n.fat + n.carb > 101) err(`${w}: macros over 100 g per 100 g`);
    const atw = 4 * n.protein + 4 * n.carb + 9 * n.fat;
    if (n.kcal > 20 && (n.fiber || 0) < 10 && it.section !== 'spices' && Math.abs(atw - n.kcal) / n.kcal > 0.25 && Math.abs(atw - n.kcal) > 25) warn(`${w}: calories ${n.kcal} vs 4/4/9 estimate ${atw.toFixed(0)}`);
    if (!n.src) warn(`${w}: nutrition has no src`);
  }
}

// ---------- recipes ----------
const T = meta.tags;
const rIds = new Set();
const SAFE_TEMPS = new Set([140, 145, 160, 165]);
const BANNED = /\b(genuinely|honestly|straightforward|book club)\b/i;
const BRANDS = /\b(Velveeta|Rotel|Ro-Tel|Bisquick|Crisco|Pam|Kraft|Heinz|Hellmann|Morton|Diamond Crystal|Old Bay|Tabasco|Cheerios|Quaker|Pillsbury|Jell-O|Nutella|Sriracha|Frank's|Lawry|McCormick|Philadelphia|Ritz|Goldfish|Cool Whip|Spam|Ragu|Prego|Kikkoman|Hidden Valley|Lipton|Campbell)\b/i;
const totals = [];
for (const r of recipes) {
  const w = `recipe ${r.id}`;
  if (!ID_RE.test(r.id || '')) err(`${w}: bad id`);
  if (rIds.has(r.id)) err(`${w}: duplicate id`);
  rIds.add(r.id);
  for (const k of ['name', 'emoji', 'summary', 'serving_size']) if (!r[k]) err(`${w}: missing ${k}`);
  if (!(Number.isInteger(r.servings) && r.servings > 0 && r.servings <= 24)) err(`${w}: bad servings`);
  for (const m of r.meal) if (!T.meal.includes(m)) err(`${w}: bad meal ${m}`);
  if (!T.protein.includes(r.protein)) err(`${w}: bad protein ${r.protein}`);
  for (const m of r.method) if (!T.method.includes(m)) err(`${w}: bad method ${m}`);
  for (const t of r.tags) if (!T.other.includes(t)) err(`${w}: bad tag ${t}`);
  const tm = r.times;
  if (tm.total !== tm.prep + tm.cook + tm.inactive) err(`${w}: times.total != prep+cook+inactive`);
  if ((tm.total <= 30) !== r.tags.includes('quick')) err(`${w}: quick tag must match total <= 30`);
  if (!r.steps.length || !r.ingredients.length || !r.equipment.length) err(`${w}: empty steps, ingredients or equipment`);
  let grams = 0, missing = [];
  const sum = Object.fromEntries(CORE.map(k => [k, 0]));
  const reqAllergens = new Set(), guideRefs = [];
  let diet = new Set(['vegetarian', 'vegan', 'gluten-free', 'dairy-free']);
  for (const ing of r.ingredients) {
    const it = byId.get(ing.item);
    if (!it) { err(`${w}: ingredient ${ing.item} not in catalog`); continue; }
    if (!(isNum(ing.amount) && ing.amount > 0)) err(`${w}: ${ing.item} bad amount`);
    const g = toGrams(it, ing.amount, ing.unit);
    if (g === null) { err(`${w}: ${ing.amount} ${ing.unit} ${ing.item} not convertible`); continue; }
    if (g > 5000) err(`${w}: ${ing.item} is ${g.toFixed(0)} g, too much?`);
    for (const ref of it.guides) if (!guideRefs.includes(ref)) guideRefs.push(ref);
    if (ing.optional) continue;
    it.allergens.forEach(a => reqAllergens.add(a));
    diet = new Set([...diet].filter(d => it.diet.includes(d)));
    if (ing.in_nutrition === false) continue;
    grams += g;
    const eg = g * (it.edible || 1);
    if (it.nutrition) for (const k of CORE) sum[k] += eg * (it.nutrition[k] || 0) / 100;
    else missing.push(it.id);
  }
  const wantAllergens = ALLERGENS.filter(a => reqAllergens.has(a));
  if (JSON.stringify(wantAllergens) !== JSON.stringify(r.allergens)) err(`${w}: allergens ${r.allergens} should be ${wantAllergens}`);
  const wantDiet = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].filter(d => diet.has(d));
  if (JSON.stringify(wantDiet) !== JSON.stringify(r.diet)) err(`${w}: diet ${r.diet} should be ${wantDiet}`);
  if (r.protein === 'vegetarian' && !diet.has('vegetarian')) err(`${w}: protein vegetarian but an ingredient is not`);
  for (const ref of guideRefs) if (!r.guides.includes(ref)) err(`${w}: guides missing ${ref}`);
  for (const ref of r.guides) if (!guideRefOk(ref)) err(`${w}: guide ${ref} does not resolve`);
  for (const p of r.pairs) if (!recipes.some(x => x.id === p)) err(`${w}: pairs with unknown ${p}`);
  const text = [r.name, r.summary, ...r.steps, r.make_ahead, r.freezer && r.freezer.text, r.leftovers && r.leftovers.text, r.kids, ...Object.values(r.swaps || {}), ...r.ingredients.map(i => i.prep || '')].filter(Boolean).join(' \n ');
  if (BANNED.test(text)) err(`${w}: banned word: ${text.match(BANNED)[0]}`);
  if (BRANDS.test(text)) err(`${w}: brand name: ${text.match(BRANDS)[0]}`);
  for (const s of r.safety) {
    if (!SAFE_TEMPS.has(s.temp_f)) err(`${w}: unexpected safe temperature ${s.temp_f}`);
    if (!text.includes(s.temp_f + '°F')) err(`${w}: steps never mention ${s.temp_f}°F`);
    if (s.temp_f === 145 && /steak|chop|roast/.test(s.food) && s.rest_min < 3) err(`${w}: 145°F whole cuts need a 3-minute rest`);
  }
  if (r.leftovers && r.leftovers.next_day && !['lunch', 'dinner'].includes(r.leftovers.next_day)) err(`${w}: bad leftovers.next_day`);
  if (r.prep_day) {
    const pd = r.prep_day;
    if (!['stove', 'oven', 'slow-cooker', 'grill', 'none'].includes(pd.station)) err(`${w}: bad prep_day.station`);
    if (pd.oven_f !== null && !(pd.oven_f >= 200 && pd.oven_f <= 500)) err(`${w}: bad oven_f`);
    if (r.method.includes('oven') && !pd.oven_f) err(`${w}: oven recipe without prep_day.oven_f`);
  }
  // per-serving sanity
  const per = grams / r.servings;
  if (per < 20 || per > 1200) err(`${w}: ${per.toFixed(0)} g per serving looks wrong`);
  if (!missing.length) {
    const s = Object.fromEntries(CORE.map(k => [k, sum[k] / r.servings]));
    const isSide = r.meal.some(m => m === 'side' || m === 'snack');
    const lo = isSide ? 15 : 120, hi = 1500;
    if (s.kcal < lo || s.kcal > hi) err(`${w}: ${s.kcal.toFixed(0)} kcal per serving is outside ${lo}-${hi}`);
    if (s.sodium > 2300) err(`${w}: ${s.sodium.toFixed(0)} mg sodium per serving`);
    if (s.protein > 120) err(`${w}: ${s.protein.toFixed(0)} g protein per serving`);
    totals.push([r.id, per, s]);
  } else {
    (ALLOW_PENDING ? warn : err)(`${w}: cannot total nutrition yet; pending items: ${[...new Set(missing)].join(', ')}`);
  }
}

// ---------- guides ----------
const REQUIRED_GUIDES = ['fats', 'cinnamon', 'differences', 'check-foods', 'food-safety'];
for (const k of REQUIRED_GUIDES) if (!guides[k]) err(`guide ${k} missing`);
for (const g of Object.values(guides)) {
  const w = `guide ${g.key}`;
  for (const k of ['title', 'icon', 'summary', 'updated']) if (!g[k]) err(`${w}: missing ${k}`);
  const srcIds = new Set(g.sources.map(s => s.id));
  for (const s of g.sources) if (!/^https:\/\//.test(s.url)) err(`${w}: source ${s.id} url`);
  const secIds = new Set();
  for (const s of g.sections) {
    if (secIds.has(s.id)) err(`${w}: duplicate section ${s.id}`);
    secIds.add(s.id);
    if (!s.h) err(`${w}/${s.id}: no heading`);
    for (const id of s.src || []) if (!srcIds.has(id)) err(`${w}/${s.id}: source ${id} not listed`);
    if (s.table) for (const row of s.table.rows) if (row.length !== s.table.cols.length) err(`${w}/${s.id}: table row length`);
    if (s.fat_table) for (const id of s.fat_table.items) if (!byId.has(id)) err(`${w}/${s.id}: fat_table item ${id}`);
    const text = JSON.stringify(s);
    if (BANNED.test(text)) err(`${w}/${s.id}: banned word`);
  }
  for (const id of g.items || []) if (!byId.has(id)) err(`${w}: item ${id} not in catalog`);
}
// fats guide numbers need nutrition
if (guides.fats) for (const id of guides.fats.sections.flatMap(s => s.fat_table ? s.fat_table.items : [])) {
  const n = (byId.get(id) || {}).nutrition;
  if (n && !['mufa', 'pufa'].every(k => isNum(n[k]))) warn(`fats guide: ${id} lacks mufa/pufa`);
}

// ---------- report ----------
const pending = catalog.filter(i => !i.nutrition).length;
console.log(`catalog: ${catalog.length} items (${pending} without nutrition), recipes: ${recipes.length}, guides: ${Object.keys(guides).length}`);
if (SHOW_TOTALS) for (const [id, g, s] of totals) console.log(`  ${id.padEnd(30)} ${g.toFixed(0).padStart(4)} g  ${s.kcal.toFixed(0).padStart(4)} kcal  P ${s.protein.toFixed(0)}  F ${s.fat.toFixed(0)}  C ${s.carb.toFixed(0)}  Na ${s.sodium.toFixed(0)} mg`);
const shownWarn = warnings.length > 40 ? warnings.slice(0, 40).concat([`... and ${warnings.length - 40} more warnings`]) : warnings;
for (const m of shownWarn) console.log('warn: ' + m);
for (const m of errors) console.log('ERROR: ' + m);
console.log(errors.length ? `${errors.length} errors` : 'OK');
process.exit(errors.length ? 1 : 0);
