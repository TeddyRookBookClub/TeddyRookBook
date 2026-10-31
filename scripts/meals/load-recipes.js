// Loads every built-in Meal Prep recipe: data/meals/recipes.json first, then data/meals/recipes/<group>.json
// (same schema, {recipes:[…]}), files in name order, the way the Hugo partial meal-prep/recipes-all.html does.
// Returns {recipes:[…], files:[{file, count}], problems:[messages]}; each recipe gets a non-enumerable _file.
// Usage: const { loadRecipes } = require('./load-recipes'); loadRecipes(siteDir)
'use strict';
const fs = require('fs');
const path = require('path');

// keys Hugo already uses inside site.Data.meals.recipes (from recipes.json), so no group file may take them
const RESERVED = new Set(['recipes', 'version', 'note']);

function loadRecipes(site) {
  const dir = path.join(site, 'data', 'meals');
  const out = { recipes: [], files: [], problems: [] };
  const add = (rel, j) => {
    const list = j && Array.isArray(j.recipes) ? j.recipes : null;
    if (!list) { out.problems.push(`${rel}: must be {"recipes": [...]}`); return; }
    for (const r of list) Object.defineProperty(r, '_file', { value: rel, enumerable: false });
    out.recipes.push(...list);
    out.files.push({ file: rel, count: list.length });
  };
  const read = rel => { try { return JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8')); } catch (e) { out.problems.push(`${rel}: ${e.message}`); return null; } };
  add('recipes.json', read('recipes.json'));
  const sub = path.join(dir, 'recipes');
  if (fs.existsSync(sub)) {
    for (const f of fs.readdirSync(sub).sort()) {
      if (f.startsWith('.')) continue;
      const rel = 'recipes/' + f;
      if (!f.endsWith('.json')) { out.problems.push(`${rel}: only .json files belong here`); continue; }
      const base = f.slice(0, -5);
      if (RESERVED.has(base)) { out.problems.push(`${rel}: "${base}" is a reserved name; pick another file name`); continue; }
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(base)) out.problems.push(`${rel}: file names are lowercase-with-dashes`);
      add(rel, read(rel));
    }
  }
  return out;
}

module.exports = { loadRecipes };
