#!/usr/bin/env node
// Tests the "Use it up" pages in a built site. Run after a build:
//   node scripts/meals/ingredients-test.js <public_dir> [base_url]
// 1. Every ingredient in data/meals/ingredients.yaml has a page, and its recipe list matches scripts/meals/coverage.js,
//    links only to real recipe pages, and is ranked by how central the ingredient is.
// 2. With a base_url (a server for public_dir), the "What can I make with…?" picker is checked in Chromium.
'use strict';
const fs = require('fs');
const path = require('path');
const SITE = path.resolve(__dirname, '..', '..');
const { coverage } = require('./coverage');
const { loadRecipes } = require('./load-recipes');
const [PUB, BASE] = process.argv.slice(2);
if (!PUB) { console.log('usage: node scripts/meals/ingredients-test.js <public_dir> [base_url]'); process.exit(2); }
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL: ' + m); } };

const C = coverage(SITE);
const ids = new Set(loadRecipes(SITE).recipes.map(r => r.id));
const idx = fs.readFileSync(path.join(PUB, 'meal-prep/ingredients/index.html'), 'utf8');
for (const row of C.rows) {
  const f = path.join(PUB, 'meal-prep/ingredients', row.id, 'index.html');
  if (!fs.existsSync(f)) { ok(false, `${row.id}: no page`); continue; }
  const html = fs.readFileSync(f, 'utf8');
  const main = html.split('mi-moreh')[0].split('id="mi-recipes"')[1] || '';
  const got = [...main.matchAll(/href="[^"]*\/meal-prep\/recipes\/([a-z0-9-]+)\/"/g)].map(m => m[1]);
  ok(got.every(id => ids.has(id)), `${row.id}: links a recipe that does not exist`);
  ok(got.length === row.n, `${row.id}: page lists ${got.length} recipes, coverage.js counts ${row.n}`);
  ok(JSON.stringify([...got].sort()) === JSON.stringify(row.recipes.map(r => r.id).sort()), `${row.id}: recipes differ from coverage.js`);
  ok(got[0] === undefined || row.recipes[0].share - row.recipes.find(r => r.id === got[0]).share < 1e-9, `${row.id}: the first recipe is not the most central`);
  ok(idx.includes(`/meal-prep/ingredients/${row.id}/`), `${row.id}: not on the index`);
  for (const k of ['Choosing it', 'Storing it', 'Prepping it', 'Nutrition per 100 g', 'Sources and credits']) ok(html.includes(k), `${row.id}: no "${k}"`);
}
const five = C.rows.filter(r => r.n >= 5).length;
console.log(`pages: ${C.rows.length} ingredients, ${five} with 5+ recipes`);

if (BASE) {
  (async () => {
    const { chromium } = require('playwright');
    const b = await chromium.launch(), pg = await b.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(BASE + '/meal-prep/ingredients/?have=chicken,white-rice', { waitUntil: 'networkidle' });
    const data = await pg.evaluate(() => JSON.parse(document.getElementById('mi-data').textContent));
    const run = sel => pg.evaluate(s => window.trbIngPick(JSON.parse(document.getElementById('mi-data').textContent), s), sel);
    // every single ingredient: the picker gives exactly its recipes, best first
    let same = 0;
    for (const row of C.rows) { const r = await run([row.id]); if (r.length === row.n && r.every((o, i) => i === 0 || r[i - 1].score >= o.score)) same++; }
    ok(same === C.rows.length, `picker matches each ingredient's list (${same}/${C.rows.length})`);
    // two or three: recipes with more of them come first, and they really use them
    for (const sel of [['chicken', 'white-rice'], ['ground-beef', 'tomatoes', 'onions'], ['eggs', 'milk', 'bread']]) {
      const r = await run(sel);
      ok(r.length > 0, `${sel}: some results`);
      ok(r.every((o, i) => i === 0 || r[i - 1].hits.length >= o.hits.length), `${sel}: more matches rank first`);
      ok(r.every(o => o.hits.every(h => C.rows.find(x => x.id === h).recipes.some(x => x.id === data.recipes[o.r].u.split('/').slice(-2)[0]))), `${sel}: every hit is a real use`);
      console.log(`  ${sel.join(' + ')}: ${r.length} recipes; top: ${r.slice(0, 3).map(o => data.recipes[o.r].n + ' (' + o.hits.length + ')').join(', ')}`);
    }
    // the page itself: ?have= filled the selects and listed results; the filters work
    ok(await pg.locator('#mi-pout .mi-rec').count() > 0, 'picker shows results for ?have=chicken,white-rice');
    ok(/use all of them|uses all of them/.test(await pg.textContent('#mi-pcount')), 'picker says how many use both');
    await pg.click('[data-pf="vegetarian"]');
    ok(/No recipes|None match|Showing/.test(await pg.textContent('#mi-pcount')), 'vegetarian filter answers');
    await pg.selectOption('[data-pick="1"]', ''); await pg.selectOption('[data-pick="2"]', '');
    ok(/Choose an ingredient/.test(await pg.textContent('#mi-pcount')), 'clearing resets the picker');
    await pg.fill('#mi-q', 'zucc');
    ok(await pg.locator('.mi-card:not([hidden])').count() === 1, 'search finds zucchini');
    await pg.goto(BASE + '/meal-prep/ingredients/chicken/', { waitUntil: 'networkidle' });
    const before = await pg.locator('.mi-rec:not([hidden])').count();
    await pg.click('[data-f="quick"]');
    const after = await pg.locator('.mi-rec:not([hidden])').count();
    ok(after < before && after > 0, `quick filter on chicken (${before} -> ${after})`);
    ok(!errs.length, 'no console errors: ' + errs.join(' | '));
    await b.close();
    console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
  })();
} else { console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }
