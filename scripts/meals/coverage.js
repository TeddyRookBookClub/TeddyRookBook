#!/usr/bin/env node
// Ingredient coverage for the "Use it up" pages: for each ingredient in data/meals/ingredients.yaml, how many recipes
// (data/meals/recipes.json + data/meals/recipes/*.json) use it as a meaningful ingredient. Goal: 5 or more each.
//
// "Meaningful" (the Hugo partial layouts/partials/meal-prep/ing-uses.html uses the same rules):
//   - the line is not optional, not "to taste", and not a garnish (its group or prep says "garnish");
//   - the recipe uses at least MIN_G grams of the ingredient in total (all its catalog ids added up):
//     5 g for herbs and aromatics (2 garlic cloves, a small handful of herbs), 15 g for nuts and seeds
//     (2 tablespoons), 30 g for everything else (a little over 2 tablespoons of butter, 1 egg, 1/4 cup of rice).
// Centrality, used to rank suggestions on each page, is the ingredient's share of the recipe's total weight.
//
// Usage: node scripts/meals/coverage.js [--strict] [--md FILE] [--json] [site_dir]
//   prints the ingredients under 5 and a group summary; --strict exits 1 when any are under 5;
//   --md FILE writes a Markdown gap list for recipe writers; --json prints the full table.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadRecipes } = require('./load-recipes');

const MIN = 5;
const MIN_G = { herbs: 5, 'nuts-seeds': 15 };
const MIN_G_DEFAULT = 30;
const GARNISH = /garnish/i;

// ---------- a reader for the YAML subset ingredients.yaml uses ----------
// block maps and "- " lists by two-space indents, every value written as JSON ("strings", [lists], numbers), # comments
function readYaml(text) {
  const lines = [];
  text.split('\n').forEach((raw, i) => {
    if (/^\s*(#|$)/.test(raw)) return;
    const ind = raw.match(/^ */)[0].length;
    lines.push({ ind, s: raw.slice(ind), n: i + 1 });
  });
  let pos = 0;
  const fail = (l, m) => { throw new Error(`ingredients.yaml line ${l.n}: ${m}`); };
  const scalar = (v, l) => { try { return JSON.parse(v); } catch (e) { return fail(l, `value must be JSON (quote strings): ${v}`); } };
  function block(ind) {
    const l = lines[pos];
    if (!l || l.ind < ind) return null;
    if (l.s.startsWith('- ')) {
      const arr = [];
      while (pos < lines.length && lines[pos].ind === ind && lines[pos].s.startsWith('- ')) {
        const cur = lines[pos];
        // rewrite "- key: v" as a map entry at ind + 2
        lines[pos] = { ind: ind + 2, s: cur.s.slice(2), n: cur.n };
        arr.push(map(ind + 2));
      }
      return arr;
    }
    return map(ind);
  }
  function map(ind) {
    const o = {};
    while (pos < lines.length && lines[pos].ind === ind && !lines[pos].s.startsWith('- ')) {
      const l = lines[pos], m = l.s.match(/^([A-Za-z0-9_-]+):(?: (.*))?$/);
      if (!m) fail(l, 'expected "key: value"');
      pos++;
      if (m[2] !== undefined && m[2] !== '') o[m[1]] = scalar(m[2], l);
      else o[m[1]] = block(lines[pos] && lines[pos].ind > ind ? lines[pos].ind : ind + 2) || {};
    }
    if (pos < lines.length && lines[pos].ind > ind) fail(lines[pos], 'unexpected indent');
    return o;
  }
  const out = block(0);
  if (pos < lines.length) fail(lines[pos], 'could not read');
  return out;
}

function loadIngredients(site) {
  return readYaml(fs.readFileSync(path.join(site, 'data', 'meals', 'ingredients.yaml'), 'utf8'));
}

function coverage(site) {
  const D = p => path.join(site, 'data', 'meals', p);
  const meta = JSON.parse(fs.readFileSync(D('meta.json'), 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(D('catalog.json'), 'utf8')).items;
  const byId = new Map(catalog.map(x => [x.id, x]));
  const Y = loadIngredients(site);
  const ings = Y.ingredients || [];
  const groups = (Y.groups || []).map(g => g.id);
  const srcIds = new Set((Y.sources || []).map(s => s.id));
  const problems = [];
  const { recipes } = loadRecipes(site);
  const MASS = meta.units.mass, VOL = meta.units.volume;
  const grams = (it, a, u) => u in MASS ? a * MASS[u] : u in VOL ? (it.g_per_cup ? a * VOL[u] * it.g_per_cup / VOL.cup : null) : (it.counts && u in it.counts ? a * it.counts[u] : null);

  // ---- validate the list ----
  const seen = new Set(), itemTo = new Map();
  for (const e of ings) {
    const w = `ingredient ${e.id}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id || '')) problems.push(`${w}: bad id`);
    if (seen.has(e.id)) problems.push(`${w}: duplicate id`);
    seen.add(e.id);
    for (const k of ['name', 'group', 'emoji', 'choose', 'prep']) if (!e[k]) problems.push(`${w}: missing ${k}`);
    if (!groups.includes(e.group)) problems.push(`${w}: unknown group ${e.group}`);
    if (!Array.isArray(e.items) || !e.items.length) problems.push(`${w}: needs items (catalog ids)`);
    for (const id of e.items || []) {
      if (!byId.has(id)) problems.push(`${w}: catalog item ${id} not in catalog.json`);
      else if (!byId.get(id).nutrition) problems.push(`${w}: catalog item ${id} has no nutrition`);
      if (itemTo.has(id)) problems.push(`${w}: catalog item ${id} is already under ${itemTo.get(id)}`);
      else itemTo.set(id, e.id);
    }
    const bw = JSON.stringify(e).match(/\b(genuinely|honestly|straightforward|book club)\b/i);
    if (bw) problems.push(`${w}: banned word "${bw[0]}"`);
    const st = e.store || {};
    if (!['fridge', 'freezer', 'pantry', 'counter'].some(k => st[k])) problems.push(`${w}: say how to store it`);
    for (const s of st.src || []) if (!srcIds.has(s)) problems.push(`${w}: source ${s} not in sources`);
  }
  if (ings.length < 100) problems.push(`only ${ings.length} ingredients; the goal is at least 100`);

  // ---- count ----
  const grp = new Map(ings.map(e => [e.id, e.group]));
  const uses = new Map(ings.map(e => [e.id, []]));
  for (const r of recipes) {
    let total = 0;
    const per = new Map();
    for (const i of r.ingredients || []) {
      const it = byId.get(i.item);
      if (!it) continue;
      const g = grams(it, i.amount, i.unit);
      if (g === null) continue;
      if (!i.optional && i.in_nutrition !== false) total += g;
      const k = itemTo.get(i.item);
      if (!k || i.optional || i.to_taste || GARNISH.test(i.group || '') || GARNISH.test(i.prep || '')) continue;
      per.set(k, (per.get(k) || 0) + g);
    }
    for (const [k, g] of per) {
      if (g >= (MIN_G[grp.get(k)] || MIN_G_DEFAULT)) uses.get(k).push({ id: r.id, name: r.name, g: Math.round(g), share: total ? g / total : 0, file: r._file });
    }
  }
  const rows = ings.map(e => ({ id: e.id, name: e.name, group: e.group, n: uses.get(e.id).length, recipes: uses.get(e.id).sort((a, b) => b.share - a.share) }));
  return { MIN, MIN_G, MIN_G_DEFAULT, rows, groups: Y.groups || [], recipes: recipes.length, problems };
}

function markdown(C) {
  const low = C.rows.filter(x => x.n < C.MIN);
  let s = `# Ingredient coverage: the gaps\n\nGenerated by \`node scripts/meals/coverage.js --md <file>\`. ${C.recipes} recipes, ${C.rows.length} ingredients; `;
  s += `${C.rows.length - low.length} have ${C.MIN}+ recipes, ${low.length} need more (${low.reduce((a, x) => a + C.MIN - x.n, 0)} recipe uses short).\n\n`;
  s += `A use counts when the recipe has at least ${C.MIN_G_DEFAULT} g of the ingredient (${C.MIN_G.herbs} g for herbs and aromatics, ${C.MIN_G['nuts-seeds']} g for nuts and seeds), not optional, not "to taste", not a garnish.\n\n`;
  s += `## For recipe writers\n\n- New recipes go in \`data/meals/recipes/<group>.json\` as \`{"recipes": [ ... ]}\`, same schema as \`data/meals/recipes.json\` (leave that file as it is). Files ready: ${['meats', 'seafood', 'dairy-eggs', 'vegetables', 'fruits', 'grains', 'legumes', 'nuts-seeds', 'herbs'].map(x => '`' + x + '.json`').join(', ')}. Any lowercase-dashed name works except recipes, version and note.\n`;
  s += `- Recipe ids must be unique across every file. Ingredients use catalog ids; the ids each ingredient counts are its \`items\` in \`data/meals/ingredients.yaml\`.\n`;
  s += `- \`allergens\`, \`diet\` and \`guides\` must match the catalog, and \`quick\` must match total time 30 minutes or less; \`node scripts/meals/check-data.js\` says what to fix.\n`;
  s += `- Check: \`node scripts/meals/check-data.js\` (coverage shows as warnings; add \`--strict\` to make gaps errors). Gap list: \`node scripts/meals/coverage.js\`; this file: \`node scripts/meals/coverage.js --md COVERAGE.md\`.\n\n`;
  s += `## Group summary\n\n| Group | Ingredients | With ${C.MIN}+ | Under ${C.MIN} | Uses short |\n|---|---|---|---|---|\n`;
  for (const g of C.groups) {
    const r = C.rows.filter(x => x.group === g.id), l = r.filter(x => x.n < C.MIN);
    s += `| ${g.name} (\`${g.id}\`) | ${r.length} | ${r.length - l.length} | ${l.length} | ${l.reduce((a, x) => a + C.MIN - x.n, 0)} |\n`;
  }
  s += `\n## Under ${C.MIN}, by group\n\nIngredient id, recipes now, recipes still needed.\n`;
  for (const g of C.groups) {
    const l = C.rows.filter(x => x.group === g.id && x.n < C.MIN);
    if (!l.length) continue;
    s += `\n### ${g.name}\n\n`;
    for (const x of l.sort((a, b) => a.n - b.n)) s += `- \`${x.id}\` (${x.name}): ${x.n}, needs ${C.MIN - x.n}${x.n ? ' (now: ' + x.recipes.map(r => r.id).join(', ') + ')' : ''}\n`;
  }
  return s;
}

module.exports = { coverage, readYaml, loadIngredients, markdown, MIN, MIN_G, MIN_G_DEFAULT };

if (require.main === module) {
  const args = process.argv.slice(2);
  const site = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--md') || path.resolve(__dirname, '..', '..');
  const C = coverage(site);
  for (const p of C.problems) console.log('ERROR: ' + p);
  if (args.includes('--json')) { console.log(JSON.stringify(C.rows.map(r => ({ id: r.id, n: r.n, recipes: r.recipes.map(x => x.id) })), null, 1)); }
  const low = C.rows.filter(x => x.n < C.MIN);
  console.log(`${C.recipes} recipes, ${C.rows.length} ingredients: ${C.rows.length - low.length} with ${C.MIN}+ recipes, ${low.length} under ${C.MIN}`);
  console.log('\nGroup                          ingredients  ok  under  uses short');
  for (const g of C.groups) {
    const r = C.rows.filter(x => x.group === g.id), l = r.filter(x => x.n < C.MIN);
    console.log(`${g.name.padEnd(30)} ${String(r.length).padStart(11)} ${String(r.length - l.length).padStart(3)} ${String(l.length).padStart(6)} ${String(l.reduce((a, x) => a + C.MIN - x.n, 0)).padStart(11)}`);
  }
  if (low.length) {
    console.log(`\nUnder ${C.MIN}:`);
    for (const x of low.sort((a, b) => a.group.localeCompare(b.group) || a.n - b.n)) console.log(`  ${x.group.padEnd(11)} ${x.id.padEnd(20)} ${x.n}`);
  }
  const mi = args.indexOf('--md');
  if (mi >= 0 && args[mi + 1]) { fs.writeFileSync(args[mi + 1], markdown(C)); console.log('\nwrote ' + args[mi + 1]); }
  process.exit(C.problems.length || (args.includes('--strict') && low.length) ? 1 : 0);
}
